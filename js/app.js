// Start: Zustand laden, Daten laden, Ansicht zur Adresszeile zeichnen. ctx wird an alle Ansichten gegeben.
import { laden, speichern } from './speicher.js';
import { ladeDaten } from './daten.js';
import { parseRoute } from './route.js';
import { esc } from './ansichten/html.js';
import * as heuteAnsicht from './ansichten/heute.js';
import * as training from './ansichten/training.js';
import * as essen from './ansichten/essen.js';
import * as einkauf from './ansichten/einkauf.js';
import * as mehr from './ansichten/mehr.js';

const ANSICHTEN = { heute: heuteAnsicht, training, essen, einkauf, mehr };
const MELDUNGEN = {
  defekt: ['Gespeicherte Daten waren beschädigt', 'Die App startet mit Standardwerten. Die alten Daten kannst du unter Mehr → Daten exportieren.'],
  'nicht-lesbar': ['Speicher nicht lesbar', 'Die App läuft mit Standardwerten. Änderungen werden eventuell nicht gespeichert.'],
  voll: ['Speicher voll', 'Die letzte Änderung konnte nicht gespeichert werden. Exportiere deine Daten unter Mehr.'],
};

const haupt = document.getElementById('haupt');
const meldungWurzel = document.getElementById('meldung');

const ctx = {
  zustand: null,
  daten: null,
  meldung: null,
  aendern(fn) {
    fn(ctx.zustand);
    const r = speichern(window.localStorage, ctx.zustand);
    if (!r.ok) ctx.meldung = 'voll';
    else if (ctx.meldung === 'voll') ctx.meldung = null;
    zeichnen();
  },
  navigiere(hash) {
    if (location.hash === hash) zeichnen();
    else location.hash = hash;
  },
  ersetzen(zustand) {
    ctx.zustand = zustand;
    zeichnen();
  },
};

function meldungZeichnen() {
  const m = MELDUNGEN[ctx.meldung];
  meldungWurzel.innerHTML = m
    ? `<div class="hinweis hinweis--info" role="alert">
        <div class="hinweis__kopf"><div><p class="hinweis__titel">${esc(m[0])}</p><p class="hinweis__text">${esc(m[1])}</p></div></div>
        <div class="knopfreihe"><button class="knopf knopf--getoent" type="button" data-meldung-zu>Verstanden</button></div>
      </div>`
    : '';
}

meldungWurzel.addEventListener('click', (e) => {
  if (!e.target.closest('[data-meldung-zu]')) return;
  ctx.meldung = null;
  meldungZeichnen();
});

function zeichnen() {
  let route = parseRoute(location.hash);
  if (!ANSICHTEN[route.bereich]) route = { bereich: 'heute', teile: [], parameter: {} };
  for (const tab of document.querySelectorAll('.tableiste__tab')) {
    if (tab.dataset.bereich === route.bereich) tab.setAttribute('aria-current', 'page');
    else tab.removeAttribute('aria-current');
  }
  meldungZeichnen();
  // Handler der vorigen Ansicht entfernen; jede Ansicht setzt ihre eigenen.
  haupt.onclick = haupt.onchange = haupt.onsubmit = null;
  haupt.onpointerdown = haupt.onpointerup = haupt.onpointercancel = null;
  ANSICHTEN[route.bereich].zeige(haupt, ctx, route);
}

async function start() {
  const geladen = laden(window.localStorage);
  ctx.zustand = geladen.zustand;
  ctx.meldung = geladen.meldung;
  try {
    const { daten, warnungen } = await ladeDaten();
    ctx.daten = daten;
    for (const w of warnungen) console.warn(w);
  } catch (fehler) {
    console.error(fehler);
    haupt.innerHTML = `<div class="gruppe"><div class="gruppe__inhalt leer">
      <p class="leer__titel">Daten nicht geladen</p>
      <p class="leer__text">Die App-Daten sind noch nicht offline gespeichert. Prüfe die Internetverbindung und öffne die App erneut.</p>
    </div></div>`;
    return;
  }
  navigator.storage?.persist?.().catch(() => {});
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('sw.js').catch((fehler) => console.warn('Service Worker:', fehler));
  }
  window.addEventListener('hashchange', zeichnen);
  // Ohne Adresse: laufende Einheit geht vor, sonst die Übersicht.
  if (!location.hash) history.replaceState(null, '', ctx.zustand.training.laufend ? '#/training' : '#/heute');
  zeichnen();
}

start();
