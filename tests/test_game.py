# Eldenghost – End-to-End-Test (Desktop 900×860 per Tastatur, Mobil 390×844 per Touch)
import asyncio, json, sys, time
from playwright.async_api import async_playwright
URL = "http://localhost:8080/index.html"
OUT = "/workspace/eldenghost/screenshots/"
errors, fails = [], []

def check(cond, msg):
    print(("  OK  " if cond else "  FAIL ") + msg)
    if not cond: fails.append(msg)

def hook(page, tag):
    page.on("console", lambda m: (errors.append(f"[{tag}] console.{m.type}: {m.text}"), print("CONSOLE", m.text)) if m.type in ("error", "warning") else None)
    page.on("pageerror", lambda e: (errors.append(f"[{tag}] pageerror: {e}"), print("PAGEERROR", e)))

class Drv:
    def __init__(self, page, touch=False): self.p, self.touch = page, touch
    async def ev(self, e):
        try: return await asyncio.wait_for(self.p.evaluate(e), 15)
        except asyncio.TimeoutError: raise RuntimeError("evaluate hing: " + e)
    async def shot(self, name, full=False):
        await self.p.wait_for_timeout(250)
        if full or self.touch: await self.p.screenshot(path=OUT + name)
        else: await self.p.locator("#screen").screenshot(path=OUT + name)
    async def A(self):
        if self.touch: await self.p.tap("#btn-a")
        else: await self.p.keyboard.press("Space")
    async def B(self):
        if self.touch: await self.p.tap("#btn-b")
        else: await self.p.keyboard.press("Escape")
    async def start(self):
        if self.touch: await self.p.tap("#btn-start")
        else: await self.p.keyboard.press("Enter")
    async def select(self):
        if self.touch: await self.p.tap("#btn-select")
        else: await self.p.keyboard.press("Shift")
    async def text_has(self, s, timeout=4000):
        t = time.time()
        while time.time() - t < timeout / 1000:
            if s in await self.ev("document.getElementById('text').textContent"): return True
            await self.p.wait_for_timeout(100)
        return False
    async def labels(self): return await self.p.locator("#choices .ch").all_inner_texts()
    async def pick(self, text):
        """Wahl mit passender Beschriftung antippen/anwählen."""
        labs = await self.labels()
        idx = next((i for i, l in enumerate(labs) if l.strip().startswith(text)), None)
        assert idx is not None, f"'{text}' nicht in {labs}"
        if self.touch:
            # v17: im Attacken-Menü zeigt der erste Tipp die Info, der zweite setzt die Attacke ein
            insp = await self.ev("!!document.getElementById('mvinfo') && !document.querySelectorAll('#choices .ch')[%d].classList.contains('sel')" % idx)
            await self.p.locator("#choices .ch").nth(idx).tap()
            if insp: await self.p.wait_for_timeout(120); await self.p.locator("#choices .ch").nth(idx).tap()
        else: await self.p.evaluate(f"document.querySelectorAll('#choices .ch')[{idx}].click()")
        await self.p.wait_for_timeout(120)
    async def wait_choose(self, timeout=12000):
        t = time.time()
        while time.time() - t < timeout / 1000:
            k = await self.ev("G.UI.kind")
            if k == 'choose': await self.p.wait_for_timeout(150); return True
            if k == 'say': await self.A()
            await self.p.wait_for_timeout(90)
        return False
    async def advance(self, maxn=80):
        for _ in range(maxn):
            if await self.ev("G.UI.kind") != 'say':
                await self.p.wait_for_timeout(150)
                if await self.ev("G.UI.kind") != 'say': return
            await self.A(); await self.p.wait_for_timeout(90)
    async def until(self, js, timeout=25000, move='Kampf'):
        """Dialoge weiterklicken und im Kampf automatisch die erste Attacke wählen, bis js wahr ist."""
        t = time.time()
        while time.time() - t < timeout / 1000:
            if await self.ev(js): return True
            k = await self.ev("G.UI.kind")
            if k == 'say': await self.A()
            elif k == 'choose':
                labs = await self.labels()
                if labs and labs[0] == 'Kampf': await self.pick('Kampf')
                elif any('AP ' in l for l in labs): await self.p.evaluate("[...document.querySelectorAll('#choices .ch')].find(e=>!e.classList.contains('disabled')).click()")
                elif any(l.startswith('Vergessen') for l in labs): await self.B()
                else: await self.p.evaluate("document.querySelector('#choices .ch:not(.disabled)').click()")
            await self.p.wait_for_timeout(100)
        return await self.ev(js)
    async def hold(self, d, ms):
        if self.touch:
            box = await self.p.locator(f"#dpad .{d}").bounding_box()
            cx, cy = box["x"] + box["width"] / 2, box["y"] + box["height"] / 2
            await self.cdp.send("Input.dispatchTouchEvent", {"type": "touchStart", "touchPoints": [{"x": cx, "y": cy, "id": 1}]})
            await self.p.wait_for_timeout(ms)
            await self.cdp.send("Input.dispatchTouchEvent", {"type": "touchEnd", "touchPoints": []})
        else:
            key = {"up": "ArrowUp", "down": "ArrowDown", "left": "ArrowLeft", "right": "ArrowRight"}[d]
            await self.p.keyboard.down(key); await self.p.wait_for_timeout(ms); await self.p.keyboard.up(key)
        await self.p.wait_for_timeout(300)
    async def step(self, d, n=1):
        for _ in range(n):
            await self.hold(d, 160)
            for _ in range(30):
                if not await self.ev("G.P.moving"): break
                await self.p.wait_for_timeout(30)

