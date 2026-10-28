import {STAGES} from './data.js';
const BASE={straight:[1,3],elbow:[0,1]};
const STEPS=[[-1,0],[0,1],[1,0],[0,-1]];
function routePattern(path){
 const types=Array.from({length:9},(_,i)=>i%2?'straight':'elbow'),solved=Array(9).fill(0);
 for(let i=0;i<path.length;i++){
  const cell=path[i],row=Math.floor(cell/3),col=cell%3;
  const side=other=>{const dr=Math.floor(other/3)-row,dc=other%3-col;return STEPS.findIndex(([r,c])=>r===dr&&c===dc);};
  const ends=[i?side(path[i-1]):3,i<path.length-1?side(path[i+1]):1];
  const type=(ends[0]+2)%4===ends[1]?'straight':'elbow';types[cell]=type;
  solved[cell]=[0,1,2,3].find(rotation=>BASE[type].every(port=>ends.includes((port+rotation)%4)));
 }
 return {types,solved};
}
export const PIPE_PATTERNS=[
 {types:['straight','straight','elbow','elbow','straight','straight','elbow','elbow','elbow'],solved:[0,0,2,0,0,1,0,0,0]},
 {types:['elbow','straight','elbow','straight','elbow','elbow','elbow','straight','straight'],solved:[2,0,0,1,0,0,0,0,0]},
 {types:['straight','elbow','straight','straight','elbow','elbow','elbow','straight','elbow'],solved:[0,2,0,0,0,2,0,0,0]},
 {types:['elbow','straight','elbow','elbow','elbow','straight','straight','elbow','straight'],solved:[2,0,0,0,2,0,0,0,0]},
 routePattern([0,1,2,5,4,7,8]),
 routePattern([0,3,6,7,4,5,8]),
 routePattern([0,1,4,3,6,7,8]),
 routePattern([0,3,4,1,2,5,8])
];
export function ports(type,rotation){return BASE[type]?.map(p=>(p+rotation)%4)||[];}
export function createPipePuzzle(pattern){const p=PIPE_PATTERNS[pattern]||PIPE_PATTERNS[0];return p.types.map((type,i)=>({type,rotation:(p.solved[i]+[1,2,1,0,1,2,0,1,1][i])%4}));}
export function tracePipe(cells){
 if(!Array.isArray(cells)||cells.length!==9||cells.some(c=>!BASE[c?.type]||!Number.isInteger(c.rotation)))return {ok:false,path:[],stop:0};
 let cell=0,enter=3;const visited=[];
 for(let count=0;count<20;count++){
  if(visited.includes(cell))return {ok:false,path:visited,stop:cell};
  const connections=ports(cells[cell].type,cells[cell].rotation);
  if(!connections.includes(enter))return {ok:false,path:visited,stop:cell};
  visited.push(cell);const exit=connections.find(d=>d!==enter);
  if(cell===8&&exit===1)return {ok:true,path:visited};
  const row=Math.floor(cell/3),col=cell%3;const [dr,dc]=STEPS[exit];
  const r=row+dr,c=col+dc;if(r<0||r>2||c<0||c>2)return {ok:false,path:visited,stop:cell};
  cell=r*3+c;enter=(exit+2)%4;
 }
 return {ok:false,path:visited,stop:cell};
}
export function massFor(air,offset=0){return Math.round((150+air*.08+offset)*100)/100;}
export function compareMeasurements(a,b,task){
 if(!a||!b)return {ok:false,message:'비교할 기록을 두 개 골라 주세요.'};
 if(!a.valid||!b.valid)return {ok:false,message:'수평과 0점을 확인하고 다시 측정해요. 조건이 맞는 기록끼리 골라 주세요.'};
 if(a.jar!==b.jar||a.tare!==b.tare)return {ok:false,message:'같은 용기, 같은 0점에서 측정한 기록을 골라요.'};
 const delta=b.air-a.air;
 if(delta*task.direction<task.minDelta)return {ok:false,message:task.direction>0?'처음 기록을 남긴 뒤 공기를 더 넣고 다시 재어 보아요.':'처음 기록을 남긴 뒤 공기를 빼고 다시 재어 보아요.'};
 return {ok:true,delta:Math.round((b.mass-a.mass)*100)/100};
}
export function volumeFor(mode,condition){return mode==='temperature'?[.72,1,1.3][condition]:[1.35,1,.66][condition];}
export function validVolumePair(records,task){const baseline=task.baseline??1;return baseline!==task.target&&Array.isArray(records)&&records.some(r=>r.condition===baseline)&&records.some(r=>r.condition===task.target);}
export function validateDelivery(gas,reason,task){if(gas!==task.gas)return {ok:false,kind:'gas'};if(reason!==task.reason)return {ok:false,kind:'reason'};return {ok:true};}
export function validateDevice(design,task){
 if(!['balloon','pump'].includes(design.source))return {ok:false,kind:'source',message:'공기를 보낼 공급부를 골라요.'};
 if(task.requireSource&&design.source!==task.requireSource)return {ok:false,kind:'source',message:task.requireSource==='pump'?'이번 의뢰는 손 펌프로 계속 공기를 보내야 해요. 공급부를 살펴봐요.':'이번 의뢰는 풍선에 모아 둔 공기로 움직여요. 공급부를 살펴봐요.'};
 if(!['straight','elbow'].includes(design.pipe))return {ok:false,kind:'pipe',message:'막힌 관에서는 공기가 지나가지 못해요. 열린 관으로 바꿔요.'};
 if(task.requireElbow&&design.pipe!=='elbow')return {ok:false,kind:'route',message:'이번 의뢰는 옆으로 돌아가는 길이에요. 굽은 관을 써 볼까요?'};
 if(!design.nozzle)return {ok:false,kind:'nozzle',message:'공기가 나갈 노즐을 연결해요.'};
 if(design.direction!==task.nozzle)return {ok:false,kind:'direction',message:task.target==='car'?'공기를 자동차 뒤로 내보내야 앞으로 나아가요. 노즐 방향을 바꿔요.':'바람이 장치 반대쪽으로 나가요. 노즐이 장치를 향하게 바꿔요.'};
 if(!design.valve)return {ok:false,kind:'valve',message:'밸브가 닫혀 있어요. 공기 길을 열어 주세요.'};
 return {ok:true};
}
export function completeStage(save,id){const stage=STAGES.find(s=>s.id===id);if(!stage)return false;const ids=new Set((save.evidence?.[id]||[]).map(e=>e.taskId));return stage.tasks.every(t=>ids.has(t.id));}
export function isStageOpen(save,index){if(!Number.isInteger(index)||index<0||index>=STAGES.length)return false;return save.settings?.adminUnlockAll===true||index===0||completeStage(save,STAGES[index-1].id);}
