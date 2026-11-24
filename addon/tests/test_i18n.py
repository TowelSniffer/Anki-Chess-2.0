import os
import re
import string
import sys

import pytest

HERE = os.path.dirname(__file__)
ADDON_DIR = os.path.join(HERE, "..", "lichess_study_importer")
# Import the pure modules directly: the package __init__ depends on aqt.
sys.path.insert(0, ADDON_DIR)

import i18n  # noqa: E402


def placeholders(text: str) -> set[str]:
    return {name for _, name, _, _ in string.Formatter().parse(text) if name}


@pytest.fixture(autouse=True)
def reset_language():
    yield
    i18n.set_language(i18n.DEFAULT_LANGUAGE)


def test_default_language_is_english():
    assert i18n.DEFAULT_LANGUAGE == "en"
    assert i18n.get_language() == "en"
    assert i18n.tr("menu.import") == "Import into AnkiChess..."


def test_languages_have_the_same_keys_and_placeholders():
    en = i18n.STRINGS["en"]
    for lang, table in i18n.STRINGS.items():
        assert table.keys() == en.keys(), lang
        for key, text in table.items():
            assert placeholders(text) == placeholders(en[key]), (lang, key)


def test_every_key_used_in_the_code_exists():
    used = set()
    for name in os.listdir(ADDON_DIR):
        if name.endswith(".py") and name != "i18n.py":
            with open(os.path.join(ADDON_DIR, name), encoding="utf-8") as f:
                source = f.read()
            used |= set(re.findall(r'tr\(\s*"([\w.]+)"', source))
            used |= set(re.findall(r'"((?:error|kind|mode)\.[\w.]+|lichess\.\w+_wait)"', source))
            # Keys raised by LichessError / ChessComError / EngineError
            used |= set(re.findall(r'Error\(\s*"([\w.]+)"', source))
    assert used, "no translation keys found"
    assert used <= i18n.STRINGS["en"].keys(), used - i18n.STRINGS["en"].keys()


@pytest.mark.parametrize(
    "setting,anki_lang,expected",
    [
        (None, None, "en"),
        ("", None, "en"),
        ("en", "pt_BR", "en"),
        ("pt-BR", None, "pt-BR"),
        ("pt_BR", None, "pt-BR"),
        ("pt", None, "pt-BR"),
        ("auto", "pt_BR", "pt-BR"),
        ("auto", "pt-PT", "pt-BR"),
        ("auto", "de_DE", "en"),
        ("auto", None, "en"),
        ("fr", None, "en"),
    ],
)
def test_resolve_language(setting, anki_lang, expected):
    assert i18n.resolve_language(setting, anki_lang) == expected


def test_translate_with_params_in_portuguese():
    i18n.set_language("pt-BR")
    assert i18n.tr("result.summary", created=2, updated=1, unchanged=3, skipped=0) == (
        "Lichess: 2 criadas, 1 atualizadas, 3 já em dia, 0 já existentes puladas."
    )
    i18n.set_language("xx")  # unknown -> English
    assert i18n.get_language() == "en"
