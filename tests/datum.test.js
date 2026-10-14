import { describe, it, expect } from 'vitest';
import { heute, plusTage, tageZwischen, montag, isoWoche } from '../js/logik/datum.js';

describe('datum', () => {
  it('heute liefert das lokale Datum', () => {
    expect(heute(new Date(2026, 9, 14, 23, 30))).toBe('2026-10-14');
  });
  it('plusTage geht über Monats- und Jahresgrenzen', () => {
    expect(plusTage('2026-12-31', 1)).toBe('2027-01-01');
    expect(plusTage('2026-03-01', -1)).toBe('2026-02-28');
  });
  it('tageZwischen zählt Tage', () => {
    expect(tageZwischen('2026-10-01', '2026-10-15')).toBe(14);
    expect(tageZwischen('2026-10-15', '2026-10-01')).toBe(-14);
  });
  it('montag liefert den Montag der Woche', () => {
    expect(montag('2026-10-14')).toBe('2026-10-12');
    expect(montag('2026-10-12')).toBe('2026-10-12');
    expect(montag('2026-10-18')).toBe('2026-10-12');
  });
  it('isoWoche inklusive Jahreswechsel', () => {
    expect(isoWoche('2026-10-14')).toBe('2026-W42');
    expect(isoWoche('2026-01-01')).toBe('2026-W01');
    expect(isoWoche('2027-01-01')).toBe('2026-W53');
    expect(isoWoche('2024-12-30')).toBe('2025-W01');
  });
});
