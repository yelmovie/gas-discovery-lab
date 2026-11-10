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
await p.goto(QA);assert.equal(await p.evaluate(()=>localStorage.length),0,'QA must use a new isolated empty browser context');await p.evaluate(async()=>{const {store}=await import('/src/state.js');store.save.introSeen=true;store.save.settings.music=false;store.save.settings.sfx=false;localStorage.setItem('gas-city-adventure-v1',JSON.stringify(store.save));});await p.reload();
async function press(selector,ms=1200){const r=await p.locator(selector).boundingBox();await p.mouse.move(r.x+r.width/2,r.y+r.height/2);await p.mouse.down();await p.waitForTimeout(ms);await p.mouse.up();await p.waitForTimeout(80);}
async function drag(from,to){const a=await p.locator(from).boundingBox(),z=await p.locator(to).boundingBox();await p.mouse.move(a.x+a.width/2,a.y+a.height/2);await p.mouse.down();await p.mouse.move(z.x+z.width/2,z.y+z.height/2,{steps:12});await p.mouse.up();await p.waitForTimeout(80);}
async function bounds(label){const x=await p.evaluate(()=>({panels:[...document.querySelectorAll('.activity-host .lab-panel')].map(e=>({name:e.className,overflow:e.scrollHeight-e.clientHeight})),dialogs:[...document.querySelectorAll('dialog[open]')].map(e=>{const r=e.getBoundingClientRect();return {top:r.top,bottom:r.bottom,overflow:e.scrollHeight-e.clientHeight};})}));report.push({label,...x});}
for(const stage of STAGES)for(const task of stage.tasks){
 const i=stage.tasks.indexOf(task);await p.goto(`${QA}/#stage/${stage.id}/${i}`);await p.locator('.activity-screen').waitFor();await p.waitForTimeout(300);
 if(stage.id==='flow'){
  const cells=createPipePuzzle(task.pattern),solved=PIPE_PATTERNS[task.pattern].solved;for(let j=0;j<9;j++)for(let k=0;k<(solved[j]-cells[j].rotation+4)%4;k++)await p.locator('.pipe-cell').nth(j).click();
  await p.getByRole('button',{name:'공기 보내기',exact:true}).click();
 }else if(stage.id==='weight'){
  await p.locator('[data-action=level]').click();await p.locator('[data-action=zero]').click();await drag('.scale-jar','.scale-scene');await p.locator('.record-button').click();
  for(let n=0;n<task.minDelta;n++)await p.locator(`[data-action=${task.direction>0?'add':'remove'}]`).click();await p.locator('.record-button').click();
 }else if(stage.id==='climate'){
  await p.locator('.condition-slider').fill(String(task.target));await p.locator('.condition-slider').dispatchEvent('change');await bounds(task.id+'-question');await p.getByRole('button',{name:task.answer,exact:true}).click();
 }else if(stage.id==='delivery'){
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
await p.goto(QA+'/#finale');assert.equal(await p.locator('.begin-repair').isVisible(),true,'All five evidence popups are optional');
await p.getByRole('button',{name:'내 장치 연결하기'}).click();await p.locator('.final-valve').click();await press('.final-pump');await p.getByRole('button',{name:'복구 레버 당기기'}).click();
for(let i=0;i<3;i++){const next=p.locator('.ending-actions button');await next.click();}
await p.locator('.certificate').waitFor();await p.screenshot({path:'.tmp/qa/certificate.png'});await bounds('certificate');
// Reopening a completed task starts a new experiment, without auto-awarding stale drafts.
for(const stage of STAGES){
 const date=await p.evaluate(async id=>(await import('/src/state.js')).store.save.evidence[id][0].date,stage.id);
 await p.goto(`${QA}/#stage/${stage.id}/0`);await p.locator('.activity-screen').waitFor();await p.waitForTimeout(750);
 assert.equal(await p.locator('.discovery-result').count(),0,`${stage.id} must be replayable`);
 assert.equal(await p.evaluate(async id=>(await import('/src/state.js')).store.save.evidence[id][0].date,stage.id),date);
}
// A single supply action keeps testing as pipes rotate, then replay continues to task 2.
await p.goto(QA+'/#stage/flow/0');await p.getByRole('button',{name:'공기 보내기',exact:true}).click();
const liveCells=createPipePuzzle(0),liveSolution=PIPE_PATTERNS[0].solved;
for(let j=0;j<9;j++)for(let k=0;k<(liveSolution[j]-liveCells[j].rotation+4)%4;k++){
 const cell=p.locator('.pipe-cell').nth(j);if(await cell.isDisabled())break;await cell.focus();await p.keyboard.press('Enter');
 if(!await cell.isDisabled())assert.equal(await cell.evaluate(el=>el===document.activeElement),true);
}
await p.locator('.discovery-result').waitFor();await p.locator('.completed-actions .primary').click();assert.equal(new URL(p.url()).hash,'#stage/flow/1');
// Leaving during the fan celebration must not save an abandoned attempt.
await p.goto(QA+'/#stage/flow/0');
const beforeAbort=await p.evaluate(async()=>(await import('/src/state.js')).store.save.evidence.flow[0].date);
for(let j=0;j<9;j++)for(let k=0;k<(liveSolution[j]-liveCells[j].rotation+4)%4;k++)await p.locator('.pipe-cell').nth(j).click();
await p.getByRole('button',{name:'공기 보내기',exact:true}).click();await p.getByRole('button',{name:'홈으로 가기'}).click();await p.waitForTimeout(800);
assert.equal(await p.evaluate(async()=>(await import('/src/state.js')).store.save.evidence.flow[0].date),beforeAbort);
assert.deepEqual(errors,[]);await fs.writeFile('.tmp/qa/journey.json',JSON.stringify({errors,report},null,2));console.log(`PASS: all 20 tasks, ${process.env.QA_SKIP_VIDEO==='1'?'':'videos, '}finale, certificate, replay, keyboard and abort`);await b.close();
