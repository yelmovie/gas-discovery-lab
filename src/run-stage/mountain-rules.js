// 산길 달리기의 규칙. 화면(three.js)과 떨어진 순수 함수만 둔다.
// 기록되는 부피는 기존 모형 volumeFor의 값뿐이고, 걷는 계산은 결과를 정하지 않는다.
import {volumeFor,validVolumePair} from '../model.js';

/** 산 아래(보통 압력)에서 산꼭대기(낮은 압력)로 가는 의뢰에만 쓴다. 높은 압력은 걸어서 갈 수 있는 높이가 아니다. */
export function supportsRun(task){return task?.runStage===true&&task.mode==='pressure'&&(task.baseline??1)===1&&task.target===0;}

export const PREDICTIONS=[
 {value:'bigger',label:'더 부풀어요'},
 {value:'same',label:'그대로예요'},
 {value:'smaller',label:'줄어들어요'}
];
/** 예상과 비교할 결과도 기존 모형에서 읽는다. */
export function observedChange(task){const before=volumeFor(task.mode,task.baseline??1),after=volumeFor(task.mode,task.target);return after>before?'bigger':after<before?'smaller':'same';}

/** 기존 2D 화면(mountClimate)과 같은 방식으로 초안을 되살린다. */
export function restoreRun(task,draft){
 const baseline=task.baseline??1,source=draft&&typeof draft==='object'?draft:{};
 const records=Array.isArray(source.records)?source.records.filter(r=>r&&[0,1,2].includes(r.condition)).map(r=>({condition:r.condition,ratio:volumeFor(task.mode,r.condition)})):[];
 if(!records.some(r=>r.condition===baseline))records.unshift({condition:baseline,ratio:volumeFor(task.mode,baseline)});
 const prediction=PREDICTIONS.some(p=>p.value===source.prediction)?source.prediction:null;
 return {records,prediction};
}
/** 관측 지점의 '기록'. 기존 화면에서 슬라이더를 놓았을 때와 같은 모양의 기록을 남긴다. */
export function recordStation(state,task,station){
 const condition=stationCondition(task,station);
 if(condition===null||state.records.some(r=>r.condition===condition))return false;
 state.records.push({condition,ratio:volumeFor(task.mode,condition)});return true;
}
export function stationCondition(task,station){return station==='base'?(task.baseline??1):station==='summit'?task.target:null;}
export function readyToCompare(state,task){return validVolumePair(state.records,task);}
/** 저장 필드는 기존 초안 그대로이고 예상만 덧붙인다. */
export function runDraft(state,task){
 const condition=readyToCompare(state,task)?task.target:(task.baseline??1);
 return {condition,records:state.records.map(r=>({...r})),...(state.prediction?{prediction:state.prediction}:{})};
}
/** 손에 든 봉지가 보여 주는 부피 비율. 두 관측 지점의 모형 값 사이를 높이에 따라 잇는다(표시용, 기록되지 않는다). */
export function bagRatio(task,heightFraction){
 const t=Math.max(0,Math.min(1,Number(heightFraction)||0)),a=volumeFor(task.mode,task.baseline??1),b=volumeFor(task.mode,task.target);
 return a+(b-a)*t;
}

