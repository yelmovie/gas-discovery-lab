# Graph Report - 15 gas  (2026-11-17)

## Corpus Check
- 134 files · ~75,640 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 45 file(s) not represented in the graph (top: .woff2 26, .css 15, (none) 3)

## Summary
- 1053 nodes · 2074 edges · 94 communities (86 shown, 8 thin omitted)
- Extraction: 97% EXTRACTED · 3% INFERRED · 0% AMBIGUOUS · INFERRED: 58 edges (avg confidence: 0.85)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `908b23f6`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- model.test.mjs
- ref_node_fs
- main.js
- render.mjs
- output-dist-before-publish-1794173282/src/model.js
- ref_node_fs
- render-concepts-v2.mjs
- qa-learning.mjs
- sound
- scripts
- gas-city-operation_deep-design_v2.md
- map.js
- STORY-VOICE-BGM-20261113.md
- mountMap
- ref_node_assert
- 12. NPC 변화
- play-mission.js
- qa-playback.mjs
- game-voices.js
- audio.js
- bindDirectionPad
- 화면 01 — 도시 비상 신호
- building-restoration.js
- 기본 이미지 프롬프트
- createPlayback
- map-camera.test.mjs
- 19. 난이도 변수
- scripts/build.mjs
- qa-voices.mjs
- 화면 02 — 공기 흐름 작동 시험
- 화면 06 — 압력 제어 및 환경 적용
- 화면 03 — 기체 무게 계측실
- prepare-assets.mjs
- README.md
- 기체 도시 대작전 장별 시나리오 논의안
- Bonus Quest A — 다른 조건에서도 같을까?
- 3-2. 반드시 수정할 것
- 화면 04 — 증거 분석 보드
- 화면 08 — 기체 배달 관제센터
- 화면 09 — 3D 공기 공학실
- 화면 05 — 온도 터널
- 기체 도시 대작전 교육 내용 점검
- 15 기체 도시 대작전 개선 기록
- 기체 도시 대작전 TRD 초안
- 자료와 제작 기록
- 화면 07 — 기체 정보 연구소
- 15 기체 도시 대작전 · 지도 악당 연계 계획
- map-encounters.js
- concept-clips.test.mjs
- 3D-ASSET-PROMPTS.md
- 에셋 검토 목록
- 학습 UX 개선 및 검수 기록
- 기체 도시 대작전 · 2026-11-08 증분 고도화 검토
- 기체 도시 대작전 납품 최종점검
- 기체 도시 대작전 · 고도화 결과 (2026-11-09 밤 ~ 11-10)
- 개념영상 10편 검토 (2026-11-10)
- 11. World Change 5단계
- 14. Final Mission
- 30. Science World AI SLOP CHECK
- 문구
- 자료와 제작 기록
- 기체 도시 대작전 PRD 초안
- 판정: 조건부
- 최종점검 성적표 — 기체 도시 대작전 (15 gas)
- 15. Final Movie 20초 구성
- 17. 탐구 스타일 계산
- 9. Evidence 5종
- 21. 공통 UI 설계
- 32. 개발용 최종 요약
- 4. 기존 설계 진단
- 7. Mission 1~5 심화 설계
- 8. 총 10개 화면 상세 설계
- Audio provenance and release review
- 조작 흐름 개선 · 2026-10-28
- 기체 도시 대작전 · 2026-11-10 이어서 검수
- 기체 도시 대작전 최종 성적표
- 23. 3D 사용 확정
- 5. 단원 메인 퀘스트
- public/assets/concepts/manifest.json
- public/assets/concepts-v2/manifest.json
- public/assets/visuals/manifest.json
- 22. 캐릭터 기능 분리
- 25. 샘플 이미지 → 실제 구현 변환 원칙
- mountWelcomeVoice
- NPC 환영 음성 연결 검증
- Character narration integration (2026-11-10)
- 24. 구현 시 과학 피드백 문구 원칙
- GAME-REFACTOR-20261111.md
- SCORE-20261107.md
- ref_node_test
- qa-responsive.mjs
- STARTUP-PILOT-20261114.md

