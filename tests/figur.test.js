import { describe, it, expect } from 'vitest';
import { punkt, winkel, gelenke, poseZuSvg, pruefePose, pruefeFigur } from '../js/logik/figur.js';

const stehend = { huefte: [60, 46], rumpf: -90, arm: [0, 0], bein: [90, 90] };
const gueltig = {
  name: 'Kniebeuge',
  figur: { geraet: 'boden', start: stehend, ende: { huefte: [51.8, 62.3], rumpf: -70, arm: [0, 0], bein: [10, 120] } },
  hinweise: ['Füße schulterbreit.', 'Hüfte nach hinten.'],
};

describe('figur', () => {
  it('punkt und winkel sind Umkehrungen', () => {
    expect(punkt([0, 0], 90, 10)).toEqual([0, 10]);
    expect(winkel([0, 0], [0, 10])).toBe(90);
    expect(winkel([0, 0], [-10, 0])).toBe(180);
  });
  it('gelenke einer stehenden Figur', () => {
    const g = gelenke(stehend);
    expect(g.schulter).toEqual([60, 16]);
    expect(g.kopf).toEqual([60, 7]);
    expect(g.vorn.knie).toEqual([60, 63]);
    expect(g.vorn.fuss).toEqual([60, 80]);
    expect(g.vorn.hand).toEqual([89, 16]);
    expect(g.hinten).toEqual(g.vorn);
  });
  it('zweite Seite getrennt', () => {
    const g = gelenke({ ...stehend, bein2: [90, 180] });
    expect(g.hinten.fuss).toEqual([43, 63]);
    expect(g.vorn.fuss).toEqual([60, 80]);
  });
  it('SVG enthält Boden, Gerät, Kopf und zweite Seite mit 45 %', () => {
    const svg = poseZuSvg(stehend, 'wand');
    expect(svg).toContain('<circle cx="60" cy="7" r="5"');
    expect(svg).toContain('M4 80.5H116');
    expect(svg).toContain('M8 0V80');
    expect(svg).toContain('opacity=".45"');
  });
  it('pruefePose meldet fehlende Winkel und Gelenke außerhalb', () => {
    expect(pruefePose(stehend)).toEqual([]);
    expect(pruefePose({ huefte: [60, 46], rumpf: -90, bein: [90, 90] })).toEqual(['arm fehlt']);
    expect(pruefePose({ ...stehend, arm2: [0] })).toEqual(['arm2 ungültig']);
    expect(pruefePose({ ...stehend, huefte: [110, 46] })).toEqual(['Gelenk außerhalb des Bildes']);
    expect(pruefePose(undefined)).toEqual(['huefte fehlt']);
  });
  it('pruefeFigur prüft Gerät, beide Posen und 2–3 Hinweise', () => {
    expect(pruefeFigur(gueltig)).toEqual([]);
    expect(pruefeFigur({ ...gueltig, hinweise: ['nur einer'] })).toEqual(['1 Hinweise statt 2–3']);
    expect(pruefeFigur({ ...gueltig, figur: { ...gueltig.figur, geraet: 'ringe' } })).toEqual(['unbekanntes Gerät ringe']);
    expect(pruefeFigur({ ...gueltig, figur: { ...gueltig.figur, ende: undefined } })).toEqual(['ende: huefte fehlt']);
    expect(pruefeFigur({ name: 'x', hinweise: ['a', 'b'] })).toEqual(['figur fehlt']);
  });
});
