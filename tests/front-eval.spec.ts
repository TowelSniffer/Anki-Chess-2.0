import { test, expect, type Page } from '@playwright/test';

test.skip(({ browserName }) => browserName !== 'chromium', 'Logic tests only need Chromium');

// The opponent plays 23...hxg6, then White has 24. Qh8+ Kf7 25. Qh7#. White is much better.
const puzzlePgn = `[FEN "3brrk1/p3q2p/b1p1p1N1/2P1Pp1Q/3Pp3/4P1PR/P6P/R1B3K1 b - - 0 23"]
[SetUp "1"]

23... hxg6 24. Qh8+ Kf7 25. Qh7# *`;

const base = { flipBoard: true, timer: 0, handicap: 1, mirror: false, randomOrientation: false, refutation: false };

async function load(page: Page, config: object, pgn = puzzlePgn, boardMode = 'Puzzle') {
  await page.addInitScript(
    ({ config, pgn, boardMode }) => {
      (window as any).USER_CONFIG = config;
      (window as any).DEV_OVERRIDES = { boardMode, pgn };
    },
    { config: { ...base, ...config }, pgn, boardMode },
  );
  await page.goto('/', { waitUntil: 'commit' });
  await expect(page.locator('#board piece').first()).toBeVisible({ timeout: 10000 });
}

const move = (page: Page, from: string, to: string) =>
  page.evaluate(([from, to]) => (window as any).gameStore.cg.move(from, to), [from, to]);

const san = (page: Page) => page.evaluate(() => (window as any).gameStore.currentMove?.san);

const engine = (page: Page) =>
  page.evaluate(() => {
    const { engineStore, fen } = (window as any).gameStore;
    return {
      enabled: engineStore.enabled,
      lines: engineStore.analysisLines.length,
      current: engineStore.evalFen === fen,
      multipv: engineStore.multipv,
      time: engineStore.analysisThinkingTime,
    };
  });

// Stockfish has an eval for the position on the board (it takes a moment to start)
const engineReady = (page: Page) =>
  expect
    .poll(async () => {
      const { lines, current } = await engine(page);
      return lines > 0 && current;
    }, { timeout: 20000 })
    .toBe(true);

test('off by default: no bar and no engine on the front', async ({ page }) => {
  await load(page, {});
  await expect.poll(() => san(page)).toBe('hxg6');
  await page.waitForTimeout(300);
  await expect(page.locator('.board-wrapper.analysisMode')).toHaveCount(0);
  await expect(page.locator('.eval-track')).toHaveCount(0);
  expect((await engine(page)).enabled).toBe(false);
});

test('the border is the eval bar while solving, for the position on the board', async ({ page }) => {
  await load(page, { frontEval: true });
  await expect.poll(() => san(page)).toBe('hxg6');
  await expect(page.locator('.board-wrapper.analysisMode')).toHaveCount(1);
  await expect(page.locator('.eval-track')).toHaveCount(1);
  await engineReady(page);

  // White is winning here, and it's at the bottom: the black part of the bar is small
  await expect
    .poll(
      () =>
        page.locator('.eval-fill').evaluate((el) => {
          const fill = el.getBoundingClientRect();
          const track = el.parentElement!.getBoundingClientRect();
          return (fill.bottom - track.top) / track.height;
        }),
      { timeout: 10000 },
    )
    .toBeLessThan(0.4);

  // The next position gets its own eval
  await move(page, 'h5', 'h8');
  await expect.poll(() => san(page)).toBe('Kf7');
  await engineReady(page);
});

test('it only needs one short line while solving', async ({ page }) => {
  await load(page, { frontEval: true, analysisLines: 3, analysisTime: 10 });
  const { multipv, time } = await engine(page);
  expect(multipv).toBe(1);
  expect(time).toBeLessThanOrEqual(3);
});

test('no arrows or lines give the move away', async ({ page }) => {
  await load(page, { frontEval: true });
  await expect.poll(() => san(page)).toBe('hxg6');
  await engineReady(page);
  const shapes = await page.evaluate(() => (window as any).gameStore.cg.state.drawable.autoShapes);
  expect(shapes.filter((s: { brush?: string }) => s.brush?.startsWith('stockfish'))).toEqual([]);
  await expect(page.locator('.engine-container')).toHaveCount(0);
});

test('the result takes the border back when the puzzle is solved', async ({ page }) => {
  await load(page, { frontEval: true });
  await expect.poll(() => san(page)).toBe('hxg6');
  await move(page, 'h5', 'h8');
  await expect.poll(() => san(page)).toBe('Kf7');
  await page.waitForTimeout(300);
  await move(page, 'h8', 'h7');
  await expect(page.locator('.board-wrapper.analysisMode')).toHaveCount(0);
  await expect(page.locator('.eval-track')).toHaveCount(0);
  await expect.poll(async () => (await engine(page)).enabled).toBe(false);
});

test('it goes back to the position after a refuted move', async ({ page }) => {
  await load(page, { frontEval: true, refutation: true });
  await expect.poll(() => san(page)).toBe('hxg6');
  await engineReady(page);
  await move(page, 'h5', 'g4');
  await expect.poll(() => page.evaluate(() => (window as any).gameStore.isRefuting)).toBe(true);
  await expect
    .poll(() => page.evaluate(() => (window as any).gameStore.isRefuting), { timeout: 10000 })
    .toBe(false);
  await engineReady(page);
  await expect(page.locator('.board-wrapper.analysisMode')).toHaveCount(1);
});

test('a random orientation has no bar', async ({ page }) => {
  await load(page, { frontEval: true, randomOrientation: true });
  await expect.poll(() => san(page)).toBe('hxg6');
  await page.waitForTimeout(300);
  await expect(page.locator('.board-wrapper.analysisMode')).toHaveCount(0);
  expect((await engine(page)).enabled).toBe(false);
});

test("in a study the bar's colours stay with the board's sides", async ({ page }) => {
  await load(page, { frontEval: true, flipBoard: false, playBothSides: true }, '1. e4 e5 2. Nf3 *');
  const bottomColour = () =>
    page
      .locator('.board-wrapper')
      .evaluate((el) => getComputedStyle(el.parentElement!).getPropertyValue('--bar-bottom-color').trim());
  const before = await bottomColour();
  await move(page, 'e2', 'e4');
  await expect.poll(() => san(page)).toBe('e4');
  await page.waitForTimeout(200);
  expect(await bottomColour()).toBe(before);
});

test("the back's engine button works as before, with its arrows", async ({ page }) => {
  await load(page, { frontEval: true, flipBoard: false }, puzzlePgn, 'Viewer');
  expect((await engine(page)).enabled).toBe(false);
  await page.getByRole('button', { name: 'Turn Stockfish On' }).click();
  await expect(page.locator('.board-wrapper.analysisMode')).toHaveCount(1);
  await engineReady(page);
  await expect
    .poll(
      () =>
        page.evaluate(() =>
          (window as any).gameStore.cg.state.drawable.autoShapes.some((s: { brush?: string }) =>
            s.brush?.startsWith('stockfish'),
          ),
        ),
      { timeout: 10000 },
    )
    .toBe(true);
});
