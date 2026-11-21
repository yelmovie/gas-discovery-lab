import {emphasizeConcept} from './concept-focus.js';
import { narration, attachVoice, voiceForText } from './game-voices.js';
import { voiceLines } from './voice-lines.js';
let welcomeCleanup = () => {};
import {APP,STAGES,STORY,stageById} from './data.js';
import {playStoryFilm} from './story-film.js';
import {store,persist,award,allComplete} from './state.js';
import {completeStage,isStageOpen,teacherRoute} from './model.js';
import {html,button,openDialog,portrait,prop,buddy,choices,escapeHTML,announce,holdButton,SOLI_IMAGE} from './ui.js';
import {icon} from './icons.js';
import {sound,syncAudio,unlockAudio,quietAudio,setScreenMusic} from './audio.js';
import {loadActivity,loadPlayMission,loadMapAssets,loadConceptVisuals,waitForScreen} from './screen-loaders.js';
import {refreshOffline} from './offline.js';
import {renderCertificate as certificateScreen} from './certificate.js';
import {rewardSlotsHtml,syncRewardSlots} from './map-reward-cards.js';
const loadSettings = () => import('./settings.js');
const app=document.querySelector('#app');let abort=new AbortController(),current={screen:'home'},returnFrom=null,storyReturn=null;
const pendingRestoration=new Set();
let mapAssets;
const mapCodeFailure = Symbol('map code failure');
const activityModules = new Map();
const npcNames={air:'에어',lumi:'루미',popo:'포포'};
// The achievement card slots (map-reward-cards.js) sit just before the sound button, on the map screen only.
function controls(){const nav=html(`<nav class="global-controls" aria-label="공통 메뉴"><div class="controls-left"><button class="icon-button home-button" aria-label="홈으로 가기">${icon('home')}</button><button class="icon-button back-button" aria-label="이전 화면으로 가기">${icon('back')}</button></div><div class="controls-right">${current.screen==='map'?rewardSlotsHtml(store.save.mapHits):''}<button class="icon-button sound-button" aria-label="전체 소리 끄기"></button><button class="icon-button settings-button" aria-label="설정">${icon('settings')}</button></div></nav>`);nav.querySelector('.home-button').onclick=()=>navigate({screen:'home'});nav.querySelector('.back-button').onclick=back;nav.querySelector('.sound-button').onclick=()=>{const s=store.save.settings,on=!(s.music||s.sfx||s.voice!==false);s.music=on;s.sfx=on;s.voice=on;persist();syncAudio(store.save.settings);if(!on)narration.stop();updateControls();if(on)sound();};nav.querySelector('.settings-button').onclick=async e=>{const button=e.currentTarget;try{const {openSettings}=await loadSettings();if(!button.isConnected||document.querySelector('dialog[open]'))return;openSettings({story:()=>{storyReturn={...current};navigate({screen:'story',index:0});},ending:()=>navigate({screen:'ending',index:0}),certificate:showCertificate,research:showResearch,reset:()=>navigate({screen:'home'}),updateControls,accessChanged:()=>{setTimeout(()=>navigate({screen:'map'},{replace:true}),0);}});}catch{if(button.isConnected)announce('설정을 불러오지 못했어요. 다시 눌러 주세요.');}};return nav;}
function updateControls(){document.documentElement.classList.toggle('reduce-motion',store.save.settings.reduceMotion===true);app.querySelector('.save-status')?.remove();if(store.demo||store.problem){const status=document.createElement('div');status.className='save-status';status.setAttribute('role','status');status.textContent=store.demo?'교사 시연 · 학생 기록은 바뀌지 않아요':store.problem;app.append(status);}if(app.querySelector('[data-reward-album]'))syncRewardSlots(store.save.mapHits);const b=app.querySelector('.sound-button');if(b){const on=store.save.settings.music||store.save.settings.sfx||store.save.settings.voice!==false;b.innerHTML=icon(on?'sound':'mute');b.setAttribute('aria-label',on?'전체 소리 끄기':'전체 소리 켜기');b.setAttribute('aria-pressed',String(on));}for(const name of ['home-button','back-button']){const b=app.querySelector('.'+name);if(b){b.disabled=current.screen==='home';b.title=b.disabled?'지금은 시작 화면이에요.':'';}}}
function back(){if(current.screen==='activity')navigate({screen:'stage',stageId:current.stageId});else if(current.screen==='stage'){returnFrom=current.stageId;navigate({screen:'map'});}else if(current.screen==='story'&&current.index>0)navigate({...current,index:current.index-1});else if(['finale','ending','certificate'].includes(current.screen))navigate({screen:'map'});else navigate({screen:'home'});}
function routeHash(route){if(route.screen==='activity')return `#stage/${route.stageId}/${route.index}`;if(route.screen==='stage')return `#stage/${route.stageId}`;return '#'+route.screen;}
function parseHash(){const parts=location.hash.slice(1).split('/');if(parts[0]==='stage'&&stageById(parts[1]))return {screen:parts[2]!==undefined?'activity':'stage',stageId:parts[1],index:Math.max(0,Math.min(3,Number(parts[2])||0))};if(['home','map','finale'].includes(parts[0]))return {screen:parts[0]};if(['story','ending','certificate'].includes(parts[0]))return {screen:parts[0],index:0};return {screen:'home'};}
// 브라우저 뒤로 가기(2026-11-21, 3-2a A): 기록을 세 층(시작 화면 0 · 지도·이야기 1 · 시설·활동·마지막 의뢰·엔딩·인증서 2)으로만 쌓는다.
// 뒤로 가기는 활동 → 지도 → 시작 화면 순서로 앱 안에서 움직이고, 시작 화면에서 한 번 더 누르면 평소처럼 나간다.
const historyDepth=route=>route.screen==='home'?0:['map','story'].includes(route.screen)?1:2;
let pendingRoute=null;
function navigate(route,{replace=false,fromHistory=false}={}){
  narration.stop(); welcomeCleanup(); welcomeCleanup = () => {};
 if(route.stageId){const index=STAGES.findIndex(s=>s.id===route.stageId);if(index<0||!isStageOpen(store.save,index))route={screen:'map'};else if(route.screen==='activity'&&!store.save.settings.adminUnlockAll){const first=STAGES[index].tasks.findIndex(t=>!store.save.evidence[route.stageId].some(e=>e.taskId===t.id));if(first>=0&&route.index>first)route.index=first;}}
 const depth=historyDepth(route),at=Number.isInteger(history.state?.depth)?history.state.depth:0;
 if(!fromHistory&&depth<at){pendingRoute=route;history.go(depth-at);return;}
 abort.abort();abort=new AbortController();current={...route};const hash=routeHash(current);
 if(!fromHistory){if(depth>at){if(at===0&&depth===2)history.pushState({screen:'map',depth:1},'','#map');history.pushState({...current,depth},'',hash);}else if(location.hash!==hash||history.state?.depth!==depth)history.replaceState({...current,depth},'',hash);}
 else if(location.hash!==hash)history.replaceState({...current,depth:at},'',hash);
 if(['activity','stage','map'].includes(current.screen)){store.save.last={...current};persist();}
 document.body.classList.toggle('title-font',current.screen==='home');
 app.replaceChildren();const screen=html(`<section class="screen ${current.screen}-screen" aria-label="${APP.name}"></section>`);app.append(screen,controls());updateControls();document.title=current.stageId?`${stageById(current.stageId).name} · ${APP.name}`:APP.name;
 quietAudio(false);setScreenMusic(['ending','certificate'].includes(current.screen)?'finale':'main');
 if(current.screen==='home')showHome(screen);else if(current.screen==='story')showStory(screen,current.index||0);else if(current.screen==='map')showMap(screen,abort.signal);else if(current.screen==='stage')showStage(screen,stageById(current.stageId));else if(current.screen==='activity')enterActivity(screen,stageById(current.stageId),current.index||0,abort.signal);else if(current.screen==='finale')showFinale(screen);else if(current.screen==='ending')showEnding(screen,current.index||0);else if(current.screen==='certificate')renderCertificate(screen);
 if(current.screen==='home'){
  const panel=html('<section class="npc-welcome-voice"><small>AI 생성 음성</small><p></p></section>');
  panel.querySelector('p').textContent=voiceLines.find(l=>l.id==='welcome').text;
  screen.querySelector('.title-copy').append(panel); welcomeCleanup=attachVoice(panel,'welcome',abort.signal,false);
 } else if(current.screen==='story')attachVoice(screen.querySelector('.story-card'),`story-${(current.index||0)+1}`,abort.signal);
 else if(current.screen==='stage')attachVoice(screen.querySelector('.stage-brief > p'),`brief-${current.stageId}`,abort.signal);
 else if(current.screen==='ending')attachVoice(screen.querySelector('.ending-copy'),`ending-${(current.index||0)+1}`,abort.signal);
 else if(current.screen==='certificate')attachVoice(screen.querySelector('.certificate-options'),'certificate',abort.signal);
 if(store.save.settings.adminUnlockAll&&TEACHER_SCREENS.includes(current.screen)&&current.screen!=='activity'){
  screen.classList.add('teacher-mode');
  app.append(teacherDock());
 }
 if(current.screen!=='map')requestAnimationFrame(()=>screen.querySelector('h1')?.focus({preventScroll:true}));
}
function loading(host, text) {
 host.innerHTML='<div class="map-loading"><span class="boot-orbit" aria-hidden="true"></span><p role="status"></p></div>';
 host.querySelector('[role="status"]').textContent=text;
}
function loadError(host, title, kind, retry, direct) {
 const focus=host.contains(document.activeElement)||document.activeElement===document.body;
 host.innerHTML='<section class="screen-load-error"><div class="lab-panel"><h1 tabindex="-1"></h1><p role="alert">저장한 탐구 기록은 그대로예요.</p><div class="screen-load-actions"></div></div></section>';
 host.dataset.screenLoad=kind;
 host.querySelector('h1').textContent=title;
 const actions=host.querySelector('.screen-load-actions');
 actions.append(button('다시 열기',retry,direct?'button secondary':'button primary'));
 if(direct)actions.append(button(direct.label,direct.open));
 if(focus)host.querySelector('h1').focus({preventScroll:true});
}
function nextMapActivity() {
 const stage=STAGES.find((s,i)=>isStageOpen(store.save,i)&&!completeStage(store.save,s.id));
 if(!stage)return {label:'중앙 공기 코어로 가기',open:()=>navigate({screen:'finale'})};
 const index=stage.tasks.findIndex(t=>!store.save.evidence[stage.id].some(e=>e.taskId===t.id));
 return {label:stage.id==='flow'&&index===0?'첫 실험 시작':`${stage.name} 의뢰 시작`,open:()=>{returnFrom=stage.id;navigate({screen:'activity',stageId:stage.id,index});}};
}
// 3초 규칙: 시설 소개는 처음 들어갈 때 한 번만. 이미 시작한 시설은 지도에서 바로 다음 의뢰로 들어간다.
function mapEntry(id) {
 const stage=stageById(id),records=store.save.evidence[id];
 if(!records.length||completeStage(store.save,id))return {screen:'stage',stageId:id};
 return {screen:'activity',stageId:id,index:Math.max(0,stage.tasks.findIndex(t=>!records.some(e=>e.taskId===t.id)))};
}
async function showMap(host, signal) {
 loading(host,'마을로 가는 길을 준비해요…');
 const request=new AbortController();
 const cancel=()=>request.abort();
 signal.addEventListener('abort',cancel,{once:true});
 const code=waitForScreen(import('./map.js'),request.signal).catch(()=>{throw mapCodeFailure;});
 const assets=(mapAssets?Promise.resolve(mapAssets):loadMapAssets(SOLI_IMAGE,request.signal));
 try{
  const [module,loaded]=await Promise.all([code,assets]);
  if(signal.aborted)return;
  module.mountMap(host,{signal,save:store.save,persist,returnFrom,takeRestorations:()=>{if(store.demo)return [];const ids=[...pendingRestoration];pendingRestoration.clear();return ids;},enter:id=>{returnFrom=id;navigate(id==='core'?{screen:'finale'}:mapEntry(id));}},loaded);
  mapAssets=loaded;
 }catch(error){
  if(signal.aborted)return;
  const kind=error===mapCodeFailure?'code':'assets';
  mapAssets=undefined;
  loadError(host,'지도를 불러오지 못했어요',kind,kind==='code'?()=>location.reload():()=>navigate({screen:'map'},{replace:true}),nextMapActivity());
 }finally{
  signal.removeEventListener('abort',cancel);
  request.abort();
 }
}
async function enterActivity(host, stage, index, signal) {
 let module=activityModules.get(stage.id);
 if(!module){
  loading(host,'실험 도구를 준비해요…');
  try{module=await waitForScreen(loadActivity(stage.id),signal);}
  catch{
   if(!signal.aborted)loadError(host,'실험을 불러오지 못했어요','activity',()=>location.reload());
   return;
  }
  if(signal.aborted)return;
  activityModules.set(stage.id,module);
 }
 const focus=document.activeElement===document.body||host.contains(document.activeElement);
 showActivity(host,stage,index,module);
 if(store.save.settings.adminUnlockAll){
  host.classList.add('teacher-mode');
  const quick=button(`${icon('skip')}<span>교사 이동</span>`,()=>{const d=openDialog('교사용 빠른 이동',teacherDock());d.classList.add('teacher-nav-dialog');d.querySelectorAll('[data-move]').forEach(b=>{const go=b.onclick;b.onclick=()=>{d.close();go();};});},'button secondary teacher-menu-button');
  quick.setAttribute('aria-label','교사용 빠른 이동');
  host.querySelector('.utility-tools').append(quick);
 }
 if(focus)host.querySelector('h1')?.focus({preventScroll:true});
}
async function openConcept(stage,task,options) {
 try{
  const [module]=await waitForScreen(Promise.all([import('./concepts.js'),loadConceptVisuals()]),options.signal);
  if(!options.signal.aborted&&!document.querySelector('dialog[open]'))module.openConcept(stage,task,options);
 }catch{if(!options.signal.aborted)announce('개념 영상을 열지 못했어요. 새로고침한 뒤 다시 열어 주세요.');}
}
function missionEntry(){
 const entry=button('공기 장치 미션',async()=>{
  if(entry.hasAttribute('aria-busy'))return;
  const {signal}=abort;
  entry.setAttribute('aria-busy','true');
  try{
   const open=await waitForScreen(loadPlayMission(),signal);
   if(entry.isConnected&&!document.querySelector('dialog[open]'))open();
  }catch{if(!signal.aborted)announce('공방을 열지 못했어요. 새로고침한 뒤 다시 열어 주세요.');}
  finally{entry.removeAttribute('aria-busy');}
 },'play-mission-entry');
 return entry;
}
// Teacher unlock: step through every facility and task without playing them (← → step, ↑ ↓ facility).
const TEACHER_SCREENS=['stage','activity','finale'],TEACHER_KEYS={ArrowLeft:'prev',ArrowRight:'next',ArrowUp:'prevStage',ArrowDown:'nextStage'};
function teacherGo(move){const route=teacherRoute(current,move);if(route.screen==='map')returnFrom=current.stageId;sound();navigate(route);}
function teacherDock(){
 const stage=current.stageId&&stageById(current.stageId),where=current.screen==='activity'?`${stage.name} · 의뢰 ${current.index+1} / 4`:current.screen==='stage'?`${stage.name} · 시설 안내`:'마지막 의뢰 · 공기 코어';
 const key=(move,label,hint)=>`<button type="button" class="teacher-key" data-move="${move}" aria-label="${label} (${hint})" title="${label} · ${hint}">${icon('arrow')}</button>`;
 const dock=html(`<aside class="teacher-dock" aria-label="교사용 빠른 이동"><div class="teacher-pad" role="group" aria-label="교사용 방향키"><div class="teacher-keys">${key('prevStage','이전 시설','위쪽 방향키')}${key('prev','이전 단계','왼쪽 방향키')}${key('nextStage','다음 시설','아래쪽 방향키')}${key('next','다음 단계','오른쪽 방향키')}</div><div class="teacher-legend"><span>← → 단계</span><span>↑ ↓ 시설</span></div></div><div class="teacher-skip"><div class="teacher-where"><span>교사용 빠른 이동</span><strong>${where}</strong></div><div class="teacher-skip-actions"><button type="button" class="button secondary small" data-move="nextStage">다음 시설</button><button type="button" class="button gold teacher-next" data-move="next">${current.screen==='finale'?'마지막 단계예요':'다음 단계로'} ${icon('skip')}</button></div></div></aside>`);
 dock.querySelectorAll('[data-move]').forEach(b=>b.onclick=()=>teacherGo(b.dataset.move));
 if(current.screen==='finale')dock.querySelectorAll('[data-move^="next"]').forEach(b=>b.disabled=true);
 return dock;
}
window.addEventListener('keydown',e=>{const move=TEACHER_KEYS[e.key];if(!move||!store.save.settings.adminUnlockAll||!TEACHER_SCREENS.includes(current.screen))return;if(e.defaultPrevented||e.altKey||e.ctrlKey||e.metaKey||document.querySelector('dialog[open]')||e.target.closest?.('input,textarea,select,[role="slider"],[contenteditable="true"]'))return;if(current.screen==='finale'&&move.startsWith('next'))return;e.preventDefault();teacherGo(move);});
const conversationFriends = [
 ['air','여우 발명가 에어',[['처음 만나요','title-buddy'],['바람 동력소','stage-flow']]],
 ['lumi','고양이 연구원 루미',[['공기의 무게','stage-weight'],['온도와 부피','stage-climate']]],
 ['popo','다람쥐 관제원 포포',[['기체 배송소','stage-delivery'],['기체 고르기','retry-delivery-gas']]],
 ['soli','바람여우 솔이',[['다음 목적지','map-next-flow'],['다시 움직이는 마을','map-done']]]
];
function conversationPortrait(npc) {
 if(npc==='soli')return `<img class="npc-art-frame npc-art-still" src="${SOLI_IMAGE}" alt="" draggable="false">`;
 return `<div class="npc-art-frame" aria-hidden="true" style="--npc-sprite:url('/assets/npc-dialogue/${npc}.webp')"></div>`;
}
function showNpcConversations(){
 const dialog=openDialog('기체 도시 친구들과 이야기',`<section class="npc-conversation"><div class="npc-conversation-tabs" role="group" aria-label="만날 친구"></div><div class="npc-dialogue-grid"></div></section>`,{wide:true});
 dialog.classList.add('npc-hub-dialog');
 const tabs=dialog.querySelector('.npc-conversation-tabs'),body=dialog.querySelector('.npc-dialogue-grid');
 let picked=0,topic=0,releaseVoice=()=>{};
 conversationFriends.forEach(([,name],i)=>tabs.append(button(name,()=>{picked=i;topic=0;show(true,true);},'npc-tab')));
 function show(autoplay,keepTab=false){
  releaseVoice();narration.stop();
  const [sprite,name,topics]=conversationFriends[picked],line=voiceLines.find(item=>item.id===topics[topic][1]);
  [...tabs.children].forEach((b,i)=>b.setAttribute('aria-pressed',String(i===picked)));
  body.innerHTML=`${conversationPortrait(sprite)}<div class="npc-dialogue-copy"><h3>${name}</h3><p>${escapeHTML(line.text)}</p><div class="npc-conversation-topics" role="group" aria-label="이야기 주제"></div><div class="npc-conversation-voice"></div></div>`;
  const topicGroup=body.querySelector('.npc-conversation-topics');
  topics.forEach(([label],i)=>{
   const b=button(label,()=>{topic=i;show(true);},'npc-topic');
   b.setAttribute('aria-pressed',String(i===topic));
   topicGroup.append(b);
  });
  releaseVoice=attachVoice(body.querySelector('.npc-conversation-voice'),line.id,abort.signal,autoplay)??(()=>{});
  if(!keepTab&&autoplay)topicGroup.children[topic]?.focus({preventScroll:true});
 }
 dialog.addEventListener('close',()=>{releaseVoice();narration.stop();},{once:true});
 show(true,true);
}
function showHome(host){host.classList.add('title-v2');host.innerHTML=`<div class="title-backdrop"></div><div class="title-vignette"></div><div class="title-bubbles" aria-hidden="true">${'<i></i>'.repeat(9)}</div><div class="title-copy"><div class="title-kicker">${icon('leaf')}에어와 솔이의 공기 탐험</div><img class="game-logo" src="/assets/logo.webp" alt="기체 도시 대작전"><p class="title-tagline">멈춰 버린 공기 코어를 깨워 줘!</p><p class="title-lead">관찰하고, 비교하고, 직접 만든 장치로<br>다섯 연구시설과 우리 마을을 되살려요.</p><div class="title-actions"></div><div class="title-save-hint">나의 탐구는 이 브라우저에 남아요</div></div><div class="title-characters"><img class="title-air" src="/assets/air-portrait.webp" alt="여우 발명가 에어"><img class="title-soli" src="${SOLI_IMAGE}" alt="바람여우 솔이"></div><button class="title-buddy" aria-label="에어와 친구들의 이야기 듣기">에어와 친구들 이야기 ${icon('arrow')}</button><p class="title-credit">기획·제작: 옐샘 & ⓒ 아이스크림미디어</p>`;const actions=host.querySelector('.title-actions');const hasProgress=STAGES.some(s=>store.save.evidence[s.id].length)||store.save.introSeen;actions.append(button(`${hasProgress?'모험 이어가기':'탐험 시작'} ${icon('arrow')}`,()=>{if(store.save.introSeen)navigate(store.save.last?.screen?store.save.last:{screen:'map'});else{storyReturn=null;navigate({screen:'story',index:0});}},'button primary start-button'));if(hasProgress)actions.append(button('처음 이야기 보기',()=>{storyReturn=null;navigate({screen:'story',index:0});},'button secondary'));actions.append(missionEntry());host.querySelector('.title-buddy').onclick=showNpcConversations;if(store.problem)openDialog('탐구 기록 안내',`<p>${escapeHTML(store.problem)}</p>`);}
// 인트로·파이널 장면 영상(2026-11-21): Google Flow(Veo)로 만든 8초 장면을 배경으로 틀고, 글(자막)과 목소리는 지금처럼 앱이 맡는다.
// 영상은 소리 없이 한 번 재생하고 마지막 장면에서 멈춘다. 움직임 줄이기면 마지막 장면 그림만, 영상을 못 열면 예전 그림으로 돌아간다.
function filmMarkup(name){return `<img class="scene-background scene-film" src="/assets/films-story/${name}-end.jpg" alt="">`;}
// 한 편 영상: 움직임 줄이기이거나 영상을 못 열었으면(filmFailed) 예전 카드 화면을 쓴다.
const filmFailed={};
const stillMode=()=>store.save.settings.reduceMotion===true||matchMedia('(prefers-reduced-motion: reduce)').matches;
function filmLines(ids){return ids.map(id=>voiceLines.find(l=>l.id===id)).filter(Boolean).map(l=>`${l.speaker}: ${l.text}`).join(' ');}
function tryFilm(host,name,label,ids,route,onEnd){if(filmFailed[name]||stillMode())return false;playStoryFilm(host,{name,label,transcript:filmLines(ids),voiceOff:store.save.settings.voice===false,signal:abort.signal,onEnd,onFail:()=>{filmFailed[name]=true;navigate(route,{replace:true});}});return true;}
function startFilm(host,fallback){host.classList.add('has-film');const v=host.querySelector('video.scene-film');if(!v)return;v.muted=true;v.addEventListener('error',()=>{const img=document.createElement('img');img.className='scene-background';img.src=fallback;img.alt='';v.replaceWith(img);host.classList.remove('has-film');},{once:true});v.play().catch(()=>{});}
function showStory(host,index){if(index===0&&tryFilm(host,'intro','이야기 영상: 기체 도시 대작전',['story-1','story-2','story-3','film-invite'],{screen:'story',index:0},()=>{store.save.introSeen=true;persist();const target=storyReturn||{screen:'map'};storyReturn=null;navigate(target);}))return;const shot=STORY[index];host.innerHTML=`${filmMarkup(`intro-${index+1}`)}<div class="scene-shade"></div><div class="story-layout">${conversationPortrait(shot.npc)}<div class="story-card lab-panel"><div class="eyebrow">${npcNames[shot.npc]}의 편지</div><h1 tabindex="-1">${shot.title}</h1><p>${shot.text}</p><div class="story-actions"></div></div></div>`;host.querySelector('.story-actions').append(button(index<2?`다음 이야기 ${icon('arrow')}`:`마을로 출발 ${icon('arrow')}`,()=>{if(index<2)navigate({screen:'story',index:index+1});else{store.save.introSeen=true;persist();const target=storyReturn||{screen:'map'};storyReturn=null;navigate(target);}}));startFilm(host,`/assets/${shot.image}.webp`);}
function showStage(host,stage){const records=store.save.evidence[stage.id],done=completeStage(store.save,stage.id),nextIndex=stage.tasks.findIndex(t=>!records.some(e=>e.taskId===t.id));host.innerHTML=`<img class="scene-background" src="/assets/${stage.id}.webp" alt=""><div class="scene-shade"></div><div class="stage-intro"><div class="stage-character">${conversationPortrait(stage.npc)}<span>${npcNames[stage.npc]}</span></div><section class="stage-brief lab-panel"><div class="eyebrow">${stage.name}</div><h1 tabindex="-1">${stage.chapter}</h1><p>${emphasizeConcept(stage.description,stage.keyTerms)}</p><div class="stage-tasks"></div><div class="stage-reward-note">${icon('star')} ${stage.reward}</div><div class="stage-start"></div></section></div>`;
 if(records.length){const replay=button('발견한 개념 다시 보기',()=>{const learned=stage.tasks.filter(t=>records.some(e=>e.taskId===t.id));const menu=html('<div class="concept-library"></div>');const d=openDialog('나의 개념 영상',menu);for(const t of learned)menu.append(button(t.title,()=>{d.close();openConcept(stage,t,{signal:abort.signal});},'button secondary'));},'button secondary concept-revisit');host.querySelector('.stage-reward-note').replaceWith(replay);}
 const list=host.querySelector('.stage-tasks');stage.tasks.forEach((t,i)=>{const completed=records.some(e=>e.taskId===t.id),open=store.save.settings.adminUnlockAll||i===0||records.some(e=>e.taskId===stage.tasks[i-1].id);const teacher=store.save.settings.adminUnlockAll,current=!completed&&i===nextIndex;
  // 같은 일을 하는 버튼을 겹치지 않게: 다음 의뢰는 아래 '의뢰 시작' 하나로만 들어가고, 목록은 진행 상태를 보여 준다. 끝낸 의뢰만 다시 열 수 있다.
  if(completed||teacher){const b=button(`<span class="task-marker">${completed?icon('check'):String(i+1).padStart(2,'0')}</span><span>${t.title}</span>${completed?'<span class="task-again">다시</span>':icon('arrow')}`,()=>navigate({screen:'activity',stageId:stage.id,index:i}),`stage-task ${completed?'done':''}`);list.append(b);}
  else list.append(html(`<div class="stage-task ${current?'current':'locked'}"><span class="task-marker">${String(i+1).padStart(2,'0')}</span><span>${escapeHTML(t.title)}</span>${current?'<span class="task-now">지금</span>':icon('lock')}</div>`));});host.querySelector('.stage-start').append(button(`${done?'다른 방법으로 다시 탐구':'의뢰 시작'} ${icon('arrow')}`,()=>navigate({screen:'activity',stageId:stage.id,index:done?0:Math.max(0,nextIndex)})));if(['flow','engineering'].includes(stage.id))host.querySelector('.stage-start').append(missionEntry());}
