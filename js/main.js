'use strict';
// Eldenghost – Hauptschleife, Titel, Menü, Speichern/Laden
(function (G) {
  const UI = G.UI, Snd = G.Snd;
  const cv = document.getElementById('game'), ctx = cv.getContext('2d');
  ctx.imageSmoothingEnabled = false;
  // Ausgabeauflösung: logisch 256×240, intern 2× (512×480) oder – auf grossen/hochauflösenden Bildschirmen
  // (Bildschirmbreite × devicePixelRatio ≥ 800) – 4× (1024×960), damit jedes Detail-Pixel scharf auf Gerätepixel fällt.
  G.OUT = 2;
  G.resizeCanvas = () => {
    const r = cv.getBoundingClientRect(), dev = (r.width || 256) * (window.devicePixelRatio || 1);
    const out = G.forceOut || (dev >= 800 ? 4 : 2);
    if (out !== G.OUT || cv.width !== 256 * out) { G.OUT = out; cv.width = 256 * out; cv.height = 240 * out; }
  };
  window.addEventListener('resize', () => setTimeout(G.resizeCanvas, 50));
  setTimeout(G.resizeCanvas, 450); G.resizeCanvas();
  G.time = 0; G.mode = 'title'; G.lock = 0; G.fx = null; G.anims = []; G.titleSprite = null;

  G.animate = (ms, fn) => new Promise(res => G.anims.push({ t: 0, ms, fn, res }));
  G.wait = ms => G.animate(ms, () => {});

  // ---------- Speichern ----------
  const newItems = () => { const o = {}; for (const k in G.ITEMS) o[k] = 0; return o; };
  // Neues Spiel: Aufwachen im Elternhaus, ohne Geist und ohne Seelenfänger (die gibt Ilse nach der Wahl am Laternenstein)
  const newState = () => ({ v: G.SAVE_VERSION, map: 'home', player: { x: 7, y: 2, dir: 'down' }, team: [], box: [], items: newItems(), flags: { q1: 0, story: 0, tour: 0 }, seen: {}, caught: {}, respawn: null, playtime: 0 });
  // v1 -> v2: Karten, AP, Status, neue Gegenstände, Quest-Flags
  G.migrate = s => {
    const n = Object.assign(newState(), s);
    n.items = Object.assign(newItems(), { laterne: 0 }, s.items || {});
    n.flags = Object.assign({ q1: 0 }, s.flags || {});
    if (!G.MAPS[n.map]) n.map = 'dorf';
    if ((s.v || 1) < 2) {
      n.map = 'dorf';
      if (s.flags && s.flags.ilse && !n.flags.q1) n.flags.q1 = 1;
    }
    n.team = (n.team || []).map(G.migrateMon); n.box = (n.box || []).map(G.migrateMon);
    // v3: Mühle und Schmiede im Dorf – stand man auf einer jetzt bebauten Kachel, geht es auf den Dorfplatz
    if ((s.v || 1) < 3 && n.map === 'dorf' && n.player && G.World && G.World.solidAt(G.MAPS.dorf, n.player.x, n.player.y)) n.player = { x: 16, y: 7, dir: 'down' };
    // Starter-Wechsel (Schwammling statt Kieselgeist): Geister bleiben, nur die Starter-Linie wird vermerkt
    if (!n.starter) n.starter = G.starterOf(n);
    // Prolog «Das erloschene Licht»: alte Spielstände mit Geist überspringen Einführung und Fang-Übung,
    // erhalten den Leuchtturm-Auftrag und – falls leer – 5 Seelenfänger
    if (n.flags.story == null) {
      n.flags.story = n.team.length ? 4 : 0;
      if (n.team.length) { n.flags.ilse = 1; if (!n.items.laterne) n.items.laterne = 5; n._storyNew = true; }
    }
    n.v = G.SAVE_VERSION;
    return n;
  };
  G.save = (quiet) => {
    if (G.demo) return false;
    if (!G.state) return false;
    try { G.Store.set(G.SAVE_KEY, JSON.stringify(G.state)); if (!quiet) { Snd.sfx('save'); } return true; }
    catch (e) { console.warn('Speichern fehlgeschlagen', e); return false; }
  };
  G.load = () => {
    try {
      const s = JSON.parse(G.Store.get(G.SAVE_KEY));
      if (!s || !s.team || (!s.team.length && !(s.flags && s.flags.story != null))) return null;
      return G.migrate(s);
    } catch (e) { return null; }
  };
  document.addEventListener('visibilitychange', () => { if (document.hidden && G.mode === 'world') G.save(true); });

  // ---------- Menü ----------
  G.Menu = {};
  G.Menu.teamPicker = async ({ battle, forced, item } = {}) => {
    const S = G.state;
    const opts = S.team.map((m, i) => ({ html: UI.monRow(m, battle && G.B && i === G.B.allyIdx ? ' – im Kampf' : ''),
      disabled: !!(battle && !item && G.B && (i === G.B.allyIdx || m.hp <= 0)) }));
    const hint = !S.team.length ? 'Noch kein Geist an deiner Seite. Ilse wartet auf dem Dorfplatz.' : item ? `Für welchen Geist? (${G.ITEMS[item].name})` : battle ? 'Wähle einen Geist zum Einwechseln.' : 'Tippe auf einen Geist für Details.';
    return UI.choose(opts, {
      area: 'full', cancel: !forced,
      title: `<h2>Dein Team</h2><div class="hint">${hint}${!item && S.box.length ? ` · Im Seelenarchiv: ${S.box.length}` : ''}</div>`
    });
  };
  // Tasche: im Kampf gibt sie die Gegenstands-ID zurück; im Feld wird direkt benutzt
  const BAG_ORDER = ['laterne', 'mondlaterne', 'kraeutertee', 'starktee', 'wacholder', 'klarblick', 'nachtkerze'];
  G.Menu.bag = async ({ battle } = {}) => {
    const S = G.state;
    let sel = 0;
    while (true) {
      const keys = BAG_ORDER.filter(k => G.ITEMS[k] && S.items[k] > 0 && (battle ? G.ITEMS[k].battle : true));
      const keyItems = Object.keys(G.ITEMS).filter(k => !BAG_ORDER.includes(k) && S.items[k] > 0);
      if (!battle) keys.push(...keyItems);
      if (!keys.length) { await UI.say('Deine Tasche ist leer.'); UI.hideText(); return null; }
      const opts = keys.map(k => { const I = G.ITEMS[k], usable = battle ? I.battle : I.field; return { label: `${I.name} ×${S.items[k]}`, sub: I.desc, disabled: !usable, cls: 'item' }; });
      const c = await UI.choose(opts, { area: 'full', cancel: true, start: Math.min(sel, keys.length - 1), title: `<h2>Tasche</h2><div class="hint">${battle ? 'Was möchtest du benutzen?' : 'Wähle einen Gegenstand.'}</div>` });
      if (c < 0) return null;
      sel = c;
      const k = keys[c];
      if (battle) return k;
      const idx = await G.Menu.teamPicker({ item: k });
      if (idx < 0) continue;
      const r = G.useItem(k, S.team[idx]);
      if (r.ok) { S.items[k]--; Snd.sfx('heal'); }
      await UI.say(r.ok ? `Du benutzt ${G.ITEMS[k].name}. ${r.msg}` : r.msg); UI.hideText();
    }
  };
  // Seelenarchiv (Truhe zu Hause)
  G.Menu.archive = async () => {
    const S = G.state; G.lock++;
    while (true) {
      const c = await UI.choose([{ label: 'Geist ablegen', disabled: S.team.length <= 1 }, { label: 'Geist holen', disabled: !S.box.length || S.team.length >= 6 }, { label: 'Schliessen' }],
        { area: 'full', cancel: true, title: `<h2>Seelenarchiv</h2><div class="hint">Team: ${S.team.length}/6 · Im Archiv: ${S.box.length}</div>` });
      if (c < 0 || c === 2) break;
      if (c === 0) {
        const i = await G.Menu.teamPicker({});
        if (i < 0) continue;
        if (S.team.filter((m, k) => k !== i && m.hp > 0).length === 0) { await UI.say('Mindestens ein wacher Geist muss bei dir bleiben.'); UI.hideText(); continue; }
        const [m] = S.team.splice(i, 1); S.box.push(m); UI.toast(`${G.nm(m)} ruht nun im Archiv.`);
      } else if (c === 1) {
        const i = await UI.choose(S.box.map(m => ({ html: UI.monRow(m) })), { area: 'full', cancel: true, title: '<h2>Seelenarchiv</h2><div class="hint">Wen möchtest du mitnehmen?</div>' });
        if (i < 0) continue;
        const [m] = S.box.splice(i, 1); S.team.push(m); UI.toast(`${G.nm(m)} folgt dir wieder.`);
      }
    }
    G.save(true); G.lock--;
  };
  function detailHtml(m) {
    const st = G.stats(m), sp = G.SPECIES[m.sp], need = G.xpFor(m.lvl + 1) - m.xp;
    return `<div class="detail"><img src="${G.SPR.mon[m.sp].icon}" alt=""><div>
      <h2>${sp.name} <span style="color:#e8ddff;font-size:.8em">Lv ${m.lvl}</span></h2>
      ${UI.typeBadges(m.sp)} ${UI.statusBadge(m)}${sp.evo ? ` <small>Entwickelt sich ab Lv ${sp.evo.lvl}</small>` : ''}
      <table><tr><td>LP</td><td>${m.hp}/${st.hp}</td></tr><tr><td>Angriff</td><td>${st.atk}</td></tr>
      <tr><td>Verteidigung</td><td>${st.def}</td></tr><tr><td>Initiative</td><td>${st.spd}</td></tr>
      <tr><td>EP bis Level ${m.lvl + 1}</td><td>${need}</td></tr></table></div></div>
      <div class="movelist"><b>Attacken:</b> ${m.moves.map(id => `${G.MOVES[id].name} <small>AP ${m.pp[id] || 0}/${G.MOVES[id].pp}</small> <span style="color:${G.TYPE_COLORS[G.MOVES[id].type]}">(${G.MOVES[id].type})</span>`).join(', ')}</div>
      <div class="desc">${sp.desc}</div>`;
  }
  G.Menu.team = async () => {
    while (true) {
      const i = await G.Menu.teamPicker();
      if (i < 0) return;
      const m = G.state.team[i];
      const c = await UI.choose([{ label: 'An die Spitze setzen', disabled: i === 0 }, { label: 'Zurück' }], { area: 'full', cancel: true, title: detailHtml(m), cols: 2 });
      if (c === 0) { G.state.team.splice(i, 1); G.state.team.unshift(m); UI.toast(`${G.nm(m)} führt nun dein Team an.`); }
    }
  };
  // Typentabelle (Angriff in Zeilen, Verteidigung in Spalten): 2× stark, ½ schwach, 0 wirkungslos
  function chartHtml() {
    const T = G.TYPES, ab = t => t.slice(0, 3).toUpperCase(), cell = f => f === 2 ? '<td class="se">2</td>' : f === 0.5 ? '<td class="nv">½</td>' : f === 0 ? '<td class="im">0</td>' : '<td></td>';
    return `<h2 style="margin-top:12px">Typentabelle</h2><div class="hint">Zeile greift an, Spalte verteidigt. Doppeltypen multiplizieren sich.</div>
      <table class="typechart"><tr><th></th>${T.map(t => `<th style="color:${G.TYPE_COLORS[t]}">${ab(t)}</th>`).join('')}</tr>
      ${T.map(a => `<tr><th style="color:${G.TYPE_COLORS[a]}">${a}</th>${T.map(d => cell(G.eff1(a, d))).join('')}</tr>`).join('')}
      <tr class="neutral"><th style="color:${G.TYPE_COLORS.Neutral}">Neutral</th>${T.map(() => '<td></td>').join('')}</tr></table>
      <div class="hint">Neutral (typenlos) wie Rempler, Kratzer oder Biss wirkt immer 1× und bekommt keinen Typbonus. Typ-Attacken lernen Geister erst ab Level ${G.TYPE_MOVE_LVL}.</div>`;
  }
  G.chartHtml = chartHtml;
  G.Menu.chronik = async () => {
    const S = G.state;
    const n = Object.keys(S.caught).length;
    const html = G.SPECIES_ORDER.map((sp, i) => {
      const s = G.SPECIES[sp], seen = S.seen[sp] || S.caught[sp];
      return `<div class="chron"><img src="${seen ? G.SPR.mon[sp].icon : G.SPR.mon[sp].darkIcon}" alt=""><div><b>#${i + 1} ${seen ? s.name : '???'}</b>
        ${seen ? UI.typeBadges(sp) : ''} ${S.caught[sp] ? '<span style="color:#e8c870">◆ gefangen</span>' : ''}
        <div class="desc">${seen ? s.desc : 'Noch nicht begegnet.'}</div></div></div>`;
    }).join('');
    await UI.choose([], { area: 'full', cancel: true, title: `<h2>Geisterchronik</h2><div class="hint">Gefangen: ${n} / ${G.SPECIES_ORDER.length}</div>${html}${chartHtml()}` });
  };
  let menuSel = 0;
  const FX_LABEL = { auto: 'Auto', hoch: 'Hoch', niedrig: 'Niedrig' };
  G.Menu.open = async () => {
    if (G.lock > 0) return;
    G.lock++; Snd.sfx('open');
    const te = document.getElementById('toast'); if (te) te.classList.add('hidden');   // Ziel steht im Menü selbst
    while (true) {
      const c = await UI.choose([
        { label: 'Team' }, { label: 'Tasche' }, { label: 'Chronik' }, { label: 'Speichern' },
        { label: 'Ton: ' + (Snd.on ? 'An' : 'Aus') }, { label: 'Effekte: ' + FX_LABEL[G.fxMode] + (G.fxMode === 'auto' && G.lowFx ? ' (niedrig)' : '') }, { label: 'Schliessen' }
      ], { area: 'menu', cancel: true, start: menuSel, title: `<div class="goal"><b>Ziel</b>${G.Story.goal()}</div>` });
      if (c < 0 || c === 6) break;
      menuSel = c;
      if (c === 0) await G.Menu.team();
      else if (c === 1) await G.Menu.bag();
      else if (c === 2) await G.Menu.chronik();
      else if (c === 3) { UI.toast(G.save() ? 'Spiel gespeichert.' : 'Speichern nicht möglich.'); }
      else if (c === 4) { Snd.init(); Snd.toggle(); UI.syncSound(); }
      else if (c === 5) { const nx = { auto: 'hoch', hoch: 'niedrig', niedrig: 'auto' }[G.fxMode]; G.setFx(nx); UI.toast('Effekte: ' + FX_LABEL[nx]); }
    }
    G.lock--;
  };

  // ---------- Titel & neues Spiel ----------
  async function titleFlow() {
    G.mode = 'title'; UI.title(true);
    while (true) {
      const saved = G.load();
      const opts = saved ? [{ label: 'Fortsetzen' }, { label: 'Neues Spiel' }] : [{ label: 'Neues Spiel' }];
      const c = await UI.choose(opts, { area: 'title' });
      Snd.init();
      if (saved && c === 0) {
        const fresh = saved._storyNew; delete saved._storyNew;
        G.state = saved; UI.title(false); enterWorld(); UI.toast('Willkommen zurück.');
        setTimeout(() => UI.toast((fresh ? 'Neu: der Prolog «Das erloschene Licht»! Ziel: ' : 'Ziel: ') + G.Story.goal(), 4200, true), 1700);
        return;
      }
      if (saved) {
        UI.title(false);
        const ok = await UI.yesNo('Neues Spiel beginnen? Der alte Spielstand wird überschrieben.');
        UI.hideText();
        if (!ok) { UI.title(true); continue; }
      }
      UI.title(false);
      await newGame();
      return;
    }
  }
  async function newGame() {
    G.state = newState();
    G.mode = 'intro'; Snd.music('ambient');
    await UI.sayAll([
      'Der Nebel liegt tief über Eldenghost, einem kleinen Dorf zwischen Moor und Meer.',
      'Seit Wochen wandern die Geister wieder – leise, verloren, auf der Suche nach Licht.',
      'Draussen an der Küste wacht ein alter Leuchtturm über das Wasser. Und heute Abend, hat Ilse gesagt, ist ein besonderer Abend. Für dich.'
    ]);
    G.lock++;
    await G.animate(400, p => G.fx = { kind: 'wipe', p });
    enterWorld();
    await G.animate(400, p => G.fx = { kind: 'wipe', p: 1 - p }); G.fx = null;
    await UI.sayAll(['Mutter: Na, endlich wach? Ilse war schon zweimal an der Tür.',
      'Mutter: Sie wartet bei der Laterne am Dorfplatz, gleich östlich von hier. Zieh die Kapuze über – der Nebel ist heute früh dran.',
      'Tipp: Mit A sprichst du mit Leuten und untersuchst Dinge. START öffnet das Menü – dort steht immer dein nächstes Ziel.']);
    UI.hideText(); G.lock--;
    UI.toast('Ziel: ' + G.Story.goal(), 3600, true);
    G.save(true);
  }
  function enterWorld() {
    const p = G.state.player;
    G.mode = 'world'; UI.hideText();
    G.World.setMap(G.state.map || 'dorf', p.x, p.y, p.dir);
  }
  G.onPress = b => {
    if (G.mode !== 'world') return;
    if (b === 'B' && G.World.skipTour()) return;   // Dorfführung überspringen
    if (['up', 'down', 'left', 'right'].includes(b)) {
      G.World.pressDir(b); // sofort drehen bzw. sofort losgehen
      return;
    }
    G.World.onPress(b);
  };

  // ---------- Titelbild ----------
  function renderTitle(dt) {
    G.World.render(ctx, dt, { hidePlayer: true });
    ctx.fillStyle = 'rgba(8,6,20,0.35)'; ctx.fillRect(0, 0, 256, 240);
    const sp = G.titleSprite || (G.mode === 'title' ? 'flackerling' : null);
    if (sp) {
      const t = G.time, y = 128 + Math.sin(t * 2) * 3, c = G.TYPE_COLORS[G.SPECIES[sp].type];
      const gr = ctx.createRadialGradient(128, y - 24, 0, 128, y - 24, 52);
      gr.addColorStop(0, c + '55'); gr.addColorStop(1, c + '00');
      ctx.globalCompositeOperation = 'lighter'; ctx.fillStyle = gr; ctx.fillRect(60, y - 90, 136, 136); ctx.globalCompositeOperation = 'source-over';
      const s = G.titleSprite ? 2.5 : 1.5;
      const N = G.titleSprite ? 80 : 48; ctx.drawImage(G.SPR.mon[sp].at(N), Math.round(128 - N / 2), Math.round(y - N + (G.titleSprite ? 0 : 18)), N, N);
    }
  }

  // ---------- Bildzeit-Wächter ----------
  // Misst Bildabstand und Zeichenzeit (gleitender Mittelwert). Im Modus «Auto» wird auf niedrige Effekte geschaltet,
  // wenn die Bildzeit 3 s lang über 22 ms liegt (unter ~45 fps) – z. B. auf schwächeren Handys.
  let lastNow = 0;
  G.perfTick = perfTick;
  function perfTick(now, rms) {
    const P = G.perf, gap = lastNow ? now - lastNow : 16.7; lastNow = now;
    if (document.hidden || gap > 250) return;                       // Hintergrund/Pause nicht werten
    P.ema += (gap - P.ema) * 0.05; P.render += (rms - P.render) * 0.05; P.frames = (P.frames || 0) + 1;
    if (G.fxMode === 'auto' && !G.lowFx && !(navigator.webdriver && !G.perfTest) && (G.mode === 'world' || G.mode === 'battle')) {   // Testautomaten (Software-Rendering) nicht werten
      P.slow = P.ema > 22 ? P.slow + gap : 0;
      if (P.slow > 3000) { G.lowFx = true; P.low = (P.low || 0) + 1; UI.toast('Effekte reduziert, damit das Spiel flüssig bleibt.'); }
    }
  }
  // ---------- Hauptschleife ----------
  let last = performance.now();
  function frame(now) {
    const dt = Math.max(0, Math.min(0.05, (now - last) / 1000)); last = now; G.time += dt; // rAF-Zeitstempel kann < letzter Wert sein
    if (G.state) G.state.playtime += dt;
    for (let i = G.anims.length - 1; i >= 0; i--) {
      const a = G.anims[i]; a.t += dt * 1000; const p = Math.min(1, a.t / a.ms); a.fn(p);
      if (p >= 1) { G.anims.splice(i, 1); a.res(); }
    }
    if (G.mode === 'world') G.World.update(dt);
    ctx.setTransform(G.OUT, 0, 0, G.OUT, 0, 0);
    ctx.imageSmoothingEnabled = false;
    const r0 = performance.now();
    if (G.mode === 'battle') G.Battle.render(ctx, dt);
    else if (G.mode === 'evo') G.Evo.render(ctx, dt);
    else if (G.mode === 'world') G.World.render(ctx, dt);
    else renderTitle(dt);
    perfTick(now, performance.now() - r0);
    if (G.Snd.pump) G.Snd.pump();          // Musikplaner anstossen, falls der Timer gedrosselt wurde
    if (G.fx) {
      const { kind, p } = G.fx;
      if (kind === 'flash') { if (Math.sin(p * Math.PI * 6) > 0) { ctx.fillStyle = 'rgba(232,224,255,0.75)'; ctx.fillRect(0, 0, 256, 240); } }
      else if (kind === 'wipe') { const h = Math.ceil(p * 120); ctx.fillStyle = '#07060f'; ctx.fillRect(0, 0, 256, h); ctx.fillRect(0, 240 - h, 256, h); }
    }
    requestAnimationFrame(frame);
  }
  // ---------- Test-/Entwicklerhilfen ----------
  G.debug = {
    lead(sp, lvl) { const m = G.makeMon(sp, lvl); G.state.team[0] = m; G.state.caught[sp] = G.state.seen[sp] = 1; return m; },
    items(o) { Object.assign(G.state.items, o); },
    warp(id, x, y, dir) { G.World.setMap(id, x, y, dir || 'down'); },
    wild(sp, lvl, moves) { const m = G.makeMon(sp, lvl); if (moves) { m.moves = moves; G.fillPP(m); } return G.Battle.start({ team: [m] }); }
  };
  UI.layout();
  requestAnimationFrame(frame);
  // ?demo=battle: Vorschau-Kampf ohne Spielstand (für Live-Vorschau / Screenshots)
  async function demoFlow() {
    G.demo = true; G.state = newState(); UI.title(false);
    const pairs = [['irrfackel', 'nebelahn'], ['moorunke', 'totenleuchte'], ['menhirgeist', 'schleierkauz'], ['nebelkauz', 'grabfalter'], ['hauchling', 'torfwicht']];
    G.state.player = { x: 8, y: 13, dir: 'up' }; G.state.map = 'dorf'; enterWorld();
    for (let i = 0; ; i = (i + 1) % pairs.length) {
      G.debug.lead(pairs[i][0], 24);
      await G.debug.wild(pairs[i][1], 22);
      G.state.team.forEach(m => { m.hp = G.stats(m).hp; m.status = null; G.fillPP(m); });
    }
  }
  G.Store.ready.then(() => { G.Snd.on = G.Store.get('eldenghost.sound') !== '0'; { const fx = G.Store.get('eldenghost.fx'); if (fx === 'hoch' || fx === 'niedrig') { G.fxMode = fx; G.lowFx = fx === 'niedrig'; } if (/[?&]lowfx=1/.test(location.search)) G.lowFx = true; } UI.syncSound(); if (/[?&]demo=battle/.test(location.search)) demoFlow(); else titleFlow(); });
})(window.G);
