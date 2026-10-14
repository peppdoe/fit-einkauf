// Gewichts-Log: Wochenschnitt, Trend pro Monat (lineare Regression über die letzten 4 Wochen), kcal-Empfehlung.
import { isoWoche, montag, tageZwischen } from './datum.js';

export function parseKg(text) {
  const roh = String(text ?? '').trim();
  if (roh === '') return null;
  const n = Number(roh.replace(',', '.'));
  if (!Number.isFinite(n) || n < 20 || n > 300) return null;
  return Math.round(n * 10) / 10;
}

export function eintragen(gewicht, datum, kg) {
  return [...gewicht.filter((e) => e.datum !== datum), { datum, kg }].sort((a, b) => a.datum.localeCompare(b.datum));
}

export function wochenschnitte(gewicht) {
  const wochen = new Map();
  for (const e of gewicht) {
    const kw = isoWoche(e.datum);
    const w = wochen.get(kw) ?? { kw, montag: montag(e.datum), summe: 0, anzahl: 0 };
    w.summe += e.kg;
    w.anzahl += 1;
    wochen.set(kw, w);
  }
  return [...wochen.values()]
    .sort((a, b) => a.montag.localeCompare(b.montag))
    .map((w) => ({ kw: w.kw, montag: w.montag, kg: w.summe / w.anzahl, anzahl: w.anzahl }));
}

export function trendProMonat(gewicht) {
  const wochen = wochenschnitte(gewicht);
  if (!wochen.length) return null;
  const letzte = wochen[wochen.length - 1].montag;
  const fenster = wochen.filter((w) => tageZwischen(w.montag, letzte) < 28);
  if (fenster.length < 3) return null;
  const xs = fenster.map((w) => -tageZwischen(w.montag, letzte) / 7); // Wochen relativ zur letzten
  const ys = fenster.map((w) => w.kg);
  const mx = xs.reduce((s, x) => s + x, 0) / xs.length;
  const my = ys.reduce((s, y) => s + y, 0) / ys.length;
  let oben = 0;
  let unten = 0;
  xs.forEach((x, i) => {
    oben += (x - mx) * (ys[i] - my);
    unten += (x - mx) ** 2;
  });
  return ((oben / unten) * 52) / 12; // kg pro Woche -> kg pro Monat
}

export function empfehlung(trend) {
  if (trend == null) return null;
  if (trend > 0.75) return -150;
  if (trend < 0.25) return 150;
  return 0;
}
