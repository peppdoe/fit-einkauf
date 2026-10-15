import { describe, it, expect } from 'vitest';
import { readFileSync, existsSync, readdirSync } from 'node:fs';

const wurzel = new URL('../', import.meta.url);
const quelltext = readFileSync(new URL('sw.js', wurzel), 'utf8');
const liste = (name) => JSON.parse(quelltext.match(new RegExp(`const ${name} = (\\[[\\s\\S]*?\\]);`))[1]);
const alleJs = (ordner) => readdirSync(new URL(ordner, wurzel), { withFileTypes: true }).flatMap((e) => {
  if (e.isDirectory()) return alleJs(`${ordner}${e.name}/`);
  return e.name.endsWith('.js') ? [`${ordner}${e.name}`] : [];
});

describe('Service Worker', () => {
  it('alle vorab gespeicherten Dateien existieren', () => {
    for (const datei of [...liste('APP'), ...liste('DATEN')].filter((d) => d !== './')) {
      expect(existsSync(new URL(datei, wurzel)), datei).toBe(true);
    }
  });
  it('jede JS-Datei der App ist offline verfügbar', () => {
    const app = liste('APP');
    for (const datei of alleJs('js/')) expect(app, datei).toContain(datei);
  });
});

// sw.js in einer nachgebauten Service-Worker-Umgebung ausführen und das Nachladen beobachten.
function swUmgebung({ imCache }) {
  const handler = {};
  const abrufe = [];
  const gemerkt = [];
  const eingelagert = [];
  const cache = {
    put: (anfrage, antwort) => { gemerkt.push([anfrage, antwort]); return Promise.resolve(); },
    addAll: (liste) => { eingelagert.push(...liste); return Promise.resolve(); },
  };
  const env = {
    self: { addEventListener: (typ, fn) => { handler[typ] = fn; }, location: new URL('https://beispiel.test/fit-einkauf/sw.js'), skipWaiting: () => Promise.resolve() },
    caches: { open: () => Promise.resolve(cache), match: () => Promise.resolve(imCache), keys: () => Promise.resolve([]) },
    fetch: (ziel, optionen) => { abrufe.push({ ziel, optionen }); return Promise.resolve({ ok: true, clone: () => 'kopie' }); },
  };
  new Function('self', 'caches', 'fetch', quelltext)(env.self, env.caches, env.fetch);
  const anfrage = (pfad, mode = 'cors') => ({ url: `https://beispiel.test${pfad}`, method: 'GET', mode });
  async function abrufen(req) {
    let antwort; const warten = [];
    handler.fetch({ request: req, respondWith: (p) => { antwort = p; }, waitUntil: (p) => warten.push(p) });
    const ergebnis = await antwort;
    await Promise.all(warten);
    await new Promise((r) => setTimeout(r, 0));
    return ergebnis;
  }
  async function installieren() {
    let p;
    handler.install({ waitUntil: (x) => { p = x; } });
    await p;
  }
  return { abrufe, gemerkt, eingelagert, anfrage, abrufen, installieren };
}

describe('Service Worker: Nachladen im Hintergrund', () => {
  it('liefert App-Dateien sofort aus dem Cache und fragt im Hintergrund beim Server nach (no-cache)', async () => {
    const sw = swUmgebung({ imCache: 'alt' });
    const req = sw.anfrage('/fit-einkauf/js/ansichten/mehr.js');
    expect(await sw.abrufen(req)).toBe('alt');
    expect(sw.abrufe).toEqual([{ ziel: req, optionen: { cache: 'no-cache' } }]);
    expect(sw.gemerkt).toEqual([[req, 'kopie']]);
  });
  it('Seitenaufruf (navigate) wird über die URL nachgeladen, sonst wirft fetch', async () => {
    const sw = swUmgebung({ imCache: 'alt' });
    const req = sw.anfrage('/fit-einkauf/index.html', 'navigate');
    await sw.abrufen(req);
    expect(sw.abrufe).toEqual([{ ziel: req.url, optionen: { cache: 'no-cache' } }]);
  });
  it('data/ kommt zuerst aus dem Netz, ebenfalls mit no-cache', async () => {
    const sw = swUmgebung({ imCache: 'alt' });
    await sw.abrufen(sw.anfrage('/fit-einkauf/data/rezepte.json'));
    expect(sw.abrufe[0].optionen).toEqual({ cache: 'no-cache' });
  });
});

describe('Service Worker: Installation', () => {
  it('lagert alle Dateien frisch vom Server ein (no-cache), nicht aus dem Browser-Cache', async () => {
    const sw = swUmgebung({ imCache: null });
    await sw.installieren();
    expect(sw.eingelagert.length).toBe(liste('APP').length + liste('DATEN').length);
    expect(sw.eingelagert.every((r) => r instanceof Request && r.cache === 'no-cache')).toBe(true);
    expect(sw.eingelagert.map((r) => r.url)).toContain('https://beispiel.test/fit-einkauf/js/ansichten/mehr.js');
  });
});

describe('Service-Worker-Registrierung', () => {
  it('prüft sw.js ohne Browser-Cache (updateViaCache: none)', () => {
    const app = readFileSync(new URL('js/app.js', wurzel), 'utf8');
    expect(app).toMatch(/serviceWorker\.register\('sw\.js', \{ updateViaCache: 'none' \}\)/);
  });
});
