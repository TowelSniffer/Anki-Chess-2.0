import sys
import types

import pytest


@pytest.fixture
def anki_ops(monkeypatch):
    """anki_ops with stand-ins for anki and aqt, which the tests don't install."""
    stubs = {
        "anki": {},
        "anki.collection": {"AddNoteRequest": object},
        "anki.utils": {"ids2str": str},
        "aqt": {"mw": None},
    }
    for name, attrs in stubs.items():
        if name not in sys.modules:
            monkeypatch.setitem(sys.modules, name, types.SimpleNamespace(**attrs))
    from lsi import anki_ops

    return anki_ops
