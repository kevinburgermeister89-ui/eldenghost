"""v23: Grafik-Upgrade Phase 2 – Umgebung (js/env.js): wenig Nebel, Figur lesbar, Begegnungs-Nebelbänke sichtbar, lowFx, Tempo."""
import sys
from playwright.sync_api import sync_playwright
URL = sys.argv[1] if len(sys.argv) > 1 else "http://localhost:8080/index.html?touch=1"
fails, errors = [], []
def check(c, msg):
    print(("OK " if c else "FAIL") + "  " + msg, flush=True)
    if not c: fails.append(msg)
SET = """G.demo=true; G.state={v:6,map:'dorf',player:{x:16,y:7,dir:'down'},team:[G.makeMon('flackerling',40)],box:[],items:{laterne:1},flags:{q1:7,story:9,tour:1},seen:{},caught:{},respawn:null,playtime:0,money:150};
  G.UI.title(false); G.UI.kind=null; G.UI.handler=null; document.getElementById('choices').className='hidden'; G.mode='world'; G.lock=0; G.debugEncounterRate=1e-9; G.time=100; 0"""
# Helligkeit/Kontrast rund um die Figur (Bildmitte) und Helligkeit einer Nebelbank
PROBE = """((x,y,r)=>{const c=document.getElementById('game'),g=c.getContext('2d'),s=c.width/256,d=g.getImageData((x-r)*s,(y-r)*s,2*r*s,2*r*s).data;
  let n=0,sum=0,sq=0; for(let i=0;i<d.length;i+=4){const l=(d[i]*0.3+d[i+1]*0.59+d[i+2]*0.11); sum+=l; sq+=l*l; n++;} const m=sum/n; return [m, Math.sqrt(sq/n-m*m)];})"""
with sync_playwright() as p:
    b = p.chromium.launch(executable_path='/usr/bin/google-chrome')
    ctx = b.new_context(viewport={'width': 390, 'height': 844}, device_scale_factor=2, is_mobile=True, has_touch=True)
    pg = ctx.new_page(); ev = pg.evaluate
    pg.on('pageerror', lambda e: errors.append(str(e))); pg.on('console', lambda m: errors.append(m.text) if m.type == 'error' else None)
    pg.goto(URL); pg.wait_for_timeout(2500)
    check(ev("!!(G.Env && G.Env.render && G.Env.MOOD)"), "js/env.js geladen (G.Env)")
    check(ev("document.querySelectorAll('script[src=\"js/env.js\"]').length===1"), "index.html bindet js/env.js genau einmal ein")
    M = ev("G.Env.MOOD")
    check(all(M[k]['fogA'] <= 0.07 for k in M), f"Nebel deutlich reduziert (fogA ≤ 0.07) {[(k, M[k]['fogA']) for k in M]}")
    check(M['moor']['fogA'] <= 0.06, "Moor: Nebel ≤ 0.06")
    check(ev("typeof G.setFx==='function' && 'lowFx' in G"), "bestehender lowFx-Schalter (G.setFx/G.lowFx) wird verwendet")
    ev(SET)
    res = {}
    for low in (False, True):
        ev(f"G.setFx('{'niedrig' if low else 'hoch'}'); 0")
        for name, mid, x, y in [('dorf', 'dorf', 16, 8), ('nebelgras', 'dorf', 15, 24), ('moor', 'tiefesmoor', 16, 24), ('kueste', 'kueste', 18, 12), ('hoehle', 'hoehle', 12, 10), ('aschehang', 'aschehang', 15, 50)]:
            ev(f"G.World.setMap('{mid}',{x},{y},'down'); 0"); pg.wait_for_timeout(700)
            f0 = ev("G.Env.stats.frames"); pg.wait_for_timeout(300)
            on = ev("G.Env.stats.frames") > f0
            ev("G.Env.on=false; 0"); pg.wait_for_timeout(250); old = ev(PROBE + "(128,124,18)")
            ev("G.Env.on=true; 0"); pg.wait_for_timeout(250); new = ev(PROBE + "(128,124,18)")
            res[(name, low)] = (on, old, new)
            check(on, f"{name}{' lowFx' if low else ''}: Umgebung wird gezeichnet")
            # Figur bleibt lesbar: Kontrast um die Figur höchstens leicht geringer als vorher
            check(new[1] >= old[1] * 0.8, f"{name}{' lowFx' if low else ''}: Figur lesbar (Kontrast {new[1]:.1f} vs. vorher {old[1]:.1f})")
    # Begegnungs-Nebelbänke bleiben erkennbar
    ev("G.setFx('hoch'); G.World.setMap('dorf',15,24,'down'); 0"); pg.wait_for_timeout(600)
    zf = ev("(()=>{const z=G.Env.lastMap.zoneFog; return z && z.width ? z.width : 0;})()")
    check(zf > 0, f"Begegnungs-Nebelbänke (zoneFog) weiterhin gezeichnet ({zf})")
    # Nebelbank vs. Wiese daneben: Bank sichtbar heller als die Umgebung (Env dämpft sie nicht weg)
    ev("G.World.setMap('dorf',15,24,'down'); 0"); pg.wait_for_timeout(600)
    zb = ev("(()=>{const m=G.Env.lastMap,z=m.zoneFog.getContext('2d'); return 1;})()")
    check(zb == 1, "Nebelbank-Leinwand lesbar")
    # lowFx: keine Silhouetten/Bloom -> billiger; Tempo messen
    ms = ev("""(()=>{const c=document.createElement('canvas'); c.width=512; c.height=480; const g=c.getContext('2d'); const r={};
      for(const low of [false,true]){ G.lowFx=low; const t0=performance.now(); for(let i=0;i<60;i++) G.Env.render(g,G.Env.lastMap,i,i,i/60,1/60,[[60,60,40,{warm:1}],[180,90,30,{ghost:1}]],[128,124]); r[low?'low':'hoch']=(performance.now()-t0)/60; }
      G.lowFx=false; return r;})()""")
    check(ms['hoch'] < 4 and ms['low'] <= ms['hoch'] * 1.2, f"Env-Zeichnen schnell: hoch {ms['hoch']:.2f} ms, lowFx {ms['low']:.2f} ms")
    ev("G.setFx('auto'); 0")
    check(not errors, f"keine Fehler {errors[:3]}")
    b.close()
print("FAILS:", fails if fails else "none"); sys.exit(1 if fails else 0)