async def world_idle(D, n=80):
    for _ in range(n):
        m, k = await D.ev("G.mode"), await D.ev("G.UI.kind")
        if m == 'world' and not k and await D.ev("G.lock===0 && !G.fx"):
            await D.p.wait_for_timeout(400)
            if await D.ev("G.lock===0 && !G.UI.kind"): return True
        if k == 'say': await D.A()
        await D.p.wait_for_timeout(150)
    return False

async def intro_starter(D):
    """Prolog bis zur Starterwahl: Ilse ansprechen (A), am ersten Laternenstein Flackerling wählen (A, «Ja»)."""
    await D.ev("G.World.setMap('dorf',18,8,'up')"); await D.p.wait_for_timeout(250)
    await D.A(); await D.p.wait_for_timeout(900)
    if not D.touch: await D.shot("02_ilse_dialog.png")
    await world_idle(D)
    await D.ev("G.World.setMap('dorf',17,10,'up')"); await D.p.wait_for_timeout(250)
    await D.A()
    for _ in range(100):
        if await D.ev("G.UI.kind") == 'choose' and 'Ja' in [l.strip() for l in await D.labels()]: await D.pick('Ja'); break
        if await D.ev("G.UI.kind") == 'say': await D.A()
        await D.p.wait_for_timeout(100)
    offered = False
    for _ in range(120):   # Dorfführung wird angeboten -> hier überspringen (eigener Test in test_v13.py)
        k = await D.ev("G.UI.kind")
        if k == 'choose' and 'Ich kenne mich aus' in [l.strip() for l in await D.labels()]: offered = True; await D.pick('Ich kenne mich aus'); break
        if k == 'say': await D.A()
        await D.p.wait_for_timeout(100)
    check(offered, ("[mobil] " if D.touch else "") + "Neues Spiel: Ilse bietet die Dorfführung an")
    await world_idle(D)
    check(await D.ev("G.state.team.length") == 1 and await D.ev("G.state.items.laterne") == 5 and await D.ev("G.state.flags.story") == 2,
          ("[mobil] " if D.touch else "") + "Prolog: Starter am Laternenstein gewählt, Ilse übergibt 5 Seelenfänger")

async def new_game(D):
    assert await D.wait_choose()
    await D.pick('Neues Spiel')
    for _ in range(80):
        m, k = await D.ev("G.mode"), await D.ev("G.UI.kind")
        if m == 'world' and not k and await D.ev("G.lock===0 && !G.fx"):
            await D.p.wait_for_timeout(400)
            if await D.ev("G.lock===0 && !G.UI.kind"): break
        if k == 'say': await D.A()
        elif k == 'choose': await D.p.evaluate("document.querySelector('#choices .ch').click()")
        await D.p.wait_for_timeout(150)
    check(await D.ev("G.mode") == 'world' and await D.ev("G.map.id") == 'home' and await D.ev("G.state.team.length") == 0, "Neues Spiel startet im Elternhaus (noch ohne Geist)")
    await intro_starter(D)

