import { useState } from "react";
import { useApp } from "../ctx";
import { LEVELS } from "../data/levels";
import { streak, type Progress as P } from "../lib/storage";

export function Progress({ prog, onReset, canReset }: { prog: P; onReset: () => void; canReset: boolean }) {
  const { t, tx } = useApp();
  const [sure, setSure] = useState(false);
  const acc = prog.att ? Math.round((prog.ok / prog.att) * 100) : 0;
  const avg = prog.ok ? (prog.ms / prog.ok / 1000).toFixed(1) + t("sec") : "–";
  return (
    <>
      <div className="card"><div className="st">
        <div><b>{Object.keys(prog.done).length}/{LEVELS.length}</b>{t("lvls")}</div>
        <div><b>{acc}%</b>{t("acc")}</div>
        <div><b>{avg}</b>{t("avg")}</div>
        <div><b>{streak(prog)} 🔥</b>{t("strk")}</div>
        <div><b>{prog.att}</b>{t("att")}</div>
      </div></div>
      {LEVELS.map((l, i) => {
        const n = i + 1, s = prog.lvl[n] ?? { a: 0, o: 0 }, a = s.a ? Math.round((s.o / s.a) * 100) : 0, sc = prog.done[n] ?? 0;
        return (
          <div className="card" key={n}>
            <div className="row" style={{ margin: 0 }}><b>{n}. {tx(l.n)}</b><span>{"★".repeat(sc)}{"☆".repeat(5 - sc)}</span></div>
            <div className="bar2"><i style={{ width: a + "%" }} /></div>
            <div className="sm">{t("acc")}: {a}% · {t("att")}: {s.a}</div>
          </div>
        );
      })}
      {canReset && <div className="row"><span />
        <button className="b" onClick={() => { if (sure) { onReset(); setSure(false); } else setSure(true); }}>
          {sure ? t("sure") : t("reset")}
        </button></div>}
    </>
  );
}
