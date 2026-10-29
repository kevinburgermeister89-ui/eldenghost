# Entwurf: Drache- und Dunkel-Geister (NUR DESIGN, nicht eingebaut)

Stand: v20.2 (17.10.2026), aktualisiert 29.10.2026 (Psycho → Dunkel neu ½× statt 0×, auf Kevins Wunsch; Sprite-Entwürfe in design/sprites_drachen_dunkel.js). Arbeitsname «Dunkel» entspricht dem Vorbild-Typ Unlicht (Dark).
Basiswerte als **LP / Angr. / Vert. / Init.** im Massstab des Spiels (Stufe 1 ≈ 180–200, Stufe 2 ≈ 240–260, Stufe 3 ≈ 320–340 Summe; Rollen wie bei den übrigen Geistern).
Alle Aussehen sind eigene Entwürfe im Stil des Spiels (dunkel-gemütlich, Tier-/Naturgeist mit Glimmen, Rauch, Moos), keine Kopien bekannter Monster.

## 1. Einbindung in die Typentabelle (wie das offizielle Vorbild, Gen. 6+)

Nur die Beziehungen, die zu den vorhandenen 11 Typen + den beiden neuen gehören (Eis, Fee, Stahl, Geist, Flug gibt es im Spiel nicht):

| Angreifer → Verteidiger | Faktor |
|---|---|
| Drache → Drache | 2× |
| Feuer, Wasser, Pflanze, Elektro → Drache | ½× |
| Dunkel → Psycho | 2× |
| Dunkel → Kampf, Dunkel | ½× |
| Kampf, Käfer → Dunkel | 2× |
| **Psycho → Dunkel** | **½×** (bewusste Abweichung vom Vorbild, dort 0×) |
| Drache ↔ Dunkel, alle übrigen | 1× |

Folgen und Hinweise:
- **Drache ist ohne Eis/Fee sehr stark**: nur Drache trifft ihn 2×, er widersteht 4 Typen. Darum: Drachen spät, selten und mit eher schwachen Typ-Attacken (Lv ≥ 14, Stärke 40–85), plus zusätzliche Schwächen durch Doppeltypen (z. B. Drache/Stein ist anfällig für Kampf, Boden und Drache). Optionaler späterer Ausweg: ein Eis- oder Fee-Typ – ist nicht Teil dieses Entwurfs.
- **Psycho → Dunkel ½×** (Änderung 29.10.2026, vorher 0×): Psycho-Attacken des Nachtmahrs und von Hauchling (Kaspar) richten gegen Dunkel-Geister nur noch halben Schaden an, bleiben aber wirksam. Damit gibt es **keine Immunität mehr, die einen Story-Kampf brechen kann** – Dunkel-Geister müssen nicht mehr zwingend bis nach der Klippenhöhle warten. Die vorgeschlagenen Fundorte (Torfstich-Nacht, Moorherz, Kapelle) bleiben trotzdem ein guter Zeitpunkt; ein früherer Einzelfund (z. B. Russwiesel schon vor dem Nachtmahr) wäre jetzt möglich, macht den Nachtmahr-Kampf aber spürbar leichter und sollte deshalb selten bleiben. Die einzige Immunität im Spiel bleibt Elektro → Boden 0×.
- «Neutral» (typenlose Anfangsattacken) bleibt 1× gegen beide neuen Typen.
- Gegner-KI, Menühinweis ▲/▼/✕, Meldungen und Detailansicht der Typentabelle funktionieren automatisch, sobald die Einträge in G.CHART stehen.

## 2. Neue Attacken (Vorschlag)

| Attacke | Typ | Stärke/Gen./AP | Wirkung |
|---|---|---|---|
| Drachenhauch | Drache | 40 / 100 / 30 | warmer Atem aus Nebel |
| Schuppenhieb | Drache | 70 / 95 / 15 | |
| Wyrmzorn | Drache | 85 / 90 / 10 | 20 %: senkt eigene Vert. (Rückschlag-Risiko) |
| Schuppenglanz | Drache (Status) | – / – / 20 | Angriff +1 |
| Schattenbiss | Dunkel | 55 / 100 / 25 | 20 %: senkt Init. |
| Hinterhalt | Dunkel | 40 / 100 / 20 | Erstschlag |
| Finsterschlag | Dunkel | 80 / 95 / 10 | |
| Ränke | Dunkel (Status) | – / 95 / 20 | senkt Vert. des Ziels |

Je Geist zusätzlich 1 Signatur-Attacke (unten **fett**).

## 3. Zehn Drache-Geister

