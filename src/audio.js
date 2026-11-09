import { createThemeEffects } from './theme-effects.js';
let ctx,master,musicGain,sfxGain,clock=0,active=[],notes=[],config={music:true,sfx:true,musicVolume:35},quiet=false,effectSerial=0;
const effects = createThemeEffects('gas', () => ({ enabled: config.sfx, muted: quiet, volume: .75 }));
function init(){if(ctx)return;try{ctx=new AudioContext();master=ctx.createGain();master.gain.value=.55;master.connect(ctx.destination);musicGain=ctx.createGain();musicGain.connect(master);sfxGain=ctx.createGain();sfxGain.gain.value=.22;sfxGain.connect(master);}catch{/* Audio is optional; interactions remain available. */}}
function stopNotes(list){for(const n of list){try{n.stop();n.disconnect();}catch{}}list.length=0;}
export function syncAudio(settings){config={...settings};effects.sync();if(!ctx)return;musicGain.gain.setTargetAtTime(config.music&&!quiet?config.musicVolume/100*.15:0,ctx.currentTime,.1);if(!config.sfx)stopNotes(active);if(config.music&&!quiet&&!clock&&!document.hidden)startMusic();if(!config.music||quiet||document.hidden){clearInterval(clock);clock=0;stopNotes(notes);}}
export function unlockAudio(settings){init();effects.unlock();ctx?.resume().catch(()=>{});syncAudio(settings);}
let sequence=0;
function startMusic(){const melody=[523.25,659.25,783.99,659.25,587.33,698.46,880,698.46,493.88,587.33,783.99,587.33,440,523.25,659.25,523.25];const tick=()=>{if(!ctx||document.hidden)return;notes=notes.filter(n=>!n.ended);const osc=ctx.createOscillator(),gain=ctx.createGain();osc.type='sine';osc.frequency.value=melody[sequence++%melody.length]/2;osc.connect(gain);gain.connect(musicGain);const t=ctx.currentTime;gain.gain.setValueAtTime(0,t);gain.gain.linearRampToValueAtTime(.6,t+.04);gain.gain.exponentialRampToValueAtTime(.001,t+.7);osc.start();osc.stop(t+.75);osc.onended=()=>{osc.ended=true;osc.disconnect();gain.disconnect();};notes.push(osc);};tick();clock=setInterval(tick,560);}
export function sound(kind='tap'){ if(ctx) effects.play(kind); }
export function quietAudio(value){quiet=value;syncAudio(config);}
document.addEventListener('visibilitychange',()=>{if(document.hidden){clearInterval(clock);clock=0;stopNotes(notes);stopNotes(active);ctx?.suspend().catch(()=>{});}else{ctx?.resume().catch(()=>{});syncAudio(config);}});
