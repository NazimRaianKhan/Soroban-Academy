import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthProvider";
import { useApp } from "../ctx";

export default function Reset() {
  const { t } = useApp();
  const a = useAuth();
  const nav = useNavigate();
  const [pw, setPw] = useState(""), [err, setErr] = useState("");
  if (a.loading) return <p className="sm">{t("loading")}</p>;
  if (!a.user) return <div className="card"><Link className="b pri" to="/login">{t("signIn")}</Link></div>;
  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (pw.length < 8) return setErr(t("passMin"));
    const r = await a.updatePassword(pw);
    if (r) setErr(r); else nav("/", { replace: true });
  };
  return (
    <form className="card auth" onSubmit={submit}>
      <h2>{t("newPass")}</h2>
      <label>{t("password")}<input type="password" required minLength={8} autoComplete="new-password" value={pw} onChange={(e) => setPw(e.target.value)} /></label>
      <button className="b pri wide">{t("save")}</button>
      {err && <p className="err" role="alert">{err}</p>}
    </form>
  );
}
