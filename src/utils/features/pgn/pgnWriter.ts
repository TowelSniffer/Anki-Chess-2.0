// Writes the game back to PGN, with the moves and variations added while analysing:
// the whole game, or a new game starting from a position of it.

import type { CustomPgnGame, CustomPgnMove, PgnPath } from '$Types/ChessStructs';

type Tags = Record<string, unknown>;

// The PGN standard's Seven Tag Roster comes first, in this order
const ROSTER = ['Event', 'Site', 'Date', 'Round', 'White', 'Black', 'Result'];
const RESULTS = ['1-0', '0-1', '1/2-1/2', '*'];
// Identifies a note for the Lichess Study Importer add-on (see its pgn_split.ID_TAG)
const ID_TAG = 'AnkiChessId';

// The parser turns some tags into objects (Date, TimeControl), keeping the text in `value`
function tagValue(value: unknown): string {
  if (Array.isArray(value)) return value.map(tagValue).join(':');
  if (value && typeof value === 'object' && 'value' in value) {
    return String((value as { value: unknown }).value);
  }
  return String(value ?? '');
}

export function writeTags(tags: Tags): string {
  const keys = [
    ...ROSTER.filter((key) => key in tags),
    ...Object.keys(tags).filter((key) => !ROSTER.includes(key) && key !== 'messages'),
  ];
  return keys
    .filter((key) => tags[key] !== undefined && tags[key] !== null)
    .map((key) => `[${key} "${tagValue(tags[key]).replace(/\\/g, '\\\\').replace(/"/g, '\\"')}"]`)
    .join('\n');
}

// A comment with its commands ([%cal], [%csl], [%eval], [%clk], [%c_effect]...) put back
function writeComment(text: string | null | undefined, diag?: object | null): string {
  const commands = Object.entries(diag ?? {}).flatMap(([key, value]) => {
    if (key === 'comment' || value === null || value === undefined || value === '') return [];
    if (key === 'colorArrows') return [`[%cal ${(value as string[]).join(',')}]`];
    if (key === 'colorFields') return [`[%csl ${(value as string[]).join(',')}]`];
    return [`[%${key} ${value}]`];
  });
  const parts = [...commands, (text ?? '').trim()].filter(Boolean);
  return parts.length ? `{ ${parts.join(' ')} }` : '';
}

function moveNumber(move: CustomPgnMove): string {
  const [, turn, , , , fullmove] = move.before.split(' ');
  return turn === 'w' ? `${fullmove}.` : `${fullmove}...`;
}

export function writeMoves(moves: CustomPgnMove[]): string {
  const tokens: string[] = [];
  let needsNumber = true; // a black move needs its number after a comment or a variation
  for (const move of moves) {
    const comment = writeComment(move.commentMove);
    if (comment) tokens.push(comment);
    if (needsNumber || comment || move.turn === 'w') tokens.push(moveNumber(move));
    tokens.push(move.san, ...(move.nag ?? []));

    const after = writeComment(move.commentAfter, move.commentDiag);
    if (after) tokens.push(after);
    for (const variation of move.variations ?? []) {
      if (variation.length) tokens.push(`(${writeMoves(variation)})`);
    }
    needsNumber = !!after || (move.variations ?? []).some((v) => v.length);
  }
  return tokens.join(' ');
}

// Short stable hash, so the same analysis keeps the same id
function hash(text: string): string {
  let h = 0x811c9dc5;
  for (let i = 0; i < text.length; i++) h = Math.imul(h ^ text.charCodeAt(i), 0x01000193);
  return (h >>> 0).toString(16).padStart(8, '0');
}

/**
 * The tags, with an [AnkiChessId] of its own instead of the card's: a card made from
 * this PGN is another card, and the Lichess Study Importer must never take it for the
 * chapter it comes from (or update both with the chapter).
 */
function analysisTags(tags: Tags, movetext: string): Tags {
  const own: Tags = { ...tags };
  delete own[ID_TAG];
  own[ID_TAG] = `analysis/${hash(`${tagValue(tags.FEN)}\n${movetext}`)}`;
  return own;
}

function writeGame(tags: Tags, movetext: string): string {
  const result = RESULTS.includes(String(tags.Result)) ? String(tags.Result) : '*';
  const body = [movetext, result].filter(Boolean).join(' ');
  const header = writeTags(analysisTags(tags, movetext));
  return header ? `${header}\n\n${body}` : body;
}

// The whole game, with the analysis
export function writePgn(game: CustomPgnGame): string {
  const intro = writeComment(game.gameComment?.comment, game.gameComment);
  const movetext = [intro, writeMoves(game.moves)].filter(Boolean).join(' ');
  return writeGame({ ...(game.tags as Tags) }, movetext);
}

// The line holding the move at `path` and its index there; [main line, -1] at the start
export function lineAt(moves: CustomPgnMove[], path: PgnPath): [CustomPgnMove[], number] {
  let line = moves;
  for (let i = 0; i < path.length; i += 3) {
    const index = path[i] as number;
    if (path[i + 1] !== 'v') return [line, index];
    line = line[index].variations[path[i + 2] as number];
  }
  return [line, -1];
}

/**
 * A new game from the position after the move at `path` (the start with an empty path):
 * that position as its FEN, and the moves that follow on the same line, with their
 * variations. It keeps the game's other tags.
 */
export function writePgnFrom(game: CustomPgnGame, path: PgnPath, startFen: string): string {
  const [line, index] = lineAt(game.moves, path);
  const tags: Tags = { ...(game.tags as Tags) };
  delete tags.FEN;
  delete tags.SetUp;
  tags.FEN = index < 0 ? startFen : line[index].after;
  tags.SetUp = '1';
  return writeGame(tags, writeMoves(line.slice(index + 1)));
}
