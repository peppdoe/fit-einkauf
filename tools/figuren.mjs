// Übungsfiguren aus Gelenkpunkten berechnen und in data/uebungen.json eintragen.
// node tools/figuren.mjs          -> schreibt die Figuren, meldet Kontaktpunkte
// Eine Pose wird beschrieben durch Hüfte h, Rumpfwinkel r und pro Glied entweder Winkel (arm/bein: [oben, unten])
// oder einen Zielpunkt (hand/fuss: [x, y]) mit Beugeseite (eb/kb: 1 oder -1). Ellbogen und Knie rechnet die
// inverse Kinematik aus; ist das Ziel zu weit weg, wird das Glied gestreckt in seine Richtung gezeigt.
import { readFileSync, writeFileSync } from 'node:fs';
import { LAENGE, gelenke, pruefeFigur } from '../js/logik/figur.js';

const grad = (rad) => (rad * 180) / Math.PI;
const rund = (n) => Math.round(n * 10) / 10;

function ik(von, ziel, l1, l2, seite) {
  const dx = ziel[0] - von[0];
  const dy = ziel[1] - von[1];
  const d = Math.min(Math.hypot(dx, dy), l1 + l2 - 0.01);
  const basis = Math.atan2(dy, dx);
  const a = Math.acos((l1 * l1 + d * d - l2 * l2) / (2 * l1 * d));
  const oben = basis + seite * a;
  const gelenk = [von[0] + Math.cos(oben) * l1, von[1] + Math.sin(oben) * l1];
  const unten = Math.atan2(ziel[1] - gelenk[1], ziel[0] - gelenk[0]);
  return [Math.round(grad(oben)), Math.round(grad(unten))];
}

function pose(p) {
  const huefte = [rund(p.h[0]), rund(p.h[1])];
  const r = Math.round(p.r);
  const schulter = [huefte[0] + Math.cos((r * Math.PI) / 180) * LAENGE.rumpf, huefte[1] + Math.sin((r * Math.PI) / 180) * LAENGE.rumpf];
  const arm = (w, z, s) => w ?? ik(schulter, z, LAENGE.oberarm, LAENGE.unterarm, s ?? 1);
  const bein = (w, z, s) => w ?? ik(huefte, z, LAENGE.oberschenkel, LAENGE.unterschenkel, s ?? 1);
  const ergebnis = { huefte, rumpf: r, arm: arm(p.arm, p.hand, p.eb), bein: bein(p.bein, p.fuss, p.kb) };
  if (p.arm2 || p.hand2) ergebnis.arm2 = arm(p.arm2, p.hand2, p.eb2);
  if (p.bein2 || p.fuss2) ergebnis.bein2 = bein(p.bein2, p.fuss2, p.kb2);
  return ergebnis;
}

const EB = 1; // Ellbogen beim Tischrudern nach hinten
const PP = 1; // Ellbogen bei der Pseudo-Planche eng am Körper, unter der Rumpflinie
// Wiederkehrende Posen
const liegestuetz = { geraet: 'boden',
  start: { huefte: [65.4, 63.3], rumpf: 204, arm: [90, 90], bein: [24, 24] },
  ende: { huefte: [69.6, 73.1], rumpf: 190, arm: [30, 163], bein: [10, 10] } };
const beinHang = { bein: [15, 200] }; // Knie stark angewinkelt, Füße nach hinten
const STANGE = 16; // Hände auf der Stange (Linie bei y = 15); oben ist der Kopf ganz darüber
const klimmzug = {
  start: { h: [60, 72], r: -90, hand: [64, STANGE], eb: -1, ...beinHang },
  ende: { h: [60, 44], r: -90, hand: [64, STANGE], eb: 1, ...beinHang },
};
const umgedreht = (f) => ({ start: f.ende, ende: f.start });

