// Service Worker: App-Dateien stale-while-revalidate (sofort aus dem Cache, im Hintergrund aktualisieren,
// beim nächsten Start neu), data/ bevorzugt aus dem Netz (Network-first). VERSION nur bei Umbauten des Caches ändern.
const VERSION = 'fit-einkauf-1';
const APP = [
  "./", "index.html", "manifest.webmanifest", "css/tokens.css", "css/komponenten.css", "css/uebersicht.css",
  "bilder/symbole.svg", "bilder/icon-512.png",
  "js/app.js", "js/route.js", "js/daten.js", "js/speicher.js",
  "js/logik/datum.js", "js/logik/rotation.js", "js/logik/progression.js", "js/logik/einheit.js", "js/logik/uebersicht.js",
  "js/logik/filter.js", "js/logik/einkaufsliste.js", "js/logik/naehrwerte.js", "js/logik/wochenplan.js",
  "js/ansichten/html.js", "js/ansichten/blatt.js", "js/ansichten/pause.js", "js/ansichten/wachhalten.js",
  "js/ansichten/sicherung.js", "js/ansichten/heute.js", "js/ansichten/training.js", "js/ansichten/essen.js", "js/ansichten/einkauf.js", "js/ansichten/mehr.js"
];
const DATEN = ["data/zutaten.json", "data/rezepte.json", "data/uebungen.json", "data/trainingsplan.json"];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(VERSION).then((cache) => cache.addAll([...APP, ...DATEN])).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys()
      .then((namen) => Promise.all(namen.filter((n) => n !== VERSION).map((n) => caches.delete(n))))
      .then(() => self.clients.claim()),
  );
});

function holenUndMerken(anfrage) {
  return fetch(anfrage).then((antwort) => {
    if (antwort.ok) {
      const kopie = antwort.clone();
      caches.open(VERSION).then((cache) => cache.put(anfrage, kopie));
    }
    return antwort;
  });
}

self.addEventListener('fetch', (e) => {
  const url = new URL(e.request.url);
  if (e.request.method !== 'GET' || url.origin !== self.location.origin) return;
  if (url.pathname.includes('/data/')) {
    e.respondWith(
      holenUndMerken(e.request).catch(() => caches.match(e.request).then((treffer) => treffer ?? Response.error())),
    );
    return;
  }
  e.respondWith(
    caches.match(e.request, { ignoreSearch: true }).then((treffer) => {
      const frisch = holenUndMerken(e.request);
      if (!treffer) return frisch;
      e.waitUntil(frisch.catch(() => {}));
      return treffer;
    }),
  );
});
