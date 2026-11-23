// Material difference between the sides, counted from the pieces on the board (as on
// Lichess), so it also works for puzzles set up from a FEN, where no capture is known.

export type MaterialRole = 'q' | 'r' | 'b' | 'n' | 'p';

export const ROLE_VALUES: Record<MaterialRole, number> = { q: 9, r: 5, b: 3, n: 3, p: 1 };
const ROLES = Object.keys(ROLE_VALUES) as MaterialRole[]; // strongest first

export interface SideMaterial {
  pieces: MaterialRole[]; // pieces this side has more of, strongest first
  score: number; // points ahead, 0 when level or behind
}

export function materialDiff(fen: string): { w: SideMaterial; b: SideMaterial } {
  // Pieces of white minus pieces of black, by role
  const diff: Record<MaterialRole, number> = { q: 0, r: 0, b: 0, n: 0, p: 0 };
  for (const char of fen.split(' ')[0]) {
    const role = char.toLowerCase() as MaterialRole;
    if (role in diff) diff[role] += char === role ? -1 : 1;
  }

  const score = ROLES.reduce((total, role) => total + diff[role] * ROLE_VALUES[role], 0);
  const surplus = (sign: number) =>
    ROLES.flatMap((role) => Array<MaterialRole>(Math.max(0, sign * diff[role])).fill(role));

  return {
    w: { pieces: surplus(1), score: Math.max(0, score) },
    b: { pieces: surplus(-1), score: Math.max(0, -score) },
  };
}
