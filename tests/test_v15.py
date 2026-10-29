"""v15: Hafenkapelle entfernt, Starter nie wild, 15 neue Tier-/Naturgeister, Gebietstabellen, seltene Umgebungs-Ereignisse, Streicher-Musik, schwarzes Haar."""
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


        # ================= Hafenkapelle entfernt, Stufen-Schalter =================
        r = await ev("[!!G.MAPS.kapelle, Object.values(G.MAPS.kueste.warps).map(w=>w.to), Object.keys(G.CHURCHES||{}), G.FEAT]")
        check(not r[0] and 'kapelle' not in r[1] and r[2] == ['kirche'], f"Hafenkapelle (Bruder Tamme) entfernt, einzige Kirche = Mondkirche {r[1]} {r[2]}")
        check(r[3]['rare'] is True, f"v17-Sondergeister jetzt an (Höhle/Legende/Katzenhaus seit v16 an) {r[3]}")
        # ================= Abschied & Musik =================
        # ================= Starter nie wild =================
        r = await ev("""(()=>{const lines=new Set(); for(const s of G.STARTERS){let k=s; while(k){lines.add(k); k=G.SPECIES[k].evo&&G.SPECIES[k].evo.to;}}
          return Object.entries(G.WILD_AREAS).map(([z,a])=>[z,a.table.map(t=>t[0]).filter(k=>lines.has(k))]).filter(x=>x[1].length);})()""")
        check(r == [], f"Keine Starter-Linie (alle Stufen) in einer Wild-Tabelle {r}")
        # ================= 15 neue Tier-/Naturgeister =================
        r = await ev("""G.NEW15.map(k=>{const s=G.SPECIES[k], b=s.base, w=c=>c.lw||c.width, spr=G.SPR.mon[k];
          const tot=b.hp+b.atk+b.def+b.spd; return [k, G.typesOf(k), tot, Math.min(b.hp,b.atk,b.def,b.spd), Math.max(b.hp,b.atk,b.def,b.spd), !!s.desc && s.desc.length>20,
          w(spr.img), w(spr.back), G.SPECIES_ORDER.indexOf(k), s.learn.filter(([l,m])=>l<G.TYPE_MOVE_LVL && G.MOVES[m].type!=='Neutral').length];})""")
        check(len(r) == 15, f"15 neue Geister {[x[0] for x in r]}")
        types = set(t for x in r for t in x[1])
        check(len(types) >= 9, f"Alle 9 Typen vertreten {sorted(types)}")
        check(all(x[6] == 64 and x[7] == 80 for x in r), "Jeder neue Geist hat Vorder- und Rückansicht")
        check(all(x[5] for x in r), "Chronik-Eintrag (Beschreibung) für jeden neuen Geist")
        check(all(150 <= x[2] <= 330 and x[3] >= 0.7 * x[2] / 4 and x[4] <= 1.35 * x[2] / 4 for x in r), f"Werte sinnvoll (Summe 150–330, jeder Wert 70–135 % des Mittels) {[(x[0], x[2]) for x in r]}")
        check(all(x[9] == 0 for x in r), "Lv-8-Regel: vor Lv 8 nur Neutral-Attacken")
        old = await ev("G.SPECIES_ORDER.indexOf('moderhut')")
        check(all(x[8] > old for x in r), f"Chronik-Nummern setzen nach den bisherigen Geistern fort {[x[8] + 1 for x in r]}")
        r = await ev("""(()=>{const wild=new Set(Object.values(G.WILD_AREAS).flatMap(a=>a.table.map(t=>t[0])));
          return G.NEW15.filter(k=>!wild.has(k) && !Object.values(G.SPECIES).some(s=>s.evo&&s.evo.to===k&&wild.has(Object.keys(G.SPECIES).find(q=>G.SPECIES[q]===s))));})()""")
        check(r == [], f"Jeder neue Geist ist wild fangbar oder entwickelt sich aus einem fangbaren {r}")
        r = await ev("""(()=>{const all={}; for(const s in G.SPECIES) for(const [,m] of G.SPECIES[s].learn) (all[m]=all[m]||new Set()).add(s);
          return G.NEW15.map(k=>[k, G.SPECIES[k].learn.map(l=>l[1]).filter(m=>[...all[m]].every(s=>G.NEW15.includes(s)||G.RARE.includes(s))), ]).map(([k,ms])=>[k,ms,ms.every(m=>!!G.Battle.MOVE_FX[m])]);})()""")
        check(all(x[1] and x[2] for x in r), f"Jede neue Linie hat eine eigene Attacke mit eigener Animation {[(x[0], x[1]) for x in r]}")
        fns = await ev("(()=>{const ids=[...new Set(G.NEW15.flatMap(k=>G.SPECIES[k].learn.map(l=>l[1])))].filter(m=>G.Battle.MOVE_FX[m]); return [ids.length, new Set(ids.map(m=>G.Battle.MOVE_FX[m].fn.toString())).size];})()")
        check(fns[0] == fns[1], f"Animationen der Attacken sind unterschiedlich {fns}")
        durs = await ev("[...new Set(G.NEW15.flatMap(k=>G.SPECIES[k].learn.map(l=>l[1])))].filter(m=>G.Battle.MOVE_FX[m]).map(m=>[m,G.Battle.MOVE_FX[m].ms])")
        check(all(0 < d <= 3000 for _, d in durs), f"Attacken-Animationen ≤ 3 s (geplant, gemessen in test_v14) {durs}")
        # ================= Gebietstabellen =================
        r = await ev("Object.entries(G.WILD_AREAS).map(([z,a])=>[z,a.table.map(t=>t[0]),a.table.map(t=>t[1]),a.rare])")
        check(all(4 <= len(x[1]) <= 9 for x in r), f"Jedes Gebiet 4–9 Arten (v19: leicht vergrösserte Tabellen; v21: + Drache/Dunkel) {[(x[0], len(x[1])) for x in r]}")
        sets = [frozenset(x[1]) for x in r]
        check(len(set(sets)) == len(sets), "Alle Gebietstabellen unterscheiden sich")
        common = set.intersection(*[set(s) for s in sets])
        check(not common, f"Keine Art kommt in allen Gebieten vor {common}")
        check(all(x[3] in x[1] and x[2][x[1].index(x[3])] <= 8 for x in r), f"Jedes Gebiet hat einen seltenen Geist (Gewicht ≤ 8) {[(x[0], x[3]) for x in r]}")
        mx = max(sum(1 for s in sets if k in s) for k in set().union(*sets))
        check(mx <= 3, f"Wenig Überschneidung: keine Art in mehr als 3 Gebieten ({mx})")
        # ================= Seltene Umgebungs-Ereignisse =================
        r = await ev("""(()=>{const A=G.World.ambient; const out={};
          const ctxs={dorf:{map:'dorf',theme:'village',kind:'outdoor',dusk:0,fog:0,water:true}, moor:{map:'moor',theme:'moor',kind:'outdoor',dusk:0.7,fog:0,water:false},
            home:{map:'home',kind:'indoor',dusk:1,fog:0,water:false}, dusk:{map:'kueste',theme:'coast',kind:'outdoor',dusk:0.8,fog:0.05,water:true}};
          for(const [n,c] of Object.entries(ctxs)){A.reset(); const ev=[]; let seed=n.length*7+1; const rnd=()=>{seed=(seed*16807)%2147483647; return seed/2147483647;};
            for(let t=0;t<3600;t+=0.25){const k=A.ambTick(t,c,rnd); if(k){ev.push([k,t]); A.AMB.cur=null;}}
            const gapAny=Math.min(...ev.slice(1).map((e,i)=>e[1]-ev[i][1])), per={}; for(const [k,t] of ev) (per[k]=per[k]||[]).push(t);
            const gapSame=Math.min(...Object.values(per).flatMap(ts=>ts.slice(1).map((t,i)=>t-ts[i])));
            out[n]={n:ev.length, kinds:Object.keys(per).sort(), gapAny, gapSame, first:ev.length?ev[0][1]:null};}
          A.reset(); return [out, A.ambKinds({map:'hoehle',theme:'cave',kind:'outdoor',dusk:1,fog:0,water:true}), A.ambKinds({map:'dorf',theme:'village',kind:'outdoor',dusk:0,fog:0.3,water:false})];})()""")
        out = r[0]
        check(out['home']['n'] == 0 and r[1] == [], f"Keine Ereignisse in Innenräumen/Höhle {out['home']} {r[1]}")
        check(all(o['gapSame'] >= 60 and o['gapAny'] >= 75 for k, o in out.items() if o['n'] > 1), f"Abklingzeit: gleiche Art ≥ 60 s, beliebige ≥ 75 s {[(k, o['gapSame'], o['gapAny']) for k, o in out.items()]}")
        check(all(o['n'] <= 36 for o in out.values()) and out['dorf']['n'] >= 5 and (out['dorf']['first'] or 0) >= 20, f"Selten, aber vorhanden (pro Stunde) {[(k, o['n'], o['first']) for k, o in out.items()]}")
        check('leaves' in out['dorf']['kinds'] and 'fluff' in out['moor']['kinds'] and 'fluff' not in out['dorf']['kinds'] and 'star' not in out['dorf']['kinds'] and 'star' in out['dusk']['kinds'],
              f"Kontext: Blätter im Dorf, Schilfflaum im Moor, Sternschnuppe nur in klarer Dämmerung {[(k, o['kinds']) for k, o in out.items()]}")
        check('star' not in r[2], "Keine Sternschnuppe bei Nebel/Tag")
        await ev(SET(m='dorf', x=16, y=12))
        for k in ['leaves', 'crows', 'fish', 'star']:
            await ev(f"G.World.ambient.reset(); G.World.ambient.force('{k}')"); await pg.wait_for_timeout(900)
            await pg.screenshot(path=f'/workspace/shots_v15/amb_{k}.png')
        # ================= Musik: in v16 zurück zu den v14-Stücken (Spieluhr/Glocken/Zupf/Orgel) =================
        tr = await ev("Object.entries(G.Snd.TRACKS).map(([k,d])=>[k,d.lead])")
        check(all(x[1] in ('box', 'bell', 'pluck', 'choir') for x in tr) and len(tr) >= 7, f"Alle Stücke im v14-Stil {tr}")
        pv = await ev("Promise.all(['ambient','battle'].map(n=>G.Snd.renderPreview(n,12).then(r=>({n:r.name,peak:r.peakDb,rms:r.rmsDb,clip:r.clip,silent:r.silentSec}))))")
        check(all(x['clip'] == 0 and x['silent'] == 0 and x['peak'] < -0.5 for x in pv), f"Vorschau ohne Clipping/Stille {pv}")
        # ================= Spielerfigur: schwarzes Haar =================
        await ev(SET(m='dorf', x=16, y=12, d='down')); await pg.wait_for_timeout(500)
        await pg.screenshot(path='/workspace/shots_v15/player.png')
        check(not errors, f"Keine Konsolenfehler {errors[:5]}")
        await b.close()
    print("\nFAILS:", len(fails)); [print(" -", f) for f in fails]
    sys.exit(1 if fails else 0)
asyncio.run(main())
