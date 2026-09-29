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
  function drawMon(ctx, sp, x, y, a, back, phase, big) {
    if (!a.vis || a.alpha <= 0) return;
    const spr = G.SPR.mon[sp], fly = G.FLY[sp] || 0, t = G.time * 2.6 + phase, boss = big > 1;
    const inhale = Math.sin(t) > 0.35, bob = fly ? Math.round(Math.sin(t * 0.9) * 2.5 * fly) : 0;
    // Pixelgrafik 1:1 (Vorderansicht 64, Boss 84, Rückansicht 80 Pixel, unten angeschnitten)
    const img = a.flash ? (back ? spr.whiteBack : boss ? spr.whiteBig : spr.white) : back ? (inhale ? spr.back2 : spr.back) : boss ? (inhale ? spr.big2 : spr.big) : (inhale ? spr.img2 : spr.img);
    const N = img.width, w = N * a.scale, gy = back ? N + 2 : N * 62 / 64;
    ctx.save(); ctx.globalAlpha = Math.max(0, Math.min(1, a.alpha));
    if (!back && !a.flash) { const r = N * 0.62 * a.scale; ctx.drawImage(HALO, Math.round(x + a.dx - r), Math.round(y + a.dy - N * 0.46 * a.scale - r), Math.round(r * 2), Math.round(r * 2)); }
    if (!fly && a.alpha > 0.5 && !back) shadowEllipse(ctx, x + a.dx, y + a.dy - 1, 24 * a.scale * (boss ? 1.3 : 1), 4.5 * a.scale);
    else if (fly && a.alpha > 0.5) shadowEllipse(ctx, x + a.dx, y + a.dy + 2, 14 * a.scale, 3 * a.scale, 0.22);
    ctx.translate(Math.round(x + a.dx), Math.round(y + a.dy + bob * a.scale * 2));
    ctx.drawImage(img, Math.round(-w / 2), Math.round(-gy * a.scale), Math.round(w), Math.round(w));
    ctx.restore();
  }
  // ---------- Kampfeffekte je Typ ----------
  // Partikelarten: spark (Funke, additiv), glow (weiches Leuchten), fog (Nebelballen), shade (Schattenschwade, spiralt ein),
  // drop (Moorspritzer, klatscht auf), chunk (Steinbrocken, prallt ab), leaf (Moosblatt, taumelt), ring (Druckwelle), mote (Seelenfunke, steigt)
  // s = Effektstil; die 8 Typen nutzen eigene Farben, Feuer/Boden/Psycho/Gift bauen auf den bewährten Stilen auf
  const TYPE_FX = {
    Feuer: { s: 'Irrlicht', c: '#ff9a48', c2: '#fff0b8' }, Wasser: { s: 'Wasser', c: '#58b0f8', c2: '#dcf2ff' }, Elektro: { s: 'Elektro', c: '#ffe058', c2: '#fffbe4' },
    Stein: { s: 'Stein', c: '#9a8a78', c2: '#d8c8b0' }, Psycho: { s: 'Nebel', c: '#f4a4dc', c2: '#ffe4f6' }, Boden: { s: 'Moor', c: '#a0743e', c2: '#cfa466' },
    Gift: { s: 'Schatten', c: '#b474e8', c2: '#26103a' }, Kampf: { s: 'Kampf', c: '#ff7a52', c2: '#fff4e8' },
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
      else if (st === 'Nebel') P_({ x: x + rnd(-6, 6), y: y + rnd(-6, 6), vx: (x1 - x0) * 0.4, vy: (y1 - y0) * 0.4, k: 'fog', r: 8, dr: 12, life: 0.6, c: steps % 2 ? f.c : f.c2, a: 0.45 });
      else { P_({ x: x0 + rnd(-14, 14), y: y0 + rnd(0, 14), vy: -40, k: 'mote', life: 0.8, c: f.c2 }); if (p > 0.6) P_({ x: x1 + rnd(-10, 10), y: y1 + rnd(-10, 10), vy: -20, k: 'mote', life: 0.6, c: f.c }); }
    });
  }
  // kompletter Treffer: Anflug, Einschlag, Klang, Schütteln, Blitz bei Volltreffer / sehr wirksam
  async function attackFx(type, from, to, crit, eff) {
    await travel(type, from, to);
    const [x, y] = center(to), B = G.B;
    burst(x, y, type, 22); Snd().sfx('hit_' + type);
    if (crit || eff > 1) { B.flash = { c: (TYPE_FX[type] || TYPE_FX.Seele).s === 'Schatten' ? TYPE_FX[type].c : (TYPE_FX[type] || TYPE_FX.Seele).c2, a: crit ? 0.6 : 0.42 }; B.shake = Math.max(B.shake || 0, crit ? 6 : 4.5); Snd().sfx(crit ? 'crit' : 'super'); }
    else if (eff < 1) Snd().sfx('weak');
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
    Snd().sfx('encounter'); Snd().music(tr && tr.boss ? 'boss' : tr ? 'trainer' : 'battle');
    await G.animate(520, p => G.fx = { kind: 'flash', p });
    await G.animate(420, p => G.fx = { kind: 'wipe', p });
    const B = G.B = {
      team: opts.team, eIdx: 0, enemy: opts.team[0], trainer: opts.trainer || null, tr, boss: !!(tr && tr.boss),
      noCatch: !!tr, noFlee: !!tr, hear: !!opts.hear, allyIdx: Math.max(0, S.team.findIndex(m => m.hp > 0)),
      st: { ally: freshStages(), enemy: freshStages() }, ea: newAnim(), aa: newAnim(), parts: [], lantern: null, flee: 0
    };
    B.bgKind = B.boss ? 'boss' : bgKindAt();
    B.ea.dx = 150; B.aa.dx = -150; if (B.hear) { B.ea.dx = 0; B.ea.alpha = 0; }
    G.mode = 'battle';
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
    else if (tr) { await UI().say(`${tr.title} ${tr.name} fordert dich heraus!`); await UI().say(`${tr.name} ruft ${G.nm(en)}!`); }
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
    if (result === 'lost') await UI().sayAll(['Alle deine Geister sind erschöpft …', S.respawn ? 'Du taumelst zurück zur letzten Laterne, die du entzündet hast.' : 'Mit letzter Kraft taumelst du zurück nach Hause.']);
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
          const opts = al.moves.map(id => { const M = G.MOVES[id]; return { label: M.name, sub: `${M.type} · AP ${al.pp[id] || 0}/${M.pp}`, color: G.TYPE_COLORS[M.type], disabled: !(al.pp[id] > 0) }; });
          const mv = await UI().choose(opts, { cols: 2, area: 'bottom', cancel: true });
          if (mv < 0) continue;
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
      const M = G.MOVES[id];
      if (M.heal) return [id, en.hp < G.stats(en).hp * 0.5 ? 40 : 0.01];
      if (M.status && !M.power) return [id, al.status || G.STATUS[M.status.id].immune.some(t => G.hasType(al.sp, t)) ? 0.01 : 22];
      if (!M.power) return [id, 16];
      return [id, M.power * G.eff(M.type, al.sp) * (G.hasType(en.sp, M.type) ? 1.5 : 1)];
    });
    return w.length ? G.pickWeighted(w) : 'letzterhauch';
  }

  async function round(id) {
    const al = G.state.team[G.B.allyIdx], en = G.B.enemy;
    const a = G.stats(al).spd, e = G.stats(en).spd;
    const eid = await enemyChoice();
    const seq = (a > e || (a === e && Math.random() < 0.5)) ? ['ally', 'enemy'] : ['enemy', 'ally'];
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
  async function endOfRound() {
    for (const side of ['ally', 'enemy']) {
      const m = sideMon(side);
      if (m && m.hp > 0 && m.status && m.status.id === 'klamm') {
        const d = Math.max(1, Math.floor(G.stats(m).hp * G.STATUS.klamm.dot));
        m.hp = Math.max(0, m.hp - d); UI().updateHud();
        const [x, y] = center(side); burst(x, y, 'Moor', 10);
        await UI().say(fmt(G.STATUS.klamm.msgTick, side));
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

  async function useMove(side, id) {
    const B = G.B, atk = sideMon(side), def = sideMon(other(side)), M = G.MOVES[id];
    const aA = anim(side), dA = anim(other(side)), dir = side === 'ally' ? 1 : -1;
    // Verirrt: Zug kann im Nebel verfliegen
    if (atk.status && atk.status.id === 'verirrt') {
      atk.status.turns--;
      if (atk.status.turns < 0) { atk.status = null; UI().updateHud(); await UI().say(fmt(G.STATUS.verirrt.msgOff, side)); }
      else if (Math.random() < G.STATUS.verirrt.skip) { await UI().say(fmt(G.STATUS.verirrt.msgTick, side)); return; }
    }
    await UI().say(`${cap(label(side))} setzt ${M.name} ein!`);
    if (!M.fallback && atk.pp[id] > 0) atk.pp[id]--;
    await G.animate(220, p => { aA.dx = Math.sin(p * Math.PI) * 14 * dir; aA.dy = -Math.sin(p * Math.PI) * 4; });
    const acc = M.acc * accMult(B.st[side].acc);
    if (Math.random() * 100 >= acc) { await UI().say('Daneben! Die Attacke verfliegt im Nebel.'); return; }
    if (M.heal) {
      const mx = G.stats(atk).hp;
      if (atk.hp >= mx) { await UI().say('Aber die LP sind bereits voll.'); return; }
      atk.hp = Math.min(mx, atk.hp + Math.floor(mx * M.heal)); UI().updateHud();
      const [x, y] = center(side); burst(x, y, 'Seele', 18); Snd().sfx('heal');
      await UI().say(`${cap(label(side))} erinnert sich an bessere Tage und schöpft Kraft.`); return;
    }
    if (!M.power) {
      if (M.status) { await travel(M.type, side, other(side)); const [x, y] = center(other(side)); burst(x, y, M.type, 14); Snd().sfx('hit_' + M.type); return tryStatus(other(side), M.status.id, true); }
      const tgt = M.effect.who === 'self' ? side : other(side), st = B.st[tgt], n = M.effect.n;
      const [x, y] = center(tgt); burst(x, y, M.type, 14); Snd().sfx('status');
      if ((n > 0 && st[M.effect.stat] >= 3) || (n < 0 && st[M.effect.stat] <= -3)) { await UI().say('Es passiert nichts weiter.'); return; }
      st[M.effect.stat] = Math.max(-3, Math.min(3, st[M.effect.stat] + n));
      await UI().say(`Die ${G.STAT_NAMES[M.effect.stat]} von ${G.nm(sideMon(tgt))} ${n > 0 ? (n > 1 ? 'steigt stark' : 'steigt') : 'sinkt'}!`);
      return;
    }
    const as = G.stats(atk), ds = G.stats(def);
    const A = as.atk * stageMult(B.st[side].atk), Dd = ds.def * stageMult(B.st[other(side)].def);
    const stab = G.hasType(atk.sp, M.type) ? 1.5 : 1, eff = G.eff(M.type, def.sp);
    const crit = Math.random() < 1 / 16;
    let dmg = Math.floor(((2 * atk.lvl / 5 + 2) * M.power * A / Dd) / 50 + 2);
    dmg = Math.max(1, Math.floor(dmg * stab * eff * (crit ? 1.5 : 1) * (0.85 + Math.random() * 0.15)));
    await attackFx(M.type, side, other(side), crit, eff);
    def.hp = Math.max(0, def.hp - dmg); UI().updateHud();
    await G.animate(420, p => { dA.flash = Math.floor(p * 8) % 2 === 0 ? 1 : 0; dA.dx = Math.sin(p * 40) * 3 * (1 - p); });
    dA.flash = 0; dA.dx = 0;
    if (crit) await UI().say('Ein Volltreffer!');
    if (eff > 1) await UI().say('Das ist sehr wirksam!');
    else if (eff < 1) await UI().say('Das ist nicht sehr wirksam …');
    if (M.drain) { atk.hp = Math.min(as.hp, atk.hp + Math.max(1, Math.floor(dmg * M.drain))); UI().updateHud(); await UI().say(`${cap(label(side))} saugt Kraft aus dem Moor.`); }
    if (M.recoil) { atk.hp = Math.max(0, atk.hp - Math.max(1, Math.floor(dmg * M.recoil))); UI().updateHud(); await UI().say(`${cap(label(side))} wird vom Rückstoss getroffen.`); }
    if (M.status && def.hp > 0 && Math.random() * 100 < (G.debugStatus ? 100 : M.status.chance)) await tryStatus(other(side), M.status.id, false);
  }

  async function checkFaint() {
    const S = G.state, B = G.B, en = B.enemy, al = S.team[B.allyIdx];
    if (en.hp <= 0) {
      Snd().sfx('faint');
      if (B.boss) { await G.animate(900, p => { B.ea.alpha = 1 - 0.6 * p; B.ea.dy = p * 6; }); await UI().say('Nebelahn sinkt in sich zusammen. Er ist nicht besiegt – nur still geworden.'); }
      else {
        await G.animate(600, p => { B.ea.dy = p * 20; B.ea.alpha = 1 - p; });
        B.ea.vis = 0;
        await UI().say(`${cap(label('enemy'))} ist erschöpft und ${B.tr ? 'kehrt zu seinem Licht zurück' : 'löst sich im Nebel auf'}.`);
      }
      if (!B.boss && B.eIdx + 1 >= B.team.length) { Snd().music('none'); Snd().jingle('victory'); }
      const gain = Math.max(1, Math.floor(G.SPECIES[en.sp].xp * en.lvl / 5 * (B.tr ? 1.5 : 1)));
      if (al.hp > 0) await giveXp(al, gain);
      if (B.eIdx + 1 < B.team.length) {
        B.eIdx++; B.enemy = B.team[B.eIdx]; B.st.enemy = freshStages(); B.ea = newAnim(); B.ea.dx = 150;
        S.seen[B.enemy.sp] = 1; UI().updateHud();
        await UI().say(`${B.tr.name} ruft ${G.nm(B.enemy)}!`);
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
      B.allyIdx = idx; B.st.ally = freshStages(); B.aa = newAnim(); B.aa.dx = -150; UI().updateHud();
      await G.animate(400, p => B.aa.dx = -(1 - ease(p)) * 150);
      await UI().say(`Los, ${G.nm(S.team[idx])}!`);
      return 'next';
    }
    return null;
  }

  async function giveXp(m, gain) {
    await UI().say(`${G.nm(m)} erhält ${gain} Erfahrungspunkte.`);
    m.xp += gain; UI().updateHud();
    while (m.xp >= G.xpFor(m.lvl + 1) && m.lvl < 50) {
      const old = G.stats(m); m.lvl++; const nw = G.stats(m); m.hp += nw.hp - old.hp;
      Snd().sfx('levelup'); UI().updateHud();
      await UI().say(`${G.nm(m)} erreicht Level ${m.lvl}!`);
      await learnAt(m);
      UI().updateHud();
    }
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
    const E = G.Evo.st = { from, to: e.to, show: 0, flash: 0, parts: [], white: 0 };
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
    for (let i = E.parts.length - 1; i >= 0; i--) { const p = E.parts[i]; p.life -= dt; if (p.life <= 0) { E.parts.splice(i, 1); continue; } p.x += p.vx * dt; p.y += p.vy * dt; ctx.fillStyle = `rgba(180,240,255,${p.life / 1.4})`; ctx.fillRect(p.x | 0, p.y | 0, 2, 2); }
    const g2 = ctx.createRadialGradient(128, 100, 0, 128, 100, 60); g2.addColorStop(0, 'rgba(160,230,255,0.35)'); g2.addColorStop(1, 'rgba(160,230,255,0)');
    ctx.fillStyle = g2; ctx.fillRect(60, 30, 136, 140);
    ctx.globalCompositeOperation = 'source-over';
    const sp = E.show ? E.to : E.from, spr = G.SPR.mon[sp];
    const img = E.white > 0.5 ? spr.white : spr.at(96), y = 100 + Math.round(Math.sin(t * 2) * 3);
    ctx.drawImage(img, 128 - 48, y - 56, 96, 96);
    if (E.flash) { ctx.fillStyle = `rgba(240,236,255,${E.flash})`; ctx.fillRect(0, 0, 256, 240); }
    ctx.drawImage(G.vignette, 0, 0);
  };
})(window.G);
