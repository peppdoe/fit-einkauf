// Nur für die Musterseite „Heute“: Wochenstreifen, Tag/Woche und die Zustände der Heute-Karte mit Musterdaten.
// Die echte Logik entsteht in Task 23 (js/logik/uebersicht.js, js/ansichten/heute.js).
import { plusTage, montag, tageZwischen, isoWoche } from '../js/logik/datum.js';

const HEUTE = '2026-10-14';
const stand = new URLSearchParams(location.search).get('stand') ?? 'offen';

const PLAN = [
  { name: 'Oberkörper A', kurz: 'OK A', dauer: '30 min', bloecke: [['Liegestütz', 'Negativ-Klimmzug'], ['Unterarmstütz']], ziele: ['3 × 15', '3 × 5', '3 × 45 s'] },
  { name: 'Beine', kurz: 'Beine', dauer: '30 min', bloecke: [['Kniebeuge', 'Einbeinige Hüftbrücke'], ['Unterarmstütz']], ziele: ['3 × 20', '3 × 12', '3 × 45 s'] },
  { name: 'Oberkörper B', kurz: 'OK B', dauer: '35 min', bloecke: [['Pike Push-up', 'Negativ-Klimmzug'], ['Liegestütz', 'Tischrudern']], ziele: ['3 × 10', '3 × 5', '3 × 15', '3 × 12'] },
  { name: 'Beine & Core', kurz: 'B & C', dauer: '30 min', bloecke: [['Kniebeuge', 'Einbeinige Hüftbrücke'], ['Unterarmstütz']], ziele: ['3 × 20', '3 × 12', '3 × 45 s'] },
];

// Musterverlauf: { datum, einheit (1-basiert), saetze, amZiel, wdh, sek }
const LOG = [
  { datum: '2026-10-05', einheit: 3, saetze: 12, amZiel: 10, wdh: 126, sek: 0 },
  { datum: '2026-10-06', einheit: 4, saetze: 9, amZiel: 9, wdh: 96, sek: 135 },
  { datum: '2026-10-08', einheit: 1, saetze: 9, amZiel: 5, wdh: 55, sek: 125 },
  { datum: '2026-10-09', einheit: 2, saetze: 9, amZiel: 7, wdh: 92, sek: 135 },
  { datum: '2026-10-10', einheit: 3, saetze: 12, amZiel: 10, wdh: 128, sek: 0 },
  { datum: '2026-10-11', einheit: 4, saetze: 9, amZiel: 9, wdh: 96, sek: 135 },
  { datum: '2026-10-12', einheit: 1, saetze: 9, amZiel: 6, wdh: 57, sek: 130 },
  { datum: '2026-10-13', einheit: 2, saetze: 9, amZiel: 8, wdh: 94, sek: 135 },
];
if (stand === 'erledigt') LOG.push({ datum: HEUTE, einheit: 3, saetze: 12, amZiel: 11, wdh: 130, sek: 0 });
const naechste = stand === 'erledigt' ? 3 : 2;   // 0-basiert
const laufend = stand === 'laeuft';

const WT = ['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So'];
const WT_LANG = ['Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag', 'Sonntag'];
const MONATE = ['Jänner', 'Februar', 'März', 'April', 'Mai', 'Juni', 'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember'];
const tagNr = (d) => Number(d.slice(8));
const langDatum = (d) => `${WT_LANG[tageZwischen(montag(d), d)]}, ${tagNr(d)}. ${MONATE[Number(d.slice(5, 7)) - 1]}`;
const sym = (name) => `<svg class="symbol" aria-hidden="true"><use href="../bilder/symbole.svg#${name}"/></svg>`;
const tausender = (n) => n.toLocaleString('de-AT');
const minSek = (s) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;

// Spiegel von wochenKalender() aus Task 23
function wochenKalender(versatz) {
  const start = plusTage(montag(HEUTE), versatz * 7);
  const heuteErledigt = LOG.some((e) => e.datum === HEUTE);
  const erster = heuteErledigt ? plusTage(HEUTE, 1) : HEUTE;
  return Array.from({ length: 7 }, (_, i) => {
    const datum = plusTage(start, i);
    const eintraege = LOG.filter((e) => e.datum === datum);
    if (eintraege.length) return { datum, status: 'erledigt', einheit: PLAN[eintraege[0].einheit - 1], eintrag: eintraege[0] };
    if (datum < erster) return { datum, status: 'frei', einheit: null };
    const einheit = PLAN[(naechste + tageZwischen(erster, datum)) % PLAN.length];
    const status = datum === HEUTE ? (laufend ? 'laeuft' : 'heute') : 'geplant';
    return { datum, status, einheit };
  });
}

