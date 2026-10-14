// Datumshilfen. Alle Datumswerte sind Texte "JJJJ-MM-TT"; gerechnet wird in UTC, damit Sommerzeit nicht stört.

const TAG = 86400000;

function utc(datum) {
  const [j, m, t] = datum.split('-').map(Number);
  return Date.UTC(j, m - 1, t);
}

function alsText(ms) {
  return new Date(ms).toISOString().slice(0, 10);
}

export function heute(jetzt = new Date()) {
  const m = String(jetzt.getMonth() + 1).padStart(2, '0');
  const t = String(jetzt.getDate()).padStart(2, '0');
  return `${jetzt.getFullYear()}-${m}-${t}`;
}

export function plusTage(datum, n) {
  return alsText(utc(datum) + n * TAG);
}

export function tageZwischen(von, bis) {
  return Math.round((utc(bis) - utc(von)) / TAG);
}

export function montag(datum) {
  const wochentag = (new Date(utc(datum)).getUTCDay() + 6) % 7; // Montag = 0
  return plusTage(datum, -wochentag);
}

export function isoWoche(datum) {
  const donnerstag = plusTage(montag(datum), 3);
  const jahr = Number(donnerstag.slice(0, 4));
  const woche = Math.floor(tageZwischen(`${jahr}-01-01`, donnerstag) / 7) + 1;
  return `${jahr}-W${String(woche).padStart(2, '0')}`;
}
