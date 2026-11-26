import { describe, expect, it } from "vitest";
import { gen } from "../problems";

const digits = (n: number) => [Math.floor(n / 10), n % 10];
const hasCarryOrBorrow = (a: number, b: number, op: "+" | "-") =>
  digits(a).some((d, i) => (op === "+" ? d + digits(b)[i] >= 10 : d < digits(b)[i]));

describe("problem generator", () => {
  it("level 1 gives digits 0-9; level 2 gives 2-4 digit numbers", () => {
    for (let i = 0; i < 200; i++) {
      const a = gen(1); expect(a.ans).toBeGreaterThanOrEqual(0); expect(a.ans).toBeLessThanOrEqual(9);
      const b = gen(2); expect(b.ans).toBeGreaterThanOrEqual(10); expect(b.ans).toBeLessThanOrEqual(9999);
    }
  });
  it("answers are arithmetically correct and never negative", () => {
    for (const lv of [3, 4, 5]) for (let i = 0; i < 300; i++) {
      const p = gen(lv);
      expect(p.ans).toBe(p.op === "+" ? p.a! + p.b! : p.a! - p.b!);
      expect(p.ans).toBeGreaterThanOrEqual(0);
    }
  });
  it("levels 3 and 4 never need a carry or borrow", () => {
    for (const lv of [3, 4]) for (let i = 0; i < 300; i++) {
      const p = gen(lv); expect(hasCarryOrBorrow(p.a!, p.b!, p.op!)).toBe(false);
    }
  });
  it("level 5 always needs a carry or borrow", () => {
    for (let i = 0; i < 300; i++) { const p = gen(5); expect(hasCarryOrBorrow(p.a!, p.b!, p.op!)).toBe(true); }
  });

  it("every calculation problem's answer matches its terms and never goes negative at any step", () => {
    for (const lv of [3, 4, 5, 6, 7]) for (let i = 0; i < 300; i++) {
      const p = gen(lv); let v = p.terms![0];
      p.terms!.slice(1).forEach((n, k) => { v += p.ops![k] === "+" ? n : -n; expect(v).toBeGreaterThanOrEqual(0); });
      expect(v).toBe(p.ans);
    }
  });
  it("level 6 has 3-digit carries/borrows across 2+ rods, or borrows through zeros", () => {
    for (let i = 0; i < 300; i++) {
      const p = gen(6), [a, b] = p.terms!, op = p.ops![0];
      const A = String(a).padStart(3, "0").split("").map(Number), B = String(b).padStart(3, "0").split("").map(Number);
      const t = A.filter((d, j) => (op === "+" ? d + B[j] >= 10 : d < B[j])).length;
      expect(t >= 2 || (op === "-" && a % 100 === 0 && b < 100)).toBe(true);
    }
  });
  it("level 7 chains 3-5 numbers using both + and -", () => {
    for (let i = 0; i < 300; i++) {
      const p = gen(7);
      expect(p.terms!.length).toBeGreaterThanOrEqual(3); expect(p.terms!.length).toBeLessThanOrEqual(5);
      expect(p.ops).toContain("+"); expect(p.ops).toContain("-");
    }
  });
});
