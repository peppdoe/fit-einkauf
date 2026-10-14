# Fit & Einkauf – Ergänzung: Übersicht „Heute“ (Task 23)

> **For agentic workers:** Ergänzung zum Plan `docs/superpowers/plans/2026-10-14-fit-einkauf-mvp.md`. Dort gelten „Global Constraints“, „Revision nach Review“ und die Ablauf-Konvention weiter. Umsetzung **direkt** (ohne Subagents), Steps mit Checkboxen (`- [ ]`). Bestehende Tasks 1–22 werden durch diese Datei nicht geändert.

**Goal:** Eine Startseite „Heute“ als erster Tab: die heutige Einheit mit einem Tipp zum Start, ein Wochenstreifen (Kalender) mit erledigten und geplanten Einheiten, eine Zusammenfassung für den gewählten Tag oder die Woche. Ab Scheibe 2/3 kommen Blöcke für Essen, Einkauf und Gewicht dazu.

**Vorlage:** `muster/heute.html` (+ `muster/heute.js`, nur Demo) und `css/uebersicht.css` (wird von der App direkt verwendet). Muster ansehen: `npm run serve`, dann `http://127.0.0.1:8765/muster/heute.html`, Zustände mit `?stand=offen|laeuft|erledigt` und `?thema=hell|dunkel`.

**Architecture:** Neue reine Logik `js/logik/uebersicht.js` (Kalender und Summen, ohne DOM, mit Vitest), neue Ansicht `js/ansichten/heute.js` nach der Ablauf-Konvention (`zeige(wurzel, ctx, route)`, Klicks über `data-aktion`). Der Zustand bleibt unverändert (kein neues Feld, keine Migration): alles wird aus `training.log`, `training.naechsteEinheit`, `training.laufend` und dem Trainingsplan abgeleitet. Wochen-Versatz, gewählter Tag und Tag/Woche leben nur in der Ansicht.

## Einordnung

| Teil | Wann | Inhalt |
|---|---|---|
| **23A** Übersicht Training | sofort nach dem Deployment von Scheibe 1 (oder jederzeit danach) | Tab „Heute“, Heute-Karte, Wochenstreifen, Zusammenfassung Tag/Woche |
| **23B** Essen, Einkauf, Gewicht | nach Scheibe 2 (Essen, Einkauf) bzw. Scheibe 3 (Gewicht) | Nährwert-Block, Zeile Einkaufsliste, Zeile Gewicht |
| Hinweis zu Task 22 | Abschluss | `muster/heute.html` und `muster/heute.js` zusammen mit den anderen Vorlagen löschen; `index.html#/heute` in die Fotorunde aufnehmen; DESIGN.md-Einträge aus Step 23A.7 übernehmen, falls noch nicht geschehen |

## Entscheidungen

- **Kalender = Vorschau der Rotation.** Die Rotation läuft nach Ablauf, nicht nach Wochentag. Der Streifen zeigt deshalb: Vergangenes aus dem Log (✓ und Kürzel), Tage ohne Eintrag als „–“, ab heute (oder ab morgen, wenn heute schon trainiert wurde) jeden Tag die nächste Einheit. Lässt man einen Tag aus, rückt die Vorschau mit; nichts wird gespeichert oder verschoben. Fußnote erklärt das.
- **Startseite:** ohne Adresse öffnet die App `#/heute`; ist eine Einheit angefangen (`training.laufend`), weiter direkt `#/training` (Produkt-Prinzip 1: dort öffnen, wo man gerade ist). Unbekannte Bereiche landen bei `heute`.
- **Ein Tipp zum Training:** „Training starten“ startet die Einheit direkt und wechselt zu `#/training`. Gibt es offene Steigerungsvorschläge, heißt der Knopf „Zum Training“ und führt zur Training-Startseite, damit „Stark – nächste Stufe?“ nicht übersprungen wird. Läuft eine Einheit: „Weiter trainieren“.
- **Tag oder Woche:** Segment-Umschalter. „Woche“ summiert die angezeigte Woche. Antippen eines Tags im Streifen wählt ihn und schaltet auf „Tag“: erledigt → Kacheln des Tags, vergangen ohne Training → Leerzustand, geplant/heute → Übungsliste mit den aktuellen Stufen.
- **Kacheln:** Einheiten · Sätze am Ziel (grün nur, wenn alle am Ziel) · Wiederholungen · Haltezeit. Mobilitäts-Teile zählen nicht mit. Zahlen in `--t-zahl-mittel` (28 px gerundet), keine Ringe, keine Serien-Zähler (DESIGN.md: keine Gamification).
- **Kürzel:** `trainingsplan.json` bekommt pro Einheit `kurz` (OK A, Beine, OK B, B & C) für den 7-spaltigen Streifen; fehlt es, gilt der Name.
- **Tab-Leiste:** fünf Tabs, „Heute“ zuerst (Symbol `heute`, Kalenderblatt). Bis Scheibe 2 sichtbar: Heute · Training · Mehr.
- **Essen ist ein Plan, kein Tagebuch:** Der Nährwert-Block zeigt den typischen Tag laut Wochenplan (Task 7), nicht, was wirklich gegessen wurde.

---

### Task 23A: Übersicht „Heute“ – Training

