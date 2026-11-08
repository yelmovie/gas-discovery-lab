import test from 'node:test';
import assert from 'node:assert/strict';
import {createPlayback} from '../src/experiment-player.js';

function setup(steps){
  let now=0,id=0;
  const timers=new Map(),events=[];
  const schedule=(fn,delay)=>{timers.set(++id,{fn,at:now+delay});return id;};
  const cancel=id=>timers.delete(id);
  const advance=ms=>{const end=now+ms;while(true){const next=[...timers].sort((a,b)=>a[1].at-b[1].at)[0];if(!next||next[1].at>end)break;timers.delete(next[0]);now=next[1].at;next[1].fn();}now=end;};
  const controller=new AbortController();
  const player=createPlayback({signal:controller.signal,schedule,cancel,now:()=>now,onChange:x=>events.push(x)});
  player.configure({steps:()=>steps});
  return {player,advance,controller,events,timers};
}

test('playback runs experiment actions in order and stops at the end',()=>{
  const actions=[],x=setup([{run:()=>actions.push('observe'),wait:1000},{run:()=>actions.push('compare'),wait:1000}]);
  x.player.play();assert.deepEqual(actions,['observe']);x.advance(999);assert.deepEqual(actions,['observe']);x.advance(1);assert.deepEqual(actions,['observe','compare']);x.advance(1000);assert.equal(x.player.state,'finished');assert.equal(x.timers.size,0);
});
test('pause preserves the remaining observation time and resume never repeats an action',()=>{
  const actions=[],x=setup([{run:()=>actions.push(1),wait:1000},{run:()=>actions.push(2),wait:1000}]);
  x.player.play();x.advance(400);x.player.pause();x.advance(5000);assert.deepEqual(actions,[1]);x.player.play();x.advance(599);assert.deepEqual(actions,[1]);x.advance(1);assert.deepEqual(actions,[1,2]);
});
test('pause holds the current experiment image without calling the reset callback',()=>{
  let stops=0;const x=setup([]);x.player.configure({steps:()=>[{run:()=>{},wait:1000}],onStop:()=>stops++});x.player.play();x.advance(200);x.player.pause();assert.equal(stops,0);x.player.play();x.advance(800);assert.equal(stops,1);
});
test('speed changes reschedule the remaining wait instead of skipping the current observation',()=>{
  const actions=[],x=setup([{run:()=>actions.push(1),wait:1000},{run:()=>actions.push(2),wait:1000}]);
  x.player.play();x.advance(400);x.player.setSpeed(2);x.advance(299);assert.deepEqual(actions,[1]);x.advance(1);assert.deepEqual(actions,[1,2]);
});
test('aborting a screen prevents all later experiment actions',()=>{
  const actions=[],x=setup([{run:()=>actions.push(1),wait:1000},{run:()=>actions.push(2),wait:1000}]);
  x.player.play();x.controller.abort();x.advance(9000);x.player.play();assert.deepEqual(actions,[1]);assert.equal(x.timers.size,0);
});
test('a manual intervention discards stale future steps and rebuilds from current experiment state',()=>{
  const actions=[],x=setup([{run:()=>actions.push('old'),wait:1000},{run:()=>actions.push('stale'),wait:1000}]);
  x.player.play();x.player.interrupt();x.player.configure({steps:()=>[{run:()=>actions.push('current'),wait:1000}]});x.player.play();x.advance(3000);assert.deepEqual(actions,['old','current']);
});
test('completion during an action cancels the rest of the queue',()=>{
  const actions=[],x=setup([]);x.player.configure({steps:()=>[{run:()=>{actions.push(1);x.player.complete();},wait:1000},{run:()=>actions.push(2),wait:1000}]});
  x.player.play();x.advance(4000);assert.deepEqual(actions,[1]);assert.equal(x.player.state,'complete');assert.equal(x.timers.size,0);
});
test('an observation can explicitly wait for the learner without executing another step',()=>{
  const actions=[],x=setup([{run:()=>false,wait:1000},{run:()=>actions.push('answer'),wait:1000}]);
  x.player.play();x.advance(4000);assert.deepEqual(actions,[]);assert.equal(x.player.state,'waiting');assert.equal(x.timers.size,0);
});
test('unexpected action errors stop replay instead of continuing to a later step',()=>{
  const actions=[],x=setup([{run:()=>{throw Error('unavailable');},wait:1000},{run:()=>actions.push(2),wait:1000}]);
  x.player.play();x.advance(4000);assert.deepEqual(actions,[]);assert.equal(x.player.state,'error');assert.equal(x.timers.size,0);
});
