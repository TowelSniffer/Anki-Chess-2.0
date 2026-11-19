"""
The names of Lichess puzzle themes (the keys of the lichess::puzzle::theme:: tags), in
English and Brazilian Portuguese, and the count of your puzzles by theme.

Pure Python (no aqt imports) so it can be unit tested outside Anki.
"""

from __future__ import annotations

import re
from typing import Iterable

from .i18n import get_language

THEME_TAG = "lichess::puzzle::theme::"
FAILED_TAG = "lichess::puzzle::failed"
PUZZLE_TAG = "lichess::puzzle"

# Lichess theme key: (English, Brazilian Portuguese)
THEMES: dict[str, tuple[str, str]] = {
    # Phases
    "opening": ("Opening", "Abertura"),
    "middlegame": ("Middlegame", "Meio-jogo"),
    "endgame": ("Endgame", "Final"),
    "rookEndgame": ("Rook endgame", "Final de torres"),
    "bishopEndgame": ("Bishop endgame", "Final de bispos"),
    "pawnEndgame": ("Pawn endgame", "Final de peões"),
    "knightEndgame": ("Knight endgame", "Final de cavalos"),
    "queenEndgame": ("Queen endgame", "Final de damas"),
    "queenRookEndgame": ("Queen and rook", "Final de dama e torre"),
    # Motifs
    "advancedPawn": ("Advanced pawn", "Peão avançado"),
    "attackingF2F7": ("Attacking f2 or f7", "Ataque em f2 ou f7"),
    "capturingDefender": ("Capture the defender", "Captura do defensor"),
    "discoveredAttack": ("Discovered attack", "Ataque descoberto"),
    "discoveredCheck": ("Discovered check", "Xeque descoberto"),
    "doubleCheck": ("Double check", "Xeque duplo"),
    "exposedKing": ("Exposed king", "Rei exposto"),
    "fork": ("Fork", "Garfo"),
    "hangingPiece": ("Hanging piece", "Peça pendurada"),
    "kingsideAttack": ("Kingside attack", "Ataque na ala do rei"),
    "pin": ("Pin", "Cravada"),
    "queensideAttack": ("Queenside attack", "Ataque na ala da dama"),
    "sacrifice": ("Sacrifice", "Sacrifício"),
    "skewer": ("Skewer", "Espeto"),
    "trappedPiece": ("Trapped piece", "Peça presa"),
    # Advanced
    "attraction": ("Attraction", "Atração"),
    "clearance": ("Clearance", "Desobstrução"),
    "defensiveMove": ("Defensive move", "Lance defensivo"),
    "deflection": ("Deflection", "Desvio"),
    "interference": ("Interference", "Interferência"),
    "intermezzo": ("Intermezzo", "Lance intermediário"),
    "quietMove": ("Quiet move", "Lance silencioso"),
    "xRayAttack": ("X-Ray attack", "Ataque raio-X"),
    "zugzwang": ("Zugzwang", "Zugzwang"),
    # Mates
    "mate": ("Checkmate", "Xeque-mate"),
    "mateIn1": ("Mate in 1", "Mate em 1"),
    "mateIn2": ("Mate in 2", "Mate em 2"),
    "mateIn3": ("Mate in 3", "Mate em 3"),
    "mateIn4": ("Mate in 4", "Mate em 4"),
    "mateIn5": ("Mate in 5 or more", "Mate em 5 ou mais"),
    "anastasiaMate": ("Anastasia's mate", "Mate de Anastasia"),
    "arabianMate": ("Arabian mate", "Mate árabe"),
    "backRankMate": ("Back rank mate", "Mate do corredor"),
    "balestraMate": ("Balestra mate", "Mate de Balestra"),
    "blindSwineMate": ("Blind swine mate", "Mate dos porcos cegos"),
    "bodenMate": ("Boden's mate", "Mate de Boden"),
    "cornerMate": ("Corner mate", "Mate no canto"),
    "doubleBishopMate": ("Double bishop mate", "Mate dos dois bispos"),
    "dovetailMate": ("Dovetail mate", "Mate de Cozio"),
    "epauletteMate": ("Epaulette mate", "Mate das dragonas"),
    "hookMate": ("Hook mate", "Mate do gancho"),
    "killBoxMate": ("Kill box mate", "Mate da caixa"),
    "morphysMate": ("Morphy's mate", "Mate de Morphy"),
    "operaMate": ("Opera mate", "Mate da ópera"),
    "pillsburysMate": ("Pillsbury's mate", "Mate de Pillsbury"),
    "smotheredMate": ("Smothered mate", "Mate sufocado"),
    "swallowstailMate": ("Swallow's tail mate", "Mate de Guéridon"),
    "triangleMate": ("Triangle mate", "Mate do triângulo"),
    "vukovicMate": ("Vukovic mate", "Mate de Vukovic"),
    # Special moves
    "castling": ("Castling", "Roque"),
    "enPassant": ("En passant", "En passant"),
    "promotion": ("Promotion", "Promoção"),
    "underPromotion": ("Underpromotion", "Subpromoção"),
    # Goals
    "equality": ("Equality", "Igualdade"),
    "advantage": ("Advantage", "Vantagem"),
    "crushing": ("Crushing", "Esmagador"),
    # Lengths
    "oneMove": ("One-move puzzle", "Puzzle de um lance"),
    "short": ("Short puzzle", "Puzzle curto"),
    "long": ("Long puzzle", "Puzzle longo"),
    "veryLong": ("Very long puzzle", "Puzzle muito longo"),
    # Origin
    "master": ("Master games", "Partidas de mestres"),
    "masterVsMaster": ("Master vs master games", "Mestre contra mestre"),
    "superGM": ("Super GM games", "Partidas de super GMs"),
    "playerGames": ("Player games", "Partidas de jogadores"),
}


def theme_name(key: str) -> str:
    """A theme's name in the add-on's language; a theme Lichess added later: its key in words."""
    names = THEMES.get(key)
    if names:
        return names[1] if get_language() == "pt-BR" else names[0]
    words = re.sub(r"(?<=[a-z])(?=[A-Z0-9])", " ", key).lower()
    return words[:1].upper() + words[1:]


def theme_names(keys: Iterable[str]) -> str:
    return ", ".join(theme_name(k) for k in keys)


def theme_search(key: str, failed_only: bool) -> str:
    """The Anki search of a theme's puzzles (failed_only: only those you failed)."""
    search = f"tag:{THEME_TAG}{key}"
    return f"{search} tag:{FAILED_TAG}" if failed_only else search


def puzzle_stats(tag_strings: Iterable[str]) -> tuple[int, int, dict[str, list[int]]]:
    """
    From the tags of notes (Anki's space-separated string): how many are Lichess puzzles,
    how many of them you failed, and by theme key [puzzles, failed].
    """
    total = failed = 0
    themes: dict[str, list[int]] = {}
    for tags in tag_strings:
        words = tags.split()
        lower = {w.lower() for w in words}
        if PUZZLE_TAG not in lower:
            continue
        is_failed = FAILED_TAG in lower
        total += 1
        failed += is_failed
        for word in words:
            if word.lower().startswith(THEME_TAG):
                counts = themes.setdefault(word[len(THEME_TAG) :], [0, 0])
                counts[0] += 1
                counts[1] += is_failed
    return total, failed, themes
