import { describe, it, expect } from 'vitest';
import { typischerTag, jausenAnzahl } from '../js/logik/naehrwerte.js';

const r = (id, typ, kcal, protein, extra = {}) => ({ id, typ, portionen: 1, pro_portion: { kcal, protein_g: protein }, ...extra });
const rezepteById = {
  a1: r('a1', 'abend', 1100, 73), a2: r('a2', 'abend', 1160, 62),
  j1: r('j1', 'jause', 715, 44, { herkunft: 'mitnehmen' }), j4: r('j4', 'jause', 610, 23, { herkunft: 'spar' }),
  j5: r('j5', 'jause', 650, 30, { herkunft: 'mitnehmen' }),
  reste: { id: 'reste', typ: 'jause', herkunft: 'reste', portionen: 1 },
  s: r('s', 'snack', 605, 41), e1: r('e1', 'extra', 605, 24), e2: r('e2', 'extra', 565, 19), e3: r('e3', 'extra', 560, 20),
};
const leer = { kw: null, abend: [], jause: [], snack: null, extra: [] };

describe('typischerTag (Wochensumme / 7)', () => {
  it('jeder Teil ist seine Wochensumme geteilt durch 7', () => {
    const t = typischerTag({
      ...leer,
      abend: [{ rezept: 'a1', portionen: 4 }, { rezept: 'a2', portionen: 4 }],
      jause: [{ rezept: 'j1', anzahl: 3 }, { rezept: 'j4', anzahl: 2 }],
      snack: { rezept: 's', anzahl: 7 },
      extra: [{ rezept: 'e1', anzahl: 4 }, { rezept: 'e2', anzahl: 3 }],
    }, rezepteById);
    expect(t.abend.kcal).toBeCloseTo(9040 / 7, 5);
    expect(t.abend.protein).toBeCloseTo(540 / 7, 5);
    expect(t.jause.kcal).toBeCloseTo(3365 / 7, 5);
    expect(t.snack).toEqual({ kcal: 605, protein: 41 });
    expect(t.extra.kcal).toBeCloseTo(4115 / 7, 5);
    expect(t.summe.kcal).toBeCloseTo(2965, 5);
    expect(t.summe.protein).toBeCloseTo(1158 / 7, 5);
  });
  it('Beispiel aus dem Review: 4 Jausen pro Woche zählen nicht wie 7', () => {
    const t = typischerTag({
      ...leer,
      abend: [{ rezept: 'a1', portionen: 7 }],
      jause: [{ rezept: 'j5', anzahl: 4 }],
      snack: { rezept: 's', anzahl: 7 },
      extra: [{ rezept: 'e3', anzahl: 7 }],
    }, rezepteById);
    expect(Math.round(t.summe.kcal)).toBe(2636);
  });
  it('Snack zählt mit seiner Anzahl', () => {
    expect(typischerTag({ ...leer, snack: { rezept: 's', anzahl: 5 } }, rezepteById).snack.kcal).toBeCloseTo(605 * 5 / 7, 5);
  });
  it('Reste-Jause zählt mit einer Ø-Abendportion', () => {
    const t = typischerTag({ ...leer, abend: [{ rezept: 'a1', portionen: 4 }], jause: [{ rezept: 'reste', anzahl: 1 }] }, rezepteById);
    expect(t.jause.kcal).toBeCloseTo(1100 / 7, 5);
    expect(t.jause.protein).toBeCloseTo(73 / 7, 5);
  });
  it('gelöschte Rezepte werden ignoriert, leerer Plan ergibt 0', () => {
    const t = typischerTag({ ...leer, abend: [{ rezept: 'a1', portionen: 7 }, { rezept: 'weg', portionen: 4 }] }, rezepteById);
    expect(t.abend).toEqual({ kcal: 1100, protein: 73 });
    expect(typischerTag(leer, rezepteById).summe).toEqual({ kcal: 0, protein: 0 });
    expect(typischerTag({ ...leer, snack: { rezept: 'weg', anzahl: 7 } }, rezepteById).snack).toEqual({ kcal: 0, protein: 0 });
  });
});

describe('jausenAnzahl', () => {
  it('zählt alle eingeplanten Jausen', () => {
    expect(jausenAnzahl({ ...leer, jause: [{ rezept: 'j1', anzahl: 3 }, { rezept: 'reste', anzahl: 1 }] })).toBe(4);
    expect(jausenAnzahl(leer)).toBe(0);
  });
});
