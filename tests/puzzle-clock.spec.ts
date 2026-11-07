import { test, expect, type Page } from '@playwright/test';

test.skip(({ browserName }) => browserName !== 'chromium', 'Logic tests only need Chromium');

// The opponent plays 23...hxg6, then White has 24. Qh8+ Kf7 25. Qh7#
const puzzlePgn = `[FEN "3brrk1/p3q2p/b1p1p1N1/2P1Pp1Q/3Pp3/4P1PR/P6P/R1B3K1 b - - 0 23"]
[SetUp "1"]

23... hxg6 24. Qh8+ Kf7 25. Qh7# *`;

const base = {
  flipBoard: true,
  timer: 30000,
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

const san = (page: Page) => page.evaluate(() => (window as any).gameStore.currentMove?.san);

const firstMovePlayed = (page: Page) => expect.poll(() => san(page)).toBe('hxg6');

const move = (page: Page, from: string, to: string) =>
  page.evaluate(([from, to]) => (window as any).gameStore.cg.move(from, to), [from, to]);

async function solve(page: Page) {
  await move(page, 'h5', 'h8');
  await expect.poll(() => san(page)).toBe('Kf7');
  await page.waitForTimeout(300);
  await move(page, 'h8', 'h7');
}

test('on the front the bottom bar has the player and the clock, without status texts', async ({ page }) => {
  const pgn = `[White "Morphy, Paul"]\n[WhiteElo "2690"]\n[Black "Duke Karl"]\n\n1. e4 e5 2. Nf3 *`;
  await load(page, { flipBoard: false }, 'Puzzle', pgn);
  const bottom = page.locator('.player-bar.bottom');
  await expect(bottom.locator('.name')).toHaveText('Morphy, Paul');
  await expect(bottom.locator('.elo')).toHaveText('2690');
  await expect(bottom.locator('.clock')).toBeVisible();
  expect((await bottom.innerText()).replace(/\s+/g, ' ')).toMatch(/^Morphy, Paul 2690 0:(30|2\d)$/);

  await move(page, 'e2', 'e4');
  await expect.poll(() => san(page)).not.toBeUndefined();
  expect((await bottom.innerText()).replace(/\s+/g, ' ')).not.toMatch(/correct|move|solved/i);
});

test('a player without a name is NN on both bars', async ({ page }) => {
  await load(page);
  await expect(page.locator('.player-bar.top .name')).toHaveText('NN');
  await expect(page.locator('.player-bar.bottom .name')).toHaveText('NN');
});

test('a long name gives way to the clock on a small phone', async ({ page }) => {
  await page.setViewportSize({ width: 360, height: 740 });
  const name = 'Wolfeschlegelsteinhausenbergerdorff, Hubert Blaine von';
  await load(page, { flipBoard: false }, 'Puzzle', `[White "${name}"]\n\n1. e4 e5 2. Nf3 *`);
  const bar = (await page.locator('.player-bar.bottom').boundingBox())!;
  const clock = (await page.locator('.player-bar.bottom .clock').boundingBox())!;
  const text = (await page.locator('.player-bar.bottom .name').boundingBox())!;
  expect(clock.x + clock.width).toBeLessThanOrEqual(bar.x + bar.width);
  expect(text.x + text.width).toBeLessThanOrEqual(clock.x);
});

test('the clock is in numbers, and off the border', async ({ page }) => {
  await load(page);
  await firstMovePlayed(page);
  await expect(page.locator('.clock .time')).toHaveText(/^0:(30|2\d)$/);
  await expect(page.locator('.clock .chess-clock')).toBeVisible();
  await expect(page.locator('.clock.low')).toHaveCount(0);
  await expect(page.locator('.board-wrapper.timerMode')).toHaveCount(0);
  await expect(page.locator('.eval-track')).toHaveCount(0);

  await solve(page);
  await expect(page.locator('.clock')).toHaveCount(0);
});

test('no clock without a timer, or on the back', async ({ page }) => {
  await load(page, { timer: 0 });
  await firstMovePlayed(page);
  await expect(page.locator('.clock')).toHaveCount(0);
  await page.close();

  const back = await page.context().newPage();
  await load(back, {}, 'Viewer');
  await expect(back.locator('.clock')).toHaveCount(0);
  await expect(back.locator('.player-bar.bottom .name')).toHaveText('NN');
});

const handAngle = (page: Page, nth: number) =>
  page.locator('.chess-clock .hand').nth(nth).evaluate((el) => (el as HTMLElement).style.transform);

test("the running side's hand ticks, and the other one waits", async ({ page }) => {
  await load(page);
  await firstMovePlayed(page);
  const left = await handAngle(page, 0);
  const right = await handAngle(page, 1);
  await expect.poll(() => handAngle(page, 0)).not.toBe(left);
  expect(await handAngle(page, 1)).toBe(right);
});

test("the running side's button is up, and they swap with the turn", async ({ page }) => {
  await load(page);
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

test('without the player bars the clock goes with the tools, floating', async ({ page }) => {
  await load(page, { playerBars: false, frontText: false, frontComments: false });
  await firstMovePlayed(page);
  await expect(page.locator('.player-bar')).toHaveCount(0);
  await expect(page.locator('#floating-tools .clock.standalone')).toBeVisible();
});

test('without the player bars the clock goes with the tools, in the comment box', async ({ page }) => {
  await load(page, { playerBars: false, frontText: true, frontComments: false });
  await firstMovePlayed(page);
  await expect(page.locator('#commentBox #buttons-container .clock.standalone')).toBeVisible();
});
