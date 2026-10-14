// Nur für die Musterseiten: macht Zähler, Pause und Abhaken bedienbar.
// Die echte Logik entsteht später in js/logik/ und js/ansichten/.

const ziel = 12;

const zaehler = document.querySelector('[data-zaehler]');
document.querySelectorAll('[data-schritt]').forEach((taste) => {
  taste.addEventListener('click', () => {
    const wert = Math.max(0, Number(zaehler.value || zaehler.textContent) + Number(taste.dataset.schritt));
    zaehler.textContent = wert;
    const satzWert = document.querySelector('[data-satz-wert]');
    if (satzWert) satzWert.textContent = wert;
    document.querySelector('[data-schritt="-1"]').disabled = wert === 0;
  });
});

// ---------- Pause ----------

const pause = document.querySelector('[data-pause]');
let dauer = 90;
let ende = 0;
let rahmen = 0;

function zeigeZeit(sek) {
  const m = Math.floor(sek / 60);
  const s = String(sek % 60).padStart(2, '0');
  pause.querySelector('[data-pause-zeit]').textContent = `${m}:${s}`;
}

function tick() {
  const restMs = Math.max(0, ende - Date.now());
  pause.querySelector('[data-pause-rest]').style.setProperty('--rest', restMs / (dauer * 1000));
  zeigeZeit(Math.ceil(restMs / 1000));
  if (restMs > 0) {
    rahmen = requestAnimationFrame(tick);
  } else {
    pause.classList.add('pause--fertig');
    const label = pause.querySelector('[data-pause-label]');
    label.textContent = 'Pause vorbei – los geht’s';
    label.classList.add('pause__label--fertig');
    pause.querySelector('[data-pause-rest]').style.setProperty('--rest', 1);
  }
}

function starte(sek, schonVorbei = 0) {
  cancelAnimationFrame(rahmen);
  dauer = sek;
  ende = Date.now() + (sek - schonVorbei) * 1000;
  pause.hidden = false;
  pause.classList.remove('pause--fertig');
  const label = pause.querySelector('[data-pause-label]');
  const aktiv = document.querySelector('[data-satz="aktiv"] span');
  label.textContent = aktiv ? `Pause · dann ${aktiv.textContent}` : 'Pause · dann nächste Übung';
  label.classList.remove('pause__label--fertig');
  tick();
}

if (pause) {
  pause.querySelector('[data-pause-plus]').addEventListener('click', () => {
    ende += 15000;
    dauer += 15;
    if (pause.classList.contains('pause--fertig')) starte(15);
  });
  pause.querySelector('[data-pause-ende]').addEventListener('click', () => {
    cancelAnimationFrame(rahmen);
    pause.hidden = true;
  });
  // Musterzustand: Pause läuft seit 34 s
  starte(90, 34);
}

document.querySelector('[data-satz-fertig]')?.addEventListener('click', (e) => {
  const satz = document.querySelector('[data-satz="aktiv"]');
  if (!satz) return;
  const wert = Number(zaehler.textContent);
  satz.classList.remove('satz--aktiv');
  satz.removeAttribute('aria-current');
  satz.classList.add(wert >= ziel ? 'satz--erreicht' : 'satz--unter');
  satz.removeAttribute('data-satz');
  satz.querySelector('[data-satz-wert]')?.removeAttribute('data-satz-wert');
  const knopf = e.currentTarget;
  const naechster = satz.nextElementSibling;
  knopf.textContent = naechster ? `${naechster.querySelector('span').textContent} fertig` : 'Übung abgeschlossen';
  knopf.disabled = !naechster;
  if (naechster) {
    naechster.classList.add('satz--aktiv');
    naechster.setAttribute('aria-current', 'step');
    naechster.dataset.satz = 'aktiv';
    const w = naechster.querySelector('.satz__wert');
    w.classList.remove('satz__wert--leer');
    w.setAttribute('data-satz-wert', '');
    w.textContent = ziel;
    zaehler.textContent = ziel;
  }
  starte(90);
});

// ---------- Hell / Dunkel umschalten (Komponenten-Seite) ----------

document.querySelectorAll('input[name="thema"]').forEach((wahl) => {
  wahl.addEventListener('change', () => {
    if (wahl.value === 'system') document.documentElement.removeAttribute('data-theme');
    else document.documentElement.dataset.theme = wahl.value;
  });
});
