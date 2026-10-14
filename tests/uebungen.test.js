import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { pruefeFigur } from '../js/logik/figur.js';

const lies = (name) => JSON.parse(readFileSync(new URL(`../data/${name}.json`, import.meta.url), 'utf8'));
const { ketten } = lies('uebungen');
const plan = lies('trainingsplan');
const kette = (id) => ketten.find((k) => k.id === id);

// Stufen, bei denen die Spec ein „Achte darauf“ verlangt (Spec 4.3.1)
const MIT_ACHTUNG = [
  'Unterarmstütz', 'Hollow Hold', 'Hollow Rocks', 'Pike Push-up', 'Pike Push-up mit erhöhten Füßen', 'Wand-Handstand',
  'Negative Handstand-Liegestütz', 'Diamond-Liegestütz', 'Liegestütz mit erhöhten Füßen', 'Archer-Liegestütz',
  'Pseudo-Planche-Liegestütz', 'Tischrudern', 'Tischrudern mit erhöhten Füßen', 'Einarmiges Tischrudern',
  'Negativ-Klimmzug', 'Chin-up', 'Klimmzug', 'L-Sit-Klimmzug', 'Archer-Klimmzug',
  'Bulgarian Split Squat', 'Shrimp Squat (assistiert)', 'Pistol Squat (assistiert)', 'Pistol Squat',
  'Einbeinige Hüftbrücke', 'Einbeinige Hüftbrücke mit erhöhtem Fuß', 'Negativer Nordic Curl',
];

describe('uebungen.json', () => {
  it('enthält alle Ketten mit den Stufenzahlen aus der Spec', () => {
    expect(ketten.map((k) => [k.id, k.stufen.length])).toEqual([
      ['druecken-horizontal', 5], ['druecken-vertikal', 4], ['ziehen-ohne-stange', 3], ['ziehen-stange', 7],
      ['beine', 5], ['huefte', 3], ['core', 3], ['mobilitaet', 1],
    ]);
  });
  it('Klimmzug-Kette beginnt mit dem Einstieg, Archer folgt nach den erhöhten Füßen', () => {
    expect(kette('ziehen-stange').stufen.slice(0, 3).map((s) => s.name)).toEqual(['Negativ-Klimmzug', 'Chin-up', 'Klimmzug']);
    expect(kette('druecken-horizontal').stufen.map((s) => s.name)).toEqual([
      'Liegestütz', 'Diamond-Liegestütz', 'Liegestütz mit erhöhten Füßen', 'Archer-Liegestütz', 'Pseudo-Planche-Liegestütz',
    ]);
  });
  it('jede Stufe hat Ziel mit wdh oder sek und 2–3 Hinweise', () => {
    for (const k of ketten.filter((x) => x.id !== 'mobilitaet')) {
      for (const s of k.stufen) {
        expect(s.ziel.saetze, s.name).toBe(3);
        expect((s.ziel.wdh != null) !== (s.ziel.sek != null), s.name).toBe(true);
        expect(s.hinweise.length, s.name).toBeGreaterThanOrEqual(2);
        expect(s.hinweise.length, s.name).toBeLessThanOrEqual(3);
        expect(!!s.achtung, s.name).toBe(MIT_ACHTUNG.includes(s.name));
      }
    }
  });
  it('Mobilität ist eine Routine aus 4 Übungen, zusammen etwa 5 Minuten', () => {
    const routine = kette('mobilitaet').stufen[0].routine;
    expect(routine.map((r) => r.name)).toEqual([
      'Hüftbeuger-Dehnung im Ausfallschritt', 'Wandengel', 'Offenes Buch', 'Hamstring-Dehnung im Sitzen',
    ]);
    for (const r of routine) {
      expect(r.sek, r.name).toBeGreaterThanOrEqual(30);
      expect(r.hinweise.length, r.name).toBeGreaterThanOrEqual(2);
    }
    const sekunden = routine.reduce((s, r) => s + r.sek * (r.seitig ? 2 : 1), 0);
    expect(sekunden).toBeGreaterThanOrEqual(180);
    expect(sekunden).toBeLessThanOrEqual(330);
  });
});

describe('trainingsplan.json', () => {
  const ids = (e) => e.ketten.flat().map((id) => (id === 'ziehen' ? 'ziehen-stange' : id));
  it('4 schwere Einheiten in der Reihenfolge der Spec, nur bekannte Ketten, höchstens Paare', () => {
    expect(plan.einheiten.map((e) => [e.name, e.art])).toEqual([
      ['Oberkörper A', 'schwer'], ['Beine', 'schwer'], ['Oberkörper B', 'schwer'], ['Beine & Core', 'schwer'],
    ]);
    for (const e of plan.einheiten) {
      for (const block of e.ketten) if (Array.isArray(block)) expect(block.length, e.name).toBe(2);
      for (const id of e.ketten.flat()) expect(id === 'ziehen' || !!kette(id), `${e.name}: ${id}`).toBe(true);
      expect(e.ketten.at(-1), e.name).toBe('mobilitaet');
    }
  });
  it('Drücken und Ziehen im Verhältnis 1:1 (mit Stange)', () => {
    const alle = plan.einheiten.flatMap(ids);
    const zaehle = (praefix) => alle.filter((id) => id.startsWith(praefix)).length;
    expect(zaehle('druecken')).toBe(zaehle('ziehen'));
  });
});

describe('Übungsfiguren', () => {
  it('jede Stufe und jeder Routine-Teil hat gültige Start- und End-Pose', () => {
    const fehler = ketten.flatMap((k) => k.stufen.flatMap((s, i) => (s.routine ?? [s])
      .map((t) => [`${k.id}/${i} ${t.name}`, pruefeFigur(t)])
      .filter(([, f]) => f.length)
      .map(([n, f]) => `${n}: ${f.join(', ')}`)));
    expect(fehler).toEqual([]);
  });
  it('Referenzposen aus der Spec sind unverändert', () => {
    expect(kette('druecken-horizontal').stufen[1].figur).toEqual({
      geraet: 'boden',
      start: { huefte: [65.4, 63.3], rumpf: 204, arm: [90, 90], bein: [24, 24] },
      ende: { huefte: [69.6, 73.1], rumpf: 190, arm: [30, 163], bein: [10, 10] },
    });
    expect(kette('beine').stufen[0].figur).toEqual({
      geraet: 'boden',
      start: { huefte: [60, 46], rumpf: -90, arm: [0, 0], bein: [90, 90] },
      ende: { huefte: [51.8, 62.3], rumpf: -70, arm: [0, 0], bein: [10, 120] },
    });
  });
  it('Gerät passt zur Kette', () => {
    for (const s of kette('ziehen-stange').stufen) expect(s.figur.geraet, s.name).toBe('stange');
    for (const s of kette('ziehen-ohne-stange').stufen) expect(s.figur.geraet, s.name).toBe('tisch');
  });
});
