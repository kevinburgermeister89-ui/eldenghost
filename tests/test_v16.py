"""v16: grösseres Dorf mit Dorfleben und Begleitgeistern, Klippenhöhle, Team Quantum mit dem Nachtmahr (2 Phasen), Legende Fyrlumen, Katzenhaus."""
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
        # ================= Freischaltung & grössere Gebiete =================
        r = await ev("[G.FEAT, G.MAPS.dorf.w, G.MAPS.dorf.h, G.World.reachCheck('dorf',16,7).bad, G.World.reachCheck('hoehle',6,15).bad, G.World.reachCheck('kueste',1,11).bad, G.World.reachCheck('kueste',17,2).bad]")
        check(r[0]['cave'] and r[0]['legend'] and r[0]['cats'] and r[0]['rare'], f"v16 schaltet Höhle, Legende, Katzenhaus frei (seit v17 auch Sondergeister) {r[0]}")
        check(r[1] == 48 and r[2] == 32, f"Dorf nach Osten erweitert (Anger, Teich, Obstgarten, mehr Nebelgras) {r[1]}×{r[2]}")
        check(r[3] == [] and r[4] == [] and set(r[5]) <= {'Übergang hoehle', 'Figur onnoS'} and 'Figur onnoS' not in r[6], f"Alles erreichbar; Onnos Platz nur durch die Höhle {r[3:]}")
        # ================= Dorfleben: umhergehende Leute, Begleitgeister =================
        r = await ev("""(()=>{const m=G.MAPS.dorf; return m.npcs.filter(n=>n.pet).map(n=>[n.id,n.pet.sp,n.pet.name,Object.values(G.WILD_AREAS).some(a=>a.table.some(t=>t[0]===n.pet.sp)),!!n.wander]);})()""")
        check(2 <= len(r) <= 4 and all(x[3] for x in r), f"2–4 Begleitgeister im Dorf, alle wild fangbar {[(x[0], x[1], x[2]) for x in r]}")
        check(sum(1 for x in r if x[4]) >= 3, "Mindestens drei Dorfbewohner gehen umher")
        await ev(SET(m='dorf', x=38, y=9, d='up'))
        r = await ev("""(()=>{const V=G.World.village, m=G.map; let seed=11; const rnd=()=>{seed=(seed*16807)%2147483647; return seed/2147483647;};
          const W=m.npcs.filter(n=>n.wander), bad=[], st0=W.map(n=>n.steps||0); let maxPet=0;
          for(let i=0;i<4000;i++){ const before=W.map(n=>n.steps||0); V.updateVillage(m,0.05,rnd);
            W.forEach((n,j)=>{ const r=n.wander; if(n.cx<r[0]||n.cx>r[2]||n.cy<r[1]||n.cy>r[3]) bad.push(n.id+':out'); if(G.World.solidAt(m,n.cx,n.cy)) bad.push(n.id+':solid');
              const k=n.cx+','+n.cy; if(m.doors[k]||m.warps[k]||m.signs[k]) bad.push(n.id+':door');
              if((n.steps||0)>before[j] && Math.abs(n.cx-G.P.x)+Math.abs(n.cy-G.P.y)<=1) bad.push(n.id+':player');
              if(n.pet && !n.mv){ const d=Math.abs(n.pet.to[0]-n.cx)+Math.abs(n.pet.to[1]-n.cy); maxPet=Math.max(maxPet,d); } }); }
          return [bad.slice(0,5), W.map((n,j)=>[n.id,(n.steps||0)-st0[j]]), maxPet];})()""")
        check(not r[0], f"Umhergehen nur im eigenen Bereich, nie auf Wände/Türen, nie direkt neben die Spielfigur {r[0]}")
        check(all(s >= 10 for _, s in r[1]), f"Dorfbewohner bewegen sich (Schritte in 200 s) {r[1]}")
        check(r[2] <= 1, f"Begleitgeister folgen ihren Menschen auf dem Fuss (max. Abstand {r[2]})")
        await ev(SET(m='dorf', x=23, y=26, d='up')); await pg.wait_for_timeout(400)
        asyncio.ensure_future(ev("G.World.interact()")); await pg.wait_for_timeout(600)
        t = await text(); check('Flämmchen' in t, f"Begleitgeist ansprechen (Widos Laternchen) «{t[:60]}»"); await idle()
        await pg.wait_for_timeout(2500); await pg.locator('#screen').screenshot(path='/workspace/shots_v16/dorf_wido.png')
        # ================= Klippenhöhle =================
        r = await ev("[G.WILD_AREAS.hoehle.lvl, G.WILD_AREAS.hoehle.table.map(t=>[t[0],G.typesOf(t[0])]), ['ruedi','nele'].map(k=>[!!G.TRAINERS[k].ask, G.TRAINERS[k].team.map(t=>t[1])]), G.MAPS.hoehle.music, G.MAPS.kueste.warps['13,6'].to]")
        check(r[0] == [5, 9] and all(any(t in ('Stein', 'Boden', 'Neutral', 'Psycho') for t in x[1]) for x in r[1]), f"Höhle: Wildgeister Lv 5–9, Stein/Boden/Nachtgeister {r[1]}")
        check(all(x[0] for x in r[2]) and r[3] == 'cave' and r[4] == 'hoehle', f"Zwei Höhlen-Beschwörer (fragen vorher), eigene Höhlenmusik, Eingang am Küstenpfad {r[2]}")
        await ev(SET(story=5, m='hoehle', x=8, y=12)); await pg.wait_for_timeout(1500); await pg.locator('#screen').screenshot(path='/workspace/shots_v16/hoehle.png')
        # ================= Nachtmahr statt Synx =================
        src = await ev("Promise.all(['js/world.js','js/data.js','js/battle.js'].map(f=>fetch(f).then(r=>r.text()))).then(a=>a.join('\\n'))")
        r = await ev("[!!G.SPECIES.synx, G.SPECIES.nachtmahr && G.SPECIES.nachtmahr.name, G.TRAINERS.quantum.team.map(t=>t[0]), G.TRAINERS.quantum.phases, !!G.SPR.mon.nachtmahr]")
        check(not r[0] and 'Synx' not in src and r[1] == 'Nachtmahr' and r[2][-1] == 'nachtmahr' and r[3] == {'nachtmahr': 2} and r[4], f"Synx ersetzt durch den Nachtmahr (Alptraum-Geist), letzter und stärkster Gegner mit 2 Phasen {r[1:4]}")
        check("'Nachtmahr:" not in src and '`Nachtmahr:' not in src, "Der Nachtmahr spricht nicht (nur Zischen/Flüstern in der Erzählung)")
        # ================= Team Quantum: verlieren -> Mondkirche, Höhle bleibt offen =================
        await ev(SET(story=5, m='hoehle', x=17, y=6, d='up', team="[G.makeMon('flackerling',3)]"))
        await pg.keyboard.press("ArrowUp"); await pg.wait_for_timeout(700)
        seen = await run_until_world(answer='Nein')
        check('Nachtmahr' in seen and 'Unter Level 11' in seen and 'Gegen Team Quantum' in seen, "Szene: Mandy, Hans und der Nachtmahr (Augen im Rauch), Stärke-Hinweis, Kampf ist freiwillig")
        r = await ev("[G.state.flags.quantum||0, G.P.y, G.state.flags.qseen]")
        check(r[0] == 0 and r[1] == 6 and r[2] == 1, f"«Nein»: zurücktreten, heilen, später wiederkommen {r}")
        await pg.keyboard.press("ArrowUp"); await pg.wait_for_timeout(300); await pg.keyboard.press("ArrowUp"); await pg.wait_for_timeout(700)
        seen = await run_until_world(answer='Ja', max_steps=1500)
        r = await ev("[G.map.id, G.state.flags.quantum||0, G.lastBattle, G.MAPS.kueste.warps['13,6'].to, G.state.team.every(m=>m.hp===G.stats(m).hp)]")
        check(r[0] == 'kirche' and r[1] == 0 and r[2] == 'lost' and r[3] == 'hoehle' and r[4], f"Verloren: Erwachen in der Mondkirche, geheilt, Höhle bleibt offen {r}")
        # ================= Team Quantum: Sieg mit zweiter Phase =================
        await ev(SET(story=5, m='hoehle', x=17, y=6, d='up', flags=',qseen:1', team="[G.makeMon('seelendrache',34), G.makeMon('mondschwan',34)]"))
        await pg.keyboard.press("ArrowUp"); await pg.wait_for_timeout(700)
        log = []
        seen = await run_until_world(answer='Ja', max_steps=3000, log=log)
        rg = await ev("G.Battle.lastRage")
        pipsN = [x for x in log if x[0] == 'nachtmahr']
        check(rg and rg['sp'] == 'nachtmahr' and rg['phase'] == 1 and 1.15 <= rg['rage'] <= 1.2, f"Phase 2: Nachtmahr voll geheilt, +15–20 % Angriff/Tempo {rg}")
        check('Der Alptraum erhebt sich wütend!' in seen, "Wut-Text: «Der Alptraum erhebt sich wütend!»")
        check(pipsN and all(x[1] == 2 for x in pipsN) and any(x[2] == 1 for x in pipsN), f"Zwei Lebensbalken-Punkte, einer erlischt in Phase 2 {sorted(set(pipsN))[:4]}")
        check('Glaslaterne' in seen and 'Rückzug' in seen, "Nach dem Sieg: Nachtmahr flüchtet in die Glaslaterne, Team Quantum zieht sich drohend zurück")
        r = await ev("[G.state.flags.quantum, G.MAPS.hoehle.warps['19,1'].cond(), G.map.npcs.filter(n=>['mandy','hans','mahr'].includes(n.id)).some(n=>!n.show||n.show())]")
        check(r[0] == 1 and r[1] and not r[2], f"Licht fliesst zurück, Ausgang zu Onno offen, Team Quantum weg {r}")
        # Balance: Simulation (tests/sim_quantum.js) – hier nur Plausibilität der Gegnerwerte
        r = await ev("(()=>{const t=G.TRAINERS.quantum; return [t.team.map(x=>x[1]), t.hpMultFor.nachtmahr];})()")
        check(r[0][-1] >= max(r[0][:-1]) and 0.6 <= r[1] <= 1, f"Nachtmahr ist der stärkste und letzte Gegner, Lebensbalken je {r[1]:.0%} {r[0]}")
        # ================= Legende: Fyrlumen =================
        await ev(SET(story=6, m='leuchtturm', x=4, y=3, d='up', flags=',quantum:1'))
        asyncio.ensure_future(ev("(G.lock++, G.World.legendScene().finally(()=>G.lock--))")); await pg.wait_for_timeout(300)
        seen = await run_until_world()
        r = await ev("[G.state.seen.fyrlumen, G.World.legendDone, G.SPECIES.fyrlumen.catch, G.SPECIES.fyrlumen.legend, G.map.id]")
        check(r[0] == 1 and r[1] >= 1 and r[2] == 0 and r[3] and r[4] == 'leuchtturm', f"Fyrlumen fliegt davon (nicht fangbar), im Geisterbuch gesichtet {r}")
        check('Ungemach' in seen and 'grosse Geschichte' in seen and 'Onno' in seen, "Onno: bricht nur auf, wenn eine grosse Geschichte beginnt und Ungemach naht")
        asyncio.ensure_future(ev("G.Menu.chronik()")); await pg.wait_for_timeout(700)
        html = await ev("document.body.innerHTML")
        check('Fyrlumen' in html and 'gesichtet' in html and 'Legendär' in html, "Chronik: Fyrlumen «◇ gesichtet», «★ Legendär»")
        await pg.keyboard.press("Escape"); await pg.wait_for_timeout(300); await ev("G.UI.kind=null; G.UI.handler=null; document.getElementById('choices').className='hidden'")
        # ================= Katzenhaus =================
        await ev(SET(story=4, m='dorf', x=11, y=15, d='up'))
        r = await ev("[G.MAPS.dorf.doors['11,13'] && G.MAPS.dorf.doors['11,13'].to, G.MAPS.katzen.name, G.World.cats.map(c=>c.name)]")
        check(r[0] == 'katzen' and r[2] == ['Filou', 'Mira'], f"Katzenhaus im Dorf: Kevin und Cassandra, Filou und Mira {r}")
        asyncio.ensure_future(ev("G.World.warp('katzen',4,6,'up')")); await pg.wait_for_timeout(900)
        seen = await run_until_world()
        items1 = await ev("G.state.items")
        check(await ev("G.state.flags.kc") == 1 and 'Viel Glück' in seen and items1.get('starktee', 0) >= 1, f"Erster Besuch: warme Begrüssung, Katzen-Schwärmerei, Geschenke {items1}")
        pos0 = await ev("G.World.cats.map(c=>[c.tx,c.ty,c.st])"); await pg.wait_for_timeout(9000); pos1 = await ev("G.World.cats.map(c=>[c.tx,c.ty,c.st])")
        check(pos0 != pos1, f"Katzen bewegen sich/spielen/schlafen {pos0} -> {pos1}")
        await pg.locator('#screen').screenshot(path='/workspace/shots_v16/katzenhaus.png')
        r = await ev("""(()=>{const C=G.World.catGift, f=G.state.flags, t0=f.kcGift; const a=C.giftReady(t0+30*60e3), b=C.giftReady(t0+59*60e3), c=C.giftReady(t0+60*60e3);
          const g=C.takeGift(t0+61*60e3, ()=>0.5), again=C.takeGift(t0+62*60e3), left=C.giftLeft(t0+62*60e3);
          const pool=C.GIFT_POOL.map(p=>p[0]); const cnt={}; for(let i=0;i<2000;i++){const [k]=C.rollGift(); cnt[k]=(cnt[k]||0)+1;}
          f.kcGift=t0; return [a,b,c,g,again,Math.round(left/60e3),pool,cnt];})()""")
        check(r[0] is False and r[1] is False and r[2] is True and r[3] and r[4] is None and r[5] == 59, f"Stündliches Geschenk: erst nach 60 min wieder, dann Abklingzeit neu {r[:6]}")
        check(all(k in r[6] for k in ('kraeutertee', 'laterne')) and r[7].get('mondlaterne', 0) < r[7].get('kraeutertee', 0) / 3, f"Geschenke: Tee, Seelenfänger, selten Besonderes {r[7]}")
        await ev("G.World.setMap('katzen',2,3,'up')"); asyncio.ensure_future(ev("G.World.interact()")); await pg.wait_for_timeout(500)
        t = await text(); await idle()
        check('Kevin' in t and 'zurückgelegt' not in t, f"Vor Ablauf der Stunde: freundlicher Satz statt Geschenk «{t[:60]}»")
        # ================= Musik: wieder die v14-Stücke, nie doppelt =================
        import subprocess, re as _re
        src = open('/workspace/eg_backup_v14/js/audio.js').read()
        lit = src[src.index('  const TRACKS = {') + 17: src.index('\n  };', src.index('  const TRACKS = {')) + 4]
        mode = _re.search(r"const MODE = (\{.*?\});", src).group(1)
        v14 = json.loads(subprocess.check_output(['node', '-e', f"const MODE={mode}; const T=({lit}); for (const k in T) T[k].mode=Object.keys(MODE).find(m=>MODE[m]===T[k].mode); console.log(JSON.stringify(T))"]))
        now = await ev("(()=>{const M={dorian:[0,2,3,5,7,9,10],aeolian:[0,2,3,5,7,8,10],phrygian:[0,1,3,5,7,8,10],locrian:[0,1,3,5,6,8,10],harm:[0,2,3,5,7,8,11],lydian:[0,2,4,6,7,9,11]}; const T=JSON.parse(JSON.stringify(G.Snd.TRACKS)); for (const k in T) T[k].mode=Object.keys(M).find(m=>JSON.stringify(M[m])===JSON.stringify(T[k].mode)); return T;})()")
        check(all(now.get(k) == v for k, v in v14.items()), f"Alle v14-Stücke unverändert zurück {[k for k,v in v14.items() if now.get(k)!=v]}")
        check(set(now) - set(v14) == {'cave', 'quantum'} and all(now[k]['lead'] in ('bell', 'pluck') for k in ('cave', 'quantum')), f"Nur Höhle/Quantum neu, im v14-Stil {sorted(set(now)-set(v14))}")
        await ev("G.Snd.unlock()"); await pg.wait_for_timeout(300)
        await ev(SET(m='dorf', x=16, y=12)); await ev("G.Snd.music('ambient')"); await pg.wait_for_timeout(3500)
        t0 = await ev("G.Snd.tracks.find(t=>t.alive).born")
        await ev("G.Snd.music('coast')"); await pg.wait_for_timeout(300)
        r = await ev("({cur:G.Snd.cur, n:G.Snd.tracks.filter(t=>t.alive).length, born:G.Snd.tracks.find(t=>t.alive).born})")
        check(r['cur'] == 'ambient' and r['n'] == 1 and r['born'] == t0, f"Küste spielt wie in v14 das Dorfstück weiter, ohne Neustart {r}")
        await ev("G.Snd.music('church')"); await pg.wait_for_timeout(200)
        check(await ev("G.Snd.cur") == 'indoor', "Kirche spielt wie in v14 die Innenraum-Musik")
        for n in ['battle', 'quantum', 'cave', 'battle', 'trainer', 'ambient', 'quantum', 'cave']: await ev(f"G.Snd.music('{n}')"); await pg.wait_for_timeout(60)
        r = await ev("G.Snd.tracks.filter(t=>t.alive).length"); check(r == 1, f"Beim Umschalten immer nur ein Stück aktiv ({r})")
        await pg.wait_for_timeout(8500)   # ausgeblendete Stücke werden nach Blende + 4.5 s abgebaut
        r = await ev("({cur:G.Snd.cur, alive:G.Snd.tracks.filter(t=>t.alive).map(t=>t.name), all:G.Snd.tracks.length})")
        check(r['cur'] == 'cave' and r['alive'] == ['cave'] and r['all'] == 1, f"Schnelles Umschalten: am Ende genau ein Stück {r}")
        pv = await ev("Promise.all(['ambient','cave','quantum'].map(n=>G.Snd.renderPreview(n,12).then(r=>({n:r.name,peak:r.peakDb,rms:r.rmsDb,clip:r.clip,silent:r.silentSec}))))")
        print("  Vorschau:", pv)
        check(all(x['clip'] == 0 and x['silent'] == 0 and x['peak'] < -0.5 for x in pv), "Vorschau ohne Clipping/Stille")
        # ================= Haar im Laternenschein =================
        await ev(SET(m='dorf', x=16, y=12)); await pg.wait_for_timeout(800)
        bb = await pg.locator('#screen').bounding_box()
        await pg.screenshot(path='/workspace/shots_v16/hair_lamps.png', clip={'x': bb['x'] + bb['width'] / 2 - 30, 'y': bb['y'] + bb['height'] / 2 - 40, 'width': 60, 'height': 60})
        check(not [e for e in errors if 'favicon' not in e], f"Keine Konsolenfehler {errors[:5]}")
        await b.close()
    print("\nFAILS:", len(fails)); [print(" -", f) for f in fails]
    sys.exit(1 if fails else 0)
asyncio.run(main())
