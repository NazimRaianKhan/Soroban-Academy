# 🧮 Soroban Academy

Interactive soroban (1 upper + 4 lower beads) learning platform: accounts (email, Google, phone OTP), roles
(student, parent, teacher, admin), classes with a teacher dashboard, cloud-saved progress, English/Bengali,
audio, and optional camera hand control.

**Stack:** Vite + React 18 + TypeScript + React Router · **Supabase** (PostgreSQL, Auth, Row-Level Security) ·
MediaPipe (hand tracking) · Web Speech API (audio) · Vitest + GitHub Actions CI · Vercel hosting.
Without Supabase keys the app still runs in **guest mode** (progress in localStorage).

## 1. Install the tools (once)
Node.js 20 LTS (https://nodejs.org) and VS Code.

## 2. Create the backend (Supabase, free tier is enough to start)
1. Create an account and a **New project** at https://supabase.com. Save the database password.
2. **SQL Editor → New query**: paste the whole of `supabase/migrations/0001_init.sql` → **Run**.
3. **Project Settings → API**: copy the **Project URL** and the **anon public key**.
4. **Authentication → Providers**:
   - **Email**: enabled by default. Keep "Confirm email" ON.
   - **Google**: create an OAuth Client ID in Google Cloud Console (type *Web application*). Add the redirect URI shown in
     Supabase (`https://<project-ref>.supabase.co/auth/v1/callback`), then paste the Client ID and Secret into Supabase.
   - **Phone (optional, paid)**: hidden by default. To use it, enable Phone in Supabase, connect an SMS provider (e.g. Twilio Verify),
     then set `VITE_ENABLE_PHONE_LOGIN=true`. SMS costs money per message; check Bangladesh coverage and price first.
5. **Authentication → URL Configuration**: Site URL = your Vercel URL; add Redirect URLs `http://localhost:5173/**` and `https://YOUR-APP.vercel.app/**`.

## 3. Run locally
```bash
cp .env.example .env.local     # then paste your Supabase URL + anon key into .env.local
npm install                    # also downloads the hand-tracking model (internet needed once)
npm run dev                    # http://localhost:5173
npm test                       # unit tests
```

## 4. Deploy (Vercel)
Push to GitHub, import the repo in Vercel. Under **Settings → Environment Variables** add `VITE_SUPABASE_URL` and
`VITE_SUPABASE_ANON_KEY`, then redeploy. `vercel.json` already handles page routing and security headers.
(The anon key is meant to be public; the database is protected by Row-Level Security, not by hiding the key.
Never put the `service_role` key in this project.)

## 5. Roles
| Role | How obtained | Can do |
|---|---|---|
| student | self sign-up | learn, join classes, see own data |
| teacher | self sign-up | create classes, see progress of students in their classes |
| parent | self sign-up | (child linking arrives in Stage 2) |
| school_admin / platform_admin | **manual only** | make yourself admin in the SQL editor: `update public.profiles set role='platform_admin' where id = '<your user id>';` |

Roles can never be changed from the browser: the database blocks it (column-level privileges), and elevated
roles in sign-up data are ignored.

## 6. Security tests
`supabase/tests/security.sql` attacks the database as different users (self-promotion, reading other people's data,
anonymous access, cheating inserts, account deletion). To run it on a local Postgres: load `local_stub.sql`, then the
migration, then `security.sql`.

## 7. Folder map
```
supabase/migrations/    database schema + row-level security + RPC functions
supabase/tests/         security test script
src/auth/               AuthProvider (email, Google, phone OTP, reset, profile)
src/pages/              Academy (learning), Login, Register, Reset, Onboarding, Classes, ClassDetail, Account, Legal
src/components/         Abacus, Learn, Session, Progress, Layout
src/lib/                abacus rules, problem generator, progress hook (guest local vs cloud), speech
src/hand/               camera hand control
src/data/levels.ts      lesson content (bilingual)
.github/workflows/      CI: tests + build on every push
```

## 8. Before a public launch (needs a human, not code)
- Replace the placeholder Privacy Policy and Terms (`src/pages/Legal.tsx`) with lawyer-reviewed text; children's data brings COPPA/GDPR duties.
- Turn on Supabase backups, add Sentry (or similar) error monitoring, and use a custom SMTP sender for auth emails.
- Quiz scores are reported by the browser. That is fine for learning, but not for competitions or certificates (later: server-generated questions).

## 9. Roadmap
- Done: Levels 1-7 (digits, many-digit numbers, direct, friends of 5, friends of 10, carry/borrow across rods, mixed chains).
- Next (decided): parent-child linking (child shares a code, parent enters it) and schools (platform admin creates schools and
  assigns school admins; school admins manage teachers and classes).
- Then: flash drills, multiplication, division, mental abacus, badges, charts, weak-spot detection, certificates,
  billing hooks (`profiles.plan` already exists).
