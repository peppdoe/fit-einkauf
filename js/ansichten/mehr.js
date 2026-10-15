// Mehr: Gewicht mit Trend und Empfehlung, Tagesziele, Jause-Tage, Abneigungen, Training-Einstellungen, Datensicherung.
import { esc, sym, zahl, datumKurz } from './html.js';
import { parseKg, eintragen, wochenschnitte, trendProMonat, empfehlung } from '../logik/gewicht.js';
import { heute, isoWoche } from '../logik/datum.js';
import { importieren, SCHLUESSEL } from '../speicher.js';
import { sichern, exportieren } from './sicherung.js';

const ZIELE = [['kcal', 'Kalorien', 'kcal'], ['protein', 'Protein', 'g']];
let nachricht = null; // { art: 'ok' | 'fehler', text } – wird beim nächsten Zeichnen einmal gezeigt

export function zeige(wurzel, ctx) {
  wurzel.onclick = (e) => {
    const el = e.target.closest('[data-aktion]');
    if (el && !el.disabled) AKTIONEN[el.dataset.aktion]?.(el, ctx);
  };
  wurzel.onchange = (e) => aenderung(e.target, ctx);
  wurzel.onsubmit = (e) => {
    e.preventDefault();
    FORMULARE[e.target.dataset.formular]?.(e.target, ctx);
  };
  const z = ctx.zustand;
  const n = nachricht;
  nachricht = null;
  wurzel.innerHTML = `
    <header class="titelleiste">
      <div class="titelleiste__aktionen"></div>
      <h1 class="titelleiste__titel">Mehr</h1>
      <p class="titelleiste__unter">Gewicht, Ziele und Einstellungen · Update-Test 1</p>
    </header>
    ${n ? nachrichtHtml(n) : ''}
    ${gewichtHtml(z)}
    ${zieleHtml(z)}
    ${abneigungenHtml(z)}
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

function gewichtHtml(z) {
  const wochen = wochenschnitte(z.gewicht).slice(-6).reverse();
  const trend = trendProMonat(z.gewicht);
  const e = empfehlung(trend);
  const ziel = z.einstellungen.ziele.kcal;
  const zeilen = wochen.map((w) => `<li><div class="zeile">
    <div class="zeile__haupt"><div class="zeile__titel">KW ${w.kw.split('-W')[1]}</div><div class="zeile__unter">${w.anzahl} ${w.anzahl === 1 ? 'Messung' : 'Messungen'}</div></div>
    <span class="zeile__wert">${zahl(w.kg, 1)} kg</span>
  </div></li>`).join('');
  const trendText = trend == null
    ? 'Trend und Empfehlung ab 3 Wochen mit Messungen.'
    : `Trend: ${trend >= 0 ? '+' : '−'}${zahl(Math.abs(trend), 1)} kg pro Monat (Ziel etwa +0,5).${e === 0 ? ' Das passt – Ziel beibehalten.' : ''}`;
  const zeigeEmpfehlung = e && z.einstellungen.empfehlungKw !== isoWoche(heute());
  const empfehlungHtml = zeigeEmpfehlung ? `
    <div class="hinweis hinweis--info" role="status">
      <div class="hinweis__kopf">
        <span class="hinweis__icon">${sym(e > 0 ? 'hoch' : 'runter')}</span>
        <div>
          <p class="hinweis__titel">Vorschlag: ${e > 0 ? '+' : '−'}150 kcal</p>
          <p class="hinweis__text">${e > 0 ? 'Du nimmst langsamer zu als geplant.' : 'Du nimmst schneller zu als geplant.'} Neues Ziel ${zahl(ziel + e)} kcal statt ${zahl(ziel)} kcal.</p>
        </div>
      </div>
      <div class="knopfreihe">
        <button class="knopf knopf--getoent" type="button" data-aktion="empfehlung-nein">Nicht jetzt</button>
        <button class="knopf knopf--gefuellt" type="button" data-aktion="empfehlung" data-delta="${e}">Übernehmen</button>
      </div>
    </div>` : '';
  return `
    <section class="gruppe" id="gewicht">
      <h2 class="gruppe__kopf gruppe__kopf--gross">Gewicht</h2>
      <form class="gruppe__inhalt" data-formular="gewicht"><div class="zeile">
        <input class="eingabe" name="kg" inputmode="decimal" autocomplete="off" enterkeyhint="done" placeholder="Heute, z. B. 72,4" aria-label="Gewicht heute in kg">
        <button class="knopf knopf--gefuellt" type="submit">Eintragen</button>
      </div></form>
      ${zeilen ? `<ul class="gruppe__inhalt gruppe__inhalt--abstand">${zeilen}</ul>` : ''}
      <p class="gruppe__fuss">${trendText}</p>
    </section>
    ${empfehlungHtml}`;
}

function zieleHtml(z) {
  const tage = z.einstellungen.jauseTage ?? 4;
  return `<section class="gruppe">
    <h2 class="gruppe__kopf">Tagesziele</h2>
    <ul class="gruppe__inhalt">${ZIELE.map(([k, name, einheit]) => `<li><label class="zeile">
      <span class="zeile__haupt zeile__titel">${name}</span>
      <input class="eingabe eingabe--kurz" type="number" inputmode="numeric" min="1" step="1" data-ziel="${k}" value="${z.einstellungen.ziele[k]}" aria-label="${name} in ${einheit}">
      <span class="zeile__wert">${einheit}</span>
    </label></li>`).join('')}
      <li><div class="zeile">
        <span class="zeile__haupt"><span class="zeile__titel">Jause-Tage pro Woche</span><span class="zeile__unter">Arbeitstage mit Jause</span></span>
        <div class="mini-zaehler" role="group" aria-label="Jause-Tage pro Woche">
          <button type="button" data-aktion="jause-tage" data-delta="-1" aria-label="Ein Tag weniger" ${tage <= 0 ? 'disabled' : ''}>${sym('minus')}</button>
          <output>${tage}</output>
          <button type="button" data-aktion="jause-tage" data-delta="1" aria-label="Ein Tag mehr" ${tage >= 7 ? 'disabled' : ''}>${sym('plus')}</button>
        </div>
      </div></li>
    </ul>
  </section>`;
}

// Gespeichert bleibt das Wort klein (Filter vergleicht klein); angezeigt mit großem Anfangsbuchstaben.
const grossAnfang = (t) => t.charAt(0).toLocaleUpperCase('de') + t.slice(1);

function abneigungenHtml(z) {
  return `<section class="gruppe">
    <h2 class="gruppe__kopf">Abneigungen</h2>
    <ul class="gruppe__inhalt">
      ${z.einstellungen.abneigungen.map((a) => `<li><div class="zeile">
        <span class="zeile__haupt zeile__titel">${esc(grossAnfang(a))}</span>
        <button class="knopf knopf--schlicht" type="button" data-aktion="abneigung-weg" data-wert="${esc(a)}">Entfernen</button>
      </div></li>`).join('')}
      <li><form class="zeile" data-formular="abneigung">
        <input class="eingabe" name="wort" autocomplete="off" placeholder="z. B. Pilze" aria-label="Neue Abneigung">
        <button class="knopf knopf--getoent" type="submit">Hinzufügen</button>
      </form></li>
    </ul>
    <p class="gruppe__fuss">Rezepte mit diesem Wort im Namen, in den Tags oder Zutaten werden ausgeblendet.</p>
  </section>`;
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
  if (el.dataset.ziel) {
    const n = Math.round(Number(el.value));
    if (Number.isFinite(n) && n > 0) {
      ctx.aendern((z) => { z.einstellungen.ziele[el.dataset.ziel] = n; });
    } else {
      nachricht = { art: 'fehler', text: 'Bitte eine Zahl größer als 0 eingeben.' };
      ctx.navigiere('#/mehr');
    }
  } else if (el.dataset.einstellung === 'stange') {
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

const FORMULARE = {
  gewicht(form, ctx) {
    const kg = parseKg(form.kg.value);
    if (kg == null) {
      nachricht = { art: 'fehler', text: 'Bitte ein Gewicht zwischen 20 und 300 kg eingeben, z. B. 72,4.' };
      ctx.navigiere('#/mehr');
      return;
    }
    nachricht = { art: 'ok', text: `${zahl(kg, 1)} kg für heute eingetragen.` };
    ctx.aendern((z) => { z.gewicht = eintragen(z.gewicht, heute(), kg); });
  },
  abneigung(form, ctx) {
    const wort = form.wort.value.trim().toLowerCase();
    if (!wort) return;
    ctx.aendern((z) => {
      if (!z.einstellungen.abneigungen.includes(wort)) z.einstellungen.abneigungen = [...z.einstellungen.abneigungen, wort];
    });
  },
};

const AKTIONEN = {
  async export(el, ctx) {
    nachricht = { art: 'ok', text: 'Sicherung erstellt. Leg sie in „Dateien“ oder in der iCloud ab.' };
    if (!(await exportieren(ctx))) nachricht = null;
  },
  'export-defekt'() {
    sichern('fit-einkauf-defekt.txt', window.localStorage.getItem(`${SCHLUESSEL}.defekt`) ?? '', 'text/plain');
  },
  empfehlung(el, ctx) {
    const delta = Number(el.dataset.delta);
    nachricht = { art: 'ok', text: `Neues Kalorienziel: ${zahl(ctx.zustand.einstellungen.ziele.kcal + delta)} kcal.` };
    ctx.aendern((z) => {
      z.einstellungen.ziele.kcal += delta;
      z.einstellungen.empfehlungKw = isoWoche(heute());
    });
  },
  'empfehlung-nein'(el, ctx) {
    ctx.aendern((z) => { z.einstellungen.empfehlungKw = isoWoche(heute()); });
  },
  'abneigung-weg'(el, ctx) {
    ctx.aendern((z) => { z.einstellungen.abneigungen = z.einstellungen.abneigungen.filter((a) => a !== el.dataset.wert); });
  },
  'jause-tage'(el, ctx) {
    ctx.aendern((z) => {
      z.einstellungen.jauseTage = Math.max(0, Math.min(7, (z.einstellungen.jauseTage ?? 4) + Number(el.dataset.delta)));
    });
  },
  pause(el, ctx) {
    ctx.aendern((z) => {
      const p = z.einstellungen.pauseSek;
      p.schwer = Math.max(15, Math.min(300, p.schwer + Number(el.dataset.delta)));
    });
  },
};
