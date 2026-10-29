'use strict';
// NUR ENTWURF – Kohlmarder
(function () {
  const { F, B, X, MIST, spark } = DD.H;
  Object.assign(DD.DEF, {
    kohlmarder(S) { // Marder mit Rauchumhang, gestohlene Laternenfunken im Fell
      const fur = '#3a3440', fur2 = '#262230', sm = '#6a6278', cl = '#4a4060', cl2 = '#2e2840', thr = '#9a8ea0', sp = '#ffd070', eye = '#ffcc60';
      for (const [x, y, r] of [[54, 36, 3], [58, 30, 2.4], [61, 25, 1.8]]) S.E(x, y, r, r * 0.8, '#7a7090', MIST);
      S.P([[43, 53], [47, 46], [51, 38], [55, 31], [59, 28.6], [62, 33], [61.4, 41], [58, 48], [52, 54]], fur, { g: 'tail', name: 'tail' });
      S.P([[55, 31], [59, 28.6], [62, 33], [61.6, 37], [58, 34]], sm, { clip: 'tail', flat: true, line: false });
      S.C(46, 52, 48, 60, 4, fur2, { g: 'legB' });
      S.E(36, 49, 13, 8, fur, { name: 'body', g: 'body' });
      S.E(28, 53, 6, 3.4, thr, X(F, { clip: 'body', line: false }));
      S.C(28, 54, 27, 60, 4, fur, { g: 'legF' }).C(36, 55, 36, 60, 4, fur, { g: 'legF' });
      for (const x of [27, 36]) S.E(x - 0.6, 60.4, 2.6, 1.2, fur2);
      S.P([[22, 38], [40, 36], [50, 42], [51, 50], [47, 48], [43, 52], [39, 48], [35, 53], [31, 48], [27, 51], [22, 46]], cl, { name: 'cloak', g: 'cloak' });
      for (const [x0, y0, x1, y1] of [[30, 40, 31, 48], [38, 39, 39, 48], [45, 42, 47, 48]]) S.C(x0, y0, x1, y1, 0.7, cl2, { clip: 'cloak', flat: true, line: false });
      S.C(22, 39, 40, 37, 1.6, '#5e5478', { g: 'cloak' });
      for (const [x, y] of [[33, 44], [44, 45], [27, 43], [52, 40], [40, 51], [57, 44]]) S.E(x, y, 0.8, 0.8, sp, { glow: true });
      S.E(15, 30, 2.8, 3, fur, { name: 'earL' }).E(23, 29.6, 3, 3.2, fur, { name: 'earR' });
      S.E(15, 30.4, 1.4, 1.5, sm, { clip: 'earL', flat: true, line: false }).E(23, 30, 1.5, 1.6, sm, { clip: 'earR', flat: true, line: false });
      S.E(19, 37, 9, 7.6, fur, { name: 'head', g: 'head' }).E(10, 40, 5, 3.4, fur, { g: 'head' });
      S.E(13, 42.6, 5.6, 2.2, thr, X(F, { clip: 'head', line: false }));
      S.E(18.6, 35.6, 7.4, 2.6, fur2, X(F, { clip: 'head', flat: true, line: false }));
      S.eye(15.4, 36, 2.1, 2.5, eye, { dark: '#6a3a10', white: 0.5 }).eye(21.6, 35.8, 2.3, 2.7, eye, { dark: '#6a3a10', white: 0.5 });
      S.E(5.4, 39.4, 1, 0.9, '#0e0c10', X(F, { flat: true }));
      S.E(20, 33, 6, 2.6, fur2, X(B, { clip: 'head', line: false }));
      spark(S, [[8, 26, 0.7], [30, 30, 0.6], [62, 52, 0.6]], sp);
    },
  });
  Object.assign(DD.TEX, { kohlmarder: 'fur' });
})();
