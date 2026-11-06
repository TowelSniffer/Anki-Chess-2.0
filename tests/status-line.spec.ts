import { test, expect, type Page } from '@playwright/test';

test.skip(({ browserName }) => browserName !== 'chromium', 'Logic tests only need Chromium');

// The opponent plays 23...hxg6, then White has 24. Qh8+ Kf7 25. Qh7#
const puzzlePgn = `[FEN "3brrk1/p3q2p/b1p1p1N1/2P1Pp1Q/3Pp3/4P1PR/P6P/R1B3K1 b - - 0 23"]
[SetUp "1"]

23... hxg6 24. Qh8+ Kf7 25. Qh7# *`;

const base = {
  flipBoard: true,
  timer: 0,
  handicap: 1,
  mirror: false,
  randomOrientation: false,
  refutation: false,
  strictScoring: false,
};

async function load(page: Page, config: object = {}, boardMode = 'Puzzle', pgn = puzzlePgn) {
  await page.addInitScript(
    ({ config, boardMode, pgn }) => {
      (window as any).USER_CONFIG = config;
      (window as any).DEV_OVERRIDES = { boardMode, pgn };
    },
    { config: { ...base, ...config }, boardMode, pgn },
  );
  await page.goto('/', { waitUntil: 'commit' });
  await expect(page.locator('#board piece').first()).toBeVisible({ timeout: 10000 });
}

const firstMovePlayed = (page: Page) =>
  expect.poll(() => page.evaluate(() => (window as any).gameStore.currentMove?.san)).toBe('hxg6');

const move = (page: Page, from: string, to: string) =>
  page.evaluate(([from, to]) => (window as any).gameStore.cg.move(from, to), [from, to]);

// A wrong move and back on the board, ready for the next one
async function wrongMove(page: Page) {
  await move(page, 'h5', 'g4');
  await page.waitForTimeout(400);
}

const message = (page: Page) => page.locator('.player-bar.bottom .message');

test('says whose move it is', async ({ page }) => {
  await load(page);
  await firstMovePlayed(page);
  await expect(message(page)).toHaveText('White to move');
  await expect(page.locator('.player-bar.bottom .side.w')).toHaveCount(1);
});

test("says Black's move too", async ({ page }) => {
  await load(page, { flipBoard: false });
  await expect(message(page)).toHaveText('Black to move');
  await expect(page.locator('.player-bar.bottom .side.b')).toHaveCount(1);
});

test('a random orientation keeps the side hidden', async ({ page }) => {
  await load(page, { randomOrientation: true });
  await firstMovePlayed(page);
  await expect(message(page)).toHaveText('Your move');
  await expect(page.locator('.player-bar.bottom .side')).toHaveCount(0);
});

test('a study says whose move it is as the sides take turns', async ({ page }) => {
  await load(page, { flipBoard: false, playBothSides: true }, 'Puzzle', '1. e4 e5 2. Nf3 *');
  await expect(message(page)).toHaveText('White to move');
  await move(page, 'e2', 'e4');
  await expect(message(page)).toHaveText('Black to move');
});

test('counts the tries left, then shows the solution', async ({ page }) => {
  await load(page);
  await firstMovePlayed(page);

  await wrongMove(page);
  await expect(message(page)).toHaveText('Not the move · 1 try left');

  await wrongMove(page);
  await expect(message(page)).toHaveText('Showing the solution');
  // 24. Qh8+ Kf7 are played, and it's the player's move again
  await expect(message(page)).toHaveText('White to move');
});

test('confirms a correct move until the next one', async ({ page }) => {
  await load(page);
  await firstMovePlayed(page);
  await move(page, 'h5', 'h8');
  await expect(message(page)).toHaveText('Correct · keep going');
  await expect.poll(() => page.evaluate(() => (window as any).gameStore.currentMove?.san)).toBe('Kf7');
  await expect(message(page)).toHaveText('Correct · keep going');
});

async function solve(page: Page) {
  await move(page, 'h5', 'h8');
  await expect.poll(() => page.evaluate(() => (window as any).gameStore.currentMove?.san)).toBe('Kf7');
  await page.waitForTimeout(300);
  await move(page, 'h8', 'h7');
}

test('the result is in words: perfect', async ({ page }) => {
  await load(page);
  await firstMovePlayed(page);
  await solve(page);
  await expect(message(page)).toHaveText('Perfect');
});

test('the result is in words: solved after a mistake', async ({ page }) => {
  await load(page);
  await firstMovePlayed(page);
  await wrongMove(page);
  await solve(page);
  await expect(message(page)).toHaveText('Solved');
});

test('the result is in words: failed', async ({ page }) => {
  await load(page, { strictScoring: true });
  await firstMovePlayed(page);
  await wrongMove(page);
  await solve(page);
  await expect(message(page)).toHaveText('Failed');
});

