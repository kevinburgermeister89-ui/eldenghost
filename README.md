# Eldenghost – Prototyp v0.4 (Prolog «Das erloschene Licht» + Nebengeschichte «Das Licht im Moor»)

Ein düster-gemütliches Geister-Sammelspiel im Stil der alten Game-Boy-Rollenspiele.
Reines HTML5 Canvas + Vanilla JS, kein Build-Schritt. Mobile-first (Hochformat), später per Capacitor als App verpackbar.

## Starten
- Doppelklick auf `index.html` (funktioniert auch über file://), oder
- `python3 -m http.server 8080` in diesem Ordner, dann http://localhost:8080

## Steuerung
| Aktion | Tastatur | Touch |
|---|---|---|
| Bewegen / Auswahl | Pfeiltasten / WASD | Steuerkreuz (Wischen möglich) |
| A (sprechen, bestätigen) | Leertaste / Z / E | A (oder aufs Textfeld tippen) |
| B (zurück, Entwicklung abbrechen) | Esc / X / Backspace | B |
| START = Menü | Enter / M (oder B in der Oberwelt) | START |
| SELECT = Ton an/aus | Shift | SELECT |

Auf Touch-Geräten sieht die Steuerung aus wie ein Game Boy: Bildschirm im dunklen Gehäuse (mit Power-LED und Schriftzug),
Steuerkreuz links, A/B diagonal rechts (B links unterhalb von A), START/SELECT mittig darunter. Tasten zeigen einen
Gedrückt-Zustand und geben leichtes haptisches Feedback (nativ über Capacitor Haptics, im Web über `navigator.vibrate`).

**Bewegungsgefühl:** Die Spielfigur gleitet pixelgenau mit konstanter Geschwindigkeit (0,18 s pro Feld, Delta-Zeit) von Feld
zu Feld; das Raster bleibt die Spiellogik. Gehaltene Richtungen und kurz vor Schrittende gedrückte Richtungen werden
gepuffert und ohne Pause verkettet. Schaut die Figur schon in die gedrückte Richtung, beginnt der Schritt noch im selben
Ereignis (Sofortstart). Eine neue Richtung kurz antippen dreht nur auf der Stelle; ab 30 ms Halten läuft die Figur los.
4-Phasen-Laufzyklus, Kamera folgt weich (exponentiell) ohne Pixelzittern.

Das Touch-Steuerkreuz funktioniert wie ein Analogstick: Ein sichtbarer Daumen-Knopf folgt dem Finger (begrenzt auf
46 px Radius) und federt beim Loslassen zur Mitte zurück. Die Richtung ergibt sich aus dem Winkel vom Mittelpunkt
(4 Sektoren à 90°), mit 12 px Totzone in der Mitte; nur beim Achsenwechsel mitten im Wischen gibt es 10° Hysterese.
Die Trefferfläche reicht 28 px über das sichtbare Kreuz hinaus, und einmal gedrückt gilt die Richtung auch weit
ausserhalb des Kreuzes weiter (Zeiger-Capture). Geprüft mit `tests/test_dpad.py` (echte Touch-Ereignisse, 80 Positionen,
Diagonalen, Totzone, Wischen, Knopf-Begrenzung, Sofortstart); `tests/test_game.py` startet ihn automatisch mit.

## Hauptgeschichte: Prolog «Das erloschene Licht» (Flag `story` 0–8)
Das nächste Ziel steht immer oben im START-Menü («Ziel») und erscheint als Hinweis, sobald es sich ändert.
0. **Aufwachen im Elternhaus** (Mutter und Vater am Tisch). Ohne Geist lässt Ilse dich nicht in den Nebel (Süden und Ostweg gesperrt).
1. **Ilse** auf dem Dorfplatz erzählt vom Nebel über Moor und Meer und von den verlorenen Geistern, die Licht suchen.
2. **Starterwahl in der Welt:** drei Laternensteine hinter Ilse mit Flackerling (Feuer), Moorlurch (Wasser) und Schwammling (Gift).
   Ansprechen zeigt den Geist gross, Typ, Beschreibung und Ilses Einschätzung; bestätigen mit «Ja» (mit «Nein» abbrechbar).
   Danach übergibt Ilse **5 Seelenfänger** und erklärt das Fangen.
   **Dorfführung** (nur neue Spielstände, `flags.tour` 0 → 2): Ilse fragt «Kennst du dich im Dorf schon aus?» – «Zeig es mir»
   oder «Ich kenne mich aus». Sie geht voraus (Wegsuche), die Spielfigur folgt ihrer Spur, ein «!» markiert den nächsten Ort:
   Mondkirche (Schwester Alwine, Heilen **kostenlos**, Ort des Wiedererwachens) → Branns Schmiede → Mathis' Mühle →
   Eingang zum Nebelgras (Training) → Kameraschwenk auf den Küstenpfad zu Hafen und Leuchtturm. B bricht jederzeit ab.
   Alte Spielstände (ohne `tour`-Schlüssel) überspringen die Führung; wird sie unterbrochen, trägt Ilse ein «!» und bietet sie erneut an.
3. **Fang-Übung** im Nebelgras südlich: häufigere Begegnung, kleiner Geist (Lv ≤ 3), Ilse flüstert Tipps, Fangchance mind. 80 %.
   Erst danach steht **Fenn** am Wegweiser (Dorf, 13/15). Er lauert nicht auf: Ansprechen → er rät, zuerst im Nebelgras
   zu trainieren (etwa bis Lv 7), und fragt «Willst du gegen mich kämpfen?» – mit «Nein» bleibt der Kampf offen (freiwillig).
4. **Auftrag:** Der Leuchtturm an der Küste ist aus. Ostweg an den Gräbern vorbei → **Nebelküste** (kurzer Weg mitten durch eine Nebelbank).
5. **Leuchtturm** (Turm mit Wärterhäuschen, Lampenraum mit grosser Stufenlinse): Lampe kalt, Wärter fehlt.
6. **Wärter Onno** schläft unter seinem Baum neben dem Turm – mit A wecken. Er zündet die Lampe an (Lichteffekt, drehender
   Strahl über dem Meer) und rät dir, dich vor der grossen Reise von deinen Eltern zu verabschieden.
7. **Abschied** zu Hause: Mutter und Vater (warm, etwas wehmütig), Tee für unterwegs und **Vaters Kompass**; ein Nebelhorn ruft.
8. **Hafen:** Die «Nebelschwalbe» läuft ein und legt am Steg an (Kameraschwenk), **Kapitänin Wenke** lädt dich ein.
   Ziel: «An Bord der «Nebelschwalbe» gehen – Fortsetzung folgt!» (Ende des Prologs).

Einheitlicher Name: Das Fangobjekt heisst **Seelenfänger** (ID `laterne`), die bessere Variante **Mondglas-Fänger** (ID `mondlaterne`).
Alte Spielstände mit Geist überspringen Einführung und Fang-Übung (Ziel: Leuchtturm) und erhalten 5 Seelenfänger, falls sie keine mehr haben.

## Nebengeschichte «Das Licht im Moor» (bisheriges Kapitel 1)
- Karten: Dorf Eldenghost (mit Wassermühle am Teich und Schmiede am Ostweg), Nebelküste (Leuchtturm, Hafen), Innenräume (dein Haus, Heddas Stube, Odas Laden,
  Jorins Haus, Jorins Torfhütte, Die Mühle, Branns Schmiede, Lampenraum), Tiefes Moor
  (Schilfrand, Torfstich, Kapelle, Engstelle, Nebelsee, Ahnenhügel). Türen/Wege wechseln die Karte.
- Begegnungen im Nebel: pro Schritt 5–6,5 % (Nebelgras 5,5 %, Schilfrand 5 %, Torfstich 6 %, Kapelle 6,5 %), dazu nach jedem
  Kampf, jeder Flucht und jedem Fang eine Schonfrist von 5 Nebelschritten ohne Begegnung – im Schnitt etwa alle 20–25 Schritte.
- Begegnungszonen sind niedrige, treibende Nebelbänke (zwei Schichten, max. ca. 50 % Deckkraft, blasse Geistergestalten),
  mit klarem Laternenkreis um die Spielfigur und hellerem Rand, damit Zonen von aussen erkennbar sind.
- Nebenquest «Das Licht im Moor» um Jorin (Flag `q1` 0–7, startet mit dem Zettel an Jorins Tür; Ilse erwähnt ihn nach dem Leuchtturm-Auftrag), NPCs Ilse, Hedda, Oda, Wido, Jorin, Schmied Brann, Müller Mathis; Beschwörer Fenn, Selma, Kaspar
  (keine Flucht, kein Fangen, EP ×1.5, Belohnungen). Fenn (Dorf, erst nach der Fang-Übung) und Selma (Moor-Eingang, gibt
  den Steg erst nach dem Kampf frei) kämpfen nur, wenn du sie ansprichst und zusagst, und geben vorher einen Trainingstipp;
  nur Kaspar tief im Moor fordert per Sichtlinie («!») heraus; Wächter Nebelahn (Phasen, Glocke, Marens Laterne).
- 19 Geister mit Entwicklungen (Szene, mit B abbrechbar), AP je Attacke («Letzter Hauch» als Notfall), Status «klamm» und «verirrt»,
  Gegenstände (Seelenfänger, Tees, Wacholderrauch, Klarblick-Tropfen, Nachtkerze) im Kampf und über die Tasche.
- Seelenarchiv (Truhe zu Hause), Bett zu Hause = volle Erholung, entzündete Laternen im Moor = Rückkehrpunkt.
- Spielstände v1–v3 werden automatisch auf v4 migriert (Geister- und Attacken-IDs bleiben gleich; wer auf einer jetzt
  bebauten Kachel stand, landet auf dem Dorfplatz). v4: Geister unter Lv 8 bekommen ihre Attacken aus der neuen Lernliste
  (nur typenlos); ab Lv 8 bleiben bekannte Typ-Attacken erhalten.
- **Schmiede** (Brann): glühende Esse mit Funkenflug aus dem Kamin, warmes Licht, Amboss vor der Tür, Hammerschläge
  (je nach Abstand lauter). Brann schmiedet Laternenrahmen aus Raseneisen aus dem Moor, kannte Jorin und Maren, schenkt
  2 Seelenfänger und tauscht danach **3 Seelenfänger gegen 1 Mondglas-Fänger**.
- **Mühle** (Mathis): Wassermühle am Dorfteich mit animiertem Wasserrad im Mühlgraben (Spritzer, Knarren, Plätschern).
  Mathis schenkt Moorminze und einen starken Tee und mahlt danach **1 Moorminze zu 1 Kräutertee**.
- Geister sind natürliche Tiere und Naturgeister (Fuchs-Irrlicht, Moorfrosch, Kieselschildkröte, Mooseule, Glühwürmchen,
  Nebelhirsch …) mit Vorder- und Rückansicht; Entwicklungen sind klar verwandt. Im Kampf atmen sie leise, Flieger schweben.
  Übersicht: `python3 tools/sprite_sheet.py` → `screenshots/32_geister_uebersicht.png`.
- Wasser (Dorfteich, Nebelsee, Gräben im Moor): organische Uferlinien (Rauschen über dem Kachelfeld), Schlamm-/Sandsaum,
  Schilf, Ufersteine, Seerosen, Tiefenverlauf zur Mitte, Schimmer-Wellen, Mond- und Laternenspiegelungen, Dunst über
  dem Nebelsee. Kollision bleibt kachelgenau (`~` = Wasser).
- Vorschau-Modus `index.html?demo=battle`: Kampf-Endlosschleife mit neuen Geistern, ohne Spielstand zu verändern.

## Elemente & Typentabelle
8 Elemente: **Feuer, Wasser, Elektro, Stein, Psycho, Boden, Gift, Kampf**. Doppeltypen sind möglich, die Faktoren
multiplizieren sich (z. B. Feuer gegen Gift/Psycho = 4×). Gleicher Typ wie der Angreifer: ×1,5. Die Tabelle steht auch
in der Geisterchronik (Menü), dort mit einer Zeile «Neutral».

**Neutral (typenlos):** Rempler, Hauch, Kratzer (je 40), Biss, Kopfnuss (je 55, 95 %), dazu die Statusattacken Heuler
(Angriff des Gegners −1), Starren (Verteidigung des Gegners −1) und Härten (eigene Verteidigung +1); «Letzter Hauch» ist
ebenfalls typenlos. Neutral wirkt immer 1× gegen jeden Typ und bekommt keinen Typbonus (kein Geist hat den Typ Neutral).
**Unter Lv 8 kennen alle Geister nur typenlose Attacken** – Starter, Wildgeister (Nebelgras Lv 2–6, Schilfrand ab Lv 7) und
Beschwörer. Die erste eigene Typ-Attacke kommt mit Lv 8 (Hauchling: Wehmut mit 8, Seufzer mit 9). Im Kampf: schlichter
Treffer (kurzer Vorstoss, helle Funken, kleiner Ring, dumpfer Schlag).

| Angriff ↓ / Ziel → | Feu | Was | Ele | Ste | Psy | Bod | Gif | Kam |
|---|---|---|---|---|---|---|---|---|
| **Feuer**   | ½ | ½ |   | ½ | 2 |   | 2 |   |
| **Wasser**  | 2 | ½ |   | 2 |   | 2 |   |   |
| **Elektro** |   | 2 | ½ | ½ | 2 | 0 |   |   |
| **Stein**   | 2 |   | 2 | ½ |   | ½ |   | ½ |
| **Psycho**  |   |   |   |   | ½ |   | 2 | 2 |
| **Boden**   | 2 |   | 2 | 2 |   |   | 2 | ½ |
| **Gift**    |   | 2 |   | ½ |   | ½ | ½ | 2 |
| **Kampf**   |   |   | 2 | 2 | ½ |   | ½ |   |

Leer = 1×. Jeder Typ trifft 2–4 Typen sehr wirksam und hat 1–3 Schwächen (Boden ist offensiv stark, hat aber wenige
Vertreter und schwächere Attacken).

**Starter-Dreieck:** Flackerling (Feuer), Moorlurch (Wasser), Schwammling (Gift) – Feuer schlägt Gift, Gift schlägt Wasser,
Wasser schlägt Feuer – das Dreieck greift ab Lv 8, wenn die Typ-Attacken kommen. Alle drei haben vergleichbare Basiswerte
(182–186) und entwickeln sich mit Lv 14. Kieselgeist ist kein Starter mehr, bleibt aber im Nebelgras und Torfstich fangbar.

| Starter | Lv 1 | Lv 6 | Lv 8 (erste Typ-Attacke) | danach |
|---|---|---|---|---|
| Flackerling | Kratzer, Heuler | Biss | Irrfeuer (Feuer) | Blendblitz 10, Glutschein 12, Irrweg 13 |
| Moorlurch | Rempler, Starren | Biss | Wasserstrahl (Wasser) | Sumpfsog 10, Moorkälte 12, Grabesruf 13 |
| Schwammling | Rempler, Härten | Kopfnuss | Giftstaub (Gift) | Sporenwolke 10, Giftbiss 11, Erdklumpen 12, Moorkälte 13 |

Fenn (erster Beschwörer) passt seinen zweiten Geist an deinen Starter an: Laternchen Lv 5 plus Lv 6 Moorlurch
(gegen Flackerling), Raufdachs (gegen Moorlurch) bzw. Nebelkauz (gegen Schwammling); Kieselgeist-Spielstände treffen einen
Flackerling. Alte Spielstände behalten alle Geister; die Starter-Linie wird aus dem Team abgeleitet.
Frühe Balance (Simulation `/tmp/sim3.js`, ein Starter allein, ohne Gegenstände, Gegner-KI wie im Spiel): gegen Fenn mit
Lv 7 (zwei Level Training) Flackerling 79 %, Moorlurch 74 %, Schwammling 80 % Siege (Lv 6: ca. 2–21 %, Lv 8: 100 %);
Starter Lv 5 gegen Nebelgras Lv 3–6: 70–76 %.

| Geist | Typ | Geist | Typ |
|---|---|---|---|
| Flackerling → Irrfackel | Feuer → Feuer/Psycho | Laternchen → Totenleuchte | Elektro → Elektro/Psycho |
| Moorlurch → Moorunke | Wasser → Wasser/Gift | Torfwicht | Boden |
| Kieselgeist → Menhirgeist | Stein → Stein/Boden | Hauchling | Psycho |
| Schattenmotte → Grabfalter | Gift/Psycho | **Raufdachs → Grimmdachs** (neu) | Kampf → Kampf/Boden |
| Nebelkauz → Schleierkauz | Psycho | **Schwammling → Moderhut** (neu, Starter) | Gift → Gift/Boden |
| Nebelahn (Wächter) | Psycho/Kampf | | |

Neue Attacken: Wasserstrahl, Moorflut (Wasser), Funkenflug, Glimmstrom, Blitzschlag (Elektro), Prankenhieb, Grimmstoss,
Ahnenstoss (Kampf), Giftschlamm (Gift), Erdklumpen (Boden); bestehende wurden umbenannt/umtypisiert (z. B. Giftstaub,
Giftbiss, Sporenwolke, Gedankenstoss, Traumsturz, Torfbeben). Raufdachs lebt am Schilfrand/Torfstich (selten Kapelle),
Schwammling im Nebelgras, Torfstich und in der Kapelle. Kaspar führt jetzt einen Raufdachs.
Status: «klamm» trifft keine Wasser-Geister, «verirrt» keine Psycho-Geister.

## v13: Heilungskirchen, Aufgaben-Markierungen, robuster Ton
- **Heilungskirchen** (wiederverwendbare Vorlage `addChurch(Karte, {x, y, id, name, healer})` in `js/world.js`: Gebäude 4×3
  Kacheln mit Tür, Innenraum mit Mondaltar, Bänken, Läufer und Heiler/in). Eldenghost: **Mondkirche** mit **Schwester Alwine**;
  Nebelküste (Hafen + Leuchtturm zählen als Siedlung): **Hafenkapelle** mit **Bruder Tamme**. Heilen (kostenlos) stellt HP,
  Bewegungspunkte und Status wieder her (Mondlicht-Säule, Heil-Jingle) und setzt den **Ort des Wiedererwachens**; schon das
  Betreten einer Kirche setzt ihn. Nach verlorenem Kampf erwacht man in der zuletzt besuchten Kirche (bzw. an der zuletzt
  entzündeten Moorlaterne). Das Bett zu Hause heilt weiterhin (und speichert); Ilse füllt nur Seelenfänger auf.
- **Aufgaben-Markierungen:** «!» (Sprechblase mit Leuchten, sanftes Wippen) über allen, die die Geschichte oder eine
  Nebenaufgabe *jetzt* weiterbringen, «?» bei Abgaben (Marens Laterne bei Ilse). Vollständig aus den Story-Flags
  abgeleitet (`MARKS` in `js/world.js`): Ilse (Start, nach dem Fang, Nebenaufgabe), Laternensteine (Wahl), Jorins Tür
  (Zettel), Wido, Wegweiser «Tiefes Moor», Tagebuch in der Hütte, Kaspar, Nebelahn, Onno (schlafend), Eltern (Abschied),
  Wenke (bis zum ersten Gespräch), die Stationen der Dorfführung.
- **Ton-Robustheit (Android):** `S.unlock()` bei jeder Eingabe (pointerup/touchend/click/keydown – auf Touch zählt
  pointerdown in Chrome nicht als Nutzeraktivierung!) sowie bei visibilitychange/focus/pageshow; «interrupted» wird wie
  «suspended» behandelt, ein geschlossener Kontext wird neu aufgebaut und das Stück neu gestartet. Nach dem Fortsetzen
  richtet sich der Planer neu an `currentTime` aus (kein Nachholen, kein Hinterherhinken), zusätzlich stösst die
  Spielschleife den Planer an, falls der Timer gedrosselt wird. Jede Stimme sammelt ihre Knoten und trennt sie, sobald alle
  Quellen geendet haben (vorher blieben Verstärker/Filter/Panner verbunden); Obergrenze für gleichzeitige Quellen (Musik
  150, Geräusche 230, darüber wird ausgedünnt). Dauertöne laufen ohne festes Ende (früher Stille nach 1 h).
  **Wachhund** (alle 1,5 s): stummer Master/Duck-Pegel wird wiederhergestellt; fehlendes Stück, stehender Planer,
  hängender Stück-Bus oder > 7 s gemessene Stille (Analyser) → Stück wird neu gestartet.

## Musik & Klang (Atmosphäre)
Alles wird live mit WebAudio erzeugt (keine Audiodateien). Die Stücke sind generativ: ein Planer mit Vorlauf setzt Takt
für Takt Fläche, Bass, Melodie und Glocken; Motive werden je Phrase variiert (A A' B A''), Akkordfolgen rotieren, manche
Phrasen bleiben still – dadurch gibt es keine hörbaren Schleifen-Nahtstellen und keine exakte Wiederholung. Seltene
«Unbehagen»-Momente (leicht verstimmte Glocke, fernes Flüstern, plötzlicher tiefer Ton, Herzschlag) kommen mit
Mindestabstand. Gebietswechsel werden weich übergeblendet (ca. 2,8 s, Kämpfe 0,5 s).

| Stück | Wo | Klang |
|---|---|---|
| `ambient` | Dorf | d-dorisch, 74 BPM, Spieluhr-Melodie, warme Fläche, Harfen-Bass – gemütlich |
| `indoor` | Innenräume | a-äolisch, 60 BPM, sehr leise Spieluhr, weiche Fläche, Ofenknistern |
| `nebel` | Nebelgras / Dorfrand bei den Nebelbänken | e-phrygisch, 62 BPM, hallende Glocken, Bordun, Wind, Flüstern – mystisch |
| `moor` | Tiefes Moor | cis-lokrisch, 52 BPM, Tritonus-Bordun, gläserne Glocken, Herzschlag, tiefe Einzeltöne – dunkel |
| `battle` | wilde Geister | a-phrygisch, 108 BPM, pulsierender Bass, Zupf-Arpeggien, leise Trommel |
| `trainer` | Beschwörer | d-harmonisch-moll, 118 BPM, treibender, dichtere Melodie |
| `boss` | Nebelahn | h-moll, 58 BPM, Orgel & Chor, Totenglocke, Pauke – feierlich statt aggressiv |

Jingles (Musik wird kurz abgesenkt): Fang, Sieg, Level-up, «Nebelahn besänftigt». Geräusche: weiche Schritte je
Untergrund (Gras, Holz, Boden, Moor), Menü-Klicks, Tür (Knarren + Schlag), Fund, Treffer je Typ, Volltreffer,
sehr/nicht sehr wirksam, Erschöpfung, Laternenwurf, Laterne wackelt (Klappern + Glas), Begegnung, Heilung, Glocke.
SELECT schaltet alles stumm (weiche Blende); Audio startet nach der ersten Berührung/Taste (Mobil-Regeln), pausiert im Hintergrund.

**Kampfeffekte je Typ** (Anflug, Einschlag, Klang, Schütteln; Blitz bei Volltreffer und «sehr wirksam»):
Feuer – schlingernde Glutflamme mit Funkenschweif, orange Funkenregen und Glutring (Knistern); Wasser – Tropfenstrahl,
Spritzer im Bogen, flache Wellenringe (Platschen); Elektro – Zickzack-Funken, Blitz von oben, kurzes Abdunkeln,
Funkenregen (Knattern); Stein – Brocken fallen von oben und prallen ab, Staub, starkes Schütteln (Poltern);
Psycho – rosa Schwaden rollen hinüber, Lichtfunken (Hallklang); Boden – Erdklumpen im Bogen, Spritzer, Erdkrümel
(dumpfes Klatschen); Gift – violette Schwaden spiralen ein, Bild verdunkelt sich (Zischen); Kampf – schneller Vorstoss,
Stern aus Funken, doppelte Druckwelle, starkes Schütteln (Schlag); Neutral – kurzer Stoss, helle Funken, kleiner Ring,
leichtes Schütteln (dumpfer Treffer). Heilung: aufsteigende Seelenfunken.
Hammer auf Amboss, Mühlrad-Knarren und Plätschern kommen aus der Schmiede und der Mühle.
Leichtgewichtig: max. 160 Partikel, vorberechnete Leucht-Sprites, 60 fps.

## Comic-Pixelstil (angelehnt an Handheld-Pixelkunst der Gen-4/5-Ära, eigene Entwürfe)
- Geister und Figuren entstehen aus Formen (Ellipsen, Polygone, Kapseln, Augen) in `js/art.js` und werden auf ein
  klares Pixelraster gerastert: flache Farbflächen mit 3 Stufen (Licht, Grundton, Schatten), Schlagschatten
  überlappender Teile, dunkle Innenlinien, **kräftige dunkle Kontur (1 logischer Pixel)**, kühle **Mondlicht-Kante** an
  oberen Rändern – keine Körnung, kein Weichzeichnen. Ein Kunstpixel = ein logischer Pixel (wie auf dem DS mit 256×192).
- Geister (`js/creatures.js`): grosse, runde Formen und grosse Augen; Vorderansicht 64 px, Boss 84 px, Rückansicht
  80 px (näher, unten angeschnitten), Oberwelt 32 px, Entwicklungs-/Titelgrössen werden in der passenden Grösse neu
  gerastert statt skaliert.
- Figuren (`js/people.js`): Gen-4/5-Proportionen (grosser Kopf, kurzer Körper) in 20×26-Rahmen, 3 Gangphasen,
  4 Richtungen; Spieler mit Kapuze, Schal und Laterne; neue NPCs Brann (Schmied) und Mathis (Müller).
- Weicher Bodenschatten (Ellipse) unter allen Figuren und Geistern; im Nebel wird die Spielfigur über den Schwaden
  gezeichnet und der Laternenkreis ist grösser (38 px), damit sie lesbar bleibt.
- **Oberwelt** (`js/tiles.js`): Boden in flachen Flächen ohne Körnung – Gras mit regelmässigen Büscheln, hohes
  Nebelgras als klares Büschelmuster, Wege mit dunkler Kante und abgerundeten Ecken, Torfsoden, nasser Uferboden,
  Kapellen-Steinplatten und eine Ruinenmauer mit Deckplatten. Bäume (rund, in Laubbüscheln, leicht überstehend),
  Trauerweiden, Zäune (verbinden sich), Grabsteine, Laternen, Schilder, Felsen, Stümpfe, Glocke und Holzstege sind
  Art-Sprites mit Kontur und Mondlicht-Kante; alle Häuser (Schindeln, Fachwerk-Fenster mit Blumenkasten, Torfhütte mit
  Stroh) passen jetzt zu Mühle und Schmiede. Wasser: drei flache Tiefenstufen, dunkle Uferkontur, heller Saum, feste
  Wellenstriche, Schilf/Ufersteine/Seerosen als Sprites. Innenräume behalten ihren bisherigen Stil.
- **Kampfszenen** nach Standort: *Gras* (Dorf/Nebelgras, Baumreihe), *Moor* (Trauerweiden, Schilf, Pfützen),
  *Kapelle* (Ruine, Grabsteine, Steinboden), *Wächter* (Nebelsee, Menhire, Nebelschleier vor dem Mond). Flache
  Himmelsbänder, Sterne, Mond, Hügel mit Mondkante, Boden mit Perspektivstreifen, Plattformen mit Kontur, hellem
  Innenring und Grasbüscheln bzw. Menhirkreis. Alles wird einmal vorgerendert (kein Einfluss auf die Bildrate).

## Auflösung & Grafik
- Logische Spielfläche weiterhin 256×240 (Raster, Kollision, Layout unverändert), gerendert wird aber intern mit
  **512×480** (2×) bzw. auf grossen/hochauflösenden Bildschirmen (Anzeigebreite × `devicePixelRatio` ≥ 800) mit
  **1024×960** (4×), damit jeder Detail-Pixel ganzzahlig auf Gerätepixel fällt.
- Alle Grafiken haben doppelte Detailauflösung: Figuren, Geister, Kacheln und Häuser werden kantengerichtet
  hochskaliert (Scale2x – feine Diagonalen statt Treppen, keine Unschärfe) und danach auf feinen Pixeln veredelt:
  dünne Kontur mit weichen Ecken, Mondlicht-Kante oben/links, Volumen-Schattierung, Tuschlinien an Farbgrenzen,
  Fell-/Federstriche; Laubkronen mit Blattbüscheln, Schindeln mit Moos, Holzmaserung, Kies, Grashalm-Spitzen,
  Steinrisse. Gravuren, Schilder und Kerzen bleiben bewusst scharfkantig.
- Wasser (Ufer, Tiefe, Schilf, Seerosen, Steine) wird direkt auf feinen Pixeln berechnet; Wellen-, Mond- und
  Laternenspiegelungen, Licht, Nebel und Vignette laufen als 2×-Ebenen. Kampfhintergrund mit feinem Sternenstaub und Grashalmen.
- Texte und Menüs sind HTML und damit auf jedem Bildschirm gestochen scharf; Menü-Symbole nutzen die 64×64-Geister.
- Technik: `G.mkHi` (Leinwand mit logischer Grösse), `G.scale2x`, `G.finish` in `js/sprites.js`; ein kleiner
  `drawImage`-Aufsatz rechnet hochaufgelöste Leinwände automatisch auf logische Koordinaten um.

## Struktur
- `index.html`, `style.css` – Layout, DOM-Overlays (Text, Menüs, LP-Balken), Touch-Steuerung
- `js/data.js` – Typen, Typentabelle, Attacken, Geister, Formeln
- `js/audio.js` – WebAudio: Ambient-Drone, Wind, Glockentöne, Kampfmusik, Effekte
- `js/art.js` – Rasterer für den Comic-Pixelstil (Formen → Pixel, Schattierung, Kontur, Mondlicht-Kante)
- `js/creatures.js` – die 19 Geister (Vorder-/Rückansicht, beliebige Grössen)
- `js/people.js` – Spieler, Dorfbewohner (auch Mutter, Vater, Onno, Kapitänin Wenke), Seelenfänger
- `js/tiles.js` – Oberwelt-Kacheln, Objekte, Häuser und Wasser-Deko im Comic-Pixelstil
- `js/sprites.js` – Hochauflösungs-Werkzeuge (mkHi, Scale2x), Geister-Sprite-Tabelle
- `js/ui.js` – Textbox, Auswahlmenüs, Eingabe (Tastatur + Pointer/Touch), Skalierung
- `js/world.js` – Karten, Kacheln, Licht/Nebel/Glühwürmchen, Bewegung, Interaktionen, Prolog (`G.Story`: Ziele, Szenen, Leuchtturm, Schiff)
- `js/battle.js` – Kampfsystem, Fangen, EP & Level
- `js/main.js` – Hauptschleife, Titel, neues Spiel, Menü mit Ziel-Anzeige, Speichern/Laden (localStorage), Migration
- `tests/test_dpad.py` – Touch-Tests für das Analogstick-Steuerkreuz; `tests/test_content.py` – Elemente, Typentabelle, neue Geister,
  Mühle & Schmiede (Dialoge, Tausch), Erreichbarkeit aller Ziele, Migration,
  Kacheln/Häuser/Kampfszenen im neuen Stil, Starter-Dreieck (echte Starterwahl), Fenns Team je Starter, typenlose Attacken unter Lv 8
  (Lernlisten, Beschwörer, Wildgeister, Migration), Beschwörer-Sperre (Fenn erst nach der Fang-Übung, nur auf Ansprache); beide laufen in `test_game.py` mit
- `tests/test_story.py` – Prolog Schritt für Schritt (Sperre ohne Geist, Ilse, Laternensteine, Seelenfänger, Fang-Übung, Leuchtturm dunkel/hell,
  Onno wecken, Abschied, Schiffsankunft, Ziel im Menü, Nebengeschichte, Migration) mit Screenshots 95–113; läuft ebenfalls in `test_game.py` mit
- `tests/test_v13.py` – Gehzyklen (4 Phasen × 4 Richtungen, Wippen, Ruhe-Animation, Staub), Effekte-Umschalter und Frame-Budget,
  Heilungskirchen (Heilen stellt alles her, Wiedererwachen nach verlorenem Kampf), Markierungen je Story-Schritt, Dorfführung
  (vollständig, überspringbar per Auswahl und B, Kirche/kostenlos erwähnt, alte Spielstände ohne Führung), Ton (Suspend/Resume
  per Tippen/Taste/Sichtbarkeit, «interrupted», geschlossener Kontext, Wachhund, Zonenwechsel, begrenzte Knotenzahl)
- `tests/test_game.py` – Playwright-E2E-Test (Desktop + Mobil 390×844 per Touch): Kartenwechsel, Status, Gegenstände, Entwicklung, Beschwörerkampf, Moor, Speichern/Migration, Game-Boy-Layout
- `G.debug` (Konsole): `lead(sp,lvl)`, `items({...})`, `warp(map,x,y)`, `wild(sp,lvl,moves)`; `G.debugEncounterRate`, `G.debugCatch`, `G.debugStatus`

## PWA (installierbar, offline)
- `manifest.json` (fullscreen, portrait, theme #0a0816), Icons in `icons/` (192/512/maskable, apple-touch-icon 180), `sw.js` (cache-first).
- Service Worker braucht HTTPS (oder localhost). Zum Testen auf dem Handy also z. B. auf GitHub Pages/Netlify hosten.
- Bei Änderungen am Code `VERSION` in `sw.js` erhöhen, sonst sehen installierte PWAs die alte Version.
- Icons/Splash neu erzeugen: `python3 tools/make_icons.py`

## Native App (Capacitor 8)
Die Web-Quelle in der Projektwurzel ist die einzige Quelle; `tools/build-www.js` kopiert sie nach `www/`,
`tools/native-customize.js` setzt Hochformat, dunkles Theme/Splash und Icons in `android/` und `ios/`.
- Voraussetzungen hier: Node 22 (`/home/box/node22/bin`), JDK 21, Android SDK in `/home/box/android-sdk`
- `export PATH=/home/box/node22/bin:$PATH JAVA_HOME=/usr/lib/jvm/java-21-openjdk-amd64 ANDROID_HOME=/home/box/android-sdk`
- Debug-APK: `npm run apk` → `android/app/build/outputs/apk/debug/app-debug.apk`
- Plugins: Preferences (Spielstand, localStorage als Cache/Fallback), Haptics, StatusBar/SystemBars, SplashScreen, App (Zurück-Taste = B)
- iOS: `ios/` ist angelegt. Auf einem Mac: `npm install && npm run sync && npx cap open ios`, in Xcode Team/Signing wählen, auf Gerät starten.
