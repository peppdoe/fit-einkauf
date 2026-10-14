# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Stack

Statisches HTML, CSS und JavaScript (ES-Module), kein Framework, kein Build-Schritt. PWA am iPhone-Homescreen (Safari, standalone). Hosting auf GitHub Pages. Tests mit Vitest, nur lokal. Festgelegt im MVP-Design (`docs/superpowers/specs/2026-10-14-fit-einkauf-mvp-design.md`).

## Users

Eine Person (der Entwickler selbst), wohnt allein in Österreich, arbeitet tagsüber auf der Baustelle. Trainiert täglich 15–30 min Calisthenics zuhause auf der Matte (später Klimmzugstange, später Park), kocht abends einfache Gerichte doppelt und kauft Freitag/Samstag groß bei Lidl, Hofer oder Spar ein.

## Product Purpose

Eine kostenlose, persönliche App, die drei Alltagsaufgaben ohne Nachdenken erledigt: die heutige Trainingseinheit mit Progression loggen, den Wochen-Essensplan aus einer selbst gepflegten Rezept-Bibliothek zusammenstellen und die passende Einkaufsliste im Markt abhaken. Ziel: Muskelaufbau mit rund 2.950 kcal und 130 g Protein pro Tag, gesünder und günstiger essen. Erfolg heißt: Einheit in einem Tipp offen, Satz mit großen Tasten geloggt, Liste im Markt mit dem Daumen abgehakt.

## Positioning

Keine allgemeine Fitness- oder Rezept-App, sondern ein Werkzeug, das genau einen Menschen, seine Rotation, seine Rezepte und seine drei Märkte kennt. Die Bibliothek wird bewusst von Hand gepflegt, nichts wird automatisch eingefügt. Daten bleiben am Handy.

## Operating Context

- **Training abends im Wohnzimmer:** Handy liegt auf dem Boden neben der Matte, verschwitzte Finger, Blick oft aus 1–2 m Entfernung. Pausen-Timer muss aus Distanz lesbar sein, Bildschirm bleibt an (Wake Lock).
- **Supermarkt:** eine Hand am Wagen, helles Neonlicht, schnelles Abhaken mit dem Daumen, Liste nach Markt und Kategorie (Laufweg).
- **Planung am Sofa:** Wochenplan und Rezepte in Ruhe durchsehen, kcal und Protein gegen das Tagesziel vergleichen.
- Sprache Deutsch mit österreichischen Begriffen (Topfen, Faschiertes, Semmel, Jause, Kornspitz). Euro.

## Capabilities and Constraints

- Vier Bereiche in einer Tab-Leiste unten: Training · Essen · Einkauf · Mehr.
- Offline-fähig (Service Worker), Daten in `localStorage`, Export/Import als JSON.
- Tipp-Flächen mindestens 48 px, wichtige Aktionen in der Daumenzone unten.
- iOS-Web kann nicht vibrieren: Timer-Ende optisch und mit Ton.
- Hell- und Dunkelmodus nach Systemeinstellung.
- Phase 2 (nicht MVP): Aktions-Check, Markt-Logik, Vorschläge-Bereich, Park-Modus.

## Brand Commitments

- Name am Homescreen: **Fit & Einkauf**.
- Tonfall: Du-Form, knapp und sachlich, bei Erfolgen eine kurze Anfeuerung (z. B. „Stark – nächste Stufe?“). Keine langen Motivationssprüche.
- Visuelle Haltung (2026-10-14 bewusst gewählt): der iOS-Standard, ohne Ironie und ohne eingeschmuggelte Eigenheiten. Die App soll sich anfühlen wie aus demselben Haus wie Apple Fitness/Health, Things 3 und Apple Erinnerungen. Deren Verarbeitungsqualität ist die Messlatte.
- Nicht gewünscht: typischer Fitness-App-Look (Schwarz mit Neon, Gamification), verspielt/bunt, nüchtern-tabellarisch ohne Charakter.

## Evidence on Hand

- Freigegebene Rezepte, Jausen, Snack und Extras mit Nährwerten: `docs/rezepte-startset.md`.
- Übungsketten und Trainingsrotation: im MVP-Design, Abschnitt 4.3/4.4.
- Kein Logo, keine Icons, keine Fotos vorhanden.

## Product Principles

1. Ein Tipp zur heutigen Aufgabe: die App öffnet dort, wo man gerade ist, und zeigt das Nächste.
2. Bedienbar mit einem Daumen, verschwitzten Fingern und aus Armlänge.
3. Vorschlagen statt automatisch ändern: Progression, kcal-Anpassung und Plan werden per Tipp bestätigt.
4. Zahlen zählen: kcal, Protein, Wiederholungen und Sekunden sind die wichtigsten Inhalte und müssen sofort lesbar sein.
5. Gehört dem Nutzer: offline, lokal, exportierbar, kostenlos.

## Accessibility & Inclusion

Große Tipp-Flächen (≥ 48 px), hoher Kontrast unter Neonlicht und abends, Timer und Zähler aus 1–2 m lesbar. Bewegung reduzieren bei `prefers-reduced-motion`.
