const base='/assets/map-encounters/';
const story = [
  ["vent", "막힌 관을 이어 팬을 돌렸어? 바람길을 접어 숨겼는데!", "다음엔 내 바람만 다니는 지름길로 만들 거야!", "푸슉! 접힌 관이 펴졌어!", "내가 멈춘 팬이 돌기 시작해!", "흥, 바람길은 돌려줄게!"],
  ["plate", "공기의 무게까지 쟀어? 빈 것처럼 보이면 못 찾을 줄 알았지!", "그럼 내 공기 주머니는 저울에 올리지 마!", "앗, 내가 올려 둔 추가 흔들려!", "저울이 제대로 비교하잖아!", "쳇, 모형 추는 모두 회수할게!"],
  ["plug", "따뜻할 때랑 눌렀을 때의 공기 부피를 봤어? 피스톤을 숨겼는데!", "다음엔 부푼 풍선 뒤에 내가 숨어야겠군!", "앗, 피스톤 손잡이가 돌아왔어!", "가려 둔 부피 눈금이 보이잖아!", "흥, 부피 기록은 그대로 두고 갈게!"],
  ["cap", "알맞은 기체를 골라 배송했어? 배송관을 막아 놨는데!", "탄산 기포만 하나 따로 내 앞으로 보내 줘!", "뽁! 막아 둔 캡슐이 움직였어!", "배송관에 다시 불이 켜졌잖아!", "쳇, 배송관은 비워 둘게. 과자 봉지는 안 열 거야!"],
  ["wave", "노즐 방향까지 맞춰 네 장치를 돌렸어? 내 바람은 옆으로 새는데!", "나도 바람 자동차로 멋지게 퇴장하고 싶어!", "푸슉! 비껴 둔 노즐이 돌아갔어!", "공기가 코어 쪽으로 향하잖아!", "피슈우! 내 장난 바람은 다 빠졌다!"],
];
export const encounterLook = {palette:'#a7e7ff', effect:'air', art:{left:base+'villain-redraw.png',frames:6}};
export function encounterStage(index,id,name,point){
  const [prop,one,two,hitOne,hitTwo,finish]=story[index];
  return {id:String(id),name,speaker:"바람 훼방꾼",x:point.x,y:point.y,lines:[one,two],prop,hit:[hitOne,hitTwo],finish};
}
export function loadEncounterActor(name){const image=new Image();image.src=base+name+'-redraw.png';return image;}
export function drawEncounterActor(context,image,point,size,pose,{native=-1}={}){
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
