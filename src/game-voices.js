import { createNarration, mountNarrationControl } from './narration.js';
import { voiceLines } from './voice-lines.js';
import { store } from './state.js';
import { duckNarration } from './audio.js';
export const narration = createNarration({ isMuted: () => !store.save.settings.sfx, duck: duckNarration });
const controls = new WeakMap();
export function attachVoice(host, id, signal, autoplay = true) {
  if (!host) return;
  controls.get(host)?.();
  const cleanup = mountNarrationControl(host, id, narration, { autoplay });
  controls.set(host, cleanup);
  signal?.addEventListener('abort', cleanup, { once: true });
  return cleanup;
}
export function voiceForText(host, text, signal) {
  controls.get(host)?.();
  controls.delete(host);
  narration.stop();
  const line = voiceLines.find(line => line.text === text);
  if (line) attachVoice(host, line.id, signal);
}
// Modal video/settings interrupt the current dialogue without restarting it on close.
document.addEventListener('gas-dialog-open', () => narration.stop());
document.addEventListener('play', event => { if (event.target instanceof HTMLMediaElement) narration.stop(); }, true);
