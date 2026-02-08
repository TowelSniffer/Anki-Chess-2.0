import IconDevBoard from '~icons/material-symbols/developer-board-sharp';
import IconKidStar from '~icons/material-symbols/kid-star-sharp';
import IconSave from '~icons/material-symbols/save-sharp';
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
          label: 'mirror',
          tooltip:
            'Randomises orientation and colour for PGNs with no castle rights',
          checked: userConfig.mirror,
          onToggle: () => setConfigBoolean('mirror'),
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
          checked: userConfig.muteAudio,
          onToggle: () => setConfigBoolean('muteAudio'),
        },
        {
          type: 'separator',
        },
        {
          type: 'number',
          label: 'Timer ()',
          tooltip: 'Initial time for Puzzle. set to 0 to disable',
          min: 1,
          max: 60,
          value: userConfig.timer / 1000,
          onChange: (val: number) => (userConfig.timer = val * 1000),
        },
        {
          type: 'number',
          label: 'Increment (s)',
          tooltip: 'Add time with each correct move',
          min: 1,
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
          type: 'toggle',
          label: 'Flip PGN',
          tooltip:
            'Dictates where puzzle is solves from first or second move of the PGN',
          checked: userConfig.flipBoard,
          onToggle: () => setConfigBoolean('flipBoard'),
        },
        {
          type: 'toggle',
          label: 'Mute Audio',
          checked: userConfig.muteAudio,
          onToggle: () => setConfigBoolean('muteAudio'),
        },
      ],
    },
    {
      type: 'separator',
    },
    {
      disabled: !userConfig.saveDue,
      tooltip:
        'Updates note template for current settings (requires anki connect addon)',
      label: 'Save Config',
      icon: IconSave,
      danger: userConfig.saveDue,
      action: () => userConfig.save(),
    },
  ];
}