## God Nodes (most connected - your core abstractions)
1. `icon()` - 43 edges
2. `sound()` - 40 edges
3. `mountMap()` - 38 edges
4. `button()` - 34 edges
5. `navigate()` - 26 edges
6. `escapeHTML()` - 26 edges
7. `openConcept()` - 22 edges
8. `html()` - 21 edges
9. `announce()` - 21 edges
10. `mountEngineering()` - 18 edges

## Surprising Connections (you probably didn't know these)
- `3단계 → 12 : 개념영상 HyperFrames 고도화 + 이 프로젝트만의 연출` --references--> `massFor()`  [INFERRED]
  docs/reviews/UPGRADE-PLAN-20261109.md → src/model.js
- `기체 도시 대작전 개념영상 SPEC (HyperFrames)` --references--> `conceptFor()`  [INFERRED]
  films/SPEC.md → src/concepts.js
- `setup()` --calls--> `createPlayback()`  [EXTRACTED]
  tests/playback.test.mjs → src/experiment-player.js
- `fixture()` --calls--> `createNarration()`  [EXTRACTED]
  tests/narration.test.mjs → src/narration.js
- `begin()` --calls--> `loadSave()`  [EXTRACTED]
  tests/storage.test.mjs → src/state.js

## Import Cycles
- None detected.

## Communities (94 total, 8 thin omitted)

### Community 0 - "model.test.mjs"
Cohesion: 0.31
Nodes (14): assistMapStep(), canStand(), distance(), findPath(), snap(), insidePolygon(), lineClear(), movePoint() (+6 more)

### Community 1 - "ref_node_fs"
Cohesion: 0.11
Nodes (13): {chromium}, errors, report, {chromium}, errors, bad, {chromium}, errors (+5 more)

### Community 2 - "main.js"
Cohesion: 0.06
Nodes (94): FACILITY_ART, mountDelivery(), chooseGas(), deliver(), guideSelection(), render(), save(), showInformation() (+86 more)

### Community 3 - "render.mjs"
Cohesion: 0.11
Nodes (9): pub, films, manifest, only, out, sharp, dir, manifest (+1 more)

### Community 4 - "output-dist-before-publish-1794173282/src/model.js"
Cohesion: 0.20
Nodes (31): arrow(), balloon(), C, car(), carbon(), circle(), clips, dots() (+23 more)

### Community 5 - "ref_node_fs"
Cohesion: 0.33
Nodes (4): port, production, root, types

### Community 6 - "render-concepts-v2.mjs"
Cohesion: 0.19
Nodes (26): arrow(), assets, car(), carbon(), clips, dot(), ease(), encode() (+18 more)

### Community 7 - "qa-learning.mjs"
Cohesion: 0.25
Nodes (4): {chromium}, errors, liveCells, report

### Community 8 - "sound"
Cohesion: 0.08
Nodes (46): 1단계 → 10/10 : FAIL·WARNING·NOT TESTED 해소, 2단계 → 11 : 몰입·피드백·접근성, 3단계 → 12 : 개념영상 HyperFrames 고도화 + 이 프로젝트만의 연출, 기체 도시 대작전 · 12/10 고도화 계획 (2026-11-09 밤), 오늘 밤 실행 순서, iyeyo(), mountClimate(), move() (+38 more)

### Community 9 - "scripts"
Cohesion: 0.08
Nodes (24): description, engines, node, name, optionalDependencies, sharp@^0.35.4, private, scripts (+16 more)

### Community 10 - "gas-city-operation_deep-design_v2.md"
Cohesion: 0.11
Nodes (18): 0. 문서 목적, 10. Research Kit, 13. Final Report 설계, 16. 최종 인증서, 1. 설계 핵심 한 줄, 20. 태블릿 필수성 체크, 26. 페이지당 에셋 제한, 27. 저장 / 이어하기 (+10 more)

### Community 11 - "map.js"
Cohesion: 0.19
Nodes (12): bindMapCameraPointer(), clear(), release(), createMapCamera(), follow(), update(), mapLabelGuard(), encounterLook (+4 more)

### Community 13 - "mountMap"
Cohesion: 0.25
Nodes (19): voiceForText(), nextMapActivity(), drawEncounterActor(), mountMap(), cancelRoute(), canVisit(), draw(), drawSoli() (+11 more)