async def common(D, tag):
    """Gemeinsame Prüfungen: Kartenwechsel, Status, Gegenstand, Entwicklung, Beschwörerkampf."""
    P = f"[{tag}] "
    # --- Kartenwechsel: Haustür -> Innenraum -> zurück
    await D.ev("G.World.setMap('dorf',5,6,'up')")
    await D.step('up')
    await D.until("G.map.id==='home' && G.lock===0", 5000)
    check(await D.ev("G.map.id") == 'home', P + "Tür führt in den Innenraum (home)")
    if tag == 'desktop': await D.shot("18_innenraum.png")
    await D.step('down')
    await D.until("G.map.id==='dorf' && G.lock===0", 5000)
    check(await D.ev("G.map.id+','+G.P.x+','+G.P.y") == 'dorf,5,6', P + "Ausgang führt zurück ins Dorf vor die Tür")

    # --- Wilder Kampf mit Statuseffekt (Moorkälte -> klamm) und Gegenstand im Kampf
    await D.ev("G.debugStatus=true; G.debug.items({wacholder:2,kraeutertee:3}); G.debug.lead('kieselgeist',9)")
    await D.ev("void G.debug.wild('schattenmotte',8,['moorkaelte'])")
    await D.wait_choose()
    await D.until("G.state.team[0].status && G.state.team[0].status.id==='klamm' || !G.B", 20000)
    check(await D.ev("!!(G.B && G.state.team[0].status && G.state.team[0].status.id==='klamm')"), P + "Status «klamm» wird durch Moorkälte ausgelöst")
    if tag == 'desktop': await D.shot("23_status_klamm.png")
    await D.wait_choose()
    if await D.ev("!!G.B"):
        await D.ev("G.debugStatus=false; G.B.enemy.hp = G.stats(G.B.enemy).hp")
        await D.pick('Tasche'); await D.wait_choose()
        await D.pick('Wacholderrauch'); await D.wait_choose()
        await D.p.evaluate("document.querySelector('#choices .ch').click()")
        cured = await D.text_has('wieder ganz bei sich')
        check(cured and await D.ev("G.state.items.wacholder") == 1, P + "Wacholderrauch im Kampf benutzt, «klamm» geheilt")
    await D.ev("G.debugStatus=false; if (G.B) G.B.enemy.hp = 1")
    check(await D.until("!G.B && G.mode==='world' && G.lock===0", 40000), P + "Kampf beendet, zurück in der Oberwelt")

    # --- Gegenstand im Feld über die Tasche
    await D.ev("G.state.team[0].hp = 3")
    await D.start(); await D.wait_choose()
    await D.pick('Tasche'); await D.wait_choose()
    if tag == 'desktop': await D.shot("24_tasche.png")
    await D.pick('Kräutertee'); await D.wait_choose()
    await D.p.evaluate("document.querySelector('#choices .ch').click()"); await D.p.wait_for_timeout(200)
    await D.advance()
    check(await D.ev("G.state.team[0].hp") > 3, P + "Kräutertee im Feld benutzt (LP steigen)")
    for _ in range(6):
        if await D.ev("G.lock===0 && !G.UI.kind"): break
        await D.wait_choose(2000); await D.B(); await D.p.wait_for_timeout(350)
    check(await D.ev("G.lock===0 && !G.UI.kind"), P + "Menü geschlossen")

    # --- Entwicklung: Flackerling Lv 13 kurz vor Lv 14
    await D.ev("(()=>{const m=G.debug.lead('flackerling',13); m.xp=G.xpFor(14)-1;})()")
    await D.ev("void G.debug.wild('laternchen',2)")
    ok = await D.until("G.mode==='evo'", 30000)
    check(ok, P + "Entwicklungsszene startet nach Level-up")
    if tag == 'mobile':
        await D.until("G.UI.kind===null && G.mode==='evo'", 6000)
        await D.p.wait_for_timeout(900)
        await D.shot("26_mobile_entwicklung.png")
        await D.B()   # abbrechen
        await D.until("G.mode==='world' && G.lock===0", 15000)
        check(await D.ev("G.state.team[0].sp") == 'flackerling' and await D.ev("G.state.team[0].evoSkip") == 14, P + "Entwicklung mit B abgebrochen")
    else:
        await D.p.wait_for_timeout(1500); await D.p.wait_for_timeout(200)
        await D.until("G.UI.kind===null", 5000)
        await D.p.wait_for_timeout(1400)
        await D.shot("20_entwicklung.png")
        await D.until("G.mode==='world' && G.lock===0", 20000)
        check(await D.ev("G.state.team[0].sp") == 'glutwurm' and await D.ev("!!G.state.caught.glutwurm"), P + "Flackerling hat sich zu Glutwurm entwickelt")

    # --- Beschwörerkampf: Fenn lauert nicht mehr auf, er kämpft nur auf Ansprache (nach der Fang-Übung)
    await D.ev("G.debug.lead('menhirgeist',22); G.state.flags.t_fenn=0; G.state.flags.story=Math.max(G.state.flags.story||0,4); G.World.setMap('dorf',16,15,'left')")
    await D.p.wait_for_timeout(300)
    await D.step('left'); await D.step('left')
    await D.p.wait_for_timeout(700)
    print("  Position vor Fenn:", await D.ev("[G.map.id,G.P.x,G.P.y,G.lock,G.mode]"))
    check(await D.ev("!G.B && G.mode==='world' && G.P.x===14 && G.P.y===15"), P + "Fenn überfällt nicht mehr (Sichtlinie ohne Kampf)")
    seen = []
    async def ask_fenn():
        await D.A()
        for _ in range(80):
            seen.append(await D.ev("document.getElementById('text').textContent"))
            if await D.ev("G.UI.kind==='choose'") and any(l.strip().startswith('Ja') for l in await D.labels()): return True
            if await D.ev("G.UI.kind") == 'say': await D.A()
            await D.p.wait_for_timeout(120)
        return False
    check(await ask_fenn() and any('Nebelgras' in t for t in seen), P + "Fenn fragt erst und rät, im Nebelgras zu trainieren")
    await D.pick('Nein')
    await D.until("!G.B && G.mode==='world' && G.lock===0", 8000)
    check(await D.ev("!G.B && !G.state.flags.t_fenn"), P + "Fenn-Kampf abgelehnt: kein Kampf")
    await ask_fenn(); await D.pick('Ja')
    for _ in range(150):
        if await D.ev("!!G.B && G.UI.kind==='choose'"): break
        if await D.ev("G.UI.kind") == 'say': await D.A()
        await D.p.wait_for_timeout(120)
    check(await D.ev("!!G.B && G.B.trainer==='fenn'"), P + "Fenn fordert nach Zusage heraus")
    await D.shot("19_beschwoererkampf.png" if tag == 'desktop' else "25_mobile_beschwoerer.png")
    await D.pick('Flucht')
    check(await D.text_has('kein Entkommen'), P + "Flucht im Beschwörerkampf verweigert")
    await D.wait_choose()
    await D.pick('Tasche'); await D.wait_choose(); await D.pick('Seelenfänger')
    check(await D.text_has('anderen Licht'), P + "Fangen im Beschwörerkampf verweigert")
    tee = await D.ev("G.state.items.kraeutertee")
    await D.until("!G.B && G.mode==='world' && G.lock===0", 40000)
    check(await D.ev("G.state.flags.t_fenn") == 1 and await D.ev("G.state.items.kraeutertee") == tee + 2, P + "Fenn besiegt: Flag t_fenn, Belohnung 2 Kräutertee")
    check(await D.ev("G.lastBattle") == 'won', P + "Kampfergebnis «won»")

