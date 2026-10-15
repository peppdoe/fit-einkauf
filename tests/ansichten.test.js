import { describe, it, expect, beforeAll } from 'vitest';
import { readFileSync } from 'node:fs';
import { verknuepfe } from '../js/daten.js';
import { exportFaellig } from '../js/speicher.js';
import { heute } from '../js/logik/datum.js';
import { KATEGORIEN } from '../js/logik/einkaufsliste.js';

// Ansichten ohne Browser zeichnen (wie tests/heute.test.js); Testzustand "voll" aus tools/zustaende/.
const ansichten = {};
beforeAll(async () => {
  globalThis.document = { addEventListener() {}, getElementById: () => ({ innerHTML: '', classList: { remove() {} } }) };
  globalThis.cancelAnimationFrame = () => {};
  for (const name of ['training', 'mehr', 'einkauf', 'heute']) ansichten[name] = await import(`../js/ansichten/${name}.js`);
});

const lies = (pfad) => JSON.parse(readFileSync(new URL(`../${pfad}`, import.meta.url), 'utf8'));
const { daten } = verknuepfe({
  zutaten: lies('data/zutaten.json'), rezepte: lies('data/rezepte.json'), uebungen: lies('data/uebungen.json'), plan: lies('data/trainingsplan.json'), aktionen: null,
});
const voll = () => lies('tools/zustaende/voll.json');

function zeichne(name, zustand, teile = [], parameter = {}) {
  const wurzel = { innerHTML: '' };
  ansichten[name].zeige(wurzel, { zustand, daten, aendern() {}, navigiere() {} }, { teile, parameter });
  return wurzel.innerHTML;
}

describe('Export-Erinnerung nur auf Heute', () => {
  it('Testzustand hat eine fällige Sicherung', () => {
    expect(exportFaellig(voll(), heute())).toBe(true);
  });
  it('Heute zeigt sie', () => {
    expect(zeichne('heute', voll())).toContain('Letzte Sicherung vor');
  });
  it('Training zeigt sie nicht', () => {
    expect(zeichne('training', voll())).not.toContain('Letzte Sicherung vor');
  });
  it('Mehr zeigt sie nicht, aber den Hinweis im Abschnitt Daten', () => {
    const html = zeichne('mehr', voll());
    expect(html).not.toContain('Letzte Sicherung vor');
    expect(html).toContain('Letzte Sicherung: ');
  });
});

describe('Einkauf', () => {
  it('Kategorie heißt „Konserven & Trockenes“, keine Zutat steht mehr unter „Vorrat“', () => {
    const kategorien = new Set(Object.values(daten.zutaten).map((z) => z.kategorie));
    expect(kategorien.has('Vorrat')).toBe(false);
    expect(kategorien.has('Konserven & Trockenes')).toBe(true);
    for (const k of kategorien) expect(KATEGORIEN, k).toContain(k);
  });
  it('Butter ist Grundvorrat', () => {
    expect(daten.zutaten.butter.grundvorrat).toBe(true);
  });
  it('Zähler je Markt zeigt offene Artikel; zusammen ergeben sie die Zahl in der Überschrift', () => {
    const html = zeichne('einkauf', voll());
    const gesamt = Number(html.match(/· (\d+) offen/)[1]);
    const jeMarkt = [...html.matchAll(/<span class="marktkopf__anzahl"[^>]*>(\d+)<\/span>/g)].map((m) => Number(m[1]));
    expect(jeMarkt.length).toBeGreaterThan(0);
    expect(jeMarkt.reduce((a, b) => a + b, 0)).toBe(gesamt);
    expect(Object.keys(voll().essen.abgehakt).length).toBeGreaterThan(0);
  });
});

describe('Verlauf', () => {
  it('Gruppen ohne Einträge zeigen „Noch nicht trainiert“', () => {
    const html = zeichne('training', voll(), ['verlauf']);
    const gruppe = (name) => html.split('<section class="gruppe">').find((s) => s.includes(`>${name}</h2>`));
    expect(gruppe('Drücken vertikal')).toContain('Noch nicht trainiert');
    expect(gruppe('Drücken horizontal')).not.toContain('Noch nicht trainiert');
  });
});

describe('Abneigungen', () => {
  it('Anzeige mit großem Anfangsbuchstaben, gespeichert bleibt klein', () => {
    const z = voll();
    const html = zeichne('mehr', z);
    expect(html).toContain('>Curry<');
    expect(html).toContain('>Tofu<');
    expect(html).toContain('data-wert="curry"');
    expect(z.einstellungen.abneigungen).toEqual(['curry', 'tofu']);
  });
});
