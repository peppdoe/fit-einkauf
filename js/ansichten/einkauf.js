// Einkauf: Liste nach Markt (abhaken, langes Drücken für Markt/Vorrat) oder nach Rezept.
import { esc, sym, zahl, mengeText, datumKurz, sicher } from './html.js';
import {
  MAERKTE, bedarf, einkaufsliste, nachRezept, abhakenUmschalten, aufgebrauchtUmschalten, neueWoche, marktFuer, offeneAnzahl,
} from '../logik/einkaufsliste.js';
import { isoWoche, heute } from '../logik/datum.js';
import * as blatt from './blatt.js';

const MARKT_FARBE = { Lidl: 'var(--markt-lidl)', Hofer: 'var(--markt-hofer)', Spar: 'var(--markt-spar)', egal: 'var(--markt-egal)' };
const marktName = (m) => (m === 'egal' ? 'Egal wo' : m);
let druckZeit = null;
let klickSperren = false;

export function zeige(wurzel, ctx, route) {
  wurzel.onclick = (e) => {
    if (klickSperren) {
      // Nach langem Drücken nicht zusätzlich abhaken.
      e.preventDefault();
      klickSperren = false;
      return;
    }
    const el = e.target.closest('[data-aktion]');
    if (el && !el.disabled) AKTIONEN[el.dataset.aktion]?.(el, ctx);
  };
  wurzel.onchange = (e) => {
    const el = e.target;
    if (el.dataset.schluessel) ctx.aendern((z) => { z.essen = abhakenUmschalten(z.essen, el.dataset.schluessel); });
    if (el.dataset.einstellung === 'grundvorrat') ctx.aendern((z) => { z.einstellungen.grundvorratAusblenden = el.checked; });
  };
  wurzel.onpointerdown = (e) => {
    klickSperren = false;
    const zeile = e.target.closest('[data-zutat]');
    if (!zeile) return;
    clearTimeout(druckZeit);
    druckZeit = setTimeout(() => {
      klickSperren = true;
      marktBlatt(ctx, zeile.dataset.zutat);
    }, 500);
  };
  wurzel.onpointerup = wurzel.onpointercancel = () => clearTimeout(druckZeit);

  const { zustand, daten } = ctx;
  const plan = zustand.essen.wochenplan;
  const nachRezeptAnsicht = route.parameter.ansicht === 'rezept';
  const b = bedarf(plan, daten.rezepteById);
  const liste = einkaufsliste(b, daten.zutaten, zustand.einstellungen, zustand.essen.aufgebraucht, daten.aktionen, heute());
  const alleZeilen = liste.flatMap((m) => m.kategorien.flatMap((k) => k.zeilen));
  const offen = alleZeilen.filter((z) => !zustand.essen.abgehakt[z.schluessel]).length;
  const kw = plan.kw ?? isoWoche(heute());

  const kopf = `
    <header class="titelleiste">
      <div class="titelleiste__aktionen"></div>
      <h1 class="titelleiste__titel">Einkauf</h1>
      <p class="titelleiste__unter">KW ${kw.split('-W')[1]} · ${offen} offen</p>
    </header>
    <nav class="segment-rahmen" aria-label="Ansicht"><div class="segment">
      <a href="#/einkauf" ${nachRezeptAnsicht ? '' : 'aria-current="page"'}>Nach Markt</a>
      <a href="#/einkauf?ansicht=rezept" ${nachRezeptAnsicht ? 'aria-current="page"' : ''}>Nach Rezept</a>
    </div></nav>`;

  if (!b.length && !zustand.essen.aufgebraucht.length) {
    wurzel.innerHTML = `${kopf}
      <div class="gruppe"><div class="gruppe__inhalt leer">
        ${sym('einkauf', 'leer__icon')}
        <p class="leer__titel">Noch nichts geplant</p>
        <p class="leer__text">Wähl im Wochenplan deine Gerichte, dann steht hier die Einkaufsliste.</p>
        <a class="knopf knopf--getoent" href="#/essen">Zum Wochenplan</a>
      </div></div>`;
    return;
  }

  if (nachRezeptAnsicht) {
    wurzel.innerHTML = kopf + nachRezept(plan, daten.rezepteById, daten.zutaten).map((r) => `
      <section class="gruppe">
        <h2 class="gruppe__kopf">${esc(r.name)} · ${r.menge} ${r.menge === 1 ? 'Portion' : 'Portionen'}</h2>
        <ul class="gruppe__inhalt">${r.zeilen.map((z) => `<li><div class="zeile">
          <span class="zeile__haupt zeile__titel">${esc(z.name)}</span><span class="zeile__wert">${esc(mengeText(z.menge, z.einheit))}</span>
        </div></li>`).join('')}</ul>
      </section>`).join('');
    return;
  }

  const zeileHtml = (z) => {
    const an = !!zustand.essen.abgehakt[z.schluessel];
    const etiketten = [
      z.aktion ? `<span class="etikett etikett--gefahr">Aktion ${zahl(z.aktion.preis, 2)} € · bis ${datumKurz(z.aktion.gueltig_bis)}</span>` : '',
      z.aufgebraucht ? '<span class="etikett etikett--tint">Aufgebraucht</span>' : z.grundvorrat ? '<span class="etikett">Vorrat</span>' : '',
    ].join('');
    return `<li><label class="abhaken" data-zutat="${esc(z.zutat)}">
      <input type="checkbox" data-schluessel="${esc(z.schluessel)}" ${an ? 'checked' : ''}>
      <span class="abhaken__kreis">${sym('haken')}</span>
      <span class="abhaken__haupt">
        <span class="abhaken__name">${esc(z.name)}</span>
        <span class="abhaken__meta">${z.menge != null ? `<span class="abhaken__menge">${esc(mengeText(z.menge, z.einheit))}</span>` : ''}${etiketten}</span>
      </span>
    </label></li>`;
  };
  const maerkte = liste.map((m) => `
    <section class="gruppe" style="--markt: ${MARKT_FARBE[m.markt]}">
      <h2 class="marktkopf">
        <span class="marktkopf__punkt">${sym('tasche')}</span>
        <span class="marktkopf__name">${marktName(m.markt)}</span>
        <span class="marktkopf__anzahl" aria-label="${offeneAnzahl(m, zustand.essen.abgehakt)} offen">${offeneAnzahl(m, zustand.essen.abgehakt)}</span>
      </h2>
      <ul class="gruppe__inhalt">${m.kategorien.map((k) => `<li class="kategorie">${esc(k.kategorie)}</li>${k.zeilen.map(zeileHtml).join('')}`).join('')}</ul>
    </section>`).join('');

  wurzel.innerHTML = `${kopf}
    <div class="gruppe"><div class="gruppe__inhalt">
      <label class="zeile">
        <span class="zeile__haupt zeile__titel">Grundvorrat ausblenden</span>
        <input class="schalter" type="checkbox" role="switch" data-einstellung="grundvorrat" ${zustand.einstellungen.grundvorratAusblenden ? 'checked' : ''}>
      </label>
    </div></div>
    ${maerkte}
    <p class="gruppe__fuss gruppe__fuss--frei">Lange drücken, um den Markt zu ändern oder Vorrat als aufgebraucht zu markieren.</p>
    <section class="gruppe">
      <div class="gruppe__inhalt"><button class="zeile zeile--knopf zeile--gefahr" type="button" data-aktion="neue-woche">Neue Woche: alle Haken entfernen</button></div>
    </section>`;
}

