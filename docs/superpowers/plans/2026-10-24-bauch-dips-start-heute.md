# Bauch im Hang, Dips, Start auf Heute – Umsetzungsplan (kurz)

> Kurzplan auf Wunsch des Nutzers; Umsetzung inline mit TDD (superpowers:executing-plans + test-driven-development).

**Ziel:** Zwei neue Übungsketten („Bauch im Hang“, „Dips“) mit Figuren und neuem Gerät `barren`, Platzhalter `bauch` im Trainingsplan, App startet immer auf „Heute“.

**Architektur:** Platzhalter werden in `js/logik/rotation.js` über eine Tabelle `PLATZHALTER` aufgelöst (`[mit Stange, ohne Stange]`). Alle Stellen, die bisher `'ziehen'` hart kannten, fragen diese Tabelle. Der Verlauf blendet Ketten ohne Einträge aus, die mit der aktuellen Stange-Einstellung in keiner Einheit vorkommen (`kettenImPlan`).

**Tech:** HTML/CSS/JS-Module, Vitest, `tools/figuren.mjs`, `tools/foto.mjs`.

## Entscheidungen (Rückfragen vom 24.10.2026)

- Neues Gerät `barren` mit eigenem SVG (für Negativ-Dips und Dips).
- Start: Manifest `start_url` auf `./#/heute`; zusätzlich setzt `app.js` bei jedem Kaltstart `#/heute`, egal welche Adresse (wirkt ohne Neuinstallation). Beim Zurückkehren aus dem Hintergrund bleibt die Seite, wie sie ist.
- Knopf auf Heute bei offener Einheit heißt „Training fortsetzen“ (statt „Weiter trainieren“).

## Review Focus

1. Ohne Stange darf Oberkörper A kein `core-haengend` enthalten und mit Stange kein `core` (Test in rotation).
2. Bestehende Spielstände: neue Ketten haben noch keinen Eintrag in `training.stufen` → Stufe 0 (stufeVon-Standard; keine Migration nötig).
3. Verlauf: Mit Stange erscheinen `core` (Beine-Einheiten) und `ziehen-ohne-stange` (OK B); ohne Stange fehlen `ziehen-stange` und `core-haengend`, solange sie keine Einträge haben.
4. Laufende Einheit beim Kaltstart: Route ist Heute, `laufend` bleibt im Zustand, Knopf „Training fortsetzen“ führt nach `#/training`.
5. Drücken:Ziehen bleibt 1:1 mit Stange (`druecken-dips` beginnt mit „druecken“).

---

### Task 1: Platzhalter-Tabelle (`bauch` neben `ziehen`)

**Dateien:** `js/logik/rotation.js`, `js/daten.js`, `js/ansichten/training.js`, Tests `tests/rotation.test.js`, `tests/daten.test.js`

- [ ] Test rot: `kettenFuerEinheit({ketten: [['druecken-horizontal','ziehen'],'bauch']}, true)` → `[…,'ziehen-stange','core-haengend']`, ohne Stange → `'core'`; `kettenImPlan(plan, stange)` liefert die Menge aller aufgelösten Ketten; `verknuepfe` warnt nicht bei `bauch`.
- [ ] Umsetzung:
  ```js
  // Platzhalter im Plan: [mit Stange, ohne Stange]
  export const PLATZHALTER = { ziehen: ['ziehen-stange', 'ziehen-ohne-stange'], bauch: ['core-haengend', 'core'] };
  const ersetze = (id, stange) => PLATZHALTER[id]?.[stange ? 0 : 1] ?? id;
  export const kettenImPlan = (plan, stange) => new Set(plan.einheiten.flatMap((e) => kettenFuerEinheit(e, stange)));
  ```
  `daten.js`: `if (!PLATZHALTER[id] && !kettenById[id])`. `training.js` Verlauf: `if (!eintraege.length && !imPlan.has(kette.id)) return '';`
- [ ] Tests grün.

### Task 2: Gerät `barren`

**Dateien:** `js/logik/figur.js` (GERAETE + GERAET_SVG), `tests/figur.test.js`

- [ ] Test rot: `GERAETE` enthält `barren`, `poseZuSvg(pose, 'barren')` enthält den Holm-Pfad.
- [ ] SVG: zwei leicht versetzte Holme auf Hüfthöhe (y ≈ 46) mit zwei Stützen, nach innen gerückt (unterscheidbar vom Tisch).

### Task 3: Ketten, Plan, Datentests

**Dateien:** `data/uebungen.json`, `data/trainingsplan.json`, `tests/uebungen.test.js`

- [ ] Tests rot: Kettenliste `['druecken-horizontal',5],['druecken-vertikal',4],['druecken-dips',4],['ziehen-ohne-stange',3],['ziehen-stange',7],['beine',5],['huefte',3],['core',3],['core-haengend',3],['mobilitaet',1]`; MIT_ACHTUNG + alle 7 neuen Stufen; Gerät: `core-haengend` = stange, Bank-Dips = stuhl, Negativ-Dips/Dips = barren; Plan: OK A `[['druecken-horizontal','ziehen'],'bauch','mobilitaet']`, OK B zweiter Block `['druecken-dips','ziehen-ohne-stange']`; Plan-Prüfungen nutzen `PLATZHALTER`/`kettenFuerEinheit` statt hartem `'ziehen'`.
- [ ] Ketten mit den Texten des Nutzers wortgleich eintragen (ziel `{saetze: 3, wdh: n}`), Plan ändern.

### Task 4: Figuren

**Dateien:** `tools/figuren.mjs`, `data/uebungen.json`

- [ ] Posen für Knee Raise im Hang, Leg Raise im Hang, Toes to Bar (Stange, Start: Hang mit hinten angewinkelten Unterschenkeln), Bank-Dips, Bank-Dips mit gestreckten Beinen (Stuhl), Negativ-Dips, Dips (Barren). `node tools/figuren.mjs`, keine ✗.
- [ ] Screenshots über `muster/figuren.html` mit `tools/foto.mjs`, Posen ansehen und nachbessern.
- [ ] Alle Tests grün, Commit „feat: Ketten Bauch im Hang und Dips, Gerät Barren, Platzhalter bauch“.

### Task 5: Start auf Heute

**Dateien:** `manifest.webmanifest`, `js/route.js`, `js/app.js`, `js/ansichten/heute.js`, Tests `tests/route.test.js`, `tests/heute.test.js`

- [ ] Tests rot: `START === '#/heute'`; Manifest `start_url` = `./#/heute`; Heute mit `laufend` zeigt „Training fortsetzen“ mit `href="#/training"`, ohne `laufend` nicht.
- [ ] `route.js`: `export const START = '#/heute';` – `app.js` beim Start: `history.replaceState(null, '', START)` immer. Knopftext ändern.
- [ ] Tests grün, Commit „feat: App startet immer auf Heute, Knopf Training fortsetzen“.

### Task 6: Abschluss

- [ ] `docs/HANDOFF.md` aktualisieren (Sitzung 5), Commit.
