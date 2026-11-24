"""
Package the Lichess Study Importer add-on as an .ankiaddon file.
"""

import os
import zipfile

ROOT = os.path.join(os.path.dirname(__file__), "..")
ADDON_DIR = os.path.join(ROOT, "addon", "lichess_study_importer")
OUT_DIR = os.path.join(ROOT, "dist-anki")
OUT_PATH = os.path.join(OUT_DIR, "lichess_study_importer.ankiaddon")

os.makedirs(OUT_DIR, exist_ok=True)
with zipfile.ZipFile(OUT_PATH, "w", zipfile.ZIP_DEFLATED) as zf:
    for root, dirs, files in os.walk(ADDON_DIR):
        rel_root = os.path.relpath(root, ADDON_DIR)
        # .ankiaddon files must not contain __pycache__, the folder itself, or user data.
        # Hidden folders and files (.pytest_cache, .DS_Store) are left out too.
        dirs[:] = sorted(
            d
            for d in dirs
            if d != "__pycache__" and not d.startswith(".") and not (rel_root == "." and d == "user_files")
        )
        for name in sorted(files):
            if name.endswith(".pyc") or name.startswith(".") or (rel_root == "." and name == "meta.json"):
                continue
            path = os.path.join(root, name)
            zf.write(path, os.path.normpath(os.path.join(rel_root, name)).replace(os.sep, "/"))

print(f"Success: {os.path.relpath(OUT_PATH, ROOT)} created.")
