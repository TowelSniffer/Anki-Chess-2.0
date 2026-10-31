import { test, expect, type Page } from '@playwright/test';

test.skip(({ browserName }) => browserName !== 'chromium', 'Logic tests only need Chromium');

// White solves: 1. e4, then 2. Nf3 after the reply
const pgn = '1. e4 e5 2. Nf3 Nc6 *';

const store = (page: Page, read: (s: any) => unknown) =>
  page.evaluate(`(${read.toString()})(window.gameStore)`);

const storedGrade = (page: Page) =>
  page.evaluate(() => JSON.parse(sessionStorage.getItem('chess_puzzle_grade') ?? 'null'));

// desktop: a stub of Anki desktop's pycmd records what the card sends
async function load(page: Page, { config = {}, desktop = false } = {}) {
  await page.addInitScript(
    ({ config, pgn, desktop }) => {
      (window as any).USER_CONFIG = { timer: 0, handicap: 1, mirror: false, ...config };
      // The mode comes from sessionStorage so a reload can open the back of the same card
      (window as any).DEV_OVERRIDES = { boardMode: sessionStorage.getItem('test_mode') || 'Puzzle', pgn };
      if (desktop) {
        (window as any).sent = [];
        (window as any).pycmd = (cmd: string) => (window as any).sent.push(cmd);
      }
    },
    { config, pgn, desktop },
  );
  await page.goto('/', { waitUntil: 'commit' });
  await expect.poll(() => store(page, (s) => !!s?.cg)).toBe(true);
}

async function play(page: Page, orig: string, dest: string, reply: string) {
  await page.evaluate(([o, d]) => (window as any).gameStore.cg.move(o, d), [orig, dest]);
  await expect.poll(() => store(page, (s) => s.currentMove?.san)).toBe(reply);
}

async function solve(page: Page) {
  await play(page, 'e2', 'e4', 'e5');
  await play(page, 'g1', 'f3', 'Nc6');
  await expect.poll(() => store(page, (s) => s.isPuzzleComplete)).toBe(true);
}

// Anki renders the back as a new page, reading what the front stored
async function showBack(page: Page) {
  await page.evaluate(() => sessionStorage.setItem('test_mode', 'Viewer'));
  await page.reload({ waitUntil: 'commit' });
  await expect.poll(() => store(page, (s) => s?.boardMode)).toBe('Viewer');
}

const easeSent = (page: Page) =>
  page.evaluate(() => ((window as any).sent as string[]).filter((c) => c.startsWith('ease')));

test.describe('the suggested button', () => {
  test('is Again until the puzzle is solved, then Good', async ({ page }) => {
    await load(page);
    expect(await storedGrade(page)).toMatchObject({ grade: 1, reason: 'unsolved' });
    await solve(page);
    await expect.poll(() => storedGrade(page)).toMatchObject({ grade: 3, reason: 'solved' });
  });

  test('is Hard after a hint', async ({ page }) => {
    await load(page);
    await page.locator('#hint-button').click();
    await solve(page);
    await expect.poll(() => storedGrade(page)).toMatchObject({ grade: 2, reason: 'hint' });
  });

  test('is Hard after a mistake', async ({ page }) => {
    await load(page);
    await page.evaluate(() => (window as any).gameStore.cg.move('d2', 'd4'));
    await expect.poll(() => store(page, (s) => s.errorCount)).toBe(1);
    await page.waitForTimeout(500); // the wrong move is taken back
    await solve(page);
    await expect.poll(() => storedGrade(page)).toMatchObject({ grade: 2, reason: 'mistake' });
  });

  test('is Again for a failed puzzle', async ({ page }) => {
    await load(page, { config: { strictScoring: true } });
    await page.evaluate(() => (window as any).gameStore.cg.move('d2', 'd4'));
    await expect.poll(() => storedGrade(page)).toMatchObject({ grade: 1, reason: 'failed' });
  });

  test('is Easy when solved within Easy Time', async ({ page }) => {
    await load(page, { config: { easyTime: 60 } });
    await solve(page);
    await expect.poll(() => storedGrade(page)).toMatchObject({ grade: 4, reason: 'fast' });
  });
});

test('the back shows the suggestion', async ({ page }) => {
  await load(page);
  await solve(page);
  await showBack(page);

  const banner = page.locator('#grade-suggestion');
  await expect(banner).toContainText('Suggested:');
  await expect(banner).toContainText('Good');
  await expect(banner).toContainText('solved in');
  // Without Anki desktop it can't answer: not a button
  expect(await banner.evaluate((el) => el.tagName)).toBe('DIV');
});

test('the back of an unsolved puzzle suggests Again', async ({ page }) => {
  await load(page);
  await showBack(page);
  await expect(page.locator('#grade-suggestion')).toContainText('Again');
  await expect(page.locator('#grade-suggestion')).toContainText('not solved');
});

test('on Anki desktop a click answers, once', async ({ page }) => {
  await load(page, { desktop: true });
  await solve(page);
  await showBack(page);

  const banner = page.locator('button#grade-suggestion');
  await banner.click();
  await banner.click({ force: true });
  expect(await easeSent(page)).toEqual(['ease3']);
  await expect(banner).toContainText('answered');
});

test('Answer mode answers by itself after the countdown', async ({ page }) => {
  await load(page, { config: { autoGrade: 'answer' }, desktop: true });
  await solve(page);
  await showBack(page);

  await expect(page.locator('#grade-suggestion')).toContainText('answering in');
  await expect.poll(() => easeSent(page), { timeout: 6000 }).toEqual(['ease3']);
});

test('in Answer mode a click cancels the countdown', async ({ page }) => {
  await load(page, { config: { autoGrade: 'answer' }, desktop: true });
  await solve(page);
  await showBack(page);

  await expect(page.locator('#grade-suggestion')).toContainText('answering in');
  await page.mouse.click(5, 5);
  await page.waitForTimeout(4000);
  expect(await easeSent(page)).toEqual([]);
  await expect(page.locator('#grade-suggestion')).toContainText('click to answer');
});

test('no suggestion with the option off', async ({ page }) => {
  await load(page, { config: { autoGrade: 'off' } });
  await solve(page);
  await showBack(page);
  await expect(page.locator('#grade-suggestion')).toHaveCount(0);
});

test('no suggestion on a back whose front was not a puzzle', async ({ page }) => {
  await page.addInitScript((pgn) => {
    (window as any).DEV_OVERRIDES = { boardMode: 'Viewer', pgn };
  }, pgn);
  await page.goto('/', { waitUntil: 'commit' });
  await expect.poll(() => store(page, (s) => s?.boardMode)).toBe('Viewer');
  await expect(page.locator('#grade-suggestion')).toHaveCount(0);
});

test('the back shown in the same page keeps the suggestion', async ({ page }) => {
  await load(page);
  await page.locator('#hint-button').click();
  await solve(page);
  // Some apps keep the page and only switch the card to its back
  await page.evaluate(() => (window as any).updateChessMode('Viewer'));

  await expect(page.locator('#grade-suggestion')).toContainText('Hard');
  await expect(page.locator('#grade-suggestion')).toContainText('solved with a hint');
});
