// Lokaler Entwicklungsserver: node tools/server.mjs  ->  http://127.0.0.1:8765/
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const wurzel = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const TYPEN = {
  '.html': 'text/html; charset=utf-8', '.css': 'text/css', '.js': 'text/javascript', '.mjs': 'text/javascript',
  '.svg': 'image/svg+xml', '.json': 'application/json', '.png': 'image/png', '.webmanifest': 'application/manifest+json',
};

http.createServer((anfrage, antwort) => {
  let pfad = decodeURIComponent(anfrage.url.split('?')[0]);
  if (pfad.endsWith('/')) pfad += 'index.html';
  const datei = path.join(wurzel, pfad);
  if (!datei.startsWith(wurzel)) { antwort.writeHead(403); antwort.end(); return; }
  fs.readFile(datei, (fehler, inhalt) => {
    if (fehler) { antwort.writeHead(404); antwort.end('nicht gefunden'); return; }
    antwort.writeHead(200, { 'content-type': TYPEN[path.extname(datei)] ?? 'application/octet-stream', 'cache-control': 'no-store' });
    antwort.end(inhalt);
  });
}).listen(8765, '127.0.0.1', () => console.log('http://127.0.0.1:8765/'));
