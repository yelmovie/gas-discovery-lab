import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
const root=new URL('../',import.meta.url);

test('footstep, stage-open and pickup files ship and are credited', async () => {
 for(const credits of [await fs.readFile(new URL('assets/CREDITS.md',root),'utf8'),await fs.readFile(new URL('public/assets/CREDITS.md',root),'utf8')]){
  for(const name of ['step-1','step-2','stage-open','stage-twinkle','pickup']){
   assert.ok((await fs.stat(new URL(`public/assets/audio/sfx/${name}.mp3`,root))).size>1000,name);
   assert.match(credits,new RegExp(`audio/sfx/${name}\\.mp3.*CC0`),name);
  }
 }
});

test('footsteps keep their own lane, the stage opening layers a sparkle, and the main theme follows a finished finale', async () => {
 const doc=new EventTarget();doc.hidden=false;globalThis.document=doc;
 const started=[],stopped=[];
 const param=v=>({value:v,setValueAtTime(){},linearRampToValueAtTime(){},exponentialRampToValueAtTime(){},setTargetAtTime(){}});
 globalThis.AudioContext=class{constructor(){this.state='running';this.currentTime=10;this.destination={};}
  createGain(){const g={gain:param(1),connect(){},disconnect(){}};return g;}
  createOscillator(){return {frequency:param(1),connect(){},disconnect(){},start(){},stop(){}};}
  createBufferSource(){const s={playbackRate:param(1),connect(target){s.gain=target.gain;},disconnect(){},start:when=>started.push({file:s.buffer.file,when,rate:s.playbackRate.value,gain:s.gain.value}),stop(){stopped.push(s.buffer.file);}};return s;}
  decodeAudioData(b){return Promise.resolve({file:b.file,duration:.4});}resume(){return Promise.resolve();}suspend(){return Promise.resolve();}};
 globalThis.fetch=async url=>({ok:true,arrayBuffer:async()=>({file:String(url).split('/').pop()})});
 const players=[];
 globalThis.Audio=class{constructor(src){this.src=src;this.dataset={};this.paused=true;this.currentTime=0;this.volume=1;players.push(this);}play(){this.paused=false;return Promise.resolve();}pause(){this.paused=true;}};
 const audio=await import(`../src/audio.js?lanes-test`);
 const settings={music:true,sfx:true,musicVolume:35};
 audio.unlockAudio(settings);
 await audio.footstep();await audio.footstep();
 assert.deepEqual(started.map(s=>s.file),['step-1.mp3','step-2.mp3'],'the two steps alternate');
 for(const s of started){assert.ok(s.rate>=.95&&s.rate<=1.05,'rate within 5%');assert.equal(s.gain,.16);}
 audio.duckNarration(true);started.length=0;await audio.footstep();assert.equal(started[0].gain,.08,'half under a voice');audio.duckNarration(false);
 // The full-set jingle is the all-villains fanfare: footsteps and the finale overlay leave it ringing,
 // and the finale theme rises from silence underneath it.
 started.length=0;await audio.cue('card-complete');await audio.footstep();audio.sound('tap');audio.setFinaleOverlay(true);
 assert.deepEqual(stopped,[],'nothing stops the jingle');
 const rising=players.find(p=>p.dataset.track==='finale');
 assert.equal(rising.paused,false);assert.ok(rising.volume<.05,`finale starts near silence (${rising.volume})`);
 audio.setFinaleOverlay(false);
 started.length=0;audio.stageOpened();await new Promise(r=>setTimeout(r,0));
 assert.deepEqual(started.map(s=>[s.file,s.when]),[['stage-open.mp3',10],['stage-twinkle.mp3',10.12]]);
 audio.syncAudio({...settings,sfx:false});started.length=0;await audio.footstep();assert.equal(started.length,0,'SFX off');
 audio.syncAudio(settings);doc.hidden=true;await audio.footstep();assert.equal(started.length,0,'hidden tab');doc.hidden=false;
 // Finale screen: the finale theme plays once, then the main theme carries on at x0.45; leaving restores the main level.
 audio.setScreenMusic('finale');
 const finale=players.find(p=>p.dataset.track==='finale'),main=players.find(p=>p.dataset.track==='main');
 assert.equal(finale.paused,false);assert.equal(main.paused,true);
 finale.paused=true;finale.onended();
 assert.equal(main.paused,false,'main theme follows the finished finale');
 assert.ok(Math.abs(main.volume-.28*.45)<1e-9,`x0.45 (${main.volume})`);
 audio.setScreenMusic('main');assert.ok(Math.abs(main.volume-.28)<1e-9,'normal level after leaving');
 audio.setScreenMusic('finale');assert.equal(finale.paused,false,'a new visit starts the finale again');assert.equal(finale.currentTime,0);
 for(const key of ['AudioContext','fetch','Audio','document'])delete globalThis[key];
});
