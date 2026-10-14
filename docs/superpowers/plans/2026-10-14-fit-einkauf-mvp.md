# Fit & Einkauf MVP Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Die installierbare, offline-fähige iPhone-PWA „Fit & Einkauf“ mit Training (Rotation, Progression, Logging, Pausen-Timer, Übungsfiguren), Wochen-Essensplan, Einkaufsliste nach Markt/Rezept, Gewichts-Log, Einstellungen und JSON-Export/Import bauen.

**Architecture:** Statische Dateien ohne Build-Schritt. Reine Logik-Module in `js/logik/` (ohne DOM, mit Vitest getestet), Persistenz in `js/speicher.js` (localStorage, über ein übergebenes Storage-Objekt testbar), Datenladen in `js/daten.js`. Vier Ansichten in `js/ansichten/` rendern per Template-Strings in `<main id="haupt">` und behandeln Klicks per Event-Delegation über `data-aktion`. `js/app.js` hält den Zustand (`ctx`), speichert nach jeder Änderung und zeichnet die Ansicht neu. Der Router liest die Adresszeile (`#/training`, `#/essen/...`).

**Tech Stack:** HTML, CSS, JavaScript (ES-Module), Vitest (nur lokal, Dev-Abhängigkeit), Node 24, Microsoft Edge headless für Bildschirmfotos, GitHub Pages (Deployment nach Scheibe 1, nur nach OK).

**Spec:** `docs/superpowers/specs/2026-10-14-fit-einkauf-mvp-design.md` (inkl. 4.3.1 Übungsfiguren). Dazu: `DESIGN.md` (Design-System), `css/tokens.css`, `css/komponenten.css`, `muster/training.html`, `muster/komponenten.html` (Vorlagen), `docs/rezepte-startset.md` (Rezeptinhalte), `PRODUCT.md` (Tonfall).

## Global Constraints

- Gerät: iPhone, Safari, PWA am Homescreen; Prüf-Viewport 375×812 (hell und dunkel).
- HTML, CSS und JavaScript (ES-Module), kein Framework, kein Build-Schritt. `package.json` enthält nur Dev-Abhängigkeiten (Vitest).
- Daten lokal in `localStorage["fitEinkauf"]`, `schema: 1`; Sicherungskopie beim Import unter `fitEinkauf.backup`, beschädigter Rohtext unter `fitEinkauf.defekt`.
- Export-Dateiname `fit-einkauf-JJJJ-MM-TT.json`; Export-Hinweis, wenn `letzterExport` mehr als 14 Tage zurückliegt.
- Startziele: 2950 kcal, 130 g Protein, 75 g Fett, 430 g KH; Abneigungen Start: `curry`, `tofu`; Pausen 90 s schwer, 60 s leicht.
- Leichte Einheit: 2 statt 3 Sätze, zählt nicht für die Progression. Steigerungsvorschlag nach 2 aufeinanderfolgenden erreichten **schweren** Einheiten, nur per Tipp.
- Gewichtsempfehlung: Trend > +0,75 kg/Monat → −150 kcal; < +0,25 kg/Monat → +150 kcal; Übernahme nur per Tipp.
- Einkauf: g/ml auf 10 aufrunden, Stück & Co. auf 0,5 aufrunden; Abhaken-Schlüssel `zutatId|einheit`.
- Märkte in dieser Reihenfolge: Lidl, Hofer, Spar, egal. Kategorien (Laufweg): Obst & Gemüse, Brot & Gebäck, Kühlregal, Fleisch & Fisch, Tiefkühl, Vorrat, Gewürze (+ Sonstiges für Unbekanntes).
- UI-Sprache Deutsch mit österreichischen Begriffen; Tonfall Du, knapp, bei Erfolgen kurze Anfeuerung („Stark – nächste Stufe?“). Keine Vortitel (Eyebrows) über Überschriften.
- Design: nur Komponenten und Tokens aus `DESIGN.md`/`css/`; eine Farbe = eine Bedeutung (Blau Aktion, Grün erreicht, Orange **nur** „Pause läuft“, Rot zerstörend/Aktionspreis). Jede Tipp-Fläche ≥ 48 px. Rückfragen inline oder als Blatt von unten, nie `alert`/`confirm`.
- Übungsfiguren: Bild 120 × 84, Boden y = 80; Längen Rumpf 30, Oberarm 15, Unterarm 14, Oberschenkel 17, Unterschenkel 17, Hals 9, Kopf-Radius 5; Strich 3,2; zweite Seite 45 % Deckkraft; Wechsel Start/Ende alle 1,5 s.
- Deployment auf GitHub Pages ist **nicht** Teil dieses Plans (vorher den Nutzer fragen, weil es veröffentlicht).

## Review Focus

1. **Neuladen mitten im Training** (iOS beendet PWAs im Hintergrund): Die angefangene Einheit muss mit allen erledigten Sätzen und dem aktuellen Zählerwert wiederkommen. → Test in Task 2 (`laufend` übersteht Speichern/Laden) und Task 13 (Einheit-Logik).
2. **Datenstand ändert sich nach einem Update** (Kette kürzer, Stufe gespeichert, die es nicht mehr gibt, Kette umbenannt): keine Abstürze, Stufe wird auf die letzte gültige begrenzt, unbekannte Ketten werden übersprungen. → Test in Task 13.
3. **Gewicht mit Komma eingetippt** („72,4“ von der iPhone-Dezimaltastatur): muss als 72,4 kg gespeichert werden, Unsinn („abc“, „7“) wird abgelehnt. → Test in Task 8.
4. **Falsche oder zu neue Datei importiert** (Foto, kaputtes JSON, Export einer neueren App-Version): Import wird mit verständlicher Meldung abgelehnt, der aktuelle Stand bleibt unverändert. → Tests in Task 2.
5. **Wochenplan verweist auf ein gelöschtes Rezept** (Rezept aus `rezepte.json` entfernt): Einkaufsliste und Nährwerte überspringen es ohne Absturz, die Essen-Ansicht zeigt „Unbekanntes Rezept“ mit Entfernen. → Tests in Task 6 und Task 7, Anzeige in Task 18.

---

## Revision nach Review (14.10.2026) – gilt vor den Task-Texten

Quelle: `review-umsetzungsplan-2026-10-14.md` (Runde 1 und 2) und Rückfragen an den Nutzer. Wo ein Task-Text unten etwas anderes sagt, gilt dieser Abschnitt. Umsetzung **direkt** (ohne Subagents).

### Reihenfolge in Scheiben

| Scheibe | Tasks | Ergebnis |
|---|---|---|
| 1 Training am iPhone | 1, 2, 3, 4, 11, 13, 14, 15, schmale 20 (nur Training-Einstellungen und Daten), 21 | Training komplett nutzbar, offline, installierbar. **Danach anhalten:** Repo `peppdoe/fit-einkauf` (öffentlich) und GitHub Pages vorschlagen, erst nach OK deployen; Nutzer testet am iPhone. |
| 2 Essen & Einkauf | 5, 6, 7, 10, 17, 18, 19 | Wochenplan, Bibliothek, Einkaufsliste |
| 3 Gewicht & Rest von Mehr | 8, Rest von 20 | Gewicht, Ziele, Abneigungen, Jause-Tage |
| 4 Übungsfiguren | 9, 12, 16 | Figuren mit Nutzer-Freigabe (Task 12), auch für die drei neuen Stufen |
| Abschluss | 22 | Fotorunde, Aufräumen, Doku |
| Später | – | `aktionen.json` befüllen (wöchentliche Routine liest Flugblätter Lidl/Hofer/Spar), Packungsgrößen, Wochenkosten, „letztes Mal“ pro Übung |

`daten.js` kommt in Scheibe 1 mit `uebungen` und `trainingsplan` als Pflichtdateien; `zutaten`/`rezepte` werden in Scheibe 2 Pflicht, die Figurenprüfung (`pruefeFigur`) kommt in Scheibe 4. Bis dahin gilt eine Stufe ohne `figur` als „keine Figur“ (`aufloesen` liefert `figur: null`). `sw.js` listet in jeder Scheibe nur die vorhandenen Dateien (der Test prüft das).

### Änderungen pro Task

- **Global Constraints:** Startziele nur **2950 kcal, 130 g Protein** (Fett/KH gestrichen, Rezepte haben nur kcal und Protein). Neue Einstellung `jauseTage` (Standard 4). Standard `stange: true`. Deployment ist Teil von Scheibe 1, aber nur nach ausdrücklichem OK.
- **Task 2 (Speicher):** `standardZustand().einstellungen` = `{ ziele: { kcal: 2950, protein: 130 }, jauseTage: 4, abneigungen, stange: true, grundvorratAusblenden, marktZuordnung, pauseSek }`. `Laufend` bekommt `pause: { bis: number (ms), dauer: number (s), text: string } | null` und pro Übung optional `partner: number | null` (Index der Supersatz-Partnerübung). `importieren`: `storage.getItem` in try/catch. Tests: Standardwerte (`stange` true, `jauseTage` 4, keine `fett`/`kh`), `laufend.pause` übersteht Speichern/Laden.
- **Task 3 (Rotation):** `ketten` darf Paare enthalten (`["druecken-horizontal", "ziehen"]`). Neu `bloeckeFuerEinheit(einheit, stange): string[][]` (Platzhalter ersetzt, doppelte Ketten in der Einheit entfernt, leere Blöcke weg); `kettenFuerEinheit` liefert die flache Liste daraus. Tests: Paar bleibt Paar, Duplikat ohne Stange fällt weg.
- **Task 7 (Nährwerte, Scheibe 2):** `typischerTag` = Wochensumme ÷ 7 je Teil (Abend Σ Portionen × Werte, Jause Σ Anzahl × Werte mit Reste = Ø-Abendportion, Snack Anzahl × Werte, Extra Σ Anzahl × Werte). Tests auf die neuen Zahlen umstellen (Beispiel aus dem Review: 7 × 1.100 + 4 × 650 + 7 × 605 + 7 × 560 → 2.636 kcal).
- **Task 11 (Übungen):** `druecken-horizontal` bekommt nach Diamond die Stufe „Liegestütz mit erhöhten Füßen“ 3×12 (mit `achtung`); `ziehen-stange` beginnt mit „Negativ-Klimmzug“ 3×5 und „Chin-up“ 3×5 (beide mit `achtung`). Stufenzahlen: 5 / 4 / 3 / 7 / 5 / 3 / 3 / 1. Trainingsplan mit 4 Einheiten `ok-a`, `beine`, `ok-b`, `beine-core` (alle schwer, siehe Spec 4.4); jede endet mit `mobilitaet`.
- **Task 13 (Einheit):** Routine-Teile haben `ziel = { saetze: 1, sek }`. `starteEinheit` setzt `partner` für Paare. `satzFertig`: hat die aktuelle Übung einen Partner mit offenen Sätzen → zum Partner, sonst bleiben, sonst nächste offene. Wert beim Wechsel = letzter Satz dieser Übung, sonst Ziel. Neu `pauseNach(vorher, nachher): boolean` – keine Pause nach Routine-Teilen, beim Wechsel von der ersten zur zweiten Übung eines Paars und am Ende. Tests dafür.
- **Task 15 (Training-Ansicht):** Pause steht in `laufend.pause` (Endzeit), `pause.js` zeichnet sie nach jedem Neuzeichnen/Neuladen wieder; „+15 s“ und „Weiter“ ändern den Zustand. `tonVorbereiten()` setzt `navigator.audioSession.type = 'playback'`, wo vorhanden. Am Ende: Ton und kurzes Aufblinken der Leiste (bei „Bewegung reduzieren“ ohne Blinken). Supersatz-Paare in der Übungsliste gekennzeichnet („⇄“). Export-Erinnerung (`exportFaellig`) auch auf der Startseite; Export-Logik in `js/ansichten/sicherung.js` (`exportieren(ctx)`), die Training und Mehr teilen.
- **Task 18 (Essen, Scheibe 2):** Nährwerte nur kcal und Protein. Hinweis, wenn weniger Jausen als `jauseTage` eingeplant sind.
- **Task 20 (Mehr):** Scheibe 1: Gruppen „Training“ (eine Pausenzeile „Pause zwischen Sätzen“ → `pauseSek.schwer`, Schalter Stange) und „Daten“. Scheibe 3: Gewicht, Tagesziele (nur kcal, Protein), Jause-Tage (Mini-Zähler 0–7), Abneigungen.
- **Task 21 (Offline):** App-Dateien **stale-while-revalidate** (sofort aus dem Cache, im Hintergrund aktualisieren, beim nächsten Start neu), `data/` Network-first. `VERSION` muss für Updates nicht mehr erhöht werden.

---

## Dateistruktur

```
index.html                 App-Gerüst (Titel, Meldung, <main id="haupt">, Pausen-/Blatt-Wurzel, Tab-Leiste)
manifest.webmanifest       Installation (Name „Fit & Einkauf“, standalone, Icon)
sw.js                      Service Worker (App-Dateien Cache-first, data/ Network-first)
package.json               nur Vitest (dev)
css/tokens.css             (vorhanden) Design-Tokens
css/komponenten.css        (vorhanden, wird ergänzt) Komponenten
bilder/symbole.svg         (vorhanden, wird ergänzt) Symbole
bilder/icon.svg, icon-512.png  App-Icon
data/zutaten.json          Zutaten-Katalog
data/rezepte.json          Rezept-Bibliothek
data/uebungen.json         Übungsketten mit Zielen, Hinweisen, Figuren
data/trainingsplan.json    Rotation (6 Einheiten)
js/app.js                  Start, ctx (Zustand + aendern), Router-Anbindung, Meldungen
js/route.js                parseRoute(hash)
js/daten.js                verknuepfe(), ladeDaten()
js/speicher.js             Laden/Speichern/Migration/Import/Export
js/logik/datum.js          heute, plusTage, tageZwischen, montag, isoWoche
js/logik/rotation.js       kettenFuerEinheit, naechsteEinheit, abschliessen, ueberspringen
js/logik/progression.js    zielFuer, zielwert, erreicht, erfolgsserie, vorschlaegeNachAbschluss, stufeVerschieben
js/logik/einheit.js        aufloesen, starteEinheit, satzFertig, waehle, eintragAusLaufend, schrittweite
js/logik/filter.js         istAusgeblendet, teileRezepte
js/logik/einkaufsliste.js  bedarf, runde, einkaufsliste, nachRezept, aktionFuer, abhaken/aufgebraucht/neueWoche
js/logik/naehrwerte.js     typischerTag
js/logik/gewicht.js        parseKg, eintragen, wochenschnitte, trendProMonat, empfehlung
js/logik/figur.js          gelenke, poseZuSvg, pruefePose, pruefeFigur, winkel
js/logik/wochenplan.js     hinzufuegen, entfernen, austauschen, anzahlAendern
js/ansichten/html.js       esc, sym, zahl, mengeText, zielText, datumKurz, sicher
js/ansichten/blatt.js      Blatt von unten (oeffne/schliesse)
js/ansichten/pause.js      Pausen-Leiste mit Ton
js/ansichten/wachhalten.js Screen Wake Lock
js/ansichten/figur-ansicht.js  figurMini, soGehtsOeffnen
js/ansichten/training.js | essen.js | einkauf.js | mehr.js
muster/figuren.html        Sammelseite aller Übungsfiguren (Entwicklung)
tools/server.mjs           lokaler Server (Port 8765)
tools/rahmen.html          375-px-Rahmen für Bildschirmfotos, kann Testzustand laden
tools/foto.mjs             Bildschirmfoto mit Edge headless
tools/zustaende/*.json     Testzustände für Fotos (laufend, voll)
tests/*.test.js            Vitest
```

**Ablauf-Konvention für alle Ansichten:** `export function zeige(wurzel, ctx, route)`. `ctx` hat `zustand`, `daten`, `meldung`, `aendern(fn)` (fn verändert `ctx.zustand` direkt; danach wird gespeichert und neu gezeichnet), `navigiere(hash)`, `ersetzen(zustand)`. Jede Ansicht setzt `wurzel.onclick` (und bei Bedarf `onchange`, `onsubmit`, `onpointerdown`) bei jedem Zeichnen neu.

**Lokaler Server und Fotos** (ab Task 14): `npm run serve` startet `http://127.0.0.1:8765/`. Bildschirmfoto: `node tools/foto.mjs "<pfad#hash>" <datei.png> <hell|dunkel> [höhe] [zustand]`, z. B. `node tools/foto.mjs "index.html#/training" fotos/training.png hell 812 laufend`. Wenn ein eingebauter Browser verfügbar ist (Skill `anthropic-skills:built-in-browser`), Abläufe dort bei 375×812 von Hand durchklicken; sonst Fotos mit Testzuständen.

---

### Task 1: Projekt-Setup und Datumshilfen

**Files:**
- Create: `package.json`
- Create: `js/logik/datum.js`
- Test: `tests/datum.test.js`

**Interfaces:**
- Produces: `heute(jetzt?: Date): string` (lokales Datum `JJJJ-MM-TT`), `plusTage(datum: string, n: number): string`, `tageZwischen(von: string, bis: string): number` (bis − von in Tagen), `montag(datum: string): string`, `isoWoche(datum: string): string` (`"2026-W42"`).

- [ ] **Step 1: package.json anlegen und Vitest installieren**

```json
{
  "name": "fit-einkauf",
  "private": true,
  "type": "module",
  "scripts": {
    "test": "vitest run",
    "serve": "node tools/server.mjs"
  },
  "devDependencies": {
    "vitest": "^3.2.0"
  }
}
```

Run: `npm install`
Expected: `node_modules/` entsteht (ist bereits in `.gitignore`), `package-lock.json` wird erzeugt.

- [ ] **Step 2: Failing test schreiben** – `tests/datum.test.js`

```js
import { describe, it, expect } from 'vitest';
import { heute, plusTage, tageZwischen, montag, isoWoche } from '../js/logik/datum.js';

describe('datum', () => {
  it('heute liefert das lokale Datum', () => {
    expect(heute(new Date(2026, 9, 14, 23, 30))).toBe('2026-10-14');
  });
  it('plusTage geht über Monats- und Jahresgrenzen', () => {
    expect(plusTage('2026-12-31', 1)).toBe('2027-01-01');
    expect(plusTage('2026-03-01', -1)).toBe('2026-02-28');
  });
  it('tageZwischen zählt Tage', () => {
    expect(tageZwischen('2026-10-01', '2026-10-15')).toBe(14);
    expect(tageZwischen('2026-10-15', '2026-10-01')).toBe(-14);
  });
  it('montag liefert den Montag der Woche', () => {
    expect(montag('2026-10-14')).toBe('2026-10-12');
    expect(montag('2026-10-12')).toBe('2026-10-12');
    expect(montag('2026-10-18')).toBe('2026-10-12');
  });
  it('isoWoche inklusive Jahreswechsel', () => {
    expect(isoWoche('2026-10-14')).toBe('2026-W42');
    expect(isoWoche('2026-01-01')).toBe('2026-W01');
    expect(isoWoche('2027-01-01')).toBe('2026-W53');
    expect(isoWoche('2024-12-30')).toBe('2025-W01');
  });
});
```

- [ ] **Step 3: Test laufen lassen**

Run: `npx vitest run tests/datum.test.js`
Expected: FAIL (`Failed to resolve import "../js/logik/datum.js"`).

- [ ] **Step 4: Implementierung** – `js/logik/datum.js`

```js
// Datumshilfen. Alle Datumswerte sind Texte "JJJJ-MM-TT"; gerechnet wird in UTC, damit Sommerzeit nicht stört.

const TAG = 86400000;

function utc(datum) {
  const [j, m, t] = datum.split('-').map(Number);
  return Date.UTC(j, m - 1, t);
}

function alsText(ms) {
  return new Date(ms).toISOString().slice(0, 10);
}

export function heute(jetzt = new Date()) {
  const m = String(jetzt.getMonth() + 1).padStart(2, '0');
  const t = String(jetzt.getDate()).padStart(2, '0');
  return `${jetzt.getFullYear()}-${m}-${t}`;
}

export function plusTage(datum, n) {
  return alsText(utc(datum) + n * TAG);
}

export function tageZwischen(von, bis) {
  return Math.round((utc(bis) - utc(von)) / TAG);
}

export function montag(datum) {
  const wochentag = (new Date(utc(datum)).getUTCDay() + 6) % 7; // Montag = 0
  return plusTage(datum, -wochentag);
}

export function isoWoche(datum) {
  const donnerstag = plusTage(montag(datum), 3);
  const jahr = Number(donnerstag.slice(0, 4));
  const woche = Math.floor(tageZwischen(`${jahr}-01-01`, donnerstag) / 7) + 1;
  return `${jahr}-W${String(woche).padStart(2, '0')}`;
}
```

- [ ] **Step 5: Test laufen lassen**

Run: `npx vitest run tests/datum.test.js`
Expected: PASS (5 Tests).

- [ ] **Step 6: Commit**

```bash
git add package.json package-lock.json js/logik/datum.js tests/datum.test.js
git commit -m "feat: Projekt-Setup mit Vitest und Datumshilfen"
```

---

### Task 2: Speicher (Laden, Speichern, Migration, Import, Export)

**Files:**
- Create: `js/speicher.js`
- Test: `tests/speicher.test.js`

**Interfaces:**
- Consumes: `tageZwischen` aus `js/logik/datum.js`.
- Produces: `SCHEMA = 1`, `SCHLUESSEL = 'fitEinkauf'`, `MIGRATIONEN`, `standardZustand()`, `pruefeZustand(z): string[]`, `migriere(z, migrationen?, ziel?)`, `laden(storage): { zustand, meldung: null | 'defekt' | 'nicht-lesbar' }`, `speichern(storage, zustand): { ok: true } | { ok: false, fehler: 'voll' }`, `importieren(storage, text): { ok: true, zustand } | { ok: false, fehler: string }`, `exportDateiname(datum)`, `exportText(zustand)`, `exportFaellig(zustand, heuteDatum): boolean`. `storage` ist ein Objekt mit `getItem(key)`/`setItem(key, value)` (im Browser `window.localStorage`).
- Zustandsform (für alle späteren Tasks verbindlich):

```js
{
  schema: 1,
  einstellungen: { ziele: { kcal, protein, fett, kh }, abneigungen: string[], stange: boolean,
                   grundvorratAusblenden: boolean, marktZuordnung: { [zutatId]: 'Lidl'|'Hofer'|'Spar'|'egal' },
                   pauseSek: { schwer: number, leicht: number }, empfehlungKw?: string },
  training: { naechsteEinheit: number, stufen: { [ketteId]: number }, laufend: Laufend | null,
              vorschlaege: Vorschlag[], log: LogEintrag[] },
  essen: { wochenplan: { kw: string|null, abend: [{rezept, portionen}], jause: [{rezept, anzahl}],
                         snack: {rezept, anzahl} | null, extra: [{rezept, anzahl}] },
           abgehakt: { [schluessel]: true }, aufgebraucht: string[] },
  gewicht: [{ datum, kg }],
  letzterExport: string | null
}
// Laufend   = { index, art: 'schwer'|'leicht', datum, aktiv: number (-1 = alles erledigt), wert: number,
//               uebungen: [{ kette, stufe, teil: number|null, saetze: number[] }] }
// LogEintrag = { datum, einheit (1-basiert), art, uebungen: [{ kette, stufe, teil?, saetze }] }
// Vorschlag  = { kette, nach, name, ziel }
```

- [ ] **Step 1: Failing test schreiben** – `tests/speicher.test.js`

```js
import { describe, it, expect } from 'vitest';
import {
  SCHLUESSEL, standardZustand, pruefeZustand, migriere, laden, speichern,
  importieren, exportDateiname, exportText, exportFaellig,
} from '../js/speicher.js';

function fakeSpeicher(start = {}) {
  const daten = new Map(Object.entries(start));
  return {
    daten,
    getItem: (k) => (daten.has(k) ? daten.get(k) : null),
    setItem: (k, v) => { daten.set(k, String(v)); },
  };
}

describe('speicher', () => {
  it('ohne gespeicherte Daten: Standardzustand', () => {
    const { zustand, meldung } = laden(fakeSpeicher());
    expect(meldung).toBeNull();
    expect(zustand.einstellungen.ziele.kcal).toBe(2950);
    expect(zustand.einstellungen.abneigungen).toEqual(['curry', 'tofu']);
    expect(zustand.einstellungen.pauseSek).toEqual({ schwer: 90, leicht: 60 });
    expect(zustand.essen.wochenplan.snack).toEqual({ rezept: 'skyr-haferflocken', anzahl: 7 });
    expect(pruefeZustand(zustand)).toEqual([]);
  });

  it('angefangene Einheit übersteht Speichern und Laden', () => {
    const s = fakeSpeicher();
    const z = standardZustand();
    z.training.laufend = {
      index: 0, art: 'schwer', datum: '2026-10-14', aktiv: 0, wert: 11,
      uebungen: [{ kette: 'druecken-horizontal', stufe: 1, teil: null, saetze: [12] }],
    };
    expect(speichern(s, z)).toEqual({ ok: true });
    expect(laden(s).zustand.training.laufend).toEqual(z.training.laufend);
  });

  it('beschädigte Daten: Standardzustand und Rohtext unter .defekt', () => {
    const s = fakeSpeicher({ [SCHLUESSEL]: '{kaputt' });
    const { zustand, meldung } = laden(s);
    expect(meldung).toBe('defekt');
    expect(zustand).toEqual(standardZustand());
    expect(s.getItem(`${SCHLUESSEL}.defekt`)).toBe('{kaputt');
  });

  it('gültiges JSON mit falscher Form gilt als defekt', () => {
    const s = fakeSpeicher({ [SCHLUESSEL]: '{"schema":1}' });
    expect(laden(s).meldung).toBe('defekt');
  });

  it('nicht lesbarer Speicher', () => {
    const s = { getItem: () => { throw new Error('gesperrt'); }, setItem: () => {} };
    expect(laden(s).meldung).toBe('nicht-lesbar');
  });

  it('fehlende optionale Felder werden ergänzt', () => {
    const alt = standardZustand();
    delete alt.einstellungen.pauseSek;
    delete alt.training.vorschlaege;
    const s = fakeSpeicher({ [SCHLUESSEL]: JSON.stringify(alt) });
    const { zustand } = laden(s);
    expect(zustand.einstellungen.pauseSek).toEqual({ schwer: 90, leicht: 60 });
    expect(zustand.training.vorschlaege).toEqual([]);
  });

  it('voller Speicher', () => {
    const s = { getItem: () => null, setItem: () => { throw new Error('QuotaExceededError'); } };
    expect(speichern(s, standardZustand())).toEqual({ ok: false, fehler: 'voll' });
  });

  it('migriere führt Schritte der Reihe nach aus', () => {
    const migrationen = { 0: (z) => ({ ...z, neu: true }) };
    expect(migriere({ schema: 0 }, migrationen, 1)).toEqual({ schema: 1, neu: true });
  });

  it('migriere lehnt neuere Daten ab', () => {
    expect(() => migriere({ schema: 2 }, {}, 1)).toThrow(/neueren Version/);
  });

  it('Import: gültige Datei ersetzt den Stand und sichert den alten', () => {
    const alt = JSON.stringify(standardZustand());
    const s = fakeSpeicher({ [SCHLUESSEL]: alt });
    const neu = standardZustand();
    neu.gewicht = [{ datum: '2026-10-14', kg: 72.4 }];
    const r = importieren(s, JSON.stringify(neu));
    expect(r.ok).toBe(true);
    expect(r.zustand.gewicht).toEqual(neu.gewicht);
    expect(s.getItem(`${SCHLUESSEL}.backup`)).toBe(alt);
    expect(JSON.parse(s.getItem(SCHLUESSEL)).gewicht).toEqual(neu.gewicht);
  });

  it('Import: kein JSON wird abgelehnt, Stand bleibt', () => {
    const alt = JSON.stringify(standardZustand());
    const s = fakeSpeicher({ [SCHLUESSEL]: alt });
    const r = importieren(s, '\u0089PNG binär');
    expect(r).toEqual({ ok: false, fehler: 'Die Datei ist kein gültiges JSON.' });
    expect(s.getItem(SCHLUESSEL)).toBe(alt);
    expect(s.getItem(`${SCHLUESSEL}.backup`)).toBeNull();
  });

  it('Import: falsche Form wird mit Grund abgelehnt', () => {
    const r = importieren(fakeSpeicher(), JSON.stringify({ schema: 1, foto: true }));
    expect(r.ok).toBe(false);
    expect(r.fehler).toMatch(/^Die Datei passt nicht/);
  });

  it('Import: Datei aus neuerer Version wird abgelehnt', () => {
    const neuer = { ...standardZustand(), schema: 9 };
    const s = fakeSpeicher();
    const r = importieren(s, JSON.stringify(neuer));
    expect(r.ok).toBe(false);
    expect(r.fehler).toMatch(/neueren Version/);
    expect(s.getItem(SCHLUESSEL)).toBeNull();
  });

  it('Export-Dateiname und Text', () => {
    expect(exportDateiname('2026-10-14')).toBe('fit-einkauf-2026-10-14.json');
    expect(JSON.parse(exportText(standardZustand()))).toEqual(standardZustand());
  });

  it('Export fällig nach mehr als 14 Tagen oder nie exportiert mit Daten', () => {
    const z = standardZustand();
    expect(exportFaellig(z, '2026-10-14')).toBe(false);
    z.gewicht = [{ datum: '2026-10-01', kg: 72 }];
    expect(exportFaellig(z, '2026-10-14')).toBe(true);
    z.letzterExport = '2026-10-01';
    expect(exportFaellig(z, '2026-10-15')).toBe(false);
    expect(exportFaellig(z, '2026-10-16')).toBe(true);
  });
});
```

- [ ] **Step 2: Test laufen lassen**

Run: `npx vitest run tests/speicher.test.js`
Expected: FAIL (`Failed to resolve import "../js/speicher.js"`).

- [ ] **Step 3: Implementierung** – `js/speicher.js`

```js
// Persistenz in localStorage. storage wird übergeben (Browser: window.localStorage), damit es ohne Browser testbar ist.
import { tageZwischen } from './logik/datum.js';

export const SCHEMA = 1;
export const SCHLUESSEL = 'fitEinkauf';

// Migrationen: Schlüssel = altes Schema, Funktion liefert den Zustand für Schema + 1.
export const MIGRATIONEN = {};

export function standardZustand() {
  return {
    schema: SCHEMA,
    einstellungen: {
      ziele: { kcal: 2950, protein: 130, fett: 75, kh: 430 },
      abneigungen: ['curry', 'tofu'],
      stange: false,
      grundvorratAusblenden: false,
      marktZuordnung: {},
      pauseSek: { schwer: 90, leicht: 60 },
    },
    training: { naechsteEinheit: 0, stufen: {}, laufend: null, vorschlaege: [], log: [] },
    essen: {
      wochenplan: { kw: null, abend: [], jause: [], snack: { rezept: 'skyr-haferflocken', anzahl: 7 }, extra: [] },
      abgehakt: {},
      aufgebraucht: [],
    },
    gewicht: [],
    letzterExport: null,
  };
}

const istObjekt = (x) => x !== null && typeof x === 'object' && !Array.isArray(x);

export function pruefeZustand(z) {
  if (!istObjekt(z)) return ['kein Datenobjekt'];
  const fehler = [];
  if (!Number.isInteger(z.schema)) fehler.push('schema fehlt');
  if (!istObjekt(z.einstellungen) || !istObjekt(z.einstellungen.ziele)) fehler.push('einstellungen fehlen');
  const t = z.training;
  if (!istObjekt(t) || !Number.isInteger(t.naechsteEinheit) || !istObjekt(t.stufen) || !Array.isArray(t.log)) {
    fehler.push('training fehlt');
  }
  const e = z.essen;
  if (!istObjekt(e) || !istObjekt(e.wochenplan) || !istObjekt(e.abgehakt) || !Array.isArray(e.aufgebraucht)) {
    fehler.push('essen fehlt');
  }
  if (!Array.isArray(z.gewicht)) fehler.push('gewicht fehlt');
  return fehler;
}

export function migriere(z, migrationen = MIGRATIONEN, ziel = SCHEMA) {
  if (z.schema > ziel) throw new Error(`Die Daten stammen aus einer neueren Version der App (Schema ${z.schema}).`);
  let aktuell = z;
  while (aktuell.schema < ziel) {
    const schritt = migrationen[aktuell.schema];
    if (!schritt) throw new Error(`Keine Migration von Schema ${aktuell.schema} vorhanden.`);
    aktuell = { ...schritt(aktuell), schema: aktuell.schema + 1 };
  }
  return aktuell;
}

// Füllt fehlende optionale Felder mit Standardwerten (z. B. nach einem Import älterer Exporte).
function ergaenze(z) {
  const s = standardZustand();
  return {
    ...s,
    ...z,
    einstellungen: {
      ...s.einstellungen,
      ...z.einstellungen,
      pauseSek: { ...s.einstellungen.pauseSek, ...z.einstellungen.pauseSek },
    },
    training: { ...s.training, ...z.training },
    essen: { ...s.essen, ...z.essen, wochenplan: { ...s.essen.wochenplan, ...z.essen.wochenplan } },
  };
}

export function laden(storage) {
  let roh;
  try {
    roh = storage.getItem(SCHLUESSEL);
  } catch {
    return { zustand: standardZustand(), meldung: 'nicht-lesbar' };
  }
  if (roh === null) return { zustand: standardZustand(), meldung: null };
  try {
    const z = JSON.parse(roh);
    if (pruefeZustand(z).length) throw new Error('ungültig');
    return { zustand: ergaenze(migriere(z)), meldung: null };
  } catch {
    try {
      storage.setItem(`${SCHLUESSEL}.defekt`, roh);
    } catch {
      // Speicher voll: der Rohtext bleibt dann unter dem Hauptschlüssel, bis wieder gespeichert wird.
    }
    return { zustand: standardZustand(), meldung: 'defekt' };
  }
}

export function speichern(storage, zustand) {
  try {
    storage.setItem(SCHLUESSEL, JSON.stringify(zustand));
    return { ok: true };
  } catch {
    return { ok: false, fehler: 'voll' };
  }
}

export function importieren(storage, text) {
  let z;
  try {
    z = JSON.parse(text);
  } catch {
    return { ok: false, fehler: 'Die Datei ist kein gültiges JSON.' };
  }
  const fehler = pruefeZustand(z);
  if (fehler.length) return { ok: false, fehler: `Die Datei passt nicht zu Fit & Einkauf (${fehler.join(', ')}).` };
  try {
    z = ergaenze(migriere(z));
  } catch (e) {
    return { ok: false, fehler: e.message };
  }
  const alt = storage.getItem(SCHLUESSEL);
  if (alt !== null) storage.setItem(`${SCHLUESSEL}.backup`, alt);
  const r = speichern(storage, z);
  return r.ok ? { ok: true, zustand: z } : { ok: false, fehler: 'Der Speicher ist voll.' };
}

export const exportDateiname = (datum) => `fit-einkauf-${datum}.json`;

export const exportText = (zustand) => JSON.stringify(zustand, null, 2);

export function exportFaellig(zustand, heuteDatum) {
  if (zustand.letzterExport === null) return zustand.training.log.length > 0 || zustand.gewicht.length > 0;
  return tageZwischen(zustand.letzterExport, heuteDatum) > 14;
}
```

- [ ] **Step 4: Test laufen lassen**

Run: `npx vitest run tests/speicher.test.js`
Expected: PASS (15 Tests).

- [ ] **Step 5: Commit**

```bash
git add js/speicher.js tests/speicher.test.js
git commit -m "feat: Speicher mit Migration, Import mit Sicherung und Export-Erinnerung"
```

---

### Task 3: Rotation

**Files:**
- Create: `js/logik/rotation.js`
- Test: `tests/rotation.test.js`

**Interfaces:**
- Consumes: Trainingsplan-Form `{ einheiten: [{ id, name, art: 'schwer'|'leicht', ketten: string[], dauer }] }`; die Kette `"ziehen"` ist ein Platzhalter.
- Produces: `kettenFuerEinheit(einheit, stange: boolean): string[]` (`ziehen` → `ziehen-stange` bzw. `ziehen-ohne-stange`), `naechsteEinheit(training, plan)`, `abschliessen(training, plan, eintrag)`, `ueberspringen(training, plan)` (beide liefern ein neues `training`-Objekt mit `laufend: null`).

- [ ] **Step 1: Failing test schreiben** – `tests/rotation.test.js`

