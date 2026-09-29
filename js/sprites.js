'use strict';
// Eldenghost – prozedural gezeichnete Pixel-Sprites
(function (G) {
  const mk = (w, h) => { const c = document.createElement('canvas'); c.width = w; c.height = h; return c; };
  const RF = { willReadFrequently: true };
  const pen = g => ({
    r: (x, y, w, h, c) => { g.fillStyle = c; g.fillRect(x, y, w, h); },
    p: (x, y, c) => { g.fillStyle = c; g.fillRect(x, y, 1, 1); },
    e: (cx, cy, rx, ry, c) => {
      g.fillStyle = c;
      for (let y = -ry; y <= ry; y++) for (let x = -rx; x <= rx; x++)
        if ((x * x) / (rx * rx + rx * 0.6 + 0.01) + (y * y) / (ry * ry + ry * 0.6 + 0.01) <= 1) g.fillRect(cx + x, cy + y, 1, 1);
    }
  });

  // ---------- Hochauflösung ----------
  // Alle Grafiken werden in logischen Koordinaten (256×240) gezeichnet. Hochaufgelöste Leinwände (.s = Faktor)
  // tragen ihre logische Grösse (.lw/.lh); drawImage rechnet automatisch um, sodass sie 1:1 auf feine Pixel fallen.
  const RS = G.RS = 2;
  const DI = CanvasRenderingContext2D.prototype.drawImage;
  G.rawDraw = (g, ...a) => DI.apply(g, a);
  CanvasRenderingContext2D.prototype.drawImage = function (img, a, b, c, d, e, f, g, h) {
    const s = img && img.s;
    if (!s || s === 1) return DI.apply(this, arguments);
    if (arguments.length === 3) return DI.call(this, img, a, b, img.lw, img.lh);
    if (arguments.length === 5) return DI.call(this, img, a, b, c, d);
    return DI.call(this, img, a * s, b * s, c * s, d * s, e, f, g, h);
  };
  // Leinwand mit s-facher Auflösung; ihr Kontext ist bereits skaliert (Zeichnen in logischen Koordinaten)
  const mkHi = (w, h, s = RS) => {
    const c = mk(Math.round(w * s), Math.round(h * s)); c.s = s; c.lw = w; c.lh = h;
    const gc = c.getContext.bind(c); let g0 = null;
    c.getContext = (type, opts) => { if (!g0) { g0 = gc(type, opts || RF); g0.setTransform(s, 0, 0, s, 0, 0); g0.imageSmoothingEnabled = false; } return g0; };
    return c;
  };
  const like = src => { const c = src.s ? mkHi(src.lw, src.lh, src.s) : mk(src.width, src.height); return c; };
  // Kantengerichtetes 2×-Hochskalieren (Scale2x/EPX): Treppenstufen werden zu feinen Diagonalen, ohne Unschärfe
  function scale2x(src) {
    const w = src.width, h = src.height, sd = new Uint32Array(src.getContext('2d', RF).getImageData(0, 0, w, h).data.buffer);
    const c = mkHi(w, h, 2), g = c.getContext('2d'), W = w * 2, img = g.createImageData(W, h * 2), o = new Uint32Array(img.data.buffer);
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
      const P = sd[y * w + x], A = y > 0 ? sd[(y - 1) * w + x] : P, B = x < w - 1 ? sd[y * w + x + 1] : P,
        C = x > 0 ? sd[y * w + x - 1] : P, D = y < h - 1 ? sd[(y + 1) * w + x] : P;
      let p1 = P, p2 = P, p3 = P, p4 = P;
      if (C === A && C !== D && A !== B) p1 = A;
      if (A === B && A !== C && B !== D) p2 = B;
      if (D === C && D !== B && C !== A) p3 = C;
      if (B === D && B !== A && D !== C) p4 = D;
      const i = y * 2 * W + x * 2; o[i] = p1; o[i + 1] = p2; o[i + W] = p3; o[i + W + 1] = p4;
    }
    g.putImageData(img, 0, 0);
    return c;
  }
  const hx = (x, y) => { let v = (x * 374761393 + y * 668265263) | 0; v = Math.imul(v ^ (v >>> 13), 1274126177); return ((v ^ (v >>> 16)) >>> 0) / 4294967296; };
  const rgb = hex => { const n = parseInt(hex.slice(1), 16); return [n >> 16 & 255, n >> 8 & 255, n & 255]; };
  // Feinschliff für Figuren: 2× hochskalieren, dann auf feinen Pixeln Mondlicht-Kante (oben/links), Schattenkante,
  // leichte Körnung (Fell, Moos, Stein) und eine dünne Kontur (1 feiner Pixel, Ecken halbtransparent)
  function finish(src, col, o = {}) {
    const c = scale2x(src), g = c.getContext('2d'), w = c.width, h = c.height, img = g.getImageData(0, 0, w, h), d = img.data;
    const al = new Uint8Array(w * h); for (let i = 0; i < w * h; i++) al[i] = d[i * 4 + 3] > 40 ? 1 : 0;
    const A = (x, y) => x >= 0 && y >= 0 && x < w && y < h && al[y * w + x];
    const rim = o.rim ?? 0.2, shade = o.shade ?? 0.22, grain = o.grain ?? 0.08, vol = o.vol ?? 0.2, hatch = o.hatch ?? 0.06, [or, og, ob] = rgb(col);
    // Volumen: Lage innerhalb der senkrechten/waagrechten Pixelstrecke (oben/links hell, unten/rechts dunkel)
    const vy = new Float32Array(w * h), vx = new Float32Array(w * h);
    for (let x = 0; x < w; x++) for (let y = 0; y < h;) { if (!al[y * w + x]) { y++; continue; } let e = y; while (e < h && al[e * w + x]) e++; const n = e - y; for (let j = y; j < e; j++) vy[j * w + x] = n > 3 ? (j - y) / (n - 1) - 0.5 : 0; y = e; }
    for (let y = 0; y < h; y++) for (let x = 0; x < w;) { if (!al[y * w + x]) { x++; continue; } let e = x; while (e < w && al[y * w + e]) e++; const n = e - x; for (let j = x; j < e; j++) vx[y * w + j] = n > 3 ? (j - x) / (n - 1) - 0.5 : 0; x = e; }
    const L = i => (d[i * 4] * 3 + d[i * 4 + 1] * 5 + d[i * 4 + 2] * 2) / 10, lum0 = new Float32Array(w * h); for (let i = 0; i < w * h; i++) lum0[i] = L(i);
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
      const i = y * w + x, k = i * 4;
      if (al[i]) {
        let f = 1 + (hx(x, y) - 0.5) * grain - vy[i] * vol - vx[i] * vol * 0.45;
        if ((x + 2 * y) % 5 === 0 && hx(x >> 1, y) < 0.6) f -= hatch;                  // feine Fell-/Federstriche
        // Tuschlinie an inneren Farbgrenzen: der dunklere Nachbar bekommt eine feine dunkle Kante
        for (const j of [i + 1, i + w]) if ((j === i + 1 ? x < w - 1 : y < h - 1) && al[j] && lum0[j] - lum0[i] > 38) { f -= 0.2; break; }
        if (!A(x, y - 1) || !A(x - 1, y)) f += rim; else if (!A(x, y - 2)) f += rim * 0.4;
        if (!A(x, y + 1) || !A(x + 1, y)) f -= shade; else if (!A(x, y + 2)) f -= shade * 0.45;
        const lum = (d[k] + d[k + 1] + d[k + 2]) / 3;
        if (lum > 205) f = 1 + (f - 1) * 0.25; // Leuchtpunkte bleiben klar
        d[k] = Math.min(255, d[k] * f); d[k + 1] = Math.min(255, d[k + 1] * f); d[k + 2] = Math.min(255, d[k + 2] * f);
      } else {
        const n4 = A(x - 1, y) || A(x + 1, y) || A(x, y - 1) || A(x, y + 1);
        const n8 = n4 || A(x - 1, y - 1) || A(x + 1, y - 1) || A(x - 1, y + 1) || A(x + 1, y + 1);
        if (n4) { d[k] = or; d[k + 1] = og; d[k + 2] = ob; d[k + 3] = 255; }
        else if (n8) { d[k] = or; d[k + 1] = og; d[k + 2] = ob; d[k + 3] = 120; }
      }
    }
    g.putImageData(img, 0, 0);
    return c;
  }
  // 1×-Kontur (für Hilfsgrafiken, die nicht hochskaliert werden)
  function outline1(c, col) {
    const g = c.getContext('2d', RF), w = c.width, h = c.height, d = g.getImageData(0, 0, w, h).data, pts = [];
    const A = (x, y) => x >= 0 && y >= 0 && x < w && y < h && d[(y * w + x) * 4 + 3] > 40;
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++)
      if (!A(x, y) && (A(x - 1, y) || A(x + 1, y) || A(x, y - 1) || A(x, y + 1))) pts.push(x, y);
    g.fillStyle = col;
    for (let i = 0; i < pts.length; i += 2) g.fillRect(pts[i], pts[i + 1], 1, 1);
    return c;
  }
  const outline = (c, col) => finish(c, col, { vol: 0.14, hatch: 0.03 });
  function tint(src, col) {
    const c = like(src), g = c.getContext('2d', RF);
    g.save(); g.setTransform(1, 0, 0, 1, 0, 0); G.rawDraw(g, src, 0, 0); g.globalCompositeOperation = 'source-in'; g.fillStyle = col; g.fillRect(0, 0, c.width, c.height); g.restore();
    return c;
  }
  function mirror(src) {
    const c = like(src), g = c.getContext('2d', RF);
    g.save(); g.setTransform(1, 0, 0, 1, 0, 0); g.translate(src.width, 0); g.scale(-1, 1); G.rawDraw(g, src, 0, 0); g.restore(); return c;
  }
  G.mkHi = mkHi; G.scale2x = scale2x; G.finish = finish; G.outline1 = outline1;
  G.mk = mk; G.pen = pen;

  G.FLY = { laternchen: 1, totenleuchte: 1, schattenmotte: 1, grabfalter: 1, hauchling: 0.5, flatterhauch: 1, tiefenkalb: 0.6, nebelwal: 0.5, aschephoenix: 0.6, fyrlumen: 1 };
  // ---------- Geister: Comic-Pixelstil aus js/creatures.js (vorne 64, hinten 80, Boss 84 Pixel, beliebige Grössen per at()) ----------
  // Geister werden erst bei Bedarf gerastert (2× fein, hochaufgelöst): Vorderansicht, Atem, Blinzeln; Rück- und Bossansicht
  G.SPR = { mon: {} };
  const lazy = (o, k, f) => Object.defineProperty(o, k, { configurable: true, enumerable: true, get() { const v = f(); Object.defineProperty(o, k, { value: v, enumerable: true }); return v; } });
  for (const sp in G.Creatures.DEF) {
    const R = G.Creatures.render, H = G.Creatures.renderHi, o = { at: (n, blink) => H(sp, n, false, false, blink) };
    lazy(o, 'img', () => H(sp, 64)); lazy(o, 'img2', () => H(sp, 64, false, true)); lazy(o, 'imgBlink', () => H(sp, 64, false, false, true));
    lazy(o, 'back', () => H(sp, 80, true)); lazy(o, 'back2', () => H(sp, 80, true, true));
    lazy(o, 'big', () => H(sp, 84)); lazy(o, 'big2', () => H(sp, 84, false, true)); lazy(o, 'bigBlink', () => H(sp, 84, false, false, true));
    lazy(o, 'white', () => tint(o.img, '#f4f0ff')); lazy(o, 'whiteBack', () => tint(o.back, '#f4f0ff')); lazy(o, 'whiteBig', () => tint(o.big, '#f4f0ff'));
    lazy(o, 'dark', () => tint(o.img, '#231c38')); lazy(o, 'icon', () => o.img.toDataURL()); lazy(o, 'darkIcon', () => o.dark.toDataURL());
    G.SPR.mon[sp] = o;
  }
  // Spieler, Dorfbewohner und Seelenfänger: js/people.js
})(window.G);
