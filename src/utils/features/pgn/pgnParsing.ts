import type { CustomPgnGame } from '$Types/ChessStructs';
import type { Tags } from '@mliebelt/pgn-types';
import { DEFAULT_POSITION } from 'chess.js';
import { parse } from '@mliebelt/pgn-parser';
import {
  checkCastleRights,
  mirrorFen,
  mirrorPgnTree,
  type MirrorState,
} from '$features/pgn/mirror';

export function mirrorPGN(
  parsedPGN: CustomPgnGame,
  mirrorState: MirrorState,
): void {
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

export function parsePGN(rawPgn: string): CustomPgnGame {
  const parsed = parse(rawPgn, {
    startRule: 'game',
  }) as unknown as CustomPgnGame;

  return parsed;
}
