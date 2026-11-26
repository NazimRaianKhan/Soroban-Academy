import { useCallback, useEffect, useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../auth/AuthProvider";
import { useApp } from "../ctx";
import { supabase } from "../lib/supabase";

type Cls = { id: string; name: string; join_code: string; teacher_id: string };

export default function Classes() {
  const { t } = useApp();
  const { profile, user } = useAuth();
  const [list, setList] = useState<Cls[]>([]);
  const [name, setName] = useState(""), [code, setCode] = useState(""), [err, setErr] = useState("");
  const role = profile?.role;
  const teaches = role === "teacher" || role === "school_admin";

  const load = useCallback(async () => {
    const { data } = await supabase!.from("classes").select("id,name,join_code,teacher_id").order("created_at", { ascending: false });
    setList((data ?? []) as Cls[]);
  }, []);
  useEffect(() => { load(); }, [load]);

  const create = async (e: FormEvent) => {
    e.preventDefault(); setErr("");
    const { error } = await supabase!.from("classes").insert({ name: name.trim() });
    if (error) return setErr(error.message);
    setName(""); load();
  };
  const join = async (e: FormEvent) => {
    e.preventDefault(); setErr("");
    const { error } = await supabase!.rpc("join_class", { p_code: code });
    if (error) return setErr(error.message);
    setCode(""); load();
  };
  const leave = async (id: string) => {
    await supabase!.from("class_members").delete().eq("class_id", id).eq("student_id", user!.id);
    load();
  };

  return (
    <>
      {role === "parent" && <div className="info sm">{t("parentSoon")}</div>}
      {teaches && (
        <form className="card" onSubmit={create}>
          <label>{t("createClass")}<input required maxLength={100} placeholder={t("className")} value={name} onChange={(e) => setName(e.target.value)} /></label>
          <button className="b pri">{t("createClass")}</button>
        </form>
      )}
      {role === "student" && (
        <form className="card" onSubmit={join}>
          <label>{t("joinClass")}<input required maxLength={12} placeholder={t("joinCode")} value={code} onChange={(e) => setCode(e.target.value)} /></label>
          <button className="b pri">{t("join")}</button>
        </form>
      )}
      {err && <p className="err" role="alert">{err}</p>}
      <h3>{t("classes")}</h3>
      {list.length === 0 && <p className="sm">{t("noClasses")}</p>}
      {list.map((c) => (
        <div className="card row" key={c.id} style={{ marginTop: 8 }}>
          <b>{c.name}</b>
          {c.teacher_id === user?.id
            ? <Link className="b" to={`/classes/${c.id}`}>{t("students")} →</Link>
            : <button className="b" onClick={() => leave(c.id)}>{t("leave")}</button>}
        </div>
      ))}
    </>
  );
}
