// Training: heutige Einheit, laufende Einheit mit Sätzen, Supersätzen und Pause, Verlauf pro Kette.
import { esc, sym, zielText, datumKurz, sicher } from './html.js';
import { naechsteEinheit, abschliessen, ueberspringen, bloeckeFuerEinheit, kettenImPlan } from '../logik/rotation.js';
import { zielFuer, zielwert, erreicht, erfolgsserie, vorschlaegeNachAbschluss, stufeVerschieben } from '../logik/progression.js';
import { aufloesen, schrittweite, starteEinheit, satzFertig, waehle, pauseNach, eintragAusLaufend } from '../logik/einheit.js';
import { heute } from '../logik/datum.js';
import * as pause from './pause.js';
import * as wach from './wachhalten.js';
import { figurMini, soGehtsOeffnen } from './figur-ansicht.js';

export function zeige(wurzel, ctx, route) {
  wurzel.onclick = (e) => {
    const el = e.target.closest('[data-aktion]');
    if (el && !el.disabled) AKTIONEN[el.dataset.aktion]?.(el, ctx);
  };
  if (route.teile[0] === 'verlauf') return zeigeVerlauf(wurzel, ctx);
  if (ctx.zustand.training.laufend) return zeigeLaufend(wurzel, ctx);
  return zeigeStart(wurzel, ctx);
}

const stufeVon = (kette, stufen) => Math.min(stufen[kette.id] ?? 0, kette.stufen.length - 1);

function vorschlaegeHtml(vorschlaege) {
  return vorschlaege.map((v) => `
    <div class="hinweis" role="status">
      <div class="hinweis__kopf">
        <span class="hinweis__icon">${sym('hoch')}</span>
        <div>
          <p class="hinweis__titel">Stark – nächste Stufe?</p>
          <p class="hinweis__text">Zweimal in Folge geschafft. Nächstes Mal ${esc(v.name)} ${esc(zielText(v.ziel))}.</p>
        </div>
      </div>
      <div class="knopfreihe">
        <button class="knopf knopf--getoent" type="button" data-aktion="vorschlag-spaeter" data-kette="${esc(v.kette)}">Später</button>
        <button class="knopf knopf--gefuellt" type="button" data-aktion="vorschlag-ja" data-kette="${esc(v.kette)}">Ja, steigern</button>
      </div>
    </div>`).join('');
}

function zeigeStart(wurzel, ctx) {
  const { zustand, daten } = ctx;
  wach.aus();
  pause.stoppe();
  const einheit = naechsteEinheit(zustand.training, daten.plan);
  const nummer = (zustand.training.naechsteEinheit % daten.plan.einheiten.length) + 1;
  const stufeVonId = (id) => {
    const kette = daten.kettenById[id];
    return kette && kette.stufen[stufeVon(kette, zustand.training.stufen)];
  };
  const zeilen = bloeckeFuerEinheit(einheit, zustand.einstellungen.stange).flatMap((block) => {
    const bekannt = block.filter((id) => daten.kettenById[id]);
    return bekannt.map((id) => {
      const kette = daten.kettenById[id];
      const stufe = stufeVonId(id);
      const titel = stufe.routine ? kette.name : stufe.name;
      const wert = stufe.routine
        ? `${stufe.routine.length} Übungen`
        : zielText(zielFuer(stufe, einheit.art), stufe.seitig);
      const partner = bekannt.length === 2 ? stufeVonId(bekannt.find((x) => x !== id)) : null;
      const unter = stufe.routine ? 'Zum Abschluss, ca. 5 min' : partner && !partner.routine ? `Im Wechsel mit ${partner.name}` : '';
      return `<li><div class="zeile">
        <div class="zeile__haupt"><div class="zeile__titel">${esc(titel)}</div>${unter ? `<div class="zeile__unter">${esc(unter)}</div>` : ''}</div>
        <span class="zeile__wert">${esc(wert)}</span>
      </div></li>`;
    });
  }).join('');
  wurzel.innerHTML = `
    <header class="titelleiste">
      <div class="titelleiste__aktionen"><a class="knopf knopf--schlicht" href="#/training/verlauf">Verlauf</a></div>
      <h1 class="titelleiste__titel">${esc(einheit.name)}</h1>
      <p class="titelleiste__unter">Heute · Einheit ${nummer} von ${daten.plan.einheiten.length} · ${esc(einheit.dauer)}</p>
    </header>
    ${vorschlaegeHtml(zustand.training.vorschlaege)}
    <section class="gruppe">
      <h2 class="gruppe__kopf">Übungen</h2>
      <ul class="gruppe__inhalt">${zeilen}</ul>
    </section>
    <div class="gruppe">
      <button class="knopf knopf--gefuellt knopf--gross knopf--breit" type="button" data-aktion="starten">Training starten</button>
    </div>
    <section class="gruppe">
      <div class="gruppe__inhalt"><button class="zeile zeile--knopf zeile--gefahr" type="button" data-aktion="ueberspringen">Einheit überspringen</button></div>
      <p class="gruppe__fuss">Überspringen rückt zur nächsten Einheit, ohne etwas zu speichern.</p>
    </section>`;
}

