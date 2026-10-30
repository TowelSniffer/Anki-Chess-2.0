import { test, expect, type Page } from '@playwright/test';

test.skip(({ browserName }) => browserName !== 'chromium', 'Logic tests only need Chromium');

// Issue #115: after 24...Kf7 both Qh7# (the PGN's answer) and Rh7# mate
const matePgn = `
[FEN "3brrk1/p3q2p/b1p1p1N1/2P1Pp1Q/3Pp3/4P1PR/P6P/R1B3K1 b - - 0 23"]
[SetUp "1"]

23... hxg6 24. Qh8+ Kf7 25. Qh7# *
`;

const store = (page: Page, read: (s: any) => unknown) =>
  page.evaluate(`(${read.toString()})(window.gameStore)`);

// The front plays 23...hxg6 (Flip PGN); play 24. Qh8+ and wait for 24...Kf7
async function reachLastMove(page: Page) {
  // The mode comes from sessionStorage so a reload can open the back of the same card
  await page.addInitScript((pgn) => {
    (window as any).USER_CONFIG = { flipBoard: true, timer: 0, handicap: 1, mirror: false };
    (window as any).DEV_OVERRIDES = { boardMode: sessionStorage.getItem('test_mode') || 'Puzzle', pgn };
  }, matePgn);
  await page.goto('/', { waitUntil: 'commit' });

  await expect.poll(() => store(page, (s) => s?.currentMove?.san)).toBe('hxg6');
  await page.evaluate(() => (window as any).gameStore.cg.move('h5', 'h8'));
  await expect.poll(() => store(page, (s) => s.currentMove?.san)).toBe('Kf7');
}

test('another checkmate than the PGN solves the puzzle', async ({ page }) => {
  await reachLastMove(page);
  await page.evaluate(() => (window as any).gameStore.cg.move('h3', 'h7'));

  await expect.poll(() => store(page, (s) => s.currentMove?.san)).toBe('Rh7#');
  expect(await store(page, (s) => s.isPuzzleComplete)).toBe(true);
  expect(await store(page, (s) => s.hasMadeMistake)).toBe(false);
  expect(await store(page, (s) => s.puzzleScore)).not.toBe('fail');
});

test('a move that does not mate is still wrong', async ({ page }) => {
  await reachLastMove(page);
  await page.evaluate(() => (window as any).gameStore.cg.move('h3', 'h6'));

  await expect.poll(() => store(page, (s) => s.errorCount)).toBe(1);
  expect(await store(page, (s) => s.isPuzzleComplete)).toBe(false);
  expect(await store(page, (s) => s.currentMove?.san)).toBe('Kf7');
});

test('the back shows the PGN mate when the front mated another way', async ({ page }) => {
  await reachLastMove(page);
  await page.evaluate(() => (window as any).gameStore.cg.move('h3', 'h7'));
  await expect.poll(() => store(page, (s) => s.isPuzzleComplete)).toBe(true);

  // Anki renders the back as a new page: the stored path points to Rh7#, which the PGN lacks
  await page.evaluate(() => sessionStorage.setItem('test_mode', 'Viewer'));
  await page.reload({ waitUntil: 'commit' });

  await expect.poll(() => store(page, (s) => s?.boardMode)).toBe('Viewer');
  await expect.poll(() => store(page, (s) => s.currentMove?.san)).toBe('Qh7#');
});
