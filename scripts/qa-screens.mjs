// 홈·지도(지도 복구 작업대 열림 포함)·최종 복구 화면을 필수 해상도에서 검사한다.
// qa-responsive가 시설·실험 화면만 보므로 그 밖의 화면을 보완한다. 실제 학습 기록은 건드리지 않는다(격리 컨텍스트).
import {createRequire} from 'node:module';
import fs from 'node:fs/promises';
import path from 'node:path';
const {chromium}=createRequire(import.meta.url)(process.env.PLAYWRIGHT_MODULE||'playwright-core');
const QA=process.env.QA_URL||'http://127.0.0.1:4176';
const out=path.resolve(process.env.QA_OUTPUT||'.tmp/qa/screens');await fs.mkdir(out,{recursive:true});
const viewports=(process.env.QA_VIEWPORTS||'1920x1080,1280x800,1024x768,915x412,1024x600,375x812').split(',').map(v=>v.split('x').map(Number));
const b=await chromium.launch({channel:'chrome',headless:true,args:['--disable-crash-reporter']});
const report=[],errors=[];
function audit(){
 const issues=[],shown=e=>{const s=getComputedStyle(e),r=e.getBoundingClientRect();return s.display!=='none'&&s.visibility!=='hidden'&&+s.opacity>0&&r.width>0&&r.height>0&&!e.closest('[hidden],[inert]')&&!e.closest('details:not([open]) > :not(summary)');};
 if(document.documentElement.scrollWidth>innerWidth+1)issues.push(['horizontal-overflow',document.documentElement.scrollWidth]);
 for(const e of document.querySelectorAll('button,summary,select,input,a[href],[role=button]')){
  if(!shown(e))continue;const r=e.getBoundingClientRect();const name=(e.getAttribute('aria-label')||e.textContent||e.className).trim().slice(0,40);
  if(r.right<1||r.bottom<1||r.left>innerWidth-1||r.top>innerHeight-1)continue;
  if(e.type!=='range'&&(r.width<44||r.height<44))issues.push(['small-target',name,Math.round(r.width)+'x'+Math.round(r.height)]);
  const cx=Math.min(innerWidth-1,Math.max(0,r.left+r.width/2)),cy=Math.min(innerHeight-1,Math.max(0,r.top+r.height/2)),hit=document.elementFromPoint(cx,cy);
  if(hit&&!e.contains(hit)&&!hit.contains(e))issues.push(['covered',name,(hit.className||hit.tagName)+''].map(String));
  if(r.left<-1||r.right>innerWidth+1||r.top<-1||r.bottom>innerHeight+1)issues.push(['offscreen',name]);
 }
 return issues;
}
for(const [width,height] of viewports){
 const c=await b.newContext({viewport:{width,height},storageState:{cookies:[],origins:[]}}),p=await c.newPage();
 p.on('pageerror',e=>errors.push(`${width}x${height} ${e.message}`));
 await c.addInitScript(()=>{if(!localStorage.getItem('gas-city-adventure-v1'))localStorage.setItem('qa-seed','1');});
 await p.goto(QA);await p.evaluate(async()=>{const {store}=await import('/src/state.js');const {STAGES}=await import('/src/data.js');const s=store.save;s.introSeen=true;s.settings.music=false;s.settings.sfx=false;for(const st of STAGES.slice(0,2))s.evidence[st.id]=st.tasks.map(t=>({taskId:t.id,summary:'화면 검사용',details:{}}));localStorage.setItem('gas-city-adventure-v1',JSON.stringify(s));});
 for(const [route,sel,prep] of [['home','.home-screen,.title-v2'],['map','.map-canvas'],['map','.map-repair[open]','repair'],['finale','.finale-screen']]){
  await p.goto(`${QA}/#${route}`);await p.reload();await p.locator('.boot').waitFor({state:'detached'});
  if(prep==='repair'){await p.locator('.map-repair summary').waitFor();await p.locator('.map-repair summary').click({timeout:3000}).catch(async()=>{errors.push(`${width}x${height} 지도 복구 작업대 제목을 누를 수 없음(다른 요소가 가로챔)`);await p.evaluate(()=>{document.querySelector('.map-repair').open=true;});});}
  await p.locator(sel).first().waitFor({timeout:8000}).catch(()=>errors.push(`${width}x${height} ${route} missing ${sel}`));await p.waitForTimeout(700);
  const issues=await p.evaluate(audit);const label=route+(prep?'-'+prep:'');
  await p.screenshot({path:path.join(out,`${width}x${height}-${label}.png`)});
  report.push({viewport:`${width}x${height}`,screen:label,issues});
 }
 await c.close();
}
await fs.writeFile(path.join(out,'report.json'),JSON.stringify({report,errors},null,1));
const bad=report.filter(r=>r.issues.length);
console.log(JSON.stringify({screens:report.length,errors,withIssues:bad},null,1));
await b.close();
if(errors.length)process.exitCode=1;
