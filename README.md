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
| SELECT = Ton an/aus | Shift | SELECT oder Lautsprecher-Taste |

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
2. **Starterwahl in der Welt:** drei Laternensteine hinter Ilse mit Flackerling (Feuer, Glutdrache), Pfützling (Wasser, Geisterentlein) und Blattling (Pflanze, Feenbaum-Setzling).
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
9 Elemente: **Feuer, Wasser, Pflanze, Elektro, Stein, Psycho, Boden, Gift, Kampf** (Pflanze neu in v14). Doppeltypen sind
möglich, die Faktoren multiplizieren sich (z. B. Feuer gegen Gift/Psycho = 4×). Gleicher Typ wie der Angreifer: ×1,5. Die
Tabelle steht auch in der Geisterchronik (Menü), dort mit einer Zeile «Neutral».

**Neutral (typenlos):** Rempler, Hauch, Kratzer (je 40), Biss, Kopfnuss (je 55, 95 %), dazu die Statusattacken Heuler
(Angriff des Gegners −1), Starren (Verteidigung des Gegners −1) und Härten (eigene Verteidigung +1); «Letzter Hauch» ist
ebenfalls typenlos. Neutral wirkt 1× gegen jeden Typ – **ausser gegen Stein: ½×** (v14, wie Normal gegen Gestein) – und
bekommt keinen Typbonus (kein Geist hat den Typ Neutral).
**Unter Lv 8 kennen alle Geister nur typenlose Attacken** – Starter, Wildgeister und Beschwörer. Die erste eigene
Typ-Attacke kommt mit Lv 8. Damit frühe Stein-Geister trotz ½× schlagbar bleiben: Kieselgeist lernt zuerst Heuler (Härten
erst mit Lv 6), ist im Nebelgras seltener (Gewicht 4) und erscheint im Nebelgras und am Küstenweg höchstens 3 Level unter
deinem stärksten Geist (Simulation: Starter Lv 5 gegen Kieselgeist Lv 2: 97–100 %, Lv 7 gegen Lv 4: 93–97 %, Lv 8 gegen Lv 5: 100 %).

| Angriff ↓ / Ziel → | Feu | Was | Pfl | Ele | Ste | Psy | Bod | Gif | Kam |
|---|---|---|---|---|---|---|---|---|---|
| **Feuer** | ½ | ½ | 2 |   | ½ | 2 |   | 2 |   |
| **Wasser** | 2 | ½ | ½ |   | 2 |   | 2 |   |   |
| **Pflanze** | ½ | 2 | ½ |   | 2 |   | 2 | ½ |   |
| **Elektro** |   | 2 | ½ | ½ | ½ | 2 | 0 |   |   |
| **Stein** | 2 |   |   | 2 | ½ |   | ½ |   | ½ |
| **Psycho** |   |   |   |   |   | ½ |   | 2 | 2 |
| **Boden** | 2 |   | ½ | 2 | 2 |   |   | 2 | ½ |
| **Gift** |   | 2 | 2 |   | ½ |   | ½ | ½ | 2 |
| **Kampf** |   |   |   | 2 | 2 | ½ |   | ½ |   |
| **Neutral** |   |   |   |   | ½ |   |   |   |   |

Leer = 1×. Jeder Typ trifft 2–4 Typen sehr wirksam und hat 2–4 Schwächen (Stein hat seit Pflanze vier Schwächen, hält dafür
Neutral besser aus). **Pflanze:** stark gegen Wasser, Stein, Boden; schwach gegen Feuer und Gift; resistent gegen Wasser,
Elektro, Boden und Pflanze.

**Starter-Dreieck (v14):** Feuer > Pflanze > Wasser > Feuer, jeweils 2×, rückwärts symmetrisch ½×. Es greift ab Lv 8, wenn
die Typ-Attacken kommen. Basiswerte 178–182, Entwicklungen mit **Lv 14 und Lv 22** (Begründung: Die Geschichte endet derzeit
um Lv 16–20 – Nebelahn Lv 16, Kapelle bis Lv 15; mit Lv 30 würde niemand die dritte Stufe sehen. Lv 22 ist mit EP fürs
Fangen und Bank-EP nach dem Moor gut erreichbar und bleibt ein Ziel für das Nachspiel.)

