// tests/config-logic.spec.ts
import { test, expect } from '@playwright/test';
import { pieceSprites } from '$utils/toolkit/pieceSprites';
import { BOARD_THEMES } from '$utils/themeData';
import { mirrorFen } from '$features/pgn/mirror';

test.skip(({ browserName }) => browserName !== 'chromium', 'Logic tests only need Chromium');

const noCastlePgn = `
[FEN "r7/pppq1kpp/3p1n2/2b5/3nP1b1/P1NP4/1PPQ1PPP/R1B2RK1 w - - 3 12"]
[SetUp "1"]

12. f3 Nxf3+ {[%EV 99.7]} (12... Nb3+ {[%EV 99.5]}) *
`;

const castlePgn = `1. e4 e5 *`;

const invalidPgn = 'BAD_PGN';

const aiPgn = 'r7/pppq1kpp/3p1n2/2b5/3nPQb1/P1NP4/1PP2PPP/R1B2RK1 b - - 4 12';

const mirrorStates = ['original', 'original_mirror', 'invert', 'invert_mirror'];
const booleanStates = [false, true];

const pieceThemes = ['merida', 'cburnett'];
const boardThemes = ['sepia', 'green'];

// --- Interaction & Persistence Tests ---

for (const playBothSides of booleanStates) {
  test(`evaluates movable color after move for playBothSides: ${playBothSides}`, async ({
    page,
  }) => {
    await page.addInitScript(
      ({ playBothSides, mockPgn }) => {
        (window as any).USER_CONFIG = { playBothSides: playBothSides };
        (window as any).DEV_OVERRIDES = { boardMode: 'Puzzle', pgn: mockPgn };
      },
      { playBothSides, mockPgn: castlePgn },
    );

    await page.goto('/', { waitUntil: 'commit' });
    await expect(async () => {
      // Trigger a move in the browser
      await page.evaluate(() => {
        const store = (window as any).gameStore;
        store.cg.move('e2', 'e4');
      });

      const movableColor = await page.evaluate(() => {
        return (window as any).gameStore.cg.state.movable.color;
      });

      if (playBothSides) {
        // playBothSides converts Puzzle to Study mode, so movable tracks the active turn
        expect(movableColor).toBe('black');
      } else {
        // Strict Puzzle mode locks the movable color to the player's initial color
        expect(movableColor).toBe('white');
      }
    }).toPass();
  });
}

for (const storePath of booleanStates) {
  test(`evaluates localStorage for storePgnPath: ${storePath} upon Viewer transition`, async ({
    page,
  }) => {
    await page.addInitScript(
      ({ storePath, mockPgn }) => {
        (window as any).USER_CONFIG = { storePgnPath: storePath };
        (window as any).DEV_OVERRIDES = { boardMode: 'Puzzle', pgn: mockPgn };
      },
      { storePath, mockPgn: castlePgn },
    );

    await page.goto('/', { waitUntil: 'commit' });

    await expect(async () => {
      // 1. Run browser logic and return the result to Node
      const storedPath = await page.evaluate(() => {
        const store = (window as any).gameStore;
        store.cg.move('e2', 'e4');
        (window as any).updateChessMode('Viewer');
        return store.currentPathKey;
      });

      // 2. Run Playwright expectations in Node
      if (storePath) {
        expect(storedPath).toBe('0');
      } else {
        // If storePgnPath is false, the store resets pgnPath to [], so the key is ''
        expect(storedPath).toBe('');
      }
    }).toPass();
  });
}

for (const strictScoring of booleanStates) {
  test(`evaluates puzzleScore for strictScoring: ${strictScoring} on mistake`, async ({ page }) => {
    await page.addInitScript(
      ({ strictScoring }) => {
        (window as any).USER_CONFIG = { strictScoring: strictScoring, timer: 0 };
        (window as any).DEV_OVERRIDES = { boardMode: 'Puzzle' };
      },
      { strictScoring },
    );

    await page.goto('/', { waitUntil: 'commit' });

    await expect(async () => {
      const score = await page.evaluate(() => {
        const store = (window as any).gameStore;

        // Simulate a user mistake directly on the live object in the browser
        store.hasMadeMistake = true;

        return store.puzzleScore;
      });

      if (strictScoring) {
        expect(score).toBe('fail');
      } else {
        // If not strict, it shouldn't fail immediately just from a mistake flag
        expect(score).toBeNull();
      }
    }).toPass();
  });
}

