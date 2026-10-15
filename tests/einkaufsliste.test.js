import { describe, it, expect } from 'vitest';
import {
  bedarf, runde, einkaufsliste, nachRezept, aktionFuer, marktFuer,
  abhakenUmschalten, aufgebrauchtUmschalten, neueWoche, offeneAnzahl,
} from '../js/logik/einkaufsliste.js';

const zutaten = {
  huhn: { name: 'Hühnerbrustfilet', kategorie: 'Fleisch & Fisch', grundvorrat: false, standard_markt: 'Hofer' },
  reis: { name: 'Reis', kategorie: 'Konserven & Trockenes', grundvorrat: true, standard_markt: 'egal' },
  paprika: { name: 'Paprika', kategorie: 'Obst & Gemüse', grundvorrat: false, standard_markt: 'egal' },
  eier: { name: 'Eier', kategorie: 'Kühlregal', grundvorrat: false, standard_markt: 'Lidl' },
  oel: { name: 'Olivenöl', kategorie: 'Konserven & Trockenes', grundvorrat: true, standard_markt: 'egal' },
  salz: { name: 'Salz', kategorie: 'Gewürze', grundvorrat: true, standard_markt: 'egal' },
  mais: { name: 'Mais', kategorie: 'Konserven & Trockenes', grundvorrat: false, standard_markt: 'egal' },
};
const rezepteById = {
  pfanne: { id: 'pfanne', name: 'Pfanne', typ: 'abend', portionen: 4, zutaten: [
    { zutat: 'huhn', menge: 1000, einheit: 'g' }, { zutat: 'reis', menge: 800, einheit: 'g' },
    { zutat: 'paprika', menge: 2, einheit: 'Stück' }, { zutat: 'oel', menge: 3, einheit: 'EL' }, { zutat: 'salz' },
  ] },
  reispfanne: { id: 'reispfanne', name: 'Reispfanne', typ: 'abend', portionen: 4, zutaten: [
    { zutat: 'reis', menge: 500, einheit: 'g' }, { zutat: 'paprika', menge: 1, einheit: 'Stück' },
    { zutat: 'mais', menge: 1, einheit: 'Dose' },
  ] },
  eierjause: { id: 'eierjause', name: 'Eierjause', typ: 'jause', herkunft: 'mitnehmen', portionen: 1, zutaten: [
    { zutat: 'eier', menge: 3, einheit: 'Stück' }, { zutat: 'mais', menge: 70, einheit: 'g' },
  ] },
  sparjause: { id: 'sparjause', name: 'Leberkässemmel', typ: 'jause', herkunft: 'spar', portionen: 1, beschreibung: 'Feinkost' },
  snack: { id: 'snack', name: 'Snack', typ: 'snack', portionen: 1, zutaten: [{ zutat: 'mais', menge: 20, einheit: 'g' }] },
};
const plan = {
  kw: '2026-W42',
  abend: [{ rezept: 'pfanne', portionen: 2 }, { rezept: 'reispfanne', portionen: 4 }],
  jause: [{ rezept: 'eierjause', anzahl: 3 }, { rezept: 'sparjause', anzahl: 2 }, { rezept: 'geloescht', anzahl: 1 }],
  snack: { rezept: 'snack', anzahl: 7 },
  extra: [],
};
const einstellungen = { grundvorratAusblenden: false, marktZuordnung: {} };
const finde = (liste, zutat, einheit) => liste.flatMap((m) => m.kategorien.flatMap((k) => k.zeilen))
  .find((z) => z.zutat === zutat && (einheit === undefined || z.einheit === einheit));

