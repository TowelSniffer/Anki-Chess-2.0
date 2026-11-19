import io
import json
import os
import sys
import types
import zipfile

import pytest

HERE = os.path.dirname(__file__)
ADDON_DIR = os.path.join(HERE, "..", "lichess_study_importer")

# Load the add-on modules as a package without running __init__ (it needs aqt)
if "lsi" not in sys.modules:
    pkg = types.ModuleType("lsi")
    pkg.__path__ = [ADDON_DIR]
    sys.modules["lsi"] = pkg

from lsi import template_install as ti  # noqa: E402


def make_zip(files: dict) -> bytes:
    out = io.BytesIO()
    with zipfile.ZipFile(out, "w") as z:
        for name, data in files.items():
            z.writestr(name, data)
    return out.getvalue()


TEMPLATE_ZIP = make_zip(
    {
        "_ankiChess1.3.00.js": b"mountChess();",
        "Front.html": '<script src="./_ankiChess1.3.00.js"></script>',
        "Back.html": "{{FrontSide}}",
        "style.css": ".card {}",
    }
)
STOCKFISH_ZIP = make_zip({"_stockfish-18.0.5-asm.js": b"stockfish"})
FILES = {"https://x/anki-chess-release.zip": TEMPLATE_ZIP, "https://x/stockfish-v18.0.5.zip": STOCKFISH_ZIP}
# As the GitHub API lists the assets of the latest release
RELEASE = {
    "tag_name": "1.3.00",
    "assets": [
        {"name": url.rsplit("/", 1)[1], "size": len(data), "browser_download_url": url}
        for url, data in FILES.items()
    ],
}


def fake_open(release: dict, files: dict):
    def open_url(url):
        return io.BytesIO(json.dumps(release).encode() if url == ti.RELEASE_URL else files[url])

    return open_url


def test_the_assets_are_picked_as_the_companion_picks_them():
    template, stockfish = RELEASE["assets"]
    assert ti.release_assets(RELEASE) == [template, stockfish]
    assert ti.release_assets({"assets": [stockfish, template]}) == [template, stockfish]
    assert ti.release_assets({"assets": [template]}) == [template]  # Stockfish is optional
    with pytest.raises(ti.TemplateError) as e:
        ti.release_assets({"assets": [stockfish]})
    assert e.value.key == "template.bad_release"


def test_unpack_sorts_the_media_files_from_the_card():
    template = ti.Template("1.3.00")
    ti.unpack(template, TEMPLATE_ZIP)
    ti.unpack(template, make_zip({"folder/_extra.js": b"x", "README.md": "not used"}))
    assert template.front.startswith("<script") and template.back == "{{FrontSide}}"
    assert template.css == ".card {}"
    # The media folder is flat: a file in a folder of the zip keeps only its name
    assert template.media == {"_ankiChess1.3.00.js": b"mountChess();", "_extra.js": b"x"}
    assert template.script == "_ankiChess1.3.00.js"
    with pytest.raises(ti.TemplateError) as e:
        ti.unpack(template, b"not a zip")
    assert e.value.key == "template.download_failed"


def test_download_reads_the_latest_release(monkeypatch):
    monkeypatch.setattr(ti, "_open", fake_open(RELEASE, FILES))
    seen = []
    template = ti.download(lambda done, total: seen.append((done, total)))
    assert template.version == "1.3.00"
    assert template.script == "_ankiChess1.3.00.js"
    assert set(template.media) == {"_ankiChess1.3.00.js", "_stockfish-18.0.5-asm.js"}
    total = len(TEMPLATE_ZIP) + len(STOCKFISH_ZIP)
    assert seen[-1] == (total, total)


def test_download_errors_are_translated(monkeypatch):
    def offline(url):
        raise OSError("offline")

    monkeypatch.setattr(ti, "_open", offline)
    with pytest.raises(ti.TemplateError) as e:
        ti.download()
    assert e.value.key == "template.download_failed" and "offline" in str(e.value.params["reason"])

    # A release whose zip lacks the card's HTML
    files = dict(FILES, **{"https://x/anki-chess-release.zip": make_zip({"_ankiChess1.3.00.js": b"x"})})
    monkeypatch.setattr(ti, "_open", fake_open(RELEASE, files))
    with pytest.raises(ti.TemplateError) as e:
        ti.download()
    assert e.value.key == "template.bad_release"