### Community 14 - "ref_node_assert"
Cohesion: 0.12
Nodes (19): {chromium}, checks, {chromium}, APP, CONTENT_REVIEW, GASES, STAGES, STANDARDS (+11 more)

### Community 15 - "12. NPC 변화"
Cohesion: 0.10
Nodes (20): 12. NPC 변화, Final Report, Mission 1 후, Mission 2 후, Mission 3 후, Mission 4 후, Mission 5 후, 게임 시작 (+12 more)

### Community 16 - "play-mission.js"
Cohesion: 0.13
Nodes (27): {chromium}, errors, report, solutions, defaults(), freshMission(), load(), directions (+19 more)

### Community 17 - "qa-playback.mjs"
Cohesion: 0.20
Nodes (6): {chromium}, draft(), errors, evidence(), report, root

### Community 18 - "game-voices.js"
Cohesion: 0.32
Nodes (8): controls, narration, createNarration(), play(), stop(), mountNarrationControl(), voiceLines, fixture()

### Community 19 - "audio.js"
Cohesion: 0.07
Nodes (31): 기체 도시 대작전 개념영상 SPEC (HyperFrames), 만들기, 장면 문법 ("실험 노트"), active, config, duckNarration(), effects, init() (+23 more)

### Community 20 - "bindDirectionPad"
Cohesion: 0.27
Nodes (9): bindDirectionPad(), change(), clear(), destroy(), endPointer(), paint(), keyDirections, MAP_VECTORS (+1 more)

### Community 21 - "화면 01 — 도시 비상 신호"
Cohesion: 0.13
Nodes (15): AI SLOP CHECK, CSS/UI, Mission, 과학 개념, 다음 연결, 성공 조건, 실패 상황, 재시도 (+7 more)

### Community 22 - "building-restoration.js"
Cohesion: 0.33
Nodes (9): buildingReveal(), clamp01(), detail(), facades, halo(), lamp(), line(), meeting (+1 more)

### Community 23 - "기본 이미지 프롬프트"
Cohesion: 0.15
Nodes (13): G01 중앙 공기 코어 외장, G02 코어 회전 날개, G03 장치 조립 받침대, G04 공기 저장 풍선 모듈, G05 둥근 노즐, G06 손잡이 밸브, G07 일자 관, G08 90도 굽은 관 (+5 more)

### Community 24 - "createPlayback"
Cohesion: 0.38
Nodes (8): createPlayback(), account(), advance(), clear(), stop(), wait(), mountExperimentPlayer(), setup()

### Community 25 - "map-camera.test.mjs"
Cohesion: 0.33
Nodes (5): bounds, close(), player, same(), size

### Community 26 - "19. 난이도 변수"
Cohesion: 0.67
Nodes (3): 19. 난이도 변수, 기본, 심화

### Community 27 - "scripts/build.mjs"
Cohesion: 0.18
Nodes (10): files, hash, pkg, retired, revision, root, shell, syntax() (+2 more)

### Community 28 - "qa-voices.mjs"
Cohesion: 0.17
Nodes (6): {chromium}, createGain(), errors, report, stageVoice, verified

### Community 30 - "화면 02 — 공기 흐름 작동 시험"
Cohesion: 0.18
Nodes (11): Evidence, Mission, World Change, 성공 조건, 실패 상황, 재시도, 태블릿 조작, 학생 행동 (+3 more)

### Community 31 - "화면 06 — 압력 제어 및 환경 적용"
Cohesion: 0.18
Nodes (11): Evidence, Mission, World Change, 과학적 문구, 금지, 성공 조건, 태블릿 조작, 학생 행동 (+3 more)

### Community 33 - "화면 03 — 기체 무게 계측실"
Cohesion: 0.20
Nodes (10): Mission, 다음 연결, 성공 조건, 실패 상황, 재시도, 태블릿 조작, 학생 행동, 화면 03 — 기체 무게 계측실 (+2 more)

### Community 35 - "prepare-assets.mjs"
Cohesion: 0.20
Nodes (7): manifest, out, props, require, root, sharp, total

