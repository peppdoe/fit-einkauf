// Heute: Startseite mit heutiger Einheit, Wochenstreifen (erledigt und geplant) und Zusammenfassung Tag/Woche.
import { esc, sym, zahl } from './html.js';
import { naechsteEinheit, bloeckeFuerEinheit } from '../logik/rotation.js';
import { starteEinheit } from '../logik/einheit.js';
import { heute, plusTage, montag, tageZwischen, isoWoche } from '../logik/datum.js';
import { wochenKalender, trainingsSumme } from '../logik/uebersicht.js';
import * as pause from './pause.js';

const WT = ['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So'];
const WT_LANG = ['Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag', 'Sonntag'];
const MONATE = ['Jänner', 'Februar', 'März', 'April', 'Mai', 'Juni', 'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember'];
const STATUS = { erledigt: 'erledigt', frei: 'kein Training', heute: 'heute', laeuft: 'läuft', geplant: 'geplant' };

// Nur für diese Ansicht, wird nicht gespeichert: angezeigte Woche, gewählter Tag, Zeitraum der Zusammenfassung.
const ansicht = { versatz: 0, tag: null, zeitraum: 'woche' };

const tagNr = (d) => Number(d.slice(8));
const langDatum = (d) => `${WT_LANG[tageZwischen(montag(d), d)]}, ${tagNr(d)}. ${MONATE[Number(d.slice(5, 7)) - 1]}`;
const minSek = (s) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;

export function zeige(wurzel, ctx) {
  wurzel.onclick = (e) => {
    const el = e.target.closest('[data-aktion]');
    if (el && !el.disabled) AKTIONEN[el.dataset.aktion]?.(el, ctx, wurzel);
  };
  wurzel.onchange = (e) => {
    if (e.target.name !== 'zeitraum') return;
    ansicht.zeitraum = e.target.value;
    zeige(wurzel, ctx);
  };
  const datum = heute();
  const tage = wochenKalender(ctx.zustand.training, ctx.daten.plan, datum, ansicht.versatz);
  if (!tage.some((t) => t.datum === ansicht.tag)) ansicht.tag = ansicht.versatz === 0 ? datum : tage[0].datum;
  wurzel.innerHTML = `
    <header class="titelleiste">
      <div class="titelleiste__aktionen"></div>
      <h1 class="titelleiste__titel">Heute</h1>
      <p class="titelleiste__unter">${esc(langDatum(datum))}</p>
    </header>
    ${heuteKarte(ctx, datum)}
    ${wocheHtml(tage, datum)}
    ${zusammenfassungHtml(ctx, tage)}`;
}

function heuteKarte(ctx, datum) {
  const { zustand, daten } = ctx;
  const t = zustand.training;
  const n = daten.plan.einheiten.length;
  const heuteErledigt = t.log.filter((e) => e.datum === datum).at(-1);
  if (heuteErledigt && !t.laufend) {
    const einheit = daten.plan.einheiten[heuteErledigt.einheit - 1];
    const s = trainingsSumme([heuteErledigt], daten.kettenById, datum, datum);
    return `<section class="gruppe" aria-label="Training heute"><div class="gruppe__inhalt heute-karte">
      <div class="heute-karte__kopf">
        <span class="zeile__icon">${sym('training')}</span>
        <div><h2 class="heute-karte__titel">${esc(einheit?.name ?? `Einheit ${heuteErledigt.einheit}`)}</h2>
        <p class="heute-karte__unter">Einheit ${heuteErledigt.einheit} von ${n}</p></div>
      </div>
      <p class="heute-karte__fertig">${sym('haken')}Erledigt – stark.</p>
      <p>${s.amZiel} von ${s.saetze} Sätzen am Ziel. Morgen: ${esc(naechsteEinheit(t, daten.plan).name)}.</p>
    </div></section>`;
  }
  const einheit = naechsteEinheit(t, daten.plan);
  const nummer = (t.naechsteEinheit % n) + 1;
  const bloecke = bloeckeFuerEinheit(einheit, zustand.einstellungen.stange).map((block) => {
    const namen = block.filter((id) => daten.kettenById[id]).map((id) => {
      const kette = daten.kettenById[id];
      const stufe = kette.stufen[Math.min(t.stufen[id] ?? 0, kette.stufen.length - 1)];
      return stufe.routine ? null : stufe.name;
    });
    if (namen.every((x) => x === null)) return '<li>Mobilität · 5 min</li>';
    return `<li><b>${namen.filter(Boolean).map(esc).join(' ⇄ ')}</b></li>`;
  }).join('');
  const l = t.laufend;
  const unter = l
    ? `Übung ${Math.max(l.aktiv, 0) + 1} von ${l.uebungen.length}`
    : `ca. ${esc(einheit.dauer)}`;
  return `<section class="gruppe" aria-label="Training heute"><div class="gruppe__inhalt heute-karte">
    <div class="heute-karte__kopf">
      <span class="zeile__icon">${sym('training')}</span>
      <div><h2 class="heute-karte__titel">${esc(einheit.name)}</h2>
      <p class="heute-karte__unter">Einheit ${nummer} von ${n} · ${unter}</p></div>
    </div>
    <ul class="heute-karte__bloecke">${bloecke}</ul>
    ${knopf(l, t.vorschlaege.length > 0)}
  </div></section>`;
}

