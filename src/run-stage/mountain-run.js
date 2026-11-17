// 「높은 산의 과자 봉지」 3D 산길. 무대·캐릭터·입력·겹침 화면을 맡고, 기록과 완료는 mountain-rules와 기존 ctx로 넘긴다.
// 봉지 크기는 걸은 높이에 따라 보이기만 하고, 저장되는 값은 두 관측 지점의 모형 값뿐이다.
import * as THREE from '/assets/vendor/three/three.module.min.js';
import {COURSE,PREDICTIONS,restoreRun,recordStation,readyToCompare,runDraft,bagRatio,observedChange,createRunner,advanceRunner,stationAt,heightFraction,patrolX,touchPatrol,groundAt,obstacleAhead} from './mountain-rules.js';
import {volumeFor} from '../model.js';
import {bindDirectionPad,mapKeyDirection,MAP_VECTORS} from '../map-controls.js';
import {choices,escapeHTML,announce,html} from '../ui.js';
import {icon} from '../icons.js';
import {sound,cue} from '../audio.js';

const ART='/assets/run-stage/';
const LABELS=['낮은 압력','보통 압력','높은 압력'];
const HINTS=['기체의 양과 온도는 같게 두고 바깥 압력만 바꿔요.','한 조건만 바꾸고 처음과 나중을 비교해요.','기체가 사라졌는지, 차지하는 공간이 달라졌는지 생각해 봐요.'];
let sheet;
function stylesheet(){
 return sheet??=new Promise((resolve,reject)=>{const link=document.createElement('link');link.rel='stylesheet';link.href=new URL('./run-stage.css',import.meta.url);link.onload=resolve;link.onerror=()=>{sheet=undefined;link.remove();reject(new Error('run-stage.css'));};document.head.append(link);});
}
function loadTexture(loader,url,{repeat,pixel=false}={}){
 return new Promise((resolve,reject)=>loader.load(url,texture=>{texture.colorSpace=THREE.SRGBColorSpace;if(repeat){texture.wrapS=texture.wrapT=THREE.RepeatWrapping;texture.repeat.set(...repeat);}if(pixel)texture.magFilter=THREE.NearestFilter;resolve(texture);},undefined,()=>reject(new Error(url))));
}
/** 그림과 스타일을 다 받은 뒤에 화면을 바꾼다. 실패하면 호출한 쪽이 기존 화면을 연다. */
export async function prepareMountainRun(){
 const loader=new THREE.TextureLoader();
 const names={student:'/assets/student-walk.webp',lumi:'/assets/lumi-portrait.webp',villain:'/assets/map-encounters/villain-left.png',...Object.fromEntries(['bag-normal','bag-puffed','trail-grass','stone-steps','log-bridge','rock-face','meadow-flowers','river','mountain-backdrop','summit-station','base-shelter','station-post','pine-tree','leafy-tree','fence','flower-clump','boulder','cloud','lantern-post','pinwheel'].map(name=>[name,`${ART}${name}.webp`]))};
 const entries=await Promise.all([stylesheet(),...Object.entries(names).map(async([key,url])=>[key,await loadTexture(loader,url)])]);
 return Object.fromEntries(entries.slice(1));
}