### Community 36 - "README.md"
Cohesion: 0.25
Nodes (4): 개념 모션 영상 컷 시트, 주요 개념 그림 고도화 · 2026-10-28, 기체 도시 대작전, 폴더

### Community 37 - "기체 도시 대작전 장별 시나리오 논의안"
Cohesion: 0.22
Nodes (9): 3D 적용 판단, 과학 표현에서 바로잡을 부분, 기존 10개 핵심 활동 화면의 배치, 기체 도시 대작전 장별 시나리오 논의안, 이번 요청에서 확정된 화면 원칙, 장별 시나리오, 전체 이야기, 협의가 필요한 부분 (+1 more)

### Community 38 - "Bonus Quest A — 다른 조건에서도 같을까?"
Cohesion: 0.22
Nodes (9): 18. Bonus Quest, Bonus Quest A — 다른 조건에서도 같을까?, Bonus Quest B — 다른 장치로도 움직일 수 있을까?, 방식, 방식, 보상, 보상, 상황 (+1 more)

### Community 39 - "3-2. 반드시 수정할 것"
Cohesion: 0.22
Nodes (9): 3-1. 유지할 것, 3-2. 반드시 수정할 것, 3. 샘플 페이지 반영 진단, 공통 비주얼, 수정 1 — 압력 화면의 입자 설명 삭제, 수정 2 — 귀여운 구름을 ‘기체 입자’처럼 사용하지 않기, 수정 3 — 여러 기체 정보 카드 범위 정리, 수정 4 — 마지막 화면 자동 완료 구조 금지 (+1 more)

### Community 40 - "화면 04 — 증거 분석 보드"
Cohesion: 0.22
Nodes (9): Evidence, Mission, World Change, 성공 조건, 태블릿 조작, 학생 행동, 화면 04 — 증거 분석 보드, 화면 목적 (+1 more)

### Community 41 - "화면 08 — 기체 배달 관제센터"
Cohesion: 0.22
Nodes (9): Evidence, Mission, World Change, 실패 상황, 재시도, 태블릿 조작, 학생 행동, 화면 08 — 기체 배달 관제센터 (+1 more)

### Community 42 - "화면 09 — 3D 공기 공학실"
Cohesion: 0.22
Nodes (9): Evidence, Mission, World Change, 성공 조건, 태블릿 조작, 학생 행동, 화면 09 — 3D 공기 공학실, 화면 목적 (+1 more)

### Community 43 - "화면 05 — 온도 터널"
Cohesion: 0.22
Nodes (9): Mission, 다음 연결, 성공 조건, 주의, 태블릿 조작, 학생 행동, 화면 05 — 온도 터널, 화면 목적 (+1 more)

### Community 44 - "기체 도시 대작전 교육 내용 점검"
Cohesion: 0.25
Nodes (7): 공통 페이지와 추가 미션, 그림과 근거 관리, 기체 도시 대작전 교육 내용 점검, 수정한 오개념 위험과 조작 문제, 의뢰별 대조, 점검 기준과 학습 순서, 확인 범위

### Community 45 - "15 기체 도시 대작전 개선 기록"
Cohesion: 0.25
Nodes (7): 15 기체 도시 대작전 개선 기록, 개선 프롬프트(이번 적용 기준), 검증, 남은 한계, 이미지·소리, 적용, 학습·중복 점검

### Community 46 - "기체 도시 대작전 TRD 초안"
Cohesion: 0.25
Nodes (7): 구현 후 필요한 검증, 기체 도시 대작전 TRD 초안, 상태와 저장 제안, 입력과 에셋, 책임 분리, 화면 구성 제안, 활동 모델의 원칙

### Community 47 - "자료와 제작 기록"
Cohesion: 0.25
Nodes (7): 2026-10-28 개념 시각 자료 고도화, 2026-11-12 공기 장치 공방 소품, 개념 영상과 동물 친구, 기존 이미지와 글꼴, 나눔스퀘어 네오 UI 글꼴 (2026-11-10), 자료와 제작 기록, 효과음

