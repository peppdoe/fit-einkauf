import { describe, it, expect } from 'vitest';
import { aufloesen, schrittweite, starteEinheit, satzFertig, waehle, pauseNach, eintragAusLaufend } from '../js/logik/einheit.js';

const kettenById = {
  'druecken-horizontal': { id: 'druecken-horizontal', stufen: [
    { name: 'Liegestütz', ziel: { saetze: 3, wdh: 15 }, hinweise: ['a', 'b'], figurOk: true, figur: { geraet: 'boden' } },
    { name: 'Diamond-Liegestütz', ziel: { saetze: 3, wdh: 12 }, hinweise: ['a', 'b'], achtung: 'Hüfte', figurOk: false, figur: { geraet: 'boden' } },
  ] },
  'ziehen-ohne-stange': { id: 'ziehen-ohne-stange', stufen: [{ name: 'Tischrudern', ziel: { saetze: 3, wdh: 12 }, hinweise: [] }] },
  'ziehen-stange': { id: 'ziehen-stange', stufen: [{ name: 'Negativ-Klimmzug', ziel: { saetze: 3, wdh: 5 }, hinweise: [] }] },
  core: { id: 'core', stufen: [{ name: 'Unterarmstütz', ziel: { saetze: 3, sek: 45 }, hinweise: [] }] },
  mobilitaet: { id: 'mobilitaet', stufen: [{ name: 'Routine', routine: [
    { name: 'Wandengel', sek: 45, hinweise: [] }, { name: 'Offenes Buch', sek: 30, seitig: true, hinweise: [] },
  ] }] },
};
const einheitA = { id: 'ok-a', name: 'Oberkörper A', art: 'schwer', ketten: [['druecken-horizontal', 'ziehen'], 'core'] };
const training = { naechsteEinheit: 0, stufen: { 'druecken-horizontal': 1 }, log: [] };
const satz = (l, wert) => satzFertig({ ...l, wert: wert ?? l.wert }, kettenById);

