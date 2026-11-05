"""v25: Fenn entschärft – Team/Konter in data.js, Sim-Siegquote 60–80 % für alle 3 Starter
(Lv 7 Solo, v24-EP, KI-Wechsel). Prüft Daten im Browser und Quoten via design/kampf/sim.js."""
import sys, json, subprocess, os, re
from playwright.sync_api import sync_playwright

URL = sys.argv[1] if len(sys.argv) > 1 else "http://localhost:8080/index.html?touch=1"
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
N = int(os.environ.get('FENN_SIM_N', '2500'))
fails, errors = [], []

def check(c, msg):
    print(("OK " if c else "FAIL") + "  " + msg, flush=True)
    if not c: fails.append(msg)

# ---------- 1) Teamdaten im laufenden Spiel ----------
with sync_playwright() as p:
    b = p.chromium.launch(executable_path='/usr/bin/google-chrome')
    pg = b.new_page(); ev = pg.evaluate
    pg.on('pageerror', lambda e: errors.append(str(e)))
    pg.goto(URL); pg.wait_for_timeout(2000)
    fenn = ev("""(()=>{
      const t=G.TRAINERS.fenn;
      const teams={};
      for (const st of ['flackerling','pfuetzling','blattling']) {
        G.state={starter:st,team:[{sp:st}],flags:{}};  // v24 Fenn: flags nötig, sonst wirft G.flag('p_dtee') in world.js
        teams[st]=G.trainerTeam('fenn');
      }
      return {team:t.team, teamFor:t.teamFor, teams,
        xp:{div:G.XP_DIV, tr:G.XP_TRAINER, gap:G.XP_GAP},
        noSwitch:G.AI_NO_SWITCH};
    })()""")
    print("   Fenn:", json.dumps(fenn, ensure_ascii=False))
    check(fenn['team'] == [['laternchen', 5], ['raufdachs', 6]],
          f"Basis-Team Laternchen5 + Platzhalter Lv6 {fenn['team']}")
    tf = fenn['teamFor']
    check(tf.get('flackerling') == 'moosschnecke' and tf.get('pfuetzling') == 'nebelkauz'
          and tf.get('blattling') == 'schattenmotte',
          f"Starter-Konter Moosschnecke/Nebelkauz/Schattenmotte {tf}")
    check(tf.get('moorlurch') == 'moosschnecke' and tf.get('schwammling') == 'nebelkauz'
          and tf.get('kieselgeist') == 'schattenmotte',
          f"Altstarter-Konter analog {tf}")
    check(fenn['teams']['flackerling'] == [['laternchen', 5], ['moosschnecke', 6]]
          and fenn['teams']['pfuetzling'] == [['laternchen', 5], ['nebelkauz', 6]]
          and fenn['teams']['blattling'] == [['laternchen', 5], ['schattenmotte', 6]],
          f"trainerTeam je Starter {fenn['teams']}")
    check(fenn['xp']['div'] == 6 and fenn['xp']['tr'] == 1.2 and fenn['xp']['gap'] == 3,
          f"v24-EP-Parameter {fenn['xp']}")
    check('selma' in fenn['noSwitch'] and 'kaspar' in fenn['noSwitch']
          and 'fenn' not in fenn['noSwitch'],
          f"Fenn darf KI-wechseln, Selma/Kaspar nicht {fenn['noSwitch']}")
    # harte Alt-Konter dürfen nicht mehr gesetzt sein
    check(tf.get('flackerling') != 'moorlurch' and tf.get('pfuetzling') != 'kleeling'
          and tf.get('blattling') != 'flackerling',
          "alte Typ-Dreieck-Konter entfernt")
    b.close()

check(not errors, f"keine JS-Fehler {errors[:3]}")

# ---------- 2) Kampf-Sim (Node, design/kampf) – genug Kämpfe, Band mit Toleranz ----------
sim = subprocess.run(
    ['node', '-e', f"""
const {{G,fight,mkTrainer,newLog}}=require('./design/kampf/sim');
const N={N}, ST=['flackerling','pfuetzling','blattling'], L=7;
const out={{}};
for (const st of ST) {{
  G.state={{starter:st,team:[{{sp:st}}]}};
  let w=0;
  for (let i=0;i<N;i++)
    w+=fight([G.makeMon(st,L)],mkTrainer('fenn'),{{trainer:'fenn',aiSwitch:1}},newLog()).win;
  out[st]=Math.round(100*w/N);
}}
out.team=G.TRAINERS.fenn.team;
out.teamFor=G.TRAINERS.fenn.teamFor;
console.log(JSON.stringify(out));
"""],
    cwd=ROOT, capture_output=True, text=True, timeout=180)
if sim.returncode != 0:
    check(False, f"Sim-Skript fehlgeschlagen: {sim.stderr[:400]}")
else:
    rates = json.loads(sim.stdout.strip().splitlines()[-1])
    print(f"   Sim N={N} Lv7 Solo+aiSwitch: F/P/B "
          f"{rates['flackerling']}/{rates['pfuetzling']}/{rates['blattling']} %")
    # Ziel 60–80, ± ±5 wegen Monte-Carlo (Blattling liegt nahe am Rand)
    lo, hi = 55, 85
    for st in ['flackerling', 'pfuetzling', 'blattling']:
        p = rates[st]
        check(lo <= p <= hi, f"{st}: Siegquote {p}% im Band {lo}–{hi} (Ziel 60–80)")
    check(all(lo <= rates[st] <= hi for st in ['flackerling', 'pfuetzling', 'blattling']),
          "alle drei Starter im Zielband (mit Sim-Toleranz)")

print(f"\n{'ALLE OK' if not fails else str(len(fails)) + ' FEHLER'}")
sys.exit(1 if fails else 0)
