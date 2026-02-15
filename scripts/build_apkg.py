# /// script
# dependencies = ["genanki"]
# ///

import genanki
import os
import json
import zipfile

# define the Unique Model (Note Type)
# a unique ID once for the Model and Deck to preserve scheduling if we update later.
MODEL_ID = 1842685934
DECK_ID = 1452794823

PROJECT_ROOT = os.path.join(os.path.dirname(__file__), '../')
with open(os.path.join(PROJECT_ROOT, 'package.json'), 'r') as f:
    pkg_data = json.load(f)
    version = pkg_data['version']

TEMPLATE_DIR = os.path.join(os.path.dirname(__file__), '../src/anki_templates')

with open(os.path.join(TEMPLATE_DIR, 'front.html'), 'r', encoding='utf-8') as f:
    RAW_FRONT = f.read()

with open(os.path.join(TEMPLATE_DIR, 'style.css'), 'r', encoding='utf-8') as f:
    RAW_CSS = f.read()

with open(os.path.join(TEMPLATE_DIR, 'default_config.json'), 'r', encoding='utf-8') as f:
    config_data = json.load(f)

# Ensure no trailing newlines issues by using json.dumps directly
config_js_string = f"window.USER_CONFIG = {json.dumps(config_data, indent=2)};"

final_front = RAW_FRONT.replace('// __USER_CONFIG__', config_js_string)

final_front = final_front.replace('__VERSION__', version)
final_css = RAW_CSS.replace('__VERSION__', version)

final_back = final_front.replace('data-boardMode="Puzzle"', 'data-boardMode="Viewer"')

ankichess_model = genanki.Model(
  MODEL_ID,
  'AnkiChess Model',
  fields=[
    {'name': 'PGN'},
    {'name': 'textField'},
  ],
  templates=[
    {
      'name': 'Chess Puzzle',
      'qfmt': final_front,
      'afmt': final_back,
    },
  ],
  css=final_css
)

# initialize Deck
deck = genanki.Deck(DECK_ID, 'AnkiChessExample')

example_pgn = """
[Event "The Opera Game"]
[Site "Paris Opera House"]
[Date "1858.11.02"]
[Round "?"]
[White "Paul Morphy"]
[Black "Duke of Brunswick &amp; Count Isouart"]
[Result "1-0"]
[ECO "C41"]

1. e4 e5 2. Nf3 d6 {This is the Philidor Defence. It's solid but can be passive.} 3. d4 Bg4?! {This pin is a bit premature. A more common and solid move would be 3...exd4.} 4. dxe5 Bxf3 (4... dxe5 5. Qxd8+ Kxd8 6. Nxe5 {White wins a pawn and has a better position.}) 5. Qxf3! {A great move. Morphy is willing to accept doubled pawns to accelerate his development.} 5... dxe5 6. Bc4 {Putting immediate pressure on the weak f7 square.} 6... Nf6 7. Qb3! {A powerful double attack on f7 and b7.} 7... Qe7 {This is the only move to defend both threats, but it places the queen on an awkward square and blocks the f8-bishop.} 8. Nc3 c6 9. Bg5 {Now Black's knight on f6 is pinned and cannot move without the queen being captured.} 9... b5?! {A desperate attempt to kick the bishop and relieve some pressure, but it weakens Black's queenside.} 10. Nxb5! {A brilliant sacrifice! Morphy sees that his attack is worth more than the knight.} 10... cxb5 11. Bxb5+ Nbd7 12. O-O-O {All of White's pieces are now in the attack, while Black's are tangled up and undeveloped.} 12... Rd8 13. Rxd7! {Another fantastic sacrifice to remove the defending knight.} 13... Rxd7 14. Rd1 {Renewing the pin and intensifying the pressure. Black is completely paralyzed.} 14... Qe6 {Trying to trade queens to relieve the pressure, but it's too late.} 15. Bxd7+ Nxd7 (15... Qxd7 16. Qb8+ Ke7 17. Qxe5+ Kd8 18. Bxf6+ {and White wins easily.}) 16. Qb8+! {The stunning final sacrifice! Morphy forces mate by sacrificing his most powerful piece.} 16... Nxb8 17. Rd8# {A beautiful checkmate, delivered with just a rook and bishop.} 1-0
"""
example_html = """
<h2>The Opera Game</h2>White: Paul Morphy<br>Black:Duke of Brunswick &amp; Count Isouart
"""

# Add a placeholder note (Anki requires at least one note to import a deck,
note = genanki.Note(
  model=ankichess_model,
  fields=[example_pgn, example_html]
)
deck.add_note(note)

# --- MEDIA COLLECTION ---
dist_path = os.path.join(os.path.dirname(__file__), '../dist-anki/collection.media')
media_files = []

for root, dirs, files in os.walk(dist_path):
    for file in files:
        if file.startswith('_'):
            media_files.append(os.path.join(root, file))

print(f"Bundling {len(media_files)} media files...")

# --- EXPORT APKG ---
package = genanki.Package(deck)
package.media_files = media_files
apkg_path = os.path.join(os.path.dirname(__file__), '../dist-anki/ankichess.apkg')
package.write_to_file(apkg_path)
print(f"Success: {os.path.basename(apkg_path)} created.")

# --- EXPORT RELEASE ZIP (For Companion Add-on) ---
zip_path = os.path.join(os.path.dirname(__file__), '../dist-anki/anki-chess-release.zip')

print("Creating release zip...")
with zipfile.ZipFile(zip_path, 'w', zipfile.ZIP_DEFLATED) as zf:
    # A. Add processed templates
    # The Add-on expects "Front.html" and "style.css" at the root
    zf.writestr("Front.html", final_front)
    zf.writestr("style.css", final_css)

    # B. Add media files
    for file_path in media_files:
        # Add files to the root of the zip
        arcname = os.path.basename(file_path)
        zf.write(file_path, arcname)

print(f"Success: {os.path.basename(zip_path)} created.")
