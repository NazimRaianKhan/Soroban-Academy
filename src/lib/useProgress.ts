import { useCallback, useEffect, useState } from "react";
import { useAuth } from "../auth/AuthProvider";
import { supabase } from "./supabase";
import { fresh, load, localDay, record, save, type Progress } from "./storage";

/**
 * One hook, two storage backends:
 *  - guest: localStorage on this device
 *  - signed in: PostgreSQL (attempts + level_progress), protected by row-level security
 */
export function useProgress() {
  const { user } = useAuth();
  const uid = user?.id;
  const [prog, setProg] = useState<Progress>(() => (uid ? fresh() : load()));
  const [ready, setReady] = useState(!uid);

  useEffect(() => {
    let off = false;
    if (!uid || !supabase) { setProg(load()); setReady(true); return; }
    setReady(false); setProg(fresh());
    (async () => {
      const [s, d, l] = await Promise.all([
        supabase.from("my_level_stats").select("*"),
        supabase.from("my_active_days").select("day"),
        supabase.from("level_progress").select("level,best_score"),
      ]);
      if (off) return;
      const p = fresh();
      for (const r of (s.data ?? []) as { level: number; attempts: number; correct: number; correct_ms: number }[]) {
        p.lvl[r.level] = { a: r.attempts, o: r.correct };
        p.att += r.attempts; p.ok += r.correct; p.ms += Number(r.correct_ms);
      }
      p.days = ((d.data ?? []) as { day: string }[]).map((x) => x.day);
      for (const r of (l.data ?? []) as { level: number; best_score: number }[]) p.done[r.level] = r.best_score;
      setProg(p); setReady(true);
    })();
    return () => { off = true; };
  }, [uid]);

  const rec = useCallback((lv: number, ok: boolean, ms: number, kind: "practice" | "quiz") => {
    setProg((p) => { const n = record(p, lv, ok, ms); if (!uid) save(n); return n; });
    if (uid && supabase)
      supabase.from("attempts").insert({ level: lv, kind, correct: ok, ms: Math.min(Math.round(ms), 600000), local_day: localDay() })
        .then(({ error }) => { if (error) console.error("attempt not saved", error.message); });
  }, [uid]);

  const pass = useCallback((lv: number, score: number) => {
    setProg((p) => { const n = { ...p, done: { ...p.done, [lv]: Math.max(p.done[lv] ?? 0, score) } }; if (!uid) save(n); return n; });
    if (uid && supabase) supabase.rpc("pass_level", { p_level: lv, p_score: score }).then(({ error }) => { if (error) console.error(error.message); });
  }, [uid]);

  const reset = useCallback(() => { const f = fresh(); save(f); setProg(f); }, []);
  return { prog, ready, rec, pass, reset, isGuest: !uid };
}
