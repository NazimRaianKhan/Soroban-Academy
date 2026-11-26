import { describe, expect, it } from "vitest";
import { makeRods, tapBead, value } from "../abacus";

describe("abacus bead rules", () => {
  it("lower bead k moves beads 1..k up", () => {
    expect(value(tapBead(makeRods(1), 0, 3))).toBe(3);
  });
  it("tapping an already-raised lower bead lowers it and every bead above it", () => {
    const r = tapBead(tapBead(makeRods(1), 0, 4), 0, 2); // 4 up, then tap bead 2 -> only bead 1 remains
    expect(value(r)).toBe(1);
  });
  it("upper bead is worth 5 and toggles", () => {
    const up = tapBead(makeRods(1), 0, "u");
    expect(value(up)).toBe(5);
    expect(value(tapBead(up, 0, "u"))).toBe(0);
  });
  it("reads multi-rod numbers left to right", () => {
    let r = makeRods(3);
    r = tapBead(r, 0, 3); r = tapBead(r, 1, "u"); r = tapBead(r, 1, 2); r = tapBead(r, 2, 4); // 3, 7, 4
    expect(value(r)).toBe(374);
  });
  it("9 is the maximum on one rod", () => {
    let r = tapBead(makeRods(1), 0, "u"); r = tapBead(r, 0, 4);
    expect(value(r)).toBe(9);
  });
});
