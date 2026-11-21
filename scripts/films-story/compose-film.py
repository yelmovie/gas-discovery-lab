#!/usr/bin/env python3
"""인트로·파이널 한 편 영상 합성 (2026-11-21, 과학34 영상 마무리 지침).

장면 원본(Flow·Gemini 영상, 없으면 임시 판 kb/) 3개 + 끝 카드 1개를 0.4초 교차 페이드로 잇고,
ElevenLabs 목소리(앱과 같은 파일) + 배경음(목소리 나올 때 낮춤) + 영상 안 자막(공용 burn.py의 ASS)을 한 번에 굽는다.
끝 카드 모션(제목 로고·호기심 한 줄 / 축하 도장·반짝임·공기 방울)은 PIL로 그린 투명 프레임을 겹친다.

실행: ~/.local/share/uv/tools/earshot/bin/python scripts/films-story/compose-film.py [intro|final ...]
큐 원본: docs/film-captions-20261121/<film>.json (자막 글은 목소리와 글자 그대로, [키워드] 강조)
결과: public/assets/films-story/<film>-film.mp4, <film>-film.jpg(포스터)
"""
import json, math, random, subprocess, sys, importlib.util
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont, ImageFilter

ROOT = Path(__file__).resolve().parents[2]
SHARED = ROOT.parent / '_shared' / 'caption-motion-20261118'
SRC = ROOT / 'asset-bank/original/generated-20261121-films'
OUT = ROOT / 'public/assets/films-story'
VOICE = ROOT / 'public/assets/audio/voices'
BGM = ROOT / 'public/assets/audio/bgm'
WORK = ROOT / '.tmp/films-finish-20261121/work'
CUES = ROOT / 'docs/film-captions-20261121'
W, H, FPS, XF = 1280, 720, 24, 0.4
FONT = SHARED / 'fonts' / 'Jua-Regular.ttf'

spec = importlib.util.spec_from_file_location('burn', SHARED / 'burn.py'); burn = importlib.util.module_from_spec(spec); spec.loader.exec_module(burn)

def run(*a): subprocess.run(['ffmpeg', '-nostdin', '-v', 'error', '-y', *map(str, a)], check=True)
def dur(f): return float(subprocess.run(['ffprobe', '-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', str(f)], capture_output=True, text=True).stdout)

def source(name):
    for d in ('flow', 'kb'):
        f = SRC / d / f'{name}.mp4'
        if f.exists() and f.stat().st_size > 0: return f, d
    sys.exit(f'{name}: 원본 없음')

def ease(x): x = min(1, max(0, x)); return 1 - (1 - x) ** 3
def pop(x):  # 살짝 넘쳤다 돌아오는 등장
    x = min(1, max(0, x)); c = 1.70158; return 1 + (c + 1) * (x - 1) ** 3 + c * (x - 1) ** 2

def bubbles(draw, t, n, seed, alpha=110):
    rnd = random.Random(seed)
    for i in range(n):
        x0, r, sp, ph = rnd.uniform(40, W - 40), rnd.uniform(5, 16), rnd.uniform(45, 95), rnd.uniform(0, 9)
        y = H + 30 - ((t + ph) * sp) % (H + 80); x = x0 + 14 * math.sin((t + ph) * 1.3)
        a = int(alpha * min(1, (H - y) / 200 + .2) * min(1, y / 160))
        if a > 0: draw.ellipse([x - r, y - r, x + r, y + r], outline=(255, 250, 230, a), width=2); draw.ellipse([x - r * .45, y - r * .55, x - r * .05, y - r * .15], fill=(255, 255, 255, a))

def star(draw, cx, cy, s, col):
    pts = []
    for k in range(8):
        ang = k * math.pi / 4; rr = s if k % 2 == 0 else s * .32
        pts.append((cx + rr * math.cos(ang), cy + rr * math.sin(ang)))
    draw.polygon(pts, fill=col)

