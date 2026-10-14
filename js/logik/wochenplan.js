// Wochenplan bearbeiten: Gerichte hinzufügen, entfernen, austauschen, Menge ändern.

const FELD = { abend: 'portionen', jause: 'anzahl', extra: 'anzahl' };

export function anzahlAendern(plan, typ, index, delta) {
  if (typ === 'snack') {
    if (!plan.snack) return plan;
    return { ...plan, snack: { ...plan.snack, anzahl: Math.max(1, Math.min(7, plan.snack.anzahl + delta)) } };
  }
  const feld = FELD[typ];
  return { ...plan, [typ]: plan[typ].map((e, i) => (i === index ? { ...e, [feld]: Math.max(1, e[feld] + delta) } : e)) };
}

export function hinzufuegen(plan, rezept) {
  if (rezept.typ === 'snack') return { ...plan, snack: { rezept: rezept.id, anzahl: plan.snack?.anzahl ?? 7 } };
  const liste = plan[rezept.typ];
  const vorhanden = liste.findIndex((e) => e.rezept === rezept.id);
  if (vorhanden >= 0) return rezept.typ === 'abend' ? plan : anzahlAendern(plan, rezept.typ, vorhanden, 1);
  const neu = { rezept: rezept.id, [FELD[rezept.typ]]: rezept.typ === 'abend' ? rezept.portionen : 1 };
  return { ...plan, [rezept.typ]: [...liste, neu] };
}

export function entfernen(plan, typ, index) {
  if (typ === 'snack') return { ...plan, snack: null };
  return { ...plan, [typ]: plan[typ].filter((_, i) => i !== index) };
}

export function austauschen(plan, typ, index, rezeptId) {
  if (typ === 'snack') return { ...plan, snack: { anzahl: 7, ...plan.snack, rezept: rezeptId } };
  return { ...plan, [typ]: plan[typ].map((e, i) => (i === index ? { ...e, rezept: rezeptId } : e)) };
}
