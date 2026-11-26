import { useEffect, useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthProvider";
import { useApp } from "../ctx";

export default function Login() {
  const { t } = useApp();
  const a = useAuth();
  const nav = useNavigate();
  const [via, setVia] = useState<"email" | "phone">("email");
  const [email, setEmail] = useState(""), [pw, setPw] = useState("");
  const [phone, setPhone] = useState(""), [code, setCode] = useState(""), [sent, setSent] = useState(false);
  const [msg, setMsg] = useState<{ bad: boolean; text: string } | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => { if (a.user) nav("/", { replace: true }); }, [a.user, nav]);
  if (!a.cloud) return <div className="card"><p>{t("cloudOff")}</p><Link className="b pri" to="/">{t("guest")}</Link></div>;

  const run = async (f: () => Promise<string | null>, ok?: string) => {
    setBusy(true); setMsg(null);
    const e = await f();
    setBusy(false);
    setMsg(e ? { bad: true, text: e } : ok ? { bad: false, text: ok } : null);
    return e;
  };
  const submitEmail = (e: FormEvent) => { e.preventDefault(); run(() => a.signInEmail(email.trim(), pw)); };
  const submitPhone = async (e: FormEvent) => {
    e.preventDefault();
    if (!sent) { if (!(await run(() => a.sendOtp(phone.trim())))) setSent(true); }
    else run(() => a.verifyOtp(phone.trim(), code.trim()));
  };

  return (
    <div className="card auth">
      <h2>{t("signIn")}</h2>
      <button className="b wide" disabled={busy} onClick={() => run(a.signInGoogle)}>G&nbsp; {t("google")}</button>
      <div className="sep sm">{t("or")}</div>
      <div className="tabs">
        <button className={"tab " + (via === "email" ? "on" : "")} onClick={() => setVia("email")}>{t("viaEmail")}</button>
        <button className={"tab " + (via === "phone" ? "on" : "")} onClick={() => setVia("phone")}>{t("viaPhone")}</button>
      </div>
      {via === "email" ? (
        <form onSubmit={submitEmail}>
          <label>{t("email")}<input type="email" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)} /></label>
          <label>{t("password")}<input type="password" autoComplete="current-password" required value={pw} onChange={(e) => setPw(e.target.value)} /></label>
          <button className="b pri wide" disabled={busy}>{t("signIn")}</button>
          <p className="sm"><button type="button" className="link" disabled={busy || !email}
            onClick={() => run(() => a.resetPassword(email.trim()), t("resetSent"))}>{t("forgot")}</button></p>
        </form>
      ) : (
        <form onSubmit={submitPhone}>
          <label>{t("phone")}<input type="tel" autoComplete="tel" required value={phone} disabled={sent} onChange={(e) => setPhone(e.target.value)} /></label>
          {sent && <label>{t("code")}<input inputMode="numeric" autoComplete="one-time-code" required value={code} onChange={(e) => setCode(e.target.value)} /></label>}
          <button className="b pri wide" disabled={busy}>{sent ? t("verify") : t("sendCode")}</button>
        </form>
      )}
      {msg && <p className={msg.bad ? "err" : "okk"} role="alert">{msg.text}</p>}
      <p className="sm">{t("noAcc")} <Link to="/register">{t("signUp")}</Link> · <Link to="/">{t("guest")}</Link></p>
    </div>
  );
}
