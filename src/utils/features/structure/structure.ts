import type { Key, Piece, Role, Color } from '@lichess-org/chessground/types';
import type { DrawShape } from '@lichess-org/chessground/draw';
import { cleanComment } from '$features/pgn/pgnParsing';

/*
 * Pawn structures (a [FEN] with no moves, often without kings) rebuilt on the board:
 * the opponent's pieces are shown, and the student places their own. Pure functions,
 * without chess.js (it rejects positions without kings).
 */

export interface Structure {
  target: Map<Key, Piece>; // every piece of the structure
  side: Color; // the side the student rebuilds (the chapter's orientation)
  comment: string; // the plans, without commands
  shapes: DrawShape[]; // the [%csl] squares and [%cal] arrows of the comments
  id: string; // [AnkiChessId], or the FEN: the attempt kept for the back side is this one's
}

export interface Attempt {
  correct: Key[]; // your pieces on the right squares
  wrong: Key[]; // your pieces where the structure has none of them
  missing: Key[]; // squares of the structure still without the right piece
}

export const ROLES: Role[] = ['pawn', 'knight', 'bishop', 'rook', 'queen', 'king'];
const ROLE_OF: Record<string, Role> = {
  p: 'pawn',
  n: 'knight',
  b: 'bishop',
  r: 'rook',
  q: 'queen',
  k: 'king',
};
const BRUSHES: Record<string, string> = { G: 'green', R: 'red', B: 'blue', Y: 'yellow' };
const FILES = 'abcdefgh';
const TAG_RE = /\[(\w+)\s+"((?:[^"\\]|\\.)*)"\]/g;
const COMMENT_RE = /\{([^}]*)\}/g;
// A move in the movetext (comments taken out first)
const SAN_RE = /(?:^|\s|\.)(?:[KQRBN]?[a-h]?[1-8]?x?[a-h][1-8](?:=[QRBN])?|O-O(?:-O)?)[+#]?(?=$|[\s!?)])/;

function tags(raw: string): Record<string, string> {
  const found: Record<string, string> = {};
  for (const [, name, value] of raw.matchAll(TAG_RE)) {
    if (!(name in found)) found[name] = value.replace(/\\(["\\])/g, '$1');
  }
  return found;
}

// The movetext: everything but the tags (the PGN field may hold it on one line)
const movetext = (raw: string) => raw.replace(TAG_RE, ' ');

const hasMoves = (raw: string) => SAN_RE.test(movetext(raw).replace(COMMENT_RE, ' '));

/** Pieces by square, from the first field of a FEN. */
export function parseBoard(fen: string): Map<Key, Piece> {
  const pieces = new Map<Key, Piece>();
  const rows = (fen.trim().split(/\s+/)[0] ?? '').split('/');
  rows.slice(0, 8).forEach((row, index) => {
    let file = 0;
    for (const char of row) {
      if (/\d/.test(char)) file += Number(char);
      else if (file < 8 && ROLE_OF[char.toLowerCase()]) {
        const color: Color = char === char.toUpperCase() ? 'white' : 'black';
        pieces.set(`${FILES[file]}${8 - index}` as Key, { role: ROLE_OF[char.toLowerCase()], color });
        file += 1;
      }
    }
  });
  return pieces;
}

/**
 * A structure card: written by the importer ([AnkiChessMode "structure"]), or a FEN with
 * no moves that the board can't play (a king missing), pasted by hand.
 */
export function isStructurePgn(raw: string | null | undefined): boolean {
  if (!raw) return false;
  const found = tags(raw);
  if (found.AnkiChessMode?.toLowerCase() === 'structure') return true;
  if (!found.FEN || hasMoves(raw)) return false;
  const board = found.FEN.split(/\s+/)[0];
  return !(board.includes('K') && board.includes('k'));
}

export function parseStructure(raw: string): Structure {
  const found = tags(raw);
  const fen = found.FEN ?? '';
  const comments = [...movetext(raw).matchAll(COMMENT_RE)].map((m) => m[1]);
  const shapes: DrawShape[] = [];
  for (const comment of comments) {
    for (const [, list] of comment.matchAll(/\[%csl\s+([^\]]*)\]/g)) {
      for (const item of list.split(',')) {
        const m = item.trim().match(/^([GRBY])([a-h][1-8])$/);
        if (m) shapes.push({ orig: m[2] as Key, brush: BRUSHES[m[1]] });
      }
    }
    for (const [, list] of comment.matchAll(/\[%cal\s+([^\]]*)\]/g)) {
      for (const item of list.split(',')) {
        const m = item.trim().match(/^([GRBY])([a-h][1-8])([a-h][1-8])$/);
        if (m) shapes.push({ orig: m[2] as Key, dest: m[3] as Key, brush: BRUSHES[m[1]] });
      }
    }
  }
  return {
    target: parseBoard(fen),
    side: found.Orientation?.toLowerCase() === 'black' ? 'black' : 'white',
    comment: comments
      .map((c) => cleanComment(c))
      .filter(Boolean)
      .join('\n\n'),
    shapes,
    id: found.AnkiChessId || fen,
  };
}

/** The pieces of one side. */
export const piecesOf = (pieces: Map<Key, Piece>, color: Color) =>
  new Map([...pieces].filter(([, piece]) => piece.color === color));

/** The opponent's pieces: shown on the board from the start. */
export const given = (structure: Structure) =>
  piecesOf(structure.target, structure.side === 'white' ? 'black' : 'white');

/** How many pieces of each kind one side has. */
export function counts(pieces: Map<Key, Piece>, color: Color): Record<Role, number> {
  const result = Object.fromEntries(ROLES.map((role) => [role, 0])) as Record<Role, number>;
  for (const piece of pieces.values()) if (piece.color === color) result[piece.role] += 1;
  return result;
}

/** Your pieces on the board against the structure (the opponent's are given). */
export function checkAttempt(target: Map<Key, Piece>, pieces: Map<Key, Piece>, side: Color): Attempt {
  const same = (a?: Piece, b?: Piece) => !!a && !!b && a.color === b.color && a.role === b.role;
  const correct: Key[] = [];
  const wrong: Key[] = [];
  const missing: Key[] = [];
  for (const [key, piece] of pieces) {
    if (piece.color !== side) continue;
    (same(piece, target.get(key)) ? correct : wrong).push(key);
  }
  for (const [key, piece] of target) {
    if (piece.color === side && !same(piece, pieces.get(key))) missing.push(key);
  }
  return { correct, wrong, missing };
}

/** Squares where a piece of yours can go: every square but the opponent's. */
export function destinations(pieces: Map<Key, Piece>, side: Color): Map<Key, Key[]> {
  const free: Key[] = [];
  for (const file of FILES) {
    for (let rank = 1; rank <= 8; rank++) {
      const key = `${file}${rank}` as Key;
      if (!pieces.has(key)) free.push(key);
    }
  }
  const dests = new Map<Key, Key[]>();
  for (const [key, piece] of pieces) if (piece.color === side) dests.set(key, free);
  return dests;
}