function satzFelder(u, info, wert) {
  const soll = zielwert(info.ziel);
  const felder = [];
  for (let j = 0; j < info.ziel.saetze; j++) {
    const getan = u.saetze[j];
    if (getan != null && getan >= soll) {
      felder.push(`<li class="satz satz--erreicht"><span>Satz ${j + 1}</span><span class="satz__wert">${getan}</span></li>`);
    } else if (getan != null) {
      felder.push(`<li class="satz satz--unter"><span class="satz__marke">−${soll - getan}</span><span class="satz__wert">${getan}</span></li>`);
    } else if (j === u.saetze.length) {
      felder.push(`<li class="satz satz--aktiv" aria-current="step"><span>Satz ${j + 1}</span><span class="satz__wert">${wert}</span></li>`);
    } else {
      felder.push(`<li class="satz"><span>Satz ${j + 1}</span><span class="satz__wert satz__wert--leer">–</span></li>`);
    }
  }
  return `<ol class="saetze" style="--anzahl: ${info.ziel.saetze}" aria-label="Sätze">${felder.join('')}</ol>`;
}

function uebungsKarte(ctx, l) {
  const { zustand, daten } = ctx;
  const u = l.uebungen[l.aktiv];
  const info = aufloesen(u, daten.kettenById, l.art);
  const kette = daten.kettenById[u.kette];
  const mitStufen = u.teil == null && kette.stufen.length > 1;
  const serie = mitStufen && l.art === 'schwer' ? erfolgsserie(zustand.training.log, kette, u.stufe) : null;
  const masseinheit = info.ziel.sek != null ? 'Sekunden' : 'Wiederholungen';
  const partner = u.partner != null && l.uebungen[u.partner] ? aufloesen(l.uebungen[u.partner], daten.kettenById, l.art) : null;
  const einzeln = info.ziel.saetze === 1;
  return `
    <section class="gruppe" aria-labelledby="ueb-name">
      <div class="gruppe__inhalt uebung">
        <div class="uebung__kopf">
          <div>
            <h2 class="uebung__name" id="ueb-name">${esc(info.name)}</h2>
            <p class="uebung__ziel">${einzeln ? `${info.ziel.sek} s${info.seitig ? ' / Seite' : ''}` : `Ziel ${esc(zielText(info.ziel, info.seitig))}`}${mitStufen ? ` · Stufe ${u.stufe + 1} von ${kette.stufen.length}` : ''}</p>
            ${partner ? `<p class="uebung__ziel">Im Wechsel mit ${esc(partner.name)}</p>` : ''}
            ${serie != null ? `<p class="uebung__serie"><span class="etikett etikett--tint">Serie ${Math.min(serie, 2)} von 2</span></p>` : ''}
          </div>
          ${figurMini(info)}
        </div>
        ${einzeln ? '' : satzFelder(u, info, l.wert)}
        <div class="zaehler" role="group" aria-label="${masseinheit}${einzeln ? '' : ` in Satz ${u.saetze.length + 1}`}">
          <button class="zaehler__taste" type="button" data-aktion="minus" aria-label="Weniger" ${l.wert <= 0 ? 'disabled' : ''}>${sym('minus')}</button>
          <div class="zaehler__mitte">
            <output class="zaehler__wert" aria-live="polite">${l.wert}</output>
            <span class="zaehler__einheit">${masseinheit}</span>
          </div>
          <button class="zaehler__taste" type="button" data-aktion="plus" aria-label="Mehr">${sym('plus')}</button>
        </div>
        <button class="knopf knopf--gefuellt knopf--gross knopf--breit uebung__fertig" type="button" data-aktion="satz-fertig">${einzeln ? 'Erledigt' : `Satz ${u.saetze.length + 1} fertig`}</button>
      </div>
      ${mitStufen ? `<div class="knopfreihe">
        <button class="knopf knopf--schlicht" type="button" data-aktion="stufe-runter">Stufe zu schwer</button>
        <button class="knopf knopf--schlicht" type="button" data-aktion="stufe-hoch">Stufe zu leicht</button>
      </div>` : ''}
    </section>`;
}

