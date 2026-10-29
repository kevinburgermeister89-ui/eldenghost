"""v17: Attacken-Rework (gemeinsame Attacken + Signaturen), Attacken-Info, Kampfrollen, Sondergeister je Gebiet mit Zähler, Sonder-Entwicklungen."""
import asyncio, sys, json, math, time, os
SHOTS = '/workspace/shots_v17'; os.makedirs(SHOTS, exist_ok=True)
CHECKS = open(os.path.join(os.path.dirname(os.path.abspath(__file__)), 'v17_checks.js')).read()
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

        # ================= Grundlagen =================
        r = await ev("[G.FEAT.rare, G.SAVE_VERSION, fetch('sw.js').then(r=>r.text()).then(t=>/eldenghost-v(1[7-9]|2[0-9])/.test(t))]")
        r[2] = await ev("fetch('sw.js').then(r=>r.text()).then(t=>/eldenghost-v(1[7-9]|2[0-9])/.test(t))")
        check(r[0] is True and r[1] == 6 and r[2], f"v17 aktiv: Sondergeister an, Spielstand v6, Cache eldenghost-v17 {r}")
        # ================= Attacken-Pool, Rollen, Balance =================
        res = await ev("(()=>{" + CHECKS + "})()")
        check(not res['bad'], f"Balance/Rollen/Lvl-8-Regel: keine Abweichungen {res['bad'][:6]}")
        inf = res['info']
        check(0.10 <= inf['statusShare'] <= 0.20, f"Status-Attacken nur ~15–20 % der lernbaren Attacken: {inf['statusMoves']}/{inf['used']} = {inf['statusShare']:.1%}")
        check(not inf['noDesc'], f"jede Attacke hat eine 1-Zeilen-Beschreibung {inf['noDesc'][:5]}")
        r = await ev("""(()=>{const S=G.SPECIES, pre={}; for(const k in S) if(S[k].evo) pre[S[k].evo.to]=k;
          const root=k=>{while(pre[k]) k=pre[k]; return k;}; const lines={}; for(const k in S){ if(S[k].boss) continue; (lines[root(k)]=lines[root(k)]||new Set()); S[k].learn.forEach(l=>lines[root(k)].add(l[1])); }
          const owner={}; for(const r in lines) for(const m of lines[r]) (owner[m]=owner[m]||new Set()).add(r);
          const sig=Object.fromEntries(Object.entries(lines).map(([r,ms])=>[r,[...ms].filter(m=>owner[m].size===1)]));
          const shared=Object.keys(owner).filter(m=>owner[m].size>=3).length;
          const pw=new Set(Object.values(G.MOVES).map(M=>M.power)).size, acc=new Set(Object.values(G.MOVES).map(M=>M.acc)).size;
          return {noSig:Object.keys(sig).filter(r=>!sig[r].length), shared, total:Object.keys(owner).length, pw, acc, maxSig:Math.max(...Object.values(sig).map(s=>s.length))};})()""")
        check(not r['noSig'], f"jede Linie hat mindestens eine eigene Signatur-Attacke (ohne: {r['noSig']})")
        check(r['shared'] >= 25, f"gemeinsame Attacken, die ≥3 Linien teilen: {r['shared']} von {r['total']}")
        check(r['pw'] >= 12 and r['acc'] >= 5, f"Stärke und Genauigkeit variieren: {r['pw']} Stärke-Werte, {r['acc']} Genauigkeits-Werte")
        r = await ev("[Object.keys(G.SPECIES).filter(k=>!G.SPECIES[k].boss && !G.ROLES[G.SPECIES[k].role]), Object.keys(G.ROLES)]")
        check(not r[0] and r[1] == ['Tank','Sweeper','Speedster','Bruiser','Support','Status'], f"alle Geister haben eine der 6 Rollen {r}")
        # Effekte: jede Attacke hat eine eigene Animation ≤3 s
        r = await ev("[Object.keys(G.MOVES).filter(k=>!G.Battle.MOVE_FX[k]), Object.values(G.Battle.MOVE_FX).filter(f=>!(f.ms>0&&f.ms<=3000)).length, Object.keys(G.Battle.MOVE_FX).length, new Set(Object.values(G.Battle.MOVE_FX).map(f=>f.fn.toString())).size]")
        check(not r[0] and r[1] == 0 and r[2] == r[3], f"jede Attacke hat eine eigene Animation (fehlend {r[0][:5]}, zu lang {r[1]}, {r[3]}/{r[2]} verschieden)")
        # moveInfo
        r = await ev("[G.moveInfo('otterpfoten',3), G.moveInfo('geistesblitz'), G.moveInfo('pickser',10)]")
        check(r[0]['power'].startswith('14×') or '×2–4' in r[0]['power'], f"Mehrfach-Treffer zeigen Stärke×Anzahl: {r[0]['power']}")
        check(r[1]['acc'] == 'sicher' and r[2]['prio'] == 1 and r[0]['ap'].startswith('3/'), f"Info: sicher/Erstschlag/AP {r[1]['acc']} {r[2]['prio']} {r[0]['ap']}")

        # ================= Kampf: Attacken-Menü mit Info =================
        ok = await battle('glimmerwurm', ['rammbock','kristallbohrer','haerten','funkenschlag'], 'raufdachs', 14, 10)
        check(ok, "Kampf mit Glimmerwurm startet (Sondergeist-Sprite vorhanden)")
        await click('Kampf'); await pg.wait_for_timeout(300)
        r = await ev("({cls:document.getElementById('choices').className, info:(document.getElementById('mvinfo')||{}).textContent||'', n:document.querySelectorAll('#choices .ch').length})")
        check('moves' in r['cls'] and 'Stärke' in r['info'] and 'Gen.' in r['info'] and 'AP' in r['info'] and len(r['info']) > 40, f"Attacken-Menü zeigt Typ/Stärke/Genauigkeit/AP/Beschreibung: {r['info'][:120]}")
        await pg.screenshot(path=SHOTS + '/battle_moveinfo.png')
        # Touch: erster Tipp auf eine andere Attacke wählt nur aus (Info wechselt), zweiter bestätigt
        box = await ev("(()=>{const e=[...document.querySelectorAll('#choices .ch')].find(e=>e.textContent.includes('Härten')); const r=e.getBoundingClientRect(); return [r.x+r.width/2, r.y+r.height/2];})()")
        await touch('touchStart', [box]); await touch('touchEnd', []); await pg.wait_for_timeout(250)
        r = await ev("[(document.getElementById('mvinfo')||{}).textContent||'', G.UI.kind]")
        check('Härten' in r[0] and r[1] == 'choose', f"erster Tipp zeigt nur die Info der Attacke ({r[0][:40]}, {r[1]})")
        await touch('touchStart', [box]); await touch('touchEnd', []); await pg.wait_for_timeout(400)
        r = await ev("G.UI.kind")
        check(r != 'choose' or not await ev("!!document.getElementById('mvinfo')"), f"zweiter Tipp setzt die Attacke ein ({r})")
        await end_battle()
        # Mechanik: Erstschlag, Mehrfach-Treffer, Abwehr, Schlaf, DOT, Nebeneffekt
        async def turn(ally, amoves, aid, enemy, emoves, alvl=20, elvl=20, extra_js=''):
            await ev(SET(team=f"[(()=>{{const m=G.makeMon('{ally}',{alvl}); m.moves={json.dumps(amoves)}; G.fillPP(m); return m;}})()]"))
            asyncio.ensure_future(ev(f"G.debug.wild('{enemy}',{elvl},{json.dumps(emoves)}).catch(()=>0)"))
            await to_menu()
            if extra_js: await ev(extra_js)
            await ev("G.Battle.lastOrder=null; G.Battle.lastHit=null;")
            await click('Kampf'); await pg.wait_for_timeout(150)
            await ev(f"(()=>{{const e=[...document.querySelectorAll('#choices .ch')].find(e=>e.textContent.includes(G.MOVES['{aid}'].name)); e.click();}})()")
            await to_menu()
            return await ev("({o:G.Battle.lastOrder, h:G.Battle.lastHit, ehp:G.B&&G.B.enemy.hp, emax:G.B&&G.stats(G.B.enemy).hp, est:G.B&&G.B.enemy.status, st:G.B&&G.B.st, ahp:G.B&&G.state.team[0].hp})")
        r = await turn('nebelkauz', ['pickser'], 'pickser', 'flatterhauch', ['rempler'], 5, 14)
        check(r['o'] and r['o']['seq'][0] == 'ally', f"Erstschlag (Pickser) handelt vor dem schnelleren Gegner {r['o']}")
        await end_battle()
        r = await turn('schilfotter', ['otterpfoten'], 'otterpfoten', 'kieselgeist', ['haerten'], 12, 30)
        check(r['h'] and 2 <= r['h']['hits'] <= 4, f"Otterpfoten trifft 2–4 Mal: {r['h']}")
        await end_battle()
        r = await turn('flackerling', ['rempler'], 'rempler', 'moosigel', ['einrollen'], 12, 12)
        check(r['ehp'] == r['emax'] and r['o']['seq'][0] == 'enemy', f"Abwehr (Einrollen) geht vor und blockt den Treffer (LP {r['ehp']}/{r['emax']})")
        await end_battle()
        # v20.2: Zufall fixieren – Pechfeder hat 85 % Genauigkeit; ein Fehlwurf liess den Test sporadisch scheitern
        # (die alte Ausnahme «h is None» griff nie, weil lastHit den Rempler des Gegners enthält)
        r = await turn('glockenrabe', ['pechfeder'], 'pechfeder', 'tauhase', ['rempler'], 16, 12, "Math._r=Math.random; Math.random=()=>0.3;")
        await ev("Math.random=Math._r||Math.random")
        check((r['est'] or {}).get('id') == 'gift', f"Pechfeder vergiftet {r['est']}")
        dot = await ev("(()=>{const m=G.B.enemy, mx=G.stats(m).hp; return [m.hp, mx];})()")
        check(dot[0] < dot[1], f"Gift zehrt am Rundenende {dot}")
        await end_battle()
        r = await turn('glockenrabe', ['totenlaeuten'], 'totenlaeuten', 'menhirgeist', ['haerten'], 12, 24, "Math._r=Math.random; Math.random=()=>0.3;")
        await ev("Math.random=Math._r||Math.random")
        check(r['st'] and r['st']['enemy']['def'] <= 0, f"Totenläuten senkt als Nebeneffekt die Verteidigung {r['st'] and r['st']['enemy']}")
        await end_battle()

        # ================= Team-Übersicht & Chronik =================
        await ev(SET(team="[G.makeMon('wogenotter',24), G.makeMon('moosigel',9)]", extra="G.state.seen={wogenotter:1,moosigel:1,seelenrabe:1};G.state.caught={wogenotter:1,moosigel:1};"))
        asyncio.ensure_future(ev("G.Menu.team().catch(()=>0)")); await pg.wait_for_timeout(400)
        await ev("document.querySelector('#choices .ch').click()"); await pg.wait_for_timeout(400)
        r = await ev("({rows:document.querySelectorAll('.movelist .mvrow').length, role:(document.querySelector('.role')||{}).textContent, txt:(document.querySelector('.movelist')||{}).textContent||''})")
        check(r['rows'] == 4 and r['role'] == 'Sweeper' and 'Stärke' in r['txt'] and 'AP' in r['txt'], f"Übersicht: Rolle + 4 Attacken mit Info {r['rows']} {r['role']}")
        await pg.screenshot(path=SHOTS + '/summary_moves.png')
        await ev("G.UI.handler&&G.UI.handler('B')"); await pg.wait_for_timeout(200); await ev("G.UI.handler&&G.UI.handler('B')"); await pg.wait_for_timeout(200)
        await ev(SET(extra="G.state.seen={wogenotter:1,moosigel:1,seelenrabe:1};"))
        asyncio.ensure_future(ev("G.Menu.chronik().catch(()=>0)")); await pg.wait_for_timeout(500)
        r = await ev("[...document.querySelectorAll('.chron')].filter(e=>e.querySelector('.role')).map(e=>e.querySelector('.role').textContent+':'+(e.querySelector('.roled')||{}).textContent)")
        check(len(r) == 3 and any('Status' in x for x in r), f"Chronik zeigt Rolle mit Erklärung für gesichtete Geister {r}")
        await ev("G.UI.handler&&G.UI.handler('B')"); await pg.wait_for_timeout(200)

        # ================= Sondergeister: Zähler, Rampe, Stelle, Reset =================
        r = await ev("[0,14,15,16,18,20,30,99].map(n=>+G.rareChance(n).toFixed(4))")
        check(r[0] == r[1] == 0.002 and r[2] == 0.01 and r[5] == 0.05 and r[7] == 0.05 and r[3] < r[4] < r[5], f"Chance: Hauch bis 14, ab 15 steigend, Deckel 5 % {r}")
        r = await ev("[G.RARE_SPAWNS.filter(s=>!(G.NEW21||[]).includes(s.sp)).map(s=>s.zone), G.ZONE_ORDER]")
        check(sorted(r[0]) == sorted(r[1]) and len(r[0]) == 8, f"je Gebiet genau ein Sondergeist (v20: + Aschehang; v21-Neumondhirschkäfer zusätzlich) {r[0]}")
        r = await ev("""(()=>{const out=[], ok=[]; const fs=G.Battle.start; G.Battle.start=o=>{out.push(o); return Promise.resolve();};
          const R=Math.random; G.state.rareCount={};
          G.World.setMap('tiefesmoor',6,30,'down');
          Math.random=()=>0.99; for(let i=0;i<20;i++) G.World.encounter('schilfrand');
          const c20=G.World.rareCount('schilfrand'), rare0=out.filter(o=>o.rare).length;
          Math.random=()=>0.03; G.World.encounter('schilfrand');
          const got=out[out.length-1]; const after=G.World.rareCount('schilfrand');
          G.World.setMap('tiefesmoor',2,28,'down'); G.state.rareCount.schilfrand=25; G.World.encounter('schilfrand'); const edge=out[out.length-1];
          G.state.rareCount.torfstich=3; G.World.setMap('tiefesmoor',6,30,'down'); Math.random=()=>0.99; G.World.encounter('schilfrand');
          Math.random=R; G.Battle.start=fs;
          return {c20, rare0, got:got.rare&&got.team[0].sp, after, edge:!!edge.rare, edgeCount:G.state.rareCount.schilfrand, other:G.state.rareCount.torfstich};})()""")
        check(r['c20'] == 20 and r['rare0'] == 0, f"jeder Wildkampf zählt im Gebiet mit ({r['c20']})")
        check(r['got'] == 'schilfotter' and r['after'] == 0, f"nach ~20 Kämpfen erscheint der Schilfotter mitten im Schilf, Zähler danach 0 ({r['got']}, {r['after']})")
        check(not r['edge'] and r['edgeCount'] == 27 and r['other'] == 3, f"am Schilfrand-Rand kein Sondergeist, Zähler je Gebiet getrennt {r}")
        r = await ev("""(()=>{const m=G.MAPS; const t=(id,x,y,c)=>G.World.rareCond[c](m[id],x,y);
          return [t('hoehle',5,12,'crystal'), t('hoehle',13,8,'crystal'), t('tiefesmoor',6,30,'reeds'), t('tiefesmoor',2,30,'reeds'), t('tiefesmoor',5,15,'bell'), t('tiefesmoor',9,17,'bell'),
                  G.World.tileZone(m.hoehle,5,12), G.World.tileZone(m.tiefesmoor,5,15), G.World.tileZone(m.tiefesmoor,6,30)];})()""")
        check(r[:6] == [True, False, True, False, True, False] and r[6:] == ['hoehle', 'kapelle', 'schilfrand'], f"Stellen: Tropfstein / tiefes Schilf / Glocke {r}")
        r = await ev("""(()=>{G.state.rareCount={hoehle:14}; const a=G.World.rareHintTiles(G.MAPS.hoehle).length; G.state.rareCount.hoehle=15; const b=G.World.rareHintTiles(G.MAPS.hoehle);
          return [a, b.length, b.every(([x,y,sp])=>sp==='glimmerwurm' && G.World.rareCond.crystal(G.MAPS.hoehle,x,y))];})()""")
        check(r[0] == 0 and r[1] >= 3 and r[2], f"Schimmer-Hinweis erst ab 15 Kämpfen, nur an passenden Stellen {r}")
        await ev(SET(m='hoehle', x=5, y=13, d='up', v=6, extra="G.state.rareCount={hoehle:17};"))
        await pg.wait_for_timeout(1200)
        await pg.screenshot(path=SHOTS + '/rare_shimmer_cave.png')
        # Hinweis-Toast beim Erreichen der Schwelle
        r = await ev("""(async()=>{const fs=G.Battle.start; G.Battle.start=o=>Promise.resolve(); G.state.rareCount={hoehle:14}; const R=Math.random; Math.random=()=>0.99; G.World.encounter('hoehle'); Math.random=R; G.Battle.start=fs; return G.World.rareNotice;})()""")
        check(r == 'hoehle', f"beim 15. Kampf wird ein Schimmer-Hinweis vorgemerkt ({r})")
        await ev("G.World.rareNotice=null")

        # ================= Neue Sondergeister im Kampf + Entwicklung =================
        for sp in ['glimmerwurm', 'drusenlindwurm', 'schilfotter', 'wogenotter', 'glockenrabe', 'seelenrabe']:
            ok = await battle('flackerling', ['rempler'], sp, 30, 22)
            if sp in ('drusenlindwurm', 'seelenrabe', 'glockenrabe'): await pg.screenshot(path=SHOTS + f'/battle_{sp}.png')
            check(ok, f"Kampf gegen {sp} läuft")
            await end_battle()
        r = await ev("['glimmerwurm','schilfotter','glockenrabe'].map(k=>[k,G.SPECIES[k].evo,G.SPECIES[G.SPECIES[k].evo.to].rare, G.SPECIES[k].rare])")
        check(all(x[1] and x[2] and x[3] and 20 <= x[1]['lvl'] <= 22 for x in r), f"neue Sondergeister entwickeln sich einmal (Lv 20–22) {r}")
        for sp, lvl, to in [('glimmerwurm', 20, 'drusenlindwurm'), ('glockenrabe', 22, 'seelenrabe')]:
            await ev(SET(team=f"[G.makeMon('{sp}',{lvl})]", v=6))
            asyncio.ensure_future(ev("G.Evo.run(G.state.team[0]).catch(e=>console.error(e))"))
            shot = False
            for i in range(30):
                if await ev("G.mode==='evo'"): break
                await pg.wait_for_timeout(50)
            for i in range(400):
                st = await ev("({k:G.UI.kind, m:G.mode, E:G.Evo.st&&{ring:G.Evo.st.ring, pop:G.Evo.st.pop, white:G.Evo.st.white, n:G.Evo.st.parts.length, show:G.Evo.st.show}, t:(document.getElementById('text')||{}).textContent})")
                if st['m'] != 'evo' and not st['E']: break
                if not shot and st['E'] and st['E']['n'] > 60 and st['k'] != 'say':
                    await pg.screenshot(path=SHOTS + f'/evo_{sp}_glow.png'); shot = True
                if st['E'] and st['E']['ring'] > 0.3 and st['E']['ring'] < 0.7:
                    await pg.screenshot(path=SHOTS + f'/evo_{to}_burst.png')
                if st['k'] == 'say': await pg.keyboard.press("Space")
                elif st['k'] == 'choose': await ev("document.querySelector('#choices .ch')&&document.querySelector('#choices .ch').click()")
                await pg.wait_for_timeout(100)
            r = await ev("[G.state.team[0].sp, G.mode, G.UI.kind, (document.getElementById('text')||{}).textContent]")
            check(r[0] == to, f"{sp} entwickelt sich mit Sonder-Animation zu {to} {r}")

        # ================= Migration v6 =================
        r = await ev("""(()=>{const s={v:5,map:'dorf',player:{x:16,y:7,dir:'down'},team:[{sp:'flackerling',lvl:12,xp:0,hp:5,moves:['rempler','glut','kratzer','funkenflug'],pp:{rempler:1}}],box:[{sp:'kieselgeist',lvl:9,xp:0,hp:40,moves:['rempler'],pp:{}}],items:{},flags:{},seen:{},caught:{},respawn:null,playtime:0};
          const n=G.migrate(s); const m=n.team[0]; const exp=G.makeMon('flackerling',12).moves;
          return [n.v, JSON.stringify(m.moves)===JSON.stringify(exp), m.moves.every(id=>m.pp[id]===G.MOVES[id].pp), m.hp<=G.stats(m).hp, n.box[0].moves.length>1];})()""")
        check(r[0] == 6 and all(r[1:]), f"alter Spielstand (v5) → v6: Attacken neu abgeleitet, AP voll, LP gültig {r}")

        bad = [e for e in errors if 'favicon' not in e and 'AudioContext' not in e]
        check(not bad, f"keine Konsolenfehler {bad[:4]}")
        await b.close()
    print("\n%d Fehler" % len(fails) if fails else "\nALLE v17-TESTS OK")
    sys.exit(1 if fails else 0)
asyncio.run(main())
