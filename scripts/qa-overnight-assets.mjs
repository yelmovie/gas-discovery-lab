import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import fs from 'node:fs/promises';
import {STAGES} from '../src/data.js';
const {chromium}=createRequire(import.meta.url)(process.env.PLAYWRIGHT_MODULE||'playwright-core');
const out='output/overnight-20261108';const browser=await chromium.launch({channel:'chrome',headless:true});const checks=[];
try { for(const [width,height] of [[1920,1080],[1280,800],[1024,768]]){
 const context=await browser.newContext({viewport:{width,height},hasTouch:true,reducedMotion:'reduce'});
 await context.addInitScript(save=>localStorage.setItem('gas-city-adventure-v1',JSON.stringify(save)),{version:1,introSeen:true,evidence:Object.fromEntries(STAGES.map(s=>[s.id,s.tasks.map(t=>({taskId:t.id,summary:'Isolated QA fixture',details:{}}))])),drafts:{},settings:{music:false,sfx:false}});
 const page=await context.newPage();await page.goto('http://127.0.0.1:4176/#stage/weight/0');
 for(const name of ['level','zero','place'])await page.locator(`[data-action=${name}]`).click();
 const jar=page.locator('.scale-jar img');await jar.evaluate(i=>i.decode());assert.ok((await jar.getAttribute('src')).endsWith('air-jar-v2.webp'));
 assert.equal(await page.locator('.record-button').evaluate(e=>getComputedStyle(e).backgroundColor),'rgb(255, 240, 204)','Highlighted button must pair light background with dark text immediately');await page.screenshot({path:`${out}/weight-ready-${width}.png`});
 const before=await jar.boundingBox();await page.locator('.record-button').click();await page.locator('[data-action=add]').click();const after=await jar.boundingBox();assert.equal(after.width,before.width);assert.equal(after.height,before.height);
 await page.screenshot({path:`${out}/weight-new-${width}.png`});
 await page.goto('http://127.0.0.1:4176/#stage/climate/0');await page.locator('.thermal-bottle').waitFor();assert.equal(await page.locator('.gas-particles').count(),0);
 await page.locator('.condition-slider').fill('2');await page.locator('.condition-slider').dispatchEvent('change');assert.equal(await page.locator('.choice[aria-pressed=true]').count(),0);await page.screenshot({path:`${out}/temperature-new-${width}.png`});checks.push({width,height,fixedContainer:true,noParticleModel:true,noAutomaticAnswer:true});await context.close();
 }await fs.writeFile(`${out}/asset-check.json`,JSON.stringify({checks},null,2));console.log(JSON.stringify(checks));}finally{await browser.close();}
