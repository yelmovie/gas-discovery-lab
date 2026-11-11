import {createRequire} from 'node:module';
import fs from 'node:fs/promises';
import path from 'node:path';
import assert from 'node:assert/strict';
import {STAGES} from '../src/data.js';
import {createPipePuzzle,PIPE_PATTERNS} from '../src/model.js';

const {chromium}=createRequire(import.meta.url)(process.env.PLAYWRIGHT_MODULE||'playwright-core');
const root=path.resolve(import.meta.dirname,'..');
const output=path.resolve(root,process.env.QA_OUTPUT||'.tmp/qa/responsive');
await fs.mkdir(output,{recursive:true});
const base=process.env.QA_URL||'http://127.0.0.1:4176';
const viewports=process.env.QA_VIEWPORTS
  ?process.env.QA_VIEWPORTS.split(',').map(x=>x.split('x').map(Number))
  :[[1920,1080],[1366,768],[1280,800],[1024,768],[1024,600],[906,755],[873,580],[915,412],[740,360],[800,1280],[390,844]];
const browser=await chromium.launch({channel:'chrome',headless:true,args:[
  `--disk-cache-dir=${root}/.tmp/browser/cache`,
  `--crash-dumps-dir=${root}/.tmp/browser/crashes`,'--disable-crash-reporter'
]});
const report=[],errors=[],resources=[];