function marktBlatt(ctx, zutatId) {
  const { zustand, daten } = ctx;
  const info = daten.zutaten[zutatId] ?? { name: zutatId, grundvorrat: false };
  const aktuell = marktFuer(zutatId, daten.zutaten, zustand.einstellungen.marktZuordnung);
  const aufgebraucht = zustand.essen.aufgebraucht.includes(zutatId);
  const el = blatt.oeffne(`
    <section class="gruppe">
      <h3 class="gruppe__kopf">Markt</h3>
      <ul class="gruppe__inhalt">${MAERKTE.map((m) => `<li><button class="zeile" type="button" data-markt="${m}">
        <span class="zeile__haupt zeile__titel">${marktName(m)}</span>
        ${m === aktuell ? `<span class="zeile__wert zeile__wert--tint">${sym('haken', 'symbol--klein')}</span>` : ''}
      </button></li>`).join('')}</ul>
    </section>
    ${info.grundvorrat ? `
    <section class="gruppe">
      <div class="gruppe__inhalt"><button class="zeile zeile--knopf" type="button" data-aufgebraucht>${aufgebraucht ? 'Doch noch Vorrat da' : 'Als aufgebraucht markieren'}</button></div>
      <p class="gruppe__fuss">Aufgebrauchter Vorrat steht auf der Liste, auch wenn der Grundvorrat ausgeblendet ist.</p>
    </section>` : ''}`, { titel: info.name });
  el.addEventListener('click', (e) => {
    const markt = e.target.closest('[data-markt]');
    if (markt) {
      blatt.schliesse();
      ctx.aendern((z) => { z.einstellungen.marktZuordnung = { ...z.einstellungen.marktZuordnung, [zutatId]: markt.dataset.markt }; });
    } else if (e.target.closest('[data-aufgebraucht]')) {
      blatt.schliesse();
      ctx.aendern((z) => { z.essen = aufgebrauchtUmschalten(z.essen, zutatId); });
    }
  });
}

const AKTIONEN = {
  'neue-woche'(el, ctx) {
    if (!sicher(el, 'Nochmal tippen: alle Haken entfernen')) return;
    ctx.aendern((z) => { z.essen = neueWoche(z.essen, isoWoche(heute())); });
  },
};
