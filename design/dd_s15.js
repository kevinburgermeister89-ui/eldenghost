'use strict';
// NUR ENTWURF – Grottenmaul
(function () {
  const { F, B, X, halo, spark } = DD.H;
  Object.assign(DD.DEF, {
    grottenmaul(S) { // bemooster Felsbrocken mit riesigem Maul, Leuchtsteine im Rachen, schläft meistens
      const st = '#5a5866', st2 = '#44424e', st3 = '#76748a', moss = '#4a7a4a', moss2 = '#6a9a58', tooth = '#b8b4c4', tq = '#7af0d0', vi = '#b080ff';
      S.E(18, 58, 5, 2.6, st2, { g: 'legF' }).E(46, 58.4, 6, 2.8, st2, { g: 'legB' });
      S.E(34, 40, 26, 20, st, { name: 'body', g: 'body' });
      S.E(40, 30, 10, 4, st3, { clip: 'body', flat: true, line: false, rot: 0.2 });
      for (const [x0, y0, x1, y1] of [[48, 30, 54, 42], [44, 50, 52, 54]]) S.C(x0, y0, x1, y1, 0.8, st2, { clip: 'body', flat: true, line: false });
      S.P([[10, 34], [20, 30], [32, 31], [38, 38], [34, 50], [22, 54], [12, 50], [9, 42]], '#16121c', X(F, { name: 'maw', clip: 'body' }));
      S.E(22, 48, 10, 5, '#3a2a3a', X(F, { clip: 'maw', flat: true, line: false }));
      for (const [x, y, r, c] of [[18, 40, 2.2, tq], [27, 38, 1.8, vi], [24, 44, 1.5, tq], [31, 43, 1.3, vi]]) { S.E(x, y, r * 1.8, r * 1.6, c, X(F, { clip: 'maw', alpha: 0.25, flat: true, line: false, noOutline: true })); S.E(x, y, r, r * 0.85, c, X(F, { glow: true, clip: 'maw' })); }
      for (const [x, y] of [[17.2, 39.2], [26.4, 37.2], [23.5, 43.4], [30.6, 42.4]]) S.E(x, y, 0.6, 0.5, '#ffffff', X(F, { flat: true, line: false }));
      for (const [x, y, w, h] of [[13.6, 33.4, 4.4, 5.4], [20, 31.2, 4.8, 6], [27, 31.4, 4.4, 5.6], [33, 33.6, 3.6, 4.6]]) S.P([[x - w / 2, y], [x + w / 2, y - 0.3], [x + 0.2, y + h]], tooth, F);
      for (const [x, y, w, h] of [[15.6, 51.4, 4.4, 4.6], [22.6, 53, 4.6, 5], [29.4, 50.6, 4, 4.4]]) S.P([[x - w / 2, y], [x + w / 2, y + 0.3], [x, y - h]], tooth, F);
      S.P([[14, 26], [22, 21], [34, 20], [46, 22], [54, 28], [48, 27], [40, 25], [30, 25], [22, 27]], moss, { name: 'moss', g: 'top' });
      S.E(46, 54, 6, 3, moss, { clip: 'body', line: false }).E(56, 40, 3, 5, moss, { clip: 'body', line: false });
      S.E(26, 22.4, 3, 1.2, moss2, { clip: 'moss', flat: true, line: false }).E(40, 22, 3, 1.1, moss2, { clip: 'moss', flat: true, line: false });
      S.C(34, 21, 33, 15, 0.6, '#5a8a48').E(31.6, 15, 1.8, 1, moss2, { rot: -0.4 }).C(36, 21, 38, 16, 0.6, '#5a8a48').E(39.6, 15.8, 1.6, 0.9, moss2, { rot: 0.4 });
      S.E(22, 28.4, 3, 2.4, st, X(F, { g: 'lid' })).E(32, 27.6, 3.2, 2.6, st, X(F, { g: 'lid' }));
      S.C(19.4, 28.6, 24.6, 28.6, 0.7, '#1a1620', X(F, { flat: true, line: false })).C(29.2, 27.8, 34.8, 27.8, 0.7, '#1a1620', X(F, { flat: true, line: false }));
      S.C(20, 29.4, 19.6, 30.4, 0.4, '#1a1620', X(F, { flat: true, line: false })).C(30, 28.6, 29.6, 29.6, 0.4, '#1a1620', X(F, { flat: true, line: false }));
      S.E(36, 42, 16, 12, st2, X(B, { clip: 'body', flat: true, line: false, alpha: 0.5 }));
      spark(S, [[8, 22, 0.6], [58, 20, 0.6], [4, 46, 0.6]], tq);
      S.E(50, 14, 1.2, 1.2, '#c0bccc', { alpha: 0.6, flat: true, line: false, cast: false }).E(54, 10, 1.6, 1.6, '#c0bccc', { alpha: 0.5, flat: true, line: false, cast: false });
    },
  });
  Object.assign(DD.TEX, { grottenmaul: 'stone' });
})();
