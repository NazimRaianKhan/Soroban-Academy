export type Op = "+" | "-";
export type Problem = {
  txt: string; ans: number; set?: boolean;
  terms?: number[]; ops?: Op[];            // every calculation problem: first number, then each op + number in order
  a?: number; b?: number; op?: Op;         // first pair (kept for convenience and tests)
};

const R = (a: number, b: number) => a + Math.floor(Math.random() * (b - a + 1));
const SYM: Record<Op, string> = { "+": "+", "-": "−" };

/** Classify one digit step: D = direct, F = friend of 5, T = friend of 10 (carry/borrow). */
function cls(d: number, e: number, op: Op): "D" | "F" | "T" {
  if (op === "+") {
    if (d + e >= 10) return "T";
    return (e < 5 || d < 5) && (d % 5) + (e % 5) <= 4 ? "D" : "F";
  }
  if (d < e) return "T";
  return (e < 5 || d >= 5) && e % 5 <= d % 5 ? "D" : "F";
}
const cols = (n: number, len: number) => String(n).padStart(len, "0").split("").map(Number);
const countT = (a: number, b: number, op: Op, len: number) => {
  const A = cols(a, len), B = cols(b, len);
  return A.filter((d, i) => cls(d, B[i], op) === "T").length;
};

function mk(terms: number[], ops: Op[]): Problem {
  let v = terms[0];
  ops.forEach((o, i) => { v += o === "+" ? terms[i + 1] : -terms[i + 1]; });
  const txt = terms.map((n, i) => (i ? `${SYM[ops[i - 1]]} ${n}` : String(n))).join(" ");
  return { txt, ans: v, terms, ops, a: terms[0], b: terms[1], op: ops[0] };
}
const randOp = (): Op => (Math.random() < 0.5 ? "+" : "-");

export function gen(level: number): Problem {
  if (level === 1) { const a = R(0, 9); return { txt: String(a), ans: a, set: true }; }
  if (level === 2) { const n = R(2, 4), a = R(10 ** (n - 1), 10 ** n - 1); return { txt: String(a), ans: a, set: true }; }

  if (level >= 3 && level <= 5) {
    for (let i = 0; i < 500; i++) {
      const a = R(1, 99), b = R(1, 99), op = randOp();
      if (op === "-" && a < b) continue;
      const c = [Math.floor(a / 10), a % 10].map((d, j) => cls(d, [Math.floor(b / 10), b % 10][j], op));
      const T = c.includes("T"), F = c.includes("F");
      if ((level === 3 && !T && !F) || (level === 4 && !T && F) || (level === 5 && T)) return mk([a, b], [op]);
    }
    return mk([3, 4], ["+"]);
  }

  if (level === 6) { // 3-digit numbers with carries/borrows travelling across at least two rods, or borrowing through zeros
    if (Math.random() < 0.3) return mk([R(1, 9) * 100, R(11, 99)], ["-"]);
    for (let i = 0; i < 500; i++) {
      const a = R(100, 999), b = R(100, 999), op = randOp();
      if (op === "-" && a < b) continue;
      if (countT(a, b, op, 3) >= 2) return mk([a, b], [op]);
    }
    return mk([300, 47], ["-"]);
  }

  // level 7: chains of 3-5 numbers, both + and −, never going below zero
  for (let i = 0; i < 500; i++) {
    const n = R(3, 5); let v = R(20, 99); const terms = [v], ops: Op[] = []; let ok = true;
    for (let k = 1; k < n; k++) {
      const o = randOp(), x = R(2, 99), nv = o === "+" ? v + x : v - x;
      if (nv < 0 || nv > 999) { ok = false; break; }
      terms.push(x); ops.push(o); v = nv;
    }
    if (ok && ops.includes("+") && ops.includes("-")) return mk(terms, ops);
  }
  return mk([56, 38, 17], ["+", "-"]);
}
