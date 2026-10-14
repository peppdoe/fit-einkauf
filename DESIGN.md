---
name: Fit & Einkauf
description: Persönliche iPhone-PWA für Training, Essensplan und Einkauf, gebaut im iOS-Standard ohne Ironie.
colors:
  grund: "#F2F2F7"
  zelle: "#FFFFFF"
  zelle-2: "#F2F2F7"
  zelle-gedrueckt: "#E5E5EA"
  material: "rgba(249, 249, 249, 0.82)"
  haarlinie: "rgba(60, 60, 67, 0.29)"
  text: "#000000"
  text-2: "#6C6C70"
  text-3: "#8E8E93"
  text-auf-tint: "#FFFFFF"
  tint: "#0066CC"
  tint-flaeche: "#0066CC"
  tint-zart: "rgba(0, 102, 204, 0.12)"
  erreicht: "#1A7431"
  erreicht-flaeche: "#34C759"
  erreicht-zart: "rgba(52, 199, 89, 0.14)"
  pause: "#9A4A00"
  pause-flaeche: "#FF9500"
  pause-zart: "rgba(255, 149, 0, 0.16)"
  gefahr: "#D70015"
  gefahr-zart: "rgba(255, 59, 48, 0.12)"
  markt-lidl: "#0066CC"
  markt-hofer: "#FF9500"
  markt-spar: "#34C759"
  markt-egal: "#8E8E93"
typography:
  grosstitel:
    fontFamily: "-apple-system, BlinkMacSystemFont, SF Pro Text, Segoe UI, Roboto, Helvetica Neue, Arial, sans-serif"
    fontSize: "2.125rem"
    fontWeight: 700
    lineHeight: 1.2
    letterSpacing: "0.01em"
  titel2:
    fontFamily: "-apple-system, BlinkMacSystemFont, SF Pro Text, Segoe UI, Roboto, Helvetica Neue, Arial, sans-serif"
    fontSize: "1.375rem"
    fontWeight: 700
    lineHeight: 1.27
  titel3:
    fontFamily: "-apple-system, BlinkMacSystemFont, SF Pro Text, Segoe UI, Roboto, Helvetica Neue, Arial, sans-serif"
    fontSize: "1.25rem"
    fontWeight: 600
    lineHeight: 1.25
  kopf:
    fontFamily: "-apple-system, BlinkMacSystemFont, SF Pro Text, Segoe UI, Roboto, Helvetica Neue, Arial, sans-serif"
    fontSize: "1.0625rem"
    fontWeight: 600
    lineHeight: 1.3
  text:
    fontFamily: "-apple-system, BlinkMacSystemFont, SF Pro Text, Segoe UI, Roboto, Helvetica Neue, Arial, sans-serif"
    fontSize: "1.0625rem"
    fontWeight: 400
    lineHeight: 1.3
    fontFeature: "tnum"
  unter:
    fontFamily: "-apple-system, BlinkMacSystemFont, SF Pro Text, Segoe UI, Roboto, Helvetica Neue, Arial, sans-serif"
    fontSize: "0.9375rem"
    fontWeight: 400
    lineHeight: 1.33
  fuss:
    fontFamily: "-apple-system, BlinkMacSystemFont, SF Pro Text, Segoe UI, Roboto, Helvetica Neue, Arial, sans-serif"
    fontSize: "0.8125rem"
    fontWeight: 400
    lineHeight: 1.38
  klein:
    fontFamily: "-apple-system, BlinkMacSystemFont, SF Pro Text, Segoe UI, Roboto, Helvetica Neue, Arial, sans-serif"
    fontSize: "0.75rem"
    fontWeight: 400
    lineHeight: 1.33
  zahl-gross:
    fontFamily: "ui-rounded, SF Pro Rounded, -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, sans-serif"
    fontSize: "4rem"
    fontWeight: 600
    lineHeight: 1
    letterSpacing: "-0.01em"
    fontFeature: "tnum"
  zahl-pause:
    fontFamily: "ui-rounded, SF Pro Rounded, -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, sans-serif"
    fontSize: "3.25rem"
    fontWeight: 600
    lineHeight: 1
    letterSpacing: "-0.01em"
    fontFeature: "tnum"
  zahl-mittel:
    fontFamily: "ui-rounded, SF Pro Rounded, -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, sans-serif"
    fontSize: "1.75rem"
    fontWeight: 600
    lineHeight: 1
    fontFeature: "tnum"
