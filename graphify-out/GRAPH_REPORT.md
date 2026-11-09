# Graph Report - 15 gas  (2026-11-10)

## Corpus Check
- 170 files · ~66,085 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 112 file(s) not represented in the graph (top: .woff2 44, (none) 39, .css 25)

## Summary
- 1091 nodes · 2362 edges · 115 communities (87 shown, 28 thin omitted)
- Extraction: 97% EXTRACTED · 3% INFERRED · 0% AMBIGUOUS · INFERRED: 78 edges (avg confidence: 0.85)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `810ff951`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- src/main.js
- model.test.mjs
- render-concepts.mjs
- 학습 UX 개선 및 검수 기록
- 12. NPC 변화
- scripts
- gas-city-operation_deep-design_v2.md
- 화면 01 — 도시 비상 신호
- 기본 이미지 프롬프트
- 화면 02 — 공기 흐름 작동 시험
- 화면 06 — 압력 제어 및 환경 적용
- 화면 03 — 기체 무게 계측실
- output-dist-before-publish-1794173282/src/main.js
- 기체 도시 대작전 장별 시나리오 논의안
- Bonus Quest A — 다른 조건에서도 같을까?
- 3-2. 반드시 수정할 것
- 화면 04 — 증거 분석 보드
- 화면 08 — 기체 배달 관제센터
- 화면 09 — 3D 공기 공학실
- 화면 05 — 온도 터널
- 화면 07 — 기체 정보 연구소
- render-concepts-v2.mjs
- mountMap
- 기체 도시 대작전 TRD 초안
- 11. World Change 5단계
- 14. Final Mission
- 30. Science World AI SLOP CHECK
- 문구
- 조작 흐름 개선 · 2026-10-28
- README.md
- 기체 도시 대작전 PRD 초안
- 15. Final Movie 20초 구성
- 17. 탐구 스타일 계산
- 9. Evidence 5종
- 21. 공통 UI 설계
- 32. 개발용 최종 요약
- 4. 기존 설계 진단
- 7. Mission 1~5 심화 설계
- 8. 총 10개 화면 상세 설계
- 자료와 제작 기록
- 자료와 제작 기록
- 23. 3D 사용 확정
- 5. 단원 메인 퀘스트
- concepts-v2/manifest.json
- manifest.json
- 22. 캐릭터 기능 분리
- 25. 샘플 이미지 → 실제 구현 변환 원칙
- qa-playback.mjs
- 24. 구현 시 과학 피드백 문구 원칙
- visuals/manifest.json
- ref_node_fs
- render.mjs
- src/concepts.js
- scripts/build.mjs
- qa-screens.mjs
- 기체 도시 대작전 · 고도화 결과 (2026-11-09 밤 ~ 11-10)
- 15 기체 도시 대작전 개선 기록
- mountMap
- NPC 환영 음성 연결 검증
- 개념영상 10편 검토 (2026-11-10)
- 최종점검 성적표 — 기체 도시 대작전 (15 gas)
- SCORE-20261107.md
- 기체 도시 대작전 · 12/10 고도화 계획 (2026-11-09 밤)
- serve.mjs
- 기체 도시 대작전 개념영상 SPEC (HyperFrames)
- qa-learning.mjs
- theme-effects.test.mjs
- 3D-ASSET-PROMPTS.md
- 에셋 검토 목록
- 기체 도시 대작전 · 2026-11-08 증분 고도화 검토
- output-dist-before-publish-1794173282/src/model.js
- sound
- qa-responsive.mjs
- src/data.js
- mountMap
- output-dist-before-publish-1794173282/src/state.js
- output-dist-before-publish-1794173282/src/activities/weight.js
- output-dist-before-publish-1794173282/src/audio.js
- bindConceptFocus
- 자료와 제작 기록
- createPlayback
- Audio provenance and release review
- output-dist-before-publish-1794173282/assets/concepts/manifest.json
- output-dist-before-publish-1794173282/assets/concepts-v2/manifest.json
- output-dist-before-publish-1794173282/assets/visuals/manifest.json
- mountWelcomeVoice
- prepare-assets.mjs
- mountRepair
- createPlayback

