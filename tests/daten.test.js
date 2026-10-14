import { describe, it, expect } from 'vitest';
import { verknuepfe, ladeDaten } from '../js/daten.js';

const leererPlan = { einheiten: [] };
const keineUebungen = { ketten: [] };

describe('verknuepfe', () => {
  it('meldet unbekannte Ketten im Plan (auch in Paaren, außer dem Platzhalter ziehen)', () => {
    const { daten, warnungen } = verknuepfe({
      uebungen: { ketten: [{ id: 'core', name: 'Core', stufen: [{ name: 'Unterarmstütz', ziel: { saetze: 3, sek: 45 }, hinweise: ['a', 'b'] }] }] },
      plan: { einheiten: [{ id: 'x', name: 'X', art: 'schwer', ketten: [['core', 'ziehen'], 'gibtsnicht'], dauer: '1 min' }] },
    });
    expect(warnungen).toEqual(['Einheit X: unbekannte Kette gibtsnicht']);
    expect(daten.kettenById.core.name).toBe('Core');
    expect(daten.plan.einheiten).toHaveLength(1);
  });
});

describe('ladeDaten', () => {
  const antwort = (wert, ok = true) => Promise.resolve({ ok, status: ok ? 200 : 404, json: () => Promise.resolve(wert) });
  const dateien = { uebungen: keineUebungen, trainingsplan: leererPlan };
  it('lädt Übungen und Trainingsplan', async () => {
    const holen = (url) => antwort(dateien[url.replace('data/', '').replace('.json', '')]);
    const { daten } = await ladeDaten(holen);
    expect(daten.ketten).toEqual([]);
  });
  it('fehlende Pflichtdatei wirft', async () => {
    const holen = (url) => (url.includes('trainingsplan') ? antwort(null, false) : antwort(keineUebungen));
    await expect(ladeDaten(holen)).rejects.toThrow('data/trainingsplan.json: 404');
  });
});
