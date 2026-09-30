'use strict';
// Eldenghost – Kämpfe: Wild, Geisterbeschwörer, Wächter; AP, Status, Gegenstände; Entwicklung
(function (G) {
  const UI = () => G.UI, Snd = () => G.Snd;
  const ease = p => 1 - Math.pow(1 - p, 3);
  const freshStages = () => ({ atk: 0, def: 0, acc: 0 });
  const stageMult = s => s >= 0 ? (2 + s) / 2 : 2 / (2 - s);
  const accMult = s => s >= 0 ? (3 + s) / 3 : 3 / (3 - s);
  const newAnim = () => ({ dx: 0, dy: 0, vis: 1, flash: 0, scale: 1, alpha: 1 });
  const cap = s => s.charAt(0).toUpperCase() + s.slice(1);

  // ---------- Kampfhintergründe im Comic-Pixelstil (1 Kunstpixel = 1 logischer Pixel) ----------
  // Szenen: gras (Dorf/Nebelgras), moor (Schilfrand/Torfstich), kapelle (versunkene Kapelle), boss (Nebelsee/Ahnenhügel).
  // Flache Himmelsbänder, Sterne, Mond, Silhouetten mit Mondlicht-Kante, Boden mit Perspektivstreifen, Plattformen mit Kontur.
  const BGP = {
    gras: { sky: ['#0b0a1a', '#10112a', '#161a36', '#1c2440', '#222d48'], hill: '#191c33', hillRim: '#2a3050', sil: '#111827', silRim: '#26364c',
      gr: '#1c3131', gr2: '#213a38', det: '#2c4e4b', detL: '#3c665f', top: '#2f4f48', topL: '#395c53', rim: '#3a2e2c', moon: 0.3 },
    moor: { sky: ['#090b12', '#0e131b', '#131b23', '#172329', '#1b2a2e'], hill: '#151d21', hillRim: '#26343a', sil: '#0f1519', silRim: '#24343a',
      gr: '#19251f', gr2: '#1d2b24', det: '#16242e', detL: '#2c4652', top: '#343f2e', topL: '#3e4a34', rim: '#2e2620', moon: 0.24 },
    kapelle: { sky: ['#0c0a18', '#110f23', '#17142d', '#1d1935', '#231f3b'], hill: '#17152a', hillRim: '#2a2744', sil: '#131125', silRim: '#302c4c',
      gr: '#211f2d', gr2: '#282535', det: '#2e2b3e', detL: '#3a364c', top: '#4a4660', topL: '#57526c', rim: '#2c2838', moon: 0.26 },
    boss: { sky: ['#06060c', '#090913', '#0d0f1b', '#111525', '#151b2d'], hill: '#11151d', hillRim: '#222a36', sil: '#0d1117', silRim: '#232c38',
      gr: '#0d1720', gr2: '#12202c', det: '#1a2c3a', detL: '#2a4050', top: '#3e4450', topL: '#4a5260', rim: '#262a34', moon: 0.1 }
  };
  const hsh = (x, y, s) => { let h = (x * 374761393 + y * 668265263 + s * 982451653) | 0; h = Math.imul(h ^ (h >>> 13), 1274126177); return ((h ^ (h >>> 16)) >>> 0) / 4294967296; };
  function platform(kind, rx, ry) {
    const P = BGP[kind], S = new G.Art.Shape(), W = Math.ceil(rx * 2 + 4), Hh = Math.ceil(ry * 2 + 9), cx = W / 2, cy = ry + 2;
    S.E(cx, cy + 4.5, rx, ry, P.rim, { g: 'side', flatten: 0.4 }).R(cx - rx, cy, rx * 2, 4.5, P.rim, { g: 'side' });
    S.E(cx, cy, rx, ry, P.top, { g: 'top', name: 'top', flat: true });
    S.E(cx, cy + ry * 0.12, rx * 0.84, ry * 0.7, P.topL, { clip: 'top', flat: true, line: false });
    const n = Math.round(rx / 3);
    for (let i = 0; i < n; i++) {
      const a = hsh(i, rx, 3) * 6.283, r = Math.sqrt(hsh(i, rx, 4)) * 0.8, x = cx + Math.cos(a) * rx * r, y = cy + Math.sin(a) * ry * r;
      if (kind === 'gras') S.R(x, y, 1, 1, P.detL, { clip: 'top', flat: true, line: false }).R(x - 1, y + 1, 3, 1, P.top, { clip: 'top', flat: true, line: false });
      else if (kind === 'moor' && i % 3 === 0) S.E(x, y, 3, 1, P.det, { clip: 'top', flat: true, line: false });
      else if (kind === 'kapelle' || kind === 'boss') { if (i % 2 === 0) S.C(x - 3, y, x + 2, y + 0.5, 0.7, P.rim, { clip: 'top', flat: true, line: false }); }
      else S.R(x, y, 2, 1, '#4a5634', { clip: 'top', flat: true, line: false });
    }
    // Grasbüschel am Rand (gras/moor) – ragen über die Kante
    if (kind === 'gras' || kind === 'moor') for (let i = 0; i < 9; i++) {
      const a = Math.PI * (0.05 + i * 0.1), x = cx + Math.cos(a) * rx * 0.96, y = cy + Math.sin(a) * ry * 0.96;
      S.C(x, y, x - 0.6, y - 3, 1, kind === 'gras' ? P.detL : '#4c5a3a', { g: 'tuft' + i }).C(x + 1.6, y, x + 2.4, y - 2.2, 1, kind === 'gras' ? P.detL : '#4c5a3a', { g: 'tuft' + i });
    }
    if (kind === 'boss') for (let i = 0; i < 6; i++) {           // Menhirkreis
      const a = Math.PI * (1.08 + i * 0.17), x = cx + Math.cos(a) * rx * 0.9, y = cy + Math.sin(a) * ry * 0.9;
      S.R(x - 2.5, y - 13, 5, 13, '#5a566a', { g: 'm' + i }).E(x, y - 13, 2.5, 1.6, '#5a566a', { g: 'm' + i }).R(x - 0.5, y - 10, 1, 4, '#8ff0e4', { glow: true, clip: 'm' + i });
    }
    const top = kind === 'boss' ? 14 : 0, cv = G.Art.raster(S, W, Hh + top, 1, { oy: top }); cv.top = top; return cv;
  }
  function makeBg(kind) {
    const P = BGP[kind], O = 4, W = 264, Hh = 248, HZ = O + 100, c = G.mk(W, Hh), g = c.getContext('2d'), d = G.pen(g);
    // Himmel: flache Bänder mit leicht welligen Stufenkanten
    const B0 = [0, 30, 52, 70, 86];
    for (let x = 0; x < W; x++) for (let k = 0; k < P.sky.length; k++) {
      const y0 = k ? B0[k] + Math.round(Math.sin(x * 0.045 + k * 1.7) * 2) : 0, y1 = HZ;
      d.r(x, y0, 1, y1 - y0, P.sky[k]);
    }
    for (let i = 0; i < 70; i++) { const x = hsh(i, 1, 7) * W | 0, y = hsh(i, 2, 7) * 76 | 0; d.p(x, y, hsh(i, 3, 7) < 0.3 ? '#d8d2f0' : '#5c5888'); }
    for (let i = 0; i < 6; i++) { const x = 70 + hsh(i, 4, 7) * 190 | 0, y = 6 + hsh(i, 5, 7) * 50 | 0; d.p(x, y, '#fff8ff'); for (const [a, b] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) d.p(x + a, y + b, '#8a86b8'); }
    // Mond mit flachen Lichtringen
    const mx = O + 44, my = O + 30;
    for (const [r, a] of [[26, 0.05], [19, 0.07], [14, 0.1]]) d.e(mx, my, r, r, `rgba(210,214,255,${a * P.moon / 0.3})`);
    { const S = new G.Art.Shape(); S.E(10, 10, 8.6, 8.6, '#e4e0f0', { name: 'moon', hiAt: 0.75 });
      S.E(7, 8, 2, 1.6, '#c4c0da', { clip: 'moon', flat: true, line: false }).E(13, 13, 2.4, 1.6, '#c4c0da', { clip: 'moon', flat: true, line: false }).E(12, 6, 1, 0.8, '#c4c0da', { clip: 'moon', flat: true, line: false });
      g.drawImage(G.Art.raster(S, 20, 20, 1), mx - 10, my - 10); }
    if (kind === 'boss') for (const [ox, oy, w] of [[-30, -3, 58], [-14, 2, 50], [-40, 7, 44], [-6, 11, 36]]) {   // dünne Nebelschleier vor dem Mond
      d.r(mx + ox, my + oy, w, 2, 'rgba(38,42,60,0.75)'); d.r(mx + ox + 4, my + oy - 1, w - 10, 1, 'rgba(60,64,86,0.5)'); }
    // ferne Hügel mit Mondlicht-Kante
    for (let x = 0; x < W; x++) { const h = O + 82 + Math.round(Math.sin(x * 0.028) * 6 + Math.sin(x * 0.09 + 1) * 3); d.r(x, h, 1, HZ - h, P.hill); d.p(x, h, P.hillRim); }
    // Silhouetten je Szene (Art-Formen, dunkel, oben mondhell)
    const sil = new G.Art.Shape(), SW = W, SH = 60, base = 56; // Leinwand 264×60, unten = Horizont
    if (kind === 'gras') for (let x = -6, i = 0; x < SW + 10; i++) { const r = 7 + hsh(i, 9, 7) * 7; sil.E(x, base - r * 0.7, r, r * 0.85, P.sil, { g: 'c' + (i % 2), flat: true }); sil.R(x - 1, base - 4, 2, 5, P.sil, { flat: true }); x += r * 1.3; }
    if (kind === 'moor') { for (let i = 0; i < 5; i++) { const x = 20 + i * 58 + hsh(i, 1, 9) * 20; sil.P([[x - 3, base], [x - 1, base - 18], [x - 5, base - 26], [x + 1, base - 21], [x + 5, base - 27], [x + 2, base - 17], [x + 3, base]], P.sil, { flat: true });
        sil.E(x, base - 26, 12, 5, P.sil, { flat: true }); for (let k = 0; k < 7; k++) sil.C(x - 10 + k * 3.3, base - 25, x - 10 + k * 3.3, base - 14 - (k % 3) * 3, 1.2, P.sil, { flat: true }); }
      for (let i = 0; i < 40; i++) { const x = hsh(i, 6, 9) * SW; sil.C(x, base, x + (hsh(i, 7, 9) - 0.5) * 2, base - 5 - hsh(i, 8, 9) * 7, 1, P.sil, { flat: true }); } }
    if (kind === 'kapelle') { const x = 150; sil.R(x, base - 30, 70, 30, P.sil, { name: 'wall', flat: true }).P([[x + 50, base - 30], [x + 50, base - 46], [x + 58, base - 52], [x + 66, base - 44], [x + 66, base - 30]], P.sil, { flat: true });
      sil.E(x + 18, base - 16, 6, 8, P.sky[4], { clip: 'wall', flat: true, line: false }).R(x + 12, base - 16, 12, 16, P.sky[4], { clip: 'wall', flat: true, line: false }).E(x + 40, base - 18, 4, 6, P.sky[4], { clip: 'wall', flat: true, line: false });
      sil.P([[x - 2, base - 30], [x + 8, base - 34], [x + 20, base - 31], [x + 34, base - 36], [x + 48, base - 31], [x + 70, base - 30]], P.sil, { flat: true });
      for (let i = 0; i < 7; i++) { const gx = 18 + i * 17 + hsh(i, 2, 5) * 6; sil.R(gx - 3, base - 9, 6, 9, P.sil, { g: 'g' + i, flat: true }).E(gx, base - 9, 3, 2.4, P.sil, { g: 'g' + i, flat: true }); } }
    if (kind === 'boss') { for (let i = 0; i < 7; i++) { const x = 150 + i * 13 + (i % 2) * 3, h = 12 + (i % 3) * 4; sil.R(x - 3, base - h - 6, 6, h, P.sil, { g: 'mn' + i, flat: true }).E(x, base - h - 6, 3, 2, P.sil, { g: 'mn' + i, flat: true }); }
      sil.E(180, base + 2, 60, 10, P.sil, { flat: true }); }
    // Silhouetten: Mondlicht-Kante nur oben, Kontur dunkel
    const sc = G.Art.raster(sil, SW, SH, 1, { thin: true }); g.drawImage(sc, 0, HZ - base - 1);
    // Boden: flache Grundfarbe, Perspektivstreifen (unten breiter), Details je Szene
    d.r(0, HZ, W, Hh - HZ, P.gr); d.r(0, HZ, W, 1, P.hillRim);
    for (let k = 1; k < 12; k++) { const y = HZ + Math.round(k * k * 1.1 + k * 2); if (y >= Hh) break; d.r(0, y, W, 1 + (k > 6 ? 1 : 0), P.gr2); }
    for (let i = 0; i < 90; i++) {
      const x = hsh(i, 1, 11) * W | 0, y = HZ + 4 + (hsh(i, 2, 11) ** 0.8) * (Hh - HZ - 6) | 0, sz = 1 + (y - HZ) / 50 | 0;
      if (kind === 'gras') { d.p(x, y, P.detL); d.p(x + sz + 1, y, P.detL); d.r(x - 1, y + 1, sz * 2 + 4, 1, P.det); }
      else if (kind === 'moor') { if (i % 3 === 0) { d.r(x, y, 4 + sz * 3, 1 + (sz >> 1), P.det); d.r(x + 1, y, 2 + sz, 1, P.detL); } else if (i % 3 === 1) { d.r(x, y - 1 - sz, 1, sz + 1, '#2e3e2a'); d.r(x + 2, y - 2 - sz, 1, sz + 2, '#34462e'); d.r(x + 4, y - 1 - sz, 1, sz + 1, '#2e3e2a'); d.r(x - 1, y + 1, 7, 1, P.gr2); } }
      else if (kind === 'kapelle') { if (i % 2) d.r(x, y, 6 + sz * 4, 1, P.det); else d.p(x, y, '#2e4a3a'); }
      else { d.r(x, y, 3 + sz * 3, 1, i % 4 ? P.det : P.detL); }
    }
    // Plattformen (Gegner hinten rechts, eigener Geist vorne links)
    const pe = platform(kind, 44, 9), pa = platform(kind, 54, 11);
    g.drawImage(pe, O + 186 - pe.width / 2 | 0, O + 95 - 11 - pe.top); g.drawImage(pa, O + 72 - pa.width / 2 | 0, O + 155 - 13 - pa.top);
    return c;
  }
  const BGC = {};
  const bgFor = B => { const k = B.bgKind || (B.boss ? 'boss' : 'gras'); return BGC[k] || (BGC[k] = makeBg(k)); };
  // Szene aus dem Standort der Spielfigur wählen
  function bgKindAt() {
    const m = G.map; if (!m || !G.P) return 'gras';
    const c = m.tiles[G.P.y] && m.tiles[G.P.y][G.P.x];
    if (c === 'c' || c === 'u' || c === 'B') return 'kapelle';
    if (m.theme === 'moor') return 'moor';
    return 'gras';
  }
  G.bgPreview = k => makeBg(k); G.bgKindAt = bgKindAt;

  G.Battle = {};
  G.Battle.render = (ctx, dt) => {
    const B = G.B, t = G.time; if (!B) return;
    // Schütteln bei Treffern (klingt schnell ab)
    ctx.save();
    if (B.shake > 0.2) { ctx.translate(Math.round((Math.random() - 0.5) * B.shake * 2) / 2, Math.round((Math.random() - 0.5) * B.shake * 2) / 2); B.shake *= Math.pow(0.004, dt); } else B.shake = 0;
    ctx.drawImage(bgFor(B), -4, -4);
    for (let i = 0; i < 7; i++) {
      const x = ((t * (4 + i) + i * 60) % 360) - 50, y = 80 + (i % 3) * 18, r = 50 + i * 6;
      const gr = ctx.createRadialGradient(x, y, 0, x, y, r); gr.addColorStop(0, `rgba(190,200,230,${B.boss ? 0.14 : 0.09})`); gr.addColorStop(1, 'rgba(190,200,230,0)');
      ctx.fillStyle = gr; ctx.fillRect(x - r, y - r, r * 2, r * 2);
    }
    const en = B.enemy, al = G.state.team[B.allyIdx], big = B.boss ? 1.3 : 1;
    if (B.boss) { ctx.save(); ctx.globalAlpha = 0.18 * B.ea.alpha; ctx.translate(186 + B.ea.dx, 100); ctx.scale(1, -0.5); ctx.drawImage(G.SPR.mon[en.sp].big, -42, -80, 84, 84); ctx.restore(); }
    aura(ctx, 186 + B.ea.dx, 62, G.SPECIES[en.sp].type, B.ea);
    if (en.rage > 1 && B.ea.alpha > 0.3) { // Phase 2: pulsierendes rot-violettes Glühen
      const t = performance.now() / 1000, r = 44 + Math.sin(t * 4) * 5, x = 186 + B.ea.dx, y = 64;
      const gr = ctx.createRadialGradient(x, y, 4, x, y, r); gr.addColorStop(0, 'rgba(255,60,110,0.32)'); gr.addColorStop(0.55, 'rgba(160,70,255,0.2)'); gr.addColorStop(1, 'rgba(120,40,200,0)');
      ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.fillStyle = gr; ctx.fillRect(x - r, y - r, r * 2, r * 2); ctx.restore();
    }
    drawMon(ctx, en.sp, 186, 96, B.ea, false, 0, big);
    if (al) { aura(ctx, 72 + B.aa.dx, 118, G.SPECIES[al.sp].type, B.aa); drawMon(ctx, al.sp, 72, 156, B.aa, true, 1.7, 1); }
    if (B.lantern) {
      const L = B.lantern;
      ctx.save(); ctx.translate(L.x, L.y); ctx.rotate(L.rot || 0);
      if (L.glow) { const gr = ctx.createRadialGradient(0, 0, 0, 0, 0, 24); gr.addColorStop(0, `rgba(150,230,255,${0.5 * L.glow})`); gr.addColorStop(1, 'rgba(150,230,255,0)'); ctx.fillStyle = gr; ctx.fillRect(-24, -24, 48, 48); }
      ctx.drawImage(G.SPR.lantern, -12, -14, 24, 28); ctx.restore();
    }
    if (B.dim > 0.01) { ctx.fillStyle = `rgba(10,4,24,${B.dim})`; ctx.fillRect(-8, -8, 272, 256); B.dim *= Math.pow(0.08, dt); }
    renderParts(ctx, dt);
    ctx.globalCompositeOperation = 'lighter';
    ctx.globalAlpha = 1;
    for (let i = 0; i < 14; i++) {
      const x = (i * 37 + Math.sin(t * 0.5 + i) * 20 + 256) % 256, y = 40 + ((i * 53 - t * 6) % 120 + 120) % 120, b = Math.pow(0.5 + 0.5 * Math.sin(t * 2 + i), 3);
      ctx.fillStyle = `rgba(160,240,220,${0.7 * b})`; ctx.fillRect(x | 0, y | 0, 1, 1);
    }
    ctx.globalCompositeOperation = 'source-over';
    ctx.restore();
    if (B.flash && B.flash.a > 0.01) { ctx.globalCompositeOperation = 'lighter'; ctx.globalAlpha = B.flash.a; ctx.fillStyle = B.flash.c; ctx.fillRect(0, 0, 256, 240); ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over'; B.flash.a *= Math.pow(0.002, dt); }
    ctx.drawImage(G.vignette, 0, 0);
  };
  function aura(ctx, x, y, type, a) {
    if (!a.vis || a.alpha < 0.05) return;
    const n = parseInt(G.TYPE_COLORS[type].slice(1), 16), gr = ctx.createRadialGradient(x, y, 0, x, y, 40);
    gr.addColorStop(0, `rgba(${n >> 16},${(n >> 8) & 255},${n & 255},${0.16 * a.alpha * a.scale})`); gr.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.globalCompositeOperation = 'lighter'; ctx.fillStyle = gr; ctx.fillRect(x - 40, y - 40, 80, 80); ctx.globalCompositeOperation = 'source-over';
  }
  // Idle: Atem-Frame (sanft, ca. alle 2.4 s) + Schweben nur bei fliegenden Geistern; back = Rückansicht (eigener Geist)
  // weicher Bodenschatten (Ellipse, vorgerendert)
  const SHD = (() => { const c = G.mkHi(64, 16, 4), g = c.getContext('2d'); g.translate(32, 8); g.scale(1, 0.25); const gr = g.createRadialGradient(0, 0, 0, 0, 0, 31);
    gr.addColorStop(0, 'rgba(4,2,12,0.62)'); gr.addColorStop(0.55, 'rgba(4,2,12,0.42)'); gr.addColorStop(1, 'rgba(4,2,12,0)'); g.fillStyle = gr; g.beginPath(); g.arc(0, 0, 31, 0, 6.283); g.fill(); return c; })();
  function shadowEllipse(ctx, x, y, rx, ry, a = 1) { const o = ctx.globalAlpha; ctx.globalAlpha = o * a; ctx.drawImage(SHD, x - rx, y - ry, rx * 2, ry * 2); ctx.globalAlpha = o; }
  G.shadowEllipse = shadowEllipse;
  // dunkler Halo hinter dem Gegner-Geist (hebt die Silhouette vom Hintergrund ab), vorgerendert
  const HALO = (() => { const c = G.mkHi(64, 64, 2), g = c.getContext('2d'), gr = g.createRadialGradient(32, 32, 0, 32, 32, 32);
    gr.addColorStop(0, 'rgba(6,4,16,0.34)'); gr.addColorStop(0.6, 'rgba(6,4,16,0.2)'); gr.addColorStop(1, 'rgba(6,4,16,0)'); g.fillStyle = gr; g.fillRect(0, 0, 64, 64); return c; })();
  const GLOWS = {};
  function glowSprite(col) {
    if (GLOWS[col]) return GLOWS[col];
    const c = G.mkHi(32, 32, 2), g = c.getContext('2d'), gr = g.createRadialGradient(16, 16, 0, 16, 16, 16), n = parseInt(col.slice(1), 16), rgb = `${n >> 16},${(n >> 8) & 255},${n & 255}`;
    gr.addColorStop(0, `rgba(${rgb},0.9)`); gr.addColorStop(0.3, `rgba(${rgb},0.45)`); gr.addColorStop(0.65, `rgba(${rgb},0.12)`); gr.addColorStop(1, `rgba(${rgb},0)`);
    g.fillStyle = gr; g.fillRect(0, 0, 32, 32); return (GLOWS[col] = c);
  }
  G.glowSprite = glowSprite;
  function drawMon(ctx, sp, x, y, a, back, phase, big) {
    if (!a.vis || a.alpha <= 0) return;
    const spr = G.SPR.mon[sp], fly = G.FLY[sp] || 0, t = G.time * 2.6 + phase, boss = big > 1;
    const inhale = Math.sin(t) > 0.35, bob = fly ? Math.round(Math.sin(t * 0.9) * 2.5 * fly) : 0;
    // Pixelgrafik 1:1 (Vorderansicht 64, Boss 84, Rückansicht 80 Pixel, unten angeschnitten)
    // Blinzeln: alle ~3–4.5 s für 0.14 s (nicht in der Rückansicht)
    const bl = !back && ((G.time + phase * 1.3) % (3 + (phase % 3) * 0.7)) < 0.14;
    const img = a.flash ? (back ? spr.whiteBack : boss ? spr.whiteBig : spr.white) : back ? (inhale ? spr.back2 : spr.back) : boss ? (bl ? spr.bigBlink : inhale ? spr.big2 : spr.big) : (bl ? spr.imgBlink : inhale ? spr.img2 : spr.img);
    const N = img.lw || img.width, w = N * a.scale, gy = back ? N + 2 : N * 62 / 64;
    ctx.save(); ctx.globalAlpha = Math.max(0, Math.min(1, a.alpha));
    if (!back && !a.flash) { const r = N * 0.62 * a.scale; ctx.drawImage(HALO, Math.round(x + a.dx - r), Math.round(y + a.dy - N * 0.46 * a.scale - r), Math.round(r * 2), Math.round(r * 2)); }
    if (!fly && a.alpha > 0.5 && !back) shadowEllipse(ctx, x + a.dx, y + a.dy - 1, 24 * a.scale * (boss ? 1.3 : 1), 4.5 * a.scale);
    else if (fly && a.alpha > 0.5) shadowEllipse(ctx, x + a.dx, y + a.dy + 2, 14 * a.scale, 3 * a.scale, 0.22);
    ctx.translate(Math.round(x + a.dx), Math.round(y + a.dy + bob * a.scale * 2));
    ctx.drawImage(img, Math.round(-w / 2), Math.round(-gy * a.scale), Math.round(w), Math.round(w));
    // flackerndes Eigenlicht der Leuchtflächen (Flammen, Laternen, Glimmflecken)
    const gl = (back ? spr.back : boss ? spr.big : spr.img).glows;
    if (gl && !a.flash && a.alpha > 0.3 && !G.lowFx) {
      ctx.globalCompositeOperation = 'lighter'; const sc = w / N;
      for (let i = 0; i < gl.length; i++) {
        const [gx, gy2, r, col] = gl[i], f = 0.55 + 0.25 * Math.sin(G.time * 9 + i * 2.1 + phase) + 0.2 * Math.sin(G.time * 23 + i * 5);
        const R = Math.max(4, r * 1.6) * sc; ctx.globalAlpha = Math.max(0, Math.min(1, a.alpha)) * 0.5 * f;
        ctx.drawImage(glowSprite(col), Math.round(-w / 2 + gx * sc - R), Math.round(-gy * a.scale + gy2 * sc - R), R * 2, R * 2);
      }
      ctx.globalCompositeOperation = 'source-over';
    }
    ctx.restore();
    // treibende Seelenfunken und Nebelfetzen rund um den Geist (Idle)
    if (G.B && !G.lowFx && a.alpha > 0.8 && !a.flash && Math.random() < 0.05) {
      const col = G.TYPE_COLORS[G.SPECIES[sp].type] || '#c8bede', rr = N * 0.32 * a.scale;
      if (G.hasType(sp, 'Psycho') && Math.random() < 0.5) P_({ x: x + a.dx + rnd(-rr, rr), y: y + a.dy - rnd(4, 14), vx: rnd(-6, 6), vy: rnd(-8, -3), k: 'fog', r: rnd(4, 7), dr: 6, life: rnd(1.2, 1.8), c: '#dce4f2', a: 0.16 });
      else P_({ x: x + a.dx + rnd(-rr, rr), y: y + a.dy - rnd(4, N * 0.7 * a.scale), vx: rnd(-4, 4), vy: rnd(-14, -6), k: 'mote', life: rnd(0.9, 1.5), c: col, idle: 1 });
    }
  }
  // ---------- Kampfeffekte je Typ ----------
  // Partikelarten: spark (Funke, additiv), glow (weiches Leuchten), fog (Nebelballen), shade (Schattenschwade, spiralt ein),
  // drop (Moorspritzer, klatscht auf), chunk (Steinbrocken, prallt ab), leaf (Moosblatt, taumelt), ring (Druckwelle), mote (Seelenfunke, steigt)
  // s = Effektstil; die 8 Typen nutzen eigene Farben, Feuer/Boden/Psycho/Gift bauen auf den bewährten Stilen auf
  const TYPE_FX = {
    Feuer: { s: 'Irrlicht', c: '#ff9a48', c2: '#fff0b8' }, Wasser: { s: 'Wasser', c: '#58b0f8', c2: '#dcf2ff' }, Elektro: { s: 'Elektro', c: '#ffe058', c2: '#fffbe4' },
    Stein: { s: 'Stein', c: '#9a8a78', c2: '#d8c8b0' }, Psycho: { s: 'Nebel', c: '#f4a4dc', c2: '#ffe4f6' }, Boden: { s: 'Moor', c: '#a0743e', c2: '#cfa466' },
    Gift: { s: 'Schatten', c: '#b474e8', c2: '#26103a' }, Kampf: { s: 'Kampf', c: '#ff7a52', c2: '#fff4e8' },
    // Pflanze: wirbelnde Blätter, Blütenblätter und ein grüner Schimmer
    Pflanze: { s: 'Pflanze', c: '#6cc45a', c2: '#e8ffd0' },
    // typenlose Attacken: schlichter Treffer (kurzer Stoss, helle Funken, dezenter Ring)
    Neutral: { s: 'Neutral', c: '#d8d0e4', c2: '#ffffff' },
    // Stile für Heilung, Fang und Zustände
    Seele: { s: 'Seele', c: '#c8bede', c2: '#fff4ff' }, Irrlicht: { s: 'Irrlicht', c: '#8ff0e4', c2: '#e8fff8' }, Nebel: { s: 'Nebel', c: '#dce4f2', c2: '#aab4d0' },
    Moor: { s: 'Moor', c: '#7a8a3a', c2: '#a4c46a' }
  };
  const glowCache = {};
  function glowSpr(col) {
    if (glowCache[col]) return glowCache[col];
    const c = G.mkHi(32, 32), g = c.getContext('2d'), gr = g.createRadialGradient(16, 16, 0, 16, 16, 16), n = parseInt(col.slice(1), 16), rgb = `${n >> 16},${(n >> 8) & 255},${n & 255}`;
    gr.addColorStop(0, `rgba(${rgb},1)`); gr.addColorStop(0.35, `rgba(${rgb},0.55)`); gr.addColorStop(1, `rgba(${rgb},0)`);
    g.fillStyle = gr; g.fillRect(0, 0, 32, 32); return (glowCache[col] = c);
  }
  const P_ = o => G.B && G.B.parts.length < 160 && G.B.parts.push(Object.assign({ vx: 0, vy: 0, g: 0, s: 1, life: 0.6, k: 'spark' }, o, { max: o.life || 0.6 }));
  const rnd = (a, b) => a + Math.random() * (b - a);
  // Einschlag am Ziel (auch für Statusattacken, dann schwächer)
  function burst(x, y, type, n = 22) {
    const f = TYPE_FX[type] || TYPE_FX.Seele, soft = n < 20, st = f.s;
    switch (st) {
      case 'Wasser':
        for (let i = 0; i < n + 6; i++) { const a = rnd(3.5, 5.9), v = rnd(50, 140); P_({ x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v, g: 300, floor: y + rnd(12, 26), life: rnd(0.5, 0.9), c: Math.random() < 0.5 ? f.c : f.c2, s: Math.random() < 0.4 ? 2.5 : 1.5, k: 'drop' }); }
        P_({ x, y: y + 10, k: 'ring', r: 5, dr: 80, life: 0.45, c: f.c2, flat: 1 }); P_({ x, y: y + 10, k: 'ring', r: 2, dr: 50, life: 0.55, c: f.c, flat: 1 }); P_({ x, y, k: 'glow', r: 12, dr: 40, life: 0.35, c: f.c }); break;
      case 'Elektro':
        for (let i = 0; i < n + 14; i++) { const a = rnd(0, 6.28), v = rnd(60, 190); P_({ x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v, life: rnd(0.2, 0.5), c: Math.random() < 0.5 ? f.c2 : f.c, s: Math.random() < 0.3 ? 2.5 : 1.5, k: 'spark' }); }
        { let bx = x + rnd(-6, 6), by = y - 70; while (by < y) { const nx = bx + rnd(-7, 7), ny = by + rnd(6, 10); for (let j = 0; j < 3; j++) P_({ x: bx + (nx - bx) * j / 3, y: by + (ny - by) * j / 3, life: 0.22, c: j % 2 ? f.c : '#ffffff', s: 2, k: 'spark' }); bx = nx; by = ny; } }
        P_({ x, y, k: 'glow', r: 18, dr: 60, life: 0.3, c: f.c }); P_({ x, y, k: 'ring', r: 4, dr: 120, life: 0.3, c: f.c2 }); break;
      case 'Kampf':
        for (let i = 0; i < 10; i++) { const a = i / 10 * 6.28 + rnd(-0.1, 0.1), v = rnd(120, 170); P_({ x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v, life: 0.28, c: i % 2 ? f.c : f.c2, s: 2.5, k: 'spark' }); }
        P_({ x, y, k: 'ring', r: 4, dr: 140, life: 0.3, c: f.c2 }); P_({ x, y, k: 'ring', r: 2, dr: 90, life: 0.4, c: f.c }); P_({ x, y, k: 'glow', r: 14, dr: 50, life: 0.25, c: f.c2 }); break;
      case 'Pflanze':
        for (let i = 0; i < n; i++) { const a = i / n * 6.28, v = rnd(40, 110); P_({ x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v - 20, g: 40, ph: rnd(0, 6), life: rnd(0.7, 1.2), c: i % 3 ? f.c : '#3e8a3a', k: 'leaf' }); }
        for (let i = 0; i < 8; i++) P_({ x: x + rnd(-10, 10), y: y + rnd(-10, 6), vx: rnd(-30, 30), vy: rnd(-50, -20), g: 30, life: rnd(0.6, 1), c: i % 2 ? '#ffc8e8' : f.c2, s: 2, k: 'spark' });
        P_({ x, y, k: 'glow', r: 14, dr: 40, life: 0.4, c: f.c }); P_({ x, y, k: 'ring', r: 4, dr: 90, life: 0.4, c: f.c2 }); break;
      case 'Neutral':
        for (let i = 0; i < 7; i++) { const a = i / 7 * 6.28 + rnd(-0.2, 0.2), v = rnd(70, 110); P_({ x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v, life: 0.22, c: i % 2 ? f.c : f.c2, s: 2, k: 'spark' }); }
        P_({ x, y, k: 'ring', r: 3, dr: 90, life: 0.25, c: f.c2 }); P_({ x, y, k: 'glow', r: 10, dr: 30, life: 0.2, c: f.c }); break;
      case 'Irrlicht':
        for (let i = 0; i < n + 12; i++) { const a = rnd(0, 6.28), v = rnd(30, 130); P_({ x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v - 20, g: 30, life: rnd(0.5, 1.1), c: Math.random() < 0.4 ? f.c2 : f.c, s: Math.random() < 0.4 ? 2.5 : 1.5, k: 'spark' }); }
        for (let i = 0; i < 5; i++) P_({ x: x + rnd(-12, 12), y: y + rnd(-12, 12), vy: rnd(-30, -10), k: 'glow', r: rnd(4, 7), dr: -3, life: rnd(0.6, 1), c: f.c });
        P_({ x, y, k: 'glow', r: 16, dr: 70, life: 0.45, c: f.c }); P_({ x, y, k: 'ring', r: 4, dr: 100, life: 0.45, c: f.c2 }); break;
      case 'Moor':
        for (let i = 0; i < n; i++) { const a = rnd(3.4, 6.0), v = rnd(40, 110); P_({ x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v, g: 260, floor: y + rnd(12, 26), life: rnd(0.6, 1.1), c: Math.random() < 0.5 ? f.c : '#4a3e24', s: Math.random() < 0.4 ? 2 : 1.5, k: 'drop' }); }
        for (let i = 0; i < n / 2; i++) P_({ x: x + rnd(-14, 14), y: y + rnd(-10, 4), vx: rnd(-20, 20), vy: rnd(-40, -10), g: 25, ph: rnd(0, 6), life: rnd(0.8, 1.4), c: Math.random() < 0.5 ? f.c2 : '#5a7a3a', k: 'leaf' }); break;
      case 'Stein':
        for (let i = 0; i < n; i++) { const a = rnd(3.6, 5.8), v = rnd(40, 120); P_({ x: x + rnd(-6, 6), y, vx: Math.cos(a) * v, vy: Math.sin(a) * v, g: 380, floor: y + rnd(14, 24), bounce: 1, life: rnd(0.6, 1), c: Math.random() < 0.5 ? f.c : '#6a5e52', s: rnd(1.5, 3), k: 'chunk' }); }
        for (let i = 0; i < 5; i++) P_({ x: x + rnd(-16, 16), y: y + rnd(4, 14), vx: rnd(-12, 12), vy: rnd(-8, -2), k: 'fog', r: rnd(6, 10), dr: 14, life: rnd(0.6, 0.9), c: '#8a7e70', a: 0.35 });
        P_({ x, y: y + 8, k: 'ring', r: 6, dr: 70, life: 0.3, c: f.c2, flat: 1 }); break;
      case 'Schatten':
        for (let i = 0; i < n; i++) { const a = rnd(0, 6.28), v = rnd(20, 70); P_({ x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v, life: rnd(0.5, 1), c: Math.random() < 0.5 ? f.c : '#d8b8ff', s: rnd(1.5, 2.5), k: 'spark' }); }
        for (let i = 0; i < 9; i++) P_({ x: x + rnd(-10, 10), y: y + rnd(-10, 10), vx: rnd(-18, 18), vy: rnd(-18, 6), k: 'shade', r: rnd(12, 18), dr: 12, life: rnd(0.6, 1), c: f.c2, a: 0.85 });
        P_({ x, y, k: 'glow', r: 10, dr: 40, life: 0.4, c: f.c }); P_({ x, y, k: 'ring', r: 30, dr: -60, life: 0.4, c: f.c }); break;
      case 'Nebel':
        for (let i = 0; i < Math.max(6, n / 2); i++) P_({ x: x + rnd(-10, 10), y: y + rnd(-8, 8), vx: rnd(-30, 30), vy: rnd(-10, 6), k: 'fog', r: rnd(6, 12), dr: 26, life: rnd(0.7, 1.2), c: Math.random() < 0.5 ? f.c : f.c2, a: 0.5 });
        for (let i = 0; i < 8; i++) { const a = rnd(0, 6.28); P_({ x, y, vx: Math.cos(a) * 50, vy: Math.sin(a) * 30, life: 0.5, c: '#ffffff', k: 'spark' }); } break;
      default: // Seele
        for (let i = 0; i < n; i++) P_({ x: x + rnd(-18, 18), y: y + rnd(-6, 16), vx: rnd(-6, 6), vy: rnd(-45, -20), k: 'mote', life: rnd(0.7, 1.3), c: Math.random() < 0.4 ? f.c2 : f.c });
        P_({ x, y, k: 'ring', r: 4, dr: 70, life: 0.45, c: f.c2 }); P_({ x, y, k: 'glow', r: 12, dr: 30, life: 0.5, c: f.c });
    }
    if (!soft && G.B) G.B.shake = Math.max(G.B.shake || 0, st === 'Stein' || st === 'Kampf' ? 4.5 : st === 'Neutral' ? 3 : st === 'Nebel' ? 1.5 : 2.5);
  }
  // Anflug vom Angreifer zum Ziel (ca. 0.4 s), danach Einschlag
  async function travel(type, from, to) {
    const [x0, y0] = center(from), [x1, y1] = center(to), f = TYPE_FX[type] || TYPE_FX.Seele, B = G.B, st = f.s;
    if (st === 'Schatten') B.dim = 0.45;
    if (st === 'Elektro') B.dim = 0.3;
    if (st === 'Neutral') { await G.animate(160, p => { if (Math.random() < 0.5) P_({ x: x0 + (x1 - x0) * p, y: y0 + (y1 - y0) * p, life: 0.12, c: f.c, s: 1.5, k: 'spark' }); }); return; }
    if (st === 'Kampf') { await G.animate(200, p => { P_({ x: x0 + (x1 - x0) * p + rnd(-3, 3), y: y0 + (y1 - y0) * p + rnd(-3, 3), life: 0.18, c: f.c2, s: 2, k: 'spark' }); }); return; }
    if (st === 'Stein') { for (let i = 0; i < 4; i++) P_({ x: x1 + rnd(-14, 14), y: y1 - 70 - i * 14, vy: 60, g: 520, floor: y1 + rnd(-4, 6), life: 0.55 + i * 0.05, c: i % 2 ? f.c : '#7a6e60', s: rnd(3, 5), k: 'chunk' }); await G.wait(360); return; }
    let last = 0;
    await G.animate(st === 'Nebel' ? 460 : st === 'Elektro' ? 260 : 380, p => {
      const e = p < 0.5 ? 2 * p * p : 1 - Math.pow(-2 * p + 2, 2) / 2, x = x0 + (x1 - x0) * e, y = y0 + (y1 - y0) * e;
      const steps = Math.floor(p * 14); if (steps === last) return; last = steps;
      if (st === 'Wasser') { P_({ x, y, k: 'drop', life: 0.2, c: f.c, s: 3 }); P_({ x: x + rnd(-3, 3), y: y + rnd(-3, 3), vx: rnd(-8, 8), vy: rnd(-8, 8), life: 0.3, c: f.c2, k: 'spark' }); }
      else if (st === 'Elektro') { const zy = y + (steps % 2 ? -7 : 7); P_({ x, y: zy, k: 'glow', r: 6, dr: -4, life: 0.2, c: f.c }); for (let i = 0; i < 2; i++) P_({ x: x + rnd(-4, 4), y: zy + rnd(-4, 4), vx: rnd(-40, 40), vy: rnd(-40, 40), life: 0.2, c: i ? '#ffffff' : f.c, k: 'spark' }); }
      else if (st === 'Irrlicht') { const wy = y + Math.sin(p * 12) * 8; P_({ x, y: wy, k: 'glow', r: 9, dr: -6, life: 0.3, c: f.c }); P_({ x: x + rnd(-2, 2), y: wy + rnd(-2, 2), vx: rnd(-10, 10), vy: rnd(-10, 10), life: 0.4, c: f.c2, k: 'spark' }); }
      else if (st === 'Moor') { const ay = y - Math.sin(p * Math.PI) * 26; P_({ x, y: ay, k: 'drop', life: 0.18, c: f.c, s: 3 }); if (steps % 3 === 0) P_({ x, y: ay, vx: rnd(-10, 10), vy: 10, g: 20, ph: rnd(0, 6), life: 0.6, c: f.c2, k: 'leaf' }); }
      else if (st === 'Schatten') { for (let i = 0; i < 2; i++) { const a = rnd(0, 6.28), r = 46 * (1 - p) + 6; P_({ x: x1 + Math.cos(a) * r, y: y1 + Math.sin(a) * r * 0.7, vx: -Math.cos(a) * 40, vy: -Math.sin(a) * 28, k: 'shade', r: 6, dr: -4, life: 0.35, c: f.c2, a: 0.55 }); } }
      else if (st === 'Pflanze') { for (let i = 0; i < 2; i++) { const a = p * 18 + i * 3.14; P_({ x: x + Math.cos(a) * 7, y: y + Math.sin(a) * 7, vx: rnd(-8, 8), vy: rnd(-8, 8), ph: rnd(0, 6), life: 0.35, c: i ? f.c : '#3e8a3a', k: 'leaf' }); } }
      else if (st === 'Nebel') P_({ x: x + rnd(-6, 6), y: y + rnd(-6, 6), vx: (x1 - x0) * 0.4, vy: (y1 - y0) * 0.4, k: 'fog', r: 8, dr: 12, life: 0.6, c: steps % 2 ? f.c : f.c2, a: 0.45 });
      else { P_({ x: x0 + rnd(-14, 14), y: y0 + rnd(0, 14), vy: -40, k: 'mote', life: 0.8, c: f.c2 }); if (p > 0.6) P_({ x: x1 + rnd(-10, 10), y: y1 + rnd(-10, 10), vy: -20, k: 'mote', life: 0.6, c: f.c }); }
    });
  }
  // ---------- Eigene Animation je Attacke (Kevin: passend zum Namen, max. 3 s, meist 0.6–1.6 s) ----------
  // Jede Attacke hat einen eigenen Eintrag { ms, fn(from, to) }: fn spielt die Choreografie bis zum Einschlag; danach folgen
  // Einschlag-Partikel, Klang und Wirksamkeits-Pop-up wie gewohnt. ms = geplante Dauer (Test: tatsächliche Dauer <= ms <= 3000)
  const Lp = (a, b, p) => a + (b - a) * p, W = ms => G.wait(ms), An = (ms, f) => G.animate(ms, f);
  const streak = (x, y, a, l, c, o = {}) => P_(Object.assign({ x, y, a, l, w: 2, c, life: 0.28, k: 'streak' }, o));
  const ringAt = (x, y, r, dr, c, life = 0.4, o = {}) => P_(Object.assign({ x, y, k: 'ring', r, dr, life, c }, o));
  const glowAt = (x, y, r, dr, c, life = 0.35) => P_({ x, y, k: 'glow', r, dr, life, c });
  const sparks = (x, y, n, c, v = 80, o = {}) => { for (let i = 0; i < n; i++) { const a = rnd(0, 6.28), s = rnd(v * 0.4, v); P_(Object.assign({ x, y, vx: Math.cos(a) * s, vy: Math.sin(a) * s, life: rnd(0.2, 0.45), c, s: 1.5, k: 'spark' }, o)); } };
  // Geschoss von A nach B mit Spur-Funktion (p, x, y, Schritt)
  const fly = (from, to, ms, trail, arc = 0, wob = 0) => { const [x0, y0] = center(from), [x1, y1] = center(to); let last = -1;
    return An(ms, p => { const e = p < 0.5 ? 2 * p * p : 1 - Math.pow(-2 * p + 2, 2) / 2, x = Lp(x0, x1, e), y = Lp(y0, y1, e) - Math.sin(p * Math.PI) * arc + Math.sin(p * 14) * wob;
      const st = Math.floor(p * 18); if (st !== last) { last = st; trail(p, x, y, st); } }); };
  const selfA = side => side === 'ally' ? G.B.aa : G.B.ea;
  const MOVE_FX = {
    // --- v15: neue Attacken (eigene Choreografie, ≤ 3 s) ---
    hakenschlag: { ms: 900, fn: async (f, t) => { const a = selfA(f), d = f === 'ally' ? 1 : -1; await An(480, p => { a.dx = Math.sin(p * Math.PI) * 36 * d; a.dy = Math.sin(p * Math.PI * 3) * 10; }); a.dx = a.dy = 0; const [x, y] = center(t); streak(x - 8, y - 4, 0.6, 24, '#ffffff', { w: 2.4 }); streak(x + 8, y + 4, -0.6, 24, '#e8e4f4', { w: 2.4 }); await W(200); } },
    echoruf: { ms: 1100, fn: async (f, t) => { const [x0, y0] = center(f), [x1, y1] = center(t); for (let i = 0; i < 3; i++) { ringAt(x0, y0 - 4, 4, 110, '#d8d0f0', 0.5); await W(120); } await W(160); for (let i = 0; i < 3; i++) { ringAt(x1, y1, 30, -40, '#e8e0ff', 0.45); await W(110); } } },
    schnurrfunken: { ms: 1000, fn: async (f, t) => { const [x0, y0] = center(f); await An(400, p => { if (Math.random() < 0.8) P_({ x: x0 + rnd(-10, 10), y: y0 + rnd(-8, 8), k: 'spark', s: 1.5, life: 0.2, c: '#fff4a0' }); }); await fly(f, t, 380, (p, x, y) => { sparks(x, y, 3, '#ffe060', 60); }); G.B.flash = { c: '#fff8a0', a: 0.3 }; } },
    speerblitz: { ms: 900, fn: async (f, t) => { const [x0, y0] = center(f), [x1, y1] = center(t); const a = Math.atan2(y1 - y0, x1 - x0); await An(260, p => glowAt(x0, y0, 4 + p * 8, 0, '#fff4a0', 0.08)); await An(220, p => { const x = Lp(x0, x1, p), y = Lp(y0, y1, p); streak(x, y, a, 26, '#fff8c0', { w: 3, life: 0.15 }); }); G.B.flash = { c: '#fff8c0', a: 0.5 }; await W(150); } },
    moosstacheln: { ms: 1100, fn: async (f, t) => { const [x0, y0] = center(f), [x1, y1] = center(t); for (let i = 0; i < 6; i++) { const oy = rnd(-10, 10); (async () => { await An(360, p => { const x = Lp(x0, x1, p), y = Lp(y0 + oy, y1 + oy * 0.5, p); P_({ x, y, k: 'spark', s: 2, life: 0.1, c: i % 2 ? '#6aa64e' : '#8ac860' }); }); })(); await W(80); } await W(420); sparks(x1, y1, 10, '#6aa64e', 70); } },
    scherenzwick: { ms: 800, fn: async (f, t) => { const [x, y] = center(t); await An(360, p => { const g = 20 * (1 - p); streak(x - g, y - 6, 0.5, 14, '#f0a080', { w: 3, life: 0.06 }); streak(x + g, y + 6, 0.5 + Math.PI, 14, '#f0a080', { w: 3, life: 0.06 }); }); ringAt(x, y, 3, 90, '#e8f6ff', 0.3); sparks(x, y, 8, '#e8f6ff', 90); await W(150); } },
    glutschweif: { ms: 1100, fn: async (f, t) => { const [x1, y1] = center(t); await An(700, p => { const a = -2.4 + p * 3.2, x = x1 + Math.cos(a) * 28, y = y1 + Math.sin(a) * 18; for (let i = 0; i < 2; i++) P_({ x: x + rnd(-3, 3), y: y + rnd(-3, 3), k: 'glow', r: rnd(3, 6), dr: 4, life: 0.35, c: i ? '#ffb040' : '#ffe080' }); }); G.B.flash = { c: '#ff9040', a: 0.3 }; await W(150); } },
    tropfstein: { ms: 1200, fn: async (f, t) => { const [x1, y1] = center(t); for (let i = 0; i < 5; i++) { const x = x1 + rnd(-24, 24); P_({ x, y: y1 - 70, vy: 260, g: 200, k: 'drop', s: 3, life: 0.35, c: '#b8b0c8', floor: y1 + 10 }); await W(110); } await W(350); G.B.shake = 4; sparks(x1, y1 + 8, 10, '#9a94a8', 60); } },
    kristallglanz: { ms: 1300, fn: async (f, t) => { const [x0, y0] = center(f), [x1, y1] = center(t); for (let i = 0; i < 6; i++) { const a = i / 6 * 6.28; streak(x0 + Math.cos(a) * 16, y0 + Math.sin(a) * 16, a, 10, '#d8b8ff', { life: 0.4 }); } await W(350); await fly(f, t, 420, (p, x, y) => glowAt(x, y, 6, 0, '#c8a0ff', 0.2)); for (let i = 0; i < 4; i++) streak(x1, y1, i * 1.57 + 0.78, 20, '#f0e0ff', { w: 2.5, life: 0.3 }); G.B.flash = { c: '#e0c8ff', a: 0.4 }; await W(200); } },
    nattergift: { ms: 1000, fn: async (f, t) => { const a = selfA(f), d = f === 'ally' ? 1 : -1; await An(260, p => { a.dx = Math.sin(p * Math.PI) * 30 * d; }); a.dx = 0; const [x, y] = center(t); for (let i = 0; i < 2; i++) P_({ x: x - 4 + i * 8, y: y - 6, k: 'tooth', s: 4, up: 0, life: 0.2, c: '#ffffff' }); await W(200); for (let i = 0; i < 8; i++) P_({ x: x + rnd(-10, 10), y, vx: rnd(-20, 20), vy: rnd(-60, -20), g: 120, k: 'drop', s: 2, life: 0.6, c: '#b060ff' }); await W(350); } },
    wuehlstoss: { ms: 1300, fn: async (f, t) => { const a = selfA(f), [x1, y1] = center(t); await An(300, p => { a.dy = p * 20; a.alpha = 1 - p; }); await An(450, p => { if (Math.random() < 0.7) P_({ x: Lp(center(f)[0], x1, p), y: y1 + 22, vy: -40, g: 150, k: 'spark', s: 2.5, life: 0.4, c: '#8a6a44' }); }); G.B.shake = 5; sparks(x1, y1 + 10, 14, '#a8804a', 110, { g: 200 }); await An(250, p => { a.dy = 20 * (1 - p); a.alpha = p; }); a.dy = 0; a.alpha = 1; } },
    keileransturm: { ms: 1100, fn: async (f, t) => { const a = selfA(f), d = f === 'ally' ? 1 : -1; await An(250, p => { a.dx = -8 * d * p; }); await An(300, p => { a.dx = Lp(-8, 60, p) * d; if (Math.random() < 0.7) P_({ x: center(f)[0] + a.dx, y: center(f)[1] + 22, vy: -30, k: 'spark', s: 2.5, life: 0.4, c: '#8a6a44' }); }); G.B.shake = 6; const [x, y] = center(t); ringAt(x, y, 4, 150, '#ffd0a0', 0.3); await An(250, p => { a.dx = 60 * (1 - p) * d; }); a.dx = 0; } },
    mondsprung: { ms: 1300, fn: async (f, t) => { const a = selfA(f), [x1, y1] = center(t); G.B.dim = 0.35; await An(420, p => { a.dy = -Math.sin(p * Math.PI / 2) * 60; }); glowAt(x1, y1 - 50, 14, 10, '#e8f0ff', 0.6); await W(150); await An(260, p => { a.dy = -60 * (1 - p); }); a.dy = 0; ringAt(x1, y1, 5, 110, '#c8d8ff', 0.4); G.B.flash = { c: '#e8f0ff', a: 0.35 }; await W(200); } },
    sternenfall: { ms: 1600, fn: async (f, t) => { const [x1, y1] = center(t); G.B.dim = 0.5; for (let i = 0; i < 7; i++) { const x = x1 + rnd(-40, 40); (async () => { await An(300, p => { streak(x + 30 * (1 - p), y1 - 70 + p * 70, 2.2, 10, '#fff8c0', { life: 0.1 }); }); sparks(x, y1, 4, '#fff4b0', 60); })(); await W(120); } await W(500); G.B.flash = { c: '#fff8d0', a: 0.45 }; } },
    walgesang: { ms: 1800, fn: async (f, t) => { const [x0, y0] = center(f), [x1, y1] = center(t); for (let i = 0; i < 4; i++) { ringAt(x0, y0, 6, 70, '#9ad0ff', 0.9, { flat: 1 }); await W(200); } await An(600, p => { if (Math.random() < 0.5) P_({ x: Lp(x0, x1, p), y: Lp(y0, y1, p) + Math.sin(p * 12) * 10, k: 'glow', r: 5, dr: 2, life: 0.5, c: '#a8e0ff' }); }); ringAt(x1, y1, 30, -30, '#c8f0ff', 0.4); await W(150); } },
    tiefenflut: { ms: 1600, fn: async (f, t) => { const [x1, y1] = center(t); G.B.dim = 0.4; await An(1000, p => { const h = Math.sin(p * Math.PI) * 60; for (let i = 0; i < 4; i++) P_({ x: x1 + rnd(-40, 40), y: y1 + 30 - h * rnd(0.6, 1), vy: rnd(-20, 20), g: 120, k: 'drop', s: 3, life: 0.3, c: i % 2 ? '#2e6a9a' : '#6ab0e8' }); }); G.B.shake = 5; await W(150); } },
    funkenregen: { ms: 1300, fn: async (f, t) => { const [x1, y1] = center(t); await An(900, p => { for (let i = 0; i < 3; i++) P_({ x: x1 + rnd(-34, 34), y: y1 - 60, vy: rnd(120, 180), vx: rnd(-10, 10), k: 'spark', s: 2, life: 0.45, c: Math.random() < 0.5 ? '#ffe070' : '#ff9a40' }); }); G.B.flash = { c: '#ffc060', a: 0.25 }; await W(150); } },
    phoenixflamme: { ms: 2000, fn: async (f, t) => { const [x0, y0] = center(f); G.B.dim = 0.4; await An(600, p => { for (let i = 0; i < 2; i++) { const a = rnd(0, 6.28), r = 30 * (1 - p); P_({ x: x0 + Math.cos(a) * r, y: y0 + Math.sin(a) * r, k: 'glow', r: 4, dr: 2, life: 0.3, c: '#c080ff' }); } }); await fly(f, t, 600, (p, x, y) => { for (let i = -1; i <= 1; i++) P_({ x: x + i * 10 * p, y: y + Math.abs(i) * 6, k: 'glow', r: 6, dr: 6, life: 0.4, c: i ? '#b070ff' : '#ffb040' }); }, 30); G.B.flash = { c: '#ffb070', a: 0.55 }; await W(300); } },
    wiedergeburt: { ms: 1600, fn: async (f, t) => { const [x0, y0] = center(f); await An(1100, p => { if (Math.random() < 0.8) P_({ x: x0 + rnd(-18, 18), y: y0 + 24, vy: rnd(-70, -40), k: 'glow', r: rnd(3, 5), dr: -2, life: 0.8, c: Math.random() < 0.5 ? '#ffd070' : '#c090ff' }); }); ringAt(x0, y0, 5, 80, '#ffe8b0', 0.5); G.B.flash = { c: '#fff0c0', a: 0.3 }; } },
    hainruf: { ms: 1500, fn: async (f, t) => { const [x1, y1] = center(t); for (let i = 0; i < 5; i++) { const x = x1 + rnd(-30, 30); (async () => { await An(400, p => { P_({ x, y: y1 + 24 - p * 34, k: 'leaf', ph: rnd(0, 6), s: 2, life: 0.15, c: '#6aa64e' }); }); })(); await W(140); } await W(500); sparks(x1, y1, 12, '#8ac860', 80); } },
    kronenlicht: { ms: 1800, fn: async (f, t) => { const [x0, y0] = center(f), [x1, y1] = center(t); await An(500, p => { for (let i = 0; i < 2; i++) { const a = rnd(3.4, 6.0); P_({ x: x0 + Math.cos(a) * 30, y: y0 - 20 + Math.sin(a) * 14, k: 'glow', r: 3, dr: 1, life: 0.4, c: '#e8ffa0' }); } }); for (let i = 0; i < 5; i++) { streak(x1 + (i - 2) * 10, y1 - 30, Math.PI / 2, 40, '#f0ffc0', { w: 3, life: 0.4 }); await W(80); } G.B.flash = { c: '#f4ffd0', a: 0.5 }; await W(350); } },
    augenstarren: { ms: 1200, fn: async (f, t) => { const [x0, y0] = center(f), [x1, y1] = center(t); glowAt(x0 - 4, y0 - 10, 3, 6, '#c080ff', 0.5); glowAt(x0 + 4, y0 - 10, 3, 6, '#c080ff', 0.5); await W(300); await An(500, p => { const a = p * 12; P_({ x: x1 + Math.cos(a) * 20 * (1 - p), y: y1 + Math.sin(a) * 12 * (1 - p), k: 'spark', s: 2, life: 0.3, c: '#d8a8ff' }); }); ringAt(x1, y1, 24, -30, '#c080ff', 0.4); await W(150); } },
    rauchgriff: { ms: 1100, fn: async (f, t) => { const [x0, y0] = center(f), [x1, y1] = center(t); await An(600, p => { for (let i = 0; i < 2; i++) P_({ x: x0 + (x1 - x0) * p + rnd(-8, 8), y: y0 + (y1 - y0) * p + rnd(-8, 8), k: 'glow', r: rnd(4, 8), dr: 3, life: 0.5, c: i ? '#2a1a3a' : '#5a2a6a' }); }); for (let i = 0; i < 3; i++) streak(x1 - 8 + i * 8, y1 - 6, 1.2, 26, '#8a3aa8', { w: 2.2, life: 0.4 }); sparks(x1, y1, 8, '#b060ff', 60); await W(300); } },
    alptraum: { ms: 2000, fn: async (f, t) => { const [x1, y1] = center(t); G.B.dim = 0.7; await An(900, p => { for (let i = 0; i < 2; i++) { const a = rnd(0, 6.28), r = 50 * (1 - p); P_({ x: x1 + Math.cos(a) * r, y: y1 + Math.sin(a) * r * 0.6, k: 'shade', r: 8, dr: -4, life: 0.4, c: Math.random() < 0.5 ? '#6a2a8a' : '#a02a4a', a: 0.6 }); } }); glowAt(x1 - 8, y1 - 14, 3, 0, '#ff4a6a', 0.6); glowAt(x1 + 8, y1 - 14, 3, 0, '#ff4a6a', 0.6); await W(300); G.B.shake = 6; G.B.flash = { c: '#b02050', a: 0.45 }; await W(400); } },
    // --- v17: eigene Choreografie für die neuen Attacken (gemeinsamer Pool + Signaturen), je ≤ 3 s ---
    pickser: { ms: 600, fn: async (f, t) => { const a = selfA(f), d = f === 'ally' ? 1 : -1; await An(160, p => { a.dx = p * 26 * d; }); a.dx = 0; const [x, y] = center(t); streak(x - 3 * d, y, -0.4 * d, 12, '#fff0c0', { w: 2.5, life: 0.18 }); sparks(x, y, 5, '#ffe8a0', 50); await W(120); } },
    schwanzhieb: { ms: 900, fn: async (f, t) => { const [x, y] = center(t); await An(420, p => { const a = Lp(3.6, 0.2, p); streak(x + Math.cos(a) * 20, y + Math.sin(a) * 12, a + 1.57, 12, '#e8e0f4', { w: 3, life: 0.12 }); }); ringAt(x + 10, y, 3, 80, '#ffffff', 0.25); await W(150); } },
    flatterstoss: { ms: 900, fn: async (f, t) => { await fly(f, t, 520, (p, x, y, st) => { if (st % 2) P_({ x: x + rnd(-6, 6), y: y + rnd(-4, 4), vy: rnd(10, 30), k: 'feather', s: 2.5, a: rnd(0, 3), life: 0.5, c: '#f0ecf8' }); }, 26, 3); } },
    krallenhieb: { ms: 1000, fn: async (f, t) => { const [x, y] = center(t); for (let i = 0; i < 3; i++) { const o = (i - 1) * 9; for (let k = 0; k < 3; k++) streak(x + o - 5 + k * 5, y - 2 + (i % 2) * 6, i % 2 ? -1.0 : 1.0, 20, '#fff4e0', { w: 1.6, life: 0.2 }); await W(170); } } },
    rammbock: { ms: 1000, fn: async (f, t) => { const a = selfA(f), d = f === 'ally' ? 1 : -1; await An(260, p => { a.dx = -p * 12 * d; a.dy = p * 2; }); await An(200, p => { a.dx = Lp(-12, 64, p) * d; a.dy = 2 * (1 - p); }); G.B.shake = 6; const [x, y] = center(t); ringAt(x, y, 6, 150, '#ffffff', 0.3); sparks(x, y, 10, '#ffffff', 90); await An(200, p => { a.dx = 64 * (1 - p) * d; }); a.dx = 0; } },
    knabbern: { ms: 900, fn: async (f, t) => { const [x, y] = center(t); for (let i = 0; i < 3; i++) { const ox = rnd(-10, 10), oy = rnd(-8, 8); P_({ x: x + ox - 2, y: y + oy, k: 'tooth', s: 3, up: 0, life: 0.12, c: '#ffffff' }); P_({ x: x + ox + 2, y: y + oy + 3, k: 'tooth', s: 3, up: 1, life: 0.12, c: '#ffffff' }); await W(200); } } },
    hufstampfer: { ms: 1000, fn: async (f, t) => { const a = selfA(f), [x, y] = center(t); await An(300, p => { a.dy = -Math.sin(p * Math.PI) * 14; }); a.dy = 0; for (let i = 0; i < 2; i++) { ringAt(x - 8 + i * 16, y + 22, 3, 60, '#e8dcc0', 0.35, { flat: 1 }); G.B.shake = 3; await W(180); } sparks(x, y + 18, 8, '#c8b89a', 60); } },
    platscher: { ms: 900, fn: async (f, t) => { const a = selfA(f), [x, y] = center(t); await An(300, p => { a.dy = -Math.sin(p * Math.PI) * 18; }); a.dy = 0; for (let i = 0; i < 12; i++) P_({ x: x + rnd(-16, 16), y: y + 14, vx: rnd(-50, 50), vy: rnd(-110, -60), g: 320, k: 'drop', s: 2, life: 0.5, c: i % 2 ? '#8ac8ff' : '#d8f0ff' }); await W(300); } },
    stachelstoss: { ms: 700, fn: async (f, t) => { const [x0, y0] = center(f), [x1, y1] = center(t), a = Math.atan2(y1 - y0, x1 - x0); await An(300, p => { streak(Lp(x0, x1, p), Lp(y0, y1, p), a, 18, '#f4e8c8', { w: 1.8, life: 0.1 }); }); glowAt(x1, y1, 6, 20, '#ffffff', 0.2); await W(100); } },
    einrollen: { ms: 1000, fn: async (f, t) => { const a = selfA(f), [x, y] = center(f); await An(500, p => { a.dy = p * 6; }); for (let i = 0; i < 10; i++) { const q = i / 10 * 6.28; P_({ x: x + Math.cos(q) * 22, y: y + 6 + Math.sin(q) * 16, k: 'spark', s: 2, life: 0.5, c: '#e8dcc0' }); } ringAt(x, y + 6, 26, -10, '#fff4d8', 0.5); await W(300); a.dy = 0; } },
    aufplustern: { ms: 900, fn: async (f, t) => { const a = selfA(f), [x, y] = center(f); await An(500, p => { a.dy = -Math.sin(p * Math.PI) * 5; if (Math.random() < 0.6) P_({ x: x + rnd(-20, 20), y: y + rnd(-10, 14), vy: -20, k: 'feather', s: 2, a: rnd(0, 3), life: 0.5, c: '#f8f4ff' }); }); a.dy = 0; ringAt(x, y, 10, 40, '#e8f0ff', 0.35); } },
    fauchen: { ms: 900, fn: async (f, t) => { const [x0, y0] = center(f), [x1, y1] = center(t); for (let i = 0; i < 3; i++) { const q = Math.atan2(y1 - y0, x1 - x0) + (i - 1) * 0.3; streak(x0 + Math.cos(q) * 20, y0 + Math.sin(q) * 20, q, 16, '#ffb0a0', { w: 2, life: 0.3 }); } await W(250); G.B.shake = 2; for (let i = 0; i < 2; i++) { ringAt(x1, y1, 26, -40, '#ff9a8a', 0.4); await W(150); } } },
    funkenschlag: { ms: 900, fn: async (f, t) => { const a = selfA(f), d = f === 'ally' ? 1 : -1, [x, y] = center(t); await An(260, p => { a.dx = Math.sin(p * Math.PI) * 30 * d; }); a.dx = 0; for (let i = 0; i < 4; i++) streak(x + rnd(-8, 8), y + rnd(-8, 8), rnd(0, 6.28), 14, '#fff49a', { w: 2, life: 0.2 }); G.B.flash = { c: '#fff8b0', a: 0.3 }; sparks(x, y, 14, '#ffe060', 100); await W(200); } },
    steinwurf: { ms: 900, fn: async (f, t) => { const [x0, y0] = center(f); P_({ x: x0, y: y0 + 16, vy: -80, g: 300, life: 0.25, c: '#a89878', s: 5, k: 'chunk' }); await W(200); await fly(f, t, 380, (p, x, y) => P_({ x, y, life: 0.08, c: '#a89878', s: 5, k: 'chunk' }), 40); } },
    wellenschlag: { ms: 1200, fn: async (f, t) => { const [x1, y1] = center(t); await An(800, p => { const h = Math.sin(p * Math.PI) * 34, xw = Lp(x1 - 50, x1 + 20, p); for (let i = 0; i < 3; i++) P_({ x: xw + rnd(-8, 8), y: y1 + 24 - h * rnd(0.5, 1), vy: -10, g: 100, k: 'drop', s: 3, life: 0.3, c: i ? '#4a90d0' : '#c8ecff' }); }); G.B.shake = 4; } },
    glutstoss: { ms: 800, fn: async (f, t) => { const a = selfA(f), d = f === 'ally' ? 1 : -1, [x0, y0] = center(f); await An(420, p => { a.dx = Math.sin(p * Math.PI) * 40 * d; P_({ x: x0 + a.dx, y: y0 + rnd(-6, 6), k: 'glow', r: 5, dr: 6, life: 0.3, c: '#ff9040' }); }); a.dx = 0; const [x, y] = center(t); glowAt(x, y, 10, 30, '#ffc060', 0.3); } },
    blaetterklinge: { ms: 900, fn: async (f, t) => { const [x, y] = center(t); for (const s of [-1, 1]) { await An(200, p => streak(x + s * Lp(-24, 24, p), y + Lp(-14, 14, p), 0.55 * s, 16, '#9ae070', { w: 3, life: 0.1 })); } for (let i = 0; i < 6; i++) P_({ x: x + rnd(-10, 10), y: y + rnd(-10, 10), vy: rnd(10, 40), k: 'leaf', ph: rnd(0, 6), s: 2, life: 0.6, c: '#6ac050' }); await W(200); } },
    geistesblitz: { ms: 800, fn: async (f, t) => { const [x0, y0] = center(f), [x1, y1] = center(t); glowAt(x0, y0 - 16, 4, 20, '#ffb0e0', 0.3); await W(200); await An(160, p => streak(Lp(x0, x1, p), Lp(y0 - 16, y1, p), Math.atan2(y1 - y0 + 16, x1 - x0), 22, '#ffd0f0', { w: 2.5, life: 0.12 })); ringAt(x1, y1, 4, 120, '#ff9ad8', 0.35); await W(150); } },
    erdstoss: { ms: 1300, fn: async (f, t) => { const [x1, y1] = center(t); G.B.shake = 3; await An(400, p => { if (Math.random() < 0.7) P_({ x: x1 + rnd(-24, 24), y: y1 + 26, vy: -30, k: 'spark', s: 2, life: 0.3, c: '#8a6a44' }); }); for (let i = 0; i < 3; i++) P_({ x: x1 - 16 + i * 16, y: y1 + 28, vy: -220, g: 500, life: 0.6, c: i === 1 ? '#8a6a44' : '#6a5034', s: 8, k: 'chunk' }); G.B.shake = 7; await W(450); } },
    kampfschrei: { ms: 1000, fn: async (f, t) => { const a = selfA(f), [x, y] = center(f); await An(600, p => { a.dx = Math.sin(p * 60) * 2; if (Math.random() < 0.5) glowAt(x + rnd(-20, 20), y + rnd(-16, 16), 4, 10, '#ff7050', 0.3); }); a.dx = 0; for (let i = 0; i < 3; i++) ringAt(x, y, 6 + i * 6, 90, '#ffb090', 0.4); G.B.shake = 3; await W(200); } },
    glutzunge: { ms: 1000, fn: async (f, t) => { const [x1, y1] = center(t); await An(700, p => { const a = p * 9, r = 20 * (1 - p * 0.6); for (let i = 0; i < 2; i++) P_({ x: x1 + Math.cos(a + i * 3.14) * r, y: y1 + 18 - p * 30 + Math.sin(a) * 4, vy: -30, k: 'glow', r: rnd(3, 5), dr: -3, life: 0.35, c: i ? '#ff6a30' : '#ffd060' }); }); } },
    tauchplatscher: { ms: 1300, fn: async (f, t) => { const a = selfA(f), [x, y] = center(t); await An(300, p => { a.dy = p * 26; a.alpha = 1 - p; }); for (let i = 0; i < 8; i++) P_({ x: x + rnd(-14, 14), y: y + 20, vy: rnd(-140, -80), g: 300, k: 'drop', s: 2, life: 0.6, c: '#9ad4ff' }); ringAt(x, y + 22, 4, 60, '#d8f0ff', 0.4, { flat: 1 }); await W(400); await An(300, p => { a.dy = 26 * (1 - p); a.alpha = p; }); a.dy = 0; a.alpha = 1; } },
    blattschirm: { ms: 1000, fn: async (f, t) => { const [x, y] = center(f); await An(600, p => { const q = p * 7; for (let i = 0; i < 2; i++) P_({ x: x + Math.cos(q + i * 3.14) * 26, y: y + Math.sin(q + i * 3.14) * 18, k: 'leaf', ph: q, s: 2.5, life: 0.4, c: i ? '#7ac858' : '#a8e080' }); }); glowAt(x, y, 20, 10, '#c8f0a0', 0.4); await W(200); } },
    vierblatt: { ms: 1000, fn: async (f, t) => { const [x1, y1] = center(t); await An(500, p => { for (let i = 0; i < 4; i++) { const q = i * 1.57 + p * 5; P_({ x: x1 + Math.cos(q) * 16 * (1 - p), y: y1 + Math.sin(q) * 16 * (1 - p), k: 'glow', r: 3, dr: 0, life: 0.1, c: '#80e070' }); } }); glowAt(x1, y1, 5, 40, '#fff8a0', 0.3); sparks(x1, y1, 8, '#fff8a0', 70); await W(200); } },
    glockenruf: { ms: 1300, fn: async (f, t) => { const [x0, y0] = center(f), [x1, y1] = center(t); for (let i = 0; i < 3; i++) { ringAt(x0, y0 - 6, 4, 90, '#e8d890', 0.5); glowAt(x0, y0 - 6, 5, 4, '#fff0a0', 0.3); await W(180); } await An(500, p => { const q = p * 14; P_({ x: x1 + Math.cos(q) * 22, y: y1 - 18 + Math.sin(q * 2) * 4, k: 'mote', life: 0.4, c: '#fff0a0' }); }); } },
    kieselkugel: { ms: 1100, fn: async (f, t) => { const a = selfA(f), d = f === 'ally' ? 1 : -1; await An(700, p => { a.dx = Math.sin(p * Math.PI) * 44 * d; a.dy = -Math.abs(Math.sin(p * Math.PI * 3)) * 8; if (Math.random() < 0.5) P_({ x: center(f)[0] + a.dx, y: center(f)[1] + 22, vy: -20, k: 'spark', s: 2, life: 0.3, c: '#b8a88a' }); }); a.dx = a.dy = 0; } },
    augenflecken: { ms: 1100, fn: async (f, t) => { const [x0, y0] = center(f), [x1, y1] = center(t); for (const s of [-1, 1]) { glowAt(x0 + s * 14, y0 - 4, 6, 4, '#ffcc60', 0.6); glowAt(x0 + s * 14, y0 - 4, 2, 0, '#302040', 0.6); } await W(400); await An(400, p => { for (const s of [-1, 1]) P_({ x: x1 + s * 10 * (1 - p), y: y1 - 4, k: 'glow', r: 4, dr: 0, life: 0.08, c: '#ffcc60' }); }); } },
    schuppenstaub: { ms: 1200, fn: async (f, t) => { const [x1, y1] = center(t); await An(900, p => { for (let i = 0; i < 2; i++) P_({ x: x1 + rnd(-28, 28), y: y1 - 30, vx: rnd(-8, 8), vy: rnd(20, 40), k: 'spark', s: 1.5, life: 0.8, c: ['#e8c0ff', '#c0e8ff', '#fff0c0'][G.rnd(0, 2)] }); }); } },
    nachtgesang: { ms: 1500, fn: async (f, t) => { const [x0, y0] = center(f), [x1, y1] = center(t); G.B.dim = 0.4; await An(1000, p => { if (Math.random() < 0.4) { const q = rnd(0, 1); P_({ x: Lp(x0, x1, q), y: Lp(y0, y1, q) - 20 + Math.sin(q * 12 + p * 6) * 8, vy: -8, k: 'mote', life: 0.6, c: '#b8c0ff' }); } }); glowAt(x1, y1 - 24, 4, 3, '#e8ecff', 0.5); } },
    nachtschwinge: { ms: 800, fn: async (f, t) => { const a = selfA(f), [x1, y1] = center(t); await An(180, p => { a.alpha = 1 - p; }); await An(260, p => { P_({ x: Lp(x1 - 60, x1, p), y: Lp(y1 - 40, y1, p), k: 'shade', r: 10, dr: -8, life: 0.25, c: '#3a3a6a', a: 0.7 }); }); streak(x1, y1, 0.7, 30, '#c8c8ff', { w: 2, life: 0.2 }); await An(160, p => { a.alpha = p; }); a.alpha = 1; } },
    irrlichttanz: { ms: 1300, fn: async (f, t) => { const [x0, y0] = center(f), [x1, y1] = center(t); for (let i = 0; i < 3; i++) (async () => { await An(700, p => { const x = Lp(x0, x1, p) + Math.sin(p * 10 + i * 2) * 14, y = Lp(y0, y1, p) + Math.cos(p * 8 + i) * 12; glowAt(x, y, 4, 0, i === 1 ? '#a0ffe8' : '#fff0a0', 0.12); }); })(); await W(820); } },
    maulwurfsgrab: { ms: 1300, fn: async (f, t) => { const a = selfA(f), [x0, y0] = center(f), [x1, y1] = center(t); await An(300, p => { a.dy = p * 22; a.alpha = 1 - p; if (Math.random() < 0.6) P_({ x: x0 + rnd(-12, 12), y: y0 + 22, vy: -60, g: 200, k: 'chunk', s: 2.5, life: 0.4, c: '#7a5a3a' }); }); await W(200); for (let i = 0; i < 8; i++) P_({ x: x1 + rnd(-10, 10), y: y1 + 20, vy: rnd(-150, -80), vx: rnd(-40, 40), g: 400, k: 'chunk', s: 3, life: 0.6, c: '#6a4a2e' }); G.B.shake = 4; await W(250); await An(250, p => { a.dy = 22 * (1 - p); a.alpha = p; }); a.dy = 0; a.alpha = 1; } },
    morgentau: { ms: 1300, fn: async (f, t) => { const [x, y] = center(f); await An(900, p => { if (Math.random() < 0.6) P_({ x: x + rnd(-22, 22), y: y - 40, vy: 50, k: 'drop', s: 2, life: 0.6, c: '#d8f4ff', floor: y + rnd(-8, 12) }); }); glowAt(x, y, 14, 16, '#e8fff0', 0.4); await W(200); } },
    dachsfaust: { ms: 600, fn: async (f, t) => { const a = selfA(f), d = f === 'ally' ? 1 : -1; await An(150, p => { a.dx = p * 40 * d; }); const [x, y] = center(t); for (let i = 0; i < 3; i++) streak(x - 14 * d, y - 6 + i * 6, 0, 16, '#ffe0c0', { w: 2, life: 0.15 }); ringAt(x, y, 3, 140, '#ffd0a0', 0.25); await An(150, p => { a.dx = 40 * (1 - p) * d; }); a.dx = 0; } },
    sporenschlaf: { ms: 1300, fn: async (f, t) => { const [x0, y0] = center(f), [x1, y1] = center(t); await An(400, p => P_({ x: x0 + rnd(-10, 10), y: y0 - 10, vy: -30, k: 'fog', r: 5, dr: 6, life: 0.5, c: '#d0a8e8', a: 0.5 })); await fly(f, t, 500, (p, x, y) => P_({ x: x + rnd(-6, 6), y: y + rnd(-6, 6), k: 'fog', r: 7, dr: 8, life: 0.6, c: '#b890d8', a: 0.45 }), 20); for (let i = 0; i < 3; i++) P_({ x: x1 + 12 + i * 5, y: y1 - 20 - i * 6, vy: -16, k: 'mote', life: 0.6, c: '#ffffff' }); } },
    pilzsog: { ms: 1300, fn: async (f, t) => { const [x0, y0] = center(f), [x1, y1] = center(t); await An(800, p => { for (let i = 0; i < 3; i++) { const q = (p + i / 3) % 1; P_({ x: Lp(x1, x0, q) + Math.sin(q * 9 + i) * 6, y: Lp(y1, y0, q) + Math.cos(q * 7) * 4, k: 'spark', s: 1.5, life: 0.12, c: i ? '#c890ff' : '#90ffc0' }); } }); glowAt(x0, y0, 12, 10, '#b0ffd0', 0.3); } },
    tausprung: { ms: 700, fn: async (f, t) => { const a = selfA(f), d = f === 'ally' ? 1 : -1; await An(360, p => { a.dx = Math.sin(p * Math.PI) * 48 * d; a.dy = -Math.sin(p * Math.PI) * 22; if (Math.random() < 0.6) P_({ x: center(f)[0] + a.dx, y: center(f)[1] + a.dy + 16, k: 'mote', life: 0.4, c: '#d8f0ff' }); }); a.dx = a.dy = 0; } },
    zappelfunk: { ms: 1200, fn: async (f, t) => { const [x1, y1] = center(t); for (let i = 0; i < 6; i++) { const x = x1 + rnd(-18, 18), y = y1 + rnd(-14, 14); streak(x, y, rnd(0, 6.28), 10, i % 2 ? '#fff080' : '#80e0ff', { w: 1.5, life: 0.15 }); sparks(x, y, 3, '#fff4a0', 50); await W(130); } } },
    gischtschild: { ms: 1000, fn: async (f, t) => { const [x, y] = center(f), d = f === 'ally' ? 1 : -1; await An(600, p => { for (let i = 0; i < 2; i++) P_({ x: x + 24 * d + rnd(-3, 3), y: y + 24 - p * 50 + rnd(-4, 4), vx: rnd(-10, 10), vy: -20, k: 'drop', s: 2, life: 0.4, c: i ? '#c8ecff' : '#6ab0e8' }); }); ringAt(x, y, 24, 6, '#d8f4ff', 0.5); await W(200); } },
    fuchsfinte: { ms: 1000, fn: async (f, t) => { const a = selfA(f), d = f === 'ally' ? 1 : -1; await An(200, p => { a.alpha = 1 - p * 0.8; a.dx = -p * 10 * d; }); await W(150); await An(220, p => { a.dx = Lp(-10, 50, p) * d; a.alpha = 0.2 + p * 0.8; }); const [x, y] = center(t); streak(x, y, 2.4, 26, '#ffe0b0', { w: 2.2, life: 0.2 }); await An(200, p => { a.dx = 50 * (1 - p) * d; }); a.dx = 0; a.alpha = 1; } },
    traumblick: { ms: 1400, fn: async (f, t) => { const [x0, y0] = center(f), [x1, y1] = center(t); glowAt(x0, y0 - 8, 8, 10, '#d8b8ff', 0.6); await W(300); await An(700, p => { const q = p * 16, r = 26 * (1 - p); P_({ x: x1 + Math.cos(q) * r, y: y1 + Math.sin(q) * r * 0.6, k: 'glow', r: 3, dr: 0, life: 0.2, c: '#c8a8ff' }); }); G.B.dim = 0.35; } },
    nachtsauger: { ms: 1100, fn: async (f, t) => { const [x0, y0] = center(f), [x1, y1] = center(t); await An(700, p => { if (Math.random() < 0.8) { const q = rnd(0, 1); P_({ x: Lp(x1, x0, (q + p) % 1), y: Lp(y1, y0, (q + p) % 1), k: 'glow', r: 2.5, dr: 0, life: 0.1, c: '#ff8aa0' }); } }); glowAt(x0, y0, 10, 8, '#ffb0c0', 0.3); } },
    umschlingen: { ms: 1200, fn: async (f, t) => { const [x1, y1] = center(t); await An(800, p => { const q = p * 12; P_({ x: x1 + Math.cos(q) * 22, y: y1 + 20 - p * 40, k: 'spark', s: 2.5, life: 0.5, c: '#7a9a50' }); }); G.B.shake = 2; } },
    giftzahn: { ms: 900, fn: async (f, t) => { const [x, y] = center(t); await An(300, p => { const g = 16 * (1 - p); P_({ x: x - 3, y: y - g, k: 'tooth', s: 5, up: 0, life: 0.05, c: '#e8d0ff' }); P_({ x: x + 3, y: y - g, k: 'tooth', s: 5, up: 0, life: 0.05, c: '#e8d0ff' }); }); for (let i = 0; i < 6; i++) P_({ x: x + rnd(-6, 6), y, vy: rnd(20, 50), k: 'drop', s: 2, life: 0.5, c: '#a050d0' }); await W(250); } },
    panzerstoss: { ms: 1200, fn: async (f, t) => { const a = selfA(f), d = f === 'ally' ? 1 : -1, [x0, y0] = center(f); glowAt(x0, y0, 20, 0, '#d8c8a8', 0.3); await An(300, p => { a.dx = -p * 8 * d; }); await An(220, p => { a.dx = Lp(-8, 60, p) * d; }); G.B.shake = 7; const [x, y] = center(t); for (let i = 0; i < 6; i++) P_({ x, y, vx: rnd(-90, 90), vy: rnd(-100, -20), g: 300, life: 0.5, c: '#b8a888', s: 3, k: 'chunk' }); await An(220, p => { a.dx = 60 * (1 - p) * d; }); a.dx = 0; } },
    suhlen: { ms: 1300, fn: async (f, t) => { const a = selfA(f), [x, y] = center(f); await An(900, p => { a.dx = Math.sin(p * 18) * 5; if (Math.random() < 0.6) P_({ x: x + rnd(-20, 20), y: y + 22, vy: rnd(-60, -20), g: 200, k: 'drop', s: 2.5, life: 0.4, c: '#6a5438' }); }); a.dx = 0; glowAt(x, y, 12, 12, '#f0e0c0', 0.3); } },
    moornebel: { ms: 1300, fn: async (f, t) => { const [x1, y1] = center(t); await An(900, p => { const x = Lp(x1 - 60, x1 + 40, p); for (let i = 0; i < 2; i++) P_({ x, y: y1 + rnd(-14, 18), vx: 30, k: 'fog', r: rnd(8, 12), dr: 6, life: 0.8, c: i ? '#6a8a4a' : '#8a5aa0', a: 0.5 }); }); } },
    wutgeheul: { ms: 1100, fn: async (f, t) => { const a = selfA(f), [x, y] = center(f); await An(700, p => { a.dy = -Math.sin(p * Math.PI) * 6; if (Math.random() < 0.4) streak(x + rnd(-16, 16), y - 20, -1.57, 10, '#ff6a50', { w: 2, life: 0.25, vy: -60 }); }); a.dy = 0; ringAt(x, y, 8, 120, '#ff8a6a', 0.35); G.B.flash = { c: '#ff6040', a: 0.2 }; await W(200); } },
    mondklee: { ms: 1300, fn: async (f, t) => { const [x1, y1] = center(t); for (let i = 0; i < 8; i++) { const q = i / 8 * 6.28; P_({ x: x1 + Math.cos(q) * 26, y: y1 + 22 + Math.sin(q) * 7, vy: -12, k: 'leaf', ph: q, s: 2.5, life: 0.8, c: i % 2 ? '#70c060' : '#c8e8ff' }); await W(60); } glowAt(x1, y1 + 20, 20, 6, '#e0f0ff', 0.5); await W(300); } },
    kristallbohrer: { ms: 1200, fn: async (f, t) => { const [x0, y0] = center(f), [x1, y1] = center(t), a = Math.atan2(y1 - y0, x1 - x0); await An(700, p => { const x = Lp(x0, x1, p), y = Lp(y0, y1, p), q = p * 40; streak(x, y, a, 16, '#d8f0ff', { w: 3, life: 0.08 }); P_({ x: x + Math.cos(q) * 6, y: y + Math.sin(q) * 6, k: 'spark', s: 2, life: 0.2, c: q % 2 > 1 ? '#a8e0ff' : '#fff4a0' }); }); G.B.shake = 4; sparks(x1, y1, 12, '#c8f0ff', 110); } },
    drusenblitz: { ms: 1300, fn: async (f, t) => { const [x0, y0] = center(f), [x1, y1] = center(t); for (let i = 0; i < 5; i++) { const q = i / 5 * 6.28; P_({ x: x0 + Math.cos(q) * 18, y: y0 + Math.sin(q) * 14, k: 'chunk', s: 3, life: 0.5, c: '#b8a0ff' }); } await W(300); G.B.dim = 0.4; let bx = x0, by = y0; for (let i = 1; i <= 8; i++) { const nx = Lp(x0, x1, i / 8) + (i < 8 ? rnd(-8, 8) : 0), ny = Lp(y0, y1, i / 8) + (i < 8 ? rnd(-8, 8) : 0); streak((bx + nx) / 2, (by + ny) / 2, Math.atan2(ny - by, nx - bx), Math.hypot(nx - bx, ny - by), '#e8d8ff', { w: 2.5, life: 0.3, grow: false }); bx = nx; by = ny; } G.B.flash = { c: '#d0c0ff', a: 0.4 }; await W(300); } },
    geodenbruch: { ms: 1800, fn: async (f, t) => { const [x1, y1] = center(t); G.B.dim = 0.5; P_({ x: x1, y: y1 - 80, vy: 100, g: 600, floor: y1, life: 0.9, c: '#8a78a8', s: 16, k: 'chunk' }); await W(620); G.B.shake = 9; G.B.flash = { c: '#e8e0ff', a: 0.5 }; for (let i = 0; i < 16; i++) { const q = rnd(0, 6.28), s = rnd(60, 160); P_({ x: x1, y: y1, vx: Math.cos(q) * s, vy: Math.sin(q) * s - 40, g: 240, life: 0.7, c: ['#c8a8ff', '#a8e0ff', '#fff4c0'][i % 3], s: rnd(2, 4), k: 'chunk' }); } ringAt(x1, y1, 6, 160, '#e8d8ff', 0.4); await W(500); } },
    wirbeltauchen: { ms: 800, fn: async (f, t) => { const a = selfA(f), [x1, y1] = center(t); await An(150, p => { a.dy = p * 20; a.alpha = 1 - p; }); await W(100); for (let i = 0; i < 10; i++) { const q = i / 10 * 6.28; P_({ x: x1 + Math.cos(q) * 12, y: y1 + 20, vx: Math.cos(q) * 40, vy: -120, g: 300, k: 'drop', s: 2, life: 0.4, c: '#8ad0ff' }); } ringAt(x1, y1 + 20, 4, 60, '#d8f4ff', 0.3, { flat: 1 }); await An(200, p => { a.dy = 20 * (1 - p); a.alpha = p; }); a.dy = 0; a.alpha = 1; } },
    otterpfoten: { ms: 1000, fn: async (f, t) => { const [x, y] = center(t); for (let i = 0; i < 4; i++) { const ox = (i % 2 ? 8 : -8) + rnd(-3, 3), oy = rnd(-8, 8); glowAt(x + ox, y + oy, 4, 20, '#ffe0c0', 0.15); streak(x + ox, y + oy, i % 2 ? 2.4 : 0.7, 10, '#fff0e0', { w: 2, life: 0.15 }); await W(150); } } },
    strudelwirbel: { ms: 1600, fn: async (f, t) => { const [x1, y1] = center(t); G.B.dim = 0.3; await An(1100, p => { for (let i = 0; i < 3; i++) { const q = p * 16 + i * 2.1, r = 34 * (1 - p * 0.7); P_({ x: x1 + Math.cos(q) * r, y: y1 + 10 + Math.sin(q) * r * 0.45 - p * 16, k: 'drop', s: 2.5, life: 0.2, c: i === 1 ? '#e8f8ff' : '#3a7ac0' }); } }); G.B.shake = 5; ringAt(x1, y1, 8, 110, '#c8ecff', 0.35); } },
    pechfeder: { ms: 1100, fn: async (f, t) => { const [x0, y0] = center(f), [x1, y1] = center(t); for (let i = 0; i < 5; i++) (async () => { const oy = rnd(-12, 12); await An(420, p => P_({ x: Lp(x0, x1, p), y: Lp(y0 + oy, y1 + oy * 0.4, p), k: 'feather', s: 3, a: Math.atan2(y1 - y0, x1 - x0), life: 0.06, c: '#2a1a3a' })); P_({ x: x1 + rnd(-6, 6), y: y1 + oy * 0.4, k: 'fog', r: 5, dr: 6, life: 0.5, c: '#9a50c0', a: 0.5 }); })(), await W(100); await W(500); } },
    totenlaeuten: { ms: 1400, fn: async (f, t) => { const [x1, y1] = center(t); P_({ x: x1, y: y1 - 44, k: 'glow', r: 8, dr: 0, life: 0.9, c: '#e8d890' }); for (let i = 0; i < 3; i++) { ringAt(x1, y1 - 40, 4, 100, '#d8c880', 0.6); G.B.shake = 2; await W(260); } G.B.dim = 0.3; } },
    seelenkrah: { ms: 1700, fn: async (f, t) => { const [x0, y0] = center(f), [x1, y1] = center(t); G.B.dim = 0.5; for (let i = 0; i < 4; i++) { ringAt(x0, y0 - 10, 5, 130, '#c8a0ff', 0.45); await W(120); } await An(600, p => { for (let i = 0; i < 2; i++) P_({ x: x1 + rnd(-20, 20), y: y1 + rnd(-16, 16), vx: (x0 - x1) * 0.8, vy: (y0 - y1) * 0.8, k: 'glow', r: 3, dr: 0, life: 0.5, c: i ? '#e8d0ff' : '#9a60e0' }); }); glowAt(x0, y0, 14, 10, '#d8c0ff', 0.4); } },
    // --- Neutral ---
    hauch: { ms: 700, fn: async (f, t) => { await fly(f, t, 520, (p, x, y) => P_({ x, y, k: 'fog', r: 5 + p * 8, dr: 10, life: 0.5, c: '#e8e4f4', a: 0.4 })); } },
    rempler: { ms: 600, fn: async (f, t) => { const a = selfA(f), d = f === 'ally' ? 1 : -1; await An(300, p => { a.dx = Math.sin(p * Math.PI) * 34 * d; }); a.dx = 0; const [x, y] = center(t); ringAt(x, y, 4, 120, '#ffffff', 0.25); } },
    kratzer: { ms: 700, fn: async (f, t) => { const [x, y] = center(t); for (let i = 0; i < 3; i++) { streak(x - 6 + i * 6, y, -1.1, 30, '#ffffff', { w: 2.2, life: 0.3 }); streak(x - 6 + i * 6, y, -1.1, 22, '#c8c0e0', { w: 4, life: 0.18 }); await W(90); } await W(220); } },
    biss: { ms: 800, fn: async (f, t) => { const [x, y] = center(t); await An(420, p => { const g = 22 * (1 - p * p); if (Math.random() < 0.9) for (let i = -2; i <= 2; i++) { P_({ x: x + i * 7, y: y - g, k: 'tooth', s: 4, up: 0, life: 0.06, c: '#ffffff' }); P_({ x: x + i * 7 + 3, y: y + g, k: 'tooth', s: 4, up: 1, life: 0.06, c: '#ffffff' }); } }); sparks(x, y, 8, '#ffffff', 90); await W(120); } },
    kopfnuss: { ms: 800, fn: async (f, t) => { const a = selfA(f), d = f === 'ally' ? 1 : -1; await An(360, p => { a.dx = Math.sin(p * Math.PI) * 40 * d; a.dy = -Math.sin(p * Math.PI) * 14; }); a.dx = a.dy = 0; const [x, y] = center(t);
      for (let i = 0; i < 5; i++) { const g = i / 5 * 6.28; P_({ x: x + Math.cos(g) * 12, y: y - 18 + Math.sin(g) * 4, vx: -Math.sin(g) * 30, vy: Math.cos(g) * 10, life: 0.6, c: '#ffe890', s: 2, k: 'spark' }); } await W(250); } },
    heuler: { ms: 900, fn: async (f, t) => { const [x0, y0] = center(f); for (let i = 0; i < 4; i++) { ringAt(x0, y0 - 6, 6, 150, '#e8e0ff', 0.55); await W(150); } await W(200); } },
    starren: { ms: 900, fn: async (f, t) => { const [x0, y0] = center(f), [x1, y1] = center(t); glowAt(x0 - 4, y0 - 8, 6, 10, '#ff5060', 0.5); glowAt(x0 + 4, y0 - 8, 6, 10, '#ff5060', 0.5); await W(260);
      await An(360, p => { streak(Lp(x0, x1, p), Lp(y0, y1, p) - 6, Math.atan2(y1 - y0, x1 - x0), 10, '#ff8090', { w: 1.2, life: 0.12 }); }); ringAt(x1, y1, 16, -30, '#ff6070', 0.3); } },
    haerten: { ms: 900, fn: async (f, t) => { const [x, y] = center(f); for (let i = 0; i < 3; i++) { ringAt(x, y, 30 - i * 6, -40, '#c4ae88', 0.4); for (let j = 0; j < 6; j++) P_({ x: x + rnd(-18, 18), y: y + rnd(-18, 18), k: 'chunk', s: 2, life: 0.3, c: '#c4ae88' }); await W(180); } glowAt(x, y, 20, 10, '#e8dcc0', 0.4); await W(200); } },
    letzterhauch: { ms: 1100, fn: async (f, t) => { const [x0, y0] = center(f); await An(400, p => { if (Math.random() < 0.6) P_({ x: x0 + rnd(-10, 10), y: y0 + rnd(-6, 10), vy: -30, k: 'mote', life: 0.6, c: '#f0e8ff' }); }); await fly(f, t, 420, (p, x, y) => P_({ x, y, k: 'glow', r: 5, dr: -4, life: 0.25, c: '#ffffff' })); } },
    // --- Feuer ---
    irrfeuer: { ms: 900, fn: async (f, t) => { const [x0, y0] = center(f), [x1, y1] = center(t); await An(620, p => { for (let i = 0; i < 3; i++) { const q = Math.max(0, Math.min(1, p * 1.3 - i * 0.15)), x = Lp(x0, x1, q) + Math.sin(q * 9 + i * 2) * 12, y = Lp(y0, y1, q) + Math.cos(q * 7 + i) * 10; P_({ x, y, k: 'glow', r: 5, dr: -3, life: 0.2, c: i === 1 ? '#ffe070' : '#f58c4c' }); } }); } },
    glutschein: { ms: 1000, fn: async (f, t) => { const [x0, y0] = center(f); await An(380, p => { glowAt(x0, y0, 10 + p * 16, 0, '#ffb050', 0.08); }); G.B.flash = { c: '#ffb050', a: 0.25 }; await fly(f, t, 360, (p, x, y) => { glowAt(x, y, 9, -6, '#ffc060', 0.25); P_({ x: x + rnd(-3, 3), y, vy: -30, life: 0.3, c: '#fff0b0', k: 'spark' }); }); } },
    seelenbrand: { ms: 1300, fn: async (f, t) => { const [x1, y1] = center(t); await An(700, p => { for (let i = 0; i < 2; i++) { const a = p * 14 + i * 3.14, r = 26 * (1 - p) + 4; P_({ x: x1 + Math.cos(a) * r, y: y1 + Math.sin(a) * r * 0.6, vy: -40, k: 'glow', r: 5, dr: -3, life: 0.35, c: i ? '#c890ff' : '#f58c4c' }); } }); glowAt(x1, y1, 20, 50, '#ff9a60', 0.45); await W(200); } },
    drachenglut: { ms: 1500, fn: async (f, t) => { const [x0, y0] = center(f), [x1, y1] = center(t); await An(300, p => glowAt(x0 + (f === 'ally' ? 14 : -14), y0 - 10, 4 + p * 8, 0, '#ffe070', 0.08));
      await An(700, p => { for (let i = 0; i < 3; i++) { const q = Math.min(1, p + i * 0.05), x = Lp(x0, x1, q), y = Lp(y0, y1, q) + rnd(-6, 6) * q; P_({ x, y, vx: rnd(-20, 20), vy: rnd(-30, 10), k: 'glow', r: 4 + q * 7, dr: 6, life: 0.3, c: i === 0 ? '#fff0a0' : i === 1 ? '#ff9a40' : '#e0503a' }); } }); G.B.flash = { c: '#ff9050', a: 0.3 }; await W(150); } },
    // --- Wasser ---
    sumpfsog: { ms: 1100, fn: async (f, t) => { const [x0, y0] = center(f), [x1, y1] = center(t); await An(500, p => { const a = p * 16, r = 24 * (1 - p); P_({ x: x1 + Math.cos(a) * r, y: y1 + 14 + Math.sin(a) * r * 0.3, k: 'drop', s: 2.5, life: 0.15, c: '#4a7a8a' }); });
      await An(420, p => { const q = p, x = Lp(x1, x0, q), y = Lp(y1, y0, q) - Math.sin(q * Math.PI) * 16; P_({ x, y, k: 'glow', r: 4, dr: -2, life: 0.25, c: '#8adca8' }); }); } },
    moorkaelte: { ms: 1100, fn: async (f, t) => { const [x1, y1] = center(t); for (let i = 0; i < 7; i++) { const a = i / 7 * 6.28; P_({ x: x1 + Math.cos(a) * 30, y: y1 + Math.sin(a) * 22, vx: -Math.cos(a) * 55, vy: -Math.sin(a) * 40, k: 'streak', a, l: 7, w: 1.4, life: 0.5, c: '#c8f0ff' }); await W(60); } glowAt(x1, y1, 16, 20, '#a8e8ff', 0.4); await W(250); } },
    wasserstrahl: { ms: 900, fn: async (f, t) => { const [x0, y0] = center(f), [x1, y1] = center(t); await An(560, p => { for (let i = 0; i < 3; i++) { const q = Math.max(0, p - i * 0.04) * 1.15; if (q > 1) continue; P_({ x: Lp(x0, x1, q) + rnd(-1, 1), y: Lp(y0, y1, q) + rnd(-2, 2), k: 'drop', s: 3, life: 0.18, c: i ? '#bfe4ff' : '#5aa8f2' }); } }); } },
    moorflut: { ms: 1400, fn: async (f, t) => { const [x1, y1] = center(t); await An(900, p => { const xw = Lp(x1 - 70, x1 + 20, p); for (let i = 0; i < 3; i++) P_({ x: xw + rnd(-4, 4), y: y1 + 18 - Math.sin(p * Math.PI) * 30 - i * 6, vy: rnd(-20, 10), g: 200, k: 'drop', s: 3, life: 0.35, c: i ? '#5aa8f2' : '#2e6a8a' }); }); G.B.shake = 4; } },
    schwanenruf: { ms: 1600, fn: async (f, t) => { const [x0, y0] = center(f), [x1, y1] = center(t); for (let i = 0; i < 3; i++) { ringAt(x0, y0 - 10, 6, 120, '#dfe8ff', 0.6); await W(140); }
      await An(700, p => { for (let s = -1; s <= 1; s += 2) P_({ x: Lp(x0, x1, p) + s * 10 * Math.sin(p * 3.14), y: Lp(y0, y1, p) - 14 * Math.sin(p * 3.14), k: 'feather', a: s * 0.6 + p * 4, s: 4, life: 0.4, c: '#f4f6ff' }); }); P_({ x: x1, y: y1 - 26, k: 'glow', r: 10, dr: 30, life: 0.5, c: '#fff4c8' }); } },
    // --- Pflanze ---
    blattwirbel: { ms: 1000, fn: async (f, t) => { await fly(f, t, 560, (p, x, y) => { for (let i = 0; i < 3; i++) { const a = p * 20 + i * 2.1; P_({ x: x + Math.cos(a) * 9, y: y + Math.sin(a) * 9, vx: rnd(-6, 6), ph: rnd(0, 6), life: 0.4, c: i ? '#6cc45a' : '#3e8a3a', k: 'leaf' }); } }); } },
    feenstaub: { ms: 1100, fn: async (f, t) => { const [x1, y1] = center(t); await An(800, p => { for (let i = 0; i < 2; i++) P_({ x: x1 + rnd(-24, 24), y: y1 - 36 + p * 10, vy: rnd(20, 40), vx: rnd(-8, 8), life: 0.7, c: Math.random() < 0.5 ? '#ffc8e8' : '#e8ffd0', s: 1.5, k: 'spark' }); }); } },
    rankensog: { ms: 1200, fn: async (f, t) => { const [x0, y0] = center(f), [x1, y1] = center(t); await An(420, p => { for (let i = 0; i < 2; i++) { const q = p, x = Lp(x0, x1, q) + Math.sin(q * 10 + i * 3) * 6, y = Lp(y0 + 16, y1 + 12, q); P_({ x, y, k: 'streak', a: Math.atan2(y1 - y0, x1 - x0) + Math.sin(q * 10) * 0.6, l: 6, w: 2, life: 0.7, c: i ? '#4a9a3e' : '#6cc45a' }); } });
      await An(460, p => { if (Math.random() < 0.7) P_({ x: Lp(x1, x0, p), y: Lp(y1, y0, p) - 6, k: 'glow', r: 3.5, dr: -2, life: 0.3, c: '#c8ff9a' }); }); } },
    wurzelhieb: { ms: 1100, fn: async (f, t) => { const [x1, y1] = center(t); for (let i = 0; i < 3; i++) { const x = x1 - 16 + i * 16; await An(130, p => P_({ x: x + rnd(-2, 2), y: y1 + 28 - p * 36, k: 'streak', a: -1.57, l: 8, w: 3, life: 0.35, c: '#8a6a44' })); for (let j = 0; j < 4; j++) P_({ x, y: y1 + 26, vx: rnd(-40, 40), vy: rnd(-70, -30), g: 300, k: 'chunk', s: 2, life: 0.5, c: '#5a4430' }); } await W(200); } },
    waldsegen: { ms: 1300, fn: async (f, t) => { const [x, y] = center(f); await An(1000, p => { for (let i = 0; i < 2; i++) { const a = rnd(0, 6.28), r = rnd(6, 26); P_({ x: x + Math.cos(a) * r, y: y + 24, vy: rnd(-60, -30), ph: rnd(0, 6), life: 0.7, c: i ? '#9ae07a' : '#fff0a8', k: i ? 'leaf' : 'mote' }); } }); } },
    feensturm: { ms: 1700, fn: async (f, t) => { const [x1, y1] = center(t); await An(1100, p => { for (let i = 0; i < 4; i++) { const a = p * 18 + i * 1.57, r = 34 * (1 - p * 0.6); P_({ x: x1 + Math.cos(a) * r, y: y1 + Math.sin(a) * r * 0.6 - p * 10, ph: rnd(0, 6), life: 0.3, c: i % 2 ? '#6cc45a' : '#ffc8e8', k: i % 2 ? 'leaf' : 'spark', s: 2 }); } }); G.B.flash = { c: '#c8ffb0', a: 0.3 }; } },
    // --- Elektro ---
    blendlicht: { ms: 900, fn: async (f, t) => { const [x0, y0] = center(f); await An(300, p => glowAt(x0, y0 - 6, 6 + p * 18, 0, '#fff4a0', 0.06)); G.B.flash = { c: '#fff8d0', a: 0.7 }; for (let i = 0; i < 12; i++) { const a = i / 12 * 6.28; streak(x0 + Math.cos(a) * 20, y0 - 6 + Math.sin(a) * 20, a, 14, '#fff4a0', { life: 0.35 }); } await W(350); } },
    funkenflug: { ms: 900, fn: async (f, t) => { await fly(f, t, 480, (p, x, y) => { for (let i = 0; i < 3; i++) P_({ x: x + rnd(-8, 8), y: y + rnd(-8, 8), vx: rnd(-60, 60), vy: rnd(-60, 60), life: 0.25, c: i ? '#f0cc40' : '#ffffff', s: 1.5, k: 'spark' }); }, 18); } },
    glimmstrom: { ms: 1000, fn: async (f, t) => { const [x0, y0] = center(f), [x1, y1] = center(t); await An(600, p => { const n = 8; let px = x0, py = y0; for (let i = 1; i <= n; i++) { const q = i / n, x = Lp(x0, x1, q) + (i < n ? rnd(-6, 6) : 0), y = Lp(y0, y1, q) + (i < n ? rnd(-6, 6) : 0); if (Math.random() < 0.5) streak((px + x) / 2, (py + y) / 2, Math.atan2(y - py, x - px), Math.hypot(x - px, y - py), '#f0e070', { w: 1.2, life: 0.06 }); px = x; py = y; } }); } },
    blitzschlag: { ms: 1100, fn: async (f, t) => { const [x1, y1] = center(t); G.B.dim = 0.5; await W(250); for (let k = 0; k < 2; k++) { let bx = x1 + rnd(-4, 4), by = y1 - 90; while (by < y1) { const nx = bx + rnd(-9, 9), ny = by + rnd(8, 14); streak((bx + nx) / 2, (by + ny) / 2, Math.atan2(ny - by, nx - bx), Math.hypot(nx - bx, ny - by) + 1, '#fff8c0', { w: 2.5, life: 0.25 }); bx = nx; by = ny; } G.B.flash = { c: '#fff8c0', a: 0.55 }; await W(160); } await W(150); } },
    // --- Stein ---
    kieselhagel: { ms: 1000, fn: async (f, t) => { const [x1, y1] = center(t); for (let i = 0; i < 7; i++) P_({ x: x1 + rnd(-20, 20), y: y1 - 80 - i * 10, vy: 90, g: 520, floor: y1 + rnd(-2, 14), bounce: 1, life: 0.7 + i * 0.04, c: i % 2 ? '#c4ae88' : '#8a7e70', s: rnd(2, 3), k: 'chunk' }); await W(560); } },
    felsruf: { ms: 1200, fn: async (f, t) => { const [x1, y1] = center(t); G.B.shake = 3; await W(250); P_({ x: x1, y: y1 - 90, vy: 120, g: 700, floor: y1 + 4, life: 0.8, c: '#9a8a74', s: 12, k: 'chunk' }); await W(560); G.B.shake = 6; } },
    grenzwacht: { ms: 1200, fn: async (f, t) => { const [x, y] = center(f); for (let i = 0; i < 4; i++) { const xx = x - 24 + i * 16; P_({ x: xx, y: y + 26, vy: -60, life: 0.5, c: '#b8a88a', s: 5, k: 'chunk' }); ringAt(xx, y + 24, 3, 30, '#e8dcc0', 0.3, { flat: 1 }); await W(140); } glowAt(x, y, 26, 10, '#e8dcc0', 0.5); await W(300); } },
    menhirschlag: { ms: 1400, fn: async (f, t) => { const [x1, y1] = center(t); await An(500, p => { if (Math.random() < 0.5) P_({ x: x1 + rnd(-18, 18), y: y1 + 20, vx: rnd(-10, 10), vy: -20, k: 'fog', r: 5, dr: 10, life: 0.5, c: '#8a7e70', a: 0.4 }); }); P_({ x: x1, y: y1 + 30, vy: -260, g: 400, life: 0.5, c: '#a89878', s: 14, k: 'chunk' }); await W(350); G.B.shake = 7; } },
    // --- Psycho ---
    grabesruf: { ms: 1100, fn: async (f, t) => { const [x1, y1] = center(t); for (let i = 0; i < 3; i++) { P_({ x: x1 + rnd(-20, 20), y: y1 + 26, vy: -26, k: 'shade', r: 9, dr: 4, life: 0.9, c: '#5a4a7a', a: 0.6 }); await W(150); } ringAt(x1, y1, 30, -50, '#b894f0', 0.5); await W(350); } },
    nebelstoss: { ms: 900, fn: async (f, t) => { await fly(f, t, 420, (p, x, y) => { P_({ x, y, k: 'fog', r: 10, dr: 16, life: 0.4, c: '#c0b8e8', a: 0.5 }); }); const [x, y] = center(t); ringAt(x, y, 6, 110, '#e8e0ff', 0.3); } },
    nebelschleier: { ms: 1200, fn: async (f, t) => { const [x1, y1] = center(t); await An(900, p => { const x = Lp(x1 - 50, x1 + 50, p); P_({ x, y: y1 + rnd(-10, 10), vx: 20, k: 'fog', r: 14, dr: 8, life: 0.8, c: '#d8d4f0', a: 0.5 }); }); } },
    seufzer: { ms: 1000, fn: async (f, t) => { const [x0, y0] = center(f); await An(300, p => P_({ x: x0 + rnd(-6, 6), y: y0 - 8, vy: -20, k: 'mote', life: 0.4, c: '#b8c8ff' })); await fly(f, t, 480, (p, x, y) => P_({ x, y, k: 'streak', a: Math.sin(p * 12), l: 8, w: 1.2, life: 0.3, c: '#b8c8ff' }), 8, 5); } },
    wehmut: { ms: 1100, fn: async (f, t) => { const [x1, y1] = center(t); await An(800, p => { if (Math.random() < 0.6) P_({ x: x1 + rnd(-20, 20), y: y1 - 30, vy: 60, k: 'drop', s: 2, life: 0.5, c: '#8aa8e8' }); }); } },
    erinnerung: { ms: 1300, fn: async (f, t) => { const [x, y] = center(f); for (let i = 0; i < 3; i++) { P_({ x: x + rnd(-16, 16), y: y + rnd(-10, 10), k: 'frame', s: 10, life: 0.6, c: '#f0e0b0' }); await W(200); } await An(400, p => glowAt(x, y, 10 + p * 14, 0, '#fff0c0', 0.06)); } },
    irrweg: { ms: 1100, fn: async (f, t) => { const [x1, y1] = center(t); await An(800, p => { const a = p * 18, r = 8 + p * 22; P_({ x: x1 + Math.cos(a) * r, y: y1 + Math.sin(a) * r * 0.6, k: 'glow', r: 3.5, dr: -2, life: 0.3, c: '#c8a0ff' }); }); } },
    schattenschwinge: { ms: 1100, fn: async (f, t) => { const [x1, y1] = center(t); for (const s of [-1, 1]) { await An(260, p => P_({ x: x1 + s * Lp(-34, 34, p), y: y1 - 10 + Math.sin(p * 3.14) * 16, k: 'shade', r: 8, dr: -6, life: 0.3, c: '#3a2a5a', a: 0.8 })); streak(x1, y1, s * 0.7, 40, '#b894f0', { w: 2, life: 0.25 }); } await W(200); } },
    irrnebel: { ms: 1100, fn: async (f, t) => { const [x1, y1] = center(t); await An(800, p => { for (let i = 0; i < 2; i++) { const a = rnd(0, 6.28); P_({ x: x1 + Math.cos(a) * 26, y: y1 + Math.sin(a) * 16, vx: -Math.cos(a) * 16, vy: -Math.sin(a) * 10, k: 'fog', r: 8, dr: 6, life: 0.6, c: i ? '#c0a8f0' : '#e0d8f8', a: 0.45 }); } }); } },
    nebelwand: { ms: 1100, fn: async (f, t) => { const [x, y] = center(f), d = f === 'ally' ? 1 : -1; await An(800, p => { P_({ x: x + 26 * d, y: y + 26 - p * 56, k: 'fog', r: 10, dr: 4, life: 0.8, c: '#d8d4f0', a: 0.55 }); }); } },
    schleiersturz: { ms: 1300, fn: async (f, t) => { const [x1, y1] = center(t); await An(700, p => { for (let i = 0; i < 3; i++) P_({ x: x1 + (i - 1) * 16 + rnd(-3, 3), y: y1 - 60 + p * 60, k: 'streak', a: 1.57, l: 12, w: 3, life: 0.2, c: i === 1 ? '#e8e0ff' : '#9a80d8' }); }); ringAt(x1, y1, 8, 120, '#e8e0ff', 0.35); G.B.shake = 4; } },
    ahnenruf: { ms: 1800, fn: async (f, t) => { const [x1, y1] = center(t); G.B.dim = 0.4; for (let i = 0; i < 3; i++) { const x = x1 - 30 + i * 30; P_({ x, y: y1 - 40, vy: 14, k: 'shade', r: 12, dr: 0, life: 1.0, c: '#cfc0ff', a: 0.55 }); glowAt(x - 3, y1 - 42, 2, 0, '#ffffff', 0.9); glowAt(x + 3, y1 - 42, 2, 0, '#ffffff', 0.9); await W(220); } await W(400); G.B.flash = { c: '#e0d8ff', a: 0.45 }; } },
    // --- Boden ---
    schlammwurf: { ms: 900, fn: async (f, t) => { await fly(f, t, 500, (p, x, y) => { P_({ x, y, k: 'drop', s: 4, life: 0.12, c: '#6a5438' }); if (Math.random() < 0.4) P_({ x, y, vx: rnd(-20, 20), vy: 0, g: 300, k: 'drop', s: 2, life: 0.4, c: '#8a6e48' }); }, 34); } },
    torfwelle: { ms: 1400, fn: async (f, t) => { const [x1, y1] = center(t); await An(900, p => { const xw = Lp(x1 - 80, x1 + 10, p); for (let i = 0; i < 2; i++) P_({ x: xw + rnd(-6, 6), y: y1 + 24 - Math.sin(p * 3.14) * 22, vy: -30, g: 160, k: 'chunk', s: 3, life: 0.4, c: i ? '#5a4430' : '#7a6044' }); }); G.B.shake = 5; } },
    erdklumpen: { ms: 1000, fn: async (f, t) => { const [x0, y0] = center(f), [x1, y1] = center(t); P_({ x: x0, y: y0 + 20, vy: -140, g: 400, life: 0.3, c: '#7a6044', s: 7, k: 'chunk' }); await W(260); await fly(f, t, 380, (p, x, y) => P_({ x, y, life: 0.15, c: '#7a6044', s: 7, k: 'chunk' }), 20); } },
    // --- Gift ---
    schattenstaub: { ms: 1000, fn: async (f, t) => { const [x1, y1] = center(t); await An(700, p => { for (let i = 0; i < 2; i++) P_({ x: x1 + rnd(-24, 24), y: y1 + rnd(-20, 16), vx: rnd(-10, 10), vy: rnd(-12, -2), k: 'fog', r: rnd(4, 8), dr: 8, life: 0.7, c: i ? '#a068c8' : '#6a4a8a', a: 0.55 }); }); } },
    schattenbiss: { ms: 900, fn: async (f, t) => { const [x, y] = center(t); await An(380, p => { const g = 20 * (1 - p * p); for (let i = -2; i <= 2; i++) { P_({ x: x + i * 7, y: y - g, k: 'tooth', s: 4, up: 0, life: 0.06, c: '#c890ff' }); P_({ x: x + i * 7 + 3, y: y + g, k: 'tooth', s: 4, up: 1, life: 0.06, c: '#c890ff' }); } }); for (let i = 0; i < 6; i++) P_({ x: x + rnd(-8, 8), y, vy: 40, g: 80, k: 'drop', s: 2, life: 0.5, c: '#9a50d0' }); await W(150); } },
    aschestaub: { ms: 1000, fn: async (f, t) => { const [x1, y1] = center(t); await An(750, p => { P_({ x: x1 + rnd(-26, 26), y: y1 - 34, vx: rnd(-6, 6), vy: 30, life: 0.8, c: Math.random() < 0.5 ? '#8a8490' : '#5a5460', s: 1.5, k: 'spark' }); }); } },
    giftschlamm: { ms: 1100, fn: async (f, t) => { await fly(f, t, 520, (p, x, y) => { P_({ x, y, k: 'drop', s: 5, life: 0.12, c: '#7a3aa0' }); P_({ x: x + rnd(-4, 4), y, vy: -20, k: 'ring', r: 2, dr: 6, life: 0.4, c: '#c890ff' }); }, 28); const [x, y] = center(t); for (let i = 0; i < 5; i++) P_({ x: x + rnd(-16, 16), y: y + rnd(0, 14), vy: -18, k: 'ring', r: 1.5, dr: 8, life: 0.6, c: '#c890ff' }); await W(200); } },
    // --- Kampf ---
    klammgriff: { ms: 1100, fn: async (f, t) => { const [x1, y1] = center(t); for (const s of [-1, 1]) P_({ x: x1 + s * 40, y: y1, vx: -s * 150, life: 0.26, c: '#c8f0ff', s: 6, k: 'chunk' }); await W(280); for (let i = 0; i < 8; i++) P_({ x: x1 + rnd(-12, 12), y: y1 + rnd(-12, 12), vy: -10, k: 'streak', a: rnd(0, 6.28), l: 5, w: 1.2, life: 0.5, c: '#dff6ff' }); await W(300); } },
    prankenhieb: { ms: 800, fn: async (f, t) => { const [x, y] = center(t); for (let i = 0; i < 4; i++) { streak(x - 9 + i * 6, y + 2, 1.1, 32, '#ffd0a0', { w: 3, life: 0.3 }); } await W(160); ringAt(x, y, 4, 130, '#ffd0a0', 0.3); await W(200); } },
    grimmstoss: { ms: 1100, fn: async (f, t) => { const a = selfA(f), d = f === 'ally' ? 1 : -1, [x0, y0] = center(f); await An(260, p => { a.dx = -p * 10 * d; glowAt(x0, y0, 14, 0, '#ff7050', 0.05); }); await An(220, p => { a.dx = Lp(-10, 50, p) * d; }); a.dx = 0; const [x, y] = center(t); ringAt(x, y, 4, 170, '#ffb090', 0.3); ringAt(x, y, 2, 110, '#ff7050', 0.4); G.B.shake = 6; await W(200); } },
    ahnenstoss: { ms: 1300, fn: async (f, t) => { const [x0, y0] = center(f); P_({ x: x0, y: y0, k: 'shade', r: 18, dr: 6, life: 0.6, c: '#e8d8b8', a: 0.5 }); await W(300); await fly(f, t, 360, (p, x, y) => { P_({ x, y, k: 'shade', r: 14, dr: -8, life: 0.25, c: '#e8d8b8', a: 0.5 }); glowAt(x, y, 6, -4, '#ffe0b0', 0.2); }); G.B.shake = 5; } },
  };
  G.Battle.MOVE_FX = MOVE_FX;
  // kompletter Treffer: Anflug, Einschlag, Klang, Schütteln, Blitz bei Volltreffer / sehr wirksam
  async function attackFx(type, from, to, crit, eff, id) {
    const mf = id && MOVE_FX[id];
    if (mf) { const t0 = performance.now(); await mf.fn(from, to); G.Battle.lastFx = { id, ms: performance.now() - t0 }; } else await travel(type, from, to);
    const [x, y] = center(to), B = G.B;
    // Wirksamkeit: Pop-up direkt im Einschlag (kein Textfenster, keine Wartezeit)
    if (eff === 0) { burst(x, y, 'Nebel', 10); Snd().sfx('immune'); effPop(to, 'Hat keine Wirkung …', 'im'); return; }
    burst(x, y, type, eff < 1 ? 12 : eff > 1 ? 32 : 22); Snd().sfx('hit_' + type, null, eff < 1 ? 0.55 : 1);
    if (eff > 1) effPop(to, 'Sehr effektiv!', 'se'); else if (eff < 1) effPop(to, 'Nicht sehr effektiv …', 'nv');   // auch Neutral gegen Stein (½×)
    if (crit || eff > 1) { B.flash = { c: (TYPE_FX[type] || TYPE_FX.Seele).s === 'Schatten' ? TYPE_FX[type].c : (TYPE_FX[type] || TYPE_FX.Seele).c2, a: crit ? 0.6 : 0.42 }; B.shake = Math.max(B.shake || 0, crit ? 6 : 4.5); Snd().sfx(crit ? 'crit' : 'super'); }
    else if (eff < 1) Snd().sfx('weak');
  }
  // schwebender Wirksamkeits-Text über dem Ziel: poppt auf, hält kurz, verblasst (CSS, blockiert den Kampf nicht)
  function effPop(side, text, cls) {
    const scr = document.getElementById('screen'); if (!scr) return;
    let el = document.getElementById('effpop'); if (!el) { el = document.createElement('div'); el.id = 'effpop'; scr.appendChild(el); }
    const [x, y] = center(side);
    el.className = ''; void el.offsetWidth; el.textContent = text; el.className = 'show ' + cls;
    el.style.left = `calc(var(--u) * ${x})`; el.style.top = `calc(var(--u) * ${y - 30})`;
    G.Battle.lastPop = { text, cls, side, t: performance.now() };
    clearTimeout(effPop.tm); effPop.tm = setTimeout(() => { el.className = ''; }, 1400);
  }
  G.Battle.fx = { attackFx: (...a) => attackFx(...a), burst: (...a) => burst(...a), travel: (...a) => travel(...a) };
  function renderParts(ctx, dt) {
    const B = G.B, ps = B.parts, sm = ctx.imageSmoothingEnabled;
    ctx.imageSmoothingEnabled = true;
    for (let i = ps.length - 1; i >= 0; i--) {
      const p = ps[i]; p.life -= dt; if (p.life <= 0) { ps.splice(i, 1); continue; }
      const k = p.life / p.max; p.vy += (p.g || 0) * dt; p.x += p.vx * dt; p.y += p.vy * dt;
      if (p.floor != null && p.y > p.floor) { p.y = p.floor; if (p.bounce) { p.vy *= -0.35; p.vx *= 0.6; p.bounce = 0; } else { p.vy = 0; p.vx *= 0.2; p.g = 0; p.flat = 1; } }
      if (p.dr) p.r = Math.max(0.5, p.r + p.dr * dt);
      switch (p.k) {
        case 'spark': ctx.globalCompositeOperation = 'lighter'; ctx.globalAlpha = Math.min(1, k * 2) * (0.6 + Math.random() * 0.4); ctx.fillStyle = p.c; ctx.fillRect(p.x, p.y, p.s, p.s); break;
        case 'mote': ctx.globalCompositeOperation = 'lighter'; ctx.globalAlpha = Math.sin(k * Math.PI) * 0.8; ctx.drawImage(glowSpr(p.c), p.x - 3, p.y - 3, 6, 6); ctx.fillStyle = '#ffffff'; ctx.fillRect(p.x - 0.25, p.y - 0.25, 0.5, 0.5); break;
        case 'streak': { ctx.globalCompositeOperation = 'lighter'; ctx.globalAlpha = Math.min(1, k * 2.2); ctx.strokeStyle = p.c; ctx.lineWidth = (p.w || 2) * (0.4 + 0.6 * k); ctx.lineCap = 'round';
          const l = (p.l || 10) * (p.grow === false ? 1 : Math.min(1, (1 - k) * 4 + 0.2)), dx = Math.cos(p.a || 0) * l / 2, dy = Math.sin(p.a || 0) * l / 2; ctx.beginPath(); ctx.moveTo(p.x - dx, p.y - dy); ctx.lineTo(p.x + dx, p.y + dy); ctx.stroke(); break; }
        case 'tooth': ctx.globalCompositeOperation = 'source-over'; ctx.globalAlpha = 1; ctx.fillStyle = p.c; ctx.beginPath(); if (p.up) { ctx.moveTo(p.x - p.s / 2, p.y); ctx.lineTo(p.x + p.s / 2, p.y); ctx.lineTo(p.x, p.y - p.s * 1.3); } else { ctx.moveTo(p.x - p.s / 2, p.y); ctx.lineTo(p.x + p.s / 2, p.y); ctx.lineTo(p.x, p.y + p.s * 1.3); } ctx.fill(); break;
        case 'feather': ctx.globalCompositeOperation = 'source-over'; ctx.globalAlpha = Math.min(1, k * 2); ctx.fillStyle = p.c; ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.a || 0); ctx.beginPath(); ctx.ellipse(0, 0, p.s, p.s * 0.35, 0, 0, 6.283); ctx.fill(); ctx.restore(); break;
        case 'frame': ctx.globalCompositeOperation = 'lighter'; ctx.globalAlpha = Math.sin(k * Math.PI) * 0.8; ctx.strokeStyle = p.c; ctx.lineWidth = 1; ctx.strokeRect(p.x - p.s / 2, p.y - p.s * 0.4, p.s, p.s * 0.8); ctx.fillStyle = p.c; ctx.globalAlpha *= 0.25; ctx.fillRect(p.x - p.s / 2, p.y - p.s * 0.4, p.s, p.s * 0.8); break;
        case 'glow': ctx.globalCompositeOperation = 'lighter'; ctx.globalAlpha = k * 0.9; ctx.drawImage(glowSpr(p.c), p.x - p.r, p.y - p.r, p.r * 2, p.r * 2); break;
        case 'fog': ctx.globalCompositeOperation = 'source-over'; ctx.globalAlpha = Math.sin(k * Math.PI) * (p.a || 0.4); ctx.drawImage(glowSpr(p.c), p.x - p.r, p.y - p.r, p.r * 2, p.r * 2); break;
        case 'shade': ctx.globalCompositeOperation = 'source-over'; ctx.globalAlpha = Math.sin(k * Math.PI) * (p.a || 0.5); ctx.drawImage(glowSpr(p.c), p.x - p.r, p.y - p.r, p.r * 2, p.r * 2); break;
        case 'drop': ctx.globalCompositeOperation = 'source-over'; ctx.globalAlpha = Math.min(1, k * 3); ctx.fillStyle = p.c; if (p.flat) ctx.fillRect(p.x - p.s, p.y, p.s * 2, 0.5 * p.s); else ctx.fillRect(p.x - p.s / 2, p.y - p.s / 2, p.s, p.s); break;
        case 'chunk': ctx.globalCompositeOperation = 'source-over'; ctx.globalAlpha = Math.min(1, k * 3); ctx.fillStyle = '#2a241e'; ctx.fillRect(p.x - p.s / 2 - 0.5, p.y - p.s / 2 - 0.5, p.s + 1, p.s + 1); ctx.fillStyle = p.c; ctx.fillRect(p.x - p.s / 2, p.y - p.s / 2, p.s, p.s); ctx.fillStyle = 'rgba(255,245,230,0.5)'; ctx.fillRect(p.x - p.s / 2, p.y - p.s / 2, p.s / 2, 0.5); break;
        case 'leaf': { ctx.globalCompositeOperation = 'source-over'; ctx.globalAlpha = Math.min(1, k * 2); p.x += Math.sin(G.time * 7 + p.ph) * 18 * dt; ctx.fillStyle = p.c; const w = Math.abs(Math.sin(G.time * 6 + p.ph)) * 1.5 + 0.5; ctx.fillRect(p.x - w / 2, p.y, w, 1); break; }
        case 'ring': ctx.globalCompositeOperation = 'lighter'; ctx.globalAlpha = k * 0.8; ctx.strokeStyle = p.c; ctx.lineWidth = 1.25; ctx.beginPath(); ctx.ellipse(p.x, p.y, p.r, p.flat ? p.r * 0.3 : p.r, 0, 0, 6.283); ctx.stroke(); break;
        default: ctx.globalCompositeOperation = 'lighter'; ctx.globalAlpha = Math.min(1, p.life * 2); ctx.fillStyle = p.c; ctx.fillRect(Math.round(p.x), Math.round(p.y), p.s, p.s);
      }
    }
    ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over'; ctx.imageSmoothingEnabled = sm;
  }

  const sideMon = side => side === 'ally' ? G.state.team[G.B.allyIdx] : G.B.enemy;
  const other = side => side === 'ally' ? 'enemy' : 'ally';
  const anim = side => side === 'ally' ? G.B.aa : G.B.ea;
  const center = side => side === 'ally' ? [72, 124] : [186, 66];
  function label(side) {
    const B = G.B;
    if (side === 'ally') return G.nm(sideMon('ally'));
    if (B.boss) return G.nm(B.enemy);
    if (B.tr) return `${G.genitive(B.tr.name)} ${G.nm(B.enemy)}`;
    return `${G.art(B.enemy.sp, 'def').toLowerCase()} ${G.nm(B.enemy)}`;
  }
  const fmt = (s, side) => s.replace('{n}', cap(label(side)));

  // ---------- Start ----------
  G.Battle.trainer = async (id) => {
    const tr = G.TRAINERS[id], S = G.state;
    const team = G.trainerTeam(id).map(([sp, l]) => {
      const m = G.makeMon(sp, l);
      if (G.SPECIES[sp].boss) { m.moves = [...new Set(G.SPECIES[sp].learn.filter(([ll]) => ll <= l).map(x => x[1]))]; G.fillPP(m); }
      if (tr.hpMult) m.hpMult = tr.hpMult;
      if (tr.hpMultFor && tr.hpMultFor[sp]) m.hpMult = tr.hpMultFor[sp];
      if (tr.phases && tr.phases[sp]) { m.phases = tr.phases[sp]; m.phase = 0; }
      m.hp = G.stats(m).hp; return m;
    });
    G.lock++; // bis nach der Belohnung gesperrt halten
    const r = await G.Battle.start({ team, trainer: id });
    if (r === 'won') {
      S.flags['t_' + id] = 1; G.World.afterTrainer(id);
      for (const k in tr.reward) await G.giveItem(k, tr.reward[k]);
      if (id === 'kaspar' && S.flags.q1 < 5) S.flags.q1 = 5;
      if (id === 'nebelahn') {
        S.flags.q1 = Math.max(S.flags.q1 || 0, 6);
        await UI().sayAll(['Zwischen den Steinen regt sich Jorin. Er blinzelt, als sähe er zum ersten Mal Licht.',
          'Jorin: … Ich wollte nur ihr Licht sehen. Einmal noch. Ich hab nicht gemerkt, wie kalt es wird.',
          'Jorin: Das ist ihre Laterne. Marens Laterne. Trägst du sie für mich? Meine Hände zittern noch.',
          'Jorin: Geh du voraus. Ich finde den Weg nach Hause – jetzt, wo es wieder Licht gibt. Wir treffen uns bei Ilse.']);
      }
      UI().hideText();
      G.save(true);
    }
    G.lock--;
    return r;
  };

  G.Battle.start = async (opts) => {
    const S = G.state; G.lock++;
    const tr = opts.trainer ? G.TRAINERS[opts.trainer] : null;
    // Begegnungs-Stinger zur Blitz-/Wisch-Überblendung; die Kampfmusik setzt erst danach ein
    Snd().music('none'); Snd().sfx(opts.rare ? 'enc_rare' : tr && (tr.boss || tr.music) ? 'enc_boss' : tr ? 'enc_trainer' : 'enc_wild');
    await G.animate(520, p => G.fx = { kind: 'flash', p });
    await G.animate(420, p => G.fx = { kind: 'wipe', p });
    const B = G.B = {
      team: opts.team, eIdx: 0, enemy: opts.team[0], trainer: opts.trainer || null, tr, boss: !!(tr && tr.boss),
      noCatch: !!tr, noFlee: !!tr, hear: !!opts.hear, rare: !!opts.rare, allyIdx: Math.max(0, S.team.findIndex(m => m.hp > 0)),
      st: { ally: freshStages(), enemy: freshStages() }, part: new Set(), ea: newAnim(), aa: newAnim(), parts: [], lantern: null, flee: 0
    };
    B.part.add(B.allyIdx); B.bgKind = B.boss ? 'boss' : bgKindAt();
    B.ea.dx = 150; B.aa.dx = -150; if (B.hear) { B.ea.dx = 0; B.ea.alpha = 0; }
    G.mode = 'battle';
    Snd().music(tr && tr.music ? tr.music : tr && tr.boss ? 'boss' : tr ? 'trainer' : 'battle');
    await G.animate(420, p => G.fx = { kind: 'wipe', p: 1 - p }); G.fx = null;
    await G.animate(520, p => { if (!B.hear) B.ea.dx = (1 - ease(p)) * 150; B.aa.dx = -(1 - ease(p)) * 150; });
    const en = B.enemy;
    if (B.hear) {
      await UI().say('Der Nebel ist hier so dicht, dass du nichts siehst. Du hörst nur ein leises Rascheln …');
      await G.animate(700, p => B.ea.alpha = p);
    }
    S.seen[en.sp] = 1;
    UI().updateHud(); UI().hud(true);
    if (B.boss) await UI().say(`${G.nm(en)}, ${tr.title}, erhebt sich aus dem Nebelsee!`);
    else if (tr) { await UI().say(tr.callers ? `${tr.title} fordert dich heraus: ${tr.name}!` : `${tr.title} ${tr.name} fordert dich heraus!`); await UI().say(`${tr.callers ? tr.callers[0] : tr.name} ruft ${G.nm(en)}!`); }
    else if (B.rare) { await rareShimmer(); await UI().say(`Ein seltener Geist! ${G.art(en.sp, 'wild')} ${G.nm(en)} erscheint in einem Schimmer aus Licht!`); }
    else await UI().say(B.hear ? `Es ist ${G.art(en.sp, 'wild').toLowerCase()} ${G.nm(en)}!` : `${G.art(en.sp, 'wild')} ${G.nm(en)} gleitet aus dem Nebel!`);
    await UI().say(`Los, ${G.nm(S.team[B.allyIdx])}!`);
    if (!tr && G.flag('story') === 2) await UI().sayAll(['Ilse (flüsternd): Ruhig … Schwäch den Geist zuerst mit einer Attacke – aber nicht zu fest.',
      'Ilse: Wird seine Lebensleiste gelb oder rot, öffne die «Tasche» und wirf einen Seelenfänger.']);
    let result;
    try { result = await loop(); } catch (e) { console.error(e); result = 'fled'; }
    if (result === 'won' && tr) {
      if (B.boss) { Snd().music('none'); Snd().sfx('bell'); Snd().jingle('bosswin'); }
      await UI().sayAll(tr.lose);
    }
    // v18: Münzen für jeden gewonnenen Kampf (auch wenn der Geist gefangen wurde)
    if ((result === 'won' || result === 'caught') && G.battleMoney) {
      const n = G.battleMoney(B.team, tr, B.rare); S.money = (S.money || 0) + n; G.lastMoney = n;
      Snd().sfx('pickup'); await UI().say(`Du erhältst ${n} ${G.CURRENCY}.`);
    }
    if (result === 'lost') await UI().sayAll(['Alle deine Geister sind erschöpft …', S.respawn && S.respawn.church && G.CHURCHES && G.CHURCHES[S.respawn.church] ? `Du erwachst in der ${G.CHURCHES[S.respawn.church].name}. ${G.CHURCHES[S.respawn.church].healer.name} hat deine Geister im Mondlicht gepflegt.` : S.respawn ? 'Du taumelst zurück zur letzten Laterne, die du entzündet hast.' : 'Mit letzter Kraft taumelst du zurück nach Hause.']);
    await G.animate(420, p => G.fx = { kind: 'wipe', p });
    UI().hud(false); UI().hideText(); G.B = null; G.mode = 'world';
    for (const m of S.team) if (m.status && !G.STATUS[m.status.id].persist) m.status = null;
    if (result === 'lost') {
      G.healTeam();
      const r = S.respawn;
      if (r) G.World.setMap(r.map, r.x, r.y, 'down'); else G.World.setMap('home', 6, 2, 'down');
    } else Snd().music(G.World.areaMusic());
    await G.animate(420, p => G.fx = { kind: 'wipe', p: 1 - p }); G.fx = null;
    await G.Evo.checkAll();
    G.save(true);
    G.lock--;
    // Schonfrist nach Kampf, Flucht oder Fang: die nächsten Nebelschritte lösen keine Begegnung aus
    if (G.P) G.P.grace = Math.max(G.P.grace, G.ENCOUNTER_GRACE || 5);
    G.lastBattle = result;
    return result;
  };

  // Wirksamkeits-Hinweis im Attacken-Menü (immer sichtbar – der Gegner-Typ steht ohnehin im Kampf-HUD); nur bei ≠ 1× (Status-Attacken: nichts)
  function effHint(id, en) {
    const M = G.MOVES[id]; if (!M || !M.power || !en) return null;
    const e = G.eff(M.type, en.sp);
    return e === 0 ? { cls: 'im', t: '✕', e } : e > 1 ? { cls: 'se', t: '▲', e } : e < 1 ? { cls: 'nv', t: '▼', e } : null;
  }
  G.Battle.effHint = effHint;
  async function loop() {
    const S = G.state, B = G.B;
    let last = 0;
    while (true) {
      const al = S.team[B.allyIdx];
      UI().setText(`Was soll ${G.nm(al)} tun?`, true);
      const c = await UI().choose([{ label: 'Kampf' }, { label: 'Tasche' }, { label: 'Team' }, { label: 'Flucht', disabled: false }], { cols: 2, area: 'battle', start: last });
      last = c;
      let r = null;
      if (c === 0) {
        UI().hideText();
        const usable = al.moves.filter(id => (al.pp[id] || 0) > 0);
        let id;
        if (!usable.length) { await UI().say(`${G.nm(al)} hat keine Kraft mehr für Attacken!`); id = 'letzterhauch'; }
        else {
          const opts = al.moves.map(id => { const M = G.MOVES[id], h = effHint(id, B.enemy); return { label: M.name, sub: `${M.type} · AP ${al.pp[id] || 0}/${M.pp}${h ? ` <b class="eh ${h.cls}">${h.t}</b>` : ''}`, color: G.TYPE_COLORS[M.type], disabled: !(al.pp[id] > 0) }; });
          // v17: Info-Leiste zur gewählten Attacke (Typ, Stärke, Genauigkeit, AP, eine Zeile Beschreibung)
          const info = i => { const el = document.getElementById('mvinfo'); if (el) el.innerHTML = G.moveInfoHtml(al.moves[i], al.pp[al.moves[i]] || 0, B.enemy); };
          const st0 = Math.max(0, al.moves.indexOf(B.lastMove));
          const mv = await UI().choose(opts, { cols: 2, area: 'moves', cancel: true, inspect: true, start: st0, title: '<div id="mvinfo" class="mvinfo"></div>', onHighlight: info });
          if (mv < 0) continue;
          B.lastMove = al.moves[mv];
          id = al.moves[mv];
        }
        r = await round(id);
      } else if (c === 1) {
        UI().hideText();
        const it = await G.Menu.bag({ battle: true });
        if (!it) continue;
        const I = G.ITEMS[it];
        if (I.kind === 'catch') {
          if (B.noCatch) { await UI().say(B.boss ? 'Nebelahn lässt sich von keinem Licht halten. Nicht so.' : 'Dieser Geist folgt bereits einem anderen Licht.'); continue; }
          if (await throwLantern(it)) return 'caught';
          r = await enemyOnly();
        } else {
          const idx = await G.Menu.teamPicker({ battle: true, item: it });
          if (idx < 0) continue;
          const res = G.useItem(it, S.team[idx]);
          if (!res.ok) { await UI().say(res.msg); continue; }
          G.state.items[it]--; Snd().sfx('heal'); UI().updateHud();
          await UI().say(`Du benutzt ${I.name}. ${res.msg}`);
          if (idx === B.allyIdx && I.kind === 'revive') { /* aktiver kann nicht erschöpft sein */ }
          r = await enemyOnly();
        }
      } else if (c === 2) {
        UI().hideText();
        const idx = await G.Menu.teamPicker({ battle: true });
        if (idx < 0) continue;
        if (idx === B.allyIdx) { await UI().say(`${G.nm(al)} kämpft bereits!`); continue; }
        if (S.team[idx].hp <= 0) { await UI().say(`${G.nm(S.team[idx])} ist zu erschöpft zum Kämpfen.`); continue; }
        await switchTo(idx);
        r = await enemyOnly();
      } else {
        if (B.noFlee) { await UI().say(B.boss ? 'Der Nebel hält dich fest. Hier gibt es kein Zurück.' : 'Aus einem Beschwörerkampf gibt es kein Entkommen!'); continue; }
        const a = G.stats(al).spd, e = G.stats(B.enemy).spd; B.flee++;
        const p = Math.min(0.95, 0.45 + 0.3 * (a / e) + 0.12 * (B.flee - 1));
        if (Math.random() < p) { await UI().say('Du ziehst dich leise in den Nebel zurück.'); return 'fled'; }
        await UI().say('Der Nebel lässt dich nicht los!');
        r = await enemyOnly();
      }
      if (r === 'won' || r === 'lost') return r;
    }
  }

  // ---------- Gegner-KI ----------
  async function enemyChoice() {
    const B = G.B, en = B.enemy, al = G.state.team[B.allyIdx];
    const has = id => en.moves.includes(id) && (en.pp[id] || 0) > 0;
    if (B.boss) {
      const f = en.hp / G.stats(en).hp;
      if (f > 0.5) {
        if (!B.bossWall && has('nebelwand') && Math.random() < 0.35) { B.bossWall = 1; return 'nebelwand'; }
        if (!al.status) { const o = ['irrnebel', 'moorkaelte'].filter(has); if (o.length) return o[G.rnd(0, o.length - 1)]; }
        const o = ['irrnebel', 'schleiersturz', 'moorkaelte'].filter(has); if (o.length) return o[G.rnd(0, o.length - 1)];
      } else {
        if (!B.phase2) { B.phase2 = 1; Snd().sfx('bell'); await UI().say('Der Nebel zieht sich zusammen …'); }
        if (has('ahnenruf') && Math.random() < 0.5) return 'ahnenruf';
        if (has('schleiersturz')) return 'schleiersturz';
      }
    }
    const w = en.moves.filter(has).map(id => {
      const M = G.MOVES[id], mx = G.stats(en).hp;
      if (M.heal) return [id, en.hp < mx * 0.5 ? 40 : 0.01];
      if (M.protect) return [id, B.lastProtect && B.lastProtect.enemy ? 0.01 : en.hp < mx * 0.35 ? 18 : 5];
      if (M.status && !M.power) return [id, al.status || G.STATUS[M.status.id].immune.some(t => G.hasType(al.sp, t)) ? 0.01 : 22];
      if (!M.power) { const e = M.effect, st = B.st[e.who === 'self' ? 'enemy' : 'ally'][e.stat]; return [id, (e.n > 0 && st >= 2) || (e.n < 0 && st <= -2) ? 0.5 : 14]; }
      const hits = M.hits ? (M.hits[0] + M.hits[1]) / 2 : 1;
      return [id, M.power * hits * (M.acc / 100) * G.eff(M.type, al.sp) * (G.hasType(en.sp, M.type) ? 1.5 : 1) * (M.recoil ? 0.85 : 1) * (M.prio && al.hp < G.stats(al).hp * 0.25 ? 1.6 : 1)];
    });
    return w.length ? G.pickWeighted(w) : 'letzterhauch';
  }

  // v17: Priorität (Abwehr +3, Erstschlag +1), sonst Initiative
  const prioOf = id => { const M = G.MOVES[id]; return M ? (M.protect ? 3 : (M.prio || 0)) : 0; };
  G.Battle.prioOf = prioOf;
  async function round(id) {
    const al = G.state.team[G.B.allyIdx], en = G.B.enemy;
    const a = G.stats(al).spd, e = G.stats(en).spd;
    const eid = await enemyChoice();
    const pa = prioOf(id), pe = prioOf(eid);
    const allyFirst = pa !== pe ? pa > pe : (a > e || (a === e && Math.random() < 0.5));
    const seq = allyFirst ? ['ally', 'enemy'] : ['enemy', 'ally'];
    G.Battle.lastOrder = { seq, ids: { ally: id, enemy: eid } };
    for (const side of seq) {
      await useMove(side, side === 'ally' ? id : eid);
      const r = await checkFaint(); if (r) return r;
    }
    return await endOfRound();
  }
  async function enemyOnly() {
    await useMove('enemy', await enemyChoice());
    const r = await checkFaint(); if (r) return r;
    return await endOfRound();
  }
  const DOT_FX = { klamm: 'Moor', brand: 'Feuer', gift: 'Gift' };
  async function endOfRound() {
    const B = G.B;
    // Abwehr gilt nur für die laufende Runde; wer sie gerade benutzt hat, kann sie nicht zuverlässig wiederholen
    B.lastProtect = { ally: B.protect && B.protect.ally ? 1 : 0, enemy: B.protect && B.protect.enemy ? 1 : 0 }; B.protect = null;
    for (const side of ['ally', 'enemy']) {
      const m = sideMon(side), S = m && m.status && G.STATUS[m.status.id];
      if (m && m.hp > 0 && S && S.dot) {
        const d = Math.max(1, Math.floor(G.stats(m).hp * S.dot));
        m.hp = Math.max(0, m.hp - d); UI().updateHud();
        const [x, y] = center(side); burst(x, y, DOT_FX[m.status.id] || 'Moor', 10);
        await UI().say(fmt(S.msgTick, side));
        const r = await checkFaint(); if (r) return r;
      }
    }
    return null;
  }

  async function tryStatus(side, sid, pure) {
    const m = sideMon(side), S = G.STATUS[sid];
    if (!m || m.hp <= 0) return;
    if (m.status) { if (pure) await UI().say('Es passiert nichts weiter.'); return; }
    if (S.immune.some(t => G.hasType(m.sp, t))) { if (pure) await UI().say(`${cap(label(side))} ist dagegen immun.`); return; }
    m.status = { id: sid, turns: S.turns ? G.rnd(S.turns[0], S.turns[1]) : 0 };
    UI().updateHud(); Snd().sfx('status');
    await UI().say(fmt(S.msgOn, side));
  }
  // Werte-Stufe ändern (Status-Attacke oder Zusatzeffekt)
  async function stageChange(tgt, e, quiet) {
    const st = G.B.st[tgt], n = e.n;
    if ((n > 0 && st[e.stat] >= 3) || (n < 0 && st[e.stat] <= -3)) { if (!quiet) await UI().say('Es passiert nichts weiter.'); return; }
    st[e.stat] = Math.max(-3, Math.min(3, st[e.stat] + n));
    const [x, y] = center(tgt); ringAt(x, y, n > 0 ? 4 : 24, n > 0 ? 70 : -40, n > 0 ? '#c8f0ff' : '#ffb0b0', 0.4); Snd().sfx('status');
    await UI().say(`Die ${G.STAT_NAMES[e.stat]} von ${G.nm(sideMon(tgt))} ${n > 0 ? (n > 1 ? 'steigt stark' : 'steigt') : 'sinkt'}!`);
  }
  const HEAL_TXT = { erinnerung: 'erinnert sich an bessere Tage und schöpft Kraft.', waldsegen: 'wird vom Wald gesegnet.', morgentau: 'sammelt Morgentau und erholt sich.',
    suhlen: 'suhlt sich im Schlamm und erholt sich.', wiedergeburt: 'steigt aus der eigenen Asche neu auf.' };

  async function useMove(side, id) {
    const B = G.B, atk = sideMon(side), def = sideMon(other(side)), M = G.MOVES[id];
    const aA = anim(side), dA = anim(other(side)), dir = side === 'ally' ? 1 : -1;
    // Schlaf: kein Zug, bis der Geist aufwacht
    if (atk.status && atk.status.id === 'schlaf') {
      atk.status.turns--;
      if (atk.status.turns < 0) { atk.status = null; UI().updateHud(); await UI().say(fmt(G.STATUS.schlaf.msgOff, side)); }
      else { const [x, y] = center(side); P_({ x: x + 10, y: y - 20, vy: -20, k: 'mote', life: 0.8, c: '#c8d0ff' }); await UI().say(fmt(G.STATUS.schlaf.msgTick, side)); return; }
    }
    // Verirrt: Zug kann im Nebel verfliegen
    if (atk.status && atk.status.id === 'verirrt') {
      atk.status.turns--;
      if (atk.status.turns < 0) { atk.status = null; UI().updateHud(); await UI().say(fmt(G.STATUS.verirrt.msgOff, side)); }
      else if (Math.random() < G.STATUS.verirrt.skip) { await UI().say(fmt(G.STATUS.verirrt.msgTick, side)); return; }
    }
    await UI().say(`${cap(label(side))} setzt ${M.name} ein!`);
    if (!M.fallback && atk.pp[id] > 0) atk.pp[id]--;
    // Abwehr (Einrollen, Blattschirm, Gischtschild): wehrt in dieser Runde alles ab; direkt wiederholt nur mit 50 %
    if (M.protect) {
      if (B.lastProtect && B.lastProtect[side] && Math.random() < 0.5) { await UI().say('Aber es misslingt!'); return; }
      if (MOVE_FX[id]) await MOVE_FX[id].fn(side, other(side));
      B.protect = Object.assign(B.protect || {}, { [side]: 1 }); Snd().sfx('status');
      await UI().say(`${cap(label(side))} schützt sich!`); return;
    }
    await G.animate(220, p => { aA.dx = Math.sin(p * Math.PI) * 14 * dir; aA.dy = -Math.sin(p * Math.PI) * 4; });
    const selfOnly = M.heal || (!M.power && !M.status && M.effect && M.effect.who === 'self');
    if (!selfOnly && B.protect && B.protect[other(side)]) { const [x, y] = center(other(side)); ringAt(x, y, 30, -20, '#e8f6ff', 0.4); await UI().say(`${cap(label(other(side)))} wehrt die Attacke ab!`); return; }
    const acc = M.acc * accMult(B.st[side].acc);
    if (!M.sure && !selfOnly && !G.debugHit && Math.random() * 100 >= acc) { await UI().say('Daneben! Die Attacke verfliegt im Nebel.'); return; }
    if (M.heal) {
      const mx = G.stats(atk).hp;
      if (atk.hp >= mx) { await UI().say('Aber die LP sind bereits voll.'); return; }
      atk.hp = Math.min(mx, atk.hp + Math.floor(mx * M.heal)); UI().updateHud();
      if (MOVE_FX[id]) await MOVE_FX[id].fn(side, other(side));
      const [x, y] = center(side); burst(x, y, 'Seele', 18); Snd().sfx('heal');
      await UI().say(`${cap(label(side))} ${HEAL_TXT[id] || 'schöpft neue Kraft.'}`); return;
    }
    if (!M.power) {
      if (M.status) { if (MOVE_FX[id]) await MOVE_FX[id].fn(side, other(side)); else await travel(M.type, side, other(side)); const [x, y] = center(other(side)); burst(x, y, M.type, 14); Snd().sfx('hit_' + M.type); return tryStatus(other(side), M.status.id, true); }
      const tgt = M.effect.who === 'self' ? side : other(side);
      if (MOVE_FX[id]) await MOVE_FX[id].fn(side, other(side));
      const [x, y] = center(tgt); burst(x, y, M.type, 14);
      return stageChange(tgt, M.effect);
    }
    const as = G.stats(atk), ds = G.stats(def);
    const A = as.atk * stageMult(B.st[side].atk), Dd = ds.def * stageMult(B.st[other(side)].def);
    const stab = G.hasType(atk.sp, M.type) ? 1.5 : 1, eff = G.eff(M.type, def.sp);
    const nHits = M.hits ? G.rnd(M.hits[0], M.hits[1]) : 1, critP = M.crit || 1 / 16;
    let total = 0, anyCrit = false, done = 0;
    for (let h = 0; h < nHits && def.hp > 0; h++) {
      const crit = !G.debugNoCrit && Math.random() < critP; anyCrit = anyCrit || crit;
      let dmg = Math.floor(((2 * atk.lvl / 5 + 2) * M.power * A / Dd) / 50 + 2);
      dmg = eff === 0 ? 0 : Math.max(1, Math.floor(dmg * stab * eff * (crit ? 1.5 : 1) * (0.85 + Math.random() * 0.15)));
      if (h === 0) await attackFx(M.type, side, other(side), crit, eff, id);
      else { const [x, y] = center(other(side)); burst(x, y, M.type, 12); Snd().sfx('hit_' + M.type, null, 0.7); if (crit) { B.flash = { c: '#ffffff', a: 0.4 }; B.shake = 5; } }
      def.hp = Math.max(0, def.hp - dmg); total += dmg; done++; UI().updateHud();
      await G.animate(h === nHits - 1 ? 420 : 240, p => { dA.flash = Math.floor(p * 8) % 2 === 0 ? 1 : 0; dA.dx = Math.sin(p * 40) * 3 * (1 - p); });
      dA.flash = 0; dA.dx = 0;
      if (eff === 0) break;
    }
    G.Battle.lastHit = { id, hits: done, dmg: total, crit: anyCrit };
    if (M.hits && eff !== 0) await UI().say(`${done} Treffer!`);
    if (anyCrit && total) await UI().say(M.hits ? 'Mit Volltreffer!' : 'Ein Volltreffer!');
    if (M.drain && total) { atk.hp = Math.min(as.hp, atk.hp + Math.max(1, Math.floor(total * M.drain))); UI().updateHud(); await UI().say(`${cap(label(side))} saugt Kraft ab.`); }
    if (M.recoil && total) { atk.hp = Math.max(0, atk.hp - Math.max(1, Math.floor(total * M.recoil))); UI().updateHud(); await UI().say(`${cap(label(side))} wird vom Rückstoss getroffen.`); }
    if (M.status && def.hp > 0 && Math.random() * 100 < (G.debugStatus ? 100 : M.status.chance)) await tryStatus(other(side), M.status.id, false);
    if (M.eff2 && total && Math.random() * 100 < (G.debugStatus ? 100 : M.eff2.chance)) { const tgt = M.eff2.who === 'self' ? side : other(side); if (sideMon(tgt).hp > 0 && atk.hp > 0) await stageChange(tgt, M.eff2, true); }
  }

  // v15: zweite Phase (zwei Lebensbalken): Wut-Animation, volle Heilung, stärker (+18 % Angriff/Tempo), neue Attacke
  async function rageRise(en) {
    const B = G.B; en.phase = (en.phase || 0) + 1;
    Snd().sfx('roar'); B.shake = 7;
    await G.animate(1400, p => { B.dim = Math.min(0.72, p * 1.2); B.rage = p; B.ea.flash = Math.floor(p * 10) % 3 === 0 ? 1 : 0;
      if (Math.random() < 0.6) { const [x, y] = center('enemy'); P_({ x: x + rnd(-26, 26), y: y + rnd(-10, 26), vy: rnd(-60, -30), k: 'glow', r: rnd(3, 7), dr: 4, life: 0.7, c: Math.random() < 0.5 ? '#ff4a6a' : '#b060ff' }); } });
    B.ea.flash = 0;
    en.rage = 1.18; en.hp = G.stats(en).hp; B.st.enemy = freshStages();
    if (G.MOVES.alptraum && !en.moves.includes('alptraum')) { en.moves = ['alptraum', ...en.moves.filter(m => m !== 'alptraum')].slice(0, 4); G.fillPP(en); }
    UI().updateHud(); B.flash = { c: '#b040ff', a: 0.6 };
    await UI().say('Der Alptraum erhebt sich wütend!');
    await UI().say(`${G.nm(en)} zeigt seine wahre Gestalt – Angriff und Tempo steigen!`);
    await G.animate(700, p => { B.dim = 0.72 * (1 - p) + 0.18 * p; }); B.rageGlow = 1;
    G.Battle.lastRage = { sp: en.sp, phase: en.phase, hp: en.hp, rage: en.rage };
  }
  // Seltener Geist: Schimmer beim Erscheinen (Funkenring, Lichtblitz) – eigener Stinger in G.Battle.start
  async function rareShimmer() {
    const B = G.B, [x, y] = center('enemy'); Snd().sfx('shimmer');
    await G.animate(1100, p => { for (let i = 0; i < 3; i++) { const a = p * 14 + i * 2.1, r = 30 * (1 - p * 0.4); P_({ x: x + Math.cos(a) * r, y: y + Math.sin(a) * r * 0.7, vy: -10, life: 0.5, c: i % 2 ? '#fff4c0' : '#bfe8ff', k: 'spark', s: 2 }); } });
    B.flash = { c: '#fff8e0', a: 0.5 }; G.Battle.lastShimmer = { sp: B.enemy.sp, t: performance.now() };
  }
  async function checkFaint() {
    const S = G.state, B = G.B, en = B.enemy, al = S.team[B.allyIdx];
    if (en.hp <= 0 && en.phases > 1 && (en.phase || 0) < en.phases - 1) { await rageRise(en); return 'next'; }
    if (en.hp <= 0) {
      Snd().sfx('faint');
      if (B.boss) { await G.animate(900, p => { B.ea.alpha = 1 - 0.6 * p; B.ea.dy = p * 6; }); await UI().say('Nebelahn sinkt in sich zusammen. Er ist nicht besiegt – nur still geworden.'); }
      else {
        await G.animate(600, p => { B.ea.dy = p * 20; B.ea.alpha = 1 - p; });
        B.ea.vis = 0;
        await UI().say(`${cap(label('enemy'))} ist erschöpft und ${B.tr ? 'kehrt zu seinem Licht zurück' : 'löst sich im Nebel auf'}.`);
      }
      if (!B.boss && B.eIdx + 1 >= B.team.length) { Snd().music('none'); Snd().jingle('victory'); }
      await shareXp(en);
      if (B.eIdx + 1 < B.team.length) {
        B.eIdx++; B.enemy = B.team[B.eIdx]; B.st.enemy = freshStages(); B.ea = newAnim(); B.ea.dx = 150;
        S.seen[B.enemy.sp] = 1; UI().updateHud();
        const cl = B.tr.callers ? B.tr.callers[B.eIdx] : B.tr.name;
        if (B.enemy.sp === 'nachtmahr') { Snd().sfx('hiss'); await UI().say(`${cl} öffnet eine Glaslaterne. Schwarzer Rauch quillt heraus – der ${G.nm(B.enemy)}!`); }
        else await UI().say(cl === G.SPECIES[B.enemy.sp].name ? `${cl} springt selbst in den Kampf!` : `${cl} ruft ${G.nm(B.enemy)}!`);
        await G.animate(450, p => B.ea.dx = (1 - ease(p)) * 150);
        if (al.hp <= 0) return checkFaint();
        return 'next';
      }
      return 'won';
    }
    if (al.hp <= 0) {
      Snd().sfx('faint');
      await G.animate(600, p => { B.aa.dy = p * 20; B.aa.alpha = 1 - p; });
      await UI().say(`${G.nm(al)} ist erschöpft!`);
      if (al.status && !G.STATUS[al.status.id].persist) al.status = null;
      if (!S.team.some(m => m.hp > 0)) return 'lost';
      let idx = -1;
      while (idx < 0 || S.team[idx].hp <= 0) { await UI().say('Welcher Geist soll weiterkämpfen?'); idx = await G.Menu.teamPicker({ battle: true, forced: true }); }
      B.allyIdx = idx; B.part.add(idx); B.st.ally = freshStages(); B.aa = newAnim(); B.aa.dx = -150; UI().updateHud();
      await G.animate(400, p => B.aa.dx = -(1 - ease(p)) * 150);
      await UI().say(`Los, ${G.nm(S.team[idx])}!`);
      return 'next';
    }
    return null;
  }

  // EP wie in modernen Spielen: Besiegen und Fangen geben gleich viel. Teilnehmer 100 %, Geister auf der Bank 65 % (min 1),
  // erschöpfte Geister (0 KP) nichts. Bank-Geister kompakt: eine Zeile je Geist, Level-up-Effekt nur wenn nötig.
  G.xpGain = en => Math.max(1, Math.floor(G.SPECIES[en.sp].xp * en.lvl / 5 * (G.B && G.B.tr ? 1.5 : 1)));
  G.xpShares = (team, part, gain) => team.map((m, i) => m.hp <= 0 ? 0 : part.has(i) ? gain : Math.max(1, Math.floor(gain * 0.65)));
  async function shareXp(en) {
    const S = G.state, B = G.B, gain = G.xpGain(en), sh = G.xpShares(S.team, B.part, gain);
    B.lastXp = sh.slice();
    const order = [B.allyIdx, ...S.team.map((_, i) => i).filter(i => i !== B.allyIdx)];
    for (const i of order) if (sh[i] > 0) await giveXp(S.team[i], sh[i], !B.part.has(i));
  }
  G.Battle.shareXp = shareXp;
  async function giveXp(m, gain, bench) {
    await UI().say(bench ? `${G.nm(m)} erhält ${gain} EP.` : `${G.nm(m)} erhält ${gain} Erfahrungspunkte.`);
    const active = G.B && G.state.team[G.B.allyIdx] === m;
    m.xp += gain; UI().updateHud();
    while (m.xp >= G.xpFor(m.lvl + 1) && m.lvl < 50) {
      if (active) { UI().xpFill && UI().xpFill(100); await G.wait(450); }
      const old = G.stats(m); m.lvl++; const nw = G.stats(m); m.hp += nw.hp - old.hp;
      await levelUpFx(m, old, nw, active);
      await learnAt(m);
      UI().updateHud();
    }
  }
  // Level-up: warmer Jingle, Lichtstoss + aufsteigende Funken am Geist, blinkende EP-Leiste, «Level X!»-Banner und Werte-Tafel (alt -> neu).
  // Die Tafel steht, solange der Text läuft (A überspringt), mindestens aber ~1.6 s ohne Druck – kein zusätzlicher Tastendruck
  async function levelUpFx(m, old, nw, active) {
    const B = G.B; Snd().jingle('levelup');
    if (B && active) {
      const [x, y] = center('ally'); burst(x, y, 'Seele', 20);
      for (let i = 0; i < 26; i++) P_({ x: x + rnd(-22, 22), y: y + rnd(0, 26), vx: rnd(-6, 6), vy: rnd(-70, -30), life: rnd(0.8, 1.6), c: i % 3 ? '#ffe7a0' : '#ffffff', s: 1.5, k: 'spark' });
      P_({ x, y, k: 'glow', r: 18, dr: 60, life: 0.6, c: '#ffe0a0' }); P_({ x, y, k: 'ring', r: 6, dr: 110, life: 0.6, c: '#fff4c8' });
      B.flash = { c: '#ffe8b0', a: 0.28 };
    }
    if (active && UI().xpFlash) UI().xpFlash(); else UI().updateHud();
    const rows = [['KP', 'hp'], ['Angriff', 'atk'], ['Abwehr', 'def'], ['Tempo', 'spd']].map(([l, k]) => [l, old[k], nw[k]]);
    G.Battle.lastLevelUp = { sp: m.sp, lvl: m.lvl, rows, t: performance.now() };
    const el = levelPanel(m, rows);
    try { await UI().say(`${G.nm(m)} erreicht Level ${m.lvl}!`); } finally { el.className = 'hidden'; }
  }
  function levelPanel(m, rows) {
    const scr = document.getElementById('screen');
    let el = document.getElementById('lvlup'); if (!el) { el = document.createElement('div'); el.id = 'lvlup'; scr.appendChild(el); }
    el.innerHTML = `<div class="lv-banner">Level ${m.lvl}!</div><div class="lv-name">${G.nm(m)}</div><table>${rows.map(([l, a, b]) => `<tr><td>${l}</td><td>${a}</td><td>→</td><td>${b}</td><td class="up">+${b - a}</td></tr>`).join('')}</table>`;
    el.className = ''; void el.offsetWidth; el.className = 'show'; return el;
  }
  async function learnAt(m) {
    for (const [l, mv] of G.SPECIES[m.sp].learn) {
      if (l !== m.lvl || m.moves.includes(mv)) continue;
      if (m.moves.length < 4) { m.moves.push(mv); m.pp[mv] = G.MOVES[mv].pp; await UI().say(`${G.nm(m)} lernt ${G.MOVES[mv].name}!`); }
      else {
        await UI().say(`${G.nm(m)} möchte ${G.MOVES[mv].name} lernen, kennt aber schon vier Attacken.`);
        const k = await UI().choose(m.moves.map(id => ({ label: 'Vergessen: ' + G.MOVES[id].name, sub: G.MOVES[id].type })), { area: 'full', cancel: true, backLabel: 'Nicht lernen', title: `<h2>${G.MOVES[mv].name} lernen?</h2>` });
        if (k >= 0) { const o = m.moves[k]; m.moves[k] = mv; delete m.pp[o]; m.pp[mv] = G.MOVES[mv].pp; await UI().say(`${G.nm(m)} vergisst ${G.MOVES[o].name} und lernt ${G.MOVES[mv].name}!`); }
      }
    }
  }
  G.learnAt = learnAt;

  async function switchTo(idx) {
    const B = G.B, S = G.state, out = S.team[B.allyIdx];
    if (out.status && !G.STATUS[out.status.id].persist) out.status = null;
    await UI().say(`${G.nm(out)}, komm zurück!`);
    await G.animate(350, p => B.aa.dx = -ease(p) * 150);
    B.allyIdx = idx; B.st.ally = freshStages(); B.aa = newAnim(); B.aa.dx = -150; UI().updateHud();
    await G.animate(400, p => B.aa.dx = -(1 - ease(p)) * 150);
    await UI().say(`Los, ${G.nm(S.team[idx])}!`);
  }

  async function throwLantern(item) {
    const S = G.state, B = G.B, en = B.enemy, I = G.ITEMS[item];
    S.items[item]--;
    await UI().say(`Du wirfst ${I.art || 'eine'} ${I.name}!`);
    B.lantern = { x: 60, y: 140, rot: 0, glow: 0 }; Snd().sfx('throw');
    await G.animate(600, p => { B.lantern.x = 60 + 126 * p; B.lantern.y = 140 - 82 * p - Math.sin(p * Math.PI) * 50; B.lantern.rot = p * 12.5; });
    B.lantern.rot = 0;
    await G.animate(450, p => { B.ea.scale = 1 - p; B.ea.alpha = 1 - p; B.lantern.glow = p; });
    B.ea.vis = 0;
    await G.animate(300, p => { B.lantern.y = 58 + 30 * ease(p); B.lantern.glow = 1 - p * 0.6; });
    const st = G.stats(en);
    let p = Math.min(0.95, G.SPECIES[en.sp].catch * (I.mult || 1) * (3 * st.hp - 2 * en.hp) / (3 * st.hp) * 1.5 + (en.lvl <= 3 ? 0.05 : 0) + (en.status ? 0.08 : 0));
    if (!B.trainer && G.flag('story') === 2) p = Math.max(p, 0.8);   // Fang-Übung mit Ilse: der erste Wurf gelingt fast immer
    const ok = G.debugCatch != null ? G.debugCatch : Math.random() < p;
    const shakes = ok ? 3 : Math.random() < p ? 2 : Math.random() < 0.5 ? 1 : 0;
    for (let i = 0; i < shakes; i++) { await G.wait(280); Snd().sfx('wobble'); await G.animate(380, q => B.lantern.rot = Math.sin(q * Math.PI * 2) * 0.35); }
    await G.wait(300);
    if (ok) {
      Snd().music('none'); Snd().sfx('catch'); burst(186, 86, 'Irrlicht', 30); B.lantern.glow = 1;
      await UI().say(`Geschafft! ${G.nm(en)} folgt nun deinem Licht.`);
      S.caught[en.sp] = 1;
      await shareXp(en);   // Fangen gibt gleich viele EP wie Besiegen
      if (en.status && !G.STATUS[en.status.id].persist) en.status = null;
      if (S.team.length < 6) S.team.push(en);
      else { S.box.push(en); await UI().say(`Dein Team ist voll. ${G.nm(en)} wartet nun im Seelenarchiv (Truhe zu Hause).`); }
      if (G.flag('story') === 2 && G.Story) { await UI().say('Ilse (von weitem): Wunderbar gemacht! Komm zu mir auf den Dorfplatz zurück.'); G.Story.set(3); }
      return true;
    }
    Snd().sfx('fail'); burst(186, 86, 'Nebel', 18);
    B.lantern = null; B.ea.vis = 1;
    await G.animate(300, q => { B.ea.scale = q; B.ea.alpha = q; });
    await UI().say(['Oh nein! Der Geist ist entwischt!', 'Beinahe! Das Licht hat ihn fast gehalten.', 'So knapp! Er ist wieder frei.', 'Fast! Nur noch ein Flackern hat gefehlt.'][shakes]);
    return false;
  }

  // ---------- Gegenstände ----------
  G.useItem = (id, m) => {
    const I = G.ITEMS[id], st = G.stats(m), n = G.nm(m);
    if (!I || !(G.state.items[id] > 0)) return { ok: false, msg: 'Davon hast du nichts mehr.' };
    if (I.kind === 'heal') {
      if (m.hp <= 0) return { ok: false, msg: `${n} ist erschöpft. Dafür braucht es eine Nachtkerze.` };
      const cureKlamm = id === 'kraeutertee' && m.status && m.status.id === 'klamm' && Math.random() < 0.5;
      if (m.hp >= st.hp && !cureKlamm) return { ok: false, msg: `${n} hat bereits volle LP.` };
      const h = Math.min(st.hp - m.hp, I.hp); m.hp += h;
      if (cureKlamm) m.status = null;
      return { ok: true, msg: `${n} erhält ${h} LP zurück.${cureKlamm ? ' Die Kälte weicht.' : ''}` };
    }
    if (I.kind === 'cure') {
      if (!m.status || !I.cures.includes(m.status.id)) return { ok: false, msg: `Das würde bei ${n} nichts bewirken.` };
      m.status = null; return { ok: true, msg: `${n} ist wieder ganz bei sich.` };
    }
    if (I.kind === 'revive') {
      if (m.hp > 0) return { ok: false, msg: `${n} ist nicht erschöpft.` };
      m.hp = Math.max(1, Math.floor(st.hp * I.hpFrac)); m.status = null;
      return { ok: true, msg: `${n} flackert wieder auf!` };
    }
    return { ok: false, msg: 'Das kann man hier nicht benutzen.' };
  };

  // ---------- Entwicklung ----------
  G.Evo = { st: null };
  G.Evo.checkAll = async () => {
    for (const m of G.state.team) {
      const e = G.SPECIES[m.sp].evo;
      if (e && m.lvl >= e.lvl && !(m.evoSkip >= m.lvl)) await G.Evo.run(m);
    }
  };
  G.Evo.run = async (m) => {
    const e = G.SPECIES[m.sp].evo, from = m.sp, oldName = G.nm(m), prev = G.mode;
    G.lock++; G.mode = 'evo'; Snd().music('none');
    const rare = !!G.SPECIES[from].rare;   // v15: seltene Geister – eigene, prächtigere Entwicklungs-Animation
    const E = G.Evo.st = { from, to: e.to, show: 0, flash: 0, parts: [], white: 0, rare, ring: 0, pop: 0, col: rare ? G.TYPE_COLORS[G.SPECIES[e.to].type] : null };
    if (rare) { Snd().sfx('enc_rare'); await UI().say(`Ein uraltes Licht umhüllt ${oldName} – Sternenstaub, Gold und Nebel …`); }
    await UI().say(`Oh? ${oldName} leuchtet auf …`);
    UI().setText(`${oldName} verändert sich … (B: abbrechen)`);
    let cancel = false;
    UI().handler = b => { if (b === 'B') cancel = true; };
    Snd().sfx('evo');
    await G.animate(3800, p => {
      if (cancel) return;
      E.white = Math.min(1, p * 3);
      const f = 2 + p * p * 22; E.show = Math.sin(G.time * f) > 0 ? 1 : 0;
      if (Math.random() < 0.5) { const a = Math.random() * 6.28; E.parts.push({ x: 128 + Math.cos(a) * 70, y: 110 + Math.sin(a) * 60, vx: -Math.cos(a) * 40, vy: -Math.sin(a) * 40, life: 1.4 }); }
      if (rare && Math.random() < 0.7) E.parts.push({ x: 128 + (Math.random() - 0.5) * 120, y: 190, vx: 0, vy: -60 - Math.random() * 50, life: 1.4, gold: 1 });
      if (rare) for (let k = 0; k < 2; k++) { const a = G.time * 5 + k * Math.PI, r = 84 - p * 60; E.parts.push({ x: 128 + Math.cos(a) * r, y: 100 + Math.sin(a) * r * 0.7, vx: -Math.sin(a) * 30, vy: Math.cos(a) * 20, life: 0.8, tc: 1 }); }
    });
    UI().handler = null;
    if (cancel) {
      E.show = 0; E.white = 0; m.evoSkip = m.lvl;
      await UI().say(`${oldName} hat aufgehört zu leuchten.`);
    } else {
      await G.animate(400, p => E.flash = p);
      const old = G.stats(m); m.sp = e.to; const nw = G.stats(m); m.hp = Math.max(1, m.hp + nw.hp - old.hp);
      G.state.seen[e.to] = 1; G.state.caught[e.to] = 1;
      E.show = 1; E.white = 0;
      await G.animate(500, p => E.flash = 1 - p);
      if (rare) {   // v17: Farbexplosion in der Typfarbe, die neue Gestalt wächst kurz über sich hinaus
        for (let i = 0; i < 64; i++) { const a = i / 64 * 6.28, v = 70 + Math.random() * 90; E.parts.push({ x: 128, y: 100, vx: Math.cos(a) * v, vy: Math.sin(a) * v, life: 1.4, tc: 1 }); }
        Snd().sfx('shimmer'); await G.animate(1100, p => { E.ring = p; E.pop = Math.sin(Math.min(1, p * 1.6) * Math.PI); }); E.ring = 0; E.pop = 0;
      }
      Snd().sfx('levelup');
      await UI().say(`Glückwunsch! ${oldName} ist zu ${G.nm(m)} geworden!`);
      await learnAt(m);
    }
    UI().hideText(); G.Evo.st = null; G.mode = prev === 'evo' ? 'world' : prev; Snd().music(G.World.areaMusic()); G.lock--;
  };
  G.Evo.render = (ctx, dt) => {
    const E = G.Evo.st; if (!E) return;
    const t = G.time;
    ctx.fillStyle = '#07060f'; ctx.fillRect(0, 0, 256, 240);
    const gr = ctx.createRadialGradient(128, 100, 10, 128, 100, 140); gr.addColorStop(0, '#2a2050'); gr.addColorStop(1, '#07060f');
    ctx.fillStyle = gr; ctx.fillRect(0, 0, 256, 240);
    for (let i = 0; i < 24; i++) { const a = i / 24 * 6.28 + t * 0.3; ctx.fillStyle = `rgba(150,230,255,${0.12 + 0.1 * Math.sin(t * 3 + i)})`; ctx.fillRect(128 + Math.cos(a) * 90 | 0, 100 + Math.sin(a) * 70 | 0, 2, 2); }
    ctx.globalCompositeOperation = 'lighter';
    if (E.rare) {   // goldene Lichtstrahlen, die sich drehen, und eine Schockwelle am Ende
      for (let i = 0; i < 12; i++) { const a = i / 12 * 6.28 + t * 0.5; ctx.save(); ctx.translate(128, 100); ctx.rotate(a); const g = ctx.createLinearGradient(0, 0, 140, 0); g.addColorStop(0, `rgba(255,230,150,${0.22 + 0.1 * Math.sin(t * 4 + i)})`); g.addColorStop(1, 'rgba(255,230,150,0)'); ctx.fillStyle = g; ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(140, -9); ctx.lineTo(140, 9); ctx.closePath(); ctx.fill(); ctx.restore(); }
      if (E.ring > 0) for (let k = 0; k < 3; k++) { const r = (E.ring * 160) - k * 22; if (r <= 0) continue; ctx.strokeStyle = `rgba(${k % 2 ? '200,160,255' : '255,236,170'},${(1 - E.ring) * 0.8})`; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(128, 100, r, 0, 6.28); ctx.stroke(); }
    }
    for (let i = E.parts.length - 1; i >= 0; i--) { const p = E.parts[i]; p.life -= dt; if (p.life <= 0) { E.parts.splice(i, 1); continue; } p.x += p.vx * dt; p.y += p.vy * dt; ctx.fillStyle = p.tc && E.col ? E.col + Math.round(Math.min(1, p.life) * 255).toString(16).padStart(2, '0') : p.gold ? `rgba(255,220,140,${p.life / 1.4})` : `rgba(180,240,255,${p.life / 1.4})`; ctx.fillRect(p.x | 0, p.y | 0, 2, 2); }
    const g2 = ctx.createRadialGradient(128, 100, 0, 128, 100, 60); g2.addColorStop(0, 'rgba(160,230,255,0.35)'); g2.addColorStop(1, 'rgba(160,230,255,0)');
    ctx.fillStyle = g2; ctx.fillRect(60, 30, 136, 140);
    ctx.globalCompositeOperation = 'source-over';
    const sp = E.show ? E.to : E.from, spr = G.SPR.mon[sp];
    const img = E.white > 0.5 ? spr.white : spr.at(96), y = 100 + Math.round(Math.sin(t * 2) * 3);
    const sc = 96 * (1 + 0.18 * (E.pop || 0));
    ctx.drawImage(img, 128 - sc / 2, y + 40 - sc, sc, sc);
    if (E.flash) { ctx.fillStyle = `rgba(240,236,255,${E.flash})`; ctx.fillRect(0, 0, 256, 240); }
    ctx.drawImage(G.vignette, 0, 0);
  };
})(window.G);
