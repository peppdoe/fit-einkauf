# Handoff – fit-einkauf

Letzte Aktualisierung: 2026-10-14 (Sitzung 3)

## Aktueller Stand

| Schritt | Status |
|---|---|
| 1. Brainstorming + Design-Dokument | ✅ fertig, freigegeben |
| 2. Rezept-Startset | ✅ fertig, freigegeben |
| 3. UI-Grundlage mit impeccable | ✅ fertig (Review: ship) |
| 4. Umsetzungsplan (writing-plans) + Revision nach Review | ✅ fertig |
| 5a. Scheibe 1: Training am iPhone | ✅ gebaut, ⏸️ wartet auf OK für Deployment |
| 5b. Scheibe 2 Essen & Einkauf · 3 Gewicht & Mehr · 4 Übungsfiguren · Abschluss | offen |
| Phase 2: Aktions-Check, Donnerstags-Aufgabe, Markt-Logik | später |

Scheibe 1 steht: Training mit 4er-Rotation, Supersätzen, Progression, gespeicherter Pause, Verlauf; Mehr mit Pause, Stange, Export/Import; offline-fähig (Service Worker), installierbar. 69 Tests grün. Git-Repo lokal angelegt (Branch `main`, Identität repo-lokal: peppdoe / haringmarc7@icloud.com). Noch kein GitHub-Remote.

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

1. **Deployment Scheibe 1** (nur nach OK des Nutzers): GitHub-Repo `peppdoe/fit-einkauf` (öffentlich, Nutzer hat zugestimmt) anlegen, pushen, GitHub Pages aktivieren. Dann am iPhone in Safari öffnen → „Zum Home-Bildschirm“ → nur die installierte App benutzen (eigener Speicher).
2. Am iPhone prüfen: Ton bei Lautlos, Bildschirm bleibt an, Pause nach Sperren/Neuladen, Export über Teilen-Blatt, SF-Pro-Darstellung.
3. Scheibe 2–4 und Abschluss nach `docs/superpowers/plans/2026-10-14-fit-einkauf-mvp.md` (Abschnitt „Revision nach Review“ zuerst lesen). Umsetzung direkt, ohne Subagents.
4. Am Ende jeder Sitzung diese Datei aktualisieren.

## Offene Punkte

- Startstufen der Übungsketten werden beim ersten Training über „zu leicht“ / „zu schwer“ angepasst
- Nach 3–4 Wochen: Trainingsplan und kcal-Ziel an die Realität anpassen
