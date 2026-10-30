// The players of a PGN, as shown in the bars above and below the board (as on Lichess)

export interface PlayerInfo {
  name: string; // "NN" (no name) when the PGN has none
  title: string; // GM, IM... or ""
  elo: string; // rating or ""
  result: string; // "1", "0", "½", or "" when the game has no result
}

const SCORES: Record<string, [string, string]> = {
  '1-0': ['1', '0'],
  '0-1': ['0', '1'],
  '1/2-1/2': ['½', '½'],
};

// "?" and "-" are how PGNs write an unknown value
const known = (value: unknown) => {
  const text = String(value ?? '').trim();
  return text === '?' || text === '-' ? '' : text;
};

export function playerInfo(tags: Record<string, unknown> | undefined, color: 'w' | 'b'): PlayerInfo {
  const side = color === 'w' ? 'White' : 'Black';
  const elo = known(tags?.[`${side}Elo`]);
  const score = SCORES[known(tags?.Result)];
  return {
    name: known(tags?.[side]) || 'NN',
    title: known(tags?.[`${side}Title`]),
    elo: /^[1-9]\d*$/.test(elo) ? elo : '',
    result: score ? score[color === 'w' ? 0 : 1] : '',
  };
}

const RESULT_SWAPPED: Record<string, string> = { '1-0': '0-1', '0-1': '1-0' };

// For a mirrored PGN whose colours were inverted: White's player now has the black pieces
export function swapPlayers(tags: Record<string, unknown>): void {
  for (const suffix of ['', 'Elo', 'Title', 'FideId']) {
    const white = tags[`White${suffix}`];
    const black = tags[`Black${suffix}`];
    delete tags[`White${suffix}`];
    delete tags[`Black${suffix}`];
    if (black !== undefined) tags[`White${suffix}`] = black;
    if (white !== undefined) tags[`Black${suffix}`] = white;
  }
  const result = RESULT_SWAPPED[String(tags.Result ?? '')];
  if (result) tags.Result = result;
}