```js
import { describe, it, expect } from 'vitest';
import { kettenFuerEinheit, naechsteEinheit, abschliessen, ueberspringen } from '../js/logik/rotation.js';

const plan = {
  einheiten: [
    { id: 'a', name: 'Oberkörper A', art: 'schwer', ketten: ['druecken-horizontal', 'ziehen', 'core'], dauer: '25 min' },
    { id: 'b', name: 'Beine', art: 'schwer', ketten: ['beine'], dauer: '25 min' },
    { id: 'c', name: 'Mobilität', art: 'leicht', ketten: ['mobilitaet'], dauer: '15 min' },
  ],
};
const training = { naechsteEinheit: 2, stufen: {}, laufend: { index: 2 }, vorschlaege: [], log: [] };

describe('rotation', () => {
  it('ersetzt ziehen je nach Stange', () => {
    expect(kettenFuerEinheit(plan.einheiten[0], false)).toEqual(['druecken-horizontal', 'ziehen-ohne-stange', 'core']);
    expect(kettenFuerEinheit(plan.einheiten[0], true)).toEqual(['druecken-horizontal', 'ziehen-stange', 'core']);
  });
  it('liefert die Einheit am Index', () => {
    expect(naechsteEinheit(training, plan).id).toBe('c');
  });
  it('abschliessen hängt an, rückt weiter (mit Umlauf) und beendet laufend', () => {
    const eintrag = { datum: '2026-10-14', einheit: 3, art: 'leicht', uebungen: [] };
    const neu = abschliessen(training, plan, eintrag);
    expect(neu.log).toEqual([eintrag]);
    expect(neu.naechsteEinheit).toBe(0);
    expect(neu.laufend).toBeNull();
    expect(training.log).toEqual([]); // Original unverändert
  });
  it('ueberspringen rückt weiter ohne Log', () => {
    const neu = ueberspringen({ ...training, naechsteEinheit: 0 }, plan);
    expect(neu.naechsteEinheit).toBe(1);
    expect(neu.log).toEqual([]);
    expect(neu.laufend).toBeNull();
  });
});
```

- [ ] **Step 2: Test laufen lassen**

Run: `npx vitest run tests/rotation.test.js`
Expected: FAIL (Modul fehlt).

- [ ] **Step 3: Implementierung** – `js/logik/rotation.js`

```js
// Rotation nach Ablauf: es kommt immer die nächste Einheit, verpasste Tage verschieben nichts.

export function kettenFuerEinheit(einheit, stange) {
  return einheit.ketten.map((id) => (id === 'ziehen' ? (stange ? 'ziehen-stange' : 'ziehen-ohne-stange') : id));
}

export function naechsteEinheit(training, plan) {
  return plan.einheiten[training.naechsteEinheit % plan.einheiten.length];
}

export function abschliessen(training, plan, eintrag) {
  return {
    ...training,
    log: [...training.log, eintrag],
    naechsteEinheit: (training.naechsteEinheit + 1) % plan.einheiten.length,
    laufend: null,
  };
}

export function ueberspringen(training, plan) {
  return {
    ...training,
    naechsteEinheit: (training.naechsteEinheit + 1) % plan.einheiten.length,
    laufend: null,
  };
}
```

- [ ] **Step 4: Test laufen lassen**

Run: `npx vitest run tests/rotation.test.js`
Expected: PASS (4 Tests).

- [ ] **Step 5: Commit**

```bash
git add js/logik/rotation.js tests/rotation.test.js
git commit -m "feat: Trainings-Rotation"
```

---

### Task 4: Progression

**Files:**
- Create: `js/logik/progression.js`
- Test: `tests/progression.test.js`

**Interfaces:**
- Consumes: Ketten-Form `{ id, name, stufen: [{ name, ziel: { saetze, wdh? , sek? }, seitig?, routine? }] }`, Log-Einträge aus Task 2.
- Produces: `zielFuer(stufe, art)` (leicht: höchstens 2 Sätze), `zielwert(ziel)` (`wdh ?? sek`), `erreicht(saetze, ziel): boolean`, `erfolgsserie(log, kette, stufe): number`, `vorschlaegeNachAbschluss(log, stufen, kettenById): Vorschlag[]`, `stufeVerschieben(stufen, kette, delta)` (neues `stufen`-Objekt, begrenzt auf 0 … letzte Stufe).

- [ ] **Step 1: Failing test schreiben** – `tests/progression.test.js`

```js
import { describe, it, expect } from 'vitest';
import {
  zielFuer, zielwert, erreicht, erfolgsserie, vorschlaegeNachAbschluss, stufeVerschieben,
} from '../js/logik/progression.js';

const kette = {
  id: 'druecken-horizontal',
  name: 'Drücken horizontal',
  stufen: [
    { name: 'Liegestütz', ziel: { saetze: 3, wdh: 15 } },
    { name: 'Diamond-Liegestütz', ziel: { saetze: 3, wdh: 12 } },
  ],
};
const kettenById = { [kette.id]: kette };
const eintrag = (art, saetze, stufe = 0, extra = {}) => ({
  datum: '2026-10-14', einheit: 1, art, uebungen: [{ kette: kette.id, stufe, saetze, ...extra }],
});

describe('progression', () => {
  it('leichte Einheit hat 2 Sätze, schwere das volle Ziel', () => {
    expect(zielFuer(kette.stufen[0], 'leicht')).toEqual({ saetze: 2, wdh: 15 });
    expect(zielFuer(kette.stufen[0], 'schwer')).toEqual({ saetze: 3, wdh: 15 });
    expect(kette.stufen[0].ziel.saetze).toBe(3); // nicht verändert
  });
  it('zielwert für Wiederholungen und Sekunden', () => {
    expect(zielwert({ saetze: 3, wdh: 15 })).toBe(15);
    expect(zielwert({ saetze: 3, sek: 45 })).toBe(45);
  });
  it('erreicht nur bei voller Satzzahl und allen Sätzen am Ziel', () => {
    const ziel = { saetze: 3, wdh: 15 };
    expect(erreicht([15, 15, 15], ziel)).toBe(true);
    expect(erreicht([15, 16, 20], ziel)).toBe(true);
    expect(erreicht([15, 15, 14], ziel)).toBe(false);
    expect(erreicht([15, 15], ziel)).toBe(false);
  });
  it('Serie zählt schwere Erfolge, leichte Einheiten dazwischen stören nicht', () => {
    const log = [eintrag('schwer', [15, 15, 15]), eintrag('leicht', [9, 8]), eintrag('schwer', [15, 15, 16])];
    expect(erfolgsserie(log, kette, 0)).toBe(2);
  });
  it('Serie bricht bei Misserfolg oder anderer Stufe ab', () => {
    expect(erfolgsserie([eintrag('schwer', [15, 15, 15]), eintrag('schwer', [15, 14, 15])], kette, 0)).toBe(0);
    expect(erfolgsserie([eintrag('schwer', [12, 12, 12], 1), eintrag('schwer', [15, 15, 15])], kette, 0)).toBe(1);
  });
  it('Routine-Teile (teil gesetzt) zählen nicht', () => {
    const log = [eintrag('schwer', [15, 15, 15], 0, { teil: 0 }), eintrag('schwer', [15, 15, 15], 0, { teil: 0 })];
    expect(erfolgsserie(log, kette, 0)).toBe(0);
  });
  it('Vorschlag nach zweitem schweren Erfolg', () => {
    const log = [eintrag('schwer', [15, 15, 15]), eintrag('schwer', [15, 15, 15])];
    expect(vorschlaegeNachAbschluss(log, {}, kettenById)).toEqual([
      { kette: kette.id, nach: 1, name: 'Diamond-Liegestütz', ziel: { saetze: 3, wdh: 12 } },
    ]);
  });
  it('kein Vorschlag nach leichter Einheit, auf letzter Stufe oder bei Serie 1', () => {
    const zweiErfolge = [eintrag('schwer', [15, 15, 15]), eintrag('schwer', [15, 15, 15])];
    expect(vorschlaegeNachAbschluss([...zweiErfolge, eintrag('leicht', [15, 15])], {}, kettenById)).toEqual([]);
    expect(vorschlaegeNachAbschluss([eintrag('schwer', [12, 12, 12], 1), eintrag('schwer', [12, 12, 12], 1)], { [kette.id]: 1 }, kettenById)).toEqual([]);
    expect(vorschlaegeNachAbschluss([eintrag('schwer', [15, 15, 15])], {}, kettenById)).toEqual([]);
    expect(vorschlaegeNachAbschluss([], {}, kettenById)).toEqual([]);
  });
  it('Stufe verschieben mit Grenzen', () => {
    expect(stufeVerschieben({}, kette, 1)).toEqual({ [kette.id]: 1 });
    expect(stufeVerschieben({ [kette.id]: 1 }, kette, 1)).toEqual({ [kette.id]: 1 });
    expect(stufeVerschieben({ [kette.id]: 0 }, kette, -1)).toEqual({ [kette.id]: 0 });
  });
});
```

- [ ] **Step 2: Test laufen lassen**

Run: `npx vitest run tests/progression.test.js`
Expected: FAIL (Modul fehlt).

- [ ] **Step 3: Implementierung** – `js/logik/progression.js`

```js
// Progression: Ziel in allen Sätzen an 2 aufeinanderfolgenden schweren Einheiten -> Steigerung vorschlagen.

export function zielFuer(stufe, art) {
  const ziel = { ...stufe.ziel };
  if (art === 'leicht') ziel.saetze = Math.min(ziel.saetze, 2);
  return ziel;
}

export const zielwert = (ziel) => ziel.wdh ?? ziel.sek;

export function erreicht(saetze, ziel) {
  if (saetze.length < ziel.saetze) return false;
  return saetze.slice(0, ziel.saetze).every((w) => w >= zielwert(ziel));
}

export function erfolgsserie(log, kette, stufe) {
  let serie = 0;
  for (let i = log.length - 1; i >= 0; i--) {
    const e = log[i];
    if (e.art !== 'schwer') continue;
    const u = e.uebungen.find((x) => x.kette === kette.id && x.teil == null);
    if (!u) continue;
    if (u.stufe !== stufe || !erreicht(u.saetze, kette.stufen[stufe].ziel)) break;
    serie++;
  }
  return serie;
}

export function vorschlaegeNachAbschluss(log, stufen, kettenById) {
  const letzter = log[log.length - 1];
  if (!letzter || letzter.art !== 'schwer') return [];
  return letzter.uebungen
    .filter((u) => u.teil == null)
    .flatMap((u) => {
      const kette = kettenById[u.kette];
      if (!kette) return [];
      const stufe = stufen[kette.id] ?? 0;
      if (stufe >= kette.stufen.length - 1 || erfolgsserie(log, kette, stufe) < 2) return [];
      const naechste = kette.stufen[stufe + 1];
      return [{ kette: kette.id, nach: stufe + 1, name: naechste.name, ziel: naechste.ziel }];
    });
}

export function stufeVerschieben(stufen, kette, delta) {
  const jetzt = stufen[kette.id] ?? 0;
  const neu = Math.max(0, Math.min(kette.stufen.length - 1, jetzt + delta));
  return { ...stufen, [kette.id]: neu };
}
```

- [ ] **Step 4: Test laufen lassen**

Run: `npx vitest run tests/progression.test.js`
Expected: PASS (9 Tests).

- [ ] **Step 5: Commit**

```bash
git add js/logik/progression.js tests/progression.test.js
git commit -m "feat: Progression mit Erfolgsserie und Steigerungsvorschlag"
```

---

### Task 5: Abneigungs-Filter

**Files:**
- Create: `js/logik/filter.js`
- Test: `tests/filter.test.js`

**Interfaces:**
- Consumes: Rezept-Form aus Task 10 (`name`, `tags?`, `beschreibung?`, `zutaten?: [{ zutat, menge?, einheit? }]`), Zutaten-Katalog `{ [id]: { name, ... } }`.
- Produces: `istAusgeblendet(rezept, abneigungen, zutaten): boolean`, `teileRezepte(rezepte, abneigungen, zutaten): { sichtbar, ausgeblendet }`.

- [ ] **Step 1: Failing test schreiben** – `tests/filter.test.js`

```js
import { describe, it, expect } from 'vitest';
import { istAusgeblendet, teileRezepte } from '../js/logik/filter.js';

const zutaten = { tofu: { name: 'Räuchertofu' }, reis: { name: 'Reis' }, currypaste: { name: 'Rote Currypaste' } };
const rezepte = [
  { id: 'a', name: 'Hühner-Curry', tags: ['huhn'], zutaten: [{ zutat: 'reis', menge: 100, einheit: 'g' }] },
  { id: 'b', name: 'Reispfanne', tags: ['reis'], zutaten: [{ zutat: 'tofu', menge: 200, einheit: 'g' }] },
  { id: 'c', name: 'Pfanne', tags: ['Thai-Curry'], zutaten: [] },
  { id: 'd', name: 'Leberkässemmel', beschreibung: 'aus der Feinkost' },
  { id: 'e', name: 'Reis mit Gemüse', tags: [], zutaten: [{ zutat: 'currypaste' }] },
];

describe('filter', () => {
  it('findet Abneigung in Name, Tags und Zutatennamen ohne Groß-/Kleinschreibung', () => {
    expect(istAusgeblendet(rezepte[0], ['curry'], zutaten)).toBe(true);
    expect(istAusgeblendet(rezepte[1], ['Tofu'], zutaten)).toBe(true);
    expect(istAusgeblendet(rezepte[2], ['curry'], zutaten)).toBe(true);
    expect(istAusgeblendet(rezepte[4], ['curry'], zutaten)).toBe(true);
    expect(istAusgeblendet(rezepte[3], ['curry'], zutaten)).toBe(false);
  });
  it('leere Abneigungen blenden nichts aus', () => {
    expect(istAusgeblendet(rezepte[0], ['', '  '], zutaten)).toBe(false);
  });
  it('teilt in sichtbar und ausgeblendet', () => {
    const { sichtbar, ausgeblendet } = teileRezepte(rezepte, ['curry', 'tofu'], zutaten);
    expect(sichtbar.map((r) => r.id)).toEqual(['d']);
    expect(ausgeblendet.map((r) => r.id)).toEqual(['a', 'b', 'c', 'e']);
  });
});
```

- [ ] **Step 2: Test laufen lassen**

Run: `npx vitest run tests/filter.test.js`
Expected: FAIL (Modul fehlt).

- [ ] **Step 3: Implementierung** – `js/logik/filter.js`

```js
// Abneigungen: ein Rezept ist ausgeblendet, wenn ein Eintrag in Name, Beschreibung, Tags oder Zutatennamen vorkommt.

export function istAusgeblendet(rezept, abneigungen, zutaten) {
  const texte = [
    rezept.name,
    rezept.beschreibung ?? '',
    ...(rezept.tags ?? []),
    ...(rezept.zutaten ?? []).map((z) => zutaten[z.zutat]?.name ?? z.zutat),
  ].map((t) => t.toLowerCase());
  return abneigungen.some((a) => {
    const suche = a.trim().toLowerCase();
    return suche !== '' && texte.some((t) => t.includes(suche));
  });
}

export function teileRezepte(rezepte, abneigungen, zutaten) {
  const sichtbar = [];
  const ausgeblendet = [];
  for (const r of rezepte) (istAusgeblendet(r, abneigungen, zutaten) ? ausgeblendet : sichtbar).push(r);
  return { sichtbar, ausgeblendet };
}
```

- [ ] **Step 4: Test laufen lassen**

Run: `npx vitest run tests/filter.test.js`
Expected: PASS (3 Tests).

- [ ] **Step 5: Commit**

```bash
git add js/logik/filter.js tests/filter.test.js
git commit -m "feat: Abneigungs-Filter für Rezepte"
```

---
### Task 6: Einkaufsliste

**Files:**
- Create: `js/logik/einkaufsliste.js`
- Test: `tests/einkaufsliste.test.js`

**Interfaces:**
- Consumes: Wochenplan aus Task 2, `rezepteById` (Rezept-Form Task 10: `{ id, typ, portionen, herkunft?, zutaten?: [{ zutat, menge?, einheit? }] }`), Zutaten-Katalog `{ [id]: { name, kategorie, grundvorrat, standard_markt } }`, Aktionen `[{ zutat, markt, artikel, preis, gueltig_von, gueltig_bis }]`.
- Produces:
  - `MAERKTE`, `KATEGORIEN`
  - `bedarf(wochenplan, rezepteById): [{ schluessel, zutat, einheit, menge: number|null, rezepte: string[] }]` (ungerundet)
  - `runde(menge, einheit): number|null`
  - `marktFuer(zutatId, zutaten, marktZuordnung): string`
  - `aktionFuer(zutatId, aktionen, heuteDatum): Aktion|null`
  - `einkaufsliste(bedarfListe, zutaten, einstellungen, aufgebraucht, aktionen?, heuteDatum?): [{ markt, anzahl, kategorien: [{ kategorie, zeilen: [{ schluessel, zutat, name, menge, einheit, grundvorrat, aufgebraucht, aktion }] }] }]`
  - `nachRezept(wochenplan, rezepteById, zutaten): [{ rezept, name, menge, zeilen: [{ name, menge, einheit }] }]`
  - `abhakenUmschalten(essen, schluessel)`, `aufgebrauchtUmschalten(essen, zutatId)`, `neueWoche(essen, kw)` (liefern neue `essen`-Objekte)

- [ ] **Step 1: Failing test schreiben** – `tests/einkaufsliste.test.js`

```js
import { describe, it, expect } from 'vitest';
import {
  bedarf, runde, einkaufsliste, nachRezept, aktionFuer, marktFuer,
  abhakenUmschalten, aufgebrauchtUmschalten, neueWoche,
} from '../js/logik/einkaufsliste.js';

const zutaten = {
  huhn: { name: 'Hühnerbrustfilet', kategorie: 'Fleisch & Fisch', grundvorrat: false, standard_markt: 'Hofer' },
  reis: { name: 'Reis', kategorie: 'Vorrat', grundvorrat: true, standard_markt: 'egal' },
  paprika: { name: 'Paprika', kategorie: 'Obst & Gemüse', grundvorrat: false, standard_markt: 'egal' },
  eier: { name: 'Eier', kategorie: 'Kühlregal', grundvorrat: false, standard_markt: 'Lidl' },
  oel: { name: 'Olivenöl', kategorie: 'Vorrat', grundvorrat: true, standard_markt: 'egal' },
  salz: { name: 'Salz', kategorie: 'Gewürze', grundvorrat: true, standard_markt: 'egal' },
  mais: { name: 'Mais', kategorie: 'Vorrat', grundvorrat: false, standard_markt: 'egal' },
};
const rezepteById = {
  pfanne: { id: 'pfanne', name: 'Pfanne', typ: 'abend', portionen: 4, zutaten: [
    { zutat: 'huhn', menge: 1000, einheit: 'g' }, { zutat: 'reis', menge: 800, einheit: 'g' },
    { zutat: 'paprika', menge: 2, einheit: 'Stück' }, { zutat: 'oel', menge: 3, einheit: 'EL' }, { zutat: 'salz' },
  ] },
  reispfanne: { id: 'reispfanne', name: 'Reispfanne', typ: 'abend', portionen: 4, zutaten: [
    { zutat: 'reis', menge: 500, einheit: 'g' }, { zutat: 'paprika', menge: 1, einheit: 'Stück' },
    { zutat: 'mais', menge: 1, einheit: 'Dose' },
  ] },
  eierjause: { id: 'eierjause', name: 'Eierjause', typ: 'jause', herkunft: 'mitnehmen', portionen: 1, zutaten: [
    { zutat: 'eier', menge: 3, einheit: 'Stück' }, { zutat: 'mais', menge: 70, einheit: 'g' },
  ] },
  sparjause: { id: 'sparjause', name: 'Leberkässemmel', typ: 'jause', herkunft: 'spar', portionen: 1, beschreibung: 'Feinkost' },
  snack: { id: 'snack', name: 'Snack', typ: 'snack', portionen: 1, zutaten: [{ zutat: 'mais', menge: 20, einheit: 'g' }] },
};
const plan = {
  kw: '2026-W42',
  abend: [{ rezept: 'pfanne', portionen: 2 }, { rezept: 'reispfanne', portionen: 4 }],
  jause: [{ rezept: 'eierjause', anzahl: 3 }, { rezept: 'sparjause', anzahl: 2 }, { rezept: 'geloescht', anzahl: 1 }],
  snack: { rezept: 'snack', anzahl: 7 },
  extra: [],
};
const einstellungen = { grundvorratAusblenden: false, marktZuordnung: {} };
const finde = (liste, zutat, einheit) => liste.flatMap((m) => m.kategorien.flatMap((k) => k.zeilen))
  .find((z) => z.zutat === zutat && (einheit === undefined || z.einheit === einheit));

describe('bedarf', () => {
  it('rechnet Portionen um, summiert gleiche Einheiten, trennt verschiedene', () => {
    const b = bedarf(plan, rezepteById);
    const get = (s) => b.find((x) => x.schluessel === s);
    expect(b).toHaveLength(8);
    expect(get('huhn|g').menge).toBe(500);
    expect(get('reis|g')).toMatchObject({ menge: 900, rezepte: ['pfanne', 'reispfanne'] });
    expect(get('paprika|Stück').menge).toBe(2);
    expect(get('oel|EL').menge).toBe(1.5);
    expect(get('salz|').menge).toBeNull();
    expect(get('eier|Stück').menge).toBe(9);
    expect(get('mais|g').menge).toBe(350);
    expect(get('mais|Dose').menge).toBe(1);
  });
  it('Spar-Jause und gelöschte Rezepte erzeugen keine Zeilen', () => {
    const b = bedarf({ ...plan, abend: [], snack: null, jause: [{ rezept: 'sparjause', anzahl: 5 }, { rezept: 'geloescht', anzahl: 1 }] }, rezepteById);
    expect(b).toEqual([]);
  });
});

describe('runde', () => {
  it('g und ml auf 10 aufrunden, mindestens 10', () => {
    expect(runde(562.5, 'g')).toBe(570);
    expect(runde(1, 'g')).toBe(10);
    expect(runde(1000, 'g')).toBe(1000);
    expect(runde(255, 'ml')).toBe(260);
  });
  it('Stück & Co. auf 0,5 aufrunden', () => {
    expect(runde(1.2, 'Stück')).toBe(1.5);
    expect(runde(1.5, 'EL')).toBe(1.5);
    expect(runde(0.75, 'Dose')).toBe(1);
    expect(runde(3, 'Stück')).toBe(3);
  });
  it('ohne Menge bleibt null', () => {
    expect(runde(null, '')).toBeNull();
  });
});

describe('einkaufsliste', () => {
  it('gruppiert nach Markt (feste Reihenfolge) und Kategorie (Laufweg)', () => {
    const liste = einkaufsliste(bedarf(plan, rezepteById), zutaten, einstellungen, []);
    expect(liste.map((m) => m.markt)).toEqual(['Lidl', 'Hofer', 'egal']);
    const egal = liste.find((m) => m.markt === 'egal');
    expect(egal.kategorien.map((k) => k.kategorie)).toEqual(['Obst & Gemüse', 'Vorrat', 'Gewürze']);
    expect(egal.kategorien[1].zeilen.map((z) => z.name)).toEqual(['Mais', 'Mais', 'Olivenöl', 'Reis']);
    expect(egal.anzahl).toBe(6);
    expect(finde(liste, 'reis')).toMatchObject({ menge: 900, einheit: 'g', grundvorrat: true, aufgebraucht: false });
    expect(finde(liste, 'oel')).toMatchObject({ menge: 1.5, einheit: 'EL' });
  });
  it('Grundvorrat ausblenden, außer aufgebraucht', () => {
    const liste = einkaufsliste(bedarf(plan, rezepteById), zutaten, { ...einstellungen, grundvorratAusblenden: true }, ['oel']);
    expect(finde(liste, 'reis')).toBeUndefined();
    expect(finde(liste, 'salz')).toBeUndefined();
    expect(finde(liste, 'oel')).toMatchObject({ aufgebraucht: true });
  });
  it('aufgebrauchter Vorrat ohne Rezept im Plan steht trotzdem drauf; unbekannte Zutat unter egal/Sonstiges', () => {
    const liste = einkaufsliste([], zutaten, einstellungen, ['oel', 'butter']);
    expect(finde(liste, 'oel')).toMatchObject({ menge: null, aufgebraucht: true });
    const egal = liste.find((m) => m.markt === 'egal');
    expect(egal.kategorien.map((k) => k.kategorie)).toEqual(['Vorrat', 'Sonstiges']);
    expect(finde(liste, 'butter')).toMatchObject({ name: 'butter' });
  });
  it('eigene Markt-Zuordnung hat Vorrang', () => {
    const liste = einkaufsliste(bedarf(plan, rezepteById), zutaten, { ...einstellungen, marktZuordnung: { reis: 'Hofer' } }, []);
    const hofer = liste.find((m) => m.markt === 'Hofer');
    expect(hofer.kategorien.flatMap((k) => k.zeilen).map((z) => z.zutat)).toEqual(['huhn', 'reis']);
    expect(marktFuer('reis', zutaten, { reis: 'Hofer' })).toBe('Hofer');
    expect(marktFuer('unbekannt', zutaten, {})).toBe('egal');
  });
  it('Aktion nur im Gültigkeitszeitraum', () => {
    const aktionen = [{ zutat: 'huhn', markt: 'Hofer', artikel: 'Hühnerbrustfilet', preis: 7.99, gueltig_von: '2026-10-16', gueltig_bis: '2026-10-18' }];
    expect(finde(einkaufsliste(bedarf(plan, rezepteById), zutaten, einstellungen, [], aktionen, '2026-10-17'), 'huhn').aktion.preis).toBe(7.99);
    expect(aktionFuer('huhn', aktionen, '2026-10-19')).toBeNull();
    expect(aktionFuer('huhn', aktionen, null)).toBeNull();
  });
});

describe('nachRezept', () => {
  it('pro Gericht die hochgerechneten Zutaten, Spar/gelöscht übersprungen', () => {
    const r = nachRezept(plan, rezepteById, zutaten);
    expect(r.map((x) => x.rezept)).toEqual(['pfanne', 'reispfanne', 'eierjause', 'snack']);
    expect(r[0]).toMatchObject({ name: 'Pfanne', menge: 2 });
    expect(r[0].zeilen).toEqual([
      { name: 'Hühnerbrustfilet', menge: 500, einheit: 'g' },
      { name: 'Reis', menge: 400, einheit: 'g' },
      { name: 'Paprika', menge: 1, einheit: 'Stück' },
      { name: 'Olivenöl', menge: 1.5, einheit: 'EL' },
      { name: 'Salz', menge: null, einheit: '' },
    ]);
  });
});

describe('Haken und Vorrat', () => {
  it('abhaken entfernt aus aufgebraucht, nochmal abhaken löscht den Haken', () => {
    const essen = { wochenplan: plan, abgehakt: {}, aufgebraucht: ['oel'] };
    const an = abhakenUmschalten(essen, 'oel|EL');
    expect(an.abgehakt).toEqual({ 'oel|EL': true });
    expect(an.aufgebraucht).toEqual([]);
    expect(abhakenUmschalten(an, 'oel|EL').abgehakt).toEqual({});
    expect(essen.aufgebraucht).toEqual(['oel']);
  });
  it('aufgebraucht umschalten', () => {
    const essen = { wochenplan: plan, abgehakt: {}, aufgebraucht: [] };
    const an = aufgebrauchtUmschalten(essen, 'reis');
    expect(an.aufgebraucht).toEqual(['reis']);
    expect(aufgebrauchtUmschalten(an, 'reis').aufgebraucht).toEqual([]);
  });
  it('neue Woche leert die Haken und setzt die KW', () => {
    const essen = { wochenplan: plan, abgehakt: { 'huhn|g': true }, aufgebraucht: ['oel'] };
    const neu = neueWoche(essen, '2026-W43');
    expect(neu.abgehakt).toEqual({});
    expect(neu.wochenplan.kw).toBe('2026-W43');
    expect(neu.wochenplan.abend).toBe(plan.abend);
    expect(neu.aufgebraucht).toEqual(['oel']);
  });
});
```

- [ ] **Step 2: Test laufen lassen**

Run: `npx vitest run tests/einkaufsliste.test.js`
Expected: FAIL (Modul fehlt).

- [ ] **Step 3: Implementierung** – `js/logik/einkaufsliste.js`

```js
// Einkaufsliste aus dem Wochenplan: summieren, runden, nach Markt und Kategorie gruppieren.

export const MAERKTE = ['Lidl', 'Hofer', 'Spar', 'egal'];
export const KATEGORIEN = [
  'Obst & Gemüse', 'Brot & Gebäck', 'Kühlregal', 'Fleisch & Fisch', 'Tiefkühl', 'Vorrat', 'Gewürze', 'Sonstiges',
];
const MASS_EINHEITEN = ['g', 'ml'];

function posten(wochenplan) {
  return [
    ...wochenplan.abend.map((e) => ({ rezept: e.rezept, menge: e.portionen })),
    ...wochenplan.jause.map((e) => ({ rezept: e.rezept, menge: e.anzahl, nurMitnehmen: true })),
    ...(wochenplan.snack ? [{ rezept: wochenplan.snack.rezept, menge: wochenplan.snack.anzahl }] : []),
    ...wochenplan.extra.map((e) => ({ rezept: e.rezept, menge: e.anzahl })),
  ];
}

function gueltigePosten(wochenplan, rezepteById) {
  return posten(wochenplan).flatMap((p) => {
    const rezept = rezepteById[p.rezept];
    if (!rezept) return []; // Rezept wurde aus der Bibliothek entfernt
    if (p.nurMitnehmen && rezept.herkunft !== 'mitnehmen') return []; // Spar-Jause und Reste
    return [{ rezept, menge: p.menge }];
  });
}

function skaliert(rezept, menge) {
  const faktor = menge / rezept.portionen;
  return (rezept.zutaten ?? []).map((z) => ({
    zutat: z.zutat,
    einheit: z.einheit ?? '',
    menge: z.menge == null ? null : z.menge * faktor,
  }));
}

function zutatInfo(id, zutaten) {
  return zutaten[id] ?? { name: id, kategorie: 'Sonstiges', grundvorrat: false, standard_markt: 'egal' };
}

export function bedarf(wochenplan, rezepteById) {
  const summe = new Map();
  for (const { rezept, menge } of gueltigePosten(wochenplan, rezepteById)) {
    for (const z of skaliert(rezept, menge)) {
      const schluessel = `${z.zutat}|${z.einheit}`;
      const alt = summe.get(schluessel);
      if (!alt) {
        summe.set(schluessel, { schluessel, ...z, rezepte: [rezept.id] });
        continue;
      }
      alt.menge = alt.menge == null || z.menge == null ? alt.menge ?? z.menge : alt.menge + z.menge;
      if (!alt.rezepte.includes(rezept.id)) alt.rezepte.push(rezept.id);
    }
  }
  return [...summe.values()];
}

export function runde(menge, einheit) {
  if (menge == null) return null;
  if (MASS_EINHEITEN.includes(einheit)) return Math.max(10, Math.ceil(menge / 10 - 1e-9) * 10);
  return Math.ceil(menge * 2 - 1e-9) / 2;
}

export function marktFuer(zutatId, zutaten, marktZuordnung) {
  return marktZuordnung[zutatId] ?? zutatInfo(zutatId, zutaten).standard_markt ?? 'egal';
}

export function aktionFuer(zutatId, aktionen, heuteDatum) {
  if (!heuteDatum) return null;
  return aktionen.find((a) => a.zutat === zutatId && a.gueltig_von <= heuteDatum && heuteDatum <= a.gueltig_bis) ?? null;
}

export function einkaufsliste(bedarfListe, zutaten, einstellungen, aufgebraucht, aktionen = [], heuteDatum = null) {
  const zeilen = bedarfListe.map((b) => ({
    schluessel: b.schluessel, zutat: b.zutat, menge: runde(b.menge, b.einheit), einheit: b.einheit,
  }));
  for (const id of aufgebraucht) {
    if (!zeilen.some((z) => z.zutat === id)) zeilen.push({ schluessel: `${id}|`, zutat: id, menge: null, einheit: '' });
  }

  const gruppen = new Map(); // markt -> Map(kategorie -> zeilen)
  for (const z of zeilen) {
    const info = zutatInfo(z.zutat, zutaten);
    const istAufgebraucht = aufgebraucht.includes(z.zutat);
    if (info.grundvorrat && einstellungen.grundvorratAusblenden && !istAufgebraucht) continue;
    const markt = marktFuer(z.zutat, zutaten, einstellungen.marktZuordnung);
    const kategorie = KATEGORIEN.includes(info.kategorie) ? info.kategorie : 'Sonstiges';
    if (!gruppen.has(markt)) gruppen.set(markt, new Map());
    const kategorien = gruppen.get(markt);
    if (!kategorien.has(kategorie)) kategorien.set(kategorie, []);
    kategorien.get(kategorie).push({
      ...z,
      name: info.name,
      grundvorrat: !!info.grundvorrat,
      aufgebraucht: istAufgebraucht,
      aktion: aktionFuer(z.zutat, aktionen, heuteDatum),
    });
  }

  return MAERKTE.filter((m) => gruppen.has(m)).map((markt) => {
    const kategorien = gruppen.get(markt);
    const geordnet = KATEGORIEN.filter((k) => kategorien.has(k)).map((kategorie) => ({
      kategorie,
      zeilen: kategorien.get(kategorie).sort((a, b) => a.name.localeCompare(b.name, 'de')),
    }));
    return { markt, anzahl: geordnet.reduce((s, k) => s + k.zeilen.length, 0), kategorien: geordnet };
  });
}

export function nachRezept(wochenplan, rezepteById, zutaten) {
  return gueltigePosten(wochenplan, rezepteById).map(({ rezept, menge }) => ({
    rezept: rezept.id,
    name: rezept.name,
    menge,
    zeilen: skaliert(rezept, menge).map((z) => ({
      name: zutatInfo(z.zutat, zutaten).name,
      menge: runde(z.menge, z.einheit),
      einheit: z.einheit,
    })),
  }));
}

export function abhakenUmschalten(essen, schluessel) {
  const an = !essen.abgehakt[schluessel];
  const abgehakt = { ...essen.abgehakt };
  if (an) abgehakt[schluessel] = true;
  else delete abgehakt[schluessel];
  const zutat = schluessel.split('|')[0];
  return { ...essen, abgehakt, aufgebraucht: an ? essen.aufgebraucht.filter((id) => id !== zutat) : essen.aufgebraucht };
}

export function aufgebrauchtUmschalten(essen, zutatId) {
  const drin = essen.aufgebraucht.includes(zutatId);
  return { ...essen, aufgebraucht: drin ? essen.aufgebraucht.filter((id) => id !== zutatId) : [...essen.aufgebraucht, zutatId] };
}

export function neueWoche(essen, kw) {
  return { ...essen, abgehakt: {}, wochenplan: { ...essen.wochenplan, kw } };
}
```

- [ ] **Step 4: Test laufen lassen**

Run: `npx vitest run tests/einkaufsliste.test.js`
Expected: PASS (14 Tests).

- [ ] **Step 5: Commit**

```bash
git add js/logik/einkaufsliste.js tests/einkaufsliste.test.js
git commit -m "feat: Einkaufsliste nach Markt und Rezept mit Grundvorrat und Aktionen"
```

---

### Task 7: Nährwerte („typischer Tag“)

**Files:**
- Create: `js/logik/naehrwerte.js`
- Test: `tests/naehrwerte.test.js`

**Interfaces:**
- Consumes: Wochenplan, `rezepteById` mit `pro_portion: { kcal, protein_g }` (Reste-Jause ohne `pro_portion`).
- Produces: `typischerTag(wochenplan, rezepteById): { abend, jause, snack, extra, summe }`, jeweils `{ kcal, protein }`.

- [ ] **Step 1: Failing test schreiben** – `tests/naehrwerte.test.js`

```js
import { describe, it, expect } from 'vitest';
import { typischerTag } from '../js/logik/naehrwerte.js';

const r = (id, typ, kcal, protein, extra = {}) => ({ id, typ, portionen: 1, pro_portion: { kcal, protein_g: protein }, ...extra });
const rezepteById = {
  a1: r('a1', 'abend', 1100, 73), a2: r('a2', 'abend', 1160, 62),
  j1: r('j1', 'jause', 715, 44, { herkunft: 'mitnehmen' }), j4: r('j4', 'jause', 610, 23, { herkunft: 'spar' }),
  reste: { id: 'reste', typ: 'jause', herkunft: 'reste', portionen: 1 },
  s: r('s', 'snack', 605, 41), e1: r('e1', 'extra', 605, 24), e2: r('e2', 'extra', 565, 19),
};
const leer = { kw: null, abend: [], jause: [], snack: null, extra: [] };

describe('typischerTag', () => {
  it('gewichtete Mittel, Jause über 5 Arbeitstage verteilt', () => {
    const t = typischerTag({
      ...leer,
      abend: [{ rezept: 'a1', portionen: 4 }, { rezept: 'a2', portionen: 4 }],
      jause: [{ rezept: 'j1', anzahl: 3 }, { rezept: 'j4', anzahl: 2 }],
      snack: { rezept: 's', anzahl: 7 },
      extra: [{ rezept: 'e1', anzahl: 4 }, { rezept: 'e2', anzahl: 3 }],
    }, rezepteById);
    expect(t.abend).toEqual({ kcal: 1130, protein: 67.5 });
    expect(t.jause.kcal).toBeCloseTo(673, 5);
    expect(t.jause.protein).toBeCloseTo(35.6, 5);
    expect(t.snack).toEqual({ kcal: 605, protein: 41 });
    expect(t.extra.kcal).toBeCloseTo(587.857, 2);
    expect(t.summe.kcal).toBeCloseTo(2995.857, 2);
    expect(t.summe.protein).toBeCloseTo(165.957, 2);
  });
  it('Reste-Jause zählt mit dem Ø-Abendessen', () => {
    const t = typischerTag({ ...leer, abend: [{ rezept: 'a1', portionen: 4 }], jause: [{ rezept: 'reste', anzahl: 1 }] }, rezepteById);
    expect(t.jause.kcal).toBeCloseTo(220, 5);
    expect(t.jause.protein).toBeCloseTo(14.6, 5);
  });
  it('gelöschte Rezepte werden ignoriert, leerer Plan ergibt 0', () => {
    const t = typischerTag({ ...leer, abend: [{ rezept: 'a1', portionen: 4 }, { rezept: 'weg', portionen: 4 }] }, rezepteById);
    expect(t.abend).toEqual({ kcal: 1100, protein: 73 });
    expect(typischerTag(leer, rezepteById).summe).toEqual({ kcal: 0, protein: 0 });
  });
});
```

