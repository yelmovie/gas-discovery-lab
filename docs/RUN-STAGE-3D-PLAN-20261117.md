# 15 기체 도시 대작전 · 3D 달리기 스테이지 계획 · 2026-11-17

**현재 단계: 구현·배포 완료(2026-11-17).** 아래 「계획 확정」과 문서 끝의 「구현 결과」가 실제 구현이고, 그 앞의 계획 부분은 처음 계획을 그대로 남긴 것이다. 공통 규격은 [공통 계획](../../_shared/RUN-STAGE-3D-PLAN-20261117.md)에 있다.

## 한 줄 요약

환경 관측소의 의뢰 「높은 산의 과자 봉지」를, 과자 봉지를 들고 산길을 오르내리며 높이에 따라 봉지 크기가 달라지는 것을 직접 보는 3D 달리기로 바꾼다.

## 바꿀 자리

- 4학년 「여러 가지 기체」(4과15-01~04). 연구시설 5곳 × 의뢰 4개 = 20개 의뢰.
- 대상은 환경 관측소의 네 번째 의뢰 `climate-4` 「높은 산의 과자 봉지」다. 전체에서 12번째이고 필수다. 담당 캐릭터는 고양이 연구원 루미다.
- 파일: `src/activities/climate.js`(`mountClimate`). 불러오는 곳은 `src/screen-loaders.js`의 `loadActivity`, 화면에 올리는 곳은 `src/main.js`의 `showActivity`(183행 부근), 완료 콜백은 `main.js` 194행 부근의 `complete:`다.

### 다른 후보를 고르지 않은 이유

- **관 연결 퍼즐(`src/play-mission.js`):** 처음 추천 때 후보로 들었지만, 20개 의뢰 밖의 별도 공방이고 진입 함수 `missionEntry()`를 부르는 곳이 없어 지금은 화면에 들어가는 버튼이 보이지 않는 것으로 조사됐다. 살리려면 진입부터 새로 만들어야 해서 뺐다.
- **무게 연구소:** 공기량 한 칸의 차이가 0.08g이라서 점프 높이 같은 조작에 연결하면 차이를 과장하게 된다.
- **`climate-3` 「피스톤으로 눌러 보아요」:** 제자리에서 누르는 조작이라 달리기와 맞지 않는다.

## 지금 방식과 바뀐 방식

| | 지금 | 바꾼 뒤 |
|---|---|---|
| 조건 바꾸기 | 슬라이더를 끌어 조건을 0~2로 바꾸고 놓으면 기록된다 | 산 아래·중턱·꼭대기 세 관측 지점까지 걸어 올라가 '기록' 버튼을 누른다 |
| 완료 | 처음 조건과 목표 조건의 기록이 둘 다 생기면 새 상황 질문이 나오고, 맞히면 끝난다 | 같다 |
| 화면 | 2D 실험 화면 | 관측소에서 산꼭대기까지 이어진 3D 산길 |

## 과학 개념과 조작

| 개념 | 달리기에서 하는 일 |
|---|---|
| 기체에 가하는 압력이 달라지면 부피가 달라진다 | 높은 곳으로 갈수록 든 봉지가 부풀고, 내려오면 다시 줄어든다 |
| 조건을 하나만 바꿔 비교한다 | 같은 봉지를 들고 높이만 바꾼다. 두 지점의 기록을 나란히 본다 |

### 지켜야 할 제한

- `docs/TRD.md` 63~66행: "빛은 경로 표시로 사용하며 기체 입자를 뜻하지 않아", "정확한 가상 수치와 오차 모델은 교육 검토 후 확정해", "압력 비교와 동시에 여러 조건을 바꾸지 않아".
- `src/data.js` 9행: "입자 모형 설명은 범위 밖". 봉지 안에 알갱이를 그리지 않는다.
- 봉지 크기는 걸어간 거리에 따라 매끄럽게 변하게 보이되, 기록되는 값은 기존 조건 0·1·2 세 단계와 기존 모형의 값만 쓴다.
- 실제 산에서는 기온도 함께 달라진다. "압력 비교와 동시에 여러 조건을 바꾸지 않아"를 지키려면 화면에 온도 조건이 같다는 표시가 있어야 한다. 기존 `climate-4` 화면이 이 점을 어떻게 다루는지 먼저 확인하고 같은 문구를 쓴다.
- 자동재생은 학생이 직접 조작하는 단계 앞에서 멈추게 되어 있다. 달리기 구간은 자동으로 진행하지 않고, 기존 자동재생의 동작은 바꾸지 않는다.

## 코스 구성

1. **출발 전 예상:** 꼭대기에서 봉지가 어떻게 될지 고른다.
2. **산 아래 관측 지점:** 봉지 크기를 기록한다(처음 조건).
3. **산길:** 돌계단과 통나무 다리를 걷고 뛰어 오른다. 오르는 동안 봉지가 조금씩 부푼다.
4. **목표 관측 지점:** 의뢰가 정한 높이에서 다시 기록한다. 두 기록이 나란히 놓이고 예상과 비교한다.
5. **새 상황 질문:** 기존 질문을 그대로 낸다.

