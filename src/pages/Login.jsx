import { useState } from "react";
import API from "../config";

export default function Login({ onLogin, onGoRegister }) {
  const [screen,   setScreen]   = useState("login"); // "login" | "forgot" | "forgot_sent"
  const [form,     setForm]     = useState({ email: "", password: "" });
  const [email,    setEmail]    = useState("");
  const [error,    setError]    = useState("");
  const [success,  setSuccess]  = useState("");
  const [loading,  setLoading]  = useState(false);
  const [unverified, setUnverified] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleLogin = async (e) => {
    e.preventDefault();
    setError(""); setSuccess(""); setUnverified(false); setLoading(true);
    try {
      const res  = await fetch(`${API}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) {
        if (data.resendAvailable) setUnverified(true);
        throw new Error(data.message || "Login failed");
      }
      localStorage.setItem("token", data.token);
      localStorage.setItem("user",  JSON.stringify(data.user));
      onLogin(data.user, data.token);
    } catch (err) { setError(err.message); }
    finally { setLoading(false); }
  };

  const handleForgot = async (e) => {
    e.preventDefault();
    setError(""); setLoading(true);
    try {
      const res  = await fetch(`${API}/auth/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setScreen("forgot_sent");
    } catch (err) { setError(err.message); }
    finally { setLoading(false); }
  };

  const handleResend = async () => {
    setResendLoading(true);
    try {
      await fetch(`${API}/auth/resend-verification`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: form.email }),
      });
      setSuccess("Verification email resent. Please check your inbox.");
      setUnverified(false);
    } catch { /* silently fail */ }
    finally { setResendLoading(false); }
  };

  // ── Forgot password sent screen ──────────────────────────────
  if (screen === "forgot_sent") {
    return (
      <div style={s.page}>
        <div style={s.card}>
          <div style={s.successIcon}>✉</div>
          <h2 style={s.heading}>Check your email</h2>
          <p style={s.sub}>If that email is registered, a password reset link has been sent.</p>
          <button style={{ ...s.btn, marginTop:"24px" }} onClick={() => setScreen("login")}>
            Back to Sign In
          </button>
        </div>
      </div>
    );
  }

  // ── Forgot password screen ───────────────────────────────────
  if (screen === "forgot") {
    return (
      <div style={s.page}>
        <div style={s.card}>
          <Brand />
          <h1 style={s.heading}>Reset your password</h1>
          <p style={s.sub}>Enter your email and we'll send you a reset link.</p>
          {error && <div style={s.errorBanner}>{error}</div>}
          <form onSubmit={handleForgot} style={s.form}>
            <div style={s.field}>
              <label style={s.label}>Email address</label>
              <input style={s.input} type="email" placeholder="you@example.com"
                value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>
            <button type="submit" style={{ ...s.btn, opacity: loading ? 0.7 : 1 }} disabled={loading}>
              {loading ? "Sending…" : "Send Reset Link"}
            </button>
          </form>
          <p style={s.switchText}>
            <span style={s.link} onClick={() => setScreen("login")}>← Back to Sign In</span>
          </p>
        </div>
      </div>
    );
  }

  // ── Login screen ─────────────────────────────────────────────
  return (
    <div style={s.page}>
      <div style={s.card}>
        <Brand />
        <h1 style={s.heading}>Welcome back</h1>
        <p style={s.sub}>Sign in to continue your learning journey</p>

        {error    && <div style={s.errorBanner}>{error}</div>}
        {success  && <div style={s.successBanner}>{success}</div>}

        {unverified && (
          <div style={s.warningBanner}>
            Your email is not verified.{" "}
            <button style={s.resendLink} onClick={handleResend} disabled={resendLoading}>
              {resendLoading ? "Sending…" : "Resend verification email"}
            </button>
          </div>
        )}

        <form onSubmit={handleLogin} style={s.form}>
          <div style={s.field}>
            <label style={s.label}>Email address</label>
            <input style={s.input} type="email" name="email" placeholder="you@example.com"
              value={form.email} onChange={handleChange} required autoComplete="email" />
          </div>
          <div style={s.field}>
            <label style={s.label}>Password</label>
            <input style={s.input} type="password" name="password" placeholder="••••••••"
              value={form.password} onChange={handleChange} required autoComplete="current-password" />
          </div>
          <div style={{ textAlign:"right", marginTop:"-8px", marginBottom:"4px" }}>
            <span style={s.link} onClick={() => setScreen("forgot")}>Forgot password?</span>
          </div>
          <button type="submit" style={{ ...s.btn, opacity: loading ? 0.7 : 1 }} disabled={loading}>
            {loading ? "Signing in…" : "Sign In"}
          </button>
        </form>

        <p style={s.switchText}>
          Don't have an account?{" "}
          <span style={s.link} onClick={onGoRegister}>Create one</span>
        </p>
      </div>
    </div>
  );
}

