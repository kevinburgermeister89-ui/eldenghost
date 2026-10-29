"""v14: neue Starter-Linien & Typ Pflanze, Neutral gegen Stein ½×, Spielstand-Geschenk, begehbare Laternen, Begegnungs-Stinger,
eigene Animation je Attacke, Wirksamkeits-Pop-up (ohne Zeitverlust) & Menü-Hinweis, EP fürs Fangen/Bank-EP, Level-up-Tafel,
Level-Kurve der Wildgebiete, positionsabhängige Umgebung, Lautsprecher-Taste neben START/SELECT."""
import asyncio, sys, json, math, time
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

        # ================= Starter, Typen, Sprites =================
        r = await ev("""[G.STARTERS, G.STARTERS.map(s=>[s,G.SPECIES[s].evo.to,G.SPECIES[G.SPECIES[s].evo.to].evo.to,G.SPECIES[s].evo.lvl,G.SPECIES[G.SPECIES[s].evo.to].evo.lvl])]""")
        lines = {x[0]: x for x in r[1]}
        check(r[0] == ['flackerling', 'pfuetzling', 'blattling'] and lines['flackerling'][1:3] == ['glutwurm', 'seelendrache'] and lines['pfuetzling'][1:3] == ['nebelente', 'mondschwan']
              and lines['blattling'][1:3] == ['hainfee', 'feenlinde'] and all(x[3] == 14 and x[4] == 22 for x in r[1]), f"3 Starter-Linien mit je 3 Stufen, Entwicklung Lv 14 und 22 {r[1]}")
        tri = await ev("[['Feuer','Pflanze'],['Pflanze','Wasser'],['Wasser','Feuer'],['Pflanze','Feuer'],['Wasser','Pflanze'],['Feuer','Wasser'],['Pflanze','Stein'],['Pflanze','Boden'],['Gift','Pflanze'],['Neutral','Stein'],['Neutral','Feuer']].map(([a,d])=>G.eff1(a,d))")
        check(tri == [2, 2, 2, 0.5, 0.5, 0.5, 2, 2, 2, 0.5, 1], f"Dreieck Feuer>Pflanze>Wasser>Feuer (rückwärts ½×), Pflanze stark gg. Stein/Boden, Gift > Pflanze, Neutral gg. Stein ½× {tri}")
        spr = await ev("""['flackerling','glutwurm','seelendrache','pfuetzling','nebelente','mondschwan','blattling','hainfee','feenlinde','kleeling','moorranke'].map(k=>{const s=G.SPR.mon[k]; const w=c=>c.lw||c.width;
          const a=s.at(64,false).toDataURL(), bl=s.at(64,true).toDataURL(); return [k, w(s.img), w(s.back), a!==bl, G.typesOf(k).join('/')];})""")
        check(all(x[1] == 64 and x[2] == 80 and x[3] for x in spr), f"9 Starter-Stufen + 2 wilde Pflanzen-Geister mit Vorder-/Rückansicht und Blinzel-Idle {[(x[0], x[4]) for x in spr]}")
        wildp = await ev("Object.entries(G.WILD_AREAS).filter(([z,a])=>a.table.some(([k])=>G.hasType(k,'Pflanze'))).map(([z])=>z)")
        check('nebelgras' in wildp, f"Früh fangbarer Pflanzen-Geist (Kleeling im Nebelgras) {wildp}")
        fx = await ev("['Pflanze'].map(t=>[!!G.Battle.fx, G.MOVES.blattwirbel.type])")
        check(fx[0][1] == 'Pflanze', "Pflanzen-Attacken vorhanden")

        # ================= Spielstand-Migration: Geschenk-Laternenstein =================
        mig = await ev("""(()=>{const a=G.migrate({v:4,map:'dorf',player:{x:16,y:7,dir:'down'},team:[{sp:'moorlurch',lvl:12,moves:['rempler'],hp:30}],box:[],items:{},flags:{q1:0,story:4},starter:'moorlurch'});
          const b=G.migrate({v:4,map:'dorf',player:{x:16,y:7,dir:'down'},team:[{sp:'schwammling',lvl:9,moves:['rempler'],hp:20}],box:[],items:{},flags:{q1:0,story:4},starter:'schwammling'});
          const c=G.migrate({v:4,map:'dorf',player:{x:16,y:7,dir:'down'},team:[{sp:'irrfackel',lvl:16,moves:['kratzer'],hp:40}],box:[],items:{},flags:{q1:0,story:4},starter:'flackerling'});
          return [a.flags.gift, a.team[0].sp, b.flags.gift, b.team[0].sp, c.team[0].sp, c.flags.gift||null, a.v];})()""")
        check(mig == ['pfuetzling', 'moorlurch', 'blattling', 'schwammling', 'glutwurm', None, 6], f"Alte Starter bleiben; Wasser/Gift bekommen den neuen Starter der Rolle angeboten, Irrfackel -> Glutwurm {mig}")
        await ev(SET(story=4, flags=",gift:'pfuetzling'", x=18, y=8, d='up', team="[G.makeMon('moorlurch',12)]"))
        mk = {x['id']: x['kind'] for x in await ev("G.World.markers('dorf')")}
        await pg.keyboard.press("Space"); await pg.wait_for_timeout(300); await idle(answer='Ja')
        g = await ev("[G.state.team.map(m=>m.sp+':'+m.lvl).join(), G.state.flags.gift]")
        mk2 = {x['id']: x['kind'] for x in await ev("G.World.markers('dorf')")}
        check(mk.get('ilse') == '!' and g == ['moorlurch:12,pfuetzling:10', 1] and 'ilse' not in mk2, f"Ilse bietet den neuen Starter einmalig an (Marker, Lv = stärkster −2), danach weg {mk} {g} {mk2}")

        # ================= Begehbare Laternen =================
        lt = await ev("""(()=>{const out=[]; for (const id of ['dorf','kueste','tiefesmoor']) { const m=G.MAPS[id]; for (let y=0;y<m.h;y++) for (let x=0;x<m.w;x++) { const c=m.tiles[y][x]; if (c==='L'||c==='e') out.push([id,x,y,c,G.World.solidAt(m,x,y)]); } } return out;})()""")
        check(len(lt) > 0 and not any(x[4] for x in lt), f"{len(lt)} Laternen (Strasse + Moor) sind nicht mehr fest")
        L0 = next(x for x in lt if x[0] == 'dorf' and x[3] == 'L')
        # von links heranlaufen und durchgehen
        free = await ev(f"(()=>{{const m=G.MAPS.dorf; for (const dx of [1,-1]) if(!G.World.solidAt(m,{L0[1]}-dx,{L0[2]}) && !G.World.solidAt(m,{L0[1]}+dx,{L0[2]})) return dx; return 0;}})()")
        if free:
            d = 'right' if free == 1 else 'left'; key = 'ArrowRight' if free == 1 else 'ArrowLeft'
            await ev(SET(x=L0[1] - free, y=L0[2], d=d)); await pg.wait_for_timeout(200)
            await pg.keyboard.down(key); await pg.wait_for_timeout(560); await pg.keyboard.up(key); await pg.wait_for_timeout(400)
            px = await ev("G.P.x")
            check(px == L0[1] + free or px == L0[1], f"Spieler läuft durch die Laterne ({L0[1] - free} -> {px})")
        E = next((x for x in lt if x[0] == 'tiefesmoor' and x[3] == 'e'), None)
        if E:
            await ev(SET(m='tiefesmoor', x=E[1], y=E[2], d='down', q1=3)); await pg.wait_for_timeout(200)
            await pg.keyboard.press("Space"); await pg.wait_for_timeout(300); await idle()
            lit = await ev(f"!!G.state.flags['lit_tiefesmoor_{E[1]}_{E[2]}']")
            check(lit, f"Moor-Laterne lässt sich anzünden, während man auf ihr steht ({E[1]},{E[2]})")

        # ================= Begegnungs-Stinger =================
        await ev(SET() + "G.Snd.init(); G.Snd.on=true; G.Snd.history.length=0;")
        asyncio.ensure_future(ev("G.debug.wild('kleeling',4).catch(()=>0)")); await pg.wait_for_timeout(700)
        h = await ev("G.Snd.history.map(x=>x.n)")
        check('enc_wild' in h and 'encounter' not in h, f"Wilde Begegnung: eigener Stinger beim Übergang {h[:6]}")
        await to_menu(); await end_battle()
        await ev(SET() + "G.Snd.history.length=0;")
        asyncio.ensure_future(ev("G.Battle.start({team:[G.makeMon('laternchen',5)], trainer:'fenn'}).catch(()=>0)")); await pg.wait_for_timeout(700)
        h2 = await ev("G.Snd.history.map(x=>x.n)")
        await to_menu(); await end_battle()
        await ev(SET() + "G.Snd.history.length=0;")
        asyncio.ensure_future(ev("G.Battle.start({team:[G.makeMon('nebelahn',16)], trainer:'nebelahn'}).catch(()=>0)")); await pg.wait_for_timeout(700)
        h3 = await ev("G.Snd.history.map(x=>x.n)")
        await to_menu(); await end_battle()
        check('enc_trainer' in h2 and 'enc_boss' in h3, f"Beschwörer- und Boss-Stinger sind eigene Varianten {h2[:3]} {h3[:3]}")
        await ev("G.Snd.toggle(); G.Snd.history.length=0;")
        await ev(SET()); asyncio.ensure_future(ev("G.debug.wild('kleeling',4).catch(()=>0)")); await pg.wait_for_timeout(700)
        h4 = await ev("G.Snd.history.filter(x=>x.n==='enc_wild').map(x=>x.played)")
        await to_menu(); await end_battle(); await ev("G.Snd.toggle()")
        check(h4 == [False], f"Stinger respektiert den Ton-Schalter (aus = nicht gespielt) {h4}")

        # ================= Wirksamkeit: Pop-up im Einschlag, keine Extra-Zeit =================
        async def one_turn(ally, moves, enemy):
            await battle(ally, moves, enemy, lvl=13, elvl=8, extra="G.debugNoCrit=true; G.debugHit=true;")
            await ev("G.Battle.lastPop=null; G.B.enemy.moves=['starren']; G.fillPP(G.B.enemy); G.B.enemy.hp=999;")
            await click('Kampf'); await pg.wait_for_timeout(150)
            hint = await ev("[...document.querySelectorAll('#choices .ch')].map(e=>e.innerText).join('|')")
            t0 = time.time(); await click(G_MOVE_NAMES[moves[0]])
            texts = []; last = None
            while time.time() - t0 < 15:
                st = await ev("({k:G.UI.kind, t:document.getElementById('text').textContent})")
                if st['k'] == 'say' and st['t']:
                    if st['t'] != last: last = st['t']; texts.append(st['t'])
                    if 'setzt Starren' in st['t']: break
                    await pg.keyboard.press("Space")
                await pg.wait_for_timeout(30)
            dt = time.time() - t0; pop = await ev("G.Battle.lastPop")
            await end_battle()
            fin = [t for i, t in enumerate(texts) if not (i + 1 < len(texts) and texts[i + 1].startswith(t))]   # Tipp-Zwischenstände weg
            return dt, [t for t in fin if 'setzt Starren' not in t], pop, hint
        G_MOVE_NAMES = await ev("Object.fromEntries(Object.entries(G.MOVES).map(([k,m])=>[k,m.name]))")
        se = await one_turn('pfuetzling', ['wasserstrahl'], 'flackerling')
        ne = await one_turn('pfuetzling', ['wasserstrahl'], 'nebelkauz')
        nv = await one_turn('pfuetzling', ['wasserstrahl'], 'blattling')
        im = await one_turn('flackerling', ['funkenflug'], 'torfwicht') if await ev("G.eff('Elektro','torfwicht')") == 0 else None
        st_ = await one_turn('flackerling', ['kratzer'], 'kieselgeist')
        print("   Zugdauer s: sehr effektiv %.2f, neutral %.2f, schwach %.2f" % (se[0], ne[0], nv[0]), se[1], ne[1])
        check(se[2] and se[2]['cls'] == 'se' and 'Sehr effektiv' in se[2]['text'], f"Sehr effektiv: Pop-up am Ziel {se[2]}")
        check(nv[2] and nv[2]['cls'] == 'nv' and ne[2] is None, f"Nicht sehr effektiv: Pop-up; neutraler Treffer: kein Pop-up {nv[2]} {ne[2]}")
        check(im is None or (im[2] and im[2]['cls'] == 'im' and 'keine Wirkung' in im[2]['text']), f"Keine Wirkung: Pop-up {im and im[2]}")
        check(st_[2] and st_[2]['cls'] == 'nv', f"Neutral gegen Stein (½×): «Nicht sehr effektiv»-Pop-up {st_[2]}")
        check(len(se[1]) == len(ne[1]) and not any('wirksam' in t or 'effektiv' in t for t in se[1] + nv[1]), f"Kein zusätzlicher Textschritt (je {len(se[1])} Texte) {se[1]}")
        check(abs(se[0] - ne[0]) < 0.35, f"Zugdauer mit sehr effektivem Treffer = neutral (±0.35 s): {se[0]:.2f} vs {ne[0]:.2f}")
        check('▲' in se[3] and '▼' in nv[3] and '▲' not in ne[3] and '▼' not in ne[3], f"Menü-Hinweis ▲ stark / ▼ schwach / nichts bei 1× {se[3]} | {nv[3]} | {ne[3]}")

        # ================= EP: Fangen = Besiegen, Bank 65 %, erschöpft 0 =================
        sh = await ev("G.xpShares([{hp:10},{hp:5},{hp:0},{hp:3}], new Set([0]), 100)")
        check(sh == [100, 65, 0, 65], f"EP-Anteile: Teilnehmer 100 %, Bank 65 %, erschöpft 0 {sh}")
        check(await ev("G.xpShares([{hp:1},{hp:1}], new Set([0]), 1)") == [1, 1], "Bank-EP mindestens 1")
        async def xp_after(catch):
            team = "[(()=>{const m=G.makeMon('pfuetzling',12); m.moves=['rempler']; G.fillPP(m); return m;})(), G.makeMon('kleeling',9)]"
            await ev(SET(team=team, extra="G.debugNoCrit=true; G.debugHit=true; G.debugCatch=true;"))
            x0 = await ev("G.state.team.map(m=>m.xp)")
            asyncio.ensure_future(ev("G.debug.wild('schattenmotte',6).catch(()=>0)")); await to_menu()
            if catch:
                await click('Tasche'); await pg.wait_for_timeout(200); await click('Seelenfänger')
            else:
                await ev("G.B.enemy.hp=1"); await click('Kampf'); await pg.wait_for_timeout(150); await click('Rempler')
            await idle(timeout=25000)
            x1 = await ev("G.state.team.map(m=>m.xp)")
            return [x1[i] - x0[i] for i in range(2)]
        xc = await xp_after(True); xd = await xp_after(False)
        check(xc == xd and xc[0] > 0 and xc[1] == max(1, xc[0] * 65 // 100), f"EP nach Fang == EP nach Sieg (Teilnehmer / Bank 65 %) {xc} {xd}")

        # ================= Level-up: Jingle, Banner, Werte-Tafel =================
        team = "[(()=>{const m=G.makeMon('pfuetzling',12); m.xp=G.xpFor(13)-1; m.moves=['rempler']; G.fillPP(m); return m;})()]"
        await ev(SET(team=team, extra="G.debugNoCrit=true; G.debugHit=true; G.Snd.on=true;"))
        asyncio.ensure_future(ev("G.debug.wild('schattenmotte',6).catch(()=>0)")); await to_menu()
        await ev("G.B.enemy.hp=1; G.Snd.history.length=0;"); await click('Kampf'); await pg.wait_for_timeout(150); await click('Rempler')
        seen = None
        for _ in range(300):
            st = await ev("({k:G.UI.kind, t:document.getElementById('text').textContent, lv:(document.getElementById('lvlup')||{}).className, html:(document.getElementById('lvlup')||{}).innerText||''})")
            if 'Level 13' in st['t'] and st['lv'] == 'show': seen = st; break
            if st['k'] == 'say' and 'erreicht Level' not in st['t']: await pg.keyboard.press("Space")
            await pg.wait_for_timeout(50)
        h = await ev("G.Snd.history.map(x=>x.n)"); lu = await ev("G.Battle.lastLevelUp")
        check(seen is not None and 'Level 13!' in seen['html'] and 'KP' in seen['html'] and '→' in seen['html'], f"Level-up: Banner «Level 13!» und Werte-Tafel alt → neu {seen and seen['html'][:80]}")
        check('jingle:levelup' in h and lu and lu['lvl'] == 13 and all(r[2] >= r[1] for r in lu['rows']), f"Level-up-Jingle gespielt, Werte steigen {lu and lu['rows']}")
        await idle(timeout=20000)
        check(await ev("(document.getElementById('lvlup')||{className:'hidden'}).className") == 'hidden', "Tafel verschwindet nach dem Text (A überspringt)")

        # ================= Level-Kurve der Wildgebiete =================
        zc = await ev("G.ZONE_ORDER.map(z=>[z, G.WILD_AREAS[z].lvl[0], G.WILD_AREAS[z].lvl[1]])")
        mono = all(zc[i][1] <= zc[i + 1][1] and zc[i][2] <= zc[i + 1][2] for i in range(len(zc) - 1))
        check(mono and len(zc) >= 5 and set(z for z, _, _ in zc) == set(await ev("Object.keys(G.WILD_AREAS)")), f"Wild-Level steigen entlang der Geschichte monoton {zc}")
        kl = await ev("""(()=>{G.state.team=[G.makeMon('flackerling',7)]; G.debug.wild=G.debug.wild; const r=[]; const o=G.pickWeighted; G.pickWeighted=()=> 'kieselgeist'; const S=G.Battle.start; let lv=[]; G.Battle.start=o2=>{lv.push(o2.team[0].lvl); return Promise.resolve('fled');};
          for(let i=0;i<40;i++) G.World.encounter('nebelgras'); G.Battle.start=S; G.pickWeighted=o; return [Math.max(...lv), Math.min(...lv)];})()""")
        check(kl[0] <= 4, f"Früher Stein-Geist (Kieselgeist) höchstens 3 Level unter dem Team -> mit Neutral-Attacken schlagbar {kl}")

        # ================= Eigene Animation je Attacke =================
        mv = await ev("[Object.keys(G.MOVES).length, Object.keys(G.MOVES).filter(k=>!G.Battle.MOVE_FX[k]), Object.values(G.Battle.MOVE_FX).every(f=>f.ms>0 && f.ms<=3000), new Set(Object.values(G.Battle.MOVE_FX).map(f=>f.fn.toString())).size, Object.keys(G.Battle.MOVE_FX).length]")
        check(not mv[1] and mv[2] and mv[3] == mv[4] == mv[0], f"Alle {mv[0]} Attacken haben eine eigene Animation (eigene Funktion, ≤ 3000 ms) fehlend={mv[1]}")
        await battle('pfuetzling', ['wasserstrahl'], 'kleeling')
        dur = await ev("""(async()=>{const out=[];for(const [id,f] of Object.entries(G.Battle.MOVE_FX)){const t0=performance.now();await f.fn('ally','enemy');out.push([id,Math.round(performance.now()-t0),f.ms]); G.B.aa.dx=G.B.aa.dy=G.B.ea.dx=G.B.ea.dy=0;} return out;})()""")
        over = [d for d in dur if d[1] > min(3000, d[2] + 120)]
        check(not over and max(d[1] for d in dur) <= 3000, f"Gemessene Dauer je Attacke ≤ geplant und ≤ 3 s (max {max(d[1] for d in dur)} ms) {over[:4]}")
        await end_battle()

        # ================= Positionsabhängige Umgebung =================
        amb = await ev("""(()=>{const m=G.MAPS.kueste; let near=null, far=null; for(let y=0;y<m.h;y++) for(let x=0;x<m.w;x++){ if(G.World.solidAt(m,x,y)) continue; const a=G.World.ambAt('kueste',x,y);
          if(!near||a.water>near[2]) near=[x,y,a.water]; if(!far||a.water<far[2]) far=[x,y,a.water]; }
          const d=G.MAPS.dorf; let dn=null; for(let y=0;y<d.h;y++) for(let x=0;x<d.w;x++){ if(G.World.solidAt(d,x,y)) continue; const a=G.World.ambAt('dorf',x,y); if(!dn||a.water<dn[2]) dn=[x,y,a.water]; }
          const ho=G.World.ambAt('home',6,2), sm=G.World.ambAt('schmiede',3,3); return {near, far, dn, hearth:[ho.hearth, sm.hearth, G.World.ambAt('huette',3,3).hearth], wind:[G.World.ambAt('kueste',near[0],near[1]).wind, G.World.ambAt('home',6,2).wind]};})()""")
        check(amb['near'][2] > 0.8 and amb['far'][2] < 0.02, f"Wasser-Pegel: am Wasser hoch, fern ≈ 0 {amb['near']} {amb['far']}")
        check(amb['hearth'][0] > 0.1 and amb['hearth'][1] > 0.1 and amb['hearth'][2] == 0 and amb['wind'][0] > 0.3 and amb['wind'][1] == 0, f"Ofen-Knistern drinnen nahe am Feuer, Wind draussen (Küste) {amb['hearth']} {amb['wind']}")
        nx, ny = amb['near'][0], amb['near'][1]; fx_, fy_ = amb['far'][0], amb['far'][1]
        await ev(SET(m='kueste', x=nx, y=ny, story=6) + "G.Snd.init(); G.Snd.on=true;"); await pg.wait_for_timeout(1600)
        g1 = await ev("G.Snd.ambLevel.water")
        await ev(f"G.World.setMap('kueste',{fx_},{fy_},'down')"); await pg.wait_for_timeout(1600)
        g2 = await ev("G.Snd.ambLevel.water"); gnode = await ev("G.Snd.amb ? G.Snd.amb.wa.g.gain.value : -1")
        check(g1 > 0.1 and g2 < 0.005 and gnode < 0.02, f"Wasser-Umgebung im Spiel: Gain nah {g1:.3f} > fern {g2:.4f} (Knoten {gnode:.4f})")

        # ================= Lautsprecher-Taste =================
        await ev(SET(x=3, y=18, d='right'))
        await pg.wait_for_timeout(200)
        boxes = await ev("""(()=>{const r=id=>{const b=document.getElementById(id).getBoundingClientRect(); return [b.left,b.top,b.right,b.bottom];}; return {snd:r('btn-snd'), dp:r('dpad'), a:r('btn-a'), b:r('btn-b'), sel:r('btn-select'), st:r('btn-start')};})()""")
        def inter(a, b, pad=0): return not (a[2] <= b[0] - pad or a[0] >= b[2] + pad or a[3] <= b[1] - pad or a[1] >= b[3] + pad)
        s_ = boxes['snd']
        check(s_[2] - s_[0] >= 44 and not inter(s_, boxes['dp'], 28) and not any(inter(s_, boxes[k], 4) for k in ('a', 'b', 'sel', 'st')), f"Lautsprecher-Taste ≥ 44 px, ohne Überlappung mit Steuerkreuz (+28 px Trefferzone), A/B, SELECT/START {boxes}")
        lay = await ev("""(()=>{const ids=['dpad','btn-a','btn-b','btn-select','btn-start'], g=()=>ids.map(i=>{const b=document.getElementById(i).getBoundingClientRect(); return [Math.round(b.left),Math.round(b.top)].join(',');}).join(' ');
          const e=document.getElementById('btn-snd'), a=g(); e.style.display='none'; const b=g(); e.style.display=''; return [a,b];})()""")
        check(lay[0] == lay[1], f"Keine Verschiebung der bestehenden Tasten {lay}")
        on0 = await ev("G.Snd.on")
        dcx, dcy = (boxes['dp'][0] + boxes['dp'][2]) / 2, (boxes['dp'][1] + boxes['dp'][3]) / 2
        scx, scy = (s_[0] + s_[2]) / 2, (s_[1] + s_[3]) / 2
        x0 = await ev("G.P.x")
        await touch("touchStart", [(dcx + 40, dcy)])
        for i in range(1, 13):
            q = i / 12; await touch("touchMove", [(dcx + 40 + (scx - dcx - 40) * q, dcy + (scy - dcy) * q)]); await pg.wait_for_timeout(40)
        await pg.wait_for_timeout(300); mv_ = await ev("[G.P.x, G.P.moving, G.Input.held.slice()]")
        await touch("touchEnd", []); await pg.wait_for_timeout(300)
        on1 = await ev("G.Snd.on")
        check(on1 == on0 and (mv_[0] > x0 or mv_[1]) and len(mv_[2]) == 1, f"Steuerkreuz-Wischen über die Lautsprecher-Taste: kein Umschalten, Bewegung läuft weiter {mv_} {on0}->{on1}")
        await touch("touchStart", [(scx, scy)]); await touch("touchEnd", []); await pg.wait_for_timeout(200)
        t1 = await ev("[G.Snd.on, document.getElementById('btn-snd').classList.contains('on'), document.getElementById('snd-state').textContent]")
        await touch("touchStart", [(scx, scy)]); await touch("touchEnd", []); await pg.wait_for_timeout(200)
        t2 = await ev("[G.Snd.on, document.getElementById('btn-snd').classList.contains('on'), document.getElementById('snd-state').textContent]")
        check(t1[0] == (not on0) and t1[1] == t1[0] and t2[0] == on0 and t2[1] == t2[0] and ('✕' in t1[2]) == (not t1[0]), f"Tippen schaltet Ton um, Symbol und SELECT-Anzeige folgen {t1} {t2}")
        await pg.keyboard.press("ShiftLeft"); await pg.wait_for_timeout(150)
        t3 = await ev("[G.Snd.on, document.getElementById('btn-snd').classList.contains('on')]")
        await pg.keyboard.press("ShiftLeft")
        check(t3[0] == (not on0) and t3[1] == t3[0], f"SELECT hält die Lautsprecher-Taste synchron {t3}")
        await touch("touchStart", [(scx, scy)]); await touch("touchMove", [(scx - 120, scy - 60)]); await touch("touchEnd", []); await pg.wait_for_timeout(200)
        check(await ev("G.Snd.on") == on0, "Wegwischen von der Taste löst nicht aus (nur bewusstes Tippen)")

        # ================= Ton standardmässig an, einmalige Rücksetzung =================
        p2 = await ctx.new_page(); p2.on("pageerror", lambda e: errors.append(str(e)))
        await p2.goto(URL); await p2.evaluate("localStorage.clear()"); await p2.reload(); await p2.wait_for_timeout(1200)
        fresh = await p2.evaluate("[G.Snd.on, localStorage.getItem('eldenghost.soundReset')]")
        await p2.evaluate("localStorage.setItem('eldenghost.sound','0'); localStorage.removeItem('eldenghost.soundReset')"); await p2.reload(); await p2.wait_for_timeout(1200)
        reset = await p2.evaluate("[G.Snd.on, localStorage.getItem('eldenghost.sound'), localStorage.getItem('eldenghost.soundReset')]")
        await p2.evaluate("G.Snd.init(); G.Snd.toggle()"); await p2.reload(); await p2.wait_for_timeout(1200)
        later = await p2.evaluate("[G.Snd.on, localStorage.getItem('eldenghost.sound'), document.getElementById('btn-snd').classList.contains('on')]")
        await p2.evaluate("G.Snd.init(); G.Snd.toggle()"); await p2.close()
        check(fresh[0] is True, f"Neuinstallation: Ton an {fresh}")
        check(reset == [True, '1', '14'], f"v14-Update setzt gespeichertes «Ton aus» einmalig auf an {reset}")
        check(later == [False, '0', False], f"Danach bleibt die eigene Wahl (aus) über Neustarts erhalten {later}")
        errs = [e for e in errors if 'Canvas2D' not in e]
        check(not errs, f"0 Konsolenfehler/-warnungen {errs[:4]}")
        await b.close()
    print("FAILS:", len(fails))
    sys.exit(1 if fails else 0)
asyncio.run(main())