## God Nodes (most connected - your core abstractions)
1. `icon()` - 40 edges
2. `sound()` - 37 edges
3. `icon()` - 37 edges
4. `sound()` - 35 edges
5. `button()` - 30 edges
6. `button()` - 30 edges
7. `navigate()` - 29 edges
8. `navigate()` - 29 edges
9. `mountMap()` - 27 edges
10. `mountMap()` - 26 edges

## Surprising Connections (you probably didn't know these)
- `setup()` --calls--> `createPlayback()`  [EXTRACTED]
  tests/playback.test.mjs → src/experiment-player.js
- `begin()` --calls--> `loadSave()`  [EXTRACTED]
  tests/storage.test.mjs → src/state.js
- `renderFilm()` --calls--> `cueAt()`  [EXTRACTED]
  films/kit/kit.mjs → src/concept-clips.js
- `mountMap()` --indirect_call--> `validateMap()`  [INFERRED]
  src/map.js → src/navigation.js
- `mountDelivery()` --calls--> `icon()`  [EXTRACTED]
  output-dist-before-publish-1794173282/src/activities/delivery.js → output-dist-before-publish-1794173282/src/icons.js

## Import Cycles
- None detected.

## Communities (115 total, 28 thin omitted)

### Community 0 - "src/main.js"
Cohesion: 0.05
Nodes (115): mountClimate(), move(), recordCondition(), renderRecords(), update(), mountDelivery(), chooseGas(), deliver() (+107 more)

### Community 1 - "model.test.mjs"
Cohesion: 0.33
Nodes (8): APP, freshSave(), loadSave(), resetProgress(), setTeacherPreview(), store, validateSave(), begin()

### Community 2 - "render-concepts.mjs"
Cohesion: 0.20
Nodes (31): arrow(), balloon(), C, car(), carbon(), circle(), clips, dots() (+23 more)

### Community 4 - "학습 UX 개선 및 검수 기록"
Cohesion: 0.29
Nodes (6): 적용한 내용, 주요 변경 파일, 학습 UX 개선 및 검수 기록, 화면 기록, 확인 결과, 확인 범위와 남은 점

### Community 5 - "12. NPC 변화"
Cohesion: 0.10
Nodes (20): 12. NPC 변화, Final Report, Mission 1 후, Mission 2 후, Mission 3 후, Mission 4 후, Mission 5 후, 게임 시작 (+12 more)

### Community 6 - "scripts"
Cohesion: 0.08
Nodes (24): description, engines, node, name, optionalDependencies, sharp@^0.35.4, private, scripts (+16 more)

### Community 7 - "gas-city-operation_deep-design_v2.md"
Cohesion: 0.09
Nodes (21): 0. 문서 목적, 10. Research Kit, 13. Final Report 설계, 16. 최종 인증서, 19. 난이도 변수, 1. 설계 핵심 한 줄, 20. 태블릿 필수성 체크, 26. 페이지당 에셋 제한 (+13 more)

### Community 8 - "화면 01 — 도시 비상 신호"
Cohesion: 0.13
Nodes (15): AI SLOP CHECK, CSS/UI, Mission, 과학 개념, 다음 연결, 성공 조건, 실패 상황, 재시도 (+7 more)

### Community 9 - "기본 이미지 프롬프트"
Cohesion: 0.15
Nodes (13): G01 중앙 공기 코어 외장, G02 코어 회전 날개, G03 장치 조립 받침대, G04 공기 저장 풍선 모듈, G05 둥근 노즐, G06 손잡이 밸브, G07 일자 관, G08 90도 굽은 관 (+5 more)

### Community 10 - "화면 02 — 공기 흐름 작동 시험"
Cohesion: 0.18
Nodes (11): Evidence, Mission, World Change, 성공 조건, 실패 상황, 재시도, 태블릿 조작, 학생 행동 (+3 more)

### Community 11 - "화면 06 — 압력 제어 및 환경 적용"
Cohesion: 0.18
Nodes (11): Evidence, Mission, World Change, 과학적 문구, 금지, 성공 조건, 태블릿 조작, 학생 행동 (+3 more)

