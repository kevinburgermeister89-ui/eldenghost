// v23: Grafik-Upgrade Phase 2 – Karten & Umgebung (Stimmungsfarbe, leichter Nebel, Partikel, Vordergrund-Silhouetten, Bloom, Vignette).
// Wird von G.World.render nach dem Licht und vor den Ereignissen aufgerufen; ersetzt den alten Blob-/Schichtnebel und die Vignette.
// Optimiert: alles Teure wird einmal je Thema vorgerechnet (Nebelkachel, Farbverlauf, Vignette, Silhouetten, Licht-Sprites).
// G.lowFx: keine Silhouetten, kein Bloom, halb so viele Partikel, einfacher Nebel (eine Schicht, keine Lichtlöcher).
(() => {
  const VW = G.VW || 256, VH = G.VH || 240;
  const mk = (w, h) => { const c = document.createElement('canvas'); c.width = w; c.height = h; return c; };
  const hash = (a, b) => { const s = Math.sin(a * 127.1 + b * 311.7) * 43758.5453; return s - Math.floor(s); };
  // Stimmung je Thema. fogA bewusst niedrig (Kevin: deutlich weniger Nebel, v. a. im Moor) – Figur und Weg bleiben lesbar.
  const MOOD = {
    dorf:   { top: '58,52,96',  bot: '120,96,80', grade: 0.10, fog: '200,206,232', fogA: 0.05, parts: 'flies', fg: 'branch', fgc: '14,12,26', vig: 0.55 },
    moor:   { top: '40,70,78',  bot: '70,96,70',  grade: 0.12, fog: '196,222,214', fogA: 0.06, parts: 'wisps', fg: 'reed',   fgc: '10,20,18', vig: 0.6 },
    kueste: { top: '60,90,130', bot: '110,120,140', grade: 0.10, fog: '210,222,240', fogA: 0.05, parts: 'spray', fg: 'grass', fgc: '16,20,32', vig: 0.55 },
    cave:   { top: '30,26,44',  bot: '60,46,40',  grade: 0.12, fog: '150,140,150', fogA: 0.03, parts: 'dust',  fg: 'stal',   fgc: '8,6,12',  vig: 0.7 },
    asche:  { top: '90,40,30',  bot: '60,30,30',  grade: 0.10, fog: '120,96,90',  fogA: 0.04, parts: 'embers', fg: 'ash',  fgc: '20,8,6',  vig: 0.6 },
  };
  const themeOf = m => m.theme === 'moor' ? 'moor' : m.id === 'kueste' ? 'kueste' : m.theme === 'cave' ? 'cave' : m.theme === 'asche' ? 'asche' : 'dorf';
  const cache = {};
  function glow(rgb, r = 32) { const c = mk(r * 2, r * 2), g = c.getContext('2d'), gr = g.createRadialGradient(r, r, 0, r, r, r);
    gr.addColorStop(0, `rgba(${rgb},1)`); gr.addColorStop(0.35, `rgba(${rgb},0.45)`); gr.addColorStop(1, `rgba(${rgb},0)`); g.fillStyle = gr; g.fillRect(0, 0, r * 2, r * 2); return c; }
  const SPR = { hole: glow('0,0,0'), bwarm: glow('255,190,110'), bcool: glow('170,150,255'), bghost: glow('140,220,255'),
    fly: glow('230,255,150', 6), wisp: glow('150,240,220', 8), spray: glow('230,240,255', 4), dust: glow('220,200,170', 4), ember: glow('255,140,60', 4) };
  function build(th) {
    const M = MOOD[th], o = {};
    // Nebelkachel 128², kachelbar, Farbe + Deckkraft eingebacken
    o.fog = mk(128, 128); { const g = o.fog.getContext('2d');
      for (let i = 0; i < 26; i++) { const x = hash(i, 1) * 128, y = hash(i, 2) * 128, r = 14 + hash(i, 3) * 26, a = 0.25 + hash(i, 4) * 0.35;
        for (const dx of [-128, 0, 128]) for (const dy of [-128, 0, 128]) { const gr = g.createRadialGradient(x + dx, y + dy, 0, x + dx, y + dy, r);
          gr.addColorStop(0, `rgba(${M.fog},${a})`); gr.addColorStop(1, `rgba(${M.fog},0)`); g.fillStyle = gr; g.fillRect(x + dx - r, y + dy - r, r * 2, r * 2); } } }
    // Farbverlauf (multiply) + Vignette, je einmal
    o.grade = mk(VW, VH); { const g = o.grade.getContext('2d'), gr = g.createLinearGradient(0, 0, 0, VH);
      gr.addColorStop(0, `rgb(${M.top})`); gr.addColorStop(1, `rgb(${M.bot})`); g.fillStyle = gr; g.fillRect(0, 0, VW, VH); }
    o.vig = mk(VW, VH); { const g = o.vig.getContext('2d'), gr = g.createRadialGradient(VW / 2, VH / 2, VH * 0.42, VW / 2, VH / 2, VH * 0.85);
      gr.addColorStop(0, 'rgba(6,4,18,0)'); gr.addColorStop(1, `rgba(6,4,18,${M.vig})`); g.fillStyle = gr; g.fillRect(0, 0, VW, VH); }
    // Vordergrund-Silhouetten: 512 breiter Streifen, nur an den Bildrändern (oben/unten max. 22 px), nie über der Bildmitte
    o.fg = mk(512, VH); { const g = o.fg.getContext('2d'); g.fillStyle = `rgba(${M.fgc},0.85)`; g.strokeStyle = `rgba(${M.fgc},0.85)`;
      for (let i = 0; i < 14; i++) { const x = hash(i, 7) * 512, h = 8 + hash(i, 8) * 14;
        if (M.fg === 'reed' || M.fg === 'grass') { g.lineWidth = M.fg === 'reed' ? 1.5 : 1; for (let k = 0; k < 5; k++) { g.beginPath(); g.moveTo(x + k * 3, VH); g.quadraticCurveTo(x + k * 3 + 2, VH - h * 0.6, x + k * 3 + (k - 2) * 2, VH - h - k); g.stroke(); } }
        else if (M.fg === 'stal') { g.beginPath(); g.moveTo(x - 5, 0); g.lineTo(x, h); g.lineTo(x + 5, 0); g.fill(); }
        else if (M.fg === 'branch' && i % 3 === 0) { g.lineWidth = 2; g.beginPath(); g.moveTo(x, 0); g.quadraticCurveTo(x + 12, h, x + 30, h * 0.6); g.stroke(); for (let k = 0; k < 4; k++) { g.beginPath(); g.ellipse(x + 8 + k * 6, h * 0.6 + (k % 2) * 3, 4, 2, 0.4, 0, 7); g.fill(); } }
        else if (M.fg === 'ash' && i % 2 === 0) { g.beginPath(); g.ellipse(x, VH + 2, 16, h * 0.6, 0, 0, 7); g.fill(); } } }
    return o;
  }
  const P = { list: [], th: null };
  function particles(ctx, th, cx, cy, t, dt, n) {
    if (P.th !== th) { P.list = []; P.th = th; }
    const kind = MOOD[th].parts;
    while (P.list.length < n) P.list.push({ x: Math.random() * (VW + 40), y: Math.random() * VH, ph: Math.random() * 6, v: 0.5 + Math.random() });
    P.list.length = n;
    const s = kind === 'flies' ? SPR.fly : kind === 'wisps' ? SPR.wisp : kind === 'spray' ? SPR.spray : kind === 'embers' ? SPR.ember : SPR.dust;
    ctx.globalCompositeOperation = 'lighter';
    for (const p of P.list) {
      if (kind === 'embers') p.y -= 10 * p.v * dt; else if (kind === 'spray') { p.x += 14 * p.v * dt; p.y += Math.sin(t + p.ph) * 4 * dt; } else { p.x += Math.sin(t * 0.7 + p.ph) * 5 * dt; p.y += Math.cos(t * 0.9 + p.ph) * 3 * dt + (kind === 'dust' ? 2 * dt : 0); }
      if (p.y < -6) p.y = VH + 4; if (p.y > VH + 6) p.y = -4; if (p.x > VW + 20) p.x = -20;
      const x = ((p.x - cx * 0.3) % (VW + 40) + VW + 40) % (VW + 40) - 20, b = 0.35 + 0.35 * Math.sin(t * 1.7 + p.ph);
      if (b < 0.05) continue; ctx.globalAlpha = b; const r = kind === 'wisps' ? 4 : 2.5; ctx.drawImage(s, x - r, p.y - r, r * 2, r * 2);
    }
    ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over';
  }
  let fogC = null, fogG = null;
  const Env = G.Env = { MOOD, themeOf, on: true, stats: { frames: 0, ms: 0 },
    // vis: [x, y, r, L] Lichter in Bildschirmkoordinaten (aus G.World.render); pl: Figur [x,y] oder null
    render(ctx, m, cx, cy, t, dt, vis, pl) {
      Env.lastMap = m; const t0 = performance.now(), th = themeOf(m), M = MOOD[th], o = cache[th] || (cache[th] = build(th)), low = !!G.lowFx, fogOff = G.fxOff && G.fxOff.fog;
      ctx.save(); ctx.imageSmoothingEnabled = true;
      // 1) Stimmungsfarbe
      ctx.globalCompositeOperation = 'soft-light'; ctx.globalAlpha = M.grade * 3; ctx.drawImage(o.grade, 0, 0);
      ctx.globalCompositeOperation = 'source-over'; ctx.globalAlpha = 1;
      // 2) Nebel: eine leichte Schicht aus der vorgerechneten Kachel; bei vollen Effekten mit Löchern an Figur und Lichtern
      if (!fogOff && M.fogA > 0) {
        if (!fogC) { fogC = mk(VW, VH); fogG = fogC.getContext('2d'); }
        const pat = o.pat || (o.pat = fogG.createPattern(o.fog, 'repeat'));
        fogG.globalCompositeOperation = 'source-over'; fogG.setTransform(1, 0, 0, 1, 0, 0); fogG.clearRect(0, 0, VW, VH);
        const ox = ((cx * 0.6 + t * 5) % 128 + 128) % 128, oy = ((cy * 0.4) % 128 + 128) % 128;
        fogG.setTransform(1, 0, 0, 1, -ox, -oy); fogG.fillStyle = pat; fogG.fillRect(0, 0, VW + 128, VH + 128); fogG.setTransform(1, 0, 0, 1, 0, 0);
        if (!low) { fogG.globalCompositeOperation = 'destination-out';
          if (pl) fogG.drawImage(SPR.hole, pl[0] - 56, pl[1] - 56, 112, 112);
          for (const [x, y, r] of vis) fogG.drawImage(SPR.hole, x - r * 0.7, y - r * 0.7, r * 1.4, r * 1.4); }
        ctx.globalAlpha = M.fogA * (low ? 0.8 : 1); ctx.drawImage(fogC, 0, 0); ctx.globalAlpha = 1;
      }
      // 3) Partikel
      const nP = { flies: 0, wisps: 10, spray: 18, dust: 16, embers: 0 }[M.parts];   // Dorf: Glühwürmchen kommen schon aus world.js, Asche: Funken aus renderAsche
      if (nP) particles(ctx, th, cx, cy, t, dt, low ? nP >> 1 : nP);
      // 4) Bloom nur bei hohen Effekten: weiche Sprites über den Lichtquellen
      if (!low) { ctx.globalCompositeOperation = 'lighter';
        for (const [x, y, r, L] of vis) { if (L.self) continue; ctx.globalAlpha = L.warm ? 0.12 : 0.1; const s = L.warm ? SPR.bwarm : L.ghost ? SPR.bghost : SPR.bcool, R = r * 0.45; ctx.drawImage(s, x - R, y - R, R * 2, R * 2); }
        ctx.globalCompositeOperation = 'source-over'; ctx.globalAlpha = 1; }
      // 5) Vordergrund-Silhouetten (Parallaxe 1.2, nur hohe Effekte, nur draussen + Höhle)
      if (!low && (m.kind === 'outdoor' || th === 'cave')) { const ox = ((cx * 1.2) % 512 + 512) % 512; ctx.drawImage(o.fg, -ox, 0); ctx.drawImage(o.fg, 512 - ox, 0); }
      // 6) Vignette (ersetzt die alte G.vignette)
      ctx.drawImage(o.vig, 0, 0);
      ctx.restore();
      Env.stats.frames++; Env.stats.ms += performance.now() - t0;
    } };
  // v24: Fyrlumen-Silhouette (~32×32) für den Lampen-Moment – dunkel, Prismenschwingen, sanft ein/aus über p 0..1.
  // x,y: Mitte unten der Silhouette (Bildschirm). lowFx: kein Schimmer, keine Facettenkanten.
  Env.drawFyrlumen = (ctx, x, y, p, t) => {
    if (!(p > 0 && p < 1)) return;
    const e = p < 0.3 ? p / 0.3 : p > 0.7 ? (1 - p) / 0.3 : 1, a = e * e * (3 - 2 * e), low = !!G.lowFx;
    if (a <= 0.01) return; t = t == null ? (G.time || 0) : t;
    const cx = Math.round(x), by = Math.round(y - p * 5), fl = Math.sin(t * 6) * 1.2, wv = Math.sin(p * Math.PI * 2) * 1.5;
    ctx.save(); ctx.translate(cx, by);
    // Halo hinter der Gestalt
    ctx.globalAlpha = a * 0.55; const hg = ctx.createRadialGradient(0, -16, 2, 0, -16, 20);
    hg.addColorStop(0, 'rgba(190,220,255,0.7)'); hg.addColorStop(1, 'rgba(120,140,255,0)'); ctx.fillStyle = hg; ctx.fillRect(-20, -36, 40, 40);
    // Prismenschwingen: je drei Facetten
    const HUES = [200, 260, 320, 40, 160];
    for (const sd of [-1, 1]) for (let i = 0; i < 3; i++) {
      const tip = [sd * (8 + i * 4.5), -27 + i * 7 + wv * sd * 0.3 - fl * (i === 0 ? 1 : 0.4)], r0 = [sd * 2, -19 + i * 2], r1 = [sd * 3, -12 + i * 2.5];
      ctx.globalAlpha = a * (low ? 0.75 : 0.85); ctx.fillStyle = low ? '#1a1830' : 'rgba(22,18,44,0.95)';
      ctx.beginPath(); ctx.moveTo(r0[0], r0[1]); ctx.lineTo(tip[0], tip[1]); ctx.lineTo(r1[0], r1[1]); ctx.closePath(); ctx.fill();
      if (!low) {
        const hu = HUES[(i + Math.floor(t * 3 + (sd > 0 ? 2 : 0))) % 5], sh = 0.5 + 0.5 * Math.sin(t * 5 + i * 1.7 + sd);
        ctx.globalCompositeOperation = 'lighter'; ctx.globalAlpha = a * (0.35 + 0.45 * sh);
        ctx.strokeStyle = `hsl(${hu},90%,72%)`; ctx.lineWidth = 0.8; ctx.beginPath(); ctx.moveTo(r0[0], r0[1]); ctx.lineTo(tip[0], tip[1]); ctx.stroke();
        ctx.globalAlpha = a * 0.25 * sh; ctx.fillStyle = `hsl(${(hu + 40) % 360},90%,65%)`; ctx.fill();
        ctx.globalCompositeOperation = 'source-over';
      }
    }
    // Körper: schlanker dunkler Leib, Maske mit Hörnerkrone (Hollow-Knight-artig)
    ctx.globalAlpha = a; ctx.fillStyle = '#0c0a18';
    ctx.beginPath(); ctx.moveTo(0, -18); ctx.quadraticCurveTo(5, -10, 2.5, -2); ctx.lineTo(0, 1); ctx.lineTo(-2.5, -2); ctx.quadraticCurveTo(-5, -10, 0, -18); ctx.fill();
    ctx.fillStyle = '#d8dcf0'; ctx.beginPath(); ctx.ellipse(0, -22, 4, 4.5, 0, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.moveTo(-3, -24); ctx.lineTo(-5, -31); ctx.lineTo(-1.5, -25.5); ctx.moveTo(3, -24); ctx.lineTo(5, -31); ctx.lineTo(1.5, -25.5); ctx.fill();
    ctx.fillStyle = '#0c0a18'; ctx.fillRect(-2.5, -23, 1.5, 2.5); ctx.fillRect(1, -23, 1.5, 2.5);
    if (!low) { ctx.globalCompositeOperation = 'lighter'; ctx.globalAlpha = a * (0.5 + 0.3 * Math.sin(t * 4)); ctx.fillStyle = '#9fd8ff'; ctx.fillRect(-0.5, -12, 1, 2); }
    ctx.restore();
  };
  // v24: Perf-Overlay (nur mit ?perf=1). Hook wird aus der Hauptschleife aufgerufen; ohne Parameter ist G.perfHud null.
  G.perfHud = null;
  try { if (/[?&]perf=1\b/.test(location.search)) {
    const el = document.createElement('div'); el.id = 'perfHud';
    el.style.cssText = 'position:fixed;left:max(6px,env(safe-area-inset-left));top:max(6px,env(safe-area-inset-top));z-index:9999;pointer-events:none;' +
      'font:bold 14px/1.35 ui-monospace,Menlo,monospace;color:#e8f4ff;background:rgba(8,6,20,0.78);padding:6px 9px;border-radius:6px;white-space:pre;text-shadow:0 1px 0 #000';
    const st = { n: 0, sum: 0, peak: 0, gaps: 0, last: 0, t0: 0, out: null };
    G.perfHud = (now, rms) => {
      if (!el.parentNode && document.body) document.body.appendChild(el);
      if (st.last) { st.gaps += now - st.last; st.n++; } st.last = now; st.sum += rms; st.peak = Math.max(st.peak, rms);
      if (!st.t0) st.t0 = now; if (now - st.t0 < 500 || !st.n) return;
      const fps = st.n * 1000 / st.gaps, avg = st.sum / st.n, sc = G.mode === 'battle' ? ((G.Stage && G.Stage.perfScene) || ('Kampf' + (G.B && G.B.bgKind ? ' · ' + G.B.bgKind : ''))) : G.mode === 'world' ? 'Karte' + (G.map ? ' · ' + G.map.id : '') : (G.mode || 'Titel');
      st.out = { fps: Math.round(fps), avg: +avg.toFixed(1), peak: +st.peak.toFixed(1), fx: G.fxMode, low: !!G.lowFx, scene: sc };
      el.textContent = `${st.out.fps} fps\n${st.out.avg} ms Ø · ${st.out.peak} ms max\nfx ${G.fxMode}${G.lowFx ? ' · lowFx' : ''}\n${sc}`;
      G.perfHud.last = st.out; st.n = st.sum = st.peak = st.gaps = 0; st.t0 = now;
    };
  } } catch (e) { G.perfHud = null; }
})();
