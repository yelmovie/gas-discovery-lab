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
 let design={source:null,pipe:null,nozzle:false,direction:'forward',valve:false,...ctx.draft?.design},attempts=0,testing=false,successful=false,lastResult=null;
 const targetName={car:'자동차',core:'공기 코어',windmill:'풍차',fan:'팬'}[task.target];
 host.innerHTML=`<div class="engineering-layout"><section class="lab-panel workbench-panel"><div class="assembly-scene"><div class="design-slots"></div><div class="design-destination"><div class="output-path" aria-hidden="true">${icon('arrow')}</div><div class="design-target target-${task.target}">${task.target==='car'?'<img class="generated-target car-art" src="/assets/visuals/balloon-car.webp" alt="공기는 왼쪽 뒤로 내보내고 오른쪽 앞으로 움직이는 풍선 자동차" draggable="false">':task.target==='core'?'<img class="generated-target core-art" src="/assets/visuals/air-core.webp" alt="공기를 받아 마을 시설에 보내는 중앙 공기 코어" draggable="false">':task.target==='windmill'?prop('windmill','build-target','공기로 움직일 풍차'):fanArtwork('build-target')}</div><span class="target-caption">${targetName}</span></div></div><div class="engineering-controls"><button class="button secondary valve-control"></button><button class="button secondary direction-control"></button></div></section><aside class="lab-panel test-panel"><div class="parts-tray" role="group" aria-label="장치 부품"></div><div class="device-actions"><button class="button primary test-device">${icon('flask')} 장치 시험</button><button class="button secondary clear-device">${icon('rotate')} 다시 고르기</button></div><div class="activity-feedback"></div><div class="evidence-slot"></div></aside></div>`;
 const feedback=host.querySelector('.activity-feedback'),slots=host.querySelector('.design-slots'),tray=host.querySelector('.parts-tray'),testButton=host.querySelector('.test-device'),clearButton=host.querySelector('.clear-device'),valveButton=host.querySelector('.valve-control'),directionButton=host.querySelector('.direction-control');
 function save(){ctx.saveDraft({design});}
 function assign(part,slot){
  if(successful||ctx.signal.aborted)return;
  if(part.slot!==slot){message(feedback,'부품과 연결 칸의 이름을 맞춰 주세요.');return;}
  if(slot==='nozzle'?design.nozzle:design[slot]===part.id)return;
  if(slot==='nozzle')design.nozzle=true;else design[slot]=part.id;
  sound('connect');render();if(testing)test();
 }
 for(const part of PARTS){
  const b=button(`${part.prop?prop(part.prop):pipeArt(part.id)}<span>${part.name}</span>`,()=>assign(part,part.slot),'part-card');
  b.dataset.part=part.id;b.dataset.slot=part.slot;b.setAttribute('aria-label',`${part.name} 연결`);
  touchDrag(b,{signal:ctx.signal,selector:'.design-slot',onDrop:target=>assign(part,target.dataset.slot)});tray.append(b);
 }
 function nextParts(){return !design.source?'.part-card[data-slot="source"]':!design.pipe?'.part-card[data-slot="pipe"]':!design.nozzle?'.part-card[data-slot="nozzle"]':null;}
 function errorTarget(kind){return kind==='source'?'.part-card[data-slot="source"]':['pipe','route'].includes(kind)?'.part-card[data-slot="pipe"]':kind==='nozzle'?'.part-card[data-slot="nozzle"]':kind==='direction'?'.direction-control':'.valve-control';}
 function guideNext(){
  if(lastResult){ctx.guide?.('다시 살펴봐요',lastResult.message);ctx.nextAction?.(errorTarget(lastResult.kind));return;}
  const placed=Boolean(design.source&&design.pipe&&design.nozzle);
  ctx.guide?.(successful?'장치 완성':testing?'시험과 수정':placed?'장치 시험':'부품 선택',successful?'공기의 힘으로 장치가 움직여요.':testing?'시험 결과를 보고 부품이나 방향을 바꿔요.':placed?design.valve?'공기 방향을 정하고 장치를 시험해요.':'밸브를 열어 공기 길을 이어요.':!design.source?'공기를 보낼 공급부를 골라요.':!design.pipe?'공기가 지나갈 관을 골라요.':'공기가 나갈 노즐을 연결해요.',['공기 공급부, 관, 노즐이 차례로 이어져야 해요.','공기가 통과할 수 있는 관인지, 밸브가 열렸는지 살펴봐요.',task.target==='car'?'자동차가 갈 방향과 공기가 나갈 방향을 비교해 봐요.':'노즐의 출구가 움직일 장치를 향하는지 확인해요.']);
  ctx.nextAction?.(successful?[]:nextParts()||(!design.valve?'.valve-control':['.direction-control','.test-device']));
 }
 function render(){
  host.querySelector('.test-panel').classList.toggle('is-success',successful);
  guideNext();
  slots.replaceChildren();
  for(const [slot,label]of [['source','공급부'],['pipe','관'],['nozzle','노즐']]){
   const id=slot==='nozzle'?(design.nozzle?'nozzle':null):design[slot],part=PARTS.find(p=>p.id===id);
   const box=html(`<div class="design-slot ${part?'filled':''} ${slot==='nozzle'&&design.direction==='backward'?'backward':''}" role="group" aria-label="${label} 연결 칸${part?': '+part.name:''}"><span class="slot-caption"><span class="slot-order">${slots.children.length+1}</span><span>${part?part.name:label}</span></span><span class="slot-art">${part?(part.prop?prop(part.prop):pipeArt(part.id)):'<span class="slot-plus">+</span>'}</span></div>`);
   box.dataset.slot=slot;
   box.ondragover=event=>event.preventDefault();
   box.ondrop=event=>{event.preventDefault();const part=PARTS.find(p=>p.id===event.dataTransfer.getData('text/plain'));if(part)assign(part,slot);};slots.append(box);
  }
  for(const b of tray.children){const part=PARTS.find(p=>p.id===b.dataset.part),placed=part.slot==='nozzle'?design.nozzle:design[part.slot]===part.id;b.classList.toggle('selected',Boolean(placed));b.setAttribute('aria-pressed',String(Boolean(placed)));b.disabled=successful;}
  valveButton.innerHTML=`<span class="control-state">밸브 ${design.valve?'열림':'닫힘'}</span>`;valveButton.setAttribute('aria-label',`밸브 ${design.valve?'닫기':'열기'}`);valveButton.setAttribute('aria-pressed',String(design.valve));valveButton.disabled=successful;
  directionButton.innerHTML=`<span class="control-state">공기 방향 ${design.direction==='forward'?'→':'←'}</span>`;directionButton.setAttribute('aria-label',`공기 방향 ${design.direction==='forward'?'앞쪽':'뒤쪽'}, 눌러 바꾸기`);directionButton.disabled=successful;
  const scene=host.querySelector('.assembly-scene');scene.dataset.direction=design.direction;scene.dataset.valve=design.valve?'open':'closed';
  host.querySelector('.target-caption').textContent=task.target==='car'&&successful?'자동차 →':targetName;
  testButton.hidden=testing||successful;clearButton.hidden=successful;save();
 }
 valveButton.onclick=()=>{if(successful||ctx.signal.aborted)return;design.valve=!design.valve;sound();render();if(testing)test();};
 directionButton.onclick=()=>{if(successful||ctx.signal.aborted)return;design.direction=design.direction==='forward'?'backward':'forward';sound();render();if(testing)test();};
 clearButton.onclick=()=>{if(successful||ctx.signal.aborted)return;testing=false;attempts=0;lastResult=null;design={source:null,pipe:null,nozzle:false,direction:'forward',valve:false};feedback.replaceChildren();render();};
 function test(){
  if(successful||ctx.signal.aborted)return;
  testing=true;attempts++;const result=validateDevice(design,task);
  if(!result.ok){lastResult=result;message(feedback,result.message);render();return;}
  lastResult=null;successful=true;host.querySelector('.assembly-scene').classList.add(task.target==='car'?'car-air-running':'air-running');host.querySelector('.design-target').classList.add(task.target==='car'?'car-moving':task.target==='core'?'core-active':'device-powered');
  feedback.replaceChildren();sound('success');render();
  ctx.complete(task.why,{design:{...design},attempts});
 }
 ctx.playback?.({steps:()=>[
  {label:'고른 부품의 연결을 살펴봐요.',target:nextParts()||'.design-slots',run:()=>{if(successful||ctx.signal.aborted)return false;if(nextParts()){ctx.guide?.('부품 선택','공급부·관·노즐을 먼저 골라요.');ctx.nextAction?.(nextParts());return false;}host.querySelector('.assembly-scene').dataset.playback='inspect';},wait:900},
  {label:'밸브를 열어 공기를 보내요.',target:'.valve-control',run:()=>{if(successful||ctx.signal.aborted)return false;if(!design.valve){design.valve=true;sound();render();}host.querySelector('.assembly-scene').dataset.playback='flow';},wait:1000},
  {label:'지금 설계한 장치를 시험해요.',target:'.test-device',run:test,wait:1200}
 ],onStop:()=>{host.querySelector('.assembly-scene')?.removeAttribute('data-playback');if(!ctx.signal.aborted)guideNext();}});
 testButton.onclick=()=>{test();if(lastResult)sound('retry');};render();
}
