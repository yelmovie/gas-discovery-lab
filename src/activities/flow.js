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
 host.innerHTML=`<div class="flow-layout"><section class="lab-panel pipe-panel"><div class="section-label">관을 누르면 돌아가요</div><div class="pipe-station"><div class="pipe-end source-end">${prop('pump','', '공기를 보내는 펌프')}<span>공기 입구</span></div><div class="pipe-grid" role="group" aria-label="3행 3열 관 연결"></div><div class="pipe-end target-end">${fanArtwork('fan-target')}<span>팬 출구</span></div></div><div class="path-legend">${icon('rotate')} 바람이 멈춘 곳부터 이어 보세요</div></section><aside class="lab-panel experiment-side"><div class="eyebrow">바람길 시험</div><h2>바람을 따라 이어요</h2><div class="air-gauge"><i></i></div><p class="microcopy">공기를 한 번 켜면 관을 돌릴 때마다 바람길이 보여요.</p><div class="supply-slot"></div><div class="activity-feedback"></div><div class="evidence-slot"></div></aside></div>`;
 const grid=host.querySelector('.pipe-grid'),feedback=host.querySelector('.activity-feedback'),gauge=host.querySelector('.air-gauge i');
 const supply=button(`${icon('arrow')} 공기 보내기`,()=>{if(testing||solved||ctx.signal.aborted)return;testing=true;attempts++;sound('pump');save();updateFlow();});host.querySelector('.supply-slot').append(supply);
 function save(){ctx.saveDraft({cells,testing,attempts,turns});}
 function paintCell(b,cell,i){b.innerHTML=`${pipeArtwork(cell.type,cell.rotation,{flow:true})}<span class="pipe-number">${i+1}</span>`;b.setAttribute('aria-label',`${Math.floor(i/3)+1}행 ${i%3+1}열 ${cell.type==='elbow'?'굽은 관':'일자 관'}, ${ports(cell.type,cell.rotation).map(p=>['위','오른쪽','아래','왼쪽'][p]).join('·')} 연결, 눌러 돌리기`);}
 cells.forEach((cell,i)=>{const b=button('',()=>{if(solved||ctx.signal.aborted)return;cell.rotation=(cell.rotation+1)%4;turns++;if(testing)attempts++;paintCell(b,cell,i);sound('rotate');save();if(testing)updateFlow();},'pipe-cell');paintCell(b,cell,i);grid.append(b);});
 function updateFlow(){
  if(!testing||solved||ctx.signal.aborted)return;
  const result=tracePipe(cells);gauge.style.width='100%';
  [...grid.children].forEach((b,i)=>{b.classList.toggle('has-flow',result.path.includes(i));b.disabled=result.ok;});
  supply.disabled=true;
  if(!result.ok){supply.textContent='바람을 보내고 있어요';message(feedback,`${result.stop+1}번 관에서 멈췄어요. 관을 돌리면 바람길이 바로 바뀌어요.`);ctx.guide?.('2 · 바람길 연결','바람이 멈춘 관을 돌려 팬까지 이어요. 다시 시험할 필요 없어요.');return;}
  solved=true;supply.textContent='팬이 돌아가요!';host.querySelector('.fan-target').classList.add('device-powered');message(feedback,task.why,'success');sound('success');ctx.guide?.('3 · 바람길 완성','팬이 돌아요! 작동 기록은 자동으로 남아요.');
  completionTimer=setTimeout(()=>{if(!ctx.signal.aborted)ctx.complete(task.why,{path:result.path,rotations:cells.map(c=>c.rotation),attempts,turns,firstTry:attempts===1});},650);
 }
 ctx.signal.addEventListener('abort',()=>clearTimeout(completionTimer),{once:true});
 ctx.guide?.('1 · 길 연결','공기를 켜고, 관을 돌려 팬까지 바람을 보내요.',['공기 입구에서 출구까지 이어지는 길을 눈으로 따라가 봐요.','관의 끝이 이웃 관의 끝과 맞아야 해요.','공기를 한 번 켜면 바람이 멈춘 곳을 계속 볼 수 있어요.']);
 if(testing)updateFlow();
}

