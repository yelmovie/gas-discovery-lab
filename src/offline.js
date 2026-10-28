let pending=null;
export let offlineReady=false;
export function prepareOffline(onProgress){
 if(pending)return pending;
 pending=(async()=>{
  if(!('serviceWorker'in navigator))throw Error('이 브라우저에서는 오프라인 준비를 지원하지 않아요.');
  const reg=await navigator.serviceWorker.register('/sw.js');
  let worker=reg.active||reg.waiting||reg.installing;
  if(!worker)throw Error('오프라인 준비를 시작하지 못했어요.');
  if(worker.state!=='activated')await new Promise((resolve,reject)=>{const timer=setTimeout(()=>reject(Error('오프라인 준비를 다시 눌러 주세요.')),12000);worker.addEventListener('statechange',()=>{if(worker.state==='activated'){clearTimeout(timer);resolve();}});});
  await new Promise((resolve,reject)=>{let timeout;const cleanup=()=>{clearTimeout(timeout);navigator.serviceWorker.removeEventListener('message',receive);};const reset=()=>{clearTimeout(timeout);timeout=setTimeout(()=>{cleanup();reject(Error('연결 상태를 확인하고 다시 준비해 주세요.'));},30000);};const receive=e=>{if(e.data.type==='CACHE_PROGRESS'){reset();onProgress?.(e.data.done,e.data.total);}if(e.data.type==='CACHE_READY'){cleanup();offlineReady=true;resolve();}if(e.data.type==='CACHE_ERROR'){cleanup();reject(Error('일부 그림을 받지 못했어요. 연결 후 다시 준비해 주세요.'));}};navigator.serviceWorker.addEventListener('message',receive);reset();worker.postMessage({type:'CACHE_ALL'});});
 })().finally(()=>pending=null);return pending;
}
