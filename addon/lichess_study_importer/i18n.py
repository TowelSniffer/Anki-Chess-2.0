"""
UI strings in English (default) and Brazilian Portuguese.

Pure Python (no aqt imports) so it can be unit tested outside Anki.
"""

from __future__ import annotations

DEFAULT_LANGUAGE = "en"

STRINGS: dict[str, dict[str, str]] = {
    "en": {
        "menu.import": "Import into AnkiChess...",
        "dialog.title": "Import Lichess study",
        "source.url_placeholder": "https://lichess.org/study/XXXXXXXX  (or /chapter; several links separated by spaces)",
        "source.load_url": "Load URL",
        "source.open_file": "Open .pgn file…",
        "source.file_dialog_title": "Open Lichess study",
        "source.file_filter": "PGN (*.pgn);;All files (*)",
        "token.label": "Token:",
        "study.downloading": "Downloading study…",
        "study.download_failed": "Failed to download the study.",
        "study.summary": (
            "<b>{study}</b> — {total} chapters: {exercises} exercises, {lines} opening lines, "
            "{games} full games, {structures} structures, {empty} empty."
        ),
        "filter.include_games": "Include full games",
        "filter.check_exercises": "Select exercises and lines",
        "filter.uncheck_all": "Unselect all",
        "table.chapter": "Chapter",
        "table.kind": "Type",
        "table.side": "You play",
        "table.note_type": "Note type",
        "table.moves": "Moves",
        "kind.exercise": "Exercise",
        "kind.game": "Full game",
        "kind.line": "Opening line",
        "kind.empty": "Empty",
        "kind.structure": "Structure",
        "deck.structures": "Structures",
        "filter.structures": "Structures",
        "note_type.structure_tip": (
            "A structure is a card of the base AnkiChess note type: the board shows it as a "
            "structure to rebuild, whatever the note type's side settings."
        ),
        "side.structure_tip": (
            "Your side, shown at the bottom: the card shows the opponent's pieces and you place "
            "yours on the board."
        ),
        "structure.cards": (
            "1 card: the opponent's pieces are shown and you place yours, from a palette that "
            "counts them. The back shows the whole structure, your mistakes and the plans."
        ),
        "structure.needs_template": (
            "{count} structures are not imported: the AnkiChess template in this collection "
            "doesn't rebuild them on the board yet."
        ),
        "structure.needs_template_tip": (
            "The AnkiChess template in this collection doesn't rebuild structures on the board "
            "yet, so this chapter would open as a puzzle with no moves."
        ),
        "side.white": "White",
        "side.black": "Black",
        "side.both": "Both sides",
        "side.tooltip": "Your side in the chapter (its orientation on Lichess). First to move: {side}.",
        "side.to_move.w": "White",
        "side.to_move.b": "Black",
        "note_type.new": "(new)",
        "note_type.new_tip": "Created on import from the base note type.",
        "table.kind_tip": "Decides the subdeck: opening lines, tactics, annotated games or structures.",
        "table.side_tip": (
            "Your side in the chapter, from its orientation on Lichess (guessed for exported "
            "files). Changing it picks the note type."
        ),
        "table.note_type_tip": (
            "{base}: you make the first move.\n"
            "{base} Flipped: the first move is the opponent's, played automatically, with the "
            "board turned to your side.\n"
            "{base} Study: you play both sides.\n"
            "Missing ones are created from {base}."
        ),
        "table.deck_tip": (
            "Subdeck inside the study deck (field above). Double-click a cell or press F2 to "
            "rename it: \"::\" creates more levels (Games::Tal), and an empty name puts the "
            "chapter in the study deck itself. With several rows selected, F2 renames them all.\n"
            "Hover a cell for the full deck and tags."
        ),
        "table.open_tip": "Double-click to open it on Lichess.",
        "table.hint": (
            "<small>Hover the column titles for help. Select several chapters (Ctrl/Shift+click) "
            "and change one of their lists, or press F2 on a Deck cell, to change them all. "
            "Drag the column borders to resize them; right-click the titles to show or hide "
            "columns.</small>"
        ),
        "form.study_deck": "Study deck:",
        "form.study_deck_tip": (
            "Deck for this study's chapters, which go to its subdecks (Deck column). \"::\" "
            "separates the levels, e.g. Chess::Courses::Sicilian; spaces around each level are "
            "removed and empty levels dropped. Anki ignores upper/lower case in deck names, so a "
            "deck with the same name is reused. Type to see the decks of your collection, or "
            "choose one. The deck is kept for this study: the next import uses it, and when it "
            "no longer exists, the deck the study's notes are in."
        ),
        "form.study_deck_choose": "Choose…",
        "form.study_deck_choose_tip": "Pick one of your decks for this study (or add one), as in Anki's Add window.",
        "form.study_deck_choose_title": "Deck for {study}",
        "form.study_deck_choose_accept": "Choose",
        "form.study_deck_reset": "Default names",
        "form.study_deck_reset_tip": "Back to the study name from Lichess and the default subdecks.",
        "token.show": "Private study?",
        "button.import_count": "Import {count}",
        "table.deck": "Deck",
        "deck.root": "Chess",
        "deck.openings": "Openings",
        "deck.lines": "Opening lines",
        "deck.study_itself": "(study deck)",
        "deck.other_openings": "Other",
        "deck.tactics": "Tactics",
        "deck.games": "Annotated games",
        "deck.my_games": "My games",
        "deck.unnamed_study": "Study",
        "deck.kind.blunder": "Blunders",
        "deck.kind.mistake": "Mistakes",
        "deck.kind.miss": "Misses",
        "deck.kind.inaccuracy": "Inaccuracies",
        "deck.kind.missed_mate": "Missed mates",
        "tag.opening": "opening",
        "tag.study": "study",
        "info.opening": "Opening",
        "info.author": "Author",
        "info.game": "Original game",
        "deck.key_moves": "Key moves",
        "card.main_line": "main line",
        "kind.unsupported": "Unsupported variant",
        "kind.unsupported_tip": "{variant}: the board only plays standard chess.",
        "form.update_existing": "Update notes already imported (otherwise skip them)",
        "button.import": "Import",
        "button.cancel": "Cancel",
        "warn.no_note_types": (
            "<b>No AnkiChess note type found.</b> Install the AnkiChess template "
            "with the button at the top of this window before importing."
        ),
        "template.missing": (
            "<b>This collection has no AnkiChess note type yet.</b> Install the official "
            "AnkiChess template (a few MB from the AnkiChess project on GitHub, with the "
            "Stockfish the cards analyse with). The AnkiChess Companion add-on is optional: "
            "it keeps it up to date."
        ),
        "template.install": "Install the AnkiChess template",
        "template.downloading": "Downloading the AnkiChess template… {done} of {total} MB",
        "template.installed": "AnkiChess template {version} installed.",
        "template.download_failed": "Could not download the AnkiChess template: {reason}",
        "template.bad_release": "The AnkiChess release on GitHub has no template files.",
        "warn.read_file": "Could not read the file:\n{error}",
        "warn.invalid_url": "Enter a Lichess study link (lichess.org/study/…).",
        "warn.no_chapters": "No chapters found in the PGN.",
        "warn.no_selection": "No chapters selected.",
        "warn.base_missing": "Base note type not found.",
        "warn.no_user_config": "The template has no window.USER_CONFIG block to set the mode.",
        "result.summary": (
            "Lichess: {created} created, {updated} updated, {unchanged} up to date, "
            "{skipped} already imported (skipped)."
        ),
        "result.other_type": (
            "{count} chapters had been imported before in another note type than the one chosen "
            "now: {targets}. Importing again doesn't change the note type, so their board stays "
            "on the old side.\n\nTo change it, select them in the Browser and use Notes › Change "
            "Note Type. The review history is kept, but Anki will ask for a full sync (upload "
            "from this computer, then download on AnkiDroid).\n\nOpen these notes in the Browser now?"
        ),
        "undo.import": "Import Lichess study",
        "error.no_access": "Study not found or no access (HTTP {code}). {hint}",
        "error.no_access.token_hint": "Check that the token has the 'study:read' scope and access to the study.",
        "error.no_access.public_hint": (
            "If the study is private, add your Lichess token (Puzzles tab, 'study:read' scope) "
            "or export the PGN and use 'Open .pgn file'."
        ),
        "error.rate_limited": (
            "Lichess is still limiting the downloads, even after waiting about a minute. "
            "Try again in a few minutes."
        ),
        "error.cancelled": "Cancelled.",
        "error.http": "HTTP error {code} while downloading the study.",
        "error.connection": "Could not connect to Lichess: {reason}",
        "lichess.busy_wait": "Lichess is still sending the previous study. Trying again in {seconds} s…",
        "lichess.rate_wait": "Lichess asked for a pause. Trying again in {seconds} s…",
        "lichess.esc_cancels": "(Esc stops and keeps what was downloaded)",
        # --- Chess.com game import ---
        "menu.import_chesscom": "Import game (Chess.com / Lichess)...",
        "cc.title": "Import game (Chess.com / Lichess)",
        "cc.url_placeholder": "https://www.chess.com/game/live/…  or  https://lichess.org/…",
        "cc.load_link": "Load link",
        "cc.open_file": "Open exported .pgn…",
        "cc.paste": "Paste PGN…",
        "cc.paste_title": "Paste PGN",
        "cc.paste_label": "Paste the PGN exported from the Chess.com analysis board:",
        "cc.none": "No game loaded. For the Game Review labels, export the PGN from the analysis board (Share > PGN).",
        "cc.loading": "Downloading game…",
        "cc.summary": "<b>{white} vs {black}</b> — {date}, {result}. {labels}",
        "cc.labels_found": "Game Review labels found: {count} (blunders, mistakes, misses, inaccuracies).",
        "cc.labels_missing": "No Game Review labels in this PGN: errors are classified by Stockfish.",
        "cc.side": "Your side:",
        "cc.side_white": "White ({name})",
        "cc.side_black": "Black ({name})",
        "cc.cards": "Cards:",
        "cc.move_time": "Seconds per move:",
        "cc.analyze": "Analyze",
        "cc.analyzing": "Analyzing move {done} of {total}…",
        "cc.no_cards": "No cards for the selected types in this game.",
        "cc.undo": "Import Chess.com game",
        "cc.result": "{created} created, {updated} updated, {unchanged} up to date, {skipped} already imported (skipped).",
        "cc.table.move": "Game move",
        "cc.table.solution": "Solution",
        "cc.table.eval": "Eval",
        "cc.engine_found": "Stockfish: {path}",
        "cc.engine_missing": "Stockfish not found (needed for errors and missed mates).",
        "cc.engine_download": "Download Stockfish",
        "cc.engine_choose": "Choose…",
        "cc.engine_ask_download": "Stockfish is needed to find the best moves. Download it now (about 80 MB)?",
        "cc.engine_downloading": "Downloading Stockfish… {done} of {total} MB",
        "kind.opening": "Opening",
        "kind.book": "Book move",
        "kind.book_line": "Book lines",
        "kind.blunder": "Blunder",
        "kind.mistake": "Mistake",
        "kind.miss": "Miss",
        "kind.inaccuracy": "Inaccuracy",
        "kind.missed_mate": "Missed mate",
        "card.opening": "Opening: {opening}",
        "card.opening_moves": "{count} book moves",
        "card.book": "{number} Book move ({opening})",
        "card.book_comment": "Book: {opening}",
        "card.book_line": "Book line: {opening}",
        "card.book_line_until": "Book line: {opening} (until {move})",
        "card.played_comment": "Played in the game: {move}",
        "card.played_comment_eval": "Played in the game: {move} ({score})",
        "card.solution_comment": "Best: {move} ({score})",
        "card.error": "{number} Better than {move} ({label})",
        "card.missed_mate": "{number} Missed mate in {mate}",
        "chesscom.not_found": "Game not found on Chess.com (it must be finished and public).",
        "chesscom.rate_limited": "Too many requests to Chess.com. Wait a minute and try again.",
        "chesscom.http": "HTTP error {code} while downloading the game.",
        "chesscom.connection": "Could not connect to Chess.com: {reason}",
        "chesscom.invalid_pgn": "Could not read a game from this PGN.",
        "chesscom.invalid_url": "Enter a Chess.com game link (chess.com/game/live/… or the analysis link) or a Lichess game link (lichess.org/…).",
        "engine.unsupported_platform": "No Stockfish download for this system ({platform}). Choose an executable instead.",
        "engine.download_failed": "Could not download Stockfish: {reason}",
        "engine.not_in_archive": "The Stockfish download did not contain an executable.",
        "engine.start_failed": "Could not start Stockfish: {reason}",
        # --- More import features ---
        "button.close": "Close",
        "source.paste": "Paste PGN…",
        "source.pasted": "Pasted PGN",
        "source.user_studies": "User's studies…",
        "study.downloading_n": "Downloading study {done} of {total}…",
        "study.load_errors": "Some studies couldn't be loaded:\n{errors}",
        "study.summary_many": "<b>{count} studies</b> — {total} chapters: {exercises} exercises, {lines} opening lines, {games} full games, {structures} structures, {empty} empty or unsupported.",
        "study.status_counts": "In your collection: {new} new, {changed} changed, {same} imported.",
        "study.removed": "<a href=\"removed\">{count} imported chapters are no longer in the study</a>.",
        "table.status": "Status",
        "table.status_tip": "Whether the chapter is already in your collection, and up to date with Lichess.",
        "status.new": "New",
        "status.same": "Imported",
        "status.changed": "Changed",
        "status.new_tip": "Not in your collection yet.",
        "status.same_tip": "Already in your collection, up to date.",
        "status.changed_tip": "In your collection, but different from Lichess (or partly imported): check \"Update notes already imported\" to update it.",
        "status.cards": "{count} notes from this chapter",
        "filter.placeholder": "Filter chapters…",
        "filter.check_new": "Select new and changed",
        "option.split_lines": "One note per variation (opening lines)",
        "option.split_lines_tip": "Each branch of an opening line becomes its own note, from the start to the end of the branch, to drill every variation of a repertoire.",
        "option.key_moves": "Exercises from the ! and !! moves (games)",
        "option.key_moves_tip": "Besides the game, each move marked ! or !! becomes a \"find the move\" note, in the study's Key moves subdeck. The other tries the author analysed there are wrong answers that show their comment.",
        "preview.none": "Select a chapter to see where you start playing.",
        "puzzle.preview_none": "Select a puzzle to see where you start playing.",
        "user_studies.title": "Studies of a Lichess user",
        "user_studies.username": "Username:",
        "user_studies.list": "List",
        "user_studies.load": "Load the selected",
        "user_studies.loading": "Loading the studies…",
        "user_studies.found": "{count} studies. Check the ones to load.",
        "user_studies.none": "No studies found.",
        "user_studies.private_hint": "Private studies are listed with your token (study:read scope).",
        "menu.update_studies": "Update imported Lichess studies",
        "update.none": "No imported Lichess study in the collection.",
        "update.progress": "Downloading the imported studies… {done} of {total}",
        "update.summary": "{studies} of {total} studies checked: {updated} notes updated, {unchanged} already up to date.",
        "update.removed": "{count} notes come from chapters no longer in their study (see the tag lichess::study::<id>).",
        "update.new_chapters": "New chapters, not imported:\n{studies}",
        "update.pending": "Left for later (Lichess limited the downloads, or you stopped):\n{studies}",
        "update.retry": "Try again ({count})",
        "update.add_token": "Add a token…",
        "update.open_new_button": "Open the import window",
        "update.undo": "Update Lichess studies",
        "cc.server_analysis": "Lichess analysis found: {count} errors marked, no Stockfish needed.",
        "menu.import_puzzles": "Import Lichess puzzles...",
        "puzzle.title": "Import Lichess puzzles",
        "puzzle.token_tip": "Your puzzle activity needs your Lichess token (above) with the puzzle:read scope. Puzzle links don't need it.",
        "puzzle.token_needed": "Your puzzle activity needs your Lichess token, with the puzzle:read scope.",
        "puzzle.last": "Last",
        "puzzle.failed_only": "Only the failed ones",
        "puzzle.load_activity": "Load my puzzles",
        "puzzle.links_placeholder": "Puzzle links or ids: https://lichess.org/training/XXXXX …",
        "puzzle.invalid_links": "Enter puzzle links (lichess.org/training/…) or puzzle ids.",
        "puzzle.none": "No puzzles loaded.",
        "puzzle.loading": "Loading puzzle {done} of {total}…",
        "puzzle.summary": "{count} puzzles, {failed} failed.",
        "puzzle.no_cards": "No puzzles to import.",
        "puzzle.table.puzzle": "Puzzle",
        "puzzle.table.rating": "Rating",
        "puzzle.table.themes": "Themes",
        "puzzle.table.result": "You",
        "puzzle.solved": "Solved",
        "puzzle.failed": "Failed",
        "puzzle.deck": "Deck: <b>{deck}</b>",
        "puzzle.name": "Puzzle {id} ({rating})",
        "puzzle.themes": "Themes: {themes}",
        "puzzle.result": "Lichess puzzles: {created} created, {updated} updated, {unchanged} up to date, {skipped} skipped.",
        "puzzle.undo": "Import Lichess puzzles",
        "puzzle.all": "All",
        "puzzle.all_tip": (
            "Your whole puzzle history. The first time Lichess sends about 20 puzzles a second "
            "(10,000 in about 8 minutes); then it is kept in Anki and only the new puzzles are "
            "read. Esc stops and keeps what came: loading again goes on from there."
        ),
        "puzzle.loading_activity": "Loading your puzzle activity: {count} puzzles…",
        "puzzle.activity_cancelled": "Stopped with {count} puzzles loaded: loading again goes on from there.",
        "puzzle.activity_connection": (
            "The connection to Lichess dropped with {count} puzzles loaded: loading again goes on from there."
        ),
        "puzzle.unreadable": "{count} puzzles Lichess sent could not be read and were left out.",
        "puzzle.check": "Check:",
        "puzzle.check_all": "All",
        "puzzle.check_all_tip": (
            "Checks every puzzle shown (the filter applies) not imported yet, or all of them with "
            "\"Update notes already imported\", and unchecks the others."
        ),
        "puzzle.check_failed_tip": (
            "Checks the failed puzzles shown (the filter applies) not imported yet, or all of them "
            "with \"Update notes already imported\", and unchecks the others. Lichess gives your "
            "last result: a puzzle you failed and then solved again counts as solved."
        ),
        "puzzle.check_none": "None",
        "puzzle.table.date": "Date",
        "puzzle.fetch_games": "Start with the opponent's move (slower)",
        "puzzle.fetch_games_tip": (
            "Fetches each puzzle's game from Lichess (about 0.6 s each) so the card plays the "
            "opponent's last move first, as on Lichess. Unchecked, the puzzles of your activity "
            "are imported at once and start at the puzzle position. Updating an imported puzzle "
            "always fetches its game."
        ),
        "puzzle.fetch_estimate": "{count} to fetch from Lichess (~{minutes} min)",
        "puzzle.fetch_stopped": "Stopped after {done} of {total} puzzles.",
        "puzzle.rest_checked": "The others are still checked: import again to go on.",
        "puzzle.sync_import": "Import:",
        "puzzle.sync_hourly": "Every hour",
        "puzzle.sync_hourly_tip": (
            "While Anki is open, looks for new puzzles every hour, in the background (not while "
            "you review: once you leave the reviewer). Starts after the first sync."
        ),
        "puzzle.section_sync": "Sync with Lichess",
        "puzzle.section_cards": "Cards",
        "puzzle.section_history": "Pick from your history",
        "puzzle.in_anki": "In Anki: {count} puzzles, {failed} failed",
        "puzzle.reload_tip": "Read your whole history from Lichess again (results changed on Lichess come with it).",
        "puzzle.reload_ask": (
            "Forget the puzzle activity kept in Anki and read your whole history from Lichess again? "
            "It takes about a minute per 1,200 puzzles."
        ),
        "puzzle.themes_button": "Themes and training…",
        "puzzle.themes_button_tip": "Your puzzles in Anki by theme, and a filtered deck to train one.",
        "puzzle.themes_title": "Lichess puzzle themes",
        "puzzle.themes_intro": (
            "Your {count} Lichess puzzles in Anki ({failed} failed), by theme: a puzzle counts in "
            "each of its themes. Pick one and train it in a filtered deck."
        ),
        "puzzle.themes_none": "No Lichess puzzles in Anki yet: sync or import them first.",
        "puzzle.themes_col_theme": "Theme",
        "puzzle.themes_col_puzzles": "Puzzles",
        "puzzle.themes_col_failed": "Failed",
        "puzzle.themes_col_rate": "% failed",
        "puzzle.themes_failed_tip": "Train only the puzzles of the theme you failed on Lichess.",
        "puzzle.themes_train": "Train in a filtered deck",
        "puzzle.themes_train_tip": (
            "Closes the import window and opens Anki's filtered deck window with the theme's search: "
            "name it and click Build."
        ),
        "puzzle.played_failed": "You failed it on Lichess (played {date})",
        "puzzle.played_solved": "You solved it on Lichess (played {date})",
        "puzzle.sync_all": "All new puzzles",
        "puzzle.sync_mode_tip": "Which of the puzzles you played the sync imports: all of them, or only the ones you failed.",
        "puzzle.sync_on_open": "When Anki opens",
        "puzzle.sync_on_open_tip": (
            "When your profile opens, looks for the puzzles you played since the last sync and "
            "imports them, in the background. Starts after the first sync (Sync now), which "
            "goes through your whole history."
        ),
        "puzzle.sync_now": "Sync now",
        "puzzle.sync_now_tip": (
            "Imports the puzzles you played on Lichess that aren't in Anki yet: your whole history "
            "the first time (it can take a while: Esc stops, the rest is imported at the next "
            "sync), then only the new ones. Uses the deck and \"Start with the opponent's move\" "
            "below. The puzzles already imported that it reads move to Failed/Solved with the "
            "current tags; their content and reviews stay."
        ),
        "puzzle.sync_never": "Never synced: the first sync imports your whole history.",
        "puzzle.sync_last": "Last sync: {date}",
        "puzzle.sync_running": "The puzzle sync is already running.",
        "puzzle.sync_none": "Lichess puzzles: nothing new to import.",
        "puzzle.sync_done": "Lichess puzzles: {count} new imported.",
        "puzzle.sync_rest": "The rest will be imported at the next sync.",
        "puzzle.sync_cancelled": "Sync stopped: nothing was imported; the next sync goes on from where it stopped.",
        "puzzle.sync_connection": (
            "The connection to Lichess dropped: nothing was imported; the next sync goes on from "
            "where it stopped."
        ),
        "puzzle.sync_error": "Lichess puzzle sync: {error}",
        "puzzle.sync_button": "Sync Lichess puzzles",
        "puzzle.sync_button_check": "Button in Anki's menu bar",
        "puzzle.sync_button_tip": (
            "A button at the end of Anki's menu bar (after Help): one click syncs your Lichess puzzles."
        ),
        "deck.puzzles": "Lichess puzzles",
        "deck.puzzles_failed": "Failed",
        "deck.puzzles_solved": "Solved",
        "puzzle.deck_tip": (
            "The puzzles go into its Failed and Solved subdecks, by your result on Lichess (puzzle "
            "links: into this deck). Every theme is a tag (lichess::puzzle::theme::fork…): a "
            "filtered deck on one of them drills that theme."
        ),
        "puzzle.sync_organized": "{count} already imported were moved to Failed/Solved or retagged.",
        # --- Interface refinements ---
        "window.title": "AnkiChess: import",
        "window.tab_studies": "Studies",
        "window.tab_studies_tip": "Lichess studies (links, .pgn files, a user's studies): no token needed.",
        "window.tab_puzzles": "Puzzles",
        "window.tab_puzzles_tip": "The puzzles you played on Lichess (needs your Lichess token) and puzzle links.",
        "window.tab_games": "Games",
        "window.tab_games_tip": "Analysed Chess.com and Lichess games: cards for your mistakes and the opening line.",
        "token.section": "Lichess token (needed for your puzzles)",
        "token.change": "Change…",
        "token.reason_private": "Private studies and the download limit by account use your token. Once it's saved, the studies load again.",
        "window.update_tip": "Download again every Lichess study already in your collection and update the notes whose chapter changed.",
        "source.more": "More sources",
        "token.create": "Create a token on Lichess",
        "token.create_tip": "Opens Lichess' token page with the study:read and puzzle:read scopes checked.",
        "token.intro": (
            "Studies don't need it. Stored as plain text in the add-on config "
            "(<a href=\"https://lichess.org/account/oauth/token\">your tokens on Lichess</a>)."
        ),
        "token.intro_tip": (
            "A personal API access token of your Lichess account. Your puzzle activity (the sync "
            "and Load my puzzles) needs it, with the puzzle:read scope. Studies don't: with it, "
            "private studies open too (study:read) and Lichess counts the study downloads by "
            "account (3 at a time) instead of by IP (1). Create a token on Lichess opens Lichess "
            "with both scopes checked."
        ),
        "token.paste": "Paste the token (lip_…)",
        "token.show_text": "Show",
        "token.verify": "Check",
        "token.checking": "Checking with Lichess…",
        "token.valid": "✓ Account {user} · scopes: {scopes}",
        "token.invalid": "✗ Lichess doesn't know this token: mistyped, revoked or expired.",
        "token.missing_scope": "⚠ Missing the scope {scopes}: create a token with it checked.",
        "token.extra_scopes": (
            "⚠ It also allows {scopes}. The add-on only needs {needed}, and the token is "
            "stored as plain text: better a token with just those."
        ),
        "token.check_failed": "Couldn't check the token ({error}). You can save it anyway.",
        "token.saved_user": "Saved: account {user}.",
        "token.save": "Save",
        "token.save_anyway": "Save anyway",
        "token.remove": "Remove token",
        "token.status_user": "Lichess token: ✓ {user}",
        "token.status_saved": "Lichess token: ✓ saved",
        "token.rate_hint": (
            "Tip: with your Lichess token (Puzzles tab) the download limit is 3 at a "
            "time by account, instead of 1 at a time by IP."
        ),
        "token.offer": "Add your Lichess token? It opens private studies and raises the download limit (Puzzles tab).",
        "token.reason_rate": "Lichess limited the downloads by IP. With your token the limit is by account.",
        "start.imported": "Studies you already imported",
        "start.hint": "Paste Lichess study links above (several separated by spaces), open .pgn files from More sources, or drop files or links on this page.",
        "start.empty_title": "No Lichess study imported yet",
        "start.load_tip": "Load the checked studies again (or the one selected), to see what changed on Lichess and import it.",
        "start.study": "{name} ({count} notes)",
        "start.load": "Load the selected",
        "filter.all": "All",
        "filter.new": "New",
        "filter.changed": "Changed",
        "filter.same": "Imported",
        "filter.exercises": "Exercises",
        "filter.lines": "Opening lines",
        "filter.games": "Full games",
        "menu.check": "Select",
        "menu.uncheck": "Unselect",
        "menu.rename_subdeck": "Rename the subdeck…",
        "menu.rename_subdeck_label": "Subdeck inside the study deck (\"::\" creates levels; empty: the study deck itself):",
        "menu.default_subdeck": "Default subdeck",
        "menu.open_lichess": "Open on Lichess",
        "menu.browse_notes": "Show the notes in the Browser",
        "button.import_plan": "Import {chapters} chapters ({notes} notes)",
        "button.import_cards": "Import {count}",
        "plan.summary": "{notes} notes — new: {new} · to update: {update} · up to date: {same} · already imported (skipped): {skip}",
        "plan.summary_cards": "New: {new} · to update: {update} · up to date: {same} · already imported (skipped): {skip}",
        "plan.new_note_types": "Created from {base}: {names}.",
        "result.browse": "<a href=\"imported\">Show in the Browser</a> · Edit › Undo takes it back.",
        "analysis.caption": "With your analysis",
        "analysis.no_note_type": "No AnkiChess note type in this collection for the new card.",
        "preview.first": "Back to where you start playing",
        "preview.back": "Previous move",
        "preview.forward": "Next move",
        "preview.start": "Start ({total} moves)",
        "preview.move": "{move}  ({done}/{total})",
        "cc.advanced": "Stockfish ▸",
        "cc.advanced_open": "Stockfish ▾",
        "recent.button": "My games…",
        "recent.button_tip": "Your latest games on Chess.com and Lichess, to pick one.",
        "recent.title": "My recent games",
        "recent.chesscom_user": "Chess.com username",
        "recent.lichess_user": "Lichess username",
        "recent.search": "Search",
        "recent.losses_only": "Only losses",
        "recent.analysed_only": "Only with Lichess analysis",
        "recent.analysed_tip": "Games analysed on Lichess give the cards without Stockfish.",
        "recent.loading": "Loading your games…",
        "recent.found": "{count} games.",
        "recent.load": "Load the game",
        "recent.date": "Date",
        "recent.site": "Site",
        "recent.white": "White",
        "recent.black": "Black",
        "recent.you": "You",
        "recent.speed": "Speed",
        "recent.analysis": "Analysis",
        "recent.win": "Win",
        "recent.loss": "Loss",
        "recent.draw": "Draw",
        "puzzle.filter_placeholder": "Filter by theme or id…",
        "puzzle.deck_label": "Deck:",
    },
    "pt-BR": {
        "menu.import": "Importar para o AnkiChess...",
        "dialog.title": "Importar estudo do Lichess",
        "source.url_placeholder": "https://lichess.org/study/XXXXXXXX  (ou /capítulo; vários links separados por espaço)",
        "source.load_url": "Carregar URL",
        "source.open_file": "Abrir arquivo .pgn…",
        "source.file_dialog_title": "Abrir estudo do Lichess",
        "source.file_filter": "PGN (*.pgn);;Todos (*)",
        "token.label": "Token:",
        "study.downloading": "Baixando estudo…",
        "study.download_failed": "Falha ao baixar o estudo.",
        "study.summary": (
            "<b>{study}</b> — {total} capítulos: {exercises} exercícios, {lines} linhas de abertura, "
            "{games} partidas, {structures} estruturas, {empty} vazios."
        ),
        "filter.include_games": "Incluir partidas completas",
        "filter.check_exercises": "Marcar exercícios e linhas",
        "filter.uncheck_all": "Desmarcar tudo",
        "table.chapter": "Capítulo",
        "table.kind": "Tipo",
        "table.side": "Você joga",
        "table.note_type": "Tipo de nota",
        "table.moves": "Lances",
        "kind.exercise": "Exercício",
        "kind.game": "Partida",
        "kind.line": "Linha de abertura",
        "kind.empty": "Vazio",
        "kind.structure": "Estrutura",
        "deck.structures": "Estruturas",
        "filter.structures": "Estruturas",
        "note_type.structure_tip": (
            "Uma estrutura é um cartão do tipo de nota AnkiChess base: o tabuleiro mostra a "
            "estrutura para você montar, sejam quais forem as opções de lado do tipo de nota."
        ),
        "side.structure_tip": (
            "O seu lado, embaixo: o cartão mostra as peças do adversário e você coloca as suas "
            "no tabuleiro."
        ),
        "structure.cards": (
            "1 cartão: as peças do adversário aparecem e você coloca as suas, a partir de uma "
            "paleta que conta as peças. O verso mostra a estrutura inteira, os seus erros e os planos."
        ),
        "structure.needs_template": (
            "{count} estruturas não serão importadas: o template AnkiChess desta coleção ainda "
            "não monta estruturas no tabuleiro."
        ),
        "structure.needs_template_tip": (
            "O template AnkiChess desta coleção ainda não monta estruturas no tabuleiro: este "
            "capítulo abriria como um exercício sem lances."
        ),
        "side.white": "Brancas",
        "side.black": "Pretas",
        "side.both": "Os dois lados",
        "side.tooltip": "O seu lado no capítulo (a orientação do capítulo no Lichess). Primeiro a jogar: {side}.",
        "side.to_move.w": "brancas",
        "side.to_move.b": "pretas",
        "note_type.new": "(novo)",
        "note_type.new_tip": "Criado na importação a partir do tipo de nota base.",
        "table.kind_tip": "Decide o subdeck: linhas de abertura, táticas, partidas comentadas ou estruturas.",
        "table.side_tip": (
            "O seu lado no capítulo, pela orientação do capítulo no Lichess (estimado em "
            "arquivos exportados). Mudar o lado escolhe o tipo de nota."
        ),
        "table.note_type_tip": (
            "{base}: o 1º lance é seu.\n"
            "{base} Flipped: o 1º lance é do adversário, jogado sozinho, com o tabuleiro "
            "virado para o seu lado.\n"
            "{base} Study: você joga os dois lados.\n"
            "Os que não existem são criados a partir do {base}."
        ),
        "table.deck_tip": (
            "Subdeck dentro do deck do estudo (campo acima). Clique duas vezes na célula ou "
            "aperte F2 para renomear: \"::\" cria mais níveis (Partidas::Tal), e um nome vazio "
            "põe o capítulo no próprio deck do estudo. Com várias linhas selecionadas, o F2 "
            "renomeia todas.\nPasse o mouse na célula para ver o deck completo e as tags."
        ),
        "table.open_tip": "Clique duas vezes para abrir no Lichess.",
        "table.hint": (
            "<small>Passe o mouse nos títulos das colunas para ver a ajuda. Selecione vários "
            "capítulos (Ctrl/Shift+clique) e mude uma das listas, ou aperte F2 numa célula de "
            "Deck, para mudar todos. Arraste a borda das colunas para ajustar a largura; clique "
            "com o botão direito nos títulos para mostrar ou esconder colunas.</small>"
        ),
        "form.study_deck": "Deck do estudo:",
        "form.study_deck_tip": (
            "Deck dos capítulos deste estudo, que vão para os subdecks dele (coluna Deck). "
            "\"::\" separa os níveis, ex.: Xadrez::Cursos::Siciliana; os espaços em volta de cada "
            "nível são removidos e níveis vazios descartados. O Anki não diferencia maiúsculas "
            "de minúsculas nos nomes de deck, então um deck com o mesmo nome é reaproveitado. "
            "Digite para ver os decks da sua coleção, ou escolha um. O deck fica guardado para "
            "este estudo: a próxima importação usa ele e, quando ele não existir mais, o deck "
            "onde estão as notas do estudo."
        ),
        "form.study_deck_choose": "Escolher…",
        "form.study_deck_choose_tip": "Escolha um dos seus decks para este estudo (ou adicione um), como na janela Adicionar do Anki.",
        "form.study_deck_choose_title": "Deck de {study}",
        "form.study_deck_choose_accept": "Escolher",
        "form.study_deck_reset": "Nomes padrão",
        "form.study_deck_reset_tip": "Volta para o nome do estudo no Lichess e os subdecks padrão.",
        "token.show": "Estudo privado?",
        "button.import_count": "Importar {count}",
        "table.deck": "Deck",
        "deck.root": "Xadrez",
        "deck.openings": "Aberturas",
        "deck.lines": "Linhas de abertura",
        "deck.study_itself": "(deck do estudo)",
        "deck.other_openings": "Outras",
        "deck.tactics": "Táticas",
        "deck.games": "Partidas comentadas",
        "deck.my_games": "Minhas partidas",
        "deck.unnamed_study": "Estudo",
        "deck.kind.blunder": "Capivaradas",
        "deck.kind.mistake": "Erros",
        "deck.kind.miss": "Chances perdidas",
        "deck.kind.inaccuracy": "Imprecisões",
        "deck.kind.missed_mate": "Mates perdidos",
        "tag.opening": "abertura",
        "tag.study": "estudo",
        "info.opening": "Abertura",
        "info.author": "Autor",
        "info.game": "Partida original",
        "deck.key_moves": "Lances das partidas",
        "card.main_line": "linha principal",
        "kind.unsupported": "Variante não suportada",
        "kind.unsupported_tip": "{variant}: o tabuleiro só joga xadrez clássico.",
        "form.update_existing": "Atualizar notas já importadas (senão, pula)",
        "button.import": "Importar",
        "button.cancel": "Cancelar",
        "warn.no_note_types": (
            "<b>Nenhum note type AnkiChess encontrado.</b> Instale o template AnkiChess "
            "pelo botão no alto desta janela antes de importar."
        ),
        "template.missing": (
            "<b>Esta coleção ainda não tem um tipo de nota AnkiChess.</b> Instale o template "
            "oficial do AnkiChess (alguns MB do projeto AnkiChess no GitHub, com o Stockfish que "
            "analisa nos cartões). O add-on AnkiChess Companion é opcional: ele o mantém "
            "atualizado."
        ),
        "template.install": "Instalar o template AnkiChess",
        "template.downloading": "Baixando o template AnkiChess… {done} de {total} MB",
        "template.installed": "Template AnkiChess {version} instalado.",
        "template.download_failed": "Não foi possível baixar o template AnkiChess: {reason}",
        "template.bad_release": "O release do AnkiChess no GitHub não tem os arquivos do template.",
        "warn.read_file": "Não foi possível ler o arquivo:\n{error}",
        "warn.invalid_url": "Informe um link de estudo do Lichess (lichess.org/study/…).",
        "warn.no_chapters": "Nenhum capítulo encontrado no PGN.",
        "warn.no_selection": "Nenhum capítulo selecionado.",
        "warn.base_missing": "Note type base não encontrado.",
        "warn.no_user_config": "O template não tem bloco window.USER_CONFIG para configurar o modo.",
        "result.summary": (
            "Lichess: {created} criadas, {updated} atualizadas, {unchanged} já em dia, "
            "{skipped} já existentes puladas."
        ),
        "result.other_type": (
            "{count} capítulos já tinham sido importados num tipo de nota diferente do escolhido "
            "agora: {targets}. Importar de novo não troca o tipo de nota, então o tabuleiro deles "
            "continua do lado antigo.\n\nPara trocar, selecione-os no Navegador e use Notas › "
            "Mudar tipo de nota. O histórico de revisões é mantido, mas o Anki vai pedir uma "
            "sincronização completa (envie deste computador e depois baixe no AnkiDroid)."
            "\n\nAbrir essas notas no Navegador agora?"
        ),
        "undo.import": "Importar estudo do Lichess",
        "error.no_access": "Estudo não encontrado ou sem acesso (HTTP {code}). {hint}",
        "error.no_access.token_hint": "Confira se o token tem o escopo 'study:read' e acesso ao estudo.",
        "error.no_access.public_hint": (
            "Se o estudo é privado, adicione o seu token do Lichess (aba Puzzles, escopo "
            "'study:read') ou exporte o PGN e use 'Abrir arquivo .pgn'."
        ),
        "error.rate_limited": (
            "O Lichess continua limitando os downloads, mesmo depois de esperar cerca de um "
            "minuto. Tente de novo daqui a alguns minutos."
        ),
        "error.cancelled": "Cancelado.",
        "error.http": "Erro HTTP {code} ao baixar o estudo.",
        "error.connection": "Falha de conexão com o Lichess: {reason}",
        "lichess.busy_wait": "O Lichess ainda está enviando o estudo anterior. Nova tentativa em {seconds} s…",
        "lichess.rate_wait": "O Lichess pediu uma pausa. Nova tentativa em {seconds} s…",
        "lichess.esc_cancels": "(Esc para e mantém o que já foi baixado)",
        # --- Importação de partidas do Chess.com ---
        "menu.import_chesscom": "Importar partida (Chess.com / Lichess)...",
        "cc.title": "Importar partida (Chess.com / Lichess)",
        "cc.url_placeholder": "https://www.chess.com/game/live/…  ou  https://lichess.org/…",
        "cc.load_link": "Carregar link",
        "cc.open_file": "Abrir .pgn exportado…",
        "cc.paste": "Colar PGN…",
        "cc.paste_title": "Colar PGN",
        "cc.paste_label": "Cole o PGN exportado do tabuleiro de análise do Chess.com:",
        "cc.none": "Nenhuma partida carregada. Para usar as marcações da Game Review, exporte o PGN no tabuleiro de análise (Compartilhar > PGN).",
        "cc.loading": "Baixando partida…",
        "cc.summary": "<b>{white} vs {black}</b> — {date}, {result}. {labels}",
        "cc.labels_found": "Marcações da Game Review encontradas: {count} (capivaradas, erros, chances perdidas, imprecisões).",
        "cc.labels_missing": "Este PGN não tem marcações da Game Review: os erros serão classificados pelo Stockfish.",
        "cc.side": "Seu lado:",
        "cc.side_white": "Brancas ({name})",
        "cc.side_black": "Pretas ({name})",
        "cc.cards": "Cartões:",
        "cc.move_time": "Segundos por lance:",
        "cc.analyze": "Analisar",
        "cc.analyzing": "Analisando lance {done} de {total}…",
        "cc.no_cards": "Nenhum cartão dos tipos selecionados nesta partida.",
        "cc.undo": "Importar partida do Chess.com",
        "cc.result": "{created} criadas, {updated} atualizadas, {unchanged} já em dia, {skipped} já existentes puladas.",
        "cc.table.move": "Lance da partida",
        "cc.table.solution": "Solução",
        "cc.table.eval": "Avaliação",
        "cc.engine_found": "Stockfish: {path}",
        "cc.engine_missing": "Stockfish não encontrado (necessário para erros e mates perdidos).",
        "cc.engine_download": "Baixar Stockfish",
        "cc.engine_choose": "Escolher…",
        "cc.engine_ask_download": "O Stockfish é necessário para achar os melhores lances. Baixar agora (cerca de 80 MB)?",
        "cc.engine_downloading": "Baixando Stockfish… {done} de {total} MB",
        "kind.opening": "Abertura",
        "kind.book": "Lance de livro",
        "kind.book_line": "Linhas de livro",
        "kind.blunder": "Capivarada",
        "kind.mistake": "Erro",
        "kind.miss": "Chance perdida",
        "kind.inaccuracy": "Imprecisão",
        "kind.missed_mate": "Mate perdido",
        "card.opening": "Abertura: {opening}",
        "card.opening_moves": "{count} lances de livro",
        "card.book": "{number} Lance de livro ({opening})",
        "card.book_comment": "Livro: {opening}",
        "card.book_line": "Linha de livro: {opening}",
        "card.book_line_until": "Linha de livro: {opening} (até {move})",
        "card.played_comment": "Jogado na partida: {move}",
        "card.played_comment_eval": "Jogado na partida: {move} ({score})",
        "card.solution_comment": "Melhor: {move} ({score})",
        "card.error": "{number} Melhor que {move} ({label})",
        "card.missed_mate": "{number} Mate em {mate} perdido",
        "chesscom.not_found": "Partida não encontrada no Chess.com (precisa estar finalizada e ser pública).",
        "chesscom.rate_limited": "Muitas requisições ao Chess.com. Aguarde um minuto e tente novamente.",
        "chesscom.http": "Erro HTTP {code} ao baixar a partida.",
        "chesscom.connection": "Falha de conexão com o Chess.com: {reason}",
        "chesscom.invalid_pgn": "Não foi possível ler uma partida deste PGN.",
        "chesscom.invalid_url": "Informe um link de partida do Chess.com (chess.com/game/live/… ou o link da análise).",
        "engine.unsupported_platform": "Não há download do Stockfish para este sistema ({platform}). Escolha um executável.",
        "engine.download_failed": "Não foi possível baixar o Stockfish: {reason}",
        "engine.not_in_archive": "O download do Stockfish não continha um executável.",
        "engine.start_failed": "Não foi possível iniciar o Stockfish: {reason}",
        # --- More import features ---
        "button.close": "Fechar",
        "source.paste": "Colar PGN…",
        "source.pasted": "PGN colado",
        "source.user_studies": "Estudos de um usuário…",
        "study.downloading_n": "Baixando o estudo {done} de {total}…",
        "study.load_errors": "Alguns estudos não puderam ser carregados:\n{errors}",
        "study.summary_many": "<b>{count} estudos</b> — {total} capítulos: {exercises} exercícios, {lines} linhas de abertura, {games} partidas, {structures} estruturas, {empty} vazios ou não suportados.",
        "study.status_counts": "Na sua coleção: {new} novos, {changed} alterados, {same} importados.",
        "study.removed": "<a href=\"removed\">{count} capítulos importados não estão mais no estudo</a>.",
        "table.status": "Situação",
        "table.status_tip": "Se o capítulo já está na sua coleção, e em dia com o Lichess.",
        "status.new": "Novo",
        "status.same": "Importado",
        "status.changed": "Alterado",
        "status.new_tip": "Ainda não está na sua coleção.",
        "status.same_tip": "Já está na sua coleção, em dia.",
        "status.changed_tip": "Está na sua coleção, mas diferente do Lichess (ou importado em parte): marque \"Atualizar notas já importadas\" para atualizar.",
        "status.cards": "{count} notas deste capítulo",
        "filter.placeholder": "Filtrar capítulos…",
        "filter.check_new": "Marcar novos e alterados",
        "option.split_lines": "Uma nota por variante (linhas de abertura)",
        "option.split_lines_tip": "Cada ramo de uma linha de abertura vira uma nota, do início ao fim do ramo, para treinar cada variante do repertório.",
        "option.key_moves": "Exercícios dos lances ! e !! (partidas)",
        "option.key_moves_tip": "Além da partida, cada lance marcado com ! ou !! vira uma nota \"encontre o lance\", no subdeck Lances das partidas do estudo. As outras tentativas que o autor analisou ali são respostas erradas que mostram o comentário dele.",
        "preview.none": "Selecione um capítulo para ver onde você começa a jogar.",
        "puzzle.preview_none": "Selecione um puzzle para ver onde você começa a jogar.",
        "user_studies.title": "Estudos de um usuário do Lichess",
        "user_studies.username": "Usuário:",
        "user_studies.list": "Listar",
        "user_studies.load": "Carregar os marcados",
        "user_studies.loading": "Carregando os estudos…",
        "user_studies.found": "{count} estudos. Marque os que quer carregar.",
        "user_studies.none": "Nenhum estudo encontrado.",
        "user_studies.private_hint": "Estudos privados aparecem com o seu token (escopo study:read).",
        "menu.update_studies": "Atualizar estudos importados do Lichess",
        "update.none": "Nenhum estudo do Lichess importado na coleção.",
        "update.progress": "Baixando os estudos importados… {done} de {total}",
        "update.summary": "{studies} de {total} estudos verificados: {updated} notas atualizadas, {unchanged} já em dia.",
        "update.removed": "{count} notas são de capítulos que não estão mais no estudo (veja a tag lichess::study::<id>).",
        "update.new_chapters": "Capítulos novos, não importados:\n{studies}",
        "update.pending": "Ficaram para depois (o Lichess limitou os downloads, ou você parou):\n{studies}",
        "update.retry": "Tentar de novo ({count})",
        "update.add_token": "Adicionar token…",
        "update.open_new_button": "Abrir a janela de importação",
        "update.undo": "Atualizar estudos do Lichess",
        "cc.server_analysis": "Análise do Lichess encontrada: {count} erros marcados, sem precisar do Stockfish.",
        "menu.import_puzzles": "Importar puzzles do Lichess...",
        "puzzle.title": "Importar puzzles do Lichess",
        "puzzle.token_tip": "A sua atividade de puzzles precisa do seu token do Lichess (acima) com o escopo puzzle:read. Links de puzzles não precisam.",
        "puzzle.token_needed": "A sua atividade de puzzles precisa do seu token do Lichess, com o escopo puzzle:read.",
        "puzzle.last": "Últimos",
        "puzzle.failed_only": "Só os que errei",
        "puzzle.load_activity": "Carregar meus puzzles",
        "puzzle.links_placeholder": "Links ou ids de puzzles: https://lichess.org/training/XXXXX …",
        "puzzle.invalid_links": "Informe links de puzzles (lichess.org/training/…) ou ids de puzzles.",
        "puzzle.none": "Nenhum puzzle carregado.",
        "puzzle.loading": "Carregando o puzzle {done} de {total}…",
        "puzzle.summary": "{count} puzzles, {failed} errados.",
        "puzzle.no_cards": "Nenhum puzzle para importar.",
        "puzzle.table.puzzle": "Puzzle",
        "puzzle.table.rating": "Rating",
        "puzzle.table.themes": "Temas",
        "puzzle.table.result": "Você",
        "puzzle.solved": "Acertou",
        "puzzle.failed": "Errou",
        "puzzle.deck": "Deck: <b>{deck}</b>",
        "puzzle.name": "Puzzle {id} ({rating})",
        "puzzle.themes": "Temas: {themes}",
        "puzzle.result": "Puzzles do Lichess: {created} criados, {updated} atualizados, {unchanged} já em dia, {skipped} pulados.",
        "puzzle.undo": "Importar puzzles do Lichess",
        "puzzle.all": "Todos",
        "puzzle.all_tip": (
            "Todo o seu histórico de puzzles. Na primeira vez o Lichess envia uns 20 puzzles por "
            "segundo (10.000 em uns 8 minutos); depois ele fica guardado no Anki e só os puzzles "
            "novos são lidos. Esc para e fica com o que veio: carregar de novo continua dali."
        ),
        "puzzle.loading_activity": "Carregando a sua atividade de puzzles: {count} puzzles…",
        "puzzle.activity_cancelled": "Interrompido com {count} puzzles carregados: carregar de novo continua dali.",
        "puzzle.activity_connection": (
            "A conexão com o Lichess caiu com {count} puzzles carregados: carregar de novo continua dali."
        ),
        "puzzle.unreadable": "{count} puzzles enviados pelo Lichess não puderam ser lidos e ficaram de fora.",
        "puzzle.check": "Marcar:",
        "puzzle.check_all": "Todos",
        "puzzle.check_all_tip": (
            "Marca todos os puzzles mostrados (o filtro vale) que ainda não foram importados, ou "
            "todos com \"Atualizar notas já importadas\", e desmarca os outros."
        ),
        "puzzle.check_failed_tip": (
            "Marca os puzzles errados mostrados (o filtro vale) que ainda não foram importados, ou "
            "todos com \"Atualizar notas já importadas\", e desmarca os outros. O Lichess informa "
            "o seu último resultado: um puzzle que você errou e depois acertou conta como acertado."
        ),
        "puzzle.check_none": "Nenhum",
        "puzzle.table.date": "Data",
        "puzzle.fetch_games": "Começar pelo lance do adversário (mais lento)",
        "puzzle.fetch_games_tip": (
            "Busca o jogo de cada puzzle no Lichess (uns 0,6 s cada) para o cartão jogar primeiro o "
            "último lance do adversário, como no Lichess. Desmarcado, os puzzles da sua atividade "
            "são importados na hora e começam na posição do puzzle. Atualizar um puzzle já "
            "importado sempre busca o jogo."
        ),
        "puzzle.fetch_estimate": "{count} a buscar no Lichess (~{minutes} min)",
        "puzzle.fetch_stopped": "Parou em {done} de {total} puzzles.",
        "puzzle.rest_checked": "Os outros continuam marcados: importe de novo para continuar.",
        "puzzle.sync_import": "Importar:",
        "puzzle.sync_hourly": "A cada hora",
        "puzzle.sync_hourly_tip": (
            "Com o Anki aberto, procura puzzles novos a cada hora, em segundo plano (não durante a "
            "revisão: quando você sair dela). Começa depois da primeira sincronização."
        ),
        "puzzle.section_sync": "Sincronização com o Lichess",
        "puzzle.section_cards": "Cartões",
        "puzzle.section_history": "Escolher no seu histórico",
        "puzzle.in_anki": "No Anki: {count} puzzles, {failed} errados",
        "puzzle.reload_tip": "Ler todo o seu histórico do Lichess de novo (traz os resultados que mudaram no Lichess).",
        "puzzle.reload_ask": (
            "Esquecer a atividade de puzzles guardada no Anki e ler todo o seu histórico do Lichess "
            "de novo? Leva cerca de um minuto a cada 1.200 puzzles."
        ),
        "puzzle.themes_button": "Temas e treino…",
        "puzzle.themes_button_tip": "Os seus puzzles no Anki por tema, e um deck filtrado para treinar um deles.",
        "puzzle.themes_title": "Temas dos puzzles do Lichess",
        "puzzle.themes_intro": (
            "Os seus {count} puzzles do Lichess no Anki ({failed} errados), por tema: um puzzle conta "
            "em cada um dos seus temas. Escolha um e treine num deck filtrado."
        ),
        "puzzle.themes_none": "Ainda não há puzzles do Lichess no Anki: sincronize ou importe antes.",
        "puzzle.themes_col_theme": "Tema",
        "puzzle.themes_col_puzzles": "Puzzles",
        "puzzle.themes_col_failed": "Errados",
        "puzzle.themes_col_rate": "% de erro",
        "puzzle.themes_failed_tip": "Treinar só os puzzles do tema que você errou no Lichess.",
        "puzzle.themes_train": "Treinar num deck filtrado",
        "puzzle.themes_train_tip": (
            "Fecha a janela de importação e abre a janela de deck filtrado do Anki com a busca do "
            "tema: dê um nome e clique em Construir."
        ),
        "puzzle.played_failed": "Você errou no Lichess (jogado em {date})",
        "puzzle.played_solved": "Você acertou no Lichess (jogado em {date})",
        "puzzle.sync_all": "Todos os puzzles novos",
        "puzzle.sync_mode_tip": "Quais dos puzzles que você fez a sincronização importa: todos, ou só os que você errou.",
        "puzzle.sync_on_open": "Ao abrir o Anki",
        "puzzle.sync_on_open_tip": (
            "Ao abrir o seu perfil, procura os puzzles que você fez desde a última sincronização e "
            "os importa, em segundo plano. Começa depois da primeira sincronização (Sincronizar "
            "agora), que percorre todo o seu histórico."
        ),
        "puzzle.sync_now": "Sincronizar agora",
        "puzzle.sync_now_tip": (
            "Importa os puzzles que você fez no Lichess e que ainda não estão no Anki: todo o seu "
            "histórico na primeira vez (pode demorar: Esc para, e o resto entra na próxima "
            "sincronização), depois só os novos. Usa o deck e \"Começar pelo lance do adversário\" "
            "abaixo. Os puzzles já importados que ela lê vão para Errados/Acertados com as tags "
            "atuais; o conteúdo e as revisões continuam."
        ),
        "puzzle.sync_never": "Nunca sincronizado: a primeira sincronização importa todo o seu histórico.",
        "puzzle.sync_last": "Última sincronização: {date}",
        "puzzle.sync_running": "A sincronização de puzzles já está em andamento.",
        "puzzle.sync_none": "Puzzles do Lichess: nada novo para importar.",
        "puzzle.sync_done": "Puzzles do Lichess: {count} novos importados.",
        "puzzle.sync_rest": "O resto entra na próxima sincronização.",
        "puzzle.sync_cancelled": "Sincronização interrompida: nada foi importado; a próxima continua de onde parou.",
        "puzzle.sync_connection": (
            "A conexão com o Lichess caiu: nada foi importado; a próxima sincronização continua de "
            "onde parou."
        ),
        "puzzle.sync_error": "Sincronização de puzzles do Lichess: {error}",
        "puzzle.sync_button": "Sincronizar puzzles do Lichess",
        "puzzle.sync_button_check": "Botão na barra do Anki",
        "puzzle.sync_button_tip": (
            "Um botão no fim da barra de menus do Anki (depois de Ajuda): um clique sincroniza os "
            "seus puzzles do Lichess."
        ),
        "deck.puzzles": "Puzzles do Lichess",
        "deck.puzzles_failed": "Errados",
        "deck.puzzles_solved": "Acertados",
        "puzzle.deck_tip": (
            "Os puzzles vão para os subdecks Errados e Acertados deste deck, pelo seu resultado no "
            "Lichess (links de puzzles: para este deck). Cada tema é uma tag "
            "(lichess::puzzle::theme::fork…): um deck filtrado por uma delas treina aquele tema."
        ),
        "puzzle.sync_organized": "{count} já importados foram movidos para Errados/Acertados ou receberam as tags novas.",
        # --- Interface refinements ---
        "window.title": "AnkiChess: importar",
        "window.tab_studies": "Estudos",
        "window.tab_studies_tip": "Estudos do Lichess (links, arquivos .pgn, os estudos de um usuário): sem token.",
        "window.tab_puzzles": "Puzzles",
        "window.tab_puzzles_tip": "Os puzzles que você fez no Lichess (precisa do seu token do Lichess) e links de puzzles.",
        "window.tab_games": "Partidas",
        "window.tab_games_tip": "Partidas analisadas do Chess.com e do Lichess: cartões dos seus erros e da linha de abertura.",
        "token.section": "Token do Lichess (necessário para os seus puzzles)",
        "token.change": "Trocar…",
        "token.reason_private": "Estudos privados e o limite de downloads por conta usam o seu token. Depois de salvo, os estudos são carregados de novo.",
        "window.update_tip": "Baixa de novo todos os estudos do Lichess que já estão na sua coleção e atualiza as notas cujo capítulo mudou.",
        "source.more": "Mais fontes",
        "token.create": "Criar um token no Lichess",
        "token.create_tip": "Abre a página de tokens do Lichess com os escopos study:read e puzzle:read marcados.",
        "token.intro": (
            "Os estudos não precisam dele. Fica salvo em texto puro na configuração do add-on "
            "(<a href=\"https://lichess.org/account/oauth/token\">os seus tokens no Lichess</a>)."
        ),
        "token.intro_tip": (
            "Uma chave de acesso pessoal à API da sua conta do Lichess. A sua atividade de "
            "puzzles (a sincronização e Carregar meus puzzles) precisa dela, com o escopo "
            "puzzle:read. Os estudos não: com ela, estudos privados também abrem (study:read) e "
            "o Lichess conta os downloads de estudos por conta (3 de cada vez) em vez de por IP "
            "(1). Criar um token no Lichess abre o Lichess com os dois escopos marcados."
        ),
        "token.paste": "Cole o token (lip_…)",
        "token.show_text": "Mostrar",
        "token.verify": "Verificar",
        "token.checking": "Verificando com o Lichess…",
        "token.valid": "✓ Conta {user} · escopos: {scopes}",
        "token.invalid": "✗ O Lichess não conhece este token: digitado errado, revogado ou expirado.",
        "token.missing_scope": "⚠ Falta o escopo {scopes}: crie um token com ele marcado.",
        "token.extra_scopes": (
            "⚠ Ele também permite {scopes}. O add-on só precisa de {needed}, e o token fica "
            "salvo em texto puro: melhor um token só com esses."
        ),
        "token.check_failed": "Não deu para verificar o token ({error}). Você pode salvar assim mesmo.",
        "token.saved_user": "Salvo: conta {user}.",
        "token.save": "Salvar",
        "token.save_anyway": "Salvar assim mesmo",
        "token.remove": "Remover token",
        "token.status_user": "Token do Lichess: ✓ {user}",
        "token.status_saved": "Token do Lichess: ✓ salvo",
        "token.rate_hint": (
            "Dica: com o seu token do Lichess (aba Puzzles) o limite de downloads é de "
            "3 de cada vez por conta, em vez de 1 de cada vez por IP."
        ),
        "token.offer": "Adicionar o seu token do Lichess? Ele abre estudos privados e aumenta o limite de downloads (aba Puzzles).",
        "token.reason_rate": "O Lichess limitou os downloads por IP. Com o seu token o limite é por conta.",
        "start.imported": "Estudos que você já importou",
        "start.hint": "Cole links de estudos do Lichess acima (vários separados por espaço), abra arquivos .pgn em Mais fontes, ou arraste arquivos ou links para esta página.",
        "start.empty_title": "Nenhum estudo do Lichess importado ainda",
        "start.load_tip": "Carrega de novo os estudos marcados (ou o selecionado), para ver o que mudou no Lichess e importar.",
        "start.study": "{name} ({count} notas)",
        "start.load": "Carregar os marcados",
        "filter.all": "Todos",
        "filter.new": "Novos",
        "filter.changed": "Alterados",
        "filter.same": "Importados",
        "filter.exercises": "Exercícios",
        "filter.lines": "Linhas de abertura",
        "filter.games": "Partidas",
        "menu.check": "Marcar",
        "menu.uncheck": "Desmarcar",
        "menu.rename_subdeck": "Renomear o subdeck…",
        "menu.rename_subdeck_label": "Subdeck dentro do deck do estudo (\"::\" cria níveis; vazio: o próprio deck do estudo):",
        "menu.default_subdeck": "Subdeck padrão",
        "menu.open_lichess": "Abrir no Lichess",
        "menu.browse_notes": "Ver as notas no Navegador",
        "button.import_plan": "Importar {chapters} capítulos ({notes} notas)",
        "button.import_cards": "Importar {count}",
        "plan.summary": "{notes} notas — novas: {new} · a atualizar: {update} · em dia: {same} · já importadas (puladas): {skip}",
        "plan.summary_cards": "Novas: {new} · a atualizar: {update} · em dia: {same} · já importadas (puladas): {skip}",
        "plan.new_note_types": "Criados a partir do {base}: {names}.",
        "result.browse": "<a href=\"imported\">Ver no Navegador</a> · Editar › Desfazer volta atrás.",
        "analysis.caption": "Com a sua análise",
        "analysis.no_note_type": "Não há tipo de nota do AnkiChess nesta coleção para o novo cartão.",
        "preview.first": "Voltar para onde você começa a jogar",
        "preview.back": "Lance anterior",
        "preview.forward": "Próximo lance",
        "preview.start": "Início ({total} lances)",
        "preview.move": "{move}  ({done}/{total})",
        "cc.advanced": "Stockfish ▸",
        "cc.advanced_open": "Stockfish ▾",
        "recent.button": "Minhas partidas…",
        "recent.button_tip": "As suas últimas partidas do Chess.com e do Lichess, para escolher uma.",
        "recent.title": "Minhas partidas recentes",
        "recent.chesscom_user": "Usuário do Chess.com",
        "recent.lichess_user": "Usuário do Lichess",
        "recent.search": "Buscar",
        "recent.losses_only": "Só derrotas",
        "recent.analysed_only": "Só com análise do Lichess",
        "recent.analysed_tip": "Partidas analisadas no Lichess geram os cartões sem o Stockfish.",
        "recent.loading": "Carregando as suas partidas…",
        "recent.found": "{count} partidas.",
        "recent.load": "Carregar a partida",
        "recent.date": "Data",
        "recent.site": "Site",
        "recent.white": "Brancas",
        "recent.black": "Pretas",
        "recent.you": "Você",
        "recent.speed": "Ritmo",
        "recent.analysis": "Análise",
        "recent.win": "Vitória",
        "recent.loss": "Derrota",
        "recent.draw": "Empate",
        "puzzle.filter_placeholder": "Filtrar por tema ou id…",
        "puzzle.deck_label": "Deck:",
    },
}

