import type { Square } from 'chess.js';
import type { CustomPgnMove, CustomShape } from '$Types/ChessStructs';

/*
 * Chess.com Game Review marks, exported in the PGN comments as
 *   {[%c_effect a4;square;a4;type;Mistake;size;100%25;animated;false;persistent;true]}
 * (several separated by commas, e.g. Winner + CheckmateBlack on the kings after mate).
 * Drawn like on Chess.com: the square tinted with the classification colour and a
 * badge in its top right corner.
 */

type Badge = { color: string; icon: string; tint: boolean };

export type ChesscomEffect = { square: Square; badge: Badge };

// Icons are drawn around (0, 0) inside a badge of radius 18
const text = (glyph: string, size = 22) =>
  `<text y="1" text-anchor="middle" dominant-baseline="central" font-family="Arial, sans-serif" font-weight="bold" font-size="${size}" fill="#fff">${glyph}</text>`;
const line = (d: string, width = 4.5, color = '#fff') =>
  `<path d="${d}" fill="none" stroke="${color}" stroke-width="${width}" stroke-linecap="round" stroke-linejoin="round"/>`;
const shape = (d: string) => `<path d="${d}" fill="#fff"/>`;

const STAR = 'M0-11 2.6-3.6 10.5-3.4 4.3 1.4 6.5 8.9 0 4.5-6.5 8.9-4.3 1.4-10.5-3.4-2.6-3.6Z';
const THUMB = 'M-10-1h4v11h-4Z M-4-1 1-9.5q2-2.5 3.8-.5 1 1.2.4 3.2L4.2-3H9.5q2.8 0 2.2 2.8L10 7.6Q9.5 10 7 10H-4Z';
const BOOK = 'M-11-7.5Q-5.5-10 0-6.5-5.5-10 11-7.5V8.5Q5.5 6 0 9.5-5.5 6-11 8.5Z';
const CROWN = 'M-10.5 7.5H10.5L12-5.5 5.5-.5 0-9-5.5-.5-12-5.5Z';

const classification = (color: string, icon: string): Badge => ({ color, icon, tint: true });
const gameEnd = (color: string, icon: string): Badge => ({ color, icon, tint: false });

const BADGES: Record<string, Badge> = {
  brilliant: classification('#26c2a3', text('!!', 19)),
  greatfind: classification('#749bbf', text('!')),
  bestmove: classification('#81b64c', shape(STAR)),
  excellent: classification('#81b64c', shape(THUMB)),
  good: classification('#95b776', line('M-8 .5-2.5 6 8.5-6')),
  book: classification('#a88865', shape(BOOK) + line('M0-6V9', 1.5, '#a88865')),
  forced: classification('#97af8b', line('M-8 0H7M1-6 7 0 1 6')),
  inaccuracy: classification('#f7c631', text('?!', 19)),
  mistake: classification('#ffa459', text('?')),
  miss: classification('#ff7769', line('M-6-6 6 6M6-6-6 6')),
  blunder: classification('#fa412d', text('??', 19)),
  winner: gameEnd('#81b64c', shape(CROWN)),
  checkmate: gameEnd('#312e2b', text('#')),
  draw: gameEnd('#8b8987', text('½')),
  resign: gameEnd('#312e2b', line('M-5 9V-9') + shape('M-5-9H8L4.5-4.5 8 0H-5Z')),
  timeout: gameEnd('#312e2b', line('M0-8A8 8 0 1 1 0 8 8 8 0 1 1 0-8M0-4V0H4', 3)),
};

const ALIASES: Record<string, string> = { best: 'bestmove', great: 'greatfind', greatmove: 'greatfind' };

// CheckmateWhite/CheckmateBlack, DrawWhite... share the badge of their kind
function badgeFor(type: string): Badge | undefined {
  const key = type.toLowerCase();
  const kind = key.match(/^(checkmate|draw|resign|timeout)/)?.[1] ?? ALIASES[key] ?? key;
  return BADGES[kind];
}

export function parseEffects(value: string | undefined): ChesscomEffect[] {
  if (!value) return [];
  return value.split(',').flatMap((entry) => {
    // "<id>;key;value;key;value..." where the id is the square
    const [id, ...pairs] = entry.trim().split(';');
    const props: Record<string, string> = {};
    for (let i = 0; i + 1 < pairs.length; i += 2) props[pairs[i]] = pairs[i + 1];
    const square = props.square ?? id;
    const badge = badgeFor(props.type ?? '');
    return badge && /^[a-h][1-8]$/.test(square) ? [{ square: square as Square, badge }] : [];
  });
}

export const moveEffects = (move: CustomPgnMove | null | undefined) =>
  parseEffects(move?.commentDiag?.c_effect);

// Badge centred at (x, y) of the square's 100x100 box
export const badgeHtml = (badge: Badge, x: number, y: number) =>
  `<g transform="translate(${x} ${y})"><circle r="18" cy="1.5" fill="#000" opacity=".25"/>` +
  `<circle r="18" fill="${badge.color}"/>${badge.icon}</g>`;

/**
 * Board shapes for the marks of a move: the badge over the piece and, when tint is
 * set (the move was just played), the square colour under it.
 */
export function effectShapes(effects: ChesscomEffect[], tint: boolean): CustomShape[] {
  return effects.flatMap(({ square, badge }) => {
    const shapes: CustomShape[] = [{ orig: square, customSvg: { html: badgeHtml(badge, 80, 20) } }];
    if (tint && badge.tint) {
      shapes.push({
        orig: square,
        below: true,
        customSvg: { html: `<rect width="100" height="100" fill="${badge.color}" fill-opacity=".55"/>` },
      });
    }
    return shapes;
  });
}
