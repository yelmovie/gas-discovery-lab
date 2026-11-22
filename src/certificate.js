// 인증서 화면(2026-11-21 3-4 코드 정리: main.js에서 옮김. 내용은 그대로, 줄만 나눴다).
import {STAGES} from './data.js';
import {store,persist} from './state.js';
import {button,choices,escapeHTML} from './ui.js';
import {icon} from './icons.js';

// 완료한 날짜: 마지막으로 기록한 탐구의 날짜(저장 형식은 그대로). 없으면 오늘. 형식 「2026. 11. 22.」
function doneDate(){
	const last=STAGES.flatMap(s=>store.save.evidence[s.id]||[]).map(e=>Date.parse(e.date)).filter(Number.isFinite).sort((a,b)=>b-a)[0];
	const d=new Date(last??Date.now());return `${d.getFullYear()}. ${d.getMonth()+1}. ${d.getDate()}.`;
}

export function renderCertificate(host,navigate){
	if(!store.save.finaleCompleted){navigate({screen:'map'},{replace:true});return;}
	host.innerHTML=
		`<img class="scene-background" src="/assets/ending.webp" alt=""><div class="scene-shade"></div><div class="certificate-layout"><section class="certificate" id="certificate">` +
		`<div class="certificate-top">과학 탐구 · 공기 엔지니어</div><div class="certificate-seal">${icon('star')}</div><h1 tabindex="-1">기체 도시 복구 인증서</h1><div class="certificate-name">${escapeHTML(store.save.nickname||'멋진 공기 엔지니어')}</div>` +
		`<p>다섯 연구시설에서 증거를 모으고<br>직접 만든 공기 장치로 마을을 되살렸어요.</p><strong class="certificate-ability">나는 이제 ${escapeHTML(store.save.ability)}</strong>` +
		`<div class="certificate-badges">${STAGES.map(s=>`<span>${icon('check')}${s.badge}</span>`).join('')}</div>` +
		`${(n=>n?`<p class="certificate-first-try">${icon('star')} 첫 시도에 맞힌 탐구 ${n}개</p>`:'')(
			STAGES.reduce((sum,st)=>sum+store.save.evidence[st.id].filter(e=>e.details?.firstTry===true).length,0))}` +
		`<div class="certificate-date">${doneDate()}</div>` +
		`<div class="certificate-sign">` +
		`<span>기획·제작: 옐샘 & ⓒ 아이스크림미디어</span></div></section><aside class="lab-panel certificate-options"><div class="eyebrow">내가 발견한 힘</div><h2>이제 무엇을 <br>할 수 있나요?</h2>` +
		`<div class="ability-options"></div><label class="nickname-label" for="nickname">별명 (선택 · 16자까지)</label><input id="nickname" maxlength="16" autocomplete="off" value="${escapeHTML(store.save.nickname)}" placeholder="공기 엔지니어">` +
		`<div class="certificate-actions"></div></aside></div>`;
	host.querySelector('.ability-options').append(choices(['실험 기록을 비교해 설명할 수 있어요.','조건을 바꾸고 부피 변화를 관찰할 수 있어요.','공기의 성질로 장치를 만들 수 있어요.'],value=>{store.save.ability=value;persist();
	host.querySelector('.certificate-ability').textContent='나는 이제 '+value;},{selected:store.save.ability}));
	host.querySelector('#nickname').oninput=e=>{store.save.nickname=e.target.value.slice(0,16);persist();
	host.querySelector('.certificate-name').textContent=store.save.nickname||'멋진 공기 엔지니어';};
	host.querySelector('.certificate-actions').append(button(`${icon('print')} 인증서 인쇄 / PDF 저장`,()=>window.print()));
}
