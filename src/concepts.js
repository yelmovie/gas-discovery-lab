import {bindConceptFocus,emphasizeConcept} from './concept-focus.js';
import {html,button,openDialog,escapeHTML} from './ui.js';
import {quietAudio,sound} from './audio.js';
import {icon} from './icons.js';

export function conceptFor(stage,task){
 const id=stage.id==='climate'?task.mode:stage.id==='delivery'?({nitrogen:'nitrogen',oxygen:'oxygen',carbon:task.id.endsWith('4')?'extinguisher':'carbon'})[task.gas]:stage.id==='engineering'&&task.target==='car'?'car':stage.id;
 const clips={
  flow:['공기가 길을 따라 움직여요',['공급부에서 공기를 보내요.','관이 이어져 있으면 공기가 팬까지 이동해요.','이동하는 공기가 팬을 밀어 돌려요.']],
  weight:['기체에도 무게가 있어요',['같은 단단한 용기를 빈 저울의 0점에 맞추어 재요.','용기는 그대로 두고 공기만 더 넣으면 무게가 늘어요.','공기를 빼면 무게가 줄어요. 기체에도 무게가 있어요.']],
  temperature:['온도에 따라 부피가 달라져요',['입구를 막아 기체의 양은 같게 유지해요.','따뜻하게 하면 기체가 차지하는 공간이 커져요.','다시 차갑게 하면 부피가 작아져요. 기체가 생기거나 사라진 건 아니에요.']],
  pressure:['누르는 힘과 기체의 부피',['공기가 새지 않는 피스톤이에요. 기체의 양은 같아요.','온도를 유지하고 더 세게 누르면 공기가 차지하는 공간이 줄어요.','누르는 힘을 줄이면 부피가 다시 커져요. 기체는 안에 그대로 있어요.']],
  nitrogen:['질소와 식품 포장',['과자 포장에 질소를 넣어요.','질소는 다른 물질과 쉽게 반응하지 않아요.','이 성질을 이용해 과자가 쉽게 변하지 않도록 도와요.']],
  oxygen:['호흡에 필요한 산소',['공기에는 여러 가지 기체가 섞여 있어요.','그중 산소는 사람의 호흡에 필요해요.','호흡 지원 시설에서 산소를 이용하는 까닭이에요.']],
  carbon:['탄산음료 속 이산화탄소',['이산화탄소를 물에 녹여 탄산음료를 만들어요.','뚜껑을 열면 녹아 있던 이산화탄소가 빠져나와요.','눈에 보이는 작은 기포가 되어 위로 올라와요.']],
  extinguisher:['불이 타는 것을 돕지 않아요',['이산화탄소는 불이 타는 것을 돕지 않아요.','이 성질을 이용하는 소화기가 있어요.','성질에 맞게 기체를 골라 쓰는 것이 중요해요. 실제 소화기 실험은 하지 않아요.']],
  engineering:['공기를 이용하는 장치',['공급부와 관, 노즐을 차례로 연결해요.','밸브를 열면 공기가 이어진 길을 따라 나가요.','공기가 목표 장치를 밀어요. 방향을 바꾸어 다시 시험할 수 있어요.']],
  car:['공기는 뒤로, 자동차는 앞으로',['풍선에 공기를 모으고 출구를 뒤로 향하게 해요.','공기가 뒤로 빠져나가요.','공기가 뒤로 나가면서 자동차는 앞으로 움직여요.']]
 };
 return {id,title:clips[id][0],cues:clips[id][1]};
}

