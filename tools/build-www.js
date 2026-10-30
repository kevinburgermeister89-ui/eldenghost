// Kopiert die Web-Quelle (einzige Quelle: Projektwurzel) nach www/ für Capacitor.
const fs = require('fs'), path = require('path');
const root = path.join(__dirname, '..'), out = path.join(root, 'www');
const ITEMS = ['index.html', 'style.css', 'manifest.json', 'sw.js', 'js', 'icons', 'audio'];   // v3: vorgerenderte Musik-Loops + Effekte
const SKIP = new Set(['android', 'splash.png', 'ios-icon-1024.png']); // native-only Assets nicht ins Web-Bundle
fs.rmSync(out, { recursive: true, force: true });
fs.mkdirSync(out, { recursive: true });
function copy(src, dst) {
  const st = fs.statSync(src);
  if (st.isDirectory()) {
    fs.mkdirSync(dst, { recursive: true });
    for (const f of fs.readdirSync(src)) if (!SKIP.has(f)) copy(path.join(src, f), path.join(dst, f));
  } else fs.copyFileSync(src, dst);
}
for (const it of ITEMS) copy(path.join(root, it), path.join(out, it));
console.log('www/ aktualisiert:', ITEMS.join(', '));
