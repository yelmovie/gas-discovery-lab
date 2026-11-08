import {createRequire} from 'node:module';
import fs from 'node:fs/promises';
import assert from 'node:assert/strict';
import {STAGES} from '../src/data.js';
import {createPipePuzzle} from '../src/model.js';
const {chromium}=createRequire(import.meta.url)(process.env.PLAYWRIGHT_MODULE||'playwright-core');
const root=process.cwd(),out='.tmp/qa/playback';await fs.mkdir(out,{recursive:true});
const b=await chromium.launch({channel:'chrome',headless:true,args:[`--disk-cache-dir=${root}/.tmp/browser/playback-cache`,'--disable-crash-reporter']});
const c=await b.newContext({viewport:{width:1024,height:600},storageState:{cookies:[],origins:[]},hasTouch:true,reducedMotion:'reduce'}),p=await c.newPage(),errors=[],report=[];
p.on('pageerror',e=>errors.push(e.message));
await c.addInitScript(evidence=>{if(!localStorage.getItem('gas-city-adventure-v1'))localStorage.setItem('gas-city-adventure-v1',JSON.stringify({version:1,introSeen:true,evidence,drafts:{},settings:{music:false,sfx:false}}));},Object.fromEntries(STAGES.map(s=>[s.id,s.tasks.map(t=>({taskId:t.id,summary:'격리된 자동재생 검증',details:{},date:'before'}))])));
async function open(stage,i){await p.goto(`http://127.0.0.1:4176/#stage/${stage}/${i}`);await p.locator('.activity-screen').waitFor();}
async function play(){await p.getByRole('combobox',{name:'자동재생 속도'}).selectOption('2');await p.locator('.autoplay-button').tap();}
async function settled(){await p.waitForFunction(()=>['finished','waiting','error'].includes(document.querySelector('.activity-screen')?.dataset.playback));assert.notEqual(await p.locator('.activity-screen').getAttribute('data-playback'),'error');}
async function evidence(task){return p.evaluate(async t=>(await import('/src/state.js')).store.save.evidence[t.id.split('-')[0]].find(x=>x.taskId===t.id),task);}
async function draft(task){return p.evaluate(async id=>(await import('/src/state.js')).store.save.drafts[id],task.id);}
try{
for(const s of STAGES)for(let i=0;i<s.tasks.length;i++){
 const t=s.tasks[i];await open(s.id,i);const before=await draft(t);
 if(s.id==='engineering'){
  await play();await settled();assert.equal(await p.locator('.discovery-result').count(),0);assert.equal((await draft(t)).design.source,null,'Automatic replay must not choose parts');
  for(const part of [t.requireSource==='balloon'?'balloon':'pump',t.requireElbow?'elbow':'straight','nozzle'])await p.locator(`[data-part=${part}]`).tap();
  if(t.nozzle==='backward'){
   await play();await settled();assert.equal((await draft(t)).design.direction,'forward','Replay cannot choose the correct nozzle direction');assert.equal(await p.locator('.discovery-result').count(),0);
   await p.locator('.direction-control').tap();
  }else await play();
  await p.locator('.discovery-result').waitFor();
 }else{
  await play();
  if(s.id==='weight'){
   await p.locator('.discovery-result').waitFor();const e=await evidence(t);assert.equal(e.details.before.valid,true);assert.equal(e.details.after.valid,true);assert.notEqual(e.details.before.air,e.details.after.air);
  }else{
   await settled();assert.equal(await p.locator('.discovery-result').count(),0);assert.equal((await evidence(t)).date,'before','Observing cannot award a correct answer');
   const after=await draft(t);
   if(s.id==='flow')assert.deepEqual(after.cells.map(x=>x.rotation),(before?.cells||createPipePuzzle(t.pattern)).map(x=>x.rotation),'Replay cannot solve the pipe puzzle');
   if(s.id==='climate'){
    assert.equal(await p.locator('.choice').count(),t.choices.length);assert.equal(await p.locator('.choice[aria-pressed=true]').count(),0);
    assert.ok(after.records.some(x=>x.condition===t.target));await p.getByRole('button',{name:t.answer,exact:true}).tap();await p.locator('.discovery-result').waitFor();
   }
   if(s.id==='delivery'){
    assert.equal(after.selected,null);assert.equal(after.reason,null);assert.deepEqual(after.read,[]);assert.equal(await p.locator('.is-observing').count(),0);
    await p.locator(`.gas-card[data-gas=${t.gas}]`).tap();await p.getByRole('button',{name:t.reason,exact:true}).tap();await p.locator('.discovery-result').waitFor();
   }
  }
 }
 report.push({task:t.id,passed:true});console.log('Replay checked',t.id);
}
// A pause keeps the exact apparatus state; a rate change applies on resume.
await open('climate',0);await p.getByRole('combobox',{name:'자동재생 속도'}).selectOption('0.5');await p.locator('.autoplay-button').tap();await p.waitForTimeout(200);await p.locator('.autoplay-button').tap();
assert.equal(await p.locator('.activity-screen').getAttribute('data-playback'),'paused');const held=await p.locator('.condition-slider').inputValue();await p.waitForTimeout(1000);assert.equal(await p.locator('.condition-slider').inputValue(),held);
await p.getByRole('combobox',{name:'자동재생 속도'}).selectOption('2');await p.locator('.autoplay-button').tap();await settled();assert.equal(await p.locator('.discovery-result').count(),0);
// Trusted user input must discard a queued observation before selecting a gas.
await open('delivery',0);await play();await p.waitForTimeout(100);await p.locator('.gas-card[data-gas=oxygen]').tap();assert.equal(await p.locator('.activity-screen').getAttribute('data-playback'),'idle');await p.waitForTimeout(1200);assert.equal((await draft(STAGES[3].tasks[0])).selected,'oxygen');
// Leaving an experiment stops its queue, including pending saves and awards.
await open('weight',0);await p.getByRole('combobox',{name:'자동재생 속도'}).selectOption('0.5');await p.locator('.autoplay-button').tap();await p.getByRole('button',{name:'홈으로 가기'}).tap();
const left=await p.evaluate(()=>localStorage.getItem('gas-city-adventure-v1'));await p.waitForTimeout(2100);assert.equal(await p.evaluate(()=>localStorage.getItem('gas-city-adventure-v1')),left);
// Teacher controls stay available in a separate dialog and close on navigation.
await p.evaluate(async()=>{(await import('/src/state.js')).setTeacherPreview(true);});await open('engineering',0);await p.getByRole('button',{name:'교사용 빠른 이동',exact:true}).tap();await p.locator('.teacher-nav-dialog').waitFor();await p.getByRole('button',{name:'다음 단계 (오른쪽 방향키)',exact:true}).tap();assert.equal(await p.locator('dialog[open]').count(),0);assert.ok(p.url().endsWith('#stage/engineering/1'));
assert.deepEqual(errors,[]);await fs.writeFile(`${out}/report.json`,JSON.stringify({report,errors,pauseResume:true,speedChange:true,manualInterruption:true,abort:true,teacherNavigation:true},null,2));console.log('PASS: all 20 autoplay boundaries, pause/resume, speed, manual interruption, abort and teacher navigation');
}finally{await b.close();}
