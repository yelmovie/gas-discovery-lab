// 인트로·파이널 한 편 영상(2026-11-21 마무리): 전체 화면(contain)으로 틀고, 자막은 영상 안에 구워져 있다.
// 목소리가 꺼져 있으면 영상을 음소거로 틀고 앱 배경음은 평소대로 둔다. 목소리가 켜져 있으면 영상 속 배경음을 쓰니 앱 배경음을 잠시 멈춘다.
// 끝나거나 건너뛰면 onEnd, 영상을 못 열면 onFail(예전 카드 화면으로).
import { filmAudio } from './audio.js';

export function playStoryFilm(host, { name, label, transcript, voiceOff, signal, onEnd, onFail }) {
  host.classList.add('film-mode');
  host.innerHTML = `<section class="story-film" aria-label="${label}"><video class="story-film-video" src="/assets/films-story/${name}-film.mp4" poster="/assets/films-story/${name}-film.jpg" playsinline preload="auto"></video><p class="sr-only">${transcript}</p><button type="button" class="button film-skip">건너뛰기</button></section>`;
  const video = host.querySelector('video');
  let done = false;
  const stop = () => { done = true; filmAudio(false); video.pause(); };
  const finish = failed => { if (done) return; stop(); (failed ? onFail : onEnd)(); };
  video.muted = voiceOff;
  if (!voiceOff) filmAudio(true);
  video.addEventListener('ended', () => finish(false));
  video.addEventListener('error', () => finish(true));
  host.querySelector('.film-skip').addEventListener('click', () => finish(false));
  signal?.addEventListener('abort', () => { if (!done) stop(); }, { once: true });
  // 자동 재생이 막히면 소리 없이 다시 시도하고(자막이 있다), 그래도 안 되면 카드 화면으로.
  video.play().catch(() => { if (done) return; video.muted = true; filmAudio(false); video.play().catch(() => finish(true)); });
  return video;
}
