# Vendored libraries

- `chess/`: [python-chess](https://github.com/niklasf/python-chess) 1.11.2, GPL-3.0 (see `chess/LICENSE.txt`).
  Anki does not ship it. Loaded through `chess_lib.py`. Two changes, marked "AnkiChess patch" in `pgn.py`
  (`read_game` and `GameBuilder`):
  - Some PGNs, Lichess study exports among them, write the replies to a move as its variations:
    `20. Qh6!! (20. gxh6 Rg3#)` means 20... gxh6 21. Rg3#, and Lichess shows it so. A variation whose first
    move is illegal where it branches but legal after the move it follows is read as such a reply (noted in
    `game.errors`); the line it follows keeps its own move as the main one.
  - After an illegal move inside a variation, the parser skipped the rest of the variation but kept its
    board, so the moves after its `)` were read in the variation's position and the game tree got moves
    that are illegal where they stand. That board is now dropped at the `)`: only the bad variation is
    left out.
