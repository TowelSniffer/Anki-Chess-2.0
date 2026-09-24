import { test, expect } from '@playwright/test';
import { normalizeCastling } from '$features/pgn/pgnParsing';

test.skip(({ browserName }) => browserName !== 'chromium', 'Logic tests only need Chromium');

// Castling written with zeros, as exported by ChessBase and other sources (#117)
const zeroCastlePgn = `
[Event "Zero castling"]
[Result "1-0"]

1. e4 e5 2. Nf3 Nc6 3. Bc4 Bc5 4. 0-0 Nf6 5. d3 d6 6. Nc3 Bg4 7. Be3 Qd7 8. Qd2 0-0-0 1-0
`;

test('normalizes zero castling without touching results', () => {
  expect(normalizeCastling('4. 0-0 Nf6 5. d3 0-0 1-0')).toBe('4. O-O Nf6 5. d3 O-O 1-0');
  expect(normalizeCastling('8. 0-0-0 0-0-0 9. Kb1 0-1')).toBe('8. O-O-O O-O-O 9. Kb1 0-1');
  expect(normalizeCastling('4.0-0 Nf6 5...0-0+ (5... 0-0-0#) *')).toBe(
    '4.O-O Nf6 5...O-O+ (5... O-O-O#) *',
  );
  expect(normalizeCastling('12. 0-0!? 0-0?! 1/2-1/2')).toBe('12. O-O!? O-O?! 1/2-1/2');
  expect(normalizeCastling('[Result "1-0"]\n\n1. e4 { won 10-0 } *')).toBe(
    '[Result "1-0"]\n\n1. e4 { won 10-0 } *',
  );
});

test('loads a PGN with zero castling (0-0, 0-0-0)', async ({ page }) => {
  await page.addInitScript(
    ({ mockPgn }) => {
      (window as any).DEV_OVERRIDES = { boardMode: 'Viewer', pgn: mockPgn };
    },
    { mockPgn: zeroCastlePgn },
  );

  await page.goto('/', { waitUntil: 'commit' });

  await expect(async () => {
    const result = await page.evaluate(() => {
      const store = (window as any).gameStore;
      const moves = store.rootGame.moves;
      return {
        parseError: store.parseError,
        count: moves.length,
        whiteCastle: moves[6].san,
        blackCastle: moves[15].san,
      };
    });
    expect(result.parseError).toBeNull();
    expect(result.count).toBe(16);
    expect(result.whiteCastle).toBe('O-O');
    expect(result.blackCastle).toBe('O-O-O');
  }).toPass();
});