describe('bedarf', () => {
  it('rechnet Portionen um, summiert gleiche Einheiten, trennt verschiedene', () => {
    const b = bedarf(plan, rezepteById);
    const get = (s) => b.find((x) => x.schluessel === s);
    expect(b).toHaveLength(8);
    expect(get('huhn|g').menge).toBe(500);
    expect(get('reis|g')).toMatchObject({ menge: 900, rezepte: ['pfanne', 'reispfanne'] });
    expect(get('paprika|Stück').menge).toBe(2);
    expect(get('oel|EL').menge).toBe(1.5);
    expect(get('salz|').menge).toBeNull();
    expect(get('eier|Stück').menge).toBe(9);
    expect(get('mais|g').menge).toBe(350);
    expect(get('mais|Dose').menge).toBe(1);
  });
  it('Spar-Jause und gelöschte Rezepte erzeugen keine Zeilen', () => {
    const b = bedarf({ ...plan, abend: [], snack: null, jause: [{ rezept: 'sparjause', anzahl: 5 }, { rezept: 'geloescht', anzahl: 1 }] }, rezepteById);
    expect(b).toEqual([]);
  });
});

describe('runde', () => {
  it('g und ml auf 10 aufrunden, mindestens 10', () => {
    expect(runde(562.5, 'g')).toBe(570);
    expect(runde(1, 'g')).toBe(10);
    expect(runde(1000, 'g')).toBe(1000);
    expect(runde(255, 'ml')).toBe(260);
  });
  it('Stück & Co. auf 0,5 aufrunden', () => {
    expect(runde(1.2, 'Stück')).toBe(1.5);
    expect(runde(1.5, 'EL')).toBe(1.5);
    expect(runde(0.75, 'Dose')).toBe(1);
    expect(runde(3, 'Stück')).toBe(3);
  });
  it('ohne Menge bleibt null', () => {
    expect(runde(null, '')).toBeNull();
  });
});

describe('einkaufsliste', () => {
  it('gruppiert nach Markt (feste Reihenfolge) und Kategorie (Laufweg)', () => {
    const liste = einkaufsliste(bedarf(plan, rezepteById), zutaten, einstellungen, []);
    expect(liste.map((m) => m.markt)).toEqual(['Lidl', 'Hofer', 'egal']);
    const egal = liste.find((m) => m.markt === 'egal');
    expect(egal.kategorien.map((k) => k.kategorie)).toEqual(['Obst & Gemüse', 'Konserven & Trockenes', 'Gewürze']);
    expect(egal.kategorien[1].zeilen.map((z) => z.name)).toEqual(['Mais', 'Mais', 'Olivenöl', 'Reis']);
    expect(egal.anzahl).toBe(6);
    expect(finde(liste, 'reis')).toMatchObject({ menge: 900, einheit: 'g', grundvorrat: true, aufgebraucht: false });
    expect(finde(liste, 'oel')).toMatchObject({ menge: 1.5, einheit: 'EL' });
  });
  it('Grundvorrat ausblenden, außer aufgebraucht', () => {
    const liste = einkaufsliste(bedarf(plan, rezepteById), zutaten, { ...einstellungen, grundvorratAusblenden: true }, ['oel']);
    expect(finde(liste, 'reis')).toBeUndefined();
    expect(finde(liste, 'salz')).toBeUndefined();
    expect(finde(liste, 'oel')).toMatchObject({ aufgebraucht: true });
  });
  it('aufgebrauchter Vorrat ohne Rezept im Plan steht trotzdem drauf; unbekannte Zutat unter egal/Sonstiges', () => {
    const liste = einkaufsliste([], zutaten, einstellungen, ['oel', 'butter']);
    expect(finde(liste, 'oel')).toMatchObject({ menge: null, aufgebraucht: true });
    const egal = liste.find((m) => m.markt === 'egal');
    expect(egal.kategorien.map((k) => k.kategorie)).toEqual(['Konserven & Trockenes', 'Sonstiges']);
    expect(finde(liste, 'butter')).toMatchObject({ name: 'butter' });
  });
  it('eigene Markt-Zuordnung hat Vorrang', () => {
    const liste = einkaufsliste(bedarf(plan, rezepteById), zutaten, { ...einstellungen, marktZuordnung: { reis: 'Hofer' } }, []);
    const hofer = liste.find((m) => m.markt === 'Hofer');
    expect(hofer.kategorien.flatMap((k) => k.zeilen).map((z) => z.zutat)).toEqual(['huhn', 'reis']);
    expect(marktFuer('reis', zutaten, { reis: 'Hofer' })).toBe('Hofer');
    expect(marktFuer('unbekannt', zutaten, {})).toBe('egal');
  });
  it('Aktion nur im Gültigkeitszeitraum', () => {
    const aktionen = [{ zutat: 'huhn', markt: 'Hofer', artikel: 'Hühnerbrustfilet', preis: 7.99, gueltig_von: '2026-10-16', gueltig_bis: '2026-10-18' }];
    expect(finde(einkaufsliste(bedarf(plan, rezepteById), zutaten, einstellungen, [], aktionen, '2026-10-17'), 'huhn').aktion.preis).toBe(7.99);
    expect(aktionFuer('huhn', aktionen, '2026-10-19')).toBeNull();
    expect(aktionFuer('huhn', aktionen, null)).toBeNull();
  });
});