| # | Name | Typ | Linie | Aussehen | Rolle | Basiswerte | Attacken (Signatur fett) | Gebiet / Seltenheit |
|---|---|---|---|---|---|---|---|---|
| 1 | Nebelwürmchen | Drache | → Dunstwyrm (Lv 18) → Nebelkönigswyrm (Lv 32) | kleiner, gerollter Wurm aus Morgennebel, zwei Laternenaugen, Moos auf dem Rücken | Sweeper | 44 / 52 / 40 / 54 | Drachenhauch, Kratzer, Heuler, **Nebelschnörkel** (Drache 50, senkt Gen.) | Moorherz, früh morgens; selten (4 %) |
| 2 | Dunstwyrm | Drache | Stufe 2 | langer Dunstkörper, Weidenzweige als Mähne, glimmende Schuppen | Sweeper | 58 / 70 / 52 / 72 | Schuppenhieb, Drachenhauch, Schuppenglanz, **Nebelschnörkel** | entwickelt |
| 3 | Nebelkönigswyrm | Drache/Psycho | Stufe 3 | schwebender Wyrm mit Sternenmuster, Krone aus Mondlicht-Tropfen | Sweeper | 78 / 92 / 70 / 94 | Wyrmzorn, Gedankenstoss, Schuppenglanz, **Mondwindung** (Drache 90, ignoriert Wertsenkungen) | entwickelt |
| 4 | Moosdrachling | Drache/Pflanze | → Farnwyrm (Lv 24) | gedrungene Echse mit Farnwedel-Kamm, Pilzhütchen als Hörner | Tank | 56 / 42 / 60 / 32 | Drachenhauch, Blattwirbel, Härten, **Moospanzer** (Pflanze, Vert. +1 und heilt ⅛) | Kapelle-Waldrand; selten (5 %) |
| 5 | Farnwyrm | Drache/Pflanze | Stufe 2 | breiter Wyrm, auf dem Rücken wächst ein kleiner Farnwald, Glühwürmchen darin | Tank | 80 / 60 / 86 / 42 | Schuppenhieb, Wurzelhieb, Waldsegen, **Moospanzer** | entwickelt |
| 6 | Glutechse | Drache/Feuer | → Essenwyrm (Lv 26) | kleine Echse aus Kohle mit glühender Bauchnaht, raucht beim Schlafen | Bruiser | 54 / 58 / 44 / 38 | Drachenhauch, Glutstoss, Kratzer, **Kohlenatem** (Feuer 60, 30 % Verbrennen) | Aschehang; selten (4 %) |
| 7 | Essenwyrm | Drache/Feuer | Stufe 2 | schwerer Wyrm wie ein alter Schmiedeofen, Funkenregen aus den Nüstern | Bruiser | 82 / 86 / 64 / 50 | Wyrmzorn, Glutzunge, Schuppenglanz, **Kohlenatem** | entwickelt |
| 8 | Grottenwyrm | Drache/Stein | einzeln | blinder Höhlenwyrm mit Tropfstein-Zacken, Kristalle statt Augen | Tank | 76 / 70 / 92 / 26 | Schuppenhieb, Kieselhagel, Härten, **Tropfsteinwalze** (Stein 75, senkt Init.) | Klippenhöhle (tiefer Gang, ab Lv 16); sehr selten (2 %) |
| 9 | Gewitterlind | Drache/Elektro | einzeln | schmaler Himmelswyrm aus Gewitterwolke, Blitzadern, Mähne wie Regenfäden | Speedster | 58 / 70 / 48 / 92 | Drachenhauch, Funkenschlag, Hinterhalt¹, **Donnerschweif** (Elektro 80, Erstschlag bei < 25 % LP) | Küstenweg bei Gewitter (Wetter-Ereignis); sehr selten (1 %) |
| 10 | Brunnendrache | Drache/Wasser | einzeln (Sondergeist) | alter, gütiger Drache, der in einem moosigen Dorfbrunnen schläft; Bart aus Wasserlinsen | Support | 96 / 66 / 84 / 60 | Wasserstrahl, Schuppenhieb, Waldsegen, **Quellsegen** (Wasser, heilt ½ und löst Zustand) | Dorfbrunnen, einmalige Begegnung nach dem Dojo; Sondergeist |

¹ Gewitterlind lernt Hinterhalt als Ausnahme (Lehr-Attacke), passt zur Speedster-Rolle.

## 4. Zehn Dunkel-Geister

