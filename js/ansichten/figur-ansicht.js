// Kleine Übungsfigur (Start/Ende im Wechsel) und das "So geht's"-Blatt.
import { poseZuSvg } from '../logik/figur.js';
import { esc } from './html.js';
import * as blatt from './blatt.js';

const bild = (pose, geraet, klasse = '') =>
  `<svg${klasse ? ` class="${klasse}"` : ''} viewBox="0 0 120 84" aria-hidden="true">${poseZuSvg(pose, geraet)}</svg>`;

// info.figur ist null, wenn die Figur fehlt oder fehlerhaft ist (figurOk false, siehe aufloesen).
export function figurMini(info) {
  if (!info.figur) return '';
  const { start, ende, geraet } = info.figur;
  return `<button class="figur-mini" type="button" data-aktion="so-gehts" aria-label="So geht's: ${esc(info.name)}">
    ${bild(start, geraet, 'figur-mini__start')}${bild(ende, geraet, 'figur-mini__ende')}
  </button>`;
}

export function soGehtsOeffnen(info) {
  const posen = info.figur
    ? `<div class="posen">
        <figure class="posen__bild">${bild(info.figur.start, info.figur.geraet)}<figcaption>Start</figcaption></figure>
        <figure class="posen__bild">${bild(info.figur.ende, info.figur.geraet)}<figcaption>Ende</figcaption></figure>
      </div>`
    : '';
  const hinweise = info.hinweise.length
    ? `<ul class="hinweise">${info.hinweise.map((h) => `<li>${esc(h)}</li>`).join('')}</ul>`
    : '';
  const achtung = info.achtung ? `<p class="achtung"><strong>Achte darauf:</strong> ${esc(info.achtung)}</p>` : '';
  blatt.oeffne(posen + hinweise + achtung, { titel: `So geht's: ${info.name}` });
}