const QUELLE = {
  // Drücken horizontal
  'Liegestütz': liegestuetz,
  'Diamond-Liegestütz': liegestuetz,
  'Liegestütz mit erhöhten Füßen': { geraet: 'stuhl',
    start: { h: [67.8, 54.3], r: 186, arm: [90, 90], bein: [6, 6] },
    ende: { h: [69.3, 65.4], r: 167, hand: [38, 80], eb: -1, bein: [-13, -13] } },
  'Archer-Liegestütz': { geraet: 'boden',
    start: { h: [65.4, 63.3], r: 204, arm: [90, 90], hand2: [14, 79], bein: [24, 24] },
    ende: { h: [69.6, 73.1], r: 190, arm: [30, 163], hand2: [14, 79], bein: [10, 10] } },
  'Pseudo-Planche-Liegestütz': { geraet: 'boden',
    start: { h: [82.1, 67.6], r: 201, hand: [72, 80], eb: -1, bein: [21, 21] },
    ende: { h: [75.8, 74.2], r: 186, hand: [72, 80], eb: PP, bein: [6, 6] } },
  // Drücken vertikal
  'Pike Push-up': { geraet: 'boden',
    start: { h: [66, 46], r: 152, hand: [20, 80], eb: -1, fuss: [68, 79.5], kb: 1 },
    ende: { h: [48, 52], r: 143, hand: [20, 80], eb: -1, fuss: [68, 79.5], kb: 1 } },
  'Pike Push-up mit erhöhten Füßen': { geraet: 'stuhl',
    start: { h: [74, 32], r: 120, arm: [130, 130], fuss: [96, 57], kb: 1 },
    ende: { h: [70, 38], r: 105, hand: [40.4, 80], eb: -1, fuss: [96, 57], kb: 1 } },
  'Wand-Handstand': { geraet: 'wand',
    start: { h: [42, 62], r: -22, arm: [90, 90], fuss: [10, 74] },
    ende: { h: [16.2, 22], r: 75, arm: [90, 90], fuss: [10, 2], kb: 1 } },
  'Negative Handstand-Liegestütz': { geraet: 'wand',
    start: { h: [16.2, 22], r: 75, hand: [22, 80], fuss: [10, 2], kb: 1 },
    ende: { h: [16, 38], r: 70, hand: [22, 80], eb: -1, fuss: [10, 14], kb: 1 } },
  // Ziehen ohne Stange
  'Tischrudern': { geraet: 'tisch',
    start: { h: [79.8, 75.1], r: 186, hand: [50, 43], bein: [6, 6] },
    ende: { h: [79.8, 67.2], r: 202, hand: [50, 43], eb: EB, bein: [22, 22] } },
  'Tischrudern mit erhöhten Füßen': { geraet: 'tisch',
    start: { h: [79.3, 65.8], r: 168, hand: [50, 43], bein: [-12, -12] },
    ende: { h: [81.8, 55.1], r: 186, hand: [50, 43], eb: EB, bein: [6, 6] } },
  'Einarmiges Tischrudern': { geraet: 'tisch',
    start: { h: [79.8, 75.1], r: 186, hand: [50, 43], arm2: [-30, 170], bein: [6, 6] },
    ende: { h: [79.8, 67.2], r: 202, hand: [50, 43], eb: EB, arm2: [-15, 185], bein: [22, 22] } },
  // Ziehen mit Stange
  'Negativ-Klimmzug': umgedreht(klimmzug),
  'Chin-up': klimmzug,
  'Klimmzug': klimmzug,
  'L-Sit-Klimmzug': {
    start: { h: [60, 72], r: -90, hand: [64, STANGE], eb: -1, bein: [0, 0] },
    ende: { h: [60, 44], r: -90, hand: [64, STANGE], eb: 1, bein: [0, 0] } },
  'Archer-Klimmzug': {
    start: { h: [56, 70], r: -90, hand: [40, STANGE], hand2: [72, STANGE], ...beinHang },
    ende: { h: [44, 44], r: -90, hand: [40, STANGE], eb: -1, hand2: [72, STANGE], ...beinHang } },
  // Beine
  'Kniebeuge': { geraet: 'boden',
    start: { huefte: [60, 46], rumpf: -90, arm: [0, 0], bein: [90, 90] },
    ende: { huefte: [51.8, 62.3], rumpf: -70, arm: [0, 0], bein: [10, 120] } },
  'Bulgarian Split Squat': { geraet: 'stuhl',
    start: { h: [62, 48], r: -90, arm: [95, 95], fuss: [50, 80], kb: 1, fuss2: [92, 57], kb2: 1 },
    ende: { h: [66, 62], r: -85, arm: [95, 95], fuss: [48, 80], kb: 1, fuss2: [92, 57], kb2: 1 } },
  'Shrimp Squat (assistiert)': { geraet: 'wand',
    start: { h: [36, 46], r: -90, hand: [11, 30], fuss: [36, 80], bein2: [95, -30] },
    ende: { h: [44, 62], r: -110, hand: [11, 40], eb: 1, fuss: [36, 80], kb: 1, bein2: [62, -60] } },
  'Pistol Squat (assistiert)': { geraet: 'wand',
    start: { h: [40, 46], r: -90, hand: [11, 24], fuss: [40, 80], bein2: [135, 135] },
    ende: { h: [52, 66], r: -120, hand: [11, 46], eb: 1, fuss: [40, 80], kb: 1, bein2: [180, 180] } },
  'Pistol Squat': { geraet: 'boden',
    start: { h: [60, 46], r: -90, arm: [180, 180], fuss: [60, 80], bein2: [135, 135] },
    ende: { h: [72, 66], r: -115, arm: [190, 190], fuss: [60, 80], kb: 1, bein2: [180, 180] } },
  // Hüfte
  'Einbeinige Hüftbrücke': { geraet: 'boden',
    start: { h: [54, 75], r: 180, arm: [0, 0], fuss: [66, 80], kb: -1, bein2: [-45, -45] },
    ende: { h: [50, 59], r: 148, arm: [0, 0], fuss: [66, 80], kb: -1, bein2: [-32, -32] } },
  'Einbeinige Hüftbrücke mit erhöhtem Fuß': { geraet: 'couch',
    start: { h: [60, 75], r: 180, arm: [0, 0], fuss: [88, 59], kb: -1, bein2: [-60, -60] },
    ende: { h: [57, 61.5], r: 153, arm: [0, 0], fuss: [88, 59], kb: -1, bein2: [-27, -27] } },
  'Negativer Nordic Curl': { geraet: 'couch',
    start: { h: [75, 61], r: -90, arm: [90, 90], fuss: [91, 76], kb: 1 },
    ende: { h: [60.3, 69.5], r: -150, arm: [120, 120], fuss: [91, 76], kb: 1 } },
  // Core
  'Unterarmstütz': { geraet: 'boden',
    start: { h: [65.2, 71], r: 196, arm: [90, 180], bein: [14, 14] },
    ende: { h: [65, 70.5], r: 194, arm: [90, 180], bein: [14, 14] } },
  'Hollow Hold': { geraet: 'boden',
    start: { h: [60, 75.5], r: 180, arm: [180, 180], bein: [0, 0] },
    ende: { h: [60, 76], r: 195, arm: [195, 195], bein: [-12, -12] } },
  'Hollow Rocks': { geraet: 'boden',
    start: { h: [62, 76], r: 205, arm: [210, 210], bein: [-5, -5] },
    ende: { h: [62, 76], r: 185, arm: [188, 188], bein: [-22, -22] } },
  // Mobilität
  'Hüftbeuger-Dehnung im Ausfallschritt': { geraet: 'boden',
    start: { h: [62, 62], r: -90, arm: [90, 90], fuss: [42, 80], kb: 1, fuss2: [87, 77], kb2: 1 },
    ende: { h: [56, 64], r: -95, arm: [90, 90], fuss: [42, 80], kb: 1, fuss2: [85, 77], kb2: 1 } },
  'Wandengel': { geraet: 'wand',
    start: { h: [14, 77], r: -90, arm: [-10, -90], bein: [0, 0] },
    ende: { h: [14, 77], r: -90, arm: [-95, -95], bein: [0, 0] } },
  'Offenes Buch': { geraet: 'boden',
    start: { h: [60, 75.5], r: 180, arm: [-90, -90], bein: [-90, 0] },
    ende: { h: [60, 75.5], r: 180, arm: [-90, -90], arm2: [175, 175], bein: [-90, 0] } },
  'Hamstring-Dehnung im Sitzen': { geraet: 'boden',
    start: { h: [70, 77], r: -90, arm: [97, 97], bein: [180, 180] },
    ende: { h: [70, 77], r: 220, arm: [160, 160], bein: [180, 180] } },
};

