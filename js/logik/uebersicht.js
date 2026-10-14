// Übersicht: Wochenkalender (erledigt aus dem Log, ab heute Vorschau der Rotation) und Trainingssummen.
import { plusTage, montag, tageZwischen } from './datum.js';
import { zielFuer, zielwert } from './progression.js';

const kurzVon = (einheit) => ({ id: einheit.id, name: einheit.name, kurz: einheit.kurz ?? einheit.name });

// Sieben Tage ab Montag der Woche von heuteDatum (versatz: 0 = diese Woche, 1 = nächste).
// Vorschau für etwa 4 Einheiten pro Woche: nach jedem Trainingstag ein Ruhetag, dann die nächste Einheit.
// Der erste Plantag ist heute, frühestens aber zwei Tage nach dem letzten Training; eine laufende Einheit
// gehört immer zu heute. Vergangene Tage ohne Training sind "frei", künftige Pausentage "ruhe".
export function wochenKalender(training, plan, heuteDatum, versatz = 0) {
  const n = plan.einheiten.length;
  const start = plusTage(montag(heuteDatum), versatz * 7);
  const letztes = training.log.reduce((max, e) => (e.datum > max ? e.datum : max), '');
  let ersterPlanTag = heuteDatum;
  if (!training.laufend && letztes && plusTage(letztes, 2) > heuteDatum) ersterPlanTag = plusTage(letztes, 2);
  return Array.from({ length: 7 }, (_, i) => {
    const datum = plusTage(start, i);
    const eintraege = training.log.filter((e) => e.datum === datum);
    if (eintraege.length) {
      const einheiten = eintraege.map((e) => {
        const einheit = plan.einheiten[e.einheit - 1];
        return einheit ? kurzVon(einheit) : { id: null, name: `Einheit ${e.einheit}`, kurz: `E${e.einheit}` };
      });
      return { datum, status: 'erledigt', einheiten };
    }
    if (datum < heuteDatum) return { datum, status: 'frei', einheiten: [] };
    const abstand = tageZwischen(ersterPlanTag, datum);
    if (abstand < 0 || abstand % 2 === 1) return { datum, status: 'ruhe', einheiten: [] };
    const einheit = plan.einheiten[(training.naechsteEinheit + abstand / 2) % n];
    let status = 'geplant';
    if (datum === heuteDatum) status = training.laufend ? 'laeuft' : 'heute';
    return { datum, status, einheiten: [kurzVon(einheit)] };
  });
}

// Summen über alle Log-Einträge von bis einschließlich bis. Mobilitäts-Teile zählen nicht mit,
// unbekannte Ketten (nach einem Daten-Update) werden übersprungen.
export function trainingsSumme(log, kettenById, von, bis) {
  const summe = { einheiten: 0, saetze: 0, amZiel: 0, wdh: 0, sek: 0 };
  for (const e of log) {
    if (e.datum < von || e.datum > bis) continue;
    summe.einheiten += 1;
    for (const u of e.uebungen) {
      const kette = kettenById[u.kette];
      if (!kette || u.teil != null) continue;
      const stufe = kette.stufen[Math.min(u.stufe, kette.stufen.length - 1)];
      if (!stufe.ziel) continue;
      const ziel = zielFuer(stufe, e.art);
      const soll = zielwert(ziel);
      for (const wert of u.saetze) {
        summe.saetze += 1;
        if (wert >= soll) summe.amZiel += 1;
        if (ziel.sek != null) summe.sek += wert;
        else summe.wdh += wert;
      }
    }
  }
  return summe;
}
