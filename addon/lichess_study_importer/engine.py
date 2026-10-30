"""
Locate, download and start Stockfish (UCI) for game analysis.

Pure Python (no aqt imports) so it can be used from background threads and tests.
"""

from __future__ import annotations

import os
import platform
import shutil
import stat
import subprocess
import sys
import tarfile
import tempfile
import urllib.request
import zipfile
from typing import Callable

from .chess_lib import chess

ADDON_DIR = os.path.dirname(__file__)
# Anki keeps user_files when the add-on is updated
ENGINE_DIR = os.path.join(ADDON_DIR, "user_files", "stockfish")
# Pinned native release, so analyses stay reproducible. Independent from the template's
# npm package: cards run the pure-JS (asm) build, as Anki's media CSP blocks WASM.
STOCKFISH_RELEASE = "sf_19"
RELEASE_URL = f"https://github.com/official-stockfish/Stockfish/releases/download/{STOCKFISH_RELEASE}/{{asset}}"
USER_AGENT = "AnkiChess-StudyImporter"


class EngineError(Exception):
    """Carries an i18n key (see i18n.py) and its parameters; the UI translates it."""

    def __init__(self, key: str, **params):
        super().__init__(key)
        self.key = key
        self.params = params


def release_asset() -> str | None:
    """Official Stockfish release asset for this platform."""
    machine = platform.machine().lower()
    arm = machine in ("arm64", "aarch64")
    if sys.platform.startswith("win"):
        return f"stockfish-windows-{'arm64' if arm else 'x86-64'}-universal.zip"
    if sys.platform == "darwin":
        return "stockfish-macos-universal.tar.gz"
    if sys.platform.startswith("linux"):
        return f"stockfish-linux-{'arm64' if arm else 'x86-64'}-universal.tar.gz"
    return None


def _is_executable(path: str) -> bool:
    return os.path.isfile(path) and (sys.platform.startswith("win") or os.access(path, os.X_OK))


def find_stockfish(configured: str = "") -> str | None:
    """Configured path first, then a previously downloaded engine, then PATH."""
    if configured and _is_executable(configured):
        return configured
    if os.path.isdir(ENGINE_DIR):
        for name in sorted(os.listdir(ENGINE_DIR)):
            path = os.path.join(ENGINE_DIR, name)
            if name.lower().startswith("stockfish") and _is_executable(path):
                return path
    return shutil.which("stockfish")


def download_stockfish(on_progress: Callable[[int, int], None] | None = None) -> str:
    """Download the latest official Stockfish into user_files and return the executable path."""
    asset = release_asset()
    if not asset:
        raise EngineError("engine.unsupported_platform", platform=sys.platform)

    os.makedirs(ENGINE_DIR, exist_ok=True)
    req = urllib.request.Request(RELEASE_URL.format(asset=asset), headers={"User-Agent": USER_AGENT})
    with tempfile.TemporaryDirectory() as tmp:
        archive = os.path.join(tmp, asset)
        try:
            with urllib.request.urlopen(req, timeout=60) as resp, open(archive, "wb") as out:
                total = int(resp.headers.get("Content-Length") or 0)
                done = 0
                while chunk := resp.read(1 << 20):
                    out.write(chunk)
                    done += len(chunk)
                    if on_progress:
                        on_progress(done, total)
        except OSError as e:
            raise EngineError("engine.download_failed", reason=e) from e
        return _extract_engine(archive)


def _extract_engine(archive: str) -> str:
    """Extract the largest stockfish binary from the release archive."""
    if archive.endswith(".zip"):
        with zipfile.ZipFile(archive) as z:
            members = [m for m in z.infolist() if _is_engine_member(m.filename)]
            if not members:
                raise EngineError("engine.not_in_archive")
            member = max(members, key=lambda m: m.file_size)
            target = os.path.join(ENGINE_DIR, os.path.basename(member.filename))
            with z.open(member) as src, open(target, "wb") as dst:
                shutil.copyfileobj(src, dst)
    else:
        with tarfile.open(archive) as t:
            members = [m for m in t.getmembers() if m.isfile() and _is_engine_member(m.name)]
            if not members:
                raise EngineError("engine.not_in_archive")
            member = max(members, key=lambda m: m.size)
            target = os.path.join(ENGINE_DIR, os.path.basename(member.name))
            with t.extractfile(member) as src, open(target, "wb") as dst:
                shutil.copyfileobj(src, dst)
    if not sys.platform.startswith("win"):
        os.chmod(target, os.stat(target).st_mode | stat.S_IXUSR | stat.S_IXGRP | stat.S_IXOTH)
    return target


def _is_engine_member(name: str) -> bool:
    base = os.path.basename(name).lower()
    return base.startswith("stockfish") and not base.endswith((".txt", ".md", ".nnue"))


def open_engine(path: str) -> chess.engine.SimpleEngine:
    kwargs = {}
    if sys.platform.startswith("win"):
        kwargs["creationflags"] = subprocess.CREATE_NO_WINDOW  # no console window
    try:
        return chess.engine.SimpleEngine.popen_uci(path, **kwargs)
    except (OSError, chess.engine.EngineError) as e:
        raise EngineError("engine.start_failed", reason=e) from e
