import { useState, useEffect } from "react";
import API from "../config";

export default function VerifyEmail({ onGoLogin }) {
  const [status, setStatus] = useState("verifying"); // "verifying" | "success" | "error"
  const [message, setMessage] = useState("");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token  = params.get("token");

    if (!token) {
      setStatus("error");
      setMessage("No verification token found in the link. Please request a new one.");
      return;
    }

    // Call the backend to verify the token
    fetch(`${API}/auth/verify-email?token=${token}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.message?.toLowerCase().includes("verified") ||
            data.message?.toLowerCase().includes("success")) {
          setStatus("success");
          setMessage(data.message);
        } else {
          setStatus("error");
          setMessage(data.message || "Verification failed. The link may have expired.");
        }
      })
      .catch(() => {
        setStatus("error");
        setMessage("Something went wrong. Please try again.");
      });
  }, []);

  return (
    <div style={s.page}>
      <div style={s.card}>
        {/* Brand */}
        <div style={s.brand}>
          <div style={s.logoMark}>P</div>
          <span style={s.brandName}>Pathways</span>
        </div>

        {status === "verifying" && (
          <>
            <div style={s.spinner} />
            <h2 style={s.heading}>Verifying your email…</h2>
            <p style={s.sub}>Please wait a moment.</p>
          </>
        )}

        {status === "success" && (
          <>
            <div style={s.successIcon}>✓</div>
            <h2 style={s.heading}>Email verified!</h2>
            <p style={s.sub}>
              Your account is now active. You can sign in and start your
              learning journey.
            </p>
            <button style={s.btn} onClick={onGoLogin}>
              Sign In →
            </button>
          </>
        )}

        {status === "error" && (
          <>
            <div style={s.errorIcon}>✕</div>
            <h2 style={s.heading}>Verification failed</h2>
            <p style={s.sub}>{message}</p>
            <button style={s.btn} onClick={onGoLogin}>
              Back to Sign In
            </button>
          </>
        )}
      </div>
    </div>
  );
}

const s = {
  page: {
    minHeight: "100vh",
    backgroundColor: "#f5f3ff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontFamily: "'Segoe UI', system-ui, sans-serif",
    padding: "24px",
  },
  card: {
    backgroundColor: "#ffffff",
    borderRadius: "16px",
    padding: "48px 40px",
    width: "100%",
    maxWidth: "420px",
    boxShadow: "0 4px 24px rgba(109,40,217,0.10)",
    border: "1px solid #ede9fe",
    textAlign: "center",
  },
  brand: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "10px",
    marginBottom: "32px",
  },
  logoMark: {
    width: "36px",
    height: "36px",
    borderRadius: "10px",
    backgroundColor: "#7c3aed",
    color: "#ffffff",
    fontWeight: "700",
    fontSize: "18px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  brandName: {
    fontSize: "20px",
    fontWeight: "700",
    color: "#4c1d95",
  },
  heading: {
    fontSize: "22px",
    fontWeight: "700",
    color: "#1e1b4b",
    margin: "0 0 8px 0",
  },
  sub: {
    fontSize: "14px",
    color: "#6b7280",
    lineHeight: "1.6",
    margin: "0 0 24px 0",
  },
  btn: {
    padding: "12px 32px",
    backgroundColor: "#7c3aed",
    color: "#ffffff",
    border: "none",
    borderRadius: "8px",
    fontSize: "15px",
    fontWeight: "600",
    cursor: "pointer",
    fontFamily: "inherit",
  },
  successIcon: {
    width: "60px",
    height: "60px",
    borderRadius: "50%",
    backgroundColor: "#d1fae5",
    color: "#059669",
    fontSize: "26px",
    fontWeight: "700",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    margin: "0 auto 20px",
  },
  errorIcon: {
    width: "60px",
    height: "60px",
    borderRadius: "50%",
    backgroundColor: "#fef2f2",
    color: "#dc2626",
    fontSize: "26px",
    fontWeight: "700",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    margin: "0 auto 20px",
  },
  spinner: {
    width: "40px",
    height: "40px",
    border: "4px solid #ede9fe",
    borderTop: "4px solid #7c3aed",
    borderRadius: "50%",
    animation: "spin 0.75s linear infinite",
    margin: "0 auto 20px",
  },
};