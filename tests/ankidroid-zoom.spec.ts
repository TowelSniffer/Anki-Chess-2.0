// tests/ankidroid-zoom.spec.ts
import { test, expect, type Page } from '@playwright/test';

test.skip(({ browserName }) => browserName !== 'chromium', 'AnkiDroid renders cards in a Chromium WebView');

// AnkiDroid 2.25.1+ scales cards with CSS zoom: `html { zoom: <system font scale> }` in the page
// head and `body.style.zoom = <Card zoom>`. Values as on a device with a larger font and Card zoom 120%.
const fontScale = '1.15';
const cardZoom = '1.2';
const viewport = { width: 800, height: 1280 }; // tablet, portrait

async function applyAnkiDroidZoom(page: Page) {
  await page.evaluate(
    ({ fontScale, cardZoom }) => {
      const style = document.createElement('style');
      style.textContent = `html { zoom: ${fontScale} }`;
      document.head.appendChild(style);
      document.body.style.zoom = cardZoom;
    },
    { fontScale, cardZoom },
  );
}

test.beforeEach(async ({ page }) => {
  await page.setViewportSize(viewport);
  await page.addInitScript(() => {
    (window as any).isPlaywright = true;
  });

  // Use 'commit' to prevent WebKit binary crashes on Arch
  await page.goto('/', { waitUntil: 'commit' });
  await expect(page.locator('#board piece').first()).toBeVisible({ timeout: 10000 });

  await applyAnkiDroidZoom(page);
  // Wait for ResizeObserver + requestAnimationFrame to settle
  await page.waitForTimeout(250);
});

test('board stays inside the screen under AnkiDroid zoom', async ({ page }) => {
  await expect(async () => {
    const box = await page.locator('.board-wrapper').boundingBox();
    expect(box).not.toBeNull();
    expect(box!.x).toBeGreaterThanOrEqual(0);
    expect(box!.x + box!.width).toBeLessThanOrEqual(viewport.width);
    expect(Math.round(box!.width)).toBe(Math.round(box!.height)); // still square
  }).toPass();
});

test('a tap on a piece selects that piece under AnkiDroid zoom', async ({ page }) => {
  // The piece furthest from the board's top-left corner, where misplaced pieces drift the most
  const target = await page.evaluate(() => {
    const color = (window as any).gameStore.playerColor;
    const pieces = [...document.querySelectorAll(`#board piece.${color}`)] as (HTMLElement & {
      cgKey: string;
    })[];
    const rects = pieces.map((el) => ({ key: el.cgKey, rect: el.getBoundingClientRect() }));
    const { key, rect } = rects.reduce((a, b) =>
      b.rect.left + b.rect.top > a.rect.left + a.rect.top ? b : a,
    );
    return { key, x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };
  });

  await page.mouse.click(target.x, target.y);

  await expect
    .poll(() => page.evaluate(() => (window as any).gameStore?.cg?.state.selected))
    .toBe(target.key);
});

test('cards of other note types keep the AnkiDroid zoom', async ({ page }) => {
  const zoom = () =>
    page.evaluate(() => [
      getComputedStyle(document.documentElement).zoom,
      getComputedStyle(document.body).zoom,
    ]);
  expect(await zoom()).toEqual(['1', '1']);

  // The reviewer page outlives the card: the next card replaces the AnkiChess root
  await page.evaluate(() => document.getElementById('chessRs-root')!.remove());
  expect(await zoom()).toEqual([fontScale, cardZoom]);
});
