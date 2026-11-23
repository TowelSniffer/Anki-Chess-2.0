import { test, expect, type Page } from '@playwright/test';
import { materialDiff } from '$features/chessJs/material';
import { playerInfo } from '$features/pgn/players';
import { mirrorPGN, parsePGN } from '$features/pgn/pgnParsing';

test.skip(({ browserName }) => browserName !== 'chromium', 'Logic tests only need Chromium');

// Black to move, white has three pawns more (the rooks and knights are level)
const puzzleFen = '8/8/1k6/7R/p2P4/2nN1PP1/2r3P1/6K1 b - - 0 40';
const puzzlePgn = `
[White "?"]
[Black "Petrosian, Tigran V"]
[BlackElo "2600"]
[BlackTitle "GM"]
[Result "0-1"]
[FEN "${puzzleFen}"]
[SetUp "1"]

40... Rxg2+ 41. Kxg2 0-1
`;

test.describe('materialDiff', () => {
  test('counts the pieces on the board of a position set up from a FEN', () => {
    expect(materialDiff(puzzleFen)).toEqual({
      w: { pieces: ['p', 'p', 'p'], score: 3 },
      b: { pieces: [], score: 0 },
    });
  });

  test('lists the surplus of each side and the points of the side ahead', () => {
    // White: rook and pawn (6); black: knight and two pawns (5)
    expect(materialDiff('4k3/pp6/2n5/8/8/8/P7/R3K3 w - - 0 1')).toEqual({
      w: { pieces: ['r'], score: 1 },
      b: { pieces: ['n', 'p'], score: 0 },
    });
    // White: bishop; black: knight
    expect(materialDiff('4k3/8/2n5/8/8/8/8/2B1K3 w - - 0 1')).toEqual({
      w: { pieces: ['b'], score: 0 },
      b: { pieces: ['n'], score: 0 },
    });
    // White: queen; black: two rooks
    expect(materialDiff('r3k2r/8/8/8/8/8/8/3QK3 w - - 0 1')).toEqual({
      w: { pieces: ['q'], score: 0 },
      b: { pieces: ['r', 'r'], score: 1 },
    });
  });

  test('is level at the start', () => {
    expect(materialDiff('rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1')).toEqual({
      w: { pieces: [], score: 0 },
      b: { pieces: [], score: 0 },
    });
  });
});

test.describe('playerInfo', () => {
  test('reads the name, title, rating and result of each side', () => {
    const tags = { White: 'Bannik, Anatoly', WhiteElo: 2450, Black: 'Petrosian, Tigran V', BlackTitle: 'GM', Result: '0-1' };
    expect(playerInfo(tags, 'w')).toEqual({ name: 'Bannik, Anatoly', title: '', elo: '2450', result: '0' });
    expect(playerInfo(tags, 'b')).toEqual({ name: 'Petrosian, Tigran V', title: 'GM', elo: '', result: '1' });
    expect(playerInfo({ Result: '1/2-1/2' }, 'b').result).toBe('½');
  });

  test('writes NN for a missing or unknown name, and drops unknown values', () => {
    expect(playerInfo(undefined, 'w')).toEqual({ name: 'NN', title: '', elo: '', result: '' });
    expect(playerInfo({ White: '?', WhiteElo: '?', WhiteTitle: '-', Result: '*' }, 'w')).toEqual({
      name: 'NN',
      title: '',
      elo: '',
      result: '',
    });
    expect(playerInfo({ Black: '  ', BlackElo: 0 }, 'b')).toEqual({ name: 'NN', title: '', elo: '', result: '' });
  });

  test('swaps the players when a mirrored puzzle inverts the colours', () => {
    const { parsedPgn } = parsePGN(puzzlePgn);
    mirrorPGN(parsedPgn, 'invert');
    const tags = parsedPgn.tags as Record<string, unknown>;
    expect(playerInfo(tags, 'w')).toEqual({ name: 'Petrosian, Tigran V', title: 'GM', elo: '2600', result: '1' });
    expect(playerInfo(tags, 'b')).toEqual({ name: 'NN', title: '', elo: '', result: '0' });
  });
});