function pauseHandler(ctx) {
  return {
    plus() {
      ctx.aendern((z) => {
        const p = z.training.laufend?.pause;
        if (!p) return;
        const jetzt = Date.now();
        if (p.bis <= jetzt) Object.assign(p, { bis: jetzt + 15000, dauer: 15 });
        else Object.assign(p, { bis: p.bis + 15000, dauer: p.dauer + 15 });
      });
    },
    weiter() {
      ctx.aendern((z) => { if (z.training.laufend) z.training.laufend.pause = null; });
    },
  };
}

function zeigeLaufend(wurzel, ctx) {
  const { daten } = ctx;
  const l = ctx.zustand.training.laufend;
  const einheit = daten.plan.einheiten[l.index % daten.plan.einheiten.length];
  wach.an();
  pause.zeige(l.pause ?? null, pauseHandler(ctx));
  const infos = l.uebungen.map((u) => aufloesen(u, daten.kettenById, l.art));
  const irgendwas = l.uebungen.some((u) => u.saetze.length > 0);
  const karte = l.aktiv >= 0 ? uebungsKarte(ctx, l) : `
    <div class="hinweis" role="status">
      <div class="hinweis__kopf">
        <span class="hinweis__icon">${sym('haken')}</span>
        <div><p class="hinweis__titel">Alle Übungen erledigt</p><p class="hinweis__text">Schließ die Einheit ab, damit sie gespeichert wird.</p></div>
      </div>
    </div>`;
  const liste = l.uebungen.map((u, i) => {
    const fertig = u.saetze.length >= infos[i].ziel.saetze;
    const ziel = infos[i].ziel.saetze === 1 ? `${infos[i].ziel.sek} s${infos[i].seitig ? ' / Seite' : ''}` : zielText(infos[i].ziel, infos[i].seitig);
    const unter = u.partner != null ? `${ziel} · im Wechsel` : ziel;
    return `<li><button class="zeile" type="button" data-aktion="waehlen" data-index="${i}" ${i === l.aktiv ? 'aria-current="true"' : ''}>
      <div class="zeile__haupt"><div class="zeile__titel">${esc(infos[i].name)}</div><div class="zeile__unter">${esc(unter)}</div></div>
      ${fertig ? '<span class="etikett etikett--erreicht">fertig</span>' : `<span class="zeile__wert">${u.saetze.length} / ${infos[i].ziel.saetze}</span>`}
    </button></li>`;
  }).join('');
  wurzel.innerHTML = `
    <header class="titelleiste">
      <div class="titelleiste__aktionen"></div>
      <h1 class="titelleiste__titel">${esc(einheit?.name ?? 'Training')}</h1>
      <p class="titelleiste__unter">Heute · ${l.aktiv >= 0 ? `Übung ${l.aktiv + 1} von ${l.uebungen.length}` : 'alle Übungen erledigt'}</p>
    </header>
    ${karte}
    <section class="gruppe">
      <h2 class="gruppe__kopf">Übungen</h2>
      <ul class="gruppe__inhalt">${liste}</ul>
    </section>
    <section class="gruppe">
      <div class="gruppe__inhalt"><button class="zeile zeile--knopf" type="button" data-aktion="abschliessen" ${irgendwas ? '' : 'disabled'}>Einheit abschließen</button></div>
      <p class="gruppe__fuss">Überspringen rückt zur nächsten Einheit, ohne etwas zu speichern.</p>
      <div class="gruppe__inhalt gruppe__inhalt--abstand"><button class="zeile zeile--knopf zeile--gefahr" type="button" data-aktion="ueberspringen">Einheit überspringen</button></div>
    </section>`;
}

