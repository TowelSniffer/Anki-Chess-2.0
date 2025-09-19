# Managing templates

Depending on use case it will make sense to clone this template to handle different configurations. For example, ankiChess and ankiChessFlip. The [companion addon](https://ankiweb.net/shared/info/1300975327?cb=1755601119118) will handle creating and managing multiple note templates pretty seemlesly, but you can also configure them manually by editing the `userConfig` json at the beggining of the front and back side in anki's note editor. 

These are the options currently but I will add more in future. refer to the comment for functionality. Be careful not to break formatting when editing. 
```
<script>
    // User Variables
    var userConfig = {
        fontSize: 18, // The font size for the puzzle text.
        frontText: false, // Show userText on front side.
        muteAudio: false,
        puzzleSettings: {
            _title: "Puzzle Settings",
            _collapsed: false,
            flip: false, // Sets whether Puzzle begins from First or second move of PGN.
            handicap: 1, // Number of wrong attempts before puzzle advances automatically.
            strictScoring: false, // Puzzle is marked wrong with any mistake.
            acceptVariations: true, // Allows for multiple lines for both sides.
        },
        boardSettings: {
            _title: "Board Settings",
            _collapsed: true,
            disableArrows: false, // Disables arrows on front side.
            showDests: true, // Indicate legal moves for clicked piece.
        },
        mirrorSettings: {
            _title: "Mirror Settings",
            _collapsed: true,
            mirror: false, // Card will randomly show up in a mirrored and/or inverted orientation if neither player holds castle rights.
            randomOrientation: false, // Sets a grey border and random board rotation.
        },
        timerSettings: {
            _title: "Timer Settings",
            _collapsed: true,
            timer: 0, // Max solve time in seconds. Set to 0 to diable.
            increment: 0, // Increase Max time with each move.
            timerScore: true, // Mark puzzle incorrect when out of time.
        },
        autoAdvanceSettings: {
            _title: "autoAdvance Settings",
            _collapsed: true, // This section will be closed by default
            autoAdvance: false, // Automatically show answer when player reaches end of line. Anki mobile not supported.
            handicapAdvance: false, // Also show answer when handicap is reached.
            timerAdvance: true, // Also show answer when timer runs out.
        },
    }
</script>
```

## Text Field

Content in the textField field will be shown above the PGN. Should keep existing formatting. If user want this to also display on the front side, toggle `frontText` with companion addon, or manually edit `userConfig` json in anki template editor. 



