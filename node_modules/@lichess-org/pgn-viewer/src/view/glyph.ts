import { h } from 'snabbdom';

export const renderNag = (nag: number) => {
  const glyph = glyphs[nag];
  return glyph ? h('nag', { attrs: { title: glyph.name } }, glyph.symbol) : undefined;
};

type Glyph = {
  symbol: string;
  name: string;
};
interface Glyphs {
  [key: number]: Glyph;
}

const glyphs: Glyphs = {
  1: {
    symbol: '!',
    name: 'Good move',
  },
  2: {
    symbol: '?',
    name: 'Mistake',
  },
  3: {
    symbol: '!!',
    name: 'Brilliant move',
  },
  4: {
    symbol: '??',
    name: 'Blunder',
  },
  5: {
    symbol: '!?',
    name: 'Interesting move',
  },
  6: {
    symbol: '?!',
    name: 'Dubious move',
  },
  7: {
    symbol: '□',
    name: 'Only move',
  },
  22: {
    symbol: '⨀',
    name: 'Zugzwang',
  },
  10: {
    symbol: '=',
    name: 'Equal position',
  },
  13: {
    symbol: '∞',
    name: 'Unclear position',
  },
  14: {
    symbol: '⩲',
    name: 'White is slightly better',
  },
  15: {
    symbol: '⩱',
    name: 'Black is slightly better',
  },
  16: {
    symbol: '±',
    name: 'White is better',
  },
  17: {
    symbol: '∓',
    name: 'Black is better',
  },
  18: {
    symbol: '+−',
    name: 'White is winning',
  },
  19: {
    symbol: '-+',
    name: 'Black is winning',
  },
  146: {
    symbol: 'N',
    name: 'Novelty',
  },
  32: {
    symbol: '↑↑',
    name: 'Development',
  },
  36: {
    symbol: '↑',
    name: 'Initiative',
  },
  40: {
    symbol: '→',
    name: 'Attack',
  },
  132: {
    symbol: '⇆',
    name: 'Counterplay',
  },
  138: {
    symbol: '⊕',
    name: 'Time trouble',
  },
  44: {
    symbol: '=∞',
    name: 'With compensation',
  },
  140: {
    symbol: '∆',
    name: 'With the idea',
  },
};
