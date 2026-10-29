"""v19: 15 neue Geister (+2 Entwicklungen) – Daten, Lernsets, Sprites, Gebiete (Gewitterkauz nur nachts), Signatur-Attacken mit eigener Animation."""
import sys, json
from playwright.sync_api import sync_playwright
URL = sys.argv[1] if len(sys.argv) > 1 else "http://localhost:8080/index.html?touch=1"
SIG = {'aschmotte': 'glutstaub', 'kohlenbaer': 'kohlenpranke', 'funkenfalke': 'funkensturz', 'nebelqualle': 'quellnebel', 'strudelhecht': 'hechtsprung',
       'gewitterkauz': 'donnerruf', 'surrlibelle': 'surrflug', 'moosschnecke': 'schneckenhaus', 'pilzhexe': 'hexensporen', 'kieselkroete': 'kieselspucke',
       'geodenwidder': 'hornramme', 'traumfalter': 'schlummerlicht', 'schlickaal': 'schlickschlinge', 'faustbiber': 'kellenschlag', 'grabmaulwurf': 'grabschaufel'}
TYPES = {'aschmotte': 'Feuer', 'kohlenbaer': 'Feuer', 'funkenfalke': 'Feuer', 'nebelqualle': 'Wasser', 'strudelhecht': 'Wasser', 'gewitterkauz': 'Elektro',
         'surrlibelle': 'Elektro', 'moosschnecke': 'Pflanze', 'pilzhexe': 'Pflanze', 'kieselkroete': 'Stein', 'geodenwidder': 'Stein', 'traumfalter': 'Psycho',
         'schlickaal': 'Gift', 'faustbiber': 'Kampf', 'grabmaulwurf': 'Boden'}
ROLE = {'aschmotte': 'Status', 'kohlenbaer': 'Tank', 'funkenfalke': 'Speedster', 'nebelqualle': 'Support', 'strudelhecht': 'Sweeper', 'gewitterkauz': 'Sweeper',
        'surrlibelle': 'Speedster', 'moosschnecke': 'Tank', 'pilzhexe': 'Status', 'kieselkroete': 'Tank', 'geodenwidder': 'Bruiser', 'traumfalter': 'Support',
        'schlickaal': 'Status', 'faustbiber': 'Bruiser', 'grabmaulwurf': 'Bruiser'}