**Files:**
- Create: `js/logik/uebersicht.js`, `js/ansichten/heute.js`
- Test: `tests/uebersicht.test.js`
- Modify: `js/route.js`, `js/app.js`, `index.html`, `sw.js`, `bilder/symbole.svg`, `data/trainingsplan.json`, `tests/route.test.js`, `DESIGN.md`
- Vorhanden (aus dem Muster-PR): `css/uebersicht.css`

**Interfaces:**
- Consumes: `plusTage`, `montag`, `tageZwischen`, `isoWoche`, `heute` (Task 1); `zielFuer`, `zielwert` (Task 4); `naechsteEinheit`, `bloeckeFuerEinheit` (Task 3); `starteEinheit` (Task 13); `pause.tonVorbereiten` (Task 15).
- Produces:
  - `wochenKalender(training, plan, heuteDatum, versatz = 0): [{ datum, status: 'erledigt'|'frei'|'heute'|'laeuft'|'geplant', einheiten: [{ id, name, kurz }] }]` (7 Tage ab Montag)
  - `trainingsSumme(log, kettenById, von, bis): { einheiten, saetze, amZiel, wdh, sek }`
  - Bereich `heute` in `parseRoute`; Ansicht `heute` mit `zeige(wurzel, ctx)`

- [ ] **Step 1: Failing test schreiben** – `tests/uebersicht.test.js`

```js
import { describe, it, expect } from 'vitest';
import { wochenKalender, trainingsSumme } from '../js/logik/uebersicht.js';

const plan = {
  einheiten: [
    { id: 'ok-a', name: 'Oberkörper A', kurz: 'OK A' },
    { id: 'beine', name: 'Beine', kurz: 'Beine' },
    { id: 'ok-b', name: 'Oberkörper B', kurz: 'OK B' },
    { id: 'beine-core', name: 'Beine & Core', kurz: 'B & C' },
  ],
};
const eintrag = (datum, einheit, uebungen = []) => ({ datum, einheit, art: 'schwer', uebungen });
// Mittwoch, 14.10.2026; Montag und Dienstag trainiert, als Nächstes kommt Oberkörper B.
const training = (extra = {}) => ({
  naechsteEinheit: 2, laufend: null,
  log: [eintrag('2026-10-12', 1), eintrag('2026-10-13', 2)],
  ...extra,
});

describe('wochenKalender', () => {
  it('erledigt aus dem Log, heute und danach als Vorschau der Rotation', () => {
    const tage = wochenKalender(training(), plan, '2026-10-14');
    expect(tage.map((t) => t.datum)).toEqual([
      '2026-10-12', '2026-10-13', '2026-10-14', '2026-10-15', '2026-10-16', '2026-10-17', '2026-10-18',
    ]);
    expect(tage.map((t) => t.status)).toEqual(['erledigt', 'erledigt', 'heute', 'geplant', 'geplant', 'geplant', 'geplant']);
    expect(tage.map((t) => t.einheiten.map((e) => e.kurz).join())).toEqual(['OK A', 'Beine', 'OK B', 'B & C', 'OK A', 'Beine', 'OK B']);
  });

  it('heute schon trainiert: Vorschau beginnt morgen', () => {
    const t = training({ naechsteEinheit: 3, log: [...training().log, eintrag('2026-10-14', 3)] });
    const tage = wochenKalender(t, plan, '2026-10-14');
    expect(tage[2]).toEqual({ datum: '2026-10-14', status: 'erledigt', einheiten: [{ id: 'ok-b', name: 'Oberkörper B', kurz: 'OK B' }] });
    expect(tage[3].einheiten[0].kurz).toBe('B & C');
  });

  it('ausgelassener Tag in der Vergangenheit ist frei, laufende Einheit heute', () => {
    const t = training({ log: [eintrag('2026-10-12', 1)], naechsteEinheit: 1, laufend: { datum: '2026-10-14' } });
    const tage = wochenKalender(t, plan, '2026-10-14');
    expect(tage[1]).toEqual({ datum: '2026-10-13', status: 'frei', einheiten: [] });
    expect(tage[2].status).toBe('laeuft');
    expect(tage[2].einheiten[0].kurz).toBe('Beine');
  });

  it('nächste Woche setzt die Rotation fort; ohne kurz gilt der Name', () => {
    const ohneKurz = { einheiten: plan.einheiten.map(({ id, name }) => ({ id, name })) };
    const tage = wochenKalender(training(), ohneKurz, '2026-10-14', 1);
    expect(tage[0].datum).toBe('2026-10-19');
    expect(tage[0].einheiten[0]).toEqual({ id: 'beine-core', name: 'Beine & Core', kurz: 'Beine & Core' });
  });

  it('unbekannte Einheit im Log stürzt nicht ab', () => {
    const tage = wochenKalender(training({ log: [eintrag('2026-10-12', 9)] }), { einheiten: plan.einheiten.slice(0, 1) }, '2026-10-14');
    expect(tage[0]).toEqual({ datum: '2026-10-12', status: 'erledigt', einheiten: [{ id: null, name: 'Einheit 9', kurz: 'E9' }] });
  });
});

describe('trainingsSumme', () => {
  const kettenById = {
    liegestuetz: { id: 'liegestuetz', stufen: [{ name: 'Liegestütz', ziel: { saetze: 3, wdh: 12 } }] },
    core: { id: 'core', stufen: [{ name: 'Unterarmstütz', ziel: { saetze: 3, sek: 45 } }] },
    mobilitaet: { id: 'mobilitaet', stufen: [{ name: 'Mobilität', routine: [{ name: 'Katze-Kuh', sek: 60 }] }] },
  };
  const log = [
    eintrag('2026-10-12', 1, [
      { kette: 'liegestuetz', stufe: 0, saetze: [12, 12, 10] },
      { kette: 'core', stufe: 0, saetze: [45, 40] },
      { kette: 'mobilitaet', stufe: 0, teil: 0, saetze: [60] },
    ]),
    eintrag('2026-10-13', 2, [
      { kette: 'gibts-nicht', stufe: 0, saetze: [99] },
      { kette: 'mobilitaet', stufe: 0, teil: 5, saetze: [60] },
      { kette: 'liegestuetz', stufe: 4, saetze: [13] },
    ]),
    eintrag('2026-10-05', 1, [{ kette: 'liegestuetz', stufe: 0, saetze: [12] }]),
  ];

  it('zählt Einheiten, Sätze, Sätze am Ziel, Wiederholungen und Sekunden im Zeitraum, ohne Mobilität', () => {
    expect(trainingsSumme(log, kettenById, '2026-10-12', '2026-10-18')).toEqual({
      einheiten: 2, saetze: 6, amZiel: 4, wdh: 47, sek: 85,
    });
  });

  it('ein Tag', () => {
    expect(trainingsSumme(log, kettenById, '2026-10-13', '2026-10-13')).toEqual({
      einheiten: 1, saetze: 1, amZiel: 1, wdh: 13, sek: 0,
    });
  });
});
```