| Linie | Stufe 1 | Stufe 2 (Lv 14) | Stufe 3 (Lv 22) |
|---|---|---|---|
| Feuer (Drache) | **Flackerling** – kleiner Glutdrache, Feuer | **Glutwurm** – junger Lindwurm mit Glutflügeln, Feuer | **Seelendrache** – Geisterdrache mit Nordlicht-Schwingen, Feuer/Psycho |
| Wasser (Ente) | **Pfützling** – flaumiges Geisterentlein, Wasser | **Nebelente** – elegante Nebelente, Wasser | **Mondschwan** – Geisterschwan mit Mondsichel, Wasser/Psycho |
| Pflanze (Feenbaum) | **Blattling** – Setzling mit Blattflügeln, Pflanze | **Hainfee** – Dryade mit Blütenkranz, Pflanze | **Feenlinde** – uralter Feenbaum voller Geisterlichter, Pflanze/Psycho |

| Starter | Lv 1 | Lv 6 | Lv 8 (erste Typ-Attacke) | danach |
|---|---|---|---|---|
| Flackerling | Kratzer, Heuler | Biss | Irrfeuer (Feuer) | Blendlicht 10, Glutschein 12, Irrweg 13, Seelenbrand 16, Grabesruf 19, Schleiersturz 22, Drachenglut 26 |
| Pfützling | Rempler, Starren | Kopfnuss | Wasserstrahl (Wasser) | Sumpfsog 10, Moorkälte 12, Grabesruf 13, Moorflut 16, Nebelschleier 19, Schleiersturz 22, Schwanenruf 26 |
| Blattling | Rempler, Starren | Kopfnuss | Blattwirbel (Pflanze) | Feenstaub 10, Rankensog 12, Grabesruf 13, Wurzelhieb 16, Waldsegen 19, Schleiersturz 22, Feensturm 26 |

Neue Pflanzen-Attacken: Blattwirbel (45), Feenstaub (Genauigkeit −1), Rankensog (55, saugt ½), Wurzelhieb (80), Waldsegen
(heilt ½), Feensturm (90); dazu Drachenglut (Feuer 90) und Schwanenruf (Wasser 90) als Stufe-3-Attacken. Wilde Pflanzen-Geister:
**Kleeling** (Pflanze, früh im Nebelgras und am Küstenweg) und **Moorranke** (Pflanze/Gift, Kapelle). Schwammling → Moderhut
(Gift) und Moorlurch → Moorunke (Wasser/Gift) bleiben wild fangbar (keine Überschneidung mit der Enten-Linie).

**Fenn** (erster Beschwörer) wählt den Konter zu deinem Starter: Laternchen Lv 5 plus Lv 6 Moorlurch (gegen Flackerling),
Kleeling (gegen Pfützling) bzw. Flackerling (gegen Blattling); alte Spielstände: Raufdachs (Moorlurch), Nebelkauz (Schwammling),
Flackerling (Kieselgeist). Balance (Simulation, Starter allein, Gegner-KI wie im Spiel, 4000 Kämpfe): gegen Fenn mit **Lv 7**
Flackerling **80 %**, Pfützling **83 %**, Blattling **81 %** (Lv 6: 6–19 %, Lv 8: 99–100 %); Starter Lv 5 gegen Nebelgras: 69–74 %.

**Alte Spielstände (v4 → v5):** nichts geht verloren. Flackerling bleibt Flackerling (neues Aussehen), Irrfackel heisst jetzt
Glutwurm (gleiche Linie). Wer mit Moorlurch (Wasser) oder Schwammling bzw. Kieselgeist gestartet ist, bekommt **einmalig und
freiwillig** den neuen Starter derselben Rolle angeboten (Pfützling bzw. Blattling): Ilse trägt ein «!», erzählt vom neuen Licht
am Laternenstein und fragt «… zusätzlich mitnehmen?»; Level = stärkster Geist − 2 (5–30), bei vollem Team in die Kiste.

| Geist | Typ | Geist | Typ |
|---|---|---|---|
| Laternchen → Totenleuchte | Elektro → Elektro/Psycho | Moorlurch → Moorunke | Wasser → Wasser/Gift |
| Kieselgeist → Menhirgeist | Stein → Stein/Boden | Torfwicht | Boden |
| Schattenmotte → Grabfalter | Gift/Psycho | Hauchling | Psycho |
| Nebelkauz → Schleierkauz | Psycho | Raufdachs → Grimmdachs | Kampf → Kampf/Boden |
| Schwammling → Moderhut | Gift → Gift/Boden | Kleeling · Moorranke | Pflanze · Pflanze/Gift |
| Nebelahn (Wächter) | Psycho/Kampf | | |

