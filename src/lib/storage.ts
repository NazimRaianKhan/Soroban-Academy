import type { Lang } from "../i18n";

/** Shape used by the UI. Guests: stored in localStorage. Signed-in users: loaded from the database. */
export type Progress = {
  done: Record<number, number>; // level -> best quiz score (present = passed)
  att: number; ok: number; ms: number;
  lvl: Record<number, { a: number; o: number }>;
  days: string[];
};
export const fresh = (): Progress => ({ done: {}, att: 0, ok: 0, ms: 0, lvl: {}, days: [] });

const PKEY = "soroban-academy:v1";
const FKEY = "soroban-academy:prefs";

export function load(): Progress {
  try { return { ...fresh(), ...JSON.parse(localStorage.getItem(PKEY) || "{}") }; } catch { return fresh(); }
}
export function save(p: Progress) { try { localStorage.setItem(PKEY, JSON.stringify(p)); } catch { /* ignore */ } }

export type Prefs = { lang: Lang; audio: boolean };
export function loadPrefs(): Prefs {
  try {
    const o = JSON.parse(localStorage.getItem(FKEY) || "null");
    if (o) return { lang: o.lang === "bn" ? "bn" : "en", audio: !!o.audio };
    const old = JSON.parse(localStorage.getItem(PKEY) || "{}"); // migrate from Phase 1 storage
    return { lang: old.lang === "bn" ? "bn" : "en", audio: !!old.audio };
  } catch { return { lang: "en", audio: false }; }
}
export function savePrefs(p: Prefs) { try { localStorage.setItem(FKEY, JSON.stringify(p)); } catch { /* ignore */ } }

export const localDay = (d = new Date()) => d.toLocaleDateString("en-CA");
export function record(p: Progress, lv: number, ok: boolean, ms: number): Progress {
  const l = p.lvl[lv] ?? { a: 0, o: 0 };
  const today = localDay();
  return {
    ...p, att: p.att + 1, ok: p.ok + (ok ? 1 : 0), ms: p.ms + (ok ? ms : 0),
    lvl: { ...p.lvl, [lv]: { a: l.a + 1, o: l.o + (ok ? 1 : 0) } },
    days: p.days.includes(today) ? p.days : [...p.days, today],
  };
}
export function streak(p: Progress) {
  const d = new Date(); let n = 0;
  if (!p.days.includes(localDay(d))) d.setDate(d.getDate() - 1);
  while (p.days.includes(localDay(d))) { n++; d.setDate(d.getDate() - 1); }
  return n;
}
