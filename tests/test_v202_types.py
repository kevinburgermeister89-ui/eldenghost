"""v20.2: Typentabelle = offizielles Vorbild (Gen. 6+) für die 11 Typen; Wirkung im echten Kampf (Schaden bis 4×/¼×/0×, Meldungen,
Gegner-KI, Menü-Hinweis) und Einfluss der Werte (Angriff/Verteidigung/Initiative, Rollen)."""
import sys, json, asyncio
from playwright.async_api import async_playwright
URL = sys.argv[1] if len(sys.argv) > 1 else "http://localhost:8080/index.html?touch=1"
OFF = {"Feuer": {"Drache": .5, "Pflanze": 2, "Käfer": 2, "Feuer": .5, "Wasser": .5, "Stein": .5},
       "Wasser": {"Drache": .5, "Feuer": 2, "Boden": 2, "Stein": 2, "Wasser": .5, "Pflanze": .5},
       "Pflanze": {"Drache": .5, "Wasser": 2, "Boden": 2, "Stein": 2, "Feuer": .5, "Pflanze": .5, "Gift": .5, "Käfer": .5},
       "Elektro": {"Drache": .5, "Wasser": 2, "Elektro": .5, "Pflanze": .5, "Boden": 0},
       "Stein": {"Feuer": 2, "Käfer": 2, "Kampf": .5, "Boden": .5},
       "Psycho": {"Dunkel": .5, "Kampf": 2, "Gift": 2, "Psycho": .5},
       "Boden": {"Feuer": 2, "Elektro": 2, "Gift": 2, "Stein": 2, "Pflanze": .5, "Käfer": .5},
       "Gift": {"Pflanze": 2, "Gift": .5, "Boden": .5, "Stein": .5},
       "Kampf": {"Dunkel": 2, "Normal": 2, "Stein": 2, "Gift": .5, "Psycho": .5, "Käfer": .5},
       "Käfer": {"Dunkel": 2, "Pflanze": 2, "Psycho": 2, "Feuer": .5, "Kampf": .5, "Gift": .5},
       "Normal": {"Stein": .5},
       "Drache": {"Drache": 2}, "Dunkel": {"Psycho": 2, "Kampf": .5, "Dunkel": .5}}  # v21; Psycho→Dunkel bewusst ½× statt 0×
SET = ("G.demo=true; G.state={v:6,map:'dorf',player:{x:16,y:7,dir:'down'},team:[TEAM],box:[],items:{laterne:0},flags:{q1:1,story:4,tour:1},seen:{},caught:{},respawn:null,playtime:0,money:150};"
       "G.UI.title(false); G.UI.kind=null; G.UI.handler=null; document.getElementById('choices').className='hidden'; G.mode='world'; G.lock=0; G.debugEncounterRate=1e-9; G.debugNoCrit=true; G.World.setMap('dorf',16,7,'down');")