### Community 12 - "화면 03 — 기체 무게 계측실"
Cohesion: 0.20
Nodes (10): Mission, 다음 연결, 성공 조건, 실패 상황, 재시도, 태블릿 조작, 학생 행동, 화면 03 — 기체 무게 계측실 (+2 more)

### Community 13 - "output-dist-before-publish-1794173282/src/main.js"
Cohesion: 0.12
Nodes (43): stageById(), abort, app, back(), controls(), current, ENDING, mounts (+35 more)

### Community 14 - "기체 도시 대작전 장별 시나리오 논의안"
Cohesion: 0.22
Nodes (9): 3D 적용 판단, 과학 표현에서 바로잡을 부분, 기존 10개 핵심 활동 화면의 배치, 기체 도시 대작전 장별 시나리오 논의안, 이번 요청에서 확정된 화면 원칙, 장별 시나리오, 전체 이야기, 협의가 필요한 부분 (+1 more)

### Community 15 - "Bonus Quest A — 다른 조건에서도 같을까?"
Cohesion: 0.22
Nodes (9): 18. Bonus Quest, Bonus Quest A — 다른 조건에서도 같을까?, Bonus Quest B — 다른 장치로도 움직일 수 있을까?, 방식, 방식, 보상, 보상, 상황 (+1 more)

### Community 16 - "3-2. 반드시 수정할 것"
Cohesion: 0.22
Nodes (9): 3-1. 유지할 것, 3-2. 반드시 수정할 것, 3. 샘플 페이지 반영 진단, 공통 비주얼, 수정 1 — 압력 화면의 입자 설명 삭제, 수정 2 — 귀여운 구름을 ‘기체 입자’처럼 사용하지 않기, 수정 3 — 여러 기체 정보 카드 범위 정리, 수정 4 — 마지막 화면 자동 완료 구조 금지 (+1 more)

### Community 17 - "화면 04 — 증거 분석 보드"
Cohesion: 0.22
Nodes (9): Evidence, Mission, World Change, 성공 조건, 태블릿 조작, 학생 행동, 화면 04 — 증거 분석 보드, 화면 목적 (+1 more)

### Community 18 - "화면 08 — 기체 배달 관제센터"
Cohesion: 0.22
Nodes (9): Evidence, Mission, World Change, 실패 상황, 재시도, 태블릿 조작, 학생 행동, 화면 08 — 기체 배달 관제센터 (+1 more)

### Community 19 - "화면 09 — 3D 공기 공학실"
Cohesion: 0.22
Nodes (9): Evidence, Mission, World Change, 성공 조건, 태블릿 조작, 학생 행동, 화면 09 — 3D 공기 공학실, 화면 목적 (+1 more)

### Community 20 - "화면 05 — 온도 터널"
Cohesion: 0.22
Nodes (9): Mission, 다음 연결, 성공 조건, 주의, 태블릿 조작, 학생 행동, 화면 05 — 온도 터널, 화면 목적 (+1 more)

### Community 21 - "화면 07 — 기체 정보 연구소"
Cohesion: 0.25
Nodes (8): Mission, 다음 연결, 성공 조건, 태블릿 조작, 학생 행동, 화면 07 — 기체 정보 연구소, 화면 목적, 화면 반응

### Community 22 - "render-concepts-v2.mjs"
Cohesion: 0.19
Nodes (26): arrow(), assets, car(), carbon(), clips, dot(), ease(), encode() (+18 more)

### Community 23 - "mountMap"
Cohesion: 0.33
Nodes (11): loadImage(), mountMap(), draw(), hint(), routeTo(), sprite(), syncTools(), tryEnter() (+3 more)

### Community 24 - "기체 도시 대작전 TRD 초안"
Cohesion: 0.25
Nodes (7): 구현 후 필요한 검증, 기체 도시 대작전 TRD 초안, 상태와 저장 제안, 입력과 에셋, 책임 분리, 화면 구성 제안, 활동 모델의 원칙

