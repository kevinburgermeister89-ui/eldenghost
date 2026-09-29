'use strict';
// Eldenghost – Oberfläche (DOM-Overlays), Eingabe (Tastatur + Touch), Layout
(function (G) {
  const $ = id => document.getElementById(id);
  const tb = $('textbox'), txt = $('text'), nxt = $('next'), ch = $('choices'), toastEl = $('toast');
  const UI = { handler: null, kind: null };

  // ---------- Layout / Skalierung ----------
  UI.layout = () => {
    const touch = /[?&]touch=1/.test(location.search) || matchMedia('(pointer: coarse)').matches || navigator.maxTouchPoints > 0;
    const cs = getComputedStyle(document.getElementById('app')), px = v => parseFloat(v) || 0;
    const W = window.innerWidth - px(cs.paddingLeft) - px(cs.paddingRight), H = window.innerHeight - px(cs.paddingTop) - px(cs.paddingBottom), land = W > H;
    const b = document.body.classList;
    b.toggle('touch', touch); b.toggle('desktop', !touch); b.toggle('landscape', land); b.toggle('portrait', !land);
    let u;
    if (!touch) u = Math.min(W / 256, H / 240) * 0.96;
    else if (!land) u = Math.min((W - 44) / 256, (H - 52 - Math.max(250, H * 0.33)) / 240); // Gehäuse + Tasten
    else u = Math.min((W - 28 - 2 * 180) / 256, (H - 50) / 240);
    u = Math.max(0.6, u);
    document.documentElement.style.setProperty('--u', u + 'px');
  };
  window.addEventListener('resize', UI.layout);
  setTimeout(UI.layout, 400); // Safe-Area-Variablen werden nativ evtl. verzögert gesetzt
  window.addEventListener('orientationchange', () => setTimeout(UI.layout, 200));

  // ---------- Text ----------
  UI.setText = (s, narrow) => {
    tb.classList.remove('hidden'); tb.classList.toggle('narrow', !!narrow);
    txt.textContent = s; nxt.style.visibility = 'hidden';
  };
  UI.hideText = () => tb.classList.add('hidden');
  UI.say = (s) => new Promise(res => {
    tb.classList.remove('hidden', 'narrow');
    let i = 0, done = false;
    txt.textContent = ''; nxt.style.visibility = 'hidden';
    const iv = setInterval(() => { i += 2; txt.textContent = s.slice(0, i); if (i >= s.length) finish(); }, 28);
    function finish() { clearInterval(iv); txt.textContent = s; done = true; nxt.style.visibility = 'visible'; }
    UI.kind = 'say';
    UI.handler = b => {
      if (!['A', 'B', 'START'].includes(b)) return;
      if (!done) { finish(); return; }
      UI.handler = null; UI.kind = null; G.Snd.sfx('blip'); res();
    };
  });
  UI.sayAll = async (lines) => { for (const l of lines) await UI.say(l); };

  // ---------- Auswahl ----------
  // opts: [{label, sub, html, color, disabled}] ; cfg: {cols, area, cancel, title, start, onHighlight, backLabel}
  UI.choose = (opts, cfg = {}) => new Promise(res => {
    const cols = cfg.cols || 1;
    ch.className = cfg.area || 'bottom'; ch.innerHTML = ''; ch.scrollTop = 0;
    if (cfg.title) { const t = document.createElement('div'); t.className = 'ch-title'; t.innerHTML = cfg.title; ch.appendChild(t); }
    const grid = document.createElement('div'); grid.className = 'ch-grid';
    grid.style.gridTemplateColumns = `repeat(${cols},1fr)`; ch.appendChild(grid);
    let sel = Math.max(0, Math.min(cfg.start || 0, opts.length - 1));   // leere Liste (z. B. noch kein Geist): «Zurück» vorgewählt
    const all = opts.slice(); let lastPtr = null;
    if (cfg.cancel && cfg.area === 'full') all.push({ label: cfg.backLabel || '✕ Zurück', back: true });
    const btns = all.map((o, i) => {
      const b = document.createElement('button');
      b.className = 'ch' + (o.disabled ? ' disabled' : '') + (o.back ? ' back' : '') + (o.cls ? ' ' + o.cls : '');
      b.tabIndex = -1;
      b.innerHTML = o.html || `<span class="lb">${o.label}</span>${o.sub ? `<span class="sub">${o.sub}</span>` : ''}`;
      if (o.color) b.style.setProperty('--tc', o.color);
      // cfg.inspect (Attacken-Menü): auf dem Touchscreen zeigt der erste Tipp die Info der Attacke, der zweite setzt sie ein
      b.addEventListener('pointerdown', e => { e.stopPropagation(); lastPtr = e.pointerType; });
      b.addEventListener('click', e => { e.stopPropagation(); e.preventDefault(); if (o.back) return done(-1);
        if (cfg.inspect && lastPtr === 'touch' && sel !== i && !o.disabled) { sel = i; lastPtr = null; G.Snd.sfx('tick'); hl(); return; }
        lastPtr = null; sel = i; hl(); pick(); });
      (o.back ? ch : grid).appendChild(b);
      return b;
    });
    function hl() {
      btns.forEach((b, i) => b.classList.toggle('sel', i === sel));
      if (cfg.area === 'full' && btns[sel]) btns[sel].scrollIntoView({ block: 'nearest' });
      if (cfg.onHighlight && sel < opts.length) cfg.onHighlight(sel);
    }
    function pick() {
      if (all[sel].back) return done(-1);
      if (all[sel].disabled) { G.Snd.sfx('bump'); return; }
      done(sel);
    }
    function done(v) { UI.handler = null; UI.kind = null; ch.className = 'hidden'; ch.innerHTML = ''; G.Snd.sfx('blip'); res(v); }
    hl();
    UI.kind = 'choose';
    UI.handler = b => {
      const n = all.length;
      if (b === 'left') { if (cols > 1 && sel % cols > 0) sel--; else return; }
      else if (b === 'right') { if (cols > 1 && sel % cols < cols - 1 && sel + 1 < n) sel++; else return; }
      else if (b === 'up') sel = sel - cols >= 0 ? sel - cols : (cols === 1 ? n - 1 : sel);
      else if (b === 'down') sel = sel + cols < n ? sel + cols : (cols === 1 ? 0 : sel);
      else if (b === 'A' || b === 'START') return pick();
      else if (b === 'B') { if (cfg.cancel) done(-1); return; }
      else return;
      G.Snd.sfx('tick'); hl();
    };
  });
  UI.yesNo = async (q) => { UI.setText(q, true); const r = await UI.choose([{ label: 'Ja' }, { label: 'Nein' }], { area: 'battle', cols: 2, cancel: true }); return r === 0; };

  UI.toast = (msg, ms = 1600, long = false) => {
    toastEl.textContent = msg; toastEl.classList.remove('hidden'); toastEl.classList.toggle('long', !!long);
    clearTimeout(UI._tt); UI._tt = setTimeout(() => toastEl.classList.add('hidden'), ms);
  };
  UI.title = show => $('title').classList.toggle('hidden', !show);

  // ---------- Kampf-HUD ----------
  // EP-Leiste: bis zum Rand füllen (vor dem Level-up), dann ohne Rücklauf zurücksetzen und kurz aufblitzen
  UI.xpFill = pct => { const i = document.querySelector('#hud-ally .xpbar i'); if (i) i.style.width = pct + '%'; };
  UI.xpFlash = () => {
    const bar = document.querySelector('#hud-ally .xpbar'), i = bar && bar.querySelector('i'); if (!i) return UI.updateHud();
    i.style.transition = 'none'; UI.updateHud(); void i.offsetWidth; i.style.transition = '';
    bar.classList.remove('flash'); void bar.offsetWidth; bar.classList.add('flash'); setTimeout(() => bar.classList.remove('flash'), 900);
  };
  UI.hud = (show) => { $('hud-enemy').classList.toggle('hidden', !show); $('hud-ally').classList.toggle('hidden', !show); };
  function setBar(el, frac) {
    frac = Math.max(0, Math.min(1, frac));
    el.querySelector('i').style.width = (frac * 100).toFixed(1) + '%';
    el.classList.toggle('mid', frac <= 0.5 && frac > 0.2); el.classList.toggle('low', frac <= 0.2);
  }
  UI.updateHud = () => {
    const B = G.B; if (!B) return;
    const en = B.enemy, al = G.state.team[B.allyIdx];
    const he = $('hud-enemy'), ha = $('hud-ally');
    he.querySelector('.nm').textContent = G.nm(en); he.querySelector('.lv').textContent = 'Lv' + en.lvl;
    he.querySelector('.ty').innerHTML = typeBadges(en.sp) + (G.state.caught[en.sp] && !B.tr ? ' <span style="color:#e8c870">◆</span>' : '') + statusBadge(en)
      + (B.tr && B.team.length > 1 ? ' <span class="balls">' + B.team.map((m, i) => `<i class="${i < B.eIdx ? 'gone' : ''}"></i>`).join('') + '</span>' : '');
    if (en.phases > 1) he.querySelector('.ty').innerHTML += ' <span class="pips" title="Lebensbalken">' + Array.from({ length: en.phases }, (_, i) => `<b class="${i < (en.phase || 0) ? 'gone' : ''}"></b>`).join('') + '</span>';
    setBar(he.querySelector('.bar'), en.hp / G.stats(en).hp);
    const st = G.stats(al);
    ha.querySelector('.nm').textContent = G.nm(al); ha.querySelector('.lv').textContent = 'Lv' + al.lvl;
    ha.querySelector('.ty').innerHTML = typeBadges(al.sp) + statusBadge(al);
    ha.querySelector('.hpnum').textContent = `LP ${al.hp}/${st.hp}`;
    setBar(ha.querySelector('.bar'), al.hp / st.hp);
    const x0 = G.xpFor(al.lvl), x1 = G.xpFor(al.lvl + 1);
    ha.querySelector('.xpbar i').style.width = Math.max(0, Math.min(100, (al.xp - x0) / (x1 - x0) * 100)) + '%';
  };
  function statusBadge(m) { if (!m.status) return ''; const S = G.STATUS[m.status.id]; return ` <span class="badge st" style="background:${S.color}" title="${S.name}">${S.short}</span>`; }
  UI.statusBadge = statusBadge;
  function typeBadge(t) { return `<span class="badge" style="background:${G.TYPE_COLORS[t]}">${t}</span>`; }
  const typeBadges = sp => G.typesOf(sp).map(typeBadge).join(' ');
  UI.typeBadge = typeBadge; UI.typeBadges = typeBadges;
  // v17: Kampfrolle als Abzeichen (Chronik, Team-Übersicht)
  const ROLE_COL = { Tank: '#8ab0d8', Sweeper: '#e89060', Speedster: '#8ae0c8', Bruiser: '#d87870', Support: '#a8d880', Status: '#c0a0e8' };
  UI.roleBadge = (sp, long) => { const r = G.SPECIES[sp] && G.SPECIES[sp].role; if (!r) return '';
    return `<span class="role" style="--rc:${ROLE_COL[r]}">${r}</span>${long ? `<small class="roled"> – ${G.ROLES[r].desc}</small>` : ''}`; };
  // Attacken-Info (Kampf-Menü und Team-Übersicht)
  G.moveInfoHtml = (id, pp, foe) => { const I = G.moveInfo(id, pp); if (!I) return '';
    const h = foe && G.Battle.effHint ? G.Battle.effHint(id, foe) : null;
    return `<div class="mi1"><b class="mn">${I.name}</b> <span class="badge" style="background:${I.color}">${I.type}</span> <span>Stärke <b>${I.power}</b></span> <span>Gen. <b>${I.acc}</b></span> <span>AP <b>${I.ap}</b></span>${I.prio > 0 && I.prio < 3 ? ' <span class="pr">Erstschlag</span>' : ''}${h ? ` <b class="eh ${h.cls}">${h.t} ${h.e === 0 ? 'wirkungslos' : h.e > 1 ? 'sehr effektiv' : 'schwach'}</b>` : ''}</div><div class="mi2">${I.desc}</div>`; };

  UI.monRow = (m, extra = '') => {
    const st = G.stats(m), f = m.hp / st.hp, cls = f <= 0.2 ? 'low' : f <= 0.5 ? 'mid' : '';
    return `<div class="mon"><img src="${G.SPR.mon[m.sp].icon}" alt=""><div class="info">
      <div class="top"><b>${G.nm(m)}</b><span>Lv ${m.lvl}</span></div>
      <div>${typeBadges(m.sp)} ${statusBadge(m)} <small>LP ${m.hp}/${st.hp}${m.hp <= 0 ? ' – erschöpft' : ''}${extra}</small></div>
      <div class="bar ${cls}"><i style="width:${(f * 100).toFixed(0)}%"></i></div></div></div>`;
  };

  // ---------- Eingabe ----------
  const Input = { held: [] };
  const KEYS = {
    ArrowUp: 'up', KeyW: 'up', ArrowDown: 'down', KeyS: 'down', ArrowLeft: 'left', KeyA: 'left', ArrowRight: 'right', KeyD: 'right',
    Space: 'A', KeyZ: 'A', KeyE: 'A', KeyJ: 'A', Enter: 'START', KeyM: 'START', ShiftLeft: 'SELECT', ShiftRight: 'SELECT', Escape: 'B', KeyX: 'B', Backspace: 'B', KeyK: 'B'
  };
  const DIRS = ['up', 'down', 'left', 'right'];
  Input.dir = () => Input.held[Input.held.length - 1] || null;
  Input.dispatch = b => {
    if (b === 'SELECT') { toggleSound(); return; } // SELECT = Ton an/aus, in jedem Zustand
    if (UI.handler) UI.handler(b);
    else if (G.onPress) G.onPress(b);
  };
  // Kein Scrollen/Zoomen/Kontextmenü auf der Steuerung (non-passive nur hier nötig; touch-action: none erledigt den Rest)
  const ctl = document.getElementById('controls');
  ctl.addEventListener('touchstart', e => { if (e.cancelable) e.preventDefault(); }, { passive: false });
  ctl.addEventListener('contextmenu', e => e.preventDefault());
  window.addEventListener('keydown', e => {
    const b = KEYS[e.code]; if (!b) return;
    e.preventDefault(); G.Snd.init();
    if (DIRS.includes(b) && !Input.held.includes(b)) Input.held.push(b);
    if (!e.repeat || DIRS.includes(b)) Input.dispatch(b);
  });
  window.addEventListener('keyup', e => {
    const b = KEYS[e.code]; if (!b) return;
    Input.held = Input.held.filter(x => x !== b);
  });
  window.addEventListener('blur', () => { Input.held = []; });
  document.addEventListener('pointerdown', () => G.Snd.init(), { capture: true });

  // Tippen auf den Bildschirm = A (nur im Textmodus)
  $('screen').addEventListener('pointerdown', e => { if (UI.kind === 'say') { e.preventDefault(); Input.dispatch('A'); } });

  // Steuerkreuz mit Wischen zwischen Richtungen
  const dp = $('dpad'); let dpId = null, dpDir = null;
  const cells = {}; dp.querySelectorAll('.dp[data-d]').forEach(el => cells[el.dataset.d] = el);
  // Richtung aus dem Winkel zur Kreuzmitte: vier 90°-Sektoren um die Achsen. In der Totzone (Radius 12 px) wird keine
  // neue Richtung gewählt (die aktuelle bleibt beim Wischen erhalten). Hysterese nur beim Achsenwechsel mitten im Wischen:
  // die bisherige Achse gilt bis 10° über die Diagonale hinaus. Die Trefferfläche reicht 28 px über das sichtbare Kreuz.
  const DEAD = 12, HYST = 10 * Math.PI / 180;
  function dirFrom(e) {
    const r = dp.getBoundingClientRect(), x = e.clientX - (r.left + r.width / 2), y = e.clientY - (r.top + r.height / 2);
    if (Math.hypot(x, y) < DEAD) return dpDir;
    const a = Math.atan2(y, x), off = Math.abs(Math.atan2(Math.abs(y), Math.abs(x))); // 0 = waagrecht, π/2 = senkrecht
    const horiz = dpDir === 'left' || dpDir === 'right', vert = dpDir === 'up' || dpDir === 'down';
    let useX = off < Math.PI / 4;
    if (horiz && off < Math.PI / 4 + HYST) useX = true; else if (vert && off > Math.PI / 4 - HYST) useX = false;
    return useX ? (Math.cos(a) < 0 ? 'left' : 'right') : (Math.sin(a) < 0 ? 'up' : 'down');
  }
  G.dpadDir = (cx, cy) => dirFrom({ clientX: cx, clientY: cy }); // für Tests
  // Daumen-Knopf: folgt dem Finger innerhalb von KNOB px, bleibt am Rand stehen (Richtung wirkt auch weit ausserhalb)
  const knob = $('dp-knob'), KNOB = 46;
  function moveKnob(e) {
    if (!e) { dp.classList.remove('active'); knob.style.transform = ''; return; }
    const r = dp.getBoundingClientRect(); let x = e.clientX - (r.left + r.width / 2), y = e.clientY - (r.top + r.height / 2);
    const l = Math.hypot(x, y); if (l > KNOB) { x *= KNOB / l; y *= KNOB / l; }
    dp.classList.add('active'); knob.style.transform = `translate(${x.toFixed(1)}px,${y.toFixed(1)}px)`;
  }
  function setDir(d) {
    if (d === dpDir) return;
    if (dpDir) { Input.held = Input.held.filter(x => x !== dpDir); cells[dpDir].classList.remove('on'); }
    dpDir = d;
    if (d) { Input.held.push(d); cells[d].classList.add('on'); Input.dispatch(d); G.haptic(6); }
  }
  dp.addEventListener('pointerdown', e => { e.preventDefault(); if (dpId !== null && dpId !== e.pointerId) return; try { dp.setPointerCapture(e.pointerId); } catch (x) {} dpId = e.pointerId; moveKnob(e); setDir(dirFrom(e)); });
  dp.addEventListener('pointermove', e => { if (e.pointerId === dpId) { moveKnob(e); setDir(dirFrom(e)); } });
  const dpEnd = e => { if (e.pointerId === dpId) { setDir(null); dpId = null; moveKnob(null); } };
  dp.addEventListener('pointerup', dpEnd); dp.addEventListener('pointercancel', dpEnd); dp.addEventListener('lostpointercapture', dpEnd);

  function bindBtn(id, b) {
    const el = $(id);
    el.addEventListener('pointerdown', e => { e.preventDefault(); el.classList.add('on'); Input.dispatch(b); G.haptic(8); });
    const up = () => el.classList.remove('on');
    el.addEventListener('pointerup', up); el.addEventListener('pointercancel', up); el.addEventListener('pointerleave', up);
    el.addEventListener('contextmenu', e => e.preventDefault());
  }
  bindBtn('btn-a', 'A'); bindBtn('btn-b', 'B'); bindBtn('btn-start', 'START'); bindBtn('btn-select', 'SELECT');
  const ss = $('snd-state');
  const snd = $('btn-snd');
  const syncSound = () => { ss.textContent = G.Snd.on ? 'Ton ♪' : 'Ton ✕'; if (snd) { snd.classList.toggle('on', !!G.Snd.on); snd.setAttribute('aria-pressed', G.Snd.on ? 'true' : 'false'); } };
  // Lautsprecher-Taste: reagiert nur auf ein bewusstes Tippen, das AUF der Taste beginnt und dort endet.
  // Keine Pointer-Capture, kein preventDefault ausserhalb, kein Einfluss auf das Steuerkreuz (das seinen Finger per Capture behält).
  if (snd) {
    let sid = null;
    snd.addEventListener('pointerdown', e => { e.preventDefault(); e.stopPropagation(); sid = e.pointerId; snd.classList.add('press'); });
    snd.addEventListener('pointerup', e => {
      if (e.pointerId !== sid) return; sid = null; snd.classList.remove('press');
      const r = snd.getBoundingClientRect(); if (e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom) return;
      toggleSound(); G.haptic(8);
    });
    const cancel = e => { if (e.pointerId === sid) { sid = null; snd.classList.remove('press'); } };
    snd.addEventListener('pointercancel', cancel); snd.addEventListener('pointerleave', cancel);
    snd.addEventListener('click', e => { if (e.detail === 0) toggleSound(); });   // Tastatur/Screenreader (Enter/Leertaste)
    snd.addEventListener('contextmenu', e => e.preventDefault());
  }
  function toggleSound() { G.Snd.init(); G.Snd.toggle(); syncSound(); if (UI.toast) UI.toast(G.Snd.on ? 'Ton an' : 'Ton aus', 900); }
  UI.toggleSound = toggleSound;
  UI.syncSound = syncSound; syncSound();
  document.addEventListener('gesturestart', e => e.preventDefault());

  G.UI = UI; G.Input = Input;
})(window.G);
