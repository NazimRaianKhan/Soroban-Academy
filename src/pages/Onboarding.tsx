import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthProvider";
import { useApp } from "../ctx";
import { supabase } from "../lib/supabase";

export default function Onboarding() {
  const { t } = useApp();
  const { profile, user, refreshProfile } = useAuth();
  const nav = useNavigate();
  const [role, setRole] = useState("student");
  const [name, setName] = useState(profile?.full_name || (user?.user_metadata?.name as string) || "");
  const [err, setErr] = useState("");
  const submit = async (e: FormEvent) => {
    e.preventDefault();
    const { error } = await supabase!.rpc("complete_onboarding", { p_role: role, p_name: name.trim() });
    if (error) return setErr(error.message);
    await refreshProfile(); nav("/", { replace: true });
  };
  return (
    <form className="card auth" onSubmit={submit}>
      <h2>{t("welcome")}</h2><p className="sm">{t("chooseRole")}</p>
      <label>{t("fullName")}<input required maxLength={100} value={name} onChange={(e) => setName(e.target.value)} /></label>
      <fieldset><legend>{t("iAm")}</legend>
        {(["student", "parent", "teacher"] as const).map((r) => (
          <label key={r} className="radio"><input type="radio" name="role" checked={role === r} onChange={() => setRole(r)} /> {t(`r_${r}` as "r_student")}</label>
        ))}
      </fieldset>
      <button className="b pri wide">{t("cont")}</button>
      {err && <p className="err" role="alert">{err}</p>}
    </form>
  );
}
