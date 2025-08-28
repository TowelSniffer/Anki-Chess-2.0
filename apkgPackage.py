import genanki
import random

# 1. Read the contents of the external files
with open('styling.css', 'r', encoding='utf-8') as f:
    css_content = f.read()

with open('card_front.html', 'r', encoding='utf-8') as f:
    front_html = f.read()

with open('card_back.html', 'r', encoding='utf-8') as f:
    back_html = f.read()

# 2. Define the Model, injecting the file contents
my_model = genanki.Model(
  random.randrange(1 << 30, 1 << 31),
  'External File Model',
  fields=[
    {'name': 'Question'},
    {'name': 'Answer'},
  ],
  templates=[
    {
      'name': 'Card 1',
      'qfmt': front_html,  # Use content from card_front.html
      'afmt': back_html,   # Use content from card_back.html
    },
  ],
  css=css_content,        # Use content from styling.css
)

# 3. Create the Deck and a sample note
my_deck = genanki.Deck(
  random.randrange(1 << 30, 1 << 31),
  'Externally Styled Deck')

my_deck.add_note(genanki.Note(
  model=my_model,
  fields=['Speed of Light (in a vacuum)', '299,792,458 m/s']))

# 2. Create a list of the media file paths you want to include
media_files_list = [
    'world_capitals.jpg',
    # 'another_image.png',
    # 'some_audio.mp3',
]

# 3. Pass the media list to the Package constructor
genanki.Package(my_deck, media_files=media_files_list).write_to_file('deck_with_media.apkg')

print("Successfully created external_deck.apkg!")
