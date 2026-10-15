import { describe, it, expect } from 'vitest';
import { punkt, winkel, gelenke, poseZuSvg, ausschnitt, pruefePose, pruefeFigur } from '../js/logik/figur.js';

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
  it('Strichstärke lässt sich setzen, Boden und Gerät skalieren mit', () => {
    const svg = poseZuSvg(stehend, 'wand', 6.4);
    expect(svg).toContain('stroke-width="6.4"');
    expect(svg).toContain('stroke-width="2.4"');
    expect(svg).toContain('stroke-width="4"');
    expect(svg).not.toContain('stroke-width="3.2"');
  });
  it('Halswinkel setzt den Kopf zur Seite, ohne Halswinkel liegt er auf der Rumpfachse', () => {
    expect(gelenke({ ...stehend, hals: -135 }).kopf).toEqual([53.6, 9.6]);
    expect(gelenke(stehend).kopf).toEqual([60, 7]);
    expect(pruefePose({ ...stehend, hals: 'x' })).toEqual(['hals ungültig']);
  });
  it('Kopf bleibt ein geschlossener Kreis, zuletzt gezeichnet und innen in Hintergrundfarbe (Arm liegt dahinter)', () => {
    const hang = { huefte: [63, 70], rumpf: -100, hals: -130, arm: [-61, -58], bein: [15, 200] };
    const svg = poseZuSvg(hang, 'stange');
    expect(svg.match(/<circle/g)).toHaveLength(1);
    expect(svg.endsWith('style="fill: var(--figur-grund, var(--zelle))"/></g>')).toBe(true);
    expect(svg.match(/style=/g)).toHaveLength(1);
  });
  it('eigener zweiter Arm an der Stange wird voll gezeichnet, die Beine dahinter blass', () => {
    const oben = { huefte: [56.6, 55.9], rumpf: -95, arm: [-146, -59], arm2: [-28, -18], bein: [15, 200], bein2: [25, 200] };
    const svg = poseZuSvg(oben, 'stange');
    const blass = svg.match(/<path d="([^"]*)" stroke-width="3.2" opacity=".45"\/>/)[1];
    const voll = svg.match(/<path d="([^"]*)" stroke-width="3.2"\/>/)[1];
    const g = gelenke(oben);
    const zweiterArm = `M${g.schulter[0]} ${g.schulter[1]}L${g.hinten.ellbogen[0]} ${g.hinten.ellbogen[1]}`;
    expect(voll).toContain(zweiterArm);
    expect(blass).not.toContain(zweiterArm);
    expect(blass).toContain(`L${g.hinten.knie[0]} ${g.hinten.knie[1]}`);
    // ohne Stange bleibt der zweite Arm blass
    expect(poseZuSvg(oben, 'boden').match(/<path d="([^"]*)" stroke-width="3.2" opacity=".45"\/>/)[1]).toContain(zweiterArm);
  });
  it('ausschnitt: eng um beide Posen, Boden nur wenn die Figur darauf steht', () => {
    const [x, y, b, h] = ausschnitt(gueltig.figur).split(' ').map(Number);
    expect(b).toBe(h);
    // Höhe: Kopf oben (y = 2) bis Bodenlinie (y = 80,5), dazu 3 Rand je Seite -> 84,5
    expect(b).toBeCloseTo(84.5, 0);
    expect(y).toBeLessThanOrEqual(-1);
    expect(y + h).toBeGreaterThanOrEqual(83.5);
    expect(x + b).toBeGreaterThan(89);
  });
  it('ausschnitt an der Stange: Stange oben drin, Boden weg, wenn die Füße in der Luft sind', () => {
    const hang = { huefte: [63, 70], rumpf: -100, hals: -130, arm: [-61, -58], bein: [15, 200] };
    const oben = { huefte: [62, 48], rumpf: -100, arm: [42, -64], bein: [15, 200] };
    const [, y, , h] = ausschnitt({ geraet: 'stange', start: hang, ende: oben }).split(' ').map(Number);
    expect(y).toBeLessThanOrEqual(12);
    expect(y + h).toBeLessThan(80);
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