test('prevents mirror on PGNs with castling rights (castlePgn)', async ({ page }) => {
  await page.addInitScript(
    ({ mockPgn }) => {
      // Force mirror true and an invert state to ensure it gets rejected
      (window as any).USER_CONFIG = { mirror: true };
      (window as any).DEV_OVERRIDES = {
        boardMode: 'Puzzle',
        mirrorState: 'invert',
        pgn: mockPgn,
      };
    },
    { mockPgn: castlePgn },
  );

  await page.goto('/', { waitUntil: 'commit' });
  await expect(async () => {
    // verify the board defaults to the standard starting position instead of inverted
    const startFen = await page.evaluate(() => (window as any).gameStore.startFen);
    expect(startFen).toBe('rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1');
  }).toPass();
});

test('auto-detects AI mode and sets movable color from FEN (aiPgn)', async ({ page }) => {
  await page.addInitScript(
    ({ mockFen }) => {
      (window as any).DEV_OVERRIDES = {
        pgn: mockFen,
        boardMode: 'Puzzle', // GameProvider should override this to 'AI'
      };
    },
    { mockFen: aiPgn },
  );

  await page.goto('/', { waitUntil: 'commit' });
  await expect(async () => {
    // 1. Check GameProvider override
    const boardMode = await page.evaluate(() => (window as any).gameStore.boardMode);
    expect(boardMode).toBe('AI');

    const isEngineEnabled = await page.evaluate(
      () => (window as any).gameStore.engineStore.enabled,
    );
    expect(isEngineEnabled).toBe(true);

    // 2. Check Movable color (FEN 'b' dictates black to move)
    const movableColor = await page.evaluate(
      () => (window as any).gameStore.cg.state.movable.color,
    );
    expect(movableColor).toBe('black');
  }).toPass();
});

for (const aiEval of booleanStates) {
  test(`toggles analysisMode class for aiEval: ${aiEval}`, async ({ page }) => {
    await page.addInitScript(
      ({ mockFen, aiEval }) => {
        (window as any).USER_CONFIG = { aiEval: aiEval };
        (window as any).DEV_OVERRIDES = {
          pgn: mockFen,
          boardMode: 'Puzzle',
        };
      },
      { mockFen: aiPgn, aiEval },
    );

    await page.goto('/', { waitUntil: 'commit' });
    await expect(async () => {
      const boardWrapper = page.locator('.board-wrapper');
      const isEngineEnabled = await page.evaluate(
        () => (window as any).gameStore.engineStore.enabled,
      );
      expect(isEngineEnabled).toBe(true);

      if (aiEval) {
        await expect(boardWrapper).toHaveClass(/analysisMode/);
      } else {
        await expect(boardWrapper).not.toHaveClass(/analysisMode/);
      }
    }).toPass();
  });
}

test('displays ErrorPopup for invalid PGN (invalidPgn)', async ({ page }) => {
  await page.addInitScript(
    ({ mockInvalid }) => {
      (window as any).DEV_OVERRIDES = { pgn: mockInvalid };
    },
    { mockInvalid: invalidPgn },
  );
  await page.goto('/', { waitUntil: 'commit' });

  await expect(async () => {
    // 1. Check store state
    const parseError = await page.evaluate(() => (window as any).gameStore.parseError);
    expect(parseError).toBeTruthy();

    // 2. Check UI Popup overlay
    const errorPopup = page.locator('.popup-overlay');
    await expect(errorPopup).toBeVisible();

    const heading = page.locator('.popup-content h2');
    await expect(heading).toHaveText('⚠️ PGN Parsing Error');
  }).toPass();
});

// Restrict loop to the shortest array to prevent undefined errors
const maxLen = Math.min(pieceThemes.length, boardThemes.length);

