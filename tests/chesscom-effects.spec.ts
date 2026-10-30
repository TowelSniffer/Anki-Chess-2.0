import { test, expect, type Page } from '@playwright/test';
import { mirrorPGN, parsePGN } from '$features/pgn/pgnParsing';
import { parseEffects } from '$features/pgn/chesscomEffects';

test.skip(({ browserName }) => browserName !== 'chromium', 'Logic tests only need Chromium');

// Chess.com analysis export (Share > PGN) with its Game Review marks, starting from a FEN
const reviewPgn = `
[Event "Live Chess"]
[Result "1-0"]
[SetUp "1"]
[FEN "r5k1/3r1ppp/1pp1b3/p7/PqpPPR2/4B3/1PP2QPP/5RK1 w - - 1 21"]

21. c3 Qxa4 $2 {[%c_effect
a4;square;a4;type;Mistake;size;100%25;animated;false;persistent;true]} 22. Qg3
b5 $2 {[%c_effect
b5;square;b5;type;Mistake;size;100%25;animated;false;persistent;true]} 23. d5
cxd5 24. Bd4 $1 {[%c_effect
d4;square;d4;type;GreatFind;size;100%25;animated;false;persistent;true]} 24...
f6 $2 {[%c_effect
f6;square;f6;type;Mistake;size;100%25;animated;false;persistent;true]} (24... g6
{Padrão Estratégico: Complexo de cores} 25. Qh4 b4 $2 {[%c_effect
b4;square;b4;type;Mistake;size;100%25;animated;false;persistent;true]} 26.
Qxh7+ $3 {[%c_effect
h7;square;h7;type;Brilliant;size;100%25;animated;false;persistent;true]} 26...
Kxh7 27. Rh4+ $1 {[%c_effect
h4;square;h4;type;GreatFind;size;100%25;animated;false;persistent;true]} 27...
Kg8 28. Rh8# {Ponto de coincidência}) 25. Rxf6 Re8 $6 {[%c_effect
e8;square;e8;type;Inaccuracy;size;100%25;animated;false;persistent;true]} 26.
exd5 Bxd5 $6 {[%c_effect
d5;square;d5;type;Inaccuracy;size;100%25;animated;false;persistent;true]} 27.
Rd6 (27. Qe5 $3 {[%c_effect
e5;square;e5;type;Brilliant;size;100%25;animated;false;persistent;true]} 27...
Rxe5 $6 {[%c_effect
e5;square;e5;type;Inaccuracy;size;100%25;animated;false;persistent;true]} 28.
Rf8# $1 {[%c_effect
f8;square;f8;type;GreatFind;size;100%25;animated;false;persistent;true]}) 27...
Rxd6 $2 {[%c_effect
d6;square;d6;type;Mistake;size;100%25;animated;false;persistent;true]} 28. Qxg7#
{[%c_effect
g1;square;g1;type;Winner;animated;true,g8;square;g8;type;CheckmateBlack;animated;true]}
1-0
`;

test('reads Chess.com marks', () => {
  const [mistake] = parseEffects('a4;square;a4;type;Mistake;size;100%25;animated;false;persistent;true');
  expect(mistake.square).toBe('a4');
  expect(mistake.badge.tint).toBe(true);

  const gameEnd = parseEffects(
    'g1;square;g1;type;Winner;animated;true,g8;square;g8;type;CheckmateBlack;animated;true,e4;square;e4;type;Unknown',
  );
  expect(gameEnd.map((e) => [e.square, e.badge.tint])).toEqual([
    ['g1', false],
    ['g8', false],
  ]);
});

test('parses the export and mirrors its marks', () => {
  const { parsedPgn, error } = parsePGN(reviewPgn);
  expect(error).toBeUndefined();
  expect(parsedPgn.moves[1].commentDiag?.c_effect).toMatch(/^a4;square;a4;type;Mistake;/);
  mirrorPGN(parsedPgn, 'invert');
  expect(parsedPgn.moves[1].commentDiag?.c_effect).toMatch(/^h5;square;h5;type;Mistake;/);
});

async function load(page: Page, boardMode: string) {
  await page.addInitScript(
    ({ pgn, boardMode }) => {
      (window as any).USER_CONFIG = { timer: 0 };
      (window as any).DEV_OVERRIDES = { boardMode, pgn };
    },
    { pgn: reviewPgn, boardMode },
  );
  await page.goto('/');
  await expect.poll(() => page.evaluate(() => !!(window as any).gameStore?.cg)).toBe(true);
  expect(await page.evaluate(() => (window as any).gameStore.parseError)).toBeNull();
}

// Squares with a badge (over the pieces) and with a tint (under them)
const marks = (page: Page) =>
  page.evaluate(() => {
    const shapes: any[] = (window as any).gameStore.systemShapes;
    const effects = shapes.filter((s) => s.customSvg && !s.dest);
    return {
      badges: effects.filter((s) => !s.below).map((s) => s.orig),
      tints: effects.filter((s) => s.below).map((s) => s.orig),
    };
  });

test('shows the marks of the current move in the viewer', async ({ page }) => {
  await load(page, 'Viewer');
  await page.evaluate(() => {
    const store = (window as any).gameStore;
    store.next(); // 21. c3
    store.next(); // 21... Qxa4?
  });
  await expect.poll(() => marks(page)).toEqual({ badges: ['a4'], tints: ['a4'] });

  // After 28. Qxg7#: the winner and the mated king, without tint
  await page.evaluate(() => {
    const store = (window as any).gameStore;
    while (store.hasNext) store.next();
  });
  await expect.poll(() => marks(page)).toEqual({ badges: ['g1', 'g8'], tints: [] });
});

test('shows only the marks of your own moves in a puzzle', async ({ page }) => {
  await load(page, 'Puzzle');
  const play = async (orig: string, dest: string, reply: RegExp) => {
    await page.evaluate(([o, d]) => (window as any).gameStore.cg.move(o, d), [orig, dest]);
    await expect
      .poll(() => page.evaluate(() => (window as any).gameStore.currentMove?.san ?? ''))
      .toMatch(reply);
  };

  await play('c2', 'c3', /^Qxa4$/); // 21... Qxa4? is not marked: it would hint at the tactic
  expect(await marks(page)).toEqual({ badges: [], tints: [] });

  await play('f2', 'g3', /^b5$/);
  await play('d4', 'd5', /^cxd5$/);
  // 24. Bd4! stays marked after the reply (24... f6? or the variation 24... g6)
  await play('e3', 'd4', /^[fg]6$/);
  await expect.poll(() => marks(page)).toEqual({ badges: ['d4'], tints: [] });
});
