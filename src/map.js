import { createMapCamera, bindMapCameraPointer, mapLabelGuard } from './map-camera.js';
import { mountMapEncounters } from './map-encounters.js';
import { encounterLook,encounterStage,loadEncounterActor,drawEncounterActor } from './map-encounter-theme.js';
import { buildingReveal, paintRestoredBuildings } from './building-restoration.js';
import {bindDirectionPad,MAP_VECTORS} from './map-controls.js';
import { narration, voiceForText } from './game-voices.js';
import {mountRepair} from './map-repair.js';
import {STAGES} from './data.js';
import {isStageOpen,completeStage} from './model.js';
import {canStand,findPath,movePoint,distance,validateMap} from './navigation.js';
import {html,button,announce} from './ui.js';
const SOLI_IMAGE='/assets/soli.svg';
import {icon} from './icons.js';
import {sound} from './audio.js';
export function mountMap(host,ctx,[geometry,background,student,soli,atlas]){
 if(ctx.signal.aborted)return;
 const map=validateMap(geometry);
 if(background.naturalWidth!==map.width||background.naturalHeight!==map.height)throw new Error('배경 크기');
 host.innerHTML=`<canvas class="map-canvas" tabindex="0" aria-label="자연 속 연구 마을. 길이나 시설 이름을 누르면 걸어가요. 방향키와 WASD로 이동하고 Enter로 입장해요."></canvas><div class="map-labels"></div><section class="map-controls" aria-label="지도 조작"><div class="map-controls-head"><img src="${SOLI_IMAGE}" alt=""><span>솔이와 함께 탐험해요</span></div><div class="map-controls-body"><div class="map-dpad" role="group" aria-label="이동 방향"><button data-dir="up" aria-label="위로 이동">${icon('arrow')}</button><button data-dir="left" aria-label="왼쪽으로 이동">${icon('arrow')}</button><button data-dir="down" aria-label="아래로 이동">${icon('arrow')}</button><button data-dir="right" aria-label="오른쪽으로 이동">${icon('arrow')}</button></div><button class="map-tool map-recenter" aria-label="내 위치로" title="내 위치로" hidden>${icon('target')}</button></div></section><section class="map-next-card" aria-label="다음 목적지"><div class="map-camera-actions" role="group" aria-label="지도 보기"><button class="map-tool map-overview" aria-label="지도 전체 보기" title="지도 전체 보기" aria-pressed="false">${icon('fit')}</button><button class="map-tool map-hand" aria-label="손으로 지도 이동" title="손으로 지도 이동" aria-pressed="false">${icon('hand')}</button></div><button class="map-next button gold"></button></section><button class="map-companion" aria-label="함께 걷는 바람여우 솔이에게 힌트 받기"><span>···</span></button><div class="map-speech" hidden></div>`;
 if(ctx.save.settings.adminUnlockAll||STAGES.some(s=>completeStage(ctx.save,s.id)))mountRepair(host,{state:ctx.save,save:()=>ctx.persist(),kind:'valve',preview:ctx.save.settings.adminUnlockAll,available:STAGES.map((s,i)=>({id:i,label:s.name,stage:s.id})).filter(s=>ctx.save.settings.adminUnlockAll||completeStage(ctx.save,s.stage))});
 const canvas=host.querySelector('canvas'),g=canvas.getContext('2d'),next=host.querySelector('.map-next'),speech=host.querySelector('.map-speech');
 const returnBuilding=map.buildings.find(b=>b.id===ctx.returnFrom);let position=returnBuilding?{x:returnBuilding.return[0],y:returnBuilding.return[1]}:{...map.spawn};if(!canStand(map,position))position={...map.spawn};
 let follower={x:position.x-34,y:position.y+17},trail=[{...position}],path=[],goal=null,dir=0,walking=false,time=0,lastTime=0,frame=0,width=0,height=0,scale=1,cam={x:0,y:0},entered=false;
 const held=new Set(),reduced=ctx.save.settings.reduceMotion||matchMedia('(prefers-reduced-motion: reduce)').matches;
 const camera=createMapCamera({width:map.width,height:map.height,baseZoom:w=>w<1000?1.5:1.62,focusY:.57,reduced:()=>ctx.save.settings.reduceMotion||matchMedia('(prefers-reduced-motion: reduce)').matches});
 const blocked=()=>entered||document.hidden||!!document.querySelector('dialog[open]')||!!host.querySelector('.map-repair[open]');
 const encounterStages=ctx.save.settings.adminUnlockAll?[]:STAGES.flatMap((s,i)=>{
  const b=map.buildings.find(b=>b.id===s.id);
  if(!b||!completeStage(ctx.save,s.id))return [];
  const [x,y]=b.return,[ex,ey]=map.nodes[b.entry],distanceFromDoor=Math.hypot(x-ex,y-ey);
  // Patrol on the yard beside the road, clear of Soli and the returning researcher.
  const dx=(x-ex)/distanceFromDoor,dy=(y-ey)/distanceFromDoor;
  const candidates=[{x:x+dx*38-dy*18,y:y+dy*38+dx*18},{x:x+dx*38+dy*18,y:y+dy*38-dx*18},{x:x+dx*34,y:y+dy*34}];
  const p=candidates.find(p=>canStand(map,p))??{x,y};
  return [{...encounterStage(i,s.id,s.name,p),patrolRadius:18}];
 });
 const restoredIds=ctx.takeRestorations?.()??[];
 const encounters=mountMapEncounters({requiredFoes:5,host,clearStage:()=>restoredIds.filter(id=>id!=='core').at(-1),stages:encounterStages,progress:ctx.save.mapHits,onSave:patch=>{ctx.save.mapHits={...ctx.save.mapHits,...patch};ctx.persist();},blocked,reduced:()=>reduced,tone:(kind,hits)=>sound(kind==='finish'?'success':kind==='contact'?'retry':hits===2?'pump':'tap'),reach:95,contact:24,canPatrol:p=>canStand(map,p),...encounterLook});
 const heroPose=encounterStages.length?loadEncounterActor('hero'):null,allyPose=encounterStages.length?loadEncounterActor('ally'):null;
 const reveal=buildingReveal(reduced,restoredIds);
 const isRestored=id=>id==='core'?ctx.save.finaleCompleted:completeStage(ctx.save,id);
 const landscape=document.createElement('canvas');landscape.width=map.width;landscape.height=map.height;
 const land=landscape.getContext('2d');let lastRestoration=null;
 const guardLabels=mapLabelGuard(host,'.building-label','.global-controls button,.map-dpad button,.map-camera-actions button,.map-next,.map-repair summary');
 const labels=new Map();const completed=()=>STAGES.filter(s=>completeStage(ctx.save,s.id)).length;
 const allDone=()=>completed()===5;
 const nextId=()=>STAGES.find(s=>!completeStage(ctx.save,s.id))?.id||'core';
 function hint(text){speech.textContent=text;speech.hidden=false;announce(text);voiceForText(speech,text,ctx.signal);}
 function guideBusy(busy){
  if(busy===next.hasAttribute('aria-busy'))return;
  if(busy){next.setAttribute('aria-busy','true');next.setAttribute('aria-disabled','true');next.textContent='길을 따라 이동 중…';}
  else{next.removeAttribute('aria-busy');next.removeAttribute('aria-disabled');next.innerHTML=nextLabel;}
 }
 function cancelRoute(){path=[];goal=null;guideBusy(false);}
 function canVisit(id){return id==='core'?allDone()||ctx.save.settings.adminUnlockAll:isStageOpen(ctx.save,STAGES.findIndex(s=>s.id===id));}
 function routeTo(id,guided=false){
  if(entered||document.hidden||document.querySelector('dialog[open]')||host.querySelector('.map-repair[open]')||(guided&&next.hasAttribute('aria-busy')))return;
  cancelRoute();
  if(!canVisit(id)){tryEnter(id);return;}
  const b=map.buildings.find(b=>b.id===id),[x,y]=map.nodes[b.entry],result=findPath(map,position,{x,y});
  if(!result){hint('그곳까지 갈 길을 찾지 못했어요. 흙길이나 다른 입구를 눌러 보아요.');return;}
  held.clear();path=result;goal=id;speech.hidden=true;narration.stop();follow();
  syncTools();sound();if(guided)guideBusy(true);
  if(reduced){position={x,y};tryEnter(id);return;}
  canvas.focus({preventScroll:true});
 }
 function tryEnter(id){if(entered)return;cancelRoute();const index=STAGES.findIndex(s=>s.id===id),allowed=canVisit(id);
  if(!allowed){const previous=id==='core'?'다섯 연구시설의 의뢰':STAGES[index-1].name+'의 의뢰';hint(`먼저 ${previous}를 마쳐 주세요. 솔이와 함께 다음 시설부터 가 볼까요?`);goal=null;return;}
  entered=true;ctx.enter(id);
 }
 map.buildings.forEach(b=>{const index=STAGES.findIndex(s=>s.id===b.id),stage=STAGES[index],done=stage?completeStage(ctx.save,b.id):ctx.save.finaleCompleted,open=stage?isStageOpen(ctx.save,index):allDone()||ctx.save.settings.adminUnlockAll;const label=button(`<span><svg class="map-lock-icon" viewBox="0 0 24 24" width="19" height="19" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><rect x="5" y="11" width="14" height="10" rx="2"/><path d="${open?'M8 11V7a4 4 0 0 1 7.5-2':'M8 11V7a4 4 0 0 1 8 0v4'}"/></svg></span><span>${stage?.name||'중앙 공기 코어'}</span>`,()=>routeTo(b.id),`building-label ${done?'restored':open?'open':'locked'} ${b.id===nextId()?'current':''}`);label.setAttribute('aria-label',`${stage?.name||'중앙 공기 코어'} · ${done?'복구됨':open?'탐구 가능':'아직 잠김'} · 걸어가기`);host.querySelector('.map-labels').append(label);labels.set(b.id,label);});
 const teacher=ctx.save.settings.adminUnlockAll===true,target=STAGES.find(s=>s.id===nextId()),card=host.querySelector('.map-next-card');
 card.classList.toggle('teacher',teacher);
 next.classList.toggle('map-next-cue',!teacher&&!ctx.save.finaleCompleted);
 const nextLabel=teacher&&!ctx.save.finaleCompleted?`바로 입장 ${icon('skip')}`:`${ctx.save.finaleCompleted?'마을 다시 둘러보기':`${target?.name||'중앙 코어'}로 가기`} ${icon('arrow')}`;
 next.innerHTML=nextLabel;
 next.onclick=()=>{if(teacher&&!ctx.save.finaleCompleted){const b=map.buildings.find(b=>b.id===nextId());position={x:map.nodes[b.entry][0],y:map.nodes[b.entry][1]};path=[];sound();tryEnter(b.id);return;}routeTo(nextId(),true);};
 const handButton=host.querySelector('.map-hand'),overviewButton=host.querySelector('.map-overview'),recenter=host.querySelector('.map-recenter');
 function syncTools(){
  const hand=camera.mode==='hand',overview=camera.mode==='overview';
  handButton.setAttribute('aria-pressed',String(hand));overviewButton.setAttribute('aria-pressed',String(overview));
  overviewButton.setAttribute('aria-label',overview?'이전 지도 보기':'지도 전체 보기');overviewButton.title=overviewButton.getAttribute('aria-label');
  recenter.hidden=!hand;canvas.classList.toggle('hand-on',hand);
 }
 function follow(){clearPointer();if(camera.mode!=='follow'){camera.follow(position);syncTools();}}
 handButton.onclick=()=>{if(blocked())return;clearPointer();cancelRoute();held.clear();camera.hand(position);sound();syncTools();announce(camera.mode==='hand'?'손 모드예요. 지도를 끌어서 둘러봐요.':'걷기 모드예요. 길을 누르면 걸어가요.');};
 overviewButton.onclick=()=>{if(blocked())return;clearPointer();cancelRoute();held.clear();camera.overview(position);sound();syncTools();};
 recenter.onclick=()=>{clearPointer();cancelRoute();follow();canvas.focus({preventScroll:true});};
 host.querySelector('.map-companion').onclick=()=>{cancelRoute();if(!speech.hidden){speech.hidden=true;narration.stop();return;}hint(ctx.save.finaleCompleted?'마을이 다시 움직여요! 시설에 들어가 다른 방법으로도 탐구해 보아요.':`다음은 ${STAGES.find(s=>s.id===nextId())?.name||'중앙 공기 코어'}예요. 시설 이름이나 흙길을 누르면 같이 걸어가요. 방향키로도 걸을 수 있어요.`);};
 const onKey=e=>{if(e.type==='keyup'){held.delete(e.code);return;}if(blocked()||e.ctrlKey||e.altKey||e.metaKey||e.target.closest?.('input,textarea,select,[contenteditable]:not([contenteditable="false"])'))return;const keys={ArrowUp:'up',KeyW:'up',ArrowDown:'down',KeyS:'down',ArrowLeft:'left',KeyA:'left',ArrowRight:'right',KeyD:'right'};if(keys[e.code]){e.preventDefault();cancelRoute();follow();held.add(e.code);}if(e.code==='Enter'&&e.type==='keydown'&&!e.repeat&&!e.target.closest('button,a')){const b=map.buildings.find(b=>distance(position,{x:map.nodes[b.entry][0],y:map.nodes[b.entry][1]})<48);if(b)tryEnter(b.id);}};
 window.addEventListener('keydown',onKey,{signal:ctx.signal});window.addEventListener('keyup',onKey,{signal:ctx.signal});
 window.addEventListener('blur',()=>{held.clear();cancelRoute();},{signal:ctx.signal});document.addEventListener('visibilitychange',()=>{held.clear();cancelRoute();lastTime=0;},{signal:ctx.signal});
 bindDirectionPad(host,'[data-dir]',b=>b.dataset.dir,{signal:ctx.signal,blocked,press:d=>{cancelRoute();follow();held.add(d);},release:d=>held.delete(d),tap:d=>{cancelRoute();follow();const v=MAP_VECTORS[d];position=movePoint(map,position,v.x*10,v.y*10);}});
 function walkTo(e){
  cancelRoute();const rect=canvas.getBoundingClientRect(),target=camera.world({x:e.clientX-rect.left,y:e.clientY-rect.top});const result=findPath(map,position,target);
  if(result){path=result;goal=null;held.clear();speech.hidden=true;narration.stop();follow();if(reduced){position=result.at(-1);path=[];}}
  else hint('그곳은 걸을 수 없어요. 밝은 흙길이나 시설 이름을 눌러 주세요.');
  canvas.focus({preventScroll:true});
 }
 const clearPointer=bindMapCameraPointer(host,{camera,player:()=>position,blocked,signal:ctx.signal,
  control:el=>!!el.closest('.map-controls,.map-next-card,.map-companion,.map-speech,.map-repair,.map-encounter-attack'),
  onStart(){cancelRoute();held.clear();speech.hidden=true;narration.stop();},
  onMove:syncTools,onTap:e=>{if(e.target!==canvas)return;if(camera.mode!=='hand')walkTo(e);else canvas.focus({preventScroll:true});}
 });
 function resize(){width=host.clientWidth;height=host.clientHeight;const dpr=Math.min(devicePixelRatio||1,2);canvas.width=Math.round(width*dpr);canvas.height=Math.round(height*dpr);g.setTransform(dpr,0,0,dpr,0,0);camera.resize(width,height,position);}
 const ro=new ResizeObserver(resize);ro.observe(host);resize();
 function sprite(img,name,p,isWalking,row){if(name==='soli'){const h=63*scale,w=h*160/180,x=p.x*scale-cam.x-w/2,y=p.y*scale-cam.y-h+(isWalking&&!reduced?Math.sin(time*15)*3:0);g.save();if(row===1){g.translate(x+w,y);g.scale(-1,1);g.drawImage(img,0,0,w,h);}else g.drawImage(img,x,y,w,h);g.restore();return;}const frames=atlas.atlas[name].frames;const f=frames[row*4+(isWalking&&!reduced?Math.floor(time*8)%4:0)];const worldHeight=name==='student'?91:75;const factor=worldHeight/f.pivotY;const x=p.x*scale-cam.x-f.pivotX*factor*scale,y=p.y*scale-cam.y-f.pivotY*factor*scale;g.drawImage(img,f.left,f.top,f.width,f.height,x,y,f.width*factor*scale,f.height*factor*scale);}
 let lastLabelView='';
 function draw(now){if(ctx.signal.aborted)return;const dt=lastTime?Math.min((now-lastTime)/1000,.04):0;lastTime=now;time+=dt;
  const paused=Boolean(document.querySelector('dialog[open]')||host.querySelector('.map-repair[open]'))||document.hidden;
  if(paused){held.clear();cancelRoute();walking=false;}else{
   const before={...position};let dx=0,dy=0;for(const code of held){if(['ArrowUp','KeyW','up'].includes(code))dy--;if(['ArrowDown','KeyS','down'].includes(code))dy++;if(['ArrowLeft','KeyA','left'].includes(code))dx--;if(['ArrowRight','KeyD','right'].includes(code))dx++;}
   if(dx||dy){const length=Math.hypot(dx,dy);position=movePoint(map,position,dx/length*185*dt,dy/length*185*dt);}
   else if(path.length){const target=path[0],d=distance(position,target);if(d<5){position={...target};path.shift();}else position=movePoint(map,position,(target.x-position.x)/d*185*dt,(target.y-position.y)/d*185*dt);}
   walking=distance(before,position)>.05;if(walking){const dx=position.x-before.x,dy=position.y-before.y;dir=Math.abs(dx)>Math.abs(dy)?dx>0?2:1:dy>0?0:3;if(distance(trail.at(-1),position)>5)trail.push({...position});if(trail.length>80)trail.shift();let d=0,target=trail[0];for(let i=trail.length-1;i>0;i--){d+=distance(trail[i],trail[i-1]);if(d>59){target=trail[i-1];break;}}follower={...target};}
   if(goal&&!path.length){const b=map.buildings.find(b=>b.id===goal);if(distance(position,{x:map.nodes[b.entry][0],y:map.nodes[b.entry][1]})<35)tryEnter(goal);else cancelRoute();}
   if(entered||ctx.signal.aborted)return;
  }
  if(!paused)camera.update(position,dt);
  scale=camera.scale;cam.x=-camera.x;cam.y=-camera.y;
  g.clearRect(0,0,width,height);g.imageSmoothingEnabled=false;const progress=reveal(now),key=restoredIds.map(id=>progress(id)).join('|');
  if(key!==lastRestoration){land.clearRect(0,0,map.width,map.height);paintRestoredBuildings(land,{width:map.width,height:map.height,completed:isRestored,progress});lastRestoration=key;}
  g.drawImage(background,-cam.x,-cam.y,map.width*scale,map.height*scale);g.drawImage(landscape,-cam.x,-cam.y,map.width*scale,map.height*scale);
  for(const b of map.buildings){const done=b.id==='core'?ctx.save.finaleCompleted:completeStage(ctx.save,b.id);if(done||b.id===nextId()){const [x,y]=map.nodes[b.entry];g.beginPath();g.ellipse(x*scale-cam.x,y*scale-cam.y,34*scale,12*scale,0,0,Math.PI*2);g.fillStyle=done?'rgba(171,230,152,.55)':'rgba(255,220,112,.65)';g.fill();}const label=labels.get(b.id),lx=b.label[0]*scale-cam.x,ly=b.label[1]*scale-cam.y;label.style.visibility=lx<-60||lx>width+60||ly<-60||ly>height+60?'hidden':'';label.style.left=`${Math.max(86,Math.min(width-86,lx))}px`;label.style.top=`${Math.max(98,Math.min(height-(width<600?254:150),ly))}px`;}
  const reactions=encounters.update({hero:position,ally:follower,project:p=>({x:p.x*scale-cam.x,y:p.y*scale-cam.y}),scale,now});
  for(const item of [{p:position,img:student,name:'student'},{p:follower,img:soli,name:'soli'}].sort((a,b)=>a.p.y-b.p.y)){
   const main=item.name==='student',pose=main?reactions.hero:reactions.ally;
   if(!drawEncounterActor(g,main?heroPose:allyPose,{x:item.p.x*scale-cam.x,y:item.p.y*scale-cam.y},(main?91:63)*scale,pose?{...pose,dx:pose.dx*scale}:null))sprite(item.img,item.name,item.p,walking,dir);
  }
  const labelView=`${width},${height},${scale},${cam.x},${cam.y}`;
  if(lastLabelView!==labelView){lastLabelView=labelView;guardLabels();}
  const companion=host.querySelector('.map-companion');const sx=follower.x*scale-cam.x,sy=follower.y*scale-cam.y;companion.style.left=`${sx}px`;companion.style.top=`${sy-77*scale}px`;speech.style.left=`${Math.max(18,Math.min(width-340,sx+35))}px`;speech.style.top=`${Math.max(85,Math.min(height-190,sy-145))}px`;
  frame=requestAnimationFrame(draw);
 }
 frame=requestAnimationFrame(draw);ctx.signal.addEventListener('abort',()=>{encounters.destroy();cancelAnimationFrame(frame);ro.disconnect();held.clear();},{once:true});
}
