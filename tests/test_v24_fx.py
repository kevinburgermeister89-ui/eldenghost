"""v24: Perf-Overlay (?perf=1) und Fyrlumen-Moment (eigene Silhouette über G.Env.drawFyrlumen).
Optional: Bilder nach design/grafik_upgrade/phase3/shots_v24b/ (Argument --shots)."""
import sys, os
from playwright.sync_api import sync_playwright
BASE = "http://localhost:8080/index.html?touch=1"
SHOTS = '--shots' in sys.argv
OUT = os.path.join(os.path.dirname(__file__), '..', 'design', 'grafik_upgrade', 'phase3', 'shots_v24b')
fails, errors = [], []
def check(c, msg):
    print(("OK " if c else "FAIL") + "  " + msg, flush=True)
    if not c: fails.append(msg)
SETUP = """((m,x,y)=>{G.demo=true; G.setFx('hoch'); G.B=null; G.state={v:6,map:m,player:{x,y,dir:'up'},team:[G.makeMon('flackerling',30)],box:[],items:{laterne:1},flags:{q1:7,story:9,tour:1},seen:{},caught:{},respawn:null,playtime:0,money:150};
  G.UI.title(false); G.UI.kind=null; G.UI.handler=null; document.getElementById('choices').className='hidden'; G.mode='world'; G.World.setMap(m,x,y,'up'); return 0;})"""
def wait(pg, js, n=30):
    for _ in range(n):
        if pg.evaluate(js): return True
        pg.wait_for_timeout(300)
    return False
