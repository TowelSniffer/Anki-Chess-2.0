## Board Modes & Note Types

This add-on can be heavily customized to create many different types of cards. This includes options such as configuring the timer, disabling variation lines, and many more. Config options can be saved on a per-note basis (or per-card if you want to make multi-sided notes). 

> **Tip:** Using Anki's built-in tools for managing note types, you can clone this template to have dedicated setups like "ankiChess", "Chess Flipped", or "Chess Study". Refer to the **Interactive Examples** section for possible setups!

### Puzzle (Default)
Play a standard tactic-style card according to a given PGN.

### Flipped Puzzle
*Requires:* `Template > Opponent Moves First`
Auto-plays the first move of a PGN and orients the board from the second player's perspective. This is the default setup for Lichess Puzzles.

### Study Mode
*Requires:* `Template > Play Both Sides`
Same as Puzzle mode, but requires the user to play *both* sides of a PGN. Useful for studying full games.

### Play vs Engine
You can make an engine card by putting a **FEN** instead of a PGN into the Anki `PGN` field. This will load that position and have you play against the engine. Refer to the AI settings for controlling options like strength. 

> The [Companion Add-on](https://ankiweb.net/shared/info/1300975327) will automatically handle updating multiple note types for you!

### While solving
The bar under the board says whose move it is, the time left (`Puzzle > Timer`), after a mistake how many tries are left for the move (`Puzzle > Handicap`), and the result.

* **Hints** (`Puzzle > Hints`, the bulb button or `H`): the first marks the piece to move, the second shows the move, the third plays it. Any hint rules out a perfect score, and the third counts as a mistake.
* **Refutation** (`Puzzle > Show Refutation`): after a wrong move the board shows the reply that punishes it for a moment, then takes the move back.
* **Eval bar** (`Puzzle > Show Eval on Front`): the board's border shows Stockfish's evaluation while you solve, as on the back, without arrows or lines. It's off by default: Stockfish runs on each position, which takes some battery on a phone.
* **Player bars** (`Board > Player Bars`): the players, their material and the result, above and below the board. Without them the status goes next to the card's tools.
* **Board size** (`Board > Board Size`): the largest the board gets. It always fits the screen.