### Community 48 - "화면 07 — 기체 정보 연구소"
Cohesion: 0.25
Nodes (8): Mission, 다음 연결, 성공 조건, 태블릿 조작, 학생 행동, 화면 07 — 기체 정보 연구소, 화면 목적, 화면 반응

### Community 49 - "15 기체 도시 대작전 · 지도 악당 연계 계획"
Cohesion: 0.29
Nodes (6): 15 기체 도시 대작전 · 지도 악당 연계 계획, 방향과 시선, 세 번의 타격과 접촉 피격, 스테이지마다 바뀌는 소품·자세·대사, 외형과 등장, 제작하고 적용할 순서

### Community 53 - "map-encounters.js"
Cohesion: 0.29
Nodes (10): dockMapAttack(), CUES, layoutSpeech(), mountMapEncounters(), hit(), output(), speak(), update() (+2 more)

### Community 54 - "concept-clips.test.mjs"
Cohesion: 0.31
Nodes (11): box(), esc(), KIT_CSS, px(), renderFilm(), CONCEPT_CLIPS, CONCEPT_LABELS, CONCEPT_SECONDS (+3 more)

### Community 55 - "3D-ASSET-PROMPTS.md"
Cohesion: 0.29
Nodes (6): 3D를 적용할 화면, 기본 이미지 목록, 기체 도시 대작전 3D 기본 이미지와 프롬프트, 별도 필요한 2.5D 픽셀 지도, 생성 후 확인할 것, 제작 기준

### Community 56 - "에셋 검토 목록"
Cohesion: 0.29
Nodes (6): 로고와 캐릭터, 배경 10장, 빠른 미리보기, 새로 필요한 핵심 자료, 에셋 검토 목록, 화면 시안 20장

### Community 57 - "학습 UX 개선 및 검수 기록"
Cohesion: 0.29
Nodes (6): 적용한 내용, 주요 변경 파일, 학습 UX 개선 및 검수 기록, 화면 기록, 확인 결과, 확인 범위와 남은 점

### Community 58 - "기체 도시 대작전 · 2026-11-08 증분 고도화 검토"
Cohesion: 0.29
Nodes (6): 검증 결과, 교육과정·단계 검토, 기체 도시 대작전 · 2026-11-08 증분 고도화 검토, 변경 범위와 보존, 생성 출처·제한, 이번 변경

### Community 59 - "기체 도시 대작전 납품 최종점검"
Cohesion: 0.29
Nodes (6): A~G 요약과 남은 확인, 검증 결과, 기체 도시 대작전 납품 최종점검, 납품 대상, 작업 기록과 실제 파일 대조, 해결한 주요 문제

### Community 60 - "기체 도시 대작전 · 고도화 결과 (2026-11-09 밤 ~ 11-10)"
Cohesion: 0.29
Nodes (6): 개념영상, 검증 명령과 실제 결과 (최종 코드 기준), 기체 도시 대작전 · 고도화 결과 (2026-11-09 밤 ~ 11-10), 남은 일, 미검증과 이유, 바꾼 것

### Community 61 - "개념영상 10편 검토 (2026-11-10)"
Cohesion: 0.29
Nodes (6): 가장 약한 장면, 개념영상 10편 검토 (2026-11-10), 만든 방식과 고른 것, 보기만 한 것 / 아무도 확인 안 한 것, 일부러 둔 것, 잰 것

### Community 62 - "11. World Change 5단계"
Cohesion: 0.29
Nodes (7): 11. World Change 5단계, Final Mission 성공, Mission 1 완료, Mission 2 완료, Mission 3 완료, Mission 4 완료, Mission 5 완료

### Community 63 - "14. Final Mission"
Cohesion: 0.29
Nodes (7): 14. Final Mission, 성공, 실패, 이름, 피드백, 핵심, 행동

### Community 64 - "30. Science World AI SLOP CHECK"
Cohesion: 0.29
Nodes (7): 30. Science World AI SLOP CHECK, CHECK 1, CHECK 2, CHECK 3, CHECK 4, CHECK 5, 추가 CHECK

### Community 65 - "문구"
Cohesion: 0.29
Nodes (7): Evidence, Mission, 기능, 기체 도시 복구 인증서, 문구, 입력, 탐구 스타일

