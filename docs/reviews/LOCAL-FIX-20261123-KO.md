# 15번 기체 도시 대작전 — 최종 공개판 검수 후 로컬 수정

2026-11-23 공개판에서 다시 재현한 항목 A1~F를 수정한 로컬 검증 기록입니다. 운영 배포 완료나 교사 과학 검수 완료를 뜻하지 않습니다.

## 기준과 작업 공간

- 원격: `https://github.com/yelmovie/gas-discovery-lab.git`
- 운영: `https://gas-discovery-lab.yelsam.workers.dev/`
- 별도 얕은 복제: `/Users/yel/Documents/Codex/2026-11-23/task-8/gas-discovery-lab-fix`
- 로컬 브랜치: `fix/student-review-20261123`
- 시작 기준 HEAD: `0df2fb797f2cd57d7a61e34627ce13846fa7015a`; 앱 코드: `895c18d02800adc4aa52ae0bf311b704435eddb4`; v1.3.1.
- 시작 시 운영 HTML·JS·CSS 69개가 해당 HEAD와 바이트 단위로 일치했습니다. 운영 revision은 `e0818e1390f71afb`, 자산은 393개였습니다.
- 06:37 UTC 재확인에서도 원격 HEAD와 운영 revision·버전·자산 수가 같았습니다.
- 입력 문서: `/tmp/gas-audit-20261123-w2ZdaF/FIX-PROMPT-KO.txt`, 같은 폴더의 `REVIEW-KO.md`. 11월 11일 별도 설계 초안을 적용하지 않았습니다.
- 기존 사용자 작업 폴더·다른 프로젝트·Mac 화면·앱 설정은 변경하지 않았습니다. push·운영/프리뷰 배포·시트 수정·외부 발송은 하지 않았습니다.

## 수정과 확인

| 항목 | 구현 | 확인 결과 |
|---|---|---|
| P1 힌트, 영상 버튼 대비 | 힌트 말풍선 자체에 불투명한 글자색을 지정했습니다. 공통 유리 버튼 스타일에서 영상 건너뛰기를 제외하고 불투명한 어두운 배경을 사용합니다. | 다섯 시설 × 세 해상도 × 힌트 세 단계·닫기·재열기, 목소리 꺼짐. 제목·본문 11.32:1, 다음 힌트 7.19:1. 인트로·엔딩 건너뛰기 10.54:1. |
| P2 최초 코어 완료일 | `finaleCompletedAt`을 최초 복구 레버에서만 저장합니다. 인증서가 마지막 의뢰 날짜 대신 이 값을 사용합니다. | 11/23 의뢰 완료 → 11/24 최초 코어 → 11/25 배송 4번 Tab·Enter 재탐구에도 11/24 유지. 새로고침·역량 선택·PDF·PNG·초기화 확인. 예전 저장의 없는 날짜는 「날짜 기록 없음」. |
| P2 산악 복귀 | 도달한 안전 체크포인트 1~3을 저장하고, 유효 범위만 복원합니다. 예상·오답 횟수와 관찰 기록을 함께 보존합니다. | 중간 1·2와 정상 3에서 기록 전 새로고침, 낙하 복귀, 비교 중 오답 후 새로고침을 확인했습니다. 복원만으로 관찰·완료 증거가 생기지 않습니다. |
| P2 산악 2D | `mountain-classic.js`가 같은 밀봉 봉지의 산 아래/산꼭대기를 보여 줍니다. 예상 → 관측 지점 선택 → 직접 기록 → 전이 질문 순서입니다. 3D와 `runEvidence` 판정을 공유합니다. | WebGL·WebGL2 실제 비활성 세 해상도, 움직임 줄이기의 Tab·Enter만으로 완주, 명시적 2D 전환, 실행 중 WebGL 손실, 오답 재시도, 연결 중단 후 재연결·새로고침 확인. 기록값 1 → 1.35, 같은 정답·오답 횟수. |
| P2 공작소 밸브·대체 조합 | 상태를 「밸브 열림」으로 표시하고, 목표까지 가는지는 별도 오류 안내·장치 움직임·발견 결과로 구분합니다. 교사용 문서의 인정 조건을 실제 판정과 맞췄습니다. | 막힌 관, 굽은 관이 필요한 경로, 잘못된 공급부·노즐 방향에서 완료·성공 효과 없음. 1번 풍선+굽은 관 대안과 4번 풍선+일자 관도 인정됩니다. 부품 수정 후 나머지 선택을 보존합니다. `validateDevice`는 바꾸지 않았습니다. |
| P3 인증서 공백 | `<br>` 앞 일반 공백을 보존합니다. | 1024×600에서 「이제 무엇을 할 수 있나요?」가 이어져 보이고 브라우저 접근성 이름도 같은 문장입니다. 나머지 두 해상도도 확인했습니다. |

