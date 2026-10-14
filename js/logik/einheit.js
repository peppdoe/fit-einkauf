// Laufende Trainingseinheit: Übungen aufbauen, Sätze erfassen, zwischen Supersatz-Partnern wechseln,
// zur nächsten offenen Übung springen.
import { bloeckeFuerEinheit } from './rotation.js';
import { zielFuer, zielwert } from './progression.js';

export function aufloesen(eintrag, kettenById, art) {
  const kette = kettenById[eintrag.kette];
  const stufe = kette.stufen[Math.min(eintrag.stufe, kette.stufen.length - 1)];
  const quelle = eintrag.teil != null ? stufe.routine[eintrag.teil] : stufe;
  const ziel = eintrag.teil != null ? { saetze: 1, sek: quelle.sek } : zielFuer(stufe, art);
  return {
    name: quelle.name,
    ziel,
    seitig: !!quelle.seitig,
    figur: quelle.figurOk === false ? null : quelle.figur ?? null,
    hinweise: quelle.hinweise ?? [],
    achtung: quelle.achtung ?? null,
  };
}

export const schrittweite = (ziel) => (ziel.sek != null ? 5 : 1);

// Startwert einer Übung: letzter Satz, sonst das Ziel.
function startwert(eintrag, kettenById, art) {
  return eintrag.saetze.length ? eintrag.saetze.at(-1) : zielwert(aufloesen(eintrag, kettenById, art).ziel);
}

export function starteEinheit(training, einheit, kettenById, stange, datum) {
  const uebungen = [];
  for (const block of bloeckeFuerEinheit(einheit, stange)) {
    const bekannt = block.filter((id) => kettenById[id]);
    const erster = uebungen.length;
    for (const id of bekannt) {
      const kette = kettenById[id];
      const stufe = Math.min(training.stufen[id] ?? 0, kette.stufen.length - 1);
      const routine = kette.stufen[stufe].routine;
      if (routine) {
        routine.forEach((_, teil) => uebungen.push({ kette: id, stufe, teil, partner: null, saetze: [] }));
      } else {
        uebungen.push({ kette: id, stufe, teil: null, partner: null, saetze: [] });
      }
    }
    // Ein Paar aus zwei einfachen Übungen wird zum Supersatz.
    if (bekannt.length === 2 && uebungen.length - erster === 2) {
      uebungen[erster].partner = erster + 1;
      uebungen[erster + 1].partner = erster;
    }
  }
  return {
    index: training.naechsteEinheit,
    art: einheit.art,
    datum,
    aktiv: uebungen.length ? 0 : -1,
    wert: uebungen.length ? startwert(uebungen[0], kettenById, einheit.art) : 0,
    pause: null,
    uebungen,
  };
}

export function satzFertig(laufend, kettenById) {
  const uebungen = laufend.uebungen.map((u, i) => (i === laufend.aktiv ? { ...u, saetze: [...u.saetze, laufend.wert] } : u));
  const offen = (i) => uebungen[i].saetze.length < aufloesen(uebungen[i], kettenById, laufend.art).ziel.saetze;
  const partner = uebungen[laufend.aktiv].partner;
  let aktiv = -1;
  if (partner != null && uebungen[partner] && offen(partner)) aktiv = partner;
  else if (offen(laufend.aktiv)) return { ...laufend, uebungen };
  else {
    for (let schritt = 1; schritt <= uebungen.length; schritt++) {
      const i = (laufend.aktiv + schritt) % uebungen.length;
      if (offen(i)) { aktiv = i; break; }
    }
  }
  return { ...laufend, uebungen, aktiv, wert: aktiv >= 0 ? startwert(uebungen[aktiv], kettenById, laufend.art) : 0 };
}

// Braucht es nach dem Satz eine Pause? Nicht zwischen erster und zweiter Übung eines Paars,
// nicht nach einem Teil der Mobilitäts-Routine und nicht, wenn alles erledigt ist.
export function pauseNach(vorher, nachher) {
  if (nachher.aktiv < 0) return false;
  const u = vorher.uebungen[vorher.aktiv];
  if (u.teil != null) return false;
  if (u.partner != null && u.partner > vorher.aktiv && nachher.aktiv === u.partner) return false;
  return true;
}

export function waehle(laufend, index, kettenById) {
  if (index === laufend.aktiv) return laufend;
  return { ...laufend, aktiv: index, wert: startwert(laufend.uebungen[index], kettenById, laufend.art) };
}

export function eintragAusLaufend(laufend) {
  return {
    datum: laufend.datum,
    einheit: laufend.index + 1,
    art: laufend.art,
    uebungen: laufend.uebungen
      .filter((u) => u.saetze.length > 0)
      .map(({ kette, stufe, teil, saetze }) => (teil == null ? { kette, stufe, saetze } : { kette, stufe, teil, saetze })),
  };
}