const GERAET = { 'ziehen-stange': 'stange' };
const fertig = (f) => (f.huefte ? f : pose(f));

const datei = new URL('../data/uebungen.json', import.meta.url);
const daten = JSON.parse(readFileSync(datei, 'utf8'));
const fehlend = [];
for (const kette of daten.ketten) {
  for (const stufe of kette.stufen) {
    for (const teil of stufe.routine ?? [stufe]) {
      const q = QUELLE[teil.name];
      if (!q) { fehlend.push(teil.name); continue; }
      teil.figur = { geraet: q.geraet ?? GERAET[kette.id] ?? 'boden', start: fertig(q.start), ende: fertig(q.ende) };
      const fehler = pruefeFigur(teil);
      const kontakt = ['start', 'ende'].map((t) => {
        const g = gelenke(teil.figur[t]);
        const p = (n, x) => `${n}(${x.map((v) => v.toFixed(0)).join(',')})`;
        return `${t}: ${p('H', g.vorn.hand)} ${p('F', g.vorn.fuss)} ${p('K', g.kopf)}`;
      }).join(' | ');
      console.log(`${fehler.length ? '✗' : '✓'} ${teil.name.padEnd(40)} ${kontakt}${fehler.length ? `  ${fehler.join(', ')}` : ''}`);
    }
  }
}
if (fehlend.length) console.log('Ohne Quelle:', fehlend.join(', '));

// Ausgabe wie bisher: eine Stufe pro Zeile
const text = `{\n  "ketten": [\n${daten.ketten.map((k) => {
  const { stufen, ...kopf } = k;
  return `    {\n      ${JSON.stringify(kopf).slice(1, -1)},\n      "stufen": [\n${stufen.map((s) => `        ${JSON.stringify(s)}`).join(',\n')}\n      ]\n    }`;
}).join(',\n')}\n  ]\n}\n`;
writeFileSync(datei, text);