// Discovery is saved before opening. A broken/blocked video can never trap a learner.
export function openConcept(stage,task,{nextLabel='활동으로 돌아가기',onNext=()=>{},signal,reward=''}={}){
 const clip=conceptFor(stage,task),asset=ext=>`/assets/concepts-v2/${clip.id}.${ext}`;
 const body=html(`<section class="concept-player"><div class="concept-frame"><video playsinline muted preload="metadata" poster="${asset('webp')}" aria-label="${escapeHTML(clip.title)}"></video><img class="concept-end" src="${asset('webp')}" alt="${escapeHTML(clip.title)}의 마지막 장면" hidden><button class="button primary concept-play">${icon('arrow')} 영상 재생</button></div><div class="concept-caption" role="status" aria-live="polite"></div><div class="concept-meta"><span>${escapeHTML(reward||'직접 발견한 과학 · 9초')}</span><span class="concept-dots" aria-hidden="true"><i></i><i></i><i></i></span></div><div class="concept-fallback" hidden></div></section>`);
 const footer=html('<div class="concept-actions"></div>');let closed=false,failed=false,bufferTimer=0,last=-1,visiblePlaying=false;
 let releaseFocus=()=>{};
 const video=body.querySelector('video'),play=body.querySelector('.concept-play'),end=body.querySelector('.concept-end'),caption=body.querySelector('.concept-caption'),fallback=body.querySelector('.concept-fallback');
 const dialog=openDialog(clip.title,body,{wide:true,footer,onClose:cleanup});dialog.classList.add('concept-dialog');
 const replay=button('다시 보기',()=>{if(failed){failed=false;fallback.hidden=true;load();}else{video.currentTime=0;start();}},'button secondary');
 const next=button(`${nextLabel} ${icon('arrow')}`,()=>{dialog.close();onNext();});footer.append(replay,next);
 function cue(index){if(index===last)return;last=index;caption.textContent=clip.cues[index];body.querySelectorAll('.concept-dots i').forEach((d,i)=>d.classList.toggle('on',i===index));}
 function update(){cue(Math.min(2,Math.floor(video.currentTime/3)));}
 function fail(){if(closed||failed)return;failed=true;releaseFocus();clearTimeout(bufferTimer);video.pause();end.hidden=false;play.hidden=true;fallback.hidden=false;fallback.innerHTML=`<p>영상 대신 핵심 장면을 살펴봐요.</p><ol>${clip.cues.map(c=>`<li>${emphasizeConcept(c,words)}</li>`).join('')}</ol>`;cue(2);quietAudio(false);}
 function arm(){clearTimeout(bufferTimer);bufferTimer=setTimeout(fail,6000);}
 async function start(){if(closed||failed)return;end.hidden=true;try{await video.play();if(closed){video.pause();return;}play.hidden=true;play.textContent='잠깐 멈추기';quietAudio(true);}catch{if(!closed){play.hidden=false;play.textContent='영상 재생';quietAudio(false);}}}
 play.onclick=()=>video.paused?start():(video.pause(),play.textContent='이어서 보기',quietAudio(false));
 video.addEventListener('click',()=>{if(!video.paused){video.pause();play.hidden=false;play.textContent='이어서 보기';quietAudio(false);}});
 let autoStarted=false;video.addEventListener('loadeddata',()=>{clearTimeout(bufferTimer);if(!autoStarted){autoStarted=true;if(!matchMedia('(prefers-reduced-motion: reduce)').matches)start();}});
 video.addEventListener('playing',()=>{clearTimeout(bufferTimer);quietAudio(true);});video.addEventListener('waiting',arm);video.addEventListener('error',fail);
 video.addEventListener('timeupdate',update);video.addEventListener('seeked',update);video.addEventListener('ended',()=>{clearTimeout(bufferTimer);end.hidden=false;play.hidden=true;cue(2);quietAudio(false);next.focus({preventScroll:true});sound('success');});
 function visibility(){if(document.hidden){visiblePlaying=!video.paused;video.pause();clearTimeout(bufferTimer);}else if(visiblePlaying){visiblePlaying=false;start();}}
 document.addEventListener('visibilitychange',visibility);
 function cleanup(){releaseFocus();closed=true;clearTimeout(bufferTimer);video.pause();video.removeAttribute('src');video.load();document.removeEventListener('visibilitychange',visibility);signal?.removeEventListener('abort',dismiss);quietAudio(false);}
 function dismiss(){dialog.close();}signal?.addEventListener('abort',dismiss,{once:true});
 function load(){autoStarted=false;last=-1;cue(0);play.hidden=false;video.src=asset(video.canPlayType('video/webm; codecs="vp9"')?'webm':'mp4');arm();releaseFocus();releaseFocus=bindConceptFocus(body,video,{steps:labels.map((term,i)=>({at:i*3,term})),terms:words,caption,anchor:body.querySelector('.concept-frame')});}
 const words={flow:['공기','관','이동'],weight:['0점','공기','무게'],temperature:['기체의 양','따뜻','부피','차갑'],pressure:['기체의 양','온도','힘','부피'],nitrogen:['질소','반응'],oxygen:['산소','호흡'],carbon:['이산화탄소','녹아','기포'],extinguisher:['이산화탄소','불이 타는 것을 돕지','실제 소화기 실험은 하지'],engineering:['공급부','관','노즐','방향'],car:['공기','뒤로','자동차','앞으로']}[clip.id];
 const labels={flow:['공기 보내기','관을 따라 이동','팬 돌리기'],weight:['영점 맞추기','공기 넣기','기체의 무게'],temperature:['같은 양','따뜻할 때','차가울 때'],pressure:['같은 양','누르는 힘','부피 변화'],nitrogen:['질소 넣기','쉽게 반응하지 않음','식품 포장'],oxygen:['공기의 성분','산소와 호흡','산소의 이용'],carbon:['물에 녹은 기체','빠져나오는 기체','기포 관찰'],extinguisher:['기체의 성질','소화기에 이용','안전하게 살펴보기'],engineering:['길 연결','밸브 열기','방향 시험'],car:['출구를 뒤로','공기는 뒤로','자동차는 앞으로']}[clip.id];
 load();
 video.addEventListener('pause',()=>quietAudio(false));
 return dialog;
}
