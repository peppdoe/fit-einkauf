import { describe, it, expect } from 'vitest';
import { parseRoute } from '../js/route.js';

describe('parseRoute', () => {
  it('leer und unbekannt führen zu Heute', () => {
    expect(parseRoute('')).toEqual({ bereich: 'heute', teile: [], parameter: {} });
    expect(parseRoute('#/unsinn/x')).toEqual({ bereich: 'heute', teile: [], parameter: {} });
    expect(parseRoute('#/heute')).toEqual({ bereich: 'heute', teile: [], parameter: {} });
  });
  it('Bereich, Teile und Parameter', () => {
    expect(parseRoute('#/essen/rezept/huhn-reis-pfanne?tausch=abend%3A0')).toEqual({
      bereich: 'essen', teile: ['rezept', 'huhn-reis-pfanne'], parameter: { tausch: 'abend:0' },
    });
    expect(parseRoute('#/einkauf?ansicht=rezept')).toEqual({ bereich: 'einkauf', teile: [], parameter: { ansicht: 'rezept' } });
    expect(parseRoute('#/training/verlauf')).toEqual({ bereich: 'training', teile: ['verlauf'], parameter: {} });
  });
});