with sync_playwright() as p:
    b = p.chromium.launch(executable_path='/usr/bin/google-chrome')
    ctx = b.new_context(viewport={'width': 390, 'height': 844}, device_scale_factor=2, is_mobile=True, has_touch=True)
    pg = ctx.new_page(); ev = pg.evaluate
    pg.on('pageerror', lambda e: errors.append(str(e))); pg.on('console', lambda m: errors.append(m.text) if m.type == 'error' else None)
    if SHOTS: os.makedirs(OUT, exist_ok=True)
    # --- Overlay aus ohne Parameter ---
    pg.goto(BASE); pg.wait_for_timeout(2500)
    ev(SETUP + "('dorf',16,7)"); pg.wait_for_timeout(1500)
    check(ev("G.perfHud===null && !document.getElementById('perfHud')"), "ohne ?perf=1: kein Overlay, kein Hook (G.perfHud null)")
    # --- Fyrlumen: eigene Zeichnung, Aufruf aus dem Render-Code der Lampenszene ---
    check(ev("typeof G.Env.drawFyrlumen==='function' && !!(G.FX_HOOKS.fyrlumenGlimpse&&G.FX_HOOKS.fyrlumenGlimpse.lamp) && G.FX_HOOKS.fyrlumenGlimpse.ms===1200"), "G.Env.drawFyrlumen vorhanden, FX_HOOKS.fyrlumenGlimpse unverändert (ms 1200)")
    ev(SETUP + "('leuchtturm',4,4)"); pg.wait_for_timeout(1000)
    ev("window.__fy=0; G.Env._dF=G.Env._dF||G.Env.drawFyrlumen; G.Env.drawFyrlumen=function(){__fy++; return G.Env._dF.apply(this,arguments)}; G.FX_HOOKS.fyrlumenGlimpse.lamp.ghost=0.5; 0")
    pg.wait_for_timeout(800)
    r = ev("[__fy, G.map.id]")
    check(r[0] > 5 and r[1] == 'leuchtturm', f"Leuchtturm-Render ruft drawFyrlumen auf ({r[0]}× in 0,8 s)")
    ev("G.FX_HOOKS.fyrlumenGlimpse.lamp.ghost=null; __fy=0"); pg.wait_for_timeout(500)
    check(ev("__fy") == 0, "ohne Moment (lamp.ghost null) kein Aufruf")
    # Pixelprüfung: Deckkraft folgt Ein-/Ausblenden, lowFx zeichnet ohne Fehler
    PX = """((p,low)=>{const c=document.createElement('canvas'); c.width=c.height=48; const g=c.getContext('2d'); G.lowFx=low; G.Env._dF(g,24,44,p,1.3); G.lowFx=false;
      const d=g.getImageData(0,0,48,48).data; let a=0; for(let i=3;i<d.length;i+=4) a+=d[i]; return Math.round(a/255);})"""
    vals = [ev(PX + f"({q},false)") for q in (0, 0.1, 0.5, 0.9, 1)]
    check(vals[0] == 0 and vals[4] == 0 and vals[2] > vals[1] > 0 and vals[2] > vals[3] > 0, f"Ein-/Ausblenden über die Zeit (Deckkraftsumme bei p 0/0.1/0.5/0.9/1: {vals})")
    lv = ev(PX + "(0.5,true)")
    check(lv > 0, f"lowFx-Variante zeichnet (Deckkraftsumme {lv})")
    # echter Ablauf über G.animate (1200 ms), ohne Fehler
    ev("__fy=0; const L=G.FX_HOOKS.fyrlumenGlimpse.lamp; L.ghost=0; G.animate(1200,p=>{L.ghost=p}).then(()=>{L.ghost=null; window.__done=1}); 0")
    ok = wait(pg, "window.__done===1")
    check(ok and ev("__fy") > 10, f"Moment läuft 1200 ms über G.animate ab ({ev('__fy')} Bilder), danach beendet")
    if SHOTS:
        ev(SETUP + "('leuchtturm',4,5)"); pg.wait_for_timeout(800)
        for i, q in enumerate((0.15, 0.5, 0.85)):
            ev(f"G.FX_HOOKS.fyrlumenGlimpse.lamp.ghost={q}"); pg.wait_for_timeout(300)
            pg.locator('canvas').first.screenshot(path=os.path.join(OUT, f'fyrlumen_{i+1}_p{int(q*100):02d}.png'))
        ev("G.FX_HOOKS.fyrlumenGlimpse.lamp.ghost=null")
        # Nahaufnahme: Verlauf über die Zeit, hoch und lowFx
        pg.set_content("<body style='margin:0;background:#000'><canvas id=c width=448 height=176></canvas></body>")
    # --- Overlay an mit ?perf=1 ---
    pg2 = ctx.new_page(); pg2.on('pageerror', lambda e: errors.append(str(e)))
    pg2.goto(BASE + "&perf=1"); pg2.wait_for_timeout(2500)
    pg2.evaluate(SETUP + "('dorf',16,7)")
    ok = wait(pg2, "!!(G.perfHud&&G.perfHud.last&&G.perfHud.last.scene.startsWith('Karte'))")
    r = pg2.evaluate("[!!document.getElementById('perfHud'), G.perfHud&&G.perfHud.last, document.getElementById('perfHud')&&document.getElementById('perfHud').textContent]")
    check(ok and r[0] and r[1]['fps'] > 0 and r[1]['avg'] >= 0 and r[1]['peak'] >= r[1]['avg'] and r[1]['fx'] == 'hoch' and 'Karte' in r[2], f"?perf=1 Karte: Overlay sichtbar {r[1]}")
    fs = pg2.evaluate("parseFloat(getComputedStyle(document.getElementById('perfHud')).fontSize)")
    check(fs >= 13, f"Overlay gut lesbar (Schrift {fs}px)")
    if SHOTS: pg2.screenshot(path=os.path.join(OUT, 'perf_karte.png'))
    pg2.evaluate("G.setFx('niedrig'); G.Battle.start({team:[G.makeMon('totenleuchte',30)]}); 0")
    ok = wait(pg2, "!!(G.perfHud.last&&G.perfHud.last.scene.startsWith('Kampf')&&G.perfHud.last.low)")
    r = pg2.evaluate("G.perfHud.last")
    check(ok, f"?perf=1 Kampf: Szene und lowFx angezeigt {r}")
    if SHOTS: pg2.wait_for_timeout(1500); pg2.screenshot(path=os.path.join(OUT, 'perf_kampf.png'))
    if SHOTS:
        pg.goto(BASE); pg.wait_for_timeout(2500)
        pg.evaluate("""(()=>{const c=document.createElement('canvas'); c.width=448; c.height=200; c.id='zz'; c.style.cssText='position:fixed;left:0;top:0;width:448px;height:200px;z-index:99999;image-rendering:pixelated;background:#06050c';
          document.body.appendChild(c); const g=c.getContext('2d'); g.fillStyle='#06050c'; g.fillRect(0,0,448,200);
          const s=document.createElement('canvas'); s.width=s.height=56; const h=s.getContext('2d'); g.imageSmoothingEnabled=false;
          [0.1,0.25,0.5,0.75,0.9].forEach((q,i)=>{h.clearRect(0,0,56,56); h.fillStyle='#0b0a16'; h.fillRect(0,0,56,56); G.Env.drawFyrlumen(h,28,50,q,1.1+i*0.2); g.drawImage(s,i*88+4,4,84,84);});
          G.lowFx=true; [0.25,0.5,0.75].forEach((q,i)=>{h.clearRect(0,0,56,56); h.fillStyle='#0b0a16'; h.fillRect(0,0,56,56); G.Env.drawFyrlumen(h,28,50,q,1.1); g.drawImage(s,i*88+92,104,84,84);}); G.lowFx=false;
          g.fillStyle='#8890b0'; g.font='10px monospace'; g.fillText('lowFx',30,150);})()""")
        pg.locator('#zz').screenshot(path=os.path.join(OUT, 'fyrlumen_verlauf_nah.png'))
    check(not errors, f"keine JS-Fehler {errors[:3]}")
    b.close()
print(f"\n{len(fails)} FAIL"); sys.exit(1 if fails else 0)
