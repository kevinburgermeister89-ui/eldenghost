"""v22: Story-Lektorat – Kaspar am Kettenhof (Binden → Trösten), Brann erkennt den Maskensplitter (Mondglas), Selma als Schwester, Krallen einheitlich."""
import sys
from playwright.sync_api import sync_playwright
URL = sys.argv[1] if len(sys.argv) > 1 else "http://localhost:8080/index.html?touch=1"
fails, errors = [], []
def check(c, msg):
    print(("OK " if c else "FAIL") + "  " + msg, flush=True)
    if not c: fails.append(msg)
STUB = """window.__said=[]; G.UI.say=async t=>{__said.push(t)}; G.UI.sayAll=async L=>{__said.push(...L)}; G.UI.hideText=()=>{};"""
def state(flags, items="{}"):
    return ("G.demo=true; G.state={v:6,map:'aschehang',player:{x:8,y:12,dir:'left'},team:[G.makeMon('glutfaehe',30)],box:[],items:%s,flags:%s,seen:{},caught:{},respawn:null,playtime:0,money:150};" % (items, flags))
with sync_playwright() as p:
    b = p.chromium.launch(executable_path='/usr/bin/google-chrome')
    pg = b.new_page(); ev = pg.evaluate
    pg.on('pageerror', lambda e: errors.append(str(e)))
    pg.goto(URL); pg.wait_for_timeout(2500)
    ev(STUB)
    kas = "G.MAPS.aschehang.npcs.find(n=>n.id==='kasparAH')"
    ev(state("{q1:7,story:11}"))
    check(not ev(kas + ".show()"), "Kaspar fehlt ohne Moor-Sieg")
    ev(state("{q1:7,story:10,t_kaspar:1}"))
    check(not ev(kas + ".show()"), "Kaspar erst ab Ziel 11 (Kettenhof)")
    ev(state("{q1:7,story:11,t_kaspar:1}"))
    check(ev(kas + ".show()"), "Kaspar steht am Kettenhof")
    ev("__said=[]"); ev("(async()=>{await " + kas + ".talk()})()"); pg.wait_for_timeout(200)
    s1 = ev("__said.join(' | ')")
    check('Ketten' in s1 and ev("G.state.flags.kasparAH") == 1, f"Kaspar erstes Gespräch «{s1[:80]}»")
    ev(state("{q1:7,story:13,t_kaspar:1,dojoEnd:1}"))
    ev("__said=[]"); ev("(async()=>{await " + kas + ".talk()})()"); pg.wait_for_timeout(200)
    s2 = ev("__said.join(' | ')")
    check('Selma' in s2 and 'getröstet' in s2 and ev("G.state.flags.kasparEnd") == 1, "Kaspar nach dem Dojo: Wandel + Selma")
    t = ev("[G.TRAINERS.selma.team, G.TRAINERS.kaspar.team]")
    check(t == [[['nebelkauz', 9], ['moorlurch', 10]], [['grabfalter', 12], ['raufdachs', 12], ['hauchling', 13]]], f"Selma-/Kaspar-Team unverändert {t}")
    check(any('Bruder' in x for x in ev("G.TRAINERS.selma.after")), "Selma nennt ihren Bruder")
    # Brann
    ev("G.state.items={maskensplitter:1}; G.state.flags={brann:1}; __said=[]")
    ev("(async()=>{await G.MAPS.schmiede.npcs.find(n=>n.id==='brann').talk()})()"); pg.wait_for_timeout(200)
    s3 = ev("__said.join(' | ')")
    check('Mondglas' in s3 and ev("G.state.flags.brannMaske") == 1, f"Brann erkennt Mondglas «{s3[:80]}»")
    ev("__said=[]; G.state.items.laterne=0"); ev("(async()=>{await G.MAPS.schmiede.npcs.find(n=>n.id==='brann').talk()})()"); pg.wait_for_timeout(200)
    check('Mein Schliff' not in ev("__said.join(' ')"), "Brann wiederholt die Szene nicht")
    check(ev("G.state.flags.brannMaske") == 1, "Flag bleibt")
    # Textlängen der neuen Zeilen
    src = ev("fetch('js/world.js').then(r=>r.text())")
    for w in ['Fünf Furchen', 'fünf Krallen breit']: check(w in src, f"Krallen einheitlich: {w}")
    check('Vier Furchen' not in src, "keine «Vier Furchen» mehr")
    import re
    lines = re.findall(r"'((?:Kaspar|Brann|Selma|Mandy|Klingenmeister|Wenke|Kevin|Wido): [^']*)'", src + ev("fetch('js/data.js').then(r=>r.text())"))
    long = [l for l in lines if len(l) > 140 and any(k in l for k in ['Mondglas', 'Bruder', 'Kolben war', 'Ketten', 'trösten', 'Filou merkt', 'noch jemand dort'])]
    check(not long, f"neue Zeilen ≤ 140 Zeichen {long}")
    b.close()
print("FAILS:", len(fails)); print("ERRORS:", len(errors)); [print(e) for e in errors]
