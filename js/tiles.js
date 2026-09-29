'use strict';
// Eldenghost – Oberwelt-Kacheln im Comic-Pixelstil (passend zu Geistern, Mühle und Schmiede)
// Boden: flache Farbflächen, klare Grasbüschel, weiche Wegkanten, Steinplatten – keine Körnung.
// Objekte (Bäume, Weiden, Zäune, Gräber, Laternen, Schilder, Felsen, Stümpfe, Glocke, Stege) und Häuser werden
// über G.Art gerastert: 3 Tonstufen, dunkle Kontur, Mondlicht-Kante. 1 Kunstpixel = 1 logischer Pixel.
(function (G) {
  const T = 16;
  function hash(x, y, s = 0) {
    let h = (x * 374761393 + y * 668265263 + s * 982451653) | 0;
    h = Math.imul(h ^ (h >>> 13), 1274126177); h ^= h >>> 16;
    return (h >>> 0) / 4294967296;
  }
  const at = (m, x, y) => (x < 0 || y < 0 || x >= m.w || y >= m.h) ? 'T' : m.tiles[y][x];
  // Paletten je Gebiet (gedämpft, damit Figuren mit Kontur davor klar lesbar sind)
  const PAL = {
    dorf: { g: '#2a4641', gD: '#213a36', gL: '#38594f', tip: '#4f7667', tall: '#21403e', tallL: '#33605a', tallT: '#4f8274', tallD: '#162c2c',
      path: '#4a4352', pathD: '#3b3544', pathL: '#5a5264', edge: '#1e2d2c', leaf: ['#2d5a4e', '#35456a'], trunk: '#4a3430' },
    moor: { g: '#25342c', gD: '#1c2822', gL: '#324538', tip: '#4c6148', tall: '#20332c', tallL: '#2f4a3c', tallT: '#4c6a52', tallD: '#141f1a',
      path: '#3e3a3c', pathD: '#322e32', pathL: '#4c4648', edge: '#161e1a', leaf: ['#2c4638', '#383a58'], trunk: '#3e302a' }
  };
  const pal = m => PAL[m.theme] || PAL.dorf;
  const isPath = c => c === ',' || c === 'D';
  // ---------------- Boden ----------------
  function ground(g, m, x, y, c) {
    const d = G.pen(g), R = i => hash(x, y, i), P = pal(m);
    const grass = (tufts = 2) => {
      d.r(0, 0, 16, 16, P.g);
      // gleichmässig verteilte Büschel (Gen-4/5-Gras): zwei Halmspitzen, Schatten darunter
      for (let i = 0; i < tufts; i++) {
        const bx = (i % 2) * 8 + 1 + (R(i) * 3 | 0), by = (i >> 1) * 8 + 3 + (R(i + 5) * 6 | 0) + (i % 2 ? 2 : 0);
        d.p(bx, by + 1, P.gL); d.p(bx + 1, by, P.tip); d.p(bx + 2, by + 1, P.gL); d.p(bx + 3, by, P.tip); d.p(bx + 4, by + 1, P.gL);
        d.r(bx, by + 2, 5, 1, P.gD);
      }
      if (R(30) < 0.25) { const px = 2 + R(31) * 11 | 0, py = 2 + R(32) * 11 | 0; d.r(px, py, 2, 1, P.gD); }
    };
    switch (c) {
      case ',': case 'D': {
        d.r(0, 0, 16, 16, P.path);
        const n = !isPath(at(m, x, y - 1)), s = !isPath(at(m, x, y + 1)), w = !isPath(at(m, x - 1, y)), e = !isPath(at(m, x + 1, y));
        if (n) { d.r(0, 0, 16, 1, P.edge); d.r(0, 1, 16, 1, P.pathL); }
        if (s) { d.r(0, 15, 16, 1, P.edge); d.r(0, 14, 16, 1, P.pathD); }
        if (w) { d.r(0, 0, 1, 16, P.edge); d.r(1, n ? 2 : 0, 1, 16 - (n ? 2 : 0) - (s ? 2 : 0), P.pathD); }
        if (e) { d.r(15, 0, 1, 16, P.edge); d.r(14, n ? 2 : 0, 1, 16 - (n ? 2 : 0) - (s ? 2 : 0), P.pathD); }
        // abgerundete Ecken (Gras schaut herein)
        const corner = (cx, cy, sx, sy) => { d.p(cx, cy, P.g); d.p(cx + sx, cy, P.edge); d.p(cx, cy + sy, P.edge); };
        if (n && w) corner(0, 0, 1, 1); if (n && e) corner(15, 0, -1, 1); if (s && w) corner(0, 15, 1, -1); if (s && e) corner(15, 15, -1, -1);
        // innere Ecken: diagonal angrenzendes Gras
        if (!n && !w && !isPath(at(m, x - 1, y - 1))) { d.p(0, 0, P.edge); } if (!n && !e && !isPath(at(m, x + 1, y - 1))) d.p(15, 0, P.edge);
        if (!s && !w && !isPath(at(m, x - 1, y + 1))) d.p(0, 15, P.edge); if (!s && !e && !isPath(at(m, x + 1, y + 1))) d.p(15, 15, P.edge);
        for (let i = 0; i < 2; i++) { const px = 3 + R(i + 40) * 9 | 0, py = 3 + R(i + 42) * 9 | 0; d.r(px, py, 2, 1, P.pathL); d.r(px, py + 1, 2, 1, P.pathD); }
        break;
      }
      case '"': { // hohes Nebelgras: regelmässige Büschel mit dunkler Unterkante (klar als Begegnungsgras erkennbar)
        d.r(0, 0, 16, 16, P.tall);
        const pp = (px, py, col) => { if (px >= 0 && px < 16 && py >= 0 && py < 16) d.p(px, py, col); };
        const clump = (X, by) => {
          for (let k = 1; k < 7; k++) for (let j = 3; j < 6; j++) pp(X + k, by + j, P.tallL);
          [[1, 2], [3, 1], [5, 2], [6, 3]].forEach(([a, b]) => pp(X + a, by + b, P.tallT)); [[2, 2], [3, 2], [4, 2]].forEach(([a, b]) => pp(X + a, by + b, P.tallL));
          for (let k = 1; k < 7; k++) pp(X + k, by + 6, P.tallD); pp(X, by + 5, P.tallD); pp(X + 7, by + 5, P.tallD);
        };
        clump(0, 0); clump(8, 0); clump(-4, 8); clump(4, 8); clump(12, 8);
        break;
      }
      case 'q': // nasser Uferboden: flache Pfützen, Schilfbüschel
        d.r(0, 0, 16, 16, '#20332f');
        if (R(1) < 0.55) { const px = 3 + R(2) * 7 | 0, py = 4 + R(3) * 8 | 0; d.r(px, py, 6, 2, '#172630'); d.r(px + 1, py - 1, 4, 1, '#172630'); d.r(px + 1, py + 2, 4, 1, '#2c4442'); d.p(px + 1, py, '#3c5a66'); }
        for (let t = 0; t < 2; t++) { const bx = 2 + R(t + 5) * 10 | 0, by = 7 + R(t + 8) * 7 | 0;
          d.r(bx, by - 4, 1, 4, '#3e5236'); d.r(bx + 2, by - 5, 1, 5, '#45593a'); d.r(bx + 4, by - 3, 1, 3, '#3e5236'); d.r(bx + 2, by - 7, 1, 2, '#6a5232'); d.r(bx, by, 5, 1, '#172622'); }
        break;
      case 'm': // Torfstich: gestochene Torfsoden in Reihen, Moospolster
        d.r(0, 0, 16, 16, '#3a2d25');
        for (let r = 0; r < 3; r++) { const yy = r * 5 + 4; d.r(0, yy, 16, 1, '#281e18'); d.r(0, yy + 1, 16, 1, '#46372c');
          const o = ((r + y) % 2) * 5 + 2; d.r(o, yy - 4 < 0 ? 0 : yy - 4, 1, yy < 4 ? yy : 4, '#281e18'); d.r(o + 8, yy - 4 < 0 ? 0 : yy - 4, 1, yy < 4 ? yy : 4, '#281e18'); }
        if (R(3) < 0.6) { const px = 2 + R(4) * 10 | 0, py = 1 + R(5) * 10 | 0; d.r(px, py, 3, 2, '#4a5634'); d.p(px + 1, py - 1, '#5e6a40'); }
        break;
      case 'c': case 'B': { // Kapellenboden: grosse, dunkle Steinplatten mit Fugen, Rissen und Moos
        d.r(0, 0, 16, 16, '#24212e');
        const o = (y % 2) * 8;
        for (const [sx, sy, w, h] of [[o - 16, 0, 15, 7], [o - 1, 0, 15, 7], [o + 14, 0, 15, 7], [0, 8, 7, 7], [8, 8, 7, 7]]) {
          const x0 = Math.max(0, sx), x1 = Math.min(16, sx + w); if (x1 <= x0) continue;
          d.r(x0, sy + 1, x1 - x0, h - 1, '#3a3748'); d.r(x0, sy + 1, x1 - x0, 1, '#45425a');
        }
        if (R(1) < 0.45) { const px = 2 + R(2) * 11 | 0, py = 2 + R(3) * 11 | 0; d.r(px, py, 3, 1, '#2a5040'); d.p(px + 1, py - 1, '#34604a'); }
        if (R(4) < 0.35) { const px = 3 + R(5) * 9 | 0, py = 3 + R(6) * 9 | 0; d.p(px, py, '#24212e'); d.p(px + 1, py + 1, '#24212e'); d.p(px + 2, py + 1, '#24212e'); }
        break;
      }
      case 'u': { // Kapellenmauer (Ruine, von oben): helle Deckplatten, darunter Quader-Stirnseite, Moos
        const isU = (a, b) => at(m, a, b) === 'u', dn = !isU(x, y + 1), up = !isU(x, y - 1), lf = !isU(x - 1, y), rt = !isU(x + 1, y);
        const capH = dn ? 9 : 16;
        d.r(0, 0, 16, capH, '#5e5a74');
        for (let k = 0; k < 16; k += 8) d.r(k + ((y % 2) * 4), 0, 1, capH, '#4a4660');
        d.r(0, 4, 16, 1, '#4a4660'); if (!dn) d.r(0, 12, 16, 1, '#4a4660');
        if (up) { d.r(0, 0, 16, 1, '#8480a0'); }
        if (lf) { d.r(0, 0, 1, capH, '#14121c'); } if (rt) d.r(15, 0, 1, capH, '#14121c');
        if (up) d.r(lf ? 1 : 0, 1, 16 - (lf ? 1 : 0) - (rt ? 1 : 0), 1, '#6e6a88');
        if (dn) {
          d.r(0, 9, 16, 7, '#3a3650'); d.r(0, 9, 16, 1, '#14121c');
          for (let k = -4; k < 16; k += 8) d.r(k + ((y % 2) * 4) + 4, 10, 1, 5, '#2a2640'); d.r(0, 12, 16, 1, '#2a2640');
          d.r(0, 15, 16, 1, '#14121c');
        }
        if (R(3) < 0.55) { const px = R(4) * 12 | 0; d.r(px, 1 + (R(7) * 3 | 0), 3, 2, '#3a5a44'); d.p(px + 1, 3 + (R(7) * 3 | 0), '#46684e'); }
        break;
      }
      case '*': grass(1);
        for (let i = 0; i < 3; i++) { const fx = 2 + R(i + 11) * 11 | 0, fy = 3 + R(i + 22) * 10 | 0;
          d.p(fx, fy + 2, '#1a2a28'); d.p(fx, fy + 1, '#2e5a4a'); d.p(fx - 1, fy, '#a898e0'); d.p(fx + 1, fy, '#a898e0'); d.p(fx, fy - 1, '#c8b8f4'); d.p(fx, fy, '#fff0c0'); }
        break;
      case 'b': case '~': case 'w': if (m.theme === 'moor') { d.r(0, 0, 16, 16, P.g); break; } grass(1); break;
      default: grass(c === '.' ? 2 : 1);
    }
  }
  // ---------------- Objekte (Art-Sprites, zwischengespeichert) ----------------
  const OC = {};
  const S0 = () => new G.Art.Shape();
  const SH = (S, cx, cy, rx, ry = 1.6) => S.E(cx, cy, rx, ry, '#0a0814', { flat: true, alpha: 0.42, noOutline: true, cast: false, line: false });
  function tree(theme, v) {
    const key = 'T' + theme + v; if (OC[key]) return OC[key];
    const P = PAL[theme] || PAL.dorf, leaf = P.leaf[v % 2], S = S0();
    SH(S, 8, 20.5, 6.5, 1.8);
    S.R(6.5, 13, 3, 8, P.trunk, { g: 'trunk' }).P([[5, 21], [6.5, 18], [9.5, 18], [11, 21]], P.trunk, { g: 'trunk' });
    S.E(4.6, 11.4, 4.2, 3.6, leaf, { g: 'lo' }).E(11.4, 11.4, 4.2, 3.6, leaf, { g: 'lo' });
    S.E(8, 8.5, 6.8, 5.4, leaf, { g: 'mid' });
    S.E(7.4, 4.8, 4.6, 3.8, leaf, { g: 'top', hiAt: 0.8 });
    if (v >= 2) S.E(11, 7, 2.6, 2.2, leaf, { g: 'top2', hiAt: 0.8 });
    return (OC[key] = G.Art.raster(S, 16, 22, 1));
  }
  function willow(v) {
    const key = 'x' + v; if (OC[key]) return OC[key];
    const S = S0(), bark = '#4a4440', moss = '#3e4c3a';
    SH(S, 8, 22.5, 6, 1.6);
    S.P([[5, 23], [6.5, 12], [5, 7], [7, 7], [8, 11], [9.5, 6], [11, 7], [9.5, 13], [11, 23]], bark, { g: 'trunk' });
    S.E(8, 6, 7.2, 4.2, moss, { g: 'crown' });
    for (let i = 0; i < 6; i++) { const sx = 1.8 + i * 2.5; S.C(sx, 7, sx + (v ? 0.5 : -0.5), 12 + (i % 3) * 2.5, 1.2, moss, { g: 'strand' + i }); }
    S.E(7, 13, 1, 1.2, '#1a1418', { flat: true, line: false });
    return (OC[key] = G.Art.raster(S, 16, 24, 1));
  }
  function fence(l, r) {
    const key = 'f' + (+l) + (+r); if (OC[key]) return OC[key];
    const S = S0(), wood = '#6a4c38';
    SH(S, 8, 14.6, 7.5, 1.1);
    S.R(l ? 0 : 2, 6.5, 16 - (l ? 0 : 2) - (r ? 0 : 2), 2, wood, { g: 'rail' }).R(l ? 0 : 2, 10.5, 16 - (l ? 0 : 2) - (r ? 0 : 2), 1.6, wood, { g: 'rail' });
    S.R(2.5, 4, 2.4, 10.5, wood, { g: 'post1' }).R(11.1, 4, 2.4, 10.5, wood, { g: 'post2' });
    S.P([[2.5, 4], [3.7, 2.8], [4.9, 4]], wood, { g: 'post1' }).P([[11.1, 4], [12.3, 2.8], [13.5, 4]], wood, { g: 'post2' });
    return (OC[key] = G.Art.raster(S, 16, 16, 1));
  }
  function grave(v) {
    const key = 'g' + v; if (OC[key]) return OC[key];
    const S = S0(), st = v ? '#5e5a72' : '#6a667c';
    SH(S, 8, 14.8, 6.5, 1.4);
    S.R(3, 12.5, 10, 2.5, '#4a465a', { g: 'base' });
    S.R(4, 5, 8, 8, st, { g: 'stone' }).E(8, 5.2, 4, 3.2, st, { g: 'stone' });
    S.R(7.5, 4.6, 1, 6, '#34304a', { clip: 'stone', flat: true, line: false }).R(6, 6.2, 4, 1, '#34304a', { clip: 'stone', flat: true, line: false });
    S.E(5.2, 12.2, 2, 1.1, '#3e6a48', { flat: true, line: false });
    return (OC[key] = G.Art.raster(S, 16, 16, 1));
  }
  function lantern(lit) {
    const key = 'L' + (+lit); if (OC[key]) return OC[key];
    const S = S0(), iron = '#3a3244';
    SH(S, 8, 15.2, 4, 1.2);
    S.R(6, 13.5, 4, 2, iron, { g: 'base' }).R(7.2, 5, 1.6, 9, iron, { g: 'post' });
    S.R(5, 1.6, 6, 4.4, lit ? '#ffc868' : '#565a78', lit ? { glow: true, g: 'glass' } : { g: 'glass' });
    S.R(7.4, 1.6, 1.2, 4.4, iron, { flat: true, line: false, g: 'glass' });
    S.P([[4, 1.8], [8, -0.6], [12, 1.8]], iron, { g: 'cap' }).R(4.6, 6, 6.8, 1, iron, { g: 'cap' });
    return (OC[key] = G.Art.raster(S, 16, 16, 1));
  }
  function sign() {
    if (OC.S) return OC.S;
    const S = S0(), wood = '#7a5a3e';
    SH(S, 8, 15, 4, 1.1);
    S.R(7, 9, 2, 6, '#4a3428', { g: 'post' });
    S.R(2.5, 3, 11, 7, wood, { g: 'board' });
    S.R(4.5, 5, 7, 1, '#3e2c20', { clip: 'board', flat: true, line: false }).R(4.5, 7, 5, 1, '#3e2c20', { clip: 'board', flat: true, line: false });
    return (OC.S = G.Art.raster(S, 16, 16, 1));
  }
  function rock(v) {
    const key = 'r' + v; if (OC[key]) return OC[key];
    const S = S0(), st = '#56526a';
    SH(S, 8, 14.6, 6.5, 1.4);
    S.E(8, 11, 6, 3.8, st, { g: 'r1' }).E(v ? 10 : 6, 8.8, 3.6, 2.8, st, { g: 'r2', hiAt: 0.8 });
    S.E(11.5, 13, 1.6, 0.8, '#3a8a7a', { flat: true, line: false });
    return (OC[key] = G.Art.raster(S, 16, 16, 1));
  }
  function stump() {
    if (OC.k) return OC.k;
    const S = S0();
    SH(S, 8, 14.4, 7, 1.4);
    S.E(8, 11.5, 6.2, 3.4, '#4a3526', { g: 'side' }).R(1.8, 9, 12.4, 2.5, '#4a3526', { g: 'side' });
    S.E(8, 9, 6.2, 2.6, '#8a6a48', { g: 'top', flat: true });
    S.E(8, 9, 3.6, 1.4, '#6e5236', { clip: 'top', flat: true, line: false }).E(8, 9, 1.4, 0.6, '#8a6a48', { clip: 'top', flat: true, line: false });
    return (OC.k = G.Art.raster(S, 16, 16, 1));
  }
  function bell() {
    if (OC.B) return OC.B;
    const S = S0(), wood = '#4a3428';
    SH(S, 8, 15, 6, 1.2);
    S.R(2.8, 2, 1.8, 13, wood, { g: 'p1' }).R(11.4, 2, 1.8, 13, wood, { g: 'p2' }).R(1.6, 1, 12.8, 2, wood, { g: 'beam' });
    S.E(8, 7.2, 3.4, 3.6, '#b08a3e', { g: 'bell' }).R(4.6, 7.2, 6.8, 3.4, '#b08a3e', { g: 'bell' }).E(8, 10.8, 4.4, 1.2, '#b08a3e', { g: 'bell' });
    S.E(8, 12.4, 1, 1, '#6a5028', { g: 'clap' });
    return (OC.B = G.Art.raster(S, 16, 16, 1));
  }
  // Stege: flache Planken mit dunklen Fugen und Kanten (vertikal, horizontal, Kreuzung)
  function plank(kind) {
    const key = 'b' + kind; if (OC[key]) return OC[key];
    const c = G.mk(16, 16), d = G.pen(c.getContext('2d')), W1 = '#6a5038', WL = '#80624a', WD = '#4c3828', GAP = '#2e2218', OL = '#14100c';
    const vert = () => { d.r(2, 0, 12, 16, W1); for (let i = 0; i < 16; i += 4) { d.r(3, i, 10, 1, WL); d.r(3, i + 3, 10, 1, GAP); } d.r(2, 0, 1, 16, OL); d.r(13, 0, 1, 16, OL); d.r(12, 0, 1, 16, WD); d.p(5, 1, '#9a7a58'); d.p(10, 9, '#9a7a58'); };
    const hor = () => { d.r(0, 2, 16, 12, W1); for (let i = 0; i < 16; i += 4) { d.r(i, 3, 1, 10, WL); d.r(i + 3, 3, 1, 10, GAP); } d.r(0, 2, 16, 1, OL); d.r(0, 13, 16, 1, OL); d.r(0, 12, 16, 1, WD); d.r(0, 14, 16, 1, 'rgba(6,8,16,0.4)'); };
    if (kind === 'v') vert(); else if (kind === 'h') hor(); else { hor(); d.r(2, 0, 12, 16, W1); for (let i = 0; i < 16; i += 4) { d.r(3, i, 10, 1, WL); d.r(3, i + 3, 10, 1, GAP); } d.r(2, 0, 1, 2, OL); d.r(13, 0, 1, 2, OL); d.r(2, 14, 1, 2, OL); d.r(13, 14, 1, 2, OL); }
    return (OC[key] = c);
  }
  // Wasser-Deko: Schilf, Uferstein, Seerosenblatt (mit/ohne Blüte)
  function reed(v) {
    const key = 'reed' + v + '_' + (v >> 2); if (OC[key]) return OC[key];
    const S = S0(), rd = v & 1 ? '#3e4c30' : '#35523e';
    S.C(2, 10, 1.6, 3, 1, rd, { g: 'a' }).C(4, 10, 4.4, 1.5, 1, rd, { g: 'b' }).C(6, 10, 6.6, 4, 1, rd, { g: 'c' });
    if (v & 2) S.C(4.4, 1.2, 4.4, 3.6, 1.6, '#6a4a2a', { g: 'tip' });
    return (OC[key] = G.Art.raster(S, 8, 11, 1, { thin: true }));
  }
  function stone(moor) {
    const key = 'st' + (+moor); if (OC[key]) return OC[key];
    const S = S0(); S.E(3.5, 2.6, 2.6, 1.6, moor ? '#4a4a4e' : '#5a5a62');
    return (OC[key] = G.Art.raster(S, 7, 5, 1, { thin: true }));
  }
  function pad(flower, moor) {
    const key = 'pad' + (+flower) + (+moor); if (OC[key]) return OC[key];
    const S = S0(); S.E(4, 3, 3.4, 2.2, moor ? '#2c4a2e' : '#2f5a3a', { name: 'pad' }).P([[4, 3], [8, 1.5], [8, 4]], '#000', { clip: 'pad', flat: true, alpha: 0.001, line: false });
    if (flower) S.E(3.4, 2, 1.4, 1.1, moor ? '#e8e4f4' : '#e8b8d0', { glow: true });
    return (OC[key] = G.Art.raster(S, 9, 6, 1, { thin: true }));
  }
  // alle Objekte einer Karte in Zeilenreihenfolge (weiter unten = davor)
  function objects(g, m) {
    const th = m.theme === 'moor' ? 'moor' : 'dorf';
    for (let y = 0; y < m.h; y++) for (let x = 0; x < m.w; x++) {
      const c = m.tiles[y][x], X = x * T, Y = y * T, R = hash(x, y, 5);
      switch (c) {
        case 'T': g.drawImage(tree(th, (R < 0.28 ? 1 : 0) + (hash(x, y, 6) < 0.5 ? 2 : 0)), X, Y - 6); break;
        case 'x': g.drawImage(willow(R < 0.5 ? 1 : 0), X, Y - 8); break;
        case 'f': g.drawImage(fence(at(m, x - 1, y) === 'f', at(m, x + 1, y) === 'f'), X, Y); break;
        case 'g': g.drawImage(grave(R < 0.4 ? 1 : 0), X, Y); break;
        case 'L': case 'e': break;     // Laternen sind begehbar und werden als Figuren nach y sortiert gezeichnet (world.js)
        case 'S': g.drawImage(sign(), X, Y); break;
        case 'r': g.drawImage(rock(R < 0.5 ? 1 : 0), X, Y); break;
        case 'k': g.drawImage(stump(), X, Y); break;
        case 'B': g.drawImage(bell(), X, Y); break;
        case 'b': {
          const v = at(m, x, y - 1) === 'b' || at(m, x, y + 1) === 'b' || at(m, x, y + 1) === 'D' || at(m, x, y - 1) === 'D', h = at(m, x - 1, y) === 'b' || at(m, x + 1, y) === 'b';
          g.drawImage(plank(v && h ? 'x' : v ? 'v' : 'h'), X, Y); break;
        }
      }
    }
  }
  // ---------------- Häuser (64×60, 12 px Überstand nach oben) ----------------
  function house(h) {
    const key = 'H' + h.roof + (h.hut ? 'h' : ''); if (OC[key]) return OC[key];
    const S = S0(), roof = h.roof;
    if (!h.hut) S.R(44, 1, 8, 16, '#5a4e56', { name: 'chim' }).R(43, 0, 10, 3, '#4a4048');
    S.P([[0, 36], [7, 7], [57, 7], [64, 36]], roof, { name: 'roof' });
    for (let r = 0; r < 6; r++) {
      const y = 11 + r * 4.6; S.R(0, y, 64, 1, G.Art.H(roof).map(v => v * 0.62).reduce((a, v) => a + Math.round(v).toString(16).padStart(2, '0'), '#'), { clip: 'roof', flat: true, line: false });
      if (h.hut) continue;
      for (let x = 4 + (r % 2) * 5; x < 62; x += 10) S.R(x, y - 3.6, 1, 3.6, G.Art.H(roof).map(v => v * 0.72).reduce((a, v) => a + Math.round(v).toString(16).padStart(2, '0'), '#'), { clip: 'roof', flat: true, line: false });
    }
    if (h.hut) for (let i = 0; i < 9; i++) S.C(3 + i * 7, 8 + (i % 2), 1 + i * 7.2, 34, 0.8, '#8a7a50', { clip: 'roof', flat: true, line: false });
    const wall = h.hut ? '#4a3a2c' : '#6a4c3e', wl = h.hut ? '#3a2c20' : '#523a30';
    S.R(3, 35, 58, 24, wall, { name: 'wall' });
    for (let y = 40; y < 58; y += 5) S.R(3, y, 58, 1, wl, { clip: 'wall', flat: true, line: false });
    S.R(3, 35, 58, 2, '#2a1e22', { clip: 'wall', flat: true, line: false });
    S.R(18, 40, 12, 19, '#3a2418', { name: 'door' }).R(23.5, 41, 1, 18, '#2a1810', { clip: 'door', flat: true, line: false }).E(27, 50, 1, 1, '#e0b060', { clip: 'door', flat: true });
    S.R(19, 58, 10, 1, h.hut ? '#3a2a1a' : '#ffb050', { flat: true, line: false, noOutline: true });
    for (const wx of h.hut ? [42] : [35, 48]) {
      S.R(wx, 41, 10, 9, '#24160f', { name: 'win' + wx }).R(wx + 1, 42, 8, 7, h.hut ? '#2a3440' : '#ffc050', h.hut ? { clip: 'win' + wx } : { glow: true, clip: 'win' + wx });
      S.R(wx + 4.5, 42, 1, 7, '#4a3222', { clip: 'win' + wx, flat: true, line: false }).R(wx + 1, 45, 8, 1, '#4a3222', { clip: 'win' + wx, flat: true, line: false });
      if (!h.hut) { S.R(wx - 1, 50, 12, 2, '#4a3428'); S.E(wx + 2, 49.6, 1.2, 1, '#c8a8f0', { flat: true, line: false }).E(wx + 6, 49.4, 1.2, 1, '#f0d890', { flat: true, line: false }); }
    }
    return (OC[key] = G.Art.raster(S, 64, 60, 1));
  }
  G.Tiles = { ground, objects, house, reed, stone, pad, PAL, lantern };
})(window.G);
