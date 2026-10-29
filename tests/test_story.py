"""Prolog «Das erloschene Licht»: Intro, Starterwahl am Laternenstein, Seelenfänger, Fang-Übung, Leuchtturm, Wärter Onno,
Abschied von den Eltern, Schiffsankunft, Ziel-Anzeige, Nebengeschichte Jorin, Migration alter Spielstände (mit Screenshots 95–113)."""
import asyncio, sys, json, time
from playwright.async_api import async_playwright
URL = "http://localhost:8080/index.html"
OUT = "/workspace/eldenghost/screenshots/"
fails, errors = [], []
def check(c, msg):
    print(("OK " if c else "FAIL") + "  " + msg)
    if not c: fails.append(msg)

async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(executable_path='/usr/bin/google-chrome', args=["--autoplay-policy=no-user-gesture-required"])
        ctx = await b.new_context(viewport={"width": 900, "height": 860})
        pg = await ctx.new_page()
        pg.on("pageerror", lambda e: errors.append(str(e))); pg.on("console", lambda m: errors.append(m.text) if m.type in ("error", "warning") else None)
        ev = lambda js: asyncio.wait_for(pg.evaluate(js), 15)
        async def shot(name, wait=250): await pg.wait_for_timeout(wait); await pg.locator("#screen").screenshot(path=OUT + name)
        async def A(): await pg.keyboard.press("Space"); await pg.wait_for_timeout(110)
        async def dismiss():
            for _ in range(30):
                if await ev("G.UI.kind") != 'say': return
                await A(); await pg.wait_for_timeout(120)
        async def text(): return await ev("document.getElementById('text').textContent")
        async def text_has(s, timeout=6000, press=True):
            t = time.time()
            while time.time() - t < timeout / 1000:
                if s in await text() and await ev("G.UI.kind") in ('say', 'choose'): return True
                if press and await ev("G.UI.kind") == 'say': await A()
                await pg.wait_for_timeout(90)
            return False
        async def idle(timeout=20000, answer=None):
            """Dialoge weiterklicken, bis die Welt frei ist (answer: Ja/Nein bei Fragen)."""
            t = time.time()
            while time.time() - t < timeout / 1000:
                k = await ev("G.UI.kind")
                if k == 'say': await A()
                elif k == 'choose':
                    labs = await pg.locator("#choices .ch").all_inner_texts()
                    lab = answer if answer in [l.strip() for l in labs] else labs[0].strip()
                    await pg.evaluate(f"[...document.querySelectorAll('#choices .ch')].find(e=>e.innerText.trim()==={json.dumps(lab)}).click()")
                    await pg.wait_for_timeout(150)
                elif await ev("G.mode==='world' && G.lock===0 && !G.fx && !G.UI.kind"):
                    await pg.wait_for_timeout(250)
                    if await ev("G.mode==='world' && G.lock===0 && !G.UI.kind"): return True
                await pg.wait_for_timeout(90)
            return False
        async def step(d, n=1):
            key = {"up": "ArrowUp", "down": "ArrowDown", "left": "ArrowLeft", "right": "ArrowRight"}[d]
            for _ in range(n):
                await pg.keyboard.down(key); await pg.wait_for_timeout(160); await pg.keyboard.up(key); await pg.wait_for_timeout(260)
                for _ in range(30):
                    if not await ev("G.P.moving"): break
                    await pg.wait_for_timeout(30)
        async def goto(m, x, y, d):
            await ev(f"G.World.setMap('{m}',{x},{y},'{d}')"); await pg.wait_for_timeout(250)
        st = lambda: ev("G.state.flags.story")

        await pg.goto(URL); await pg.wait_for_timeout(1200)
        await pg.locator("#choices .ch").first.click()        # «Neues Spiel» (frischer Browser: einzige Wahl)
        # --- 1. Intro: Aufwachen zu Hause, Mutter spricht
        ok = await text_has('Mutter:', 15000)
        await shot("95_intro_zuhause.png", 1100)
        await idle()
        check(ok and await ev("[G.map.id, G.state.team.length, G.state.items.laterne, G.state.flags.story].join()") == 'home,0,0,0',
              "Neues Spiel: Aufwachen im Elternhaus, noch kein Geist, keine Seelenfänger, Ziel 0")
        check(await ev("G.MAPS.home.npcs.map(n=>n.id).join()") == 'mutter,vater', "Mutter und Vater stehen im Elternhaus")
        check(await ev("!!G.load() && G.load().flags.story===0"), "Spielstand vor der Starterwahl lässt sich fortsetzen")
        # --- 2. Ohne Geist nicht in den Nebel
        await goto('dorf', 16, 15, 'down'); await step('down')
        blocked = await text_has('Halt!', 3000, press=False)
        await idle()
        check(blocked and await ev("G.P.y") == 15 and await ev("G.map.id") == 'dorf', "Ohne Geist blockiert Ilse den Weg ins Nebelgras")
        await goto('dorf', 46, 24, 'right'); await step('right'); await idle()
        check(await ev("G.map.id") == 'dorf', "Ostweg zur Küste ist vor dem Auftrag gesperrt")
        # --- 3. Ilse erzählt
        await goto('dorf', 18, 8, 'up'); await A()
        await text_has('Ilse: Seit dem grossen Nebel', 1500, press=False)
        await text_has('Laternensteinen', 8000); await shot("96_ilse_einfuehrung.png", 1100)
        await idle()
        check(await st() == 1, "Ilse führt in die Welt ein (Nebel, verlorene Geister) und zeigt auf die Laternensteine")
        await pg.keyboard.press("Enter"); await pg.wait_for_timeout(400)
        goal = await ev("(document.querySelector('#choices .goal')||{}).textContent||''")
        await shot("97_menu_ziel.png")
        await pg.keyboard.press("Escape"); await pg.wait_for_timeout(300)
        check('Laternensteinen' in goal, f"Menü zeigt das aktuelle Ziel: «{goal}»")
        # --- 4. Starterwahl an den Laternensteinen
        await goto('dorf', 19, 11, 'up'); await pg.wait_for_timeout(500); await shot("98_laternensteine.png")
        check(await ev("G.MAPS.dorf.npcs.filter(n=>n.altar).map(n=>n.altar).join()") == 'flackerling,pfuetzling,blattling', "Drei Laternensteine: Flackerling, Pfützling, Blattling")
        await goto('dorf', 17, 10, 'up'); await A()
        await text_has('Typ Feuer', 3000, press=False); await shot("99_starterwahl_beschreibung.png", 900)
        await text_has('als deinen ersten Geist', 8000)
        await idle(answer='Nein')
        check(await ev("G.state.team.length") == 0 and await st() == 1, "Wahl lässt sich mit «Nein» abbrechen")
        await goto('dorf', 19, 10, 'up'); await A()
        await text_has('als deinen ersten Geist', 8000)
        await pg.evaluate("[...document.querySelectorAll('#choices .ch')].find(e=>e.innerText.trim()==='Ja').click()")
        await text_has('Seelenfänger!', 8000); await shot("100_seelenfaenger_uebergabe.png", 900)
        await idle(answer='Ich kenne mich aus')   # Dorfführung: eigener Test in test_v13.py
        r = await ev("[G.state.team.map(m=>m.sp+m.lvl).join(), G.state.starter, G.state.items.laterne, G.state.flags.story, G.state.flags.ilse]")
        check(r == ['pfuetzling5', 'pfuetzling', 5, 2, 1], f"Pfützling gewählt, Ilse übergibt 5 Seelenfänger, Fang-Übung aktiv {r}")
        check(await ev("G.ITEMS.laterne.name") == 'Seelenfänger' and await ev("G.ITEMS.mondlaterne.name") == 'Mondglas-Fänger', "Einheitlicher Name: Seelenfänger / Mondglas-Fänger")
        await goto('dorf', 17, 10, 'up'); await A(); ok = await text_has('zurückgekehrt', 4000, press=False); await idle()
        check(ok, "Nicht gewählter Laternenstein ist danach leer")
        # --- 5. Fang-Übung im Nebelgras
        await ev("G.debugEncounterRate=1"); await goto('dorf', 12, 20, 'left')
        for i in range(14):
            if await ev("!!G.B"): break
            await step('left' if i % 2 == 0 else 'right')
        await ev("G.debugEncounterRate=null")
        tip = await text_has('Ilse (flüsternd)', 12000)
        await shot("101_fang_uebung.png", 1100)
        check(await ev("!!G.B && G.B.enemy.lvl<=3") and tip, "Fang-Übung: kleiner wilder Geist (Lv ≤ 3), Ilse erklärt das Fangen")
        await text_has('Was soll', 8000)
        for _ in range(40):
            if await ev("G.UI.kind==='choose'"): break
            await pg.wait_for_timeout(100)
        await ev("G.debugCatch=true")
        await pg.evaluate("[...document.querySelectorAll('#choices .ch')].find(e=>e.innerText.trim()==='Tasche').click()"); await pg.wait_for_timeout(300)
        await pg.evaluate("[...document.querySelectorAll('#choices .ch')].find(e=>e.innerText.includes('Seelenfänger')).click()")
        thrown = await text_has('Du wirfst einen Seelenfänger!', 4000, press=False)
        await text_has('Wunderbar gemacht', 12000)
        await idle(); await ev("G.debugCatch=null")
        check(thrown, "Kampftext: «Du wirfst einen Seelenfänger!»")
        check(await ev("[G.state.team.length, G.state.items.laterne, G.state.flags.story].join()") == '2,4,3', "Erster Fang gelungen: Team 2, 4 Seelenfänger übrig, Übung abgeschlossen")
        # --- 6. Auftrag: Leuchtturm
        await goto('dorf', 18, 8, 'up'); await A(); ok = await text_has('Leuchtturm', 8000); await idle()
        check(ok and await st() == 4, "Ilse schickt dich zum erloschenen Leuchtturm")
        await goto('dorf', 46, 24, 'right'); await step('right'); await pg.wait_for_timeout(800); await idle()
        check(await ev("G.map.id+','+G.P.x+','+G.P.y") == 'kueste,1,11', "Ostweg führt zur Nebelküste")
        r = await ev("[G.World.tileAt(4,11), G.World.tileAt(8,11), G.World.reachCheck('kueste',1,11).bad.filter(b=>!['Übergang hoehle','Figur onnoS'].includes(b)).length, G.World.reachCheck('leuchtturm',4,6).bad.length]")
        check(r == ['"', '"', 0, 0], f"Kurzer Weg durch die Nebelbank, Küste und Leuchtturm vollständig erreichbar (Onnos Platz nur durch die Klippenhöhle, siehe test_v16) {r}")
        await ev("G.time=100"); await goto('kueste', 19, 8, 'up'); await pg.wait_for_timeout(600); await shot("102_leuchtturm_dunkel.png", 500)
        check(await ev("G.MAPS.kueste.houses[0].art") == 'leuchtturm', "Leuchtturm ist dunkel")
        # --- 7. Lampenraum: dunkle Lampe
        await goto('kueste', 22, 7, 'up'); await step('up')
        ok = await text_has('Lampenraum ist es kalt', 6000, press=False); await shot("103_lampe_dunkel.png", 1300)
        await idle()
        check(ok and await ev("G.map.id") == 'leuchtturm' and await st() == 5, "Im Leuchtturm: kalte Lampe, Wärter fehlt (Ziel: Onno suchen)")
        await goto('leuchtturm', 4, 3, 'up'); await A(); ok = await text_has('Lampe ist kalt', 4000, press=False); await idle()
        check(ok, "Lampe untersuchen: sie ist aus")
        # --- 8. Onno schläft unter seinem Baum, A weckt ihn (v16: erst nach Team Quantum in der Klippenhöhle – dort in test_v16 geprüft)
        await ev("G.state.flags.quantum=1; G.state.flags.qseen=1")
        await goto('kueste', 18, 6, 'up'); await pg.wait_for_timeout(500); await shot("104_waerter_schlaeft.png", 400)
        check(await ev("G.map.npcs.find(n=>n.id==='onnoS').spr") == 'onnoSleep', "Wärter Onno schläft unter dem Baum beim Turm")
        await goto('kueste', 18, 5, 'up'); await A()
        ok = await text_has('Ist es schon dunkel', 8000)
        await shot("105_onno_erwacht.png", 900)
        await text_has('Streichholz', 10000)
        await dismiss(); await pg.wait_for_timeout(1100); await shot("106_lampe_zuenden.png", 0)
        await text_has('Die Lampe erwacht', 8000, press=False); await pg.wait_for_timeout(300); await shot("107_lampe_hell.png", 1300)
        ok2 = await text_has('verabschiede dich', 30000)
        await idle()
        check(ok and ok2 and await st() == 6 and await ev("G.map.id") == 'leuchtturm', "Onno geweckt, zündet die Lampe an und schickt dich heim zu den Eltern")
        check(await ev("G.MAPS.kueste.houses[0].art") == 'leuchtturm_lit' and await ev("G.map.npcs[0].id") == 'onno', "Leuchtturm brennt, Onno steht an seiner Lampe")
        await goto('kueste', 19, 8, 'up'); await pg.wait_for_timeout(1400); await shot("108_leuchtturm_hell.png", 300)
        # --- 9. Abschied von den Eltern
        await goto('dorf', 5, 6, 'up'); await step('up')
        ok = await text_has('stillsitzt', 8000); await shot("109_abschied_eltern.png", 1300)
        await text_has('Kompass', 8000)
        await text_has('Nebelhorn', 8000); await shot("110_abschied_nebelhorn.png", 1100)
        await idle()
        check(ok and await st() == 7 and await ev("G.state.items.kompass") == 1, "Abschied: Mutter und Vater verabschieden dich, Vaters Kompass, Nebelhorn ruft")
        # --- 10. Schiffsankunft im Hafen
        await goto('kueste', 15, 12, 'down'); await step('down')
        await text_has('Nebelhorn rollt', 6000, press=False); await dismiss()
        await pg.wait_for_timeout(2000); await shot("111_schiff_ankunft.png", 0)
        await text_has('legt knarrend', 8000, press=False); await shot("111b_schiff_angelegt.png", 1300); await dismiss()
        await text_has('Kapitänin Wenke', 8000, press=False); await shot("112_kapitaenin_wenke.png", 1500)
        ok = await text_has('Koje frei', 12000)
        await text_has('Prolog', 6000)
        await pg.wait_for_timeout(100); await A(); await pg.wait_for_timeout(300)
        toast = await ev("document.getElementById('toast').textContent")
        await idle()
        check(ok and await st() == 8 and 'An Bord' in toast, f"Schiff legt an, Kapitänin Wenke spricht, Ziel «{toast}»")
        await pg.keyboard.press("Enter"); await pg.wait_for_timeout(400)
        goal = await ev("(document.querySelector('#choices .goal')||{}).textContent||''")
        await shot("113_ziel_an_bord.png")
        await pg.keyboard.press("Escape"); await pg.wait_for_timeout(300)
        check('Nebelschwalbe' in goal, f"Nächstes Ziel im Menü: «{goal}»")
        # v20: An Bord gehen führt jetzt weiter – die Schwalbe segelt zur Rauchbucht (Aschehang)
        await goto('kueste', 15, 17, 'down'); await A(); await text_has('Bereit zum Ablegen?', 4000)
        await pg.evaluate("[...document.querySelectorAll('#choices .ch')].find(e=>e.innerText.trim()==='Ja').click()")
        for _ in range(40):
            if await ev("G.map.id") == 'aschehang' and await ev("G.state.flags.story") >= 9: break
            await A(); await pg.wait_for_timeout(250)
        await idle()
        check(await ev("G.map.id") == 'aschehang' and await ev("G.state.flags.story") == 9, "An Bord gehen: Überfahrt zur Rauchbucht am Aschehang (Prolog endet, Ziel 9)")
        await goto('dorf', 18, 8, 'up')
        # --- 11. Nebengeschichte Jorin bleibt erreichbar
        await goto('dorf', 23, 12, 'up'); await step('up'); await idle()
        await goto('dorf', 18, 8, 'up'); await A(); await idle()
        check(await ev("G.state.flags.note") == 1 and await ev("G.state.flags.q1") == 1, "Nebengeschichte «Das Licht im Moor»: Zettel an Jorins Tür, Ilse gibt den Auftrag")
        # --- 12. Alte Spielstände
        old = {"v": 3, "map": "dorf", "player": {"x": 16, "y": 7, "dir": "down"}, "team": [{"sp": "flackerling", "lvl": 12, "moves": ["hauch"], "hp": 30}], "box": [],
               "items": {"laterne": 0, "kraeutertee": 2}, "flags": {"q1": 7, "ilse": 1}, "seen": {}, "caught": {}, "playtime": 500}
        await ev(f"G.state=null; G.Store.set(G.SAVE_KEY, {json.dumps(json.dumps(old))})")
        await pg.reload(); await pg.wait_for_timeout(1200)
        await pg.evaluate("[...document.querySelectorAll('#choices .ch')].find(e=>e.innerText.trim()==='Fortsetzen').click()"); await pg.wait_for_timeout(2400)
        toast = await ev("document.getElementById('toast').textContent")
        r = await ev("[G.state.flags.story, G.state.items.laterne, G.state.flags.q1, G.map.id]")
        check(r == [4, 5, 7, 'dorf'] and 'Prolog' in toast, f"Alter Spielstand: Einführung übersprungen, Leuchtturm-Auftrag, 5 Seelenfänger {r} «{toast}»")
        mig = await ev("(()=>{const s=G.migrate({v:3,map:'dorf',player:{x:16,y:7},team:[{sp:'moorlurch',lvl:5,moves:['rempler'],hp:9}],box:[],items:{laterne:7},flags:{q1:1}}); return [s.flags.story, s.items.laterne]})()")
        check(mig == [4, 7], f"Alter Spielstand mit Seelenfängern behält seine Anzahl {mig}")
        await b.close()
    print("FAILS:", len(fails)); [print(" -", f) for f in fails]
    print("ERRORS:", len(errors)); [print(e) for e in errors]
    sys.exit(1 if fails or errors else 0)
asyncio.run(main())
