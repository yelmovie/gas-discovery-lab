# 완성 영상에서 장면마다 자막이 떠 있는 순간 한 장씩 뽑아 2×2로 붙인다 → .tmp/films-finish-20261121/<film>-sheet.png
import json, subprocess, sys
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont
R = Path(__file__).resolve().parents[2]; O = R / '.tmp/films-finish-20261121'
for film in sys.argv[1:] or ['intro', 'final']:
    b = json.load(open(R / f'docs/film-captions-20261121/{film}-built.json'))
    # 장면마다 첫 큐의 말 끝 직전(스윕이 거의 다 된 때), 끝 카드는 마지막 큐 끝 무렵
    at, times = 0, []
    for s in b['scenes']:
        cs = [c for c in b['cues'] if at <= c['s'] < at + s['len'] - .4]
        times.append(round((cs[-1]['speech'][1] - .3) if s['name'] == 'card' and cs else (cs[0]['speech'][1] - .4) if cs else at + 2, 2))
        at += s['len'] - .4
    tiles = []
    for t in times:
        p = O / f'{film}-{t}.png'
        subprocess.run(['ffmpeg', '-v', 'error', '-y', '-ss', str(t), '-i', str(R / f'public/assets/films-story/{film}-film.mp4'), '-frames:v', '1', str(p)], check=True)
        tiles.append((t, Image.open(p).convert('RGB').resize((960, 540))))
    sheet = Image.new('RGB', (1920, 1080 + 60), (20, 63, 67)); d = ImageDraw.Draw(sheet)
    f = ImageFont.truetype('/Volumes/T7 Shield/iscreammedia_sc34/_shared/caption-motion-20261118/fonts/Jua-Regular.ttf', 30)
    for i, (t, im) in enumerate(tiles):
        x, y = (i % 2) * 960, 60 + (i // 2) * 540; sheet.paste(im, (x, y))
        d.text((x + 12, y + 8), f"{b['scenes'][i]['name']} ({b['scenes'][i]['source']}) {t:.1f}s", font=f, fill=(255, 244, 217), stroke_width=3, stroke_fill=(20, 40, 40))
    d.text((16, 14), f"{film} film {b['seconds']:.1f}s · {b['bytes']/1e6:.1f}MB", font=f, fill=(245, 218, 161))
    sheet.save(O / f'{film}-sheet.png'); print(O / f'{film}-sheet.png', times)