for (let i = 0; i < maxLen; i++) {
  const pTheme = pieceThemes[i];
  const bTheme = boardThemes[i];

  test(`evaluates themes - piece: ${pTheme}, board: ${bTheme}`, async ({ page }) => {
    await page.addInitScript(
      ({ pTheme, bTheme }) => {
        (window as any).USER_CONFIG = { pieceTheme: pTheme, boardTheme: bTheme };
      },
      { pTheme, bTheme },
    );

    await page.goto('/', { waitUntil: 'commit' });

    // Check Piece Theme on .board-wrapper
    const boardWrapper = page.locator('.board-wrapper');
    await expect(boardWrapper).toBeVisible();

    const spriteUrl = await boardWrapper.evaluate((el) =>
      el.style.getPropertyValue('--theme-sprite'),
    );
    expect(spriteUrl).toContain(pieceSprites[pTheme]);

    // Check Board Theme on #container
    const container = page.locator('#container');

    const lightColor = await container.evaluate((el) => el.style.getPropertyValue('--board-light'));
    const darkColor = await container.evaluate((el) => el.style.getPropertyValue('--board-dark'));

    expect(lightColor).toBe(BOARD_THEMES[bTheme].light);
    expect(darkColor).toBe(BOARD_THEMES[bTheme].dark);
  });
}

for (const showDests of booleanStates) {
  test(`evaluates correct cg config for showDests: ${showDests}`, async ({ page }) => {
    await page.addInitScript(
      ({ showDests }) => {
        // Pass the dynamic flipBoard state
        (window as any).USER_CONFIG = { showDests: showDests };
      },
      { showDests: showDests },
    );

    await page.goto('/', { waitUntil: 'commit' });

    // Verify the cg state config
    await expect(async () => {
      const expectedShowDests = await page.evaluate(
        () => (window as any).gameStore.cg.state.movable.showDests,
      );

      expect(expectedShowDests).toBe(showDests);
    }).toPass();
  });
}

for (const flipBoard of booleanStates) {
  for (const state of mirrorStates) {
    test(`evaluates correct bar-bottom-color and pgnPath for mirror: ${state}, flipBoard: ${flipBoard}`, async ({
      page,
    }) => {
      await page.addInitScript(
        ({ mockState, mockPgn, isFlipped }) => {
          // Pass the dynamic flipBoard state
          (window as any).USER_CONFIG = { mirror: true, timer: 10, flipBoard: isFlipped };

          (window as any).DEV_OVERRIDES = {
            boardMode: 'Puzzle',
            mirrorState: mockState,
            pgn: mockPgn,
          };
        },
        { mockState: state, mockPgn: noCastlePgn, isFlipped: flipBoard },
      );

      await page.goto('/', { waitUntil: 'commit' });

      const boardWrapper = page.locator('.board-wrapper');
      await expect(boardWrapper).toBeVisible();

      // Invert the expected color if flipBoard is true
      const isBaseInvert = state.includes('invert');
      const expectBlack = flipBoard ? !isBaseInvert : isBaseInvert;
      const expectedColor = expectBlack ? 'rgb(15, 15, 15)' : 'rgb(234, 234, 234)';

      // Verify the internal store pgnPath
      await expect(async () => {
        const pathKey = await page.evaluate(() => (window as any).gameStore.currentPathKey);
        const expectPathKey = flipBoard ? '0' : '';
        expect(pathKey).toBe(expectPathKey);

        const startFen = await page.evaluate(() => (window as any).gameStore.startFen);
        const preMirrorFen = 'r7/pppq1kpp/3p1n2/2b5/3nP1b1/P1NP4/1PPQ1PPP/R1B2RK1 w - - 3 12';
        const expectStartFen = mirrorFen(preMirrorFen, state);
        expect(expectStartFen).toBe(startFen);

        const movableColor = await page.evaluate(
          () => (window as any).gameStore.cg.state.movable.color,
        );
        let expectMovableColor = flipBoard ? 'black' : 'white';
        if (isBaseInvert) expectMovableColor = expectMovableColor === 'white' ? 'black' : 'white';

        expect(movableColor).toBe(expectMovableColor);
      }).toPass();

      await page.screenshot({
        path: `test-results/debug-mirror-${state}-flip-${flipBoard}.png`,
        fullPage: true,
      });

      await expect(async () => {
        const bottomColor = await boardWrapper.evaluate((el) =>
          window.getComputedStyle(el.parentElement).getPropertyValue('--bar-bottom-color').trim(),
        );
        expect(bottomColor).toBe(expectedColor);
      }).toPass();
    });
  }
}
