# Fit-Einkauf – MVP-Design

Stand: 2026-10-14 · Status: zur Prüfung

Persönliche, kostenlose PWA fürs iPhone: täglicher Calisthenics-Plan (15–30 min) mit Progression und Logging, Wochen-Essensplan aus einer selbst gepflegten Rezept-Bibliothek, Einkaufsliste für Lidl, Hofer und Spar, Gewichts-Log. Österreich, Euro, deutsche Oberfläche mit österreichischen Begriffen (Topfen, Faschiertes, Semmel …).

## 1. Ziele und Erfolgskriterien

- Beim Training: Einheit in 1 Tipp öffnen, Sätze mit großen Tasten loggen, Pausen-Timer läuft, Bildschirm bleibt an.
- Im Supermarkt: Liste nach Markt, Abhaken mit dem Daumen, Grundvorrat ausblendbar.
- Rezepte und Wochenplan zeigen kcal und Protein im Vergleich zum Tagesziel.
- Alles funktioniert offline, Daten bleiben am Handy, Sicherung per JSON-Export.
- Keine laufenden Kosten: statische Dateien auf GitHub Pages.

## 2. Entscheidungen

| Thema | Entscheidung |
|---|---|
| Gerät | iPhone, Safari, als PWA am Homescreen installiert |
| Technik | HTML, CSS und JavaScript (ES-Module), kein Framework, kein Build-Schritt |
| Tests | Vitest, nur lokal am PC (`package.json` enthält nur Dev-Abhängigkeiten) |
| Trainingsrotation | Nach Ablauf: es kommt immer die nächste Einheit, verpasste Tage verschieben nichts |
| Progression | Ziel in allen Sätzen an 2 aufeinanderfolgenden **schweren** Einheiten → Steigerung wird vorgeschlagen, Bestätigung per Tipp |
| Pausen-Timer | Ja, im MVP (optisch und mit Ton; iOS-Web kann nicht vibrieren) |
| Markt-Zuordnung | Jede Zutat hat einen Standard-Markt (`Lidl`, `Hofer`, `Spar`, `egal`), änderbar in der App |
| Wochenplan | Du wählst die Gerichte selbst; standardmäßig 4 Portionen pro Abendgericht |
| Jause | Eigene Bausteine, nicht die Abendreste; Herkunft „mitnehmen“ oder „beim Spar kaufen“ |
| Gewichts-Log | Im MVP, mit Wochenschnitt und Empfehlung ±150 kcal |
| Repo | `fit-einkauf`, öffentlich (wegen kostenloser GitHub Pages); `projekt-brief.md` ist ausgeschlossen (`.gitignore`) |

## 3. Architektur

```
index.html            App-Gerüst, Tab-Leiste unten: Training · Essen · Einkauf · Mehr
manifest.webmanifest  Installation am iPhone (Name, Icons, standalone)
sw.js                 Service Worker: App-Dateien und data/*.json offline (bevorzugt Netz für data/)
css/                  Design-Tokens und Komponenten (aus dem impeccable-Schritt)
js/app.js             Start, Daten laden, Router über die Adresszeile (#/training, #/essen, #/einkauf, #/mehr)
js/daten.js           lädt data/*.json, prüft Pflichtfelder, verknüpft Rezepte mit dem Zutaten-Katalog
js/speicher.js        localStorage-Schlüssel "fitEinkauf", Schema-Version, Migration, Export/Import
js/logik/             reine Funktionen ohne DOM-Zugriff (mit Tests abgedeckt)
  datum.js            ISO-Kalenderwoche, Datumshilfen
  rotation.js         nächste Einheit, Einheit abschließen
  progression.js      Ziel erreicht?, Erfolgsserie aus dem Log, Stufe hoch/runter
  einkaufsliste.js    Zutaten aus dem Wochenplan summieren, nach Markt oder Rezept gruppieren, Grundvorrat-Filter
  filter.js           Abneigungen auf Rezepte anwenden
  naehrwerte.js       typischer Tag im Vergleich zum Ziel
  gewicht.js          Wochenschnitt, Trend pro Monat, kcal-Empfehlung
  figur.js            Übungsfigur aus Pose-Daten als SVG-Text (siehe 4.3.1)
js/ansichten/         training.js, essen.js, einkauf.js, mehr.js (Einstellungen, Gewicht, Export)
data/                 zutaten.json, rezepte.json, uebungen.json, trainingsplan.json, aktionen.json (optional)
tests/                *.test.js pro Logik-Modul plus speicher.test.js
```

