"""Steuerkreuz/Analogstick & Sofortstart – headless Touch-Tests (echte Touch-Ereignisse per CDP)."""
import asyncio, math, sys
from playwright.async_api import async_playwright
URL = "http://localhost:8080/index.html?touch=1"
SETUP = ("G.demo=true; G.state={v:2,map:'dorf',player:{x:3,y:18,dir:'right'},team:[G.makeMon('flackerling',9)],box:[],items:{},flags:{q1:3},seen:{},caught:{},playtime:0};"
         "G.UI.title(false); G.UI.kind=null; G.UI.handler=null; document.getElementById('choices').className='hidden'; G.mode='world'; G.lock=0; G.debugEncounterRate=1e-9;")
fails, errors, results = [], [], []
def check(c, msg):
    results.append(("OK " if c else "FAIL") + "  " + msg); print(results[-1])
    if not c: fails.append(msg)
def expect(deg):
    d = deg % 360
    return 'right' if d < 45 or d > 315 else 'down' if d < 135 else 'left' if d < 225 else 'up'
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(executable_path='/usr/bin/google-chrome')
        ctx = await b.new_context(viewport={"width": 390, "height": 844}, device_scale_factor=2, is_mobile=True, has_touch=True)
        pg = await ctx.new_page()
        pg.on("pageerror", lambda e: errors.append(str(e))); pg.on("console", lambda m: errors.append(m.text) if m.type in ("error", "warning") else None)
        cdp = await ctx.new_cdp_session(pg)
        await pg.goto(URL); await pg.wait_for_timeout(1200)
        box = await pg.locator("#dpad").bounding_box(); cx, cy = box["x"] + box["width"] / 2, box["y"] + box["height"] / 2
        async def touch(kind, pts): await cdp.send("Input.dispatchTouchEvent", {"type": kind, "touchPoints": [{"x": x, "y": y, "id": 1} for x, y in pts]})
        pos = lambda deg, r: (cx + math.cos(math.radians(deg)) * r, cy + math.sin(math.radians(deg)) * r)
        held = lambda: pg.evaluate("G.Input ? G.Input.held.slice() : null")
        await pg.evaluate("G.Input || (G.Input = null)")
        # Direkte Richtungsberechnung: Winkel × Radien (inkl. erweiterter Trefferzone ausserhalb des sichtbaren Kreuzes)
        wrong = []; n = 0
        for r in (20, 45, 70, 90):  # 90 px = 18 px ausserhalb des sichtbaren Kreuzes (Bildschirmrand links)
            for deg in range(0, 360, 15):
                if deg % 45 == 0 and deg % 90 != 0: continue  # exakte Diagonalen sind mehrdeutig
                x, y = pos(deg, r); await touch("touchStart", [(x, y)]); h = await pg.evaluate("[...document.querySelectorAll('.dp.on')].map(e=>e.dataset.d)")
                await touch("touchEnd", []); n += 1
                if h != [expect(deg)]: wrong.append((r, deg, h))
        check(not wrong, f"Tippen: {n - len(wrong)}/{n} Positionen (4 Radien bis 90 px, alle 15°) ergeben die richtige Richtung {wrong[:4]}")
        wrong = []
        for base in (45, 135, 225, 315):
            for off in (-8, -4, 4, 8):
                x, y = pos(base + off, 55); await touch("touchStart", [(x, y)]); h = await pg.evaluate("[...document.querySelectorAll('.dp.on')].map(e=>e.dataset.d)"); await touch("touchEnd", [])
                if h != [expect(base + off)]: wrong.append((base + off, h))
        check(not wrong, f"Nahe Diagonalen (±4°/±8°): 16/16 richtig zugeordnet {wrong}")
        x, y = pos(30, 6); await touch("touchStart", [(x, y)]); h = await pg.evaluate("document.querySelectorAll('.dp.on').length"); await touch("touchEnd", [])
        check(h == 0, "Totzone in der Mitte (6 px): keine Richtung")
        # Wischen mit Hysterese nur beim Achsenwechsel
        await touch("touchStart", [pos(0, 50)]); seq = []
        for deg in (20, 40, 50, 54, 60, 90):
            await touch("touchMove", [pos(deg, 50)]); seq.append(await pg.evaluate("[...document.querySelectorAll('.dp.on')].map(e=>e.dataset.d)[0]"))
        await touch("touchEnd", [])
        check(seq == ['right', 'right', 'right', 'right', 'down', 'down'], f"Wischen rechts→unten: Achse bleibt bis 55°, dann Wechsel {seq}")
        await touch("touchStart", [pos(0, 50)]); await touch("touchMove", [pos(180, 50)]); h = await pg.evaluate("[...document.querySelectorAll('.dp.on')].map(e=>e.dataset.d)"); await touch("touchEnd", [])
        check(h == ['left'], "Wischen rechts→links (gleiche Achse) wechselt sofort")
        # Analogstick-Knopf: folgt, begrenzt, federt zurück; Richtung gilt weit ausserhalb
        await touch("touchStart", [pos(0, 20)]); k1 = await pg.evaluate("getComputedStyle(document.getElementById('dp-knob')).transform")
        await touch("touchMove", [pos(-80, 260)]); k2 = await pg.evaluate("document.getElementById('dp-knob').style.transform")
        h = await pg.evaluate("[...document.querySelectorAll('.dp.on')].map(e=>e.dataset.d)")
        m = [float(v) for v in k2.replace('translate(', '').replace('px', '').replace(')', '').split(',')]
        check(abs(math.hypot(*m) - 46) < 0.6 and h == ['up'], f"Knopf folgt dem Finger und stoppt am Rand (46 px), Richtung 260 px ausserhalb gilt weiter: {k2} {h}")
        await touch("touchEnd", []); await pg.wait_for_timeout(350)
        k3 = await pg.evaluate("[document.getElementById('dp-knob').style.transform, getComputedStyle(document.getElementById('dp-knob')).transform, document.querySelectorAll('.dp.on').length]")
        check(k3[0] == '' and k3[1] in ('none', 'matrix(1, 0, 0, 1, 0, 0)') and k3[2] == 0, f"Loslassen: Knopf federt zur Mitte zurück, keine Richtung {k3}")
        # Sofortstart im Spiel
        await pg.evaluate(SETUP + "G.World.setMap('dorf',3,18,'right')"); await pg.wait_for_timeout(300)
        await touch("touchStart", [pos(0, 50)]); mv = await pg.evaluate("[G.P.moving, +G.P.t.toFixed(3), G.P.tx]")
        check(mv[0] and mv[1] < 0.05, f"Touch in Blickrichtung: Schritt beginnt sofort im Ereignis (moving={mv[0]}, t={mv[1]})")
        await pg.wait_for_timeout(1000); x1 = await pg.evaluate("G.P.x"); await touch("touchEnd", []); await pg.wait_for_timeout(400)
        check(x1 >= 3 + 4, f"Gehalten: läuft weiter ({x1 - 3} Felder in 1 s)")
        await pg.evaluate("G.World.setMap('dorf',9,18,'right')"); await pg.wait_for_timeout(200)
        await touch("touchStart", [pos(0, 6)]); a = await pg.evaluate("G.P.moving"); await touch("touchMove", [pos(0, 30)]); b2 = await pg.evaluate("G.P.moving"); await touch("touchEnd", [])
        check(not a and b2, "Start in der Totzone: erst beim Verlassen der Totzone geht es los – dann sofort")
        await pg.wait_for_timeout(400)
        # andere Richtung kurz antippen = nur drehen; länger halten = gehen nach ≤ 30 ms
        await pg.evaluate("G.World.setMap('dorf',9,18,'right')"); await pg.wait_for_timeout(200)
        await touch("touchStart", [pos(180, 50)]); await touch("touchEnd", []); await pg.wait_for_timeout(250)
        t = await pg.evaluate("[G.P.dir, G.P.x, G.P.moving]")
        check(t == ['left', 9, False], f"Kurzes Tippen in neue Richtung dreht nur {t}")
        await pg.evaluate("G.P.dir='right'"); await touch("touchStart", [pos(90, 50)])
        ms = await pg.evaluate("new Promise(r=>{const t0=performance.now();(function f(){ if(G.P.moving) r(performance.now()-t0); else if(performance.now()-t0>500) r(-1); else requestAnimationFrame(f); })()})")
        await touch("touchEnd", [])
        check(0 <= ms <= 60, f"Halten in neue Richtung: Losgehen nach {ms:.0f} ms (Drehschwelle 30 ms)")
        # Tastatur: Blickrichtung sofort
        await pg.wait_for_timeout(400); await pg.evaluate("G.World.setMap('dorf',9,18,'right')"); await pg.wait_for_timeout(200)
        await pg.keyboard.down("ArrowRight"); mv = await pg.evaluate("G.P.moving"); await pg.keyboard.up("ArrowRight")
        check(mv, "Tastatur in Blickrichtung: Schritt startet im selben Ereignis")
        await b.close()
    print("FAILS:", len(fails)); print("ERRORS:", len(errors)); [print(e) for e in errors]
    sys.exit(1 if fails or errors else 0)
asyncio.run(main())
