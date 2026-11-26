import type { Lang } from "../i18n";

/** Text-to-speech using the browser's built-in voices (works offline). */
export function speak(text: string, lang: Lang, onNoVoice?: () => void) {
  if (!("speechSynthesis" in window)) return;
  try {
    speechSynthesis.cancel();
    const code = lang === "bn" ? "bn" : "en";
    const u = new SpeechSynthesisUtterance(text);
    u.lang = lang === "bn" ? "bn-BD" : "en-US";
    const voices = speechSynthesis.getVoices();
    const v = voices.find((x) => x.lang.toLowerCase().startsWith(code));
    if (v) u.voice = v; else if (code === "bn" && voices.length) onNoVoice?.();
    u.rate = 0.85;
    speechSynthesis.speak(u);
  } catch { /* ignore */ }
}