관련 코드: `src/state.js`, `src/completion-date.js`, `src/certificate.js`, `src/run-stage/mountain-rules.js`, `src/run-stage/mountain-run.js`, `src/run-stage/mountain-classic.js`, `src/activities/climate.js`, `src/activities/engineering.js`, `src/stage-layout.css`, `src/glass-ui.css`, `src/climate-visuals.css`.

저장 호환의 상세 규칙은 [SAVE-COMPATIBILITY-20261123.md](SAVE-COMPATIBILITY-20261123.md)에 있습니다. 공작소 인정 조건은 [교사용 가이드](../TEACHER-GUIDE.md)와 [기존 교사 검수표](../TEACHER-REVIEW-20261121.md)의 해당 표에 반영했습니다. `CONTENT_REVIEW.needsReview: true`는 유지했습니다.

## 로컬 검증

- `npm test`: 100/100 통과. 새 완료일 검사 5개와 산악 저장·판정 검사 3개를 포함합니다. 잘못된 날짜, 이전 저장, 교사 시연의 날짜 생성 방지, 초기화, 범위 밖 체크포인트도 검사합니다.
- `npm run build`: 통과. v1.3.1, 395개 자산, revision `f8bcefd0cf0fd84e`. 기존 그림을 재사용하며 새 런타임 의존성은 없습니다. 산출물은 로컬 `dist/`에만 있습니다.
- `git diff --check`, 변경 QA 스크립트 구문 검사: 통과.
- 브라우저: Chrome 157.0.8103.79 헤드리스. 새 브라우저 저장 상태와 별도 컨텍스트를 사용했습니다. 로컬 개발 서버는 `http://127.0.0.1:42715`였습니다.
- 학생 경로 최종 실행: 새 빈 저장에서 시작해 의뢰 20개, 지도 성취 카드 5장, 선택 공방 3개, 코어, 전체 엔딩 영상, 인증서까지 한 번에 통과했습니다. 교사 해금이나 증거 주입 없이 터치·키보드 UI 입력을 사용했습니다. 정상/오답 재시도·준비/기록·재개 경로를 포함하며 미처리 브라우저 오류는 0개입니다.
- 산악 별도 검사: WebGL 없음, 시스템 움직임 줄이기, Tab·Enter, 3D 화면 방향패드·점프 터치, 낙하, 2D 전환, 컨텍스트 손실 모두 통과했습니다. 1280×800·1024×768·1024×600을 사용했습니다.
- 기존 자동재생 보조 회귀: 20개 의뢰의 자동 선택·자동 완료 방지, 정지/속도 변경/수동 중단/활동 이탈 통과. 이 검사는 합성 진행 fixture를 사용하며, 위 학생 경로의 완료 증거로 대신하지 않았습니다. 기존 교사 빠른 이동의 별도 회귀도 통과했습니다.
- 인증서: 실제 다운로드 버튼으로 PNG 3종 저장(2400×1697). 최초 완료·다음 날 재탐구 후·예전 저장의 PDF 3종이 모두 A4 가로 1쪽(841.92×594.96 pt)이며 날짜 텍스트를 PDFKit으로 읽었습니다. 인증서 표시 애니메이션과 글꼴 로딩이 끝난 상태에서 출력하고 렌더 이미지를 확인했습니다. 인쇄/PDF 버튼의 `beforeprint` 호출도 별도 확인했습니다.
- 각 최종 브라우저 검사에서 미처리 `pageerror`는 0개입니다.

