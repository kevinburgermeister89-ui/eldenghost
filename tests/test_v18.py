"""v18: Münzen für jeden Kampf, Fridas Marktstube im Dorf (Laden), Anselm sucht starken Kräutertee (nur Gespräch)."""
import asyncio, sys, json, math, time, os
SHOTS = '/workspace/shots_v18'; os.makedirs(SHOTS, exist_ok=True)
from playwright.async_api import async_playwright
URL = "http://localhost:8080/index.html?touch=1"
def SET(story=4, q1=0, flags='', m='dorf', x=16, y=7, d='down', team="[G.makeMon('flackerling',9)]", v=5, extra=''):
    return ("G.demo=true; G.state={v:%d,map:'%s',player:{x:%d,y:%d,dir:'%s'},team:%s,box:[],items:{laterne:4,kraeutertee:2},flags:{q1:%d,story:%d,tour:1%s},seen:{},caught:{},respawn:null,playtime:0};"
            "G.UI.title(false); G.UI.kind=null; G.UI.handler=null; document.getElementById('choices').className='hidden'; G.mode='world'; G.lock=0; G.debugEncounterRate=1e-9;%s"
            "G.World.setMap('%s',%d,%d,'%s');") % (v, m, x, y, d, team, q1, story, flags, extra, m, x, y, d)