| # | Name | Typ | Linie | Aussehen | Rolle | Basiswerte | Attacken (Signatur fett) | Gebiet / Seltenheit |
|---|---|---|---|---|---|---|---|---|
| 1 | Russwiesel | Dunkel | → Kohlmarder (Lv 17) → Schattenmarder (Lv 30) | flinkes Wiesel aus Kaminruss, Schwanzspitze glimmt wie Glut | Speedster | 40 / 50 / 36 / 62 | Kratzer, Hinterhalt, Starren, **Russwisch** (Dunkel 45, senkt Gen.) | Torfstich bei Nacht; gelegentlich (8 %) |
| 2 | Kohlmarder | Dunkel | Stufe 2 | Marder mit Rauchmantel, trägt gestohlene Laternenfunken im Fell | Speedster | 56 / 66 / 48 / 84 | Schattenbiss, Hinterhalt, Ränke, **Russwisch** | entwickelt |
| 3 | Schattenmarder | Dunkel/Kampf | Stufe 3 | aufrechter Marder mit Rauchbinden um die Pfoten, ruhige Kampfhaltung | Sweeper | 74 / 94 / 64 / 98 | Finsterschlag, Onifaust, Hinterhalt, **Schattenfinte** (Dunkel 70, trifft immer) | entwickelt |
| 4 | Pechunke | Dunkel/Gift | → Teerkröte (Lv 22) | kleine Unke mit Teerhaut, die Bauchflecken leuchten violett | Status | 52 / 42 / 50 / 40 | Giftbiss, Schattenbiss, Ränke, **Pechblase** (Gift, vergiftet sicher, Gen. 85) | Moorherz, Tümpel; gelegentlich (7 %) |
| 5 | Teerkröte | Dunkel/Gift | Stufe 2 | schwere Kröte, auf deren Rücken kleine Teerblasen blubbern | Status | 76 / 60 / 72 / 46 | Giftschlamm, Finsterschlag, Ränke, **Pechblase** | entwickelt |
| 6 | Kolkwicht | Dunkel | → Rabenmuhme (Lv 25) | struppiger Rabengeist mit Strohhut-Rest, sammelt verlorene Knöpfe | Support | 50 / 44 / 48 / 50 | Pickser, Schattenbiss, Heuler, **Knopfklau** (Dunkel 40, stiehlt eine Wertsteigerung) | Kapelle, Friedhofsmauer; gelegentlich (8 %) |
| 7 | Rabenmuhme | Dunkel/Psycho | Stufe 2 | alte Rabenfrau aus Schatten mit Federschal, eine Laterne in der Kralle | Support | 74 / 58 / 70 / 60 | Finsterschlag, Traumblick, Waldsegen, **Muhmenrat** (Status: eigene Vert. +1, heilt ¼) | entwickelt |
| 8 | Wurzelschrat | Dunkel/Pflanze | einzeln | knorriger Waldschrat aus Wurzeln, Augen wie zwei Glühwürmchen im Astloch | Bruiser | 80 / 82 / 66 / 30 | Wurzelhieb, Finsterschlag, Härten, **Knorrenfalle** (Pflanze 70, senkt Init.) | Torfstich, alte Baumstümpfe; selten (4 %) |
| 9 | Grottenmaul | Dunkel/Stein | einzeln | Höhlenwesen wie ein bemoostes Felsmaul, schläft mit offenem Mund, darin Glimmsteine | Tank | 78 / 66 / 94 / 24 | Kieselhagel, Schattenbiss, Einrollen, **Schlundfalle** (Dunkel 60, Gegner kann 2 Runden nicht tauschen) | Klippenhöhle, nach der Quantum-Geschichte; selten (3 %) |
| 10 | Neumondhirschkäfer | Dunkel/Käfer | einzeln (Sondergeist) | grosser Hirschkäfer mit Geweih wie ein Neumond-Sichelpaar, schwarzer Panzer mit Sternenstaub | Bruiser | 78 / 98 / 82 / 54 | Käferbiss, Finsterschlag, Kampfschrei, **Neumondzange** (Dunkel 90, Volltreffer häufiger) | Aschehang bei Neumond; Sondergeist (sehr selten) |

## 5. Balance-Notizen

- Doppeltypen (nachgerechnet mit der Tabelle oben): Drache/Stein anfällig für Kampf, Boden, Drache (Wasser/Pflanze heben sich auf 1×); Drache/Feuer für Boden, Stein, Drache; Drache/Pflanze für Gift, Käfer, Drache; Dunkel/Kampf nur für Kampf (Käfer hebt sich auf; Psycho trifft ½× · 2× = 1×); Dunkel/Psycho (Rabenmuhme) nur für Käfer, dafür 4×, und widersteht Psycho ¼× (Dunkel trifft ihn neutral); Dunkel/Gift nur für Boden; Dunkel/Pflanze für Feuer, Gift, Kampf und Käfer 4×; Dunkel/Stein für Wasser, Pflanze, Boden, Käfer und Kampf 4×; Dunkel/Käfer für Feuer, Stein, Käfer.
- Reine Drachen sind die gefährlichste Kombination; deshalb sind alle Drachen selten und erst ab dem Moorherz/Aschehang zu finden.
- Seit Psycho → Dunkel nur noch ½× ist, gibt es keine Psycho-Immunität mehr: Nachtmahr- und Kaspar-Kampf bleiben auch mit einem frühen Dunkel-Geist gewinnbar (der Gegner macht weniger Schaden, wird aber nicht wehrlos). Die Fundorte ab Torfstich-Nacht/Kapelle bleiben als Empfehlung für die Balance, sind aber keine harte Voraussetzung mehr.
- Rollen-Werte folgen dem bestehenden Muster (Tank: höchste Vert., Speedster: höchste Init., Bruiser/Sweeper: hoher Angriff).