rounded:
  r-feld: "10px"
  r-zelle: "12px"
  r-knopf: "12px"
  r-material: "18px"
spacing:
  a-1: "4px"
  a-2: "8px"
  a-3: "12px"
  a-4: "16px"
  a-5: "20px"
  a-6: "24px"
  a-8: "32px"
  rand: "16px"
  tipp: "48px"
  knopf-gross: "56px"
  tableiste: "49px"
components:
  knopf-gefuellt:
    backgroundColor: "{colors.tint-flaeche}"
    textColor: "{colors.text-auf-tint}"
    typography: "{typography.kopf}"
    rounded: "{rounded.r-knopf}"
    padding: "0 20px"
    height: "48px"
  knopf-gefuellt-gross:
    backgroundColor: "{colors.tint-flaeche}"
    textColor: "{colors.text-auf-tint}"
    rounded: "{rounded.r-knopf}"
    height: "56px"
    width: "100%"
  knopf-getoent:
    backgroundColor: "{colors.tint-zart}"
    textColor: "{colors.tint}"
    typography: "{typography.kopf}"
    rounded: "{rounded.r-knopf}"
    padding: "0 20px"
    height: "48px"
  knopf-schlicht:
    textColor: "{colors.tint}"
    typography: "{typography.kopf}"
    padding: "0 12px"
    height: "48px"
  knopf-gefahr:
    backgroundColor: "{colors.gefahr-zart}"
    textColor: "{colors.gefahr}"
    typography: "{typography.kopf}"
    rounded: "{rounded.r-knopf}"
    padding: "0 20px"
    height: "48px"
  knopf-deaktiviert:
    backgroundColor: "{colors.zelle-gedrueckt}"
    textColor: "{colors.text-3}"
  gruppe-inhalt:
    backgroundColor: "{colors.zelle}"
    rounded: "{rounded.r-zelle}"
  zeile:
    typography: "{typography.text}"
    padding: "8px 16px"
    height: "48px"
  zeile-gedrueckt:
    backgroundColor: "{colors.zelle-gedrueckt}"
  satz:
    backgroundColor: "{colors.zelle-2}"
    textColor: "{colors.text-2}"
    rounded: "{rounded.r-feld}"
    height: "72px"
  satz-erreicht:
    backgroundColor: "{colors.erreicht-zart}"
    textColor: "{colors.erreicht}"
  zaehler-taste:
    backgroundColor: "{colors.zelle-2}"
    textColor: "{colors.tint}"
    rounded: "{rounded.r-knopf}"
    height: "64px"
    width: "76px"
  pause-leiste:
    backgroundColor: "{colors.material}"
    rounded: "{rounded.r-material}"
    padding: "12px 12px 12px 20px"
  tableiste:
    backgroundColor: "{colors.material}"
    textColor: "{colors.text-2}"
    height: "49px"
  etikett:
    backgroundColor: "{colors.zelle-2}"
    textColor: "{colors.text-2}"
    rounded: "6px"
    padding: "0 7px"
    height: "22px"
  hinweis:
    backgroundColor: "{colors.zelle}"
    rounded: "{rounded.r-zelle}"
    padding: "16px"
---

# Design System: Fit & Einkauf

## Overview

**Creative North Star: "Aus demselben Haus wie Apple Fitness"**

Fit & Einkauf spielt den iOS-Standard, ohne Ironie und ohne eingeschmuggelte Eigenheiten. Messlatte ist die Verarbeitungsqualität von Apple Fitness/Health, Things 3 und Erinnerungen: gruppierte Inset-Listen auf grauem Grund, weiße Zellen, Haarlinien, ein einziger App-Tint, Systemschrift. Die App soll sich anfühlen, als wäre sie mit dem iPhone gekommen. Wer eine Stelle für Persönlichkeit sucht, findet sie in der Sorgfalt, nicht im Ornament.

Die Dichte ist die einer iOS-Einstellungs- oder Erinnerungen-Liste, mit einer Ausnahme: Was gezählt wird (Wiederholungen, Pausen-Sekunden, Satz-Werte), wird groß, gerundet und aus 1–2 m lesbar gesetzt. Jede Tipp-Fläche misst mindestens 48 px, die wichtigen Aktionen liegen unten in der Daumenzone. Rückfragen und Erfolge erscheinen als Hinweis-Karten im Fluss, nie als Dialog über dem Inhalt.

