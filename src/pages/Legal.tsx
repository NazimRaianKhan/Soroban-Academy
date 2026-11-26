import { useApp } from "../ctx";

/** PLACEHOLDER legal text. Have a lawyer review/replace before public launch (children's data: COPPA/GDPR). */
export default function Legal({ kind }: { kind: "privacy" | "terms" }) {
  const { t } = useApp();
  return (
    <div className="card">
      <h2>{t(kind)}</h2>
      <p className="sm"><b>Template notice:</b> replace this page with reviewed legal text before launch.</p>
      {kind === "privacy" ? (
        <ul>
          <li>We store: your name, email or phone number, role, and your learning activity (attempts, times, levels passed).</li>
          <li>If you sign in with Google, we receive only your name and email address from Google, and use them only to create and identify your account here. We never access your other Google data.</li>
          <li>Teachers can see activity of students who join their class. Nobody else can see your data.</li>
          <li>Camera mode processes video on your device only; video is never uploaded or stored.</li>
          <li>You can download or permanently delete your data any time from Account.</li>
          <li>Users under 13 need a parent or guardian&apos;s permission.</li>
        </ul>
      ) : (
        <ul>
          <li>Use the app for learning; do not attempt to break or abuse the service.</li>
          <li>You are responsible for keeping your password safe.</li>
          <li>The service is provided as-is and may change.</li>
        </ul>
      )}
    </div>
  );
}
