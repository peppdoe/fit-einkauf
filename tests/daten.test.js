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
  it('meldet unbekannte Ketten im Plan (auch in Paaren, außer dem Platzhalter ziehen) und markiert Figuren', () => {
    const { daten, warnungen } = verknuepfe({
      zutaten: {}, rezepte: { rezepte: [] },
      uebungen: { ketten: [{ id: 'core', name: 'Core', stufen: [{ name: 'Unterarmstütz', ziel: { saetze: 3, sek: 45 }, hinweise: ['a', 'b'] }] }] },
      plan: { einheiten: [{ id: 'x', name: 'X', art: 'schwer', ketten: [['core', 'ziehen'], 'gibtsnicht'], dauer: '1 min' }] },
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
