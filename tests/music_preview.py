"""v15: Offline-Vorschau aller Stücke (OfflineAudioContext, gleiche Kette wie live): Spitze/RMS, kein Clipping, keine Stille,
Stimmenzahl; schreibt WAV-Dateien nach /workspace/music_previews."""
import asyncio, base64, json, sys, wave, os
from playwright.async_api import async_playwright
SEC = float(sys.argv[1]) if len(sys.argv) > 1 else 40
OUT = '/workspace/music_previews'
async def main():
    os.makedirs(OUT, exist_ok=True)
    async with async_playwright() as p:
        b = await p.chromium.launch(executable_path='/usr/bin/google-chrome')
        pg = await b.new_page(); errs = []
        pg.on("pageerror", lambda e: errs.append(str(e)))
        await pg.goto("http://localhost:8080/index.html?nosw=1"); await pg.wait_for_timeout(1200)
        names = await pg.evaluate("G.Snd.tracksAvailable()")
        res = []
        for n in names:
            r = await pg.evaluate(f"G.Snd.renderPreview('{n}', {SEC})")
            pcm = base64.b64decode(r.pop('pcm'))
            with wave.open(f"{OUT}/{n}.wav", 'wb') as w: w.setnchannels(1); w.setsampwidth(2); w.setframerate(int(r['rate'])); w.writeframes(pcm)
            res.append(r); print(json.dumps(r), flush=True)
        json.dump(res, open(f"{OUT}/stats.json", 'w'), indent=1)
        print("errors", errs); await b.close()
asyncio.run(main())
