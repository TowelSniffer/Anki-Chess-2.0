import type { CustomPgnGame, BoardModes } from '$Types/ChessStructs';
import type { Tags } from '@mliebelt/pgn-types';
import { DEFAULT_POSITION } from 'chess.js';
import { parse } from '@mliebelt/pgn-parser';
import {
  checkCastleRights,
  assignMirrorState,
  mirrorFen,
  mirrorPgnTree,
  type MirrorState,
} from '$features/pgn/mirror';

export function mirrorPGN(parsedPGN: CustomPgnGame, boardMode: BoardModes, savedMirrorState?: MirrorState): void {
  if (savedMirrorState === 'original') return;

  let pgnBaseFen = parsedPGN.tags?.FEN ?? DEFAULT_POSITION;
  let mirrorState: MirrorState = 'original';
  const isValidMirrorFen = !checkCastleRights(pgnBaseFen);
  if (!savedMirrorState && isValidMirrorFen) {

    if (/^(Puzzle|Study)$/.test(boardMode)) {
      mirrorState = assignMirrorState();
    } else if (savedMirrorState) {
      mirrorState = savedMirrorState as MirrorState;
    }
  }

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
