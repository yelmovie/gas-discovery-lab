import {createRequire} from 'node:module';
const {chromium}=createRequire(import.meta.url)(process.env.PLAYWRIGHT_MODULE||'playwright-core');
import fs from 'node:fs/promises';
import assert from 'node:assert/strict';
const b=await chromium.launch({channel:'chrome',headless:true}),report=[],errors=[];
await fs.mkdir('.tmp/qa',{recursive:true});
for(const [width,height] of [[1280,800],[906,755],[1920,1080],[1024,768],[1440,900],[873,580]]){
 console.log('Checking layout',width,height);
 const isolated=await b.newContext({storageState:{cookies:[],origins:[]},viewport:{width,height}}),p=await isolated.newPage();p.on('pageerror',e=>errors.push(e.message));
 await p.goto('http://127.0.0.1:4176');
 assert.equal(await p.evaluate(()=>localStorage.length),0,'Layout QA must use isolated empty storage');await p.evaluate(async()=>{const {store}=await import('/src/state.js');const s=store.save;s.introSeen=true;s.settings.adminUnlockAll=true;s.settings.music=false;s.settings.sfx=false;localStorage.setItem('gas-city-adventure-v1',JSON.stringify(s));});
 await p.reload();
 for(const route of ['home','map','stage/flow','stage/weight','stage/climate','stage/delivery','stage/engineering',...['flow','weight','climate','delivery','engineering'].flatMap(s=>[0,1,2,3].map(i=>`stage/${s}/${i}`)),'finale']){
  await p.goto('http://127.0.0.1:4176/#'+route);await p.locator('.boot').waitFor({state:'detached'});await p.locator(route.startsWith('stage/')?route.split('/').length===3?'.activity-screen':'.stage-screen':`.${route}-screen`).waitFor();await p.waitForTimeout(route==='map'?900:100);
  const result=await p.evaluate(()=>({panels:[...document.querySelectorAll('.activity-host .lab-panel,.stage-brief,.finale-panel')].map(e=>({name:e.className,overflow:Math.max(0,e.scrollHeight-e.clientHeight),h:Math.round(e.getBoundingClientRect().height)})),outside:[...document.querySelectorAll('.activity-host button,.mission-rail,.stage-brief,.finale-panel')].filter(e=>{const r=e.getBoundingClientRect();return r.width&&r.height&&(r.left<0||r.right>innerWidth+1||r.top<0||r.bottom>innerHeight+1);}).map(e=>e.textContent.trim().slice(0,25)),small:[...document.querySelectorAll('.activity-host button,.activity-host p,.activity-host .microcopy,.part-card>span,.stage-task')].filter(e=>parseFloat(getComputedStyle(e).fontSize)<18&&e.getBoundingClientRect().height).map(e=>[e.className,getComputedStyle(e).fontSize,e.textContent.slice(0,30)])}));
  report.push({width,height,route,...result});
  if((route.endsWith('/0')||route==='stage/flow'||route==='home'||route==='map')&&[1280,906,1920,873].includes(width)){await p.waitForTimeout(350);await p.screenshot({path:`.tmp/qa/${width}-${route.replaceAll('/','-')}.png`});}
 }
 await p.getByRole('button',{name:'설정',exact:true}).click();await p.screenshot({path:`.tmp/qa/${width}-settings.png`});
 report.push({width,height,route:'settings',bounds:await p.locator('dialog').boundingBox()});await isolated.close();
}
await fs.writeFile('.tmp/qa/layout.json',JSON.stringify({report,errors},null,2));
console.log(JSON.stringify({errors,issues:report.filter(r=>r.panels?.some(x=>x.overflow>2)||r.outside?.length||r.small?.length)},null,2));await b.close();
