// Kleine Hilfen für die Ansichten: sicheres HTML, Symbole, deutsche Zahlen.

const ZEICHEN = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };

export function esc(wert) {
  return String(wert ?? '').replace(/[&<>"']/g, (c) => ZEICHEN[c]);
}

export function sym(name, klasse = '') {
  return `<svg class="symbol${klasse ? ` ${klasse}` : ''}" aria-hidden="true"><use href="bilder/symbole.svg#${name}"/></svg>`;
}

export function zahl(n, stellen = 0) {
  return Number(n).toLocaleString('de-DE', { minimumFractionDigits: stellen, maximumFractionDigits: stellen });
}

export function mengeText(menge, einheit) {
  if (menge == null) return '';
  const text = zahl(menge, Number.isInteger(menge) ? 0 : 1);
  return einheit ? `${text} ${einheit}` : text;
}

export function zielText(ziel, seitig = false) {
  const wert = ziel.wdh != null ? `${ziel.wdh}` : `${ziel.sek} s`;
  return `${ziel.saetze} × ${wert}${seitig ? ' / Seite' : ''}`;
}

export function datumKurz(datum) {
  const [, monat, tag] = datum.split('-');
  return `${Number(tag)}.${Number(monat)}.`;
}

// Zweistufige Bestätigung ohne Dialog: erster Tipp ändert den Text, zweiter führt aus.
export function sicher(el, text) {
  if (el.dataset.sicher) return true;
  el.dataset.sicher = '1';
  el.textContent = text;
  return false;
}
