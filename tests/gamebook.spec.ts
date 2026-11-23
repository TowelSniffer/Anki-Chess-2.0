import { test, expect, type Page } from '@playwright/test';

test.skip(({ browserName }) => browserName !== 'chromium', 'Logic tests only need Chromium');

// Lichess gamebook chapter (#MT197, "Abertura/Peça presa"), studied as Black: White's
// first move is played automatically, 5... Be7 is a variation the student must not play
const chapter = (mode: string) => `
[FEN "r1bqkbnr/pp1p1ppp/2n1p3/8/2P4Q/8/PP2PPPP/RNB1KBNR w KQkq - 0 5"]
[SetUp "1"]
${mode}

5. Bg5 5... Qb6 (5... Be7 { Errado: troca o bispo bom }) 6. b3 (6. Bc1 Be7) 6... Nb4 *
`;
const gamebook = chapter('[ChapterMode "gamebook"]');

async function load(page: Page, pgn: string) {
  await page.addInitScript(
    ({ pgn }) => {
      (window as any).USER_CONFIG = { timer: 0, flipBoard: true, acceptVariations: true };
      (window as any).DEV_OVERRIDES = { boardMode: 'Puzzle', pgn };
    },
    { pgn },
  );
  await page.goto('/');
  // White's first move is played automatically
  await expect
    .poll(() => page.evaluate(() => (window as any).gameStore?.currentMove?.san))
    .toBe('Bg5');
}

const move = (page: Page, orig: string, dest: string) =>
  page.evaluate(([o, d]) => (window as any).gameStore.cg.move(o, d), [orig, dest]);

test('a variation is a wrong move in a gamebook, with its comment', async ({ page }) => {
  await load(page, gamebook);
  await move(page, 'f8', 'e7');
  await expect
    .poll(() =>
      page.evaluate(() => {
        const store = (window as any).gameStore;
        return { errors: store.errorCount, comment: store.wrongMoveComment, san: store.currentMove.san };
      }),
    )
    .toEqual({ errors: 1, comment: 'Errado: troca o bispo bom', san: 'Bg5' });
});

test('the same variation is accepted outside gamebooks', async ({ page }) => {
  await load(page, chapter(''));
  await move(page, 'f8', 'e7');
  await expect
    .poll(() => page.evaluate(() => (window as any).gameStore.pgnPath.includes('v')))
    .toBe(true);
});

test('the opponent sticks to the main line in a gamebook', async ({ page }) => {
  for (let i = 0; i < 6; i++) {
    await load(page, gamebook);
    await move(page, 'd8', 'b6');
    await expect
      .poll(() => page.evaluate(() => (window as any).gameStore.currentMove.san))
      .toBe('b3');
  }
});