- [ ] **Step 2: Test laufen lassen**

Run: `npx vitest run tests/uebersicht.test.js`
Expected: FAIL (`js/logik/uebersicht.js` fehlt)

- [ ] **Step 3: Logik schreiben** – `js/logik/uebersicht.js`

```js
// Übersicht: Wochenkalender (erledigt aus dem Log, ab heute Vorschau der Rotation) und Trainingssummen.
import { plusTage, montag, tageZwischen } from './datum.js';
import { zielFuer, zielwert } from './progression.js';

const kurzVon = (einheit) => ({ id: einheit.id, name: einheit.name, kurz: einheit.kurz ?? einheit.name });

// Sieben Tage ab Montag der Woche von heuteDatum (versatz: 0 = diese Woche, 1 = nächste).
// Geplant wird ab heute (oder ab morgen, wenn heute schon trainiert wurde) jeden Tag die nächste Einheit.
export function wochenKalender(training, plan, heuteDatum, versatz = 0) {
  const n = plan.einheiten.length;
  const start = plusTage(montag(heuteDatum), versatz * 7);
  const heuteErledigt = training.log.some((e) => e.datum === heuteDatum);
  const ersterPlanTag = heuteErledigt ? plusTage(heuteDatum, 1) : heuteDatum;
  return Array.from({ length: 7 }, (_, i) => {
    const datum = plusTage(start, i);
    const eintraege = training.log.filter((e) => e.datum === datum);
    if (eintraege.length) {
      const einheiten = eintraege.map((e) => {
        const einheit = plan.einheiten[e.einheit - 1];
        return einheit ? kurzVon(einheit) : { id: null, name: `Einheit ${e.einheit}`, kurz: `E${e.einheit}` };
      });
      return { datum, status: 'erledigt', einheiten };
    }
    if (datum < ersterPlanTag) return { datum, status: 'frei', einheiten: [] };
    const einheit = plan.einheiten[(training.naechsteEinheit + tageZwischen(ersterPlanTag, datum)) % n];
    let status = 'geplant';
    if (datum === heuteDatum) status = training.laufend ? 'laeuft' : 'heute';
    return { datum, status, einheiten: [kurzVon(einheit)] };
  });
}

// Summen über alle Log-Einträge von bis einschließlich bis. Mobilitäts-Teile zählen nicht mit,
// unbekannte Ketten (nach einem Daten-Update) werden übersprungen.
export function trainingsSumme(log, kettenById, von, bis) {
  const summe = { einheiten: 0, saetze: 0, amZiel: 0, wdh: 0, sek: 0 };
  for (const e of log) {
    if (e.datum < von || e.datum > bis) continue;
    summe.einheiten += 1;
    for (const u of e.uebungen) {
      const kette = kettenById[u.kette];
      if (!kette || u.teil != null) continue;
      const stufe = kette.stufen[Math.min(u.stufe, kette.stufen.length - 1)];
      if (!stufe.ziel) continue;
      const ziel = zielFuer(stufe, e.art);
      const soll = zielwert(ziel);
      for (const wert of u.saetze) {
        summe.saetze += 1;
        if (wert >= soll) summe.amZiel += 1;
        if (ziel.sek != null) summe.sek += wert;
        else summe.wdh += wert;
      }
    }
  }
  return summe;
}
```

- [ ] **Step 4: Test laufen lassen**

