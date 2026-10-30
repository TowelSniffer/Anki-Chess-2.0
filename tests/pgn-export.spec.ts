import { test, expect, type Page } from '@playwright/test';
import { Chess, DEFAULT_POSITION } from 'chess.js';
import type { CustomPgnGame } from '$Types/ChessStructs';
import { parsePGN } from '$features/pgn/pgnParsing';
import { augmentPgnTree } from '$features/pgn/augmentPgn';
import { writePgn, writePgnFrom } from '$features/pgn/pgnWriter';

test.skip(({ browserName }) => browserName !== 'chromium', 'Logic tests only need Chromium');

// Starts with black to move, with comments, commands, NAGs and nested variations
const startFen = 'rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq - 0 1';
const studyPgn = `[Event "WCh26 m"]
[Site "Moscow"]
[Date "1966.??.??"]
[White "Spassky, Boris V"]
[Black "Petrosian, Tigran V"]
[Result "0-1"]
[WhiteElo "2620"]
[ChapterURL "https://lichess.org/study/abcdefgh/ijklmnop"]
[AnkiChessId "study/abcdefgh/ijklmnop"]
[FEN "${startFen}"]
[SetUp "1"]

{ Intro } 1... e5! { [%cal Gg8f6] [%eval 0.2] Solid } (1... c5 { Sicilian } 2. Nf3 (2. Nc3 Nc6) 2... d6) 2. Nf3 Nc6 3. Bb5 0-1`;

function load(pgn: string): CustomPgnGame {
  const { parsedPgn } = parsePGN(pgn);
  augmentPgnTree(parsedPgn.moves, [], new Chess(parsedPgn.tags?.FEN ?? DEFAULT_POSITION), new Map());
  return parsedPgn;
}

