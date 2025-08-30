export function assignMirrorState(pgn) {
  const states = ["original","original_mirror", "invert", "invert_mirror"];
  const mirrorRandom = Math.floor(Math.random() * states.length);
  let mirrorState = states[mirrorRandom];

  return mirrorState;
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

export function mirrorMove(move, mirrorState) {
  var notations = {}

  const notationMaps = {
    "invert_mirror": { q: 'q', a: 'a', b: 'b', c: 'c', d: 'd', e: 'e', f: 'f', g: 'g', h: 'h', 1: '8', 2: '7', 3: '6', 4: '5', 5: '4', 6: '3', 7: '2', 8: '1' },
    "invert": { q: 'q', a: 'h', b: 'g', c: 'f', d: 'e', e: 'd', f: 'c', g: 'b', h: 'a', 1: '8', 2: '7', 3: '6', 4: '5', 5: '4', 6: '3', 7: '2', 8: '1' },
    "original_mirror": { q: 'q', a: 'h', b: 'g', c: 'f', d: 'e', e: 'd', f: 'c', g: 'b', h: 'a', 1: '1', 2: '2', 3: '3', 4: '4', 5: '5', 6: '6', 7: '7', 8: '8' },
    "original": { q: 'q', a: 'a', b: 'b', c: 'c', d: 'd', e: 'e', f: 'f', g: 'g', h: 'h', 1: '1', 2: '2', 3: '3', 4: '4', 5: '5', 6: '6', 7: '7', 8: '8' }
  }

  const notationMap = notationMaps[mirrorState] || notationMaps.original;

  if (move.notation.disc) move.notation.disc = move.notation.disc.split('').map(char => notationMap[char] || char).join('');
  if (move.notation.col) move.notation.col = move.notation.col.split('').map(char => notationMap[char] || char).join('');
  if (move.notation.row) move.notation.row = move.notation.row.split('').map(char => notationMap[char] || char).join('');
  move.notation.notation = move.notation.notation.split('').map(char => notationMap[char] || char).join('');

}

export function mirrorPgnTree(moves, mirrorState) {
    if (!moves) return;
    for (let i = 0; i < moves.length; i++) {
        const move = moves[i];
        mirrorMove(move, mirrorState);

        if (move.variations) {
            move.variations.forEach((variation, varIndex) => {
                mirrorPgnTree(variation, mirrorState);
            });
        }
    }
}

