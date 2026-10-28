# Graph Report - 15 gas  (2026-10-22)

## Corpus Check
- 40 files · ~3,241,126 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 562 nodes · 1103 edges · 51 communities (49 shown, 2 thin omitted)
- Extraction: 97% EXTRACTED · 3% INFERRED · 0% AMBIGUOUS · INFERRED: 32 edges (avg confidence: 0.85)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- main.js
- model.test.mjs
- render-concepts.mjs
- audio.js
- model.js
- 12. NPC 변화
- package.json
- gas-city-operation_deep-design_v2.md
- 화면 01 — 도시 비상 신호
- 기본 이미지 프롬프트
- 화면 02 — 공기 흐름 작동 시험
- 화면 06 — 압력 제어 및 환경 적용
- 화면 03 — 기체 무게 계측실
- prepare-assets.mjs
- 기체 도시 대작전 장별 시나리오 논의안
- Bonus Quest A — 다른 조건에서도 같을까?
- 3-2. 반드시 수정할 것
- 화면 04 — 증거 분석 보드
- 화면 08 — 기체 배달 관제센터
- 화면 09 — 3D 공기 공학실
- 화면 05 — 온도 터널
- 화면 07 — 기체 정보 연구소
- 3D-ASSET-PROMPTS.md
- 에셋 검토 목록
- 기체 도시 대작전 TRD 초안
- 11. World Change 5단계
- 14. Final Mission
- 30. Science World AI SLOP CHECK
- 문구
- build.mjs
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
- serve.mjs
- manifest.json
- 22. 캐릭터 기능 분리
- 25. 샘플 이미지 → 실제 구현 변환 원칙
- 19. 난이도 변수
- 24. 구현 시 과학 피드백 문구 원칙
- CONCEPT-STORYBOARD.md

## God Nodes (most connected - your core abstractions)
1. `button()` - 35 edges
2. `sound()` - 33 edges
3. `icon()` - 33 edges
4. `escapeHTML()` - 22 edges
5. `html()` - 22 edges
6. `openConcept()` - 21 edges
7. `navigate()` - 21 edges
8. `mountMap()` - 19 edges
9. `message()` - 17 edges
10. `openSettings()` - 16 edges

## Surprising Connections (you probably didn't know these)
- `deliver()` --calls--> `validateDelivery()`  [EXTRACTED]
  src/activities/delivery.js → src/model.js
- `mountFlow()` --calls--> `icon()`  [EXTRACTED]
  src/activities/flow.js → src/icons.js
- `mountFlow()` --calls--> `prop()`  [EXTRACTED]
  src/activities/flow.js → src/ui.js
- `renderGrid()` --calls--> `sound()`  [EXTRACTED]
  src/activities/flow.js → src/audio.js
- `renderGrid()` --calls--> `button()`  [EXTRACTED]
  src/activities/flow.js → src/ui.js

## Import Cycles
- None detected.

## Communities (51 total, 2 thin omitted)

### Community 0 - "main.js"
Cohesion: 0.10
Nodes (69): mountClimate(), renderRecords(), update(), mountDelivery(), deliver(), render(), renderInformation(), save() (+61 more)

### Community 1 - "model.test.mjs"
Cohesion: 0.13
Nodes (32): APP, GASES, STAGES, STANDARDS, STORY, imageCache, loadImage(), mountMap() (+24 more)

### Community 2 - "render-concepts.mjs"
Cohesion: 0.20
Nodes (31): arrow(), balloon(), C, car(), carbon(), circle(), clips, dots() (+23 more)

### Community 3 - "audio.js"
Cohesion: 0.14
Nodes (23): active, buffers, config, effectBuffer(), effectNames, init(), notes, quietAudio() (+15 more)

### Community 4 - "model.js"
Cohesion: 0.14
Nodes (19): mountFlow(), bindSupply(), renderGrid(), save(), pipeSVG(), mountWeight(), renderRecords(), save() (+11 more)

### Community 5 - "12. NPC 변화"
Cohesion: 0.10
Nodes (20): 12. NPC 변화, Final Report, Mission 1 후, Mission 2 후, Mission 3 후, Mission 4 후, Mission 5 후, 게임 시작 (+12 more)

### Community 6 - "package.json"
Cohesion: 0.11
Nodes (18): description, engines, node, name, optionalDependencies, sharp, private, scripts (+10 more)

### Community 7 - "gas-city-operation_deep-design_v2.md"
Cohesion: 0.11
Nodes (18): 0. 문서 목적, 10. Research Kit, 13. Final Report 설계, 16. 최종 인증서, 1. 설계 핵심 한 줄, 20. 태블릿 필수성 체크, 26. 페이지당 에셋 제한, 27. 저장 / 이어하기 (+10 more)

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