Run: `npx vitest run tests/uebersicht.test.js`
Expected: PASS (7 Tests)

- [ ] **Step 5: Route auf „Heute“ umstellen**

`tests/route.test.js` – ersten Test ersetzen:

```js
  it('leer und unbekannt führen zu Heute', () => {
    expect(parseRoute('')).toEqual({ bereich: 'heute', teile: [], parameter: {} });
    expect(parseRoute('#/unsinn/x')).toEqual({ bereich: 'heute', teile: [], parameter: {} });
    expect(parseRoute('#/heute')).toEqual({ bereich: 'heute', teile: [], parameter: {} });
  });
```

`js/route.js`:

```js
const BEREICHE = ['heute', 'training', 'essen', 'einkauf', 'mehr'];
// …
  if (!BEREICHE.includes(teile[0])) return { bereich: 'heute', teile: [], parameter: {} };
```

Run: `npx vitest run tests/route.test.js` → PASS

- [ ] **Step 6: Ansicht schreiben** – `js/ansichten/heute.js`

```js
// Heute: Startseite mit heutiger Einheit, Wochenstreifen (erledigt und geplant) und Zusammenfassung Tag/Woche.
import { esc, sym, zahl } from './html.js';
import { naechsteEinheit, bloeckeFuerEinheit } from '../logik/rotation.js';
import { starteEinheit } from '../logik/einheit.js';
import { heute, plusTage, montag, tageZwischen, isoWoche } from '../logik/datum.js';
import { wochenKalender, trainingsSumme } from '../logik/uebersicht.js';
import * as pause from './pause.js';

const WT = ['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So'];
const WT_LANG = ['Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag', 'Sonntag'];
const MONATE = ['Jänner', 'Februar', 'März', 'April', 'Mai', 'Juni', 'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember'];
const STATUS = { erledigt: 'erledigt', frei: 'kein Training', heute: 'heute', laeuft: 'läuft', geplant: 'geplant' };

// Nur für diese Ansicht, wird nicht gespeichert: angezeigte Woche, gewählter Tag, Zeitraum der Zusammenfassung.
const ansicht = { versatz: 0, tag: null, zeitraum: 'woche' };

const tagNr = (d) => Number(d.slice(8));
const langDatum = (d) => `${WT_LANG[tageZwischen(montag(d), d)]}, ${tagNr(d)}. ${MONATE[Number(d.slice(5, 7)) - 1]}`;
const minSek = (s) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;

export function zeige(wurzel, ctx) {
  wurzel.onclick = (e) => {
    const el = e.target.closest('[data-aktion]');
    if (el && !el.disabled) AKTIONEN[el.dataset.aktion]?.(el, ctx, wurzel);
  };
  wurzel.onchange = (e) => {
    if (e.target.name !== 'zeitraum') return;
    ansicht.zeitraum = e.target.value;
    zeige(wurzel, ctx);
  };
  const datum = heute();
  const tage = wochenKalender(ctx.zustand.training, ctx.daten.plan, datum, ansicht.versatz);
  if (!tage.some((t) => t.datum === ansicht.tag)) ansicht.tag = ansicht.versatz === 0 ? datum : tage[0].datum;
  wurzel.innerHTML = `
    <header class="titelleiste">
      <div class="titelleiste__aktionen"></div>
      <h1 class="titelleiste__titel">Heute</h1>
      <p class="titelleiste__unter">${esc(langDatum(datum))}</p>
    </header>
    ${heuteKarte(ctx, datum)}
    ${wocheHtml(tage, datum)}
    ${zusammenfassungHtml(ctx, tage)}`;
}

function heuteKarte(ctx, datum) {
  const { zustand, daten } = ctx;
  const t = zustand.training;
  const n = daten.plan.einheiten.length;
  const heuteErledigt = t.log.filter((e) => e.datum === datum).at(-1);
  if (heuteErledigt && !t.laufend) {
    const einheit = daten.plan.einheiten[heuteErledigt.einheit - 1];
    const s = trainingsSumme([heuteErledigt], daten.kettenById, datum, datum);
    return `<section class="gruppe" aria-label="Training heute"><div class="gruppe__inhalt heute-karte">
      <div class="heute-karte__kopf">
        <span class="zeile__icon">${sym('training')}</span>
        <div><h2 class="heute-karte__titel">${esc(einheit?.name ?? `Einheit ${heuteErledigt.einheit}`)}</h2>
        <p class="heute-karte__unter">Einheit ${heuteErledigt.einheit} von ${n}</p></div>
      </div>
      <p class="heute-karte__fertig">${sym('haken')}Erledigt – stark.</p>
      <p>${s.amZiel} von ${s.saetze} Sätzen am Ziel. Morgen: ${esc(naechsteEinheit(t, daten.plan).name)}.</p>
    </div></section>`;
  }
  const einheit = naechsteEinheit(t, daten.plan);
  const nummer = (t.naechsteEinheit % n) + 1;
  const bloecke = bloeckeFuerEinheit(einheit, zustand.einstellungen.stange).map((block) => {
    const namen = block.filter((id) => daten.kettenById[id]).map((id) => {
      const kette = daten.kettenById[id];
      const stufe = kette.stufen[Math.min(t.stufen[id] ?? 0, kette.stufen.length - 1)];
      return stufe.routine ? null : stufe.name;
    });
    if (namen.every((x) => x === null)) return '<li>Mobilität · 5 min</li>';
    return `<li><b>${namen.filter(Boolean).map(esc).join(' ⇄ ')}</b></li>`;
  }).join('');
  const l = t.laufend;
  const unter = l
    ? `Übung ${Math.max(l.aktiv, 0) + 1} von ${l.uebungen.length}`
    : `ca. ${esc(einheit.dauer)}`;
  return `<section class="gruppe" aria-label="Training heute"><div class="gruppe__inhalt heute-karte">
    <div class="heute-karte__kopf">
      <span class="zeile__icon">${sym('training')}</span>
      <div><h2 class="heute-karte__titel">${esc(einheit.name)}</h2>
      <p class="heute-karte__unter">Einheit ${nummer} von ${n} · ${unter}</p></div>
    </div>
    <ul class="heute-karte__bloecke">${bloecke}</ul>
    ${knopf(l, t.vorschlaege.length > 0)}
  </div></section>`;
}

// Offene Steigerungsvorschläge stehen auf der Training-Startseite; dann führt der Knopf dorthin statt direkt zu starten.
function knopf(laufend, vorschlaege) {
  const klasse = 'knopf knopf--gefuellt knopf--gross knopf--breit';
  if (laufend) return `<a class="${klasse}" href="#/training">Weiter trainieren</a>`;
  if (vorschlaege) return `<a class="${klasse}" href="#/training">Zum Training</a>`;
  return `<button class="${klasse}" type="button" data-aktion="starten">Training starten</button>`;
}

function wocheHtml(tage, datum) {
  const { versatz } = ansicht;
  const name = { 0: 'Diese Woche', 1: 'Nächste Woche', '-1': 'Letzte Woche' }[versatz] ?? `${tagNr(tage[0].datum)}.–${tagNr(tage[6].datum)}.`;
  const knoepfe = tage.map((t, i) => {
    const klasse = ['tag', t.datum === datum && t.status !== 'erledigt' ? 'tag--heute' : '',
      t.status === 'erledigt' ? 'tag--erledigt' : '', t.status === 'frei' ? 'tag--frei' : ''].filter(Boolean).join(' ');
    const kurz = t.einheiten.map((e) => e.kurz).join(' + ');
    const marke = t.status === 'erledigt' ? `${sym('haken')}${esc(kurz)}` : t.einheiten.length ? esc(kurz) : '–';
    const vorlesen = `${WT_LANG[i]} ${tagNr(t.datum)}.: ${t.einheiten.map((e) => e.name).join(' und ') || 'kein Training'}, ${STATUS[t.status]}`;
    return `<button class="${klasse}" type="button" data-aktion="tag" data-tag="${t.datum}" aria-pressed="${t.datum === ansicht.tag}" aria-label="${esc(vorlesen)}">
      <span class="tag__wt">${WT[i]}</span><span class="tag__zahl">${tagNr(t.datum)}</span><span class="tag__marke">${marke}</span>
    </button>`;
  }).join('');
  return `<section class="gruppe" aria-labelledby="woche-titel">
    <div class="gruppe__kopf woche-kopf">
      <h2 id="woche-titel">${esc(name)} · KW ${Number(isoWoche(tage[0].datum).slice(6))}</h2>
      <div class="woche-kopf__pfeile">
        <button class="knopf knopf--schlicht" type="button" data-aktion="woche" data-schritt="-1" aria-label="Vorige Woche">${sym('zurueck')}</button>
        <button class="knopf knopf--schlicht" type="button" data-aktion="woche" data-schritt="1" aria-label="Nächste Woche"${versatz >= 4 ? ' disabled' : ''}>${sym('chevron')}</button>
      </div>
    </div>
    <div class="gruppe__inhalt woche" role="group" aria-label="Tage der Woche">${knoepfe}</div>
    <p class="gruppe__fuss">Ab heute geplant nach der Rotation. Lässt du einen Tag aus, rückt alles einen Tag weiter.</p>
  </section>`;
}

function kachel(name, zahlText, einheit, unter, erreicht = false) {
  return `<div class="kachel${erreicht ? ' kachel--erreicht' : ''}">
    <span class="kachel__name">${esc(name)}</span>
    <span><span class="kachel__zahl">${esc(zahlText)}</span>${einheit ? `<span class="kachel__einheit">${esc(einheit)}</span>` : ''}</span>
    ${unter ? `<span class="kachel__unter">${esc(unter)}</span>` : ''}
  </div>`;
}

function kachelnHtml(s, unterEinheiten) {
  return `<div class="kacheln">
    ${kachel('Einheiten', String(s.einheiten), '', unterEinheiten)}
    ${kachel('Sätze am Ziel', String(s.amZiel), `von ${s.saetze}`, s.saetze ? `${Math.round((s.amZiel / s.saetze) * 100)} %` : '', s.saetze > 0 && s.amZiel === s.saetze)}
    ${kachel('Wiederholungen', zahl(s.wdh), '', '')}
    ${kachel('Haltezeit', minSek(s.sek), 'min', '')}
  </div>`;
}

const leer = (titel, text) => `<div class="gruppe__inhalt leer"><p class="leer__titel">${esc(titel)}</p><p class="leer__text">${esc(text)}</p></div>`;

function zusammenfassungHtml(ctx, tage) {
  const { zustand, daten } = ctx;
  const woche = ansicht.zeitraum === 'woche';
  const t = tage.find((x) => x.datum === ansicht.tag);
  let inhalt;
  if (woche) {
    const s = trainingsSumme(zustand.training.log, daten.kettenById, tage[0].datum, tage[6].datum);
    const offen = tage.filter((x) => x.status !== 'erledigt' && x.status !== 'frei').length;
    inhalt = s.einheiten || !offen
      ? kachelnHtml(s, offen ? `${offen} noch geplant` : 'Woche abgeschlossen')
      : leer('Noch nichts trainiert', `${offen} Einheiten geplant. Die Woche liegt vor dir.`);
  } else if (t.status === 'erledigt') {
    inhalt = kachelnHtml(trainingsSumme(zustand.training.log, daten.kettenById, t.datum, t.datum), t.einheiten.map((e) => e.name).join(', '));
  } else if (t.status === 'frei') {
    inhalt = leer('Kein Training', 'An diesem Tag wurde nichts eingetragen.');
  } else {
    inhalt = geplantHtml(ctx, t);
  }
  return `<section class="gruppe" aria-labelledby="zf-titel">
    <h2 class="gruppe__kopf" id="zf-titel">Training · ${esc(woche ? 'Woche' : langDatum(t.datum))}</h2>
    <div class="segment-rahmen uebersicht-zeitraum">
      <fieldset class="segment" style="border: 0; margin: 0">
        <legend class="nur-vorlesen">Zeitraum</legend>
        <input type="radio" name="zeitraum" id="zr-tag" value="tag"${woche ? '' : ' checked'}><label for="zr-tag">Tag</label>
        <input type="radio" name="zeitraum" id="zr-woche" value="woche"${woche ? ' checked' : ''}><label for="zr-woche">Woche</label>
      </fieldset>
    </div>
    ${inhalt}
  </section>`;
}

// Geplanter Tag: Übungen der Einheit mit den heutigen Stufen (Vorschau, Stufen können bis dahin steigen).
function geplantHtml(ctx, t) {
  const { zustand, daten } = ctx;
  const einheit = daten.plan.einheiten.find((e) => e.id === t.einheiten[0].id);
  const zeilen = bloeckeFuerEinheit(einheit, zustand.einstellungen.stange).flat().filter((id) => daten.kettenById[id]).map((id) => {
    const kette = daten.kettenById[id];
    const stufe = kette.stufen[Math.min(zustand.training.stufen[id] ?? 0, kette.stufen.length - 1)];
    const wert = stufe.routine ? `${stufe.routine.length} Übungen` : `${stufe.ziel.saetze} × ${stufe.ziel.wdh ?? `${stufe.ziel.sek} s`}`;
    return `<li><div class="zeile"><div class="zeile__haupt"><div class="zeile__titel">${esc(stufe.routine ? kette.name : stufe.name)}</div></div>
      <span class="zeile__wert">${esc(wert)}</span></div></li>`;
  }).join('');
  return `<ul class="gruppe__inhalt">${zeilen}</ul>
    <p class="gruppe__fuss">${t.status === 'geplant' ? 'Vorschau mit deinen aktuellen Stufen.' : 'Steht heute an.'}</p>`;
}

const AKTIONEN = {
  starten(el, ctx) {
    pause.tonVorbereiten();
    ctx.aendern((z) => {
      const einheit = naechsteEinheit(z.training, ctx.daten.plan);
      z.training.laufend = starteEinheit(z.training, einheit, ctx.daten.kettenById, z.einstellungen.stange, heute());
      z.training.vorschlaege = [];
    });
    ctx.navigiere('#/training');
    window.scrollTo(0, 0);
  },
  tag(el, ctx, wurzel) {
    ansicht.tag = el.dataset.tag;
    ansicht.zeitraum = 'tag';
    zeige(wurzel, ctx);
  },
  woche(el, ctx, wurzel) {
    ansicht.versatz += Number(el.dataset.schritt);
    ansicht.tag = null;
    zeige(wurzel, ctx);
  },
};
```

