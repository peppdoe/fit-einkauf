// Übungsfiguren aus Pose-Daten. Bild 120 x 84, Boden bei y = 80.
// Winkel in Grad: 0 = nach rechts, 90 = nach unten (SVG-Richtung).

export const BILD = { breite: 120, hoehe: 84, boden: 80 };
export const LAENGE = { rumpf: 30, oberarm: 15, unterarm: 14, oberschenkel: 17, unterschenkel: 17, hals: 9, kopf: 5 };
export const GERAETE = ['boden', 'wand', 'stange', 'tisch', 'stuhl', 'couch'];

const GERAET_SVG = {
  boden: '',
  wand: '<path d="M8 0V80"/>',
  stange: '<path d="M20 15H100"/>',
  tisch: '<path d="M28 42H104M34 42V80M98 42V80"/>',
  stuhl: '<path d="M88 58H112M90 58V80M110 58V80"/>',
  couch: '<path d="M86 60H118V80M86 60V80M86 68H118"/>',
};

const rund = (n) => Math.round(n * 10) / 10 + 0; // + 0 macht aus -0 eine 0

export function punkt(von, grad, laenge) {
  const r = (grad * Math.PI) / 180;
  return [rund(von[0] + Math.cos(r) * laenge), rund(von[1] + Math.sin(r) * laenge)];
}

export function winkel(von, nach) {
  return rund((Math.atan2(nach[1] - von[1], nach[0] - von[0]) * 180) / Math.PI);
}

export function gelenke(pose) {
  const huefte = pose.huefte;
  const schulter = punkt(huefte, pose.rumpf, LAENGE.rumpf);
  const kopf = punkt(schulter, pose.rumpf, LAENGE.hals);
  const arm = ([oben, unten]) => {
    const ellbogen = punkt(schulter, oben, LAENGE.oberarm);
    return { ellbogen, hand: punkt(ellbogen, unten, LAENGE.unterarm) };
  };
  const bein = ([oben, unten]) => {
    const knie = punkt(huefte, oben, LAENGE.oberschenkel);
    return { knie, fuss: punkt(knie, unten, LAENGE.unterschenkel) };
  };
  return {
    huefte, schulter, kopf,
    vorn: { ...arm(pose.arm), ...bein(pose.bein) },
    hinten: { ...arm(pose.arm2 ?? pose.arm), ...bein(pose.bein2 ?? pose.bein) },
  };
}

const linie = (a, b) => `M${a[0]} ${a[1]}L${b[0]} ${b[1]}`;

export function poseZuSvg(pose, geraet = 'boden') {
  const g = gelenke(pose);
  const glieder = (s) => linie(g.schulter, s.ellbogen) + linie(s.ellbogen, s.hand) + linie(g.huefte, s.knie) + linie(s.knie, s.fuss);
  return '<g fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round">'
    + '<path d="M4 80.5H116" stroke-width="1.2" opacity=".35"/>'
    + `<g stroke-width="2" opacity=".35">${GERAET_SVG[geraet] ?? ''}</g>`
    + `<path d="${glieder(g.hinten)}" stroke-width="3.2" opacity=".45"/>`
    + `<path d="${linie(g.huefte, g.schulter)}${glieder(g.vorn)}" stroke-width="3.2"/>`
    + `<circle cx="${g.kopf[0]}" cy="${g.kopf[1]}" r="${LAENGE.kopf}" stroke-width="3.2"/>`
    + '</g>';
}

const istPaar = (x) => Array.isArray(x) && x.length === 2 && x.every(Number.isFinite);

export function pruefePose(pose) {
  if (!pose || !istPaar(pose.huefte)) return ['huefte fehlt'];
  const fehler = [];
  if (!Number.isFinite(pose.rumpf)) fehler.push('rumpf fehlt');
  for (const k of ['arm', 'bein']) if (!istPaar(pose[k])) fehler.push(`${k} fehlt`);
  for (const k of ['arm2', 'bein2']) if (pose[k] !== undefined && !istPaar(pose[k])) fehler.push(`${k} ungültig`);
  if (fehler.length) return fehler;
  const g = gelenke(pose);
  const punkte = [g.huefte, g.schulter, g.kopf, ...Object.values(g.vorn), ...Object.values(g.hinten)];
  if (punkte.some(([x, y]) => x < 0 || x > BILD.breite || y < 0 || y > BILD.hoehe)) fehler.push('Gelenk außerhalb des Bildes');
  return fehler;
}

export function pruefeFigur(eintrag) {
  const fehler = [];
  const figur = eintrag.figur;
  if (!figur) fehler.push('figur fehlt');
  else {
    if (!GERAETE.includes(figur.geraet)) fehler.push(`unbekanntes Gerät ${figur.geraet}`);
    for (const t of ['start', 'ende']) fehler.push(...pruefePose(figur[t]).map((f) => `${t}: ${f}`));
  }
  const n = eintrag.hinweise?.length ?? 0;
  if (n < 2 || n > 3) fehler.push(`${n} Hinweise statt 2–3`);
  return fehler;
}