Abgelehnt sind der Fitness-App-Look (Schwarz mit Neon, Ringe, Gamification), Verspieltes und Buntes sowie Web-Apps mit eigenwilligen Steuerelementen. Hell und Dunkel folgen dem System; beide Varianten sind vollwertig.

**Key Characteristics:**
- Gruppierte Inset-Listen (16 px seitlicher Rand, 12 px Ecken) auf gruppiertem Grund.
- Ein App-Tint für Aktionen und Auswahl; Grün, Orange und Rot tragen je genau eine Bedeutung.
- SF Pro für alles Lesbare, SF Pro Rounded nur für große Messzahlen.
- Material-Unschärfe ausschließlich in Tab-Leiste und Pausen-Leiste.
- Signatur: die an die Tab-Leiste angedockte Pausen-Leiste, deren Balken in Echtzeit leerläuft.
- Eigene SVG-Symbole (Strich 1,8, runde Enden) aus einem Sprite, keine Zeichen-Icons.

## Colors

Die iOS-Systempalette, im Hellmodus dort nachgedunkelt, wo Text und Symbole sonst unter 4,5:1 fielen.

### Primary
- **Systemblau, nachgedunkelt** (tint / tint-flaeche): Text-Knöpfe, Symbole, aktive Tabs, Fokusring, gefüllte Hauptknöpfe, Abhak-Kreise, Nährwert-Balken vor dem Ziel. Im Hellmodus #0066CC statt #007AFF für Kontrast; im Dunkelmodus Text #4DA3FF und Flächen #0A6FE0.
- **Tint zart** (tint-zart): Hintergrund getönter Knöpfe und Tint-Etiketten, Textauswahl.

### Secondary
- **Erreicht-Grün** (erreicht / erreicht-flaeche / erreicht-zart): Ziel erreicht, Satz geschafft, erledigt, Pause vorbei, eingeschalteter Schalter. Text in dunklem Grün #1A7431 (hell) für Kontrast, Flächen im Systemgrün.

### Tertiary
- **Pausen-Orange** (pause / pause-flaeche / pause-zart): ausschließlich „Pause läuft“: Pausen-Label, Restbalken, Einstellung der Pausenzeiten. Text im Hellmodus #9A4A00, Balken im Systemorange.
- **Gefahr-Rot** (gefahr / gefahr-zart): zerstörende Aktionen und Aktions-Hinweise („Einheit überspringen“, Löschen).