### Community 25 - "11. World Change 5단계"
Cohesion: 0.29
Nodes (7): 11. World Change 5단계, Final Mission 성공, Mission 1 완료, Mission 2 완료, Mission 3 완료, Mission 4 완료, Mission 5 완료

### Community 26 - "14. Final Mission"
Cohesion: 0.29
Nodes (7): 14. Final Mission, 성공, 실패, 이름, 피드백, 핵심, 행동

### Community 27 - "30. Science World AI SLOP CHECK"
Cohesion: 0.29
Nodes (7): 30. Science World AI SLOP CHECK, CHECK 1, CHECK 2, CHECK 3, CHECK 4, CHECK 5, 추가 CHECK

### Community 28 - "문구"
Cohesion: 0.29
Nodes (7): Evidence, Mission, 기능, 기체 도시 복구 인증서, 문구, 입력, 탐구 스타일

### Community 29 - "조작 흐름 개선 · 2026-10-28"
Cohesion: 0.40
Nodes (4): 검증 방법, 변경 파일, 입력과 전환, 조작 흐름 개선 · 2026-10-28

### Community 30 - "README.md"
Cohesion: 0.25
Nodes (4): 개념 모션 영상 컷 시트, 주요 개념 그림 고도화 · 2026-10-28, 기체 도시 대작전, 폴더

### Community 31 - "기체 도시 대작전 PRD 초안"
Cohesion: 0.33
Nodes (6): 공통 UI의 동작 제안, 기체 도시 대작전 PRD 초안, 목적과 대상, 수용 기준 초안, 제안하는 MVP 범위, 확정 요구사항

### Community 32 - "15. Final Movie 20초 구성"
Cohesion: 0.33
Nodes (6): 15. Final Movie 20초 구성, Scene 1 — 0~3초, Scene 2 — 3~7초, Scene 3 — 7~12초, Scene 4 — 12~17초, Scene 5 — 17~20초

### Community 33 - "17. 탐구 스타일 계산"
Cohesion: 0.33
Nodes (6): 17. 탐구 스타일 계산, 꼼꼼한 관찰자, 끈질긴 실험가, 문제 해결 전문가, 증거 분석가, 창의적 설계자

### Community 34 - "9. Evidence 5종"
Cohesion: 0.33
Nodes (6): 1. 공기 흐름 기록, 2. 기체 무게 측정 기록, 3. 부피 변화 환경 기록, 4. 기체 관제 보고서, 5. 공기 장치 설계도, 9. Evidence 5종

### Community 35 - "21. 공통 UI 설계"
Cohesion: 0.33
Nodes (6): 21. 공통 UI 설계, 금지, 상단, 왼쪽, 중앙, 하단

### Community 36 - "32. 개발용 최종 요약"
Cohesion: 0.33
Nodes (6): 32. 개발용 최종 요약, 5 Mission, Evidence 5, Final, Rendering, Repository

### Community 37 - "4. 기존 설계 진단"
Cohesion: 0.33
Nodes (6): 4. 기존 설계 진단, AI SLOP 위험, 강점, 게임성이 약했던 부분, 태블릿 활용이 약해질 수 있는 부분, 학습지형으로 보일 수 있는 부분

### Community 38 - "7. Mission 1~5 심화 설계"
Cohesion: 0.33
Nodes (6): 7. Mission 1~5 심화 설계, MISSION 01 — 끊어진 공기 동력선, MISSION 02 — 보이지 않는 무게의 증거, MISSION 03 — 변하는 부피의 규칙, MISSION 04 — 도시 기체 관제, MISSION 05 — 공기 복구 장치 설계

### Community 39 - "8. 총 10개 화면 상세 설계"
Cohesion: 0.33
Nodes (6): 8. 총 10개 화면 상세 설계, Phase A — Final Report, Phase B — Final Mission, Phase C — Final Movie, Phase D — Completion, 화면 10 — 최종 관제 본부

### Community 40 - "자료와 제작 기록"
Cohesion: 0.33
Nodes (5): 개념 영상과 동물 친구, 기존 이미지와 글꼴, 메인 키아트와 여우 에어 (2026-10-30), 자료와 제작 기록, 효과음

