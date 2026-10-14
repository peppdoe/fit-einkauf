// "Typischer Tag": jeder Teil des Wochenplans als Wochensumme / 7 (Abend, Jause, Snack, Extra).
// So zählen 4 Jausen pro Woche auch nur 4-mal, egal wie viele Tage die Woche hat.

const NULL = { kcal: 0, protein: 0 };
const werte = (pro) => ({ kcal: pro?.kcal ?? 0, protein: pro?.protein_g ?? 0 });
const proTag = (s) => ({ kcal: s.kcal / 7, protein: s.protein / 7 });

function summe(eintraege) {
  return eintraege.reduce((s, e) => ({ kcal: s.kcal + e.werte.kcal * e.anzahl, protein: s.protein + e.werte.protein * e.anzahl }), { ...NULL });
}

export function typischerTag(wochenplan, rezepteById) {
  const bekannt = (e) => rezepteById[e.rezept];

  const abendEintraege = wochenplan.abend.filter(bekannt)
    .map((e) => ({ werte: werte(rezepteById[e.rezept].pro_portion), anzahl: e.portionen }));
  const abendWoche = summe(abendEintraege);
  const portionen = abendEintraege.reduce((s, e) => s + e.anzahl, 0);
  const abendPortion = portionen ? { kcal: abendWoche.kcal / portionen, protein: abendWoche.protein / portionen } : { ...NULL };

  const jauseWoche = summe(wochenplan.jause.filter(bekannt).map((e) => {
    const rezept = rezepteById[e.rezept];
    return { werte: rezept.herkunft === 'reste' ? abendPortion : werte(rezept.pro_portion), anzahl: e.anzahl };
  }));

  const snackRezept = wochenplan.snack && rezepteById[wochenplan.snack.rezept];
  const snackWoche = snackRezept ? summe([{ werte: werte(snackRezept.pro_portion), anzahl: wochenplan.snack.anzahl }]) : { ...NULL };

  const extraWoche = summe(wochenplan.extra.filter(bekannt).map((e) => ({ werte: werte(rezepteById[e.rezept].pro_portion), anzahl: e.anzahl })));

  const teile = { abend: proTag(abendWoche), jause: proTag(jauseWoche), snack: proTag(snackWoche), extra: proTag(extraWoche) };
  const alle = Object.values(teile);
  return {
    ...teile,
    summe: { kcal: alle.reduce((s, t) => s + t.kcal, 0), protein: alle.reduce((s, t) => s + t.protein, 0) },
  };
}

export const jausenAnzahl = (wochenplan) => wochenplan.jause.reduce((s, e) => s + e.anzahl, 0);
