const QA=process.env.QA_URL||'http://127.0.0.1:4176';
import {createRequire} from 'node:module';
const {chromium}=createRequire(import.meta.url)(process.env.PLAYWRIGHT_MODULE||'playwright-core');
import {STAGES} from '../src/data.js';
import {CONCEPT_SECONDS} from '../src/concept-clips.js';
import {createPipePuzzle,PIPE_PATTERNS} from '../src/model.js';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
const b=await chromium.launch({channel:'chrome',headless:true}),isolated=await b.newContext({storageState:{cookies:[],origins:[]},viewport:{width:Number(process.env.QA_WIDTH)||1280,height:Number(process.env.QA_HEIGHT)||800}}),p=await isolated.newPage(),errors=[],report=[];
await fs.mkdir('.tmp/qa',{recursive:true});
p.on('pageerror',e=>errors.push(e.message));
await p.addInitScript(() => {
 const NativeContext=window.AudioContext;window.__gains=[];window.AudioContext=class extends NativeContext {createGain(){const g=super.createGain();window.__gains.push(g);return g;}};
 const NativeAudio=window.Audio; window.__voiceEnded=[];
 window.Audio=class extends NativeAudio { constructor(...args){super(...args);this.addEventListener('play',()=>{this.playbackRate=4;});this.addEventListener('ended',()=>window.__voiceEnded.push(this.currentSrc));} };
});
const verified=[];
async function voice(id){
 const row=p.locator(`[data-voice-id="${id}"]`); await row.waitFor();
 if(await row.getAttribute('data-state')==='playing')await row.locator('button').click();
 await p.evaluate(()=>window.__voiceEnded=[]); await row.locator('button').click();
 if(id==='welcome'){await p.waitForTimeout(650);assert.ok(await p.evaluate(()=>window.__gains[1].gain.value<.02),'BGM ducks under dialogue');}
 await p.waitForFunction(id=>window.__voiceEnded.some(url=>url.endsWith('/'+id+'.mp3')),id,{timeout:30000});
 if(id==='welcome'){await p.waitForTimeout(350);assert.ok(await p.evaluate(()=>window.__gains[1].gain.value>.04),'BGM returns after dialogue');}
 verified.push(id); console.log('Voice ended',id);
}
await p.goto(QA); await voice('welcome');await p.locator('.title-buddy').click();await voice('title-buddy');await p.keyboard.press('Escape');
await p.locator('.start-button').click();for(let i=1;i<=3;i++){await voice('story-'+i);await p.locator('.story-actions button').click();}
await p.evaluate(()=>localStorage.clear());
await p.goto(QA);assert.equal(await p.evaluate(()=>localStorage.length),0,'QA must use a new isolated empty browser context');await p.evaluate(async()=>{const {store}=await import('/src/state.js');store.save.introSeen=true;store.save.settings.music=false;store.save.settings.sfx=true;localStorage.setItem('gas-city-adventure-v1',JSON.stringify(store.save));});await p.reload();
async function press(selector,ms=1200){const r=await p.locator(selector).boundingBox();await p.mouse.move(r.x+r.width/2,r.y+r.height/2);await p.mouse.down();await p.waitForTimeout(ms);await p.mouse.up();await p.waitForTimeout(80);}
async function drag(from,to){const a=await p.locator(from).boundingBox(),z=await p.locator(to).boundingBox();await p.mouse.move(a.x+a.width/2,a.y+a.height/2);await p.mouse.down();await p.mouse.move(z.x+z.width/2,z.y+z.height/2,{steps:12});await p.mouse.up();await p.waitForTimeout(80);}
async function bounds(label){const x=await p.evaluate(()=>({panels:[...document.querySelectorAll('.activity-host .lab-panel')].map(e=>({name:e.className,overflow:e.scrollHeight-e.clientHeight})),dialogs:[...document.querySelectorAll('dialog[open]')].map(e=>{const r=e.getBoundingClientRect();return {top:r.top,bottom:r.bottom,overflow:e.scrollHeight-e.clientHeight};})}));report.push({label,...x});}
for(const stage of STAGES)for(const task of stage.tasks){
 const i=stage.tasks.indexOf(task);
 if(i===0){await p.goto(QA+'/#map');await p.locator('.map-companion').click();await voice('map-next-'+stage.id);await p.goto(QA+'/#stage/'+stage.id);await voice('stage-'+stage.id);}
 await p.goto(`${QA}/#stage/${stage.id}/${i}`);await p.locator('.activity-screen').waitFor();await p.waitForTimeout(300);
 if(stage.id==='flow'){
  const cells=createPipePuzzle(task.pattern),solved=PIPE_PATTERNS[task.pattern].solved;for(let j=0;j<9;j++)for(let k=0;k<(solved[j]-cells[j].rotation+4)%4;k++)await p.locator('.pipe-cell').nth(j).click();
  await p.getByRole('button',{name:'공기 보내기',exact:true}).click();
 }else if(stage.id==='weight'){
  await p.locator('[data-action=level]').click();await p.locator('[data-action=zero]').click();await drag('.scale-jar','.scale-scene');await p.locator('.record-button').click();
  for(let n=0;n<task.minDelta;n++)await p.locator(`[data-action=${task.direction>0?'add':'remove'}]`).click();await p.locator('.record-button').click();
 }else if(stage.id==='climate'){
  await p.locator('.condition-slider').fill(String(task.target));await p.locator('.condition-slider').dispatchEvent('change');await bounds(task.id+'-question');
 await p.locator('.choice').filter({hasNotText:task.answer}).first().click();await voice('retry-climate-'+(i+1));
 await p.getByRole('button',{name:task.answer,exact:true}).click();
 }else if(stage.id==='delivery'){
  if(i===0){
 await p.locator('.gas-card').filter({hasText:'산소'}).click();await p.locator('.reason-slot .choice').filter({hasNotText:task.reason}).first().click();await voice('retry-delivery-gas');
 await p.locator('.gas-card').filter({hasText:'질소'}).click();await p.locator('.reason-slot .choice').filter({hasNotText:task.reason}).first().click();await voice('retry-delivery-reason');
 }
 const names={nitrogen:'질소',oxygen:'산소',carbon:'이산화 탄소'};await p.locator('.gas-card').filter({hasText:names[task.gas]}).click();await p.getByRole('button',{name:task.reason,exact:true}).click();
 }else{
  for(const part of [task.requireSource==='balloon'?'풍선 공급부':'손 펌프',task.requireElbow?'굽은 관':'일자 관','노즐'])await p.locator('.part-card').filter({hasText:part}).click();
  await p.locator('.valve-control').click();if(task.nozzle==='backward')await p.locator('.direction-control').click();await p.locator('.test-device').click();
 }
 await p.locator('.discovery-result').waitFor();await bounds(task.id);
 assert.equal(await p.locator('dialog[open]').count(),0,'Completion must keep the experiment visible');
 assert.equal(await p.evaluate(async id=>Boolean((await import('/src/state.js')).store.save.drafts[id]),task.id),false,'A replay must start with a new draft');
 assert.equal(await p.locator('.discovery-result').evaluate(el=>el===document.activeElement),true);
 await p.keyboard.press('Tab');assert.equal(await p.locator('.completed-actions .primary').evaluate(el=>el===document.activeElement),true);
 if(i===3)await voice('reward-'+stage.id);
 if(i===0){await p.locator('.activity-host').evaluate(async el=>{await Promise.all([...el.querySelectorAll('img')].map(img=>img.decode().catch(()=>{})));});await p.screenshot({path:`.tmp/qa/result-${stage.id}.png`,animations:'disabled'});}
 if(process.env.QA_SKIP_VIDEO!=='1'){
 await p.getByRole('button',{name:'개념 영상 보기',exact:true}).click();await p.locator('.concept-dialog').waitFor();const v=p.locator('.concept-dialog video');await p.waitForFunction(()=>{const v=document.querySelector('video');return v?.readyState>=2&&v.videoWidth===1280;});
 const videoInfo=await v.evaluate(v=>({duration:v.duration,w:v.videoWidth,h:v.videoHeight,src:v.currentSrc}));assert.ok(Math.abs(videoInfo.duration-CONCEPT_SECONDS)<.1,`영상 길이 ${videoInfo.duration}`);await v.evaluate(v=>{v.pause();v.currentTime=4.2;});await p.waitForTimeout(250);assert.equal(await p.locator('[data-science-step].is-current').getAttribute('data-science-step'),'1','4.2초는 두 번째 장면');await bounds(task.id+'-video');
 if(i===0)await p.screenshot({path:`.tmp/qa/video-${stage.id}.png`});
 await p.keyboard.press('Escape');
 }
 const count=await p.evaluate(async id=>(await import('/src/state.js')).store.save.evidence[id].length,stage.id);assert.equal(count,i+1);
 await p.locator('.completed-actions .primary').click();
 assert.equal(new URL(p.url()).hash,i<3?`#stage/${stage.id}/${i+1}`:'#map');console.log('Completed',task.id);
}
// Finale and certificate are checked through the real completion flow.
await p.goto(QA+'/#map');await p.locator('.map-companion').click();await voice('map-next-core');await p.goto(QA+'/#finale');await voice('finale-ready');assert.equal(await p.locator('.begin-repair').isVisible(),true,'All five evidence popups are optional');
await p.getByRole('button',{name:'내 장치 연결하기'}).click();await p.locator('.final-valve').click();await press('.final-pump');await voice('finale-charged');await p.getByRole('button',{name:'복구 레버 당기기'}).click();
for(let i=0;i<3;i++){await voice('ending-'+(i+1));const next=p.locator('.ending-actions button');await next.click();}
await p.locator('.certificate').waitFor();await p.screenshot({path:'.tmp/qa/certificate.png'});await bounds('certificate');
await p.goto(QA+'/#map');await p.locator('.map-companion').click();await voice('map-done');
assert.equal(new Set(verified).size,33);
await p.goto(QA+'/#stage/flow');
const stageVoice=p.locator('[data-voice-id="stage-flow"]');
if(await stageVoice.getAttribute('data-state')!=='playing')await stageVoice.locator('button').click();
assert.equal(await stageVoice.getAttribute('data-state'),'playing');await p.locator('.sound-button').click();
assert.equal(await p.evaluate(async()=> (await import('/src/game-voices.js')).narration.state.status),'idle');
await stageVoice.locator('button').click();assert.equal(await stageVoice.getAttribute('data-state'),'muted');
await p.locator('.sound-button').click();await stageVoice.locator('button').click();assert.equal(await stageVoice.getAttribute('data-state'),'playing');
await p.locator('.home-button').click();assert.equal(await p.evaluate(async()=> (await import('/src/game-voices.js')).narration.state.status),'idle');
await fs.writeFile('.tmp/qa/voice-screen-report.json',JSON.stringify({verified,errors,playbackRate:4,humanListening:false},null,2));
assert.equal(errors.length,0);await b.close();
