import {createRequire} from 'node:module';
import assert from 'node:assert/strict';
const {chromium}=createRequire(import.meta.url)(process.env.PLAYWRIGHT_MODULE||'playwright-core');
const base=process.env.QA_URL||'http://127.0.0.1:4176';
const browser=await chromium.launch({channel:'chrome',headless:true,args:['--disable-crash-reporter']});
const context=await browser.newContext({viewport:{width:1280,height:800},serviceWorkers:'block',reducedMotion:'reduce'});
const page=await context.newPage(),errors=[];
page.on('pageerror',error=>errors.push(error.message));
await page.addInitScript(()=>{
 window.clipUrls=new Set();
 const create=URL.createObjectURL.bind(URL),revoke=URL.revokeObjectURL.bind(URL);
 URL.createObjectURL=blob=>{const url=create(blob);window.clipUrls.add(url);return url;};
 URL.revokeObjectURL=url=>{window.clipUrls.delete(url);revoke(url);};
});
try{
 // Reproduce the public static host, which sends complete files for Range requests.
 await page.route(/\/assets\/concepts-v2\/.*\.(webm|mp4)$/,async route=>{
  const headers={...route.request().headers()};delete headers.range;
  const response=await route.fetch({headers}),out={...response.headers()};
  delete out['accept-ranges'];delete out['content-range'];
  await route.fulfill({response,status:200,headers:out});
 });
 await page.goto(base);
 const cases=await page.evaluate(async()=>{
  const {STAGES}=await import('/src/data.js'),{conceptFor}=await import('/src/concepts.js');
  const clips=new Map();
  for(const stage of STAGES)for(const task of stage.tasks)clips.set(conceptFor(stage,task).id,{id:conceptFor(stage,task).id,stageId:stage.id,taskId:task.id});
  return [...clips.values()];
 });
 for(const {id,stageId,taskId} of cases){
  await page.evaluate(async([stageId,taskId])=>{const {STAGES}=await import('/src/data.js');const stage=STAGES.find(s=>s.id===stageId);(await import('/src/concepts.js')).openConcept(stage,stage.tasks.find(t=>t.id===taskId));},[stageId,taskId]);
  await page.waitForFunction(()=>document.querySelector('video')?.readyState>=2);
  for(const step of [1,2,0]){
   await page.locator(`[data-science-step="${step}"]`).click();
   await page.waitForFunction(expected=>{const v=document.querySelector('video');return !v.seeking&&Math.abs(v.currentTime-expected)<.1;},step*4,{timeout:10000});
   assert.equal(await page.locator('[data-science-step].is-current').getAttribute('data-science-step'),String(step));
  }
  await page.keyboard.press('Escape');
  await page.waitForFunction(()=>window.clipUrls.size===0);
  console.log(`Seek, captions and URL cleanup passed: ${id}`);
 }
 assert.equal(cases.length,10);
 await page.unroute(/\/assets\/concepts-v2\/.*\.(webm|mp4)$/);
 await page.route(/\/assets\/concepts-v2\/.*\.(webm|mp4)$/,route=>route.abort());
 await page.evaluate(async()=>{const {STAGES}=await import('/src/data.js');(await import('/src/concepts.js')).openConcept(STAGES[0],STAGES[0].tasks[0]);});
 await page.locator('.concept-fallback:not([hidden])').waitFor();await page.keyboard.press('Escape');
 assert.equal(await page.locator('dialog[open]').count(),0);
 assert.equal(await page.evaluate(()=>window.clipUrls.size),0);
 assert.deepEqual(errors,[]);
 console.log('PASS: 10 clips seek without HTTP Range support, dispose media, and retain failure fallback');
}finally{await context.close();await browser.close();}