async def desktop(b):
    ctx = await b.new_context(viewport={"width": 900, "height": 860})
    page = await ctx.new_page(); hook(page, "desktop"); D = Drv(page)
    await page.goto(URL); await page.wait_for_timeout(800)
    await D.wait_choose(); await D.shot("00_titel.png")
    await new_game(D)
    print("  Seelenfänger:", await D.ev("G.state.items.laterne"), await D.ev("JSON.stringify(G.state.flags)"))
    await D.ev("G.World.setMap('dorf',14,20,'left')"); await D.shot("04_nebelbank_dorf.png")
    # Wilder Kampf im Nebel durch Laufen
    await D.ev("G.debugEncounterRate=1; G.World.setMap('dorf',12,20,'left')")
    for i in range(14):
        if await D.ev("!!G.B"): break
        await D.step('left' if i % 2 == 0 else 'right')
    for _ in range(60):
        if await D.ev("!!G.B && G.UI.kind==='choose'"): break
        if await D.ev("G.UI.kind") == 'say': await D.A()
        await page.wait_for_timeout(100)
    await D.ev("G.debugEncounterRate=null")
    check(await D.ev("!!G.B"), "Begegnung in der Nebelbank")
    await D.shot("05_kampf_menu.png")
    await D.pick('Kampf'); await D.wait_choose(); await D.shot("06_attacken_ap.png")
    check(any('AP ' in l for l in await D.labels()), "Attacken zeigen AP")
    await D.B(); await D.wait_choose()
    await D.ev("G.debugCatch=true")
    await D.pick('Tasche'); await D.wait_choose(); await D.pick('Seelenfänger')
    await page.wait_for_timeout(1300); await D.shot("07_fangen.png")
    await D.until("!G.B && G.mode==='world' && G.lock===0", 20000)
    await D.ev("G.debugCatch=null")
    check(await D.ev("G.state.team.length") == 2 and await D.ev("G.state.items.laterne") == 4, "Geist gefangen (Team 2, Seelenfänger 4)")
    await common(D, 'desktop')
    # Tiefes Moor über den Wegweiser-Pfad, Selma am Eingang
    await D.ev("G.state.flags.q1=3; G.World.setMap('dorf',16,29,'down')")
    await D.step('down')
    await D.until("G.map.id==='tiefesmoor'", 6000)
    check(await D.ev("G.map.id") == 'tiefesmoor', "Pfad führt ins Tiefe Moor")
    await page.wait_for_timeout(900)
    check(await D.ev("!G.B && G.mode==='world'"), "Selma überfällt nicht am Moor-Eingang")
    await D.step('up'); await D.A(); seen = []
    for _ in range(80):
        seen.append(await D.ev("document.getElementById('text').textContent"))
        if await D.ev("G.UI.kind==='choose'") and any(l.strip().startswith('Ja') for l in await D.labels()): break
        if await D.ev("G.UI.kind") == 'say': await D.A()
        await page.wait_for_timeout(120)
    check(any('Schilf' in t for t in seen), "Selma fragt erst und rät, im Schilf zu trainieren")
    await D.pick('Ja')
    for _ in range(80):
        if await D.ev("!!G.B && G.UI.kind==='choose'"): break
        if await D.ev("G.UI.kind") == 'say': await D.A()
        await page.wait_for_timeout(120)
    check(await D.ev("!!G.B && G.B.trainer==='selma'"), "Selma kämpft nach Zusage")
    await D.until("!G.B && G.mode==='world' && G.lock===0", 40000)
    check(await D.ev("G.state.flags.t_selma") == 1, "Selma besiegt")
    await D.ev("G.World.setMap('tiefesmoor',16,30,'up')"); await D.shot("21_tiefes_moor.png")
    await D.ev("G.World.setMap('tiefesmoor',4,24,'right')"); await D.shot("22_moor_nebelbank.png")
    # Speichern / Laden
    await D.ev("G.save(true)")
    save = await D.ev("JSON.parse(localStorage.getItem(G.SAVE_KEY))")
    check(save['v'] == 6 and save['map'] == 'tiefesmoor' and 'pp' in save['team'][0], "Spielstand v6 mit Karte und AP gespeichert")
    await page.reload(); await page.wait_for_timeout(900)
    await D.wait_choose(); await D.pick('Fortsetzen'); await page.wait_for_timeout(600)
    check(await D.ev("G.map.id+','+G.P.x+','+G.P.y") == 'tiefesmoor,4,24', "Laden setzt Karte und Position")
    # v1-Migration
    v1 = {"v": 1, "player": {"x": 7, "y": 9, "dir": "left"}, "team": [{"sp": "flackerling", "lvl": 6, "xp": 172, "moves": ["hauch", "irrfeuer", "blendlicht"], "hp": 20}],
          "box": [], "items": {"laterne": 4}, "flags": {"ilse": 1}, "seen": {"flackerling": 1}, "caught": {"flackerling": 1}, "playtime": 99}
    await D.ev(f"G.state = null; G.Store.set(G.SAVE_KEY, {json.dumps(json.dumps(v1))})")
    await page.reload(); await page.wait_for_timeout(900)
    await D.wait_choose(); await D.pick('Fortsetzen'); await page.wait_for_timeout(600)
    r = await D.ev("[G.map.id, G.World.solidAt(G.map, G.P.x, G.P.y) ? -1 : 7, G.P.y, G.state.v, G.state.team[0].pp[G.state.team[0].moves[0]], G.state.team[0].status, G.state.items.laterne, G.state.items.kraeutertee, G.state.flags.q1, G.state.team[0].moves.join(','), G.makeMon('flackerling',6).moves.join(',')]")
    print("  v1-Migration:", r)
    check(r[0] == 'dorf' and r[1] == 7 and r[3] == 6 and r[9] == r[10] and r[4] > 0 and r[5] is None and r[6] == 4 and r[7] == 0 and r[8] == 1, "Alter v1-Spielstand wird zu v6 migriert (Lv-6-Flackerling bekommt die neue, typenlose Lernliste)")
    await ctx.close()

