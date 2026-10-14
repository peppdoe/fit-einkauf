// Persistenz in localStorage. storage wird übergeben (Browser: window.localStorage), damit es ohne Browser testbar ist.
import { tageZwischen } from './logik/datum.js';

export const SCHEMA = 1;
export const SCHLUESSEL = 'fitEinkauf';

// Migrationen: Schlüssel = altes Schema, Funktion liefert den Zustand für Schema + 1.
export const MIGRATIONEN = {};

export function standardZustand() {
  return {
    schema: SCHEMA,
    einstellungen: {
      ziele: { kcal: 2950, protein: 130 },
      jauseTage: 4,
      abneigungen: ['curry', 'tofu'],
      stange: true,
      grundvorratAusblenden: false,
      marktZuordnung: {},
      pauseSek: { schwer: 90, leicht: 60 },
    },
    training: { naechsteEinheit: 0, stufen: {}, laufend: null, vorschlaege: [], log: [] },
    essen: {
      wochenplan: { kw: null, abend: [], jause: [], snack: { rezept: 'skyr-haferflocken', anzahl: 7 }, extra: [] },
      abgehakt: {},
      aufgebraucht: [],
    },
    gewicht: [],
    letzterExport: null,
  };
}

const istObjekt = (x) => x !== null && typeof x === 'object' && !Array.isArray(x);

export function pruefeZustand(z) {
  if (!istObjekt(z)) return ['kein Datenobjekt'];
  const fehler = [];
  if (!Number.isInteger(z.schema)) fehler.push('schema fehlt');
  if (!istObjekt(z.einstellungen) || !istObjekt(z.einstellungen.ziele)) fehler.push('einstellungen fehlen');
  const t = z.training;
  if (!istObjekt(t) || !Number.isInteger(t.naechsteEinheit) || !istObjekt(t.stufen) || !Array.isArray(t.log)) {
    fehler.push('training fehlt');
  }
  const e = z.essen;
  if (!istObjekt(e) || !istObjekt(e.wochenplan) || !istObjekt(e.abgehakt) || !Array.isArray(e.aufgebraucht)) {
    fehler.push('essen fehlt');
  }
  if (!Array.isArray(z.gewicht)) fehler.push('gewicht fehlt');
  return fehler;
}

export function migriere(z, migrationen = MIGRATIONEN, ziel = SCHEMA) {
  if (z.schema > ziel) throw new Error(`Die Daten stammen aus einer neueren Version der App (Schema ${z.schema}).`);
  let aktuell = z;
  while (aktuell.schema < ziel) {
    const schritt = migrationen[aktuell.schema];
    if (!schritt) throw new Error(`Keine Migration von Schema ${aktuell.schema} vorhanden.`);
    aktuell = { ...schritt(aktuell), schema: aktuell.schema + 1 };
  }
  return aktuell;
}

// Füllt fehlende optionale Felder mit Standardwerten (z. B. nach einem Import älterer Exporte).
function ergaenze(z) {
  const s = standardZustand();
  return {
    ...s,
    ...z,
    einstellungen: {
      ...s.einstellungen,
      ...z.einstellungen,
      pauseSek: { ...s.einstellungen.pauseSek, ...z.einstellungen.pauseSek },
    },
    training: { ...s.training, ...z.training },
    essen: { ...s.essen, ...z.essen, wochenplan: { ...s.essen.wochenplan, ...z.essen.wochenplan } },
  };
}

export function laden(storage) {
  let roh;
  try {
    roh = storage.getItem(SCHLUESSEL);
  } catch {
    return { zustand: standardZustand(), meldung: 'nicht-lesbar' };
  }
  if (roh === null) return { zustand: standardZustand(), meldung: null };
  try {
    const z = JSON.parse(roh);
    if (pruefeZustand(z).length) throw new Error('ungültig');
    return { zustand: ergaenze(migriere(z)), meldung: null };
  } catch {
    try {
      storage.setItem(`${SCHLUESSEL}.defekt`, roh);
    } catch {
      // Speicher voll: der Rohtext bleibt dann unter dem Hauptschlüssel, bis wieder gespeichert wird.
    }
    return { zustand: standardZustand(), meldung: 'defekt' };
  }
}

export function speichern(storage, zustand) {
  try {
    storage.setItem(SCHLUESSEL, JSON.stringify(zustand));
    return { ok: true };
  } catch {
    return { ok: false, fehler: 'voll' };
  }
}

export function importieren(storage, text) {
  let z;
  try {
    z = JSON.parse(text);
  } catch {
    return { ok: false, fehler: 'Die Datei ist kein gültiges JSON.' };
  }
  const fehler = pruefeZustand(z);
  if (fehler.length) return { ok: false, fehler: `Die Datei passt nicht zu Fit & Einkauf (${fehler.join(', ')}).` };
  try {
    z = ergaenze(migriere(z));
  } catch (e) {
    return { ok: false, fehler: e.message };
  }
  try {
    const alt = storage.getItem(SCHLUESSEL);
    if (alt !== null) storage.setItem(`${SCHLUESSEL}.backup`, alt);
  } catch {
    // Ohne lesbaren alten Stand gibt es keine Sicherung; der Import geht trotzdem weiter.
  }
  const r = speichern(storage, z);
  return r.ok ? { ok: true, zustand: z } : { ok: false, fehler: 'Der Speicher ist voll.' };
}

export const exportDateiname = (datum) => `fit-einkauf-${datum}.json`;

export const exportText = (zustand) => JSON.stringify(zustand, null, 2);

export function exportFaellig(zustand, heuteDatum) {
  if (zustand.letzterExport === null) return zustand.training.log.length > 0 || zustand.gewicht.length > 0;
  return tageZwischen(zustand.letzterExport, heuteDatum) > 14;
}
