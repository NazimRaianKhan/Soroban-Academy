import { useEffect } from "react";
import { Link, NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthProvider";
import { useApp } from "../ctx";

export function Layout() {
  const { t, lang, setLang, audio, toggleAudio, toast } = useApp();
  const { user, profile, cloud, loading } = useAuth();
  const { pathname } = useLocation();
  const nav = useNavigate();

  // first-time users (e.g. Google / phone sign-up) choose a role before continuing
  useEffect(() => {
    if (user && profile && !profile.onboarded && pathname !== "/onboarding") nav("/onboarding", { replace: true });
  }, [user, profile, pathname, nav]);

  return (
    <div className="w">
      <div className="top">
        <Link to="/" className="logo"><h1>🧮 {t("ttl")}</h1></Link>
        <div className="hdr">
          <button className="b" onClick={() => setLang(lang === "en" ? "bn" : "en")}>{lang === "en" ? "বাংলা" : "English"}</button>
          <button className="b" aria-label="audio" onClick={toggleAudio}>{audio ? "🔊" : "🔇"}</button>
          {cloud && !loading && (user
            ? <Link className="b" to="/account">👤 {profile?.full_name?.split(" ")[0] || t("account")}</Link>
            : <Link className="b pri" to="/login">{t("signIn")}</Link>)}
        </div>
      </div>
      {user && (
        <nav className="nav">
          <NavLink to="/" end>{t("learn")}</NavLink>
          <NavLink to="/classes">{t("classes")}</NavLink>
        </nav>
      )}
      <Outlet />
      <footer className="sm foot"><Link to="/privacy">{t("privacy")}</Link> · <Link to="/terms">{t("terms")}</Link></footer>
      {toast && <div id="toast">{toast}</div>}
    </div>
  );
}
