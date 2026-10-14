// Router über die Adresszeile: #/bereich/teil/teil?parameter=wert
const BEREICHE = ['training', 'essen', 'einkauf', 'mehr'];

export function parseRoute(hash) {
  const [pfad, abfrage = ''] = String(hash ?? '').replace(/^#\/?/, '').split('?');
  const teile = pfad.split('/').filter(Boolean).map(decodeURIComponent);
  const parameter = Object.fromEntries(new URLSearchParams(abfrage));
  if (!BEREICHE.includes(teile[0])) return { bereich: 'training', teile: [], parameter: {} };
  return { bereich: teile[0], teile: teile.slice(1), parameter };
}