- [ ] **Step 7: Einbinden**

`js/app.js`:

```js
import * as heuteAnsicht from './ansichten/heute.js';
// …
const ANSICHTEN = { heute: heuteAnsicht, training, mehr };   // später essen, einkauf dazu
// in zeichnen():
  if (!ANSICHTEN[route.bereich]) route = { bereich: 'heute', teile: [], parameter: {} };
// in start():
  // Ohne Adresse: laufende Einheit geht vor, sonst die Übersicht.
  if (!location.hash) history.replaceState(null, '', ctx.zustand.training.laufend ? '#/training' : '#/heute');
```

`index.html`: nach `css/komponenten.css` die Zeile `<link rel="stylesheet" href="css/uebersicht.css">`; in der Tab-Leiste als **ersten** Tab:

```html
    <a class="tableiste__tab" href="#/heute" data-bereich="heute">
      <svg class="symbol" aria-hidden="true"><use href="bilder/symbole.svg#heute"/></svg>Heute
    </a>
```

`bilder/symbole.svg` (vor `zurueck`):

```xml
  <symbol id="heute" viewBox="0 0 24 24"><rect x="3.5" y="5" width="17" height="15.5" rx="2.5"/><path d="M3.5 10h17M8 3v4M16 3v4"/><path d="M8 14h.01M12 14h.01M16 14h.01M8 17h.01M12 17h.01" stroke-width="2.4"/></symbol>
```

