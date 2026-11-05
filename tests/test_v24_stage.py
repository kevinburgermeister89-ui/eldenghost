"""v24: Grafik-Upgrade Phase 3 – Kampfbühne (js/stage.js), vorbereitet für den Einbau.
Prüft echtes Laden über index.html, Integration in battle.js (Bühne je Gebiet, Effekte, Rückfall), API,
fehlerfreies Zeichnen aller Bühnen/Geister, lowFx-Pfad, Auto-Umschaltung < 50 fps, Lesbarkeit, Tempo."""
import sys
from playwright.sync_api import sync_playwright
URL = sys.argv[1] if len(sys.argv) > 1 else "http://localhost:8080/index.html?touch=1"
fails, errors = [], []
def check(c, msg):
    print(("OK " if c else "FAIL") + "  " + msg, flush=True)
    if not c: fails.append(msg)
KINDS = ['gras', 'moor', 'kapelle', 'hoehle', 'kueste', 'asche', 'boss']
MONS = ['flackerling', 'totenleuchte', 'laternchen', 'menhirgeist', 'nachtmahr', 'moorranke']
# Zeichnet Bühne (+ optional Geist) auf eine 512×480-Leinwand wie G.Battle.render und misst Helligkeit/Kontrast im Geisterbereich
SHOT = """((kind,sp,low,t)=>{const c=G.mkHi(256,240),g=c.getContext('2d'); G.lowFx=low; g.setTransform(c.width/256,0,0,c.height/240,0,0);
  G.Stage.drawBackground(g,kind,t); if(sp) G.Stage.drawMon(g,sp,186,96,t,{}); G.Stage.drawForeground(g,kind,t);
  const s=c.width/256,d=g.getImageData(166*s,56*s,40*s,40*s).data; let n=0,sum=0,sq=0;
  for(let i=0;i<d.length;i+=4){const l=d[i]*0.3+d[i+1]*0.59+d[i+2]*0.11; sum+=l; sq+=l*l; n++;} const m=sum/n; return [m,Math.sqrt(Math.max(0,sq/n-m*m))];})"""
