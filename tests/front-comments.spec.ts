import { test, expect, type Page } from '@playwright/test';

test.skip(({ browserName }) => browserName !== 'chromium', 'Logic tests only need Chromium');

// Lichess gamebook chapter: intro question, comment after the solution and a
// commented variation that is the wrong answer ("Assim seguiu a partida").
const gamebookPgn = `
[FEN "r2qk2r/pp2nppp/2n1p3/1B1pPb2/5P2/2P5/PP4PP/RNBQ1RK1 b kq - 2 10"]
[SetUp "1"]

{ As brancas acabaram de rocar, qual o melhor lance para as pretas? }
10... Qb6+! { Aproveitando o alinhamento de intersecção. } (10... O-O { Assim seguiu a partida... }) 11. Kh1 Qxb5 *
`;

// Flipped chapter: the first move is the opponent's, followed by the prompt.
const flippedPgn = `
[FEN "8/6k1/1qbRnpp1/rN2p2p/2P1P2P/2Q5/5PP1/5BK1 b - - 0 48"]
[SetUp "1"]

48... Nc5 { [%anno "basso01"] Jogam as brancas } 49. Rxc6! { Sobrecarga! } Qxc6 50. Qxa5 1-0
`;

async function load(page: Page, pgn: string, config: Record<string, unknown>) {
  await page.addInitScript(
    ({ pgn, config }) => {
      (window as any).USER_CONFIG = { timer: 0, ...config };
      (window as any).DEV_OVERRIDES = { boardMode: 'Puzzle', pgn };
    },
    { pgn, config },
  );
  await page.goto('/');
  await expect.poll(() => page.evaluate(() => !!(window as any).gameStore?.cg)).toBe(true);
}

const move = (page: Page, orig: string, dest: string) =>
  page.evaluate(([o, d]) => (window as any).gameStore.cg.move(o, d), [orig, dest]);

test('shows intro and played move comments on the front', async ({ page }) => {
  await load(page, gamebookPgn, { frontComments: true });
  const box = page.locator('.puzzleComments');

  await expect(box).toContainText('qual o melhor lance para as pretas?');
  await expect(box).not.toContainText('Aproveitando');

  await move(page, 'd8', 'b6');
  await expect(box).toContainText('10... Qb6+');
  await expect(box).toContainText('Aproveitando o alinhamento');
  // The variation comment is never revealed for a correct move
  await expect(box).not.toContainText('Assim seguiu');
});

test('shows the variation comment for a rejected wrong move', async ({ page }) => {
  await load(page, gamebookPgn, { frontComments: true, acceptVariations: false });

  await move(page, 'e8', 'g8');
  const wrong = page.locator('.puzzleComments .entry.wrong');
  await expect(wrong).toContainText('Assim seguiu a partida');
});

test('shows the prompt after the opponent first move in flipped mode', async ({ page }) => {
  await load(page, flippedPgn, { frontComments: true, flipBoard: true });
  const box = page.locator('.puzzleComments');

  await expect(box).toContainText('48... Nc5');
  await expect(box).toContainText('Jogam as brancas');
  await expect(box).not.toContainText('[%anno');
  await expect(box).not.toContainText('Sobrecarga');
});

test('hides comments on the front when frontComments is disabled', async ({ page }) => {
  await load(page, gamebookPgn, { frontComments: false });
  await expect(page.locator('#board-container')).toBeVisible();
  await expect(page.locator('.puzzleComments')).toHaveCount(0);
});
