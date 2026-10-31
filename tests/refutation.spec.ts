import { test, expect, type Page } from '@playwright/test';

test.skip(({ browserName }) => browserName !== 'chromium', 'Logic tests only need Chromium');

// White to move after 1. e4 e5: the answer is 2. Nf3; 2. Qg4 is the wrong move played here
const start = '[FEN "rnbqkbnr/pppp1ppp/8/4p3/4P3/8/PPPP1PPP/RNBQKBNR w KQkq - 0 2"]\n[SetUp "1"]\n\n';
const pgn = `${start}2. Nf3 Nc6 *`;
// The same with 2. Qg4 as a variation, whose reply 2...d5 the PGN gives
const pgnWithReply = `${start}2. Nf3 (2. Qg4 d5) Nc6 *`;

const store = (page: Page, read: (s: any) => unknown) =>
  page.evaluate(`(${read.toString()})(window.gameStore)`);

const pieceOn = (page: Page, square: string) =>
  page.evaluate((sq) => {
    const piece = (window as any).gameStore.cg.state.pieces.get(sq);
    return piece ? `${piece.color} ${piece.role}` : null;
  }, square);

// engineMove: what the stubbed Stockfish answers (null: no answer in time)
async function load(page: Page, { config = {}, pgnText = pgn, engineMove = 'd7d5' as string | null } = {}) {
  await page.addInitScript(
    ({ config, pgnText }) => {
      (window as any).USER_CONFIG = { timer: 0, handicap: 1, mirror: false, acceptVariations: false, ...config };
      (window as any).DEV_OVERRIDES = { boardMode: 'Puzzle', pgn: pgnText };
    },
    { config, pgnText },
  );
  await page.goto('/', { waitUntil: 'commit' });
  await expect.poll(() => store(page, (s) => !!s?.cg)).toBe(true);
  await page.evaluate((move) => {
    (window as any).gameStore.engineStore.requestBestMove = async () => move;
  }, engineMove);
}

const playWrongMove = (page: Page) => page.evaluate(() => (window as any).gameStore.cg.move('d1', 'g4'));

test("the engine's reply punishes the wrong move, then the move is taken back", async ({ page }) => {
  await load(page);
  await playWrongMove(page);

  // The reply is on the board, with its arrow, and the board is locked
  await expect.poll(() => pieceOn(page, 'd5')).toBe('black pawn');
  expect(await store(page, (s) => s.systemShapes)).toEqual([{ orig: 'd7', dest: 'd5', brush: 'red' }]);
  expect(await store(page, (s) => s.viewOnly)).toBe(true);
  expect(await pieceOn(page, 'g4')).toBe('white queen');

  // Then back to the puzzle's position
  await expect.poll(() => store(page, (s) => s.isRefuting), { timeout: 5000 }).toBe(false);
  await expect.poll(() => pieceOn(page, 'd1')).toBe('white queen');
  expect(await pieceOn(page, 'd5')).toBe(null);
  expect(await store(page, (s) => s.errorCount)).toBe(1);
  expect(await store(page, (s) => s.viewOnly)).toBe(false);
});

test("the PGN's reply is used when it has one", async ({ page }) => {
  // The engine would answer Nf6: the PGN's 2...d5 wins
  await load(page, { pgnText: pgnWithReply, engineMove: 'g8f6' });
  await playWrongMove(page);

  await expect.poll(() => pieceOn(page, 'd5')).toBe('black pawn');
  expect(await pieceOn(page, 'f6')).toBe(null);
});

test('without an engine answer the move is just taken back', async ({ page }) => {
  await load(page, { engineMove: null });
  await playWrongMove(page);

  await expect.poll(() => store(page, (s) => s.isRefuting), { timeout: 5000 }).toBe(false);
  await expect.poll(() => pieceOn(page, 'd1')).toBe('white queen');
  expect(await store(page, (s) => s.refutation)).toBe(null);
});

test('with the option off the move is taken back at once', async ({ page }) => {
  await load(page, { config: { refutation: false } });
  await playWrongMove(page);

  await expect.poll(() => pieceOn(page, 'd1')).toBe('white queen');
  expect(await store(page, (s) => s.isRefuting)).toBe(false);
  expect(await store(page, (s) => s.errorCount)).toBe(1);
});

test('past the handicap, the correct move is played after the refutation', async ({ page }) => {
  await load(page, { config: { handicap: 0 } });
  await playWrongMove(page);

  await expect.poll(() => pieceOn(page, 'd5')).toBe('black pawn');
  await expect.poll(() => store(page, (s) => s.currentMove?.san), { timeout: 6000 }).toBe('Nc6');
  expect(await store(page, (s) => s.puzzleScore)).toBe('fail');
});
