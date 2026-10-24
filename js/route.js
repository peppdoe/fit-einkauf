// Router über die Adresszeile: #/bereich/teil/teil?parameter=wert
// Startseite bei jedem Kaltstart der App (auch über das Homescreen-Symbol).
export const START = '#/heute';
const BEREICHE = ['heute', 'training', 'essen', 'einkauf', 'mehr'];

export function parseRoute(hash) {
  const [pfad, abfrage = ''] = String(hash ?? '').replace(/^#\/?/, '').split('?');
  const teile = pfad.split('/').filter(Boolean).map(decodeURIComponent);
  const parameter = Object.fromEntries(new URLSearchParams(abfrage));
  if (!BEREICHE.includes(teile[0])) return { bereich: 'heute', teile: [], parameter: {} };
  return { bereich: teile[0], teile: teile.slice(1), parameter };
}