- [ ] **Step 2: Test laufen lassen**

Run: `npx vitest run tests/naehrwerte.test.js`
Expected: FAIL (Modul fehlt).

- [ ] **Step 3: Implementierung** – `js/logik/naehrwerte.js`

```js
// "Typischer Tag": Ø-Abendportion + Ø-Jause (über 5 Arbeitstage) + Snack + Ø-Extra.

const NULL = { kcal: 0, protein: 0 };
const werte = (pro) => ({ kcal: pro?.kcal ?? 0, protein: pro?.protein_g ?? 0 });

function gewichtetesMittel(eintraege) {
  const gewicht = eintraege.reduce((s, e) => s + e.gewicht, 0);
  if (!gewicht) return { ...NULL };
  return {
    kcal: eintraege.reduce((s, e) => s + e.werte.kcal * e.gewicht, 0) / gewicht,
    protein: eintraege.reduce((s, e) => s + e.werte.protein * e.gewicht, 0) / gewicht,
  };
}

export function typischerTag(wochenplan, rezepteById) {
  const bekannt = (e) => rezepteById[e.rezept];
  const abend = gewichtetesMittel(
    wochenplan.abend.filter(bekannt).map((e) => ({ werte: werte(rezepteById[e.rezept].pro_portion), gewicht: e.portionen })),
  );

  const jauseSumme = wochenplan.jause.filter(bekannt).reduce((s, e) => {
    const rezept = rezepteById[e.rezept];
    const w = rezept.herkunft === 'reste' ? abend : werte(rezept.pro_portion);
    return { kcal: s.kcal + w.kcal * e.anzahl, protein: s.protein + w.protein * e.anzahl };
  }, { ...NULL });
  const jause = { kcal: jauseSumme.kcal / 5, protein: jauseSumme.protein / 5 };

  const snackRezept = wochenplan.snack && rezepteById[wochenplan.snack.rezept];
  const snack = snackRezept ? werte(snackRezept.pro_portion) : { ...NULL };

  const extra = gewichtetesMittel(
    wochenplan.extra.filter(bekannt).map((e) => ({ werte: werte(rezepteById[e.rezept].pro_portion), gewicht: e.anzahl })),
  );

  const teile = [abend, jause, snack, extra];
  const summe = {
    kcal: teile.reduce((s, t) => s + t.kcal, 0),
    protein: teile.reduce((s, t) => s + t.protein, 0),
  };
  return { abend, jause, snack, extra, summe };
}
```

- [ ] **Step 4: Test laufen lassen**

Run: `npx vitest run tests/naehrwerte.test.js`
Expected: PASS (3 Tests).

- [ ] **Step 5: Commit**

```bash
git add js/logik/naehrwerte.js tests/naehrwerte.test.js
git commit -m "feat: typischer Tag mit kcal und Protein"
```

---

### Task 8: Gewicht

**Files:**
- Create: `js/logik/gewicht.js`
- Test: `tests/gewicht.test.js`

**Interfaces:**
- Consumes: `isoWoche`, `montag`, `tageZwischen` aus `js/logik/datum.js`.
- Produces: `parseKg(text): number|null` (20–300 kg, Komma oder Punkt, auf 0,1 gerundet), `eintragen(gewicht, datum, kg)` (ersetzt den Eintrag desselben Tages, sortiert), `wochenschnitte(gewicht): [{ kw, montag, kg, anzahl }]`, `trendProMonat(gewicht): number|null`, `empfehlung(trend): -150|0|150|null`.

- [ ] **Step 1: Failing test schreiben** – `tests/gewicht.test.js`

```js
import { describe, it, expect } from 'vitest';
import { parseKg, eintragen, wochenschnitte, trendProMonat, empfehlung } from '../js/logik/gewicht.js';

describe('gewicht', () => {
  it('parseKg akzeptiert Komma und Punkt, lehnt Unsinn ab', () => {
    expect(parseKg('72,4')).toBe(72.4);
    expect(parseKg(' 72.46 ')).toBe(72.5);
    expect(parseKg('abc')).toBeNull();
    expect(parseKg('7')).toBeNull();
    expect(parseKg('')).toBeNull();
    expect(parseKg('350')).toBeNull();
  });
  it('eintragen ersetzt denselben Tag und sortiert', () => {
    const g = eintragen([{ datum: '2026-10-14', kg: 72 }, { datum: '2026-10-10', kg: 71.8 }], '2026-10-14', 72.4);
    expect(g).toEqual([{ datum: '2026-10-10', kg: 71.8 }, { datum: '2026-10-14', kg: 72.4 }]);
  });
  it('Wochenschnitt pro ISO-Woche', () => {
    const w = wochenschnitte([
      { datum: '2026-10-12', kg: 72.0 }, { datum: '2026-10-14', kg: 72.4 }, { datum: '2026-10-05', kg: 71.8 },
    ]);
    expect(w.map((x) => x.kw)).toEqual(['2026-W41', '2026-W42']);
    expect(w[1].kg).toBeCloseTo(72.2, 5);
    expect(w[1]).toMatchObject({ montag: '2026-10-12', anzahl: 2 });
  });
  it('Trend aus den letzten 4 Wochen, ältere Wochen zählen nicht', () => {
    const g = [
      { datum: '2026-08-31', kg: 80.0 },
      { datum: '2026-09-21', kg: 72.0 }, { datum: '2026-09-28', kg: 72.2 }, { datum: '2026-10-05', kg: 72.4 },
    ];
    expect(trendProMonat(g)).toBeCloseTo(0.867, 2);
    expect(empfehlung(trendProMonat(g))).toBe(-150);
  });
  it('Trend mit Lücken', () => {
    const g = [{ datum: '2026-09-21', kg: 72.0 }, { datum: '2026-10-05', kg: 72.1 }, { datum: '2026-10-12', kg: 72.15 }];
    expect(trendProMonat(g)).toBeCloseTo(0.217, 2);
    expect(empfehlung(trendProMonat(g))).toBe(150);
  });
  it('unter 3 Wochen kein Trend', () => {
    expect(trendProMonat([{ datum: '2026-10-05', kg: 72 }, { datum: '2026-10-12', kg: 72.5 }])).toBeNull();
    expect(trendProMonat([])).toBeNull();
  });
  it('Empfehlung mit Grenzen', () => {
    expect(empfehlung(null)).toBeNull();
    expect(empfehlung(0.5)).toBe(0);
    expect(empfehlung(0.75)).toBe(0);
    expect(empfehlung(0.25)).toBe(0);
    expect(empfehlung(0.76)).toBe(-150);
    expect(empfehlung(0.24)).toBe(150);
  });
});
```

- [ ] **Step 2: Test laufen lassen**

Run: `npx vitest run tests/gewicht.test.js`
Expected: FAIL (Modul fehlt).

- [ ] **Step 3: Implementierung** – `js/logik/gewicht.js`

```js
// Gewichts-Log: Wochenschnitt, Trend pro Monat (lineare Regression über die letzten 4 Wochen), kcal-Empfehlung.
import { isoWoche, montag, tageZwischen } from './datum.js';

export function parseKg(text) {
  const roh = String(text ?? '').trim();
  if (roh === '') return null;
  const n = Number(roh.replace(',', '.'));
  if (!Number.isFinite(n) || n < 20 || n > 300) return null;
  return Math.round(n * 10) / 10;
}

export function eintragen(gewicht, datum, kg) {
  return [...gewicht.filter((e) => e.datum !== datum), { datum, kg }].sort((a, b) => a.datum.localeCompare(b.datum));
}

export function wochenschnitte(gewicht) {
  const wochen = new Map();
  for (const e of gewicht) {
    const kw = isoWoche(e.datum);
    const w = wochen.get(kw) ?? { kw, montag: montag(e.datum), summe: 0, anzahl: 0 };
    w.summe += e.kg;
    w.anzahl += 1;
    wochen.set(kw, w);
  }
  return [...wochen.values()]
    .sort((a, b) => a.montag.localeCompare(b.montag))
    .map((w) => ({ kw: w.kw, montag: w.montag, kg: w.summe / w.anzahl, anzahl: w.anzahl }));
}

export function trendProMonat(gewicht) {
  const wochen = wochenschnitte(gewicht);
  if (!wochen.length) return null;
  const letzte = wochen[wochen.length - 1].montag;
  const fenster = wochen.filter((w) => tageZwischen(w.montag, letzte) < 28);
  if (fenster.length < 3) return null;
  const xs = fenster.map((w) => -tageZwischen(w.montag, letzte) / 7); // Wochen relativ zur letzten
  const ys = fenster.map((w) => w.kg);
  const mx = xs.reduce((s, x) => s + x, 0) / xs.length;
  const my = ys.reduce((s, y) => s + y, 0) / ys.length;
  let oben = 0;
  let unten = 0;
  xs.forEach((x, i) => {
    oben += (x - mx) * (ys[i] - my);
    unten += (x - mx) ** 2;
  });
  return ((oben / unten) * 52) / 12; // kg pro Woche -> kg pro Monat
}

export function empfehlung(trend) {
  if (trend == null) return null;
  if (trend > 0.75) return -150;
  if (trend < 0.25) return 150;
  return 0;
}
```

- [ ] **Step 4: Test laufen lassen**

Run: `npx vitest run tests/gewicht.test.js`
Expected: PASS (7 Tests).

- [ ] **Step 5: Commit**

```bash
git add js/logik/gewicht.js tests/gewicht.test.js
git commit -m "feat: Gewichts-Log mit Wochenschnitt, Trend und Empfehlung"
```

---

### Task 9: Übungsfigur (Logik)

**Files:**
- Create: `js/logik/figur.js`
- Test: `tests/figur.test.js`

**Interfaces:**
- Consumes: Pose-Form aus Spec 4.3.1: `{ huefte: [x, y], rumpf, arm: [oberarm, unterarm], bein: [oberschenkel, unterschenkel], arm2?, bein2? }`, Winkel in Grad (0 = rechts, 90 = unten).
- Produces: `BILD`, `LAENGE`, `GERAETE`, `punkt(von, winkel, laenge)`, `winkel(von, nach)`, `gelenke(pose): { huefte, schulter, kopf, vorn: { ellbogen, hand, knie, fuss }, hinten: {…} }`, `poseZuSvg(pose, geraet?): string` (Inhalt für `<svg viewBox="0 0 120 84">`), `pruefePose(pose): string[]`, `pruefeFigur(eintrag): string[]` (eintrag = Stufe oder Routine-Teil mit `figur` und `hinweise`).

- [ ] **Step 1: Failing test schreiben** – `tests/figur.test.js`

```js
import { describe, it, expect } from 'vitest';
import { punkt, winkel, gelenke, poseZuSvg, pruefePose, pruefeFigur } from '../js/logik/figur.js';

const stehend = { huefte: [60, 46], rumpf: -90, arm: [0, 0], bein: [90, 90] };
const gueltig = {
  name: 'Kniebeuge',
  figur: { geraet: 'boden', start: stehend, ende: { huefte: [51.8, 62.3], rumpf: -70, arm: [0, 0], bein: [10, 120] } },
  hinweise: ['Füße schulterbreit.', 'Hüfte nach hinten.'],
};

describe('figur', () => {
  it('punkt und winkel sind Umkehrungen', () => {
    expect(punkt([0, 0], 90, 10)).toEqual([0, 10]);
    expect(winkel([0, 0], [0, 10])).toBe(90);
    expect(winkel([0, 0], [-10, 0])).toBe(180);
  });
  it('gelenke einer stehenden Figur', () => {
    const g = gelenke(stehend);
    expect(g.schulter).toEqual([60, 16]);
    expect(g.kopf).toEqual([60, 7]);
    expect(g.vorn.knie).toEqual([60, 63]);
    expect(g.vorn.fuss).toEqual([60, 80]);
    expect(g.vorn.hand).toEqual([89, 16]);
    expect(g.hinten).toEqual(g.vorn);
  });
  it('zweite Seite getrennt', () => {
    const g = gelenke({ ...stehend, bein2: [90, 180] });
    expect(g.hinten.fuss).toEqual([43, 63]);
    expect(g.vorn.fuss).toEqual([60, 80]);
  });
  it('SVG enthält Boden, Gerät, Kopf und zweite Seite mit 45 %', () => {
    const svg = poseZuSvg(stehend, 'wand');
    expect(svg).toContain('<circle cx="60" cy="7" r="5"');
    expect(svg).toContain('M4 80.5H116');
    expect(svg).toContain('M8 0V80');
    expect(svg).toContain('opacity=".45"');
  });
  it('pruefePose meldet fehlende Winkel und Gelenke außerhalb', () => {
    expect(pruefePose(stehend)).toEqual([]);
    expect(pruefePose({ huefte: [60, 46], rumpf: -90, bein: [90, 90] })).toEqual(['arm fehlt']);
    expect(pruefePose({ ...stehend, arm2: [0] })).toEqual(['arm2 ungültig']);
    expect(pruefePose({ ...stehend, huefte: [110, 46] })).toEqual(['Gelenk außerhalb des Bildes']);
    expect(pruefePose(undefined)).toEqual(['huefte fehlt']);
  });
  it('pruefeFigur prüft Gerät, beide Posen und 2–3 Hinweise', () => {
    expect(pruefeFigur(gueltig)).toEqual([]);
    expect(pruefeFigur({ ...gueltig, hinweise: ['nur einer'] })).toEqual(['1 Hinweise statt 2–3']);
    expect(pruefeFigur({ ...gueltig, figur: { ...gueltig.figur, geraet: 'ringe' } })).toEqual(['unbekanntes Gerät ringe']);
    expect(pruefeFigur({ ...gueltig, figur: { ...gueltig.figur, ende: undefined } })).toEqual(['ende: huefte fehlt']);
    expect(pruefeFigur({ name: 'x', hinweise: ['a', 'b'] })).toEqual(['figur fehlt']);
  });
});
```

- [ ] **Step 2: Test laufen lassen**

Run: `npx vitest run tests/figur.test.js`
Expected: FAIL (Modul fehlt).

- [ ] **Step 3: Implementierung** – `js/logik/figur.js`

```js
// Übungsfiguren aus Pose-Daten. Bild 120 x 84, Boden bei y = 80.
// Winkel in Grad: 0 = nach rechts, 90 = nach unten (SVG-Richtung).

export const BILD = { breite: 120, hoehe: 84, boden: 80 };
export const LAENGE = { rumpf: 30, oberarm: 15, unterarm: 14, oberschenkel: 17, unterschenkel: 17, hals: 9, kopf: 5 };
export const GERAETE = ['boden', 'wand', 'stange', 'tisch', 'stuhl', 'couch'];

const GERAET_SVG = {
  boden: '',
  wand: '<path d="M8 0V80"/>',
  stange: '<path d="M20 6H100"/>',
  tisch: '<path d="M28 42H104M34 42V80M98 42V80"/>',
  stuhl: '<path d="M88 58H112M90 58V80M110 58V80"/>',
  couch: '<path d="M86 60H118V80M86 60V80M86 68H118"/>',
};

const rund = (n) => Math.round(n * 10) / 10 + 0; // + 0 macht aus -0 eine 0

export function punkt(von, grad, laenge) {
  const r = (grad * Math.PI) / 180;
  return [rund(von[0] + Math.cos(r) * laenge), rund(von[1] + Math.sin(r) * laenge)];
}

export function winkel(von, nach) {
  return rund((Math.atan2(nach[1] - von[1], nach[0] - von[0]) * 180) / Math.PI);
}

export function gelenke(pose) {
  const huefte = pose.huefte;
  const schulter = punkt(huefte, pose.rumpf, LAENGE.rumpf);
  const kopf = punkt(schulter, pose.rumpf, LAENGE.hals);
  const arm = ([oben, unten]) => {
    const ellbogen = punkt(schulter, oben, LAENGE.oberarm);
    return { ellbogen, hand: punkt(ellbogen, unten, LAENGE.unterarm) };
  };
  const bein = ([oben, unten]) => {
    const knie = punkt(huefte, oben, LAENGE.oberschenkel);
    return { knie, fuss: punkt(knie, unten, LAENGE.unterschenkel) };
  };
  return {
    huefte, schulter, kopf,
    vorn: { ...arm(pose.arm), ...bein(pose.bein) },
    hinten: { ...arm(pose.arm2 ?? pose.arm), ...bein(pose.bein2 ?? pose.bein) },
  };
}

const linie = (a, b) => `M${a[0]} ${a[1]}L${b[0]} ${b[1]}`;

export function poseZuSvg(pose, geraet = 'boden') {
  const g = gelenke(pose);
  const glieder = (s) => linie(g.schulter, s.ellbogen) + linie(s.ellbogen, s.hand) + linie(g.huefte, s.knie) + linie(s.knie, s.fuss);
  return '<g fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round">'
    + '<path d="M4 80.5H116" stroke-width="1.2" opacity=".35"/>'
    + `<g stroke-width="2" opacity=".35">${GERAET_SVG[geraet] ?? ''}</g>`
    + `<path d="${glieder(g.hinten)}" stroke-width="3.2" opacity=".45"/>`
    + `<path d="${linie(g.huefte, g.schulter)}${glieder(g.vorn)}" stroke-width="3.2"/>`
    + `<circle cx="${g.kopf[0]}" cy="${g.kopf[1]}" r="${LAENGE.kopf}" stroke-width="3.2"/>`
    + '</g>';
}

const istPaar = (x) => Array.isArray(x) && x.length === 2 && x.every(Number.isFinite);

export function pruefePose(pose) {
  if (!pose || !istPaar(pose.huefte)) return ['huefte fehlt'];
  const fehler = [];
  if (!Number.isFinite(pose.rumpf)) fehler.push('rumpf fehlt');
  for (const k of ['arm', 'bein']) if (!istPaar(pose[k])) fehler.push(`${k} fehlt`);
  for (const k of ['arm2', 'bein2']) if (pose[k] !== undefined && !istPaar(pose[k])) fehler.push(`${k} ungültig`);
  if (fehler.length) return fehler;
  const g = gelenke(pose);
  const punkte = [g.huefte, g.schulter, g.kopf, ...Object.values(g.vorn), ...Object.values(g.hinten)];
  if (punkte.some(([x, y]) => x < 0 || x > BILD.breite || y < 0 || y > BILD.hoehe)) fehler.push('Gelenk außerhalb des Bildes');
  return fehler;
}

export function pruefeFigur(eintrag) {
  const fehler = [];
  const figur = eintrag.figur;
  if (!figur) fehler.push('figur fehlt');
  else {
    if (!GERAETE.includes(figur.geraet)) fehler.push(`unbekanntes Gerät ${figur.geraet}`);
    for (const t of ['start', 'ende']) fehler.push(...pruefePose(figur[t]).map((f) => `${t}: ${f}`));
  }
  const n = eintrag.hinweise?.length ?? 0;
  if (n < 2 || n > 3) fehler.push(`${n} Hinweise statt 2–3`);
  return fehler;
}
```

- [ ] **Step 4: Test laufen lassen**

Run: `npx vitest run tests/figur.test.js`
Expected: PASS (6 Tests).

- [ ] **Step 5: Commit**

```bash
git add js/logik/figur.js tests/figur.test.js
git commit -m "feat: Übungsfiguren aus Pose-Daten mit Prüfung"
```

---

### Task 10: Zutaten, Rezepte und Datenladen

**Files:**
- Create: `data/zutaten.json`, `data/rezepte.json`
- Create: `js/daten.js`
- Test: `tests/daten.test.js`

**Interfaces:**
- Consumes: `pruefeFigur` (Task 9), `KATEGORIEN`, `MAERKTE` (Task 6, nur im Test).
- Produces: `verknuepfe({ zutaten, rezepte, uebungen, plan, aktionen }): { daten, warnungen: string[] }` mit `daten = { zutaten, rezepte, rezepteById, ketten, kettenById, plan, aktionen }` (unbekannte Zutaten werden als `{ name: id, kategorie: 'Sonstiges', grundvorrat: false, standard_markt: 'egal' }` ergänzt; jede Stufe bzw. jeder Routine-Teil bekommt `figurOk: boolean`), `ladeDaten(holen = fetch): Promise<{ daten, warnungen }>` (wirft bei fehlender Pflichtdatei; `aktionen.json` ist optional).
- Rezept-Form: `{ id, typ: 'abend'|'jause'|'snack'|'extra', name, portionen, aufwand?, zeit_min?, tags?, herkunft?, ohne_kuehlung?, geschaetzt?, beschreibung?, zutaten?: [{ zutat, menge?, einheit? }], schritte?, pro_portion?: { kcal, protein_g } }`.

- [ ] **Step 1: `data/zutaten.json` anlegen** (Werte aus `docs/rezepte-startset.md`; (V) = `grundvorrat: true`)

```json
{
  "huehnerbrust": { "name": "Hühnerbrustfilet", "kategorie": "Fleisch & Fisch", "grundvorrat": false, "standard_markt": "Hofer" },
  "putenbrust": { "name": "Putenbrust", "kategorie": "Fleisch & Fisch", "grundvorrat": false, "standard_markt": "Hofer" },
  "rinderfaschiertes": { "name": "Rinderfaschiertes", "kategorie": "Fleisch & Fisch", "grundvorrat": false, "standard_markt": "Hofer" },
  "schweinsschnitzel": { "name": "Schweinsschnitzel (Oberschale)", "kategorie": "Fleisch & Fisch", "grundvorrat": false, "standard_markt": "Hofer" },
  "putenschinken": { "name": "Putenschinken", "kategorie": "Kühlregal", "grundvorrat": false, "standard_markt": "egal" },
  "landjaeger": { "name": "Landjäger", "kategorie": "Kühlregal", "grundvorrat": false, "standard_markt": "egal" },
  "eier": { "name": "Eier", "kategorie": "Kühlregal", "grundvorrat": false, "standard_markt": "egal" },
  "milch": { "name": "Milch 3,5 %", "kategorie": "Kühlregal", "grundvorrat": false, "standard_markt": "egal" },
  "skyr": { "name": "Skyr natur", "kategorie": "Kühlregal", "grundvorrat": false, "standard_markt": "Lidl" },
  "magertopfen": { "name": "Magertopfen", "kategorie": "Kühlregal", "grundvorrat": false, "standard_markt": "Lidl" },
  "kaese-gerieben": { "name": "Geriebener Käse", "kategorie": "Kühlregal", "grundvorrat": false, "standard_markt": "egal" },
  "grana": { "name": "Grana Padano", "kategorie": "Kühlregal", "grundvorrat": false, "standard_markt": "egal" },
  "gouda": { "name": "Gouda", "kategorie": "Kühlregal", "grundvorrat": false, "standard_markt": "egal" },
  "bergkaese": { "name": "Bergkäse", "kategorie": "Kühlregal", "grundvorrat": false, "standard_markt": "egal" },
  "butter": { "name": "Butter", "kategorie": "Kühlregal", "grundvorrat": false, "standard_markt": "egal" },
  "vollkornweckerl": { "name": "Vollkornweckerl", "kategorie": "Brot & Gebäck", "grundvorrat": false, "standard_markt": "egal" },
  "vollkornbrot": { "name": "Vollkornbrot", "kategorie": "Brot & Gebäck", "grundvorrat": false, "standard_markt": "egal" },
  "kornspitz": { "name": "Kornspitz", "kategorie": "Brot & Gebäck", "grundvorrat": false, "standard_markt": "egal" },
  "kartoffeln": { "name": "Festkochende Kartoffeln", "kategorie": "Obst & Gemüse", "grundvorrat": false, "standard_markt": "egal" },
  "paprika": { "name": "Paprika", "kategorie": "Obst & Gemüse", "grundvorrat": false, "standard_markt": "egal" },
  "zucchini": { "name": "Zucchini", "kategorie": "Obst & Gemüse", "grundvorrat": false, "standard_markt": "egal" },
  "zwiebel": { "name": "Zwiebeln", "kategorie": "Obst & Gemüse", "grundvorrat": false, "standard_markt": "egal" },
  "karotten": { "name": "Karotten", "kategorie": "Obst & Gemüse", "grundvorrat": false, "standard_markt": "egal" },
  "gurke": { "name": "Gurke", "kategorie": "Obst & Gemüse", "grundvorrat": false, "standard_markt": "egal" },
  "banane": { "name": "Bananen", "kategorie": "Obst & Gemüse", "grundvorrat": false, "standard_markt": "egal" },
  "apfel": { "name": "Äpfel", "kategorie": "Obst & Gemüse", "grundvorrat": false, "standard_markt": "egal" },
  "knoblauch": { "name": "Knoblauch", "kategorie": "Obst & Gemüse", "grundvorrat": true, "standard_markt": "egal" },
  "brokkoli-tk": { "name": "TK-Brokkoli", "kategorie": "Tiefkühl", "grundvorrat": false, "standard_markt": "egal" },
  "reis": { "name": "Reis", "kategorie": "Vorrat", "grundvorrat": true, "standard_markt": "egal" },
  "vollkornspaghetti": { "name": "Vollkornspaghetti", "kategorie": "Vorrat", "grundvorrat": false, "standard_markt": "egal" },
  "vollkornpenne": { "name": "Vollkorn-Penne", "kategorie": "Vorrat", "grundvorrat": false, "standard_markt": "egal" },
  "passierte-tomaten": { "name": "Passierte Tomaten", "kategorie": "Vorrat", "grundvorrat": false, "standard_markt": "egal" },
  "tomaten-gehackt": { "name": "Gehackte Tomaten", "kategorie": "Vorrat", "grundvorrat": false, "standard_markt": "egal" },
  "kidneybohnen": { "name": "Kidneybohnen", "kategorie": "Vorrat", "grundvorrat": false, "standard_markt": "egal" },
  "weisse-bohnen": { "name": "Weiße Bohnen", "kategorie": "Vorrat", "grundvorrat": false, "standard_markt": "egal" },
  "mais": { "name": "Mais", "kategorie": "Vorrat", "grundvorrat": false, "standard_markt": "egal" },
  "thunfisch": { "name": "Thunfisch im eigenen Saft", "kategorie": "Vorrat", "grundvorrat": false, "standard_markt": "egal" },
  "haferflocken": { "name": "Haferflocken", "kategorie": "Vorrat", "grundvorrat": true, "standard_markt": "egal" },
  "muesli": { "name": "Müsli", "kategorie": "Vorrat", "grundvorrat": false, "standard_markt": "egal" },
  "nuesse": { "name": "Nüsse", "kategorie": "Vorrat", "grundvorrat": false, "standard_markt": "egal" },
  "erdnussbutter": { "name": "Erdnussbutter", "kategorie": "Vorrat", "grundvorrat": true, "standard_markt": "egal" },
  "olivenoel": { "name": "Olivenöl", "kategorie": "Vorrat", "grundvorrat": true, "standard_markt": "egal" },
  "rapsoel": { "name": "Rapsöl", "kategorie": "Vorrat", "grundvorrat": true, "standard_markt": "egal" },
  "sojasauce": { "name": "Sojasauce", "kategorie": "Vorrat", "grundvorrat": true, "standard_markt": "egal" },
  "essig": { "name": "Essig", "kategorie": "Vorrat", "grundvorrat": true, "standard_markt": "egal" },
  "salz": { "name": "Salz", "kategorie": "Gewürze", "grundvorrat": true, "standard_markt": "egal" },
  "pfeffer": { "name": "Pfeffer", "kategorie": "Gewürze", "grundvorrat": true, "standard_markt": "egal" },
  "paprikapulver": { "name": "Paprikapulver", "kategorie": "Gewürze", "grundvorrat": true, "standard_markt": "egal" },
  "oregano": { "name": "Oregano", "kategorie": "Gewürze", "grundvorrat": true, "standard_markt": "egal" },
  "chilipulver": { "name": "Chilipulver", "kategorie": "Gewürze", "grundvorrat": true, "standard_markt": "egal" },
  "kreuzkuemmel": { "name": "Kreuzkümmel", "kategorie": "Gewürze", "grundvorrat": true, "standard_markt": "egal" },
  "gyrosgewuerz": { "name": "Gyrosgewürz", "kategorie": "Gewürze", "grundvorrat": true, "standard_markt": "egal" },
  "schnittlauch": { "name": "Schnittlauch", "kategorie": "Gewürze", "grundvorrat": true, "standard_markt": "egal" }
}
```

- [ ] **Step 2: `data/rezepte.json` anlegen** (Inhalt 1:1 aus `docs/rezepte-startset.md`; Spar-Jausen `geschaetzt: true`)

```json
{
  "version": 1,
  "rezepte": [
    {
      "id": "huhn-reis-pfanne", "typ": "abend", "name": "Hühner-Reis-Pfanne mit Paprika",
      "portionen": 4, "aufwand": "leicht", "zeit_min": 30, "tags": ["huhn", "reis"],
      "zutaten": [
        { "zutat": "huehnerbrust", "menge": 1000, "einheit": "g" },
        { "zutat": "reis", "menge": 800, "einheit": "g" },
        { "zutat": "paprika", "menge": 2, "einheit": "Stück" },
        { "zutat": "zucchini", "menge": 1, "einheit": "Stück" },
        { "zutat": "zwiebel", "menge": 1, "einheit": "Stück" },
        { "zutat": "olivenoel", "menge": 3, "einheit": "EL" },
        { "zutat": "sojasauce", "menge": 4, "einheit": "EL" },
        { "zutat": "paprikapulver" },
        { "zutat": "knoblauch" }
      ],
      "schritte": ["Reis kochen.", "Huhn in Würfeln anbraten.", "Gemüse dazu, mit Sojasauce und Gewürzen abschmecken."],
      "pro_portion": { "kcal": 1100, "protein_g": 73 }
    },
    {
      "id": "spaghetti-bolognese", "typ": "abend", "name": "Spaghetti Bolognese (Rind)",
      "portionen": 4, "aufwand": "leicht", "zeit_min": 35, "tags": ["rind", "nudeln"],
      "zutaten": [
        { "zutat": "rinderfaschiertes", "menge": 800, "einheit": "g" },
        { "zutat": "vollkornspaghetti", "menge": 600, "einheit": "g" },
        { "zutat": "passierte-tomaten", "menge": 700, "einheit": "g" },
        { "zutat": "zwiebel", "menge": 1, "einheit": "Stück" },
        { "zutat": "karotten", "menge": 2, "einheit": "Stück" },
        { "zutat": "rapsoel", "menge": 1, "einheit": "EL" },
        { "zutat": "grana", "menge": 60, "einheit": "g" },
        { "zutat": "oregano" },
        { "zutat": "salz" },
        { "zutat": "pfeffer" }
      ],
      "schritte": ["Faschiertes mit Zwiebel und Karotte anbraten.", "Tomaten dazu, 20 min köcheln.", "Nudeln kochen."],
      "pro_portion": { "kcal": 1130, "protein_g": 68 }
    },
    {
      "id": "chili-con-carne", "typ": "abend", "name": "Chili con Carne mit Reis",
      "portionen": 4, "aufwand": "leicht", "zeit_min": 40, "tags": ["rind", "reis", "bohnen"],
      "zutaten": [
        { "zutat": "rinderfaschiertes", "menge": 800, "einheit": "g" },
        { "zutat": "kidneybohnen", "menge": 2, "einheit": "Dose" },
        { "zutat": "mais", "menge": 1, "einheit": "Dose" },
        { "zutat": "tomaten-gehackt", "menge": 2, "einheit": "Dose" },
        { "zutat": "paprika", "menge": 2, "einheit": "Stück" },
        { "zutat": "zwiebel", "menge": 1, "einheit": "Stück" },
        { "zutat": "rapsoel", "menge": 1, "einheit": "EL" },
        { "zutat": "reis", "menge": 500, "einheit": "g" },
        { "zutat": "chilipulver" },
        { "zutat": "kreuzkuemmel" },
        { "zutat": "paprikapulver" }
      ],
      "schritte": ["Faschiertes und Zwiebel anbraten.", "Alles in den Topf, 25 min köcheln.", "Reis kochen. Hält im Kühlschrank gut 3 Tage."],
      "pro_portion": { "kcal": 1160, "protein_g": 62 }
    },
    {
      "id": "ofenkartoffeln-pute", "typ": "abend", "name": "Ofenkartoffeln mit Putenbrust und Kräutertopfen",
      "portionen": 4, "aufwand": "leicht", "zeit_min": 45, "tags": ["pute", "kartoffeln", "ofen"],
      "zutaten": [
        { "zutat": "putenbrust", "menge": 800, "einheit": "g" },
        { "zutat": "kartoffeln", "menge": 2500, "einheit": "g" },
        { "zutat": "brokkoli-tk", "menge": 500, "einheit": "g" },
        { "zutat": "rapsoel", "menge": 6, "einheit": "EL" },
        { "zutat": "kaese-gerieben", "menge": 100, "einheit": "g" },
        { "zutat": "magertopfen", "menge": 500, "einheit": "g" },
        { "zutat": "schnittlauch" },
        { "zutat": "knoblauch" },
        { "zutat": "salz" }
      ],
      "schritte": ["Kartoffeln, Pute und Brokkoli mit Öl und Gewürzen aufs Blech, 35 min ins Rohr.", "Die letzten 5 min Käse drüber.", "Topfen mit Kräutern verrühren."],
      "pro_portion": { "kcal": 1000, "protein_g": 85 }
    },
    {
      "id": "nudelauflauf-thunfisch", "typ": "abend", "name": "Nudelauflauf mit Thunfisch und Brokkoli",
      "portionen": 4, "aufwand": "leicht", "zeit_min": 45, "tags": ["thunfisch", "nudeln", "ofen"],
      "zutaten": [
        { "zutat": "vollkornpenne", "menge": 600, "einheit": "g" },
        { "zutat": "thunfisch", "menge": 3, "einheit": "Dose" },
        { "zutat": "brokkoli-tk", "menge": 500, "einheit": "g" },
        { "zutat": "eier", "menge": 4, "einheit": "Stück" },
        { "zutat": "milch", "menge": 250, "einheit": "ml" },
        { "zutat": "kaese-gerieben", "menge": 200, "einheit": "g" }
      ],
      "schritte": ["Nudeln kurz vorkochen.", "Mit Thunfisch und Brokkoli in die Form, Eier-Milch drüber.", "Käse drauf, 25 min ins Rohr."],
      "pro_portion": { "kcal": 980, "protein_g": 75 }
    },
    {
      "id": "gyros-pfanne", "typ": "abend", "name": "Gyros-Pfanne vom Schwein mit Reis und Skyr-Tzatziki",
      "portionen": 4, "aufwand": "leicht", "zeit_min": 30, "tags": ["schwein", "reis"],
      "zutaten": [
        { "zutat": "schweinsschnitzel", "menge": 1000, "einheit": "g" },
        { "zutat": "zwiebel", "menge": 2, "einheit": "Stück" },
        { "zutat": "rapsoel", "menge": 3, "einheit": "EL" },
        { "zutat": "gyrosgewuerz" },
        { "zutat": "reis", "menge": 700, "einheit": "g" },
        { "zutat": "skyr", "menge": 500, "einheit": "g" },
        { "zutat": "gurke", "menge": 1, "einheit": "Stück" },
        { "zutat": "knoblauch" }
      ],
      "schritte": ["Fleisch in Streifen mit Zwiebel und Gewürz scharf anbraten.", "Reis kochen.", "Gurke reiben, mit Skyr und Knoblauch verrühren."],
      "pro_portion": { "kcal": 1055, "protein_g": 82 }
    },
    {
      "id": "weckerl-schinken-kaese", "typ": "jause", "name": "Vollkornweckerl mit Putenschinken und Gouda",
      "portionen": 1, "herkunft": "mitnehmen", "ohne_kuehlung": false,
      "zutaten": [
        { "zutat": "vollkornweckerl", "menge": 2, "einheit": "Stück" },
        { "zutat": "putenschinken", "menge": 100, "einheit": "g" },
        { "zutat": "gouda", "menge": 50, "einheit": "g" },
        { "zutat": "butter", "menge": 10, "einheit": "g" }
      ],
      "schritte": ["Weckerl aufschneiden und dünn mit Butter bestreichen.", "Mit Putenschinken und Gouda belegen, einpacken."],
      "pro_portion": { "kcal": 715, "protein_g": 44 }
    },
    {
      "id": "eier-brot", "typ": "jause", "name": "Hartgekochte Eier mit Vollkornbrot und Gurke",
      "portionen": 1, "herkunft": "mitnehmen", "ohne_kuehlung": true,
      "zutaten": [
        { "zutat": "eier", "menge": 3, "einheit": "Stück" },
        { "zutat": "vollkornbrot", "menge": 3, "einheit": "Scheibe" },
        { "zutat": "gurke", "menge": 0.5, "einheit": "Stück" },
        { "zutat": "salz" }
      ],
      "schritte": ["Eier 10 min hart kochen, abschrecken.", "Mit Brot, Gurke und etwas Salz einpacken."],
      "pro_portion": { "kcal": 590, "protein_g": 33 }
    },
    {
      "id": "spar-weckerl-pudding", "typ": "jause", "name": "Schinken-Käse-Weckerl und Protein-Pudding",
      "portionen": 1, "herkunft": "spar", "geschaetzt": true,
      "beschreibung": "Schinken-Käse-Weckerl aus der Feinkost plus ein High-Protein-Pudding aus dem Kühlregal.",
      "pro_portion": { "kcal": 600, "protein_g": 45 }
    },
    {
      "id": "spar-leberkaessemmel", "typ": "jause", "name": "Leberkässemmel",
      "portionen": 1, "herkunft": "spar", "geschaetzt": true,
      "beschreibung": "Leberkässemmel aus der Feinkost.",
      "pro_portion": { "kcal": 610, "protein_g": 23 }
    },
    {
      "id": "thunfisch-bohnen-salat", "typ": "jause", "name": "Thunfisch-Bohnen-Salat im Glas mit Weckerl",
      "portionen": 1, "herkunft": "mitnehmen", "ohne_kuehlung": false,
      "zutaten": [
        { "zutat": "thunfisch", "menge": 1, "einheit": "Dose" },
        { "zutat": "weisse-bohnen", "menge": 1, "einheit": "Dose" },
        { "zutat": "mais", "menge": 0.5, "einheit": "Dose" },
        { "zutat": "zwiebel", "menge": 0.5, "einheit": "Stück" },
        { "zutat": "essig" },
        { "zutat": "rapsoel", "menge": 1, "einheit": "EL" },
        { "zutat": "vollkornweckerl", "menge": 1, "einheit": "Stück" }
      ],
      "schritte": ["Thunfisch, Bohnen und Mais abtropfen lassen.", "Mit fein geschnittener Zwiebel, Essig und Öl im Glas mischen.", "Weckerl extra einpacken."],
      "pro_portion": { "kcal": 730, "protein_g": 60 }
    },
    {
      "id": "kornspitz-landjaeger", "typ": "jause", "name": "Kornspitz mit Landjäger und Bergkäse",
      "portionen": 1, "herkunft": "mitnehmen", "ohne_kuehlung": true,
      "zutaten": [
        { "zutat": "kornspitz", "menge": 2, "einheit": "Stück" },
        { "zutat": "landjaeger", "menge": 1, "einheit": "Stück" },
        { "zutat": "bergkaese", "menge": 60, "einheit": "g" }
      ],
      "schritte": ["Alles einpacken, fertig."],
      "pro_portion": { "kcal": 790, "protein_g": 40 }
    },
    {
      "id": "spar-grillhendl", "typ": "jause", "name": "Grillhendl-Haxerl mit Semmel",
      "portionen": 1, "herkunft": "spar", "geschaetzt": true,
      "beschreibung": "Grillhendl-Haxerl aus der Feinkost und eine Semmel.",
      "pro_portion": { "kcal": 650, "protein_g": 45 }
    },
    {
      "id": "reste", "typ": "jause", "name": "Reste vom Abendessen, kalt",
      "portionen": 1, "herkunft": "reste",
      "beschreibung": "Am besten Gyros, Auflauf oder Chili. Nährwerte wie das Abendessen."
    },
    {
      "id": "skyr-haferflocken", "typ": "snack", "name": "Skyr-Bowl",
      "portionen": 1, "aufwand": "leicht", "zeit_min": 5,
      "zutaten": [
        { "zutat": "skyr", "menge": 250, "einheit": "g" },
        { "zutat": "haferflocken", "menge": 60, "einheit": "g" },
        { "zutat": "banane", "menge": 1, "einheit": "Stück" },
        { "zutat": "nuesse", "menge": 20, "einheit": "g" }
      ],
      "schritte": ["Skyr in eine Schüssel, Haferflocken und Nüsse drüber.", "Banane in Scheiben dazu."],
      "pro_portion": { "kcal": 605, "protein_g": 41 }
    },
    {
      "id": "milch-banane-nuesse", "typ": "extra", "name": "Milch, Banane und Nüsse",
      "portionen": 1,
      "zutaten": [
        { "zutat": "milch", "menge": 500, "einheit": "ml" },
        { "zutat": "banane", "menge": 1, "einheit": "Stück" },
        { "zutat": "nuesse", "menge": 30, "einheit": "g" }
      ],
      "pro_portion": { "kcal": 605, "protein_g": 24 }
    },
    {
      "id": "muesli-schale", "typ": "extra", "name": "Müsli-Schale mit Apfel",
      "portionen": 1,
      "zutaten": [
        { "zutat": "muesli", "menge": 80, "einheit": "g" },
        { "zutat": "milch", "menge": 300, "einheit": "ml" },
        { "zutat": "apfel", "menge": 1, "einheit": "Stück" }
      ],
      "pro_portion": { "kcal": 565, "protein_g": 19 }
    },
    {
      "id": "erdnussbutterbrot", "typ": "extra", "name": "Erdnussbutterbrot mit Banane",
      "portionen": 1,
      "zutaten": [
        { "zutat": "vollkornbrot", "menge": 2, "einheit": "Scheibe" },
        { "zutat": "erdnussbutter", "menge": 2, "einheit": "EL" },
        { "zutat": "banane", "menge": 1, "einheit": "Stück" }
      ],
      "pro_portion": { "kcal": 515, "protein_g": 17 }
    }
  ]
}
```

