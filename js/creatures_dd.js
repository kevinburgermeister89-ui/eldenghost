'use strict';
// GENERIERT von tools/build_dd_sprites.sh aus design/*.js – dort bearbeiten, nicht hier.
// ---- design/sprites_drachen_dunkel.js
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

// ---- design/dd_helpers.js
'use strict';
// NUR ENTWURF – gemeinsame Helfer für die Entwurfs-Sprites (Technik wie js/creatures.js)
(function () {
  const F = { face: true }, B = { backOnly: true };
  const X = (o, p) => Object.assign({}, o, p);
  const MIST = { alpha: 0.28, flat: true, noOutline: true, cast: false, line: false };
  const puff = (S, x, y, r, c) => { S.E(x, y, r, r * 0.8, c, MIST).E(x - r * 0.7, y + r * 0.35, r * 0.7, r * 0.55, c, MIST).E(x + r * 0.7, y + r * 0.3, r * 0.75, r * 0.55, c, MIST); };
  const halo = (S, x, y, r, c, a) => S.E(x, y, r, r, c, X(F, { glow: true, alpha: a || 0.35, flat: true, noOutline: true, cast: false }));
  const spark = (S, pts, c) => { for (const [x, y, r] of pts) S.E(x, y, r || 1, r || 1, c, { glow: true }); };
  const up = (S, dy) => { const W = {}; W.E = (x, y, ...a) => (S.E(x, y - dy, ...a), W); W.C = (x0, y0, x1, y1, ...a) => (S.C(x0, y0 - dy, x1, y1 - dy, ...a), W); W.P = (pts, ...a) => (S.P(pts.map(([x, y]) => [x, y - dy]), ...a), W); W.R = (x, y, ...a) => (S.R(x, y - dy, ...a), W); W.eye = (x, y, ...a) => (S.eye(x, y - dy, ...a), W); return W; };
  // verkleinert/verschiebt alle bisher gezeichneten Formen um (ox, oy) – gegen Anschnitt am Bildrand
  const fit = (S, k, ox, oy, dx = 0, dy = 0) => {
    const tx = x => ox + (x - ox) * k + dx, ty = y => oy + (y - oy) * k + dy;
    for (const p of S.p) {
      if (p.t === 'E') { p.cx = tx(p.cx); p.cy = ty(p.cy); p.rx *= k; p.ry *= k; }
      else if (p.t === 'C') { p.x0 = tx(p.x0); p.y0 = ty(p.y0); p.x1 = tx(p.x1); p.y1 = ty(p.y1); p.w *= k; }
      else if (p.t === 'P') p.pts = p.pts.map(([x, y]) => [tx(x), ty(y)]);
      else if (p.t === 'R') { p.x = tx(p.x); p.y = ty(p.y); p.w *= k; p.h *= k; }
    }
  };
  DD.H = { F, B, X, MIST, puff, halo, spark, up, fit };
})();

// ---- design/dd_fern.js
'use strict';
// NUR ENTWURF – gebogener Farnwedel für Moosdrachling/Farnwyrm
(function () {
  DD.H.fern = (S, x, y, h, r, bend, c, c2) => {
    const n = 6; let px = x, py = y;
    for (let i = 0; i < n; i++) {
      const t = i / n, a = r + bend * t, nx = px + Math.sin(a) * h / n, ny = py - Math.cos(a) * h / n;
      S.C(px, py, nx, ny, 1 - t * 0.5, c2, { g: 'fern' });
      if (i > 0) {
        const L = 3.8 * (1 - t * 0.75);
        for (const s of [-1, 1]) { const b = a + s * 1.05; S.C(px, py, px + Math.sin(b) * L, py - Math.cos(b) * L, 1.25 * (1 - t * 0.4), c, { g: 'fern' }); }
      }
      px = nx; py = ny;
    }
    S.E(px, py, 1, 0.8, c, { g: 'fern' });
  };
})();

// ---- design/dd_s01.js
'use strict';
// NUR ENTWURF – überarbeitet: Nebelwürmchen, Dunstwyrm
(function () {
  const { F, B, X, puff, halo, spark } = DD.H;
  Object.assign(DD.DEF, {
    nebelwuermchen(S) { // kleiner eingerollter Wurm aus Morgennebel, zwei Laternenaugen, Moos auf dem Rücken
      const mi = '#a8b6d4', mi2 = '#7c8ab0', bel = '#e6eaf6', mo = '#6a9a48', mo2 = '#4e7a36', gl = '#ffd070', horn = '#ece4cc';
      S.E(36, 60, 20, 2.4, '#c8d4ee', { alpha: 0.22, flat: true, noOutline: true, cast: false });
      S.C(48, 56, 55, 54.6, 5.2, mi, { g: 'tail' }).C(55, 54.6, 60, 51, 3.8, mi, { g: 'tail' }).C(60, 51, 62.6, 46, 2.6, mi, { g: 'tail' }).C(62.6, 46, 62, 42, 1.6, mi, { g: 'tail' });
      S.E(61.6, 41, 2, 1.6, bel, { g: 'tail' }).E(63, 43, 1.4, 1.2, bel, { g: 'tail' });
      S.E(38, 54, 13.5, 6.6, mi, { name: 'body', g: 'body' });
      S.C(28, 57.4, 46, 57.6, 1.6, bel, X(F, { clip: 'body', flat: true, line: false }));
      S.E(41, 48.6, 10, 5, mi, { name: 'coil', g: 'body' });
      S.C(36, 49, 45, 49.4, 0.7, mi2, { clip: 'coil', flat: true, line: false }).C(45, 49.4, 47, 47.4, 0.7, mi2, { clip: 'coil', flat: true, line: false });
      S.E(41, 44.6, 6.4, 2.2, mo, { g: 'moss' }).E(46.6, 45.6, 3.6, 1.8, mo2, { g: 'moss' }).E(36, 45.8, 3, 1.6, mo2, { g: 'moss' });
      for (const [x, y] of [[38, 42.6], [42, 42], [46, 44]]) S.C(x, y + 1.4, x - 0.6, y - 1.2, 0.8, '#8ac860', { flat: true, line: false, g: 'moss' });
      S.C(28, 55, 30, 47, 8.6, mi, { g: 'neck' }).C(30, 47, 25, 41, 7.6, mi, { g: 'neck' });
      S.C(25.4, 55, 26.6, 47, 3, bel, X(F, { g: 'neck', line: false }));
      S.P([[19, 29], [21, 22], [24, 29]], horn, { g: 'horn' }).P([[24, 30], [28, 24], [28, 32]], horn, { g: 'horn' });
      S.E(20, 35, 9.5, 8, mi, { name: 'head', g: 'head' }).E(11.5, 38, 5, 4, mi, { g: 'head' });
      S.E(21, 29, 4, 1.6, mo, { clip: 'head', line: false });
      halo(S, 15.5, 34, 4.4, gl); halo(S, 23, 34, 4.6, gl);
      S.eye(15.5, 34, 2.6, 3, gl, { dark: '#5a3a10', white: 0.4 }).eye(23, 34, 2.8, 3.2, gl, { dark: '#5a3a10', white: 0.4 });
      S.E(8, 37, 0.9, 0.8, '#2a2a40', X(F, { flat: true }));
      S.C(9, 40.6, 14, 41, 0.8, '#2a2a40', X(F, { flat: true, line: false }));
      S.E(21, 31, 5, 2.4, mi2, X(B, { clip: 'head', line: false }));
      spark(S, [[6, 30], [60, 58], [12, 21, 0.8]], '#fff0c0');
    },
    dunstwyrm(S) { // langer Nebelkörper, Mähne aus Weidenzweigen, schimmernde Schuppen
      const mi = '#8c9ccc', mi2 = '#5e6e9e', bel = '#dce4f6', wi = '#8abc58', wi2 = '#5e9038', gl = '#dff4ff', horn = '#ece4cc';
      S.E(38, 61, 22, 2.2, '#c4d0ee', { alpha: 0.2, flat: true, noOutline: true, cast: false });
      const sp = [[63, 43, 3.4], [58, 50, 5.6], [49, 54, 8.6], [40, 51, 10], [34, 43, 9.6], [28, 36, 9], [24, 33, 8.6]];
      S.E(48, 59, 4, 2.4, mi2, { g: 'legB' }).C(48, 55, 48, 59, 4.4, mi2, { g: 'legB' });
      for (let i = 0; i < sp.length - 1; i++) S.C(sp[i][0], sp[i][1], sp[i + 1][0], sp[i + 1][1], sp[i + 1][2], mi, { g: 'body' });
      S.P([[63, 43], [64, 34], [59, 40]], mi2, { g: 'body' });
      S.C(55, 58, 44, 60, 2.6, bel, X(F, { clip: 'body', flat: true, line: false })).C(38, 54, 31, 45, 3, bel, X(F, { clip: 'body', flat: true, line: false }));
      for (const [x, y] of [[52, 49], [45, 47], [41, 43], [57, 46], [36, 37], [47, 52]]) S.E(x, y, 1.3, 1, gl, { glow: true, flat: true, line: false });
      S.C(36, 53, 35, 59, 5, mi, { g: 'legF' });
      for (const x of [32.6, 35, 37.4]) S.C(x, 59.6, x - 1, 61.2, 1, horn);
      for (const [x0, y0, x1, y1] of [[27, 22, 34, 31], [28, 23, 38, 35], [29, 26, 43, 41], [31, 29, 47, 46], [27, 27, 30, 40]]) {
        S.C(x0, y0, x1, y1, 1.3, wi, { g: 'mane' });
        for (let k = 1; k <= 3; k++) { const t = k / 3.4; S.E(x0 + (x1 - x0) * t + 1, y0 + (y1 - y0) * t + 0.6, 1.6, 0.8, wi2, { rot: 0.9, g: 'mane' }); }
      }
      S.P([[17, 22], [21, 12], [24, 22]], horn, { g: 'horn' }).P([[22, 24], [29, 15], [28, 26]], horn, { g: 'horn' });
      S.E(19, 28, 9, 7, mi, { name: 'head', g: 'head' }).E(9.5, 31, 6, 3.8, mi, { g: 'head' });
      S.E(11, 33.6, 6, 1.6, bel, X(F, { clip: 'head', line: false }));
      S.C(4, 31, -1, 26, 0.6, '#6a7aa8').C(4, 32, 0, 36, 0.6, '#6a7aa8');
      S.eye(15, 27, 2.2, 2.6, '#b8ecff', { dark: '#2a3a6a', white: 0.5 }).eye(21, 27, 2.4, 2.8, '#b8ecff', { dark: '#2a3a6a', white: 0.5 });
      S.E(4.6, 30, 0.9, 0.8, '#2a2a40', X(F, { flat: true }));
      spark(S, [[10, 10], [46, 26], [60, 60, 0.8]], gl);
    },
  });
})();

