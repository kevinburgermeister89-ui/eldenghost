"""Erzeugt App-Icons & Splash im Pixel-Stil des Spiels (nutzt die prozeduralen Sprites aus js/sprites.js).
Aufruf: python3 tools/make_icons.py  (Server auf :8080 oder file://)"""
import asyncio, base64, os, sys
from playwright.async_api import async_playwright
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
JS = r"""
(specs) => {
  const out = {};
  const spr = G.SPR.mon.flackerling.img;
  for (const s of specs) {
    const c = document.createElement('canvas'); c.width = s.w; c.height = s.h; const g = c.getContext('2d');
    g.imageSmoothingEnabled = false;
    const cx = s.w / 2, cy = s.h / 2, m = Math.min(s.w, s.h);
    if (s.flat) { g.fillStyle = '#0a0816'; g.fillRect(0, 0, s.w, s.h); }
    else if (!s.transparent) {
      const gr = g.createRadialGradient(cx, cy * 0.9, 0, cx, cy, m * 0.75);
      gr.addColorStop(0, '#2a1f52'); gr.addColorStop(0.55, '#150f2c'); gr.addColorStop(1, '#0a0816');
      g.fillStyle = gr; g.fillRect(0, 0, s.w, s.h);
      // Sterne/Glühwürmchen
      let seed = 7; const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
      const px = Math.max(1, Math.round(m / 128));
      for (let i = 0; i < 26; i++) { g.fillStyle = i % 3 ? 'rgba(160,240,220,0.7)' : 'rgba(255,240,180,0.8)'; g.fillRect(Math.round(rnd() * s.w), Math.round(rnd() * s.h), px, px); }
      // Nebelband
      const fg = g.createLinearGradient(0, cy + m * 0.18, 0, s.h);
      fg.addColorStop(0, 'rgba(190,200,230,0)'); fg.addColorStop(1, 'rgba(190,200,230,0.18)');
      g.fillStyle = fg; g.fillRect(0, 0, s.w, s.h);
    }
    const scale = Math.max(1, Math.floor(m * s.frac / 32));
    const sw = 32 * scale, x = Math.round(cx - sw / 2), y = Math.round(cy - sw / 2 - (s.title ? m * 0.06 : 0));
    const gl = g.createRadialGradient(cx, y + sw * 0.55, 0, cx, y + sw * 0.55, sw * 0.75);
    gl.addColorStop(0, 'rgba(111,224,214,0.45)'); gl.addColorStop(1, 'rgba(111,224,214,0)');
    g.globalCompositeOperation = 'lighter'; g.fillStyle = gl; g.fillRect(0, 0, s.w, s.h); g.globalCompositeOperation = 'source-over';
    g.drawImage(spr, x, y, sw, sw);
    if (s.title) {
      g.font = `bold ${Math.round(m * 0.075)}px Georgia, serif`; g.textAlign = 'center';
      g.shadowColor = '#9a7aff'; g.shadowBlur = m * 0.02; g.fillStyle = '#efe4ff';
      g.fillText('Eldenghost', cx, y + sw + m * 0.1);
    }
    out[s.name] = c.toDataURL('image/png');
  }
  return out;
}
"""
S = lambda name, w, h=None, frac=0.62, **k: dict(name=name, w=w, h=h or w, frac=frac, **k)
WEB = [S('icons/icon-192.png', 192), S('icons/icon-512.png', 512), S('icons/icon-maskable-512.png', 512, frac=0.5),
       S('icons/apple-touch-icon.png', 180), S('icons/favicon-32.png', 32, frac=0.9), S('icons/ios-icon-1024.png', 1024), S('icons/splash.png', 1080, frac=0.25, title=True, flat=True)]
DENS = {'mdpi': (48, 108), 'hdpi': (72, 162), 'xhdpi': (96, 216), 'xxhdpi': (144, 324), 'xxxhdpi': (192, 432)}
AND = []
for d, (ic, fg) in DENS.items():
    AND += [S(f'icons/android/mipmap-{d}/ic_launcher.png', ic), S(f'icons/android/mipmap-{d}/ic_launcher_round.png', ic),
            S(f'icons/android/mipmap-{d}/ic_launcher_foreground.png', fg, frac=0.45, transparent=True)]
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(executable_path="/usr/bin/google-chrome")
        pg = await b.new_page()
        await pg.goto('file://' + os.path.join(ROOT, 'index.html')); await pg.wait_for_function('window.G && G.SPR')
        res = await pg.evaluate(JS, WEB + AND)
        for name, url in res.items():
            path = os.path.join(ROOT, name); os.makedirs(os.path.dirname(path), exist_ok=True)
            open(path, 'wb').write(base64.b64decode(url.split(',')[1])); print('wrote', name)
        await b.close()
asyncio.run(main())
