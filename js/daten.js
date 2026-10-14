// Lädt data/*.json, prüft Verweise und baut Nachschlage-Tabellen. Fehler werden als Warnungen gemeldet, nicht geworfen.
// Scheibe 1: nur Übungen und Trainingsplan. Zutaten und Rezepte kommen mit Essen & Einkauf dazu.

const PFLICHT = ['uebungen', 'trainingsplan'];

export function verknuepfe({ uebungen, plan }) {
  const warnungen = [];
  const kettenById = Object.fromEntries(uebungen.ketten.map((k) => [k.id, k]));
  for (const e of plan.einheiten) {
    for (const id of e.ketten.flat()) {
      if (id !== 'ziehen' && !kettenById[id]) warnungen.push(`Einheit ${e.name}: unbekannte Kette ${id}`);
    }
  }
  return {
    daten: { ketten: uebungen.ketten, kettenById, plan },
    warnungen,
  };
}

export async function ladeDaten(holen = (url) => fetch(url)) {
  const json = async (name) => {
    const antwort = await holen(`data/${name}.json`);
    if (!antwort.ok) throw new Error(`data/${name}.json: ${antwort.status}`);
    return antwort.json();
  };
  const [uebungen, plan] = await Promise.all(PFLICHT.map(json));
  return verknuepfe({ uebungen, plan });
}
