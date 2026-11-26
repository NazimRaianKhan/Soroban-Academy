export type Lang = "en" | "bn";
export type Bi = { en: string; bn: string };

const en = {
  ttl: "Soroban Academy", learn: "Learn", practice: "Practice", quiz: "Quiz", progress: "Progress",
  next: "Next", check: "Check", hint: "Hint", skip: "Skip", listen: "Listen", step: "Step",
  setit: "Set the abacus to", good: "✓ Well done! Tap Next.", ok: "Correct! 🎉", no: "Not yet, try again.",
  no2: "Not correct. Answer:", setq: "Set this number on the abacus",
  opq: "Set the first number, then add or subtract the second. Show the answer.",
  ldone: "Lesson complete! Now practice.", startq: "Start quiz (5 questions, pass with 4)",
  score: "Score", pass: "Passed! Next level unlocked 🎉", fail: "You need 4 out of 5. Try again.",
  again: "Try again", q: "Question", lvls: "Levels done", acc: "Accuracy", avg: "Avg time",
  strk: "Day streak", att: "Attempts", rd: "Abacus shows:", reset: "Reset progress",
  sure: "Tap again to confirm", nobn: "No Bengali voice on this device; use the text.",
  aon: "Audio on", plus: "plus", minus: "minus", sec: "s",
  hcam: "✋ Camera mode", hLoad: "Starting camera and hand tracking…",
  hReady: "Ready. Pinch your thumb and index finger over a bead to move it.",
  hErr: "Camera or hand model unavailable. Allow camera access and run: npm run setup:hand",
};
const bn: typeof en = {
  ttl: "সোরোবান একাডেমি", learn: "শিখুন", practice: "অনুশীলন", quiz: "কুইজ", progress: "অগ্রগতি",
  next: "পরের", check: "যাচাই", hint: "ইঙ্গিত", skip: "বাদ দিন", listen: "শুনুন", step: "ধাপ",
  setit: "অ্যাবাকাসে সাজান:", good: "✓ চমৎকার! পরের বোতাম চাপুন।", ok: "সঠিক! 🎉", no: "এখনো হয়নি, আবার চেষ্টা করুন।",
  no2: "ভুল। সঠিক উত্তর:", setq: "অ্যাবাকাসে এই সংখ্যাটি সাজান",
  opq: "প্রথম সংখ্যাটি সাজান, তারপর দ্বিতীয়টি যোগ বা বিয়োগ করে উত্তর দেখান।",
  ldone: "পাঠ শেষ! এবার অনুশীলন করুন।", startq: "কুইজ শুরু (৫টি প্রশ্ন, পাস ৪)",
  score: "স্কোর", pass: "পাস! পরের লেভেল খুলেছে 🎉", fail: "পাস করতে ৫-এর মধ্যে ৪ লাগবে। আবার চেষ্টা করুন।",
  again: "আবার", q: "প্রশ্ন", lvls: "সম্পন্ন লেভেল", acc: "নির্ভুলতা", avg: "গড় সময়",
  strk: "টানা দিন", att: "চেষ্টা", rd: "অ্যাবাকাসে আছে:", reset: "অগ্রগতি রিসেট",
  sure: "নিশ্চিত করতে আবার চাপুন", nobn: "এই ডিভাইসে বাংলা ভয়েস নেই; লেখা দেখুন।",
  aon: "অডিও চালু", plus: "যোগ", minus: "বিয়োগ", sec: "সে.",
  hcam: "✋ ক্যামেরা মোড", hLoad: "ক্যামেরা ও হাত শনাক্তকরণ চালু হচ্ছে…",
  hReady: "প্রস্তুত। পুঁতির ওপর বুড়ো আঙুল ও তর্জনী চিমটি করে পুঁতি সরান।",
  hErr: "ক্যামেরা বা মডেল পাওয়া যায়নি। ক্যামেরার অনুমতি দিন এবং চালান: npm run setup:hand",
};

export type Key = keyof typeof en;
export const STR: Record<Lang, Record<Key, string>> = { en, bn };
