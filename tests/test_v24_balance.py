"""v24: Geister-Verteilung + Levelkurve der Wildgeister (design/kampf/verteilung_neu.js), EP-Kurve (Teiler 6, Trainer ×1.2,
Level-Abstand ^3), frühe Taktik-Attacken der Starter. Selma/Kaspar unverändert."""
import sys, json, subprocess, os
from playwright.sync_api import sync_playwright
URL = sys.argv[1] if len(sys.argv) > 1 else "http://localhost:8080/index.html?touch=1"
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
fails, errors = [], []
def check(c, msg):
    print(("OK " if c else "FAIL") + "  " + msg, flush=True)
    if not c: fails.append(msg)
# Soll-Tabellen direkt aus dem Design-Skript (eine Quelle der Wahrheit)
NEU = json.loads(subprocess.run(['node', '-e', "console.log(JSON.stringify(require('./design/kampf/verteilung_neu.js')))"], cwd=ROOT, capture_output=True, text=True).stdout)
norm = lambda t: sorted([e[0], e[1], e[2] if len(e) > 2 and e[2] else '', e[3] if len(e) > 3 else ''] for e in t)
with sync_playwright() as p:
    b = p.chromium.launch(executable_path='/usr/bin/google-chrome')
    pg = b.new_page(); ev = pg.evaluate
    pg.on('pageerror', lambda e: errors.append(str(e)))
    pg.goto(URL); pg.wait_for_timeout(2000)
    # ---------- 1) Wildgeister ----------
    W = ev("Object.fromEntries(G.ZONE_ORDER.map(z=>[z,{lvl:G.WILD_AREAS[z].lvl,rate:G.WILD_AREAS[z].rate,table:G.WILD_AREAS[z].table}]))")
    for z, a in NEU.items():
        check(W[z]['lvl'] == a['lvl'] and W[z]['rate'] == a['rate'] and norm(W[z]['table']) == norm(a['table']), f"{z}: Level {W[z]['lvl']}, Rate und Tabelle = verteilung_neu.js")
    zl = [W[z]['lvl'] for z in ev("G.ZONE_ORDER")]
    check(all(zl[i][0] <= zl[i + 1][0] and zl[i][1] <= zl[i + 1][1] for i in range(len(zl) - 1)), f"Level-Bänder steigen entlang der Geschichte {zl}")
    check(all(a[1] - a[0] <= 3 for a in zl), "Level-Bänder höchstens 3 Level breit (stringente Zuweisung)")
    unk = ev("Object.values(G.WILD_AREAS).flatMap(a=>a.table).filter(e=>!G.SPECIES[e[0]] || G.SPECIES[e[0]].boss).map(e=>e[0])")
    check(not unk, f"alle Wildgeister existieren, keine Bosse {unk}")
    dn = ev("""(()=>{const D=G.dusk, A=G.WILD_AREAS.nebelgras, t=()=>G.tableNow(A).map(e=>e[0]), r={};
      G.dusk=()=>0.1; r.day=t(); G.dusk=()=>0.9; r.night=t(); G.dusk=D; return r;})()""")
    check('moosschnecke' in dn['day'] and 'moosschnecke' not in dn['night'] and 'laternchen' in dn['night'] and 'laternchen' not in dn['day'], f"Tag/Nacht wirkt im Nebelgras {dn}")
    late = ev("""(()=>{const r=[]; for (const [z,a] of Object.entries(G.WILD_AREAS)) for (const e of a.table) if (G.typesOf(e[0]).includes('Drache')) r.push([z,e[0],e[2]||'',e[3]||a.lvl]); return r;})()""")
    check(all(c and l[0] >= 14 for _, _, c, l in late), f"Drache selten und spät (nur mit Bedingung, ab Lv 14) {late}")
    fr = ev("Object.fromEntries(['moorlurch','moorunke','kieselkroete','pechunke','teerkroete'].map(f=>[f,Object.entries(G.WILD_AREAS).filter(([z,a])=>a.table.some(e=>e[0]===f)).map(([z])=>z)]))")
    check(fr == {'moorlurch': ['kuestengras'], 'moorunke': ['schilfrand', 'torfstich'], 'kieselkroete': ['hoehle'], 'pechunke': ['schilfrand', 'moorherz'], 'teerkroete': []} or all(sorted(fr[k]) == sorted(v) for k, v in {'moorlurch': ['kuestengras'], 'moorunke': ['schilfrand', 'torfstich'], 'kieselkroete': ['hoehle'], 'pechunke': ['schilfrand', 'moorherz'], 'teerkroete': []}.items()), f"Frösche: Gebiete wie geplant, Teerkröte nur via Entwicklung {fr}")
    rs = ev("G.RARE_SPAWNS.map(r=>r.zone).filter(z=>!G.WILD_AREAS[z])")
    check(not rs, f"seltene Begegnungen zeigen auf existierende Gebiete {rs}")
    # Begegnung im echten Weltcode: Level im Band und unter der Kappe
    enc = ev("""(()=>{const keep=G.state; G.state={v:6,map:'dorf',player:{x:16,y:7,dir:'down'},team:[G.makeMon('flackerling',20)],box:[],items:{},flags:{},seen:{},caught:{},playtime:0,money:0};
      const out=[], st=G.Battle.start; G.Battle.start=o=>{out.push(o.rare?-1:o.team[0].lvl); return Promise.resolve();};
      try { for (let i=0;i<300;i++) G.World.encounter('torfstich'); } finally { G.Battle.start=st; G.state=keep; } return out;})()""")
    norm_l = [l for l in enc if l > 0]
    check(norm_l and set(norm_l) <= {10, 11, 12}, f"echte Begegnungen im Torfstich nur Lv 10–12 {sorted(set(enc))}")
    # ---------- 2) EP-Kurve ----------
    xp = ev("""(()=>{const tr=G.B; G.B=null; const en=G.makeMon('tauhase',10), r={div:G.XP_DIV, trf:G.XP_TRAINER, gap:G.XP_GAP,
      plain:G.xpGain(en), same:G.xpGain(en,{lvl:10}), over:G.xpGain(en,{lvl:16}), under:G.xpGain(en,{lvl:6})};
      G.B={tr:{}}; r.trainer=G.xpGain(en,{lvl:10}); G.B=tr; r.base=G.SPECIES.tauhase.xp; return r;})()""")
    base = xp['base'] * 10 / 6
    check(xp['div'] == 6 and xp['trf'] == 1.2 and xp['gap'] == 3, f"EP-Parameter Teiler 6, Trainer ×1.2, Abstand ^3 {xp}")
    check(xp['plain'] == int(base) and xp['same'] == int(base), "gleiches Level: EP = floor(xp × L / 6)")
    check(xp['over'] < xp['same'] < xp['under'], "überlegene Geister bekommen weniger, unterlegene mehr EP")
    check(xp['trainer'] == int(xp['base'] * 10 / 6 * 1.2), "Trainer-Bonus ×1.2")
    check(ev("G.xpShares([{hp:10},{hp:5},{hp:0}], new Set([0]), 100)") == [100, 65, 0], "Bank-Anteil bleibt 65 %, erschöpfte 0")
    curve = subprocess.run(['node', 'ep_kurve.js', '6', '1.2', '0.65', '6', 'neu', '3'], cwd=os.path.join(ROOT, 'design/kampf'), capture_output=True, text=True).stdout
    lv = {l.split()[0]: float(l.split('Ø')[1].split()[0]) for l in curve.splitlines()[1:] if 'Starter' in l}
    print("   EP-Sim (3 Geister, 6 Wildkämpfe/Gebiet):", lv)
    check(18.5 <= lv.get('klingenmeister', 99) <= 22, f"Klingenmeister mit ~Lv 19–21 statt 26 erreicht ({lv.get('klingenmeister')})")
    check(13 <= lv.get('kaspar', 99) <= 17 and 11 <= lv.get('selma', 99) <= 14, f"Kaspar/Selma 1–3 Level über dem Ass ({lv.get('kaspar')}, {lv.get('selma')})")
    # ---------- 3) frühe Entscheidungstiefe ----------
    mv = ev("Object.fromEntries(['flackerling','pfuetzling','blattling'].map(s=>[s,[5,7,9,12].map(l=>G.makeMon(s,l).moves)]))")
    new = {'flackerling': 'heuler', 'pfuetzling': 'morgentau', 'blattling': 'einrollen'}
    for s, m in new.items():
        check(m in mv[s][0] and m in mv[s][1] and m not in mv[s][2], f"{s}: {m} ab Start bis Lv 7, ab Lv 9 Standard-Set wie vorher {mv[s]}")
    check(ev("['heuler','morgentau','einrollen'].every(id=>G.isNeutral(id))"), "neue frühe Attacken sind typenlos (Regel: Typ-Attacken erst ab Lv 8)")
    old9 = {'flackerling': ['schwanzhieb', 'fauchen', 'krallenhieb', 'irrfeuer'], 'pfuetzling': ['platscher', 'aufplustern', 'pickser', 'wasserstrahl'], 'blattling': ['flatterstoss', 'starren', 'knabbern', 'blattwirbel']}
    check(all(mv[s][2] == old9[s] for s in old9), "Starter-Sets ab Lv 9 unverändert (Selma/Kaspar-Quoten bleiben)")
    # ---------- 4) Selma und Kaspar unverändert ----------
    tr = ev("['selma','kaspar'].map(k=>[G.trainerTeam(k), G.AI_NO_SWITCH.includes(k)])")
    check(tr[0] == [[['nebelkauz', 9], ['moorlurch', 10]], True] and tr[1] == [[['grabfalter', 12], ['raufdachs', 12], ['hauchling', 13]], True], f"Selma/Kaspar: Teams unverändert, kein KI-Wechsel {tr}")
    check(ev("G.TRAINERS.klingenmeister.team.map(t=>t[1]).join('/')") == '16/16/17/18', "Klingenmeister bleibt 16/16/17/18")
    b.close()
check(not errors, f"keine JS-Fehler {errors[:3]}")
print(f"\n{'ALLE OK' if not fails else str(len(fails)) + ' FEHLER'}")
sys.exit(1 if fails else 0)
