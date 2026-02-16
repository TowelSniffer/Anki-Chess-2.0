import type {
  CustomPgnGame,
  BoardModes
} from '$Types/ChessStructs';
import type { Tags } from '@mliebelt/pgn-types';
import { DEFAULT_POSITION } from 'chess.js';
import { parse } from '@mliebelt/pgn-parser';
import { userConfig } from '$stores/userConfig.svelte';
import {
  checkCastleRights,
  assignMirrorState,
  mirrorFen,
  mirrorPgnTree,
  type MirrorState,
} from '$features/pgn/mirror';

export function mirrorPGN(parsedPGN: CustomPgnGame, boardMode: BoardModes): void {
  let pgnBaseFen = parsedPGN.tags?.FEN ?? DEFAULT_POSITION;
  let mirrorState: MirrorState = 'original';
  if (
    userConfig.opts.mirror &&
    !checkCastleRights(pgnBaseFen)
  ) {
    const savedMirrorState =
      sessionStorage.getItem('chess__mirrorState') ?? null;

    if (boardMode === 'Puzzle') {
      mirrorState = assignMirrorState();
      sessionStorage.setItem('chess__mirrorState', mirrorState);
    } else if (savedMirrorState) {
      mirrorState = (savedMirrorState as MirrorState);
      sessionStorage.removeItem('chess__mirrorState');
    }
  }

  if (mirrorState !== 'original') {
    parsedPGN.tags ??= {} as Tags;
    parsedPGN.tags.FEN = mirrorFen(pgnBaseFen, mirrorState)
    mirrorPgnTree(parsedPGN.moves, mirrorState);
  }

}

export function parsePGN(rawPgn: string): CustomPgnGame {
  const parsed = parse(rawPgn, {
    startRule: 'game',
  }) as unknown as CustomPgnGame;

  return parsed;
}