내려가면 봉지가 다시 줄어드는 것도 볼 수 있다. 방해꾼은 지도 악당 스프라이트를 써서 산길 한 구간을 오가게 한다. 닿으면 움찔만 하고 기록은 바뀌지 않는다.

## 연결과 저장

- 저장 키는 localStorage `gas-city-adventure-v1`이다. 진행 중 상태 `drafts['climate-4'] = {condition, records}`와 완료 기록 `evidence[stageId]`의 `{taskId, summary…}`를 그대로 쓴다.
- 관측 지점에서 '기록'을 누르면 기존 슬라이더를 놓았을 때와 같은 기록 함수가 불리게 한다.
- 대체 화면은 기존 `climate.js`의 2D 화면이다. 이 프로젝트에는 WebGL 대체 처리가 아직 없으므로 새로 만든다.

## 이미지 생성·적용 목록

지도는 2.5D 픽셀이고 활동 화면은 2D 그림이다. 참고 그림은 `public/assets/student-walk.webp`, `public/assets/air-walk.webp`, `public/assets/air-portrait.webp`다. 루미의 그림 경로는 작업을 시작할 때 `src/ui.js` 11행 부근에서 찾는다.

| 번호 | 그림 | 종류 | 적용 위치 |
|---|---|---|---|
| 1 | 학생 대기(봉지를 든 모습) | 캐릭터 동작 줄 | 서 있을 때 |
| 2 | 학생 걷기(봉지를 든 모습) | 캐릭터 동작 줄 | 이동 |
| 3 | 학생 점프 | 캐릭터 동작 줄 | 점프 |
| 4 | 학생 기뻐하기 | 캐릭터 동작 줄 | 기록 완료 |
| 5 | 루미 안내 | 캐릭터 동작 줄 | 관측 지점의 동료 |
| 6 | 과자 봉지(납작함, 보통, 부풂) | 소품 3장 | 손에 든 봉지, 기록 카드 |
| 7 | 관측 지점 표지대(글자 없이) | 소품 | 세 관측 지점 |
| 8 | 산길 흙과 풀 무늬 | 바닥 무늬 | 길 |
| 9 | 돌계단 무늬 | 바닥 무늬 | 계단 |
| 10 | 통나무 다리 | 소품 | 다리 |
| 11 | 산 원경(먼 산과 구름, 가까운 나무) | 원경 2장 | 배경 |
| 12 | 꼭대기 관측소 | 소품 | 도착 지점 |
| 13 | 시작 카드 그림 | 시작 카드 | 의뢰 들어갈 때 |

봉지의 중간 크기는 세 장을 코드에서 크기만 바꿔 보여 준다. 봉지에 상표나 글자를 넣지 않는다. 생성 원본은 이 프로젝트의 규칙대로 `asset-bank/original/generated-20261117/`(Git 제외)에, 실행 파일은 `public/assets/run-stage/`에 둔다. 예상 16장.

## 기술, 검증, 배포

- **Three.js가 없는 프로젝트다.** 설치 없는 구조라서 로컬 파일로 넣는다. 06번이 쓰는 `three.module.min.js`(r170)와 같은 판을 `src/vendor/three/`에 두고 라이선스 파일을 함께 넣는다.
- 빌드가 `public`과 `src`를 복사한 뒤 전체 파일을 훑어 `sw.js`와 `offline-manifest.json`을 자동으로 만든다(`scripts/build.mjs` 14~27행). 새 파일을 따로 등록할 필요가 없다.
- 방향판은 `src/map-controls.js`를 다시 쓴다(`src/map.js` 95행 부근이 쓰는 방식). 길게 누르기는 `src/touch.js`의 `repeatPress`가 있다.
- 검증 명령: `npm test`, `npm run build`, `npm run qa:browser`, `npm run qa:layout`, `npm run qa:responsive`, `npm run qa:playback`.
- 운영 주소는 https://gas-discovery-lab.yelsam.workers.dev/ 이다. Cloudflare Workers이고 `wrangler.jsonc`가 없다. 배포 절차는 `docs/reviews/RELEASE-REVIEW-20261112.md`를 따른다.

## 작업 순서

1. 기존 `climate-4` 화면에서 조건 0·1·2의 뜻, 봉지 크기 값, 온도 조건 문구 확인
2. Three.js 로컬 파일 추가, WebGL 확인과 대체 화면 연결
3. 규칙 연결: 관측 지점 도착과 '기록'을 기존 기록 함수로 넘기는 부분과 테스트
4. 기본 도형으로 산길을 만들어 끝까지 해 보기
5. 이미지 생성·적용
6. 대체 화면, 새로고침 후 이어 하기, 자동재생, 교사용 넘기기 버튼 확인
7. 검증 명령 → 커밋·푸시 → 운영 배포 → 운영 주소 확인

## 시작 전에 확인할 것

- `climate-4`의 조건 0·1·2가 "높이 세 단계"로 그대로 대응되는지 확인하지 못했다. 대응되지 않으면 관측 지점 수와 배치를 다시 잡는다.
- 2026-11-16 학습 흐름 정리에서 의뢰당 조작 수를 줄였다. 산길을 걷는 시간이 그 방향과 어긋나지 않게 코스를 짧게(관측 지점 사이 10초 안쪽) 잡는다.
- 운영 시트 G·H열의 주소와 저장소를 대조한다.

