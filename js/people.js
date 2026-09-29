'use strict';
// Eldenghost – Oberwelt-Figuren im Comic-Pixelstil (Gen-4/5-Proportionen: grosser Kopf, kurzer Körper; eigene Entwürfe)
// Rahmen 20×26 Pixel, Füsse unten mittig (Zeile 24). Richtungen down/up/left, right = gespiegelt; 3 Gangphasen.
(function (G) {
  const A = G.Art, W = 20, HH = 26;
  function person(c, dir, fr) {
    const S = new A.Shape(), k = c.child ? 1 : 0, side = dir === 'left', up = dir === 'up';
    const cx = 10, fy = 24, hy = 8.6 + k * 2.2, hr = c.child ? 5.6 : 6.2;
    // Beine / Füsse (Gangphase: 1 = linkes Bein vor, 2 = rechtes Bein vor)
    const lg = c.legs || '#3a3040', boot = c.boot || '#2a2230';
    if (side) {
      const a = fr === 1 ? -2 : fr === 2 ? 2 : 0;
      S.R(cx - 1.5 + a * 0.5, 19, 3, 4, lg, { g: 'leg' }).R(cx - 1.5 - a * 0.5, 19, 3, 4, lg, { g: 'leg' });
      S.R(cx - 2.5 + a, 22, 4, 2, boot, { g: 'boot' }).R(cx - 2.5 - a * 0.6, 22, 4, 2, boot, { g: 'boot2' });
    } else {
      const l = fr === 1 ? -1 : 0, r = fr === 2 ? -1 : 0;
      S.R(cx - 3.5, 19, 3, 4 + l, lg, { g: 'leg' }).R(cx + 0.5, 19, 3, 4 + r, lg, { g: 'leg' });
      S.R(cx - 4, 22 + l, 3.6, 2, boot, { g: 'boot' }).R(cx + 0.4, 22 + r, 3.6, 2, boot, { g: 'boot' });
    }
    // Körper
    const by = 16.8 + k * 1.5;
    if (c.cape) S.P(side ? [[cx - 3, 12], [cx + 5, 12], [cx + 6, 22], [cx - 3, 22]] : [[cx - 5, 12], [cx + 5, 12], [cx + 6, 22], [cx - 6, 22]], c.cape, { name: 'cape' });
    S.E(cx, by, side ? 4 : 4.8, 4.4 - k * 0.6, c.body, { name: 'body', hiAt: 0.95 });
    if (c.skirt) S.P([[cx - 4.5, by], [cx + 4.5, by], [cx + 5.5, 22], [cx - 5.5, 22]], c.skirt, { g: 'skirt' });
    if (c.apron && !up) S.R(side ? cx - 3.5 : cx - 2.5, by - 1, side ? 3 : 5, 6, c.apron, { flat: true, clip: 'body', line: false });
    if (c.scarf) S.E(cx, by - 3.2, side ? 3.8 : 4.6, 1.6, c.scarf, { g: 'scarf' });
    // Arme (schwingen beim Gehen)
    const sw = fr === 1 ? 1 : fr === 2 ? -1 : 0;
    if (side) S.C(cx + 0.5, by - 2, cx + 0.5 - sw * 2, by + 1.5, 2.6, c.body, { g: 'arm' });
    else { S.C(cx - 4.6, by - 2, cx - 5.2, by + 1.5 + sw * 0.5, 2.4, c.body, { g: 'arm' }).C(cx + 4.6, by - 2, cx + 5.2, by + 1.5 - sw * 0.5, 2.4, c.body, { g: 'arm' }); }
    // Gegenstände
    const hx = side ? cx - 2 - sw : cx + 5.4;
    if (!up && c.item === 'lamp') { S.C(hx, by - 1, hx, by + 1.5, 0.8, '#3a3040', { flat: true }); S.R(hx - 1.5, by + 1.5, 3, 3.5, '#ffd878', { glow: true, name: 'lamp' }); S.R(hx - 1.5, by + 1.5, 3, 1, '#3a3040', { flat: true }); }
    if (!up && c.item === 'staff') S.C(hx, 8 + k, hx, 23, 1.4, '#6a4a30');
    if (!up && c.item === 'spade') { S.C(hx, 7, hx, 20, 1.2, '#6a4a30'); S.R(hx - 1.5, 19, 3, 4, '#9a9aa8'); }
    if (!up && c.item === 'hammer') { S.C(hx, by - 3, hx, by + 3, 1.2, '#6a4a30'); S.R(hx - 2, by - 5, 4, 2.6, '#6a6c7a'); }
    if (!up && c.item === 'sack') S.E(side ? cx + 4.5 : cx - 5.8, by + 2.5, 2.8, 3.2, '#d8c8a0');
    // Kopf
    const hair = c.hood || c.hair;
    if (c.bun && !side) S.E(cx, hy - hr + 0.5, 2.6, 2.2, c.hair);
    if (c.bun && side) S.E(cx + 4, hy - 3, 2.4, 2.2, c.hair);
    if (c.tail && !up) S.C(side ? cx + 5 : cx + 5.2, hy, side ? cx + 6 : cx + 6, hy + 5, 2.2, c.hair);
    S.E(cx, hy, hr, hr - 0.4, hair, { name: 'head', g: 'head' });
    if (!up) {
      const fx = side ? cx - 2.2 : cx, frx = side ? 3.8 : 4.9;
      S.E(fx, hy + 2, frx, 4.2, c.skin, { clip: 'head', g: 'head', line: false, name: 'face' });
      if (c.hood) S.E(fx, hy - 2.2, frx + 0.3, 1.5, c.hair || '#3a2a30', { clip: 'face', flat: true, line: false });  // Haarsträhnen unter der Kapuze
      else S.E(side ? fx + 0.8 : fx, hy - 2.5, frx + 1, 1.9, c.hair, { clip: 'face', line: false });                 // Pony
      const ey = hy + 1.2;
      if (side) S.R(fx - 1.8, ey, 1, 2, '#1a1428', { flat: true, line: false });
      else S.R(cx - 2.6, ey, 1, 2, '#1a1428', { flat: true, line: false }).R(cx + 1.6, ey, 1, 2, '#1a1428', { flat: true, line: false });
      if (c.beard) S.E(side ? fx - 0.5 : cx, hy + 4.6, side ? 2.6 : 3.4, 2, c.beard, { g: 'beard' });
      else if (c.cheek !== false) { if (side) S.R(fx - 1, hy + 3.4, 1, 1, '#e89a9a', { flat: true, line: false, alpha: 0.7 }); else S.R(cx - 3.6, hy + 3.4, 1, 1, '#e89a9a', { flat: true, line: false, alpha: 0.7 }).R(cx + 2.6, hy + 3.4, 1, 1, '#e89a9a', { flat: true, line: false, alpha: 0.7 }); }
    }
    if (c.hood) S.E(cx, hy - hr + 1.6, hr - 1.2, 1.6, c.hoodRim || c.hood, { clip: 'head', line: false });
    if (c.hat) { S.E(cx, hy - hr + 2.6, hr + 1.6, 1.4, c.hat, { g: 'hat' }); S.E(cx, hy - hr + 1, hr - 1.5, 2.4, c.hat, { g: 'hat' }); }
    if (c.cap) S.E(cx, hy - hr + 2.2, hr - 0.3, 2.6, c.cap, { g: 'hat' });
    return A.raster(S, W, HH, 1, { mirror: false, thin: false });
  }
  function mirror(src) { const c = G.mk(src.width, src.height), g = c.getContext('2d'); g.translate(src.width, 0); g.scale(-1, 1); g.drawImage(src, 0, 0); return c; }
  const PEOPLE = {
    player: { hood: '#2f5a72', hoodRim: '#4a7a92', hair: '#3a2a34', skin: '#f0d8c4', body: '#2c4c62', legs: '#2a2838', boot: '#1e1820', scarf: '#a8404e', item: 'lamp' },
    ilse:   { hair: '#c4bcca', skin: '#ecd4c0', body: '#6a4478', skirt: '#3e2c44', item: 'staff', bun: true, cheek: false },
    hedda:  { hair: '#c8743e', skin: '#f0d4bc', body: '#6e4c2e', apron: '#e2d4b2', legs: '#4a3424', tail: true },
    oda:    { hair: '#5a3e30', skin: '#e8ccb4', body: '#4a5c78', legs: '#34405a', bun: true },
    fenn:   { hair: '#e8b448', skin: '#f4dcc8', body: '#8a3c3c', legs: '#3a3050', child: true },
    wido:   { hair: '#8a8a8a', skin: '#dcc0aa', body: '#3e3e36', beard: '#b4b4b4', item: 'spade', hat: '#2e2e2a', legs: '#2a2a26' },
    jorin:  { hair: '#4a3a2a', skin: '#dcbca2', body: '#5e5432', beard: '#4a3a2a', legs: '#3a3424' },
    selma:  { hair: '#2e2640', skin: '#ecd8c8', body: '#2e4c5e', legs: '#223642', item: 'lamp', tail: true },
    kaspar: { hair: '#6a6a78', skin: '#d4bcaa', body: '#4a4a58', legs: '#2e2e38', hat: '#3a3a46', item: 'staff', beard: '#8a8a96' },
    // neu: Schmiedin & Müller
    brann:  { hair: '#2a1e1a', skin: '#d8a888', body: '#5a3a2a', apron: '#3a2e28', legs: '#2e2622', item: 'hammer', beard: '#2a1e1a', cheek: false },
    mahlen: { hair: '#e6e0d4', skin: '#ecd2bc', body: '#8a7a5a', apron: '#f0ead8', legs: '#4a4034', cap: '#dcd4c0', item: 'sack' },
    // Eltern, Leuchtturmwärter Onno, Kapitänin Wenke
    mutter: { hair: '#6a4a3a', skin: '#f0d6c2', body: '#7a5a6e', skirt: '#4a3848', apron: '#d8ccb8', bun: true },
    vater:  { hair: '#4a3a30', skin: '#e4c6ae', body: '#46604e', legs: '#34302c', beard: '#4a3a30', cheek: false },
    onno:   { hair: '#b8b8c0', skin: '#dcbca4', body: '#c8a040', legs: '#2e3440', boot: '#1e2228', beard: '#d0d0d8', cap: '#2a3448', cheek: false },
    wenke:  { hair: '#b8583a', skin: '#ecd0bc', body: '#26344e', legs: '#1e2638', boot: '#16181e', hat: '#1a2030', tail: true, scarf: '#d8c8a0' }
  };
  G.SPR = G.SPR || { mon: {} };
  for (const id in PEOPLE) {
    const c = PEOPLE[id];
    if (id === 'player') {
      G.SPR.player = {};
      for (const d of ['down', 'up', 'left']) G.SPR.player[d] = [0, 1, 2].map(f => person(c, d, f));
      G.SPR.player.right = G.SPR.player.left.map(mirror);
    } else {
      const o = { down: person(c, 'down', 0), up: person(c, 'up', 0), left: person(c, 'left', 0) }; o.right = mirror(o.left);
      o.walk = { down: [1, 2].map(f => person(c, 'down', f)), up: [1, 2].map(f => person(c, 'up', f)), left: [1, 2].map(f => person(c, 'left', f)) };
      o.walk.right = o.walk.left.map(mirror);
      G.SPR[id] = o;
    }
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
