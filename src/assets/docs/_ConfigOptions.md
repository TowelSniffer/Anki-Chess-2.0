## Configuring the templates

Configuration can be handled automatically via the companion addon API (also currently works with anki connect API). 

### Auto update settings for current template with companion addon (Also works with anki connect)

When changing settings, the will be applied to the current note/card type for the current session. When making changes, the Save Config button will become red. Clicking this will write the current settings to your note types making the changes permanent. 

### No addon

Without the comapanion addon, the card settings will need to be applied manually. You can do this manually by editing `window.USER_CONFIG`, or by clicking the copy to clipboard option, and replacing the ENTIRE front section of your note template with the clipboard contents. 

