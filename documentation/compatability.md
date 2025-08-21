I always verify compatability with Windows/Linux and Ankidroid, however cannot verify for IOS and MAC. This is a note template however, and does not rely on addons, so it should be compatable/ and if you run into issues I will trye to fix them. 

## PGN tips:

this template requires standared format with PGN and can [run into errors if not correct](https://github.com/TowelSniffer/Anki-Chess-2.0/issues/50). If you find you are getting wrrors with a particular PGN, try pasting it into a parser like nibbler or Lichess'/chess.com's analysis tool to correct the format.

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
