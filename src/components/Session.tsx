import { useEffect, useRef, useState } from "react";
import { useApp } from "../ctx";
import { LEVELS } from "../data/levels";
import { gen, type Problem } from "../lib/problems";

type Props = {
  lv: number; quiz: boolean; value: number; resetRods: () => void;
  onRecord: (lv: number, ok: boolean, ms: number, kind: "practice" | "quiz") => void;
  onPass: (lv: number, score: number) => void;
};

/** One component for both Practice (endless, hints) and Quiz (5 questions, pass with 4). */
export function Session({ lv, quiz, value, resetRods, onRecord, onPass }: Props) {
  const { t, tx, speak } = useApp();
  const [q, setQ] = useState<Problem | null>(null);
  const [qs, setQs] = useState<{ i: number; ok: number } | null>(null);
  const [fb, setFb] = useState<{ c: string; m: string } | null>(null);
  const [locked, setLocked] = useState(false);
  const [, tick] = useState(0);
  const first = useRef(true), t0 = useRef(0), t1 = useRef(0);

  useEffect(() => { const id = setInterval(() => tick((x) => x + 1), 200); return () => clearInterval(id); }, []);

  const describe = (p: Problem) =>
    p.set ? `${t("setq")} ${p.txt}` : `${p.a} ${t(p.op === "+" ? "plus" : "minus")} ${p.b}`;

  const start = () => {
    const p = gen(lv);
    setQ(p); setFb(null); setLocked(false); first.current = true; t0.current = Date.now();
    resetRods(); speak(describe(p));
  };
  useEffect(() => { if (!quiz) start(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const check = () => {
    if (!q) return;
    const ok = value === q.ans;
    if (first.current) { first.current = false; onRecord(lv, ok, Date.now() - t0.current, quiz ? "quiz" : "practice"); }
    if (ok || quiz) { setLocked(true); t1.current = Date.now(); }
    if (quiz && ok) setQs((s) => s && { ...s, ok: s.ok + 1 });
    const m = ok ? t("ok") : quiz ? `${t("no2")} ${q.ans}` : t("no");
    setFb({ c: ok ? "ok" : "no", m }); speak(m);
  };
  const skip = () => { if (!locked && first.current) { first.current = false; onRecord(lv, false, 0, "practice"); } start(); };
  const startQuiz = () => { setQs({ i: 0, ok: 0 }); start(); };
  const nextQ = () => {
    if (!qs) return;
    const i = qs.i + 1;
    if (i >= 5) { if (qs.ok >= 4) onPass(lv, qs.ok); setQs({ ...qs, i }); setQ(null); resetRods(); }
    else { setQs({ ...qs, i }); start(); }
  };

  if (quiz && !qs) return (
    <div className="card"><p className="big">{tx(LEVELS[lv - 1].n)}</p>
      <button className="b pri" onClick={startQuiz}>{t("startq")}</button></div>
  );
  if (quiz && qs && qs.i >= 5) return (
    <div className="card"><p className="big">{t("score")}: {qs.ok}/5 {qs.ok >= 4 ? "⭐" : ""}</p>
      <p>{qs.ok >= 4 ? t("pass") : t("fail")}</p>
      <button className="b pri" onClick={startQuiz}>{t("again")}</button></div>
  );
  if (!q) return null;
  const secs = (((locked ? t1.current : Date.now()) - t0.current) / 1000).toFixed(1);
  return (
    <div className="card">
      <div className="row" style={{ margin: 0 }}>
        <span className="sm">{quiz && qs ? `${t("q")} ${qs.i + 1}/5` : ""}</span>
        <span className="sm">⏱ <b>{secs}</b>{t("sec")}</span>
      </div>
      <div className="big2">{q.txt}</div>
      <div className="sm" style={{ textAlign: "center" }}>{q.set ? t("setq") : t("opq")}</div>
      <div className={"fb " + (fb?.c ?? "")}>{fb ? fb.m : "\u00a0"}</div>
      <div className="row">
        <span>
          {!quiz && <button className="b" onClick={() => { const h = tx(LEVELS[lv - 1].hint); setFb({ c: "", m: "💡 " + h }); speak(h); }}>💡 {t("hint")}</button>}{" "}
          <button className="b" onClick={() => speak(describe(q))}>🔊</button>
        </span>
        <span>
          {!quiz && <button className="b" onClick={skip}>{t("skip")}</button>}{" "}
          {locked
            ? <button className="b pri" onClick={quiz ? nextQ : start}>{t("next")} →</button>
            : <button className="b pri" onClick={check}>{t("check")}</button>}
        </span>
      </div>
    </div>
  );
}
