// Lädt data/*.json, prüft Verweise und baut Nachschlage-Tabellen. Fehler werden als Warnungen gemeldet, nicht geworfen.
import { pruefeFigur } from './logik/figur.js';

const ERSATZ = (id) => ({ name: id, kategorie: 'Sonstiges', grundvorrat: false, standard_markt: 'egal' });
const PFLICHT = ['zutaten', 'rezepte', 'uebungen', 'trainingsplan'];

export function verknuepfe({ zutaten, rezepte, uebungen, plan, aktionen }) {
  const warnungen = [];

  const katalog = { ...zutaten };
  for (const r of rezepte.rezepte) {
    for (const z of r.zutaten ?? []) {
      if (katalog[z.zutat]) continue;
      warnungen.push(`Rezept ${r.id}: unbekannte Zutat ${z.zutat}`);
      katalog[z.zutat] = ERSATZ(z.zutat);
    }
  }

  const kettenById = Object.fromEntries(uebungen.ketten.map((k) => [k.id, k]));
  for (const e of plan.einheiten) {
    for (const id of e.ketten.flat()) {
      if (id !== 'ziehen' && !kettenById[id]) warnungen.push(`Einheit ${e.name}: unbekannte Kette ${id}`);
    }
  }

  // Jede Stufe bzw. jeder Routine-Teil bekommt figurOk; eine fehlerhafte Figur wird einfach nicht gezeigt.
  for (const k of uebungen.ketten) {
    k.stufen.forEach((stufe, i) => {
      for (const teil of stufe.routine ?? [stufe]) {
        const fehler = pruefeFigur(teil);
        teil.figurOk = fehler.length === 0;
        if (fehler.length) warnungen.push(`${k.id}/${i} ${teil.name}: ${fehler.join(', ')}`);
      }
    });
  }

  return {
    daten: {
      zutaten: katalog,
      rezepte: rezepte.rezepte,
      rezepteById: Object.fromEntries(rezepte.rezepte.map((r) => [r.id, r])),
      ketten: uebungen.ketten,
      kettenById,
      plan,
      aktionen: aktionen?.aktionen ?? [],
    },
    warnungen,
  };
}

export async function ladeDaten(holen = (url) => fetch(url)) {
  const json = async (name) => {
    const antwort = await holen(`data/${name}.json`);
    if (!antwort.ok) throw new Error(`data/${name}.json: ${antwort.status}`);
    return antwort.json();
  };
  const [zutaten, rezepte, uebungen, plan] = await Promise.all(PFLICHT.map(json));
  let aktionen = null;
  try {
    aktionen = await json('aktionen');
  } catch {
    // aktionen.json ist im MVP optional
  }
  return verknuepfe({ zutaten, rezepte, uebungen, plan, aktionen });
}
