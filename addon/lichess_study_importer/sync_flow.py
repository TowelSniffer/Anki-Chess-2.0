"""
The steps of a puzzle sync, without Qt: puzzle_sync.py runs them with Anki's operations
and messages, the tests with plain calls (see SyncHost).

1. Read your activity since the last sync into the activity cache (puzzle_cache): the
   whole history the first time and when the deck and tag layout changed (PUZZLE_LAYOUT),
   then only the puzzles played since. A read that stops imports nothing; the cache
   keeps what it can and the next sync goes on from there.
2. Plan: the puzzles not in Anki yet (only the failed ones with failed_only), oldest
   first; and the imported puzzles read, which move to their result's deck with the
   current tags and text.
3. Fetch the planned puzzles with their game (or build them from the activity).
4. Import them and move the others in one undo step, then save where the next sync
   starts (at the first puzzle left when fetching stopped).

Pure Python (no aqt imports) so it can be unit tested outside Anki.
"""

from __future__ import annotations

import time
from dataclasses import dataclass
from typing import Callable, Protocol

from . import anki_ops, decks, puzzle_cache
from .i18n import error_text, tr
from .lichess_api import LichessError
from .puzzles import PuzzleCard, activity_card, load_puzzles, next_sync_point, puzzle_tags, sync_plan

# The deck and tag layout of synced puzzles; a newer one makes the next sync read the
# whole history once, so every imported puzzle gets it. 1: Failed / Solved subdecks and
# lichess::puzzle::theme:: tags. 2: theme names and your result in the text under the board.
PUZZLE_LAYOUT = 2


@dataclass
class SyncSettings:
    token: str
    user: str  # the Lichess account, whose activity cache is used
    since: int  # where the reading starts (ms); 0: the whole history
    failed_only: bool
    fetch_games: bool
    deck: str
    base: dict  # the note type the Flipped one is made from
    cache_folder: str = puzzle_cache.FOLDER


class Progress(Protocol):
    def set(self, label: str, value: int | None = None, maximum: int | None = None) -> None: ...
    def wait(self): ...
    def cancelled(self) -> bool: ...


class SyncHost(Protocol):
    """How a sync runs: in Anki (puzzle_sync) or in the tests."""

    progress: Progress

    def run_background(self, task: Callable, success: Callable, label: str) -> None: ...
    def run_collection(self, op: Callable, success: Callable) -> None: ...
    def collection(self): ...  # None once the profile is closed
    def save_state(self, since: int, at: int, layout: int) -> None: ...
    def finish(self, message: str = "", error: Exception | None = None, news: bool = False) -> None: ...


def stop_text(error: LichessError, done: int, total: int) -> str:
    """Why fetching the puzzles stopped early, and how far it got."""
    stopped = tr("puzzle.fetch_stopped", done=done, total=total)
    return stopped if error.key == "error.cancelled" else f"{error_text(error)} {stopped}"


def activity_cards(entries: list[dict]) -> list[PuzzleCard]:
    cards = []
    for entry in entries:
        try:
            cards.append(activity_card(entry))
        except (KeyError, TypeError, ValueError, AssertionError):  # a position python-chess can't read
            pass
    return cards


def organize_rows(entries: list[dict], imported: dict[str, list[int]], deck: str) -> list[tuple]:
    """
    For import_chapters(organize=...): the imported puzzles among these entries, with
    their result's deck, the current tags and the text under the board (it doesn't
    depend on the puzzle's game, so the activity gives it).
    """
    rows = []
    for entry in entries:
        nids = imported.get(entry["puzzle"]["id"])
        if not nids:
            continue
        win = entry.get("win")
        try:
            text = anki_ops.build_note_fields(activity_card(entry), True)[1]
        except (KeyError, TypeError, ValueError, AssertionError):
            text = None
        tags = puzzle_tags(entry["puzzle"].get("themes", []), win)
        rows.append((nids, decks.puzzle_placement(deck, win).deck, tags, text))
    return rows


