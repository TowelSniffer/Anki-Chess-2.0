export function assignMirrorState(pgn) {
  const states = ["original","original_mirror", "invert", "invert_mirror"];
  const mirrorRandom = Math.floor(Math.random() * states.length);
  let mirrorState = states[mirrorRandom];

  return mirrorState;
}

export function mirrorGameCommentArrows(pgn, mirrorState) {
  if (pgn.gameComment?.colorArrows?.length > 0) {
     const notationMap = getMirrorNotationMap(mirrorState);
     for (let i = 0; i < pgn.gameComment.colorArrows.length; i++) { 
        pgn.gameComment.colorArrows[i] = pgn.gameComment.colorArrows[i].split('').map(char => notationMap[char] || char).join('');
     }
  }
}

export function mirrorFenRow(row) {
  let result = row.split('').reverse().join('');
  return result;
}

export function mirrorFen(fullFen, mirrorState) {

  const fenParts = fullFen.split(' ');
  const fenBoard = fenParts[0];
  const fenColor = fenParts[1];
  const fenRest = fenParts.slice(2).join(' ');

  const fenRows = fenBoard.split('/');
  const fenBoardInverted = swapCase(fenBoard.split('').reverse().join(''));
  const fenBoardMirrored = fenRows.map(mirrorFenRow).join('/');
  const fenBoardMirroredInverted = swapCase(fenBoardMirrored.split('').reverse().join(''));

  const fenColorSwapped = (fenColor === 'w') ? 'b' : 'w';

  if ( mirrorState == "invert_mirror") {
    return `${fenBoardMirroredInverted} ${fenColorSwapped} ${fenRest}`;
  } else if (mirrorState == "invert") {
    return `${fenBoardInverted} ${fenColorSwapped} ${fenRest}`;
  } else if (mirrorState == "original_mirror") {
    return `${fenBoardMirrored} ${fenColor} ${fenRest}`;
  } else {
    return fullFen;
  }

}

export function swapCase(str) {
  return str.split('').map(ch =>
    ch === ch.toLowerCase() ? ch.toUpperCase() : ch.toLowerCase()
  ).join('');
}

export function getMirrorNotationMap(mirrorState) {
  const notationMaps = {
    "invert_mirror": { q: 'q', a: 'a', b: 'b', c: 'c', d: 'd', e: 'e', f: 'f', g: 'g', h: 'h', 1: '8', 2: '7', 3: '6', 4: '5', 5: '4', 6: '3', 7: '2', 8: '1' },
    "invert": { q: 'q', a: 'h', b: 'g', c: 'f', d: 'e', e: 'd', f: 'c', g: 'b', h: 'a', 1: '8', 2: '7', 3: '6', 4: '5', 5: '4', 6: '3', 7: '2', 8: '1' },
    "original_mirror": { q: 'q', a: 'h', b: 'g', c: 'f', d: 'e', e: 'd', f: 'c', g: 'b', h: 'a', 1: '1', 2: '2', 3: '3', 4: '4', 5: '5', 6: '6', 7: '7', 8: '8' },
    "original": { q: 'q', a: 'a', b: 'b', c: 'c', d: 'd', e: 'e', f: 'f', g: 'g', h: 'h', 1: '1', 2: '2', 3: '3', 4: '4', 5: '5', 6: '6', 7: '7', 8: '8' }
  }
  return notationMaps[mirrorState] || notationMaps.original;
}

export function mirrorMove(move, mirrorState) {

  const notationMap = getMirrorNotationMap(mirrorState);

  if (move.notation.disc) move.notation.disc = move.notation.disc.split('').map(char => notationMap[char] || char).join('');
  if (move.notation.col) move.notation.col = move.notation.col.split('').map(char => notationMap[char] || char).join('');
  if (move.notation.row) move.notation.row = move.notation.row.split('').map(char => notationMap[char] || char).join('');
  move.notation.notation = move.notation.notation.split('').map(char => notationMap[char] || char).join('');

  if (move.commentDiag?.colorArrows?.length > 0) {
    for (let i = 0; i < move.commentDiag.colorArrows.length; i++) {
        move.commentDiag.colorArrows[i] = move.commentDiag.colorArrows[i].split('').map(char => notationMap[char] || char).join('');
    }
  }

}

export function mirrorPgnTree(moves, mirrorState, parentMove = null) {
  if (!moves || moves.length === 0) return;
  for (const move of moves) {
    if (move.variations) {
      move.variations.forEach(variation => {
        mirrorPgnTree(variation, mirrorState, move);
      });
    }
  }
  const isInverted = mirrorState === 'invert' || mirrorState === 'invert_mirror';
  let lastValidMoveNumber;
  if (isInverted) {
    const startsWithWhite = moves[0].turn === 'w';
    if (startsWithWhite) {
      // Case A: Sequence starts with White (e.g., "3. exd4 c4")
      // Becomes: "3... exd4 4. c4"
      for (const move of moves) {
        mirrorMove(move, mirrorState);
        const originalTurn = move.turn;

        if (originalTurn === 'w') {
          move.turn = 'b';
          if (move === moves[0]) {
            move.moveNumber--;
            lastValidMoveNumber = move.moveNumber;
          } else {
            move.moveNumber = null;
          }
        } else {
          move.turn = 'w';
          move.moveNumber = lastValidMoveNumber + 1;
          lastValidMoveNumber = move.moveNumber;
        }
      }
    } else {
      // Case B: Sequence starts with Black (e.g., "3... exd4 4. c4")
      // Becomes: "3. exd4 c4"
      if (parentMove) {
        lastValidMoveNumber = parentMove.moveNumber;
      } else {
        lastValidMoveNumber = moves[0].moveNumber;
      }

      for (const move of moves) {
        mirrorMove(move, mirrorState);
        const originalTurn = move.turn;

        if (originalTurn === 'b') {
          move.turn = 'w';
          if (move.moveNumber) {
            lastValidMoveNumber = move.moveNumber;
          } else {
            if (move === moves[0]) {
              move.moveNumber = lastValidMoveNumber;
            } else {
              move.moveNumber = lastValidMoveNumber + 1;
              lastValidMoveNumber = move.moveNumber;
            }
          }
        } else {
          move.turn = 'b';
          move.moveNumber = null;
        }
      }
    }
  } else {
    // If not a full color inversion, just mirror coordinates.
    for (const move of moves) {
      mirrorMove(move, mirrorState);
    }
  }
}

