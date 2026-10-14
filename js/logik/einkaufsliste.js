// Einkaufsliste aus dem Wochenplan: summieren, runden, nach Markt und Kategorie gruppieren.

export const MAERKTE = ['Lidl', 'Hofer', 'Spar', 'egal'];
export const KATEGORIEN = [
  'Obst & Gemüse', 'Brot & Gebäck', 'Kühlregal', 'Fleisch & Fisch', 'Tiefkühl', 'Vorrat', 'Gewürze', 'Sonstiges',
];
const MASS_EINHEITEN = ['g', 'ml'];

function posten(wochenplan) {
  return [
    ...wochenplan.abend.map((e) => ({ rezept: e.rezept, menge: e.portionen })),
    ...wochenplan.jause.map((e) => ({ rezept: e.rezept, menge: e.anzahl, nurMitnehmen: true })),
    ...(wochenplan.snack ? [{ rezept: wochenplan.snack.rezept, menge: wochenplan.snack.anzahl }] : []),
    ...wochenplan.extra.map((e) => ({ rezept: e.rezept, menge: e.anzahl })),
  ];
}

function gueltigePosten(wochenplan, rezepteById) {
  return posten(wochenplan).flatMap((p) => {
    const rezept = rezepteById[p.rezept];
    if (!rezept) return []; // Rezept wurde aus der Bibliothek entfernt
    if (p.nurMitnehmen && rezept.herkunft !== 'mitnehmen') return []; // Spar-Jause und Reste
    return [{ rezept, menge: p.menge }];
  });
}

function skaliert(rezept, menge) {
  const faktor = menge / rezept.portionen;
  return (rezept.zutaten ?? []).map((z) => ({
    zutat: z.zutat,
    einheit: z.einheit ?? '',
    menge: z.menge == null ? null : z.menge * faktor,
  }));
}

function zutatInfo(id, zutaten) {
  return zutaten[id] ?? { name: id, kategorie: 'Sonstiges', grundvorrat: false, standard_markt: 'egal' };
}

export function bedarf(wochenplan, rezepteById) {
  const summe = new Map();
  for (const { rezept, menge } of gueltigePosten(wochenplan, rezepteById)) {
    for (const z of skaliert(rezept, menge)) {
      const schluessel = `${z.zutat}|${z.einheit}`;
      const alt = summe.get(schluessel);
      if (!alt) {
        summe.set(schluessel, { schluessel, ...z, rezepte: [rezept.id] });
        continue;
      }
      alt.menge = alt.menge == null || z.menge == null ? alt.menge ?? z.menge : alt.menge + z.menge;
      if (!alt.rezepte.includes(rezept.id)) alt.rezepte.push(rezept.id);
    }
  }
  return [...summe.values()];
}

export function runde(menge, einheit) {
  if (menge == null) return null;
  if (MASS_EINHEITEN.includes(einheit)) return Math.max(10, Math.ceil(menge / 10 - 1e-9) * 10);
  return Math.ceil(menge * 2 - 1e-9) / 2;
}

export function marktFuer(zutatId, zutaten, marktZuordnung) {
  return marktZuordnung[zutatId] ?? zutatInfo(zutatId, zutaten).standard_markt ?? 'egal';
}

export function aktionFuer(zutatId, aktionen, heuteDatum) {
  if (!heuteDatum) return null;
  return aktionen.find((a) => a.zutat === zutatId && a.gueltig_von <= heuteDatum && heuteDatum <= a.gueltig_bis) ?? null;
}

export function einkaufsliste(bedarfListe, zutaten, einstellungen, aufgebraucht, aktionen = [], heuteDatum = null) {
  const zeilen = bedarfListe.map((b) => ({
    schluessel: b.schluessel, zutat: b.zutat, menge: runde(b.menge, b.einheit), einheit: b.einheit,
  }));
  for (const id of aufgebraucht) {
    if (!zeilen.some((z) => z.zutat === id)) zeilen.push({ schluessel: `${id}|`, zutat: id, menge: null, einheit: '' });
  }

  const gruppen = new Map(); // markt -> Map(kategorie -> zeilen)
  for (const z of zeilen) {
    const info = zutatInfo(z.zutat, zutaten);
    const istAufgebraucht = aufgebraucht.includes(z.zutat);
    if (info.grundvorrat && einstellungen.grundvorratAusblenden && !istAufgebraucht) continue;
    const markt = marktFuer(z.zutat, zutaten, einstellungen.marktZuordnung);
    const kategorie = KATEGORIEN.includes(info.kategorie) ? info.kategorie : 'Sonstiges';
    if (!gruppen.has(markt)) gruppen.set(markt, new Map());
    const kategorien = gruppen.get(markt);
    if (!kategorien.has(kategorie)) kategorien.set(kategorie, []);
    kategorien.get(kategorie).push({
      ...z,
      name: info.name,
      grundvorrat: !!info.grundvorrat,
      aufgebraucht: istAufgebraucht,
      aktion: aktionFuer(z.zutat, aktionen, heuteDatum),
    });
  }

  return MAERKTE.filter((m) => gruppen.has(m)).map((markt) => {
    const kategorien = gruppen.get(markt);
    const geordnet = KATEGORIEN.filter((k) => kategorien.has(k)).map((kategorie) => ({
      kategorie,
      zeilen: kategorien.get(kategorie).sort((a, b) => a.name.localeCompare(b.name, 'de')),
    }));
    return { markt, anzahl: geordnet.reduce((s, k) => s + k.zeilen.length, 0), kategorien: geordnet };
  });
}

export function nachRezept(wochenplan, rezepteById, zutaten) {
  return gueltigePosten(wochenplan, rezepteById).map(({ rezept, menge }) => ({
    rezept: rezept.id,
    name: rezept.name,
    menge,
    zeilen: skaliert(rezept, menge).map((z) => ({
      name: zutatInfo(z.zutat, zutaten).name,
      menge: runde(z.menge, z.einheit),
      einheit: z.einheit,
    })),
  }));
}

export function abhakenUmschalten(essen, schluessel) {
  const an = !essen.abgehakt[schluessel];
  const abgehakt = { ...essen.abgehakt };
  if (an) abgehakt[schluessel] = true;
  else delete abgehakt[schluessel];
  const zutat = schluessel.split('|')[0];
  return { ...essen, abgehakt, aufgebraucht: an ? essen.aufgebraucht.filter((id) => id !== zutat) : essen.aufgebraucht };
}

export function aufgebrauchtUmschalten(essen, zutatId) {
  const drin = essen.aufgebraucht.includes(zutatId);
  return { ...essen, aufgebraucht: drin ? essen.aufgebraucht.filter((id) => id !== zutatId) : [...essen.aufgebraucht, zutatId] };
}

export function neueWoche(essen, kw) {
  return { ...essen, abgehakt: {}, wochenplan: { ...essen.wochenplan, kw } };
}
