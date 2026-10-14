import { describe, it, expect } from 'vitest';
import {
  zielFuer, zielwert, erreicht, erfolgsserie, vorschlaegeNachAbschluss, stufeVerschieben,
} from '../js/logik/progression.js';

const kette = {
  id: 'druecken-horizontal',
  name: 'Drücken horizontal',
  stufen: [
    { name: 'Liegestütz', ziel: { saetze: 3, wdh: 15 } },
    { name: 'Diamond-Liegestütz', ziel: { saetze: 3, wdh: 12 } },
  ],
};
const kettenById = { [kette.id]: kette };
const eintrag = (art, saetze, stufe = 0, extra = {}) => ({
  datum: '2026-10-14', einheit: 1, art, uebungen: [{ kette: kette.id, stufe, saetze, ...extra }],
});

describe('progression', () => {
  it('leichte Einheit hat 2 Sätze, schwere das volle Ziel', () => {
    expect(zielFuer(kette.stufen[0], 'leicht')).toEqual({ saetze: 2, wdh: 15 });
    expect(zielFuer(kette.stufen[0], 'schwer')).toEqual({ saetze: 3, wdh: 15 });
    expect(kette.stufen[0].ziel.saetze).toBe(3); // nicht verändert
  });
  it('zielwert für Wiederholungen und Sekunden', () => {
    expect(zielwert({ saetze: 3, wdh: 15 })).toBe(15);
    expect(zielwert({ saetze: 3, sek: 45 })).toBe(45);
  });
  it('erreicht nur bei voller Satzzahl und allen Sätzen am Ziel', () => {
    const ziel = { saetze: 3, wdh: 15 };
    expect(erreicht([15, 15, 15], ziel)).toBe(true);
    expect(erreicht([15, 16, 20], ziel)).toBe(true);
    expect(erreicht([15, 15, 14], ziel)).toBe(false);
    expect(erreicht([15, 15], ziel)).toBe(false);
  });
  it('Serie zählt schwere Erfolge, leichte Einheiten dazwischen stören nicht', () => {
    const log = [eintrag('schwer', [15, 15, 15]), eintrag('leicht', [9, 8]), eintrag('schwer', [15, 15, 16])];
    expect(erfolgsserie(log, kette, 0)).toBe(2);
  });
  it('Serie bricht bei Misserfolg oder anderer Stufe ab', () => {
    expect(erfolgsserie([eintrag('schwer', [15, 15, 15]), eintrag('schwer', [15, 14, 15])], kette, 0)).toBe(0);
    expect(erfolgsserie([eintrag('schwer', [12, 12, 12], 1), eintrag('schwer', [15, 15, 15])], kette, 0)).toBe(1);
  });
  it('Routine-Teile (teil gesetzt) zählen nicht', () => {
    const log = [eintrag('schwer', [15, 15, 15], 0, { teil: 0 }), eintrag('schwer', [15, 15, 15], 0, { teil: 0 })];
    expect(erfolgsserie(log, kette, 0)).toBe(0);
  });
  it('Vorschlag nach zweitem schweren Erfolg', () => {
    const log = [eintrag('schwer', [15, 15, 15]), eintrag('schwer', [15, 15, 15])];
    expect(vorschlaegeNachAbschluss(log, {}, kettenById)).toEqual([
      { kette: kette.id, nach: 1, name: 'Diamond-Liegestütz', ziel: { saetze: 3, wdh: 12 } },
    ]);
  });
  it('kein Vorschlag nach leichter Einheit, auf letzter Stufe oder bei Serie 1', () => {
    const zweiErfolge = [eintrag('schwer', [15, 15, 15]), eintrag('schwer', [15, 15, 15])];
    expect(vorschlaegeNachAbschluss([...zweiErfolge, eintrag('leicht', [15, 15])], {}, kettenById)).toEqual([]);
    expect(vorschlaegeNachAbschluss([eintrag('schwer', [12, 12, 12], 1), eintrag('schwer', [12, 12, 12], 1)], { [kette.id]: 1 }, kettenById)).toEqual([]);
    expect(vorschlaegeNachAbschluss([eintrag('schwer', [15, 15, 15])], {}, kettenById)).toEqual([]);
    expect(vorschlaegeNachAbschluss([], {}, kettenById)).toEqual([]);
  });
  it('Stufe verschieben mit Grenzen', () => {
    expect(stufeVerschieben({}, kette, 1)).toEqual({ [kette.id]: 1 });
    expect(stufeVerschieben({ [kette.id]: 1 }, kette, 1)).toEqual({ [kette.id]: 1 });
    expect(stufeVerschieben({ [kette.id]: 0 }, kette, -1)).toEqual({ [kette.id]: 0 });
  });
});
