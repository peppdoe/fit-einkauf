// Essen: Wochenplan mit typischem Tag, Bibliothek mit Abneigungs-Filter, Rezept-Detail.
import { esc, sym, zahl, mengeText, sicher } from './html.js';
import { typischerTag, jausenAnzahl } from '../logik/naehrwerte.js';
import { teileRezepte } from '../logik/filter.js';
import { hinzufuegen, entfernen, austauschen, anzahlAendern } from '../logik/wochenplan.js';
import { isoWoche, heute } from '../logik/datum.js';

const TYPEN = { abend: 'Abend', jause: 'Jause', snack: 'Snack', extra: 'Extra' };
const HERKUNFT = { mitnehmen: 'mitnehmen', spar: 'beim Spar kaufen', reste: 'Reste vom Abend' };
const HINZU = { abend: 'Gericht hinzufügen', jause: 'Jause hinzufügen', extra: 'Extra hinzufügen' };

export function zeige(wurzel, ctx, route) {
  wurzel.onclick = (e) => {
    const el = e.target.closest('[data-aktion]');
    if (el && !el.disabled) AKTIONEN[el.dataset.aktion]?.(el, ctx);
  };
  if (route.teile[0] === 'bibliothek') return zeigeBibliothek(wurzel, ctx, route.parameter);
  if (route.teile[0] === 'rezept') return zeigeRezept(wurzel, ctx, route.teile[1], route.parameter);
  return zeigeWoche(wurzel, ctx);
}

function metaText(r) {
  const nw = r.pro_portion
    ? `${r.geschaetzt ? 'ca. ' : ''}${zahl(r.pro_portion.kcal)} kcal · ${zahl(r.pro_portion.protein_g)} g Protein`
    : 'Nährwerte wie das Abendessen';
  if (r.typ === 'abend') return `${r.zeit_min} min · ${nw}`;
  if (r.typ === 'jause') {
    const kuehl = r.herkunft === 'mitnehmen' && r.ohne_kuehlung === false ? 'im Sommer Kühlakku' : '';
    return [HERKUNFT[r.herkunft], nw, kuehl].filter(Boolean).join(' · ');
  }
  return nw;
}

function kopf(titel, unter, zurueck = null) {
  return `<header class="titelleiste">
    <div class="titelleiste__aktionen${zurueck ? ' titelleiste__aktionen--links' : ''}">
      ${zurueck ? `<a class="knopf knopf--schlicht" href="${zurueck.href}">${sym('zurueck')}${esc(zurueck.text)}</a>` : ''}
    </div>
    <h1 class="titelleiste__titel${titel.length > 22 ? ' titelleiste__titel--lang' : ''}">${esc(titel)}</h1>
    <p class="titelleiste__unter">${esc(unter)}</p>
  </header>`;
}

function umschalter(aktiv) {
  return `<nav class="segment-rahmen" aria-label="Essen"><div class="segment">
    <a href="#/essen" ${aktiv === 'woche' ? 'aria-current="page"' : ''}>Woche</a>
    <a href="#/essen/bibliothek" ${aktiv === 'bibliothek' ? 'aria-current="page"' : ''}>Bibliothek</a>
  </div></nav>`;
}

function balken(name, wert, ziel, einheit) {
  const anteil = ziel > 0 ? wert / ziel : 0;
  return `<div class="naehrwert${anteil >= 1 ? ' naehrwert--erreicht' : ''}" style="--anteil: ${anteil.toFixed(3)}">
    <div class="naehrwert__kopf"><span class="naehrwert__name">${name}</span><span class="naehrwert__zahl"><b>${zahl(wert)}</b> von ${zahl(ziel)} ${einheit}</span></div>
    <div class="naehrwert__bahn" role="img" aria-label="${name}: ${zahl(wert)} von ${zahl(ziel)} ${einheit}"><div class="naehrwert__balken"></div><div class="naehrwert__ziel"></div></div>
  </div>`;
}