def card_frames(kind, length, folder):
    folder.mkdir(parents=True, exist_ok=True)
    for old in folder.glob('*.png'): old.unlink(missing_ok=True)  # exFAT의 ._ 짝 파일은 본 파일과 함께 사라진다
    big = ImageFont.truetype(str(FONT), 46); stampf = ImageFont.truetype(str(FONT), 78); sub = ImageFont.truetype(str(FONT), 40)
    logo = Image.open(ROOT / 'public/assets/logo.webp').convert('RGBA')
    n = int(round(length * FPS))
    for i in range(n):
        t = i / FPS; im = Image.new('RGBA', (W, H), (0, 0, 0, 0)); d = ImageDraw.Draw(im)
        if kind == 'intro':
            bubbles(d, t, 16, 7, 90)
            k = ease((t - .4) / .9)
            if k > 0:
                lw = int(720 * (.86 + .14 * k)); lg = logo.resize((lw, int(lw * logo.height / logo.width)), Image.LANCZOS)
                sh = Image.new('RGBA', lg.size, (8, 32, 36, 0)); sh.putalpha(lg.split()[3].point(lambda v: int(v * .55))); sh = sh.filter(ImageFilter.GaussianBlur(10))
                a = lg.split()[3].point(lambda v: int(v * k)); lg.putalpha(a); sh.putalpha(sh.split()[3].point(lambda v: int(v * k)))
                x, y = (W - lw) // 2, int(78 - 18 * (1 - k)); im.alpha_composite(sh, (x + 4, y + 10)); im.alpha_composite(lg, (x, y))
            k2 = ease((t - 1.4) / .7)
            if k2 > 0:
                line = '공기 코어를 다시 움직일 수 있을까?'; tw = d.textlength(line, font=big); x, y = (W - tw) / 2, 352 + 16 * (1 - k2)
                pad = 26; d.rounded_rectangle([x - pad, y - 14, x + tw + pad, y + 62], 30, fill=(20, 63, 67, int(200 * k2)), outline=(213, 170, 88, int(255 * k2)), width=3)
                d.text((x, y - 2), line, font=big, fill=(255, 244, 217, int(255 * k2)))
        else:
            bubbles(d, t, 26, 11, 120)
            rnd = random.Random(5)
            for s in range(22):  # 도장이 찍힐 때 사방으로 퍼지는 반짝임
                ang, sp, sz = rnd.uniform(0, 2 * math.pi), rnd.uniform(180, 420), rnd.uniform(7, 15)
                u = t - .75 - s * .015
                if 0 < u < 1.6:
                    r = sp * ease(u / 1.2); a = int(255 * (1 - u / 1.6))
                    star(d, W / 2 + r * math.cos(ang), 230 + r * .7 * math.sin(ang), sz * (1 - u / 2.2), (245, 218, 161, a) if s % 2 else (255, 255, 255, a))
            k = pop((t - .6) / .55)
            if t > .6:
                sc = max(.01, k); R = int(176 * sc); cx, cy = W // 2, 222
                st = Image.new('RGBA', (W, H), (0, 0, 0, 0)); sd = ImageDraw.Draw(st)
                sd.ellipse([cx - R, cy - R, cx + R, cy + R], fill=(20, 63, 67, 235), outline=(213, 170, 88, 255), width=max(2, int(9 * sc)))
                sd.ellipse([cx - R + int(18 * sc), cy - R + int(18 * sc), cx + R - int(18 * sc), cy + R - int(18 * sc)], outline=(245, 218, 161, 200), width=max(1, int(3 * sc)))
                if sc > .35:
                    f1 = ImageFont.truetype(str(FONT), max(10, int(60 * sc))); f2 = ImageFont.truetype(str(FONT), max(8, int(32 * sc)))
                    for txt, f, dy, col in (('임무 완료!', f1, -22 * sc, (255, 244, 217)), ('공기 엔지니어', f2, 50 * sc, (245, 218, 161))):
                        tw = sd.textlength(txt, font=f); sd.text((cx - tw / 2, cy + dy - f.size / 2 - 6 * sc), txt, font=f, fill=col + (255,))
                st = st.rotate(-8 * min(1, k), center=(cx, cy), resample=Image.BICUBIC); im.alpha_composite(st)
            k2 = ease((t - 1.6) / .7)
            if k2 > 0:
                line = '이제 나만의 인증서를 받으러 가요!'; tw = d.textlength(line, font=sub); x, y = (W - tw) / 2, 434 + 14 * (1 - k2)
                d.rounded_rectangle([x - 24, y - 12, x + tw + 24, y + 56], 28, fill=(20, 63, 67, int(190 * k2)))
                d.text((x, y - 2), line, font=sub, fill=(255, 244, 217, int(255 * k2)))
        im.save(folder / f'{i:04d}.png')