let versatz = 0;
let gewaehlt = HEUTE;
let zeitraum = 'woche';

// ---------- Heute-Karte ----------

function heuteKarte() {
  const tage = wochenKalender(0);
  const heute = tage.find((t) => t.datum === HEUTE);
  const e = heute.einheit;
  const nummer = PLAN.indexOf(e) + 1;
  const bloecke = e.bloecke.map((b) => `<li><b>${b.join(' ⇄ ')}</b></li>`).join('') + '<li>Mobilität · 5 min</li>';
  const kopf = `
    <div class="heute-karte__kopf">
      <span class="zeile__icon">${sym('training')}</span>
      <div>
        <h2 class="heute-karte__titel">${e.name}</h2>
        <p class="heute-karte__unter">Einheit ${nummer} von ${PLAN.length} · ${laufend ? 'Übung 3 von 6' : `ca. ${e.dauer}`}</p>
      </div>
    </div>`;
  const karte = document.querySelector('[data-heute-karte]');
  if (heute.status === 'erledigt') {
    karte.innerHTML = `${kopf}
      <p class="heute-karte__fertig">${sym('haken')}Erledigt – stark.</p>
      <p>${heute.eintrag.amZiel} von ${heute.eintrag.saetze} Sätzen am Ziel. Morgen: ${PLAN[naechste % PLAN.length].name}.</p>`;
    return;
  }
  karte.innerHTML = `${kopf}
    <ul class="heute-karte__bloecke">${bloecke}</ul>
    <a class="knopf knopf--gefuellt knopf--gross knopf--breit" href="training.html">${laufend ? 'Weiter trainieren' : 'Training starten'}</a>`;
}

// ---------- Wochenstreifen ----------

function streifen() {
  const tage = wochenKalender(versatz);
  if (!tage.some((t) => t.datum === gewaehlt)) gewaehlt = versatz === 0 ? HEUTE : tage[0].datum;
  document.querySelector('[data-woche-titel]').textContent =
    `${versatz === 0 ? 'Diese Woche' : versatz === 1 ? 'Nächste Woche' : versatz === -1 ? 'Letzte Woche' : `${tagNr(tage[0].datum)}.–${tagNr(tage[6].datum)}.`} · KW ${Number(isoWoche(tage[0].datum).slice(6))}`;
  document.querySelector('[data-woche="-1"]').disabled = versatz <= -1;
  document.querySelector('[data-woche="1"]').disabled = versatz >= 1;
  document.querySelector('[data-streifen]').innerHTML = tage.map((t, i) => {
    const istHeute = t.datum === HEUTE;
    const klasse = ['tag', istHeute && t.status !== 'erledigt' ? 'tag--heute' : '', t.status === 'erledigt' ? 'tag--erledigt' : '', t.status === 'frei' ? 'tag--frei' : ''].join(' ').trim();
    const marke = t.status === 'erledigt' ? `${sym('haken')}${t.einheit.kurz}` : t.einheit ? t.einheit.kurz : '–';
    const vorlesen = `${WT_LANG[i]} ${tagNr(t.datum)}.: ${t.einheit ? t.einheit.name : 'kein Training'}, ${{ erledigt: 'erledigt', frei: 'frei', heute: 'heute', laeuft: 'läuft', geplant: 'geplant' }[t.status]}`;
    return `<button class="${klasse}" type="button" data-tag="${t.datum}" aria-pressed="${t.datum === gewaehlt}" aria-label="${vorlesen}">
      <span class="tag__wt">${WT[i]}</span>
      <span class="tag__zahl">${tagNr(t.datum)}</span>
      <span class="tag__marke">${marke}</span>
    </button>`;
  }).join('');
}

// ---------- Zusammenfassung ----------

function kachel(name, zahl, einheit, unter, erreicht = false) {
  return `<div class="kachel${erreicht ? ' kachel--erreicht' : ''}">
    <span class="kachel__name">${name}</span>
    <span><span class="kachel__zahl">${zahl}</span>${einheit ? `<span class="kachel__einheit">${einheit}</span>` : ''}</span>
    ${unter ? `<span class="kachel__unter">${unter}</span>` : ''}
  </div>`;
}

