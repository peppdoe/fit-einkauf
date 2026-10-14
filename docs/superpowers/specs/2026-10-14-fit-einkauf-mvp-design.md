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
      "pro_portion": { "kcal": 720, "protein_g": 55, "fett_g": 18, "kh_g": 80 }
    }
  ]
}
```

- `typ`: `abend` | `jause` | `snack`.
- `aufwand`: `leicht` | `mittel`.
- Nur bei `jause`: `"herkunft": "mitnehmen" | "spar"`. Bei `spar` gibt es statt Zutaten eine Beschreibung (z. B. „Vollkornweckerl Schinken-Käse aus der Feinkost“), Nährwerte sind geschätzt.
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
        { "name": "Diamond-Liegestütz", "ziel": { "saetze": 3, "wdh": 12 } }
      ]
    }
  ]
}
```

`ziel` hat entweder `wdh` oder `sek` (Halteübungen). `ausruestung`: `matte` | `stange`.

**Startketten** (die Startstufe kannst du in der App mit „zu leicht“ und „zu schwer“ anpassen):

| Kette | Stufen |
|---|---|
| Drücken horizontal | Liegestütz 3×15 → Diamond 3×12 → Archer 3×6/Seite → Pseudo-Planche 3×10 |
| Drücken vertikal | Pike Push-up 3×10 → Pike mit erhöhten Füßen 3×10 → Wand-Handstand 3×30 s → negative HSPU an der Wand 3×4 |
| Ziehen ohne Stange | Tischrudern 3×12 → Tischrudern mit erhöhten Füßen 3×12 → einarmiges Tischrudern 3×6/Seite |
| Ziehen mit Stange | Klimmzug 3×5 → 3×7 → 3×9 → L-Sit-Klimmzug 3×5 → Archer-Klimmzug 3×3/Seite |
| Beine | Kniebeuge 3×20 → Bulgarian Split Squat 3×10/Seite → Shrimp Squat assistiert 3×6/Seite → Pistol assistiert 3×5/Seite → Pistol 3×5/Seite |
| Hüfte | einbeinige Hüftbrücke 3×12/Seite → mit erhöhten Füßen 3×12/Seite → negativer Nordic Curl (Füße unter Couch) 3×4 |
| Core | Unterarmstütz 3×45 s → Hollow Hold 3×30 s → Hollow Rocks 3×15 |
| Mobilität | feste Routine (Hüftbeuger, Schulter, Brustwirbelsäule, Hamstrings), keine Progression |

Der Schalter „Stange vorhanden“ ersetzt in allen Einheiten die Kette `ziehen-ohne-stange` durch `ziehen-stange`. Die Stufen beider Ketten bleiben getrennt gespeichert.

### 4.4 `data/trainingsplan.json` – Rotation

| # | Einheit | Art | Ketten | Dauer |
|---|---|---|---|---|
| 1 | Oberkörper A | schwer | Drücken horizontal, Ziehen, Core | 25–30 min |
| 2 | Beine | schwer | Beine, Hüfte, Core | 25 min |
| 3 | Mobilität & Core | leicht | Mobilität, Core | 15 min |
| 4 | Oberkörper B | schwer | Drücken vertikal, Ziehen, Drücken horizontal | 25–30 min |
| 5 | Beine & Core | leicht | Beine, Hüfte, Core | 15–20 min |
| 6 | Mobilität | leicht | Mobilität | 15 min |

- **Leichte** Einheit: aktuelle Stufe, 2 statt 3 Sätze. Sie zählt nicht für die Progression.
- **Schwere** Einheit: aktuelle Stufe mit dem vollen Ziel. Pause standardmäßig 90 s (leicht: 60 s).
- Der Plan ist ein Startwert und wird nach ein paar Wochen an die Realität angepasst.

### 4.5 `data/aktionen.json` (optional im MVP)

Format wie im Projekt-Brief, ergänzt um `"zutat": "<zutat-id>"`. Im MVP wird die Datei nur gelesen, wenn sie vorhanden ist. Passende Zutaten auf der Einkaufsliste bekommen ein Aktions-Etikett (Preis, gültig von–bis). Die eigentliche Aktions-Logik kommt in Phase 2.

### 4.6 Lokaler Speicher (`localStorage["fitEinkauf"]`)