- [ ] **Step 3: Failing test schreiben** – `tests/daten.test.js`

```js
import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { verknuepfe, ladeDaten } from '../js/daten.js';
import { KATEGORIEN, MAERKTE } from '../js/logik/einkaufsliste.js';

const lies = (name) => JSON.parse(readFileSync(new URL(`../data/${name}.json`, import.meta.url), 'utf8'));
const leererPlan = { einheiten: [] };
const keineUebungen = { ketten: [] };

describe('verknuepfe', () => {
  it('ergänzt unbekannte Zutaten und meldet sie', () => {
    const { daten, warnungen } = verknuepfe({
      zutaten: { reis: { name: 'Reis', kategorie: 'Vorrat', grundvorrat: true, standard_markt: 'egal' } },
      rezepte: { rezepte: [{ id: 'r', typ: 'abend', name: 'R', portionen: 1, zutaten: [{ zutat: 'reis' }, { zutat: 'zauber' }] }] },
      uebungen: keineUebungen, plan: leererPlan, aktionen: null,
    });
    expect(warnungen).toEqual(['Rezept r: unbekannte Zutat zauber']);
    expect(daten.zutaten.zauber).toEqual({ name: 'zauber', kategorie: 'Sonstiges', grundvorrat: false, standard_markt: 'egal' });
    expect(daten.rezepteById.r.name).toBe('R');
    expect(daten.aktionen).toEqual([]);
  });
  it('meldet unbekannte Ketten im Plan (außer dem Platzhalter ziehen) und markiert Figuren', () => {
    const { daten, warnungen } = verknuepfe({
      zutaten: {}, rezepte: { rezepte: [] },
      uebungen: { ketten: [{ id: 'core', name: 'Core', stufen: [{ name: 'Unterarmstütz', ziel: { saetze: 3, sek: 45 }, hinweise: ['a', 'b'] }] }] },
      plan: { einheiten: [{ id: 'x', name: 'X', art: 'schwer', ketten: ['core', 'ziehen', 'gibtsnicht'], dauer: '1 min' }] },
      aktionen: { aktionen: [{ zutat: 'reis' }] },
    });
    expect(warnungen).toContain('Einheit X: unbekannte Kette gibtsnicht');
    expect(warnungen).toContain('core/0 Unterarmstütz: figur fehlt');
    expect(daten.kettenById.core.stufen[0].figurOk).toBe(false);
    expect(daten.aktionen).toEqual([{ zutat: 'reis' }]);
  });
});

describe('ladeDaten', () => {
  const antwort = (wert, ok = true) => Promise.resolve({ ok, status: ok ? 200 : 404, json: () => Promise.resolve(wert) });
  const dateien = { zutaten: {}, rezepte: { rezepte: [] }, uebungen: keineUebungen, trainingsplan: leererPlan };
  it('aktionen.json ist optional', async () => {
    const holen = (url) => {
      const name = url.replace('data/', '').replace('.json', '');
      return name in dateien ? antwort(dateien[name]) : antwort(null, false);
    };
    const { daten } = await ladeDaten(holen);
    expect(daten.aktionen).toEqual([]);
  });
  it('fehlende Pflichtdatei wirft', async () => {
    const holen = (url) => (url.includes('rezepte') ? antwort(null, false) : antwort(dateien[url.replace('data/', '').replace('.json', '')]));
    await expect(ladeDaten(holen)).rejects.toThrow('data/rezepte.json: 404');
  });
});

describe('echte Daten: Zutaten und Rezepte', () => {
  const zutaten = lies('zutaten');
  const { rezepte } = lies('rezepte');

  it('jede Zutat hat gültige Kategorie und Markt', () => {
    for (const [id, z] of Object.entries(zutaten)) {
      expect(KATEGORIEN, id).toContain(z.kategorie);
      expect(MAERKTE, id).toContain(z.standard_markt);
      expect(typeof z.grundvorrat, id).toBe('boolean');
    }
  });
  it('Rezepte sind vollständig und verweisen nur auf bekannte Zutaten', () => {
    const ids = rezepte.map((r) => r.id);
    expect(new Set(ids).size).toBe(ids.length);
    for (const r of rezepte) {
      expect(['abend', 'jause', 'snack', 'extra'], r.id).toContain(r.typ);
      expect(r.portionen, r.id).toBeGreaterThan(0);
      if (r.typ === 'jause') expect(['mitnehmen', 'spar', 'reste'], r.id).toContain(r.herkunft);
      if (r.herkunft === 'mitnehmen') expect(typeof r.ohne_kuehlung, r.id).toBe('boolean');
      if (r.herkunft === 'spar' || r.herkunft === 'reste') {
        expect(r.zutaten, r.id).toBeUndefined();
        expect(r.beschreibung, r.id).toBeTruthy();
      }
      if (r.herkunft !== 'reste') expect(r.pro_portion.kcal, r.id).toBeGreaterThan(0);
      for (const z of r.zutaten ?? []) expect(zutaten[z.zutat], `${r.id}: ${z.zutat}`).toBeDefined();
    }
  });
  it('Startset vollständig: 6 Abend, 8 Jause, Snack der Standardeinstellung, 3 Extras', () => {
    const anzahl = (typ) => rezepte.filter((r) => r.typ === typ).length;
    expect([anzahl('abend'), anzahl('jause'), anzahl('snack'), anzahl('extra')]).toEqual([6, 8, 1, 3]);
    expect(rezepte.find((r) => r.id === 'skyr-haferflocken')?.typ).toBe('snack');
  });
});
```

- [ ] **Step 4: Test laufen lassen**

Run: `npx vitest run tests/daten.test.js`
Expected: FAIL (`Failed to resolve import "../js/daten.js"`).

- [ ] **Step 5: Implementierung** – `js/daten.js`

```js
// Lädt data/*.json, prüft Verweise und baut Nachschlage-Tabellen. Fehler werden als Warnungen gemeldet, nicht geworfen.
import { pruefeFigur } from './logik/figur.js';

const ERSATZ = (id) => ({ name: id, kategorie: 'Sonstiges', grundvorrat: false, standard_markt: 'egal' });
const PFLICHT = ['zutaten', 'rezepte', 'uebungen', 'trainingsplan'];

export function verknuepfe({ zutaten, rezepte, uebungen, plan, aktionen }) {
  const warnungen = [];

  const katalog = { ...zutaten };
  for (const r of rezepte.rezepte) {
    for (const z of r.zutaten ?? []) {
      if (katalog[z.zutat]) continue;
      warnungen.push(`Rezept ${r.id}: unbekannte Zutat ${z.zutat}`);
      katalog[z.zutat] = ERSATZ(z.zutat);
    }
  }

  const kettenById = Object.fromEntries(uebungen.ketten.map((k) => [k.id, k]));
  for (const e of plan.einheiten) {
    for (const id of e.ketten) {
      if (id !== 'ziehen' && !kettenById[id]) warnungen.push(`Einheit ${e.name}: unbekannte Kette ${id}`);
    }
  }
  for (const k of uebungen.ketten) {
    k.stufen.forEach((stufe, i) => {
      for (const teil of stufe.routine ?? [stufe]) {
        const fehler = pruefeFigur(teil);
        teil.figurOk = fehler.length === 0;
        if (fehler.length) warnungen.push(`${k.id}/${i} ${teil.name}: ${fehler.join(', ')}`);
      }
    });
  }

  return {
    daten: {
      zutaten: katalog,
      rezepte: rezepte.rezepte,
      rezepteById: Object.fromEntries(rezepte.rezepte.map((r) => [r.id, r])),
      ketten: uebungen.ketten,
      kettenById,
      plan,
      aktionen: aktionen?.aktionen ?? [],
    },
    warnungen,
  };
}

export async function ladeDaten(holen = (url) => fetch(url)) {
  const json = async (name) => {
    const antwort = await holen(`data/${name}.json`);
    if (!antwort.ok) throw new Error(`data/${name}.json: ${antwort.status}`);
    return antwort.json();
  };
  const [zutaten, rezepte, uebungen, plan] = await Promise.all(PFLICHT.map(json));
  let aktionen = null;
  try {
    aktionen = await json('aktionen');
  } catch {
    // aktionen.json ist im MVP optional
  }
  return verknuepfe({ zutaten, rezepte, uebungen, plan, aktionen });
}
```

- [ ] **Step 6: Test laufen lassen**

Run: `npx vitest run tests/daten.test.js`
Expected: PASS (7 Tests).

- [ ] **Step 7: Commit**

```bash
git add data/zutaten.json data/rezepte.json js/daten.js tests/daten.test.js
git commit -m "feat: Zutaten-Katalog, Rezept-Startset und Datenladen"
```

---

### Task 11: Übungsketten (Ziele und Texte) und Trainingsplan

**Files:**
- Create: `data/uebungen.json`, `data/trainingsplan.json`
- Test: `tests/uebungen.test.js`

**Interfaces:**
- Produces: Ketten-IDs `druecken-horizontal`, `druecken-vertikal`, `ziehen-ohne-stange`, `ziehen-stange`, `beine`, `huefte`, `core`, `mobilitaet`. Stufen-Form `{ name, ziel: { saetze, wdh | sek }, seitig?: true, hinweise: string[2..3], achtung?: string, figur?: {...} }`; die Mobilitäts-Kette hat genau eine Stufe `{ name: 'Mobilitäts-Routine', routine: [{ name, sek, seitig?, hinweise, achtung?, figur? }] }` (ohne `ziel`). Einheiten-IDs `ok-a`, `beine`, `mob-core`, `ok-b`, `beine-core`, `mob`. Die Figuren (`figur`) kommen in Task 12 dazu.

- [ ] **Step 1: `data/uebungen.json` anlegen** (ohne `figur`, die kommt in Task 12)

```json
{
  "ketten": [
    {
      "id": "druecken-horizontal", "name": "Drücken horizontal", "ausruestung": "matte",
      "stufen": [
        { "name": "Liegestütz", "ziel": { "saetze": 3, "wdh": 15 },
          "hinweise": ["Hände etwas breiter als die Schultern, Finger zeigen nach vorn.", "Körper von Kopf bis Ferse eine Linie, Bauch fest.", "Brust bis knapp über den Boden, dann ganz durchdrücken."] },
        { "name": "Diamond-Liegestütz", "ziel": { "saetze": 3, "wdh": 12 },
          "hinweise": ["Hände unter der Brust, Daumen und Zeigefinger bilden eine Raute.", "Ellbogen eng am Körper nach hinten führen.", "Körper bleibt eine Linie, Brust bis knapp über die Hände."],
          "achtung": "Hüfte nicht durchhängen lassen und den Kopf nicht vorschieben." },
        { "name": "Archer-Liegestütz", "ziel": { "saetze": 3, "wdh": 6 }, "seitig": true,
          "hinweise": ["Hände sehr breit, Finger leicht nach außen.", "Zu einer Seite absenken, der andere Arm bleibt fast gestreckt.", "Gleich viele Wiederholungen pro Seite."],
          "achtung": "Den gestreckten Arm nicht einknicken lassen, sonst wird es ein normaler Liegestütz." },
        { "name": "Pseudo-Planche-Liegestütz", "ziel": { "saetze": 3, "wdh": 10 },
          "hinweise": ["Hände neben der Hüfte, Finger zeigen schräg zu den Füßen.", "Schultern deutlich vor die Hände schieben.", "Langsam absenken, Ellbogen eng am Körper."],
          "achtung": "Handgelenke vorher aufwärmen und nur so weit vorlehnen, wie es schmerzfrei geht." }
      ]
    },
    {
      "id": "druecken-vertikal", "name": "Drücken vertikal", "ausruestung": "matte",
      "stufen": [
        { "name": "Pike Push-up", "ziel": { "saetze": 3, "wdh": 10 },
          "hinweise": ["Hüfte hoch, der Körper bildet ein umgedrehtes V.", "Kopf zwischen den Händen Richtung Boden senken.", "Hände schulterbreit, Ellbogen schräg nach hinten."],
          "achtung": "Hüfte bleibt hoch über den Schultern, nicht in einen normalen Liegestütz kippen." },
        { "name": "Pike Push-up mit erhöhten Füßen", "ziel": { "saetze": 3, "wdh": 10 },
          "hinweise": ["Füße auf Stuhl oder Couch, Hüfte über die Schultern.", "Oberkörper möglichst senkrecht.", "Kopf vor die Hände absenken, Kopf und Hände bilden ein Dreieck."],
          "achtung": "Die Erhöhung muss rutschfest stehen; nicht ins Hohlkreuz fallen." },
        { "name": "Wand-Handstand", "ziel": { "saetze": 3, "sek": 30 },
          "hinweise": ["Mit dem Bauch zur Wand hochgehen, Hände 20–30 cm vor der Wand.", "Arme gestreckt, Schultern zu den Ohren schieben.", "Bauch und Gesäß fest, Blick zwischen die Hände."],
          "achtung": "Erst das Rausgehen üben: eine Hand zur Seite setzen und abgehen." },
        { "name": "Negative Handstand-Liegestütz", "ziel": { "saetze": 3, "wdh": 4 },
          "hinweise": ["Im Wand-Handstand starten.", "In 3–5 Sekunden kontrolliert absenken, bis der Kopf leicht den Boden berührt.", "Unten abgehen, nicht hochdrücken."],
          "achtung": "Ein gefaltetes Handtuch unter den Kopf legen und nie fallen lassen." }
      ]
    },
    {
      "id": "ziehen-ohne-stange", "name": "Ziehen ohne Stange", "ausruestung": "matte",
      "stufen": [
        { "name": "Tischrudern", "ziel": { "saetze": 3, "wdh": 12 },
          "hinweise": ["Unter einen stabilen Tisch legen, Tischkante schulterbreit greifen.", "Körper gestreckt, Fersen am Boden.", "Brust zur Tischkante ziehen, Schulterblätter zusammen."],
          "achtung": "Vorher prüfen, dass der Tisch nicht kippen kann – nie an leichten oder wackeligen Tischen." },
        { "name": "Tischrudern mit erhöhten Füßen", "ziel": { "saetze": 3, "wdh": 12 },
          "hinweise": ["Füße auf einen Stuhl, Körper waagrecht gestreckt.", "Brust zur Tischkante ziehen.", "Langsam ablassen, bis die Arme gestreckt sind."],
          "achtung": "Tisch und Stuhl müssen kippsicher und rutschfest stehen." },
        { "name": "Einarmiges Tischrudern", "ziel": { "saetze": 3, "wdh": 6 }, "seitig": true,
          "hinweise": ["Mit einer Hand mittig greifen, die andere Hand auf die Brust.", "Körper nicht verdrehen, Hüfte bleibt oben.", "Langsam ablassen, gleich viele pro Seite."],
          "achtung": "Der Tisch muss auch bei einseitigem Zug kippsicher stehen." }
      ]
    },
    {
      "id": "ziehen-stange", "name": "Ziehen mit Stange", "ausruestung": "stange",
      "stufen": [
        { "name": "Klimmzug", "ziel": { "saetze": 3, "wdh": 5 },
          "hinweise": ["Obergriff, etwas breiter als schulterbreit.", "Aus dem gestreckten Hang ziehen, bis das Kinn über der Stange ist.", "Kontrolliert ganz ablassen."],
          "achtung": "Kein Schwung aus den Beinen – und die Stange vorher fest im Türrahmen prüfen." },
        { "name": "Klimmzug", "ziel": { "saetze": 3, "wdh": 7 },
          "hinweise": ["Obergriff, etwas breiter als schulterbreit.", "Aus dem gestreckten Hang ziehen, bis das Kinn über der Stange ist.", "Kontrolliert ganz ablassen."],
          "achtung": "Kein Schwung aus den Beinen – und die Stange vorher fest im Türrahmen prüfen." },
        { "name": "Klimmzug", "ziel": { "saetze": 3, "wdh": 9 },
          "hinweise": ["Obergriff, etwas breiter als schulterbreit.", "Aus dem gestreckten Hang ziehen, bis das Kinn über der Stange ist.", "Kontrolliert ganz ablassen."],
          "achtung": "Kein Schwung aus den Beinen – und die Stange vorher fest im Türrahmen prüfen." },
        { "name": "L-Sit-Klimmzug", "ziel": { "saetze": 3, "wdh": 5 },
          "hinweise": ["Beine gestreckt nach vorn heben, bis sie waagrecht sind.", "In dieser Haltung hochziehen.", "Wenn die Beine sinken: Knie anwinkeln."],
          "achtung": "Kein Schwung – lieber die Knie anwinkeln als die Beine pendeln lassen." },
        { "name": "Archer-Klimmzug", "ziel": { "saetze": 3, "wdh": 3 }, "seitig": true,
          "hinweise": ["Weiter Griff, zu einer Hand hochziehen.", "Der andere Arm bleibt fast gestreckt auf der Stange.", "Seite wechseln, gleich viele pro Seite."],
          "achtung": "Kein Schwung; der gestreckte Arm hilft nur, er zieht nicht mit." }
      ]
    },
    {
      "id": "beine", "name": "Beine", "ausruestung": "matte",
      "stufen": [
        { "name": "Kniebeuge", "ziel": { "saetze": 3, "wdh": 20 },
          "hinweise": ["Füße schulterbreit, Zehen leicht nach außen.", "Hüfte nach hinten und unten, bis die Oberschenkel waagrecht sind.", "Fersen bleiben am Boden, Knie zeigen über die Zehen."] },
        { "name": "Bulgarian Split Squat", "ziel": { "saetze": 3, "wdh": 10 }, "seitig": true,
          "hinweise": ["Hinteren Fuß mit dem Rist auf Stuhl oder Couch legen.", "Vorderen Fuß so weit vorn, dass das Knie unten über dem Fuß steht.", "Senkrecht absenken, bis das hintere Knie fast den Boden berührt."],
          "achtung": "Das vordere Knie nicht nach innen fallen lassen." },
        { "name": "Shrimp Squat (assistiert)", "ziel": { "saetze": 3, "wdh": 6 }, "seitig": true,
          "hinweise": ["Auf einem Bein stehen, an Wand oder Türrahmen festhalten.", "Den freien Fuß hinter dem Körper mit der Hand halten.", "Absenken, bis das hintere Knie das Polster berührt."],
          "achtung": "Das Standknie zeigt über die Zehen und knickt nicht nach innen." },
        { "name": "Pistol Squat (assistiert)", "ziel": { "saetze": 3, "wdh": 5 }, "seitig": true,
          "hinweise": ["Auf einem Bein stehen, Türrahmen locker halten.", "Freies Bein gestreckt nach vorn.", "So tief wie möglich absenken, mit wenig Hilfe hochkommen."],
          "achtung": "Die Ferse bleibt am Boden, das Knie folgt der Zehenrichtung." },
        { "name": "Pistol Squat", "ziel": { "saetze": 3, "wdh": 5 }, "seitig": true,
          "hinweise": ["Arme nach vorn als Gegengewicht.", "Freies Bein gestreckt vorn halten.", "Ganz tief, dann ohne Abstützen hoch."],
          "achtung": "Die Ferse bleibt am Boden, das Knie folgt der Zehenrichtung." }
      ]
    },
    {
      "id": "huefte", "name": "Hüfte", "ausruestung": "matte",
      "stufen": [
        { "name": "Einbeinige Hüftbrücke", "ziel": { "saetze": 3, "wdh": 12 }, "seitig": true,
          "hinweise": ["Auf dem Rücken, ein Fuß nah am Gesäß, das andere Bein gestreckt in der Luft.", "Über die Ferse die Hüfte hochdrücken.", "Oben 1 Sekunde halten und das Gesäß anspannen."],
          "achtung": "Nicht ins Hohlkreuz drücken – die Bewegung kommt aus der Hüfte." },
        { "name": "Einbeinige Hüftbrücke mit erhöhtem Fuß", "ziel": { "saetze": 3, "wdh": 12 }, "seitig": true,
          "hinweise": ["Ferse auf Couch oder Stuhl.", "Hüfte hochdrücken, bis Knie, Hüfte und Schulter eine Linie bilden.", "Langsam ablassen."],
          "achtung": "Nicht ins Hohlkreuz drücken – die Bewegung kommt aus der Hüfte." },
        { "name": "Negativer Nordic Curl", "ziel": { "saetze": 3, "wdh": 4 },
          "hinweise": ["Auf einem Polster knien, Fersen unter der Couch einhaken.", "Körper von Knie bis Kopf gestreckt.", "So langsam wie möglich nach vorn absenken und mit den Händen abfangen."],
          "achtung": "Couch vorher sichern (beschweren oder an die Wand stellen), damit sie nicht kippt." }
      ]
    },
    {
      "id": "core", "name": "Core", "ausruestung": "matte",
      "stufen": [
        { "name": "Unterarmstütz", "ziel": { "saetze": 3, "sek": 45 },
          "hinweise": ["Ellbogen unter den Schultern.", "Körper eine Linie, Gesäß und Bauch fest.", "Ruhig weiteratmen."],
          "achtung": "Die Hüfte weder durchhängen lassen noch hochstrecken." },
        { "name": "Hollow Hold", "ziel": { "saetze": 3, "sek": 30 },
          "hinweise": ["Auf dem Rücken, den unteren Rücken in den Boden drücken.", "Schultern und Beine leicht anheben, Arme lang über den Kopf.", "Je tiefer die Beine, desto schwerer."],
          "achtung": "Sobald der untere Rücken abhebt: Beine höher oder Knie anwinkeln." },
        { "name": "Hollow Rocks", "ziel": { "saetze": 3, "wdh": 15 },
          "hinweise": ["Aus dem Hollow Hold vor und zurück schaukeln.", "Die Form bleibt starr wie eine Banane.", "Kleine, gleichmäßige Bewegung."],
          "achtung": "Der untere Rücken bleibt rund; nicht mit den Beinen Schwung holen." }
      ]
    },
    {
      "id": "mobilitaet", "name": "Mobilität", "ausruestung": "matte",
      "stufen": [
        { "name": "Mobilitäts-Routine",
          "routine": [
            { "name": "Hüftbeuger-Dehnung im Ausfallschritt", "sek": 45, "seitig": true,
              "hinweise": ["Hinteres Knie auf ein Polster, vorderer Fuß weit vorn.", "Gesäß anspannen und die Hüfte nach vorn schieben.", "Oberkörper aufrecht."] },
            { "name": "Wandengel", "sek": 45,
              "hinweise": ["Rücken, Kopf und Gesäß an der Wand.", "Arme wie ein W an die Wand, Handrücken berühren die Wand.", "Langsam nach oben zum Y schieben und zurück."] },
            { "name": "Offenes Buch", "sek": 30, "seitig": true,
              "hinweise": ["Auf der Seite liegen, Knie angewinkelt übereinander.", "Arme nach vorn gestreckt, Handflächen aufeinander.", "Den oberen Arm wie eine Buchseite zur anderen Seite öffnen, der Blick folgt der Hand."] },
            { "name": "Hamstring-Dehnung im Sitzen", "sek": 45,
              "hinweise": ["Sitzen, Beine gestreckt.", "Mit geradem Rücken aus der Hüfte nach vorn neigen.", "Das Ziehen soll in den Oberschenkel-Rückseiten sein, nicht im Rücken."] }
          ] }
      ]
    }
  ]
}
```

- [ ] **Step 2: `data/trainingsplan.json` anlegen**

```json
{
  "einheiten": [
    { "id": "ok-a", "name": "Oberkörper A", "art": "schwer", "ketten": ["druecken-horizontal", "ziehen", "core"], "dauer": "25–30 min" },
    { "id": "beine", "name": "Beine", "art": "schwer", "ketten": ["beine", "huefte", "core"], "dauer": "25 min" },
    { "id": "mob-core", "name": "Mobilität & Core", "art": "leicht", "ketten": ["mobilitaet", "core"], "dauer": "15 min" },
    { "id": "ok-b", "name": "Oberkörper B", "art": "schwer", "ketten": ["druecken-vertikal", "ziehen", "druecken-horizontal"], "dauer": "25–30 min" },
    { "id": "beine-core", "name": "Beine & Core", "art": "leicht", "ketten": ["beine", "huefte", "core"], "dauer": "15–20 min" },
    { "id": "mob", "name": "Mobilität", "art": "leicht", "ketten": ["mobilitaet"], "dauer": "15 min" }
  ]
}
```

- [ ] **Step 3: Test schreiben** – `tests/uebungen.test.js`

```js
import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';

const lies = (name) => JSON.parse(readFileSync(new URL(`../data/${name}.json`, import.meta.url), 'utf8'));
const { ketten } = lies('uebungen');
const plan = lies('trainingsplan');
const kette = (id) => ketten.find((k) => k.id === id);

// Stufen, bei denen die Spec ein „Achte darauf“ verlangt (Spec 4.3.1)
const MIT_ACHTUNG = [
  'Unterarmstütz', 'Hollow Hold', 'Hollow Rocks', 'Pike Push-up', 'Pike Push-up mit erhöhten Füßen', 'Wand-Handstand',
  'Negative Handstand-Liegestütz', 'Archer-Liegestütz', 'Pseudo-Planche-Liegestütz', 'Tischrudern',
  'Tischrudern mit erhöhten Füßen', 'Einarmiges Tischrudern', 'Klimmzug', 'L-Sit-Klimmzug', 'Archer-Klimmzug',
  'Bulgarian Split Squat', 'Shrimp Squat (assistiert)', 'Pistol Squat (assistiert)', 'Pistol Squat',
  'Einbeinige Hüftbrücke', 'Einbeinige Hüftbrücke mit erhöhtem Fuß', 'Negativer Nordic Curl',
];

describe('uebungen.json', () => {
  it('enthält alle Ketten mit den Stufenzahlen aus der Spec', () => {
    expect(ketten.map((k) => [k.id, k.stufen.length])).toEqual([
      ['druecken-horizontal', 4], ['druecken-vertikal', 4], ['ziehen-ohne-stange', 3], ['ziehen-stange', 5],
      ['beine', 5], ['huefte', 3], ['core', 3], ['mobilitaet', 1],
    ]);
  });
  it('jede Stufe hat Ziel mit wdh oder sek und 2–3 Hinweise', () => {
    for (const k of ketten.filter((x) => x.id !== 'mobilitaet')) {
      for (const s of k.stufen) {
        expect(s.ziel.saetze, s.name).toBe(3);
        expect((s.ziel.wdh != null) !== (s.ziel.sek != null), s.name).toBe(true);
        expect(s.hinweise.length, s.name).toBeGreaterThanOrEqual(2);
        expect(s.hinweise.length, s.name).toBeLessThanOrEqual(3);
        expect(!!s.achtung, s.name).toBe(MIT_ACHTUNG.includes(s.name));
      }
    }
  });
  it('Mobilität ist eine Routine aus 4 Übungen', () => {
    const routine = kette('mobilitaet').stufen[0].routine;
    expect(routine.map((r) => r.name)).toEqual([
      'Hüftbeuger-Dehnung im Ausfallschritt', 'Wandengel', 'Offenes Buch', 'Hamstring-Dehnung im Sitzen',
    ]);
    for (const r of routine) {
      expect(r.sek, r.name).toBeGreaterThanOrEqual(30);
      expect(r.hinweise.length, r.name).toBeGreaterThanOrEqual(2);
    }
  });
});

describe('trainingsplan.json', () => {
  it('6 Einheiten in der Reihenfolge der Spec, nur bekannte Ketten', () => {
    expect(plan.einheiten.map((e) => [e.name, e.art])).toEqual([
      ['Oberkörper A', 'schwer'], ['Beine', 'schwer'], ['Mobilität & Core', 'leicht'],
      ['Oberkörper B', 'schwer'], ['Beine & Core', 'leicht'], ['Mobilität', 'leicht'],
    ]);
    for (const e of plan.einheiten) {
      for (const id of e.ketten) expect(id === 'ziehen' || !!kette(id), `${e.name}: ${id}`).toBe(true);
    }
  });
});
```

- [ ] **Step 4: Test laufen lassen**

Run: `npx vitest run tests/uebungen.test.js`
Expected: PASS (4 Tests). Wenn ein Test fehlschlägt, die JSON-Datei korrigieren (nicht den Test).

- [ ] **Step 5: Commit**

```bash
git add data/uebungen.json data/trainingsplan.json tests/uebungen.test.js
git commit -m "feat: Übungsketten mit Hinweisen und Trainingsplan"
```

---

### Task 12: Übungsfiguren zeichnen (Pose-Daten) mit Sammelseite – Nutzer-Freigabe

Dieser Task ist Gestaltungsarbeit nach Augenmaß mit festen Abnahmekriterien. Er endet mit einer **Freigabe durch den Nutzer**; erst danach wird committet.

**Files:**
- Create: `muster/figuren.html`
- Modify: `data/uebungen.json` (jede Stufe und jeder Routine-Teil bekommt `figur`)
- Modify: `tests/uebungen.test.js` (Figuren-Prüfung)
- Create: `tools/server.mjs` (lokaler Server, wird ab hier gebraucht)

**Interfaces:**
- Consumes: `poseZuSvg`, `pruefeFigur`, `winkel`, `gelenke` (Task 9).
- Produces: `figur: { geraet, start, ende }` an allen 31 Einträgen (27 Stufen + 4 Routine-Teile).

- [ ] **Step 1: Lokalen Server anlegen** – `tools/server.mjs`

```js
// Lokaler Entwicklungsserver: node tools/server.mjs  ->  http://127.0.0.1:8765/
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const wurzel = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const TYPEN = {
  '.html': 'text/html; charset=utf-8', '.css': 'text/css', '.js': 'text/javascript', '.mjs': 'text/javascript',
  '.svg': 'image/svg+xml', '.json': 'application/json', '.png': 'image/png', '.webmanifest': 'application/manifest+json',
};

http.createServer((anfrage, antwort) => {
  let pfad = decodeURIComponent(anfrage.url.split('?')[0]);
  if (pfad.endsWith('/')) pfad += 'index.html';
  const datei = path.join(wurzel, pfad);
  if (!datei.startsWith(wurzel)) { antwort.writeHead(403); antwort.end(); return; }
  fs.readFile(datei, (fehler, inhalt) => {
    if (fehler) { antwort.writeHead(404); antwort.end('nicht gefunden'); return; }
    antwort.writeHead(200, { 'content-type': TYPEN[path.extname(datei)] ?? 'application/octet-stream', 'cache-control': 'no-store' });
    antwort.end(inhalt);
  });
}).listen(8765, '127.0.0.1', () => console.log('http://127.0.0.1:8765/'));
```

Dazu in `.gitignore` eine Zeile `fotos/` ergänzen (Bildschirmfotos werden nicht eingecheckt) und den Ordner anlegen: `mkdir -p fotos`.

Run: `npm run serve` (im Hintergrund laufen lassen)
Expected: Ausgabe `http://127.0.0.1:8765/`.

- [ ] **Step 2: Sammelseite anlegen** – `muster/figuren.html`

