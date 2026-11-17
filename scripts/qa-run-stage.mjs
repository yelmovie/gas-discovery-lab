// 「높은 산의 과자 봉지」 3D 산길을 키보드와 화면 버튼으로 끝까지 해 보고, 기록·대체 화면·이어 하기를 확인한다.
const QA=process.env.QA_URL||'http://127.0.0.1:4176';
import {createRequire} from 'node:module';
import fs from 'node:fs/promises';
import assert from 'node:assert/strict';
import {STAGES} from '../src/data.js';
const {chromium}=createRequire(import.meta.url)(process.env.PLAYWRIGHT_MODULE||'playwright-core');
const width=Number(process.env.QA_WIDTH)||1280,height=Number(process.env.QA_HEIGHT)||800,out=`.tmp/qa/run-stage/${width}x${height}`;await fs.mkdir(out,{recursive:true});
const climate=STAGES.find(s=>s.id==='climate'),task=climate.tasks[3],KEY='gas-city-adventure-v1';
const seed=Object.fromEntries(STAGES.map(s=>[s.id,['flow','weight'].includes(s.id)?s.tasks.map(t=>({taskId:t.id,summary:'달리기 검증 준비',details:{},date:'before'})):s.id==='climate'?s.tasks.slice(0,3).map(t=>({taskId:t.id,summary:'달리기 검증 준비',details:{},date:'before'})):[]]));
const b=await chromium.launch({channel:'chrome',headless:true,args:['--disable-crash-reporter','--enable-unsafe-swiftshader']});
const errors=[];
async function context(options={}){
 const c=await b.newContext({viewport:{width,height},storageState:{cookies:[],origins:[]},...options}),p=await c.newPage();
 p.on('pageerror',e=>errors.push(e.message));p.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
 await c.addInitScript(([key,evidence,settings])=>{if(!localStorage.getItem(key))localStorage.setItem(key,JSON.stringify({version:1,introSeen:true,evidence,drafts:{},settings:{music:false,sfx:false,...settings}}));},[KEY,seed,options.settings||{}]);
 return {c,p};
}
const open=async p=>{await p.goto(`${QA}/#stage/climate/3`);await p.locator('.activity-screen').waitFor();};
const saved=p=>p.evaluate(key=>JSON.parse(localStorage.getItem(key)),KEY);
const phase=(p,name)=>p.locator(`.run-stage[data-phase=${name}]`).waitFor();
const shot=(p,name)=>p.screenshot({path:`${out}/${name}.png`});
const expected=[{condition:1,ratio:1},{condition:0,ratio:1.35}];
// 겹침 화면: 조작 버튼과 안내가 무대 밖으로 나가거나 서로 겹치지 않고, 글자가 14px 이상인지 본다.
async function layout(p,label){
 const issues=await p.evaluate(()=>{
  const stage=document.querySelector('.run-stage'),bounds=stage.getBoundingClientRect(),found=[];
  const shown=el=>{const r=el.getBoundingClientRect(),style=getComputedStyle(el);return r.width>0&&r.height>0&&style.display!=='none'&&style.visibility!=='hidden';};
  const boxes=[...stage.querySelectorAll('.run-pad button,.run-actions button,.run-classic,.run-place,.climate-constants,.run-bag,.run-speech,.run-panel')].filter(shown).map(el=>({name:el.className||el.dataset.runDir,r:el.getBoundingClientRect(),group:el.closest('.run-pad,.run-actions,.run-top')?.className||el.className}));
  for(const {name,r} of boxes)if(r.left<bounds.left-1||r.right>bounds.right+1||r.top<bounds.top-1||r.bottom>bounds.bottom+1)found.push(`${name} leaves the stage`);
  for(let i=0;i<boxes.length;i++)for(let j=i+1;j<boxes.length;j++){const a=boxes[i],b=boxes[j];if(a.group===b.group)continue;if(a.r.left<b.r.right-1&&b.r.left<a.r.right-1&&a.r.top<b.r.bottom-1&&b.r.top<a.r.bottom-1)found.push(`${a.name} overlaps ${b.name}`);}
  for(const el of stage.querySelectorAll('button,p,h2,h3,span,strong,figcaption'))if(shown(el)&&el.textContent.trim()&&parseFloat(getComputedStyle(el).fontSize)<14)found.push(`small text: ${el.textContent.trim().slice(0,12)}`);
  for(const el of stage.querySelectorAll('.run-panel'))if(shown(el)&&el.scrollHeight>el.clientHeight+2)found.push(`${el.className} scrolls`);
  return found;
 });
 assert.deepEqual(issues,[],`${label} layout at ${width}×${height}`);
}
try{
 // 1. 키보드로 끝까지
 {
  const {c,p}=await context();await open(p);await phase(p,'predict');
  assert.equal(await p.locator('.condition-slider').count(),0,'the 3D trail opens first');
  assert.equal(await p.locator('.run-top .climate-constants').textContent(),'공기 양·온도 일정');
  await p.waitForTimeout(600);await shot(p,'1-predict');await layout(p,'predict');
  await p.getByRole('button',{name:'그대로예요',exact:true}).click();await phase(p,'run');
  assert.deepEqual((await saved(p)).drafts[task.id],{condition:1,records:[expected[0]],prediction:'same'});
  assert.equal(await p.locator('.run-record').isDisabled(),true,'recording needs the summit station');
  assert.equal(await p.locator('.run-place').textContent(),'산 아래 · 보통 압력');
  await p.waitForTimeout(400);await shot(p,'2-base');await layout(p,'run');
  const started=Date.now();await p.keyboard.down('ArrowUp');
  for(let i=0;i<80&&await p.locator('.run-record').isDisabled();i++){await p.keyboard.press('Space');await p.waitForTimeout(260);if(i===8)await shot(p,'3-trail');if(i===16)await shot(p,'4-bridge');}
  await p.keyboard.up('ArrowUp');const seconds=(Date.now()-started)/1000;
  assert.equal(await p.locator('.run-record').isDisabled(),false,'the keyboard reaches the summit');
  assert.ok(seconds<30,`base to summit took ${seconds}s`);
  assert.equal(await p.locator('.run-place').textContent(),'산꼭대기 · 낮은 압력');
  assert.equal((await saved(p)).drafts[task.id].records.length,1,'nothing is recorded by walking');
  await p.waitForTimeout(500);await shot(p,'5-summit');await layout(p,'summit');
  await p.keyboard.press('Enter');await phase(p,'compare');
  assert.deepEqual((await saved(p)).drafts[task.id],{condition:0,records:expected,prediction:'same'});
  assert.match(await p.locator('.run-prediction-note').textContent(),/기록과 달라요/);
  assert.equal(await p.locator('.run-compare .choice').count(),task.choices.length);
  await p.waitForTimeout(300);await shot(p,'6-compare');await layout(p,'compare');
  await p.locator('.run-compare .choice').filter({hasNotText:task.answer}).first().click();
  assert.equal(await p.locator('.discovery-result').count(),0,'a wrong answer does not complete');
  // 6b. 새로고침 뒤 비교 단계에서 이어 한다.
  await p.reload();await p.locator('.activity-screen').waitFor();await phase(p,'compare');
  assert.equal(await p.locator('.run-compare .choice').count(),task.choices.length);
  await p.getByRole('button',{name:task.answer,exact:true}).click();await p.locator('.discovery-result').waitFor();
  const save=await saved(p),record=save.evidence.climate.find(e=>e.taskId===task.id);
  assert.equal(record.summary,task.why);assert.equal(record.details.mode,'pressure');assert.deepEqual(record.details.records,expected);assert.equal(record.details.transfer,task.answer);
  assert.equal(save.drafts[task.id],undefined,'the draft is cleared on completion');
  await p.waitForTimeout(400);await shot(p,'7-complete');await layout(p,'complete');
  console.log(`keyboard run: ${seconds.toFixed(1)}s base to summit`);await c.close();
 }
 // 2. 화면 버튼(터치)으로 끝까지, 떨어지면 복귀
 {
  const {c,p}=await context({hasTouch:true});await open(p);await phase(p,'predict');
  await p.getByRole('button',{name:'더 부풀어요',exact:true}).tap();await phase(p,'run');
  const cdp=await c.newCDPSession(p),center=async selector=>{const r=await p.locator(selector).boundingBox();return {x:Math.round(r.x+r.width/2),y:Math.round(r.y+r.height/2)};};
  // touchEnd에는 떼는 손가락을 넘긴다(빈 목록은 전부 뗌).
  const touch=(type,points)=>cdp.send('Input.dispatchTouchEvent',{type,touchPoints:points});
  for(const selector of ['.run-pad button','.run-jump','.run-record']){const boxes=await p.locator(selector).evaluateAll(list=>list.map(el=>{const r=el.getBoundingClientRect();return [r.width,r.height,el.getAttribute('aria-label')];}));for(const [w,h,label] of boxes){assert.ok(w>=52&&h>=52,`${selector} is ${w}×${h}`);assert.ok(label,`${selector} needs a label`);}}
  const up={...await center('[data-run-dir=up]'),id:1},right={...await center('[data-run-dir=right]'),id:1},jump={...await center('.run-jump'),id:2};
  const climb=async until=>{await touch('touchStart',[up]);for(let i=0;i<80&&!await until();i++){await touch('touchStart',[up,jump]);await p.waitForTimeout(60);await touch('touchEnd',[jump]);await p.waitForTimeout(200);}await touch('touchEnd',[]);};
  // 통나무 다리에서 옆으로 걸어 떨어지면 쉼터로 돌아온다.
  // 돌계단을 걸어 올라 쉼터 턱에서 한 번 뛰고, 다리 가운데까지 걷는다.
  await touch('touchStart',[up]);await p.waitForTimeout(2300);await touch('touchStart',[up,jump]);await p.waitForTimeout(60);await touch('touchEnd',[jump]);await p.waitForTimeout(1500);await touch('touchEnd',[]);
  assert.equal(await p.locator('.run-stage').getAttribute('data-checkpoint'),'1','the low steps are walkable and the ledge needs one jump');
  await touch('touchStart',[right]);await p.waitForFunction(()=>document.querySelector('.run-stage').dataset.falls==='1',null,{timeout:8000});await touch('touchEnd',[]);
  assert.equal(await p.locator('.run-stage').getAttribute('data-checkpoint'),'1');
  assert.match(await p.locator('.run-speech').textContent(),/다시 걸어요/);await shot(p,'8-respawn');
  await p.waitForTimeout(500);
  await climb(async()=>!await p.locator('.run-record').isDisabled());
  assert.equal(await p.locator('.run-record').isDisabled(),false,'the on-screen buttons reach the summit');
  await p.locator('.run-record').tap();await phase(p,'compare');
  assert.match(await p.locator('.run-prediction-note').textContent(),/기록과 같아요/);
  await p.getByRole('button',{name:task.answer,exact:true}).tap();await p.locator('.discovery-result').waitFor();
  assert.deepEqual((await saved(p)).evidence.climate.find(e=>e.taskId===task.id).details.records,expected);
  console.log('touch run: pad, jump, respawn and record');await c.close();
 }
 // 3. 「기존 방식으로 하기」와 자동재생은 기존 2D 화면으로 진행한다.
 {
  const {c,p}=await context();await open(p);await phase(p,'predict');
  await p.getByRole('button',{name:'줄어들어요',exact:true}).click();await phase(p,'run');
  await p.getByRole('button',{name:'기존 방식으로 하기',exact:true}).click();await p.locator('.condition-slider').waitFor();
  assert.equal(await p.locator('.run-stage').count(),0);assert.equal(await p.locator('canvas').count(),0,'the 3D canvas is released');
  await p.locator('.condition-slider').fill('0');await p.locator('.condition-slider').dispatchEvent('change');
  await shot(p,'9-classic');
  await p.getByRole('button',{name:task.answer,exact:true}).click();await p.locator('.discovery-result').waitFor();
  assert.deepEqual((await saved(p)).evidence.climate.find(e=>e.taskId===task.id).details.records,expected);
  await open(p);await p.reload();await p.locator('.activity-screen').waitFor();await phase(p,'predict');
  await p.getByRole('combobox',{name:'자동재생 속도'}).selectOption('2');await p.locator('.autoplay-button').click();
  await p.locator('.condition-slider').waitFor();
  await p.waitForFunction(()=>['finished','waiting'].includes(document.querySelector('.activity-screen')?.dataset.playback));
  assert.equal(await p.locator('.run-stage').count(),0);assert.equal(await p.locator('.discovery-result').count(),0,'observing cannot answer');
  assert.equal(await p.locator('.choice').count(),task.choices.length);
  console.log('classic fallback and autoplay');await c.close();
 }
 // 4. 움직임 줄이기에서는 처음부터 기존 화면이다.
 for(const options of [{settings:{reduceMotion:true}},{reducedMotion:'reduce'}]){
  const {c,p}=await context(options);await open(p);await p.locator('.condition-slider').waitFor();
  assert.equal(await p.locator('.run-stage').count(),0);await c.close();
 }
 console.log('reduced motion opens the classic screen');
 // 5. 교사 시연: 방향키는 단계 이동, 달리기는 WASD.
 {
  const {c,p}=await context();await p.goto(QA);await p.evaluate(async()=>{(await import('/src/state.js')).setTeacherPreview(true);});
  await p.evaluate(()=>{location.hash='#stage/climate/3';});await phase(p,'predict');
  await p.getByRole('button',{name:'더 부풀어요',exact:true}).click();await phase(p,'run');
  await p.keyboard.down('KeyW');
  for(let i=0;i<80&&await p.locator('.run-stage').getAttribute('data-checkpoint')==='0';i++){await p.keyboard.press('Space');await p.waitForTimeout(260);}
  await p.keyboard.up('KeyW');assert.equal(await p.locator('.run-stage').getAttribute('data-checkpoint'),'1','WASD walks in teacher mode');
  await p.keyboard.press('ArrowRight');await p.waitForFunction(()=>location.hash==='#stage/delivery');
  assert.equal(await p.evaluate(key=>JSON.parse(localStorage.getItem(key)).evidence.climate.length,KEY),3,'teacher preview leaves the student record alone');
  console.log('teacher keys still step through');await c.close();
 }
 assert.deepEqual(errors,[]);
 console.log(`PASS: 3D mountain run at ${width}×${height}`);
}finally{await b.close();}
