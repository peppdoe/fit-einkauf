// Datensicherung, geteilt von Training (Erinnerung) und Mehr: Teilen-Blatt am iPhone, sonst Download.
import { esc, sym } from './html.js';
import { heute, tageZwischen } from '../logik/datum.js';
import { exportText, exportDateiname } from '../speicher.js';

// Teilen-Blatt (iPhone: „In Dateien sichern“), sonst normaler Download. false = abgebrochen.
export async function sichern(name, text, typ = 'application/json') {
  const datei = new File([text], name, { type: typ });
  if (navigator.canShare?.({ files: [datei] })) {
    try {
      await navigator.share({ files: [datei], title: name });
      return true;
    } catch (fehler) {
      if (fehler.name === 'AbortError') return false;
    }
  }
  const url = URL.createObjectURL(datei);
  const a = Object.assign(document.createElement('a'), { href: url, download: name });
  document.body.append(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
  return true;
}

export async function exportieren(ctx) {
  if (!(await sichern(exportDateiname(heute()), exportText(ctx.zustand)))) return false;
  ctx.aendern((z) => { z.letzterExport = heute(); });
  return true;
}

export function erinnerungHtml(z) {
  const titel = z.letzterExport ? `Letzte Sicherung vor ${tageZwischen(z.letzterExport, heute())} Tagen` : 'Noch keine Sicherung';
  return `<div class="hinweis hinweis--info" role="status">
    <div class="hinweis__kopf">
      <span class="hinweis__icon">${sym('export')}</span>
      <div><p class="hinweis__titel">${esc(titel)}</p><p class="hinweis__text">Deine Daten liegen nur auf diesem iPhone. Exportiere sie, damit nichts verloren geht.</p></div>
    </div>
    <div class="knopfreihe"><button class="knopf knopf--gefuellt" type="button" data-aktion="export">Jetzt exportieren</button></div>
  </div>`;
}