// ---- design/dd_s02.js
'use strict';
// NUR ENTWURF – überarbeitet: Nebelkönigswyrm (schwebt jetzt); neu: Glutechse
(function () {
  const { F, B, X, puff, halo, spark, up } = DD.H;
  Object.assign(DD.DEF, {
    nebelkoenigswyrm(S0) { // schwebender Wyrm mit Sternenmuster, Krone aus Mondlicht-Tropfen
      const sk = '#4c4c94', sk2 = '#323272', bel = '#cdc4f0', st = '#fff4c0', drop = '#e4eeff', drop2 = '#c8a8ff', mane = '#8ab0ff';
      S0.E(38, 60, 16, 2.2, '#8a90c8', { alpha: 0.3, flat: true, noOutline: true, cast: false });
      const S = up(S0, 4);

      const sp = [[60, 30, 3], [62, 38, 4.6], [58, 47, 6.4], [50, 52, 8], [40, 52, 9], [32, 46, 9], [30, 38, 8.4], [28, 30, 8]];
      for (let i = 0; i < sp.length - 1; i++) S.C(sp[i][0], sp[i][1], sp[i + 1][0], sp[i + 1][1], sp[i + 1][2], sk, { g: 'body' });
      S.P([[60, 30], [64, 24], [57, 27]], mane, { glow: true, g: 'body' }).P([[60, 31], [62, 22], [56, 29]], mane, { glow: true, alpha: 0.7, g: 'body' });
      S.C(50, 56, 40, 56, 2.6, bel, X(F, { flat: true, line: false })).C(34, 50, 33, 42, 2.6, bel, X(F, { flat: true, line: false }));
      for (const [x, y, r] of [[56, 44, 1], [48, 49, 1.3], [42, 48, 0.9], [36, 44, 1.2], [33, 36, 1], [44, 54, 0.8], [60, 38, 0.9], [38, 50, 0.7]]) S.P([[x - r * 1.6, y], [x, y - r * 1.6], [x + r * 1.6, y], [x, y + r * 1.6]], st, { glow: true, line: false });
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
      spark(S, [[6, 12], [46, 10, 1.2], [56, 18], [2, 46], [42, 22, 0.8]], st);
    },
    glutechse(S) { // kleine Kohle-Echse mit glühender Bauchnaht, raucht im Halbschlaf
      const sk = '#3c3438', sk2 = '#28222a', ash = '#6a5e62', gl = '#ff9a40', gl2 = '#ffd27a', horn = '#8a7a70', smoke = '#a89aa8';
      puff(S, 6, 34, 2.4, smoke); puff(S, 4, 26, 3.2, smoke); puff(S, 7, 17, 3.8, smoke);
      S.C(44, 55, 54, 57, 5, sk, { g: 'tail' }).C(54, 57, 60, 53, 3.6, sk, { g: 'tail' }).C(60, 53, 59, 47, 2.4, sk, { g: 'tail' });
      S.E(59, 46, 1.8, 1.8, gl, { glow: true, g: 'tail' });
      S.C(43, 53, 45, 59.5, 4, sk2, { g: 'legB' });
      S.E(35, 51, 12.5, 7.6, sk, { name: 'body', g: 'body' });
      for (const [x, y, rx] of [[38, 45.6, 4], [31, 46.4, 3], [44, 48, 2.6]]) S.E(x, y, rx, 1.8, ash, { clip: 'body', flat: true, line: false });
      S.C(25, 56.4, 43, 56.8, 1.3, gl, X(F, { clip: 'body', glow: true, flat: true, line: false }));
      for (const [x0, y0, x1, y1] of [[30, 56.6, 31, 53.6], [36, 56.8, 35, 54], [40, 56.8, 41.6, 54.4]]) S.C(x0, y0, x1, y1, 0.6, gl2, X(F, { clip: 'body', glow: true, flat: true, line: false }));
      for (const [x0, y0, x1, y1] of [[34, 45, 36, 48.4], [36, 48.4, 35, 50.4], [42, 47, 44.6, 49.4]]) S.C(x0, y0, x1, y1, 0.6, gl, { clip: 'body', glow: true, flat: true, line: false });
      S.C(28, 54, 27, 59.5, 4, sk, { g: 'legF' }).C(37, 55, 37, 59.5, 4, sk, { g: 'legF' });
      for (const x of [25, 27.4, 35, 37.4]) S.C(x, 60, x - 1, 61.2, 0.9, ash);
      S.P([[19, 35], [22, 28], [25, 35]], horn, { g: 'horn' }).P([[25, 36], [30, 30], [29, 38]], horn, { g: 'horn' });
      S.E(21, 42, 10, 8, sk, { name: 'head', g: 'head' }).E(12, 45, 6, 4.4, sk, { g: 'head' });
      S.E(23, 37, 4, 1.8, ash, { clip: 'head', flat: true, line: false });
      S.C(8, 47.8, 17, 48.4, 0.9, gl, X(F, { glow: true, flat: true, line: false }));
      S.eye(17, 41, 2.4, 2.8, gl2, { dark: '#7a2a10', white: 0.4 }).eye(24, 41, 2.6, 3, gl2, { dark: '#7a2a10', white: 0.4 });
      S.E(17, 38.8, 3.2, 2, sk, X(F, { flat: true, line: false })).E(24, 38.6, 3.4, 2.1, sk, X(F, { flat: true, line: false }));
      S.C(14, 40.4, 20, 40.6, 0.6, sk2, X(F, { flat: true, line: false })).C(21, 40.4, 27.4, 40.6, 0.6, sk2, X(F, { flat: true, line: false }));
      S.E(7, 44, 0.9, 0.8, '#140e10', X(F, { flat: true }));
      S.C(30, 38, 40, 44, 1, gl, X(B, { glow: true, flat: true, line: false }));
      spark(S, [[50, 36, 0.8], [58, 40, 0.7], [14, 30, 0.7]], gl2);
    },
  });
  Object.assign(DD.TEX, { glutechse: 'stone' });
})();

// ---- design/dd_s03.js
'use strict';
// NUR ENTWURF – Essenwyrm
(function () {
  const { F, B, X, puff, halo, spark } = DD.H;
  Object.assign(DD.DEF, {
    essenwyrm(S) { // schwerer Wyrm wie ein alter Schmiedeofen, Funken aus den Nüstern
      const ir = '#4a4448', ir2 = '#2e2a2e', br = '#7c4c3c', br2 = '#56342a', gl = '#ff8a30', gl2 = '#ffd070', horn = '#9a9090', smoke = '#9a8e96';
      puff(S, 46, 14, 3, smoke); puff(S, 50, 6, 3.8, smoke);
      S.C(52, 53, 60, 57, 7, ir, { g: 'tail' }).C(60, 57, 64, 51, 4.6, ir, { g: 'tail' });
      S.C(51, 51, 53, 60, 7, ir2, { g: 'legB' });
      S.R(43, 22, 6, 12, br2, { name: 'stack', g: 'stack' });
      S.C(42.6, 22.6, 49.4, 22.6, 1.4, ir, { g: 'stack' }).E(46, 22.4, 2.2, 1, gl, { glow: true, g: 'stack' });
      S.E(38, 46, 20, 14, br, { name: 'body', g: 'body' });
      for (const y of [38, 44, 50, 56]) S.C(18, y, 58, y, 0.6, br2, { clip: 'body', flat: true, line: false });
      for (const [x, y] of [[26, 35], [38, 35], [50, 35], [32, 41], [44, 41], [54, 41], [26, 47], [38, 47], [50, 47], [32, 53], [44, 53]]) S.C(x, y, x, y + 3, 0.6, br2, { clip: 'body', flat: true, line: false });
      S.C(36, 31, 37, 61, 2.2, ir, { clip: 'body', line: false }).C(50, 33, 51, 61, 2.2, ir, { clip: 'body', line: false });
      for (const [x, y] of [[36.4, 38], [36.6, 46], [36.8, 54], [50.4, 40], [50.6, 48]]) S.E(x, y, 0.8, 0.8, '#8a8488', { clip: 'body', flat: true, line: false });
      for (const [x, y, h] of [[30, 34, 5], [40, 32, 6], [54, 36, 5]]) S.P([[x - 3, y + 1], [x, y - h], [x + 3, y + 1]], ir, { g: 'plates' });
      S.C(29, 56, 28, 61, 7, ir, { g: 'legF' }).C(40, 57, 40, 61, 7, ir, { g: 'legF' });
      for (const x of [24.6, 27.4, 36.6, 39.4]) S.C(x, 61, x - 1, 62.4, 1.2, horn);
      S.C(27, 46, 22, 35, 10.4, br, { g: 'neck' });
      S.E(29, 50, 6.6, 6, ir2, X(F, { name: 'door' }));
      S.E(29, 51, 4.8, 4, gl, X(F, { glow: true, clip: 'door' }));
      for (const x of [26.6, 29, 31.4]) S.C(x, 46, x, 56, 0.8, ir2, X(F, { clip: 'door', flat: true, line: false }));
      S.P([[16, 25], [20, 16], [22, 26]], horn, { g: 'horn' }).P([[22, 26], [28, 19], [26, 29]], horn, { g: 'horn' });
      S.E(18, 30, 10, 8, ir, { name: 'head', g: 'head' }).E(9, 34, 6.4, 4.6, ir, { g: 'head' });
      S.C(4, 37.4, 14, 37.8, 1, gl, X(F, { glow: true, flat: true, line: false }));
      S.C(12, 25.6, 18, 26.6, 1.2, ir2, X(F, { flat: true, line: false })).C(19, 26.6, 25, 25.8, 1.2, ir2, X(F, { flat: true, line: false }));
      S.eye(15, 29, 2.4, 2.6, gl2, { dark: '#7a2a10', white: 0.4 }).eye(21.4, 29, 2.6, 2.8, gl2, { dark: '#7a2a10', white: 0.4 });
      S.E(4.4, 32, 1, 0.9, '#100a0a', X(F, { flat: true }));
      S.E(20, 26, 6, 3, ir2, X(B, { clip: 'head', line: false }));
      spark(S, [[2.4, 28, 0.9], [1, 24, 1], [4, 21, 0.7], [2, 17, 0.6], [6, 25, 0.6]], gl2);
      DD.H.fit(S, 0.84, 34, 60, 1, 0); // v21: Anschnitt am Bildrand behoben
    },
  });
  Object.assign(DD.TEX, { essenwyrm: 'stone' });
})();

