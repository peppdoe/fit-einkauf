// Abneigungen: ein Rezept ist ausgeblendet, wenn ein Eintrag in Name, Beschreibung, Tags oder Zutatennamen vorkommt.

export function istAusgeblendet(rezept, abneigungen, zutaten) {
  const texte = [
    rezept.name,
    rezept.beschreibung ?? '',
    ...(rezept.tags ?? []),
    ...(rezept.zutaten ?? []).map((z) => zutaten[z.zutat]?.name ?? z.zutat),
  ].map((t) => t.toLowerCase());
  return abneigungen.some((a) => {
    const suche = a.trim().toLowerCase();
    return suche !== '' && texte.some((t) => t.includes(suche));
  });
}

export function teileRezepte(rezepte, abneigungen, zutaten) {
  const sichtbar = [];
  const ausgeblendet = [];
  for (const r of rezepte) (istAusgeblendet(r, abneigungen, zutaten) ? ausgeblendet : sichtbar).push(r);
  return { sichtbar, ausgeblendet };
}