### Community 13 - "prepare-assets.mjs"
Cohesion: 0.20
Nodes (7): manifest, out, props, require, root, sharp, total

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

### Community 22 - "3D-ASSET-PROMPTS.md"
Cohesion: 0.29
Nodes (6): 3D를 적용할 화면, 기본 이미지 목록, 기체 도시 대작전 3D 기본 이미지와 프롬프트, 별도 필요한 2.5D 픽셀 지도, 생성 후 확인할 것, 제작 기준

### Community 23 - "에셋 검토 목록"
Cohesion: 0.29
Nodes (6): 로고와 캐릭터, 배경 10장, 빠른 미리보기, 새로 필요한 핵심 자료, 에셋 검토 목록, 화면 시안 20장

### Community 24 - "기체 도시 대작전 TRD 초안"
Cohesion: 0.29
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

### Community 29 - "build.mjs"
Cohesion: 0.29
Nodes (4): files, pkg, root, target

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
Cohesion: 0.40
Nodes (4): 개념 영상과 동물 친구, 기존 이미지와 글꼴, 자료와 제작 기록, 효과음

### Community 41 - "자료와 제작 기록"
Cohesion: 0.40
Nodes (4): 개념 영상과 동물 친구, 기존 이미지와 글꼴, 자료와 제작 기록, 효과음

### Community 42 - "23. 3D 사용 확정"
Cohesion: 0.40
Nodes (5): 23. 3D 사용 확정, Screen 01, Screen 06 일부, Screen 09, Screen 10

### Community 43 - "5. 단원 메인 퀘스트"
Cohesion: 0.40
Nodes (5): 5. 단원 메인 퀘스트, NPC 의뢰, 사건 — 기체 도시의 공기 코어 정지, 에어 — 여우 발명가, 최종 목표

### Community 44 - "serve.mjs"
Cohesion: 0.40
Nodes (4): port, production, root, types

### Community 45 - "manifest.json"
Cohesion: 0.50
Nodes (3): files, generated, method

### Community 46 - "22. 캐릭터 기능 분리"
Cohesion: 0.50
Nodes (4): 22. 캐릭터 기능 분리, 루미, 에어, 포포

### Community 47 - "25. 샘플 이미지 → 실제 구현 변환 원칙"
Cohesion: 0.50
Nodes (4): 25. 샘플 이미지 → 실제 구현 변환 원칙, CSS/DOM으로 만들 것, 이미지로 만들 것, 이유

### Community 48 - "19. 난이도 변수"
Cohesion: 0.67
Nodes (3): 19. 난이도 변수, 기본, 심화

### Community 49 - "24. 구현 시 과학 피드백 문구 원칙"
Cohesion: 0.67
Nodes (3): 24. 구현 시 과학 피드백 문구 원칙, 사용, 사용하지 않음

## Knowledge Gaps
- **304 isolated node(s):** `name`, `version`, `private`, `type`, `description` (+299 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **2 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `8. 총 10개 화면 상세 설계` connect `8. 총 10개 화면 상세 설계` to `gas-city-operation_deep-design_v2.md`, `화면 01 — 도시 비상 신호`, `화면 02 — 공기 흐름 작동 시험`, `화면 06 — 압력 제어 및 환경 적용`, `화면 03 — 기체 무게 계측실`, `화면 04 — 증거 분석 보드`, `화면 08 — 기체 배달 관제센터`, `화면 09 — 3D 공기 공학실`, `화면 05 — 온도 터널`, `화면 07 — 기체 정보 연구소`?**
  _High betweenness centrality (0.152) - this node is a cross-community bridge._
- **Why does `12. NPC 변화` connect `12. NPC 변화` to `gas-city-operation_deep-design_v2.md`?**
  _High betweenness centrality (0.035) - this node is a cross-community bridge._
- **Why does `화면 01 — 도시 비상 신호` connect `화면 01 — 도시 비상 신호` to `8. 총 10개 화면 상세 설계`?**
  _High betweenness centrality (0.026) - this node is a cross-community bridge._
- **What connects `name`, `version`, `private` to the rest of the system?**
  _304 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `main.js` be split into smaller, more focused modules?**
  _Cohesion score 0.09786208973200843 - nodes in this community are weakly interconnected._
- **Should `model.test.mjs` be split into smaller, more focused modules?**
  _Cohesion score 0.13333333333333333 - nodes in this community are weakly interconnected._
- **Should `audio.js` be split into smaller, more focused modules?**
  _Cohesion score 0.14492753623188406 - nodes in this community are weakly interconnected._