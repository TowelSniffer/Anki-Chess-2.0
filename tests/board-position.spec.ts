import { test, expect, type BrowserContext } from '@playwright/test';

test.skip(({ browserName }) => browserName !== 'chromium', 'Layout logic only needs Chromium');

// The board stays put when the card is flipped: the position is what you're looking at
const viewports = [
  { name: 'phone portrait', width: 360, height: 740 },
  { name: 'phone landscape', width: 740, height: 360 },
  { name: 'tablet portrait', width: 800, height: 1280 },
  { name: 'desktop', width: 1280, height: 760 },
];

const configs = [
  { name: 'player bars', config: { playerBars: true, frontText: false } },
  { name: 'no player bars', config: { playerBars: false, frontText: false } },
  { name: 'text on the front', config: { playerBars: true, frontText: true } },
];

async function boardBox(
  context: BrowserContext,
  viewport: { width: number; height: number },
  config: object,
  boardMode: string,
) {
  const page = await context.newPage();
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
  await page.waitForTimeout(200);
  const box = (await page.locator('.board-wrapper').boundingBox())!;
  await page.close();
  return box;
}

for (const vp of viewports) {
  for (const { name, config } of configs) {
    test(`the board doesn't move when the card is flipped (${vp.name}, ${name})`, async ({ context }) => {
      const front = await boardBox(context, vp, config, 'Puzzle');
      const back = await boardBox(context, vp, config, 'Viewer');
      for (const side of ['x', 'y', 'width', 'height'] as const) {
        expect(Math.abs(front[side] - back[side])).toBeLessThan(0.25); // Under a pixel: invisible
      }
    });
  }
}

test('nothing is drawn in the room kept on the front', async ({ page }) => {
  await page.addInitScript(() => {
    (window as any).USER_CONFIG = { frontText: false };
    (window as any).DEV_OVERRIDES = { boardMode: 'Puzzle' };
  });
  await page.goto('/', { waitUntil: 'commit' });
  await expect(page.locator('#board piece').first()).toBeVisible({ timeout: 10000 });
  await expect(page.locator('#commentBox')).toHaveCount(0);
  const space = page.locator('#commentSpace');
  await expect(space).toHaveCount(1);
  expect(await space.evaluate((el) => getComputedStyle(el).backgroundColor)).toBe('rgba(0, 0, 0, 0)');
});
