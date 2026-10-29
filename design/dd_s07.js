'use strict';
// NUR ENTWURF – Russwiesel
(function () {
  const { F, B, X, halo, spark } = DD.H;
  Object.assign(DD.DEF, {
    russwiesel(S) { // Wiesel aus Kaminruss, Schwanzspitze glimmt wie Glut
      const fur = '#34303a', fur2 = '#221e28', sm = '#5a5462', thr = '#8a8090', gl = '#ff9040', gl2 = '#ffd080', eye = '#ffcc60';
      S.C(45, 51, 53, 47, 4.4, fur, { g: 'tail' }).C(53, 47, 58, 40, 3.6, fur, { g: 'tail' }).C(58, 40, 58, 33, 3, fur, { g: 'tail' });
      halo(S, 58, 30, 5, gl, 0.3);
      S.E(58, 30.6, 3, 3.4, gl, { glow: true, g: 'tail' }).E(58, 29.6, 1.6, 1.8, gl2, { glow: true, g: 'tail' });
      S.E(45, 52, 5, 4.4, fur2, { g: 'legB' }).C(46, 54, 49, 58, 3.4, fur2, { g: 'legB' }).C(49, 58, 46, 59.6, 2.8, fur2, { g: 'legB' }).E(45, 60, 2.8, 1.3, fur2, { g: 'legB' });
      S.C(25, 48, 45, 50, 7.6, fur, { name: 'body', g: 'body' });
      for (const [x, y, r] of [[36, 44, 4], [44, 46, 2.6], [29, 44.6, 2.4]]) S.E(x, y, r, 1.5, sm, { clip: 'body', flat: true, line: false });
      S.C(22, 52, 34, 54.6, 2.6, thr, X(F, { clip: 'body', flat: true, line: false }));
      // v21: kurze, gewinkelte Beine mit Pfoten statt Stelzen
      S.C(27, 52, 25, 56.5, 3.8, fur, { g: 'legF' }).C(25, 56.5, 26, 59.2, 3.2, fur, { g: 'legF' });
      S.C(37, 53, 39, 56.5, 3.8, fur, { g: 'legF' }).C(39, 56.5, 37, 59.2, 3.2, fur, { g: 'legF' });
      for (const x of [24.6, 35.6]) S.E(x, 60, 2.8, 1.3, fur2, { g: 'legF' });
      S.E(15, 33, 2.8, 2.8, fur, { name: 'earL' }).E(23, 32.6, 3, 3, fur, { name: 'earR' });
      S.E(15, 33.4, 1.4, 1.4, sm, { clip: 'earL', flat: true, line: false }).E(23, 33, 1.5, 1.5, sm, { clip: 'earR', flat: true, line: false });
      S.C(24, 47, 20, 42, 7, fur, { g: 'neck' });
      S.E(18, 40, 8.6, 7, fur, { name: 'head', g: 'head' }).E(10, 43, 4.8, 3.4, fur, { g: 'head' });
      S.E(13, 45.6, 5.4, 2.2, thr, X(F, { clip: 'head', line: false }));
      S.E(18, 38.6, 7, 2.6, fur2, X(F, { clip: 'head', flat: true, line: false }));
      S.eye(15, 39.4, 2, 2.4, eye, { dark: '#6a3a10', white: 0.5 }).eye(21, 39.2, 2.2, 2.6, eye, { dark: '#6a3a10', white: 0.5 });
      S.E(5.6, 42.4, 1, 0.9, '#0e0c10', X(F, { flat: true }));
      S.C(6, 44, 3, 43, 0.4, sm).C(6, 44.6, 3, 45.6, 0.4, sm);
      S.E(36, 45, 9, 2.4, fur2, X(B, { clip: 'body', line: false }));
      spark(S, [[62, 24, 0.8], [54, 26, 0.6], [60, 20, 0.5]], gl2);
    },
  });
  Object.assign(DD.TEX, { russwiesel: 'fur' });
})();