```html
<!doctype html>
<html lang="de">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
  <title>Übungsfiguren – Fit &amp; Einkauf</title>
  <script>/* ?thema=hell|dunkel erzwingt eine Darstellung */ const t = new URLSearchParams(location.search).get('thema'); if (t) document.documentElement.dataset.theme = t;</script>
  <link rel="stylesheet" href="../css/tokens.css">
  <link rel="stylesheet" href="../css/komponenten.css">
  <style>
    .figuren-raster { display: grid; grid-template-columns: 1fr 1fr; gap: var(--a-2); padding: var(--a-3); }
    .figuren-raster figure { margin: 0; padding: var(--a-2); border-radius: var(--r-feld); background: var(--zelle-2); color: var(--text); }
    .figuren-raster svg { display: block; width: 100%; height: auto; }
    .figuren-raster figcaption { text-align: center; font: var(--t-fuss); color: var(--text-2); }
    .figuren-text { padding: 0 var(--a-4) var(--a-3); font: var(--t-unter); color: var(--text-2); }
    .figuren-fehler { padding: 0 var(--a-4) var(--a-3); font: var(--t-unter); color: var(--gefahr); }
  </style>
</head>
<body>
<main class="app" id="haupt"></main>
<script type="module">
  import { poseZuSvg, pruefeFigur } from '../js/logik/figur.js';

  const esc = (t) => String(t ?? '').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);
  const bild = (pose, geraet, titel) => pose
    ? `<figure><svg viewBox="0 0 120 84" aria-hidden="true">${poseZuSvg(pose, geraet)}</svg><figcaption>${titel}</figcaption></figure>`
    : `<figure><figcaption>${titel} fehlt</figcaption></figure>`;

  const { ketten } = await (await fetch('../data/uebungen.json')).json();
  let anzahl = 0;
  let fehlerhaft = 0;
  const abschnitte = ketten.flatMap((kette) => kette.stufen.flatMap((stufe, i) => (stufe.routine ?? [stufe]).map((teil) => {
    anzahl += 1;
    const fehler = pruefeFigur(teil);
    if (fehler.length) fehlerhaft += 1;
    const f = teil.figur ?? {};
    return `<section class="gruppe">
      <h2 class="gruppe__kopf">${esc(kette.name)} · ${stufe.routine ? 'Routine' : `Stufe ${i + 1}`}</h2>
      <div class="gruppe__inhalt">
        <div class="zeile"><div class="zeile__haupt"><div class="zeile__titel">${esc(teil.name)}</div><div class="zeile__unter">Gerät: ${esc(f.geraet ?? '–')}</div></div></div>
        <div class="figuren-raster">${bild(f.start, f.geraet, 'Start')}${bild(f.ende, f.geraet, 'Ende')}</div>
        <p class="figuren-text">${(teil.hinweise ?? []).map(esc).join(' · ')}${teil.achtung ? ` · Achte darauf: ${esc(teil.achtung)}` : ''}</p>
        ${fehler.length ? `<p class="figuren-fehler">${fehler.map(esc).join(', ')}</p>` : ''}
      </div></section>`;
  })));
  document.getElementById('haupt').innerHTML = `
    <header class="titelleiste"><div class="titelleiste__aktionen"></div>
      <h1 class="titelleiste__titel">Übungsfiguren</h1>
      <p class="titelleiste__unter">${anzahl} Übungen · ${fehlerhaft} mit Fehlern</p></header>${abschnitte.join('')}`;
</script>
</body>
</html>
```

Öffnen: `http://127.0.0.1:8765/muster/figuren.html`
Expected: 31 Abschnitte, Untertitel „31 Übungen · 31 mit Fehlern“ (noch keine Figuren).

- [ ] **Step 3: Test für Figuren ergänzen** (schlägt fehl, bis alle Figuren eingetragen sind) – an `tests/uebungen.test.js` anhängen:

```js
import { pruefeFigur } from '../js/logik/figur.js';

describe('Übungsfiguren', () => {
  it('jede Stufe und jeder Routine-Teil hat gültige Start- und End-Pose', () => {
    const fehler = ketten.flatMap((k) => k.stufen.flatMap((s, i) => (s.routine ?? [s])
      .map((t) => [`${k.id}/${i} ${t.name}`, pruefeFigur(t)])
      .filter(([, f]) => f.length)
      .map(([n, f]) => `${n}: ${f.join(', ')}`)));
    expect(fehler).toEqual([]);
  });
  it('Referenzposen aus der Spec sind unverändert', () => {
    expect(kette('druecken-horizontal').stufen[1].figur).toEqual({
      geraet: 'boden',
      start: { huefte: [65.4, 63.3], rumpf: 204, arm: [90, 90], bein: [24, 24] },
      ende: { huefte: [69.6, 73.1], rumpf: 190, arm: [30, 163], bein: [10, 10] },
    });
    expect(kette('beine').stufen[0].figur).toEqual({
      geraet: 'boden',
      start: { huefte: [60, 46], rumpf: -90, arm: [0, 0], bein: [90, 90] },
      ende: { huefte: [51.8, 62.3], rumpf: -70, arm: [0, 0], bein: [10, 120] },
    });
  });
});
```

Die `import`-Zeile an den Dateianfang zu den anderen Imports setzen.

Run: `npx vitest run tests/uebungen.test.js`
Expected: FAIL (31 Einträge mit „figur fehlt“, Referenzposen fehlen).

- [ ] **Step 4: Posen eintragen** – für jeden der 31 Einträge in `data/uebungen.json` ein Feld `figur` ergänzen.

Vorgehen pro Pose:
1. Die gewünschten Gelenkpunkte festlegen (Hüfte, Schulter, Ellbogen, Hand, Knie, Fuß) im Bild 120 × 84.
2. Die Winkel mit `winkel(von, nach)` ausrechnen, z. B.:
   `node -e "import('./js/logik/figur.js').then(f => console.log(f.winkel([65.4,63.3],[38,51])))"` → `204.2` (Rumpf von Hüfte zur Schulter). Winkel auf ganze Grad runden.
3. Pose eintragen, Sammelseite neu laden, Bild prüfen, nachjustieren.

Kontaktregeln (damit Figuren nicht schweben oder im Gerät stecken):
- **Boden** (y = 80): Füße, Hände, Knie oder Rücken, die den Boden berühren, liegen bei y 77–80.
- **Wand** (x = 8): Hände/Rücken an der Wand bei x 9–12; die Figur steht rechts davon.
- **Stange** (y = 15, x 20–100; vorher y = 6, nach Nutzer-Review tiefer, damit oben der Kopf ganz über der Stange ist): Hände bei y 16 auf der Stange, im Hang Knie stark angewinkelt.
- **Tisch** (Platte y = 42, x 28–104): Hände beim Tischrudern bei y 42–44 an der Kante, Körper darunter.
- **Stuhl** (Sitz y = 58, x 88–112): Füße/Rist bei y 56–58 auf dem Sitz.
- **Couch** (Oberkante y = 60, x 86–118): Ferse/Fuß bei y 58–60; beim Nordic Curl Fersen unter der Kante bei x 88–92, y 74–78.
- Figuren zeigen nach links (Kopf links) bei Bodenübungen, stehend Blick nach rechts; Geräte stehen an ihrer festen Stelle, die Figur wird dazu passend platziert.
- `arm2`/`bein2` nur, wenn die zweite Seite sichtbar anders steht (Split Squat, Shrimp, Pistol, Archer, einbeinige Hüftbrücke, Ausfallschritt, Offenes Buch).

Referenzposen (genau so übernehmen, sie stehen in der Spec):

```json
"figur": { "geraet": "boden",
  "start": { "huefte": [65.4, 63.3], "rumpf": 204, "arm": [90, 90], "bein": [24, 24] },
  "ende":  { "huefte": [69.6, 73.1], "rumpf": 190, "arm": [30, 163], "bein": [10, 10] } }
```
(Diamond-Liegestütz; der normale Liegestütz bekommt dieselben Posen.)

```json
"figur": { "geraet": "boden",
  "start": { "huefte": [60, 46], "rumpf": -90, "arm": [0, 0], "bein": [90, 90] },
  "ende":  { "huefte": [51.8, 62.3], "rumpf": -70, "arm": [0, 0], "bein": [10, 120] } }
```
(Kniebeuge.)

Gerät je Eintrag:

| Eintrag | Gerät |
|---|---|
| Liegestütz, Diamond, Archer, Pseudo-Planche, Pike Push-up, Unterarmstütz, Hollow Hold, Hollow Rocks, Kniebeuge, Pistol Squat, Einbeinige Hüftbrücke, Hüftbeuger-Dehnung, Offenes Buch, Hamstring-Dehnung | boden |
| Pike Push-up mit erhöhten Füßen, Bulgarian Split Squat | stuhl |
| Wand-Handstand, Negative Handstand-Liegestütz, Shrimp Squat (assistiert), Pistol Squat (assistiert), Wandengel | wand |
| Tischrudern, Tischrudern mit erhöhten Füßen (Füße frei auf Höhe y ≈ 58, kein zweites Gerät), Einarmiges Tischrudern | tisch |
| Klimmzug (alle drei), L-Sit-Klimmzug, Archer-Klimmzug | stange |
| Einbeinige Hüftbrücke mit erhöhtem Fuß, Negativer Nordic Curl | couch |

Run nach jeder Kette: `npx vitest run tests/uebungen.test.js` und die Sammelseite neu laden.

- [ ] **Step 5: Bildschirmfoto der Sammelseite prüfen**

Run (Edge headless, Fenster 500 px breit, Seite lädt im Rahmen von 375 px erst ab Task 14; hier reicht die volle Fensterbreite):
`"C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe" --headless=new --disable-gpu --hide-scrollbars --force-device-scale-factor=2 --virtual-time-budget=4000 --window-size=500,9000 --screenshot=fotos/figuren.png "http://127.0.0.1:8765/muster/figuren.html"`

Expected: Untertitel „31 Übungen · 0 mit Fehlern“. Jede Figur einzeln ansehen: Kontakt zu Boden/Gerät stimmt, Start und Ende unterscheiden sich sichtbar, die Bewegung ist erkennbar. Offensichtliche Fehler korrigieren, dann ein zweites Mal fotografieren. Höchstens zwei Runden, danach weiter zu Step 6.

- [ ] **Step 6: Tests laufen lassen**

Run: `npx vitest run tests/uebungen.test.js`
Expected: PASS (6 Tests).

- [ ] **Step 7: Nutzer-Freigabe**

Dem Nutzer die Sammelseite zeigen (`fotos/figuren.png` und Link `http://127.0.0.1:8765/muster/figuren.html` bei laufendem Server) und um Durchsicht bitten: „Stimmen die Figuren für dich? Nenne Übung und was nicht passt.“ Gemeldete Korrekturen eintragen, Tests erneut laufen lassen. **Erst nach Freigabe** committen.

- [ ] **Step 8: Commit**

```bash
git add .gitignore data/uebungen.json muster/figuren.html tests/uebungen.test.js tools/server.mjs
git commit -m "feat: Übungsfiguren für alle Stufen mit Sammelseite"
```

---

### Task 13: Einheit-Logik (laufendes Training)

**Files:**
- Create: `js/logik/einheit.js`
- Test: `tests/einheit.test.js`

**Interfaces:**
- Consumes: `kettenFuerEinheit` (Task 3), `zielFuer`, `zielwert` (Task 4), Ketten mit `figurOk` (Task 10).
- Produces:
  - `aufloesen(eintrag: {kette, stufe, teil}, kettenById, art): { name, ziel, seitig, figur|null, hinweise, achtung|null }` (Routine-Teil: `ziel = { saetze: 2, sek }`; `figur` ist `null`, wenn `figurOk === false`)
  - `schrittweite(ziel): 1 | 5` (Sekunden-Übungen in 5er-Schritten)
  - `starteEinheit(training, einheit, kettenById, stange, datum): Laufend`
  - `satzFertig(laufend, kettenById): Laufend` (hängt `wert` an; bleibt bei offener Übung und behält `wert`; sonst nächste offene Übung, auch vor der aktuellen, mit deren Zielwert; alles erledigt → `aktiv: -1`)
  - `waehle(laufend, index, kettenById): Laufend`
  - `eintragAusLaufend(laufend): LogEintrag` (nur Übungen mit Sätzen; `teil` nur bei Routine-Teilen)

- [ ] **Step 1: Failing test schreiben** – `tests/einheit.test.js`

```js
import { describe, it, expect } from 'vitest';
import { aufloesen, schrittweite, starteEinheit, satzFertig, waehle, eintragAusLaufend } from '../js/logik/einheit.js';

const kettenById = {
  'druecken-horizontal': { id: 'druecken-horizontal', stufen: [
    { name: 'Liegestütz', ziel: { saetze: 3, wdh: 15 }, hinweise: ['a', 'b'], figurOk: true, figur: { geraet: 'boden' } },
    { name: 'Diamond-Liegestütz', ziel: { saetze: 3, wdh: 12 }, hinweise: ['a', 'b'], achtung: 'Hüfte', figurOk: false, figur: { geraet: 'boden' } },
  ] },
  'ziehen-ohne-stange': { id: 'ziehen-ohne-stange', stufen: [{ name: 'Tischrudern', ziel: { saetze: 3, wdh: 12 }, hinweise: [] }] },
  core: { id: 'core', stufen: [{ name: 'Unterarmstütz', ziel: { saetze: 3, sek: 45 }, hinweise: [] }] },
  mobilitaet: { id: 'mobilitaet', stufen: [{ name: 'Routine', routine: [
    { name: 'Wandengel', sek: 45, hinweise: [] }, { name: 'Offenes Buch', sek: 30, seitig: true, hinweise: [] },
  ] }] },
};
const einheitA = { id: 'ok-a', name: 'Oberkörper A', art: 'schwer', ketten: ['druecken-horizontal', 'ziehen', 'core'] };
const training = { naechsteEinheit: 0, stufen: { 'druecken-horizontal': 1 }, log: [] };

describe('einheit', () => {
  it('aufloesen liefert Ziel, Texte und Figur (null bei fehlerhafter Figur)', () => {
    expect(aufloesen({ kette: 'druecken-horizontal', stufe: 0, teil: null }, kettenById, 'schwer'))
      .toMatchObject({ name: 'Liegestütz', ziel: { saetze: 3, wdh: 15 }, figur: { geraet: 'boden' }, achtung: null });
    expect(aufloesen({ kette: 'druecken-horizontal', stufe: 1, teil: null }, kettenById, 'leicht'))
      .toMatchObject({ name: 'Diamond-Liegestütz', ziel: { saetze: 2, wdh: 12 }, figur: null, achtung: 'Hüfte' });
    expect(aufloesen({ kette: 'mobilitaet', stufe: 0, teil: 1 }, kettenById, 'leicht'))
      .toMatchObject({ name: 'Offenes Buch', ziel: { saetze: 2, sek: 30 }, seitig: true });
  });
  it('schrittweite', () => {
    expect(schrittweite({ saetze: 3, wdh: 12 })).toBe(1);
    expect(schrittweite({ saetze: 3, sek: 45 })).toBe(5);
  });
  it('starteEinheit mit Stufen, Stange-Ersatz und Zielwert', () => {
    const l = starteEinheit(training, einheitA, kettenById, false, '2026-10-14');
    expect(l).toMatchObject({ index: 0, art: 'schwer', datum: '2026-10-14', aktiv: 0, wert: 12 });
    expect(l.uebungen).toEqual([
      { kette: 'druecken-horizontal', stufe: 1, teil: null, saetze: [] },
      { kette: 'ziehen-ohne-stange', stufe: 0, teil: null, saetze: [] },
      { kette: 'core', stufe: 0, teil: null, saetze: [] },
    ]);
  });
  it('Routine wird in einzelne Übungen aufgeteilt', () => {
    const l = starteEinheit(training, { art: 'leicht', ketten: ['mobilitaet'] }, kettenById, false, '2026-10-14');
    expect(l.uebungen.map((u) => u.teil)).toEqual([0, 1]);
    expect(l.wert).toBe(45);
  });
  it('gespeicherte Stufe außerhalb der Kette wird begrenzt, unbekannte Kette übersprungen', () => {
    const l = starteEinheit({ ...training, stufen: { 'druecken-horizontal': 9 } },
      { art: 'schwer', ketten: ['druecken-horizontal', 'gibtsnicht'] }, kettenById, false, '2026-10-14');
    expect(l.uebungen).toEqual([{ kette: 'druecken-horizontal', stufe: 1, teil: null, saetze: [] }]);
  });
  it('satzFertig bleibt bei offener Übung und behält den Wert', () => {
    let l = starteEinheit(training, einheitA, kettenById, false, '2026-10-14');
    l = { ...l, wert: 11 };
    l = satzFertig(l, kettenById);
    expect(l.uebungen[0].saetze).toEqual([11]);
    expect(l.aktiv).toBe(0);
    expect(l.wert).toBe(11);
  });
  it('satzFertig springt nach dem letzten Satz zur nächsten offenen Übung', () => {
    let l = starteEinheit(training, einheitA, kettenById, false, '2026-10-14');
    for (let i = 0; i < 3; i++) l = satzFertig(l, kettenById);
    expect(l.uebungen[0].saetze).toEqual([12, 12, 12]);
    expect(l.aktiv).toBe(1);
    expect(l.wert).toBe(12);
  });
  it('satzFertig springt auch zurück zu einer früheren offenen Übung und meldet Ende mit -1', () => {
    let l = starteEinheit(training, { art: 'leicht', ketten: ['core', 'mobilitaet'] }, kettenById, false, '2026-10-14');
    l = waehle(l, 2, kettenById);
    expect(l.wert).toBe(30);
    l = satzFertig(satzFertig(l, kettenById), kettenById);
    expect(l.aktiv).toBe(0);
    expect(l.wert).toBe(45);
    l = satzFertig(satzFertig(l, kettenById), kettenById);
    l = satzFertig(satzFertig(l, kettenById), kettenById);
    expect(l.aktiv).toBe(-1);
  });
  it('waehle setzt Zielwert, gleiche Übung ändert nichts', () => {
    const l = starteEinheit(training, einheitA, kettenById, false, '2026-10-14');
    expect(waehle(l, 2, kettenById)).toMatchObject({ aktiv: 2, wert: 45 });
    expect(waehle(l, 0, kettenById)).toBe(l);
  });
  it('eintragAusLaufend: nur Übungen mit Sätzen, teil nur bei Routine', () => {
    const l = {
      index: 2, art: 'leicht', datum: '2026-10-14', aktiv: -1, wert: 0,
      uebungen: [
        { kette: 'core', stufe: 0, teil: null, saetze: [45, 40] },
        { kette: 'mobilitaet', stufe: 0, teil: 0, saetze: [45] },
        { kette: 'mobilitaet', stufe: 0, teil: 1, saetze: [] },
      ],
    };
    expect(eintragAusLaufend(l)).toEqual({
      datum: '2026-10-14', einheit: 3, art: 'leicht',
      uebungen: [{ kette: 'core', stufe: 0, saetze: [45, 40] }, { kette: 'mobilitaet', stufe: 0, teil: 0, saetze: [45] }],
    });
  });
});
```

- [ ] **Step 2: Test laufen lassen**

Run: `npx vitest run tests/einheit.test.js`
Expected: FAIL (Modul fehlt).

- [ ] **Step 3: Implementierung** – `js/logik/einheit.js`

```js
// Laufende Trainingseinheit: Übungen aufbauen, Sätze erfassen, zur nächsten offenen Übung springen.
import { kettenFuerEinheit } from './rotation.js';
import { zielFuer, zielwert } from './progression.js';

export function aufloesen(eintrag, kettenById, art) {
  const kette = kettenById[eintrag.kette];
  const stufe = kette.stufen[Math.min(eintrag.stufe, kette.stufen.length - 1)];
  const quelle = eintrag.teil != null ? stufe.routine[eintrag.teil] : stufe;
  const ziel = eintrag.teil != null ? { saetze: 2, sek: quelle.sek } : zielFuer(stufe, art);
  return {
    name: quelle.name,
    ziel,
    seitig: !!quelle.seitig,
    figur: quelle.figurOk === false ? null : quelle.figur ?? null,
    hinweise: quelle.hinweise ?? [],
    achtung: quelle.achtung ?? null,
  };
}

export const schrittweite = (ziel) => (ziel.sek != null ? 5 : 1);

const startwert = (eintrag, kettenById, art) => zielwert(aufloesen(eintrag, kettenById, art).ziel);

export function starteEinheit(training, einheit, kettenById, stange, datum) {
  const uebungen = kettenFuerEinheit(einheit, stange).flatMap((id) => {
    const kette = kettenById[id];
    if (!kette) return [];
    const stufe = Math.min(training.stufen[id] ?? 0, kette.stufen.length - 1);
    const routine = kette.stufen[stufe].routine;
    return routine
      ? routine.map((_, teil) => ({ kette: id, stufe, teil, saetze: [] }))
      : [{ kette: id, stufe, teil: null, saetze: [] }];
  });
  return {
    index: training.naechsteEinheit,
    art: einheit.art,
    datum,
    aktiv: uebungen.length ? 0 : -1,
    wert: uebungen.length ? startwert(uebungen[0], kettenById, einheit.art) : 0,
    uebungen,
  };
}

export function satzFertig(laufend, kettenById) {
  const uebungen = laufend.uebungen.map((u, i) => (i === laufend.aktiv ? { ...u, saetze: [...u.saetze, laufend.wert] } : u));
  const offen = (i) => uebungen[i].saetze.length < aufloesen(uebungen[i], kettenById, laufend.art).ziel.saetze;
  if (offen(laufend.aktiv)) return { ...laufend, uebungen };
  let aktiv = -1;
  for (let schritt = 1; schritt <= uebungen.length; schritt++) {
    const i = (laufend.aktiv + schritt) % uebungen.length;
    if (offen(i)) { aktiv = i; break; }
  }
  return { ...laufend, uebungen, aktiv, wert: aktiv >= 0 ? startwert(uebungen[aktiv], kettenById, laufend.art) : 0 };
}

export function waehle(laufend, index, kettenById) {
  if (index === laufend.aktiv) return laufend;
  return { ...laufend, aktiv: index, wert: startwert(laufend.uebungen[index], kettenById, laufend.art) };
}

export function eintragAusLaufend(laufend) {
  return {
    datum: laufend.datum,
    einheit: laufend.index + 1,
    art: laufend.art,
    uebungen: laufend.uebungen
      .filter((u) => u.saetze.length > 0)
      .map(({ kette, stufe, teil, saetze }) => (teil == null ? { kette, stufe, saetze } : { kette, stufe, teil, saetze })),
  };
}
```

- [ ] **Step 4: Test laufen lassen**

Run: `npx vitest run tests/einheit.test.js`
Expected: PASS (10 Tests).

- [ ] **Step 5: Alle Tests laufen lassen**

Run: `npm test`
Expected: alle Testdateien PASS.

- [ ] **Step 6: Commit**

```bash
git add js/logik/einheit.js tests/einheit.test.js
git commit -m "feat: Logik für die laufende Trainingseinheit"
```

---

### Task 14: App-Gerüst (Router, Hilfen, Blatt, Startseite, Foto-Werkzeuge)

**Files:**
- Create: `js/route.js`, `js/ansichten/html.js`, `js/ansichten/blatt.js`, `js/app.js`, `index.html`
- Create (vorläufig, werden in Task 15/18/19/20 ersetzt): `js/ansichten/training.js`, `js/ansichten/essen.js`, `js/ansichten/einkauf.js`, `js/ansichten/mehr.js`
- Create: `tools/rahmen.html`, `tools/foto.mjs`, `tools/zustaende/laufend.json`, `tools/zustaende/voll.json`
- Modify: `css/komponenten.css` (Ergänzungen am Ende), `bilder/symbole.svg` (Symbol `zurueck`)
- Test: `tests/route.test.js`, `tests/html.test.js`

**Interfaces:**
- Consumes: `laden`, `speichern` (Task 2), `ladeDaten` (Task 10).
- Produces:
  - `parseRoute(hash): { bereich: 'training'|'essen'|'einkauf'|'mehr', teile: string[], parameter: object }`
  - `html.js`: `esc(wert)`, `sym(name, klasse?)`, `zahl(n, stellen?)`, `mengeText(menge, einheit)`, `zielText(ziel, seitig?)`, `datumKurz(datum)`, `sicher(el, text): boolean` (erster Tipp ändert den Knopftext und liefert `false`, zweiter liefert `true`)
  - `blatt.js`: `oeffne(inhaltHtml, { titel }): HTMLElement` (das `.blatt`-Element), `schliesse()`
  - `ctx` (siehe „Ablauf-Konvention“ oben)
  - DOM-Wurzeln in `index.html`: `#meldung`, `#haupt` (Klasse `app`), `#pause-wurzel`, `#blatt-wurzel`, Tabs `.tableiste__tab[data-bereich]`

- [ ] **Step 1: Failing tests schreiben**

`tests/route.test.js`:

```js
import { describe, it, expect } from 'vitest';
import { parseRoute } from '../js/route.js';

describe('parseRoute', () => {
  it('leer und unbekannt führen zum Training', () => {
    expect(parseRoute('')).toEqual({ bereich: 'training', teile: [], parameter: {} });
    expect(parseRoute('#/unsinn/x')).toEqual({ bereich: 'training', teile: [], parameter: {} });
  });
  it('Bereich, Teile und Parameter', () => {
    expect(parseRoute('#/essen/rezept/huhn-reis-pfanne?tausch=abend%3A0')).toEqual({
      bereich: 'essen', teile: ['rezept', 'huhn-reis-pfanne'], parameter: { tausch: 'abend:0' },
    });
    expect(parseRoute('#/einkauf?ansicht=rezept')).toEqual({ bereich: 'einkauf', teile: [], parameter: { ansicht: 'rezept' } });
    expect(parseRoute('#/training/verlauf')).toEqual({ bereich: 'training', teile: ['verlauf'], parameter: {} });
  });
});
```

`tests/html.test.js`:

```js
import { describe, it, expect } from 'vitest';
import { esc, sym, zahl, mengeText, zielText, datumKurz, sicher } from '../js/ansichten/html.js';

describe('html-Hilfen', () => {
  it('esc maskiert HTML', () => {
    expect(esc('<a href="x">&\'')).toBe('&lt;a href=&quot;x&quot;&gt;&amp;&#39;');
    expect(esc(null)).toBe('');
  });
  it('sym verweist auf das Symbol-Sprite', () => {
    expect(sym('plus')).toBe('<svg class="symbol" aria-hidden="true"><use href="bilder/symbole.svg#plus"/></svg>');
    expect(sym('haken', 'symbol--klein')).toContain('class="symbol symbol--klein"');
  });
  it('Zahlen und Mengen deutsch formatiert', () => {
    expect(zahl(2950)).toBe('2.950');
    expect(zahl(7.99, 2)).toBe('7,99');
    expect(mengeText(1000, 'g')).toBe('1.000 g');
    expect(mengeText(1.5, 'Stück')).toBe('1,5 Stück');
    expect(mengeText(2, '')).toBe('2');
    expect(mengeText(null, '')).toBe('');
  });
  it('Ziele und Datum', () => {
    expect(zielText({ saetze: 3, wdh: 6 }, true)).toBe('3 × 6 / Seite');
    expect(zielText({ saetze: 2, sek: 45 })).toBe('2 × 45 s');
    expect(datumKurz('2026-10-04')).toBe('4.10.');
  });
  it('sicher verlangt einen zweiten Tipp', () => {
    const knopf = { dataset: {}, textContent: 'Löschen' };
    expect(sicher(knopf, 'Nochmal tippen')).toBe(false);
    expect(knopf.textContent).toBe('Nochmal tippen');
    expect(sicher(knopf, 'Nochmal tippen')).toBe(true);
  });
});
```

- [ ] **Step 2: Tests laufen lassen**

Run: `npx vitest run tests/route.test.js tests/html.test.js`
Expected: FAIL (Module fehlen).

- [ ] **Step 3: Implementierung** – `js/route.js`

```js
// Router über die Adresszeile: #/bereich/teil/teil?parameter=wert
const BEREICHE = ['training', 'essen', 'einkauf', 'mehr'];

export function parseRoute(hash) {
  const [pfad, abfrage = ''] = String(hash ?? '').replace(/^#\/?/, '').split('?');
  const teile = pfad.split('/').filter(Boolean).map(decodeURIComponent);
  const parameter = Object.fromEntries(new URLSearchParams(abfrage));
  if (!BEREICHE.includes(teile[0])) return { bereich: 'training', teile: [], parameter: {} };
  return { bereich: teile[0], teile: teile.slice(1), parameter };
}
```

- [ ] **Step 4: Implementierung** – `js/ansichten/html.js`

```js
// Kleine Hilfen für die Ansichten: sicheres HTML, Symbole, deutsche Zahlen.

const ZEICHEN = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };

export function esc(wert) {
  return String(wert ?? '').replace(/[&<>"']/g, (c) => ZEICHEN[c]);
}

export function sym(name, klasse = '') {
  return `<svg class="symbol${klasse ? ` ${klasse}` : ''}" aria-hidden="true"><use href="bilder/symbole.svg#${name}"/></svg>`;
}

export function zahl(n, stellen = 0) {
  return Number(n).toLocaleString('de-DE', { minimumFractionDigits: stellen, maximumFractionDigits: stellen });
}

export function mengeText(menge, einheit) {
  if (menge == null) return '';
  const text = zahl(menge, Number.isInteger(menge) ? 0 : 1);
  return einheit ? `${text} ${einheit}` : text;
}

export function zielText(ziel, seitig = false) {
  const wert = ziel.wdh != null ? `${ziel.wdh}` : `${ziel.sek} s`;
  return `${ziel.saetze} × ${wert}${seitig ? ' / Seite' : ''}`;
}

export function datumKurz(datum) {
  const [, monat, tag] = datum.split('-');
  return `${Number(tag)}.${Number(monat)}.`;
}

// Zweistufige Bestätigung ohne Dialog: erster Tipp ändert den Text, zweiter führt aus.
export function sicher(el, text) {
  if (el.dataset.sicher) return true;
  el.dataset.sicher = '1';
  el.textContent = text;
  return false;
}
```

- [ ] **Step 5: Tests laufen lassen**

Run: `npx vitest run tests/route.test.js tests/html.test.js`
Expected: PASS (7 Tests).

- [ ] **Step 6: Symbol `zurueck` ergänzen** – in `bilder/symbole.svg` vor `</svg>` einfügen:

```xml
  <symbol id="zurueck" viewBox="0 0 24 24"><path d="M15 5l-7 7 7 7"/></symbol>
```

- [ ] **Step 7: CSS-Ergänzungen** – ans Ende von `css/komponenten.css` anhängen:

```css
/* ---------- Ergänzungen für die App (Task 14) ---------- */

#meldung:not(:empty) { padding-top: var(--sicher-oben); }

.titelleiste__aktionen--links { justify-content: flex-start; margin-left: calc(var(--a-3) * -1); margin-right: 0; }
.titelleiste__titel--lang { font-size: 1.75rem; }

/* Haarlinien zwischen Listeneinträgen (li > .zeile) */
.gruppe__inhalt > li + li { position: relative; }
.gruppe__inhalt > li + li::before {
  content: "";
  position: absolute;
  top: 0;
  left: var(--a-4);
  right: 0;
  z-index: 1;
  border-top: 0.5px solid var(--haarlinie);
}
.gruppe__inhalt > li + li:has(.abhaken)::before { left: 54px; }
.gruppe__inhalt > li.kategorie + li::before,
.gruppe__inhalt > li + li.kategorie::before { display: none; }
.gruppe__inhalt--abstand { margin-top: var(--a-4); }

.zeile--knopf { justify-content: center; color: var(--tint); }
.zeile--gefahr { color: var(--gefahr); }
.zeile:disabled { color: var(--text-3); pointer-events: none; }
.zeile__link { display: flex; flex-direction: column; justify-content: center; min-height: var(--tipp); color: inherit; text-decoration: none; }
.zeile__wert--tint { color: var(--tint); }
.zeile__haupt > .zeile__titel, .zeile__haupt > .zeile__unter { display: block; }
.zeile__icon--grau { background: var(--markt-egal); }
.zeile[aria-current="true"] .zeile__titel { font-weight: 600; color: var(--tint); }
.gruppe__fuss--frei { margin: var(--a-2) var(--rand) 0; }

.aktionen { display: grid; gap: var(--a-2); }
.uebung__fertig { margin-top: var(--a-4); }
.uebung__serie { margin-top: var(--a-2); }
.schritte {
  display: grid;
  gap: var(--a-2);
  padding: var(--a-3) var(--a-4) var(--a-3) calc(var(--a-4) + 1.4em);
  list-style: decimal;
  font: var(--t-text);
}

/* Segment-Umschalter mit Links (Navigation statt Formular) */
.segment a {
  position: relative;
  display: grid;
  place-items: center;
  min-height: 40px;
  border-radius: 8px;
  color: var(--text);
  text-decoration: none;
  font: 500 0.9375rem/1 var(--schrift);
}
.segment a::after { content: ""; position: absolute; inset: -4px 0; }
.segment a[aria-current] {
  background: var(--zelle);
  font-weight: 600;
  box-shadow: 0 3px 8px rgba(0, 0, 0, 0.12), 0 1px 1px rgba(0, 0, 0, 0.04);
}

/* Abhaken: langes Drücken ohne iOS-Textauswahl */
.abhaken { -webkit-touch-callout: none; -webkit-user-select: none; user-select: none; }

/* ---------- Kleiner Zähler in Zeilen ---------- */

.mini-zaehler { display: flex; flex: none; align-items: center; gap: var(--a-1); }
.mini-zaehler button {
  display: grid;
  place-items: center;
  width: var(--tipp);
  height: var(--tipp);
  border: 0;
  border-radius: var(--r-feld);
  background: var(--zelle-2);
  color: var(--tint);
}
.mini-zaehler button:active { background: var(--zelle-gedrueckt); }
.mini-zaehler button:disabled { color: var(--text-3); pointer-events: none; }
.mini-zaehler .symbol { width: 18px; height: 18px; stroke-width: 2.4; }
.mini-zaehler output { min-width: 3ch; text-align: center; font: var(--t-kopf); }

/* ---------- Eingabefelder ---------- */

.eingabe {
  flex: 1;
  min-width: 0;
  min-height: var(--tipp);
  padding: 0 var(--a-3);
  border: 0;
  border-radius: var(--r-feld);
  background: var(--zelle-2);
  color: var(--text);
  font: var(--t-text);
}
.eingabe::placeholder { color: var(--text-2); }
.eingabe:focus-visible { outline: 3px solid var(--tint); outline-offset: 0; }
.eingabe--kurz { flex: none; width: 112px; text-align: right; }
.eingabe::-webkit-inner-spin-button, .eingabe::-webkit-outer-spin-button { -webkit-appearance: none; margin: 0; }

/* ---------- Blatt von unten (statt Dialogfenster) ---------- */

.blatt-huelle {
  position: fixed;
  inset: 0;
  z-index: 50;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  background: rgba(0, 0, 0, 0.32);
  animation: blatt-einblenden var(--mittel) var(--ease);
}
.blatt {
  max-height: 88dvh;
  overflow-y: auto;
  overscroll-behavior: contain;
  padding: var(--a-2) var(--rand) calc(var(--a-6) + var(--sicher-unten));
  border-radius: var(--r-material) var(--r-material) 0 0;
  background: var(--grund);
  box-shadow: 0 -6px 24px rgba(0, 0, 0, 0.18);
  transition: transform var(--kurz) var(--ease);
  animation: blatt-hochfahren var(--mittel) var(--ease);
}
.blatt:focus { outline: none; }
.blatt__griff { width: 36px; height: 5px; margin: 0 auto var(--a-2); border-radius: 3px; background: var(--zelle-gedrueckt); touch-action: none; }
.blatt__kopf { display: flex; align-items: center; justify-content: space-between; gap: var(--a-3); min-height: var(--tipp); touch-action: none; }
.blatt__titel { font: var(--t-kopf); }
.blatt .gruppe { margin-left: 0; margin-right: 0; }
@keyframes blatt-hochfahren { from { transform: translateY(100%); } }
@keyframes blatt-einblenden { from { opacity: 0; } }
```

- [ ] **Step 8: Blatt** – `js/ansichten/blatt.js`

```js
// Blatt von unten (iOS-Sheet). Schließen: "Fertig", Tipp daneben, Escape oder nach unten wischen.
import { esc } from './html.js';

const wurzel = () => document.getElementById('blatt-wurzel');
let vorherFokus = null;

export function oeffne(inhalt, { titel }) {
  vorherFokus = document.activeElement;
  wurzel().innerHTML = `
    <div class="blatt-huelle">
      <section class="blatt" role="dialog" aria-modal="true" aria-labelledby="blatt-titel" tabindex="-1">
        <div class="blatt__griff" aria-hidden="true"></div>
        <div class="blatt__kopf">
          <h2 class="blatt__titel" id="blatt-titel">${esc(titel)}</h2>
          <button class="knopf knopf--schlicht" type="button" data-blatt-zu>Fertig</button>
        </div>
        ${inhalt}
      </section>
    </div>`;
  const huelle = wurzel().firstElementChild;
  const blatt = huelle.firstElementChild;
  huelle.addEventListener('click', (e) => {
    if (e.target === huelle || e.target.closest('[data-blatt-zu]')) schliesse();
  });
  huelle.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') schliesse();
  });
  wischen(blatt);
  blatt.focus();
  return blatt;
}

export function schliesse() {
  wurzel().innerHTML = '';
  vorherFokus?.focus?.();
  vorherFokus = null;
}

function wischen(blatt) {
  let startY = null;
  let weg = 0;
  blatt.addEventListener('pointerdown', (e) => {
    if (!e.target.closest('.blatt__griff, .blatt__kopf') || e.target.closest('button')) return;
    startY = e.clientY;
    weg = 0;
    blatt.setPointerCapture(e.pointerId);
  });
  blatt.addEventListener('pointermove', (e) => {
    if (startY === null) return;
    weg = Math.max(0, e.clientY - startY);
    blatt.style.transform = `translateY(${weg}px)`;
  });
  const ende = () => {
    if (startY === null) return;
    startY = null;
    if (weg > 80) schliesse();
    else blatt.style.transform = '';
  };
  blatt.addEventListener('pointerup', ende);
  blatt.addEventListener('pointercancel', ende);
}
```

