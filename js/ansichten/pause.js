// Pausen-Leiste über der Tab-Leiste. Die Endzeit steht im Zustand (laufend.pause.bis), damit die Pause
// Sperrbildschirm und Neuladen übersteht; hier wird nur gezeichnet, gezählt und gepiept.
const wurzel = () => document.getElementById('pause-wurzel');
const haupt = () => document.getElementById('haupt');
let aktuell = null; // { bis, dauer, text }
let lief = false; // Ton nur, wenn das Ende miterlebt wurde (nicht nach einem Neuladen lange danach)
let rahmen = 0;
let handler = { plus() {}, weiter() {} };
let ton = null;

// Muss bei einem Tipp aufgerufen werden (iOS erlaubt Ton nur nach einer Berührung).
export function tonVorbereiten() {
  try {
    // Safari 16.4+: als Wiedergabe einstufen, damit der Ton auch bei Lautlos-Schalter kommt.
    if (navigator.audioSession) navigator.audioSession.type = 'playback';
    ton ??= new AudioContext();
    ton.resume?.();
  } catch {
    ton = null;
  }
}

function piep() {
  if (!ton) return;
  const jetzt = ton.currentTime;
  for (const ab of [0, 0.25, 0.5]) {
    const osz = ton.createOscillator();
    const lautstaerke = ton.createGain();
    osz.frequency.value = 880;
    lautstaerke.gain.setValueAtTime(0.0001, jetzt + ab);
    lautstaerke.gain.exponentialRampToValueAtTime(0.3, jetzt + ab + 0.02);
    lautstaerke.gain.exponentialRampToValueAtTime(0.0001, jetzt + ab + 0.18);
    osz.connect(lautstaerke).connect(ton.destination);
    osz.start(jetzt + ab);
    osz.stop(jetzt + ab + 0.2);
  }
}

const zeit = (sek) => `${Math.floor(sek / 60)}:${String(sek % 60).padStart(2, '0')}`;

function aufbauen() {
  wurzel().innerHTML = `
    <aside class="pause" aria-label="Pause">
      <div class="pause__info">
        <div class="pause__label" data-pause-label></div>
        <div class="pause__zeit" role="timer" data-pause-zeit></div>
      </div>
      <button class="knopf knopf--getoent knopf--klein" type="button" data-pause="plus">+15 s</button>
      <button class="knopf knopf--schlicht knopf--klein" type="button" data-pause="weiter">Weiter</button>
      <div class="pause__balken" aria-hidden="true"><div class="pause__rest" data-pause-rest></div></div>
    </aside>`;
  wurzel().onclick = (e) => {
    const knopf = e.target.closest('[data-pause]');
    if (!knopf) return;
    tonVorbereiten();
    handler[knopf.dataset.pause]();
  };
  haupt().classList.add('app--mit-pause');
}

function tick() {
  const leiste = wurzel().querySelector('.pause');
  if (!leiste || !aktuell) return;
  const restMs = Math.max(0, aktuell.bis - Date.now());
  leiste.querySelector('[data-pause-zeit]').textContent = zeit(Math.ceil(restMs / 1000));
  leiste.querySelector('[data-pause-rest]').style.setProperty('--rest', Math.min(1, restMs / (aktuell.dauer * 1000)));
  const label = leiste.querySelector('[data-pause-label]');
  if (restMs > 0) {
    lief = true;
    leiste.classList.remove('pause--fertig', 'pause--blinken');
    label.classList.remove('pause__label--fertig');
    label.textContent = aktuell.text;
    rahmen = requestAnimationFrame(tick);
    return;
  }
  leiste.classList.add('pause--fertig');
  label.textContent = 'Pause vorbei – los geht’s';
  label.classList.add('pause__label--fertig');
  leiste.querySelector('[data-pause-rest]').style.setProperty('--rest', 1);
  if (lief) {
    lief = false;
    leiste.classList.add('pause--blinken');
    piep();
  }
}

// pause: { bis, dauer, text } oder null. plus/weiter ändern den Zustand; danach ruft die Ansicht zeige() erneut auf.
export function zeige(pause, { plus, weiter }) {
  handler = { plus, weiter };
  if (!pause) {
    stoppe();
    return;
  }
  const gleich = aktuell && aktuell.bis === pause.bis && wurzel().querySelector('.pause');
  aktuell = { ...pause };
  if (gleich) return;
  cancelAnimationFrame(rahmen);
  if (!wurzel().querySelector('.pause')) aufbauen();
  tick();
}

export function stoppe() {
  cancelAnimationFrame(rahmen);
  aktuell = null;
  lief = false;
  wurzel().innerHTML = '';
  haupt().classList.remove('app--mit-pause');
}

// Nach dem Entsperren sofort den richtigen Stand zeigen (requestAnimationFrame ruht im Hintergrund).
document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'visible' && aktuell) {
    cancelAnimationFrame(rahmen);
    tick();
  }
});
