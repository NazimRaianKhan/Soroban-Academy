import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useApp } from "../ctx";
import { supabase } from "../lib/supabase";
import { LEVELS } from "../data/levels";

type Row = { student_id: string; full_name: string; attempts: number; correct: number; avg_ms: number; levels_passed: number; last_active: string | null };

export default function ClassDetail() {
  const { t } = useApp();
  const { id } = useParams();
  const [cls, setCls] = useState<{ name: string; join_code: string } | null>(null);
  const [rows, setRows] = useState<Row[] | null>(null);
  const [err, setErr] = useState(""), [copied, setCopied] = useState(false);

  useEffect(() => {
    (async () => {
      const c = await supabase!.from("classes").select("name,join_code").eq("id", id!).maybeSingle();
      if (!c.data) return setErr("Class not found.");
      setCls(c.data);
      const r = await supabase!.rpc("class_overview", { p_class: id });
      if (r.error) setErr(r.error.message); else setRows((r.data ?? []) as Row[]);
    })();
  }, [id]);

  return (
    <>
      <p><Link to="/classes">{t("back")}</Link></p>
      {err && <p className="err" role="alert">{err}</p>}
      {cls && (
        <div className="card">
          <div className="row" style={{ margin: 0 }}>
            <h2 style={{ margin: 0 }}>{cls.name}</h2>
            <span>{t("joinCode")}: <b className="mono">{cls.join_code}</b>{" "}
              <button className="b" onClick={() => { navigator.clipboard?.writeText(cls.join_code); setCopied(true); }}>{copied ? t("copied") : t("copy")}</button></span>
          </div>
        </div>
      )}
      {rows && (rows.length === 0 ? <p className="sm">{t("noStudents")}</p> : (
        <div className="card tw"><table>
          <thead><tr><th>{t("name")}</th><th>{t("acc")}</th><th>{t("avg")}</th><th>{t("passed")}</th><th>{t("att")}</th><th>{t("lastActive")}</th></tr></thead>
          <tbody>{rows.map((r) => (
            <tr key={r.student_id}>
              <td>{r.full_name || "—"}</td>
              <td>{r.attempts ? Math.round((r.correct / r.attempts) * 100) + "%" : "–"}</td>
              <td>{r.correct ? (r.avg_ms / 1000).toFixed(1) + t("sec") : "–"}</td>
              <td>{r.levels_passed}/{LEVELS.length}</td>
              <td>{r.attempts}</td>
              <td>{r.last_active ? new Date(r.last_active).toLocaleDateString() : "–"}</td>
            </tr>))}</tbody>
        </table></div>
      ))}
    </>
  );
}