Grundregel: Ansichten lesen den Zustand aus `speicher.js`, rufen Funktionen aus `js/logik/` auf und rendern. Die Logik kennt weder DOM noch localStorage, deshalb lässt sie sich ohne Browser testen.

**iPhone-Details**
- `navigator.storage.persist()` beim Start anfragen. Gespeicherte Daten werden über die Export-Erinnerung abgesichert: Liegt `letzterExport` mehr als 14 Tage zurück, zeigt „Mehr“ einen Hinweis.
- Screen Wake Lock während einer laufenden Trainingseinheit (iOS 16.4+, fällt ohne Fehlermeldung weg, wenn nicht verfügbar).
- Tipp-Flächen mindestens 48 px, wichtige Aktionen in Daumenreichweite unten.

## 4. Datenstruktur

### 4.1 `data/zutaten.json` – Zutaten-Katalog

```json
{
  "huehnerbrust": { "name": "Hühnerbrustfilet", "kategorie": "Fleisch & Fisch", "grundvorrat": false, "standard_markt": "Hofer" },
  "olivenoel":    { "name": "Olivenöl", "kategorie": "Vorrat", "grundvorrat": true, "standard_markt": "egal" }
}
```

Kategorien (Reihenfolge = Laufweg im Markt): Obst & Gemüse, Brot & Gebäck, Kühlregal, Fleisch & Fisch, Tiefkühl, Vorrat, Gewürze.

### 4.2 `data/rezepte.json` – Bibliothek

```json
{
  "version": 1,
  "rezepte": [
    {
      "id": "huhn-reis-pfanne",
      "typ": "abend",
      "name": "Hühner-Reis-Pfanne",
      "portionen": 4,
      "aufwand": "leicht",
      "zeit_min": 25,
      "tags": ["huhn", "reis"],
      "zutaten": [{ "zutat": "huehnerbrust", "menge": 1000, "einheit": "g" }],
      "schritte": ["…"],
      "pro_portion": { "kcal": 720, "protein_g": 55 }
    }
  ]
}
```

- `typ`: `abend` | `jause` | `snack` | `extra`. `extra` ist ein Kalorien-Baustein (z. B. Milch, Banane, Nüsse), von dem täglich einer eingeplant wird.
- Startinhalt: siehe `docs/rezepte-startset.md` (freigegeben).
- `aufwand`: `leicht` | `mittel`.
- Nur bei `jause`: `"herkunft": "mitnehmen" | "spar" | "reste"`. Bei `spar` gibt es statt Zutaten eine Beschreibung (z. B. „Vollkornweckerl Schinken-Käse aus der Feinkost“), Nährwerte sind geschätzt.
- Mengen gelten für `portionen` Portionen. Im Wochenplan wird linear umgerechnet.
- Jause-Bausteine sind baustellentauglich: kalt essbar, kein Aufwärmen, halten einige Stunden ohne Kühlschrank. Das Feld `"ohne_kuehlung": true | false` zeigt das an.
- Der Protein-Snack (Skyr oder Magertopfen mit Haferflocken) ist ein `snack`-Rezept mit 1 Portion.

### 4.3 `data/uebungen.json` – Übungsketten

```json
{
  "ketten": [
    {
      "id": "druecken-horizontal",
      "name": "Liegestütz",
      "ausruestung": "matte",
      "stufen": [
        { "name": "Liegestütz", "ziel": { "saetze": 3, "wdh": 15 } },
        {
          "name": "Diamond-Liegestütz",
          "ziel": { "saetze": 3, "wdh": 12 },
          "figur": {
            "geraet": "boden",
            "start": { "huefte": [65.4, 63.3], "rumpf": 204, "arm": [90, 90], "bein": [24, 24] },
            "ende":  { "huefte": [69.6, 73.1], "rumpf": 190, "arm": [30, 163], "bein": [10, 10] }
          },
          "hinweise": [
            "Hände unter der Brust, Daumen und Zeigefinger bilden eine Raute.",
            "Ellbogen eng am Körper nach hinten führen.",
            "Körper bleibt eine Linie, Brust bis knapp über die Hände."
          ],
          "achtung": "Hüfte nicht durchhängen lassen und den Kopf nicht vorschieben."
        }
      ]
    }
  ]
}
```

`ziel` hat entweder `wdh` oder `sek` (Halteübungen). `ausruestung`: `matte` | `stange`.

