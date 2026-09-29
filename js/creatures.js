'use strict';
// Eldenghost – die Geister im Comic-Pixelstil (eigene Entwürfe). Designraum 64×64, Boden y≈60, Vorderansicht blickt nach links.
// In der Rückansicht (S.back) entfallen Gesicht/Bauch (face:true), dafür erscheinen Rückenmerkmale (backOnly:true).
(function (G) {
  const A = G.Art;
  const F = { face: true }, B = { backOnly: true };
  const X = (o, p) => Object.assign({}, o, p);
  const DEF = {
    flackerling(S) { // kleiner Glutdrache (Salamander-Geist): grosser Kopf, Hörnchen, Flügelstummel, Schwanzflamme
      const sc = '#e0703a', sc2 = '#a84628', bel = '#ffd8a0', gl = '#ffc050', wing = '#f49a58', horn = '#f4e2b8';
      S.C(44, 53, 55, 46, 6, sc, { g: 'tail' }).C(55, 46, 58, 36, 4.4, sc, { g: 'tail' });
      S.E(58, 28, 5, 7.5, gl, { glow: true, g: 'flame' }).E(58.4, 25, 3, 4.6, '#fff0b0', { glow: true, g: 'flame' }).P([[55, 24], [58, 15], [61, 24]], gl, { glow: true, g: 'flame' });
      S.C(43, 50, 45, 58, 6, sc2, { g: 'legB' });
      S.P([[37, 37], [49, 21], [53, 33], [46, 41]], wing, { name: 'wing', g: 'wing' });
      S.C(39, 37, 49, 23, 1, sc2, { clip: 'wing', flat: true, line: false }).C(42, 39, 52, 31, 1, sc2, { clip: 'wing', flat: true, line: false });
      S.E(36, 47, 14, 11, sc, { name: 'body', g: 'body' });
      S.E(32, 51, 8, 6, bel, X(F, { clip: 'body', line: false }));
      for (const [x, y] of [[40, 37], [46, 40]]) S.P([[x - 2.4, y + 2], [x, y - 3.4], [x + 2.4, y + 2]], sc2, { g: 'body' });
      S.C(26, 51, 25, 58, 6, sc, { g: 'legF' }).C(33, 52, 33, 58, 6, sc, { g: 'legF' });
      S.E(25, 58.6, 4, 2, bel, { g: 'legF' }).E(33, 58.6, 4, 2, bel, { g: 'legF' });
      S.P([[25, 23], [31, 11], [31, 25]], horn, { g: 'horn' }).P([[15, 23], [17, 13], [22, 22]], horn, { g: 'horn' });
      S.E(22, 32, 14, 12, sc, { name: 'head', g: 'head' });
      S.E(11, 37, 7, 5, sc, { g: 'head' });
      S.E(15, 41, 9, 3.6, bel, X(F, { clip: 'head', line: false, g: 'head' }));
      S.eye(17, 31, 3.4, 4.4, '#ffb030').eye(27.5, 31, 3.8, 4.8, '#ffb030');
      S.E(6, 35.5, 1.2, 1, '#1a1428', X(F, { flat: true }));
      S.C(8, 40, 15, 41.4, 1, '#1a1428', X(F, { flat: true, line: false }));
      S.E(2.5, 30, 1.5, 1.5, gl, { glow: true }).E(5, 26, 1, 1, gl, { glow: true });
      S.E(26, 26, 6, 3, sc2, X(B, { clip: 'head', line: false }));
    },
    glutwurm(S) { // junger Lindwurm: Glutflügel, Nackenstacheln, aufrechte Haltung
      const sc = '#c85432', sc2 = '#8a3222', bel = '#ffc888', gl = '#ffb040', mem = '#f4844a', horn = '#f0dcb0';
      S.P([[34, 30], [58, 3], [63, 18], [61, 33], [50, 40]], mem, { name: 'wing', g: 'wing' });
      for (const [x, y] of [[58, 3], [63, 18], [61, 33]]) S.C(36, 31, x, y, 1.4, sc2, { clip: 'wing', flat: true, line: false });
      S.E(54, 20, 4, 4, gl, { glow: true, clip: 'wing', line: false }).E(56, 31, 2.6, 2.6, gl, { glow: true, clip: 'wing', line: false });
      S.C(46, 54, 59, 57, 6, sc, { g: 'tail' }).C(59, 57, 63, 51, 4, sc, { g: 'tail' });
      S.E(62, 46, 3.6, 5.4, gl, { glow: true }).E(62, 44, 2, 3, '#fff0b0', { glow: true });
      S.C(44, 48, 46, 59, 6.4, sc2, { g: 'legB' });
      S.E(38, 45, 14, 12, sc, { name: 'body', g: 'body' });
      S.E(31, 49, 8, 9, bel, X(F, { clip: 'body', line: false }));
      for (const y of [43, 47, 51, 55]) S.R(23, y, 16, 0.8, '#e09a60', X(F, { clip: 'body', flat: true, line: false }));
      S.C(29, 51, 28, 59, 6.4, sc, { g: 'legF' }).C(36, 52, 36, 59, 6.4, sc, { g: 'legF' });
      for (const x of [26, 28.5, 34, 36.5]) S.C(x, 59, x - 1, 60.5, 1.2, horn);
      S.P([[22, 24], [33, 25], [38, 40], [28, 42]], sc, { name: 'neck', g: 'neck' });
      for (const [x, y] of [[33, 26], [36, 32], [38, 38]]) S.P([[x - 1, y - 2], [x + 4, y - 1], [x, y + 2]], sc2, { g: 'neck' });
      S.P([[25, 15], [41, 6], [33, 19]], horn, { g: 'horn' }).P([[19, 14], [27, 3], [26, 17]], horn, { g: 'horn' });
      S.E(21, 21, 12, 9, sc, { name: 'head', g: 'head' }).E(9, 24.5, 7, 4.5, sc, { g: 'head' });
      S.E(12, 28, 8, 2.4, bel, X(F, { clip: 'head', line: false, g: 'head' }));
      S.eye(17, 20, 2.8, 3.4, '#ffd040', { white: 0.5 }).eye(25, 20, 3, 3.6, '#ffd040', { white: 0.5 });
      S.C(12, 16, 20, 17.5, 1.2, sc2, X(F, { flat: true, line: false }));
      S.E(4, 23, 1.2, 1, '#1a1428', X(F, { flat: true }));
      S.C(5, 27.5, 13, 28.4, 1, '#1a1428', X(F, { flat: true, line: false }));
      S.E(1.5, 20, 1.6, 1.6, gl, { glow: true }).E(3, 16, 1, 1, gl, { glow: true });
      S.E(26, 16, 6, 3, sc2, X(B, { clip: 'head', line: false }));
    },
    seelendrache(S) { // uralter Geisterdrache: Nordlicht-Schwingen, Flammenmähne, geisterhaft auslaufender Schweif
      const sc = '#7a3a64', sc2 = '#56264a', bel = '#ffc89a', gl = '#ff9a50', aur = '#f4a4dc', aur2 = '#a8f0ff', horn = '#f8e4c4';
      S.P([[30, 26], [40, 2], [50, 6], [63, 3], [58, 13], [63, 22], [55, 26], [58, 34], [48, 36]], '#8a4aa8', { name: 'wing', g: 'wing' });
      for (const [x, y] of [[40, 2], [50, 6], [63, 3], [63, 22], [58, 34]]) S.C(32, 28, x, y, 1.4, sc2, { clip: 'wing', flat: true, line: false });
      for (const [x0, y0, x1, y1, c] of [[42, 8, 58, 8, aur2], [40, 14, 58, 18, aur], [42, 22, 56, 28, aur2]]) S.C(x0, y0, x1, y1, 2, c, { clip: 'wing', glow: true, line: false });
      S.C(44, 56, 58, 60, 7, sc, { g: 'tail' }).C(58, 60, 63, 52, 5, sc, { g: 'tail' });
      S.E(62, 46, 3, 6, aur2, { glow: true }).E(60, 40, 2, 3, aur, { glow: true });
      S.C(44, 48, 47, 60, 7, sc2, { g: 'legB' });
      S.E(39, 45, 15, 13, sc, { name: 'body', g: 'body' });
      S.E(31, 49, 8, 10, bel, X(F, { clip: 'body', line: false }));
      S.E(31, 46, 3.4, 3.4, gl, X(F, { glow: true, clip: 'body' }));
      for (const y of [50, 54]) S.R(23, y, 16, 0.8, '#e0a070', X(F, { clip: 'body', flat: true, line: false }));
      S.C(29, 51, 28, 60, 7, sc, { g: 'legF' }).C(37, 52, 37, 60, 7, sc, { g: 'legF' });
      for (const x of [25.5, 28, 34, 36.5]) S.C(x, 60, x - 1.2, 61.5, 1.3, horn);
      S.P([[18, 22], [31, 20], [38, 40], [27, 42]], sc, { name: 'neck', g: 'neck' });
      for (const [x, y] of [[30, 21], [34, 27], [37, 33], [39, 39]]) S.P([[x - 1, y - 1], [x + 5, y - 4], [x + 1, y + 3]], gl, { glow: true, g: 'mane' });
      S.P([[22, 12], [40, 1], [31, 16]], horn, { g: 'horn' }).P([[16, 11], [22, 0], [23, 14]], horn, { g: 'horn' });
      S.E(18, 18, 11, 8.5, sc, { name: 'head', g: 'head' }).E(6, 21, 6.6, 4.4, sc, { g: 'head' });
      S.E(9, 24.5, 7.5, 2.2, bel, X(F, { clip: 'head', line: false, g: 'head' }));
      S.eye(14.5, 17, 2.6, 3, aur2, { dark: '#2a1a4a', white: 0.4 }).eye(22, 17, 2.8, 3.2, aur2, { dark: '#2a1a4a', white: 0.4 });
      S.C(9, 13, 18, 14.4, 1.2, sc2, X(F, { flat: true, line: false }));
      S.E(1.5, 20, 1.2, 1, '#1a1428', X(F, { flat: true }));
      S.C(2, 24.5, 10, 25.4, 1, '#1a1428', X(F, { flat: true, line: false }));
      for (const [x, y] of [[2, 12], [8, 5], [58, 36], [28, 4]]) S.E(x, y, 1.4, 1.4, aur2, { glow: true });
      S.E(24, 14, 6, 3, sc2, X(B, { clip: 'head', line: false }));
    },
    pfuetzling(S) { // flaumiges Geisterentlein mit Wassertropfen-Schopf
      const fl = '#9ad4f4', fl2 = '#68a6d8', bel = '#eaf8ff', bk = '#f4b040', gl = '#bff0ff';
      S.E(28, 59, 5, 2, bk, { g: 'feet' }).E(38, 59, 5, 2, bk, { g: 'feet' });
      S.P([[48, 41], [59, 34], [55, 47]], fl, { g: 'body' });
      S.E(36, 47, 16, 12.5, fl, { name: 'body', g: 'body' });
      S.E(33, 51, 10, 7.5, bel, X(F, { clip: 'body', line: false }));
      S.E(46, 45, 6.5, 8.5, fl2, { rot: -0.6, name: 'wing', g: 'wing' });
      for (const [x, y] of [[44, 48], [47, 46]]) S.C(x, y, x + 3, y + 4, 0.8, '#4a86b8', { clip: 'wing', flat: true, line: false });
      S.E(26, 29, 13, 12, fl, { name: 'head', g: 'head' });
      for (const [x, y] of [[20, 19], [30, 18], [35, 24]]) S.E(x, y, 2.4, 1.6, '#c8ecff', { clip: 'head', flat: true, line: false });
      S.P([[23.5, 18], [27, 6], [31, 18]], '#5ab0f0', { g: 'tuft' }).E(27.2, 18, 3.8, 3.2, '#5ab0f0', { g: 'tuft' });
      S.E(26, 15.5, 1, 1.5, '#eaf8ff', { flat: true, line: false });
      S.E(11.5, 34, 7, 3.4, bk, { g: 'beak' });
      S.C(5.5, 34.4, 17, 34.4, 0.7, '#c07820', X(F, { flat: true, line: false }));
      S.eye(19, 27.5, 3.4, 4.2, '#3a6aa8').eye(29.5, 27.5, 3.8, 4.6, '#3a6aa8');
      S.E(21, 34, 2.4, 1.4, '#f4b0c8', X(F, { flat: true, line: false })).E(33, 33.5, 2.4, 1.4, '#f4b0c8', X(F, { flat: true, line: false }));
      for (const [x, y] of [[5, 22], [57, 26], [58, 54]]) S.E(x, y, 1.4, 1.4, gl, { glow: true });
      S.E(30, 24, 5, 3, fl2, X(B, { clip: 'head', line: false }));
    },
    nebelente(S) { // elegante Nebelente: langer Hals, silbrig-blaues Gefieder, Nebelschleppe
      const fe = '#8ab4d8', fe2 = '#5e86b0', bel = '#dcecf8', bk = '#e8a040', gl = '#c8f4ff', mist = '#dce8f4';
      S.P([[50, 42], [63, 36], [60, 50], [52, 52]], fe2, { g: 'tail' });
      S.E(40, 47, 19, 11, fe, { name: 'body', g: 'body' });
      S.E(34, 52, 12, 5.5, bel, X(F, { clip: 'body', line: false }));
      S.P([[30, 40], [48, 34], [60, 42], [44, 50]], fe2, { name: 'wing', g: 'wing' });
      for (const x of [40, 46, 52]) S.C(x, 38, x - 4, 48, 0.9, '#46709a', { clip: 'wing', flat: true, line: false });
      S.C(24, 42, 20, 28, 7, fe, { g: 'neck' }).C(20, 28, 20, 20, 6, fe, { g: 'neck' });
      S.E(20, 16, 8.5, 7.5, fe, { name: 'head', g: 'head' });
      S.P([[20, 9], [27, 2], [26, 11]], fe2, { g: 'crest' }).P([[23, 9], [32, 5], [27, 12]], fe2, { g: 'crest' });
      S.E(8, 19, 6.5, 2.6, bk, { g: 'beak' }).C(2.5, 19.2, 13, 19.2, 0.6, '#b07020', X(F, { flat: true, line: false }));
      S.eye(17, 15, 2.4, 3, '#2e5a90', { white: 0.4 }).eye(23, 15, 2.6, 3.2, '#2e5a90', { white: 0.4 });
      S.C(19, 22, 23, 38, 1.2, '#dce8f8', X(F, { flat: true, line: false }));
      for (const [x, y] of [[4, 10], [60, 30], [6, 44], [62, 56]]) S.E(x, y, 1.4, 1.4, gl, { glow: true });
      S.E(24, 12, 5, 2.5, fe2, X(B, { clip: 'head', line: false }));
    },
    mondschwan(S) { // majestätischer Geisterschwan: erhobene Schwingen, S-Hals, Mondsichel auf der Stirn
      const fe = '#dfe4f4', fe2 = '#a8b4d8', fe3 = '#8290c0', bk = '#e89a48', moon = '#fff4c8', gl = '#c8e8ff', aur = '#b8a8f0';
      S.P([[34, 38], [40, 2], [52, 6], [63, 18], [58, 38]], fe2, { name: 'wingB', g: 'wingB' });
      for (const [x, y] of [[44, 5], [54, 10], [62, 20]]) S.C(40, 36, x, y, 1, fe3, { clip: 'wingB', flat: true, line: false });
      S.E(42, 48, 19, 11, fe, { name: 'body', g: 'body' });
      S.E(36, 53, 12, 5, '#f4f6fc', X(F, { clip: 'body', line: false }));
      S.P([[30, 44], [36, 16], [48, 20], [56, 34], [50, 48]], fe, { name: 'wing', g: 'wing' });
      for (const [x, y] of [[36, 18], [44, 20], [52, 28]]) S.C(34, 44, x, y, 0.9, fe2, { clip: 'wing', flat: true, line: false });
      S.E(46, 30, 4, 4, aur, { glow: true, clip: 'wing', line: false });
      S.C(26, 46, 18, 34, 7, fe, { g: 'neck' }).C(18, 34, 22, 22, 6.4, fe, { g: 'neck' }).C(22, 22, 20, 14, 6, fe, { g: 'neck' });
      S.E(18, 11, 8.5, 7, fe, { name: 'head', g: 'head' });
      S.E(18, 5, 2.8, 2.8, moon, { glow: true }).E(19.4, 4.2, 2.2, 2.2, fe, { flat: true, line: false });
      S.E(7.5, 14, 5.2, 2.5, bk, { g: 'beak' }).E(11, 12.5, 1.8, 1.8, '#2a2438', X(F, { flat: true }));
      S.C(3, 14.2, 12, 14.2, 0.6, '#a86020', X(F, { flat: true, line: false }));
      S.eye(15, 10, 2.2, 2.8, '#6a5ad0', { white: 0.4 }).eye(21, 10, 2.4, 3, '#6a5ad0', { white: 0.4 });
      for (const [x, y] of [[4, 4], [30, 2], [62, 30], [4, 40], [60, 52]]) S.E(x, y, 1.5, 1.5, gl, { glow: true });
      S.E(22, 8, 5, 2.5, fe2, X(B, { clip: 'head', line: false }));
    },
    blattling(S) { // winziger Setzling-Geist mit Blattflügeln, schwebt über einem Mondklee-Kreis
      const bark = '#c89a64', bark2 = '#9a7044', leaf = '#7ad05a', leaf2 = '#4a9a3e', bel = '#f0e0b8', gl = '#e8ffb0';
      S.C(28, 52, 26, 58, 3, bark2, { g: 'root' }).C(36, 52, 38, 58, 3, bark2, { g: 'root' });
      S.P([[36, 34], [58, 22], [56, 40], [42, 44]], leaf, { name: 'wingR', g: 'wing' }).C(38, 38, 56, 26, 0.8, leaf2, { clip: 'wingR', flat: true, line: false });
      S.P([[26, 38], [6, 30], [10, 46], [24, 46]], leaf, { name: 'wingL', g: 'wingB' }).C(24, 40, 8, 33, 0.8, leaf2, { clip: 'wingL', flat: true, line: false });
      S.E(32, 40, 13, 14, bark, { name: 'body', g: 'body' });
      S.E(31, 46, 8, 7, bel, X(F, { clip: 'body', line: false }));
      for (const y of [30, 36]) S.C(22, y, 26, y + 1, 0.8, bark2, { clip: 'body', flat: true, line: false });
      S.C(32, 27, 32, 18, 2.2, leaf2, { g: 'sprout' });
      S.E(26, 15, 7, 3.6, leaf, { rot: 0.5, name: 'l1', g: 'sprout' }).E(38, 13, 7, 3.6, leaf, { rot: -0.5, name: 'l2', g: 'sprout' });
      S.C(21, 12, 30, 17, 0.7, leaf2, { clip: 'l1', flat: true, line: false }).C(43, 10, 34, 15, 0.7, leaf2, { clip: 'l2', flat: true, line: false });
      S.E(32, 20, 1.8, 1.8, '#ffd8f0', { glow: true });
      S.eye(26.5, 38, 3.2, 4, '#4aa040').eye(36.5, 38, 3.4, 4.2, '#4aa040');
      S.E(24, 44, 2, 1.2, '#f4a8b8', X(F, { flat: true, line: false })).E(39, 44, 2, 1.2, '#f4a8b8', X(F, { flat: true, line: false }));
      S.C(29.5, 46, 33.5, 46, 1, '#5a3a24', X(F, { flat: true, line: false }));
      for (const [x, y] of [[6, 18], [58, 12], [60, 50], [4, 52], [48, 4]]) S.E(x, y, 1.4, 1.4, gl, { glow: true });
      S.E(32, 34, 6, 4, bark2, X(B, { clip: 'body', line: false }));
    },
    hainfee(S) { // Dryade: Rindenleib, Haar aus Birkenzweigen und Blättern, Blütenkranz, Blätterrock
      const bark = '#b89468', bark2 = '#8a6a44', skin = '#e8d8b8', leaf = '#6cc45a', leaf2 = '#3e8a3a', fl = '#ffc8e8', gl = '#e8ffc8';
      S.C(29, 50, 27, 60, 3.4, bark2, { g: 'legs' }).C(35, 50, 37, 60, 3.4, bark2, { g: 'legs' });
      S.P([[20, 56], [26, 40], [38, 40], [46, 56], [33, 52]], leaf, { name: 'skirt', g: 'skirt' });
      for (const x of [26, 32, 38]) S.C(x, 44, x - 1, 54, 0.8, leaf2, { clip: 'skirt', flat: true, line: false });
      S.C(26, 30, 12, 20, 2.6, bark2, { g: 'armL' }).C(12, 20, 8, 12, 2, bark2, { g: 'armL' }).C(12, 20, 5, 22, 1.6, bark2, { g: 'armL' });
      S.E(7, 11, 3, 2, leaf, { rot: 0.8, g: 'armL' }).E(4, 22, 2.6, 1.8, leaf, { g: 'armL' });
      S.C(38, 30, 48, 38, 2.6, bark2, { g: 'armR' }).E(50, 40, 2.6, 2, leaf, { g: 'armR' });
      S.E(32, 34, 8, 9, bark, { name: 'body', g: 'body' });
      for (const y of [30, 34, 38]) S.C(28, y, 36, y + 0.6, 0.7, bark2, { clip: 'body', flat: true, line: false });
      for (const [x, y, r] of [[20, 10, -0.6], [44, 10, 0.6], [16, 18, -1], [48, 18, 1], [24, 4, -0.3], [40, 4, 0.3]]) S.E(x, y, 6, 3, leaf, { rot: r, g: 'hair' });
      S.C(24, 12, 20, 3, 1.4, '#e8e0d0', { g: 'hair' }).C(40, 12, 45, 2, 1.4, '#e8e0d0', { g: 'hair' });
      S.E(32, 18, 10, 10, skin, { name: 'head', g: 'head' });
      S.P([[22, 16], [26, 8], [38, 8], [42, 16], [32, 12]], leaf2, { clip: 'head', flat: true, line: false });
      for (const x of [25, 32, 39]) S.E(x, 9.5, 2.2, 2.2, fl, { glow: true, g: 'crown' });
      S.eye(28, 19, 2.4, 3.2, '#3e9a4a').eye(36, 19, 2.4, 3.2, '#3e9a4a');
      S.E(26, 24, 1.6, 1, '#f0a0b0', X(F, { flat: true, line: false })).E(38, 24, 1.6, 1, '#f0a0b0', X(F, { flat: true, line: false }));
      S.C(30, 25, 34, 25, 0.9, '#6a4a3a', X(F, { flat: true, line: false }));
      for (const [x, y] of [[4, 34], [58, 24], [56, 50], [10, 52], [52, 6]]) S.E(x, y, 1.4, 1.4, gl, { glow: true });
      S.E(32, 16, 7, 5, leaf2, X(B, { clip: 'head', line: false }));
    },
    feenlinde(S) { // uralter Feenbaum: knorriger Stamm mit Gesicht, weite Herzblatt-Krone voller Geisterlichter, Wurzeln
      const bark = '#8a6a4e', bark2 = '#5e4632', crown = '#5ab050', crown2 = '#3a8a42', crown3 = '#8ad86a', gl = '#fff0a8', ghost = '#b8f0ff';
      for (const [x0, x1] of [[26, 12], [30, 22], [36, 42], [40, 54]]) S.C(x0, 52, x1, 60, 3.6, bark2, { g: 'root' });
      S.P([[22, 60], [26, 30], [40, 30], [44, 60]], bark, { name: 'trunk', g: 'trunk' });
      for (const [x0, y0, x1, y1] of [[28, 34, 27, 58], [34, 36, 36, 58], [39, 34, 41, 56]]) S.C(x0, y0, x1, y1, 0.9, bark2, { clip: 'trunk', flat: true, line: false });
      S.C(26, 34, 12, 24, 3.4, bark, { g: 'br' }).C(40, 34, 54, 22, 3.4, bark, { g: 'br' });
      for (const [x, y, rx, ry] of [[32, 14, 20, 12], [14, 22, 12, 9], [50, 20, 13, 10], [22, 8, 11, 7], [44, 8, 11, 7]]) S.E(x, y, rx, ry, crown, { name: 'c' + x, g: 'crown' });
      for (const [x, y] of [[20, 14], [34, 6], [46, 16], [12, 24], [54, 24], [28, 20], [40, 22]]) S.E(x, y, 3.4, 2.6, crown3, { clip: 'c32', flat: true, line: false });
      for (const [x, y] of [[8, 26], [56, 26], [16, 4], [48, 3]]) S.E(x, y, 3, 2.4, crown2, { g: 'crown' });
      for (const [x, y] of [[18, 18], [30, 10], [44, 14], [52, 24], [24, 26], [38, 4], [10, 20]]) S.E(x, y, 1.6, 1.6, (x + y) % 3 ? gl : ghost, { glow: true });
      S.eye(29, 42, 2.4, 2.8, '#b8ffb0', { dark: '#241a14' }).eye(37, 42, 2.4, 2.8, '#b8ffb0', { dark: '#241a14' });
      S.C(26, 38.5, 31, 39.4, 1, bark2, X(F, { flat: true, line: false })).C(40, 38.5, 35, 39.4, 1, bark2, X(F, { flat: true, line: false }));
      S.C(30, 49, 36, 49, 1, '#241a14', X(F, { flat: true, line: false }));
      S.E(32, 44, 3, 2.4, bark2, X(B, { clip: 'trunk', line: false }));
      for (const [x, y] of [[2, 40], [62, 40], [6, 56], [58, 56]]) S.E(x, y, 1.3, 1.3, ghost, { glow: true });
    },
    kleeling(S) { // hüpfendes Vierblatt-Kleeblatt auf Stielbeinchen
      const lf = '#6ac85a', lf2 = '#3e8a3a', lf3 = '#a4e888', st = '#4a8a3a', gl = '#e8ffb8';
      S.C(29, 44, 26, 58, 2.4, st, { g: 'legs' }).C(35, 44, 38, 58, 2.4, st, { g: 'legs' });
      S.E(25, 59, 3.4, 1.6, lf2, { g: 'legs' }).E(39, 59, 3.4, 1.6, lf2, { g: 'legs' });
      S.C(32, 44, 46, 50, 1.8, st, { g: 'stem' }).E(48, 50, 3, 2, lf, { g: 'stem' });
      for (const [x, y] of [[22, 22], [42, 22], [22, 38], [42, 38]]) { S.E(x, y, 11, 10, lf, { name: 'lf' + x + y, g: 'leaves' }); S.E(x + (x < 32 ? 2 : -2), y + (y < 30 ? 2 : -2), 5, 4, lf3, { clip: 'lf' + x + y, flat: true, line: false }); }
      S.C(32, 30, 22, 22, 0.8, lf2, { clip: 'lf2222', flat: true, line: false }).C(32, 30, 42, 22, 0.8, lf2, { clip: 'lf4222', flat: true, line: false });
      S.E(32, 30, 10, 9, lf, { name: 'face', g: 'face' });
      S.eye(28, 29, 2.8, 3.4, '#3a7a3a').eye(36, 29, 2.8, 3.4, '#3a7a3a');
      S.C(30, 35, 34, 35, 0.9, '#2e4a2a', X(F, { flat: true, line: false }));
      S.E(26, 34, 1.6, 1, '#f4b0b8', X(F, { flat: true, line: false })).E(38, 34, 1.6, 1, '#f4b0b8', X(F, { flat: true, line: false }));
      for (const [x, y] of [[6, 14], [58, 12], [8, 48], [56, 42]]) S.E(x, y, 1.3, 1.3, gl, { glow: true });
    },
    moorranke(S) { // Kletterranke mit Glockenblüte als Kopf, Dornen und Nebelblüten
      const vn = '#4a8a44', vn2 = '#2e5e30', fl = '#a068c8', fl2 = '#d8a8f0', lf = '#6aae52', gl = '#e0c8ff';
      S.C(30, 60, 24, 50, 5, vn, { g: 'vine' }).C(24, 50, 34, 40, 5, vn, { g: 'vine' }).C(34, 40, 28, 30, 4.4, vn, { g: 'vine' });
      S.C(38, 60, 44, 52, 3.4, vn2, { g: 'vine' }).C(44, 52, 50, 44, 3, vn2, { g: 'vine' });
      for (const [x, y, r] of [[18, 46, 0.6], [40, 38, -0.6], [48, 42, -0.3], [22, 32, 0.8]]) S.E(x, y, 5, 2.6, lf, { rot: r, g: 'leaf' });
      for (const [x, y] of [[27, 47], [31, 42], [26, 35]]) S.P([[x - 1, y], [x - 3.4, y - 1.4], [x - 1, y - 2]], '#c8d8a0', { g: 'vine' });
      S.E(52, 40, 4, 4, fl, { g: 'bud' }).E(52, 39, 1.6, 1.6, fl2, { glow: true });
      S.P([[16, 20], [22, 6], [36, 4], [42, 18], [38, 30], [20, 30]], fl, { name: 'bell', g: 'bell' });
      S.P([[16, 24], [20, 34], [26, 30], [32, 36], [38, 30], [44, 34], [42, 24]], fl, { g: 'bell' });
      S.E(28, 12, 8, 4, fl2, { clip: 'bell', flat: true, line: false });
      S.eye(24, 20, 2.6, 3.2, '#e8d040', { white: 0.4 }).eye(33, 20, 2.8, 3.4, '#e8d040', { white: 0.4 });
      S.C(26, 27, 31, 27, 1, '#3a1a4a', X(F, { flat: true, line: false }));
      for (const [x, y] of [[8, 12], [54, 10], [10, 56], [58, 58], [50, 24]]) S.E(x, y, 1.3, 1.3, gl, { glow: true });
    },
    moorlurch(S) { // Molch aus dem Torf mit glimmenden Rückenflecken
      const sk = '#557a3c', sk2 = '#3e5c2e', bel = '#d0c080', sp = '#dcf070';
      S.E(50, 50, 12, 4.5, sk, { rot: -0.35, name: 'tail' });
      S.C(44, 52, 47, 59, 5, sk2, { g: 'legB' });
      S.E(38, 49, 14, 9, sk, { name: 'body', g: 'body' });
      S.E(34, 54, 10, 4, bel, X(F, { clip: 'body', line: false }));
      for (const [x, y] of [[36, 43], [44, 45], [49, 48], [30, 46]]) S.E(x, y, 2, 1.6, sp, { glow: true, clip: 'body', line: false });
      S.E(56, 47, 1.5, 1.3, sp, { glow: true, clip: 'tail', line: false });
      S.C(30, 53, 28, 59, 5, sk, { g: 'legF' }).C(38, 55, 39, 59, 5, sk, { g: 'legF' });
      for (const [x, y, r] of [[34, 26, -0.6], [36, 32, -0.1], [35, 38, 0.4]]) S.E(x, y, 5.5, 2.4, '#8aa854', { rot: r, g: 'gill' });
      S.E(22, 36, 15, 12, sk, { name: 'head', g: 'head' });
      S.E(20, 42, 10, 5, bel, X(F, { clip: 'head', line: false, g: 'head' }));
      S.eye(15.5, 34, 3.4, 4, '#e0c040').eye(26.5, 34, 3.8, 4.4, '#e0c040');
      S.C(12, 42, 19, 43.5, 1, '#1a1428', X(F, { flat: true }));
      S.E(12, 44, 2, 1.2, '#e8a0a0', X(F, { flat: true }));
      for (const [x, y] of [[20, 27], [27, 28]]) S.E(x, y, 1.6, 1.3, sp, X(B, { glow: true, clip: 'head' }));
    },
    moorunke(S) { // Unke mit glockenhellem Kehlsack
      const sk = '#3f6a36', sk2 = '#2e5028', bel = '#b8b878', sac = '#c6ec84', wart = '#6a9448';
      S.E(46, 55, 9, 5, sk2, { g: 'legB' }).E(52, 58, 6, 2.5, sk2, { g: 'legB' });
      S.E(34, 42, 23, 17, sk, { name: 'body', g: 'body' });
      for (const [x, y, r] of [[44, 30, 2.4], [51, 38, 2], [38, 26, 1.8], [47, 46, 1.8], [27, 26, 1.6], [54, 45, 1.4]]) S.E(x, y, r, r * 0.8, wart, { clip: 'body', line: false });
      S.E(28, 50, 13, 8, bel, X(F, { clip: 'body', line: false }));
      S.E(24, 45, 9, 6.5, sac, X(F, { glow: true }));
      S.E(18, 58, 7, 2.6, sk, { g: 'legF' }).C(20, 50, 18, 57, 6, sk, { g: 'legF' });
      S.E(38, 58, 6, 2.6, sk, { g: 'legF' }).C(36, 51, 38, 57, 6, sk, { g: 'legF' });
      S.E(18, 26, 6.5, 6, sk, { g: 'body' }).E(34, 24, 7, 6.5, sk, { g: 'body' });
      S.eye(18, 26, 4.2, 4.6, '#f0c040', { white: 0 }).eye(34, 24, 4.6, 5, '#f0c040');
      S.C(10, 36, 30, 38, 1.2, '#1a1428', X(F, { flat: true }));
      for (const [x, y] of [[26, 30], [36, 36], [42, 28], [30, 42]]) S.E(x, y, 2, 1.7, sac, X(B, { glow: true, clip: 'body' }));
    },
    kieselgeist(S) { // kleine Schildkröte mit Bachkiesel-Panzer
      const sk = '#8aa07e', sk2 = '#6a8062', rim = '#5c5446';
      S.E(52, 54, 4, 2.5, sk, { rot: 0.3 });
      S.E(44, 56, 4.5, 4, sk2, { g: 'legB' }).E(22, 56, 4, 4, sk2, { g: 'legB' });
      S.E(36, 45, 19, 13, '#9a9282', { name: 'shell', g: 'shell' });
      const peb = [[28, 38, 5, 4, '#b4ab98'], [38, 36, 5.5, 4.4, '#8e8a84'], [47, 41, 5, 4, '#a89c88'], [33, 46, 5, 4, '#9aa0a4'], [43, 48, 5, 3.6, '#b8b0a0'], [24, 47, 4, 3.4, '#8a8272'], [52, 49, 3.5, 3, '#9a948a']];
      for (const [x, y, rx, ry, c] of peb) S.E(x, y, rx, ry, c, { clip: 'shell', g: 'peb' + x, cast: false });
      S.R(17, 51, 38, 4, rim, { name: 'rim' }).E(36, 53, 19, 2.5, rim, { g: 'rim' });
      S.E(46, 58, 4.5, 3, sk, { g: 'legF' }).E(26, 58, 4.5, 3, sk, { g: 'legF' });
      S.E(14, 44, 10.5, 9.5, sk, { name: 'head' });
      S.eye(9.5, 43, 2.8, 3.6, '#50a0a8').eye(17, 43, 3.1, 3.9, '#50a0a8');
      S.C(7, 49, 12, 49.5, 1, '#1a1428', X(F, { flat: true }));
      S.E(15, 48, 2.2, 1.3, '#d89898', X(F, { flat: true, alpha: 0.8 }));
    },
    menhirgeist(S) { // grosse Schildkröte, die einen Menhir mit Wachtfeuer-Russ trägt
      const sk = '#7c8e72', sk2 = '#5e6e56', st = '#8a8478', rune = '#ff9e52';
      S.P([[30, 30], [33, 4], [41, 1], [46, 8], [46, 30]], st, { name: 'stone' });
      S.C(37, 10, 38, 26, 1.2, rune, { glow: true, clip: 'stone' }).C(35, 14, 41, 14, 1.2, rune, { glow: true, clip: 'stone' }).C(35, 21, 41, 19, 1.2, rune, { glow: true, clip: 'stone' });
      S.E(41, 5, 4, 3, '#4a4038', { clip: 'stone', line: false });
      S.E(50, 56, 6, 5, sk2, { g: 'legB' }).E(20, 56, 5.5, 5, sk2, { g: 'legB' });
      S.E(36, 44, 25, 14, '#8e8878', { name: 'shell', g: 'shell' });
      for (const [x, y, rx, ry, c] of [[24, 40, 6, 4.5, '#a8a090'], [36, 36, 6.5, 4.5, '#7e7a74'], [48, 40, 6, 4.5, '#9c9282'], [30, 48, 6, 4, '#8a908e'], [44, 49, 6.5, 4, '#aaa292'], [56, 47, 4, 3.5, '#8a8272'], [16, 47, 4, 3.5, '#9a9282']]) S.E(x, y, rx, ry, c, { clip: 'shell', g: 'peb' + x, cast: false });
      S.R(11, 51, 50, 4, '#564e42').E(36, 53.5, 25, 2.5, '#564e42');
      S.E(49, 59, 6, 3, sk, { g: 'legF' }).E(24, 59, 6, 3, sk, { g: 'legF' });
      S.E(11, 44, 10, 9, sk, { name: 'head' }).E(15, 48, 5, 4, sk, { g: 'head' });
      S.E(8, 38, 5, 1.6, '#4a5244', X(F, { clip: 'head', line: false }));
      S.eye(7, 43, 2.4, 3.2, '#ffb060').eye(14, 43, 2.8, 3.5, '#ffb060');
      S.C(4, 49, 10, 49.5, 1, '#1a1428', X(F, { flat: true }));
    },
    schattenmotte(S) { // flauschige Motte mit Augenflecken
      const wg = '#4c3c72', wg2 = '#3a2c5a', fz = '#e2d8f2', body = '#6a5a8c', spot = '#c090f0';
      S.E(47, 26, 14, 18, wg, { rot: 0.45, name: 'wR' }).E(17, 26, 14, 18, wg, { rot: -0.45, name: 'wL' });
      S.E(48, 44, 9, 10, wg2, { rot: -0.3, name: 'wR2' }).E(16, 44, 9, 10, wg2, { rot: 0.3, name: 'wL2' });
      for (const [x, y, n] of [[49, 24, 'wR'], [15, 24, 'wL']]) { S.E(x, y, 5.5, 5.5, '#1e1636', { clip: n, line: false, g: n }).E(x, y, 3.5, 3.5, spot, { glow: true, clip: n }); }
      S.E(50, 45, 3, 3, spot, { clip: 'wR2', line: false, alpha: 0.9 }).E(14, 45, 3, 3, spot, { clip: 'wL2', line: false, alpha: 0.9 });
      S.E(32, 46, 7, 11, body, { name: 'body' });
      for (const y of [44, 49, 54]) S.C(26, y, 38, y, 1, '#4a3c66', { clip: 'body', line: false });
      S.C(28, 16, 20, 4, 1.4, '#8a78a8').C(36, 16, 44, 4, 1.4, '#8a78a8');
      S.E(19, 4, 3.5, 2.5, '#b4a4d0', { rot: -0.5 }).E(45, 4, 3.5, 2.5, '#b4a4d0', { rot: 0.5 });
      S.E(32, 36, 12, 4, '#b8acd4', { g: 'head' });
      S.E(32, 25, 10, 9, body, { name: 'head', g: 'head' });
      S.eye(27, 25, 3.6, 4.2, '#b88af0').eye(37, 25, 3.6, 4.2, '#b88af0');
      S.C(31, 31, 33, 31, 1, '#1a1428', X(F, { flat: true }));
    },
    grabfalter(S) { // Falter mit Grabinschriften auf den Flügeln
      const wg = '#2c2644', rim = '#5a5078', ins = '#aaa4c4', eye = '#9a6ae8';
      S.P([[31, 28], [8, 3], [1, 18], [4, 34], [18, 38]], wg, { name: 'wL' }).P([[33, 28], [56, 3], [63, 18], [60, 34], [46, 38]], wg, { name: 'wR' });
      S.P([[31, 34], [12, 40], [8, 52], [18, 58], [28, 46]], wg, { name: 'wL2' }).P([[33, 34], [52, 40], [56, 52], [46, 58], [36, 46]], wg, { name: 'wR2' });
      for (const [n, s] of [['wL', -1], ['wR', 1]]) {
        const cx = 32 + s * 17;
        for (const dy of [0, 5, 10]) S.C(cx - 7, 13 + dy, cx + 6, 13 + dy + s * 0.5, 1, ins, { clip: n, line: false, flat: true });
        S.E(cx + s * 9, 30, 4, 4, eye, { glow: true, clip: n }).E(32 + s * 26, 10, 3, 3, rim, { clip: n, line: false });
        S.C(32 + s * 6, 26, 32 + s * 28, 6, 1, rim, { clip: n, line: false, flat: true });
      }
      S.E(18, 50, 3, 3, ins, { clip: 'wL2', line: false }).E(46, 50, 3, 3, ins, { clip: 'wR2', line: false });
      S.E(32, 42, 4.5, 13, '#4a4262', { name: 'body' });
      S.C(30, 18, 22, 2, 1.2, '#6a6090').C(34, 18, 42, 2, 1.2, '#6a6090');
      S.E(22, 2.5, 2, 2, eye, { glow: true }).E(42, 2.5, 2, 2, eye, { glow: true });
      S.E(32, 23, 8, 7.5, '#5a5078', { name: 'head' });
      S.eye(28.5, 23, 3, 3.8, '#c8a0ff').eye(35.5, 23, 3, 3.8, '#c8a0ff');
    },
    nebelkauz(S) { // runder Käuzling
      const pl = '#9ea4c4', pl2 = '#7a80a4', face = '#dadeee', ft = '#e0b060';
      S.E(32, 40, 18, 18, pl, { name: 'body', g: 'body' });
      S.E(32, 47, 11, 10, '#c4c8dc', X(F, { clip: 'body', line: false }));
      for (const [x, y] of [[27, 44], [35, 46], [31, 51], [38, 52], [25, 50]]) S.C(x - 1.5, y, x + 1.5, y + 1, 1, '#8a90b0', X(F, { clip: 'body', line: false, flat: true }));
      S.E(15, 42, 5, 11, pl2, { rot: 0.15, g: 'wing' }).E(49, 42, 5, 11, pl2, { rot: -0.15, g: 'wing' });
      S.P([[16, 16], [13, 4], [24, 12]], pl2).P([[48, 16], [51, 4], [40, 12]], pl2);
      S.E(32, 25, 17, 13, pl, { name: 'head', g: 'body' });
      S.E(24, 26, 8, 8, face, X(F, { clip: 'head', line: false })).E(40, 26, 8, 8, face, X(F, { clip: 'head', line: false }));
      S.eye(24, 26, 5, 5.4, '#f0b030').eye(40, 26, 5, 5.4, '#f0b030');
      S.P([[30, 31], [34, 31], [32, 36]], '#e0a848', X(F, { flat: false }));
      S.C(27, 58, 27, 60, 3, ft).C(37, 58, 37, 60, 3, ft);
      for (const [x, y] of [[26, 20], [36, 22], [31, 30], [22, 34], [42, 36]]) S.C(x - 2, y, x + 2, y + 1, 1, '#8088aa', X(B, { clip: 'body', flat: true }));
    },
    schleierkauz(S) { // Schleiereule mit herzförmigem Gesicht
      const pl = '#b8a484', veil = '#8e94ae', face = '#f2eae2', ft = '#d8b070';
      S.E(32, 42, 17, 17, pl, { name: 'body', g: 'body' });
      S.E(32, 48, 10, 10, '#eadcc8', X(F, { clip: 'body', line: false }));
      for (const [x, y] of [[28, 44], [36, 46], [32, 52], [27, 51], [37, 53]]) S.E(x, y, 0.8, 0.8, '#8a7458', X(F, { clip: 'body', flat: true }));
      S.P([[14, 22], [8, 40], [12, 56], [22, 48], [20, 28]], veil, { g: 'wing' }).P([[50, 22], [56, 40], [52, 56], [42, 48], [44, 28]], veil, { g: 'wing' });
      S.E(32, 22, 16, 14, pl, { name: 'head', g: 'body' });
      S.P([[32, 16], [22, 10], [16, 16], [17, 28], [32, 38], [47, 28], [48, 16], [42, 10]], face, X(F, { name: 'face', clip: 'head' }));
      S.eye(25, 23, 4, 4.8, null, { dark: '#18121e' }).eye(39, 23, 4, 4.8, null, { dark: '#18121e' });
      S.C(32, 25, 32, 31, 2.2, '#c89a70', X(F, { flat: true }));
      S.C(27, 59, 27, 61, 3, ft).C(37, 59, 37, 61, 3, ft);
      S.E(32, 26, 10, 8, veil, X(B, { clip: 'body', line: false }));
    },
    laternchen(S) { // Glühwürmchen mit Stalllaternen-Hinterleib
      const fr = '#3a3246', glow = '#ffc860', bd = '#3c3448';
      S.E(46, 14, 9, 6, '#c8d4f0', { rot: -0.5, alpha: 0.75, g: 'wg' }).E(20, 13, 9, 6, '#c8d4f0', { rot: 0.5, alpha: 0.75, g: 'wg' });
      S.R(24, 26, 20, 3, fr, { name: 'cap' }).P([[27, 26], [34, 20], [41, 26]], fr, { g: 'cap' });
      S.R(24, 29, 20, 22, glow, { glow: true, name: 'lamp' });
      S.E(34, 40, 6, 8, '#fff4d0', { glow: true, clip: 'lamp' });
      for (const x of [24, 33, 43]) S.R(x, 29, 1.4, 22, fr, { clip: 'lamp', flat: true, line: false });
      S.R(24, 38, 20, 1.4, fr, { clip: 'lamp', flat: true, line: false });
      S.R(22, 51, 24, 3, fr);
      S.C(22, 28, 20, 36, 2.4, bd).C(46, 28, 48, 36, 2.4, bd);
      S.E(34, 17, 9, 7, bd, { name: 'head' });
      S.C(29, 11, 24, 3, 1.2, '#6a6080').C(39, 11, 44, 3, 1.2, '#6a6080');
      S.E(24, 3, 1.8, 1.8, glow, { glow: true }).E(44, 3, 1.8, 1.8, glow, { glow: true });
      S.eye(30, 17, 2.8, 3.4, '#ffd070', { white: 1 }).eye(38, 17, 2.8, 3.4, '#ffd070', { white: 1 });
    },
    totenleuchte(S) { // Friedhofslaterne mit Schleierflügeln
      const fr = '#2e2a40', glow = '#b8fff2', veil = '#d8dcf0';
      S.P([[24, 22], [2, 10], [6, 36], [16, 50], [24, 44]], veil, { alpha: 0.8, g: 'wg' }).P([[40, 22], [62, 10], [58, 36], [48, 50], [40, 44]], veil, { alpha: 0.8, g: 'wg' });
      S.C(8, 16, 22, 30, 1, '#9aa0c4', { alpha: 0.8, flat: true }).C(56, 16, 42, 30, 1, '#9aa0c4', { alpha: 0.8, flat: true });
      S.P([[20, 22], [32, 10], [44, 22]], fr, { name: 'roof' }).E(32, 8, 2.5, 2.5, fr);
      S.R(22, 22, 20, 28, glow, { glow: true, name: 'lamp' });
      S.E(32, 36, 7, 10, '#ffffff', { glow: true, clip: 'lamp' });
      for (const x of [22, 31.3, 40.6]) S.R(x, 22, 1.4, 28, fr, { clip: 'lamp', flat: true, line: false });
      S.P([[20, 50], [44, 50], [40, 55], [24, 55]], fr);
      S.E(32, 58, 3, 2.5, glow, { glow: true });
      S.E(32, 30, 6, 5.5, '#eafffb', X(F, { name: 'head', glow: true }));
      S.eye(29.6, 30, 1.7, 2.5, '#3aa8a0', { dark: '#1a2a3a' }).eye(34.4, 30, 1.7, 2.5, '#3aa8a0', { dark: '#1a2a3a' });
    },
    torfwicht(S) { // Maulwurfs-Wicht, der Verlorenes sammelt
      const fur = '#6e4c36', fur2 = '#56382a', bel = '#c8a888', claw = '#e2d4b8', moss = '#6e9444';
      S.E(33, 44, 20, 16, fur, { name: 'body', g: 'body' });
      S.E(30, 50, 12, 9, bel, X(F, { clip: 'body', line: false }));
      S.E(33, 29, 15, 7, moss, { name: 'moss' });
      for (const x of [22, 28, 36, 43]) S.P([[x - 3, 26], [x, 18 + (x % 7)], [x + 3, 26]], moss, { g: 'moss' });
      S.E(38, 25, 2.2, 2, '#e8a8c8', { flat: false });
      S.eye(24, 37, 3, 3.6, '#a07048', { white: 1 }).eye(35, 37, 3.3, 3.9, '#a07048', { white: 1 });
      S.E(28, 44, 4.5, 3.4, '#f0a0a8', X(F, {}));
      S.C(19, 50, 13, 52, 6, fur2, { g: 'arm' }).C(45, 50, 51, 52, 6, fur2, { g: 'arm' });
      for (const [x, s] of [[11, -1], [53, 1]]) for (const d of [-2, 0, 2]) S.C(x, 52 + d, x + s * 3, 52 + d * 1.3, 1.6, claw);
      S.E(33, 55, 4, 4, '#e8c060', X(F, { name: 'btn' })).E(33, 55, 1.2, 1.2, '#8a6a30', X(F, { clip: 'btn', flat: true }));
      S.E(22, 59, 6, 2.5, fur2).E(44, 59, 6, 2.5, fur2);
      S.E(33, 42, 12, 8, fur2, X(B, { clip: 'body', line: false }));
    },
    hauchling(S) { // Kitz aus Morgendunst
      const fur = '#dcd6f0', fur2 = '#b8b0d8', sp = '#fbf8ff', mist = '#c8c4ea';
      S.E(40, 55, 16, 4, mist, { alpha: 0.55, flat: true, noOutline: true, cast: false });
      S.C(44, 44, 46, 56, 3.6, fur2, { g: 'legB' }).C(36, 45, 37, 56, 3.6, fur2, { g: 'legB' });
      S.E(40, 40, 12, 8, fur, { name: 'body', g: 'body' });
      for (const [x, y] of [[40, 36], [46, 38], [35, 39], [44, 43]]) S.E(x, y, 1.6, 1.3, sp, { clip: 'body', line: false, flat: true });
      S.E(52, 34, 2.5, 3.5, sp, { rot: 0.5 });
      S.C(30, 43, 29, 56, 3.6, fur, { g: 'legF' }).C(34, 44, 34, 56, 3.6, fur, { g: 'legF' });
      S.E(29, 57, 2.2, 1.6, '#8e84b8', { g: 'legF' }).E(34, 57, 2.2, 1.6, '#8e84b8', { g: 'legF' });
      S.C(29, 36, 26, 28, 7, fur, { g: 'neck' });
      S.E(13, 17, 8, 3.6, fur, { rot: 0.5, name: 'earL' }).E(14, 17, 5, 1.8, '#a898d0', { rot: 0.5, clip: 'earL' });
      S.E(35, 14, 8, 3.6, fur, { rot: -0.6, name: 'earR' }).E(34, 14, 5, 1.8, '#a898d0', { rot: -0.6, clip: 'earR' });
      S.E(24, 24, 11, 10, fur, { name: 'head', g: 'head' }).E(15, 28, 6, 5, fur, { g: 'head' });
      S.eye(19, 23, 3, 4, '#9a78e0').eye(28, 23, 3.4, 4.4, '#9a78e0');
      S.E(10.5, 28.5, 1.8, 1.4, '#5a4a7a', X(F, { flat: true }));
      S.E(25, 32, 2.4, 1.4, '#f0c8e0', X(F, { flat: true, alpha: 0.8 }));
      for (const [x, y] of [[26, 18], [30, 22]]) S.E(x, y, 1.4, 1.2, sp, X(B, { clip: 'head', flat: true }));
    },
    raufdachs(S) { // junger Kampfdachs mit Streifengesicht, Fäuste erhoben
      const fur = '#6a6a74', fur2 = '#4c4c56', wh = '#eceaf0', blk = '#24222c', bel = '#a8a0a0';
      S.E(47, 50, 5, 3, fur2, { rot: -0.4 });
      S.E(40, 58, 6, 3, blk, { g: 'feet' }).E(26, 58, 6, 3, blk, { g: 'feet' });
      S.E(34, 46, 15, 13, fur, { name: 'body', g: 'body' });
      S.E(32, 50, 9, 8, bel, X(F, { clip: 'body', line: false }));
      S.C(20, 44, 14, 38, 6, blk, { g: 'armL' }).E(13, 36, 4.2, 4.2, blk, { g: 'armL' });
      S.C(46, 44, 50, 38, 6, blk, { g: 'armR' }).E(51, 36, 4.2, 4.2, blk, { g: 'armR' });
      S.E(18, 12, 4, 4, blk).E(40, 12, 4, 4, blk);
      S.E(29, 25, 15, 12, wh, { name: 'head', g: 'head' });
      S.P([[18, 14], [23, 13], [27, 36], [20, 34]], blk, { clip: 'head', line: false, g: 'head' }).P([[35, 13], [40, 14], [38, 34], [31, 36]], blk, { clip: 'head', line: false, g: 'head' });
      S.eye(23, 25, 2.8, 3.6, '#e05a48', { white: 0.8 }).eye(35, 25, 2.8, 3.6, '#e05a48', { white: 0.8 });
      S.C(19, 20, 26, 22, 1.2, '#eceaf0', X(F, { flat: true, line: false })).C(39, 20, 32, 22, 1.2, '#eceaf0', X(F, { flat: true, line: false }));
      S.E(29, 32, 3, 2.2, blk, X(F, { flat: true }));
      S.C(26, 35, 32, 35, 1, '#8a3a3a', X(F, { flat: true }));
      S.P([[20, 16], [29, 12], [38, 16], [36, 30], [22, 30]], blk, X(B, { clip: 'head', line: false }));
    },
    grimmdachs(S) { // Grabwächter-Dachs mit Erdpanzer auf den Schultern
      const fur = '#5a5a66', fur2 = '#3e3e4a', wh = '#e2e0e8', blk = '#1e1c26', earth = '#8a6a44', claw = '#e8dcc4';
      S.E(44, 58, 8, 3.5, blk, { g: 'feet' }).E(22, 58, 8, 3.5, blk, { g: 'feet' });
      S.E(33, 42, 21, 17, fur, { name: 'body', g: 'body' });
      S.E(30, 47, 12, 11, '#9a9294', X(F, { clip: 'body', line: false }));
      S.E(12, 34, 8, 6, earth, { g: 'padL', rot: -0.4 }).E(54, 34, 8, 6, earth, { g: 'padR', rot: 0.4 });
      for (const [x, y] of [[9, 32], [14, 36], [52, 32], [57, 36]]) S.E(x, y, 2, 1.6, '#6a5236', { clip: x < 30 ? 'padL' : 'padR', line: false });
      S.C(13, 42, 8, 50, 8, blk, { g: 'armL' }).C(53, 42, 58, 50, 8, blk, { g: 'armR' });
      for (const [x, s2] of [[7, -1], [59, 1]]) for (const d of [-2.5, 0, 2.5]) S.C(x + d, 53, x + d + s2 * 0.6, 57, 1.6, claw);
      S.E(20, 10, 4, 4, blk).E(44, 10, 4, 4, blk);
      S.E(32, 22, 15, 12, wh, { name: 'head', g: 'head' });
      S.P([[21, 11], [26, 10], [30, 34], [23, 32]], blk, { clip: 'head', line: false, g: 'head' }).P([[38, 10], [43, 11], [41, 32], [34, 34]], blk, { clip: 'head', line: false, g: 'head' });
      S.eye(26, 22, 2.6, 3.2, '#ffb040', { white: 0.7 }).eye(38, 22, 2.6, 3.2, '#ffb040', { white: 0.7 });
      S.C(21, 17, 29, 20, 1.4, wh, X(F, { flat: true, line: false })).C(43, 17, 35, 20, 1.4, wh, X(F, { flat: true, line: false }));
      S.C(40, 14, 44, 24, 0.9, '#b8a8a8', X(F, { flat: true, clip: 'head' }));
      S.E(32, 29, 3.4, 2.4, blk, X(F, { flat: true }));
      S.P([[22, 13], [32, 9], [42, 13], [40, 28], [24, 28]], blk, X(B, { clip: 'head', line: false }));
    },
    schwammling(S) { // kleiner Pilzgeist mit leuchtenden Sporenpunkten
      const cap = '#9a4a9a', cap2 = '#6e3070', dot = '#f0d8ff', stem = '#ece0cc', gl = '#d8a0ff';
      S.E(25, 59, 5, 2.4, '#c8b8a0', { g: 'feet' }).E(39, 59, 5, 2.4, '#c8b8a0', { g: 'feet' });
      S.E(32, 47, 12, 12, stem, { name: 'stem', g: 'stem' });
      S.E(20, 49, 3, 5, stem, { rot: 0.5, g: 'stem' }).E(44, 49, 3, 5, stem, { rot: -0.5, g: 'stem' });
      S.E(32, 36, 22, 5, '#d8c8b0', { g: 'gill' });
      S.E(32, 27, 23, 14, cap, { name: 'cap', g: 'cap' });
      for (const [x, y, r] of [[22, 22, 3], [35, 17, 3.6], [44, 26, 2.6], [28, 31, 2.2], [14, 30, 2], [50, 33, 1.8]]) S.E(x, y, r, r * 0.85, dot, { clip: 'cap', line: false });
      S.eye(26, 47, 3.4, 4.2, '#b060e0').eye(38, 47, 3.4, 4.2, '#b060e0');
      S.C(30, 54, 34, 54, 1, '#6a4a3a', X(F, { flat: true }));
      for (const [x, y] of [[10, 18], [54, 14], [58, 40], [6, 42]]) S.E(x, y, 1.3, 1.3, gl, { glow: true });
    },
    moderhut(S) { // grosser Moderpilz mit breitem Hut, Wurzeln und Moos
      const cap = '#6e3a6a', dot = '#e4c8f0', stem = '#d8ccb4', root = '#7a5a3a', moss = '#5e8a44', gl = '#c890f0';
      for (const [x0, x1] of [[20, 10], [28, 24], [36, 40], [44, 56]]) S.C(x0, 52, x1, 60, 3, root, { g: 'root' });
      S.E(32, 46, 14, 12, stem, { name: 'stem', g: 'stem' });
      S.E(32, 56, 16, 4, moss, { g: 'moss' });
      S.E(32, 31, 31, 5, '#c8b8a0', { g: 'gill' });
      S.E(32, 21, 31, 14, cap, { name: 'cap', g: 'cap' });
      S.P([[1, 26], [8, 22], [10, 30]], cap, { g: 'cap' }).P([[63, 26], [56, 22], [54, 30]], cap, { g: 'cap' });
      for (const [x, y, r] of [[16, 18, 3.2], [30, 11, 4], [44, 16, 3.4], [54, 24, 2.4], [24, 26, 2.4], [38, 26, 2], [8, 26, 1.8]]) S.E(x, y, r, r * 0.85, dot, { clip: 'cap', line: false });
      S.E(22, 9, 6, 2.5, moss, { clip: 'cap', line: false }).E(46, 8, 5, 2, moss, { clip: 'cap', line: false });
      S.eye(26, 44, 3, 2.6, '#9a50d0', { white: 0.6 }).eye(38, 44, 3, 2.6, '#9a50d0', { white: 0.6 });
      S.C(22.5, 41, 29, 42, 1.2, '#8a7a64', X(F, { flat: true })).C(41.5, 41, 35, 42, 1.2, '#8a7a64', X(F, { flat: true }));
      S.C(29, 51, 35, 51, 1, '#6a4a3a', X(F, { flat: true }));
      for (const [x, y] of [[4, 12], [60, 10], [58, 44], [4, 44], [32, 2]]) S.E(x, y, 1.4, 1.4, gl, { glow: true });
    },
    nebelahn(S) { // Wächterhirsch mit Geweih aus Dunst
      const fur = '#4a5674', fur2 = '#384260', mane = '#9aa4c4', ant = '#dce4f4', gl = '#a8f0ff';
      const tine = (x0, y0, x1, y1) => S.C(x0, y0, x1, y1, 2.2, ant, { g: 'ant', glow: false });
      tine(24, 14, 18, 2); tine(20, 7, 12, 4); tine(18, 2, 20, 0); tine(21, 9, 26, 3);
      tine(34, 14, 42, 2); tine(39, 6, 47, 5); tine(42, 2, 41, 0); tine(38, 8, 33, 2);
      S.C(48, 40, 50, 59, 4.4, fur2, { g: 'legB' }).C(40, 41, 41, 59, 4.4, fur2, { g: 'legB' });
      S.E(44, 36, 15, 10, fur, { name: 'body', g: 'body' });
      S.E(58, 30, 3, 4, mane, { rot: 0.6 });
      S.C(30, 40, 29, 59, 4.4, fur, { g: 'legF' }).C(36, 41, 36, 59, 4.4, fur, { g: 'legF' });
      S.E(29.5, 59.5, 2.6, 1.4, '#232840', { g: 'legF' }).E(36, 59.5, 2.6, 1.4, '#232840', { g: 'legF' });
      S.P([[22, 22], [36, 22], [40, 40], [26, 44]], fur, { name: 'neck', g: 'neck' });
      S.P([[22, 24], [30, 26], [34, 44], [28, 48], [22, 40]], mane, { g: 'neck', name: 'mane' });
      S.E(22, 26, 3, 3, mane, { g: 'neck' }).E(26, 44, 4, 3, mane, { g: 'neck' });
      S.E(21, 11, 6, 3, fur, { rot: -0.5 }).E(38, 11, 6, 3, fur, { rot: 0.5 });
      S.E(29, 19, 8.5, 8, fur, { name: 'head', g: 'head' }).E(25, 26, 5, 5, fur, { g: 'head' });
      S.eye(26.5, 18, 2, 2.6, gl, { dark: '#2a4a68' }).eye(32, 18, 2.2, 2.8, gl, { dark: '#2a4a68' });
      S.E(24, 29.5, 2, 1.4, '#1a1428', X(F, { flat: true }));
      S.E(44, 30, 10, 4, mane, X(B, { clip: 'body', line: false }));
      for (const [x, y] of [[16, 1], [44, 3], [10, 5], [48, 7]]) S.E(x, y, 1.4, 1.4, gl, { glow: true });
    },
    // ================= v15: 15 neue Tier- und Naturgeister =================
    tauhase(S) { // Tauhase: silbriger Hase mit langen Ohren, an deren Spitzen Tautropfen hängen
      const fur = '#c8cee0', fur2 = '#9aa2bc', bel = '#f2f4fa', in_ = '#e8b8c8', dew = '#bfefff';
      S.E(46, 50, 5, 5, fur, { g: 'tail' }).E(47, 49, 3, 3, bel, { flat: true, line: false });
      S.C(40, 50, 44, 58, 5, fur2, { g: 'legB' });
      S.E(34, 46, 13, 11, fur, { name: 'body', g: 'body' });
      S.E(29, 50, 7, 7, bel, X(F, { clip: 'body', line: false }));
      S.C(25, 52, 23, 59, 4, fur, { g: 'legF' }).C(31, 53, 31, 59, 4, fur, { g: 'legF' });
      S.E(22, 59, 3.6, 1.6, bel, { g: 'legF' }).E(31, 59, 3.6, 1.6, bel, { g: 'legF' });
      S.E(26, 13, 4, 12, fur, { rot: -0.2, name: 'earB' }).E(26, 13, 2, 9, in_, { rot: -0.2, clip: 'earB', line: false });
      S.E(18, 14, 4, 12, fur, { rot: -0.45, name: 'earF' }).E(18, 14, 2, 9, in_, { rot: -0.45, clip: 'earF', line: false });
      S.E(13, 3.5, 2.2, 2.8, dew, { glow: true }).E(29, 2, 2, 2.6, dew, { glow: true });
      S.E(22, 31, 11, 10, fur, { name: 'head', g: 'head' });
      S.E(14, 35, 5, 4, bel, X(F, { clip: 'head', line: false }));
      S.eye(17, 29, 2.8, 3.6, '#5a7ab8').eye(25, 29, 3, 3.8, '#5a7ab8');
      S.E(11.5, 34, 1.5, 1.1, '#c87a90', X(F, { flat: true }));
      S.E(24, 35, 2.2, 1.2, '#f0c0d0', X(F, { flat: true, alpha: 0.7 }));
      for (const [x, y] of [[40, 40], [36, 44]]) S.E(x, y, 1.2, 1.2, dew, X(B, { glow: true }));
    },
    funkmaus(S) { // Funkmaus: gelbe Maus mit runden Ohren und Blitz-Schwanz, knisternde Backen
      const fur = '#f0c840', fur2 = '#c89a28', bel = '#fff0c0', in_ = '#f09a70', bolt = '#fff8a0';
      S.P([[44, 50], [52, 44], [49, 42], [58, 34], [55, 32], [62, 24], [52, 33], [55, 35], [46, 42], [49, 44]], fur2, { g: 'tail' });
      S.E(61, 24, 2.4, 2.4, bolt, { glow: true });
      S.E(35, 48, 12, 10, fur, { name: 'body', g: 'body' });
      S.E(31, 51, 7, 6, bel, X(F, { clip: 'body', line: false }));
      S.C(28, 54, 27, 59, 4, fur2, { g: 'legF' }).C(39, 54, 40, 59, 4, fur2, { g: 'legF' });
      S.E(14, 17, 7, 7, fur, { name: 'earL' }).E(14, 17, 4.4, 4.4, in_, { clip: 'earL', line: false });
      S.E(33, 16, 7, 7, fur, { name: 'earR' }).E(33, 16, 4.4, 4.4, in_, { clip: 'earR', line: false });
      S.E(23, 30, 12, 11, fur, { name: 'head', g: 'head' });
      S.E(13, 34, 4, 3.4, bel, X(F, { clip: 'head', line: false }));
      S.eye(18, 28, 2.8, 3.6, '#3a2a1a').eye(27, 28, 3, 3.8, '#3a2a1a');
      S.E(10, 33, 1.4, 1.2, '#3a2a1a', X(F, { flat: true }));
      S.E(28, 35, 3, 2.2, '#f07a50', X(F, { flat: true, glow: true }));
      S.C(4, 30, 8, 31, 0.6, bolt, { glow: true }).C(3, 35, 8, 34, 0.6, bolt, { glow: true });
      S.C(28, 22, 36, 22, 1.2, fur2, X(B, { clip: 'head', line: false }));
    },
    moosigel(S) { // Moosigel: runder Igel, dessen Stacheln ein Moospolster mit kleinen Pilzen sind
      const moss = '#5a8a44', moss2 = '#3e6a34', face = '#b08a64', face2 = '#8a6a48', bel = '#e0c8a0';
      S.E(38, 44, 19, 15, moss, { name: 'back', g: 'body' });
      for (const [x, y] of [[26, 32], [34, 29], [43, 30], [50, 35], [54, 43], [30, 38], [40, 36], [48, 42]]) S.P([[x - 3, y + 3], [x, y - 4], [x + 3, y + 3]], moss2, { g: 'body' });
      S.E(46, 30, 3, 2, '#e8d8c8', { g: 'body' }).C(46, 31, 46, 34, 1, '#e8e0d0');
      S.E(52, 36, 2.2, 1.6, '#e07a5a').C(52, 37, 52, 39, 0.8, '#e8e0d0');
      S.E(22, 46, 11, 10, face, { name: 'head', g: 'head' });
      S.E(22, 51, 7, 5, bel, X(F, { clip: 'head', line: false }));
      S.E(10, 49, 5, 3.6, face, { g: 'head' }).E(6, 48.5, 1.6, 1.4, '#2a1a14', X(F, { flat: true }));
      S.eye(17, 44, 2.4, 3, '#2a1a14').eye(24, 44, 2.6, 3.2, '#2a1a14');
      S.C(26, 57, 26, 60, 3, face2, { g: 'legF' }).C(36, 57, 37, 60, 3, face2, { g: 'legF' });
      S.E(30, 40, 3, 2, '#7aaa5a', X(B, { flat: true }));
    },
    farnigel(S) { // Farnigel: aufgerichteter Igel mit einem Rücken aus eingerollten Farnwedeln, Erdklumpen an den Pranken
      const moss = '#4a7a3a', fern = '#6aa64e', fern2 = '#3a6a2e', face = '#9a7450', bel = '#e0c8a0', earth = '#6a4a30';
      for (const [x, y, r] of [[30, 12, -0.5], [42, 10, 0], [52, 16, 0.5], [58, 28, 0.9], [60, 40, 1.3]]) {
        S.E(x, y, 3.4, 11, fern, { rot: r, name: 'fr' + x, g: 'body' });
        for (let i = -2; i <= 2; i++) S.C(x, y, x + Math.cos(r) * 5 + i, y + Math.sin(r) * 5 + i * 3, 0.8, fern2, { clip: 'fr' + x, flat: true, line: false });
        S.E(x + Math.sin(r) * 9, y - Math.cos(r) * 9, 2.4, 2.4, fern, { g: 'body' });
      }
      S.E(42, 36, 18, 18, moss, { name: 'body', g: 'body' });
      for (const [x, y] of [[36, 24], [46, 22], [54, 30], [56, 40]]) S.P([[x - 3, y + 3], [x, y - 5], [x + 3, y + 3]], fern2, { g: 'body' });
      S.C(40, 52, 41, 59, 6, earth, { g: 'legB' });
      S.E(28, 40, 12, 14, face, { name: 'front', g: 'body' }).E(28, 44, 8, 10, bel, X(F, { clip: 'front', line: false }));
      S.C(30, 52, 29, 59, 6, earth, { g: 'legF' }).E(28, 59, 5, 2, '#4a3222', { g: 'legF' });
      S.C(20, 40, 12, 44, 4.4, face, { g: 'arm' }).E(11, 45, 4.4, 4, earth, { g: 'arm' });
      S.E(22, 24, 10, 9, face, { name: 'head', g: 'head' }).E(12, 27, 5, 4, face, { g: 'head' });
      S.E(8, 26.5, 1.8, 1.5, '#2a1a14', X(F, { flat: true }));
      S.eye(18, 22, 2.4, 3, '#e0b040', { white: 0.6 }).eye(25, 22, 2.6, 3.2, '#e0b040', { white: 0.6 });
      S.C(14, 18, 20, 19, 1, '#5a3a24', X(F, { flat: true, line: false }));
      S.E(42, 32, 10, 8, fern, X(B, { clip: 'body', line: false }));
    },
    gischtkrebs(S) { // Gischtkrebs: Krabbe mit einem Panzer aus Uferstein, Scheren voller Gischt
      const sh = '#c86a4a', sh2 = '#8a4432', rock = '#8a8494', rock2 = '#646070', foam = '#e8f6ff';
      for (let i = 0; i < 3; i++) { S.C(40 + i * 5, 50, 48 + i * 5, 58, 1.8, sh2, { g: 'legB' }); S.C(24 - i * 4, 50, 16 - i * 4, 58, 1.8, sh2, { g: 'legF' }); }
      S.E(32, 44, 20, 11, sh, { name: 'body', g: 'body' });
      S.P([[16, 42], [22, 30], [34, 26], [46, 30], [50, 42], [32, 46]], rock, { name: 'shell', g: 'body' });
      S.C(22, 36, 30, 32, 1, rock2, { clip: 'shell', flat: true, line: false }).C(34, 30, 44, 38, 1, rock2, { clip: 'shell', flat: true, line: false });
      S.E(38, 32, 3, 1.4, '#6a9a5a', { clip: 'shell', flat: true, line: false });
      S.C(14, 44, 8, 36, 3.4, sh, { g: 'armL' }).E(7, 30, 7, 6, sh, { name: 'clawL', g: 'armL' }).P([[1, 28], [6, 30], [2, 33]], '#1a1420', { clip: 'clawL', flat: true });
      S.C(50, 44, 56, 36, 3.4, sh, { g: 'armR' }).E(57, 30, 6, 5, sh, { name: 'clawR', g: 'armR' });
      for (const [x, y] of [[3, 22], [8, 20], [58, 23], [62, 26]]) S.E(x, y, 2, 1.6, foam, { alpha: 0.85 });
      S.C(26, 36, 24, 26, 1.4, sh2).C(34, 36, 36, 26, 1.4, sh2);
      S.eye(24, 24, 3, 3.4, '#1a1420').eye(36, 24, 3.2, 3.6, '#1a1420');
      S.C(27, 48, 37, 48, 0.8, '#3a1a1a', X(F, { flat: true, line: false }));
    },
    glimmfuchs(S) { // Glimmfuchs: kleiner Fuchs mit glimmender Schwanzspitze und violett leuchtenden Augen
      const fur = '#d0703a', fur2 = '#9a4a28', wh = '#f4e8dc', gl = '#ffb050', vio = '#c080ff';
      S.C(44, 50, 56, 40, 7, fur, { g: 'tail', name: 'tail' }).E(58, 34, 6, 7, wh, { g: 'tail' }).E(59, 30, 4, 5, gl, { glow: true, g: 'tail' });
      S.C(42, 50, 44, 59, 3.6, fur2, { g: 'legB' });
      S.E(36, 47, 12, 8, fur, { name: 'body', g: 'body' });
      S.E(30, 50, 6, 5, wh, X(F, { clip: 'body', line: false }));
      S.C(28, 52, 27, 59, 3.6, fur, { g: 'legF' }).C(34, 53, 34, 59, 3.6, fur, { g: 'legF' });
      S.E(27, 59, 2.4, 1.4, '#3a2218').E(34, 59, 2.4, 1.4, '#3a2218');
      S.P([[16, 24], [14, 8], [24, 20]], fur, { name: 'earL' }).P([[17, 21], [16, 12], [21, 19]], '#3a2218', { clip: 'earL', flat: true, line: false });
      S.P([[28, 20], [34, 6], [36, 22]], fur, { name: 'earR' }).P([[30, 19], [34, 10], [34, 20]], '#3a2218', { clip: 'earR', flat: true, line: false });
      S.E(25, 31, 11, 9, fur, { name: 'head', g: 'head' });
      S.P([[8, 34], [20, 30], [24, 40], [14, 38]], wh, { g: 'head' });
      S.E(8, 34.5, 1.6, 1.3, '#1a1420', X(F, { flat: true }));
      S.eye(20, 29, 2.6, 3.2, vio, { dark: '#4a2a7a' }).eye(28, 29, 2.8, 3.4, vio, { dark: '#4a2a7a' });
      S.E(64, 24, 1, 1, gl, { glow: true }).E(61, 22, 0.8, 0.8, gl, { glow: true });
      S.E(38, 43, 8, 3, fur2, X(B, { clip: 'body', line: false }));
    },
    glutfaehe(S) { // Glutfähe: elegante Füchsin mit zwei Flammenschwänzen und einem Seherstein auf der Stirn
      const fur = '#c85a30', fur2 = '#8a3a22', wh = '#f4e4d4', gl = '#ffa040', fl = '#ffe080', vio = '#c080ff';
      for (const [x, y] of [[60, 18], [62, 34]]) { S.C(46, 42, x, y, 6, fur, { g: 'tail' }); S.E(x, y - 3, 5, 8, gl, { glow: true, g: 'tail' }); S.E(x, y - 5, 2.6, 5, fl, { glow: true, g: 'tail' }); }
      S.C(44, 44, 46, 59, 4, fur2, { g: 'legB' }).C(38, 45, 39, 59, 4, fur2, { g: 'legB' });
      S.E(38, 40, 14, 9, fur, { name: 'body', g: 'body' });
      S.E(30, 44, 7, 6, wh, X(F, { clip: 'body', line: false }));
      S.C(28, 44, 27, 59, 4, fur, { g: 'legF' }).C(33, 45, 33, 59, 4, fur, { g: 'legF' });
      S.E(27, 59.5, 2.6, 1.4, '#2a1a14').E(33, 59.5, 2.6, 1.4, '#2a1a14');
      S.C(28, 36, 24, 26, 7, fur, { g: 'neck' }).E(26, 34, 6, 7, wh, X(F, { g: 'neck' }));
      S.P([[16, 16], [13, 0], [24, 12]], fur, { name: 'earL' }).P([[17, 13], [15, 4], [21, 11]], '#2a1a14', { clip: 'earL', flat: true, line: false });
      S.P([[27, 12], [33, -1], [35, 14]], fur, { name: 'earR' });
      S.E(24, 22, 10, 8, fur, { name: 'head', g: 'head' }).P([[5, 25], [18, 20], [22, 30], [12, 30]], wh, { g: 'head' });
      S.E(5, 25.5, 1.6, 1.3, '#1a1420', X(F, { flat: true }));
      S.eye(19, 21, 2.2, 2.8, vio, { dark: '#4a2a7a' }).eye(27, 21, 2.4, 3, vio, { dark: '#4a2a7a' });
      S.P([[22, 13], [24, 10], [26, 13], [24, 16]], vio, { glow: true });
      for (const [x, y] of [[54, 6], [64, 22], [58, 28]]) S.E(x, y, 1, 1, fl, { glow: true });
    },
    tropfsteinmolch(S) { // Tropfsteinmolch: Höhlenmolch mit kleinen Tropfsteinen auf dem Rücken und blassen Traumaugen
      const sk = '#a8a0b8', sk2 = '#7a7290', bel = '#e0d8ea', st = '#d8d4e0', vio = '#b890f0';
      S.C(44, 52, 56, 56, 5, sk, { g: 'tail' }).C(56, 56, 63, 50, 3, sk, { g: 'tail' });
      S.C(42, 52, 46, 59, 3.4, sk2, { g: 'legB' });
      S.E(34, 49, 14, 7, sk, { name: 'body', g: 'body' });
      S.E(30, 53, 9, 3, bel, X(F, { clip: 'body', line: false }));
      for (const [x, h] of [[28, 8], [34, 11], [40, 9], [46, 6]]) S.P([[x - 3, 44], [x, 44 - h], [x + 3, 44]], st, { g: 'body' });
      S.C(26, 53, 22, 59, 3.4, sk, { g: 'legF' }).C(34, 54, 34, 59, 3.4, sk, { g: 'legF' });
      S.E(19, 44, 11, 8, sk, { name: 'head', g: 'head' });
      S.E(14, 48, 7, 2.4, bel, X(F, { clip: 'head', line: false }));
      S.eye(14, 42, 3, 3.2, vio, { dark: '#5a3a8a' }).eye(22, 42, 3.2, 3.4, vio, { dark: '#5a3a8a' });
      S.C(7, 47, 14, 48, 0.8, '#3a3048', X(F, { flat: true, line: false }));
      S.E(28, 37, 1.2, 1.2, vio, { glow: true });
    },
    kristallmolch(S) { // Kristallmolch: grosser Höhlenmolch mit leuchtenden Amethyst-Kristallen, Rückenkamm aus Quarz
      const sk = '#8a809e', sk2 = '#5e5676', bel = '#dcd4ea', cr = '#c8a0ff', cr2 = '#8a5ae0', vio = '#e0c0ff';
      S.C(46, 50, 58, 54, 6, sk, { g: 'tail' }).C(58, 54, 63, 44, 3.6, sk, { g: 'tail' }).P([[60, 44], [63, 34], [64, 46]], cr, { glow: true, g: 'tail' });
      S.C(44, 50, 48, 59, 4.4, sk2, { g: 'legB' });
      S.E(35, 46, 17, 9, sk, { name: 'body', g: 'body' });
      S.E(30, 51, 11, 4, bel, X(F, { clip: 'body', line: false }));
      for (const [x, h, w] of [[24, 12, 3], [31, 18, 4], [38, 22, 4.4], [45, 16, 3.6], [51, 10, 3]]) { S.P([[x - w, 40], [x, 40 - h], [x + w, 40]], cr, { g: 'body', glow: true, name: 'c' + x }); S.P([[x, 40 - h], [x + w, 40], [x, 40]], cr2, { clip: 'c' + x, flat: true, line: false }); }
      S.C(26, 51, 21, 59, 4.4, sk, { g: 'legF' }).C(36, 52, 36, 59, 4.4, sk, { g: 'legF' });
      S.E(21, 59.5, 3, 1.4, '#3a3048').E(36, 59.5, 3, 1.4, '#3a3048');
      S.E(17, 41, 12, 9, sk, { name: 'head', g: 'head' });
      S.E(11, 46, 8, 2.6, bel, X(F, { clip: 'head', line: false }));
      S.P([[16, 32], [19, 25], [22, 33]], cr, { glow: true });
      S.eye(12, 39, 3, 3.4, vio, { dark: '#6a3aaa' }).eye(21, 39, 3.2, 3.6, vio, { dark: '#6a3aaa' });
      S.C(4, 45, 12, 46, 0.8, '#2a2038', X(F, { flat: true, line: false }));
    },
    flatterhauch(S) { // Flatterhauch: runde Fledermaus mit riesigen Ohren und dünnen, fast durchsichtigen Flügeln
      const fur = '#5a4a6a', fur2 = '#3e3250', mem = '#8a7aa8', in_ = '#c8a0b8';
      S.P([[30, 34], [2, 18], [6, 28], [2, 36], [10, 40], [8, 48], [30, 42]], mem, { name: 'wL', g: 'wing', alpha: 0.85 });
      S.P([[36, 34], [62, 18], [58, 28], [62, 36], [54, 40], [56, 48], [36, 42]], mem, { name: 'wR', g: 'wing', alpha: 0.85 });
      for (const [x, y] of [[4, 22], [4, 34], [9, 46]]) S.C(28, 36, x, y, 0.8, fur2, { clip: 'wL', flat: true, line: false });
      for (const [x, y] of [[60, 22], [60, 34], [55, 46]]) S.C(38, 36, x, y, 0.8, fur2, { clip: 'wR', flat: true, line: false });
      S.E(33, 40, 10, 11, fur, { name: 'body', g: 'body' });
      S.E(33, 43, 6, 7, '#8a7a90', X(F, { clip: 'body', line: false }));
      S.P([[22, 26], [18, 6], [30, 22]], fur, { name: 'eL' }).P([[23, 22], [20, 11], [28, 21]], in_, { clip: 'eL', flat: true, line: false });
      S.P([[36, 22], [46, 6], [44, 26]], fur, { name: 'eR' }).P([[38, 21], [45, 11], [42, 23]], in_, { clip: 'eR', flat: true, line: false });
      S.E(33, 29, 10, 8, fur, { name: 'head', g: 'head' });
      S.eye(28, 28, 2.8, 3.2, '#f0d060').eye(37, 28, 2.8, 3.2, '#f0d060');
      S.P([[31, 34], [32, 36.4], [33, 34]], '#fff', X(F, { flat: true }));
      S.C(29, 50, 29, 55, 1.6, fur2).C(37, 50, 37, 55, 1.6, fur2);
    },
    blitzreiher(S) { // Blitzreiher: schlanker Reiher auf Stelzenbeinen, der Schopf ein Zickzackblitz
      const fe = '#8ab0d8', fe2 = '#5a7aa8', wh = '#e8f0f8', bk = '#f0c840', bolt = '#fff4a0';
      S.C(38, 44, 40, 60, 1.4, '#c8a040', { g: 'legB' }).C(34, 44, 32, 60, 1.4, '#d8b050', { g: 'legF' });
      S.C(32, 60, 28, 61, 1, '#d8b050').C(40, 60, 44, 61, 1, '#c8a040');
      S.P([[30, 36], [52, 30], [62, 40], [44, 48]], fe2, { g: 'wing', name: 'tailw' });
      S.E(38, 38, 12, 8, fe, { name: 'body', g: 'body', rot: -0.2 });
      S.E(34, 42, 7, 4, wh, X(F, { clip: 'body', line: false }));
      S.C(28, 34, 22, 20, 3, fe, { g: 'neck' }).C(22, 20, 24, 12, 3, wh, { g: 'neck' });
      S.E(24, 11, 5.4, 4.4, fe, { name: 'head', g: 'head' });
      S.P([[20, 10], [2, 13], [20, 13]], bk, { g: 'head' });
      S.P([[26, 8], [32, 2], [30, 6], [38, 0], [34, 7], [28, 11]], bolt, { glow: true });
      S.eye(22, 10, 1.6, 1.8, '#d04030', { white: 0.6 });
      for (const [x, y] of [[44, 38], [50, 36]]) S.C(x, y, x + 6, y + 4, 0.8, bolt, X(B, { glow: true }));
      S.E(6, 20, 1, 1, bolt, { glow: true }).E(10, 24, 0.8, 0.8, bolt, { glow: true });
    },
    sumpfnatter(S) { // Sumpfnatter: aufgerichtete Natter, grün mit violetten Giftbändern, Tropfen am Zahn
      const sk = '#5a8a4a', sk2 = '#3a6a34', bel = '#d8e0a0', band = '#8a4ab0', drip = '#c060ff';
      S.E(38, 54, 18, 6, sk, { name: 'coil', g: 'body' });
      for (const x of [26, 34, 42, 50]) S.R(x, 49, 3, 10, band, { clip: 'coil', flat: true, line: false });
      S.C(52, 54, 62, 50, 3, sk, { g: 'tail' });
      S.C(30, 52, 26, 36, 7, sk, { name: 'neck', g: 'neck' }).C(26, 36, 26, 24, 6, sk, { g: 'neck' });
      S.C(24, 50, 22, 36, 3, bel, X(F, { g: 'neck', line: false }));
      for (const y of [44, 36]) S.R(24, y, 8, 3, band, { clip: 'neck', flat: true, line: false });
      S.E(22, 20, 10, 7, sk, { name: 'head', g: 'head' });
      S.P([[12, 18], [22, 14], [30, 18]], sk2, { clip: 'head', flat: true, line: false });
      S.eye(17, 18, 2.4, 2.8, '#f0d040', { dark: '#2a1a0a' }).eye(25, 18, 2.4, 2.8, '#f0d040', { dark: '#2a1a0a' });
      S.C(12, 24, 20, 25, 0.8, '#2a1a14', X(F, { flat: true, line: false }));
      S.P([[14, 24], [15, 27], [16, 24]], '#fff', X(F, { flat: true }));
      S.E(15, 29.5, 1.1, 1.5, drip, { glow: true });
      S.C(8, 22, 3, 21, 0.6, '#c84050').C(3, 21, 1, 19, 0.5, '#c84050').C(3, 21, 1, 23, 0.5, '#c84050');
    },
    grubenkaefer(S) { // Grubenkäfer: stämmiger Käfer mit Steinpanzer und einem glimmenden Grubenlampen-Horn
      const sh = '#6a5a4a', sh2 = '#4a3e34', st = '#8a8490', lamp = '#ffd070';
      for (let i = 0; i < 3; i++) { S.C(28 + i * 8, 50, 22 + i * 10, 59, 2, '#2a2220', { g: 'legs' }); }
      S.E(36, 44, 18, 13, st, { name: 'shell', g: 'body' });
      S.C(36, 32, 36, 57, 1, sh2, { clip: 'shell', flat: true, line: false });
      for (const [x, y] of [[28, 40], [44, 38], [40, 50], [30, 50]]) S.E(x, y, 3, 2, '#9a94a0', { clip: 'shell', flat: true, line: false });
      S.E(18, 46, 9, 8, sh, { name: 'head', g: 'head' });
      S.C(16, 40, 10, 28, 2.6, sh2, { g: 'horn' }).E(9, 26, 4, 4, lamp, { glow: true, g: 'horn' }).E(9, 26, 2, 2, '#fff8d0', { glow: true });
      S.eye(13, 46, 2.2, 2.6, '#f0a040', { white: 0.4 }).eye(20, 45, 2.4, 2.8, '#f0a040', { white: 0.4 });
      S.C(8, 52, 4, 55, 1.4, sh2).C(12, 53, 10, 57, 1.4, sh2);
    },
    keilerling(S) { // Keilerling: gestreiftes Frischling-Ferkel mit kleinen Hauern und entschlossenem Blick
      const fur = '#8a6444', fur2 = '#5e4230', str = '#d8b888', sn = '#e0a090';
      S.C(46, 46, 52, 42, 1.4, fur2, { g: 'tail' });
      S.C(42, 52, 43, 59, 4, fur2, { g: 'legB' });
      S.E(36, 46, 14, 10, fur, { name: 'body', g: 'body' });
      for (const y of [40, 45, 50]) S.C(26, y, 48, y - 1, 1.1, str, { clip: 'body', flat: true, line: false });
      S.C(28, 52, 27, 59, 4, fur, { g: 'legF' }).C(34, 53, 34, 59, 4, fur, { g: 'legF' });
      S.E(27, 59.5, 2.4, 1.2, '#2a1a14').E(34, 59.5, 2.4, 1.2, '#2a1a14');
      S.P([[20, 30], [18, 20], [26, 27]], fur2).P([[28, 27], [32, 18], [34, 29]], fur2);
      S.E(22, 38, 11, 9, fur, { name: 'head', g: 'head' });
      S.E(11, 41, 5, 4.4, sn, { g: 'head' }).E(9.5, 41, 1, 1.4, '#6a3a30', X(F, { flat: true })).E(12.5, 41, 1, 1.4, '#6a3a30', X(F, { flat: true }));
      S.P([[13, 45], [11, 40], [15, 44]], '#f4ecd8');
      S.eye(18, 35, 2.4, 3, '#2a1a14', { white: 0.7 }).eye(25, 35, 2.6, 3.2, '#2a1a14', { white: 0.7 });
      S.C(15, 31, 21, 32, 1, fur2, X(F, { flat: true, line: false }));
    },
    moorkeiler(S) { // Moorkeiler: mächtiger Keiler mit Borstenkamm, grossen Hauern und einer Rüstung aus getrocknetem Torf
      const fur = '#5a4232', fur2 = '#3a2a20', mud = '#6a5a3a', mud2 = '#4a3e28', tusk = '#f0e6cc';
      S.C(52, 40, 58, 36, 1.6, fur2, { g: 'tail' });
      S.C(46, 48, 48, 59, 5.4, fur2, { g: 'legB' });
      S.E(38, 40, 18, 14, fur, { name: 'body', g: 'body' });
      S.P([[26, 30], [40, 24], [54, 30], [52, 44], [30, 44]], mud, { clip: 'body', line: false, name: 'armor' });
      for (const [x, y] of [[32, 32], [42, 30], [48, 38], [36, 40]]) S.E(x, y, 3, 2, mud2, { clip: 'armor', flat: true, line: false });
      for (let i = 0; i < 7; i++) S.P([[22 + i * 5, 28 - (i < 4 ? i : 7 - i)], [24 + i * 5, 18 - (i < 4 ? i * 1.5 : (7 - i) * 1.5)], [27 + i * 5, 28 - (i < 4 ? i : 7 - i)]], fur2, { g: 'mane' });
      S.C(28, 48, 27, 59, 5.4, fur, { g: 'legF' }).C(36, 50, 36, 59, 5.4, fur, { g: 'legF' });
      S.E(27, 59.5, 3, 1.4, '#1a1410').E(36, 59.5, 3, 1.4, '#1a1410');
      S.E(19, 38, 13, 11, fur, { name: 'head', g: 'head' });
      S.E(6, 42, 5.4, 5, '#b07a60', { g: 'head' }).E(4.5, 42, 1.1, 1.6, '#3a1a14', X(F, { flat: true })).E(7.5, 42, 1.1, 1.6, '#3a1a14', X(F, { flat: true }));
      S.P([[10, 47], [2, 34], [7, 38], [13, 45]], tusk).P([[16, 47], [12, 36], [15, 38], [19, 46]], tusk);
      S.eye(15, 34, 2.4, 2.6, '#e04030', { white: 0.5 }).eye(22, 33, 2.6, 2.8, '#e04030', { white: 0.5 });
      S.C(11, 30, 19, 31, 1.4, fur2, X(F, { flat: true, line: false }));
    },
    // ================= v15: seltene Geister (Schimmer, eigener Stinger) =================
    mondluchs(S) { // Mondluchs: silbrig-violettes Luchskätzchen mit Sternglanz in den Ohrpinseln, Mondsichel auf der Stirn
      const fur = '#b8b0dc', fur2 = '#8a80b8', wh = '#f4f0ff', gl = '#fff4b0', eye = '#8ad8ff';
      S.C(44, 52, 52, 46, 4, fur, { g: 'tail' }).E(53, 45, 3, 3, fur2, { g: 'tail' });
      S.C(42, 52, 44, 59, 4, fur2, { g: 'legB' });
      S.E(35, 48, 12, 9, fur, { name: 'body', g: 'body' });
      for (const [x, y] of [[38, 44], [44, 48], [32, 45]]) S.E(x, y, 1.4, 1.2, fur2, { clip: 'body', flat: true, line: false });
      S.E(30, 51, 6, 6, wh, X(F, { clip: 'body', line: false }));
      S.C(28, 53, 27, 59, 4, fur, { g: 'legF' }).C(35, 54, 35, 59, 4, fur, { g: 'legF' });
      S.P([[14, 26], [13, 10], [23, 22]], fur, { name: 'eL' }).C(13, 10, 12, 4, 1, '#3a3050').E(12, 3.5, 1.6, 1.6, gl, { glow: true });
      S.P([[28, 22], [33, 7], [36, 24]], fur, { name: 'eR' }).C(33, 7, 34, 1, 1, '#3a3050').E(34, 1, 1.6, 1.6, gl, { glow: true });
      S.E(24, 32, 12, 10, fur, { name: 'head', g: 'head' });
      S.E(14, 38, 6, 5, wh, { g: 'head' }).E(33, 38, 5, 5, wh, { g: 'head' });
      S.E(24, 23, 3, 3, gl, { glow: true }).E(25.4, 22.2, 2.4, 2.4, fur, { flat: true, line: false });
      S.eye(19, 31, 3, 3.8, eye, { dark: '#2a4a8a' }).eye(28, 31, 3.2, 4, eye, { dark: '#2a4a8a' });
      S.E(14, 36.5, 1.4, 1.1, '#6a4a7a', X(F, { flat: true }));
      for (const [x, y] of [[4, 18], [40, 14], [8, 44]]) S.E(x, y, 1, 1, gl, { glow: true });
    },
    sternenluchs(S) { // Sternenluchs: majestätischer Luchs, dessen Fell ein Sternbild trägt; Mähne aus knisterndem Himmelslicht
      const fur = '#5a5aa0', fur2 = '#3a3a7a', mane = '#a8c8ff', wh = '#e8ecff', st = '#fff8c0', eye = '#fff0a0';
      S.C(48, 44, 60, 34, 5, fur, { g: 'tail' }).E(61, 31, 4, 4, fur2, { g: 'tail' }).E(61, 31, 2, 2, st, { glow: true });
      S.C(48, 44, 50, 59, 5, fur2, { g: 'legB' }).C(42, 45, 42, 59, 5, fur2, { g: 'legB' });
      S.E(42, 40, 16, 11, fur, { name: 'body', g: 'body' });
      const stars = [[36, 36], [42, 34], [48, 37], [52, 42], [44, 44]];
      for (let i = 0; i < stars.length - 1; i++) S.C(stars[i][0], stars[i][1], stars[i + 1][0], stars[i + 1][1], 0.5, '#c8d8ff', { clip: 'body', flat: true, line: false, alpha: 0.7 });
      for (const [x, y] of stars) S.E(x, y, 1.4, 1.4, st, { glow: true, clip: 'body' });
      S.C(30, 46, 29, 59, 5, fur, { g: 'legF' }).C(37, 47, 37, 59, 5, fur, { g: 'legF' });
      S.E(29, 59.5, 3, 1.4, '#1a1a3a').E(37, 59.5, 3, 1.4, '#1a1a3a');
      S.P([[18, 22], [36, 16], [44, 30], [38, 46], [24, 44], [14, 34]], mane, { name: 'mane', g: 'neck', glow: true });
      for (const [x, y] of [[12, 30], [16, 42], [40, 18], [46, 34]]) S.P([[x - 3, y], [x + 1, y - 5], [x + 1, y - 1], [x + 4, y - 4]], mane, { glow: true });
      S.P([[16, 16], [14, -1], [24, 12]], fur, { name: 'eL' }).E(14, 0, 2, 2, st, { glow: true });
      S.P([[28, 12], [34, -1], [36, 16]], fur, { name: 'eR' }).E(34, 0, 2, 2, st, { glow: true });
      S.E(25, 24, 11, 9, fur, { name: 'head', g: 'head' });
      S.E(16, 30, 6, 4, wh, { g: 'head' });
      S.P([[23, 14], [25, 11], [27, 14], [25, 17]], st, { glow: true });
      S.eye(20, 23, 2.6, 3.2, eye, { dark: '#8a6a20' }).eye(29, 23, 2.8, 3.4, eye, { dark: '#8a6a20' });
      S.E(13, 29, 1.4, 1.1, '#1a1a3a', X(F, { flat: true }));
      for (const [x, y] of [[4, 8], [54, 10], [60, 50], [6, 50]]) S.E(x, y, 1.1, 1.1, st, { glow: true });
    },
    tiefenkalb(S) { // Tiefenkalb: schwebendes Walkalb aus Nebel und Tiefsee-Blau, mit leuchtenden Punkten wie Plankton
      const sk = '#4a7ab0', sk2 = '#2e5488', bel = '#c8e0f4', gl = '#a8f0ff', mist = '#c8e0ff';
      S.E(34, 58, 18, 3, mist, { alpha: 0.4, flat: true, noOutline: true, cast: false });
      S.P([[50, 34], [62, 24], [60, 34], [63, 44], [52, 40]], sk2, { g: 'tail' });
      S.E(32, 36, 22, 14, sk, { name: 'body', g: 'body' });
      S.E(28, 42, 16, 7, bel, X(F, { clip: 'body', line: false }));
      for (let i = 0; i < 4; i++) S.C(16 + i * 6, 40, 18 + i * 6, 48, 0.7, '#9ac0e0', X(F, { clip: 'body', flat: true, line: false }));
      S.P([[30, 44], [22, 56], [36, 48]], sk2, { g: 'fin' });
      for (const [x, y] of [[36, 28], [42, 32], [30, 26], [46, 38], [24, 30]]) S.E(x, y, 1.3, 1.3, gl, { glow: true, clip: 'body' });
      S.eye(15, 34, 3, 3.6, '#1a2a4a', { white: 0.9 });
      S.C(9, 40, 17, 42, 0.9, '#1a2a4a', X(F, { flat: true, line: false }));
      S.E(30, 20, 2, 3, mist, { alpha: 0.8 }).E(32, 15, 2.4, 3, mist, { alpha: 0.6 }).E(29, 10, 2.8, 2.6, mist, { alpha: 0.4 });
    },
    nebelwal(S) { // Nebelwal: gewaltiger Himmelswal, der durch den Nebel schwimmt; Leuchtbänder, Seepocken-Krone, Nebelschleppe
      const sk = '#3a5a8a', sk2 = '#24406a', bel = '#b8d0ec', gl = '#bff4ff', mist = '#d8e8ff', crown = '#e8e0d0';
      S.E(34, 60, 26, 3, mist, { alpha: 0.35, flat: true, noOutline: true, cast: false });
      for (const [x, y, r] of [[58, 50, 6], [62, 56, 4], [52, 56, 5]]) S.E(x, y, r, r * 0.7, mist, { alpha: 0.5, flat: true, noOutline: true, cast: false });
      S.P([[54, 28], [64, 12], [62, 28], [64, 42], [54, 38]], sk2, { g: 'tail' });
      S.E(30, 32, 28, 17, sk, { name: 'body', g: 'body' });
      S.E(24, 40, 22, 8, bel, X(F, { clip: 'body', line: false }));
      for (let i = 0; i < 6; i++) S.C(8 + i * 6, 38, 10 + i * 6, 48, 0.8, '#90b0d8', X(F, { clip: 'body', flat: true, line: false }));
      S.C(20, 24, 50, 28, 1.3, gl, { clip: 'body', glow: true, flat: true, line: false }).C(24, 30, 52, 34, 1, gl, { clip: 'body', glow: true, flat: true, line: false });
      S.P([[26, 42], [12, 58], [34, 48]], sk2, { g: 'fin' }).C(18, 50, 28, 46, 0.8, gl, { glow: true });
      for (const [x, y] of [[18, 16], [24, 14], [30, 14], [36, 16]]) S.P([[x - 2.4, y + 3], [x, y - 3], [x + 2.4, y + 3]], crown, { g: 'crown' });
      S.eye(10, 30, 3, 3.4, gl, { dark: '#1a3a6a' });
      S.C(3, 38, 14, 40, 1, '#14203a', X(F, { flat: true, line: false }));
      S.E(26, 8, 2.4, 3, mist, { alpha: 0.8 }).E(28, 3, 3, 2.6, mist, { alpha: 0.5 });
      for (const [x, y] of [[4, 12], [48, 8], [60, 24], [2, 50]]) S.E(x, y, 1.2, 1.2, gl, { glow: true });
    },
    funkenkueken(S) { // Funkenküken: flauschiges Küken mit einem Schopf aus springenden Funken, glimmendes Gefieder
      const fe = '#f0a040', fe2 = '#c86a28', bel = '#ffe0a0', gl = '#ffe070', vio = '#c890ff';
      S.E(34, 46, 14, 13, fe, { name: 'body', g: 'body' });
      S.E(31, 50, 8, 8, bel, X(F, { clip: 'body', line: false }));
      S.P([[42, 44], [52, 36], [50, 48]], fe2, { g: 'wing' });
      S.C(28, 57, 27, 61, 1.4, '#d87a30').C(36, 57, 37, 61, 1.4, '#d87a30');
      S.E(26, 28, 11, 10, fe, { name: 'head', g: 'head' });
      S.P([[16, 29], [9, 31], [16, 33]], '#f0d040', { g: 'head' });
      S.eye(21, 27, 2.6, 3.2, vio, { dark: '#4a2a7a' }).eye(29, 27, 2.8, 3.4, vio, { dark: '#4a2a7a' });
      S.E(26, 33, 2.4, 1.3, '#ff9a8a', X(F, { flat: true, alpha: 0.7 }));
      for (const [x, y, r] of [[24, 14, 3], [30, 12, 3.4], [35, 16, 2.6], [20, 10, 2], [32, 6, 1.8]]) S.E(x, y, r, r * 1.3, gl, { glow: true });
      for (const [x, y] of [[12, 16], [44, 20], [48, 30]]) S.E(x, y, 1, 1, gl, { glow: true });
    },
    aschephoenix(S) { // Aschephönix: stolzer Phönix aus Glut und Asche, violett glühende Schwingen, Flammenschweif, Seherkrone
      const fe = '#d85a30', fe2 = '#8a2a20', ash = '#5a4a5a', gl = '#ffb040', fl = '#fff0a0', vio = '#b070ff';
      S.P([[36, 30], [62, 2], [60, 14], [64, 18], [58, 28], [62, 34], [46, 40]], vio, { name: 'wB', g: 'wing', glow: true });
      for (const [x, y] of [[60, 8], [62, 20], [60, 32]]) S.C(40, 32, x, y, 1, '#e0c0ff', { clip: 'wB', flat: true, line: false });
      S.C(38, 46, 52, 60, 4, gl, { g: 'tail', glow: true }).C(40, 48, 60, 56, 3, fe, { g: 'tail' }).E(54, 61, 4, 2, fl, { glow: true }).E(61, 56, 3, 2, gl, { glow: true });
      S.E(34, 38, 12, 12, fe, { name: 'body', g: 'body' });
      S.E(30, 42, 7, 8, '#ffc080', X(F, { clip: 'body', line: false }));
      S.P([[30, 34], [6, 10], [10, 22], [2, 26], [14, 32], [8, 40], [30, 42]], vio, { name: 'wF', g: 'wing', glow: true });
      for (const [x, y] of [[8, 14], [4, 26], [9, 38]]) S.C(28, 36, x, y, 1, '#e0c0ff', { clip: 'wF', flat: true, line: false });
      S.E(18, 26, 3, 2.4, ash, { alpha: 0.6 });
      S.C(30, 50, 28, 59, 1.6, '#3a2a2a').C(36, 50, 37, 59, 1.6, '#3a2a2a');
      S.C(32, 28, 30, 20, 4.4, fe, { g: 'neck' });
      S.E(29, 17, 7, 6, fe, { name: 'head', g: 'head' });
      S.P([[23, 17], [15, 20], [23, 20]], '#f0c040');
      for (const [x, y] of [[26, 11], [30, 8], [34, 11]]) S.P([[x - 1.6, y + 2], [x, y - 5], [x + 1.6, y + 2]], fl, { glow: true });
      S.eye(27, 16, 2, 2.4, vio, { dark: '#3a1a6a', white: 0.6 });
      for (const [x, y] of [[12, 4], [44, 6], [4, 50], [50, 46]]) S.E(x, y, 1.1, 1.1, gl, { glow: true });
    },
    farnkitz(S) { // Farnkitz: Rehkitz mit Farnohren und einem Sprössling zwischen den Ohren, Tupfen wie Tautropfen
      const fur = '#a0784a', fur2 = '#7a5634', sp = '#f0e4c8', fern = '#6aa64e', gl = '#d8ff90';
      S.C(44, 44, 46, 58, 3, fur2, { g: 'legB' }).C(38, 45, 38, 58, 3, fur2, { g: 'legB' });
      S.E(41, 40, 11, 7, fur, { name: 'body', g: 'body' });
      for (const [x, y] of [[40, 36], [46, 38], [36, 39], [44, 43]]) S.E(x, y, 1.5, 1.2, sp, { clip: 'body', flat: true, line: false });
      S.C(31, 43, 30, 58, 3, fur, { g: 'legF' }).C(35, 44, 35, 58, 3, fur, { g: 'legF' });
      S.E(30, 58.6, 2, 1.3, '#3a2a1a').E(35, 58.6, 2, 1.3, '#3a2a1a');
      S.C(30, 36, 27, 28, 6, fur, { g: 'neck' });
      S.E(14, 17, 7, 3, fern, { rot: 0.5, name: 'eL' }).C(9, 14, 19, 20, 0.6, '#3a6a2e', { clip: 'eL', flat: true, line: false });
      S.E(35, 15, 7, 3, fern, { rot: -0.6, name: 'eR' });
      S.C(25, 16, 25, 8, 1, '#5a8a3a').E(22, 7, 3, 1.6, fern, { rot: -0.4 }).E(28, 6, 3, 1.6, fern, { rot: 0.4 }).E(25, 5, 1.2, 1.2, gl, { glow: true });
      S.E(25, 24, 10, 9, fur, { name: 'head', g: 'head' }).E(16, 28, 5, 4.4, fur, { g: 'head' });
      S.eye(20, 23, 2.8, 3.8, '#3a2a1a', { white: 0.8 }).eye(28, 23, 3, 4, '#3a2a1a', { white: 0.8 });
      S.E(11.5, 28.5, 1.7, 1.3, '#2a1a14', X(F, { flat: true }));
    },
    hainhirsch(S) { // Hainhirsch: junger Hirsch, dessen Geweih ein Zweiggeflecht mit frischen Blättern ist
      const fur = '#8a6440', fur2 = '#634628', leaf = '#6aaa4e', leaf2 = '#4a8a3a', gl = '#d8ff90', br = '#6a4a2a';
      const br_ = (a, b, c, d) => S.C(a, b, c, d, 1.8, br, { g: 'ant' });
      br_(24, 14, 16, 2); br_(19, 7, 10, 5); br_(34, 14, 42, 2); br_(39, 7, 48, 5);
      for (const [x, y] of [[16, 2], [10, 5], [42, 2], [48, 5], [13, 8], [45, 8], [20, 4], [38, 4]]) S.E(x, y, 2.6, 1.6, (x + y) % 2 ? leaf : leaf2, { rot: 0.4 });
      S.E(16, 1, 1, 1, gl, { glow: true }).E(47, 3, 1, 1, gl, { glow: true });
      S.C(47, 42, 49, 59, 3.8, fur2, { g: 'legB' }).C(40, 43, 40, 59, 3.8, fur2, { g: 'legB' });
      S.E(43, 38, 14, 9, fur, { name: 'body', g: 'body' });
      S.E(52, 44, 5, 4, leaf2, { clip: 'body', flat: true, line: false });
      S.C(31, 42, 30, 59, 3.8, fur, { g: 'legF' }).C(36, 43, 36, 59, 3.8, fur, { g: 'legF' });
      S.E(30, 59.5, 2.4, 1.3, '#2a1a10').E(36, 59.5, 2.4, 1.3, '#2a1a10');
      S.P([[23, 22], [35, 22], [38, 40], [27, 42]], fur, { g: 'neck' });
      S.P([[26, 30], [32, 32], [34, 42], [28, 40]], '#e8dcc4', X(F, { g: 'neck' }));
      S.E(20, 12, 5, 2.6, fur, { rot: -0.5 }).E(38, 12, 5, 2.6, fur, { rot: 0.5 });
      S.E(29, 19, 8, 7.4, fur, { name: 'head', g: 'head' }).E(24, 26, 5, 4.4, fur, { g: 'head' });
      S.eye(26, 18, 2, 2.6, '#6ad040', { dark: '#2a4a1a' }).eye(32, 18, 2.2, 2.8, '#6ad040', { dark: '#2a4a1a' });
      S.E(22.5, 28.5, 1.8, 1.3, '#1a1410', X(F, { flat: true }));
    },
    kronenhirsch(S) { // Kronenhirsch: uralter Waldhüter – ein Geweih wie eine Baumkrone voller Blüten und Lichter, Mantel aus Moos
      const fur = '#6a5a3a', fur2 = '#4a3e28', moss = '#4a7a3a', leaf = '#6ab04e', leaf2 = '#3e8a44', fl = '#f8d8f0', gl = '#e8ffa0', br = '#8a6a44';
      S.E(30, 8, 30, 10, leaf2, { alpha: 0.9, g: 'crown', name: 'crown' });
      for (const [x, y] of [[8, 8], [16, 3], [26, 1], [36, 1], [46, 3], [54, 8], [12, 12], [50, 12]]) S.E(x, y, 5, 3.6, (x % 3) ? leaf : leaf2, { g: 'crown' });
      const br_ = (a, b, c, d, w = 2) => S.C(a, b, c, d, w, br, { g: 'ant' });
      br_(26, 16, 18, 4); br_(20, 8, 8, 8); br_(22, 10, 26, 1); br_(34, 16, 42, 4); br_(40, 8, 54, 8); br_(38, 10, 36, 1);
      for (const [x, y] of [[10, 6], [22, 2], [40, 2], [52, 6], [30, 4], [16, 10], [46, 10]]) S.E(x, y, 1.8, 1.8, fl, { glow: true });
      for (const [x, y] of [[4, 14], [58, 14], [30, -1], [18, 0], [44, 0]]) S.E(x, y, 1.2, 1.2, gl, { glow: true });
      S.C(48, 42, 50, 59, 4.6, fur2, { g: 'legB' }).C(41, 43, 41, 59, 4.6, fur2, { g: 'legB' });
      S.E(45, 38, 16, 10, fur, { name: 'body', g: 'body' });
      S.P([[30, 30], [50, 28], [60, 36], [56, 44], [34, 42]], moss, { clip: 'body', line: false, name: 'mantle' });
      for (const [x, y] of [[40, 32], [50, 34], [46, 40]]) S.E(x, y, 1.8, 1.8, fl, { clip: 'mantle', glow: true });
      S.C(32, 42, 31, 59, 4.6, fur, { g: 'legF' }).C(38, 43, 38, 59, 4.6, fur, { g: 'legF' });
      S.E(31, 59.5, 2.8, 1.4, '#1a140c').E(38, 59.5, 2.8, 1.4, '#1a140c');
      S.P([[23, 22], [36, 22], [40, 40], [27, 43]], fur, { g: 'neck' });
      S.P([[22, 26], [30, 28], [36, 44], [26, 46], [20, 36]], moss, { g: 'neck' });
      S.E(29, 19, 8.6, 8, fur, { name: 'head', g: 'head' }).E(24, 26, 5.4, 5, fur, { g: 'head' });
      S.eye(26, 18, 2.2, 2.8, gl, { dark: '#3a5a1a' }).eye(32, 18, 2.4, 3, gl, { dark: '#3a5a1a' });
      S.E(22.5, 29, 1.9, 1.4, '#1a1410', X(F, { flat: true }));
      S.P([[27, 12], [29, 9], [31, 12], [29, 15]], gl, { glow: true });
    },
    // ================= v15: Team Quantum & Legende =================
    synx(S) { // Synx: sprechender Sphinx-Kater von Team Quantum – Steinflügel, gestreifter Kopfschmuck, Rätselaugen
      const fur = '#c8a86a', fur2 = '#8a7040', st = '#8a8898', st2 = '#5e5c6e', band = '#3a2e5a', gold = '#e8c050', eye = '#c080ff';
      S.P([[36, 34], [58, 6], [62, 16], [60, 28], [50, 38]], st, { name: 'wing', g: 'wing' });
      for (const [x, y] of [[58, 10], [61, 20], [58, 30]]) S.C(40, 34, x, y, 1.2, st2, { clip: 'wing', flat: true, line: false });
      S.C(46, 52, 58, 50, 3, fur, { g: 'tail' }).C(58, 50, 60, 42, 2.6, fur, { g: 'tail' }).E(60, 41, 2.4, 2.4, band, { g: 'tail' });
      S.C(44, 50, 46, 59, 4, fur2, { g: 'legB' });
      S.E(38, 46, 15, 10, fur, { name: 'body', g: 'body' });
      S.E(31, 50, 7, 6, '#ecdcb4', X(F, { clip: 'body', line: false }));
      S.C(26, 52, 20, 59, 4, fur, { g: 'legF' }).C(33, 53, 30, 59, 4, fur, { g: 'legF' });
      S.E(18, 59.5, 4, 1.6, fur2).E(28, 59.5, 4, 1.6, fur2);
      S.P([[12, 24], [22, 12], [34, 12], [42, 26], [38, 40], [30, 30], [18, 30], [10, 40]], band, { name: 'nemes', g: 'head' });
      for (const y of [18, 24, 30, 36]) S.R(8, y, 36, 1.6, gold, { clip: 'nemes', flat: true, line: false });
      S.P([[16, 16], [14, 4], [22, 12]], fur).P([[30, 12], [36, 2], [36, 16]], fur);
      S.E(25, 25, 10, 9, fur, { name: 'head', g: 'head' });
      S.E(18, 30, 5, 3.6, '#ecdcb4', X(F, { clip: 'head', line: false }));
      S.eye(21, 23, 2.8, 3, eye, { dark: '#3a1a6a' }).eye(29, 23, 3, 3.2, eye, { dark: '#3a1a6a' });
      S.C(17, 20, 24, 21.6, 1.1, '#2a1e3a', X(F, { flat: true, line: false })).C(26, 21.4, 33, 20, 1.1, '#2a1e3a', X(F, { flat: true, line: false }));
      S.E(16, 29, 1.2, 1, '#6a3a4a', X(F, { flat: true }));
      S.C(16, 33, 21, 32.4, 0.8, '#2a1e3a', X(F, { flat: true, line: false }));
      S.E(25, 14, 2, 2, eye, { glow: true });
      S.E(24, 8, 1, 1, eye, { glow: true }).E(4, 30, 1, 1, eye, { glow: true });
    },
    fyrlumen(S) { // Fyrlumen: legendärer Leuchtturmgeist – Vogelleib aus Licht, Prismenschwingen, Linsen-Halo, Nebelschleppe
      const body = '#f4f0e0', body2 = '#c8d8f0', gold = '#ffe8a0', pr1 = '#bfe8ff', pr2 = '#e8c8ff', mist = '#e0ecff', eye = '#6ac8ff';
      for (let i = 0; i < 16; i++) { const a = i / 16 * Math.PI * 2; S.E(32 + Math.cos(a) * 13, 12 + Math.sin(a) * 12, i % 2 ? 0.9 : 1.4, i % 2 ? 0.9 : 1.4, i % 4 ? gold : '#ffffff', { glow: true, flat: true, line: false }); }   // Linsen-Halo
      for (const [x, y, r] of [[48, 54, 6], [56, 58, 5], [62, 52, 4], [40, 60, 4]]) S.E(x, y, r, r * 0.6, mist, { alpha: 0.5, flat: true, noOutline: true, cast: false });
      S.C(38, 44, 54, 56, 5, body2, { g: 'tail' }).C(42, 46, 62, 50, 3.4, pr1, { g: 'tail', glow: true }).C(40, 46, 58, 60, 2.6, pr2, { g: 'tail', glow: true });
      S.P([[34, 30], [64, 4], [62, 14], [64, 22], [56, 30], [60, 36], [44, 40]], pr1, { name: 'wB', g: 'wing', glow: true });
      S.P([[40, 30], [64, 14], [58, 28]], pr2, { clip: 'wB', flat: true, line: false });
      S.E(32, 38, 11, 11, body, { name: 'body', g: 'body', glow: true });
      S.E(29, 42, 6, 6, '#fffcf0', X(F, { clip: 'body', line: false }));
      S.P([[30, 32], [0, 4], [4, 16], [0, 24], [10, 30], [4, 38], [28, 42]], pr1, { name: 'wF', g: 'wing', glow: true });
      S.P([[26, 32], [0, 14], [8, 28]], pr2, { clip: 'wF', flat: true, line: false });
      for (const [x, y] of [[2, 8], [2, 22], [6, 36]]) S.C(28, 36, x, y, 0.8, '#ffffff', { clip: 'wF', flat: true, line: false });
      S.C(32, 30, 32, 20, 4, body, { g: 'neck' });
      S.E(32, 15, 7, 6, body, { name: 'head', g: 'head', glow: true });
      S.P([[26, 15], [18, 17], [26, 18]], gold, { glow: true });
      for (const [x, y] of [[30, 8], [33, 6], [36, 8]]) S.P([[x - 1.2, y + 2], [x, y - 5], [x + 1.2, y + 2]], gold, { glow: true });
      S.eye(29, 14, 2, 2.4, eye, { dark: '#1a5a9a', white: 0.7 });
      for (const [x, y] of [[8, 46], [58, 4], [14, 2], [52, 44], [4, 56]]) S.E(x, y, 1.2, 1.2, '#ffffff', { glow: true });
    },
  };
  // Rendern in beliebiger Grösse (gecacht); back: Rückansicht (gespiegelt, näher, unten angeschnitten)
  const cache = {};
  function render(sp, N, back, breathe, blink, bold) {
    const key = sp + N + (back ? 'b' : 'f') + (breathe ? 'x' : '') + (blink ? 'z' : '') + (bold ? 'o' : ''); if (cache[key]) return cache[key];
    const S = new A.Shape(); S.back = !!back; S.blink = !!blink; DEF[sp](S, !!back);
    const k = N / 64;
    return cache[key] = A.raster(S, N, N, k, { mirror: !!back, oy: back ? 7 : 0, breathe: breathe ? 1.035 : 1, ground: 60, bold, glows: true });
  }
  // Oberflächenstruktur auf feinen Pixeln: Fell (Strichlagen), Federn (Schuppenbögen), Moos (Flecken), Stein (Risse), Haut (Tupfen)
  const TEX = { flackerling: 'dots', glutwurm: 'dots', seelendrache: 'dots', pfuetzling: 'fuzz', nebelente: 'feather', mondschwan: 'feather', blattling: null, hainfee: 'moss', feenlinde: 'moss', kleeling: null, moorranke: null, raufdachs: 'fur', grimmdachs: 'fur', nebelahn: 'fur', schattenmotte: 'fuzz', grabfalter: 'fuzz',
    nebelkauz: 'feather', schleierkauz: 'feather', moorlurch: 'dots', moorunke: 'dots', kieselgeist: 'stone', menhirgeist: 'stone', torfwicht: 'moss',
    schwammling: 'dots', moderhut: 'moss', hauchling: 'wisp', laternchen: null, totenleuchte: null,
    tauhase: 'fur', funkmaus: 'fuzz', moosigel: 'moss', farnigel: 'moss', gischtkrebs: 'stone', glimmfuchs: 'fur', glutfaehe: 'fur', tropfsteinmolch: 'dots', kristallmolch: 'dots',
    flatterhauch: 'fuzz', blitzreiher: 'feather', sumpfnatter: 'dots', grubenkaefer: 'stone', keilerling: 'fur', moorkeiler: 'fur', mondluchs: 'fur', sternenluchs: 'fur', tiefenkalb: 'dots',
    nebelwal: 'dots', funkenkueken: 'fuzz', aschephoenix: 'feather', farnkitz: 'fur', hainhirsch: 'fur', kronenhirsch: 'fur', synx: 'fur', fyrlumen: 'wisp' };
  const hh = (x, y) => { let v = (x * 374761393 + y * 668265263) | 0; v = Math.imul(v ^ (v >>> 13), 1274126177); return ((v ^ (v >>> 16)) >>> 0) / 4294967296; };
  function texture(c, kind) {
    if (!kind) return;
    const g = c.getContext('2d', { willReadFrequently: true }), w = c.width, h = c.height, img = g.getImageData(0, 0, w, h), d = img.data;
    const solid = (x, y) => x >= 0 && y >= 0 && x < w && y < h && d[(y * w + x) * 4 + 3] > 250;
    for (let y = 1; y < h - 1; y++) for (let x = 1; x < w - 1; x++) {
      const i = (y * w + x) * 4; if (d[i + 3] < 250) continue;
      const lum = (d[i] * 3 + d[i + 1] * 5 + d[i + 2] * 2) / 10; if (lum < 48 || lum > 200) continue;       // Kontur und Leuchtflächen bleiben
      if (!solid(x - 2, y) || !solid(x + 2, y) || !solid(x, y - 2) || !solid(x, y + 2)) continue;           // Rand frei lassen
      let f = 1, tint = null;
      switch (kind) {
        case 'fur': if ((x + y * 2) % 7 === 0 && hh(x >> 2, y >> 1) < 0.55) f = 0.84; else if ((x + y * 2) % 7 === 1 && hh(x >> 2, y >> 1) < 0.55) f = 1.1; break;
        case 'fuzz': if (hh(x, y) < 0.1) f = 1.14; else if (hh(x + 7, y) < 0.08) f = 0.86; break;
        case 'feather': { const row = y >> 2, u = ((x + (row % 2) * 3) % 6) - 2.5, v = y % 4; if (v === Math.min(3, Math.round(u * u / 2.2))) f = 0.84; else if (v === 0 && Math.abs(u) < 1) f = 1.08; break; }
        case 'dots': if (hh(x >> 1, y >> 1) < 0.07) f = 0.8; else if (hh((x >> 1) + 9, y >> 1) < 0.05) f = 1.15; break;
        case 'stone': if (hh(x >> 1, y) < 0.025 || (hh(x, y >> 1) < 0.02)) f = 0.72; else if (hh(x, y) < 0.06) f = 1.08; if (hh(x >> 2, y >> 2) < 0.12 && !solid(x, y - 6)) tint = [96, 132, 76]; break;
        case 'moss': if (hh(x >> 1, y >> 1) < 0.12) tint = [92, 128, 70]; else if (hh(x, y) < 0.05) f = 0.82; break;
        case 'wisp': if (((x - y * 0.5) | 0) % 9 === 0 && hh(x >> 3, y >> 2) < 0.5) f = 1.12; break;
      }
      if (tint) { d[i] = d[i] * 0.55 + tint[0] * 0.45; d[i + 1] = d[i + 1] * 0.55 + tint[1] * 0.45; d[i + 2] = d[i + 2] * 0.55 + tint[2] * 0.45; }
      if (f !== 1) { d[i] = Math.min(255, d[i] * f); d[i + 1] = Math.min(255, d[i + 1] * f); d[i + 2] = Math.min(255, d[i + 2] * f); }
    }
    g.putImageData(img, 0, 0);
  }
  // hochaufgelöst (2× fein gerastert, kräftige Kontur, Oberflächenstruktur), logische Grösse n
  function renderHi(sp, n, back, breathe, blink) {
    const c = render(sp, n * 2, back, breathe, blink, true);
    if (!c.s) { texture(c, TEX[sp]); c.s = 2; c.lw = n; c.lh = n; if (c.glows) c.glows = c.glows.map(([x, y, r, col]) => [x / 2, y / 2, r / 2, col]); }
    return c;
  }
  G.Creatures = { DEF, render, renderHi };
})(window.G);