// Runs against rendered text ranges, not scrollHeight (which includes art and
// decorative shadows). Off-screen content inside a usable scroll area is valid.
function audit(){
  const issues=[],seen=new Set();
  const add=(kind,el,detail='')=>{const name=(el.getAttribute('aria-label')||el.textContent||el.className).trim().slice(0,70),key=kind+name+detail;if(!seen.has(key)){issues.push({kind,name,detail});seen.add(key);}};
  const shown=el=>{const s=getComputedStyle(el),r=el.getBoundingClientRect();return s.display!=='none'&&s.visibility!=='hidden'&&Number(s.opacity)!==0&&r.width>0&&r.height>0&&!el.closest('[hidden],[inert]')&&!el.closest('details:not([open]) > :not(summary)');};
  const scope=document.querySelector('.activity-screen,.stage-screen,.finale-screen');
  if(!scope)throw Error('Expected an actual facility or experiment screen');
  const experiment=scope.querySelector('.activity-host');
  if(experiment&&experiment.clientHeight<80)add('experiment-area-too-short',experiment,`${experiment.clientHeight}px`);
  const inView=r=>r.bottom>0&&r.right>0&&r.top<innerHeight&&r.left<innerWidth;
  const clipped=(el,r)=>{for(let a=el.parentElement;a;a=a.parentElement){const s=getComputedStyle(a),b=a.getBoundingClientRect(),top=b.top+a.clientTop,left=b.left+a.clientLeft;if(/hidden|clip|auto|scroll/.test(s.overflowY)&& (r.top<top||r.bottom>top+a.clientHeight))return true;if(/hidden|clip|auto|scroll/.test(s.overflowX)&&(r.left<left||r.right>left+a.clientWidth))return true;}return false;};
  const permanentlyClipped=(el,r)=>{
    let scrollX=false,scrollY=false;
    for(let a=el.parentElement;a;a=a.parentElement){
      const s=getComputedStyle(a),b=a.getBoundingClientRect();
      if(/auto|scroll/.test(s.overflowX)&&a.scrollWidth>a.clientWidth+2)scrollX=true;
      if(/auto|scroll/.test(s.overflowY)&&a.scrollHeight>a.clientHeight+2)scrollY=true;
      if(!scrollX&&/hidden|clip/.test(s.overflowX)&&(r.left<b.left-2||r.right>b.right+2))return a.className;
      if(!scrollY&&/hidden|clip/.test(s.overflowY)&&(r.top<b.top-2||r.bottom>b.bottom+2))return a.className;
    }
    return '';
  };
  if(document.documentElement.scrollWidth>innerWidth+2)add('horizontal-page-overflow',scope);
  for(const el of scope.querySelectorAll('.activity-host,.lab-panel,.mission-rail,.stage-intro,.finale-layout')){
    if(shown(el)&&el.scrollWidth>el.clientWidth+3)add('horizontal-panel-overflow',el,`${el.scrollWidth-el.clientWidth}px`);
    if(scope.classList.contains('activity-screen')&&shown(el)&&el.scrollHeight>el.clientHeight+3)add('activity-needs-scroll',el,`${el.scrollHeight-el.clientHeight}px`);
  }
  for(const el of document.querySelectorAll('button,input,[role="slider"],[role="button"],summary')){
    if(!shown(el)||el.disabled)continue;
    const r=el.getBoundingClientRect();
    const clipping=permanentlyClipped(el,r);if(clipping)add('clipped-control',el,String(clipping));
    if(r.width<43||r.height<43)add('small-touch-target',el,`${Math.round(r.width)}×${Math.round(r.height)}`);
    if(el.matches('.pipe-cell,[data-action="add"],[data-action="remove"],.condition-slider,.part-card,.gas-card,.scale-jar,[role="slider"]')&&(r.width<48||r.height<48))add('small-repeated-touch-target',el,`${Math.round(r.width)}×${Math.round(r.height)}`);
    if(!inView(r)){
      let reachable=false;
      for(let a=el.parentElement;a;a=a.parentElement){const s=getComputedStyle(a);if(/auto|scroll/.test(s.overflowY)&&a.scrollHeight>a.clientHeight+2)reachable=true;}
      if(!reachable)add('unreachable-control',el);
      continue;
    }
    const x=r.x+r.width/2,y=r.y+r.height/2;
    if(x<0||x>innerWidth||y<0||y>innerHeight||clipped(el,{left:x,right:x,top:y,bottom:y}))continue;
    const top=document.elementFromPoint(x,y);
    if(top&&!el.contains(top))add('covered-control',el,top.className?.baseVal??top.className);
  }
  const walker=document.createTreeWalker(scope,NodeFilter.SHOW_TEXT);
  while(walker.nextNode()){
    const node=walker.currentNode,el=node.parentElement;
    if(!node.textContent.trim()||!shown(el)||el.closest('svg,.sr-only,script,style'))continue;
    const range=document.createRange();range.selectNodeContents(node);
    const parent=el.getBoundingClientRect();
    for(const r of range.getClientRects()){
      if(r.width<1||r.height<1)continue;
      if(r.left<parent.left-2||r.right>parent.right+2)add('text-outside-label',el,node.textContent.trim().slice(0,45));
      const clipping=permanentlyClipped(el,r);if(clipping)add('clipped-text',el,String(clipping));
      const button=el.closest('button');
      if(button)for(const art of button.querySelectorAll('.icon,.radio-dot,.prop,.part-diagram')){
        const a=art.getBoundingClientRect();
        if(Math.min(r.right,a.right)-Math.max(r.left,a.left)>2&&Math.min(r.bottom,a.bottom)-Math.max(r.top,a.top)>2)add('icon-text-overlap',button,art.className?.baseVal??art.className);
      }
      if(!inView(r)||clipped(el,r))continue;
      const size=parseFloat(getComputedStyle(el).fontSize),min=innerWidth>=1600?18:14;
      if(size<min)add('small-text',el,`${size}px`);
      const x=r.x+r.width/2,y=r.y+r.height/2,top=document.elementFromPoint(x,y);
      if(top&&!el.contains(top)&&!top.contains(el))add('covered-text',el,top.className?.baseVal??top.className);
      // Pointer-transparent save notices are still visually opaque.
      const status=document.querySelector('.save-status');
      if(status){const a=status.getBoundingClientRect();if(Math.min(r.right,a.right)-Math.max(r.left,a.left)>2&&Math.min(r.bottom,a.bottom)-Math.max(r.top,a.top)>2)add('covered-text',el,'save-status');}
    }
  }
  for(const img of scope.querySelectorAll('img'))if(shown(img)&&(!img.complete||!img.naturalWidth))add('broken-image',img,img.getAttribute('src'));
  return issues;
}

