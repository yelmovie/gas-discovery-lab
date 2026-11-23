// WebGL 없이도 같은 봉지·조건·예상·관찰을 사용하는 산악 관측소.
import {volumeFor} from '../model.js';
import {choices,escapeHTML,announce,shuffle} from '../ui.js';
import {sound} from '../audio.js';
import {COURSE,PREDICTIONS,PRESSURE_LABELS,MOUNTAIN_HINTS,restoreRun,recordStation,readyToCompare,runDraft,runEvidence,observedChange} from './mountain-rules.js';

const ART='/assets/run-stage/';
export function mountMountainClassic(host,task,ctx){
 const state=restoreRun(task,ctx.draft),baseline=task.baseline??1;
 let misses=Number.isFinite(ctx.draft?.misses)?Math.max(0,Math.trunc(ctx.draft.misses)):0;
 let phase=readyToCompare(state,task)?'compare':state.prediction?'observe':'predict',completed=false;
 let station=['base','summit'].includes(ctx.draft?.station)&&phase!=='predict'?ctx.draft.station:state.checkpoint===COURSE.checkpoints.length-1?'summit':'base';
 host.innerHTML=`<div class="climate-layout mountain-classic" data-phase="${phase}">
  <section class="lab-panel mountain-observer" aria-label="산 아래와 산꼭대기의 밀봉 봉지">
   <span class="climate-constants">공기 양·온도 일정</span>
   <div class="mountain-scene" role="img">
    <img class="mountain-backdrop" src="${ART}mountain-backdrop.webp" alt="">
    <strong class="mountain-place"></strong>
    <figure class="mountain-bag"><img src="${ART}bag-normal.webp" alt="" draggable="false"><figcaption>밀봉한 과자 봉지</figcaption></figure>
   </div>
   <div class="mountain-stations" role="group" aria-label="관측 지점 고르기">
    <button class="button secondary" data-station="base">산 아래 · 보통 압력</button>
    <button class="button secondary" data-station="summit">산꼭대기 · 낮은 압력</button>
   </div>
   <button class="button primary mountain-record">봉지 크기 기록하기</button>
  </section>
  <aside class="lab-panel mountain-comparison comparison-panel" aria-label="봉지의 예상과 관찰 비교">
   <section class="mountain-predict"><h2>산꼭대기에 가면 봉지는 어떻게 될까요?</h2><p>같은 봉지를 산꼭대기로 옮겨 관찰해요. 먼저 예상해 보아요.</p><div class="mountain-predict-choices"></div></section>
   <div class="volume-records" role="group" aria-label="같은 기준으로 비교한 공기의 부피"></div>
   <p class="mountain-prediction-note"></p>
   <div class="transfer-slot"></div><div class="activity-feedback"></div>
  </aside>
 </div>`;
 const root=host.firstElementChild,predict=root.querySelector('.mountain-predict'),records=root.querySelector('.volume-records'),note=root.querySelector('.mountain-prediction-note'),slot=root.querySelector('.transfer-slot'),recordButton=root.querySelector('.mountain-record');
 const draft=()=>({...runDraft(state,task),station,...(misses?{misses}:{})});
 const save=()=>ctx.saveDraft(draft());
 function guide(){
  if(completed)return;
  if(phase==='predict'){ctx.guide?.('1 · 예상하기','산꼭대기에 가면 과자 봉지가 어떻게 될지 골라요.',MOUNTAIN_HINTS);ctx.nextAction?.('.mountain-predict .choice');}
  else if(phase==='observe'){ctx.guide?.('2 · 봉지 관찰',station==='summit'?'산꼭대기에서 봉지가 달라진 모습을 기록해요.':'산꼭대기 · 낮은 압력을 눌러 같은 봉지를 옮겨요.',MOUNTAIN_HINTS);ctx.nextAction?.(station==='summit'?'.mountain-record':'.mountain-stations [data-station="summit"]');}
  else{ctx.guide?.('3 · 새 상황에 적용','두 모습을 비교하고, 새로운 상황을 골라요.',MOUNTAIN_HINTS);ctx.nextAction?.('.transfer-slot .choice');}
 }
 function render(){
  root.dataset.phase=completed?'complete':phase;
  const condition=station==='summit'?task.target:baseline,label=`${station==='summit'?'산꼭대기':'산 아래'} · ${PRESSURE_LABELS[condition]}`;
  root.querySelector('.mountain-place').textContent=label;
  root.querySelector('.mountain-scene').setAttribute('aria-label',`${label}, 밀봉한 봉지의 부피가 ${station==='summit'?'처음보다 커졌어요':'처음 크기예요'}`);
  root.querySelector('.mountain-scene').dataset.station=station;
  root.querySelector('.mountain-bag img').src=ART+(station==='summit'?'bag-puffed.webp':'bag-normal.webp');
  root.querySelectorAll('.mountain-stations [data-station]').forEach(button=>{button.disabled=phase==='predict'||completed;button.setAttribute('aria-pressed',String(button.dataset.station===station));});
  recordButton.hidden=phase!=='observe';recordButton.disabled=station!=='summit'||completed;
  predict.hidden=phase!=='predict';
  records.hidden=phase!=='compare';note.hidden=phase!=='compare'||!state.prediction;
  slot.hidden=phase==='predict';
  if(phase==='observe')slot.innerHTML='<p class="climate-awaiting"> 산 아래와 산꼭대기에서 같은 봉지를 살펴보고 기록해요.</p>';
  if(phase==='compare')renderCompare();
  guide();
 }
 function visit(next){
  if(completed||phase==='predict')return;
  station=next;
  if(station==='summit')state.checkpoint=COURSE.checkpoints.length-1;
  sound('rotate');save();render();
 }
 root.querySelectorAll('.mountain-stations [data-station]').forEach(button=>button.onclick=()=>visit(button.dataset.station));
 root.querySelector('.mountain-predict-choices').append(choices(PREDICTIONS,value=>{
  if(phase!=='predict')return;
  state.prediction=value;phase='observe';sound();save();render();
  root.querySelector('[data-station="summit"]').focus({preventScroll:true});
 },{group:'예상 고르기'}));
 recordButton.onclick=()=>{
  if(completed||phase!=='observe'||station!=='summit'||!recordStation(state,task,'summit'))return;
  phase='compare';sound();save();render();announce('달라진 모습이 기록됐어요. 두 크기를 비교해 새로운 상황에도 적용해요.');
  slot.querySelector('.choice')?.focus({preventScroll:true});
 };
 function renderCompare(){
  const initial=volumeFor(task.mode,baseline);
  records.innerHTML=[['처음',baseline],['바꾼 뒤',task.target]].map(([title,condition])=>{
   const record=state.records.find(r=>r.condition===condition),ratio=record?volumeFor(task.mode,condition):0;
   return `<div class="volume-record ${record?'recorded':'awaiting'}"><div class="record-stage">${title}</div><strong class="record-condition">${record?PRESSURE_LABELS[condition]:'기록 전'}</strong><div class="comparison-track" aria-hidden="true"><span class="comparison-baseline" style="left:${initial/1.35*100}%"></span><i style="width:${ratio/1.35*100}%"></i></div></div>`;
  }).join('');
  const picked=PREDICTIONS.find(p=>p.value===state.prediction);
  if(picked)note.textContent=`내 예상: ${picked.label} → ${picked.value===observedChange(task)?'기록과 같아요.':'기록과 달라요. 두 막대를 다시 봐요.'}`;
  if(slot.querySelector('.transfer-question'))return;
  slot.innerHTML=`<div class="transfer-question"><h3>${escapeHTML(task.transfer)}</h3></div>`;
  slot.append(choices(shuffle(task.choices),value=>{
   if(completed)return;
   const evidence=runEvidence(state,task,value,misses);
   if(evidence){completed=true;render();ctx.nextAction?.([]);sound('success');ctx.complete(task.why,evidence);}
   else{misses++;save();const retry=task.retry||'두 부피 막대를 다시 비교해 보아요.';ctx.guide?.('2 · 다시 생각해요',retry);announce(retry);sound('retry');}
  },{terms:ctx.terms}));
 }
 ctx.playback?.({steps:()=>{
  if(completed||phase==='compare')return [];
  if(phase==='predict')return [{label:'먼저 봉지의 변화를 예상해 골라요.',target:'.mountain-predict .choice',run:()=>false}];
  return [
   {label:'산 아래, 보통 압력의 봉지를 살펴봐요.',target:'.mountain-scene',run:()=>visit('base'),wait:900},
   {label:'공기 양과 온도는 같게 두고 산꼭대기의 낮은 압력에서 관찰해요.',target:'.mountain-scene',run:()=>visit('summit'),wait:900},
   {label:'봉지 크기 기록하기를 직접 눌러 비교해요.',target:'.mountain-record',run:()=>false}
  ];
 },onStop:guide});
 save();render();
}