fails, errors = [], []
def check(c, msg):
    print(("OK " if c else "FAIL") + "  " + msg, flush=True)
    if not c: fails.append(msg)
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(executable_path='/usr/bin/google-chrome')
        ctx = await b.new_context(viewport={"width": 390, "height": 844}, device_scale_factor=2, is_mobile=True, has_touch=True)
        pg = await ctx.new_page(); ev = pg.evaluate
        pg.on("pageerror", lambda e: errors.append(str(e)))
        await pg.goto(URL); await pg.wait_for_timeout(2000)
        # ---------- 1) Tabelle exakt wie das Vorbild ----------
        T = await ev("G.TYPES")
        got = await ev("Object.fromEntries(G.TYPES.map(a=>[a,Object.fromEntries(G.TYPES.map(d=>[d,G.eff1(a,d)]))]))")
        bad = [(a, d, got[a][d], OFF.get(a, {}).get(d, 1)) for a in T for d in T if got[a][d] != OFF.get(a, {}).get(d, 1)]
        check(len(T) == 13 and not bad, f"alle 169 Paare (v21: 13 Typen) = offizielle Tabelle (Gen. 6+) {bad[:6]}")
        check(got['Feuer']['Psycho'] == 1 and got['Feuer']['Gift'] == 1 and got['Elektro']['Psycho'] == 1 and got['Gift']['Wasser'] == 1 and got['Stein']['Elektro'] == 1, "Feuer nicht stark gegen Psycho/Gift, Elektro nicht gegen Psycho, Gift nicht gegen Wasser, Stein nicht gegen Elektro")
        imm = [(a, d) for a in T for d in T if got[a][d] == 0]
        check(imm == [('Elektro', 'Boden')], f"einzige Immunität unter diesen Typen: Elektro → Boden {imm}")
        nz = await ev("G.TYPES.map(d=>G.eff1('Neutral',d))")
        check(nz == [0.5 if t == 'Stein' else 1 for t in T], "Neutral (typenlos): 1×, nur gegen Stein ½×")
        dual = await ev("(()=>{const sp=Object.keys(G.SPECIES).filter(k=>G.SPR&&G.SPR.mon&&G.SPR.mon[k]); const o={}; for (const f of [4,2,1,0.5,0.25,0]) for (const t of G.TYPES) { const k=sp.find(k=>G.eff(t,k)===f && (f!==4&&f!==0.25 || G.typesOf(k).length===2)); if (k && !o[f]) o[f]=[t,k,G.typesOf(k)]; } return o;})()")
        print("   Fälle:", dual)
        check(all(str(k) in dual for k in [4, 2, 1, 0.5, 0.25, 0]), "Doppeltypen multiplizieren: Fälle für 4×, 2×, 1×, ½×, ¼× und 0× vorhanden")
        # ---------- 2) im echten Kampf ----------
        async def to_menu():
            for _ in range(400):
                st = await ev("({k:G.UI.kind, ch:[...document.querySelectorAll('#choices .ch')].map(e=>e.textContent.trim())})")
                if st['k'] == 'choose' and 'Kampf' in st['ch']: return True
                if st['k'] == 'say': await pg.keyboard.press("Space")
                await pg.wait_for_timeout(50)
            return False
        async def end_battle():
            await ev("if (G.B) { G.B.enemy.hp = 0; }")
            for _ in range(300):
                if await ev("G.mode==='world' && !G.B && G.lock===0"): break
                st = await ev("G.UI.kind")
                if st == 'say': await pg.keyboard.press("Space")
                elif st == 'choose': await ev("(()=>{const e=[...document.querySelectorAll('#choices .ch')].find(e=>/^Kampf$/.test(e.textContent.trim()))||document.querySelector('#choices .ch'); e&&e.click();})()")
                await pg.wait_for_timeout(50)
        async def start(ally, amoves, alvl, enemy, emoves, elvl):
            await ev(SET.replace('TEAM', f"(()=>{{const m=G.makeMon('{ally}',{alvl}); m.moves={json.dumps(amoves)}; G.fillPP(m); return m;}})()"))
            asyncio.ensure_future(ev(f"G.debug.wild('{enemy}',{elvl},{json.dumps(emoves)}).catch(()=>0)"))
            return await to_menu()
        async def hit(ally, mv, enemy):
            await start(ally, [mv], 40, enemy, ['haerten'], 3)
            await ev("G.Battle.lastHit=null; G.Battle.lastPop=null; Math._r=Math.random; Math.random=()=>0.5;")
            await ev("[...document.querySelectorAll('#choices .ch')].find(e=>e.textContent.trim()==='Kampf').click()"); await pg.wait_for_timeout(150)
            hint = None
            for _ in range(60):
                hint = await ev(f"(()=>{{const e=[...document.querySelectorAll('#choices .ch')].find(e=>e.textContent.includes(G.MOVES['{mv}'].name)); if(!e) return null; const r=e.innerHTML; e.click(); return r;}})()")
                if hint is not None: break
                await pg.wait_for_timeout(50)
            for _ in range(160):
                if await ev("!!G.Battle.lastHit"): break
                if await ev("G.UI.kind") == 'say': await pg.keyboard.press("Space")
                await pg.wait_for_timeout(50)
            await pg.wait_for_timeout(250)
            r = await ev(f"""(()=>{{const al=G.state.team[0], en=G.B.enemy, M=G.MOVES['{mv}'], as=G.stats(al), ds=G.stats(en), e=G.eff(M.type,en.sp), st=G.hasType(al.sp,M.type)?1.5:1;
              let x=Math.floor(((2*al.lvl/5+2)*M.power*as.atk/ds.def)/50+2); x=e===0?0:Math.max(1,Math.floor(x*st*e*(0.85+0.5*0.15)));
              return {{e, exp:x, dmg:G.Battle.lastHit&&G.Battle.lastHit.dmg, pop:G.Battle.lastPop&&G.Battle.lastPop.text, base:Math.floor(((2*al.lvl/5+2)*M.power*as.atk/ds.def)/50+2)}};}})()""")
            await ev("Math.random=Math._r||Math.random"); r['hint'] = hint
            await end_battle(); return r
        # Angreifer: Glimmfuchs (lv 40) mit einer Attacke jedes nötigen Typs – Attacke je Fall aus G.MOVES (Stärke > 0, Genauigkeit ≥ 90, keine Mehrfachtreffer)
        dmg = {}
        for f, (t, sp, types) in sorted(dual.items(), key=lambda x: -float(x[0])):
            mv = await ev(f"Object.keys(G.MOVES).find(k=>{{const M=G.MOVES[k]; return M.type==='{t}' && M.power>=40 && M.power<=90 && M.acc>=90 && !M.hits && !M.recoil && !M.drain && !M.status && !M.eff2 && !M.prio;}})")
            r = await hit('glimmfuchs', mv, sp)
            dmg[f] = r
            msg = {'4': 'Sehr effektiv!', '2': 'Sehr effektiv!', '1': None, '0.5': 'Nicht sehr effektiv …', '0.25': 'Nicht sehr effektiv …', '0': 'Hat keine Wirkung …'}[str(f)]
            check(r['e'] == float(f) and r['dmg'] == r['exp'] and r['pop'] == msg, f"Kampf: {G_name(mv)} ({t}) gegen {sp} ({'/'.join(types)}) = {f}× → Schaden {r['dmg']} (erwartet {r['exp']}), Meldung «{r['pop']}»")
        check(dmg['4']['dmg'] > dmg['2']['dmg'] > 0 and dmg['0']['dmg'] == 0, "4× > 2× > … und 0× macht keinen Schaden")
        # Menü-Hinweis (▲/▼/✕) im Attacken-Menü
        hints = {f: ('▲' in r['hint'], '▼' in r['hint'], '✕' in r['hint']) for f, r in dmg.items()}
        check(hints['4'][0] and hints['2'][0] and hints['0.5'][1] and hints['0.25'][1] and hints['0'][2] and not any(hints['1']), f"Attacken-Menü zeigt ▲ / ▼ / ✕ passend zur Tabelle {hints}")
        # Gegner-KI: gleiche Tabelle – gegen einen Boden-Geist nie die wirkungslose Elektro-Attacke, die sehr effektive Wasser-Attacke bevorzugt
        await start('torfwicht', ['rempler'], 12, 'laternchen', [], 12)
        ai = await ev("""(async()=>{const en=G.B.enemy; const el=Object.keys(G.MOVES).find(k=>G.MOVES[k].type==='Elektro'&&G.MOVES[k].power>=40&&!G.MOVES[k].hits);
           const wa=Object.keys(G.MOVES).find(k=>G.MOVES[k].type==='Wasser'&&G.MOVES[k].power>=40&&G.MOVES[k].power<=70&&!G.MOVES[k].hits);
           const ne=Object.keys(G.MOVES).find(k=>G.MOVES[k].type==='Neutral'&&G.MOVES[k].power>=40&&G.MOVES[k].power<=70&&!G.MOVES[k].hits&&!G.MOVES[k].prio);
           en.moves=[el,wa,ne]; G.fillPP(en); const c={}; for (let i=0;i<3000;i++){const id=await G.Battle.enemyChoice(); c[id]=(c[id]||0)+1;} return {el,wa,ne,c, eff:[G.eff(G.MOVES[el].type,'torfwicht'),G.eff(G.MOVES[wa].type,'torfwicht')]};})()""")
        c = ai['c']
        check(c.get(ai['el'], 0) == 0 and c.get(ai['wa'], 0) > 1.4 * c.get(ai['ne'], 1), f"Gegner-KI nutzt die Tabelle: Elektro gegen Boden nie gewählt, Wasser (2×) bevorzugt {c}")
        await end_battle()
        # ---------- Werte wirken im Kampf ----------
        async def same_hit(ally, mv, enemy, elvl=20):
            await start(ally, [mv], 30, enemy, ['gespinst'], elvl)   # Gegner senkt nur die Init. – Schaden unverfälscht
            r = await ev(f"(()=>{{const en=G.B.enemy; return {{def:G.stats(en).def, spd:G.stats(en).spd}};}})()")
            await ev("G.Battle.lastHit=null; G.Battle.lastOrder=null; Math._r=Math.random; Math.random=()=>0.5;")
            await ev("[...document.querySelectorAll('#choices .ch')].find(e=>e.textContent.trim()==='Kampf').click()"); await pg.wait_for_timeout(150)
            for _ in range(60):
                if await ev(f"(()=>{{const e=[...document.querySelectorAll('#choices .ch')].find(e=>e.textContent.includes(G.MOVES['{mv}'].name)); if(!e) return false; e.click(); return true;}})()"): break
                await pg.wait_for_timeout(50)
            for _ in range(160):
                if await ev("!!G.Battle.lastHit"): break
                if await ev("G.UI.kind") == 'say': await pg.keyboard.press("Space")
                await pg.wait_for_timeout(50)
            r.update(await ev("({dmg:G.Battle.lastHit&&G.Battle.lastHit.dmg, seq:G.Battle.lastOrder&&G.Battle.lastOrder.seq})"))
            await ev("Math.random=Math._r||Math.random"); await end_battle(); return r
        # gleicher Treffer (Neutral-Attacke, kein Typfaktor) gegen Tank (Moosigel, hohe Vert.) und Speedster (Schleierkauz, niedrige Vert.)
        neu = await ev("Object.keys(G.MOVES).find(k=>G.MOVES[k].type==='Neutral'&&G.MOVES[k].power>=40&&G.MOVES[k].acc>=95&&!G.MOVES[k].hits&&!G.MOVES[k].prio&&!G.MOVES[k].recoil)")
        tank = await same_hit('raufdachs', neu, 'moosigel'); spd = await same_hit('raufdachs', neu, 'schleierkauz')
        check(tank['def'] > spd['def'] and tank['dmg'] < spd['dmg'], f"Verteidigung wirkt: Tank Moosigel (Vert. {tank['def']}) nimmt {tank['dmg']}, Schleierkauz (Vert. {spd['def']}) nimmt {spd['dmg']}")
        hi = await same_hit('moorkeiler', neu, 'schleierkauz'); lo = await same_hit('nebelente', neu, 'schleierkauz')
        check(hi['dmg'] > lo['dmg'], f"Angriff wirkt: Bruiser Moorkeiler macht {hi['dmg']}, Support Nebelente {lo['dmg']} (gleiche Attacke, gleiches Ziel)")
        fast = await same_hit('menhirgeist', neu, 'schleierkauz', 30); slow = await same_hit('schleierkauz', neu, 'menhirgeist', 30)
        check(fast['seq'] and fast['seq'][0] == 'enemy' and slow['seq'] and slow['seq'][0] == 'ally', f"Initiative wirkt: der schnellere Schleierkauz handelt zuerst ({fast['seq']} / {slow['seq']})")
        roles = await ev("""(()=>{const g={}; for (const [k,s] of Object.entries(G.SPECIES)) { if(!s.role||!s.base) continue; const b=s.base, sum=b.hp+b.atk+b.def+b.spd; (g[s.role]=g[s.role]||[]).push({hp:b.hp/sum,atk:b.atk/sum,def:b.def/sum,spd:b.spd/sum}); }
          const avg={}; for (const [r,a] of Object.entries(g)) { avg[r]={}; for (const s of ['hp','atk','def','spd']) avg[r][s]=Math.round(1000*a.reduce((x,y)=>x+y[s],0)/a.length)/10; avg[r].n=a.length; } return avg;})()""")
        print("   Rollen (Anteil am Basiswert-Gesamt, %):", roles)
        others = lambda r, s: max(v[s] for k, v in roles.items() if k != r)
        check(roles['Tank']['def'] >= others('Tank', 'def') and roles['Speedster']['spd'] >= others('Speedster', 'spd') and roles['Tank']['spd'] < roles['Speedster']['spd']
              and roles['Bruiser']['atk'] > roles['Support']['atk'] and roles['Sweeper']['atk'] > roles['Tank']['atk'], "Rollen spiegeln sich in den Werten (Tank: höchste Vert., Speedster: höchste Init., Bruiser/Sweeper: mehr Angriff)")
        # ---------- Balance der Story-Kämpfe (vereinfachte Simulation, alte vs. neue Tabelle) ----------
        await ev(open(__file__.rsplit('/', 1)[0] + '/balance_sim.js').read())
        old = json.load(open(__file__.rsplit('/', 1)[0] + '/chart_pre202.json'))
        so = await ev("c=>G.balanceSim(c,600)", old); sn = await ev("G.balanceSim(G.CHART,600)")
        for k in sn: print(f"   {k:15s} Lv {sn[k]['lvl']}: " + ", ".join(f"{st} {so[k][st]}→{sn[k][st]} %" for st in ['flackerling', 'pfuetzling', 'blattling']))
        ok = all(sn[k][st] >= 90 for k in ['selma', 'quantum'] for st in ['flackerling', 'pfuetzling', 'blattling']) and all(sn['kaspar'][st] >= 35 for st in ['flackerling', 'pfuetzling', 'blattling']) \
             and all(sn['klingenmeister'][st] >= so['klingenmeister'][st] - 8 for st in ['flackerling', 'pfuetzling', 'blattling'])
        check(ok, "Story-Kämpfe bleiben machbar (Selma/Nachtmahr ≥ 90 %, Kaspar ≥ 35 % je Starter, Klingenmeister nicht schwerer)")
        check(not errors, f"keine JS-Fehler {errors[:3]}")
        await b.close()
def G_name(m): return m
asyncio.run(main())
print("FAILS:", len(fails)); sys.exit(1 if fails else 0)