**Startketten** (die Startstufe kannst du in der App mit „zu leicht“ und „zu schwer“ anpassen):

| Kette | Stufen |
|---|---|
| Drücken horizontal | Liegestütz 3×15 → Diamond 3×12 → Liegestütz mit erhöhten Füßen 3×12 → Archer 3×6/Seite → Pseudo-Planche 3×10 |
| Drücken vertikal | Pike Push-up 3×10 → Pike mit erhöhten Füßen 3×10 → Wand-Handstand 3×30 s → negative HSPU an der Wand 3×4 |
| Ziehen ohne Stange | Tischrudern 3×12 → Tischrudern mit erhöhten Füßen 3×12 → einarmiges Tischrudern 3×6/Seite |
| Ziehen mit Stange | Negativ-Klimmzug 3×5 (5 s ablassen) → Chin-up 3×5 → Klimmzug 3×5 → 3×7 → 3×9 → L-Sit-Klimmzug 3×5 → Archer-Klimmzug 3×3/Seite |
| Beine | Kniebeuge 3×20 → Bulgarian Split Squat 3×10/Seite → Shrimp Squat assistiert 3×6/Seite → Pistol assistiert 3×5/Seite → Pistol 3×5/Seite |
| Hüfte | einbeinige Hüftbrücke 3×12/Seite → mit erhöhten Füßen 3×12/Seite → negativer Nordic Curl (Füße unter Couch) 3×4 |
| Core | Unterarmstütz 3×45 s → Hollow Hold 3×30 s → Hollow Rocks 3×15 |
| Mobilität | feste Routine (Hüftbeuger, Schulter, Brustwirbelsäule, Hamstrings), keine Progression |

Der Schalter „Stange vorhanden“ ersetzt in allen Einheiten die Kette `ziehen-ohne-stange` durch `ziehen-stange`. Die Stufen beider Ketten bleiben getrennt gespeichert.

Die Mobilitäts-Kette hat genau eine Stufe mit dem Feld `routine`: eine Liste von 4 Übungen mit `name`, `sek`, `figur`, `hinweise` (Hüftbeuger-Dehnung im Ausfallschritt, Wandengel für die Schulter, „offenes Buch“ für die Brustwirbelsäule, Hamstring-Dehnung im Sitzen; je 1 Durchgang à 30–45 s, zusammen etwa 5 min). Sie läuft als Block am Ende jeder Einheit, ohne Pausen-Timer.

#### 4.3.1 Übungsfiguren (entschieden 2026-10-14)

Jede Stufe (und jede Übung der Mobilitäts-Routine) bekommt eine schematische Strichfigur in Start- und Endposition, berechnet aus Pose-Daten (Variante B; Variante A „jede Position von Hand gezeichnet“ wurde verworfen).

- **Pose:** `huefte` [x, y] im Bild 120 × 84 (Boden bei y = 80), dazu Winkel in Grad (0 = nach rechts, 90 = nach unten): `rumpf`, `arm` [Oberarm, Unterarm], `bein` [Oberschenkel, Unterschenkel]. Optional `arm2` und `bein2` für die zweite Seite (z. B. Split Squat, Archer, Pistol); fehlen sie, liegen beide Seiten übereinander. Die zweite Seite wird mit 45 % Deckkraft gezeichnet.
- **Feste Längen:** Rumpf 30, Oberarm 15, Unterarm 14, Oberschenkel 17, Unterschenkel 17, Hals 9, Kopf-Radius 5. Strich 3,2, runde Enden, `currentColor` (folgt Hell/Dunkel).
- **Geräte** (`figur.geraet`): `boden` | `wand` | `stange` | `tisch` | `stuhl` | `couch`. Jedes Gerät steht an fester Stelle im Bild als einfache Linie/Fläche mit 35 % Deckkraft; Posen werden dazu passend eingetragen.
- **Seitige Übungen** („/Seite“) zeigen eine Seite.
- **Texte:** `hinweise` 2–3 kurze Sätze zur Ausführung (Pflicht). `achtung` 1 Satz zum häufigsten Fehler, nur wo er typisch oder riskant ist: Unterarmstütz, Hollow Hold, Hollow Rocks, Pike Push-up (beide), Wand-Handstand, negative HSPU, Archer-Liegestütz, Pseudo-Planche, Tischrudern (alle drei, Tisch muss kippsicher sein), alle Klimmzug-Stufen (ohne Schwung), Bulgarian Split Squat, Shrimp Squat, Pistol (beide), Hüftbrücken, negativer Nordic Curl (Couch sichern, langsam ablassen), Liegestütz mit erhöhten Füßen.
- **`figur.js`:** `poseZuSvg(pose, geraet)` → SVG-Inhalt als Text; reine Funktion, kein DOM. `pruefeFigur(stufe)` liefert eine Liste von Fehlern (fehlende Winkel, Gelenke außerhalb des Bildes, 0 oder mehr als 3 Hinweise). `daten.js` ruft sie beim Laden auf und meldet Fehler in der Konsole; eine Stufe ohne gültige Figur zeigt einfach keine Figur.
- **Entstehung:** Die ca. 60 Posen werden vor dem Einbau auf einer Sammelseite `muster/figuren.html` (alle Stufen, Start und Ende nebeneinander) vom Nutzer durchgesehen und korrigiert.

