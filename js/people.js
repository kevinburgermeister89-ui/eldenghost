'use strict';
// Eldenghost – Oberwelt-Figuren im Comic-Pixelstil (Gen-4/5-Proportionen: grosser Kopf, kurzer Körper; eigene Entwürfe)
// Rahmen 20×26 (logisch, 2× fein gerastert), Füsse unten mittig (Zeile 24). Richtungen down/up/left, right = gespiegelt;
// 4 Gangphasen je Richtung, dazu 3 Ruhebilder (Atmen, Blinzeln).
(function (G) {
  const A = G.Art, W = 20, HH = 26, K = 2; // Figuren werden 2× fein gerastert (40×52) und als hochaufgelöste Leinwand (logisch 20×26) geführt
  const hexA = h => { const n = parseInt(h.slice(1), 16); return [n >> 16 & 255, n >> 8 & 255, n & 255]; };
  const toHex = a => '#' + a.map(v => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, '0')).join('');
  const shade = (h, f) => toHex(hexA(h).map(v => v * f));
  const lift = (h, f) => toHex(hexA(h).map(v => v + (255 - v) * f));
  // Gangphasen: 0 = linker Fuss vorn (Kontakt), 1 = Durchschwung, 2 = rechter Fuss vorn (Kontakt), 3 = Durchschwung
  // idle: { breath: 0|1, blink: bool } – Atmen (Schultern sinken ½ Pixel) und Blinzeln im Stand
  function person(c, dir, ph, idle) {
    const S = new A.Shape(), k = c.child ? 1 : 0, side = dir === 'left', up = dir === 'up';
    const walk = ph != null && ph >= 0, br = idle && idle.breath ? 0.5 : 0, blink = idle && idle.blink;
    const cx = 10, hy = 8.6 + k * 2.2 + br * 0.6, hr = c.child ? 5.6 : 6.2;
    const lg = c.legs || '#3a3040', boot = c.boot || '#2a2230';
    const swing = !walk ? 0 : ph === 0 ? 1 : ph === 2 ? -1 : 0;           // Beine vor/zurück
    const pass = walk && (ph === 1 || ph === 3);                           // Durchschwung: ein Fuss angehoben
    const longCoat = !!c.coat, skirt = c.skirt || c.robe;
    // ---- Beine / Füsse ----
    if (!skirt || walk) {
      if (side) {
        const a = swing * 2.2, liftF = pass ? 1 : 0;
        S.C(cx - 0.2 - a * 0.35, 19, cx - 0.2 + a * 0.6, 22.4 - (ph === 1 ? liftF : 0), 2.8, shade(lg, 0.8), { g: 'legB' });
        S.R(cx - 1.6 + a * 0.6 - 0.8, 22 - (ph === 1 ? liftF : 0), 3.6, 2, shade(boot, 0.85), { g: 'bootB' });
        S.C(cx + 0.2 + a * 0.35, 19, cx + 0.2 - a * 0.6, 22.4 - (ph === 3 ? liftF : 0), 3, lg, { g: 'leg' });
        S.R(cx - 1.4 - a * 0.6 - 0.8, 22 - (ph === 3 ? liftF : 0), 3.8, 2, boot, { g: 'boot' });
        S.R(cx - 1.4 - a * 0.6 - 0.8, 23.4 - (ph === 3 ? liftF : 0), 3.8, 0.6, shade(boot, 0.6), { g: 'boot', flat: true, line: false });
      } else {
        const l = ph === 0 ? -1.2 : ph === 1 ? -0.6 : 0, r = ph === 2 ? -1.2 : ph === 3 ? -0.6 : 0;
        const fwdL = ph === 2 ? 0.4 : 0, fwdR = ph === 0 ? 0.4 : 0; // vorderer Fuss wirkt minimal grösser
        S.R(cx - 3.5, 19, 3, 4 + l, lg, { g: 'leg' }).R(cx + 0.5, 19, 3, 4 + r, lg, { g: 'leg' });
        S.R(cx - 4 - fwdL * 0.5, 22 + l, 3.6 + fwdL, 2 + fwdL * 0.4, boot, { g: 'boot' }).R(cx + 0.4 - fwdR * 0.5, 22 + r, 3.6 + fwdR, 2 + fwdR * 0.4, boot, { g: 'boot' });
        S.R(cx - 0.5, 19, 1, 3, shade(lg, 0.7), { flat: true, line: false, clip: 'leg' });
      }
    }
    // ---- Körper ----
    const by = 16.8 + k * 1.5 + br;
    if (c.cape) S.P(side ? [[cx - 3, 12 + br], [cx + 5, 12 + br], [cx + 6.5 + (walk ? 0.6 : 0), 22], [cx - 3, 22]] : [[cx - 5, 12 + br], [cx + 5, 12 + br], [cx + 6, 22.4], [cx - 6, 22.4]], c.cape, { name: 'cape' });
    if (c.cape && !side) S.C(cx - 4, 21.6, cx + 4, 21.6, 0.7, shade(c.cape, 0.7), { clip: 'cape', flat: true, line: false });
    const bw = side ? 4 : 4.8, bh = 4.4 - k * 0.6;
    S.E(cx, by, bw, bh, c.body, { name: 'body', hiAt: 0.95 });
    // Mantel (Kapitänin, Wärter): reicht bis zum Knie, vorne offen, Knöpfe
    if (longCoat) {
      const cw = side ? 4.4 : 5.2, sw2 = walk ? swing * 0.6 : 0;
      S.P(side ? [[cx - cw, by - 2], [cx + cw, by - 2], [cx + cw + 0.8 - sw2, 21.2], [cx - cw - 0.4 + sw2, 21.2]] : [[cx - cw, by - 2.5], [cx + cw, by - 2.5], [cx + cw + 1.2, 21.4], [cx - cw - 1.2, 21.4]], c.coat, { name: 'coat', g: 'coat' });
      if (!up && !side) { S.P([[cx - 0.4, by - 1], [cx + 0.4, by - 1], [cx + 0.8, 21.4], [cx - 0.8, 21.4]], shade(c.coat, 0.55), { clip: 'coat', flat: true, line: false }); }
      if (!up && c.buttons) for (let i = 0; i < 3; i++) { const yy = by - 1.4 + i * 1.8; if (side) S.R(cx - 2.6, yy, 0.8, 0.8, c.buttons, { glow: true, clip: 'coat', flat: true, line: false }); else S.R(cx - 1.9, yy, 0.8, 0.8, c.buttons, { glow: true, clip: 'coat', flat: true, line: false }).R(cx + 1.1, yy, 0.8, 0.8, c.buttons, { glow: true, clip: 'coat', flat: true, line: false }); }
      S.C(cx - 4, 20.8, cx + 4, 20.8, 0.5, shade(c.coat, 0.65), { clip: 'coat', flat: true, line: false });
    }
    if (skirt) {
      const sk = c.skirt || c.robe, sw3 = walk ? swing * 0.5 : 0, ybot = c.robe ? 23.6 : 22;
      S.P([[cx - 4.5, by], [cx + 4.5, by], [cx + 5.5 + sw3, ybot], [cx - 5.5 + sw3, ybot]], sk, { g: 'skirt', name: 'skirt' });
      // Faltenwurf
      for (const fx of side ? [-1.5, 1.5] : [-2.6, 0, 2.6]) S.C(cx + fx * 0.8, by + 1.2, cx + fx + sw3 * 0.5, ybot - 0.6, 0.45, shade(sk, 0.72), { clip: 'skirt', flat: true, line: false });
    }
    // Stofffalten und Gürtel
    if (!longCoat) {
      S.C(cx - (side ? 1.2 : 2.2), by + 0.4, cx - (side ? 0.4 : 1.4), by + 3.2, 0.45, shade(c.body, 0.7), { clip: 'body', flat: true, line: false });
      if (!side) S.C(cx + 2.2, by + 0.4, cx + 1.4, by + 3.2, 0.45, shade(c.body, 0.7), { clip: 'body', flat: true, line: false });
    }
    if (c.belt) S.R(cx - 5, by + 1.6, 10, 1, c.belt, { clip: 'body', flat: true, line: false });
    if (c.belt && !up && !side) S.R(cx - 0.6, by + 1.5, 1.2, 1.2, '#d8b860', { clip: 'body', flat: true, line: false });
    if (c.apron && !up) { S.R(side ? cx - 3.5 : cx - 2.5, by - 1, side ? 3 : 5, 6, c.apron, { flat: true, clip: 'body', line: false }); if (!side) S.R(cx - 1.2, by + 1.6, 2.4, 1.4, shade(c.apron, 0.8), { flat: true, clip: 'body', line: false }); }
    if (c.strap && !side) S.C(up ? cx + 3.8 : cx - 3.8, by - 3.4, up ? cx - 3 : cx + 3, by + 2.4, 0.9, c.strap, { clip: 'body', flat: true, line: false });
    if (c.strap && (side || up)) S.R(side ? cx + 2.4 : cx - 4.8, by + 1, 2.8, 2.6, shade(c.strap, 1.15), { g: 'bag' });
    if (c.pendant && !up) S.E(side ? cx - 2.4 : cx, by - 2, 0.9, 1, c.pendant, { glow: true, clip: longCoat ? 'coat' : 'body', flat: true, line: false });
    if (c.scarf) S.E(cx, by - 3.2, side ? 3.8 : 4.6, 1.6, c.scarf, { g: 'scarf', name: 'scarf' });
    if (c.scarf && (side || up)) S.C(side ? cx + 2.6 : cx + 2.4, by - 2.8, side ? cx + 4.6 + (walk ? 0.8 : 0) : cx + 3, by + 0.6, 1.1, shade(c.scarf, 0.85), { g: 'scarf' }); // wehendes Schalende
    if (c.epaulette && !up) { S.E(cx - (side ? 0 : 4.4), by - 3, 1.4, 0.8, c.epaulette, { glow: true }); if (!side) S.E(cx + 4.4, by - 3, 1.4, 0.8, c.epaulette, { glow: true }); }
    // ---- Arme (schwingen gegengleich zu den Beinen) ----
    const as = walk ? -swing : 0, armC = c.sleeve || (longCoat ? c.coat : c.body);
    if (side) {
      S.C(cx + 0.5, by - 2, cx + 0.5 - as * 2.2, by + 1.6, 2.6, armC, { g: 'arm', name: 'arm' });
      S.E(cx + 0.5 - as * 2.2, by + 2, 1.1, 1, c.skin, { g: 'arm' });
    } else {
      S.C(cx - 4.6, by - 2, cx - 5.2, by + 1.5 + as * 0.7, 2.4, armC, { g: 'arm' }).C(cx + 4.6, by - 2, cx + 5.2, by + 1.5 - as * 0.7, 2.4, armC, { g: 'arm' });
      if (!up) S.E(cx - 5.2, by + 2 + as * 0.7, 1, 0.9, c.skin, { g: 'arm' }).E(cx + 5.2, by + 2 - as * 0.7, 1, 0.9, c.skin, { g: 'arm' });
    }
    // ---- Gegenstände ----
    const hx = side ? cx - 2 - as * 1.4 : cx + 5.4, hy2 = side ? 0 : -as * 0.7;
    if (!up && c.item === 'lamp') {
      S.C(hx, by - 1 + hy2, hx, by + 1.5 + hy2, 0.8, '#3a3040', { flat: true });
      S.R(hx - 1.6, by + 1.5 + hy2, 3.2, 3.6, '#ffd878', { glow: true, name: 'lamp' }).E(hx, by + 3.2 + hy2, 0.8, 1, '#fff6d8', { glow: true, clip: 'lamp' });
      S.R(hx - 1.8, by + 1.2 + hy2, 3.6, 1, '#3a3040', { flat: true }).R(hx - 1.8, by + 5 + hy2, 3.6, 0.8, '#3a3040', { flat: true }).R(hx - 0.3, by + 1.5 + hy2, 0.6, 3.6, '#5a4a40', { clip: 'lamp', flat: true, line: false });
    }
    if (!up && c.item === 'staff') { S.C(hx, 8 + k, hx, 23, 1.4, '#6a4a30'); if (c.staffGem) S.E(hx, 7.4 + k, 1.2, 1.3, c.staffGem, { glow: true }); }
    if (!up && c.item === 'spade') { S.C(hx, 7, hx, 20, 1.2, '#6a4a30'); S.P([[hx - 1.6, 19], [hx + 1.6, 19], [hx + 1.3, 23], [hx, 23.8], [hx - 1.3, 23]], '#9a9aa8'); }
    if (!up && c.item === 'hammer') { S.C(hx, by - 3 + hy2, hx, by + 3 + hy2, 1.2, '#6a4a30'); S.R(hx - 2, by - 5 + hy2, 4, 2.6, '#6a6c7a').R(hx - 2, by - 5 + hy2, 4, 0.7, '#9a9cac', { flat: true, line: false }); }
    if (!up && c.item === 'sack') { S.E(side ? cx + 4.5 : cx - 5.8, by + 2.5, 2.8, 3.2, '#d8c8a0', { name: 'sack' }); S.C(side ? cx + 3.6 : cx - 6.6, by + 0.6, side ? cx + 5.4 : cx - 5, by + 0.6, 0.6, '#8a7a5a', { clip: 'sack', flat: true, line: false }); }
    if (c.item === 'sword') S.C(up ? cx + 3 : cx - 3.4, by - 5, up ? cx - 2 : cx + 1.8, by + 3.2, 1, '#a07848', { g: up ? 'swordF' : 'swordB' });
    if (!up && c.item === 'book') S.R(side ? cx - 3.6 : cx + 3.4, by, 3, 3.6, '#5a3a6a', { name: 'book' }).R(side ? cx - 3.6 : cx + 3.4, by + 1.4, 3, 0.6, '#e8d890', { clip: 'book', flat: true, line: false });
    // ---- Kopf ----
    const hair = c.hood || c.hair;
    if (c.bun && !side) S.E(cx, hy - hr + 0.5, 2.6, 2.2, c.hair);
    if (c.bun && side) S.E(cx + 4, hy - 3, 2.4, 2.2, c.hair);
    if (c.tail && !up) S.C(side ? cx + 5 : cx + 5.2, hy, side ? cx + 6 + (walk ? swing * 0.3 : 0) : cx + 6, hy + 5, 2.2, c.hair, { name: 'tail' });
    if (c.tail && up) S.C(cx, hy + 1, cx + (walk ? swing * 0.4 : 0), hy + 6.4, 2.4, c.hair);
    S.E(cx, hy, hr, hr - 0.4, hair, { name: 'head', g: 'head' });
    // Haarsträhnen / Stoffstruktur der Kapuze (fein, hell)
    const hl = lift(hair, 0.28);
    for (const [x0, x1] of up ? [[-3, -2], [0, 0.6], [3, 2]] : side ? [[1, 2.6], [3.4, 4.4]] : [[-4, -3.2], [4, 3.2]]) S.C(cx + x0, hy - hr + 1.4, cx + x1, hy - hr + 4.4, 0.5, hl, { clip: 'head', flat: true, line: false });
    if (up && !c.hood) S.C(cx - 1, hy + 2, cx + 1, hy + 3.6, 0.5, shade(hair, 0.7), { clip: 'head', flat: true, line: false });
    if (!up) {
      const fx = side ? cx - 2.2 : cx, frx = side ? 3.8 : 4.9;
      S.E(fx, hy + 2, frx, 4.2, c.skin, { clip: 'head', g: 'head', line: false, name: 'face', flatten: 0.25 });
      if (c.hood) S.E(fx, hy - 2.2, frx + 0.3, 1.5, c.hair || '#3a2a30', { clip: 'face', flat: true, line: false });  // Haarsträhnen unter der Kapuze
      else S.E(side ? fx + 0.8 : fx, hy - 2.5, frx + 1, 1.9, c.hair, { clip: 'face', line: false });                 // Pony
      if (!c.hood && !side) S.P([[cx - 1.2, hy - 1.2], [cx, hy - 2.6], [cx + 0.6, hy - 1]], c.hair, { clip: 'face', flat: true, line: false }); // Stirnsträhne
      const ey = hy + 1.2, eh = blink ? 0.6 : 2, eo = blink ? 1.2 : 0;
      if (side) { S.R(fx - 1.8, ey + eo, 1, eh, '#1a1428', { flat: true, line: false }); if (!blink) S.R(fx - 1.8, ey, 0.5, 0.5, '#fafaff', { flat: true, line: false }); }
      else { S.R(cx - 2.6, ey + eo, 1, eh, '#1a1428', { flat: true, line: false }).R(cx + 1.6, ey + eo, 1, eh, '#1a1428', { flat: true, line: false }); if (!blink) S.R(cx - 2.6, ey, 0.5, 0.5, '#fafaff', { flat: true, line: false }).R(cx + 1.6, ey, 0.5, 0.5, '#fafaff', { flat: true, line: false }); }
      if (c.brows && !blink) { if (side) S.R(fx - 2.2, ey - 1, 1.6, 0.5, c.brows, { flat: true, line: false }); else S.R(cx - 3, ey - 1, 1.6, 0.5, c.brows, { flat: true, line: false }).R(cx + 1.4, ey - 1, 1.6, 0.5, c.brows, { flat: true, line: false }); }
      if (c.glasses) { if (side) S.R(fx - 2.6, ey - 0.2, 2, 0.5, '#b8b0a0', { flat: true, line: false }); else S.R(cx - 3.4, ey - 0.2, 6.8, 0.5, '#b8b0a0', { flat: true, line: false }); }
      if (c.beard) S.E(side ? fx - 0.5 : cx, hy + 4.6, side ? 2.6 : 3.4, 2, c.beard, { g: 'beard', name: 'beard' });
      if (c.beard) S.C(side ? fx - 1 : cx - 1, hy + 4.4, side ? fx - 0.6 : cx - 0.6, hy + 6, 0.45, lift(c.beard, 0.3), { clip: 'beard', flat: true, line: false });
      else if (c.cheek !== false) { if (side) S.R(fx - 1, hy + 3.4, 1, 1, '#e89a9a', { flat: true, line: false, alpha: 0.7 }); else S.R(cx - 3.6, hy + 3.4, 1, 1, '#e89a9a', { flat: true, line: false, alpha: 0.7 }).R(cx + 2.6, hy + 3.4, 1, 1, '#e89a9a', { flat: true, line: false, alpha: 0.7 }); }
      if (!c.beard) { if (side) S.R(fx - 2.2, hy + 4.2, 1, 0.5, shade(c.skin, 0.6), { flat: true, line: false }); else S.R(cx - 0.6, hy + 4.4, 1.2, 0.5, shade(c.skin, 0.6), { flat: true, line: false }); }
      if (c.pipe) S.C(side ? fx - 2.4 : cx + 0.8, hy + 4.4, side ? fx - 4.4 : cx + 3, hy + 5.4, 0.6, '#5a3a24', { flat: true }).R(side ? fx - 5.2 : cx + 2.6, hy + 4.2, 1.2, 1.4, '#5a3a24');
    }
    if (c.hood) { S.E(cx, hy - hr + 1.6, hr - 1.2, 1.6, c.hoodRim || c.hood, { clip: 'head', line: false }); S.C(cx - hr + 1, hy + 1, cx - hr + 1.6, hy + 4, 0.5, shade(c.hood, 0.7), { clip: 'head', flat: true, line: false }); }
    if (c.hat) { S.E(cx, hy - hr + 2.6, hr + 1.6, 1.4, c.hat, { g: 'hat' }); S.E(cx, hy - hr + 1, hr - 1.5, 2.4, c.hat, { g: 'hat', name: 'crown' }); if (c.hatBand) S.R(cx - hr, hy - hr + 1.8, hr * 2, 0.8, c.hatBand, { clip: 'crown', flat: true, line: false }); if (c.badge && !up) S.E(side ? cx - 2 : cx, hy - hr + 1, 0.9, 0.8, c.badge, { glow: true }); }
    if (c.cap) { S.E(cx, hy - hr + 2.2, hr - 0.3, 2.6, c.cap, { g: 'hat', name: 'cap' }); if (!up) S.E(side ? cx - hr + 1.6 : cx, hy - hr + 4, side ? 2.4 : 3.6, 0.8, shade(c.cap, 0.7), { g: 'hat' }); }
    if (c.veil) S.P(side ? [[cx - 2, hy - hr + 0.6], [cx + hr + 0.6, hy - 1], [cx + hr + 1.2, by + 1], [cx + 2, by - 1]] : [[cx - hr - 0.6, hy - 1], [cx + hr + 0.6, hy - 1], [cx + hr + 1.4, by], [cx - hr - 1.4, by]], c.veil, up ? { name: 'veil' } : { name: 'veil', g: 'veilB' });
    return A.raster(S, W * K, HH * K, K, { mirror: false, thin: false, bold: true });
  }
  // gerastertes Bild als hochaufgelöste Leinwand (logisch 20×26)
  const hi = c => { c.s = K; c.lw = c.width / K; c.lh = c.height / K; return c; };
  function mirror(src) { const c = G.mk(src.width, src.height), g = c.getContext('2d'); g.translate(src.width, 0); g.scale(-1, 1); G.rawDraw(g, src, 0, 0); return src.s ? hi(c) : c; }
  const PEOPLE = {
    player: { hood: '#2f5a72', hoodRim: '#4a7a92', hair: '#3a2a34', skin: '#f0d8c4', body: '#2c4c62', legs: '#2a2838', boot: '#1e1820', scarf: '#a8404e', item: 'lamp', strap: '#6a4a34', belt: '#3a2a24' },
    ilse:   { hair: '#c4bcca', skin: '#ecd4c0', body: '#6a4478', skirt: '#3e2c44', item: 'staff', staffGem: '#bfe8ff', bun: true, cheek: false, scarf: '#8a6a9a', brows: '#9a90a0' },
    hedda:  { hair: '#c8743e', skin: '#f0d4bc', body: '#6e4c2e', apron: '#e2d4b2', legs: '#4a3424', tail: true, belt: '#4a3424' },
    oda:    { hair: '#5a3e30', skin: '#e8ccb4', body: '#4a5c78', legs: '#34405a', bun: true, glasses: true, apron: '#c8b890' },
    fenn:   { hair: '#e8b448', skin: '#f4dcc8', body: '#8a3c3c', legs: '#3a3050', child: true, item: 'sword', belt: '#5a3424' },
    wido:   { hair: '#8a8a8a', skin: '#dcc0aa', body: '#3e3e36', beard: '#b4b4b4', item: 'spade', hat: '#2e2e2a', hatBand: '#5a4a3a', legs: '#2a2a26', brows: '#b4b4b4' },
    jorin:  { hair: '#4a3a2a', skin: '#dcbca2', body: '#5e5432', beard: '#4a3a2a', legs: '#3a3424', belt: '#3a2a1c', strap: '#4a3a24' },
    selma:  { hair: '#2e2640', skin: '#ecd8c8', body: '#2e4c5e', legs: '#223642', item: 'lamp', tail: true, cape: '#1e3440', belt: '#4a3a2a' },
    kaspar: { hair: '#6a6a78', skin: '#d4bcaa', body: '#4a4a58', legs: '#2e2e38', hat: '#3a3a46', hatBand: '#6a2a3a', item: 'staff', staffGem: '#c89aff', beard: '#8a8a96', cape: '#2a2a36', brows: '#5a5a66' },
    brann:  { hair: '#2a1e1a', skin: '#d8a888', body: '#5a3a2a', apron: '#3a2e28', legs: '#2e2622', item: 'hammer', beard: '#2a1e1a', cheek: false, sleeve: '#d8a888' },
    mahlen: { hair: '#e6e0d4', skin: '#ecd2bc', body: '#8a7a5a', apron: '#f0ead8', legs: '#4a4034', cap: '#dcd4c0', item: 'sack' },
    mutter: { hair: '#6a4a3a', skin: '#f0d6c2', body: '#7a5a6e', skirt: '#4a3848', apron: '#d8ccb8', bun: true },
    vater:  { hair: '#4a3a30', skin: '#e4c6ae', body: '#46604e', legs: '#34302c', beard: '#4a3a30', cheek: false, belt: '#3a2a20', pipe: true },
    // Leuchtturmwärter Onno: gelber Ölmantel, Mütze, Sturmlaterne, Pfeife
    onno:   { hair: '#b8b8c0', skin: '#dcbca4', body: '#c8a040', coat: '#c8a040', buttons: '#5a4a30', legs: '#2e3440', boot: '#1e2228', beard: '#d0d0d8', cap: '#2a3448', cheek: false, item: 'lamp', brows: '#d0d0d8' },
    // Kapitänin Wenke: langer Kapitänsmantel mit Goldknöpfen und Schulterstücken, Mütze mit Abzeichen
    wenke:  { hair: '#b8583a', skin: '#ecd0bc', body: '#26344e', coat: '#26344e', buttons: '#e8c058', epaulette: '#e8c058', legs: '#1e2638', boot: '#16181e', hat: '#1a2030', hatBand: '#e8c058', badge: '#ffe08a', tail: true, scarf: '#d8c8a0' },
    // Mondpriesterin Alwine (Heilungskirche): silbernes Gewand, Schleier, leuchtender Mondanhänger
    alwine: { hair: '#d8d0e8', skin: '#f0dccc', body: '#dcd8ec', robe: '#c4bedc', veil: '#eeeaf8', pendant: '#bfe8ff', cheek: true, item: 'book', legs: '#8a84a4', boot: '#6a6488' },
    // Bruder Tamme (Hafenkapelle): tiefblaue Kutte, Seemannsbart, goldener Leuchtfeuer-Anhänger
    tamme:  { hair: '#8a7460', skin: '#e0c0a6', body: '#3e4c6e', robe: '#34405e', pendant: '#ffd878', beard: '#9a8470', cheek: false, item: 'book', legs: '#2a3048', boot: '#1e2232', brows: '#8a7460' }
  };
  const DIRS3 = ['down', 'up', 'left'];
  // Figur: Stand (down/up/left/right), 4 Gangphasen je Richtung (walk), 3 Ruhebilder je Richtung (idle: Atem aus/ein, Blinzeln)
  function build(c) {
    const o = { walk: {}, idle: {} };
    for (const d of DIRS3) {
      o.walk[d] = [0, 1, 2, 3].map(f => hi(person(c, d, f)));
      o.idle[d] = [hi(person(c, d, -1)), hi(person(c, d, -1, { breath: 1 })), hi(person(c, d, -1, { blink: true }))];
      o[d] = o.idle[d][0];
    }
    o.walk.right = o.walk.left.map(mirror); o.idle.right = o.idle.left.map(mirror); o.right = o.idle.right[0];
    return o;
  }
  G.SPR = G.SPR || { mon: {} };
  for (const id in PEOPLE) {
    const o = build(PEOPLE[id]);
    if (id === 'player') { // Kompatibilität: player[dir] = [Stand, Schritt links, Schritt rechts]
      for (const d of ['down', 'up', 'left', 'right']) { const a = [o.idle[d][0], o.walk[d][0], o.walk[d][2]]; o[d] = a; }
      o.frames = 4;
    }
    G.SPR[id] = o;
  }
  // schlafender Jorin (liegend)
  (function () {
    const S = new A.Shape(), c = PEOPLE.jorin;
    S.E(10, 19, 8, 3.2, '#8a7a9a', { name: 'blanket' }).E(12, 19, 6, 2.6, c.body, { clip: 'blanket', line: false });
    S.E(3.6, 17.6, 3.4, 3, c.hair, { name: 'head' }).E(3.2, 18.4, 2.4, 2, c.skin, { clip: 'head', line: false });
    S.R(2.4, 18, 1.4, 0.8, '#1a1428', { flat: true, line: false });
    const sl = A.raster(S, W, HH, 1); G.SPR.jorinSleep = { down: sl, up: sl, left: sl, right: sl };
  })();
  // schlafender Onno: lehnt sitzend an einem Stein, Mütze ins Gesicht gerutscht
  (function () {
    const S = new A.Shape(), c = PEOPLE.onno;
    S.E(10, 21.5, 7, 2.6, c.legs, { name: 'legs' }).E(15.5, 22, 2.4, 1.6, c.boot);
    S.E(7, 17, 4.6, 5, c.body, { name: 'coat' });
    S.E(6.4, 10.4, 5.2, 4.8, c.hair, { name: 'head' }).E(6.8, 11.6, 4, 3.4, c.skin, { clip: 'head', line: false });
    S.E(6.8, 13.6, 3.2, 2, c.beard).E(6.6, 8, 5.4, 2.8, c.cap);
    S.R(5, 11.4, 1.6, 0.7, '#1a1428', { flat: true, line: false }).R(8, 11.4, 1.6, 0.7, '#1a1428', { flat: true, line: false });
    const sl = A.raster(S, W, HH, 1); G.SPR.onnoSleep = { down: sl, up: sl, left: sl, right: sl };
  })();
  // Seelenfänger (Fangobjekt) 12×14
  (function () {
    const S = new A.Shape();
    S.C(4, 1.5, 8, 1.5, 1.4, '#4a4458').R(2, 3, 8, 2, '#5a4e6a', { name: 'cap' });
    S.R(2.5, 5, 7, 6, '#9ae8ff', { glow: true, name: 'glass' }).E(6, 8, 2.2, 2.4, '#f0feff', { glow: true, clip: 'glass' });
    S.R(5.5, 5, 1, 6, '#5a4e6a', { clip: 'glass', flat: true, line: false });
    S.R(1.5, 11, 9, 2, '#5a4e6a');
    G.SPR.lantern = A.raster(S, 12, 14, 1);
  })();
  G.People = { PEOPLE, person };
})(window.G);
