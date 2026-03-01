import type { BoardModes } from '$Types/ChessStructs';

export const devPgn = `
[Event "?"]
[Site "?"]
[Date "2023.02.13"]
[Round "?"]
[White "White"]
[Black "Black"]
[Result "*"]
[FEN "rnbq1rk1/pp3pbp/3p1np1/1N2p3/2P5/4P1P1/PP3PBP/RNBQ1RK1 b - - 1 9"]
[SetUp "1"]

9... Nc6 10. N1c3 {[%EV 63.1] [%N 71.69% of 157k]} (10. b3 {[%EV 61.7] [%N 7.84% of
157k]}) (10. Qxd6 {[%EV 61.9] [%N 16.56% of 157k]}) *
`;

export const devBoardMode: BoardModes = 'Viewer';

export const devText = `
      <h2>The Opera Game</h2>
      White: Paul Morphy<br />Black: Duke of Brunswick &amp; Count Isouart
    `;
