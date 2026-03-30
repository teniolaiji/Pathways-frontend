import { useState } from "react";
import "./index.css";

import Landing     from "./pages/Landing";
import Login       from "./pages/Login";
import Register    from "./pages/Register";
import Dashboard   from "./pages/Dashboard";
import Assessment  from "./pages/Assessment";
import Pathways    from "./pages/Pathways";
import Profile     from "./pages/Profile";
import Admin       from "./pages/Admin";
import VerifyEmail from "./pages/VerifyEmail";

export default function App() {
  // ── Handle /verify-email URL first ──────────────────────────
  const path   = window.location.pathname;
  const search = window.location.search;

  if (path === "/verify-email" || (search.includes("token=") && path.includes("verify"))) {
    return (
      <VerifyEmail
        onGoLogin={() => {
          window.history.pushState({}, "", "/");
          window.location.reload();
        }}
      />
    );
  }

  // ── Restore session ──────────────────────────────────────────
  const savedUser = (() => {
    try { return JSON.parse(localStorage.getItem("user")); }
    catch { return null; }
  })();
  const savedToken = localStorage.getItem("token");

  const [user,      setUser]      = useState(savedUser);
  const [token,     setToken]     = useState(savedToken);
  const [screen,    setScreen]    = useState("landing"); // starts on landing
  const [page,      setPage]      = useState("dashboard");
  const [pageState, setPageState] = useState(null);

  const handleLogin = (userData, authToken) => {
    setUser(userData);
    setToken(authToken);
    setPage("dashboard");
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    setToken(null);
    setScreen("landing"); // return to landing on logout
    setPage("dashboard");
  };

  const handleNavigate = (destination, state = null) => {
    if (destination === "admin" && user?.role !== "admin") return;
    setPageState(state);
    setPage(destination);
  };

  const pageProps = {
    user, token,
    onNavigate: handleNavigate,
    onLogout:   handleLogout,
  };

  // ── Authenticated ────────────────────────────────────────────
  if (user && token) {
    switch (page) {
      case "assessment": return <Assessment {...pageProps} />;
      case "pathways":   return <Pathways   {...pageProps} initialState={pageState} />;
      case "profile":    return <Profile    {...pageProps} />;
      case "admin":
        if (user?.role !== "admin") return <Dashboard {...pageProps} />;
        return <Admin {...pageProps} />;
      default:
        return <Dashboard {...pageProps} />;
    }
  }

  // ── Unauthenticated ──────────────────────────────────────────
  if (screen === "login") {
    return (
      <Login
        onLogin={handleLogin}
        onGoRegister={() => setScreen("register")}
        onGoLanding={() => setScreen("landing")}
      />
    );
  }

  if (screen === "register") {
    return (
      <Register
        onGoLogin={() => setScreen("login")}
        onGoLanding={() => setScreen("landing")}
      />
    );
  }

  // Default: landing page
  return (
    <Landing
      onGoLogin={() => setScreen("login")}
      onGoRegister={() => setScreen("register")}
    />
  );
}