// Screen Wake Lock während einer laufenden Einheit (iOS 16.4+; fehlt die Funktion, passiert einfach nichts).
let sperre = null;
let gewuenscht = false;

async function holen() {
  try {
    sperre = (await navigator.wakeLock?.request('screen')) ?? null;
  } catch {
    sperre = null;
  }
}

export function an() {
  gewuenscht = true;
  if (!sperre) holen();
}

export function aus() {
  gewuenscht = false;
  sperre?.release?.();
  sperre = null;
}

document.addEventListener('visibilitychange', () => {
  if (gewuenscht && document.visibilityState === 'visible') {
    sperre = null;
    holen();
  }
});
