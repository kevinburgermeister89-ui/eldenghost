"""v20.2: Typentabelle als lesbare Matrix (Zeile greift an, Spalte verteidigt) + Detailansicht je Typ (Touch und Steuerkreuz)."""
import sys
from playwright.sync_api import sync_playwright
URL = sys.argv[1] if len(sys.argv) > 1 else "http://localhost:8080/index.html?touch=1"
SET = ("G.demo=true; G.state={v:6,map:'dorf',player:{x:16,y:7,dir:'down'},team:[G.makeMon('oniasche',9)],box:[],items:{laterne:0},flags:{q1:1,story:4,tour:1},seen:{oniasche:1,moorlurch:1},caught:{oniasche:1},respawn:null,playtime:0,money:150};"
       "G.UI.title(false); G.UI.kind=null; G.UI.handler=null; document.getElementById('choices').className='hidden'; G.mode='world'; G.lock=0; G.World.setMap('dorf',16,7,'down');")
fails, errors = [], []
def check(c, msg):
    print(("OK " if c else "FAIL") + "  " + msg, flush=True)
    if not c: fails.append(msg)
def dpad(pg, b): pg.evaluate(f"G.UI.handler && G.UI.handler('{b}'); 0"); pg.wait_for_timeout(120)
with sync_playwright() as p:
    br = p.chromium.launch(executable_path='/usr/bin/google-chrome')
    for W, H, tag in [(390, 844, '390'), (360, 740, '360')]:
        ctx = br.new_context(viewport={'width': W, 'height': H}, device_scale_factor=2, is_mobile=True, has_touch=True)
        pg = ctx.new_page(); ev = pg.evaluate
        pg.on('pageerror', lambda e: errors.append(str(e))); pg.on('console', lambda m: errors.append(m.text) if m.type == 'error' else None)
        pg.goto(URL); pg.wait_for_timeout(2500); ev(SET)
        if tag == '390':
            check(ev("fetch('sw.js').then(r=>r.text()).then(t=>/eldenghost-v(20\\.[2-9]|2[1-9])/.test(t))"), "Cache eldenghost-v20.2")
        ev("window._c=0; G.Menu.chronik().then(()=>window._c=1); 0"); pg.wait_for_timeout(400)
        top = ev("document.getElementById('choices').scrollTop")
        check(ev("!!document.getElementById('tcbtn')") and top == 0, f"[{tag}] Chronik: Knopf «Typentabelle» oben, Liste startet oben (scrollTop {top})")
        pg.screenshot(path=f'/workspace/shots_v202/chronik_{tag}.png')
        if tag == '390': dpad(pg, 'A')          # Steuerkreuz: A öffnet die Tabelle
        else: pg.tap('#tcbtn')                  # Touch
        pg.wait_for_timeout(400)
        m = ev("""(()=>{const t=document.querySelector('.typechart'); if(!t) return null; const rows=[...t.querySelectorAll('tr')];
          const w=document.querySelector('.tc-wrap'), ch=document.getElementById('choices');
          const hdr=[...rows[0].querySelectorAll('th.col')].map(e=>e.innerText.trim());
          const rh=rows.slice(1).map(r=>r.querySelector('th').innerText.trim());
          const tops=[...rows[0].querySelectorAll('th')].map(e=>Math.round(e.getBoundingClientRect().top));
          const lefts=rows.slice(1).map(r=>Math.round(r.querySelector('th').getBoundingClientRect().left));
          const cell=(a,d)=>{const c=t.querySelector(`td[data-a="${a}"][data-d="${d}"]`); return [c.innerText.trim(), c.className, getComputedStyle(c).backgroundColor]};
          const leg=document.querySelector('.tc-legend').innerText;
          return {rows:rows.length, hdr, rh, sameTop:new Set(tops).size===1, sameLeft:new Set(lefts).size===1, rowsTop:rows.slice(1).map(r=>Math.round(r.getBoundingClientRect().top)),
            fe:cell('Feuer','Pflanze'), fw:cell('Feuer','Wasser'), eb:cell('Elektro','Boden'), ff:cell('Wasser','Elektro'),
            leg, tw:t.getBoundingClientRect().width, ww:w.clientWidth, sw:w.scrollWidth, ox:getComputedStyle(w).overflowX,
            cw:t.querySelector('td').getBoundingClientRect().width, fs:parseFloat(getComputedStyle(t.querySelector('td')).fontSize),
            pfs:parseFloat(getComputedStyle(t.querySelector('th.col .tp')).fontSize)}})()""")
        check(m and m['rows'] == 15 and len(m['hdr']) == 13 and m['rh'][-1] == 'NEU', f"[{tag}] Matrix 14 Zeilen (13 Typen + Neutral, v21) × 13 Spalten {m and m['hdr']}")
        check(m['sameTop'] and m['sameLeft'] and len(set(m['rowsTop'])) == 14 and m['rowsTop'] == sorted(m['rowsTop']), f"[{tag}] echte Matrix: Spaltenköpfe in einer Reihe oben, jede Zeile eigene Höhe, Badges links")
        check(m['fe'][0] == '2×' and m['fe'][1].startswith('se') and m['fw'][0] == '½' and m['fw'][1].startswith('nv') and m['eb'][0] == '0' and m['eb'][1].startswith('im'), f"[{tag}] Zellen 2× grün / ½ rot / 0 grau {m['fe']} {m['fw']} {m['eb']}")
        emp = ev("document.querySelector('.typechart td[data-a=\"Feuer\"][data-d=\"Elektro\"]').innerText.trim()")
        check(emp == '', "1× bleibt leer")
        check(all(k in m['leg'] for k in ['2×', 'sehr effektiv', 'wenig effektiv', 'wirkungslos', '1×']), f"[{tag}] Legende «{m['leg']}»")
        check(m['ox'] == 'auto' and (m['sw'] <= m['ww'] + 1), f"[{tag}] passt ins Hochformat (Tabelle {m['tw']:.0f}px, Platz {m['ww']}px; sonst waagrecht scrollbar)")
        check(m['cw'] >= 19.5 and m['fs'] >= 9.5 and m['pfs'] >= 7, f"[{tag}] lesbar (v21: 13 Spalten, Zellen ≥20px): Zellen {m['cw']:.0f}px, Schrift {m['fs']:.1f}px, Kürzel {m['pfs']:.1f}px")
        pg.screenshot(path=f'/workspace/shots_v202/matrix_{tag}.png')
        d0 = ev("document.getElementById('tdetail').innerText")
        check('Stark gegen' in d0 and 'Feuer' in d0, f"[{tag}] Detail zum vorgewählten Typ (Feuer)")
        if tag == '390':
            # Steuerkreuz (3 Spalten): Feuer(0) → rechts Wasser(1) → links Feuer(0) → runter Elektro(3) → Boden(6) → Käfer(9)
            for b in ['right', 'left', 'down', 'down', 'down']: dpad(pg, b)
        else:
            pg.tap('.typechart th.row[data-t="Käfer"]'); pg.wait_for_timeout(200)
        d = ev("document.getElementById('tdetail').innerText")
        print("   Detail Käfer:", d.replace('\n', ' | '))
        exp = {'Stark gegen': ['Pflanze', 'Psycho'], 'Schwach gegen': ['Feuer', 'Kampf', 'Gift'], 'Anfällig für': ['Feuer', 'Stein'], 'Resistent gegen': ['Pflanze', 'Kampf', 'Boden']}
        lines = {l.split(' ')[0] + ' ' + l.split(' ')[1]: l for l in d.split('\n') if l.strip()}
        okd = all(k in lines and all(t in lines[k] for t in v) for k, v in exp.items())
        check(okd, f"[{tag}] Käfer-Detail ({'Steuerkreuz' if tag == '390' else 'Antippen'}): Stark/Schwach/Anfällig/Resistent korrekt")
        hl = ev("document.querySelectorAll('.typechart .hl').length")
        check(hl >= 22, f"[{tag}] Zeile und Spalte des Typs hervorgehoben ({hl} Felder)")
        pg.evaluate("document.querySelector('.tdetail').scrollIntoView({block:'center'})"); pg.wait_for_timeout(150)
        pg.screenshot(path=f'/workspace/shots_v202/detail_kaefer_{tag}.png')
        if tag == '390':
            dpad(pg, 'A'); pg.wait_for_timeout(300)   # A auf Typknopf: Bildschirm bleibt, Auswahl bleibt
            check('Käfer' in ev("document.getElementById('tdetail').innerText") and ev("document.querySelector('.ch.sel')?.innerText") == 'Käfer', "A auf Typknopf: Tabelle bleibt offen, Käfer weiter gewählt")
            # Elektro-Detail: Boden wirkungslos / Boden immun gegen Elektro
            ev("document.querySelectorAll('.typechart th.row')[3].click(); 0"); pg.wait_for_timeout(150)
            de = ev("document.getElementById('tdetail').innerText")
            check('wirkungslos gegen' in de and 'Boden' in de, f"Elektro: «wirkungslos gegen Boden» genannt")
            ev("document.querySelector('.typechart th.col[data-t=\"Boden\"]').click(); 0"); pg.wait_for_timeout(150)
            db = ev("document.getElementById('tdetail').innerText")
            check('immun gegen' in db and 'Elektro' in db, "Boden: «immun gegen Elektro» genannt")
            ev("document.querySelectorAll('.typechart th.row')[13].click(); 0"); pg.wait_for_timeout(150)
            dn = ev("document.getElementById('tdetail').innerText")
            check('Schwach gegen' in dn and 'Stein' in dn and 'Kein Geist' in dn, "Neutral: schwach gegen Stein, kein Geist hat den Typ")
            dpad(pg, 'B'); pg.wait_for_timeout(300)
            check(ev("!!document.getElementById('tcbtn')"), "B: zurück zur Chronik")
            dpad(pg, 'B'); pg.wait_for_timeout(300)
            check(ev("window._c") == 1, "B: Chronik schließt")
        else:
            pg.tap('#choices button.back'); pg.wait_for_timeout(300)
            check(ev("!!document.getElementById('tcbtn')"), "[360] Zurück-Knopf (Touch): zurück zur Chronik")
        ctx.close()
    br.close()
check(not errors, f"keine JS-Fehler {errors[:3]}")
print("FAILS:", len(fails)); sys.exit(1 if fails else 0)