### Community 66 - "자료와 제작 기록"
Cohesion: 0.33
Nodes (5): 개념 영상과 동물 친구, 기존 이미지와 글꼴, 메인 키아트와 여우 에어 (2026-10-30), 자료와 제작 기록, 효과음

### Community 68 - "기체 도시 대작전 PRD 초안"
Cohesion: 0.33
Nodes (6): 공통 UI의 동작 제안, 기체 도시 대작전 PRD 초안, 목적과 대상, 수용 기준 초안, 제안하는 MVP 범위, 확정 요구사항

### Community 69 - "판정: 조건부"
Cohesion: 0.33
Nodes (5): 기체 도시 대작전 · 2026-11-10 추가 품질 검수, 남은 제한, 수정과 검증, 점수의 범위, 판정: 조건부

### Community 70 - "최종점검 성적표 — 기체 도시 대작전 (15 gas)"
Cohesion: 0.33
Nodes (5): 개선 우선순위 (최저 3개), 디자인스킬 13항목 — BEFORE 119/130 → AFTER 125/130, 최종스킬 10항목 — BEFORE 70/100 → AFTER 88/100, 최종점검 성적표 — 기체 도시 대작전 (15 gas), 측정하지 못한 것

### Community 74 - "15. Final Movie 20초 구성"
Cohesion: 0.33
Nodes (6): 15. Final Movie 20초 구성, Scene 1 — 0~3초, Scene 2 — 3~7초, Scene 3 — 7~12초, Scene 4 — 12~17초, Scene 5 — 17~20초

### Community 75 - "17. 탐구 스타일 계산"
Cohesion: 0.33
Nodes (6): 17. 탐구 스타일 계산, 꼼꼼한 관찰자, 끈질긴 실험가, 문제 해결 전문가, 증거 분석가, 창의적 설계자

### Community 76 - "9. Evidence 5종"
Cohesion: 0.33
Nodes (6): 1. 공기 흐름 기록, 2. 기체 무게 측정 기록, 3. 부피 변화 환경 기록, 4. 기체 관제 보고서, 5. 공기 장치 설계도, 9. Evidence 5종

### Community 77 - "21. 공통 UI 설계"
Cohesion: 0.33
Nodes (6): 21. 공통 UI 설계, 금지, 상단, 왼쪽, 중앙, 하단

### Community 78 - "32. 개발용 최종 요약"
Cohesion: 0.33
Nodes (6): 32. 개발용 최종 요약, 5 Mission, Evidence 5, Final, Rendering, Repository

### Community 79 - "4. 기존 설계 진단"
Cohesion: 0.33
Nodes (6): 4. 기존 설계 진단, AI SLOP 위험, 강점, 게임성이 약했던 부분, 태블릿 활용이 약해질 수 있는 부분, 학습지형으로 보일 수 있는 부분

### Community 80 - "7. Mission 1~5 심화 설계"
Cohesion: 0.33
Nodes (6): 7. Mission 1~5 심화 설계, MISSION 01 — 끊어진 공기 동력선, MISSION 02 — 보이지 않는 무게의 증거, MISSION 03 — 변하는 부피의 규칙, MISSION 04 — 도시 기체 관제, MISSION 05 — 공기 복구 장치 설계

### Community 81 - "8. 총 10개 화면 상세 설계"
Cohesion: 0.33
Nodes (6): 8. 총 10개 화면 상세 설계, Phase A — Final Report, Phase B — Final Mission, Phase C — Final Movie, Phase D — Completion, 화면 10 — 최종 관제 본부

### Community 82 - "Audio provenance and release review"
Cohesion: 0.40
Nodes (4): Audio provenance and release review, New sound effects, NPC narration, Preserved existing assets

### Community 83 - "조작 흐름 개선 · 2026-10-28"
Cohesion: 0.40
Nodes (4): 검증 방법, 변경 파일, 입력과 전환, 조작 흐름 개선 · 2026-10-28

### Community 84 - "기체 도시 대작전 · 2026-11-10 이어서 검수"
Cohesion: 0.40
Nodes (4): 공통 변경과 검증 범위, 기체 도시 대작전 · 2026-11-10 이어서 검수, 남은 작업, 실행 결과

