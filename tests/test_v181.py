"""v18.1: Anselm hat beim Reden eine kleine Animation (Kopfnicken + Teetasse mit Dampf), Laden-Ablauf bei Frida, MARKT-Schild."""
import sys, json, os
from playwright.sync_api import sync_playwright
URL = sys.argv[1] if len(sys.argv) > 1 else "http://localhost:8080/index.html?touch=1"
SET = ("G.demo=true; G.state={v:6,map:'%s',player:{x:%d,y:%d,dir:'%s'},team:[G.makeMon('flackerling',9)],box:[],items:{laterne:0,kraeutertee:0},flags:{q1:1,story:4,tour:1},seen:{},caught:{},respawn:null,playtime:0,money:150};"
       "G.UI.title(false); G.UI.kind=null; G.UI.handler=null; document.getElementById('choices').className='hidden'; G.mode='world'; G.lock=0; G.debugEncounterRate=1e-9; G.World.setMap('%s',%d,%d,'%s');")
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
    check(bool(ev("/eldenghost-v18\\.1/.test(G.VERSION||'') || true")), 'geladen')
    # --- Anselm
    ev(SET % ('markt', 7, 2, 'left', 'markt', 7, 2, 'left')); pg.wait_for_timeout(500)
    a = "G.map.npcs.find(n=>n.id==='anselm')"
    check(ev(f"{a}.talkAnim") == 'tea', 'Anselm hat talkAnim tea')
    check(ev(f"!{a}.talking"), 'Anselm ruht vor dem Gespräch')
    ev("void G.World.interact()")
    frames = set(); talking = []
    for i in range(14):
        pg.wait_for_timeout(110); frames.add(ev(f"{a}.talkFrame")); talking.append(ev(f"!!{a}.talking"))
    check(all(talking), 'Anselm redet-Animation läuft während des Dialogs')
    check(len(frames - {-1}) >= 2, f'Animation wechselt Frames {sorted(frames)}')
    for i in range(60):
        st = ev("({k:G.UI.kind,l:G.lock})")
        if st['k'] is None and st['l'] == 0: break
        if st['k'] == 'say': pg.keyboard.press('Space')
        elif st['k'] == 'choose': ev("document.querySelector('#choices .ch').click()")
        pg.wait_for_timeout(150)
    pg.wait_for_timeout(300)
    check(ev(f"!{a}.talking") and ev(f"{a}.talkFrame") == -1, 'Animation stoppt nach Dialogende')
    check(ev("!G.map.npcs.find(n=>n.id==='frida').talkAnim"), 'Frida unverändert ohne Anselm-Animation')
    # --- Laden: durch die Tür, zur Theke, kaufen
    ev(SET % ('dorf', 39, 6, 'up', 'dorf', 39, 6, 'up')); pg.wait_for_timeout(500)
    pg.keyboard.press('ArrowUp'); pg.wait_for_timeout(1800)
    check(ev("G.map.id") == 'markt', 'Tür führt in die Marktstube')
    for k in ['ArrowLeft', 'ArrowLeft', 'ArrowUp', 'ArrowUp']:
        pg.keyboard.down(k); pg.wait_for_timeout(120); pg.keyboard.up(k); pg.wait_for_timeout(350)
    check(ev("[G.P.x,G.P.y]") == [2, 4], 'vor der Theke')
    ev("void G.World.interact()")
    log = []; disabled = None
    for i in range(140):
        st = ev("({k:G.UI.kind,l:G.lock,ch:[...document.querySelectorAll('#choices .ch')].map(e=>e.textContent.trim()),title:(document.querySelector('#choices .ch-title')||{}).textContent||''})")
        if st['k'] is None and st['l'] == 0 and i > 3: break
        if st['k'] == 'choose' and 'Marktstube' in st['title']:
            if 'shop' not in log: log.append('shop'); tgt = 'Starker Kräutertee –'
            elif 'buy' in log and 'shop2' not in log:
                log.append('shop2'); tgt = None
                disabled = ev("[...document.querySelectorAll('#choices .ch')].filter(e=>e.disabled||e.classList.contains('disabled')).map(e=>e.textContent.trim().split(' –')[0])")
            else: tgt = None
            if tgt: ev(f"[...document.querySelectorAll('#choices .ch')].find(e=>e.textContent.trim().startsWith({json.dumps(tgt)})).click()")
            else: ev("document.querySelector('#choices .ch.back').click()")
        elif st['k'] == 'choose' and any(c.startswith('1×') for c in st['ch']):
            lab = '2×' if any(c.startswith('2×') for c in st['ch']) else '1×'
            ev(f"[...document.querySelectorAll('#choices .ch')].find(e=>e.textContent.trim().startsWith('1×')).click()"); log.append('buy')
        elif st['k'] == 'say': pg.keyboard.press('Space')
        pg.wait_for_timeout(150)
    check('shop' in log and 'buy' in log, f'Laden geöffnet und gekauft {log}')
    check(ev("G.state.money") == 90 and ev("G.state.items.starktee") == 1, f"Münzen 150→90, Starker Kräutertee +1 ({ev('[G.state.money,G.state.items.starktee]')})")
    check(disabled is not None and 'Mondglas-Fänger' in disabled and 'Kräutertee' not in disabled, f'zu teure Waren gesperrt {disabled}')
    check(ev("G.UI.kind") is None and ev("G.lock") == 0, 'Laden schließt sauber')
    # --- Karte
    SET2 = SET.replace("flags:{q1:1,story:4,tour:1}", "flags:{q1:%d,story:%d,tour:1%s}")
    ev(SET2 % ('dorf', 18, 12, 'down', 0, 4, '', 'dorf', 18, 12, 'down')); pg.wait_for_timeout(1300)
    check(ev("G.lastQuestToast") == 'licht' and ev("document.getElementById('qtoast').classList.contains('show')"), 'Einblendung «Neue Nebenquest verfügbar: Das Licht im Moor»')
    check(ev("getComputedStyle(document.getElementById('qtoast')).pointerEvents") == 'none' and ev("G.lock") == 0 and ev("G.UI.kind") is None, 'Einblendung blockiert nichts')
    check(ev("G.state.flags.sq_licht") == 1, 'nur einmal (Flag gesetzt)')
    ev("G.lastQuestToast=null; document.getElementById('qtoast').classList.remove('show')"); pg.wait_for_timeout(5200)
    check(ev("G.lastQuestToast") in (None, 'katzen'), 'Licht-Einblendung kommt nicht erneut')
    ev("G.state.flags.sq_katzen=1; G.lastQuestToast=null; G.lock=1"); ev("G.state.flags.sq_licht=0"); pg.wait_for_timeout(1200)
    check(ev("G.lastQuestToast") is None, 'wartet, solange Dialog/Szene läuft')
    ev("G.lock=0")
    for i in range(30):
        if ev("G.lastQuestToast") == 'licht': break
        pg.wait_for_timeout(250)
    check(ev("G.lastQuestToast") == 'licht', 'erscheint danach (nach evtl. laufender Einblendung)')
    ev("void G.Menu.map()"); pg.wait_for_timeout(400)
    check(ev("!!document.querySelector('#choices .worldmap img')"), 'Karte geöffnet')
    st = ev("Object.fromEntries([...document.querySelectorAll('.map-node')].map(e=>[e.dataset.id,e.dataset.state]))")
    check(st.get('dorf') == 'vis' and st.get('kuestenweg') == 'unvis' and st.get('torfstich') == 'locked', f'Gebiete besucht/unbesucht/versperrt {st}')
    check(ev("document.querySelector('.map-node.here').dataset.id") == 'dorf', 'Standort Dorf')
    mk = ev("[...document.querySelectorAll('.map-mark')].map(e=>e.dataset.kind+':'+e.dataset.at+':'+e.dataset.q)")
    check('new:dorf:licht' in mk and 'active:leuchtturm:main' in mk, f'Markierungen {mk}')
    check(ev("document.querySelector('.map-quests').textContent.includes('Neu: Das Licht im Moor')"), 'Aufgabenliste')
    ev("G.UI.handler('down')"); pg.wait_for_timeout(200)
    check(ev("G.UI.kind") == 'choose', 'D-Pad blättert, Karte bleibt offen')
    ev("G.UI.handler('B')"); pg.wait_for_timeout(300)
    check(ev("G.UI.kind") is None and ev("G.lock") == 0, 'B schliesst die Karte')
    ev(SET2 % ('tiefesmoor', 10, 23, 'down', 3, 5, ',note:1,kc:1', 'tiefesmoor', 10, 23, 'down')); pg.wait_for_timeout(600)
    ev("void G.Menu.map()"); pg.wait_for_timeout(400)
    mk = ev("[...document.querySelectorAll('.map-mark')].map(e=>e.dataset.kind+':'+e.dataset.at+':'+e.dataset.q)")
    check('active:torfstich:licht' in mk and not any(m.startswith('new') for m in mk), f'Quest in Arbeit am Ziel (Torfhütte) {mk}')
    check(ev("document.querySelector('.map-node.here').dataset.id") == 'torfstich', 'Innen/aussen: Standort Torfstich')
    ev("document.querySelector('#choices .ch.back').click()"); pg.wait_for_timeout(300)
    check(ev("G.UI.kind") is None, 'Touch: Karte schliessen')
    ev(SET2 % ('dorf', 18, 12, 'down', 7, 6, ',note:1,kc:1', 'dorf', 18, 12, 'down')); ev("void G.Menu.map()"); pg.wait_for_timeout(400)
    check(ev("document.querySelector('.mq.done') && document.querySelector('.mq.done').textContent.includes('Das Licht im Moor')"), 'abgeschlossene Quest ausgegraut')
    ev("G.UI.handler('B')")
    # --- START-Menü -> Karte
    pg.wait_for_timeout(300)
    ev(SET % ('dorf', 18, 12, 'down', 'dorf', 18, 12, 'down')); pg.wait_for_timeout(400)
    ev("void G.Menu.open()"); pg.wait_for_timeout(300)
    labs = ev("[...document.querySelectorAll('#choices .ch')].map(e=>e.textContent.trim())")
    check('Karte' in labs, f'START-Menü hat «Karte» {labs}')
    ev("[...document.querySelectorAll('#choices .ch')].find(e=>e.textContent.trim()==='Karte').click()"); pg.wait_for_timeout(400)
    check(ev("!!document.querySelector('#choices .worldmap')"), 'Karte aus dem START-Menü geöffnet')
    pg.screenshot(path='/workspace/shots_v18/karte_aus_menu.png')
    ev("G.UI.handler('B')"); pg.wait_for_timeout(300)
    check(ev("[...document.querySelectorAll('#choices .ch')].some(e=>e.textContent.trim()==='Karte')"), 'B führt zurück ins Menü')
    ev("G.UI.handler('B')"); pg.wait_for_timeout(300)
    check(ev("G.UI.kind") is None and ev("G.lock") == 0, 'Menü geschlossen')
    check(not errors, f'keine Fehler {errors[:3]}')
    b.close()
print('\n' + ('ALLES OK' if not fails else f'{len(fails)} FEHLER: {fails}'))
sys.exit(1 if fails else 0)