## 계획 확정 (2026-11-17 구현 세션, 코드 대조 결과)

코드를 읽어 계획을 실제와 맞췄고, 아래 결정대로 구현했다.

### 코드에서 확인한 것

- `climate-4`는 `mode:'pressure'`, `baseline` 없음(기본 1), `target:0`이다. 조건 뜻은 0 낮은 압력, 1 보통 압력, 2 높은 압력이고 부피 값은 `volumeFor('pressure',c)` = 1.35 / 1 / 0.66이다(`src/model.js`).
- **조건 0·1·2는 "높이 세 단계"로 대응되지 않는다.** 처음이 1(보통 압력)이고 목표가 0(낮은 압력)이라 높이로는 산 아래(1) → 산꼭대기(0) 두 단계다. 조건 2(높은 압력, 0.66)는 걸어서 갈 수 있는 높이로 표현하면 사실과 달라진다(1.5기압에 해당).
- 완료 조건은 `validVolumePair(records,task)`(처음 조건과 목표 조건 기록이 둘 다 있음) 뒤에 새 상황 질문의 정답을 고르는 것이다. 조건 2 기록은 완료에 필요 없다. 처음 조건 기록은 화면을 열 때 자동으로 들어간다(`climate.js` 9행).
- 기록 모양은 `{condition, ratio: volumeFor(mode,condition)}`, 초안은 `ctx.saveDraft({condition,records})`, 완료는 `ctx.complete(task.why,{mode:task.mode,records,transfer:value})`이다. 완료 결과 카드는 `main.js`가 `.transfer-slot`을 찾아 그 자리에 넣는다.
- 일정 조건 문구는 화면의 `공기 양·온도 일정`과 힌트 `기체의 양과 온도는 같게 두고 바깥 압력만 바꿔요.`다. 달리기 화면에도 같은 문구를 쓴다. "학습용 모형" 문구는 이 프로젝트 `src`에 없다.
- 자동재생은 `ctx.playback({steps,onStop})`으로 등록한다. `main.js`의 교사용 방향키는 `window` keydown에서 `defaultPrevented`가 아니면 화면을 넘긴다.
- `bindDirectionPad`는 화면 버튼의 누름·뗌만 콜백으로 주고, 키보드는 눌린 표시만 한다. 키보드 이동은 따로 받아야 한다.
- CSP는 `script-src 'self'`라서 로컬 three 모듈은 그대로 불러올 수 있다.
- QA 스크립트 `qa-learning`·`qa-responsive`·`qa-voices`는 climate 네 의뢰 모두에서 `.condition-slider`를 직접 조작한다. `climate-4`가 3D로 먼저 열리면 이 스크립트들이 깨지므로 「기존 방식으로 하기」를 누르는 한 줄을 넣어야 한다. `qa-playback`은 자동재생이 기존 화면으로 넘어가게 만들면 고치지 않아도 된다.
- 배포 절차는 `.tmp/release-20261117/wrangler.json`(이름 `gas-discovery-lab`, `assets.directory`가 `dist`)을 `wrangler deploy --config <그 파일> --message "<커밋>"`으로 올리는 방식이다(직전 배포 로그 `.tmp/wrangler-logs/`에서 확인). 직전 배포의 대응 커밋은 `dc837bb`다.
- 도구: `sharp`는 이 폴더에 없다(`/Volumes/T7 Shield/iscreammedia_sc34/13 nightsky/node_modules/sharp`를 `SHARP_MODULE`로 지정해 쓴다). `playwright-core`는 `/Volumes/T7 Shield/DevCaches/playwright-runner/node_modules/playwright-core`. `ffmpeg`는 `/Users/yel/.local/node/bin/ffmpeg`.

### 정한 것

| 항목 | 결정 | 이유 |
|---|---|---|
| 관측 지점 | 2곳: 산 아래(조건 1, 자동 기록), 산꼭대기(조건 0, '기록' 버튼). 중턱은 기록 없는 쉼터이자 복귀 지점 | 조건이 높이 두 단계에만 대응된다. 중간 값은 기존 모형에 없어 기록할 수 없다 |
| 조건 2 | 달리기 코스에 넣지 않는다. 기존 2D 화면에서는 그대로 해 볼 수 있다 | 완료에 필요 없고, 걸어서 가는 높은 압력은 사실과 다르다 |
| 예상 | 시작 카드에서 한 번 고르면 바로 출발(더 부풀어요 / 그대로예요 / 줄어들어요). 초안에 `prediction`만 덧붙이고 완료 기록 필드는 그대로 | 조작 수를 늘리지 않으면서 예상 → 조작 → 비교를 지킨다 |
| three.js 위치 | `public/assets/vendor/three/three.module.min.js`(r170, 691,648바이트)와 `THREE-LICENSE.txt` | `/src/`는 서비스워커가 설치할 때 전부 미리 받는 목록이라 여기에 두면 첫 설치가 무거워진다. `public/assets`는 필요할 때 받고 오프라인 목록에도 자동으로 들어간다 |
| 충돌 | `Octree`·`Capsule` 없이 축에 맞춘 발판 상자의 윗면 높이로 계산. 프레임을 잘게 나누기, 0.05초 자르기, 바닥에서만 점프, 떨어지면 복귀는 `games_fps` 방식을 따른다 | 코스가 한 방향 발판뿐이라 충분하고, 추가 파일이 없으며 node 테스트로 검증할 수 있다 |
| 자동재생 | 달리기 화면에서 자동재생을 누르면 기존 2D 화면으로 바꾸고 기존 단계를 그대로 돌린다 | 자동 경로는 기존 화면으로 돈다는 공통 규칙 |
| 교사 시연 | 교사 모드에서는 방향키를 교사용 이동에 남기고 달리기는 WASD와 화면 버튼으로 한다 | 기존 교사용 방향키 기능을 깨지 않는다 |
| 캐릭터 | 기존 `student-walk.webp`(지도용 16칸)와 `lumi-portrait.webp`, 지도 악당 `map-encounters/villain-left.png`를 세운 그림으로 다시 쓴다. 봉지는 따로 띄운 그림이라 "봉지를 든" 캐릭터 줄은 만들지 않는다 | 지도와 같은 캐릭터가 이어지고 생성 장수를 줄인다 |

