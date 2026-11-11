import {missions,ports,flow,freshCells} from './play-mission-model.js';
import {icon} from './icons.js';
const KEY='science-play-15-v1';
let baseline=null,recovery=null;
const defaults=()=>({level:0,cells:missions.map(freshCells),vent:missions.map(m=>m.ventOpen),air:missions.map(()=>0),won:[]});
function load(){recovery=null;try{baseline=localStorage.getItem(KEY);const old=JSON.parse(baseline),s=defaults();if(!old)return s;s.level=Math.max(0,Math.min(2,Math.trunc(old.level)||0));s.cells=missions.map((_,i)=>Array.from({length:9},(_,j)=>({type:Math.max(0,Math.min(3,Math.trunc(old.cells?.[i]?.[j]?.type)||0)),turn:Math.abs(Math.trunc(old.cells?.[i]?.[j]?.turn)||0)%4})));s.vent=missions.map((m,i)=>typeof old.vent?.[i]==='boolean'?old.vent[i]:m.ventOpen);s.air=missions.map((m,i)=>Math.max(0,Math.min(m.required,Math.trunc(old.air?.[i])||0)));s.won=(old.won||[]).filter(x=>Number.isInteger(x)&&x>=0&&x<3);return s;}catch{recovery=baseline;return defaults();}}
export function openPlayMission(){if(document.querySelector('.play-mission'))return;document.dispatchEvent(new Event('gas-dialog-open'));const oldFocus=document.activeElement,dialog=document.createElement('dialog');dialog.className='play-mission gas-play';dialog.setAttribute('aria-label','에어의 공기 장치 공방');document.body.append(dialog);let s=load(),message='관을 눌러 돌리고, 모양 바꾸기로 연결해 봐.',mode='rotate',undo=[],saveError=false;const save=()=>{
 try{
  if(localStorage.getItem(KEY)!==baseline){
   saveError=true;
   message='다른 창의 공방 기록이 바뀌었어. 창을 닫고 다시 열어 줘.';
   return;
  }
  if(recovery!==null)localStorage.setItem(KEY+'-recovery',recovery);
  const encoded=JSON.stringify(s);
  localStorage.setItem(KEY,encoded);
  baseline=encoded;
  recovery=null;
  saveError=false;
 }catch{saveError=true;}
};
function pipeSVG(piece){return `<svg viewBox="0 0 100 100" aria-hidden="true">${ports(piece).map(d=>{const ends=[[50,0],[100,50],[50,100],[0,50]][d];return `<path d="M50 50 L${ends[0]} ${ends[1]}" stroke="currentColor" stroke-width="18" fill="none" stroke-linecap="round"/>`;}).join('')}<circle cx="50" cy="50" r="12" fill="currentColor"/></svg>`;}
function render(){
 const active=document.activeElement;
 const focusAttribute=active?.getAttributeNames().find(name=>name.startsWith('data-'));
 const focusSelector=dialog.contains(active)&&focusAttribute
  ? `[${focusAttribute}="${active.getAttribute(focusAttribute)}"]` : null;
 const scrollTop=dialog.scrollTop;
 const n=s.level,m=missions[n],f=flow(s.cells[n],m,s.vent[n]),done=s.air[n]>=m.required;
 const sealed=flow(s.cells[n],m,false);
 const nextTarget=done?(n<2?'[data-next]':'[data-release]'):sealed.reached&&!sealed.leak?(s.vent[n]?'[data-vent]':'[data-pump]'):'.gas-grid';
 dialog.innerHTML=`<div class="pm-shell" style="--pm-bg:url('/assets/engineering.webp')"><header class="pm-head"><div><h2>에어의 공기 장치 공방</h2><p>공기는 공간을 차지해. 공기길을 만들어 장치를 움직여 봐!</p></div><button data-close>닫기 ${icon('close')}</button></header><nav class="pm-levels">${missions.map((x,i)=>`<button data-level="${i}" class="${i===n?'active':''}" ${i>0&&!s.won.includes(i-1)?'disabled':''}>${s.won.includes(i)?icon('check'):''}${i+1}. ${x.name}</button>`).join('')}</nav><p class="pm-goal">${m.goal}</p><div class="pm-workspace"><div class="gas-workbench"><div class="gas-source"><span>공기 입구 →</span><button class="gas-pump" data-pump aria-label="펌프로 공기 보내기"><img src="/assets/prop-pump.webp" alt="" draggable="false"><span>공기 보내기</span></button></div><div class="gas-grid">${s.cells[n].map((x,i)=>`<button class="gas-pipe ${f.path.includes(i)&&s.air[n]>0?'flowing':''}" data-cell="${i}" ${m.blocked.includes(i)?'disabled':''} aria-label="${i+1}번 ${m.blocked.includes(i)?'막힌 곳':`관 ${['직선','굽은관','갈림관','십자관'][x.type]}`}">${m.blocked.includes(i)?'<span>막힘</span>':pipeSVG(x)}</button>`).join('')}</div><div class="gas-target"><div class="gas-actuator"><div class="gas-load" style="--rise:${Math.min(1,s.air[n]/m.required)*-70.4}px"><img src="/assets/visuals/cargo-crate-v1.webp" alt="공기 받침 위에 놓인 나무 상자" draggable="false"></div><div class="gas-bag" style="--air:${Math.min(1,s.air[n]/m.required)}"><img src="/assets/visuals/pneumatic-bellows-v1.webp" alt="공기가 들어오면 펼쳐지는 밀폐 주머니" draggable="false"></div></div><span>받침 장치</span><b>${s.air[n]} / ${m.required}</b></div></div><section class="pm-console" aria-label="설계와 실험 결과"><div class="pm-actions"><button data-mode="rotate" aria-pressed="${mode==='rotate'}">관 돌리기</button><button data-mode="shape" aria-pressed="${mode==='shape'}">모양 바꾸기</button><button data-vent>배출 밸브: ${s.vent[n]?'열림':'잠김'}</button><button data-release>공기 빼기</button><button data-undo ${undo.length?'':'disabled'}>한 번 되돌리기</button>${done&&n<2?'<button data-next class="primary">다음 장치 →</button>':''}</div><div class="pm-feedback ${done?'good':''}" role="status">${message}${saveError?' 저장하지 못했어. 창을 닫기 전에 기록을 확인해.':''}</div>${done&&n===2?'<strong class="pm-finished">공기 장치 설계 완료! 다른 경로도 만들어 봐.</strong>':''}<p class="pm-note">공기 흐름과 받침의 움직임은 단순화한 모형이야. 표시 숫자는 게임 속 펌프 횟수이며 실제 부피·압력 값이 아니야. 실제 도구를 무리하게 누르거나 입으로 불지 않아.</p></section></div></div>`;
dialog.querySelector('[data-close]').onclick=()=>dialog.close();dialog.querySelectorAll('[data-level]').forEach(b=>b.onclick=()=>{s.level=+b.dataset.level;s.air[s.level]=0;undo=[];message='새 장치의 공기길을 만들어 봐.';save();render();});dialog.querySelectorAll('[data-mode]').forEach(b=>b.onclick=()=>{mode=b.dataset.mode;render();});dialog.querySelectorAll('[data-cell]').forEach(b=>b.onclick=()=>{undo.push(JSON.stringify({cells:s.cells[n],vent:s.vent[n]}));if(undo.length>20)undo.shift();const c=s.cells[n][+b.dataset.cell];if(mode==='rotate')c.turn=(c.turn+1)%4;else c.type=(c.type+1)%4;s.air[n]=0;message='설계를 바꿨어. 펌프로 시험해 봐.';save();render();});dialog.querySelector('[data-vent]').onclick=()=>{undo.push(JSON.stringify({cells:s.cells[n],vent:s.vent[n]}));s.vent[n]=!s.vent[n];s.air[n]=0;message=s.vent[n]?'배출 밸브를 열었어. 공기가 밖으로 나갈 수 있어.':'배출 밸브를 잠갔어.';save();render();};dialog.querySelector('[data-release]').onclick=()=>{s.air[n]=0;message='공기를 빼니 받침이 내려왔어. 다시 시험해 봐.';save();render();};dialog.querySelector('[data-undo]').onclick=()=>{if(undo.length){const v=JSON.parse(undo.pop());s.cells[n]=v.cells;s.vent[n]=v.vent;s.air[n]=0;save();message='직전 설계로 되돌렸어.';render();}};dialog.querySelector('[data-pump]').onclick=()=>{const r=flow(s.cells[n],m,s.vent[n]);if(r.reached&&!r.leak){s.air[n]=Math.min(m.required,s.air[n]+1);message=s.air[n]>=m.required?'공기가 주머니를 부풀려 받침과 상자를 밀어 올렸어!':r.reason;if(s.air[n]>=m.required&&!s.won.includes(n))s.won.push(n);}else{s.air[n]=0;message=r.reason;}save();render();};const next=dialog.querySelector('[data-next]');if(next)next.onclick=()=>{s.level++;undo=[];message='새 조건에서도 공기길을 만들어 봐.';save();render();dialog.querySelector('[data-pump]').focus();};
 dialog.querySelector(nextTarget)?.classList.add('is-next-action');
 if(focusSelector)dialog.querySelector(focusSelector)?.focus({preventScroll:true});
 dialog.scrollTop=scrollTop;
}

dialog.addEventListener('close',()=>{dialog.remove();oldFocus?.focus?.();},{once:true});render();dialog.showModal();dialog.querySelector('[data-close]').focus();}
function install(){const host=document.querySelector('.title-actions, .stage-start');if(host&&!host.querySelector('.play-mission-entry')){const b=document.createElement('button');b.className='play-mission-entry';b.textContent='공기 장치 미션';b.onclick=openPlayMission;host.append(b);}}
new MutationObserver(install).observe(document.getElementById('app'),{childList:true,subtree:true});install();
