import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {execFileSync} from 'node:child_process';
const {chromium}=createRequire(import.meta.url)(process.env.PLAYWRIGHT_MODULE||'playwright-core');
const base=process.env.QA_URL||'http://127.0.0.1:4176';
const browser=await chromium.launch({channel:'chrome',headless:true});
try{
 const page=await browser.newPage({viewport:{width:1024,height:768}});
 if(process.env.QA_BASELINE==='1')await page.route('**/src/activities/delivery.js',route=>route.fulfill({contentType:'text/javascript',body:execFileSync('git',['show','HEAD:src/activities/delivery.js'],{encoding:'utf8'})}));
 await page.goto(base);
 await page.evaluate(async()=>{
  const {store}=await import('/src/state.js');
  const {STAGES}=await import('/src/data.js');
  for(const stage of STAGES.slice(0,3))store.save.evidence[stage.id]=stage.tasks.map(task=>({taskId:task.id,summary:'격리된 선행 활동 기록',details:{}}));
  store.save.settings.music=false;
  store.save.settings.sfx=false;
  localStorage.setItem('gas-city-adventure-v1',JSON.stringify(store.save));
 });
 await page.reload();
 await page.goto(base+'/#stage/delivery/0');
 await page.locator('[data-gas="oxygen"]').click();
 await page.getByRole('button',{name:'다른 물질과 쉽게 반응하지 않아요.',exact:true}).click();
 await page.locator('[data-gas="nitrogen"]').click();
 assert.equal(await page.locator('.discovery-result').count(),0,'Changing gas requires choosing its matching evidence again');
 assert.equal(await page.locator('.reason-slot [aria-pressed="true"]').count(),0,'A changed gas clears the old reason');
 await page.getByRole('button',{name:'다른 물질과 쉽게 반응하지 않아요.',exact:true}).click();
 await page.locator('.discovery-result').waitFor();
 await page.evaluate(async()=>{
  const {store,persist}=await import('/src/state.js');
  store.save.drafts['delivery-2']={selected:'oxygen',reason:'사람의 호흡에 필요해요.',read:['oxygen']};
  persist();
 });
 await page.goto(base+'/#stage/delivery/1');
 await page.reload();
 await page.locator('.gas-card').first().waitFor();
 assert.equal(await page.locator('.discovery-result').count(),0,'A restored complete draft still needs the learner to confirm its reason');
 await page.getByRole('button',{name:'사람의 호흡에 필요해요.',exact:true}).click();
 await page.locator('.discovery-result').waitFor();
 await page.goto(base+'/#home');
 await page.locator('.play-mission-entry').click();
 assert.match(await page.locator('[data-vent]').textContent(),/잠김/,'First mission begins with a closed valve');
 await page.keyboard.press('Escape');
 await page.evaluate(()=>localStorage.setItem('science-play-15-v1',JSON.stringify({level:0,vent:[true,false,true],won:[]})));
 await page.locator('.play-mission-entry').click();
 assert.match(await page.locator('[data-vent]').textContent(),/열림/,'Existing valve choices survive the new defaults');
 console.log('PASS: explicit gas evidence selection, legacy draft confirmation and progressive mission defaults');
}finally{await browser.close();}
