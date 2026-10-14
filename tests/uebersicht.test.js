import { describe, it, expect } from 'vitest';
import { wochenKalender, trainingsSumme } from '../js/logik/uebersicht.js';

const plan = {
  einheiten: [
    { id: 'ok-a', name: 'Oberkörper A', kurz: 'OK A' },
    { id: 'beine', name: 'Beine', kurz: 'Beine' },
    { id: 'ok-b', name: 'Oberkörper B', kurz: 'OK B' },
    { id: 'beine-core', name: 'Beine & Core', kurz: 'B & C' },
  ],
};
const eintrag = (datum, einheit, uebungen = []) => ({ datum, einheit, art: 'schwer', uebungen });
// Mittwoch, 14.10.2026; Montag und Dienstag trainiert, als Nächstes kommt Oberkörper B.
const training = (extra = {}) => ({
  naechsteEinheit: 2, laufend: null,
  log: [eintrag('2026-10-12', 1), eintrag('2026-10-13', 2)],
  ...extra,
});

describe('wochenKalender', () => {
  it('erledigt aus dem Log, heute und danach als Vorschau der Rotation', () => {
    const tage = wochenKalender(training(), plan, '2026-10-14');
    expect(tage.map((t) => t.datum)).toEqual([
      '2026-10-12', '2026-10-13', '2026-10-14', '2026-10-15', '2026-10-16', '2026-10-17', '2026-10-18',
    ]);
    expect(tage.map((t) => t.status)).toEqual(['erledigt', 'erledigt', 'heute', 'geplant', 'geplant', 'geplant', 'geplant']);
    expect(tage.map((t) => t.einheiten.map((e) => e.kurz).join())).toEqual(['OK A', 'Beine', 'OK B', 'B & C', 'OK A', 'Beine', 'OK B']);
  });

  it('heute schon trainiert: Vorschau beginnt morgen', () => {
    const t = training({ naechsteEinheit: 3, log: [...training().log, eintrag('2026-10-14', 3)] });
    const tage = wochenKalender(t, plan, '2026-10-14');
    expect(tage[2]).toEqual({ datum: '2026-10-14', status: 'erledigt', einheiten: [{ id: 'ok-b', name: 'Oberkörper B', kurz: 'OK B' }] });
    expect(tage[3].einheiten[0].kurz).toBe('B & C');
  });

  it('ausgelassener Tag in der Vergangenheit ist frei, laufende Einheit heute', () => {
    const t = training({ log: [eintrag('2026-10-12', 1)], naechsteEinheit: 1, laufend: { datum: '2026-10-14' } });
    const tage = wochenKalender(t, plan, '2026-10-14');
    expect(tage[1]).toEqual({ datum: '2026-10-13', status: 'frei', einheiten: [] });
    expect(tage[2].status).toBe('laeuft');
    expect(tage[2].einheiten[0].kurz).toBe('Beine');
  });

  it('nächste Woche setzt die Rotation fort; ohne kurz gilt der Name', () => {
    const ohneKurz = { einheiten: plan.einheiten.map(({ id, name }) => ({ id, name })) };
    const tage = wochenKalender(training(), ohneKurz, '2026-10-14', 1);
    expect(tage[0].datum).toBe('2026-10-19');
    expect(tage[0].einheiten[0]).toEqual({ id: 'beine-core', name: 'Beine & Core', kurz: 'Beine & Core' });
  });

  it('unbekannte Einheit im Log stürzt nicht ab', () => {
    const tage = wochenKalender(training({ log: [eintrag('2026-10-12', 9)] }), { einheiten: plan.einheiten.slice(0, 1) }, '2026-10-14');
    expect(tage[0]).toEqual({ datum: '2026-10-12', status: 'erledigt', einheiten: [{ id: null, name: 'Einheit 9', kurz: 'E9' }] });
  });
});

describe('trainingsSumme', () => {
  const kettenById = {
    liegestuetz: { id: 'liegestuetz', stufen: [{ name: 'Liegestütz', ziel: { saetze: 3, wdh: 12 } }] },
    core: { id: 'core', stufen: [{ name: 'Unterarmstütz', ziel: { saetze: 3, sek: 45 } }] },
    mobilitaet: { id: 'mobilitaet', stufen: [{ name: 'Mobilität', routine: [{ name: 'Katze-Kuh', sek: 60 }] }] },
  };
  const log = [
    eintrag('2026-10-12', 1, [
      { kette: 'liegestuetz', stufe: 0, saetze: [12, 12, 10] },
      { kette: 'core', stufe: 0, saetze: [45, 40] },
      { kette: 'mobilitaet', stufe: 0, teil: 0, saetze: [60] },
    ]),
    eintrag('2026-10-13', 2, [
      { kette: 'gibts-nicht', stufe: 0, saetze: [99] },
      { kette: 'mobilitaet', stufe: 0, teil: 5, saetze: [60] },
      { kette: 'liegestuetz', stufe: 4, saetze: [13] },
    ]),
    eintrag('2026-10-05', 1, [{ kette: 'liegestuetz', stufe: 0, saetze: [12] }]),
  ];

  it('zählt Einheiten, Sätze, Sätze am Ziel, Wiederholungen und Sekunden im Zeitraum, ohne Mobilität', () => {
    expect(trainingsSumme(log, kettenById, '2026-10-12', '2026-10-18')).toEqual({
      einheiten: 2, saetze: 6, amZiel: 4, wdh: 47, sek: 85,
    });
  });

  it('ein Tag', () => {
    expect(trainingsSumme(log, kettenById, '2026-10-13', '2026-10-13')).toEqual({
      einheiten: 1, saetze: 1, amZiel: 1, wdh: 13, sek: 0,
    });
  });
});
