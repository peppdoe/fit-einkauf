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
| 5d. Task 16 (Figur in der Übungskarte, „So geht's“-Blatt) | ✅ umgesetzt, Review-Runde 1 eingearbeitet, **Review-Runde 2 offen** |
| 5e. Abschluss (Task 22) | ⏭️ als Nächstes, erst nach Review-OK zu Task 16 |
| Phase 2: Aktions-Check, Donnerstags-Aufgabe, Markt-Logik | später |

Alle Bereiche laufen: Heute (Wochenkalender, Zusammenfassung, Essen/Einkauf/Gewicht), Training (4er-Rotation, Supersätze, Progression, gespeicherte Pause), Essen (Wochenplan, Bibliothek, Rezept), Einkauf (nach Markt/Rezept), Mehr (Gewicht, Ziele, Jause-Tage, Abneigungen, Training, Daten). Offline-fähig, installierbar. 142 Tests grün. Repo öffentlich: github.com/peppdoe/fit-einkauf (GitHub Pages aus `main`; jeder Push geht live).

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

1. **Review Task 16, Runde 2 abwarten:** Screenshots `fotos/figur-karte-hell.png`, `fotos/figur-karte-dunkel.png`, `fotos/so-gehts-hell.png`, `fotos/so-gehts-dunkel.png`, `fotos/figuren-klimmzug-hell.png`, `fotos/figuren-klimmzug-dunkel.png`, `fotos/figuren-klimmzug-2.png` liegen beim Nutzer. Erst nach OK mit Task 22 beginnen.
   - Runde 1 (Nutzer-Review) eingearbeitet:
     1. Klimmzug-Arme: Im Profil kreuzt ein Hang-Arm geometrisch immer den Kopf (Kopfmitte 9 über der Schulter). Lösung: Klimmzug-Posen leicht zurückgelehnt (`r: -100`), Hände vor dem Gesicht auf der Stange. Kreuzt der vordere Arm den Kopf, zeichnet `poseZuSvg` ihn obenauf mit Rand in Hintergrundfarbe (`--figur-grund`, Standard `--zelle`). Betrifft nur Figuren, deren Arm den Kopf schneidet. L-Sit und Archer nutzen die neuen Posen; Archer: Start normaler Hang, Ende zieht vorn, zweiter Arm gestreckt weiter vorn (`hand2: [86, 16]`).
     2. Dunkelmodus: Strichfarbe war schon gleich (`--text`); unsichtbar war nur der eingefrorene Überblendungs-Moment im Foto (alte `reverse`-Animation). Jetzt im Foto klar weiß.
     3. Kästchen 96 px, `ausschnitt(figur)` in `figur.js` schneidet die viewBox quadratisch auf beide Posen zu (85 %, Boden kommt mit, wenn er knapp darunter liegt); Strich sichtbar 2,8 px (`poseZuSvg(pose, geraet, strich)`). Titel daneben bricht um (`min-width: 0`, Silbentrennung).
     4. Blatt offen → `body.blatt-offen`, Tab-Leiste `visibility: hidden` (gilt für alle Blätter, auch Einkauf). Blatt-Hintergrund `--grund` war schon deckend, unten `calc(24px + env(safe-area-inset-bottom))`.
   - Offen für Runde 2: Beim Archer-Ende liegt der gestreckte Arm fast auf der Stange (Schulter oben auf Stangenhöhe), daher nur schwach zu sehen.
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
