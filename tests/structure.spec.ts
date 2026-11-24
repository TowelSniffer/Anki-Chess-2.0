import { test, expect, type Page } from '@playwright/test';
import {
  checkAttempt,
  counts,
  isStructurePgn,
  parseBoard,
  parseStructure,
} from '$features/structure/structure';

test.skip(({ browserName }) => browserName !== 'chromium', 'Logic tests only need Chromium');

// "Estrutura I (Najdorf)" of the O'Kelly study (w7B3QmIi), as the importer writes it:
// rebuilt from Black's side, with a [%csl] square and a [%cal] arrow in its plans
const STRUCTURE = `[Event "#C26 - Estrutura Najdorf II: Introdução"]
[ChapterName "Estrutura I (Najdorf)"]
[FEN "8/1p3ppp/p2p4/4p3/4P3/8/PPP2PPP/8 w - - 0 1"]
[SetUp "1"]
[Orientation "black"]
[AnkiChessId "study/w7B3QmIi/3CY8U1bO"]
[AnkiChessMode "structure"]

{ [%csl Gd5][%cal Gf6d5] Nessa estrutura, os planos giram em torno de d5.

Plano das brancas:
1. Colocar um cavalo em d5. } *
`;
const BLACK_PAWNS = ['b7', 'f7', 'g7', 'h7', 'a6', 'd6', 'e5'];

test.describe('structure logic', () => {
  test('recognises structure cards', () => {
    expect(isStructurePgn(STRUCTURE)).toBe(true);
    // Pasted by hand: a FEN without kings and no moves
    expect(isStructurePgn('[FEN "8/pp6/8/8/8/8/PP6/8 w - - 0 1"]\n\n{ plans } *')).toBe(true);
    // The board can play it: an exercise without moves stays a normal card
    expect(isStructurePgn('[FEN "4k3/8/8/8/8/8/8/4K3 w - - 0 1"]\n\n*')).toBe(false);
    expect(isStructurePgn('[FEN "8/pp6/8/8/8/8/PP6/8 w - - 0 1"]\n\n1. b4 *')).toBe(false);
    expect(isStructurePgn('1. e4 e5 *')).toBe(false);
  });

  test('reads the target, side, plans and marks', () => {
    const s = parseStructure(STRUCTURE);
    expect(s.side).toBe('black');
    expect(s.target.size).toBe(14);
    expect(counts(s.target, 'black').pawn).toBe(7);
    expect(s.shapes).toEqual([
      { orig: 'd5', brush: 'green' },
      { orig: 'f6', dest: 'd5', brush: 'green' },
    ]);
    expect(s.comment).toContain('Plano das brancas:\n1. Colocar um cavalo em d5.');
    expect(s.comment).not.toContain('%c');
    expect(s.id).toBe('study/w7B3QmIi/3CY8U1bO');
  });

  test('checks only your side', () => {
    const s = parseStructure(STRUCTURE);
    const board = parseBoard('8/1p3ppp/p7/2p5/4P3/8/PPP2PPP/8');
    // b7 f7 g7 h7 a6 right, c5 wrong; d6 and e5 missing; the white pawns aren't judged
    const result = checkAttempt(s.target, board, 'black');
    expect(result.correct.sort()).toEqual(['a6', 'b7', 'f7', 'g7', 'h7']);
    expect(result.wrong).toEqual(['c5']);
    expect(result.missing.sort()).toEqual(['d6', 'e5']);
    // A knight where a pawn goes is wrong, and the pawn is still missing
    const knight = new Map(board).set('d6', { role: 'knight', color: 'black' });
    expect(checkAttempt(s.target, knight, 'black').wrong).toContain('d6');
    expect(checkAttempt(s.target, knight, 'black').missing).toContain('d6');
  });
});

// --- The card ---

async function load(page: Page) {
  await page.addInitScript(
    ({ pgn }) => {
      (window as any).USER_CONFIG = { timer: 0 };
      // A reload as 'Viewer' stands for the back side, a new page on Anki desktop
      const boardMode = sessionStorage.getItem('test_board_mode') || 'Puzzle';
      (window as any).DEV_OVERRIDES = { boardMode, pgn };
    },
    { pgn: STRUCTURE },
  );
  await page.goto('/');
  await expect(page.locator('cg-board')).toBeVisible();
}

// Centre of a square on the board, seen from Black
async function squarePoint(page: Page, key: string) {
  const box = (await page.locator('cg-board').boundingBox())!;
  const size = box.width / 8;
  const file = key.charCodeAt(0) - 97;
  const rank = Number(key[1]);
  return { x: box.x + (7 - file + 0.5) * size, y: box.y + (rank - 1 + 0.5) * size };
}

async function tapSquare(page: Page, key: string) {
  const { x, y } = await squarePoint(page, key);
  await page.mouse.click(x, y);
}

const piecesOnBoard = (page: Page) =>
  page.evaluate(() => {
    const pieces: Record<string, string> = {};
    for (const [key, p] of (window as any).structureCg.state.pieces) pieces[key] = `${p.color} ${p.role}`;
    return pieces;
  });

const pawnButton = (page: Page) => page.locator('.piece-button').filter({ has: page.locator('.piece.pawn') });

