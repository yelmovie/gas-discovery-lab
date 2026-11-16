import {missions,flow,startCells} from './play-mission-model.js';
import {icon} from './icons.js';
import {pipeArtwork} from './pipe-art.js';
import {sound} from './audio.js';
import {touchDrag} from './touch.js';
const KEY='science-play-15-v1';
let baseline=null,recovery=null;
const freshMission=m=>({cells:startCells(m),placed:{}});
const defaults=()=>({level:0,cells:missions.map(m=>startCells(m)),placed:missions.map(()=>({})),vent:missions.map(m=>m.ventOpen),air:missions.map(()=>0),won:[]});
// 저장된 배치가 지금 미션 구성과 맞을 때만 이어서 쓴다. 맞지 않으면 그 미션은 처음 배치로 돌린다.
function restoreMission(m,savedCells,savedPlaced){
 const placed={},used=new Set();
 for(const [slot,piece] of Object.entries(savedPlaced||{})){
  const n=Number(slot),k=Number(piece);
  if(!m.empty.includes(n)||!Number.isInteger(k)||k<0||k>=m.tray.length||used.has(k))return freshMission(m);
  placed[n]=k;used.add(k);
 }
 if(!Array.isArray(savedCells)||savedCells.length!==9)return freshMission(m);
 const cells=m.start.map((c,j)=>{
  const type=m.empty.includes(j)?(j in placed?m.tray[placed[j]].type:-1):c.type;
  return {type,turn:Math.abs(Math.trunc(savedCells[j]?.turn)||0)%4,expected:Math.trunc(savedCells[j]?.type)};
 });
 if(cells.some(c=>c.expected!==c.type))return freshMission(m);
 return {cells:cells.map(({type,turn})=>({type,turn})),placed};
}
function load(){
 recovery=null;
 try{
  baseline=localStorage.getItem(KEY);
  const old=JSON.parse(baseline),s=defaults();
  if(!old)return s;
  s.level=Math.max(0,Math.min(2,Math.trunc(old.level)||0));
  missions.forEach((m,i)=>{const r=restoreMission(m,old.cells?.[i],old.placed?.[i]);s.cells[i]=r.cells;s.placed[i]=r.placed;});
  s.vent=missions.map((m,i)=>typeof old.vent?.[i]==='boolean'?old.vent[i]:m.ventOpen);
  s.air=missions.map((m,i)=>Math.max(0,Math.min(m.required,Math.trunc(old.air?.[i])||0)));
  s.won=(old.won||[]).filter(x=>Number.isInteger(x)&&x>=0&&x<3);
  return s;
 }catch{recovery=baseline;return defaults();}
}
// 모델의 관 방향(직선 0 = 위아래)을 관 그림의 회전(직선 0 = 좌우)에 맞춘다.
const pipeArt=cell=>pipeArtwork(cell.type===1?'elbow':'straight',cell.type===1?cell.turn:cell.turn+1,{flow:true});
const pieceName=piece=>piece.type===1?'굽은 관':'일자 관';
export function openPlayMission(){
 if(document.querySelector('.play-mission'))return;
 document.dispatchEvent(new Event('gas-dialog-open'));
 const oldFocus=document.activeElement,dialog=document.createElement('dialog');
 dialog.className='play-mission gas-play';
 dialog.setAttribute('aria-label','에어의 공기 장치 공방');
 document.body.append(dialog);
 let s=load(),message='',saveError=false,pumping=0,picked=null,renderSignal=new AbortController();
 const save=()=>{
  try{
   if(localStorage.getItem(KEY)!==baseline){saveError=true;message='다른 창의 공방 기록이 바뀌었어. 창을 닫고 다시 열어 줘.';return;}
   if(recovery!==null)localStorage.setItem(KEY+'-recovery',recovery);
   const encoded=JSON.stringify(s);
   localStorage.setItem(KEY,encoded);
   baseline=encoded;recovery=null;saveError=false;
  }catch{saveError=true;}
 };
 const level=()=>s.level,mission=()=>missions[s.level];
 const done=()=>s.air[level()]>=mission().required;
 const ready=()=>{const r=flow(s.cells[level()],mission(),false);return r.reached&&!r.leak;};
 const freeTray=()=>mission().tray.map((p,k)=>({...p,k})).filter(p=>!Object.values(s.placed[level()]).includes(p.k));
 function status(){
  const n=level(),m=mission(),empties=m.empty.filter(i=>!(i in s.placed[n]));
  if(message)return message;
  if(done())return n<2?'공기가 주머니를 부풀려 받침과 상자를 밀어 올렸어! 다음 장치로 가 봐.':'세 장치를 모두 움직였어! 공기가 공간을 차지해서 받침을 밀어 올린 거야.';
  if(pumping)return '공기가 주머니로 들어가고 있어. 손을 떼면 넣은 공기는 그대로 있어.';
  if(s.air[n]>0)return '공기가 들어간 만큼 받침이 올라갔어. 펌프를 다시 꾹 눌러 공기를 더 넣어 봐.';
  if(picked!==null)return `${pieceName(m.tray[picked])}을 골랐어. 놓을 빈 칸을 눌러 봐.`;
  if(empties.length)return `아래 관 조각을 빈 칸(${empties.length}곳)으로 끌어다 놓아 봐. 조각을 누르고 빈 칸을 눌러도 돼.`;
  if(!ready())return '관을 눌러 돌려 봐. 파랗게 빛나는 길이 공기가 지나갈 수 있는 길이야. 안 맞는 조각은 다른 조각으로 바꿔 놓아도 돼.';
  if(s.vent[n])return '길은 이어졌는데 배출 밸브가 열려 있어. 밸브를 잠가야 공기가 새지 않아.';
  return '공기길이 이어졌어! 펌프를 꾹 누르고 있으면 공기가 들어가.';
 }
 // 길게 누르는 동안에는 화면 전체를 다시 그리지 않고 공기·받침만 바꾼다(누르고 있는 손가락이 끊기지 않게).
 function paintAir(){
  const n=level(),m=mission(),rise=Math.min(1,s.air[n]/m.required);
  dialog.querySelector('.gas-load')?.style.setProperty('--rise',`${rise*-70.4}px`);
  dialog.querySelector('.gas-bag')?.style.setProperty('--air',String(rise));
  const meter=dialog.querySelector('.pm-air-meter');
  if(meter){meter.setAttribute('aria-label',`공기 ${s.air[n]} / ${m.required}`);meter.querySelector('i').style.width=`${rise*100}%`;}
  dialog.querySelectorAll('.gas-pipe.has-flow').forEach(b=>b.classList.toggle('flowing',pumping>0||s.air[n]>0));
  dialog.querySelector('.gas-pump')?.classList.toggle('is-pumping',pumping>0);
  const feedback=dialog.querySelector('.pm-feedback');if(feedback)feedback.textContent=status();
 }
 function place(slot,k){
  const n=level(),m=mission();
  if(!m.empty.includes(slot)||done()||pumping)return;
  const placed=s.placed[n];
  if(placed[slot]===k)return;
  for(const [other,piece] of Object.entries(placed))if(piece===k)delete placed[other];
  placed[slot]=k;s.cells[n][slot]={...m.tray[k]};
  for(const other of m.empty)if(!(other in placed))s.cells[n][other]={type:-1,turn:0};
  picked=null;s.air[n]=0;message='';sound('connect');save();render();
  dialog.querySelector(`[data-cell="${slot}"]`)?.focus({preventScroll:true});
 }
 function startPump(){
  if(pumping||done())return;
  const n=level(),m=mission(),r=flow(s.cells[n],m,s.vent[n]);
  if(!(r.reached&&!r.leak)){s.air[n]=0;message=r.reason;sound('retry');render();return;}
  message='';sound('pump');
  const add=()=>{
   if(!dialog.isConnected){stopPump();return;}
   s.air[n]=Math.min(m.required,s.air[n]+1);
   if(s.air[n]>=m.required){clearInterval(pumping);pumping=0;if(!s.won.includes(n))s.won.push(n);sound('success');save();render();return;}
   paintAir();
  };
  pumping=setInterval(add,document.documentElement.classList.contains('reduce-motion')?160:420);
  add();
 }
 function stopPump(){
  if(!pumping)return;
  clearInterval(pumping);pumping=0;save();
  if(dialog.isConnected)render();
 }
 function render(){
  renderSignal.abort();renderSignal=new AbortController();
  const active=document.activeElement;
  const focusAttribute=dialog.contains(active)?active.getAttributeNames().find(name=>name.startsWith('data-')):null;
  const focusSelector=focusAttribute?`[${focusAttribute}="${active.getAttribute(focusAttribute)}"]`:null;
  const scrollTop=dialog.scrollTop;
  const n=level(),m=mission(),complete=done(),connected=ready();
  const path=new Set(flow(s.cells[n],m,false).path),tray=freeTray(),empties=m.empty.filter(i=>!(i in s.placed[n]));
  const nextTarget=complete?(n<2?'[data-next]':null):empties.length?(picked===null?'.pm-tray .pm-piece':'.gas-pipe.is-empty'):connected?(s.vent[n]?'[data-vent]':'[data-pump]'):'.gas-grid';
  const rise=Math.min(1,s.air[n]/m.required);
  dialog.innerHTML=`<div class="pm-shell"><header class="pm-head"><div><h2>에어의 공기 장치 공방</h2><p>공기는 공간을 차지해. 공기길을 이어 받침을 밀어 올려 봐!</p></div><button data-close>닫기 ${icon('close')}</button></header>
<nav class="pm-levels" aria-label="장치 고르기">${missions.map((x,i)=>`<button data-level="${i}" class="${i===n?'active':''}" ${i>0&&!s.won.includes(i-1)?'disabled':''}>${s.won.includes(i)?icon('check'):''}${i+1}. ${x.name}</button>`).join('')}</nav>
<p class="pm-goal">${m.goal}</p>
<div class="pm-workspace"><div class="pm-bench"><div class="gas-workbench">
<div class="gas-source"><span class="pm-port">공기 입구 ${icon('arrow')}</span><button class="gas-pump" data-pump aria-label="펌프를 꾹 누르고 있으면 공기가 들어가요" ${complete?'disabled':''}><img src="/assets/prop-pump.webp" alt="" draggable="false"><span>꾹 눌러<br>공기 넣기</span></button></div>
<div class="gas-grid" role="group" aria-label="3행 3열 공기길, 빈 칸에 관 조각을 놓고 관을 누르면 90도 돌아가요">${s.cells[n].map((x,i)=>{const blocked=m.blocked.includes(i),empty=x.type<0,lit=!blocked&&!empty&&path.has(i),placed=i in s.placed[n];return `<button class="gas-pipe ${blocked?'is-blocked':''} ${empty?'is-empty':''} ${placed?'is-placed':''} ${lit?'has-flow':''} ${lit&&s.air[n]>0?'flowing':''}" data-cell="${i}" data-slot="${m.empty.includes(i)?'yes':'no'}" ${blocked||complete?'disabled':''} aria-label="${i+1}번 ${blocked?'막힌 곳':empty?'빈 칸, 관 조각을 놓아요':`${pieceName(x)}, 눌러 돌리기`}">${blocked?'<span class="pm-blocked" aria-hidden="true"></span><span class="pm-blocked-label">막힘</span>':empty?'<span class="pm-slot-plus" aria-hidden="true">+</span>':pipeArt(x)}</button>`;}).join('')}</div>
<div class="gas-target"><div class="gas-actuator"><div class="gas-load" style="--rise:${rise*-70.4}px"><img src="/assets/visuals/cargo-crate-v1.webp" alt="공기 받침 위에 놓인 나무 상자" draggable="false"></div><div class="gas-bag" style="--air:${rise}"><img src="/assets/visuals/pneumatic-bellows-v1.webp" alt="공기가 들어오면 펼쳐지는 밀폐 주머니" draggable="false"></div></div><span>받침 장치</span><div class="pm-air-meter" aria-label="공기 ${s.air[n]} / ${m.required}"><i style="width:${rise*100}%"></i></div></div>
</div>
<div class="pm-tray" role="group" aria-label="관 조각 상자"><span class="pm-tray-label">관 조각</span>${tray.length?tray.map(p=>`<button class="pm-piece ${picked===p.k?'is-picked':''}" data-piece="${p.k}" aria-pressed="${picked===p.k}" aria-label="${pieceName(p)} 조각, 빈 칸으로 끌어 놓기" ${complete?'disabled':''}>${pipeArt(p)}</button>`).join(''):'<span class="pm-tray-empty">조각을 모두 놓았어. 안 맞으면 남은 조각으로 바꿀 수 있어.</span>'}</div></div>
<section class="pm-console" aria-label="장치 상태"><div class="pm-feedback ${complete?'good':''}" role="status">${status()}${saveError?' 저장하지 못했어. 창을 닫기 전에 기록을 확인해.':''}</div>
<div class="pm-actions">${m.ventOpen?`<button data-vent aria-pressed="${!s.vent[n]}">${icon(s.vent[n]?'flask':'check')} 배출 밸브 ${s.vent[n]?'열림 · 눌러 잠그기':'잠김'}</button>`:''}${s.air[n]>0?`<button data-release>공기 빼서 받침 내리기</button>`:''}${complete&&n<2?`<button data-next class="primary">다음 장치 ${icon('arrow')}</button>`:''}</div>
${complete&&n===2?'<strong class="pm-finished">공기 장치 설계 완료! 다른 장치도 다시 해 봐.</strong>':''}<p class="pm-note">단순화한 모형이야. 실제 도구를 무리하게 누르거나 입으로 불지 않아.</p></section></div></div>`;
  const signal=renderSignal.signal;
  dialog.querySelector('[data-close]').onclick=()=>dialog.close();
  dialog.querySelectorAll('[data-level]').forEach(b=>b.onclick=()=>{stopPump();picked=null;s.level=+b.dataset.level;s.air[s.level]=0;message='';save();render();});
  dialog.querySelectorAll('[data-cell]').forEach(b=>b.onclick=()=>{
   const i=+b.dataset.cell,c=s.cells[n][i];
   if(picked!==null&&m.empty.includes(i)){place(i,picked);return;}
   if(c.type<0){message='먼저 아래 상자에서 관 조각을 골라 이 칸에 놓아 봐.';render();return;}
   c.turn=(c.turn+1)%4;s.air[n]=0;message='';sound('rotate');save();render();
  });
  dialog.querySelectorAll('.pm-piece').forEach(b=>{
   const k=+b.dataset.piece;
   b.onclick=()=>{picked=picked===k?null:k;message='';sound();render();};
   touchDrag(b,{signal,selector:'.gas-pipe[data-slot="yes"]',onDrop:target=>place(+target.dataset.cell,k)});
  });
  dialog.querySelector('[data-vent]')?.addEventListener('click',()=>{s.vent[n]=!s.vent[n];s.air[n]=0;message=s.vent[n]?'배출 밸브를 열었어. 공기가 밖으로 새어 나가.':'';sound();save();render();});
  dialog.querySelector('[data-release]')?.addEventListener('click',()=>{s.air[n]=0;message='공기를 빼니 주머니가 줄어들고 받침이 내려왔어.';sound();save();render();});
  const pump=dialog.querySelector('[data-pump]');
  pump.addEventListener('pointerdown',e=>{if(e.button!==0)return;e.preventDefault();try{pump.setPointerCapture(e.pointerId);}catch{}startPump();},{signal});
  for(const type of ['pointerup','pointercancel','lostpointercapture'])pump.addEventListener(type,stopPump,{signal});
  pump.addEventListener('keydown',e=>{if(!['Enter','Space'].includes(e.code))return;e.preventDefault();if(!e.repeat)startPump();},{signal});
  pump.addEventListener('keyup',e=>{if(['Enter','Space'].includes(e.code))stopPump();},{signal});
  pump.addEventListener('contextmenu',e=>e.preventDefault(),{signal});
  dialog.querySelector('[data-next]')?.addEventListener('click',()=>{s.level++;picked=null;message='';save();render();dialog.querySelector('.pm-piece')?.focus();});
  if(nextTarget)dialog.querySelectorAll(nextTarget).forEach(el=>el.classList.add('is-next-action'));
  if(focusSelector)dialog.querySelector(focusSelector)?.focus({preventScroll:true});
  dialog.scrollTop=scrollTop;
 }
 window.addEventListener('blur',stopPump);
 dialog.addEventListener('close',()=>{window.removeEventListener('blur',stopPump);clearInterval(pumping);pumping=0;renderSignal.abort();dialog.remove();oldFocus?.focus?.();},{once:true});
 render();dialog.showModal();dialog.querySelector('[data-close]').focus();
}
