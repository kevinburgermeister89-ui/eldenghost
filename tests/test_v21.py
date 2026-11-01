"""v21: Drache & Dunkel – 2 neue Typen, 20 neue Geister, neue Attacken, Gebiete, Kampfmechanik (Initiative-Stufe, Erstschlag, Falle …)."""
import sys, re
from playwright.sync_api import sync_playwright
URL = sys.argv[1] if len(sys.argv) > 1 else "http://localhost:8080/index.html?touch=1"
fails, errors = [], []
def check(c, msg):
    print(("OK " if c else "FAIL") + "  " + msg, flush=True)
    if not c: fails.append(msg)
SET = ("G.demo=true; G.state={v:6,map:'dorf',player:{x:20,y:14,dir:'up'},team:[%s],box:[],items:{laterne:2,kraeutertee:3},flags:{q1:7,story:12,tour:1%s},seen:{},caught:{},respawn:null,playtime:0,money:100};"
       "G.UI.title(false); G.UI.kind=null; G.UI.handler=null; document.getElementById('choices').className='hidden'; G.mode='world'; G.lock=0; G.debugEncounterRate=1e-9; G.World.setMap('dorf',20,14,'up');")
with sync_playwright() as p:
    b = p.chromium.launch(executable_path='/usr/bin/google-chrome')
    ctx = b.new_context(viewport={'width': 390, 'height': 844}, device_scale_factor=2, is_mobile=True, has_touch=True)
    pg = ctx.new_page(); ev = pg.evaluate
    pg.on('pageerror', lambda e: errors.append(str(e))); pg.on('console', lambda m: errors.append(m.text) if m.type == 'error' else None)
    pg.goto(URL); pg.wait_for_timeout(2500)
    # --- Typen & Tabelle ---
    r = ev("""[G.TYPES.includes('Drache'), G.TYPES.includes('Dunkel'), G.TYPES.length,
      G.eff1('Drache','Drache'), G.eff1('Dunkel','Psycho'), G.eff1('Dunkel','Kampf'), G.eff1('Dunkel','Dunkel'),
      ['Feuer','Wasser','Pflanze','Elektro'].map(t=>G.eff1(t,'Drache')), G.eff1('Kampf','Dunkel'), G.eff1('Kaefer' in G.CHART?'Kaefer':'Käfer','Dunkel'), G.eff1('Psycho','Dunkel'),
      !!(G.TYPE_COL||G.TYPE_COLORS||{})['Drache']]""")
    check(r[0] and r[1] and r[2] == 13, f"Typen Drache+Dunkel vorhanden ({r[2]})")
    check(r[3] == 2 and r[4] == 2 and r[5] == 0.5 and r[6] == 0.5, f"Drache→Drache 2, Dunkel→Psycho 2/Kampf ½/Dunkel ½ {r[3:7]}")
    check(r[7] == [0.5]*4 and r[8] == 2 and r[9] == 2 and r[10] == 0.5, f"Feuer/Wasser/Pflanze/Elektro→Drache ½, Kampf/Käfer→Dunkel 2, Psycho→Dunkel ½ {r[7:11]}")
    # --- 20 Geister, Sprites, Attacken ---
    r = ev("""(()=>{const N=G.NEW21; return [N.length, N.filter(k=>!G.SPECIES[k]), N.filter(k=>!(G.SPR.mon[k]&&G.SPR.mon[k].img&&G.SPR.mon[k].back)),
      N.filter(k=>!G.typesOf(k).some(t=>t==='Drache'||t==='Dunkel')), N.flatMap(k=>G.SPECIES[k].learn.map(l=>l[1])).filter(m=>!G.MOVES[m]),
      Object.keys(G.MOVES).filter(k=>!G.Battle.MOVE_FX[k]), Object.values(G.Battle.MOVE_FX).filter(f=>!(f.ms>0&&f.ms<=3000)).length,
      new Set(Object.values(G.Battle.MOVE_FX).map(f=>f.fn.toString())).size===Object.keys(G.Battle.MOVE_FX).length,
      N.filter(k=>!G.SPECIES_ORDER.includes(k)), JSON.stringify(G.SPECIES).match(/ß/g)];})()""")
    check(r[0] == 20 and not r[1], f"20 neue Geister ({r[0]}) {r[1]}")
    check(not r[2], f"alle Sprites (vorne/hinten) gerendert {r[2]}")
    check(not r[3], f"jeder neue Geist ist Drache oder Dunkel {r[3]}")
    check(not r[4], f"alle Lern-Attacken existieren {r[4]}")
    check(not r[5] and r[6] == 0 and r[7], f"jede Attacke hat eine eigene Animation ≤ 3 s {r[5]}")
    check(not r[8], f"Chronik-Reihenfolge enthält alle {r[8]}")
    check(not r[9], "kein ß in Artdaten")
    dur = ev("""(async()=>{const out=[]; for(const id of ['drachenhauch','schuppenhieb','wyrmzorn','schuppenglanz','finsterbiss','hinterhalt','finsterschlag','raenke']){const f=G.Battle.MOVE_FX[id];out.push([id,!!f,f&&f.ms]);} return out;})()""")
    check(all(d[1] for d in dur), f"8 neue Typ-Attacken mit Animation {dur}")
    # --- Gebiete & Bedingungen ---
    r = ev("""(()=>{const tab=z=>(G.WILD_AREAS[z]||{table:[]}).table.map(e=>e[0]); const allTab=Object.keys(G.WILD_AREAS).flatMap(tab);
      const rares=(G.RARE_SPAWNS||[]).map(r=>r.sp); const N=G.NEW21;
      const base=N.filter(k=>!Object.values(G.SPECIES).some(s=>s.evo&&s.evo.to===k) && !N.some(o=>G.SPECIES[o].evo&&G.SPECIES[o].evo.to===k));
      return [base.filter(k=>!allTab.includes(k)&&!rares.includes(k)&&k!=='brunnendrache'),
        Object.entries(G.WILD_AREAS).flatMap(([z,A])=>A.table.filter(e=>G.typesOf(e[0]).includes('Drache')).map(e=>[z,e[0],e[2]||''])),
        G.condOk('night+flag:dojoEnd'), tab('kuestengras').includes('russwiesel')];})()""")
    check(not r[0], f"jeder Grundgeist hat ein Gebiet {r[0]}")
    check(all(('lead:' in c or 'flag:' in c or z == 'aschehang') for z, _, c in r[1]), f"Drachen bleiben spät/selten {r[1]}")
    check(r[3], "Dunkel früh (selten nachts am Küstenweg)")
    ev(SET % ("G.makeMon('glutfaehe',20)", ""))
    r = ev("""(()=>{const t=A=>G.tableNow(G.WILD_AREAS[A]).map(e=>e[0]); const a=[t('hoehle').includes('grottenwyrm'), t('kuestengras').includes('gewitterlind')];
      G.state.flags.dojoEnd=1; G.state.team=[G.makeMon('glutfaehe',20)]; G.NIGHT=()=>true; const b=[t('hoehle').includes('grottenwyrm'), t('kuestengras').includes('gewitterlind')]; return [a,b];})()""")
    check(r[0] == [False, False] and r[1] == [True, True], f"Bedingungen (flag/lead/night) greifen {r}")
    r = ev("(()=>{const m=G.MAPS.aschehang; let ok=0; for(let y=0;y<m.h;y++)for(let x=0;x<m.w;x++){ if(G.World.tileZone(m,x,y)==='aschehang' && G.World.rareCond.newmoon(m,x,y)) ok++; } return [ok, (G.RARE_SPAWNS||[]).some(r=>r.sp==='neumondhirschkaefer')];})()")
    check(r[0] > 0 and r[1], f"Neumondhirschkäfer-Stellen nachts am Aschehang ({r[0]})")
    # --- Kampf: Multiplikatoren im echten Schadensweg ---
    def ratio(ally, foe, move, a, d):
        return ev(f"""(async()=>{{ G.state.team=[G.makeMon('{ally}',30)]; if(!G.B) G.Battle.start({{team:[G.makeMon('{foe}',30)]}}); else {{ G.B.enemy=G.makeMon('{foe}',30); G.state.team[0]=G.makeMon('{ally}',30); G.B.allyIdx=0; }}
          for(let i=0;i<60&&!G.B;i++) await G.wait(50); const out=[]; const s=G.UI.say; G.UI.say=async()=>{{}};
          for(const patch of [false,true]){{ const old=G.CHART['{a}']['{d}']; if(patch) G.CHART['{a}']['{d}']=1; const R=Math.random; let sd=7; Math.random=()=>((sd=(sd*16807)%2147483647)/2147483647);
            const en=G.B.enemy; en.hp=9999; G.B.st.ally=Object.assign(G.B.st.ally,{{atk:0,acc:0}}); await G.Battle._useMove('ally','{move}'); out.push(9999-en.hp); Math.random=R; G.CHART['{a}']['{d}']=old; }}
          G.UI.say=s; return out; }})()""")
    psy = ev("Object.keys(G.MOVES).find(k=>G.MOVES[k].type==='Psycho'&&G.MOVES[k].power>=40&&!G.MOVES[k].hits)")
    dark = ev("G.NEW21.find(k=>G.typesOf(k).length===1&&G.typesOf(k)[0]==='Dunkel')")
    drag = ev("G.NEW21.find(k=>G.typesOf(k).length===1&&G.typesOf(k)[0]==='Drache')")
    psyMon = ev("Object.keys(G.SPECIES).find(k=>G.typesOf(k).length===1&&G.typesOf(k)[0]==='Psycho')")
    x, y = ratio(psyMon, dark, psy, 'Psycho', 'Dunkel')
    check(y > 0 and abs(x / y - 0.5) < 0.12, f"Kampf: Psycho → Dunkel ½× ({x} vs {y}, {psy})")
    x, y = ratio(drag, drag, 'drachenhauch', 'Drache', 'Drache')
    check(y > 0 and abs(x / y - 2) < 0.3, f"Kampf: Drache → Drache 2× ({x} vs {y})")
    # --- Kampfmechanik ---
    r = ev("""(()=>{const m=G.makeMon('schattenmarder'||G.NEW21[0],20); const mx=G.stats(m).hp; m.hp=Math.floor(mx*0.2);
      return [G.Battle.prioOf('donnerschweif',m), (m.hp=mx, G.Battle.prioOf('donnerschweif',m)), G.Battle.prioOf('hinterhalt'), G.STAT_NAMES.spd];})()""")
    check(r[0] == 1 and r[1] == 0 and r[2] == 1 and r[3] == 'Initiative', f"Donnerschweif-Erstschlag <¼ LP, Hinterhalt prio, Initiative-Stufe {r}")
    r = ev("""(async()=>{ G.state.team=[G.makeMon('glutfaehe',30)]; if(!G.B) G.Battle.start({team:[G.makeMon('${M}',30)]}); else G.B.enemy=G.makeMon('${M}',30); G.B.st=null||G.B.st; for(let i=0;i<60&&!G.B;i++) await G.wait(50);
      const s=G.UI.say; G.UI.say=async()=>{}; G.B.st.enemy.atk=2; const R=Math.random; let sd=7; Math.random=()=>((sd=(sd*16807)%2147483647)/2147483647);
      await G.Battle._useMove('ally','gespinst' in G.MOVES?'gespinst':'raenke'); const spd=G.B.st.enemy.spd??G.B.st.ally.spd;
      await G.Battle._useMove('ally','knopfklau'); const st=[G.B.st.enemy.atk,G.B.st.ally.atk];
      await G.Battle._useMove('enemy','schlundfalle'); const trap=G.B.trap&&G.B.trap.ally;
      G.UI.say=s; Math.random=R; return [spd, st, trap];})()""".replace('${M}', 'pechunke'))
    check(r[0] is not None and r[0] != 0, f"Initiative-Stufe wird gesetzt ({r[0]})")
    check(r[1] == [1, 1], f"Knopfklau stiehlt eine Stufe {r[1]}")
    check(r[2] and r[2] >= 2, f"Schlundfalle hält fest ({r[2]})")
    # --- Chronik & Cache ---
    sw = open('sw.js').read()
    m = re.search(r"'eldenghost-v(\d+)'", sw)
    check(bool(m) and int(m.group(1)) >= 21 and 'creatures_dd.js' in sw, f"Service-Worker-Cache eldenghost-v{m.group(1) if m else '?'} (≥ v21) inkl. creatures_dd.js")
    mj = open('js/main.js').read()
    check(re.search(r"G\.TYPES", mj) is not None, "Chronik-Typentabelle nutzt G.TYPES (zeigt Drache/Dunkel)")
    bad = [e for e in errors if 'favicon' not in e]
    check(not bad, f"keine Konsolenfehler {bad[:3]}")
    b.close()
print("\n%d Fehler" % len(fails)); sys.exit(1 if fails else 0)
