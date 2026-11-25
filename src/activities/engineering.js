import {touchDrag} from '../touch.js';
import {validateDevice} from '../model.js';
import {html,button,message,prop} from '../ui.js';
import {icon} from '../icons.js';
import {sound} from '../audio.js';
import {pipeArtwork} from '../pipe-art.js';
import {fanArtwork} from '../device-art.js';
const PARTS=[{id:'balloon',slot:'source',name:'풍선 공급부',prop:'balloon'},{id:'pump',slot:'source',name:'손 펌프',prop:'pump'},{id:'straight',slot:'pipe',name:'일자 관'},{id:'elbow',slot:'pipe',name:'굽은 관'},{id:'cap',slot:'pipe',name:'막힌 관'},{id:'nozzle',slot:'nozzle',name:'노즐',prop:'nozzle'}];
function pipeArt(type){return pipeArtwork(type,0,{className:'part-diagram'});}
export function mountEngineering(host,task,ctx){
 let design={source:null,pipe:null,nozzle:false,direction:'forward',valve:false,...ctx.draft?.design},attempts=0,successful=false,lastResult=null;
 const targetName={car:'자동차',core:'공기 코어',windmill:'풍차',fan:'팬'}[task.target];
 const illustrations={
  car:'<img class="generated-target car-art" src="/assets/visuals/balloon-car.webp" alt="자동차 차체" draggable="false">',
  core:'<img class="generated-target core-art" src="/assets/visuals/air-core.webp" alt="중앙 공기 코어" draggable="false">',
  windmill:prop('windmill','build-target','공기로 움직일 풍차'),
  fan:fanArtwork('build-target')
 };
 host.innerHTML=`<div class="engineering-layout">
  <section class="workbench-panel" aria-label="공기 장치 조립대">
   <div class="assembly-scene">
    <div class="design-slots"></div>
    <div class="design-destination">
     <div class="output-path" aria-hidden="true">${icon('arrow')}</div>
     <div class="design-target target-${task.target}">${illustrations[task.target]}</div>
     <span class="target-caption">${targetName}</span>
    </div>
   </div>
   <div class="engineering-controls"><button class="button secondary valve-control"></button><button class="button secondary direction-control"></button></div>
  </section>
  <aside class="test-panel" aria-label="장치 부품과 결과">
   <div class="parts-tray" role="group" aria-label="장치 부품"></div>
   <div class="device-actions"><button class="button secondary clear-device">${icon('rotate')} 다시 고르기</button></div>
   <div class="activity-feedback"></div><div class="evidence-slot"></div>
  </aside>
 </div>`;
 const feedback=host.querySelector('.activity-feedback'),slots=host.querySelector('.design-slots'),tray=host.querySelector('.parts-tray'),clearButton=host.querySelector('.clear-device'),valveButton=host.querySelector('.valve-control'),directionButton=host.querySelector('.direction-control');
 function save(){ctx.saveDraft({design});}
 function assign(part,slot){
  if(successful||ctx.signal.aborted)return;
  if(part.slot!==slot){message(feedback,'부품과 연결 칸의 이름을 맞춰 주세요.');return;}
  if(slot==='nozzle'?design.nozzle:design[slot]===part.id)return;
  if(slot==='nozzle')design.nozzle=true;else design[slot]=part.id;
  sound('connect');render();slots.querySelector(`[data-slot="${slot}"]`)?.classList.add('just-snapped');if(design.valve)test();
 }
 for(const part of PARTS){
  const b=button(`${part.prop?prop(part.prop):pipeArt(part.id)}<span>${part.name}</span>`,()=>assign(part,part.slot),'part-card');
  b.dataset.part=part.id;b.dataset.slot=part.slot;b.setAttribute('aria-label',`${part.name} 연결`);
  touchDrag(b,{signal:ctx.signal,selector:'.design-slot',onDrop:target=>assign(part,target.dataset.slot)});b.addEventListener('pointerdown',()=>slots.dataset.dragging=part.slot,{signal:ctx.signal});for(const type of ['pointerup','pointercancel','lostpointercapture'])b.addEventListener(type,()=>delete slots.dataset.dragging,{signal:ctx.signal});tray.append(b);
 }
 function hasAllParts(){return Boolean(design.source&&design.pipe&&design.nozzle);}
 function guideNext(){
  if(successful){ctx.nextAction?.([]);return;}
  const placed=hasAllParts();
  if(lastResult||(placed&&design.valve)){
   ctx.guide?.('다시 살펴봐요',lastResult||'부품이나 공기 방향을 바꿔 다시 시험해요.');
   ctx.nextAction?.('.assembly-scene');
   return;
  }
  ctx.guide?.(placed?'밸브 열기':'부품 선택',placed?'밸브를 열어 장치를 시험해요.':'부품을 눌러 끼우거나 연결 칸으로 끌어 놓아요.',[
   '공급부에서 나온 공기가 관과 노즐을 지나가요.',
   '공기가 지나갈 길을 처음부터 끝까지 따라가 봐요.',
   task.target==='car'?'공기가 나가는 방향과 자동차가 움직이는 방향을 시험해 봐요.':'부품을 바꿔 보고 공기가 움직일 장치에 도착하는지 살펴봐요.'
  ]);
  ctx.nextAction?.(placed?'.valve-control':'.parts-tray');
 }
 function render(){
  host.querySelector('.test-panel').classList.toggle('is-success',successful);
  guideNext();
  slots.replaceChildren();
  for(const [slot,label]of [['source','공급부'],['pipe','관'],['nozzle','노즐']]){
   const id=slot==='nozzle'?(design.nozzle?'nozzle':null):design[slot],part=PARTS.find(p=>p.id===id);
   const box=html(`<div class="design-slot ${part?'filled':''} ${slot==='nozzle'&&design.direction==='backward'?'backward':''}" role="group" aria-label="${label} 연결 칸${part?': '+part.name:''}"><span class="slot-caption">${label}</span><span class="slot-art">${part?(part.prop?prop(part.prop):pipeArt(part.id)):'<span class="slot-plus" aria-hidden="true">+</span>'}</span></div>`);
   box.dataset.slot=slot;
   box.ondragover=event=>event.preventDefault();
   box.ondrop=event=>{event.preventDefault();const part=PARTS.find(p=>p.id===event.dataTransfer.getData('text/plain'));if(part)assign(part,slot);};slots.append(box);
  }
  for(const b of tray.children){const part=PARTS.find(p=>p.id===b.dataset.part),placed=part.slot==='nozzle'?design.nozzle:design[part.slot]===part.id;b.classList.toggle('selected',Boolean(placed));b.setAttribute('aria-pressed',String(Boolean(placed)));b.disabled=successful;}
  valveButton.innerHTML=`<span class="control-state">${design.valve?'밸브 닫기':'밸브 열기'}</span>`;valveButton.setAttribute('aria-pressed',String(design.valve));valveButton.disabled=successful||!hasAllParts();
  directionButton.innerHTML=`<span class="control-state">공기 방향</span>${icon(design.direction==='forward'?'arrow':'back')}`;directionButton.setAttribute('aria-label',`공기 방향 ${design.direction==='forward'?'앞쪽':'뒤쪽'}, 눌러 바꾸기`);directionButton.disabled=successful;
  const scene=host.querySelector('.assembly-scene');scene.dataset.direction=design.direction;scene.dataset.valve=design.valve?'open':'closed';
  host.querySelector('.target-caption').textContent=task.target==='car'&&successful?'자동차 →':targetName;
  clearButton.hidden=successful||!(design.source||design.pipe||design.nozzle||design.direction!=='forward');save();
 }
 valveButton.onclick=()=>{if(successful||ctx.signal.aborted||!hasAllParts())return;design.valve=!design.valve;sound(design.valve?'pump':undefined);if(!design.valve){lastResult=null;feedback.replaceChildren();render();return;}test();if(lastResult)sound('retry');};
 directionButton.onclick=()=>{if(successful||ctx.signal.aborted)return;design.direction=design.direction==='forward'?'backward':'forward';sound();render();if(design.valve)test();};
 clearButton.onclick=()=>{if(successful||ctx.signal.aborted)return;attempts=0;lastResult=null;design={source:null,pipe:null,nozzle:false,direction:'forward',valve:false};feedback.replaceChildren();render();};
 function test(){
  if(successful||ctx.signal.aborted)return;
  attempts++;const result=validateDevice(design,task);
  if(!result.ok){lastResult='장치가 움직이지 않았어요. 부품과 공기 길을 살펴보고 다시 시험해요.';message(feedback,lastResult);render();return;}
  lastResult=null;successful=true;host.querySelector('.assembly-scene').classList.add(task.target==='car'?'car-air-running':'air-running');host.querySelector('.design-target').classList.add(task.target==='car'?'car-moving':task.target==='core'?'core-active':'device-powered');
  if(task.target==='car')host.querySelector('.car-art').alt='움직이는 풍선 자동차';
  feedback.replaceChildren();sound('success');render();
  ctx.complete(task.why,{design:{...design},attempts});
 }
 ctx.playback?.({steps:()=>[
  {label:'고른 부품의 연결을 살펴봐요.',target:hasAllParts()?'.design-slots':'.parts-tray',run:()=>{if(successful||ctx.signal.aborted||!hasAllParts())return false;host.querySelector('.assembly-scene').dataset.playback='inspect';},wait:900},
  {label:'이제 밸브를 직접 눌러 열고 장치가 움직이는지 봐요.',target:'.valve-control',run:()=>false,wait:600}
 ],onStop:()=>{host.querySelector('.assembly-scene')?.removeAttribute('data-playback');if(!ctx.signal.aborted)guideNext();}});
 render();
}