### Community 41 - "자료와 제작 기록"
Cohesion: 0.33
Nodes (5): 2026-10-28 개념 시각 자료 고도화, 개념 영상과 동물 친구, 기존 이미지와 글꼴, 자료와 제작 기록, 효과음

### Community 42 - "23. 3D 사용 확정"
Cohesion: 0.40
Nodes (5): 23. 3D 사용 확정, Screen 01, Screen 06 일부, Screen 09, Screen 10

### Community 43 - "5. 단원 메인 퀘스트"
Cohesion: 0.40
Nodes (5): 5. 단원 메인 퀘스트, NPC 의뢰, 사건 — 기체 도시의 공기 코어 정지, 에어 — 여우 발명가, 최종 목표

### Community 44 - "concepts-v2/manifest.json"
Cohesion: 0.50
Nodes (3): files, generated, method

### Community 45 - "manifest.json"
Cohesion: 0.50
Nodes (3): files, generated, method

### Community 46 - "22. 캐릭터 기능 분리"
Cohesion: 0.50
Nodes (4): 22. 캐릭터 기능 분리, 루미, 에어, 포포

### Community 47 - "25. 샘플 이미지 → 실제 구현 변환 원칙"
Cohesion: 0.50
Nodes (4): 25. 샘플 이미지 → 실제 구현 변환 원칙, CSS/DOM으로 만들 것, 이미지로 만들 것, 이유

### Community 48 - "qa-playback.mjs"
Cohesion: 0.12
Nodes (10): {chromium}, fs, {chromium}, draft(), errors, evidence(), report, root (+2 more)

### Community 49 - "24. 구현 시 과학 피드백 문구 원칙"
Cohesion: 0.67
Nodes (3): 24. 구현 시 과학 피드백 문구 원칙, 사용, 사용하지 않음

### Community 50 - "visuals/manifest.json"
Cohesion: 0.50
Nodes (3): assets, generated, method

### Community 53 - "ref_node_fs"
Cohesion: 0.12
Nodes (8): dir, manifest, root, fn(), source, fixture(), root, worker()

### Community 54 - "render.mjs"
Cohesion: 0.15
Nodes (6): pub, films, manifest, only, out, sharp

### Community 55 - "src/concepts.js"
Cohesion: 0.33
Nodes (11): box(), esc(), KIT_CSS, px(), renderFilm(), CONCEPT_CLIPS, CONCEPT_LABELS, CONCEPT_SECONDS (+3 more)

### Community 56 - "scripts/build.mjs"
Cohesion: 0.20
Nodes (9): files, hash, pkg, retired, revision, root, syntax(), target (+1 more)

### Community 57 - "qa-screens.mjs"
Cohesion: 0.25
Nodes (6): bad, {chromium}, errors, out, report, viewports

### Community 59 - "기체 도시 대작전 · 고도화 결과 (2026-11-09 밤 ~ 11-10)"
Cohesion: 0.29
Nodes (6): 개념영상, 검증 명령과 실제 결과 (최종 코드 기준), 기체 도시 대작전 · 고도화 결과 (2026-11-09 밤 ~ 11-10), 남은 일, 미검증과 이유, 바꾼 것

### Community 60 - "15 기체 도시 대작전 개선 기록"
Cohesion: 0.25
Nodes (7): 15 기체 도시 대작전 개선 기록, 개선 프롬프트(이번 적용 기준), 검증, 남은 한계, 이미지·소리, 적용, 학습·중복 점검

### Community 61 - "mountMap"
Cohesion: 0.34
Nodes (13): imageCache, canStand(), distance(), findPath(), snap(), insidePolygon(), lineClear(), movePoint() (+5 more)

### Community 63 - "개념영상 10편 검토 (2026-11-10)"
Cohesion: 0.29
Nodes (6): 가장 약한 장면, 개념영상 10편 검토 (2026-11-10), 만든 방식과 고른 것, 보기만 한 것 / 아무도 확인 안 한 것, 일부러 둔 것, 잰 것

