import { CustomPgnMove } from './config';

// Define a specific type for the possible mirror states for type safety.
export type MirrorState = "original" | "original_mirror" | "invert" | "invert_mirror";

// A map for character-to-character substitution.
type NotationMap = { [key: string]: string };


// The _pgn parameter is prefixed with an underscore indicates it's intentionally unused
export function assignMirrorState(): MirrorState {
  const states: MirrorState[] = ["original", "original_mirror", "invert", "invert_mirror"];
  const mirrorRandom = Math.floor(Math.random() * states.length);
  return states[mirrorRandom];
}

// Reverses a single row of a FEN string.
function mirrorFenRow(row: string): string {
  return row.split('').reverse().join('');
}

// Transforms a FEN string based on the given mirror state.
export function mirrorFen(fullFen: string, mirrorState: MirrorState): string {
  if (mirrorState === "original") {
    return fullFen;
  }

  const fenParts = fullFen.split(' ');
  const fenBoard = fenParts[0];
  const fenColor = fenParts[1];
  const fenRest = fenParts.slice(2).join(' ');

  const fenRows = fenBoard.split('/');
  const fenBoardInverted = swapCase(fenBoard.split('').reverse().join(''));
  const fenBoardMirrored = fenRows.map(mirrorFenRow).join('/');
  const fenBoardMirroredInverted = swapCase(fenBoardMirrored.split('').reverse().join(''));
  const fenColorSwapped = (fenColor === 'w') ? 'b' : 'w';

  switch (mirrorState) {
    case "invert_mirror":
      return `${fenBoardMirroredInverted} ${fenColorSwapped} ${fenRest}`;
    case "invert":
      return `${fenBoardInverted} ${fenColorSwapped} ${fenRest}`;
    case "original_mirror":
      return `${fenBoardMirrored} ${fenColor} ${fenRest}`;
    default:
      return fullFen;
  }
}

function swapCase(str: string): string {
  return str.split('').map(ch =>
  ch === ch.toLowerCase() ? ch.toUpperCase() : ch.toLowerCase()
  ).join('');
}

function mirrorMove(move: CustomPgnMove, mirrorState: MirrorState): void {
  const notationMaps: Record<MirrorState, NotationMap> = {
    "invert_mirror": { q: 'q', a: 'a', b: 'b', c: 'c', d: 'd', e: 'e', f: 'f', g: 'g', h: 'h', '1': '8', '2': '7', '3': '6', '4': '5', '5': '4', '6': '3', '7': '2', '8': '1' },
    "invert": { q: 'q', a: 'h', b: 'g', c: 'f', d: 'e', e: 'd', f: 'c', g: 'b', h: 'a', '1': '8', '2': '7', '3': '6', '4': '5', '5': '4', '6': '3', '7': '2', '8': '1' },
    "original_mirror": { q: 'q', a: 'h', b: 'g', c: 'f', d: 'e', e: 'd', f: 'c', g: 'b', h: 'a', '1': '1', '2': '2', '3': '3', '4': '4', '5': '5', '6': '6', '7': '7', '8': '8' },
    "original": { q: 'q', a: 'a', b: 'b', c: 'c', d: 'd', e: 'e', f: 'f', g: 'g', h: 'h', '1': '1', '2': '2', '3': '3', '4': '4', '5': '5', '6': '6', '7': '7', '8': '8' }
  };

  const notationMap = notationMaps[mirrorState];
  const transform = (val: string | undefined): string | undefined => {
    return val?.split('').map(char => notationMap[char] || char).join('');
  }

  move.notation.disc = transform(move.notation.disc);
  move.notation.col = transform(move.notation.col);
  move.notation.row = transform(move.notation.row);
  move.notation.notation = transform(move.notation.notation) ?? move.notation.notation;
}

export function mirrorPgnTree(moves: CustomPgnMove[], mirrorState: MirrorState, parentMove: PgnMove | null = null): void {
  if (!moves || moves.length === 0) return;

  for (const move of moves) {
    if (move.variations) {
      move.variations.forEach(variation => {
        mirrorPgnTree(variation, mirrorState, move);
      });
    }
  }

  const isInverted = mirrorState === 'invert' || mirrorState === 'invert_mirror';
  if (!isInverted) {
    for (const move of moves) mirrorMove(move, mirrorState);
    return;
  }

  let lastValidMoveNumber: number;
  const startsWithWhite = moves[0].turn === 'w';

  if (startsWithWhite) {
    // Case A: Sequence starts with White (e.g., "3. exd4 c4") -> "3... exd4 4. c4"
    moves.forEach((move, index) => {
      mirrorMove(move, mirrorState);
      if (move.turn === 'w') {
        move.turn = 'b';
    if (index === 0) {
      move.moveNumber--;
      lastValidMoveNumber = move.moveNumber;
    } else {
      move.moveNumber = undefined;
    }
      } else {
        move.turn = 'w';
        move.moveNumber = lastValidMoveNumber + 1;
        lastValidMoveNumber = move.moveNumber;
      }
    });
  } else {
    // Case B: Sequence starts with Black (e.g., "3... exd4 4. c4") -> "3. exd4 c4"
    lastValidMoveNumber = parentMove?.moveNumber ?? moves[0].moveNumber;
    moves.forEach((move, index) => {
      mirrorMove(move, mirrorState);
      if (move.turn === 'b') {
        move.turn = 'w';
    if (move.moveNumber) {
      lastValidMoveNumber = move.moveNumber;
    } else {
      move.moveNumber = (index === 0) ? lastValidMoveNumber : lastValidMoveNumber + 1;
      lastValidMoveNumber = move.moveNumber;
    }
      } else {
        move.turn = 'b';
        move.moveNumber = undefined;
      }
    });
  }
}

export function checkCastleRights(fen: string): boolean {
  const fenParts = fen.split(' ');
  if (fenParts.length < 3) return false;

  const castlingPart = fenParts[2];
  return castlingPart !== '-';
}
