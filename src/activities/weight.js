import {touchDrag,repeatPress} from '../touch.js';
import {massFor,compareMeasurements} from '../model.js';
import {button,message,prop} from '../ui.js';
import {icon} from '../icons.js';
import {sound} from '../audio.js';
export function mountWeight(host,task,ctx){
 const draft=ctx.draft||{};let level=Number.isFinite(draft.level)?draft.level:task.level,zero=draft.zero===true,onScale=draft.onScale===true,air=Number.isFinite(draft.air)?draft.air:task.initial,tare=Number.isInteger(draft.tare)?draft.tare:0,records=Array.isArray(draft.records)?draft.records.slice(0,8):[],selected=[],completed=false;
 host.innerHTML=`<div class="weight-layout"><section class="lab-panel scale-panel"><div class="section-label">같은 단단한 용기로 비교해요</div><div class="scale-scene"><div class="scale-jar" role="button" tabindex="0" aria-label="밀폐 용기를 저울로 끌거나 눌러 올리기">${prop('jar','','공기가 든 단단한 밀폐 용기')}</div>${prop('scale','scale-art','전자저울')}<output class="scale-readout" aria-live="polite"></output></div><div class="level-row"><span>수평</span><div class="bubble-level"><i></i></div><button class="button small secondary" data-action="level">수평 맞추기</button></div><div class="control-row"><button class="button secondary" data-action="zero">빈 저울 0점</button><button class="button secondary" data-action="place"></button></div><div class="pump-row">${prop('pump')}<div><div class="microcopy">용기는 그대로, 공기의 양만 바꿔요</div><div class="control-row"><button class="button secondary" data-action="remove">공기 빼기</button><button class="button secondary" data-action="add">공기 넣기</button></div></div></div><button class="button primary record-button">${icon('book')} 처음 무게 기록</button></section><aside class="lab-panel records-panel"><div class="eyebrow">나의 실험 기록</div><h2>두 기록을 비교해요</h2><p class="microcopy">무게를 기록하면 처음과 바꾼 뒤를 바로 비교해요.</p><div class="measurement-list"></div><div class="activity-feedback"></div><div class="evidence-slot"></div></aside></div>`;
 const feedback=host.querySelector('.activity-feedback'),list=host.querySelector('.measurement-list');
 function save(){ctx.saveDraft({level,zero,onScale,air,tare,records});}
 function update(){
  host.querySelector('.scale-panel').classList.toggle('air-added',air>task.initial);host.querySelector('.scale-panel').style.setProperty('--air-level',String(air/12));
  const step=!zero||level!==0?['1 · 측정 준비','수평을 맞추고, 빈 저울의 0점을 맞춰요.']:!onScale?['1 · 용기 올리기','왼쪽 용기를 저울로 끌거나 눌러 올려요.']:records.length<1?['2 · 처음 기록','처음 무게를 기록한 뒤, 펌프로 공기의 양을 바꿔요.']:['2 · 바꾸고 비교','공기를 '+(task.direction>0?'넣은':'뺀')+' 뒤 기록하면 두 무게를 바로 비교해요.'];
  ctx.guide?.(...step,['같은 용기와 같은 저울로 비교해야 해요.','빈 저울의 0점과 수평을 먼저 확인해요.',`공기 ${task.minDelta}칸 이상을 ${task.direction>0?'넣고':'빼고'} 다시 재어 보아요. 펌프 버튼을 길게 눌러도 돼요.`]);
  host.querySelector('.scale-jar').classList.toggle('off-scale',!onScale);host.querySelector('.scale-readout').textContent=`${(onScale?massFor(air,zero?0:.64):(zero?0:.64)).toFixed(2)} g`;host.querySelector('.bubble-level i').style.left=`${50+level*12}%`;host.querySelector('[data-action="place"]').textContent=onScale?'용기 내리기':'용기 올리기';
  host.querySelector('[data-action="level"]').disabled=level===0;host.querySelector('[data-action="zero"]').disabled=zero||onScale;
  host.querySelector('.record-button').innerHTML=`${icon('book')} ${records.length?'기록하고 비교':'처음 무게 기록'}`;
  renderRecords();save();
 }
 function renderRecords(focusIndex=-1){
  list.replaceChildren();records.forEach((record,i)=>{const b=button(`<span class="record-order">${i+1}</span><strong>${record.mass.toFixed(2)} g</strong><span>${record.valid?'조건 확인됨':'조건 다시 확인'}</span>`,()=>{if(completed)return;if(selected.includes(i))selected=selected.filter(x=>x!==i);else selected=[...selected.slice(-1),i];renderRecords(i);if(selected.length===2)compareSelected();},`measurement-card ${selected.includes(i)?'selected':''} ${record.valid?'':'needs-check'}`);b.setAttribute('aria-pressed',String(selected.includes(i)));b.disabled=completed;list.append(b);});if(!records.length)list.innerHTML='<div class="empty-record">아직 기록이 없어요.<br>처음 무게부터 재어 보아요.</div>';
  if(focusIndex>=0)list.children[focusIndex]?.focus({preventScroll:true});
 }
 function compareSelected(){
  if(completed||selected.length!==2)return;
  const sorted=[...selected].sort((a,b)=>a-b),a=records[sorted[0]],b=records[sorted[1]],result=compareMeasurements(a,b,task);
  if(!result.ok){message(feedback,result.message);return;}
  completed=true;
  const text=`공기를 ${task.direction>0?'넣은':'뺀'} 뒤 무게가 ${Math.abs(result.delta).toFixed(2)} g ${result.delta>0?'늘었어요':'줄었어요'}. 기체에도 무게가 있어요.`;
  message(feedback,text,'success');ctx.guide?.('3 · 비교 완료','두 무게의 차이를 발견했어요. 다음 의뢰에 도전해요.');sound('success');
  host.querySelectorAll('.scale-panel button,.measurement-card').forEach(b=>b.disabled=true);host.querySelector('.scale-jar').setAttribute('aria-disabled','true');
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
  selected=previous>=0?[previous,latest]:[latest];sound();update();
  if(selected.length===2)compareSelected();else message(feedback,'처음 기록을 남겼어요. 이제 공기의 양만 바꾸어 다시 재어요.');
 };
 const jar=host.querySelector('.scale-jar'),place=()=>{if(!completed&&!onScale){onScale=true;sound('connect');update();}};
 touchDrag(jar,{signal:ctx.signal,selector:'.scale-scene',onDrop:place});jar.onclick=place;jar.onkeydown=e=>{if(['Enter','Space'].includes(e.code)){e.preventDefault();place();}};
 for(const action of ['add','remove']){const el=host.querySelector(`[data-action="${action}"]`);repeatPress(el,()=>el.onclick(),ctx.signal);}
 update();
}