### Neutral
- **Gruppierter Grund** (grund): Seitenhintergrund hinter allen Gruppen; Dunkel #000000.
- **Zelle** (zelle): Inhalt der Gruppen, Karten, Hinweise; Dunkel #1C1C1E.
- **Zelle 2** (zelle-2): Felder in Zellen: Satz-Felder, Zähler-Tasten, Etikett-Grund, Nährwert-Bahn; Dunkel #2C2C2E.
- **Zelle gedrückt** (zelle-gedrueckt): Zeile beim Antippen, Schalter aus, Segment-Grund, deaktivierte Knöpfe.
- **Material** (material): durchscheinende Fläche von Tab- und Pausen-Leiste, immer mit Unschärfe.
- **Haarlinie** (haarlinie): 0,5-px-Trenner, eingerückt wie unter iOS.
- **Text / Text 2 / Text 3**: Primärtext; Sekundärtext (#6C6C70, ≥ 4,5:1 auf Zelle und Grund); Text 3 nur für Platzhalter-Striche, Chevrons, leere Kreise, nie für Lesetext.

### Markt-Farben
- **Lidl Blau, Hofer Orange, Spar Grün, egal Grau** (markt-*): wie Listenfarben in Erinnerungen, nur auf dem runden Punkt im Markt-Kopf.

### Named Rules
**The Eine-Bedeutung Rule.** Tint heißt Aktion oder Auswahl. Grün heißt erreicht oder erledigt. Orange heißt nur „Pause läuft“. Rot heißt zerstörend. Ein Satz unter dem Ziel ist neutral grau, nicht orange.

**The Markt-Punkt Rule.** Markt-Farben färben nur den Punkt im Markt-Kopf. Abhak-Kreise sind in jedem Markt im Tint gefüllt.

**The Kontrast-vor-Systemwert Rule.** Wo ein iOS-Systemwert als Text unter 4,5:1 fällt, wird er nachgedunkelt (Hell) oder aufgehellt (Dunkel); die Systemfarbe bleibt nur für Flächen.

## Typography

**Text-Schrift:** SF Pro über `-apple-system` (Fallback Segoe UI, Roboto, Helvetica Neue, Arial)
**Zahlen-Schrift:** SF Pro Rounded über `ui-rounded` (Fallback auf die Systemschrift)

**Character:** Reine Systemschrift, keine gehosteten Fonts (offline). Die gerundete Variante ist dem Gezählten vorbehalten und gibt den Zahlen die Wärme von Apple Fitness. Ziffern sind überall tabellarisch.

### Hierarchy
- **Großtitel** (700, 34 px, 1,2, +0,01em): Seitentitel in der Titelleiste, z. B. die heutige Einheit.
- **Titel 2** (700, 22 px, 1,27): Name der aktuellen Übung.
- **Titel 3** (600, 20 px, 1,25): große Gruppen-Köpfe, Markt-Name und -Anzahl.
- **Kopf** (600, 17 px, 1,3): Knopf-Text, Hinweis-Titel, Nährwert-Name; großer Knopf 19 px.
- **Text** (400, 17 px, 1,3): Zeilentitel, Fließtext.
- **Unter** (400, 15 px, 1,33): Untertitel, Zeilen-Untertext, Hinweis-Text.
- **Fuß** (400, 13 px, 1,38): Gruppen-Fußnote, Satz-Beschriftung; als Gruppen-Kopf in Versalien mit 0,02em.
- **Klein / Etikett** (600, 12 px): Etiketten; Tab-Beschriftung 500, 11 px.
- **Zahl groß** (600, 64 px, gerundet): Zähler-Wert.
- **Zahl Pause** (600, 52 px, gerundet): Pausen-Zeit, aus 1–2 m lesbar.
- **Zahl mittel** (600, 28 px, gerundet): Satz-Felder.

### Named Rules
**The Rund-nur-für-Messzahlen Rule.** `ui-rounded` erscheint nur in den drei Zahlen-Stufen (64, 52, 28). Titel, Knöpfe und Fließtext bleiben in SF Pro.

**The Kein-Vortitel Rule.** Über Titeln steht keine Kleinzeile in Versalien. Der einzige Versalien-Text ist der iOS-Gruppen-Kopf, der eine Inset-Gruppe benennt und selbst die Überschrift ist.

## Layout

Eine Spalte, Handybreite, vertikal scrollend. Inhalt sitzt in Inset-Gruppen mit 16 px (rand) seitlichem Rand und 24 px Abstand zwischen Gruppen; Titelleiste mit 20 px Innenrand und Rücksicht auf `safe-area-inset-top`. Abstände folgen einem 4er-Raster (4 / 8 / 12 / 16 / 20 / 24 / 32 px). Zeilen haben 8 × 16 px Innenrand, Karten 16 px.

Unten liegen fest die Tab-Leiste (49 px plus `safe-area-inset-bottom`, vier Bereiche) und bei laufender Pause darüber die Pausen-Leiste; der Inhalt erhält entsprechend Platz nach unten (24 px bzw. 132 px über der Tab-Leiste). Hauptaktionen stehen in voller Breite am Ende der Karte, damit der Daumen sie erreicht.

**The 48-px Rule.** Jede Tipp-Fläche ist mindestens 48 px hoch (tipp). Wo ein Element sichtbar kleiner ist (kleine Knöpfe 36 px, Segment 40 px), wird die Tipp-Fläche unsichtbar auf 48 px erweitert. Die Zähler-Tasten messen 76 × 64 px, der Hauptknopf 56 px.

## Elevation & Depth

Flach durch Tonstufen: Grund, Zelle und Zelle 2 schichten die Tiefe, nicht Schatten. Schatten treten nur dort auf, wo iOS selbst sie zeigt: am Daumen des Schalters, am gewählten Segment und an der schwebenden Pausen-Leiste. Echte Materialtiefe entsteht durch Unschärfe.

### Shadow Vocabulary
- **Pausen-Leiste** (`box-shadow: 0 -4px 16px rgba(0,0,0,0.08), 0 -0.5px 0 var(--haarlinie)`): hebt die angedockte Leiste über den Inhalt.
- **Schalter-Daumen** (`box-shadow: 0 3px 8px rgba(0,0,0,0.15), 0 1px 1px rgba(0,0,0,0.16)`).
- **Gewähltes Segment** (`box-shadow: 0 3px 8px rgba(0,0,0,0.12), 0 1px 1px rgba(0,0,0,0.04)`).

### Named Rules
**The Unschärfe-nur-unten Rule.** `backdrop-filter: saturate(180%) blur(20px)` auf Material gibt es nur in Tab-Leiste und Pausen-Leiste. Karten, Hinweise und Gruppen sind deckend.

## Shapes

Weich gerundete Rechtecke in drei Stufen: Felder 10 px (Satz-Felder, Fokusring), Zellen und Knöpfe 12 px, Material 18 px (Oberkante der Pausen-Leiste). Kleine Elemente folgen iOS-Maßen: Etikett 6 px, Zeilen-Symbol 7 px (30 × 30), Segment 10/8 px. Kreise für Abhak-Kreis (26 px), Markt-Punkt (30 px), Hinweis-Symbol (36 px) und Schalter-Daumen. Rahmen gibt es nicht; Trennung entsteht durch Haarlinien (0,5 px) und Tonstufen. Symbole sind Strichzeichnungen, 24 px, Strich 1,8, runde Enden und Ecken.

## Components

### Buttons
Ruhig und sicher, wie Systemknöpfe.
- **Shape:** 12 px Ecken (r-knopf), mindestens 48 px hoch, 20 px seitlich.
- **Gefüllt:** Tint-Fläche, weißer Text, Kopf-Schrift. Die Hauptaktion einer Karte ist gefüllt, groß (56 px, 19 px) und volle Breite.
- **Getönt:** Tint zart als Grund, Tint als Text (z. B. „+15 s“).
- **Schlicht:** nur Tint-Text, 12 px seitlich; für Nebenaktionen wie „Stufe zu schwer“.
- **Gefahr:** Rot zart mit rotem Text.
- **Gedrückt:** skaliert auf 0,97 und 85 % Deckkraft in 160 ms. **Deaktiviert:** Zelle gedrückt, Text 3.
- **Fokus:** 3-px-Ring im Tint, 2 px Abstand, 10 px Ecken.

### Chips (Etiketten)
- **Style:** 22 px hoch, 6 px Ecken, 12 px halbfett; neutral auf Zelle 2, oder zart getönt in Tint, Erreicht, Gefahr. Reine Anzeige, nicht antippbar.

### Cards / Containers
- **Corner Style:** 12 px (r-zelle), Inhalt beschnitten.
- **Background:** Zelle auf gruppiertem Grund.
- **Shadow Strategy:** keine (siehe Elevation & Depth).
- **Internal Padding:** Zeilen 8 × 16 px, Karten und Hinweise 16 px.
- **Gruppen-Kopf und -Fuß:** 13 px Text 2 mit 16 px Einzug; Kopf in Versalien oder als großer Titel-3-Kopf.

### Inputs / Fields
- **Satz-Felder:** 72 px hoch, 10 px Ecken, Zelle 2; Wert in Zahl mittel. Aktiv: Zelle mit 2-px-Innenring im Tint. Erreicht: Erreicht zart mit grünem Wert. Darunter: neutral. Offen: Strich in Text 3.
- **Zähler:** Raster 76 px / Rest / 76 px; Tasten 64 px, Zelle 2, Tint-Symbol 28 px; Wert 64 px gerundet mit Einheit darunter. Gedrückt 0,94 und Zelle gedrückt; am Minimum Symbol in Text 3.
- **Schalter:** iOS-Toggle 51 × 31 px, an = Erreicht-Fläche.
- **Segment-Umschalter:** Zelle-gedrückt-Grund, 2 px Innenrand, gewählt = Zelle mit Schatten und halbfett.

### Navigation
- **Titelleiste:** Großtitel 34 px mit Untertitel in Text 2; Aktionen als schlichte Knöpfe rechts oben.
- **Tab-Leiste:** vier gleich breite Tabs, Material mit Unschärfe, Haarlinie oben. Symbol 26 px über 11-px-Beschriftung, inaktiv Text 2, aktiv Tint mit Strich 2,2.
- **Zeile:** volle Breite, Haarlinie eingerückt (16 px, mit Symbol 60 px), Wert rechts in Text 2, Chevron 14 px in Text 3; gedrückt Zelle gedrückt.

### Pausen-Leiste (Signatur)
Live-Activity-Stil, fest an die Oberkante der Tab-Leiste angedockt, oben 18 px gerundet, Material mit Unschärfe. Links Label in Pause-Orange („Pause · dann Satz 2“) und Zeit in 52 px gerundet, rechts „+15 s“ (getönt, klein) und „Weiter“ (schlicht, klein). Darunter ein 6-px-Balken in Pause zart, dessen Rest in Pause-Fläche per `scaleX` in Echtzeit leerläuft. Vorbei: Label und Balken wechseln auf Erreicht-Grün. Ein- und Ausblenden: 24 px Versatz und Deckkraft in 240 ms.

### Abhak-Zeile und Markt-Kopf
Zeile 56 px hoch mit 26-px-Kreis (1,5-px-Ring in Text 3); abgehakt füllt sich der Kreis im Tint mit weißem Haken, der Name wird Text 2 und durchgestrichen. Der Markt-Kopf zeigt einen 30-px-Punkt in Markt-Farbe mit weißem Symbol, Name und Anzahl in Titel 3. Kategorien trennen als 13-px-halbfette Zwischenzeile.

### Nährwert-Balken
8-px-Bahn auf Zelle 2. Fester Maßstab: das Ziel steht immer bei 80 % der Bahn als 2-px-Strich in Text; der Balken füllt `Anteil × 80 %`, gedeckelt bei 100 %. Unter Ziel Tint, Ziel erreicht Erreicht-Fläche. So bleiben Tage und Wochen vergleichbar.

### Hinweis (inline statt Dialog)
Karte im Fluss (Zelle, 12 px, 16 px Innenrand) mit 36-px-Kreissymbol in Erreicht zart, Titel in Kopf, Text in Unter, darunter eine Knopfreihe. Bestätigungen wie „Stark – nächste Stufe?“ erscheinen hier, nicht als Modal.

### Leerzustand
Zentriert, 40-px-Symbol in Text 3, Titel in Kopf, Text höchstens 30ch, optional ein Knopf.

## Do's and Don'ts

### Do:
- **Do** jede Tipp-Fläche mindestens 48 px hoch machen; sichtbar kleinere Elemente erweitern ihre Tipp-Fläche unsichtbar.
- **Do** Tint für Aktionen und Auswahl verwenden, Grün für erreicht/erledigt, Orange nur für „Pause läuft“, Rot nur für Zerstörendes.
- **Do** Abhak-Kreise immer im Tint füllen, unabhängig vom Markt.
- **Do** `ui-rounded` nur für Messzahlen in 64, 52 und 28 px setzen, mit tabellarischen Ziffern.
- **Do** die Pausen-Leiste an die Tab-Leiste andocken und ihren Balken in Echtzeit leerlaufen lassen.
- **Do** Nährwert-Balken auf festem Maßstab zeichnen, Ziel immer bei 80 %.
- **Do** Rückfragen und Erfolge als Hinweis-Karte im Fluss zeigen.
- **Do** Hell- und Dunkelwerte gemeinsam pflegen und Text-Farben auf ≥ 4,5:1 prüfen.
- **Do** Symbole aus dem eigenen SVG-Sprite nehmen (Strich, runde Enden).

### Don't:
- **Don't** Orange für Warnungen, Unterschreitungen oder Zustände außerhalb der laufenden Pause verwenden.
- **Don't** Markt-Farben außerhalb des Markt-Punkts einsetzen.
- **Don't** Unschärfe oder Material auf Karten, Hinweisen oder Gruppen legen.
- **Don't** Modale Dialoge für Bestätigungen oder Erfolge öffnen.
- **Don't** Vortitel-Kleinzeilen in Versalien über Überschriften setzen.
- **Don't** gehostete Webfonts, Neon auf Schwarz, Ringe oder Gamification einführen.
- **Don't** Text 3 für Lesetext verwenden.
- **Don't** eigenwillige Steuerelemente bauen, wo iOS ein Standard-Element hat (Schalter, Segment, Inset-Liste).
