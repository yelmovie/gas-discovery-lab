import {assistMapStep} from './map-controls.js';
import {STAGES} from './data.js';
export const distance=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y);
const point=a=>({x:a[0],y:a[1]});
export function validateMap(data){
 if(!data||data.version!==1||data.width!==1672||data.height!==941||!Number.isFinite(data.radius)||data.radius<1)throw Error('마을 지도의 크기가 맞지 않아요.');
 const ids=[...STAGES.map(s=>s.id),'core'];
 if(!Array.isArray(data.buildings)||data.buildings.length!==6||new Set(data.buildings.map(b=>b.id)).size!==6||!ids.every(id=>data.buildings.some(b=>b.id===id)))throw Error('시설 정보가 맞지 않아요.');
 const valid=a=>Array.isArray(a)&&a.length===2&&Number.isFinite(a[0])&&Number.isFinite(a[1])&&a[0]>=0&&a[0]<=data.width&&a[1]>=0&&a[1]<=data.height;
 if(!data.nodes||Object.values(data.nodes).some(a=>!valid(a))||!Array.isArray(data.plaza)||data.plaza.length<3||data.plaza.some(a=>!valid(a)))throw Error('길 좌표를 읽지 못했어요.');
 if(!Array.isArray(data.edges)||data.edges.some(([a,b,width])=>!data.nodes[a]||!data.nodes[b]||!Number.isFinite(width)||width<16||width>80))throw Error('이어진 길을 확인하지 못했어요.');
 for(const b of data.buildings)if(!data.nodes[b.entry]||!valid(b.label)||!valid(b.return))throw Error('시설 입구를 찾지 못했어요.');
 if(!canStand(data,data.spawn))throw Error('출발할 곳을 찾지 못했어요.');return data;
}
export function segmentDistance(p,a,b){const dx=b.x-a.x,dy=b.y-a.y;const t=Math.max(0,Math.min(1,((p.x-a.x)*dx+(p.y-a.y)*dy)/(dx*dx+dy*dy||1)));return distance(p,{x:a.x+t*dx,y:a.y+t*dy});}
export function insidePolygon(p,polygon){let inside=false;for(let i=0,j=polygon.length-1;i<polygon.length;j=i++){const a=polygon[i],b=polygon[j];if((a[1]>p.y)!==(b[1]>p.y)&&p.x<(b[0]-a[0])*(p.y-a[1])/(b[1]-a[1])+a[0])inside=!inside;}return inside;}
export function canStand(map,p){if(!p||!Number.isFinite(p.x)||!Number.isFinite(p.y)||p.x<map.radius||p.x>map.width-map.radius||p.y<map.radius||p.y>map.height-map.radius)return false;if(insidePolygon(p,map.plaza))return true;return map.edges.some(([a,b,width])=>segmentDistance(p,point(map.nodes[a]),point(map.nodes[b]))<=width-map.radius);}
export function lineClear(map,a,b){const count=Math.ceil(distance(a,b)/6);for(let i=0;i<=count;i++)if(!canStand(map,{x:a.x+(b.x-a.x)*i/(count||1),y:a.y+(b.y-a.y)*i/(count||1)}))return false;return true;}
export function movePoint(map,start,dx,dy){return assistMapStep(start,{x:dx,y:dy},p=>canStand(map,p));}
export function nearestWalkable(map,p){if(canStand(map,p))return p;let best=null,bestDist=Infinity;for(let r=8;r<=80;r+=8)for(let a=0;a<32;a++){const q={x:p.x+Math.cos(a*Math.PI/16)*r,y:p.y+Math.sin(a*Math.PI/16)*r};if(canStand(map,q)&&distance(q,p)<bestDist){best=q;bestDist=distance(q,p);}}return best;}
export function findPath(map,start,target){
 const end=nearestWalkable(map,target);if(!end||!canStand(map,start))return null;if(lineClear(map,start,end))return [end];
 const step=14,cols=Math.ceil(map.width/step)+1,rows=Math.ceil(map.height/step)+1;
 const toGrid=p=>({x:Math.round(p.x/step),y:Math.round(p.y/step)}),toWorld=p=>({x:p.x*step,y:p.y*step}),key=p=>p.y*cols+p.x;
 function snap(p){const g=toGrid(p);for(let r=0;r<5;r++)for(let dy=-r;dy<=r;dy++)for(let dx=-r;dx<=r;dx++){const q={x:g.x+dx,y:g.y+dy};if(q.x>=0&&q.y>=0&&q.x<cols&&q.y<rows&&canStand(map,toWorld(q))&&lineClear(map,p,toWorld(q)))return q;}return null;}
 const first=snap(start),last=snap(end);if(!first||!last)return null;
 const open=new Set([key(first)]),nodes=new Map([[key(first),first]]),cost=new Map([[key(first),0]]),parent=new Map(),closed=new Set();
 while(open.size){let current,score=Infinity;for(const k of open){const p=nodes.get(k);const f=cost.get(k)+Math.hypot(p.x-last.x,p.y-last.y);if(f<score){score=f;current=k;}}const p=nodes.get(current);if(current===key(last)){const points=[end];let k=current;while(k!==undefined){points.push(toWorld(nodes.get(k)));k=parent.get(k);}points.reverse();points.unshift(start);const result=[];let from=0;while(from<points.length-1){let to=points.length-1;while(to>from+1&&!lineClear(map,points[from],points[to]))to--;result.push(points[to]);from=to;}return result;}
  open.delete(current);closed.add(current);if(closed.size>12000)return null;
  for(let dy=-1;dy<=1;dy++)for(let dx=-1;dx<=1;dx++){if(!dx&&!dy)continue;const q={x:p.x+dx,y:p.y+dy},k=key(q);if(q.x<0||q.y<0||q.x>=cols||q.y>=rows||closed.has(k)||!lineClear(map,toWorld(p),toWorld(q)))continue;const next=cost.get(current)+Math.hypot(dx,dy);if(next<(cost.get(k)??Infinity)){nodes.set(k,q);cost.set(k,next);parent.set(k,current);open.add(k);}}
 }return null;
}
