// Generated materials decorate the part; the airflow geometry stays exact and code-driven.
export function pipeArtwork(type,rotation=0,{flow=false,className=''}={}){
 const kind=type==='elbow'?'elbow':type==='cap'?'blocked':'straight',angle=((rotation%4)+4)%4*90;
 const path=kind==='elbow'?'M50 0V32Q50 50 68 50H100':'M0 50H100';
 return `<span class="pipe-figure ${className}" aria-hidden="true"><span class="pipe-rotation" style="transform:rotate(${angle}deg)"><img class="pipe-material pipe-material-${kind}" src="/assets/visuals/pipe-${kind}-v1.webp" alt="" draggable="false"></span>${flow?`<svg class="pipe-flow-overlay" viewBox="0 0 100 100"><path class="pipe-water" d="${path}" transform="rotate(${angle} 50 50)"/></svg>`:''}</span>`;
}
