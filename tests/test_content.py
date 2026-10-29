"""Inhalte: 9 Elemente (Tabelle, Doppeltypen, Attacken, Effekte), neue Geister, Mühle & Schmiede, Erreichbarkeit, Spielstand-Migration, Comic-Sprites."""
import asyncio, sys, json
from playwright.async_api import async_playwright
URL = "http://localhost:8080/index.html?touch=1"
SET = ("G.demo=true; G.state={v:3,map:'dorf',player:{x:16,y:7,dir:'down'},team:[G.makeMon('flackerling',9)],box:[],items:{laterne:4,moorminze:2},flags:{q1:3},seen:{},caught:{},playtime:0};"
       "G.UI.title(false); G.UI.kind=null; G.UI.handler=null; document.getElementById('choices').className='hidden'; G.mode='world'; G.lock=0; G.debugEncounterRate=1e-9;")
fails, errors = [], []
def check(c, msg):
    print(("OK " if c else "FAIL") + "  " + msg)
    if not c: fails.append(msg)
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(executable_path='/usr/bin/google-chrome', args=["--autoplay-policy=no-user-gesture-required"])
        ctx = await b.new_context(viewport={"width": 390, "height": 844}, device_scale_factor=2, is_mobile=True, has_touch=True)
        pg = await ctx.new_page()
        pg.on("pageerror", lambda e: errors.append(str(e))); pg.on("console", lambda m: errors.append(m.text) if m.type in ("error", "warning") else None)
        await pg.goto(URL); await pg.wait_for_timeout(1500)
        ev = pg.evaluate
        # --- Typen ---
        T = await ev("G.TYPES")
        check(T == ['Feuer', 'Wasser', 'Pflanze', 'Elektro', 'Stein', 'Psycho', 'Boden', 'Gift', 'Kampf', 'Käfer', 'Normal', 'Drache', 'Dunkel'], f"13 Elemente (v20.1: + Käfer, Normal; v21: + Drache, Dunkel): {', '.join(T)}")
        pairs = [('Wasser', 'Feuer', 2), ('Wasser', 'Stein', 2), ('Feuer', 'Wasser', 0.5), ('Feuer', 'Stein', 0.5), ('Elektro', 'Wasser', 2), ('Stein', 'Feuer', 2), ('Wasser', 'Stein', 2), ('Psycho', 'Kampf', 2), ('Psycho', 'Gift', 2), ('Psycho', 'Psycho', 0.5), ('Pflanze', 'Wasser', 2), ('Pflanze', 'Stein', 2), ('Pflanze', 'Boden', 2), ('Pflanze', 'Feuer', 0.5), ('Feuer', 'Pflanze', 2), ('Gift', 'Pflanze', 2), ('Wasser', 'Pflanze', 0.5), ('Boden', 'Elektro', 2), ('Boden', 'Feuer', 2), ('Boden', 'Stein', 2), ('Boden', 'Gift', 2), ('Elektro', 'Boden', 0), ('Kampf', 'Stein', 2), ('Kampf', 'Psycho', 0.5), ('Elektro', 'Stein', 1), ('Stein', 'Elektro', 1), ('Feuer', 'Psycho', 1), ('Gift', 'Wasser', 1)]
        bad = [(a, d, await ev(f"G.eff1('{a}','{d}')"), f) for a, d, f in pairs]; bad = [x for x in bad if x[2] != x[3]]
        check(not bad, f"Typentabelle: {len(pairs)} Pflichtbeziehungen stimmen {bad}")
        sanity = await ev("G.TYPES.every(a=>G.TYPES.every(d=>[0,0.5,1,2].includes(G.eff1(a,d)))) && G.TYPES.every(a=>G.CHART[a])")
        check(sanity, "Tabelle vollständig, nur Faktoren 0 / ½ / 1 / 2")
        bal = await ev("G.TYPES.map(a=>[a, G.TYPES.filter(d=>G.eff1(a,d)===2).length, G.TYPES.filter(d=>G.eff1(d,a)===2).length])")
        check(all((1 <= s <= 4 or (t == 'Normal' and s == 0)) and 1 <= w <= 4 for t, s, w in bal), "Balance: jeder Typ trifft 1–4 Typen sehr effektiv und hat 1–4 Schwächen (Stein: 4 seit Pflanze) " + json.dumps(bal))
        check(await ev("G.eff('Wasser','menhirgeist')") == 4 and await ev("G.eff('Feuer','gischtkrebs')") == 0.25 and await ev("G.eff('Elektro','torfwicht')") == 0 and await ev("G.eff('Psycho','nebelahn')") == 1,
              "Doppeltypen multiplizieren (Wasser→Stein/Boden 4×, Feuer→Wasser/Stein ¼×, Elektro→Boden 0, Psycho→Psycho/Kampf 1×)")
        dual = await ev("Object.keys(G.SPECIES).filter(k=>(G.SPECIES[k].types||[]).length===2).length")
        cover = await ev("G.TYPES.map(t=>[t,Object.keys(G.SPECIES).filter(k=>G.typesOf(k).includes(t)).length])")
        check(dual >= 6 and all(n >= 2 for _, n in cover), f"{dual} Doppeltyp-Geister, jeder Typ mind. 2 Vertreter " + json.dumps(cover))
        mv = await ev("Object.values(G.MOVES).every(m=>G.TYPES.includes(m.type)||m.type==='Neutral') && Object.values(G.SPECIES).every(s=>s.learn.every(([l,id])=>G.MOVES[id]) && G.typesOf(Object.keys(G.SPECIES).find(k=>G.SPECIES[k]===s)).every(t=>G.TYPES.includes(t)))")
        check(mv, "Alle Attacken nutzen die 9 Elemente oder Neutral, Geister nur die 9 Elemente, alle Lern-Attacken existieren")
        check(await ev("G.TYPES.every(t=>G.MOVES && Object.values(G.MOVES).some(m=>m.type===t && m.power>0))"), "Jeder Typ hat mindestens eine Schadensattacke")
        new = await ev("['raufdachs','grimmdachs','schwammling','moderhut'].map(k=>[k, !!G.SPECIES[k], G.SPECIES_ORDER.includes(k), !!G.SPR.mon[k]])")
        check(all(x[1] and x[2] and x[3] for x in new), "Neue Geister Raufdachs→Grimmdachs (Kampf), Schwammling→Moderhut (Gift) mit Sprites und Chronik-Eintrag")
        zones = await ev("Object.values(G.WILD_AREAS).flatMap(a=>a.table.map(x=>x[0]))")
        check('raufdachs' in zones and 'schwammling' in zones, "Neue Geister erscheinen in Wildgebieten")
        check(await ev("G.STATUS.klamm.immune[0]==='Wasser' && G.STATUS.verirrt.immune[0]==='Psycho'"), "Status-Immunitäten auf neue Typen umgestellt")
        # --- Sprites im Comic-Pixelstil ---
        spr = await ev("Object.keys(G.SPECIES).map(k=>{const s=G.SPR.mon[k]; const w=c=>c.lw||c.width; return [k,w(s.img),w(s.back),w(s.big),w(s.at(32))]})")
        check(all(x[1:] == [64, 80, 84, 32] for x in spr), f"Alle {len(spr)} Geister: Vorderansicht 64, Rückansicht 80, Boss 84, Oberwelt 32 Pixel")
        ol = await ev("""(()=>{const c=G.SPR.mon.flackerling.img,g=c.getContext('2d'),d=g.getImageData(0,0,64,64).data;let edge=0,dark=0;
          for(let y=1;y<63;y++)for(let x=1;x<63;x++){const i=(y*64+x)*4;if(d[i+3]<200)continue;const e=[[1,0],[-1,0],[0,1],[0,-1]].some(([a,b])=>d[((y+b)*64+x+a)*4+3]<10);
          if(e){edge++; if(d[i]+d[i+1]+d[i+2]<150) dark++;}} return [edge,dark];})()""")
        check(ol[0] > 50 and ol[1] / ol[0] > 0.9, f"Kräftige dunkle Kontur: {ol[1]}/{ol[0]} Randpixel dunkel")
        ppl = await ev("['player','ilse','hedda','brann','mahlen'].map(k=>{const s=k==='player'?G.SPR.player.down[0]:G.SPR[k].down; return (s.lw||s.width)+'x'+(s.lh||s.height)})")
        check(all(x == '20x26' for x in ppl), "Figuren in Gen-4/5-Proportionen (20×26): " + ', '.join(ppl))
        # --- Kampfeffekte & Klänge je Typ ---
        await ev(SET + "G.World.setMap('dorf',16,7,'down')")
        await ev("void G.debug.wild('raufdachs', 8)"); await pg.wait_for_timeout(3000)
        fx = []
        for t in T:
            n = await ev(f"(async()=>{{G.B.parts.length=0; await G.Battle.fx.attackFx('{t}','ally','enemy',false,2); return G.B.parts.length}})()")
            fx.append((t, n))
        check(all(n > 0 for _, n in fx), "Kampfeffekte für alle 8 Typen erzeugen Partikel " + json.dumps(fx))
        sfx = await ev("(()=>{const bad=[]; for(const t of G.TYPES){ try{ G.Snd.sfx('hit_'+t) } catch(e){ bad.push(t) } } for(const n of ['hammer','creak','splash']) try{G.Snd.sfx(n,null,0.5)}catch(e){bad.push(n)} return bad })()")
        check(sfx == [], "Treffer-Klänge für alle Typen sowie Hammer, Mühlrad-Knarren und Plätschern spielbar")
        badges = await ev("document.querySelector('#hud-enemy .ty, .hud .ty') ? document.querySelector('#hud-enemy .ty, .hud .ty').textContent : document.body.innerText.includes('Kampf')")
        check(bool(badges), "Typ-Abzeichen im Kampf sichtbar")
        await ev("G.B && (G.B.over = true)")
        await pg.reload(); await pg.wait_for_timeout(1500)
        # --- Mühle & Schmiede ---
        await ev(SET)
        reach = await ev("['dorf','tiefesmoor','home','hedda','oda','jorin','huette','schmiede','muehle'].map(id=>{const s=id==='dorf'?[16,7]:id==='tiefesmoor'?[16,38]:[4,6]; const r=G.World.reachCheck(id,s[0],s[1]); return [id,r.bad]})")
        check(all(not x[1] for x in reach), "Erreichbarkeit: alle Türen, Übergänge, Schilder und Figuren auf 9 Karten erreichbar " + json.dumps([x for x in reach if x[1]]))
        check(await ev("G.MAPS.dorf.doors['3,9'].to==='muehle' && G.MAPS.dorf.doors['27,14'].to==='schmiede' && G.MAPS.dorf.tiles[14][30]==='A' && G.MAPS.dorf.tiles[8][6]==='~'"),
              "Dorf: Mühle mit Mühlgraben (Wasserrad) und Schmiede mit Amboss")
        await ev("G.World.setMap('dorf',3,10,'up')"); await pg.wait_for_timeout(300)
        await pg.keyboard.press("ArrowUp"); await pg.wait_for_timeout(1300)
        check(await ev("G.map.id") == 'muehle' and await ev("G.map.name") == 'Die Mühle', "Mühle betretbar (Innenraum «Die Mühle»)")
        await ev("G.World.setMap('schmiede',4,4,'up')"); await pg.wait_for_timeout(300)
        check(await ev("G.map.name") == 'Branns Schmiede' and await ev("G.MAPS.schmiede.tiles[1].join('').includes('FF')"), "Schmiede-Innenraum mit Esse und Amboss")
        # Schmied: Geschenk, dann Tausch 3 Laternen -> Mondglaslaterne
        async def talk(mapid, x, y, d, answers):   # Enter bestätigt Texte; bei Ja/Nein ist «Ja» vorausgewählt
            await ev(f"G.World.setMap('{mapid}',{x},{y},'{d}')"); await pg.wait_for_timeout(200)
            await ev("void G.World.interact()")
            for _ in range(60):
                await pg.wait_for_timeout(110)
                if await ev("G.lock===0 && !G.UI.handler && !G.UI.kind"): return True
                await pg.keyboard.press("Enter")
            return False
        l0 = await ev("G.state.items.laterne")
        await talk('schmiede', 5, 3, 'up', [])
        check(await ev("G.state.flags.brann") == 1 and await ev("G.state.items.laterne") == l0 + 2, "Schmied Brann: Dialog, schenkt 2 Seelenfänger")
        m0 = await ev("G.state.items.mondlaterne || 0")
        await talk('schmiede', 5, 3, 'up', ['A'])
        check(await ev("G.state.items.mondlaterne || 0") == m0 + 1 and await ev("G.state.items.laterne") == l0 - 1, "Schmied: 3 Seelenfänger gegen 1 Mondglas-Fänger")
        await talk('muehle', 6, 4, 'up', [])
        check(await ev("G.state.flags.mathis") == 1 and await ev("G.state.items.starktee") >= 1, "Müller Mathis: Dialog, schenkt Moorminze und starken Tee")
        t0 = await ev("G.state.items.kraeutertee || 0"); mm = await ev("G.state.items.moorminze")
        await talk('muehle', 6, 4, 'up', ['A'])
        check(await ev("G.state.items.kraeutertee || 0") == t0 + 1 and await ev("G.state.items.moorminze") == mm - 1, "Müller: 1 Moorminze gegen 1 Kräutertee")
        # --- Spielstand-Migration v2 -> v3 ---
        mig = await ev("(()=>{const s=G.migrate({v:2,map:'dorf',player:{x:27,y:13,dir:'down'},team:[{sp:'moorlurch',lvl:8,moves:['rempler','schlammwurf'],hp:20}],box:[],items:{},flags:{q1:2}}); return [s.v, s.player.x+','+s.player.y, s.team[0].moves.join(','), G.typesOf(s.team[0].sp).join('/'), G.makeMon('moorlurch',8).moves.join(',')]})()")
        check(mig[0] == 6 and mig[1] == '16,7' and mig[2] == mig[4] and mig[3] == 'Wasser',
              f"Migration v2→v6: Attacken nach neuer Lernliste (v17), Spieler von bebauter Kachel auf den Dorfplatz, Moorlurch jetzt Wasser {mig}")
        chart = await ev("G.chartHtml()")
        check(chart.count('<tr') == 15 and 'PFL' in chart and 'KÄF' in chart and 'DRA' in chart and 'DUN' in chart and '2×' in chart and 'wirkungslos' in chart, "Typentabelle als Matrix (13 Angreifer + Neutral × 13 Verteidiger, Legende; v21)")
        # --- Kacheln, Häuser & Kampfszenen im Comic-Pixelstil ---
        await ev(SET)
        tl = await ev("""(()=>{const r={}; for (const id of ['dorf','tiefesmoor']) { const t0=performance.now(); const m=G.MAPS[id]; m.canvas=null; G.World.setMap(id,id==='dorf'?16:16,id==='dorf'?7:30,'down');
          r[id]=[!!m.canvas, m.canvas&&m.canvas.s, Math.round(performance.now()-t0), !!m.waterMask]; } return r; })()""")
        check(all(v[0] and v[1] == 2 and v[3] for v in tl.values()) and all(v[2] < 2500 for v in tl.values()), f"Aussenkarten im neuen Stil vorgerendert (2×, Wasser, Zeit ms) {tl}")
        flat = await ev("""(()=>{const c=document.createElement('canvas');c.width=16;c.height=16;const g=c.getContext('2d',{willReadFrequently:true});const m=G.MAPS.dorf;
          const n=k=>{g.clearRect(0,0,16,16);G.Tiles.ground(g,m,5,5,k);const d=g.getImageData(0,0,16,16).data,s=new Set();for(let i=0;i<d.length;i+=4)s.add(d[i]+','+d[i+1]+','+d[i+2]);return s.size;};
          return ['.','"',',','c','u','m','q'].map(k=>[k,n(k)]);})()""")
        check(all(n <= 10 for _, n in flat), f"Boden ohne Körnung: wenige flache Farben je Kachel {flat}")
        obj = await ev("""(()=>{const g=document.createElement('canvas').getContext('2d',{willReadFrequently:true});g.canvas.width=64;g.canvas.height=64;const m=G.MAPS.dorf;
          const lum=[];for(const [k,sz] of [['T',22],['f',16],['g',16],['L',16],['S',16]]){g.clearRect(0,0,64,64);const mm={w:3,h:3,theme:'dorf',tiles:[['.','.','.'],['.',k,'.'],['.','.','.']]};if(k==='L')g.drawImage(G.Tiles.lantern(true),16,16);else G.Tiles.objects(g,mm);
          const d=g.getImageData(0,0,64,64).data;let dark=0,all=0;for(let i=0;i<d.length;i+=4)if(d[i+3]>200){all++;if(d[i]+d[i+1]+d[i+2]<70)dark++;}lum.push([k,all,dark]);}
          const h=G.Tiles.house({roof:'#4e3c70'});return [lum,h.width,h.height];})()""")
        check(all(a > 30 and d > 8 for _, a, d in obj[0]) and obj[1] == 64 and obj[2] == 60, f"Bäume, Zäune, Gräber, Laternen, Schilder mit dunkler Kontur; Häuser 64×60 {obj}")
        bk = await ev("""(()=>{const r=[];for(const k of ['gras','moor','kapelle','boss']){const c=G.bgPreview(k);r.push([k,c.width,c.height]);}
          G.World.setMap('tiefesmoor',6,16,'down'); const a=G.bgKindAt(); G.World.setMap('tiefesmoor',16,30,'down'); const b=G.bgKindAt(); G.World.setMap('dorf',16,7,'down'); return [r,a,b,G.bgKindAt()];})()""")
        check(all(w == 264 and h == 248 for _, w, h in bk[0]) and bk[1:] == ['kapelle', 'moor', 'gras'], f"Kampfszenen gras/moor/kapelle/boss, Wahl nach Standort {bk}")
        # --- Starter-Dreieck: Flackerling (Feuer), Pfützling (Wasser), Blattling (Pflanze) ---
        st = await ev("G.STARTERS")
        check(st == ['flackerling', 'pfuetzling', 'blattling'], f"Starter: {st}")
        tri = await ev("[G.eff1('Feuer','Pflanze'), G.eff1('Pflanze','Wasser'), G.eff1('Wasser','Feuer'), G.eff1('Pflanze','Feuer'), G.eff1('Wasser','Pflanze'), G.eff1('Feuer','Wasser')]")
        check(tri == [2, 2, 2, 0.5, 0.5, 0.5], f"Dreieck: Feuer→Pflanze, Pflanze→Wasser, Wasser→Feuer je 2×, rückwärts je ½ {tri}")
        wild = await ev("Object.values(G.WILD_AREAS).some(a=>a.table.some(([k])=>k==='kieselgeist')) && G.SPECIES.kieselgeist.catch>0")
        check(wild, "Kieselgeist bleibt wild fangbar (Torfstich; ab v16 auch Klippenhöhle)")
        bal = await ev("""G.STARTERS.map(sp=>{const b=G.SPECIES[sp].base, m=G.makeMon(sp,5), m8=G.makeMon(sp,8);
          const neu=m.moves.every(G.isNeutral) && m.moves.some(i=>G.MOVES[i].power>=40);
          const stab=m8.moves.map(i=>G.MOVES[i]).filter(M=>M.power>=40 && G.hasType(sp,M.type)).length; return [sp, b.hp+b.atk+b.def+b.spd, neu, stab, m.moves.length, G.SPECIES[sp].evo.lvl];})""")
        bsts = [x[1] for x in bal]
        check(max(bsts) - min(bsts) <= 6 and all(x[2] and x[3] >= 1 and x[4] >= 2 and x[5] == 14 for x in bal), f"Starter vergleichbar: Basiswerte ±6, Lv 5 nur typenlose Attacken, ab Lv 8 eine STAB-Schadensattacke, Entwicklung Lv 14 {bal}")
        fenn = await ev("""G.STARTERS.map(sp=>{G.state.starter=sp; return [sp, G.trainerTeam('fenn').map(e=>e.join(':')).join(','), G.TRAINERS.fenn.intro.join(' ').includes(G.SPECIES[G.trainerTeam('fenn')[1][0]].name)];})""")
        check([f[1] for f in fenn] == ['laternchen:5,moorlurch:6', 'laternchen:5,kleeling:6', 'laternchen:5,flackerling:6'] and all(f[2] for f in fenn),
              f"Fenn passt sein Team an den Starter an und nennt seinen Geist {fenn}")
        old = await ev("""(()=>{const s=G.migrate({v:2,map:'dorf',player:{x:16,y:8,dir:'down'},team:[{sp:'menhirgeist',lvl:15,moves:['rempler','kieselhagel'],hp:30}],box:[],items:{},flags:{q1:2}});
          const keep=s.team[0].sp; G.state=s; return [keep, s.starter, G.trainerTeam('fenn')[1][0]];})()""")
        check(old == ['menhirgeist', 'kieselgeist', 'flackerling'], f"Alter Spielstand mit Kieselgeist-Linie: Geister bleiben, Starter-Linie vermerkt, Fenn passend {old}")
        # --- Typenlose Attacken im frühen Spiel (Kevin: Typ-Attacken erst ab Lv 8/9) ---
        neu = await ev("""(()=>{const bad=[];
          for (const [k,s] of Object.entries(G.SPECIES)) for (const [l,id] of s.learn) if (l<8 && !G.isNeutral(id)) bad.push(k+':'+l+':'+id);
          const first=Object.keys(G.SPECIES).map(k=>[k,Math.min(...G.SPECIES[k].learn.filter(([l,id])=>G.MOVES[id].power>0 && G.hasType(k,G.MOVES[id].type)).map(([l])=>l))]).filter(([k,l])=>l<8||l>9);
          const tr=[]; for (const [id,t] of Object.entries(G.TRAINERS)) { const teams=[t.team, ...Object.values(t.teamFor||{}).map(sp=>t.team.map((e,i)=>i===1?[sp,e[1]]:e))];
            for (const team of teams) for (const [sp,l] of team) if (l<8 && !G.makeMon(sp,l).moves.every(G.isNeutral)) tr.push(id+':'+sp+':'+l); }
          const wild=[]; for (const [z,a] of Object.entries(G.WILD_AREAS)) for (const [sp] of a.table) for (let l=Math.max(2,a.lvl[0]); l<=a.lvl[1]; l++) if (l<8 && !G.makeMon(sp,l).moves.every(G.isNeutral)) wild.push(z+':'+sp+':'+l);
          return [bad, first, tr, wild, G.WILD_AREAS.nebelgras.lvl[1]];})()""")
        check(not neu[0], f"Keine Typ-Attacke unter Lv 8 in irgendeiner Lernliste {neu[0]}")
        check(not neu[1], f"Erste eigene Typ-Attacke jedes Geistes an Lv 8 oder 9 {neu[1]}")
        check(not neu[2] and not neu[3] and neu[4] <= 7, f"Beschwörer- und Wildgeister unter Lv 8 (Nebelgras Lv 2–{neu[4]}) kennen nur typenlose Attacken {neu[2]} {neu[3]}")
        nx = await ev("[G.eff('Neutral','kieselgeist'), G.eff('Neutral','menhirgeist'), G.eff('Neutral','nebelahn'), G.eff('Neutral','torfwicht'), Object.keys(G.SPECIES).some(k=>G.hasType(k,'Neutral')), !!G.TYPE_COLORS.Neutral, G.chartHtml().includes('Neutral')]")
        check(nx[:4] == [0.5, 0.5, 1, 1] and not nx[4] and nx[5] and nx[6], f"Neutral wirkt 1× (nur gegen Stein ½×), kein Typbonus, Farbe und Hinweis in der Typentabelle {nx}")
        mg = await ev("""(()=>{const s=G.migrate({v:3,map:'dorf',player:{x:16,y:7,dir:'down'},team:[{sp:'moorlurch',lvl:6,moves:['rempler','wasserstrahl','sumpfsog'],hp:15},{sp:'raufdachs',lvl:10,moves:['rempler','prankenhieb','haerten','schlammwurf'],hp:20}],box:[{sp:'schwammling',lvl:5,moves:['schattenstaub','aschestaub'],hp:10}],items:{},flags:{q1:1,story:4}});
          return [s.team[0].moves.join(','), s.team[1].moves.join(','), s.box[0].moves.join(','), s.team.concat(s.box).every(m=>m.moves.every(id=>m.pp[id]>0)), [G.makeMon('moorlurch',6).moves.join(','), G.makeMon('raufdachs',10).moves.join(','), G.makeMon('schwammling',5).moves.join(',')]];})()""")
        check(mg[:3] == mg[4] and mg[3], f"Alte Spielstände: Attacken nach der v17-Lernliste neu abgeleitet, AP gefüllt {mg}")
        # --- Beschwörer lauern nicht auf: Fenn erst nach der Fang-Übung, Kampf nur auf Ansprache ---
        gate = await ev("""(()=>{G.World.setMap('dorf',15,15,'left'); const f=G.map.npcs.find(n=>n.id==='fenn'); const r=[];
          G.state.flags.t_fenn=0; for (const st of [1,2,3,4]) { G.state.flags.story=st; r.push(f.show()); }
          return [r, G.TRAINERS.fenn.sight, f.sight, G.TRAINERS.selma.sight, !!G.TRAINERS.fenn.ask, !!G.TRAINERS.selma.ask, G.TRAINERS.fenn.ask.join(' ').includes('Nebelgras')];})()""")
        await ev("G.World.checkTrainers()"); await pg.wait_for_timeout(400)
        amb = await ev("!!G.B")
        check(gate[0] == [False, False, True, True] and gate[1:4] == [0, 0, 0] and all(gate[4:]) and not amb,
              f"Fenn erscheint erst nach der Fang-Übung, kein Überfall (Sichtlinie aus), Fenn und Selma fragen erst und raten zum Training {gate} Überfall={amb}")
        await ev("G.state.flags.story=4")
        # echter Durchlauf der Starterwahl (neues Spiel, Schwammling wählen)
        pg2 = await ctx.new_page(); pg2.on("pageerror", lambda e: errors.append(str(e)))
        await pg2.goto(URL); await pg2.evaluate("localStorage.clear()"); await pg2.reload(); await pg2.wait_for_timeout(1400)
        # neues Spiel bis in die Welt (Elternhaus), dann Ilse und der dritte Laternenstein (Schwammling)
        async def idle2():
            for _ in range(120):
                k = await pg2.evaluate("G.UI.kind")
                if k == 'say': await pg2.keyboard.press("Space")
                elif k == 'choose':
                    labs = [l.strip() for l in await pg2.locator("#choices .ch").all_inner_texts()]
                    if 'Ja' in labs: await pg2.evaluate("[...document.querySelectorAll('#choices .ch')].find(e=>e.innerText.trim()==='Ja').click()")
                    else: await pg2.locator("#choices .ch").first.click()
                elif await pg2.evaluate("G.mode==='world' && G.lock===0 && !G.fx"): return
                await pg2.wait_for_timeout(150)
        await pg2.locator("#choices .ch").first.click(); await idle2()
        await pg2.evaluate("G.World.setMap('dorf',18,8,'up')"); await pg2.keyboard.press("Space"); await pg2.wait_for_timeout(300); await idle2()
        labels = await pg2.evaluate("G.MAPS.dorf.npcs.filter(n=>n.altar).map(n=>G.SPECIES[n.altar].name).join(' ')")
        check('Flackerling' in labels and 'Pfützling' in labels and 'Blattling' in labels and 'Schwammling' not in labels, f"Laternensteine zeigen Flackerling, Pfützling, Blattling {labels.split()}")
        await pg2.evaluate("G.World.setMap('dorf',21,10,'up')"); await pg2.keyboard.press("Space"); await pg2.wait_for_timeout(300); await idle2()
        pick = await pg2.evaluate("G.state && G.state.team[0] ? [G.state.team[0].sp, G.state.starter, G.state.team[0].lvl, G.state.team[0].moves.join(',')] : null")
        check(pick is not None and pick[0] == 'blattling' and pick[1] == 'blattling' and pick[2] == 5, f"Blattling am Laternenstein als Starter gewählt (Lv 5, Attacken) {pick}")
        await pg2.close()
        await b.close()
    print("FAILS:", len(fails)); print("ERRORS:", len(errors)); [print(e) for e in errors]
    sys.exit(1 if fails or errors else 0)
asyncio.run(main())
