// 새 저장 상태에서 UI로 얻은 학생 기록만 사용한다. 교사 해금·학습 증거 주입은 하지 않는다.
import {createRequire} from 'node:module';
import fs from 'node:fs/promises';
import assert from 'node:assert/strict';
import {STAGES} from '../src/data.js';
import {createPipePuzzle,PIPE_PATTERNS} from '../src/model.js';
const {chromium}=createRequire(import.meta.url)(process.env.PLAYWRIGHT_MODULE||'playwright-core');
const URL=process.env.QA_URL||'http://127.0.0.1:4176',OUT='.tmp/review-fix-20261123',KEY='gas-city-adventure-v1';
await fs.mkdir(OUT,{recursive:true});
const browser=await chromium.launch({channel:'chrome',headless:true,args:['--enable-unsafe-swiftshader']});
const context=await browser.newContext({viewport:{width:1024,height:768},hasTouch:true,locale:'ko-KR',storageState:process.env.QA_RESUME||{cookies:[],origins:[]}});
const page=await context.newPage();await page.clock.setFixedTime(new Date('2026-11-23T05:00:00.000Z'));const cdp=await context.newCDPSession(page),errors=[],log=[];
page.on('pageerror',e=>errors.push(e.message));
const mark=(label,details={})=>{log.push({label,...details});console.log(label,JSON.stringify(details));};
const save=()=>page.evaluate(key=>JSON.parse(localStorage.getItem(key)),KEY);
const checkpoint=async name=>{await context.storageState({path:`${OUT}/student-${name}.json`});};
const shot=async name=>{await page.screenshot({path:`${OUT}/${name}.png`});};
const center=async loc=>{await loc.waitFor({state:'visible'});const r=await loc.boundingBox();assert.ok(r);return {x:r.x+r.width/2,y:r.y+r.height/2};};
async function tap(loc){await loc.waitFor({state:'visible'});await loc.evaluate(el=>{const r=el.getBoundingClientRect();if(!el.contains(document.elementFromPoint(r.x+r.width/2,r.y+r.height/2)))el.scrollIntoView({block:'center',inline:'center',behavior:'instant'});});assert.equal(await loc.isEnabled(),true);await page.waitForTimeout(120);let hit=false;for(let i=0;i<30;i++){hit=await loc.evaluate(el=>{const r=el.getBoundingClientRect();return el.contains(document.elementFromPoint(r.x+r.width/2,r.y+r.height/2));});if(hit)break;await page.waitForTimeout(80);}assert.equal(hit,true,'the physical touch point must hit its target');const p=await center(loc);await page.touchscreen.tap(p.x,p.y);await page.waitForTimeout(100);}
const button=name=>page.getByRole('button',{name,exact:true});
async function hold(loc,ms){const p=await center(loc);await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{...p,id:1}]});await page.waitForTimeout(ms);await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});await page.waitForTimeout(100);}
async function drag(from,to){const a=await center(from),b=await center(to);await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{...a,id:1}]});for(let i=1;i<=15;i++){await cdp.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:a.x+(b.x-a.x)*i/15,y:a.y+(b.y-a.y)*i/15,id:1}]});}await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});await page.waitForTimeout(130);}
const rgb=s=>s.match(/[\d.]+/g).map(Number);
function contrast(a,b){const lum=c=>c.slice(0,3).map(v=>v/255).map(v=>v<=.04045?v/12.92:((v+.055)/1.055)**2.4).reduce((a,v,i)=>a+v*[.2126,.7152,.0722][i],0);const x=lum(a),y=lum(b);return (Math.max(x,y)+.05)/(Math.min(x,y)+.05);}
async function skipMatrix(label){for(const [width,height] of [[1280,800],[1024,768],[1024,600]]){await page.setViewportSize({width,height});const colors=await page.locator('.film-skip').evaluate(el=>({fg:getComputedStyle(el).color,bg:getComputedStyle(el).backgroundColor}));const ratio=contrast(rgb(colors.fg),rgb(colors.bg));assert.ok(ratio>=4.5);assert.equal(rgb(colors.bg)[3]??1,1);await shot(`${label}-${width}x${height}`);mark(`${label} contrast`,{width,height,...colors,ratio});}await page.setViewportSize({width:1024,height:768});}
async function arrive(stage){await page.locator('.map-next').waitFor();await page.waitForTimeout(400);await tap(page.locator('.map-next'));await page.waitForURL(u=>u.hash===`#stage/${stage.id}`,{timeout:20000});await tap(page.locator('.stage-start .button').first());await page.locator('.activity-screen').waitFor();}
async function mapReward(stage){await page.locator('.map-canvas').waitFor();const attack=page.getByRole('button',{name:new RegExp(stage.name+'.*악당 공격')});await attack.waitFor({timeout:15000});for(let i=0;i<3;i++){await tap(attack);await page.waitForTimeout(470);}await page.locator('.rc-take.is-ready').waitFor({timeout:15000});await tap(page.locator('.rc-take'));if(stage.id==='engineering'){await button('멋져요!').waitFor();await page.waitForFunction(()=>document.activeElement?.textContent==='멋져요!');await tap(button('멋져요!'));}await page.locator('#app[inert]').waitFor({state:'detached'});await page.waitForTimeout(400);mark('map reward closed',{stage:stage.id});}
async function mountain(){
 await page.locator('.run-stage[data-phase=predict]').waitFor();assert.equal(await page.locator('.climate-constants').textContent(),'공기 양·온도 일정');await tap(button('줄어들어요'));
 assert.equal((await save()).drafts['climate-4'].records.length,1);
 await page.keyboard.down('ArrowUp');await page.waitForFunction(()=>/점프 버튼/.test(document.querySelector('.run-speech')?.textContent||''),null,{timeout:10000});await page.keyboard.press('Space');await page.waitForTimeout(850);await page.keyboard.up('ArrowUp');
 assert.equal((await save()).drafts['climate-4'].checkpoint,1);await checkpoint('mountain-middle');await page.reload();await page.locator('.run-stage[data-checkpoint="1"]').waitFor();assert.equal((await save()).drafts['climate-4'].records.length,1);await shot('mountain-middle-restored');mark('mountain checkpoint 1 restored');
 await page.keyboard.down('ArrowUp');await page.waitForTimeout(1100);await page.keyboard.up('ArrowUp');await page.keyboard.down('ArrowRight');await page.waitForFunction(()=>document.querySelector('.run-stage').dataset.falls==='1',null,{timeout:8000});await page.keyboard.up('ArrowRight');assert.equal((await save()).drafts['climate-4'].checkpoint,1);assert.equal((await save()).evidence.climate.length,3);await shot('mountain-fall');mark('fall returned to checkpoint without evidence');
 await page.reload();await page.locator('.run-stage[data-checkpoint="1"]').waitFor();await page.keyboard.down('ArrowUp');
 for(let i=0;i<90&&await page.locator('.run-record').isDisabled();i++){await page.keyboard.press('Space');await page.waitForTimeout(240);}await page.keyboard.up('ArrowUp');assert.equal(await page.locator('.run-record').isDisabled(),false);assert.equal((await save()).drafts['climate-4'].checkpoint,3);
 await checkpoint('mountain-summit');await page.reload();await page.locator('.run-stage[data-checkpoint="3"]').waitFor();assert.equal(await page.locator('.run-record').isDisabled(),false);assert.equal((await save()).drafts['climate-4'].records.length,1);assert.equal((await save()).evidence.climate.length,3);await shot('mountain-summit-restored');mark('mountain summit restored before record, no award');
 await tap(page.locator('.run-record'));await tap(button(STAGES[2].tasks[3].choices[1]));assert.equal(await page.locator('.discovery-result').count(),0);await checkpoint('mountain-compare');await page.reload();await page.locator('.run-stage[data-phase=compare]').waitFor();assert.equal((await save()).drafts['climate-4'].misses,1);await tap(button(STAGES[2].tasks[3].answer));
}
async function solve(stage,task,index){
 if(stage.id==='flow'){
  const cells=createPipePuzzle(task.pattern),solved=PIPE_PATTERNS[task.pattern].solved;
  for(let j=0;j<9;j++)for(let k=0;k<(solved[j]-cells[j].rotation+4)%4;k++){const cell=page.locator('.pipe-cell').nth(j);if(await cell.isDisabled())break;await tap(cell);}
 }else if(stage.id==='weight'){
  if(!task.prepared){await tap(page.locator('[data-action=level]'));await tap(page.locator('[data-action=zero]'));await drag(page.locator('.scale-jar'),page.locator('.scale-scene'));}
  if(index===0){await tap(page.locator('.record-button'));assert.equal(await page.locator('.discovery-result').count(),0);}
  for(let n=0;n<task.minDelta;n++)await tap(page.locator(`[data-action=${task.direction>0?'add':'remove'}]`));await tap(page.locator('.record-button'));
 }else if(stage.id==='climate'){
  if(task.runStage){await checkpoint('before-mountain');await mountain();}
  else{const scene=page.locator('.climate-scene');const a=await center(scene);await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{...a,id:1}]});const b=task.mode==='temperature'?{x:a.x+(task.target===2?120:-120),y:a.y}:{x:a.x,y:a.y+85};await cdp.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{...b,id:1}]});await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});await button(task.answer).waitFor();if(index===0){await tap(button(task.choices.find(x=>x!==task.answer)));assert.equal(await page.locator('.discovery-result').count(),0);}await tap(button(task.answer));}
 }else if(stage.id==='delivery'){
  if(index===0){await tap(page.locator('.gas-card[data-gas=oxygen]'));await tap(button(task.reason));assert.equal(await page.locator('.discovery-result').count(),0);}
  if(index===3)await drag(page.locator(`[data-gas=${task.gas}]`),page.locator('.facility-request'));else await tap(page.locator(`.gas-card[data-gas=${task.gas}]`));
  if(index===0){await tap(page.locator('.reason-slot .choice').filter({hasNotText:task.reason}).first());assert.equal(await page.locator('.discovery-result').count(),0);}
  await tap(button(task.reason));
 }else{
  const part=id=>page.locator(`.part-card[data-part=${id}]`);
  await tap(part(index===0||index===3?'balloon':'pump'));await tap(part(index===0?'cap':'straight'));await tap(part('nozzle'));await tap(page.locator('.valve-control'));
  if(index<=2){assert.equal(await page.locator('.discovery-result').count(),0);assert.equal(await page.locator('.valve-control .control-state').textContent(),'밸브 열림');assert.equal(await page.locator('.assembly-scene.air-running,.assembly-scene.car-air-running').count(),0);await shot(`engineering-${index+1}-failed`);}
  if(index===0)await tap(part('elbow'));
  if(index===1)await tap(part('elbow'));
  if(index===2){await tap(part('balloon'));assert.equal(await page.locator('.discovery-result').count(),0);await tap(page.locator('.direction-control'));}
 }
 await page.locator('.discovery-result').waitFor();const s=await save();assert.equal(s.settings.adminUnlockAll,false);assert.equal(s.evidence[stage.id].filter(e=>e.taskId===task.id).length,1);await shot(task.id+'-complete');mark('student completed '+task.id,{count:s.evidence[stage.id].length});await checkpoint('latest');
}
async function optionalMissions(){
 await tap(button('설정'));await tap(button('공기 장치 미션'));await page.locator('.play-mission').waitFor();const cell=n=>page.locator(`.play-mission [data-cell="${n}"]`),piece=n=>page.locator(`.play-mission [data-piece="${n}"]`),pump=()=>page.locator('.play-mission [data-pump]');
 const place=async(p,c)=>{await drag(piece(p),cell(c));},rotate=async(c,n)=>{for(let i=0;i<n;i++)await tap(cell(c));};
 await hold(pump(),200);assert.equal(await page.locator('.pm-finished').count(),0);
 for(const [p,c] of [[0,3],[2,4],[3,5]])await place(p,c);await hold(pump(),440);let state=await page.evaluate(()=>JSON.parse(localStorage.getItem('science-play-15-v1')));assert.equal(state.air[0],2);
 await tap(page.locator('.play-mission [data-close]'));await tap(button('설정'));await tap(button('공기 장치 미션'));assert.equal(await page.locator('.pm-air-meter').getAttribute('aria-label'),'공기 2 / 3');await hold(pump(),800);await tap(page.locator('.play-mission [data-next]'));
 for(const [p,c] of [[1,1],[0,2]])await place(p,c);for(const [c,n] of [[3,3],[0,1],[1,1],[5,2]])await rotate(c,n);await hold(pump(),1500);await tap(page.locator('.play-mission [data-next]'));
 for(const [p,c] of [[0,7],[2,8]])await place(p,c);for(const [c,n] of [[3,2],[6,2],[5,2]])await rotate(c,n);await hold(pump(),300);assert.equal(await page.locator('.pm-air-meter').getAttribute('aria-label'),'공기 0 / 5');await tap(page.locator('.play-mission [data-vent]'));await hold(pump(),1900);await page.locator('.pm-finished').waitFor();state=await page.evaluate(()=>JSON.parse(localStorage.getItem('science-play-15-v1')));assert.deepEqual(state.won,[0,1,2]);await shot('optional-three-complete');await tap(page.locator('.play-mission [data-close]'));mark('student optional three completed',state.won);
}
try{
 await page.goto(URL);await page.locator('.title-buttons').waitFor();
 if(!process.env.QA_RESUME){assert.equal(await page.evaluate(()=>localStorage.length),0);await tap(button('전체 소리 끄기'));await tap(button('시작하기'));await page.locator('.story-film video').waitFor();await skipMatrix('intro-skip');await page.locator('.map-canvas').waitFor({timeout:40000});mark('intro ended in muted fresh student context');}
 else{await page.goto(URL+'/#map');mark('resume from UI-earned storage',process.env.QA_RESUME);}
 for(const stage of STAGES){const initial=await save();if(initial.evidence[stage.id].length===4)continue;await arrive(stage);for(let i=initial.evidence[stage.id].length;i<4;i++){await page.locator('.activity-screen').waitFor();await page.waitForTimeout(280);await solve(stage,stage.tasks[i],i);await tap(page.locator('.completed-actions .primary'));}await mapReward(stage);await checkpoint(stage.id);}
 await checkpoint('all-tasks');await optionalMissions();await page.clock.setFixedTime(new Date('2026-11-24T05:00:00.000Z'));await tap(page.locator('.map-next'));await page.locator('.begin-repair').waitFor({timeout:20000});await tap(button('내 장치 연결하기'));await hold(page.locator('.final-pump'),500);assert.equal(await page.locator('.repair-lever').count(),0);await hold(page.locator('.final-pump'),1500);await page.locator('.repair-lever').waitFor();await tap(page.locator('.repair-lever'));await page.locator('.story-film video').waitFor();await skipMatrix('ending-skip');await page.locator('.cert-paper').waitFor({timeout:40000});assert.equal((await save()).finaleCompletedAt,'2026-11-24T05:00:00.000Z');assert.match(await page.locator('.cert-date').textContent(),/2026. 11. 24./);await checkpoint('final');await shot('certificate-new-date');mark('first core completion uses next-day core date');
 assert.deepEqual(errors,[]);mark('PASS journey',{browser:browser.version(),viewport:'1024×768',errors});
}catch(error){await checkpoint('failure').catch(()=>{});await shot('failure').catch(()=>{});mark('FAIL',{message:error.message,url:page.url(),body:(await page.locator('body').innerText().catch(()=>''))});throw error;}
finally{await fs.writeFile(OUT+'/student-journey.json',JSON.stringify({errors,log},null,2));await browser.close();}