`data/trainingsplan.json`: pro Einheit nach `"name"` ein `"kurz"`: `"OK A"`, `"Beine"`, `"OK B"`, `"B & C"`.

`sw.js`, Liste `APP`: `"css/uebersicht.css"`, `"js/logik/uebersicht.js"`, `"js/ansichten/heute.js"` ergänzen (der Test in `tests/sw.test.js` verlangt jede JS-Datei).

Run: `npm test` → alle Testdateien PASS (Stand Scheibe 1: 11 Dateien, 76 Tests).

- [ ] **Step 8: Fotos und Klickprobe** (Server läuft)

```bash
for t in hell dunkel; do
  node tools/foto.mjs "index.html#/heute" fotos/heute-leer-$t.png $t 1400
  node tools/foto.mjs "index.html#/heute" fotos/heute-voll-$t.png $t 1400 voll
  node tools/foto.mjs "index.html#/heute" fotos/heute-laufend-$t.png $t 1400 laufend
done
```

Prüfen: kein waagrechtes Scrollen, Streifen-Kürzel passen in 7 Spalten, Tipp-Flächen ≥ 48 px (Tage, Pfeile), Kontrast hell/dunkel, Grün nur für erledigt/alle Sätze am Ziel. Klickprobe (375×812): leerer Speicher → App öffnet „Heute“ → „Training starten“ landet in der laufenden Einheit → Tab „Heute“ zeigt „Weiter trainieren“ → Neuladen öffnet wieder Training. Tag im Streifen antippen → Segment springt auf „Tag“. Pfeil → nächste Woche mit Vorschau, Leerzustand bei „Woche“.