_language = DEFAULT_LANGUAGE


def resolve_language(setting: str | None, anki_lang: str | None = None) -> str:
    """
    Map the config value to a supported language: "en", "pt-BR", or "auto"
    (follow Anki's UI language). Anything unknown falls back to English.
    """
    value = (setting or DEFAULT_LANGUAGE).strip()
    if value.lower() == "auto":
        value = anki_lang or DEFAULT_LANGUAGE
    lowered = value.replace("_", "-").lower()
    if lowered.startswith("pt"):
        return "pt-BR"
    return next((lang for lang in STRINGS if lang.lower() == lowered), DEFAULT_LANGUAGE)


def set_language(language: str) -> None:
    global _language
    _language = language if language in STRINGS else DEFAULT_LANGUAGE


def get_language() -> str:
    return _language


def tr(key: str, **params) -> str:
    text = STRINGS[_language].get(key) or STRINGS[DEFAULT_LANGUAGE][key]
    return text.format(**params) if params else text


def error_text(e: Exception) -> str:
    """Errors raised with an i18n key (Lichess, Chess.com, Stockfish), translated."""
    key = getattr(e, "key", None)
    if not key:
        return str(e)
    params = dict(getattr(e, "params", {}))
    if "hint" in params:
        params["hint"] = tr(params["hint"])
    return tr(key, **params)
