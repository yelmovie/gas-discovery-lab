#!/usr/bin/env python3
"""15번 개념 영상 자막 입히기 (2026-11-18).

공용 도구 _shared/caption-motion-20261118/burn.py를 그대로 쓰고, 이 프로젝트에만 필요한 두 가지를 더한다.
  1) 큐마다 최소 상자 너비 "min_w"(1920x1080 기준): 셋째 장면(9초쯤)부터 영상 속 결론 말풍선이
     화면 아래 가운데(y 858–985)에 뜨는데, 셋째 자막 상자가 그 말풍선을 완전히 덮도록 너비를 맞춘다.
  2) 자막 상자를 불투명하게(&H2E& → &H00&): 덮인 말풍선 글자가 비쳐 보이지 않게.
실행: ~/.local/share/uv/tools/earshot/bin/python burn-concepts.py <id>.json [--preview 초 출력.png]
"""
import sys
sys.path.insert(0, '/Volumes/T7 Shield/iscreammedia_sc34/_shared/caption-motion-20261118')
import burn

REAL = burn.font
ORIG = burn.build_ass

class AtLeast:  # 상자 너비 계산(font.getlength)만 최소값으로 올린다. 글자 크기·줄바꿈 판단은 그대로.
    def __init__(self, real, least): self.real, self.least = real, least
    def getlength(self, text): return max(self.real.getlength(text), self.least)

def build_ass(film):
    head, events = None, []
    for cue in film['cues']:
        burn.font = AtLeast(REAL, max(0, cue.get('min_w', 0) - 2 * burn.PAD_X))
        try: text = ORIG(dict(film, cues=[cue]))
        finally: burn.font = REAL
        lines = text.split('\n')
        first = next(i for i, l in enumerate(lines) if l.startswith('Dialogue:'))
        if head is None: head = '\n'.join(lines[:first])
        events += [l for l in lines[first:] if l.startswith('Dialogue:')]
    return (head + '\n' + '\n'.join(events) + '\n').replace('\\1a&H2E&', '\\1a&H00&')

burn.build_ass = build_ass

if __name__ == '__main__':
    a = sys.argv[1:]
    if len(a) >= 4 and a[1] == '--preview': print(burn.render(a[0], (float(a[2]), a[3])))
    else: print(burn.render(a[0]))
