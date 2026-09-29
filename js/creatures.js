'use strict';
// Eldenghost – die 15 Geister im Comic-Pixelstil (eigene Entwürfe). Designraum 64×64, Boden y≈60, Vorderansicht blickt nach links.
// In der Rückansicht (S.back) entfallen Gesicht/Bauch (face:true), dafür erscheinen Rückenmerkmale (backOnly:true).
(function (G) {
  const A = G.Art;
  const F = { face: true }, B = { backOnly: true };
  const X = (o, p) => Object.assign({}, o, p);
  const DEF = {
    flackerling(S) { // Glutfüchslein, Schweifspitze glimmt
      const fur = '#c8643a', fur2 = '#9a4630', cream = '#f4e2c8', glow = '#ffc868';
      S.E(47, 38, 8, 14, fur, { rot: 0.55, name: 'tail' });
      S.E(52, 25, 7, 8, glow, { glow: true, rot: 0.4, clip: 'tail' }).E(53, 22, 6.5, 7, glow, { glow: true, rot: 0.4 });
      S.C(42, 50, 44, 58, 6, fur2, { g: 'legB' }).C(36, 51, 37, 58, 6, fur2, { g: 'legB' });
      S.E(38, 46, 13, 10, fur, { name: 'body', g: 'body' });
      S.E(33, 50, 7, 6, cream, X(F, { clip: 'body', line: false }));
      S.C(26, 49, 25, 58, 6, fur, { g: 'legF' }).C(32, 50, 32, 58, 6, fur, { g: 'legF' });
      S.E(25, 58, 4, 2.2, cream, { g: 'legF' }).E(32, 58.5, 4, 2.2, cream, { g: 'legF' });
      S.P([[13, 24], [9, 4], [23, 15]], fur, { name: 'earL' }).P([[13, 20], [11, 9], [19, 16]], '#6a2a24', { clip: 'earL', line: false });
      S.P([[28, 15], [36, 2], [39, 20]], fur, { name: 'earR' }).P([[31, 15], [36, 6], [37, 18]], '#6a2a24', { clip: 'earR', line: false });
      S.E(25, 30, 15, 12.5, fur, { name: 'head', g: 'head' });
      S.E(18, 37, 8, 5, cream, X(F, { clip: 'head', line: false, g: 'head' })).E(30, 37, 7, 5, cream, X(F, { clip: 'head', line: false, g: 'head' }));
      S.E(38, 18, 3, 2.4, glow, { glow: true }).E(58, 12, 1.6, 1.6, glow, { glow: true, noOutline: false });
      S.eye(18.5, 29, 3.2, 4.4, '#f0a848').eye(30, 29, 3.8, 4.8, '#f0a848');
      S.E(12.5, 35, 1.8, 1.4, '#1a1428', X(F, { flat: true, line: false }));
      S.C(15, 38.5, 18, 39.5, 1, '#1a1428', X(F, { flat: true, line: false }));
      S.E(34, 22, 5, 3, '#6a2a24', X(B, { clip: 'head', line: false }));
    },
    irrfackel(S) { // Füchsin mit drei Glutschweifen, Psycho-Blick
      const fur = '#b0503a', fur2 = '#843828', cream = '#f0dcc4', fl = '#ffb050';
      for (const [x, y, r] of [[50, 22, 0.1], [55, 32, 0.75], [46, 16, -0.35]]) {
        S.E(x, y + 8, 6, 12, fur, { rot: r, name: 'tl' + x, g: 'tails' });
        S.E(x + Math.sin(r) * 7, y - 2, 5.5, 7.5, fl, { glow: true, rot: r, g: 'tails' });
      }
      S.C(45, 44, 47, 59, 5, fur2, { g: 'legB' }).C(39, 45, 40, 59, 5, fur2, { g: 'legB' });
      S.E(39, 41, 13, 9, fur, { name: 'body', g: 'body' });
      S.E(30, 42, 7, 7, cream, X(F, { clip: 'body', line: false }));
      S.C(27, 44, 26, 59, 5, fur, { g: 'legF' }).C(33, 45, 33, 59, 5, fur, { g: 'legF' });
      S.E(26, 59, 3.5, 1.8, cream, { g: 'legF' }).E(33, 59, 3.5, 1.8, cream, { g: 'legF' });
      S.P([[16, 20], [12, 1], [25, 13]], fur, { name: 'earL' }).P([[16, 16], [14, 6], [21, 13]], '#5a2222', { clip: 'earL', line: false });
      S.P([[29, 12], [37, 0], [39, 17]], fur, { name: 'earR' }).P([[32, 12], [36, 4], [37, 15]], '#5a2222', { clip: 'earR', line: false });
      S.E(26, 25, 13, 11, fur, { name: 'head', g: 'head' });
      S.P([[9, 29], [17, 25], [20, 34]], fur, { g: 'head' });
      S.E(18, 32, 7, 4, cream, X(F, { clip: 'head', line: false, g: 'head' })).E(30, 32, 6, 4, cream, X(F, { clip: 'head', line: false, g: 'head' }));
      S.E(29, 13, 2.2, 3, fl, { glow: true });
      S.eye(20, 24, 2.8, 3.8, '#f48ce0').eye(30.5, 24, 3.3, 4.2, '#f48ce0');
      S.E(10, 29.5, 1.6, 1.3, '#1a1428', X(F, { flat: true }));
      S.E(34, 18, 5, 3, '#5a2222', X(B, { clip: 'head', line: false }));
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
    }
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
  const TEX = { flackerling: 'fur', irrfackel: 'fur', raufdachs: 'fur', grimmdachs: 'fur', nebelahn: 'fur', schattenmotte: 'fuzz', grabfalter: 'fuzz',
    nebelkauz: 'feather', schleierkauz: 'feather', moorlurch: 'dots', moorunke: 'dots', kieselgeist: 'stone', menhirgeist: 'stone', torfwicht: 'moss',
    schwammling: 'dots', moderhut: 'moss', hauchling: 'wisp', laternchen: null, totenleuchte: null };
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
