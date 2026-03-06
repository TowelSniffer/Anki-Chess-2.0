## Board Modes & Note Types

This add-on can be heavily customized to create many different types of cards. This includes options such as configuring the timer, disabling variation lines, and many more. Config options can be saved on a per-note basis (or per-card if you want to make multi-sided notes). 

> **Tip:** Using Anki's built-in tools for managing note types, you can clone this template to have dedicated setups like "ankiChess", "Chess Flipped", or "Chess Study". Refer to the **Interactive Examples** section for possible setups!

### Puzzle (Default)
Play a standard tactic-style card according to a given PGN.

### Flipped Puzzle
*Requires:* `Anki Template > Flip PGN`
Auto-plays the first move of a PGN and orients the board from the second player's perspective. This is the default setup for Lichess Puzzles.

### Study Mode
*Requires:* `Anki Template > Play Both Sides`
Same as Puzzle mode, but requires the user to play *both* sides of a PGN. Useful for studying full games.

### Play vs Engine
You can make an engine card by putting a **FEN** instead of a PGN into the Anki `PGN` field. This will load that position and have you play against the engine. Refer to the AI settings for controlling options like strength. 

> The [Companion Add-on](https://ankiweb.net/shared/info/1300975327) will automatically handle updating multiple note types for you!
