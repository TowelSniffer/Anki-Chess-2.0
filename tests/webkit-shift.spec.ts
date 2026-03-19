// tests/webkit-shift.spec.ts
import { test, expect } from '@playwright/test';

test('detect piece interaction after layout shift', async ({ page }) => {
  await page.addInitScript(() => { (window as any).isPlaywright = true; });

  // Use 'commit' to prevent WebKit binary crashes on Arch
  await page.goto('/', { waitUntil: 'commit' });

  await page.waitForFunction(() => (window as any).gameStore !== undefined, { timeout: 1000 });

  // Wait for the actual board to mount since we didn't wait for 'load'
  const board = page.locator('#board');
  await expect(board).toBeVisible({ timeout: 15000 });

  // 1. Get a movable piece position
  const turnColor = await page.evaluate(() => (window as any).gameStore.playerColor);
  const piece = page.locator(`piece.${turnColor}`).first();

  const box = await piece.boundingBox();
  if (!box) throw new Error("Piece not found");

  // 2. Shift the board down
  await page.evaluate(() => {
    const spacer = document.createElement('div');
    spacer.style.height = '100px';
    document.body.prepend(spacer);
  });

  // 3. Wait for ResizeObserver + requestAnimationFrame to settle
  await page.waitForTimeout(250);

  // 4. Click the OLD coordinates to test if redrawAll() worked
  await page.mouse.click(box.x + box.width / 2, box.y + box.height / 2 + 100);

  // 5. Verify
  const isSelected = await page.evaluate(() => !!(window as any).gameStore?.cg?.state.selected);

  expect(isSelected).toBeTruthy();
});