// ---- design/dd_s04.js
'use strict';
// NUR ENTWURF – Grottenwyrm
(function () {
  const { F, B, X, halo, spark } = DD.H;
  Object.assign(DD.DEF, {
    grottenwyrm(S) { // blinder Höhlenwyrm mit Tropfsteinzacken, Kristalle statt Augen
      const st = '#76727e', st2 = '#54505c', st3 = '#a09aa6', bel = '#aaa2a2', cr = '#8af0ff', cr2 = '#4ab8d8', mo = '#5a8048';
      const sp = [[63, 47, 3.4], [58, 53, 6], [48, 55, 9], [38, 52, 10.4], [30, 46, 9.6]];
      S.C(49, 57, 50, 61, 5, st2, { g: 'legB' });
      for (let i = 0; i < sp.length - 1; i++) S.C(sp[i][0], sp[i][1], sp[i + 1][0], sp[i + 1][1], sp[i + 1][2], st, { g: 'body' });
      S.C(54, 59, 40, 60, 2.4, bel, X(F, { clip: 'body', flat: true, line: false }));
      for (const [x, y, r] of [[44, 50, 2.6], [52, 52, 2], [36, 47, 2.2]]) S.E(x, y, r, r * 0.7, mo, { clip: 'body', flat: true, line: false });
      for (const [x, y, h, w] of [[57, 48, 6, 2], [50, 46, 9, 2.8], [42, 42, 12, 3.2], [34, 38, 10, 3], [28, 36, 7, 2.4]]) {
        S.P([[x - w, y + 1], [x - w * 0.3, y - h], [x + w * 0.2, y - h - 0.6], [x + w, y + 1]], st3, { g: 'spikes' });
        S.C(x - w * 0.6, y - h * 0.3, x + w * 0.5, y - h * 0.35, 0.5, st2, { flat: true, line: false, g: 'spikes' });
        S.E(x - w * 0.05, y - h - 1.2, 0.7, 0.9, cr, { glow: true, g: 'spikes' });
      }
      S.P([[45, 50], [47, 44], [49, 50]], cr2, { glow: true, g: 'body' });
      S.C(33, 54, 32, 61, 5.8, st, { g: 'legF' });
      for (const x of [29.6, 32, 34.4]) S.C(x, 61, x - 1, 62.4, 1, st3);
      S.E(20, 41, 10.4, 8.4, st, { name: 'head', g: 'head' }).E(10, 45, 6.6, 4.6, st, { g: 'head' });
      S.E(12, 48.4, 6.4, 1.6, bel, X(F, { clip: 'head', line: false }));
      S.E(16.5, 39.6, 3.2, 2.8, st2, X(F, { flat: true, line: false })).E(23.6, 39, 3.4, 3, st2, X(F, { flat: true, line: false }));
      halo(S, 16.5, 38.6, 4, cr, 0.3); halo(S, 23.6, 38, 4.2, cr, 0.3);
      S.P([[15, 41], [15.4, 36.4], [16.6, 35.4], [17.4, 41]], cr, X(F, { glow: true })).P([[17, 41], [18.4, 37.6], [19, 41]], cr2, X(F, { glow: true }));
      S.P([[22, 41], [22.6, 35.6], [24, 34.6], [24.8, 41]], cr, X(F, { glow: true })).P([[24.4, 41], [26, 37.4], [26.4, 41]], cr2, X(F, { glow: true }));
      S.C(5, 47.6, 15, 48.2, 0.9, '#24202a', X(F, { flat: true, line: false }));
      S.E(4.6, 43.6, 0.9, 0.8, '#24202a', X(F, { flat: true }));
      S.E(22, 35, 6, 2.4, st2, X(B, { clip: 'head', line: false }));
      spark(S, [[8, 26, 0.8], [58, 34, 0.7], [4, 56, 0.6]], cr);
    },
  });
  Object.assign(DD.TEX, { grottenwyrm: 'stone' });
})();

// ---- design/dd_s05.js
'use strict';
// NUR ENTWURF – Gewitterlind
(function () {
  const { F, X, spark } = DD.H;
  Object.assign(DD.DEF, {
    gewitterlind(S) { // schlanker Himmelswyrm aus Gewitterwolke, Blitzadern, Mähne aus Regenfäden
      const cl = '#5c6480', cl2 = '#3e4460', clh = '#8a92b0', bolt = '#fff070', rain = '#9ad0ff', eye = '#fff6a0';
      S.E(36, 60, 16, 2, '#6a7090', { alpha: 0.3, flat: true, noOutline: true, cast: false });
      for (const [x, y] of [[44, 50], [52, 54], [30, 52]]) S.C(x, y, x - 1, y + 3.4, 0.5, rain, { alpha: 0.6, flat: true, line: false, cast: false });
      const sp = [[63, 18, 2.6], [61, 26, 4], [55, 34, 5.6], [45, 38, 6.4], [37, 35, 6.6], [31, 29, 6]];
      for (let i = 0; i < sp.length - 1; i++) S.C(sp[i][0], sp[i][1], sp[i + 1][0], sp[i + 1][1], sp[i + 1][2], cl, { g: 'body' });
      for (const [x, y, r] of [[60, 23, 3.4], [56, 29, 4], [49, 33, 4.4], [41, 32, 4.4], [34, 27, 4]]) S.E(x, y, r, r * 0.8, clh, { g: 'body' });
      for (const [x, y, l] of [[28, 26, 9], [30.5, 28, 11], [33, 30.5, 10], [35.5, 33, 8], [26, 27, 7]]) { S.C(x, y, x - 1.6, y + l, 0.55, rain, { alpha: 0.85, glow: true, flat: true, noOutline: true, cast: false, g: 'rain' }); S.E(x - 1.6, y + l + 0.8, 0.7, 0.9, rain, { glow: true, noOutline: true, cast: false, g: 'rain' }); }
      const zig = (pts) => { for (let i = 0; i < pts.length - 1; i++) S.C(pts[i][0], pts[i][1], pts[i + 1][0], pts[i + 1][1], 0.6, bolt, { glow: true, clip: 'body', flat: true, line: false }); };
      zig([[58, 26], [54, 30], [56, 32], [50, 36], [47, 35], [42, 38]]); zig([[44, 34], [40, 33], [41, 36], [35, 34]]); zig([[61, 20], [59, 24], [61, 26]]);
      S.C(38, 39, 36, 45, 2.2, cl2, { g: 'arm' }).C(36, 45, 34.4, 45.4, 0.8, bolt, { glow: true }).C(36, 45, 35.4, 46.8, 0.8, bolt, { glow: true });
      S.P([[22, 19], [25, 14], [24, 17], [28, 11], [27, 18], [25, 21]], bolt, { glow: true, g: 'horn' });
      S.E(22, 24, 8, 6.4, cl, { name: 'head', g: 'head' }).E(13, 26.4, 5.4, 3.6, cl, { g: 'head' });
      S.E(25, 20, 4, 2.2, clh, { clip: 'head', line: false });
      S.C(9, 28.6, 16, 29, 0.7, cl2, X(F, { flat: true, line: false }));
      S.eye(18.6, 23.4, 2.2, 2.6, eye, { dark: '#6a5a10', white: 0.5 }).eye(24.6, 23.4, 2.4, 2.8, eye, { dark: '#6a5a10', white: 0.5 });
      S.C(17, 21, 21, 20.4, 0.8, cl2, X(F, { flat: true, line: false }));
      S.E(8.4, 25.4, 0.8, 0.7, '#1a1c2a', X(F, { flat: true }));
      S.C(8, 27, 4, 25, 0.5, bolt, { glow: true }).C(4, 25, 2, 27, 0.5, bolt, { glow: true });
      spark(S, [[6, 12, 0.8], [40, 14, 0.9], [62, 40, 0.7]], bolt);
      DD.H.fit(S, 0.86, 32, 40, -2, 0); // v21: Anschnitt am Bildrand behoben
    },
  });
  Object.assign(DD.TEX, { gewitterlind: 'wisp' });
})();

