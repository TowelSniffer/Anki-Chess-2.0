import { test, expect, type Page } from '@playwright/test';

test.skip(({ browserName }) => browserName !== 'chromium', 'Layout logic only needs Chromium');

async function load(page: Page, boardMode: string, config: object = {}, pgn?: string) {
  await page.addInitScript(
    ({ boardMode, config, pgn }) => {
      (window as any).USER_CONFIG = config;
      (window as any).DEV_OVERRIDES = { boardMode, ...(pgn ? { pgn } : {}) };
    },
    { boardMode, config, pgn },
  );
  await page.goto('/', { waitUntil: 'commit' });
  await expect(page.locator('#board piece').first()).toBeVisible({ timeout: 10000 });
}

test('files on the board are lowercase, as in the notation', async ({ page }) => {
  await load(page, 'Viewer');
  const coord = page.locator('coords.files coord').first();
  await expect(coord).toHaveText(/^[a-h]$/);
  await expect(coord).toHaveCSS('text-transform', 'none');
});

test("every button in the back's row says what it does", async ({ page }) => {
  await load(page, 'Viewer');
  const buttons = await page.locator('#buttons-container button').all();
  expect(buttons.length).toBeGreaterThan(5);
  for (const button of buttons) {
    expect(await button.getAttribute('aria-label')).toBeTruthy();
    expect(await button.getAttribute('title')).toBeTruthy();
  }
});

test('a side without a move shows a quiet ellipsis', async ({ page }) => {
  await load(page, 'Viewer', {}, '[FEN "8/8/8/8/8/k7/8/K6R b - - 0 1"]\n[SetUp "1"]\n\n1... Kb3 2. Rb1+ *');
  const nullMove = page.locator('.nullMove').first();
  await expect(nullMove).toHaveText('…');
});

test('the text on the card reads from the left', async ({ page }) => {
  await load(page, 'Viewer');
  const box = (await page.locator('#commentBox').boundingBox())!;
  const text = (await page.locator('#textField').boundingBox())!;
  expect(text.x - box.x).toBeLessThan(3);
});

test('all of the card uses one font', async ({ page }) => {
  await load(page, 'Viewer');
  const fontOf = (selector: string) =>
    page.locator(selector).first().evaluate((el) => getComputedStyle(el).fontFamily);
  expect(await fontOf('.player-bar')).toContain('system-ui');
  expect(await fontOf('#textField')).toBe(await fontOf('.player-bar'));
});

test("the card's page styles don't outlive the card", async ({ page }) => {
  await load(page, 'Viewer');
  const styles = () =>
    page.evaluate(() => ({
      color: getComputedStyle(document.documentElement).color,
      font: getComputedStyle(document.body).fontFamily,
    }));
  const onCard = await styles();
  expect(onCard.color).toBe('rgb(255, 255, 255)');
  expect(onCard.font).toContain('system-ui');

  // The reviewer page outlives the card: the next card replaces the AnkiChess root
  await page.evaluate(() => document.getElementById('chessRs-root')!.remove());
  const after = await styles();
  expect(after.color).not.toBe('rgb(255, 255, 255)');
  expect(after.font).not.toContain('system-ui');
});

test.describe('unsaved settings', () => {
  const asCard = (page: Page) =>
    page.addInitScript(() => {
      (window as any).CARD_CONFIG = { modelName: 'AnkiChess', cardName: 'Card 1' };
    });
  const change = (page: Page) =>
    page.evaluate(() => {
      (window as any).gameStore.config.muteAudio = !(window as any).gameStore.config.muteAudio;
    });

  test('a dot on the menu shows them', async ({ page }) => {
    await asCard(page);
    await load(page, 'Viewer');
    const button = page.locator('#global-settings button');
    await expect(page.locator('.unsaved-dot')).toHaveCount(0);
    await expect(button).toHaveAttribute('aria-label', 'Settings');

    await change(page);
    await expect(page.locator('.unsaved-dot')).toHaveCount(1);
    await expect(button).toHaveAttribute('aria-label', 'Settings (unsaved changes)');

    await change(page);
    await expect(page.locator('.unsaved-dot')).toHaveCount(0);
  });

  test('a template saved before an option existed has nothing to save', async ({ page }) => {
    await asCard(page);
    await load(page, 'Viewer', { animationTime: 200 }); // only some of the options
    await page.waitForTimeout(300);
    await expect(page.locator('.unsaved-dot')).toHaveCount(0);
  });

  test('no dot where settings cannot be saved', async ({ page }) => {
    await load(page, 'Viewer');
    await change(page);
    await page.waitForTimeout(100);
    await expect(page.locator('.unsaved-dot')).toHaveCount(0);
  });
});

test.describe('on a touch screen', () => {
  test.use({ hasTouch: true, isMobile: true, viewport: { width: 360, height: 740 } });

  test("a tapped button doesn't stay highlighted", async ({ page }) => {
    await load(page, 'Viewer');
    expect(await page.evaluate(() => matchMedia('(hover: hover)').matches)).toBe(false);
    const button = page.locator('#navForward');
    const colour = () => button.evaluate((el) => getComputedStyle(el).backgroundColor);
    const before = await colour();
    await button.tap();
    await page.waitForTimeout(400);
    expect(await colour()).toBe(before);
  });
});