### 4.4 `data/trainingsplan.json` – Rotation

Geändert nach dem Plan-Review vom 14.10.2026: 4 schwere Einheiten statt 6, Drücken und Ziehen im Verhältnis 1:1, Supersätze.

| # | Einheit | Art | Blöcke | Dauer |
|---|---|---|---|---|
| 1 | Oberkörper A | schwer | [Drücken horizontal ⇄ Ziehen], Core, Mobilität | 30 min |
| 2 | Beine | schwer | [Beine ⇄ Hüfte], Core, Mobilität | 30 min |
| 3 | Oberkörper B | schwer | [Drücken vertikal ⇄ Ziehen], [Drücken horizontal ⇄ Ziehen ohne Stange], Mobilität | 35 min |
| 4 | Beine & Core | schwer | [Beine ⇄ Hüfte], Core, Mobilität | 30 min |

- **Supersatz** `[A ⇄ B]`: in `trainingsplan.json` ein Paar `["A", "B"]` in `ketten`. Die Sätze wechseln A, B, A, B …; die Pause kommt erst nach B. Ist eine Seite fertig, geht es mit der anderen allein weiter.
- `ziehen` ist ein Platzhalter (siehe Schalter „Stange vorhanden“). Kommt eine Kette in einer Einheit doppelt vor (ohne Stange in Oberkörper B), fällt das zweite Vorkommen weg.
- **Schwere** Einheit: aktuelle Stufe mit dem vollen Ziel, Pause standardmäßig 90 s. Die Art „leicht“ (2 statt 3 Sätze, zählt nicht für die Progression) bleibt in der Logik erhalten, wird im Plan aber nicht mehr verwendet.
- Pro Runde: Drücken 9 Sätze, Ziehen 9, Beine 6, Hüfte 6, Core 9.
- Der Plan ist ein Startwert und wird nach ein paar Wochen an die Realität angepasst.

### 4.5 `data/aktionen.json` (optional im MVP)

Format wie im Projekt-Brief, ergänzt um `"zutat": "<zutat-id>"`. Im MVP wird die Datei nur gelesen, wenn sie vorhanden ist. Passende Zutaten auf der Einkaufsliste bekommen ein Aktions-Etikett (Preis, gültig von–bis). Die eigentliche Aktions-Logik kommt in Phase 2.

### 4.6 Lokaler Speicher (`localStorage["fitEinkauf"]`)

```js
{
  schema: 1,
  einstellungen: {
    ziele: { kcal: 2950, protein: 130 },   // Fett/KH gestrichen: Rezepte haben nur kcal und Protein
    jauseTage: 4,                         // Arbeitstage mit Jause pro Woche
    abneigungen: ["curry", "tofu"],
    stange: true,
    grundvorratAusblenden: false,
    marktZuordnung: { /* zutatId: "Lidl" | "Hofer" | "Spar" | "egal" */ },
    pauseSek: { schwer: 90, leicht: 60 }
  },
  training: {
    naechsteEinheit: 0,                 // Index in der Rotation
    stufen: { "druecken-horizontal": 0 },
    laufend: null,                      // angefangene Einheit, übersteht ein Neuladen
    log: [{ datum: "2026-10-14", einheit: 1, art: "schwer",
            uebungen: [{ kette: "druecken-horizontal", stufe: 0, saetze: [15, 15, 13] }] }]
  },
  essen: {
    wochenplan: { kw: "2026-W42",
                  abend: [{ rezept: "huhn-reis-pfanne", portionen: 4 }],
                  jause: [{ rezept: "weckerl-schinken-kaese", anzahl: 3 }],
                  snack: { rezept: "skyr-haferflocken", anzahl: 7 },
                  extra: [{ rezept: "milch-banane-nuesse", anzahl: 3 }] },
    abgehakt: { "huehnerbrust|g": true },
    aufgebraucht: ["olivenoel"]
  },
  gewicht: [{ datum: "2026-10-14", kg: 72.0 }],
  letzterExport: null
}
```