// ---- design/dd_s06.js
'use strict';
// NUR ENTWURF – Brunnendrache
(function () {
  const { F, B, X, spark } = DD.H;
  Object.assign(DD.DEF, {
    brunnendrache(S) { // alter gütiger Drache, schläft im moosigen Dorfbrunnen, Bart aus Entengrütze
      const sk = '#4a8a96', sk2 = '#326470', bel = '#cfe0c8', st = '#8c8a92', st2 = '#64626c', st3 = '#a8a6ae', mo = '#6a9a48', duck = '#9ad050', duck2 = '#6aa438', wat = '#6ac8e8', horn = '#e8dcc0', wd = '#7a5a40', wd2 = '#5a3e2c', roof = '#8a4a3a';
      S.R(12, 15, 3, 32, wd, { g: 'post' }).R(53, 15, 3, 32, wd, { g: 'post' });
      S.C(13, 19, 55, 19, 1.2, wd2, { g: 'post' });
      S.P([[7, 17], [34, 5], [61, 17]], roof, { name: 'roof', g: 'roof' });
      for (const y of [9.6, 13.4]) S.C(10, y + 2.6, 58, y + 2.6, 0.5, '#5e2e24', { clip: 'roof', flat: true, line: false });
      S.C(46, 19.6, 46, 27, 0.5, '#c8b890', { g: 'rope' }).R(43.6, 27, 5, 4.4, wd, { g: 'rope' }).C(43.6, 27.6, 48.6, 27.6, 0.6, '#8a8a90', { g: 'rope' });
      S.E(34, 46, 22, 4.6, st2, { g: 'wellback' });
      S.E(34, 46.4, 19, 3, wat, { glow: true, flat: true, line: false, g: 'wellback' });
      S.C(50, 45, 56, 39, 3.6, sk, { g: 'tail' }).C(56, 39, 57, 33, 2.6, sk, { g: 'tail' }).P([[57, 33], [61, 28], [54, 31]], sk2, { g: 'tail' });
      S.E(37, 43, 12, 6, sk, { name: 'body', g: 'body' });
      for (const [x, y] of [[34, 38], [40, 37.4], [46, 38.4]]) S.P([[x - 2, y + 1], [x, y - 3], [x + 2, y + 1]], sk2, { g: 'body' });
      S.R(12, 46, 44, 12, st, { name: 'well', g: 'well' }); S.E(34, 58, 22, 2.6, st, { g: 'well' });
      for (const [y, o] of [[49.5, 0], [53.5, 3.5], [57.5, 0]]) for (let x = 14 + o; x < 56; x += 7) S.E(x, y, 3, 1.6, (x + y) % 3 ? st3 : st2, { clip: 'well', flat: true, line: false });
      S.C(12.6, 46.6, 55.4, 46.6, 2.4, st3, { g: 'rim' });
      for (const [x, r] of [[16, 3], [26, 2.2], [42, 3.4], [52, 2.6]]) S.E(x, 45.6, r, 1.4, mo, { g: 'rim' });
      for (const [x, y] of [[15, 52], [53, 51], [44, 56]]) S.E(x, y, 2, 1.2, mo, { clip: 'well', flat: true, line: false });
      S.C(31, 43, 31, 49, 3.8, sk, { g: 'paw' }).C(44, 43, 45, 49, 3.8, sk, { g: 'paw' });
      for (const x of [29.6, 31.4, 33.2, 43.4, 45.2, 47]) S.C(x, 49.4, x - 0.4, 51, 0.8, horn);
      S.C(24, 34, 30, 27, 1.8, horn, { g: 'horn' }).C(30, 27, 33, 28, 1.4, horn, { g: 'horn' }).C(18, 34, 20, 27, 1.6, horn, { g: 'horn' });
      S.E(22, 40, 10, 7.2, sk, { name: 'head', g: 'head' }).E(13, 43, 6.2, 4.2, sk, { g: 'head' });
      S.E(14, 45.4, 6, 1.6, bel, X(F, { clip: 'head', line: false }));
      for (const [x0, y0, x1, y1] of [[11, 46, 9, 53], [14, 47, 13, 57], [18, 47, 18, 58], [21, 46.6, 22, 54]]) {
        S.C(x0, y0, x1, y1, 1.1, duck2, { g: 'beard' });
        for (let k = 1; k <= 3; k++) { const t = k / 3.2; S.E(x0 + (x1 - x0) * t + (k % 2 ? 1 : -1), y0 + (y1 - y0) * t, 1.3, 0.9, duck, { g: 'beard' }); }
      }
      S.C(16, 39, 18, 40, 0.7, '#14262c', X(F, { flat: true, line: false })).C(18, 40, 20.4, 39, 0.7, '#14262c', X(F, { flat: true, line: false }));
      S.C(23, 38.6, 25.2, 39.6, 0.7, '#14262c', X(F, { flat: true, line: false })).C(25.2, 39.6, 27.6, 38.6, 0.7, '#14262c', X(F, { flat: true, line: false }));
      S.C(15, 36.4, 20, 36, 0.9, bel, X(F, { flat: true, line: false })).C(22, 36, 27, 35.8, 0.9, bel, X(F, { flat: true, line: false }));
      S.E(7.6, 42, 0.9, 0.8, '#14262c', X(F, { flat: true }));
      S.E(5, 38, 1.6, 1.6, wat, { alpha: 0.7, glow: true }).E(3.4, 33.6, 1.1, 1.1, wat, { alpha: 0.6, glow: true }).E(5, 30, 0.7, 0.7, wat, { alpha: 0.5, glow: true });
      S.E(22, 36, 5, 2, sk2, X(B, { clip: 'head', line: false }));
      spark(S, [[40, 46.6, 0.7], [50, 46.4, 0.6], [27, 46.6, 0.6]], '#dff8ff');
    },
  });
  Object.assign(DD.TEX, { brunnendrache: 'dots' });
})();

// ---- design/dd_s07.js
'use strict';
// NUR ENTWURF – Russwiesel
(function () {
  const { F, B, X, halo, spark } = DD.H;
  Object.assign(DD.DEF, {
    russwiesel(S) { // Wiesel aus Kaminruss, Schwanzspitze glimmt wie Glut
      const fur = '#34303a', fur2 = '#221e28', sm = '#5a5462', thr = '#8a8090', gl = '#ff9040', gl2 = '#ffd080', eye = '#ffcc60';
      S.C(45, 51, 53, 47, 4.4, fur, { g: 'tail' }).C(53, 47, 58, 40, 3.6, fur, { g: 'tail' }).C(58, 40, 58, 33, 3, fur, { g: 'tail' });
      halo(S, 58, 30, 5, gl, 0.3);
      S.E(58, 30.6, 3, 3.4, gl, { glow: true, g: 'tail' }).E(58, 29.6, 1.6, 1.8, gl2, { glow: true, g: 'tail' });
      S.E(45, 52, 5, 4.4, fur2, { g: 'legB' }).C(46, 54, 49, 58, 3.4, fur2, { g: 'legB' }).C(49, 58, 46, 59.6, 2.8, fur2, { g: 'legB' }).E(45, 60, 2.8, 1.3, fur2, { g: 'legB' });
      S.C(25, 48, 45, 50, 7.6, fur, { name: 'body', g: 'body' });
      for (const [x, y, r] of [[36, 44, 4], [44, 46, 2.6], [29, 44.6, 2.4]]) S.E(x, y, r, 1.5, sm, { clip: 'body', flat: true, line: false });
      S.C(22, 52, 34, 54.6, 2.6, thr, X(F, { clip: 'body', flat: true, line: false }));
      // v21: kurze, gewinkelte Beine mit Pfoten statt Stelzen
      S.C(27, 52, 25, 56.5, 3.8, fur, { g: 'legF' }).C(25, 56.5, 26, 59.2, 3.2, fur, { g: 'legF' });
      S.C(37, 53, 39, 56.5, 3.8, fur, { g: 'legF' }).C(39, 56.5, 37, 59.2, 3.2, fur, { g: 'legF' });
      for (const x of [24.6, 35.6]) S.E(x, 60, 2.8, 1.3, fur2, { g: 'legF' });
      S.E(15, 33, 2.8, 2.8, fur, { name: 'earL' }).E(23, 32.6, 3, 3, fur, { name: 'earR' });
      S.E(15, 33.4, 1.4, 1.4, sm, { clip: 'earL', flat: true, line: false }).E(23, 33, 1.5, 1.5, sm, { clip: 'earR', flat: true, line: false });
      S.C(24, 47, 20, 42, 7, fur, { g: 'neck' });
      S.E(18, 40, 8.6, 7, fur, { name: 'head', g: 'head' }).E(10, 43, 4.8, 3.4, fur, { g: 'head' });
      S.E(13, 45.6, 5.4, 2.2, thr, X(F, { clip: 'head', line: false }));
      S.E(18, 38.6, 7, 2.6, fur2, X(F, { clip: 'head', flat: true, line: false }));
      S.eye(15, 39.4, 2, 2.4, eye, { dark: '#6a3a10', white: 0.5 }).eye(21, 39.2, 2.2, 2.6, eye, { dark: '#6a3a10', white: 0.5 });
      S.E(5.6, 42.4, 1, 0.9, '#0e0c10', X(F, { flat: true }));
      S.C(6, 44, 3, 43, 0.4, sm).C(6, 44.6, 3, 45.6, 0.4, sm);
      S.E(36, 45, 9, 2.4, fur2, X(B, { clip: 'body', line: false }));
      spark(S, [[62, 24, 0.8], [54, 26, 0.6], [60, 20, 0.5]], gl2);
    },
  });
  Object.assign(DD.TEX, { russwiesel: 'fur' });
})();