def compose(film):
    cfg = json.load(open(CUES / f'{film}.json'))
    WORK.mkdir(parents=True, exist_ok=True)
    segs, voices, starts, at = [], [], [], 0.0
    lead, tail, minlen = cfg['lead'], cfg['tail'], cfg['minScene']
    for sc in cfg['scenes']:
        v = VOICE / f"{sc['voice']}.mp3"; vd = dur(v)
        L = round(max(minlen, lead + vd + tail), 2)
        seg = WORK / f"{film}-{sc['name']}.mp4"
        if sc['name'] == 'card':
            last = WORK / f'{film}-last.png'
            run('-sseof', '-0.06', '-i', segs[-1][0], '-frames:v', 1, '-update', 1, last)
            frames = WORK / f'{film}-card'; card_frames(film, L, frames)
            zoom = f"scale={W*2}:{H*2},zoompan=z='1+0.05*on/{int(L*FPS)}':x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':d={int(L*FPS)}:s={W}x{H}:fps={FPS}"
            run('-loop', 1, '-t', L, '-i', last, '-framerate', FPS, '-i', frames / '%04d.png', '-filter_complex',
                f"[0:v]{zoom},eq=brightness=-0.06:saturation=1.05,vignette=angle=PI/4[b];[b][1:v]overlay=format=auto,format=yuv420p[v]",
                '-map', '[v]', '-t', L, '-c:v', 'libx264', '-crf', 14, '-preset', 'fast', seg)
            src_kind = 'card'
        else:
            f, src_kind = source(sc['name']); stretch = L / 7.9
            run('-i', f, '-an', '-vf', f"scale={W}:{H}:flags=lanczos,setsar=1,trim=duration=7.9,setpts={stretch:.4f}*(PTS-STARTPTS),fps={FPS},vignette=angle=PI/6",
                '-t', L, '-c:v', 'libx264', '-crf', 14, '-preset', 'fast', seg)
            # 카드 화면(움직임 줄이기·영상 못 열 때)용 장면 끝 그림
            run('-sseof', '-0.06', '-i', seg, '-frames:v', 1, '-update', 1, '-q:v', 4, OUT / f"{sc['name']}-end.jpg")
        segs.append((seg, L, src_kind)); voices.append((v, at + lead, sc.get('gain', 0))); starts.append(at)
        for c in sc['cues']:
            c['s_abs'] = at + lead + c['speech'][0] - .15; c['e_abs'] = at + lead + c['speech'][1] + .35
        at += L - XF
    total = round(at + XF, 2)
    # 자막 큐 → burn.py ASS (1920×1080 좌표, libass가 1280×720으로 줄여 그린다)
    cues = [{'s': round(c['s_abs'], 2), 'e': round(c['e_abs'], 2), 'speech': [round(c['s_abs'] + .15, 2), round(c['e_abs'] - .35, 2)], 'who': sc['who'], 'text': c['text']}
            for sc in cfg['scenes'] for c in sc['cues']]
    ass = WORK / f'{film}.ass'
    ass.write_text(burn.build_ass({'theme': cfg['theme'], 'speakers': cfg['speakers'], 'bottom': cfg.get('bottom', 64), 'sweep': True, 'cues': cues}), encoding='utf-8')
    # 영상: 교차 페이드 체인 + 처음·끝 페이드 + 자막
    ins, g, prev, off = [], [], '0:v', 0.0
    for s, _, _ in segs: ins += ['-i', s]
    for i in range(1, len(segs)):
        off += segs[i - 1][1] - XF; g.append(f"[{prev}][{i}:v]xfade=transition=fade:duration={XF}:offset={off:.2f}[x{i}]"); prev = f'x{i}'
    g.append(f"[{prev}]fade=t=in:st=0:d=0.5,fade=t=out:st={total-0.6:.2f}:d=0.6,ass='{ass}':fontsdir='{FONT.parent}',format=yuv420p[v]")
    n = len(segs)
    for v, st, _ in voices: ins += ['-i', v]
    ins += ['-i', BGM / f"{cfg['bgm']}.mp3"]
    vo = []
    for i, (v, st, gain) in enumerate(voices):
        ms = int(st * 1000); g.append(f"[{n+i}:a]aformat=sample_rates=44100:channel_layouts=stereo,volume={gain}dB,adelay={ms}|{ms}[a{i}]"); vo.append(f'[a{i}]')
    g.append(f"{''.join(vo)}amix=inputs={len(vo)}:normalize=0,apad[vox]")
    g.append("[vox]asplit=2[vk][vm]")
    b = n + len(voices)
    g.append(f"[{b}:a]aformat=sample_rates=44100:channel_layouts=stereo,atrim=0:{total},afade=t=in:d=1.2,afade=t=out:st={total-2:.2f}:d=2,volume=0.42[bg]")
    g.append("[bg][vk]sidechaincompress=threshold=0.03:ratio=6:attack=40:release=500[bgd]")
    g.append(f"[vm][bgd]amix=inputs=2:normalize=0,atrim=0:{total},alimiter=limit=0.89[a]")
    out = OUT / f'{film}-film.mp4'
    run(*ins, '-filter_complex', ';'.join(g), '-map', '[v]', '-map', '[a]', '-t', total,
        '-c:v', 'libx264', '-preset', 'slow', '-crf', 24, '-maxrate', '1800k', '-bufsize', '3600k', '-profile:v', 'high', '-pix_fmt', 'yuv420p',
        '-c:a', 'aac', '-b:a', '128k', '-movflags', '+faststart', out)
    run('-ss', 1.0, '-i', out, '-frames:v', 1, '-q:v', 4, OUT / f'{film}-film.jpg')
    rec = {'film': film, 'seconds': total, 'bytes': out.stat().st_size, 'scenes': [{'name': s.name.split('-', 1)[1][:-4], 'len': L, 'source': k} for s, L, k in segs],
           'cues': cues}
    (CUES / f'{film}-built.json').write_text(json.dumps(rec, ensure_ascii=False, indent=1), encoding='utf-8')
    print(film, f'{total:.2f}s', out.stat().st_size, 'bytes', [k for _, _, k in segs])

for film in (sys.argv[1:] or ['intro', 'final']): compose(film)
