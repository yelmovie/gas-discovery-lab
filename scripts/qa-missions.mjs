import {createRequire} from 'node:module';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import {missions} from '../src/play-mission-model.js';

const {chromium}=createRequire(import.meta.url)(process.env.PLAYWRIGHT_MODULE||'playwright-core');
const base=process.env.QA_URL||'http://127.0.0.1:4176';
const output=process.env.QA_OUTPUT||'.tmp/qa/missions';
await fs.mkdir(output,{recursive:true});
const browser=await chromium.launch({channel:'chrome',headless:true,args:['--disable-crash-reporter']});
// [cell, tray piece or null, target turn]. Empty cells take the named tray piece first.
const solutions=[
 [[3,0,1],[4,2,1],[5,3,1]],
 [[3,null,3],[0,null,1],[1,1,1],[2,0,2],[5,null,0]],
 [[3,null,2],[6,null,0],[7,0,1],[8,2,3],[5,null,1]]
];
const report=[],errors=[];
try{
 for(const [width,height] of [[1280,800],[1024,768],[915,412],[830,515],[1920,1080]]){
  const context=await browser.newContext({viewport:{width,height},hasTouch:true,reducedMotion:'reduce'});
  const page=await context.newPage();
  page.on('pageerror',error=>errors.push(error.message));
  await page.goto(base);
  await page.locator('.play-mission-entry').click();
  const air=()=>page.locator('.pm-air-meter').getAttribute('aria-label');
  const full=level=>page.waitForFunction(r=>document.querySelector('.pm-air-meter')?.getAttribute('aria-label')===`공기 ${r} / ${r}`,missions[level].required);
  // Holding the pump keeps adding air; letting go keeps what is already inside.
  const fill=async level=>{const box=await page.locator('[data-pump]').boundingBox();await page.mouse.move(box.x+box.width/2,box.y+box.height/2);await page.mouse.down();await full(level);await page.mouse.up();};
  for(let level=0;level<missions.length;level++){
   await page.locator('[data-pump]').focus();await page.keyboard.down('Enter');await page.waitForTimeout(250);await page.keyboard.up('Enter');
   assert.equal(await air(),`공기 0 / ${missions[level].required}`,'An unconnected route does not lift the platform');
   for(const [cell,piece,turn] of solutions[level]){
    let current=missions[level].start[cell].turn;
    if(piece!==null){
     await page.locator(`.pm-piece[data-piece="${piece}"]`).click();
     await page.locator(`[data-cell="${cell}"]`).click();
     current=missions[level].tray[piece].turn;
    }
    const clicks=(turn-current+4)%4;
    for(let i=0;i<clicks;i++)await page.locator(`[data-cell="${cell}"]`).click();
    if(clicks){
     const focused=await page.evaluate(()=>document.activeElement?.dataset.cell);
     assert.equal(focused,String(cell),'Repeated pipe operations preserve keyboard focus');
    }
   }
   assert.equal(await page.locator('.pm-tray .pm-piece').count(),missions[level].tray.length-missions[level].empty.length,'Placed pieces leave the tray');
   if(await page.locator('[data-vent]').count()&&(await page.locator('[data-vent]').getAttribute('aria-pressed'))==='false')await page.locator('[data-vent]').click();
   if(missions[level].required>3){
    await page.locator('[data-pump]').focus();await page.keyboard.down('Enter');await page.waitForTimeout(120);await page.keyboard.up('Enter');
    const partial=Number((await air()).match(/공기 (\d+)/)[1]);
    assert.ok(partial>=1&&partial<missions[level].required,'A short press adds some air and the air stays after release');
   }
   await page.locator('[data-pump]').focus();await page.keyboard.down('Enter');await full(level);await page.keyboard.up('Enter');
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
   await fill(level);
   if(level<2)await page.locator('[data-next]').click();
  }
  await page.keyboard.press('Escape');
  assert.equal(await page.locator('.play-mission-entry').evaluate(button=>button===document.activeElement),true);
  await page.reload();await page.locator('.play-mission-entry').click();
  assert.deepEqual(await page.evaluate(()=>JSON.parse(localStorage.getItem('science-play-15-v1')).won),[0,1,2]);
  await page.locator('[data-release]').click();await page.keyboard.press('Escape');
  await page.reload();await page.locator('.play-mission-entry').click();
  assert.equal(await air(),'공기 0 / 5');
  report.push({width,height,missions:3,passed:true});
  await context.close();console.log(`Completed 3 missions at ${width}×${height}`);
 }
 const recoveryContext=await browser.newContext({viewport:{width:1280,height:800}});
 const recoveryPage=await recoveryContext.newPage();
 await recoveryPage.goto(base);
 await recoveryPage.evaluate(()=>localStorage.setItem('science-play-15-v1','{damaged-record'));
 await recoveryPage.locator('.play-mission-entry').click();
 await recoveryPage.locator('[data-cell="0"]').click();
 assert.equal(await recoveryPage.evaluate(()=>localStorage.getItem('science-play-15-v1-recovery')),'{damaged-record','Damaged mission data is preserved before a new save');
 const newerRecord=await recoveryPage.evaluate(()=>{
  const record=JSON.parse(localStorage.getItem('science-play-15-v1'));
  record.air[0]=2;
  const raw=JSON.stringify(record);
  localStorage.setItem('science-play-15-v1',raw);
  return raw;
 });
 await recoveryPage.locator('[data-cell="0"]').click();
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
 await recoveryPage.locator('[data-cell="0"]').click();
 assert.equal(await recoveryPage.evaluate(()=>localStorage.getItem('science-play-15-v1')),'{damaged-with-full-storage','A failed recovery backup preserves the original record');
 assert.match(await recoveryPage.locator('.pm-feedback').textContent(),/저장하지 못했어/);
 await recoveryContext.close();
 assert.deepEqual(errors,[]);
 console.log('PASS: mission flow, layout, focus, persistence, stale-record and quota recovery');
}finally{
 await fs.writeFile(`${output}/report.json`,JSON.stringify({report,errors},null,2));
 await browser.close();
}