// ---- design/dd_s08.js
'use strict';
// NUR ENTWURF – Kohlmarder
(function () {
  const { F, B, X, MIST, spark } = DD.H;
  Object.assign(DD.DEF, {
    kohlmarder(S) { // Marder mit Rauchumhang, gestohlene Laternenfunken im Fell
      const fur = '#3a3440', fur2 = '#262230', sm = '#6a6278', cl = '#4a4060', cl2 = '#2e2840', thr = '#9a8ea0', sp = '#ffd070', eye = '#ffcc60';
      for (const [x, y, r] of [[54, 36, 3], [58, 30, 2.4], [61, 25, 1.8]]) S.E(x, y, r, r * 0.8, '#7a7090', MIST);
      S.P([[43, 53], [47, 46], [51, 38], [55, 31], [59, 28.6], [62, 33], [61.4, 41], [58, 48], [52, 54]], fur, { g: 'tail', name: 'tail' });
      S.P([[55, 31], [59, 28.6], [62, 33], [61.6, 37], [58, 34]], sm, { clip: 'tail', flat: true, line: false });
      S.C(46, 52, 48, 60, 4, fur2, { g: 'legB' });
      S.E(36, 49, 13, 8, fur, { name: 'body', g: 'body' });
      S.E(28, 53, 6, 3.4, thr, X(F, { clip: 'body', line: false }));
      S.C(28, 54, 27, 60, 4, fur, { g: 'legF' }).C(36, 55, 36, 60, 4, fur, { g: 'legF' });
      for (const x of [27, 36]) S.E(x - 0.6, 60.4, 2.6, 1.2, fur2);
      S.P([[22, 38], [40, 36], [50, 42], [51, 50], [47, 48], [43, 52], [39, 48], [35, 53], [31, 48], [27, 51], [22, 46]], cl, { name: 'cloak', g: 'cloak' });
      for (const [x0, y0, x1, y1] of [[30, 40, 31, 48], [38, 39, 39, 48], [45, 42, 47, 48]]) S.C(x0, y0, x1, y1, 0.7, cl2, { clip: 'cloak', flat: true, line: false });
      S.C(22, 39, 40, 37, 1.6, '#5e5478', { g: 'cloak' });
      for (const [x, y] of [[33, 44], [44, 45], [27, 43], [52, 40], [40, 51], [57, 44]]) S.E(x, y, 0.8, 0.8, sp, { glow: true });
      S.E(15, 30, 2.8, 3, fur, { name: 'earL' }).E(23, 29.6, 3, 3.2, fur, { name: 'earR' });
      S.E(15, 30.4, 1.4, 1.5, sm, { clip: 'earL', flat: true, line: false }).E(23, 30, 1.5, 1.6, sm, { clip: 'earR', flat: true, line: false });
      S.E(19, 37, 9, 7.6, fur, { name: 'head', g: 'head' }).E(10, 40, 5, 3.4, fur, { g: 'head' });
      S.E(13, 42.6, 5.6, 2.2, thr, X(F, { clip: 'head', line: false }));
      S.E(18.6, 35.6, 7.4, 2.6, fur2, X(F, { clip: 'head', flat: true, line: false }));
      S.eye(15.4, 36, 2.1, 2.5, eye, { dark: '#6a3a10', white: 0.5 }).eye(21.6, 35.8, 2.3, 2.7, eye, { dark: '#6a3a10', white: 0.5 });
      S.E(5.4, 39.4, 1, 0.9, '#0e0c10', X(F, { flat: true }));
      S.E(20, 33, 6, 2.6, fur2, X(B, { clip: 'head', line: false }));
      spark(S, [[8, 26, 0.7], [30, 30, 0.6], [62, 52, 0.6]], sp);
    },
  });
  Object.assign(DD.TEX, { kohlmarder: 'fur' });
})();

// ---- design/dd_s09.js
'use strict';
// NUR ENTWURF – Schattenmarder
(function () {
  const { F, B, X, MIST, spark } = DD.H;
  Object.assign(DD.DEF, {
    schattenmarder(S) { // aufrechter Marder, Rauchbandagen an den Pfoten, ruhige Kampfhaltung
      const fur = '#3a3444', fur2 = '#24202c', sm = '#6a6278', thr = '#a89cb0', ban = '#bab2c6', ban2 = '#8a8298', eye = '#ffb050';
      S.C(40, 54, 50, 52, 5, fur, { g: 'tail' }).C(50, 52, 56, 45, 4.4, fur, { g: 'tail' }).C(56, 45, 54, 38, 2.8, fur, { g: 'tail' }).C(54, 38, 50.6, 35.4, 1.7, fur, { g: 'tail' });

      S.C(34, 50, 35, 58, 4.8, fur2, { g: 'legB' }).E(36, 59.4, 5, 2.2, fur2, { g: 'legB' });
      S.E(31, 43, 9, 12, fur, { name: 'body', g: 'body', rot: -0.15 });
      S.E(27.6, 44, 4.6, 8, thr, X(F, { clip: 'body', line: false, rot: -0.15 }));
      S.C(26, 52, 24, 58, 4.8, fur, { g: 'legF' }).E(22.6, 59.4, 5, 2.2, fur, { g: 'legF' });
      S.C(34, 37, 28, 35, 3.2, fur, { g: 'armB' }).E(25.6, 34, 3, 2.8, ban, { name: 'fistB', g: 'armB' });
      for (const y of [33.2, 35.2]) S.C(23, y, 29, y, 0.5, ban2, { clip: 'fistB', flat: true, line: false });
      S.C(26, 37, 17, 39, 3.4, fur, { g: 'armF' }).E(13.6, 39, 3.6, 3.4, ban, { name: 'fistF', g: 'armF' });
      for (const x of [12.4, 14.6, 16.6]) S.C(x, 36, x, 42, 0.5, ban2, { clip: 'fistF', flat: true, line: false });
      S.C(17, 41, 12, 46, 0.8, ban, { alpha: 0.8, line: false, noOutline: true }).C(12, 46, 9, 45, 0.6, ban, { alpha: 0.6, line: false, noOutline: true });
      for (const [x, y, r] of [[9, 46, 2], [6, 44, 1.6], [26, 50, 1.6]]) S.E(x, y, r, r * 0.8, '#9a90b0', MIST);
      S.E(25, 16.6, 2.8, 3, fur, { name: 'earL' }).E(33, 17, 3, 3.2, fur, { name: 'earR' });
      S.E(25, 17, 1.4, 1.5, sm, { clip: 'earL', flat: true, line: false }).E(33, 17.4, 1.5, 1.6, sm, { clip: 'earR', flat: true, line: false });
      S.E(28, 24, 8.4, 7.6, fur, { name: 'head', g: 'head' }).E(20, 27, 5, 3.4, fur, { g: 'head' });
      S.E(23, 29.6, 5.4, 2.2, thr, X(F, { clip: 'head', line: false }));
      S.C(20.6, 19.6, 36, 19, 1.2, ban2, { g: 'band' }).C(36, 19, 42, 22, 0.8, ban2, { g: 'band' }).C(36, 19, 43, 17, 0.7, ban2, { g: 'band' });
      S.E(27.6, 23, 7, 2.6, fur2, X(F, { clip: 'head', flat: true, line: false }));
      S.eye(24.4, 23.4, 2, 2.2, eye, { dark: '#6a2a10', white: 0.5 }).eye(30.4, 23.2, 2.2, 2.4, eye, { dark: '#6a2a10', white: 0.5 });
      S.C(22, 21.6, 27, 22, 1, fur2, X(F, { flat: true, line: false })).C(28.4, 21.6, 33, 21.6, 1, fur2, X(F, { flat: true, line: false }));
      S.E(15.4, 26.4, 1, 0.9, '#0e0c10', X(F, { flat: true }));
      S.C(17, 29, 21, 29.4, 0.6, '#0e0c10', X(F, { flat: true, line: false }));
      S.E(32, 36, 7, 3, fur2, X(B, { clip: 'body', line: false }));
      spark(S, [[6, 34, 0.6], [44, 14, 0.6]], ban);
    },
  });
  Object.assign(DD.TEX, { schattenmarder: 'fur' });
})();

