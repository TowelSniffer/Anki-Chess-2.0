import { test, expect, type Page } from '@playwright/test';

test.skip(({ browserName }) => browserName !== 'chromium', 'Logic tests only need Chromium');

// White solves: 1. e4, then 2. Nf3 after the reply
const pgn = '1. e4 e5 2. Nf3 Nc6 *';

const store = (page: Page, read: (s: any) => unknown) =>
  page.evaluate(`(${read.toString()})(window.gameStore)`);

const hintShapes = (page: Page) =>
  store(page, (s) => s.systemShapes.filter((shape: any) => shape.brush === 'yellow'));

async function load(page: Page, config: object = {}, boardMode = 'Puzzle') {
  await page.addInitScript(
    ({ config, boardMode, pgn }) => {
      (window as any).USER_CONFIG = { timer: 0, handicap: 1, mirror: false, ...config };
      (window as any).DEV_OVERRIDES = { boardMode, pgn };
    },
    { config, boardMode, pgn },
  );
  await page.goto('/', { waitUntil: 'commit' });
  await expect.poll(() => store(page, (s) => !!s?.cg)).toBe(true);
}

async function play(page: Page, orig: string, dest: string, reply: string) {
  await page.evaluate(([o, d]) => (window as any).gameStore.cg.move(o, d), [orig, dest]);
  await expect.poll(() => store(page, (s) => s.currentMove?.san)).toBe(reply);
}

test('each hint goes a step further: the piece, the move, then the move is played', async ({ page }) => {
  await load(page);
  const hint = page.locator('#hint-button');

  await hint.click();
  expect(await hintShapes(page)).toEqual([{ orig: 'e2', brush: 'yellow' }]);

  await hint.click();
  expect(await hintShapes(page)).toEqual([{ orig: 'e2', dest: 'e4', brush: 'yellow' }]);

  await hint.click();
  // e4 is played for the player, then the reply
  await expect.poll(() => store(page, (s) => s.currentMove?.san)).toBe('e5');
  expect(await store(page, (s) => s.hasMadeMistake)).toBe(true);
  // The next move starts without a hint
  expect(await store(page, (s) => s.hintLevel)).toBe(0);
  expect(await hintShapes(page)).toEqual([]);
});

test('the H key gives a hint', async ({ page }) => {
  await load(page);
  await page.keyboard.press('h');
  expect(await hintShapes(page)).toEqual([{ orig: 'e2', brush: 'yellow' }]);
});

for (const withHint of [false, true]) {
  test(`a hint rules out a perfect score (hint: ${withHint})`, async ({ page }) => {
    await load(page);
    if (withHint) await page.locator('#hint-button').click();
    await play(page, 'e2', 'e4', 'e5');
    await play(page, 'g1', 'f3', 'Nc6');

    await expect.poll(() => store(page, (s) => s.isPuzzleComplete)).toBe(true);
    expect(await store(page, (s) => s.puzzleScore)).toBe(withHint ? 'pass' : 'perfect');
  });
}

test('a played hint fails the puzzle with strict scoring', async ({ page }) => {
  await load(page, { strictScoring: true });
  const hint = page.locator('#hint-button');
  for (let i = 0; i < 3; i++) await hint.click();

  await expect.poll(() => store(page, (s) => s.currentMove?.san)).toBe('e5');
  expect(await store(page, (s) => s.puzzleScore)).toBe('fail');
});

test('no hint button with the option off', async ({ page }) => {
  await load(page, { hints: false });
  await expect(page.locator('#hint-button')).toHaveCount(0);
  await page.keyboard.press('h');
  expect(await hintShapes(page)).toEqual([]);
});

test('no hint button on the back', async ({ page }) => {
  await load(page, {}, 'Viewer');
  await expect(page.locator('#hint-button')).toHaveCount(0);
});

test('the hint button stays off the board', async ({ page }) => {
  for (const [width, height] of [[360, 740], [740, 360], [1280, 720]]) {
    await page.setViewportSize({ width, height });
    await load(page);
    const button = (await page.locator('#hint-button').boundingBox())!;
    const board = (await page.locator('.board-wrapper').boundingBox())!;
    const overlaps =
      button.x < board.x + board.width &&
      board.x < button.x + button.width &&
      button.y < board.y + board.height &&
      board.y < button.y + button.height;
    expect(overlaps, `${width}x${height}`).toBe(false);
  }
});

test('no hint while a wrong move is refuted', async ({ page }) => {
  await load(page);
  // A slow engine keeps the refutation going
  await page.evaluate(() => {
    (window as any).gameStore.engineStore.requestBestMove = () =>
      new Promise((resolve) => setTimeout(() => resolve('e7e5'), 1500));
  });
  await page.evaluate(() => (window as any).gameStore.cg.move('d2', 'd4'));
  await expect.poll(() => store(page, (s) => s.isRefuting)).toBe(true);

  await expect(page.locator('#hint-button')).toBeDisabled();
  await page.keyboard.press('h');
  expect(await store(page, (s) => s.hintLevel)).toBe(0);
});