재현 명령(로컬 서버와 Playwright 설치 필요):

```sh
PORT=42715 node scripts/serve.mjs
QA_URL=http://127.0.0.1:42715 PLAYWRIGHT_MODULE=/Users/yel/.local/node/lib/node_modules/playwright node scripts/qa-student-review.mjs
QA_URL=http://127.0.0.1:42715 PLAYWRIGHT_MODULE=/Users/yel/.local/node/lib/node_modules/playwright QA_VARIANTS=mountain-no-webgl node scripts/qa-review-variants.mjs
QA_URL=http://127.0.0.1:42715 PLAYWRIGHT_MODULE=/Users/yel/.local/node/lib/node_modules/playwright QA_VARIANTS=mountain node scripts/qa-review-variants.mjs
QA_URL=http://127.0.0.1:42715 PLAYWRIGHT_MODULE=/Users/yel/.local/node/lib/node_modules/playwright QA_VARIANTS=mountain-touch node scripts/qa-review-variants.mjs
QA_URL=http://127.0.0.1:42715 PLAYWRIGHT_MODULE=/Users/yel/.local/node/lib/node_modules/playwright QA_VARIANTS=certificate node scripts/qa-review-variants.mjs
```

완료일 검사는 브라우저 Date만 11/23 → 11/24 → 11/25로 에뮬레이션합니다. Mac 날짜·시간은 바꾸지 않습니다. 예전 저장 브라우저 검사는 최초 공개판 검수에서 실제 학생 완주로 얻은 `student-final.json`을 `QA_LEGACY_STATE`로 전달했습니다. 새 학생 저장은 증거를 주입하지 않고 UI 조작으로 만들며, 산악·인증서 분기 검사는 그 저장의 복사본을 사용합니다.

검토 증거는 이 작업 공간의 `.tmp/review-fix-20261123/`에 있습니다. `baseline-match.json`, `production-final-read.json`, `student-journey.json`, `variants-mountain*.json`, `variants-certificate*.json`, `certificate-pdf-check.json`, `certificate-png-check.json`, `unit-tests.txt`, `build.txt`와 화면·PDF·PNG 파일을 확인할 수 있습니다. 이 대용량 임시 증거는 커밋에 포함하지 않습니다.

## 유지한 기준과 미검증

기존 의뢰 20개, 선택 공방 3개, 코어·엔딩·인증서 흐름을 유지했습니다. 산악의 「공기 양·온도 일정」 안내, 저울의 모형값 안내, 이미 개선된 배송 오답 힌트·음원, 교사 검수 상태를 불필요하게 바꾸지 않았습니다. 과학 판단은 기존 `volumeFor`, 관찰 기록과 [2022 개정 성취기준의 기존 근거](https://www.goe.go.kr/resource/goe/na/bbs_2675/2026/01/cf91cfa4-7c97-4d9d-bb01-9ee0706adf17.pdf)(77쪽)에 맞춘 범위를 유지합니다.

실물 태블릿·iPad Safari, 실제 음성 청취, 실물 프린터와 OS 인쇄 대화상자, 실제 스크린리더 음성은 이번에 검증하지 않았습니다. 터치는 가로 화면의 Chrome 에뮬레이션이고, 읽기 도구 관련 검사는 브라우저 접근성 이름의 확인입니다. 연결 중단 검사는 열린 2D 화면에서 오프라인 조작 후 재연결·새로고침한 범위이며, 교실 네트워크나 완전 오프라인 최초 실행을 실물 검증한 것은 아닙니다.
