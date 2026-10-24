import { describe, it, expect } from 'vitest';
import { bloeckeFuerEinheit, kettenFuerEinheit, kettenImPlan, naechsteEinheit, abschliessen, ueberspringen } from '../js/logik/rotation.js';

const plan = {
  einheiten: [
    { id: 'a', name: 'Oberkörper A', art: 'schwer', ketten: [['druecken-horizontal', 'ziehen'], 'core'], dauer: '25 min' },
    { id: 'b', name: 'Beine', art: 'schwer', ketten: ['beine'], dauer: '25 min' },
    { id: 'c', name: 'Oberkörper B', art: 'schwer', ketten: [['druecken-vertikal', 'ziehen'], ['druecken-horizontal', 'ziehen-ohne-stange']], dauer: '35 min' },
  ],
};
const training = { naechsteEinheit: 2, stufen: {}, laufend: { index: 2 }, vorschlaege: [], log: [] };

describe('rotation', () => {
  it('ersetzt ziehen je nach Stange und liefert die flache Liste', () => {
    expect(kettenFuerEinheit(plan.einheiten[0], false)).toEqual(['druecken-horizontal', 'ziehen-ohne-stange', 'core']);
    expect(kettenFuerEinheit(plan.einheiten[0], true)).toEqual(['druecken-horizontal', 'ziehen-stange', 'core']);
  });
  it('ersetzt bauch je nach Stange: hängend oder am Boden', () => {
    const e = { ketten: [['druecken-horizontal', 'ziehen'], 'bauch'] };
    expect(kettenFuerEinheit(e, true)).toEqual(['druecken-horizontal', 'ziehen-stange', 'core-haengend']);
    expect(kettenFuerEinheit(e, false)).toEqual(['druecken-horizontal', 'ziehen-ohne-stange', 'core']);
  });
  it('kettenImPlan sammelt alle aufgelösten Ketten', () => {
    const p = { einheiten: [{ ketten: [['druecken-horizontal', 'ziehen'], 'bauch'] }, { ketten: ['beine', 'core'] }] };
    expect([...kettenImPlan(p, true)].sort()).toEqual(['beine', 'core', 'core-haengend', 'druecken-horizontal', 'ziehen-stange']);
    expect([...kettenImPlan(p, false)].sort()).toEqual(['beine', 'core', 'druecken-horizontal', 'ziehen-ohne-stange']);
  });
  it('Paare bleiben Blöcke', () => {
    expect(bloeckeFuerEinheit(plan.einheiten[0], true)).toEqual([['druecken-horizontal', 'ziehen-stange'], ['core']]);
  });
  it('doppelte Kette in einer Einheit fällt weg (ohne Stange)', () => {
    expect(bloeckeFuerEinheit(plan.einheiten[2], true)).toEqual([
      ['druecken-vertikal', 'ziehen-stange'], ['druecken-horizontal', 'ziehen-ohne-stange'],
    ]);
    expect(bloeckeFuerEinheit(plan.einheiten[2], false)).toEqual([
      ['druecken-vertikal', 'ziehen-ohne-stange'], ['druecken-horizontal'],
    ]);
  });
  it('liefert die Einheit am Index', () => {
    expect(naechsteEinheit(training, plan).id).toBe('c');
  });
  it('abschliessen hängt an, rückt weiter (mit Umlauf) und beendet laufend', () => {
    const eintrag = { datum: '2026-10-14', einheit: 3, art: 'schwer', uebungen: [] };
    const neu = abschliessen(training, plan, eintrag);
    expect(neu.log).toEqual([eintrag]);
    expect(neu.naechsteEinheit).toBe(0);
    expect(neu.laufend).toBeNull();
    expect(training.log).toEqual([]); // Original unverändert
  });
  it('ueberspringen rückt weiter ohne Log', () => {
    const neu = ueberspringen({ ...training, naechsteEinheit: 0 }, plan);
    expect(neu.naechsteEinheit).toBe(1);
    expect(neu.log).toEqual([]);
    expect(neu.laufend).toBeNull();
  });
});
