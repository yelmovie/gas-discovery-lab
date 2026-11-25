import { createPipePuzzle, tracePipe, ports } from '../model.js';
import { button, prop } from '../ui.js';
import {icon} from '../icons.js';
import {sound} from '../audio.js';
import {pipeArtwork} from '../pipe-art.js';
import {fanArtwork} from '../device-art.js';
export function mountFlow(host,task,ctx){
 const draft=ctx.draft||{},initial=createPipePuzzle(task.pattern);
 const cells=Array.isArray(draft.cells)&&draft.cells.length===9&&draft.cells.every((c,i)=>c?.type===initial[i].type&&Number.isInteger(c.rotation))?draft.cells.map(c=>({...c,rotation:((c.rotation%4)+4)%4})):initial;
 let solved=false,testing=true,attempts=Number.isFinite(draft.attempts)?Math.max(0,draft.attempts):0,turns=Number.isFinite(draft.turns)?Math.max(0,draft.turns):0,completionTimer=0;
 host.innerHTML=`<div class="flow-layout">
  <section class="pipe-panel" aria-label="관을 눌러 연결하는 바람길">
   <div class="pipe-station">
    <div class="pipe-end source-end">${prop('pump','', '공기를 보내는 펌프')}<span class="pipe-port-label">입구 ${icon('arrow')}</span></div>
    <div class="pipe-grid" role="group" aria-label="3행 3열 관 연결, 누르면 90도 회전"></div>
    <div class="pipe-end target-end">${fanArtwork('fan-target')}<span class="pipe-port-label">${icon('arrow')} 출구</span></div>
   </div>
   <p class="sr-only flow-status" role="status"></p>
  </section>
  <div class="evidence-slot"></div>
 </div>`;
 const grid=host.querySelector('.pipe-grid'),status=host.querySelector('.flow-status');
 attempts=Math.max(1,attempts);
 const guide=()=>{
  ctx.nextAction?.('.pipe-grid');
  ctx.guide?.('바람길 연결','관을 눌러 돌려 펌프와 팬을 이어요.',[
   '입구에서 들어온 파란 바람을 따라가 봐요.',
   '서로 마주 보는 관 끝이 연결되면 그쪽으로 공기가 흘러요.',
   '펌프부터 팬까지 끊김 없이 이어지는지 살펴봐요.'
  ]);
 };
 function save(){ctx.saveDraft({cells,testing,attempts,turns});}
 function paintCell(b,cell){b.innerHTML=pipeArtwork(cell.type,cell.rotation,{flow:true});}
 cells.forEach(cell=>{const b=button('',()=>{if(solved||ctx.signal.aborted)return;cell.rotation=(cell.rotation+1)%4;turns++;if(testing)attempts++;paintCell(b,cell);sound('rotate');save();updateFlow();},'pipe-cell');paintCell(b,cell);grid.append(b);});
 function updateFlow(){
  if(!testing||solved||ctx.signal.aborted)return;
  const result=tracePipe(cells);
  const flow=new Set(result.path);
  [...grid.children].forEach((b,i)=>{
   const cell=cells[i];
   const directions=ports(cell.type,cell.rotation).map(p=>['위','오른쪽','아래','왼쪽'][p]).join('·');
   b.classList.toggle('has-flow',flow.has(i));
   b.setAttribute('aria-label',`${Math.floor(i/3)+1}행 ${i%3+1}열 ${cell.type==='elbow'?'굽은 관':'일자 관'}, ${directions} 연결${flow.has(i)?', 공기가 지나가요':''}, 눌러 돌리기`);
   b.disabled=result.ok;
  });
  if(!result.ok)return;
  solved=true;ctx.nextAction?.([]);status.textContent='팬까지 바람이 도착했어요.';host.querySelector('.fan-target').classList.add('device-powered');sound('success');
  completionTimer=setTimeout(()=>{if(!ctx.signal.aborted)ctx.complete(task.why,{path:result.path,rotations:cells.map(c=>c.rotation),attempts,turns,firstTry:attempts===1});},650/(ctx.getPlaybackSpeed?.()||1));
 }
 ctx.playback?.({steps:()=>{
  if(solved)return [];
  const result=tracePipe(cells),steps=[];
  steps.push({label:'지금 연결한 길을 따라가요.',target:'.source-end',run:()=>{},wait:600});
  for(const i of result.path)steps.push({label:'공기가 밝게 표시된 관을 지나가요.',target:`.pipe-cell:nth-child(${i+1})`,run:()=>{grid.querySelectorAll('.playback-observed').forEach(el=>el.classList.remove('playback-observed'));grid.children[i]?.classList.add('playback-observed');},wait:650});
  if(!result.ok)steps.push({label:'관을 직접 돌려 끊긴 바람길을 이어요.',target:'.pipe-grid',run:()=>false,wait:900});
  return steps;
 },onStop:()=>{grid.querySelectorAll('.playback-observed').forEach(el=>el.classList.remove('playback-observed'));if(!solved)guide();}});
 ctx.signal.addEventListener('abort' ,()=>clearTimeout(completionTimer),{once:true});
 guide();
 updateFlow();
}

