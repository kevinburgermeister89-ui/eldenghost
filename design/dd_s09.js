'use strict';
// NUR ENTWURF – Schattenmarder
(function () {
  const { F, B, X, MIST, spark } = DD.H;
  Object.assign(DD.DEF, {
    schattenmarder(S) { // aufrechter Marder, Rauchbandagen an den Pfoten, ruhige Kampfhaltung
      const fur = '#3a3444', fur2 = '#24202c', sm = '#6a6278', thr = '#a89cb0', ban = '#bab2c6', ban2 = '#8a8298', eye = '#ffb050';
      S.C(40, 54, 50, 52, 5, fur, { g: 'tail' }).C(50, 52, 56, 45, 4.4, fur, { g: 'tail' }).C(56, 45, 54, 38, 2.8, fur, { g: 'tail' }).C(54, 38, 50.6, 35.4, 1.7, fur, { g: 'tail' });

      S.C(34, 50, 35, 58, 4.8, fur2, { g: 'legB' }).E(36, 59.4, 5, 2.2, fur2, { g: 'legB' });
      S.E(31, 43, 9, 12, fur, { name: 'body', g: 'body', rot: -0.15 });
      S.E(27.6, 44, 4.6, 8, thr, X(F, { clip: 'body', line: false, rot: -0.15 }));
      S.C(26, 52, 24, 58, 4.8, fur, { g: 'legF' }).E(22.6, 59.4, 5, 2.2, fur, { g: 'legF' });
      S.C(34, 37, 28, 35, 3.2, fur, { g: 'armB' }).E(25.6, 34, 3, 2.8, ban, { name: 'fistB', g: 'armB' });
      for (const y of [33.2, 35.2]) S.C(23, y, 29, y, 0.5, ban2, { clip: 'fistB', flat: true, line: false });
      S.C(26, 37, 17, 39, 3.4, fur, { g: 'armF' }).E(13.6, 39, 3.6, 3.4, ban, { name: 'fistF', g: 'armF' });
      for (const x of [12.4, 14.6, 16.6]) S.C(x, 36, x, 42, 0.5, ban2, { clip: 'fistF', flat: true, line: false });
      S.C(17, 41, 12, 46, 0.8, ban, { alpha: 0.8, line: false, noOutline: true }).C(12, 46, 9, 45, 0.6, ban, { alpha: 0.6, line: false, noOutline: true });
      for (const [x, y, r] of [[9, 46, 2], [6, 44, 1.6], [26, 50, 1.6]]) S.E(x, y, r, r * 0.8, '#9a90b0', MIST);
      S.E(25, 16.6, 2.8, 3, fur, { name: 'earL' }).E(33, 17, 3, 3.2, fur, { name: 'earR' });
      S.E(25, 17, 1.4, 1.5, sm, { clip: 'earL', flat: true, line: false }).E(33, 17.4, 1.5, 1.6, sm, { clip: 'earR', flat: true, line: false });
      S.E(28, 24, 8.4, 7.6, fur, { name: 'head', g: 'head' }).E(20, 27, 5, 3.4, fur, { g: 'head' });
      S.E(23, 29.6, 5.4, 2.2, thr, X(F, { clip: 'head', line: false }));
      S.C(20.6, 19.6, 36, 19, 1.2, ban2, { g: 'band' }).C(36, 19, 42, 22, 0.8, ban2, { g: 'band' }).C(36, 19, 43, 17, 0.7, ban2, { g: 'band' });
      S.E(27.6, 23, 7, 2.6, fur2, X(F, { clip: 'head', flat: true, line: false }));
      S.eye(24.4, 23.4, 2, 2.2, eye, { dark: '#6a2a10', white: 0.5 }).eye(30.4, 23.2, 2.2, 2.4, eye, { dark: '#6a2a10', white: 0.5 });
      S.C(22, 21.6, 27, 22, 1, fur2, X(F, { flat: true, line: false })).C(28.4, 21.6, 33, 21.6, 1, fur2, X(F, { flat: true, line: false }));
      S.E(15.4, 26.4, 1, 0.9, '#0e0c10', X(F, { flat: true }));
      S.C(17, 29, 21, 29.4, 0.6, '#0e0c10', X(F, { flat: true, line: false }));
      S.E(32, 36, 7, 3, fur2, X(B, { clip: 'body', line: false }));
      spark(S, [[6, 34, 0.6], [44, 14, 0.6]], ban);
    },
  });
  Object.assign(DD.TEX, { schattenmarder: 'fur' });
})();
