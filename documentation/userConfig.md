### Text Field

Currently doesn't support any formatting or line breaks etc. So inteded to just be a line of text (opening, brief description etc.)

### First Move Orientation

For both of the following lines changing `flip=true` to `flip=false`. should result in the first move of the PGN being the first move in the puzzle, as oppose to the default behaviour which is that the first moves plays automatically and you must then respond.

On BOTH front and back side:

```
    flip: true;
```

### Handicap

Changing the value of handicap in the following line will decide in the number of wrong moves you can make before the answer is shown. Note: Amount of wrong moves is equal to the value of handicap + 1.

```
	handicap: 1;
```

### Strict scoring

If set to true, the template will record any missed play as a mistake rather than being determined by your handicap value.

```
	strictScoring: false;
```

### Accept Variations as Correct

Changing the value of `acceptVariations` will decide if side variations considered as correct or not. If those variations are accepted as correct, they will be played instead of the main variation. Note: Computer will also be able to play possible variations given in PGN file, so be mindful with alternate lines when making your cards.

```
	acceptVariations: true;
```

### Mute sound

Set muteAudio variable to true on both sided of card

```
	muteAudio: false;
```

### Font Size

Set font size in px for user text passed to card

```
	fontSize: 18;
```
### mirror

card will randomly show up in a mirrored and/or inverted orientation if neither player holds castle rights.

```
	mirror: false;
```

### showDests

Indicate legal moves for clicked piece.

```
	showDests: true;
```
