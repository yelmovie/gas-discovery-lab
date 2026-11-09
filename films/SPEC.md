# 기체 도시 대작전 개념영상 SPEC (HyperFrames)

- 10편: flow · weight · temperature · pressure · nitrogen · oxygen · carbon · extinguisher · engineering · car (앱 `conceptFor()`의 id와 같음)
- 길이 12초, 1920×1080 30fps로 렌더 → 앱용 1280×720 H.264 mp4(faststart) + VP9 webm + 마지막 장면 webp(포스터·동작 줄이기 대체). 소리 없음(앱이 `muted` 자동재생).
- 시간표는 `src/concept-clips.js` 한 곳: `CONCEPT_SECONDS=12`, `CUE_SECONDS=4`. 장면 0·1·2 = 앱 자막 0·1·2 = 장면 버튼 0·4·8초.

## 장면 문법 ("실험 노트")
| 시각 | 무엇 |
|---|---|
| 0.1 s | 실험 소품이 이미 놓여 있음(첫 장면이 비지 않음) |
| 0.15–0.9 s | 질문 한 줄, 단어마다 6px 흐림 → 선명(0.16 s, 0.08 s 간격). 자리 잡은 뒤 움직이지 않음 |
| 장면 시작 + 1.1 s | 그 장면의 이름표(앱 장면 버튼 이름과 같은 말)가 해당 물체 위에 붙음, 다음 장면 0.25 s 전에 떨어짐 |
| 장면 1 + 0.9 s | 바뀐 곳으로 1.12–1.22배 당겨 보기(0.75 s power2.inOut), 장면 2 0.35 s 전 되돌림 |
| 9.0 s | 결론 한 줄(강조어 하나만 금색), 질문은 55%로 흐려짐 |
| 9.35 s | 바람여우 솔이 등장(back.out 1.6) → 10.1 s 고개 끄덕(연기) |

- 공기의 흐름은 점선이 흐르는 화살로만 보인다. **입자 점·분자 모형은 쓰지 않는다**(4과15-02 범위 밖).
- 그림: 게임 소품(`public/assets`) 그대로. 코드로 그린 것은 질소 탱크, 물통(따뜻한/차가운 물), 저울 눈금판, 컵 뚜껑, 기체 비율 막대, 밸브, 길 표시뿐.
- 숫자: 무게 편 151.6 → 154.8 → 150.0 g은 게임 모델 `massFor(공기량)`과 같은 계산(150 + 0.08×공기량).
- 금지: 어두운 바탕 네온·빛번짐, 떠다니는 장식 입자, 보라/파랑 그라데이션, 01/02 번호, 카드 셋 나란히, 동시 페이드업, 읽는 동안 움직이는 글자, 무한 반복(`repeat:-1`).

## 만들기
```
node films/build.mjs                       # 데이터 → films/<id>/index.html + assets
(cd films/<id> && hyperframes check --json) # 오류 0
SHARP_MODULE=<sharp 경로> RENDER_DIR=<외장 SSD 폴더> node films/render.mjs [id...]
npm run media:verify                       # 해시·크기·실제 길이 12초·2.5MB 이하
```
