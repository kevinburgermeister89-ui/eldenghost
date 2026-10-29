// v20.2 Balance-Simulation der Story-Kämpfe (vereinfachte Kampflogik wie in battle.js: Schaden, STAB, Typfaktor, Volltreffer, Genauigkeit, Initiative/Priorität;
// Gegner-KI = Gewichtung aus enemyChoice; Status-/Wertattacken werden ausgelassen). Aufruf: G.balanceSim(chart, n)
G.balanceSim = (chart, n = 600, seed = 1) => {
  let s = seed; const R = () => (s = (s * 16807) % 2147483647) / 2147483647;
  const saved = G.CHART; G.CHART = chart;
  const evolve = (sp, l) => { while (G.SPECIES[sp].evo && G.SPECIES[sp].evo.lvl && G.SPECIES[sp].evo.lvl <= l) sp = G.SPECIES[sp].evo.to; return sp; };
  const mk = (sp, l, hpm) => { const m = G.makeMon(sp, l); if (hpm) { m.hpMult = hpm; m.hp = G.stats(m).hp; } return m; };
  const dmgMoves = m => m.moves.filter(id => G.MOVES[id] && G.MOVES[id].power > 0);
  const exp = (a, d, id) => { const M = G.MOVES[id], h = M.hits ? (M.hits[0] + M.hits[1]) / 2 : 1; return M.power * h * (M.acc / 100) * G.eff(M.type, d.sp) * (G.hasType(a.sp, M.type) ? 1.5 : 1); };
  const hit = (a, d, id) => { const M = G.MOVES[id]; if (R() * 100 >= M.acc) return 0; const as = G.stats(a), ds = G.stats(d), e = G.eff(M.type, d.sp), st = G.hasType(a.sp, M.type) ? 1.5 : 1;
    const nh = M.hits ? M.hits[0] + Math.floor(R() * (M.hits[1] - M.hits[0] + 1)) : 1; let t = 0;
    for (let i = 0; i < nh; i++) { let x = Math.floor(((2 * a.lvl / 5 + 2) * M.power * as.atk / ds.def) / 50 + 2); x = e === 0 ? 0 : Math.max(1, Math.floor(x * st * e * (R() < (M.crit || 1 / 16) ? 1.5 : 1) * (0.85 + R() * 0.15))); t += x; }
    return t; };
  const pickEnemy = (en, al) => { const w = dmgMoves(en).map(id => [id, exp(en, al, id)]); const tot = w.reduce((a, b) => a + b[1], 0) || 1; let r = R() * tot; for (const [id, x] of w) { if ((r -= x) <= 0) return id; } return w.length ? w[0][0] : null; };
  const pickAlly = (al, en) => dmgMoves(al).sort((a, b) => exp(al, en, b) - exp(al, en, a))[0];
  const fight = (team, tr) => {
    const T = G.TRAINERS[tr], foes = T.team.map(([sp, l]) => mk(sp, l, (T.hpMultFor || {})[sp] || T.hpMult)); let ai = 0, ei = 0, phase = {};
    for (let turn = 0; turn < 300; turn++) {
      const al = team[ai], en = foes[ei]; if (!al || !en) break;
      const ia = pickAlly(al, en), ie = pickEnemy(en, al), pa = G.MOVES[ia]?.prio || 0, pe = G.MOVES[ie]?.prio || 0;
      const sa = G.stats(al).spd, se = G.stats(en).spd, first = pa !== pe ? pa > pe : (sa > se || (sa === se && R() < 0.5));
      for (const side of first ? ['a', 'e'] : ['e', 'a']) {
        if (side === 'a' && ia) en.hp -= hit(al, en, ia); if (side === 'e' && ie) al.hp -= hit(en, al, ie);
        if (en.hp <= 0) { const ph = (T.phases || {})[en.sp] || 1; phase[ei] = (phase[ei] || 1); if (phase[ei] < ph) { phase[ei]++; en.rage = 1.18; en.hp = G.stats(en).hp; } else { ei++; } break; }
        if (al.hp <= 0) { ai++; break; }
      }
      if (ai >= team.length) return 0; if (ei >= foes.length) return 1;
    }
    return ei >= foes.length ? 1 : 0;
  };
  const FIGHTS = { selma: [10, ['nebelgras', 'kuestengras', 'hoehle', 'schilfrand', 'torfstich']], quantum: [11, ['nebelgras', 'kuestengras', 'hoehle', 'schilfrand', 'torfstich']],
    kaspar: [13, ['nebelgras', 'kuestengras', 'hoehle', 'schilfrand', 'torfstich', 'kapelle', 'moorherz']], klingenmeister: [18, Object.keys(G.WILD_AREAS)] };
  const out = {};
  for (const [tr, [L, areas]] of Object.entries(FIGHTS)) {
    const pool = [...new Set(areas.flatMap(z => G.WILD_AREAS[z].table.map(t => t[0])))].filter(sp => G.SPECIES[sp]);
    out[tr] = { lvl: L };
    for (const st of ['flackerling', 'pfuetzling', 'blattling']) {
      let w = 0; for (let i = 0; i < n; i++) { const a = pool[Math.floor(R() * pool.length)], b = pool[Math.floor(R() * pool.length)];
        const team = [st, a, b].map(sp => mk(evolve(sp, L), L)); w += fight(team, tr); }
      out[tr][st] = Math.round(100 * w / n);
    }
  }
  G.CHART = saved; return out;
};
0;
