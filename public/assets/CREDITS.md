# 자료와 제작 기록

## 2026-10-28 개념 시각 자료 고도화

내장 image_gen으로 독립 투명 이미지 12종을 생성했다. 새 관 3종, 피스톤 하우징·플런저 2종, 풍선 자동차, 중앙 코어, 산소 호흡 지원 장치, 이산화탄소 소화기, 빈 유리병, 고정 팬 하우징·별도 회전 날개다. 팬 하우징은 기존 프로젝트 팬 그림에서 날개만 제거하는 편집으로 제작했다. 사용본은 `public/assets/visuals/`, 원본 PNG는 `asset-bank/original/`, 프롬프트는 `docs/review/IMAGE-GENERATION-PROMPTS.json`에 보관했다. 웹용 변환은 크기 조절과 알파를 유지한 WebP 인코딩만 사용했다.

그림 기반 개념 영상 10편은 기존·신규 소품 이미지를 활용한 프로젝트 자체 모션 그래픽이다. `scripts/render-concepts-v2.mjs`가 이미지 배치와 부피·입자·방향 변화를 코드로 제어하며, `public/assets/concepts-v2/`에 각 9초 WebM·MP4·대표 장면 WebP를 만든다. 한국어 자막과 UI는 앱에서 제공한다. 기존 영상 원본은 `public/assets/concepts/`에 남아 있다.

## 효과음

Kenney, **Interface Sounds 1.0** — https://kenney.nl/assets/interface-sounds

- 이용 조건: Creative Commons Zero 1.0 Universal (CC0). 교육·상업 이용 및 수정 허용.
- 공식 배포 ZIP에서 2026-10-22 내려받음. 라이선스 원문: `public/assets/audio/Kenney-CC0.txt`.
- `tap.mp3` ← `click_003.ogg`
- `rotate.mp3` ← `switch_004.ogg`
- `pump.mp3` ← `scroll_003.ogg`
- `connect.mp3` ← `drop_003.ogg`
- `success.mp3` ← `confirmation_002.ogg`
- `award.mp3` ← `confirmation_004.ogg`
- `hint.mp3` ← `question_001.ogg`
- FFmpeg로 MP3 변환 및 끝부분 페이드 적용. 배경 음악과 파일 실패 시 대체 효과음은 자체 Web Audio 합성.

## 개념 영상과 동물 친구

프로젝트 자체 제작 SVG 모션 그래픽 10편, 각 9초·1280×720·24fps. `scripts/render-concepts.mjs`로 sharp → FFmpeg 렌더링. WebM(VP9), MP4(H.264/yuv420p/faststart), 마지막 장면 WebP. 영상 안에는 문자를 굽지 않고 앱에서 한국어 자막을 제공함. 파일 크기와 SHA-256은 `public/assets/concepts/manifest.json` 참조.

바람여우 **솔이**: 프로젝트에서 직접 그린 SVG(`public/assets/soli.svg`). 학생 캐릭터의 이동 궤적을 따라가며 활동별 단계 힌트를 제공함.

## 기존 이미지와 글꼴

배경·학생·연구원·실험 소품: 사용자 제공 이미지 및 기존 프로젝트의 AI 생성 에셋. 제목용 Jua: Woowahan Brothers / Google Fonts, SIL Open Font License 1.1(`public/assets/fonts/`의 라이선스 참조).

외부 CC0 음원과 OFL 글꼴에는 각 공개 라이선스가 적용된다. 자체 제작 자료의 저작권 고지가 이를 제한하지 않는다.

## 나눔스퀘어 네오 UI 글꼴 (2026-11-10)

네이버 공식 배포 원본 WOFF2 Regular/Bold를 수정 없이 함께 제공한다.
- 공식 안내: https://campaign.naver.com/nanumsquare_neo/
- 원본: https://campaign.naver.com/nanumsquare_neo/download/NaverNanumSquareNeo.zip
- 라이선스: SIL Open Font License 1.1. 전체 저작권 안내·전문은 `fonts/NanumSquareNeo-OFL.txt`.
- 기존 영상·삽화에 포함된 글자는 영상 제작 당시 글꼴을 유지한다.