with sync_playwright() as p:
    b = p.chromium.launch(executable_path='/usr/bin/google-chrome')
    ctx = b.new_context(viewport={'width': 390, 'height': 844}, device_scale_factor=2, is_mobile=True, has_touch=True)
    pg = ctx.new_page(); ev = pg.evaluate
    pg.on('pageerror', lambda e: errors.append(str(e))); pg.on('console', lambda m: errors.append(m.text) if m.type == 'error' else None)
    pg.goto(URL); pg.wait_for_timeout(2500)
    # --- echtes Laden über index.html ---
    check(ev("document.querySelectorAll('script[src=\"js/stage.js\"]').length===1"), "index.html bindet js/stage.js genau einmal ein")
    check(ev("(()=>{const s=[...document.querySelectorAll('script[src]')].map(x=>x.getAttribute('src')); return s.indexOf('js/stage.js')===s.indexOf('js/env.js')+1;})()"), "js/stage.js steht direkt nach js/env.js")
    check(ev("!!G.Stage && G.Stage.autoFx.last===0"), "G.Stage geladen, ohne vor dem ersten Kampf zu zeichnen (kein Seiteneffekt beim Laden)")
    # --- Integration in battle.js ---
    INT = """((m,x,y,on)=>{G.demo=true; G.setFx('hoch'); G.B=null; G.state={v:6,map:m,player:{x,y,dir:'down'},team:[G.makeMon('flackerling',30)],box:[],items:{laterne:1},flags:{q1:7,story:9,tour:1},seen:{},caught:{},respawn:null,playtime:0,money:150};
      G.UI.title(false); G.UI.kind=null; G.UI.handler=null; document.getElementById('choices').className='hidden'; G.mode='world'; G.World.setMap(m,x,y,'down');
      G.Stage.on=on; window.__n={bg:0,mon:0,fg:0}; for(const k of ['bg','mon','fg']){const f={bg:'drawBackground',mon:'drawMon',fg:'drawForeground'}[k]; if(!G.Stage['_'+f]) G.Stage['_'+f]=G.Stage[f]; G.Stage[f]=function(){__n[k]++; return G.Stage['_'+f].apply(this,arguments);};}
      G.Battle.start({team:[G.makeMon('totenleuchte',30)]}); return 0;})"""
    for m, x, y, want in [('hoehle', 12, 10, 'hoehle'), ('kueste', 18, 12, 'kueste'), ('aschehang', 15, 50, 'asche'), ('tiefesmoor', 16, 24, 'moor')]:
        ev(INT + f"('{m}',{x},{y},true)"); pg.wait_for_timeout(1500)
        for _ in range(20):   # unter Last startet der Kampf manchmal später
            if ev("!!G.B && __n.bg>5 && __n.fg>5"): break
            pg.wait_for_timeout(500)
        r = ev("[G.B&&G.B.bgKind, __n.bg, __n.mon, __n.fg]")
        check(r[0] == want and r[1] > 5 and r[2] > 10 and r[3] > 5, f"Kampf in {m}: Bühne {r[0]} (erwartet {want}), drawBackground/drawMon/drawForeground aufgerufen {r[1:]}")
    # Effekte bleiben: Typ-Effekt, Schütteln, Blitz
    for low in (False, True):
        ev(f"G.setFx('{'niedrig' if low else 'hoch'}'); G.Battle.lastBfx=null; window.__mx={{shake:0,flash:0,bfx:0}}; window.__iv=setInterval(()=>{{const B=G.B; if(!B) return; __mx.shake=Math.max(__mx.shake,B.shake||0); __mx.flash=Math.max(__mx.flash,(B.flash&&B.flash.a)||0); if(B.bfx) __mx.bfx++;}},10); G.Battle.fx.attackFx('Feuer','ally','enemy',true,2); 0")
        pg.wait_for_timeout(2600); r = ev("clearInterval(__iv); [__mx, G.Battle.lastBfx]")
        check(r[0]['shake'] > 2 and r[0]['flash'] > 0.2 and r[0]['bfx'] > 5 and r[1] and r[1]['type'] == 'Feuer', f"Attacke{' lowFx' if low else ''}: Typ-Effekt, Schütteln, Blitz funktionieren {r}")
    # Rückfall ohne Bühne (G.Stage.on=false) zeichnet die alte Szene
    ev(INT + "('hoehle',12,10,false)"); pg.wait_for_timeout(1200)
    r = ev("[__n.bg, __n.mon, !!G.B]")
    check(r[0] == 0 and r[1] == 0 and r[2], f"Rückfall: ohne G.Stage alte Kampfszene, keine Stage-Aufrufe {r}")
    ev("G.Stage.on=true; for(const f of ['drawBackground','drawMon','drawForeground']) G.Stage[f]=G.Stage['_'+f]; G.setFx('hoch'); 0")
    # --- API ---
    api = ev("['drawBackground','drawMon','drawForeground','kindFor','drawBossReflection','prewarm'].every(k=>typeof G.Stage[k]==='function') && typeof G.Stage.autoFx.sample==='function'")
    check(api, "API: drawBackground/drawMon/drawForeground/kindFor/drawBossReflection/prewarm/autoFx")
    check(ev("G.Stage.drawBackground.length")==3 and ev("G.Stage.drawMon.length")==5, "Signaturen drawBackground(ctx,kind,t), drawMon(ctx,mon,x,y,t,opts)")
    kf = ev("['dorf','tiefesmoor','hoehle','kueste','aschehang'].filter(k=>G.MAPS[k]).map(k=>[k,G.Stage.kindFor(k,0,0),G.Stage.kindFor(G.MAPS[k],0,0)])")
    want = {'dorf': 'gras', 'tiefesmoor': 'moor', 'hoehle': 'hoehle', 'kueste': 'kueste', 'aschehang': 'asche'}
    check(len(kf) >= 4 and all(k2 == want[k] and k3 == want[k] for k, k2, k3 in kf), f"kindFor: Karte/ID → Bühne {kf}")
    check(ev("G.Stage.kindFor('gibtsnicht')")=='gras', "kindFor: unbekannte Karte → gras")
    check(ev("G.Stage.CFG.BOSS_OWN_STAGE===false && G.Stage.kindForBattle({boss:1},'moor')==='moor'"), "Bossräume nutzen vorerst ihr Gebiet")
    check(ev("G.Stage.CFG.CAM_SWAY<=0.5 && G.Stage.params('laternchen').glow<1.3 && G.Stage.params('totenleuchte').glow<1.3 && G.Stage.params('laternchen').rim<0.5 && G.Stage.CFG.SOFT"), "vorsichtige Standardwerte (leichte Bewegung, gedämpftes Leuchten, weiche Verläufe)")
    # --- Zeichnen aller Bühnen × Geister in beiden Modi ---
    errs = ev(f"""(()=>{{const c=G.mkHi(256,240),g=c.getContext('2d'),e=[]; for(const low of [false,true]){{G.lowFx=low; for(const k of {KINDS}) for(let i=0;i<3;i++){{ try{{G.Stage.drawBackground(g,k,i*1.3);
      for(const sp of {MONS}) {{ G.Stage.drawMon(g,sp,186,96,i*1.3,{{}}); G.Stage.drawMon(g,sp,72,156,i*1.3,{{back:true,phase:1.7}}); G.Stage.drawMon(g,sp,186,96,i,{{big:1.3,a:{{flash:true,alpha:.8,scale:.9,dx:2,dy:-1}}}}); G.Stage.drawBossReflection(g,sp,186,98); }}
      G.Stage.drawMon(g,{{sp:'flackerling'}},10,10,0,{{a:{{vis:false}}}}); G.Stage.drawForeground(g,k,i);}}catch(x){{e.push(k+':'+x.message);}} }} }} G.lowFx=false; return e;}})()""")
    check(not errs, f"alle {len(KINDS)} Bühnen × {len(MONS)} Geister zeichnen fehlerfrei (hoch+lowFx) {errs[:3]}")
    # --- lowFx-Pfad: andere Bilder, Stimmung bleibt ähnlich ---
    for k in KINDS:
        hi = ev(SHOT + f"('{k}',null,false,2)"); lo = ev(SHOT + f"('{k}',null,true,2)")
        check(abs(hi[0] - lo[0]) < 25, f"{k}: lowFx-Bühne hält die Stimmung (Helligkeit {hi[0]:.0f} vs {lo[0]:.0f})")
    ev("G.lowFx=false; 0")
    # --- Lesbarkeit: Geist hebt sich klar von der Bühne ab ---
    for k in KINDS:
        for low in (False, True):
            bg = ev(SHOT + f"('{k}',null,{'true' if low else 'false'},2)"); mon = ev(SHOT + f"('{k}','flackerling',{'true' if low else 'false'},2)")
            check(mon[1] >= bg[1] + 12 or mon[1] >= bg[1] * 2, f"{k}{' lowFx' if low else ''}: Geist lesbar (Kontrast {mon[1]:.1f} vs Bühne {bg[1]:.1f})")
    ev("G.lowFx=false; 0")
    # --- Auto-Umschaltung < 50 fps ---
    a1 = ev("(()=>{G.fxMode='auto'; G.lowFx=false; const A=G.Stage.autoFx; A.reset(); let sw=false; for(let i=0;i<200;i++) sw=A.sample(16.7)||sw; return [sw,G.lowFx];})()")
    check(a1 == [False, False], "60 fps: bleibt bei vollen Effekten")
    a2 = ev("(()=>{G.fxMode='auto'; G.lowFx=false; const A=G.Stage.autoFx; A.reset(); let n=0; while(!G.lowFx && n<1000){A.sample(28); n++;} return [G.lowFx,n*28,G.fxMode];})()")
    check(a2[0] and 2000 <= a2[1] <= 4000 and a2[2] == 'auto', f"~36 fps: nach {a2[1]} ms auf lowFx umgeschaltet, fxMode bleibt 'auto'")
    a3 = ev("(()=>{G.fxMode='hoch'; G.lowFx=false; const A=G.Stage.autoFx; A.reset(); for(let i=0;i<300;i++) A.sample(40); const r=G.lowFx; G.fxMode='auto'; A.reset(); for(let i=0;i<5;i++) A.sample(2000); return [r,G.lowFx];})()")
    check(a3 == [False, False], "fxMode 'hoch' wird nie herabgestuft; Pausen (>500 ms) zählen nicht")
    a4 = ev("(()=>{G.perfTest=true; G.fxMode='auto'; G.lowFx=false; G.Stage.autoFx.reset(); const c=G.mkHi(256,240),g=c.getContext('2d'); const t0=performance.now(); while(performance.now()-t0<3500){ G.Stage.drawBackground(g,'gras',0); const w=performance.now(); while(performance.now()-w<25){} } const r=G.lowFx; G.perfTest=false; G.lowFx=false; return r;})()")
    check(a4, "echte Messung in drawBackground (künstlich gebremst ~35 fps) schaltet lowFx")
    ev("G.Stage.autoFx.reset(); G.lowFx=false; G.fxMode='auto'; 0")
    # --- Tempo ---
    ms = ev(f"""(()=>{{const c=G.mkHi(256,240),g=c.getContext('2d'),r={{}}; g.setTransform(2,0,0,2,0,0); for(const k of {KINDS}) G.Stage.prewarm(k);
      for(const low of [false,true]){{G.lowFx=low; const t0=performance.now(); for(let i=0;i<60;i++){{const k={KINDS}[i%7]; G.Stage.drawBackground(g,k,i/60); G.Stage.drawMon(g,'totenleuchte',186,96,i/60,{{}}); G.Stage.drawMon(g,'flackerling',72,156,i/60,{{back:true}}); G.Stage.drawForeground(g,k,i/60);}} r[low?'low':'hoch']=(performance.now()-t0)/60;}}
      G.lowFx=false; G.Stage.autoFx.reset(); return r;}})()""")
    check(ms['hoch'] < 6 and ms['low'] <= ms['hoch'], f"Kampfbühne schnell: hoch {ms['hoch']:.2f} ms/Frame, lowFx {ms['low']:.2f} ms/Frame")
    check(not errors, f"keine Fehler {errors[:3]}")
    b.close()
print("FAILS:", fails if fails else "none"); sys.exit(1 if fails else 0)
