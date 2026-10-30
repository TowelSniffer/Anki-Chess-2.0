import { test, expect } from '@playwright/test';

test.skip(({ browserName }) => browserName !== 'chromium', 'Layout logic only needs Chromium');

// Board border is 8px on each side, so a viewport-limited board is viewport - 16px
const cases = [
  { name: 'default size on a large screen', viewport: [1600, 1100], boardSize: undefined, expected: 600 },
  { name: 'larger size on a large screen', viewport: [1600, 1100], boardSize: 900, expected: 900 },
  { name: 'limited by screen height', viewport: [1400, 700], boardSize: 1000, expected: 684 },
  { name: 'phone portrait is unchanged', viewport: [390, 844], boardSize: 1200, expected: 374 },
  { name: 'phone landscape is unchanged', viewport: [844, 390], boardSize: 1200, expected: 374 },
] as const;

for (const { name, viewport, boardSize, expected } of cases) {
  test(`board size: ${name}`, async ({ page }) => {
    await page.setViewportSize({ width: viewport[0], height: viewport[1] });
    await page.addInitScript((boardSize) => {
      (window as any).USER_CONFIG = boardSize ? { boardSize } : {};
      (window as any).DEV_OVERRIDES = { boardMode: 'Puzzle' };
    }, boardSize);

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