// Offene Steigerungsvorschläge stehen auf der Training-Startseite; dann führt der Knopf dorthin statt direkt zu starten.
function knopf(laufend, vorschlaege) {
  const klasse = 'knopf knopf--gefuellt knopf--gross knopf--breit';
  if (laufend) return `<a class="${klasse}" href="#/training">Weiter trainieren</a>`;
  if (vorschlaege) return `<a class="${klasse}" href="#/training">Zum Training</a>`;
  return `<button class="${klasse}" type="button" data-aktion="starten">Training starten</button>`;
}

function wocheHtml(tage, datum) {
  const { versatz } = ansicht;
  const name = { 0: 'Diese Woche', 1: 'Nächste Woche', '-1': 'Letzte Woche' }[versatz] ?? `${tagNr(tage[0].datum)}.–${tagNr(tage[6].datum)}.`;
  const knoepfe = tage.map((t, i) => {
    const klasse = ['tag', t.datum === datum && t.status !== 'erledigt' ? 'tag--heute' : '',
      t.status === 'erledigt' ? 'tag--erledigt' : '', t.status === 'frei' ? 'tag--frei' : ''].filter(Boolean).join(' ');
    const kurz = t.einheiten.map((e) => e.kurz).join(' + ');
    const marke = t.status === 'erledigt' ? `${sym('haken')}${esc(kurz)}` : t.einheiten.length ? esc(kurz) : '–';
    const vorlesen = `${WT_LANG[i]} ${tagNr(t.datum)}.: ${t.einheiten.map((e) => e.name).join(' und ') || 'kein Training'}, ${STATUS[t.status]}`;
    return `<button class="${klasse}" type="button" data-aktion="tag" data-tag="${t.datum}" aria-pressed="${t.datum === ansicht.tag}" aria-label="${esc(vorlesen)}">
      <span class="tag__wt">${WT[i]}</span><span class="tag__zahl">${tagNr(t.datum)}</span><span class="tag__marke">${marke}</span>
    </button>`;
  }).join('');
  return `<section class="gruppe" aria-labelledby="woche-titel">
    <div class="gruppe__kopf woche-kopf">
      <h2 id="woche-titel">${esc(name)} · KW ${Number(isoWoche(tage[0].datum).slice(6))}</h2>
      <div class="woche-kopf__pfeile">
        <button class="knopf knopf--schlicht" type="button" data-aktion="woche" data-schritt="-1" aria-label="Vorige Woche">${sym('zurueck')}</button>
        <button class="knopf knopf--schlicht" type="button" data-aktion="woche" data-schritt="1" aria-label="Nächste Woche"${versatz >= 4 ? ' disabled' : ''}>${sym('chevron')}</button>
      </div>
    </div>
    <div class="gruppe__inhalt woche" role="group" aria-label="Tage der Woche">${knoepfe}</div>
    <p class="gruppe__fuss">Ab heute geplant nach der Rotation. Lässt du einen Tag aus, rückt alles einen Tag weiter.</p>
  </section>`;
}

function kachel(name, zahlText, einheit, unter, erreicht = false) {
  return `<div class="kachel${erreicht ? ' kachel--erreicht' : ''}">
    <span class="kachel__name">${esc(name)}</span>
    <span><span class="kachel__zahl">${esc(zahlText)}</span>${einheit ? `<span class="kachel__einheit">${esc(einheit)}</span>` : ''}</span>
    ${unter ? `<span class="kachel__unter">${esc(unter)}</span>` : ''}
  </div>`;
}

function kachelnHtml(s, unterEinheiten) {
  return `<div class="kacheln">
    ${kachel('Einheiten', String(s.einheiten), '', unterEinheiten)}
    ${kachel('Sätze am Ziel', String(s.amZiel), `von ${s.saetze}`, s.saetze ? `${Math.round((s.amZiel / s.saetze) * 100)} %` : '', s.saetze > 0 && s.amZiel === s.saetze)}
    ${kachel('Wiederholungen', zahl(s.wdh), '', '')}
    ${kachel('Haltezeit', minSek(s.sek), 'min', '')}
  </div>`;
}

