'use strict';
// Eldenghost – Oberwelt: mehrere Karten (Dorf, Innenräume, Tiefes Moor), Nebelbänke, Licht, NPCs, Quest, Trainer
(function (G) {
  const T = 16, VW = G.VW, VH = G.VH;
  function hash(x, y, s = 0) {
    let h = (x * 374761393 + y * 668265263 + s * 982451653) | 0;
    h = Math.imul(h ^ (h >>> 13), 1274126177); h ^= h >>> 16;
    return (h >>> 0) / 4294967296;
  }
  const SOLID = { outdoor: new Set('T~fgShDrwxkuBAHY'.split(''))   // v15: H Höhlenwand, Y Tropfstein/Kristall
   // Laternen (L, e) sind begehbar
  , interior: new Set('WnotbkcauyzjlFAKQZMPXVG'.split(''))   // v15: X Kratzbaum, V Topfpflanze, G Sofa
 };
  const ZONE_OF = { '"': 'nebelgras', q: 'schilfrand', m: 'torfstich', c: 'kapelle', j: 'hoehle' };
  const ZONE_TINT = { nebelgras: '206,216,240', schilfrand: '198,224,212', torfstich: '222,212,204', kapelle: '218,206,240', hoehle: '150,140,130' };
  G.MAPS = {};
  G.flag = k => (G.state && G.state.flags[k]) || 0;
  const q1 = () => G.flag('q1');
  // Hauptgeschichte (Prolog «Das erloschene Licht»): S.flags.story
  // 0 aufgewacht · 1 Ilse erzählt · 2 Starter + Seelenfänger, Fang-Übung · 3 erster Fang · 4 Auftrag Leuchtturm
  // 5 Lampe dunkel vorgefunden · 6 Onno geweckt, Licht brennt · 7 Abschied von den Eltern · 8 Schiff im Hafen, Kapitänin getroffen
  const story = () => G.flag('story');
  const GOALS = {
    0: 'Geh zu Ilse auf den Dorfplatz – bei der Laterne östlich deines Hauses.',
    1: 'Wähle an den drei Laternensteinen hinter Ilse deinen ersten Geist.',
    2: 'Fange im Nebelgras südlich des Dorfes einen wilden Geist (Tasche → Seelenfänger).',
    3: 'Kehr zu Ilse auf den Dorfplatz zurück.',
    4: 'Geh zum Leuchtturm an der Nebelküste (Ostweg bei den Gräbern, dann durch die Nebelbank).',
    5: G.FEAT.cave ? 'Such den Leuchtturmwärter Onno – sein Platz hinter dem Leuchtturm ist nur durch die Klippenhöhle erreichbar (Eingang am Küstenpfad).' : 'Such den Leuchtturmwärter Onno – er kann nicht weit vom Turm sein.',
    6: 'Geh nach Hause und verabschiede dich von Mutter und Vater.',
    7: 'Geh zum Hafen an der Nebelküste – das Nebelhorn hat gerufen.',
    8: 'An Bord der «Nebelschwalbe» gehen – Fortsetzung folgt!'
  };
  const setStory = (n, quiet) => {
    if (!G.state || story() >= n) return;
    G.state.flags.story = n; G.save(true);
    if (!quiet) G.UI.toast('Neues Ziel: ' + GOALS[n], 3600, true);
  };
  G.Story = { get: story, set: setStory, goal: () => GOALS[Math.min(8, story())], GOALS };
  const setQ = n => { if (q1() < n) G.state.flags.q1 = n; };
  const give = async (id, n) => {
    G.state.items[id] = (G.state.items[id] || 0) + n; G.Snd.sfx('pickup');
    await G.UI.say(`Du erhältst ${n > 1 ? n + '× ' : ''}${G.ITEMS[id].name}!`);
  };
  G.giveItem = give;

  function newMap(id, w, h, kind, o = {}) {
    const m = Object.assign({ id, w, h, kind, tiles: [], npcs: [], signs: {}, warps: {}, doors: {}, houses: [], pickups: [],
      theme: 'dorf', dark: 0, fogA: 0.06, plight: 44, music: 'ambient', name: '' }, o);
    for (let y = 0; y < h; y++) m.tiles.push(new Array(w).fill(kind === 'interior' ? '_' : '.'));
    return (G.MAPS[id] = m);
  }
  const set = (m, x, y, c) => { if (x >= 0 && y >= 0 && x < m.w && y < m.h) m.tiles[y][x] = c; };
  const rect = (m, x0, y0, x1, y1, c) => { for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) set(m, x, y, c); };
  const at = (m, x, y) => (x < 0 || y < 0 || x >= m.w || y >= m.h) ? (m.kind === 'interior' ? 'W' : 'T') : m.tiles[y][x];

  // ================= DORF =================
  const D = newMap('dorf', 48, 32, 'outdoor', { name: 'Eldenghost' });   // v16: nach Osten erweitert (Anger mit Piets Haus, Teich, Obstgarten)
  {
    const W = D.w, H = D.h;
    for (let x = 0; x < W; x++) { set(D, x, 0, 'T'); set(D, x, H - 1, 'T'); }
    for (let y = 0; y < H; y++) { set(D, 0, y, 'T'); set(D, W - 1, y, 'T'); }
    for (let y = 1; y < H - 1; y++) for (let x = 1; x < W - 1; x++)
      if ((x === 1 || y === 1 || x === W - 2 || y === H - 2) && hash(x, y, 7) < 0.6) set(D, x, y, 'T');
    rect(D, 2, 6, 45, 6, ','); rect(D, 16, 6, 16, H - 2, ','); rect(D, 16, 12, 23, 12, ',');
    D.houses = [
      { x: 4, y: 3, roof: '#4e3c70', id: 'home' }, { x: 11, y: 3, roof: '#3a4c6c', id: 'hedda' },
      { x: 21, y: 3, roof: '#5e3c4e', id: 'oda' }, { x: 22, y: 9, roof: '#40505e', id: 'jorin' },
      // neu: Wassermühle am Dorfteich (Rad im Mühlgraben) und Schmiede am Ostweg (Gebäude im Comic-Pixelstil, siehe BUILD)
      { x: 2, y: 7, id: 'muehle', art: 'muehle' }, { x: 26, y: 12, id: 'schmiede', art: 'schmiede' },
      { x: 38, y: 3, roof: '#3e5a5a', id: 'piet' },   // v16: Fischer Piet am Anger
      ...(G.FEAT.cats ? [{ x: 10, y: 11, roof: '#6a4a3a', id: 'katzen' }] : [])   // v16: Kevin & Cassandra mit Filou und Mira
    ];
    for (const h of D.houses) { rect(D, h.x, h.y, h.x + 3, h.y + 2, 'h'); set(D, h.x + 1, h.y + 2, 'D'); }
    // Dorfteich: unregelmässige Uferlinie (Kollision bleibt kachelgenau)
    [[9, 7, 9], [10, 6, 10], [11, 5, 9], [12, 6, 8]].forEach(([y, a, b]) => rect(D, a, y, b, y, '~'));
    [[5, 10], [10, 9], [7, 12], [10, 12], [5, 12], [13, 8], [19, 10], [28, 9], [3, 8]].forEach(([x, y]) => set(D, x, y, '*'));
    rect(D, 11, 8, 13, 8, 'f'); rect(D, 27, 8, 30, 8, 'f');
    set(D, 6, 8, '~'); set(D, 6, 9, '~');                    // Mühlgraben unter dem Wasserrad
    set(D, 30, 14, 'A');                                     // Amboss vor der Schmiede
    rect(D, 18, 13, 18, 15, ','); rect(D, 18, 15, 27, 15, ','); rect(D, 3, 10, 4, 10, ',');
    [[9, 7], [20, 7], [27, 7], [15, 5], [15, 9], [17, 11], [15, 14], [17, 13], [15, 19], [17, 23], [15, 27], [3, 5]].forEach(([x, y]) => set(D, x, y, 'L'));
    set(D, 17, 15, 'S'); set(D, 17, 29, 'S');
    [[2, 10], [3, 12], [12, 10], [13, 13], [30, 4], [29, 10], [31, 13], [3, 14], [8, 14], [20, 14], [10, 14], [6, 13]].forEach(([x, y]) => set(D, x, y, 'T'));
    for (let x = 1; x < W - 1; x++) if (x < 15 || x > 17) set(D, x, 16, 'T');
    for (let x = 1; x < W - 1; x++) if ((x < 14 || x > 18) && hash(x, 17, 3) < 0.5) set(D, x, 17, 'T');
    rect(D, 3, 18, 13, 27, '"'); rect(D, 19, 18, 30, 23, '"'); rect(D, 19, 26, 29, 29, '"');
    [[21, 25], [24, 25], [27, 25]].forEach(([x, y]) => set(D, x, y, 'g'));
    [[5, 29], [11, 29], [31, 25], [18, 29], [2, 22]].forEach(([x, y]) => set(D, x, y, 'r'));
    [[8, 22], [10, 25], [5, 19], [24, 20], [28, 21], [22, 28], [14, 29], [12, 19]].forEach(([x, y]) => set(D, x, y, 'T'));
    [[14, 18], [18, 20], [18, 18], [2, 28], [31, 19], [20, 25], [30, 27]].forEach(([x, y]) => set(D, x, y, '*'));
    set(D, 16, 30, ',');
    // v15: Weg vom Katzenhaus zur Hauptstrasse; Bäume, die das Dach verdecken würden, weichen
    if (G.FEAT.cats) { set(D, 12, 10, '.'); set(D, 10, 14, '.'); rect(D, 11, 14, 11, 15, ','); rect(D, 11, 15, 15, 15, ',');
    for (const [x, y] of [[10, 11], [11, 11], [12, 11], [13, 11], [10, 12], [11, 12], [12, 12], [13, 12], [10, 13], [12, 13], [13, 13]]) set(D, x, y, 'h'); set(D, 11, 13, 'D'); }
    // v16: Anger im Osten – Weg vom Dorfplatz, zweiter Teich, Obstgarten, Blumen, Laternen; mehr Nebelgras im Südosten
    rect(D, 34, 7, 34, 15, ','); rect(D, 28, 15, 34, 15, ',');
    [[9, 36, 39], [10, 35, 40], [11, 36, 39]].forEach(([y, a, b]) => rect(D, a, y, b, y, '~'));
    [[42, 9], [44, 9], [42, 11], [44, 11], [42, 13], [44, 13], [46, 8], [37, 14], [46, 14]].forEach(([x, y]) => set(D, x, y, 'T'));
    [[35, 8], [41, 10], [43, 12], [36, 13], [39, 13], [45, 10], [43, 8], [33, 11]].forEach(([x, y]) => set(D, x, y, '*'));
    rect(D, 43, 5, 45, 5, 'f'); set(D, 35, 5, 'L'); set(D, 44, 7, 'L'); set(D, 35, 12, 'L'); set(D, 41, 8, 'r');
    rect(D, 33, 18, 44, 23, '"'); rect(D, 33, 26, 44, 29, '"');
    [[36, 20], [41, 19], [39, 22], [44, 21], [35, 27], [40, 28], [43, 26]].forEach(([x, y]) => set(D, x, y, 'T'));
    [[38, 18], [42, 23], [37, 29], [44, 28]].forEach(([x, y]) => set(D, x, y, '*')); set(D, 33, 25, 'r'); set(D, 38, 25, 'r');
    // Ostweg zur Nebelküste (an den Gräbern vorbei) mit Wegweiser
    rect(D, 17, 24, W - 1, 24, ','); set(D, 45, 23, 'S');
    D.doors = {
      '5,5': { to: 'home' }, '12,5': { to: 'hedda' }, ...(G.FEAT.cats ? { '11,13': { to: 'katzen' } } : {}), '22,5': { to: 'oda' }, '3,9': { to: 'muehle' }, '27,14': { to: 'schmiede' },
      '39,5': { to: 'piet', cond: () => false, locked: () => G.UI.say(G.flag('pietTalk') ? 'Piets Tür ist zu. Drinnen riecht es nach Teer und Räucherfisch.' : 'Die Tür ist zu. Ein Schild: «Bin draussen am Teich. – Piet»') },
      '23,11': { to: 'jorin', cond: () => q1() >= 7, locked: async () => {
        if (!G.flag('note')) {
          await G.UI.sayAll(['An der Tür hängt ein Zettel: «Bin im Moor. Zurück, wenn der Nebel geht. – Jorin»', 'Das Papier ist feucht. Seit Tagen hat ihn niemand abgenommen.']);
          G.state.flags.note = 1; await give('jorinsbrief', 1);
          await G.UI.say('Vielleicht weiss Ilse mehr. Sie steht bei der Laterne am Dorfplatz.');
        } else await G.UI.say('Die Tür ist verschlossen. Drinnen ist es dunkel und still.');
      } }
    };
    D.warps['16,30'] = { to: 'tiefesmoor', x: 16, y: 38, dir: 'up', cond: () => q1() >= 3,
      msg: ['Der Nebel steht hier wie eine Wand. Ohne Grund gehst du da nicht hinein.'] };
    D.warps['47,24'] = { to: 'kueste', x: 1, y: 11, dir: 'right', cond: () => story() >= 4,
      msg: () => [story() < 2 ? 'Ilse (ruft dir nach): Halt! Ohne einen Geist an deiner Seite gehst du nicht in den Nebel!' : 'Der Küstenpfad verschwindet im Nebel. Ilse wollte vorher noch mit dir sprechen.'] };
    D.signs = {
      '45,23': () => ['Wegweiser: «Nach Osten: Nebelküste – Leuchtturm und Hafen.»', 'Darunter, frisch eingeritzt: «Vorsicht, Küstennebel!»'],
      '17,15': () => ['Wegweiser: «Nach Süden: Nebelgras.»', 'Darunter, in krakeliger Schrift: «Im Nebel wohnen wilde Geister. Nimm Licht mit!»'],
      '17,29': () => {
        if (q1() === 2) { setQ(3); return ['Wegweiser: «Tiefes Moor». Jemand hat mit Kreide einen Pfeil darunter gemalt – und ein kleines «J».', 'Der Nebel am Wegende weicht ein wenig zurück, als wüsste er, dass du einen Grund hast.']; }
        if (q1() < 2) return ['Wegweiser: «Tiefes Moor – nicht bei Nebel betreten.»', 'Der Nebel dahinter ist so dicht, dass du kaum die Hand vor Augen siehst.'];
        return ['Wegweiser: «Tiefes Moor». Das kleine «J» aus Kreide ist noch da.'];
      }
    };
  }

  // ================= INNENRÄUME =================
  function room(id, rows, o) {
    const m = newMap(id, 10, 8, 'interior', Object.assign({ theme: 'room', dark: -0.06, fogA: 0, plight: 40, music: 'indoor' }, o));
    rows.forEach((r, y) => r.split('').forEach((c, x) => set(m, x, y, c)));
    m.warps['4,7'] = { to: o.outMap || 'dorf', x: o.outX, y: o.outY, dir: 'down', exit: true };
    return m;
  }
  room('home', ['WWnWWWWnWW', 'Wko___abbW', 'W________W', 'W__tt____W', 'W________W', 'W________W', 'W________W', 'WWWWxWWWWW'], { outX: 5, outY: 6, name: 'Dein Haus' });
  room('hedda', ['WkkWnWWkkW', 'Wkk_u__o_W', 'W________W', 'W__tt____W', 'W________W', 'Wc______cW', 'W________W', 'WWWWxWWWWW'], { outX: 12, outY: 6, name: 'Heddas Stube' });
  room('oda', ['WWnWWWWnWW', 'Wb____yzzW', 'W________W', 'W___t____W', 'W________W', 'W________W', 'Wc_______W', 'WWWWxWWWWW'], { outX: 22, outY: 6, name: 'Bei Oda und Fenn' });
  room('jorin', ['WWnWWlWnWW', 'Wjj____b_W', 'W________W', 'W__t_____W', 'W________W', 'Wz_______W', 'W________W', 'WWWWxWWWWW'], { outX: 23, outY: 12, name: 'Jorins Haus' });
  room('huette', ['WWWnWWWWWW', 'Wb__o__kkW', 'W________W', 'W_tt_____W', 'W________W', 'W______c_W', 'W________W', 'WWWWxWWWWW'], { outX: 11, outY: 25, name: 'Jorins Torfhütte', music: 'none' });
  G.MAPS.huette.warps['4,7'].to = 'tiefesmoor';
  // v15: gemütliches Haus von Kevin und Cassandra (Teppich R, Kratzbaum X, Pflanzen V, Sofa G)
  room('katzen', ['WWnWWWWnWW', 'WbbV_okkXW', 'W________W', 'W__RRRR__W', 'Wt_RRRR_GW', 'Wc_RRRR_GW', 'WV______cW', 'WWWWxWWWWW'], { outX: 11, outY: 14, name: 'Bei Kevin und Cassandra' });
  room('leuchtturm', ['WWWnWWnWWW', 'Wkj____k_W', 'W___ZZ___W', 'W________W', 'Wc______cW', 'W________W', 'W________W', 'WWWWxWWWWW'], { outX: 22, outY: 7, name: 'Leuchtturm – Lampenraum', plight: 36 });
  G.MAPS.leuchtturm.warps['4,7'].to = 'kueste';
  room('schmiede', ['WWWnWWWWnW', 'WFF__A_kkW', 'W________W', 'W________W', 'Wt_______W', 'W______K_W', 'W________W', 'WWWWxWWWWW'], { outX: 27, outY: 15, name: 'Branns Schmiede', plight: 36 });
  room('muehle', ['WWnWWWWnWW', 'WQQ___KKkW', 'W________W', 'W___t____W', 'W________W', 'WK_______W', 'W______K_W', 'WWWWxWWWWW'], { outX: 3, outY: 10, name: 'Die Mühle' });

  // ================= TIEFES MOOR =================
  const M = newMap('tiefesmoor', 34, 40, 'outdoor', { theme: 'moor', dark: 0.03, fogA: 0.12, plight: 38, music: 'moor', name: 'Tiefes Moor' });
  {
    const W = M.w, H = M.h;
    for (let x = 0; x < W; x++) { set(M, x, 0, 'T'); set(M, x, H - 1, 'T'); }
    for (let y = 0; y < H; y++) { set(M, 0, y, 'T'); set(M, W - 1, y, 'T'); }
    for (let y = 1; y < H - 1; y++) for (let x = 1; x < W - 1; x++)
      if ((x === 1 || x === W - 2) && hash(x, y, 11) < 0.5) set(M, x, y, hash(x, y, 12) < 0.5 ? 'x' : 'T');
    rect(M, 1, 1, 32, 8, 'w');                         // Nebelsee
    // natürliche Buchten und Landzungen am Seeufer
    [[1, 1, 4], [1, 27, 32], [2, 1, 2], [2, 30, 32], [3, 1, 1], [6, 31, 32], [7, 1, 2], [7, 30, 32], [8, 1, 4], [8, 28, 32], [8, 9, 10], [8, 22, 23]]
      .forEach(([y, a, b]) => rect(M, a, y, b, y, '.'));
    rect(M, 12, 1, 20, 4, '.');                        // Ahnenhügel
    [[12, 1], [14, 1], [18, 1], [20, 1], [12, 3], [20, 3], [19, 4]].forEach(([x, y]) => set(M, x, y, 'g'));
    [[13, 5], [14, 5], [18, 5], [21, 2], [21, 3], [11, 3]].forEach(([x, y]) => set(M, x, y, '.')); // Hügel-Ufer ausgefranst
    rect(M, 16, 5, 16, 12, 'b');
    rect(M, 1, 12, 32, 12, 'w'); set(M, 16, 12, 'b');   // Wassergraben vor Kaspar
    rect(M, 2, 11, 6, 11, 'w'); rect(M, 22, 11, 27, 11, 'w'); rect(M, 4, 10, 5, 10, 'w'); rect(M, 24, 10, 25, 10, 'w');
    set(M, 15, 11, 'e'); set(M, 17, 4, 'e');
    // Drei Weiden: Engstelle mit dichtem Nebel
    rect(M, 15, 13, 15, 16, 'x'); rect(M, 17, 13, 17, 16, 'x'); set(M, 13, 14, 'x');
    rect(M, 16, 13, 16, 16, 'm');
    // Versunkene Kapelle
    rect(M, 2, 13, 10, 19, 'u'); rect(M, 3, 14, 9, 18, 'c'); set(M, 6, 19, 'c');
    set(M, 3, 14, 'w'); set(M, 4, 14, 'w'); set(M, 3, 15, 'w'); set(M, 6, 14, 'B');
    // Torfstich rechts
    rect(M, 20, 13, 31, 19, 'm'); set(M, 24, 15, 'k'); set(M, 28, 17, 'k'); set(M, 22, 17, 'w'); set(M, 23, 17, 'w'); set(M, 30, 14, '.');
    // Steg nach Süden, Hütte
    rect(M, 16, 17, 16, 38, 'b'); rect(M, 8, 26, 27, 26, 'b');
    M.houses = [{ x: 10, y: 22, roof: '#4a3a2a', id: 'huette', hut: true }];
    rect(M, 10, 22, 13, 24, 'h'); set(M, 11, 24, 'D'); set(M, 11, 25, 'b');
    rect(M, 2, 21, 7, 27, 'm'); set(M, 25, 23, 'k'); set(M, 26, 24, 'k'); set(M, 17, 25, 'e');
    [[20, 21], [9, 20], [27, 20], [12, 28]].forEach(([x, y]) => set(M, x, y, 'x'));
    // Schilfrand
    rect(M, 2, 28, 12, 33, 'q'); rect(M, 20, 28, 31, 33, 'q'); set(M, 15, 33, 'e');
    [[18, 21], [3, 34], [29, 27]].forEach(([x, y]) => set(M, x, y, '*'));
    // Eingang: Wasserband mit Steg
    rect(M, 1, 35, 32, 38, 'w'); rect(M, 16, 34, 16, 39, 'b'); set(M, 17, 36, '.');
    rect(M, 2, 35, 5, 35, '.'); rect(M, 25, 35, 29, 35, '.'); rect(M, 9, 35, 10, 35, '.'); rect(M, 1, 38, 3, 38, '.'); rect(M, 29, 38, 32, 38, '.');
    M.warps['16,39'] = { to: 'dorf', x: 16, y: 29, dir: 'up' };
    M.doors = { '11,24': { to: 'huette' } };
    M.pickups = [
      ...[[4, 29], [9, 31], [12, 33], [22, 29], [29, 32]].map(([x, y], i) => ({ x, y, flag: 'mint' + i, item: 'moorminze', n: 1, kind: 'mint' })),
      { x: 5, y: 24, flag: 'p_wach1', item: 'wacholder', n: 1 }, { x: 27, y: 30, flag: 'p_wach2', item: 'wacholder', n: 1 },
      { x: 30, y: 14, flag: 'p_stark', item: 'starktee', n: 1 }, { x: 8, y: 15, flag: 'p_kerze', item: 'nachtkerze', n: 1 },
      { x: 3, y: 18, flag: 'p_mond', item: 'mondlaterne', n: 1 }, { x: 25, y: 18, flag: 'p_tee', item: 'kraeutertee', n: 1 }
    ];
  }
  // ================= NEBELKÜSTE: Leuchtturm & Hafen =================
  const K = newMap('kueste', 30, 26, 'outdoor', { name: 'Nebelküste', fogA: 0.1, plight: 46, music: 'coast' });
  {
    for (let x = 0; x < 26; x++) set(K, x, 0, 'T');
    for (let y = 0; y < K.h; y++) set(K, 0, y, 'T');
    rect(K, 0, 21, 9, 25, 'T');
    rect(K, 26, 0, 29, 25, '~'); rect(K, 20, 9, 25, 25, '~'); rect(K, 10, 17, 19, 25, '~');     // Meer im Osten und Süden
    [[25, 1], [25, 8], [24, 8], [19, 9], [19, 10], [10, 16], [18, 16], [19, 16]].forEach(([x, y]) => set(K, x, y, '~'));
    // Nebelbank: der kurze Weg vom Dorf zur Küste führt mitten hindurch
    rect(K, 4, 1, 8, 20, '"');
    [[5, 4], [7, 8], [4, 15], [8, 18], [6, 14]].forEach(([x, y]) => set(K, x, y, 'T'));
    [[1, 1], [2, 1], [3, 1], [1, 2], [1, 19], [1, 20], [2, 20], [9, 1], [10, 1], [11, 1], [9, 20], [2, 5], [2, 16], [12, 13], [10, 7]].forEach(([x, y]) => set(K, x, y, 'T'));
    rect(K, 0, 11, 3, 11, ','); rect(K, 9, 11, 15, 11, ','); rect(K, 15, 7, 15, 15, ','); rect(K, 16, 7, 22, 7, ','); rect(K, 11, 15, 19, 15, ',');
    rect(K, 15, 16, 15, 20, 'b');                                                               // Hafensteg
    K.houses = [{ x: 21, y: 4, id: 'leuchtturm', oy: 64, get art() { return story() >= 6 ? 'leuchtturm_lit' : 'leuchtturm'; } }];
    rect(K, 21, 4, 24, 6, 'h'); rect(K, 21, 1, 23, 3, 'h'); set(K, 22, 6, 'D');                // Turm ragt 4 Kacheln hoch
    set(K, 18, 3, 'T');                                                                         // Onnos Lieblingsbaum
    [[24, 2], [25, 3], [20, 1], [25, 6], [19, 8], [11, 9], [13, 3]].forEach(([x, y]) => set(K, x, y, 'r'));
    [[12, 5], [17, 9], [13, 12], [10, 4], [3, 8]].forEach(([x, y]) => set(K, x, y, '*'));
    [[14, 14], [18, 14], [16, 10]].forEach(([x, y]) => set(K, x, y, 'L'));
    set(K, 14, 10, 'S');
    K.signs = { '14,10': () => ['Wegweiser: «Norden: Leuchtturm. Süden: Hafen. Westen: Eldenghost.»'] };
    K.warps['0,11'] = { to: 'dorf', x: 46, y: 24, dir: 'left' };
    K.doors = { '22,6': { to: 'leuchtturm' } };
    K.pickups = [{ x: 11, y: 3, flag: 'p_klat', item: 'laterne', n: 2 }, { x: 2, y: 9, flag: 'p_ktee', item: 'kraeutertee', n: 1 }];
  }

  set(M, 19, 16, 'e');   // v15: Moorlaterne am Torfstich (seltener Geist «Funkenküken» erscheint nur in ihrem Licht)
  // ================= v15: KLIPPENHÖHLE (Weg zu Onnos Baum hinter dem Leuchtturm) =================
  // Drei Kammern: Eingang (SW), grosse Geröllhalle (Mitte, Beschwörer), Lichtader-Kammer (NO, Team Quantum), Ausgang zu Onnos Baum.
  // Onnos Lieblingsplatz ist jetzt von Felsen umschlossen – nur durch die Höhle erreichbar.
  if (G.FEAT.cave) {
  [[15, 1], [15, 2], [15, 3], [15, 4], [15, 5], [16, 5], [17, 5], [18, 5], [19, 5], [20, 5], [20, 2], [20, 3], [20, 4]].forEach(([x, y]) => set(K, x, y, 'r'));
  rect(K, 16, 1, 19, 4, '.'); set(K, 18, 3, 'T'); set(K, 16, 1, 'O');                  // Hain hinter den Felsen, Höhlenloch
  set(K, 13, 6, 'O'); set(K, 12, 6, 'r'); set(K, 14, 6, 'r');                          // Höhleneingang am Küstenpfad
  K.warps['13,6'] = { to: 'hoehle', x: 6, y: 15, dir: 'up' };
  K.warps['16,1'] = { to: 'hoehle', x: 19, y: 2, dir: 'down' };
  }
  const HC = newMap('hoehle', 28, 18, 'outdoor', { theme: 'cave', dark: 0.14, fogA: 0, plight: 52, music: 'cave', name: 'Klippenhöhle' });
  [
    'HHHHHHHHHHHHHHHHHHHHHHHHHHHH',
    'HHHHHHHHHHHHHH.....O.....HHH',
    'HHHHHHHHHHHHH.jj.......Y..HH',
    'HHHHHHHHHHHHH..j..L...jj..HH',
    'HHHHHHHHHHHHHH.......Y....HH',
    'HHHHHHHHHHHHHHHHH..HHHHHHHHH',
    'HHHHHHHHHHHH.jj....jjHHHHHHH',
    'HHHHHHHHHHH..jjj.Y..jjjHHHHH',
    'HHHHHHHHHHH.jjj.......jjHHHH',
    'HHH......HH..j..L...Y..jHHHH',
    'HH..jj....H......jjj....HHHH',
    'HH.jjjj..........jjjj..HHHHH',
    'HH.jjjY....HH..Y...jj..HHHHH',
    'HH..jj..L..HHH.........HHHHH',
    'HHH..Y.....HHHH..jj...HHHHHH',
    'HHH.......HHHHHHH....HHHHHHH',
    'HHHH..O..HHHHHHHHHHHHHHHHHHH',
    'HHHHHHHHHHHHHHHHHHHHHHHHHHHH'
  ].forEach((r, y) => r.split('').forEach((c, x) => set(HC, x, y, c)));
  HC.warps['6,16'] = { to: 'kueste', x: 13, y: 7, dir: 'down' };
  HC.warps['19,1'] = { to: 'kueste', x: 17, y: 2, dir: 'down', cond: () => !!G.flag('quantum'),
    msg: ['Vor dem Ausgang wabert schwarzer Rauch. Dutzende Augen öffnen sich darin und folgen dir. Ein leises Zischen – hier kommst du nicht vorbei.'] };
  // Glimmende Funde auch im Dorf
  D.pickups = [{ x: 4, y: 26, flag: 'p_dtee', item: 'kraeutertee', n: 1 }, { x: 29, y: 18, flag: 'p_dlat', item: 'laterne', n: 2 }];

  // ================= HEILUNGSKIRCHEN (wiederverwendbare Vorlage) =================
  // addChurch(Karte, {x, y, id, name, healer}) setzt Gebäude (4×3 Kacheln, Tür bei x+1/y+2), Innenraum mit Mondaltar,
  // Bänken und Heilerin sowie Tür/Rückweg. Heilen: HP, Bewegungspunkte, Status; setzt den Wiedererwachens-Ort.
  const CHURCHES = {};
  function addChurch(m, o) {
    const h = { x: o.x, y: o.y, id: o.id, art: 'kirche', oy: 36, church: true };
    m.houses.push(h); rect(m, o.x, o.y, o.x + 3, o.y + 2, 'h'); set(m, o.x + 1, o.y + 2, 'D');
    if (o.path) o.path.forEach(([x0, y0, x1, y1]) => rect(m, x0, y0, x1, y1, ','));
    m.doors[(o.x + 1) + ',' + (o.y + 2)] = { to: o.id };
    const r = room(o.id, ['WWnWWWWnWW', 'Wc__MM__cW', 'W________W', 'W________W', 'WPP____PPW', 'WPP____PPW', 'W________W', 'WWWWxWWWWW'],
      { outMap: m.id, outX: o.x + 1, outY: o.y + 3, name: o.name, church: true, dark: -0.1, plight: 38, music: 'church' });
    const hl = o.healer;
    r.npcs = [{ id: hl.id, spr: hl.spr || hl.id, x: 4, y: 2, dir: 'down', healer: true, talk: () => talkHealer(o.id) }];
    CHURCHES[o.id] = { map: m.id, id: o.id, name: o.name, healer: hl, spawn: { map: o.id, x: 4, y: 3 } };
    return r;
  }
  G.CHURCHES = CHURCHES;
  addChurch(D, { x: 27, y: 3, id: 'kirche', name: 'Mondkirche von Eldenghost', healer: { id: 'alwine', name: 'Schwester Alwine' } });
  set(D, 31, 5, 'L');
  // v15: Hafenkapelle (Bruder Tamme) an der Nebelküste entfernt – einzige Heilungskirche ist die Mondkirche
  const churchSpawn = id => Object.assign({ church: id }, CHURCHES[id].spawn);
  async function talkHealer(id) {
    const S = G.state, ch = CHURCHES[id], nm = ch.healer.name, fk = 'met_' + ch.healer.id;
    if (!S.flags[fk]) {
      S.flags[fk] = 1;
      await G.UI.sayAll([`${nm}: Willkommen in der Mondkirche. Ich bin Alwine.`, `${nm}: Hier können sich Menschen und Geister ausruhen, die unterwegs sind.`]);
    }
    const yes = await G.UI.yesNo(`${nm}: Soll ich deine Geister im Mondlicht heilen?`);
    G.UI.hideText();
    if (!yes) return G.UI.say(`${nm}: Dann geh mit Licht. Die Tür dieser Kirche steht dir immer offen.`);
    await healAt(id);
    await G.UI.sayAll([`${nm}: So. Deine Geister sind wieder ganz bei Kräften.`, `${nm}: Wenn dich die Kräfte verlassen, bringt dich das Mondlicht hierher zurück.`]);
    G.UI.hideText();
  }
  async function healAt(id) {
    G.lock++;
    try {
      G.Snd.jingle('heal');
      await G.animate(1700, p => {
        G.World.healFx = p;
        if (Math.random() < 0.7) spark(P.px + 2 + Math.random() * 12, P.py + 14 - Math.random() * 6, (Math.random() - 0.5) * 8, -24 - Math.random() * 26, 0.9, 'moon');
      });
      G.World.healFx = null;
      healTeam(); G.state.respawn = churchSpawn(id); G.save(true);
    } finally { G.World.healFx = null; G.lock--; }
  }

  // ================= NPCs =================
  D.npcs = [
    { id: 'ilse', spr: 'ilse', x: 18, y: 7, dir: 'down', talk: talkIlse },
    { id: 'wido', spr: 'wido', x: 22, y: 25, dir: 'up', talk: talkWido },
    { id: 'fenn', spr: 'fenn', x: 13, y: 15, dir: 'right', trainer: 'fenn', sight: 0, show: () => q1() < 7 && story() >= 3 && !!G.state && G.state.team.length > 0 }, // erst nach der Fang-Übung, kein Überfall
    // drei Laternensteine mit den Starter-Geistern (Wahl direkt in der Welt)
    ...G.STARTERS.map((sp, i) => ({ id: 'altar' + i, altar: sp, x: 17 + 2 * i, y: 9, dir: 'down', talk: () => talkAltar(sp) })),
    // v16: Dorfleben – Leute gehen umher (wander: erlaubtes Rechteck), Begleitgeister (pet) laufen hinterher
    { id: 'greta', spr: 'greta', x: 5, y: 13, dir: 'down', wander: [2, 11, 9, 14], pet: { sp: 'moosigel', name: 'Pieks' }, talk: () => talkVillager('greta') },
    { id: 'lotte', spr: 'lotte', x: 37, y: 12, dir: 'down', wander: [33, 12, 41, 14], pet: { sp: 'funkmaus', name: 'Zisch' }, talk: () => talkVillager('lotte') },
    { id: 'piet', spr: 'piet', x: 38, y: 7, dir: 'down', wander: [35, 7, 41, 8], pet: { sp: 'gischtkrebs', name: 'Knorz' }, talk: () => talkVillager('piet') }
  ];
  // Wido bekommt einen ruhigen Begleiter: ein Laternchen schwebt neben ihm über den Gräbern
  D.npcs.find(n => n.id === 'wido').pet = { sp: 'laternchen', name: 'Flämmchen', at: [23, 25], hover: true };
  const VILLAGE_TALK = {
    greta: ['Greta: Das ist Pieks. Ich hab ihn als Kleinen im Nebelgras gefunden, halb unter einem Pilz versteckt.',
      'Greta: Moosigel mögen feuchtes Gras. Wenn du selbst einen willst: südlich vom Dorf, im Nebelgras.',
      'Greta: Pieks frisst mir die Schnecken aus dem Beet. Dafür darf er auf dem Ofen schlafen.'],
    lotte: ['Lotte: Das ist Zisch! Wenn man ihn streichelt, knistert es.',
      'Lotte: Funkmäuse wohnen im Küstengras. Papa sagt, sie mögen Gewitter.',
      'Lotte: Ich darf noch nicht allein in den Nebel. Aber Zisch passt auf mich auf.'],
    piet: ['Piet: Moin. Der Krebs heisst Knorz. Hat mich an der Küste in den Stiefel gezwickt und ist einfach geblieben.',
      'Piet: Gischtkrebse sitzen im Küstengras zwischen den Steinen. Pass auf deine Finger auf.',
      'Piet: Seit der Nebel da ist, beissen die Fische schlecht. Knorz stört das nicht.']
  };
  const PET_TALK = {
    moosigel: n => `${n} schnuppert an deiner Laterne und rollt sich halb zusammen.`,
    funkmaus: n => `${n} springt einmal im Kreis. Deine Haare knistern.`,
    gischtkrebs: n => `${n} hebt drohend eine Schere – und putzt sich dann damit das Auge.`,
    laternchen: n => `${n} flackert kurz heller, als würde es dich grüssen.`
  };
  async function talkVillager(id) {
    const n = D.npcs.find(o => o.id === id), L = VILLAGE_TALK[id], k = 'vt_' + id;
    G.state.flags[k] = ((G.state.flags[k] || 0) + 1); if (id === 'piet') G.state.flags.pietTalk = 1;
    n.wt = 4; await G.UI.say(L[(G.state.flags[k] - 1) % L.length]);
  }
  G.MAPS.home.npcs = [
    { id: 'mutter', spr: 'mutter', x: 2, y: 3, dir: 'right', talk: talkMutter },
    { id: 'vater', spr: 'vater', x: 5, y: 3, dir: 'left', talk: talkVater }
  ];
  const lamp = { p: null, onno: false };      // Lampen-Szene im Leuchtturm (p: 0..1 beim Anzünden)
  const lampLevel = () => lamp.p != null ? lamp.p : story() >= 6 ? 1 : 0;
  const arrive = { off: null, wenke: false }; // Ankunft der «Nebelschwalbe» (off: 1 = weit draussen, 0 = angelegt)
  const shipShown = () => arrive.off != null || story() >= 8;
  K.npcs = [
    { id: 'onnoS', spr: 'onnoSleep', x: 18, y: 4, dir: 'down', show: () => story() < 6, talk: talkOnnoSleep },
    { id: 'wenke', spr: 'wenke', x: 15, y: 18, dir: 'up', show: () => story() >= 8 || arrive.wenke, talk: talkWenke }
  ];
  // v16 Klippenhöhle: zwei Beschwörer, Team Quantum (Mandy, Hans und ihr Alptraum-Geist, der Nachtmahr)
  const qShow = () => !G.flag('quantum');
  G.MAPS.hoehle.npcs = [
    { id: 'ruedi', spr: 'ruedi', x: 14, y: 11, dir: 'left', trainer: 'ruedi', sight: 0 },
    { id: 'nele', spr: 'nele', x: 19, y: 9, dir: 'down', trainer: 'nele', sight: 0 },
    { id: 'mandy', spr: 'mandy', x: 17, y: 2, dir: 'down', show: qShow, talk: () => quantumTalk() },
    { id: 'hans', spr: 'hans', x: 21, y: 2, dir: 'down', show: qShow, talk: () => quantumTalk() },
    { id: 'mahr', mon: 'nachtmahr', x: 19, y: 2, dir: 'down', show: qShow, talk: () => quantumTalk() }
  ];
  G.MAPS.hoehle.signs['8,13'] = ['Eine Grubenlaterne, frisch gefüllt. Jemand kommt hier regelmässig vorbei.'];
  // ---------- v15: Kevin & Cassandra, Filou & Mira ----------
  G.MAPS.katzen.npcs = [
    { id: 'kevin', spr: 'kevin', x: 2, y: 2, dir: 'down', talk: () => talkCouple('kevin') },
    { id: 'cassandra', spr: 'cassandra', x: 6, y: 2, dir: 'down', talk: () => talkCouple('cassandra') }
  ];
  // stündliches Geschenk (echte Zeit, Zeitstempel im Spielstand)
  const GIFT_MS = 3600 * 1000;
  const GIFT_POOL = [['kraeutertee', 2, 30], ['laterne', 3, 26], ['starktee', 1, 16], ['wacholder', 2, 10], ['klarblick', 1, 7], ['nachtkerze', 1, 6], ['mondlaterne', 1, 5]];
  const giftReady = (now = Date.now()) => { const t = G.state.flags.kcGift || 0; return now - t >= GIFT_MS; };
  const giftLeft = (now = Date.now()) => Math.max(0, GIFT_MS - (now - (G.state.flags.kcGift || 0)));
  function rollGift(rnd = Math.random) { const tot = GIFT_POOL.reduce((a, g) => a + g[2], 0); let r = rnd() * tot; for (const g of GIFT_POOL) { r -= g[2]; if (r < 0) return [g[0], g[1]]; } return ['kraeutertee', 2]; }
  function takeGift(now = Date.now(), rnd) { if (!giftReady(now)) return null; G.state.flags.kcGift = now; return rollGift(rnd); }
  async function coupleIntro() {
    const S = G.state; S.flags.kc = 1;
    await G.UI.sayAll([
      'Cassandra: Oh, hallo! Komm rein, komm rein – pass nur auf, dass Filou nicht rausflitzt.',
      'Kevin: Wir haben gehört, du ziehst bald los. Ganz allein in den Nebel … Respekt.',
      'Cassandra: Das da ist Filou, der Schwarze mit dem Wuschelschwanz. Und die Getigerte ist Mira.',
      'Kevin: Filou tut so, als gehöre ihm das Haus. Wahrscheinlich hat er recht.',
      'Cassandra: Mira ist die Schlaue. Sie merkt immer als Erste, wenn jemand traurig ist, und legt sich dann einfach dazu.',
      'Kevin: Katzen sind wie gute Freunde: Sie kommen, wenn sie wollen – aber wenn es drauf ankommt, sind sie da.',
      'Cassandra: Und sie schnurren. Gegen Schnurren kommt kein Nebel an.',
      'Kevin: Hier, nimm das mit. Für unterwegs.'
    ]);
    await give('kraeutertee', 3); await give('laterne', 3); await give('starktee', 1);
    S.flags.kcGift = Date.now();
    await G.UI.sayAll(['Cassandra: Viel Glück da draussen! Komm uns besuchen, wann immer du magst – wir haben immer etwas für dich.',
      'Kevin: Und Filou und Mira freuen sich auch. Sie zeigen es nur nicht so.']);
    G.save(true);
  }
  async function talkCouple(who) {
    if (!G.flag('kc')) return coupleIntro();
    const g = takeGift();
    if (g) {
      await G.UI.say(who === 'kevin' ? 'Kevin: Da bist du ja wieder! Warte, wir haben dir was zurückgelegt.' : 'Cassandra: Schön, dich zu sehen! Hier, das ist für dich.');
      await give(g[0], g[1]); G.save(true);
      return G.UI.say(who === 'kevin' ? 'Kevin: Pass auf dich auf, ja?' : 'Cassandra: Filou hat es übrigens bewacht. Behauptet er zumindest.');
    }
    const L = who === 'kevin'
      ? ['Kevin: Mira hat heute Morgen einen Schmetterling gefangen. Und dann wieder freigelassen. Sie ist eben eine Dame.',
        'Kevin: Wenn du nicht weiterweisst: erst mal hinsetzen, Tee trinken. Funktioniert bei Filou auch.',
        'Kevin: Schau ruhig später wieder vorbei. Wir finden bestimmt noch etwas Nützliches für dich.']
      : ['Cassandra: Filou hat letzte Nacht auf meinem Kopf geschlafen. Ich hab mich nicht getraut, mich zu bewegen.',
        'Cassandra: Langhaarkatzen bürsten ist fast wie Meditation. Fast.',
        'Cassandra: Komm in einer Weile wieder – dann haben wir sicher wieder etwas für dich.'];
    G.state.flags.kcTalk = (G.state.flags.kcTalk || 0) + 1;
    return G.UI.say(L[G.state.flags.kcTalk % L.length]);
  }
  // Katzen: laufen zufällig herum, spielen mit dem Wollknäuel, rollen sich ein, miauen gelegentlich
  const CATS = [
    { id: 'filou', name: 'Filou', x: 4, y: 4, fur: '#1a1720', furL: '#3a3448', furD: '#0a080e', eye: '#d8e060', belly: '#2a2632' },
    { id: 'mira', name: 'Mira', x: 6, y: 5, fur: '#7a5634', furL: '#b08858', furD: '#2a1c12', eye: '#8ad060', belly: '#d8c0a0', tabby: true }
  ].map(c => Object.assign(c, { px: c.x * T, py: c.y * T, tx: c.x, ty: c.y, st: 'sit', t: 1 + Math.random() * 2, dir: 1, ph: 0 }));
  const catFree = (m, x, y) => x > 0 && y > 0 && x < m.w - 1 && y < m.h - 1 && !SOLID.interior.has(at(m, x, y)) && !(x === 4 && y === 7) && !npcAt(x, y) && !(P.x === x && P.y === y) && !CATS.some(c => c.tx === x && c.ty === y);
  function updateCats(m, dt) {
    for (const c of CATS) {
      c.t -= dt; c.ph += dt;
      if (c.st === 'walk') {
        const gx = c.tx * T, gy = c.ty * T, dx = gx - c.px, dy = gy - c.py, d = Math.hypot(dx, dy), sp = 22 * dt;
        if (d <= sp) { c.px = gx; c.py = gy; if (c.t <= 0 || Math.random() < 0.35) { c.st = 'sit'; c.t = 1.5 + Math.random() * 3; } else stepCat(m, c); }
        else { c.px += dx / d * sp; c.py += dy / d * sp; }
        continue;
      }
      if (c.t > 0) continue;
      const r = Math.random();
      if (r < 0.55) { c.st = 'walk'; c.t = 2 + Math.random() * 4; stepCat(m, c); }
      else if (r < 0.75) { c.st = 'play'; c.t = 2.5 + Math.random() * 2; }
      else if (r < 0.9) { c.st = 'sleep'; c.t = 6 + Math.random() * 8; }
      else { c.st = 'sit'; c.t = 2 + Math.random() * 3; }
      if (Math.random() < 0.18 && G.map === m) G.Snd.sfx('meow', c.id === 'mira' ? 1.2 : 1, 0.7);
    }
  }
  function stepCat(m, c) {
    const opts = [[1, 0], [-1, 0], [0, 1], [0, -1]].filter(([dx, dy]) => catFree(m, c.tx + dx, c.ty + dy));
    if (!opts.length) { c.st = 'sit'; c.t = 1; return; }
    const [dx, dy] = opts[Math.random() * opts.length | 0]; c.tx += dx; c.ty += dy; if (dx) c.dir = dx;
  }
  const CATSPR = {};
  function catSprite(c, pose, f) {   // 16×16 Pixelkatze (langhaarig: fransige Kontur, buschiger Schwanz)
    const key = c.id + pose + f; if (CATSPR[key]) return CATSPR[key];
    const cv = G.mk(16, 16), d = G.pen(cv.getContext('2d')), F = c.fur, L = c.furL, D2 = c.furD;
    const tail = (pts) => pts.forEach(([x, y, w]) => { d.r(x - 1, y - 1, w + 2, 3, D2); }), tail2 = pts => pts.forEach(([x, y, w]) => d.r(x, y, w, 2, F));
    if (pose === 'sleep') {   // eingerollt, Schwanz um den Körper
      d.e(8, 11, 6, 4, D2); d.e(8, 11, 5, 3, F); d.e(7, 10, 3, 1.5, L); d.e(12, 11, 2.5, 2.5, F); d.p(11, 9, D2); d.p(13, 9, D2);
      d.r(3, 13, 9, 2, D2); d.r(4, 13, 7, 1, F); d.r(12, 11, 1, 1, D2);
      if (c.tabby) { d.r(6, 9, 1, 3, D2); d.r(9, 9, 1, 3, D2); }
    } else {
      const sit = pose === 'sit' || pose === 'play', bob = pose === 'walk' && f ? 1 : 0;
      // Schwanz (buschig)
      if (sit) { tail([[2, 12, 5]]); tail2([[2, 12, 5]]); d.r(1, 10, 2, 3, D2); d.r(1, 10, 1, 2, F); }
      else { tail([[1, 5 + bob, 2], [2, 7, 2]]); d.r(0, 4 + bob, 3, 4, F); d.r(1, 6, 3, 3, F); d.p(0, 3 + bob, L); }
      // Körper
      if (sit) { d.e(7, 10, 4, 4.5, D2); d.e(7, 10, 3.2, 3.8, F); d.e(8, 11, 1.6, 2.4, c.belly); }
      else { d.e(7, 9 + bob, 5.5, 3.2, D2); d.e(7, 9 + bob, 4.6, 2.5, F); d.r(3, 8 + bob, 8, 1, L); }
      if (c.tabby) { const bx = sit ? 5 : 4; for (let i = 0; i < 3; i++) d.r(bx + i * 2, sit ? 8 : 7 + bob, 1, 3, D2); }
      // Beine
      if (!sit) { const a = f ? 1 : 0; d.r(3 + a, 11 + bob, 2, 3 - bob, D2); d.r(9 - a, 11 + bob, 2, 3 - bob, D2); d.r(4 - a, 12, 1, 2, F); d.r(10 + a, 12, 1, 2, F); }
      else { d.r(7, 13, 2, 2, D2); d.r(9, 13, 2, 2, D2); if (pose === 'play' && f) { d.r(11, 10, 2, 2, D2); d.r(12, 9, 2, 1, F); } }
      // Kopf
      const hx = sit ? 10 : 12, hy = sit ? 5 : 6 + bob;
      d.e(hx, hy, 3.4, 3, D2); d.e(hx, hy, 2.7, 2.4, F); d.r(hx - 3, hy - 4, 2, 2, D2); d.r(hx + 1, hy - 4, 2, 2, D2); d.p(hx - 2, hy - 3, L); d.p(hx + 2, hy - 3, L);
      d.p(hx - 1, hy, c.eye); d.p(hx + 1, hy, c.eye); d.p(hx, hy + 1, '#e8a0a0');
      d.p(hx - 3, hy + 1, L); d.p(hx + 3, hy + 1, L);   // Backenfell
      if (c.tabby) { d.p(hx, hy - 2, D2); d.p(hx - 1, hy - 2, D2); d.p(hx + 1, hy - 2, D2); }
    }
    return (CATSPR[key] = cv);
  }
  function catEnts(ctx, m, cx, cy, ents, t) {
    if (m.id !== 'katzen') return;
    for (const c of CATS) ents.push({ y: c.py - 2, draw: () => {
      const sx = Math.round(c.px - cx), sy = Math.round(c.py - cy), f = c.st === 'walk' ? (Math.floor(c.ph * 6) % 2) : c.st === 'play' ? (Math.floor(c.ph * 3) % 2) : 0;
      ctx.fillStyle = 'rgba(10,8,20,0.35)'; ctx.fillRect(sx + 3, sy + 13, 10, 2);
      ctx.save(); if (c.dir < 0) { ctx.translate(sx + 16, sy); ctx.scale(-1, 1); } else ctx.translate(sx, sy);
      ctx.drawImage(catSprite(c, c.st, f), 0, 0); ctx.restore();
      if (c.st === 'play') { const bx = sx + (c.dir > 0 ? 14 : 0) + Math.sin(c.ph * 3) * 3, by = sy + 12 - Math.abs(Math.sin(c.ph * 3)) * 3;   // Wollknäuel
        ctx.fillStyle = '#c84a5a'; ctx.fillRect(Math.round(bx), Math.round(by), 3, 3); ctx.fillStyle = '#e87a8a'; ctx.fillRect(Math.round(bx), Math.round(by), 1, 1); }
      if (c.st === 'sleep') { const z = (t * 0.6 + (c.id === 'mira' ? 0.5 : 0)) % 1; ctx.globalAlpha = 1 - z; ctx.fillStyle = '#e8e4f4'; ctx.font = '6px monospace'; ctx.fillText('z', sx + 12 + z * 3, sy + 6 - z * 6); ctx.globalAlpha = 1; }
    } });
  }
  const catAt = (x, y) => G.map.id === 'katzen' && CATS.find(c => (c.tx === x && c.ty === y) || (Math.round(c.px / T) === x && Math.round(c.py / T) === y));
  async function petCat(c) {
    G.Snd.sfx('meow', c.id === 'mira' ? 1.2 : 1);
    const L = c.id === 'filou' ? ['Filou schaut dich mit grossen gelben Augen an – und dreht sich dann gnädig auf den Rücken.', 'Filou schnurrt wie ein kleiner Motor.', 'Filou stupst deine Hand mit der Nase an. Mehr streicheln, bitte.']
      : ['Mira reibt ihren Kopf an deinem Bein und schnurrt leise.', 'Mira mustert dich kurz, dann blinzelt sie langsam. Das heisst: Ich mag dich.', 'Mira schnappt nach deinem Schnürsenkel. Sehr ernsthaft.'];
    c.st = 'sit'; c.t = 2.5; c.n = (c.n || 0) + 1;
    return G.UI.say(L[c.n % L.length]);
  }
  G.CATS = CATS;
  G.MAPS.leuchtturm.npcs = [{ id: 'onno', spr: 'onno', x: 3, y: 2, dir: 'right', show: () => story() >= 6 || lamp.onno, talk: talkOnno }];
  G.MAPS.hedda.npcs = [{ id: 'hedda', spr: 'hedda', x: 6, y: 3, dir: 'down', talk: talkHedda }];
  G.MAPS.oda.npcs = [{ id: 'oda', spr: 'oda', x: 6, y: 3, dir: 'down', talk: talkOda },
    { id: 'fenn2', spr: 'fenn', x: 2, y: 4, dir: 'right', show: () => q1() >= 7, talk: () => G.UI.sayAll(['Fenn: Ich hab Jorin seine Schnitzfigur zurückgebracht! Er hat gelacht. Richtig gelacht!', 'Fenn: Wenn ich gross bin, fange ich den ältesten Geist im Moor. Oder … ich besuche ihn einfach.']) }];
  G.MAPS.jorin.npcs = [{ id: 'jorin', spr: 'jorin', x: 5, y: 3, dir: 'down', talk: talkJorinHome }];
  G.MAPS.schmiede.npcs = [{ id: 'brann', spr: 'brann', x: 5, y: 2, dir: 'up', talk: talkBrann }];
  G.MAPS.muehle.npcs = [{ id: 'mathis', spr: 'mahlen', x: 6, y: 3, dir: 'down', talk: talkMathis }];
  M.npcs = [
    { id: 'selma', spr: 'selma', x: 16, y: 36, dir: 'down', trainer: 'selma', sight: 0, after: [17, 36] }, // nur auf Ansprache
    { id: 'kaspar', spr: 'kaspar', x: 16, y: 10, dir: 'down', trainer: 'kaspar', sight: 4, after: [17, 10] },
    { id: 'nebelahn', mon: 'nebelahn', x: 16, y: 2, dir: 'down', show: () => q1() < 6, talk: talkBoss },
    { id: 'jorinS', spr: 'jorinSleep', x: 14, y: 3, dir: 'down', show: () => q1() < 6, talk: () => G.UI.sayAll(['Jorin liegt zwischen den Steinen, in Nebel gehüllt wie in eine Decke.', 'Neben ihm steht eine kalte Laterne. Sein Atem geht langsam und kalt.']) }
  ];

  const face = (n, x, y) => { const dx = x - n.cx, dy = y - n.cy; n.cdir = Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? 'right' : 'left') : (dy > 0 ? 'down' : 'up'); };
  async function refill() { await G.UI.say('Ilse: Deine Seelenfänger sind fast aufgebraucht? Hier, ich habe noch drei übrig.'); await give('laterne', 3); }
  async function talkIlse() {
    const S = G.state, st = story();
    if (S.flags.gift && S.flags.gift !== 1 && S.team.length) return giftStone();
    // ---- Hauptgeschichte ----
    if (st === 0) {
      await G.UI.sayAll([
        'Ilse: Ah, da bist du ja. Die Laternen brennen schon – der Abend kommt früh in Eldenghost.',
        'Ilse: Seit der grosse Nebel über Moor und Meer gekrochen ist, wandern die Geister wieder. Sie sind nicht böse. Nur verloren.',
        'Ilse: Sie suchen Licht. Manche finden es in einer Laterne. Manche in einem Menschen, der ihnen zuhört.',
        'Ilse: Heute Abend sind drei von ihnen zu den Laternensteinen hinter mir gekommen. Drei kleine Lichter – und sie warten auf dich.',
        'Ilse: Sieh sie dir in Ruhe an. Einer davon wird dich begleiten, wenn du ihn wählst. Sprich sie einfach an.'
      ]);
      setStory(1); return;
    }
    if (st === 1) return G.UI.say('Ilse: Die drei Laternensteine stehen gleich hinter mir. Nimm dir Zeit – es gibt keine falsche Wahl.');
    if (st === 2) {
      if (S.flags.tour === 0) { await offerTour(); return G.UI.say('Ilse: Und jetzt ab ins Nebelgras – schwäch einen Geist und wirf dann einen Seelenfänger.'); }
      if ((S.items.laterne || 0) < 2) return refill();
      return G.UI.say('Ilse: Das Nebelgras beginnt südlich, hinter der Baumreihe. Schwäch den Geist erst, dann wirf einen Seelenfänger.');
    }
    if (st === 3) {
      const m = S.team[S.team.length - 1];
      await G.UI.sayAll([
        `Ilse: Siehst du? ${m ? G.nm(m) + ' ist' : 'Er ist'} nicht mehr verloren. Nur noch ein bisschen scheu.`,
        'Ilse: Und jetzt habe ich eine Bitte. Hast du es bemerkt? Heute Nacht brennt der Leuchtturm an der Küste nicht.',
        'Ilse: Onno, der Wärter, lässt ihn sonst nie ausgehen. Nicht in dreissig Jahren.',
        'Ilse: Ohne sein Licht finden weder Schiffe noch Geister den Weg durch den Nebel.',
        'Ilse: Geh zur Küste und sieh nach. Der Ostweg führt an den Gräbern vorbei, dann durch eine Nebelbank bis ans Meer.'
      ]);
      setStory(4);
      await G.UI.say('Ilse: Und lass dir Zeit. Im Nebelgras kannst du deine Geister stärker machen – Fenn wartet am Wegweiser schon ungeduldig auf einen Kampf, aber das hat Zeit, bis du bereit bist.');
      if (!S.flags.note) await G.UI.say('Ilse: Ach, und noch etwas … Bei Jorin brennt seit drei Tagen kein Licht. Wenn du Zeit hast, schau bei seiner Tür nach – das Haus östlich vom Weg.');
      return;
    }
    // ---- Nebengeschichte «Das Licht im Moor» (Jorin) ----
    if (q1() === 0 && S.flags.note) {
      await G.UI.sayAll(['Ilse: «Zurück, wenn der Nebel geht» … Der Nebel geht nicht, Kind. Er wird dichter.',
        'Ilse: Jorin sucht sie noch immer. Maren. Seit sieben Wintern.', 'Ilse: Du hast jetzt jemanden, der im Dunkeln sieht. Such ihn. Aber sprich vorher mit Wido bei den Gräbern – er kennt die alten Wege.']);
      setQ(1); await give('kraeutertee', 3); return;
    }
    if (q1() === 6) {
      await G.UI.sayAll(['Ilse: Du bist zurück. Und … ist das Marens Laterne?', 'Jorin tritt aus dem Nebel. Er nimmt die Laterne, hält sie an die Flamme des Laternenpfahls.',
        'Für einen Moment leuchtet sie – warm, golden, als hätte sie nur gewartet.', 'Jorin: Ich hab so lange gesucht. Jetzt kann ich endlich zur Ruhe kommen.',
        'Ilse: Der Nebel hat sich ein Stück gelichtet. Aber hör gut hin …', 'Ilse: Nebelahn hat den Nebel nur aufgehalten. Er kommt nicht aus dem Moor.',
        'Ilse: Im Norden, hinter dem Meer, läutet nachts eine Glocke. Eine Glocke, die es nicht mehr gibt.', '– Nebengeschichte «Das Licht im Moor» abgeschlossen. Danke fürs Helfen! –']);
      S.items.marenslaterne = 0; setQ(7); G.Snd.sfx('heal'); G.save(true); return;
    }
    if ((S.items.laterne || 0) < 2) return refill();
    const hints = {
      0: 'Ilse: Schau bei Jorins Tür nach, ja? Das Haus östlich vom Weg.',
      1: 'Ilse: Wido ist bei den Gräbern im Nebel. Er weiss mehr über Maren als ich.',
      2: 'Ilse: Der Weg ins Tiefe Moor beginnt beim Wegweiser ganz im Süden.',
      3: 'Ilse: Jorin hat eine Torfhütte im Moor. Vielleicht findest du dort eine Spur.',
      4: 'Ilse: Vor dem Nebelsee soll ein Mann im grauen Mantel stehen. Sei vorsichtig mit ihm.',
      5: 'Ilse: Der Alte auf dem Hügel … sei sanft zu ihm. Er hat länger gewartet als wir alle.'
    };
    const main = {
      4: 'Ilse: Der Leuchtturm steht draussen an der Küste. Nimm den Ostweg bei den Gräbern.',
      5: 'Ilse: Onno ist nicht im Turm? Dann ist er nicht weit. Er geht nie weiter als bis zu seinem Lieblingsbaum.',
      6: 'Ilse: Das Licht brennt wieder! Man sieht den Strahl bis hierher. Geh nach Hause, Kind – deine Eltern warten.',
      7: 'Ilse: Hast du das Nebelhorn gehört? Das kommt vom Hafen. Seit Jahren hat dort kein Schiff mehr angelegt.',
      8: 'Ilse: Ein Schiff im Hafen … Pass gut auf dich auf da draussen. Und komm zurück, hörst du?'
    };
    const lore = ['Ilse: Irrlichter fürchten das Moor, Schatten fürchten das Licht. Merk dir das.',
      'Ilse: Wenn deine Geister müde sind, ruh dich zu Hause aus oder geh zu Schwester Alwine in die Mondkirche.',
      'Ilse: Früher hat jede Familie hier eine Laterne für ihre Verstorbenen angezündet. Manche brennen noch immer.'];
    S.flags.lore = (S.flags.lore || 0) + 1;
    const k = S.flags.lore % 3;
    const side = q1() < 7 && (S.flags.note || q1() > 0);
    await G.UI.say(k === 1 && main[st] ? main[st] : k === 2 && side ? hints[q1()] : lore[S.flags.lore % lore.length]);
  }
  // Laternensteine: Beschreibung lesen, bestätigen, dann Seelenfänger-Übergabe durch Ilse
  const ALTAR_NOTE = {
    flackerling: 'Ilse: Ein Flackerling – ein kleiner Glutdrache. Feurig und neugierig. Pflanzen brennt er mühelos nieder, aber vor Wasser nimmt er sich in Acht.',
    pfuetzling: 'Ilse: Ein Pfützling. Ein Entlein aus Moorwasser und Mondlicht – tapsig, aber zäh. Feuer löscht er mit einem Platsch, nur Pflanzen saugen ihn aus.',
    blattling: 'Ilse: Ein Blattling, ein Setzling aus dem Feenhain. Leise und geduldig. Seine Wurzeln trinken jedes Wasser – doch Feuer fürchtet er.'
  };
  // v14-Geschenk für alte Spielstände: ein neuer Laternenstein mit dem Starter der gleichen Rolle (einmalig, freiwillig, nichts geht verloren)
  async function giftStone() {
    const S = G.state, sp = S.flags.gift, Sp = G.SPECIES[sp];
    await G.UI.sayAll(['Ilse: Warte! Heute Nacht ist ein neues Licht zu den Laternensteinen gekommen.',
      `Ilse: Ein ${Sp.name} (${G.typesOf(sp).join('/')}). ${Sp.desc}`, 'Ilse: Er sucht jemanden, der ihn mitnimmt. Deine Geister bleiben natürlich bei dir.']);
    const ok = await G.UI.yesNo(`${Sp.name} zusätzlich mitnehmen?`); G.UI.hideText();
    if (!ok) return G.UI.say('Ilse: Gut. Der Stein leuchtet weiter – sprich mich an, wenn du es dir anders überlegst.');
    const lv = Math.max(5, Math.min(30, Math.round(Math.max(...S.team.map(m => m.lvl)) - 2)));
    const m = G.makeMon(sp, lv); if (S.team.length < 6) S.team.push(m); else S.box.push(m);
    S.seen[sp] = S.caught[sp] = 1; S.flags.gift = 1; G.Snd.sfx('catch');
    return G.UI.say(`${Sp.name} (Lv ${lv}) schwebt ${S.team.includes(m) ? 'an deine Seite' : 'in deine Geisterkiste'}. Es wird ein bisschen wärmer.`);
  }
  async function talkAltar(sp) {
    const S = G.state, st = story(), Sp = G.SPECIES[sp];
    if (st >= 2 || S.team.length) return G.UI.say(S.starter === sp ? 'Der Laternenstein ist leer. Nur die kleine Flamme brennt noch – ruhig, als würde sie auf dich warten.'
      : 'Auf dem Laternenstein brennt eine kleine Flamme. Der Geist, der hier war, ist in den Nebel zurückgekehrt. Er wird seinen Weg finden.');
    if (st === 0) return G.UI.sayAll(['Über dem Laternenstein schwebt ein kleiner Geist und mustert dich neugierig.', 'Vielleicht solltest du zuerst mit Ilse sprechen.']);
    G.World.showcase = sp;
    await G.UI.sayAll([`Laternenstein: ${Sp.name} · Typ ${G.typesOf(sp).join('/')}`, Sp.desc, ALTAR_NOTE[sp]]);
    const ok = await G.UI.yesNo(`${Sp.name} als deinen ersten Geist wählen?`);
    G.UI.hideText();
    if (!ok) { G.World.showcase = null; return G.UI.say('Du trittst einen Schritt zurück. Der Geist wartet geduldig.'); }
    const m = G.makeMon(sp, 5); S.team.push(m); S.starter = sp; S.seen[sp] = 1; S.caught[sp] = 1;
    G.Snd.sfx('catch');
    await G.UI.say(`${Sp.name} schwebt an deine Seite. Es wird ein bisschen wärmer.`);
    G.World.showcase = null;
    await G.UI.say('Die beiden anderen Lichter nicken dir zu und verblassen langsam im Nebel.');
    const il = D.npcs.find(n => n.id === 'ilse'); if (il) face(il, P.x, P.y);
    await G.UI.sayAll([
      `Ilse: ${Sp.name}. Eine gute Wahl – oder es hat dich gewählt. Das weiss man bei Geistern nie so genau.`,
      'Ilse: Jetzt brauchst du noch etwas, um verlorene Geister heimzuholen. Hier, nimm diese fünf Seelenfänger.'
    ]);
    S.flags.ilse = 1; await give('laterne', 5);
    await G.UI.say('Ilse: Ein Seelenfänger ist eine kleine Laterne aus Mondglas. Ein müder Geist findet darin Ruhe – und folgt dir danach.');
    setStory(2);
    await offerTour();
    await G.UI.sayAll([
      'Ilse: Und jetzt üben wir. Im Nebelgras südlich des Dorfes wartet bestimmt ein wilder Geist.',
      'Ilse: Schwäch ihn zuerst mit einer Attacke. Wenn er müde wird, öffne die «Tasche» und wirf einen Seelenfänger.'
    ]);
  }
  // ---- Dorfführung mit Ilse (nur neue Spielstände: flags.tour === 0; alte Spielstände kennen den Schlüssel nicht -> übersprungen) ----
  // Ilse geht voraus (Wegsuche), die Spielfigur folgt ihrer Spur; B oder «Ich kenne mich aus» überspringt.
  const TOUR = [
    { to: [29, 6], face: 'up', look: [28, 5], lines: ['Ilse: Das hier ist die Mondkirche. Schwester Alwine wacht dort über alle, die unterwegs sind.',
      'Ilse: Bei ihr kannst du deine Geister heilen lassen – kostenlos, so oft du willst. Und wenn dich im Kampf die Kräfte verlassen, wachst du dort wieder auf.'] },
    { to: [28, 15], face: 'up', look: [27, 14], lines: ['Ilse: Branns Schmiede. Er schmiedet Laternenrahmen aus Raseneisen – rau wie ein Stein, aber ein gutes Herz.'] },
    { to: [4, 10], face: 'up', look: [3, 9], lines: ['Ilse: Die Mühle am Teich. Mathis mahlt dort Korn und weiss mehr über Wasser und Wind, als er zugibt.'] },
    { to: [15, 15], face: 'down', look: [16, 16], lines: ['Ilse: Und hier beginnt das Nebelgras. Dort streifen wilde Geister umher – der beste Ort, um zu üben und stärker zu werden.'] },
    { to: [15, 15], face: 'right', look: [45, 23], cam: [31 * T, 22 * T], lines: ['Ilse: Siehst du den Weg dort im Osten, bei den Gräbern? Das ist der Küstenpfad – er führt zum Hafen und zum Leuchtturm.',
      'Ilse: Aber dafür ist später Zeit.'] }
  ];
  const tour = { active: false, stop: -1, skip: false, said: [], visited: 0 };
  function pathFind(m, from, to, avoid) {
    const key = (x, y) => x + ',' + y, goal = key(to[0], to[1]), prev = new Map([[key(from[0], from[1]), null]]), q = [from];
    const free = (x, y) => x >= 0 && y >= 0 && x < m.w && y < m.h && !SOLID[m.kind].has(m.tiles[y][x]) && !m.warps[key(x, y)] && !(avoid && avoid.has(key(x, y)))
      && !m.npcs.some(n => n.id !== 'ilse' && npcVisible(n) && n.cx === x && n.cy === y);
    while (q.length) {
      const [x, y] = q.shift(); if (key(x, y) === goal) break;
      for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) { const nx = x + dx, ny = y + dy, k = key(nx, ny); if (prev.has(k) || !free(nx, ny)) continue; prev.set(k, [x, y]); q.push([nx, ny]); }
    }
    if (!prev.has(goal)) return null;
    const out = []; for (let c = to; c && key(c[0], c[1]) !== key(from[0], from[1]); c = prev.get(key(c[0], c[1]))) out.unshift(c);
    return out;
  }
  const dirTo = (dx, dy) => dx > 0 ? 'right' : dx < 0 ? 'left' : dy > 0 ? 'down' : 'up';
  async function npcStep(n, nx, ny) {
    const dx = nx - n.cx, dy = ny - n.cy; n.cdir = dirTo(dx, dy);
    await G.animate(STEP * 1000, p => { n.ox = dx * p * T; n.oy = dy * p * T; });
    n.cx = nx; n.cy = ny; n.ox = n.oy = 0;
  }
  function playerStep(nx, ny) {
    P.dir = dirTo(nx - P.x, ny - P.y); P.auto = true; P.moving = true; P.tx = nx; P.ty = ny; P.t = 0;
    return new Promise(r => { const t0 = performance.now(); const f = () => (P.moving && performance.now() - t0 < 1500) ? setTimeout(f, 16) : r(); f(); });
  }
  async function offerTour() {
    const S = G.state; if (S.flags.tour !== 0) return;
    Object.assign(tour, { visited: 0, said: [], skip: false });
    G.UI.setText('Ilse: Kennst du dich im Dorf schon aus? Sonst zeige ich dir rasch die wichtigsten Orte.', true);
    const r = await G.UI.choose([{ label: 'Zeig es mir' }, { label: 'Ich kenne mich aus' }], { area: 'battle', cols: 2, cancel: true });
    G.UI.hideText();
    if (r === 0) await runTour();
    else await endTour(true);
  }
  async function endTour(skipped) {
    const S = G.state; S.flags.tour = 2; tour.active = false; tour.stop = -1;
    if (skipped) await G.UI.sayAll(['Ilse: Schon gut, du kennst dich aus. Nur eins noch: In der Mondkirche oben rechts heilt Schwester Alwine deine Geister – kostenlos.',
      'Ilse: Das Nebelgras liegt südlich, hinter der Baumreihe.']);
    G.save(true);
  }
  async function runTour() {
    const il = D.npcs.find(n => n.id === 'ilse');
    if (G.map !== D || !il) return endTour(true);
    Object.assign(tour, { active: true, stop: 0, skip: false, said: [], visited: 0 });
    G.lock++;
    G.UI.toast('B: Führung überspringen', 2200);
    try {
      let trail = pathFind(D, [P.x, P.y], [il.cx, il.cy]) || []; trail.pop();       // Weg der Spielfigur bis hinter Ilse
      for (let i = 0; i < TOUR.length && !tour.skip; i++) {
        const st = TOUR[i]; tour.stop = i;
        const path = pathFind(D, [il.cx, il.cy], st.to, new Set([P.x + ',' + P.y])) || pathFind(D, [il.cx, il.cy], st.to) || [];
        for (const [nx, ny] of path) {
          if (tour.skip) break;
          trail.push([il.cx, il.cy]);
          const pn = trail.shift();
          await Promise.all([npcStep(il, nx, ny), pn && !(pn[0] === nx && pn[1] === ny) ? playerStep(pn[0], pn[1]) : null]);
        }
        while (trail.length && !tour.skip) { const pn = trail.shift(); if (pn[0] === il.cx && pn[1] === il.cy) break; await playerStep(pn[0], pn[1]); }
        if (tour.skip) break;
        il.cdir = st.face; P.dir = dirTo(il.cx - P.x, il.cy - P.y);
        if (st.cam) { G.World.camFocus = st.cam; await G.wait(900); }
        tour.said.push(...st.lines); tour.visited++;
        await G.UI.sayAll(st.lines); G.UI.hideText();
        if (st.cam) { G.World.camFocus = null; await G.wait(500); }
      }
    } finally { G.World.camFocus = null; P.auto = false; G.lock--; }
    const skipped = tour.skip;
    if (!skipped) il.cdir = dirTo(P.x - il.cx, P.y - il.cy);
    await endTour(skipped);
    if (!skipped) await G.UI.say('Ilse: So, das war die Runde. Ich bleibe hier am Nebelgras und schaue dir zu.');
  }
  const tourState = () => ({ active: tour.active, stop: tour.stop, visited: tour.visited, said: tour.said.slice(), skip: tour.skip });
  const skipTour = () => { if (tour.active) tour.skip = true; return tour.active; };
  // Eltern: begleiten die ganze Geschichte, Abschied nach dem Leuchtturm
  async function farewell() {
    const S = G.state, home = G.MAPS.home;
    for (const n of home.npcs) face(n, P.x, P.y);
    await G.UI.sayAll([
      'Mutter: Da bist du ja. Der Leuchtturm brennt wieder – wir haben das Licht von hier aus gesehen.',
      'Vater: Du hast Onno geweckt? Gut gemacht. Wir sind stolz auf dich.',
      'Du erzählst ihnen von Onno und von den Inseln hinter dem Nebel. Dass du hinwillst – dorthin, wo die verlorenen Geister herkommen.',
      'Mutter: … Ich hab mir schon gedacht, dass das irgendwann kommt.',
      'Vater: Du warst noch nie jemand, der lange stillsitzt.',
      'Mutter: Ich mach mir Sorgen, das weisst du. Aber ich halte dich nicht auf.',
      'Mutter: Hier, Tee für unterwegs. Trink ihn, wenn du müde bist oder dir kalt ist.'
    ]);
    await give('kraeutertee', 3);
    await G.UI.say('Vater: Und nimm meinen Kompass. Der hat mich immer wieder heimgebracht. Jetzt gehört er dir.');
    await give('kompass', 1);
    await G.UI.sayAll([
      'Vater: Pass auf dich auf. Und wenn es nicht mehr geht, kommst du heim. Das ist keine Schande.',
      'Mutter: Schreib uns, ja? Und iss genug.',
      'Mutter nimmt dich fest in den Arm. Vater legt dir kurz die Hand auf die Schulter.',
      'Draussen tönt ein Nebelhorn. Einmal, lang und tief.',
      'Vater: Das kommt vom Hafen … Geh. Ich glaube, das ist für dich.'
    ]);
    G.Snd.sfx('bell');
    setStory(7);
  }
  async function talkMutter() {
    const S = G.state, st = story();
    if (st === 6) return farewell();
    const t = {
      0: ['Mutter: Na, endlich wach? Ilse war schon zweimal an der Tür.', 'Mutter: Sie wartet bei der Laterne am Dorfplatz, gleich östlich von hier. Zieh die Kapuze über – der Nebel ist heute früh dran.'],
      1: ['Mutter: Drei Geister auf den Laternensteinen? Dann lass dir Zeit mit der Wahl.'],
      2: [`Mutter: Das ist also ${S.team[0] ? G.nm(S.team[0]) : 'dein Geist'}? … Es ist ganz warm, wenn man die Hand danebenhält.`],
      4: ['Mutter: Der Leuchtturm ist dunkel? Dann ist Onno wieder irgendwo eingenickt. Weck ihn sanft – er erschrickt leicht.'],
      7: ['Mutter: Pass auf dich auf, ja? Wir sind hier, wenn du uns brauchst.']
    };
    return G.UI.sayAll(t[st >= 7 ? 7 : st >= 4 ? 4 : st >= 2 ? 2 : st]);
  }
  async function talkVater() {
    const st = story();
    if (st === 6) return farewell();
    const t = {
      0: ['Vater: Ilse wartet auf dich, auf dem Dorfplatz. Sie hat was von «heute ist dein Abend» gemurmelt. Du weisst ja, wie sie ist.'],
      1: ['Vater: Ein eigener Geist, hm? Behandle ihn gut, dann hält er zu dir.'],
      4: ['Vater: Ohne den Leuchtturm fährt heute Nacht keiner raus. Onno schläft wie ein Stein, wenn der Wind von Osten kommt.'],
      7: ['Vater: Hast du den Kompass noch? Gut. Damit findest du immer heim.']
    };
    return G.UI.sayAll(t[st >= 7 ? 7 : st >= 4 ? 4 : st >= 1 ? 1 : 0]);
  }
  // Leuchtturmwärter Onno: schläft unter seinem Baum, wird mit A geweckt und zündet die Lampe wieder an
  async function talkOnnoSleep() {
    const st = story(), n = K.npcs.find(o => o.id === 'onnoS');
    if (st < 4) return G.UI.sayAll(['Ein alter Mann in gelbem Ölzeug schläft an den Baum gelehnt. Er schnarcht wie eine ferne Brandung.', 'Du lässt ihn schlafen.']);
    if (G.FEAT.cave && !G.flag('quantum')) return G.UI.sayAll(['Ein alter Mann in gelbem Ölzeug schläft an den Baum gelehnt. Ein feiner violetter Dunst liegt über ihm.',
      'Du rüttelst ihn an der Schulter – er murmelt nur etwas von «Augen … so viele Augen» und schläft weiter.',
      'Dieser Schlaf ist nicht natürlich. Irgendetwas in der Klippenhöhle hält ihn fest.']);
    await G.UI.sayAll(['Ein alter Mann in gelbem Ölzeug schläft an den Baum gelehnt, die Mütze tief im Gesicht. Er schnarcht wie eine ferne Brandung.', 'Du rüttelst ihn sanft an der Schulter …']);
    G.UI.hideText();
    n.spr = 'onno'; face(n, P.x, P.y); n.alert = 1; G.Snd.sfx('alert'); await G.wait(650); n.alert = 0;
    await G.UI.sayAll([
      'Onno: Hm? Was – wer … Ist es schon dunkel?!',
      ...(G.FEAT.cave ? ['Onno: Ich hatte so einen seltsamen Traum … Schwarzer Rauch sass auf meiner Brust, voller Augen, und hat mir ins Ohr geflüstert.'] : []),
      'Onno: Beim Klabautergeist! Der Turm! Ich wollte mich nur kurz hinsetzen. Der Ostwind macht mich immer so schläfrig.',
      'Onno: Ich bin Onno, der Wärter hier. Komm mit, schnell – ohne das Licht findet heute Nacht nichts und niemand den Hafen.'
    ]);
    G.UI.hideText();
    lamp.onno = true; lamp.p = 0;
    await G.animate(300, p => G.fx = { kind: 'wipe', p });
    G.World.setMap('leuchtturm', 4, 3, 'up');
    await G.animate(300, p => G.fx = { kind: 'wipe', p: 1 - p }); G.fx = null;
    await G.UI.say('Onno schlurft die Wendeltreppe hinauf, du hinterher. Oben reibt er ein langes Streichholz an der Messingwand und hält es an den Docht.');
    G.UI.hideText();
    G.Snd.sfx('heal');
    await G.animate(1800, p => { lamp.p = p * p; if (Math.random() < 0.5) spark(4 * T + 10 + Math.random() * 12, 2 * T - 2 + Math.random() * 8, (Math.random() - 0.5) * 30, -20 - Math.random() * 20, 0.6); });
    G.Snd.sfx('bell');
    setStory(6, true); lamp.p = null; lamp.onno = false; n.spr = 'onnoSleep';
    K.canvas = null; K.lights = null;                 // Aussenansicht mit brennender Lampe neu zeichnen
    await G.UI.say('Die Lampe erwacht. Warmes Licht füllt die Linse und dreht sich hinaus, über das schwarze Wasser.');
    G.UI.hideText();
    if (G.FEAT.legend) await legendScene();
    await G.UI.sayAll([
      'Onno: So. Da ist sie wieder, meine Alte. Zweiunddreissig Jahre, und sie hat nur zweimal gestreikt – beide Male war ich schuld.',
      'Onno: Danke dir. Ilse hat dich geschickt, ja? Und du hast einen Geist bei dir … Ich seh es an deinem Blick. Du willst weg.',
      'Onno: Hinter dem Nebel liegt mehr als Moor und Wasser. Inseln, alte Städte, Lichter, die keiner mehr kennt. Von dort kommen die verlorenen Geister.',
      'Onno: Aber so eine Reise beginnt man nicht, ohne Lebewohl zu sagen. Geh heim zu deinen Eltern und verabschiede dich. Richtig, nicht nur durchs Fenster.',
      'Onno: Ich halte das Licht an. Versprochen – diesmal schlafe ich nicht ein.'
    ]);
    G.UI.toast('Neues Ziel: ' + GOALS[6], 3600, true);
  }
  // v15 Legendärer Geist: Fyrlumen verlässt den Leuchtturm, sobald das Licht zurück ist (nur gesichtet, nicht fangbar)
  const legend = { p: null };
  async function legendScene() {
    G.Snd.music('none'); G.Snd.jingle('legend');
    await G.UI.say('Da – ein Laut, hoch und klar wie Glas, das singt. Er kommt von ganz oben, aus dem Licht selbst.');
    G.UI.hideText();
    await G.animate(300, p => G.fx = { kind: 'wipe', p });
    G.World.setMap('kueste', 22, 8, 'up'); G.World.camFocus = [18 * T, 4 * T];
    G.World.camera && G.World.camera(false, 10);
    await G.animate(300, p => G.fx = { kind: 'wipe', p: 1 - p }); G.fx = null;
    legend.p = 0; G.state.seen.fyrlumen = 1;
    await G.animate(3600, p => { legend.p = p; });
    legend.p = null; G.World.legendDone = (G.World.legendDone || 0) + 1;
    await G.UI.say('Ein leuchtender Geist schiesst aus der Laterne, zieht einen Schweif aus Licht und Nebel hinter sich her – und verschwindet über dem Meer in der Ferne.');
    G.UI.hideText();
    await G.animate(300, p => G.fx = { kind: 'wipe', p });
    G.World.camFocus = null; G.World.setMap('leuchtturm', 4, 3, 'up');
    await G.animate(300, p => G.fx = { kind: 'wipe', p: 1 - p }); G.fx = null;
    await G.UI.sayAll([
      'Onno steht ganz still. Die Pfeife ist ihm aus der Hand gefallen.',
      'Onno: … Fyrlumen. Das war Fyrlumen. Mein Grossvater hat ihn einmal gesehen, sonst kenne ich keinen, dem das vergönnt war.',
      'Onno: Er schläft im Licht der alten Leuchttürme, oft hundert Jahre lang. Er bricht nur auf, wenn er spürt, dass eine grosse Geschichte beginnt …',
      'Onno: … und dass Ungemach naht. Beides, immer beides.',
      '(Fyrlumen wurde im Geisterbuch als «gesichtet» eingetragen.)'
    ]);
    G.UI.hideText(); G.Snd.music(G.World.areaMusic());
  }
  function renderLegend(ctx, cx, cy, t) {
    if (legend.p == null) return;
    const p = legend.p, K0 = G.MAPS.kueste, h = K0.houses.find(o => o.id === 'leuchtturm'), sx0 = h.x * T + 24 - cx, sy0 = h.y * T - 45 - cy;
    // Aufleuchten in der Lampe, dann Flug in weitem Bogen nach Nordosten über das Meer, immer kleiner (Silhouette im Gegenlicht)
    const q = Math.max(0, (p - 0.18) / 0.82), e = q * q * (3 - 2 * q);
    const x = sx0 - e * 210 + Math.sin(q * 6) * 8 * (1 - q), y = sy0 + 6 - Math.sin(q * Math.PI) * 12 + e * 22;
    const sc = 1 - e * 0.8, a = p < 0.18 ? p / 0.18 : 1 - Math.max(0, (q - 0.8) / 0.2);
    ctx.save(); ctx.globalCompositeOperation = 'lighter';
    if (p < 0.3) { const r = 20 + p * 160; const gr = ctx.createRadialGradient(sx0, sy0 + 14, 0, sx0, sy0 + 14, r); gr.addColorStop(0, `rgba(255,250,220,${0.7 * (1 - p / 0.3)})`); gr.addColorStop(1, 'rgba(255,240,200,0)'); ctx.fillStyle = gr; ctx.fillRect(sx0 - r, sy0 + 14 - r, r * 2, r * 2); }
    legend.trail = legend.trail || []; if (q > 0) legend.trail.push({ x: x + cx, y: y + cy + 10 * sc, l: 1 }); legend.trail = legend.trail.filter(o => (o.l -= 0.03) > 0);
    for (const o of legend.trail) { const r = 3 + o.l * 8; const gr = ctx.createRadialGradient(o.x - cx, o.y - cy, 0, o.x - cx, o.y - cy, r); gr.addColorStop(0, `rgba(200,236,255,${0.35 * o.l})`); gr.addColorStop(1, 'rgba(160,200,255,0)'); ctx.fillStyle = gr; ctx.fillRect(o.x - cx - r, o.y - cy - r, r * 2, r * 2); }
    const R = 34 * sc + 6, gr = ctx.createRadialGradient(x, y + 12 * sc, 0, x, y + 12 * sc, R); gr.addColorStop(0, `rgba(255,248,210,${0.55 * a})`); gr.addColorStop(0.5, `rgba(170,220,255,${0.25 * a})`); gr.addColorStop(1, 'rgba(150,200,255,0)');
    ctx.fillStyle = gr; ctx.fillRect(x - R, y + 12 * sc - R, R * 2, R * 2);
    ctx.globalCompositeOperation = 'source-over'; ctx.globalAlpha = a;
    const sz = Math.max(8, Math.round(48 * sc)), img = G.SPR.mon.fyrlumen && G.SPR.mon.fyrlumen.at(sz, false);
    if (img) ctx.drawImage(img, Math.round(x - sz / 2), Math.round(y - sz * 0.25), sz, sz);
    ctx.restore();
  }
  // v15 Team Quantum in der Klippenhöhle
  async function quantumScene() {
    G.lock++;
    try {
      const S = G.state, first = !G.flag('qseen'); S.flags.qseen = 1;
      G.Snd.music('quantum');
      if (first) {
        G.World.camFocus = [19 * T, 3 * T];
        await G.UI.sayAll([
          'In der Kammer glimmt eine goldene Lichtader. Ein dünner Strahl zieht sich von der Decke – vom Leuchtturm her – in einen summenden Glaskolben.',
          'Mandy: … und wenn der Kolben voll ist, haben wir genug Leuchtseele für die ganze Anlage. Hans, hör auf, an dem Ding zu klopfen.',
          'Hans: Ich klopfe nicht. Ich prüfe. Das ist ein Unterschied.',
          'Zwischen den beiden hängt schwarzer Rauch in der Luft. Er bewegt sich gegen den Luftzug.',
          'Dann öffnen sich darin Augen. Zwei, fünf, ein Dutzend – violett und rot, keines blinzelt zur gleichen Zeit. Ein langes Zischen füllt die Kammer.',
          'Mandy: Ruhig, Kleiner. Das ist nur ein Kind mit einer Laterne.',
          'Hans: Unser Nachtmahr. Den Wärter hat er mit seinem Traumdunst eingeschläfert. Der schläft jetzt, bis wir fertig sind.',
          'Mandy: Wir sind Team Quantum. Wir sammeln Licht, das sonst nur verschwendet wird – für Dinge, die du nicht verstehen würdest.',
          'Hans: Ich versteh sie auch nicht immer. Aber die Uniform ist bequem.'
        ]);
        G.World.camFocus = null;
      } else { G.Snd.sfx('hiss'); await G.UI.say('Der Nachtmahr zischt, als du näherkommst. Mandy: Schon wieder du? Hartnäckig, das muss man dir lassen.'); }
      await quantumTalk(true);
    } finally { G.UI.hideText(); G.lock--; }
  }
  async function quantumTalk(inScene) {
    if (!inScene) G.lock++;
    try {
      await G.UI.say('Mandy: Hinweis unter Kollegen: Das hier wird kein Spaziergang. Drei Geister – und dann der Nachtmahr. Unter Level 11 würde ich es gar nicht erst versuchen.');
      const hint = G.state.team.some(m => m.hp < G.stats(m).hp) ? ' Deine Geister sind angeschlagen – trink Tee oder ruh dich aus, bevor du kämpfst.' : '';
      if (!(await G.UI.yesNo('Gegen Team Quantum kämpfen?' + hint))) {
        await G.UI.sayAll(['Hans: Lauf ruhig. Heil deine Geister. Wir warten – das Licht läuft ja nicht weg.', '(Tipp: Kräutertee aus der Tasche heilt; wer verliert, erwacht in der Mondkirche. Die Höhle bleibt offen.)']);
        G.UI.hideText(); if (G.P) { const P0 = G.P; if (P0.y <= 5 && G.map.id === 'hoehle') G.World.setMap('hoehle', P0.x, 6, 'down'); }
        G.Snd.music(G.World.areaMusic()); return;
      }
      G.UI.hideText();
      const S = G.state; if (!S.respawn) S.respawn = churchSpawn('kirche');   // verlieren -> Mondkirche, Höhle bleibt offen
      const tr = G.TRAINERS.quantum; await G.UI.sayAll(tr.intro); G.UI.hideText();
      const r = await G.Battle.trainer('quantum');
      if (r === 'won') await quantumWon();
    } finally { if (!inScene) { G.UI.hideText(); G.lock--; } }
  }
  async function quantumWon() {
    G.lock++;
    try {
      const S = G.state; S.flags.quantum = 1;
      await G.UI.sayAll([
        'Der Glaskolben bekommt einen Sprung. Das gefangene Licht zischt heraus und fliesst die Ader entlang zurück, hinauf zum Leuchtturm.',
        'Der Nachtmahr flackert. Aus dem Rauch dringt ein Flüstern, viele Stimmen auf einmal, keine Worte. Dann schrumpft er in Mandys Glaslaterne.',
        'Mandy: Merk dir eines, Laternenkind: Licht wirft immer auch Schatten. Und in den Schatten sind wir zu Hause.',
        'Mandy: Team Quantum vergisst nicht! Hans – Rückzug!',
        'Hans: Ich hab doch gerade erst meinen Tee ausgepackt …'
      ]);
      G.UI.hideText();
      await G.animate(300, p => G.fx = { kind: 'wipe', p });
      await G.animate(300, p => G.fx = { kind: 'wipe', p: 1 - p }); G.fx = null;
      for (let i = 0; i < 26; i++) spark(19 * T + 8 + (Math.random() - 0.5) * 20, 3 * T, (Math.random() - 0.5) * 16, -40 - Math.random() * 40, 1.2);
      G.Snd.sfx('heal');
      await G.UI.sayAll(['Team Quantum ist verschwunden. Nur ein paar Stiefelabdrücke und der zersprungene Kolben bleiben zurück.',
        'Hinter der Kammer führt ein Loch nach draussen – zu Onnos Platz hinter dem Leuchtturm.']);
      G.UI.toast('Neues Ziel: ' + GOALS[5], 3600, true);
      G.Snd.music(G.World.areaMusic()); G.save(true);
    } finally { G.UI.hideText(); G.lock--; }
  }
  async function talkOnno() {
    const l = ['Onno: Ich bin wach! Hellwach. Fast.', 'Onno: Siehst du den Strahl? Er reicht bis zu den Klippen der Nebelinseln – an klaren Tagen jedenfalls.',
      'Onno: Die Linse hat mein Grossvater geschliffen. Die hält bestimmt länger als ich.'];
    if (story() === 6) return G.UI.say('Onno: Na los, geh nach Hause. Deine Eltern sollen es von dir hören, nicht vom Nebelhorn.');
    G.state.flags.onno = (G.state.flags.onno || 0) + 1; return G.UI.say(l[G.state.flags.onno % l.length]);
  }
  // Kapitänin Wenke von der «Nebelschwalbe»
  async function talkWenke() {
    G.state.flags.wenke = 1;
    if (await G.UI.yesNo('Wenke: Na, Landratte? Bereit, an Bord zu gehen?')) {
      G.UI.hideText();
      return G.UI.sayAll(['Wenke: Ha! Der Wille ist da. Aber die Ladung noch nicht – Torf, Laternenöl und Heddas Tee für drei Wochen.',
        '(Die Reise über das Nebelmeer geht im nächsten Kapitel weiter – Fortsetzung folgt!)']);
    }
    G.UI.hideText();
    return G.UI.say(['Wenke: Lass dir Zeit. Das Meer läuft nicht weg – und im Dorf gibt es sicher noch einiges zu erledigen.',
      'Wenke: Onno schuldet mir noch drei Flaschen Sanddornschnaps. Sag ihm das, falls er wieder einschläft.'][G.rnd(0, 1)]);
  }
  async function arrivalScene() {
    G.lock++;
    const w = K.npcs.find(n => n.id === 'wenke');
    try {
      G.Snd.sfx('bell');
      await G.UI.say('Ein langes, tiefes Nebelhorn rollt über das Wasser. Der Lichtstrahl des Leuchtturms streift etwas Dunkles, Grosses …');
      G.UI.hideText();
      G.World.camFocus = [17 * T, 18 * T + 8];      // Blick auf Hafen und Steg
      arrive.off = 1;
      await G.animate(3400, p => arrive.off = Math.pow(1 - p, 3));
      arrive.off = 0; G.Snd.sfx('creak'); G.Snd.sfx('splash');
      await G.UI.say('Ein Schiff schiebt sich aus dem Nebel und legt knarrend am Steg an. Am Bug glimmen zwei Laternen wie wache Augen.');
      G.UI.hideText();
      arrive.wenke = true; w.cx = 16; w.cy = 19; w.cdir = 'left'; w.ox = w.oy = 0;
      const stepTo = async (dx, dy, dir) => { w.cdir = dir; await G.animate(220, p => { w.ox = dx * p * T; w.oy = dy * p * T; }); w.cx += dx; w.cy += dy; w.ox = w.oy = 0; };
      await stepTo(-1, 0, 'left'); await stepTo(0, -1, 'up'); face(w, P.x, P.y);
      await G.UI.sayAll([
        'Kapitänin Wenke: Ho! Das Licht brennt wieder. Onno, der alte Seebär, hat also doch noch ein Streichholz gefunden.',
        'Wenke: Drei Nächte lagen wir draussen im Nebel und haben gewartet. Ohne den Leuchtturm kommt hier keiner rein.',
        'Wenke: Und du? Gepacktes Bündel, ein Geist an deiner Seite und dieser Blick … Du willst mit, stimmt\u2019s?',
        'Wenke: Die «Nebelschwalbe» fährt zu den Nebelinseln. Dorthin, wo nachts eine Glocke läutet, die es nicht mehr geben dürfte.',
        'Wenke: Wir laden noch Torf und Laternenöl. Wenn du so weit bist, komm an Bord. Ich halte dir eine Koje frei.'
      ]);
      setStory(8, true);
      await G.UI.say('– Hier endet der Prolog «Das erloschene Licht». Die Reise geht bald weiter! –');
      G.UI.hideText();
      G.UI.toast('Neues Ziel: ' + GOALS[8], 4200, true);
    } finally { arrive.wenke = false; arrive.off = null; w.cx = w.x; w.cy = w.y; G.World.camFocus = null; G.lock--; }
  }
  // Ereignisse beim Betreten einer Karte
  async function storyEnter() {
    const id = G.map.id, st = story();
    if (G.map.church && CHURCHES[id]) G.state.respawn = churchSpawn(id);   // letzte besuchte Kirche = Ort des Wiedererwachens
    if (id === 'leuchtturm' && st === 4) {
      G.lock++;
      await G.UI.sayAll(['Im Lampenraum ist es kalt und still. Die grosse Linse ist beschlagen, der Docht trocken.',
        'Auf dem Tisch stehen ein halber Becher kalter Tee und Onnos Pfeife. Vom Wärter keine Spur.',
        'Weit kann er nicht sein. Vielleicht draussen, irgendwo in der Nähe des Turms?']);
      G.UI.hideText(); setStory(5); G.lock--;
    } else if (id === 'katzen' && !G.flag('kc')) { G.lock++; await G.wait(350); await coupleIntro(); G.UI.hideText(); G.lock--;
    } else if (id === 'home' && st === 6) { G.lock++; await farewell(); G.UI.hideText(); G.lock--; }
  }
  async function talkWido() {
    if (q1() === 1) {
      await G.UI.sayAll(['Wido: Jorin? Ins Moor, sagst du. Hm. Hab mir so was gedacht.',
        'Wido: Maren, seine Frau – vor sieben Wintern ist sie im Tiefen Moor verschwunden. Ihre Laterne haben wir nie gefunden.',
        'Wido: Maren? Die hat Laternen nie ausgeblasen. Sagte, man wisse nie, wer noch unterwegs ist.',
        'Wido: Nimm das mit. Wacholderrauch vertreibt die Moorkälte. Und lies den Wegweiser im Süden – er zeigt dir den Pfad.']);
      setQ(2); await give('wacholder', 2); return;
    }
    const l = ['Wido: Keine Sorge wegen der Geister. Die Lebenden machen mir mehr Arbeit.',
      'Wido: Ich kenne jeden Namen auf diesen Steinen. Nur einer fehlt.',
      'Wido: Im Moor gibt es erloschene Laternen. Zünd sie an – wer stolpert, wacht dort wieder auf.'];
    G.state.flags.wido = (G.state.flags.wido || 0) + 1; await G.UI.say(l[G.state.flags.wido % l.length]);
  }
  async function talkHedda() {
    const S = G.state;
    if (!S.flags.hedda) {
      await G.UI.sayAll(['Hedda: Setz dich, setz dich. Die Uhr sagt, du hast Zeit für eine Tasse. Die Uhr lügt nie – nur ich manchmal.',
        'Hedda: Du gehst Jorin suchen? Dann nimm Tee mit. Kalte Hände sind das Erste, was das Moor dir nimmt.']);
      S.flags.hedda = 1; await give('kraeutertee', 2);
      await G.UI.say('Hedda: Bring mir Moorminze vom Schilfrand, dann brühe ich dir etwas, das sogar einen Stein wärmt.'); return;
    }
    if ((S.items.moorminze || 0) >= 2) {
      if (await G.UI.yesNo('Hedda: Oh, du hast Moorminze! 2 Stück gegen einen Kräutertee?')) {
        S.items.moorminze -= 2; G.UI.hideText(); await give('kraeutertee', 1); return;
      }
      G.UI.hideText(); await G.UI.say('Hedda: Auch gut. Die Minze läuft nicht weg. Ich schon – zur Uhr, sie schlägt gleich.'); return;
    }
    await G.UI.say(['Hedda: Bring mir 2 Moorminze vom Schilfrand im Tiefen Moor, dann brühe ich dir Tee.', 'Hedda: Oda singt wieder jeden Abend. Gegen die Stille, sagt sie.'][G.rnd(0, 1)]);
  }
  // Schmied Brann: schmiedet Laternenrahmen aus Raseneisen aus dem Moor; tauscht 3 Seelenfänger gegen 1 Mondglas-Fänger
  async function talkBrann() {
    const S = G.state, it = S.items;
    if (!S.flags.brann) {
      await G.UI.sayAll(['Brann: Vorsicht, die Funken beissen. Komm ruhig näher – aber nicht zu nah an die Esse.',
        'Brann: Ich schmiede Laternenrahmen aus Raseneisen. Das holt man aus dem Moor – rostrot und schwer, aber es hält ein Leben lang.',
        'Brann: Jorin hat mir früher das Erz gebracht. Seit er fort ist, liegt der Amboss oft still. Hier – zwei Seelenfänger, frisch gebogen.']);
      S.flags.brann = 1; await give('laterne', 2);
      await G.UI.say('Brann: Bring mir drei einfache Seelenfänger, dann mache ich dir einen aus Mondglas. Da bleibt selbst ein scheuer Geist gern.'); return;
    }
    if ((it.marenslaterne || 0) > 0 && !S.flags.brannMaren) {
      S.flags.brannMaren = 1;
      await G.UI.sayAll(['Brann: Zeig mal … dieses «M». Die Laterne hab ich gemacht. Für Maren, vor vielen Wintern, als sie mit Jorin ins Moor ging.',
        'Brann: Dass die noch ganz ist, nach all den Jahren … Jorin wird froh sein.']); return;
    }
    if ((it.laterne || 0) >= 3) {
      if (await G.UI.yesNo('Brann: Drei Seelenfänger gegen einen Mondglas-Fänger?')) { it.laterne -= 3; G.UI.hideText(); G.Snd.sfx('hammer'); await give('mondlaterne', 1); return; }
      G.UI.hideText(); await G.UI.say('Brann: Gut. Das Eisen wartet.'); return;
    }
    await G.UI.say(['Brann: Drei einfache Seelenfänger, dann bekommst du Mondglas. Ehrlicher Tausch.', 'Brann: Ich arbeite gern spät. Dann ist es ruhig, und keiner fragt, wann die Rahmen fertig sind.',
      'Brann: Raseneisen ist zäh. Man muss es lange bearbeiten, aber dann hält es ewig.'][G.rnd(0, 2)]);
  }
  // Müller Mathis: Rad dreht sich seit dem Nebel; mahlt Moorminze zu Tee (1:1, günstiger als bei Hedda)
  async function talkMathis() {
    const S = G.state, it = S.items;
    if (!S.flags.mathis) {
      await G.UI.sayAll(['Mathis: Hörst du das Rad? Es dreht sich, seit der Nebel kam – auch ohne Korn. Ich lass es einfach laufen.',
        'Mathis: Am Mühlgraben wächst Minze, die der Nebel nicht mag. Nimm ein paar Blätter. Und einen starken Tee, meine Frau hat immer zu viel gekocht.']);
      S.flags.mathis = 1; await give('moorminze', 2); await give('starktee', 1);
      await G.UI.say('Mathis: Bring mir Moorminze, ich mahle sie dir zu Tee. Ein Blatt, ein Tee.'); return;
    }
    if ((it.moorminze || 0) >= 1) {
      if (await G.UI.yesNo('Mathis: 1 Moorminze gegen 1 Kräutertee?')) { it.moorminze -= 1; G.UI.hideText(); G.Snd.sfx('creak'); await give('kraeutertee', 1); return; }
      G.UI.hideText(); await G.UI.say('Mathis: Dann mahlt das Rad eben für sich allein.'); return;
    }
    await G.UI.say(['Mathis: Das Wasser kommt vom Moor herunter. Manchmal schwimmt ein Licht darin, dann bleibt das Rad kurz stehen.',
      'Mathis: Brann in der Schmiede schärft mir die Mühlsteine. Er redet nicht viel, aber er hört gut zu.'][G.rnd(0, 1)]);
  }
  async function talkOda() {
    if (q1() >= 7) return G.UI.say('Oda: Hörst du? Fenn singt wieder mit. Jorin hat ihm das Lied beigebracht, weisst du.');
    await G.UI.sayAll(['Oda: Er singt nicht mehr mit, seit Jorin weg ist. Fenn, meine ich. Jorin hat ihm das Lied beigebracht.', 'Oda: Die Wiege dort … die bleibt stehen. Manche Dinge räumt man nicht weg.']);
  }
  async function talkJorinHome() {
    const S = G.state;
    if (!S.flags.jorinKerze) { await G.UI.say('Jorin: Die Tür ist offen. War sie eigentlich immer. Ich hab nur nicht aufgemacht.'); S.flags.jorinKerze = 1; await give('nachtkerze', 1); return; }
    await G.UI.say('Jorin: Ich schnitze wieder. Ein Kauz diesmal. Maren mochte Käuze.');
  }
  async function talkBoss() {
    const tr = G.TRAINERS.nebelahn;
    await G.UI.sayAll(tr.intro); G.UI.hideText();
    await G.Battle.trainer('nebelahn');
  }

  // ================= Zeichnen: Kacheln =================
  const shade = (hex, a) => {
    const n = parseInt(hex.slice(1), 16), f = v => Math.max(0, Math.min(255, v + a));
    return `rgb(${f(n >> 16)},${f((n >> 8) & 255)},${f(n & 255)})`;
  };
  const THEME = {
    dorf: { g0: '#213b3b', g: ['#294a47', '#1a3232', '#2e514b'], blade: '#33605a', tip: '#467a70' },
    moor: { g0: '#1e2c28', g: ['#26382e', '#172420', '#2c3a2a'], blade: '#3a4a30', tip: '#56603e' }
  };
  function drawTile(g, m, x, y, c) {
    const d = G.pen(g), R = i => hash(x, y, i), th = THEME[m.theme] || THEME.dorf;
    const grass = () => {
      d.r(0, 0, 16, 16, th.g0);
      for (let i = 0; i < 12; i++) d.p(R(i) * 16 | 0, R(i + 40) * 16 | 0, th.g[i % 3]);
      for (let i = 0; i < 3; i++) { const bx = R(i + 80) * 14 | 0, by = 2 + R(i + 90) * 12 | 0; d.r(bx, by, 1, 2, th.blade); d.p(bx, by, th.tip); }
    };
    const floor = () => { if (m.church) { // Steinplatten, roter Läufer zum Altar
        d.r(0, 0, 16, 16, '#4a4658'); d.r(0, 7, 16, 1, '#3a3648'); d.r(0, 15, 16, 1, '#3a3648'); d.r((y % 2) * 8, 0, 1, 7, '#3a3648'); d.r((y % 2) * 8 + 4, 8, 1, 7, '#3a3648'); d.p(R(1) * 16 | 0, R(2) * 16 | 0, '#5a566a');
        if ((x === 4 || x === 5) && y >= 2 && y < m.h - 1) { d.r(x === 4 ? 2 : 0, 0, 14, 16, '#6a2e3e'); d.r(x === 4 ? 2 : 14, 0, 1, 16, '#c8a050'); d.r(x === 4 ? 3 : 0, 0, 13, 1, '#7a3a4a'); }
        return; }
      d.r(0, 0, 16, 16, '#4a3428'); for (let i = 0; i < 4; i++) d.r(0, i * 4 + 3, 16, 1, '#3c2a20'); d.p(R(1) * 16 | 0, R(2) * 16 | 0, '#5a4232'); d.r((R(3) * 8 | 0) + (y % 2) * 8, 0, 1, 16, '#3e2c22'); };
    if (m.kind === 'interior') {
      switch (c) {
        case 'W': case 'n': case 'l': {
          const front = at(m, x, y + 1) !== 'W' && at(m, x, y + 1) !== 'n' && at(m, x, y + 1) !== 'l' || y === 0;
          if (y === m.h - 1 || x === 0 || x === m.w - 1) { d.r(0, 0, 16, 16, '#1e1418'); d.r(0, 0, 16, 1, '#2a1e22'); break; }
          d.r(0, 0, 16, 16, '#4e3630'); for (let i = 0; i < 16; i += 5) d.r(i, 0, 1, 16, '#3e2a26'); d.r(0, 12, 16, 4, '#3a2622'); d.r(0, 12, 16, 1, '#6a4a3a');
          if (!front) d.r(0, 0, 16, 16, '#2a1e22');
          if (c === 'n') { d.r(3, 2, 10, 9, '#24160f'); d.r(4, 3, 8, 7, '#34506a'); d.r(4, 7, 8, 3, '#6a8a9a'); d.r(7, 3, 1, 7, '#5a3a2a'); d.r(4, 6, 8, 1, '#5a3a2a'); }
          if (c === 'l') { d.r(4, 10, 8, 2, '#6a4a3a'); d.r(6, 4, 4, 6, '#3a3444'); d.r(7, 5, 2, 4, q1() >= 7 ? '#ffd27a' : '#5a5060'); }
          break;
        }
        case 'x': floor(); d.r(1, 2, 14, 12, '#6a3a3a'); d.r(2, 3, 12, 10, '#7a4a44'); d.r(4, 5, 8, 6, '#8a5a4a'); break;
        case 'o': floor(); d.r(1, 0, 14, 15, '#4a4040'); d.r(2, 1, 12, 3, '#5a5050'); d.r(4, 7, 8, 7, '#1a1010'); d.r(5, 10, 6, 4, '#ff8a3a'); d.r(6, 11, 4, 2, '#ffd27a'); break;
        case 't': floor(); d.r(0, 4, 16, 8, '#6a4a32'); d.r(0, 4, 16, 1, '#8a6444'); d.r(1, 12, 2, 3, '#4a3424'); d.r(13, 12, 2, 3, '#4a3424'); d.r(7, 1, 2, 4, '#e8e0c8'); d.p(7, 0, '#ffd27a'); d.r(10, 6, 4, 3, '#d8d0b8'); break;
        case 'b': floor(); d.r(1, 1, 14, 14, '#5a3a2a'); d.r(2, 2, 12, 4, '#d8d0c0'); d.r(2, 6, 12, 8, '#5a4a7a'); d.r(2, 6, 12, 1, '#7a6a9a'); break;
        case 'k': floor(); d.r(0, 0, 16, 15, '#4a3226'); d.r(0, 5, 16, 1, '#2e2018'); d.r(0, 10, 16, 1, '#2e2018');
          for (let i = 0; i < 5; i++) d.r(1 + i * 3, 1 + (i % 2), 2, 4 - (i % 2), ['#e8e0c8', '#8ab0a0', '#c89a6a', '#b8a8f0', '#e8c870'][i]);
          for (let i = 0; i < 4; i++) d.r(2 + i * 4, 7, 2, 3, ['#6a8a5a', '#d8c8a8', '#8a6a9a', '#c87a4a'][i]); break;
        case 'c': floor(); d.r(6, 12, 4, 3, '#3a3040'); d.r(7, 4, 2, 8, '#e8e0c8'); d.p(7, 3, '#ffd27a'); d.p(8, 2, '#fff2c0'); break;
        case 'a': floor(); d.r(2, 5, 12, 9, '#6a4a2e'); d.r(2, 5, 12, 2, '#8a6440'); d.r(2, 9, 12, 1, '#8a8a98'); d.r(7, 8, 2, 3, '#8ff0e4'); d.r(3, 13, 10, 1, '#3a2a1e'); break;
        case 'u': floor(); d.r(4, 0, 8, 15, '#4a3024'); d.e(8, 4, 3, 3, '#d8d0b8'); d.p(8, 3, '#1a1420'); d.p(9, 4, '#1a1420'); d.r(7, 9, 2, 4, '#c8a050'); break;
        case 'y': floor(); d.r(2, 6, 12, 7, '#6a5038'); d.r(3, 7, 10, 3, '#8a7a6a'); d.r(1, 12, 14, 2, '#4a3828'); d.p(5, 6, '#9a9090'); break;
        case 'z': floor(); d.r(0, 6, 16, 3, '#4a3226'); d.r(2, 3, 3, 3, '#b8905a'); d.r(7, 2, 2, 4, '#c8a06a'); d.r(11, 3, 3, 3, '#a8804a'); d.r(0, 9, 16, 6, '#3a2a20'); break;
        case 'A': case 'F': case 'Q': floor(); g.drawImage(propArt(c), 0, 0); break;
        case 'M': { // Mondaltar: Steinblock mit Silbertuch, Mondsichel und Kerzen (zwei Kacheln breit)
          floor(); const L = at(m, x - 1, y) !== 'M';
          d.r(L ? 1 : 0, 4, L ? 15 : 15, 11, '#6a6480'); d.r(L ? 1 : 0, 4, 15, 2, '#8a84a4'); d.r(L ? 1 : 0, 14, 15, 1, '#3a3648');
          d.r(L ? 3 : 0, 6, L ? 13 : 13, 5, '#dcd8ec'); d.r(L ? 3 : 0, 10, 13, 1, '#b4aecc');
          if (L) { d.r(3, 0, 2, 4, '#e8e0c8'); d.p(3, 0, '#ffd27a'); d.e(15, 2, 3, 3, '#e8f0ff'); d.e(16, 1, 2, 2, '#6a6480'); } else { d.r(11, 0, 2, 4, '#e8e0c8'); d.p(12, 0, '#ffd27a'); d.e(0, 2, 3, 3, '#e8f0ff'); d.e(1, 1, 2, 2, '#6a6480'); }
          break;
        }
        case 'P': { // Kirchenbank
          floor(); d.r(0, 3, 16, 3, '#5a3a2a'); d.r(0, 3, 16, 1, '#7a5238'); d.r(0, 8, 16, 3, '#6a4630'); d.r(0, 8, 16, 1, '#8a6040'); d.r(1, 11, 2, 4, '#3a2618'); d.r(13, 11, 2, 4, '#3a2618'); d.r(0, 6, 16, 2, '#3a2618');
          break;
        }
        case 'Z': floor(); d.r(0, 9, 16, 7, '#3a2c28'); d.r(0, 9, 16, 1, '#5a4638'); break;
        case 'R': { floor(); const l = at(m, x - 1, y) !== 'R', r = at(m, x + 1, y) !== 'R', u = at(m, x, y - 1) !== 'R', b = at(m, x, y + 1) !== 'R';   // Flickenteppich
          d.r(l ? 1 : 0, u ? 1 : 0, 16 - (l ? 1 : 0) - (r ? 1 : 0), 16 - (u ? 1 : 0) - (b ? 1 : 0), '#8a4a3a');
          d.r(l ? 2 : 0, u ? 2 : 0, 16 - (l ? 2 : 0) - (r ? 2 : 0), 16 - (u ? 2 : 0) - (b ? 2 : 0), '#a8643e');
          if (u) d.r(0, 3, 16, 1, '#d8b060'); if (b) d.r(0, 12, 16, 1, '#d8b060'); if (l) d.r(3, 0, 1, 16, '#d8b060'); if (r) d.r(12, 0, 1, 16, '#d8b060');
          for (let i = 0; i < 3; i++) d.p(3 + R(i + 5) * 10 | 0, 4 + R(i + 9) * 8 | 0, '#c88a5a'); break; }
        case 'X': floor(); d.r(6, 3, 4, 12, '#c8a878'); for (let i = 4; i < 15; i += 2) d.r(6, i, 4, 1, '#a88858'); d.r(1, 1, 14, 3, '#7a5a8a'); d.r(1, 1, 14, 1, '#9a7aaa'); d.r(3, 13, 10, 2, '#5a3a4a'); d.r(12, 4, 1, 4, '#d8c8a0'); d.e(12, 9, 2, 2, '#e05a5a'); break;
        case 'V': floor(); d.r(4, 10, 8, 5, '#9a5a3a'); d.r(4, 10, 8, 1, '#b87a4a'); d.e(8, 6, 6, 5, '#3a6a3a'); d.e(6, 5, 3, 3, '#4a8a4a'); d.e(10, 7, 3, 3, '#4a8a4a'); d.p(8, 3, '#6aaa5a'); break;
        case 'G': { floor(); const top = at(m, x, y - 1) !== 'G'; d.r(2, 0, 13, 16, '#5a6a8a'); d.r(2, 0, 3, 16, '#4a5a7a'); d.r(5, 1, 10, 14, '#6a7a9a');
          if (top) { d.r(2, 0, 13, 2, '#4a5a7a'); d.r(7, 3, 5, 4, '#e8c870'); } else d.r(2, 14, 13, 2, '#3a4a6a'); break; }
        case 'K': floor(); if (m.id === 'muehle') g.drawImage(SACK(), 0, 0); else g.drawImage(propArt('K'), 0, 0); break;
        case 'j': floor(); d.r(0, 5, 16, 6, '#5a4030'); d.r(0, 5, 16, 1, '#7a5a40'); d.r(2, 3, 5, 2, '#8a8a98'); d.r(10, 2, 1, 3, '#b8905a'); d.r(1, 11, 2, 4, '#3a2a1e'); d.r(13, 11, 2, 4, '#3a2a1e'); break;
        default: floor();
      }
      return;
    }
    switch (c) {
      case ',': {
        d.r(0, 0, 16, 16, '#443b4c');
        for (let i = 0; i < 14; i++) d.p(R(i) * 16 | 0, R(i + 40) * 16 | 0, ['#4f4659', '#393141', '#5a5066'][i % 3]);
        const e = '#2e3a3c';
        if (at(m, x, y - 1) !== ',') d.r(0, 0, 16, 1, e); if (at(m, x, y + 1) !== ',') d.r(0, 15, 16, 1, e);
        if (at(m, x - 1, y) !== ',') d.r(0, 0, 1, 16, e); if (at(m, x + 1, y) !== ',') d.r(15, 0, 1, 16, e);
        break;
      }
      case '"': d.r(0, 0, 16, 16, '#1c3437'); for (let i = 0; i < 6; i++) { const bx = R(i) * 15 | 0, by = 3 + R(i + 9) * 12 | 0; d.r(bx, by, 1, 2, '#2e5a5c'); d.p(bx, by, '#6a9a96'); }
        for (let i = 0; i < 3; i++) d.r(R(i + 20) * 12 | 0, R(i + 30) * 15 | 0, 3, 1, '#28484a'); break;
      case 'q': d.r(0, 0, 16, 16, '#1a2c2c'); // nasser Uferboden mit Pfützen und vereinzelten Schilfbüscheln
        if (R(1) < 0.5) { d.e(4 + R(2) * 8 | 0, 5 + R(3) * 7 | 0, 3, 1, '#14222a'); d.p(4 + R(2) * 8 | 0, 5 + R(3) * 7 | 0, '#2e4a56'); }
        for (let t = 0; t < (R(4) < 0.5 ? 1 : 2); t++) { const bx = 2 + R(t + 5) * 11 | 0, by = 6 + R(t + 8) * 8 | 0;
          d.r(bx, by - 3, 1, 3, '#3e4e34'); d.r(bx + 2, by - 4, 1, 4, '#3a4a30'); d.p(bx + 2, by - 5, '#6a4a2a'); }
        for (let i = 0; i < 3; i++) d.p(R(i + 11) * 16 | 0, R(i + 14) * 16 | 0, '#26403e'); break;
      case 'm': d.r(0, 0, 16, 16, '#2a2420'); for (let i = 0; i < 8; i++) d.p(R(i) * 16 | 0, R(i + 8) * 16 | 0, ['#3a3028', '#1e1a16'][i % 2]);
        for (let i = 0; i < 3; i++) { const bx = R(i + 20) * 13 | 0, by = 3 + R(i + 30) * 11 | 0; d.r(bx, by, 3, 1, '#3e4a2e'); d.p(bx + 1, by - 1, '#56603e'); }
        if (R(40) < 0.3) d.r(2, 9, 8, 2, '#18140f'); break;
      case 'c': d.r(0, 0, 16, 16, '#3a3444'); d.r(0, 7, 16, 1, '#2a2432'); d.r(7 + (y % 2) * 2, 0, 1, 7, '#2a2432'); d.r(3 + (y % 2) * 4, 8, 1, 8, '#2a2432');
        if (R(1) < 0.5) d.p(R(2) * 16 | 0, R(3) * 16 | 0, '#4a6a4a'); if (R(4) < 0.3) d.r(R(5) * 10 | 0, R(6) * 12 | 0, 4, 1, '#24202c'); break;
      case 'T': {
        grass(); const v = R(5) < 0.3;
        d.e(8, 14, 5, 1, '#142626'); d.r(7, 11, 2, 4, '#2a1c20');
        d.e(8, 7, 7, 6, v ? '#231f3c' : '#132828'); d.e(8, 6, 6, 5, v ? '#2e2850' : '#1a3836');
        d.e(6, 4, 3, 2, v ? '#3e3668' : '#24504a'); d.p(5, 3, v ? '#5a4e8a' : '#3a6a60');
        for (let i = 0; i < 5; i++) d.p(3 + R(i + 30) * 10 | 0, 4 + R(i + 60) * 7 | 0, v ? '#1a1630' : '#0e2020');
        break;
      }
      case 'x': grass(); d.e(8, 15, 5, 1, '#10181a'); d.r(7, 6, 3, 9, '#3e3a3a'); d.r(6, 13, 5, 2, '#34302e'); d.e(8, 5, 7, 4, '#3a3a36');
        for (let i = 0; i < 6; i++) d.r(2 + i * 2, 5 + (i % 3), 1, 7 + (i % 2) * 2, '#4a4a40'); d.p(4, 3, '#5a5a4e'); d.p(11, 3, '#5a5a4e'); break;
      case '~': case 'w': grass(); break; // Wasser selbst malt die Wasserebene (organisches Ufer, siehe buildWater)
      case 'b': {
        const vert = at(m, x, y - 1) === 'b' || at(m, x, y + 1) === 'b', horiz = at(m, x - 1, y) === 'b' || at(m, x + 1, y) === 'b';
        const under = [at(m, x - 1, y), at(m, x + 1, y), at(m, x, y - 1), at(m, x, y + 1)].includes('w');
        if (!under) d.r(0, 0, 16, 16, THEME.moor.g0); else if (!m._bridgeTop) grass();
        if (vert && !horiz) { d.r(3, 0, 10, 16, '#5a4632'); for (let i = 0; i < 16; i += 4) d.r(3, i, 10, 1, '#3a2c20'); d.r(3, 0, 1, 16, '#6a5440'); d.r(12, 0, 1, 16, '#2e2218'); }
        else { d.r(0, 3, 16, 10, '#5a4632'); for (let i = 0; i < 16; i += 4) d.r(i, 3, 1, 10, '#3a2c20'); d.r(0, 3, 16, 1, '#6a5440'); d.r(0, 12, 16, 1, '#2e2218'); if (vert) d.r(3, 0, 10, 16, '#5a4632'); }
        break;
      }
      case 'k': grass(); d.e(8, 11, 7, 4, '#2e2218'); d.e(8, 9, 5, 3, '#3e2e20'); d.r(4, 7, 3, 1, '#4e3a28'); d.r(9, 8, 3, 1, '#4e3a28'); break;
      case 'u': d.r(0, 0, 16, 16, '#3a3444'); d.r(0, 0, 16, 13, '#4a4656'); for (let r = 0; r < 3; r++) for (let i = 0; i < 16; i += 6) d.r(i + (r % 2) * 3, r * 4 + 3, 1, 4, '#34303e');
        d.r(0, 3, 16, 1, '#34303e'); d.r(0, 7, 16, 1, '#34303e'); d.r(0, 11, 16, 1, '#34303e'); d.r(0, 0, 16, 1, '#5e5a6c'); if (R(3) < 0.5) d.r(R(4) * 12 | 0, 0, 3, 2, '#3a6a44'); break;
      case 'B': d.r(0, 0, 16, 16, '#3a3444'); d.r(3, 2, 10, 1, '#3a3036'); d.r(4, 0, 1, 14, '#3a3036'); d.r(11, 0, 1, 14, '#3a3036'); d.e(8, 7, 3, 3, '#8a6a3a'); d.r(5, 9, 6, 2, '#8a6a3a'); d.p(7, 5, '#b8905a'); break;
      case 'f': grass(); d.r(2, 5, 2, 9, '#3e2c24'); d.r(12, 5, 2, 9, '#3e2c24'); d.r(0, 7, 16, 2, '#4e382c'); d.r(0, 11, 16, 1, '#4e382c'); break;
      case '*': grass(); for (let i = 0; i < 3; i++) { const fx = 2 + R(i + 11) * 11 | 0, fy = 3 + R(i + 22) * 10 | 0; d.p(fx, fy + 1, '#2e5a4a'); d.p(fx - 1, fy, '#b8a8f0'); d.p(fx + 1, fy, '#b8a8f0'); d.p(fx, fy - 1, '#b8a8f0'); d.p(fx, fy, '#fff4c8'); } break;
      case 'g': grass(); d.r(3, 13, 10, 2, '#2e2c3a'); d.r(4, 4, 8, 10, '#5a566a'); d.r(5, 3, 6, 1, '#5a566a'); d.r(4, 4, 8, 1, '#706c84'); d.r(7, 6, 2, 5, '#3a3648'); d.r(6, 7, 4, 1, '#3a3648'); d.p(4, 12, '#3e6a44'); break;
      case 'L': case 'e': grass(); drawLantern(d, c === 'L'); break;
      case 'S': grass(); d.r(7, 9, 2, 6, '#3e2c24'); d.r(3, 3, 10, 7, '#6a4c34'); d.r(3, 3, 10, 1, '#7e5c40'); d.r(3, 9, 10, 1, '#4a3424'); d.r(5, 5, 6, 1, '#3a2a20'); d.r(5, 7, 4, 1, '#3a2a20'); break;
      case 'A': grass(); g.drawImage(propArt('A'), 0, 0); break;
      case 'r': grass(); d.e(8, 11, 6, 4, '#48445a'); d.e(7, 9, 4, 2, '#5e5a70'); d.p(5, 8, '#7a7690'); d.p(11, 12, '#3a8a7a'); break;
      default: grass();
    }
  }
  function drawLantern(d, lit) {
    d.e(8, 15, 3, 1, '#142626'); d.r(7, 5, 2, 10, '#241e2a'); d.r(6, 14, 4, 2, '#2e2634');
    d.r(5, 1, 6, 1, '#2e2634'); d.r(4, 0, 8, 1, '#3a3244'); d.r(5, 2, 6, 4, lit ? '#ffd27a' : '#3a3a48'); d.r(7, 3, 2, 2, lit ? '#fff2c0' : '#4a4a5a');
    d.r(5, 2, 1, 4, '#2e2634'); d.r(10, 2, 1, 4, '#2e2634'); d.r(5, 6, 6, 1, '#2e2634');
  }
  function drawHouse(g, h) {
    if (h.art) return; // Mühle/Schmiede: eigene Comic-Pixel-Gebäude (BUILD), nach dem Hochskalieren gezeichnet
    const X = h.x * T, Y = h.y * T, d = G.pen(g);
    d.r(X + 2, Y + 28, 60, 20, h.hut ? '#4a3a2c' : '#584036');
    for (let i = 0; i < 5; i++) d.r(X + 2, Y + 30 + i * 4, 60, 1, h.hut ? '#3a2c20' : '#48332c');
    d.r(X + 2, Y + 28, 2, 20, '#3a2822'); d.r(X + 60, Y + 28, 2, 20, '#3a2822'); d.r(X + 2, Y + 46, 60, 2, '#2a2220');
    d.r(X + 19, Y + 33, 10, 15, '#24160f'); d.r(X + 20, Y + 34, 8, 14, '#3e2620'); d.p(X + 26, Y + 41, '#e8c070'); d.r(X + 21, Y + 47, 6, 1, h.hut ? '#3a2a1a' : '#ffb050');
    for (const wx of h.hut ? [X + 42] : [X + 36, X + 50]) {
      d.r(wx, Y + 33, 9, 8, '#24160f'); d.r(wx + 1, Y + 34, 7, 6, h.hut ? '#2a3440' : '#ffc050');
      if (!h.hut) d.r(wx + 2, Y + 35, 2, 2, '#fff0b0'); d.r(wx + 4, Y + 34, 1, 6, '#6a4028'); d.r(wx + 1, Y + 36, 7, 1, '#6a4028'); d.r(wx - 1, Y + 41, 11, 1, '#6a5048');
    }
    const roof = h.roof;
    for (let j = 0; j < 26; j++) {
      const inset = j < 4 ? 4 - j : 0;
      d.r(X + inset, Y + 4 + j, 64 - 2 * inset, 1, shade(roof, j % 4 === 3 ? -22 : Math.floor(j / 2) - 6));
      if (j % 4 === 1) for (let k = (j % 8 === 1 ? 2 : 6); k < 62; k += 8) d.p(X + k, Y + 4 + j, shade(roof, -28));
    }
    d.r(X + 4, Y + 4, 56, 1, shade(roof, 30)); d.r(X, Y + 29, 64, 2, '#1a1422');
    if (!h.hut) { d.r(X + 46, Y, 6, 9, '#4a3e46'); d.r(X + 45, Y, 8, 2, '#5e525a'); }
    else for (let i = 0; i < 8; i++) d.r(X + 4 + i * 7, Y + 5 + (i % 2), 4, 1, '#6a5a3a');
  }
  // ================= Mühle & Schmiede (Comic-Pixelstil über G.Art) =================
  // Gebäude 64×60: 12 px Überstand nach oben (Kamin, Giebel), Grundfläche 4×3 Kacheln, Tür bei Kachel x+1
  const BUILD = {};
  const hiArt = (c, k) => { c.s = k; c.lw = c.width / k; c.lh = c.height / k; return c; };
  function buildArt(kind) {
    if (BUILD[kind]) return BUILD[kind];
    const S = new G.Art.Shape();
    if (kind === 'schmiede') {
      S.R(45, 1, 11, 28, '#66606e', { name: 'chim' }).R(43, 0, 15, 4, '#56505e');
      for (const y of [8, 15, 22]) S.R(45, y, 11, 1, '#4c4856', { clip: 'chim', flat: true, line: false });
      S.P([[0, 34], [7, 14], [57, 14], [64, 34]], '#3c4660', { name: 'roof' });
      for (const y of [19, 24, 29]) S.R(0, y, 64, 1, '#2c3450', { clip: 'roof', flat: true, line: false });
      S.R(3, 33, 58, 26, '#5e5a66', { name: 'wall' });
      for (const [y, o] of [[39, 0], [45, 5], [51, 0]]) { S.R(3, y, 58, 1, '#48444f', { clip: 'wall', flat: true, line: false }); for (let x = 6 + o; x < 60; x += 10) S.R(x, y - 5, 1, 5, '#48444f', { clip: 'wall', flat: true, line: false }); }
      S.R(3, 33, 58, 3, '#4a3428');
      S.R(18, 39, 12, 20, '#3a2418', { name: 'door' }).R(23.5, 40, 1, 19, '#2a1810', { clip: 'door', flat: true, line: false }).E(27, 50, 1, 1, '#e0b060', { clip: 'door', flat: true });
      S.R(36, 39, 20, 13, '#1c1210', { name: 'forge' }).R(38, 42, 16, 9, '#ff8c3a', { glow: true, clip: 'forge' }).E(46, 49, 6, 2.6, '#ffe2a0', { glow: true, clip: 'forge' });
      S.R(35, 52, 22, 2, '#48444f');
      S.C(8, 36, 8, 40, 1, '#2a2020').R(3, 40, 11, 7, '#6a4a30', { name: 'sign' }).R(5, 42, 7, 2, '#2e2a34', { clip: 'sign', flat: true }).R(7, 44, 3, 2, '#2e2a34', { clip: 'sign', flat: true });
    } else if (kind === 'kirche') {
      // Mondkirche 64×84 (36 px über der Grundfläche), feiner gerastert (2×): Schieferdach, Turm mit Mondsichel, Rosette, Spitzbogenfenster
      S.P([[0, 55], [9, 30], [55, 30], [64, 55]], '#3c3a5c', { name: 'roof' });
      for (const y of [35, 40, 45, 50]) S.R(0, y, 64, 0.8, '#2c2a48', { clip: 'roof', flat: true, line: false });
      for (let x = 4; x < 62; x += 5) S.R(x, 30, 0.6, 25, '#34325a', { clip: 'roof', flat: true, line: false, alpha: 0.6 });
      S.R(3, 53, 58, 30, '#aaa2b8', { name: 'wall' });
      for (const [y, o] of [[59, 0], [65, 4], [71, 0], [77, 4]]) { S.R(3, y, 58, 0.8, '#8a8298', { clip: 'wall', flat: true, line: false }); for (let x = 5 + o; x < 61; x += 8) S.R(x, y - 6, 0.8, 6, '#8a8298', { clip: 'wall', flat: true, line: false }); }
      S.R(3, 53, 58, 2.2, '#6e6882', { clip: 'wall', flat: true, line: false });
      S.R(1, 55, 4, 28, '#8e869e').R(59, 55, 4, 28, '#8e869e');                                       // Strebepfeiler
      S.R(24, 14, 16, 40, '#b4acc2', { name: 'tower' });
      for (const y of [22, 30, 38, 46]) S.R(24, y, 16, 0.8, '#948ca6', { clip: 'tower', flat: true, line: false });
      S.R(36, 14, 4, 40, '#9a92ac', { clip: 'tower', flat: true, line: false, alpha: 0.7 });
      S.P([[22, 15.5], [32, 4], [42, 15.5]], '#34325a', { name: 'spire' });
      S.R(32, 4, 4, 12, '#2a2848', { clip: 'spire', flat: true, line: false, alpha: 0.6 });
      S.E(32, 2.6, 2.2, 2.2, '#eef4ff', { glow: true }).E(33.1, 2, 1.7, 1.7, '#34325a', { flat: true, line: false });  // Mondsichel
      S.R(29, 18, 6, 8, '#1c1830', { name: 'bell' }).E(32, 18, 3, 2.4, '#1c1830').E(32, 23, 1.8, 1.6, '#d8b060', { clip: 'bell' });
      S.E(32, 37, 5.4, 5.4, '#3a3050', { name: 'rose' }).E(32, 37, 4.2, 4.2, '#b8a0f0', { glow: true, clip: 'rose' }).E(32, 37, 1.4, 1.4, '#fff0c8', { glow: true, clip: 'rose' });
      for (let i = 0; i < 4; i++) { const a = i * Math.PI / 4; S.C(32 - Math.cos(a) * 4.2, 37 - Math.sin(a) * 4.2, 32 + Math.cos(a) * 4.2, 37 + Math.sin(a) * 4.2, 0.6, '#3a3050', { clip: 'rose', flat: true, line: false }); }
      for (const wx of [6, 52]) {                                                                    // Spitzbogenfenster mit warmem Licht
        S.P([[wx, 70], [wx, 61], [wx + 3, 57], [wx + 6, 61], [wx + 6, 70]], '#241a28', { name: 'w' + wx });
        S.P([[wx + 1, 69], [wx + 1, 61.5], [wx + 3, 58.6], [wx + 5, 61.5], [wx + 5, 69]], '#ffc868', { glow: true, clip: 'w' + wx });
        S.R(wx + 2.7, 58, 0.6, 12, '#4a3040', { clip: 'w' + wx, flat: true, line: false }).R(wx, 64, 6, 0.6, '#4a3040', { clip: 'w' + wx, flat: true, line: false });
      }
      S.P([[18, 83], [18, 69], [24, 63.5], [30, 69], [30, 83]], '#4a2e22', { name: 'door' });
      S.R(23.7, 64, 0.6, 19, '#2e1a12', { clip: 'door', flat: true, line: false });
      for (const y of [70, 77]) S.R(18, y, 12, 1, '#7a6a5a', { clip: 'door', flat: true, line: false });
      S.E(26.4, 75, 0.9, 0.9, '#e0b060', { flat: true }).E(21.6, 75, 0.9, 0.9, '#e0b060', { flat: true });
      S.E(24, 60, 1.6, 1.6, '#eef4ff', { glow: true });
      S.R(16, 82.6, 16, 1.4, '#6a6478');
      S.E(44, 80, 2.4, 3, '#5a8a6a').E(46.5, 81, 1.8, 2.4, '#4a7a5a').E(44.6, 78, 0.9, 0.9, '#d8c8f0', { flat: true });         // Blumen beim Eingang
      return (BUILD[kind] = hiArt(G.Art.raster(S, 128, 168, 2, { bold: true }), 2));
    } else if (kind.startsWith('leuchtturm')) {
      // Leuchtturm 64×112 (64 px über der Grundfläche): verjüngter Turm mit gedämpft roten Bändern, Wärterhäuschen rechts
      const lit = kind === 'leuchtturm_lit';
      S.P([[34, 81], [49, 68], [64, 81]], '#4a3a4e', { name: 'aroof' });
      for (const y of [74, 78]) S.R(34, y, 30, 1, '#3a2c40', { clip: 'aroof', flat: true, line: false });
      S.R(36, 80, 26, 31, '#8a8278', { name: 'awall' });
      for (const y of [87, 94, 101]) S.R(36, y, 26, 1, '#6e675f', { clip: 'awall', flat: true, line: false });
      S.R(45, 87, 10, 9, '#241a18', { name: 'awin' }).R(46, 88, 8, 7, lit ? '#ffc050' : '#28303e', lit ? { glow: true, clip: 'awin' } : { clip: 'awin' });
      S.R(49.5, 88, 1, 7, '#3a2a22', { clip: 'awin', flat: true, line: false });
      S.P([[11, 111], [15, 31], [33, 31], [37, 111]], '#b4aca0', { name: 'tower' });
      for (const [y0, y1] of [[44, 56], [72, 84]]) S.R(0, y0, 48, y1 - y0, '#84463f', { clip: 'tower', flat: true, line: false });
      S.R(28, 31, 10, 80, '#8e877c', { clip: 'tower', flat: true, line: false, alpha: 0.5 });
      S.E(24, 64, 2.4, 3.2, lit ? '#e8b060' : '#241a18', { flat: true });
      S.R(18, 93, 12, 18, '#3a2418', { name: 'door' }).R(23.5, 94, 1, 17, '#2a1810', { clip: 'door', flat: true, line: false }).E(27, 103, 1, 1, '#e0b060', { clip: 'door', flat: true });
      S.R(16, 11, 16, 17, lit ? '#ffe2a0' : '#26303e', lit ? { glow: true, name: 'glass' } : { name: 'glass' });
      if (lit) S.E(24, 19, 5, 5, '#fffae8', { glow: true, clip: 'glass' }); else S.E(24, 19, 4, 4, '#3a4454', { clip: 'glass' });
      S.R(19.5, 11, 1, 17, '#3a3444', { clip: 'glass', flat: true, line: false }).R(27.5, 11, 1, 17, '#3a3444', { clip: 'glass', flat: true, line: false });
      S.P([[13, 12], [24, 3], [35, 12]], '#3a3448');
      S.E(24, 2.6, 1.6, 1.6, '#8a7a5a');
      S.R(9, 27, 30, 4, '#3a3444');
      for (let x = 10; x <= 38; x += 4) S.R(x, 22, 1, 5, '#3a3444', { flat: true, line: false });
      S.R(9, 21.5, 30, 1, '#3a3444', { flat: true });
    } else {
      S.P([[1, 36], [16, 7], [48, 7], [63, 36]], '#7c5c3c', { name: 'roof' });
      for (const y of [13, 19, 25, 31]) S.C(4, y, 60, y, 1, '#5e4428', { clip: 'roof', flat: true, line: false });
      S.E(32, 22, 4.5, 4.5, '#2a1c14', { name: 'gw' }).E(32, 22, 3, 3, '#ffc868', { glow: true, clip: 'gw' });
      S.R(4, 34, 56, 25, '#b0a48e', { name: 'wall' });
      for (const x of [4, 17, 32, 46, 58]) S.R(x, 34, 2.4, 25, '#4a3222', { clip: 'wall', flat: true, line: false });
      S.R(4, 34, 56, 2.4, '#4a3222', { clip: 'wall', flat: true, line: false }).R(4, 46, 56, 2, '#4a3222', { clip: 'wall', flat: true, line: false });
      S.C(34, 36, 45, 46, 1.8, '#4a3222', { clip: 'wall', flat: true, line: false }).C(48, 46, 57, 36, 1.8, '#4a3222', { clip: 'wall', flat: true, line: false });
      S.R(19, 40, 11, 19, '#4a2e1e', { name: 'door' }).E(27, 50, 1, 1, '#e0b060', { clip: 'door', flat: true });
      S.R(35, 49, 10, 8, '#2a1c14', { name: 'win' }).R(36, 50, 8, 6, '#ffc050', { glow: true, clip: 'win' }).R(39.5, 50, 1, 6, '#4a3222', { clip: 'win', flat: true }).R(36, 52.5, 8, 1, '#4a3222', { clip: 'win', flat: true });
      S.E(10, 55, 4, 4, '#d8c8a0').E(10, 51.5, 2.5, 1.4, '#b8a880');
    }
    return (BUILD[kind] = G.Art.raster(S, 64, kind.startsWith('leuchtturm') ? 112 : 60, 1));
  }
  // Wasserrad: 12 Einzelbilder über 45° (8 Speichen -> nahtlos), 30×30
  const WHEEL = [];
  function wheelFrames() {
    if (WHEEL.length) return WHEEL;
    for (let f = 0; f < 12; f++) {
      const S = new G.Art.Shape(), a0 = f / 12 * Math.PI / 4, cx = 15, cy = 15, wood = '#6a4c34', wood2 = '#4e3624';
      for (let i = 0; i < 8; i++) { const a = a0 + i * Math.PI / 4, c = Math.cos(a), s2 = Math.sin(a);
        S.C(cx + c * 12.5 - s2 * 3, cy + s2 * 12.5 + c * 3, cx + c * 12.5 + s2 * 3, cy + s2 * 12.5 - c * 3, 2.2, wood2, { g: 'pad' }); }
      for (let i = 0; i < 16; i++) { const a = a0 + i * Math.PI / 8, b = a + Math.PI / 8; S.C(cx + Math.cos(a) * 11, cy + Math.sin(a) * 11, cx + Math.cos(b) * 11, cy + Math.sin(b) * 11, 2.2, wood, { g: 'rim' }); }
      for (let i = 0; i < 8; i++) { const a = a0 + i * Math.PI / 4; S.C(cx, cy, cx + Math.cos(a) * 10.5, cy + Math.sin(a) * 10.5, 1.6, wood, { g: 'spoke' }); }
      S.E(cx, cy, 2.8, 2.8, '#3a2a1e');
      WHEEL.push(G.Art.raster(S, 30, 30, 1));
    }
    return WHEEL;
  }
  // Requisiten-Kacheln 16×16 (Amboss, Esse, Fass, Mühlstein, Säcke)
  const PROP = {};
  function propArt(c) {
    if (PROP[c]) return PROP[c];
    const S = new G.Art.Shape();
    if (c === 'A') { S.E(8, 14.5, 6, 1.5, '#1a1420', { flat: true, alpha: 0.5, noOutline: true }); S.R(6, 9, 4, 5, '#3a3a46').R(4, 13, 8, 2, '#3a3a46'); S.P([[1, 5], [15, 5], [13, 9], [3, 9]], '#5a5c6c', { name: 'top' }); S.P([[1, 5], [-1, 6], [1, 7]], '#5a5c6c'); }
    if (c === 'F') { S.R(0, 2, 16, 13, '#5a5460', { name: 'st' }); S.R(2, 6, 12, 8, '#1a1010', { name: 'pit' }); S.R(3, 10, 10, 4, '#ff8a38', { glow: true, clip: 'pit' }); S.E(8, 12, 4, 1.6, '#ffe0a0', { glow: true, clip: 'pit' }); S.R(0, 2, 16, 2, '#6e6878'); }
    if (c === 'K') { S.E(8, 9, 6, 6, '#6a4a30', { name: 'barrel' }); S.R(2, 6, 12, 1.2, '#3a3a44', { clip: 'barrel', flat: true, line: false }).R(2, 11, 12, 1.2, '#3a3a44', { clip: 'barrel', flat: true, line: false }); S.E(8, 4.5, 5, 1.6, '#3a5a7a'); }
    if (c === 'Q') { S.R(1, 9, 14, 6, '#5a4232'); S.E(8, 8, 7, 5, '#8a8480', { name: 'stone' }); S.E(8, 7, 1.6, 1.2, '#3a3438', { flat: true }); }
    return (PROP[c] = G.Art.raster(S, 16, 16, 1));
  }
  const SACK = (() => { const S = new G.Art.Shape(); S.E(5, 11, 4.5, 4.5, '#d8c8a0').E(11, 12, 4.5, 3.8, '#c8b890').E(5, 7, 2, 1.2, '#b8a880'); return () => G.Art.raster(S, 16, 16, 1); })();
  // Nebel-Masken & Karten vorzeichnen (lazy)
  // ================= Wasser =================
  // Uferlinie: bilinear interpoliertes Kachelfeld (Wasser=1) + Wertrauschen -> organische Kurven statt Rechtecke.
  // Tiefe: BFS-Abstand zum Land, interpoliert -> in der Mitte dunkler. Kollision bleibt kachelbasiert.
  function vnoise(x, y, s) {
    const xi = Math.floor(x), yi = Math.floor(y), xf = x - xi, yf = y - yi, u = xf * xf * (3 - 2 * xf), v = yf * yf * (3 - 2 * yf);
    const a = hash(xi, yi, s), b = hash(xi + 1, yi, s), c = hash(xi, yi + 1, s), d = hash(xi + 1, yi + 1, s);
    return a + (b - a) * u + (c - a) * v + (a - b - c + d) * u * v;
  }
  const WATER_PAL = {
    dorf: { sh: [46, 72, 102], dp: [12, 20, 44], edge: [96, 128, 160], mud: [70, 62, 46], reed: '#35523e', reedTip: '#7a6040', pad: '#2f5a3a', padHi: '#4a7a4a', flower: '#e8b8d0', stone: '#5a5a62', stoneHi: '#7a7a84', shim: '170,200,255' },
    moor: { sh: [36, 62, 74], dp: [16, 26, 40], edge: [96, 130, 130], mud: [56, 46, 32], reed: '#3e4c30', reedTip: '#6a4a2a', pad: '#2c4a2e', padHi: '#46663e', flower: '#e8e4f4', stone: '#4a4a4e', stoneHi: '#66666c', shim: '150,220,190' }
  };
  function buildWater(m, g) {
    if (m.kind !== 'outdoor') return;
    const isWc = c => c === '~' || c === 'w';
    const wt = (x, y) => { const c = at(m, x, y); if (isWc(c)) return 1;
      if (c === 'b') return [at(m, x - 1, y), at(m, x + 1, y), at(m, x, y - 1), at(m, x, y + 1)].some(isWc) ? 1 : 0; return 0; };
    let any = false; const V = [], Dd = [];
    for (let y = 0; y < m.h; y++) { V.push([]); Dd.push([]); for (let x = 0; x < m.w; x++) { const v = wt(x, y); V[y].push(v); Dd[y].push(v ? 99 : 0); if (v) any = true; } }
    if (!any) { m.waterMask = null; return; }
    // Tiefe per BFS
    const q = []; for (let y = 0; y < m.h; y++) for (let x = 0; x < m.w; x++) if (!V[y][x]) q.push([x, y]);
    while (q.length) { const [x, y] = q.shift(); for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) { const nx = x + dx, ny = y + dy;
      if (nx < 0 || ny < 0 || nx >= m.w || ny >= m.h) continue; if (Dd[ny][nx] > Dd[y][x] + 1) { Dd[ny][nx] = Dd[y][x] + 1; q.push([nx, ny]); } } }
    const Dc = Dd.map(r => r.map(d => Math.min(d, 4)));
    const gv = (A, x, y) => A[Math.max(0, Math.min(m.h - 1, y))][Math.max(0, Math.min(m.w - 1, x))];
    const bil = (A, u, v) => { const x0 = Math.floor(u), y0 = Math.floor(v), fx = u - x0, fy = v - y0;
      const a = gv(A, x0, y0), b = gv(A, x0 + 1, y0), c = gv(A, x0, y0 + 1), d = gv(A, x0 + 1, y0 + 1);
      return (a * (1 - fx) + b * fx) * (1 - fy) + (c * (1 - fx) + d * fx) * fy; };
    // Alles auf feinen Pixeln (S = Auflösungsfaktor der Kartenleinwand): weichere Ufer, feinere Körnung und Deko
    const S = g.canvas.s || 1, LW = m.w * T, LH = m.h * T, W = LW * S, H = LH * S, TS = T * S;
    const img = g.getImageData(0, 0, W, H), px = img.data;
    const mask = S > 1 ? G.mkHi(LW, LH, S) : G.mk(W, H), mg = mask.getContext('2d'), mimg = mg.createImageData(W, H), mp = mimg.data;
    const P = WATER_PAL[m.theme] || WATER_PAL.dorf, F = new Float32Array(W * H);
    const near = (tx, ty) => { for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) if (gv(V, tx + dx, ty + dy)) return true; return false; };
    for (let ty = 0; ty < m.h; ty++) for (let tx = 0; tx < m.w; tx++) {
      if (!near(tx, ty)) continue;
      for (let yy = 0; yy < TS; yy++) for (let xx = 0; xx < TS; xx++) {
        // Comic-Pixelstil: je logischem Pixel ein Wert (1 Kunstpixel = 1 logischer Pixel), flache Farbbänder
        const X = tx * TS + xx, Y = ty * TS + yy, lx = (X / S | 0) + 0.5, ly = (Y / S | 0) + 0.5, u = lx / T - 0.5, v = ly / T - 0.5;
        const f = bil(V, u, v) + (vnoise(lx * 0.075, ly * 0.075, 31) - 0.5) * 0.3 + (vnoise(lx * 0.3, ly * 0.3, 32) - 0.5) * 0.06;
        const i = Y * W + X; F[i] = f; const o = i * 4;
        if (f > 0.5) {
          const dq = bil(Dc, u, v) + (f - 0.5) * 2, lvl = dq > 2.6 ? 2 : dq > 1.5 ? 1 : 0;   // drei Tiefenstufen
          const base = lvl === 2 ? P.dp : lvl === 1 ? [(P.sh[0] + P.dp[0]) / 2, (P.sh[1] + P.dp[1]) / 2, (P.sh[2] + P.dp[2]) / 2] : P.sh;
          let [r, gg, b] = base;
          // stehende Wellenstriche: kurze, helle Striche in festen Reihen (Bewegung kommt aus renderWater)
          if (lvl < 2 && (ly | 0) % 7 === 3 && hash((lx / 5) | 0, ly | 0, 36) < 0.28) { r += 14; gg += 18; b += 24; }
          if (f < 0.522) { r = 14; gg = 18; b = 30; }                                   // dunkle Uferkontur
          else if (f < 0.56) { r = P.edge[0]; gg = P.edge[1]; b = P.edge[2]; }           // heller Saum
          else if (f < 0.6) { r *= 0.8; gg *= 0.8; b *= 0.86; }                           // Schatten unter der Kante
          px[o] = r; px[o + 1] = gg; px[o + 2] = b; mp[o] = mp[o + 1] = mp[o + 2] = 255; mp[o + 3] = 255;
        } else if (f > 0.42) { // Ufersaum: flacher Schlamm-/Sandstreifen
          const a = f > 0.455 ? 1 : 0.5;
          px[o] += (P.mud[0] - px[o]) * a; px[o + 1] += (P.mud[1] - px[o + 1]) * a; px[o + 2] += (P.mud[2] - px[o + 2]) * a;
        }
      }
    }
    g.putImageData(img, 0, 0); mg.putImageData(mimg, 0, 0);
    // Brückenstege wieder obenauf (1× gezeichnet, gleich hochskaliert wie die Karte)
    if (m.tiles.some(r => r.includes('b'))) {
      mg.globalCompositeOperation = 'destination-out'; for (let y = 0; y < m.h; y++) for (let x = 0; x < m.w; x++) if (m.tiles[y][x] === 'b') mg.fillRect(x * T + 2, y * T + 2, 12, 12); mg.globalCompositeOperation = 'source-over';
    }
    // Deko im Comic-Pixelstil (Art-Sprites, logische Koordinaten): Schilf mit Rohrkolben, Ufersteine, Seerosenblätter
    const Fa = (X, Y) => (X < 0 || Y < 0 || X >= W || Y >= H) ? 0 : F[Y * W + X];
    const blocked = (lx, ly) => { const c = at(m, lx / T | 0, ly / T | 0); return c === 'b' || c === ',' || c === 'D' || c === 'h' || c === 'S' || c === 'L' || c === 'e'; };
    const moor = m.theme === 'moor'; let moonBest = [];
    for (let ty = 0; ty < m.h; ty++) for (let tx = 0; tx < m.w; tx++) {
      if (!near(tx, ty)) continue;
      for (let k = 0; k < 6; k++) {
        const lx = tx * T + (hash(tx, ty, 40 + k) * T | 0), ly = ty * T + (hash(tx, ty, 50 + k) * T | 0), f = Fa(lx * S, ly * S), r = hash(tx, ty, 60 + k);
        if (blocked(lx, ly)) continue;
        if (f > 0.4 && f < 0.49 && r < 0.4) g.drawImage(G.Tiles.reed((hash(lx, ly, 61) * 4 | 0) + (moor ? 1 : 0)), lx - 4, ly - 10);
        else if (f > 0.46 && f < 0.53 && r < 0.14) g.drawImage(G.Tiles.stone(moor), lx - 3, ly - 2);
        else if (f > 0.64 && f < 0.95 && r < 0.12 && Fa((lx - 4) * S, ly * S) > 0.6 && Fa((lx + 4) * S, ly * S) > 0.6) g.drawImage(G.Tiles.pad(hash(lx, ly, 64) < 0.3, moor), lx - 4, ly - 3);
      }
      if (V[ty][tx] && Dd[ty][tx] >= 2) moonBest.push([Dd[ty][tx] + hash(tx, ty, 70), tx, ty]);
    }
    moonBest.sort((a, b) => b[0] - a[0]);
    m.moonRefs = moonBest.slice(0, m === D ? 1 : 2).map(([, x, y]) => [x * T + 8, y * T + 6]);
    if (!m.moonRefs.length) { const f = []; for (let y = 0; y < m.h; y++) for (let x = 0; x < m.w; x++) if (V[y][x]) f.push([x, y]); if (f.length) { const c = f[f.length >> 1]; m.moonRefs = [[c[0] * T + 8, c[1] * T + 6]]; } }
    m.waterMask = mask; m.waterPal = P; m.waterV = V;
    try { const s = S > 1 ? G.mkHi(LW, LH, S) : G.mk(W, H), sg = s.getContext('2d'); sg.filter = `blur(${5 * S}px)`; sg.drawImage(mask, 0, 0); sg.filter = 'none'; sg.drawImage(mask, 0, 0); m.waterMaskSoft = s; } catch (e) { m.waterMaskSoft = null; }
  }
  // Laufzeit-Ebenen in doppelter Auflösung (weiche Verläufe, feine Wellenlinien)
  const waterC = G.mkHi(VW, VH), wg = waterC.getContext('2d');
  const wfogC = G.mkHi(VW, VH), wfg = wfogC.getContext('2d'); wfg.imageSmoothingEnabled = true;
  function renderWater(ctx, m, cx, cy, t) {
    if (!m.waterMask) return;
    const P = m.waterPal, V = m.waterV;
    wg.globalCompositeOperation = 'source-over'; wg.clearRect(0, 0, VW, VH);
    const x0 = Math.max(0, Math.floor(cx / T) - 1), y0 = Math.max(0, Math.floor(cy / T) - 1), x1 = Math.min(m.w - 1, x0 + 18), y1 = Math.min(m.h - 1, y0 + 17);
    let vis = false;
    // Kräuseln & Schimmer: kurze helle Linien, die langsam auftauchen und seitlich treiben
    for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) {
      if (!V[y][x]) continue; vis = true;
      for (let k = 0; k < 3; k++) {
        const ph = (t * (0.22 + hash(x, y, 80 + k) * 0.18) + hash(x, y, 90 + k)) % 1, a = Math.sin(ph * Math.PI);
        const lx = Math.round(x * T + hash(x, y, 100 + k) * 12 + Math.sin(t * 0.7 + x + k) * 2 - cx), ly = Math.round(y * T + 2 + k * 5 + hash(x, y, 110 + k) * 3 - cy), lw = 2 + (hash(x, y, 120 + k) * 4 | 0);
        wg.fillStyle = `rgba(${P.shim},${0.26 * a})`; wg.fillRect(lx, ly, lw, 0.5); wg.fillStyle = `rgba(${P.shim},${0.1 * a})`; wg.fillRect(lx + 0.5, ly + 0.5, lw - 1, 0.5);
        if (a > 0.8 && k === 0) { wg.fillStyle = `rgba(${P.shim},0.4)`; wg.fillRect(lx + 1, ly - 0.5, 0.5, 0.5); }
      }
    }
    if (!vis) return;
    // Mondspiegelung: senkrechte, flimmernde Lichtsäule an der tiefsten Stelle
    for (const [mx, my] of m.moonRefs || []) {
      const bx = mx - cx, by = my - cy; if (bx < -20 || by < -30 || bx > VW + 20 || by > VH + 30) continue;
      const gr = wg.createRadialGradient(bx, by, 0, bx, by, 16); gr.addColorStop(0, 'rgba(220,226,255,0.16)'); gr.addColorStop(1, 'rgba(220,226,255,0)');
      wg.fillStyle = gr; wg.fillRect(bx - 16, by - 16, 32, 32);
      for (let i = -8; i <= 8; i++) { const wdt = Math.max(0.5, 5 - Math.abs(i) * 0.5) + (Math.sin(t * 3 + i) > 0.6 ? 0.5 : 0), ox = Math.round(Math.sin(t * 1.8 + i * 0.45) * 3) / 2;
        wg.fillStyle = `rgba(236,236,255,${0.55 - Math.abs(i) * 0.045})`; wg.fillRect(Math.round(bx * 2 - wdt) / 2 + ox, by + i, wdt, 0.5); }
    }
    // Laternen spiegeln sich als warme, zitternde Streifen im Wasser
    for (const L of lightsFor(m)) {
      if (!L.warm || (L.cond && !L.cond())) continue;
      const lx = L.x - cx, ly = L.y - cy; if (lx < -20 || lx > VW + 20 || ly < -60 || ly > VH + 10) continue;
      for (let i = 0; i < 28; i++) { const yy = ly + 10 + i, wdt = 3 - (i > 18 ? 1 : 0) + (Math.sin(t * 4 + i * 0.5) > 0.3 ? 0.5 : 0), ox = Math.round(Math.sin(t * 2.2 + i * 0.4) * 3) / 2;
        wg.fillStyle = `rgba(255,190,110,${0.42 * (1 - i / 28)})`; wg.fillRect(Math.round(lx * 2 - wdt) / 2 + ox, yy, wdt, 0.5); }
    }
    wg.globalCompositeOperation = 'destination-in'; wg.drawImage(m.waterMask, -cx, -cy); wg.globalCompositeOperation = 'source-over';
    ctx.drawImage(waterC, 0, 0);
    // Leichter Nebel über dem Nebelsee (und schwach über dem Graben)
    if (m.theme === 'moor') {
      wfg.globalCompositeOperation = 'source-over'; wfg.clearRect(0, 0, VW, VH);
      for (let i = 0; i < 22; i++) {
        const fx = ((hash(i, 1, 130) * m.w * T + t * (4 + hash(i, 2, 131) * 5)) % (m.w * T + 60)) - 30 - cx, fy = hash(i, 3, 132) * m.h * T * 0.35 + (i % 2 ? m.h * T * 0.86 : 0) - cy, r = 26 + hash(i, 4, 133) * 22;
        if (fx < -r || fx > VW + r || fy < -r || fy > VH + r) continue;
        const gr = wfg.createRadialGradient(fx, fy, 0, fx, fy, r); gr.addColorStop(0, 'rgba(206,214,232,0.34)'); gr.addColorStop(1, 'rgba(206,214,232,0)');
        wfg.fillStyle = gr; wfg.fillRect(fx - r, fy - r, r * 2, r * 2);
      }
      wfg.globalCompositeOperation = 'destination-in'; wfg.drawImage(m.waterMaskSoft || m.waterMask, -cx, -cy); wfg.globalCompositeOperation = 'source-over';
      ctx.drawImage(wfogC, 0, 0);
    }
  }
  // Ruhiger Hintergrund: unruhige Bodenkacheln (Gras, Nebelgras, Bäume, Schilf) leicht entsättigen und im Kontrast
  // dämpfen, damit Figuren und Geister mit Kontur klar davor stehen (einmalig beim Vorrendern, kostet keine Bildrate)
  const CALM = new Set(['.', '"', 'T', '*', 'q', 'm', 'r']);
  function calmGround(m, g) {
    if (m.kind !== 'outdoor') return;
    g.save();
    for (let y = 0; y < m.h; y++) for (let x = 0; x < m.w; x++) {
      if (!CALM.has(m.tiles[y][x])) continue;
      g.globalCompositeOperation = 'saturation'; g.globalAlpha = 0.22; g.fillStyle = '#808080'; g.fillRect(x * T, y * T, T, T);
      g.globalCompositeOperation = 'source-over'; g.globalAlpha = 0.1; g.fillStyle = '#1c2230'; g.fillRect(x * T, y * T, T, T);
    }
    g.restore();
  }
  function prerender(m) {
    if (m.canvas) return;
    const c = G.mk(m.w * T, m.h * T), g = c.getContext('2d');
    if (m.kind === 'outdoor') { prerenderOutdoor(m, c, g); return; }
    for (let y = 0; y < m.h; y++) for (let x = 0; x < m.w; x++) {
      const ch = m.tiles[y][x];
      g.save(); g.translate(x * T, y * T); drawTile(g, m, x, y, ch === 'h' || ch === 'D' ? '.' : ch); g.restore();
    }
    m.houses.forEach(h => drawHouse(g, h));
    // Hochauflösung: Karte kantengerichtet verdoppeln, feine Bodendetails ergänzen, Wasser auf feinen Pixeln bauen
    const hi = G.scale2x(c), hg = hi.getContext('2d');
    // Gravuren, Schrift und Kerzen bleiben scharfkantig (Scale2x würde Kreuze und Linien verrunden)
    const CRISP = new Set(['g', 'S', 'c', 'u', 'B', 'A', 'F', 'K', 'Q']);
    for (let y = 0; y < m.h; y++) for (let x = 0; x < m.w; x++) if (CRISP.has(m.tiles[y][x])) hg.drawImage(c, x * T, y * T, T, T, x * T, y * T, T, T);
    fineGround(m, hg);
    calmGround(m, hg);
    for (const h of m.houses) if (h.art) hg.drawImage(buildArt(h.art), h.x * T, h.y * T - 12);
    buildWater(m, hg);
    m.canvas = hi;
    prerenderFx(m);
  }
  // Aussenkarten im Comic-Pixelstil (G.Tiles): flacher Boden 1:1 (ohne Scale2x/Körnung), Wasser, dann Objekte und Häuser
  function prerenderOutdoor(m, c, g) {
    for (let y = 0; y < m.h; y++) for (let x = 0; x < m.w; x++) {
      const ch = m.tiles[y][x];
      g.save(); g.translate(x * T, y * T); G.Tiles.ground(g, m, x, y, ch === 'h' ? '.' : ch === 'D' ? (m.theme === 'moor' ? 'b' : ',') : ch); g.restore();
    }
    const hi = G.mkHi(m.w * T, m.h * T, 2), hg = hi.getContext('2d');
    hg.drawImage(c, 0, 0);
    calmGround(m, hg);
    buildWater(m, hg);
    G.Tiles.objects(hg, m);
    for (let y = 0; y < m.h; y++) for (let x = 0; x < m.w; x++) if (m.tiles[y][x] === 'A') hg.drawImage(propArt('A'), x * T, y * T);
    for (const h of m.houses) { const a = h.art ? buildArt(h.art) : G.Tiles.house(h); hg.drawImage(a, h.x * T, h.y * T - (h.oy || 12), a.lw || a.width, a.lh || a.height); }
    m.canvas = hi;
    prerenderFx(m);
  }
  function prerenderFx(m) {
    // Nebelbank-Maske: weiche, überlappende Wolken je Zonenkachel, heller Saum an Rändern
    const z = G.mk(m.w * T, m.h * T), zg = z.getContext('2d'); let any = false;
    if (m.kind === 'outdoor') for (let y = 0; y < m.h; y++) for (let x = 0; x < m.w; x++) {
      const zone = ZONE_OF[m.tiles[y][x]]; if (!zone || m.theme === 'cave') continue; any = true;
      const col = ZONE_TINT[zone];
      for (let i = 0; i < 3; i++) {
        const bx = x * T + 3 + hash(x, y, 50 + i) * 10, by = y * T + 3 + hash(x, y, 60 + i) * 10, r = 11 + hash(x, y, 70 + i) * 5;
        const gr = zg.createRadialGradient(bx, by, 0, bx, by, r);
        gr.addColorStop(0, `rgba(${col},0.55)`); gr.addColorStop(0.6, `rgba(${col},0.35)`); gr.addColorStop(1, `rgba(${col},0)`);
        zg.fillStyle = gr; zg.fillRect(bx - r, by - r, r * 2, r * 2);
      }
      // oberer Rand einer Bank: hellere, sich kräuselnde Kante (von aussen erkennbar)
      if (!ZONE_OF[at(m, x, y - 1)]) for (let i = 0; i < 3; i++) {
        const bx = x * T + 2 + i * 6, by = y * T + 2 + hash(x, y, 80 + i) * 3, r = 6;
        const gr = zg.createRadialGradient(bx, by, 0, bx, by, r);
        gr.addColorStop(0, `rgba(${col},0.55)`); gr.addColorStop(1, `rgba(${col},0)`);
        zg.fillStyle = gr; zg.fillRect(bx - r, by - r, r * 2, r * 2);
      }
    }
    m.zoneFog = any ? z : null;
    // atmosphärische Nebelschwaden & Glühwürmchen
    m.fog = []; m.flies = [];
    const n = m.kind === 'outdoor' ? (m.theme === 'moor' ? 30 : 16) : 0;
    for (let i = 0; i < n; i++) m.fog.push({ x: Math.random() * m.w * T, y: Math.random() * m.h * T, r: 36 + Math.random() * 50, vx: 3 + Math.random() * 6, ph: Math.random() * 9 });
    const nf = m.kind === 'outdoor' ? 50 : 6;
    for (let i = 0; i < nf; i++) m.flies.push({ x: Math.random() * m.w * T, y: Math.random() * m.h * T, ph: Math.random() * 99, c: Math.random() < 0.6 ? '216,255,150' : '140,240,224' });
    m.ghosts = [];
  }
  // Rausch-Textur für wandernde Nebelschichten (kachelbar 128x128)
  const NOISE = G.mk(128, 128); {
    const g = NOISE.getContext('2d');
    for (let i = 0; i < 40; i++) {
      const x = Math.random() * 128, y = Math.random() * 128, r = 8 + Math.random() * 20;
      for (const [ox, oy] of [[0, 0], [128, 0], [-128, 0], [0, 128], [0, -128], [128, 128], [-128, -128], [128, -128], [-128, 128]]) {
        const gr = g.createRadialGradient(x + ox, y + oy, 0, x + ox, y + oy, r);
        gr.addColorStop(0, 'rgba(0,0,0,0.55)'); gr.addColorStop(1, 'rgba(0,0,0,0)');
        g.fillStyle = gr; g.fillRect(x + ox - r, y + oy - r, r * 2, r * 2);
      }
    }
  }
  const GHOST1 = G.mk(12, 14); {
    const d = G.pen(GHOST1.getContext('2d'));
    d.e(6, 5, 4, 4, '#e8ecff'); d.r(2, 5, 9, 6, '#e8ecff'); d.r(2, 11, 2, 2, '#e8ecff'); d.r(5, 11, 2, 3, '#e8ecff'); d.r(8, 11, 2, 2, '#e8ecff');
    d.r(4, 5, 1, 2, '#3a3a5a'); d.r(7, 5, 1, 2, '#3a3a5a');
  }
  const GHOST = G.scale2x(GHOST1);
  // entzündete Laterne als fertige, hochskalierte Grafik
  // Feine Bodendetails auf der verdoppelten Karte: leichte Körnung überall, mondbeschienene Grashalm-Spitzen,
  // Kiesel auf Wegen, Fugen-Glanz auf Dielen
  function fineGround(m, g) {
    const S = g.canvas.s || 1; if (S < 2) return;
    const W = g.canvas.width, H = g.canvas.height, TS = T * S, img = g.getImageData(0, 0, W, H), p = img.data;
    const GRASS = new Set(['.', '"', 'q', '*', 'f', 'L', 'e', 'S', 'x', 'r', 'g', 'k', '~', 'w']);
    for (let Y = 0; Y < H; Y++) {
      const ty = Y / TS | 0;
      for (let X = 0; X < W; X++) {
        const o = (Y * W + X) * 4; if (p[o + 3] === 0) continue;
        const c = m.tiles[ty][X / TS | 0], h = hash(X, Y, 201);
        let f = 1 + (hash(X, Y, 202) - 0.5) * 0.06;
        if (m.kind === 'outdoor' && GRASS.has(c)) {
          if (h < 0.03) f += 0.2;                                   // Halmspitze im Mondlicht
          else if (h < 0.05 && Y > 0) f -= 0.12;                    // Halmschatten
          else if (hash(X, Y - 1, 201) < 0.03) f -= 0.1;            // Schatten unter der Spitze
        } else if (m.kind === 'outdoor' && (c === ',' || c === 'p' || c === '_')) {
          if (h < 0.012) f += 0.28; else if (hash(X - 1, Y - 1, 201) < 0.012) f -= 0.18;   // Kiesel mit Schatten
        } else if (m.kind === 'interior' && h < 0.008) f += 0.12;
        p[o] = Math.min(255, p[o] * f); p[o + 1] = Math.min(255, p[o + 1] * f); p[o + 2] = Math.min(255, p[o + 2] * f);
      }
    }
    // Feine Texturen nach Objektart: Laubkronen, Schindeln mit Moos, Holzmaserung, Stein mit Rissen
    const houses = m.houses.map(h => [h.x * T, h.y * T, h]);
    for (let Y = 0; Y < H; Y++) for (let X = 0; X < W; X++) {
      const o = (Y * W + X) * 4; if (p[o + 3] === 0) continue;
      const lx = X / S, ly = Y / S, tx = lx / T | 0, ty = ly / T | 0, c = m.tiles[ty][tx], fx = lx - tx * T, fy = ly - ty * T;
      let f = 0, add = null;
      const hs = houses.find(([hx, hy]) => lx >= hx && lx < hx + 64 && ly >= hy && ly < hy + 48);
      if (hs) {
        const [hx, hy, h] = hs, rx = lx - hx, ry = ly - hy;
        if (ry >= 4 && ry < 29) {                                    // Schindeln: jede Schindel eigene Helligkeit, Moos
          const row = (ry - 4) / 4 | 0, col = ((rx + (row % 2) * 4) / 8) | 0;
          f += (hash(col, row, 210 + h.x) - 0.5) * 0.16 + ((ry - 4) % 4 < 0.5 ? 0.1 : 0) - ((rx + (row % 2) * 4) % 8 < 0.5 ? 0.14 : 0);
          if (vnoise(lx * 0.35, ly * 0.35, 211) > 0.72 && hash(X, Y, 212) < 0.5) add = [48, 70, 44, 0.35];
        } else if (ry >= 29 && ry < 46 && rx > 3 && rx < 60) {       // Bretter: Maserung und Astlöcher
          f += Math.sin(rx * 0.9 + vnoise(lx * 0.15, ly * 1.2, 213) * 5) * 0.06 + (hash(X >> 2, Y, 214) - 0.5) * 0.06;
          if (vnoise(lx * 0.6, ly * 0.6, 215) > 0.86) f -= 0.18;
        }
      } else if (c === 'T') {                                        // Laub: kleine Blattbüschel, oben links mondhell
        const ex = (fx - 8) / 7.2, ey = (fy - 7) / 6.2;
        if (ex * ex + ey * ey < 1) {
          const n = vnoise(lx * 0.9, ly * 0.9, 216 + (tx * 7 + ty) % 5), up = -(ex + ey) * 0.5;
          if (n > 0.64) f += 0.14 + up * 0.14; else if (n < 0.3) f -= 0.16; else f += up * 0.05;
          if (hash(X, Y, 217) < 0.012) f += 0.3;
        }
      } else if ((c === 'f' || c === 'S' || c === 'b' || c === 'k') && p[o] > p[o + 1] + 6) {
        f += Math.sin((c === 'b' ? fx : fy) * 2.4 + vnoise(lx * 0.4, ly * 0.4, 218) * 4) * 0.07;       // Holzmaserung
      } else if (c === 'g' || c === 'r' || c === 'x' || c === 'B') {
        const lum = p[o] + p[o + 1] + p[o + 2];
        if (lum > 180) { if (Math.abs(vnoise(lx * 0.45, ly * 0.45, 219) - 0.5) < 0.018) f -= 0.16; else if (hash(X, Y, 220) < 0.04 && fy > 9) add = [70, 96, 66, 0.4]; } // feine Risse, Moos unten
      }
      if (f) { const k = 1 + f; p[o] = Math.min(255, p[o] * k); p[o + 1] = Math.min(255, p[o + 1] * k); p[o + 2] = Math.min(255, p[o + 2] * k); }
      if (add) { p[o] += (add[0] - p[o]) * add[3]; p[o + 1] += (add[1] - p[o + 1]) * add[3]; p[o + 2] += (add[2] - p[o + 2]) * add[3]; }
    }
    g.putImageData(img, 0, 0);
  }
  function lightsFor(m) {
    if (m.lights) return m.lights;
    const L = [];
    for (let y = 0; y < m.h; y++) for (let x = 0; x < m.w; x++) {
      const c = m.tiles[y][x];
      if (m.kind === 'interior') {
        if (c === 'o') L.push({ x: x * T + 8, y: y * T + 11, r: 64, warm: 1, fl: x });
        if (c === 'F') L.push({ x: x * T + 8, y: y * T + 11, r: 58, warm: 1, fl: x * 3, forge: 1 });
        if (c === 'c' || c === 't') L.push({ x: x * T + 8, y: y * T + 3, r: 30, warm: 1, fl: x + y });
        if (c === 'n') L.push({ x: x * T + 8, y: y * T + 8, r: 24, warm: 0, fl: x });
        if (c === 'l') L.push({ x: x * T + 8, y: y * T + 7, r: 40, warm: 1, fl: 3, cond: () => q1() >= 7 });
        if (c === 'a') L.push({ x: x * T + 8, y: y * T + 9, r: 16, warm: 0, ghost: 1, fl: 2 });
        if (c === 'M' && at(m, x - 1, y) !== 'M') L.push({ x: x * T + 16, y: y * T + 4, r: 46, warm: 0, fl: 1 });
        if (c === 'Z' && at(m, x - 1, y) !== 'Z') L.push({ x: x * T + 16, y: y * T - 2, r: 100, warm: 1, fl: 5, cond: () => lampLevel() > 0.15 });
        continue;
      }
      if (c === 'L') L.push({ x: x * T + 8, y: y * T + 4, r: m === D && y > 16 ? 46 : 56, warm: 1, fl: hash(x, y, 1) * 10 });
      if (c === 'e') L.push({ x: x * T + 8, y: y * T + 4, r: 52, warm: 1, fl: hash(x, y, 1) * 10, cond: () => G.flag(`lit_${m.id}_${x}_${y}`) });
      if (c === '*') L.push({ x: x * T + 8, y: y * T + 8, r: 14, warm: 0, fl: hash(x, y, 2) * 10 });
      if (c === 'Y' && m.theme === 'cave') L.push({ x: x * T + 5, y: y * T + 11, r: 26, warm: 0, fl: hash(x, y, 2) * 10, ghost: 1 });
      if (c === 'g' || c === 'B') L.push({ x: x * T + 8, y: y * T + 6, r: 22, warm: 0, fl: hash(x, y, 2) * 10, ghost: 1 });
    }
    if (m === K) L.push({ x: 16 * T + 6, y: 17 * T + 16, r: 34, warm: 1, fl: 6, cond: () => story() >= 8 }, { x: 16 * T + 90, y: 17 * T + 8, r: 30, warm: 1, fl: 8, cond: () => story() >= 8 });
    m.houses.forEach(h => {
      if (h.id === 'leuchtturm') { L.push({ x: h.x * T + 24, y: h.y * T - 45, r: 80, warm: 1, fl: 4, cond: () => story() >= 6 }, { x: h.x * T + 50, y: h.y * T + 28, r: 26, warm: 1, fl: 2, cond: () => story() >= 6 }); return; }
      if (h.art === 'schmiede') { L.push({ x: h.x * T + 46, y: h.y * T + 36, r: 78, warm: 1, fl: 7, forge: 1 }, { x: h.x * T + 50, y: h.y * T - 10, r: 22, warm: 1, fl: 3 }); return; }
      if (h.art === 'kirche') { // warme Spitzbogenfenster, violett-kühle Rosette, Türlicht, Mond auf der Turmspitze
        L.push({ x: h.x * T + 9, y: h.y * T + 28, r: 30, warm: 1, fl: h.x, win: 1 }, { x: h.x * T + 55, y: h.y * T + 28, r: 30, warm: 1, fl: h.y, win: 1 },
          { x: h.x * T + 24, y: h.y * T + 40, r: 26, warm: 1, fl: 3 }, { x: h.x * T + 32, y: h.y * T - 3, r: 26, warm: 0, fl: 5 }, { x: h.x * T + 32, y: h.y * T - 33, r: 18, warm: 0, fl: 7 }); return; }
      if (h.art === 'muehle') { L.push({ x: h.x * T + 40, y: h.y * T + 41, r: 38, warm: 1, fl: h.x }, { x: h.x * T + 32, y: h.y * T + 10, r: 18, warm: 1, fl: 2 }); return; }
      if (!h.hut) L.push({ x: h.x * T + 47, y: h.y * T + 38, r: 40, warm: 1, fl: h.x, win: 1 }, { x: h.x * T + 24, y: h.y * T + 48, r: 16, warm: 1, fl: h.y }); });
    return (m.lights = L);
  }
  const lightC = G.mkHi(VW, VH), lg = lightC.getContext('2d');
  const fogC = G.mkHi(VW, VH), fg = fogC.getContext('2d');
  const fogC2 = G.mkHi(VW, VH), fg2 = fogC2.getContext('2d');
  fg.imageSmoothingEnabled = fg2.imageSmoothingEnabled = true; // Nebelmasken (1×) weich hochrechnen
  const vign = G.mkHi(VW, VH); {
    const g = vign.getContext('2d'), gr = g.createRadialGradient(128, 116, 60, 128, 120, 175);
    gr.addColorStop(0, 'rgba(6,4,18,0)'); gr.addColorStop(1, 'rgba(6,4,18,0.78)'); g.fillStyle = gr; g.fillRect(0, 0, VW, VH);
  }
  G.vignette = vign;
  G.dusk = () => 0.5 - 0.5 * Math.cos(G.time * 2 * Math.PI / 240 + 1.2);

  // ================= Spieler & Karte =================
  // Schonfrist: nach jeder Begegnung (Kampf, Flucht, Fang) mindestens so viele Schritte im Nebel ohne neue Begegnung
  const ENCOUNTER_GRACE = 5;
  G.ENCOUNTER_GRACE = ENCOUNTER_GRACE;
  const P = G.P = { x: 5, y: 6, dir: 'down', px: 80, py: 96, moving: false, t: 0, tx: 5, ty: 6, walk: 0, stride: 0, turn: 0, queue: null, grace: 3, bumpT: 0, steps: 0 };
  const STEP = 0.18;     // Sekunden pro Kachel (konstante Geschwindigkeit, ~89 px/s)
  const TURN_HOLD = 0.03; // nur bei neuer Richtung: kurzes Tippen dreht, ab 30 ms Halten läuft die Figur los
  let cam = null;
  const DXY = { up: [0, -1], down: [0, 1], left: [-1, 0], right: [1, 0] };
  const OPP = { up: 'down', down: 'up', left: 'right', right: 'left' };
  G.World = { addChurch, healAt, healFx: null, tourState, skipTour, giftStone, legendState: legend, quantumWon, quantumScene, legendScene,
    catGift: { GIFT_MS, GIFT_POOL, giftReady, giftLeft, takeGift, rollGift }, cats: CATS };
  G.map = D;
  const npcVisible = n => !n.show || n.show();
  function resetNPCs(m) {
    for (const n of m.npcs) {
      const beaten = n.trainer && G.flag('t_' + n.trainer);
      [n.cx, n.cy] = beaten && n.after ? n.after : [n.x, n.y];
      n.cdir = n.dir; n.ox = 0; n.oy = 0; n.alert = 0; n.mv = null; n.wt = null;
      if (n.pet) { const [px, py] = n.pet.at || [n.cx - 1, n.cy]; n.pet.px = px * T; n.pet.py = py * T; n.pet.to = [px, py]; }
    }
  }
  const npcAt = (x, y) => G.map.npcs.find(n => npcVisible(n) && ((n.cx === x && n.cy === y) || (n.mv && n.fx === x && n.fy === y)));
  const pickupAt = (x, y) => G.map.pickups.find(p => p.x === x && p.y === y && !G.flag(p.flag));
  const solid = (x, y) => SOLID[G.map.kind].has(at(G.map, x, y)) || !!npcAt(x, y);
  G.World.tileAt = (x, y) => at(G.map, x, y);
  G.World.solidAt = (m, x, y) => SOLID[m.kind].has(at(m, x, y));
  // Erreichbarkeit (für Tests): Flutfüllung über begehbare Kacheln ab Startpunkt; Türen/Schilder/Figuren gelten als erreichbar,
  // wenn eine Nachbarkachel erreichbar ist. Liefert die Liste der nicht erreichbaren Ziele.
  G.World.reachCheck = (id, sx, sy) => {
    const m = G.MAPS[id], seen = new Set([sx + ',' + sy]), q = [[sx, sy]];
    while (q.length) { const [x, y] = q.pop(); for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) { const nx = x + dx, ny = y + dy, k = nx + ',' + ny;
      if (seen.has(k) || nx < 0 || ny < 0 || nx >= m.w || ny >= m.h || SOLID[m.kind].has(m.tiles[ny][nx])) continue; seen.add(k); q.push([nx, ny]); } }
    const adj = (x, y) => [[1, 0], [-1, 0], [0, 1], [0, -1]].some(([dx, dy]) => seen.has((x + dx) + ',' + (y + dy)));
    const bad = [];
    for (const k in m.doors) { const [x, y] = k.split(',').map(Number); if (!adj(x, y)) bad.push('Tür ' + m.doors[k].to); }
    for (const k in m.warps) { if (!seen.has(k)) bad.push('Übergang ' + m.warps[k].to); }
    for (const k in m.signs) { const [x, y] = k.split(',').map(Number); if (!adj(x, y)) bad.push('Schild ' + k); }
    for (const n of m.npcs) if (!n.mon && !adj(n.x, n.y) && !seen.has(n.x + ',' + n.y)) bad.push('Figur ' + n.id);
    return { bad, count: seen.size };
  };
  resetNPCs(D);
  G.World.place = (x, y, dir) => { P.x = P.tx = x; P.y = P.ty = y; P.dir = dir || 'down'; P.px = x * T; P.py = y * T; P.moving = false; P.t = 0; P.queue = null; P.turn = 0; P.grace = 3; cam = null; };
  G.World.setMap = (id, x, y, dir) => {
    G.map = G.MAPS[id] || D; prerender(G.map); resetNPCs(G.map);
    if (G.state) G.state.map = G.map.id;
    G.World.place(x, y, dir);
    G.Snd.music(G.World.areaMusic());
  };
  G.World.warp = async (id, x, y, dir) => {
    G.lock++; G.Snd.sfx('door');
    await G.animate(260, p => G.fx = { kind: 'wipe', p });
    G.World.setMap(id, x, y, dir);
    if (G.map.name) G.UI.toast(G.map.name, 1300);
    await G.animate(260, p => G.fx = { kind: 'wipe', p: 1 - p }); G.fx = null;
    G.lock--;
    G.save(true);
    await storyEnter();
    await checkTrainers();
  };

  // Bewegung: Rasterlogik bleibt (x/y = Kachel), Darstellung interpoliert pixelgenau mit Delta-Zeit.
  // Am Schrittende wird sofort der nächste Schritt gestartet (gehaltene Richtung oder gepufferte Eingabe) – ohne Pause.
  // ---- Positionsabhängige Umgebungsgeräusche: Wasser (Nähe + Richtung), Wind (offene Flächen, Küste), Ofen-/Essenknistern ----
  // pro Karte einmal vorberechnet: Distanzkarte (BFS, Kacheln) zum nächsten Wasser/Feuer + x-Lage der nächsten Wasserkachel, Offenheit für Wind
  const AMB_WIND = { kueste: 1, dorf: 0.45, tiefesmoor: 0.6, hoehle: 0.12 };
  function ambField(m) {
    if (m._amb) return m._amb;
    const W = m.w, H = m.h, N = W * H, dw = new Uint8Array(N).fill(255), sx = new Int16Array(N), dh = new Uint8Array(N).fill(255), open = new Float32Array(N);
    const bfs = (d, isSrc, srcX) => { const q = []; for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) if (isSrc(m.tiles[y][x])) { d[y * W + x] = 0; if (srcX) srcX[y * W + x] = x; q.push(y * W + x); }
      for (let h = 0; h < q.length; h++) { const i = q[h], x = i % W, y = (i / W) | 0; for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) { const nx = x + dx, ny = y + dy; if (nx < 0 || ny < 0 || nx >= W || ny >= H) continue;
        const j = ny * W + nx; if (d[j] > d[i] + 1 && d[i] < 30) { d[j] = d[i] + 1; if (srcX) srcX[j] = srcX[i]; q.push(j); } } } };
    if (m.kind === 'outdoor') bfs(dw, c => c === '~' || c === 'w', sx);
    else bfs(dh, c => c === 'F' || (c === 'o' && m.id !== 'huette'));
    if (m.kind === 'outdoor') for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) { let n = 0, o = 0; for (let yy = y - 3; yy <= y + 3; yy++) for (let xx = x - 3; xx <= x + 3; xx++) { if (xx < 0 || yy < 0 || xx >= W || yy >= H) continue; n++; if (!'TfhDx'.includes(m.tiles[yy][xx])) o++; } open[y * W + x] = n ? o / n : 0; }
    return (m._amb = { dw, sx, dh, open, W });
  }
  // Pegel an einer Position (Kacheln, auch Zwischenpositionen): { water 0..1, pan -1..1, wind 0..1, hearth 0..1, surf }
  function ambAt(m, fx, fy) {
    const A = ambField(m), x = Math.max(0, Math.min(m.w - 1, Math.round(fx))), y = Math.max(0, Math.min(m.h - 1, Math.round(fy))), i = y * A.W + x;
    const w = A.dw[i] === 255 ? 0 : Math.pow(Math.max(0, 1 - A.dw[i] / 9), 1.6), hh = A.dh[i] === 255 ? 0 : Math.pow(Math.max(0, 1 - A.dh[i] / 7), 1.3);
    const pan = A.dw[i] === 255 ? 0 : Math.max(-1, Math.min(1, (A.sx[i] - fx) / 5)) * 0.6;
    return { water: w, pan, wind: m.kind === 'outdoor' ? (AMB_WIND[m.id] || 0.4) * (0.35 + 0.65 * A.open[i]) : 0, hearth: hh, surf: m.id === 'kueste' };
  }
  G.World.ambAt = (id, x, y) => ambAt(G.MAPS[id], x, y);
  let ambT = 0;
  G.World.update = dt => {
    ambT -= dt;
    if (ambT <= 0 && G.Snd.ambience) { ambT = 0.1; const m = G.map;
      if (G.mode === 'world' && m && G.state) { const k = P.moving ? P.t : 0, fx = P.x + (P.tx - P.x) * k, fy = P.y + (P.ty - P.y) * k; G.Snd.ambience(ambAt(m, fx, fy)); }
      else G.Snd.ambience(null); }
    const isBusy = () => G.mode !== 'world' || G.lock > 0 || !!G.UI.handler;
    if (P.moving) {
      P.t += dt / STEP;
      if (P.t >= 1) {
        const carry = Math.min(P.t - 1, 0.5);
        P.moving = false; P.x = P.tx; P.y = P.ty; P.t = 0; P.stride++; G.World.stepFx(P.x, P.y);
        if (!P.auto) onStep();                      // setzt bei Kampf/Warp/Dialog synchron G.lock
        const next = G.Input.dir() || P.queue; P.queue = null;
        if (next && !isBusy()) { P.dir = next; P.turn = 0; if (tryMove(next)) P.t = carry; }
      }
    } else if (!isBusy()) {
      const d = G.Input.dir() || P.queue;
      if (d) {
        if (P.dir !== d) { P.dir = d; P.turn = P.queue ? 0 : TURN_HOLD; }
        if (P.turn > 0) P.turn -= dt;
        else { P.queue = null; tryMove(d); }
      } else P.turn = 0;
    } else P.queue = null;
    P.bumpT -= dt;
    const k = P.moving ? P.t : 0;
    P.px = (P.x + (P.tx - P.x) * k) * T; P.py = (P.y + (P.ty - P.y) * k) * T;
    if (G.state) { G.state.player.x = P.x; G.state.player.y = P.y; G.state.player.dir = P.dir; }
  };
  G.World.TURN_HOLD = TURN_HOLD;
  // Sofortstart: schaut die Figur schon in die gedrückte Richtung, beginnt der Schritt noch im Tastendruck-Ereignis
  G.World.pressDir = d => {
    if (P.moving) { G.World.bufferDir(d); return; }
    if (G.mode !== 'world' || G.lock > 0 || G.UI.handler) return;
    if (P.dir === d) { P.turn = 0; P.queue = null; tryMove(d); }
    else { P.dir = d; P.turn = TURN_HOLD; }
  };
  // Eingabepuffer: Richtung, die gegen Ende eines Schritts gedrückt wird, schliesst nahtlos an
  G.World.bufferDir = d => { if (P.moving && P.t > 0.4) P.queue = d; };
  function tryMove(d) {
    const [dx, dy] = DXY[d], nx = P.x + dx, ny = P.y + dy, key = nx + ',' + ny;
    const door = G.map.doors[key];
    if (door && at(G.map, nx, ny) === 'D') { enterDoor(door, nx, ny); return false; }
    const w = G.map.warps[key];
    if (w && w.cond && !w.cond()) { G.World.talk(w.msg); return false; }
    if (G.map === D && ny >= 16 && G.state && !G.state.team.length) {
      G.World.talk([story() < 1 ? 'Ilse (ruft dir nach): Halt! Ohne einen Geist an deiner Seite gehst du nicht in den Nebel! Komm erst zu mir auf den Dorfplatz.'
        : 'Ilse (ruft dir nach): Halt! Wähl erst einen Geist an den Laternensteinen – ohne Begleiter gehst du nicht in den Nebel!']);
      return false;
    }
    if (!solid(nx, ny)) { P.moving = true; P.tx = nx; P.ty = ny; P.t = 0; P.walk = (P.walk + 1) % 2; return true; }
    if (P.bumpT <= 0) { G.Snd.sfx('bump'); P.bumpT = 0.35; }
    return false;
  }
  async function enterDoor(door, dx, dy) {
    if (door.cond && !door.cond()) { G.lock++; await door.locked(); G.UI.hideText(); G.lock--; return; }
    const r = G.MAPS[door.to];
    if (r.kind === 'interior') { r.warps['4,7'].x = dx; r.warps['4,7'].y = dy + 1; }
    await G.World.warp(door.to, 4, 6, 'up');
  }
  // Musik je Gebiet: im Dorf wechselt sie nahe den Nebelbänken (Nebelgras) zum mystischen Stück (mit Hysterese)
  let nearFog = false;
  G.World.areaMusic = () => {
    if (G.map.id === 'hoehle' && !G.flag('quantum') && P.y <= 5 && G.flag('qseen')) return 'quantum';
    const m = G.map; if ((m.id !== 'dorf' && m.id !== 'kueste') || (m.music !== 'ambient' && m.music !== 'coast')) return m.music;
    let n = 0; for (let dy = -3; dy <= 3; dy++) for (let dx = -3; dx <= 3; dx++) if (ZONE_OF[at(m, P.x + dx, P.y + dy)]) n++;
    if (n >= 5) nearFog = true; else if (n === 0) nearFog = false;
    return nearFog ? 'nebel' : m.music;
  };
  const surface = (m, c) => c === 'b' && m.kind === 'outdoor' ? 'wood' : m.kind === 'interior' ? 'floor' : (m.theme === 'moor' || c === 'q' || c === 'm') ? 'mud' : 'grass';
  async function onStep() {
    const S = G.state, m = G.map, key = P.x + ',' + P.y;
    P.steps++;
    if (G.World.rareNotice) { const A = G.WILD_AREAS[G.World.rareNotice]; G.World.rareNotice = null; if (A && G.UI.toast) G.UI.toast(`Im Gebiet ${A.name} schimmert es an manchen Stellen …`, 3200, true); }
    G.Snd.sfx('step', surface(m, at(m, P.x, P.y)));
    G.Snd.music(G.World.areaMusic());
    // Feld-Klamm: alle 8 Schritte −1 LP, nie unter 1
    if (P.steps % 8 === 0) for (const mon of S.team) if (mon.status && mon.status.id === 'klamm' && mon.hp > 1) mon.hp--;
    const pk = pickupAt(P.x, P.y);
    if (pk) { S.flags[pk.flag] = 1; G.lock++; await give(pk.item, pk.n); G.UI.hideText(); G.lock--; }
    const w = m.warps[key];
    if (w) { await G.World.warp(w.to, w.x, w.y, w.dir); return; }
    if (m === K && story() === 7 && P.y >= 13 && P.x >= 10) { await arrivalScene(); return; }
    if (m.id === 'hoehle' && P.y === 5 && (P.x === 17 || P.x === 18) && P.dir === 'up' && !S.flags.quantum) { await quantumScene(); return; }
    let zone = m.kind === 'outdoor' && ZONE_OF[at(m, P.x, P.y)];
    if (zone === 'nebelgras' && m.id === 'kueste') zone = 'kuestengras';
    zone = zoneAt(m, P.x, P.y, zone);
    if (zone) {
      if (P.grace > 0) P.grace--;
      else if (Math.random() < (G.debugEncounterRate || (story() === 2 ? Math.max(0.3, G.WILD_AREAS[zone].rate) : G.WILD_AREAS[zone].rate))) { G.World.encounter(zone); return; }
    }
    await checkTrainers();
  }
  // v15: Moorherz = eigener Bereich im Tiefen Moor (Torfstich-Kacheln in der Südwest-Ecke)
  function zoneAt(m, x, y, zone) {
    if (!zone) return zone;
    for (const id in G.WILD_AREAS) { const A = G.WILD_AREAS[id], r = A.region; if (r && A.map === m.id && x >= r[0] && y >= r[1] && x <= r[2] && y <= r[3]) return id; }
    return zone;
  }
  // v15: Bedingungen der seltenen Geister (am aktuellen Standort)
  const RARE_COND = {
    fog: (m, x, y) => { let n = 0; for (let dy = -2; dy <= 2; dy++) for (let dx = -2; dx <= 2; dx++) if (at(m, x + dx, y + dy) === '"') n++; return n >= 22; },
    shore: (m, x, y) => { for (let dy = -2; dy <= 2; dy++) for (let dx = -2; dx <= 2; dx++) if (at(m, x + dx, y + dy) === '~') return true; return false; },
    lantern: (m, x, y) => { for (let dy = -3; dy <= 3; dy++) for (let dx = -3; dx <= 3; dx++) if (at(m, x + dx, y + dy) === 'e' && G.flag(`lit_${m.id}_${x + dx}_${y + dy}`)) return true; return false; },
    hidden: (m, x, y) => m.id === 'tiefesmoor' && x >= 2 && x <= 3 && y >= 21 && y <= 22,
    // v17: Glimmerwurm neben einem leuchtenden Tropfstein, Schilfotter mitten im Schilf, Glockenrabe bei der versunkenen Glocke
    crystal: (m, x, y) => { for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) if (at(m, x + dx, y + dy) === 'Y') return true; return false; },
    reeds: (m, x, y) => { for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) if (at(m, x + dx, y + dy) !== 'q') return false; return true; },
    bell: (m, x, y) => { for (let dy = -2; dy <= 2; dy++) for (let dx = -2; dx <= 2; dx++) if (at(m, x + dx, y + dy) === 'B') return true; return false; }
  };
  // Gebiet einer Kachel (wie in onStep)
  function tileZone(m, x, y) {
    if (m.kind !== 'outdoor' && m.id !== 'hoehle') return null;
    let z = ZONE_OF[at(m, x, y)]; if (!z) return null;
    if (z === 'nebelgras' && m.id === 'kueste') z = 'kuestengras';
    z = zoneAt(m, x, y, z);
    const A = G.WILD_AREAS[z]; if (!A || (A.map && A.map !== m.id)) return null;
    return z;
  }
  G.World.tileZone = tileZone;
  const rareCounts = () => (G.state.rareCount = G.state.rareCount || {});
  G.World.rareCount = zone => rareCounts()[zone] || 0;
  // Schimmer-Hinweis: ab RAMP Kämpfen im Gebiet funkeln die passenden Stellen
  G.World.rareHintTiles = (m = G.map, x0 = 0, y0 = 0, x1 = m.w - 1, y1 = m.h - 1) => {
    const out = []; if (!G.FEAT.rare || !G.state) return out;
    const live = (G.RARE_SPAWNS || []).filter(r => G.World.rareCount(r.zone) >= G.RARE_RULE.RAMP);
    if (!live.length) return out;
    for (let y = Math.max(0, y0); y <= Math.min(m.h - 1, y1); y++) for (let x = Math.max(0, x0); x <= Math.min(m.w - 1, x1); x++) {
      const z = tileZone(m, x, y); if (!z) continue;
      const r = live.find(r => r.zone === z); if (r && RARE_COND[r.cond](m, x, y)) out.push([x, y, r.sp]);
    }
    return out;
  };
  G.World.rareCond = RARE_COND;
  G.World.rareFor = (zone, m = G.map, x = P.x, y = P.y) => (G.RARE_SPAWNS || []).find(r => r.zone === zone && RARE_COND[r.cond](m, x, y));
  G.World.encounter = (zone) => {
    const A = G.WILD_AREAS[zone || 'nebelgras'];
    // v17: Zähler je Gebiet – jeder Wildkampf zählt; ab ~15 Kämpfen steigt die Chance bis 5 %, nach dem Erscheinen wieder 0
    const RC = G.FEAT.rare && zone ? rareCounts() : null, n = RC ? RC[zone] || 0 : 0;
    const rs = RC && G.World.rareFor(zone), rare = !!rs && Math.random() < (G.debugRareRate || G.rareChance(n));
    if (RC) RC[zone] = rare ? 0 : n + 1;
    if (RC && !rare && n + 1 === G.RARE_RULE.RAMP) G.World.rareNotice = zone;
    if (rare) { P.grace = ENCOUNTER_GRACE; const l = G.rnd(rs.lvl[0], rs.lvl[1]); G.state.rareSeen = (G.state.rareSeen || 0) + 1; return G.Battle.start({ team: [G.makeMon(rs.sp, l)], rare: true }); }
    const sp = G.pickWeighted(A.table);
    const lead = Math.max(...G.state.team.map(m => m.lvl));
    const cap = zone === 'nebelgras' || !zone ? 1 : 2;
    // Stein-Geister halten typenlose Attacken besser aus (½×): im Nebelgras und am Küstenweg höchstens 3 Level unter deinem stärksten Geist
    let lvl = Math.max(2, Math.min(lead + cap, G.rnd(A.lvl[0], A.lvl[1])));
    if (G.hasType(sp, 'Stein') && (zone === 'nebelgras' || zone === 'kuestengras' || !zone)) lvl = Math.max(2, Math.min(lvl, lead - 3));
    if (story() === 2) lvl = Math.min(lvl, 3);   // Fang-Übung: ein kleiner, müder Geist
    P.grace = ENCOUNTER_GRACE;
    const hear = G.map.id === 'tiefesmoor' && P.x >= 14 && P.x <= 18 && P.y >= 13 && P.y <= 16;
    return G.Battle.start({ team: [G.makeMon(sp, lvl)], hear });
  };

  // Trainer: Sichtlinie
  let spotting = false;
  async function checkTrainers() {
    if (G.mode !== 'world' || G.lock > 0 || spotting) return;
    for (const n of G.map.npcs) {
      if (!n.trainer || !n.sight || !npcVisible(n) || G.flag('t_' + n.trainer)) continue;   // sight 0: kämpft nur auf Ansprache
      const [dx, dy] = DXY[n.cdir];
      for (let i = 1; i <= n.sight; i++) {
        const x = n.cx + dx * i, y = n.cy + dy * i;
        if (x === P.x && y === P.y) { await trainerSpots(n, i); return; }
        if (SOLID[G.map.kind].has(at(G.map, x, y)) || npcAt(x, y)) break;
      }
    }
  }
  G.World.checkTrainers = checkTrainers;
  async function trainerSpots(n, dist) {
    spotting = true;
    try { await spotSeq(n, dist); } finally { spotting = false; }
  }
  async function spotSeq(n, dist) {
    G.lock++; G.Snd.sfx('alert'); n.alert = 1;
    await G.wait(650); n.alert = 0;
    const [dx, dy] = DXY[n.cdir];
    for (let i = 1; i < dist; i++) { await G.animate(170, p => { n.ox = dx * p * T; n.oy = dy * p * T; }); n.cx += dx; n.cy += dy; n.ox = n.oy = 0; }
    P.dir = OPP[n.cdir];
    await G.UI.sayAll(G.TRAINERS[n.trainer].intro); G.UI.hideText();
    G.lock--;
    await G.Battle.trainer(n.trainer);
  }
  G.World.afterTrainer = (id) => { resetNPCs(G.map); };

  // ================= Interaktion =================
  G.World.talk = async (lines) => { G.lock++; await G.UI.sayAll(typeof lines === 'function' ? lines() : lines); G.UI.hideText(); G.lock--; };
  const TILE_TEXT = {
    dorf: { g: ['Auf dem Grabstein steht ein Name, den der Nebel längst verschluckt hat.', 'Ein kühler Hauch streicht dir über den Nacken.'], '~': ['Das Wasser ist still und schwarz. Tief darunter glimmt etwas.'], L: ['Die Laterne summt leise. Ihr Licht ist warm wie eine Hand.'], '*': ['Mondblumen. Sie leuchten nur, wenn niemand hinsieht.'] },
    tiefesmoor: { g: ['Sieben Steine für sieben Winter. Auf einem steht nur ein «M».'], w: ['Moorwasser, schwarz wie Tinte. Manchmal steigt eine kleine Blase auf – wie ein Seufzer.'],
      x: ['Eine tote Weide. Ihre Äste hängen bis ins Wasser, als suchten sie etwas.'], k: ['Ein Torfhaufen. Jemand hat ihn sorgfältig gestapelt – Jorin, vermutlich.'], u: ['Die Mauer der alten Kapelle. Der Mörtel ist weich vom Nebel.'],
      B: ['Eine Glocke ohne Klöppel. Trotzdem glaubst du, ein leises Läuten zu hören – von weit im Norden.'], L: ['Die Laterne brennt ruhig. Hier findest du zurück, wenn dich die Kräfte verlassen.'] },
    home: { k: ['Ein Regal mit Tassen, Kerzenstummeln und einem getrockneten Kranz.'], o: ['Der Ofen knistert. Es riecht nach Harz.'], t: ['Auf dem Tisch liegt ein Brief von Ilse: «Iss etwas, bevor du gehst.»'], n: ['Draussen wälzt sich der Nebel über den Weg.'] },
    hedda: { k: ['Kerzen in allen Grössen. Auf einem Zettel steht: «Nicht für Jorin – der zahlt nie. Trotzdem aufheben.»'], t: ['Eine Teekanne mit gesprungenem Deckel. Sie ist noch warm.'], o: ['Der Teekessel summt leise vor sich hin.'] },
    oda: { b: ['Ein Kinderbett. Unter dem Kissen: ein Holzschwert und ein Zettel «Fenn, Geisterbeschwörer».'], y: ['Eine leere Wiege. Staub liegt darauf, aber das Tuch ist frisch gefaltet.'], z: ['Kleine geschnitzte Tiere: ein Fuchs, ein Kauz, ein Hase. Jorins Handschrift.'], t: ['Eine Schale mit Äpfeln. Sie duften nach Herbst.'] },
    jorin: { j: ['Jorins Werkbank. Späne, ein Messer, ein halb geschnitzter Kauz.'], b: ['Jorins Bett. Ordentlich gemacht, als hätte er gewusst, dass er lange weg sein würde.'], l: ['Marens Laterne. Sie brennt, ruhig und golden.'], z: ['Die Schnitzfigur, die Fenn zurückgebracht hat: ein kleiner Kauz.'], t: ['Zwei Tassen auf dem Tisch. Eine ist verstaubt.'] },
    leuchtturm: { k: ['Seekarten, eine Ölkanne und ein Buch: «Leuchtfeuer-Logbuch, Band 7». Der letzte Eintrag: «Ostwind. Müde.»'], j: ['Onnos Werkbank. Dochte, Schrauben und ein halb gegessener Zwieback.'],
      n: ['Draussen: Nebel, und darunter das Rauschen der Brandung.'], c: ['Eine Sturmkerze in einem Glas. Sie flackert nicht, auch wenn es zieht.'] },
    kueste: { '~': ['Das Meer ist schwarz und ruhig. Irgendwo dort draussen, hinter dem Nebel, sollen die Nebelinseln liegen.'], r: ['Ein nasser Uferstein, bewachsen mit Seepocken.'],
      L: ['Die Hafenlaterne brennt. Jemand hat sie mit Wachstuch gegen den Wind umwickelt.'], T: ['Eine windschiefe Kiefer. Ihre Äste zeigen alle nach Westen, weg vom Meer.'] },
    huette: { k: ['Kisten mit Torf und ein Paar alte Stiefel, zu klein für Jorin.'], o: ['Ein Torfofen. Kalt. Neben ihm liegt Zunder, ordentlich aufgeschichtet.'], c: ['Eine Kerze, fast heruntergebrannt.'] }
  };
  G.World.interact = async () => {
    let [dx, dy] = DXY[P.dir], fx = P.x + dx, fy = P.y + dy; const m = G.map, S = G.state;
    // auf einer Moorlaterne stehend: A zündet diese an (sofern vorne nichts anderes wartet)
    if (at(m, P.x, P.y) === 'e' && !npcAt(fx, fy) && !m.signs[fx + ',' + fy] && at(m, fx, fy) !== 'e' && at(m, fx, fy) !== 'D') { fx = P.x; fy = P.y; }
    const c = at(m, fx, fy), key = fx + ',' + fy;
    const npc = npcAt(fx, fy), pet = !npc && petAt(fx, fy);
    if (pet) { G.lock++; if (G.Snd) G.Snd.sfx('blip'); await G.UI.say(PET_TALK[pet.sp] ? PET_TALK[pet.sp](pet.name) : `${pet.name} schaut dich neugierig an.`); G.UI.hideText(); G.lock--; return; }
    if (npc) {
      if (!npc.mon) npc.cdir = OPP[P.dir];
      if (npc.trainer && !G.flag('t_' + npc.trainer)) {
        const tr = G.TRAINERS[npc.trainer];
        G.lock++;
        if (tr.ask) {   // freiwilliger Kampf: erst fragen, mit Trainingstipp
          await G.UI.sayAll(tr.ask);
          if (!(await G.UI.yesNo(tr.askQ))) { await G.UI.sayAll(tr.decline); G.UI.hideText(); G.lock--; return; }
        }
        await G.UI.sayAll(tr.intro); G.UI.hideText(); G.lock--; return G.Battle.trainer(npc.trainer);
      }
      if (npc.trainer) return G.World.talk(G.TRAINERS[npc.trainer].after);
      G.lock++; await npc.talk(); G.UI.hideText(); G.lock--; return;
    }
    { const cat = catAt(fx, fy); if (cat) { G.lock++; await petCat(cat); G.UI.hideText(); G.lock--; return; } }
    if (m.signs[key]) return G.World.talk(m.signs[key]);
    if (c === 'D' && m.doors[key]) return enterDoor(m.doors[key], fx, fy);
    if (c === 'e') {
      const f = `lit_${m.id}_${fx}_${fy}`;
      if (!G.flag(f)) { S.flags[f] = 1; G.Snd.sfx('heal'); S.respawn = { map: m.id, x: fx, y: fy + 1 }; return G.World.talk(['Du entzündest die erloschene Laterne. Ihr Licht legt sich warm auf den Steg.', 'Wenn dich die Kräfte verlassen, wachst du hier wieder auf.']); }
      S.respawn = { map: m.id, x: fx, y: fy + 1 };
      return G.World.talk(TILE_TEXT.tiefesmoor.L);
    }
    if (m.id === 'tiefesmoor' && c === '*') {
      const f = `flower_${fx}_${fy}`;
      if (!G.flag(f)) { S.flags[f] = 1; G.lock++; await G.UI.say('Die Mondblumen tragen Tau, der im Dunkeln leuchtet.'); await give('klarblick', 1); G.UI.hideText(); G.lock--; return; }
      return G.World.talk(['Die Mondblumen schimmern. Ihr Tau ist schon gesammelt.']);
    }
    if (m.id === 'leuchtturm' && c === 'Z') {
      if (story() >= 6) return G.World.talk(['Die grosse Lampe brennt. Ihre Linse dreht sich langsam und schickt den Strahl hinaus aufs Meer.', 'Es summt leise, wie ein Kessel kurz vor dem Pfeifen.']);
      G.lock++;
      await G.UI.sayAll(['Die grosse Lampe ist kalt. Das Glas der Linse ist beschlagen, der Docht trocken.', 'Ohne den Wärter bekommst du sie nicht an – sie hat mehr Hebel und Ventile als Heddas Teekessel.']);
      if (story() === 4) setStory(5);
      G.UI.hideText(); G.lock--; return;
    }
    if (m === K && c === '~' && story() >= 8 && fx >= 16 && fx <= 21 && fy >= 17 && fy <= 20) { G.lock++; await talkWenke(); G.UI.hideText(); G.lock--; return; }
    // Innenräume
    if (m.id === 'home' && c === 'b') return restHome();
    if (m.id === 'home' && c === 'a') return G.Menu.archive();
    if (m.id === 'hedda' && c === 'u') {
      const d = G.dusk();
      return G.World.talk([`Die Standuhr tickt. ${d < 0.3 ? 'Kurz nach sieben – die Dämmerung hängt noch im Fenster.' : d < 0.7 ? 'Halb zehn. Draussen ist es dunkel geworden.' : 'Kurz vor Mitternacht. Die Kerzen brennen tief.'}`, 'Hedda zählt leise mit.']);
    }
    if (m.id === 'huette' && c === 't') {
      G.lock++;
      await G.UI.sayAll(['Auf dem Tisch liegt Jorins Tagebuch. Die letzte Seite ist feucht:', '«Ich habe ihr Licht gesehen. Draussen, über dem Nebelsee. Ich gehe hin. Nur einmal noch.»']);
      if (!S.flags.diary) { S.flags.diary = 1; setQ(4); await give('nachtkerze', 1); }
      G.UI.hideText(); G.lock--; return;
    }
    if (m.id === 'huette' && c === 'b') {
      G.lock++;
      await G.UI.say('Du legst dich auf Jorins schmales Bett. Es riecht nach Torf und Rauch …');
      healTeam(); S.respawn = { map: 'tiefesmoor', x: 11, y: 25 }; G.Snd.sfx('heal');
      await G.UI.say('Dein Team hat sich erholt. (Hier wird nicht gespeichert.)'); G.UI.hideText(); G.lock--; return;
    }
    const tt = TILE_TEXT[m.id] && TILE_TEXT[m.id][c];
    if (tt) return G.World.talk(tt);
  };
  function healTeam() { for (const mon of G.state.team) { mon.hp = G.stats(mon).hp; mon.status = null; G.fillPP(mon); } }
  G.healTeam = healTeam;
  async function restHome() {
    const S = G.state; G.lock++;
    await G.UI.sayAll(['Du legst dich in dein Bett. Die Kerzen flackern, der Ofen knistert.', 'Du ruhst dich eine Weile aus …']);
    healTeam();
    for (let i = 0; i < 5; i++) delete S.flags['mint' + i];     // Moorminze wächst nach
    delete S.flags.jorinKerze;
    S.respawn = null; G.Snd.sfx('heal');
    await G.UI.say('Dein Team ist vollständig erholt! (Spiel gespeichert)');
    G.save(); G.UI.hideText(); G.lock--;
  }

  // ================= Rendern =================
  // Kamera: folgt weich (exponentiell, framerate-unabhängig). Der Versatz zur Figur wird ganzzahlig gerundet,
  // damit Figur und Welt nie gegeneinander um 1 px zittern.
  G.World.camera = (hideP, dt) => {
    const m = G.map;
    if (m.kind === 'interior') return [-(VW - m.w * T) / 2 | 0, -(VH - m.h * T) / 2 + 8 | 0];
    const clamp = (cx, cy) => [Math.max(0, Math.min(m.w * T - VW, cx)), Math.max(0, Math.min(m.h * T - VH, cy))];
    if (hideP) return clamp(13 * T, 4 * T);
    const f = G.World.camFocus, tx = (f ? f[0] : P.px + 8) - VW / 2, ty = (f ? f[1] : P.py + 8) - VH / 2;
    if (!cam || cam.map !== m || !dt) cam = { map: m, x: tx, y: ty };
    else {
      const k = 1 - Math.exp(-dt * (G.World.camFocus ? 2.5 : 16));   // Szenen-Schwenk langsam, sonst straff
      cam.x += (tx - cam.x) * k; cam.y += (ty - cam.y) * k;
      if (Math.abs(tx - cam.x) < 0.3) cam.x = tx; if (Math.abs(ty - cam.y) < 0.3) cam.y = ty;
    }
    const ox = Math.round(cam.x - P.px), oy = Math.round(cam.y - P.py);
    return clamp(Math.round(P.px) + ox, Math.round(P.py) + oy);
  };

  // ================= Licht & Atmosphäre (vorberechnete Licht-Sprites, Parallax-Nebel, Irrlichter, Wind) =================
  // Lichtkegel/-höfe werden nicht mehr pro Bild als Verlauf erzeugt, sondern aus wenigen vorgerechneten Sprites skaliert.
  const mkGlow = (rgb, stops) => { const c = G.mk(128, 128), g = c.getContext('2d'), gr = g.createRadialGradient(64, 64, 0, 64, 64, 64);
    for (const [o, a] of stops) gr.addColorStop(o, `rgba(${rgb},${a})`); g.fillStyle = gr; g.fillRect(0, 0, 128, 128); return c; };
  const SOFT = [[0, 1], [0.25, 0.93], [0.5, 0.66], [0.72, 0.3], [0.88, 0.08], [1, 0]];            // weicher, fast quadratischer Abfall
  const LSPR = { hole: mkGlow('0,0,0', SOFT), warm: mkGlow('255,168,78', SOFT), cool: mkGlow('150,120,255', SOFT), ghost: mkGlow('120,200,255', SOFT),
    wisp: mkGlow('140,240,214', [[0, 1], [0.12, 0.8], [0.3, 0.32], [0.6, 0.08], [1, 0]]), core: mkGlow('240,255,250', [[0, 1], [0.25, 0.6], [0.6, 0.1], [1, 0]]) };
  G.LSPR = LSPR;
  const spr = (g, img, x, y, rx, ry = rx) => g.drawImage(img, x - rx, y - ry, rx * 2, ry * 2);
  // kachelbare, weiche Nebeltextur (256×128, 1×; wird geglättet hochskaliert)
  const FOGTEX = (() => { const c = G.mk(256, 128), g = c.getContext('2d');
    for (let i = 0; i < 46; i++) { const x = hash(i, 1, 300) * 256, y = hash(i, 2, 301) * 128, r = 18 + hash(i, 3, 302) * 34, a = 0.18 + hash(i, 4, 303) * 0.3;
      for (const ox of [-256, 0, 256]) for (const oy of [-128, 0, 128]) { const gr = g.createRadialGradient(x + ox, y + oy, 0, x + ox, y + oy, r);
        gr.addColorStop(0, `rgba(204,212,236,${a})`); gr.addColorStop(1, 'rgba(204,212,236,0)'); g.fillStyle = gr; g.fillRect(x + ox - r, y + oy - r, r * 2, r * 2); } }
    return c; })();
  const FOGLAYERS = { dorf: [0.09, 0.06], kueste: [0.12, 0.07], moor: [0.14, 0.09] };
  // beide Parallax-Schichten werden in eine kleine 1×-Leinwand gemalt und einmal weich hochskaliert (spart Füllrate auf 4×-Bildschirmen)
  const FOGC = G.mk(VW, VH), fogg = FOGC.getContext('2d'); let FOGPAT = null;
  function fogLayers(ctx, cx, cy, t, L) {
    if (!FOGPAT) FOGPAT = fogg.createPattern(FOGTEX, 'repeat');
    fogg.clearRect(0, 0, VW, VH); fogg.fillStyle = FOGPAT;
    for (const [par, speed, alpha, yoff] of [[0.55, 4, L[0], 0], [1.25, 9, L[1], 64]]) {
      const ox = (((cx * par + t * speed) % 256) + 256) % 256, oy = ((((cy * par) * 0.6 + yoff) % 128) + 128) % 128;
      fogg.globalAlpha = alpha; fogg.setTransform(1, 0, 0, 1, -ox, -oy); fogg.fillRect(0, 0, VW + 256, VH + 128);
    }
    fogg.setTransform(1, 0, 0, 1, 0, 0); fogg.globalAlpha = 1;
    ctx.save(); ctx.imageSmoothingEnabled = true; ctx.drawImage(FOGC, 0, 0, VW, VH); ctx.restore();
  }
  // Irrlichter im Moor: wandern um feuchte Stellen, pulsieren, weichen der Laterne scheu aus
  function wispsFor(m) {
    if (m.wisps) return m.wisps;
    const spots = []; for (let y = 0; y < m.h; y++) for (let x = 0; x < m.w; x++) if ('wqm'.includes(m.tiles[y][x]) && hash(x, y, 310) < 0.08) spots.push([x * T + 8, y * T + 6]);
    m.wisps = spots.slice(0, 16).map(([x, y], i) => ({ bx: x, by: y, x, y, ph: hash(i, 7, 311) * 20, sp: 0.25 + hash(i, 8, 312) * 0.3, flee: 0 }));
    return m.wisps;
  }
  function updateWisps(m, t, dt) {
    const W = wispsFor(m), px = P.px + 8, py = P.py + 4;
    for (const w of W) {
      const tt = t * w.sp + w.ph; let x = w.bx + Math.sin(tt) * 22 + Math.sin(tt * 2.3) * 6, y = w.by + Math.cos(tt * 0.8) * 14 - 4;
      const d = Math.hypot(x - px, y - py); w.flee = Math.max(0, Math.min(1, w.flee + (d < 40 ? dt * 2 : -dt)));
      if (w.flee > 0 && d > 0.1) { x += (x - px) / d * 26 * w.flee; y += (y - py) / d * 18 * w.flee; }
      w.x = x; w.y = y; w.a = (0.55 + 0.45 * Math.sin(t * 1.3 + w.ph * 3)) * (1 - 0.6 * w.flee);
    }
    return W;
  }
  // Wind: Grashalme, Schilf und Weidenzweige wiegen sich (5 vorgerenderte Neigungen je Art)
  const SWAY = {};
  function swaySprites(kind, theme) {
    const key = kind + theme; if (SWAY[key]) return SWAY[key];
    const Pl = G.Tiles.PAL[theme] || G.Tiles.PAL.dorf;
    return (SWAY[key] = [-2, -1, 0, 1, 2].map(k => { const c = G.mkHi(16, 20), g = c.getContext('2d'), a = k * 0.55;
      const blade = (x, h, col, w = 0.5) => { g.strokeStyle = col; g.lineWidth = w; g.beginPath(); g.moveTo(x, 19); g.quadraticCurveTo(x + a * 0.4, 19 - h * 0.6, x + a * h / 5, 19 - h); g.stroke(); };
      if (kind === 'grass') { for (const [x, h, c] of [[3, 8, Pl.tallT], [5, 10, Pl.tallL], [8, 7, Pl.tallT], [11, 9, Pl.tallL], [13, 7, Pl.tallT]]) blade(x, h, c, 0.7); }
      else if (kind === 'reed') { for (const [x, h] of [[4, 11], [7, 14], [10, 10]]) { blade(x, h, '#4a5e3c', 0.7); g.fillStyle = '#6a4e30'; g.fillRect(x + a * h / 5 - 0.5, 19 - h - 1, 1, 2.5); } }
      else { for (const [x, h] of [[3, 12], [6, 14], [9, 13], [12, 11]]) { g.strokeStyle = '#3e4c3a'; g.lineWidth = 0.5; g.beginPath(); g.moveTo(x, 4); g.quadraticCurveTo(x + a * 0.6, 4 + h * 0.5, x + a * 1.4, 4 + h); g.stroke(); } }
      return c; }));
  }
  function renderSway(ctx, m, cx, cy, t) {
    if (m.kind !== 'outdoor' || G.lowFx || G.fxOff.sway) return;
    const x0 = Math.max(0, Math.floor(cx / T)), y0 = Math.max(0, Math.floor(cy / T)), th = m.theme === 'moor' ? 'moor' : 'dorf';
    for (let y = y0; y <= Math.min(m.h - 1, y0 + 15); y++) for (let x = x0; x <= Math.min(m.w - 1, x0 + 16); x++) {
      const c = at(m, x, y), kind = c === '"' ? 'grass' : c === 'q' ? 'reed' : c === 'x' ? 'willow' : null; if (!kind) continue;
      if (kind !== 'willow' && hash(x, y, 320) > 0.6) continue;
      if ((x === P.x && y === P.y) || (x === P.tx && y === P.ty)) continue;        // unter der Figur nicht über die Füsse malen
      const gust = Math.sin(t * 0.45 + x * 0.12) * 0.8, s = Math.sin(t * 1.8 + x * 0.7 + y * 0.35) + gust, f = Math.max(0, Math.min(4, Math.round(s + 2)));
      const img = swaySprites(kind, th)[f];
      if (kind === 'willow') ctx.drawImage(img, x * T - cx, y * T - cy - 6); else ctx.drawImage(img, x * T - cx + (hash(x, y, 321) - 0.5) * 4, y * T - cy - 6);
    }
  }
  // Effektstufe: 'auto' (Standard, schaltet bei zu langer Bildzeit selbst auf niedrig), 'hoch', 'niedrig'
  G.fxMode = 'auto'; G.lowFx = false; G.fxOff = {};
  G.setFx = mode => { G.fxMode = mode; G.lowFx = mode === 'niedrig'; if (G.Store) G.Store.set('eldenghost.fx', mode); G.perf.low = 0; };
  G.perf = { ema: 16.7, render: 0, slow: 0, low: 0 };
  // weicher Bodenschatten (Ellipse) unter Figuren; Figuren 20×26, Füsse auf der Kachelunterkante
  function shadow(ctx, x, y, w = 7) { G.shadowEllipse(ctx, x + 8, y + 15, w, 2.6); }
  const drawChar = (ctx, img, sx, sy) => ctx.drawImage(img, sx + 8 - (img.lw || img.width) / 2, sy + 16 - (img.lh || img.height) + 1);
  // ---------- Gehen & Stehen (Figuren) ----------
  // Gangzyklus: 4 Phasen je Richtung, 2 pro Kachel (Kontakt, Durchschwung), synchron zum Gleiten; leichter Wipp-Effekt.
  // Im Stand: Atmen (alle ~0.9 s) und Blinzeln (alle 2.6–4.4 s); Drehen zeigt kurz einen Zwischenschritt.
  const ANIM = G.ANIM = { player: { idle: 0, blinkAt: 3, lastDir: 'down', turnT: 0, frame: null } };
  function idleFrame(spr, dir, tIdle, seed) {
    const id = spr.idle && spr.idle[dir]; if (!id) return spr[dir];
    const bt = (tIdle + seed * 1.7) % (2.6 + (seed % 3) * 0.6);
    if (tIdle > 0.5 && bt < 0.13) return id[2];                          // Blinzeln
    return tIdle > 0.4 && Math.floor((tIdle + seed) / 0.9) % 2 ? id[1] : id[0]; // Atmen
  }
  function playerFrame(dt) {
    const A = ANIM.player, spr = G.SPR.player;
    if (A.lastDir !== P.dir) { if (!P.moving) A.turnT = 0.09; A.lastDir = P.dir; }
    A.turnT = Math.max(0, A.turnT - dt);
    if (P.moving) {
      A.idle = 0; const ph = (P.stride % 2) * 2 + (P.t < 0.5 ? 0 : 1);
      A.frame = { img: spr.walk[P.dir][ph], ph, lift: Math.round(Math.sin(Math.min(1, P.t) * Math.PI) * 2) / 2 };   // Wippen in ½-Pixel-Schritten
    } else if (A.turnT > 0) A.frame = { img: spr.walk[P.dir][1], ph: 1, lift: 0.5 };
    else { A.idle += dt; A.frame = { img: idleFrame(spr, P.dir, A.idle, 0), ph: -1, lift: 0 }; }
    return A.frame;
  }
  // ---------- v16: Dorfleben – umhergehende Leute und Begleitgeister ----------
  // Bewegung nur im eigenen Rechteck, nie auf Türen/Übergänge/Schilder/Funde, nie direkt neben die Spielfigur (blockiert nie den nächsten Schritt)
  function wanderOk(m, n, x, y) {
    const r = n.wander; if (x < r[0] || y < r[1] || x > r[2] || y > r[3]) return false;
    if (SOLID[m.kind].has(at(m, x, y))) return false;
    const k = x + ',' + y; if (m.doors[k] || m.warps[k] || m.signs[k]) return false;
    if (m.npcs.some(o => o !== n && npcVisible(o) && ((o.cx === x && o.cy === y) || (o.mv && o.fx === x && o.fy === y)))) return false;
    if (Math.abs(P.x - x) + Math.abs(P.y - y) <= 1 || Math.abs(P.tx - x) + Math.abs(P.ty - y) <= 1) return false;
    if (m.pickups.some(p => p.x === x && p.y === y && !G.flag(p.flag))) return false;
    return true;
  }
  const WSTEP = 0.55;
  function updateVillage(m, dt, rnd = Math.random) {
    const busy = G.lock > 0 || !!G.UI.kind || G.mode !== 'world';
    for (const n of m.npcs) {
      if (!npcVisible(n)) continue;
      if (n.pet) updatePet(n, dt);
      if (!n.wander) continue;
      if (n.mv) {
        n.mv.p = Math.min(1, n.mv.p + dt / WSTEP); n.ox = -n.mv.dx * (1 - n.mv.p) * T; n.oy = -n.mv.dy * (1 - n.mv.p) * T;
        if (n.mv.p >= 1) { n.mv = null; n.ox = n.oy = 0; } continue;
      }
      if (busy) continue;
      n.wt = (n.wt == null ? 1 + rnd() * 3 : n.wt) - dt;
      if (n.wt > 0) continue;
      n.wt = 1.2 + rnd() * 3.5;
      if (rnd() < 0.3) { n.cdir = ['up', 'down', 'left', 'right'][rnd() * 4 | 0]; continue; }   // schaut sich um
      const dirs = [[1, 0, 'right'], [-1, 0, 'left'], [0, 1, 'down'], [0, -1, 'up']].map(d => [rnd(), d]).sort((a, b) => a[0] - b[0]).map(x => x[1]);
      for (const [dx, dy, d] of dirs) {
        const nx = n.cx + dx, ny = n.cy + dy; if (!wanderOk(m, n, nx, ny)) continue;
        n.fx = n.cx; n.fy = n.cy; n.cx = nx; n.cy = ny; n.cdir = d; n.mv = { dx, dy, p: 0 }; n.ox = -dx * T; n.oy = -dy * T; n.steps = (n.steps || 0) + 1;
        if (n.pet && !n.pet.at) n.pet.to = [n.fx, n.fy];
        break;
      }
    }
  }
  function updatePet(n, dt) {
    const p = n.pet, [tx, ty] = p.to, gx = tx * T, gy = ty * T, dx = gx - p.px, dy = gy - p.py, d = Math.hypot(dx, dy), sp = 34 * dt;
    if (d <= sp) { p.px = gx; p.py = gy; p.moving = false; } else { p.px += dx / d * sp; p.py += dy / d * sp; p.moving = true; if (Math.abs(dx) > 1) p.face = dx > 0 ? 1 : -1; }
  }
  const petAt = (x, y) => { const n = G.map.npcs.find(o => o.pet && npcVisible(o) && Math.round(o.pet.px / T) === x && Math.round(o.pet.py / T) === y); return n && n.pet; };
  function petEnt(ctx, n, cx, cy, t) {
    const p = n.pet, sx = Math.round(p.px) - cx, sy = Math.round(p.py) - cy; if (sx < -30 || sy < -30 || sx > VW + 30 || sy > VH + 30) return null;
    return { y: p.py - 1, draw: () => {
      const hop = p.hover ? Math.sin(t * 2 + 1) * 2 - 5 : p.moving ? -Math.abs(Math.sin(t * 12)) * 2 : Math.sin(t * 2.4 + n.x) * 0.6;
      shadow(ctx, sx + 1, sy + 1, p.hover ? 4 : 5);
      const img = G.SPR.mon[p.sp].at(24, (t + n.x) % 3.3 < 0.14);
      ctx.save(); if ((p.face || -1) > 0) { ctx.translate(sx + 8, 0); ctx.scale(-1, 1); ctx.translate(-(sx + 8), 0); }
      ctx.drawImage(img, sx - 4, Math.round(sy - 10 + hop), 24, 24); ctx.restore();
    } };
  }
  G.World.village = { updateVillage, wanderOk, petAt, WSTEP };
  function npcFrame(n) {
    const spr = G.SPR[n.spr]; if (!spr) return null;
    if ((n.ox || n.oy) && spr.walk) { const d = Math.abs(n.ox) + Math.abs(n.oy), ph = (Math.floor(d / 8) + ((n.cx + n.cy) % 2) * 2) % 4;
      return { img: spr.walk[n.cdir][ph], lift: Math.round(Math.sin((d % 16) / 16 * Math.PI) * 2) / 2 }; }
    return { img: idleFrame(spr, n.cdir, G.time + hash(n.x, n.y, 5) * 9, (n.x * 7 + n.y * 3) % 5) || spr.down, lift: 0 };
  }
  // Staub/Tritt-Effekt: kleine Wölkchen auf Wegen, Halme im Gras
  const dust = [];
  G.World.anim = () => ({ ph: ANIM.player.frame ? ANIM.player.frame.ph : null, lift: ANIM.player.frame ? ANIM.player.frame.lift : 0, idle: ANIM.player.idle, dust: dust.length, dir: P.dir });
  G.World.stepFx = (x, y) => {
    if (G.lowFx) return;
    const c = at(G.map, x, y), px = x * T + 8, py = y * T + 15;
    if (c === ',' || c === 'D' || c === 'c' || c === 'm') for (let i = 0; i < 4; i++) dust.push({ x: px + (Math.random() - 0.5) * 6, y: py, vx: (Math.random() - 0.5) * 14, vy: -4 - Math.random() * 6, life: 0, max: 0.45 + Math.random() * 0.2, k: 0 });
    else if (c === '"' || c === 'q' || c === '.') for (let i = 0; i < 2; i++) dust.push({ x: px + (Math.random() - 0.5) * 8, y: py - 2, vx: (Math.random() - 0.5) * 10, vy: -10 - Math.random() * 6, life: 0, max: 0.4, k: 1 });
  };
  function renderDust(ctx, cx, cy, dt) {
    for (let i = dust.length - 1; i >= 0; i--) {
      const d = dust[i]; d.life += dt; if (d.life > d.max) { dust.splice(i, 1); continue; }
      d.x += d.vx * dt; d.y += d.vy * dt; d.vy += 20 * dt; const k = 1 - d.life / d.max;
      if (d.k) { ctx.fillStyle = `rgba(120,170,120,${0.7 * k})`; ctx.fillRect(d.x - cx, d.y - cy, 0.5, 1.5); }
      else { const r = 1 + d.life * 4; ctx.fillStyle = `rgba(150,140,160,${0.32 * k})`; ctx.beginPath(); ctx.ellipse(d.x - cx, d.y - cy, r, r * 0.6, 0, 0, 6.283); ctx.fill(); }
    }
  }
  const smoke = [];
  G.World.render = (ctx, dt, opt = {}) => {
    const m = opt.hidePlayer ? D : G.map; if (opt.hidePlayer && G.map !== D) { /* Titelbild zeigt immer das Dorf */ }
    const saved = G.map; G.map = m; prerender(m);
    const t = G.time, [cx, cy] = G.World.camera(opt.hidePlayer, dt);
    ctx.fillStyle = '#07060f'; ctx.fillRect(0, 0, VW, VH);
    ctx.drawImage(m.canvas, -cx, -cy);
    const x0 = Math.max(0, Math.floor(cx / T)), y0 = Math.max(0, Math.floor(cy / T));
    // animierte Kacheln
    for (let y = y0; y <= Math.min(m.h - 1, y0 + 15); y++) for (let x = x0; x <= Math.min(m.w - 1, x0 + 16); x++) {
      const c = at(m, x, y), sx = x * T - cx, sy = y * T - cy;
    }
    renderWater(ctx, m, cx, cy, t);
    renderProps(ctx, m, cx, cy, t, dt);
    renderSway(ctx, m, cx, cy, t);
    // Funde
    for (const p of m.pickups) {
      if (G.flag(p.flag)) continue;
      const sx = p.x * T - cx, sy = p.y * T - cy; if (sx < -16 || sy < -16 || sx > VW || sy > VH) continue;
      const b = 0.5 + 0.5 * Math.sin(t * 4 + p.x);
      if (p.kind === 'mint') { ctx.fillStyle = '#7ad07a'; ctx.fillRect(sx + 7, sy + 8, 2, 5); ctx.fillRect(sx + 5, sy + 9, 2, 2); ctx.fillRect(sx + 9, sy + 7, 2, 2); }
      ctx.fillStyle = `rgba(255,248,200,${0.5 + 0.5 * b})`; ctx.fillRect(sx + 7, sy + 4, 2, 2); ctx.fillRect(sx + 8, sy + 2, 1, 6); ctx.fillRect(sx + 5, sy + 5, 6, 1);
    }
    renderDust(ctx, cx, cy, dt);
    // Figuren
    const ents = [];
    updateVillage(m, dt);
    for (const n of m.npcs) {
      if (!npcVisible(n)) continue;
      const sx = n.cx * T - cx + n.ox, sy = n.cy * T - cy + n.oy;
      if (n.pet) { const pe = petEnt(ctx, n, cx, cy, t); if (pe) ents.push(pe); }
      ents.push({ y: n.cy * T + n.oy, draw: () => {
        if (n.mon) {
          const a = 0.75 + 0.2 * Math.sin(t * 1.5);
          const dark = n.mon === 'nachtmahr', gc = dark ? '120,40,120' : '200,215,245';   // Nachtmahr: violett-roter Schein statt hellem Geisterlicht
          const gr = ctx.createRadialGradient(sx + 8, sy + 2, 0, sx + 8, sy + 2, 34); gr.addColorStop(0, `rgba(${gc},${dark ? 0.3 + 0.1 * Math.sin(t * 3) : 0.35})`); gr.addColorStop(1, `rgba(${gc},0)`);
          ctx.fillStyle = gr; ctx.fillRect(sx - 30, sy - 32, 76, 70);
          if (dark) for (let i = 0; i < 6; i++) { const q = (t * 0.35 + i / 6) % 1, x = sx + 8 + Math.sin(i * 2.3 + t) * 10, y = sy - 4 - q * 26; ctx.fillStyle = `rgba(20,12,30,${0.35 * (1 - q)})`; ctx.beginPath(); ctx.arc(x, y, 3 + q * 5, 0, 6.3); ctx.fill(); }
          shadow(ctx, sx, sy + 2, 9); ctx.globalAlpha = a; ctx.drawImage(G.SPR.mon[n.mon].at(32, (t % 3.7) < 0.14), sx - 8, Math.round(sy - 18 + Math.sin(t * 1.2) * 2), 32, 32); ctx.globalAlpha = 1;
          return;
        }
        if (n.altar) {
          shadow(ctx, sx, sy + 1, 7); ctx.drawImage(altarArt(), sx, sy - 8);
          const fl = 0.8 + 0.2 * Math.sin(t * 9 + n.x);
          ctx.globalCompositeOperation = 'lighter'; const gf = ctx.createRadialGradient(sx + 8, sy - 5, 0, sx + 8, sy - 5, 9);
          gf.addColorStop(0, `rgba(255,190,90,${0.5 * fl})`); gf.addColorStop(1, 'rgba(255,190,90,0)'); ctx.fillStyle = gf; ctx.fillRect(sx - 2, sy - 15, 20, 20); ctx.globalCompositeOperation = 'source-over';
          if (story() < 2 && !(G.state && G.state.team.length)) {
            const col = G.TYPE_COLORS[G.SPECIES[n.altar].type], by = Math.round(sy - 30 + Math.sin(t * 1.6 + n.x) * 2);
            const gr = ctx.createRadialGradient(sx + 8, by + 12, 0, sx + 8, by + 12, 20); gr.addColorStop(0, col + '66'); gr.addColorStop(1, col + '00');
            ctx.globalCompositeOperation = 'lighter'; ctx.fillStyle = gr; ctx.fillRect(sx - 14, by - 10, 44, 44); ctx.globalCompositeOperation = 'source-over';
            ctx.drawImage(G.SPR.mon[n.altar].at(32, ((t + n.x * 1.3) % 3.4) < 0.14), sx - 4, by, 24, 24);
          }
          return;
        }
        const nf = npcFrame(n); shadow(ctx, sx, sy); drawChar(ctx, nf ? nf.img : G.SPR[n.spr].down, sx, sy - (nf ? nf.lift : 0));
        if (n.alert) { ctx.fillStyle = '#0a0814'; ctx.fillRect(sx + 3, sy - 23, 10, 13); ctx.fillStyle = '#f4ecff'; ctx.fillRect(sx + 4, sy - 22, 8, 11); ctx.fillStyle = '#c83a4a'; ctx.fillRect(sx + 7, sy - 20, 2, 5); ctx.fillRect(sx + 7, sy - 14, 2, 2); }
      } });
    }
    // Laternen: begehbar, nach y mit den Figuren sortiert (auf derselben Kachel steht der Pfahl vor der Figur)
    if (m.kind === 'outdoor') for (let y = y0; y <= Math.min(m.h - 1, y0 + 16); y++) for (let x = Math.max(0, x0 - 1); x <= Math.min(m.w - 1, x0 + 17); x++) {
      const c = m.tiles[y][x]; if (c !== 'L' && c !== 'e') continue;
      const lit = c === 'L' || G.flag(`lit_${m.id}_${x}_${y}`), sx = x * T - cx, sy = y * T - cy;
      ents.push({ y: y * T + 2, lantern: [x, y], draw: () => ctx.drawImage(lanternHi(lit), sx, sy, 16, 16) });
    }
    if (m.id === 'katzen') { updateCats(m, dt); catEnts(ctx, m, cx, cy, ents, t); }
    const pf = opt.hidePlayer ? null : playerFrame(dt);
    if (!opt.hidePlayer) ents.push({ y: P.py, draw: () => {
      // 4-Phasen-Gang: Kontakt links, Durchschwung, Kontakt rechts, Durchschwung (Wippen), im Stand Atmen/Blinzeln
      const sx = Math.round(P.px) - cx, sy = Math.round(P.py) - cy, f = pf;
      shadow(ctx, sx, sy, f.lift ? 6.4 : 7); drawChar(ctx, f.img, sx, sy - f.lift);
    } });
    const drawPlayer = !opt.hidePlayer && ents[ents.length - 1].draw;
    ents.sort((a, b) => a.y - b.y).forEach(e => e.draw());
    // Kaminrauch
    if (m === D && Math.random() < 0.25) m.houses.forEach(h => !h.church && smoke.push({ x: h.x * T + 49, y: h.y * T + 1, life: 0, vx: (Math.random() - 0.3) * 4 }));
    for (let i = smoke.length - 1; i >= 0; i--) {
      const s = smoke[i]; s.life += dt; s.y -= 7 * dt; s.x += (s.vx + Math.sin(s.life * 2) * 3) * dt;
      if (s.life > 3.5 || m !== D) { smoke.splice(i, 1); continue; }
      ctx.fillStyle = `rgba(170,160,200,${0.22 * (1 - s.life / 3.5)})`; const r = 1 + s.life; ctx.fillRect(Math.round(s.x - cx - r / 2), Math.round(s.y - cy), Math.ceil(r), Math.ceil(r));
    }
    renderSparks(ctx, cx, cy, dt);
    const plx = Math.round(P.px) - cx + 8 + ({ left: -5, right: 5, up: 4, down: 4 }[P.dir]), ply = Math.round(P.py) - cy + 8;
    // Nebelbänke (Encounter-Zonen): zwei wandernde Schichten, Klarsicht um die Laterne
    if (m.zoneFog) {
      renderZoneFog(ctx, m, cx, cy, t, dt, opt.hidePlayer ? null : [Math.round(P.px) - cx + 8, Math.round(P.py) - cy + 6]);
      // im Nebel bleibt die Spielfigur lesbar: sie wird über den Schwaden erneut gezeichnet
      if (drawPlayer && (ZONE_OF[at(m, P.x, P.y)] || ZONE_OF[at(m, P.tx, P.ty)])) drawPlayer();
    }
    const FL = m.kind === 'outdoor' && m.theme !== 'cave' && !G.lowFx && !G.fxOff.fog ? FOGLAYERS[m.theme === 'moor' ? 'moor' : m === K ? 'kueste' : 'dorf'] : null;
    // Dunkelheit + Lichter (vorgerechnete, weich auslaufende Licht-Sprites)
    const dusk = G.dusk(), dark = Math.max(0.12, 0.34 + 0.28 * dusk + m.dark), night = Math.max(0, Math.min(1, (dark - 0.3) / 0.5));
    lg.globalCompositeOperation = 'source-over'; lg.clearRect(0, 0, VW, VH);
    lg.fillStyle = `rgba(12,8,32,${dark})`; lg.fillRect(0, 0, VW, VH);
    lg.globalCompositeOperation = 'destination-out'; lg.imageSmoothingEnabled = true;
    const vis = [];
    for (const L of lightsFor(m)) {
      if (L.cond && !L.cond()) continue;
      const x = L.x - cx, y = L.y - cy; if (x < -90 || y < -90 || x > VW + 90 || y > VH + 90) continue;
      const fl = L.warm ? 1 + 0.05 * Math.sin(t * 9 + L.fl) + 0.03 * Math.sin(t * 23 + L.fl * 2) : 0.8 + 0.2 * Math.sin(t * 1.5 + L.fl);
      vis.push([x, y, L.r * fl, L]);
    }
    if (!opt.hidePlayer) vis.push([plx, ply, m.plight * (1 + 0.04 * Math.sin(t * 11)), { warm: 1, self: 1 }]);
    const wisps = m.theme === 'moor' && m.kind === 'outdoor' ? updateWisps(m, t, dt) : null;
    for (const [x, y, r, L] of vis) { spr(lg, LSPR.hole, x, y, r); if (L.win) spr(lg, LSPR.hole, x, y + 18, 22, 8); }
    if (wisps) for (const w of wisps) spr(lg, LSPR.hole, w.x - cx, w.y - cy, 20 * w.a);
    ctx.drawImage(lightC, 0, 0);
    ctx.globalCompositeOperation = 'lighter'; ctx.imageSmoothingEnabled = true;
    for (const [x, y, r, L] of vis) {
      // eigene Laterne: schwächerer, tiefer liegender Schein, damit die Figur (schwarzes Haar) nicht ausbleicht
      if (L.self) { ctx.globalAlpha = 0.14; spr(ctx, LSPR.warm, x, y + 7, r * 0.8); continue; }
      ctx.globalAlpha = L.warm ? 0.3 : 0.2; spr(ctx, L.warm ? LSPR.warm : L.ghost ? LSPR.ghost : LSPR.cool, x, y, r * 0.8);
      // Fensterlicht fällt als warmer Schein auf den Boden vor dem Haus (nachts stärker)
      if (L.win) { ctx.globalAlpha = 0.16 + 0.3 * night; spr(ctx, LSPR.warm, x, y + 18, 22, 8); ctx.globalAlpha = 0.35 + 0.3 * night; spr(ctx, LSPR.warm, x, y, 7, 5); }
    }
    if (wisps) for (const w of wisps) {
      const x = w.x - cx, y = w.y - cy; if (x < -30 || y < -30 || x > VW + 30 || y > VH + 30) continue;
      ctx.globalAlpha = 0.6 * w.a; spr(ctx, LSPR.wisp, x, y, 16); ctx.globalAlpha = w.a; spr(ctx, LSPR.core, x, y, 3.4);
    }
    ctx.globalAlpha = 1; ctx.imageSmoothingEnabled = false;
    // v16: Figur nicht von Laternenschein ausbleichen lassen – Sprite halbtransparent über das additive Licht legen (Haar bleibt schwarz)
    if (pf && !opt.hidePlayer) { ctx.globalCompositeOperation = 'source-over'; ctx.globalAlpha = 0.6; drawChar(ctx, pf.img, Math.round(P.px) - cx, Math.round(P.py) - cy - pf.lift); ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'lighter'; }
    renderStoryGlow(ctx, m, cx, cy, t);
    renderRareHint(ctx, m, cx, cy, t);
    if (G.World.healFx != null && !opt.hidePlayer) renderHealFx(ctx, Math.round(P.px) - cx + 8, Math.round(P.py) - cy, G.World.healFx, t);
    for (const f of m.flies) {
      f.x += Math.sin(t * 0.7 + f.ph) * 6 * dt; f.y += Math.cos(t * 0.9 + f.ph * 1.3) * 5 * dt;
      const x = f.x - cx, y = f.y - cy; if (x < -5 || y < -5 || x > VW + 5 || y > VH + 5) continue;
      const b = Math.pow(0.5 + 0.5 * Math.sin(t * 2.1 + f.ph), 3) * (0.5 + dusk * 0.6); if (b < 0.03) continue;
      const gr = ctx.createRadialGradient(x, y, 0, x, y, 5); gr.addColorStop(0, `rgba(${f.c},${0.6 * b})`); gr.addColorStop(1, `rgba(${f.c},0)`);
      ctx.fillStyle = gr; ctx.fillRect(x - 5, y - 5, 10, 10); ctx.fillStyle = `rgba(255,255,230,${b})`; ctx.fillRect(Math.round(x), Math.round(y), 1, 1);
    }
    ctx.globalCompositeOperation = 'source-over';
    for (const f of m.fog) {
      f.x += f.vx * dt; if (f.x - f.r > m.w * T) f.x = -f.r;
      const x = f.x - cx, y = f.y - cy + Math.sin(t * 0.3 + f.ph) * 6; if (x < -f.r || y < -f.r || x > VW + f.r || y > VH + f.r) continue;
      const a = m.fogA * (0.75 + 0.25 * Math.sin(t * 0.4 + f.ph));
      const gr = ctx.createRadialGradient(x, y, 0, x, y, f.r); gr.addColorStop(0, `rgba(190,200,228,${a})`); gr.addColorStop(1, 'rgba(190,200,228,0)');
      ctx.fillStyle = gr; ctx.fillRect(x - f.r, y - f.r, f.r * 2, f.r * 2);
    }
    if (FL) fogLayers(ctx, cx, cy, t, FL);   // ferne (Parallaxe 0.55) und nahe (1.25) Nebelschicht
    renderEvents(ctx, m, cx, cy, t, dt, opt);
    ctx.drawImage(vign, 0, 0);
    renderLegend(ctx, cx, cy, t);
    if (!opt.hidePlayer) renderMarkers(ctx, m, cx, cy, t);
    // Laternenstein-Vorstellung: der Geist gross im Bild, während man seine Beschreibung liest
    if (G.World.showcase && !opt.hidePlayer) {
      const sp = G.World.showcase, col = G.TYPE_COLORS[G.SPECIES[sp].type], y = 62 + Math.sin(t * 2) * 3;
      ctx.fillStyle = 'rgba(6,4,18,0.45)'; ctx.fillRect(0, 0, VW, VH);
      const gr = ctx.createRadialGradient(128, y, 0, 128, y, 58); gr.addColorStop(0, col + '66'); gr.addColorStop(1, col + '00');
      ctx.globalCompositeOperation = 'lighter'; ctx.fillStyle = gr; ctx.fillRect(60, y - 70, 136, 140); ctx.globalCompositeOperation = 'source-over';
      ctx.drawImage(G.SPR.mon[sp].at(80, (t % 3.2) < 0.14), 88, Math.round(y - 40), 80, 80);
    }
    G.map = saved;
  };
  // ---------- v15: seltene Umgebungs-Ereignisse ----------
  // Blätterwirbel (Dorf/Küste), Schilfflaum (Moor), Krähen, Fischsprung, Sternschnuppe – je nach Ort, Tageszeit und Nebel.
  // Selten: pro Art zufällige Abklingzeit 60–180 s, dazu mindestens 75 s zwischen zwei beliebigen Ereignissen; nie mehrere gleichzeitig.
  const AMB = { next: {}, last: -1e9, cur: null, log: [], GAP: 75, CD: [60, 180] };
  const visibleWater = (m, cx, cy) => { const out = []; for (let y = Math.max(0, cy / T | 0); y < Math.min(m.h, (cy + VH) / T | 0); y++) for (let x = Math.max(0, cx / T | 0); x < Math.min(m.w, (cx + VW) / T | 0); x++) { const c = m.tiles[y][x]; if ((c === '~' || c === 'w') && at(m, x, y - 1) !== 'T') out.push([x, y]); } return out; };
  // welche Ereignisse passen hier gerade? (ctx: { map, theme, kind, dusk, fog, water })
  function ambKinds(c) {
    if (c.kind !== 'outdoor' || c.theme === 'cave') return [];
    const k = [];
    if (c.theme !== 'moor' && (c.map === 'dorf' || c.map === 'kueste')) k.push('leaves');
    if (c.theme === 'moor') k.push('fluff');
    if (c.map === 'dorf' || c.theme === 'moor') k.push('crows');
    if (c.water) k.push('fish');
    if (c.dusk > 0.45 && c.fog < 0.12) k.push('star');
    return k;
  }
  // ein Takt der Ereignis-Uhr (reine Logik, auch für Tests): liefert die gestartete Art oder null
  function ambTick(now, c, rnd = Math.random) {
    if (AMB.cur || now - AMB.last < AMB.GAP) return null;
    const kinds = ambKinds(c).filter(k => { if (AMB.next[k] == null) AMB.next[k] = now + 20 + rnd() * 60; return now >= AMB.next[k]; });
    if (!kinds.length || rnd() > 0.006) return null;      // ~0,6 % pro Takt (Takt ≈ 0.25 s), sobald etwas bereit ist
    const k = kinds[rnd() * kinds.length | 0];
    AMB.next[k] = now + AMB.CD[0] + rnd() * (AMB.CD[1] - AMB.CD[0]); AMB.last = now;
    AMB.log.push({ k, t: now, map: c.map }); if (AMB.log.length > 200) AMB.log.shift();
    return k;
  }
  let ambAcc = 0;
  function startAmb(k, m, cx, cy, wat) {
    const dir = Math.random() < 0.5 ? 1 : -1, E = { k, t: 0, dur: 4, parts: [], dir };
    const wind = m.id === 'kueste' ? -1 : 1;  // Küstenwind weht landeinwärts (nach Westen), sonst nach Osten
    if (k === 'leaves' || k === 'fluff') {
      E.dir = wind; E.dur = k === 'leaves' ? 4.5 : 6;
      const n = k === 'leaves' ? 14 : 18, cols = k === 'leaves' ? ['#c8642a', '#e09a3a', '#a8402a', '#d8b050', '#8a5a2a'] : ['#f0ece0', '#e4e0d4', '#d8d0c0'];
      for (let i = 0; i < n; i++) E.parts.push({ x: (wind > 0 ? -20 - Math.random() * 120 : VW + 20 + Math.random() * 120), y: 20 + Math.random() * (VH - 50), vx: wind * (60 + Math.random() * 50) * (k === 'fluff' ? 0.5 : 1),
        vy: (Math.random() - 0.5) * 12, ph: Math.random() * 6, spin: 3 + Math.random() * 5, c: cols[i % cols.length], s: k === 'leaves' ? 2 + (Math.random() < 0.4) : 1 });
      G.Snd.sfx('gust', wind * 0.4, k === 'fluff' ? 0.6 : 1);
    } else if (k === 'crows') {
      E.dur = 5.5; const y0 = 14 + Math.random() * 40, n = 2 + (Math.random() < 0.5);
      for (let i = 0; i < n; i++) E.parts.push({ x: dir > 0 ? -16 - i * 18 : VW + 16 + i * 18, y: y0 + i * 7 + Math.random() * 5, vx: dir * (58 + Math.random() * 10), ph: Math.random() * 6 });
      setTimeout(() => G.Snd.sfx('caw', dir * -0.5, 0.8), 900);
    } else if (k === 'fish') {
      const [x, y] = wat[Math.random() * wat.length | 0]; E.dur = 1.8; E.wx = x * T + 8; E.wy = y * T + 9; E.dir = dir; G.Snd.sfx('fish', 0, 0.8);
    } else if (k === 'star') {
      E.dur = 1.2; E.x0 = 40 + Math.random() * (VW - 80); E.y0 = 8 + Math.random() * 30; E.dir = dir; G.Snd.sfx('star', 0, 0.7);
    }
    AMB.cur = E; G.World.lastAmbient = k;
  }
  function renderEvents(ctx, m, cx, cy, t, dt, opt) {
    if (opt.hidePlayer || G.mode !== 'world') return;
    ambAcc += dt;
    if (ambAcc >= 0.25 && !G.World.camFocus && G.lock === 0) {
      ambAcc = 0;
      const wat = m.kind === 'outdoor' ? visibleWater(m, cx, cy) : [];
      const k = ambTick(G.time, { map: m.id, theme: m.theme, kind: m.kind, dusk: G.dusk(), fog: m.fogA + (ZONE_OF[at(m, P.x, P.y)] ? 0.2 : 0), water: wat.length > 0 });
      if (k) startAmb(k, m, cx, cy, wat);
    }
    const E = AMB.cur; if (!E) return;
    E.t += dt; if (E.t > E.dur || G.map.id !== (E.map || (E.map = m.id))) { AMB.cur = null; return; }
    const f = Math.min(1, E.t / 0.4, (E.dur - E.t) / 0.6);
    if (E.k === 'leaves' || E.k === 'fluff') for (const p of E.parts) {
      p.x += p.vx * dt; p.ph += dt * p.spin; p.y += (p.vy + Math.sin(p.ph) * (E.k === 'leaves' ? 22 : 8)) * dt;
      ctx.globalAlpha = f * (E.k === 'fluff' ? 0.8 : 1); ctx.fillStyle = p.c;
      if (E.k === 'leaves') { const w = Math.abs(Math.cos(p.ph)) * p.s + 1; ctx.fillRect(Math.round(p.x), Math.round(p.y), Math.round(w), p.s); ctx.fillStyle = '#5a2a1a'; ctx.fillRect(Math.round(p.x), Math.round(p.y + p.s), 1, 1); }
      else { ctx.fillRect(Math.round(p.x), Math.round(p.y), 1, 1); ctx.globalAlpha *= 0.4; ctx.fillRect(Math.round(p.x) - 1, Math.round(p.y), 3, 1); ctx.fillRect(Math.round(p.x), Math.round(p.y) - 1, 1, 3); }
    } else if (E.k === 'crows') for (const p of E.parts) {
      p.x += p.vx * dt; p.ph += dt * 9; const wy = Math.sin(p.ph) > 0 ? -2 : 1, x = Math.round(p.x), y = Math.round(p.y + Math.sin(p.ph * 0.2) * 3);
      ctx.globalAlpha = 0.9 * f; ctx.fillStyle = '#0c0a12'; ctx.fillRect(x - 1, y, 3, 2); ctx.fillRect(x - 4, y + wy, 3, 1); ctx.fillRect(x + 2, y + wy, 3, 1); ctx.fillRect(x - 2, y + wy * 0.5, 1, 1); ctx.fillRect(x + 2, y + wy * 0.5, 1, 1); ctx.fillRect(x + (E.dir > 0 ? 2 : -2), y, 1, 1);
    } else if (E.k === 'fish') {
      const q = Math.min(1, E.t / 0.9), x = E.wx - cx + E.dir * (q - 0.5) * 14, y = E.wy - cy - Math.sin(q * Math.PI) * 12;
      if (E.t < 0.9) { ctx.globalAlpha = 1; ctx.fillStyle = '#a8c0d0'; ctx.fillRect(Math.round(x) - 2, Math.round(y), 5, 2); ctx.fillStyle = '#e8f4ff'; ctx.fillRect(Math.round(x) - 1, Math.round(y), 2, 1); ctx.fillStyle = '#6a8aa0'; ctx.fillRect(Math.round(x) - E.dir * 3, Math.round(y) + (q < 0.5 ? 1 : -1), 1, 2); }
      for (const [t0, x0] of [[0, -E.dir * 7], [0.9, E.dir * 7]]) { const a = E.t - t0; if (a < 0 || a > 0.9) continue; ctx.globalAlpha = (1 - a / 0.9) * 0.8; ctx.strokeStyle = '#cfe4f4'; ctx.lineWidth = 1; ctx.beginPath(); ctx.ellipse(E.wx - cx + x0, E.wy - cy, 2 + a * 9, 1 + a * 3, 0, 0, Math.PI * 2); ctx.stroke(); }
    } else if (E.k === 'star') {
      const q = E.t / E.dur, x = E.x0 + E.dir * q * 70, y = E.y0 + q * 26;
      ctx.globalCompositeOperation = 'lighter';
      for (let i = 0; i < 12; i++) { const b = (1 - i / 12) * Math.sin(q * Math.PI); ctx.globalAlpha = b * 0.8; ctx.fillStyle = i ? '#b8d0ff' : '#ffffff'; ctx.fillRect(Math.round(x - E.dir * i * 2.2), Math.round(y - i * 0.8), 1, 1); }
      ctx.globalCompositeOperation = 'source-over';
    }
    ctx.globalAlpha = 1;
  }
  G.World.ambient = { AMB, ambKinds, ambTick, reset: () => { AMB.next = {}; AMB.last = -1e9; AMB.cur = null; AMB.log = []; },
    force: k => { const m = G.map, [cx, cy] = G.World.camera(false, 0); const wat = visibleWater(m, cx, cy); if (k === 'fish' && !wat.length) return false; startAmb(k, m, cx, cy, wat); AMB.log.push({ k, t: G.time, map: m.id, forced: 1 }); return true; } };
  // ---------- Schmiede & Mühle: Esse, Funken, Wasserrad, Klänge ----------
  const sparks = []; let hammerT = 0.6, creakT = 1, splashT = 0.3;
  const spark = (x, y, vx, vy, life = 0.7, kind) => { const o = { x, y, vx, vy, life, max: life, moon: kind === 'moon' }; if (sparks.length < 90) sparks.push(o); return o; };
  const near = (x, y, r) => { const d = Math.hypot(P.x - x, P.y - y); return d < r ? 1 - d / r : 0; };
  function renderProps(ctx, m, cx, cy, t, dt) {
    const glow = (x, y, r, a, col = '255,150,60') => { const gr = ctx.createRadialGradient(x, y, 0, x, y, r); gr.addColorStop(0, `rgba(${col},${a})`); gr.addColorStop(1, `rgba(${col},0)`); ctx.fillStyle = gr; ctx.fillRect(x - r, y - r, r * 2, r * 2); };
    const fl = 0.8 + 0.12 * Math.sin(t * 11) + 0.08 * Math.sin(t * 27);
    if (m === D) {
      for (const h of m.houses) {
        if (h.art === 'schmiede') {
          const fx = h.x * T + 46 - cx, fy = h.y * T + 34 - cy;
          if (fx > -60 && fx < VW + 60 && fy > -60 && fy < VH + 60) {
            ctx.globalCompositeOperation = 'lighter'; glow(fx, fy, 22, 0.34 * fl); glow(fx, fy + 20, 34, 0.12 * fl); ctx.globalCompositeOperation = 'source-over';
            if (Math.random() < dt * 5) spark(h.x * T + 50 + (Math.random() - 0.5) * 6, h.y * T - 12, (Math.random() - 0.5) * 10, -18 - Math.random() * 16, 1.2);
          }
          const v = near(h.x + 1, h.y + 2, 9); hammerT -= dt;
          if (hammerT <= 0) { hammerT = 0.9 + Math.random() * 0.3; if (v > 0 && G.mode === 'world') G.Snd.sfx('hammer', null, 0.25 + 0.45 * v); }
        }
        if (h.art === 'muehle') {
          const wx = 6 * T + 8 - cx, wy = 8 * T + 14 - cy;
          if (wx > -30 && wx < VW + 30 && wy > -30 && wy < VH + 30) {
            ctx.drawImage(wheelFrames()[Math.floor(t * 8) % 12], wx - 15, wy - 15);
            if (Math.random() < dt * 14) spark(6 * T + 2 + Math.random() * 12, 9 * T + 12, (Math.random() - 0.5) * 14, -14 - Math.random() * 10, 0.5).water = 1;
          }
          const v = near(6, 8, 8); creakT -= dt; splashT -= dt;
          if (creakT <= 0) { creakT = 1.5 + Math.random() * 0.8; if (v > 0 && G.mode === 'world') G.Snd.sfx('creak', null, 0.2 + 0.5 * v); }
          if (splashT <= 0) { splashT = 0.35 + Math.random() * 0.4; if (v > 0.2 && G.mode === 'world') G.Snd.sfx('splash', null, 0.3 * v); }
        }
      }
    } else if (m === K) {
      if (shipShown()) {
        const off = (arrive.off || 0) * 230, bob = Math.round(Math.sin(t * 1.3) * 1.2 + (arrive.off ? Math.sin(t * 3) * 1 : 0));
        const x = 16 * T + 2 + off - cx, y = 17 * T - 16 + bob - cy;
        if (x > -100 && x < VW + 10) {
          ctx.fillStyle = 'rgba(4,6,14,0.45)'; ctx.beginPath(); ctx.ellipse(x + 48, y + 54, 46, 5, 0, 0, Math.PI * 2); ctx.fill();
          ctx.drawImage(shipArt(), x, y);
          ctx.fillStyle = 'rgba(170,200,255,0.35)'; for (let i = 0; i < 5; i++) ctx.fillRect(Math.round(x + 8 + i * 18 + Math.sin(t * 2 + i) * 2), y + 55, 7, 1);
          if (arrive.off > 0.02 && Math.random() < 0.6) spark(16 * T + 2 + off + 2, 17 * T + 38, -10 - Math.random() * 20, -12 - Math.random() * 10, 0.5).water = 1;
        }
      }
    } else if (m.id === 'leuchtturm') {
      const p = lampLevel(), x = 4 * T - cx, y = 2 * T - 14 - cy;
      ctx.drawImage(lampArt(false), x, y);
      if (p > 0) { ctx.globalAlpha = Math.min(1, p); ctx.drawImage(lampArt(true), x, y); ctx.globalAlpha = 1; }
    } else if (m.id === 'schmiede') {
      ctx.globalCompositeOperation = 'lighter';
      for (let y = 0; y < m.h; y++) for (let x = 0; x < m.w; x++) if (m.tiles[y][x] === 'F') glow(x * T + 8 - cx, y * T + 11 - cy, 16, 0.4 * fl);
      ctx.globalCompositeOperation = 'source-over';
      hammerT -= dt;
      if (hammerT <= 0) { hammerT = 0.95 + Math.random() * 0.25; if (G.mode === 'world') G.Snd.sfx('hammer', null, 0.9);
        for (let i = 0; i < 12; i++) { const a = -Math.PI / 2 + (Math.random() - 0.5) * 2.6, v = 30 + Math.random() * 50; spark(5 * T + 8, 1 * T + 6, Math.cos(a) * v, Math.sin(a) * v, 0.4 + Math.random() * 0.3); } }
    } else if (m.id === 'muehle') {
      const a = t * 1.6, x0 = 1 * T + 16 - cx, y0 = 1 * T + 7 - cy;
      ctx.strokeStyle = 'rgba(40,34,38,0.8)'; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(x0 + Math.cos(a) * 2, y0 + Math.sin(a) * 1.4); ctx.lineTo(x0 + Math.cos(a) * 6, y0 + Math.sin(a) * 4); ctx.stroke();
      creakT -= dt; if (creakT <= 0) { creakT = 2 + Math.random(); if (G.mode === 'world') G.Snd.sfx('creak', null, 0.35); }
    }
  }
  // Laternenstein (16×22), Schiff «Nebelschwalbe» (96×58), grosse Lampe mit Stufenlinse (32×30)
  let ALTAR = null; const SHIP = {}, LAMP = {};
  const LANT = {}; const lanternHi = lit => LANT[+lit] || (LANT[+lit] = G.scale2x(G.Tiles.lantern(lit)));   // wie früher in der Karte: kantengerichtet verdoppelt
  function altarArt() {
    if (ALTAR) return ALTAR;
    const S = new G.Art.Shape();
    S.R(4, 8, 8, 12, '#5e5a70', { name: 'col' }).R(4, 11, 8, 1, '#4a4658', { clip: 'col', flat: true, line: false }).R(4, 15, 8, 1, '#4a4658', { clip: 'col', flat: true, line: false });
    S.R(2, 19, 12, 3, '#4a4658'); S.E(8, 7.5, 6, 2.2, '#6e6a84', { name: 'bowl' }); S.E(8, 6.6, 4, 1, '#2a1c14', { flat: true, line: false });
    S.E(8, 4, 1.8, 2.8, '#ffb040', { glow: true, noOutline: true }).E(8, 4.6, 0.9, 1.5, '#fff0c0', { glow: true, noOutline: true });
    S.E(5, 17, 1.4, 1, '#3e6a44', { flat: true, line: false });
    return (ALTAR = G.Art.raster(S, 16, 22, 1));
  }
  function shipArt() {
    if (SHIP.c) return SHIP.c;
    const S = new G.Art.Shape();
    S.R(49, 1, 2.4, 38, '#4a3628'); S.R(36, 8, 28, 2, '#4a3628');
    S.E(50, 11, 13, 2.6, '#c8bca0', { name: 'sail' }).C(40, 11, 60, 11, 0.6, '#9a8e76', { clip: 'sail', flat: true, line: false });
    S.P([[51, 2], [61, 4], [51, 6]], '#8a3a3a');
    S.C(52, 3, 90, 26, 0.5, '#2e2420', { line: false }).C(48, 3, 6, 30, 0.5, '#2e2420', { line: false });
    S.R(66, 24, 24, 13, '#5a4030', { name: 'cab' }).R(64, 22, 28, 3, '#3a2c24');
    S.R(70, 27, 5, 4, '#ffc050', { glow: true }).R(80, 27, 5, 4, '#ffc050', { glow: true });
    S.C(10, 36, 0, 29, 1.6, '#4a3628');
    S.P([[2, 34], [94, 35], [86, 53], [12, 52]], '#4a3426', { name: 'hull' });
    S.R(0, 34, 96, 3, '#6a5040', { clip: 'hull', flat: true, line: false }).R(0, 41, 96, 2, '#2e2018', { clip: 'hull', flat: true, line: false }).R(0, 47, 96, 1.4, '#2e2018', { clip: 'hull', flat: true, line: false });
    for (const x of [28, 42, 56, 70]) S.E(x, 44.5, 1.6, 1.6, '#ffc868', { glow: true, clip: 'hull' });
    S.R(14, 38, 20, 3, '#d8c8a0', { clip: 'hull', flat: true, line: false, alpha: 0.5 });
    S.E(5, 30, 2, 2.6, '#ffd27a', { glow: true }).E(91, 20, 2, 2.6, '#ffd27a', { glow: true });
    return (SHIP.c = G.Art.raster(S, 96, 58, 1));
  }
  function lampArt(lit) {
    if (LAMP[lit]) return LAMP[lit];
    const S = new G.Art.Shape();
    S.R(3, 24, 26, 6, '#5a4a3a'); S.R(8, 20, 16, 5, '#8a6a3a', { name: 'base' }).R(8, 21, 16, 1, '#b08a4a', { clip: 'base', flat: true, line: false });
    const ring = lit ? ['#ffcf70', '#fff0c0', '#ffd88a', '#fffbea'] : ['#34404e', '#4a5868', '#3a4656', '#566476'];
    S.E(16, 12, 11, 10, ring[0], lit ? { glow: true, name: 'lens' } : { name: 'lens' });
    [[8.5, 7.8], [6, 5.4], [3.4, 3]].forEach(([rx, ry], i) => S.E(16, 12, rx, ry, ring[i + 1], lit ? { glow: true, clip: 'lens', flat: true, line: false } : { clip: 'lens', flat: true, line: false }));
    S.R(15, 0, 2, 3, '#6a5a4a'); S.E(16, 2, 4, 1.4, '#6a5a4a');
    return (LAMP[lit] = G.Art.raster(S, 32, 30, 1));
  }
  function renderStoryGlow(ctx, m, cx, cy, t) {
    const glow = (x, y, r, a, col = '255,200,120') => { const gr = ctx.createRadialGradient(x, y, 0, x, y, r); gr.addColorStop(0, `rgba(${col},${a})`); gr.addColorStop(1, `rgba(${col},0)`); ctx.fillStyle = gr; ctx.fillRect(x - r, y - r, r * 2, r * 2); };
    ctx.globalCompositeOperation = 'lighter';
    if (m === K) {
      if (story() >= 6) {
        const lx = 21 * T + 24 - cx, ly = 4 * T - 45 - cy, a = t * 0.7;
        for (const s0 of [0, Math.PI]) {
          const ang = a + s0, Ln = 230, w = 0.15, ex = lx + Math.cos(ang) * Ln, ey = ly + Math.sin(ang) * Ln * 0.45;
          { // weicher Streulichtkegel im Nebel um den Strahl
            const g2 = ctx.createLinearGradient(lx, ly, ex, ey); g2.addColorStop(0, 'rgba(255,228,170,0.14)'); g2.addColorStop(1, 'rgba(255,228,170,0)');
            ctx.fillStyle = g2; ctx.beginPath(); ctx.moveTo(lx, ly); ctx.lineTo(lx + Math.cos(ang - 0.34) * Ln, ly + Math.sin(ang - 0.34) * Ln * 0.45); ctx.lineTo(lx + Math.cos(ang + 0.34) * Ln, ly + Math.sin(ang + 0.34) * Ln * 0.45); ctx.closePath(); ctx.fill(); }
          const gr = ctx.createLinearGradient(lx, ly, ex, ey); gr.addColorStop(0, 'rgba(255,228,160,0.5)'); gr.addColorStop(0.5, 'rgba(255,228,160,0.16)'); gr.addColorStop(1, 'rgba(255,228,160,0)');
          ctx.fillStyle = gr; ctx.beginPath(); ctx.moveTo(lx, ly);
          ctx.lineTo(lx + Math.cos(ang - w) * Ln, ly + Math.sin(ang - w) * Ln * 0.45); ctx.lineTo(lx + Math.cos(ang + w) * Ln, ly + Math.sin(ang + w) * Ln * 0.45); ctx.closePath(); ctx.fill();
        }
        glow(lx, ly, 26, 0.6 + 0.1 * Math.sin(t * 7)); glow(lx, ly, 60, 0.16);
      }
      if (shipShown()) {
        const off = (arrive.off || 0) * 230, x = 16 * T + 2 + off - cx, y = 17 * T - 16 - cy, f = 0.85 + 0.15 * Math.sin(t * 8);
        glow(x + 5, y + 30, 12, 0.45 * f); glow(x + 91, y + 20, 11, 0.4 * f); glow(x + 77, y + 29, 14, 0.18 * f);
      }
    } else if (m.id === 'leuchtturm') {
      const p = lampLevel(); if (p > 0) glow(4 * T + 16 - cx, 2 * T - 2 - cy, 40, 0.42 * p * (0.9 + 0.1 * Math.sin(t * 6)));
    }
    ctx.globalCompositeOperation = 'lighter';
  }
  // Heilung in der Kirche: Mondlichtsäule über der Spielfigur, heller Ring am Boden
  // v17: Schimmer an den Stellen, wo ein Sondergeist bald erscheinen könnte (nach ~15 Kämpfen im Gebiet)
  function renderRareHint(ctx, m, cx, cy, t) {
    const tiles = G.World.rareHintTiles(m, Math.floor(cx / T) - 1, Math.floor(cy / T) - 1, Math.ceil((cx + VW) / T) + 1, Math.ceil((cy + VH) / T) + 1);
    if (!tiles.length) return;
    ctx.globalCompositeOperation = 'lighter';
    for (const [x, y, sp] of tiles) {
      const h = hash(x, y, 7), ph = t * 1.6 + h * 6.28, k = Math.pow(0.5 + 0.5 * Math.sin(ph), 4);
      if (k < 0.04) continue;
      const col = G.TYPE_COLORS[G.SPECIES[sp].type] || '#ffffff';
      const px = x * T - cx + 3 + (h * 97 % 10), py = y * T - cy + 4 + (h * 53 % 8) - k * 2;
      const gr = ctx.createRadialGradient(px, py, 0, px, py, 6); gr.addColorStop(0, col + '99'); gr.addColorStop(1, col + '00');
      ctx.globalAlpha = k; ctx.fillStyle = gr; ctx.fillRect(px - 6, py - 6, 12, 12);
      ctx.fillStyle = '#fffbe8'; ctx.fillRect(Math.round(px), Math.round(py) - 2, 1, 5); ctx.fillRect(Math.round(px) - 2, Math.round(py), 5, 1);
    }
    ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over';
  }
  function renderHealFx(ctx, x, y, p, t) {
    const a = Math.sin(Math.PI * Math.min(1, p)) , w = 10 + 6 * a;
    ctx.globalCompositeOperation = 'lighter';
    const g = ctx.createLinearGradient(x, y - 70, x, y + 16); g.addColorStop(0, 'rgba(200,215,255,0)'); g.addColorStop(0.6, `rgba(200,215,255,${0.35 * a})`); g.addColorStop(1, `rgba(230,238,255,${0.5 * a})`);
    ctx.fillStyle = g; ctx.fillRect(x - w, y - 70, w * 2, 86);
    ctx.globalAlpha = 0.6 * a; spr(ctx, LSPR.cool, x, y + 14, 22 + 10 * p, 8 + 3 * p); ctx.globalAlpha = 0.5 * a; spr(ctx, LSPR.cool, x, y + 2, 16);
    ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over';
  }
  // ---- Aufgaben-Markierungen: «!» wer die Geschichte (oder eine Nebenaufgabe) jetzt weiterbringt, «?» für Abgaben ----
  // vollständig aus den Story-Flags abgeleitet; Ziele sind ausschliesslich Personen (NPC-IDs)
  const MARKS = {
    dorf: [
      // nur Personen tragen Markierungen (keine Häuser, Türen, Zettel, Schilder, Steine); während der Führung trägt Ilse das «!»
      { id: 'ilse', m: () => { const st = story(); if (G.state.flags.gift && G.state.flags.gift !== 1 && G.state.team.length) return '!'; if (tour.active || st === 0 || st === 3 || (st === 2 && G.state.flags.tour === 0)) return '!'; if (q1() === 6) return '?'; if (st >= 4 && q1() === 0 && G.flag('note')) return '!'; } },
      { id: 'wido', m: () => q1() === 1 ? '!' : null },
    ],
    home: [{ id: 'mutter', m: () => story() === 6 ? '!' : null }, { id: 'vater', m: () => story() === 6 ? '!' : null }],
    hoehle: [{ id: 'mandy', m: () => story() >= 4 && !G.flag('quantum') ? '!' : null }],
    katzen: [{ id: 'cassandra', m: () => !G.flag('kc') || giftReady() ? '!' : null }],
    kueste: [{ id: 'onnoS', m: () => story() >= 4 && story() < 6 && (!G.FEAT.cave || G.flag('quantum')) ? '!' : null }, { id: 'wenke', m: () => story() >= 8 && !G.flag('wenke') ? '!' : null }],
    tiefesmoor: [{ id: 'kaspar', m: () => q1() === 4 ? '!' : null }]
  };
  // aktuelle Markierungen einer Karte: [{ id, kind, x, y }]
  function markersFor(m) {
    const out = [];
    if (!G.state) return out;
    for (const e of MARKS[m.id] || []) {
      const k = e.m(); if (!k) continue;
      const n = m.npcs.find(o => o.id === e.id); if (!n || !npcVisible(n) || !n.spr) continue;   // nur Personen (NPCs mit Figur)
      out.push({ id: e.id, kind: k, x: n.cx, y: n.cy, n });
    }
    return out;
  }
  G.World.markers = (id) => markersFor(id ? G.MAPS[id] : G.map).map(o => ({ id: o.id, kind: o.kind }));
  const MARKSPR = {};
  function markSprite(kind) {
    if (MARKSPR[kind]) return MARKSPR[kind];
    // Comic-Sprechblase: dicke Kontur, cremefarbene Fläche, rotes «!» bzw. blaues «?» (2× gerastert)
    const S = new G.Art.Shape(), col = kind === '?' ? '#3a7ad8' : '#d83a4a';
    S.E(6, 6, 5.4, 5.6, '#fff4dc', { name: 'b' }).P([[4, 10.5], [6, 14], [8, 10.5]], '#fff4dc', { g: 'b' });
    if (kind === '!') S.R(5, 2.4, 2, 5, col, { flat: true, line: false }).R(5, 8.4, 2, 1.8, col, { flat: true, line: false });
    else S.C(4.2, 4, 6, 2.6, 1.3, col, { flat: true, line: false }).C(6, 2.6, 7.8, 4.2, 1.3, col, { flat: true, line: false }).C(7.8, 4.2, 6, 6.4, 1.3, col, { flat: true, line: false }).R(5.4, 6.2, 1.3, 1.6, col, { flat: true, line: false }).R(5.4, 8.6, 1.3, 1.5, col, { flat: true, line: false });
    return (MARKSPR[kind] = hiArt(G.Art.raster(S, 24, 30, 2, { bold: true }), 2));
  }
  function renderMarkers(ctx, m, cx, cy, t) {
    const list = markersFor(m); if (!list.length) return;
    for (const o of list) {
      const n = o.n, sx = o.x * T - cx + (n ? n.ox : 0), top = n ? (n.mon ? -34 : n.altar ? (story() < 2 ? -40 : -18) : -26) : -14, sy = o.y * T - cy + (n ? n.oy : 0) + top;
      if (sx < -20 || sy < -30 || sx > VW + 4 || sy > VH + 4) continue;
      const bob = Math.sin(t * 3 + o.x) * 1.6, pulse = 0.75 + 0.25 * Math.sin(t * 4 + o.y);
      ctx.globalCompositeOperation = 'lighter'; ctx.globalAlpha = 0.45 * pulse; ctx.imageSmoothingEnabled = true;
      spr(ctx, o.kind === '?' ? LSPR.cool : LSPR.warm, sx + 8, sy + 6 + bob, 13);
      ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over'; ctx.imageSmoothingEnabled = false;
      const a = markSprite(o.kind); ctx.drawImage(a, Math.round(sx + 2), Math.round(sy - 1 + bob), a.lw, a.lh);
    }
  }
  function renderSparks(ctx, cx, cy, dt) {
    if (!sparks.length) return;
    ctx.globalCompositeOperation = 'lighter';
    for (let i = sparks.length - 1; i >= 0; i--) {
      const p = sparks[i]; p.life -= dt; if (p.life <= 0) { sparks.splice(i, 1); continue; }
      p.x += p.vx * dt; p.y += p.vy * dt; p.vy += (p.water ? 90 : p.moon ? -10 : 40) * dt;
      const k = p.life / p.max, x = Math.round(p.x - cx), y = Math.round(p.y - cy);
      ctx.fillStyle = p.moon ? `rgba(215,228,255,${k})` : p.water ? `rgba(170,210,255,${0.6 * k})` : `rgba(255,${150 + 90 * k | 0},${60 + 80 * k | 0},${k})`; ctx.fillRect(x, y, 1, 1);
    }
    ctx.globalCompositeOperation = 'source-over';
  }
  function renderZoneFog(ctx, m, cx, cy, t, dt, pl) {
    const drift1 = Math.sin(t * 0.23) * 5, drift2 = Math.cos(t * 0.17) * 6;
    for (const [g, dx, dy, sp, a] of [[fg, drift1, 0, 7, 1], [fg2, drift2, -2, -5, 1]]) {
      g.globalCompositeOperation = 'source-over'; g.clearRect(0, 0, VW, VH);
      g.drawImage(m.zoneFog, -cx + dx, -cy + dy);
      // wandernde Löcher -> Schwaden
      g.globalCompositeOperation = 'destination-out';
      const ox = ((t * sp - cx * 0.5) % 128 + 128) % 128, oy = ((t * sp * 0.3 - cy * 0.5) % 128 + 128) % 128;
      for (let x = -ox - 128; x < VW + 128; x += 128) for (let y = -oy - 128; y < VH + 128; y += 128) g.drawImage(NOISE, Math.round(x), Math.round(y));
      if (pl) { // Klarsicht-Radius um Spielfigur & Laterne
        const gr = g.createRadialGradient(pl[0], pl[1], 0, pl[0], pl[1], 38);
        gr.addColorStop(0, 'rgba(0,0,0,1)'); gr.addColorStop(0.45, 'rgba(0,0,0,0.95)'); gr.addColorStop(1, 'rgba(0,0,0,0)');
        g.fillStyle = gr; g.fillRect(pl[0] - 38, pl[1] - 38, 76, 76);
      }
    }
    // schwache Geistergestalten im Nebel
    if (m.ghosts.length < 3 && Math.random() < dt * 0.4) {
      const x = Math.floor((cx + Math.random() * VW) / T), y = Math.floor((cy + Math.random() * VH) / T);
      if (ZONE_OF[at(m, x, y)]) m.ghosts.push({ x: x * T + 2, y: y * T, life: 0, max: 4 + Math.random() * 3, vx: (Math.random() - 0.5) * 6 });
    }
    fg.globalCompositeOperation = 'source-over';
    ctx.globalAlpha = 0.46; ctx.drawImage(fogC, 0, 0);
    ctx.globalAlpha = 0.32; ctx.drawImage(fogC2, 0, 0);
    // Geistergestalten über dem Nebel, blass, nie im Laternenkreis
    for (let i = m.ghosts.length - 1; i >= 0; i--) {
      const gh = m.ghosts[i]; gh.life += dt; gh.x += gh.vx * dt; if (gh.life > gh.max) { m.ghosts.splice(i, 1); continue; }
      const gx = Math.round(gh.x - cx), gy = Math.round(gh.y - cy - Math.sin(gh.life) * 2);
      const dp = pl ? Math.hypot(gx + 6 - pl[0], gy + 6 - pl[1]) : 99;
      if (dp < 34) continue;
      ctx.globalAlpha = 0.24 * Math.sin(gh.life / gh.max * Math.PI) * Math.min(1, (dp - 34) / 16); ctx.drawImage(GHOST, gx, gy);
    }
    ctx.globalAlpha = 1;
  }

  G.World.onPress = b => {
    if (G.mode !== 'world' || G.lock > 0 || P.moving) return;
    if (b === 'A') G.World.interact();
    else if (b === 'START' || b === 'B') G.Menu.open();
  };
  G.World.restHome = restHome;
})(window.G);
