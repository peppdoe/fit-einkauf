// Rotation nach Ablauf: es kommt immer die nächste Einheit, verpasste Tage verschieben nichts.

// Platzhalter im Plan: [mit Stange, ohne Stange]
export const PLATZHALTER = { ziehen: ['ziehen-stange', 'ziehen-ohne-stange'], bauch: ['core-haengend', 'core'] };

const ersetze = (id, stange) => PLATZHALTER[id]?.[stange ? 0 : 1] ?? id;

// Blöcke einer Einheit: ein Eintrag ist eine Kette oder ein Supersatz-Paar ["A", "B"].
// Platzhalter werden ersetzt; kommt eine Kette doppelt vor, fällt das spätere Vorkommen weg.
export function bloeckeFuerEinheit(einheit, stange) {
  const gesehen = new Set();
  return einheit.ketten
    .map((block) => (Array.isArray(block) ? block : [block])
      .map((id) => ersetze(id, stange))
      .filter((id) => !gesehen.has(id) && gesehen.add(id)))
    .filter((block) => block.length > 0);
}

export function kettenFuerEinheit(einheit, stange) {
  return bloeckeFuerEinheit(einheit, stange).flat();
}

// Alle Ketten, die mit dieser Stange-Einstellung in irgendeiner Einheit vorkommen.
export function kettenImPlan(plan, stange) {
  return new Set(plan.einheiten.flatMap((e) => kettenFuerEinheit(e, stange)));
}

export function naechsteEinheit(training, plan) {
  return plan.einheiten[training.naechsteEinheit % plan.einheiten.length];
}

export function abschliessen(training, plan, eintrag) {
  return {
    ...training,
    log: [...training.log, eintrag],
    naechsteEinheit: (training.naechsteEinheit + 1) % plan.einheiten.length,
    laufend: null,
  };
}

export function ueberspringen(training, plan) {
  return {
    ...training,
    naechsteEinheit: (training.naechsteEinheit + 1) % plan.einheiten.length,
    laufend: null,
  };
}
