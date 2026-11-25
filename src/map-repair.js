// Map restoration is a separate reward interaction, never a learning assessment.
import {icon} from './icons.js';

export function mountRepair(host,{state,save,available,preview=false,signal}) {
 if(!available.length)return;
 if(preview)state={...state,mapRepairs:[...(state.mapRepairs||[])]};

 const panel=document.createElement('details');
 panel.className='map-repair';
 panel.innerHTML=`
  <summary aria-label="지도 복구 작업대" title="지도 복구 작업대">
   ${icon('map')}<span>지도 복구 작업대</span><span class="repair-close">${icon('close')}</span>
  </summary>
  <div class="repair-body">
   <select aria-label="복구할 시설"></select>
   <p class="repair-status" role="status"></p>
   <div class="repair-work"></div>
  </div>`;
 host.append(panel);
 const summary=panel.querySelector('summary');
 const select=panel.querySelector('select');
 const work=panel.querySelector('.repair-work');
 const status=panel.querySelector('.repair-status');

 // Align the collapsed control with the top row while letting the workbench open toward the scenery.
 const place=()=>{
  const row=host.parentElement?.querySelector('.global-controls .controls-right')?.getBoundingClientRect();
  if(!row?.width)return;
  panel.style.setProperty('--repair-top',Math.round(row.top+Math.max(0,(row.height-48)/2))+'px');
  panel.style.setProperty('--repair-right',Math.round(innerWidth-row.left+8)+'px');
 };
 addEventListener('resize',place,{signal});
 document.addEventListener('pointerdown',event=>{
  if(panel.open&&!panel.contains(event.target))panel.open=false;
 },{signal});
 place();
 panel.addEventListener('keydown',e=>{
  e.stopPropagation();
  if(e.key==='Escape'&&panel.open){panel.open=false;summary.focus();}
 });

 for(const facility of available)select.add(new Option(facility.label,String(facility.id)));
 select.value=String((available.find(({id})=>!state.mapRepairs?.includes(id))??available[0]).id);
 select.onchange=render;
 render();

 function finish(){
  const id=Number(select.value);
  if(!state.mapRepairs?.includes(id))state.mapRepairs=[...(state.mapRepairs||[]),id];
  if(!preview)save();
  render();
  select.focus({preventScroll:true});
 }

 function render(){
  status.removeAttribute('data-pressure');
  if(state.mapRepairs?.includes(Number(select.value))){
   work.innerHTML=`<div class="repair-scene" aria-hidden="true">${icon('check')}</div>`;
   status.textContent=preview?'시연에서 복구했어요.':'이 시설을 복구했어요.';
   return;
  }

  const targets=[30,70,50];
  let step=0;
  work.innerHTML=`
   <div class="repair-scene" aria-hidden="true">
    <svg class="repair-valve" viewBox="0 0 100 100" width="90" height="90">
     <circle cx="50" cy="50" r="39" fill="#2e9291" stroke="#dcf8ef" stroke-width="9"/>
     <path d="M50 11v78M11 50h78" stroke="#dcf8ef" stroke-width="9"/>
     <circle cx="50" cy="50" r="12" fill="#edb749"/>
    </svg>
    <div class="repair-piston"></div>
    <div class="repair-steps"><i></i><i></i><i></i></div>
   </div>
   <input aria-label="공기 밸브" type="range" min="0" max="100" value="0">
   <button type="button" disabled>가동하기</button>`;
  const valve=work.querySelector('.repair-valve');
  const piston=work.querySelector('.repair-piston');
  const steps=work.querySelectorAll('.repair-steps i');
  const input=work.querySelector('input');
  const activate=work.querySelector('button');
  const pressure={low:'압력이 낮아요.',high:'압력이 높아요.',ready:'가동할 수 있어요.'};

  function update(){
   const value=Number(input.value);
   const difference=value-targets[step];
   const state=Math.abs(difference)<=4?'ready':difference<0?'low':'high';
   valve.style.rotate=`${value*2.7}deg`;
   piston.style.translate=`0 ${18-value*.34}px`;
   activate.disabled=state!=='ready';
   if(status.dataset.pressure!==state){
    status.dataset.pressure=state;
    status.textContent=pressure[state];
   }
  }
  input.oninput=update;
  status.textContent='밸브를 움직여 압력을 맞춰요.';
  piston.style.translate='0 18px';
  activate.onclick=()=>{
   steps[step].classList.add('done');
   if(++step===targets.length){finish();return;}
   update();
   input.focus({preventScroll:true});
  };
 }
}
