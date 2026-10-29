'use strict';
// NUR ENTWURF – Grottenwyrm
(function () {
  const { F, B, X, halo, spark } = DD.H;
  Object.assign(DD.DEF, {
    grottenwyrm(S) { // blinder Höhlenwyrm mit Tropfsteinzacken, Kristalle statt Augen
      const st = '#76727e', st2 = '#54505c', st3 = '#a09aa6', bel = '#aaa2a2', cr = '#8af0ff', cr2 = '#4ab8d8', mo = '#5a8048';
      const sp = [[63, 47, 3.4], [58, 53, 6], [48, 55, 9], [38, 52, 10.4], [30, 46, 9.6]];
      S.C(49, 57, 50, 61, 5, st2, { g: 'legB' });
      for (let i = 0; i < sp.length - 1; i++) S.C(sp[i][0], sp[i][1], sp[i + 1][0], sp[i + 1][1], sp[i + 1][2], st, { g: 'body' });
      S.C(54, 59, 40, 60, 2.4, bel, X(F, { clip: 'body', flat: true, line: false }));
      for (const [x, y, r] of [[44, 50, 2.6], [52, 52, 2], [36, 47, 2.2]]) S.E(x, y, r, r * 0.7, mo, { clip: 'body', flat: true, line: false });
      for (const [x, y, h, w] of [[57, 48, 6, 2], [50, 46, 9, 2.8], [42, 42, 12, 3.2], [34, 38, 10, 3], [28, 36, 7, 2.4]]) {
        S.P([[x - w, y + 1], [x - w * 0.3, y - h], [x + w * 0.2, y - h - 0.6], [x + w, y + 1]], st3, { g: 'spikes' });
        S.C(x - w * 0.6, y - h * 0.3, x + w * 0.5, y - h * 0.35, 0.5, st2, { flat: true, line: false, g: 'spikes' });
        S.E(x - w * 0.05, y - h - 1.2, 0.7, 0.9, cr, { glow: true, g: 'spikes' });
      }
      S.P([[45, 50], [47, 44], [49, 50]], cr2, { glow: true, g: 'body' });
      S.C(33, 54, 32, 61, 5.8, st, { g: 'legF' });
      for (const x of [29.6, 32, 34.4]) S.C(x, 61, x - 1, 62.4, 1, st3);
      S.E(20, 41, 10.4, 8.4, st, { name: 'head', g: 'head' }).E(10, 45, 6.6, 4.6, st, { g: 'head' });
      S.E(12, 48.4, 6.4, 1.6, bel, X(F, { clip: 'head', line: false }));
      S.E(16.5, 39.6, 3.2, 2.8, st2, X(F, { flat: true, line: false })).E(23.6, 39, 3.4, 3, st2, X(F, { flat: true, line: false }));
      halo(S, 16.5, 38.6, 4, cr, 0.3); halo(S, 23.6, 38, 4.2, cr, 0.3);
      S.P([[15, 41], [15.4, 36.4], [16.6, 35.4], [17.4, 41]], cr, X(F, { glow: true })).P([[17, 41], [18.4, 37.6], [19, 41]], cr2, X(F, { glow: true }));
      S.P([[22, 41], [22.6, 35.6], [24, 34.6], [24.8, 41]], cr, X(F, { glow: true })).P([[24.4, 41], [26, 37.4], [26.4, 41]], cr2, X(F, { glow: true }));
      S.C(5, 47.6, 15, 48.2, 0.9, '#24202a', X(F, { flat: true, line: false }));
      S.E(4.6, 43.6, 0.9, 0.8, '#24202a', X(F, { flat: true }));
      S.E(22, 35, 6, 2.4, st2, X(B, { clip: 'head', line: false }));
      spark(S, [[8, 26, 0.8], [58, 34, 0.7], [4, 56, 0.6]], cr);
    },
  });
  Object.assign(DD.TEX, { grottenwyrm: 'stone' });
})();
