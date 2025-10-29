## Companion addon

I have made a [companion addon](https://ankiweb.net/shared/info/1300975327?cb=1755601119118) to simplify this process. Note this is not required for the template to work, it just tries to make installation/updating easier. This is a note template so it will run without addons.

## Manual installation

either use the [companion addon](https://ankiweb.net/shared/info/1300975327?cb=1755601119118) or manually install:

1. Go to the **[_Releases_ page](https://github.com/TowelSniffer/Anki-Chess-2.0/releases)**.
1. In the latest release's _Assets_ section, download "chess.apkg".
1. Open Anki and make sure your devices are all synchronised.
1. In the _File_ menu, select _Import_.
1. Browse for and select the downloaded file `chess.apkg`.
1. Download the dist.zip folder and extract. Copy the contents of the dist folder into you anki collection.media folder

## Updating

either use the [companion addon](https://ankiweb.net/shared/info/1300975327?cb=1755601119118) or manually update:

The upgrade process is typically the same as the installation process explained in the [Manual installation](#Manual-installation) section.

### issues on other devices after updating

when upgrading media files,some people report that anki doesn't update the matching files on its server and other devices as it's supposed to which can lead to the template not updating properly on other devices. it is important to fist delete them from your collection.media folder on desktop and then sync all your devices. this will remove the old files from the anki servers and will allow each device to sync without issues.

### Build from source

```
npm run build
```
