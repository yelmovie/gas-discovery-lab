# 기체 도시 대작전

초등 과학 탐구 게임이야. 다섯 연구시설의 20개 의뢰를 풀고 중앙 공기 코어를 복구해.

2026-10-30 메인·지도 고도화: 다른 차시(우당탕 힘 실험실·동물기록 복구작전·초록정원 연구기지·생명시계 연구실)의 메인·지도 방식을 참고해 메인 키아트와 여우 에어를 새로 만들었어. 지도는 더 가까이 확대해 화면을 꽉 채우고, 끌어서 둘러보기·손으로 밀기·지도 한눈에·내 위치로 버튼과 다음 목적지 카드를 넣었어. 교사용 관리자 전체 해금을 켜면 지도에는 바로 입장 버튼이, 시설·의뢰 화면에는 왼쪽 교사용 방향키(← → 단계, ↑ ↓ 시설)와 오른쪽 아래 다음 단계로 버튼이 나와 활동을 하지 않고도 20개 의뢰와 마지막 코어까지 넘겨 볼 수 있어.

2026-10-28 이미지 고도화: 관·피스톤·풍선 자동차·호흡 장치·소화기·공기 코어 등 독립 투명 이미지 12종과 그림 기반 개념 영상 10종을 적용했어. 팬은 날개만 회전하고, 온도 실험은 풍선 하나 안에 같은 수의 입자를 유지해. `npm run media:render:v2`로 새 개념 영상을 재생성할 수 있어.

- [이미지 생성 프롬프트와 제작 기록](docs/review/IMAGE-GENERATION-PROMPTS.json)
- [이미지 고도화 검수 기록](docs/review/VISUAL-UPGRADE-REVIEW.md)

2026-10-28 업데이트: 20개 의뢰의 반복 클릭을 줄였어. 바람길 연속 시험, 무게 자동 비교, 부피 자동 기록, 기체 즉시 배송, 부품 한 번 눌러 조립을 적용했어. 성공 증거는 자동 저장하고 개념 영상은 선택해서 볼 수 있어. 재탐구·이어하기·키보드 포커스와 피스톤 터치도 다듬었어.

- [조작 개선·검수 기록](docs/review/PLAY-FLOW-REVIEW.md)

2026-10-22 업데이트: 9초 개념 모션 영상 10종, 바람여우 솔이의 단계별 힌트, 터치 드래그·피스톤 밀기·펌프 길게 누르기, 태블릿·전자칠판 레이아웃, CC0 효과음을 적용했어.

```powershell
npm run dev      # http://127.0.0.1:4176
npm test
npm run build    # 배포용 dist/ 생성
npm run preview  # dist/ 실행
```

운영 주소: https://gas-discovery-lab.yelsam.workers.dev/. 연결된 상태에서 다시 열면 HTML, 실행 코드, 글꼴을 서버에서 먼저 확인해 이전 캐시가 화면을 가리지 않는다. 오프라인 준비를 켠 기기에서는 새 버전의 실행 파일을 먼저 저장하고, 나머지 자료가 다 저장될 때까지 직전 오프라인 자료를 보관한다. 학습 기록은 별도로 유지한다.

- [구현·검수 기록](docs/review/LEARNING-UX-REVIEW.md)
- [개념 영상 컷 시트](docs/review/CONCEPT-STORYBOARD.md)
- [이미지·효과음 이용 조건](assets/CREDITS.md)

개념 영상 재생성은 `npm run media:render`로 해. sharp와 FFmpeg가 필요하며, `SHARP_MODULE`·`FFMPEG` 환경 변수로 기존 도구 경로를 지정할 수 있어. `npm run media:verify`는 영상 전체 디코딩과 해시를 검사해.

`npm run qa:browser`와 `npm run qa:layout`은 실행 중인 개발 서버와 Chrome, playwright-core가 필요해. 모듈이 다른 위치에 있으면 `PLAYWRIGHT_MODULE`로 지정해. 별도 브라우저 저장소를 사용하며 실제 사용자의 학습 기록을 바꾸지 않아.

- [장별 시나리오와 논의안](docs/planning/SCENARIO.md)
- [PRD 초안](docs/PRD.md)
- [TRD 초안](docs/TRD.md)
- [3D 기본 이미지 목록과 프롬프트](docs/planning/3D-ASSET-PROMPTS.md)
- [별도 편집 문서에서 프롬프트 보기](https://chatgpt.com/space/page_6a0750a3c1708191bcbe4fa1b4a45a11)
- [에셋 검토 목록](docs/review/ASSET-INDEX.md)
- [기존 심화 설계 원문](references/design/gas-city-operation_deep-design_v2.md)

## 폴더

```text
assets/references/screens/       화면 시안 01~20
assets/references/backgrounds/   배경 21~30
assets/references/branding/      로고 31
assets/references/characters/    캐릭터 포즈 모음 32~34
references/design/              전달받은 설계 원문
docs/planning/                  대화용 시나리오와 이미지 제작 계획
docs/review/                    이미지 모아보기, 메타데이터, 이동 기록
docs/PRD.md                     제품 요구사항 초안
docs/TRD.md                     기술 설계 초안
```

원본 35개는 파일명을 유지해 분류했고, 이동 전후 SHA-256이 모두 같아. 이동 경로는 `docs/review/file-moves.json`에 있어. 압축파일은 발견되지 않았어.

이번 요청을 기존 문서보다 우선해. **메인 다음의 선택 지도는 숲·강·언덕 속에 연구시설 5곳을 배치한 자연형 마을로 확정했어. 이 지도만 사선 시점의 2.5D 픽셀 RPG이고, 장소에 들어간 뒤에는 기존 샘플 스타일의 2D 활동 화면이야.** 3D 오브젝트 보기는 별도 검토안이야.