### Community 64 - "최종점검 성적표 — 기체 도시 대작전 (15 gas)"
Cohesion: 0.33
Nodes (5): 개선 우선순위 (최저 3개), 디자인스킬 13항목 — BEFORE 119/130 → AFTER 125/130, 최종스킬 10항목 — BEFORE 70/100 → AFTER 88/100, 최종점검 성적표 — 기체 도시 대작전 (15 gas), 측정하지 못한 것

### Community 66 - "기체 도시 대작전 · 12/10 고도화 계획 (2026-11-09 밤)"
Cohesion: 0.33
Nodes (5): 1단계 → 10/10 : FAIL·WARNING·NOT TESTED 해소, 2단계 → 11 : 몰입·피드백·접근성, 3단계 → 12 : 개념영상 HyperFrames 고도화 + 이 프로젝트만의 연출, 기체 도시 대작전 · 12/10 고도화 계획 (2026-11-09 밤), 오늘 밤 실행 순서

### Community 67 - "serve.mjs"
Cohesion: 0.33
Nodes (4): port, production, root, types

### Community 68 - "기체 도시 대작전 개념영상 SPEC (HyperFrames)"
Cohesion: 0.50
Nodes (3): 기체 도시 대작전 개념영상 SPEC (HyperFrames), 만들기, 장면 문법 ("실험 노트")

### Community 72 - "qa-learning.mjs"
Cohesion: 0.22
Nodes (5): {chromium}, errors, liveCells, report, PIPE_PATTERNS

### Community 73 - "theme-effects.test.mjs"
Cohesion: 0.16
Nodes (5): createThemeEffects(), play(), stop(), sync(), unlock()

### Community 74 - "3D-ASSET-PROMPTS.md"
Cohesion: 0.29
Nodes (6): 3D를 적용할 화면, 기본 이미지 목록, 기체 도시 대작전 3D 기본 이미지와 프롬프트, 별도 필요한 2.5D 픽셀 지도, 생성 후 확인할 것, 제작 기준

### Community 75 - "에셋 검토 목록"
Cohesion: 0.29
Nodes (6): 로고와 캐릭터, 배경 10장, 빠른 미리보기, 새로 필요한 핵심 자료, 에셋 검토 목록, 화면 시안 20장

### Community 76 - "기체 도시 대작전 · 2026-11-08 증분 고도화 검토"
Cohesion: 0.29
Nodes (6): 검증 결과, 교육과정·단계 검토, 기체 도시 대작전 · 2026-11-08 증분 고도화 검토, 변경 범위와 보존, 생성 출처·제한, 이번 변경

### Community 77 - "output-dist-before-publish-1794173282/src/model.js"
Cohesion: 0.15
Nodes (23): mountEngineering(), assign(), errorTarget(), guideNext(), nextParts(), render(), save(), test() (+15 more)

### Community 78 - "sound"
Cohesion: 0.21
Nodes (26): mountClimate(), move(), recordCondition(), renderRecords(), update(), mountDelivery(), chooseGas(), deliver() (+18 more)

### Community 83 - "qa-responsive.mjs"
Cohesion: 0.22
Nodes (9): audit(), check(), {chromium}, errors, failures, output, report, resources (+1 more)

### Community 84 - "src/data.js"
Cohesion: 0.20
Nodes (8): checks, {chromium}, CONTENT_REVIEW, GASES, STAGES, STANDARDS, STORY, SETTINGS_CONTENT

### Community 90 - "mountMap"
Cohesion: 0.21
Nodes (23): imageCache, loadImage(), mountMap(), draw(), hint(), routeTo(), sprite(), syncTools() (+15 more)

### Community 91 - "output-dist-before-publish-1794173282/src/state.js"
Cohesion: 0.21
Nodes (11): APP, GASES, STAGES, STANDARDS, STORY, SETTINGS_CONTENT, freshSave(), loadSave() (+3 more)

