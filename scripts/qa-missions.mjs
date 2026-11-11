import {createRequire} from 'node:module';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import {missions} from '../src/play-mission-model.js';

const {chromium}=createRequire(import.meta.url)(process.env.PLAYWRIGHT_MODULE||'playwright-core');
const base=process.env.QA_URL||'http://127.0.0.1:4176';
const output=process.env.QA_OUTPUT||'.tmp/qa/missions';
await fs.mkdir(output,{recursive:true});
const browser=await chromium.launch({channel:'chrome',headless:true,args:['--disable-crash-reporter']});
const solutions=[
 [[3,0,1],[4,0,1],[5,0,1]],
 [[3,1,3],[0,1,1],[1,0,1],[2,1,2],[5,1,0]],
 [[3,1,2],[6,1,0],[7,0,1],[8,1,3],[5,1,1]]
];
const report=[],errors=[];
try{
 for(const [width,height] of [[1280,800],[1024,768],[915,412],[830,515],[1920,1080]]){
  const context=await browser.newContext({viewport:{width,height},hasTouch:true,reducedMotion:'reduce'});
  const page=await context.newPage();
  page.on('pageerror',error=>errors.push(error.message));
  await page.goto(base);
  await page.locator('.play-mission-entry').click();
  for(let level=0;level<missions.length;level++){
   await page.locator('[data-pump]').tap();
   assert.equal(await page.locator('.gas-target b').textContent(),`0 / ${missions[level].required}`);
   for(const [cell,type,turn] of solutions[level]){
    if(type){
     await page.locator('[data-mode="shape"]').click();
     for(let i=0;i<type;i++)await page.locator(`[data-cell="${cell}"]`).tap();
    }
    await page.locator('[data-mode="rotate"]').click();
    for(let i=0;i<turn;i++)await page.locator(`[data-cell="${cell}"]`).click();
    if(turn){
     const focused=await page.evaluate(()=>document.activeElement?.dataset.cell);
     assert.equal(focused,String(cell),'Repeated pipe operations preserve keyboard focus');
    }
   }
   if((await page.locator('[data-vent]').textContent()).includes('열림'))await page.locator('[data-vent]').click();
   await page.locator('[data-pump]').focus();
   for(let i=0;i<missions[level].required;i++)await page.keyboard.press('Enter');
   assert.equal(await page.locator('.gas-target b').textContent(),`${missions[level].required} / ${missions[level].required}`);
   await page.screenshot({path:`${output}/${width}x${height}-mission-${level+1}.png`});
   const layout=await page.locator('.play-mission').evaluate(dialog=>{
    const bounds=dialog.getBoundingClientRect();
    return {overflow:dialog.scrollWidth>dialog.clientWidth+1,hiddenControls:[...dialog.querySelectorAll('button:not(:disabled)')].filter(button=>{
     const r=button.getBoundingClientRect(),hit=document.elementFromPoint(r.x+r.width/2,r.y+r.height/2);
     return r.width<44||r.height<44||r.top<bounds.top||r.bottom>bounds.bottom||!button.contains(hit);
    }).map(button=>button.textContent.trim())};
   });
   assert.equal(layout.overflow,false);
   assert.deepEqual(layout.hiddenControls,[],'The complete experiment fits a landscape screen');
   await page.locator('[data-release]').click();
   assert.equal(await page.evaluate(n=>JSON.parse(localStorage.getItem('science-play-15-v1')).air[n],level),0,'Released air is saved immediately');
   for(let i=0;i<missions[level].required;i++)await page.locator('[data-pump]').tap();
   if(level<2)await page.locator('[data-next]').click();
  }
  await page.keyboard.press('Escape');
  assert.equal(await page.locator('.play-mission-entry').evaluate(button=>button===document.activeElement),true);
  await page.reload();await page.locator('.play-mission-entry').click();
  assert.deepEqual(await page.evaluate(()=>JSON.parse(localStorage.getItem('science-play-15-v1')).won),[0,1,2]);
  await page.locator('[data-release]').click();await page.keyboard.press('Escape');
  await page.reload();await page.locator('.play-mission-entry').click();
  assert.equal(await page.locator('.gas-target b').textContent(),'0 / 5');
  await page.locator('[data-cell="3"]').click();
  await page.locator('[data-undo]').click();
  assert.ok(await page.locator('[data-undo]').isDisabled());
  report.push({width,height,missions:3,passed:true});
  await context.close();console.log(`Completed 3 missions at ${width}×${height}`);
 }
 const recoveryContext=await browser.newContext({viewport:{width:1280,height:800}});
 const recoveryPage=await recoveryContext.newPage();
 await recoveryPage.goto(base);
 await recoveryPage.evaluate(()=>localStorage.setItem('science-play-15-v1','{damaged-record'));
 await recoveryPage.locator('.play-mission-entry').click();
 await recoveryPage.locator('[data-cell="3"]').click();
 assert.equal(await recoveryPage.evaluate(()=>localStorage.getItem('science-play-15-v1-recovery')),'{damaged-record','Damaged mission data is preserved before a new save');
 const newerRecord=await recoveryPage.evaluate(()=>{
  const record=JSON.parse(localStorage.getItem('science-play-15-v1'));
  record.air[0]=2;
  const raw=JSON.stringify(record);
  localStorage.setItem('science-play-15-v1',raw);
  return raw;
 });
 await recoveryPage.locator('[data-cell="3"]').click();
 assert.equal(await recoveryPage.evaluate(()=>localStorage.getItem('science-play-15-v1')),newerRecord,'A stale open mission cannot overwrite a newer record');
 assert.match(await recoveryPage.locator('.pm-feedback').textContent(),/다른 창/);
 await recoveryPage.keyboard.press('Escape');
 await recoveryPage.evaluate(()=>{
  localStorage.setItem('science-play-15-v1','{damaged-with-full-storage');
  const original=Storage.prototype.setItem;
  Storage.prototype.setItem=function(key,value){
   if(key==='science-play-15-v1-recovery')throw new DOMException('Storage full','QuotaExceededError');
   return original.call(this,key,value);
  };
 });
 await recoveryPage.locator('.play-mission-entry').click();
 await recoveryPage.locator('[data-cell="3"]').click();
 assert.equal(await recoveryPage.evaluate(()=>localStorage.getItem('science-play-15-v1')),'{damaged-with-full-storage','A failed recovery backup preserves the original record');
 assert.match(await recoveryPage.locator('.pm-feedback').textContent(),/저장하지 못했어/);
 await recoveryContext.close();
 assert.deepEqual(errors,[]);
 console.log('PASS: mission flow, layout, focus, persistence, stale-record and quota recovery');
}finally{
 await fs.writeFile(`${output}/report.json`,JSON.stringify({report,errors},null,2));
 await browser.close();
}