function zeigeVerlauf(wurzel, ctx) {
  const { zustand, daten } = ctx;
  wach.aus();
  const log = zustand.training.log;
  // Ketten, die mit der aktuellen Stange-Einstellung in keiner Einheit vorkommen, nur zeigen, wenn es Einträge gibt.
  const imPlan = kettenImPlan(daten.plan, zustand.einstellungen.stange);
  const gruppen =daten.ketten.filter((k) => !k.stufen[0].routine).map((kette) => {
    const aktuell = kette.stufen[stufeVon(kette, zustand.training.stufen)];
    const eintraege = log
      .flatMap((e) => e.uebungen.filter((u) => u.kette === kette.id && u.teil == null).map((u) => ({ ...u, datum: e.datum, art: e.art })))
      .reverse()
      .slice(0, 5);
    if (!eintraege.length && !imPlan.has(kette.id)) return '';
    const zeilen = eintraege.map((e) => {
      const stufe = kette.stufen[e.stufe];
      const ok = stufe?.ziel && erreicht(e.saetze, zielFuer(stufe, e.art));
      return `<li><div class="zeile">
        <div class="zeile__haupt"><div class="zeile__titel">${esc(stufe?.name ?? '–')}</div><div class="zeile__unter">${datumKurz(e.datum)} · ${e.saetze.join(' · ')}</div></div>
        ${ok ? '<span class="etikett etikett--erreicht">Ziel</span>' : ''}
      </div></li>`;
    }).join('');
    return `<section class="gruppe">
      <h2 class="gruppe__kopf">${esc(kette.name)}</h2>
      <ul class="gruppe__inhalt"><li><div class="zeile"><div class="zeile__haupt zeile__titel">Aktuell: ${esc(aktuell.name)}</div></div></li>${zeilen || '<li><div class="zeile"><div class="zeile__haupt zeile__unter">Noch nicht trainiert</div></div></li>'}</ul>
    </section>`;
  }).join('');
  const leer = log.length ? '' : `
    <div class="gruppe"><div class="gruppe__inhalt leer">
      ${sym('verlauf', 'leer__icon')}
      <p class="leer__titel">Noch kein Training gespeichert</p>
      <p class="leer__text">Nach der ersten abgeschlossenen Einheit siehst du hier pro Übung deine Sätze.</p>
    </div></div>`;
  wurzel.innerHTML = `
    <header class="titelleiste">
      <div class="titelleiste__aktionen titelleiste__aktionen--links"><a class="knopf knopf--schlicht" href="#/training">${sym('zurueck')}Training</a></div>
      <h1 class="titelleiste__titel">Verlauf</h1>
      <p class="titelleiste__unter">${log.length} ${log.length === 1 ? 'Einheit' : 'Einheiten'} abgeschlossen</p>
    </header>
    ${leer}${gruppen}`;
}

function wertAendern(ctx, richtung) {
  ctx.aendern((z) => {
    const l = z.training.laufend;
    const info = aufloesen(l.uebungen[l.aktiv], ctx.daten.kettenById, l.art);
    l.wert = Math.max(0, l.wert + richtung * schrittweite(info.ziel));
  });
}

