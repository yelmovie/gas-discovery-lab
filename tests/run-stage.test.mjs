import test from 'node:test';
import assert from 'node:assert/strict';
import {STAGES} from '../src/data.js';
import {volumeFor,validVolumePair} from '../src/model.js';
import {COURSE,PREDICTIONS,supportsRun,restoreRun,recordStation,readyToCompare,runDraft,bagRatio,observedChange,createRunner,advanceRunner,groundAt,stationAt,heightFraction,touchPatrol,patrolX,obstacleAhead} from '../src/run-stage/mountain-rules.js';

const climate=STAGES.find(s=>s.id==='climate'),task=climate.tasks.find(t=>t.id==='climate-4');
const walk=(runner,input,seconds)=>{const seen={};for(let t=0;t<seconds;t+=1/60)Object.assign(seen,advanceRunner(runner,input,1/60));return seen;};

test('only the mountain snack-bag request opens the run stage',()=>{
 assert.deepEqual(STAGES.flatMap(s=>s.tasks).filter(supportsRun).map(t=>t.id),['climate-4']);
 assert.equal(supportsRun({...task,target:2}),false,'high pressure is not a height you can walk to');
});

test('station records match the classic slider records and its completion rule',()=>{
 const state=restoreRun(task,undefined);
 assert.deepEqual(state.records,[{condition:1,ratio:volumeFor('pressure',1)}],'the starting condition is recorded on entry, as on the classic screen');
 assert.equal(readyToCompare(state,task),false);
 assert.equal(recordStation(state,task,'base'),false,'the base record already exists');
 assert.equal(recordStation(state,task,'summit'),true);
 assert.equal(recordStation(state,task,'summit'),false,'one record per condition');
 assert.deepEqual(state.records,[{condition:1,ratio:1},{condition:0,ratio:1.35}]);
 assert.equal(validVolumePair(state.records,task),true);
 assert.equal(state.records.some(r=>r.condition===2),false,'the run never creates a high-pressure record');
});

test('the draft keeps the classic fields and only adds the prediction',()=>{
 const state=restoreRun(task,{prediction:'same'});
 assert.deepEqual(runDraft(state,task),{condition:1,records:[{condition:1,ratio:1}],prediction:'same'});
 recordStation(state,task,'summit');
 assert.deepEqual(runDraft(state,task),{condition:0,records:[{condition:1,ratio:1},{condition:0,ratio:1.35}],prediction:'same'});
 assert.deepEqual(Object.keys(runDraft(restoreRun(task,{}),task)),['condition','records']);
});

test('a classic draft resumes in the run, including an optional high-pressure record',()=>{
 const state=restoreRun(task,{condition:2,records:[{condition:1,ratio:1},{condition:2,ratio:.66},{condition:9},null],prediction:'nonsense'});
 assert.deepEqual(state.records.map(r=>r.condition),[1,2]);
 assert.equal(state.prediction,null);
 assert.equal(readyToCompare(state,task),false);
 assert.equal(readyToCompare(restoreRun(task,{condition:0,records:[{condition:0,ratio:1.35}]}),task),true,'the missing starting record is restored');
});

test('the carried bag only shows values between the two model volumes',()=>{
 assert.equal(bagRatio(task,0),volumeFor('pressure',1));
 assert.equal(bagRatio(task,1),volumeFor('pressure',0));
 assert.ok(bagRatio(task,.5)>1&&bagRatio(task,.5)<1.35);
 assert.equal(bagRatio(task,7),1.35);assert.equal(bagRatio(task,-3),1);
 assert.equal(observedChange(task),'bigger');
 assert.ok(PREDICTIONS.some(p=>p.value===observedChange(task)));
});

