'use strict';
// Eldenghost – Spieldaten Kapitel 1 «Das Licht im Moor» (Typen, Attacken, Status, Geister, Gegenstände, Trainer)
window.G = window.G || {};
(function (G) {
  G.VW = 256; G.VH = 240; G.T = 16;
  G.SAVE_KEY = 'eldenghost.save.v1';
  G.SAVE_VERSION = 5; // v5: Pflanze als 9. Typ, neue Starter-Linien (Irrfackel -> Glutwurm); v4: typenlose Attacken unter Level 8 (Lernlisten neu abgeleitet)
  // v3: 8 Elemente (IDs unverändert, alte Spielstände bleiben gültig)

  // 8 klassische Elemente (Kapitel 1 ab Spielstand v3). Tabelle: Angriffstyp -> Verteidigungstyp -> Faktor (fehlend = 1)
  G.TYPES = ['Feuer', 'Wasser', 'Pflanze', 'Elektro', 'Stein', 'Psycho', 'Boden', 'Gift', 'Kampf'];
  // Neutral: typenlose Attacken (Rempler, Kratzer, Biss …) – immer 1×, kein Typbonus, kein Geist hat diesen Typ
  G.NEUTRAL = 'Neutral';
  G.TYPE_COLORS = {
    Neutral: '#b8b0c8', Feuer: '#f58c4c', Wasser: '#5aa8f2', Pflanze: '#6cc45a', Elektro: '#f0cc40', Stein: '#c4ae88',
    Psycho: '#ec7cbc', Boden: '#c8985a', Gift: '#a872dc', Kampf: '#d8604c'
  };
  G.CHART = {
    // Starter-Dreieck: Feuer > Pflanze > Wasser > Feuer (je 2×), Rückrichtung je ½×
    Feuer:   { Pflanze: 2, Gift: 2, Psycho: 2, Feuer: 0.5, Wasser: 0.5, Stein: 0.5 },
    Wasser:  { Feuer: 2, Stein: 2, Boden: 2, Wasser: 0.5, Pflanze: 0.5 },
    Pflanze: { Wasser: 2, Stein: 2, Boden: 2, Feuer: 0.5, Pflanze: 0.5, Gift: 0.5 },
    Elektro: { Wasser: 2, Psycho: 2, Elektro: 0.5, Stein: 0.5, Pflanze: 0.5, Boden: 0 },
    Stein:   { Feuer: 2, Elektro: 2, Stein: 0.5, Boden: 0.5, Kampf: 0.5 },
    Psycho:  { Kampf: 2, Gift: 2, Psycho: 0.5 },
    Boden:   { Feuer: 2, Elektro: 2, Stein: 2, Gift: 2, Kampf: 0.5, Pflanze: 0.5 },
    Gift:    { Wasser: 2, Kampf: 2, Pflanze: 2, Gift: 0.5, Boden: 0.5, Stein: 0.5 },
    Kampf:   { Stein: 2, Elektro: 2, Psycho: 0.5, Gift: 0.5 }
  };
  G.eff1 = (mt, dt) => { if (mt === 'Neutral') return G.NEUTRAL_VS[dt] || 1;  const r = G.CHART[mt] && G.CHART[mt][dt]; return r === undefined ? 1 : r; };
  // Doppeltypen: Faktoren multiplizieren sich (z. B. Feuer gegen Gift/Psycho = 4×)
  G.typesOf = sp => G.SPECIES[sp].types || [G.SPECIES[sp].type];
  // Neutral (typenlos) wirkt 1× – ausser gegen Stein: ½× (wie Normal gegen Gestein)
  G.NEUTRAL_VS = { Stein: 0.5 };
  G.eff = (mt, sp) => G.typesOf(sp).reduce((f, t) => f * G.eff1(mt, t), 1);
  G.hasType = (sp, t) => G.typesOf(sp).includes(t);
  G.isNeutral = id => G.MOVES[id] && G.MOVES[id].type === 'Neutral';
  // Stufenweise Veröffentlichung: v16-Inhalte (Klippenhöhle/Team Quantum, Legende, Katzenhaus) und v17 (seltene Spezialgeister) sind vorbereitet, aber noch aus
  G.FEAT = { cave: false, legend: false, cats: false, rare: false };
  G.TYPE_MOVE_LVL = 8; // erste Typ-Attacke frühestens ab Level 8

  // ---------- Statuseffekte ----------
  G.STATUS = {
    klamm: {
      name: 'Klamm', short: 'KLM', color: '#7fa38a',
      dot: 1 / 12,            // verliert am Rundenende 1/12 der max. LP (min. 1)
      persist: true,          // bleibt nach dem Kampf bis Kräutertee/Wacholderrauch/Ruhe zu Hause
      immune: ['Wasser'],     // Wasser-Geister werden nie klamm
      msgOn: '{n} wird klamm vor Moorkälte!', msgTick: '{n} zittert vor Kälte.', msgOff: '{n} ist wieder warm.'
    },
    verirrt: {
      name: 'Verirrt', short: 'VRT', color: '#8ff0e4',
      turns: [2, 4],          // Dauer in eigenen Zügen
      skip: 0.33,             // 33 %: Attacke verfliegt, Zug verloren (kein Selbstschaden)
      persist: false,         // endet mit dem Kampf oder beim Auswechseln
      immune: ['Psycho'],
      msgOn: '{n} hat sich im Nebel verirrt!', msgTick: '{n} irrt umher und findet sein Ziel nicht.', msgOff: '{n} findet den Weg zurück.'
    },
    // v15: seltene Signatur-Zustände
    schlaf: { name: 'Schlaf', short: 'SLF', color: '#9aa8e0', turns: [1, 3], sleep: true, persist: false, immune: [],
      msgOn: '{n} schläft ein!', msgTick: '{n} schläft tief und fest.', msgOff: '{n} wacht auf!' },
    brand: { name: 'Verbrennung', short: 'BRD', color: '#f08a4a', dot: 1 / 16, persist: false, immune: ['Feuer'],
      msgOn: '{n} hat sich verbrannt!', msgTick: '{n} leidet unter der Verbrennung.', msgOff: '{n} ist nicht mehr verbrannt.' },
    gift: { name: 'Vergiftung', short: 'GFT', color: '#b070e0', dot: 1 / 10, persist: false, immune: ['Gift', 'Stein'],
      msgOn: '{n} wurde vergiftet!', msgTick: '{n} leidet unter dem Gift.', msgOff: '{n} ist das Gift los.' }
  };

  // ---------- Attacken (pp neu; bestehende power/acc unverändert) ----------
  G.MOVES = {
    // IDs bleiben (Spielstände), Namen und Typen passen zu den 8 Elementen
    hauch:          { name: 'Hauch',          type: 'Neutral', power: 40, acc: 100, pp: 35 },
    rempler:        { name: 'Rempler',        type: 'Neutral', power: 40, acc: 100, pp: 35 },
    // typenlose Grundattacken für die ersten Level (1× gegen alles)
    kratzer:        { name: 'Kratzer',        type: 'Neutral', power: 40, acc: 100, pp: 35 },
    biss:           { name: 'Biss',           type: 'Neutral', power: 55, acc: 95,  pp: 20 },
    kopfnuss:       { name: 'Kopfnuss',       type: 'Neutral', power: 55, acc: 95,  pp: 20 },
    heuler:         { name: 'Heuler',         type: 'Neutral', power: 0,  acc: 100, pp: 25, effect: { who: 'foe',  stat: 'atk', n: -1 } },
    starren:        { name: 'Starren',        type: 'Neutral', power: 0,  acc: 100, pp: 25, effect: { who: 'foe',  stat: 'def', n: -1 } },
    grabesruf:      { name: 'Grabesruf',      type: 'Psycho',  power: 0,  acc: 100, pp: 20, effect: { who: 'foe',  stat: 'def', n: -1 } },
    irrfeuer:       { name: 'Irrfeuer',       type: 'Feuer',   power: 45, acc: 95,  pp: 25 },
    glutschein:     { name: 'Glutschein',     type: 'Feuer',   power: 65, acc: 90,  pp: 15 },
    blendlicht:     { name: 'Blendblitz',     type: 'Elektro', power: 0,  acc: 100, pp: 20, effect: { who: 'foe',  stat: 'acc', n: -1 } },
    schlammwurf:    { name: 'Schlammwurf',    type: 'Boden',   power: 45, acc: 95,  pp: 25 },
    sumpfsog:       { name: 'Sumpfsog',       type: 'Wasser',  power: 55, acc: 95,  pp: 15, drain: 0.5 },
    kieselhagel:    { name: 'Kieselhagel',    type: 'Stein',   power: 45, acc: 95,  pp: 25 },
    felsruf:        { name: 'Felsruf',        type: 'Stein',   power: 70, acc: 85,  pp: 10 },
    haerten:        { name: 'Härten',         type: 'Neutral', power: 0,  acc: 100, pp: 20, effect: { who: 'self', stat: 'def', n: 1 } },
    schattenstaub:  { name: 'Giftstaub',      type: 'Gift',    power: 40, acc: 100, pp: 30 },
    schattenbiss:   { name: 'Giftbiss',       type: 'Gift',    power: 60, acc: 95,  pp: 15 },
    nebelstoss:     { name: 'Gedankenstoss',  type: 'Psycho',  power: 50, acc: 95,  pp: 25 },
    nebelschleier:  { name: 'Trugschleier',   type: 'Psycho',  power: 0,  acc: 100, pp: 20, effect: { who: 'foe',  stat: 'acc', n: -1 } },
    seufzer:        { name: 'Seufzer',        type: 'Psycho',  power: 55, acc: 100, pp: 25 },
    wehmut:         { name: 'Wehmut',         type: 'Psycho',  power: 0,  acc: 100, pp: 20, effect: { who: 'foe',  stat: 'atk', n: -1 } },
    erinnerung:     { name: 'Erinnerung',     type: 'Psycho',  power: 0,  acc: 100, pp: 5,  heal: 0.5 },              // heilt 50 % der max. LP (self)
    letzterhauch:   { name: 'Letzter Hauch',  type: 'Neutral', power: 35, acc: 100, pp: 0,  recoil: 0.25, fallback: true }, // automatisch, wenn alle AP leer
    irrweg:         { name: 'Irrweg',         type: 'Psycho',  power: 0,  acc: 85,  pp: 15, status: { id: 'verirrt', chance: 100 } },
    seelenbrand:    { name: 'Seelenbrand',    type: 'Feuer',   power: 80, acc: 90,  pp: 10 },
    moorkaelte:     { name: 'Moorkälte',      type: 'Wasser',  power: 40, acc: 100, pp: 20, status: { id: 'klamm', chance: 30 } },
    klammgriff:     { name: 'Klammgriff',     type: 'Kampf',   power: 60, acc: 90,  pp: 15, status: { id: 'klamm', chance: 20 } },
    torfwelle:      { name: 'Torfbeben',      type: 'Boden',   power: 80, acc: 90,  pp: 10 },
    grenzwacht:     { name: 'Grenzwacht',     type: 'Stein',   power: 0,  acc: 100, pp: 10, effect: { who: 'self', stat: 'def', n: 2 } },
    menhirschlag:   { name: 'Menhirschlag',   type: 'Stein',   power: 85, acc: 85,  pp: 10 },
    aschestaub:     { name: 'Sporenwolke',    type: 'Gift',    power: 0,  acc: 100, pp: 20, effect: { who: 'foe',  stat: 'atk', n: -1 } },
    schattenschwinge:{ name: 'Traumschwinge', type: 'Psycho',  power: 75, acc: 95,  pp: 10 },
    irrnebel:       { name: 'Wirrnebel',      type: 'Psycho',  power: 40, acc: 95,  pp: 20, status: { id: 'verirrt', chance: 25 } },
    nebelwand:      { name: 'Geisterwand',    type: 'Psycho',  power: 0,  acc: 100, pp: 20, effect: { who: 'self', stat: 'def', n: 1 } },
    schleiersturz:  { name: 'Traumsturz',     type: 'Psycho',  power: 75, acc: 90,  pp: 10 },
    ahnenruf:       { name: 'Ahnenruf',       type: 'Psycho',  power: 90, acc: 90,  pp: 5 },                         // nur Boss
    // neu mit den Elementen
    wasserstrahl:   { name: 'Wasserstrahl',   type: 'Wasser',  power: 50, acc: 100, pp: 25 },
    moorflut:       { name: 'Moorflut',       type: 'Wasser',  power: 80, acc: 90,  pp: 10 },
    funkenflug:     { name: 'Funkenflug',     type: 'Elektro', power: 45, acc: 100, pp: 25 },
    glimmstrom:     { name: 'Glimmstrom',     type: 'Elektro', power: 65, acc: 95,  pp: 15 },
    blitzschlag:    { name: 'Blitzschlag',    type: 'Elektro', power: 80, acc: 85,  pp: 10 },
    prankenhieb:    { name: 'Prankenhieb',    type: 'Kampf',   power: 50, acc: 100, pp: 25 },
    grimmstoss:     { name: 'Grimmstoss',     type: 'Kampf',   power: 80, acc: 90,  pp: 10 },
    ahnenstoss:     { name: 'Ahnenstoss',     type: 'Kampf',   power: 75, acc: 90,  pp: 10 },                         // Boss
    giftschlamm:    { name: 'Giftschlamm',    type: 'Gift',    power: 70, acc: 90,  pp: 10 },
    erdklumpen:     { name: 'Erdklumpen',     type: 'Boden',   power: 60, acc: 95,  pp: 15 },
    // Pflanze (v14)
    blattwirbel:    { name: 'Blattwirbel',    type: 'Pflanze', power: 45, acc: 100, pp: 25 },
    feenstaub:      { name: 'Feenstaub',      type: 'Pflanze', power: 0,  acc: 100, pp: 20, effect: { who: 'foe',  stat: 'acc', n: -1 } },
    rankensog:      { name: 'Rankensog',      type: 'Pflanze', power: 55, acc: 95,  pp: 15, drain: 0.5 },
    wurzelhieb:     { name: 'Wurzelhieb',     type: 'Pflanze', power: 80, acc: 90,  pp: 10 },
    waldsegen:      { name: 'Waldsegen',      type: 'Pflanze', power: 0,  acc: 100, pp: 5,  heal: 0.5 },
    feensturm:      { name: 'Feensturm',      type: 'Pflanze', power: 90, acc: 85,  pp: 5 },
    // neue Starter-Linien: Drache und Ente
    drachenglut:    { name: 'Drachenglut',    type: 'Feuer',   power: 90, acc: 85,  pp: 5 },
    schwanenruf:    { name: 'Schwanenruf',    type: 'Wasser',  power: 90, acc: 85,  pp: 5 },
    // v15: eigene Attacken der neuen Geister (jede mit eigener Animation)
    hakenschlag:    { name: 'Hakenschlag',    type: 'Neutral', power: 65, acc: 95,  pp: 15 },
    echoruf:        { name: 'Echoruf',        type: 'Psycho', power: 60, acc: 100, pp: 15 },
    schnurrfunken:  { name: 'Schnurrfunken',  type: 'Elektro', power: 55, acc: 100, pp: 20 },
    speerblitz:     { name: 'Speerblitz',     type: 'Elektro', power: 75, acc: 90,  pp: 10 },
    moosstacheln:   { name: 'Moosstacheln',   type: 'Pflanze', power: 60, acc: 95,  pp: 15 },
    scherenzwick:   { name: 'Scherenzwick',   type: 'Wasser',  power: 60, acc: 95,  pp: 15 },
    glutschweif:    { name: 'Glutschweif',    type: 'Feuer',   power: 60, acc: 95,  pp: 15 },
    tropfstein:     { name: 'Tropfsteinregen',type: 'Stein',   power: 65, acc: 90,  pp: 15 },
    kristallglanz:  { name: 'Kristallglanz',  type: 'Psycho',  power: 75, acc: 95,  pp: 10 },
    nattergift:     { name: 'Nattergift',     type: 'Gift',    power: 60, acc: 95,  pp: 15, status: { id: 'klamm', chance: 15 } },
    wuehlstoss:     { name: 'Wühlstoss',      type: 'Boden',   power: 65, acc: 95,  pp: 15 },
    keileransturm:  { name: 'Keileransturm',  type: 'Kampf',   power: 70, acc: 90,  pp: 10 },
    // seltene Geister
    mondsprung:     { name: 'Mondsprung',     type: 'Psycho',  power: 80, acc: 95,  pp: 10 },
    sternenfall:    { name: 'Sternenfall',    type: 'Elektro', power: 95, acc: 85,  pp: 5 },
    walgesang:      { name: 'Walgesang',      type: 'Wasser',  power: 75, acc: 100, pp: 10 },
    tiefenflut:     { name: 'Tiefenflut',     type: 'Wasser',  power: 100, acc: 85, pp: 5 },
    funkenregen:    { name: 'Funkenregen',    type: 'Feuer',   power: 70, acc: 95,  pp: 10 },
    phoenixflamme:  { name: 'Phönixflamme',   type: 'Feuer',   power: 100, acc: 85, pp: 5 },
    wiedergeburt:   { name: 'Wiedergeburt',   type: 'Feuer',   power: 0,  acc: 100, pp: 5,  heal: 0.5 },
    hainruf:        { name: 'Hainruf',        type: 'Pflanze', power: 75, acc: 95,  pp: 10 },
    kronenlicht:    { name: 'Kronenlicht',    type: 'Pflanze', power: 100, acc: 90, pp: 5 },
    // Synx (Team Quantum)
    raetselblick:   { name: 'Rätselblick',    type: 'Psycho',  power: 60, acc: 95,  pp: 15, status: { id: 'verirrt', chance: 25 } },
    sphinxkralle:   { name: 'Sphinxkralle',   type: 'Stein',   power: 70, acc: 90,  pp: 10 },
    alptraum:       { name: 'Alptraum',       type: 'Psycho',  power: 85, acc: 90,  pp: 5 }
  };
  G.STAT_NAMES = { atk: 'Angriffskraft', def: 'Verteidigung', acc: 'Genauigkeit' };

  // ---------- Geister (19) ----------
  // evo: { to, lvl } – Entwicklung beim Level-up (nach Kampfende). boss: nicht fangbar in Kapitel 1.
  G.SPECIES = {
    // Starter-Linie Feuer: Drache (Flackerling -> Glutwurm -> Seelendrache)
    flackerling: { name: 'Flackerling', g: 'm', type: 'Feuer', types: ['Feuer'], base: { hp: 40, atk: 50, def: 38, spd: 54 }, catch: 0.45, xp: 55,
      learn: [[1, 'kratzer'], [1, 'heuler'], [6, 'biss'], [8, 'irrfeuer'], [10, 'blendlicht'], [12, 'glutschein'], [13, 'irrweg']],
      evo: { to: 'glutwurm', lvl: 14 },
      desc: 'Ein kleiner Glutdrache, kaum grösser als eine Laterne. Seine Schwanzflamme flackert, wenn er aufgeregt ist – und er ist fast immer aufgeregt.' },
    glutwurm: { name: 'Glutwurm', g: 'm', type: 'Feuer', types: ['Feuer'], base: { hp: 58, atk: 74, def: 54, spd: 74 }, catch: 0.2, xp: 120,
      learn: [[1, 'kratzer'], [1, 'heuler'], [6, 'biss'], [8, 'irrfeuer'], [10, 'blendlicht'], [12, 'glutschein'], [13, 'irrweg'], [16, 'seelenbrand'], [19, 'grabesruf']],
      evo: { to: 'seelendrache', lvl: 22 },
      desc: 'Ein junger Lindwurm mit Flügeln aus Glut. Er übt heimlich das Fliegen über dem Moor – die Irrlichter, die man nachts sieht, sind oft nur seine Funken.' },
    seelendrache: { name: 'Seelendrache', g: 'm', type: 'Feuer', types: ['Feuer', 'Psycho'], base: { hp: 80, atk: 100, def: 74, spd: 90 }, catch: 0.1, xp: 200,
      learn: [[1, 'kratzer'], [1, 'heuler'], [8, 'irrfeuer'], [12, 'glutschein'], [16, 'seelenbrand'], [19, 'grabesruf'], [22, 'schleiersturz'], [26, 'drachenglut']],
      desc: 'Ein uralter Geisterdrache, dessen Schwingen wie Nordlicht glimmen. Man sagt, er trage die Seelen der Verirrten auf dem Rücken heim – durch Feuer, das nicht verbrennt.' },
    // Starter-Linie Wasser: Ente (Pfützling -> Nebelente -> Mondschwan)
    pfuetzling: { name: 'Pfützling', g: 'm', type: 'Wasser', types: ['Wasser'], base: { hp: 48, atk: 44, def: 42, spd: 44 }, catch: 0.45, xp: 55,
      learn: [[1, 'rempler'], [1, 'starren'], [6, 'kopfnuss'], [8, 'wasserstrahl'], [10, 'sumpfsog'], [12, 'moorkaelte'], [13, 'grabesruf']],
      evo: { to: 'nebelente', lvl: 14 },
      desc: 'Ein flaumiges Geisterentlein, das in jeder Pfütze den Mond sucht. Wenn es niest, regnet es ein kleines bisschen.' },
    nebelente: { name: 'Nebelente', g: 'f', type: 'Wasser', types: ['Wasser'], base: { hp: 72, atk: 62, def: 64, spd: 58 }, catch: 0.2, xp: 120,
      learn: [[1, 'rempler'], [1, 'starren'], [6, 'kopfnuss'], [8, 'wasserstrahl'], [10, 'sumpfsog'], [12, 'moorkaelte'], [13, 'grabesruf'], [16, 'moorflut'], [19, 'nebelschleier']],
      evo: { to: 'mondschwan', lvl: 22 },
      desc: 'Sie gleitet so leise über den Moorsee, dass der Nebel hinter ihr die Form ihrer Flügel behält. Ihr Gefieder schimmert wie nasses Silber.' },
    mondschwan: { name: 'Mondschwan', g: 'm', type: 'Wasser', types: ['Wasser', 'Psycho'], base: { hp: 96, atk: 82, def: 86, spd: 70 }, catch: 0.1, xp: 200,
      learn: [[1, 'rempler'], [1, 'starren'], [8, 'wasserstrahl'], [10, 'sumpfsog'], [16, 'moorflut'], [19, 'nebelschleier'], [22, 'schleiersturz'], [26, 'schwanenruf']],
      desc: 'Ein majestätischer Geisterschwan mit Mondsichel auf der Stirn. In klaren Nächten zieht er über das Moor, und wo sein Spiegelbild fällt, finden Verlorene den Weg.' },
    // Starter-Linie Pflanze: Feenbaum (Blattling -> Hainfee -> Feenlinde)
    blattling: { name: 'Blattling', g: 'm', type: 'Pflanze', types: ['Pflanze'], base: { hp: 48, atk: 44, def: 46, spd: 42 }, catch: 0.45, xp: 55,
      learn: [[1, 'rempler'], [1, 'starren'], [6, 'kopfnuss'], [8, 'blattwirbel'], [10, 'feenstaub'], [12, 'rankensog'], [13, 'grabesruf']],
      evo: { to: 'hainfee', lvl: 14 },
      desc: 'Ein winziger Setzling mit Blattflügeln, der um Laternen tanzt. Wo er einschläft, wächst am Morgen ein Kreis aus Mondklee.' },
    hainfee: { name: 'Hainfee', g: 'f', type: 'Pflanze', types: ['Pflanze'], base: { hp: 70, atk: 66, def: 70, spd: 56 }, catch: 0.2, xp: 120,
      learn: [[1, 'rempler'], [1, 'starren'], [6, 'kopfnuss'], [8, 'blattwirbel'], [10, 'feenstaub'], [12, 'rankensog'], [13, 'grabesruf'], [16, 'wurzelhieb'], [19, 'waldsegen']],
      evo: { to: 'feenlinde', lvl: 22 },
      desc: 'Eine Dryade mit Haar aus jungen Birkenzweigen. Sie flüstert mit den Bäumen am Moorrand, und manchmal antworten sie mit Blütenregen.' },
    feenlinde: { name: 'Feenlinde', g: 'f', type: 'Pflanze', types: ['Pflanze', 'Psycho'], base: { hp: 100, atk: 84, def: 96, spd: 50 }, catch: 0.1, xp: 200,
      learn: [[1, 'rempler'], [1, 'starren'], [8, 'blattwirbel'], [12, 'rankensog'], [16, 'wurzelhieb'], [19, 'waldsegen'], [22, 'schleiersturz'], [26, 'feensturm']],
      desc: 'Ein uralter Feenbaum, in dessen Krone Geisterlichter wohnen. Unter ihren Ästen wurde früher Gericht gehalten, geheiratet und Abschied genommen.' },
    // wilde Pflanze-Geister (früh fangbar)
    kleeling: { name: 'Kleeling', g: 'm', type: 'Pflanze', types: ['Pflanze'], base: { hp: 42, atk: 42, def: 44, spd: 50 }, catch: 0.6, xp: 46,
      learn: [[1, 'rempler'], [3, 'starren'], [6, 'kopfnuss'], [8, 'blattwirbel'], [10, 'feenstaub'], [12, 'rankensog']],
      evo: { to: 'moorranke', lvl: 16 },
      desc: 'Ein vierblättriges Kleeblatt mit Stielbeinchen, das durchs Nebelgras hüpft. Wer es fängt, hat angeblich eine Woche lang Glück.' },
    moorranke: { name: 'Moorranke', g: 'f', type: 'Pflanze', types: ['Pflanze', 'Gift'], base: { hp: 62, atk: 64, def: 58, spd: 62 }, catch: 0.3, xp: 108,
      learn: [[1, 'rempler'], [3, 'starren'], [6, 'kopfnuss'], [8, 'blattwirbel'], [10, 'feenstaub'], [12, 'rankensog'], [16, 'schattenbiss'], [19, 'wurzelhieb']],
      desc: 'Eine Kletterranke, die sich um alte Grabsteine windet. Ihre Blüten öffnen sich nur bei Nebel und duften nach Regen und Bittermandel.' },
    // wilde Wasser-Linie (früher Starter)
    moorlurch: { name: 'Moorlurch', g: 'm', type: 'Wasser', types: ['Wasser'], base: { hp: 52, atk: 46, def: 48, spd: 36 }, catch: 0.45, xp: 55,
      learn: [[1, 'rempler'], [1, 'starren'], [6, 'biss'], [8, 'wasserstrahl'], [10, 'sumpfsog'], [12, 'moorkaelte'], [13, 'grabesruf']],
      evo: { to: 'moorunke', lvl: 14 },
      desc: 'Schläft tagsüber im Torfwasser. Die glimmenden Flecken auf seinem Rücken zählen die Seelen, die er getröstet hat.' },
    moorunke: { name: 'Moorunke', g: 'f', type: 'Wasser', types: ['Wasser', 'Gift'], base: { hp: 76, atk: 62, def: 66, spd: 48 }, catch: 0.2, xp: 120,
      learn: [[1, 'rempler'], [1, 'starren'], [6, 'biss'], [8, 'wasserstrahl'], [10, 'sumpfsog'], [12, 'moorkaelte'], [13, 'grabesruf'], [16, 'moorflut'], [19, 'giftschlamm']],
      desc: 'Ihr Ruf klingt wie eine Glocke unter Wasser. Ihre Warzen sind giftig, doch Verirrte hören sie und wissen plötzlich wieder, wie ihr Zuhause riecht.' },
    // Stein-Linie (früher Starter, jetzt nur noch wild: Nebelgras, Torfstich)
    kieselgeist: { name: 'Kieselgeist', g: 'm', type: 'Stein', types: ['Stein'], base: { hp: 46, atk: 48, def: 60, spd: 28 }, catch: 0.45, xp: 55,
      learn: [[1, 'rempler'], [1, 'heuler'], [6, 'haerten'], [7, 'kopfnuss'], [8, 'kieselhagel'], [10, 'felsruf'], [12, 'grenzwacht']],
      evo: { to: 'menhirgeist', lvl: 14 },
      desc: 'Ein Schildkrötengeist mit einem Panzer aus Bachkieseln. Er lag jahrelang als Grenzstein am Weg und vergisst nie ein Gesicht.' },
    menhirgeist: { name: 'Menhirgeist', g: 'm', type: 'Stein', types: ['Stein', 'Boden'], base: { hp: 66, atk: 66, def: 84, spd: 38 }, catch: 0.2, xp: 120,
      learn: [[1, 'rempler'], [1, 'haerten'], [6, 'kopfnuss'], [8, 'kieselhagel'], [10, 'felsruf'], [12, 'grenzwacht'], [16, 'menhirschlag'], [19, 'torfwelle']],
      desc: 'Auf seinem Rücken trug man einst Wachtfeuer. Die Russspuren glühen noch, wenn er an alte Freunde denkt.' },
    // Nebelgras
    schattenmotte: { name: 'Schattenmotte', g: 'f', type: 'Gift', types: ['Gift', 'Psycho'], base: { hp: 36, atk: 48, def: 34, spd: 60 }, catch: 0.6, xp: 45,
      learn: [[1, 'hauch'], [4, 'starren'], [8, 'schattenstaub'], [9, 'grabesruf'], [10, 'schattenbiss'], [11, 'aschestaub']],
      evo: { to: 'grabfalter', lvl: 12 },
      desc: 'Flattert nur um Lichter, die längst erloschen sind. Ihr Flügelstaub macht schläfrig und leicht giftig.' },
    grabfalter: { name: 'Grabfalter', g: 'm', type: 'Gift', types: ['Gift', 'Psycho'], base: { hp: 52, atk: 68, def: 46, spd: 84 }, catch: 0.3, xp: 105,
      learn: [[1, 'hauch'], [1, 'starren'], [8, 'schattenstaub'], [9, 'grabesruf'], [10, 'schattenbiss'], [11, 'aschestaub'], [15, 'schattenschwinge'], [18, 'irrnebel']],
      desc: 'Seine Flügel tragen die Muster alter Grabinschriften. Wer genau hinsieht, findet manchmal den eigenen Namen.' },
    nebelkauz: { name: 'Nebelkauz', g: 'm', type: 'Psycho', types: ['Psycho'], base: { hp: 44, atk: 44, def: 42, spd: 50 }, catch: 0.55, xp: 50,
      learn: [[1, 'hauch'], [1, 'starren'], [6, 'kopfnuss'], [8, 'nebelstoss'], [10, 'nebelschleier'], [11, 'grabesruf'], [12, 'irrnebel']],
      evo: { to: 'schleierkauz', lvl: 13 },
      desc: 'Sein Ruf ist so leise, dass man ihn erst hört, wenn er schon vorbei ist.' },
    schleierkauz: { name: 'Schleierkauz', g: 'm', type: 'Psycho', types: ['Psycho'], base: { hp: 62, atk: 62, def: 58, spd: 70 }, catch: 0.3, xp: 110,
      learn: [[1, 'hauch'], [1, 'starren'], [6, 'kopfnuss'], [8, 'nebelstoss'], [10, 'nebelschleier'], [11, 'grabesruf'], [12, 'irrnebel'], [16, 'schleiersturz'], [19, 'nebelwand']],
      desc: 'Er webt den Nebel nicht – er kämmt ihn. Wo er nachts sitzt, ist der Morgen klarer.' },
    laternchen: { name: 'Laternchen', g: 'n', type: 'Elektro', types: ['Elektro'], base: { hp: 40, atk: 40, def: 44, spd: 46 }, catch: 0.55, xp: 48,
      learn: [[1, 'rempler'], [3, 'starren'], [7, 'kopfnuss'], [8, 'funkenflug'], [10, 'blendlicht'], [11, 'glimmstrom'], [13, 'irrweg']],
      evo: { to: 'totenleuchte', lvl: 16 },
      desc: 'Ein Glühwürmchen, das in einer vergessenen Stalllaterne überwintert hat. Sein Hinterleib knistert vor Funken, wenn es sich freut.' },
    totenleuchte: { name: 'Totenleuchte', g: 'f', type: 'Elektro', types: ['Elektro', 'Psycho'], base: { hp: 60, atk: 58, def: 66, spd: 62 }, catch: 0.25, xp: 110,
      learn: [[1, 'rempler'], [3, 'starren'], [7, 'kopfnuss'], [8, 'funkenflug'], [10, 'blendlicht'], [11, 'glimmstrom'], [13, 'irrweg'], [18, 'blitzschlag'], [20, 'erinnerung']],
      desc: 'Früher schwebte sie über dem Friedhof, damit die Toten nicht im Dunkeln warten mussten. Ihr Licht summt wie ein Gewitter in der Ferne.' },
    // Tiefes Moor
    torfwicht: { name: 'Torfwicht', g: 'm', type: 'Boden', types: ['Boden'], base: { hp: 58, atk: 54, def: 52, spd: 38 }, catch: 0.45, xp: 62,
      learn: [[1, 'kratzer'], [1, 'haerten'], [6, 'biss'], [8, 'schlammwurf'], [10, 'erdklumpen'], [12, 'klammgriff'], [17, 'torfwelle']],
      desc: 'Ein Maulwurfs-Wicht, der in alten Torfstichen wohnt und sammelt, was Menschen dort verloren haben: Knöpfe, Ringe, Lieder. Er spürt jedes Beben der Erde.' },
    hauchling: { name: 'Hauchling', g: 'm', type: 'Psycho', types: ['Psycho'], base: { hp: 48, atk: 44, def: 44, spd: 54 }, catch: 0.5, xp: 52,
      learn: [[1, 'hauch'], [1, 'heuler'], [6, 'kopfnuss'], [8, 'wehmut'], [9, 'seufzer'], [12, 'grabesruf'], [15, 'erinnerung'], [18, 'schattenbiss']],
      desc: 'Der letzte Atemzug eines Menschen, der nicht fertig war mit Abschiednehmen – leicht wie ein Kitz im Morgendunst. Er folgt gern jemandem, der zuhört.' },
    // neu: Kampf- und Giftlinien (Moorrand, Torfstich, Kapelle)
    raufdachs: { name: 'Raufdachs', g: 'm', type: 'Kampf', types: ['Kampf'], base: { hp: 54, atk: 62, def: 44, spd: 46 }, catch: 0.45, xp: 58,
      learn: [[1, 'kratzer'], [1, 'heuler'], [6, 'biss'], [8, 'prankenhieb'], [10, 'schlammwurf'], [11, 'haerten'], [12, 'klammgriff']],
      evo: { to: 'grimmdachs', lvl: 15 },
      desc: 'Ein junger Dachs, der jeden Abend den Moorpfad abläuft. Er rauft gern, aber nie mit jemandem, der kleiner ist als er.' },
    grimmdachs: { name: 'Grimmdachs', g: 'm', type: 'Kampf', types: ['Kampf', 'Boden'], base: { hp: 74, atk: 84, def: 62, spd: 56 }, catch: 0.2, xp: 122,
      learn: [[1, 'kratzer'], [1, 'heuler'], [6, 'biss'], [8, 'prankenhieb'], [10, 'schlammwurf'], [11, 'haerten'], [12, 'klammgriff'], [15, 'grimmstoss'], [18, 'torfwelle']],
      desc: 'Sein Bau reicht bis unter die alten Grabsteine. Wer dort gräbt, bekommt es mit ihm zu tun – er wacht über die Ruhe der Toten.' },
    schwammling: { name: 'Schwammling', g: 'm', type: 'Gift', types: ['Gift'], base: { hp: 50, atk: 50, def: 48, spd: 36 }, catch: 0.45, xp: 55,
      learn: [[1, 'rempler'], [1, 'haerten'], [6, 'kopfnuss'], [8, 'schattenstaub'], [10, 'aschestaub'], [11, 'schattenbiss'], [12, 'erdklumpen'], [13, 'moorkaelte']],
      evo: { to: 'moderhut', lvl: 14 },
      desc: 'Ein Pilzgeist, der nachts im Nebelgras spriesst. Seine Sporen leuchten schwach, und wer sie einatmet, träumt vom Moor.' },
    moderhut: { name: 'Moderhut', g: 'm', type: 'Gift', types: ['Gift', 'Boden'], base: { hp: 74, atk: 70, def: 68, spd: 44 }, catch: 0.2, xp: 120,
      learn: [[1, 'rempler'], [1, 'haerten'], [6, 'kopfnuss'], [8, 'schattenstaub'], [10, 'aschestaub'], [11, 'schattenbiss'], [12, 'erdklumpen'], [13, 'moorkaelte'], [15, 'giftschlamm'], [18, 'torfwelle']],
      desc: 'Unter seinem breiten Hut wachsen Wurzeln bis tief ins Moor. Er erinnert sich an jeden, der je unter ihm Schutz vor dem Regen suchte.' },
    // ===== v15: 15 neue Tier- und Naturgeister =====
    tauhase: { name: 'Tauhase', g: 'm', type: 'Psycho', types: ['Psycho'], base: { hp: 42, atk: 46, def: 38, spd: 58 }, catch: 0.6, xp: 46,
      learn: [[1, 'kratzer'], [1, 'starren'], [5, 'hakenschlag'], [8, 'nebelstoss'], [11, 'nebelschleier'], [14, 'seufzer']],
      desc: 'Ein Feldhase aus Morgentau und Nebel. Wo er durchs Gras springt, bleiben winzige, glitzernde Spuren zurück, die erst bei Sonnenaufgang verdunsten.' },
    funkmaus: { name: 'Funkmaus', g: 'f', type: 'Elektro', types: ['Elektro'], base: { hp: 40, atk: 46, def: 36, spd: 60 }, catch: 0.55, xp: 48,
      learn: [[1, 'rempler'], [1, 'heuler'], [6, 'kratzer'], [8, 'funkenflug'], [10, 'schnurrfunken'], [12, 'blendlicht'], [15, 'glimmstrom']],
      desc: 'Eine Feldmaus, deren Schnurrhaare knistern. Im Winter wärmt sie sich an alten Leuchtturmkabeln, und wenn sie niest, springt ein Funke.' },
    moosigel: { name: 'Moosigel', g: 'm', type: 'Pflanze', types: ['Pflanze'], base: { hp: 48, atk: 42, def: 54, spd: 36 }, catch: 0.55, xp: 48,
      learn: [[1, 'rempler'], [1, 'haerten'], [6, 'kopfnuss'], [8, 'blattwirbel'], [10, 'moosstacheln'], [12, 'rankensog'], [14, 'erdklumpen']],
      evo: { to: 'farnigel', lvl: 16 },
      desc: 'Seine Stacheln sind weiche Moospolster. Er rollt sich unter Laternen zusammen und schläft so tief, dass Pilze auf ihm wachsen.' },
    farnigel: { name: 'Farnigel', g: 'm', type: 'Pflanze', types: ['Pflanze', 'Boden'], base: { hp: 68, atk: 62, def: 78, spd: 46 }, catch: 0.25, xp: 112,
      learn: [[1, 'rempler'], [1, 'haerten'], [8, 'blattwirbel'], [10, 'moosstacheln'], [12, 'rankensog'], [14, 'erdklumpen'], [16, 'wurzelhieb'], [19, 'torfwelle']],
      desc: 'Aus dem Moospolster sind Farnwedel geworden, die sich bei Gefahr aufstellen. Im Moorherz hält er alte Wurzelgänge frei.' },
    gischtkrebs: { name: 'Gischtkrebs', g: 'm', type: 'Wasser', types: ['Wasser', 'Stein'], base: { hp: 50, atk: 52, def: 58, spd: 38 }, catch: 0.5, xp: 56,
      learn: [[1, 'kratzer'], [1, 'haerten'], [6, 'biss'], [8, 'wasserstrahl'], [10, 'scherenzwick'], [12, 'kieselhagel'], [15, 'felsruf'], [18, 'moorflut']],
      desc: 'Ein Einsiedlerkrebs, der in einem leeren Schneckenhaus voller Seeleuchten wohnt. Bei Flut klopft er mit der Schere an die Steine, als würde er zählen.' },
    glimmfuchs: { name: 'Glimmfuchs', g: 'm', type: 'Feuer', types: ['Feuer'], base: { hp: 40, atk: 52, def: 38, spd: 58 }, catch: 0.35, xp: 58,
      learn: [[1, 'kratzer'], [1, 'heuler'], [6, 'biss'], [8, 'irrfeuer'], [10, 'glutschweif'], [13, 'irrweg'], [15, 'glutschein'], [18, 'seelenbrand']],
      evo: { to: 'glutfaehe', lvl: 18 },
      desc: 'Ein kleiner Fuchs mit einer glimmenden Schwanzspitze. Man sieht ihn selten – meist nur als Funken, der zwischen Torfhaufen verschwindet.' },
    glutfaehe: { name: 'Glutfähe', g: 'f', type: 'Feuer', types: ['Feuer', 'Psycho'], base: { hp: 60, atk: 76, def: 54, spd: 84 }, catch: 0.15, xp: 125,
      learn: [[1, 'kratzer'], [1, 'heuler'], [8, 'irrfeuer'], [10, 'glutschweif'], [13, 'irrweg'], [15, 'glutschein'], [18, 'seelenbrand'], [21, 'schleiersturz']],
      desc: 'Eine Füchsin mit drei glühenden Schweifen. Alte Torfstecher sagen, sie hüte die Feuer unter dem Moor, damit sie nie ganz ausgehen.' },
    tropfsteinmolch: { name: 'Tropfsteinmolch', g: 'm', type: 'Stein', types: ['Stein'], base: { hp: 50, atk: 46, def: 52, spd: 36 }, catch: 0.5, xp: 52,
      learn: [[1, 'rempler'], [1, 'haerten'], [5, 'kopfnuss'], [8, 'kieselhagel'], [10, 'tropfstein'], [13, 'grenzwacht'], [16, 'felsruf']],
      evo: { to: 'kristallmolch', lvl: 18 },
      desc: 'Ein Höhlenmolch mit kleinen Tropfsteinen auf dem Rücken. Er trinkt nur Wasser, das tausend Jahre durch den Fels gesickert ist.' },
    kristallmolch: { name: 'Kristallmolch', g: 'm', type: 'Stein', types: ['Stein', 'Psycho'], base: { hp: 72, atk: 64, def: 78, spd: 54 }, catch: 0.2, xp: 118,
      learn: [[1, 'rempler'], [1, 'haerten'], [8, 'kieselhagel'], [10, 'tropfstein'], [13, 'grenzwacht'], [16, 'felsruf'], [18, 'kristallglanz'], [22, 'menhirschlag']],
      desc: 'Aus den Tropfsteinen sind Kristalle gewachsen, in denen sich Erinnerungen spiegeln. Wer hineinsieht, erkennt Orte, an denen er nie war.' },
    flatterhauch: { name: 'Flatterhauch', g: 'm', type: 'Psycho', types: ['Psycho'], base: { hp: 40, atk: 44, def: 38, spd: 60 }, catch: 0.6, xp: 46,
      learn: [[1, 'hauch'], [1, 'starren'], [5, 'biss'], [8, 'echoruf'], [11, 'nebelschleier'], [14, 'seufzer']],
      desc: 'Eine kleine Fledermaus mit Flügeln wie dünnes Pergament. Sie findet in völliger Dunkelheit jeden Weg – und führt Verirrte manchmal hinaus.' },
    blitzreiher: { name: 'Blitzreiher', g: 'm', type: 'Elektro', types: ['Elektro', 'Wasser'], base: { hp: 56, atk: 64, def: 48, spd: 66 }, catch: 0.3, xp: 96,
      learn: [[1, 'kratzer'], [1, 'starren'], [6, 'kopfnuss'], [8, 'funkenflug'], [9, 'wasserstrahl'], [11, 'speerblitz'], [14, 'glimmstrom'], [17, 'blitzschlag']],
      desc: 'Ein grauer Reiher, der reglos im Schilf steht. Wenn er zustösst, zuckt ein Blitz über das Wasser – und danach ist es sehr still.' },
    sumpfnatter: { name: 'Sumpfnatter', g: 'f', type: 'Gift', types: ['Gift', 'Wasser'], base: { hp: 54, atk: 62, def: 50, spd: 64 }, catch: 0.35, xp: 94,
      learn: [[1, 'biss'], [1, 'starren'], [6, 'kratzer'], [8, 'schattenstaub'], [9, 'nattergift'], [12, 'sumpfsog'], [15, 'giftschlamm']],
      desc: 'Eine schwarze Natter mit leuchtend grünen Streifen. Sie gleitet lautlos durch das Moorwasser und rollt sich nachts um warme Steine.' },
    grubenkaefer: { name: 'Grubenkäfer', g: 'm', type: 'Boden', types: ['Boden', 'Stein'], base: { hp: 60, atk: 62, def: 68, spd: 42 }, catch: 0.35, xp: 98,
      learn: [[1, 'rempler'], [1, 'haerten'], [6, 'kopfnuss'], [8, 'schlammwurf'], [10, 'wuehlstoss'], [13, 'kieselhagel'], [16, 'torfwelle']],
      desc: 'Ein Käfer mit einem Panzer wie nasser Schiefer. Er gräbt Gänge durch Torf und Fels und hinterlässt dabei feine, leuchtende Adern.' },
    keilerling: { name: 'Keilerling', g: 'm', type: 'Kampf', types: ['Kampf'], base: { hp: 52, atk: 60, def: 46, spd: 42 }, catch: 0.45, xp: 58,
      learn: [[1, 'rempler'], [1, 'heuler'], [6, 'kopfnuss'], [8, 'prankenhieb'], [10, 'keileransturm'], [12, 'schlammwurf'], [15, 'haerten']],
      evo: { to: 'moorkeiler', lvl: 17 },
      desc: 'Ein gestreiftes Wildschweinferkel mit Moos hinter den Ohren. Es rennt gern mit dem Kopf voran gegen Baumstümpfe – und gewinnt meistens.' },
    moorkeiler: { name: 'Moorkeiler', g: 'm', type: 'Kampf', types: ['Kampf', 'Boden'], base: { hp: 76, atk: 88, def: 64, spd: 54 }, catch: 0.2, xp: 124,
      learn: [[1, 'rempler'], [1, 'heuler'], [8, 'prankenhieb'], [10, 'keileransturm'], [12, 'schlammwurf'], [15, 'haerten'], [17, 'grimmstoss'], [20, 'torfwelle']],
      desc: 'Ein mächtiger Keiler mit Hauern aus altem Wurzelholz. Wenn er durch das Moor zieht, weichen sogar die Irrlichter zur Seite.' },
    // ===== v15: seltene Sondergeister (1–2 %, besondere Orte) mit grossen Entwicklungen =====
    mondluchs: { name: 'Mondluchs', g: 'm', type: 'Psycho', types: ['Psycho'], base: { hp: 56, atk: 66, def: 52, spd: 78 }, catch: 0.2, xp: 110, rare: true,
      learn: [[1, 'kratzer'], [1, 'starren'], [6, 'biss'], [8, 'nebelstoss'], [10, 'mondsprung'], [13, 'irrnebel'], [16, 'schleiersturz']],
      evo: { to: 'sternenluchs', lvl: 20 },
      desc: 'Ein Luchs mit silbernen Pinselohren, dessen Fell im Nebel wie Mondlicht schimmert. Er zeigt sich nur, wenn der Nebel so dicht ist, dass man die eigene Hand nicht mehr sieht.' },
    sternenluchs: { name: 'Sternenluchs', g: 'm', type: 'Psycho', types: ['Psycho', 'Elektro'], base: { hp: 80, atk: 94, def: 70, spd: 104 }, catch: 0.08, xp: 220, rare: true,
      learn: [[1, 'kratzer'], [8, 'nebelstoss'], [10, 'mondsprung'], [13, 'irrnebel'], [16, 'schleiersturz'], [20, 'sternenfall'], [24, 'blitzschlag']],
      desc: 'In seinem Fell stehen Sternbilder, die es am Himmel nicht gibt. Wenn er springt, zieht er einen Schweif aus Sternenstaub hinter sich her.' },
    tiefenkalb: { name: 'Tiefenkalb', g: 'n', type: 'Wasser', types: ['Wasser', 'Psycho'], base: { hp: 74, atk: 56, def: 66, spd: 46 }, catch: 0.2, xp: 110, rare: true,
      learn: [[1, 'rempler'], [1, 'starren'], [6, 'kopfnuss'], [8, 'wasserstrahl'], [10, 'walgesang'], [13, 'moorkaelte'], [16, 'moorflut']],
      evo: { to: 'nebelwal', lvl: 20 },
      desc: 'Ein junges Walkalb aus Nebel und Meerleuchten, das sich in die Brandung verirrt hat. Sein leiser Gesang lässt die Wellen stillstehen.' },
    nebelwal: { name: 'Nebelwal', g: 'm', type: 'Wasser', types: ['Wasser', 'Psycho'], base: { hp: 110, atk: 82, def: 94, spd: 56 }, catch: 0.08, xp: 220, rare: true,
      learn: [[1, 'rempler'], [8, 'wasserstrahl'], [10, 'walgesang'], [13, 'moorkaelte'], [16, 'moorflut'], [20, 'tiefenflut'], [24, 'erinnerung']],
      desc: 'Ein riesiger Geisterwal, der durch den Nebel schwimmt wie durch das Meer. Auf seinem Rücken leuchten Lichter wie die Fenster einer fernen Stadt.' },
    funkenkueken: { name: 'Funkenküken', g: 'n', type: 'Feuer', types: ['Feuer', 'Psycho'], base: { hp: 50, atk: 64, def: 48, spd: 76 }, catch: 0.2, xp: 110, rare: true,
      learn: [[1, 'kratzer'], [1, 'heuler'], [6, 'biss'], [8, 'irrfeuer'], [10, 'funkenregen'], [13, 'glutschein'], [16, 'seelenbrand']],
      evo: { to: 'aschephoenix', lvl: 20 },
      desc: 'Ein Küken aus Funken, das nur schlüpft, wo eine erloschene Laterne wieder entzündet wurde. Sein Flaum knistert leise, wenn es friert.' },
    aschephoenix: { name: 'Aschephönix', g: 'm', type: 'Feuer', types: ['Feuer', 'Psycho'], base: { hp: 78, atk: 98, def: 70, spd: 102 }, catch: 0.08, xp: 220, rare: true,
      learn: [[1, 'kratzer'], [8, 'irrfeuer'], [10, 'funkenregen'], [13, 'glutschein'], [16, 'seelenbrand'], [20, 'phoenixflamme'], [24, 'wiedergeburt']],
      desc: 'Ein Vogel aus Glut und Asche mit einem Schweif wie ein Sonnenuntergang. Er verbrennt nie ganz – aus jeder Asche steigt er von Neuem auf.' },
    farnkitz: { name: 'Farnkitz', g: 'n', type: 'Pflanze', types: ['Pflanze'], base: { hp: 58, atk: 56, def: 58, spd: 66 }, catch: 0.2, xp: 110, rare: true,
      learn: [[1, 'rempler'], [1, 'starren'], [6, 'kopfnuss'], [8, 'blattwirbel'], [10, 'hainruf'], [13, 'feenstaub'], [16, 'rankensog']],
      evo: { to: 'hainhirsch', lvl: 20 },
      desc: 'Ein Rehkitz mit Tupfen aus Farnblättern. Es lebt im Moorherz, wo die ältesten Wurzeln liegen, und verschwindet, sobald man zu laut atmet.' },
    hainhirsch: { name: 'Hainhirsch', g: 'm', type: 'Pflanze', types: ['Pflanze', 'Psycho'], base: { hp: 78, atk: 82, def: 80, spd: 84 }, catch: 0.08, xp: 200, rare: true,
      learn: [[1, 'rempler'], [8, 'blattwirbel'], [10, 'hainruf'], [13, 'feenstaub'], [16, 'rankensog'], [20, 'wurzelhieb'], [24, 'waldsegen']],
      evo: { to: 'kronenhirsch', lvl: 32 },
      desc: 'Ein Hirsch, in dessen Geweih Blüten und kleine Lichter wachsen. Wo er steht, grünt das Moor über Nacht.' },
    kronenhirsch: { name: 'Kronenhirsch', g: 'm', type: 'Pflanze', types: ['Pflanze', 'Psycho'], base: { hp: 100, atk: 104, def: 100, spd: 96 }, catch: 0.05, xp: 260, rare: true,
      learn: [[1, 'rempler'], [8, 'blattwirbel'], [10, 'hainruf'], [16, 'rankensog'], [20, 'wurzelhieb'], [24, 'waldsegen'], [32, 'kronenlicht']],
      desc: 'Sein Geweih ist eine ganze Baumkrone voller Geisterlichter. Man sagt, er sei der Hüter aller Wälder, die es je gab – und aller, die noch wachsen werden.' },
    // ===== Team Quantum & Legende =====
    synx: { name: 'Synx', g: 'm', type: 'Psycho', types: ['Psycho'], base: { hp: 54, atk: 50, def: 50, spd: 54 }, catch: 0, xp: 150, boss: true,
      learn: [[1, 'kratzer'], [8, 'raetselblick'], [8, 'sphinxkralle'], [8, 'nebelwand'], [10, 'irrnebel']],
      desc: 'Ein sprechender Sphinx-Kater von Team Quantum, mit steinernen Flügeln und Augen wie zwei Rätsel. Er stellt Fragen, auf die es keine gute Antwort gibt – und geniesst es.' },
    fyrlumen: { name: 'Fyrlumen', g: 'n', type: 'Psycho', types: ['Psycho', 'Elektro'], base: { hp: 110, atk: 100, def: 100, spd: 110 }, catch: 0, xp: 300, boss: true, legend: true,
      learn: [[1, 'hauch'], [8, 'blendlicht'], [8, 'glimmstrom'], [9, 'nebelschleier']],
      desc: 'Gesichtet über dem Leuchtturm der Nebelküste: ein Geist aus Licht und Nebel mit Schwingen wie ein Leuchtfeuer. Er bricht nur auf, wenn eine grosse Geschichte beginnt – und Ungemach droht.' },
    // Wächter (Boss)
    nebelahn: { name: 'Nebelahn', g: 'm', type: 'Psycho', types: ['Psycho', 'Kampf'], base: { hp: 96, atk: 70, def: 70, spd: 56 }, catch: 0, xp: 160, boss: true,
      learn: [[1, 'rempler'], [8, 'irrnebel'], [8, 'ahnenstoss'], [8, 'nebelwand'], [10, 'schleiersturz'], [16, 'ahnenruf']],
      desc: 'So alt wie der Nebel selbst, mit einem Geweih aus Dunst. Er hält die Verlorenen fest, damit sie nicht allein weitergehen müssen.' }
  };
  G.SPECIES_ORDER = ['flackerling', 'glutwurm', 'seelendrache', 'pfuetzling', 'nebelente', 'mondschwan', 'blattling', 'hainfee', 'feenlinde',
    'kleeling', 'moorranke', 'moorlurch', 'moorunke', 'kieselgeist', 'menhirgeist',
    'schattenmotte', 'grabfalter', 'nebelkauz', 'schleierkauz', 'laternchen', 'totenleuchte',
    'torfwicht', 'hauchling', 'raufdachs', 'grimmdachs', 'schwammling', 'moderhut',
    'tauhase', 'funkmaus', 'moosigel', 'farnigel', 'gischtkrebs', 'glimmfuchs', 'glutfaehe', 'tropfsteinmolch', 'kristallmolch', 'flatterhauch',
    'blitzreiher', 'sumpfnatter', 'grubenkaefer', 'keilerling', 'moorkeiler',
    'mondluchs', 'sternenluchs', 'tiefenkalb', 'nebelwal', 'funkenkueken', 'aschephoenix', 'farnkitz', 'hainhirsch', 'kronenhirsch',
    'nebelahn', 'synx', 'fyrlumen'];
  // v15: neue Tier- und Naturgeister (15) und seltene Sondergeister (4 Linien)
  G.NEW15 = ['tauhase', 'funkmaus', 'moosigel', 'farnigel', 'gischtkrebs', 'glimmfuchs', 'glutfaehe', 'tropfsteinmolch', 'kristallmolch', 'flatterhauch',
    'blitzreiher', 'sumpfnatter', 'grubenkaefer', 'keilerling', 'moorkeiler'];
  G.RARE = ['mondluchs', 'sternenluchs', 'tiefenkalb', 'nebelwal', 'funkenkueken', 'aschephoenix', 'farnkitz', 'hainhirsch', 'kronenhirsch'];
  // Stufenweise: noch nicht freigeschaltete Geister erscheinen nicht in der Chronik
  G.SPECIES_ORDER = G.SPECIES_ORDER.filter(sp => (G.FEAT.rare || !G.RARE.includes(sp)) && (G.FEAT.cave || sp !== 'synx') && (G.FEAT.legend || sp !== 'fyrlumen'));
  // Starter-Dreieck: Feuer schlägt Pflanze, Pflanze schlägt Wasser, Wasser schlägt Feuer
  G.STARTERS = ['flackerling', 'pfuetzling', 'blattling'];
  // alte Arten-IDs (Spielstand-Migration): der Glutfuchs Irrfackel wurde zum Glutwurm der neuen Drachen-Linie
  G.SPECIES_RENAMED = { irrfackel: 'glutwurm' };
  // Starter-Linie eines Spielstands (auch aus Entwicklungen und alten Spielständen ableitbar, z. B. Kieselgeist)
  G.STARTER_LINE = { flackerling: 'flackerling', glutwurm: 'flackerling', seelendrache: 'flackerling', pfuetzling: 'pfuetzling', nebelente: 'pfuetzling',
    mondschwan: 'pfuetzling', blattling: 'blattling', hainfee: 'blattling', feenlinde: 'blattling', moorlurch: 'moorlurch', moorunke: 'moorlurch',
    schwammling: 'schwammling', moderhut: 'schwammling', kieselgeist: 'kieselgeist', menhirgeist: 'kieselgeist' };
  G.starterOf = S => { if (!S) return null; if (S.starter) return S.starter; const m = [...(S.team || []), ...(S.box || [])].find(m => G.STARTER_LINE[m.sp]); return m ? G.STARTER_LINE[m.sp] : null; };

  // ---------- Wildgebiete ----------
  // G.WILD bleibt für Nebelgras (Kompatibilität). lvl: [min, max]; Formel siehe design.md §10.
  // v15: jedes Gebiet hat seine eigenen 4–5 Arten passend zum Lebensraum, kaum Überschneidungen, je eine seltene Art (Gewicht ≤ 8).
  // Starter-Linien (Flackerling, Pfützling, Blattling + Entwicklungen) kommen nirgends wild vor – nur bei Beschwörern.
  G.WILD = [['tauhase', 28], ['schattenmotte', 26], ['moosigel', 22], ['laternchen', 18], ['kleeling', 6]];
  // Story-Reihenfolge der Wildgebiete; Level steigen monoton (siehe README «Level-Kurve»)
  G.ZONE_ORDER = ['nebelgras', 'kuestengras', 'hoehle', 'schilfrand', 'torfstich', 'kapelle', 'moorherz'];
  G.WILD_AREAS = {
    // Dorf-Nebelgras: Wiesen- und Feldgeister
    nebelgras: { name: 'Nebelgras', tile: '"', rate: 0.055, lvl: [2, 6], table: G.WILD, rare: 'kleeling' },
    // Küstenweg zum Leuchtturm: Strand, Dünen und Wind
    kuestengras: { name: 'Küstenweg', tile: '"', map: 'kueste', rate: 0.05, lvl: [5, 8], rare: 'glimmfuchs',
      table: [['funkmaus', 26], ['gischtkrebs', 24], ['nebelkauz', 22], ['moorlurch', 20], ['glimmfuchs', 6]] },
    // Höhle am Leuchtturmpfad: Stein und Neutral
    hoehle: { name: 'Klippenhöhle', tile: 'j', map: 'hoehle', rate: 0.07, lvl: [5, 9], rare: 'grubenkaefer',
      table: [['flatterhauch', 32], ['tropfsteinmolch', 30], ['kieselgeist', 26], ['grubenkaefer', 6]] },
    // Schilfrand (Tiefes Moor): Wasser und Schilf
    schilfrand: { name: 'Schilfrand', tile: 'q', rate: 0.05, lvl: [8, 11], rare: 'moorunke',
      table: [['sumpfnatter', 28], ['raufdachs', 24], ['blitzreiher', 22], ['schwammling', 20], ['moorunke', 5]] },
    // Torfstich: Erde, Wurzeln, glimmender Torf
    torfstich: { name: 'Torfstich', tile: 'm', rate: 0.06, lvl: [10, 13], rare: 'glimmfuchs',
      table: [['keilerling', 30], ['torfwicht', 26], ['grubenkaefer', 24], ['glimmfuchs', 6]] },
    // Versunkene Kapelle: Seelen, Falter, Käuze
    kapelle: { name: 'Versunkene Kapelle', tile: 'c', rate: 0.065, lvl: [12, 15], rare: 'totenleuchte',
      table: [['hauchling', 28], ['grabfalter', 20], ['schleierkauz', 18], ['moorranke', 18], ['totenleuchte', 8]] },
    // Moorherz (Tiefes Moor, Torffeld bei Jorins Hütte): die ältesten, stärksten Geister
    moorherz: { name: 'Moorherz', tile: 'm', map: 'tiefesmoor', region: [2, 21, 7, 27], rate: 0.06, lvl: [13, 16], rare: 'kristallmolch',
      table: [['moderhut', 26], ['grimmdachs', 22], ['farnigel', 22], ['kristallmolch', 8]] }
  };
  // v15 ohne Klippenhöhle (kommt in v16): Höhlenbewohner vorerst an Küstenfelsen und Grabsteinen – der Molch an der Brandung, die Fledermaus bei der Kapelle
  if (!G.FEAT.cave) { G.WILD_AREAS.kuestengras.table.push(['tropfsteinmolch', 12]); G.WILD_AREAS.torfstich.table.push(['kieselgeist', 16]); G.WILD_AREAS.kapelle.table.push(['flatterhauch', 16]); delete G.WILD_AREAS.hoehle; G.ZONE_ORDER = G.ZONE_ORDER.filter(z => z !== 'hoehle'); }
  // Sondergeister: sehr selten (1,5 %) und nur unter besonderen Bedingungen (in world.js geprüft)
  G.RARE_SPAWNS = [
    { sp: 'mondluchs', zone: 'nebelgras', chance: 0.015, lvl: [6, 8], cond: 'fog', hint: 'nur bei dichtem Nebel' },
    { sp: 'tiefenkalb', zone: 'kuestengras', chance: 0.015, lvl: [7, 9], cond: 'shore', hint: 'im Küstengras direkt am Meer' },
    { sp: 'funkenkueken', zone: 'torfstich', chance: 0.015, lvl: [11, 13], cond: 'lantern', hint: 'neben einer entzündeten Moorlaterne' },
    { sp: 'farnkitz', zone: 'moorherz', chance: 0.02, lvl: [13, 15], cond: 'hidden', hint: 'in der verborgenen Ecke des Moorherzens' }
  ];

  // ---------- Gegenstände ----------
  // kind: heal | cure | revive | catch | key.  battle/field: wo nutzbar.
  G.ITEMS = {
    laterne:      { name: 'Seelenfänger', art: 'einen', kind: 'catch', mult: 1.0, battle: true, field: false,
      desc: 'Eine kleine Laterne aus Mondglas. Ein müder Geist findet darin Ruhe und folgt dir danach.' },
    mondlaterne:  { name: 'Mondglas-Fänger', art: 'einen', kind: 'catch', mult: 1.5, battle: true, field: false,
      desc: 'Doppelt geblasenes Mondglas. Selbst scheue Geister fühlen sich darin geborgen.' },
    kraeutertee:  { name: 'Kräutertee', kind: 'heal', hp: 20, battle: true, field: true,
      desc: 'Heddas Mischung aus Moorminze und Lindenblüten. Heilt 20 LP.' },
    starktee:     { name: 'Starker Kräutertee', kind: 'heal', hp: 50, battle: true, field: true,
      desc: 'Lange gezogen, mit einem Löffel Heidehonig. Heilt 50 LP.' },
    wacholder:    { name: 'Wacholderrauch', kind: 'cure', cures: ['klamm'], battle: true, field: true,
      desc: 'Ein glimmendes Bündel. Der Rauch vertreibt die Moorkälte.' },
    klarblick:    { name: 'Klarblick-Tropfen', kind: 'cure', cures: ['verirrt'], battle: true, field: false,
      desc: 'Tau aus Mondblumen. Wer ihn schmeckt, findet den Weg zurück.' },
    nachtkerze:   { name: 'Nachtkerze', kind: 'revive', hpFrac: 0.5, battle: true, field: true,
      desc: 'Eine Kerze, die nie ganz ausgeht. Holt einen erschöpften Geist mit halber Kraft zurück.' },
    moorminze:    { name: 'Moorminze', kind: 'key', battle: false, field: false,
      desc: 'Duftendes Kraut vom Moorrand. Hedda tauscht 2 Stück gegen einen Kräutertee.' },
    jorinsbrief:  { name: 'Jorins Zettel', kind: 'key', battle: false, field: false,
      desc: '«Bin im Moor. Zurück, wenn der Nebel geht. – Jorin» Auf der Rückseite: eine Skizze der Bohlenwege.' },
    kompass:      { name: 'Vaters Kompass', kind: 'key', battle: false, field: false,
      desc: 'Messing, mit einem Sprung im Glas. Vater hatte ihn auf jeder Fahrt dabei.' },
    marenslaterne:{ name: 'Marens Laterne', kind: 'key', battle: false, field: false,
      desc: 'Eine verbeulte Laterne mit einem eingeritzten «M». Sie ist kalt, aber nicht leer.' }
  };

  // Team eines Beschwörers; teamFor ersetzt den zweiten Geist je nach Starter des Spielers
  G.trainerTeam = id => {
    const tr = G.TRAINERS[id]; if (!tr.teamFor) return tr.team;
    const sp = tr.teamFor[G.starterOf(G.state)]; return sp ? tr.team.map((e, i) => i === 1 ? [sp, e[1]] : e) : tr.team;
  };
  // ---------- Geisterbeschwörer & Boss ----------
  G.TRAINERS = {
    // Fenn lauert nicht mehr auf: Er steht erst nach der Fang-Übung am Wegweiser und kämpft nur, wenn du ihn ansprichst und zusagst.
    fenn: { name: 'Fenn', title: 'Kleiner Geisterbeschwörer', area: 'dorf', pos: [13, 15], sight: 0,
      // zweiter Geist je nach Starter, so abgestimmt, dass jeder Starter nach etwas Training (Lv 7) gut 3 von 4 Kämpfen gewinnt
      team: [['laternchen', 5], ['raufdachs', 6]],
      // Konter-Wahl: Fenn nimmt den Typ, der deinen Starter schlägt (Wasser gegen Feuer, Pflanze gegen Wasser, Feuer gegen Pflanze)
      teamFor: { flackerling: 'moorlurch', pfuetzling: 'kleeling', blattling: 'flackerling', moorlurch: 'raufdachs', schwammling: 'nebelkauz', kieselgeist: 'flackerling' },
      ask: ['Fenn: Du! Du hast jetzt auch Geister, oder? Ich hab jeden Tag im Nebelgras trainiert!',
        'Fenn: Ilse sagt, man soll erst im Nebelgras üben, bis die Geister ein paar Level stärker sind. Level 7 oder so. Dann ist es ein fairer Kampf.'],
      askQ: 'Fenn: Willst du gegen mich kämpfen?',
      decline: ['Fenn: Dann trainier zuerst im Nebelgras südlich vom Dorf! Ich warte hier am Wegweiser.'],
      reward: { kraeutertee: 2 },
      get intro() {
        const sp = G.trainerTeam('fenn')[1][0];
        return ['Fenn: Halt! Ich bin ein echter Geisterbeschwörer. Fast. Mama sagt, ich darf nur bis zum Wegweiser.',
          `Fenn: Und ich hab einen neuen Freund – ${{ m: 'meinen', f: 'meine', n: 'mein' }[G.SPECIES[sp].g]} ${G.SPECIES[sp].name}! Den hab ich ganz allein im Nebelgras gefunden.`, 'Fenn: Kämpfen darf ich überall!'];
      },
      lose: ['Fenn: Ooh … Laternchen, das war trotzdem toll von dir.'],
      after: ['Fenn: Wenn du Jorin findest, sagst du ihm, dass ich seine Schnitzfigur noch habe? Ich pass gut auf sie auf.'] },
    // Selma stellt sich nicht in den Weg, bevor du bereit bist: ansprechen, zusagen – erst dann Kampf (sie gibt den Steg danach frei)
    selma: { name: 'Selma', title: 'Geisterbeschwörerin', area: 'tiefesmoor', pos: [16, 34], sight: 0,
      ask: ['Selma: Der Steg dahinter führt ins Tiefe Moor. Dort sind die Geister alt und stark.',
        'Selma: Wenn deine Geister noch jung sind, trainier erst im Schilf am Moorrand. Ab Level 9 oder 10 hast du eine Chance gegen mich.'],
      askQ: 'Selma: Willst du dich mit mir messen?',
      decline: ['Selma: Klug. Das Schilf läuft nicht davon – und ich auch nicht.'],
      team: [['nebelkauz', 9], ['moorlurch', 10]],
      reward: { klarblick: 1, laterne: 3 },
      intro: ['Selma: Du willst tiefer hinein? Dann zeig mir zuerst, was deine Geister können.'],
      lose: ['Selma: Gut gekämpft. Deine Geister vertrauen dir, das sieht man.'],
      after: ['Selma: Hinter den drei Weiden wird der Nebel dicker. Dort wirst du nicht mehr sehen, was dich angreift – nur hören.'] },
    // v15: Klippenhöhle – zwei Beschwörer (nur auf Ansprache) und Team Quantum
    ruedi: { name: 'Ruedi', title: 'Höhlenforscher', area: 'hoehle', pos: [14, 11], sight: 0,
      ask: ['Ruedi: Pass auf, wo du hintrittst – hier bröckelt es überall. Ich kartiere die Gänge unter der Klippe.',
        'Ruedi: Meine Geister kennen jeden Stein hier drin. Wenn deine noch unter Level 7 sind, üb lieber erst im Geröll.'],
      askQ: 'Ruedi: Lust auf einen kleinen Kampf?',
      decline: ['Ruedi: Auch recht. Ich bin noch eine Weile hier.'],
      team: [['tropfsteinmolch', 7], ['flatterhauch', 8]],
      reward: { kraeutertee: 2 },
      intro: ['Ruedi: Na gut! Aber nicht weinen, wenn es staubt.'],
      lose: ['Ruedi: Hui. Das war sauber. Du hast ein gutes Auge für die Schwachstellen.'],
      after: ['Ruedi: Weiter oben hab ich vorhin Stimmen gehört. Zwei Leute und … eine Katze? Die klang, als würde sie reden.'] },
    nele: { name: 'Nele', title: 'Laternenträgerin', area: 'hoehle', pos: [19, 9], sight: 0,
      ask: ['Nele: Ich bringe Onno jede Woche Lampenöl – normalerweise über den Pfad. Aber heute ist der Weg zu seinem Baum versperrt.',
        'Nele: Wenn du da hoch willst, solltest du stark genug sein. Kräutertee hilft, falls deine Geister müde sind.'],
      askQ: 'Nele: Zeigst du mir, was du kannst?',
      decline: ['Nele: Gut. Ruh dich aus, bevor du weitergehst.'],
      team: [['kieselgeist', 8], ['tauhase', 8]],
      reward: { kraeutertee: 2, laterne: 2 },
      intro: ['Nele: Dann los – aber fair!'],
      lose: ['Nele: Du bist stärker, als du aussiehst. Nimm den Tee mit, du wirst ihn brauchen.'],
      after: ['Nele: Oben in der Kammer glimmt es seltsam. Als würde jemand das Licht vom Leuchtturm abzapfen.'] },
    quantum: { name: 'Mandy und Hans', title: 'Team Quantum', area: 'hoehle', pos: [18, 2], sight: 0, noFlee: true, noCatch: true, music: 'quantum',
      callers: ['Mandy', 'Hans', 'Mandy', 'Synx'],
      team: [['sumpfnatter', 6], ['keilerling', 6], ['funkmaus', 7], ['synx', 9]],
      phases: { synx: 2 }, hpMultFor: { synx: 0.75 },   // zwei Lebensbalken à 75 % (Balance-Simulation: README)
      reward: { starktee: 1, laterne: 3 },
      intro: ['Mandy: Also gut. Hans, du nimmst links.', 'Hans: Ich nehme immer links. Links ist meine Schokoladenseite.'],
      lose: ['Synx: … Genug. Dieses Kind hat mehr Licht, als gut für uns ist.', 'Mandy: Das war nur ein Aufwärmen. Nur damit das klar ist.',
        'Hans: Ich finde ja, wir haben gut ausgesehen.'],
      after: [] },
    kaspar: { name: 'Kaspar Graumantel', title: 'Geisterbeschwörer', area: 'tiefesmoor', pos: [18, 9], sight: 4,
      team: [['grabfalter', 12], ['raufdachs', 12], ['hauchling', 13]],
      reward: { mondlaterne: 2, starktee: 1 },
      intro: ['Kaspar: Noch jemand, der den Alten stören will? Er gehört mir. Wer ihn bindet, befiehlt dem Nebel.', 'Kaspar: Geh nach Hause, Kind. Oder kämpfe.'],
      lose: ['Kaspar: … Deine Geister folgen dir nicht, weil sie müssen. Merkwürdig.'],
      after: ['Kaspar: Geh. Aber wenn du ihn nicht bindest, wirst du ihn trösten müssen. Das ist schwerer.'] },
    nebelahn: { name: 'Nebelahn', title: 'Wächter des Tiefen Moors', area: 'tiefesmoor', pos: [16, 3], boss: true, noFlee: true, noCatch: true, hpMult: 1.5, // Boss-LP x1.5 (56 -> 84 LP)
      team: [['nebelahn', 16]],
      reward: { marenslaterne: 1 },
      intro: ['Eine Stimme wie nasser Wind: «Noch ein Licht, das jemanden sucht.»', '«Hier findet niemand heim. Hier hört niemand auf zu warten.»'],
      lose: ['Der Nebel sinkt in sich zusammen wie ein müder Mensch.', '«Dann nimm ihn mit. Und sag ihr, dass ich gut auf sie aufgepasst habe.»'],
      after: ['Der Hügel ist still. Nur ein schwaches Glimmen zwischen den Steinen – wie ein Atem, der wartet.'] }
  };

  // ---------- Helfer & Formeln ----------
  G.art = (sp, kind) => {
    const g = G.SPECIES[sp].g;
    if (kind === 'wild') return { m: 'Ein wilder', f: 'Eine wilde', n: 'Ein wildes' }[g];
    return { m: 'Der wilde', f: 'Die wilde', n: 'Das wilde' }[g];
  };
  G.statCalc = (b, l) => Math.floor(b * 2 * l / 100) + 5;
  G.hpCalc = (b, l) => Math.floor(b * 2 * l / 100) + l + 10;
  G.xpFor = l => Math.floor(0.8 * l * l * l);
  G.stats = m => {
    const b = G.SPECIES[m.sp].base;
    return { hp: Math.floor(G.hpCalc(b.hp, m.lvl) * (m.hpMult || 1)), atk: Math.floor(G.statCalc(b.atk, m.lvl) * (m.rage || 1)), def: G.statCalc(b.def, m.lvl), spd: Math.floor(G.statCalc(b.spd, m.lvl) * (m.rage || 1)) };
  };
  G.fillPP = m => { m.pp = m.pp || {}; for (const id of m.moves) m.pp[id] = G.MOVES[id].pp; return m; };
  G.makeMon = (sp, lvl) => {
    const m = { sp, lvl, xp: G.xpFor(lvl), moves: [], hp: 0, status: null };
    for (const [l, mv] of G.SPECIES[sp].learn) if (l <= lvl && !m.moves.includes(mv)) m.moves.push(mv);
    m.moves = m.moves.slice(-4);
    G.fillPP(m);
    m.hp = G.stats(m).hp;
    return m;
  };
  // Alte Spielstände (v1) und fehlende Felder ergänzen
  G.migrateMon = m => {
    if (G.SPECIES_RENAMED[m.sp]) { m.sp = G.SPECIES_RENAMED[m.sp]; m.moves = (m.moves || []).filter(id => G.SPECIES[m.sp].learn.some(([, mv]) => mv === id)); }
    if (!G.SPECIES[m.sp]) m.sp = 'flackerling';
    m.moves = (m.moves || []).filter(id => G.MOVES[id]);
    if (!m.moves.length) m.moves = ['hauch'];
    // v4: unter Level 8 nur typenlose Attacken – Lernliste für das aktuelle Level neu ableiten (Typ-Attacken bleiben ab Level 8)
    if (m.lvl < G.TYPE_MOVE_LVL && m.moves.some(id => !G.isNeutral(id))) {
      const fresh = []; for (const [l, mv] of G.SPECIES[m.sp].learn) if (l <= m.lvl && !fresh.includes(mv)) fresh.push(mv);
      m.moves = fresh.slice(-4); if (!m.moves.length) m.moves = ['rempler'];
      m.pp = {};
    }
    m.pp = m.pp || {};
    for (const id of m.moves) if (typeof m.pp[id] !== 'number') m.pp[id] = G.MOVES[id].pp;
    if (m.status === undefined || (m.status && !G.STATUS[m.status.id])) m.status = null;
    if (m.status && !G.STATUS[m.status.id].persist) m.status = null;
    const st = G.stats(m); m.hp = Math.max(0, Math.min(st.hp, m.hp == null ? st.hp : m.hp));
    return m;
  };
  G.nm = m => G.SPECIES[m.sp].name;
  G.rnd = (a, b) => a + Math.floor(Math.random() * (b - a + 1));
  G.pickWeighted = list => {
    let tot = list.reduce((s, x) => s + x[1], 0), r = Math.random() * tot;
    for (const x of list) { r -= x[1]; if (r <= 0) return x[0]; }
    return list[0][0];
  };
  G.genitive = name => { const f = name.split(' ')[0]; return /[sxz]$/.test(f) ? f + '’' : f + 's'; };
})(window.G);
