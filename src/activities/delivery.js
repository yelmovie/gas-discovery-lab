import {touchDrag} from '../touch.js';
import {GASES} from '../data.js';
import {validateDelivery} from '../model.js';
import {button,choices,escapeHTML,announce} from '../ui.js';
import {icon} from '../icons.js';
import {sound} from '../audio.js';
const USE_VISUALS={
 nitrogen:{src:'/assets/prop-packet.webp',alt:'질소를 넣어 포장한 과자 봉지',caption:'식품 포장'},
 oxygen:{src:'/assets/visuals/oxygen-support-v1.webp',alt:'산소 용기에 호스와 호흡 마스크가 연결된 가상 호흡 지원 장치',caption:'호흡 지원'},
 carbon:{src:'/assets/prop-soda.webp',alt:'이산화 탄소가 녹아 있는 탄산음료',caption:'탄산음료'},
 extinguisher:{src:'/assets/visuals/co2-extinguisher-v1.webp',alt:'넓은 검은 방사혼이 달린 이산화 탄소 소화기',caption:'일부 소화기'}
};
const useVisual=(gas,task)=>USE_VISUALS[gas==='carbon'&&task.id==='delivery-4'?'extinguisher':gas];
const useImage=(visual,cls='gas-use-image')=>`<img class="${cls}" src="${visual.src}" alt="${escapeHTML(visual.alt)}" draggable="false">`;
export function mountDelivery(host,task,ctx){
 let selected=ctx.draft?.selected||null,reason=ctx.draft?.reason||null,read=new Set(ctx.draft?.read||[]),delivered=false,previewId=null;
 const reasons=[task.reason,...['다른 물질과 쉽게 반응하지 않아요.','사람의 호흡에 필요해요.','물에 녹아 탄산음료를 만들어요.','불이 타는 것을 돕지 않아요.'].filter(x=>x!==task.reason).slice(0,2)];
 // A fixed permutation prevents the first position from always being the answer.
 const orderedReasons=task.id.endsWith('2')?[reasons[1],reasons[0],reasons[2]]:task.id.endsWith('3')?[reasons[1],reasons[2],reasons[0]]:reasons;
 host.innerHTML=`<div class="delivery-layout"><section class="lab-panel research-panel"><div class="gas-cards" role="group" aria-label="조사할 기체"></div><div class="gas-information"></div><p class="gas-color-note">카드의 색은 구분용 표시예요.</p></section><aside class="lab-panel facility-panel"><div class="facility-request" aria-label="${escapeHTML(task.facility)}의 부탁"><p>${escapeHTML(task.goal)}</p></div><div class="reason-slot" aria-label="시설에 필요한 기체의 성질"></div><div class="supply-port" role="status">${icon('flask')}<span>배송 준비</span></div><div class="activity-feedback"></div><div class="evidence-slot"></div></aside></div>`;
 const cards=host.querySelector('.gas-cards'),information=host.querySelector('.gas-information'),feedback=host.querySelector('.activity-feedback'),port=host.querySelector('.supply-port');
 function save(){ctx.saveDraft({selected,reason,read:[...read]});}
 function chooseGas(id){if(delivered||ctx.signal.aborted)return;previewId=null;selected=id;read.add(id);sound();render();deliver(true);}
 for(const gas of GASES){
  const b=button(`<span class="gas-orb" style="--gas-color:${gas.color}" aria-hidden="true">${escapeHTML(gas.symbol)}</span><strong>${gas.name}</strong><span class="gas-read-state"></span>`,()=>chooseGas(gas.id),'gas-card');
  b.dataset.gas=gas.id;b.setAttribute('aria-label',`${gas.name} 조사`);
  touchDrag(b,{signal:ctx.signal,selector:'.supply-port',onDrop:()=>chooseGas(gas.id)});
  cards.append(b);
 }
 function showInformation(){
  if(delivered||ctx.signal.aborted)return;
  for(const b of cards.children)b.classList.toggle('is-observing',b.dataset.gas===previewId);
  const gas=GASES.find(g=>g.id===(previewId||selected));
  const visual=useVisual(gas?.id||task.gas,task);
  information.innerHTML=`<div class="gas-use-card ${gas?'':'awaiting-gas'}"><div class="gas-use-visual">${useImage(visual)}<span>${escapeHTML(visual.caption)}</span></div><div class="gas-use-copy">${gas?`<h3>${gas.name}의 성질</h3><ul>${gas.facts.map(f=>`<li>${f}</li>`).join('')}</ul>`:''}</div></div>`;
 }
 function guideSelection(){
  ctx.guide?.(selected?'성질 선택':'기체 조사',selected?'시설에 필요한 성질을 골라요.':'기체 카드를 눌러 성질을 살펴봐요.',['시설이 무엇을 필요로 하는지 먼저 살펴봐요.','기체 카드에 있는 성질과 쓰임을 읽고 비교해요.','고른 기체와 고른 성질이 모두 시설의 부탁과 맞아야 해요.']);
  ctx.nextAction?.(selected?'.reason-slot .choice':'.gas-card');
 }
 function render(){
  for(const b of cards.children){const active=b.dataset.gas===selected;b.classList.toggle('selected',active);b.setAttribute('aria-pressed',String(active));b.querySelector('.gas-read-state').textContent=active?'선택함':read.has(b.dataset.gas)?'조사함':'';b.disabled=delivered;}
  guideSelection();
  showInformation();
  const gas=GASES.find(g=>g.id===selected);
  port.classList.toggle('ready',Boolean(selected));
  port.querySelector('span').textContent=gas?`${gas.name} 선택`:'배송 준비';
  save();
 }
 host.querySelector('.reason-slot').append(choices(orderedReasons,value=>{if(delivered||ctx.signal.aborted)return;reason=value;sound();render();deliver(true);},{selected:reason}));
 function deliver(byLearner=false){
  if(delivered||ctx.signal.aborted||!selected||!reason)return;
  const result=validateDelivery(selected,reason,task);
  if(!result.ok){
   const hint=result.kind==='gas'?'성질과 쓰임을 살펴보고 기체를 바꿔요.':'조사한 성질과 비교해서 이유를 다시 골라요.';
   ctx.guide?.('다시 살펴봐요',hint);ctx.nextAction?.(result.kind==='gas'?'.gas-card':'.reason-slot .choice');announce(hint);if(byLearner)sound('retry');
   return;
  }
  delivered=true;
  previewId=null;ctx.nextAction?.([]);
  cards.querySelectorAll('button').forEach(b=>b.disabled=true);
  host.querySelector('.reason-slot').querySelectorAll('button').forEach(b=>b.disabled=true);
  host.querySelector('.research-panel').classList.add('delivery-complete');
  const visual=useVisual(task.gas,task);
  const gas=GASES.find(g=>g.id===task.gas);
  information.innerHTML=`<div class="gas-use-result" aria-label="기체의 성질에 맞는 쓰임">${useImage(visual)}<div class="gas-use-copy"><span class="gas-use-complete">${icon('check')} 배송 완료</span><h3>${escapeHTML(gas.name)}</h3><p>${escapeHTML(task.reason)}</p><div class="gas-use-link">${icon('arrow')}<strong>${escapeHTML(visual.caption)}</strong></div></div></div>`;
  port.classList.add('connected');port.querySelector('span').textContent='배송 성공 · 시설이 작동해요';
  feedback.replaceChildren();sound('connect');
  ctx.complete(task.why,{gas:selected,reason,investigated:[...read]});
 }
 port.addEventListener('dragover',event=>{if(delivered)return;event.preventDefault();port.classList.add('drag-over');},{signal:ctx.signal});
 port.addEventListener('dragleave',()=>port.classList.remove('drag-over'),{signal:ctx.signal});
 port.addEventListener('drop',event=>{event.preventDefault();port.classList.remove('drag-over');const id=event.dataTransfer.getData('text/plain');if(GASES.some(gas=>gas.id===id))chooseGas(id);},{signal:ctx.signal});
 ctx.playback?.({steps:()=>GASES.map(gas=>({label:`${gas.name}의 성질을 살펴봐요.`,target:`.gas-card[data-gas="${gas.id}"]`,run:()=>{if(delivered||ctx.signal.aborted)return;previewId=gas.id;showInformation();},wait:1800})),onStop:()=>{previewId=null;showInformation();if(!delivered&&!ctx.signal.aborted)guideSelection();}});
 render();deliver();
}
