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
