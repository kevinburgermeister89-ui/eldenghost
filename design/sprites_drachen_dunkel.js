'use strict';
// NUR ENTWURF – nicht im Spiel geladen (index.html bindet diese Datei nicht ein).
// 20 Drache-/Dunkel-Geister aus design/drachen_dunkel_ghosts.md, gezeichnet mit derselben Technik wie js/creatures.js:
// Formen (E/P/C/R/eye) im 64×64-Designraum, Boden y≈60, Blick nach links, gerastert von G.Art.raster über G.Creatures.renderHi.
// Zum Ansehen: /workspace/dd_render.py (Headless-Browser) -> /workspace/shots_drachen_dunkel/*.png
(function () {
  const F = { face: true }, B = { backOnly: true };
  const X = (o, p) => Object.assign({}, o, p);
  const WISP = { alpha: 0.5, flat: true, noOutline: true, cast: false };
  const halo = (S, x, y, r, c, a) => S.E(x, y, r, r, c, X(F, { glow: true, alpha: a || 0.35, flat: true, noOutline: true, cast: false }));
  const spark = (S, pts, c) => { for (const [x, y, r] of pts) S.E(x, y, r || 1, r || 1, c, { glow: true }); };
  const DEF = {
    // ---------------- Drache ----------------
    nebelwuermchen(S) { // kleiner eingerollter Wurm aus Morgennebel, zwei Laternenaugen, Moos auf dem Rücken
      const mi = '#a8b6d4', mi2 = '#7c8ab0', bel = '#e6eaf6', mo = '#6a9a48', mo2 = '#4e7a36', gl = '#ffd070', horn = '#ece4cc';
      for (const [x0, y0, x1, y1, w] of [[50, 36, 60, 30, 3], [8, 52, 2, 46, 2.6], [46, 30, 52, 22, 2.2]]) S.C(x0, y0, x1, y1, w, '#c8d4ee', WISP);
      S.C(48, 54, 56, 49, 6, mi, { g: 'tail' }).C(56, 49, 55, 42, 4.6, mi, { g: 'tail' }).C(55, 42, 50, 41, 3.4, mi, { g: 'tail' }).E(49.6, 44, 2, 2, mi2, { g: 'tail' });
      S.E(38, 52, 13, 8, mi, { name: 'body', g: 'body' });
      S.E(35, 56.5, 10, 3.2, bel, X(F, { clip: 'body', line: false }));
      for (const x of [30, 35, 40]) S.C(x, 54, x + 1, 59, 0.6, '#c4cce4', X(F, { clip: 'body', flat: true, line: false }));
      S.E(37, 45.4, 7, 2.6, mo, { g: 'moss' }).E(44, 46.6, 4, 2, mo2, { g: 'moss' }).E(31, 46.8, 3.4, 1.8, mo2, { g: 'moss' });
      for (const [x, y] of [[35, 43], [39, 42.6], [44, 44.6]]) S.C(x, y + 1.4, x - 0.6, y - 1.2, 0.8, '#8ac860', { flat: true, line: false, g: 'moss' });
      S.C(29, 52, 23, 42, 9, mi, { g: 'neck' });
      S.C(26, 53, 22, 44, 3.6, bel, X(F, { g: 'neck', line: false }));
      S.P([[20, 30], [22, 23], [25, 30]], horn, { g: 'horn' }).P([[25, 31], [29, 25], [29, 33]], horn, { g: 'horn' });
      S.E(21, 36, 9.5, 8, mi, { name: 'head', g: 'head' }).E(12.5, 39, 5, 4, mi, { g: 'head' });
      S.E(22, 30, 4, 1.6, mo, { clip: 'head', line: false });
      halo(S, 16.5, 35, 4.4, gl); halo(S, 24, 35, 4.6, gl);
      S.eye(16.5, 35, 2.6, 3, gl, { dark: '#5a3a10', white: 0.4 }).eye(24, 35, 2.8, 3.2, gl, { dark: '#5a3a10', white: 0.4 });
      S.E(9, 38, 0.9, 0.8, '#2a2a40', X(F, { flat: true }));
      S.C(10, 41.6, 15, 42, 0.8, '#2a2a40', X(F, { flat: true, line: false }));
      S.E(22, 32, 5, 2.4, mi2, X(B, { clip: 'head', line: false }));
      spark(S, [[6, 30], [58, 58], [12, 22, 0.8]], '#fff0c0');
    },
    dunstwyrm(S) { // langer Nebelkörper, Mähne aus Weidenzweigen, schimmernde Schuppen
      const mi = '#8c9ccc', mi2 = '#5e6e9e', bel = '#dce4f6', wi = '#8abc58', wi2 = '#5e9038', gl = '#dff4ff', horn = '#ece4cc';
      for (const [x0, y0, x1, y1, w] of [[58, 30, 64, 22, 3], [4, 54, 0, 46, 2.6]]) S.C(x0, y0, x1, y1, w, '#c4d0ee', WISP);
      const sp = [[62, 46, 3], [56, 52, 5], [48, 55, 7], [40, 52, 8], [36, 44, 8.4], [30, 38, 8.4], [24, 36, 8]];
      for (let i = 0; i < sp.length - 1; i++) S.C(sp[i][0], sp[i][1], sp[i + 1][0], sp[i + 1][1], sp[i + 1][2], mi, { g: 'body', name: i === 3 ? 'mid' : undefined });
      S.C(56, 54, 44, 58, 2.4, bel, X(F, { flat: true, line: false })).C(37, 48, 32, 42, 2.4, bel, X(F, { flat: true, line: false }));
      for (const [x, y] of [[50, 51], [44, 49], [40, 44], [55, 49], [34, 38]]) S.E(x, y, 1.2, 0.9, gl, { glow: true, flat: true, line: false });
      S.C(46, 56, 47, 61, 3, mi2, { g: 'legB' }).C(33, 50, 31, 60, 3.4, mi, { g: 'legF' }).E(30, 60, 2.4, 1.2, horn);
      S.P([[18, 22], [22, 12], [25, 22]], horn, { g: 'horn' }).P([[23, 24], [30, 15], [29, 26]], horn, { g: 'horn' });
      S.E(19, 28, 9, 7, mi, { name: 'head', g: 'head' }).E(9.5, 31, 6, 3.8, mi, { g: 'head' });
      S.E(11, 33.6, 6, 1.6, bel, X(F, { clip: 'head', line: false }));
      for (const [x0, y0, x1, y1] of [[24, 24, 26, 40], [27, 25, 32, 42], [29, 30, 36, 46], [33, 34, 40, 50], [22, 26, 21, 38]]) S.C(x0, y0, x1, y1, 1.4, wi, { g: 'mane' });
      for (const [x, y] of [[26, 34], [31, 38], [35, 44], [39, 48], [21, 34], [28, 29]]) S.E(x, y, 1.6, 0.9, wi2, { rot: 1, g: 'mane' });
      S.C(4, 31, -1, 26, 0.6, '#6a7aa8').C(4, 32, 0, 36, 0.6, '#6a7aa8');
      S.eye(16, 27, 2.2, 2.6, '#b8ecff', { dark: '#2a3a6a', white: 0.5 }).eye(22, 27, 2.4, 2.8, '#b8ecff', { dark: '#2a3a6a', white: 0.5 });
      S.E(4.6, 30, 0.9, 0.8, '#2a2a40', X(F, { flat: true }));
      spark(S, [[10, 10], [44, 30], [60, 60, 0.8]], gl);
    },
    nebelkoenigswyrm(S) { // schwebender Wyrm mit Sternenmuster, Krone aus Mondlicht-Tropfen
      const sk = '#4c4c94', sk2 = '#323272', bel = '#cdc4f0', st = '#fff4c0', drop = '#e4eeff', drop2 = '#c8a8ff', mane = '#8ab0ff';
      S.E(36, 60, 18, 2.4, '#8a90c8', { alpha: 0.35, flat: true, noOutline: true, cast: false });
      for (const [x0, y0, x1, y1, w] of [[56, 58, 64, 54, 2.6], [10, 58, 2, 56, 2.4]]) S.C(x0, y0, x1, y1, w, '#a8b0e0', WISP);
      const sp = [[60, 30, 3], [62, 38, 4.6], [58, 47, 6.4], [50, 52, 8], [40, 52, 9], [32, 46, 9], [30, 38, 8.4], [28, 30, 8]];
      for (let i = 0; i < sp.length - 1; i++) S.C(sp[i][0], sp[i][1], sp[i + 1][0], sp[i + 1][1], sp[i + 1][2], sk, { g: 'body' });
      S.P([[60, 30], [64, 24], [57, 27]], mane, { glow: true, g: 'body' }).P([[60, 31], [62, 22], [56, 29]], mane, { glow: true, alpha: 0.7, g: 'body' });
      S.C(50, 56, 40, 56, 2.6, bel, X(F, { flat: true, line: false })).C(34, 50, 33, 42, 2.6, bel, X(F, { flat: true, line: false }));
      for (const [x, y, r] of [[56, 44, 1], [48, 49, 1.3], [42, 48, 0.9], [36, 44, 1.2], [33, 36, 1], [44, 54, 0.8], [60, 38, 0.9], [38, 50, 0.7]]) S.P([[x - r * 1.6, y], [x, y - r * 1.6], [x + r * 1.6, y], [x, y + r * 1.6]], st, { glow: true, line: false });
      S.C(40, 54, 38, 58, 3, sk2, { g: 'legB' }).E(37.6, 58.4, 2, 1.2, '#e8e0f8');
      for (const [x0, y0, x1, y1] of [[30, 24, 40, 30], [32, 28, 42, 36], [33, 33, 40, 42]]) S.C(x0, y0, x1, y1, 2, mane, { glow: true, g: 'mane' });
      S.E(22, 25, 9, 7.4, sk, { name: 'head', g: 'head' }).E(12, 28, 6, 4, sk, { g: 'head' });
      S.E(13, 30.6, 6.4, 1.6, bel, X(F, { clip: 'head', line: false }));
      S.E(22, 22, 1.2, 1.2, st, { glow: true, clip: 'head', line: false });
      S.C(16, 17, 30, 17.6, 1.4, '#c8d0ff', { glow: true, g: 'crown' });
      for (const [x, y, h, c] of [[16, 16, 4, drop2], [20, 15, 6, drop], [24, 14.6, 7.4, drop], [28, 15, 6, drop], [31.4, 16, 4, drop2]]) { S.E(x, y - h * 0.45, 1.6, 1.8, c, { glow: true, g: 'crown' }); S.P([[x - 1.5, y - h * 0.45], [x, y - h - 1.4], [x + 1.5, y - h * 0.45]], c, { glow: true, g: 'crown' }); }
      halo(S, 18, 24.6, 3.6, '#c8a8ff', 0.3); halo(S, 25, 24.6, 3.8, '#c8a8ff', 0.3);
      S.eye(18, 24.6, 2.2, 2.6, '#f0b8ff', { dark: '#4a2a7a', white: 0.5 }).eye(25, 24.6, 2.4, 2.8, '#f0b8ff', { dark: '#4a2a7a', white: 0.5 });
      S.E(7, 27.4, 0.9, 0.8, '#1a1430', X(F, { flat: true }));
      S.C(6, 28, 1, 24, 0.7, mane, { glow: true }).C(6, 29.4, 1, 33, 0.7, mane, { glow: true });
      spark(S, [[6, 8], [46, 6, 1.2], [56, 16], [2, 44], [40, 20, 0.8]], st);
    },
    moosdrachling(S) { // gedrungene Echse mit Farnwedel-Kamm, Pilzhüte als Hörner
      const sk = '#5e8c4a', sk2 = '#3e6632', bel = '#e0d6a4', fe = '#86c050', fe2 = '#5a9434', cap = '#c8603a', st = '#f0e4c8';
      S.C(44, 54, 56, 54, 6.4, sk, { g: 'tail' }).C(56, 54, 61, 47, 4.6, sk, { g: 'tail' });
      S.P([[61, 47], [63, 40], [58, 44]], fe, { g: 'tail' });
      S.C(44, 50, 46, 59, 6.6, sk2, { g: 'legB' });
      S.E(37, 47, 15, 11.5, sk, { name: 'body', g: 'body' });
      S.E(31, 51, 9, 7, bel, X(F, { clip: 'body', line: false }));
      for (const y of [48, 51.5, 55]) S.C(24, y, 36, y, 0.7, '#c4b884', X(F, { clip: 'body', flat: true, line: false }));
      for (const [x, y, h, r] of [[33, 36, 13, -0.3], [40, 36, 12, 0.1], [47, 39, 10, 0.4]]) {
        const tx = x + Math.sin(r) * h, ty = y - Math.cos(r) * h;
        DD.H.fern(S, x, y, h, r, r < 0 ? -0.9 : 0.9, fe, fe2); void tx; void ty;
      }
      for (const [x, y] of [[38, 41], [45, 44], [43, 51]]) S.E(x, y, 2.2, 1.6, sk2, { clip: 'body', flat: true, line: false });
      S.C(27, 52, 26, 59, 6.6, sk, { g: 'legF' }).C(35, 53, 35, 59, 6.6, sk, { g: 'legF' });
      for (const x of [23.6, 26.2, 32.6, 35.2]) S.C(x, 59, x - 1, 60.6, 1.2, st);
      S.C(16, 25, 15, 18, 2.2, st, { g: 'shroom' }).E(15, 17, 5, 3, cap, { name: 'capL', g: 'shroom' });
      S.C(26, 24, 28, 16, 2.4, st, { g: 'shroom' }).E(28.4, 15, 5.6, 3.4, cap, { name: 'capR', g: 'shroom' });
      for (const [x, y, c] of [[13.4, 16, 'capL'], [16.8, 15.6, 'capL'], [26.4, 14, 'capR'], [30, 13.6, 'capR'], [28.6, 16.4, 'capR']]) S.E(x, y, 0.9, 0.8, st, { clip: c, flat: true, line: false });
      S.E(21, 31, 12, 9.5, sk, { name: 'head', g: 'head' }).E(10.5, 35, 6.4, 4.6, sk, { g: 'head' });
      S.E(13, 38.4, 8, 2.6, bel, X(F, { clip: 'head', line: false }));
      S.eye(16, 30, 3, 3.6, '#f0d040', { white: 0.5 }).eye(24.4, 30, 3.2, 3.8, '#f0d040', { white: 0.5 });
      S.E(5.4, 33.6, 1, 0.9, '#1a1e14', X(F, { flat: true }));
      S.C(6, 38, 12, 38.6, 0.9, '#1a1e14', X(F, { flat: true, line: false }));
      S.E(26, 26, 6, 3, sk2, X(B, { clip: 'head', line: false }));
      spark(S, [[6, 22], [56, 30], [4, 50, 0.8]], '#d8ff90');
    },
    farnwyrm(S) { // breiter Wyrm, auf dem Rücken ein kleiner Farnwald mit Glühwürmchen
      const sk = '#4e7a48', sk2 = '#34563a', bel = '#d4cc9c', fe = '#7cbc4c', fe2 = '#4e8a34', ff = '#e8ff70', horn = '#e8dcc0', bark = '#6a4a34';
      S.C(50, 56, 60, 58, 7, sk, { g: 'tail' }).C(60, 58, 64, 52, 4.6, sk, { g: 'tail' });
      S.C(50, 52, 52, 60, 7, sk2, { g: 'legB' });
      S.E(38, 49, 20, 11, sk, { name: 'body', g: 'body' });
      S.E(33, 54.6, 14, 5, bel, X(F, { clip: 'body', line: false }));
      for (let i = 0; i < 5; i++) S.C(22 + i * 5, 52, 23 + i * 5, 59, 0.7, '#b8b080', X(F, { clip: 'body', flat: true, line: false }));
      S.E(40, 39, 15, 3.4, '#5a4434', { g: 'soil' }).E(40, 38, 13, 2.2, '#4e7a34', { g: 'soil', flat: true });
      const frond = (x, y, h, r, c, c2) => DD.H.fern(S, x, y, h, r, r < 0.1 ? -0.8 : 0.8, c, c2);
      S.C(44, 38, 45, 26, 2.2, bark, { g: 'fern' }).E(45, 23, 5, 4, fe2, { g: 'fern' }).E(48, 25, 3.4, 3, fe, { g: 'fern' });
      frond(30, 38, 12, -0.4, fe, fe2); frond(36, 37, 14, -0.1, fe, fe2); frond(40, 38, 10, 0.25, fe2, sk2); frond(50, 38, 12, 0.35, fe, fe2); frond(54, 39, 8, 0.7, fe2, sk2);
      for (const [x, y] of [[26, 24], [34, 18], [42, 27], [52, 20], [58, 30], [30, 30], [48, 14]]) { halo(S, x, y, 2.6, ff, 0.3); S.E(x, y, 1, 1, ff, { glow: true }); }
      S.C(29, 54, 28, 60, 7, sk, { g: 'legF' }).C(37, 55, 37, 60, 7, sk, { g: 'legF' });
      for (const x of [25.4, 28, 34.4, 37]) S.C(x, 60, x - 1.2, 61.6, 1.3, horn);
      S.C(24, 46, 18, 38, 10, sk, { g: 'neck' });
      S.P([[12, 26], [14, 18], [18, 26]], horn, { g: 'horn' });
      S.E(15, 33, 10, 7.6, sk, { name: 'head', g: 'head' }).E(6, 36, 6, 4.4, sk, { g: 'head' });
      S.E(8, 39.4, 7, 2, bel, X(F, { clip: 'head', line: false }));
      S.eye(11, 32, 2.4, 2.8, '#e8e060', { white: 0.5, dark: '#2a2a10' }).eye(18, 32, 2.6, 3, '#e8e060', { white: 0.5, dark: '#2a2a10' });
      S.C(7, 28.6, 13, 29.4, 1, sk2, X(F, { flat: true, line: false }));
      S.E(1.6, 35, 1, 0.9, '#141a10', X(F, { flat: true }));
      S.C(2, 39, 8, 39.6, 0.9, '#141a10', X(F, { flat: true, line: false }));
    },
  };
  // Oberflächenstruktur wie js/creatures.js (TEX/texture dort sind modulintern und werden hier 1:1 nachgebildet)
  const TEX = { nebelwuermchen: 'wisp', dunstwyrm: 'wisp', nebelkoenigswyrm: 'dots', moosdrachling: 'moss', farnwyrm: 'moss' };
  window.DD = { DEF, TEX };
})();
// Kopie von hh/texture aus js/creatures.js (dort modulintern), damit die Entwürfe dieselbe Oberflächenstruktur bekommen
(function () {
  const hh = (x, y) => { let v = (x * 374761393 + y * 668265263) | 0; v = Math.imul(v ^ (v >>> 13), 1274126177); return ((v ^ (v >>> 16)) >>> 0) / 4294967296; };
  function texture(c, kind) {
    if (!kind) return;
    const g = c.getContext('2d', { willReadFrequently: true }), w = c.width, h = c.height, img = g.getImageData(0, 0, w, h), d = img.data;
    const solid = (x, y) => x >= 0 && y >= 0 && x < w && y < h && d[(y * w + x) * 4 + 3] > 250;
    for (let y = 1; y < h - 1; y++) for (let x = 1; x < w - 1; x++) {
      const i = (y * w + x) * 4; if (d[i + 3] < 250) continue;
      const lum = (d[i] * 3 + d[i + 1] * 5 + d[i + 2] * 2) / 10; if (lum < 48 || lum > 200) continue;       // Kontur und Leuchtflächen bleiben
      if (!solid(x - 2, y) || !solid(x + 2, y) || !solid(x, y - 2) || !solid(x, y + 2)) continue;           // Rand frei lassen
      let f = 1, tint = null;
      switch (kind) {
        case 'fur': if ((x + y * 2) % 7 === 0 && hh(x >> 2, y >> 1) < 0.55) f = 0.84; else if ((x + y * 2) % 7 === 1 && hh(x >> 2, y >> 1) < 0.55) f = 1.1; break;
        case 'fuzz': if (hh(x, y) < 0.1) f = 1.14; else if (hh(x + 7, y) < 0.08) f = 0.86; break;
        case 'feather': { const row = y >> 2, u = ((x + (row % 2) * 3) % 6) - 2.5, v = y % 4; if (v === Math.min(3, Math.round(u * u / 2.2))) f = 0.84; else if (v === 0 && Math.abs(u) < 1) f = 1.08; break; }
        case 'dots': if (hh(x >> 1, y >> 1) < 0.07) f = 0.8; else if (hh((x >> 1) + 9, y >> 1) < 0.05) f = 1.15; break;
        case 'stone': if (hh(x >> 1, y) < 0.025 || (hh(x, y >> 1) < 0.02)) f = 0.72; else if (hh(x, y) < 0.06) f = 1.08; if (hh(x >> 2, y >> 2) < 0.12 && !solid(x, y - 6)) tint = [96, 132, 76]; break;
        case 'moss': if (hh(x >> 1, y >> 1) < 0.12) tint = [92, 128, 70]; else if (hh(x, y) < 0.05) f = 0.82; break;
        case 'wisp': if (((x - y * 0.5) | 0) % 9 === 0 && hh(x >> 3, y >> 2) < 0.5) f = 1.12; break;
      }
      if (tint) { d[i] = d[i] * 0.55 + tint[0] * 0.45; d[i + 1] = d[i + 1] * 0.55 + tint[1] * 0.45; d[i + 2] = d[i + 2] * 0.55 + tint[2] * 0.45; }
      if (f !== 1) { d[i] = Math.min(255, d[i] * f); d[i + 1] = Math.min(255, d[i + 1] * f); d[i + 2] = Math.min(255, d[i + 2] * f); }
    }
    g.putImageData(img, 0, 0);
  }
  window.DD.texture = texture;
})();
