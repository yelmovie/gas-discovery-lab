import {bindConceptFocus,emphasizeConcept} from './concept-focus.js';
import {html,button,openDialog,escapeHTML} from './ui.js';
import {quietAudio,sound} from './audio.js';
import {icon} from './icons.js';
import {CONCEPT_CLIPS,CONCEPT_WORDS,CONCEPT_LABELS,CONCEPT_SECONDS,CUE_SECONDS,cueAt} from './concept-clips.js';

export function conceptFor(stage,task){
 const id=stage.id==='climate'?task.mode:stage.id==='delivery'?({nitrogen:'nitrogen',oxygen:'oxygen',carbon:task.id.endsWith('4')?'extinguisher':'carbon'})[task.gas]:stage.id==='engineering'&&task.target==='car'?'car':stage.id;
 const clips=CONCEPT_CLIPS;
 return {id,title:clips[id][0],cues:clips[id][1]};
}

// Discovery is saved before opening. A broken/blocked video can never trap a learner.
export function openConcept(stage,task,{nextLabel='활동으로 돌아가기',onNext=()=>{},signal,reward=''}={}){
 const clip=conceptFor(stage,task),asset=ext=>`/assets/concepts-v2/${clip.id}.${ext}`;
 const body=html(`<section class="concept-player"><div class="concept-frame"><video playsinline muted preload="metadata" poster="${asset('webp')}" aria-label="${escapeHTML(clip.title)}"></video><img class="concept-end" src="${asset('webp')}" alt="${escapeHTML(clip.title)}의 마지막 장면" hidden><button class="button primary concept-play">${icon('arrow')} 영상 재생</button></div><div class="concept-caption" role="status" aria-live="polite"></div><div class="concept-meta"><span>${escapeHTML(reward||`직접 발견한 과학 · ${CONCEPT_SECONDS}초`)}</span><span class="concept-dots" aria-hidden="true"><i></i><i></i><i></i></span></div><div class="concept-fallback" hidden></div></section>`);
 const footer=html('<div class="concept-actions"></div>');let closed=false,failed=false,bufferTimer=0,last=-1,visiblePlaying=false;
 let releaseFocus=()=>{};
 const video=body.querySelector('video'),play=body.querySelector('.concept-play'),end=body.querySelector('.concept-end'),caption=body.querySelector('.concept-caption'),fallback=body.querySelector('.concept-fallback');
 const dialog=openDialog(clip.title,body,{wide:true,footer,onClose:cleanup});dialog.classList.add('concept-dialog');
 const replay=button('다시 보기',()=>{if(failed){failed=false;fallback.hidden=true;load();}else{video.currentTime=0;start();}},'button secondary');
 const next=button(`${nextLabel} ${icon('arrow')}`,()=>{dialog.close();onNext();});footer.append(replay,next);
 function cue(index){if(index===last)return;last=index;caption.textContent=clip.cues[index];body.querySelectorAll('.concept-dots i').forEach((d,i)=>d.classList.toggle('on',i===index));}
 function update(){cue(Math.min(2,Math.floor(video.currentTime/CUE_SECONDS)));}
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
 function load(){autoStarted=false;last=-1;cue(0);play.hidden=false;video.src=asset(video.canPlayType('video/webm; codecs="vp9"')?'webm':'mp4');arm();releaseFocus();releaseFocus=bindConceptFocus(body,video,{steps:labels.map((term,i)=>({at:cueAt(i),term})),terms:words,caption,anchor:body.querySelector('.concept-frame')});}
 const words=CONCEPT_WORDS[clip.id];
 const labels=CONCEPT_LABELS[clip.id];
 load();
 video.addEventListener('pause',()=>quietAudio(false));
 return dialog;
}