fails, errors = [], []
def check(c, msg):
    print(("OK " if c else "FAIL") + "  " + msg, flush=True)
    if not c: fails.append(msg)
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(executable_path='/usr/bin/google-chrome', args=["--autoplay-policy=no-user-gesture-required"])
        ctx = await b.new_context(viewport={"width": 390, "height": 844}, device_scale_factor=2, is_mobile=True, has_touch=True)
        pg = await ctx.new_page()
        pg.on("pageerror", lambda e: errors.append(str(e))); pg.on("console", lambda m: errors.append(m.text) if m.type in ("error", "warning") else None)
        await pg.goto(URL); await pg.wait_for_timeout(1500)
        ev = pg.evaluate
        cdp = await ctx.new_cdp_session(pg)
        async def touch(kind, pts): await cdp.send("Input.dispatchTouchEvent", {"type": kind, "touchPoints": [{"x": x, "y": y, "id": 1} for x, y in pts]})
        async def idle(timeout=15000, answer=None):
            t = 0
            while t < timeout:
                st = await ev("({k:G.UI.kind, l:G.lock, m:G.mode, ch:[...document.querySelectorAll('#choices .ch')].map(e=>e.textContent)})")
                if st['k'] is None and st['l'] == 0 and st['m'] == 'world': return True
                if st['k'] == 'choose' and st['ch']:
                    lab = answer if answer in [c.strip() for c in st['ch']] else st['ch'][0].strip()
                    await ev(f"[...document.querySelectorAll('#choices .ch')].find(e=>e.textContent.trim()==={json.dumps(lab)}).click()")
                elif st['k'] == 'say': await pg.keyboard.press("Space")
                await pg.wait_for_timeout(120); t += 120
            return False
        async def to_menu(timeout=20000):
            t = 0
            while t < timeout:
                st = await ev("({k:G.UI.kind, ch:[...document.querySelectorAll('#choices .ch')].map(e=>e.textContent.trim())})")
                if st['k'] == 'choose' and any(c == 'Kampf' for c in st['ch']): return True
                if st['k'] == 'say': await pg.keyboard.press("Space")
                await pg.wait_for_timeout(60); t += 60
            return False
        async def click(label):
            for _ in range(50):
                ok = await ev(f"(()=>{{const e=[...document.querySelectorAll('#choices .ch')].find(e=>e.textContent.trim().startsWith({json.dumps(label)})); if(e){{e.click(); return true;}} return false;}})()")
                if ok: return True
                await pg.wait_for_timeout(60)
            return False
        async def battle(ally, moves, enemy, lvl=20, elvl=20, extra=''):
            await ev(SET(team=f"[(()=>{{const m=G.makeMon('{ally}',{lvl}); m.moves={json.dumps(moves)}; G.fillPP(m); return m;}})()]", extra=extra))
            asyncio.ensure_future(ev(f"G.debug.wild('{enemy}',{elvl}).catch(()=>0)"))
            return await to_menu()
        async def end_battle():
            await ev("if (G.B) { G.B.enemy.hp = 0; }")
            for _ in range(200):
                if await ev("G.mode==='world' && !G.B && G.lock===0"): break
                st = await ev("G.UI.kind")
                if st == 'say': await pg.keyboard.press("Space")
                elif st == 'choose': await ev("(()=>{const e=[...document.querySelectorAll('#choices .ch')].find(e=>/^Kampf$/.test(e.textContent.trim()))||document.querySelector('#choices .ch'); e&&e.click();})()")
                await pg.wait_for_timeout(80)



        async def text():
            return await ev("(document.getElementById('text')||{}).textContent||''")
        async def run_until_world(max_steps=900, answer='Ja', log=None):
            seen = ''
            for _ in range(max_steps):
                st = await ev("({k:G.UI.kind, l:G.lock, m:G.mode, ch:[...document.querySelectorAll('#choices .ch')].map(e=>e.textContent.trim()), t:(document.getElementById('text')||{}).textContent||'', B:!!G.B, pips:document.querySelectorAll('.pips b').length, gone:document.querySelectorAll('.pips b.gone').length, en:G.B?G.B.enemy.sp:null})")
                seen += '|' + st['t']
                if log is not None and st['en']: log.append((st['en'], st['pips'], st['gone']))
                if st['k'] is None and st['l'] == 0 and st['m'] == 'world' and not st['B']: return seen
                if st['k'] == 'choose' and st['ch']:
                    lab = next((c for c in st['ch'] if c == 'Kampf'), None) or (answer if answer in st['ch'] else st['ch'][0])
                    await ev(f"[...document.querySelectorAll('#choices .ch')].find(e=>e.textContent.trim()==={json.dumps(lab)}).click()")
                elif st['k'] == 'say': await pg.keyboard.press("Space")
                await pg.wait_for_timeout(90)
            return seen


        r = await ev("fetch('sw.js').then(r=>r.text()).then(t=>/eldenghost-v(1[89]|2[0-9])/.test(t))")
        check(r, "Cache eldenghost-v18")
        # ================= Münzen: Formel =================
        r = await ev("""[G.battleMoney([G.makeMon('funkmaus',3)],null,false), G.battleMoney([G.makeMon('funkmaus',12)],null,false), G.battleMoney([G.makeMon('mondluchs',7)],null,true),
          G.battleMoney(G.trainerTeam('fenn').map(([s,l])=>G.makeMon(s,l)), G.TRAINERS.fenn), G.battleMoney(G.TRAINERS.quantum.team.map(([s,l])=>G.makeMon(s,l)), G.TRAINERS.quantum), G.CURRENCY]""")
        check(r[0] == 11 and r[1] == 29 and r[2] == 57, f"Wildkampf: 5 + 2×Level (Sondergeist ×3) {r[:3]}")
        check(r[3] > r[1] and r[4] > r[3] and r[5] == 'Münzen', f"Beschwörer bringen mehr (Fenn {r[3]}, Team Quantum {r[4]}) in {r[5]}")
        r = await ev("[G.SHOP.map(([k,p])=>[k,p,!!G.ITEMS[k]]), ['brandsalbe','bitterwurz','wachkraut'].map(k=>G.ITEMS[k].cures[0])]")
        check(all(x[2] for x in r[0]) and len(r[0]) >= 9 and r[1] == ['brand', 'gift', 'schlaf'], f"Ladensortiment inkl. neuer Heilmittel gegen Verbrennung, Gift, Schlaf {[(x[0], x[1]) for x in r[0]]}")
        prices = dict((x[0], x[1]) for x in r[0])
        check(prices['laterne'] <= 4 * 11 and prices['kraeutertee'] <= 2 * 11 and prices['nachtkerze'] > prices['starktee'] > prices['kraeutertee'], f"Preise fair: Seelenfänger ≈ 3–4 frühe Wildkämpfe {prices}")
        # ================= Münzen nach Wildkampf =================
        await ev(SET(team="[G.makeMon('glutwurm',20)]", extra="G.state.money=10;"))
        asyncio.ensure_future(ev("G.debug.wild('funkmaus',6).catch(()=>0)"))
        await to_menu()
        await ev("G.B.enemy.hp=1")
        await click('Kampf'); await pg.wait_for_timeout(150)
        await ev("document.querySelector('#choices .ch').click()")
        seen = ''
        for _ in range(200):
            st = await ev("({k:G.UI.kind, m:G.mode, B:!!G.B, t:(document.getElementById('text')||{}).textContent})")
            seen += '|' + st['t']
            if st['m'] == 'world' and not st['B'] and await ev("G.lock===0"): break
            if st['k'] == 'say': await pg.keyboard.press("Space")
            elif st['k'] == 'choose': await ev("document.querySelector('#choices .ch')&&document.querySelector('#choices .ch').click()")
            await pg.wait_for_timeout(90)
        r = await ev("[G.state.money, G.lastMoney]")
        check(r == [27, 17] and 'Du erhältst 17 Münzen.' in seen, f"nach dem Wildkampf: «Du erhältst 17 Münzen.» und Kasse 10→27 {r}")
        # ================= Beschwörer =================
        await ev(SET(team="[G.makeMon('seelendrache',30)]", extra="G.state.money=0;"))
        asyncio.ensure_future(ev("G.Battle.trainer('fenn').catch(e=>console.error(e))"))
        for _ in range(400):
            st = await ev("({k:G.UI.kind, m:G.mode, B:!!G.B, l:G.lock, ch:[...document.querySelectorAll('#choices .ch')].map(e=>e.textContent.trim())})")
            if st['m'] == 'world' and not st['B'] and st['l'] == 0 and _ > 5: break
            if st['k'] == 'say': await pg.keyboard.press("Space")
            elif st['k'] == 'choose':
                if 'Kampf' in st['ch']: await click('Kampf')
                else: await ev("document.querySelector('#choices .ch').click()")
            await pg.wait_for_timeout(90)
        r = await ev("[G.state.money, G.battleMoney(G.trainerTeam('fenn').map(([s,l])=>G.makeMon(s,l)), G.TRAINERS.fenn), G.state.flags.t_fenn]")
        check(r[0] == r[1] and r[2] == 1, f"Sieg gegen Fenn: {r[0]} Münzen (Beschwörer-Formel {r[1]})")
        # ================= Menü zeigt Münzen =================
        await ev(SET(extra="G.state.money=123;"))
        asyncio.ensure_future(ev("G.Menu.open().catch(()=>0)")); await pg.wait_for_timeout(500)
        r = await ev("(document.querySelector('#choices .money')||{}).textContent||''")
        check('123 Münzen' in r, f"START-Menü zeigt die Münzen «{r}»")
        await pg.screenshot(path=SHOTS + '/menu_money.png')
        await ev("G.UI.handler&&G.UI.handler('B')"); await pg.wait_for_timeout(300)
        # ================= Marktstube von aussen =================
        r = await ev("[G.MAPS.dorf.houses.find(h=>h.id==='markt'), G.MAPS.dorf.doors['39,5'], G.MAPS.dorf.tiles[5][39], G.MAPS.dorf.tiles[5][42], G.MAPS.markt.npcs.map(n=>n.id), G.World.reachCheck('markt',4,6).bad, G.World.reachCheck('dorf',16,7).bad]")
        check(r[0] and r[0]['art'] == 'markt' and r[1]['to'] == 'markt' and r[2] == 'D' and r[3] == 'S', f"Marktstube im Dorf (eigenes Gebäude mit Markise, Schild davor) {r[:4]}")
        check(r[4] == ['frida', 'anselm'] and not r[5] and not r[6], f"Frida und Anselm in der Marktstube, alles erreichbar {r[4:]}")
        await ev(SET(x=39, y=8, d='up'))
        await pg.wait_for_timeout(1500); await pg.locator('#screen').screenshot(path=SHOTS + '/markt_aussen.png')
        await ev("G.state.player={x:42,y:6,dir:'up'}; G.World.setMap('dorf',42,6,'up')"); await pg.wait_for_timeout(300)
        await pg.keyboard.press("Space"); await pg.wait_for_timeout(700)
        t = await text(); check('Marktstube' in t, f"Schild vor dem Laden «{t[:60]}»"); await idle()
        # durch die Tür hinein
        await ev("G.World.setMap('dorf',39,6,'up')"); await pg.wait_for_timeout(300)
        await pg.keyboard.press("ArrowUp"); await pg.wait_for_timeout(1500)
        r = await ev("[G.map.id, G.P.x, G.P.y]")
        check(r[0] == 'markt', f"Tür führt in Fridas Marktstube {r}")
        await pg.wait_for_timeout(800); await pg.locator('#screen').screenshot(path=SHOTS + '/markt_innen.png')
        # ================= Kaufen bei Frida (über die Theke) =================
        await ev(SET(m='markt', x=2, y=4, d='up', extra="G.state.money=100; G.state.items.laterne=0;"))
        await pg.wait_for_timeout(300)
        await pg.keyboard.press("Space"); await pg.wait_for_timeout(500)
        shot = False; bought = False; seen = ''
        for _ in range(200):
            st = await ev("({k:G.UI.kind, l:G.lock, t:(document.getElementById('text')||{}).textContent, ch:[...document.querySelectorAll('#choices .ch')].map(e=>e.textContent.trim()), title:(document.querySelector('#choices .ch-title')||{}).textContent||''})")
            seen += '|' + st['t']
            if st['k'] is None and st['l'] == 0 and _ > 3: break
            if st['k'] == 'choose' and 'Fridas Marktstube' in st['title']:
                if not shot: await pg.screenshot(path=SHOTS + '/laden_menu.png'); shot = True
                if not bought: await ev("[...document.querySelectorAll('#choices .ch')].find(e=>e.textContent.includes('Seelenfänger –')).click()"); bought = True
                else: await ev("document.querySelector('#choices .ch.back').click()")
            elif st['k'] == 'choose' and any(c.startswith('3×') for c in st['ch']):
                await ev("[...document.querySelectorAll('#choices .ch')].find(e=>e.textContent.trim().startsWith('3×')).click()")
            elif st['k'] == 'choose': await ev("document.querySelector('#choices .ch').click()")
            elif st['k'] == 'say': await pg.keyboard.press("Space")
            await pg.wait_for_timeout(100)
        r = await ev("[G.state.money, G.state.items.laterne, G.state.flags.frida]")
        check(r == [60, 1, 1], f"100 Münzen reichen nicht für 3 Seelenfänger – nur 1× wird angeboten, Kauf 100→60 {r}")
        check('Frida:' in seen and 'Münzen' in seen, "Frida begrüsst und nennt Münzen als Zahlungsmittel")
        # zweiter Kauf mit genug Geld
        await ev("G.state.money=200; G.state.items.laterne=0; G.UI.kind=null; G.lock=0;")
        r = await ev("""(async()=>{ const p=G.Menu.shop(); await new Promise(r=>setTimeout(r,300));
            [...document.querySelectorAll('#choices .ch')].find(e=>e.textContent.includes('Seelenfänger –')).click(); await new Promise(r=>setTimeout(r,300));
            const qs=[...document.querySelectorAll('#choices .ch')].map(e=>e.textContent.trim());
            [...document.querySelectorAll('#choices .ch')].find(e=>e.textContent.trim().startsWith('3×')).click(); await new Promise(r=>setTimeout(r,500));
            G.UI.handler&&G.UI.handler('A'); await new Promise(r=>setTimeout(r,400)); G.UI.handler&&G.UI.handler('A'); await new Promise(r=>setTimeout(r,400));
            const dis=[...document.querySelectorAll('#choices .ch')].filter(e=>e.classList.contains('disabled')).map(e=>e.textContent.split(' –')[0]);
            document.querySelector('#choices .ch.back').click(); const res=await p; return [qs, G.state.money, G.state.items.laterne, dis, res];})()""")
        check(r[0][:3] == ['1× – 40', '3× – 120', '5× – 200'] and r[1] == 80 and r[2] == 3 and r[4] is True, f"Menge wählen: 3× Seelenfänger für 120 → Kasse 200→80 {r[:3]}")
        check('Nachtkerze' in r[3] and 'Mondglas-Fänger' in r[3] and 'Kräutertee' not in r[3], f"zu teure Waren sind ausgegraut {r[3]}")
        # ================= Anselm: nur Gespräch =================
        await ev(SET(m='markt', x=6, y=3, d='up', extra="G.state.flags.anselm=0;"))
        await pg.wait_for_timeout(300)
        lines = []
        for k in range(2):
            await pg.keyboard.press("Space"); await pg.wait_for_timeout(600)
            for _ in range(20):
                st = await ev("({k:G.UI.kind, t:(document.getElementById('text')||{}).textContent})")
                if st['k'] is None: break
                lines.append(st['t']); await pg.keyboard.press("Space"); await pg.wait_for_timeout(350)
            await idle()
        allt = ' '.join(lines)
        r = await ev("[G.World.markers('markt'), G.state.items.starktee||0, Object.keys(G.state.flags).filter(k=>/tee|quest/i.test(k))]")
        check('starken Kräutertee' in allt and 'Anselm:' in allt, f"Anselm erzählt, dass er starken Kräutertee sucht «{allt[:90]}»")
        check(r[0] == [] and r[2] == [], f"kein Auftrag, kein «!», keine Belohnung {r}")
        # ================= Alter Spielstand bekommt ein kleines Erspartes =================
        r = await ev("""(()=>{const a=G.migrate({v:6,map:'dorf',player:{x:16,y:7,dir:'down'},team:[{sp:'flackerling',lvl:9,xp:0,hp:20,moves:['fauchen'],pp:{}}],box:[],items:{},flags:{q1:1,story:4}});
          const b=G.migrate({v:6,map:'dorf',player:{x:16,y:7,dir:'down'},team:[{sp:'flackerling',lvl:9,xp:0,hp:20,moves:['fauchen'],pp:{}}],box:[],items:{},flags:{q1:1,story:4},money:7});
          return [a.money, b.money];})()""")
        check(r == [80, 7], f"alter Spielstand ohne Münzen startet mit 80, vorhandene bleiben {r}")
        r = await ev("(()=>{G.demo=false; G.state.money=42; G.save(true); const v=JSON.parse(G.Store.get(G.SAVE_KEY)).money; G.demo=true; return v;})()")
        check(r == 42, f"Münzen werden gespeichert ({r})")

        bad = [e for e in errors if 'favicon' not in e and 'AudioContext' not in e]
        check(not bad, f"keine Konsolenfehler {bad[:4]}")
        await b.close()
    print("\n%d Fehler" % len(fails) if fails else "\nALLE v18-TESTS OK")
    sys.exit(1 if fails else 0)
asyncio.run(main())
