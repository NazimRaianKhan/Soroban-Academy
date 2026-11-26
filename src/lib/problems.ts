export type Problem = { txt: string; ans: number; set?: boolean; a?: number; b?: number; op?: "+" | "-" };

const R = (a: number, b: number) => a + Math.floor(Math.random() * (b - a + 1));

/** Classify one digit step: D = direct, F = friend of 5, T = friend of 10 (carry/borrow). */
function cls(d: number, e: number, op: "+" | "-"): "D" | "F" | "T" {
  if (op === "+") {
    if (d + e >= 10) return "T";
    return (e < 5 || d < 5) && (d % 5) + (e % 5) <= 4 ? "D" : "F";
  }
  if (d < e) return "T";
  return (e < 5 || d >= 5) && e % 5 <= d % 5 ? "D" : "F";
}

export function gen(level: number): Problem {
  if (level === 1) { const a = R(0, 9); return { txt: String(a), ans: a, set: true }; }
  if (level === 2) { const n = R(2, 4), a = R(10 ** (n - 1), 10 ** n - 1); return { txt: String(a), ans: a, set: true }; }
  for (let i = 0; i < 500; i++) {
    const a = R(1, 99), b = R(1, 99), op: "+" | "-" = Math.random() < 0.5 ? "+" : "-";
    if (op === "-" && a < b) continue;
    const A = [Math.floor(a / 10), a % 10], B = [Math.floor(b / 10), b % 10];
    const c = A.map((d, j) => cls(d, B[j], op));
    const T = c.includes("T"), F = c.includes("F");
    if ((level === 3 && !T && !F) || (level === 4 && !T && F) || (level === 5 && T))
      return { txt: `${a} ${op === "+" ? "+" : "−"} ${b}`, ans: op === "+" ? a + b : a - b, a, b, op };
  }
  return { txt: "3 + 4", ans: 7, a: 3, b: 4, op: "+" };
}