function stufeAendern(ctx, delta) {
  ctx.aendern((z) => {
    const l = z.training.laufend;
    const u = l.uebungen[l.aktiv];
    const kette = ctx.daten.kettenById[u.kette];
    z.training.stufen = stufeVerschieben(z.training.stufen, kette, delta);
    l.uebungen[l.aktiv] = { ...u, stufe: z.training.stufen[kette.id], saetze: [] };
    l.wert = zielwert(aufloesen(l.uebungen[l.aktiv], ctx.daten.kettenById, l.art).ziel);
  });
}

const AKTIONEN = {
  starten(el, ctx) {
    pause.tonVorbereiten();
    ctx.aendern((z) => {
      const einheit = naechsteEinheit(z.training, ctx.daten.plan);
      z.training.laufend = starteEinheit(z.training, einheit, ctx.daten.kettenById, z.einstellungen.stange, heute());
      z.training.vorschlaege = [];
    });
    window.scrollTo(0, 0);
  },
  ueberspringen(el, ctx) {
    if (!sicher(el, 'Nochmal tippen zum Überspringen')) return;
    pause.stoppe();
    wach.aus();
    ctx.aendern((z) => { z.training = ueberspringen(z.training, ctx.daten.plan); });
  },
  'vorschlag-ja'(el, ctx) {
    const kette = ctx.daten.kettenById[el.dataset.kette];
    ctx.aendern((z) => {
      z.training.stufen = stufeVerschieben(z.training.stufen, kette, 1);
      z.training.vorschlaege = z.training.vorschlaege.filter((v) => v.kette !== kette.id);
    });
  },
  'vorschlag-spaeter'(el, ctx) {
    ctx.aendern((z) => { z.training.vorschlaege = z.training.vorschlaege.filter((v) => v.kette !== el.dataset.kette); });
  },
  minus(el, ctx) { wertAendern(ctx, -1); },
  plus(el, ctx) { wertAendern(ctx, 1); },
  'so-gehts'(el, ctx) {
    const l = ctx.zustand.training.laufend;
    soGehtsOeffnen(aufloesen(l.uebungen[l.aktiv], ctx.daten.kettenById, l.art));
  },
  'satz-fertig'(el, ctx) {
    pause.tonVorbereiten();
    const sek = ctx.zustand.einstellungen.pauseSek[ctx.zustand.training.laufend.art] ?? 90;
    ctx.aendern((z) => {
      const vorher = z.training.laufend;
      const nachher = satzFertig(vorher, ctx.daten.kettenById);
      nachher.pause = null;
      if (pauseNach(vorher, nachher)) {
        const u = nachher.uebungen[nachher.aktiv];
        const naechstes = nachher.aktiv === vorher.aktiv
          ? `Satz ${u.saetze.length + 1}`
          : aufloesen(u, ctx.daten.kettenById, nachher.art).name;
        nachher.pause = { bis: Date.now() + sek * 1000, dauer: sek, text: `Pause · dann ${naechstes}` };
      }
      z.training.laufend = nachher;
    });
  },
  waehlen(el, ctx) {
    ctx.aendern((z) => { z.training.laufend = waehle(z.training.laufend, Number(el.dataset.index), ctx.daten.kettenById); });
    window.scrollTo(0, 0);
  },
  'stufe-runter'(el, ctx) { stufeAendern(ctx, -1); },
  'stufe-hoch'(el, ctx) { stufeAendern(ctx, 1); },
  abschliessen(el, ctx) {
    pause.stoppe();
    wach.aus();
    ctx.aendern((z) => {
      z.training = abschliessen(z.training, ctx.daten.plan, eintragAusLaufend(z.training.laufend));
      z.training.vorschlaege = vorschlaegeNachAbschluss(z.training.log, z.training.stufen, ctx.daten.kettenById);
    });
    window.scrollTo(0, 0);
  },
};