function showActivity(host,stage,index,{mount,mountPlayer}){
 const task=stage.tasks[index];host.classList.add('activity-screen');host.dataset.stage=stage.id;
 host.innerHTML=`<img class="scene-background" src="/assets/${stage.id}.webp" alt=""><div class="activity-shade"></div><header class="mission-heading"><div class="eyebrow">${stage.name} · ${index+1} / 4${store.demo?' · 교사 시연':''}</div><h1 tabindex="-1">${task.title}</h1></header><div class="activity-host"></div><footer class="mission-rail"><div class="mission-guide"><img class="mission-npc" src="/assets/${stage.npc}-portrait.webp" alt="${npcNames[stage.npc]}" draggable="false"><span class="mission-step">다음</span><span class="mission-direction" id="next-action-guide">${task.goal}</span></div><div class="activity-actions"><div class="playback-controls"></div><div class="utility-tools"></div></div></footer>`;
 let completing=false,hints=[task.goal,'한 조건씩 바꾸고, 달라진 모습을 살펴봐요.','결과가 예상과 달라도 괜찮아요. 바꾼 조건을 다시 확인해요.'];
 const direction=host.querySelector('.mission-direction');
 const nextAction=selectors=>{host.querySelectorAll('.is-next-action').forEach(el=>el.classList.remove('is-next-action'));for(const selector of Array.isArray(selectors)?selectors:[selectors])if(selector)host.querySelectorAll(selector).forEach(el=>el.classList.add('is-next-action'));};
 const player=mountPlayer(host,{signal:abort.signal,onInstruction:text=>{narration.stop();direction.textContent=text;},onTargets:nextAction});
 const context={signal:abort.signal,terms:stage.keyTerms,draft:store.save.drafts[task.id],
  playback:spec=>player.configure(spec),nextAction,getPlaybackSpeed:()=>player.speed,
  saveDraft:draft=>{if(completing||context.signal.aborted)return;store.save.drafts[task.id]=draft;persist();},
  guide:(step,text,newHints)=>{host.dataset.step=step;if(player.state!=='running'){host.querySelector('.mission-step').textContent=/^\d/.test(step)?step[0]+'단계':'다음';direction.innerHTML=emphasizeConcept(text,stage.keyTerms);voiceForText(direction,text,abort.signal);}if(newHints)hints=newHints;},
  complete:(summary,details)=>{if(completing||context.signal.aborted)return;completing=true;narration.stop();player.complete();nextAction([]);const alreadyComplete=completeStage(store.save,stage.id);award(stage,task,summary,details);sound('award');
   const finished=completeStage(store.save,stage.id);
   if(finished&&!alreadyComplete&&!store.demo)pendingRestoration.add(stage.id);
   const nextIndex=index<stage.tasks.length-1?index+1:stage.tasks.findIndex(t=>!store.save.evidence[stage.id].some(e=>e.taskId===t.id));
   delete store.save.drafts[task.id];store.save.last=nextIndex>=0?{screen:'activity',stageId:stage.id,index:nextIndex}:{screen:'map'};persist();
   const nextLabel=nextIndex>=0?'다음 의뢰 시작':'마을 변화 보러 가기';
   let proceeding=false;const proceed=()=>{if(proceeding||context.signal.aborted)return;proceeding=true;if(nextIndex>=0)navigate({screen:'activity',stageId:stage.id,index:nextIndex});else{returnFrom=stage.id;navigate({screen:'map'});}};
   const review=()=>openConcept(stage,task,{signal:context.signal,reward:`${finished?stage.badge:'탐구 증거 저장 완료'} · ${store.save.evidence[stage.id].length} / 4`,nextLabel,onNext:proceed});
   const slot=host.querySelector('.evidence-slot')||host.querySelector('.transfer-slot');
   const result=html(`<section class="discovery-result" aria-label="탐구 완료"><div class="discovery-label">${icon(finished?'star':'check')} ${finished?escapeHTML(stage.badge):details?.firstTry===false?'다시 살펴보고 찾았어요!':'발견 성공!'} · ${store.save.evidence[stage.id].length} / 4${details?.firstTry===true?`<span class="first-try-mark">${icon('star')} 한 번에 찾았어요!</span>`:''}</div><p>${emphasizeConcept(summary,stage.keyTerms)}</p><div class="completed-actions"></div></section>`);
   const actions=result.querySelector('.completed-actions');actions.append(button(`${nextLabel} ${icon('arrow')}`,proceed),button('개념 영상 보기',review,'button secondary'));
   if(slot)slot.replaceChildren(result);else host.querySelector('.activity-host').append(result);
   host.querySelector('.playback-controls').replaceWith(actions);
   host.classList.add('activity-complete');host.querySelectorAll('.activity-feedback').forEach(el=>el.hidden=true);
   host.querySelector('.mission-step').textContent='완료';host.querySelector('.mission-direction').textContent=nextIndex>=0?stage.tasks[nextIndex].title:stage.bridge;
   if(nextIndex<0)attachVoice(actions,`bridge-${stage.id}`,abort.signal);
   hints=[summary,finished?stage.reward:'발견한 증거가 연구 가방에 남았어요. 다음 의뢰에서도 활용해 봐요.'];
   host.querySelectorAll('.mission-progress i')[index]?.classList.add('done');result.tabIndex=-1;result.focus({preventScroll:true});announce(`발견 성공! ${summary}`);
    actions.firstElementChild?.classList.add('is-next-action','success-next');
    const burst=html(`<div class="success-burst" aria-hidden="true"><div class="success-stamp">${icon('star')}<strong>${finished?'시설 복구!':'발견 성공!'}</strong><span>${escapeHTML(stage.evidence)} ${store.save.evidence[stage.id].length} / 4</span></div></div>`);
    host.append(burst);setTimeout(()=>burst.remove(),2100);
  }};
 try{mount(host.querySelector('.activity-host'),task,context);}catch(error){host.querySelector('.activity-host').replaceChildren(html('<div class="lab-panel load-error"><h2>활동을 다시 준비할게요</h2><p>탐구 기록은 그대로예요.</p></div>'));host.querySelector('.load-error').append(button('의뢰 다시 열기',()=>navigate({...current},{replace:true})));console.error(error);}
 const feedbackObserver=new MutationObserver(records=>{if(completing||player.state==='running')return;const changed=records.filter(r=>r.target.nodeType===1&&(r.target.matches?.('.activity-feedback')||r.target.closest?.('.activity-feedback')));if(changed.length){const text=host.querySelector('.activity-feedback:not(:empty)')?.textContent.trim();if(text)direction.textContent=text;}});
 feedbackObserver.observe(host.querySelector('.activity-host'),{childList:true,subtree:true,characterData:true});
 context.signal.addEventListener('abort',()=>feedbackObserver.disconnect(),{once:true});
 const hint=buddy('soli',()=>hints,(el,text)=>voiceForText(el,text,abort.signal));hint.querySelector('.buddy-label').textContent='힌트';host.querySelector('.utility-tools').append(hint);
}
function showResearch(){const body=html(`<div class="research-book">${STAGES.map(stage=>`<section><h3>${stage.name}</h3><p class="microcopy">${stage.evidence} · ${store.save.evidence[stage.id].length} / 4</p>${store.save.evidence[stage.id].length?store.save.evidence[stage.id].map(e=>`<details><summary>${stage.tasks.find(t=>t.id===e.taskId).title}</summary><p>${emphasizeConcept(e.summary,stage.keyTerms)}</p>${e.firstObservation&&e.firstObservation.date!==e.date?`<p class="microcopy">첫 탐구: ${escapeHTML(e.firstObservation.summary)}</p>`:''}${e.details.before?`<p>처음 ${Number(e.details.before.mass).toFixed(2)} g → 바꾼 뒤 ${Number(e.details.after.mass).toFixed(2)} g</p>`:''}</details>`).join(''):'<p>탐구를 마치면 내 기록이 여기에 남아요.</p>'}</section>`).join('')}</div>`);const footer=html('<div></div>');const dialog=openDialog('나의 연구 가방',body,{wide:true,footer});footer.append(button('기록 내려받기',async()=>{try{(await loadSettings()).exportResearch();}catch{announce('연구 기록을 내려받지 못했어요. 다시 눌러 주세요.');}},'button secondary'));}
function showFinale(host){loadConceptVisuals().catch(()=>{});const demo=store.demo===true;host.innerHTML=`<img class="scene-background" src="/assets/ending.webp" alt=""><div class="scene-shade"></div><div class="finale-layout"><div class="core-visual"><img class="core-apparatus" src="/assets/visuals/air-core.webp" alt="여러 시설로 공기를 나누어 보내는 중앙 공기 코어"></div><section class="lab-panel finale-panel"><div class="eyebrow">마지막 의뢰 ${demo?'· 시연':''}</div><h1 tabindex="-1">공기 코어를 <br>다시 움직여요</h1><div class="finale-body"></div></section></div>`;
 const contextSignal=abort.signal,body=host.querySelector('.finale-body');if(!allComplete()&&!demo){body.innerHTML='<p>다섯 연구시설의 의뢰를 마치고 탐구 증거를 모아 주세요.</p>';body.append(button('마을로 돌아가기',()=>navigate({screen:'map'})));return;}
 body.innerHTML=`<p>${demo?'시연용 예시 자료예요. 학생의 완료 기록이나 인증서는 만들지 않아요.':'다섯 증거가 모였어요! 내 장치로 코어를 움직여요.'}</p><div class="final-evidence"></div><div class="final-action"></div>`;
 if(!demo)attachVoice(body.querySelector('p'),'finale-ready',abort.signal);
 STAGES.forEach(stage=>{const evidence=store.save.evidence[stage.id];body.querySelector('.final-evidence').append(html(`<details class="evidence-detail"><summary class="evidence-review checked">${icon('check')}<span>${stage.evidence}</span>${icon('book')}</summary><p>${escapeHTML(evidence.at(-1)?.summary||'시연용 예시: 조건을 바꾸어 관찰하고 증거를 확인했어요.')}</p></details>`));});
 body.querySelector('.final-action').append(button(`내 장치 연결하기 ${icon('arrow')}`,()=>repair(),'button gold begin-repair'));
 function repair(){
  narration.stop();
  const design=store.save.evidence.engineering.find(e=>e.taskId==='engineering-4')?.details?.design;
  body.innerHTML=`<p>${demo?'예시 장치를 연결했어요.':'공기 공작소에서 만든 내 장치를 연결했어요.'}</p><div class="final-design">${prop(design?.source==='pump'?'pump':'balloon')}${icon('arrow')}${prop('nozzle')}${icon('arrow')}<img class="prop" src="/assets/visuals/air-core.webp" alt="중앙 공기 코어"></div><div class="final-supply"></div><div class="air-gauge"><i></i></div><div class="final-status" role="status">버튼을 꾹 누르고 있으면 공기가 코어까지 모여요.</div><div class="final-lever"></div>`;
  const gauge=body.querySelector('.air-gauge i'),status=body.querySelector('.final-status');
  let charged=false,restored=false;
  const supply=button('꾹 눌러 공기 보내기',()=>{},'button primary final-pump');body.querySelector('.final-supply').append(supply);
  
  holdButton(supply,p=>{gauge.style.width=`${p*100}%`;},()=>{
   if(charged||contextSignal.aborted)return;charged=true;supply.disabled=true;supply.textContent='공기 공급 완료';host.querySelector('.core-apparatus').classList.add('core-active');status.textContent='코어까지 공기가 도착했어요! 마지막 레버를 당겨요.';attachVoice(status,'finale-charged',abort.signal);sound('success');
   body.querySelector('.final-lever').append(button(`복구 레버 당기기 ${icon('arrow')}`,()=>{if(restored||contextSignal.aborted)return;restored=true;if(!demo){if(!store.save.finaleCompleted)pendingRestoration.add('core');store.save.finaleCompleted=true;persist();}sound('award');if(demo)openDialog('시연이 끝났어요','<p>예시 장치가 코어를 움직였어요. 실제 탐구 기록은 바뀌지 않았어요.</p>');else navigate({screen:'ending',index:0});},'button gold repair-lever'));
  },contextSignal);
 }

}
const ENDING=[{title:'바람이 다시 흐르기 시작했어요',text:'직접 이은 관을 따라 공기가 흐르고, 멈췄던 시설이 다시 움직여요.'},{title:'내 증거가 마을을 바꾸었어요',text:'무게를 재고, 부피를 비교하고, 기체의 쓰임을 찾았어요. 다섯 연구시설이 모두 빛나요.'},{title:'이제 나는 공기 엔지니어!',text:'예측하고, 해 보고, 결과를 바꾸어 보았어요. 새로운 문제도 근거를 찾아 해결할 수 있어요.'}];
function showEnding(host,index){if(!store.save.finaleCompleted){navigate({screen:'map'},{replace:true});return;}if(index===0&&tryFilm(host,'final','마무리 영상: 우리가 해냈어요',['ending-1','ending-2','ending-3','film-cheer'],{screen:'ending',index:0},showCertificate))return;const shot=ENDING[index];host.innerHTML=`${filmMarkup(`final-${index+1}`)}<div class="ending-glow"></div><div class="ending-copy lab-panel"><div class="eyebrow">우리의 마을이 살아났어요</div><h1 tabindex="-1">${shot.title}</h1><p>${shot.text}</p><div class="ending-actions"></div></div><div class="ending-friends">${portrait('air')}${portrait('lumi')}${portrait('popo')}</div>`;host.querySelector('.ending-actions').append(button(index<2?'다음 장면':'나의 인증서 만들기',()=>index<2?navigate({screen:'ending',index:index+1}):showCertificate()));startFilm(host,'/assets/ending.webp');}
function showCertificate(){if(!store.save.finaleCompleted)return;navigate({screen:'certificate'});}
function renderCertificate(host){certificateScreen(host,navigate);}
window.addEventListener('popstate',()=>{if(pendingRoute){const route=pendingRoute;pendingRoute=null;navigate(route,{replace:true});return;}navigate(parseHash(),{fromHistory:true});});
document.addEventListener('pointerdown',()=>unlockAudio(store.save.settings),{once:true});
document.addEventListener('keydown',()=>unlockAudio(store.save.settings),{once:true});
window.addEventListener('error',()=>announce('화면이 멈추었다면 새로고침해 주세요. 저장한 탐구 기록은 남아 있어요.'));
function viewport(){document.documentElement.style.setProperty('--viewport-height',`${window.innerHeight}px`);if(!document.activeElement?.matches('input'))document.documentElement.classList.toggle('portrait-display',window.innerWidth<700&&window.innerHeight>window.innerWidth);}
viewport();window.addEventListener('resize',viewport);
const appURL=new URL(location.href);
if(appURL.searchParams.has('_classroom-update')){
 appURL.searchParams.delete('_classroom-update');
 history.replaceState(history.state,'',appURL);
}
{const route=parseHash(),depth=historyDepth(route);if(depth>0&&!Number.isInteger(history.state?.depth)){history.replaceState({screen:'home',depth:0},'','#home');if(depth===2)history.pushState({screen:'map',depth:1},'','#map');history.pushState({...route,depth},'',routeHash(route));}navigate(route,{fromHistory:true});}
refreshOffline();

window.addEventListener('gas-save-status',updateControls);
