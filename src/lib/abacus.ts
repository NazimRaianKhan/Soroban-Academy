// Pure abacus logic: 1 upper bead (5) + 4 lower beads (1) per rod (Japanese soroban).
export type Rod = { u: 0 | 1; l: number }; // u: upper bead touching beam; l: lower beads touching beam (0-4)

export const makeRods = (n: number): Rod[] => Array.from({ length: n }, () => ({ u: 0, l: 0 }));
export const value = (rods: Rod[]) => rods.reduce((a, r) => a * 10 + r.u * 5 + r.l, 0);

/** Tap a bead. Tapping lower bead k moves beads 1..k up, or k..4 down when already up. */
export function tapBead(rods: Rod[], i: number, k: "u" | number): Rod[] {
  return rods.map((r, j) => {
    if (j !== i) return r;
    if (k === "u") return { ...r, u: r.u ? 0 : 1 };
    return { ...r, l: r.l >= k ? k - 1 : k };
  });
}