- [ ] **Step 9: Vorläufige Ansichten** – jeweils eine Datei, die nur den Titel zeigt (Task 15/18/19/20 ersetzen sie vollständig):

`js/ansichten/training.js`:

```js
export function zeige(wurzel) {
  wurzel.onclick = null;
  wurzel.innerHTML = '<header class="titelleiste"><div class="titelleiste__aktionen"></div><h1 class="titelleiste__titel">Training</h1></header>';
}
```

`js/ansichten/essen.js`:

```js
export function zeige(wurzel) {
  wurzel.onclick = null;
  wurzel.innerHTML = '<header class="titelleiste"><div class="titelleiste__aktionen"></div><h1 class="titelleiste__titel">Essen</h1></header>';
}
```

`js/ansichten/einkauf.js`:

```js
export function zeige(wurzel) {
  wurzel.onclick = null;
  wurzel.innerHTML = '<header class="titelleiste"><div class="titelleiste__aktionen"></div><h1 class="titelleiste__titel">Einkauf</h1></header>';
}
```

`js/ansichten/mehr.js`:

```js
export function zeige(wurzel) {
  wurzel.onclick = null;
  wurzel.innerHTML = '<header class="titelleiste"><div class="titelleiste__aktionen"></div><h1 class="titelleiste__titel">Mehr</h1></header>';
}
```

- [ ] **Step 10: App-Start** – `js/app.js`

```js
// Start: Zustand laden, Daten laden, Ansicht zur Adresszeile zeichnen. ctx wird an alle Ansichten gegeben.
import { laden, speichern } from './speicher.js';
import { ladeDaten } from './daten.js';
import { parseRoute } from './route.js';
import { esc } from './ansichten/html.js';
import * as training from './ansichten/training.js';
import * as essen from './ansichten/essen.js';
import * as einkauf from './ansichten/einkauf.js';
import * as mehr from './ansichten/mehr.js';

const ANSICHTEN = { training, essen, einkauf, mehr };
const MELDUNGEN = {
  defekt: ['Gespeicherte Daten waren beschädigt', 'Die App startet mit Standardwerten. Die alten Daten kannst du unter Mehr → Daten exportieren.'],
  'nicht-lesbar': ['Speicher nicht lesbar', 'Die App läuft mit Standardwerten. Änderungen werden eventuell nicht gespeichert.'],
  voll: ['Speicher voll', 'Die letzte Änderung konnte nicht gespeichert werden. Exportiere deine Daten unter Mehr.'],
};

const haupt = document.getElementById('haupt');
const meldungWurzel = document.getElementById('meldung');

const ctx = {
  zustand: null,
  daten: null,
  meldung: null,
  aendern(fn) {
    fn(ctx.zustand);
    const r = speichern(window.localStorage, ctx.zustand);
    if (!r.ok) ctx.meldung = 'voll';
    else if (ctx.meldung === 'voll') ctx.meldung = null;
    zeichnen();
  },
  navigiere(hash) {
    if (location.hash === hash) zeichnen();
    else location.hash = hash;
  },
  ersetzen(zustand) {
    ctx.zustand = zustand;
    zeichnen();
  },
};

function meldungZeichnen() {
  const m = MELDUNGEN[ctx.meldung];
  meldungWurzel.innerHTML = m
    ? `<div class="hinweis hinweis--info" role="alert">
        <div class="hinweis__kopf"><div><p class="hinweis__titel">${esc(m[0])}</p><p class="hinweis__text">${esc(m[1])}</p></div></div>
        <div class="knopfreihe"><button class="knopf knopf--getoent" type="button" data-meldung-zu>Verstanden</button></div>
      </div>`
    : '';
}

meldungWurzel.addEventListener('click', (e) => {
  if (!e.target.closest('[data-meldung-zu]')) return;
  ctx.meldung = null;
  meldungZeichnen();
});

function zeichnen() {
  const route = parseRoute(location.hash);
  for (const tab of document.querySelectorAll('.tableiste__tab')) {
    if (tab.dataset.bereich === route.bereich) tab.setAttribute('aria-current', 'page');
    else tab.removeAttribute('aria-current');
  }
  meldungZeichnen();
  // Handler der vorigen Ansicht entfernen; jede Ansicht setzt ihre eigenen.
  haupt.onclick = haupt.onchange = haupt.onsubmit = null;
  haupt.onpointerdown = haupt.onpointerup = haupt.onpointercancel = null;
  ANSICHTEN[route.bereich].zeige(haupt, ctx, route);
}

async function start() {
  const geladen = laden(window.localStorage);
  ctx.zustand = geladen.zustand;
  ctx.meldung = geladen.meldung;
  try {
    const { daten, warnungen } = await ladeDaten();
    ctx.daten = daten;
    for (const w of warnungen) console.warn(w);
  } catch (fehler) {
    console.error(fehler);
    haupt.innerHTML = `<div class="gruppe"><div class="gruppe__inhalt leer">
      <p class="leer__titel">Daten nicht geladen</p>
      <p class="leer__text">Die App-Daten sind noch nicht offline gespeichert. Prüfe die Internetverbindung und öffne die App erneut.</p>
    </div></div>`;
    return;
  }
  navigator.storage?.persist?.().catch(() => {});
  window.addEventListener('hashchange', zeichnen);
  if (!location.hash) history.replaceState(null, '', '#/training');
  zeichnen();
}

start();
```

- [ ] **Step 11: App-Gerüst** – `index.html`

```html
<!doctype html>
<html lang="de">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
  <meta name="apple-mobile-web-app-capable" content="yes">
  <meta name="apple-mobile-web-app-title" content="Fit &amp; Einkauf">
  <meta name="apple-mobile-web-app-status-bar-style" content="default">
  <meta name="theme-color" content="#F2F2F7" media="(prefers-color-scheme: light)">
  <meta name="theme-color" content="#000000" media="(prefers-color-scheme: dark)">
  <title>Fit &amp; Einkauf</title>
  <script>/* ?thema=hell|dunkel erzwingt eine Darstellung (Bildschirmfotos) */ const t = new URLSearchParams(location.search).get('thema'); if (t) document.documentElement.dataset.theme = t;</script>
  <link rel="stylesheet" href="css/tokens.css">
  <link rel="stylesheet" href="css/komponenten.css">
</head>
<body>
  <div id="meldung"></div>
  <main class="app" id="haupt"></main>
  <div id="pause-wurzel"></div>
  <div id="blatt-wurzel"></div>
  <nav class="tableiste" aria-label="Bereiche">
    <a class="tableiste__tab" href="#/training" data-bereich="training">
      <svg class="symbol" aria-hidden="true"><use href="bilder/symbole.svg#training"/></svg>Training
    </a>
    <a class="tableiste__tab" href="#/essen" data-bereich="essen">
      <svg class="symbol" aria-hidden="true"><use href="bilder/symbole.svg#essen"/></svg>Essen
    </a>
    <a class="tableiste__tab" href="#/einkauf" data-bereich="einkauf">
      <svg class="symbol" aria-hidden="true"><use href="bilder/symbole.svg#einkauf"/></svg>Einkauf
    </a>
    <a class="tableiste__tab" href="#/mehr" data-bereich="mehr">
      <svg class="symbol" aria-hidden="true"><use href="bilder/symbole.svg#mehr"/></svg>Mehr
    </a>
  </nav>
  <script type="module" src="js/app.js"></script>
</body>
</html>
```

- [ ] **Step 12: Foto-Werkzeuge**

`tools/rahmen.html`:

```html
<!doctype html>
<meta charset="utf-8">
<title>Rahmen</title>
<style>html, body { margin: 0; background: #888; } iframe { display: block; border: 0; }</style>
<script type="module">
  // Zeigt eine Seite in 375 px Breite und lädt optional einen Testzustand aus tools/zustaende/.
  const p = new URLSearchParams(location.search);
  localStorage.removeItem('fitEinkauf');
  if (p.get('zustand')) {
    localStorage.setItem('fitEinkauf', await (await fetch(`zustaende/${p.get('zustand')}.json`)).text());
  }
  const rahmen = document.createElement('iframe');
  rahmen.width = 375;
  rahmen.height = p.get('h') || 812;
  rahmen.src = p.get('u') || '/index.html';
  document.body.append(rahmen);
</script>
```

`tools/foto.mjs`:

```js
// Bildschirmfoto im 375-px-Rahmen mit Edge headless (Server muss laufen: npm run serve).
// node tools/foto.mjs "<pfad#hash>" <datei.png> [hell|dunkel] [höhe] [zustand]
import { execFileSync } from 'node:child_process';
import { mkdirSync, mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';

const [, , ziel = 'index.html#/training', datei = 'fotos/foto.png', thema = 'hell', hoehe = '812', zustand = ''] = process.argv;
const edge = process.env.EDGE ?? 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe';
const [pfad, hash = ''] = ziel.split('#');
const seite = `/${pfad}?thema=${thema}${hash ? `#${hash}` : ''}`;
const url = `http://127.0.0.1:8765/tools/rahmen.html?h=${hoehe}&zustand=${zustand}&u=${encodeURIComponent(seite)}`;

mkdirSync(dirname(resolve(datei)), { recursive: true });
execFileSync(edge, [
  '--headless=new', '--disable-gpu', '--hide-scrollbars', '--force-device-scale-factor=2', '--virtual-time-budget=5000',
  `--user-data-dir=${mkdtempSync(join(tmpdir(), 'fit-einkauf-'))}`, `--window-size=500,${hoehe}`,
  `--screenshot=${resolve(datei)}`, url,
], { stdio: 'ignore' });
console.log(resolve(datei));
```

`tools/zustaende/laufend.json` (Oberkörper A läuft, Diamond-Liegestütz Satz 1 erledigt):

```json
{
  "schema": 1,
  "einstellungen": { "ziele": { "kcal": 2950, "protein": 130, "fett": 75, "kh": 430 }, "abneigungen": ["curry", "tofu"], "stange": false, "grundvorratAusblenden": false, "marktZuordnung": {}, "pauseSek": { "schwer": 90, "leicht": 60 } },
  "training": {
    "naechsteEinheit": 0, "stufen": { "druecken-horizontal": 1 }, "vorschlaege": [], "log": [],
    "laufend": { "index": 0, "art": "schwer", "datum": "2026-10-14", "aktiv": 0, "wert": 12, "uebungen": [
      { "kette": "druecken-horizontal", "stufe": 1, "teil": null, "saetze": [12] },
      { "kette": "ziehen-ohne-stange", "stufe": 0, "teil": null, "saetze": [] },
      { "kette": "core", "stufe": 0, "teil": null, "saetze": [] }
    ] }
  },
  "essen": { "wochenplan": { "kw": "2026-W42", "abend": [], "jause": [], "snack": { "rezept": "skyr-haferflocken", "anzahl": 7 }, "extra": [] }, "abgehakt": {}, "aufgebraucht": [] },
  "gewicht": [],
  "letzterExport": null
}
```

`tools/zustaende/voll.json` (Plan, Haken, Log, Gewicht, Vorschlag, alte Sicherung):

```json
{
  "schema": 1,
  "einstellungen": { "ziele": { "kcal": 2950, "protein": 130, "fett": 75, "kh": 430 }, "abneigungen": ["curry", "tofu"], "stange": false, "grundvorratAusblenden": false, "marktZuordnung": {}, "pauseSek": { "schwer": 90, "leicht": 60 } },
  "training": {
    "naechsteEinheit": 1, "stufen": { "druecken-horizontal": 0, "ziehen-ohne-stange": 0, "core": 0 }, "laufend": null,
    "vorschlaege": [{ "kette": "druecken-horizontal", "nach": 1, "name": "Diamond-Liegestütz", "ziel": { "saetze": 3, "wdh": 12 } }],
    "log": [
      { "datum": "2026-10-07", "einheit": 1, "art": "schwer", "uebungen": [
        { "kette": "druecken-horizontal", "stufe": 0, "saetze": [15, 15, 15] },
        { "kette": "ziehen-ohne-stange", "stufe": 0, "saetze": [12, 11, 10] },
        { "kette": "core", "stufe": 0, "saetze": [45, 45, 40] } ] },
      { "datum": "2026-10-13", "einheit": 1, "art": "schwer", "uebungen": [
        { "kette": "druecken-horizontal", "stufe": 0, "saetze": [15, 15, 16] },
        { "kette": "ziehen-ohne-stange", "stufe": 0, "saetze": [12, 12, 12] },
        { "kette": "core", "stufe": 0, "saetze": [45, 45, 45] } ] }
    ]
  },
  "essen": {
    "wochenplan": { "kw": "2026-W42",
      "abend": [{ "rezept": "huhn-reis-pfanne", "portionen": 4 }, { "rezept": "chili-con-carne", "portionen": 4 }],
      "jause": [{ "rezept": "weckerl-schinken-kaese", "anzahl": 3 }, { "rezept": "spar-leberkaessemmel", "anzahl": 2 }],
      "snack": { "rezept": "skyr-haferflocken", "anzahl": 7 },
      "extra": [{ "rezept": "milch-banane-nuesse", "anzahl": 4 }, { "rezept": "muesli-schale", "anzahl": 3 }] },
    "abgehakt": { "paprika|Stück": true, "huehnerbrust|g": true },
    "aufgebraucht": ["olivenoel"]
  },
  "gewicht": [{ "datum": "2026-09-21", "kg": 72.0 }, { "datum": "2026-09-28", "kg": 72.2 }, { "datum": "2026-10-05", "kg": 72.3 }, { "datum": "2026-10-12", "kg": 72.6 }],
  "letzterExport": "2026-09-20"
}
```

- [ ] **Step 13: Prüfen**

Run: `npm test` → Expected: alle PASS.
Server läuft (`npm run serve`). Run: `node tools/foto.mjs "index.html#/essen" fotos/geruest.png hell`
Expected: Foto zeigt großen Titel „Essen“ und die Tab-Leiste mit „Essen“ blau hervorgehoben, keine Konsolenfehler beim Öffnen von `http://127.0.0.1:8765/` im normalen Browser (DevTools-Konsole: höchstens Warnungen zu fehlenden Figuren, falls Task 12 noch nicht fertig ist).

- [ ] **Step 14: Commit**

```bash
git add index.html js/app.js js/route.js js/ansichten tools css/komponenten.css bilder/symbole.svg tests/route.test.js tests/html.test.js
git commit -m "feat: App-Gerüst mit Router, Blatt, Hilfen und Foto-Werkzeugen"
```

---

### Task 15: Trainings-Ansicht (Start, laufende Einheit, Pause, Verlauf)

**Files:**
- Create: `js/ansichten/pause.js`, `js/ansichten/wachhalten.js`
- Replace: `js/ansichten/training.js`

**Interfaces:**
- Consumes: Rotation (Task 3), Progression (Task 4), Einheit (Task 13), `heute` (Task 1), `html.js` (Task 14), `ctx`.
- Produces: `pause.js`: `tonVorbereiten()`, `starte(sek, beschriftung)`, `stoppe()`; `wachhalten.js`: `an()`, `aus()`. `training.js` exportiert `zeige(wurzel, ctx, route)`; enthält die Funktion `figurHtml(info)`, die Task 16 ersetzt.

- [ ] **Step 1: Pausen-Leiste** – `js/ansichten/pause.js`

```js
// Pausen-Leiste über der Tab-Leiste. Gerechnet wird mit der Endzeit, damit die Pause auch nach dem Sperrbildschirm stimmt.
const wurzel = () => document.getElementById('pause-wurzel');
const haupt = () => document.getElementById('haupt');
let ende = 0;
let dauer = 0;
let rahmen = 0;
let beschriftung = '';
let ton = null;

// Muss bei einem Tipp aufgerufen werden (iOS erlaubt Ton nur nach einer Berührung).
export function tonVorbereiten() {
  try {
    ton ??= new AudioContext();
    ton.resume?.();
  } catch {
    ton = null;
  }
}

function piep() {
  if (!ton) return;
  const jetzt = ton.currentTime;
  for (const ab of [0, 0.25, 0.5]) {
    const osz = ton.createOscillator();
    const lautstaerke = ton.createGain();
    osz.frequency.value = 880;
    lautstaerke.gain.setValueAtTime(0.0001, jetzt + ab);
    lautstaerke.gain.exponentialRampToValueAtTime(0.3, jetzt + ab + 0.02);
    lautstaerke.gain.exponentialRampToValueAtTime(0.0001, jetzt + ab + 0.18);
    osz.connect(lautstaerke).connect(ton.destination);
    osz.start(jetzt + ab);
    osz.stop(jetzt + ab + 0.2);
  }
}

const zeit = (sek) => `${Math.floor(sek / 60)}:${String(sek % 60).padStart(2, '0')}`;

function zeichnen() {
  wurzel().innerHTML = `
    <aside class="pause" aria-label="Pause">
      <div class="pause__info">
        <div class="pause__label" data-pause-label></div>
        <div class="pause__zeit" role="timer" data-pause-zeit></div>
      </div>
      <button class="knopf knopf--getoent knopf--klein" type="button" data-pause="plus">+15 s</button>
      <button class="knopf knopf--schlicht knopf--klein" type="button" data-pause="weiter">Weiter</button>
      <div class="pause__balken" aria-hidden="true"><div class="pause__rest" data-pause-rest></div></div>
    </aside>`;
  wurzel().onclick = (e) => {
    const knopf = e.target.closest('[data-pause]');
    if (!knopf) return;
    if (knopf.dataset.pause === 'weiter') stoppe();
    else if (ende <= Date.now()) starte(15, beschriftung);
    else {
      ende += 15000;
      dauer += 15;
    }
  };
  haupt().classList.add('app--mit-pause');
}

function tick() {
  const leiste = wurzel().querySelector('.pause');
  if (!leiste) return;
  const restMs = Math.max(0, ende - Date.now());
  leiste.querySelector('[data-pause-zeit]').textContent = zeit(Math.ceil(restMs / 1000));
  leiste.querySelector('[data-pause-rest]').style.setProperty('--rest', restMs / (dauer * 1000));
  if (restMs > 0) {
    rahmen = requestAnimationFrame(tick);
    return;
  }
  leiste.classList.add('pause--fertig');
  const label = leiste.querySelector('[data-pause-label]');
  label.textContent = 'Pause vorbei – los geht’s';
  label.classList.add('pause__label--fertig');
  leiste.querySelector('[data-pause-rest]').style.setProperty('--rest', 1);
  piep();
}

export function starte(sek, text) {
  cancelAnimationFrame(rahmen);
  dauer = sek;
  ende = Date.now() + sek * 1000;
  beschriftung = text;
  zeichnen();
  wurzel().querySelector('[data-pause-label]').textContent = text;
  tick();
}

export function stoppe() {
  cancelAnimationFrame(rahmen);
  ende = 0;
  wurzel().innerHTML = '';
  haupt().classList.remove('app--mit-pause');
}
```

- [ ] **Step 2: Bildschirm wach halten** – `js/ansichten/wachhalten.js`

```js
// Screen Wake Lock während einer laufenden Einheit (iOS 16.4+; fehlt die Funktion, passiert einfach nichts).
let sperre = null;
let gewuenscht = false;

async function holen() {
  try {
    sperre = (await navigator.wakeLock?.request('screen')) ?? null;
  } catch {
    sperre = null;
  }
}

export function an() {
  gewuenscht = true;
  if (!sperre) holen();
}

export function aus() {
  gewuenscht = false;
  sperre?.release?.();
  sperre = null;
}

document.addEventListener('visibilitychange', () => {
  if (gewuenscht && document.visibilityState === 'visible') {
    sperre = null;
    holen();
  }
});
```

- [ ] **Step 3: Trainings-Ansicht** – `js/ansichten/training.js` (ersetzt die vorläufige Datei)

```js
// Training: heutige Einheit, laufende Einheit mit Sätzen und Pause, Verlauf pro Kette.
import { esc, sym, zielText, datumKurz, sicher } from './html.js';
import { naechsteEinheit, abschliessen, ueberspringen, kettenFuerEinheit } from '../logik/rotation.js';
import { zielFuer, zielwert, erreicht, erfolgsserie, vorschlaegeNachAbschluss, stufeVerschieben } from '../logik/progression.js';
import { aufloesen, schrittweite, starteEinheit, satzFertig, waehle, eintragAusLaufend } from '../logik/einheit.js';
import { heute } from '../logik/datum.js';
import * as pause from './pause.js';
import * as wach from './wachhalten.js';

// Wird in Task 16 durch die Übungsfigur ersetzt.
const figurHtml = () => '';

export function zeige(wurzel, ctx, route) {
  wurzel.onclick = (e) => {
    const el = e.target.closest('[data-aktion]');
    if (el && !el.disabled) AKTIONEN[el.dataset.aktion]?.(el, ctx);
  };
  wurzel.onchange = null;
  if (route.teile[0] === 'verlauf') return zeigeVerlauf(wurzel, ctx);
  if (ctx.zustand.training.laufend) return zeigeLaufend(wurzel, ctx);
  return zeigeStart(wurzel, ctx);
}

const stufeVon = (kette, stufen) => Math.min(stufen[kette.id] ?? 0, kette.stufen.length - 1);

function vorschlaegeHtml(vorschlaege) {
  return vorschlaege.map((v) => `
    <div class="hinweis" role="status">
      <div class="hinweis__kopf">
        <span class="hinweis__icon">${sym('hoch')}</span>
        <div>
          <p class="hinweis__titel">Stark – nächste Stufe?</p>
          <p class="hinweis__text">Zweimal in Folge geschafft. Nächstes Mal ${esc(v.name)} ${esc(zielText(v.ziel))}.</p>
        </div>
      </div>
      <div class="knopfreihe">
        <button class="knopf knopf--getoent" type="button" data-aktion="vorschlag-spaeter" data-kette="${esc(v.kette)}">Später</button>
        <button class="knopf knopf--gefuellt" type="button" data-aktion="vorschlag-ja" data-kette="${esc(v.kette)}">Ja, steigern</button>
      </div>
    </div>`).join('');
}

function zeigeStart(wurzel, ctx) {
  const { zustand, daten } = ctx;
  wach.aus();
  const einheit = naechsteEinheit(zustand.training, daten.plan);
  const nummer = (zustand.training.naechsteEinheit % daten.plan.einheiten.length) + 1;
  const zeilen = kettenFuerEinheit(einheit, zustand.einstellungen.stange).map((id) => {
    const kette = daten.kettenById[id];
    if (!kette) return '';
    const stufe = kette.stufen[stufeVon(kette, zustand.training.stufen)];
    const titel = stufe.routine ? kette.name : stufe.name;
    const wert = stufe.routine ? `${stufe.routine.length} Übungen` : zielText(zielFuer(stufe, einheit.art), stufe.seitig);
    return `<li><div class="zeile"><div class="zeile__haupt zeile__titel">${esc(titel)}</div><span class="zeile__wert">${esc(wert)}</span></div></li>`;
  }).join('');
  wurzel.innerHTML = `
    <header class="titelleiste">
      <div class="titelleiste__aktionen"><a class="knopf knopf--schlicht" href="#/training/verlauf">Verlauf</a></div>
      <h1 class="titelleiste__titel">${esc(einheit.name)}</h1>
      <p class="titelleiste__unter">Heute · Einheit ${nummer} von ${daten.plan.einheiten.length} · ${esc(einheit.art)} · ${esc(einheit.dauer)}</p>
    </header>
    ${vorschlaegeHtml(zustand.training.vorschlaege)}
    <section class="gruppe">
      <h2 class="gruppe__kopf">Übungen</h2>
      <ul class="gruppe__inhalt">${zeilen}</ul>
    </section>
    <div class="gruppe">
      <button class="knopf knopf--gefuellt knopf--gross knopf--breit" type="button" data-aktion="starten">Training starten</button>
    </div>
    <section class="gruppe">
      <div class="gruppe__inhalt"><button class="zeile zeile--knopf zeile--gefahr" type="button" data-aktion="ueberspringen">Einheit überspringen</button></div>
      <p class="gruppe__fuss">Überspringen rückt zur nächsten Einheit, ohne etwas zu speichern.</p>
    </section>`;
}

function satzFelder(u, info, wert) {
  const soll = zielwert(info.ziel);
  const felder = [];
  for (let j = 0; j < info.ziel.saetze; j++) {
    const getan = u.saetze[j];
    if (getan != null && getan >= soll) {
      felder.push(`<li class="satz satz--erreicht"><span>Satz ${j + 1}</span><span class="satz__wert">${getan}</span></li>`);
    } else if (getan != null) {
      felder.push(`<li class="satz satz--unter"><span class="satz__marke">−${soll - getan}</span><span class="satz__wert">${getan}</span></li>`);
    } else if (j === u.saetze.length) {
      felder.push(`<li class="satz satz--aktiv" aria-current="step"><span>Satz ${j + 1}</span><span class="satz__wert">${wert}</span></li>`);
    } else {
      felder.push(`<li class="satz"><span>Satz ${j + 1}</span><span class="satz__wert satz__wert--leer">–</span></li>`);
    }
  }
  return `<ol class="saetze" style="--anzahl: ${info.ziel.saetze}" aria-label="Sätze">${felder.join('')}</ol>`;
}

function uebungsKarte(ctx, l) {
  const { zustand, daten } = ctx;
  const u = l.uebungen[l.aktiv];
  const info = aufloesen(u, daten.kettenById, l.art);
  const kette = daten.kettenById[u.kette];
  const mitStufen = u.teil == null && kette.stufen.length > 1;
  const serie = mitStufen && l.art === 'schwer' ? erfolgsserie(zustand.training.log, kette, u.stufe) : null;
  const masseinheit = info.ziel.sek != null ? 'Sekunden' : 'Wiederholungen';
  return `
    <section class="gruppe" aria-labelledby="ueb-name">
      <div class="gruppe__inhalt uebung">
        <div class="uebung__kopf">
          <div>
            <h2 class="uebung__name" id="ueb-name">${esc(info.name)}</h2>
            <p class="uebung__ziel">Ziel ${esc(zielText(info.ziel, info.seitig))}${mitStufen ? ` · Stufe ${u.stufe + 1} von ${kette.stufen.length}` : ''}</p>
            ${serie != null ? `<p class="uebung__serie"><span class="etikett etikett--tint">Serie ${Math.min(serie, 2)} von 2</span></p>` : ''}
          </div>
          ${figurHtml(info)}
        </div>
        ${satzFelder(u, info, l.wert)}
        <div class="zaehler" role="group" aria-label="${masseinheit} in Satz ${u.saetze.length + 1}">
          <button class="zaehler__taste" type="button" data-aktion="minus" aria-label="Weniger" ${l.wert <= 0 ? 'disabled' : ''}>${sym('minus')}</button>
          <div class="zaehler__mitte">
            <output class="zaehler__wert" aria-live="polite">${l.wert}</output>
            <span class="zaehler__einheit">${masseinheit}</span>
          </div>
          <button class="zaehler__taste" type="button" data-aktion="plus" aria-label="Mehr">${sym('plus')}</button>
        </div>
        <button class="knopf knopf--gefuellt knopf--gross knopf--breit uebung__fertig" type="button" data-aktion="satz-fertig">Satz ${u.saetze.length + 1} fertig</button>
      </div>
      ${mitStufen ? `<div class="knopfreihe">
        <button class="knopf knopf--schlicht" type="button" data-aktion="stufe-runter">Stufe zu schwer</button>
        <button class="knopf knopf--schlicht" type="button" data-aktion="stufe-hoch">Stufe zu leicht</button>
      </div>` : ''}
    </section>`;
}

function zeigeLaufend(wurzel, ctx) {
  const { zustand, daten } = ctx;
  const l = zustand.training.laufend;
  const einheit = daten.plan.einheiten[l.index % daten.plan.einheiten.length];
  wach.an();
  const infos = l.uebungen.map((u) => aufloesen(u, daten.kettenById, l.art));
  const irgendwas = l.uebungen.some((u) => u.saetze.length > 0);
  const karte = l.aktiv >= 0 ? uebungsKarte(ctx, l) : `
    <div class="hinweis" role="status">
      <div class="hinweis__kopf">
        <span class="hinweis__icon">${sym('haken')}</span>
        <div><p class="hinweis__titel">Alle Übungen erledigt</p><p class="hinweis__text">Schließ die Einheit ab, damit sie gespeichert wird.</p></div>
      </div>
    </div>`;
  const liste = l.uebungen.map((u, i) => {
    const fertig = u.saetze.length >= infos[i].ziel.saetze;
    return `<li><button class="zeile" type="button" data-aktion="waehlen" data-index="${i}" ${i === l.aktiv ? 'aria-current="true"' : ''}>
      <div class="zeile__haupt"><div class="zeile__titel">${esc(infos[i].name)}</div><div class="zeile__unter">${esc(zielText(infos[i].ziel, infos[i].seitig))}</div></div>
      ${fertig ? '<span class="etikett etikett--erreicht">fertig</span>' : `<span class="zeile__wert">${u.saetze.length} / ${infos[i].ziel.saetze}</span>`}
    </button></li>`;
  }).join('');
  wurzel.innerHTML = `
    <header class="titelleiste">
      <div class="titelleiste__aktionen"></div>
      <h1 class="titelleiste__titel">${esc(einheit?.name ?? 'Training')}</h1>
      <p class="titelleiste__unter">Heute · ${esc(l.art)} · ${l.aktiv >= 0 ? `Übung ${l.aktiv + 1} von ${l.uebungen.length}` : 'alle Übungen erledigt'}</p>
    </header>
    ${karte}
    <section class="gruppe">
      <h2 class="gruppe__kopf">Übungen</h2>
      <ul class="gruppe__inhalt">${liste}</ul>
    </section>
    <section class="gruppe">
      <div class="gruppe__inhalt"><button class="zeile zeile--knopf" type="button" data-aktion="abschliessen" ${irgendwas ? '' : 'disabled'}>Einheit abschließen</button></div>
      <p class="gruppe__fuss">Überspringen rückt zur nächsten Einheit, ohne etwas zu speichern.</p>
      <div class="gruppe__inhalt gruppe__inhalt--abstand"><button class="zeile zeile--knopf zeile--gefahr" type="button" data-aktion="ueberspringen">Einheit überspringen</button></div>
    </section>`;
}

function zeigeVerlauf(wurzel, ctx) {
  const { zustand, daten } = ctx;
  const log = zustand.training.log;
  const gruppen = daten.ketten.map((kette) => {
    const aktuell = kette.stufen[stufeVon(kette, zustand.training.stufen)];
    const eintraege = log
      .flatMap((e) => e.uebungen.filter((u) => u.kette === kette.id && u.teil == null).map((u) => ({ ...u, datum: e.datum, art: e.art })))
      .reverse()
      .slice(0, 5);
    if (!eintraege.length && kette.id === 'ziehen-stange' && !zustand.einstellungen.stange) return '';
    const zeilen = eintraege.map((e) => {
      const stufe = kette.stufen[e.stufe];
      const ok = stufe?.ziel && erreicht(e.saetze, zielFuer(stufe, e.art));
      return `<li><div class="zeile">
        <div class="zeile__haupt"><div class="zeile__titel">${esc(stufe?.name ?? '–')}</div><div class="zeile__unter">${datumKurz(e.datum)} · ${esc(e.art)} · ${e.saetze.join(' · ')}</div></div>
        ${ok ? '<span class="etikett etikett--erreicht">Ziel</span>' : ''}
      </div></li>`;
    }).join('');
    const titel = aktuell.routine ? 'Feste Routine' : `Aktuell: ${aktuell.name}`;
    return `<section class="gruppe">
      <h2 class="gruppe__kopf">${esc(kette.name)}</h2>
      <ul class="gruppe__inhalt"><li><div class="zeile"><div class="zeile__haupt zeile__titel">${esc(titel)}</div></div></li>${zeilen}</ul>
    </section>`;
  }).join('');
  const leer = log.length ? '' : `
    <div class="gruppe"><div class="gruppe__inhalt leer">
      ${sym('verlauf', 'leer__icon')}
      <p class="leer__titel">Noch kein Training gespeichert</p>
      <p class="leer__text">Nach der ersten abgeschlossenen Einheit siehst du hier pro Übung deine Sätze.</p>
    </div></div>`;
  wurzel.innerHTML = `
    <header class="titelleiste">
      <div class="titelleiste__aktionen titelleiste__aktionen--links"><a class="knopf knopf--schlicht" href="#/training">${sym('zurueck')}Training</a></div>
      <h1 class="titelleiste__titel">Verlauf</h1>
      <p class="titelleiste__unter">${log.length} ${log.length === 1 ? 'Einheit' : 'Einheiten'} abgeschlossen</p>
    </header>
    ${leer}${gruppen}`;
}

function wertAendern(ctx, richtung) {
  ctx.aendern((z) => {
    const l = z.training.laufend;
    const info = aufloesen(l.uebungen[l.aktiv], ctx.daten.kettenById, l.art);
    l.wert = Math.max(0, l.wert + richtung * schrittweite(info.ziel));
  });
}

function stufeAendern(ctx, delta) {
  ctx.aendern((z) => {
    const l = z.training.laufend;
    const u = l.uebungen[l.aktiv];
    const kette = ctx.daten.kettenById[u.kette];
    z.training.stufen = stufeVerschieben(z.training.stufen, kette, delta);
    l.uebungen[l.aktiv] = { ...u, stufe: z.training.stufen[kette.id], saetze: [] };
    l.wert = zielwert(aufloesen(l.uebungen[l.aktiv], ctx.daten.kettenById, l.art).ziel);
  });
}

const AKTIONEN = {
  starten(el, ctx) {
    pause.tonVorbereiten();
    ctx.aendern((z) => {
      const einheit = naechsteEinheit(z.training, ctx.daten.plan);
      z.training.laufend = starteEinheit(z.training, einheit, ctx.daten.kettenById, z.einstellungen.stange, heute());
      z.training.vorschlaege = [];
    });
    window.scrollTo(0, 0);
  },
  ueberspringen(el, ctx) {
    if (!sicher(el, 'Nochmal tippen zum Überspringen')) return;
    pause.stoppe();
    wach.aus();
    ctx.aendern((z) => { z.training = ueberspringen(z.training, ctx.daten.plan); });
  },
  'vorschlag-ja'(el, ctx) {
    const kette = ctx.daten.kettenById[el.dataset.kette];
    ctx.aendern((z) => {
      z.training.stufen = stufeVerschieben(z.training.stufen, kette, 1);
      z.training.vorschlaege = z.training.vorschlaege.filter((v) => v.kette !== kette.id);
    });
  },
  'vorschlag-spaeter'(el, ctx) {
    ctx.aendern((z) => { z.training.vorschlaege = z.training.vorschlaege.filter((v) => v.kette !== el.dataset.kette); });
  },
  minus(el, ctx) { wertAendern(ctx, -1); },
  plus(el, ctx) { wertAendern(ctx, 1); },
  'satz-fertig'(el, ctx) {
    pause.tonVorbereiten();
    const vorher = ctx.zustand.training.laufend.aktiv;
    ctx.aendern((z) => { z.training.laufend = satzFertig(z.training.laufend, ctx.daten.kettenById); });
    const l = ctx.zustand.training.laufend;
    if (l.aktiv < 0) {
      pause.stoppe();
      return;
    }
    const u = l.uebungen[l.aktiv];
    const naechstes = l.aktiv === vorher
      ? `Satz ${u.saetze.length + 1}`
      : aufloesen(u, ctx.daten.kettenById, l.art).name;
    pause.starte(ctx.zustand.einstellungen.pauseSek[l.art] ?? 90, `Pause · dann ${naechstes}`);
  },
  waehlen(el, ctx) {
    ctx.aendern((z) => { z.training.laufend = waehle(z.training.laufend, Number(el.dataset.index), ctx.daten.kettenById); });
    window.scrollTo(0, 0);
  },
  'stufe-runter'(el, ctx) { stufeAendern(ctx, -1); },
  'stufe-hoch'(el, ctx) { stufeAendern(ctx, 1); },
  abschliessen(el, ctx) {
    pause.stoppe();
    wach.aus();
    ctx.aendern((z) => {
      z.training = abschliessen(z.training, ctx.daten.plan, eintragAusLaufend(z.training.laufend));
      z.training.vorschlaege = vorschlaegeNachAbschluss(z.training.log, z.training.stufen, ctx.daten.kettenById);
    });
    window.scrollTo(0, 0);
  },
};
```

- [ ] **Step 4: Fotos prüfen** (Server läuft)

