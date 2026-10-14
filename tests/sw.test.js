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
