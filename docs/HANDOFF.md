# Handoff – fit-einkauf

Letzte Aktualisierung: 2026-10-14 (Sitzung 1)

## Aktueller Stand

| Schritt | Status |
|---|---|
| 1. Brainstorming + Design-Dokument | ✅ fertig, freigegeben |
| 2. Rezept-Startset | ✅ fertig, freigegeben |
| 3. UI-Grundlage mit impeccable | ⏭️ als Nächstes |
| 4. Umsetzungsplan (writing-plans) | offen |
| 5. Umsetzung (TDD + Prüfung im mobilen Viewport) | offen |
| Phase 2: Aktions-Check, Donnerstags-Aufgabe, Markt-Logik | später |

Noch kein Code. Git-Repo lokal angelegt (Branch `main`, Identität repo-lokal: peppdoe / haringmarc7@icloud.com). Noch kein GitHub-Remote.

## Wichtige Dateien

- `projekt-brief.md` – ursprüngliche Spezifikation (nicht im Repo, steht in `.gitignore`, weil das Repo öffentlich wird und der Brief Körperdaten enthält)
- `docs/superpowers/specs/2026-10-14-fit-einkauf-mvp-design.md` – freigegebenes MVP-Design (Architektur, Datenstruktur, Logik, Ansichten, Tests)
- `docs/rezepte-startset.md` – freigegebene Rezepte, Jausen, Snack, Kalorien-Extras mit Mengen und Nährwerten

## Entscheidungen

**Technik**
- Gerät: iPhone, Safari, PWA am Homescreen
- HTML, CSS und JavaScript (ES-Module), kein Framework, kein Build-Schritt
- Tests: Vitest, nur lokal (Node 24 vorhanden)
- Daten lokal in `localStorage["fitEinkauf"]`, Export/Import als JSON, Erinnerung nach 14 Tagen ohne Export
- Hosting: GitHub Pages, Repo `fit-einkauf` (öffentlich), GitHub-User peppdoe

**Training**
- Rotation nach Ablauf (immer die nächste Einheit, verpasste Tage verschieben nichts), 6 Einheiten: Oberkörper A schwer · Beine schwer · Mobilität & Core leicht · Oberkörper B schwer · Beine & Core leicht · Mobilität leicht
- Leichte Einheiten: 2 Sätze, zählen nicht für die Progression
- Steigerung: Ziel in allen Sätzen an 2 aufeinanderfolgenden schweren Einheiten → Vorschlag, Bestätigung per Tipp; dazu „zu schwer“ / „zu leicht“
- Pausen-Timer im MVP (90 s schwer, 60 s leicht, änderbar)
- Schalter „Stange vorhanden“: Tischrudern-Kette ↔ Klimmzug-Kette

**Essen und Einkauf**
- Abendgerichte: 4 Portionen pro Kochrunde (2 Abende)
- Jause ist eigenständig (nicht die Abendreste), baustellentauglich: kalt essbar, kein Aufwärmen, möglichst ohne Kühlung. Herkunft: mitnehmen / Spar / Reste
- Fixer Snack (Skyr-Bowl) + täglich ein Kalorien-Extra (neuer Rezept-Typ `extra`), um das Ziel von 2.950 kcal zu erreichen
- Wochenplan wählt der Nutzer selbst aus der Bibliothek (automatische Auswahl kommt in Phase 2)
- Markt-Zuordnung: Standard-Markt pro Zutat (Lidl / Hofer / Spar / egal), in der App änderbar
- Grundvorrat markiert, per Schalter ausblendbar, „aufgebraucht“ bringt ihn zurück auf die Liste
- Abneigungen (Start: Curry, Tofu) filtern Rezepte; in der App pflegbar

**Gewicht**
- Gewichts-Log im MVP: Wochenschnitt, Trend pro Monat, Empfehlung ±150 kcal (Trend > +0,75 kg/Monat → −150; < +0,25 → +150), Übernahme nur per Tipp

## Nächste Schritte

1. **Schritt 3 – UI-Grundlage mit `impeccable:impeccable`:** Design-Kontext festlegen (Handy zuerst, schnelle Bedienung beim Training und im Supermarkt, Tipp-Flächen ≥ 48 px, Daumenzone unten), Design-Tokens (Farben, Typo, Abstände, Hell/Dunkel), Kernkomponenten (Tab-Leiste, Satz-Zähler mit −/+, Timer, Listenzeile zum Abhaken, Schalter).
2. **Schritt 4 – Umsetzungsplan mit `superpowers:writing-plans`:** nur MVP (Training mit Progression und Logging, Einkaufsliste nach Markt und nach Rezept, Rezept-Ansicht, Grundvorrat-Filter, Gewichts-Log, Einstellungen, Export/Import). Danach die Ausführungsart wählen (inline oder mit Subagents).
3. **Schritt 5 – Umsetzung:** TDD für `js/logik/*` und `speicher.js`; vor jeder Fertigmeldung `verification-before-completion` im eingebauten Browser bei 375×812.
4. Vor dem ersten Deployment: GitHub-Repo `peppdoe/fit-einkauf` anlegen und GitHub Pages aktivieren. Vorher nachfragen, weil das veröffentlicht.
5. Am Ende jeder Sitzung diese Datei aktualisieren.

## Offene Punkte

- Startstufen der Übungsketten werden beim ersten Training über „zu leicht“ / „zu schwer“ angepasst
- Nach 3–4 Wochen: Trainingsplan und kcal-Ziel an die Realität anpassen
