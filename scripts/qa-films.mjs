// 인트로·파이널 한 편 영상 확인(2026-11-21 마무리). QA_URL, PLAYWRIGHT_MODULE 환경변수.
// 화면 크기마다: 시작 → 전체 화면 영상(자막 구역 비움, 건너뛰기 48px 이상) → 목소리 켬이면 앱 배경음 멈춤 → 끝까지 재생 → 지도.
// 그리고 목소리 끔(영상 음소거, 배경음 평소대로), 다시 보기, 뒤로 가기, 움직임 줄이기(카드 화면), 파이널 → 인증서, 콘솔 오류 0.
import assert from 'node:assert/strict'; import fs from 'node:fs/promises'; import {createRequire} from 'node:module';
const {chromium}=createRequire(import.meta.url)(process.env.PLAYWRIGHT_MODULE||'playwright-core');
const QA=process.env.QA_URL||'http://127.0.0.1:4176',OUT='.tmp/films-finish-20261121/qa';await fs.mkdir(OUT,{recursive:true});
const browser=await chromium.launch({channel:'chrome',headless:true,args:['--autoplay-policy=no-user-gesture-required','--mute-audio']});
const errors=[],report=[];
const hook=()=>{window.__media=new Set();const play=HTMLMediaElement.prototype.play;HTMLMediaElement.prototype.play=function(){window.__media.add(this);return play.apply(this,arguments);};};
const media=p=>p.evaluate(()=>[...window.__media].map(m=>({tag:m.tagName,src:(m.currentSrc||m.src).replace(location.origin,''),paused:m.paused,muted:m.muted,volume:+m.volume.toFixed(2)})));
async function page(vp,seed={},opts={}){
 const ctx=await browser.newContext({viewport:vp,...opts});const p=await ctx.newPage();await p.addInitScript(hook);
 p.on('console',m=>{if(m.type()==='error')errors.push(`${vp.width}x${vp.height} ${m.text()}`);});p.on('pageerror',e=>errors.push(String(e)));
 p.on('response',r=>{if(r.status()>=400)errors.push(`${r.status()} ${r.url()}`);});
 await p.goto(QA);await p.evaluate(async s=>{const {store}=await import('/src/state.js');Object.assign(store.save,s.save||{});Object.assign(store.save.settings,s.settings||{});localStorage.setItem('gas-city-adventure-v1',JSON.stringify(store.save));},seed);await p.reload();return {ctx,p};
}
async function filmState(p){return p.evaluate(()=>{const v=document.querySelector('.story-film video');if(!v)return null;const r=v.getBoundingClientRect(),b=document.querySelector('.film-skip').getBoundingClientRect();
 // 자막 구역(영상 화면의 아래 22%)을 덮는 요소가 있는지: 그 구역 여러 점에서 맨 위 요소가 video인지
 const vw=innerWidth,vh=innerHeight,ar=16/9;let w=vw,h=vw/ar;if(h>vh){h=vh;w=vh*ar;}const top=(vh-h)/2+h*.78,left=(vw-w)/2;const pts=[];for(let i=1;i<10;i++)for(const y of [top+4,top+(h*.22)/2,(vh-h)/2+h-4]){const el=document.elementFromPoint(left+w*i/10,y);pts.push(el===v);}
 return {fill:[Math.round(r.width),Math.round(r.height),innerWidth,innerHeight],fit:getComputedStyle(v).objectFit,skip:[Math.round(b.width),Math.round(b.height),Math.round(b.top),Math.round(b.right)],captionAreaClear:pts.every(Boolean),muted:v.muted,paused:v.paused,t:+v.currentTime.toFixed(2),dur:+v.duration.toFixed(2),w:v.videoWidth};});}
