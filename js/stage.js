'use strict';
// Eldenghost – Grafik Phase 3: Kampfbühne je Gebiet + Idle-Animationsschicht für Geister (Atmen, Schweben, Seelenlicht,
// Blinzeln, Randlicht, Leuchtflächen, Partikel). Eigene, prozedural gezeichnete Grafik – keine fremden Assets.
//
// KEIN SEITENEFFEKT BEIM LADEN: Diese Datei legt nur G.Stage an. Alle Bilder entstehen erst beim ersten Aufruf (lazy).
// Solange js/battle.js die API nicht aufruft, ändert sich am Spiel nichts.
//
// API (logische 256×240-Koordinaten, ctx wie in G.Battle.render):
//   G.Stage.kindFor(mapId|map, x?, y?)        → 'gras'|'moor'|'kapelle'|'hoehle'|'kueste'|'asche' (Ergänzung zu bgKindAt)
//   G.Stage.drawBackground(ctx, kind, t, dt?)  → Himmel, Strahlen, Silhouetten, Nebelband, Boden mit Plattformen, Umgebungsteilchen
//   G.Stage.drawMon(ctx, mon, x, y, t, opts)   → Geist mit Idle-Effekten; mon = Art-Id oder {sp}; x,y = Fusspunkt
//        opts: { back, big, phase, a: {vis, alpha, scale, dx, dy, flash} (Animationszustand aus battle.js), boss }
//   G.Stage.drawBossReflection(ctx, mon, x, y, a)
//   G.Stage.drawForeground(ctx, kind, t)      → Vordergrund-Rahmung, tiefer Nebel, Vignette
//   G.Stage.autoFx                             → Frame-Zeit-Messung für fxMode 'auto' (siehe unten)
(function (G) {
  // ---------- Gestaltungs-Standardwerte (vorsichtig gewählt; hier leicht änderbar) ----------
  const CFG = {
    CAM_SWAY: 0.4,          // Bewegung der Hintergrund-Ebenen in px (Prototyp 1.0) – nur sehr leicht
    FG_SWAY: 0.6,           // Bewegung der Vordergrund-Rahmung in px (Prototyp 1.6)
    RIM_A: 0.5,             // Grundstärke Randlicht (Prototyp 0.55)
    SOUL_A: 0.14,           // Grundstärke Seelenlicht hinter dem Geist (Prototyp 0.16)
    SOFT: true,             // weiche Verläufe (imageSmoothing an) statt grober Pixel bei Bühne/Licht
    BOSS_OWN_STAGE: false,  // false: Bossräume nutzen vorerst die Bühne ihres Gebiets
    // gedämpft gegenüber Prototyp (dort glow 1.3/1.3/1.4, rim 0.5)
    DAMP: { totenleuchte: { glow: 1.05, rim: 0.35 }, laternchen: { glow: 1.05, rim: 0.35 }, neu_laternchen: { glow: 1.1, rim: 0.35 } },
    PLAT_EN: [186, 97], PLAT_AL: [72, 157],   // Plattformen genau unter den Geister-Positionen von battle.js
    AUTO_FPS: 50,           // 'auto': unter dieser Bildrate …
    AUTO_HOLD_S: 2.5,       // … während so vieler Sekunden (summiert) → lowFx
  };
  const W = 256, H = 240, TAU = Math.PI * 2;
  const mk = (w, h) => G.mkHi(w, h);
  const hash = n => { const s = Math.sin(n * 127.1 + 311.7) * 43758.5453; return s - Math.floor(s); };
  const rgba = (hex, a) => { const n = parseInt(hex.slice(1), 16); return `rgba(${n >> 16},${(n >> 8) & 255},${n & 255},${a})`; };
  const mix = (h1, h2, f) => { const a = parseInt(h1.slice(1), 16), b = parseInt(h2.slice(1), 16); const c = s => Math.round(((a >> s) & 255) * (1 - f) + ((b >> s) & 255) * f); return '#' + ((1 << 24) | (c(16) << 16) | (c(8) << 8) | c(0)).toString(16).slice(1); };

  // ---------- Gebietsstimmungen ----------
  // sky: Verlauf oben→Horizont, far/mid: Silhouettenfarben, gnd: Boden, lite: Lichtfarbe (Mond/Kristall/Glut), ray: Lichtstrahlen,
  // fog: Nebelfarbe+Deckkraft, mote: Umgebungsteilchen (Art, Farbe, Anzahl), sil: Silhouettenform
  const MOOD = {
    gras:    { sky: ['#0a1028', '#1c2a52', '#3a4a72'], far: '#22305a', mid: '#162040', gnd: ['#1e3a3a', '#0e1e22'], lite: '#dfe8ff', moon: [196, 34, 13], ray: 0.10, fog: ['#b8c8f0', 0.10], mote: ['fly', '#d8ff9a', 14], sil: 'baum', top: '#40706a' },
    moor:    { sky: ['#08141a', '#16302e', '#2e4a40'], far: '#1c3632', mid: '#10221f', gnd: ['#1a3029', '#0a1612'], lite: '#d8f4e0', moon: [60, 30, 10], ray: 0.06, fog: ['#a8d0b8', 0.07], mote: ['wisp', '#a6ff9a', 8], sil: 'tot', top: '#3e5e44', water: true },
    kapelle: { sky: ['#0c0818', '#221838', '#3e2c58'], far: '#251c3e', mid: '#160f28', gnd: ['#2a2438', '#120e1c'], lite: '#e8d8ff', moon: null, ray: 0.16, fog: ['#c8b8f0', 0.08], mote: ['dust', '#f0e0ff', 16], sil: 'bogen', top: '#5c5470', stone: true },
    hoehle:  { sky: ['#05070c', '#0e1420', '#1a2434'], far: '#141c2a', mid: '#0a0f18', gnd: ['#1e2430', '#0a0d14'], lite: '#8ff0e8', moon: null, ray: 0.05, fog: ['#80c0d0', 0.06], mote: ['drip', '#8ff0e8', 10], sil: 'grotte', top: '#3c4a5c', stone: true, crystal: true },
    kueste:  { sky: ['#0a1426', '#1e3456', '#4a6a8e'], far: '#22385a', mid: '#141f36', gnd: ['#3a3e48', '#181a22'], lite: '#e8f4ff', moon: [72, 40, 15], ray: 0.08, fog: ['#c8e0f4', 0.09], mote: ['spray', '#dcf2ff', 12], sil: 'klippe', top: '#5a6470', sea: true },
    asche:   { sky: ['#120608', '#2e1010', '#5a2418'], far: '#3a1612', mid: '#1e0a0a', gnd: ['#2e1c18', '#120a08'], lite: '#ffb070', moon: null, ray: 0.09, fog: ['#ff9a60', 0.06], mote: ['ember', '#ffb050', 18], sil: 'vulkan', top: '#5a3a2e', stone: true },
    boss:    { sky: ['#06030e', '#1c0c34', '#3a1a5a'], far: '#2a1446', mid: '#140828', gnd: ['#22183a', '#0c0618'], lite: '#f0d0ff', moon: [190, 30, 18], eclipse: true, ray: 0.18, fog: ['#c8a8ff', 0.10], mote: ['shard', '#e0b0ff', 16], sil: 'ruine', top: '#5a4a7a', stone: true },
  };
  

  // ---------- Bühnen-Ebenen (einmal vorgerendert je Gebiet) ----------
  function sky(m) {
    const c = mk(W + 16, H), g = c.getContext('2d'), gr = g.createLinearGradient(0, 0, 0, 130);
    gr.addColorStop(0, m.sky[0]); gr.addColorStop(0.6, m.sky[1]); gr.addColorStop(1, m.sky[2]);
    g.fillStyle = gr; g.fillRect(0, 0, W + 16, H);
    for (let i = 0; i < 70; i++) { const x = hash(i) * (W + 16), y = hash(i + 50) * 90, a = 0.25 + hash(i + 9) * 0.6; g.fillStyle = rgba('#ffffff', a * (1 - y / 110)); g.fillRect(x, y, hash(i + 3) > 0.9 ? 1 : 0.5, hash(i + 3) > 0.9 ? 1 : 0.5); }
    if (m.moon) {
      const [x, y, r] = m.moon, h = g.createRadialGradient(x, y, r * 0.5, x, y, r * 5);
      h.addColorStop(0, rgba(m.lite, 0.35)); h.addColorStop(1, rgba(m.lite, 0)); g.fillStyle = h; g.fillRect(0, 0, W + 16, 140);
      if (m.eclipse) { g.fillStyle = '#05020a'; g.beginPath(); g.arc(x, y, r, 0, TAU); g.fill(); g.strokeStyle = rgba(m.lite, 0.9); g.lineWidth = 1.2; g.beginPath(); g.arc(x, y, r, 0, TAU); g.stroke(); g.strokeStyle = rgba('#c060ff', 0.4); g.lineWidth = 3; g.stroke(); }
      else { g.fillStyle = mix(m.lite, '#ffffff', 0.4); g.beginPath(); g.arc(x, y, r, 0, TAU); g.fill(); g.fillStyle = rgba(m.sky[1], 0.18); for (let i = 0; i < 5; i++) { g.beginPath(); g.arc(x - r * 0.4 + hash(i) * r, y - r * 0.4 + hash(i + 7) * r, r * 0.18, 0, TAU); g.fill(); } }
    }
    if (m.sea) { // Meereshorizont mit Mondspur
      const hy = 92; g.fillStyle = '#16294a'; g.fillRect(0, hy, W + 16, 40);
      for (let i = 0; i < 40; i++) { const y = hy + 2 + i * 0.9, w = 6 + i * 0.7; g.fillStyle = rgba(m.lite, 0.25 * (1 - i / 40)); g.fillRect(72 - w / 2 + Math.sin(i * 1.7) * 3, y, w, 0.5); }
    }
    return c;
  }
  // Silhouetten-Ebene (far = blass, weit; mid = dunkler, nah); Höhenlinie + Formen je Gebiet
  function sil(m, col, base, amp, seed, near) {
    const c = mk(W + 24, H), g = c.getContext('2d'); g.fillStyle = col;
    g.beginPath(); g.moveTo(0, H);
    for (let x = 0; x <= W + 24; x += 4) g.lineTo(x, base - amp * (0.5 + 0.5 * Math.sin(x * 0.03 + seed)) - amp * 0.4 * Math.sin(x * 0.011 + seed * 2));
    g.lineTo(W + 24, H); g.fill();
    const n = near ? 6 : 9;
    for (let i = 0; i < n; i++) {
      const x = 10 + i * (W + 4) / n + hash(i + seed) * 20, y = base - amp * 0.6, s = (near ? 1.3 : 0.8) * (0.7 + hash(i * 3 + seed) * 0.6);
      g.beginPath();
      if (m.sil === 'baum') { g.ellipse(x, y - 14 * s, 9 * s, 14 * s, 0, 0, TAU); g.ellipse(x + 6 * s, y - 8 * s, 7 * s, 9 * s, 0, 0, TAU); g.fill(); g.fillRect(x - 1, y - 4 * s, 2, 8 * s); }
      else if (m.sil === 'tot') { g.lineWidth = 1.5 * s; g.strokeStyle = col; g.moveTo(x, y + 4); g.lineTo(x + 1, y - 26 * s); g.moveTo(x, y - 14 * s); g.lineTo(x - 8 * s, y - 22 * s); g.moveTo(x + 1, y - 18 * s); g.lineTo(x + 9 * s, y - 28 * s); g.stroke(); for (let k = 0; k < 6; k++) g.fillRect(x - 14 + k * 5, y - 4 - hash(k + i) * 8, 0.8, 10); }
      else if (m.sil === 'bogen') { if (i % 2) continue; const w = 16 * s, h = 46 * s; g.moveTo(x - w, y + 6); g.lineTo(x - w, y - h * 0.6); g.quadraticCurveTo(x - w, y - h, x, y - h * 1.15); g.quadraticCurveTo(x + w, y - h, x + w, y - h * 0.6); g.lineTo(x + w, y + 6); g.closePath(); g.fill(); g.globalCompositeOperation = 'destination-out'; g.beginPath(); g.ellipse(x, y - h * 0.62, w * 0.35, h * 0.22, 0, 0, TAU); g.fill(); g.globalCompositeOperation = 'source-over'; }
      else if (m.sil === 'grotte') { g.moveTo(x - 6 * s, 0); g.lineTo(x, 22 * s + hash(i) * 30 * s); g.lineTo(x + 6 * s, 0); g.fill(); g.beginPath(); g.moveTo(x - 5 * s, y + 6); g.lineTo(x + 1, y - 18 * s * hash(i + 4) - 6); g.lineTo(x + 6 * s, y + 6); g.fill(); }
      else if (m.sil === 'klippe') { if (i > 1) continue; g.moveTo(i ? W + 24 : 0, y - 40); g.lineTo(i ? W - 20 : 30, y - 30); g.lineTo(i ? W - 40 : 44, y + 10); g.lineTo(i ? W + 24 : 0, y + 10); g.fill(); }
      else if (m.sil === 'vulkan') { if (i) continue; g.moveTo(60, y + 6); g.lineTo(120, y - 50); g.lineTo(136, y - 52); g.lineTo(200, y + 6); g.fill(); }
      else if (m.sil === 'ruine') { if (i % 2) continue; const h = (30 + hash(i) * 30) * s; g.fillRect(x - 5 * s, y - h, 10 * s, h + 6); g.fillRect(x - 7 * s, y - h - 3, 14 * s, 3); }
    }
    if (m.crystal && near) for (let i = 0; i < 7; i++) { const x = hash(i + 40) * W, y = base - 2; g.save(); g.globalCompositeOperation = 'lighter'; const gr = g.createRadialGradient(x, y - 4, 0, x, y - 4, 14); gr.addColorStop(0, rgba(m.lite, 0.35)); gr.addColorStop(1, rgba(m.lite, 0)); g.fillStyle = gr; g.fillRect(x - 14, y - 18, 28, 28); g.restore(); g.fillStyle = mix(m.lite, col, 0.4); g.beginPath(); g.moveTo(x - 2, y); g.lineTo(x, y - 9 - hash(i) * 6); g.lineTo(x + 2, y); g.fill(); }
    return c;
  }
  function ground(m) {
    const c = mk(W, H), g = c.getContext('2d'), gr = g.createLinearGradient(0, 100, 0, H);
    gr.addColorStop(0, m.gnd[0]); gr.addColorStop(1, m.gnd[1]); g.fillStyle = gr; g.fillRect(0, 104, W, H - 104);
    const hz = g.createLinearGradient(0, 98, 0, 116); hz.addColorStop(0, rgba(m.lite, 0.0)); hz.addColorStop(0.3, rgba(m.lite, 0.10)); hz.addColorStop(1, rgba(m.lite, 0)); g.fillStyle = hz; g.fillRect(0, 98, W, 18);
    // Perspektivische Bodenstruktur (Grasbüschel / Steinfugen / Wasserlinien)
    for (let i = 0; i < 90; i++) { const y = 108 + Math.pow(hash(i + 3), 1.6) * 130, x = hash(i) * W, s = 0.4 + (y - 104) / 130; g.fillStyle = rgba(i % 3 ? '#000000' : m.top, 0.25); if (m.water && i % 4 == 0) { g.fillStyle = rgba(m.lite, 0.10); g.fillRect(x, y, 18 * s, 0.5); } else if (m.stone) g.fillRect(x, y, 6 * s, 0.6); else { g.fillRect(x, y - 3 * s, 0.7, 3 * s); g.fillRect(x + 1.5, y - 2 * s, 0.7, 2 * s); } }
    plat(g, m, CFG.PLAT_EN[0], CFG.PLAT_EN[1] + 2, 46, 10); plat(g, m, CFG.PLAT_AL[0], CFG.PLAT_AL[1] + 2, 66, 14);
    return c;
  }
  // Bodenplattform: Schlagschatten, dunkle Flanke, beleuchtete Oberseite, Lichtkante, Moos/Steinsplitter
  function plat(g, m, x, y, rx, ry) {
    const sh = g.createRadialGradient(x, y + ry * 0.6, 0, x, y + ry * 0.6, rx * 1.3); sh.addColorStop(0, 'rgba(0,0,0,0.45)'); sh.addColorStop(1, 'rgba(0,0,0,0)');
    g.save(); g.scale(1, 0.3); g.fillStyle = sh; g.beginPath(); g.arc(x, (y + ry * 0.6) / 0.3, rx * 1.3, 0, TAU); g.fill(); g.restore();
    g.fillStyle = mix(m.gnd[1], '#000000', 0.3); g.beginPath(); g.ellipse(x, y + 3, rx, ry, 0, 0, Math.PI); g.lineTo(x - rx, y); g.fill();
    const tg = g.createLinearGradient(x - rx, y - ry, x + rx * 0.6, y + ry); tg.addColorStop(0, mix(m.top, m.lite, 0.25)); tg.addColorStop(0.5, m.top); tg.addColorStop(1, mix(m.top, '#000000', 0.45));
    g.fillStyle = tg; g.beginPath(); g.ellipse(x, y, rx, ry, 0, 0, TAU); g.fill();
    g.strokeStyle = rgba(m.lite, 0.45); g.lineWidth = 0.8; g.beginPath(); g.ellipse(x, y, rx - 0.5, ry - 0.5, 0, Math.PI * 1.05, Math.PI * 1.75); g.stroke();
    for (let i = 0; i < 26; i++) { const a = hash(i + x) * TAU, rr = Math.sqrt(hash(i * 2 + x)), px = x + Math.cos(a) * rx * rr * 0.95, py = y + Math.sin(a) * ry * rr * 0.9; g.fillStyle = rgba(m.stone ? '#000000' : '#9ad890', m.stone ? 0.18 : 0.22); if (m.stone) g.fillRect(px, py, 3, 0.6); else g.fillRect(px, py - 2, 0.7, 2.5); }
  }
  function rayLayer(m) {
    const c = mk(W, H), g = c.getContext('2d'); g.globalCompositeOperation = 'lighter';
    const ox = m.moon ? m.moon[0] : 150, oy = m.moon ? m.moon[1] : -10;
    for (let i = 0; i < 5; i++) {
      const a = 1.75 + (i - 2) * 0.16 + hash(i) * 0.05, len = 230, w = 0.05 + hash(i + 4) * 0.05;
      const gr = g.createLinearGradient(ox, oy, ox + Math.cos(a) * len, oy + Math.sin(a) * len); gr.addColorStop(0, rgba(m.lite, 0.5)); gr.addColorStop(1, rgba(m.lite, 0));
      g.fillStyle = gr; g.beginPath(); g.moveTo(ox, oy); g.lineTo(ox + Math.cos(a - w) * len, oy + Math.sin(a - w) * len); g.lineTo(ox + Math.cos(a + w) * len, oy + Math.sin(a + w) * len); g.fill();
    }
    return c;
  }
  function fogLayer(m) { // ein breites, nahtlos kachelndes Nebelband (statt 7 Verläufe pro Frame)
    const c = mk(W * 2, 60), g = c.getContext('2d');
    for (let i = 0; i < 16; i++) { const x = (i / 16) * W * 2, y = 30 + Math.sin(i * 2.3) * 8, r = 26 + hash(i) * 20; for (const dx of [0, W * 2, -W * 2]) { const gr = g.createRadialGradient(x + dx, y, 0, x + dx, y, r); gr.addColorStop(0, rgba(m.fog[0], 0.7)); gr.addColorStop(1, rgba(m.fog[0], 0)); g.fillStyle = gr; g.beginPath(); g.ellipse(x + dx, y, r * 1.6, r * 0.5, 0, 0, TAU); g.fill(); } }
    return c;
  }
  function fgLayer(m) { // Vordergrund-Rahmung in den unteren Ecken (Gras, Wurzeln, Steine) – dunkel, unscharf wirkend
    const c = mk(W + 20, H), g = c.getContext('2d'); g.fillStyle = mix(m.gnd[1], '#000000', 0.5);
    for (const side of [0, 1]) for (let i = 0; i < 14; i++) {
      const x = side ? W + 20 - i * 3.5 : i * 3.5, h = 26 - i * 1.6 + hash(i + side * 9) * 10, y0 = 186 + i * 0.8;
      g.beginPath(); g.moveTo(x - 2, H); g.quadraticCurveTo(x + (side ? -6 : 6), y0 - h * 0.4, x + (side ? -9 : 9) * hash(i), y0 - h + 30); g.lineTo(x + 2, H); g.fill();
    }
    return c;
  }
  const STAGE = {};
  const stage = k => STAGE[k] || (STAGE[k] = (() => { const m = MOOD[k] || MOOD.gras; const s = { m, sky: sky(m), far: sil(m, m.far, 96, 10, 1.3, false), mid: sil(m, m.mid, 104, 7, 4.1, true), gnd: ground(m), ray: rayLayer(m), fog: fogLayer(m), fg: fgLayer(m) }; return s; })());
  // lowFx: alles in EIN Bild zusammengebacken (1 drawImage für die ganze Bühne)
  const FLAT = {};
  const flat = k => FLAT[k] || (FLAT[k] = (() => { const s = stage(k), c = mk(W, H), g = c.getContext('2d'); g.drawImage(s.sky, -8, 0); g.drawImage(s.far, -12, 0); g.drawImage(s.mid, -12, 0); g.drawImage(s.gnd, 0, 0); g.drawImage(s.fg, -10, 0); return c; })());

  // ---------- Animationsschicht ----------
  const TYPE_LIGHT = { Feuer: '#ffb060', Wasser: '#8ad8ff', Pflanze: '#c8ff8a', Elektro: '#ffe866', Stein: '#8ff0d8', Gift: '#c8ff5a', Psycho: '#f0a8ff', Normal: '#dce8ff', Boden: '#ffb35a', Kampf: '#ffd0a0', Drache: '#a8c8ff', Dunkel: '#c27cff' };
  // Einzelwerte je Geist (gilt auch für neu_*-Geister aus den Redesigns); CFG.DAMP wird darüber gelegt
  const OVR = {
    totenleuchte: { float: 3.2 }, laternchen: { float: 2.6 }, neu_laternchen: { float: 2.6 },
    menhirgeist: { breathe: 0.008, glow: 1.2, mote: 'rune' }, neu_menhirgeist: { breathe: 0.008, glow: 1.2, mote: 'rune' },
    nachtmahr: { breathe: 0.03, mote: 'shade', glow: 1.15 }, moorranke: { sway: 0.035 }, neu_moorranke: { sway: 0.035 },
  };
  const base = sp => String(sp).replace(/^neu_/, '');
  const typeOf = sp => ((G.SPECIES && (G.SPECIES[sp] || G.SPECIES[base(sp)])) || { type: 'Normal' }).type;
  function params(sp) {
    const ty = typeOf(sp), fly = (G.FLY && (G.FLY[sp] || G.FLY[base(sp)])) || 0;
    const p = { type: ty, col: TYPE_LIGHT[ty] || '#dce8ff', fly, float: fly ? 2.2 * fly + 0.6 : 0, floatSpd: fly ? 1.6 : 0, breathe: ty === 'Stein' ? 0.012 : 0.022, breatheSpd: 2.4, sway: 0, glow: 1, blink: 3.6, rim: 0.5,
      mote: ty === 'Psycho' ? 'wisp' : ty === 'Feuer' ? 'ember' : ty === 'Wasser' ? 'bubble' : ty === 'Dunkel' ? 'shade' : 'mote', motes: 6 };
    return Object.assign(p, OVR[sp] || {}, CFG.DAMP[sp] || {});
  }
  const FR = {};
  function frames(sp, back, big) {
    const k = sp + (back ? ':b' : big ? ':B' : ':f'); if (FR[k]) return FR[k];
    const s = G.SPR && G.SPR.mon && G.SPR.mon[sp], n = back ? 80 : big ? 84 : 64, R = G.Creatures && G.Creatures.renderHi;
    let f;
    if (s && (back ? s.back : big ? s.big : s.img)) f = back ? { a: s.back, b: s.back2, w: s.whiteBack } : big ? { a: s.big, b: s.big2, bl: s.bigBlink, w: s.whiteBig } : { a: s.img, b: s.img2, bl: s.imgBlink, w: s.white };
    else if (R) f = { a: R(sp, n, back), b: R(sp, n, back, true), bl: back ? null : R(sp, n, false, false, true) };
    else return null;
    f.b = f.b || f.a; f.rim = rim(f.a); return FR[k] = f;
  }
  function rim(src) {   // Silhouette minus 1 px versetzte Kopie → helle Kante oben links
    const N = src.lw || src.width, c = G.mkHi(N, src.lh || src.height, src.s || 1), g = c.getContext('2d');
    g.drawImage(src, 0, 0, N, N); g.globalCompositeOperation = 'source-in'; g.fillStyle = '#ffffff'; g.fillRect(0, 0, N, N);
    g.globalCompositeOperation = 'destination-out'; g.drawImage(src, 1, 1, N, N); return c;
  }
  const GL = {};
  const glow = col => GL[col] || (GL[col] = (() => { const c = mk(32, 32), g = c.getContext('2d'), gr = g.createRadialGradient(16, 16, 0, 16, 16, 16); gr.addColorStop(0, rgba(col, 1)); gr.addColorStop(0.25, rgba(col, 0.55)); gr.addColorStop(1, rgba(col, 0)); g.fillStyle = gr; g.fillRect(0, 0, 32, 32); return c; })());
  let SH = null, VIG = null;
  const shadow = () => SH || (SH = (() => { const c = mk(64, 16), g = c.getContext('2d'); g.scale(1, 0.25); const gr = g.createRadialGradient(32, 32, 0, 32, 32, 32); gr.addColorStop(0, 'rgba(0,0,0,0.6)'); gr.addColorStop(0.7, 'rgba(0,0,0,0.25)'); gr.addColorStop(1, 'rgba(0,0,0,0)'); g.fillStyle = gr; g.fillRect(0, 0, 64, 64); return c; })());
  const vignette = () => VIG || (VIG = (() => { const c = mk(W, H), g = c.getContext('2d'), gr = g.createRadialGradient(W / 2, H * 0.45, 60, W / 2, H * 0.5, 190); gr.addColorStop(0, 'rgba(0,0,0,0)'); gr.addColorStop(1, 'rgba(4,2,10,0.6)'); g.fillStyle = gr; g.fillRect(0, 0, W, H);
    const top = g.createLinearGradient(0, 0, 0, 34); top.addColorStop(0, 'rgba(4,2,12,0.35)'); top.addColorStop(1, 'rgba(4,2,12,0)'); g.fillStyle = top; g.fillRect(0, 0, 128, 34); return c; })()); // abgedunkelt hinter der Gegner-LP-Box
  const K = kind => MOOD[kind] ? kind : 'gras';

  // ---------- 'auto'-Effektmodus: Frame-Zeit-Messung während des Kampfs ----------
  // Nutzt das bestehende Flag wie js/main.js (G.lowFx = true, G.perf.low++), speichert nichts (fxMode bleibt 'auto').
  const autoFx = {
    slow: 0, last: 0, ema: 0, switched: 0,
    reset() { this.slow = 0; this.last = 0; this.ema = 0; },
    sample(ms) {   // ms = Dauer eines Frames
      if (G.fxMode !== 'auto' || G.lowFx || !(ms > 0) || ms > 500) return false;   // Pausen/Tabwechsel nicht werten
      this.ema = this.ema ? this.ema * 0.9 + ms * 0.1 : ms;
      if (this.ema > 1000 / CFG.AUTO_FPS) this.slow += ms; else this.slow = Math.max(0, this.slow - ms * 0.5);
      if (this.slow > CFG.AUTO_HOLD_S * 1000) {
        G.lowFx = true; this.switched++; if (G.perf) G.perf.low = (G.perf.low || 0) + 1; this.reset();
        if (G.UI && G.UI.toast) G.UI.toast('Effekte reduziert, damit das Spiel flüssig bleibt.');
        return true;
      }
      return false;
    },
    tick() {   // aus drawBackground; Testautomaten (Software-Rendering) nicht werten – wie main.js
      const now = performance.now(), d = this.last ? now - this.last : 0; this.last = now;
      if (typeof navigator !== 'undefined' && navigator.webdriver && !G.perfTest) return;
      if (d) this.sample(d);
    },
  };

  // ---------- öffentliche API ----------
  function kindFor(map, x, y) {
    const m = typeof map === 'string' ? (G.MAPS && G.MAPS[map]) : map; if (!m) return 'gras';
    const px = x != null ? x : G.P && G.P.x, py = y != null ? y : G.P && G.P.y, c = m.tiles && m.tiles[py] && m.tiles[py][px];
    if (c === 'c' || c === 'u' || c === 'B') return 'kapelle';
    if (m.theme === 'moor') return 'moor';
    if (m.theme === 'cave') return 'hoehle';
    if (m.theme === 'asche') return 'asche';
    if (m.id === 'kueste' || map === 'kueste') return 'kueste';
    return 'gras';
  }
  function drawBackground(ctx, kind, t) {
    autoFx.tick();
    const k = K(kind), s = stage(k), m = s.m, lo = !!G.lowFx;
    ctx.save(); ctx.imageSmoothingEnabled = CFG.SOFT;
    if (lo) ctx.drawImage(flat(k), 0, 0, W, H);
    else {
      const cam = Math.sin(t * 0.21) * CFG.CAM_SWAY;
      ctx.drawImage(s.sky, -8 + cam * 0.2, 0);
      ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.globalAlpha = m.ray * (0.75 + 0.25 * Math.sin(t * 0.5)); ctx.drawImage(s.ray, 0, 0); ctx.restore();
      ctx.drawImage(s.far, -12 + cam * 0.5, 0);
      ctx.save(); ctx.globalAlpha = m.fog[1] * 1.3; const fx = -((t * 3) % (W * 2)); ctx.drawImage(s.fog, fx, 70, W * 2, 60); ctx.drawImage(s.fog, fx + W * 2, 70, W * 2, 60); ctx.restore();
      ctx.drawImage(s.mid, -12 + cam, 0);
      ctx.drawImage(s.gnd, 0, 0);
    }
    const [mk_, mc, mn] = m.mote, n = lo ? Math.ceil(mn / 3) : mn;
    ctx.globalCompositeOperation = 'lighter';
    for (let i = 0; i < n; i++) {
      let x, y, a, sz = 1.4; const h1 = hash(i * 1.7 + 3), h2 = hash(i * 2.3 + 8);
      if (mk_ === 'ember' || mk_ === 'shard') { const q = (t * (0.05 + h2 * 0.05) + h1) % 1; x = (h1 * W + Math.sin(t + i) * 8 + q * 30) % W; y = 230 - q * 220; a = Math.sin(q * Math.PI) * 0.8; sz = mk_ === 'shard' ? 1.2 : 1.5; }
      else if (mk_ === 'drip') { const q = (t * (0.4 + h2 * 0.3) + h1) % 1; x = h1 * W; y = 6 + q * q * 120; a = q < 0.85 ? 0.6 : 0; sz = 1; }
      else if (mk_ === 'dust') { x = 120 + (h1 - 0.5) * 130 + Math.sin(t * 0.3 + i) * 6; y = 20 + h2 * 150 + Math.sin(t * 0.4 + i * 2) * 5; a = 0.25 + 0.25 * Math.sin(t * 1.5 + i); sz = 1; }
      else { x = h1 * W + Math.sin(t * 0.4 + i * 3) * 12; y = 110 + h2 * 100 + Math.sin(t * 0.7 + i) * 8; a = Math.max(0, Math.sin(t * (0.8 + h2) + i * 2)) * 0.9; sz = mk_ === 'wisp' ? 3.2 : 1.6; }
      ctx.globalAlpha = a; ctx.drawImage(glow(mc), x - sz * 2, y - sz * 2, sz * 4, sz * 4);
    }
    ctx.restore();
  }
  function drawForeground(ctx, kind, t) {
    const k = K(kind), s = stage(k), m = s.m;
    ctx.save(); ctx.imageSmoothingEnabled = CFG.SOFT;
    if (!G.lowFx) { ctx.drawImage(s.fg, -10 + Math.sin(t * 0.21) * CFG.FG_SWAY, 0); ctx.globalAlpha = m.fog[1]; const fx = -((t * 6) % (W * 2)); ctx.drawImage(s.fog, fx, 170, W * 2, 70); ctx.drawImage(s.fog, fx + W * 2, 170, W * 2, 70); ctx.globalAlpha = 1; }
    ctx.drawImage(vignette(), 0, 0, W, H);
    ctx.restore();
  }
  const A0 = { vis: true, alpha: 1, scale: 1, dx: 0, dy: 0, flash: false };
  function drawMon(ctx, mon, x, y, t, o = {}) {
    const sp = mon && typeof mon === 'object' ? mon.sp : mon, a = Object.assign({}, A0, o.a || {});
    if (!sp || !a.vis || a.alpha <= 0) return;
    const back = !!o.back, big = (o.big || 1) > 1, f = frames(sp, back, big); if (!f) return;
    const p = params(sp), lo = !!G.lowFx, N = f.a.lw || f.a.width, tt = t + (o.phase || 0), sc = a.scale, al = Math.max(0, Math.min(1, a.alpha));
    const br = Math.sin(tt * p.breatheSpd);
    const hov = p.float ? (Math.sin(tt * p.floatSpd) * 0.5 + 0.5) * p.float + p.float * 0.6 : 0;
    const sx = 1 - br * p.breathe * (lo ? 0.4 : 0.6), sy = 1 + br * p.breathe * (lo ? 0.7 : 1);
    const sway = p.sway && !lo ? Math.sin(tt * 1.1) * p.sway : 0, gy = back ? N + 2 : N * 62 / 64;
    x += a.dx; y += a.dy;
    ctx.save(); ctx.imageSmoothingEnabled = CFG.SOFT;
    // 1) Bodenschatten, schrumpft mit der Schwebehöhe
    const shs = 1 - hov / 14; ctx.globalAlpha = al * (back ? 0.5 : 0.75) * (0.5 + 0.5 * shs);
    const sw = N * 0.42 * sc * (0.7 + 0.3 * shs) * (1 + br * 0.02) * (big ? 1.2 : 1); ctx.drawImage(shadow(), x - sw, y - 3 - sw * 0.12, sw * 2, sw * 0.5);
    // 2) Seelenlicht
    if (!back && !a.flash) { ctx.globalCompositeOperation = 'lighter'; ctx.globalAlpha = al * (lo ? 0.10 : CFG.SOUL_A + 0.05 * Math.sin(tt * 1.3)) * p.glow; const r = N * 0.75 * sc; ctx.drawImage(glow(p.col), x - r, y - hov - N * 0.45 * sc - r, r * 2, r * 2); ctx.globalCompositeOperation = 'source-over'; }
    // 3) Körper
    const blink = !back && f.bl && ((tt % p.blink) < 0.13 || (!lo && (tt % (p.blink * 2.7)) > 0.3 && (tt % (p.blink * 2.7)) < 0.42));
    ctx.globalAlpha = al; ctx.translate(Math.round(x * 2) / 2, Math.round((y - hov) * 2) / 2); if (sway) ctx.transform(1, 0, sway, 1, 0, 0); ctx.scale(sx * sc, sy * sc);
    const dx = -N / 2, dy = -gy;
    if (a.flash && f.w) ctx.drawImage(f.w, dx, dy, N, N);
    else {
      ctx.drawImage(blink ? f.bl : f.a, dx, dy, N, N);
      if (!lo && !blink && br > 0 && f.b !== f.a) { ctx.globalAlpha = al * Math.min(1, br * 1.4) * 0.9; ctx.drawImage(f.b, dx, dy, N, N); }
      if (!lo && p.rim && al > 0.3) { ctx.globalCompositeOperation = 'lighter'; ctx.globalAlpha = al * p.rim * CFG.RIM_A; ctx.drawImage(f.rim, dx, dy, N, N); }
      const gl = f.a.glows;
      if (gl && !lo && al > 0.3) { ctx.globalCompositeOperation = 'lighter';
        for (let i = 0; i < gl.length; i++) { const [gx, gy2, r, col] = gl[i], kk = 0.6 + 0.25 * Math.sin(tt * 3 + i * 2.1) + 0.15 * Math.sin(tt * 7.3 + i); const R = Math.max(4, r * 2) * p.glow; ctx.globalAlpha = al * 0.55 * kk; ctx.drawImage(glow(col), dx + gx - R, dy + gy2 - R, R * 2, R * 2); } }
    }
    ctx.restore();
    // 4) Partikel (deterministisch aus t)
    if (a.flash || al < 0.8) return;
    const n = lo ? 2 : p.motes, rr = N * 0.34 * sc;
    ctx.save(); ctx.globalCompositeOperation = 'lighter';
    for (let i = 0; i < n; i++) {
      const sp_ = 0.18 + hash(i + 7) * 0.12, q = (tt * sp_ + hash(i)) % 1, life = Math.sin(q * Math.PI);
      let px = x + (hash(i + 3) * 2 - 1) * rr + Math.sin(tt * 1.3 + i * 4) * 3, py = y - hov - 4 - q * N * 0.9 * sc, s = 1.6 + hash(i + 11) * 1.4, col = p.col, aa = 0.7 * life;
      if (p.mote === 'ember') { col = '#ffb050'; px += q * 6; }
      else if (p.mote === 'wisp') { s = 4 + q * 5; aa = 0.22 * life; col = '#e8dcff'; }
      else if (p.mote === 'bubble') { s = 1.4; aa = 0.5 * life; }
      else if (p.mote === 'shade') { ctx.globalCompositeOperation = 'source-over'; s = 4 + q * 4; ctx.globalAlpha = 0.35 * life; ctx.drawImage(glow('#120a20'), px - s, py - s, s * 2, s * 2); ctx.globalCompositeOperation = 'lighter'; continue; }
      else if (p.mote === 'rune') { py = y - hov - N * 0.3 * sc + Math.sin(tt * 0.8 + i * 1.7) * N * 0.3; px = x + Math.cos(tt * 0.7 + i * TAU / n) * rr * 1.1; aa = 0.5 + 0.3 * Math.sin(tt * 2 + i); }
      ctx.globalAlpha = aa; ctx.drawImage(glow(col), px - s, py - s, s * 2, s * 2);
    }
    ctx.restore();
  }
  function drawBossReflection(ctx, mon, x, y, a = A0) {
    if (G.lowFx) return; const sp = mon && typeof mon === 'object' ? mon.sp : mon, f = sp && frames(sp, false, true); if (!f) return;
    ctx.save(); ctx.globalAlpha = 0.16 * (a.alpha == null ? 1 : a.alpha); ctx.translate(x + (a.dx || 0), y); ctx.scale(1, -0.45); ctx.drawImage(f.a, -42, -82, 84, 84); ctx.restore();
  }
  // Boss: eigene Bühne nur wenn CFG.BOSS_OWN_STAGE, sonst Gebiet
  const kindForBattle = (B, areaKind) => B && B.boss && CFG.BOSS_OWN_STAGE ? 'boss' : areaKind;

  // v24: Szene-Label für ?perf=1-Overlay (Anzeige in env.js → G.perfHud)
  function perfScene() {
    if (G.mode !== 'battle') return null;
    const k = (G.B && (G.B.bgKind || G.B.areaKind)) || null;
    return k ? 'Kampf · ' + k : 'Kampf';
  }
  G.Stage = { CFG, MOOD, KINDS: Object.keys(MOOD), OVR, params, kindFor, kindForBattle, drawBackground, drawForeground, drawMon, drawBossReflection, autoFx, get perfScene() { return perfScene(); },
    prewarm(kind) { stage(K(kind)); if (G.lowFx) flat(K(kind)); },   // optional beim Kampfstart, damit der erste Frame nicht ruckelt
    clearCache() { for (const o of [STAGE, FLAT, FR]) for (const k in o) delete o[k]; } };
})(window.G);
