import {touchDrag} from '../touch.js';
import {GASES} from '../data.js';
import {validateDelivery} from '../model.js';
import {button,message,choices,escapeHTML} from '../ui.js';
import {icon} from '../icons.js';
import {sound} from '../audio.js';
const USE_VISUALS={
 nitrogen:{src:'/assets/prop-packet.webp',alt:'질소를 넣어 포장한 과자 봉지',caption:'식품 포장'},
 oxygen:{src:'/assets/visuals/oxygen-support-v1.webp',alt:'산소 용기에 호스와 호흡 마스크가 연결된 가상 호흡 지원 장치',caption:'호흡 지원'},
 carbon:{src:'/assets/prop-soda.webp',alt:'이산화탄소가 녹아 있는 탄산음료',caption:'탄산음료'},
 extinguisher:{src:'/assets/visuals/co2-extinguisher-v1.webp',alt:'넓은 검은 방사혼이 달린 이산화탄소 소화기',caption:'일부 소화기'}
};
const useVisual=(gas,task)=>USE_VISUALS[gas==='carbon'&&task.id==='delivery-4'?'extinguisher':gas];
const useImage=(visual,cls='gas-use-image')=>`<img class="${cls}" src="${visual.src}" alt="${escapeHTML(visual.alt)}" draggable="false">`;
export function mountDelivery(host,task,ctx){
 let selected=ctx.draft?.selected||null,reason=ctx.draft?.reason||null,read=new Set(ctx.draft?.read||[]),delivered=false;
 const reasons=[task.reason,...['다른 물질과 쉽게 반응하지 않아요.','사람의 호흡에 필요해요.','물에 녹아 탄산음료를 만들어요.','불이 타는 것을 돕지 않아요.'].filter(x=>x!==task.reason).slice(0,2)];
 // A fixed permutation prevents the first position from always being the answer.
 const orderedReasons=task.id.endsWith('2')?[reasons[1],reasons[0],reasons[2]]:task.id.endsWith('3')?[reasons[1],reasons[2],reasons[0]]:reasons;
 host.innerHTML=`<div class="delivery-layout"><section class="lab-panel research-panel"><div class="section-label">기체와 성질을 고르면 바로 배송해요</div><div class="gas-cards"></div><div class="gas-information"></div></section><aside class="lab-panel facility-panel"><div class="eyebrow">${escapeHTML(task.facility)}의 의뢰</div><div class="facility-object">${useImage(useVisual(task.gas,task),'prop')}</div><h2>${escapeHTML(({"delivery-1":"과자를 오래 보관하려면?","delivery-2":"호흡에 필요한 기체는?","delivery-3":"탄산음료를 만들려면?","delivery-4":"일부 소화기에 쓰려면?"})[task.id])}</h2><div class="reason-slot"><div class="microcopy">어떤 성질 때문에 이 기체가 필요할까요?</div></div><div class="supply-port" role="status">${icon('flask')}<span>기체와 성질을 골라 주세요</span></div><div class="activity-feedback"></div><div class="evidence-slot"></div></aside></div>`;
 const cards=host.querySelector('.gas-cards'),information=host.querySelector('.gas-information'),feedback=host.querySelector('.activity-feedback'),port=host.querySelector('.supply-port');
 function save(){ctx.saveDraft({selected,reason,read:[...read]});}
 function chooseGas(id){if(delivered||ctx.signal.aborted)return;selected=id;read.add(id);sound();render();deliver();}
 for(const gas of GASES){
  const b=button(`<span class="gas-orb" style="--gas-color:${gas.color}">${escapeHTML(gas.symbol)}</span><strong>${gas.name}</strong><span class="gas-read-state"></span>`,()=>chooseGas(gas.id),'gas-card');
  b.dataset.gas=gas.id;
  touchDrag(b,{signal:ctx.signal,selector:'.supply-port',onDrop:()=>chooseGas(gas.id)});
  cards.append(b);
 }
 function render(){
  for(const b of cards.children){const active=b.dataset.gas===selected;b.classList.toggle('selected',active);b.setAttribute('aria-pressed',String(active));b.querySelector('.gas-read-state').textContent=read.has(b.dataset.gas)?'조사함':'눌러 조사';b.disabled=delivered;}
  ctx.guide?.(selected?'2 · 성질 선택':'1 · 기체 조사',selected?'시설의 부탁에 맞는 성질을 고르면 바로 배송해요.':'기체 카드를 눌러 성질을 조사해요.',['시설이 무엇을 필요로 하는지 먼저 살펴봐요.','기체 카드에 있는 성질과 쓰임을 읽고 비교해요.','고른 기체와 고른 성질이 모두 시설의 부탁과 맞아야 해요.']);
  const gas=GASES.find(g=>g.id===selected);
  const visual=useVisual(gas?.id||task.gas,task);
  information.innerHTML=`<div class="gas-use-card">${useImage(visual)}<div class="gas-use-copy">${gas?`<h3>${gas.name}의 쓰임</h3><ul>${gas.facts.map(f=>`<li>${f}</li>`).join('')}</ul>`:`<h3>${escapeHTML(task.facility)}</h3><p>이곳에는 어떤 기체가 필요할까요?<br>카드를 눌러 성질을 살펴봐요.</p>`}</div></div>`;
  port.classList.toggle('ready',Boolean(selected));
  port.querySelector('span').textContent=gas?`${gas.name} 선택 · 필요한 성질을 골라요`:reason?'성질 선택 완료 · 기체를 골라요':'기체와 성질을 골라 주세요';
  save();
 }
 host.querySelector('.reason-slot').append(choices(orderedReasons,value=>{if(delivered||ctx.signal.aborted)return;reason=value;sound();render();deliver();},{selected:reason}));
 function deliver(){
  if(delivered||ctx.signal.aborted||!selected||!reason)return;
  const result=validateDelivery(selected,reason,task);
  if(!result.ok){
   port.querySelector('span').textContent='선택을 바꾸면 바로 다시 확인해요';
   message(feedback,result.kind==='gas'?'이 기체로는 시설의 부탁을 해결하기 어려워요. 조사 카드의 쓰임을 살펴보고 기체를 바꿔요.':'시설에 필요한 성질을 다시 골라요. 기체 카드에서 힌트를 찾을 수 있어요.');
   return;
  }
  delivered=true;
  cards.querySelectorAll('button').forEach(b=>b.disabled=true);
  host.querySelector('.reason-slot').querySelectorAll('button').forEach(b=>b.disabled=true);
  host.querySelector('.reason-slot').hidden=true;
  host.querySelector('.research-panel').classList.add('delivery-complete');
  const visual=useVisual(task.gas,task);
  information.innerHTML=`<div class="gas-use-result" aria-label="기체의 성질에 맞는 쓰임">${useImage(visual)}<div class="gas-use-copy"><span class="gas-use-complete">${icon('check')} 배송 완료</span><h3>${escapeHTML(visual.caption)}</h3><p>${escapeHTML(task.reason)}</p></div></div>`;
  host.querySelector('.facility-object').classList.add('facility-working');
  port.classList.add('connected');port.querySelector('span').textContent='배송 성공 · 시설이 작동해요';
  feedback.replaceChildren();sound('connect');
  ctx.complete(task.why,{gas:selected,reason,investigated:[...read]});
 }
 port.addEventListener('dragover',event=>{if(delivered)return;event.preventDefault();port.classList.add('drag-over');},{signal:ctx.signal});
 port.addEventListener('dragleave',()=>port.classList.remove('drag-over'),{signal:ctx.signal});
 port.addEventListener('drop',event=>{event.preventDefault();port.classList.remove('drag-over');const id=event.dataTransfer.getData('text/plain');if(GASES.some(gas=>gas.id===id))chooseGas(id);},{signal:ctx.signal});
 render();deliver();
}
