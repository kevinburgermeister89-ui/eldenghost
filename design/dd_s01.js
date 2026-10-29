'use strict';
// NUR ENTWURF – überarbeitet: Nebelwürmchen, Dunstwyrm
(function () {
  const { F, B, X, puff, halo, spark } = DD.H;
  Object.assign(DD.DEF, {
    nebelwuermchen(S) { // kleiner eingerollter Wurm aus Morgennebel, zwei Laternenaugen, Moos auf dem Rücken
      const mi = '#a8b6d4', mi2 = '#7c8ab0', bel = '#e6eaf6', mo = '#6a9a48', mo2 = '#4e7a36', gl = '#ffd070', horn = '#ece4cc';
      S.E(36, 60, 20, 2.4, '#c8d4ee', { alpha: 0.22, flat: true, noOutline: true, cast: false });
      S.C(48, 56, 55, 54.6, 5.2, mi, { g: 'tail' }).C(55, 54.6, 60, 51, 3.8, mi, { g: 'tail' }).C(60, 51, 62.6, 46, 2.6, mi, { g: 'tail' }).C(62.6, 46, 62, 42, 1.6, mi, { g: 'tail' });
      S.E(61.6, 41, 2, 1.6, bel, { g: 'tail' }).E(63, 43, 1.4, 1.2, bel, { g: 'tail' });
      S.E(38, 54, 13.5, 6.6, mi, { name: 'body', g: 'body' });
      S.C(28, 57.4, 46, 57.6, 1.6, bel, X(F, { clip: 'body', flat: true, line: false }));
      S.E(41, 48.6, 10, 5, mi, { name: 'coil', g: 'body' });
      S.C(36, 49, 45, 49.4, 0.7, mi2, { clip: 'coil', flat: true, line: false }).C(45, 49.4, 47, 47.4, 0.7, mi2, { clip: 'coil', flat: true, line: false });
      S.E(41, 44.6, 6.4, 2.2, mo, { g: 'moss' }).E(46.6, 45.6, 3.6, 1.8, mo2, { g: 'moss' }).E(36, 45.8, 3, 1.6, mo2, { g: 'moss' });
      for (const [x, y] of [[38, 42.6], [42, 42], [46, 44]]) S.C(x, y + 1.4, x - 0.6, y - 1.2, 0.8, '#8ac860', { flat: true, line: false, g: 'moss' });
      S.C(28, 55, 30, 47, 8.6, mi, { g: 'neck' }).C(30, 47, 25, 41, 7.6, mi, { g: 'neck' });
      S.C(25.4, 55, 26.6, 47, 3, bel, X(F, { g: 'neck', line: false }));
      S.P([[19, 29], [21, 22], [24, 29]], horn, { g: 'horn' }).P([[24, 30], [28, 24], [28, 32]], horn, { g: 'horn' });
      S.E(20, 35, 9.5, 8, mi, { name: 'head', g: 'head' }).E(11.5, 38, 5, 4, mi, { g: 'head' });
      S.E(21, 29, 4, 1.6, mo, { clip: 'head', line: false });
      halo(S, 15.5, 34, 4.4, gl); halo(S, 23, 34, 4.6, gl);
      S.eye(15.5, 34, 2.6, 3, gl, { dark: '#5a3a10', white: 0.4 }).eye(23, 34, 2.8, 3.2, gl, { dark: '#5a3a10', white: 0.4 });
      S.E(8, 37, 0.9, 0.8, '#2a2a40', X(F, { flat: true }));
      S.C(9, 40.6, 14, 41, 0.8, '#2a2a40', X(F, { flat: true, line: false }));
      S.E(21, 31, 5, 2.4, mi2, X(B, { clip: 'head', line: false }));
      spark(S, [[6, 30], [60, 58], [12, 21, 0.8]], '#fff0c0');
    },
    dunstwyrm(S) { // langer Nebelkörper, Mähne aus Weidenzweigen, schimmernde Schuppen
      const mi = '#8c9ccc', mi2 = '#5e6e9e', bel = '#dce4f6', wi = '#8abc58', wi2 = '#5e9038', gl = '#dff4ff', horn = '#ece4cc';
      S.E(38, 61, 22, 2.2, '#c4d0ee', { alpha: 0.2, flat: true, noOutline: true, cast: false });
      const sp = [[63, 43, 3.4], [58, 50, 5.6], [49, 54, 8.6], [40, 51, 10], [34, 43, 9.6], [28, 36, 9], [24, 33, 8.6]];
      S.E(48, 59, 4, 2.4, mi2, { g: 'legB' }).C(48, 55, 48, 59, 4.4, mi2, { g: 'legB' });
      for (let i = 0; i < sp.length - 1; i++) S.C(sp[i][0], sp[i][1], sp[i + 1][0], sp[i + 1][1], sp[i + 1][2], mi, { g: 'body' });
      S.P([[63, 43], [64, 34], [59, 40]], mi2, { g: 'body' });
      S.C(55, 58, 44, 60, 2.6, bel, X(F, { clip: 'body', flat: true, line: false })).C(38, 54, 31, 45, 3, bel, X(F, { clip: 'body', flat: true, line: false }));
      for (const [x, y] of [[52, 49], [45, 47], [41, 43], [57, 46], [36, 37], [47, 52]]) S.E(x, y, 1.3, 1, gl, { glow: true, flat: true, line: false });
      S.C(36, 53, 35, 59, 5, mi, { g: 'legF' });
      for (const x of [32.6, 35, 37.4]) S.C(x, 59.6, x - 1, 61.2, 1, horn);
      for (const [x0, y0, x1, y1] of [[27, 22, 34, 31], [28, 23, 38, 35], [29, 26, 43, 41], [31, 29, 47, 46], [27, 27, 30, 40]]) {
        S.C(x0, y0, x1, y1, 1.3, wi, { g: 'mane' });
        for (let k = 1; k <= 3; k++) { const t = k / 3.4; S.E(x0 + (x1 - x0) * t + 1, y0 + (y1 - y0) * t + 0.6, 1.6, 0.8, wi2, { rot: 0.9, g: 'mane' }); }
      }
      S.P([[17, 22], [21, 12], [24, 22]], horn, { g: 'horn' }).P([[22, 24], [29, 15], [28, 26]], horn, { g: 'horn' });
      S.E(19, 28, 9, 7, mi, { name: 'head', g: 'head' }).E(9.5, 31, 6, 3.8, mi, { g: 'head' });
      S.E(11, 33.6, 6, 1.6, bel, X(F, { clip: 'head', line: false }));
      S.C(4, 31, -1, 26, 0.6, '#6a7aa8').C(4, 32, 0, 36, 0.6, '#6a7aa8');
      S.eye(15, 27, 2.2, 2.6, '#b8ecff', { dark: '#2a3a6a', white: 0.5 }).eye(21, 27, 2.4, 2.8, '#b8ecff', { dark: '#2a3a6a', white: 0.5 });
      S.E(4.6, 30, 0.9, 0.8, '#2a2a40', X(F, { flat: true }));
      spark(S, [[10, 10], [46, 26], [60, 60, 0.8]], gl);
    },
  });
})();
