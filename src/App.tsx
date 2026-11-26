import { useEffect, useRef, useState } from "react";
import { AppCtx } from "./ctx";
import { STR, type Bi, type Key, type Lang } from "./i18n";
import { LEVELS } from "./data/levels";
import { makeRods, tapBead, value, type Rod } from "./lib/abacus";
import { fresh, load, record, save, type Progress as P } from "./lib/storage";
import { speak as tts } from "./lib/speech";
import { Abacus } from "./components/Abacus";
import { Learn } from "./components/Learn";
import { Session } from "./components/Session";
import { Progress } from "./components/Progress";
import { HandPanel } from "./hand/HandPanel";

type Mode = "learn" | "practice" | "quiz" | "progress";
const MODES: Mode[] = ["learn", "practice", "quiz", "progress"];

export default function App() {
  const [prog, setProg] = useState<P>(load);
  const [lang, setLang] = useState<Lang>(prog.lang);
  const [audio, setAudio] = useState(prog.audio);
  const [lv, setLv] = useState(1);
  const [mode, setMode] = useState<Mode>("learn");
  const [rods, setRods] = useState<Rod[]>(() => makeRods(LEVELS[0].rods));
  const [hand, setHand] = useState(false);
  const [toast, setToast] = useState("");
  const abRef = useRef<HTMLDivElement>(null);

  const t = (k: Key) => STR[lang][k] ?? STR.en[k];
  const tx = (o: Bi) => (lang === "bn" ? o.bn : o.en);
  const resetRods = () => setRods(makeRods(LEVELS[lv - 1].rods));
  const speak = (s: string) => {
    if (audio) tts(s, lang, () => { setToast(t("nobn")); setTimeout(() => setToast(""), 2500); });
  };
  const unlocked = (n: number) => n === 1 || prog.done[n - 1] !== undefined;

  useEffect(() => { save({ ...prog, lang, audio }); }, [prog, lang, audio]);
  useEffect(() => { document.documentElement.lang = lang; }, [lang]);
  useEffect(() => { resetRods(); }, [lv, mode]); // eslint-disable-line react-hooks/exhaustive-deps

  const cameraOk = typeof navigator !== "undefined" && !!navigator.mediaDevices?.getUserMedia;
  const v = value(rods);

  return (
    <AppCtx.Provider value={{ lang, t, tx, speak }}>
      <div className="w">
        <div className="top">
          <h1>🧮 {t("ttl")}</h1>
          <div>
            <button className="b" onClick={() => setLang(lang === "en" ? "bn" : "en")}>{lang === "en" ? "বাংলা" : "English"}</button>{" "}
            <button className="b" aria-label="audio" onClick={() => { const a = !audio; setAudio(a); if (a) tts(t("aon"), lang); else speechSynthesis?.cancel(); }}>{audio ? "🔊" : "🔇"}</button>
          </div>
        </div>

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
          <Session key={`${mode}${lv}`} lv={lv} quiz={mode === "quiz"} value={v} resetRods={resetRods}
            onRecord={(l, ok, ms) => setProg((p) => record(p, l, ok, ms))}
            onPass={(l, score) => setProg((p) => ({ ...p, done: { ...p.done, [l]: Math.max(p.done[l] ?? 0, score) } }))} />
        )}
        {mode === "progress" && <Progress prog={prog} onReset={() => { setProg({ ...fresh(), lang, audio }); setLv(1); setMode("learn"); }} />}

        {mode !== "progress" && (
          <>
            <Abacus ref={abRef} rods={rods} label={t("rd")} onTap={(i, k) => setRods((r) => tapBead(r, i, k))} />
            {cameraOk && <div className="row" style={{ justifyContent: "center" }}>
              <button className={"b " + (hand ? "pri" : "")} onClick={() => setHand(!hand)}>{t("hcam")}</button></div>}
          </>
        )}
        {hand && mode !== "progress" && <HandPanel targetRef={abRef} onClose={() => setHand(false)} />}
      </div>
      {toast && <div id="toast">{toast}</div>}
    </AppCtx.Provider>
  );
}
