"""v20: Das Schwarze Dojo – Überfahrt mit der «Nebelschwalbe», Aschehang (5 Abschnitte), Atmosphäre, Kuroganes Gefolge, 2 Dojo-Geister, Finale."""
import sys
from playwright.sync_api import sync_playwright
URL = sys.argv[1] if len(sys.argv) > 1 else "http://localhost:8080/index.html?touch=1"
SET = ("G.demo=true; G.state={v:6,map:'%s',player:{x:%d,y:%d,dir:'up'},team:[%s],box:[],items:{laterne:2,kraeutertee:3},flags:{q1:7,story:%d,tour:1%s},seen:{},caught:{},respawn:null,playtime:0,money:150};"
       "G.UI.title(false); G.UI.kind=null; G.UI.handler=null; document.getElementById('choices').className='hidden'; G.mode='world'; G.lock=0; G.debugEncounterRate=1e-9; G.World.setMap('%s',%d,%d,'up');")
TEAM = "G.makeMon('glutfaehe',30),G.makeMon('faustbiber',28)"
def setp(m, x, y, story, flags='', team=TEAM): return SET % (m, x, y, team, story, flags, m, x, y)
fails, errors = [], []
def check(c, msg):
    print(("OK " if c else "FAIL") + "  " + msg, flush=True)
    if not c: fails.append(msg)
