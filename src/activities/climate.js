import {volumeFor,validVolumePair} from '../model.js';
import {message,prop,choices,escapeHTML,announce} from '../ui.js';
import {sound} from '../audio.js';
export function mountClimate(host,task,ctx){
 const draft=ctx.draft||{},baseline=task.baseline??1;
 let condition=Number.isInteger(draft.condition)&&draft.condition>=0&&draft.condition<=2?draft.condition:baseline,records=Array.isArray(draft.records)?draft.records.filter(r=>[0,1,2].includes(r.condition)):[],completed=false,pistonPointer=null;
 if(!records.some(r=>r.condition===baseline))records.unshift({condition:baseline,ratio:volumeFor(task.mode,baseline)});
 // A drag is committed on release; resume from a recorded condition after an interrupted gesture.
 if(!records.some(r=>r.condition===condition))condition=records.at(-1).condition;
 const temperature=task.mode==='temperature',labels=temperature?['차가운 곳','보통 온도','따뜻한 곳']:['낮은 압력','보통 압력','높은 압력'];
 host.innerHTML=`<div class="climate-layout"><section class="lab-panel climate-panel"><div class="section-label">${temperature?'같은 공기 · 온도만 바꿔요':'공기는 새지 않아요 · 압력만 바꿔요'}</div><div class="climate-scene ${temperature?'temperature':'pressure'}"><div class="volume-visual"></div><div class="gas-particles" aria-hidden="true"></div><div class="condition-pill"></div></div><div class="range-labels">${labels.map(x=>`<span>${x}</span>`).join('')}</div><input class="condition-slider" type="range" min="0" max="2" step="1" value="${condition}" aria-label="${temperature?'온도':'압력'} 조건 바꾸기"><p class="microcopy">${temperature?'풍선이나 손잡이를 좌우로 움직여요.':'피스톤을 위아래로 밀거나 손잡이를 움직여요.'}<br>손을 놓으면 달라진 모습이 기록돼요.</p></section><aside class="lab-panel comparison-panel"><div class="eyebrow">바꾸기 전 · 바꾼 뒤</div><h2>무엇이 달라졌나요?</h2><div class="volume-records"></div><div class="transfer-slot"></div><div class="activity-feedback"></div></aside></div>`;
 const visual=host.querySelector('.volume-visual'),feedback=host.querySelector('.activity-feedback'),slider=host.querySelector('.condition-slider'),scene=host.querySelector('.climate-scene');
 host.querySelector('.gas-particles').innerHTML=Array.from({length:16},(_,i)=>`<i style="--x:${10+(i*29)%80};--y:${12+(i*37)%75};--delay:${i*.13}s"></i>`).join('');
 function update(){
  const ratio=volumeFor(task.mode,condition),both=validVolumePair(records,task);
  ctx.guide?.(both?'2 · 새 상황에 적용':'1 · 조건 바꾸기',both?'두 모습을 비교하고, 새로운 상황을 골라요.':`처음은 ${labels[baseline]}이에요. ${labels[task.target]}으로 바꿔 보아요.`,['기체가 새지 않으므로 안에 있는 기체의 양은 같아요.','한 조건만 바꾸고 처음과 나중을 비교해요.','기체가 사라졌는지, 차지하는 공간이 달라졌는지 생각해 봐요.']);
  host.querySelector('.gas-particles').style.setProperty('--space-height',String(ratio));host.querySelector('.condition-pill').textContent=labels[condition];scene.dataset.condition=String(condition);scene.setAttribute('aria-valuenow',String(condition));scene.setAttribute('aria-valuetext',labels[condition]);slider.setAttribute('aria-valuetext',labels[condition]);
  if(temperature){
   if(!visual.querySelector('.thermal-apparatus')){
    visual.innerHTML=`<div class="thermal-apparatus"><img class="thermal-bottle" src="/assets/visuals/empty-bottle-v1.webp" alt="풍선으로 입구를 막은 유리병" draggable="false"><div class="thermal-balloon">${prop('balloon','thermal-balloon-art','같은 공기가 차지하는 공간을 보여주는 풍선')}</div></div>`;
    visual.querySelector('.thermal-balloon').append(host.querySelector('.gas-particles'));
    host.querySelectorAll('.gas-particles i').forEach((dot,i)=>{const angle=i*2.4,radius=15+(i%4)*7;dot.style.setProperty('--x',String(50+Math.cos(angle)*radius));dot.style.setProperty('--y',String(50+Math.sin(angle)*radius));});
   }
   visual.querySelector('.thermal-balloon').style.setProperty('--thermal-scale',String(Math.cbrt(ratio)));
  }else{
   if(!visual.querySelector('.pressure-apparatus')){
    visual.innerHTML='<div class="pressure-apparatus" role="img"><img class="pressure-chamber-art" src="/assets/visuals/pressure-chamber-v1.webp" alt="" draggable="false"><div class="piston-air-space"></div><img class="pressure-plunger-art" src="/assets/visuals/pressure-plunger-v1.webp" alt="" draggable="false"></div><span class="space-label">같은 공기 · 달라지는 공간</span>';
    visual.querySelector('.piston-air-space').append(host.querySelector('.gas-particles'));
   }
   // Keep the same image and touch targets while the piston changes position.
   const apparatus=visual.querySelector('.pressure-apparatus'),airHeight=43*ratio/1.35;
   apparatus.style.setProperty('--chamber-air-height',airHeight+'%');
   apparatus.style.setProperty('--plunger-top',(84-airHeight-40.48)+'%');
   apparatus.setAttribute('aria-label',`공기는 그대로 있고, 차지하는 부피가 ${condition===2?'줄어든':condition===0?'늘어난':'보통인'} 밀폐 피스톤`);
  }
  ctx.saveDraft({condition,records});renderRecords();
 }
 function renderRecords(){
  const area=host.querySelector('.volume-records'),before=records.find(r=>r.condition===baseline),after=records.find(r=>r.condition===task.target);
  area.innerHTML=[{title:'처음',record:before},{title:'바꾼 뒤',record:after}].map(({title,record})=>`<div class="volume-record"><div>${title}</div><div class="comparison-track"><i style="height:${record?volumeFor(task.mode,record.condition)/1.35*100:0}%"></i></div><strong>${record?labels[record.condition]:'조건을 바꿔요'}</strong></div>`).join('');
  if(validVolumePair(records,task)&&!host.querySelector('.transfer-question')){
   const slot=host.querySelector('.transfer-slot');host.querySelector('.comparison-panel').classList.add('has-transfer');slot.innerHTML=`<div class="transfer-question"><span class="section-label">새로운 곳에서도 생각해요</span><h3>${escapeHTML(task.transfer)}</h3></div>`;
   slot.append(choices(task.choices,value=>{
    if(completed)return;
    if(value===task.answer){
     completed=true;slider.disabled=true;scene.setAttribute('aria-disabled','true');host.querySelector('.comparison-panel').classList.add('answered');ctx.guide?.('3 · 발견 완료','같은 공기가 차지하는 공간의 변화를 발견했어요.');message(feedback,task.why,'success');sound('success');ctx.complete(task.why,{mode:task.mode,records,transfer:value});
    }else{message(feedback,'내가 기록한 두 모습의 크기를 나란히 비교해요. 공기가 사라졌나요, 차지하는 공간이 달라졌나요?');sound();}
   }));
  }
 }
 function move(next){
  if(completed)return;
  const value=Math.max(0,Math.min(2,next));if(condition===value)return;
  condition=value;slider.value=condition;sound('rotate');update();
 }
 function recordCondition(){
  if(completed||ctx.signal.aborted||records.some(r=>r.condition===condition))return;
  records.push({condition,ratio:volumeFor(task.mode,condition)});sound();update();
  if(condition===task.target){feedback.replaceChildren();announce('달라진 모습이 기록됐어요. 두 크기를 비교해 새로운 상황에도 적용해요.');}
  else message(feedback,`${labels[condition]}의 모습을 기록했어요. 이번에는 ${labels[task.target]}으로 바꿔 보아요.`);
 }
 slider.oninput=e=>move(Number(e.target.value));slider.onchange=recordCondition;
 scene.setAttribute('role','slider');scene.tabIndex=0;scene.setAttribute('aria-label',temperature?'좌우로 밀어 온도 바꾸기':'피스톤을 위아래로 밀어 압력 바꾸기');scene.setAttribute('aria-valuemin','0');scene.setAttribute('aria-valuemax','2');scene.setAttribute('aria-orientation',temperature?'horizontal':'vertical');
 scene.addEventListener('pointerdown',e=>{if(completed||pistonPointer||e.button!==0)return;pistonPointer={x:e.clientX,y:e.clientY,initial:condition,id:e.pointerId};scene.setPointerCapture(e.pointerId);},{signal:ctx.signal});
 scene.addEventListener('pointermove',e=>{if(!pistonPointer||pistonPointer.id!==e.pointerId)return;const delta=temperature?(e.clientX-pistonPointer.x)/85:(e.clientY-pistonPointer.y)/65;move(pistonPointer.initial+Math.round(delta));},{signal:ctx.signal});
 scene.addEventListener('pointerup',e=>{if(pistonPointer?.id!==e.pointerId)return;pistonPointer=null;recordCondition();},{signal:ctx.signal});
 for(const type of ['pointercancel','lostpointercapture'])scene.addEventListener(type,()=>{if(!pistonPointer)return;const initial=pistonPointer.initial;pistonPointer=null;move(initial);},{signal:ctx.signal});
 scene.addEventListener('keydown',e=>{if(completed)return;if(['ArrowRight','ArrowDown','ArrowLeft','ArrowUp','Home','End'].includes(e.code)){e.preventDefault();move(e.code==='Home'?0:e.code==='End'?2:condition+(['ArrowRight','ArrowDown'].includes(e.code)?1:-1));recordCondition();}},{signal:ctx.signal});
 ctx.signal.addEventListener('abort',()=>pistonPointer=null,{once:true});update();
}



