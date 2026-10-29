// v17: Balance-Prüfung (Stufen, Rollen, Status-Anteil, Lvl-8-Regel) – wird im Browser als Funktionsrumpf mit G ausgeführt
const S = G.SPECIES, pre = {}; for (const k in S) if (S[k].evo) pre[S[k].evo.to] = k;
const stage = k => { let n = 1, c = k; while (pre[c]) { n++; c = pre[c]; } return n; };
const bst = k => { const b = S[k].base; return b.hp + b.atk + b.def + b.spd; };
// Stufen: T1 Grundstufe früh, T1b späte Einzel-/seltene Grundstufe, T2 Mittelstufe, T3 Endstufe stark, T4 Kronenhirsch
const tier = k => { const s = S[k]; if (s.boss) return null; const st = stage(k), line = !!(s.evo || pre[k]);
  if (k === 'kronenhirsch') return 'T4';
  if (s.rare) return st === 1 ? 'T1b' : 'T3';
  if (st === 3) return 'T3'; if (st === 2) return 'T2';
  return bst(k) >= 220 ? 'T1b' : 'T1'; };
const T = {}; for (const k in S) { const t = tier(k); if (t) (T[t] = T[t] || []).push(k); }
// v21: Durchschnitt nur aus den bisherigen Arten (die neuen Drache/Dunkel-Geister verschieben sonst die Massstäbe); späte v21-Sondergeister (T1b) haben eigene Werte
const NEW21 = new Set(G.NEW21 || []), old = t => T[t].filter(k => !NEW21.has(k));
const avg = {}; for (const t in T) avg[t] = (old(t).length ? old(t) : T[t]).reduce((a, k) => a + bst(k), 0) / (old(t).length ? old(t) : T[t]).length / 4;
const bad = [];
for (const t in T) for (const k of T[t]) { if (t === 'T1b' && NEW21.has(k)) continue; const a = avg[t], b = S[k].base;
  for (const st of ['hp', 'atk', 'def', 'spd']) if (b[st] < 0.7 * a || b[st] > 1.35 * a) bad.push(`${k}.${st}=${b[st]} (${Math.round(b[st] / a * 100)}% of ${t})`);
  if (Math.abs(bst(k) / (a * 4) - 1) > 0.13) bad.push(`${k} BST ${bst(k)} vs ${t} ${Math.round(a * 4)}`);
  const r = S[k].role, m = b, learn = S[k].learn.map(l => G.MOVES[l[1]]);
  const ok = { Tank: (m.hp + m.def) / 2 >= 1.1 * a && m.spd <= 0.92 * a, Sweeper: (m.atk + m.spd) / 2 >= 1.1 * a && m.def <= 0.95 * a,
    Speedster: m.spd >= 1.12 * a && m.spd >= Math.max(m.hp, m.atk, m.def), Bruiser: (m.hp + m.atk) / 2 >= 1.08 * a && m.spd <= 1.0 * a,
    Support: (m.hp + m.def) / 2 >= 1.0 * a && m.atk <= 1.0 * a && learn.some(M => M.heal || M.protect || (M.effect && M.effect.who === 'self')),
    Status: learn.filter(M => M.status || (M.effect && M.effect.who === 'foe') || (M.eff2 && M.eff2.who === 'foe')).length >= 2 && learn.some(M => M.status) }[r];
  if (!r) bad.push(`${k} ohne Rolle`); else if (!ok) bad.push(`${k} passt nicht zu ${r} ${JSON.stringify(b)} a=${a.toFixed(1)}`);
}
const info = { tiers: Object.fromEntries(Object.entries(avg).map(([t, a]) => [t, Math.round(a * 4)])) };
// Status-Anteil
const catchable = Object.keys(S).filter(k => !S[k].boss);
const used = new Set(catchable.flatMap(k => S[k].learn.map(l => l[1])));
const stat = [...used].filter(id => G.MOVES[id].status);
info.used = used.size; info.statusMoves = stat.length; info.statusShare = stat.length / used.size;
const entries = catchable.flatMap(k => S[k].learn.map(l => l[1]));
info.entryShare = entries.filter(id => G.MOVES[id].status).length / entries.length;
for (const k of catchable) { if (S[k].role === 'Status') continue; const L = S[k].learn, n = L.filter(l => G.MOVES[l[1]].status).length; if (n / L.length > 0.25) bad.push(`${k} zu viele Status ${n}/${L.length}`); }
// lvl 8
for (const k in S) { for (const [l, id] of S[k].learn) if (l < 8 && !G.isNeutral(id)) bad.push(`early ${k}:${id}`);
  const f = Math.min(...S[k].learn.filter(([l, id]) => G.MOVES[id].power > 0 && G.hasType(k, G.MOVES[id].type)).map(([l]) => l)); if (f < 8 || f > 9) bad.push(`first own ${k}:${f}`); }
// unbekannte Attacken
for (const k in S) for (const [, id] of S[k].learn) if (!G.MOVES[id]) bad.push('missing ' + id);
info.noDesc = Object.keys(G.MOVES).filter(id => !G.MOVES[id].d);
return { bad, info };
