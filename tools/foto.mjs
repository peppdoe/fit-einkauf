// Bildschirmfoto im 375-px-Rahmen mit Edge headless (Server muss laufen: npm run serve).
// node tools/foto.mjs "<pfad#hash>" <datei.png> [hell|dunkel] [höhe] [zustand]
import { execFileSync } from 'node:child_process';
import { mkdirSync, mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';

const [, , ziel = 'index.html#/training', datei = 'fotos/foto.png', thema = 'hell', hoehe = '812', zustand = ''] = process.argv;
const edge = process.env.EDGE ?? 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe';
const [pfad, hash = ''] = ziel.split('#');
const seite = `/${pfad}?thema=${thema}${hash ? `#${hash}` : ''}`;
const url = `http://127.0.0.1:8765/tools/rahmen.html?h=${hoehe}&zustand=${zustand}&u=${encodeURIComponent(seite)}`;

mkdirSync(dirname(resolve(datei)), { recursive: true });
execFileSync(edge, [
  '--headless=new', '--disable-gpu', '--hide-scrollbars', '--force-device-scale-factor=2', '--virtual-time-budget=5000',
  `--user-data-dir=${mkdtempSync(join(tmpdir(), 'fit-einkauf-'))}`, `--window-size=500,${hoehe}`,
  `--screenshot=${resolve(datei)}`, url,
], { stdio: 'ignore' });
console.log(resolve(datei));
