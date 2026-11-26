import { useEffect, useRef, useState } from "react";
import { useApp } from "../ctx";
import { useAuth } from "../auth/AuthProvider";
import { LEVELS } from "../data/levels";
import { makeRods, tapBead, value, type Rod } from "../lib/abacus";
import { useProgress } from "../lib/useProgress";
import { Abacus } from "../components/Abacus";
import { Learn } from "../components/Learn";
import { Session } from "../components/Session";
import { Progress } from "../components/Progress";
import { HandPanel } from "../hand/HandPanel";

type Mode = "learn" | "practice" | "quiz" | "progress";
const MODES: Mode[] = ["learn", "practice", "quiz", "progress"];

export default function Academy() {
  const { t, tx } = useApp();
  const { cloud } = useAuth();
  const { prog, ready, rec, pass, reset, isGuest } = useProgress();
  const [lv, setLv] = useState(1);
  const [mode, setMode] = useState<Mode>("learn");
  const [rods, setRods] = useState<Rod[]>(() => makeRods(LEVELS[0].rods));
  const [hand, setHand] = useState(false);
  const abRef = useRef<HTMLDivElement>(null);

  const resetRods = () => setRods(makeRods(LEVELS[lv - 1].rods));
  const unlocked = (n: number) => n === 1 || prog.done[n - 1] !== undefined;
  useEffect(() => { resetRods(); }, [lv, mode]); // eslint-disable-line react-hooks/exhaustive-deps

  const cameraOk = typeof navigator !== "undefined" && !!navigator.mediaDevices?.getUserMedia;
  const v = value(rods);
  if (!ready) return <p className="sm">{t("loading")}</p>;

  return (
    <>
      {isGuest && <p className="sm intro">{t("intro")}</p>}
      {isGuest && cloud && <div className="info sm">{t("guestNote")}</div>}
      <div className="tabs">
        {MODES.map((m) => <button key={m} className={"tab " + (mode === m ? "on" : "")} onClick={() => setMode(m)}>{t(m)}</button>)}
      </div>
      <div className="lv">
        {LEVELS.map((_, i) => {
          const n = i + 1;
          return <button key={n} className={"chip " + (lv === n ? "on" : "")} disabled={!unlocked(n)} onClick={() => setLv(n)}>
            {unlocked(n) ? (prog.done[n] !== undefined ? "✓ " : "") : "🔒 "}{n}</button>;
        })}
      </div>
      {mode !== "progress" && <div className="sm" style={{ marginTop: 6 }}>{tx(LEVELS[lv - 1].n)}</div>}

      {mode === "learn" && <Learn key={`l${lv}`} lv={lv} value={v} goPractice={() => setMode("practice")} />}
      {(mode === "practice" || mode === "quiz") && (
        <Session key={`${mode}${lv}`} lv={lv} quiz={mode === "quiz"} value={v} resetRods={resetRods} onRecord={rec} onPass={pass} />
      )}
      {mode === "progress" && <Progress prog={prog} canReset={isGuest} onReset={() => { reset(); setLv(1); setMode("learn"); }} />}

      {mode !== "progress" && (
        <>
          <Abacus ref={abRef} rods={rods} label={t("rd")} onTap={(i, k) => setRods((r) => tapBead(r, i, k))} />
          {cameraOk && <div className="row" style={{ justifyContent: "center" }}>
            <button className={"b " + (hand ? "pri" : "")} onClick={() => setHand(!hand)}>{t("hcam")}</button></div>}
        </>
      )}
      {hand && mode !== "progress" && <HandPanel targetRef={abRef} onClose={() => setHand(false)} />}
    </>
  );
}
