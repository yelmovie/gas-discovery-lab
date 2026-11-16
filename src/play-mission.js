import {missions,flow,startCells} from './play-mission-model.js';
import {icon} from './icons.js';
import {pipeArtwork} from './pipe-art.js';
import {sound} from './audio.js';
const KEY='science-play-15-v1';
let baseline=null,recovery=null;
const defaults=()=>({level:0,cells:missions.map(startCells),vent:missions.map(m=>m.ventOpen),air:missions.map(()=>0),won:[]});
// 관 모양은 미션마다 고정이다. 예전 기록의 모양이 다르면 그 미션은 처음 배치로 돌린다.
function load(){
 recovery=null;
 try{
  baseline=localStorage.getItem(KEY);
  const old=JSON.parse(baseline),s=defaults();
  if(!old)return s;
  s.level=Math.max(0,Math.min(2,Math.trunc(old.level)||0));
  s.cells=missions.map((m,i)=>{
   const saved=old.cells?.[i];
   const same=Array.isArray(saved)&&saved.length===9&&saved.every((c,j)=>Math.trunc(c?.type)===m.start[j].type);
   return same?m.start.map((c,j)=>({type:c.type,turn:Math.abs(Math.trunc(saved[j].turn)||0)%4})):startCells(m);
  });
  s.vent=missions.map((m,i)=>typeof old.vent?.[i]==='boolean'?old.vent[i]:m.ventOpen);
  s.air=missions.map((m,i)=>Math.max(0,Math.min(m.required,Math.trunc(old.air?.[i])||0)));
  s.won=(old.won||[]).filter(x=>Number.isInteger(x)&&x>=0&&x<3);
  return s;
 }catch{recovery=baseline;return defaults();}
}
// 모델의 관 방향(직선 0 = 위아래)을 관 그림의 회전(직선 0 = 좌우)에 맞춘다.
const pipeArt=cell=>pipeArtwork(cell.type===1?'elbow':'straight',cell.type===1?cell.turn:cell.turn+1,{flow:true});
export function openPlayMission(){
 if(document.querySelector('.play-mission'))return;
 document.dispatchEvent(new Event('gas-dialog-open'));
 const oldFocus=document.activeElement,dialog=document.createElement('dialog');
 dialog.className='play-mission gas-play';
 dialog.setAttribute('aria-label','에어의 공기 장치 공방');
 document.body.append(dialog);
 let s=load(),message='',saveError=false,filling=0;
 const save=()=>{
  try{
   if(localStorage.getItem(KEY)!==baseline){saveError=true;message='다른 창의 공방 기록이 바뀌었어. 창을 닫고 다시 열어 줘.';return;}
   if(recovery!==null)localStorage.setItem(KEY+'-recovery',recovery);
   const encoded=JSON.stringify(s);
   localStorage.setItem(KEY,encoded);
   baseline=encoded;recovery=null;saveError=false;
  }catch{saveError=true;}
 };
 const stopFilling=()=>{clearInterval(filling);filling=0;};
 function status(){
  const n=s.level,m=missions[n],sealed=flow(s.cells[n],m,false),done=s.air[n]>=m.required;
  if(message)return message;
  if(filling)return '공기가 관을 따라 주머니로 들어가고 있어. 받침이 올라가는지 봐!';
  if(done)return n<2?'공기가 주머니를 부풀려 받침과 상자를 밀어 올렸어! 다음 장치로 가 봐.':'세 장치를 모두 움직였어! 공기가 공간을 차지해서 받침을 밀어 올린 거야.';
  if(!sealed.reached||sealed.leak)return '관을 눌러 돌려 봐. 파랗게 빛나는 길이 공기가 지나갈 수 있는 길이야.';
  if(s.vent[n])return '길은 이어졌는데 배출 밸브가 열려 있어. 밸브를 잠가야 공기가 새지 않아.';
  return '공기길이 이어졌어! 펌프를 눌러 공기를 보내 봐.';
 }
 function render(){
  const active=document.activeElement;
  const focusAttribute=dialog.contains(active)?active.getAttributeNames().find(name=>name.startsWith('data-')):null;
  const focusSelector=focusAttribute?`[${focusAttribute}="${active.getAttribute(focusAttribute)}"]`:null;
  const scrollTop=dialog.scrollTop;
  const n=s.level,m=missions[n],sealed=flow(s.cells[n],m,false),done=s.air[n]>=m.required,ready=sealed.reached&&!sealed.leak;
  const path=new Set(flow(s.cells[n],m,false).path);
  const nextTarget=filling?null:done?(n<2?'[data-next]':null):ready?(s.vent[n]?'[data-vent]':'[data-pump]'):'.gas-grid';
  const rise=Math.min(1,s.air[n]/m.required);
  dialog.innerHTML=`<div class="pm-shell"><header class="pm-head"><div><h2>에어의 공기 장치 공방</h2><p>공기는 공간을 차지해. 공기길을 이어 받침을 밀어 올려 봐!</p></div><button data-close>닫기 ${icon('close')}</button></header>
<nav class="pm-levels" aria-label="장치 고르기">${missions.map((x,i)=>`<button data-level="${i}" class="${i===n?'active':''}" ${i>0&&!s.won.includes(i-1)?'disabled':''}>${s.won.includes(i)?icon('check'):''}${i+1}. ${x.name}</button>`).join('')}</nav>
<p class="pm-goal">${m.goal}</p>
<div class="pm-workspace"><div class="gas-workbench">
<div class="gas-source"><span class="pm-port">공기 입구 ${icon('arrow')}</span><button class="gas-pump ${filling?'is-pumping':''}" data-pump aria-label="펌프로 공기 보내기" ${filling||done?'disabled':''}><img src="/assets/prop-pump.webp" alt="" draggable="false"><span>${filling?'보내는 중':'공기 보내기'}</span></button></div>
<div class="gas-grid" role="group" aria-label="3행 3열 공기길, 관을 누르면 90도 돌아가요">${s.cells[n].map((x,i)=>{const blocked=m.blocked.includes(i),lit=!blocked&&path.has(i);return `<button class="gas-pipe ${blocked?'is-blocked':''} ${lit?'has-flow':''} ${lit&&s.air[n]>0?'flowing':''}" data-cell="${i}" ${blocked||filling||done?'disabled':''} aria-label="${i+1}번 ${blocked?'막힌 곳':`${x.type===1?'굽은 관':'일자 관'}, 눌러 돌리기`}">${blocked?'<span class="pm-blocked" aria-hidden="true"></span><span class="pm-blocked-label">막힘</span>':pipeArt(x)}</button>`;}).join('')}</div>
<div class="gas-target"><div class="gas-actuator"><div class="gas-load" style="--rise:${rise*-70.4}px"><img src="/assets/visuals/cargo-crate-v1.webp" alt="공기 받침 위에 놓인 나무 상자" draggable="false"></div><div class="gas-bag" style="--air:${rise}"><img src="/assets/visuals/pneumatic-bellows-v1.webp" alt="공기가 들어오면 펼쳐지는 밀폐 주머니" draggable="false"></div></div><span>받침 장치</span><div class="pm-air-meter" aria-label="공기 ${s.air[n]} / ${m.required}"><i style="width:${rise*100}%"></i></div></div>
</div>
<section class="pm-console" aria-label="장치 상태"><div class="pm-feedback ${done?'good':''}" role="status">${status()}${saveError?' 저장하지 못했어. 창을 닫기 전에 기록을 확인해.':''}</div>
<div class="pm-actions">${m.ventOpen?`<button data-vent aria-pressed="${!s.vent[n]}" ${filling?'disabled':''}>${icon(s.vent[n]?'flask':'check')} 배출 밸브 ${s.vent[n]?'열림 · 눌러 잠그기':'잠김'}</button>`:''}${s.air[n]>0&&!filling?`<button data-release>공기 빼서 받침 내리기</button>`:''}${done&&n<2?`<button data-next class="primary">다음 장치 ${icon('arrow')}</button>`:''}</div>
${done&&n===2?'<strong class="pm-finished">공기 장치 설계 완료! 다른 장치도 다시 해 봐.</strong>':''}<p class="pm-note">단순화한 모형이야. 실제 도구를 무리하게 누르거나 입으로 불지 않아.</p></section></div></div>`;
  dialog.querySelector('[data-close]').onclick=()=>dialog.close();
  dialog.querySelectorAll('[data-level]').forEach(b=>b.onclick=()=>{stopFilling();s.level=+b.dataset.level;s.air[s.level]=0;message='';save();render();});
  dialog.querySelectorAll('[data-cell]').forEach(b=>b.onclick=()=>{const c=s.cells[n][+b.dataset.cell];c.turn=(c.turn+1)%4;s.air[n]=0;message='';sound('rotate');save();render();});
  dialog.querySelector('[data-vent]')?.addEventListener('click',()=>{s.vent[n]=!s.vent[n];s.air[n]=0;message=s.vent[n]?'배출 밸브를 열었어. 공기가 밖으로 새어 나가.':'';sound();save();render();});
  dialog.querySelector('[data-release]')?.addEventListener('click',()=>{s.air[n]=0;message='공기를 빼니 주머니가 줄어들고 받침이 내려왔어.';sound();save();render();});
  dialog.querySelector('[data-pump]').onclick=()=>{
   if(filling)return;
   const r=flow(s.cells[n],m,s.vent[n]);
   if(!(r.reached&&!r.leak)){s.air[n]=0;message=r.reason;sound('retry');render();return;}
   message='';sound('pump');
   // 한 번 누르면 공기가 한 칸씩 차오르며 받침이 올라가는 모습을 보여 준다.
   filling=setInterval(()=>{
    if(!dialog.isConnected){stopFilling();return;}
    s.air[n]=Math.min(m.required,s.air[n]+1);
    if(s.air[n]>=m.required){stopFilling();if(!s.won.includes(n))s.won.push(n);sound('success');save();}
    render();
   },document.documentElement.classList.contains('reduce-motion')?120:420);
   render();
  };
  dialog.querySelector('[data-next]')?.addEventListener('click',()=>{s.level++;message='';save();render();dialog.querySelector('.gas-grid button:not(:disabled)')?.focus();});
  if(nextTarget)dialog.querySelectorAll(nextTarget).forEach(el=>el.classList.add('is-next-action'));
  if(focusSelector)dialog.querySelector(focusSelector)?.focus({preventScroll:true});
  dialog.scrollTop=scrollTop;
 }
 dialog.addEventListener('close',()=>{stopFilling();dialog.remove();oldFocus?.focus?.();},{once:true});
 render();dialog.showModal();dialog.querySelector('[data-close]').focus();
}
