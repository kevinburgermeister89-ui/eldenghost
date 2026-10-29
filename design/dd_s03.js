'use strict';
// NUR ENTWURF – Essenwyrm
(function () {
  const { F, B, X, puff, halo, spark } = DD.H;
  Object.assign(DD.DEF, {
    essenwyrm(S) { // schwerer Wyrm wie ein alter Schmiedeofen, Funken aus den Nüstern
      const ir = '#4a4448', ir2 = '#2e2a2e', br = '#7c4c3c', br2 = '#56342a', gl = '#ff8a30', gl2 = '#ffd070', horn = '#9a9090', smoke = '#9a8e96';
      puff(S, 46, 14, 3, smoke); puff(S, 50, 6, 3.8, smoke);
      S.C(52, 53, 60, 57, 7, ir, { g: 'tail' }).C(60, 57, 64, 51, 4.6, ir, { g: 'tail' });
      S.C(51, 51, 53, 60, 7, ir2, { g: 'legB' });
      S.R(43, 22, 6, 12, br2, { name: 'stack', g: 'stack' });
      S.C(42.6, 22.6, 49.4, 22.6, 1.4, ir, { g: 'stack' }).E(46, 22.4, 2.2, 1, gl, { glow: true, g: 'stack' });
      S.E(38, 46, 20, 14, br, { name: 'body', g: 'body' });
      for (const y of [38, 44, 50, 56]) S.C(18, y, 58, y, 0.6, br2, { clip: 'body', flat: true, line: false });
      for (const [x, y] of [[26, 35], [38, 35], [50, 35], [32, 41], [44, 41], [54, 41], [26, 47], [38, 47], [50, 47], [32, 53], [44, 53]]) S.C(x, y, x, y + 3, 0.6, br2, { clip: 'body', flat: true, line: false });
      S.C(36, 31, 37, 61, 2.2, ir, { clip: 'body', line: false }).C(50, 33, 51, 61, 2.2, ir, { clip: 'body', line: false });
      for (const [x, y] of [[36.4, 38], [36.6, 46], [36.8, 54], [50.4, 40], [50.6, 48]]) S.E(x, y, 0.8, 0.8, '#8a8488', { clip: 'body', flat: true, line: false });
      for (const [x, y, h] of [[30, 34, 5], [40, 32, 6], [54, 36, 5]]) S.P([[x - 3, y + 1], [x, y - h], [x + 3, y + 1]], ir, { g: 'plates' });
      S.C(29, 56, 28, 61, 7, ir, { g: 'legF' }).C(40, 57, 40, 61, 7, ir, { g: 'legF' });
      for (const x of [24.6, 27.4, 36.6, 39.4]) S.C(x, 61, x - 1, 62.4, 1.2, horn);
      S.C(27, 46, 22, 35, 10.4, br, { g: 'neck' });
      S.E(29, 50, 6.6, 6, ir2, X(F, { name: 'door' }));
      S.E(29, 51, 4.8, 4, gl, X(F, { glow: true, clip: 'door' }));
      for (const x of [26.6, 29, 31.4]) S.C(x, 46, x, 56, 0.8, ir2, X(F, { clip: 'door', flat: true, line: false }));
      S.P([[16, 25], [20, 16], [22, 26]], horn, { g: 'horn' }).P([[22, 26], [28, 19], [26, 29]], horn, { g: 'horn' });
      S.E(18, 30, 10, 8, ir, { name: 'head', g: 'head' }).E(9, 34, 6.4, 4.6, ir, { g: 'head' });
      S.C(4, 37.4, 14, 37.8, 1, gl, X(F, { glow: true, flat: true, line: false }));
      S.C(12, 25.6, 18, 26.6, 1.2, ir2, X(F, { flat: true, line: false })).C(19, 26.6, 25, 25.8, 1.2, ir2, X(F, { flat: true, line: false }));
      S.eye(15, 29, 2.4, 2.6, gl2, { dark: '#7a2a10', white: 0.4 }).eye(21.4, 29, 2.6, 2.8, gl2, { dark: '#7a2a10', white: 0.4 });
      S.E(4.4, 32, 1, 0.9, '#100a0a', X(F, { flat: true }));
      S.E(20, 26, 6, 3, ir2, X(B, { clip: 'head', line: false }));
      spark(S, [[2.4, 28, 0.9], [1, 24, 1], [4, 21, 0.7], [2, 17, 0.6], [6, 25, 0.6]], gl2);
      DD.H.fit(S, 0.84, 34, 60, 1, 0); // v21: Anschnitt am Bildrand behoben
    },
  });
  Object.assign(DD.TEX, { essenwyrm: 'stone' });
})();