describe('einheit', () => {
  it('aufloesen liefert Ziel, Texte und Figur (null ohne gültige Figur)', () => {
    expect(aufloesen({ kette: 'druecken-horizontal', stufe: 0, teil: null }, kettenById, 'schwer'))
      .toMatchObject({ name: 'Liegestütz', ziel: { saetze: 3, wdh: 15 }, figur: { geraet: 'boden' }, achtung: null });
    expect(aufloesen({ kette: 'druecken-horizontal', stufe: 1, teil: null }, kettenById, 'leicht'))
      .toMatchObject({ name: 'Diamond-Liegestütz', ziel: { saetze: 2, wdh: 12 }, figur: null, achtung: 'Hüfte' });
    expect(aufloesen({ kette: 'ziehen-ohne-stange', stufe: 0, teil: null }, kettenById, 'schwer').figur).toBeNull();
  });
  it('Routine-Teile haben einen Durchgang', () => {
    expect(aufloesen({ kette: 'mobilitaet', stufe: 0, teil: 1 }, kettenById, 'schwer'))
      .toMatchObject({ name: 'Offenes Buch', ziel: { saetze: 1, sek: 30 }, seitig: true });
  });
  it('schrittweite', () => {
    expect(schrittweite({ saetze: 3, wdh: 12 })).toBe(1);
    expect(schrittweite({ saetze: 3, sek: 45 })).toBe(5);
  });
  it('starteEinheit mit Stufen, Stange-Ersatz, Partnern und Zielwert', () => {
    const l = starteEinheit(training, einheitA, kettenById, false, '2026-10-14');
    expect(l).toMatchObject({ index: 0, art: 'schwer', datum: '2026-10-14', aktiv: 0, wert: 12, pause: null });
    expect(l.uebungen).toEqual([
      { kette: 'druecken-horizontal', stufe: 1, teil: null, partner: 1, saetze: [] },
      { kette: 'ziehen-ohne-stange', stufe: 0, teil: null, partner: 0, saetze: [] },
      { kette: 'core', stufe: 0, teil: null, partner: null, saetze: [] },
    ]);
  });
  it('Routine wird in einzelne Übungen aufgeteilt', () => {
    const l = starteEinheit(training, { art: 'schwer', ketten: ['mobilitaet'] }, kettenById, false, '2026-10-14');
    expect(l.uebungen.map((u) => u.teil)).toEqual([0, 1]);
    expect(l.wert).toBe(45);
  });
  it('gespeicherte Stufe außerhalb der Kette wird begrenzt, unbekannte Kette übersprungen', () => {
    const l = starteEinheit({ ...training, stufen: { 'druecken-horizontal': 9 } },
      { art: 'schwer', ketten: ['druecken-horizontal', 'gibtsnicht'] }, kettenById, false, '2026-10-14');
    expect(l.uebungen).toEqual([{ kette: 'druecken-horizontal', stufe: 1, teil: null, partner: null, saetze: [] }]);
  });
  it('unbekannte Kette in einem Paar: der Rest läuft ohne Partner', () => {
    const l = starteEinheit(training, { art: 'schwer', ketten: [['gibtsnicht', 'core']] }, kettenById, false, '2026-10-14');
    expect(l.uebungen).toEqual([{ kette: 'core', stufe: 0, teil: null, partner: null, saetze: [] }]);
  });
  it('ohne Partner: satzFertig bleibt bei offener Übung und behält den Wert', () => {
    let l = starteEinheit(training, { art: 'schwer', ketten: ['core'] }, kettenById, false, '2026-10-14');
    l = satz(l, 40);
    expect(l.uebungen[0].saetze).toEqual([40]);
    expect(l.aktiv).toBe(0);
    expect(l.wert).toBe(40);
  });
  it('Supersatz: abwechselnd A, B, A …, Wert beim Wechsel = letzter Satz der Übung', () => {
    let l = starteEinheit(training, einheitA, kettenById, false, '2026-10-14');
    l = satz(l, 11);
    expect(l.aktiv).toBe(1);
    expect(l.wert).toBe(12); // Tischrudern: noch kein Satz, also Ziel
    l = satz(l, 10);
    expect(l.aktiv).toBe(0);
    expect(l.wert).toBe(11); // Diamond: letzter Satz
    l = satz(satz(satz(satz(l))));
    expect(l.uebungen[0].saetze).toEqual([11, 11, 11]);
    expect(l.uebungen[1].saetze).toEqual([10, 10, 10]);
    expect(l.aktiv).toBe(2);
    expect(l.wert).toBe(45);
  });
  it('Supersatz: ist eine Seite fertig, geht es mit der anderen allein weiter', () => {
    let l = starteEinheit(training, einheitA, kettenById, false, '2026-10-14');
    l = { ...l, uebungen: l.uebungen.map((u, i) => (i === 0 ? { ...u, saetze: [12, 12, 12] } : u)), aktiv: 1 };
    l = satz(l);
    expect(l.aktiv).toBe(1);
    expect(l.uebungen[1].saetze).toEqual([12]);
  });
  it('satzFertig springt auch zurück zu einer früheren offenen Übung und meldet Ende mit -1', () => {
    let l = starteEinheit(training, { art: 'schwer', ketten: ['core', 'mobilitaet'] }, kettenById, false, '2026-10-14');
    l = waehle(l, 2, kettenById);
    expect(l.wert).toBe(30);
    l = satz(l);
    expect(l.aktiv).toBe(0);
    expect(l.wert).toBe(45);
    l = satz(satz(satz(l)));
    expect(l.aktiv).toBe(1);
    l = satz(l);
    expect(l.aktiv).toBe(-1);
  });
  it('pauseNach: nicht zwischen A und B eines Paars, nicht nach Routine-Teilen, nicht am Ende', () => {
    const a = starteEinheit(training, { art: 'schwer', ketten: [['druecken-horizontal', 'ziehen'], 'core', 'mobilitaet'] }, kettenById, false, '2026-10-14');
    const b = satz(a);
    expect(pauseNach(a, b)).toBe(false); // A -> B
    const c = satz(b);
    expect(pauseNach(b, c)).toBe(true); // B -> A
    const kern = { ...a, aktiv: 2, wert: 45 };
    expect(pauseNach(kern, satz(kern))).toBe(true); // Core bleibt Core
    const mob = { ...a, aktiv: 3, wert: 45 };
    expect(pauseNach(mob, satz(mob))).toBe(false); // Routine -> nächster Teil
    const ende = { ...a, uebungen: a.uebungen.map((u, i) => (i === 4 ? u : { ...u, saetze: [1, 1, 1] })), aktiv: 4, wert: 30 };
    expect(pauseNach(ende, satz(ende))).toBe(false);
  });
  it('waehle setzt den Wert, gleiche Übung ändert nichts', () => {
    const l = starteEinheit(training, einheitA, kettenById, false, '2026-10-14');
    expect(waehle(l, 2, kettenById)).toMatchObject({ aktiv: 2, wert: 45 });
    expect(waehle(l, 0, kettenById)).toBe(l);
  });
  it('alter Laufend-Stand ohne partner und pause funktioniert weiter', () => {
    const alt = { index: 0, art: 'schwer', datum: '2026-10-14', aktiv: 0, wert: 45,
      uebungen: [{ kette: 'core', stufe: 0, teil: null, saetze: [] }, { kette: 'core', stufe: 0, teil: null, saetze: [] }] };
    expect(satz(alt).aktiv).toBe(0);
  });
  it('eintragAusLaufend: nur Übungen mit Sätzen, teil nur bei Routine, ohne Partner und Pause', () => {
    const l = {
      index: 2, art: 'schwer', datum: '2026-10-14', aktiv: -1, wert: 0, pause: { bis: 1, dauer: 90, text: '' },
      uebungen: [
        { kette: 'core', stufe: 0, teil: null, partner: null, saetze: [45, 40] },
        { kette: 'mobilitaet', stufe: 0, teil: 0, partner: null, saetze: [45] },
        { kette: 'mobilitaet', stufe: 0, teil: 1, partner: null, saetze: [] },
      ],
    };
    expect(eintragAusLaufend(l)).toEqual({
      datum: '2026-10-14', einheit: 3, art: 'schwer',
      uebungen: [{ kette: 'core', stufe: 0, saetze: [45, 40] }, { kette: 'mobilitaet', stufe: 0, teil: 0, saetze: [45] }],
    });
  });
});
