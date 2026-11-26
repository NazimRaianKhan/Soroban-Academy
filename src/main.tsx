import { createRoot } from "react-dom/client";
import { BrowserRouter, Navigate, Outlet, Route, Routes } from "react-router-dom";
import { AuthProvider, useAuth } from "./auth/AuthProvider";
import { PrefsProvider } from "./ctx";
import { Layout } from "./components/Layout";
import Academy from "./pages/Academy";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Reset from "./pages/Reset";
import Onboarding from "./pages/Onboarding";
import Classes from "./pages/Classes";
import ClassDetail from "./pages/ClassDetail";
import Account from "./pages/Account";
import Legal from "./pages/Legal";
import "./styles.css";

function RequireAuth() {
  const { user, loading } = useAuth();
  if (loading) return <p className="sm">…</p>;
  return user ? <Outlet /> : <Navigate to="/login" replace />;
}

createRoot(document.getElementById("root")!).render(
  <BrowserRouter>
    <AuthProvider>
      <PrefsProvider>
        <Routes>
          <Route element={<Layout />}>
            <Route index element={<Academy />} />
            <Route path="login" element={<Login />} />
            <Route path="register" element={<Register />} />
            <Route path="reset" element={<Reset />} />
            <Route path="privacy" element={<Legal kind="privacy" />} />
            <Route path="terms" element={<Legal kind="terms" />} />
            <Route element={<RequireAuth />}>
              <Route path="onboarding" element={<Onboarding />} />
              <Route path="classes" element={<Classes />} />
              <Route path="classes/:id" element={<ClassDetail />} />
              <Route path="account" element={<Account />} />
            </Route>
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </PrefsProvider>
    </AuthProvider>
  </BrowserRouter>,
);
