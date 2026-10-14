import { describe, it, expect } from 'vitest';
import { parseKg, eintragen, wochenschnitte, trendProMonat, empfehlung } from '../js/logik/gewicht.js';

describe('gewicht', () => {
  it('parseKg akzeptiert Komma und Punkt, lehnt Unsinn ab', () => {
    expect(parseKg('72,4')).toBe(72.4);
    expect(parseKg(' 72.46 ')).toBe(72.5);
    expect(parseKg('abc')).toBeNull();
    expect(parseKg('7')).toBeNull();
    expect(parseKg('')).toBeNull();
    expect(parseKg('350')).toBeNull();
  });
  it('eintragen ersetzt denselben Tag und sortiert', () => {
    const g = eintragen([{ datum: '2026-10-14', kg: 72 }, { datum: '2026-10-10', kg: 71.8 }], '2026-10-14', 72.4);
    expect(g).toEqual([{ datum: '2026-10-10', kg: 71.8 }, { datum: '2026-10-14', kg: 72.4 }]);
  });
  it('Wochenschnitt pro ISO-Woche', () => {
    const w = wochenschnitte([
      { datum: '2026-10-12', kg: 72.0 }, { datum: '2026-10-14', kg: 72.4 }, { datum: '2026-10-05', kg: 71.8 },
    ]);
    expect(w.map((x) => x.kw)).toEqual(['2026-W41', '2026-W42']);
    expect(w[1].kg).toBeCloseTo(72.2, 5);
    expect(w[1]).toMatchObject({ montag: '2026-10-12', anzahl: 2 });
  });
  it('Trend aus den letzten 4 Wochen, ältere Wochen zählen nicht', () => {
    const g = [
      { datum: '2026-08-31', kg: 80.0 },
      { datum: '2026-09-21', kg: 72.0 }, { datum: '2026-09-28', kg: 72.2 }, { datum: '2026-10-05', kg: 72.4 },
    ];
    expect(trendProMonat(g)).toBeCloseTo(0.867, 2);
    expect(empfehlung(trendProMonat(g))).toBe(-150);
  });
  it('Trend mit Lücken', () => {
    const g = [{ datum: '2026-09-21', kg: 72.0 }, { datum: '2026-10-05', kg: 72.1 }, { datum: '2026-10-12', kg: 72.15 }];
    expect(trendProMonat(g)).toBeCloseTo(0.217, 2);
    expect(empfehlung(trendProMonat(g))).toBe(150);
  });
  it('unter 3 Wochen kein Trend', () => {
    expect(trendProMonat([{ datum: '2026-10-05', kg: 72 }, { datum: '2026-10-12', kg: 72.5 }])).toBeNull();
    expect(trendProMonat([])).toBeNull();
  });
  it('Empfehlung mit Grenzen', () => {
    expect(empfehlung(null)).toBeNull();
    expect(empfehlung(0.5)).toBe(0);
    expect(empfehlung(0.75)).toBe(0);
    expect(empfehlung(0.25)).toBe(0);
    expect(empfehlung(0.76)).toBe(-150);
    expect(empfehlung(0.24)).toBe(150);
  });
});