test('the course is one path from the base station to the summit station',()=>{
 const runner=createRunner();
 assert.equal(stationAt(runner),'base');assert.equal(heightFraction(runner),0);
 // 낮은 돌계단은 걸어서 오르고, 쉼터 턱은 점프해야 넘는다.
 walk(runner,{x:0,f:1},3);
 assert.ok(runner.f<11.01&&Math.abs(runner.y-1.8)<.01,`blocked at the ledge: f=${runner.f}, y=${runner.y}`);
 assert.equal(advanceRunner(runner,{x:0,f:1,jump:true},1/60).jumped,true);
 walk(runner,{x:0,f:1},1);
 assert.equal(runner.y,2.4);assert.equal(runner.checkpoint,1);
 walk(runner,{x:0,f:1},2.2);
 assert.ok(runner.f>25.5&&runner.checkpoint===2,'the log bridge is walkable in a straight line');
 // 징검 바위는 앞이 막힐 때마다 점프해 오른다.
 const tops=new Set();
 for(let guard=0;guard<600&&!(runner.ground&&runner.y===COURSE.summit);guard++){
  const blocked=runner.ground&&groundAt(runner.x,runner.f+.5)-runner.y>COURSE.stepUp;
  advanceRunner(runner,{x:0,f:1,jump:blocked},1/60);if(runner.ground)tops.add(runner.y);
 }
 assert.equal(runner.y,COURSE.summit,'reached the summit by jumping');
 assert.ok(tops.has(3.1)||tops.has(3.9),'the rocks are the way up');
 assert.ok(groundAt(0,34.3)-2.4>1.5,'the summit wall is too high to jump from the meadow');
 walk(runner,{x:0,f:1},.6);
 assert.equal(stationAt(runner),'summit');assert.equal(heightFraction(runner),1);assert.equal(runner.checkpoint,3);
 walk(runner,{x:0,f:1},3);assert.ok(runner.f<=COURSE.end,'the summit has an end wall');
});

test('falling returns to the last checkpoint without losing progress',()=>{
 const runner=createRunner(COURSE,1);
 walk(runner,{x:0,f:1},.9);assert.ok(runner.f>17&&runner.f<24);
 let seen={};for(let guard=0;guard<200&&!seen.respawned;guard++)seen=advanceRunner(runner,{x:1,f:0},1/60);
 assert.equal(seen.respawned,true);assert.equal(runner.falls,1);
 assert.deepEqual([runner.x,runner.f,runner.y,runner.ground],[0,13.5,2.4,true]);
 assert.equal(groundAt(2,20),-Infinity,'the ravine has no floor beside the log');
});

test('a slow frame cannot push the runner through the floor',()=>{
 const runner=createRunner();
 advanceRunner(runner,{x:0,f:0,jump:true},1/60);
 for(let i=0;i<40;i++)advanceRunner(runner,{x:0,f:0},5);
 assert.equal(runner.y,0);assert.equal(runner.ground,true);
});

test('the patroller only makes the runner flinch',()=>{
 const runner=createRunner(COURSE,2);runner.f=COURSE.patrol.f;runner.x=patrolX(0);
 const before={checkpoint:runner.checkpoint,falls:runner.falls};
 assert.equal(touchPatrol(runner,0),true);assert.ok(runner.stun>0);
 assert.equal(touchPatrol(runner,0),false,'no repeated hit while flinching');
 const f=runner.f;advanceRunner(runner,{x:0,f:1},.05);assert.equal(runner.f,f,'movement pauses during the flinch');
 assert.deepEqual({checkpoint:runner.checkpoint,falls:runner.falls},before);
});

test('a blocked runner is told whether to jump or to take the rocks',()=>{
 const runner=createRunner();
 assert.equal(obstacleAhead(runner),null,'open ground needs no hint');
 walk(runner,{x:0,f:1},3);
 assert.equal(obstacleAhead(runner),'jump','the rest ledge is one jump');
 const meadow=createRunner(COURSE,2);meadow.x=2.4;walk(meadow,{x:0,f:1},3);
 assert.ok(meadow.f>34&&meadow.y===2.4);assert.equal(obstacleAhead(meadow),'wall','the summit wall is too high beside the rocks');
 const atRock=createRunner(COURSE,2);walk(atRock,{x:0,f:1},1.5);
 assert.equal(obstacleAhead(atRock),'jump','the first rock is one jump');
 atRock.ground=false;assert.equal(obstacleAhead(atRock),null,'no hint in the air');
});
