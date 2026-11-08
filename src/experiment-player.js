import {icon} from './icons.js';

// Observation time is kept in experiment milliseconds, so changing the rate
// or pausing never repeats an action or skips the remaining observation.
export function createPlayback({signal,schedule=setTimeout,cancel=clearTimeout,now=()=>performance.now(),onChange=()=>{}}={}){
  let spec=null,state='idle',speed=1,queue=[],index=-1,timer=null,remaining=0,started=0;
  const snapshot=()=>({state,speed,index,total:queue.length,step:queue[index]||null});
  const emit=()=>onChange(snapshot());
  function clear(){if(timer!==null)cancel(timer);timer=null;}
  function account(){if(state==='running')remaining=Math.max(0,remaining-(now()-started)*speed);clear();}
  function stop(next){clear();state=next;spec?.onStop?.();emit();}
  function wait(){started=now();timer=schedule(advance,remaining/speed);}
  function advance(){
    clear();if(state!=='running'||signal?.aborted)return;
    index++;
    if(index>=queue.length){stop('finished');return;}
    const step=queue[index];remaining=Math.max(0,Number(step.wait??1000));
    try{
      if(step.run?.()===false){stop('waiting');return;}
      if(state!=='running'||signal?.aborted)return;
      emit();wait();
    }catch(error){stop('error');}
  }
  const player={
    get state(){return state;},get speed(){return speed;},
    configure(value){if(state==='running'||state==='paused')player.interrupt();spec=value;if(!['complete','aborted'].includes(state))state='idle';emit();},
    play(){
      if(signal?.aborted||['complete','aborted','running'].includes(state)||!spec)return;
      if(state==='paused'){state='running';emit();wait();return;}
      try{queue=spec.steps?.()||[];}catch{stop('error');return;}
      index=-1;state='running';emit();advance();
    },
    pause(){if(state!=='running')return;account();state='paused';emit();},
    interrupt(){if(['complete','aborted'].includes(state))return;clear();queue=[];index=-1;remaining=0;stop('idle');},
    setSpeed(value){if(![.5,1,2].includes(Number(value)))return;if(state==='running')account();speed=Number(value);emit();if(state==='running')wait();},
    complete(){clear();queue=[];index=-1;stop('complete');},
    dispose(){clear();queue=[];index=-1;stop('aborted');}
  };
  signal?.addEventListener('abort',()=>player.dispose(),{once:true});
  return player;
}

let preferredSpeed=1;
export function mountExperimentPlayer(screen,{signal,onInstruction,onTargets}){
  const controls=screen.querySelector('.playback-controls');
  controls.innerHTML=`<button type="button" class="button secondary autoplay-button" aria-pressed="false">${icon('play')}<span>자동재생</span></button><label class="playback-speed"><span class="sr-only">자동재생 속도</span><select aria-label="자동재생 속도"><option value="0.5">0.5× 천천히</option><option value="1">1× 보통</option><option value="2">2× 빠르게</option></select></label>`;
  const toggle=controls.querySelector('button'),select=controls.querySelector('select');
  const player=createPlayback({signal,onChange:({state,speed,step})=>{
    screen.dataset.playback=state;screen.style.setProperty('--playback-rate',String(speed));
    toggle.setAttribute('aria-pressed',String(state==='running'));
    const label=state==='running'?'일시정지':state==='paused'?'이어서 재생':state==='finished'||state==='waiting'?'다시 관찰':'자동재생';
    toggle.innerHTML=`${icon(state==='running'?'pause':'play')}<span>${label}</span>`;
    toggle.disabled=['complete','aborted'].includes(state);select.disabled=toggle.disabled;
    if(state==='running'&&step){if(step.label)onInstruction(step.label);if(step.target)onTargets(step.target);}
    if(state==='error')onInstruction('재생을 멈췄어요. 화면의 조작으로 이어서 탐구해요.');
  }});
  player.setSpeed(preferredSpeed);select.value=String(preferredSpeed);
  toggle.onclick=()=>player.state==='running'?player.pause():player.play();
  select.onchange=()=>{preferredSpeed=Number(select.value);player.setSpeed(preferredSpeed);};
  const host=screen.querySelector('.activity-host');
  const manual=e=>{if(e.isTrusted&&['running','paused'].includes(player.state))player.interrupt();};
  host.addEventListener('pointerdown',manual,{capture:true,signal});
  host.addEventListener('keydown',manual,{capture:true,signal});
  const pauseForTools=e=>{if(e.isTrusted&&(!e.type.startsWith('key')||['Enter',' '].includes(e.key)))player.pause();};
  for(const toolbar of [screen.querySelector('.utility-tools'),document.querySelector('.global-controls')])if(toolbar){toolbar.addEventListener('pointerdown',pauseForTools,{capture:true,signal});toolbar.addEventListener('keydown',pauseForTools,{capture:true,signal});}
  document.addEventListener('visibilitychange',()=>{if(document.hidden)player.pause();},{signal});
  return player;
}