- [ ] **Step 9: `DESIGN.md` ergänzen** (Abschnitt Components, kurz im vorhandenen Stil)
  - **Heute-Karte** (`.heute-karte`): Zelle mit 30-px-Zeilensymbol, Titel 3, Blöcke der Einheit in Unter-Schrift, großer gefüllter Knopf; erledigt: grüner Haken „Erledigt – stark.“ statt Knopf.
  - **Wochenstreifen** (`.woche`, `.tag`): 7 Spalten Mo–So, Ziffer 17 px, heute Tint halbfett, gewählter Tag gefüllter Tint-Kreis 34 px, darunter Kürzel 11 px (erledigt Grün mit Haken, vergangen ohne Training Strich in Text 3). Ganze Spalte ist Tipp-Fläche (≥ 84 px).
  - **Kachel** (`.kacheln`, `.kachel`): 2-spaltiges Raster, Zelle, Name in Unter/Text 2, Wert in Zahl mittel (28 px gerundet), Einheit und Fußzeile in Text 2; Grün nur bei „alles erreicht“.

- [ ] **Step 10: Commit**

```bash
git add js/logik/uebersicht.js js/ansichten/heute.js tests/uebersicht.test.js js/route.js tests/route.test.js js/app.js index.html sw.js bilder/symbole.svg data/trainingsplan.json DESIGN.md
git commit -m "feat: Startseite Heute mit Wochenkalender und Trainings-Zusammenfassung"
```

---

### Task 23B: Übersicht – Essen, Einkauf, Gewicht

Erst umsetzen, wenn die verwendeten Module existieren: Essen/Einkauf nach Scheibe 2 (Tasks 6, 7, 10), Gewicht nach Scheibe 3 (Task 8). Teile vorher einzeln einbauen ist erlaubt; jeder Block blendet sich selbst aus, wenn Daten fehlen.

**Files:**
- Modify: `js/ansichten/heute.js`

**Interfaces:**
- Consumes: `typischerTag(wochenplan, rezepteById)` (Task 7), `bedarf`, `einkaufsliste` (Task 6), `wochenschnitte`, `trendProMonat` (Task 8), `daten.rezepteById`, `daten.zutaten` (Task 10; Namen an `daten.js` angleichen).

- [ ] **Step 1: Blöcke ergänzen** – in `js/ansichten/heute.js` (Imports oben, Funktionen unter `zusammenfassungHtml`), Darstellung wie `muster/heute.html`:

