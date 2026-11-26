import { describe, expect, it } from "vitest";
import { LEVELS } from "../../data/levels";

describe("lesson content", () => {
  it("every step has English and Bengali text", () => {
    for (const l of LEVELS) {
      expect(l.n.en && l.n.bn && l.hint.en && l.hint.bn).toBeTruthy();
      for (const st of l.steps) expect(st.en.length > 3 && st.bn.length > 3).toBe(true);
    }
  });
  it("every target fits on the level's rods", () => {
    for (const l of LEVELS) for (const st of l.steps) if (st.target !== undefined) expect(st.target).toBeLessThan(10 ** l.rods);
  });
  it("target values are all different from the previous one, so a step never completes itself", () => {
    for (const l of LEVELS) { let prev: number | undefined; for (const st of l.steps) { if (st.target !== undefined) { expect(st.target).not.toBe(prev); prev = st.target; } } }
  });
});
