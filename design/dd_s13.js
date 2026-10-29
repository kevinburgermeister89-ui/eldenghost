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
