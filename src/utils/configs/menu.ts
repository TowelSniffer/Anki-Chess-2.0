import IconDevBoard from '~icons/material-symbols/developer-board-sharp';
import IconKidStar from '~icons/material-symbols/kid-star-sharp';
import IconSave from '~icons/material-symbols/save-sharp';
import IconCopy from '~icons/material-symbols/content-copy-sharp';
import IconChessKnight from '~icons/material-symbols/chess-knight';
import IconBackgroundGridSmall from '~icons/material-symbols/background-grid-small';

import { userConfig } from '$stores/userConfig.svelte';
import type { UserConfigOpts } from '$Types/UserConfig';
import type { MenuItem } from '$components/uiUtility/Dropdown.svelte';

type BooleanKeys<T> = {
  [K in keyof T]: T[K] extends boolean ? K : never;
}[keyof T];

function setConfigBoolean(key: BooleanKeys<UserConfigOpts>) {
  userConfig.opts[key] = !userConfig.opts[key];
}

export function getMenuData(): MenuItem[] {
  return [
    {
      label: 'Stockfish',
      icon: IconDevBoard,
      children: [
        {
          type: 'number',
          label: 'Thinking Time (s)',
          min: 1,
          max: 300,
          value: userConfig.opts.analysisTime,
          onChange: (val: number) => userConfig.opts.analysisTime = val,
        },
        {
          type: 'number',
          label: 'Multi Pv',
          min: 1,
          max: 5,
          value: userConfig.opts.analysisLines,
          onChange: (val: number) => userConfig.opts.analysisLines = val,
        },
      ],
    },
    {
      label: 'Board Settings',
      icon: IconBackgroundGridSmall,
      children: [
        {
          type: 'toggle',
          label: 'Single Click Move',
          tooltip:
            'If enabled, clicking on destination with only one valid move will make that move.',
          checked: userConfig.opts.singleClickMove,
          onToggle: () => setConfigBoolean('singleClickMove'),
        },
        {
          type: 'toggle',
          label: 'showDests',
          tooltip: 'Show legal moves for selected piece',
          checked: userConfig.opts.showDests,
          onToggle: () => setConfigBoolean('showDests'),
        },
        {
          type: 'number',
          label: 'Animation time (ms)',
          tooltip: 'Set time for piece movement animations',
          min: 1,
          max: 1000,
          step: 100,
          value: userConfig.opts.animationTime,
          onChange: (val: number) => (userConfig.opts.animationTime = val),
        },
      ],
    },
    {
      label: 'Puzzle Settings',
      icon: IconChessKnight,
      children: [
        {
          type: 'toggle',
          label: 'Accept Variations',
          tooltip: 'Allows pgn variations for puzzle solution. Note: If this is enabled, you can mark a move as a mistake/blunder (?, ??, ?!) to mark a line as a mistake when played.',
          checked: userConfig.opts.acceptVariations,
          onToggle: () => setConfigBoolean('acceptVariations'),
        },
        {
          type: 'toggle',
          label: 'Disable Arrows',
          tooltip: 'Disables alternate line arrows for Puzzle mode.',
          checked: userConfig.opts.disableArrows,
          onToggle: () => setConfigBoolean('disableArrows'),
        },
        {
          type: 'separator',
        },
        {
          type: 'number',
          label: 'Handicap',
          tooltip: 'Number of allowed mistakes before auto playing',
          min: 1,
          max: 10,
          value: userConfig.opts.handicap,
          onChange: (val: number) => (userConfig.opts.handicap = val),
        },
        {
          type: 'toggle',
          label: 'Strict Scoring',
          tooltip: 'Always mark incorrect when solved if any mistake is made (despite handicap value), or timer runs out',
          checked: userConfig.opts.strictScoring,
          onToggle: () => setConfigBoolean('strictScoring'),
        },
        {
          type: 'separator',
        },
        {
          type: 'number',
          label: 'Timer (s)',
          tooltip: 'Initial time for Puzzle. set to 0 to disable',
          min: 0,
          max: 60,
          value: userConfig.opts.timer / 1000,
          onChange: (val: number) => (userConfig.opts.timer = val * 1000),
        },
        userConfig.opts.timer && {
          type: 'number',
          label: 'Increment (s)',
          tooltip: 'Add time with each correct move',
          min: 0,
          max: 60,
          value: userConfig.opts.increment / 1000,
          onChange: (val: number) => (userConfig.opts.increment = val * 1000),
        },
      ],
    },
    {
      label: 'Anki Template',
      icon: IconKidStar,
      children: [
        {
          type: 'toggle',
          label: 'User Text on Front',
          tooltip: 'Show textField on front side of note',
          checked: userConfig.opts.frontText,
          onToggle: () => setConfigBoolean('frontText'),
        },
        {
          type: 'separator',
        },
        {
          type: 'toggle',
          label: 'Flip PGN',
          tooltip:
            'Dictates where puzzle is solves from first or second move of the PGN',
          checked: userConfig.opts.flipBoard,
          onToggle: () => setConfigBoolean('flipBoard'),
        },
        {
          type: 'toggle',
          label: 'Mirror',
          tooltip:
            'Randomises orientation and colour for PGNs with no castle rights',
          checked: userConfig.opts.mirror,
          onToggle: () => setConfigBoolean('mirror'),
        },
        {
          type: 'toggle',
          label: 'Random Orientation',
          tooltip: 'Randomises orientation, and greys border to prevent knowing which colour has the solution for puzzle.',
          checked: userConfig.opts.randomOrientation,
          onToggle: () => setConfigBoolean('randomOrientation'),
        },
        {
          type: 'separator',
        },
        {
          type: 'toggle',
          label: 'Auto Advance',
          tooltip: 'Uses anki API to automatically show answer when puzzle is solved. Note: Does not work on anki mobile, and not yet supported on Ankidroid\'s "New Study Screen"',
          checked: userConfig.opts.autoAdvance,
          onToggle: () => setConfigBoolean('autoAdvance'),
        },
        (userConfig.opts.autoAdvance && userConfig.opts.timer) && {
          type: 'toggle',
          label: 'Timer Advance',
          tooltip: 'Flip card when timer runs out',
          checked: userConfig.opts.timerAdvance,
          onToggle: () => setConfigBoolean('timerAdvance'),
        },
        {
          type: 'separator',
        },
        {
          type: 'toggle',
          label: 'Mute Audio',
          checked: userConfig.opts.muteAudio,
          onToggle: () => setConfigBoolean('muteAudio'),
        },
      ],
    },
    ...getSaveMenuItemData()
  ].filter((item): item is MenuItem => !!item);
}

function getSaveMenuItemData(): MenuItem[] {

  const canSave = userConfig.hasAddon || userConfig.isAnkiConnect;
  if (canSave) {
    return [
      {
        type: 'separator',
      },
      {
        type: 'action',
        disabled: !userConfig.saveDue,
        tooltip:
          'Updates note template for current settings (requires anki connect addon)',
        label: 'Save Config',
        icon: IconSave,
        danger: userConfig.saveDue,
        action: () => userConfig.save(),
      }]
  } else if (window.CARD_CONFIG) {
    // Fallback for Mobile/Web/No-Addon
    return [
      {
        type: 'separator',
      },
      {
        type: 'action',
        tooltip:
          'Copy config to clipboard for current settings. Replace "window.USER_CONFIG = {...}", for front and backside of template. NOTE: if anki connect addon is installed, this will update template automatically.',
        label: 'Copy Config',
        icon: IconCopy,
        danger: userConfig.saveDue,
        action: () => userConfig.save(),
      }]
  }
  return []
}

