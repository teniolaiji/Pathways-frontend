import { useState } from "react";
import "./index.css";

import Login      from "./pages/Login";
import Register   from "./pages/Register";
import Dashboard  from "./pages/Dashboard";
import Assessment from "./pages/Assessment";
import Pathways   from "./pages/Pathways";
import Profile    from "./pages/Profile";

export default function App() {
  // ── Restore session from localStorage ───────────────────────
  const savedUser = (() => {
    try { return JSON.parse(localStorage.getItem("user")); }
    catch { return null; }
  })();
  const savedToken = localStorage.getItem("token");

  const [user,      setUser]      = useState(savedUser);
  const [token,     setToken]     = useState(savedToken);
  const [screen,    setScreen]    = useState("login");     // unauthenticated screens
  const [page,      setPage]      = useState("dashboard"); // authenticated pages
  const [pageState, setPageState] = useState(null);        // optional data passed between pages

  // ── Auth handlers ────────────────────────────────────────────
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
    setScreen("login");
    setPage("dashboard");
  };

  // ── Navigation ───────────────────────────────────────────────
  // Any page can call onNavigate("pathways", { generateFrom: id })
  // to pass data to the destination page.
  const handleNavigate = (destination, state = null) => {
    setPageState(state);
    setPage(destination);
  };

  const pageProps = {
    user,
    token,
    onNavigate: handleNavigate,
    onLogout: handleLogout,
  };

  // ── Unauthenticated ──────────────────────────────────────────
  if (!user || !token) {
    if (screen === "register") {
      return <Register onGoLogin={() => setScreen("login")} />;
    }
    return (
      <Login
        onLogin={handleLogin}
        onGoRegister={() => setScreen("register")}
      />
    );
  }

  // ── Authenticated ────────────────────────────────────────────
  switch (page) {
    case "assessment":
      return <Assessment {...pageProps} />;
    case "pathways":
      return <Pathways {...pageProps} initialState={pageState} />;
    case "profile":
      return <Profile {...pageProps} />;
    case "dashboard":
    default:
      return <Dashboard {...pageProps} />;
  }
}