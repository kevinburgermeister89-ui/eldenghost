'use strict';
// NUR ENTWURF – Kolkwicht
(function () {
  const { F, B, X, spark } = DD.H;
  Object.assign(DD.DEF, {
    kolkwicht(S) { // zerzauster Rabengeist mit Strohhut-Rest, sammelt verlorene Knöpfe
      const fe = '#2c2834', fe2 = '#1c1824', sh = '#5a6a8a', bk = '#4a4450', st = '#d8b860', st2 = '#a8883a', eye = '#ff9a50';
      S.C(38, 56, 38, 60.4, 1.2, '#5a5260').C(45, 56, 47, 60.4, 1.2, '#5a5260');
      S.C(36, 60.4, 40, 60.6, 0.7, '#5a5260').C(45, 60.4, 49, 60.6, 0.7, '#5a5260');
      S.P([[48, 42], [60, 46], [62, 50], [58, 49], [59, 53], [54, 51], [50, 50]], fe2, { g: 'tail' });
      S.E(39, 45, 12, 11, fe, { name: 'body', g: 'body' });
      for (const [x, y, a] of [[50, 40, 0.6], [51, 47, 0.1], [44, 55, 1.2], [32, 55, 2]]) S.P([[x, y], [x + Math.cos(a) * 4, y + Math.sin(a) * 4 - 1], [x + Math.cos(a) * 3, y + Math.sin(a) * 3 + 1.2]], fe, { g: 'body' });
      S.P([[35, 39], [54, 41], [57, 47], [53, 46], [55, 51], [50, 49], [50, 53], [42, 51]], fe2, { name: 'wing', g: 'wing' });
      for (const [x0, y0, x1, y1] of [[41, 43, 53, 45], [42, 47, 51, 49]]) S.C(x0, y0, x1, y1, 0.7, sh, { clip: 'wing', flat: true, line: false });
      S.E(27, 30, 9, 8.4, fe, { name: 'head', g: 'head' });
      for (const [x, y, dx, dy] of [[30, 22, 2, -5], [33, 24, 4, -3], [27, 22, -1, -4]]) S.P([[x - 1.2, y + 1], [x + dx, y + dy], [x + 1.4, y + 1.4]], fe, { g: 'head' });
      S.P([[20, 29], [8, 33], [20, 34.4]], bk, { g: 'head' }).C(11, 32.6, 19.6, 31.8, 0.5, '#7a7480', { flat: true, line: false, g: 'head' });
      S.P([[21, 23.6], [23, 17], [31, 16.4], [33, 23]], st, { name: 'crown', g: 'hat' });
      S.P([[16, 24.4], [38, 22.6], [36, 25.4], [31, 24.4], [28, 26], [24, 24.6], [18, 26]], st, { g: 'hat' });
      S.C(21.6, 21.6, 32.6, 21, 1.1, '#8a4a3a', { g: 'hat' });
      S.E(27, 18.4, 1.6, 1.2, fe2, { clip: 'crown', flat: true, line: false });
      for (const [x0, y0, x1, y1] of [[31, 16.6, 34, 14], [24, 17, 22, 14.6], [36, 25, 39, 27], [18, 25.6, 15, 27.4]]) S.C(x0, y0, x1, y1, 0.4, st2, { line: false });
      S.eye(23.4, 29.6, 2, 2.4, eye, { dark: '#6a2a10', white: 0.5 });
      S.C(22, 39, 30, 46, 0.5, '#c8b890').C(30, 46, 38, 48, 0.5, '#c8b890');
      for (const [x, y, r, c] of [[25, 41.6, 2, '#d85a4a'], [30.4, 45.6, 2.3, '#4a9ad8'], [36.4, 47.6, 2, '#e8c040']]) {
        S.E(x, y, r, r, c, { name: 'btn' + x });
        S.E(x - r * 0.3, y, 0.4, 0.4, '#1a1420', { flat: true, line: false }).E(x + r * 0.3, y, 0.4, 0.4, '#1a1420', { flat: true, line: false });
      }
      S.C(40, 38, 50, 40, 1.2, sh, X(B, { clip: 'body', flat: true, line: false }));
      spark(S, [[10, 20, 0.7], [56, 30, 0.6], [16, 50, 0.6]], '#ffd890');
    },
  });
  Object.assign(DD.TEX, { kolkwicht: 'feather' });
})();
