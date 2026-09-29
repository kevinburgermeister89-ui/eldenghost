'use strict';
// Eldenghost – Comic-Pixelstil (angelehnt an Gen-4/5-Handheld-Pixelkunst, eigene Entwürfe)
// Figuren werden aus Formen (Ellipsen, Polygone, Kapseln, Rechtecke, Augen) beschrieben und auf ein Pixelraster gerastert:
// flache Farbflächen mit 3 Stufen (Licht, Grundton, Schatten), Schlagschatten überlappender Teile, dunkle Innenlinien,
// kräftige dunkle Kontur (1 logischer Pixel) und eine kühle Mondlicht-Kante an oberen Rändern. Keine Körnung.
(function (G) {
  const H = h => { const n = parseInt(h.slice(1), 16); return [n >> 16 & 255, n >> 8 & 255, n & 255]; };
  const mix = (a, b, t) => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t];
  const mul = (a, k) => [a[0] * k, a[1] * k, a[2] * k];
  const MOON = [196, 212, 255], INK = [10, 8, 20];
  const rampCache = {};
  function ramp(hex, glow) {
    const key = hex + (glow ? 'g' : ''); if (rampCache[key]) return rampCache[key];
    const c = H(hex);
    const r = glow
      ? { hi: mix(c, [255, 255, 250], 0.62), b: c, sh: mix(c, [255, 255, 255], 0.25), dk: mul(c, 0.7), ol: mix(mul(c, 0.3), INK, 0.5) }
      : { hi: mix(c, [236, 240, 255], 0.34), b: c, sh: mix(mul(c, 0.64), [44, 30, 84], 0.22), dk: mix(mul(c, 0.4), [22, 14, 42], 0.35), ol: mix(mul(c, 0.2), INK, 0.72) };
    return rampCache[key] = r;
  }
  const L = (() => { const v = [-0.5, -0.62, 0.6], n = Math.hypot(...v); return v.map(x => x / n); })();

  // ---------- Formen ----------
  function Shape() { this.p = []; this.back = false; }
  Shape.prototype.add = function (o, def) {
    o = Object.assign({}, def, o);
    if (this.back && o.face) return this;       // Gesicht (Augen, Nase, Bauch) fehlt in der Rückansicht
    if (!this.back && o.backOnly) return this;
    o.i = this.p.length; if (o.g == null) o.g = 'p' + o.i; this.p.push(o); return this;
  };
  // Ellipse (cx, cy, rx, ry, Farbe, Optionen{rot, name, clip, g, flat, glow, line, face})
  Shape.prototype.E = function (cx, cy, rx, ry, col, o = {}) { return this.add(Object.assign({ t: 'E', cx, cy, rx, ry, col, rot: 0 }, o)); };
  Shape.prototype.P = function (pts, col, o = {}) { return this.add(Object.assign({ t: 'P', pts, col }, o)); };
  Shape.prototype.C = function (x0, y0, x1, y1, w, col, o = {}) { return this.add(Object.assign({ t: 'C', x0, y0, x1, y1, w, col }, o)); };
  Shape.prototype.R = function (x, y, w, h, col, o = {}) { return this.add(Object.assign({ t: 'R', x, y, w, h, col }, o)); };
  // grosses Comic-Auge: dunkle Pupille, farbige Iris unten, zwei Glanzpunkte
  Shape.prototype.eye = function (cx, cy, rx, ry, iris, o = {}) {
    const f = { face: true, flat: true, line: false, cast: false };
    if (o.white) this.E(cx, cy, rx + o.white, ry + o.white, '#f2eef8', Object.assign({ name: 'sclera' + cx }, f));
    this.E(cx, cy, rx, ry, o.dark || '#1a1428', Object.assign({ name: 'eye' + cx }, f));
    if (iris) this.E(cx, cy + ry * 0.38, rx * 0.78, ry * 0.5, iris, Object.assign({ clip: 'eye' + cx }, f));
    this.E(cx - rx * 0.32, cy - ry * 0.36, Math.max(0.7, rx * 0.36), Math.max(0.7, ry * 0.3), '#ffffff', Object.assign({ clip: 'eye' + cx }, f));
    if (rx > 2) this.E(cx + rx * 0.4, cy + ry * 0.45, Math.max(0.5, rx * 0.16), Math.max(0.5, ry * 0.14), '#e6e0ff', Object.assign({ clip: 'eye' + cx }, f));
    return this;
  };
  function inside(p, x, y) {
    switch (p.t) {
      case 'E': {
        let dx = x - p.cx, dy = y - p.cy;
        if (p.rot) { const c = Math.cos(p.rot), s = Math.sin(p.rot), rx = dx * c + dy * s; dy = -dx * s + dy * c; dx = rx; }
        const u = dx / p.rx, v = dy / p.ry, q = u * u + v * v; return q <= 1 ? [u, v, q] : null;
      }
      case 'R': return x >= p.x && x < p.x + p.w && y >= p.y && y < p.y + p.h ? [0, 0, 0] : null;
      case 'C': {
        const vx = p.x1 - p.x0, vy = p.y1 - p.y0, l2 = vx * vx + vy * vy || 1;
        const t = Math.max(0, Math.min(1, ((x - p.x0) * vx + (y - p.y0) * vy) / l2));
        const ex = x - (p.x0 + vx * t), ey = y - (p.y0 + vy * t), r = p.w / 2, d2 = ex * ex + ey * ey;
        return d2 <= r * r ? [ex / r, ey / r, d2 / (r * r)] : null;
      }
      case 'P': {
        let c = false; const P = p.pts;
        for (let i = 0, j = P.length - 1; i < P.length; j = i++) {
          const [xi, yi] = P[i], [xj, yj] = P[j];
          if ((yi > y) !== (yj > y) && x < (xj - xi) * (y - yi) / (yj - yi) + xi) c = !c;
        }
        return c ? [0, 0, 0] : null;
      }
    }
  }
  // Licht 0..1 aus Pseudo-Normale (Ellipse/Kapsel gerundet, Polygon/Rechteck über Kantenabtastung)
  function light(p, x, y, hit, k) {
    if (p.t === 'E' || p.t === 'C') {
      let [u, v, q] = hit; if (p.t === 'E' && p.rot) { const c = Math.cos(-p.rot), s = Math.sin(-p.rot), a = u * c + v * s; v = -u * s + v * c; u = a; }
      const nz = Math.sqrt(Math.max(0, 1 - Math.min(1, q)));
      let I = u * L[0] + v * L[1] + nz * L[2];
      if (p.flatten) I = 0.62 + (I - 0.62) * p.flatten;
      return I;
    }
    const d = 1.6 / k; let I = 0.62;
    if (!inside(p, x + d * 1.1, y + d * 1.5)) I = 0.3;
    else if (!inside(p, x - d * 0.8, y - d)) I = 0.95;
    return I;
  }
  // Rastern: N×M Pixel, Designraum 64 Einheiten breit (k = Pixel pro Einheit), opt: {mirror, oy, breathe, ground}
  function raster(S, W, Hh, k, opt = {}) {
    const P = S.p, n = W * Hh, id = new Int16Array(n).fill(-1), lit = new Float32Array(n), col = new Array(n);
    const gy = opt.ground ?? 60, br = opt.breathe || 1, ox = opt.ox || 0, oy = opt.oy || 0;
    for (let py = 0; py < Hh; py++) for (let px = 0; px < W; px++) {
      let x = ((opt.mirror ? W - px - 0.5 : px + 0.5)) / k - ox, y = (py + 0.5) / k - oy; // mirror: am Bildmittelpunkt gespiegelt
      if (br !== 1) { y = gy - (gy - y) / br; x = 32 + (x - 32) / (1 + (br - 1) * 0.4); }
      let top = -1, hit = null;
      for (let i = 0; i < P.length; i++) {
        const p = P[i];
        if (p.clip != null) { if (top < 0) continue; const tp = P[top]; if (tp.name !== p.clip && tp.g !== p.clip) continue; }
        const h = inside(p, x, y); if (h) { top = i; hit = h; }
      }
      if (top < 0) continue;
      const j = py * W + px; id[j] = top; lit[j] = P[top].flat ? 0.62 : light(P[top], x, y, hit, k);
    }
    // Farbe: 3 Stufen + Schlagschatten von darüberliegenden Teilen (oben links)
    const at = (x, y) => x >= 0 && y >= 0 && x < W && y < Hh ? id[y * W + x] : -1;
    const out = new Uint8ClampedArray(n * 4);
    for (let py = 0; py < Hh; py++) for (let px = 0; px < W; px++) {
      const j = py * W + px, i = id[j]; if (i < 0) continue;
      const p = P[i], R = ramp(p.col, p.glow); let c;
      if (p.flat) c = R.b;
      else {
        let I = lit[j];
        const oc = at(px - 1, py - 2), oc2 = at(px, py - 2);
        const occ = [oc, oc2].some(o => o > i && P[o].g !== p.g && P[o].cast !== false && P[o].clip == null && !P[o].flat);
        if (p.glow) c = I > 0.72 ? R.hi : I > 0.35 ? R.b : R.sh;
        else {
          let s = I > (p.hiAt ?? 0.9) ? 2 : I > (p.shAt ?? 0.42) ? 1 : 0;
          if (occ) s = Math.min(s, 1) - 1;
          c = s >= 2 ? R.hi : s === 1 ? R.b : s === 0 ? R.sh : R.dk;
        }
        // Innenlinie: Rand zu einem tieferliegenden Teil einer anderen Gruppe
        if (p.line !== false && p.clip == null) for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
          const q = at(px + dx, py + dy); if (q >= 0 && q < i && P[q].g !== p.g && !(P[q].clip != null && P[q].clip === p.name)) { c = p.glow ? R.sh : R.dk; break; }
        }
        // Mondlicht-Kante: obere Silhouettenkante kühl aufgehellt
        if (!p.glow && at(px, py - 1) < 0) c = mix(c, MOON, 0.46);
      }
      out[j * 4] = c[0]; out[j * 4 + 1] = c[1]; out[j * 4 + 2] = c[2]; out[j * 4 + 3] = p.alpha ? p.alpha * 255 : 255;
    }
    // Aussenkontur: dunkel, einheitlich, 1 Pixel (8er-Nachbarschaft = kräftig)
    for (let py = 0; py < Hh; py++) for (let px = 0; px < W; px++) {
      const j = py * W + px; if (id[j] >= 0) continue;
      let q = -1, diag = false;
      for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) { const t = at(px + dx, py + dy); if (t >= 0 && !P[t].noOutline) { q = t; break; } }
      if (q < 0) for (const [dx, dy] of [[1, 1], [-1, -1], [1, -1], [-1, 1]]) { const t = at(px + dx, py + dy); if (t >= 0 && !P[t].noOutline) { q = t; diag = true; break; } }
      if (q < 0 || (diag && opt.thin)) continue;
      const c = mix(ramp(P[q].col, P[q].glow).ol, INK, 0.45);
      out[j * 4] = c[0]; out[j * 4 + 1] = c[1]; out[j * 4 + 2] = c[2]; out[j * 4 + 3] = P[q].alpha ? P[q].alpha * 255 : 255;
    }
    const cv = G.mk(W, Hh), g = cv.getContext('2d', { willReadFrequently: true });
    g.putImageData(new ImageData(out, W, Hh), 0, 0);
    return cv;
  }
  G.Art = { Shape, raster, ramp, H };
})(window.G);