const toEnd=p=>p.evaluate(()=>{const v=document.querySelector('.story-film video');v.currentTime=v.duration-0.25;});
for(const vp of [{width:1280,height:800},{width:1024,height:768},{width:1920,height:1080},{width:844,height:390}]){
 const tag=`${vp.width}x${vp.height}`;const {ctx,p}=await page(vp,{settings:{music:true,voice:true}});
 await p.getByRole('button',{name:'시작하기',exact:true}).click();await p.locator('.story-film video').waitFor();
 await p.waitForFunction(()=>{const v=document.querySelector('.story-film video');return v&&!v.paused&&v.currentTime>3.6;},null,{timeout:20000});
 const s=await filmState(p);await p.screenshot({path:`${OUT}/intro-${tag}.png`});
 assert.equal(s.fill[0],vp.width,`${tag} film width`);assert.equal(s.fill[1],vp.height,`${tag} film height`);assert.equal(s.fit,'contain');
 assert.ok(s.skip[0]>=48&&s.skip[1]>=48,`${tag} skip size`);assert.ok(s.skip[2]<vp.height*.3,`${tag} skip at top`);assert.ok(s.captionAreaClear,`${tag} caption area covered`);
 assert.equal(s.muted,false,`${tag} voice on → film has sound`);
 const m=await media(p);const bgm=m.filter(x=>x.tag==='AUDIO'&&/bgm/.test(x.src)&&!x.paused);assert.equal(bgm.length,0,`${tag} app music paused under film: ${JSON.stringify(bgm)}`);
 await toEnd(p);await p.waitForURL(/#map/);const seen=await p.evaluate(()=>JSON.parse(localStorage.getItem('gas-city-adventure-v1')).introSeen);assert.equal(seen,true);
 await p.waitForTimeout(600);const after=(await media(p)).filter(x=>x.tag==='AUDIO'&&/bgm/.test(x.src)&&!x.paused);assert.ok(after.length>=1,`${tag} app music back after film`);
 report.push({tag,intro:s,bgmAfter:after.map(x=>x.src)});console.log('ok',tag);await ctx.close();
}
{ // 목소리 끔: 영상 음소거, 배경음은 평소대로
 const {ctx,p}=await page({width:1280,height:800},{settings:{music:true,voice:false}});await p.getByRole('button',{name:'시작하기',exact:true}).click();
 await p.waitForFunction(()=>{const v=document.querySelector('.story-film video');return v&&!v.paused&&v.currentTime>1;},null,{timeout:20000});
 const s=await filmState(p);assert.equal(s.muted,true,'voice off → muted film');await p.waitForTimeout(500);const m=(await media(p)).filter(x=>x.tag==='AUDIO'&&/bgm/.test(x.src)&&!x.paused);
 assert.ok(m.length>=1,'voice off → app music keeps playing');report.push({voiceOff:{muted:s.muted,bgm:m}});
 await p.locator('.film-skip').click();await p.waitForURL(/#map/);
 // 다시 보기: 설정 「이 모험을 하는 이유 다시 보기」 → 영상 → 건너뛰기 → 연 화면(시작 화면)으로 돌아감
 await p.goto(QA+'/#home');await p.locator('.settings-button').click();await p.getByRole('button',{name:'이 모험을 하는 이유 다시 보기'}).click();await p.locator('.story-film video').waitFor();await p.locator('.film-skip').click();await p.waitForURL(/#home/);
 // 뒤로 가기: 영상 중 뒤로 → 영상이 남지 않고 배경음 복귀
 await p.goto(QA+'/#home');await p.locator('.settings-button').click();await p.getByRole('button',{name:'이 모험을 하는 이유 다시 보기'}).click();await p.locator('.story-film video').waitFor();await p.goBack();await p.waitForTimeout(800);
 console.log('ok voice-off+replay');assert.equal(await p.locator('.story-film').count(),0,'back leaves no film');report.push({back:p.url()});
 // 새로고침: 지도에서 새로고침해도 영상이 다시 뜨지 않는다
 await p.goto(QA+'/#map');await p.reload();await p.waitForTimeout(800);assert.equal(await p.locator('.story-film').count(),0,'reload on map shows no film');
 await ctx.close();
}
{ // 움직임 줄이기 → 예전 카드 화면(장면 끝 그림)
 const {ctx,p}=await page({width:1280,height:800},{settings:{reduceMotion:true}});await p.getByRole('button',{name:'시작하기',exact:true}).click();await p.locator('.story-card').waitFor();
 assert.equal(await p.locator('.story-film').count(),0);report.push({reduceMotion:await p.locator('img.scene-film').getAttribute('src')});await ctx.close();
}
console.log('ok reduce/back');
{ // 파이널: 마지막 과제를 끝낸 뒤 #ending → 영상 → 끝 → 인증서
 const {ctx,p}=await page({width:1280,height:800},{save:{introSeen:true,finaleCompleted:true},settings:{music:true,voice:true}});
 // finaleCompleted는 저장을 다시 읽을 때 모든 시설 완료로 다시 계산되므로, 메모리의 저장 값만 켜고 해시로 들어간다(실제 완료 흐름은 qa-learning이 본다).
 await p.evaluate(async()=>{const {store}=await import('/src/state.js');store.save.finaleCompleted=true;location.hash='#ending';});await p.locator('.story-film video').waitFor();await p.waitForFunction(()=>{const v=document.querySelector('.story-film video');return v&&v.readyState>=2;});
 const s=await filmState(p);await p.evaluate(()=>{const v=document.querySelector('.story-film video');v.currentTime=27.5;});await p.waitForTimeout(700);await p.screenshot({path:`${OUT}/final-1280x800.png`});
 await toEnd(p);await p.locator('.certificate').waitFor();report.push({final:s,afterEnd:p.url()});await ctx.close();
}
await browser.close();
assert.deepEqual(errors,[]);await fs.writeFile(`${OUT}/report.json`,JSON.stringify(report,null,1));
console.log('PASS films:',JSON.stringify(report.slice(0,1)),'… voice-off, replay, back, reload, reduced-motion, final→certificate, console 0');