```js
{
  schema: 1,
  einstellungen: {
    ziele: { kcal: 2950, protein: 130, fett: 75, kh: 430 },
    abneigungen: ["curry", "tofu"],
    stange: false,
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
                  snack: { rezept: "skyr-haferflocken", anzahl: 7 } },
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
1. Abendgerichte: Mengen × (Plan-Portionen / Rezept-Portionen). Jause mit Herkunft „mitnehmen“ und der Snack: Mengen × Anzahl / Rezept-Portionen. Jausen mit Herkunft „spar“ fallen weg.
2. Gleiche Zutat mit gleicher Einheit wird summiert. Bei verschiedenen Einheiten bleiben getrennte Zeilen (keine Umrechnung).
3. Markt = `marktZuordnung[zutat]` ?? `standard_markt`. Gruppiert nach Markt, darin nach Kategorie.
4. Grundvorrat: wird mit Etikett „Vorrat“ angezeigt. Ist `grundvorratAusblenden` an, wird er ausgefiltert, **außer** er steht in `aufgebraucht`.
5. Ansicht „nach Rezept“: pro Gericht alle Zutaten mit den hochgerechneten Mengen.
6. Abhaken-Schlüssel: `zutatId|einheit`. „Neue Woche“ leert die Haken. Wird ein aufgebrauchter Vorratsartikel abgehakt, verschwindet er wieder aus `aufgebraucht`.
7. Mengen werden sinnvoll gerundet (g auf 10 g, Stück auf 0,5).

### 5.4 Filter
Ein Rezept ist ausgeblendet, wenn ein Eintrag aus `abneigungen` (ohne Groß-/Kleinschreibung) in `tags`, im Namen oder in den Namen seiner Zutaten vorkommt. Ausgeblendete Rezepte sind über „ausgeblendete zeigen“ erreichbar.

### 5.5 Nährwerte („typischer Tag“)
Ø-Abendportion (gewichtet nach Portionen im Plan) + Ø-Jause (gewichtet nach Anzahl, über 5 Arbeitstage verteilt) + Snack. Angezeigt werden kcal und Protein im Vergleich zum Ziel, als Balken mit Zahl.

### 5.6 Gewicht
- Wochenschnitt pro ISO-Kalenderwoche.
- Trend: Veränderung pro Monat aus den Wochenschnitten der letzten 4 Wochen (lineare Regression), sobald mindestens 3 Wochen mit Daten vorliegen.
- Empfehlung: Trend > +0,75 kg/Monat → „−150 kcal“. Trend < +0,25 kg/Monat → „+150 kcal“. Dazwischen „passt“. Eine Empfehlung wird per Tipp ins kcal-Ziel übernommen, nie automatisch.

## 6. Ansichten (MVP)

- **Training:** Karte „Heute: Oberkörper A (schwer)“ → Start. Pro Übung: Stufenname, Ziel, große −/+ Tasten pro Satz (vorbelegt mit dem Ziel), Satz abhaken startet den Pausen-Timer. Abschluss → Progressionsvorschläge. Verlauf pro Kette.
- **Essen:** Wochenplan (Abend, Jause, Snack) mit typischem Tag gegen das Ziel. Bibliothek mit Filter nach Typ; Rezept-Detail mit Zutaten, Schritten und Nährwerten; „in den Plan“ / „austauschen“.
- **Einkauf:** Umschalter „nach Markt / nach Rezept“, Schalter „Grundvorrat ausblenden“, Zeilen abhaken, langes Drücken ändert den Markt bzw. markiert „aufgebraucht“.
- **Mehr:** Gewicht eintragen und Verlauf, Zielwerte, Abneigungen, Pausenzeiten, Stange vorhanden, Export/Import, Export-Erinnerung.

## 7. Fehlerbehandlung

- `data/*.json` nicht ladbar → Version aus dem Service-Worker-Cache. Gibt es keinen Cache, wird ein klarer Hinweis gezeigt.
- Rezept verweist auf eine unbekannte Zutat → `daten.js` meldet das in der Konsole, und die Zutat erscheint mit ihrer ID unter „egal“ (die App stürzt nicht ab).
- localStorage nicht lesbar oder beschädigt → Start mit Standardwerten. Der beschädigte Rohtext wird unter `fitEinkauf.defekt` aufbewahrt und kann exportiert werden.
- localStorage voll → Meldung mit Bitte um Export.

## 8. Tests

- Vitest für alle Module in `js/logik/` und `speicher.js` (Validierung, Migration, Import mit Backup). Entwicklung testgetrieben.
- Wichtige Fälle: Progression mit leichten Einheiten dazwischen, Stufe am Ende der Kette; Einkaufsliste mit gemischten Einheiten, Grundvorrat aus- und eingeblendet, „aufgebraucht“; KW-Wechsel zum Jahresende; Gewichtstrend mit Lücken.
- Oberfläche: eingebauter Browser im iPhone-Viewport 375×812, Ablauf Training und Einkauf von Hand durchgespielt, bevor etwas als fertig gilt.

## 9. Nicht im MVP (Phase 2+)

Aktions-Check und Donnerstags-Aufgabe (`aktionen.json` und Wochenplan-Vorschlag erzeugen), Hauptmarkt + Bonus-Stopp mit Ersparnis-Schwelle, Kleinigkeiten-Tipp, Bereich „Vorschläge“, Park-Modus mit Barren, Radfahren, Apple-Health-Export über Kurzbefehle.

## 10. Nächste Schritte

1. Rezept-Startset: 6 Abendgerichte (plus 3–4 Jause-Bausteine und der Snack) zur Freigabe vorlegen.
2. UI-Grundlage mit impeccable.
3. Umsetzungsplan (writing-plans).
