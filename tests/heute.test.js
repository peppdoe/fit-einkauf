import { describe, it, expect, beforeAll } from 'vitest';
import { readFileSync } from 'node:fs';
import { verknuepfe } from '../js/daten.js';
import { standardZustand } from '../js/speicher.js';
import { heute, plusTage } from '../js/logik/datum.js';

// Die Ansicht wird ohne Browser gezeichnet: pause.js braucht beim Laden nur document.addEventListener.
let zeige;
beforeAll(async () => {
  globalThis.document = { addEventListener() {}, getElementById: () => null };
  ({ zeige } = await import('../js/ansichten/heute.js'));
});

const lies = (name) => JSON.parse(readFileSync(new URL(`../data/${name}.json`, import.meta.url), 'utf8'));
const { daten } = verknuepfe({
  zutaten: lies('zutaten'), rezepte: lies('rezepte'), uebungen: lies('uebungen'), plan: lies('trainingsplan'), aktionen: null,
});

function zeichne(zustand) {
  const wurzel = { innerHTML: '' };
  zeige(wurzel, { zustand, daten, aendern() {}, navigiere() {} });
  return wurzel.innerHTML;
}

describe('Ansicht Heute', () => {
  it('zeigt die Export-Erinnerung, wenn eine Sicherung fällig ist', () => {
    const z = standardZustand();
    z.training.log = [{ datum: plusTage(heute(), -3), einheit: 1, art: 'schwer', uebungen: [] }];
    const html = zeichne(z);
    expect(html).toContain('Noch keine Sicherung');
    expect(html).toContain('data-aktion="export"');
  });

  it('keine Erinnerung nach frischer Sicherung', () => {
    const z = standardZustand();
    z.training.log = [{ datum: plusTage(heute(), -3), einheit: 1, art: 'schwer', uebungen: [] }];
    z.letzterExport = heute();
    expect(zeichne(z)).not.toContain('data-aktion="export"');
  });

  it('Ruhetag nach gestrigem Training: Hinweis in der Karte und im Streifen', () => {
    const z = standardZustand();
    z.training.log = [{ datum: plusTage(heute(), -1), einheit: 1, art: 'schwer', uebungen: [] }];
    z.training.naechsteEinheit = 1;
    z.letzterExport = heute();
    const html = zeichne(z);
    expect(html).toContain('Heute ist Ruhetag laut Plan');
    expect(html).toContain('>Ruhe<');
    expect(html).toContain('nach jeder Einheit ein Ruhetag');
  });
});
