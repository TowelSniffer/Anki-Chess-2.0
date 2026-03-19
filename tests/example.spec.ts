import { test, expect } from '@playwright/test';

test('has title', async ({ page }) => {
  await page.goto('/', { waitUntil: 'commit' });
  await expect(page).toHaveTitle(/ankichess/);
});
