'use strict';
// Eldenghost – prozedurale Musik & Geräusche (WebAudio, alles synthetisch, keine fremden Audiodateien)
// Musik: generative Stücke je Gebiet (Takt-/Phrasen-Planer mit Vorlauf), die nie identisch wiederholen:
// Motive werden je Phrase variiert (A A' B A''), Akkordfolgen rotieren, seltene «Unbehagen»-Momente
// (verstimmte Glocke, Flüstern, tiefer Einzelton, Herzschlag) mit Mindestabstand. Wechsel per Überblendung.
(function (G) {
  const S = { ctx: null, on: true, cur: null, want: null, tracks: [], active: 0, nodes: 0, dropped: 0, errors: 0,
    wd: { restarts: 0, last: null, silent: 0, resumes: 0, recreated: 0, log: [] } };
  let master, musicBus, duck, sfxBus, verb, verbIn, echo, echoFb, comp, analyser, abuf, timer = null, wdTimer = null, lastTick = 0, duckUntil = 0, gen = 0;
  // Stimmen-Obergrenzen (laufende Quellknoten): Musik wird ab MUSIC_CAP ausgedünnt, Geräusche ab SFX_CAP verworfen
  const MUSIC_CAP = 150, SFX_CAP = 230;
  S.on = G.Store.get('eldenghost.sound') !== '0';
  const MASTER = 0.72;

  // ---------- Grundgerüst ----------
  function impulse(c, sec, decay) {
    const n = Math.floor(c.sampleRate * sec), b = c.createBuffer(2, n, c.sampleRate);
    for (let ch = 0; ch < 2; ch++) { const d = b.getChannelData(ch); for (let i = 0; i < n; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / n, decay); }
    return b;
  }
  // Robustheit (Android/Chrome): Kontext kann jederzeit «suspended», «interrupted» (iOS) oder «closed» sein.
  // - jede Nutzereingabe (pointerup/touchend/click/keydown …) und visibilitychange/focus/pageshow ruft S.unlock()
  // - geschlossener Kontext wird komplett neu aufgebaut, laufendes Stück neu gestartet
  // - nach jedem Wiederanlaufen werden Planer und Pegel neu ausgerichtet (resync), ein Wachhund prüft auf Stille
  S.init = () => {
    if (S.ctx && S.ctx.state === 'closed') teardown();
    if (S.ctx) { S.unlock(); return; }
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return;
    try { S.ctx = new AC({ latencyHint: 'playback' }); } catch (e) { try { S.ctx = new AC(); } catch (e2) { return; } }
    const c = S.ctx, myGen = ++gen;
    instrument(c);
    master = c.createGain(); master.gain.value = S.on ? MASTER : 0;
    comp = c.createDynamicsCompressor(); comp.threshold.value = -16; comp.ratio.value = 3; comp.attack.value = 0.01; comp.release.value = 0.3;
    master.connect(comp); comp.connect(c.destination);
    analyser = c.createAnalyser(); analyser.fftSize = 512; abuf = new Float32Array(analyser.fftSize); comp.connect(analyser);   // Pegelmesser für den Wachhund
    duck = c.createGain(); duck.gain.value = 1; duck.connect(master);
    musicBus = c.createGain(); musicBus.gain.value = 0.62; musicBus.connect(duck);
    sfxBus = c.createGain(); sfxBus.gain.value = 0.55; sfxBus.connect(master);
    verb = c.createConvolver(); verb.buffer = impulse(c, 3.4, 2.6);
    verbIn = c.createGain(); verbIn.gain.value = 0.9; verbIn.connect(verb); verb.connect(duck);
    echo = c.createDelay(1.5); echo.delayTime.value = 0.42; echoFb = c.createGain(); echoFb.gain.value = 0.33;
    const echoLp = c.createBiquadFilter(); echoLp.type = 'lowpass'; echoLp.frequency.value = 2400;
    echo.connect(echoLp); echoLp.connect(echoFb); echoFb.connect(echo); echoLp.connect(verbIn); echoLp.connect(musicBus);
    c.onstatechange = () => { if (gen !== myGen) return; S.wd.log.push(c.state); if (S.wd.log.length > 20) S.wd.log.shift(); if (c.state === 'running') resync(); };
    timer = setInterval(tick, 60); lastTick = performance.now();
    wdTimer = setInterval(watchdog, 1500);
    listen();
    if (c.state !== 'running') S.unlock();
    if (S.want) { const w = S.want; S.cur = null; S.music(w); }
  };
  function teardown() {
    clearInterval(timer); clearInterval(wdTimer); timer = wdTimer = null;
    const c = S.ctx; S.ctx = null; gen++;
    if (c && c.state !== 'closed') try { c.close(); } catch (e) {}
    S.tracks = []; S.cur = null; S.active = 0; S.nodes = 0; nbuf = null; duckUntil = 0;
  }
  // Kontext fortsetzen (wirkt nur, wenn der Browser es gerade erlaubt – daher bei jeder Eingabe erneut)
  S.unlock = () => {
    if (!S.ctx) return S.init();
    const c = S.ctx;
    if (c.state === 'closed') { S.wd.recreated++; teardown(); return S.init(); }
    if (c.state !== 'running' && !document.hidden) {
      S.wd.resumes++;
      try { const p = c.resume(); if (p && p.then) p.then(() => { if (c.state === 'running') resync(); }, () => {}); } catch (e) {}
    }
  };
  let listening = false;
  function listen() {
    if (listening) return; listening = true;
    const opt = { capture: true, passive: true };
    // pointerup/touchend/click/keydown sind in Chrome «aktivierende» Eingaben (pointerdown bei Touch nicht!)
    for (const ev of ['pointerdown', 'pointerup', 'touchstart', 'touchend', 'mousedown', 'click', 'keydown']) window.addEventListener(ev, () => S.unlock(), opt);
    document.addEventListener('visibilitychange', () => {
      if (!S.ctx) return;
      if (document.hidden) { if (S.ctx.state === 'running') try { S.ctx.suspend(); } catch (e) {} }
      else S.unlock();
    });
    window.addEventListener('focus', () => S.unlock());
    window.addEventListener('pageshow', () => S.unlock());
  }
  // nach Pause: Planer nicht nachholen lassen (Zeitpunkte an currentTime ausrichten), Pegel wiederherstellen
  function resync() {
    const c = S.ctx; if (!c) return;
    const now = c.currentTime;
    for (const tr of S.tracks) if (tr.alive && tr.next < now + 0.02) tr.next = now + 0.06;
    if (S.on && master.gain.value < MASTER * 0.5) rampTo(master.gain, MASTER, 0.3);
    if (now > duckUntil && duck.gain.value < 0.9) rampTo(duck.gain, 1, 0.4);
    lastTick = 0; tick();
  }
  function rampTo(par, v, sec) { const now = S.ctx.currentTime; par.cancelScheduledValues(now); par.setValueAtTime(Math.max(0.0001, par.value), now); par.linearRampToValueAtTime(v, now + sec); }

  // ---- Knotenverwaltung: jede Stimme sammelt ihre Knoten; wenn alle Quellen geendet haben, wird alles getrennt ----
  let col = null;
  function instrument(c) {
    for (const k of ['createGain', 'createBiquadFilter', 'createStereoPanner', 'createOscillator', 'createBufferSource']) {
      const f = c[k]; if (!f) continue;
      c[k] = function () { const n = f.apply(c, arguments); if (col) col.push(n); return n; };
    }
  }
  const isSrc = n => typeof n.start === 'function' && typeof n.stop === 'function';
  function voice(fn, cap) {
    if (S.active >= cap) { S.dropped++; return false; }
    const prev = col, mine = []; col = mine;
    try { fn(); } catch (e) { S.errors++; } finally { col = prev; }
    const src = mine.filter(isSrc);
    if (!src.length) { mine.forEach(disc); return true; }
    let left = src.length; S.active += left; S.nodes += mine.length;
    const myGen = gen;
    const done = () => { if (myGen !== gen) return; S.active--; if (--left === 0) { S.nodes -= mine.length; setTimeout(() => mine.forEach(disc), 30); } };
    for (const n of src) n.onended = done;
    return true;
  }
  function disc(n) { try { n.disconnect(); } catch (e) {} }

  let nbuf = null;
  function noiseBuf() {
    if (nbuf) return nbuf;
    const c = S.ctx, b = c.createBuffer(1, c.sampleRate * 2, c.sampleRate), d = b.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
    return (nbuf = b);
  }
  const R = Math.random, pick = a => a[Math.floor(R() * a.length)];
  const mtof = m => 440 * Math.pow(2, (m - 69) / 12);
  // Ausgang mit Panorama, Hall- und Echo-Anteil
  function out(dest, t, pan = 0, wet = 0.3, ech = 0) {
    const c = S.ctx, g = c.createGain(); let node = g;
    if (c.createStereoPanner && pan) { const p = c.createStereoPanner(); p.pan.value = pan; g.connect(p); p.connect(dest); if (wet) { const w = c.createGain(); w.gain.value = wet; p.connect(w); w.connect(verbIn); } if (ech) { const e = c.createGain(); e.gain.value = ech; p.connect(e); e.connect(echo); } }
    else { g.connect(dest); if (wet) { const w = c.createGain(); w.gain.value = wet; g.connect(w); w.connect(verbIn); } if (ech) { const e = c.createGain(); e.gain.value = ech; g.connect(e); e.connect(echo); } }
    return node;
  }
  function env(g, t, a, peak, hold, rel) {
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(Math.max(0.0002, peak), t + a);
    if (hold > 0) g.gain.setValueAtTime(Math.max(0.0002, peak), t + a + hold);
    g.gain.exponentialRampToValueAtTime(0.0001, t + a + hold + rel);
    return t + a + hold + rel;
  }
  function osc(type, f, t, end, dest, detune = 0) {
    const o = S.ctx.createOscillator(); o.type = type; o.frequency.setValueAtTime(f, t); o.detune.value = detune;
    o.connect(dest); o.start(t); if (isFinite(end)) o.stop(end + 0.05); return o;
  }

  // ---------- Instrumente ----------
  const I = {
    // Glocke: unharmonische Teiltöne, lange Ausklingzeit
    bell(dest, t, f, v, o = {}) {
      const g = S.ctx.createGain(), end = env(g, t, 0.004, v, 0, o.dec || 3.2); g.connect(out(dest, t, o.pan || 0, o.wet ?? 0.55, o.echo ?? 0.25));
      osc('sine', f, t, end, g); const g2 = S.ctx.createGain(); g2.gain.value = 0.32; g2.connect(g); osc('sine', f * 2.756, t, t + 1.2, g2);
      const g3 = S.ctx.createGain(); g3.gain.value = 0.12; g3.connect(g); osc('sine', f * 5.404, t, t + 0.5, g3);
    },
    // Spieluhr/Celesta: klar, kurz
    box(dest, t, f, v, o = {}) {
      const g = S.ctx.createGain(), end = env(g, t, 0.003, v, 0, o.dec || 1.4); g.connect(out(dest, t, o.pan || 0, o.wet ?? 0.4, o.echo ?? 0.2));
      osc('sine', f, t, end, g); const g2 = S.ctx.createGain(); g2.gain.value = 0.18; g2.connect(g); osc('triangle', f * 2, t, t + 0.5, g2);
    },
    // Zupfklang (Harfe/Laute): Dreieck mit sich schliessendem Filter
    pluck(dest, t, f, v, o = {}) {
      const c = S.ctx, g = c.createGain(), lp = c.createBiquadFilter(); lp.type = 'lowpass';
      lp.frequency.setValueAtTime(o.bright || 2600, t); lp.frequency.exponentialRampToValueAtTime(260, t + (o.dec || 0.5));
      const end = env(g, t, 0.004, v, 0, o.dec || 0.6); lp.connect(g); g.connect(out(dest, t, o.pan || 0, o.wet ?? 0.25, o.echo ?? 0));
      osc('triangle', f, t, end, lp); osc('sawtooth', f, t, end, lp, 6);
    },
    // Fläche: verstimmte Oszillatoren, weich gefiltert, langsame Hüllkurve (überlappt -> keine Nahtstellen)
    pad(dest, t, f, v, dur, o = {}) {
      const c = S.ctx, g = c.createGain(), lp = c.createBiquadFilter(); lp.type = 'lowpass'; lp.Q.value = 0.6;
      const cut = o.cut || 900; lp.frequency.setValueAtTime(cut * 0.6, t); lp.frequency.linearRampToValueAtTime(cut, t + dur * 0.5); lp.frequency.linearRampToValueAtTime(cut * 0.7, t + dur + 1.5);
      const a = o.att || 1.6, end = env(g, t, a, v, Math.max(0, dur - a), o.rel || 2.4);
      lp.connect(g); g.connect(out(dest, t, o.pan || 0, o.wet ?? 0.5, 0));
      osc(o.wave || 'sawtooth', f, t, end, lp, -7); osc(o.wave || 'sawtooth', f, t, end, lp, 7); osc('sine', f / 2, t, end, lp);
    },
    // Chor «aah»: Sägezahn durch zwei Formantfilter
    choir(dest, t, f, v, dur, o = {}) {
      const c = S.ctx, g = c.createGain(), end = env(g, t, o.att || 1.2, v, Math.max(0, dur - 1.2), o.rel || 2);
      g.connect(out(dest, t, o.pan || 0, 0.7, 0.1));
      for (const [ff, q, gg] of [[700, 6, 1], [1150, 8, 0.6], [2600, 10, 0.2]]) { const bp = c.createBiquadFilter(); bp.type = 'bandpass'; bp.frequency.value = ff; bp.Q.value = q; const bg = c.createGain(); bg.gain.value = gg; bp.connect(bg); bg.connect(g); osc('sawtooth', f, t, end, bp, -5); osc('sawtooth', f, t, end, bp, 6); }
    },
    // Orgel: reine Teiltöne
    organ(dest, t, f, v, dur, o = {}) {
      const c = S.ctx, g = c.createGain(), end = env(g, t, 0.6, v, Math.max(0, dur - 0.6), 1.8); g.connect(out(dest, t, o.pan || 0, 0.65, 0));
      [[1, 1], [2, 0.45], [3, 0.2], [4, 0.12]].forEach(([m, a]) => { const gg = c.createGain(); gg.gain.value = a; gg.connect(g); osc('sine', f * m, t, end, gg); });
    },
    bass(dest, t, f, v, dur, o = {}) {
      const c = S.ctx, g = c.createGain(), lp = c.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = o.cut || 420;
      const end = env(g, t, 0.02, v, Math.max(0, dur - 0.1), o.rel || 0.5); lp.connect(g); g.connect(out(dest, t, 0, 0.1, 0));
      osc('triangle', f, t, end, lp); osc('sine', f, t, end, lp);
    },
    // Geräusch-Bausteine
    noise(dest, t, v, dur, type, freq, o = {}) {
      const c = S.ctx, n = c.createBufferSource(); n.buffer = noiseBuf(); n.playbackRate.value = o.rate || 1;
      const f = c.createBiquadFilter(); f.type = type; f.frequency.setValueAtTime(freq, t); if (o.to) f.frequency.exponentialRampToValueAtTime(o.to, t + dur); f.Q.value = o.q || 0.8;
      const g = c.createGain(), end = env(g, t, o.att || 0.004, v, o.hold || 0, dur); n.connect(f); f.connect(g); g.connect(out(dest, t, o.pan || 0, o.wet || 0, 0));
      n.start(t, R() * 1.5); n.stop(end + 0.05);
    },
    kick(dest, t, v) { const c = S.ctx, o = c.createOscillator(), g = c.createGain(); o.frequency.setValueAtTime(110, t); o.frequency.exponentialRampToValueAtTime(42, t + 0.18); env(g, t, 0.003, v, 0, 0.26); o.connect(g); g.connect(dest); o.start(t); o.stop(t + 0.35); },
    // Flüstern: gefiltertes Rauschen mit wanderndem Formant, weit im Raum
    whisper(dest, t, v) {
      const c = S.ctx, n = c.createBufferSource(); n.buffer = noiseBuf(); const dur = 1.6 + R() * 1.6;
      const bp = c.createBiquadFilter(); bp.type = 'bandpass'; bp.Q.value = 9; bp.frequency.setValueAtTime(900 + R() * 600, t);
      for (let i = 1; i <= 5; i++) bp.frequency.linearRampToValueAtTime(700 + R() * 2200, t + dur * i / 5);
      const g = c.createGain(); env(g, t, dur * 0.4, v, 0, dur * 0.6); n.connect(bp); bp.connect(g); g.connect(out(dest, t, R() * 1.6 - 0.8, 0.9, 0.4));
      n.start(t, R()); n.stop(t + dur + 0.1);
    },
    // plötzlicher tiefer Ton, leicht absinkend
    sub(dest, t, f, v) { const c = S.ctx, o = c.createOscillator(), g = c.createGain(); o.frequency.setValueAtTime(f, t); o.frequency.linearRampToValueAtTime(f * 0.94, t + 3.5); env(g, t, 0.06, v, 0.4, 3.2); o.connect(g); g.connect(out(dest, t, 0, 0.4, 0)); o.start(t); o.stop(t + 4); },
  };

  // ---------- Stücke ----------
  // Modi als Halbtonschritte; Akkorde als Stufen (0-basiert) im Modus
  const MODE = { dorian: [0, 2, 3, 5, 7, 9, 10], aeolian: [0, 2, 3, 5, 7, 8, 10], phrygian: [0, 1, 3, 5, 7, 8, 10], locrian: [0, 1, 3, 5, 6, 8, 10], harm: [0, 2, 3, 5, 7, 8, 11], lydian: [0, 2, 4, 6, 7, 9, 11] };
  const deg = (tr, d, oct = 0) => { const m = tr.mode, n = m.length, o = Math.floor(d / n), k = ((d % n) + n) % n; return mtof(tr.root + m[k] + 12 * (o + oct)); };
  const TRACKS = {
    // Dorf: warm und gemütlich – d-dorisch, Spieluhr, weiche Fläche, Harfen-Bass; selten eine verstimmte Note
    ambient: { root: 62, mode: MODE.dorian, bpm: 74, vol: 1.25, prog: [[0, 3, 6, 0], [0, 5, 3, 4], [5, 3, 0, 6], [0, 3, 1, 4]], lead: 'box', dens: 0.42, padCut: 1100, bass: 'harp', bells: 0.12, unease: { every: [38, 70], kinds: ['detune', 'detune', 'whisper'] } },
    // Innenräume: leise, spärliche Spieluhr, Ofenknistern
    indoor: { root: 57, mode: MODE.aeolian, bpm: 60, vol: 0.42, prog: [[0, 5, 3, 0], [0, 3, 6, 2]], lead: 'box', dens: 0.24, padCut: 700, bass: 'soft', bells: 0.04, crackle: 1, unease: { every: [80, 140], kinds: ['sub'] } },
    // Nebelgras & Aussenbereiche: mystisch – e-äolisch/phrygisch, Glocken mit viel Hall, Flüstern
    nebel: { root: 64, mode: MODE.phrygian, bpm: 62, vol: 0.8, prog: [[0, 1, 0, 6], [0, 5, 6, 0], [3, 1, 0, 0]], lead: 'bell', dens: 0.26, padCut: 1400, bass: 'drone', bells: 0.3, air: 1, unease: { every: [22, 42], kinds: ['whisper', 'detune', 'whisper', 'sub'] } },
    // Tiefes Moor: dunkler – cis-lokrisch, Tritonus-Brummen, gläserne Glocken, Herzschlag, tiefe Einzeltöne
    moor: { root: 61, mode: MODE.locrian, bpm: 52, vol: 0.78, prog: [[0, 1, 0, 4], [0, 5, 1, 0], [0, 3, 4, 1]], lead: 'bell', dens: 0.2, padCut: 600, bass: 'drone', tritone: 1, bells: 0.18, air: 1, unease: { every: [16, 34], kinds: ['whisper', 'sub', 'heart', 'detune', 'whisper'] } },
    // Kampf: gespannter, gleicher Stil – a-phrygisch, pulsierender Bass, Zupf-Arpeggien, leise Trommel
    battle: { root: 57, mode: MODE.phrygian, bpm: 108, vol: 1.05, prog: [[0, 5, 6, 0], [0, 1, 6, 4], [5, 6, 0, 0], [0, 3, 1, 0]], lead: 'bell', dens: 0.34, padCut: 1200, bass: 'pulse', arp: 1, drums: 1, bells: 0, fastIn: 1, unease: { every: [30, 60], kinds: ['detune'] } },
    // Beschwörer: d-harmonisch-moll, etwas treibender
    trainer: { root: 62, mode: MODE.harm, bpm: 118, vol: 1.0, prog: [[0, 5, 3, 4], [0, 3, 4, 0], [5, 1, 4, 4]], lead: 'pluck', dens: 0.46, padCut: 1500, bass: 'pulse', arp: 2, drums: 2, bells: 0, fastIn: 1, unease: { every: [40, 80], kinds: ['detune'] } },
    // Nebelahn: feierlich statt aggressiv – h-moll, Orgel und Chor, Totenglocke, Pauke
    boss: { root: 59, mode: MODE.aeolian, bpm: 58, vol: 0.55, prog: [[0, 5, 3, 4], [0, 3, 5, 4], [5, 3, 0, 4]], lead: 'choir', dens: 0.2, padCut: 900, bass: 'organ', toll: 1, fastIn: 1, unease: { every: [26, 50], kinds: ['whisper', 'sub'] } },
  };

  function mkTrack(name) {
    const def = TRACKS[name], c = S.ctx, bus = c.createGain(), now = c.currentTime, fade = def.fastIn ? 0.5 : 2.8;
    bus.gain.setValueAtTime(0.0001, now); bus.gain.exponentialRampToValueAtTime(def.vol, now + fade); bus.connect(musicBus);
    const tr = { name, def, bus, born: now, root: def.root, mode: def.mode, spb: 60 / def.bpm / 2, next: now + 0.12, step: 0, alive: true, motif: null, phrase: 0,
      nextUnease: now + def.unease.every[0] * (0.5 + R() * 0.5), prevNote: 7, drone: null };
    if (def.bass === 'drone') startDrone(tr);
    if (def.air) startAir(tr);
    if (def.crackle) tr.crackle = true;
    return tr;
  }
  function startDrone(tr) {
    const c = S.ctx, g = c.createGain(), lp = c.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 260; g.gain.value = 0;
    g.gain.linearRampToValueAtTime(0.09, c.currentTime + 4); lp.connect(g); g.connect(tr.bus);
    // Dauerton ohne festes Ende (früher 1 h -> danach Stille); gestoppt und getrennt wird er in killTrack
    const f = mtof(tr.root - 24), os = [osc('sawtooth', f, c.currentTime, Infinity, lp, -4), osc('sine', f, c.currentTime, Infinity, lp),
      osc('triangle', f * (tr.def.tritone ? Math.pow(2, 6 / 12) : 1.5), c.currentTime, Infinity, lp, 5)];
    const lfo = c.createOscillator(), lg = c.createGain(); lfo.frequency.value = 0.05; lg.gain.value = 120; lfo.connect(lg); lg.connect(lp.frequency); lfo.start(); os.push(lfo);
    tr.drone = os; tr.droneAux = (tr.droneAux || []).concat([g, lp, lg]);
  }
  function startAir(tr) { // Wind/Nebelrauschen mit langsamer Bewegung
    const c = S.ctx, n = c.createBufferSource(); n.buffer = noiseBuf(); n.loop = true;
    const bp = c.createBiquadFilter(); bp.type = 'bandpass'; bp.frequency.value = 600; bp.Q.value = 0.8;
    const g = c.createGain(); g.gain.value = tr.name === 'moor' ? 0.022 : 0.016; n.connect(bp); bp.connect(g); g.connect(tr.bus); n.start();
    const lfo = c.createOscillator(), lg = c.createGain(); lfo.frequency.value = 0.043; lg.gain.value = 330; lfo.connect(lg); lg.connect(bp.frequency); lfo.start();
    tr.drone = (tr.drone || []).concat([n, lfo]); tr.droneAux = (tr.droneAux || []).concat([bp, g, lg]);
  }
  function killTrack(tr, sec) {
    if (!tr.alive) return; tr.alive = false;
    const c = S.ctx, now = c.currentTime;
    tr.bus.gain.cancelScheduledValues(now); tr.bus.gain.setValueAtTime(Math.max(0.0001, tr.bus.gain.value), now); tr.bus.gain.exponentialRampToValueAtTime(0.0001, now + sec);
    setTimeout(() => { (tr.drone || []).forEach(o => { try { o.stop(); } catch (e) {} disc(o); }); (tr.droneAux || []).forEach(disc); disc(tr.bus); S.tracks = S.tracks.filter(x => x !== tr); }, sec * 1000 + 4500);
  }

  // Motiv: 8 Achtel mit Pausen; Varianten verändern Ende, Lage und einzelne Töne
  function newMotif(tr) {
    const d = tr.def, notes = []; let p = pick([2, 4, 4, 7, 5]);
    for (let i = 0; i < 16; i++) {
      const strong = i % 4 === 0;
      if (R() < (strong ? d.dens * 1.5 : d.dens * 0.8)) { p += pick([-2, -1, -1, 0, 1, 1, 2, R() < 0.2 ? 3 : -3]); p = Math.max(0, Math.min(11, p)); notes.push({ i, p, len: pick([1, 2, 2, 3, 4]) }); }
    }
    if (!notes.length) notes.push({ i: 0, p: 4, len: 4 });
    return notes;
  }
  function vary(m, k) {
    return m.map((n, j) => {
      const q = Object.assign({}, n);
      if (k === 1 && j === m.length - 1) q.p = Math.max(0, q.p - pick([1, 2]));
      if (k === 2) q.p = Math.min(11, q.p + (j % 2 ? 2 : 0));
      if (k === 3 && R() < 0.3) q.p += pick([-1, 1]);
      return q;
    }).filter(() => k !== 3 || R() > 0.15);
  }

  function schedule(tr, t) {
    const d = tr.def, st = tr.step, bar = Math.floor(st / 8), beat = st % 8, spb = tr.spb;
    const progI = Math.floor(bar / 4) % d.prog.length, chord = d.prog[progI][bar % 4], barLen = spb * 8;
    // Phrasen: alle 2 Takte ein Motiv-Abschnitt, alle 8 Takte ein neues Motiv (A A' B A'')
    if (st % 16 === 0) {
      const ph = (st / 16) % 4;
      if (!tr.base || ph === 0) { tr.base = newMotif(tr); tr.alt = newMotif(tr); }
      tr.cur = ph === 0 ? tr.base : ph === 1 ? vary(tr.base, 1) : ph === 2 ? vary(tr.alt, 2) : vary(tr.base, 3);
      tr.rest = R() < (d.dens < 0.3 ? 0.35 : 0.15); // manche Phrasen bleiben still -> Luft
    }
    // Fläche & Bass zu Taktbeginn
    if (beat === 0) {
      const padV = d.lead === 'choir' ? 0.022 : 0.03;
      if (d.bass === 'organ') [0, 2, 4].forEach((k, j) => I.organ(tr.bus, t, deg(tr, chord + k, -1), 0.028, barLen * 1.05, { pan: (j - 1) * 0.3 }));
      else [0, 2, 4].forEach((k, j) => I.pad(tr.bus, t, deg(tr, chord + k, -1), padV, barLen * 1.1, { cut: d.padCut, pan: (j - 1) * 0.35, wave: tr.name === 'indoor' ? 'triangle' : 'sawtooth' }));
      if (d.bass === 'harp') { I.pluck(tr.bus, t, deg(tr, chord, -2), 0.12, { dec: 1.4, bright: 900 }); I.pluck(tr.bus, t + spb * 4, deg(tr, chord + 4, -2), 0.07, { dec: 1.1, bright: 800 }); }
      if (d.bass === 'soft') I.bass(tr.bus, t, deg(tr, chord, -2), 0.08, barLen * 0.9, { rel: 1.4, cut: 300 });
      if (d.bass === 'organ') I.bass(tr.bus, t, deg(tr, chord, -2), 0.1, barLen, { rel: 1.2, cut: 260 });
      if (d.toll && bar % 2 === 0) I.bell(tr.bus, t, deg(tr, 0, -2), 0.12, { dec: 5.5, wet: 0.8, echo: 0.1 });
      if (d.toll && bar % 4 === 3) { I.kick(tr.bus, t + spb * 6, 0.18); I.kick(tr.bus, t + spb * 7, 0.12); }
      if (d.bells && R() < d.bells) I.bell(tr.bus, t + spb * pick([2, 3, 5]), deg(tr, pick([7, 9, 11, 14]), 0), 0.03, { pan: R() * 1.4 - 0.7, dec: 4 });
      if (d.lead === 'choir' && bar % 2 === 0) I.choir(tr.bus, t, deg(tr, chord + pick([4, 7]), 0), 0.035, barLen * 1.8, { pan: R() * 0.6 - 0.3 });
    }
    if (d.bass === 'pulse') I.bass(tr.bus, t, deg(tr, chord, -2), beat % 2 ? 0.05 : 0.08, spb * 0.8, { rel: 0.12, cut: 520 });
    if (d.arp) {
      const pat = d.arp === 2 ? [0, 2, 4, 7, 4, 2, 4, 7] : [0, 4, 2, 7, 0, 4, 2, 9];
      I.pluck(tr.bus, t, deg(tr, chord + pat[beat], 0), 0.03, { dec: 0.3, pan: beat % 2 ? 0.3 : -0.3, wet: 0.2 });
      if (d.arp === 2 && R() < 0.5) I.pluck(tr.bus, t + spb / 2, deg(tr, chord + pat[(beat + 1) % 8], 0), 0.018, { dec: 0.2, pan: 0.4 });
    }
    if (d.drums) {
      if (beat === 0 || beat === 4 || (d.drums === 2 && beat % 2 === 0)) I.kick(tr.bus, t, beat === 0 ? 0.13 : 0.09);
      if (beat % 2 === 1) I.noise(tr.bus, t, 0.022, 0.05, 'highpass', 6000);
      if (beat === 7 && bar % 4 === 3) I.noise(tr.bus, t, 0.05, 0.25, 'bandpass', 1200, { to: 400, q: 1.2 });
    }
    // Melodie
    if (!tr.rest) for (const n of tr.cur || []) if (n.i === st % 16) {
      const f = deg(tr, n.p, d.lead === 'bell' ? 0 : 0), len = n.len * spb;
      if (d.lead === 'box') I.box(tr.bus, t, f * 2, 0.05, { dec: 1.2 + len, pan: R() * 0.5 - 0.25 });
      else if (d.lead === 'bell') I.bell(tr.bus, t, f * (tr.name === 'battle' ? 1 : 2), tr.name === 'battle' ? 0.04 : 0.045, { dec: 2 + len, pan: R() * 0.8 - 0.4 });
      else if (d.lead === 'pluck') I.pluck(tr.bus, t, f * 2, 0.05, { dec: 0.5, pan: 0.1, echo: 0.2 });
      else if (d.lead === 'choir') I.organ(tr.bus, t, f, 0.018, len, { pan: 0.2 });
    }
    // Ofenknistern (Innenräume)
    if (tr.crackle && R() < 0.35) I.noise(tr.bus, t + R() * spb, 0.02 + R() * 0.03, 0.02, 'highpass', 2500 + R() * 2000);
    // seltenes Unbehagen
    if (t > tr.nextUnease && beat === 0) {
      const k = pick(d.unease.kinds);
      if (k === 'detune') I.bell(tr.bus, t + spb * 3, deg(tr, pick([6, 8, 11]), 0) * 2 * Math.pow(2, (R() < 0.5 ? 0.45 : -0.55) / 12), 0.035, { dec: 4.5, pan: R() * 1.4 - 0.7, echo: 0.4 });
      else if (k === 'whisper') I.whisper(tr.bus, t + spb * 2, 0.05);
      else if (k === 'sub') I.sub(tr.bus, t + spb, mtof(tr.root - 30), 0.2);
      else if (k === 'heart') { I.kick(tr.bus, t, 0.14); I.kick(tr.bus, t + 0.28, 0.09); I.kick(tr.bus, t + 1.2, 0.12); I.kick(tr.bus, t + 1.48, 0.08); }
      tr.nextUnease = t + d.unease.every[0] + R() * (d.unease.every[1] - d.unease.every[0]);
    }
  }
  // Planer mit Vorlauf: Zeitbasis ist immer ctx.currentTime; nach Pausen wird nicht nachgeholt, sondern neu ausgerichtet.
  // Wird zusätzlich aus der Spielschleife angestossen (S.pump), falls der Intervall-Timer gedrosselt wird.
  function tick() {
    const c = S.ctx; if (!c || c.state !== 'running') return;
    lastTick = performance.now();
    const now = c.currentTime;
    for (const tr of S.tracks) {
      if (!tr.alive) continue;
      if (tr.next < now - 0.2) tr.next = now + 0.05; // nach Hintergrund-Pause nicht nachholen
      let guard = 0;
      while (tr.next < now + 0.4 && guard++ < 16) { if (S.on) voice(() => schedule(tr, tr.next), MUSIC_CAP); tr.next += tr.spb; tr.step++; }
    }
  }
  S.pump = () => { if (S.ctx && performance.now() - lastTick > 180) tick(); };
  // Wachhund: soll Musik laufen, hört man aber nichts (Planer steht, Bus/Master/Duck hängen bei 0, Pegel stumm),
  // wird das Stück neu gestartet bzw. der Pegel wiederhergestellt
  function watchdog() {
    const c = S.ctx; if (!c || document.hidden) return;
    if (c.state === 'closed') { S.wd.recreated++; teardown(); S.init(); return; }
    if (c.state !== 'running') { S.unlock(); return; }
    const now = c.currentTime, fix = r => { S.wd.last = r; S.wd.restarts++; };
    if (S.on && master.gain.value < MASTER * 0.3) { rampTo(master.gain, MASTER, 0.3); fix('master'); }
    if (now > duckUntil + 0.5 && duck.gain.value < 0.5) { rampTo(duck.gain, 1, 0.4); fix('duck'); }
    const def = TRACKS[S.want];
    if (!S.on || !def) { S.wd.silent = 0; return; }
    const tr = S.tracks.find(x => x.alive && x.name === S.want);
    let why = null;
    if (!tr) why = 'notrack';
    else if (tr.next < now - 1) why = 'stall';
    else if (now - tr.born > 5 && tr.bus.gain.value < def.vol * 0.25) why = 'gain';
    else {
      analyser.getFloatTimeDomainData(abuf); let e = 0; for (let i = 0; i < abuf.length; i++) e += abuf[i] * abuf[i];
      S.wd.rms = Math.sqrt(e / abuf.length);
      S.wd.silent = S.wd.rms < 1e-5 && now - tr.born > 6 ? S.wd.silent + 1 : 0;
      if (S.wd.silent >= 5) why = 'silence';
    }
    if (why) { fix(why); S.wd.silent = 0; S.cur = null; S.music(S.want); }
  }
  S.watchdog = watchdog;

  S.music = name => {
    S.want = name;
    if (!S.ctx || S.cur === name) return;
    const def = TRACKS[name], fast = (def && def.fastIn) || S.cur === 'battle' || S.cur === 'trainer' || S.cur === 'boss';
    S.tracks.forEach(tr => killTrack(tr, fast ? 0.7 : 2.8));
    S.cur = name;
    if (def) S.tracks.push(mkTrack(name));
  };
  S.tracksAvailable = () => Object.keys(TRACKS);
  S.debugNode = () => master;

  // ---------- Jingles (Musik wird kurz abgesenkt) ----------
  function duckFor(sec) {
    const c = S.ctx, now = c.currentTime; duck.gain.cancelScheduledValues(now); duck.gain.setValueAtTime(duck.gain.value, now);
    duck.gain.linearRampToValueAtTime(0.2, now + 0.15); duck.gain.setValueAtTime(0.2, now + sec); duck.gain.linearRampToValueAtTime(1, now + sec + 1.2);
    duckUntil = now + sec + 1.3;
  }
  const J = {
    // Fang: aufsteigende Glocken in Dur, schimmernder Abschluss
    catch(t) { [64, 67, 71, 76, 79].forEach((m, i) => I.bell(sfxBus, t + i * 0.11, mtof(m + 12), 0.07, { dec: 2.2, pan: (i - 2) * 0.2 })); I.pad(sfxBus, t + 0.5, mtof(52), 0.05, 1.4, { cut: 1600 }); I.pad(sfxBus, t + 0.5, mtof(59), 0.04, 1.4, { cut: 1600 }); [88, 91].forEach((m, i) => I.box(sfxBus, t + 0.9 + i * 0.12, mtof(m), 0.03)); return 2.6; },
    // Sieg: kleine Kadenz, Zupfer + Glockenakkord
    victory(t) { [[57, 60, 64], [53, 57, 60], [55, 59, 62], [57, 61, 64]].forEach((ch, i) => ch.forEach((m, j) => I.pluck(sfxBus, t + i * 0.34 + j * 0.03, mtof(m), 0.06, { dec: 0.9, pan: (j - 1) * 0.3, wet: 0.3 }))); [69, 73, 76, 81].forEach((m, i) => I.bell(sfxBus, t + 1.36 + i * 0.02, mtof(m), 0.05, { dec: 3 })); return 2.8; },
    // Level-up: kurzes, helles Aufwärtsmotiv
    levelup(t) { [72, 76, 79, 84, 79, 84, 88].forEach((m, i) => I.box(sfxBus, t + i * 0.085, mtof(m), 0.07, { dec: 0.8 })); I.bell(sfxBus, t + 0.6, mtof(96), 0.03, { dec: 2 }); return 1.3; },
    // Nebelahn besänftigt: feierlicher, auflösender Akkord
    // Kirche: Mondlicht-Heilung – Harfenarpeggio aufwärts, Glockenakkord, leiser Chor
    heal(t) { [62, 66, 69, 74, 78, 81].forEach((m, i) => I.pluck(sfxBus, t + i * 0.1, mtof(m), 0.05, { dec: 1.1, pan: (i - 2.5) * 0.15, wet: 0.5 })); [74, 78, 81, 86].forEach((m, i) => I.bell(sfxBus, t + 0.7 + i * 0.03, mtof(m), 0.04, { dec: 2.6 })); I.choir(sfxBus, t + 0.6, mtof(62), 0.03, 1.2); I.choir(sfxBus, t + 0.6, mtof(69), 0.025, 1.2); return 2.4; },
    bosswin(t) { [[47, 54, 59, 62], [43, 50, 55, 59], [45, 52, 57, 61], [47, 54, 59, 63]].forEach((ch, i) => ch.forEach(m => I.organ(sfxBus, t + i * 1.1, mtof(m), 0.03, 1.2))); I.bell(sfxBus, t + 4.4, mtof(59), 0.08, { dec: 6 }); return 5.5; },
  };
  S.jingle = name => { if (!S.ctx || !S.on || !J[name]) return; const t = S.ctx.currentTime + 0.05; let sec = 0; voice(() => { sec = J[name](t); }, SFX_CAP + 40); if (sec) duckFor(sec); };

  // ---------- Geräusche ----------
  let stepAlt = 0;
  // neue Typen teilen sich die passenden Klangfarben der alten (Feuer = Irrlicht-Knistern, Boden = Schlamm, Psycho = Nebelhall, Gift = zischender Schatten)
  const SFX_ALIAS = { hit_Feuer: 'hit_Irrlicht', hit_Boden: 'hit_Moor', hit_Psycho: 'hit_Nebel', hit_Gift: 'hit_Schatten' };
  S.sfx = (n, arg, vol = 1) => { if (!S.ctx || !S.on) return; if (S.ctx.state !== 'running') S.unlock(); voice(() => sfx(n, arg, vol), SFX_CAP); };
  function sfx(n, arg, vol) {
    const c = S.ctx;
    n = SFX_ALIAS[n] || n;
    const t = c.currentTime + 0.005, D = vol === 1 ? sfxBus : (() => { const g = c.createGain(); g.gain.value = vol; g.connect(sfxBus); return g; })();
    switch (n) {
      case 'hit_Wasser': I.noise(D, t, 0.28, 0.25, 'bandpass', 1400, { to: 500, q: 1.4 }); for (let i = 0; i < 4; i++) { const o = c.createOscillator(), g = c.createGain(), f0 = 500 + R() * 500, tt = t + 0.08 + i * 0.06; o.type = 'sine'; o.frequency.setValueAtTime(f0, tt); o.frequency.exponentialRampToValueAtTime(f0 * 1.8, tt + 0.05); env(g, tt, 0.004, 0.05, 0, 0.06); o.connect(g); g.connect(D); o.start(tt); o.stop(tt + 0.1); } I.bass(D, t, 110, 0.08, 0.02, { rel: 0.1 }); break;
      case 'hit_Elektro': for (let i = 0; i < 9; i++) { const tt = t + i * 0.022 + R() * 0.01; const o = c.createOscillator(), g = c.createGain(); o.type = 'square'; o.frequency.setValueAtTime(900 + R() * 1800, tt); env(g, tt, 0.001, 0.025, 0, 0.02); o.connect(g); g.connect(D); o.start(tt); o.stop(tt + 0.05); } I.noise(D, t, 0.18, 0.25, 'highpass', 2500, { to: 6000 }); I.bass(D, t + 0.05, 80, 0.1, 0.03, { rel: 0.15 }); break;
      case 'hit_Neutral': I.bass(D, t, 120, 0.2, 0.02, { rel: 0.1, cut: 500 }); I.noise(D, t, 0.14, 0.1, 'lowpass', 1800, { to: 600 }); break; // schlichter, dumpfer Treffer
      case 'hit_Kampf': I.bass(D, t, 95, 0.26, 0.03, { rel: 0.16, cut: 400 }); I.noise(D, t, 0.4, 0.09, 'lowpass', 2400, { to: 500 }); I.noise(D, t + 0.01, 0.12, 0.05, 'bandpass', 3200, { q: 2 }); break;
      // Schmiede: Hammer auf Amboss (metallischer Klang mit kurzem Nachhall); Mühle: knarrendes Wasserrad, Plätschern
      case 'hammer': [1180, 1760, 2690, 3420].forEach((f, i) => I.bell(D, t, f * (0.99 + R() * 0.02), [0.05, 0.03, 0.02, 0.012][i], { dec: 0.5 + R() * 0.2 })); I.noise(D, t, 0.14, 0.04, 'highpass', 3000); I.bass(D, t, 140, 0.05, 0.01, { rel: 0.05 }); break;
      case 'creak': { const o = c.createOscillator(), bp = c.createBiquadFilter(), g = c.createGain(); o.type = 'sawtooth'; const f0 = 70 + R() * 30; o.frequency.setValueAtTime(f0, t); o.frequency.linearRampToValueAtTime(f0 * 1.5, t + 0.35); o.frequency.linearRampToValueAtTime(f0 * 1.1, t + 0.7);
        bp.type = 'bandpass'; bp.frequency.value = 700; bp.Q.value = 6; env(g, t, 0.12, 0.05, 0.3, 0.25); o.connect(bp); bp.connect(g); g.connect(D); o.start(t); o.stop(t + 1); break; }
      case 'splash': I.noise(D, t, 0.12, 0.18, 'bandpass', 1100 + R() * 600, { q: 1.2, to: 600 }); break;
      // Schritte: weich, je Untergrund (Gras, Holz, Stein/Boden, Moor)
      case 'step': {
        stepAlt ^= 1; const v = 0.05 + R() * 0.02, sh = stepAlt ? 1 : 0.88;
        if (arg === 'wood') { I.noise(D, t, v * 1.2, 0.06, 'bandpass', 900 * sh, { q: 2 }); I.bass(D, t, 150 * sh, 0.04, 0.02, { rel: 0.06 }); }
        else if (arg === 'floor') I.noise(D, t, v * 0.8, 0.045, 'bandpass', 1400 * sh, { q: 1.5 });
        else if (arg === 'mud') { I.noise(D, t, v, 0.12, 'lowpass', 500 * sh, { to: 220 }); }
        else I.noise(D, t, v * 0.9, 0.07, 'bandpass', 2200 * sh, { q: 0.7, to: 1300 });
        break;
      }
      case 'blip': I.box(D, t, 1318, 0.035, { dec: 0.12, wet: 0.1, echo: 0 }); break;           // bestätigen
      case 'tick': I.box(D, t, 1760, 0.018, { dec: 0.06, wet: 0.05, echo: 0 }); break;          // Auswahl bewegen
      case 'bump': I.bass(D, t, 70, 0.1, 0.03, { rel: 0.08, cut: 300 }); break;
      case 'open': I.box(D, t, 988, 0.03, { dec: 0.2 }); I.box(D, t + 0.05, 1318, 0.03, { dec: 0.3 }); break;
      case 'door': { // Knarren + dumpfer Schlag
        const o = c.createOscillator(), bp = c.createBiquadFilter(), g = c.createGain(); o.type = 'sawtooth'; o.frequency.setValueAtTime(95, t); o.frequency.linearRampToValueAtTime(140, t + 0.18); o.frequency.linearRampToValueAtTime(80, t + 0.32);
        bp.type = 'bandpass'; bp.frequency.value = 900; bp.Q.value = 5; env(g, t, 0.03, 0.05, 0.2, 0.12); o.connect(bp); bp.connect(g); g.connect(out(D, t, 0, 0.2)); o.start(t); o.stop(t + 0.4);
        I.noise(D, t + 0.34, 0.2, 0.2, 'lowpass', 300); I.bass(D, t + 0.34, 60, 0.12, 0.05, { rel: 0.2 }); break;
      }
      case 'pickup': [79, 83, 86, 91].forEach((m, i) => I.box(D, t + i * 0.06, mtof(m), 0.045, { dec: 0.5 })); I.noise(D, t, 0.02, 0.4, 'highpass', 7000, { att: 0.05 }); break;
      case 'hit': I.noise(D, t, 0.3, 0.16, 'lowpass', 1800); I.bass(D, t, 120, 0.12, 0.02, { rel: 0.12 }); break;
      case 'hit_Irrlicht': for (let i = 0; i < 6; i++) I.noise(D, t + i * 0.025 + R() * 0.02, 0.14, 0.03, 'highpass', 3000 + R() * 3000); I.box(D, t, 1760, 0.04, { dec: 0.3 }); I.noise(D, t, 0.16, 0.2, 'bandpass', 800, { to: 3000, q: 2 }); I.bass(D, t + 0.1, 110, 0.08, 0.02, { rel: 0.12 }); break;
      case 'hit_Moor': I.noise(D, t, 0.3, 0.22, 'lowpass', 900, { to: 180, q: 4 }); for (let i = 0; i < 3; i++) { const o = c.createOscillator(), g = c.createGain(), f0 = 300 + R() * 300; o.frequency.setValueAtTime(f0, t + 0.1 + i * 0.07); o.frequency.exponentialRampToValueAtTime(f0 * 2.2, t + 0.16 + i * 0.07); env(g, t + 0.1 + i * 0.07, 0.005, 0.04, 0, 0.07); o.connect(g); g.connect(D); o.start(t + 0.1 + i * 0.07); o.stop(t + 0.3 + i * 0.07); } break;
      case 'hit_Stein': I.bass(D, t, 70, 0.22, 0.05, { rel: 0.3, cut: 240 }); I.noise(D, t, 0.35, 0.28, 'lowpass', 1100, { to: 300 }); for (let i = 0; i < 5; i++) I.noise(D, t + 0.05 + R() * 0.25, 0.08, 0.03, 'bandpass', 1800 + R() * 1500, { q: 3 }); break;
      case 'hit_Schatten': { I.noise(D, t, 0.22, 0.35, 'bandpass', 300, { to: 1400, q: 3, att: 0.25 }); const o = c.createOscillator(), g = c.createGain(); o.type = 'sawtooth'; o.frequency.setValueAtTime(92, t); o.detune.value = -30; const lp = c.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 500; env(g, t + 0.2, 0.02, 0.08, 0.1, 0.4); o.connect(lp); lp.connect(g); g.connect(out(D, t, 0, 0.5)); o.start(t); o.stop(t + 0.8); I.bass(D, t + 0.22, 55, 0.12, 0.05, { rel: 0.3 }); break; }
      case 'hit_Nebel': I.noise(D, t, 0.2, 0.5, 'bandpass', 500, { to: 2400, q: 1.2, att: 0.15, wet: 0.5 }); I.bell(D, t + 0.25, 1046, 0.02, { dec: 1.5 }); I.bass(D, t + 0.25, 100, 0.07, 0.02, { rel: 0.15 }); break;
      case 'hit_Seele': [1046, 1318, 1568].forEach((f, i) => I.bell(D, t + i * 0.05, f, 0.035, { dec: 1.4 })); I.noise(D, t, 0.12, 0.18, 'lowpass', 1600); break;
      case 'crit': I.box(D, t, 2637, 0.05, { dec: 0.4 }); I.noise(D, t, 0.25, 0.1, 'highpass', 2500); I.bass(D, t, 90, 0.15, 0.03, { rel: 0.25 }); break;
      case 'super': [69, 76, 81].forEach((m, i) => I.pluck(D, t + i * 0.04, mtof(m), 0.05, { dec: 0.4 })); break;
      case 'weak': I.pluck(D, t, mtof(50), 0.05, { dec: 0.3, bright: 700 }); break;
      case 'status': [76, 72, 69].forEach((m, i) => I.box(D, t + i * 0.07, mtof(m), 0.04, { dec: 0.4 })); break;
      case 'encounter': I.noise(D, t, 0.22, 0.6, 'bandpass', 300, { to: 3000, q: 1.5, att: 0.5 }); I.bell(D, t + 0.55, mtof(57), 0.1, { dec: 2 }); I.bass(D, t + 0.55, 55, 0.2, 0.1, { rel: 0.6 }); break;
      case 'throw': { const o = c.createOscillator(), g = c.createGain(); o.type = 'triangle'; o.frequency.setValueAtTime(300, t); o.frequency.exponentialRampToValueAtTime(1100, t + 0.35); env(g, t, 0.02, 0.06, 0.1, 0.25); o.connect(g); g.connect(out(D, t, 0, 0.3)); o.start(t); o.stop(t + 0.5); I.noise(D, t, 0.06, 0.35, 'bandpass', 1200, { to: 4000 }); break; }
      case 'wobble': // Laterne wackelt: Klappern + Glas
        for (let i = 0; i < 3; i++) I.noise(D, t + i * 0.05, 0.12, 0.03, 'bandpass', 2400 + i * 300, { q: 4 }); I.box(D, t + 0.14, 2093, 0.025, { dec: 0.5 }); I.bass(D, t, 180, 0.04, 0.02, { rel: 0.08 }); break;
      case 'catch': S.jingle('catch'); break;
      case 'fail': [64, 60, 55].forEach((m, i) => I.pluck(D, t + i * 0.1, mtof(m), 0.05, { dec: 0.5, bright: 1200 })); I.noise(D, t, 0.06, 0.4, 'bandpass', 2000, { to: 400 }); break;
      case 'faint': { const o = c.createOscillator(), g = c.createGain(); o.type = 'triangle'; o.frequency.setValueAtTime(520, t); o.frequency.exponentialRampToValueAtTime(70, t + 0.9); env(g, t, 0.02, 0.07, 0.3, 0.6); o.connect(g); g.connect(out(D, t, 0, 0.5)); o.start(t); o.stop(t + 1.1); I.noise(D, t, 0.08, 0.9, 'lowpass', 1200, { to: 200, att: 0.1 }); break; }
      case 'levelup': S.jingle('levelup'); break;
      case 'victory': S.jingle('victory'); break;
      case 'bosswin': S.jingle('bosswin'); break;
      case 'heal': [76, 79, 83, 88, 83, 88].forEach((m, i) => I.bell(D, t + i * 0.12, mtof(m), 0.035, { dec: 1.4 })); break;
      case 'alert': I.box(D, t, 1568, 0.05, { dec: 0.25 }); I.box(D, t + 0.08, 2093, 0.05, { dec: 0.35 }); break;
      case 'bell': [262, 524, 786, 1310].forEach((f, i) => I.bell(D, t, f, 0.12 / (i + 1), { dec: 4.5, wet: 0.8 })); break;
      case 'evo': for (let i = 0; i < 16; i++) I.box(D, t + i * 0.22, 330 * Math.pow(1.059, i * 2), 0.035, { dec: 0.5 }); break;
      case 'save': I.box(D, t, 1175, 0.04, { dec: 0.3 }); I.box(D, t + 0.09, 1568, 0.04, { dec: 0.5 }); break;
    }
  };

  S.toggle = () => {
    S.on = !S.on;
    G.Store.set('eldenghost.sound', S.on ? '1' : '0');
    if (master) { const now = S.ctx.currentTime; master.gain.cancelScheduledValues(now); master.gain.setValueAtTime(master.gain.value, now); master.gain.linearRampToValueAtTime(S.on ? MASTER : 0, now + 0.15); }
    return S.on;
  };
  G.Snd = S;
})(window.G);
