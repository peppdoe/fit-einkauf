// Blatt von unten (iOS-Sheet). Schließen: "Fertig", Tipp daneben, Escape oder nach unten wischen.
import { esc } from './html.js';

const wurzel = () => document.getElementById('blatt-wurzel');
let vorherFokus = null;

export function oeffne(inhalt, { titel }) {
  vorherFokus = document.activeElement;
  wurzel().innerHTML = `
    <div class="blatt-huelle">
      <section class="blatt" role="dialog" aria-modal="true" aria-labelledby="blatt-titel" tabindex="-1">
        <div class="blatt__griff" aria-hidden="true"></div>
        <div class="blatt__kopf">
          <h2 class="blatt__titel" id="blatt-titel">${esc(titel)}</h2>
          <button class="knopf knopf--schlicht" type="button" data-blatt-zu>Fertig</button>
        </div>
        ${inhalt}
      </section>
    </div>`;
  const huelle = wurzel().firstElementChild;
  const blatt = huelle.firstElementChild;
  huelle.addEventListener('click', (e) => {
    if (e.target === huelle || e.target.closest('[data-blatt-zu]')) schliesse();
  });
  huelle.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') schliesse();
  });
  wischen(blatt);
  blatt.focus();
  return blatt;
}

export function schliesse() {
  wurzel().innerHTML = '';
  vorherFokus?.focus?.();
  vorherFokus = null;
}

function wischen(blatt) {
  let startY = null;
  let weg = 0;
  blatt.addEventListener('pointerdown', (e) => {
    if (!e.target.closest('.blatt__griff, .blatt__kopf') || e.target.closest('button')) return;
    startY = e.clientY;
    weg = 0;
    blatt.setPointerCapture(e.pointerId);
  });
  blatt.addEventListener('pointermove', (e) => {
    if (startY === null) return;
    weg = Math.max(0, e.clientY - startY);
    blatt.style.transform = `translateY(${weg}px)`;
  });
  const ende = () => {
    if (startY === null) return;
    startY = null;
    if (weg > 80) schliesse();
    else blatt.style.transform = '';
  };
  blatt.addEventListener('pointerup', ende);
  blatt.addEventListener('pointercancel', ende);
}