export function mountMountainRun(host,task,ctx,textures,{toClassic}){
 const state=restoreRun(task,ctx.draft),baseline=task.baseline??1,local=new AbortController(),{signal}=local;
 ctx.signal.addEventListener('abort',()=>local.abort(),{once:true});
 let phase=readyToCompare(state,task)?'compare':state.prediction?'run':'predict',completed=false,disposed=false,frame=0;
 const runner=createRunner(COURSE,phase==='compare'?COURSE.checkpoints.length-1:0);
 if(phase==='compare')runner.f=38;
 host.innerHTML=`<div class="run-stage" data-phase="${phase}">
  <canvas class="run-canvas" tabindex="0" aria-label="관측소에서 산꼭대기까지 이어진 산길. 방향 버튼이나 WASD·방향키로 걷고, 점프 버튼이나 스페이스로 뛰어요."></canvas>
  <div class="run-labels" aria-hidden="true"><span class="run-label" data-station="base">산 아래 관측 지점</span><span class="run-label" data-station="summit">산꼭대기 관측 지점</span></div>
  <div class="run-top"><span class="run-place"></span><span class="climate-constants">공기 양·온도 일정</span><button type="button" class="button secondary run-classic">기존 방식으로 하기</button></div>
  <figure class="run-bag" aria-label="손에 든 과자 봉지"><div class="run-bag-art"><img class="run-bag-normal" src="${ART}bag-normal.webp" alt="" draggable="false"><img class="run-bag-puffed" src="${ART}bag-puffed.webp" alt="" draggable="false"></div><figcaption>밀봉한 과자 봉지</figcaption></figure>
  <p class="run-speech" role="status" hidden></p>
  <div class="run-pad" role="group" aria-label="이동 방향"><button type="button" data-run-dir="up" aria-label="앞으로 걷기">${icon('arrow')}</button><button type="button" data-run-dir="left" aria-label="왼쪽으로 걷기">${icon('arrow')}</button><button type="button" data-run-dir="down" aria-label="뒤로 걷기">${icon('arrow')}</button><button type="button" data-run-dir="right" aria-label="오른쪽으로 걷기">${icon('arrow')}</button></div>
  <div class="run-actions"><button type="button" class="run-record" aria-label="봉지 크기 기록하기" disabled>${icon('check')}<span>기록</span></button><button type="button" class="run-jump" aria-label="점프">${icon('arrow')}<span>점프</span></button></div>
  <section class="run-panel run-predict lab-panel" aria-label="출발 전 예상"><h2>산꼭대기에 가면 봉지는 어떻게 될까요?</h2><p>밀봉한 과자 봉지를 들고 산길을 올라요. 고르면 바로 출발해요.</p><div class="run-predict-choices"></div></section>
  <aside class="run-panel run-compare lab-panel" aria-label="부피 비교와 새 상황에 적용"><div class="volume-records" role="group" aria-label="같은 기준으로 비교한 공기의 부피"></div><p class="run-prediction-note"></p><div class="transfer-slot"></div><div class="activity-feedback"></div></aside>
 </div>`;
 const root=host.firstElementChild,canvas=root.querySelector('.run-canvas'),speech=root.querySelector('.run-speech'),place=root.querySelector('.run-place'),recordButton=root.querySelector('.run-record'),jumpButton=root.querySelector('.run-jump'),feedback=root.querySelector('.activity-feedback');
 const bagArt=root.querySelector('.run-bag-art'),bagPuffedImage=root.querySelector('.run-bag-puffed'),bagNormalImage=root.querySelector('.run-bag-normal');

 // ── 무대 ──
 const renderer=new THREE.WebGLRenderer({canvas,antialias:true,powerPreference:'default'});
 renderer.setPixelRatio(Math.min(window.devicePixelRatio||1,1.25));
 const scene=new THREE.Scene();scene.background=new THREE.Color(0x4aa3e6);scene.fog=new THREE.Fog(0xcfeaf3,38,95);
 const camera=new THREE.PerspectiveCamera(46,16/9,.1,220);
 scene.add(new THREE.HemisphereLight(0xffffff,0x8fa58a,1.9));
 const sun=new THREE.DirectionalLight(0xfff2d6,1.4);sun.position.set(-6,14,8);scene.add(sun);
 const disposables=[];
 const keep=item=>{disposables.push(item);return item;};
 const at=(x,y,f)=>new THREE.Vector3(x,y,-f);
 const tiled=(texture,u,v)=>{const copy=keep(texture.clone());copy.wrapS=copy.wrapT=THREE.RepeatWrapping;copy.repeat.set(u,v);copy.needsUpdate=true;return copy;};
 const sideMaterial=keep(new THREE.MeshLambertMaterial({map:tiled(textures['rock-face'],3,3),color:0xb8ad9c}));
 const surface={grass:textures['trail-grass'],stone:textures['stone-steps'],log:textures['log-bridge'],rock:textures['rock-face']};
 for(const p of COURSE.platforms){
  const width=p.x1-p.x0,depth=p.f1-p.f0,log=p.kind==='log',height=log?.45:p.top+9;
  const top=keep(new THREE.MeshLambertMaterial({map:tiled(surface[p.kind],log?1:Math.max(1,Math.round(width/3)),log?3:Math.max(1,Math.round(depth/3)))}));
  const side=log?keep(new THREE.MeshLambertMaterial({map:tiled(textures['log-bridge'],3,1),color:0xa98d6a})):p.kind==='grass'?sideMaterial:keep(new THREE.MeshLambertMaterial({map:tiled(textures['rock-face'],1,Math.max(1,Math.round(height/3)))}));
  const mesh=new THREE.Mesh(keep(new THREE.BoxGeometry(width,height,depth)),[side,side,top,side,side,side]);
  mesh.position.copy(at((p.x0+p.x1)/2,p.top-height/2,(p.f0+p.f1)/2));scene.add(mesh);
 }
 // 길 양옆의 꽃밭 비탈. 통나무 다리 구간은 비워 골짜기와 시냇물이 보이게 한다.
 const edge=COURSE.platforms[0].x1,SLOPES=[[-12,5,-.25],[5,11,1.1],[11,17,2.15],[24,34.2,2.15],[34.2,60,4.55]];
 const slopeAt=f=>(SLOPES.find(([f0,f1])=>f>=f0&&f<f1)||SLOPES.at(-1))[2];
 for(const [f0,f1,top] of SLOPES){
  const meadow=keep(new THREE.MeshLambertMaterial({map:tiled(textures['meadow-flowers'],8,Math.max(1,Math.round((f1-f0)/4)))}));
  for(const side of [-1,1]){const mesh=new THREE.Mesh(keep(new THREE.BoxGeometry(34,top+12,f1-f0)),[sideMaterial,sideMaterial,meadow,sideMaterial,sideMaterial,sideMaterial]);mesh.position.copy(at(side*(edge+17),top-(top+12)/2,(f0+f1)/2));scene.add(mesh);}
 }
 // 걷는 길 앞뒤로 이어지는 땅(보이기만 한다).
 const trail=keep(new THREE.MeshLambertMaterial({map:tiled(textures['trail-grass'],2,4)}));
 for(const [f0,f1,top] of [[-12,-3,0],[42,60,COURSE.summit]]){const mesh=new THREE.Mesh(keep(new THREE.BoxGeometry(edge*2,top+12,f1-f0)),[sideMaterial,sideMaterial,trail,sideMaterial,sideMaterial,sideMaterial]);mesh.position.copy(at(0,top-(top+12)/2,(f0+f1)/2));scene.add(mesh);}
 const river=keep(new THREE.MeshBasicMaterial({map:tiled(textures.river,16,2)})),ravine=new THREE.Mesh(keep(new THREE.PlaneGeometry(96,12)),river);ravine.rotation.x=-Math.PI/2;ravine.position.copy(at(0,-6.5,20.5));scene.add(ravine);
 // 원경은 좌우로 거울처럼 이어 붙여 넓은 화면에서도 끝이 보이지 않게 한다.
 const far=keep(textures['mountain-backdrop'].clone());far.wrapS=THREE.MirroredRepeatWrapping;far.repeat.set(3,1);far.offset.set(-1,0);far.needsUpdate=true;
 const backdrop=new THREE.Mesh(keep(new THREE.PlaneGeometry(408,76.5)),keep(new THREE.MeshBasicMaterial({map:far,fog:false})));backdrop.position.copy(at(0,9,118));scene.add(backdrop);
 // 길 가장자리의 나무 울타리. 넓은 길에서 옆으로 벗어날 수 없는 까닭을 눈에 보이게 한다.
 const fenceGeometry=keep(new THREE.PlaneGeometry(1,1));
 for(const p of COURSE.platforms){
  if(p.kind==='log'||p.x1-p.x0<5)continue;
  const length=p.f1-p.f0,material=keep(new THREE.MeshLambertMaterial({map:tiled(textures.fence,Math.max(1,Math.round(length/2)),1),transparent:true,alphaTest:.4,side:THREE.DoubleSide}));
  for(const side of [-1,1]){const rail=new THREE.Mesh(fenceGeometry,material);rail.scale.set(length,.8,1);rail.rotation.y=Math.PI/2;rail.position.copy(at(side*(edge+.02),p.top+.38,(p.f0+p.f1)/2));scene.add(rail);}
 }
 // 세운 그림: 카메라를 돌리지 않으므로 늘 정면을 본다. 걷는 길 위에는 세우지 않는다(캐릭터가 뚫고 지나가지 않게).
 function standing(texture,height,{x,f,y,aspect,center=.02,opacity=1}){
  const material=keep(new THREE.SpriteMaterial({map:texture,transparent:true,opacity,alphaTest:.05})),sprite=new THREE.Sprite(material);
  sprite.center.set(.5,center);sprite.scale.set(height*(aspect??texture.image.width/texture.image.height),height,1);sprite.position.copy(at(x,y??(Math.abs(x)>edge?slopeAt(f):groundAt(x,f)),f));scene.add(sprite);return sprite;
 }
 // 낮은 곳에는 잎이 넓은 나무, 높은 곳에는 소나무를 심는다.
 for(const [x,f,size] of [[-9.5,1.5,5],[6.8,2.2,5.4],[-8.2,6.5,5.2],[7.4,8,4.6],[-6.6,10.4,4.4]])standing(textures['leafy-tree'],size,{x,f});
 for(const [x,f,size] of [[6.4,13.5,4.6],[-7,15.6,5.2],[5.6,25.5,4.8],[-6.6,28.5,4.6],[7,32.5,5.4],[-6.2,37.5,4.8],[6.8,39.5,4.4],[-9.5,45,6],[9,47,5.6],[-12,52,6.4],[13,54,6]])standing(textures['pine-tree'],size,{x,f});
 for(const [x,f,size] of [[-3.8,-.4,.9],[4.6,4.2,1],[-4.6,7.6,.9],[4.2,11.6,.9],[-4.4,12.4,1],[3.9,16.2,.9],[-3.9,25,1],[4.4,30.6,.9],[-4.8,33.2,1],[3.9,35.2,.9],[-4.2,40.4,1],[4.8,38.2,.9]])standing(textures['flower-clump'],size,{x,f});
 for(const [x,f,size] of [[5.2,-.6,1.5],[-5.4,5.6,1.3],[4.9,14.9,1.6],[-4.6,16.4,1.2],[-5.2,24.6,1.5],[5.4,27.8,1.3],[-4.4,36.2,1.2],[5.6,41,1.6]])standing(textures.boulder,size,{x,f});
 for(const [x,f] of [[4.4,3.6],[-4.1,14.9],[4.6,40.4]])standing(textures.pinwheel,1.5,{x,f});
 for(const [x,f] of [[-3.6,11.6],[3.6,28.4],[-3.7,41.2],[3.7,41.2]])standing(textures['lantern-post'],2.5,{x,f});
 standing(textures['base-shelter'],2.4,{x:-6.8,f:3.4});
 standing(textures['station-post'],1.9,{x:-3.6,f:1.2});
 // 꼭대기 표지대는 뒤집어 세워 바늘이 산 아래와 다른 쪽을 가리킨다(눈금 없는 장식).
 standing(textures['station-post'],1.9,{x:-3.5,f:37.4}).scale.x*=-1;
 // 관측소는 길 끝 울타리 너머에 세워 캐릭터와 겹치지 않는다.
 standing(textures['summit-station'],5.2,{x:0,f:45.2,y:COURSE.summit});
 const endRail=new THREE.Mesh(fenceGeometry,keep(new THREE.MeshLambertMaterial({map:tiled(textures.fence,3,1),transparent:true,alphaTest:.4,side:THREE.DoubleSide})));endRail.scale.set(edge*2,.8,1);endRail.position.copy(at(0,COURSE.summit+.38,42));scene.add(endRail);
 standing(textures.lumi,1.95,{x:3.7,f:1.6});
 standing(textures.lumi,1.95,{x:3.8,f:13.2});
 const clouds=[[-26,17,70,13],[18,21,82,16],[40,15,64,11],[-48,23,90,18]].map(([x,y,f,size])=>standing(textures.cloud,size,{x,f,y,center:.5,opacity:.95}));
 const ringMaterial=keep(new THREE.MeshBasicMaterial({color:0xffd36a,transparent:true,opacity:.75,depthWrite:false}));
 const ring=new THREE.Mesh(keep(new THREE.RingGeometry(1.25,1.55,40)),ringMaterial);ring.rotation.x=-Math.PI/2;ring.position.copy(at(0,COURSE.summit+.03,38));scene.add(ring);
 // 캐릭터와 봉지
 const studentTexture=keep(textures.student.clone());studentTexture.repeat.set(.25,.25);studentTexture.needsUpdate=true;
 const student=standing(studentTexture,1.75,{x:0,f:0,aspect:318/308,center:.07});
 const setFrame=(row,column)=>studentTexture.offset.set(column/4,1-(row+1)/4);
 const bagNormal=standing(textures['bag-normal'],.62,{x:0,f:0,center:.5}),bagPuffed=standing(textures['bag-puffed'],.62,{x:0,f:0,center:.5,opacity:0});
 const shadowCanvas=document.createElement('canvas');shadowCanvas.width=shadowCanvas.height=64;const paint=shadowCanvas.getContext('2d'),glow=paint.createRadialGradient(32,32,2,32,32,30);glow.addColorStop(0,'rgba(20,40,35,.5)');glow.addColorStop(1,'rgba(20,40,35,0)');paint.fillStyle=glow;paint.fillRect(0,0,64,64);
 const shadow=new THREE.Mesh(keep(new THREE.PlaneGeometry(1.3,1.3)),keep(new THREE.MeshBasicMaterial({map:keep(new THREE.CanvasTexture(shadowCanvas)),transparent:true,depthWrite:false})));shadow.rotation.x=-Math.PI/2;scene.add(shadow);
 const villainTexture=keep(textures.villain.clone());villainTexture.repeat.set(1/6,1);villainTexture.needsUpdate=true;
 const villain=standing(villainTexture,2.5,{x:0,f:COURSE.patrol.f,aspect:1,center:.07});

 // ── 겹침 화면 ──
 function say(text,hold=0){speech.textContent=text;speech.hidden=!text;if(text)announce(text);clearTimeout(say.timer);if(text&&hold)say.timer=setTimeout(()=>{speech.hidden=true;},hold);}
 function save(){ctx.saveDraft(runDraft(state,task));}
 function setPhase(next){phase=next;root.dataset.phase=next;held.clear();jumpQueued=false;guide();}
 function guide(){
  if(completed)return;
  if(phase==='predict'){ctx.guide?.('1 · 예상하기','산꼭대기에 가면 과자 봉지가 어떻게 될지 골라요.',HINTS);ctx.nextAction?.('.run-predict .choice');}
  else if(phase==='run'){ctx.guide?.('2 · 산꼭대기로 가기',`처음은 ${LABELS[baseline]}이에요. 산꼭대기 관측 지점까지 올라가 기록해요.`,HINTS);ctx.nextAction?.(recordButton.disabled?[]:'.run-record');}
  else{ctx.guide?.('3 · 새 상황에 적용','두 모습을 비교하고, 새로운 상황을 골라요.',HINTS);ctx.nextAction?.('.transfer-slot .choice');}
 }
 function renderCompare(){
  const initial=volumeFor(task.mode,baseline);
  root.querySelector('.volume-records').innerHTML=[['처음',baseline],['바꾼 뒤',task.target]].map(([title,condition])=>{
   const record=state.records.find(r=>r.condition===condition),ratio=record?volumeFor(task.mode,record.condition):0;
   return `<div class="volume-record ${record?'recorded':'awaiting'}" data-condition="${record?.condition??'pending'}"><div class="record-stage">${title}</div><strong class="record-condition">${record?LABELS[record.condition]:'기록 전'}</strong><div class="comparison-track" aria-hidden="true"><span class="comparison-baseline" style="left:${initial/1.35*100}%"></span><i style="width:${ratio/1.35*100}%"></i></div></div>`;
  }).join('');
  const note=root.querySelector('.run-prediction-note'),picked=PREDICTIONS.find(p=>p.value===state.prediction);
  note.hidden=!picked;
  if(picked)note.textContent=`내 예상: ${picked.label} → ${picked.value===observedChange(task)?'기록과 같아요.':'기록과 달라요. 두 막대를 다시 봐요.'}`;
  const slot=root.querySelector('.transfer-slot');
  if(slot.childElementCount)return;
  slot.innerHTML=`<div class="transfer-question"><h3>${escapeHTML(task.transfer)}</h3></div>`;
  slot.append(choices(task.choices,value=>{
   if(completed)return;
   if(value===task.answer){
    completed=true;feedback.replaceChildren();root.classList.add('answered');ctx.guide?.('3 · 발견 완료','같은 공기가 차지하는 공간의 변화를 발견했어요.');sound('success');
    ctx.complete(task.why,{mode:task.mode,records:state.records,transfer:value});
   }else{const retry=task.retry||'두 부피 막대를 다시 비교해 보아요.';feedback.replaceChildren();ctx.guide?.('2 · 다시 생각해요',retry);announce(retry);sound('retry');}
  },{terms:ctx.terms}));
 }
 root.querySelector('.run-predict-choices').append(choices(PREDICTIONS,value=>{
  if(phase!=='predict')return;
  state.prediction=value;save();sound();setPhase('run');say('출발! 위쪽 방향 버튼으로 산길을 올라요.',4200);canvas.focus({preventScroll:true});
 },{group:'예상 고르기'}));
 function record(){
  if(completed||phase!=='run'||signal.aborted||stationAt(runner)!=='summit')return;
  if(!recordStation(state,task,'summit'))return;
  sound();save();setPhase('compare');renderCompare();say('');
  announce('달라진 모습이 기록됐어요. 두 크기를 비교해 새로운 상황에도 적용해요.');
  root.querySelector('.transfer-slot .choice')?.focus({preventScroll:true});
 }
 recordButton.onclick=()=>{record();if(document.activeElement===recordButton)canvas.focus({preventScroll:true});};
 root.querySelector('.run-classic').onclick=()=>toClassic(runDraft(state,task));

 // ── 입력: 화면 버튼과 키보드를 하나로 모은다 ──
 const held=new Set();let jumpQueued=false;
 const blocked=()=>phase!=='run'||completed||document.hidden||Boolean(document.querySelector('dialog[open]'))||host.closest('[data-playback=running]')!==null;
 bindDirectionPad(root,'[data-run-dir]',b=>b.dataset.runDir,{signal,blocked,press:d=>held.add('pad:'+d),release:d=>held.delete('pad:'+d),tap:d=>{held.add('pad:'+d);setTimeout(()=>held.delete('pad:'+d),220);}});
 const jump=()=>{if(!blocked())jumpQueued=true;};
 jumpButton.addEventListener('pointerdown',e=>{if(e.button>0)return;e.preventDefault();jump();},{signal});
 jumpButton.addEventListener('click',e=>{if(e.detail===0)jump();},{signal});
 // 교사용 전체 해금에서는 방향키가 단계 이동이라, 달리기는 WASD와 화면 버튼으로 한다.
 const teacherArrows=e=>e.key.startsWith('Arrow')&&host.closest('.teacher-mode')!==null;
 document.addEventListener('keydown',e=>{
  if(blocked()||e.isComposing||e.ctrlKey||e.altKey||e.metaKey||e.target.closest?.('input,textarea,select,[contenteditable]:not([contenteditable="false"])'))return;
  const direction=mapKeyDirection(e);
  if(direction&&!teacherArrows(e)){e.preventDefault();held.add('key:'+(e.code||e.key));return;}
  const onButton=e.target.closest?.('button,a,summary');
  if(e.code==='Space'&&(!onButton||onButton.matches('.run-pad button,.run-jump'))){e.preventDefault();if(!e.repeat)jump();}
  else if(e.code==='Enter'&&!onButton&&!recordButton.disabled){e.preventDefault();record();}
 },{signal});
 document.addEventListener('keyup',e=>{held.delete('key:'+(e.code||e.key));},{signal});
 // 스페이스로 뛴 뒤 눌려 있던 버튼이 다시 눌리지 않게 한다.
 root.addEventListener('keyup',e=>{if(e.code==='Space'&&phase==='run'&&e.target.closest?.('.run-pad button,.run-jump'))e.preventDefault();},{signal});
 const releaseAll=()=>{held.clear();jumpQueued=false;};
 window.addEventListener('blur',releaseAll,{signal});document.addEventListener('visibilitychange',releaseAll,{signal});
 function readInput(){
  let x=0,f=0;
  for(const key of held){const d=key.startsWith('pad:')?key.slice(4):mapKeyDirection({code:key.slice(4),key:key.slice(4)}),v=MAP_VECTORS[d];if(v){x+=v.x;f-=v.y;}}
  return {x:Math.sign(x),f:Math.sign(f)};
 }

 // ── 한 프레임 ──
 const cameraAt=new THREE.Vector3(),lookAt=new THREE.Vector3(),projected=new THREE.Vector3();
 let last=performance.now(),clock=0,stuck=0,stuckHint=null,cameraFloor=runner.y,facing=3,walkTime=0,atSummit=false,placeText='',hintGiven=false,width=0,height=0;
 const labels=[...root.querySelectorAll('.run-label')].map(el=>({el,point:el.dataset.station==='base'?at(-3.6,1.9,1.2):at(-3.5,COURSE.summit+1.7,37.4)}));
 function resize(){
  const w=Math.max(1,Math.round(root.clientWidth)),h=Math.max(1,Math.round(root.clientHeight));if(w===width&&h===height)return;
  width=w;height=h;renderer.setSize(w,h,false);camera.aspect=w/h;camera.updateProjectionMatrix();
 }
 function follow(snap){
  // 예상·비교 패널이 오른쪽을 덮으므로 그때는 캐릭터가 왼쪽에 보이게 옆으로 비킨다.
  // 골짜기로 떨어질 때 카메라는 길 높이에 남는다.
  const shift=phase==='run'?0:2.4,target=at(runner.x*.55+shift,cameraFloor+3.7,runner.f-7.4);
  if(snap)cameraAt.copy(target);else cameraAt.lerp(target,.12);
  camera.position.copy(cameraAt);lookAt.copy(at(cameraAt.x,cameraAt.y-2.1,runner.f+2.4));camera.lookAt(lookAt);
 }
 function draw(dt){
  const input=blocked()?{x:0,f:0}:readInput(),fromX=runner.x,fromF=runner.f;
  if(!blocked()){
   const events=advanceRunner(runner,{...input,jump:jumpQueued},dt);jumpQueued=false;
   cameraFloor=runner.ground?runner.y:Math.max(runner.y,cameraFloor-.6);
   if(events.jumped)sound('rotate');
   if(events.respawned){cameraFloor=runner.y;follow(true);sound('retry');say(runner.falls>=3?'여기가 어렵다면 위의 「기존 방식으로 하기」를 눌러도 돼요. 통나무 가운데로 천천히 걸어 봐요.':'괜찮아요! 조금 앞에서 다시 걸어요.',runner.falls>=3?7000:2600);if(runner.falls>=3)root.querySelector('.run-classic').classList.add('is-next-action');}
   if(events.checkpoint===1&&!hintGiven){hintGiven=true;say('봉지를 봐요. 올라오는 동안 조금 부풀었어요.',4200);}
   if(touchPatrol(runner,clock)){cue('contact');say('앗, 깜짝이야! 그대로 다시 걸어요.',2200);}
  }
  clock+=dt;
  // 캐릭터 그림: 벽이나 울타리에 막혀 제자리일 때는 걷는 그림을 쓰지 않는다.
  const moving=Math.hypot(runner.x-fromX,runner.f-fromF)>dt*.6;
  // 앞으로 가려는데 턱에 막혀 있으면 잠깐 뒤에 할 일을 알려 준다.
  const obstacle=input.f>0&&!moving&&runner.stun<=0?obstacleAhead(runner):null;
  stuck=obstacle?stuck+dt:0;
  if(stuck>.7&&obstacle!==stuckHint){
   stuckHint=obstacle;
   if(obstacle==='jump'){say('턱이 있어요. 점프 버튼을 눌러 넘어요!');ctx.nextAction?.('.run-jump');}
   else{say('여기는 너무 높아요. 가운데 바위를 밟고 올라가요.');ctx.nextAction?.([]);}
  }else if(!obstacle&&stuckHint&&(moving||!runner.ground)){stuckHint=null;say('');guide();}
  if(input.x||input.f)facing=Math.abs(input.x)>Math.abs(input.f)?(input.x<0?1:2):input.f<0?0:3;
  walkTime=moving?walkTime+dt:0;
  setFrame(facing,runner.ground?(moving?Math.floor(walkTime*8)%4:0):1);
  const flinch=runner.stun>0?Math.sin(clock*60)*.06:0;
  student.position.copy(at(runner.x+flinch,runner.y,runner.f));
  const ground=groundAt(runner.x,runner.f);shadow.visible=ground>-Infinity;if(shadow.visible){shadow.position.copy(at(runner.x,ground+.02,runner.f));const lift=Math.max(.45,1-(runner.y-ground)*.35);shadow.scale.set(lift,lift,1);}
  // 봉지: 높이에 따라 두 모형 값 사이를 보여 준다.
  const ratio=bagRatio(task,phase==='compare'?1:heightFraction(runner)),puff=(ratio-volumeFor(task.mode,baseline))/(volumeFor(task.mode,task.target)-volumeFor(task.mode,baseline));
  const bob=moving&&runner.ground?Math.sin(walkTime*16)*.03:0;
  const hand=[-.6,-.5,.5,.6][facing];
  for(const bag of [bagNormal,bagPuffed]){bag.position.copy(at(runner.x+hand,runner.y+.82+bob,runner.f-.05));bag.scale.set(.62*(1+(ratio-1)*.9),.62*(1+(ratio-1)*.45),1);}
  // 보통 봉지는 그대로 두고 부푼 봉지를 그 위에 겹쳐 올린다(비쳐 보이지 않게).
  bagNormal.material.opacity=puff<1?1:0;bagPuffed.material.opacity=puff;bagPuffed.position.z+=.02;
  bagArt.style.setProperty('--bag-scale',String(.74+(ratio-1)*.74));bagPuffedImage.style.opacity=String(puff);bagNormalImage.style.opacity=puff<1?'1':'0';
  // 방해꾼
  const patrol=patrolX(clock);villain.position.copy(at(patrol,2.4,COURSE.patrol.f));villainTexture.offset.x=(Math.floor(clock*7)%6)/6;
  villain.scale.x=Math.sin(clock*1.3)>=0?-2.5:2.5;
  ringMaterial.opacity=phase==='run'?.55+Math.sin(clock*4)*.25:0;
  for(const [i,cloud] of clouds.entries()){cloud.position.x+=dt*(.5+i*.12);if(cloud.position.x>75)cloud.position.x=-75;}
  river.map.offset.x=(clock*.03)%1;
  // 조작 상태
  const station=stationAt(runner),summit=station==='summit'&&phase==='run';
  if(summit!==atSummit){atSummit=summit;recordButton.disabled=!summit;if(summit){say('산꼭대기 관측 지점이에요. 기록 버튼을 눌러요.');sound('hint');}else if(phase==='run')say('');guide();}
  const text=phase==='compare'?`산꼭대기 · ${LABELS[task.target]}`:station==='base'?`산 아래 · ${LABELS[baseline]}`:station==='summit'?`산꼭대기 · ${LABELS[task.target]}`:'산길 · 바깥 압력이 낮아지는 중';
  if(text!==placeText){placeText=text;place.textContent=text;}
  root.dataset.checkpoint=String(runner.checkpoint);root.dataset.falls=String(runner.falls);
  follow(false);renderer.render(scene,camera);
  for(const label of labels){projected.copy(label.point).project(camera);const visible=projected.z<1&&Math.abs(projected.x)<1.05&&Math.abs(projected.y)<1.05&&Math.abs(-label.point.z-runner.f)<9;const top=(1-projected.y)/2*height,clear=speech.hidden?height*.16:height*.36;label.el.hidden=!visible||top<clear;if(!label.el.hidden)label.el.style.transform=`translate(-50%,-100%) translate(${((projected.x+1)/2*width).toFixed(1)}px,${((1-projected.y)/2*height).toFixed(1)}px)`;}
 }
 function tick(now){
  if(disposed)return;frame=requestAnimationFrame(tick);
  const dt=Math.min(.05,Math.max(0,(now-last)/1000));last=now;
  if(document.hidden)return;
  resize();draw(dt);
 }
 const observer=new ResizeObserver(resize);observer.observe(root);
 function dispose(){
  if(disposed)return;disposed=true;cancelAnimationFrame(frame);clearTimeout(say.timer);observer.disconnect();local.abort();
  for(const item of disposables)item.dispose?.();
  renderer.dispose();renderer.forceContextLoss?.();
 }
 signal.addEventListener('abort',dispose,{once:true});
 canvas.addEventListener('webglcontextlost',e=>{e.preventDefault();if(!disposed&&!completed)toClassic(runDraft(state,task));},{signal});
 // 자동재생은 기존 화면에서 그대로 돈다.
 ctx.playback?.({steps:()=>{const spec=toClassic(runDraft(state,task));return spec?.steps?.()||[];}});
 save();resize();follow(true);
 if(phase==='compare')renderCompare();
 guide();frame=requestAnimationFrame(tick);
 return {dispose};
}
