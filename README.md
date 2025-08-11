# Anki-Chess-2.0
An interactive chess template for anki.

![chess GIF](examples/chess.webp)

Tutorial: https://youtu.be/NZOK1dZAvpI

## Features

- Works with PGN format
- Support for piece promotions
- Board auto orientates dpending on first move of given puzzle
- Works offline and on Ankidroid (Ankidroid verified, IOS)
- No addons required
- Analysis board on the backside
- Backside border colour to indicate mistakes
- support for multiple lines. this means you can choose multiple moves to be the correct answer, and the cards will respond with a random move (if multiple lines exist).


## Getting started

How to install:

1. Go to the **[_Releases_ page](https://github.com/TowelSniffer/Anki-Chess-2.0/releases)**.
1. In the latest release's _Assets_ section, download "chess.apkg".
1. Open Anki and make sure your devices are all synchronised.
1. In the _File_ menu, select _Import_.
1. Browse for and select the downloaded file `chess.apkg`.
1. Download the Media Files.rar folder and extract. Copy the contents of the Media Files folder into you anki collection.media folder

👉 To stay informed of new releases, make sure to [watch this repository's releases](https://help.github.com/en/articles/watching-and-unwatching-releases-for-a-repository).

## Customization

### Text Field

Currently doesn't support any formatting or line breaks etc. So inteded to just be a line of text (opening, brief description etc.)

### First Move Orientation

For both of the following lines changing `flip=true` to `flip=false`. should result in the first move of the PGN being the first move in the puzzle, as oppose to the default behaviour which is that the first moves plays automatically and you must then respond.

On BOTH front and back side:

```
    var flip = true;
```

### Handicap

Changing the value of handicap in the following line will decide in the number of wrong moves you can make before the answer is shown. Note: Amount of wrong moves is equal to the value of handicap + 1.

```
	var handicap = 1;
```

### Strict scoring

If set to true, the template will record any missed play as a mistake rather than being determined by your handicap value.

```
	var strictScoring = false;
```

### Accept Variations as Correct

Changing the value of `acceptVariations` will decide if side variations considered as correct or not. If those variations are accepted as correct, they will be played instead of the main variation. Note: Computer will also be able to play possible variations given in PGN file, so be mindful with alternate lines when making your cards.

```
	var acceptVariations = true;
```

### Mute sound

set muteAudio variable to true on both sided of card

## Cross Compatability

I have verified compatability with Windows/Linux and Ankidroid, however cannot verify for IOS and MAC. This is a note template however, and does not rely on addons, so it should be compatable. 

## HELP!!! My weird screen can't display the entire board!!

There are values in the styling section that can modify the board size. If the board is too big for your screen, you can try reducing the following values. Start by redcucing the `height` value for both the body and iframe in the relevant section of your device: desktop, android, or iOS.

```
html, body, #qa, #content {
  margin:0 !important;
}
/* Styling for desktop devices */
body {
  height: 100vh;
  width: 100vw;
  /* removes wierd overflow issues on different devices */
  overflow: hidden
}


#qa, #content {
  height:100%;
  width: 100%;
}

iframe {
  height: 100%;
  width: 100%;
  border: 0;
}

/* Styling for android devices */
.mobile iframe {
  height: 99vh;
}



/* Styling for iPad and iPhone devices */
.iphone iframe, .ipad iframe {
  height: 77vh;
}
```

## PGN tips:

this template requires standared format with PGN and can [run into errors if not correct](https://github.com/TowelSniffer/Anki-Chess-2.0/issues/50). If you find you are getting wrrors with a particular PGN, try pasting it into a parser like nibbler or Lichess'/chess.com's analysis tool to correct the format.

## Upgrading

The upgrade process is typically the same as the installation process explained in the [previous section](#getting-started). However, when upgrading media files, it is important to fist delete them from your media folder and then sync. this will remove the old files from the anki servers and will allow each device to sync without issues.

## Third party apps

- [AnkifyPGN](https://github.com/ThoughtfulSenpai/AnkifyPGN): A GUI to batch create flashcards. Now also an anki addon: [
addon](https://ankiweb.net/shared/info/569467423)

## resources used For this were:

#### ~~ChessBoard js~~
~~https://chessboardjs.com/index.html~~

#### Chessground
https://github.com/ornicar/chessground

#### and the PGN viewer
https://github.com/mliebelt/PgnViewerJS

#### Auerswald Collection, 3500 tactics (PGN format)
http://gorgonian.weebly.com/pgn.html

#### chess.js
https://github.com/jhlywa/chess.js/blob/master/README.md

#### pgn-parser (much better than what I tried to write haha)
https://github.com/mliebelt/pgn-parser
