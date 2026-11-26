import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthProvider";
import { useApp } from "../ctx";
import { supabase } from "../lib/supabase";

export default function Account() {
  const { t, lang, setLang } = useApp();
  const { user, profile, signOut, refreshProfile } = useAuth();
  const nav = useNavigate();
  const [name, setName] = useState(profile?.full_name ?? "");
  const [msg, setMsg] = useState(""), [confirm, setConfirm] = useState("");
  if (!profile) return <p className="sm">{t("loading")}</p>;

  const saveProfile = async () => {
    const { error } = await supabase!.from("profiles").update({ full_name: name.trim().slice(0, 100), lang }).eq("id", user!.id);
    setMsg(error ? error.message : t("saved")); refreshProfile();
  };
  const exportData = async () => {
    const { data, error } = await supabase!.rpc("export_my_data");
    if (error) return setMsg(error.message);
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([JSON.stringify(data, null, 2)], { type: "application/json" }));
    a.download = "my-soroban-data.json"; a.click(); URL.revokeObjectURL(a.href);
  };
  const del = async () => {
    const { error } = await supabase!.rpc("delete_my_account");
    if (error) return setMsg(error.message);
    await signOut(); nav("/", { replace: true });
  };

  return (
    <>
      <div className="card auth">
        <h2>{t("account")}</h2>
        <p className="sm">{user?.email || user?.phone} · {t("role")}: <b>{profile.role}</b> · {t("plan")}: <b>{profile.plan}</b></p>
        <label>{t("fullName")}<input maxLength={100} value={name} onChange={(e) => setName(e.target.value)} /></label>
        <label>Language<select value={lang} onChange={(e) => setLang(e.target.value as "en" | "bn")}><option value="en">English</option><option value="bn">বাংলা</option></select></label>
        <div className="row"><button className="b pri" onClick={saveProfile}>{t("save")}</button>
          <button className="b" onClick={async () => { await signOut(); nav("/"); }}>{t("signOut")}</button></div>
        {msg && <p className="sm" role="status">{msg}</p>}
      </div>
      <div className="card auth">
        <button className="b" onClick={exportData}>⬇ {t("exportData")}</button>
        <hr />
        <p className="sm">{t("deleteWarn")}</p>
        <input placeholder={t("typeDelete")} value={confirm} onChange={(e) => setConfirm(e.target.value)} />
        <button className="b danger" disabled={confirm !== "DELETE"} onClick={del} style={{ marginTop: 8 }}>{t("deleteAcct")}</button>
      </div>
    </>
  );
}
