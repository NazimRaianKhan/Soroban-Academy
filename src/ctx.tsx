import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { STR, type Bi, type Key, type Lang } from "./i18n";
import { loadPrefs, savePrefs } from "./lib/storage";
import { speak as tts } from "./lib/speech";
import { useAuth } from "./auth/AuthProvider";

export type Ctx = {
  lang: Lang; setLang: (l: Lang) => void; audio: boolean; toggleAudio: () => void;
  t: (k: Key) => string; tx: (o: Bi) => string; speak: (s: string) => void;
  toast: string; flash: (m: string) => void;
};
const C = createContext<Ctx>(null as unknown as Ctx);
export const useApp = () => useContext(C);

export function PrefsProvider({ children }: { children: ReactNode }) {
  const { profile } = useAuth();
  const [lang, setLang] = useState<Lang>(() => loadPrefs().lang);
  const [audio, setAudio] = useState(() => loadPrefs().audio);
  const [toast, setToast] = useState("");

  useEffect(() => { savePrefs({ lang, audio }); document.documentElement.lang = lang; }, [lang, audio]);
  useEffect(() => { if (profile?.lang) setLang(profile.lang); }, [profile?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  const t = (k: Key) => STR[lang][k] ?? STR.en[k];
  const tx = (o: Bi) => (lang === "bn" ? o.bn : o.en);
  const flash = (m: string) => { setToast(m); setTimeout(() => setToast(""), 2500); };
  const speak = (s: string) => { if (audio) tts(s, lang, () => flash(t("nobn"))); };
  const toggleAudio = () => {
    const a = !audio; setAudio(a);
    if (a) tts(t("aon"), lang); else if ("speechSynthesis" in window) speechSynthesis.cancel();
  };
  return <C.Provider value={{ lang, setLang, audio, toggleAudio, t, tx, speak, toast, flash }}>{children}</C.Provider>;
}