test.describe('writePgn', () => {
  test('writes the tags, comments, commands, NAGs and variations back', () => {
    const pgn = writePgn(load(studyPgn));
    expect(pgn).toContain('[Date "1966.??.??"]');
    expect(pgn).toContain('[WhiteElo "2620"]');
    expect(pgn).toContain(
      '{ Intro } 1... e5 $1 { [%cal Gg8f6] [%eval 0.2] Solid } (1... c5 { Sicilian } 2. Nf3 (2. Nc3 Nc6) 2... d6) 2. Nf3 Nc6 3. Bb5 0-1',
    );
    // The Seven Tag Roster first
    expect(pgn.indexOf('[Result')).toBeLessThan(pgn.indexOf('[WhiteElo'));
  });

  test("gets its own id instead of the card's, so a card made from it is another card", () => {
    const pgn = writePgn(load(studyPgn));
    expect(pgn).toMatch(/\[AnkiChessId "analysis\/[0-9a-f]{8}"\]/);
    expect(pgn).not.toContain('[AnkiChessId "study/abcdefgh/ijklmnop"]');
    expect(pgn.match(/\[AnkiChessId/g)).toHaveLength(1);
    expect(pgn).toContain('[ChapterURL "https://lichess.org/study/abcdefgh/ijklmnop"]');
    expect(pgn).toContain(`[FEN "${startFen}"]`);
  });

  test('reads back to the same game', () => {
    const once = writePgn(load(studyPgn));
    expect(writePgn(load(once))).toBe(once);
  });

  test('writes the moves added while analysing', () => {
    const game = load(studyPgn);
    const chess = new Chess(startFen);
    const move = chess.move('d5');
    game.moves[0].variations.push([
      {
        ...game.moves[0],
        san: move.san,
        before: move.before,
        after: move.after,
        turn: 'b',
        nag: [],
        commentAfter: undefined,
        commentDiag: undefined,
        variations: [],
      },
    ]);
    expect(writePgn(game)).toContain('2... d6) (1... d5) 2. Nf3');
  });
});

test.describe('writePgnFrom', () => {
  test('starts a new game from a position inside a variation', () => {
    const game = load(studyPgn);
    // After 1... c5, the first move of the first variation of 1... e5
    const pgn = writePgnFrom(game, [0, 'v', 0, 0], startFen);
    const fen = game.moves[0].variations[0][0].after;

    expect(pgn).toContain(`[FEN "${fen}"]`);
    expect(pgn).toContain('[SetUp "1"]');
    expect(pgn).toContain('[White "Spassky, Boris V"]');
    expect(pgn).toMatch(/\n\n2\. Nf3 \(2\. Nc3 Nc6\) 2\.\.\. d6 0-1$/);
    // Its own id, so the importer never takes it for the chapter
    expect(pgn).toMatch(/\[AnkiChessId "analysis\/[0-9a-f]{8}"\]/);
    expect(pgn.match(/\[AnkiChessId/g)).toHaveLength(1); // the chapter's id is gone
    // And it is a game the template can load
    expect(load(pgn).moves.map((m) => m.san)).toEqual(['Nf3', 'd6']);
  });

  test('from the start of the game, and from a position with no moves after it', () => {
    const game = load(studyPgn);
    expect(writePgnFrom(game, [], startFen)).toContain(`[FEN "${startFen}"]`);
    expect(writePgnFrom(game, [], startFen)).toContain('1... e5 $1');

    const end = writePgnFrom(game, [3], startFen); // after 3. Bb5
    expect(end).toContain(`[FEN "${game.moves[3].after}"]`);
    expect(end).toMatch(/\n\n0-1$/);
  });

  test('the same analysis keeps the same id', () => {
    const a = writePgnFrom(load(studyPgn), [0], startFen);
    const b = writePgnFrom(load(studyPgn), [0], startFen);
    const c = writePgnFrom(load(studyPgn), [1], startFen);
    const id = (pgn: string) => pgn.match(/\[AnkiChessId "([^"]+)"\]/)![1];
    expect(id(a)).toBe(id(b));
    expect(id(a)).not.toBe(id(c));
  });
});

// The back of a card, with the copy and pycmd captured
async function loadViewer(page: Page, withAddon: boolean) {
  await page.addInitScript(
    ({ pgn, withAddon }) => {
      localStorage.setItem('svelte-render-scan-enabled', 'false');
      (window as any).USER_CONFIG = { timer: 0 };
      (window as any).DEV_OVERRIDES = { boardMode: 'Viewer', pgn };
      const execCommand = document.execCommand.bind(document);
      document.execCommand = (command: string, ...args: any[]) => {
        if (command !== 'copy') return execCommand(command, ...args);
        (window as any).copied = (document.activeElement as HTMLTextAreaElement).value;
        return true;
      };
      if (withAddon) {
        (window as any).ANKI_CHESS_IMPORTER = 1;
        (window as any).pycmd = (message: string) => ((window as any).sent ??= []).push(message);
      }
    },
    { pgn: studyPgn, withAddon },
  );
  await page.goto('/');
  await expect.poll(() => page.evaluate(() => !!(window as any).gameStore?.cg)).toBe(true);
}

const openMenu = (page: Page) => page.locator('.export .trigger').click();

test('copies the PGN with the moves played on the back', async ({ page }) => {
  await loadViewer(page, false);
  await page.evaluate(() => (window as any).gameStore.reset());
  await page.evaluate(() => (window as any).gameStore.cg.move('d7', 'd5'));
  await expect.poll(() => page.evaluate(() => (window as any).gameStore.currentMove?.san)).toBe('d5');

  await openMenu(page);
  // Only Anki desktop with the add-on can open the Add window
  await expect(page.getByText('New card with this PGN')).toHaveCount(0);
  await page.getByText('Copy PGN', { exact: true }).click();
  const whole = await page.evaluate(() => (window as any).copied as string);
  expect(whole).toContain('2... d6) (1... d5) 2. Nf3');
  expect(whole).toMatch(/\[AnkiChessId "analysis\//);

  await openMenu(page);
  await page.getByText('Copy PGN from this position').click();
  const fromHere = await page.evaluate(() => (window as any).copied as string);
  const fen = await page.evaluate(() => (window as any).gameStore.fen as string);
  expect(fromHere).toContain(`[FEN "${fen}"]`);
  expect(fromHere).toMatch(/\[AnkiChessId "analysis\//);
});

test('sends the PGN of Copy PGN to the add-on for a new card', async ({ page }) => {
  await loadViewer(page, true);
  // At the end of a line added on the back, wherever the board is
  await page.evaluate(() => (window as any).gameStore.reset());
  await page.evaluate(() => (window as any).gameStore.cg.move('d7', 'd5'));
  await expect.poll(() => page.evaluate(() => (window as any).gameStore.currentMove?.san)).toBe('d5');

  await openMenu(page);
  await page.getByText('Copy PGN', { exact: true }).click();
  const copied = await page.evaluate(() => (window as any).copied as string);

  await openMenu(page);
  await page.getByText('New card with this PGN').click();
  const sent = await page.evaluate(() =>
    ((window as any).sent as string[]).filter((m) => m.startsWith('ankiChessImporter:newNote:')),
  );
  expect(sent).toHaveLength(1);
  const payload = JSON.parse(sent[0].slice('ankiChessImporter:newNote:'.length));
  expect(payload.pgn).toBe(copied);
  expect(payload.pgn).toContain(`[FEN "${startFen}"]`);
  expect(payload.pgn).toContain('{ Intro } 1... e5 $1');
  expect(payload.pgn).toContain('(1... d5) 2. Nf3 Nc6 3. Bb5 0-1');
});
