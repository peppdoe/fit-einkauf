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
