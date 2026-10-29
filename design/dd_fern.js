'use strict';
// NUR ENTWURF – gebogener Farnwedel für Moosdrachling/Farnwyrm
(function () {
  DD.H.fern = (S, x, y, h, r, bend, c, c2) => {
    const n = 6; let px = x, py = y;
    for (let i = 0; i < n; i++) {
      const t = i / n, a = r + bend * t, nx = px + Math.sin(a) * h / n, ny = py - Math.cos(a) * h / n;
      S.C(px, py, nx, ny, 1 - t * 0.5, c2, { g: 'fern' });
      if (i > 0) {
        const L = 3.8 * (1 - t * 0.75);
        for (const s of [-1, 1]) { const b = a + s * 1.05; S.C(px, py, px + Math.sin(b) * L, py - Math.cos(b) * L, 1.25 * (1 - t * 0.4), c, { g: 'fern' }); }
      }
      px = nx; py = ny;
    }
    S.E(px, py, 1, 0.8, c, { g: 'fern' });
  };
})();