SET = ("G.demo=true; G.state={v:6,map:'dorf',player:{x:16,y:7,dir:'down'},team:[%s],box:[],items:{laterne:0,kraeutertee:0},flags:{q1:1,story:4,tour:1},seen:{},caught:{},respawn:null,playtime:0,money:150};"
       "G.UI.title(false); G.UI.kind=null; G.UI.handler=null; document.getElementById('choices').className='hidden'; G.mode='world'; G.lock=0; G.debugEncounterRate=1e-9; G.World.setMap('dorf',16,7,'down');")
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
    check(ev("fetch('sw.js').then(r=>r.text()).then(t=>/eldenghost-v(19|2[0-9])/.test(t))"), 'Cache eldenghost-v19')
    d = ev("""(sig)=>{const ids=Object.keys(sig), all=[...ids,'essenbaer','drusenbock'], TY=new Set(); for(const k in G.MOVES) TY.add(G.MOVES[k].type);
      return {all, missing: all.filter(k=>!G.SPECIES[k]), new19: G.NEW19,
        order: all.filter(k=>!G.SPECIES_ORDER.includes(k)), types: Object.fromEntries(ids.map(k=>[k,G.SPECIES[k].type])), typeOk: ids.every(k=>TY.has(G.SPECIES[k].type)),
        roles: Object.fromEntries(all.map(k=>[k,G.SPECIES[k].role])), desc: all.filter(k=>!(G.SPECIES[k].desc||'').trim() || G.SPECIES[k].desc.length<30),
        spr: all.filter(k=>!(G.SPR.mon[k] && G.SPR.mon[k].img && G.SPR.mon[k].back)),
        evo: [G.SPECIES.kohlenbaer.evo, G.SPECIES.geodenwidder.evo],
        learn: Object.fromEntries(all.map(k=>[k,G.SPECIES[k].learn.map(([l,m])=>[l,m,G.MOVES[m]?G.MOVES[m].type:'?',G.MOVES[m]?G.MOVES[m].power||0:0])])),
        base: Object.fromEntries(all.map(k=>[k,G.SPECIES[k].base])), fx: Object.keys(sig).map(k=>sig[k]).filter(m=>!G.Battle.MOVE_FX[m] || !G.MOVES[m]),
        fxms: Object.values(sig).map(m=>G.Battle.MOVE_FX[m]&&G.Battle.MOVE_FX[m].ms),
        fxUnique: new Set(Object.keys(G.Battle.MOVE_FX).map(k=>G.Battle.MOVE_FX[k].fn.toString())).size===Object.keys(G.Battle.MOVE_FX).length,
        sigOwner: Object.values(sig).map(m=>Object.keys(G.SPECIES).filter(s=>G.SPECIES[s].learn.some(x=>x[1]===m)))};}""", SIG)
    check(not d['missing'] and sorted(d['new19']) == sorted(d['all']), f"17 neue Arten vorhanden {d['missing']}")
    check(not d['order'], f"alle in der Chronik-Reihenfolge {d['order']}")
    check(d['types'] == TYPES and d['typeOk'], f"Typen wie gewünscht und im Spiel vorhanden {d['types']}")
    check(all(d['roles'][k] == ROLE[k] for k in ROLE) and d['roles']['essenbaer'] == 'Tank' and d['roles']['drusenbock'] == 'Bruiser', f"Rollen {d['roles']}")
    check(not d['desc'], f"Chronik-Text (deutsch) für alle {d['desc']}")
    check(not d['spr'], f"Front- und Rückensprite für alle {d['spr']}")
    check(d['evo'][0] == {'to': 'essenbaer', 'lvl': 20} and d['evo'][1] == {'to': 'drusenbock', 'lvl': 20}, f"Entwicklungen {d['evo']}")
    bad = []
    for k, L in d['learn'].items():
        if any(l < 8 and t != 'Neutral' for l, m, t, pw in L): bad.append((k, 'Typ<8'))
        st = [l for l, m, t, pw in L if t == d['types'].get(k, t) and pw > 0]
        if k in SIG and (not st or min(st) not in (8, 9)): bad.append((k, 'STAB', st))
    check(not bad, f"Lernsets: unter Lv 8 nur Neutral, erste STAB-Attacke Lv 8/9 {bad}")
    bad = []
    for k, bs in d['base'].items():
        v = [bs['hp'], bs['atk'], bs['def'], bs['spd']]; mean = sum(v) / 4
        if not (150 <= sum(v) <= 330) or any(x < 0.7 * mean or x > 1.35 * mean for x in v): bad.append((k, v))
    check(not bad, f"Basiswerte moderat (70–135 % vom Mittel) {bad}")
    check(not d['fx'] and all(1 <= m <= 3000 for m in d['fxms']) and d['fxUnique'], f"jede Signatur-Attacke mit eigener Animation ≤ 3 s {d['fx']} {d['fxms']}")
    check(all(len(o) >= 1 and all(s in SIG or s in ('essenbaer', 'drusenbock') for s in o) for o in d['sigOwner']), f"Signatur nur in der eigenen Linie {d['sigOwner']}")
    # --- Gebiete
    z = ev("""(ids)=>{const out={}, sizes={}; for (const id in G.WILD_AREAS){const t=G.WILD_AREAS[id].table; sizes[id]=t.length; for(const e of t){(out[e[0]]=out[e[0]]||[]).push(id+(e[2]?':'+e[2]:''));}}
      const rare=G.RARE_SPAWNS.map(r=>[r.zone,r.sp||r.species||r.id]); return {where:Object.fromEntries(ids.map(k=>[k,out[k]||[]])), sizes};}""", list(SIG))
    check(all(z['where'][k] for k in SIG), f"jeder neue Geist ist fangbar {z['where']}")
    check(all(4 <= n <= 9 for n in z['sizes'].values()), f"Gebietstabellen 4–9 Einträge (v21) {z['sizes']}")
    check(z['where']['gewitterkauz'] == ['moorherz:night'], f"Gewitterkauz nur nachts im Moorherz {z['where']['gewitterkauz']}")
    ev(SET % "G.makeMon('flackerling',30)"); pg.wait_for_timeout(300)
    n = ev("""(()=>{const D=G.dusk, A=G.WILD_AREAS.moorherz, r={}; G.dusk=()=>0.1; r.day=G.tableNow(A).some(e=>e[0]==='gewitterkauz'); G.dusk=()=>0.8; r.night=G.tableNow(A).some(e=>e[0]==='gewitterkauz');
      const fs=G.Battle.start, got=[]; G.Battle.start=o=>{got.push(o.team[0].sp||o.team[0].species); return Promise.resolve();}; const R=Math.random;
      G.dusk=()=>0.1; for(let i=0;i<300;i++) G.World.encounter('moorherz'); r.dayHits=got.filter(s=>s==='gewitterkauz').length; got.length=0;
      G.dusk=()=>0.8; for(let i=0;i<300;i++) G.World.encounter('moorherz'); r.nightHits=got.filter(s=>s==='gewitterkauz').length; r.sample=got.slice(0,3);
      G.Battle.start=fs; G.dusk=D; Math.random=R; return r;})()""")
    check(n['day'] is False and n['night'] is True and n['dayHits'] == 0 and n['nightHits'] > 0, f"Tag/Nacht-Filter wirkt auch bei echten Begegnungen {n}")
    # Wilde Geister unter Lv 8 nur mit neutralen Attacken
    r = ev("(ids)=>ids.filter(k=>G.makeMon(k,6).moves.some(m=>G.MOVES[m].type!=='Neutral'))", list(SIG))
    check(not r, f"Lv 6: nur neutrale Attacken {r}")
    r = ev("(ids)=>ids.filter(k=>!G.makeMon(k,12).moves.includes(({aschmotte:'glutstaub'})[k]||G.SPECIES[k].learn.find(x=>x[0]===10)[1]))", list(SIG))
    check(not r, f"Lv 12 kennt die Signatur-Attacke (Lv 10) {r}")
    # Entwicklung
    # --- Kämpfe mit jeder Signatur
    def to_menu(limit=200, world_ok=False):
        for _ in range(limit):
            st = ev("({k:G.UI.kind, b:!!G.B, t:[...document.querySelectorAll('#choices .ch')].map(e=>e.textContent.trim()).join('|')})")
            if st['k'] == 'choose' and 'Kampf' in st['t']: return True
            if world_ok and not st['b'] and ev("G.mode==='world'"): return True
            if st['k'] == 'say': pg.keyboard.press('Space')
            pg.wait_for_timeout(80)
        return False
    def end_battle():
        ev("if (G.B) { G.B.enemy.hp = 0; }")
        for _ in range(500):
            if ev("G.mode==='world' && !G.B && G.lock===0"): break
            st = ev("G.UI.kind")
            if st == 'say': pg.keyboard.press("Space")
            elif st == 'choose': ev("(()=>{const e=[...document.querySelectorAll('#choices .ch')].find(e=>/^Kampf$/.test(e.textContent.trim()))||document.querySelector('#choices .ch'); e&&e.click();})()")
            pg.wait_for_timeout(80)
    ok = []
    for sp, mv in SIG.items():
        e0 = len(errors)
        pg.reload(); pg.wait_for_timeout(1800)
        ev(SET % f"(()=>{{const m=G.makeMon('{sp}',22); m.moves=['{mv}']; G.fillPP(m); return m;}})()")
        ev("void G.debug.wild('kieselgeist',40,['haerten']).catch(()=>0)")
        a = to_menu()
        ev("(()=>{const e=[...document.querySelectorAll('#choices .ch')].find(e=>/^Kampf$/.test(e.textContent.trim())); e&&e.click();})()"); pg.wait_for_timeout(200)
        a = a and ev(f"(()=>{{const e=[...document.querySelectorAll('#choices .ch')].find(e=>e.textContent.includes(G.MOVES['{mv}'].name)); if(!e) return false; e.click(); return true;}})()")
        b2 = to_menu(world_ok=True)
        if sp == 'gewitterkauz': pg.screenshot(path='/workspace/shots_v19/kampf_gewitterkauz.png')
        ok.append((sp, a and b2 and len(errors) == e0)); print('  Kampf', sp, mv, a, b2, flush=True)
        end_battle()
    check(all(x[1] for x in ok), f"Kampf mit jeder Signatur-Attacke läuft fehlerfrei {[x for x in ok if not x[1]]}")
    # Chronik zeigt neue Geister
    ev(SET % "G.makeMon('flackerling',9)"); ev("G.state.seen={aschmotte:1,gewitterkauz:1,drusenbock:1}; G.state.caught={aschmotte:1};")
    ev("void G.Menu.chronik().catch(()=>0)"); pg.wait_for_timeout(600)
    t = ev("document.body.innerText")
    check('Aschmotte' in t and 'Gewitterkauz' in t, "Chronik listet neue Geister")
    pg.screenshot(path='/workspace/shots_v19/chronik.png')
    check(not errors, f"keine Konsolenfehler {errors[:5]}")
    b.close()
print("FAILS:", len(fails)); sys.exit(1 if fails else 0)
