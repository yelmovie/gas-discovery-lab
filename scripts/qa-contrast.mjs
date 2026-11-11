import {createRequire} from 'node:module';
import assert from 'node:assert/strict';
import {STAGES} from '../src/data.js';
const {chromium}=createRequire(import.meta.url)(process.env.PLAYWRIGHT_MODULE||'playwright-core');
const base=process.env.QA_URL||'http://127.0.0.1:4176';
const browser=await chromium.launch({channel:'chrome',headless:true,args:['--disable-crash-reporter']});
const context=await browser.newContext({viewport:{width:1280,height:800},reducedMotion:'reduce'});
let count=0;
try{
 const page=await context.newPage();
 await page.goto(base);
 await page.evaluate(async()=>{const {setTeacherPreview}=await import('/src/state.js');setTeacherPreview(true);});
 for(const route of ['home',...STAGES.map(s=>`stage/${s.id}/0`)]){
  await page.goto(`${base}/#${route}`);
  await page.locator(route==='home'?'.start-button':'.activity-screen').waitFor();
  const samples=await page.locator('.button.primary:not(:disabled),.start-button,.is-next-action:not(:disabled)').evaluateAll(buttons=>{
   const parse=color=>(color.match(/[\d.]+/g)||[]).map(Number);
   const luminance=rgb=>rgb.slice(0,3).map(n=>n/255).map(n=>n<=.04045?n/12.92:((n+.055)/1.055)**2.4).reduce((sum,n,i)=>sum+n*[.2126,.7152,.0722][i],0);
   return buttons.filter(b=>b.getClientRects().length).map(button=>{
    const style=getComputedStyle(button),fg=parse(style.color);
    const gradientStops=style.backgroundImage.match(/rgba?\([^)]+\)/g);
    const backgrounds=(gradientStops||[style.backgroundColor]).map(parse);
    const contrast=backgrounds.flatMap(bg=>[0,255].map(under=>{
     const alpha=bg[3]??1;
     const background=bg.slice(0,3).map(n=>n*alpha+under*(1-alpha));
     const a=luminance(fg),b=luminance(background);
     return(Math.max(a,b)+.05)/(Math.min(a,b)+.05);
    }));
    return{text:button.textContent.trim(),foreground:style.color,background:style.backgroundColor,contrast:Math.min(...contrast)};
   });
  });
  for(const sample of samples)assert.ok(sample.contrast>=4.5,`${route} ${JSON.stringify(sample)}`);
  count+=samples.length;
 }
 console.log(`PASS: ${count} enabled primary and next-action buttons meet 4.5:1 contrast on both light and dark backdrops`);
}finally{await context.close();await browser.close();}
