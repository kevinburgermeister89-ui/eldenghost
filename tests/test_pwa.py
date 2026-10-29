import asyncio
from playwright.async_api import async_playwright
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(executable_path="/usr/bin/google-chrome")
        ctx = await b.new_context(); pg = await ctx.new_page(); errs = []
        pg.on("pageerror", lambda e: errs.append(str(e)))
        pg.on("console", lambda m: errs.append(m.text) if m.type == "error" else None)
        await pg.goto("http://localhost:8080/index.html")
        await pg.wait_for_function("navigator.serviceWorker && navigator.serviceWorker.controller || false", timeout=15000) if False else None
        reg = await pg.evaluate("navigator.serviceWorker.ready.then(r => r.active && r.active.state)")
        await pg.wait_for_timeout(1500)
        man = await pg.evaluate("fetch('manifest.json').then(r=>r.json())")
        cached = await pg.evaluate("caches.keys().then(ks=>Promise.all(ks.map(k=>caches.open(k).then(c=>c.keys()).then(r=>[k,r.length]))))")
        await pg.reload(); await pg.wait_for_timeout(500)
        await ctx.set_offline(True)
        await pg.reload(); await pg.wait_for_timeout(1000)
        offline_ok = await pg.evaluate("!!(window.G && G.SPR) && document.querySelectorAll('#choices .ch').length")
        print("SW:", reg, "| manifest:", man["name"], man["display"], man["orientation"], [i["sizes"] + "/" + i["purpose"] for i in man["icons"]])
        print("cache:", cached, "| offline reload title buttons:", offline_ok, "| errors:", errs)
        await b.close()
asyncio.run(main())
