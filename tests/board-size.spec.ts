import { test, expect } from '@playwright/test';

test.skip(({ browserName }) => browserName !== 'chromium', 'Layout logic only needs Chromium');

// Board border is 8px on each side, so a viewport-limited board is viewport - 16px.
// The player bars (on by default) take clamp(18px, 3.4dvh, 28px) above and below the
// board, which only matters when the screen height limits the board.
const cases = [
  { name: 'default size on a large screen', viewport: [1600, 1100], config: {}, expected: 600 },
  { name: 'larger size on a large screen', viewport: [1600, 1100], config: { boardSize: 900 }, expected: 900 },
  { name: 'limited by screen height', viewport: [1400, 700], config: { boardSize: 1000, playerBars: false }, expected: 684 },
  { name: 'limited by screen height, with the player bars', viewport: [1400, 700], config: { boardSize: 1000 }, expected: 636 },
  { name: 'phone portrait is unchanged', viewport: [390, 844], config: { boardSize: 1200 }, expected: 374 },
  { name: 'phone landscape is unchanged', viewport: [844, 390], config: { boardSize: 1200, playerBars: false }, expected: 374 },
  { name: 'phone landscape, with the player bars', viewport: [844, 390], config: { boardSize: 1200 }, expected: 338 },
] as const;

for (const { name, viewport, config, expected } of cases) {
  test(`board size: ${name}`, async ({ page }) => {
    await page.setViewportSize({ width: viewport[0], height: viewport[1] });
    await page.addInitScript((config) => {
      (window as any).USER_CONFIG = config;
      (window as any).DEV_OVERRIDES = { boardMode: 'Puzzle' };
    }, config);

    await page.goto('/', { waitUntil: 'commit' });

    await expect(async () => {
      const box = await page.locator('.board-wrapper').boundingBox();
      expect(box).not.toBeNull();
      expect(Math.round(box!.width)).toBe(expected);
      expect(Math.round(box!.height)).toBe(expected); // always square
    }).toPass();
  });
}

test('comment box keeps its room next to a larger board', async ({ page }) => {
  await page.setViewportSize({ width: 1600, height: 1100 });
  await page.addInitScript(() => {
    (window as any).USER_CONFIG = { boardSize: 900 };
    (window as any).DEV_OVERRIDES = { boardMode: 'Viewer' };
  });

  await page.goto('/', { waitUntil: 'commit' });

  await expect(async () => {
    const board = await page.locator('.board-wrapper').boundingBox();
    const comments = await page.locator('#commentBox').boundingBox();
    expect(comments!.width).toBeGreaterThan(300);
    expect(comments!.x + comments!.width).toBeLessThanOrEqual(board!.x); // side by side, no overlap
  }).toPass();
});
