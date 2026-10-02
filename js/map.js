// v18.1: Übersichtskarte (Gebiete, Standort, Aufgaben-Markierungen) und Hinweis-Einblendung für neue Nebenquests
(function (G) {
  'use strict';
  const W = 160, H = 120;
  const flag = k => (G.state && G.state.flags[k]) || 0;
  const story = () => flag('story'), q1 = () => flag('q1');
  const zn = (z, d) => (G.WILD_AREAS && G.WILD_AREAS[z] && G.WILD_AREAS[z].name) || d;
  // Gebiete der Karte: Lage auf der Übersicht (x, y in Kartenpixeln), Symbol, Zugehörigkeit zu Spielkarten
  const NODES = [
    { id: 'dorf', name: 'Eldenghost', x: 62, y: 22, icon: 'dorf', region: 'dorf' },
    { id: 'nebelgras', name: zn('nebelgras', 'Nebelgras'), x: 62, y: 48, icon: 'gras', region: 'dorf' },
    { id: 'schilfrand', name: zn('schilfrand', 'Schilfrand'), x: 62, y: 72, icon: 'schilf', region: 'moor' },
    { id: 'kapelle', name: zn('kapelle', 'Versunkene Kapelle'), x: 30, y: 80, icon: 'kapelle', region: 'moor' },
    { id: 'torfstich', name: zn('torfstich', 'Torfstich'), x: 92, y: 86, icon: 'torf', region: 'moor' },
    { id: 'moorherz', name: zn('moorherz', 'Moorherz'), x: 30, y: 104, icon: 'herz', region: 'moor' },
    { id: 'nebelsee', name: 'Nebelsee', x: 64, y: 106, icon: 'see', region: 'moor' },
    { id: 'kuestenweg', name: zn('kuestengras', 'Küstenweg'), x: 112, y: 44, icon: 'kueste', region: 'kueste' },
    { id: 'hoehle', name: zn('hoehle', 'Klippenhöhle'), x: 108, y: 14, icon: 'hoehle', region: 'kueste' },
    { id: 'leuchtturm', name: 'Leuchtturm', x: 142, y: 22, icon: 'turm', region: 'kueste' },
    { id: 'hafen', name: 'Hafen', x: 140, y: 70, icon: 'hafen', region: 'kueste' }
  ];
  const BY = Object.fromEntries(NODES.map(n => [n.id, n]));
  const LINKS = [['dorf', 'nebelgras'], ['nebelgras', 'schilfrand'], ['schilfrand', 'kapelle'], ['schilfrand', 'torfstich'], ['kapelle', 'moorherz'], ['torfstich', 'moorherz'],
    ['torfstich', 'nebelsee'], ['nebelgras', 'kuestenweg'], ['kuestenweg', 'hoehle'], ['kuestenweg', 'leuchtturm'], ['hoehle', 'leuchtturm'], ['kuestenweg', 'hafen']];
  // Spielkarte + Kachel -> Gebiet (Innenräume zählen dort, wo ihre Tür liegt)
  function nodeAt(mapId, x, y) {
    const m = G.MAPS[mapId];
    if (m && m.kind === 'interior') { const w = m.warps['4,7']; if (w) return nodeAt(w.to, w.x, w.y); }
    if (mapId === 'dorf') return y >= 18 ? 'nebelgras' : 'dorf';
    if (mapId === 'tiefesmoor') {
      if (y >= 28) return 'schilfrand';
      if (y < 13) return 'nebelsee';
      if (x <= 8 && y >= 21) return 'moorherz';
      if (x <= 9) return 'kapelle';
      return 'torfstich';
    }
    if (mapId === 'kueste') return x <= 10 ? 'kuestenweg' : y <= 9 ? 'leuchtturm' : 'hafen';
    if (mapId === 'hoehle') return 'hoehle';
    return 'dorf';
  }
  function visited() {
    const S = G.state, v = Object.assign({}, S.areas || {});
    // ältere Spielstände: aus dem Fortschritt ableiten
    v.dorf = 1; if (story() >= 2) v.nebelgras = 1;
    if (q1() >= 3) v.schilfrand = 1; if (q1() >= 4) v.torfstich = 1; if (q1() >= 5) v.nebelsee = 1;
    if (story() >= 5) v.kuestenweg = v.leuchtturm = 1; if (flag('quantum')) v.hoehle = 1; if (story() >= 8) v.hafen = 1;
    return v;
  }
  const unlocked = id => { const r = BY[id].region; return r === 'moor' ? q1() >= 3 : r === 'kueste' ? story() >= 4 : true; };
  function markVisit() {
    if (!G.state || !G.map || !G.P) return;
    const id = nodeAt(G.map.id, G.P.x, G.P.y), S = G.state;
    if (!S.areas) S.areas = {};
    if (!S.areas[id]) S.areas[id] = 1;
  }

  // ---- Aufgaben ----
  const MAIN_AT = () => { const s = story(); return [ 'dorf', 'dorf', 'nebelgras', 'dorf', 'leuchtturm', G.FEAT.cave && !flag('quantum') ? 'hoehle' : 'leuchtturm', 'dorf', 'hafen', 'hafen' ][Math.min(8, s)]; };
  const Q1_AT = { 1: 'nebelgras', 2: 'nebelgras', 3: 'torfstich', 4: 'nebelsee', 5: 'nebelsee', 6: 'dorf' };
  const Q1_GOAL = {
    1: 'Sprich mit Wido bei den Gräbern im Nebelgras.',
    2: 'Lies den Wegweiser ganz im Süden – dort beginnt der Weg ins Tiefe Moor.',
    3: 'Such in Jorins Torfhütte im Tiefen Moor nach einer Spur.',
    4: 'Geh zum Nebelsee – dort steht ein Mann im grauen Mantel.',
    5: 'Der Alte auf dem Hügel am Nebelsee … sei sanft zu ihm.',
    6: 'Bring Marens Laterne zu Ilse auf den Dorfplatz.'
  };
  // Nebenquests: avail = kann jetzt angenommen werden («!» beim Auftraggeber), active = läuft, done = abgeschlossen
  const SIDE = [
    { id: 'licht', name: 'Das Licht im Moor', at: 'dorf',
      avail: () => story() >= 4 && q1() === 0, active: () => q1() >= 1 && q1() <= 6, done: () => q1() >= 7,
      hint: () => flag('note') ? 'Sprich mit Ilse auf dem Dorfplatz über Jorins Brief.' : 'Bei Jorin brennt kein Licht – schau an seiner Tür nach (östlich vom Weg).',
      goal: () => Q1_GOAL[q1()], goalAt: () => Q1_AT[q1()] },
    { id: 'katzen', name: 'Besuch bei Kevin und Cassandra', at: 'dorf',
      avail: () => !!G.FEAT.cats && story() >= 3 && !flag('kc'), active: () => false, done: () => !!flag('kc'),
      hint: () => 'Klopf bei Kevin und Cassandra an – das Haus mit den Katzen westlich vom Dorfplatz.' }
  ];
  G.SIDEQUESTS = SIDE;
  function quests() {
    const out = { main: { name: 'Das erloschene Licht', goal: G.Story.goal(), at: MAIN_AT() }, newQ: [], active: [], done: [] };
    for (const q of SIDE) {
      if (q.done()) out.done.push(q);
      else if (q.active()) out.active.push({ q, goal: q.goal(), at: q.goalAt() });
      else if (q.avail()) out.newQ.push(q);
    }
    return out;
  }

  // ---- Zeichnen (Pixelstil, 160×120, pixelgenau hochskaliert) ----
  function px(c, x, y, w, h, col) { c.fillStyle = col; c.fillRect(Math.round(x), Math.round(y), w, h); }
  const ICON = {
    dorf(c, x, y) { px(c, x - 7, y - 1, 6, 5, '#8a7a6a'); px(c, x - 8, y - 3, 8, 2, '#5a3e3a'); px(c, x - 5, y + 1, 2, 3, '#ffc860');
      px(c, x + 1, y - 2, 7, 6, '#9a8a78'); px(c, x, y - 4, 9, 2, '#4a3e5a'); px(c, x + 3, y, 2, 2, '#ffc860'); px(c, x - 1, y + 4, 4, 1, '#6a5a48'); },
    gras(c, x, y) { for (const [a, b] of [[-6, 0], [-2, -3], [2, 1], [5, -2], [-4, 3], [1, 4]]) { px(c, x + a, y + b, 1, 3, '#7aa070'); px(c, x + a + 1, y + b + 1, 1, 2, '#5a8058'); } },
    schilf(c, x, y) { px(c, x - 7, y + 2, 14, 2, '#3a5a6a'); for (const a of [-5, -2, 1, 4]) { px(c, x + a, y - 4, 1, 6, '#8a9a5a'); px(c, x + a, y - 5, 1, 2, '#6a4a2a'); } },
    kapelle(c, x, y) { px(c, x - 4, y - 2, 8, 6, '#6a6878'); px(c, x - 5, y - 4, 10, 2, '#3e3a50'); px(c, x - 1, y - 8, 2, 4, '#8a88a0'); px(c, x - 2, y - 7, 4, 1, '#8a88a0'); px(c, x - 1, y + 1, 2, 3, '#b8a0f0'); px(c, x - 6, y + 4, 12, 1, '#3a5a6a'); },
    torf(c, x, y) { for (const [a, b] of [[-6, -2], [-1, -3], [3, 0], [-4, 2]]) { px(c, x + a, y + b, 4, 3, '#5a3e2a'); px(c, x + a, y + b, 4, 1, '#7a5a3a'); } px(c, x + 1, y + 2, 1, 1, '#ff9a4a'); },
    herz(c, x, y) { px(c, x - 1, y - 1, 2, 6, '#4a3424'); px(c, x - 5, y - 5, 10, 4, '#3a6a4a'); px(c, x - 3, y - 7, 6, 2, '#4a8a5a'); px(c, x - 6, y + 4, 12, 1, '#2a4a34'); },
    see(c, x, y) { px(c, x - 8, y - 2, 16, 6, '#2a4a6a'); px(c, x - 6, y - 3, 12, 1, '#2a4a6a'); px(c, x - 4, y, 3, 1, '#7aa0c8'); px(c, x + 2, y + 2, 3, 1, '#7aa0c8'); },
    kueste(c, x, y) { px(c, x - 8, y - 1, 16, 5, '#c8b890'); px(c, x - 8, y + 3, 16, 2, '#3a6a8a'); px(c, x - 5, y - 3, 1, 3, '#8aa070'); px(c, x + 3, y - 2, 1, 2, '#8aa070'); },
    hoehle(c, x, y) { px(c, x - 7, y - 4, 14, 8, '#5a5460'); px(c, x - 5, y - 6, 10, 2, '#6a6470'); px(c, x - 3, y - 1, 6, 5, '#141018'); px(c, x - 2, y - 2, 4, 1, '#141018'); },
    turm(c, x, y) { px(c, x - 2, y - 7, 4, 11, '#d8d0e0'); px(c, x - 2, y - 4, 4, 2, '#c84a4a'); px(c, x - 2, y, 4, 2, '#c84a4a'); px(c, x - 3, y - 9, 6, 2, '#ffe08a'); px(c, x - 4, y + 4, 8, 1, '#5a5460'); },
    hafen(c, x, y) { px(c, x - 8, y + 2, 16, 3, '#3a6a8a'); px(c, x - 5, y, 9, 2, '#6a4a30'); px(c, x - 1, y - 7, 1, 7, '#8a7a6a'); px(c, x, y - 6, 4, 4, '#e8e0d0'); px(c, x - 8, y - 1, 3, 3, '#7a5a3a'); }
  };
  function bubble(c, x, y, kind) {
    const fill = kind === 'new' ? '#ffd45a' : '#5ad8d0', ink = kind === 'new' ? '#5a3a08' : '#0a3a40';
    px(c, x - 3, y - 4, 7, 7, '#120c1c'); px(c, x - 2, y - 5, 5, 9, '#120c1c'); px(c, x - 2, y - 3, 5, 5, fill); px(c, x - 1, y - 4, 3, 7, fill);
    px(c, x, y + 4, 1, 2, '#120c1c');
    if (kind === 'new') { px(c, x, y - 3, 1, 3, ink); px(c, x, y + 1, 1, 1, ink); } else { px(c, x, y - 3, 1, 1, ink); px(c, x - 1, y - 2, 3, 3, ink); px(c, x - 2, y - 1, 5, 1, ink); px(c, x, y + 1, 1, 1, ink); }
  }
  function pin(c, x, y) {
    px(c, x - 2, y - 6, 5, 5, '#120c1c'); px(c, x - 1, y - 7, 3, 7, '#120c1c'); px(c, x - 1, y - 5, 3, 3, '#ff6a7a'); px(c, x, y - 6, 1, 5, '#ff6a7a'); px(c, x, y - 5, 1, 1, '#fff4f4'); px(c, x, y - 1, 1, 2, '#120c1c');
  }
  function render(st) {
    const cv = document.createElement('canvas'); cv.width = W; cv.height = H; const c = cv.getContext('2d');
    // Grund: Nachtland, Meer im Osten, Moor im Süden, Pixelrauschen
    px(c, 0, 0, W, H, '#1e2a26'); px(c, 0, 62, W, 58, '#1c2420');
    for (let y = 0; y < H; y++) { const sx = 124 + Math.round(Math.sin(y / 9) * 3) + (y > 80 ? (y - 80) / 4 : 0); px(c, sx, y, W - sx, 1, '#16263a'); px(c, sx, y, 2, 1, '#2a3a4a'); }
    let s = 7; const rnd = () => (s = (s * 16807) % 2147483647) / 2147483647;
    for (let i = 0; i < 260; i++) { const x = rnd() * W | 0, y = rnd() * H | 0; px(c, x, y, 1, 1, x > 126 ? '#203248' : y > 62 ? '#24302a' : '#26342e'); }
    for (let i = 0; i < 14; i++) { const x = rnd() * 120 | 0, y = 64 + rnd() * 54 | 0; px(c, x, y, 4 + (rnd() * 4 | 0), 1, '#22384a'); }
    // Wege
    for (const [a, b] of LINKS) {
      const A = BY[a], B = BY[b], n = Math.ceil(Math.hypot(B.x - A.x, B.y - A.y) / 3), dim = !(st.vis[a] && st.vis[b]);
      for (let i = 1; i < n; i++) { const x = A.x + (B.x - A.x) * i / n, y = A.y + (B.y - A.y) * i / n; px(c, x, y, 1, 1, dim ? '#4a4438' : '#a08a5a'); }
    }
    // Gebiete
    for (const n of NODES) {
      const vs = st.vis[n.id], lk = !st.open[n.id];
      c.globalAlpha = vs ? 1 : lk ? 0.22 : 0.42; ICON[n.icon](c, n.x, n.y); c.globalAlpha = 1;
      if (lk && !vs) { px(c, n.x - 2, n.y - 3, 5, 4, '#8a8090'); px(c, n.x - 1, n.y - 5, 3, 2, '#8a8090'); px(c, n.x, n.y - 4, 1, 1, '#1a1622'); px(c, n.x, n.y - 2, 1, 1, '#1a1622'); }
    }
    const nm = {};
    for (const m of st.marks) { const n = BY[m.at], k = nm[m.at] = (nm[m.at] || 0) + 1; bubble(c, n.x + 7 + (k - 1) * 7, n.y - 9, m.kind); }
    if (st.here) { const n = BY[st.here]; pin(c, n.x - 8, n.y - 4); }
    return cv.toDataURL();
  }
  function state() {
    const vis = visited(), open = {}, Q = quests();
    for (const n of NODES) open[n.id] = !!vis[n.id] || unlocked(n.id);
    const marks = [];
    for (const q of Q.newQ) marks.push({ at: q.at, kind: 'new', id: q.id });
    if (Q.main.at) marks.push({ at: Q.main.at, kind: 'active', id: 'main' });
    for (const a of Q.active) if (a.at) marks.push({ at: a.at, kind: 'active', id: a.q.id });
    const here = G.map && G.P ? nodeAt(G.map.id, G.P.x, G.P.y) : null;
    return { vis, open, marks, here, Q };
  }
  const esc = s => String(s).replace(/[&<>]/g, ch => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[ch]));
  function html() {
    const st = state(), Q = st.Q;
    const labels = NODES.map(n => {
      const cls = st.vis[n.id] ? 'vis' : st.open[n.id] ? 'unvis' : 'locked';
      return `<span class="map-node ${cls}${st.here === n.id ? ' here' : ''}" data-id="${n.id}" data-state="${cls}" style="left:${n.x / W * 100}%;top:${(n.y + 6) / H * 100}%">${cls === 'locked' ? '???' : esc(n.name)}</span>`;
    }).join('');
    const marks = st.marks.map(m => `<i class="map-mark" data-kind="${m.kind}" data-at="${m.at}" data-q="${m.id}"></i>`).join('');
    const row = (cls, ico, name, txt) => `<div class="mq ${cls}"><span class="mi">${ico}</span><div><b>${esc(name)}</b>${txt ? `<span>${esc(txt)}</span>` : ''}</div></div>`;
    const list = [row('active', '◆', 'Hauptgeschichte: ' + Q.main.name, Q.main.goal)]
      .concat(Q.active.map(a => row('active', '◆', 'Nebenquest: ' + a.q.name, a.goal)))
      .concat(Q.newQ.map(q => row('new', '!', 'Neu: ' + q.name, q.hint())))
      .concat(Q.done.map(q => row('done', '✓', q.name, 'abgeschlossen'))).join('');
    return `<h2>Karte</h2><div class="hint">${st.here ? 'Du bist hier: ' + esc(BY[st.here].name) : ''}</div>
      <div class="worldmap"><img src="${render(st)}" alt="Karte von Eldenghost und Umgebung">${labels}${marks}</div>
      <div class="map-legend"><span><i class="lg new">!</i> Neue Nebenquest</span><span><i class="lg active">◆</i> Aktuelles Ziel</span><span><i class="lg here"></i> Du</span><span><i class="lg dim"></i> Unbesucht / versperrt</span></div>
      <div class="map-quests"><div class="mq-h">Offene Aufgaben</div>${list}</div>`;
  }
  // Kartenbildschirm: Touch (✕ Karte schliessen) und B schliessen; G.Menu wird erst in main.js angelegt -> dort als G.Menu.map eingehängt
  const open = async () => {
    const own = G.lock === 0 && G.mode === 'world'; if (own) G.lock++;
    markVisit();
    try {
      const p = G.UI.choose([], { area: 'full', cancel: true, backLabel: '✕ Karte schliessen', title: html() });
      // D-Pad hoch/runter blättert durch Karte und Aufgabenliste, A/B schliessen
      const h = G.UI.handler, box = document.getElementById('choices');
      if (h) G.UI.handler = b => { if (b === 'up' || b === 'down') { box.scrollBy({ top: b === 'up' ? -60 : 60 }); return; } h(b); };
      await p;
    }
    finally { if (own) G.lock--; }
  };
  G.Map = { NODES, nodeAt, state, html, markVisit, open };

  // ---- Einblendung «Neue Nebenquest verfügbar» (einmal je Quest, blockiert nichts, wartet auf freie Momente) ----
  let qEl = null, busyUntil = 0;
  function showQuestToast(q) {
    if (!qEl) { qEl = document.createElement('div'); qEl.id = 'qtoast'; qEl.setAttribute('aria-live', 'polite'); (document.getElementById('screen') || document.body).appendChild(qEl); }
    qEl.innerHTML = `<span class="qs">✦</span> Neue Nebenquest verfügbar: <b>${esc(q.name)}</b>`;
    qEl.classList.remove('show'); void qEl.offsetWidth; qEl.classList.add('show');
    busyUntil = Date.now() + 4400;
    G.lastQuestToast = q.id;
  }
  function free() {
    const t = document.getElementById('toast');
    return G.state && G.mode === 'world' && G.lock === 0 && !G.UI.kind && !G.UI.handler && !(G.P && G.P.auto) && (!t || t.classList.contains('hidden'));
  }
  function tick() {
    if (!G.state || G.mode !== 'world') { if (qEl && G.mode === 'battle') qEl.classList.remove('show'); return; }
    markVisit();
    if (Date.now() < busyUntil || !free()) return;
    const q = SIDE.find(q => q.avail() && !q.done() && !q.active() && !G.state.flags['sq_' + q.id]);
    if (!q) return;
    G.state.flags['sq_' + q.id] = 1; G.save(true);
    showQuestToast(q);
  }
  G.QuestToast = { tick, show: showQuestToast, DURATION_MS: { fadeIn: 300, hold: 3500, fadeOut: 500 } };
  setInterval(tick, 500);
})(window.G);