### 코스 설계표

앞으로 가는 거리 약 42, 걷는 속도 초당 약 6. 산 아래에서 쉼터까지 2~3초, 쉼터에서 꼭대기까지 4~6초.

| 구간 | 앞쪽 범위 | 높이 | 내용 |
|---|---|---|---|
| 산 아래 관측 지점 | 0~5 | 0 | 출발. 처음 기록(보통 압력)이 이미 있음. 루미 |
| 연습: 돌계단 | 5~12 | 0 → 2.4 | 낮은 계단은 걸어서 오르고 마지막 한 단만 점프 |
| 중턱 쉼터 | 12~17 | 2.4 | 복귀 지점. 봉지가 조금 부푼 것을 루미가 짚어 줌(기록 없음) |
| 적용: 통나무 다리 | 17~24 | 2.4 | 좁은 다리. 떨어지면 쉼터로 복귀 |
| 평지와 방해꾼 | 24~29 | 2.4 | 복귀 지점. 악당이 오가고 닿으면 움찔만 |
| 도전: 바위 계단 | 29.6~34.2 | 2.4 → 3.1 → 3.9 → 4.8 | 바위 두 단과 꼭대기 턱을 점프로 오름. 풀밭에서는 꼭대기 턱이 높아 바위를 밟아야 한다 |
| 산꼭대기 관측 지점 | 34.2~42 | 4.8 | '기록' → 두 기록 막대와 예상 비교 → 기존 새 상황 질문 |

처음 설계의 징검 바위(바위 사이가 떨어진 3개)는 테스트에서 달리며 뛰면 바위를 건너뛰어 틈에 빠지고, 틈에서는 다음 바위에 오를 수 없는 것이 드러나 붙어 있는 바위 계단으로 바꿨다. 쉼터 전 돌계단은 6단(한 단 0.3)이고 쉼터 턱(0.6)만 점프한다.

봉지 크기는 높이에 따라 `volumeFor('pressure',1)`과 `volumeFor('pressure',0)` 사이를 매끄럽게 오가게 보여 주고, 기록되는 값은 두 지점의 모형 값뿐이다.

### 구현하면서 더 정한 것

| 항목 | 결정 | 이유 |
|---|---|---|
| 예상·비교 패널 | 오른쪽에 두고 카메라를 옆으로 비켜 캐릭터와 봉지가 왼쪽에 보이게 | 가운데 카드가 캐릭터를 가려 발만 보였다 |
| 걷는 길 위의 그림 | 루미·표지대·기구 보관함·등불은 울타리 밖 비탈에, 꼭대기 관측소는 길 끝 울타리 너머에 | 캐릭터가 인물과 건물을 뚫고 지나가지 않게 |
| 길 가장자리 | 넓은 길 양옆과 꼭대기 끝에 나무 울타리 | 옆으로 벗어날 수 없는 까닭이 보이게(보이지 않는 벽 제거) |
| 걷는 그림 | 실제로 움직였을 때만 걷는 그림, 막히면 서 있는 그림 | 벽 앞 제자리 걷기 방지 |
| 봉지 위치 | 보는 방향에 따라 손 쪽으로 옮김. 보통 봉지 위에 부푼 봉지를 겹쳐 올림 | 뒤돌아도 같은 손에 들고, 중간 높이에서 비쳐 보이지 않게 |
| 떨어질 때 카메라 | 길 높이에 남고, 복귀하면 바로 그 자리로 옮김 | 골짜기 속으로 따라 내려가 화면이 뒤집히듯 보이지 않게 |
| 턱 올려 주기 | 뛰어서 턱 높이(0.34 이내)까지 닿으면 올려 줌 | 발판 옆면 속으로 들어가 떨어지는 일을 막는다 |
| 식생 | 낮은 곳은 잎 넓은 나무, 높은 곳은 소나무 | 높이가 달라지는 느낌을 그림으로 |

### 그림 기록

