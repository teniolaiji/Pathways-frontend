import { useState } from "react";
import "./index.css";

import Login      from "./pages/Login";
import Register   from "./pages/Register";
import Dashboard  from "./pages/Dashboard";
import Assessment from "./pages/Assessment";
import Pathways   from "./pages/Pathways";
import Profile    from "./pages/Profile";
import Admin      from "./pages/Admin";

export default function App() {
  // Restore session from localStorage
  const savedUser = (() => {
    try { return JSON.parse(localStorage.getItem("user")); }
    catch { return null; }
  })();
  const savedToken = localStorage.getItem("token");

  const [user,      setUser]      = useState(savedUser);
  const [token,     setToken]     = useState(savedToken);
  const [screen,    setScreen]    = useState("login");
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
    setScreen("login");
    setPage("dashboard");
  };

  const handleNavigate = (destination, state = null) => {
    // Block non-admins from accessing the admin page
    if (destination === "admin" && user?.role !== "admin") return;
    setPageState(state);
    setPage(destination);
  };

  const pageProps = { user, token, onNavigate: handleNavigate, onLogout: handleLogout };

  // Unauthenticated
  if (!user || !token) {
    if (screen === "register") {
      return <Register onGoLogin={() => setScreen("login")} />;
    }
    return <Login onLogin={handleLogin} onGoRegister={() => setScreen("register")} />;
  }

  // Authenticated — role-based routing
  switch (page) {
    case "assessment": return <Assessment {...pageProps} />;
    case "pathways":   return <Pathways   {...pageProps} initialState={pageState} />;
    case "profile":    return <Profile    {...pageProps} />;
    case "admin":
      // Double-check role on render as well as on navigate
      if (user?.role !== "admin") return <Dashboard {...pageProps} />;
      return <Admin {...pageProps} />;
    case "dashboard":
    default:
      return <Dashboard {...pageProps} />;
  }
}