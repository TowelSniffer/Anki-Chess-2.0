# chessops

[![Test](https://github.com/niklasf/chessops/workflows/Test/badge.svg)](https://github.com/niklasf/chessops/actions)
[![npm](https://img.shields.io/npm/v/chessops)](https://www.npmjs.com/package/chessops)

Chess and chess variant rules and operations in TypeScript.

## Documentation

[View TypeDoc](https://niklasf.github.io/chessops/)

## Features

- [Read and write FEN](https://niklasf.github.io/chessops/modules/fen.html)
- Vocabulary
  - `Square`
  - `SquareSet` (implemented as bitboards)
  - `Color`
  - `Role` (piece type)
  - `Piece` (`Role` and `Color`)
  - `Board` (map of piece positions)
  - `Castles`
  - `Setup` (a not necessarily legal position)
  - `Position` (base class for legal positions, `Chess` is a concrete implementation)
- [Variant rules](https://niklasf.github.io/chessops/modules/variant.html):
  Standard chess, Crazyhouse, King of the Hill, Three-check,
  Antichess, Atomic, Horde, Racing Kings
  - Move making
  - Legal move and drop move generation
  - Game end and outcome
  - Insufficient material
  - Setup validation
- Supports Chess960
- [Attacks and rays](https://niklasf.github.io/chessops/modules/attacks.html)
  using Hyperbola Quintessence (faster to initialize than Magic Bitboards)
- Read and write UCI move notation
- [Read and write SAN](https://niklasf.github.io/chessops/modules/san.html)
- [Read and write PGN](https://niklasf.github.io/chessops/modules/pgn.html)
  - Parser supports asynchronous streaming
  - Game tree model
  - Transform game tree to augment nodes with arbitrary user data
  - Parse comments with evaluations, clocks and shapes
- [Transformations](https://niklasf.github.io/chessops/modules/transform.html): Mirroring and rotating
- [Compatibility](https://niklasf.github.io/chessops/modules/compat.html):
  [chessground](https://github.com/ornicar/chessground) and
  [scalachess](https://github.com/ornicar/scalachess)

## Example

```javascript
import { Chess } from 'chessops/chess';
import { parseFen } from 'chessops/fen';

const setup = parseFen('r1bqkbnr/ppp2Qpp/2np4/4p3/2B1P3/8/PPPP1PPP/RNB1K1NR b KQkq - 0 4').unwrap();
const pos = Chess.fromSetup(setup).unwrap();
console.assert(pos.isCheckmate());
```

## License

chessops is licensed under the GNU General Public License 3 or any later
version at your choice. See LICENSE.txt for details.