const leer = (titel, text) => `<div class="gruppe__inhalt leer"><p class="leer__titel">${esc(titel)}</p><p class="leer__text">${esc(text)}</p></div>`;

function zusammenfassungHtml(ctx, tage) {
  const { zustand, daten } = ctx;
  const woche = ansicht.zeitraum === 'woche';
  const t = tage.find((x) => x.datum === ansicht.tag);
  let inhalt;
  if (woche) {
    const s = trainingsSumme(zustand.training.log, daten.kettenById, tage[0].datum, tage[6].datum);
    const offen = tage.filter((x) => x.status !== 'erledigt' && x.status !== 'frei').length;
    inhalt = s.einheiten || !offen
      ? kachelnHtml(s, offen ? `${offen} noch geplant` : 'Woche abgeschlossen')
      : leer('Noch nichts trainiert', `${offen} Einheiten geplant. Die Woche liegt vor dir.`);
  } else if (t.status === 'erledigt') {
    inhalt = kachelnHtml(trainingsSumme(zustand.training.log, daten.kettenById, t.datum, t.datum), t.einheiten.map((e) => e.name).join(', '));
  } else if (t.status === 'frei') {
    inhalt = leer('Kein Training', 'An diesem Tag wurde nichts eingetragen.');
  } else {
    inhalt = geplantHtml(ctx, t);
  }
  return `<section class="gruppe" aria-labelledby="zf-titel">
    <h2 class="gruppe__kopf" id="zf-titel">Training · ${esc(woche ? 'Woche' : langDatum(t.datum))}</h2>
    <div class="segment-rahmen uebersicht-zeitraum">
      <fieldset class="segment" style="border: 0; margin: 0">
        <legend class="nur-vorlesen">Zeitraum</legend>
        <input type="radio" name="zeitraum" id="zr-tag" value="tag"${woche ? '' : ' checked'}><label for="zr-tag">Tag</label>
        <input type="radio" name="zeitraum" id="zr-woche" value="woche"${woche ? ' checked' : ''}><label for="zr-woche">Woche</label>
      </fieldset>
    </div>
    ${inhalt}
  </section>`;
}

// Geplanter Tag: Übungen der Einheit mit den heutigen Stufen (Vorschau, Stufen können bis dahin steigen).
function geplantHtml(ctx, t) {
  const { zustand, daten } = ctx;
  const einheit = daten.plan.einheiten.find((e) => e.id === t.einheiten[0].id);
  const zeilen = bloeckeFuerEinheit(einheit, zustand.einstellungen.stange).flat().filter((id) => daten.kettenById[id]).map((id) => {
    const kette = daten.kettenById[id];
    const stufe = kette.stufen[Math.min(zustand.training.stufen[id] ?? 0, kette.stufen.length - 1)];
    const wert = stufe.routine ? `${stufe.routine.length} Übungen` : `${stufe.ziel.saetze} × ${stufe.ziel.wdh ?? `${stufe.ziel.sek} s`}`;
    return `<li><div class="zeile"><div class="zeile__haupt"><div class="zeile__titel">${esc(stufe.routine ? kette.name : stufe.name)}</div></div>
      <span class="zeile__wert">${esc(wert)}</span></div></li>`;
  }).join('');
  return `<ul class="gruppe__inhalt">${zeilen}</ul>
    <p class="gruppe__fuss">${t.status === 'geplant' ? 'Vorschau mit deinen aktuellen Stufen.' : 'Steht heute an.'}</p>`;
}

const AKTIONEN = {
  starten(el, ctx) {
    pause.tonVorbereiten();
    ctx.aendern((z) => {
      const einheit = naechsteEinheit(z.training, ctx.daten.plan);
      z.training.laufend = starteEinheit(z.training, einheit, ctx.daten.kettenById, z.einstellungen.stange, heute());
      z.training.vorschlaege = [];
    });
    ctx.navigiere('#/training');
    window.scrollTo(0, 0);
  },
  tag(el, ctx, wurzel) {
    ansicht.tag = el.dataset.tag;
    ansicht.zeitraum = 'tag';
    zeige(wurzel, ctx);
  },
  woche(el, ctx, wurzel) {
    ansicht.versatz += Number(el.dataset.schritt);
    ansicht.tag = null;
    zeige(wurzel, ctx);
  },
};
