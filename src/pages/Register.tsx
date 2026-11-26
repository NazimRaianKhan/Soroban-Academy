import { useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../auth/AuthProvider";
import { useApp } from "../ctx";

export default function Register() {
  const { t } = useApp();
  const a = useAuth();
  const [role, setRole] = useState("student");
  const [name, setName] = useState(""), [email, setEmail] = useState(""), [pw, setPw] = useState("");
  const [age, setAge] = useState(false), [terms, setTerms] = useState(false);
  const [msg, setMsg] = useState<{ bad: boolean; text: string } | null>(null);
  const [busy, setBusy] = useState(false);
  if (!a.cloud) return <div className="card"><p>{t("cloudOff")}</p><Link className="b pri" to="/">{t("guest")}</Link></div>;

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (pw.length < 8) return setMsg({ bad: true, text: t("passMin") });
    if (!age || !terms) return setMsg({ bad: true, text: t("needChecks") });
    setBusy(true); setMsg(null);
    const r = await a.signUpEmail(email.trim(), pw, name.trim(), role);
    setBusy(false);
    setMsg(r.error ? { bad: true, text: r.error } : r.needsConfirm ? { bad: false, text: t("confirmEmail") } : null);
  };

  return (
    <div className="card auth">
      <h2>{t("signUp")}</h2>
      <form onSubmit={submit}>
        <fieldset><legend>{t("iAm")}</legend>
          {(["student", "parent", "teacher"] as const).map((r) => (
            <label key={r} className="radio"><input type="radio" name="role" checked={role === r} onChange={() => setRole(r)} /> {t(`r_${r}` as "r_student")}</label>
          ))}
        </fieldset>
        <label>{t("fullName")}<input required maxLength={100} autoComplete="name" value={name} onChange={(e) => setName(e.target.value)} /></label>
        <label>{t("email")}<input type="email" required autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} /></label>
        <label>{t("password")}<input type="password" required minLength={8} autoComplete="new-password" value={pw} onChange={(e) => setPw(e.target.value)} /></label>
        <label className="radio"><input type="checkbox" checked={age} onChange={(e) => setAge(e.target.checked)} /> {t("ageOk")}</label>
        <label className="radio"><input type="checkbox" checked={terms} onChange={(e) => setTerms(e.target.checked)} /> {t("agreeTerms")}</label>
        <button className="b pri wide" disabled={busy}>{t("signUp")}</button>
      </form>
      {msg && <p className={msg.bad ? "err" : "okk"} role="alert">{msg.text}</p>}
      <p className="sm">{t("haveAcc")} <Link to="/login">{t("signIn")}</Link></p>
    </div>
  );
}