// ---- design/dd_s10.js
'use strict';
// NUR ENTWURF – Pechunke
(function () {
  const { F, B, X, halo, spark } = DD.H;
  Object.assign(DD.DEF, {
    pechunke(S) { // kleine Unke mit Teerhaut, violett leuchtende Bauchflecken
      const sk = '#2a2432', sk2 = '#1a1622', hi = '#6a6088', bel = '#3c3248', spot = '#c070ff', eye = '#ffd060';
      S.E(45, 56, 7, 4, sk2, { g: 'legB' }).E(50, 59, 5, 2, sk2, { g: 'legB' });
      S.E(34, 49, 16, 11, sk, { name: 'body', g: 'body' });
      S.E(31, 41, 5, 1.6, hi, { clip: 'body', flat: true, line: false, rot: -0.2 }).E(41, 40.6, 3, 1.1, hi, { clip: 'body', flat: true, line: false });
      S.E(30, 55, 10, 5.4, bel, X(F, { clip: 'body', line: false }));
      for (const [x, y, r] of [[25, 54, 1.7], [30.6, 56.4, 1.5], [35, 53.4, 1.6], [28.4, 52, 1.1], [33, 57.6, 1]]) { halo(S, x, y, r * 2.2, spot, 0.25); S.E(x, y, r, r * 0.85, spot, X(F, { glow: true, clip: 'body', line: false })); }
      S.C(45, 47, 46, 52, 1.3, sk2, { g: 'drip' }).E(46.2, 52.6, 1.4, 1.6, sk2, { g: 'drip' });
      S.E(20, 59, 5, 2.2, sk, { g: 'legF' }).C(22, 53, 20, 58, 4, sk, { g: 'legF' });
      S.E(38, 59.4, 4.6, 2, sk, { g: 'legF' }).C(37, 55, 38, 58.6, 4, sk, { g: 'legF' });
      S.E(22, 38, 5, 4.6, sk, { g: 'body' }).E(33, 36.6, 5.4, 5, sk, { g: 'body' });
      S.eye(22, 38, 3, 3.4, eye, { dark: '#3a2a10', white: 0.4 }).eye(33, 36.6, 3.4, 3.8, eye, { dark: '#3a2a10', white: 0.4 });
      // v21: deutlich sichtbares Maul – heller Lippenrand, dunkler Spalt, Mundwinkel
      S.C(17, 45.6, 31, 47.6, 1.6, '#7a6a98', X(F, { flat: true, line: false })).C(17.4, 45.8, 30.6, 47.8, 0.8, '#0a0610', X(F, { flat: true, line: false }));
      S.C(30.6, 47.8, 32, 46.4, 0.8, '#0a0610', X(F, { flat: true, line: false })).E(24, 48.6, 2.6, 0.7, '#c070ff', X(F, { flat: true, line: false, alpha: 0.5 }));
      for (const [x, y] of [[36, 44], [44, 46], [40, 50]]) S.E(x, y, 1.6, 1.3, spot, X(B, { glow: true, clip: 'body' }));
      spark(S, [[8, 40, 0.7], [56, 44, 0.6], [12, 28, 0.6]], spot);
    },
  });
  Object.assign(DD.TEX, { pechunke: 'dots' });
})();

// ---- design/dd_s11.js
'use strict';
// NUR ENTWURF – Teerkröte
(function () {
  const { F, B, X, halo, spark } = DD.H;
  Object.assign(DD.DEF, {
    teerkroete(S) { // schwere Kröte mit Teerblasen auf dem Rücken
      const sk = '#2a2432', sk2 = '#1a1622', sk3 = '#3a3248', hi = '#6a6088', bel = '#3c3248', spot = '#c070ff', eye = '#ffc850';
      S.E(50, 54, 9, 6, sk2, { g: 'legB' }).E(55, 59, 7, 2.4, sk2, { g: 'legB' });
      for (const [x, y, r] of [[26, 27, 3.6], [36, 24, 4.6], [46, 27.4, 3.8], [53, 33, 3], [31, 23, 2.4], [42, 22, 2]]) {
        S.E(x, y, r, r, sk3, { g: 'bubbles' });
        S.E(x - r * 0.35, y - r * 0.35, r * 0.32, r * 0.24, '#b8a8d8', { flat: true, line: false, g: 'bubbles' });
      }
      S.E(56, 26, 1.6, 1.6, sk3, { alpha: 0.7 }).E(58, 21, 1, 1, sk3, { alpha: 0.5 });
      S.E(35, 44, 24, 16, sk, { name: 'body', g: 'body' });
      S.E(34, 34, 8, 2, hi, { clip: 'body', flat: true, line: false, rot: -0.1 }).E(48, 38, 4, 1.4, hi, { clip: 'body', flat: true, line: false, rot: 0.4 });
      S.E(26, 53, 14, 7, bel, X(F, { clip: 'body', line: false }));
      for (const [x, y, r] of [[20, 52, 1.8], [26, 55, 1.6], [32, 52, 1.7], [24, 50, 1.2], [30, 57, 1.1], [36, 55.6, 1.3]]) { halo(S, x, y, r * 2, spot, 0.22); S.E(x, y, r, r * 0.85, spot, X(F, { glow: true, clip: 'body', line: false })); }
      S.E(12, 59, 7, 2.6, sk, { g: 'legF' }).C(15, 51, 13, 58, 6, sk, { g: 'legF' });
      S.E(36, 59.6, 6, 2.4, sk, { g: 'legF' }).C(35, 53, 36, 58.6, 6, sk, { g: 'legF' });
      S.E(13, 31, 6, 5.6, sk, { g: 'body' }).E(27, 29, 6.4, 6, sk, { g: 'body' });
      S.eye(13, 31.6, 3.4, 3.6, eye, { dark: '#3a2a10', white: 0.4 }).eye(27, 29.6, 3.8, 4, eye, { dark: '#3a2a10', white: 0.4 });
      S.E(13, 28.6, 4.4, 2.4, sk, X(F, { flat: true, line: false })).E(27, 26.4, 4.8, 2.6, sk, X(F, { flat: true, line: false }));
      S.C(12, 41.6, 28, 44, 1.2, '#0e0a14', X(F, { flat: true }));
      S.C(15, 43, 15, 47, 0.9, spot, X(F, { glow: true })).E(15, 47.6, 1.1, 1.3, spot, X(F, { glow: true }));
      for (const [x, y] of [[30, 40], [42, 44], [36, 48], [48, 42]]) S.E(x, y, 1.8, 1.4, spot, X(B, { glow: true, clip: 'body' }));
      spark(S, [[6, 22, 0.7], [60, 46, 0.6]], spot);
    },
  });
  Object.assign(DD.TEX, { teerkroete: 'dots' });
})();

// ---- design/dd_s12.js
'use strict';
// NUR ENTWURF – Kolkwicht
(function () {
  const { F, B, X, spark } = DD.H;
  Object.assign(DD.DEF, {
    kolkwicht(S) { // zerzauster Rabengeist mit Strohhut-Rest, sammelt verlorene Knöpfe
      const fe = '#2c2834', fe2 = '#1c1824', sh = '#5a6a8a', bk = '#4a4450', st = '#d8b860', st2 = '#a8883a', eye = '#ff9a50';
      S.C(38, 56, 38, 60.4, 1.2, '#5a5260').C(45, 56, 47, 60.4, 1.2, '#5a5260');
      S.C(36, 60.4, 40, 60.6, 0.7, '#5a5260').C(45, 60.4, 49, 60.6, 0.7, '#5a5260');
      S.P([[48, 42], [60, 46], [62, 50], [58, 49], [59, 53], [54, 51], [50, 50]], fe2, { g: 'tail' });
      S.E(39, 45, 12, 11, fe, { name: 'body', g: 'body' });
      for (const [x, y, a] of [[50, 40, 0.6], [51, 47, 0.1], [44, 55, 1.2], [32, 55, 2]]) S.P([[x, y], [x + Math.cos(a) * 4, y + Math.sin(a) * 4 - 1], [x + Math.cos(a) * 3, y + Math.sin(a) * 3 + 1.2]], fe, { g: 'body' });
      S.P([[35, 39], [54, 41], [57, 47], [53, 46], [55, 51], [50, 49], [50, 53], [42, 51]], fe2, { name: 'wing', g: 'wing' });
      for (const [x0, y0, x1, y1] of [[41, 43, 53, 45], [42, 47, 51, 49]]) S.C(x0, y0, x1, y1, 0.7, sh, { clip: 'wing', flat: true, line: false });
      S.E(27, 30, 9, 8.4, fe, { name: 'head', g: 'head' });
      for (const [x, y, dx, dy] of [[30, 22, 2, -5], [33, 24, 4, -3], [27, 22, -1, -4]]) S.P([[x - 1.2, y + 1], [x + dx, y + dy], [x + 1.4, y + 1.4]], fe, { g: 'head' });
      S.P([[20, 29], [8, 33], [20, 34.4]], bk, { g: 'head' }).C(11, 32.6, 19.6, 31.8, 0.5, '#7a7480', { flat: true, line: false, g: 'head' });
      S.P([[21, 23.6], [23, 17], [31, 16.4], [33, 23]], st, { name: 'crown', g: 'hat' });
      S.P([[16, 24.4], [38, 22.6], [36, 25.4], [31, 24.4], [28, 26], [24, 24.6], [18, 26]], st, { g: 'hat' });
      S.C(21.6, 21.6, 32.6, 21, 1.1, '#8a4a3a', { g: 'hat' });
      S.E(27, 18.4, 1.6, 1.2, fe2, { clip: 'crown', flat: true, line: false });
      for (const [x0, y0, x1, y1] of [[31, 16.6, 34, 14], [24, 17, 22, 14.6], [36, 25, 39, 27], [18, 25.6, 15, 27.4]]) S.C(x0, y0, x1, y1, 0.4, st2, { line: false });
      S.eye(23.4, 29.6, 2, 2.4, eye, { dark: '#6a2a10', white: 0.5 });
      S.C(22, 39, 30, 46, 0.5, '#c8b890').C(30, 46, 38, 48, 0.5, '#c8b890');
      for (const [x, y, r, c] of [[25, 41.6, 2, '#d85a4a'], [30.4, 45.6, 2.3, '#4a9ad8'], [36.4, 47.6, 2, '#e8c040']]) {
        S.E(x, y, r, r, c, { name: 'btn' + x });
        S.E(x - r * 0.3, y, 0.4, 0.4, '#1a1420', { flat: true, line: false }).E(x + r * 0.3, y, 0.4, 0.4, '#1a1420', { flat: true, line: false });
      }
      S.C(40, 38, 50, 40, 1.2, sh, X(B, { clip: 'body', flat: true, line: false }));
      spark(S, [[10, 20, 0.7], [56, 30, 0.6], [16, 50, 0.6]], '#ffd890');
    },
  });
  Object.assign(DD.TEX, { kolkwicht: 'feather' });
})();