try{
for(const [width,height] of viewports){
  const context=await browser.newContext({viewport:{width,height},storageState:{cookies:[],origins:[]},reducedMotion:'reduce'});
  // Seed before any app module loads, so the normal persistence guard is intact.
  const save={version:1,introSeen:true,evidence:Object.fromEntries(STAGES.map(s=>[s.id,s.tasks.map(t=>({taskId:t.id,summary:'격리된 반응형 검증',details:{}}))])),drafts:{},settings:{music:false,sfx:false,musicVolume:0,adminUnlockAll:false}};
  await context.addInitScript(value=>{if(!localStorage.getItem('gas-city-adventure-v1'))localStorage.setItem('gas-city-adventure-v1',JSON.stringify(value));},save);
  const page=await context.newPage();
  page.on('pageerror',e=>errors.push({width,height,message:e.message}));
  page.on('response',r=>{if(r.status()>=400)resources.push({url:r.url(),status:r.status()});});
  async function check(route,state='initial',shot=false){
    if(route)await page.goto(`${base}/#${route}`);
    await page.locator('.activity-screen,.stage-screen,.finale-screen').waitFor();
    await page.evaluate(async()=>{await document.fonts.ready;await Promise.all([...document.images].map(x=>x.decode().catch(()=>{})));});
    const issues=await page.evaluate(audit);
    const label=route||new URL(page.url()).hash.slice(1);
    report.push({width,height,route:label,state,issues});
    if(shot||issues.length)await page.screenshot({path:path.join(output,`${width}x${height}-${label.replaceAll('/','-')}-${state}.png`),animations:'disabled'});
  }
  if(process.env.QA_MODE!=='teacher'){
  for(const stage of STAGES){
    await check(`stage/${stage.id}`,'initial',width===1280||width===390);
    for(let i=0;i<stage.tasks.length;i++){
      await check(`stage/${stage.id}/${i}`,'initial',i===0);
      if(stage.id==='weight'){
        for(const action of ['level','zero','place']){const button=page.locator(`[data-action=${action}]`);if(await button.isVisible()&&await button.isEnabled())await button.click();}
        await check(null,'prepared',i===0);
        if(process.env.QA_HISTORY==='1'){
          await page.locator('.record-button').click();
          const opposite=stage.tasks[i].direction>0?'remove':'add';
          for(let n=0;n<2;n++){await page.locator(`[data-action=${opposite}]`).click();await page.locator('.record-button').click();}
          await check(null,'history',true);
        }
      }
      if(stage.id==='climate'){
        await page.locator('.condition-slider').fill(String(stage.tasks[i].target));
        await page.locator('.condition-slider').dispatchEvent('change');
        await check(null,'comparison',i===0);
      }
      if(stage.id==='delivery'){
        await page.locator('.gas-card').first().click();
        await check(null,'investigated',i===0);
      }
      if(process.env.QA_COMPLETE==='1'){
        const task=stage.tasks[i];
        if(stage.id==='flow'){
          const cells=createPipePuzzle(task.pattern),solution=PIPE_PATTERNS[task.pattern].solved;
          for(let j=0;j<9;j++)for(let k=0;k<(solution[j]-cells[j].rotation+4)%4;k++)await page.locator('.pipe-cell').nth(j).click();
          await page.getByRole('button',{name:'공기 보내기',exact:true}).click();
        }else if(stage.id==='weight'){
          for(const action of ['level','zero']){const b=page.locator(`[data-action=${action}]`);if(await b.isEnabled())await b.click();}
          const place=page.locator('[data-action=place]');if(await place.isVisible())await place.click();await page.locator('.record-button').click();
          for(let n=0;n<task.minDelta;n++)await page.locator(`[data-action=${task.direction>0?'add':'remove'}]`).click();
          await page.locator('.record-button').click();
        }else if(stage.id==='climate'){
          await page.getByRole('button',{name:task.answer,exact:true}).click();
        }else if(stage.id==='delivery'){
          await page.locator(`.gas-card[data-gas=${task.gas}]`).click();
          await page.getByRole('button',{name:task.reason,exact:true}).click();
        }else{
          for(const part of [task.requireSource==='balloon'?'balloon':'pump',task.requireElbow?'elbow':'straight','nozzle'])await page.locator(`[data-part=${part}]`).click();
          await page.locator('.valve-control').click();
          if(task.nozzle==='backward')await page.locator('.direction-control').click();
          await check(null,'assembled',i===0);
          await page.locator('.test-device').click();
        }
        await page.locator('.discovery-result').waitFor();
        await check(null,'complete',i===0);
        // Auto-scroll the actual next action to prove it can be reached, then
        // inspect the bottom of the result panel as well as its starting state.
        await page.locator('.completed-actions .primary').scrollIntoViewIfNeeded();
        await check(null,'complete-actions');
      }
    }
  }
  await check('finale');
  }else{
    await page.goto(`${base}/#map`);
    await page.locator('.map-screen').waitFor();
  }
  // Include the real teacher toolbar, without giving the student evidence.
  await page.evaluate(async()=>{const {setTeacherPreview}=await import('/src/state.js');setTeacherPreview(true);});
  for(const s of STAGES){
    await check(`stage/${s.id}`,'teacher');
    await check(`stage/${s.id}/0`,'teacher',true);
  }
  await check('finale','teacher');
  await context.close();
  await fs.writeFile(path.join(output,'report.json'),JSON.stringify({viewports,report,errors,resources},null,2));
  console.log(`Checked ${width}×${height}`);
}
}finally{
  await fs.writeFile(path.join(output,'report.json'),JSON.stringify({viewports,report,errors,resources},null,2));
  await browser.close();
}
const failures=report.filter(x=>x.issues.length);
console.log(JSON.stringify({screens:report.length,errors,resources,failures},null,2));
assert.equal(errors.length,0,'No JavaScript errors');
assert.equal(resources.length,0,'No missing resources');
assert.equal(failures.length,0,'No text overlaps, clipping, unreachable controls or horizontal overflow');
