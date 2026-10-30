# Anki Chess Note Template

#### Features:

- Works on desktop and ankidroid/anki mobile
- Robust PGN functionality, including multi line support, and embedded shapes. 
- Local stockfish analysis for back side.
- Built in configuration menu to design cards of many types.
  - Puzzle mode: Solve a tactic defined by a PGN.
  - Study mode: Play both sides of a given PGN.
  - play FEN position vs AI.
- A [Companion Addon](https://ankiweb.net/shared/info/1300975327) to streamline updating and managing configurations

![Demo Gif](./Gifs/demo.gif)

# installation

download the apkg in [releases](https://github.com/TowelSniffer/Anki-Chess-2.0/releases) and import to anki. 

## Updating 

Can be handled automatically via the [Companion Addon](https://ankiweb.net/shared/info/1300975327). Otherwise watch for new releases if you want to manage this yourself. 


## Help

Refer to configuration tool tips or 'About' menu for information on config options, and helpful information for using the ankiChess note template. 

![paste](images/tooltips.png)

> Join the [discord](https://discord.gg/YPj4Pz2Qzw).

# Table of Contents

- [Companion Addon](src/assets/docs/_CompanionAddon.md)
- [Board Modes](src/assets/docs/_BoardModes.md)
- [Config Options](src/assets/docs/_ConfigOptions.md)
- [Support](src/assets/docs/_Support.md)
- [Recent Changelog](src/assets/docs/_ChangeLog.md)

# Build

```bash
npm install
npm run build
```

## build ankiChess note template (apkg file/media files)

[uv](https://docs.astral.sh/uv/getting-started/installation/) is required for building the apkg file

```bash
uv venv
uv pip install genanki
```

Then run:
```bash
npm run build:anki
```

Build media only (no uv requirement)
```bash
npm run build:anki-media
```


files generated in 'dist-anki'

# Lichess Study Importer (add-on)

`addon/lichess_study_importer` is a separate Anki add-on that creates AnkiChess notes from Lichess studies, analysed games (Chess.com or Lichess) and Lichess puzzles.

Install it from [AnkiWeb](https://ankiweb.net/shared/info/615602402): in Anki, `Tools > Add-ons > Get Add-ons…` and the code `615602402` (Anki 26.09 or later).

- One window, `Tools > Import into AnkiChess…` (also in the Companion's `AnkiChess` menu when installed), with the **Lichess studies**, **Games** and **Lichess puzzles** tabs, the **Update imported Lichess studies** button and your **Lichess token**. It keeps its size, and each table its columns; the pages stay open after importing.
- Interface in English (default) or Brazilian Portuguese: set `"language"` to `"en"`, `"pt-BR"` or `"auto"` (follow Anki's language) in `Tools > Add-ons > Config`.

### AnkiChess template

The add-on works on its own: when the collection has no AnkiChess note type, the window offers **Install the AnkiChess template**. It downloads the latest release of this project from GitHub, as the Companion does: the card's script, HTML and CSS, and the Stockfish the cards analyse with (a few MB, written into the media folder). It then adds the `AnkiChess` note type as the Companion makes it (fields, card and `ankiChessVersion` tag), so the [Companion](https://ankiweb.net/shared/info/1300975327), if installed, finds it and keeps it up to date.

### Lichess token

A personal API access token of your Lichess account (Preferences › API access tokens), set once with **Lichess token…** at the bottom of the import window and used by every tab:

- It downloads your private studies and your puzzle activity.
- Lichess sends study downloads one at a time per IP without a token, and three at a time per account with one: with the token, updating many studies isn't cut short by its limit.
- **Create a token on Lichess** opens Lichess' form with the `study:read` and `puzzle:read` scopes checked; click Create there and paste the token (`lip_…`). **Check** asks Lichess whose token it is and which scopes it has: it warns when one of the two is missing, or when the token allows more than the add-on needs (it is stored as plain text in the add-on config).
- The bottom bar shows the account of the saved token; **Remove token** takes it away.

Without a token, when Lichess answers "too many requests" (HTTP 429), the add-on waits and tries again by itself, counting down in the progress window (Esc stops and keeps what was downloaded). Study downloads go one at a time, a second apart.

## Studies

The **Lichess studies** tab creates **one note per chapter**.

- Sources: study or chapter links (several at once, separated by spaces); in **More sources**, **User's studies…** (lists the studies of a Lichess user to pick from), `.pgn` files (several at once), **Paste PGN…** and **Private study (token)…**, which opens the [Lichess token](#lichess-token). Files and links can also be dropped on the page. Before anything is loaded, the page lists the studies already in your collection, to load them again in one click.
- Every chapter shows its **Status** in your collection (new, imported, changed on Lichess), the side you play (**You play**) and its **Note type**, all at a glance before importing:
  - The side is the chapter's orientation on Lichess (studies loaded by link). For exported files it is guessed from the comments ("Jogam as brancas") or the result; opening lines and games without it are played on both sides.
  - The note type follows the side: `AnkiChess` when you make the first move, `AnkiChess Flipped` when the first move is the opponent's (played automatically, the board turned to your side), `AnkiChess Study` to play both sides. Missing ones are cloned from `AnkiChess` (or `base_note_type` in the add-on config) with `flipBoard`/`playBothSides` set; any other chess note type can also be picked.
  - New and changed chapters are selected; full games only with **Include full games**. Chapters of other chess variants (Chess960…) can't be imported.
- **Structures**: a chapter with a `[FEN]` and no moves (a pawn structure, often without kings, with the plans of each side in its comment) becomes an `AnkiChess` note in the study's **Structures** subdeck, whose card has you **rebuild your side on the board**:
  - The board is seen from your side (**You play**, the chapter's orientation on Lichess) and shows the opponent's pieces.
  - A palette has your pieces, each with how many are placed and how many the structure has (pawn 4/6). Tap a piece, then the squares; or drag it onto the board. Tap one of yours with the same piece to remove it, or with another to change it; the eraser removes, and a piece dragged off the board too. **Clear** starts over.
  - **Check** marks your pieces in green (right square) or red (wrong), and shows faded the ones still missing. You can fix them and check again.
  - The back shows the whole structure with your mistakes circled in red, the annotator's highlighted squares and arrows, and the plans.
  - The PGN keeps the chapter with `[AnkiChessMode "structure"]` and your side as `[Orientation]`; importing again keeps the side chosen for it. A structure PGN pasted by hand (a FEN without kings and no moves) opens the same way.
  - The card needs an AnkiChess template that rebuilds structures. With an older one in the collection (its `_ankiChess….js` doesn't know `AnkiChessMode`), structures are listed but not imported, and the window says why.
- **Gamebook** chapters work as on Lichess: only the main line is the answer, a variation you play is a wrong move that shows its comment, and the opponent keeps to the main line. The template reads `[ChapterMode "gamebook"]` from the PGN.
- Options:
  - **One note per variation**: each branch of an opening line becomes its own note, to drill every variation of a repertoire.
  - **Exercises from the ! and !! moves**: besides each full game, a "find the move" note for every move marked ! or !!, in the study's **Key moves** subdeck (a gamebook card: the other tries the author analysed are wrong answers with their comment).
- The table: a click on **Type**, **You play** or **Note type** opens its list; right-click selected chapters for the same choices, renaming their subdeck, opening them on Lichess or showing their notes in the Browser; Space checks or unchecks the selected chapters. A filter box (Ctrl+F) and a quick filter (new, changed, imported, by type), sorting by clicking a column title, statuses in colour, columns resized by dragging and shown or hidden by right-clicking the titles (Moves starts hidden), and a double-click opens a chapter on Lichess.
- The board preview shows where you start playing the selected chapter, with buttons to step through its main line (and the list of its variations when they become notes).
- Above the **Import** button (Ctrl+Enter), the plan: how many notes the checked chapters make, how many are new, updated, up to date or skipped, and which note types will be created. After importing, a link shows the new notes in the Browser (`Edit > Undo` takes the import back).
- Notes keep an `[AnkiChessId]` in their PGN, so importing again finds them: it skips them, or updates them with **Update notes already imported** (only the ones that changed; your own tags are kept). PGNs from other sources (ChessBase, pasted…) are identified by the game itself, so they aren't duplicated either. Chapters deleted on Lichess are listed, with a link to see their notes in the Browser.
- Chapters imported before keep their note type when imported again (changing it needs a full sync): the importer lists them and offers to open them in the Browser, for `Notes > Change Note Type`.
- **Update imported Lichess studies** downloads again every study already in the collection and updates the notes whose chapter changed (they keep their note type and deck). New chapters are only reported, with a button to open them in the import window. If Lichess still limits the downloads after the waits (or you stop with Esc), the studies left are listed by name with **Try again** (only those) and, without a token, **Add a token…**.
- The note's text field shows the chapter and study names, the opening (ECO and name), the players and event of games, the author and a link to the original Lichess game when the PGN has them.
- PGNs pasted in the editor with wrapped lines (Chess.com exports) are fixed without touching the note template: `{{text:PGN}}` drops `<br>` without a space, gluing moves and comments together (`Qg3<br>b5` → `Qg3b5`). The add-on shows those cards with their line breaks, and adds a space before each line break of the `PGN` field when the profile opens and before every sync, so AnkiDroid reads them too.

## Cards from your analysis

On the back of an AnkiChess card, the export button (next to **Copy FEN**) has:

- **Copy PGN**: the whole game with the moves and lines you added while analysing, by hand or from Stockfish, with the comments, arrows and evaluations kept.
- **Copy PGN from this position**: a new game that starts from the position on the board (as its `[FEN]`), with the moves that follow on that line and their variations.
- **New card with this PGN** (Anki desktop with this add-on): Anki's Add window opens with the PGN of **Copy PGN**, with the note type, deck and tags of the card being reviewed, and its text marked "With your analysis".

These PGNs get their own `[AnkiChessId "analysis/…"]` instead of the card's, so a card made from them is a card of its own: importing or updating the study never takes it for the chapter it comes from (nor updates both with the chapter).

## Deck layout and tags

All the importers file cards under one root deck, set in the add-on config (`deck_root`, default `Chess`, or `Xadrez` in pt-BR):

```
<root>::<study>::Opening lines       Lichess opening lines
<root>::<study>::Tactics             Lichess chapters set up from a position
<root>::<study>::Annotated games     Lichess full games (a result such as 1-0)
<root>::<study>::Key moves           "find the move" notes from the games' ! and !! moves
<root>::<study>::Structures          Lichess structures (a FEN with no moves), rebuilt on the board
<root>::Openings::<family>           opening, book moves and book lines of your games
<root>::My games::<error type>       blunders, mistakes, misses, inaccuracies, missed mates of your games
<root>::Lichess puzzles              Lichess puzzles
```

- Each Lichess study gets its own deck, named after the study (`StudyName`; the file name for PGNs without it). Once loaded, its deck can be typed (with suggestions from your decks) or picked with **Choose…** (Anki's deck list, as in the Add window) in the **Study deck** field; a list picks the study when several are loaded. The deck is linked to the study at once: the next import uses it while it exists, else the deck the study's notes are in now (decks renamed or moved in Anki are followed). Each chapter's subdeck can be renamed too (double-click a **Deck** cell or press F2; with several rows selected, F2 renames them all). `::` creates levels, e.g. `Chess::Courses::Sicilian`; spaces around each level are trimmed and empty levels dropped, as Anki would otherwise name them `blank`. An empty subdeck files the chapter in the study deck itself. Renamed decks are kept for the next import of the same study (`study_decks` / `chapter_decks` in the config).
- Lichess chapters are classified automatically: from a `[FEN]` → tactics, unless the position is in the opening catalog; a `[FEN]` and no moves → structure; no FEN and no result (`*`) → opening line; no FEN with a result → annotated game. The type can be changed per chapter, except for structures.
- Tags are hierarchical (`::` separates the levels, `_` replaces spaces): `<study>::<study name>::<chapter name>` (e.g. `estudo::#C105_-_Siciliana_O'Kelly:_Outras_opções::Capítulo_1`), `<opening>::<family>::<variation>` (e.g. `opening::Slav_Defense::Czech_Variation`, from the opening Lichess writes in the chapter or the catalog), `eco::<code>`, and the source (`lichess::study::<id>`, `lichess::puzzle::<theme>`…). When updating a note, the importer replaces the tags it wrote before and keeps yours.

## Games (Chess.com and Lichess)

The **Games** tab turns one of your games into cards:

| Card | When | Mode |
|---|---|---|
| Opening | The game's book moves (Lichess opening catalog, bundled offline) | Study |
| Book move | You left theory while the catalog had a continuation; any book move is accepted | Flipped |
| Book lines | Every named catalog line from where the game left theory (any move order), even lines not played; the line name is the prompt and you play your side. Keyed by the line, so other games in the same opening don't duplicate them | Flipped |
| Blunder / Mistake / Miss / Inaccuracy | Position before your error; the solution is the best move (from the analysis), close alternatives are also accepted | Flipped |
| Missed mate | You had a forced mate and did not play it; the whole mating line, any final mate accepted | Flipped |

- Sources: the PGN exported from the Chess.com analysis board (`Share > PGN`) keeps the **Game Review** labels, which decide which moves become cards; a Chess.com game link also works (public API), with errors classified by Stockfish (Lichess thresholds on the drop of the win chance).
- **My games…** lists your latest games on Chess.com and Lichess (only losses, or only the ones analysed on Lichess) to load one.
- A **Lichess game** brings the server analysis when it was requested on Lichess: its `?`/`??`/`?!` marks, "X was best" comments and best lines give the errors and their solutions, **without Stockfish** (its settings, under **Stockfish ▸**, are hidden then).
- The cards show their status in your collection and the plan above **Import**.
- Your game move stays in the card marked as bad (`$4`, `$2`...), so repeating it fails the puzzle and shows its evaluation.
- Stockfish is downloaded on first use into `user_files/stockfish` (official release, ~80 MB), or set `stockfish_path`.

## Lichess puzzles

The **Lichess puzzles** tab imports puzzles as cards: the opponent's last move is played first, then you play the solution (any mate is accepted on the last move). Filter by theme or id, sort by rating, a board preview, and the deck can be changed (`puzzle_deck`).

- **Load my puzzles**: your latest puzzles (by default only the ones you failed), with your [Lichess token](#lichess-token) (`puzzle:read` scope; without one, the button opens it).
- Or puzzle links (`lichess.org/training/…`) or ids.
- Tags: `lichess::puzzle`, one per theme (`lichess::puzzle::mateIn3`…) and `lichess::puzzle::failed`.

## Build

- Bundled: [python-chess](https://github.com/niklasf/python-chess) (GPL-3.0) in `vendor/`, and the [Lichess opening catalog](https://github.com/lichess-org/chess-openings) (CC0) in `data/openings/`.
- License: the add-on is GPL-3.0-or-later, as python-chess requires (`addon/lichess_study_importer/LICENSE.txt`).

```bash
npm run test:addon    # unit tests (pytest)
npm run build:addon   # dist-anki/lichess_study_importer.ankiaddon
```

Install the `.ankiaddon` with `Tools > Add-ons > Install from file...`, or for development link the folder into `addons21`:

```powershell
New-Item -ItemType Junction -Path "$env:APPDATA\Anki2\addons21\lichess_study_importer" -Target "$PWD\addon\lichess_study_importer"
```