### Community 92 - "output-dist-before-publish-1794173282/src/activities/weight.js"
Cohesion: 0.24
Nodes (13): mountWeight(), compareSelected(), guideCurrentAction(), renderRecords(), save(), update(), mountExperimentPlayer(), icon() (+5 more)

### Community 93 - "output-dist-before-publish-1794173282/src/audio.js"
Cohesion: 0.14
Nodes (23): active, buffers, config, effectBuffer(), effectNames, init(), notes, quietAudio() (+15 more)

### Community 94 - "bindConceptFocus"
Cohesion: 0.26
Nodes (15): quietAudio(), bindConceptFocus(), emphasizeConcept(), escapeText(), conceptFor(), openConcept(), arm(), cleanup() (+7 more)

### Community 95 - "자료와 제작 기록"
Cohesion: 0.33
Nodes (5): 2026-10-28 개념 시각 자료 고도화, 개념 영상과 동물 친구, 기존 이미지와 글꼴, 자료와 제작 기록, 효과음

### Community 96 - "createPlayback"
Cohesion: 0.67
Nodes (6): createPlayback(), account(), advance(), clear(), stop(), wait()

### Community 97 - "Audio provenance and release review"
Cohesion: 0.40
Nodes (4): Audio provenance and release review, New sound effects, NPC narration, Preserved existing assets

### Community 98 - "output-dist-before-publish-1794173282/assets/concepts/manifest.json"
Cohesion: 0.50
Nodes (3): files, generated, method

### Community 99 - "output-dist-before-publish-1794173282/assets/concepts-v2/manifest.json"
Cohesion: 0.50
Nodes (3): files, generated, method

### Community 100 - "output-dist-before-publish-1794173282/assets/visuals/manifest.json"
Cohesion: 0.50
Nodes (3): assets, generated, method

### Community 101 - "mountWelcomeVoice"
Cohesion: 0.67
Nodes (3): mountWelcomeVoice(), fail(), stop()

### Community 135 - "prepare-assets.mjs"
Cohesion: 0.20
Nodes (7): manifest, out, props, require, root, sharp, total

### Community 136 - "mountRepair"
Cohesion: 1.00
Nodes (3): mountRepair(), finish(), render()

### Community 138 - "createPlayback"
Cohesion: 0.23
Nodes (10): {chromium}, errors, report, createPlayback(), account(), advance(), clear(), stop() (+2 more)

## Knowledge Gaps
- **28 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `8. 총 10개 화면 상세 설계` connect `8. 총 10개 화면 상세 설계` to `gas-city-operation_deep-design_v2.md`, `화면 01 — 도시 비상 신호`, `화면 02 — 공기 흐름 작동 시험`, `화면 06 — 압력 제어 및 환경 적용`, `화면 03 — 기체 무게 계측실`, `화면 04 — 증거 분석 보드`, `화면 08 — 기체 배달 관제센터`, `화면 09 — 3D 공기 공학실`, `화면 05 — 온도 터널`, `화면 07 — 기체 정보 연구소`?**
  _High betweenness centrality (0.039) - this node is a cross-community bridge._
- **Should `src/main.js` be split into smaller, more focused modules?**
  _Cohesion score 0.05215275573891886 - nodes in this community are weakly interconnected._
- **Why does `sound()` connect `src/main.js` to `mountMap`, `mountMap`, `bindConceptFocus`, `src/concepts.js`?**
  _High betweenness centrality (0.011) - this node is a cross-community bridge._
- **Should `12. NPC 변화` be split into smaller, more focused modules?**
  _Cohesion score 0.1 - nodes in this community are weakly interconnected._
- **Why does `화면 08 — 기체 배달 관제센터` connect `화면 08 — 기체 배달 관제센터` to `8. 총 10개 화면 상세 설계`?**
  _High betweenness centrality (0.010) - this node is a cross-community bridge._
- **Should `scripts` be split into smaller, more focused modules?**
  _Cohesion score 0.08333333333333333 - nodes in this community are weakly interconnected._
- **Should `gas-city-operation_deep-design_v2.md` be split into smaller, more focused modules?**
  _Cohesion score 0.09090909090909091 - nodes in this community are weakly interconnected._