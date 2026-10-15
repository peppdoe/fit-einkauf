import { describe, it, expect, beforeAll } from 'vitest';
import { readFileSync } from 'node:fs';
import { verknuepfe } from '../js/daten.js';

// Ansichten ohne Browser: pause.js braucht beim Laden nur document.addEventListener, das Blatt eine Wurzel.
const element = () => ({ addEventListener() {}, focus() {}, style: {} });
const blattWurzel = { innerHTML: '', firstElementChild: { ...element(), firstElementChild: element() } };
const bodyKlassen = new Set();
let zeige, figurMini, soGehtsOeffnen, blatt;
beforeAll(async () => {
  const leer = { innerHTML: '', classList: { remove() {} } };
  globalThis.document = { addEventListener() {}, getElementById: (id) => (id === 'blatt-wurzel' ? blattWurzel : leer), activeElement: null,
    body: { classList: { add: (k) => bodyKlassen.add(k), remove: (k) => bodyKlassen.delete(k) } } };
  globalThis.cancelAnimationFrame = () => {};
  ({ zeige } = await import('../js/ansichten/training.js'));
  ({ figurMini, soGehtsOeffnen } = await import('../js/ansichten/figur-ansicht.js'));
  blatt = await import('../js/ansichten/blatt.js');
});

const lies = (pfad) => JSON.parse(readFileSync(new URL(`../${pfad}`, import.meta.url), 'utf8'));
const laden = (aendern = () => {}) => {
  const uebungen = lies('data/uebungen.json');
  aendern(uebungen);
  return verknuepfe({
    zutaten: lies('data/zutaten.json'), rezepte: lies('data/rezepte.json'), uebungen, plan: lies('data/trainingsplan.json'), aktionen: null,
  });
};

// Testzustand "laufend": aktiv ist ziehen-stange, Stufe 0 (Negativ-Klimmzug).
function zeichne(daten) {
  const wurzel = { innerHTML: '' };
  zeige(wurzel, { zustand: lies('tools/zustaende/laufend.json'), daten, aendern() {}, navigiere() {} }, { teile: [] });
  return wurzel.innerHTML;
}

describe('Übungsfigur in der Karte', () => {
  it('zeigt die Figur (Start und Ende) mit Knopf zum So-geht\'s-Blatt', () => {
    const { daten } = laden();
    const html = zeichne(daten);
    expect(html).toContain('class="figur-mini"');
    expect(html).toContain('data-aktion="so-gehts"');
    expect(html).toContain('figur-mini__start');
    expect(html).toContain('figur-mini__ende');
  });

  it('zeigt keine Figur, wenn die Figur fehlerhaft ist (figurOk false)', () => {
    const { daten, warnungen } = laden((u) => {
      u.ketten.find((k) => k.id === 'ziehen-stange').stufen[0].figur.start.huefte = [500, 500];
    });
    expect(daten.kettenById['ziehen-stange'].stufen[0].figurOk).toBe(false);
    expect(warnungen.some((w) => w.startsWith('ziehen-stange/0'))).toBe(true);
    const html = zeichne(daten);
    expect(html).toContain('uebung__name');
    expect(html).not.toContain('figur-mini');
  });

  it('figurMini liefert leeren Text ohne Figur und maskiert den Namen', () => {
    expect(figurMini({ name: 'X', figur: null })).toBe('');
    const { daten } = laden();
    const stufe = daten.kettenById['ziehen-stange'].stufen[0];
    expect(figurMini({ name: '<b>', figur: stufe.figur })).toContain('So geht\'s: &lt;b&gt;');
  });

  it('Kästchen nutzt den zugeschnittenen Ausschnitt, Strich sichtbar ca. 2,8 px', () => {
    const { daten } = laden();
    const html = figurMini({ name: 'X', figur: daten.kettenById['ziehen-stange'].stufen[0].figur });
    expect(html).not.toContain('viewBox="0 0 120 84"');
    const seite = Number(html.match(/viewBox="\S+ \S+ (\S+) \1"/)[1]);
    expect(seite).toBeLessThan(100);
    const strich = Number(html.match(/stroke-width="([\d.]+)"\/><circle/)[1]);
    expect((strich * 96) / seite).toBeCloseTo(2.8, 1);
  });
});

describe('So-geht\'s-Blatt', () => {
  const info = (figur) => ({ name: 'Negativ-Klimmzug', figur, hinweise: ['Eins', 'Zwei <3'], achtung: 'Langsam ablassen.' });

  it('zeigt beide Posen, Hinweise und "Achte darauf"', () => {
    const { daten } = laden();
    soGehtsOeffnen(info(daten.kettenById['ziehen-stange'].stufen[0].figur));
    const html = blattWurzel.innerHTML;
    expect(html).toContain('So geht&#39;s: Negativ-Klimmzug');
    expect(html).toContain('<figcaption>Start</figcaption>');
    expect(html).toContain('<figcaption>Ende</figcaption>');
    expect(html).toContain('<li>Zwei &lt;3</li>');
    expect(html).toContain('Achte darauf:</strong> Langsam ablassen.');
  });

  it('blendet die Tab-Leiste aus, solange das Blatt offen ist', () => {
    soGehtsOeffnen(info(null));
    expect(bodyKlassen.has('blatt-offen')).toBe(true);
    blatt.schliesse();
    expect(bodyKlassen.has('blatt-offen')).toBe(false);
  });

  it('ohne Figur nur Hinweise, ohne achtung kein Hinweisfeld', () => {
    soGehtsOeffnen({ ...info(null), achtung: null });
    const html = blattWurzel.innerHTML;
    expect(html).not.toContain('posen');
    expect(html).toContain('<li>Eins</li>');
    expect(html).not.toContain('Achte darauf');
  });
});