test('hints are named as they go', async ({ page }) => {
  await load(page);
  await firstMovePlayed(page);
  await page.locator('#hint-button').click();
  await expect(message(page)).toHaveText('Hint: move this piece');
  await page.locator('#hint-button').click();
  await expect(message(page)).toHaveText('Hint: play this move');
});

test('the clock is in numbers, and off the border', async ({ page }) => {
  await load(page, { timer: 30000 });
  await firstMovePlayed(page);
  await expect(page.locator('.clock .time')).toHaveText(/^0:(30|2\d)$/);
  await expect(page.locator('.clock .chess-clock')).toBeVisible();
  await expect(page.locator('.clock.low')).toHaveCount(0);
  await expect(page.locator('.board-wrapper.timerMode')).toHaveCount(0);
  await expect(page.locator('.eval-track')).toHaveCount(0);

  await solve(page);
  await expect(page.locator('.clock')).toHaveCount(0);
});

test('the clock warns near the end', async ({ page }) => {
  await load(page, { timer: 4000 });
  await firstMovePlayed(page);
  await expect(page.locator('.clock.low')).toHaveCount(1);
});

const handAngle = (page: Page, nth: number) =>
  page.locator('.chess-clock .hand').nth(nth).evaluate((el) => (el as HTMLElement).style.transform);

test("the running side's hand ticks, and the other one waits", async ({ page }) => {
  await load(page, { timer: 30000 });
  await firstMovePlayed(page);
  const left = await handAngle(page, 0);
  const right = await handAngle(page, 1);
  await expect.poll(() => handAngle(page, 0)).not.toBe(left);
  expect(await handAngle(page, 1)).toBe(right);
});

test("the running side's button is up, and they swap with the turn", async ({ page }) => {
  await load(page, { timer: 30000 });
  await firstMovePlayed(page);
  const down = (nth: number) =>
    page.locator('.chess-clock .button').nth(nth).evaluate((el) => el.classList.contains('down'));
  // White to move: its side is the left one
  await expect.poll(() => down(0)).toBe(false);
  expect(await down(1)).toBe(true);

  await move(page, 'h5', 'h8');
  await expect.poll(() => down(0)).toBe(true);
  expect(await down(1)).toBe(false);
  await expect.poll(() => down(0)).toBe(false);
});

test('the clock beats near the end, and stays at 0:00 when time runs out', async ({ page }) => {
  await load(page, { timer: 2000 });
  await expect(page.locator('.chess-clock.low')).toHaveCount(1);

  await expect(page.locator('.chess-clock.flagged')).toHaveCount(1, { timeout: 6000 });
  await expect(page.locator('.chess-clock.low')).toHaveCount(0);
  await expect(page.locator('.clock .time')).toHaveText('0:00');
});

test('a real name stays next to the status, and NN does not', async ({ page }) => {
  const pgn = `[White "Morphy, Paul"]\n[Black "Duke Karl"]\n\n1. e4 e5 2. Nf3 *`;
  await load(page, { flipBoard: false }, 'Puzzle', pgn);
  await expect(page.locator('.player-bar.bottom .name')).toHaveText('Morphy, Paul');

  await page.close();
  const noNames = await page.context().newPage();
  await load(noNames);
  await expect(noNames.locator('.player-bar.bottom .name')).toHaveCount(0);
  await expect(noNames.locator('.player-bar.top .name')).toHaveText('NN');
});

test('the back shows the players, without a status', async ({ page }) => {
  await load(page, {}, 'Viewer');
  await expect(page.locator('.status-line')).toHaveCount(0);
  await expect(page.locator('.player-bar.bottom .name')).toHaveText('NN');
});

test('without the player bars the status goes with the tools, floating', async ({ page }) => {
  await load(page, { playerBars: false, frontText: false, frontComments: false });
  await firstMovePlayed(page);
  await expect(page.locator('.player-bar')).toHaveCount(0);
  await expect(page.locator('#floating-tools .status-line .message')).toHaveText('White to move');
});

test('without the player bars the status goes with the tools, in the comment box', async ({ page }) => {
  await load(page, { playerBars: false, frontText: true, frontComments: false });
  await firstMovePlayed(page);
  await expect(page.locator('#commentBox #buttons-container .status-line .message')).toHaveText(
    'White to move',
  );
});

test('the status fits its bar on a small phone', async ({ page }) => {
  await page.setViewportSize({ width: 360, height: 740 });
  await load(page, { timer: 30000 });
  await firstMovePlayed(page);
  await wrongMove(page);
  const bar = (await page.locator('.player-bar.bottom').boundingBox())!;
  const clock = (await page.locator('.clock').boundingBox())!;
  const text = (await message(page).boundingBox())!;
  expect(clock.x + clock.width).toBeLessThanOrEqual(bar.x + bar.width);
  expect(text.x + text.width).toBeLessThanOrEqual(clock.x);
});
