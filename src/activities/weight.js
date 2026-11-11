import {touchDrag,repeatPress} from '../touch.js';
import {massFor,compareMeasurements} from '../model.js';
import {button,message,prop} from '../ui.js';
import {icon} from '../icons.js';
import {sound} from '../audio.js';
export function mountWeight(host,task,ctx){
 const draft=ctx.draft||{};let level=Number.isFinite(draft.level)?draft.level:task.level,zero=draft.zero===true,onScale=draft.onScale===true,air=Number.isFinite(draft.air)?draft.air:task.initial,tare=Number.isInteger(draft.tare)?draft.tare:0,records=Array.isArray(draft.records)?draft.records.slice(0,8):[],selected=[],completed=false,visibleStart=Math.max(0,(draft.records?.length||0)-2);
 host.innerHTML=`<div class="weight-layout"><section class="lab-panel scale-panel" aria-label="같은 용기의 무게 실험"><div class="scale-readiness"><span class="same-container">같은 용기 · 모형 저울</span><span class="level-state"></span><span class="zero-state"></span></div><div class="scale-scene"><div class="scale-jar" role="button" tabindex="0" aria-label="밀폐 용기를 저울로 끌거나 눌러 올리기">${prop('jar','','공기가 든 단단한 밀폐 용기')}<span class="jar-action-label">눌러 올려요</span></div>${prop('scale','scale-art','전자저울')}<output class="scale-readout" aria-live="polite"></output></div></section><aside class="lab-panel records-panel"><div class="weight-actions"><div class="level-row"><span>수평</span><div class="bubble-level"><i></i></div><button class="button secondary" data-action="level">수평 맞추기</button></div><div class="control-row preparation-actions"><button class="button secondary" data-action="zero">빈 저울 0점</button><button class="button secondary" data-action="place"></button></div><div class="pump-row"><div class="air-amount-copy">${prop('pump','pump-mini','공기의 양을 바꾸는 펌프')}<span>공기의 양</span><strong class="air-amount-value"></strong></div><div class="air-amount-meter" aria-hidden="true">${'<i></i>'.repeat(12)}</div><div class="control-row pump-actions"><button class="button secondary" data-action="remove">공기 빼기</button><button class="button secondary" data-action="add">공기 넣기</button><button class="button primary record-button">${icon('book')} 처음 기록</button></div></div></div><div class="weight-record-heading"><span>측정 기록</span><div class="record-pagination" hidden><button class="record-page record-prev" aria-label="이전 측정 기록">${icon('back')}</button><span class="record-page-count"></span><button class="record-page record-next" aria-label="다음 측정 기록">${icon('arrow')}</button></div></div><div class="measurement-list"></div><div class="weight-comparison" hidden></div><div class="activity-feedback"></div><div class="evidence-slot"></div></aside></div>`;
 const feedback=host.querySelector('.activity-feedback'),list=host.querySelector('.measurement-list');
 function save(){ctx.saveDraft({level,zero,onScale,air,tare,records});}
 function update(){
  host.querySelector('.scale-panel').classList.toggle('air-added',air>task.initial);host.querySelector('.scale-panel').style.setProperty('--air-level',String(air/12));
  host.querySelector('.air-amount-value').textContent=`${air} / 12칸`;
  host.querySelectorAll('.air-amount-meter i').forEach((dot,i)=>dot.classList.toggle('filled',i<air));
  for(const [name,ready,label] of [['level',level===0,'수평'],['zero',zero,'0점']]){const el=host.querySelector(`.${name}-state`);el.classList.toggle('is-ready',ready);el.innerHTML=`${icon(ready?'check':'flask')} ${label} ${ready?'확인':'확인해요'}`;}
  host.querySelector('.scale-jar').classList.toggle('off-scale',!onScale);host.querySelector('.scale-readout').textContent=`${(onScale?massFor(air,zero?0:.64):(zero?0:.64)).toFixed(2)} g`;host.querySelector('.bubble-level i').style.left=`${50+level*12}%`;host.querySelector('[data-action="place"]').textContent=onScale?'용기 내리기':'용기 올리기';
  host.querySelector('[data-action="level"]').disabled=level===0;host.querySelector('[data-action="zero"]').disabled=zero||onScale;
  const prepared=level===0&&zero,baseline=records.some(r=>r.valid&&r.tare===tare);
  host.querySelector('.level-row').hidden=level===0;
  host.querySelector('[data-action="zero"]').hidden=level!==0||zero||onScale;
  host.querySelector('[data-action="place"]').hidden=level!==0||(!onScale&&!zero)||(onScale&&zero);
  host.querySelector('.preparation-actions').hidden=level!==0||(zero&&onScale);
  host.querySelector('.pump-row').hidden=!prepared||!onScale;
  for(const action of ['add','remove'])host.querySelector(`[data-action="${action}"]`).hidden=!baseline;
  host.querySelector('.record-button').innerHTML=`${icon('book')} ${baseline?'기록 비교':'처음 기록'}`;
  guideCurrentAction();
  renderRecords();save();
 }
 function guideCurrentAction(){
  if(completed){ctx.nextAction?.([]);return;}
  const prepared=level===0&&zero,baseline=records.some(r=>r.valid&&r.tare===tare);
  const step=level!==0?['1 · 수평 맞추기','수평 맞추기를 눌러 저울의 기울기를 맞춰요.']:!zero?['1 · 0점 맞추기',onScale?'용기를 내려 빈 저울을 준비해요.':'빈 저울 0점을 눌러 숫자를 0으로 맞춰요.']:!onScale?['1 · 용기 올리기','왼쪽 용기를 눌러 저울에 올려요. 끌어도 돼요.']:!baseline?['2 · 처음 기록','처음 기록을 눌러 지금 무게를 남겨요.']:['2 · 바꾸고 비교',`공기를 ${task.minDelta}칸 이상 ${task.direction>0?'넣고':'빼고'}, 기록 비교를 눌러요.`];
  ctx.guide?.(...step,['같은 용기와 같은 저울로 비교해야 해요.','빈 저울의 0점과 수평을 먼저 확인해요.',`공기 ${task.minDelta}칸 이상을 ${task.direction>0?'넣고':'빼고'} 다시 재어 보아요. 펌프 버튼을 길게 눌러도 돼요.`]);
  const currentRecord={air,valid:prepared,jar:'rigid-jar',tare},canCompare=records.some(r=>compareMeasurements(r,currentRecord,task).ok);
  ctx.nextAction?.(completed?[]:level!==0?'[data-action="level"]':!zero?onScale?'[data-action="place"]':'[data-action="zero"]':!onScale?'[data-action="place"]':!baseline||canCompare?'.record-button':`[data-action="${task.direction>0?'add':'remove'}"]`);
 }
 function renderRecords(focusIndex=-1){
  list.replaceChildren();
  visibleStart=Math.max(0,Math.min(visibleStart,Math.max(0,records.length-2)));
  const shown=completed?[...selected].sort((a,b)=>a-b):Array.from({length:Math.min(2,records.length-visibleStart)},(_,n)=>visibleStart+n);
  for(const i of shown){const record=records[i],b=button(`<span class="record-order">${i+1}</span><strong>${record.mass.toFixed(2)} g</strong><span>공기 ${record.air}칸 · ${record.valid?'조건 확인':'조건 재확인'}</span>`,()=>{if(completed)return;if(selected.includes(i))selected=selected.filter(x=>x!==i);else selected=[...selected.slice(-1),i];renderRecords(i);if(selected.length===2)compareSelected();},`measurement-card ${selected.includes(i)?'selected':''} ${record.valid?'':'needs-check'}`);b.dataset.record=String(i);b.setAttribute('aria-pressed',String(selected.includes(i)));b.disabled=completed;list.append(b);}
  if(!records.length)list.innerHTML='<div class="empty-record">아직 측정 기록이 없어요.</div>';
  host.querySelector('.record-pagination').hidden=records.length<=2||completed;
  host.querySelector('.record-page-count').textContent=`${visibleStart+1}–${Math.min(visibleStart+2,records.length)} / ${records.length}`;
  host.querySelector('.record-prev').disabled=visibleStart===0;
  host.querySelector('.record-next').disabled=visibleStart>=records.length-2;
  const comparison=host.querySelector('.weight-comparison');comparison.hidden=selected.length!==2;
  if(selected.length===2){const [a,b]=[...selected].sort((x,y)=>x-y).map(i=>records[i]),delta=b.mass-a.mass;comparison.innerHTML=`<span>무게 차이</span><strong>${delta>0?'+':delta<0?'−':''}${Math.abs(delta).toFixed(2)} g</strong><span>공기 ${a.air}칸 ${icon('arrow')} ${b.air}칸</span>`;}
  if(focusIndex>=0)list.querySelector(`[data-record="${focusIndex}"]`)?.focus({preventScroll:true});
 }
 function compareSelected(){
  if(completed||selected.length!==2)return;
  const sorted=[...selected].sort((a,b)=>a-b),a=records[sorted[0]],b=records[sorted[1]],result=compareMeasurements(a,b,task);
  if(!result.ok){message(feedback,result.message);sound('retry');return;}
  completed=true;renderRecords();ctx.nextAction?.([]);
  const text=`공기를 ${task.direction>0?'넣은':'뺀'} 뒤 무게가 ${Math.abs(result.delta).toFixed(2)} g ${result.delta>0?'늘었어요':'줄었어요'}. 기체에도 무게가 있어요.`;
  message(feedback,text,'success');ctx.guide?.('3 · 비교 완료','두 무게의 차이를 발견했어요. 다음 의뢰에 도전해요.');sound('success');
  host.querySelectorAll('.weight-actions button,.measurement-card').forEach(b=>b.disabled=true);host.querySelector('.scale-jar').setAttribute('aria-disabled','true');
  ctx.complete(text,{before:a,after:b,delta:result.delta});
 }
 host.querySelector('[data-action="level"]').onclick=()=>{if(completed)return;level=0;sound();message(feedback,'수평계의 방울이 가운데에 왔어요.');update();};
 host.querySelector('[data-action="zero"]').onclick=()=>{if(completed||zero)return;if(onScale){message(feedback,'용기를 내린 빈 저울에서 0점을 맞춰요.');return;}zero=true;tare++;sound();message(feedback,'빈 저울이 0.00 g이에요. 이제 용기를 올려요.');update();};
 host.querySelector('[data-action="place"]').onclick=()=>{if(completed)return;onScale=!onScale;sound();update();};
 for(const [action,delta] of [['add',1],['remove',-1]])host.querySelector(`[data-action="${action}"]`).onclick=()=>{if(completed)return;if(!onScale){message(feedback,'먼저 용기를 저울에 올려 주세요.');return;}const next=Math.max(0,Math.min(12,air+delta));if(next===air)return;air=next;sound('pump');host.querySelector('.pump-row').classList.remove('pump-stroke');void host.offsetWidth;host.querySelector('.pump-row').classList.add('pump-stroke');update();};
 host.querySelector('.record-button').onclick=()=>{
  if(completed)return;if(!onScale){message(feedback,'용기를 올린 뒤 무게를 기록해요.');return;}
  const record={mass:massFor(air,zero?0:.64),air,valid:level===0&&zero,jar:'rigid-jar',tare},last=records.at(-1);
  if(last&&last.air===record.air&&last.valid===record.valid&&last.tare===record.tare){message(feedback,'같은 무게는 이미 기록했어요. 공기의 양을 바꿔 보아요.');return;}
  if(records.length>=8)records=records.slice(-6);records.push(record);
  const latest=records.length-1;let previous=latest-1;
  for(let i=latest-1;i>=0;i--)if(compareMeasurements(records[i],record,task).ok){previous=i;break;}
  selected=previous>=0?[previous,latest]:[latest];visibleStart=Math.max(0,records.length-2);sound();update();
  if(selected.length===2)compareSelected();else message(feedback,'처음 기록을 남겼어요. 이제 공기의 양만 바꾸어 다시 재어요.');
 };
 host.querySelector('.record-prev').onclick=()=>{visibleStart=Math.max(0,visibleStart-2);renderRecords();};
 host.querySelector('.record-next').onclick=()=>{visibleStart=Math.min(Math.max(0,records.length-2),visibleStart+2);renderRecords();};
 const jar=host.querySelector('.scale-jar'),place=()=>{if(!completed&&!onScale){onScale=true;sound('connect');update();}};
 touchDrag(jar,{signal:ctx.signal,selector:'.scale-scene',onDrop:place});jar.onclick=place;jar.onkeydown=e=>{if(['Enter','Space'].includes(e.code)){e.preventDefault();place();}};
 for(const action of ['add','remove']){const el=host.querySelector(`[data-action="${action}"]`);repeatPress(el,()=>el.onclick(),ctx.signal);}
 ctx.playback?.({steps:()=>{
  if(completed)return [];
  const steps=[],add=(label,target,wait=750)=>steps.push({label,target,run:()=>{if(!completed)host.querySelector(target)?.click();},wait});
  if(level!==0)add('수평계의 방울을 가운데로 맞춰요.','[data-action="level"]');
  if(!zero&&onScale)add('용기를 내려 빈 저울을 준비해요.','[data-action="place"]');
  if(!zero)add('빈 저울의 0점을 맞춰요.','[data-action="zero"]');
  if(!onScale||!zero)add('같은 용기를 저울에 올려요.','[data-action="place"]',900);
  let current=air,baseline=zero?records.findLast(r=>r.valid&&r.tare===tare&&r.air+task.direction*task.minDelta>=0&&r.air+task.direction*task.minDelta<=12):null;
  const changeTo=value=>{while(current!==value){const direction=value>current?1:-1;add(direction>0?'공기를 한 칸 넣어요.':'공기를 한 칸 빼요.',`[data-action="${direction>0?'add':'remove'}"]`,500);current+=direction;}};
  if(!baseline){
   const hasValid=zero&&records.some(r=>r.valid&&r.tare===tare);
   if(!hasValid)add('처음 무게를 기록해요.','.record-button',1000);
   if(current+task.direction*task.minDelta<0||current+task.direction*task.minDelta>12){changeTo(task.initial);add('비교할 처음 무게를 기록해요.','.record-button',900);}
   baseline={air:current};
  }
  const possibleNow=zero&&records.some(r=>compareMeasurements(r,{air:current,valid:true,jar:'rigid-jar',tare},task).ok);
  if(!possibleNow)changeTo(baseline.air+task.direction*task.minDelta);
  add('바꾼 뒤 무게를 기록하고 비교해요.','.record-button',1000);
  return steps;
 },onStop:guideCurrentAction});
 update();
}

