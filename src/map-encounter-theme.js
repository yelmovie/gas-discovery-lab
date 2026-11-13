const base='/assets/map-encounters/';
const story = [
  [
    "관을 접어 버렸어. 팬은 이제 못 돌지!",
    "파란 관을 더 접어야지!",
    "vent"
  ],
  [
    "모형 추를 올렸더니 접시가 기울었어!",
    "어느 쪽 접시가 내려갈까?",
    "plate"
  ],
  [
    "이 피스톤 손잡이가 마음에 드는데?",
    "손잡이를 한 번 더 눌러야지!",
    "plug"
  ],
  [
    "이 캡슐은 못 지나가!",
    "배송관 앞을 막아 놨어!",
    "cap"
  ],
  [
    "노즐을 옆으로 돌려야지!",
    "풍차에 바람이 닿을까?",
    "wave"
  ]
];
const hit = ["퐁! 공기가 새잖아!", "노즐이 찌그러졌어!"], finish = "피슈우! 바람이 다 빠졌어!";
export const encounterLook = {palette:'#a7e7ff', effect:'air', art:{left:base+'villain-left.png',frames:6}};
export function encounterStage(index,id,name,point){
  const [one,two,prop]=story[index];
  return {id:String(id),name,x:point.x,y:point.y,lines:[one,two],prop,hit,finish};
}
export function loadEncounterActor(name){const image=new Image();image.src=base+name+'.png';return image;}
export function drawEncounterActor(context,image,point,size,pose,{native=1}={}){
  if(!pose||!image.complete||!image.naturalWidth)return false;
  const cell=image.naturalHeight;
  const index=pose.kind==='attack'?4+Number(pose.frame>0):Math.min(3,pose.frame);
  context.save();
  context.translate(point.x+pose.dx,point.y);
  context.scale(pose.direction*native,1);
  const side=size/.84;
  context.drawImage(image,index*cell,0,cell,cell,-side/2,-side*.935,side,side);
  context.restore();
  return true;
}