// ── 코스 ── f는 앞으로 간 거리, x는 좌우, y는 높이.
const wide=2.9;
export const COURSE={
 speed:6,jump:8.6,gravity:26,stepUp:.34,edge:2.7,start:-2.4,end:41.4,fallBelow:-1.5,summit:4.8,
 platforms:[
  {id:'base',f0:-3,f1:5,x0:-wide,x1:wide,top:0,kind:'grass'},
  ...Array.from({length:6},(_,i)=>({id:`step-${i+1}`,f0:5+i,f1:6+i,x0:-wide,x1:wide,top:.3*(i+1),kind:'stone'})),
  {id:'rest',f0:11,f1:17,x0:-wide,x1:wide,top:2.4,kind:'grass'},
  {id:'bridge',f0:17,f1:24,x0:-.95,x1:.95,top:2.4,kind:'log'},
  {id:'meadow',f0:24,f1:34.4,x0:-wide,x1:wide,top:2.4,kind:'grass'},
  {id:'rock-1',f0:29.6,f1:32,x0:-1.5,x1:1.5,top:3.1,kind:'rock'},
  {id:'rock-2',f0:32,f1:34.2,x0:-1.5,x1:1.5,top:3.9,kind:'rock'},
  {id:'summit',f0:34.2,f1:42,x0:-wide,x1:wide,top:4.8,kind:'grass'}
 ],
 // 떨어지면 지나온 마지막 지점으로 돌아와 잠깐 숨을 고른다.
 checkpoints:[{f:0,x:0},{f:13.5,x:0},{f:25.5,x:0},{f:36,x:0}],
 stations:{base:{f0:-3,f1:4.2},summit:{f0:35.4,f1:42}},
 patrol:{f:27.4,x0:-2,x1:2,reach:.75}
};
export function groundAt(x,f,course=COURSE){let top=-Infinity;for(const p of course.platforms)if(f>=p.f0&&f<=p.f1&&x>=p.x0&&x<=p.x1&&p.top>top)top=p.top;return top;}
export function createRunner(course=COURSE,checkpoint=0){const at=course.checkpoints[checkpoint]||course.checkpoints[0];return {x:at.x,f:at.f,y:groundAt(at.x,at.f,course),vy:0,ground:true,checkpoint,falls:0,stun:0};}
export function heightFraction(runner,course=COURSE){return Math.max(0,Math.min(1,runner.y/course.summit));}
export function stationAt(runner,course=COURSE){
 if(!runner.ground)return null;
 for(const [name,zone] of Object.entries(course.stations))if(runner.f>=zone.f0&&runner.f<=zone.f1&&Math.abs(runner.y-groundAt(runner.x,runner.f,course))<.01)return name;
 return null;
}
function stepOnce(r,input,dt,course,events){
 const stunned=r.stun>0;if(stunned)r.stun=Math.max(0,r.stun-dt);
 let ix=stunned?0:Number(input.x)||0,iz=stunned?0:Number(input.f)||0;const length=Math.hypot(ix,iz);if(length>1){ix/=length;iz/=length;}
 // 좌우와 앞뒤를 따로 움직여 벽에 닿아도 미끄러지듯 지나간다.
 for(const [dx,df] of [[ix*course.speed*dt,0],[0,iz*course.speed*dt]]){
  if(!dx&&!df)continue;
  const nx=Math.max(-course.edge,Math.min(course.edge,r.x+dx)),nf=Math.max(course.start,Math.min(course.end,r.f+df)),top=groundAt(nx,nf,course);
  if(top-r.y>course.stepUp)continue;
  r.x=nx;r.f=nf;
  if(r.ground){if(top>-Infinity&&r.y-top<=course.stepUp)r.y=top;else{r.ground=false;r.vy=0;}}
  // 뛰어서 턱에 거의 닿았으면 올려 준다. 발판 속으로 들어가 떨어지는 일이 없다.
  else if(top>r.y){r.y=top;r.vy=0;r.ground=true;events.landed=true;}
 }
 if(r.ground&&input.jump&&!stunned){r.ground=false;r.vy=course.jump;events.jumped=true;}
 if(!r.ground){
  r.vy-=course.gravity*dt;const next=r.y+r.vy*dt,top=groundAt(r.x,r.f,course);
  if(r.vy<=0&&r.y>=top&&next<=top){r.y=top;r.vy=0;r.ground=true;events.landed=true;}else r.y=next;
 }
 if(r.y<course.fallBelow){
  const at=course.checkpoints[r.checkpoint];
  r.x=at.x;r.f=at.f;r.y=groundAt(at.x,at.f,course);r.vy=0;r.ground=true;r.falls++;r.stun=.4;events.respawned=true;
 }
 if(r.ground){for(let i=course.checkpoints.length-1;i>r.checkpoint;i--)if(r.f>=course.checkpoints[i].f){r.checkpoint=i;r.falls=0;events.checkpoint=i;break;}}
}
/** 느린 기기에서도 바닥을 뚫지 않게 한 프레임을 잘게 나눈다(프레임 시간은 0.05초로 자른다). */
export function advanceRunner(runner,input,seconds,course=COURSE){
 const events={},dt=Math.min(.05,Math.max(0,seconds))/5;
 if(dt>0)for(let i=0;i<5;i++)stepOnce(runner,{...input,jump:input.jump&&i===0},dt,course,events);
 return events;
}
/** 방해꾼에 닿으면 움찔만 한다. 기록·복귀 지점·떨어진 횟수는 바뀌지 않는다. */
export function patrolX(seconds,course=COURSE){const {x0,x1}=course.patrol;return x0+(x1-x0)*(.5-.5*Math.cos(seconds*1.3));}
export function touchPatrol(runner,seconds,course=COURSE){
 const p=course.patrol;
 if(runner.stun>0||Math.abs(runner.f-p.f)>p.reach||Math.abs(runner.x-patrolX(seconds,course))>p.reach||runner.y-groundAt(runner.x,p.f,course)>1)return false;
 runner.stun=.45;return true;
}
