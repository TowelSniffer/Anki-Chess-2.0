import { test, expect, type Page } from '@playwright/test';

test.skip(({ browserName }) => browserName !== 'chromium', 'Layout logic only needs Chromium');

// The importer's text of a Lichess puzzle you failed (puzzles.py, PuzzleCard.note_text)
const PUZZLE_TEXT =
  '<div class="ac-info" data-details="Detalhes"><h3 class="ac-title">' +
  '<span class="ac-dot ac-failed" title="Você errou no Lichess"></span>Puzzle r5e5v ' +
  '<span class="ac-rating" title="Rating">2172</span></h3><dl class="ac-grid">' +
  '<dt>Resultado</dt><dd><span class="ac-result ac-failed">✗ Errou · 26/09/2026</span></dd>' +
  '<dt>Temas</dt><dd><span class="ac-chip">Mate em 2</span><span class="ac-sep">, </span>' +
  '<span class="ac-chip">Meio-jogo</span></dd>' +
  '<dt>Fonte</dt><dd><a href="https://lichess.org/training/r5e5v">Lichess</a> · Puzzles do Lichess</dd>' +
  '</dl></div>';

// The Stockfish button is an option; a random orientation would hide it
const config = { frontText: true, randomOrientation: false, flipBoard: true, frontEvalButton: true };

async function load(page: Page, boardMode: string, text: string) {
  await page.addInitScript(
    ({ boardMode, text, config }) => {
      (window as any).USER_CONFIG = config;
      (window as any).DEV_OVERRIDES = { boardMode, text };
    },
    { boardMode, text, config },
  );
  await page.goto('/', { waitUntil: 'commit' });
  await expect(page.locator('#board piece').first()).toBeVisible({ timeout: 10000 });
}

test('a puzzle panel folds its grid under Details, and the next card keeps it folded', async ({ page }) => {
  await load(page, 'Viewer', PUZZLE_TEXT);
  const grid = page.locator('#textField .ac-grid');
  const details = page.locator('#userTextContainer .details');

  // Open at first, the button in the importer's language
  await expect(grid).toBeVisible();
  await expect(details).toHaveText('Detalhes');
  await expect(details).toHaveAttribute('aria-expanded', 'true');
  await expect(page.locator('#textField .ac-chip').first()).toBeVisible();
  await expect(page.locator('#textField .ac-sep').first()).toBeHidden();

  await details.click();
  await expect(grid).toBeHidden();
  await expect(page.locator('#textField .ac-title')).toBeVisible();
  await expect(details).toHaveAttribute('aria-expanded', 'false');

  // The next card (a new page in the same webview) starts folded
  await page.reload({ waitUntil: 'commit' });
  await expect(page.locator('#board piece').first()).toBeVisible({ timeout: 10000 });
  await expect(grid).toBeHidden();
  await details.click();
  await expect(grid).toBeVisible();
});

test('a text without the panel has no Details', async ({ page }) => {
  await load(page, 'Viewer', '<h3>Chapter 1</h3>My study<br><a href="https://lichess.org/study/abc">Lichess</a>');
  await expect(page.locator('#textField h3')).toBeVisible();
  await expect(page.locator('#userTextContainer .details')).toHaveCount(0);
});

test("the front's tools say what they are, on the panel's surface", async ({ page }) => {
  await load(page, 'Puzzle', PUZZLE_TEXT);
  const row = page.locator('#buttons-container.menu-only');
  await expect(row.locator('#hint-button')).toContainText('Hint');
  await expect(row.locator('#eval-button')).toContainText('Stockfish');
  await expect(row.locator('button.trigger')).toContainText('Menu');
  await expect(page.locator('#userTextContainer')).toHaveCSS('border-bottom-style', 'none');
});

test('beside the board, without the text, the tools stay icons', async ({ page }) => {
  await page.addInitScript(() => {
    (window as any).USER_CONFIG = { frontText: false, frontComments: false, randomOrientation: false };
    (window as any).DEV_OVERRIDES = { boardMode: 'Puzzle' };
  });
  await page.goto('/', { waitUntil: 'commit' });
  await expect(page.locator('#board piece').first()).toBeVisible({ timeout: 10000 });
  const tools = page.locator('#floating-tools');
  await expect(tools.locator('#hint-button')).not.toContainText('Hint');
  await expect(tools.locator('button.trigger')).not.toContainText('Menu');
});
