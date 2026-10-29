# Erzeugt screenshots/32_geister_uebersicht.png: alle 15 Geister (vorne/hinten) als Übersicht
import asyncio, sys
from playwright.async_api import async_playwright
OUT = sys.argv[1] if len(sys.argv) > 1 else "/workspace/eldenghost/screenshots/32_geister_uebersicht.png"
JS = """
(() => {
  const S = 4, cw = 5, cellW = 32 * S * 2 + 40, cellH = 32 * S + 64, rows = 3;
  const c = document.createElement('canvas'); c.width = cw * cellW + 20; c.height = rows * cellH + 70;
  const g = c.getContext('2d'); g.imageSmoothingEnabled = false;
  const gr = g.createLinearGradient(0, 0, 0, c.height); gr.addColorStop(0, '#15122a'); gr.addColorStop(1, '#0a0816'); g.fillStyle = gr; g.fillRect(0, 0, c.width, c.height);
  g.fillStyle = '#e8c870'; g.font = 'bold 26px Georgia, serif'; g.fillText('Eldenghost – Geisterchronik (vorne / hinten)', 20, 42);
  G.SPECIES_ORDER.forEach((sp, i) => {
    const s = G.SPECIES[sp], x = 10 + (i % cw) * cellW, y = 60 + Math.floor(i / cw) * cellH, col = G.TYPE_COLORS[s.type];
    g.fillStyle = '#1c1834'; g.fillRect(x + 4, y + 4, cellW - 8, cellH - 8);
    const rg = g.createRadialGradient(x + 32 * S / 2 + 14, y + 16 * S + 8, 4, x + 32 * S / 2 + 14, y + 16 * S + 8, 80); rg.addColorStop(0, col + '33'); rg.addColorStop(1, col + '00');
    g.fillStyle = rg; g.fillRect(x + 4, y + 4, cellW - 8, cellH - 8);
    g.drawImage(G.SPR.mon[sp].img, x + 14, y + 10, 32 * S, 32 * S);
    g.drawImage(G.SPR.mon[sp].back, x + 26 + 32 * S, y + 10, 32 * S, 32 * S);
    g.fillStyle = '#f2ecff'; g.font = 'bold 17px sans-serif'; g.fillText('#' + (i + 1) + ' ' + s.name, x + 14, y + 32 * S + 30);
    g.fillStyle = col; g.font = '14px sans-serif'; g.fillText(s.type + (s.evo ? '  → ' + G.SPECIES[s.evo.to].name + ' (Lv ' + s.evo.lvl + ')' : ''), x + 14, y + 32 * S + 50);
  });
  c.id = 'sheet'; c.style.cssText = 'position:fixed;left:0;top:0;z-index:99'; document.body.appendChild(c);
  return [c.width, c.height];
})()
"""
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(executable_path="/usr/bin/google-chrome")
        pg = await b.new_page(viewport={"width": 1600, "height": 1000})
        errs = []; pg.on("pageerror", lambda e: errs.append(str(e)))
        await pg.goto("http://localhost:8080/index.html"); await pg.wait_for_timeout(700)
        w, h = await pg.evaluate(JS)
        await pg.set_viewport_size({"width": w, "height": h})
        await pg.locator("#sheet").screenshot(path=OUT)
        print("sheet", w, h, errs)
        await b.close()
asyncio.run(main())
