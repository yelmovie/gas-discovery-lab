import {emphasizeConcept} from '../concept-focus.js';
import {touchDrag} from '../touch.js';
import {GASES} from '../data.js';
import {validateDelivery} from '../model.js';
import {button,choices,escapeHTML,announce,shuffle} from '../ui.js';
import {icon} from '../icons.js';
import {sound} from '../audio.js';
const USE_VISUALS={
 nitrogen:{src:'/assets/prop-packet.webp',alt:'질소를 넣어 포장한 과자 봉지'},
 oxygen:{src:'/assets/visuals/oxygen-support-v1.webp',alt:'산소 용기에 호스와 호흡 마스크가 연결된 가상 호흡 지원 장치'},
 carbon:{src:'/assets/prop-soda.webp',alt:'이산화 탄소가 녹아 있는 탄산음료'},
 extinguisher:{src:'/assets/visuals/co2-extinguisher-v1.webp',alt:'넓은 검은 방사혼이 달린 이산화 탄소 소화기'}
};
// 시설 그림은 요청을 보여 주고, 기체가 실제로 쓰이는 그림은 배송이 끝난 뒤에 보여 준다.
const FACILITY_ART={'delivery-1':'/assets/visuals/facility-snack-v1.webp','delivery-2':'/assets/visuals/facility-breathing-v1.webp','delivery-3':'/assets/visuals/facility-soda-v1.webp','delivery-4':'/assets/visuals/facility-safety-v1.webp'};
const useVisual=(gas,task)=>USE_VISUALS[gas==='carbon'&&task.id==='delivery-4'?'extinguisher':gas];
export function mountDelivery(host,task,ctx){
 let selected=ctx.draft?.selected||null,reason=ctx.draft?.reason||null,read=new Set(ctx.draft?.read||[]),delivered=false,previewId=null,misses=Number.isFinite(ctx.draft?.misses)?Math.max(0,ctx.draft.misses):0;
 const reasons=[task.reason,...['다른 물질과 쉽게 반응하지 않아요.','사람의 호흡에 필요해요.','물에 녹아 탄산음료를 만들어요.','불이 타는 것을 돕지 않아요.'].filter(x=>x!==task.reason).slice(0,2)];
 // 이유와 기체 카드 순서는 화면을 열 때마다 섞는다(2026-11-21: 정답이 늘 첫 자리여서 첫 칸만 눌러도 통과하던 문제).
 const orderedReasons=shuffle(reasons);
 // 4번 안전 시설(2026-11-21, 3-3b A17): 카드를 눌러서는 성질만 살펴보고, 기체는 시설 공급관으로 직접 끌어 넣어야 실린다.
 // 배우는 것: 조사한 성질(불이 타는 것을 돕지 않음)을 근거로 고른 기체를 장치에 손으로 연결해 「성질 → 쓰임」을 잇는다. 키보드는 공급관의 「살펴본 기체 넣기」 버튼.
 const mustDrag=task.id==='delivery-4';
 host.innerHTML=`<div class="delivery-layout">
  <section class="lab-panel research-panel" aria-label="기체 조사">
   <div class="gas-cards" role="group" aria-label="조사할 기체. 카드 색은 구분용이에요."></div>
   <div class="gas-information" hidden></div>
  </section>
  <aside class="lab-panel facility-panel" aria-label="${escapeHTML(task.facility)}">
   <div class="facility-request" aria-label="${escapeHTML(task.facility)}의 부탁">
    <img class="facility-art" src="${FACILITY_ART[task.id]}" alt="" draggable="false">
    <p class="facility-copy">${escapeHTML(task.goal)}</p>
    <span class="supply-port" aria-hidden="true">${icon('flask')}${icon('arrow')}</span>
   </div>
   <div class="reason-slot" aria-label="시설에 필요한 기체의 성질" hidden></div>
   <div class="evidence-slot"></div>
  </aside>
 </div>`;
 const cards=host.querySelector('.gas-cards'),information=host.querySelector('.gas-information'),port=host.querySelector('.supply-port'),reasonSlot=host.querySelector('.reason-slot');
 // 키보드 사용자는 끌어 넣을 자리(시설 카드)에 Tab으로 가서 Enter·Space로 살펴본 기체를 넣는다. 마우스·손가락은 끌어 넣어야 한다.
 const dropZone=host.querySelector('.facility-request');
 if(mustDrag){dropZone.tabIndex=0;dropZone.setAttribute('role','button');dropZone.addEventListener('keydown',event=>{if(event.key!=='Enter'&&event.key!==' ')return;event.preventDefault();if(previewId)chooseGas(previewId);},{signal:ctx.signal});}
 function save(){ctx.saveDraft({selected,reason,read:[...read],...(misses?{misses}:{})});}
 function chooseGas(id){if(delivered||ctx.signal.aborted)return;previewId=null;
  if(selected!==id){reason=null;reasonSlot.querySelectorAll('.choice').forEach(button=>{button.classList.remove('selected');button.setAttribute('aria-pressed','false');});}
  selected=id;read.add(id);sound();render();port.classList.remove('just-loaded');void port.offsetWidth;port.classList.add('just-loaded');}
 function inspectGas(id){if(delivered||ctx.signal.aborted)return;previewId=id;read.add(id);sound();render();}
 for(const gas of shuffle(GASES)){
  const b=button(`<span class="gas-orb gas-tank" style="--gas-color:${gas.color}" aria-hidden="true"><img src="/assets/visuals/gas-${gas.id}-v1.webp" alt="" draggable="false"><b>${escapeHTML(gas.symbol)}</b></span><strong>${gas.name}</strong>`,()=>mustDrag?inspectGas(gas.id):chooseGas(gas.id),'gas-card');
  b.dataset.gas=gas.id;b.setAttribute('aria-label',`${gas.name} 조사`);
  touchDrag(b,{signal:ctx.signal,selector:'.facility-request',onDrop:()=>chooseGas(gas.id)});
  cards.append(b);
 }
 function showInformation(){
  if(delivered||ctx.signal.aborted)return;
  for(const b of cards.children)b.classList.toggle('is-observing',b.dataset.gas===previewId);
  const gas=GASES.find(g=>g.id===(previewId||selected));
  information.hidden=!gas;
  if(!gas){information.replaceChildren();return;}
  information.innerHTML=`<div class="gas-use-copy" aria-label="${escapeHTML(gas.name)}의 성질"><ul>${gas.facts.map(f=>`<li>${emphasizeConcept(f,ctx.terms)}</li>`).join('')}</ul></div>`;
 }
 function guideSelection(){
  const placing=mustDrag&&previewId,choosingReason=selected&&!placing;
  const direction=placing?'보낼 기체 통을 공급관에 끌어 넣어요.':choosingReason?'시설에 필요한 성질을 골라요.':'기체 통을 눌러 성질을 살펴봐요.';
  ctx.guide?.(placing?'기체 넣기':choosingReason?'성질 선택':'기체 조사',direction,['시설이 무엇을 필요로 하는지 먼저 살펴봐요.','기체 카드에 있는 성질을 비교해요.','고른 기체와 성질을 시설의 부탁과 함께 살펴봐요.']);
  ctx.nextAction?.(placing?'.facility-request':choosingReason?'.reason-slot .choice-group':'.gas-cards');
 }
 function render(){
  for(const b of cards.children){const active=b.dataset.gas===selected;b.classList.toggle('selected',active);b.setAttribute('aria-pressed',String(active));b.disabled=delivered;}
  reasonSlot.hidden=!selected||Boolean(mustDrag&&previewId);
  guideSelection();
  showInformation();
  port.classList.toggle('ready',Boolean(selected));
  if(mustDrag){const look=GASES.find(g=>g.id===previewId);dropZone.setAttribute('aria-label',look?`살펴본 ${look.name} 기체를 공급관에 넣기`:'기체 통을 끌어 넣는 공급관');}
  save();
 }
 reasonSlot.append(choices(orderedReasons,value=>{if(delivered||ctx.signal.aborted)return;reason=value;sound();render();deliver(true);},{selected:reason,terms:ctx.terms}));
 function deliver(byLearner=false){
  if(delivered||ctx.signal.aborted||!selected||!reason)return;
  const result=validateDelivery(selected,reason,task);
  if(!result.ok){
   if(byLearner){misses++;save();}
   const hint='시설의 부탁과 고른 기체의 성질을 다시 비교해요.';
   ctx.guide?.('다시 살펴봐요',hint);ctx.nextAction?.('.gas-cards, .reason-slot .choice-group');announce(hint);if(byLearner)sound('retry');
   return;
  }
  delivered=true;
  previewId=null;ctx.nextAction?.([]);
  cards.querySelectorAll('button').forEach(b=>b.disabled=true);
  reasonSlot.querySelectorAll('button').forEach(b=>b.disabled=true);
  host.querySelector('.research-panel').classList.add('delivery-complete');
  const visual=useVisual(task.gas,task);
  information.innerHTML=`<img class="gas-use-image" src="${visual.src}" alt="${escapeHTML(visual.alt)}" draggable="false">`;
  port.classList.add('connected');sound('connect');
  ctx.complete(task.why,{gas:selected,reason,investigated:[...read],attempts:misses+1,firstTry:misses===0});
 }
 host.querySelector('.facility-request').addEventListener('dragover',event=>{if(delivered)return;event.preventDefault();port.classList.add('drag-over');},{signal:ctx.signal});
 host.querySelector('.facility-request').addEventListener('dragleave',()=>port.classList.remove('drag-over'),{signal:ctx.signal});
 host.querySelector('.facility-request').addEventListener('drop',event=>{event.preventDefault();port.classList.remove('drag-over');const id=event.dataTransfer.getData('text/plain');if(GASES.some(gas=>gas.id===id))chooseGas(id);},{signal:ctx.signal});
 ctx.playback?.({steps:()=>GASES.map(gas=>({label:`${gas.name}의 성질을 살펴봐요.`,target:`.gas-card[data-gas="${gas.id}"]`,run:()=>{if(delivered||ctx.signal.aborted)return;previewId=gas.id;showInformation();},wait:1800})),onStop:()=>{previewId=null;showInformation();if(!delivered&&!ctx.signal.aborted)guideSelection();}});
 render();
}