function planZeile(ctx, typ, eintrag, index) {
  const r = ctx.daten.rezepteById[eintrag.rezept];
  const feld = typ === 'abend' ? 'portionen' : 'anzahl';
  const wert = eintrag[feld];
  const max = typ === 'snack' ? 7 : 99;
  const name = r ? r.name : 'Unbekanntes Rezept';
  const unter = r ? metaText(r) : `„${eintrag.rezept}“ ist nicht mehr in der Bibliothek`;
  return `<li><div class="zeile">
    <a class="zeile__haupt zeile__link" href="#/essen/rezept/${encodeURIComponent(eintrag.rezept)}?tausch=${typ}%3A${index}">
      <span class="zeile__titel">${esc(name)}</span><span class="zeile__unter">${esc(unter)}</span>
    </a>
    <div class="mini-zaehler" role="group" aria-label="${feld === 'portionen' ? 'Portionen' : 'Anzahl'}: ${esc(name)}">
      <button type="button" data-aktion="weniger" data-typ="${typ}" data-index="${index}" aria-label="Weniger" ${wert <= 1 ? 'disabled' : ''}>${sym('minus')}</button>
      <output>${wert}</output>
      <button type="button" data-aktion="mehr" data-typ="${typ}" data-index="${index}" aria-label="Mehr" ${wert >= max ? 'disabled' : ''}>${sym('plus')}</button>
    </div>
  </div></li>`;
}

function zeigeWoche(wurzel, ctx) {
  const { zustand, daten } = ctx;
  const plan = zustand.essen.wochenplan;
  const ziele = zustand.einstellungen.ziele;
  const tag = typischerTag(plan, daten.rezepteById);
  const kw = plan.kw ?? isoWoche(heute());
  const jausen = jausenAnzahl(plan);
  const jauseTage = zustand.einstellungen.jauseTage ?? 4;
  const fuss = {
    jause: jausen < jauseTage
      ? `${jausen} von ${jauseTage} Jausen eingeplant – es fehlen noch ${jauseTage - jausen} für deine Arbeitstage.`
      : `${jausen} Jausen für ${jauseTage} Arbeitstage eingeplant.`,
  };
  const liste = (typ, titel) => `
    <section class="gruppe">
      <h2 class="gruppe__kopf">${titel}</h2>
      <ul class="gruppe__inhalt">
        ${plan[typ].map((e, i) => planZeile(ctx, typ, e, i)).join('')}
        <li><a class="zeile zeile--knopf" href="#/essen/bibliothek?typ=${typ}">${sym('plus', 'symbol--klein')}${HINZU[typ]}</a></li>
      </ul>
      ${fuss[typ] ? `<p class="gruppe__fuss">${esc(fuss[typ])}</p>` : ''}
    </section>`;
  const snack = `
    <section class="gruppe">
      <h2 class="gruppe__kopf">Snack täglich</h2>
      <ul class="gruppe__inhalt">${plan.snack
        ? planZeile(ctx, 'snack', plan.snack, 0)
        : `<li><a class="zeile zeile--knopf" href="#/essen/bibliothek?typ=snack">${sym('plus', 'symbol--klein')}Snack wählen</a></li>`}</ul>
    </section>`;
  wurzel.innerHTML = `
    ${kopf('Essen', `Wochenplan · KW ${kw.split('-W')[1]}`)}
    ${umschalter('woche')}
    <section class="gruppe">
      <h2 class="gruppe__kopf gruppe__kopf--gross">Typischer Tag</h2>
      <div class="gruppe__inhalt">${balken('Kalorien', tag.summe.kcal, ziele.kcal, 'kcal')}${balken('Protein', tag.summe.protein, ziele.protein, 'g')}</div>
      <p class="gruppe__fuss">Wochenschnitt pro Tag: Abend ${zahl(tag.abend.kcal)} · Jause ${zahl(tag.jause.kcal)} · Snack ${zahl(tag.snack.kcal)} · Extra ${zahl(tag.extra.kcal)} kcal. Der Strich markiert dein Ziel.</p>
    </section>
    ${liste('abend', 'Abendessen')}
    ${liste('jause', 'Jause an Arbeitstagen')}
    ${snack}
    ${liste('extra', 'Kalorien-Extra')}`;
}