전부 `gpt-imagegen`(Codex 경유 GPT 이미지 모델)으로 잠금 래퍼를 써서 한 장씩 만들었다. 원본은 `asset-bank/original/generated-20261117/`(Git 제외), 가공은 `scripts/prepare-run-stage.mjs`, 실행 파일은 `public/assets/run-stage/`다. 소품 6종은 대기 시간을 줄이려고 한 줄 묶음 그림 2장으로 만들어 투명한 세로 띠를 경계로 잘랐다. 학생(`student-walk.webp`), 루미(`lumi-portrait.webp`), 방해꾼(`map-encounters/villain-left.png`), 보통 봉지(`prop-packet.webp`)는 기존 그림이다. 봉지를 든 캐릭터 동작 줄과 시작 카드 그림은 만들지 않았다(봉지는 따로 띄운 그림, 시작은 예상 패널).

| 원본 | 실행 파일 | 참고 그림 | 프롬프트 |
|---|---|---|---|
| `run-bag-puffed.png` | bag-puffed.webp | 기존 과자 봉지 | The same sealed snack bag as the reference image, but strongly puffed up and swollen like a tight pillow, inflated with gas, same cream-colored foil with the same plain teal blank label panel, same front view, same painterly style, single object centered, transparent background, no text, no letters, no numbers, no logo |
| `run-trail-grass.png` | trail-grass.webp | 없음 | Seamless tileable top-down ground texture of a mountain hiking trail: packed light brown dirt with patches of short green grass and a few tiny pebbles, bright cheerful hand-painted cartoon illustration for a children's science game, clean shapes, soft even lighting, flat top-down view, no shadows, no objects, no horizon, no text, no letters, no numbers, no logo |
| `run-mountain-backdrop.png` | (쓰지 않음, backdrop-v2로 교체) | 없음 | Wide landscape background: distant high mountain peaks with snow caps under a bright blue sky with soft white clouds, layered green forested hills in the lower half fading into light mist, bright cheerful hand-painted cartoon illustration for a children's science game, clean shapes, soft even lighting, no buildings, no people, no animals, no text, no letters, no numbers, no logo |
| `run-stone-steps.png` | stone-steps.webp | 없음 | Seamless tileable top-down texture of flat gray-beige stone slabs fitted together with thin mossy gaps, bright cheerful hand-painted cartoon illustration for a children's science game, clean shapes, soft even lighting, flat top-down view, no shadows, no horizon, no text, no letters, no numbers, no logo |
| `run-log-bridge.png` | log-bridge.webp | 없음 | Seamless tileable top-down texture of round wooden logs laid side by side as horizontal rows forming a log bridge deck, warm brown wood grain with rope lashings at the left and right edges, bright cheerful hand-painted cartoon illustration for a children's science game, clean shapes, soft even lighting, flat top-down view, no horizon, no text, no letters, no numbers, no logo |
| `run-rock-face.png` | rock-face.webp | 없음 | Seamless tileable texture of a mountain rock cliff face, layered gray-brown stone blocks with a few small grass tufts, bright cheerful hand-painted cartoon illustration for a children's science game, clean shapes, soft even lighting, flat front view, no sky, no text, no letters, no numbers, no logo |
| `run-summit-station.png` | (쓰지 않음, summit-observatory로 교체) | 없음 | A small mountain-top weather observation hut on a short wooden deck, with a wind vane, a spinning cup anemometer and a small round dish on the roof, bright cheerful hand-painted cartoon illustration for a children's science game, clean shapes, soft even lighting, front three-quarter view, single object centered, whole object visible, transparent background, no text, no letters, no numbers, no logo |
| `run-station-post.png` | station-post.webp | 없음 | A wooden trail marker post with a blank wooden board, a round brass barometer dial with a needle but no numbers, and a small green pennant flag on top, bright cheerful hand-painted cartoon illustration for a children's science game, clean shapes, soft even lighting, front view, single object centered, whole object visible from base to top, transparent background, no text, no letters, no numbers, no logo |
| `run-pine-tree.png` | pine-tree.webp | 없음 | A single tall pine tree with layered green branches and a short brown trunk, bright cheerful hand-painted cartoon illustration for a children's science game, clean shapes, soft even lighting, front view, whole tree visible from the base of the trunk to the tip, single object centered, transparent background, no text, no letters, no numbers, no logo |
| `run-backdrop-v2.png` | mountain-backdrop.webp | 타이틀 그림 | Wide panoramic landscape background seen from a mountainside trail, in the same storybook fantasy art style, colors and lighting as the reference image (lush green nature valley, cream stone buildings with teal domes and brass trim): far below in the valley a tiny cute town of cream buildings with teal domes, little windmills and a river with a waterfall, rolling forested hills, tall snow-capped mountain peaks across the upper part, big fluffy white clouds in a bright blue sky, warm sunny afternoon light, soft and charming, no people, no animals, no text, no letters, no numbers, no logo |
| `run-summit-observatory.png` | summit-station.webp | 타이틀 그림 | A small cute mountain-top weather observatory hut, in the same storybook fantasy art style, colors and lighting as the reference image (lush green nature valley, cream stone buildings with teal domes and brass trim): round cream stone walls, a teal dome roof with brass rim, a brass wind vane, a spinning cup anemometer and a small brass telescope on the roof, a round window, a wooden door, standing on a short wooden deck with two steps, front view, single object centered, whole object visible with margin, transparent background, no text, no letters, no numbers, no logo |
| `run-meadow-flowers.png` | meadow-flowers.webp | 없음 | Seamless tileable top-down texture of lush soft green meadow grass dotted with small white daisies and tiny yellow flowers, bright cheerful hand-painted cartoon illustration for a children's science game, clean shapes, soft even lighting, storybook look, flat top-down view, no shadows, no horizon, no path, no text, no letters, no numbers, no logo |
| `run-props-tall.png` | leafy-tree.webp, lantern-post.webp, pinwheel.webp | 없음 | Three separate objects in one row on a fully transparent background, evenly spaced with wide clear empty gaps between them, none touching or overlapping, each object whole and seen from the front, bright cheerful hand-painted cartoon illustration for a children's science game, clean shapes, soft even lighting, storybook look, no text, no letters, no numbers, no logo: on the left a round leafy green tree with a short brown trunk and a fluffy canopy, in the middle a wooden lantern post with a brass lantern and a small plain teal pennant with no emblem, on the right a garden pinwheel on a wooden stick with four curved blades in teal and cream |
| `run-props-low.png` | flower-clump.webp, boulder.webp, cloud.webp | 없음 | Three separate objects in one row on a fully transparent background, evenly spaced with wide clear empty gaps between them, none touching or overlapping, each object whole and seen from the front, bright cheerful hand-painted cartoon illustration for a children's science game, clean shapes, soft even lighting, storybook look, no text, no letters, no numbers, no logo: on the left a small clump of white daisies and yellow wildflowers with green leaves, in the middle a rounded gray boulder with patches of green moss, on the right a soft fluffy white cumulus cloud with a pale blue underside |
| `run-fence.png` | fence.webp | 없음 | A straight section of a low rustic wooden fence with three posts and two horizontal rails, warm brown wood, side view, perfectly horizontal, the rails reach the left and right image edges so the fence can repeat, bright cheerful hand-painted cartoon illustration for a children's science game, clean shapes, soft even lighting, storybook look, transparent background, no text, no letters, no numbers, no logo |
| `run-river.png` | river.webp | 없음 | Seamless tileable top-down texture of a clear turquoise mountain stream flowing over smooth pebbles with soft white ripples and a few round stones, bright cheerful hand-painted cartoon illustration for a children's science game, clean shapes, soft even lighting, storybook look, flat top-down view, no banks, no horizon, no text, no letters, no numbers, no logo |
| `run-base-shelter.png` | base-shelter.webp | 타이틀 그림 | A small cute weather instrument shelter at a trailhead, in the same storybook fantasy art style, colors and lighting as the reference image (lush green nature valley, cream stone buildings with teal domes and brass trim): a cream wooden louvered box on four wooden legs with a little teal roof and brass corners, a small brass thermometer tube and a round brass dial without numbers on the front, front view, single object centered, whole object visible with margin, transparent background, no text, no letters, no numbers, no logo |

