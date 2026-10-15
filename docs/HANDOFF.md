# Handoff – fit-einkauf

Letzte Aktualisierung: 2026-10-15 (Sitzung 4)

## Aktueller Stand

| Schritt | Status |
|---|---|
| 1. Brainstorming + Design-Dokument | ✅ fertig, freigegeben |
| 2. Rezept-Startset | ✅ fertig, freigegeben |
| 3. UI-Grundlage mit impeccable | ✅ fertig (Review: ship) |
| 4. Umsetzungsplan (writing-plans) + Revision nach Review | ✅ fertig |
| 5a. Scheibe 1: Training am iPhone | ✅ live auf https://peppdoe.github.io/fit-einkauf/ |
| 5b. Task 23A Startseite „Heute“ | ✅ |
| 5c. Scheibe 2 Essen & Einkauf, Scheibe 3 Gewicht & Mehr, Task 23B | ✅ |
| 5d. Scheibe 4 Übungsfiguren: Task 9 + Task 12 (34 Figuren, vom Nutzer freigegeben) | ✅ |
| 5d. Task 16 (Figur in der Übungskarte, „So geht's“-Blatt) | ✅ umgesetzt, Review-Runden 1–3 eingearbeitet, **Freigabe offen** |
| 5e. Abschluss (Task 22) | ⏭️ als Nächstes, erst nach Review-OK zu Task 16 |
| Phase 2: Aktions-Check, Donnerstags-Aufgabe, Markt-Logik | später |

Alle Bereiche laufen: Heute (Wochenkalender, Zusammenfassung, Essen/Einkauf/Gewicht), Training (4er-Rotation, Supersätze, Progression, gespeicherte Pause), Essen (Wochenplan, Bibliothek, Rezept), Einkauf (nach Markt/Rezept), Mehr (Gewicht, Ziele, Jause-Tage, Abneigungen, Training, Daten). Offline-fähig, installierbar. 145 Tests grün. Repo öffentlich: github.com/peppdoe/fit-einkauf (GitHub Pages aus `main`; jeder Push geht live).

## Wichtige Dateien

- `projekt-brief.md` – ursprüngliche Spezifikation (nicht im Repo, steht in `.gitignore`, weil das Repo öffentlich wird und der Brief Körperdaten enthält)
- `docs/superpowers/specs/2026-10-14-fit-einkauf-mvp-design.md` – freigegebenes MVP-Design (Architektur, Datenstruktur, Logik, Ansichten, Tests)
- `docs/rezepte-startset.md` – freigegebene Rezepte, Jausen, Snack, Kalorien-Extras mit Mengen und Nährwerten
- `PRODUCT.md` – Produktkontext für impeccable (Nutzer, Situationen, Tonfall, gewählte visuelle Haltung)
- `DESIGN.md` (+ `.impeccable/design.json`) – Design-System: Farben mit Bedeutung, Typo, Abstände, Komponenten, Regeln
- `css/tokens.css`, `css/komponenten.css`, `bilder/symbole.svg` – UI-Grundlage, wird von der App direkt verwendet
- `muster/training.html`, `muster/komponenten.html` (+ `muster.js`, nur Demo) – Musterseiten; Vorlage für die Ansichten in Schritt 5
- `.impeccable/surfaces/muster-training-html.md` – Richtungsvertrag der UI

## Entscheidungen

**Technik**
- Gerät: iPhone, Safari, PWA am Homescreen
- HTML, CSS und JavaScript (ES-Module), kein Framework, kein Build-Schritt
- Tests: Vitest, nur lokal (Node 24 vorhanden)
- Daten lokal in `localStorage["fitEinkauf"]`, Export/Import als JSON, Erinnerung nach 14 Tagen ohne Export
- Hosting: GitHub Pages, Repo `fit-einkauf` (öffentlich), GitHub-User peppdoe

**Training**
- Rotation nach Ablauf (immer die nächste Einheit, verpasste Tage verschieben nichts), seit Review 4 schwere Einheiten: Oberkörper A · Beine · Oberkörper B · Beine & Core; Supersätze Drücken ⇄ Ziehen bzw. Beine ⇄ Hüfte, Pause erst nach dem Paar; Mobilität als 5-min-Block am Ende jeder Einheit; Drücken:Ziehen 1:1
- Wochenvorschau auf „Heute“: nach jeder Einheit ein Ruhetag (ca. 4 Einheiten pro Woche); nur Anzeige, die Rotation selbst läuft weiter nach Ablauf
- Export-Erinnerung erscheint auf Heute, Training und Mehr
- Klimmzug-Kette beginnt mit Negativ-Klimmzug und Chin-up; Stange standardmäßig an
- Steigerung: Ziel in allen Sätzen an 2 aufeinanderfolgenden schweren Einheiten → Vorschlag, Bestätigung per Tipp; dazu „zu schwer“ / „zu leicht“
- Pausen-Timer: Endzeit im Zustand (übersteht Neuladen), Ton auch bei Lautlos-Schalter (audioSession), Leiste blinkt am Ende
- Schalter „Stange vorhanden“: Tischrudern-Kette ↔ Klimmzug-Kette

**Essen und Einkauf**
- Abendgerichte: 4 Portionen pro Kochrunde (2 Abende)
- Jause ist eigenständig (nicht die Abendreste), baustellentauglich: kalt essbar, kein Aufwärmen, möglichst ohne Kühlung. Herkunft: mitnehmen / Spar / Reste
- Fixer Snack (Skyr-Bowl) + täglich ein Kalorien-Extra (neuer Rezept-Typ `extra`), um das Ziel von 2.950 kcal zu erreichen
- Ziele nur kcal und Protein (Fett/KH gestrichen); typischer Tag = Wochensumme ÷ 7; Einstellung Jause-Tage (Standard 4)
- Wochenplan wählt der Nutzer selbst aus der Bibliothek (automatische Auswahl kommt in Phase 2)
- Markt-Zuordnung: Standard-Markt pro Zutat (Lidl / Hofer / Spar / egal), in der App änderbar
- Grundvorrat markiert, per Schalter ausblendbar, „aufgebraucht“ bringt ihn zurück auf die Liste
- Abneigungen (Start: Curry, Tofu) filtern Rezepte; in der App pflegbar

**UI (Schritt 3)**
- Bewusst gewählt: iOS-Standard ohne Ironie; Messlatte Apple Fitness/Health, Things 3, Erinnerungen
- Name am Homescreen „Fit & Einkauf“; Tonfall Du, knapp, bei Erfolgen kurze Anfeuerung („Stark – nächste Stufe?“)
- Eine Farbe = eine Bedeutung: Blau Aktion, Grün erreicht, Orange nur „Pause läuft“, Rot zerstörend/Aktion; Marktfarbe nur am Markt-Punkt
- Großer Titel = heutige Einheit; Pausen-Leiste an die Tab-Leiste angedockt, 52-px-Ziffern; Rückfragen inline statt Dialog

**Gewicht**
- Gewichts-Log im MVP: Wochenschnitt, Trend pro Monat, Empfehlung ±150 kcal (Trend > +0,75 kg/Monat → −150; < +0,25 → +150), Übernahme nur per Tipp

## Nächste Schritte

1. **Freigabe Task 16 abwarten (Review-Runde 3 eingearbeitet):** Screenshots in `fotos/`: `figur-karte-hell/-dunkel`, `so-gehts-hell/-dunkel`, `figuren-klimmzug-hell/-dunkel` (Stufen 1–5), `figuren-klimmzug-2` (L-Sit, Archer). `fotos/` ist nicht im Repo. Erst nach OK mit Task 22 beginnen.
   - Stand der Figuren-Darstellung (`js/logik/figur.js`):
     - **Kopf:** optionaler Halswinkel `hals` je Pose (sonst Rumpfachse). Der Kopf wird zuletzt gezeichnet, innen in Hintergrundfarbe (`--figur-grund`, Standard `--zelle`): Was ihn berührt (Arm im Hang, Stange), liegt dahinter; der Kreis bleibt geschlossen, nichts wird ausgestanzt. `--figur-grund` setzen: `.figur-mini` (`--zelle-2`), Prüfseite (`--zelle-2`); im Blatt gilt `--zelle`.
     - **Zweiter Arm an der Stange** (`arm2` bei Gerät `stange`, nur Archer) wird so kräftig wie der Körper gezeichnet; sonst bleibt die zweite Seite blass (45 %).
     - **Ausschnitt** `ausschnitt(figur, rand = 3)`: quadratisch, eng um beide Posen (gleicher Ausschnitt für Start und Ende, sonst springen Figur und Stange), Stange immer drin, Boden nur, wenn die Figur darauf steht/sitzt/liegt. Klimmzüge füllen so 65–79 % der Kästchenhöhe; mehr geht mit gemeinsamem Ausschnitt nicht (Bewegungsweg ca. 23 Einheiten). Flache Übungen füllen die Breite. Kästchen 96 px, Strich sichtbar 2,8 px.
   - Posen (`tools/figuren.mjs`): gemeinsame Hang-Pose `klimmzug.start` mit `r: -100`, `hals: -130`, Hand bei x = 73 (Arm 3,2 Einheiten vom Kopfkreis, Mittellinie; mehr geht bei Halslänge 9 nicht). Gilt für Klimmzug, Chin-up, L-Sit, Archer-Start und Negativ-Klimmzug (umgedreht). Archer-Ende: Schulter (54, 26) 10 unter der Stange, ziehende Hand x 46 (Ellbogen unten), gestreckter Arm zur Hand x ≈ 81 mit 20° Anstieg. Alle Posen bestehen `pruefeFigur` (`figurOk` true).
   - Blatt (`css/komponenten.css`): Hintergrund `--blatt-grund`, Zellen darin `--blatt-zelle` (neue Tokens; hell wie bisher #F2F2F7/#FFF, dunkel erhöht #1C1C1E/#2C2C2E, damit Oberkante und Ecken sichtbar sind). Tab-Leiste bei offenem Blatt ausgeblendet (`body.blatt-offen`), unten `calc(24px + env(safe-area-inset-bottom))`.
   - Übungskarte: Titel bricht neben der Figur um (`min-width: 0`, Silbentrennung). `.impeccable/config.json`: Ausnahme `monotonous-spacing` nur für `muster/figuren.html`.
   - Umgesetzt: `js/ansichten/figur-ansicht.js` (`figurMini`, `soGehtsOeffnen`), Aktion `so-gehts` in `training.js`, Stile am Ende von `komponenten.css`, Eintrag in `sw.js`. Test `tests/figur-ansicht.test.js` prüft u. a., dass eine fehlerhafte Figur (`figurOk` false) nicht angezeigt wird (läuft über `aufloesen` → `figur: null`).
   - Abweichung vom Plan: Die Überblendung nutzt zwei passende Keyframes statt `reverse`. Mit `reverse` waren am Ende jedes Durchlaufs beide Posen kurz unsichtbar.
   - Fotos vom Blatt: Headless-Edge lässt CSS-Animationen bei t = 0 stehen, das Blatt wäre dann noch unten. Deshalb mit `--force-prefers-reduced-motion` fotografieren und die Figur per kleiner Hilfsseite antippen (Hilfsseite danach gelöscht).
2. **Task 22 Abschluss:** Fotorunde inkl. `#/heute`, Vorlagen `muster/training.html`, `muster/komponenten.html`, `muster/muster.js`, `muster/heute.html`, `muster/heute.js` löschen (`muster/figuren.html` bleibt als Prüfseite), DESIGN.md ergänzen.
3. Am Ende jeder Sitzung diese Datei aktualisieren.

**Figuren ändern:** Posen stehen als Gelenkpunkte in `tools/figuren.mjs`; `node tools/figuren.mjs` schreibt sie nach `data/uebungen.json`. Prüfseite: `npm run serve`, dann `http://127.0.0.1:8765/muster/figuren.html`. Stange liegt bei y = 15 (Kopf oben ganz über der Stange).

## Offene Punkte

- **iPhone-Test offen:** App installieren und prüfen: Ton bei Lautlos-Schalter, Bildschirm bleibt an, Pause nach Sperren/Neuladen, Export über Teilen-Blatt, SF-Pro-Darstellung, Startseite Heute, Einkauf abhaken, Übungsfigur antippen („So geht's“-Blatt, Tab-Leiste muss verschwinden, unten Abstand zum Home-Indikator).

- Startstufen der Übungsketten werden beim ersten Training über „zu leicht“ / „zu schwer“ angepasst
- Nach 3–4 Wochen: Trainingsplan und kcal-Ziel an die Realität anpassen
