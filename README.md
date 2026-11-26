# 🧮 Soroban Academy

Interactive soroban (1 upper + 4 lower beads) learning app: lessons, practice, quizzes, progress tracking,
English/Bengali, audio, and optional camera hand control.

**Stack:** Vite + React 18 + TypeScript · MediaPipe Tasks Vision (hand tracking) · Web Speech API (audio) · localStorage (progress).
No backend, no database, no API keys. Everything runs in the browser.

## 1. Install the tools (once)
1. Install **Node.js 20 LTS** from https://nodejs.org (check: `node -v`).
2. Install **VS Code** from https://code.visualstudio.com.
3. Optional VS Code extensions: *ESLint*, *Prettier*, *ES7+ React snippets*.

## 2. Run the project
Open this folder in VS Code (`File → Open Folder`), then open the terminal (`Ctrl+` ` ` `) and run:

```bash
npm install      # installs packages AND downloads the hand-tracking files (needs internet once)
npm run dev      # starts the app at http://localhost:5173
```

Camera mode works on `localhost` and on any `https://` site (browsers block cameras on plain http).

If the hand model download failed during install, run `npm run setup:hand` again, or download
`hand_landmarker.task` manually (the URL is printed) into `public/models/`.

## 3. Folder map
```
src/
  App.tsx                 app shell: tabs, levels, language, audio, camera toggle, progress
  i18n.ts                 all English + Bengali UI text
  ctx.ts                  shared context (t, tx, speak)
  data/levels.ts          lesson steps for every level (bilingual)
  lib/abacus.ts           pure abacus rules (bead tapping, rod values)
  lib/problems.ts         problem generator for each level
  lib/storage.ts          progress, accuracy, time, streak (localStorage)
  lib/speech.ts           text-to-speech
  components/             Abacus, Learn, Session (practice + quiz), Progress
  hand/useHand.ts         MediaPipe hand tracking + pinch-to-click
  hand/HandPanel.tsx      camera preview, cursor, status
scripts/setup-hand.mjs    copies WASM + downloads the hand model into /public
```

## 4. How camera hand control is wired in
- `Abacus.tsx` puts `data-r` / `data-k` on every bead and calls one `onTap` function for clicks.
- `useHand.ts` tracks your hand, maps the midpoint of thumb and index finger onto the abacus area, and
  when you **pinch**, it clicks the nearest bead. So mouse, touch and hand all use the same logic and
  the lessons/quizzes work unchanged.
- Video is processed locally and never uploaded.
- Tips: good light, hand about 40–60 cm from the camera, pinch slowly and release between moves.

## 5. Add or change content
- **Text/translations:** edit `src/i18n.ts` and `src/data/levels.ts`.
- **New level (e.g. Level 6 borrowing):** add an entry to `LEVELS` in `data/levels.ts`, then add a
  branch for it in `gen()` in `lib/problems.ts`. Tabs, locking, quiz and progress update automatically.
- **Pass mark:** `Session.tsx` (search `>= 4`).

## 6. Build and publish
```bash
npm run build     # outputs /dist
npm run preview   # test the production build locally
```
Upload `dist/` to Netlify, Vercel or GitHub Pages (all provide HTTPS, which camera mode needs).
For GitHub Pages in a sub-folder set `base: "/repo-name/"` in `vite.config.ts`.

## Roadmap
Phase 2: borrowing + mixed problems + flash drills · Phase 3: multiplication, division, mental abacus ·
extras: weak-spot detection, charts, badges, installable offline app (PWA).
