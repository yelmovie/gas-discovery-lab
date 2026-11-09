// 개념영상 공용 부품: 편별 데이터(films.data.mjs)를 HyperFrames 단일 컴포지션 index.html로 만든다.
// 장면 경계는 앱 자막·장면 버튼과 같은 src/concept-clips.js의 cueAt(0|1|2)를 쓴다.
import {readFileSync} from 'node:fs';
import {CONCEPT_SECONDS,cueAt,CONCEPT_LABELS} from '../../src/concept-clips.js';
// 글꼴 경로는 영상 프로젝트 기준 assets/fonts. 스타일은 index.html 안에 넣는다.
const KIT_CSS=readFileSync(new URL('./kit.css',import.meta.url),'utf8');

const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const px=v=>typeof v==='number'?v+'px':v;
const box=({x,y,w,h})=>`left:${px(x)};top:${px(y)};width:${px(w)};height:${px(h)}`;
// 이름표: 장면(beat) 시작 뒤 1.1초에 물체 위에 붙고, 다음 장면 직전에 떨어진다. 마지막 장면 것은 끝까지 남는다.
const TAG_IN=1.1,TAG_OUT=.25;

export function renderFilm(film){
  const labels=CONCEPT_LABELS[film.id];
  if(!labels)throw Error(`알 수 없는 개념영상 ${film.id}`);
  const objects=film.objects.map(o=>o.html
    ?`<div class="obj" id="${o.id}" style="${box(o)};${o.style||''}">${o.html}</div>`
    :`<div class="obj" id="${o.id}" style="${box(o)};${o.style||''}"><img src="assets/${o.src}" alt=""></div>`).join('\n      ');
  const flows=(film.flows||[]).map(f=>`<path id="${f.id}" d="${f.d}" stroke="${f.color||'#2a8f8a'}" stroke-width="${f.width||16}" stroke-dasharray="${f.dash||'34 30'}" opacity="0"/>${f.head?`<path id="${f.id}-head" d="${f.head}" stroke="${f.color||'#2a8f8a'}" stroke-width="${f.width||16}" stroke-linejoin="round" opacity="0"/>`:''}`).join('');
  const tags=film.tags.map((t,i)=>`<div class="anchor" id="tag${i}" style="position:absolute;left:${t.x}px;top:${t.y}px;width:0;height:0;opacity:0;z-index:5"><div class="tag${t.down?' down':''}${t.gold?' gold':''}">${esc(t.text??labels[t.beat])}</div></div>`).join('\n      ');
  const notes=(film.notes||[]).map(n=>`<div class="note" id="${n.id}" style="left:${n.x}px;top:${n.y}px;opacity:0;z-index:5">${n.html}</div>`).join('\n      ');
  const q=film.question.split(' ').map(w=>`<span class="w">${esc(w)} </span>`).join('');
  const js=[];
  // 같은 대상의 두 번째 fromTo부터는 immediateRender:false — 앞 장면으로 되감아도 첫 상태가 유지된다.
  const seen=new Set(),once=(sel,vars)=>seen.has(sel)?{...vars,immediateRender:false}:(seen.add(sel),vars);
  const tw=(sel,from,to,at,dur,ease='power2.out')=>js.push(`tl.fromTo(${JSON.stringify(sel)},${JSON.stringify(from)},${JSON.stringify(once(sel,{...to,duration:dur,ease}))},${at});`);
  // 질문: 단어마다 흐림→선명. 자리를 잡으면 움직이지 않는다.
  js.push(`tl.fromTo('#q .w',{opacity:0,filter:'blur(6px)'},{opacity:1,filter:'blur(0px)',duration:.16,stagger:.08,ease:'power4.out'},.15);`);
  tw('#q b',{scale:.6,opacity:0},{scale:1,opacity:1},.1,.45,'back.out(1.7)');
  // 이름표
  film.tags.forEach((t,i)=>{const start=cueAt(t.beat)+(t.delay??TAG_IN),end=t.beat<2?cueAt(t.beat+1)-TAG_OUT:null;
    tw(`#tag${i}`,{opacity:0,y:t.down?-14:14},{opacity:1,y:0},start,.4,'expo.out');
    if(end)tw(`#tag${i}`,{opacity:1},{opacity:0},end,.18,'power2.in');});
  for(const n of film.notes||[])tw('#'+n.id,{opacity:0,y:16},{opacity:1,y:0},n.at,.45,'expo.out'),n.out&&tw('#'+n.id,{opacity:1},{opacity:0},n.out,.2,'power2.in');
  // 공기 흐름 화살(점선이 흐르는 방향 = 공기가 가는 방향). 입자 모형이 아니라 흐름 표시다.
  for(const f of film.flows||[]){const [a,b]=f.window,len=b-a,shift=-(f.speed||220)*len;
    tw('#'+f.id,{opacity:0},{opacity:1},a,.3,'power1.out');
    js.push(`tl.fromTo('#${f.id}',{strokeDashoffset:0},${JSON.stringify(once('#'+f.id+'#dash',{strokeDashoffset:+shift.toFixed(0),duration:len,ease:'none'}))},${a});`);
    if(f.head)tw(`#${f.id}-head`,{opacity:0},{opacity:1},a+.2,.3,'power1.out');
    if(f.out!=null){tw('#'+f.id,{opacity:1},{opacity:0},f.out,.25,'power2.in');if(f.head)tw(`#${f.id}-head`,{opacity:1},{opacity:0},f.out,.25,'power2.in');}}
  // 편별 동작
  for(const a of film.actions){
    // 반복은 영상 끝 안에서 끝나는 정해진 횟수만(무한 반복 금지).
    if(a.repeat){const n=Math.max(0,Math.floor((CONCEPT_SECONDS-a.at)/a.dur)-1);js.push(`tl.fromTo(${JSON.stringify(a.sel)},${JSON.stringify(a.from)},${JSON.stringify({...a.to,duration:a.dur,ease:a.ease||'none',repeat:n,immediateRender:false})},${a.at});`);}
    else tw(a.sel,a.from,a.to,a.at,a.dur,a.ease||'power2.inOut');}
  // 가운데 장면: 바뀐 곳을 당겨 본다.
  if(film.zoom){const {x,y,scale=1.28,at=cueAt(1)+.9,back=cueAt(2)-.35}=film.zoom,tx=Math.round((960+x)/2-scale*x),ty=Math.round((540+y)/2-scale*y);
    tw('#cam',{x:0,y:0,scale:1},{x:tx,y:ty,scale},at,.75,'power2.inOut');tw('#cam',{x:tx,y:ty,scale},{x:0,y:0,scale:1},back,.6,'power2.inOut');}
  // 결론 한 줄 + 솔이 반응
  const endAt=cueAt(2)+1;
  tw('#conclusion',{opacity:0,y:24},{opacity:1,y:0},endAt,.55,'expo.out');
  tw('#q',{opacity:1},{opacity:.55},endAt,.4,'power1.out');
  tw('#soli',{opacity:0,scale:.55,y:40},{opacity:1,scale:1,y:0},endAt+.35,.6,'back.out(1.6)');
  tw('#soli',{rotation:0},{rotation:-7},endAt+1.1,.22,'power2.out');tw('#soli',{rotation:-7},{rotation:0},endAt+1.32,.4,'back.out(2)');
  return `<!doctype html>
<html lang="ko">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=1920, height=1080" />
    <title>${esc(film.question)}</title>
    <script src="https://cdn.jsdelivr.net/npm/gsap@3.15.0/dist/gsap.min.js"></script>
    <style>
${KIT_CSS}
    </style>
  </head>
  <body>
    <div id="root" data-composition-id="main" data-start="0" data-duration="${CONCEPT_SECONDS}" data-width="1920" data-height="1080">
      <div id="cam">
      <div class="paper" style="inset:-700px" data-layout-allow-overflow></div>
      ${(film.shadows||[]).map(s=>`<div class="shadow" style="left:${s.x}px;top:${s.y}px;width:${s.w}px"></div>`).join('')}
      ${objects}
      <svg class="flow" viewBox="0 0 1920 1080">${flows}</svg>
      ${tags}
      ${notes}
      </div>
      <div class="paper-edge">${[150,330,510,690,870].map(t=>`<i style="top:${t}px"></i>`).join('')}</div>
      <div class="question" id="q"><b>?</b><span>${q}</span></div>
      <div id="conclusion" style="position:absolute;left:0;top:0;width:1920px;height:1080px;opacity:0"><div class="conclusion">${film.conclusion}</div></div>
      <div class="soli" id="soli" style="opacity:0"><img src="assets/soli.svg" alt=""></div>
    </div>
    <script>
      const tl = gsap.timeline({ paused: true });
      ${js.join('\n      ')}
      window.__timelines["main"] = tl;
      tl.seek(0);
    </script>
  </body>
</html>
`;
}
