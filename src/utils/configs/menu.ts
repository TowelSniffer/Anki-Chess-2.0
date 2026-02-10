import IconDevBoard from '~icons/material-symbols/developer-board-sharp';
import IconKidStar from '~icons/material-symbols/kid-star-sharp';
import IconSave from '~icons/material-symbols/save-sharp';
import IconCopy from '~icons/material-symbols/content-copy-sharp';
import IconChessKnight from '~icons/material-symbols/chess-knight';
import IconBackgroundGridSmall from '~icons/material-symbols/background-grid-small';

import { engineStore } from '$stores/engineStore.svelte';
import { userConfig, type UserConfig } from '$stores/userConfig.svelte';

import type { MenuItem } from '$components/uiUtility/Dropdown.svelte';

type BooleanKeys<T> = {
  [K in keyof T]: T[K] extends boolean ? K : never;
}[keyof T];

function setConfigBoolean(key: BooleanKeys<UserConfig>) {
  userConfig[key] = !userConfig[key];
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
          value: userConfig.analysisTime,
          onChange: (val: number) => engineStore.setThinkingTime(val),
        },
        {
          type: 'number',
          label: 'Multi Pv',
          min: 1,
          max: 5,
          value: userConfig.analysisLines,
          onChange: (val: number) => engineStore.setMultiPv(val),
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
          checked: userConfig.singleClickMove,
          onToggle: () => setConfigBoolean('singleClickMove'),
        },
        {
          type: 'toggle',
          label: 'showDests',
          tooltip: 'Show legal moves for selected piece',
          checked: userConfig.showDests,
          onToggle: () => setConfigBoolean('showDests'),
        },
      ],
    },
    {
      label: 'Puzzle Settings',
      icon: IconChessKnight,
      children: [
        {
          type: 'number',
          label: 'Handicap',
          tooltip: 'Number of allowed mistakes before auto playing',
          min: 1,
          max: 10,
          value: userConfig.handicap,
          onChange: (val: number) => (userConfig.handicap = val),
        },
        {
          type: 'toggle',
          label: 'Strict Scoring',
          tooltip: 'Always mark incorrect when solved if any mistake is made (despite handicap value), or timer runs out',
          checked: userConfig.strictScoring,
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
          value: userConfig.timer / 1000,
          onChange: (val: number) => (userConfig.timer = val * 1000),
        },
        userConfig.timer && {
          type: 'number',
          label: 'Increment (s)',
          tooltip: 'Add time with each correct move',
          min: 0,
          max: 60,
          value: userConfig.increment / 1000,
          onChange: (val: number) => (userConfig.increment = val * 1000),
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
          checked: userConfig.frontText,
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
          checked: userConfig.flipBoard,
          onToggle: () => setConfigBoolean('flipBoard'),
        },
        {
          type: 'toggle',
          label: 'Mirror',
          tooltip:
            'Randomises orientation and colour for PGNs with no castle rights',
          checked: userConfig.mirror,
          onToggle: () => setConfigBoolean('mirror'),
        },
        {
          type: 'toggle',
          label: 'Random Orientation',
          tooltip: 'Randomises orientation, and greys border to prevent knowing which colour has the solution for puzzle.',
          checked: userConfig.randomOrientation,
          onToggle: () => setConfigBoolean('randomOrientation'),
        },
        {
          type: 'separator',
        },
        {
          type: 'toggle',
          label: 'Auto Advance',
          tooltip: 'Uses anki API to automatically show answer when puzzle is solved. Note: might not work on anki mobile, and not yet supported on Ankidroid\'s "New Study Screen"',
          checked: userConfig.autoAdvance,
          onToggle: () => setConfigBoolean('autoAdvance'),
        },
        {
          type: 'toggle',
          label: 'Mute Audio',
          checked: userConfig.muteAudio,
          onToggle: () => setConfigBoolean('muteAudio'),
        },
      ],
    },
    ...getSaveMenuItemData()
  ].filter((item): item is MenuItem => !!item);;
}

function getSaveMenuItemData(): MenuItem[] {
  if (userConfig.isAnkiConnect) {
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
  } else if (window.CARD_CONFIG) { // anki without connect
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
