// Progression: Ziel in allen Sätzen an 2 aufeinanderfolgenden schweren Einheiten -> Steigerung vorschlagen.

export function zielFuer(stufe, art) {
  const ziel = { ...stufe.ziel };
  if (art === 'leicht') ziel.saetze = Math.min(ziel.saetze, 2);
  return ziel;
}

export const zielwert = (ziel) => ziel.wdh ?? ziel.sek;

export function erreicht(saetze, ziel) {
  if (saetze.length < ziel.saetze) return false;
  return saetze.slice(0, ziel.saetze).every((w) => w >= zielwert(ziel));
}

export function erfolgsserie(log, kette, stufe) {
  let serie = 0;
  for (let i = log.length - 1; i >= 0; i--) {
    const e = log[i];
    if (e.art !== 'schwer') continue;
    const u = e.uebungen.find((x) => x.kette === kette.id && x.teil == null);
    if (!u) continue;
    if (u.stufe !== stufe || !erreicht(u.saetze, kette.stufen[stufe].ziel)) break;
    serie++;
  }
  return serie;
}

export function vorschlaegeNachAbschluss(log, stufen, kettenById) {
  const letzter = log[log.length - 1];
  if (!letzter || letzter.art !== 'schwer') return [];
  return letzter.uebungen
    .filter((u) => u.teil == null)
    .flatMap((u) => {
      const kette = kettenById[u.kette];
      if (!kette) return [];
      const stufe = stufen[kette.id] ?? 0;
      if (stufe >= kette.stufen.length - 1 || erfolgsserie(log, kette, stufe) < 2) return [];
      const naechste = kette.stufen[stufe + 1];
      return [{ kette: kette.id, nach: stufe + 1, name: naechste.name, ziel: naechste.ziel }];
    });
}

export function stufeVerschieben(stufen, kette, delta) {
  const jetzt = stufen[kette.id] ?? 0;
  const neu = Math.max(0, Math.min(kette.stufen.length - 1, jetzt + delta));
  return { ...stufen, [kette.id]: neu };
}
