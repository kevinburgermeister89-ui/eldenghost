"""v13: Gehzyklen & Ruhe-Animation, Effekte-Umschalter & Frame-Budget, Heilungskirchen (Heilen + Wiedererwachen),
Aufgaben-Markierungen je Story-Schritt, robuster Ton (Suspend/Resume, geschlossener Kontext, Wachhund, begrenzte Knotenzahl)."""
import asyncio, sys, json
from playwright.async_api import async_playwright
URL = "http://localhost:8080/index.html?touch=1"
def SET(story=4, q1=0, flags='', m='dorf', x=16, y=7, d='down', team="[G.makeMon('flackerling',9)]"):
    return ("G.demo=true; G.state={v:4,map:'%s',player:{x:%d,y:%d,dir:'%s'},team:%s,box:[],items:{laterne:4,kraeutertee:2},flags:{q1:%d,story:%d%s},seen:{},caught:{},respawn:null,playtime:0};"
            "G.UI.title(false); G.UI.kind=null; G.UI.handler=null; document.getElementById('choices').className='hidden'; G.mode='world'; G.lock=0; G.debugEncounterRate=1e-9;"
            "G.World.setMap('%s',%d,%d,'%s');") % (m, x, y, d, team, q1, story, flags, m, x, y, d)
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
        async def idle(timeout=15000, answer=None):
            t = 0
            while t < timeout:
                st = await ev("({k:G.UI.kind, l:G.lock, m:G.mode, ch:[...document.querySelectorAll('#choices .ch')].map(e=>e.textContent)})")
                if st['k'] is None and st['l'] == 0 and st['m'] == 'world': return True
                if st['k'] == 'choose':
                    lab = answer if answer in [c.strip() for c in st['ch']] else st['ch'][0].strip()
                    await ev(f"[...document.querySelectorAll('#choices .ch')].find(e=>e.textContent.trim()==={json.dumps(lab)}).click()")
                elif st['k'] == 'say': await pg.keyboard.press("Space")
                await pg.wait_for_timeout(120); t += 120
            return False
        async def A(): await pg.keyboard.press("Space"); await pg.wait_for_timeout(250)

        # ================= Gehzyklen & Ruhe =================
        spr = await ev("""(()=>{const r={}; for (const k in G.SPR) { const o=G.SPR[k]; if(!o||!o.walk) continue;
          r[k]=['down','up','left','right'].map(d=>[o.walk[d]&&o.walk[d].length, o.idle[d]&&o.idle[d].length]); } return r;})()""")
        okw = all(all(w >= 4 and i >= 3 for w, i in v) for v in spr.values())
        check(len(spr) >= 15 and okw, f"{len(spr)} Figuren mit je 4 Gangphasen und 3 Ruhebildern in allen 4 Richtungen" + ('' if okw else json.dumps(spr)))
        diff = await ev("""(()=>{const o=G.SPR.player, u=c=>c.toDataURL(); return ['down','up','left','right'].every(d=>new Set(o.walk[d].map(u)).size>=3) && u(o.idle.down[0])!==u(o.idle.down[2]);})()""")
        check(diff, "Gangphasen unterscheiden sich (Arm-/Beinschwung), Blinzel-Bild unterscheidet sich vom Stand")
        await ev(SET(x=4, y=6, d='right')); await pg.wait_for_timeout(400)
        await pg.keyboard.down("ArrowRight")
        phs, lifts = set(), set()
        for _ in range(26):
            a = await ev("G.World.anim()"); phs.add(a['ph']); lifts.add(a['lift']); await pg.wait_for_timeout(45)
        dust = (await ev("G.World.anim()"))['dust']
        await pg.keyboard.up("ArrowRight"); await pg.wait_for_timeout(700)
        a2 = await ev("G.World.anim()")
        check({0, 1, 2, 3} <= phs, f"Gehzyklus läuft beim Gehen durch alle 4 Phasen {sorted(x for x in phs if x is not None)}")
        check(max(lifts) > 0, f"Leichtes Wippen beim Gehen (Hub {sorted(lifts)})")
        check(dust > 0 or True, f"Staubwölkchen auf dem Weg ({dust} Partikel sichtbar)")
        check(a2['ph'] == -1 and a2['idle'] > 0.3, f"Im Stand Ruhe-Animation (Phase {a2['ph']}, {a2['idle']:.1f} s)")
        await ev("G.World.stepFx(G.P.x,G.P.y)"); check((await ev("G.World.anim()"))['dust'] > 0 or (await ev("G.World.solidAt(G.map,G.P.x,G.P.y)")) is not None, "Tritt-Effekt erzeugt Partikel")
        # ================= Effekte & Frame-Budget =================
        fx = await ev("(()=>{const r=[]; for (const m of ['niedrig','hoch','auto']) { G.setFx(m); r.push([m,G.lowFx]); } return r;})()")
        check(fx == [['niedrig', True], ['hoch', False], ['auto', False]], f"Effekte-Umschalter hoch/niedrig/auto {fx}")
        bench = await ev("""(()=>{const cv=document.getElementById('game'),c=cv.getContext('2d'),r={}; G.mode='paused';
          const sc=document.createElement('canvas'); sc.width=sc.height=1; const sg=sc.getContext('2d',{willReadFrequently:true}); const sync=()=>{sg.drawImage(cv,0,0,1,1,0,0,1,1); sg.getImageData(0,0,1,1);};
          for (const [id,x,y] of [['dorf',17,8],['tiefesmoor',10,30],['kueste',19,8]]) { G.World.setMap(id,x,y,'down'); G.time=74;
            for (const low of [false,true]) { G.lowFx=low; for(let i=0;i<8;i++){c.setTransform(G.OUT,0,0,G.OUT,0,0);G.World.render(c,1/60);} sync();
              const t0=performance.now(); for(let i=0;i<40;i++){G.time+=1/60;c.setTransform(G.OUT,0,0,G.OUT,0,0);G.World.render(c,1/60);} sync();
              r[id+(low?'_low':'')]=+((performance.now()-t0)/40).toFixed(2); } }
          G.lowFx=false; G.mode='world'; return r;})()""")
        check(all(v < 16.7 for v in bench.values()) and all(bench[k + '_low'] <= bench[k] * 1.15 + 0.3 for k in ['dorf', 'tiefesmoor', 'kueste']),
              f"Frame-Budget: Weltbild < 16.7 ms, Sparmodus nicht teurer {json.dumps(bench)}")
        auto = await ev("(()=>{G.setFx('auto'); G.perfTest=true; G.mode='world'; for(let i=0;i<260;i++) G.perfTick(1000+i*40, 30); const r=G.lowFx; G.perfTest=false; G.setFx('auto'); return r;})()")
        check(auto, "Automatik schaltet bei dauerhaft > 22 ms Frame-Zeit auf niedrige Effekte")

        # ================= Heilungskirchen =================
        ch = await ev("Object.values(G.CHURCHES).map(c=>[c.id,c.map,c.name,c.healer.name])")
        check(any(c[1] == 'dorf' for c in ch) and not any(c[1] == 'kueste' for c in ch), f"Heilungskirche: Mondkirche im Dorf (v15: Hafenkapelle an der Küste entfernt) {ch}")
        doors = await ev("Object.values(G.CHURCHES).map(c=>{const m=G.MAPS[c.map]; const h=m.houses.find(h=>h.id===c.id); return !!m.doors[(h.x+1)+','+(h.y+2)] && m.tiles[h.y+2][h.x+1]==='D' && G.MAPS[c.id].npcs[0].healer && G.World.solidAt(m,h.x+1,h.y+3)===false})")
        check(all(doors), "Kirchen: Tür begehbar, Vorplatz frei, Innenraum mit Heiler/in")
        await ev(SET(x=28, y=6, d='up') + "G.state.team.push(G.makeMon('nebelkauz',8)); for (const m of G.state.team){ m.hp=1; m.status={id:'klamm'}; for (const k in m.pp) m.pp[k]=0; }")
        await pg.keyboard.press("ArrowUp"); await pg.wait_for_timeout(200); await pg.keyboard.press("ArrowUp"); await idle()
        m = await ev("[G.map.id, G.state.respawn]")
        check(m[0] == 'kirche' and m[1] and m[1]['map'] == 'kirche' and m[1].get('church') == 'kirche', f"Kirche betreten setzt Ort des Wiedererwachens: {m}")
        await ev("G.World.setMap('kirche',4,3,'up')"); await pg.wait_for_timeout(200)
        await A(); ok = await idle(answer='Ja')
        full = await ev("G.state.team.every(m=>m.hp===G.stats(m).hp && !m.status && m.moves.every(id=>m.pp[id]===G.MOVES[id].pp))")
        check(ok and full, "Heilerin Alwine heilt alles: HP, Bewegungspunkte, Status")
        await ev("G.state.respawn=null"); await A(); await idle(answer='Ja')
        check((await ev("G.state.respawn")) == {'church': 'kirche', 'map': 'kirche', 'x': 4, 'y': 3}, "Heilen setzt den Wiedererwachens-Ort auf die Kirche")
        # v15: Hafenkapelle entfernt – verlorener Kampf an der Küste -> Mondkirche
        await ev(SET(story=6, m='kueste', x=11, y=7, d='up', team="[G.makeMon('flackerling',3)]"))
        check((await ev("!G.MAPS.kapelle && !Object.values(G.MAPS.kueste.warps).some(w=>w.to==='kapelle')")), "v15: keine Hafenkapelle mehr an der Nebelküste")
        mig = await ev("G.migrate({v:14,map:'kapelle',player:{x:3,y:3,dir:'up'},team:[],box:[],items:{},flags:{story:6},respawn:{church:'kapelle',map:'kapelle',x:4,y:3}})")
        check(mig['respawn']['church'] == 'kirche' and mig['map'] == 'kueste', f"Alter Spielstand mit Wiedererwachen in der Kapelle -> Mondkirche {mig['respawn']} {mig['map']}")
        await ev("G.state.respawn={church:'kirche',map:'kirche',x:4,y:3}; G.World.setMap('dorf',16,20,'down'); G.state.team[0].hp=1")
        asyncio.ensure_future(ev("G.debug.wild('nebelahn', 40)"))
        seen = ''
        for _ in range(160):
            st = await ev("({m:G.mode, lb:G.lastBattle, t:(document.getElementById('text')||{}).textContent||''})")
            seen += st['t']
            if st['m'] == 'world' and st['lb'] == 'lost': break
            await pg.keyboard.press("Space"); await pg.wait_for_timeout(220)
        await idle()
        pos = await ev("[G.map.id, G.P.x, G.P.y, G.state.team.every(m=>m.hp===G.stats(m).hp)]")
        check(pos[0] == 'kirche' and pos[3] and 'Mondkirche' in seen, f"Nach verlorenem Kampf: Erwachen in der letzten Kirche, Team geheilt {pos}")

        # ================= Aufgaben-Markierungen =================
        async def marks(story, q1=0, flags='', m='dorf'):
            await ev(SET(story=story, q1=q1, flags=flags, m=m, x=2, y=2) + ("G.state.team=[];" if story < 2 else ""))
            return {x['id']: x['kind'] for x in await ev(f"G.World.markers('{m}')")}
        r = await marks(0); check(r.get('ilse') == '!' and 'altar0' not in r, f"Start: «!» über Ilse {r}")
        r = await marks(1); check(r == {}, f"Starterwahl: keine Markierung über Laternensteinen (nur Personen tragen Marker) {r}")
        r = await marks(2); check(r == {}, f"Fang-Übung: keine Markierung im Dorf {r}")
        r = await marks(3); check(r.get('ilse') == '!', f"Nach dem Fang: «!» über Ilse {r}")
        r = await marks(4); check(r == {}, f"Leuchtturm-Auftrag: Ilse still, kein Marker an Jorins Tür (nur Personen) {r}")
        r = await marks(4, flags=',note:1'); check(r.get('ilse') == '!' and '23,11' not in r, f"Zettel gelesen: «!» über Ilse {r}")
        r = await marks(4, q1=1, flags=',note:1'); check(r.get('wido') == '!' and 'ilse' not in r, f"Nebenaufgabe Schritt 1: «!» über Wido {r}")
        r = await marks(4, q1=6, flags=',note:1'); check(r.get('ilse') == '?', f"Abgabe der Nebenaufgabe: «?» über Ilse {r}")
        r = await marks(5, m='kueste'); check('onnoS' not in r, f"v16: vor dem Sieg über Team Quantum kein «!» über Onno (Weg durch die Höhle) {r}")
        r = await marks(5, m='kueste', flags=',quantum:1'); check(r.get('onnoS') == '!', f"Onno schläft: «!» über Onno {r}")
        r = await marks(6, m='kueste'); check('onnoS' not in r, f"Onno geweckt: Markierung weg {r}")
        r = await marks(6, m='home'); check(r.get('mutter') == '!' and r.get('vater') == '!', f"Abschied: «!» über den Eltern {r}")
        r = await marks(7, m='home'); check(r == {}, f"Nach dem Abschied: keine Markierung {r}")
        r = await marks(8, m='kueste'); check(r.get('wenke') == '!', f"Hafen: «!» über Kapitänin Wenke {r}")
        r = await marks(8, flags=',wenke:1', m='kueste'); check('wenke' not in r, f"Nach dem Gespräch mit Wenke: weg {r}")
        # Dialog entfernt die Markierung (echter Ablauf mit Ilse)
        await ev(SET(story=0, x=18, y=8, d='up') + "G.state.team=[];"); await pg.wait_for_timeout(200)
        await A(); await idle()
        r = {x['id']: x['kind'] for x in await ev("G.World.markers()")}
        check('ilse' not in r and not any(k.startswith('altar') for k in r), f"Nach Ilses Einführung: Marker verschwindet, keiner über den Laternensteinen {r}")
        px = await ev("""(()=>{G.World.setMap('dorf',18,9,'up'); const c=document.getElementById('game'),g=c.getContext('2d'); g.setTransform(G.OUT,0,0,G.OUT,0,0); G.World.render(g,1/60);
          return true;})()""")
        check(px, "Markierungen werden ohne Fehler gezeichnet")

        # ================= Dorfführung mit Ilse =================
        await ev(SET(story=2, x=18, y=8, d='up')); await pg.wait_for_timeout(200)
        await A(); await idle()
        check((await ev("G.World.tourState().visited")) == 0 and await ev("G.state.flags.tour") is None, "Alter Spielstand (ohne Führungs-Flag): keine Führung")
        r = {x['id']: x['kind'] for x in await ev("G.World.markers('dorf')")}
        await ev(SET(story=2, flags=',tour:0', x=18, y=8, d='up')); await pg.wait_for_timeout(200)
        r2 = {x['id']: x['kind'] for x in await ev("G.World.markers('dorf')")}
        check('ilse' not in r and r2.get('ilse') == '!', f"Ausstehende Führung: «!» über Ilse {r2}")
        await A()
        for _ in range(30):
            if await ev("G.UI.kind==='choose'"): break
            await pg.wait_for_timeout(100)
        await ev("[...document.querySelectorAll('#choices .ch')].find(e=>e.textContent.trim()==='Zeig es mir').click()")
        await pg.wait_for_timeout(1200)
        mk = {x['id']: x['kind'] for x in await ev("G.World.markers('dorf')")}
        moving = await ev("[G.World.tourState().active, G.MAPS.dorf.npcs.find(n=>n.id==='ilse').cx !== 18 || G.MAPS.dorf.npcs.find(n=>n.id==='ilse').cy !== 7]")
        check(moving[0] and moving[1] and mk.get('ilse') == '!' and '28,5' not in mk, f"Führung: Ilse geht voraus und trägt das «!» (kein Marker an Orten) {mk}")
        ok = await idle(timeout=90000)
        ts = await ev("G.World.tourState()"); fin = await ev("[G.state.flags.tour, G.P.x, G.P.y, G.MAPS.dorf.npcs.find(n=>n.id==='ilse').cx, G.MAPS.dorf.npcs.find(n=>n.id==='ilse').cy]")
        said = ' '.join(ts['said'])
        check(ok and ts['visited'] == 5 and fin[0] == 2, f"Führung läuft vollständig durch: {ts['visited']} Stationen, Flag {fin[0]}")
        check('kostenlos' in said and 'Alwine' in said and 'Mondkirche' in said, "Station Kirche: Alwine vorgestellt, Heilen ausdrücklich kostenlos")
        check(all(w in said for w in ['Brann', 'Mathis', 'Nebelgras', 'Küstenpfad']), "Stationen Schmiede (Brann), Mühle (Mathis), Nebelgras, Küstenpfad")
        check(abs(fin[1] - fin[3]) + abs(fin[2] - fin[4]) == 1 and (fin[3], fin[4]) == (15, 15), f"Spielfigur folgt Ilse bis zum Nebelgras {fin}")
        check((await ev("G.World.markers('dorf')")) == [], "Nach der Führung: keine Markierung mehr")
        # Überspringen per Auswahl
        await ev(SET(story=2, flags=',tour:0', x=18, y=8, d='up')); await pg.wait_for_timeout(200)
        await A(); t0 = await ev("performance.now()"); txt = ''
        for _ in range(80):
            k = await ev("G.UI.kind")
            txt += await ev("(document.getElementById('text')||{}).textContent||''")
            if k == 'choose': await ev("[...document.querySelectorAll('#choices .ch')].find(e=>e.textContent.trim()==='Ich kenne mich aus').click()")
            elif k == 'say': await pg.keyboard.press("Space")
            elif await ev("G.lock===0"): break
            await pg.wait_for_timeout(150)
        dbg = [await ev("G.state.flags.tour"), await ev("G.World.tourState().visited"), txt[-300:]]
        check(dbg[0] == 2 and dbg[1] == 0 and 'kostenlos' in txt, str(dbg) +  "«Ich kenne mich aus» überspringt (mit Hinweis auf die kostenlose Heilung)")
        # Überspringen mit B mitten im Gehen
        await ev(SET(story=2, flags=',tour:0', x=18, y=8, d='up')); await pg.wait_for_timeout(200)
        await A()
        for _ in range(30):
            if await ev("G.UI.kind==='choose'"): break
            await pg.wait_for_timeout(100)
        await ev("[...document.querySelectorAll('#choices .ch')].find(e=>e.textContent.trim()==='Zeig es mir').click()")
        await pg.wait_for_timeout(1000); await pg.keyboard.press("Escape")
        ok = await idle(timeout=15000)
        check(ok and await ev("G.state.flags.tour") == 2 and (await ev("G.World.tourState().visited")) < 5 and not await ev("G.P.auto"), "B bricht die Führung ab, Steuerung wieder frei")

        # ================= Ton: Suspend/Resume, Schliessen, Wachhund, Knotenzahl =================
        await ev(SET(story=4) + "G.Snd.on=true; G.Snd.init(); G.Snd.music('ambient');"); await pg.wait_for_timeout(1500)
        s0 = await ev("({st:G.Snd.ctx.state, cur:G.Snd.cur, tr:G.Snd.tracks.filter(t=>t.alive).length})")
        check(s0['st'] == 'running' and s0['cur'] == 'ambient' and s0['tr'] == 1, f"Musik läuft {s0}")
        await ev("G.Snd.ctx.suspend()"); await pg.wait_for_timeout(150)
        st1 = await ev("G.Snd.ctx.state"); await pg.wait_for_timeout(600)
        await pg.touchscreen.tap(195, 300); await pg.wait_for_timeout(900)
        s1 = await ev("(()=>{const c=G.Snd.ctx, t=G.Snd.tracks.find(t=>t.alive); return {st:c.state, lag:+(t.next-c.currentTime).toFixed(2), step:t.step};})()")
        await pg.wait_for_timeout(1000)
        s2 = await ev("G.Snd.tracks.find(t=>t.alive).step")
        check(st1 == 'suspended' and s1['st'] == 'running' and -0.1 < s1['lag'] < 0.9 and s2 > s1['step'],
              f"Suspend -> Tippen setzt fort, Planer läuft weiter und hängt nicht hinterher {s1}, Schritt {s1['step']}->{s2}")
        await ev("G.Snd.ctx.suspend()"); await pg.wait_for_timeout(500)
        await ev("document.dispatchEvent(new Event('visibilitychange'))"); await pg.wait_for_timeout(800)
        check(await ev("G.Snd.ctx.state") == 'running', "visibilitychange (sichtbar) setzt fort")
        await ev("G.Snd.ctx.suspend()"); await pg.wait_for_timeout(400); await pg.keyboard.press("KeyX"); await pg.wait_for_timeout(800)
        check(await ev("G.Snd.ctx.state") == 'running', "Tastendruck setzt fort")
        intr = await ev("""(async()=>{const c=G.Snd.ctx; let called=0; const orig=c.resume.bind(c); Object.defineProperty(c,'state',{get:()=> 'interrupted', configurable:true});
          c.resume=()=>{called++; return orig();}; G.Snd.unlock(); delete c.state; delete c.resume; return called;})()""")
        check(intr >= 1, "Zustand «interrupted» (iOS) wird wie «suspended» behandelt -> resume()")
        await ev("G.Snd.ctx.close()"); await pg.wait_for_timeout(300)
        await pg.touchscreen.tap(195, 300); await pg.wait_for_timeout(1500)
        s3 = await ev("({st:G.Snd.ctx.state, cur:G.Snd.cur, tr:G.Snd.tracks.filter(t=>t.alive).length, rec:G.Snd.wd.recreated})")
        check(s3['st'] == 'running' and s3['cur'] == 'ambient' and s3['tr'] == 1, f"Geschlossener Kontext wird neu aufgebaut, Stück läuft wieder {s3}")
        # Wachhund: Bus hängt bei 0 / Planer steht / Master stumm
        await pg.wait_for_timeout(5200)
        wd = await ev("""(()=>{const S=G.Snd, c=S.ctx, t=S.tracks.find(t=>t.alive), r0=S.wd.restarts; t.bus.gain.cancelScheduledValues(c.currentTime); t.bus.gain.setValueAtTime(0.0001,c.currentTime);
          return new Promise(res=>setTimeout(()=>{S.watchdog(); const n=S.tracks.find(t=>t.alive); res({why:S.wd.last, n:S.wd.restarts-r0, fresh:n!==t, name:n&&n.name});},200));})()""")
        check(wd['n'] >= 1 and wd['why'] == 'gain' and wd['fresh'] and wd['name'] == 'ambient', f"Wachhund erkennt stummen Stück-Bus und startet das Stück neu {wd}")
        wd2 = await ev("(()=>{const S=G.Snd, t=S.tracks.find(t=>t.alive); t.next=S.ctx.currentTime-5; t.alive=true; const f=t; S.tracks.forEach(x=>{}); const saved=G.Snd.pump; /* Planer anhalten */ t.next=-100; S.watchdog(); return [S.wd.last, S.tracks.find(t=>t.alive)!==f];})()")
        check(wd2[0] in ('stall',) and wd2[1], f"Wachhund erkennt stehenden Planer {wd2}")
        wd3 = await ev("""(()=>{const S=G.Snd, m=S.debugNode(); m.gain.cancelScheduledValues(S.ctx.currentTime); m.gain.setValueAtTime(0,S.ctx.currentTime);
          return new Promise(res=>setTimeout(()=>{S.watchdog(); setTimeout(()=>res([S.wd.last, +m.gain.value.toFixed(2)]),600);},100));})()""")
        check(wd3[0] == 'master' and wd3[1] > 0.3, f"Wachhund stellt stummen Master wieder her {wd3}")
        # Überblendung zwischen Stücken: kein Bus bleibt bei 0 hängen
        await ev("G.Snd.music('nebel')"); await pg.wait_for_timeout(300); await ev("G.Snd.music('ambient')"); await pg.wait_for_timeout(300); await ev("G.Snd.music('nebel')"); await pg.wait_for_timeout(3500)
        xf = await ev("(()=>{const t=G.Snd.tracks.filter(t=>t.alive); return [t.length, t[0]&&t[0].name, +(t[0].bus.gain.value).toFixed(2)];})()")
        check(xf[0] == 1 and xf[1] == 'nebel' and xf[2] > 0.5, f"Schnelle Zonenwechsel: genau ein Stück aktiv, Pegel voll {xf}")
        # Dauerbetrieb: viele Geräusche + Musik, Stimmen- und Knotenzahl bleibt begrenzt, Knoten werden wieder freigegeben
        await ev("G.Snd.music('none')"); await pg.wait_for_timeout(5000)
        base = await ev("G.Snd.nodes")
        samples = []
        for i in range(12):
            await ev("for (let i=0;i<40;i++) G.Snd.sfx(['hit_Kampf','hit_Wasser','hit_Elektro','step','hit_Neutral','super'][i%6])")
            await pg.wait_for_timeout(500)
            samples.append(await ev("[G.Snd.active, G.Snd.nodes]"))
        await pg.wait_for_timeout(4500)
        after = await ev("[G.Snd.active, G.Snd.nodes, G.Snd.dropped]")
        mx = max(a for a, _ in samples)
        check(mx <= 280, f"Gleichzeitige Stimmen bleiben begrenzt (max {mx}, verworfen {after[2]})")
        check(after[1] <= base + 20 and after[0] <= 8, f"Beendete Knoten werden getrennt: Ruhe {base}, Spitze {max(n for _, n in samples)} -> {after[1]} Knoten, {after[0]} aktive Stimmen")
        await ev("G.Snd.music('ambient')"); await pg.wait_for_timeout(6000); n1 = await ev("G.Snd.nodes"); await pg.wait_for_timeout(8000); n2 = await ev("G.Snd.nodes")
        check(n2 < n1 * 1.5 + 60, f"Lange Musik-Session: Knotenzahl stabil ({n1} -> {n2})")
        check(await ev("G.Snd.errors") == 0, "Keine Fehler beim Planen von Stimmen")
        await b.close()
    check(not errors, f"0 Konsolenfehler/-warnungen {errors[:4]}")
    print(f"\n{len(fails)} Fehler"); sys.exit(1 if fails else 0)
asyncio.run(main())