- **Export:** lädt die komplette Datei als `fit-einkauf-JJJJ-MM-TT.json` herunter.
- **Import:** prüft Schema und Pflichtfelder. Ungültig → abgelehnt mit Meldung. Gültig → der alte Stand wird vorher unter `fitEinkauf.backup` gesichert.
- **Migration:** Bei einem höheren `schema` laufen die Migrationsfunktionen der Reihe nach.

## 5. Logik

### 5.1 Rotation
`naechsteEinheit(zustand, plan)` liefert die Einheit am Index. `abschliessen()` hängt den Log-Eintrag an und erhöht den Index modulo der Plan-Länge. Ein „Überspringen“-Button rückt den Index weiter, ohne zu loggen.

### 5.2 Progression
- Erreicht: alle Sätze ≥ Ziel (Wiederholungen oder Sekunden) bei voller Satzzahl.
- Erfolgsserie: die letzten Log-Einträge der Kette aus **schweren** Einheiten auf der aktuellen Stufe; die Serie zählt, wie viele davon hintereinander erreicht wurden.
- Serie ≥ 2 → nach dem Abschließen erscheint „Nächste Stufe: Diamond-Liegestütz?“ [Ja] [Später]. „Später“ fragt beim nächsten Erfolg erneut.
- „zu schwer“ / „zu leicht“ in der Übungsansicht verschiebt die Stufe um 1 (mit Grenzen 0 und letzte Stufe).

### 5.3 Einkaufsliste
1. Abendgerichte: Mengen × (Plan-Portionen / Rezept-Portionen). Jause mit Herkunft „mitnehmen“, Snack und Extras: Mengen × Anzahl / Rezept-Portionen. Jausen mit Herkunft „spar“ oder „reste“ fallen weg.
2. Gleiche Zutat mit gleicher Einheit wird summiert. Bei verschiedenen Einheiten bleiben getrennte Zeilen (keine Umrechnung).
3. Markt = `marktZuordnung[zutat]` ?? `standard_markt`. Gruppiert nach Markt, darin nach Kategorie.
4. Grundvorrat: wird mit Etikett „Vorrat“ angezeigt. Ist `grundvorratAusblenden` an, wird er ausgefiltert, **außer** er steht in `aufgebraucht`.
5. Ansicht „nach Rezept“: pro Gericht alle Zutaten mit den hochgerechneten Mengen.
6. Abhaken-Schlüssel: `zutatId|einheit`. „Neue Woche“ leert die Haken. Wird ein aufgebrauchter Vorratsartikel abgehakt, verschwindet er wieder aus `aufgebraucht`.
7. Mengen werden sinnvoll gerundet (g auf 10 g, Stück auf 0,5).

### 5.4 Filter
Ein Rezept ist ausgeblendet, wenn ein Eintrag aus `abneigungen` (ohne Groß-/Kleinschreibung) in `tags`, im Namen oder in den Namen seiner Zutaten vorkommt. Ausgeblendete Rezepte sind über „ausgeblendete zeigen“ erreichbar.

### 5.5 Nährwerte („typischer Tag“)
Wochensumme ÷ 7: Σ Abend (Portionen × Nährwerte) + Σ Jause (Anzahl × Nährwerte) + Snack (Anzahl × Nährwerte) + Σ Extra (Anzahl × Nährwerte), geteilt durch 7; die Tagesanteile von Abend, Jause, Snack und Extra werden einzeln ausgewiesen. „Reste“-Jausen zählen mit den Ø-Nährwerten einer Abendportion. Die Einstellung `jauseTage` (Standard 4) ist die Soll-Anzahl Jausen pro Woche; die Essen-Ansicht zeigt an, wenn weniger eingeplant sind. Angezeigt werden kcal und Protein im Vergleich zum Ziel, als Balken mit Zahl.

### 5.6 Gewicht
- Wochenschnitt pro ISO-Kalenderwoche.
- Trend: Veränderung pro Monat aus den Wochenschnitten der letzten 4 Wochen (lineare Regression), sobald mindestens 3 Wochen mit Daten vorliegen.
- Empfehlung: Trend > +0,75 kg/Monat → „−150 kcal“. Trend < +0,25 kg/Monat → „+150 kcal“. Dazwischen „passt“. Eine Empfehlung wird per Tipp ins kcal-Ziel übernommen, nie automatisch.

