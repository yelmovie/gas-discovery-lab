import { createThemeEffects } from './theme-effects.js';
let ctx,master,sfxGain,active=[],config={music:true,sfx:true,musicVolume:35},quiet=false,narrating=false,started=false;
const effects = createThemeEffects('gas', () => ({ enabled: config.sfx, muted: quiet, volume: .75 }));
// Suno tracks (originals in references/suno). The main theme loops; the finale plays once and then rests.
const musicFiles={main:'/assets/audio/bgm/main-theme.mp3',finale:'/assets/audio/bgm/final-theme.mp3'};
const players={};let screenTrack='main',overlay=false,finaleDone=false;
function init(){if(ctx)return;try{ctx=new AudioContext();master=ctx.createGain();master.gain.value=.55;master.connect(ctx.destination);sfxGain=ctx.createGain();sfxGain.gain.value=.22;sfxGain.connect(master);}catch{/* Audio is optional; interactions remain available. */}}
function stopNotes(list){for(const n of list){try{n.stop();n.disconnect();}catch{}}list.length=0;}
function player(track){let a=players[track];if(!a){a=players[track]=new Audio(musicFiles[track]);a.dataset.track=track;a.loop=track==='main';a.preload='auto';a.onended=()=>{if(track==='finale')finaleDone=true;};}return a;}
function syncMusic(){
 const track=overlay?'finale':screenTrack;
 for(const [name,a] of Object.entries(players))if(name!==track)a.pause();
 if(!started||!config.music||config.musicVolume<=0||document.hidden||track==='finale'&&finaleDone){players[track]?.pause();return;}
 const a=player(track);
 // Ducked under character voices and concept clips instead of stopping.
 a.volume=Math.min(1,config.musicVolume/100*.8)*(quiet||narrating?.25:1);
 if(a.paused)a.play().catch(()=>{});
}
function setTrack(nextScreen,nextOverlay){const before=overlay?'finale':screenTrack,after=nextOverlay?'finale':nextScreen;screenTrack=nextScreen;overlay=nextOverlay;if(after!==before&&after==='finale'){finaleDone=false;if(players.finale)players.finale.currentTime=0;}syncMusic();}
export function setScreenMusic(track){setTrack(track==='finale'?'finale':'main',overlay);}
export function setFinaleOverlay(value){setTrack(screenTrack,Boolean(value));}
export function syncAudio(settings){config={...settings};effects.sync();syncMusic();if(ctx&&!config.sfx)stopNotes(active);}
export function unlockAudio(settings){started=true;init();effects.unlock();ctx?.resume().catch(()=>{});syncAudio(settings);}
export function sound(kind='tap'){ if(ctx) effects.play(kind); }
export function quietAudio(value){quiet=value;syncAudio(config);}
document.addEventListener('visibilitychange',()=>{if(document.hidden){stopNotes(active);ctx?.suspend().catch(()=>{});syncMusic();}else{ctx?.resume().catch(()=>{});syncAudio(config);}});

export function duckNarration(value){narrating=value;syncAudio(config);}
