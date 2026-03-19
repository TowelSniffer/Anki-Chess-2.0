// tests/config-logic.spec.ts
import { test, expect } from '@playwright/test';

test.skip(({ browserName }) => browserName !== 'chromium', 'Logic tests only need Chromium');

const noCastlePgn = `
[FEN "r7/pppq1kpp/3p1n2/2b5/3nP1b1/P1NP4/1PPQ1PPP/R1B2RK1 w - - 3 12"]
[SetUp "1"]

12. f3 Nxf3+ {[%EV 99.7]} (12... Nb3+ {[%EV 99.5]}) *
`;

const mirrorStates = ['original', 'original_mirror', 'invert', 'invert_mirror'];
const flipBoardStates = [false, true];

for (const flipBoard of flipBoardStates) {
  for (const state of mirrorStates) {
    test(`evaluates correct bar-bottom-color for mirror: ${state}, flipBoard: ${flipBoard}`, async ({ page }) => {

      await page.addInitScript(({ mockState, mockPgn, isFlipped }) => {
        // 1. Pass the dynamic flipBoard state
        (window as any).USER_CONFIG = { mirror: true, timer: 10, flipBoard: isFlipped };

        (window as any).DEV_OVERRIDES = {
          boardMode: 'Puzzle',
          mirrorState: mockState,
          pgn: mockPgn,
        };
      }, { mockState: state, mockPgn: noCastlePgn, isFlipped: flipBoard }); // Bind it here

      await page.goto('/', { waitUntil: 'commit' });

      const boardWrapper = page.locator('.board-wrapper');
      await expect(boardWrapper).toBeVisible();

      // 2. Invert the expected color if flipBoard is true
      const isBaseInvert = state.includes('invert');
      const expectBlack = flipBoard ? !isBaseInvert : isBaseInvert;
      const expectedColor = expectBlack ? 'rgb(15, 15, 15)' : 'rgb(234, 234, 234)';

      await page.screenshot({ path: `test-results/debug-mirror-${state}-flip-${flipBoard}.png`, fullPage: true });

      await expect(async () => {
        const bottomColor = await boardWrapper.evaluate((el) =>
          window.getComputedStyle(el.parentElement).getPropertyValue('--bar-bottom-color').trim(),
        );
        expect(bottomColor).toBe(expectedColor);
      }).toPass();
    });
  }
}