async def mobile(b):
    ctx = await b.new_context(viewport={"width": 390, "height": 844}, device_scale_factor=2, is_mobile=True, has_touch=True)
    page = await ctx.new_page(); hook(page, "mobile"); D = Drv(page, touch=True)
    D.cdp = await ctx.new_cdp_session(page)
    await page.goto(URL); await page.wait_for_timeout(900)
    print("  body class:", await D.ev("document.body.className"), "u=", await D.ev("getComputedStyle(document.documentElement).getPropertyValue('--u')"))
    await D.shot("10_mobile_titel.png")
    # Layout: Gehäuse, Steuerkreuz links, A/B rechts (B tiefer und links von A), START/SELECT mittig darunter
    g = {}
    for id in ["bezel", "screen", "dpad", "btn-a", "btn-b", "btn-start", "btn-select"]:
        g[id] = await page.locator("#" + id).bounding_box()
    c = lambda r: (r["x"] + r["width"] / 2, r["y"] + r["height"] / 2)
    check(g["bezel"]["y"] + g["bezel"]["height"] <= g["dpad"]["y"], "Bildschirm-Gehäuse oberhalb der Tasten")
    check(c(g["dpad"])[0] < 195 < c(g["btn-a"])[0], "Steuerkreuz links, A rechts")
    check(c(g["btn-b"])[0] < c(g["btn-a"])[0] and c(g["btn-b"])[1] > c(g["btn-a"])[1], "B liegt links unterhalb von A (diagonal)")
    check(c(g["btn-select"])[1] > c(g["btn-a"])[1] and c(g["btn-select"])[0] < c(g["btn-start"])[0] and abs((c(g["btn-select"])[0] + c(g["btn-start"])[0]) / 2 - 195) < 20, "SELECT/START mittig darunter")
    check(g["btn-a"]["width"] >= 44 and g["dpad"]["width"] >= 120, "Touch-Ziele gross genug")
    check(g["screen"]["x"] >= 0 and g["screen"]["x"] + g["screen"]["width"] <= 390, "Bildschirm passt in die Breite")
    await D.pick('Neues Spiel') if False else None
    await page.locator("#choices .ch").first.tap()
    for _ in range(60):
        k, m = await D.ev("G.UI.kind"), await D.ev("G.mode")
        if m == 'world' and not k and await D.ev("G.lock===0 && !G.fx"):
            await page.wait_for_timeout(400)
            if await D.ev("G.lock===0 && !G.UI.kind"): break
        if k == 'say': await D.A()
        elif k == 'choose': await page.locator("#choices .ch").first.tap()
        await page.wait_for_timeout(150)
    check(await D.ev("G.mode") == 'world', "Mobil: Spiel per Touch gestartet")
    await intro_starter(D)
    x0 = await D.ev("G.P.x"); await D.hold('right', 900)
    check(await D.ev("G.P.x") > x0, "Mobil: Steuerkreuz bewegt die Figur")
    # Gedrückt-Zustand sichtbar
    await D.cdp.send("Input.dispatchTouchEvent", {"type": "touchStart", "touchPoints": [{"x": c(g["btn-b"])[0], "y": c(g["btn-b"])[1], "id": 2}]})
    await page.wait_for_timeout(60)
    check(await D.ev("document.getElementById('btn-b').classList.contains('on')"), "Mobil: Taste zeigt Gedrückt-Zustand")
    await D.cdp.send("Input.dispatchTouchEvent", {"type": "touchEnd", "touchPoints": []}); await page.wait_for_timeout(300)
    await D.advance(); await D.wait_choose(2000)
    if await D.ev("G.UI.kind") == 'choose': await D.B(); await page.wait_for_timeout(300)
    await D.shot("11_mobile_oberwelt.png")
    # START = Menü, SELECT = Ton
    await D.start(); await page.wait_for_timeout(300)
    check(await D.ev("G.UI.kind") == 'choose' and 'Team' in (await D.labels())[0], "Mobil: START öffnet das Menü")
    await D.B(); await page.wait_for_timeout(300)
    s0 = await D.ev("G.Snd.on"); await D.select(); await page.wait_for_timeout(200)
    check(await D.ev("G.Snd.on") != s0 and ('✕' in await D.ev("document.getElementById('snd-state').textContent")) == s0, "Mobil: SELECT schaltet den Ton um")
    await D.select(); await page.wait_for_timeout(1000)
    # Nebel-Lesbarkeit
    await D.ev("G.World.setMap('dorf',12,21,'down')"); await page.wait_for_timeout(600); await D.shot("27_mobile_nebel_dorf.png")
    await D.ev("G.state.flags.q1=3; G.state.flags.t_selma=1; G.World.setMap('tiefesmoor',4,24,'right')"); await page.wait_for_timeout(600); await D.shot("28_mobile_nebel_moor.png")
    await D.ev("G.World.setMap('tiefesmoor',16,14,'up')"); await page.wait_for_timeout(600); await D.shot("29_mobile_nebel_engstelle.png")
    # Wilder Kampf per Touch: Tasche -> Laterne
    await D.ev("G.World.setMap('dorf',12,21,'down'); G.debugCatch=true; void G.World.encounter()")
    await D.wait_choose()
    await D.shot("12_mobile_kampf.png")
    await D.pick('Tasche'); await D.wait_choose(); await D.pick('Seelenfänger')
    await page.wait_for_timeout(1300); await D.shot("13_mobile_fangen.png")
    await D.until("!G.B && G.mode==='world' && G.lock===0", 20000)
    await D.ev("G.debugCatch=null")
    check(await D.ev("G.state.team.length") == 2, "Mobil: Fangen per Touch")
    await common(D, 'mobile')
    await page.set_viewport_size({"width": 844, "height": 390}); await page.wait_for_timeout(600)
    await D.shot("14_mobile_quer.png")
    ga = await page.locator("#btn-a").bounding_box(); gs = await page.locator("#screen").bounding_box(); gd = await page.locator("#dpad").bounding_box()
    check(gd["x"] + gd["width"] <= gs["x"] + 4 and ga["x"] >= gs["x"] + gs["width"] - 4, "Querformat: Tasten links und rechts vom Bildschirm")
    await ctx.close()

