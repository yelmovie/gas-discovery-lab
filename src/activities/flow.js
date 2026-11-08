import { createPipePuzzle, tracePipe, ports } from '../model.js';
import { button, message, prop } from '../ui.js';
import {icon} from '../icons.js';
import {sound} from '../audio.js';
import {pipeArtwork} from '../pipe-art.js';
import {fanArtwork} from '../device-art.js';
export function mountFlow(host,task,ctx){
 const draft=ctx.draft||{},initial=createPipePuzzle(task.pattern);
 const cells=Array.isArray(draft.cells)&&draft.cells.length===9&&draft.cells.every((c,i)=>c?.type===initial[i].type&&Number.isInteger(c.rotation))?draft.cells.map(c=>({...c,rotation:((c.rotation%4)+4)%4})):initial;
 let solved=false,testing=draft.testing===true,attempts=Number.isFinite(draft.attempts)?Math.max(0,draft.attempts):0,turns=Number.isFinite(draft.turns)?Math.max(0,draft.turns):0,completionTimer=0;
 host.innerHTML=`<div class="flow-layout"><section class="lab-panel pipe-panel" aria-label="관을 눌러 연결하는 바람길"><div class="pipe-station"><div class="pipe-end source-end"><span class="pipe-port-label">입구 ${icon('arrow')}</span>${prop('pump','', '공기를 보내는 펌프')}</div><div class="pipe-grid" role="group" aria-label="3행 3열 관 연결, 누르면 90도 회전"></div><div class="pipe-end target-end">${fanArtwork('fan-target')}<span class="pipe-port-label">${icon('arrow')} 출구</span></div></div></section><aside class="lab-panel experiment-side"><div class="flow-observation"><span class="section-label">바람이 지나는 순서</span><div class="flow-route" aria-live="polite"><span>입구에서 시작해요</span></div><span class="flow-count">공급 대기</span></div><div class="supply-slot"></div><div class="activity-feedback"></div><div class="evidence-slot"></div></aside></div>`;
 const grid=host.querySelector('.pipe-grid'),feedback=host.querySelector('.activity-feedback'),route=host.querySelector('.flow-route');
 const supply=button(`${icon('arrow')} 공기 보내기`,()=>{if(testing||solved||ctx.signal.aborted)return;testing=true;attempts++;sound('pump');save();updateFlow();});host.querySelector('.supply-slot').append(supply);
 function save(){ctx.saveDraft({cells,testing,attempts,turns});}
 function paintCell(b,cell,i){b.innerHTML=`<span class="pipe-number">${i+1}</span>${pipeArtwork(cell.type,cell.rotation,{flow:true})}`;b.setAttribute('aria-label',`${Math.floor(i/3)+1}행 ${i%3+1}열 ${cell.type==='elbow'?'굽은 관':'일자 관'}, ${ports(cell.type,cell.rotation).map(p=>['위','오른쪽','아래','왼쪽'][p]).join('·')} 연결, 눌러 돌리기`);}
 cells.forEach((cell,i)=>{const b=button('',()=>{if(solved||ctx.signal.aborted)return;cell.rotation=(cell.rotation+1)%4;turns++;if(testing)attempts++;paintCell(b,cell,i);sound('rotate');save();if(testing)updateFlow();else ctx.nextAction?.('.supply-slot .button');},'pipe-cell');paintCell(b,cell,i);grid.append(b);});
 function updateFlow(){
  if(!testing||solved||ctx.signal.aborted)return;
  const result=tracePipe(cells);
  route.innerHTML=result.path.length?result.path.map((i,j)=>`${j?icon('arrow'):''}<span class="flow-route-step" data-cell="${i}">${i+1}</span>`).join(''):'<span>입구에서 멈췄어요</span>';
  host.querySelector('.flow-count').textContent=result.ok?'출구 연결 · 팬이 돌아요':`${result.path.length}개 관 통과 · ${result.stop+1}번에서 멈춤`;
  host.querySelector('.flow-observation').classList.toggle('flow-arrived',result.ok);
  host.querySelector('.pipe-station').classList.add('is-supplying');
  [...grid.children].forEach((b,i)=>{b.classList.toggle('has-flow',result.path.includes(i));b.classList.toggle('flow-stopped',!result.ok&&i===result.stop);b.disabled=result.ok;});
  supply.disabled=true;
  if(!result.ok){ctx.nextAction?.(`.pipe-cell:nth-child(${result.stop+1})`);supply.textContent='공급 중';message(feedback,`${result.stop+1}번 관에서 멈췄어요. 관을 돌리면 바람길이 바로 바뀌어요.`);ctx.guide?.('2 · 바람길 연결','바람이 멈춘 관을 돌려 팬까지 이어요. 다시 시험할 필요 없어요.');return;}
  solved=true;ctx.nextAction?.([]);supply.textContent='팬이 돌아요';host.querySelector('.fan-target').classList.add('device-powered');message(feedback,task.why,'success');sound('success');ctx.guide?.('3 · 바람길 완성','팬이 돌아요! 작동 기록은 자동으로 남아요.');
  completionTimer=setTimeout(()=>{if(!ctx.signal.aborted)ctx.complete(task.why,{path:result.path,rotations:cells.map(c=>c.rotation),attempts,turns,firstTry:attempts===1});},650/(ctx.getPlaybackSpeed?.()||1));
 }
 ctx.playback?.({steps:()=>{
  if(solved)return [];
  const result=tracePipe(cells),steps=[];
  if(!testing)steps.push({label:'입구에서 공기를 보내요.',target:'.supply-slot .button',run:()=>supply.click(),wait:750});
  else steps.push({label:'지금 연결한 길을 따라가요.',target:'.source-end',run:()=>{},wait:600});
  for(const i of result.path)steps.push({label:`공기가 ${i+1}번 관을 지나가요.`,target:`.pipe-cell:nth-child(${i+1})`,run:()=>{grid.querySelectorAll('.playback-observed').forEach(el=>el.classList.remove('playback-observed'));grid.children[i]?.classList.add('playback-observed');},wait:650});
  if(!result.ok)steps.push({label:`${result.stop+1}번 관을 직접 돌려 다음 길을 이어요.`,target:`.pipe-cell:nth-child(${result.stop+1})`,run:()=>{grid.querySelectorAll('.playback-observed').forEach(el=>el.classList.remove('playback-observed'));updateFlow();},wait:900});
  return steps;
 },onStop:()=>{grid.querySelectorAll('.playback-observed').forEach(el=>el.classList.remove('playback-observed'));if(testing&&!solved)updateFlow();else ctx.nextAction?.(solved?[]:'.supply-slot .button');}});
 ctx.nextAction?.('.supply-slot .button');
 ctx.signal.addEventListener('abort' ,()=>clearTimeout(completionTimer),{once:true});
 ctx.guide?.('1 · 길 연결','공기를 켜고, 관을 돌려 팬까지 바람을 보내요.',['공기 입구에서 출구까지 이어지는 길을 눈으로 따라가 봐요.','관의 끝이 이웃 관의 끝과 맞아야 해요.','공기를 한 번 켜면 바람이 멈춘 곳을 계속 볼 수 있어요.']);
 if(testing)updateFlow();
}

