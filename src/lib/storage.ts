import type { Lang } from "../i18n";

export type Progress = {
  done: Record<number, number>; // level -> best quiz score (present = passed)
  att: number; ok: number; ms: number;
  lvl: Record<number, { a: number; o: number }>;
  days: string[]; lang: Lang; audio: boolean;
};
const KEY = "soroban-academy:v1";
export const fresh = (): Progress => ({ done: {}, att: 0, ok: 0, ms: 0, lvl: {}, days: [], lang: "en", audio: false });

export function load(): Progress {
  try { return { ...fresh(), ...JSON.parse(localStorage.getItem(KEY) || "{}") }; } catch { return fresh(); }
}
export function save(p: Progress) { try { localStorage.setItem(KEY, JSON.stringify(p)); } catch { /* ignore */ } }

const day = (d: Date) => d.toLocaleDateString("en-CA");
export function record(p: Progress, lv: number, ok: boolean, ms: number): Progress {
  const l = p.lvl[lv] ?? { a: 0, o: 0 };
  const today = day(new Date());
  return {
    ...p, att: p.att + 1, ok: p.ok + (ok ? 1 : 0), ms: p.ms + (ok ? ms : 0),
    lvl: { ...p.lvl, [lv]: { a: l.a + 1, o: l.o + (ok ? 1 : 0) } },
    days: p.days.includes(today) ? p.days : [...p.days, today],
  };
}
export function streak(p: Progress) {
  const d = new Date(); let n = 0;
  if (!p.days.includes(day(d))) d.setDate(d.getDate() - 1);
  while (p.days.includes(day(d))) { n++; d.setDate(d.getDate() - 1); }
  return n;
}