async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(executable_path="/usr/bin/google-chrome", args=["--autoplay-policy=no-user-gesture-required"])
        print("== Desktop"); await desktop(b)
        print("== Mobil 390x844"); await mobile(b)
        await b.close()
    import subprocess, os
    for tag, fn, title in [("dpad", "test_dpad.py", "Steuerkreuz/Analogstick"), ("inhalt", "test_content.py", "Elemente, Geister, Mühle & Schmiede, Migration"), ("prolog", "test_story.py", "Prolog: Leuchtturm, Wärter, Abschied, Schiff")]:
        print(f"== {title} (tests/{fn})")
        r = subprocess.run([sys.executable, os.path.join(os.path.dirname(os.path.abspath(__file__)), fn)], capture_output=True, text=True)
        for line in r.stdout.splitlines():
            if line.startswith(("OK", "FAIL ")): print(line)
            if line.startswith("FAIL "): fails.append(tag + ": " + line[6:])
            if line.startswith("ERRORS:") and line.split()[1] != "0": errors.append(tag + ": " + line)
        if r.returncode and not any(f.startswith(tag) for f in fails) and not any(e.startswith(tag) for e in errors): fails.append(tag + "-Test abgebrochen: " + r.stderr[-300:])
    print("FAILS:", len(fails)); [print(" -", f) for f in fails]
    print("ERRORS:", len(errors)); [print(e) for e in errors]
    sys.exit(1 if fails or errors else 0)
asyncio.run(main())