function summeKacheln(s, unterEinheiten) {
  return `<div class="kacheln">
    ${kachel('Einheiten', s.einheiten, '', unterEinheiten)}
    ${kachel('Sätze am Ziel', s.amZiel, `von ${s.saetze}`, s.saetze ? `${Math.round((s.amZiel / s.saetze) * 100)} %` : '', s.saetze > 0 && s.amZiel === s.saetze)}
    ${kachel('Wiederholungen', tausender(s.wdh), '', '')}
    ${kachel('Haltezeit', minSek(s.sek), 'min', 'Core')}
  </div>`;
}

function geplantListe(t) {
  const namen = t.einheit.bloecke.flat();
  const zeilen = namen.map((n, i) => `<li><div class="zeile">
      <div class="zeile__haupt"><div class="zeile__titel">${n}</div></div>
      <span class="zeile__wert">${t.einheit.ziele[i]}</span>
    </div></li>`).join('');
  return `<ul class="gruppe__inhalt">${zeilen}<li><div class="zeile">
      <div class="zeile__haupt"><div class="zeile__titel">Mobilität</div></div><span class="zeile__wert">5 min</span></div></li></ul>
    <p class="gruppe__fuss">${t.status === 'geplant' ? 'Vorschau mit deinen aktuellen Stufen.' : 'Steht heute an.'}</p>`;
}

function zusammenfassung() {
  const ziel = document.querySelector('[data-zusammenfassung]');
  const titel = document.querySelector('[data-zusammenfassung-titel]');
  const tage = wochenKalender(versatz);
  if (zeitraum === 'woche') {
    const log = LOG.filter((e) => e.datum >= tage[0].datum && e.datum <= tage[6].datum);
    const s = log.reduce((a, e) => ({ einheiten: a.einheiten + 1, saetze: a.saetze + e.saetze, amZiel: a.amZiel + e.amZiel, wdh: a.wdh + e.wdh, sek: a.sek + e.sek }), { einheiten: 0, saetze: 0, amZiel: 0, wdh: 0, sek: 0 });
    const offen = tage.filter((t) => ['heute', 'geplant', 'laeuft'].includes(t.status)).length;
    titel.textContent = 'Training · Woche';
    ziel.innerHTML = log.length || offen === 0
      ? summeKacheln(s, offen ? `${offen} noch geplant` : 'Woche abgeschlossen')
      : `<div class="gruppe__inhalt leer"><p class="leer__titel">Noch nichts trainiert</p><p class="leer__text">${offen} Einheiten geplant. Die Woche liegt vor dir.</p></div>`;
    return;
  }
  const t = tage.find((x) => x.datum === gewaehlt);
  titel.textContent = `Training · ${langDatum(t.datum)}`;
  if (t.status === 'erledigt') {
    ziel.innerHTML = summeKacheln({ einheiten: 1, ...t.eintrag }, t.einheit.name);
  } else if (t.status === 'frei') {
    ziel.innerHTML = `<div class="gruppe__inhalt leer"><p class="leer__titel">Kein Training</p><p class="leer__text">An diesem Tag wurde nichts eingetragen.</p></div>`;
  } else {
    ziel.innerHTML = geplantListe(t);
  }
}

function alles() {
  streifen();
  zusammenfassung();
}

// ---------- Bedienung ----------

document.querySelector('[data-streifen]').addEventListener('click', (e) => {
  const tag = e.target.closest('[data-tag]');
  if (!tag) return;
  gewaehlt = tag.dataset.tag;
  zeitraum = 'tag';
  document.getElementById('zr-tag').checked = true;
  alles();
});

document.querySelectorAll('[data-woche]').forEach((knopf) => knopf.addEventListener('click', () => {
  versatz += Number(knopf.dataset.woche);
  gewaehlt = versatz === 0 ? HEUTE : plusTage(montag(HEUTE), versatz * 7);
  alles();
}));

document.querySelectorAll('input[name="zeitraum"]').forEach((wahl) => wahl.addEventListener('change', () => {
  zeitraum = wahl.value;
  zusammenfassung();
}));

document.querySelector('[data-datum]').textContent = langDatum(HEUTE);
heuteKarte();
alles();
