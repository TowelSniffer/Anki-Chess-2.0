## Changelog

> **Notice:** It is highly recommended to make sure the [Companion Add-on](https://ankiweb.net/shared/info/1300975327) is up to date before updating this template!

### Version 1.2.10
* Fixed PGN and FEN validation breaking some PGNs, and added a popup when trying to load bad PGNs.
* Fixed broken Game comments.
* Viewer now loads the same position as Puzzle. Set `Save Position` to false to default to the starting position.
* Backside now uses Anki's `{{FrontSide}}` field to avoid having to save config options for both sides.
* Added a method to control settings on the Front Side (Toggle with `Anki Template > Front Settings`). *Note: I will probably add an option in the future to instead use touch gestures and keyboard shortcuts.*
* Added a help menu to show documentation and interactive examples.
* Some performance improvements.

### Version 1.2.04
* Some changes to the look of the border that I like.
* Changed the scoring colors to ones that will work better with dark and light themes (Light theme coming soon). Customizing these will be allowed eventually. *Perfect* color is now magenta. Gold looked like yellow, and blue wasn't great as it's already used for alt line arrows.
* Added colors to some NAGs in the Viewer.
* Fixed crash with sequential comments on PGN.
* Added support for different config options on multi-sided note templates.

### Version 1.2.03
* Fixed a bug with last update's engine buffer preventing multi-PV lines from rendering.
* Fixed gestures activating on board interactions. *(Note: On AnkiDroid, gestures can't be prevented unless you switch to the new study screen, but this currently doesn't support the JS API, so auto-advance won't work).*
* Fixed out-of-time logic triggering when the timer is disabled. No more red flash on load.
* User can now set handicap to `0` to disable it.
* Fixed perfect vs. correct scoring logic. **Perfect (Magenta):** No mistakes and timer not out of time. **Correct (Green):** Mistakes were under handicap value, or timer ran out. If both timer and handicap are disabled, it will just be green or red on any mistake.
