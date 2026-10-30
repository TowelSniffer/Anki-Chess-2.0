"""
The official AnkiChess template, for a collection without an AnkiChess note type: with it
the importer works on its own, without the AnkiChess Companion add-on.

It comes from the latest release of the AnkiChess project, as the Companion gets it: the
card's script, HTML and CSS from one zip, and the Stockfish the cards analyse with from
another. anki_ops.install_template then makes the note type as the Companion does, so the
Companion, if installed later, finds it and keeps it up to date.

Pure Python (no aqt imports) so it can run in the background and in tests.
"""

from __future__ import annotations

import io
import json
import os
import urllib.request
import zipfile
from dataclasses import dataclass, field
from typing import Callable

RELEASE_URL = "https://api.github.com/repos/TowelSniffer/Anki-Chess-2.0/releases/latest"
USER_AGENT = "AnkiChess-StudyImporter"
# Files of the template zip that make the card, by the part of the template they fill
CARD_FILES = {"front.html": "front", "back.html": "back", "style.css": "css", "styling.css": "css"}


class TemplateError(Exception):
    """Carries an i18n key (see i18n.py) and its parameters; the UI translates it."""

    def __init__(self, key: str, **params):
        super().__init__(key)
        self.key = key
        self.params = params


@dataclass
class Template:
    version: str
    front: str = ""
    back: str = ""
    css: str = ""
    media: dict[str, bytes] = field(default_factory=dict)  # for collection.media: script, Stockfish

    @property
    def script(self) -> str | None:
        """The card's script, loaded by its HTML: _ankiChess<version>.js."""
        return next((n for n in self.media if n.startswith("_ankiChess") and n.endswith(".js")), None)


def release_assets(release: dict) -> list[dict]:
    """The template zip of a release, then its Stockfish zip if any (picked as the Companion does)."""
    zips = [a for a in release.get("assets", []) if a.get("name", "").lower().endswith(".zip")]
    template = next((a for a in zips if "anki-chess" in a["name"].lower()), None)
    if template is None:
        raise TemplateError("template.bad_release")
    stockfish = next((a for a in zips if "stockfish" in a["name"].lower()), None)
    return [template] + ([stockfish] if stockfish else [])


def unpack(template: Template, data: bytes) -> None:
    """Add a release zip to the template. Files starting with "_" go to the media folder."""
    try:
        with zipfile.ZipFile(io.BytesIO(data)) as z:
            for info in z.infolist():
                # The media folder is flat: no folders from the zip
                name = os.path.basename(info.filename)
                if info.is_dir() or not name:
                    continue
                if name.startswith("_"):
                    template.media[name] = z.read(info)
                elif name.lower() in CARD_FILES:
                    setattr(template, CARD_FILES[name.lower()], z.read(info).decode("utf-8"))
    except (zipfile.BadZipFile, UnicodeDecodeError) as e:
        raise TemplateError("template.download_failed", reason=e) from e


def download(on_progress: Callable[[int, int], None] | None = None) -> Template:
    """The template of the latest release, ready for anki_ops.install_template."""
    try:
        with _open(RELEASE_URL) as resp:
            release = json.load(resp)
        assets = release_assets(release)
        template = Template(version=str(release.get("tag_name", "")).lstrip("v"))
        total = sum(a.get("size") or 0 for a in assets)
        done = 0
        for asset in assets:
            data = bytearray()
            with _open(asset["browser_download_url"]) as resp:
                while chunk := resp.read(1 << 20):
                    data += chunk
                    done += len(chunk)
                    if on_progress:
                        on_progress(done, total)
            unpack(template, bytes(data))
    except (OSError, ValueError) as e:
        raise TemplateError("template.download_failed", reason=e) from e
    if not template.front or not template.script:
        raise TemplateError("template.bad_release")
    return template


def _open(url: str):
    req = urllib.request.Request(url, headers={"User-Agent": USER_AGENT})
    return urllib.request.urlopen(req, timeout=60)
