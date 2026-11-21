import { createThemeEffects } from './theme-effects.js';
let filmOn=false,ctx,active=[],config={music:true,sfx:true,musicVolume:35,sfxVolume:100},quiet=false,narrating=false,started=false;
// SFX level (settings, 0-100 %, default 100 = the level before the slider existed) multiplies every effect lane: UI tones, cues, card sounds, footsteps.
const sfxLevel=()=>{const v=Number(config.sfxVolume);return Number.isFinite(v)?Math.min(100,Math.max(0,v))/100:1;};
const effects = createThemeEffects('gas', () => ({ enabled: config.sfx, muted: quiet, volume: .75*sfxLevel() }));
// Suno tracks (originals in references/suno). The main theme loops; the finale plays once and then rests.
const musicFiles={main:'/assets/audio/bgm/main-theme.mp3',finale:'/assets/audio/bgm/final-theme.mp3'};
const players={};let screenTrack='main',overlay=false,finaleDone=false,jingleEnd=0,fadeFrom=0,fadeTimer=0;
function init(){if(ctx)return;try{ctx=new AudioContext();}catch{/* Audio is optional; interactions remain available. */}}
function stopNotes(list){for(const n of list){try{n.stop();n.disconnect();}catch{}}list.length=0;}
function player(track){let a=players[track];if(!a){a=players[track]=new Audio(musicFiles[track]);a.dataset.track=track;a.loop=track==='main';a.preload='auto';a.onended=()=>{if(track==='finale'){finaleDone=true;syncMusic();}};}return a;}
function syncMusic(){
 let track=overlay?'finale':screenTrack,level=1;
 // Once the finale theme has played through, the main theme carries on at x0.45 under the finale window, ending or certificate.
 if(track==='finale'&&finaleDone){track='main';level=.45;}
 for(const [name,a] of Object.entries(players))if(name!==track)a.pause();
 if(!started||filmOn||!config.music||config.musicVolume<=0||document.hidden){players[track]?.pause();return;}
 const a=player(track);
 // Ducked under character voices and concept clips instead of stopping.
 // While the full-set card jingle still rings, the finale theme rises from 0 over 1.2 s instead of cutting it.
 const fade=fadeFrom?Math.min(1,(performance.now()-fadeFrom)/1200):1;
 a.volume=Math.min(1,config.musicVolume/100*.8)*level*fade*(quiet||narrating?.25:1);
 if(a.paused)a.play().catch(()=>{});
}
function setTrack(nextScreen,nextOverlay){const before=overlay?'finale':screenTrack,after=nextOverlay?'finale':nextScreen;screenTrack=nextScreen;overlay=nextOverlay;if(after!==before&&after==='finale'){finaleDone=false;if(players.finale)players.finale.currentTime=0;}syncMusic();}
// 소리 있는 이야기 영상이 도는 동안(영상 속 배경음이 대신한다) 앱 배경음을 멈춘다.
export function filmAudio(value){filmOn=value;syncMusic();}
export function setScreenMusic(track){setTrack(track==='finale'?'finale':'main',overlay);}
export function setFinaleOverlay(value){
 clearInterval(fadeTimer);fadeFrom=0;
 if(value&&ctx&&ctx.currentTime<jingleEnd){fadeFrom=performance.now();fadeTimer=setInterval(()=>{if(performance.now()-fadeFrom>=1200){clearInterval(fadeTimer);fadeFrom=0;}syncMusic();},60);}
 setTrack(screenTrack,Boolean(value));
}
export function syncAudio(settings){config={...settings};effects.sync();syncMusic();if(ctx&&(!config.sfx||quiet))stopNotes(active);}
export function unlockAudio(settings){started=true;init();effects.unlock();ctx?.resume().catch(()=>{});syncAudio(settings);preloadFootsteps();}
export function sound(kind='tap'){ if(ctx) effects.play(kind); }
// Map encounter cues: CC0 samples (assets/CREDITS.md) on the same SFX switch, mute and hidden-tab rules.
// They may layer (swing, then hit); a file that fails falls back to the themed tone.
// No victory jingle: the finale theme starts 2.9 s after the last hit and every library jingle is longer than the gap.
const cueFiles={attack:'attack-swing.mp3',hit:'hit-light.mp3',finish:'hit-heavy.mp3',exit:'villain-exit.mp3',appear:'villain-appear.mp3',contact:'hurt-bump.mp3'};
// Files sit near -18 to -25 LUFS; these levels keep hits just above the theme music and the appear pop quiet.
const cueLevel={attack:.45,hit:.6,finish:.75,exit:.4,appear:.3,contact:.5};
const cueFallback={attack:'tap',hit:'tap',finish:'success',contact:'retry'};
// Achievement card cues (map-reward-cards.js, same CC0 library): fly in and out, reveal (the two rarest cards use the longer jingle),
// land in the slot, full set. The full-set jingle is the all-villains fanfare: the finale theme fades in under it (setFinaleOverlay).
Object.assign(cueFiles,{'card-whoosh':'card-whoosh.mp3','card-reveal':'card-reveal.mp3','card-epic':'card-epic.mp3','card-slot':'card-slot.mp3','card-complete':'card-complete.mp3'});
Object.assign(cueLevel,{'card-whoosh':.4,'card-reveal':.55,'card-epic':.55,'card-slot':.5,'card-complete':.55});
// Stage opening (soft open, then a sparkle 0.12 s later) and the mountain-trail record pickup, same library.
Object.assign(cueFiles,{'stage-open':'stage-open.mp3','stage-twinkle':'stage-twinkle.mp3',pickup:'pickup.mp3'});
Object.assign(cueLevel,{'stage-open':.5,'stage-twinkle':.45,pickup:.45});
const buffers=new Map();
const cueAllowed=()=>Boolean(ctx)&&config.sfx!==false&&!quiet&&!document.hidden;
function cueBuffer(kind){if(!buffers.has(kind))buffers.set(kind,fetch(`/assets/audio/sfx/${cueFiles[kind]}`).then(r=>{if(!r.ok)throw Error(kind);return r.arrayBuffer();}).then(b=>ctx.decodeAudioData(b)).catch(()=>{buffers.delete(kind);return null;}));return buffers.get(kind);}
export function preloadCues(){if(ctx)for(const kind of Object.keys(cueFiles))cueBuffer(kind);}
export async function cue(kind,{delay=0,rate=1}={}){
 if(!cueFiles[kind]){sound(kind);return;}
 if(!cueAllowed())return;
 const at=ctx.currentTime+delay,buffer=await cueBuffer(kind);
 if(!cueAllowed()||ctx.state!=='running')return;
 if(!buffer){if(cueFallback[kind])effects.play(cueFallback[kind]);return;}
 const source=ctx.createBufferSource(),gain=ctx.createGain();
 source.buffer=buffer;source.playbackRate.value=rate;gain.gain.value=cueLevel[kind]*sfxLevel();
 source.connect(gain);gain.connect(ctx.destination);
 source.onended=()=>{source.disconnect();gain.disconnect();active=active.filter(x=>x!==source);};
 active.push(source);source.start(Math.max(ctx.currentTime,at));
 if(kind==='card-complete')jingleEnd=Math.max(ctx.currentTime,at)+buffer.duration/rate;
}
export function stageOpened(){cue('stage-open');cue('stage-twinkle',{delay:.12});}
// Footsteps (map walk, mountain trail): their own lane. They stop nothing and nothing stops them; the two steps
// alternate with a slight rate change, and drop to half under a character voice.
const stepFiles=['step-1.mp3','step-2.mp3'],steps=new Map();let stepTurn=0;
function stepBuffer(file){if(!steps.has(file))steps.set(file,fetch(`/assets/audio/sfx/${file}`).then(r=>{if(!r.ok)throw Error(file);return r.arrayBuffer();}).then(b=>ctx.decodeAudioData(b)).catch(()=>{steps.delete(file);return null;}));return steps.get(file);}
// Warm both steps where walking starts, so the first step lands on time.
export function preloadFootsteps(){if(ctx)for(const file of stepFiles)stepBuffer(file);}
export async function footstep({rate=1}={}){
 if(!cueAllowed()||ctx.state!=='running')return;
 const buffer=await stepBuffer(stepFiles[stepTurn++%2]);
 if(!buffer||!cueAllowed()||ctx.state!=='running')return;
 const source=ctx.createBufferSource(),gain=ctx.createGain();
 source.buffer=buffer;source.playbackRate.value=rate*(.95+Math.random()*.1);gain.gain.value=.16*(narrating?.5:1)*sfxLevel();
 source.connect(gain);gain.connect(ctx.destination);
 source.onended=()=>{source.disconnect();gain.disconnect();};
 source.start();
}
export function quietAudio(value){quiet=value;syncAudio(config);}
document.addEventListener('visibilitychange',()=>{if(document.hidden){stopNotes(active);ctx?.suspend().catch(()=>{});syncMusic();}else{ctx?.resume().catch(()=>{});syncAudio(config);}});

export function duckNarration(value){narrating=value;syncAudio(config);}