Status: «klamm» trifft keine Wasser-Geister, «verirrt» keine Psycho-Geister.

### Level-Kurve der Wildgebiete (v14)
Entlang der Geschichte steigen die Wild-Level monoton (`G.ZONE_ORDER`, Test in `test_v14.py`); ausserhalb des Dorfs höchstens
2 Level über deinem stärksten Geist, im Dorf höchstens 1.

| Gebiet (Story-Reihenfolge) | Wann | Wild-Level | erwartetes Team | Beschwörer |
|---|---|---|---|---|
| Nebelgras (Dorf) | Fang-Übung, vor Fenn | 2–6 | 5–7 | Fenn 5/6 |
| Küstenweg zum Leuchtturm (neu `kuestengras`) | Prolog 4–6 | 5–8 | 7–10 | – |
| Schilfrand (Tiefes Moor) | Nebengeschichte ab Wegweiser | 8–11 | 9–12 | Selma 9/10 |
| Torfstich | Moor, Mitte | 10–13 | 11–14 | – |
| Kapelle / Moorkern | vor Kaspar & Nebelahn | 12–15 | 13–16 | Kaspar 12/12/13, Nebelahn 16 |

**EP (v14):** Fangen gibt genauso viele EP wie Besiegen (Art-EP × Level / 5, Beschwörer ×1,5). Alle Geister, die im Kampf
waren, bekommen 100 %, Geister auf der Bank 65 % (abgerundet, min. 1), erschöpfte Geister (0 KP) nichts. Bank-Geister
bekommen je eine kurze Zeile, können aufsteigen, Attacken lernen und sich nach dem Kampf entwickeln. Weil das Team damit
schneller wächst, liegen Küstenweg und Moor 1–2 Level höher als in v13.

## v15: Neue Geister, Gebiete, Streicher-Musik, Umgebungs-Ereignisse
- **Hafenkapelle entfernt:** Bruder Tamme und die Kapelle an der Nebelküste gibt es nicht mehr; einzige Heilungskirche ist die
  Mondkirche. Alte Spielstände mit Wiedererwachen in der Kapelle erwachen in der Mondkirche (wer in der Kapelle stand, steht vor
  ihrem früheren Platz an der Küste).
- **Abschied & Dialoge:** Der Abschied von den Eltern ist neu geschrieben (ruhiger, ohne Pathos: Sorge, Stolz, Tee und Vaters
  Kompass, «Wenn es nicht mehr geht, kommst du heim. Das ist keine Schande.»). Einige zu blumige Sätze (Brann, Mathis, Wido,
  Jorin, Onno, Selma, Ilse, Eltern) wurden schlichter.
- **Musik:** alle Gebiets-Stücke und die Kampfmusik sind Streicher-Stücke (Solo-Violine/Viola, Cello-Liegetöne, Flageoletts,
  Streicherflächen, Harfe/Klavier als Farbe; Kampf mit Spiccato-Achteln, Cello-Puls und Rahmentrommel).
  Offline-Vorschau: `python3 tests/music_preview.py` (WAV nach `/workspace/music_previews`).
