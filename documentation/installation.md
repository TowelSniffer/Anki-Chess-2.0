## Companion addon

I have made a [companion addon](https://ankiweb.net/shared/info/1300975327?cb=1755601119118) to simplify this process. Note this is not required for the template to work, it just tries to make installation/updating easier. This is a note template so it will run without addons. 

## How to install

either use the [companion addon](https://ankiweb.net/shared/info/1300975327?cb=1755601119118) or manually install:

1. Go to the **[_Releases_ page](https://github.com/TowelSniffer/Anki-Chess-2.0/releases)**.
1. In the latest release's _Assets_ section, download "chess.apkg".
1. Open Anki and make sure your devices are all synchronised.
1. In the _File_ menu, select _Import_.
1. Browse for and select the downloaded file `chess.apkg`.
1. Download the dist.zip folder and extract. Copy the contents of the dist folder into you anki collection.media folder

## Updating

either use the [companion addon](https://ankiweb.net/shared/info/1300975327?cb=1755601119118) or manually update:

The upgrade process is typically the same as the installation process explained in the [previous section](###How to install). However, when upgrading media files, it is important to fist delete them from your media folder and then sync. this will remove the old files from the anki servers and will allow each device to sync without issues.

### Build from source

```
npm run build
```
