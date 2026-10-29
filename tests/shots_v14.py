"""v14-Screenshots: alle 9 Starter-Stufen, Starterwahl, Kampf mit Wirksamkeits-Pop-up, Level-up-Tafel."""
import asyncio, base64, json, sys
from playwright.async_api import async_playwright
def SET(story=4, q1=0, flags='', m='dorf', x=16, y=7, d='down', team="[G.makeMon('flackerling',9)]", v=5, extra=''):
    return ("G.demo=true; G.state={v:%d,map:'%s',player:{x:%d,y:%d,dir:'%s'},team:%s,box:[],items:{laterne:4,kraeutertee:2},flags:{q1:%d,story:%d,tour:1%s},seen:{},caught:{},respawn:null,playtime:0};"
            "G.UI.title(false); G.UI.kind=null; G.UI.handler=null; document.getElementById('choices').className='hidden'; G.mode='world'; G.lock=0; G.debugEncounterRate=1e-9;%s"
            "G.World.setMap('%s',%d,%d,'%s');") % (v, m, x, y, d, team, q1, story, flags, extra, m, x, y, d)
OUT = __file__.rsplit('/', 2)[0] + '/screenshots/'
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(executable_path='/usr/bin/google-chrome')
        # --- Sheet
        pg = await b.new_page(viewport={'width': 1400, 'height': 900})
        await pg.goto("http://localhost:8080/index.html?nosw=1"); await pg.wait_for_timeout(1500)
        data = await pg.evaluate("""()=>{const L=[['flackerling','glutwurm','seelendrache'],['pfuetzling','nebelente','mondschwan'],['blattling','hainfee','feenlinde']];
          const n=96,W=n*2+40,H=n*2+44,c=document.createElement('canvas');c.width=W*3+20;c.height=H*3+60;const g=c.getContext('2d');
          g.fillStyle='#23263f';g.fillRect(0,0,c.width,c.height);g.imageSmoothingEnabled=false;g.fillStyle='#f3e6c4';g.font='bold 22px monospace';g.textAlign='center';
          g.fillText('Eldenghost v14 – Starter-Linien (Lv 14 / Lv 22)',c.width/2,32);
          L.forEach((row,r)=>row.forEach((s,i)=>{const x=10+i*W,y=50+r*H;g.fillStyle='#2e3354';g.fillRect(x+4,y,W-8,H-6);
            g.drawImage(G.Creatures.renderHi(s,n,false,false,false),x+20,y+4,n*2,n*2);const sp=G.SPECIES[s];
            g.fillStyle='#f3e6c4';g.font='bold 14px monospace';g.fillText(sp.name+' · '+sp.types.join('/'),x+W/2,y+H-14);}));
          return c.toDataURL();}""")
        open(OUT + '134_v14_starter_stufen.png', 'wb').write(base64.b64decode(data.split(',')[1]))
        await pg.close()
        ctx = await b.new_context(viewport={"width": 390, "height": 844}, device_scale_factor=2, is_mobile=True, has_touch=True)
        pg = await ctx.new_page(); ev = pg.evaluate
        await pg.goto("http://localhost:8080/index.html?touch=1&nosw=1"); await pg.wait_for_timeout(1500)
        # --- Starterwahl
        await ev(SET(story=1, m='dorf', x=17, y=10, d='up', team='[]')); await pg.wait_for_timeout(400)
        await pg.screenshot(path=OUT + '135_v14_laternensteine.png')
        await pg.keyboard.press('Space'); await pg.wait_for_timeout(2500)
        await pg.screenshot(path=OUT + '136_v14_starterwahl.png')
        # --- Kampf: Pop-up
        async def to_menu():
            for _ in range(300):
                st = await ev("({k:G.UI.kind, ch:[...document.querySelectorAll('#choices .ch')].map(e=>e.textContent.trim())})")
                if st['k'] == 'choose' and any(c == 'Kampf' for c in st['ch']): return
                if st['k'] == 'say': await pg.keyboard.press('Space')
                await pg.wait_for_timeout(60)
        async def click(label):
            await ev(f"[...document.querySelectorAll('#choices .ch')].find(e=>e.textContent.trim().startsWith({json.dumps(label)})).click()")
        team = "[(()=>{const m=G.makeMon('blattling',12); m.moves=['blattwirbel','rankensog','rempler','starren']; G.fillPP(m); return m;})()]"
        await ev(SET(team=team, extra="G.debugNoCrit=true; G.debugHit=true;"))
        asyncio.ensure_future(ev("G.debug.wild('pfuetzling',10).catch(()=>0)")); await to_menu()
        await ev("G.B.enemy.hp=999"); await click('Kampf'); await pg.wait_for_timeout(300)
        await pg.screenshot(path=OUT + '137_v14_menue_hinweis.png')
        await click('Blattwirbel')
        for _ in range(200):
            if 'show' in (await ev("(document.getElementById('effpop')||{}).className||''")): break
            if await ev("G.UI.kind==='say' && !G.UI.typing") : await pg.keyboard.press('Space')
            await pg.wait_for_timeout(30)
        await pg.wait_for_timeout(150); await pg.screenshot(path=OUT + '138_v14_sehr_effektiv.png')
        await ev("G.B.enemy.hp=0")
        for _ in range(150):
            if await ev("G.mode==='world' && !G.B"): break
            if await ev("G.UI.kind") == 'say': await pg.keyboard.press('Space')
            await pg.wait_for_timeout(80)
        # --- Level-up
        team = "[(()=>{const m=G.makeMon('pfuetzling',12); m.xp=G.xpFor(13)-1; m.moves=['rempler']; G.fillPP(m); return m;})()]"
        await ev(SET(team=team, extra="G.debugNoCrit=true; G.debugHit=true;"))
        asyncio.ensure_future(ev("G.debug.wild('schattenmotte',6).catch(()=>0)")); await to_menu()
        await ev("G.B.enemy.hp=1"); await click('Kampf'); await pg.wait_for_timeout(200); await click('Rempler')
        for _ in range(300):
            st = await ev("({k:G.UI.kind, t:document.getElementById('text').textContent, lv:(document.getElementById('lvlup')||{}).className})")
            if st['lv'] == 'show': break
            if st['k'] == 'say' and 'erreicht Level' not in st['t']: await pg.keyboard.press('Space')
            await pg.wait_for_timeout(50)
        await pg.wait_for_timeout(700); await pg.screenshot(path=OUT + '139_v14_level_up.png')
        await b.close()
asyncio.run(main())
