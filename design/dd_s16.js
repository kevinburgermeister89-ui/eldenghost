'use strict';
// NUR ENTWURF – Neumondhirschkäfer
(function () {
  const { F, B, X, halo, spark } = DD.H;
  const arc = (cx, cy, R, a0, a1, w0, n) => {
    const out = [], inn = [];
    for (let i = 0; i <= n; i++) {
      const t = i / n, a = (a0 + (a1 - a0) * t) * Math.PI / 180, w = w0 * (1 - t) + 0.25;
      out.push([cx + Math.cos(a) * (R + w / 2), cy + Math.sin(a) * (R + w / 2)]);
      inn.push([cx + Math.cos(a) * (R - w / 2), cy + Math.sin(a) * (R - w / 2)]);
    }
    return out.concat(inn.reverse());
  };
  Object.assign(DD.DEF, {
    neumondhirschkaefer(S) { // schwarzer Hirschkäfer, Zangen wie zwei Mondsicheln, Sternenstaub auf dem Panzer
      const sh = '#1e1c2c', sh2 = '#12101c', sh3 = '#3a3858', leg = '#24222e', mn = '#e0e4ff', star = '#f0f0ff';
      for (const [x0, x1] of [[30, 26], [40, 40], [50, 54]]) { S.C(x0, 50, x1, 56, 1.4, leg, { g: 'legB' }); S.C(x1, 56, x1 + (x1 < 40 ? -3 : 3), 60, 1.1, leg, { g: 'legB' }); }
      S.E(42, 44, 17, 12.5, sh, { name: 'shell', g: 'body' });
      S.C(42, 32, 42, 56, 0.7, sh2, { clip: 'shell', flat: true, line: false });
      S.E(38, 37, 9, 3, sh3, { clip: 'shell', flat: true, line: false, rot: -0.15 });
      for (const [x, y, r] of [[34, 42, 0.7], [47, 38, 0.6], [52, 46, 0.8], [40, 50, 0.6], [46, 52, 0.5], [55, 40, 0.5], [36, 48, 0.5], [50, 43, 0.4]]) S.E(x, y, r, r, star, { clip: 'shell', glow: true, flat: true, line: false });
      S.P([[50, 41.4], [50.6, 43.4], [52.6, 44], [50.6, 44.6], [50, 46.6], [49.4, 44.6], [47.4, 44], [49.4, 43.4]], star, { clip: 'shell', glow: true, flat: true, line: false });
      S.E(26, 44, 7, 6.4, sh, { name: 'thorax', g: 'body' });
      S.E(24, 41.6, 3.4, 1.4, sh3, { clip: 'thorax', flat: true, line: false });
      S.C(24, 50, 20, 55, 1.4, leg, { g: 'legF' }).C(20, 55, 16, 59.6, 1.1, leg, { g: 'legF' });
      S.C(34, 52, 33, 57, 1.4, leg, { g: 'legF' }).C(33, 57, 31, 60, 1.1, leg, { g: 'legF' });
      S.E(16, 42, 5.4, 4.4, sh, { name: 'head', g: 'head' });
      S.C(14, 38.4, 10, 33, 0.5, leg, { g: 'head' }).E(9.6, 32.6, 0.9, 0.9, leg, { g: 'head' });
      halo(S, 7, 38, 5, mn, 0.08);
      // v21: zwei getrennte Mondsicheln statt eines geschlossenen Rings
      S.P(arc(13, 32, 7, 55, 195, 3.2, 14), mn, { glow: true, g: 'jawB' });
      S.P(arc(10, 41, 6, 95, 215, 3, 12), mn, { glow: true, g: 'jawF' });
      S.eye(13.6, 41, 1.4, 1.5, '#a8b0ff', X(F, { dark: '#2a2a6a', white: 0.5 }));
      S.E(44, 40, 12, 7, sh3, X(B, { clip: 'shell', flat: true, line: false, alpha: 0.5 }));
      spark(S, [[6, 22, 0.7], [22, 20, 0.5], [58, 26, 0.6], [30, 28, 0.5]], star);
    },
  });
  Object.assign(DD.TEX, { neumondhirschkaefer: 'dots' });
})();
