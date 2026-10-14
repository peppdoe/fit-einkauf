// Mehr: Training-Einstellungen und Datensicherung. Gewicht, Ziele und Abneigungen folgen in Scheibe 3.
import { esc, sym, datumKurz } from './html.js';
import { heute } from '../logik/datum.js';
import { exportFaellig, importieren, SCHLUESSEL } from '../speicher.js';
import { sichern, exportieren, erinnerungHtml } from './sicherung.js';

let nachricht = null; // { art: 'ok' | 'fehler', text } – wird beim nächsten Zeichnen einmal gezeigt

export function zeige(wurzel, ctx) {
  wurzel.onclick = (e) => {
    const el = e.target.closest('[data-aktion]');
    if (el && !el.disabled) AKTIONEN[el.dataset.aktion]?.(el, ctx);
  };
  wurzel.onchange = (e) => aenderung(e.target, ctx);
  const z = ctx.zustand;
  const n = nachricht;
  nachricht = null;
  wurzel.innerHTML = `
    <header class="titelleiste">
      <div class="titelleiste__aktionen"></div>
      <h1 class="titelleiste__titel">Mehr</h1>
      <p class="titelleiste__unter">Einstellungen und Datensicherung</p>
    </header>
    ${n ? nachrichtHtml(n) : ''}
    ${exportFaellig(z, heute()) ? erinnerungHtml(z) : ''}
    ${trainingHtml(z)}
    ${datenHtml(z)}`;
}

const datumLang = (d) => `${datumKurz(d)}${d.slice(0, 4)}`;

function nachrichtHtml(n) {
  return `<div class="hinweis" role="${n.art === 'fehler' ? 'alert' : 'status'}">
    <div class="hinweis__kopf">
      ${n.art === 'ok' ? `<span class="hinweis__icon">${sym('haken')}</span>` : ''}
      <div><p class="hinweis__titel">${n.art === 'ok' ? 'Erledigt' : 'Das hat nicht geklappt'}</p><p class="hinweis__text">${esc(n.text)}</p></div>
    </div>
  </div>`;
}

function trainingHtml(z) {
  const sek = z.einstellungen.pauseSek.schwer;
  return `<section class="gruppe">
    <h2 class="gruppe__kopf">Training</h2>
    <ul class="gruppe__inhalt">
      <li><div class="zeile">
        <span class="zeile__haupt zeile__titel">Pause zwischen Sätzen</span>
        <div class="mini-zaehler" role="group" aria-label="Pause zwischen Sätzen">
          <button type="button" data-aktion="pause" data-delta="-15" aria-label="15 Sekunden weniger" ${sek <= 15 ? 'disabled' : ''}>${sym('minus')}</button>
          <output>${sek} s</output>
          <button type="button" data-aktion="pause" data-delta="15" aria-label="15 Sekunden mehr" ${sek >= 300 ? 'disabled' : ''}>${sym('plus')}</button>
        </div>
      </div></li>
      <li><label class="zeile">
        <span class="zeile__haupt"><span class="zeile__titel">Klimmzugstange vorhanden</span><span class="zeile__unter">Aus: Tischrudern statt Klimmzügen</span></span>
        <input class="schalter" type="checkbox" role="switch" data-einstellung="stange" ${z.einstellungen.stange ? 'checked' : ''}>
      </label></li>
    </ul>
    <p class="gruppe__fuss">Bei Supersätzen kommt die Pause erst nach beiden Übungen.</p>
  </section>`;
}

function datenHtml(z) {
  let defekt = null;
  try {
    defekt = window.localStorage.getItem(`${SCHLUESSEL}.defekt`);
  } catch {
    // Speicher nicht lesbar: dann gibt es auch nichts Beschädigtes zu exportieren.
  }
  return `<section class="gruppe">
    <h2 class="gruppe__kopf">Daten</h2>
    <ul class="gruppe__inhalt">
      <li><button class="zeile zeile--mit-symbol" type="button" data-aktion="export">
        <span class="zeile__icon">${sym('export')}</span><span class="zeile__haupt zeile__titel">Daten exportieren</span>
      </button></li>
      <li><label class="zeile zeile--mit-symbol">
        <span class="zeile__icon zeile__icon--grau">${sym('vorrat')}</span><span class="zeile__haupt zeile__titel">Daten importieren</span>
        <input class="nur-vorlesen" type="file" accept="application/json,.json" data-import>
      </label></li>
      ${defekt ? '<li><button class="zeile zeile--knopf" type="button" data-aktion="export-defekt">Beschädigte Daten exportieren</button></li>' : ''}
    </ul>
    <p class="gruppe__fuss">Letzte Sicherung: ${z.letzterExport ? datumLang(z.letzterExport) : 'noch nie'}. Beim Import wird der bisherige Stand als Sicherung aufgehoben.</p>
  </section>`;
}

function aenderung(el, ctx) {
  if (el.dataset.einstellung === 'stange') {
    ctx.aendern((z) => { z.einstellungen.stange = el.checked; });
  } else if (el.dataset.import !== undefined && el.files?.[0]) {
    importDatei(el.files[0], ctx);
  }
}

async function importDatei(datei, ctx) {
  const r = importieren(window.localStorage, await datei.text());
  nachricht = r.ok
    ? { art: 'ok', text: 'Import erfolgreich. Der vorherige Stand ist als Sicherung aufgehoben.' }
    : { art: 'fehler', text: r.fehler };
  if (r.ok) ctx.ersetzen(r.zustand);
  else ctx.navigiere('#/mehr');
}

const AKTIONEN = {
  async export(el, ctx) {
    nachricht = { art: 'ok', text: 'Sicherung erstellt. Leg sie in „Dateien“ oder in der iCloud ab.' };
    if (!(await exportieren(ctx))) nachricht = null;
  },
  'export-defekt'() {
    sichern('fit-einkauf-defekt.txt', window.localStorage.getItem(`${SCHLUESSEL}.defekt`) ?? '', 'text/plain');
  },
  pause(el, ctx) {
    ctx.aendern((z) => {
      const p = z.einstellungen.pauseSek;
      p.schwer = Math.max(15, Math.min(300, p.schwer + Number(el.dataset.delta)));
    });
  },
};