function zeigeBibliothek(wurzel, ctx, parameter) {
  const { zustand, daten } = ctx;
  const tausch = parameter.tausch ?? '';
  const typ = tausch ? tausch.split(':')[0] : (TYPEN[parameter.typ] ? parameter.typ : 'abend');
  const alle = parameter.alle === '1';
  const { sichtbar, ausgeblendet } = teileRezepte(daten.rezepte.filter((r) => r.typ === typ), zustand.einstellungen.abneigungen, daten.zutaten);
  const adresse = (extra) => `#/essen/bibliothek?${new URLSearchParams({ typ, ...(tausch ? { tausch } : {}), ...extra })}`;
  const zeile = (r, versteckt) => `<li><a class="zeile" href="#/essen/rezept/${encodeURIComponent(r.id)}${tausch ? `?tausch=${encodeURIComponent(tausch)}` : ''}">
      <div class="zeile__haupt"><div class="zeile__titel">${esc(r.name)}</div><div class="zeile__unter">${esc(metaText(r))}</div></div>
      ${versteckt ? '<span class="etikett">ausgeblendet</span>' : ''}${sym('chevron', 'zeile__chevron')}
    </a></li>`;
  const typen = Object.entries(TYPEN)
    .map(([t, name]) => `<a href="#/essen/bibliothek?typ=${t}" ${t === typ ? 'aria-current="page"' : ''}>${name}</a>`)
    .join('');
  const leer = !sichtbar.length && !alle
    ? '<li><div class="leer"><p class="leer__titel">Keine passenden Rezepte</p><p class="leer__text">Alle Rezepte dieser Art sind wegen deiner Abneigungen ausgeblendet.</p></div></li>'
    : '';
  wurzel.innerHTML = `
    ${tausch ? kopf('Austauschen', 'Wähle ein anderes Gericht', { href: '#/essen', text: 'Woche' }) : kopf('Bibliothek', `${daten.rezepte.length} Rezepte`)}
    ${tausch ? '' : umschalter('bibliothek')}
    ${tausch ? '' : `<nav class="segment-rahmen" aria-label="Art"><div class="segment">${typen}</div></nav>`}
    <section class="gruppe">
      <ul class="gruppe__inhalt">
        ${sichtbar.map((r) => zeile(r, false)).join('')}
        ${alle ? ausgeblendet.map((r) => zeile(r, true)).join('') : ''}
        ${leer}
      </ul>
      ${ausgeblendet.length ? `<p class="gruppe__fuss"><a class="knopf knopf--schlicht" href="${adresse(alle ? {} : { alle: '1' })}">${alle ? 'Ausgeblendete verbergen' : `Ausgeblendete zeigen (${ausgeblendet.length})`}</a></p>` : ''}
    </section>`;
}

