import { describe, it, expect } from 'vitest';
import {
  SCHLUESSEL, standardZustand, pruefeZustand, migriere, laden, speichern,
  importieren, exportDateiname, exportText, exportFaellig,
} from '../js/speicher.js';

function fakeSpeicher(start = {}) {
  const daten = new Map(Object.entries(start));
  return {
    daten,
    getItem: (k) => (daten.has(k) ? daten.get(k) : null),
    setItem: (k, v) => { daten.set(k, String(v)); },
  };
}

describe('speicher', () => {
  it('ohne gespeicherte Daten: Standardzustand', () => {
    const { zustand, meldung } = laden(fakeSpeicher());
    expect(meldung).toBeNull();
    expect(zustand.einstellungen.ziele).toEqual({ kcal: 2950, protein: 130 });
    expect(zustand.einstellungen.jauseTage).toBe(4);
    expect(zustand.einstellungen.stange).toBe(true);
    expect(zustand.einstellungen.abneigungen).toEqual(['curry', 'tofu']);
    expect(zustand.einstellungen.pauseSek).toEqual({ schwer: 90, leicht: 60 });
    expect(zustand.essen.wochenplan.snack).toEqual({ rezept: 'skyr-haferflocken', anzahl: 7 });
    expect(pruefeZustand(zustand)).toEqual([]);
  });

  it('angefangene Einheit samt laufender Pause übersteht Speichern und Laden', () => {
    const s = fakeSpeicher();
    const z = standardZustand();
    z.training.laufend = {
      index: 0, art: 'schwer', datum: '2026-10-14', aktiv: 1, wert: 11,
      pause: { bis: 1760000000000, dauer: 90, text: 'Pause · dann Klimmzug' },
      uebungen: [
        { kette: 'druecken-horizontal', stufe: 1, teil: null, partner: 1, saetze: [12] },
        { kette: 'ziehen-stange', stufe: 0, teil: null, partner: 0, saetze: [] },
      ],
    };
    expect(speichern(s, z)).toEqual({ ok: true });
    expect(laden(s).zustand.training.laufend).toEqual(z.training.laufend);
  });

  it('beschädigte Daten: Standardzustand und Rohtext unter .defekt', () => {
    const s = fakeSpeicher({ [SCHLUESSEL]: '{kaputt' });
    const { zustand, meldung } = laden(s);
    expect(meldung).toBe('defekt');
    expect(zustand).toEqual(standardZustand());
    expect(s.getItem(`${SCHLUESSEL}.defekt`)).toBe('{kaputt');
  });

  it('gültiges JSON mit falscher Form gilt als defekt', () => {
    const s = fakeSpeicher({ [SCHLUESSEL]: '{"schema":1}' });
    expect(laden(s).meldung).toBe('defekt');
  });

  it('nicht lesbarer Speicher', () => {
    const s = { getItem: () => { throw new Error('gesperrt'); }, setItem: () => {} };
    expect(laden(s).meldung).toBe('nicht-lesbar');
  });

  it('fehlende optionale Felder werden ergänzt', () => {
    const alt = standardZustand();
    delete alt.einstellungen.pauseSek;
    delete alt.einstellungen.jauseTage;
    delete alt.training.vorschlaege;
    const s = fakeSpeicher({ [SCHLUESSEL]: JSON.stringify(alt) });
    const { zustand } = laden(s);
    expect(zustand.einstellungen.pauseSek).toEqual({ schwer: 90, leicht: 60 });
    expect(zustand.einstellungen.jauseTage).toBe(4);
    expect(zustand.training.vorschlaege).toEqual([]);
  });

  it('voller Speicher', () => {
    const s = { getItem: () => null, setItem: () => { throw new Error('QuotaExceededError'); } };
    expect(speichern(s, standardZustand())).toEqual({ ok: false, fehler: 'voll' });
  });

  it('migriere führt Schritte der Reihe nach aus', () => {
    const migrationen = { 0: (z) => ({ ...z, neu: true }) };
    expect(migriere({ schema: 0 }, migrationen, 1)).toEqual({ schema: 1, neu: true });
  });

  it('migriere lehnt neuere Daten ab', () => {
    expect(() => migriere({ schema: 2 }, {}, 1)).toThrow(/neueren Version/);
  });

  it('Import: gültige Datei ersetzt den Stand und sichert den alten', () => {
    const alt = JSON.stringify(standardZustand());
    const s = fakeSpeicher({ [SCHLUESSEL]: alt });
    const neu = standardZustand();
    neu.gewicht = [{ datum: '2026-10-14', kg: 72.4 }];
    const r = importieren(s, JSON.stringify(neu));
    expect(r.ok).toBe(true);
    expect(r.zustand.gewicht).toEqual(neu.gewicht);
    expect(s.getItem(`${SCHLUESSEL}.backup`)).toBe(alt);
    expect(JSON.parse(s.getItem(SCHLUESSEL)).gewicht).toEqual(neu.gewicht);
  });

  it('Import: kein JSON wird abgelehnt, Stand bleibt', () => {
    const alt = JSON.stringify(standardZustand());
    const s = fakeSpeicher({ [SCHLUESSEL]: alt });
    const r = importieren(s, '\u0089PNG binär');
    expect(r).toEqual({ ok: false, fehler: 'Die Datei ist kein gültiges JSON.' });
    expect(s.getItem(SCHLUESSEL)).toBe(alt);
    expect(s.getItem(`${SCHLUESSEL}.backup`)).toBeNull();
  });

  it('Import: falsche Form wird mit Grund abgelehnt', () => {
    const r = importieren(fakeSpeicher(), JSON.stringify({ schema: 1, foto: true }));
    expect(r.ok).toBe(false);
    expect(r.fehler).toMatch(/^Die Datei passt nicht/);
  });

  it('Import: Datei aus neuerer Version wird abgelehnt', () => {
    const neuer = { ...standardZustand(), schema: 9 };
    const s = fakeSpeicher();
    const r = importieren(s, JSON.stringify(neuer));
    expect(r.ok).toBe(false);
    expect(r.fehler).toMatch(/neueren Version/);
    expect(s.getItem(SCHLUESSEL)).toBeNull();
  });

  it('Import: nicht lesbarer Speicher bricht nicht ab', () => {
    const daten = new Map();
    const s = { getItem: () => { throw new Error('gesperrt'); }, setItem: (k, v) => daten.set(k, v) };
    const r = importieren(s, JSON.stringify(standardZustand()));
    expect(r.ok).toBe(true);
    expect(daten.has(SCHLUESSEL)).toBe(true);
  });

  it('Export-Dateiname und Text', () => {
    expect(exportDateiname('2026-10-14')).toBe('fit-einkauf-2026-10-14.json');
    expect(JSON.parse(exportText(standardZustand()))).toEqual(standardZustand());
  });

  it('Export fällig nach mehr als 14 Tagen oder nie exportiert mit Daten', () => {
    const z = standardZustand();
    expect(exportFaellig(z, '2026-10-14')).toBe(false);
    z.gewicht = [{ datum: '2026-10-01', kg: 72 }];
    expect(exportFaellig(z, '2026-10-14')).toBe(true);
    z.letzterExport = '2026-10-01';
    expect(exportFaellig(z, '2026-10-15')).toBe(false);
    expect(exportFaellig(z, '2026-10-16')).toBe(true);
  });
});
