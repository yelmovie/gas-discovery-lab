import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
const root=new URL('../',import.meta.url);
const files=['attack-swing','hit-light','hit-heavy','villain-exit','villain-appear','hurt-bump'];

test('map encounter cue files ship and are credited', async () => {
 const credits=await fs.readFile(new URL('assets/CREDITS.md',root),'utf8');
 for(const name of files){
  assert.ok((await fs.stat(new URL(`public/assets/audio/sfx/${name}.mp3`,root))).size>1000,name);
  assert.match(credits,new RegExp(`audio/sfx/${name}\\.mp3.*CC0`),name);
 }
});

test('map cues follow the SFX switch, quiet mode and hidden tab, and layer with a delay', async () => {
 const doc=new EventTarget();doc.hidden=false;globalThis.document=doc;
 const started=[];
 const param=()=>({value:1,setValueAtTime(){},linearRampToValueAtTime(){},exponentialRampToValueAtTime(){},setTargetAtTime(){}});
 globalThis.AudioContext=class{constructor(){this.state='running';this.currentTime=10;this.destination={};}createGain(){return {gain:param(),connect(){},disconnect(){}};}
  createOscillator(){return {frequency:param(),connect(){},disconnect(){},start(){started.push('tone');},stop(){}};}
  createBufferSource(){const s={playbackRate:param(),connect(){},disconnect(){},start:when=>started.push({file:s.buffer.file,when,rate:s.playbackRate.value}),stop(){}};return s;}
  decodeAudioData(b){return Promise.resolve({file:b.file});}resume(){return Promise.resolve();}suspend(){return Promise.resolve();}};
 globalThis.fetch=async url=>({ok:true,arrayBuffer:async()=>({file:String(url).split('/').pop()})});
 globalThis.Audio=class{constructor(){this.dataset={};this.paused=true;}play(){return Promise.resolve();}pause(){}};
 const audio=await import(`../src/audio.js?cue-test`);
 const settings={music:false,sfx:true,musicVolume:35};
 await audio.cue('attack');assert.equal(started.length,0,'nothing before the first tap');
 audio.unlockAudio(settings);
 await audio.cue('attack');await audio.cue('hit',{delay:.09,rate:.9});
 assert.deepEqual(started,[{file:'attack-swing.mp3',when:10,rate:1},{file:'hit-light.mp3',when:10.09,rate:.9}]);
 started.length=0;
 audio.syncAudio({...settings,sfx:false});await audio.cue('finish');assert.equal(started.length,0,'SFX off');
 audio.syncAudio(settings);audio.quietAudio(true);await audio.cue('contact');assert.equal(started.length,0,'quiet while a clip plays');
 audio.quietAudio(false);doc.hidden=true;await audio.cue('appear');assert.equal(started.length,0,'hidden tab');
 doc.hidden=false;await audio.cue('exit');assert.deepEqual(started.map(s=>s.file),['villain-exit.mp3']);
 for(const key of ['AudioContext','fetch','Audio','document'])delete globalThis[key];
});