describe('nachRezept', () => {
  it('pro Gericht die hochgerechneten Zutaten, Spar/gelöscht übersprungen', () => {
    const r = nachRezept(plan, rezepteById, zutaten);
    expect(r.map((x) => x.rezept)).toEqual(['pfanne', 'reispfanne', 'eierjause', 'snack']);
    expect(r[0]).toMatchObject({ name: 'Pfanne', menge: 2 });
    expect(r[0].zeilen).toEqual([
      { name: 'Hühnerbrustfilet', menge: 500, einheit: 'g' },
      { name: 'Reis', menge: 400, einheit: 'g' },
      { name: 'Paprika', menge: 1, einheit: 'Stück' },
      { name: 'Olivenöl', menge: 1.5, einheit: 'EL' },
      { name: 'Salz', menge: null, einheit: '' },
    ]);
  });
});

describe('Haken und Vorrat', () => {
  it('abhaken entfernt aus aufgebraucht, nochmal abhaken löscht den Haken', () => {
    const essen = { wochenplan: plan, abgehakt: {}, aufgebraucht: ['oel'] };
    const an = abhakenUmschalten(essen, 'oel|EL');
    expect(an.abgehakt).toEqual({ 'oel|EL': true });
    expect(an.aufgebraucht).toEqual([]);
    expect(abhakenUmschalten(an, 'oel|EL').abgehakt).toEqual({});
    expect(essen.aufgebraucht).toEqual(['oel']);
  });
  it('aufgebraucht umschalten', () => {
    const essen = { wochenplan: plan, abgehakt: {}, aufgebraucht: [] };
    const an = aufgebrauchtUmschalten(essen, 'reis');
    expect(an.aufgebraucht).toEqual(['reis']);
    expect(aufgebrauchtUmschalten(an, 'reis').aufgebraucht).toEqual([]);
  });
  it('neue Woche leert die Haken und setzt die KW', () => {
    const essen = { wochenplan: plan, abgehakt: { 'huhn|g': true }, aufgebraucht: ['oel'] };
    const neu = neueWoche(essen, '2026-W43');
    expect(neu.abgehakt).toEqual({});
    expect(neu.wochenplan.kw).toBe('2026-W43');
    expect(neu.wochenplan.abend).toBe(plan.abend);
    expect(neu.aufgebraucht).toEqual(['oel']);
  });
});

describe('offene Artikel je Markt', () => {
  it('zählt nur, was noch nicht abgehakt ist', () => {
    const markt = { markt: 'egal', kategorien: [
      { kategorie: 'Obst & Gemüse', zeilen: [{ schluessel: 'a' }, { schluessel: 'b' }] },
      { kategorie: 'Konserven & Trockenes', zeilen: [{ schluessel: 'c' }] },
    ] };
    expect(offeneAnzahl(markt, {})).toBe(3);
    expect(offeneAnzahl(markt, { a: true, c: true })).toBe(1);
    expect(offeneAnzahl(markt, { a: true, b: true, c: true })).toBe(0);
  });
});