## 6. Ansichten (MVP)

- **Training:** Karte „Heute: Oberkörper A (schwer)“ → Start. Pro Übung: Stufenname, Ziel, große −/+ Tasten pro Satz (vorbelegt mit dem Ziel), Satz abhaken startet den Pausen-Timer (Endzeit wird gespeichert und übersteht Neuladen; am Ende Ton und kurzes Aufblinken der Leiste). Ist eine Sicherung fällig, erscheint die Export-Erinnerung auch hier. Abschluss → Progressionsvorschläge. Verlauf pro Kette. Aufbau und Komponenten wie `muster/training.html` und `DESIGN.md`.
  - **Übungsfigur:** 72 px groß oben rechts in der Übungskarte; Start und Ende überblenden im Wechsel (alle 1,5 s). Bei „Bewegung reduzieren“ steht nur die Endposition. Die ganze Figur ist Tipp-Fläche (Bezeichnung „So geht's: <Stufe>“).
  - **„So geht's“-Blatt:** öffnet von unten im Bildschirm (kein Dialogfenster), zeigt Start und Ende nebeneinander (ca. 140 px), darunter die Hinweise und, falls vorhanden, „Achte darauf: …“. Schließen mit „Fertig“ oder nach unten wischen.
- **Essen:** Wochenplan (Abend, Jause, Snack) mit typischem Tag gegen das Ziel. Bibliothek mit Filter nach Typ; Rezept-Detail mit Zutaten, Schritten und Nährwerten; „in den Plan“ / „austauschen“.
- **Einkauf:** Umschalter „nach Markt / nach Rezept“, Schalter „Grundvorrat ausblenden“, Zeilen abhaken, langes Drücken ändert den Markt bzw. markiert „aufgebraucht“.
- **Mehr:** Gewicht eintragen und Verlauf, Zielwerte (kcal, Protein), Jause-Tage, Abneigungen, Pausenzeiten, Stange vorhanden, Export/Import, Export-Erinnerung.

## 7. Fehlerbehandlung

- `data/*.json` nicht ladbar → Version aus dem Service-Worker-Cache. Gibt es keinen Cache, wird ein klarer Hinweis gezeigt.
- Rezept verweist auf eine unbekannte Zutat → `daten.js` meldet das in der Konsole, und die Zutat erscheint mit ihrer ID unter „egal“ (die App stürzt nicht ab).
- localStorage nicht lesbar oder beschädigt → Start mit Standardwerten. Der beschädigte Rohtext wird unter `fitEinkauf.defekt` aufbewahrt und kann exportiert werden.
- localStorage voll → Meldung mit Bitte um Export.

## 8. Tests

- Vitest für alle Module in `js/logik/` und `speicher.js` (Validierung, Migration, Import mit Backup). Entwicklung testgetrieben.
- `figur.test.js`: Gelenkpositionen für bekannte Posen; jede Stufe in `data/uebungen.json` besteht `pruefeFigur` (Pflicht-Winkel vorhanden, alle Gelenke im Bild, 2–3 Hinweise).
- Wichtige Fälle: Progression mit leichten Einheiten dazwischen, Stufe am Ende der Kette; Einkaufsliste mit gemischten Einheiten, Grundvorrat aus- und eingeblendet, „aufgebraucht“; KW-Wechsel zum Jahresende; Gewichtstrend mit Lücken.
- Oberfläche: eingebauter Browser im iPhone-Viewport 375×812, Ablauf Training und Einkauf von Hand durchgespielt, bevor etwas als fertig gilt.

## 9. Nicht im MVP (Phase 2+)

Aktions-Check und Donnerstags-Aufgabe (`aktionen.json` und Wochenplan-Vorschlag erzeugen), Hauptmarkt + Bonus-Stopp mit Ersparnis-Schwelle, Kleinigkeiten-Tipp, Bereich „Vorschläge“, Park-Modus mit Barren, Radfahren, Apple-Health-Export über Kurzbefehle.

## 10. Nächste Schritte

1. ~~Rezept-Startset~~ erledigt (`docs/rezepte-startset.md`).
2. ~~UI-Grundlage mit impeccable~~ erledigt (`DESIGN.md`, `css/`, `muster/`).
3. Umsetzungsplan (writing-plans), inklusive Übungsfiguren als eigener Teil.