```bash
node tools/foto.mjs "index.html#/training" fotos/training-start.png hell 812 voll
node tools/foto.mjs "index.html#/training" fotos/training-laufend.png hell 812 laufend
node tools/foto.mjs "index.html#/training" fotos/training-laufend-dunkel.png dunkel 812 laufend
node tools/foto.mjs "index.html#/training/verlauf" fotos/training-verlauf.png hell 1400 voll
```

Expected:
- `training-start.png`: Titel „Beine“, Untertitel „Heute · Einheit 2 von 6 · schwer · 25 min“, Hinweis „Stark – nächste Stufe?“ mit „Ja, steigern“, Liste Kniebeuge 3 × 20 / Einbeinige Hüftbrücke 3 × 12 / Seite / Unterarmstütz 3 × 45 s, Knopf „Training starten“.
- `training-laufend.png`: Titel „Oberkörper A“, Karte „Diamond-Liegestütz“, Satz 1 grün 12, Satz 2 blau umrandet 12, Zähler 12, „Satz 2 fertig“; entspricht im Aufbau `muster/training.html`.
- Dunkel: gleiche Anordnung, alle Texte lesbar.
- Verlauf: Gruppen pro Kette mit „Aktuell: …“ und den zwei Log-Einträgen.

- [ ] **Step 5: Ablauf von Hand** (eingebauter Browser oder Edge mit Gerätemodus 375×812, `http://127.0.0.1:8765/`)

„Training starten“ → Plus/Minus ändern den Zähler → „Satz 1 fertig“: Satz wird grün, Pausen-Leiste erscheint mit 1:30 und läuft leer, „+15 s“ verlängert, „Weiter“ schließt → nach 3 Sätzen springt die Karte zur nächsten Übung → Seite neu laden: Einheit läuft mit allen Sätzen weiter → „Einheit abschließen“ → Startseite zeigt die nächste Einheit. „Einheit überspringen“ verlangt einen zweiten Tipp.

- [ ] **Step 6: Commit**

```bash
git add js/ansichten/pause.js js/ansichten/wachhalten.js js/ansichten/training.js
git commit -m "feat: Trainings-Ansicht mit Sätzen, Pausen-Timer, Progression und Verlauf"
```

---

### Task 16: Übungsfigur in der Karte und „So geht's“-Blatt

**Files:**
- Create: `js/ansichten/figur-ansicht.js`
- Modify: `js/ansichten/training.js` (Platzhalter `figurHtml` ersetzen, Aktion ergänzen)
- Modify: `css/komponenten.css` (Figur-Stile am Ende)

**Interfaces:**
- Consumes: `poseZuSvg` (Task 9), `aufloesen` (Task 13), `blatt.oeffne` (Task 14).
- Produces: `figurMini(info): string` (leerer Text, wenn `info.figur` fehlt), `soGehtsOeffnen(info)`.

- [ ] **Step 1: Figur-Ansicht** – `js/ansichten/figur-ansicht.js`

```js
// Kleine Übungsfigur (Start/Ende im Wechsel) und das "So geht's"-Blatt.
import { poseZuSvg } from '../logik/figur.js';
import { esc } from './html.js';
import * as blatt from './blatt.js';

const bild = (pose, geraet, klasse = '') =>
  `<svg${klasse ? ` class="${klasse}"` : ''} viewBox="0 0 120 84" aria-hidden="true">${poseZuSvg(pose, geraet)}</svg>`;

export function figurMini(info) {
  if (!info.figur) return '';
  const { start, ende, geraet } = info.figur;
  return `<button class="figur-mini" type="button" data-aktion="so-gehts" aria-label="So geht's: ${esc(info.name)}">
    ${bild(start, geraet, 'figur-mini__start')}${bild(ende, geraet, 'figur-mini__ende')}
  </button>`;
}

export function soGehtsOeffnen(info) {
  const posen = info.figur
    ? `<div class="posen">
        <figure class="posen__bild">${bild(info.figur.start, info.figur.geraet)}<figcaption>Start</figcaption></figure>
        <figure class="posen__bild">${bild(info.figur.ende, info.figur.geraet)}<figcaption>Ende</figcaption></figure>
      </div>`
    : '';
  const hinweise = info.hinweise.length
    ? `<ul class="hinweise">${info.hinweise.map((h) => `<li>${esc(h)}</li>`).join('')}</ul>`
    : '';
  const achtung = info.achtung ? `<p class="achtung"><strong>Achte darauf:</strong> ${esc(info.achtung)}</p>` : '';
  blatt.oeffne(posen + hinweise + achtung, { titel: `So geht's: ${info.name}` });
}
```

- [ ] **Step 2: In die Trainings-Ansicht einbauen** – `js/ansichten/training.js`

Ersetzen:

```js
// Wird in Task 16 durch die Übungsfigur ersetzt.
const figurHtml = () => '';
```

durch:

```js
import { figurMini, soGehtsOeffnen } from './figur-ansicht.js';

const figurHtml = figurMini;
```

(Den `import` zu den anderen Imports oben verschieben.) In `AKTIONEN` nach `minus`/`plus` ergänzen:

```js
  'so-gehts'(el, ctx) {
    const l = ctx.zustand.training.laufend;
    soGehtsOeffnen(aufloesen(l.uebungen[l.aktiv], ctx.daten.kettenById, l.art));
  },
```

- [ ] **Step 3: Figur-Stile** – ans Ende von `css/komponenten.css`:

```css
/* ---------- Übungsfigur (Task 16) ---------- */

.figur-mini {
  position: relative;
  flex: none;
  width: 72px;
  height: 72px;
  margin: -4px -4px 0 0;
  padding: 0;
  border: 0;
  border-radius: var(--r-feld);
  background: var(--zelle-2);
  color: var(--text);
}
.figur-mini svg { position: absolute; inset: 4px; width: 64px; height: 64px; }
.figur-mini:active { background: var(--zelle-gedrueckt); }
/* Start und Ende überblenden im Wechsel, je 1,5 s */
.figur-mini__ende { animation: figur-wechsel 3s infinite; }
.figur-mini__start { animation: figur-wechsel 3s infinite reverse; }
@keyframes figur-wechsel {
  0%, 40% { opacity: 0; }
  50%, 90% { opacity: 1; }
  100% { opacity: 0; }
}
@media (prefers-reduced-motion: reduce) {
  .figur-mini__start { display: none; }
  .figur-mini__ende { animation: none; opacity: 1; }
}

.posen { display: grid; grid-template-columns: 1fr 1fr; gap: var(--a-2); }
.posen__bild { margin: 0; padding: var(--a-2); border-radius: var(--r-feld); background: var(--zelle); color: var(--text); }
.posen__bild svg { display: block; width: 100%; height: auto; }
.posen__bild figcaption { text-align: center; font: var(--t-fuss); color: var(--text-2); }
.hinweise { display: grid; gap: var(--a-2); margin-top: var(--a-4); font: var(--t-text); }
.hinweise li { display: flex; gap: var(--a-3); }
.hinweise li::before { content: ""; flex: none; width: 6px; height: 6px; margin-top: 9px; border-radius: 50%; background: var(--tint); }
.achtung { margin-top: var(--a-4); padding: var(--a-3) var(--a-4); border-radius: var(--r-feld); background: var(--zelle); font: var(--t-unter); }
.achtung strong { font-weight: 600; }
```

- [ ] **Step 4: Fotos und Ablauf prüfen**

Run: `node tools/foto.mjs "index.html#/training" fotos/figur-karte.png hell 812 laufend`
Expected: 72-px-Figur oben rechts in der Karte „Diamond-Liegestütz“ (Liegestütz-Figur, je nach Zeitpunkt Start oder Ende).

Von Hand: Figur antippen → Blatt fährt von unten hoch, zeigt Start und Ende nebeneinander, drei Hinweise und „Achte darauf: Hüfte nicht durchhängen lassen …“; „Fertig“, Tipp auf den dunklen Bereich, Escape und Wischen nach unten schließen es. In den Systemeinstellungen „Bewegung reduzieren“ (oder DevTools → Rendering → prefers-reduced-motion) steht nur die Endposition.

- [ ] **Step 5: Commit**

```bash
git add js/ansichten/figur-ansicht.js js/ansichten/training.js css/komponenten.css
git commit -m "feat: Übungsfigur in der Karte und So-geht's-Blatt"
```

---

### Task 17: Wochenplan-Logik

**Files:**
- Create: `js/logik/wochenplan.js`
- Test: `tests/wochenplan.test.js`

**Interfaces:**
- Consumes: Wochenplan-Form (Task 2), Rezept-Form (Task 10).
- Produces (alle liefern einen neuen Plan, das Original bleibt unverändert):
  - `hinzufuegen(plan, rezept)` – Abend: neu mit `portionen = rezept.portionen`, schon vorhanden → Plan unverändert (`===`); Jause/Extra: neu mit `anzahl 1`, vorhanden → `anzahl + 1`; Snack: ersetzt den Snack, behält die Anzahl (Standard 7)
  - `entfernen(plan, typ, index)` (Snack → `null`)
  - `austauschen(plan, typ, index, rezeptId)` (Menge bleibt)
  - `anzahlAendern(plan, typ, index, delta)` (min. 1; Snack max. 7; ohne Snack unverändert)

- [ ] **Step 1: Failing test schreiben** – `tests/wochenplan.test.js`

```js
import { describe, it, expect } from 'vitest';
import { hinzufuegen, entfernen, austauschen, anzahlAendern } from '../js/logik/wochenplan.js';

const plan = {
  kw: '2026-W42',
  abend: [{ rezept: 'a', portionen: 4 }],
  jause: [{ rezept: 'j', anzahl: 2 }],
  snack: { rezept: 's', anzahl: 7 },
  extra: [],
};
const rezept = (id, typ, portionen = 1) => ({ id, typ, portionen });

describe('wochenplan', () => {
  it('Abendessen hinzufügen mit Rezept-Portionen, doppelt nicht', () => {
    expect(hinzufuegen(plan, rezept('b', 'abend', 4)).abend).toEqual([{ rezept: 'a', portionen: 4 }, { rezept: 'b', portionen: 4 }]);
    expect(hinzufuegen(plan, rezept('a', 'abend', 4))).toBe(plan);
  });
  it('Jause und Extra: neu mit 1, vorhanden +1', () => {
    expect(hinzufuegen(plan, rezept('j', 'jause')).jause).toEqual([{ rezept: 'j', anzahl: 3 }]);
    expect(hinzufuegen(plan, rezept('k', 'jause')).jause).toEqual([{ rezept: 'j', anzahl: 2 }, { rezept: 'k', anzahl: 1 }]);
    expect(hinzufuegen(plan, rezept('e', 'extra')).extra).toEqual([{ rezept: 'e', anzahl: 1 }]);
  });
  it('Snack ersetzen, Anzahl bleibt oder ist 7', () => {
    expect(hinzufuegen(plan, rezept('t', 'snack')).snack).toEqual({ rezept: 't', anzahl: 7 });
    expect(hinzufuegen({ ...plan, snack: null }, rezept('t', 'snack')).snack).toEqual({ rezept: 't', anzahl: 7 });
  });
  it('entfernen', () => {
    expect(entfernen(plan, 'abend', 0).abend).toEqual([]);
    expect(entfernen(plan, 'snack', 0).snack).toBeNull();
  });
  it('austauschen behält die Menge', () => {
    expect(austauschen(plan, 'jause', 0, 'k').jause).toEqual([{ rezept: 'k', anzahl: 2 }]);
    expect(austauschen(plan, 'snack', 0, 't').snack).toEqual({ rezept: 't', anzahl: 7 });
  });
  it('Anzahl ändern mit Grenzen', () => {
    expect(anzahlAendern(plan, 'abend', 0, -1).abend[0].portionen).toBe(3);
    expect(anzahlAendern(plan, 'jause', 0, -5).jause[0].anzahl).toBe(1);
    expect(anzahlAendern(plan, 'snack', 0, 1).snack.anzahl).toBe(7);
    expect(anzahlAendern(plan, 'snack', 0, -1).snack.anzahl).toBe(6);
    const ohneSnack = { ...plan, snack: null };
    expect(anzahlAendern(ohneSnack, 'snack', 0, 1)).toBe(ohneSnack);
  });
  it('Original bleibt unverändert', () => {
    const kopie = JSON.parse(JSON.stringify(plan));
    hinzufuegen(plan, rezept('k', 'jause'));
    anzahlAendern(plan, 'abend', 0, 2);
    austauschen(plan, 'abend', 0, 'z');
    entfernen(plan, 'jause', 0);
    expect(plan).toEqual(kopie);
  });
});
```

- [ ] **Step 2: Test laufen lassen**

Run: `npx vitest run tests/wochenplan.test.js`
Expected: FAIL (Modul fehlt).

- [ ] **Step 3: Implementierung** – `js/logik/wochenplan.js`

```js
// Wochenplan bearbeiten: Gerichte hinzufügen, entfernen, austauschen, Menge ändern.

const FELD = { abend: 'portionen', jause: 'anzahl', extra: 'anzahl' };

export function anzahlAendern(plan, typ, index, delta) {
  if (typ === 'snack') {
    if (!plan.snack) return plan;
    return { ...plan, snack: { ...plan.snack, anzahl: Math.max(1, Math.min(7, plan.snack.anzahl + delta)) } };
  }
  const feld = FELD[typ];
  return { ...plan, [typ]: plan[typ].map((e, i) => (i === index ? { ...e, [feld]: Math.max(1, e[feld] + delta) } : e)) };
}

export function hinzufuegen(plan, rezept) {
  if (rezept.typ === 'snack') return { ...plan, snack: { rezept: rezept.id, anzahl: plan.snack?.anzahl ?? 7 } };
  const liste = plan[rezept.typ];
  const vorhanden = liste.findIndex((e) => e.rezept === rezept.id);
  if (vorhanden >= 0) return rezept.typ === 'abend' ? plan : anzahlAendern(plan, rezept.typ, vorhanden, 1);
  const neu = { rezept: rezept.id, [FELD[rezept.typ]]: rezept.typ === 'abend' ? rezept.portionen : 1 };
  return { ...plan, [rezept.typ]: [...liste, neu] };
}

export function entfernen(plan, typ, index) {
  if (typ === 'snack') return { ...plan, snack: null };
  return { ...plan, [typ]: plan[typ].filter((_, i) => i !== index) };
}

export function austauschen(plan, typ, index, rezeptId) {
  if (typ === 'snack') return { ...plan, snack: { anzahl: 7, ...plan.snack, rezept: rezeptId } };
  return { ...plan, [typ]: plan[typ].map((e, i) => (i === index ? { ...e, rezept: rezeptId } : e)) };
}
```

- [ ] **Step 4: Test laufen lassen**

Run: `npx vitest run tests/wochenplan.test.js`
Expected: PASS (7 Tests).

- [ ] **Step 5: Commit**

```bash
git add js/logik/wochenplan.js tests/wochenplan.test.js
git commit -m "feat: Wochenplan bearbeiten"
```

---

### Task 18: Essen-Ansicht (Woche, Bibliothek, Rezept)

**Files:**
- Replace: `js/ansichten/essen.js`

**Interfaces:**
- Consumes: `typischerTag` (Task 7), `teileRezepte` (Task 5), Wochenplan-Funktionen (Task 17), `isoWoche`, `heute` (Task 1), `html.js` (Task 14), `ctx`.
- Routen: `#/essen` (Woche), `#/essen/bibliothek?typ=abend|jause|snack|extra[&alle=1]`, `#/essen/bibliothek?tausch=<typ>:<index>` (Auswahl zum Austauschen), `#/essen/rezept/<id>[?tausch=<typ>:<index>]`.

- [ ] **Step 1: Implementierung** – `js/ansichten/essen.js` (ersetzt die vorläufige Datei)

```js
// Essen: Wochenplan mit typischem Tag, Bibliothek mit Abneigungs-Filter, Rezept-Detail.
import { esc, sym, zahl, mengeText, sicher } from './html.js';
import { typischerTag } from '../logik/naehrwerte.js';
import { teileRezepte } from '../logik/filter.js';
import { hinzufuegen, entfernen, austauschen, anzahlAendern } from '../logik/wochenplan.js';
import { isoWoche, heute } from '../logik/datum.js';

const TYPEN = { abend: 'Abend', jause: 'Jause', snack: 'Snack', extra: 'Extra' };
const HERKUNFT = { mitnehmen: 'mitnehmen', spar: 'beim Spar kaufen', reste: 'Reste vom Abend' };
const HINZU = { abend: 'Gericht hinzufügen', jause: 'Jause hinzufügen', extra: 'Extra hinzufügen' };

export function zeige(wurzel, ctx, route) {
  wurzel.onclick = (e) => {
    const el = e.target.closest('[data-aktion]');
    if (el && !el.disabled) AKTIONEN[el.dataset.aktion]?.(el, ctx);
  };
  if (route.teile[0] === 'bibliothek') return zeigeBibliothek(wurzel, ctx, route.parameter);
  if (route.teile[0] === 'rezept') return zeigeRezept(wurzel, ctx, route.teile[1], route.parameter);
  return zeigeWoche(wurzel, ctx);
}

function metaText(r) {
  const nw = r.pro_portion
    ? `${r.geschaetzt ? 'ca. ' : ''}${zahl(r.pro_portion.kcal)} kcal · ${zahl(r.pro_portion.protein_g)} g Protein`
    : 'Nährwerte wie das Abendessen';
  if (r.typ === 'abend') return `${r.zeit_min} min · ${nw}`;
  if (r.typ === 'jause') {
    const kuehl = r.herkunft === 'mitnehmen' && r.ohne_kuehlung === false ? 'im Sommer Kühlakku' : '';
    return [HERKUNFT[r.herkunft], nw, kuehl].filter(Boolean).join(' · ');
  }
  return nw;
}

function kopf(titel, unter, zurueck = null) {
  return `<header class="titelleiste">
    <div class="titelleiste__aktionen${zurueck ? ' titelleiste__aktionen--links' : ''}">
      ${zurueck ? `<a class="knopf knopf--schlicht" href="${zurueck.href}">${sym('zurueck')}${esc(zurueck.text)}</a>` : ''}
    </div>
    <h1 class="titelleiste__titel${titel.length > 22 ? ' titelleiste__titel--lang' : ''}">${esc(titel)}</h1>
    <p class="titelleiste__unter">${esc(unter)}</p>
  </header>`;
}

function umschalter(aktiv) {
  return `<nav class="segment-rahmen" aria-label="Essen"><div class="segment">
    <a href="#/essen" ${aktiv === 'woche' ? 'aria-current="page"' : ''}>Woche</a>
    <a href="#/essen/bibliothek" ${aktiv === 'bibliothek' ? 'aria-current="page"' : ''}>Bibliothek</a>
  </div></nav>`;
}

function balken(name, wert, ziel, einheit) {
  const anteil = ziel > 0 ? wert / ziel : 0;
  return `<div class="naehrwert${anteil >= 1 ? ' naehrwert--erreicht' : ''}" style="--anteil: ${anteil.toFixed(3)}">
    <div class="naehrwert__kopf"><span class="naehrwert__name">${name}</span><span class="naehrwert__zahl"><b>${zahl(wert)}</b> von ${zahl(ziel)} ${einheit}</span></div>
    <div class="naehrwert__bahn" role="img" aria-label="${name}: ${zahl(wert)} von ${zahl(ziel)} ${einheit}"><div class="naehrwert__balken"></div><div class="naehrwert__ziel"></div></div>
  </div>`;
}

function planZeile(ctx, typ, eintrag, index) {
  const r = ctx.daten.rezepteById[eintrag.rezept];
  const feld = typ === 'abend' ? 'portionen' : 'anzahl';
  const wert = eintrag[feld];
  const max = typ === 'snack' ? 7 : 99;
  const name = r ? r.name : 'Unbekanntes Rezept';
  const unter = r ? metaText(r) : `„${eintrag.rezept}“ ist nicht mehr in der Bibliothek`;
  return `<li><div class="zeile">
    <a class="zeile__haupt zeile__link" href="#/essen/rezept/${encodeURIComponent(eintrag.rezept)}?tausch=${typ}%3A${index}">
      <span class="zeile__titel">${esc(name)}</span><span class="zeile__unter">${esc(unter)}</span>
    </a>
    <div class="mini-zaehler" role="group" aria-label="${feld === 'portionen' ? 'Portionen' : 'Anzahl'}: ${esc(name)}">
      <button type="button" data-aktion="weniger" data-typ="${typ}" data-index="${index}" aria-label="Weniger" ${wert <= 1 ? 'disabled' : ''}>${sym('minus')}</button>
      <output>${wert}</output>
      <button type="button" data-aktion="mehr" data-typ="${typ}" data-index="${index}" aria-label="Mehr" ${wert >= max ? 'disabled' : ''}>${sym('plus')}</button>
    </div>
  </div></li>`;
}

function zeigeWoche(wurzel, ctx) {
  const { zustand, daten } = ctx;
  const plan = zustand.essen.wochenplan;
  const ziele = zustand.einstellungen.ziele;
  const tag = typischerTag(plan, daten.rezepteById);
  const kw = plan.kw ?? isoWoche(heute());
  const liste = (typ, titel) => `
    <section class="gruppe">
      <h2 class="gruppe__kopf">${titel}</h2>
      <ul class="gruppe__inhalt">
        ${plan[typ].map((e, i) => planZeile(ctx, typ, e, i)).join('')}
        <li><a class="zeile zeile--knopf" href="#/essen/bibliothek?typ=${typ}">${sym('plus', 'symbol--klein')}${HINZU[typ]}</a></li>
      </ul>
    </section>`;
  const snack = `
    <section class="gruppe">
      <h2 class="gruppe__kopf">Snack täglich</h2>
      <ul class="gruppe__inhalt">${plan.snack
        ? planZeile(ctx, 'snack', plan.snack, 0)
        : `<li><a class="zeile zeile--knopf" href="#/essen/bibliothek?typ=snack">${sym('plus', 'symbol--klein')}Snack wählen</a></li>`}</ul>
    </section>`;
  wurzel.innerHTML = `
    ${kopf('Essen', `Wochenplan · KW ${kw.split('-W')[1]}`)}
    ${umschalter('woche')}
    <section class="gruppe">
      <h2 class="gruppe__kopf gruppe__kopf--gross">Typischer Tag</h2>
      <div class="gruppe__inhalt">${balken('Kalorien', tag.summe.kcal, ziele.kcal, 'kcal')}${balken('Protein', tag.summe.protein, ziele.protein, 'g')}</div>
      <p class="gruppe__fuss">Abend ${zahl(tag.abend.kcal)} · Jause ${zahl(tag.jause.kcal)} · Snack ${zahl(tag.snack.kcal)} · Extra ${zahl(tag.extra.kcal)} kcal. Der Strich markiert dein Ziel.</p>
    </section>
    ${liste('abend', 'Abendessen')}
    ${liste('jause', 'Jause an Arbeitstagen')}
    ${snack}
    ${liste('extra', 'Kalorien-Extra')}`;
}

function zeigeBibliothek(wurzel, ctx, parameter) {
  const { zustand, daten } = ctx;
  const tausch = parameter.tausch ?? '';
  const typ = tausch ? tausch.split(':')[0] : (TYPEN[parameter.typ] ? parameter.typ : 'abend');
  const alle = parameter.alle === '1';
  const { sichtbar, ausgeblendet } = teileRezepte(daten.rezepte.filter((r) => r.typ === typ), zustand.einstellungen.abneigungen, daten.zutaten);
  const adresse = (extra) => `#/essen/bibliothek?${new URLSearchParams({ typ, ...(tausch ? { tausch } : {}), ...extra })}`;
  const zeile = (r, versteckt) => `<li><a class="zeile" href="#/essen/rezept/${encodeURIComponent(r.id)}${tausch ? `?tausch=${encodeURIComponent(tausch)}` : ''}">
      <div class="zeile__haupt"><div class="zeile__titel">${esc(r.name)}</div><div class="zeile__unter">${esc(metaText(r))}</div></div>
      ${versteckt ? '<span class="etikett">ausgeblendet</span>' : ''}${sym('chevron', 'zeile__chevron')}
    </a></li>`;
  const typen = Object.entries(TYPEN)
    .map(([t, name]) => `<a href="#/essen/bibliothek?typ=${t}" ${t === typ ? 'aria-current="page"' : ''}>${name}</a>`)
    .join('');
  const leer = !sichtbar.length && !alle
    ? '<li><div class="leer"><p class="leer__titel">Keine passenden Rezepte</p><p class="leer__text">Alle Rezepte dieser Art sind wegen deiner Abneigungen ausgeblendet.</p></div></li>'
    : '';
  wurzel.innerHTML = `
    ${tausch ? kopf('Austauschen', 'Wähle ein anderes Gericht', { href: '#/essen', text: 'Woche' }) : kopf('Bibliothek', `${daten.rezepte.length} Rezepte`)}
    ${tausch ? '' : umschalter('bibliothek')}
    ${tausch ? '' : `<nav class="segment-rahmen" aria-label="Art"><div class="segment">${typen}</div></nav>`}
    <section class="gruppe">
      <ul class="gruppe__inhalt">
        ${sichtbar.map((r) => zeile(r, false)).join('')}
        ${alle ? ausgeblendet.map((r) => zeile(r, true)).join('') : ''}
        ${leer}
      </ul>
      ${ausgeblendet.length ? `<p class="gruppe__fuss"><a class="knopf knopf--schlicht" href="${adresse(alle ? {} : { alle: '1' })}">${alle ? 'Ausgeblendete verbergen' : `Ausgeblendete zeigen (${ausgeblendet.length})`}</a></p>` : ''}
    </section>`;
}

function zeigeRezept(wurzel, ctx, id, parameter) {
  const { zustand, daten } = ctx;
  const plan = zustand.essen.wochenplan;
  const tausch = parameter.tausch ?? '';
  const [typ, index] = tausch.split(':');
  const slot = !tausch ? null : typ === 'snack' ? plan.snack : plan[typ]?.[Number(index)] ?? null;
  const r = daten.rezepteById[id];
  const austauschenLink = `<a class="knopf knopf--getoent knopf--breit" href="#/essen/bibliothek?tausch=${encodeURIComponent(tausch)}">Austauschen</a>`;
  const entfernenKnopf = `<button class="knopf knopf--gefahr knopf--breit" type="button" data-aktion="entfernen" data-tausch="${esc(tausch)}">Aus dem Plan entfernen</button>`;

  if (!r) {
    wurzel.innerHTML = `
      ${kopf('Rezept fehlt', id ?? '', { href: '#/essen', text: 'Woche' })}
      <div class="gruppe"><div class="gruppe__inhalt leer">
        <p class="leer__titel">Nicht mehr in der Bibliothek</p>
        <p class="leer__text">Dieses Rezept wurde aus der Bibliothek entfernt. Tausch es aus oder nimm es aus dem Plan.</p>
      </div></div>
      ${slot ? `<div class="gruppe aktionen">${austauschenLink}${entfernenKnopf}</div>` : ''}`;
    return;
  }

  const imPlan = slot?.rezept === r.id;
  let aktionen;
  if (imPlan) {
    aktionen = austauschenLink + entfernenKnopf;
  } else if (slot) {
    aktionen = `<button class="knopf knopf--gefuellt knopf--gross knopf--breit" type="button" data-aktion="tauschen" data-tausch="${esc(tausch)}" data-rezept="${esc(r.id)}">Stattdessen nehmen</button>`;
  } else {
    const schonDa = r.typ === 'abend' && plan.abend.some((e) => e.rezept === r.id);
    aktionen = `<button class="knopf knopf--gefuellt knopf--gross knopf--breit" type="button" data-aktion="in-plan" data-rezept="${esc(r.id)}" ${schonDa ? 'disabled' : ''}>${schonDa ? 'Schon im Plan' : 'In den Plan'}</button>`;
  }
  const zurueck = imPlan ? { href: '#/essen', text: 'Woche' }
    : slot ? { href: `#/essen/bibliothek?tausch=${encodeURIComponent(tausch)}`, text: 'Auswahl' }
      : { href: `#/essen/bibliothek?typ=${r.typ}`, text: 'Bibliothek' };

  const nw = r.pro_portion;
  const naehrwerte = nw ? `
    <section class="gruppe">
      <h2 class="gruppe__kopf">Pro Portion${r.geschaetzt ? ' (geschätzt)' : ''}</h2>
      <ul class="gruppe__inhalt">${[['Kalorien', nw.kcal, 'kcal'], ['Protein', nw.protein_g, 'g'], ['Fett', nw.fett_g, 'g'], ['Kohlenhydrate', nw.kh_g, 'g']]
        .filter(([, wert]) => wert != null)
        .map(([name, wert, einheit]) => `<li><div class="zeile"><span class="zeile__haupt zeile__titel">${name}</span><span class="zeile__wert">${zahl(wert)} ${einheit}</span></div></li>`)
        .join('')}</ul>
    </section>` : '';
  const beschreibung = r.beschreibung
    ? `<section class="gruppe"><div class="gruppe__inhalt uebung"><p>${esc(r.beschreibung)}</p></div></section>`
    : '';
  const zutaten = r.zutaten?.length ? `
    <section class="gruppe">
      <h2 class="gruppe__kopf">Zutaten für ${r.portionen} ${r.portionen === 1 ? 'Portion' : 'Portionen'}</h2>
      <ul class="gruppe__inhalt">${r.zutaten.map((z) => `<li><div class="zeile">
        <span class="zeile__haupt zeile__titel">${esc(daten.zutaten[z.zutat]?.name ?? z.zutat)}</span>
        <span class="zeile__wert">${esc(mengeText(z.menge, z.einheit))}</span>
      </div></li>`).join('')}</ul>
    </section>` : '';
  const schritte = r.schritte?.length ? `
    <section class="gruppe">
      <h2 class="gruppe__kopf">Zubereitung</h2>
      <ol class="gruppe__inhalt schritte">${r.schritte.map((s) => `<li>${esc(s)}</li>`).join('')}</ol>
    </section>` : '';

  wurzel.innerHTML = `
    ${kopf(r.name, metaText(r), zurueck)}
    <div class="gruppe aktionen">${aktionen}</div>
    ${naehrwerte}${beschreibung}${zutaten}${schritte}`;
}

function planAendern(ctx, fn) {
  ctx.aendern((z) => {
    z.essen.wochenplan = fn(z.essen.wochenplan);
    if (!z.essen.wochenplan.kw) z.essen.wochenplan.kw = isoWoche(heute());
  });
}

const AKTIONEN = {
  weniger(el, ctx) { planAendern(ctx, (p) => anzahlAendern(p, el.dataset.typ, Number(el.dataset.index), -1)); },
  mehr(el, ctx) { planAendern(ctx, (p) => anzahlAendern(p, el.dataset.typ, Number(el.dataset.index), 1)); },
  'in-plan'(el, ctx) {
    planAendern(ctx, (p) => hinzufuegen(p, ctx.daten.rezepteById[el.dataset.rezept]));
    ctx.navigiere('#/essen');
  },
  tauschen(el, ctx) {
    const [typ, index] = el.dataset.tausch.split(':');
    planAendern(ctx, (p) => austauschen(p, typ, Number(index), el.dataset.rezept));
    ctx.navigiere('#/essen');
  },
  entfernen(el, ctx) {
    if (!sicher(el, 'Nochmal tippen zum Entfernen')) return;
    const [typ, index] = el.dataset.tausch.split(':');
    planAendern(ctx, (p) => entfernen(p, typ, Number(index)));
    ctx.navigiere('#/essen');
  },
};
```

- [ ] **Step 2: Fotos prüfen** (Server läuft)

```bash
node tools/foto.mjs "index.html#/essen" fotos/essen-woche.png hell 1700 voll
node tools/foto.mjs "index.html#/essen" fotos/essen-woche-dunkel.png dunkel 1700 voll
node tools/foto.mjs "index.html#/essen/bibliothek?typ=jause" fotos/essen-bibliothek.png hell 1100 voll
node tools/foto.mjs "index.html#/essen/rezept/chili-con-carne" fotos/essen-rezept.png hell 1500 voll
node tools/foto.mjs "index.html#/essen" fotos/essen-leer.png hell 1100
```

Expected:
- Woche: „Typischer Tag“ mit Kalorien 2.996 von 2.950 kcal (grüner Balken über dem Strich) und Protein ≈ 166 von 130 g; Gruppen Abendessen (2), Jause (2), Snack (Skyr-Bowl, 7), Kalorien-Extra (2), jeweils mit −/+ und „… hinzufügen“.
- Bibliothek (Jause): 8 Jausen, „Leberkässemmel“ mit „beim Spar kaufen · ca. 610 kcal …“.
- Rezept: großer Titel, „In den Plan“ ist „Schon im Plan“ (ausgegraut), Pro Portion, Zutaten mit Mengen, nummerierte Schritte.
- Leer (ohne Zustand): Typischer Tag mit Snack-Werten (605 kcal), leere Gruppen mit „Gericht hinzufügen“.

- [ ] **Step 3: Ablauf von Hand**

Woche → „Gericht hinzufügen“ → Bibliothek Abend → „Gyros-Pfanne“ → „In den Plan“ → zurück in der Woche, Gericht steht drin, Balken ändern sich → auf das Gericht tippen → „Austauschen“ → anderes Gericht → „Stattdessen nehmen“ → Portionen −/+ → „Aus dem Plan entfernen“ (zwei Tipps). In Mehr „Pute“ als Abneigung eintragen (ab Task 20) → Bibliothek zeigt „Ausgeblendete zeigen (1)“.

- [ ] **Step 4: Commit**

```bash
git add js/ansichten/essen.js
git commit -m "feat: Essen-Ansicht mit Wochenplan, Bibliothek und Rezept-Detail"
```

---

### Task 19: Einkauf-Ansicht

**Files:**
- Replace: `js/ansichten/einkauf.js`

**Interfaces:**
- Consumes: Einkaufslisten-Funktionen (Task 6), `isoWoche`, `heute`, `blatt` (Task 14), `html.js`, `ctx`.
- Routen: `#/einkauf` (nach Markt), `#/einkauf?ansicht=rezept`.

- [ ] **Step 1: Implementierung** – `js/ansichten/einkauf.js` (ersetzt die vorläufige Datei)