```js
// In js/ansichten/heute.js ergänzen (Task 23B). Namen von daten.* wie in Task 18/19 verwenden.
import { typischerTag } from '../logik/naehrwerte.js';
import { bedarf, einkaufsliste } from '../logik/einkaufsliste.js';
import { wochenschnitte, trendProMonat } from '../logik/gewicht.js';

function naehrwertHtml(name, wert, ziel, einheit) {
  const anteil = ziel ? wert / ziel : 0;
  return `<div class="naehrwert${wert >= ziel ? ' naehrwert--erreicht' : ''}" style="--anteil: ${anteil.toFixed(3)}">
    <div class="naehrwert__kopf"><span class="naehrwert__name">${esc(name)}</span>
      <span class="naehrwert__zahl"><b>${zahl(wert)}</b> von ${zahl(ziel)} ${esc(einheit)}</span></div>
    <div class="naehrwert__bahn" aria-hidden="true"><div class="naehrwert__balken"></div><div class="naehrwert__ziel"></div></div>
  </div>`;
}

function essenHtml(ctx) {
  const { zustand, daten } = ctx;
  if (!daten.rezepteById) return '';
  const plan = zustand.essen.wochenplan;
  if (!plan.abend.length && !plan.jause.length) {
    return `<section class="gruppe"><h2 class="gruppe__kopf">Essen</h2>
      <div class="gruppe__inhalt"><a class="zeile" href="#/essen"><div class="zeile__haupt"><div class="zeile__titel">Wochenplan erstellen</div></div>
      ${sym('chevron', 'zeile__chevron')}</a></div></section>`;
  }
  const { summe } = typischerTag(plan, daten.rezepteById);
  const ziele = zustand.einstellungen.ziele;
  return `<section class="gruppe"><h2 class="gruppe__kopf">Essen</h2>
    <a class="gruppe__inhalt" href="#/essen" style="display: block; color: inherit; text-decoration: none">
      ${naehrwertHtml('Kalorien', Math.round(summe.kcal), ziele.kcal, 'kcal')}
      ${naehrwertHtml('Protein', Math.round(summe.protein), ziele.protein, 'g')}
    </a>
    <p class="gruppe__fuss">Ein typischer Tag laut Wochenplan.</p>
  </section>`;
}

function einkaufZeile(ctx) {
  const { zustand, daten } = ctx;
  if (!daten.rezepteById) return '';
  const liste = einkaufsliste(bedarf(zustand.essen.wochenplan, daten.rezepteById), daten.zutaten, zustand.einstellungen, zustand.essen.aufgebraucht);
  const zeilen = liste.flatMap((m) => m.kategorien.flatMap((k) => k.zeilen.map((z) => ({ markt: m.markt, ...z }))));
  if (!zeilen.length) return '';
  const offen = zeilen.filter((z) => !zustand.essen.abgehakt[z.schluessel]);
  const maerkte = new Set(offen.map((z) => z.markt)).size;
  const unter = offen.length ? `${offen.length} offen, ${maerkte} ${maerkte === 1 ? 'Markt' : 'Märkte'}` : 'Alles abgehakt';
  return `<li><a class="zeile zeile--mit-symbol" href="#/einkauf">
    <span class="zeile__icon">${sym('einkauf')}</span>
    <div class="zeile__haupt"><div class="zeile__titel">Einkaufsliste</div><div class="zeile__unter">${esc(unter)}</div></div>
    <span class="zeile__wert">${zeilen.length - offen.length} von ${zeilen.length}</span>${sym('chevron', 'zeile__chevron')}
  </a></li>`;
}

function gewichtZeile(ctx) {
  const { gewicht } = ctx.zustand;
  if (!gewicht.length) return '';
  const woche = wochenschnitte(gewicht).at(-1);
  const trend = trendProMonat(gewicht);
  const unter = trend == null ? `${woche.anzahl}× gewogen diese Woche` : `${trend >= 0 ? '+' : '−'}${zahl(Math.abs(trend), 1)} kg pro Monat`;
  return `<li><a class="zeile zeile--mit-symbol" href="#/mehr/gewicht">
    <span class="zeile__icon">${sym('waage')}</span>
    <div class="zeile__haupt"><div class="zeile__titel">Gewicht</div><div class="zeile__unter">${esc(unter)}</div></div>
    <span class="zeile__wert">${zahl(woche.kg, 1)} kg</span>${sym('chevron', 'zeile__chevron')}
  </a></li>`;
}

// In zeige() nach zusammenfassungHtml(ctx, tage):
//   ${essenHtml(ctx)}
//   ${einkaufGewichtHtml(ctx)}
function einkaufGewichtHtml(ctx) {
  const zeilen = einkaufZeile(ctx) + gewichtZeile(ctx);
  return zeilen ? `<section class="gruppe" aria-label="Einkauf und Gewicht"><ul class="gruppe__inhalt">${zeilen}</ul></section>` : '';
}
```

Leerer Wochenplan → nur eine Zeile „Wochenplan erstellen“. Einkauf zählt dieselben Zeilen wie die Einkauf-Ansicht (Grundvorrat-Schalter wirkt über `einstellungen`). Gewicht ohne Einträge → Zeile fehlt. Falls die Mehr-Ansicht keine eigene Gewicht-Adresse hat, auf `#/mehr` verlinken.

- [ ] **Step 2: Fotos** wie 23A Step 8 mit Zustand `voll` (dieser enthält ab Scheibe 2/3 Wochenplan und Gewicht), hell und dunkel prüfen; Nährwert-Balken mit Ziel bei 80 %.

- [ ] **Step 3: Alle Tests** – Run: `npm test` → PASS

- [ ] **Step 4: Commit**

```bash
git add js/ansichten/heute.js
git commit -m "feat: Übersicht zeigt Essen, Einkaufsliste und Gewicht"
```
