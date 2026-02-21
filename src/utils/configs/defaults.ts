import type { BoardModes } from '$Types/ChessStructs';

export const devPgn = `
[Event "The Opera Game"]
[Site "Paris Opera House"]
[Date "1858.11.02"]
[Round "?"]
[White "Paul Morphy"]
[Black "Duke of Brunswick &amp; Count Isouart"]
[Result "1-0"]
[ECO "C41"]

1. e4 e5 2. Nf3 d6 {This is the Philidor Defence. It's solid but can be passive.} 3. d4 Bg4?! {This pin is a bit premature. A more common and solid move would be 3...exd4.} 4. dxe5 Bxf3 (4... dxe5 5. Qxd8+ Kxd8 6. Nxe5 {White wins a pawn and has a better position.}) 5. Qxf3! {A great move. Morphy is willing to accept doubled pawns to accelerate his development.} 5... dxe5 6. Bc4 {Putting immediate pressure on the weak f7 square.} 6... Nf6 7. Qb3! {A powerful double attack on f7 and b7.} 7... Qe7 {This is the only move to defend both threats, but it places the queen on an awkward square and blocks the f8-bishop.} 8. Nc3 c6 9. Bg5 {Now Black's knight on f6 is pinned and cannot move without the queen being captured.} 9... b5?! {A desperate attempt to kick the bishop and relieve some pressure, but it weakens Black's queenside.} 10. Nxb5! {A brilliant sacrifice! Morphy sees that his attack is worth more than the knight.} 10... cxb5 11. Bxb5+ Nbd7 12. O-O-O {All of White's pieces are now in the attack, while Black's are tangled up and undeveloped.} 12... Rd8 13. Rxd7! {Another fantastic sacrifice to remove the defending knight.} 13... Rxd7 14. Rd1 {Renewing the pin and intensifying the pressure. Black is completely paralyzed.} 14... Qe6 {Trying to trade queens to relieve the pressure, but it's too late.} 15. Bxd7+ Nxd7 (15... Qxd7 16. Qb8+ Ke7 17. Qxe5+ Kd8 18. Bxf6+ {and White wins easily.}) 16. Qb8+! {The stunning final sacrifice! Morphy forces mate by sacrificing his most powerful piece.} 16... Nxb8 17. Rd8# {A beautiful checkmate, delivered with just a rook and bishop.} 1-0
`;

export const devBoardMode: BoardModes = 'Viewer';

export const devText = `
      <h2>The Opera Game</h2>
      White: Paul Morphy<br />Black: Duke of Brunswick &amp; Count Isouart
    `;
