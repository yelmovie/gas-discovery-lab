// A4 가로 상장. 과학 내용·완료 판정·저장 형식은 그대로, 종이에는 진행 숫자를 표시하지 않는다.
import {STAGES} from './data.js';
import {store,persist} from './state.js';
import {button,choices,escapeHTML} from './ui.js';
import {saveCertificatePng} from './certificate-png.js';

function doneDate(){
 const last=STAGES.flatMap(s=>store.save.evidence[s.id]||[]).map(e=>Date.parse(e.date)).filter(Number.isFinite).sort((a,b)=>b-a)[0];
 const d=new Date(last??Date.now());return `${d.getFullYear()}. ${d.getMonth()+1}. ${d.getDate()}.`;
}

export function renderCertificate(host,navigate){
 if(!store.save.finaleCompleted){navigate({screen:'map'},{replace:true});return;}
 host.innerHTML=`
  <img class="scene-background" src="/assets/ending.webp" alt=""><div class="scene-shade"></div>
  <div class="cert-layout">
   <div class="cert-main">
    <article class="cert-paper" id="certificate" aria-label="기체 도시 복구 인증서">
     <img class="cert-frame" src="/assets/certificate-frame-20261122.webp" alt="" aria-hidden="true">
     <div class="cert-content">
      <p class="cert-world">기체 도시 대작전 · 공기 엔지니어</p>
      <h1 class="cert-title" tabindex="-1">기체 도시 복구 인증서</h1>
      <div class="cert-recipient" aria-label="인쇄한 뒤 손으로 쓰는 학교, 학년, 반, 번호, 이름 빈칸">
       <div class="cert-class"><span class="cert-blank school" data-cert-blank="school"></span> 학교 <span class="cert-blank" data-cert-blank="grade"></span> 학년 <span class="cert-blank" data-cert-blank="class"></span> 반 <span class="cert-blank" data-cert-blank="number"></span> 번</div>
       <div class="cert-name">이름 <span class="cert-blank name" data-cert-blank="name"></span></div>
      </div>
      <p class="cert-award">위 엔지니어는 연구시설에서 증거를 모으고,<br>직접 만든 공기 장치로 마을을 되살렸으므로<br>이 인증서를 드립니다.</p>
      <p class="certificate-ability">나는 이제 ${escapeHTML(store.save.ability)}</p>
      <div class="cert-bottom">
       <p class="cert-date"><small>모험을 마친 날</small>${doneDate()}</p>
       <div class="cert-stamp"><b>공기 코어</b><span>복구 인증</span></div>
       <p class="cert-issuer"><small>주는 이</small>여우 에어</p>
      </div>
      <p class="cert-credit">기획·제작: 옐샘 &amp; ⓒ 아이스크림미디어</p>
     </div>
    </article>
    <p class="cert-note">인쇄한 뒤 학교·반·번호·이름을 직접 적어요.</p>
    <div class="certificate-actions"></div><p class="cert-error" role="status" aria-live="polite"></p>
   </div>
   <aside class="lab-panel certificate-options"><div class="eyebrow">내가 발견한 힘</div><h2>이제 무엇을<br>할 수 있나요?</h2><div class="ability-options"></div></aside>
  </div>`;
 host.querySelector('.ability-options').append(choices(['실험 기록을 비교해 설명할 수 있어요.','조건을 바꾸고 부피 변화를 관찰할 수 있어요.','공기의 성질로 장치를 만들 수 있어요.'],value=>{
  store.save.ability=value;persist();host.querySelector('.certificate-ability').textContent='나는 이제 '+value;
 },{selected:store.save.ability}));
 const actions=host.querySelector('.certificate-actions'),paper=host.querySelector('.cert-paper'),message=host.querySelector('.cert-error');
 actions.append(button('인증서 인쇄 / PDF 저장',()=>window.print()));
 const png=button('PNG 저장',async()=>{
  if(png.disabled)return;png.disabled=true;message.textContent='';
  try{await saveCertificatePng(paper,'기체-도시-복구-인증서.png');}catch{message.textContent='PNG를 저장하지 못했어요. 다시 눌러 주세요.';}finally{png.disabled=false;}
 },'button secondary');actions.append(png);
}