class SyncFlow:
    def __init__(self, settings: SyncSettings, host: SyncHost):
        self.settings, self.host, self.progress = settings, host, host.progress

    def start(self):
        self.host.run_background(self.read, self.on_read, tr("puzzle.loading_activity", count=0))

    # 1. Read

    def read(self) -> tuple[str, list[dict]]:
        s = self.settings
        cache, stopped = puzzle_cache.refresh_cached(
            s.cache_folder,
            s.user,
            s.token,
            back_to=s.since,
            progress=lambda count: self.progress.set(tr("puzzle.loading_activity", count=count)),
            cancelled=self.progress.cancelled,
            wait=self.progress.wait(),
        )
        return stopped, cache.since(s.since)

    # 2. Plan

    def on_read(self, read: tuple[str, list[dict]]):
        stopped, entries = read
        if stopped:
            self.host.finish(tr(f"puzzle.sync_{stopped}"))
            return
        col = self.host.collection()
        if col is None:
            self.host.finish()
            return
        imported = anki_ops.imported_puzzles(col)
        existing = [e for e in entries if e["puzzle"]["id"] in imported]
        plan = sync_plan(entries, set(imported), self.settings.failed_only)
        if not plan:
            self.on_cards(entries, plan, existing, imported, ([], 0, None))
            return
        task = self.fetch if self.settings.fetch_games else self.build
        self.host.run_background(
            lambda: task(plan),
            lambda done: self.on_cards(entries, plan, existing, imported, done),
            tr("puzzle.loading", done=0, total=len(plan)),
        )

    # 3. Cards

    def fetch(self, plan: list[dict]) -> tuple[list[PuzzleCard], int, LichessError | None]:
        def fetching(count: int, total: int):
            self.progress.set(tr("puzzle.loading", done=count, total=total), count, total)

        items = [(e["puzzle"]["id"], e.get("win"), e) for e in plan]
        cards, error = load_puzzles(items, fetching, self.progress.wait(), self.progress.cancelled)
        return cards, len(cards) if error else len(plan), error

    def build(self, plan: list[dict]) -> tuple[list[PuzzleCard], int, None]:
        return activity_cards(plan), len(plan), None

    # 4. Import

    def on_cards(self, entries, plan, existing, imported, done):
        cards, handled, error = done
        if self.host.collection() is None:
            self.host.finish()
            return
        point = next_sync_point(entries, True, plan, handled, self.settings.since)
        rest = f" {stop_text(error, handled, len(plan))} {tr('puzzle.sync_rest')}" if error else ""

        def saved(created: int, organized: int) -> str:
            self.host.save_state(point, int(time.time() * 1000), PUZZLE_LAYOUT)
            if not plan and not organized:
                return tr("puzzle.sync_none")
            text = tr("puzzle.sync_done", count=created)
            if organized:
                text += " " + tr("puzzle.sync_organized", count=organized)
            return text + rest

        if not cards and not existing:
            self.host.finish(saved(0, 0))
            return
        base, deck = self.settings.base, self.settings.deck
        try:
            models = {mode: anki_ops.ensure_mode_note_type(base, mode) for mode in {c.mode for c in cards}}
        except anki_ops.ChessImportError as e:
            self.host.finish(error=e)
            return
        rows = [(card, models[card.mode], decks.puzzle_placement(deck, card.win)) for card in cards]
        stats: dict = {}

        def op(col):
            # New notes are added; the imported ones only change deck, tags and text
            organize = organize_rows(existing, imported, deck)
            return anki_ops.import_chapters(col, rows, False, True, stats, tr("puzzle.undo"), organize=organize)

        def imported_cards(_changes):
            created, organized = stats.get("created", 0), stats.get("organized", 0)
            self.host.finish(saved(created, organized), news=bool(created or organized))

        self.host.run_collection(op, imported_cards)
