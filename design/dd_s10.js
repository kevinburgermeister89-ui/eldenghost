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
