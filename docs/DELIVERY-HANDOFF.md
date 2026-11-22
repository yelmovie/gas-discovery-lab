# 기체 도시 대작전 · 납품 안내

기존 인계 문서(`HANDOFF.md`)는 없습니다. 기능 설명은 [README](../README.md), 기획은 [PRD](PRD.md)에 있습니다.

## 1. 한눈에

| 항목 | 내용 |
|---|---|
| 프로젝트 | 기체 도시 대작전 (과학34 15번, 폴더 `15 gas`, 패키지 이름 `gas-city-adventure` v1.3.1) |
| 운영 주소 | https://gas-discovery-lab.yelsam.workers.dev |
| 저장소 | 이 폴더의 Git 저장소(`main` 브랜치). 원격 주소는 시트 H열 「깃허브 공개 코드」 |
| 현재 앱 커밋 | `44aafd6` (2026-11-22, 영상 자막 겹침 제거). 이 문서 커밋 전 기준입니다. |
| 마지막 점수 | 총점 89, 실기기 제외 96 (`docs/reviews/SCORE-20261121.md`, 앱 `109d368` 기준) |

운영에 마지막으로 반영한 커밋이 위 앱 커밋과 같은지는 이번에 확인하지 않았습니다(확인 필요). 다른 세션이 영상 자막을 고쳐 배포하는 중이었습니다.

## 2. 폴더 구조

배포되는 것(`scripts/build.mjs`가 `dist/`로 만듦)
- `index.html`, `src/`(화면 코드와 CSS), `public/`(`assets/` 그림·영상·음악·효과음·목소리·글꼴, `_headers`, `manifest.webmanifest`)
- `worker/media-range.js` 영상 Range 처리(Worker 코드)

보관용(배포되지 않음)
- `asset-bank/` 원본 그림과 프롬프트, `references/` 참고 자료와 Suno 원본, `films/`, `output/`
- `docs/` 기획, 검수, 점수, 권리 장부, 영상 기록, `scripts/` 빌드·검사 도구, `tests/` 단위 테스트, `thumbnails/`

## 3. 실행·빌드·검사 명령

`package.json`에서 확인한 것입니다. Node.js 20 이상이 필요합니다(선택 의존성 `sharp`).

| 명령 | 하는 일 |
|---|---|
| `npm run dev` | 개발 서버(http://127.0.0.1:4176) |
| `npm run build` | `dist/` 생성 |
| `npm run preview` | `dist/` 배포본 확인 |
| `npm test` | 단위 테스트(`node --test tests/*.test.mjs`) |
| `npm run qa:browser` `qa:layout` `qa:responsive` `qa:playback` `qa:run-stage` | 브라우저 검사(학습 흐름, 배치, 반응형, 재생, 3D 산길) |
| `npm run media:render` `media:render:v2` `media:verify` | 개념 영상 만들기와 확인 |
| `npm run assets:prepare` | 그림 준비 |

## 4. 배포

- 호스팅: Cloudflare Workers(정적 자산 + Worker). Worker 이름 `gas-discovery-lab`.
- 설정 파일: 저장소 안에는 `wrangler` 설정이 없습니다. 설정은 `_scratch/deploy-20261118/cfg/15.json`에 있습니다(정적 자산 폴더 `dist`, 진입점 `worker/media-range.js`, 자산 바인딩 `ASSETS`).
- 배포 명령: `_scratch/deploy-20261118/deploy.sh 15 "15 gas" worker-cfg gas-discovery-lab` 형식(다른 프로젝트 배포 기록과 같은 방식. 15번 마지막 실제 명령은 `deploy-15-*.out` 확인 필요).
- 영상 Range 처리: `worker/media-range.js`. 정적 자산은 Range 요청에 전체 파일(200)을 돌려주어 영상 탐색이 안 되므로, `/assets/concepts/*`, `/assets/concepts-v2/*`, `/assets/map-encounters/*`, `/assets/films-story/*`를 Worker가 먼저 받아 206 조각으로 답합니다.
- 이 저장소에는 푸시로 배포를 실행하는 워크플로가 없습니다. 푸시만으로는 운영이 바뀌지 않습니다.

## 5. 다른 호스팅으로 옮길 때 챙길 것

- 정적 파일 폴더: `npm run build`가 만든 `dist/` 전체(`_headers` 포함).
- 서비스 워커·캐시: 오프라인 준비 코드(`src/offline.js`)가 있습니다. 연결 상태에서는 HTML, 실행 코드, 글꼴을 서버에서 먼저 확인합니다.
- Range 처리: mp4, webm 요청에 `Range`를 지원해야 합니다.
- 환경 값: 서버, 데이터베이스, 비밀 값은 없습니다. 기록은 학생 기기의 브라우저에만 저장됩니다.

## 6. 버전과 변경 이력

앱 버전은 `1.3.1`입니다. 최근 주요 변경(`git log`)

- 2026-11-22 `44aafd6` 인트로·파이널 영상 자막 겹침 6건 → 0
- 2026-11-22 `282992d` 파이널 영상 2장면을 Gemini 영상으로 교체(임시 장면 0)
- 2026-11-21 `f1af076` 산길 소품을 Meshy 3D 모형으로
- 2026-11-21 `7136b6b` 인증서 화면 함수를 `certificate.js`로 분리(동작 같음)
- 2026-11-21 `524db75` 인트로·파이널 한 편 영상(전체 화면, 자막, 목소리)
- 2026-11-21 `109d368` 배송 힌트 문구 개선과 첫 시도·다시 찾기 표시, 4번 시설 끌어 넣기
- 2026-11-18 성취 카드(악당 격퇴 보상) 추가
- 2026-11-17 3D 산길 스테이지, Suno 배경음 2곡
- 2026-11-16 학습 흐름 정리
- 2026-10-28 이미지 고도화와 반복 클릭 줄이기

## 7. 권리·출처

[권리 장부](RIGHTS-LEDGER-20261121.md)에 배포되는 그림, 영상, 음악, 효과음, 목소리, 글꼴 35줄이 있습니다. 한 줄 요약: 확인됨 28줄, 근거 약함 7줄, 출처 미확인 0줄입니다. 근거 약함은 Higgsfield로 만든 소품 그림 2장, Suno 배경음(요금제 화면 증빙), 지도 악당 효과음(CREDITS 누락), 목소리 묶음(요금제·모델 라이선스 원문)입니다.

## 8. 알려진 한계와 남은 일

`docs/reviews/SCORE-20261121.md`의 남은 감점입니다.

- C4: 폰 가로 915×412 교사 시연에서 「공기 장치 미션」이 교사 도구 밑에 깔립니다(학생 화면은 해당 없음).
- E2: 300자가 넘는 압축형 줄이 일부 남아 있습니다.
- 자료 대기: 교사 검수(A12), Qwen3-TTS 라이선스 원문 사본과 Higgsfield 요금제 기록(F11).
- 실기기·수업 대기: 학생 난이도(A6), 수업 진행(B16), 저사양 태블릿과 실기기 FPS, 실제 손가락 조작(B19).

## 운영 대조 기록 (2026-11-22 12:56)

- 조율 세션이 운영 주소의 `index`와 스크립트·스타일 파일 40개를 저장소 `origin/main`과 대조했습니다. 결과는 모두 일치입니다(불일치 0).
- 위 본문에 「운영 반영 확인 필요」로 적힌 칸은 이 대조로 확인된 것입니다. 이후 앱을 다시 배포하면 `_scratch/final-recheck-20261120/prodcmp.sh 15`로 다시 대조합니다.
