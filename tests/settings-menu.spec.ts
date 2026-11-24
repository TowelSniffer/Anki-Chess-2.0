import { test, expect, type Page } from '@playwright/test';

test.skip(({ browserName }) => browserName !== 'chromium', 'Layout logic only needs Chromium');

type Box = { x: number; y: number; width: number; height: number };

const overlaps = (a: Box, b: Box) =>
  a.x < b.x + b.width && b.x < a.x + a.width && a.y < b.y + b.height && b.y < a.y + a.height;

const inside = (a: Box, outer: { x?: number; y?: number; width: number; height: number }) =>
  a.x >= (outer.x ?? 0) &&
  a.y >= (outer.y ?? 0) &&
  a.x + a.width <= (outer.x ?? 0) + outer.width &&
  a.y + a.height <= (outer.y ?? 0) + outer.height;

const viewports = [
  { name: 'phone portrait', width: 360, height: 740 },
  { name: 'phone landscape', width: 740, height: 360 },
  { name: 'tablet portrait', width: 800, height: 1280 },
  { name: 'desktop', width: 1400, height: 900 },
];

async function load(page: Page, viewport: { width: number; height: number }, config: object, boardMode: string) {
  await page.setViewportSize(viewport);
  await page.addInitScript(
    ({ config, boardMode }) => {
      (window as any).USER_CONFIG = config;
      (window as any).DEV_OVERRIDES = { boardMode };
    },
    { config, boardMode },
  );
  await page.goto('/', { waitUntil: 'commit' });
  await expect(page.locator('#board piece').first()).toBeVisible({ timeout: 10000 });

  // The dev server's render scan toggle (not in Anki builds) sits in a bottom corner too
  await page.evaluate(() => {
    for (const btn of document.querySelectorAll('button[title*="render scanning"]')) {
      let el = btn as HTMLElement;
      while (el.parentElement && getComputedStyle(el).position !== 'fixed') el = el.parentElement;
      el.style.display = 'none';
    }
  });
}

// Off the board and its bars, on screen, a comfortable touch target, and it opens on screen
async function expectUsableMenu(page: Page, vp: { width: number; height: number }) {
  const trigger = page.locator('#global-settings button');
  await expect(async () => {
    const menu = (await trigger.boundingBox())!;
    expect(overlaps(menu, (await page.locator('.board-wrapper').boundingBox())!)).toBe(false);
    for (const bar of await page.locator('.player-bar').all()) {
      expect(overlaps(menu, (await bar.boundingBox())!)).toBe(false);
    }
    expect(inside(menu, vp)).toBe(true);
    expect(menu.width).toBeGreaterThanOrEqual(36);
  }).toPass();

  await trigger.click();
  await expect(async () => {
    expect(inside((await page.locator('.menu').boundingBox())!, vp)).toBe(true);
  }).toPass();
}

for (const vp of viewports) {
  for (const bars of [true, false]) {
    const barsLabel = `player bars ${bars ? 'on' : 'off'}`;

    test(`front without the comment box: the menu floats off the board (${vp.name}, ${barsLabel})`, async ({
      page,
    }) => {
      await load(page, vp, { playerBars: bars, frontText: false, frontComments: false }, 'Puzzle');
      await expect(page.locator('#global-settings.floating')).toHaveCount(1);
      await expectUsableMenu(page, vp);
    });

    test(`back: the menu is in the button row (${vp.name}, ${barsLabel})`, async ({ page }) => {
      await load(page, vp, { playerBars: bars }, 'Viewer');
      const row = page.locator('#buttons-container');
      await expect(row.locator('#global-settings button')).toBeVisible();
      await expect(page.locator('#global-settings.floating')).toHaveCount(0);
      // Every button of the row, the menu included, fits in it
      const rowBox = (await row.boundingBox())!;
      for (const button of await row.locator('button').all()) {
        expect(inside((await button.boundingBox())!, rowBox)).toBe(true);
      }
      await expectUsableMenu(page, vp);
    });
  }

  for (const [name, config] of [
    ['user text', { frontText: true, frontComments: false }],
    ['move comments', { frontText: false, frontComments: true }],
  ] as const) {
    test(`front with the comment box (${name}): the menu is at its top (${vp.name})`, async ({ page }) => {
      await load(page, vp, config, 'Puzzle');
      await expect(page.locator('#commentBox #buttons-container.menu-only #global-settings button')).toBeVisible();
      await expect(page.locator('#global-settings.floating')).toHaveCount(0);
      await expectUsableMenu(page, vp);
    });
  }
}

// The hint button goes with the menu: at the top of the comment box, or floating with it
for (const vp of viewports) {
  for (const [where, config, holder] of [
    ['in the comment box', { frontText: true, frontComments: false }, '#commentBox #buttons-container.menu-only'],
    ['floating', { frontText: false, frontComments: false }, '#floating-tools'],
  ] as const) {
    test(`front: the hint button sits next to the menu, ${where} (${vp.name})`, async ({ page }) => {
      await load(page, vp, config, 'Puzzle');
      const hint = page.locator(`${holder} #hint-button`);
      await expect(hint).toBeVisible();
      await expect(page.locator(`${holder} #global-settings`)).toBeVisible();

      const hintBox = (await hint.boundingBox())!;
      const menuBox = (await page.locator('#global-settings button').boundingBox())!;
      expect(overlaps(hintBox, menuBox)).toBe(false);
      expect(overlaps(hintBox, (await page.locator('.board-wrapper').boundingBox())!)).toBe(false);
      expect(inside(hintBox, vp)).toBe(true);
    });
  }
}
