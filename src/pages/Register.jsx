import { useState } from "react";
import API from "../config";

export default function Register({ onGoLogin }) {
  const [form,    setForm]    = useState({ name:"", email:"", password:"", confirm:"" });
  const [error,   setError]   = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (form.password !== form.confirm)
      return setError("Passwords do not match.");
    if (form.password.length < 8)
      return setError("Password must be at least 8 characters.");
    setLoading(true);
    try {
      const res  = await fetch(`${API}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name:form.name, email:form.email, password:form.password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Registration failed");
      setSuccess(true);
    } catch (err) { setError(err.message); }
    finally { setLoading(false); }
  };

  if (success) {
    return (
      <div style={s.page}>
        <div style={s.card}>
          <div style={s.icon}>✉</div>
          <h2 style={s.heading}>Check your email</h2>
          <p style={s.sub}>
            We sent a verification link to <strong>{form.email}</strong>.
            Please click the link to activate your account before signing in.
          </p>
          <p style={{ fontSize:"12px", color:"#9ca3af", marginBottom:"24px" }}>
            Don't see it? Check your spam folder.
          </p>
          <button style={s.btn} onClick={onGoLogin}>Go to Sign In</button>
        </div>
      </div>
    );
  }

  return (
    <div style={s.page}>
      <div style={s.card}>
        <div style={s.brand}>
          <div style={s.logoMark}>P</div>
          <span style={s.brandName}>Pathways</span>
        </div>

        <h1 style={s.heading}>Create your account</h1>
        <p style={s.sub}>Start your personalised STEAM learning journey</p>

        {error && <div style={s.errorBanner}>{error}</div>}

        <form onSubmit={handleSubmit} style={s.form}>
          {[
            { name:"name",     type:"text",     placeholder:"Your full name",  label:"Full name" },
            { name:"email",    type:"email",    placeholder:"you@example.com", label:"Email address" },
            { name:"password", type:"password", placeholder:"Min. 8 characters", label:"Password" },
            { name:"confirm",  type:"password", placeholder:"Repeat your password", label:"Confirm password" },
          ].map((field) => (
            <div key={field.name} style={s.field}>
              <label style={s.label}>{field.label}</label>
              <input style={s.input} type={field.type} name={field.name}
                placeholder={field.placeholder} value={form[field.name]}
                onChange={handleChange} required
                {...(field.name === "password" || field.name === "confirm" ? { minLength:8 } : {})} />
            </div>
          ))}
          <button type="submit" style={{ ...s.btn, opacity: loading ? 0.7 : 1 }} disabled={loading}>
            {loading ? "Creating account…" : "Create Account"}
          </button>
        </form>

        <p style={s.switchText}>
          Already have an account?{" "}
          <span style={s.link} onClick={onGoLogin}>Sign in</span>
        </p>
      </div>
    </div>
  );
}

const s = {
  page:      { minHeight:"100vh", backgroundColor:"#f5f3ff", display:"flex", alignItems:"center", justifyContent:"center", fontFamily:"'Segoe UI',system-ui,sans-serif", padding:"24px" },
  card:      { backgroundColor:"#fff", borderRadius:"16px", padding:"48px 40px", width:"100%", maxWidth:"420px", boxShadow:"0 4px 24px rgba(109,40,217,0.10)", border:"1px solid #ede9fe" },
  brand:     { display:"flex", alignItems:"center", gap:"10px", marginBottom:"32px" },
  logoMark:  { width:"36px", height:"36px", borderRadius:"10px", backgroundColor:"#7c3aed", color:"#fff", fontWeight:"700", fontSize:"18px", display:"flex", alignItems:"center", justifyContent:"center" },
  brandName: { fontSize:"20px", fontWeight:"700", color:"#4c1d95", letterSpacing:"-0.3px" },
  heading:   { fontSize:"24px", fontWeight:"700", color:"#1e1b4b", margin:"0 0 6px 0" },
  sub:       { fontSize:"14px", color:"#6b7280", margin:"0 0 28px 0" },
  errorBanner:{ backgroundColor:"#fef2f2", border:"1px solid #fecaca", color:"#dc2626", borderRadius:"8px", padding:"10px 14px", fontSize:"13px", marginBottom:"16px" },
  form:      { display:"flex", flexDirection:"column", gap:"16px" },
  field:     { display:"flex", flexDirection:"column", gap:"6px" },
  label:     { fontSize:"13px", fontWeight:"600", color:"#374151" },
  input:     { padding:"10px 14px", borderRadius:"8px", border:"1.5px solid #e5e7eb", fontSize:"14px", color:"#1e1b4b", outline:"none", backgroundColor:"#fafafa", fontFamily:"inherit" },
  btn:       { marginTop:"4px", padding:"12px", backgroundColor:"#7c3aed", color:"#fff", border:"none", borderRadius:"8px", fontSize:"15px", fontWeight:"600", cursor:"pointer", width:"100%", fontFamily:"inherit" },
  switchText:{ textAlign:"center", marginTop:"24px", fontSize:"13px", color:"#6b7280" },
  link:      { color:"#7c3aed", fontWeight:"600", cursor:"pointer" },
  icon:      { width:"56px", height:"56px", borderRadius:"50%", backgroundColor:"#ede9fe", color:"#7c3aed", fontSize:"28px", display:"flex", alignItems:"center", justifyContent:"center", margin:"0 auto 20px" },
};