"""v24: Gegner-KI wechselt Geister sinnvoll (schlechtes Typ-Matchup / wenig KP), höchstens 1× pro Kampf, nur jedes 2. Mal,
nie bei Selma/Kaspar, Bossen, Schlundfalle; Wechsel im echten Kampf (Meldungen, Team-Reihenfolge, Spieler-Zug läuft weiter)."""
import sys, asyncio
from playwright.async_api import async_playwright
URL = sys.argv[1] if len(sys.argv) > 1 else "http://localhost:8080/index.html?touch=1"
SET = ("G.demo=true; G.state={v:6,map:'dorf',player:{x:16,y:7,dir:'down'},team:[TEAM],box:[],items:{laterne:0},flags:{q1:1,story:4,tour:1},seen:{},caught:{},respawn:null,playtime:0,money:150};"
       "G.UI.title(false); G.UI.kind=null; G.UI.handler=null; document.getElementById('choices').className='hidden'; G.mode='world'; G.lock=0; G.debugEncounterRate=1e-9; G.debugNoCrit=true; G.World.setMap('dorf',16,7,'down');")
# Feuer-Gegner gegen Wasser-Geist (schlecht), Pflanze auf der Bank (robust + trifft)
MK = """(()=>{const e=G.makeMon('glutwurm',14), g=G.makeMon('blattling',14), n=G.makeMon('tauhase',14), al=G.makeMon('pfuetzling',14);
  return {al, B:{tr:{name:'Test'}, trainer:'ronin', boss:false, team:[e,n,g], eIdx:0, enemy:e, switches:0}};})()"""
fails, errors = [], []
def check(c, msg):
    print(("OK " if c else "FAIL") + "  " + msg, flush=True)
    if not c: fails.append(msg)
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(executable_path='/usr/bin/google-chrome')
        ctx = await b.new_context(viewport={"width": 390, "height": 844}, device_scale_factor=2, is_mobile=True, has_touch=True)
        pg = await ctx.new_page(); ev = pg.evaluate
        pg.on("pageerror", lambda e: errors.append(str(e)))
        await pg.goto(URL); await pg.wait_for_timeout(2000)
        # ---------- 1) Entscheidungsregel ----------
        r = await ev("""(()=>{const R=Math.random, out={}; const run=(f,rnd)=>{const {al,B}=""" + MK + """; f(B,al); Math.random=()=>rnd; const v=G.Battle.switchPick(B,al); Math.random=R; return v;};
          out.bad = run(()=>0, 0.1); out.coin = run(()=>0, 0.9);
          out.selma = run(B=>B.trainer='selma', 0.1); out.kaspar = run(B=>B.trainer='kaspar', 0.1);
          out.boss = run(B=>B.boss=true, 0.1); out.once = run(B=>B.switches=1, 0.1); out.wild = run(B=>B.tr=null, 0.1);
          out.trap = run(B=>B.trap={enemy:2}, 0.1); out.good = run((B,al)=>{al.sp='blattling'}, 0.1);
          out.weakbench = run(B=>{B.team[2].hp=1}, 0.1); out.nogood = run(B=>{B.team[2].hp=1; B.team[1].hp=1}, 0.1);
          let n=0; for (let i=0;i<400;i++) if (run(()=>0, R())>=0) n++; out.rate=n/400; return out;})()""")
        print("   ", r)
        check(r['bad'] == 2, "schlechtes Matchup: wechselt zum robusten Pflanzen-Geist (nicht zum neutralen)")
        check(r['coin'] == -1 and 0.4 < r['rate'] < 0.6, f"nur etwa jedes zweite Mal ({r['rate']:.2f})")
        check(r['selma'] == -1 and r['kaspar'] == -1, "Selma und Kaspar wechseln nie (Schwierigkeit unverändert)")
        check(r['boss'] == -1 and r['wild'] == -1 and r['once'] == -1 and r['trap'] == -1, "kein Wechsel bei Boss, Wildgeist, nach 1 Wechsel, in der Schlundfalle")
        check(r['good'] == -1, "gutes Matchup: kein Wechsel")
        check(r['weakbench'] == 1, "Pflanze angeschlagen: neutraler Geist ist zweite Wahl")
        check(r['nogood'] == -1, "kein Wechsel zu angeschlagenen Geistern (unter 50 % KP)")
        # ---------- 2) echter Kampf ----------
        await pg.goto(URL); await pg.wait_for_timeout(2000)
        await ev(SET.replace('TEAM', "(()=>{const m=G.makeMon('pfuetzling',30); m.moves=['haerten']; G.fillPP(m); return m;})()"))
        await ev("Math._r=Math.random; window._said=[]; const T=document.getElementById('text'); new MutationObserver(()=>{const t=T.textContent; if(t && !_said.includes(t)) _said.push(t);}).observe(T,{childList:true,characterData:true,subtree:true});")
        await ev("""(()=>{const e=G.makeMon('glutwurm',14), n=G.makeMon('tauhase',14), g=G.makeMon('blattling',14); window._t=[e,n,g];
          G.Battle.start({team:[e,n,g], trainer:'ronin'}).catch(()=>0);})()""")
        said, ok = [], False
        for _ in range(300):
            st = await ev("({k:G.UI.kind, ch:[...document.querySelectorAll('#choices .ch')].map(e=>e.textContent.trim())})")
            if st['k'] == 'choose' and 'Kampf' in st['ch']:
                if await ev("G.B.switches||0"): ok = True; break
                await ev("[...document.querySelectorAll('#choices .ch')].find(e=>e.textContent.trim()==='Kampf').click()"); await pg.wait_for_timeout(120)
                await ev("(()=>{const e=[...document.querySelectorAll('#choices .ch')].find(e=>e.textContent.includes(G.MOVES.haerten.name)); e&&e.click();})()")
            elif st['k'] == 'say': await pg.keyboard.press("Space")
            await pg.wait_for_timeout(40)
        said = await ev("_said.filter((t,i,a)=>!a.some(u=>u!==t && u.startsWith(t)))")
        s = await ev("G.B ? {sp:G.B.enemy.sp, sw:G.B.switches, order:G.B.team.map(m=>m.sp)} : null")
        print("    Meldungen:", [t for t in said if 'ruft' in t][:4], s)
        check(ok and s and s['sp'] == 'blattling' and s['sw'] == 1, "im echten Kampf: Gegner holt Glutwurm zurück und schickt Blattling")
        check(any('zurück' in t for t in said) and any('ruft' in t and 'Blattling' in t for t in said), "Meldungen zum Wechsel erscheinen")
        check(s and s['order'] == ['blattling', 'tauhase', 'glutwurm'], f"Glutwurm kommt später wieder (Team-Reihenfolge) {s and s['order']}")
        await ev("Math.random=Math._r; if (G.B) G.B.team.forEach(m=>m.hp=0)")
        for _ in range(300):
            if await ev("G.mode==='world' && !G.B"): break
            k = await ev("G.UI.kind")
            if k == 'say': await pg.keyboard.press("Space")
            elif k == 'choose': await ev("(()=>{const e=[...document.querySelectorAll('#choices .ch')].find(e=>/^Kampf$/.test(e.textContent.trim()))||document.querySelector('#choices .ch'); e&&e.click();})()")
            await pg.wait_for_timeout(40)
        await b.close()
    check(not errors, f"keine JS-Fehler {errors[:3]}")
    print(f"\n{'ALLE OK' if not fails else str(len(fails)) + ' FEHLER'}")
    sys.exit(1 if fails else 0)
asyncio.run(main())
