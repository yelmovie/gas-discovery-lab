# 15 기체 도시 대작전 — 문장 줄바꿈 균형 (2026-11-19)

공통 지침: `_shared/LINEBREAK-BALANCE-20261119.md`. 문구·대사는 바꾸지 않고 줄바꿈 위치만 고쳤다.

## 측정 방법

- **하네스(잠금 불필요)**: 같은 출처 페이지에 크기 지정 iframe을 띄워 첫 화면 → 이야기 3장 → 첫 지도 → 설정 → 지도 → 연구시설 5곳 소개 → 의뢰 20개(3D 산길은 기본·기존 방식 둘 다) → 마지막 의뢰 → 엔딩 3장 → 인증서 → 홈을 차례로 열고 `measure.js`를 돌렸다. 크기마다 39화면, 3개 크기 117화면.
- **Playwright(브라우저 잠금 안)**: 기존 `qa-learning`(20개 의뢰 실제 풀이·탐구 완료 결과·개념 영상·마지막 의뢰·인증서), `qa-layout`, `qa-screens`, `qa-run-stage`를 `measure.js` 주입 래퍼(`PLAYWRIGHT_MODULE`)로 그대로 돌리고, 보충 순회(첫 화면·이야기·설정·엔딩·인증서)를 더했다.
- 크기: 1280×800, 1920×1080, 1024×768. 전 = 운영(d26e0be)과 같은 HEAD, 후 = HEAD + 이번 변경만 담은 사본.
- 도구·결과: `.tmp/linebreak-20261119/`(harness.html, pw-measure.cjs, extra.mjs, run-all.sh, before/, common/, after/).

## 전/후 문제 수

| 크기 | 전(실제 문제) | 후(실제 문제) | 후 남은 표시(전부 오탐) |
|---|---|---|---|
| 1280×800 | 14 | 0 | 4 |
| 1920×1080 | 2 | 0 | 3 |
| 1024×768 | 10 | 0 | 6 |

전에는 도구가 37건을 잡았고 그중 11건이 오탐(아래)이었다. 실제 문제 26건은 거의 모두 2줄 문단 끝에 「찾아요.」「비교해요.」「주세요.」처럼 한 낱말만 떨어진 경우였다.

## 고친 곳

- `src/korean-linebreak.css`: 공통 파일 복사(위쪽 그대로) + 아래 「프로젝트 보정」.
- `index.html`: 다른 스타일보다 먼저 링크. `scripts/build.mjs`는 `src/`를 통째로 복사하므로 dist·`sw.js` 목록에 자동으로 들어간다(확인함).
- 프로젝트 보정(`text-wrap-style: balance` — 부모의 nowrap은 덮지 않음). Chrome의 `pretty`는 2줄 문단의 짧은 끝줄을 고치지 않아서 짧은 안내 문단에 balance를 줬다.

| 선택자 | 화면 | 전 → 후 예 |
|---|---|---|
| `.stage-brief > p` | 연구시설 소개 4곳 | 「…알맞은 쓰임을 / 찾아요.」 → 두 줄 고르게 |
| `.discovery-result > p` | 의뢰 완료 결과 | 「…기체에도 / 무게가 있어요.」 |
| `.finale-body > p` | 마지막 의뢰 | 「…증거를 모아 / 주세요.」 |
| `.delivery-layout .facility-copy p` | 기체 배달 의뢰 4개 | 「…기체를 / 찾아요.」 |
| `#next-action-guide` | 다음 행동 안내(1024 등) | 「…바람이 바로 / 따라가요.」 |
| `.run-stage .run-predict p` | 3D 산길 예측 | 「…고르면 / 바로 출발해요.」 |
| `.run-stage .run-bag figcaption` | 3D 산길 봉지 이름(1024) | 「밀봉한 과자 / 봉지」 → 「밀봉한 / 과자 봉지」 |
| `.engineering-layout .slot-drop-hint` | 공기 공작소 칸 | 「여기로 끌어 / 놓기」 → 「여기로 / 끌어 놓기」 |

- 다른 세션이 작업 중인 `src/stage-layout.css`·`src/glass-ui.css`·`src/run-stage/run-stage.css`는 건드리지 않았다(겹치는 규칙 없음 확인).

## 남은 것(오탐·통과로 판단)

- 단어끊김 표시 9건: `<br>`로 뜻 단위로 끊은 문장(첫 화면 「…직접 만든 장치로<br>다섯 연구시설과…」, 저울 기록 빈칸, 기체 정보 빈칸). 실제로는 띄어쓰기 자리에서 바뀐다.
- 짧은 2줄 라벨 3종: 「여기로 / 끌어 놓기」「밀봉한 / 과자 봉지」「이산화 / 탄소」 — 두 줄 길이가 같거나 낱말 두 개짜리 용어라 균형이 맞다(4자 이하 기준에만 걸림).
- 마지막 의뢰 상태 문장 「…마지막 레버를 / 당겨요. [다시 듣기]」: 음성 줄(인라인 스타일 `inline-flex`)이 같은 줄을 채워서 화면에선 끝줄이 짧아 보이지 않는다. 음성 줄을 블록으로 떼는 규칙을 시험했으나 906×755에서 패널이 26px 넘쳐 되돌렸다(33f62de).
- 영상에 구운 자막·캔버스 글은 이번 범위 밖(측정 대상 아님).
- 공통 파일 참고(루트 세션용): 06 메모와 같이 프로젝트 보정은 `text-wrap-style`로 줘서 nowrap 부모를 덮지 않게 했다. 인라인 음성 버튼이 문단 안에 붙는 구조는 balance 계산에 버튼 폭이 들어간다.

## 검증

- `npm test` 88/88 통과, `npm run build` 368파일(새 CSS·`sw.js` 목록 포함).
- 후 Playwright: `qa-learning` PASS(20개 의뢰·영상·마지막 의뢰·인증서), `qa-run-stage` PASS, `qa-layout` 0건(음성 줄 규칙 제거 뒤 906×755 마지막 의뢰 넘침 0 재확인), `qa-screens` 통과.

## 커밋·배포

- 커밋: `955cec6`(줄바꿈 균형), `33f62de`(마지막 의뢰 음성 줄 원복).
- 배포: `_scratch/deploy-20261118/deploy.sh 15 "15 gas" worker-cfg gas-discovery-lab` → Cloudflare 버전 `905eaaa0-466f-4a1a-802a-fadfd0625db5`, 소스 `33f62de`(중간 배포 `d092e75b`는 955cec6).
- 운영 확인: `cmp.sh` — `src/korean-linebreak.css` build=live `6e5bc23c90fbc583` MATCH, `sw.js` MATCH, index MATCH. 운영 index에서 `korean-linebreak.css`가 첫 스타일시트.