## 구현 결과 (2026-11-17)

운영 주소 https://gas-discovery-lab.yelsam.workers.dev/ 에서 `climate-4` 「높은 산의 과자 봉지」가 3D 산길로 열리고, 화면 버튼과 키보드로 끝까지 플레이되며, 기록이 기존 `drafts['climate-4']`와 `evidence.climate`에 남는 것을 확인했다.

### 바뀐 파일

| 파일 | 내용 |
|---|---|
| `src/run-stage/mountain-rules.js` | 규칙 연결(초안 복원, 관측 지점 기록, 봉지 비율), 코스·발판·복귀 지점, 걷기·점프 계산. 순수 함수 |
| `src/run-stage/mountain-run.js` | three.js 무대, 세운 그림, 입력(방향판·점프·기록, WASD·방향키·Space·Enter), 고정 추적 카메라, 겹침 화면 |
| `src/run-stage/run-stage.css` | 겹침 화면 스타일 |
| `src/activities/climate.js` | 기존 화면 함수는 그대로 두고(`mountClassic`) 앞에 분기 추가. WebGL 불가·움직임 줄이기·불러오기 실패·자동재생·「기존 방식으로 하기」는 기존 화면 |
| `src/data.js` | `climate-4`에 `runStage:true` |
| `src/settingsContent.js`, `public/assets/CREDITS.md`, `README.md` | three.js·그림 고지와 안내 |
| `public/assets/vendor/three/` | three.js r170 모듈(691,648바이트, 06번과 SHA-256 동일)과 라이선스 |
| `public/assets/run-stage/` | 그림 20장(WebP 합계 약 1.0MB) |
| `tests/run-stage.test.mjs` | 규칙 테스트 9개 |
| `scripts/qa-run-stage.mjs`, `scripts/prepare-run-stage.mjs` | 브라우저 검증(`npm run qa:run-stage`), 그림 가공 |
| `scripts/qa-learning.mjs`·`qa-responsive.mjs`·`qa-voices.mjs` | 3D로 먼저 열리는 의뢰는 「기존 방식으로 하기」로 바꿔 기존 조작을 검사하는 한 줄 |

추가 다운로드는 three 0.69MB + 그림 약 1.0MB + 코드 약 35KB로 3MB 안쪽이다. 화면의 삼각형은 상자·평면·세운 그림 100여 개 분량이라 3만에 한참 못 미친다. 픽셀 비율은 최대 1.25, 그림자는 발밑 둥근 그림자뿐이고 후처리는 없다.

