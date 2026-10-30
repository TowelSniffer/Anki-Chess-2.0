- **language**: interface language. `"en"` (default), `"pt-BR"`, or `"auto"` to follow Anki's interface language. The menu entry updates after restarting Anki; the dialog updates the next time it opens.
- **deck_root**: root deck for everything imported (set here; the import windows don't ask for it).
  Empty = `Chess` (English) or `Xadrez` (pt-BR). Each Lichess study goes to
  `<root>::<study>::Opening lines`, `::Tactics` and `::Annotated games` (opening lines are tagged
  `opening::<family>::<variation>`); Chess.com cards go to `<root>::Openings::<family>` and
  `<root>::My games::<error type>`. Re-importing with "update" moves older notes into this layout.
- **study_decks** / **chapter_decks**: deck names chosen in the import window (the study deck, typed
  or picked with Choose…, and the subdeck of a chapter), by study and by chapter, so that importing
  the study again uses them. A study deck that no longer exists gives way to the deck the study's
  notes are in. Filled by the window; remove an entry (or use Default names) to go back to the
  default name.
- **include_games**: select full-game chapters (no FEN) by default.
- **split_lines**: one note per variation of the opening lines (each branch from the start to its end).
- **key_moves**: besides each full game, a "find the move" note for every move marked ! or !!,
  in the study's Key moves subdeck.
- **update_existing**: on re-import, update notes already imported instead of skipping them.
- **strip_anno**: remove the `[%anno ...]` markers Lichess leaves in comments.
- **base_note_type**: note type the Flipped/Study ones are cloned from, when a chapter or card needs
  one that doesn't exist yet. Empty = `AnkiChess`, or the first chess note type set up as a puzzle.
- **lichess_token**: personal token to download private studies (`study:read` scope) and your puzzle
  activity (`puzzle:read` scope). With it Lichess limits study downloads by account (3 at a time)
  instead of by IP (1 at a time). Stored as plain text; set it with **Lichess token…** at the bottom
  of the import window, which checks it with Lichess.
- **lichess_token_user**: the Lichess account of the token, found when it was checked (shown in the
  import window).
- **lichess_username**: last user whose studies were listed (`User's studies…`).
- **puzzle_max** / **puzzle_failed_only**: how many of your latest puzzles to load, and only the failed ones.
- **puzzle_deck**: deck of the Lichess puzzles. Empty = `<root>::Lichess puzzles`.

**Games** (`Tools > Import into AnkiChess...`, Games tab):

- **chesscom_usernames**: your Chess.com and Lichess usernames; used to pick your side automatically.
- **chesscom_user** / **lichess_user**: your usernames for **My games…** (your latest games).
- **chesscom_kinds**: card types selected last time (empty = default selection).
- **analysis_time**: Stockfish seconds per move (the positions that become cards get 3x more).
- **stockfish_path**: Stockfish executable. Empty = the one downloaded by the add-on (`user_files/stockfish`) or `stockfish` on the PATH.