- **Starter nie wild:** keine Stufe der drei Starter-Linien steht in einer Wild-Tabelle (Beschwörer dürfen sie haben).
- **15 neue Tier- und Naturgeister (#28–#42):** Tauhase, Funkmaus, Moosigel → Farnigel, Gischtkrebs, Glimmfuchs → Glutfähe,
  Tropfsteinmolch → Kristallmolch, Flatterhauch, Blitzreiher, Sumpfnatter, Grubenkäfer, Keilerling → Moorkeiler. Alle 9 Typen,
  jede Linie mit eigener Attacke und eigener Animation (≤ 3 s), Chronik-Eintrag, gemässigte Werte (jeder Wert 70–135 % des Mittels).
- **Gebietstabellen:** jedes Gebiet 4–6 passende Arten mit einem seltenen Geist (Gewicht ≤ 8), keine Art in allen Gebieten,
  höchstens in zwei: Nebelgras (Hase, Motte, Igel), Küstengras (Maus, Krebs, Kauz, Molch an den Felsen), Schilfrand (Natter,
  Reiher), Torfstich (Keiler, Käfer), Versunkene Kapelle (Hauch, Falter, Fledermaus), Moorherz (Farnigel, Kristallmolch).
- **Seltene Umgebungs-Ereignisse** (`G.World.ambient`): Blätterwirbel (Dorf/Küste, in Windrichtung, leises Rauschen),
  Schilfflaum (Moor), Krähen (Dorf/Moor), Fischsprung (sichtbares Wasser), Sternschnuppe (nur klare Dämmerung). Nie in
  Innenräumen, nie gleichzeitig; je Art 60–180 s Abklingzeit (zufällig), dazu mindestens 75 s zwischen zwei beliebigen – etwa
  ein Ereignis alle 2 Minuten.
- **Spielerfigur:** Kapuze ab – schwarze, zackige, zur Seite gestrichene Haare mit langen Gesichtssträhnen und kühlem
  blauem Streiflicht; die eigene Laterne bleicht die Figur nicht mehr aus.
- **Stufenweise Veröffentlichung:** Klippenhöhle/Team Quantum, Legende, Katzenhaus (v16) und seltene Sondergeister (v17) sind im
  Code vorbereitet, aber über `G.FEAT` (in `js/data.js`) abgeschaltet.
- Tests: `tests/test_v15.py`; Bilder: `tests/shots_v15.py`.

## v14: Neue Starter, Pflanze, Kampf-Feedback, Klang & Steuerung
- **Neue Starter-Linien** (Drache, Ente, Feenbaum) und **Typ Pflanze** – siehe «Elemente & Typentabelle»; alle 9 Stufen im
  Comic-Pixelstil mit Blinzel-/Atem-Idle, Pflanzen-Treffer mit Blattwirbel-Partikeln und eigenem Klang (Rascheln, Holzklopfen, Zupfakkord).
- **Eigene Animation je Attacke** (`MOVE_FX` in `js/battle.js`, 55 Einträge, 0,6–1,8 s, jede ≤ 3 s): z. B. Kratzer =
  drei Krallenstriche, Biss = zuschnappende Zahnreihen, Heuler = Schallringe, Wasserstrahl = durchgehender Strahl, Irrfeuer =
  drei umeinander tanzende Flammen, Blitzschlag = zwei Zickzack-Blitze von oben, Felsruf = fallender Felsbrocken,
  Schwanenruf = Rufringe und Federflug, Feensturm = Wirbel aus Blättern und Blütenfunken.
- **Wirksamkeit als Pop-up im Einschlag** («Sehr effektiv!» orange und gross, «Nicht sehr effektiv …» grau, «Hat keine Wirkung …»),
  poppt am Ziel auf, hält kurz und verblasst – **ohne eigene Textzeile, ohne Tastendruck, ohne Wartezeit** (die alten Zeilen
  «Das ist sehr wirksam!» entfallen). Sehr effektiv: kräftigerer Schlag, Blitz, Bildschirmwackeln; schwach: gedämpfter Treffer,
  kleinerer Einschlag; wirkungslos: 0 Schaden, hohles Verpuffen. Im Attacken-Menü steht hinter jeder Schadensattacke ▲ (grün,
  stark), ▼ (grau, schwach) oder ✕ (wirkungslos) gegen den aktuellen Gegner – **immer**, denn Typ und Name des Gegners stehen
  ohnehin im Kampf-HUD. Bei 1× steht nichts.
- **Level-up:** warmer Streicher-Jingle mit Harfen-Arpeggio, Lichtstoss und aufsteigende Funken am Geist, EP-Leiste füllt sich
  bis zum Rand und blinkt, Banner «Level X!» mit Werte-Tafel (alt → neu, +Differenz); steht, solange der Text läuft (A überspringt).
- **Begegnungs-Stinger** (synchron zu Blitz und Wisch, Kampfmusik setzt erst danach ein): wild = aufsteigendes Nebelrauschen,
  Geisterschimmer, tiefer Puls; Beschwörer = entschlossener mit Trommelschlag; Boss = tiefer, Orgelgrund mit kleiner Sekunde.
  Respektiert Ton-Schalter und Stimmen-Obergrenze.
- **Umgebung positionsabhängig:** Wasser (Wellen an der Küste, Plätschern an Moor/See) wird lauter, je näher man dem Wasser
  ist, mit leichter Stereo-Lage zur Seite des Wassers; Wind stärker auf offenen Flächen und an der Küste; drinnen knistert es
  nahe am Ofen/an der Esse. Vorberechnete Distanzkarte pro Karte (BFS), Pegel alle 0,1 s weich nachgeführt, im Kampf aus.
- **Begehbare Laternen:** Strassen- und Moorlaternen sind nicht mehr fest; sie werden nach y mit Figuren sortiert gezeichnet
  (hinter/vor der Spielfigur). Moorlaternen lassen sich weiterhin mit A entzünden – auch wenn man auf ihnen steht.
- **Aufgaben-Markierungen nur über Personen** (keine Häuser, Türen, Zettel, Schilder, Steine, Tagebücher); während der
  Dorfführung trägt Ilse das «!».
- **Lautsprecher-Taste** unten rechts (Querformat: oben links), 46 px, Symbol zeigt den Zustand (Wellen = an, durchgestrichen =
  aus), SELECT bleibt synchron (Anzeige «Ton ♪/✕» + kurzer Hinweis «Ton an/aus»). Sie ist absolut positioniert (keine
  Verschiebung anderer Tasten), überlappt weder Steuerkreuz (+28 px Trefferzone) noch A/B/START/SELECT, nimmt keine
  Zeiger-Capture und löst nur bei einem Tippen aus, das auf ihr beginnt und endet – Wischen vom Steuerkreuz darüber bleibt Bewegung.
- **Ton standardmässig an:** neue Spiele und Neuinstallationen starten mit Ton; das v14-Update setzt ein früher gespeichertes
  «Ton aus» einmalig zurück (`eldenghost.soundReset = 14`), danach gilt die eigene Wahl.

## v13: Heilungskirchen, Aufgaben-Markierungen, robuster Ton
- **Heilungskirchen** (wiederverwendbare Vorlage `addChurch(Karte, {x, y, id, name, healer})` in `js/world.js`: Gebäude 4×3
  Kacheln mit Tür, Innenraum mit Mondaltar, Bänken, Läufer und Heiler/in). Eldenghost: **Mondkirche** mit **Schwester Alwine**
  (die frühere Hafenkapelle an der Nebelküste wurde in v15 entfernt, siehe unten). Heilen (kostenlos) stellt HP,
  Bewegungspunkte und Status wieder her (Mondlicht-Säule, Heil-Jingle) und setzt den **Ort des Wiedererwachens**; schon das
  Betreten einer Kirche setzt ihn. Nach verlorenem Kampf erwacht man in der zuletzt besuchten Kirche (bzw. an der zuletzt
  entzündeten Moorlaterne). Das Bett zu Hause heilt weiterhin (und speichert); Ilse füllt nur Seelenfänger auf.
- **Aufgaben-Markierungen:** «!» (Sprechblase mit Leuchten, sanftes Wippen) über allen, die die Geschichte oder eine
  Nebenaufgabe *jetzt* weiterbringen, «?» bei Abgaben (Marens Laterne bei Ilse). Vollständig aus den Story-Flags
  abgeleitet (`MARKS` in `js/world.js`), seit v14 nur über Personen: Ilse (Start, nach dem Fang, Führung, Nebenaufgabe,
  Starter-Geschenk), Wido, Kaspar, Onno (schlafend), Eltern (Abschied), Wenke (bis zum ersten Gespräch).
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
- `js/creatures.js` – die 28 Geister (Vorder-/Rückansicht, beliebige Grössen)
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
- `tests/test_v14.py` – Starter-Linien/Entwicklungsstufen, Dreieck & Pflanze, Neutral gegen Stein, Sprites, Starter-Geschenk
  für alte Spielstände, begehbare Laternen (durchlaufen, Moorlaterne auf der Kachel anzünden), Stinger (wild/Beschwörer/Boss,
  Ton aus), Wirksamkeits-Pop-ups (alle Fälle, keine Zusatzzeile, gleiche Zugdauer, Menü-Hinweis), EP (Fang = Sieg, Bank 65 %,
  erschöpft 0), Level-up (Jingle, Banner, Werte-Tafel), monotone Level-Kurve, eine Animation je Attacke (≤ 3 s, gemessen),
  Umgebungsklang nah/fern, Lautsprecher-Taste (Abstände, keine Verschiebung, Wischen löst nicht aus, Tippen schaltet, SELECT synchron),
  Ton-Standard und einmalige Rücksetzung
- `tests/shots_v14.py` – v14-Screenshots 134–139 (alle 9 Starter-Stufen, Laternensteine, Starterwahl, Menü-Hinweis ▲, «Sehr effektiv!»-Pop-up, Level-up-Tafel)
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
