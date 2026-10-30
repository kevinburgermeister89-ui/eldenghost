"""v22: Grafik-Upgrade Phase 1 – grosse Attacken-Effekte je Typ (Aufladen, Anflug, Einschlag mit Hit-Stop, Schütteln, Blitz, Ausblenden) + lowFx."""
import sys, os
from playwright.sync_api import sync_playwright
URL = sys.argv[1] if len(sys.argv) > 1 else "http://localhost:8080/index.html?touch=1"
SHOTS = os.environ.get('SHOTS')
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
    r = ev("""(()=>{const X=G.Battle.BFX; return [!!X, G.TYPES.filter(t=>!(X.T[t]&&X.T[t].charge&&X.T[t].hit)), new Set(G.TYPES.map(t=>X.T[t]&&X.T[t].hit.toString())).size, G.TYPES.length];})()""")
    check(r[0] and not r[1], f"alle Typen haben Aufladen + Einschlag {r[1]}")
    check(r[2] == r[3] == 13, f"13 unterschiedliche Einschlag-Effekte ({r[2]}/{r[3]})")
    # jede Phase jedes Typs fehlerfrei zeichnen (normal + lowFx), Pixel verändern sich
    r = ev("""(()=>{const X=G.Battle.BFX, c=document.createElement('canvas'); c.width=256; c.height=240; const g=c.getContext('2d'), bad=[], blank=[];
      G.B=G.B||{}; for(const low of [false,true]){ G.lowFx=low; for(const t of G.TYPES){ for(const ph of ['charge','hit']){ let px=0; for(const k of [0.05,0.3,0.6,0.9]){ g.clearRect(0,0,256,240);
        G.B.bfx={type:t,ph,k,al:1,S:[72,124],F:[186,66],d:1}; X.draw(g); if(!G.B.bfx) bad.push(t+ph+k);
        const d=g.getImageData(0,0,256,240).data; for(let i=3;i<d.length;i+=16) if(d[i]) px++; } if(px<20) blank.push(t+':'+ph+(low?':low':'')); } } }
      G.B.bfx=null; G.lowFx=false; if(!G.B.ea) G.B=null; return [bad, blank];})()""")
    check(not r[0], f"alle Phasen zeichnen ohne Fehler {r[0]}")
    check(not r[1], f"jede Phase ist sichtbar (auch lowFx) {r[1]}")
    # echter Kampf: jeder Typ einmal in beide Richtungen
    ev("""G.demo=true; G.state={v:6,map:'dorf',player:{x:20,y:14,dir:'up'},team:[],box:[],items:{laterne:2,kraeutertee:3},flags:{q1:7,story:12,tour:1},seen:{},caught:{},respawn:null,playtime:0,money:100};
      G.UI.title(false); G.UI.kind=null; G.UI.handler=null; document.getElementById('choices').className='hidden'; G.mode='world'; G.lock=0; G.debugEncounterRate=1e-9; G.World.setMap('dorf',20,14,'up');""")
    ev("""(async()=>{ G.state.team=[G.makeMon('glutfaehe',30)]; G.Battle.start({team:[G.makeMon('glutfaehe',30)]}); })()""")
    pg.wait_for_timeout(3000)
    res = ev("""(async()=>{ const out=[]; const mv=t=>Object.keys(G.MOVES).find(k=>G.MOVES[k].type===t&&G.MOVES[k].power>0);
      for(const low of [false,true]){ G.lowFx=low; for(const t of G.TYPES){ const ph=new Set(); let stop=0, shake=0, flash=0;
        const iv=setInterval(()=>{const B=G.B; if(!B) return; if(B.bfx) ph.add(B.bfx.ph); if(B.hitStop) stop=1; shake=Math.max(shake,B.shake||0); if(B.flash&&B.flash.a>0) flash=1;},10);
        const t0=performance.now(); const dir=out.length%2; await G.Battle.fx.attackFx(t, dir?'enemy':'ally', dir?'ally':'enemy', false, 2, mv(t)); clearInterval(iv);
        out.push([t, low, [...ph].sort().join(','), stop, shake>0, flash, Math.round(performance.now()-t0), G.Battle.lastBfx&&G.Battle.lastBfx.type===t, !!G.B.bfx]); } }
      G.lowFx=false; return out; })()""")
    full = [x for x in res if not x[1]]; low = [x for x in res if x[1]]
    check(all(x[2] == 'charge,hit' and x[3] and x[4] and x[5] and x[7] and not x[8] for x in full), f"normal: Aufladen, Einschlag, Hit-Stop, Schütteln, Blitz, Ende sauber {[x for x in full if not (x[2]=='charge,hit' and x[3] and x[4] and x[5] and x[7] and not x[8])]}")
    check(all(x[2] == 'hit' and x[3] and x[7] and not x[8] for x in low), f"lowFx: ohne Aufladen, mit Einschlag + Hit-Stop {[x for x in low if not (x[2]=='hit' and x[3] and x[7])]}")
    check(all(x[6] <= 4200 for x in full), f"Attacke inkl. Effekt ≤ 4.2 s (max {max(x[6] for x in full)} ms)")
    check(sum(x[6] for x in low) < sum(x[6] for x in full), f"lowFx schneller ({sum(x[6] for x in low)} < {sum(x[6] for x in full)} ms)")
    r = ev("""(async()=>{ G.B.parts.length=0; await G.Battle.fx.attackFx('Feuer','ally','enemy',false,0,null); return [G.B.bfx, G.Battle.lastPop&&G.Battle.lastPop.cls]; })()""")
    check(r[0] is None and r[1] == 'im', f"keine Wirkung: kein grosser Effekt {r}")
    r = ev("""(async()=>{ const B=G.B, al=G.state.team[B.allyIdx], mx=G.stats(al).hp, calls=[]; const S=G.Snd, o=S.intensity; S.intensity=x=>{calls.push(x); return true;};
      al.hp=mx; B.musicX=null; await G.wait(120); const hi=G.Battle.musicX; al.hp=1; await G.wait(120); const lo=G.Battle.musicX; B.boss=true; al.hp=mx; await G.wait(120); const boss=G.Battle.musicX;
      B.boss=false; S.intensity=o; return [hi, lo, boss, calls.length];})()""")
    check(r[1] > r[0] and r[2] > r[0] and r[1] <= 1 and r[3] >= 3, f"Musik-Intensität steigt bei wenig LP / Boss {r}")
    if SHOTS:
        os.makedirs(SHOTS, exist_ok=True)
        for t in ['Boden', 'Käfer', 'Normal', 'Dunkel']:
            ev(f"""(()=>{{G.Battle.fx.attackFx('{t}','ally','enemy',true,2,Object.keys(G.MOVES).find(k=>G.MOVES[k].type==='{t}'&&G.MOVES[k].power>0));}})()""")
            pg.wait_for_function("G.B.bfx&&G.B.bfx.ph==='hit'&&G.B.bfx.k>0.35", timeout=6000); pg.screenshot(path=f"{SHOTS}/{t}.png"); pg.wait_for_timeout(1500)
    check(not errors, f"keine Fehler {errors[:3]}")
    b.close()
print("FAILS:", fails if fails else "none"); sys.exit(1 if fails else 0)
