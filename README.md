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

### First Move Orientation

For both of the following lines changing `flip=true` to `flip=false`. should result in the first move of the PGN being the first move in the puzzle, as oppose to the default behaviour which is that the first moves plays automatically and you must then respond.

On the front side:

```
	document.getElementById("Board").src = `_chess3.0.html?PGN=` + PGN + `&flip=true&backgroundColor=` + backgroundColor + `&handicap=` + handicap + ``;
```

and on the backside ate the bottom:

```
	document.getElementById("analysisBoard").src = `_ChessTempoViewer.html?PGN=` + PGN + `&flip=true&errorCheck=` + errorCheck + `&backgroundColor=` + backgroundColor + ``;
```

### Handicap

Changing the value of handicap in the following line will decide in the number of wrong moves you can make before the answer is shown. Note: Amount of wrong moves is equal to the value of handicap + 1.

```
	var handicap = 0;
```

### Variation Randomization

Changing the value of `randomLines` will decide if variations in the PGN should be presented to you randomly or not. Note: If set to `false`, it will always show the first variation.

```
	var randomLines = true;
```

### Accept Variations as Correct

Changing the value of `acceptVariations` will decide if side variations considered as correct or not. If those variations are accepted as correct, they will be played instead of the main variation. Note: Computer will still be able to play possible variations given in PGN file, `randomLines` should be changed to stop this.

```
	var acceptVariations = true;
```

## Cross Compatability

I have verified compatability with Windows/Linux and Ankidroid, however cannot verify for IOS and MAC. This is a note template however, and does not rely on addons, so it should be compatable.

## Upgrading

The upgrade process is typically the same as the installation process explained in the [previous section](#getting-started). However, when upgrading media files, it is important to fist delete them from your media folder and then sync. this will remove the old files from the anki servers and will allow each device to sync without issues.

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