### 실행한 검증

| 검증 | 결과 |
|---|---|
| `npm test` | 79/79 통과(새 규칙 테스트 9개 포함) |
| `npm run build` | 통과. 243개 파일, 오프라인 revision `0551fcd48f50cd4b`. three 모듈과 그림이 오프라인 목록에 들어갔고, three는 설치 때 미리 받는 목록에는 없다 |
| `npm run qa:run-stage` | 개발 서버 1280×800·1024×768·1920×1080·1024×600, 빌드 결과물 1280×800·1024×768, **운영 주소 1280×800·1024×768** 모두 통과 |
| ↳ 내용 | 키보드 완주(산 아래→꼭대기 약 7초), 터치 방향판·점프·기록 완주, 통나무 다리에서 떨어지면 쉼터 복귀, 걷기만으로는 기록되지 않음, 오답은 완료되지 않음, 새로고침 뒤 비교 단계에서 이어 하기, 완료 기록(`mode`·`records`·`transfer`)과 초안 삭제, 「기존 방식으로 하기」와 자동재생은 기존 2D 화면, 움직임 줄이기(앱 설정·OS 설정)는 처음부터 기존 화면, 교사 시연에서 방향키는 단계 이동·WASD는 걷기, 버튼 52px 이상과 `aria-label`, 겹침 화면의 겹침·넘침·14px 미만 글자 없음, 콘솔·페이지 오류 0 |
| `npm run qa:browser` | 통과(20개 의뢰·영상·코어·엔딩·인증서·재도전·키보드·이탈). 개발 서버와 빌드 결과물 |
| `npm run qa:layout` | 통과 |
| `npm run qa:playback` | **실패(원래 있던 실패).** 첫 의뢰 `flow-1`에서 초안이 없어 멈춘다. 변경 전 스크립트로 운영본(`dc837bb`)을 검사해도 같은 자리에서 같은 오류다. `climate-4`의 자동재생은 `qa:run-stage`로 확인했다 |
| `npm run qa:responsive` | **실패(원래 있던 실패).** 740×360 등 작은 화면의 기존 문제다. 변경 전 소스(HEAD `dc837bb`)를 로컬에서 같은 검사로 돌린 결과와 이번 빌드의 결과가 그림 불러오기 항목을 빼고 125건으로 완전히 같다(차이 0건). `climate/3`에 새로 생긴 항목 없음 |
| 운영 파일 대조 | 빌드 245개 파일(오프라인 목록 243 + `sw.js`·`offline-manifest.json`)의 SHA-256이 운영 주소와 전부 일치 |

### 커밋과 배포

- 앱 코드 커밋 `a6dbcf2`, 코드 그래프 갱신 `8dea28a`. 둘 다 `main`에 푸시했다(직전 `dc837bb`).
- Cloudflare Worker `gas-discovery-lab` 버전 `079d1ebe-7868-42a3-93f8-ad97014eeece`, 2026-11-17 12:17 KST, 트래픽 100%. 배포 메시지에 `8dea28a`를 적었다. 절차는 기존과 같이 `wrangler deploy --config .tmp/release-20261117-run3d/wrangler.json`(이름 `gas-discovery-lab`, `assets.directory`는 `dist`).
- 직전 운영본의 오프라인 revision은 `2c52785296264e52`였다.
- 그림 17장의 내장 임시 원본은 적용을 확인한 뒤 `gpt-image.sh -c`로 모두 지웠다.

### 확인하지 못한 것

- 학교 태블릿·전자칠판 실기기에서의 프레임 수와 발열, Safari. 검증은 맥의 헤드리스 Chrome에서 했다.
- 실제 손가락 터치(검증은 CDP 터치 이벤트).
- 교사의 내용 검수와 학생 대상 수업 관찰.
- `qa:voices`는 실행하지 않았다(스크립트에 기존 방식 전환 한 줄만 넣었다).

### 작업 중 발견한 별도 문제

- ~~830×515처럼 좁은 화면에서 소리를 끈 채 시설의 마지막 의뢰를 끝내면, 아래 안내줄이 화면을 거의 다 차지해 실험 영역이 20px로 줄어든다.~~ **해결(2026-11-17, `03d5561`).** 아래 「사용 흐름 다듬기」 참고.
- ~~`qa:playback`이 `flow-1`에서 멈추고, `qa:responsive`가 작은 화면에서 실패한다.~~ **해결(2026-11-17, `03d5561`).** 두 검사 모두 통과한다.

## 사용 흐름 다듬기 (2026-11-17 오후, 추가 수정)

사용자 요청: "나머지 문제점들 쉽게 사용 가능하게 수정해줘 아이들이 직관적으로 사용흐름에 방해되지 않게". 학습 범위 문구, 의뢰 수, 완료 조건, 관 연결 퍼즐(`play-mission.js`)은 그대로 두었다.

### 바뀐 파일

