---
version: 1
slug: "muster-training-html"
primary_target: "index.html"
related_targets: ["js/ansichten/training.js","css/tokens.css","css/komponenten.css"]
---

# Surface: UI-Grundlage (Tokens, Komponenten, Trainings-Musterbildschirm)

Scope: `css/tokens.css`, `css/komponenten.css`, die App (`index.html`, `js/ansichten/`). Die Musterseiten `muster/training.html` und `muster/komponenten.html` waren die Vorlage und wurden in Task 22 gelöscht (Stand in der Git-Historie). Visitor mode: Operate. Build path: code-led.

Audience/job: eine Person, iPhone-PWA. Training abends (Handy am Boden, 1–2 m), Supermarkt (eine Hand, Neonlicht), Planung am Sofa.

Constraints: Tipp-Flächen ≥ 48 px, Aktionen in der Daumenzone, Hell/Dunkel nach System, kein Build-Schritt, offline (keine gehosteten Fonts).

Unresolved: App-Icon; ob Essen und Einkauf eigene Tint-Farben bekommen (vorerst eine App-Tint).

## Direction contract

THESIS: Der iOS-Standard, gespielt ohne Ironie, auf dem Niveau von Apple Fitness, Things 3 und Erinnerungen. Abgelehnt wird die Fitness-App-Kategorie (Schwarz, Neon, Ringe, Gamification) und die Web-App mit eigenwilligen Steuerelementen.

OWN-WORLD: iOS-Systemfarben (gruppierter Hintergrund #F2F2F7 / #000, Zellen #FFF / #1C1C1E), App-Tint Systemblau, Grün = erreicht/erledigt, Orange = Pause läuft, Rot = zerstörend. Märkte als Erinnerungen-Listenfarben (Lidl Blau, Hofer Orange, Spar Grün, egal Grau). SF Pro für Text, SF Pro Rounded (`ui-rounded`) nur für große Messzahlen. Gruppierte Inset-Listen, Haarlinien, runde Abhak-Kreise, Material-Unschärfe nur in Tab-Leiste und Pausen-Leiste.

STORY: Öffnen → sofort „Heute: Oberkörper A“ → Satz mit −/+ anpassen → „Satz fertig“ → Pause läuft unten mit → nächste Übung. Am Ende: „Stark – nächste Stufe?“ inline bestätigen.

FIRST VIEWPORT: Großer Titel ist die heutige Einheit (laut STORY „Heute: Oberkörper A“), Untertitel „Heute · Einheit 1 von 6 · schwer · Übung 1 von 3“; „Training“ steht in der Tab-Leiste. Gruppierte Karte der aktuellen Übung: Name, Ziel, drei Satz-Felder, darunter Zähler mit 64-px-Rundziffer zwischen zwei 64-px-Tasten, volle Breite „Satz fertig“ (gefüllt, Tint). Unter der Karte „Stufe zu schwer / zu leicht“ als schlichte Textknöpfe. Danach Liste „Als Nächstes“. An die Tab-Leiste angedockt die Pausen-Leiste (Live-Activity-Stil, 52-px-Rundziffern, Balken läuft leer). Tab-Leiste unten mit vier SVG-Symbolen.

FORM: Kategorie-Standard (Canon), vom Nutzer gewählt; nicht aus der gewürfelten Liste. Seed key ccd6d110. Signatur: die Pausen-Leiste über der Tab-Leiste, deren Balken in Echtzeit leerläuft.

FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance
