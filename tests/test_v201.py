"""v20.1: Attacken-Info beim Lernen (Level-Up/Entwicklung) und beim Vergessen – Typ-Badge, Stärke, Genauigkeit, AP, Erstschlag, Beschreibung."""
import sys
from playwright.sync_api import sync_playwright
URL = sys.argv[1] if len(sys.argv) > 1 else "http://localhost:8080/index.html?touch=1"
SET = ("G.demo=true; G.state={v:6,map:'dorf',player:{x:16,y:7,dir:'down'},team:[],box:[],items:{laterne:0},flags:{q1:1,story:4,tour:1},seen:{},caught:{},respawn:null,playtime:0,money:150};"
       "G.UI.title(false); G.UI.kind=null; G.UI.handler=null; document.getElementById('choices').className='hidden'; G.mode='world'; G.lock=0; G.World.setMap('dorf',16,7,'down');")
fails, errors = [], []
def check(c, msg):
    print(("OK " if c else "FAIL") + "  " + msg, flush=True)
    if not c: fails.append(msg)
with sync_playwright() as p:
    b = p.chromium.launch(executable_path='/usr/bin/google-chrome')
    ctx = b.new_context(viewport={'width': 390, 'height': 844}, device_scale_factor=2, is_mobile=True, has_touch=True)
    pg = ctx.new_page(); ev = pg.evaluate
    pg.on('pageerror', lambda e: errors.append(str(e))); pg.on('console', lambda m: errors.append(m.text) if m.type == 'error' else None)
    pg.goto(URL); pg.wait_for_timeout(2500); ev(SET)
    check(ev("fetch('sw.js').then(r=>r.text()).then(t=>/eldenghost-v(20\\.[1-9]|2[1-9])/.test(t))"), "Cache eldenghost-v20.1")
    # Fall 1: freier Platz – Leiste während «lernt …!»
    ev("""(()=>{const m=G.makeMon('oniasche',9); m.moves=m.moves.slice(0,2); G.state.team=[m]; m.lvl=10; window._d=0; G.learnAt(m).then(()=>window._d=1); })()""")
    pg.wait_for_timeout(500)
    li = ev("(()=>{const e=document.getElementById('learninfo'); return e?{cls:e.className, t:e.innerText, badge:!!e.querySelector('.badge'), bg:(e.querySelector('.badge')||{}).style?.background||'', fs:parseFloat(getComputedStyle(e.querySelector('.mi1')).fontSize)}:null})()")
    pg.screenshot(path='/workspace/shots_v201/lernt.png')
    check(li and li['cls'] == 'show' and 'Onifaust' in li['t'] and li['badge'] and 'Stärke' in li['t'] and 'Gen.' in li['t'] and 'AP' in li['t'], f"Leiste beim Lernen: Name, Typ-Badge, Stärke, Gen., AP {li}")
    desc = ev("G.moveDesc('onifaust')")
    check(desc[:15] in li['t'], f"einzeilige Beschreibung angezeigt «{desc[:40]}»")
    check(li['fs'] >= 11, f"auf dem Handy lesbar (Schrift {li['fs']} px)")
    for _ in range(20):
        if ev("window._d===1"): break
        pg.keyboard.press('Space'); pg.wait_for_timeout(200)
    check(ev("window._d") == 1 and ev("document.getElementById('learninfo').className") == '' and 'onifaust' in ev("G.state.team[0].moves"), "Leiste verschwindet danach, Attacke gelernt")
    # Erstschlag-Kennzeichen
    pr = ev("Object.keys(G.MOVES).find(k=>G.MOVES[k].prio>0 && G.MOVES[k].prio<3)")
    check(pr is None or 'Erstschlag' in ev(f"G.moveInfoHtml('{pr}')"), f"Erstschlag wird markiert ({pr})")
    # Fall 2: vier Attacken – Vergleich beim Vergessen, D-Pad
    ev("""(()=>{const m=G.makeMon('oniasche',9); m.moves=['kratzer','heuler','rammbock','glutstoss']; G.fillPP(m); G.state.team=[m]; m.lvl=10; window._d=0; G.learnAt(m).then(()=>window._d=1); })()""")
    pg.wait_for_timeout(400)
    t0 = ev("document.getElementById('learninfo').innerText")
    check('Onifaust' in t0, "Info zur neuen Attacke schon bei «kennt aber schon vier Attacken»")
    for _ in range(10):
        if ev("!document.getElementById('choices').className.includes('hidden')"): break
        pg.keyboard.press('Space'); pg.wait_for_timeout(250)
    pg.wait_for_timeout(300)
    r = ev("({neu:(document.querySelector('.li-new')||{}).innerText||'', alt:(document.getElementById('mvinfo')||{}).innerText||''})")
    pg.screenshot(path='/workspace/shots_v201/vergessen.png')
    check('Onifaust' in r['neu'] and 'Stärke' in r['neu'], f"Auswahl zeigt die neue Attacke {r['neu'][:60]}")
    check('Kratzer' in r['alt'] and 'Stärke' in r['alt'] and 'AP' in r['alt'], f"…und die markierte bekannte Attacke zum Vergleich {r['alt'][:60]}")
    seen = [r['alt'].split('\n')[1] if '\n' in r['alt'] else r['alt']]
    for _ in range(4):
        pg.keyboard.press('ArrowDown'); pg.wait_for_timeout(200); seen.append(ev("document.getElementById('mvinfo').innerText"))
    names = ['Heuler', 'Rammbock', 'Glutstoß', 'Glutstoss']
    check(any('Heuler' in x for x in seen) and any('Rammbock' in x for x in seen) and any('Glut' in x for x in seen), f"D-Pad: Info wechselt je Attacke {[x[:30] for x in seen]}")
    check('nicht gelernt' in seen[-1], f"«Nicht lernen» erklärt {seen[-1][:50]}")
    # Touch: dritte Attacke antippen → vergessen
    pg.locator('#choices .ch').nth(2).tap(); pg.wait_for_timeout(300)
    for _ in range(20):
        if ev("window._d===1"): break
        pg.keyboard.press('Space'); pg.wait_for_timeout(200)
    check(ev("G.state.team[0].moves") == ['kratzer', 'heuler', 'onifaust', 'glutstoss'], f"Touch: gewählte Attacke wird ersetzt {ev('G.state.team[0].moves')}")
    # --- Typen Käfer und Normal
    t = ev("""({T:G.TYPES, col:[G.TYPE_COLORS['Käfer'],G.TYPE_COLORS.Normal], k:['Pflanze','Psycho','Feuer','Kampf','Gift'].map(d=>G.eff1('Käfer',d)), kd:['Feuer','Stein','Pflanze','Kampf','Boden'].map(a=>G.eff1(a,'Käfer')),
      n:[G.eff1('Normal','Stein'), G.eff1('Kampf','Normal')], sp:['tauhase','funkmaus','aschmotte','surrlibelle','traumfalter'].map(k=>G.typesOf(k).join('/')),
      th:G.SPECIES.tauhase.learn.map(x=>G.MOVES[x[1]].type), mv:Object.values(G.MOVES).filter(m=>m.type==='Käfer').map(m=>m.power), nm:Object.values(G.MOVES).filter(m=>m.type==='Normal').length})""")
    check('Käfer' in t['T'] and 'Normal' in t['T'] and all(t['col']), f"Typen Käfer/Normal mit Farbe {t['col']}")
    check(t['k'] == [2, 2, 0.5, 0.5, 0.5] and t['kd'] == [2, 2, 0.5, 0.5, 0.5] and t['n'] == [0.5, 2], f"Typentabelle Käfer/Normal {t}")
    check(t['sp'] == ['Normal', 'Elektro/Normal', 'Feuer/Käfer', 'Elektro/Käfer', 'Psycho/Käfer'], f"Typen der Geister {t['sp']}")
    check('Psycho' not in t['th'] and 'Normal' in t['th'], f"Tauhase: keine Psycho-Attacken mehr {t['th']}")
    check(len(t['mv']) >= 3 and 0 in t['mv'] and t['nm'] >= 3, f"Käfer-Attacken inkl. Status-Attacke {t['mv']}")
    e0 = len(errors)
    ev("""(()=>{const m=G.makeMon('surrlibelle',16); m.moves=['kaeferbiss']; G.fillPP(m); G.state.team=[m]; G.mode='world'; G.lock=0; G.debug.wild('blattling',14,['rempler']).catch(()=>0); })()""")
    for _ in range(80):
        if ev("G.UI.kind==='choose' && [...document.querySelectorAll('#choices .ch')].some(e=>e.textContent.trim()==='Kampf')"): break
        if ev("G.UI.kind==='say'"): pg.keyboard.press('Space')
        pg.wait_for_timeout(80)
    choose = lambda l: ev(f"(()=>{{const e=[...document.querySelectorAll('#choices .ch')].find(e=>e.textContent.includes('{l}')); e&&e.click(); return !!e;}})()")
    choose('Kampf'); pg.wait_for_timeout(300); info = ev("(document.getElementById('mvinfo')||{}).innerText||''")
    ok = choose('Käferbiss'); pg.wait_for_timeout(2500); pg.screenshot(path='/workspace/shots_v201/kaeferbiss.png')
    check(ok and 'Käfer' in info and len(errors) == e0, f"Kampf: Käferbiss mit Typ-Badge, läuft fehlerfrei «{info[:40]}»")
    check(not errors, f"keine Konsolenfehler {errors[:4]}")
    b.close()
print("FAILS:", len(fails)); sys.exit(1 if fails else 0)