```js
// Einkauf: Liste nach Markt (abhaken, langes Drücken für Markt/Vorrat) oder nach Rezept.
import { esc, sym, zahl, mengeText, datumKurz, sicher } from './html.js';
import {
  MAERKTE, bedarf, einkaufsliste, nachRezept, abhakenUmschalten, aufgebrauchtUmschalten, neueWoche, marktFuer,
} from '../logik/einkaufsliste.js';
import { isoWoche, heute } from '../logik/datum.js';
import * as blatt from './blatt.js';

const MARKT_FARBE = { Lidl: 'var(--markt-lidl)', Hofer: 'var(--markt-hofer)', Spar: 'var(--markt-spar)', egal: 'var(--markt-egal)' };
const marktName = (m) => (m === 'egal' ? 'Egal wo' : m);
let druckZeit = null;
let klickSperren = false;

export function zeige(wurzel, ctx, route) {
  wurzel.onclick = (e) => {
    if (klickSperren) {
      // Nach langem Drücken nicht zusätzlich abhaken.
      e.preventDefault();
      klickSperren = false;
      return;
    }
    const el = e.target.closest('[data-aktion]');
    if (el && !el.disabled) AKTIONEN[el.dataset.aktion]?.(el, ctx);
  };
  wurzel.onchange = (e) => {
    const el = e.target;
    if (el.dataset.schluessel) ctx.aendern((z) => { z.essen = abhakenUmschalten(z.essen, el.dataset.schluessel); });
    if (el.dataset.einstellung === 'grundvorrat') ctx.aendern((z) => { z.einstellungen.grundvorratAusblenden = el.checked; });
  };
  wurzel.onpointerdown = (e) => {
    klickSperren = false;
    const zeile = e.target.closest('[data-zutat]');
    if (!zeile) return;
    clearTimeout(druckZeit);
    druckZeit = setTimeout(() => {
      klickSperren = true;
      marktBlatt(ctx, zeile.dataset.zutat);
    }, 500);
  };
  wurzel.onpointerup = wurzel.onpointercancel = () => clearTimeout(druckZeit);

  const { zustand, daten } = ctx;
  const plan = zustand.essen.wochenplan;
  const nachRezeptAnsicht = route.parameter.ansicht === 'rezept';
  const b = bedarf(plan, daten.rezepteById);
  const liste = einkaufsliste(b, daten.zutaten, zustand.einstellungen, zustand.essen.aufgebraucht, daten.aktionen, heute());
  const alleZeilen = liste.flatMap((m) => m.kategorien.flatMap((k) => k.zeilen));
  const offen = alleZeilen.filter((z) => !zustand.essen.abgehakt[z.schluessel]).length;
  const kw = plan.kw ?? isoWoche(heute());

  const kopf = `
    <header class="titelleiste">
      <div class="titelleiste__aktionen"></div>
      <h1 class="titelleiste__titel">Einkauf</h1>
      <p class="titelleiste__unter">KW ${kw.split('-W')[1]} · ${offen} offen</p>
    </header>
    <nav class="segment-rahmen" aria-label="Ansicht"><div class="segment">
      <a href="#/einkauf" ${nachRezeptAnsicht ? '' : 'aria-current="page"'}>Nach Markt</a>
      <a href="#/einkauf?ansicht=rezept" ${nachRezeptAnsicht ? 'aria-current="page"' : ''}>Nach Rezept</a>
    </div></nav>`;

  if (!b.length && !zustand.essen.aufgebraucht.length) {
    wurzel.innerHTML = `${kopf}
      <div class="gruppe"><div class="gruppe__inhalt leer">
        ${sym('einkauf', 'leer__icon')}
        <p class="leer__titel">Noch nichts geplant</p>
        <p class="leer__text">Wähl im Wochenplan deine Gerichte, dann steht hier die Einkaufsliste.</p>
        <a class="knopf knopf--getoent" href="#/essen">Zum Wochenplan</a>
      </div></div>`;
    return;
  }

  if (nachRezeptAnsicht) {
    wurzel.innerHTML = kopf + nachRezept(plan, daten.rezepteById, daten.zutaten).map((r) => `
      <section class="gruppe">
        <h2 class="gruppe__kopf">${esc(r.name)} · ${r.menge} ${r.menge === 1 ? 'Portion' : 'Portionen'}</h2>
        <ul class="gruppe__inhalt">${r.zeilen.map((z) => `<li><div class="zeile">
          <span class="zeile__haupt zeile__titel">${esc(z.name)}</span><span class="zeile__wert">${esc(mengeText(z.menge, z.einheit))}</span>
        </div></li>`).join('')}</ul>
      </section>`).join('');
    return;
  }

  const zeileHtml = (z) => {
    const an = !!zustand.essen.abgehakt[z.schluessel];
    const etiketten = [
      z.aktion ? `<span class="etikett etikett--gefahr">Aktion ${zahl(z.aktion.preis, 2)} € · bis ${datumKurz(z.aktion.gueltig_bis)}</span>` : '',
      z.aufgebraucht ? '<span class="etikett etikett--tint">Aufgebraucht</span>' : z.grundvorrat ? '<span class="etikett">Vorrat</span>' : '',
    ].join('');
    return `<li><label class="abhaken" data-zutat="${esc(z.zutat)}">
      <input type="checkbox" data-schluessel="${esc(z.schluessel)}" ${an ? 'checked' : ''}>
      <span class="abhaken__kreis">${sym('haken')}</span>
      <span class="abhaken__haupt">
        <span class="abhaken__name">${esc(z.name)}</span>
        <span class="abhaken__meta">${z.menge != null ? `<span class="abhaken__menge">${esc(mengeText(z.menge, z.einheit))}</span>` : ''}${etiketten}</span>
      </span>
    </label></li>`;
  };
  const maerkte = liste.map((m) => `
    <section class="gruppe" style="--markt: ${MARKT_FARBE[m.markt]}">
      <h2 class="marktkopf">
        <span class="marktkopf__punkt">${sym('tasche')}</span>
        <span class="marktkopf__name">${marktName(m.markt)}</span>
        <span class="marktkopf__anzahl">${m.anzahl}</span>
      </h2>
      <ul class="gruppe__inhalt">${m.kategorien.map((k) => `<li class="kategorie">${esc(k.kategorie)}</li>${k.zeilen.map(zeileHtml).join('')}`).join('')}</ul>
    </section>`).join('');

  wurzel.innerHTML = `${kopf}
    <div class="gruppe"><div class="gruppe__inhalt">
      <label class="zeile">
        <span class="zeile__haupt zeile__titel">Grundvorrat ausblenden</span>
        <input class="schalter" type="checkbox" role="switch" data-einstellung="grundvorrat" ${zustand.einstellungen.grundvorratAusblenden ? 'checked' : ''}>
      </label>
    </div></div>
    ${maerkte}
    <p class="gruppe__fuss gruppe__fuss--frei">Lange drücken, um den Markt zu ändern oder Vorrat als aufgebraucht zu markieren.</p>
    <section class="gruppe">
      <div class="gruppe__inhalt"><button class="zeile zeile--knopf zeile--gefahr" type="button" data-aktion="neue-woche">Neue Woche: alle Haken entfernen</button></div>
    </section>`;
}

function marktBlatt(ctx, zutatId) {
  const { zustand, daten } = ctx;
  const info = daten.zutaten[zutatId] ?? { name: zutatId, grundvorrat: false };
  const aktuell = marktFuer(zutatId, daten.zutaten, zustand.einstellungen.marktZuordnung);
  const aufgebraucht = zustand.essen.aufgebraucht.includes(zutatId);
  const el = blatt.oeffne(`
    <section class="gruppe">
      <h3 class="gruppe__kopf">Markt</h3>
      <ul class="gruppe__inhalt">${MAERKTE.map((m) => `<li><button class="zeile" type="button" data-markt="${m}">
        <span class="zeile__haupt zeile__titel">${marktName(m)}</span>
        ${m === aktuell ? `<span class="zeile__wert zeile__wert--tint">${sym('haken', 'symbol--klein')}</span>` : ''}
      </button></li>`).join('')}</ul>
    </section>
    ${info.grundvorrat ? `
    <section class="gruppe">
      <div class="gruppe__inhalt"><button class="zeile zeile--knopf" type="button" data-aufgebraucht>${aufgebraucht ? 'Doch noch Vorrat da' : 'Als aufgebraucht markieren'}</button></div>
      <p class="gruppe__fuss">Aufgebrauchter Vorrat steht auf der Liste, auch wenn der Grundvorrat ausgeblendet ist.</p>
    </section>` : ''}`, { titel: info.name });
  el.addEventListener('click', (e) => {
    const markt = e.target.closest('[data-markt]');
    if (markt) {
      blatt.schliesse();
      ctx.aendern((z) => { z.einstellungen.marktZuordnung = { ...z.einstellungen.marktZuordnung, [zutatId]: markt.dataset.markt }; });
    } else if (e.target.closest('[data-aufgebraucht]')) {
      blatt.schliesse();
      ctx.aendern((z) => { z.essen = aufgebrauchtUmschalten(z.essen, zutatId); });
    }
  });
}

const AKTIONEN = {
  'neue-woche'(el, ctx) {
    if (!sicher(el, 'Nochmal tippen: alle Haken entfernen')) return;
    ctx.aendern((z) => { z.essen = neueWoche(z.essen, isoWoche(heute())); });
  },
};
```

- [ ] **Step 2: Fotos prüfen** (Server läuft)

```bash
node tools/foto.mjs "index.html#/einkauf" fotos/einkauf.png hell 2400 voll
node tools/foto.mjs "index.html#/einkauf" fotos/einkauf-dunkel.png dunkel 2400 voll
node tools/foto.mjs "index.html#/einkauf?ansicht=rezept" fotos/einkauf-rezept.png hell 2200 voll
node tools/foto.mjs "index.html#/einkauf" fotos/einkauf-standard.png hell 812
```

Expected:
- Nach Markt: Lidl (Skyr), Hofer (Hühnerbrustfilet abgehakt und durchgestrichen, Rinderfaschiertes), „Egal wo“ nach Kategorien in Laufweg-Reihenfolge; Olivenöl mit Etikett „Aufgebraucht“, Reis/Gewürze mit „Vorrat“; Paprika abgehakt. Untertitel „KW 42 · … offen“.
- Nach Rezept: pro Gericht die Zutaten mit hochgerechneten Mengen; keine Gruppe für die Leberkässemmel.
- Standard (ohne Zustand): nur die Zutaten der Skyr-Bowl (Skyr unter Lidl; Bananen, Haferflocken, Nüsse unter „Egal wo“). Den Leerzustand „Noch nichts geplant“ beim Ablauf von Hand prüfen: in Essen den Snack entfernen.

- [ ] **Step 3: Ablauf von Hand**

Zeile antippen → Kreis wird blau mit Haken, Name durchgestrichen, „offen“ zählt runter → „Grundvorrat ausblenden“ an → Reis und Gewürze verschwinden, Olivenöl (aufgebraucht) bleibt → Olivenöl abhaken → verschwindet (nicht mehr aufgebraucht) → auf „Paprika“ lange drücken → Blatt mit Märkten, „Hofer“ wählen → Paprika steht unter Hofer, der Haken wurde dabei nicht umgeschaltet → „Neue Woche“ zweimal tippen → alle Haken weg.

- [ ] **Step 4: Commit**

```bash
git add js/ansichten/einkauf.js
git commit -m "feat: Einkauf-Ansicht nach Markt und Rezept mit langem Drücken"
```

---

### Task 20: Mehr-Ansicht (Gewicht, Ziele, Abneigungen, Training, Daten)

**Files:**
- Replace: `js/ansichten/mehr.js`

**Interfaces:**
- Consumes: Gewicht (Task 8), `heute`, `isoWoche`, `tageZwischen` (Task 1), `exportText`, `exportDateiname`, `exportFaellig`, `importieren`, `SCHLUESSEL` (Task 2), `html.js`, `ctx` (inkl. `ersetzen`).
- Produces: setzt `einstellungen.empfehlungKw` (ISO-Woche), damit eine Empfehlung pro Woche nur einmal erscheint.

- [ ] **Step 1: Implementierung** – `js/ansichten/mehr.js` (ersetzt die vorläufige Datei)

```js
// Mehr: Gewicht mit Trend und Empfehlung, Tagesziele, Abneigungen, Training-Einstellungen, Datensicherung.
import { esc, sym, zahl, datumKurz } from './html.js';
import { parseKg, eintragen, wochenschnitte, trendProMonat, empfehlung } from '../logik/gewicht.js';
import { heute, isoWoche, tageZwischen } from '../logik/datum.js';
import { exportText, exportDateiname, exportFaellig, importieren, SCHLUESSEL } from '../speicher.js';

const ZIELE = [['kcal', 'Kalorien', 'kcal'], ['protein', 'Protein', 'g'], ['fett', 'Fett', 'g'], ['kh', 'Kohlenhydrate', 'g']];
let nachricht = null; // { art: 'ok' | 'fehler', text } – wird beim nächsten Zeichnen einmal gezeigt

export function zeige(wurzel, ctx) {
  wurzel.onclick = (e) => {
    const el = e.target.closest('[data-aktion]');
    if (el && !el.disabled) AKTIONEN[el.dataset.aktion]?.(el, ctx);
  };
  wurzel.onchange = (e) => aenderung(e.target, ctx);
  wurzel.onsubmit = (e) => {
    e.preventDefault();
    FORMULARE[e.target.dataset.formular]?.(e.target, ctx);
  };
  const z = ctx.zustand;
  const n = nachricht;
  nachricht = null;
  wurzel.innerHTML = `
    <header class="titelleiste">
      <div class="titelleiste__aktionen"></div>
      <h1 class="titelleiste__titel">Mehr</h1>
      <p class="titelleiste__unter">Gewicht, Ziele und Einstellungen</p>
    </header>
    ${n ? nachrichtHtml(n) : ''}
    ${exportFaellig(z, heute()) ? erinnerungHtml(z) : ''}
    ${gewichtHtml(z)}
    ${zieleHtml(z)}
    ${abneigungenHtml(z)}
    ${trainingHtml(z)}
    ${datenHtml(z)}`;
}

const datumLang = (d) => `${datumKurz(d)}${d.slice(0, 4)}`;

function nachrichtHtml(n) {
  return `<div class="hinweis" role="${n.art === 'fehler' ? 'alert' : 'status'}">
    <div class="hinweis__kopf">
      ${n.art === 'ok' ? `<span class="hinweis__icon">${sym('haken')}</span>` : ''}
      <div><p class="hinweis__titel">${n.art === 'ok' ? 'Erledigt' : 'Das hat nicht geklappt'}</p><p class="hinweis__text">${esc(n.text)}</p></div>
    </div>
  </div>`;
}

function erinnerungHtml(z) {
  const titel = z.letzterExport ? `Letzte Sicherung vor ${tageZwischen(z.letzterExport, heute())} Tagen` : 'Noch keine Sicherung';
  return `<div class="hinweis hinweis--info" role="status">
    <div class="hinweis__kopf">
      <span class="hinweis__icon">${sym('export')}</span>
      <div><p class="hinweis__titel">${titel}</p><p class="hinweis__text">Deine Daten liegen nur auf diesem iPhone. Exportiere sie, damit nichts verloren geht.</p></div>
    </div>
    <div class="knopfreihe"><button class="knopf knopf--gefuellt" type="button" data-aktion="export">Jetzt exportieren</button></div>
  </div>`;
}

function gewichtHtml(z) {
  const wochen = wochenschnitte(z.gewicht).slice(-6).reverse();
  const trend = trendProMonat(z.gewicht);
  const e = empfehlung(trend);
  const ziel = z.einstellungen.ziele.kcal;
  const zeilen = wochen.map((w) => `<li><div class="zeile">
    <div class="zeile__haupt"><div class="zeile__titel">KW ${w.kw.split('-W')[1]}</div><div class="zeile__unter">${w.anzahl} ${w.anzahl === 1 ? 'Messung' : 'Messungen'}</div></div>
    <span class="zeile__wert">${zahl(w.kg, 1)} kg</span>
  </div></li>`).join('');
  const trendText = trend == null
    ? 'Trend und Empfehlung ab 3 Wochen mit Messungen.'
    : `Trend: ${trend >= 0 ? '+' : '−'}${zahl(Math.abs(trend), 1)} kg pro Monat (Ziel etwa +0,5).${e === 0 ? ' Das passt – Ziel beibehalten.' : ''}`;
  const zeigeEmpfehlung = e && z.einstellungen.empfehlungKw !== isoWoche(heute());
  const empfehlungHtml = zeigeEmpfehlung ? `
    <div class="hinweis hinweis--info" role="status">
      <div class="hinweis__kopf">
        <span class="hinweis__icon">${sym(e > 0 ? 'hoch' : 'runter')}</span>
        <div>
          <p class="hinweis__titel">Vorschlag: ${e > 0 ? '+' : '−'}150 kcal</p>
          <p class="hinweis__text">${e > 0 ? 'Du nimmst langsamer zu als geplant.' : 'Du nimmst schneller zu als geplant.'} Neues Ziel ${zahl(ziel + e)} kcal statt ${zahl(ziel)} kcal.</p>
        </div>
      </div>
      <div class="knopfreihe">
        <button class="knopf knopf--getoent" type="button" data-aktion="empfehlung-nein">Nicht jetzt</button>
        <button class="knopf knopf--gefuellt" type="button" data-aktion="empfehlung" data-delta="${e}">Übernehmen</button>
      </div>
    </div>` : '';
  return `
    <section class="gruppe">
      <h2 class="gruppe__kopf gruppe__kopf--gross">Gewicht</h2>
      <form class="gruppe__inhalt" data-formular="gewicht"><div class="zeile">
        <input class="eingabe" name="kg" inputmode="decimal" autocomplete="off" enterkeyhint="done" placeholder="Heute, z. B. 72,4" aria-label="Gewicht heute in kg">
        <button class="knopf knopf--gefuellt" type="submit">Eintragen</button>
      </div></form>
      ${zeilen ? `<ul class="gruppe__inhalt gruppe__inhalt--abstand">${zeilen}</ul>` : ''}
      <p class="gruppe__fuss">${trendText}</p>
    </section>
    ${empfehlungHtml}`;
}

function zieleHtml(z) {
  return `<section class="gruppe">
    <h2 class="gruppe__kopf">Tagesziele</h2>
    <ul class="gruppe__inhalt">${ZIELE.map(([k, name, einheit]) => `<li><label class="zeile">
      <span class="zeile__haupt zeile__titel">${name}</span>
      <input class="eingabe eingabe--kurz" type="number" inputmode="numeric" min="1" step="1" data-ziel="${k}" value="${z.einstellungen.ziele[k]}" aria-label="${name} in ${einheit}">
      <span class="zeile__wert">${einheit}</span>
    </label></li>`).join('')}</ul>
  </section>`;
}

function abneigungenHtml(z) {
  return `<section class="gruppe">
    <h2 class="gruppe__kopf">Abneigungen</h2>
    <ul class="gruppe__inhalt">
      ${z.einstellungen.abneigungen.map((a) => `<li><div class="zeile">
        <span class="zeile__haupt zeile__titel">${esc(a)}</span>
        <button class="knopf knopf--schlicht" type="button" data-aktion="abneigung-weg" data-wert="${esc(a)}">Entfernen</button>
      </div></li>`).join('')}
      <li><form class="zeile" data-formular="abneigung">
        <input class="eingabe" name="wort" autocomplete="off" placeholder="z. B. Pilze" aria-label="Neue Abneigung">
        <button class="knopf knopf--getoent" type="submit">Hinzufügen</button>
      </form></li>
    </ul>
    <p class="gruppe__fuss">Rezepte mit diesem Wort im Namen, in den Tags oder Zutaten werden ausgeblendet.</p>
  </section>`;
}

function trainingHtml(z) {
  const p = z.einstellungen.pauseSek;
  const pauseZeile = (art, name) => `<li><div class="zeile">
    <span class="zeile__haupt zeile__titel">Pause ${name}</span>
    <div class="mini-zaehler" role="group" aria-label="Pause ${name}">
      <button type="button" data-aktion="pause" data-art="${art}" data-delta="-15" aria-label="15 Sekunden weniger" ${p[art] <= 15 ? 'disabled' : ''}>${sym('minus')}</button>
      <output>${p[art]} s</output>
      <button type="button" data-aktion="pause" data-art="${art}" data-delta="15" aria-label="15 Sekunden mehr" ${p[art] >= 300 ? 'disabled' : ''}>${sym('plus')}</button>
    </div>
  </div></li>`;
  return `<section class="gruppe">
    <h2 class="gruppe__kopf">Training</h2>
    <ul class="gruppe__inhalt">
      ${pauseZeile('schwer', 'schwere Tage')}
      ${pauseZeile('leicht', 'leichte Tage')}
      <li><label class="zeile">
        <span class="zeile__haupt"><span class="zeile__titel">Klimmzugstange vorhanden</span><span class="zeile__unter">Ersetzt Tischrudern durch Klimmzüge</span></span>
        <input class="schalter" type="checkbox" role="switch" data-einstellung="stange" ${z.einstellungen.stange ? 'checked' : ''}>
      </label></li>
    </ul>
  </section>`;
}

function datenHtml(z) {
  const defekt = window.localStorage.getItem(`${SCHLUESSEL}.defekt`);
  return `<section class="gruppe">
    <h2 class="gruppe__kopf">Daten</h2>
    <ul class="gruppe__inhalt">
      <li><button class="zeile zeile--mit-symbol" type="button" data-aktion="export">
        <span class="zeile__icon">${sym('export')}</span><span class="zeile__haupt zeile__titel">Daten exportieren</span>
      </button></li>
      <li><label class="zeile zeile--mit-symbol">
        <span class="zeile__icon zeile__icon--grau">${sym('vorrat')}</span><span class="zeile__haupt zeile__titel">Daten importieren</span>
        <input class="nur-vorlesen" type="file" accept="application/json,.json" data-import>
      </label></li>
      ${defekt ? '<li><button class="zeile zeile--knopf" type="button" data-aktion="export-defekt">Beschädigte Daten exportieren</button></li>' : ''}
    </ul>
    <p class="gruppe__fuss">Letzte Sicherung: ${z.letzterExport ? datumLang(z.letzterExport) : 'noch nie'}. Beim Import wird der bisherige Stand als Sicherung aufgehoben.</p>
  </section>`;
}

// Teilen-Blatt (iPhone: „In Dateien sichern“), sonst normaler Download.
async function sichern(name, text, typ = 'application/json') {
  const datei = new File([text], name, { type: typ });
  if (navigator.canShare?.({ files: [datei] })) {
    try {
      await navigator.share({ files: [datei], title: name });
      return true;
    } catch (fehler) {
      if (fehler.name === 'AbortError') return false;
    }
  }
  const url = URL.createObjectURL(datei);
  const a = Object.assign(document.createElement('a'), { href: url, download: name });
  document.body.append(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
  return true;
}

function aenderung(el, ctx) {
  if (el.dataset.ziel) {
    const n = Math.round(Number(el.value));
    if (Number.isFinite(n) && n > 0) {
      ctx.aendern((z) => { z.einstellungen.ziele[el.dataset.ziel] = n; });
    } else {
      nachricht = { art: 'fehler', text: 'Bitte eine Zahl größer als 0 eingeben.' };
      ctx.navigiere('#/mehr');
    }
  } else if (el.dataset.einstellung === 'stange') {
    ctx.aendern((z) => { z.einstellungen.stange = el.checked; });
  } else if (el.dataset.import !== undefined && el.files?.[0]) {
    importDatei(el.files[0], ctx);
  }
}

async function importDatei(datei, ctx) {
  const r = importieren(window.localStorage, await datei.text());
  nachricht = r.ok
    ? { art: 'ok', text: 'Import erfolgreich. Der vorherige Stand ist als Sicherung aufgehoben.' }
    : { art: 'fehler', text: r.fehler };
  if (r.ok) ctx.ersetzen(r.zustand);
  else ctx.navigiere('#/mehr');
}

const FORMULARE = {
  gewicht(form, ctx) {
    const kg = parseKg(form.kg.value);
    if (kg == null) {
      nachricht = { art: 'fehler', text: 'Bitte ein Gewicht zwischen 20 und 300 kg eingeben, z. B. 72,4.' };
      ctx.navigiere('#/mehr');
      return;
    }
    nachricht = { art: 'ok', text: `${zahl(kg, 1)} kg für heute eingetragen.` };
    ctx.aendern((z) => { z.gewicht = eintragen(z.gewicht, heute(), kg); });
  },
  abneigung(form, ctx) {
    const wort = form.wort.value.trim().toLowerCase();
    if (!wort) return;
    ctx.aendern((z) => {
      if (!z.einstellungen.abneigungen.includes(wort)) z.einstellungen.abneigungen = [...z.einstellungen.abneigungen, wort];
    });
  },
};

const AKTIONEN = {
  async export(el, ctx) {
    if (!(await sichern(exportDateiname(heute()), exportText(ctx.zustand)))) return;
    nachricht = { art: 'ok', text: 'Sicherung erstellt. Leg sie in „Dateien“ oder in der iCloud ab.' };
    ctx.aendern((z) => { z.letzterExport = heute(); });
  },
  'export-defekt'() {
    sichern('fit-einkauf-defekt.txt', window.localStorage.getItem(`${SCHLUESSEL}.defekt`) ?? '', 'text/plain');
  },
  empfehlung(el, ctx) {
    const delta = Number(el.dataset.delta);
    nachricht = { art: 'ok', text: `Neues Kalorienziel: ${zahl(ctx.zustand.einstellungen.ziele.kcal + delta)} kcal.` };
    ctx.aendern((z) => {
      z.einstellungen.ziele.kcal += delta;
      z.einstellungen.empfehlungKw = isoWoche(heute());
    });
  },
  'empfehlung-nein'(el, ctx) {
    ctx.aendern((z) => { z.einstellungen.empfehlungKw = isoWoche(heute()); });
  },
  'abneigung-weg'(el, ctx) {
    ctx.aendern((z) => { z.einstellungen.abneigungen = z.einstellungen.abneigungen.filter((a) => a !== el.dataset.wert); });
  },
  pause(el, ctx) {
    ctx.aendern((z) => {
      const p = z.einstellungen.pauseSek;
      p[el.dataset.art] = Math.max(15, Math.min(300, p[el.dataset.art] + Number(el.dataset.delta)));
    });
  },
};
```

- [ ] **Step 2: Fotos prüfen** (Server läuft)

```bash
node tools/foto.mjs "index.html#/mehr" fotos/mehr.png hell 2300 voll
node tools/foto.mjs "index.html#/mehr" fotos/mehr-dunkel.png dunkel 2300 voll
node tools/foto.mjs "index.html#/mehr" fotos/mehr-leer.png hell 1700
```

Expected:
- Voll: Hinweis „Letzte Sicherung vor … Tagen“ mit „Jetzt exportieren“; Gewicht mit KW 42 … KW 39 (72,6 … 72,0 kg); Trend „+0,8 kg pro Monat“; Vorschlag „−150 kcal … Neues Ziel 2.800 kcal“; Tagesziele mit Zahlenfeldern; Abneigungen curry, tofu; Pausen 90 s / 60 s; Schalter Stange aus; Daten-Gruppe.
- Leer: kein Export-Hinweis, „Trend und Empfehlung ab 3 Wochen mit Messungen.“

- [ ] **Step 3: Ablauf von Hand**

„72,4“ eintragen → Bestätigung „72,4 kg für heute eingetragen.“, Woche erscheint → „abc“ eintragen → Fehlermeldung → Kalorienziel auf 3000 ändern, Feld verlassen → Essen zeigt „von 3.000 kcal“ → Abneigung „pute“ hinzufügen → Bibliothek blendet die Ofenkartoffeln aus → Pause schwer +15 → 105 s → Stange an → Training zeigt bei Oberkörper A Klimmzug statt Tischrudern → „Daten exportieren“ lädt `fit-einkauf-JJJJ-MM-TT.json` (am PC als Download) → die Datei über „Daten importieren“ wieder einlesen → „Import erfolgreich“ → eine beliebige `.png` importieren → „Die Datei ist kein gültiges JSON.“, Daten unverändert.

- [ ] **Step 4: Commit**

```bash
git add js/ansichten/mehr.js
git commit -m "feat: Mehr-Ansicht mit Gewicht, Zielen, Abneigungen, Pausen und Datensicherung"
```

---

### Task 21: Offline-Betrieb, Installation und App-Icon

**Files:**
- Create: `sw.js`, `manifest.webmanifest`, `bilder/icon.svg`, `bilder/icon-512.png` (erzeugt)
- Modify: `index.html` (Manifest und Icon), `js/app.js` (Service Worker registrieren)
- Test: `tests/sw.test.js`

**Interfaces:**
- Produces: `sw.js` mit den Listen `APP` und `DATEN` (JSON-Schreibweise mit doppelten Anführungszeichen, ohne Komma am Ende, damit der Test sie lesen kann).

- [ ] **Step 1: Failing test schreiben** – `tests/sw.test.js`

```js
import { describe, it, expect } from 'vitest';
import { readFileSync, existsSync, readdirSync } from 'node:fs';

const wurzel = new URL('../', import.meta.url);
const quelltext = readFileSync(new URL('sw.js', wurzel), 'utf8');
const liste = (name) => JSON.parse(quelltext.match(new RegExp(`const ${name} = (\\[[\\s\\S]*?\\]);`))[1]);
const alleJs = (ordner) => readdirSync(new URL(ordner, wurzel), { withFileTypes: true }).flatMap((e) => {
  if (e.isDirectory()) return alleJs(`${ordner}${e.name}/`);
  return e.name.endsWith('.js') ? [`${ordner}${e.name}`] : [];
});

describe('Service Worker', () => {
  it('alle vorab gespeicherten Dateien existieren', () => {
    for (const datei of [...liste('APP'), ...liste('DATEN')].filter((d) => d !== './')) {
      expect(existsSync(new URL(datei, wurzel)), datei).toBe(true);
    }
  });
  it('jede JS-Datei der App ist offline verfügbar', () => {
    const app = liste('APP');
    for (const datei of alleJs('js/')) expect(app, datei).toContain(datei);
  });
});
```

Run: `npx vitest run tests/sw.test.js`
Expected: FAIL (`sw.js` fehlt).

- [ ] **Step 2: Service Worker** – `sw.js`

```js
// Service Worker: App-Dateien aus dem Cache (Cache-first), data/ bevorzugt aus dem Netz (Network-first).
// Bei jeder Änderung an App-Dateien VERSION erhöhen, damit iPhones die neue Version laden.
const VERSION = 'fit-einkauf-1';
const APP = [
  "./", "index.html", "manifest.webmanifest", "css/tokens.css", "css/komponenten.css",
  "bilder/symbole.svg", "bilder/icon-512.png",
  "js/app.js", "js/route.js", "js/daten.js", "js/speicher.js",
  "js/logik/datum.js", "js/logik/rotation.js", "js/logik/progression.js", "js/logik/einheit.js",
  "js/logik/filter.js", "js/logik/einkaufsliste.js", "js/logik/naehrwerte.js", "js/logik/gewicht.js",
  "js/logik/figur.js", "js/logik/wochenplan.js",
  "js/ansichten/html.js", "js/ansichten/blatt.js", "js/ansichten/pause.js", "js/ansichten/wachhalten.js",
  "js/ansichten/figur-ansicht.js", "js/ansichten/training.js", "js/ansichten/essen.js",
  "js/ansichten/einkauf.js", "js/ansichten/mehr.js"
];
const DATEN = ["data/zutaten.json", "data/rezepte.json", "data/uebungen.json", "data/trainingsplan.json"];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(VERSION).then((cache) => cache.addAll([...APP, ...DATEN])).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys()
      .then((namen) => Promise.all(namen.filter((n) => n !== VERSION).map((n) => caches.delete(n))))
      .then(() => self.clients.claim()),
  );
});

self.addEventListener('fetch', (e) => {
  const url = new URL(e.request.url);
  if (e.request.method !== 'GET' || url.origin !== self.location.origin) return;
  if (url.pathname.includes('/data/')) {
    e.respondWith(
      fetch(e.request)
        .then((antwort) => {
          if (antwort.ok) {
            const kopie = antwort.clone();
            caches.open(VERSION).then((cache) => cache.put(e.request, kopie));
          }
          return antwort;
        })
        .catch(() => caches.match(e.request).then((treffer) => treffer ?? Response.error())),
    );
    return;
  }
  e.respondWith(caches.match(e.request, { ignoreSearch: true }).then((treffer) => treffer ?? fetch(e.request)));
});
```

- [ ] **Step 3: Manifest** – `manifest.webmanifest`

```json
{
  "name": "Fit & Einkauf",
  "short_name": "Fit & Einkauf",
  "lang": "de-AT",
  "start_url": "./#/training",
  "scope": "./",
  "display": "standalone",
  "background_color": "#F2F2F7",
  "theme_color": "#F2F2F7",
  "icons": [{ "src": "bilder/icon-512.png", "sizes": "512x512", "type": "image/png", "purpose": "any" }]
}
```

- [ ] **Step 4: App-Icon** – `bilder/icon.svg` (Hantel-Symbol der Tab-Leiste, weiß auf Tint-Blau; iOS rundet die Ecken selbst)

```xml
<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512">
  <rect width="512" height="512" fill="#0066CC"/>
  <g transform="translate(64 64) scale(16)" fill="none" stroke="#FFFFFF" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
    <path d="M6.5 6.5v11M17.5 6.5v11M3.5 9.5v5M20.5 9.5v5M6.5 12h11"/>
  </g>
</svg>
```

PNG erzeugen (Server läuft):
`"C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe" --headless=new --disable-gpu --hide-scrollbars --window-size=512,512 --screenshot="C:/Claude Projekte/fit-einkauf/bilder/icon-512.png" "http://127.0.0.1:8765/bilder/icon.svg"`
Expected: `bilder/icon-512.png` (512 × 512) zeigt die weiße Hantel auf blauem Grund ohne weißen Rand. Bild öffnen und prüfen.

- [ ] **Step 5: `index.html` ergänzen** – nach der `<title>`-Zeile einfügen:

```html
  <link rel="manifest" href="manifest.webmanifest">
  <link rel="apple-touch-icon" href="bilder/icon-512.png">
```

- [ ] **Step 6: Service Worker registrieren** – in `js/app.js` in `start()` nach `navigator.storage?.persist?.().catch(() => {});` einfügen:

```js
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('sw.js').catch((fehler) => console.warn('Service Worker:', fehler));
  }
```

- [ ] **Step 7: Tests laufen lassen**

Run: `npm test`
Expected: alle PASS, inkl. `tests/sw.test.js` (2 Tests).

- [ ] **Step 8: Offline prüfen**

Edge normal öffnen: `http://127.0.0.1:8765/` → DevTools → Anwendung → Service Worker: „fit-einkauf-1“ aktiv → Häkchen „Offline“ setzen → Seite neu laden. Expected: App lädt mit allen vier Bereichen, Rezepte und Übungen sind da. Häkchen wieder entfernen.

- [ ] **Step 9: Commit**

```bash
git add sw.js manifest.webmanifest bilder/icon.svg bilder/icon-512.png index.html js/app.js tests/sw.test.js
git commit -m "feat: Offline-Betrieb, Installation und App-Icon"
```

---

### Task 22: Abschlussprüfung, Aufräumen und Dokumentation

**Files:**
- Delete: `muster/training.html`, `muster/komponenten.html`, `muster/muster.js` (Vorlagen, durch die App ersetzt; `muster/figuren.html` bleibt als Prüfseite)
- Modify: `DESIGN.md` (neue Komponenten), `docs/HANDOFF.md`

- [ ] **Step 1: Alle Tests**

Run: `npm test`
Expected: alle Testdateien PASS (datum, speicher, rotation, progression, filter, einkaufsliste, naehrwerte, gewicht, figur, daten, uebungen, einheit, route, html, wochenplan, sw).

- [ ] **Step 2: Fotorunde (hell und dunkel, 375 px)** – Server läuft

```bash
for t in hell dunkel; do
  node tools/foto.mjs "index.html#/training" fotos/end-training-$t.png $t 812 voll
  node tools/foto.mjs "index.html#/training" fotos/end-laufend-$t.png $t 812 laufend
  node tools/foto.mjs "index.html#/essen" fotos/end-essen-$t.png $t 1700 voll
  node tools/foto.mjs "index.html#/einkauf" fotos/end-einkauf-$t.png $t 2400 voll
  node tools/foto.mjs "index.html#/mehr" fotos/end-mehr-$t.png $t 2300 voll
done
```

Jedes Foto öffnen und prüfen: kein waagrechtes Scrollen, kein abgeschnittener Text, Tipp-Flächen ≥ 48 px, Kontrast in beiden Darstellungen, Orange nur bei der Pause, Abstand unten reicht für Tab-Leiste (und Pausen-Leiste). Gefundene Fehler in einem Durchgang beheben, ein zweites Mal fotografieren, dann aufhören.

- [ ] **Step 3: Kompletter Ablauf von Hand** (eingebauter Browser oder Edge-Gerätemodus 375×812, leerer Speicher)

1. Training: Einheit starten, alle Sätze mit Pausen loggen, Figur antippen, Blatt schließen, abschließen.
2. Essen: 2 Abendgerichte, 2 Jausen, 1 Extra einplanen; typischer Tag ändert sich.
3. Einkauf: Liste nach Markt abhaken, langes Drücken → Markt ändern, Grundvorrat ausblenden, nach Rezept ansehen.
4. Mehr: Gewicht eintragen, exportieren, importieren.
5. Seite neu laden: alles ist noch da.

- [ ] **Step 4: Vorlagen löschen**

```bash
git rm muster/training.html muster/komponenten.html muster/muster.js
```

- [ ] **Step 5: `DESIGN.md` ergänzen** – im Abschnitt „Components“ (bzw. „Komponenten“) diese Einträge im Stil der vorhandenen ergänzen (kurz, mit Klassenname und Regel):
  - **Blatt** (`.blatt-huelle`, `.blatt`): Rückfragen und Details fahren von unten hoch, Hintergrund 32 % abgedunkelt, Schließen per „Fertig“, Tipp daneben, Escape oder Wischen; ersetzt Dialogfenster.
  - **Übungsfigur** (`.figur-mini`, `.posen`): 72-px-Strichfigur in der Übungskarte, Start/Ende im 1,5-s-Wechsel, bei reduzierter Bewegung nur die Endposition; im Blatt beide Posen nebeneinander; Strichfarbe = Textfarbe.
  - **Mini-Zähler** (`.mini-zaehler`): −/+ mit 48-px-Tasten in Listenzeilen (Portionen, Anzahl, Pausen).
  - **Eingabefeld** (`.eingabe`, `.eingabe--kurz`): 48 px hoch, Hintergrund `--zelle-2`, 17 px Schrift (verhindert Zoom auf iOS).
  - **Segment mit Links** (`.segment a[aria-current]`): Navigation zwischen Unteransichten im Segment-Stil.
  - **Hinweis „Achte darauf“** (`.achtung`): neutrale Fläche mit fettem Einstieg, kein Orange und kein Rot.

- [ ] **Step 6: `docs/HANDOFF.md` aktualisieren** – Status: Schritt 4 (Plan) ✅, Schritt 5 (Umsetzung) ✅; Nächste Schritte: GitHub-Repo `peppdoe/fit-einkauf` anlegen und GitHub Pages aktivieren (vorher den Nutzer fragen), App am iPhone installieren und eine Woche benutzen, dann Phase 2. Offene Punkte: Darstellung auf dem echten iPhone (SF Pro, Ton, Wake Lock, Teilen-Blatt beim Export) prüfen.

- [ ] **Step 7: Commit**

```bash
git add -A
git commit -m "chore: Abschlussprüfung, Vorlagen entfernt, DESIGN.md und Handoff aktualisiert"
```

- [ ] **Step 8: Deployment ansprechen (nicht ausführen)**

Dem Nutzer melden, dass das MVP fertig ist, und fragen, ob das GitHub-Repo `peppdoe/fit-einkauf` angelegt und GitHub Pages aktiviert werden soll. Erst nach ausdrücklicher Zustimmung veröffentlichen.