with sync_playwright() as p:
    b = p.chromium.launch(executable_path='/usr/bin/google-chrome')
    ctx = b.new_context(viewport={'width': 390, 'height': 844}, device_scale_factor=2, is_mobile=True, has_touch=True)
    pg = ctx.new_page(); ev = pg.evaluate
    pg.on('pageerror', lambda e: errors.append(str(e))); pg.on('console', lambda m: errors.append(m.text) if m.type == 'error' else None)
    pg.goto(URL); pg.wait_for_timeout(2500)
    def A(): pg.keyboard.press('Space'); pg.wait_for_timeout(150)
    def key(k, n=1):
        for _ in range(n): pg.keyboard.press(k); pg.wait_for_timeout(330)
    def txt(): return ev("(document.getElementById('text')||{}).innerText||''")
    def choose(lbl): return ev(f"(()=>{{const e=[...document.querySelectorAll('#choices .ch')].find(e=>e.innerText.trim()==='{lbl}'); if(!e) return false; e.click(); return true;}})()")
    def drain(n=60, until=None):
        seen = []
        for _ in range(n):
            t = txt()
            if t and (not seen or seen[-1] != t): seen.append(t)
            if until and until(): break
            if not until and ev("G.lock===0 && document.getElementById('textbox').className.includes('hidden')"): break
            if not until and ev("!document.getElementById('choices').className.includes('hidden') && G.mode==='world'"): break
            A()
        return ' '.join(seen)
    LOG = []
    def win_battle():
        for _ in range(600):
            tt = txt()
            if tt and (not LOG or LOG[-1] != tt): LOG.append(tt)
            if ev("G.mode==='world' && !G.B && G.lock===0"): return True
            k = ev("G.UI.kind")
            if k == 'choose' and ev("!!G.B"):
                ev("if (G.B && G.B.enemy) G.B.enemy.hp = 0")
                ev("(()=>{const e=[...document.querySelectorAll('#choices .ch')].find(e=>/^Kampf$/.test(e.textContent.trim()))||document.querySelector('#choices .ch'); e&&e.click();})()")
            elif k == 'choose': ev("(()=>{const e=document.querySelector('#choices .ch'); e&&e.click();})()")
            else: pg.keyboard.press('Space')
            pg.wait_for_timeout(90)
        return False
    check(ev("fetch('sw.js').then(r=>r.text()).then(t=>/eldenghost-v2[0-9]/.test(t))"), 'Cache eldenghost-v20')
    # --- Daten: 2 Dojo-Geister (+ Entwicklung)
    d = ev("""(()=>{const ids=['klingengeist','oniasche','onigluetfuerst'];
      return {miss: ids.filter(k=>!G.SPECIES[k]), new20: G.NEW20, types: ids.map(k=>G.SPECIES[k].type), roles: ids.map(k=>G.SPECIES[k].role),
        evo: G.SPECIES.oniasche.evo, rare: G.RARE.includes('klingengeist'), order: ids.filter(k=>!G.SPECIES_ORDER.includes(k)),
        desc: ids.filter(k=>(G.SPECIES[k].desc||'').length<30), spr: ids.filter(k=>!(G.SPR.mon[k]&&G.SPR.mon[k].img&&G.SPR.mon[k].back)),
        base: ids.map(k=>G.SPECIES[k].base), learn: ids.slice(0,2).map(k=>G.SPECIES[k].learn.map(([l,m])=>[l,G.MOVES[m].type,G.MOVES[m].power||0])),
        fx: ['geisterklinge','onifaust'].filter(m=>!G.Battle.MOVE_FX[m]), sig: ['geisterklinge','onifaust'].map(m=>Object.keys(G.SPECIES).filter(s=>G.SPECIES[s].learn.some(x=>x[1]===m))),
        rs: G.RARE_SPAWNS.find(r=>r.zone==='aschehang'), area: G.WILD_AREAS.aschehang, zo: G.ZONE_ORDER.includes('aschehang')};})()""")
    check(not d['miss'] and sorted(d['new20']) == ['klingengeist', 'oniasche', 'onigluetfuerst'], f"Dojo-Geister vorhanden {d['miss']} {d['new20']}")
    check(d['types'] == ['Kampf/Psycho', 'Feuer/Kampf', 'Feuer/Kampf'] or d['types'][0] in ('Kampf', 'Kampf/Psycho'), f"Typen {d['types']}")
    check(d['roles'][0] == 'Sweeper' and d['roles'][1] == 'Bruiser', f"Rollen Klingengeist Sweeper, Oni-Asche Bruiser {d['roles']}")
    check(d['evo'] and d['evo']['to'] == 'onigluetfuerst', f"Oni-Asche → Oni-Glutfürst {d['evo']}")
    check(d['rare'] and not d['order'] and not d['desc'] and not d['spr'], f"selten/Chronik/Text/Sprites {d['order']} {d['desc']} {d['spr']}")
    bad = [k for k, bs in zip(['kg', 'oa', 'og'], d['base']) if any(v < 0.7 * sum(bs.values()) / 4 or v > 1.35 * sum(bs.values()) / 4 for v in bs.values())]
    check(not bad, f"Basiswerte moderat {d['base']}")
    check(all(all(t == 'Neutral' for l, t, pw in L if l < 8) for L in d['learn']), "Lernsets: unter Lv 8 nur neutrale Attacken")
    check(not d['fx'] and all(len(o) == 1 or set(o) <= {'oniasche', 'onigluetfuerst'} for o in d['sig']), f"Signaturen mit eigener Animation {d['fx']} {d['sig']}")
    check(d['zo'] and d['rs'] and d['rs']['sp'] == 'klingengeist' if 'sp' in (d['rs'] or {}) else d['zo'] and d['rs'], f"Aschehang-Gebiet + Klingengeist als Sondergeist {d['rs']}")
    check(4 <= len(d['area']['table']) <= 7 and any(e[0] == 'oniasche' for e in d['area']['table']), f"Aschehang-Tabelle {d['area']['table']}")
    # --- Trainer-Teams wie im Entwurf
    t = ev("Object.fromEntries(['ronin','schattenklinge','kettenwaechter','klingenmeister'].map(k=>[k,G.TRAINERS[k].team.map(x=>x[0])]))")
    check(t['ronin'] == ['faustbiber', 'aschmotte', 'kohlenbaer'] and t['schattenklinge'] == ['funkenfalke', 'schlickaal', 'surrlibelle', 'pilzhexe']
          and set(t['kettenwaechter']) >= {'kieselkroete', 'moorkeiler'} and t['klingenmeister'][:3] == ['essenbaer', 'glutfaehe', 'gewitterkauz'] and t['klingenmeister'][3] in ('onigluetfuerst', 'klingengeist'), f"Teams {t}")
    # --- Karte
    m = ev("""(()=>{const M=G.MAPS.aschehang, cnt=c=>M.tiles.flat().filter(x=>x===c).length; return {w:M.w,h:M.h,music:M.music,theme:M.theme,
      torii:cnt('I'), cherry:cnt('C'), chains:cnt('K'), shrine:cnt('Q'), ember:cnt('E'), grass:cnt('a'), pier:cnt('b')};})()""")
    check(m['w'] == 30 and m['h'] == 64 and m['music'] == 'none' and m['theme'] == 'asche', f"Karte Aschehang, ohne Musik {m}")
    check(m['torii'] >= 2 and m['cherry'] >= 2 and m['chains'] >= 4 and m['shrine'] == 2 and m['ember'] >= 8 and m['grass'] > 100 and m['pier'] >= 5, f"Abschnitte: Torii, Kirschbäume, Ketten, Schrein, Glutnester {m}")
    # --- Prolog-Ende: Wenke → Überfahrt
    ev(setp('kueste', 15, 17, 8)); pg.wait_for_timeout(400); ev("G.P.dir='down'"); A()
    check('Ablegen' in txt(), f"Wenke fragt nach dem Ablegen «{txt()[:60]}»")
    choose('Ja'); drain(80, until=lambda: ev("G.map.id==='aschehang' && G.lock===0"))
    check(ev("G.map.id") == 'aschehang' and ev("G.state.flags.story") == 9 and ev("[G.P.x,G.P.y]") == [15, 58], f"Überfahrt zur Rauchbucht {ev('G.map.id')} {ev('G.state.flags.story')}")
    check(ev("G.World.areaMusic()") == 'none', "keine Musik am Aschehang")
    pg.wait_for_timeout(600); pg.screenshot(path='/workspace/shots_v20/t_rauchbucht.png')
    check(ev("G.Map.state().here") == 'aschehang' and ev("G.Map.state().open.aschehang"), "Übersichtskarte: Nebelinsel/Aschehang")
    # Hanne
    ev("G.World.place(11,55,'up')"); pg.wait_for_timeout(300); A(); s = drain()
    check('Letzte Nacht hat der Berg geschrien.' in s, "Fischerin Hanne: «Letzte Nacht hat der Berg geschrien.»")
    ev("G.state.team[0].hp=5"); choose('Ja'); drain()
    check(ev("G.state.team[0].hp") > 5 and ev("G.state.respawn.map") == 'aschehang', "Hanne heilt am Feuer, Rückkehrpunkt Rauchbucht")
    # Glutnest
    ev("G.World.place(21,24,'left')"); pg.wait_for_timeout(300); h0 = ev("G.state.team[0].hp"); mx = ev("G.stats(G.state.team[0]).hp"); key('ArrowLeft'); pg.wait_for_timeout(300)
    h1 = ev("G.state.team[0].hp"); drain()
    check(ev("[G.P.x,G.P.y]") == [20, 24] and 1 <= h0 - h1 <= max(2, round(mx * 0.06)), f"Glutnest kostet wenig KP {h0}->{h1} (max {mx})")
    # Atmosphäre: Funken/Asche laufen, Knistern
    pg.wait_for_timeout(800)
    a = ev("({ash:G.World.ah.ash.length, sparks:G.World.ah.sparks.length, hearth:G.Snd&&G.Snd.lastAmb?G.Snd.lastAmb.hearth:null})")
    check(a['ash'] > 10 and a['sparks'] > 0, f"Asche und Funken {a}")
    # Ronin-Wegsperre: Hinterhalt
    ev("G.World.place(14,45,'up')"); pg.wait_for_timeout(300); key('ArrowUp', 2); pg.wait_for_timeout(1200)
    drain(40, until=lambda: ev("G.mode==='battle'"))
    check(ev("G.mode") == 'battle' and ev("G.B.trainer") == 'ronin', "Ronin stellt sich auf der Laternenstiege in den Weg")
    pg.screenshot(path='/workspace/shots_v20/t_ronin.png')
    win_battle()
    check(ev("G.state.flags.t_ronin") == 1 and ev("G.state.flags.story") == 10 and ev("G.map.npcs.find(n=>n.id==='roninB').show()") and not ev("G.map.npcs.find(n=>n.id==='ronin').show()"), "Ronin besiegt → tritt beiseite, Ziel Glutgarten")
    # Schriftrolle
    ev("G.World.place(6,16,'up')"); pg.wait_for_timeout(300); key('ArrowUp'); s = drain()
    check('Ketten selbst gelöst' in s and ev("G.state.items.schriftrolle") == 1, "Hinweis: verkohlte Schriftrolle «… er hat die Ketten selbst gelöst»")
    # Schattenklinge + Kettenwächter (Kampf auf Wunsch)
    ev("G.state.flags.t_schattenklinge=1; G.state.flags.story=11; G.World.place(15,12,'up')"); pg.wait_for_timeout(300); A()
    s = drain(20, until=lambda: ev("!document.getElementById('choices').className.includes('hidden')"))
    check('Haupttor' in s, "Kettenwächter am Haupttor (Kampf auf Nachfrage)")
    choose('Ja')
    drain(40, until=lambda: ev("G.mode==='battle'")); win_battle()
    check(ev("G.state.flags.story") == 12 and ev("G.map.npcs.find(n=>n.id==='kettenwaechterB').show()"), "Kettenwächter besiegt → Tor frei")
    # Dojo betreten, Klingenmeister (Boss-Musik)
    ev("G.World.place(15,11,'up')"); pg.wait_for_timeout(300); key('ArrowUp'); s = drain()
    check(ev("G.state.flags.dojoIn") == 1 and 'Schrein' in s, "Brennendes Dojo betreten")
    ev("G.World.place(15,5,'up')"); pg.wait_for_timeout(500); pg.screenshot(path='/workspace/shots_v20/t_dojo.png'); A(); drain(40, until=lambda: ev("G.mode==='battle'"))
    check(ev("G.mode") == 'battle' and ev("G.B.trainer") == 'klingenmeister' and ev("G.B.boss") and ev("G.Snd.want") == 'boss', f"Klingenmeister: Bosskampf mit Musik {ev('G.Snd.want')}")
    LOG.clear(); win_battle()
    s = ' '.join(LOG) + ' ' + drain(200, until=lambda: ev("G.state.flags.story===13 && G.lock===0"))
    check('Er war es nicht' in s and 'gehörnte' in s, "Finale: «Er war es nicht … es war das, was er gerufen hat.» + gehörnte Silhouette")
    check(ev("G.state.flags.dojoEnd") == 1 and ev("G.state.items.maskensplitter") == 1 and not ev("G.map.npcs.find(n=>n.id==='klingenmeister').show()"), "danach: ruhiger Zustand, Maskensplitter, Klingenmeister fort")
    check(not ev("Object.keys(G.TRAINERS).some(k=>/kurogane/i.test(k))"), "Kurogane wird (noch) nicht bekämpft")
    h0 = ev("G.state.team[0].hp"); ev("G.World.place(21,24,'left')"); pg.wait_for_timeout(300); key('ArrowLeft'); pg.wait_for_timeout(300)
    check(ev("G.state.team[0].hp") == h0, "nach dem Finale brennt die Glut nicht mehr")
    check(ev("G.World.rareCond.ember(G.map,20,23)") is True, "seltener Klingengeist neben Glutnestern nach dem Finale")
    pg.wait_for_timeout(500); pg.screenshot(path='/workspace/shots_v20/t_ruhig.png')
    # Rückfahrt
    ev("G.World.place(16,57,'down')"); pg.wait_for_timeout(300); A(); choose('Ja'); drain(80, until=lambda: ev("G.map.id==='kueste' && G.lock===0"))
    check(ev("G.map.id") == 'kueste' and ev("G.state.flags.shipAt") == 'kueste', "Wenke segelt zurück nach Eldenghost")
    # Signatur-Kämpfe
    ok = []
    for sp, mv in [('klingengeist', 'geisterklinge'), ('oniasche', 'onifaust')]:
        e0 = len(errors); pg.reload(); pg.wait_for_timeout(1800)
        ev(setp('dorf', 16, 7, 4, team=f"(()=>{{const m=G.makeMon('{sp}',22); m.moves=['{mv}']; G.fillPP(m); return m;}})()"))
        ev("void G.debug.wild('kieselgeist',40,['haerten']).catch(()=>0)")
        for _ in range(200):
            if ev("G.UI.kind==='choose' && [...document.querySelectorAll('#choices .ch')].some(e=>e.textContent.trim()==='Kampf')"): break
            if ev("G.UI.kind==='say'"): pg.keyboard.press('Space')
            pg.wait_for_timeout(80)
        choose('Kampf'); pg.wait_for_timeout(200)
        a1 = ev(f"(()=>{{const e=[...document.querySelectorAll('#choices .ch')].find(e=>e.textContent.includes(G.MOVES['{mv}'].name)); if(!e) return false; e.click(); return true;}})()")
        pg.wait_for_timeout(1700); ok.append((sp, a1 and len(errors) == e0))
    check(all(x[1] for x in ok), f"Signatur-Attacken laufen fehlerfrei {ok}")
    check(not errors, f"keine Konsolenfehler {errors[:5]}")
    b.close()
print("FAILS:", len(fails)); sys.exit(1 if fails else 0)
