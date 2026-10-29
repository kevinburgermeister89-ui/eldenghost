'use strict';
// NUR ENTWURF – Gewitterlind
(function () {
  const { F, X, spark } = DD.H;
  Object.assign(DD.DEF, {
    gewitterlind(S) { // schlanker Himmelswyrm aus Gewitterwolke, Blitzadern, Mähne aus Regenfäden
      const cl = '#5c6480', cl2 = '#3e4460', clh = '#8a92b0', bolt = '#fff070', rain = '#9ad0ff', eye = '#fff6a0';
      S.E(36, 60, 16, 2, '#6a7090', { alpha: 0.3, flat: true, noOutline: true, cast: false });
      for (const [x, y] of [[44, 50], [52, 54], [30, 52]]) S.C(x, y, x - 1, y + 3.4, 0.5, rain, { alpha: 0.6, flat: true, line: false, cast: false });
      const sp = [[63, 18, 2.6], [61, 26, 4], [55, 34, 5.6], [45, 38, 6.4], [37, 35, 6.6], [31, 29, 6]];
      for (let i = 0; i < sp.length - 1; i++) S.C(sp[i][0], sp[i][1], sp[i + 1][0], sp[i + 1][1], sp[i + 1][2], cl, { g: 'body' });
      for (const [x, y, r] of [[60, 23, 3.4], [56, 29, 4], [49, 33, 4.4], [41, 32, 4.4], [34, 27, 4]]) S.E(x, y, r, r * 0.8, clh, { g: 'body' });
      for (const [x, y, l] of [[28, 26, 9], [30.5, 28, 11], [33, 30.5, 10], [35.5, 33, 8], [26, 27, 7]]) { S.C(x, y, x - 1.6, y + l, 0.55, rain, { alpha: 0.85, glow: true, flat: true, noOutline: true, cast: false, g: 'rain' }); S.E(x - 1.6, y + l + 0.8, 0.7, 0.9, rain, { glow: true, noOutline: true, cast: false, g: 'rain' }); }
      const zig = (pts) => { for (let i = 0; i < pts.length - 1; i++) S.C(pts[i][0], pts[i][1], pts[i + 1][0], pts[i + 1][1], 0.6, bolt, { glow: true, clip: 'body', flat: true, line: false }); };
      zig([[58, 26], [54, 30], [56, 32], [50, 36], [47, 35], [42, 38]]); zig([[44, 34], [40, 33], [41, 36], [35, 34]]); zig([[61, 20], [59, 24], [61, 26]]);
      S.C(38, 39, 36, 45, 2.2, cl2, { g: 'arm' }).C(36, 45, 34.4, 45.4, 0.8, bolt, { glow: true }).C(36, 45, 35.4, 46.8, 0.8, bolt, { glow: true });
      S.P([[22, 19], [25, 14], [24, 17], [28, 11], [27, 18], [25, 21]], bolt, { glow: true, g: 'horn' });
      S.E(22, 24, 8, 6.4, cl, { name: 'head', g: 'head' }).E(13, 26.4, 5.4, 3.6, cl, { g: 'head' });
      S.E(25, 20, 4, 2.2, clh, { clip: 'head', line: false });
      S.C(9, 28.6, 16, 29, 0.7, cl2, X(F, { flat: true, line: false }));
      S.eye(18.6, 23.4, 2.2, 2.6, eye, { dark: '#6a5a10', white: 0.5 }).eye(24.6, 23.4, 2.4, 2.8, eye, { dark: '#6a5a10', white: 0.5 });
      S.C(17, 21, 21, 20.4, 0.8, cl2, X(F, { flat: true, line: false }));
      S.E(8.4, 25.4, 0.8, 0.7, '#1a1c2a', X(F, { flat: true }));
      S.C(8, 27, 4, 25, 0.5, bolt, { glow: true }).C(4, 25, 2, 27, 0.5, bolt, { glow: true });
      spark(S, [[6, 12, 0.8], [40, 14, 0.9], [62, 40, 0.7]], bolt);
      DD.H.fit(S, 0.86, 32, 40, -2, 0); // v21: Anschnitt am Bildrand behoben
    },
  });
  Object.assign(DD.TEX, { gewitterlind: 'wisp' });
})();
