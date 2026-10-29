'use strict';
// NUR ENTWURF – Wurzelschrat
(function () {
  const { F, B, X, halo, spark } = DD.H;
  Object.assign(DD.DEF, {
    wurzelschrat(S) { // knorriger Wurzelgeist, Astloch-Gesicht mit zwei Glühwürmchen-Augen
      const bark = '#4a3a34', bark2 = '#33282a', bark3 = '#6a5448', moss = '#4a7a4a', moss2 = '#6a9a58', ff = '#d8ff70';
      for (const [x0, x1, w] of [[26, 16, 3.4], [32, 30, 3.6], [38, 46, 3.4]]) { S.C(x0, 52, x1, 58.4, w, bark, { g: 'roots' }); S.C(x1, 58.4, x1 + (x1 < 30 ? -4 : 4), 60, w * 0.55, bark, { g: 'roots' }); }
      S.P([[22, 54], [21, 40], [23, 26], [20, 18], [26, 20], [30, 14], [34, 19], [40, 16], [41, 26], [42, 40], [44, 54], [36, 56], [28, 56]], bark, { name: 'trunk', g: 'body' });
      for (const [x0, y0, x1, y1] of [[26, 28, 24, 52], [37, 26, 39, 52], [31, 44, 31, 55], [28, 22, 27, 30]]) S.C(x0, y0, x1, y1, 0.8, bark2, { clip: 'trunk', flat: true, line: false });
      S.C(34, 30, 35, 48, 1, bark3, { clip: 'trunk', flat: true, line: false });
      S.C(22, 34, 13, 30, 2.4, bark, { g: 'armF' }).C(13, 30, 9, 24, 1.4, bark, { g: 'armF' }).C(13, 30, 7, 31, 1.2, bark, { g: 'armF' }).C(9, 24, 8, 21, 0.8, bark, { g: 'armF' });
      S.C(41, 32, 49, 26, 2.2, bark, { g: 'armB' }).C(49, 26, 52, 20, 1.3, bark, { g: 'armB' }).C(49, 26, 55, 26, 1.1, bark, { g: 'armB' });
      S.E(8.6, 21, 1.6, 1.2, moss2, { g: 'armF' }).E(52.6, 19, 1.8, 1.3, moss2, { g: 'armB' });
      S.P([[20, 19], [24, 13], [31, 11], [38, 13], [42, 18], [40, 21], [33, 19], [26, 21]], moss, { name: 'moss', g: 'top' });
      S.E(26, 14, 2.6, 1.2, moss2, { clip: 'moss', flat: true, line: false }).E(35, 13.4, 2.4, 1.1, moss2, { clip: 'moss', flat: true, line: false });
      S.C(29, 12, 28, 6, 0.6, '#5a8a48').E(26.8, 6, 1.8, 1, moss2, { rot: -0.4 }).C(34, 12, 36, 7.4, 0.6, '#5a8a48').E(37.6, 7.2, 1.6, 0.9, moss2, { rot: 0.4 });
      S.E(27, 31, 4.4, 5, bark2, X(F, { name: 'holeL' })).E(36, 30.4, 3.8, 4.6, bark2, X(F, { name: 'holeR' }));
      S.E(27, 32, 3.2, 3.8, '#120e10', X(F, { clip: 'holeL', flat: true, line: false })).E(36, 31.4, 2.8, 3.4, '#120e10', X(F, { clip: 'holeR', flat: true, line: false }));
      halo(S, 27, 32, 4, ff, 0.4); halo(S, 36, 31.4, 3.6, ff, 0.4);
      S.E(27, 32, 1.4, 1.4, ff, X(F, { glow: true, flat: true })).E(36, 31.4, 1.3, 1.3, ff, X(F, { glow: true, flat: true }));
      S.E(26.6, 31.6, 0.5, 0.5, '#ffffff', X(F, { flat: true, line: false })).E(35.6, 31, 0.5, 0.5, '#ffffff', X(F, { flat: true, line: false }));
      S.P([[25, 41], [29, 42.4], [32, 41], [35, 42.6], [38, 41.4], [35, 44], [30, 44], [27, 43.6]], '#120e10', X(F, { flat: true }));
      S.E(23, 48, 3, 2, moss, X(F, { clip: 'trunk', line: false })).E(41, 44, 2, 3, moss, { clip: 'trunk', line: false });
      S.E(31, 32, 7, 6, bark2, X(B, { clip: 'trunk', flat: true, line: false, alpha: 0.6 }));
      for (const [x, y] of [[12, 16], [50, 36], [6, 40], [46, 12]]) { halo(S, x, y, 2.4, ff, 0.35); S.E(x, y, 0.7, 0.7, ff, { glow: true, flat: true, line: false, cast: false }); }
      spark(S, [[18, 8, 0.5]], ff);
    },
  });
  Object.assign(DD.TEX, { wurzelschrat: 'stone' });
})();
