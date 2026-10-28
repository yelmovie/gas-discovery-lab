// Pointer capture keeps touch dragging reliable even when a finger leaves the card.
// Taps and keyboard activation retain the existing select-then-place alternative.
export function touchDrag(element,{signal,selector,onDrop}){
 let start=null,ghost=null,active=false,target=null;
 const clear=()=>{ghost?.remove();ghost=null;target?.classList.remove('touch-drop-ready');target=null;start=null;active=false;element.classList.remove('touch-dragging');};
 element.draggable=false;
 element.addEventListener('pointerdown',e=>{if(start||e.button!==0||element.disabled)return;start={x:e.clientX,y:e.clientY,id:e.pointerId};element.setPointerCapture(e.pointerId);},{signal});
 element.addEventListener('pointermove',e=>{if(!start||e.pointerId!==start.id)return;if(!active&&Math.hypot(e.clientX-start.x,e.clientY-start.y)<12)return;if(!ghost){active=true;ghost=element.cloneNode(true);ghost.removeAttribute('id');ghost.setAttribute('aria-hidden','true');ghost.classList.add('drag-ghost');const r=element.getBoundingClientRect();ghost.style.width=`${r.width}px`;ghost.style.height=`${r.height}px`;document.body.append(ghost);element.classList.add('touch-dragging');}ghost.style.left=`${e.clientX}px`;ghost.style.top=`${e.clientY}px`;const next=document.elementFromPoint(e.clientX,e.clientY)?.closest(selector);if(target!==next){target?.classList.remove('touch-drop-ready');target=next;target?.classList.add('touch-drop-ready');}},{signal});
 element.addEventListener('pointerup',e=>{if(!start||e.pointerId!==start.id)return;const moved=active||Math.hypot(e.clientX-start.x,e.clientY-start.y)>=12,drop=document.elementFromPoint(e.clientX,e.clientY)?.closest(selector);clear();if(moved){const suppress=e=>{e.preventDefault();e.stopImmediatePropagation();};element.addEventListener('click',suppress,{once:true,capture:true});setTimeout(()=>element.removeEventListener('click',suppress,true),400);if(drop)setTimeout(()=>{if(!signal?.aborted&&drop.isConnected)onDrop(drop);},0);}},{signal});
 element.addEventListener('pointercancel',clear,{signal});element.addEventListener('lostpointercapture',clear,{signal});signal?.addEventListener('abort',clear,{once:true});
}

export function repeatPress(element,action,signal){
 let timer=0,repeated=false;
 function stop(){clearInterval(timer);timer=0;}
 element.addEventListener('pointerdown',e=>{if(e.button!==0)return;repeated=false;element.setPointerCapture(e.pointerId);timer=setInterval(()=>{repeated=true;action();},320);},{signal});
 for(const type of ['pointerup','pointercancel','lostpointercapture'])element.addEventListener(type,stop,{signal});
 element.addEventListener('click',e=>{if(repeated){e.preventDefault();e.stopImmediatePropagation();repeated=false;}},{capture:true,signal});
 window.addEventListener('blur',stop,{signal});document.addEventListener('visibilitychange',()=>{if(document.hidden)stop();},{signal});signal?.addEventListener('abort',stop,{once:true});
}