function zeigeRezept(wurzel, ctx, id, parameter) {
  const { zustand, daten } = ctx;
  const plan = zustand.essen.wochenplan;
  const tausch = parameter.tausch ?? '';
  const [typ, index] = tausch.split(':');
  const slot = !tausch ? null : typ === 'snack' ? plan.snack : plan[typ]?.[Number(index)] ?? null;
  const r = daten.rezepteById[id];
  const austauschenLink = `<a class="knopf knopf--getoent knopf--breit" href="#/essen/bibliothek?tausch=${encodeURIComponent(tausch)}">Austauschen</a>`;
  const entfernenKnopf = `<button class="knopf knopf--gefahr knopf--breit" type="button" data-aktion="entfernen" data-tausch="${esc(tausch)}">Aus dem Plan entfernen</button>`;

  if (!r) {
    wurzel.innerHTML = `
      ${kopf('Rezept fehlt', id ?? '', { href: '#/essen', text: 'Woche' })}
      <div class="gruppe"><div class="gruppe__inhalt leer">
        <p class="leer__titel">Nicht mehr in der Bibliothek</p>
        <p class="leer__text">Dieses Rezept wurde aus der Bibliothek entfernt. Tausch es aus oder nimm es aus dem Plan.</p>
      </div></div>
      ${slot ? `<div class="gruppe aktionen">${austauschenLink}${entfernenKnopf}</div>` : ''}`;
    return;
  }

  const imPlan = slot?.rezept === r.id;
  let aktionen;
  if (imPlan) {
    aktionen = austauschenLink + entfernenKnopf;
  } else if (slot) {
    aktionen = `<button class="knopf knopf--gefuellt knopf--gross knopf--breit" type="button" data-aktion="tauschen" data-tausch="${esc(tausch)}" data-rezept="${esc(r.id)}">Stattdessen nehmen</button>`;
  } else {
    const schonDa = r.typ === 'abend' && plan.abend.some((e) => e.rezept === r.id);
    aktionen = `<button class="knopf knopf--gefuellt knopf--gross knopf--breit" type="button" data-aktion="in-plan" data-rezept="${esc(r.id)}" ${schonDa ? 'disabled' : ''}>${schonDa ? 'Schon im Plan' : 'In den Plan'}</button>`;
  }
  const zurueck = imPlan ? { href: '#/essen', text: 'Woche' }
    : slot ? { href: `#/essen/bibliothek?tausch=${encodeURIComponent(tausch)}`, text: 'Auswahl' }
      : { href: `#/essen/bibliothek?typ=${r.typ}`, text: 'Bibliothek' };

  const nw = r.pro_portion;
  const naehrwerte = nw ? `
    <section class="gruppe">
      <h2 class="gruppe__kopf">Pro Portion${r.geschaetzt ? ' (geschätzt)' : ''}</h2>
      <ul class="gruppe__inhalt">${[['Kalorien', nw.kcal, 'kcal'], ['Protein', nw.protein_g, 'g']]
        .filter(([, wert]) => wert != null)
        .map(([name, wert, einheit]) => `<li><div class="zeile"><span class="zeile__haupt zeile__titel">${name}</span><span class="zeile__wert">${zahl(wert)} ${einheit}</span></div></li>`)
        .join('')}</ul>
    </section>` : '';
  const beschreibung = r.beschreibung
    ? `<section class="gruppe"><div class="gruppe__inhalt uebung"><p>${esc(r.beschreibung)}</p></div></section>`
    : '';
  const zutaten = r.zutaten?.length ? `
    <section class="gruppe">
      <h2 class="gruppe__kopf">Zutaten für ${r.portionen} ${r.portionen === 1 ? 'Portion' : 'Portionen'}</h2>
      <ul class="gruppe__inhalt">${r.zutaten.map((z) => `<li><div class="zeile">
        <span class="zeile__haupt zeile__titel">${esc(daten.zutaten[z.zutat]?.name ?? z.zutat)}</span>
        <span class="zeile__wert">${esc(mengeText(z.menge, z.einheit))}</span>
      </div></li>`).join('')}</ul>
    </section>` : '';
  const schritte = r.schritte?.length ? `
    <section class="gruppe">
      <h2 class="gruppe__kopf">Zubereitung</h2>
      <ol class="gruppe__inhalt schritte">${r.schritte.map((s) => `<li>${esc(s)}</li>`).join('')}</ol>
    </section>` : '';

  wurzel.innerHTML = `
    ${kopf(r.name, metaText(r), zurueck)}
    <div class="gruppe aktionen">${aktionen}</div>
    ${naehrwerte}${beschreibung}${zutaten}${schritte}`;
}

function planAendern(ctx, fn) {
  ctx.aendern((z) => {
    z.essen.wochenplan = fn(z.essen.wochenplan);
    if (!z.essen.wochenplan.kw) z.essen.wochenplan.kw = isoWoche(heute());
  });
}

const AKTIONEN = {
  weniger(el, ctx) { planAendern(ctx, (p) => anzahlAendern(p, el.dataset.typ, Number(el.dataset.index), -1)); },
  mehr(el, ctx) { planAendern(ctx, (p) => anzahlAendern(p, el.dataset.typ, Number(el.dataset.index), 1)); },
  'in-plan'(el, ctx) {
    planAendern(ctx, (p) => hinzufuegen(p, ctx.daten.rezepteById[el.dataset.rezept]));
    ctx.navigiere('#/essen');
  },
  tauschen(el, ctx) {
    const [typ, index] = el.dataset.tausch.split(':');
    planAendern(ctx, (p) => austauschen(p, typ, Number(index), el.dataset.rezept));
    ctx.navigiere('#/essen');
  },
  entfernen(el, ctx) {
    if (!sicher(el, 'Nochmal tippen zum Entfernen')) return;
    const [typ, index] = el.dataset.tausch.split(':');
    planAendern(ctx, (p) => entfernen(p, typ, Number(index)));
    ctx.navigiere('#/essen');
  },
};