| 파일 | 내용 |
|---|---|
| `src/run-stage/mountain-rules.js` | `obstacleAhead(runner)`: 앞이 막혔을 때 뛰면 넘는 턱이면 `'jump'`, 못 넘는 벽이면 `'wall'` |
| `src/run-stage/mountain-run.js` | 앞으로 가려는데 0.7초 넘게 막히면 말풍선 안내. 턱은 "턱이 있어요. 점프 버튼을 눌러 넘어요!"와 점프 버튼 강조, 벽은 "여기는 너무 높아요. 가운데 바위를 밟고 올라가요." 움직이면 사라진다 |
| `src/stage-layout.css` (끝에 덧붙임) | 의뢰를 끝낸 뒤 아래 안내줄이 줄바꿈되어 실험 화면을 밀어내지 않게 함(높이 600px 이하에서는 음성 안내 문장만 숨기고 다시 듣기 버튼은 남김). 높이 440px 이하·폭 601px 이상(폰 가로)에서: 관 칸 정사각형, 배송소 넣는 자리를 작은 그림 칸으로, 공작소 빈 칸 더하기표 숨김, 무게 연구소 용기 안내 글 잘림·환경 관측소 넘침 해소. 폰 가로 **완료 화면**에서: 안내줄 버튼 글자 14px로 한 줄 유지, 무게 연구소는 기록 칸을 넓히고 처음·나중 카드를 납작하게 해 결과 문장까지 스크롤 없이 보이게, 공작소는 다 끼운 부품 고르기 칸을 접고 결과를 가운데에, 교사 시연은 캐릭터 얼굴을 빼고 안내 글 15px |
| `tests/run-stage.test.mjs` | 막힘 판정 테스트 1개(합계 80개) |
| `scripts/qa-run-stage.mjs` | 걷기만 하면 쉼터 턱에서 점프 안내와 버튼 강조가 나오는지 확인 |
| `scripts/qa-playback.mjs`, `scripts/qa-voices.mjs` | 2026-11-16에 바뀐 조작(바람길 초안 없음, 무게 '다시 재기'와 공작소 밸브는 학생이 누름)에 맞춤 |
| `scripts/qa-responsive.mjs` | `QA_COMPLETE=1` 조작을 현재 동작에 맞춤. 새 화면의 실험 칸이 실제로 붙은 뒤에 그림을 기다림. 아직 받는 중인 그림(`image-still-loading`)과 받았는데 못 그린 그림(`broken-image`)을 나눠 적고, 응답 없이 끊긴 요청도 기록 |

### 390×844 `broken-image` 원인

검사 타이밍 문제였다. 주소만 바뀌는 이동이라 `.activity-screen` 껍데기가 실험 칸보다 몇 ms 먼저 생기는데, 검사는 껍데기만 보고 "그림이 다 왔다"를 판단해 끝냈고 그 뒤에 붙은 그림을 깨진 그림으로 잡았다. 그래서 크기·의뢰가 매번 달랐다(12:14 기록에서는 1366·1280의 `flow/0`, 873·390의 `engineering/0`). 검사를 둘로 나눈 첫 실행에서 남은 2건이 모두 `image-still-loading`이었고, 응답 오류·끊긴 요청은 0건이었다. 이전 화면 내용에 표시를 해 두고 새 내용이 붙을 때까지 기다리게 고친 뒤로는 0건이다. 앱의 그림 파일과 불러오기에는 문제가 없다.

### 실행한 검증 (빌드 결과물 `http://127.0.0.1:4191`, 로컬 Chrome 헤드리스)

| 검증 | 결과 |
|---|---|
| `npm test` | 80/80 통과 |
| `npm run build` | 통과, 243개 파일, 오프라인 revision `c0b2624c2fa20cc1` |
| `npm run qa:run-stage` | 1280×800·1024×768 통과(턱 안내 포함) |
| `npm run qa:browser`·`qa:layout`·`qa:playback` | 통과(`qa:playback`은 20개 의뢰 전부) |
| `npm run qa:responsive`(기본 11개 크기) | 539개 화면, 문제 0건 |
| `QA_COMPLETE=1`, 1280×800·1024×768·1024×600·873×580·740×360 | 465개 화면, 문제 0건(740×360 완료 상태 44건 → 0건, 태블릿 4개 크기는 계속 0건) |
| `qa-voices.mjs` | 이번 추가 수정 전 개발 서버에서 33개 통과. 마지막 CSS 수정 뒤에는 다시 돌리지 않았다(음성 경로는 바뀌지 않음) |

### 커밋과 배포

- 커밋 `03d5561`, `main` 푸시(직전 `54f2890`).
- Cloudflare Worker `gas-discovery-lab` 버전 `2332f2aa-3d57-4826-af8b-fe065ed8c354`, 2026-11-17 13:27 KST, 트래픽 100%, 배포 메시지에 `03d5561`.
- 운영 확인: 오프라인 목록 243개 + `sw.js`·`offline-manifest.json` 245개 파일의 SHA-256이 빌드와 전부 일치. 운영 주소에서 `qa-run-stage.mjs` 1280×800·1024×768 통과(턱 안내 → 꼭대기 약 4.8초), `QA_COMPLETE=1` 740×360 93개 화면 문제 0건.

### 확인하지 못한 것

- 학교 태블릿·전자칠판 실기기, Safari, 실제 손가락 터치.
- 배송소 폰 가로 화면에서 "넣는 자리" 글을 숨기고 그림 칸만 남긴 것, 공작소 폰 가로 완료 화면에서 부품 칸을 접은 것이 아이에게 충분히 읽히는지(사용자 확인 전).

