import type { BoardModes } from '$Types/ChessStructs';

export const devPgn = `
[Event "?"]
[Site "?"]
[Date "2023.02.13"]
[Round "?"]
[White "White"]
[Black "Black"]
[Result "*"]
[FEN "4kb1r/p2n1ppp/4q3/4p1B1/4P3/1Q6/PPP2PPP/2KR4 w k - 0 16"]
[SetUp "1"]

16. Qb8+ *
`;

export const devBoardMode: BoardModes = 'Viewer';

export const devText = `
      <h2>The Opera Game</h2>
      White: Paul Morphy<br />Black: Duke of Brunswick &amp; Count Isouart
    `;
