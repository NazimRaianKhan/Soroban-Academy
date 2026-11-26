import { useEffect, useState } from "react";
import { useApp } from "../ctx";
import { LEVELS } from "../data/levels";

type Props = { lv: number; value: number; goPractice: () => void };

export function Learn({ lv, value, goPractice }: Props) {
  const { t, tx, speak } = useApp();
  const [step, setStep] = useState(0);
  const steps = LEVELS[lv - 1].steps;
  const s = steps[step];

  useEffect(() => { if (s) speak(tx(s)); }, [step]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!s) return (
    <div className="card">
      <p className="big">✅ {t("ldone")}</p>
      <button className="b pri" onClick={goPractice}>{t("practice")}</button>
    </div>
  );
  const needs = s.target !== undefined, met = needs && value === s.target;
  return (
    <div className="card">
      <div className="sm">{t("step")} {step + 1}/{steps.length}</div>
      <p className="big">{tx(s)}</p>
      <div className={"fb " + (met ? "ok" : "")}>
        {needs ? (met ? t("good") : <>{t("setit")} <b>{s.target}</b></>) : ""}
      </div>
      <div className="row">
        <button className="b" onClick={() => speak(tx(s))}>🔊 {t("listen")}</button>
        <span>
          <button className="b" disabled={step === 0} onClick={() => setStep(step - 1)}>←</button>{" "}
          <button className="b pri" disabled={needs && !met} onClick={() => setStep(step + 1)}>{t("next")} →</button>
        </span>
      </div>
    </div>
  );
}