// ---- design/dd_s13.js
'use strict';
// NUR ENTWURF – Rabenmuhme
(function () {
  const { F, B, X, MIST, halo, spark } = DD.H;
  Object.assign(DD.DEF, {
    rabenmuhme(S) { // gebeugte alte Rabenfrau im Schattenumhang, mit Laterne und Brille
      const robe = '#2a2436', robe2 = '#1a1624', fe = '#34303e', sc = '#7a5aa8', sc2 = '#5a3e88', bk = '#5a5060', gl = '#c8c0d8', lamp = '#ffd070', eye = '#c890ff';
      S.P([[30, 24], [44, 22], [52, 32], [54, 46], [58, 59], [52, 57], [48, 60], [42, 57], [36, 60], [30, 57], [24, 60], [22, 50], [24, 36]], robe, { name: 'robe', g: 'body' });
      for (const [x0, y0, x1, y1] of [[40, 30, 46, 56], [32, 34, 30, 56], [48, 36, 52, 54]]) S.C(x0, y0, x1, y1, 0.8, robe2, { clip: 'robe', flat: true, line: false });
      S.E(40, 28, 13, 7, robe, { g: 'body', rot: 0.25 });
      S.P([[24, 30], [44, 27], [46, 33], [40, 36], [34, 33], [28, 36], [22, 34]], sc, { name: 'scarf', g: 'scarf' });
      S.P([[26, 34], [42, 32], [41, 37], [36, 39], [31, 37], [26, 40]], sc2, { g: 'scarf' });
      for (const x of [28, 33, 38]) S.C(x, 31, x + 1, 35, 0.5, '#9a7ac8', { clip: 'scarf', flat: true, line: false });
      S.E(25, 22, 8, 7.4, fe, { name: 'head', g: 'head' });
      for (const [x, y, dx, dy] of [[27, 15.6, 2, -4], [31, 17, 4, -2]]) S.P([[x - 1.2, y + 1], [x + dx, y + dy], [x + 1.4, y + 1.4]], fe, { g: 'head' });
      S.P([[19, 21], [9, 25], [8, 30], [12, 28], [19, 26]], bk, { g: 'head' });
      S.C(10, 26.6, 18, 23, 0.5, '#8a8090', { flat: true, line: false, g: 'head' });
      S.eye(22, 21.6, 1.8, 2, eye, { dark: '#4a1a7a', white: 0.5 }).eye(27.4, 21.2, 1.8, 2, eye, { dark: '#4a1a7a', white: 0.5 });
      halo(S, 22, 21.6, 3, eye, 0.25); halo(S, 27.4, 21.2, 3, eye, 0.25);
      for (const [cx, cy] of [[22, 21.6], [27.4, 21.2]]) {
        const pts = []; for (let i = 0; i <= 16; i++) { const a = i / 16 * Math.PI * 2; pts.push([cx + Math.cos(a) * 2.9, cy + Math.sin(a) * 2.9]); }
        for (let i = 0; i < 16; i++) S.C(pts[i][0], pts[i][1], pts[i + 1][0], pts[i + 1][1], 0.35, gl, X(F, { flat: true, line: false, noOutline: true }));
      }
      S.C(24.9, 21.4, 24.5, 21.4, 0.4, gl, X(F, { flat: true, line: false }));
      S.C(30, 36, 20, 40, 2.6, robe, { g: 'arm' }).C(20, 40, 15, 40, 2, robe, { g: 'arm' });
      for (const dy of [-1.2, 0, 1.2]) S.C(15, 40, 12.6, 40 + dy * 1.4, 0.5, bk, { g: 'arm' });
      S.C(12, 40, 12, 44, 0.5, '#6a6070');
      halo(S, 12, 48, 9, lamp, 0.35);
      S.R(9, 44, 6, 1.4, '#4a4050').R(9.6, 45.4, 4.8, 5.6, lamp, { glow: true }).R(9, 51, 6, 1.4, '#4a4050');
      S.C(12, 45.6, 12, 50.6, 0.4, '#6a5030', { flat: true, line: false });
      S.E(12, 48.4, 1.1, 1.6, '#fff4c0', { glow: true, flat: true, line: false });
      for (const [x, y, r] of [[30, 60, 3], [42, 60.4, 3.4], [52, 60, 2.6]]) S.E(x, y, r, r * 0.6, '#6a5a88', MIST);
      S.C(34, 26, 48, 30, 1.2, robe2, X(B, { clip: 'robe', flat: true, line: false }));
      spark(S, [[6, 40, 0.6], [16, 54, 0.6], [56, 20, 0.6]], lamp);
    },
  });
  Object.assign(DD.TEX, { rabenmuhme: 'feather' });
})();

// ---- design/dd_s14.js
'use strict';
// NUR ENTWURF – Wurzelschrat
(function () {
  const { F, B, X, halo, spark } = DD.H;
  Object.assign(DD.DEF, {
    wurzelschrat(S) { // knorriger Wurzelgeist, Astloch-Gesicht mit zwei Glühwürmchen-Augen
      const bark = '#4a3a34', bark2 = '#33282a', bark3 = '#6a5448', moss = '#4a7a4a', moss2 = '#6a9a58', ff = '#d8ff70';
      for (const [x0, x1, w] of [[26, 16, 3.4], [32, 30, 3.6], [38, 46, 3.4]]) { S.C(x0, 52, x1, 58.4, w, bark, { g: 'roots' }); S.C(x1, 58.4, x1 + (x1 < 30 ? -4 : 4), 60, w * 0.55, bark, { g: 'roots' }); }
      S.P([[22, 54], [21, 40], [23, 26], [20, 18], [26, 20], [30, 14], [34, 19], [40, 16], [41, 26], [42, 40], [44, 54], [36, 56], [28, 56]], bark, { name: 'trunk', g: 'body' });
      for (const [x0, y0, x1, y1] of [[26, 28, 24, 52], [37, 26, 39, 52], [31, 44, 31, 55], [28, 22, 27, 30]]) S.C(x0, y0, x1, y1, 0.8, bark2, { clip: 'trunk', flat: true, line: false });
      S.C(34, 30, 35, 48, 1, bark3, { clip: 'trunk', flat: true, line: false });
      S.C(22, 34, 13, 30, 2.4, bark, { g: 'armF' }).C(13, 30, 9, 24, 1.4, bark, { g: 'armF' }).C(13, 30, 7, 31, 1.2, bark, { g: 'armF' }).C(9, 24, 8, 21, 0.8, bark, { g: 'armF' });
      S.C(41, 32, 49, 26, 2.2, bark, { g: 'armB' }).C(49, 26, 52, 20, 1.3, bark, { g: 'armB' }).C(49, 26, 55, 26, 1.1, bark, { g: 'armB' });
      S.E(8.6, 21, 1.6, 1.2, moss2, { g: 'armF' }).E(52.6, 19, 1.8, 1.3, moss2, { g: 'armB' });
      S.P([[20, 19], [24, 13], [31, 11], [38, 13], [42, 18], [40, 21], [33, 19], [26, 21]], moss, { name: 'moss', g: 'top' });
      S.E(26, 14, 2.6, 1.2, moss2, { clip: 'moss', flat: true, line: false }).E(35, 13.4, 2.4, 1.1, moss2, { clip: 'moss', flat: true, line: false });
      S.C(29, 12, 28, 6, 0.6, '#5a8a48').E(26.8, 6, 1.8, 1, moss2, { rot: -0.4 }).C(34, 12, 36, 7.4, 0.6, '#5a8a48').E(37.6, 7.2, 1.6, 0.9, moss2, { rot: 0.4 });
      S.E(27, 31, 4.4, 5, bark2, X(F, { name: 'holeL' })).E(36, 30.4, 3.8, 4.6, bark2, X(F, { name: 'holeR' }));
      S.E(27, 32, 3.2, 3.8, '#120e10', X(F, { clip: 'holeL', flat: true, line: false })).E(36, 31.4, 2.8, 3.4, '#120e10', X(F, { clip: 'holeR', flat: true, line: false }));
      halo(S, 27, 32, 4, ff, 0.4); halo(S, 36, 31.4, 3.6, ff, 0.4);
      S.E(27, 32, 1.4, 1.4, ff, X(F, { glow: true, flat: true })).E(36, 31.4, 1.3, 1.3, ff, X(F, { glow: true, flat: true }));
      S.E(26.6, 31.6, 0.5, 0.5, '#ffffff', X(F, { flat: true, line: false })).E(35.6, 31, 0.5, 0.5, '#ffffff', X(F, { flat: true, line: false }));
      S.P([[25, 41], [29, 42.4], [32, 41], [35, 42.6], [38, 41.4], [35, 44], [30, 44], [27, 43.6]], '#120e10', X(F, { flat: true }));
      S.E(23, 48, 3, 2, moss, X(F, { clip: 'trunk', line: false })).E(41, 44, 2, 3, moss, { clip: 'trunk', line: false });
      S.E(31, 32, 7, 6, bark2, X(B, { clip: 'trunk', flat: true, line: false, alpha: 0.6 }));
      for (const [x, y] of [[12, 16], [50, 36], [6, 40], [46, 12]]) { halo(S, x, y, 2.4, ff, 0.35); S.E(x, y, 0.7, 0.7, ff, { glow: true, flat: true, line: false, cast: false }); }
      spark(S, [[18, 8, 0.5]], ff);
    },
  });
  Object.assign(DD.TEX, { wurzelschrat: 'stone' });
})();

