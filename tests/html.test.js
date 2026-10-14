import { describe, it, expect } from 'vitest';
import { esc, sym, zahl, mengeText, zielText, datumKurz, sicher } from '../js/ansichten/html.js';

describe('html-Hilfen', () => {
  it('esc maskiert HTML', () => {
    expect(esc('<a href="x">&\'')).toBe('&lt;a href=&quot;x&quot;&gt;&amp;&#39;');
    expect(esc(null)).toBe('');
  });
  it('sym verweist auf das Symbol-Sprite', () => {
    expect(sym('plus')).toBe('<svg class="symbol" aria-hidden="true"><use href="bilder/symbole.svg#plus"/></svg>');
    expect(sym('haken', 'symbol--klein')).toContain('class="symbol symbol--klein"');
  });
  it('Zahlen und Mengen deutsch formatiert', () => {
    expect(zahl(2950)).toBe('2.950');
    expect(zahl(7.99, 2)).toBe('7,99');
    expect(mengeText(1000, 'g')).toBe('1.000 g');
    expect(mengeText(1.5, 'Stück')).toBe('1,5 Stück');
    expect(mengeText(2, '')).toBe('2');
    expect(mengeText(null, '')).toBe('');
  });
  it('Ziele und Datum', () => {
    expect(zielText({ saetze: 3, wdh: 6 }, true)).toBe('3 × 6 / Seite');
    expect(zielText({ saetze: 2, sek: 45 })).toBe('2 × 45 s');
    expect(datumKurz('2026-10-04')).toBe('4.10.');
  });
  it('sicher verlangt einen zweiten Tipp', () => {
    const knopf = { dataset: {}, textContent: 'Löschen' };
    expect(sicher(knopf, 'Nochmal tippen')).toBe(false);
    expect(knopf.textContent).toBe('Nochmal tippen');
    expect(sicher(knopf, 'Nochmal tippen')).toBe(true);
  });
});