test('front: the opponent is given, your pieces are placed and checked', async ({ page }) => {
  await load(page);
  await expect(page.locator('.cg-wrap')).toHaveClass(/orientation-black/);
  let pieces = await piecesOnBoard(page);
  expect(Object.values(pieces).every((p) => p.startsWith('white'))).toBe(true);
  expect(Object.keys(pieces)).toHaveLength(7);
  await expect(pawnButton(page)).toContainText('0/7');

  // Tap the pawn, then the squares: five right, one on c5
  await pawnButton(page).click();
  for (const key of ['b7', 'f7', 'g7', 'h7', 'a6', 'c5']) await tapSquare(page, key);
  await expect(pawnButton(page)).toContainText('6/7');

  // Tapping one of yours with the same piece removes it; on a white pawn nothing happens
  await tapSquare(page, 'a6');
  await tapSquare(page, 'e4');
  pieces = await piecesOnBoard(page);
  expect(pieces.a6).toBeUndefined();
  expect(pieces.e4).toBe('white pawn');
  await tapSquare(page, 'a6');

  // Drag from the palette (the pawn tool off first)
  await pawnButton(page).click();
  const from = (await pawnButton(page).boundingBox())!;
  const to = await squarePoint(page, 'd6');
  await page.mouse.move(from.x + from.width / 2, from.y + from.height / 3);
  await page.mouse.down();
  await page.mouse.move(to.x, to.y, { steps: 8 });
  await page.mouse.up();
  await expect(pawnButton(page)).toContainText('7/7');

  // The opponent's pawns don't move
  const e4 = await squarePoint(page, 'e4');
  const e6 = await squarePoint(page, 'e6');
  await page.mouse.move(e4.x, e4.y);
  await page.mouse.down();
  await page.mouse.move(e6.x, e6.y, { steps: 8 });
  await page.mouse.up();
  expect((await piecesOnBoard(page)).e4).toBe('white pawn');

  await page.getByRole('button', { name: 'Check' }).click();
  await expect(page.locator('.score')).toHaveText('6 / 7 correct, 1 misplaced');
  const shapes = await page.evaluate(() =>
    (window as any).structureCg.state.drawable.autoShapes.map((s: any) => `${s.brush}:${s.orig}${s.piece ? ':' + s.piece.role : ''}`),
  );
  expect(shapes.filter((s: string) => s.startsWith('green'))).toHaveLength(6);
  expect(shapes).toContain('red:c5');
  expect(shapes).toContain('blue:e5:pawn');

  // An edit takes the marks away until Check again
  const c5 = await squarePoint(page, 'c5');
  await page.mouse.move(c5.x, c5.y);
  await page.mouse.down();
  await page.mouse.move(c5.x + 300, c5.y - 400, { steps: 8 }); // dropped off the board: removed
  await page.mouse.up();
  await expect(page.locator('.score')).toHaveCount(0);
  await expect(pawnButton(page)).toContainText('6/7');

  // The eraser
  await page.locator('.piece-button.eraser').click();
  await tapSquare(page, 'h7');
  expect((await piecesOnBoard(page)).h7).toBeUndefined();
});

test('back: the whole structure, your mistakes and the plans', async ({ page }) => {
  await load(page);
  await pawnButton(page).click();
  for (const key of ['b7', 'f7', 'g7', 'h7', 'a6', 'd6', 'c5']) await tapSquare(page, key);

  // Turned in place (the page kept)
  await page.evaluate(() => (window as any).updateChessMode('Viewer'));
  await expect(page.locator('.palette')).toHaveCount(0);
  await expect(page.locator('.score')).toHaveText('You placed 6 of 7, 1 misplaced');
  await expect(page.locator('.plans')).toContainText('Plano das brancas:');
  expect(Object.keys(await piecesOnBoard(page))).toHaveLength(14);
  const marks = await page.evaluate(() =>
    (window as any).structureCg.state.drawable.autoShapes.map((s: any) => `${s.brush}:${s.orig}${s.dest ?? ''}`),
  );
  expect(marks).toEqual(expect.arrayContaining(['green:d5', 'green:f6d5', 'red:c5', 'red:e5']));

  // A new page for the back side (Anki desktop) reads the attempt kept by the front
  await page.evaluate(() => sessionStorage.setItem('test_board_mode', 'Viewer'));
  await page.reload();
  await expect(page.locator('.score')).toHaveText('You placed 6 of 7, 1 misplaced');
});

test('a chapter with moves still opens the game card', async ({ page }) => {
  await page.addInitScript(() => {
    (window as any).DEV_OVERRIDES = { boardMode: 'Viewer', pgn: '1. e4 e5 2. Nf3 *' };
  });
  await page.goto('/');
  await expect(page.locator('#pgnViewer')).toBeVisible();
  await expect(page.locator('.palette')).toHaveCount(0);
});

test('screenshots', async ({ page }) => {
  test.skip(!process.env.STRUCTURE_SHOTS, 'only when asked (STRUCTURE_SHOTS=<folder>)');
  const out = process.env.STRUCTURE_SHOTS!;
  for (const [name, size] of [
    ['desktop', { width: 1100, height: 650 }],
    ['phone', { width: 390, height: 844 }],
  ] as const) {
    await page.setViewportSize(size);
    await load(page);
    await pawnButton(page).click();
    for (const key of ['b7', 'f7', 'g7', 'a6', 'c5']) await tapSquare(page, key);
    await page.getByRole('button', { name: 'Check' }).click();
    await page.screenshot({ path: `${out}/structure-front-${name}.png` });
    await page.evaluate(() => (window as any).updateChessMode('Viewer'));
    await page.waitForTimeout(500); // the board's animation
    await page.screenshot({ path: `${out}/structure-back-${name}.png` });
  }
});

test('quick taps on a phone all place a piece', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await load(page);
  await pawnButton(page).click();
  for (const key of BLACK_PAWNS) await tapSquare(page, key);
  await expect(pawnButton(page)).toContainText('7/7');
  await page.getByRole('button', { name: 'Check' }).click();
  await expect(page.locator('.score')).toHaveText('7 / 7 correct');
  await expect(page.locator('.score')).toHaveClass(/perfect/);
});
