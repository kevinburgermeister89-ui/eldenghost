'use strict';
// NUR ENTWURF – gemeinsame Helfer für die Entwurfs-Sprites (Technik wie js/creatures.js)
(function () {
  const F = { face: true }, B = { backOnly: true };
  const X = (o, p) => Object.assign({}, o, p);
  const MIST = { alpha: 0.28, flat: true, noOutline: true, cast: false, line: false };
  const puff = (S, x, y, r, c) => { S.E(x, y, r, r * 0.8, c, MIST).E(x - r * 0.7, y + r * 0.35, r * 0.7, r * 0.55, c, MIST).E(x + r * 0.7, y + r * 0.3, r * 0.75, r * 0.55, c, MIST); };
  const halo = (S, x, y, r, c, a) => S.E(x, y, r, r, c, X(F, { glow: true, alpha: a || 0.35, flat: true, noOutline: true, cast: false }));
  const spark = (S, pts, c) => { for (const [x, y, r] of pts) S.E(x, y, r || 1, r || 1, c, { glow: true }); };
  const up = (S, dy) => { const W = {}; W.E = (x, y, ...a) => (S.E(x, y - dy, ...a), W); W.C = (x0, y0, x1, y1, ...a) => (S.C(x0, y0 - dy, x1, y1 - dy, ...a), W); W.P = (pts, ...a) => (S.P(pts.map(([x, y]) => [x, y - dy]), ...a), W); W.R = (x, y, ...a) => (S.R(x, y - dy, ...a), W); W.eye = (x, y, ...a) => (S.eye(x, y - dy, ...a), W); return W; };
  // verkleinert/verschiebt alle bisher gezeichneten Formen um (ox, oy) – gegen Anschnitt am Bildrand
  const fit = (S, k, ox, oy, dx = 0, dy = 0) => {
    const tx = x => ox + (x - ox) * k + dx, ty = y => oy + (y - oy) * k + dy;
    for (const p of S.p) {
      if (p.t === 'E') { p.cx = tx(p.cx); p.cy = ty(p.cy); p.rx *= k; p.ry *= k; }
      else if (p.t === 'C') { p.x0 = tx(p.x0); p.y0 = ty(p.y0); p.x1 = tx(p.x1); p.y1 = ty(p.y1); p.w *= k; }
      else if (p.t === 'P') p.pts = p.pts.map(([x, y]) => [tx(x), ty(y)]);
      else if (p.t === 'R') { p.x = tx(p.x); p.y = ty(p.y); p.w *= k; p.h *= k; }
    }
  };
  DD.H = { F, B, X, MIST, puff, halo, spark, up, fit };
})();
