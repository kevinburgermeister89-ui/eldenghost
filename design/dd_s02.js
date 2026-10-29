'use strict';
// NUR ENTWURF – überarbeitet: Nebelkönigswyrm (schwebt jetzt); neu: Glutechse
(function () {
  const { F, B, X, puff, halo, spark, up } = DD.H;
  Object.assign(DD.DEF, {
    nebelkoenigswyrm(S0) { // schwebender Wyrm mit Sternenmuster, Krone aus Mondlicht-Tropfen
      const sk = '#4c4c94', sk2 = '#323272', bel = '#cdc4f0', st = '#fff4c0', drop = '#e4eeff', drop2 = '#c8a8ff', mane = '#8ab0ff';
      S0.E(38, 60, 16, 2.2, '#8a90c8', { alpha: 0.3, flat: true, noOutline: true, cast: false });
      const S = up(S0, 4);

      const sp = [[60, 30, 3], [62, 38, 4.6], [58, 47, 6.4], [50, 52, 8], [40, 52, 9], [32, 46, 9], [30, 38, 8.4], [28, 30, 8]];
      for (let i = 0; i < sp.length - 1; i++) S.C(sp[i][0], sp[i][1], sp[i + 1][0], sp[i + 1][1], sp[i + 1][2], sk, { g: 'body' });
      S.P([[60, 30], [64, 24], [57, 27]], mane, { glow: true, g: 'body' }).P([[60, 31], [62, 22], [56, 29]], mane, { glow: true, alpha: 0.7, g: 'body' });
      S.C(50, 56, 40, 56, 2.6, bel, X(F, { flat: true, line: false })).C(34, 50, 33, 42, 2.6, bel, X(F, { flat: true, line: false }));
      for (const [x, y, r] of [[56, 44, 1], [48, 49, 1.3], [42, 48, 0.9], [36, 44, 1.2], [33, 36, 1], [44, 54, 0.8], [60, 38, 0.9], [38, 50, 0.7]]) S.P([[x - r * 1.6, y], [x, y - r * 1.6], [x + r * 1.6, y], [x, y + r * 1.6]], st, { glow: true, line: false });
      for (const [x0, y0, x1, y1] of [[30, 24, 40, 30], [32, 28, 42, 36], [33, 33, 40, 42]]) S.C(x0, y0, x1, y1, 2, mane, { glow: true, g: 'mane' });
      S.E(22, 25, 9, 7.4, sk, { name: 'head', g: 'head' }).E(12, 28, 6, 4, sk, { g: 'head' });
      S.E(13, 30.6, 6.4, 1.6, bel, X(F, { clip: 'head', line: false }));
      S.E(22, 22, 1.2, 1.2, st, { glow: true, clip: 'head', line: false });
      S.C(16, 17, 30, 17.6, 1.4, '#c8d0ff', { glow: true, g: 'crown' });
      for (const [x, y, h, c] of [[16, 16, 4, drop2], [20, 15, 6, drop], [24, 14.6, 7.4, drop], [28, 15, 6, drop], [31.4, 16, 4, drop2]]) { S.E(x, y - h * 0.45, 1.6, 1.8, c, { glow: true, g: 'crown' }); S.P([[x - 1.5, y - h * 0.45], [x, y - h - 1.4], [x + 1.5, y - h * 0.45]], c, { glow: true, g: 'crown' }); }
      halo(S, 18, 24.6, 3.6, '#c8a8ff', 0.3); halo(S, 25, 24.6, 3.8, '#c8a8ff', 0.3);
      S.eye(18, 24.6, 2.2, 2.6, '#f0b8ff', { dark: '#4a2a7a', white: 0.5 }).eye(25, 24.6, 2.4, 2.8, '#f0b8ff', { dark: '#4a2a7a', white: 0.5 });
      S.E(7, 27.4, 0.9, 0.8, '#1a1430', X(F, { flat: true }));
      S.C(6, 28, 1, 24, 0.7, mane, { glow: true }).C(6, 29.4, 1, 33, 0.7, mane, { glow: true });
      spark(S, [[6, 12], [46, 10, 1.2], [56, 18], [2, 46], [42, 22, 0.8]], st);
    },
    glutechse(S) { // kleine Kohle-Echse mit glühender Bauchnaht, raucht im Halbschlaf
      const sk = '#3c3438', sk2 = '#28222a', ash = '#6a5e62', gl = '#ff9a40', gl2 = '#ffd27a', horn = '#8a7a70', smoke = '#a89aa8';
      puff(S, 6, 34, 2.4, smoke); puff(S, 4, 26, 3.2, smoke); puff(S, 7, 17, 3.8, smoke);
      S.C(44, 55, 54, 57, 5, sk, { g: 'tail' }).C(54, 57, 60, 53, 3.6, sk, { g: 'tail' }).C(60, 53, 59, 47, 2.4, sk, { g: 'tail' });
      S.E(59, 46, 1.8, 1.8, gl, { glow: true, g: 'tail' });
      S.C(43, 53, 45, 59.5, 4, sk2, { g: 'legB' });
      S.E(35, 51, 12.5, 7.6, sk, { name: 'body', g: 'body' });
      for (const [x, y, rx] of [[38, 45.6, 4], [31, 46.4, 3], [44, 48, 2.6]]) S.E(x, y, rx, 1.8, ash, { clip: 'body', flat: true, line: false });
      S.C(25, 56.4, 43, 56.8, 1.3, gl, X(F, { clip: 'body', glow: true, flat: true, line: false }));
      for (const [x0, y0, x1, y1] of [[30, 56.6, 31, 53.6], [36, 56.8, 35, 54], [40, 56.8, 41.6, 54.4]]) S.C(x0, y0, x1, y1, 0.6, gl2, X(F, { clip: 'body', glow: true, flat: true, line: false }));
      for (const [x0, y0, x1, y1] of [[34, 45, 36, 48.4], [36, 48.4, 35, 50.4], [42, 47, 44.6, 49.4]]) S.C(x0, y0, x1, y1, 0.6, gl, { clip: 'body', glow: true, flat: true, line: false });
      S.C(28, 54, 27, 59.5, 4, sk, { g: 'legF' }).C(37, 55, 37, 59.5, 4, sk, { g: 'legF' });
      for (const x of [25, 27.4, 35, 37.4]) S.C(x, 60, x - 1, 61.2, 0.9, ash);
      S.P([[19, 35], [22, 28], [25, 35]], horn, { g: 'horn' }).P([[25, 36], [30, 30], [29, 38]], horn, { g: 'horn' });
      S.E(21, 42, 10, 8, sk, { name: 'head', g: 'head' }).E(12, 45, 6, 4.4, sk, { g: 'head' });
      S.E(23, 37, 4, 1.8, ash, { clip: 'head', flat: true, line: false });
      S.C(8, 47.8, 17, 48.4, 0.9, gl, X(F, { glow: true, flat: true, line: false }));
      S.eye(17, 41, 2.4, 2.8, gl2, { dark: '#7a2a10', white: 0.4 }).eye(24, 41, 2.6, 3, gl2, { dark: '#7a2a10', white: 0.4 });
      S.E(17, 38.8, 3.2, 2, sk, X(F, { flat: true, line: false })).E(24, 38.6, 3.4, 2.1, sk, X(F, { flat: true, line: false }));
      S.C(14, 40.4, 20, 40.6, 0.6, sk2, X(F, { flat: true, line: false })).C(21, 40.4, 27.4, 40.6, 0.6, sk2, X(F, { flat: true, line: false }));
      S.E(7, 44, 0.9, 0.8, '#140e10', X(F, { flat: true }));
      S.C(30, 38, 40, 44, 1, gl, X(B, { glow: true, flat: true, line: false }));
      spark(S, [[50, 36, 0.8], [58, 40, 0.7], [14, 30, 0.7]], gl2);
    },
  });
  Object.assign(DD.TEX, { glutechse: 'stone' });
})();
