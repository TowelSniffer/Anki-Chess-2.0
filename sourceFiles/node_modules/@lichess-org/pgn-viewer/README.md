# Lichess PGN Viewer

PGN viewer widget, designed to be embedded in content pages.

This won't replace a fully featured [analysis board](https://lichess.org/analysis).

![board with move variation tree](https://raw.githubusercontent.com/lichess-org/pgn-viewer/master/screenshot/tree-comment.png)

## See it in action

- [In a forum post](https://lichess.org/forum/game-analysis/strong-fm-showed-me-a-line-which-i-could-use-one-year-later-against-himself-)
- [In an opening page](https://lichess.org/opening/Caro-Kann_Defense_Advance_Variation)
- [In a user blog post](https://lichess.org/@/mfeeney88/blog/analysis-paralysis/NmISTSVM)
- [As a full-screen game embed](https://lichess.org/embed/game/ErSfVbRk)

## License

Lichess PGN Viewer is distributed under the **GPL-3.0 license** (or any later version, at your option).
When you use it for your website, your combined work may be distributed only under the GPL.
**You must release your source code** to the users of your website.

Please read more about GPL for JavaScript on [greendrake.info](https://greendrake.info/publications/js-gpl).

## Goals

- load and render very fast
- browse through a game
- variation tree
- PGN comments
- players and clocks
- mobile support
- translatable and customisable
- client-side only
- easy to set up on any page

### Non Goals

- custom user moves
- engine support
- opening explorer

For these features, use an [analysis board](https://lichess.org/analysis) or [Lichess studies](https://lichess.org/study).

## Build and run

```
pnpm install
pnpm run demo
```

Then open the demo page at http://localhost:8080

## Installation

### As an NPM package

```
npm i @lichess-org/pgn-viewer
```

## Usage

```js
import LichessPgnViewer from '@lichess-org/pgn-viewer';

const lpv = LichessPgnViewer(domElement, {
  pgn: 'e4 c5 Nf3 d6 e5 Nc6 exd6 Qxd6 Nc3 Nf6',
});

// lpv is an instance of PgnViewer , providing some utilities such as:
lpv.goTo('first');
lpv.goTo('next');
lpv.flip();
console.log(lpv.game);
// see more in pgnViewer.ts
```

### Configuration

```js
const lpv = LichessPgnViewer(domElement, {
  pgn: 'e4 c5 Nf3 d6 e5 Nc6 exd6 Qxd6 Nc3 Nf6',
  // ... more Config
});
```

See [all configuration options in the documented source code](https://github.com/lichess-org/pgn-viewer/blob/master/src/config.ts#L3).

View more examples in `demo/index.html`

## Styles

### SCSS (recommended)

If you use [SCSS](https://sass-lang.com/), you can import the styles with:

```scss
@import '../../node_modules/@lichess-org/pgn-viewer/scss/lichess-pgn-viewer.lib';
```

Customisable SCSS variables are [available](https://github.com/lichess-org/pgn-viewer/blob/master/scss/_lichess-pgn-viewer.lib.scss), see [how lichess configures pgn-viewer with SCSS](https://github.com/lichess-org/lila/blob/master/ui/common/css/component/_lichess-pgn-viewer.scss).

### CSS

Alternatively you can build a CSS file with

```sh
npm run sass-prod
```

Then copy the `dist/lichess-pgn-viewer.css` file into your project.

## Testing

```bash
pnpm test

## or

pnpm test:watch
```

## Wrappers

- Vue.js: [dragunovartem99/vue-pgn-viewer](https://github.com/dragunovartem99/vue-pgn-viewer)

More? Please make a pull request to include it here.
