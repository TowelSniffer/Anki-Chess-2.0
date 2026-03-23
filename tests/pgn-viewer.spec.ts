// tests/pgn-viewer.spec.ts
import { test, expect } from '@playwright/test';

test.skip(({ browserName }) => browserName !== 'chromium', 'Logic tests only need Chromium');

test('navigates back multiple moves when clicking first move', async ({ page }) => {
  // Load app with a specific PGN
  await page.addInitScript(() => {
    // Inject our testing overrides
    (window as any).DEV_OVERRIDES = {
      pgn: '1.e4 e5 2.Nf3 Nc6 3.Bc4',
    };
  });

  await page.goto('/', { waitUntil: 'commit' });
  await page.waitForFunction(() => (window as any).gameStore !== undefined);

  // Grab the first move in the viewer (data-path-key="0" assuming standard augmentation)
  const lastMove = page.locator('.move[data-path-key="4"]');
  await lastMove.click();

  // Verify the internal store state
  await expect(async () => {
    const fen = await page.evaluate(() => (window as any).gameStore.fen);
    // Expect fen after 1.e4
    expect(fen).toContain('r1bqkbnr/pppp1ppp/2n5/4p3/2B1P3/5N2/PPPP1PPP/RNBQK2R b KQkq -');
  }).toPass();

  const firstMove = page.locator('.move[data-path-key="0"]');
  await firstMove.click();

  // Verify the internal store state
  await expect(async () => {
    const fen = await page.evaluate(() => (window as any).gameStore.fen);
    // Expect fen after 1.e4
    expect(fen).toContain('rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq -');
  }).toPass();
});