async function load(page: Page, config: Record<string, unknown> = {}, boardMode = 'Puzzle') {
  await page.addInitScript(
    ({ pgn, config, boardMode }) => {
      (window as any).USER_CONFIG = { timer: 0, ...config };
      (window as any).DEV_OVERRIDES = { boardMode, pgn };
    },
    { pgn: puzzlePgn, config, boardMode },
  );
  await page.goto('/');
  await expect.poll(() => page.evaluate(() => !!(window as any).gameStore?.cg)).toBe(true);
}

test('shows each player and their material next to their side', async ({ page }) => {
  await load(page);
  // Black plays, so black is at the bottom and white at the top
  const top = page.locator('.player-bar.top');
  const bottom = page.locator('.player-bar.bottom');

  await expect(top).toHaveAttribute('data-color', 'w');
  await expect(top.locator('.name')).toHaveText('NN');
  await expect(top.locator('.elo')).toHaveCount(0);
  await expect(top.locator('.piece[data-role="p"]')).toHaveCount(3);
  await expect(top.locator('.score')).toHaveText('+3');

  await expect(bottom).toHaveAttribute('data-color', 'b');
  await expect(bottom.locator('.title')).toHaveText('GM');
  await expect(bottom.locator('.name')).toHaveText('Petrosian, Tigran V');
  await expect(bottom.locator('.elo')).toHaveText('2600');
  await expect(bottom.locator('.piece')).toHaveCount(0);
  await expect(bottom.locator('.score')).toHaveCount(0);

  // The result would give the puzzle away
  await expect(page.locator('.player-bar .result')).toHaveCount(0);

  // 40... Rxg2+ 41. Kxg2: white is a rook and two pawns up, and the puzzle is solved
  await page.evaluate(() => (window as any).gameStore.cg.move('c2', 'g2'));
  await expect(top.locator('.score')).toHaveText('+7');
  await expect(top.locator('.piece')).toHaveCount(3);
  await expect(top.locator('.piece[data-role="r"]')).toHaveCount(1);
  await expect(bottom.locator('.result')).toHaveText('1');
  await expect(top.locator('.result')).toHaveText('0');
});

test('shows the result on the back', async ({ page }) => {
  await load(page, {}, 'Viewer');
  await expect(page.locator('.player-bar[data-color="b"] .result')).toHaveText('1');
  await expect(page.locator('.player-bar[data-color="w"] .result')).toHaveText('0');
});

test('the bars sit above and below the board, inside the screen', async ({ page }) => {
  await page.setViewportSize({ width: 1400, height: 700 });
  await load(page, { boardSize: 1000 });

  await expect(async () => {
    const board = (await page.locator('.board-wrapper').boundingBox())!;
    const top = (await page.locator('.player-bar.top').boundingBox())!;
    const bottom = (await page.locator('.player-bar.bottom').boundingBox())!;
    expect(Math.round(top.y + top.height)).toBe(Math.round(board.y));
    expect(Math.round(bottom.y)).toBe(Math.round(board.y + board.height));
    expect(Math.round(top.width)).toBe(Math.round(board.width));
    expect(bottom.y + bottom.height).toBeLessThanOrEqual(700);
    expect(Math.round(board.width)).toBe(Math.round(board.height));
  }).toPass();
});

test('the board stays centred on a phone in portrait', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await load(page);

  await expect(async () => {
    const board = (await page.locator('.board-wrapper').boundingBox())!;
    expect(Math.round(board.width)).toBe(374);
    expect(Math.round(board.x)).toBe(8);
  }).toPass();
});

test('can be turned off', async ({ page }) => {
  await load(page, { playerBars: false });
  await expect(page.locator('.board-wrapper')).toBeVisible();
  await expect(page.locator('.player-bar')).toHaveCount(0);
});
