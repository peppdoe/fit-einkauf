// Service Worker: App-Dateien stale-while-revalidate (sofort aus dem Cache, im Hintergrund aktualisieren,
// beim nächsten Start neu), data/ bevorzugt aus dem Netz (Network-first). VERSION nur bei Umbauten des Caches ändern.
const VERSION = 'fit-einkauf-1';
const APP = [
  "./", "index.html", "manifest.webmanifest", "css/tokens.css", "css/komponenten.css", "css/uebersicht.css",
  "bilder/symbole.svg", "bilder/icon-512.png",
  "js/app.js", "js/route.js", "js/daten.js", "js/speicher.js",
  "js/logik/datum.js", "js/logik/rotation.js", "js/logik/progression.js", "js/logik/einheit.js", "js/logik/uebersicht.js",
  "js/logik/filter.js", "js/logik/einkaufsliste.js", "js/logik/naehrwerte.js", "js/logik/wochenplan.js", "js/logik/gewicht.js", "js/logik/figur.js",
  "js/ansichten/html.js", "js/ansichten/blatt.js", "js/ansichten/pause.js", "js/ansichten/wachhalten.js",
  "js/ansichten/sicherung.js", "js/ansichten/heute.js", "js/ansichten/training.js", "js/ansichten/figur-ansicht.js", "js/ansichten/essen.js", "js/ansichten/einkauf.js", "js/ansichten/mehr.js"
];
const DATEN = ["data/zutaten.json", "data/rezepte.json", "data/uebungen.json", "data/trainingsplan.json", "data/aktionen.json"];

self.addEventListener('install', (e) => {
  // Frisch vom Server einlagern (no-cache), nicht aus dem Browser-Cache – sonst kann ein neuer Service Worker
  // bis zu 10 min alte Dateien übernehmen.
  const frisch = [...APP, ...DATEN].map((datei) => new Request(new URL(datei, self.location), { cache: 'no-cache' }));
  e.waitUntil(caches.open(VERSION).then((cache) => cache.addAll(frisch)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys()
      .then((namen) => Promise.all(namen.filter((n) => n !== VERSION).map((n) => caches.delete(n))))
      .then(() => self.clients.claim()),
  );
});

// Immer beim Server nachfragen (no-cache): sonst liefert der Browser-Cache bis zu 10 min die alte Datei
// (GitHub Pages: max-age=600) und ein Update kommt erst eine Runde später an. Unverändert = 304, kaum Daten.
// Seitenaufrufe (navigate) lassen sich nicht mit Optionen kopieren, darum dort über die URL.
function holenUndMerken(anfrage) {
  return fetch(anfrage.mode === 'navigate' ? anfrage.url : anfrage, { cache: 'no-cache' }).then((antwort) => {
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