### Community 85 - "기체 도시 대작전 최종 성적표"
Cohesion: 0.40
Nodes (4): 개인 디자인 스킬의 13개 확인 항목, 기체 도시 대작전 최종 성적표, 남은 낮은 항목의 다음 검증, 품질 향상을 위해 적용한 순서

### Community 86 - "23. 3D 사용 확정"
Cohesion: 0.40
Nodes (5): 23. 3D 사용 확정, Screen 01, Screen 06 일부, Screen 09, Screen 10

### Community 87 - "5. 단원 메인 퀘스트"
Cohesion: 0.40
Nodes (5): 5. 단원 메인 퀘스트, NPC 의뢰, 사건 — 기체 도시의 공기 코어 정지, 에어 — 여우 발명가, 최종 목표

### Community 93 - "public/assets/concepts/manifest.json"
Cohesion: 0.50
Nodes (3): files, generated, method

### Community 94 - "public/assets/concepts-v2/manifest.json"
Cohesion: 0.50
Nodes (3): files, generated, method

### Community 95 - "public/assets/visuals/manifest.json"
Cohesion: 0.50
Nodes (3): assets, generated, method

### Community 96 - "22. 캐릭터 기능 분리"
Cohesion: 0.50
Nodes (4): 22. 캐릭터 기능 분리, 루미, 에어, 포포

### Community 97 - "25. 샘플 이미지 → 실제 구현 변환 원칙"
Cohesion: 0.50
Nodes (4): 25. 샘플 이미지 → 실제 구현 변환 원칙, CSS/DOM으로 만들 것, 이미지로 만들 것, 이유

### Community 98 - "mountWelcomeVoice"
Cohesion: 0.67
Nodes (3): mountWelcomeVoice(), fail(), stop()

### Community 101 - "24. 구현 시 과학 피드백 문구 원칙"
Cohesion: 0.67
Nodes (3): 24. 구현 시 과학 피드백 문구 원칙, 사용, 사용하지 않음

### Community 106 - "ref_node_test"
Cohesion: 0.17
Nodes (4): {chromium}, fixture(), root, worker()

### Community 107 - "qa-responsive.mjs"
Cohesion: 0.20
Nodes (10): audit(), check(), {chromium}, errors, failures, output, report, resources (+2 more)

## Knowledge Gaps
- **8 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `8. 총 10개 화면 상세 설계` connect `8. 총 10개 화면 상세 설계` to `화면 03 — 기체 무게 계측실`, `화면 04 — 증거 분석 보드`, `화면 08 — 기체 배달 관제센터`, `gas-city-operation_deep-design_v2.md`, `화면 05 — 온도 터널`, `화면 09 — 3D 공기 공학실`, `화면 07 — 기체 정보 연구소`, `화면 01 — 도시 비상 신호`, `화면 02 — 공기 흐름 작동 시험`, `화면 06 — 압력 제어 및 환경 적용`?**
  _High betweenness centrality (0.032) - this node is a cross-community bridge._
- **Are the 2 inferred relationships involving `mountMap()` (e.g. with `draw()` and `resize()`) actually correct?**
  _`mountMap()` has 2 INFERRED edges - model-reasoned connections that need verification._
- **Should `ref_node_fs` be split into smaller, more focused modules?**
  _Cohesion score 0.11052631578947368 - nodes in this community are weakly interconnected._
- **Why does `icon()` connect `main.js` to `sound`, `map.js`, `mountMap`, `play-mission.js`, `audio.js`, `createPlayback`?**
  _High betweenness centrality (0.025) - this node is a cross-community bridge._
- **Should `main.js` be split into smaller, more focused modules?**
  _Cohesion score 0.06453888203138776 - nodes in this community are weakly interconnected._
- **Why does `mountMap()` connect `mountMap` to `model.test.mjs`, `main.js`, `map.js`, `bindDirectionPad`, `map-encounters.js`, `building-restoration.js`?**
  _High betweenness centrality (0.024) - this node is a cross-community bridge._
- **Should `render.mjs` be split into smaller, more focused modules?**
  _Cohesion score 0.11428571428571428 - nodes in this community are weakly interconnected._