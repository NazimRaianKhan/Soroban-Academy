import type { Bi } from "../i18n";

export type Step = Bi & { target?: number };
export type Level = { n: Bi; rods: number; hint: Bi; steps: Step[] };

const s = (en: string, bn: string, target?: number): Step => ({ en, bn, target });

// To add a level: append here, then teach gen() in lib/problems.ts how to make its problems.
export const LEVELS: Level[] = [
  { n: { en: "Abacus & digits 0–9", bn: "অ্যাবাকাস ও ০–৯" }, rods: 1,
    hint: { en: "Upper bead = 5, each lower bead = 1. Beads count when they touch the middle bar.", bn: "উপরের পুঁতি = ৫, নিচের প্রতিটি = ১। মাঝের দণ্ডে ছুঁলে গণনা হয়।" },
    steps: [
      s("This is one rod. The upper bead is worth 5, each of the 4 lower beads is worth 1. A bead counts only when it touches the middle bar.", "এটি একটি রড। উপরের পুঁতির মান ৫, নিচের ৪টির প্রতিটির মান ১। পুঁতি মাঝের দণ্ডে ছুঁলেই গণনা হয়।"),
      s("Push 3 lower beads up to the bar. That shows 3.", "৩টি নিচের পুঁতি উপরে দণ্ডের দিকে ঠেলুন। এটি ৩ দেখায়।", 3),
      s("Show 5: move the upper bead down to the bar.", "৫ দেখান: উপরের পুঁতি নিচে দণ্ডে নামান।", 5),
      s("Show 7: the upper bead (5) plus two lower beads (2).", "৭ দেখান: উপরের পুঁতি (৫) আর দুটি নিচের পুঁতি (২)।", 7),
      s("Show 9: the upper bead plus all four lower beads.", "৯ দেখান: উপরের পুঁতি আর চারটি নিচের পুঁতি।", 9),
    ] },
  { n: { en: "Many-digit numbers", bn: "বহু অঙ্কের সংখ্যা" }, rods: 4,
    hint: { en: "Right rod = ones, next = tens, then hundreds, thousands.", bn: "ডানের রড = এক, তারপর দশ, শত, হাজার।" },
    steps: [
      s("Each rod is a place value. The right-most rod is ones, then tens, hundreds and thousands.", "প্রতিটি রড একটি স্থানীয় মান। একদম ডানে একক, তারপর দশক, শতক, হাজার।"),
      s("Show 24: 2 on the tens rod, 4 on the ones rod.", "২৪ দেখান: দশের রডে ২, এককের রডে ৪।", 24),
      s("Show 307: use 0 (all beads away) on the tens rod.", "৩০৭ দেখান: দশের রডে ০ (সব পুঁতি সরানো)।", 307),
      s("Show 1562.", "১৫৬২ দেখান।", 1562),
    ] },
  { n: { en: "Direct add & subtract", bn: "সরাসরি যোগ-বিয়োগ" }, rods: 3,
    hint: { en: "If enough beads are free on the rod, just move them directly.", bn: "রডে পর্যাপ্ত পুঁতি থাকলে সরাসরি সরান।" },
    steps: [
      s("Direct moves: when the rod has enough free beads, just move them. First show 1.", "সরাসরি চালনা: রডে যথেষ্ট পুঁতি থাকলে শুধু সরান। আগে ১ দেখান।", 1),
      s("Add 2: push two more lower beads up. Now it shows 3.", "২ যোগ: আরও দুটি নিচের পুঁতি ঠেলুন। এখন ৩।", 3),
      s("Add 5: bring the upper bead down. 3 + 5 = 8.", "৫ যোগ: উপরের পুঁতি নামান। ৩ + ৫ = ৮।", 8),
      s("Subtract 3: pull three lower beads away. 8 − 3 = 5.", "৩ বিয়োগ: তিনটি নিচের পুঁতি সরান। ৮ − ৩ = ৫।", 5),
      s("Subtract 5: lift the upper bead away. Now it shows 0.", "৫ বিয়োগ: উপরের পুঁতি সরান। এখন ০।", 0),
    ] },
  { n: { en: "Friends of 5", bn: "৫-এর বন্ধু" }, rods: 3,
    hint: { en: "+n = +5 − (5−n).  −n = −5 + (5−n).  Pairs: 1·4, 2·3.", bn: "+n = +৫ − (৫−n)।  −n = −৫ + (৫−n)।  জোড়া: ১·৪, ২·৩।" },
    steps: [
      s("Friends of 5 are pairs that make 5: 1 and 4, 2 and 3. Show 4.", "৫-এর বন্ধু হলো যে জোড়া ৫ বানায়: ১ ও ৪, ২ ও ৩। ৪ দেখান।", 4),
      s("Add 3 to 4. You cannot push 3 more lower beads. Instead add 5 (upper bead down) and take away its friend 2. Now 7.", "৪-এর সাথে ৩ যোগ। আর ৩টি পুঁতি ঠেলা যায় না। তাই ৫ যোগ (উপরের পুঁতি নামান) আর বন্ধু ২ বিয়োগ করুন। এখন ৭।", 7),
      s("Subtract 4 from 7. Take away 5 (upper bead up) and add its friend 1. Now 3.", "৭ থেকে ৪ বিয়োগ। ৫ বিয়োগ (উপরের পুঁতি তুলুন) আর বন্ধু ১ যোগ করুন। এখন ৩।", 3),
    ] },
  { n: { en: "Friends of 10", bn: "১০-এর বন্ধু" }, rods: 3,
    hint: { en: "+n = +10 − (10−n) (carry to the next rod).  −n = −10 + (10−n) (borrow).", bn: "+n = +১০ − (১০−n) (পরের রডে ১ যোগ)।  −n = −১০ + (১০−n) (ধার)।" },
    steps: [
      s("Friends of 10: 1·9, 2·8, 3·7, 4·6, 5·5. Show 8.", "১০-এর বন্ধু: ১·৯, ২·৮, ৩·৭, ৪·৬, ৫·৫। ৮ দেখান।", 8),
      s("Add 6 to 8. Add 10 (one bead on the tens rod) and take away the friend 4 from the ones rod. Now 14.", "৮-এর সাথে ৬ যোগ। দশের রডে ১ যোগ (১০) আর এককের রড থেকে বন্ধু ৪ বিয়োগ। এখন ১৪।", 14),
      s("Subtract 7 from 14. Take 1 from the tens rod (−10) and add the friend 3 to the ones rod. Now 7.", "১৪ থেকে ৭ বিয়োগ। দশের রড থেকে ১ সরান (−১০) আর এককের রডে বন্ধু ৩ যোগ করুন। এখন ৭।", 7),
    ] },
];
