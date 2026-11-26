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
  { n: { en: "Carry & borrow across rods", bn: "রডের মধ্যে ক্যারি ও ধার" }, rods: 4,
    hint: { en: "Work left to right. Carry: +n = +10 − (10−n). Borrow: −n = −10 + (10−n), taken from the rod on the left.", bn: "বাম থেকে ডানে কাজ করুন। ক্যারি: +n = +১০ − (১০−n)। ধার: −n = −১০ + (১০−n), বামের রড থেকে নিন।" },
    steps: [
      s("With bigger numbers, a carry or borrow travels to the neighbouring rod on the left. Always work from the LEFT, one rod at a time, using the friends of 10.", "বড় সংখ্যায় ক্যারি বা ধার বামের পাশের রডে যায়। সবসময় বাম দিক থেকে, এক রড করে, ১০-এর বন্ধু ব্যবহার করে কাজ করুন।"),
      s("Show 95.", "৯৫ দেখান।", 95),
      s("Add 38, left to right. Tens: 9 + 3 needs a carry: add 1 to the hundreds rod and take away 7 from the tens rod. Ones: 5 + 8 needs a carry: add 1 to the tens rod and take away 2 from the ones rod. Now 133.", "৩৮ যোগ, বাম থেকে ডানে। দশক: ৯ + ৩-এ ক্যারি লাগে: শতকের রডে ১ যোগ আর দশকের রড থেকে ৭ বিয়োগ। একক: ৫ + ৮-এ ক্যারি লাগে: দশকের রডে ১ যোগ আর এককের রড থেকে ২ বিয়োগ। এখন ১৩৩।", 133),
      s("Subtract 47, left to right. Tens: 3 − 4 cannot be done, so take 1 from the hundreds rod and add the friend 6 to the tens rod. Ones: 3 − 7 cannot be done, so take 1 from the tens rod and add the friend 3 to the ones rod. Now 86.", "৪৭ বিয়োগ, বাম থেকে ডানে। দশক: ৩ − ৪ হয় না, তাই শতকের রড থেকে ১ নিন আর দশকের রডে বন্ধু ৬ যোগ করুন। একক: ৩ − ৭ হয় না, তাই দশকের রড থেকে ১ নিন আর এককের রডে বন্ধু ৩ যোগ করুন। এখন ৮৬।", 86),
      s("Borrowing across a zero. Show 300.", "শূন্যের ওপর দিয়ে ধার। ৩০০ দেখান।", 300),
      s("Subtract 47 from 300. Take 1 from the hundreds rod and add the friend 6 to the tens rod (that makes 260). Then take 1 from the tens rod and add the friend 3 to the ones rod. Now 253.", "৩০০ থেকে ৪৭ বিয়োগ। শতকের রড থেকে ১ নিন আর দশকের রডে বন্ধু ৬ যোগ করুন (হয় ২৬০)। তারপর দশকের রড থেকে ১ নিন আর এককের রডে বন্ধু ৩ যোগ করুন। এখন ২৫৩।", 253),
    ] },
  { n: { en: "Mixed add & subtract", bn: "মিশ্র যোগ-বিয়োগ" }, rods: 4,
    hint: { en: "Do one number at a time, left to right, and read the rods after each step.", bn: "একবারে একটি সংখ্যা, বাম থেকে ডানে করুন এবং প্রতিটি ধাপের পর রডগুলো পড়ে নিন।" },
    steps: [
      s("Now chain several numbers into one total. Finish each step completely before the next, and read the rods after every step.", "এবার কয়েকটি সংখ্যা জুড়ে একটি মোট বের করুন। পরের ধাপে যাওয়ার আগে প্রতিটি ধাপ শেষ করুন এবং প্রতি ধাপের পর রড পড়ুন।"),
      s("Show 56.", "৫৬ দেখান।", 56),
      s("Add 38. Tens: 5 + 3 is direct. Ones: 6 + 8 needs a carry: add 1 to the tens rod and take away 2 from the ones rod. Now 94.", "৩৮ যোগ। দশক: ৫ + ৩ সরাসরি। একক: ৬ + ৮-এ ক্যারি: দশকের রডে ১ যোগ আর এককের রড থেকে ২ বিয়োগ। এখন ৯৪।", 94),
      s("Subtract 17. Tens: 9 − 1 is direct. Ones: 4 − 7 needs a borrow: take 1 from the tens rod and add the friend 3 to the ones rod. Now 77.", "১৭ বিয়োগ। দশক: ৯ − ১ সরাসরি। একক: ৪ − ৭-এ ধার: দশকের রড থেকে ১ নিন আর এককের রডে বন্ধু ৩ যোগ করুন। এখন ৭৭।", 77),
      s("Add 9: add 1 to the tens rod and take away the friend 1 from the ones rod. Now 86.", "৯ যোগ: দশকের রডে ১ যোগ আর এককের রড থেকে বন্ধু ১ বিয়োগ। এখন ৮৬।", 86),
      s("Subtract 45. Tens: 8 − 4 uses the friend of 5: take away the upper bead (−5) and add 1 (+1). Ones: 6 − 5, lift the upper bead. Now 41.", "৪৫ বিয়োগ। দশক: ৮ − ৪-এ ৫-এর বন্ধু: উপরের পুঁতি সরান (−৫) আর ১ যোগ (+১)। একক: ৬ − ৫, উপরের পুঁতি সরান। এখন ৪১।", 41),
      s("Mixed problems have 3 to 5 numbers. Take your time and use the Hint button if you get stuck.", "মিশ্র সমস্যায় ৩ থেকে ৫টি সংখ্যা থাকে। ধীরে করুন এবং আটকে গেলে ইঙ্গিত বোতাম ব্যবহার করুন।"),
    ] },
];
