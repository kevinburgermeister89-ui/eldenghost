"""v15-Bilder: Spielerfigur gross (4 Richtungen), Aufstellung der 15 neuen Geister mit Chronik-Nummer, Umgebungs-Ereignisse."""
import asyncio, sys
from playwright.async_api import async_playwright
sys.path.insert(0, 'tests')
OUT = '/workspace/shots_v15'
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(executable_path='/usr/bin/google-chrome')
        pg = await b.new_page(viewport={"width": 1400, "height": 900})
        await pg.goto("http://localhost:8080/index.html?nosw=1"); await pg.wait_for_timeout(1500)
        await pg.evaluate("""(()=>{const c=document.createElement('canvas'); c.id='big'; c.width=4*16*10+60; c.height=24*10+20; c.style='position:fixed;left:0;top:0;z-index:99;background:#3a4a3a;image-rendering:pixelated';
          const x=c.getContext('2d'); x.imageSmoothingEnabled=false; ['down','left','right','up'].forEach((d,i)=>{const im=G.SPR.player.walk[d][1]; x.drawImage(im,10+i*(16*10+10),10,(im.lw||im.width)*10,(im.lh||im.height)*10);}); document.body.appendChild(c);})()""")
        await pg.locator('#big').screenshot(path=f'{OUT}/player_big.png')
        await pg.evaluate("""(()=>{document.getElementById('big').remove(); const L=G.NEW15, cols=5, W=260, H=230, c=document.createElement('canvas'); c.id='line'; c.width=cols*W; c.height=Math.ceil(L.length/cols)*H;
          c.style='position:fixed;left:0;top:0;z-index:99'; const x=c.getContext('2d'); x.fillStyle='#16141e'; x.fillRect(0,0,c.width,c.height); x.imageSmoothingEnabled=false;
          L.forEach((k,i)=>{const s=G.SPECIES[k], cx=(i%cols)*W, cy=Math.floor(i/cols)*H; x.drawImage(G.SPR.mon[k].at(160,false),cx+50,cy+8,160,160);
            x.fillStyle='#eee'; x.font='bold 17px sans-serif'; x.textAlign='center'; x.fillText('#'+(G.SPECIES_ORDER.indexOf(k)+1)+' '+s.name, cx+W/2, cy+190);
            x.fillStyle='#aab'; x.font='14px sans-serif'; x.fillText(G.typesOf(k).join(' / ')+'  ·  '+Object.values(s.base).reduce((a,b)=>a+b), cx+W/2, cy+212);}); document.body.appendChild(c);})()""")
        await pg.locator('#line').screenshot(path=f'{OUT}/lineup_new15.png')
        await b.close()
asyncio.run(main())