function Brand() {
  return (
    <div style={{ display:"flex", alignItems:"center", gap:"10px", marginBottom:"32px" }}>
      <div style={{ width:"36px", height:"36px", borderRadius:"10px", backgroundColor:"#7c3aed",
        color:"#fff", fontWeight:"700", fontSize:"18px", display:"flex", alignItems:"center", justifyContent:"center" }}>P</div>
      <span style={{ fontSize:"20px", fontWeight:"700", color:"#4c1d95", letterSpacing:"-0.3px" }}>Pathways</span>
    </div>
  );
}

const s = {
  page:   { minHeight:"100vh", backgroundColor:"#f5f3ff", display:"flex", alignItems:"center", justifyContent:"center", fontFamily:"'Segoe UI',system-ui,sans-serif", padding:"24px" },
  card:   { backgroundColor:"#fff", borderRadius:"16px", padding:"48px 40px", width:"100%", maxWidth:"420px", boxShadow:"0 4px 24px rgba(109,40,217,0.10)", border:"1px solid #ede9fe" },
  heading:{ fontSize:"24px", fontWeight:"700", color:"#1e1b4b", margin:"0 0 6px 0" },
  sub:    { fontSize:"14px", color:"#6b7280", margin:"0 0 28px 0" },
  errorBanner:  { backgroundColor:"#fef2f2", border:"1px solid #fecaca", color:"#dc2626", borderRadius:"8px", padding:"10px 14px", fontSize:"13px", marginBottom:"16px" },
  successBanner:{ backgroundColor:"#d1fae5", border:"1px solid #6ee7b7", color:"#059669", borderRadius:"8px", padding:"10px 14px", fontSize:"13px", marginBottom:"16px" },
  warningBanner:{ backgroundColor:"#fef3c7", border:"1px solid #fde68a", color:"#92400e", borderRadius:"8px", padding:"10px 14px", fontSize:"13px", marginBottom:"16px" },
  form:   { display:"flex", flexDirection:"column", gap:"18px" },
  field:  { display:"flex", flexDirection:"column", gap:"6px" },
  label:  { fontSize:"13px", fontWeight:"600", color:"#374151" },
  input:  { padding:"10px 14px", borderRadius:"8px", border:"1.5px solid #e5e7eb", fontSize:"14px", color:"#1e1b4b", outline:"none", backgroundColor:"#fafafa", fontFamily:"inherit" },
  btn:    { marginTop:"6px", padding:"12px", backgroundColor:"#7c3aed", color:"#fff", border:"none", borderRadius:"8px", fontSize:"15px", fontWeight:"600", cursor:"pointer", fontFamily:"inherit" },
  switchText:{ textAlign:"center", marginTop:"24px", fontSize:"13px", color:"#6b7280" },
  link:   { color:"#7c3aed", fontWeight:"600", cursor:"pointer", fontSize:"13px" },
  resendLink:{ background:"none", border:"none", color:"#92400e", fontWeight:"700", cursor:"pointer", textDecoration:"underline", fontSize:"13px", fontFamily:"inherit" },
  successIcon:{ width:"56px", height:"56px", borderRadius:"50%", backgroundColor:"#ede9fe", color:"#7c3aed", fontSize:"24px", fontWeight:"700", display:"flex", alignItems:"center", justifyContent:"center", margin:"0 auto 20px" },
};