// ---- design/dd_s15.js
'use strict';
// NUR ENTWURF – Grottenmaul
(function () {
  const { F, B, X, halo, spark } = DD.H;
  Object.assign(DD.DEF, {
    grottenmaul(S) { // bemooster Felsbrocken mit riesigem Maul, Leuchtsteine im Rachen, schläft meistens
      const st = '#5a5866', st2 = '#44424e', st3 = '#76748a', moss = '#4a7a4a', moss2 = '#6a9a58', tooth = '#b8b4c4', tq = '#7af0d0', vi = '#b080ff';
      S.E(18, 58, 5, 2.6, st2, { g: 'legF' }).E(46, 58.4, 6, 2.8, st2, { g: 'legB' });
      S.E(34, 40, 26, 20, st, { name: 'body', g: 'body' });
      S.E(40, 30, 10, 4, st3, { clip: 'body', flat: true, line: false, rot: 0.2 });
      for (const [x0, y0, x1, y1] of [[48, 30, 54, 42], [44, 50, 52, 54]]) S.C(x0, y0, x1, y1, 0.8, st2, { clip: 'body', flat: true, line: false });
      S.P([[10, 34], [20, 30], [32, 31], [38, 38], [34, 50], [22, 54], [12, 50], [9, 42]], '#16121c', X(F, { name: 'maw', clip: 'body' }));
      S.E(22, 48, 10, 5, '#3a2a3a', X(F, { clip: 'maw', flat: true, line: false }));
      for (const [x, y, r, c] of [[18, 40, 2.2, tq], [27, 38, 1.8, vi], [24, 44, 1.5, tq], [31, 43, 1.3, vi]]) { S.E(x, y, r * 1.8, r * 1.6, c, X(F, { clip: 'maw', alpha: 0.25, flat: true, line: false, noOutline: true })); S.E(x, y, r, r * 0.85, c, X(F, { glow: true, clip: 'maw' })); }
      for (const [x, y] of [[17.2, 39.2], [26.4, 37.2], [23.5, 43.4], [30.6, 42.4]]) S.E(x, y, 0.6, 0.5, '#ffffff', X(F, { flat: true, line: false }));
      for (const [x, y, w, h] of [[13.6, 33.4, 4.4, 5.4], [20, 31.2, 4.8, 6], [27, 31.4, 4.4, 5.6], [33, 33.6, 3.6, 4.6]]) S.P([[x - w / 2, y], [x + w / 2, y - 0.3], [x + 0.2, y + h]], tooth, F);
      for (const [x, y, w, h] of [[15.6, 51.4, 4.4, 4.6], [22.6, 53, 4.6, 5], [29.4, 50.6, 4, 4.4]]) S.P([[x - w / 2, y], [x + w / 2, y + 0.3], [x, y - h]], tooth, F);
      S.P([[14, 26], [22, 21], [34, 20], [46, 22], [54, 28], [48, 27], [40, 25], [30, 25], [22, 27]], moss, { name: 'moss', g: 'top' });
      S.E(46, 54, 6, 3, moss, { clip: 'body', line: false }).E(56, 40, 3, 5, moss, { clip: 'body', line: false });
      S.E(26, 22.4, 3, 1.2, moss2, { clip: 'moss', flat: true, line: false }).E(40, 22, 3, 1.1, moss2, { clip: 'moss', flat: true, line: false });
      S.C(34, 21, 33, 15, 0.6, '#5a8a48').E(31.6, 15, 1.8, 1, moss2, { rot: -0.4 }).C(36, 21, 38, 16, 0.6, '#5a8a48').E(39.6, 15.8, 1.6, 0.9, moss2, { rot: 0.4 });
      S.E(22, 28.4, 3, 2.4, st, X(F, { g: 'lid' })).E(32, 27.6, 3.2, 2.6, st, X(F, { g: 'lid' }));
      S.C(19.4, 28.6, 24.6, 28.6, 0.7, '#1a1620', X(F, { flat: true, line: false })).C(29.2, 27.8, 34.8, 27.8, 0.7, '#1a1620', X(F, { flat: true, line: false }));
      S.C(20, 29.4, 19.6, 30.4, 0.4, '#1a1620', X(F, { flat: true, line: false })).C(30, 28.6, 29.6, 29.6, 0.4, '#1a1620', X(F, { flat: true, line: false }));
      S.E(36, 42, 16, 12, st2, X(B, { clip: 'body', flat: true, line: false, alpha: 0.5 }));
      spark(S, [[8, 22, 0.6], [58, 20, 0.6], [4, 46, 0.6]], tq);
      S.E(50, 14, 1.2, 1.2, '#c0bccc', { alpha: 0.6, flat: true, line: false, cast: false }).E(54, 10, 1.6, 1.6, '#c0bccc', { alpha: 0.5, flat: true, line: false, cast: false });
    },
  });
  Object.assign(DD.TEX, { grottenmaul: 'stone' });
})();

// ---- design/dd_s16.js
'use strict';
// NUR ENTWURF – Neumondhirschkäfer
(function () {
  const { F, B, X, halo, spark } = DD.H;
  const arc = (cx, cy, R, a0, a1, w0, n) => {
    const out = [], inn = [];
    for (let i = 0; i <= n; i++) {
      const t = i / n, a = (a0 + (a1 - a0) * t) * Math.PI / 180, w = w0 * (1 - t) + 0.25;
      out.push([cx + Math.cos(a) * (R + w / 2), cy + Math.sin(a) * (R + w / 2)]);
      inn.push([cx + Math.cos(a) * (R - w / 2), cy + Math.sin(a) * (R - w / 2)]);
    }
    return out.concat(inn.reverse());
  };
  Object.assign(DD.DEF, {
    neumondhirschkaefer(S) { // schwarzer Hirschkäfer, Zangen wie zwei Mondsicheln, Sternenstaub auf dem Panzer
      const sh = '#1e1c2c', sh2 = '#12101c', sh3 = '#3a3858', leg = '#24222e', mn = '#e0e4ff', star = '#f0f0ff';
      for (const [x0, x1] of [[30, 26], [40, 40], [50, 54]]) { S.C(x0, 50, x1, 56, 1.4, leg, { g: 'legB' }); S.C(x1, 56, x1 + (x1 < 40 ? -3 : 3), 60, 1.1, leg, { g: 'legB' }); }
      S.E(42, 44, 17, 12.5, sh, { name: 'shell', g: 'body' });
      S.C(42, 32, 42, 56, 0.7, sh2, { clip: 'shell', flat: true, line: false });
      S.E(38, 37, 9, 3, sh3, { clip: 'shell', flat: true, line: false, rot: -0.15 });
      for (const [x, y, r] of [[34, 42, 0.7], [47, 38, 0.6], [52, 46, 0.8], [40, 50, 0.6], [46, 52, 0.5], [55, 40, 0.5], [36, 48, 0.5], [50, 43, 0.4]]) S.E(x, y, r, r, star, { clip: 'shell', glow: true, flat: true, line: false });
      S.P([[50, 41.4], [50.6, 43.4], [52.6, 44], [50.6, 44.6], [50, 46.6], [49.4, 44.6], [47.4, 44], [49.4, 43.4]], star, { clip: 'shell', glow: true, flat: true, line: false });
      S.E(26, 44, 7, 6.4, sh, { name: 'thorax', g: 'body' });
      S.E(24, 41.6, 3.4, 1.4, sh3, { clip: 'thorax', flat: true, line: false });
      S.C(24, 50, 20, 55, 1.4, leg, { g: 'legF' }).C(20, 55, 16, 59.6, 1.1, leg, { g: 'legF' });
      S.C(34, 52, 33, 57, 1.4, leg, { g: 'legF' }).C(33, 57, 31, 60, 1.1, leg, { g: 'legF' });
      S.E(16, 42, 5.4, 4.4, sh, { name: 'head', g: 'head' });
      S.C(14, 38.4, 10, 33, 0.5, leg, { g: 'head' }).E(9.6, 32.6, 0.9, 0.9, leg, { g: 'head' });
      halo(S, 7, 38, 5, mn, 0.08);
      // v21: zwei getrennte Mondsicheln statt eines geschlossenen Rings
      S.P(arc(13, 32, 7, 55, 195, 3.2, 14), mn, { glow: true, g: 'jawB' });
      S.P(arc(10, 41, 6, 95, 215, 3, 12), mn, { glow: true, g: 'jawF' });
      S.eye(13.6, 41, 1.4, 1.5, '#a8b0ff', X(F, { dark: '#2a2a6a', white: 0.5 }));
      S.E(44, 40, 12, 7, sh3, X(B, { clip: 'shell', flat: true, line: false, alpha: 0.5 }));
      spark(S, [[6, 22, 0.7], [22, 20, 0.5], [58, 26, 0.6], [30, 28, 0.5]], star);
    },
  });
  Object.assign(DD.TEX, { neumondhirschkaefer: 'dots' });
})();

Object.assign(G.Creatures.DEF, DD.DEF); Object.assign(G.Creatures.TEX, DD.TEX);
