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
