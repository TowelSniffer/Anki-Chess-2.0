// tests/webkit-shift.spec.ts
import { test, expect } from '@playwright/test';

test('detect piece interaction after layout shift', async ({ page }) => {
  await page.addInitScript(() => { (window as any).isPlaywright = true; });

  // Use 'commit' to prevent WebKit binary crashes on Arch
  await page.goto('/', { waitUntil: 'commit' });

  await page.waitForFunction(() => (window as any).gameStore !== undefined, { timeout: 1000 });

  // Wait for the actual board to mount since we didn't wait for 'load'
  const board = page.locator('#board');
  await expect(board).toBeVisible({ timeout: 10000 });

  // 1. Get a movable piece position
  const turnColor = await page.evaluate(() => (window as any).gameStore.playerColor);
  const piece = page.locator(`piece.${turnColor}`).first();
  // Wait for the element to actually exist in the layout
  await piece.waitFor({ state: 'visible', timeout: 10000 });

  // Poll for the bounding box until WebKit calculates it
  let box = null;
  await expect(async () => {
    box = await piece.boundingBox();
    expect(box).not.toBeNull();
  }).toPass({ timeout: 5000 });

  if (!box) throw new Error("Layout engine failed to compute piece geometry.");

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

  await expect(async () => {
    const selected = await page.evaluate(() => !!(window as any).gameStore?.cg?.state.selected);
    expect(selected).toBeTruthy();
  }).toPass();
});
