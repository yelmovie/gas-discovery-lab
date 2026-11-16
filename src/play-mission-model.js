const piece=(type,turn)=>({type,turn});
// start: 고정 관(모양 고정, 방향만 틀어 둠). empty: 비어 있어 tray의 관 조각을 끌어 놓아야 하는 칸.
// tray: 놓을 수 있는 관 조각(하나는 맞지 않는 조각). 놓은 뒤에도 눌러서 돌릴 수 있다.
export const missions=[
 {name:'작은 승강기',ventOpen:false,goal:'빈 칸에 관 조각을 끌어다 놓아 공기길을 이어 봐.',blocked:[1,7],empty:[3,4,5],source:3,target:5,required:3,
  start:[piece(1,2),piece(0,0),piece(1,3),piece(-1,0),piece(-1,0),piece(-1,0),piece(1,1),piece(0,0),piece(0,1)],
  tray:[piece(0,1),piece(1,0),piece(0,1),piece(0,1)]},
 {name:'돌아가는 공기길',ventOpen:false,goal:'가운데가 막혔어. 위쪽으로 돌아가게 관을 놓고 돌려 봐.',blocked:[4],empty:[1,2],source:3,target:5,required:4,
  start:[piece(1,0),piece(-1,0),piece(-1,0),piece(1,0),piece(0,0),piece(1,2),piece(0,1),piece(1,0),piece(0,0)],
  tray:[piece(1,2),piece(0,0),piece(1,1)]},
 {name:'새는 밸브의 비밀',ventOpen:true,goal:'아래로 돌아가는 길을 잇고, 새는 배출 밸브를 잠가 봐.',blocked:[1,4],empty:[7,8],source:3,target:5,required:5,
  start:[piece(1,1),piece(0,0),piece(0,0),piece(1,0),piece(0,0),piece(1,3),piece(1,2),piece(-1,0),piece(-1,0)],
  tray:[piece(0,1),piece(1,0),piece(1,3)]}
];
export const directions=[[0,-1],[1,0],[0,1],[-1,0]];
export function ports(piece){if(piece.type<0)return [];const shapes=[[0,2],[0,1],[0,1,2],[0,1,2,3]];return shapes[piece.type].map(x=>(x+piece.turn)%4);}
export function flow(cells,mission,ventOpen){const start=mission.source,seen=new Set(),queue=[];let leak=false,reached=false;if(!ports(cells[start]).includes(3))return {reached:false,leak:false,path:[],reason:'입구의 관이 왼쪽 공기 입구와 연결되지 않았어.'};queue.push(start);while(queue.length){const i=queue.shift();if(seen.has(i))continue;seen.add(i);for(const d of ports(cells[i])){if(i===start&&d===3)continue;if(i===mission.target&&d===1){reached=true;continue;}const [dx,dy]=directions[d],x=i%3+dx,y=Math.floor(i/3)+dy,j=y*3+x;if(x<0||x>2||y<0||y>2||mission.blocked.includes(j)||!ports(cells[j]).includes((d+2)%4)){leak=true;continue;}queue.push(j);}}if(ventOpen)leak=true;return {reached,leak,path:[...seen],reason:leak?'열린 끝이나 배출 밸브로 공기가 새고 있어. 연결과 밸브를 살펴봐.':!reached?'공기가 목적지까지 이어지지 않았어. 관을 돌리거나 모양을 바꿔 봐.':'공기길이 이어졌어! 펌프를 눌러 공기를 보내 봐.'};}
export function freshCells(){return Array.from({length:9},()=>({type:0,turn:0}));}
export function startCells(mission){return mission.start.map(c=>({...c}));}
