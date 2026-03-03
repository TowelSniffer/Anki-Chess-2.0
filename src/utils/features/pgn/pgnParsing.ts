import type { CustomPgnGame } from '$Types/ChessStructs';
import type { Tags } from '@mliebelt/pgn-types';
import { Chess, validateFen, DEFAULT_POSITION } from 'chess.js';
import { parse } from '@mliebelt/pgn-parser';
import {
  checkCastleRights,
  mirrorFen,
  mirrorPgnTree,
  type MirrorState,
} from '$features/pgn/mirror';

interface ParsedObject {
  parsedPgn: CustomPgnGame;
  error?: string;
}

export const isFen = (str: string | undefined | null) =>
  /^\s*([rnbqkbnrPNBRQK0-8]+\/){7}[rnbqkbnrPNBRQK0-8]+\s+[bw]/i.test(str || '');

export function mirrorPGN(parsedPGN: CustomPgnGame, mirrorState: MirrorState): void {
  let pgnBaseFen = parsedPGN.tags?.FEN ?? DEFAULT_POSITION;
  const isValidMirrorFen = !checkCastleRights(pgnBaseFen);
  if (mirrorState === 'original' || !isValidMirrorFen) return;
  mirrorState = mirrorState as MirrorState;
  if (mirrorState !== 'original') {
    parsedPGN.tags ??= {} as Tags;
    parsedPGN.tags.FEN = mirrorFen(pgnBaseFen, mirrorState);
    mirrorPgnTree(parsedPGN.moves, mirrorState);
  }
}

export function parsePGN(rawPgn: string): ParsedObject {
  /*
   * Here we validate PGN or FEN strings and
   */
  let pgnCheck = rawPgn;
  let errorMsg;
  let parsed;

  if (isFen(rawPgn)) {
    // Check if FEN iput for AI mode
    // Validate with chess.js and wrap in minimal pgn structure
    const { ok, error } = validateFen(pgnCheck);
    if (error) {
      console.warn(error);
      errorMsg = error;
    }
    const fen = ok ? pgnCheck : DEFAULT_POSITION;
    pgnCheck = `[Event "AI Mode"]\n[FEN "${fen}"]\n[SetUp "1"]\n\n*`;
  }

  // Attempt parsing and log error
  try {
    parsed = parse(pgnCheck, { startRule: 'game' }) as unknown as CustomPgnGame;
    errorMsg = null; // Clear previous errors on success
  } catch (e) {
    const pgnFallback = `[Event "AI Practice"]\n[FEN "${DEFAULT_POSITION}"]\n[SetUp "1"]\n\n*`;
    parsed = parse(pgnFallback, { startRule: 'game' }) as unknown as CustomPgnGame;
    errorMsg = e instanceof Error ? e.message : 'Invalid PGN format';
    console.warn(errorMsg);
  }

  return { parsedPgn: parsed, error: errorMsg };
}
