'use strict';
// NUR ENTWURF – Brunnendrache
(function () {
  const { F, B, X, spark } = DD.H;
  Object.assign(DD.DEF, {
    brunnendrache(S) { // alter gütiger Drache, schläft im moosigen Dorfbrunnen, Bart aus Entengrütze
      const sk = '#4a8a96', sk2 = '#326470', bel = '#cfe0c8', st = '#8c8a92', st2 = '#64626c', st3 = '#a8a6ae', mo = '#6a9a48', duck = '#9ad050', duck2 = '#6aa438', wat = '#6ac8e8', horn = '#e8dcc0', wd = '#7a5a40', wd2 = '#5a3e2c', roof = '#8a4a3a';
      S.R(12, 15, 3, 32, wd, { g: 'post' }).R(53, 15, 3, 32, wd, { g: 'post' });
      S.C(13, 19, 55, 19, 1.2, wd2, { g: 'post' });
      S.P([[7, 17], [34, 5], [61, 17]], roof, { name: 'roof', g: 'roof' });
      for (const y of [9.6, 13.4]) S.C(10, y + 2.6, 58, y + 2.6, 0.5, '#5e2e24', { clip: 'roof', flat: true, line: false });
      S.C(46, 19.6, 46, 27, 0.5, '#c8b890', { g: 'rope' }).R(43.6, 27, 5, 4.4, wd, { g: 'rope' }).C(43.6, 27.6, 48.6, 27.6, 0.6, '#8a8a90', { g: 'rope' });
      S.E(34, 46, 22, 4.6, st2, { g: 'wellback' });
      S.E(34, 46.4, 19, 3, wat, { glow: true, flat: true, line: false, g: 'wellback' });
      S.C(50, 45, 56, 39, 3.6, sk, { g: 'tail' }).C(56, 39, 57, 33, 2.6, sk, { g: 'tail' }).P([[57, 33], [61, 28], [54, 31]], sk2, { g: 'tail' });
      S.E(37, 43, 12, 6, sk, { name: 'body', g: 'body' });
      for (const [x, y] of [[34, 38], [40, 37.4], [46, 38.4]]) S.P([[x - 2, y + 1], [x, y - 3], [x + 2, y + 1]], sk2, { g: 'body' });
      S.R(12, 46, 44, 12, st, { name: 'well', g: 'well' }); S.E(34, 58, 22, 2.6, st, { g: 'well' });
      for (const [y, o] of [[49.5, 0], [53.5, 3.5], [57.5, 0]]) for (let x = 14 + o; x < 56; x += 7) S.E(x, y, 3, 1.6, (x + y) % 3 ? st3 : st2, { clip: 'well', flat: true, line: false });
      S.C(12.6, 46.6, 55.4, 46.6, 2.4, st3, { g: 'rim' });
      for (const [x, r] of [[16, 3], [26, 2.2], [42, 3.4], [52, 2.6]]) S.E(x, 45.6, r, 1.4, mo, { g: 'rim' });
      for (const [x, y] of [[15, 52], [53, 51], [44, 56]]) S.E(x, y, 2, 1.2, mo, { clip: 'well', flat: true, line: false });
      S.C(31, 43, 31, 49, 3.8, sk, { g: 'paw' }).C(44, 43, 45, 49, 3.8, sk, { g: 'paw' });
      for (const x of [29.6, 31.4, 33.2, 43.4, 45.2, 47]) S.C(x, 49.4, x - 0.4, 51, 0.8, horn);
      S.C(24, 34, 30, 27, 1.8, horn, { g: 'horn' }).C(30, 27, 33, 28, 1.4, horn, { g: 'horn' }).C(18, 34, 20, 27, 1.6, horn, { g: 'horn' });
      S.E(22, 40, 10, 7.2, sk, { name: 'head', g: 'head' }).E(13, 43, 6.2, 4.2, sk, { g: 'head' });
      S.E(14, 45.4, 6, 1.6, bel, X(F, { clip: 'head', line: false }));
      for (const [x0, y0, x1, y1] of [[11, 46, 9, 53], [14, 47, 13, 57], [18, 47, 18, 58], [21, 46.6, 22, 54]]) {
        S.C(x0, y0, x1, y1, 1.1, duck2, { g: 'beard' });
        for (let k = 1; k <= 3; k++) { const t = k / 3.2; S.E(x0 + (x1 - x0) * t + (k % 2 ? 1 : -1), y0 + (y1 - y0) * t, 1.3, 0.9, duck, { g: 'beard' }); }
      }
      S.C(16, 39, 18, 40, 0.7, '#14262c', X(F, { flat: true, line: false })).C(18, 40, 20.4, 39, 0.7, '#14262c', X(F, { flat: true, line: false }));
      S.C(23, 38.6, 25.2, 39.6, 0.7, '#14262c', X(F, { flat: true, line: false })).C(25.2, 39.6, 27.6, 38.6, 0.7, '#14262c', X(F, { flat: true, line: false }));
      S.C(15, 36.4, 20, 36, 0.9, bel, X(F, { flat: true, line: false })).C(22, 36, 27, 35.8, 0.9, bel, X(F, { flat: true, line: false }));
      S.E(7.6, 42, 0.9, 0.8, '#14262c', X(F, { flat: true }));
      S.E(5, 38, 1.6, 1.6, wat, { alpha: 0.7, glow: true }).E(3.4, 33.6, 1.1, 1.1, wat, { alpha: 0.6, glow: true }).E(5, 30, 0.7, 0.7, wat, { alpha: 0.5, glow: true });
      S.E(22, 36, 5, 2, sk2, X(B, { clip: 'head', line: false }));
      spark(S, [[40, 46.6, 0.7], [50, 46.4, 0.6], [27, 46.6, 0.6]], '#dff8ff');
    },
  });
  Object.assign(DD.TEX, { brunnendrache: 'dots' });
})();
