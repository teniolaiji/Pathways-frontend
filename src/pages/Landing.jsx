import { useState, useEffect } from "react";

export default function Landing({ onGoLogin, onGoRegister }) {
  const [scrolled, setScrolled] = useState(false);
  const [statsVisible, setStatsVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 40);
      if (window.scrollY > 300) setStatsVisible(true);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div style={s.root}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;900&family=DM+Sans:wght@300;400;500;600&display=swap');

        * { box-sizing: border-box; margin: 0; padding: 0; }

        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(32px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50%       { transform: translateY(-12px); }
        }
        @keyframes shimmer {
          0%   { background-position: -200% center; }
          100% { background-position: 200% center; }
        }
        @keyframes pulse {
          0%, 100% { opacity: 0.6; transform: scale(1); }
          50%       { opacity: 1;   transform: scale(1.05); }
        }
        @keyframes countUp {
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        .hero-word {
          display: inline-block;
          animation: fadeUp 0.8s ease forwards;
          opacity: 0;
        }
        .hero-word:nth-child(1) { animation-delay: 0.1s; }
        .hero-word:nth-child(2) { animation-delay: 0.25s; }
        .hero-word:nth-child(3) { animation-delay: 0.4s; }
        .hero-word:nth-child(4) { animation-delay: 0.55s; }
        .hero-sub { animation: fadeUp 0.8s 0.7s ease forwards; opacity: 0; }
        .hero-cta  { animation: fadeUp 0.8s 0.9s ease forwards; opacity: 0; }
        .float-card { animation: float 6s ease-in-out infinite; }
        .float-card:nth-child(2) { animation-delay: 1s; }
        .float-card:nth-child(3) { animation-delay: 2s; }

        .stat-item { animation: countUp 0.6s ease forwards; opacity: 0; }
        .stat-item.visible { opacity: 1; }
        .stat-item:nth-child(1) { animation-delay: 0.0s; }
        .stat-item:nth-child(2) { animation-delay: 0.15s; }
        .stat-item:nth-child(3) { animation-delay: 0.3s; }
        .stat-item:nth-child(4) { animation-delay: 0.45s; }

        .shimmer-text {
          background: linear-gradient(90deg, #c084fc, #f0abfc, #818cf8, #c084fc);
          background-size: 200% auto;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          animation: shimmer 4s linear infinite;
        }

        .feature-card {
          transition: transform 0.3s ease, box-shadow 0.3s ease;
        }
        .feature-card:hover {
          transform: translateY(-6px);
          box-shadow: 0 24px 48px rgba(124, 58, 237, 0.18) !important;
        }

        .cta-btn {
          transition: transform 0.2s ease, box-shadow 0.2s ease;
        }
        .cta-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 12px 32px rgba(124, 58, 237, 0.4) !important;
        }
        .outline-btn {
          transition: background 0.2s ease, color 0.2s ease;
        }
        .outline-btn:hover {
          background: rgba(255,255,255,0.15) !important;
        }

        .step-line {
          position: absolute;
          top: 24px;
          left: 50%;
          width: 100%;
          height: 2px;
          background: linear-gradient(90deg, #7c3aed, #c084fc);
          opacity: 0.3;
          z-index: 0;
        }

        .noise-bg::before {
          content: '';
          position: fixed;
          inset: 0;
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.04'/%3E%3C/svg%3E");
          pointer-events: none;
          z-index: 0;
        }

        @media (max-width: 768px) {
          .hero-grid { flex-direction: column !important; }
          .features-grid { grid-template-columns: 1fr !important; }
          .steps-row { flex-direction: column !important; }
          .stats-row { grid-template-columns: 1fr 1fr !important; }
          .nav-links { display: none !important; }
        }
      `}</style>

      {/* ── NAV ─────────────────────────────────────────────────── */}
      <nav style={{
        ...s.nav,
        backgroundColor: scrolled ? "rgba(15, 10, 40, 0.95)" : "transparent",
        backdropFilter: scrolled ? "blur(20px)" : "none",
        borderBottom: scrolled ? "1px solid rgba(124,58,237,0.2)" : "1px solid transparent",
      }}>
        <div style={s.navInner}>
          <div style={s.logoWrap}>
            <div style={s.logoMark}>P</div>
            <span style={s.logoText}>Pathways</span>
          </div>
          <div className="nav-links" style={s.navLinks}>
            <a href="#features" style={s.navLink}>Features</a>
            <a href="#how-it-works" style={s.navLink}>How It Works</a>
            <a href="#mission" style={s.navLink}>Mission</a>
          </div>
          <div style={s.navActions}>
            <button style={s.navLoginBtn} className="outline-btn" onClick={onGoLogin}>Sign In</button>
            <button style={s.navRegisterBtn} className="cta-btn" onClick={onGoRegister}>Get Started</button>
          </div>
        </div>
      </nav>

      {/* ── HERO ────────────────────────────────────────────────── */}
      <section style={s.hero}>
        {/* Background orbs */}
        <div style={s.orb1} />
        <div style={s.orb2} />
        <div style={s.orb3} />
        <div style={s.gridLines} />

        <div style={s.heroInner} className="hero-grid">
          <div style={s.heroLeft}>
            <div style={s.heroBadge}>
              <span style={s.badgeDot} />
              AI-Powered · Inclusive · Built for Africa
            </div>

            <h1 style={s.heroHeading}>
              <span className="hero-word">Your</span>{" "}
              <span className="hero-word">STEAM</span>{" "}
              <br />
              <span className="hero-word shimmer-text">Learning</span>{" "}
              <span className="hero-word">Journey,</span>
              <br />
              <span style={s.heroAccent}>Personalised for You.</span>
            </h1>

            <p className="hero-sub" style={s.heroSub}>
              Pathways uses AI to build a learning pathway that fits your skill level,
              goals, time, and internet access — so no barrier stands between you and
              a career in STEAM.
            </p>

            <div className="hero-cta" style={s.heroCTARow}>
              <button style={s.primaryBtn} className="cta-btn" onClick={onGoRegister}>
                Start Your Pathway →
              </button>
              <button style={s.secondaryBtn} className="outline-btn" onClick={onGoLogin}>
                Sign In
              </button>
            </div>

            <div style={s.heroNote}>
              Free to use · No credit card required · Takes 5 minutes
            </div>
          </div>

          {/* Floating pathway preview cards */}
          <div style={s.heroRight}>
            <div style={s.cardStack}>
              <div className="float-card" style={{ ...s.floatCard, top: "0px", right: "20px", zIndex: 3 }}>
                <div style={s.floatCardDot} />
                <div style={s.floatCardTitle}>Data Science Pathway</div>
                <div style={s.floatCardSub}>6 modules · Beginner · 3–4 hrs/week</div>
                <div style={s.floatCardBar}>
                  <div style={{ ...s.floatCardProgress, width: "65%" }} />
                </div>
                <div style={s.floatCardLabel}>65% complete</div>
              </div>

              <div className="float-card" style={{ ...s.floatCard, top: "110px", right: "-10px", zIndex: 2, opacity: 0.9 }}>
                <div style={{ ...s.floatCardDot, backgroundColor: "#34d399" }} />
                <div style={s.floatCardTitle}>🏅 Badge Earned!</div>
                <div style={s.floatCardSub}>Halfway There — Keep going!</div>
              </div>

              <div className="float-card" style={{ ...s.floatCard, top: "200px", right: "40px", zIndex: 1, opacity: 0.8 }}>
                <div style={{ ...s.floatCardDot, backgroundColor: "#f0abfc" }} />
                <div style={s.floatCardTitle}>Web Development</div>
                <div style={s.floatCardSub}>React · Node.js · MongoDB</div>
                <div style={s.floatCardBar}>
                  <div style={{ ...s.floatCardProgress, width: "30%", background: "#f0abfc" }} />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Stats bar */}
        <div style={s.statsBar} className={`stats-row ${statsVisible ? "visible" : ""}`}>
          {[
            { value: "4", label: "STEAM Domains" },
            { value: "30+", label: "Subfields" },
            { value: "AI", label: "Personalised Pathways" },
            { value: "Free", label: "To Use" },
          ].map((stat, i) => (
            <div key={i} className="stat-item" style={s.statItem}>
              <div style={s.statValue}>{stat.value}</div>
              <div style={s.statLabel}>{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── FEATURES ────────────────────────────────────────────── */}
      <section id="features" style={s.section}>
        <div style={s.sectionInner}>
          <div style={s.sectionLabel}>What Pathways Does</div>
          <h2 style={s.sectionHeading}>
            Everything you need to go from<br />
            <span className="shimmer-text">curious to capable.</span>
          </h2>

          <div className="features-grid" style={s.featuresGrid}>
            {[
              {
                icon: "✦",
                title: "AI-Generated Pathways",
                desc: "Tell us your goal, skill level, and constraints. Our AI builds a personalised 4–6 module learning plan specifically for you — not a one-size-fits-all course.",
                accent: "#c084fc",
              },
              {
                icon: "◈",
                title: "Validated Resources",
                desc: "Every resource link is checked before you see it. Broken links are automatically replaced by the AI. You only ever see working, free resources.",
                accent: "#818cf8",
              },
              {
                icon: "◎",
                title: "Progress Tracking",
                desc: "Mark modules complete, earn badges, and watch your progress grow. The system remembers where you are so you can learn at your own pace.",
                accent: "#34d399",
              },
              {
                icon: "✎",
                title: "Personalised Assessment",
                desc: "A 4-step assessment captures your domain, skill level, goals, time availability, and internet access to calibrate your pathway precisely.",
                accent: "#f0abfc",
              },
              {
                icon: "⊞",
                title: "Feedback Analytics",
                desc: "Submit feedback on each module's difficulty and relevance. Your pathway improves as you go, and analytics show your learning patterns.",
                accent: "#fbbf24",
              },
              {
                icon: "⬇",
                title: "PDF Export",
                desc: "Download your full learning pathway as a formatted PDF to reference offline — useful when connectivity is limited.",
                accent: "#c084fc",
              },
            ].map((f, i) => (
              <div key={i} className="feature-card" style={s.featureCard}>
                <div style={{ ...s.featureIcon, color: f.accent, borderColor: f.accent + "30" }}>
                  {f.icon}
                </div>
                <h3 style={s.featureTitle}>{f.title}</h3>
                <p style={s.featureDesc}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ────────────────────────────────────────── */}
      <section id="how-it-works" style={{ ...s.section, backgroundColor: "rgba(124,58,237,0.04)" }}>
        <div style={s.sectionInner}>
          <div style={s.sectionLabel}>How It Works</div>
          <h2 style={s.sectionHeading}>
            From assessment to achievement<br />
            <span className="shimmer-text">in four steps.</span>
          </h2>

          <div className="steps-row" style={s.stepsRow}>
            {[
              {
                step: "01",
                title: "Create Your Account",
                desc: "Register in under a minute. Verify your email and you're ready to begin.",
                icon: "◎",
              },
              {
                step: "02",
                title: "Complete the Assessment",
                desc: "Tell us your domain, skill level, goals, and constraints. Takes 3–5 minutes.",
                icon: "✎",
              },
              {
                step: "03",
                title: "Get Your AI Pathway",
                desc: "Our AI generates a personalised learning plan with validated, free resources.",
                icon: "✦",
              },
              {
                step: "04",
                title: "Learn and Grow",
                desc: "Work through modules at your pace. Track progress, earn badges, export your pathway.",
                icon: "⊞",
              },
            ].map((step, i) => (
              <div key={i} style={s.stepItem}>
                <div style={s.stepNum}>{step.step}</div>
                <div style={s.stepIconWrap}>{step.icon}</div>
                <h3 style={s.stepTitle}>{step.title}</h3>
                <p style={s.stepDesc}>{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── MISSION ─────────────────────────────────────────────── */}
      <section id="mission" style={s.missionSection}>
        <div style={s.missionOrb1} />
        <div style={s.missionOrb2} />
        <div style={s.missionInner}>
          <div style={{ ...s.sectionLabel, color: "#c084fc" }}>Our Mission</div>
          <h2 style={s.missionHeading}>
            Built for African women<br />who deserve better.
          </h2>
          <p style={s.missionText}>
            Women represent only 35% of STEM graduates globally — and far less in Africa. 
            Systemic barriers, limited connectivity, and lack of personalised guidance keep 
            brilliant minds out of STEAM careers. Pathways was built specifically to remove 
            those barriers — one personalised learning pathway at a time.
          </p>
          <div style={s.missionStats}>
            {[
              { stat: "35%", note: "of STEM graduates globally are women — UNESCO 2025" },
              { stat: "2×", note: "African women less likely to access digital education — World Bank 2023" },
              { stat: "1", note: "personalised pathway, built just for you" },
            ].map((m, i) => (
              <div key={i} style={s.missionStat}>
                <div style={s.missionStatVal}>{m.stat}</div>
                <div style={s.missionStatNote}>{m.note}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FINAL CTA ───────────────────────────────────────────── */}
      <section style={s.ctaSection}>
        <div style={s.ctaOrb} />
        <div style={s.ctaInner}>
          <h2 style={s.ctaHeading}>
            Your pathway starts<br />
            <span className="shimmer-text">right now.</span>
          </h2>
          <p style={s.ctaSub}>
            Free to use. No credit card. Takes 5 minutes to generate your first personalised STEAM learning pathway.
          </p>
          <div style={s.ctaBtns}>
            <button style={s.primaryBtn} className="cta-btn" onClick={onGoRegister}>
              Create Your Free Account →
            </button>
            <button style={s.secondaryBtn} className="outline-btn" onClick={onGoLogin}>
              Sign In
            </button>
          </div>
        </div>
      </section>

      {/* ── FOOTER ──────────────────────────────────────────────── */}
      <footer style={s.footer}>
        <div style={s.footerInner}>
          <div style={s.logoWrap}>
            <div style={s.logoMark}>P</div>
            <span style={s.logoText}>Pathways</span>
          </div>
          <p style={s.footerText}>
            AI-Assisted Inclusive STEAM Learning for African Women
          </p>
          <p style={s.footerCopy}>© 2026 Pathways · Built with purpose</p>
        </div>
      </footer>
    </div>
  );
}

// ── Styles ────────────────────────────────────────────────────────
const s = {
  root: {
    fontFamily: "'DM Sans', sans-serif",
    backgroundColor: "#080516",
    color: "#f1f0ff",
    overflowX: "hidden",
    minHeight: "100vh",
  },

  // Nav
  nav: {
    position: "fixed", top: 0, left: 0, right: 0, zIndex: 100,
    transition: "all 0.3s ease",
    padding: "0 24px",
  },
  navInner: {
    maxWidth: "1200px", margin: "0 auto",
    display: "flex", alignItems: "center", justifyContent: "space-between",
    height: "68px",
  },
  logoWrap: { display: "flex", alignItems: "center", gap: "10px" },
  logoMark: {
    width: "36px", height: "36px", borderRadius: "10px",
    background: "linear-gradient(135deg, #7c3aed, #c084fc)",
    color: "#fff", fontWeight: "700", fontSize: "17px",
    display: "flex", alignItems: "center", justifyContent: "center",
    fontFamily: "'Playfair Display', serif",
  },
  logoText: {
    fontSize: "18px", fontWeight: "600", color: "#f1f0ff",
    letterSpacing: "-0.3px",
    fontFamily: "'Playfair Display', serif",
  },
  navLinks: { display: "flex", gap: "36px" },
  navLink: {
    color: "rgba(241,240,255,0.7)", textDecoration: "none",
    fontSize: "14px", fontWeight: "500",
    transition: "color 0.2s",
  },
  navActions: { display: "flex", gap: "10px", alignItems: "center" },
  navLoginBtn: {
    padding: "8px 20px", background: "transparent",
    border: "1px solid rgba(192,132,252,0.4)", color: "#c084fc",
    borderRadius: "8px", fontSize: "14px", fontWeight: "500",
    cursor: "pointer", fontFamily: "'DM Sans', sans-serif",
  },
  navRegisterBtn: {
    padding: "8px 20px",
    background: "linear-gradient(135deg, #7c3aed, #9333ea)",
    border: "none", color: "#fff",
    borderRadius: "8px", fontSize: "14px", fontWeight: "600",
    cursor: "pointer", fontFamily: "'DM Sans', sans-serif",
    boxShadow: "0 4px 16px rgba(124,58,237,0.35)",
  },

  // Hero
  hero: {
    position: "relative", minHeight: "100vh",
    display: "flex", flexDirection: "column",
    justifyContent: "center", paddingTop: "68px",
    overflow: "hidden",
  },
  orb1: {
    position: "absolute", width: "600px", height: "600px",
    borderRadius: "50%", top: "-100px", left: "-200px",
    background: "radial-gradient(circle, rgba(124,58,237,0.25) 0%, transparent 70%)",
    pointerEvents: "none",
  },
  orb2: {
    position: "absolute", width: "500px", height: "500px",
    borderRadius: "50%", bottom: "0", right: "-100px",
    background: "radial-gradient(circle, rgba(192,132,252,0.15) 0%, transparent 70%)",
    pointerEvents: "none",
  },
  orb3: {
    position: "absolute", width: "300px", height: "300px",
    borderRadius: "50%", top: "40%", left: "40%",
    background: "radial-gradient(circle, rgba(129,140,248,0.1) 0%, transparent 70%)",
    pointerEvents: "none",
  },
  gridLines: {
    position: "absolute", inset: 0,
    backgroundImage: `
      linear-gradient(rgba(124,58,237,0.06) 1px, transparent 1px),
      linear-gradient(90deg, rgba(124,58,237,0.06) 1px, transparent 1px)
    `,
    backgroundSize: "60px 60px",
    pointerEvents: "none",
  },
  heroInner: {
    position: "relative", zIndex: 1,
    maxWidth: "1200px", margin: "0 auto",
    padding: "80px 24px 40px",
    display: "flex", alignItems: "center",
    gap: "60px", flex: 1,
  },
  heroLeft: { flex: 1, maxWidth: "600px" },
  heroBadge: {
    display: "inline-flex", alignItems: "center", gap: "8px",
    backgroundColor: "rgba(124,58,237,0.15)",
    border: "1px solid rgba(124,58,237,0.35)",
    borderRadius: "999px", padding: "6px 16px",
    fontSize: "12px", fontWeight: "600", color: "#c084fc",
    letterSpacing: "0.3px", marginBottom: "28px",
    textTransform: "uppercase",
  },
  badgeDot: {
    width: "6px", height: "6px", borderRadius: "50%",
    backgroundColor: "#c084fc",
    boxShadow: "0 0 6px #c084fc",
    animation: "pulse 2s ease-in-out infinite",
    display: "inline-block",
  },
  heroHeading: {
    fontFamily: "'Playfair Display', serif",
    fontSize: "clamp(42px, 5vw, 72px)",
    fontWeight: "900", lineHeight: "1.1",
    color: "#f1f0ff", marginBottom: "24px",
    letterSpacing: "-1px",
  },
  heroAccent: {
    fontFamily: "'Playfair Display', serif",
    fontSize: "clamp(38px, 5vw, 68px)",
    fontWeight: "900",
    background: "linear-gradient(135deg, #c084fc, #818cf8)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
    backgroundClip: "text",
    display: "block",
    animation: "fadeUp 0.8s 0.7s ease forwards",
    opacity: 0,
  },
  heroSub: {
    fontSize: "17px", lineHeight: "1.75",
    color: "rgba(241,240,255,0.65)",
    marginBottom: "36px", fontWeight: "300",
    maxWidth: "520px",
  },
  heroCTARow: { display: "flex", gap: "14px", alignItems: "center", marginBottom: "20px" },
  primaryBtn: {
    padding: "14px 28px",
    background: "linear-gradient(135deg, #7c3aed, #9333ea)",
    border: "none", color: "#fff", borderRadius: "10px",
    fontSize: "15px", fontWeight: "600", cursor: "pointer",
    fontFamily: "'DM Sans', sans-serif",
    boxShadow: "0 8px 24px rgba(124,58,237,0.35)",
  },
  secondaryBtn: {
    padding: "14px 28px", background: "transparent",
    border: "1px solid rgba(192,132,252,0.4)",
    color: "#c084fc", borderRadius: "10px",
    fontSize: "15px", fontWeight: "500", cursor: "pointer",
    fontFamily: "'DM Sans', sans-serif",
  },
  heroNote: {
    fontSize: "12px", color: "rgba(241,240,255,0.35)",
    fontWeight: "400",
  },
  heroRight: {
    flex: "0 0 380px", position: "relative",
    height: "360px", display: "flex",
    alignItems: "center", justifyContent: "center",
  },
  cardStack: { position: "relative", width: "100%", height: "100%" },
  floatCard: {
    position: "absolute",
    backgroundColor: "rgba(20,12,50,0.9)",
    border: "1px solid rgba(124,58,237,0.3)",
    borderRadius: "14px", padding: "16px 20px",
    backdropFilter: "blur(20px)",
    boxShadow: "0 8px 32px rgba(0,0,0,0.4)",
    width: "240px",
  },
  floatCardDot: {
    width: "8px", height: "8px", borderRadius: "50%",
    backgroundColor: "#c084fc", marginBottom: "10px",
    boxShadow: "0 0 8px rgba(192,132,252,0.6)",
  },
  floatCardTitle: {
    fontSize: "13px", fontWeight: "600", color: "#f1f0ff", marginBottom: "4px",
  },
  floatCardSub: { fontSize: "11px", color: "rgba(241,240,255,0.5)", marginBottom: "10px" },
  floatCardBar: {
    height: "4px", backgroundColor: "rgba(124,58,237,0.2)",
    borderRadius: "2px", marginBottom: "6px",
  },
  floatCardProgress: {
    height: "100%", borderRadius: "2px",
    background: "linear-gradient(90deg, #7c3aed, #c084fc)",
  },
  floatCardLabel: { fontSize: "10px", color: "#c084fc", fontWeight: "600" },

  // Stats
  statsBar: {
    position: "relative", zIndex: 1,
    maxWidth: "1200px", margin: "0 auto",
    padding: "0 24px 60px",
    display: "grid", gridTemplateColumns: "repeat(4, 1fr)",
    gap: "1px",
    borderTop: "1px solid rgba(124,58,237,0.15)",
  },
  statItem: {
    padding: "28px 24px",
    borderRight: "1px solid rgba(124,58,237,0.1)",
    textAlign: "center",
  },
  statValue: {
    fontFamily: "'Playfair Display', serif",
    fontSize: "40px", fontWeight: "900",
    background: "linear-gradient(135deg, #c084fc, #818cf8)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
    backgroundClip: "text",
    marginBottom: "4px",
  },
  statLabel: { fontSize: "13px", color: "rgba(241,240,255,0.5)", fontWeight: "400" },

  // Sections
  section: { padding: "100px 24px" },
  sectionInner: { maxWidth: "1200px", margin: "0 auto" },
  sectionLabel: {
    fontSize: "11px", fontWeight: "700", color: "#c084fc",
    textTransform: "uppercase", letterSpacing: "2px",
    marginBottom: "16px",
  },
  sectionHeading: {
    fontFamily: "'Playfair Display', serif",
    fontSize: "clamp(32px, 4vw, 52px)",
    fontWeight: "900", color: "#f1f0ff",
    lineHeight: "1.2", marginBottom: "56px",
    letterSpacing: "-0.5px",
  },

  // Features
  featuresGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(3, 1fr)",
    gap: "20px",
  },
  featureCard: {
    backgroundColor: "rgba(20,12,50,0.6)",
    border: "1px solid rgba(124,58,237,0.2)",
    borderRadius: "16px", padding: "28px",
    backdropFilter: "blur(10px)",
    boxShadow: "0 4px 24px rgba(0,0,0,0.2)",
  },
  featureIcon: {
    width: "48px", height: "48px", borderRadius: "12px",
    border: "1px solid",
    display: "flex", alignItems: "center", justifyContent: "center",
    fontSize: "20px", marginBottom: "18px",
    backgroundColor: "rgba(124,58,237,0.08)",
  },
  featureTitle: {
    fontSize: "16px", fontWeight: "600",
    color: "#f1f0ff", marginBottom: "10px",
  },
  featureDesc: {
    fontSize: "14px", color: "rgba(241,240,255,0.55)",
    lineHeight: "1.7", fontWeight: "300",
  },

  // Steps
  stepsRow: {
    display: "flex", gap: "8px",
    position: "relative",
  },
  stepItem: {
    flex: 1, textAlign: "center",
    padding: "32px 20px",
    backgroundColor: "rgba(20,12,50,0.4)",
    border: "1px solid rgba(124,58,237,0.15)",
    borderRadius: "16px",
    position: "relative",
  },
  stepNum: {
    fontFamily: "'Playfair Display', serif",
    fontSize: "48px", fontWeight: "900",
    color: "rgba(124,58,237,0.2)",
    lineHeight: 1, marginBottom: "12px",
  },
  stepIconWrap: {
    fontSize: "24px", color: "#c084fc",
    marginBottom: "14px",
  },
  stepTitle: {
    fontSize: "15px", fontWeight: "600",
    color: "#f1f0ff", marginBottom: "10px",
  },
  stepDesc: {
    fontSize: "13px", color: "rgba(241,240,255,0.5)",
    lineHeight: "1.65", fontWeight: "300",
  },

  // Mission
  missionSection: {
    position: "relative", padding: "100px 24px",
    backgroundColor: "rgba(124,58,237,0.06)",
    overflow: "hidden",
  },
  missionOrb1: {
    position: "absolute", width: "400px", height: "400px",
    borderRadius: "50%", top: "-100px", right: "-100px",
    background: "radial-gradient(circle, rgba(124,58,237,0.2) 0%, transparent 70%)",
    pointerEvents: "none",
  },
  missionOrb2: {
    position: "absolute", width: "300px", height: "300px",
    borderRadius: "50%", bottom: "0", left: "10%",
    background: "radial-gradient(circle, rgba(192,132,252,0.1) 0%, transparent 70%)",
    pointerEvents: "none",
  },
  missionInner: {
    position: "relative", zIndex: 1,
    maxWidth: "900px", margin: "0 auto", textAlign: "center",
  },
  missionHeading: {
    fontFamily: "'Playfair Display', serif",
    fontSize: "clamp(32px, 4vw, 52px)",
    fontWeight: "900", color: "#f1f0ff",
    lineHeight: "1.2", marginBottom: "24px",
    letterSpacing: "-0.5px",
  },
  missionText: {
    fontSize: "17px", color: "rgba(241,240,255,0.65)",
    lineHeight: "1.8", fontWeight: "300",
    maxWidth: "680px", margin: "0 auto 56px",
  },
  missionStats: {
    display: "flex", gap: "2px",
    border: "1px solid rgba(124,58,237,0.2)",
    borderRadius: "16px", overflow: "hidden",
  },
  missionStat: {
    flex: 1, padding: "32px 24px", textAlign: "center",
    borderRight: "1px solid rgba(124,58,237,0.15)",
    backgroundColor: "rgba(20,12,50,0.5)",
  },
  missionStatVal: {
    fontFamily: "'Playfair Display', serif",
    fontSize: "44px", fontWeight: "900",
    background: "linear-gradient(135deg, #c084fc, #818cf8)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
    backgroundClip: "text",
    marginBottom: "8px",
  },
  missionStatNote: {
    fontSize: "12px", color: "rgba(241,240,255,0.45)",
    lineHeight: "1.5",
  },

  // CTA
  ctaSection: {
    position: "relative", padding: "120px 24px",
    textAlign: "center", overflow: "hidden",
  },
  ctaOrb: {
    position: "absolute", width: "600px", height: "600px",
    borderRadius: "50%", top: "50%", left: "50%",
    transform: "translate(-50%, -50%)",
    background: "radial-gradient(circle, rgba(124,58,237,0.2) 0%, transparent 70%)",
    pointerEvents: "none",
  },
  ctaInner: { position: "relative", zIndex: 1, maxWidth: "700px", margin: "0 auto" },
  ctaHeading: {
    fontFamily: "'Playfair Display', serif",
    fontSize: "clamp(36px, 5vw, 60px)",
    fontWeight: "900", color: "#f1f0ff",
    lineHeight: "1.2", marginBottom: "20px",
    letterSpacing: "-0.5px",
  },
  ctaSub: {
    fontSize: "16px", color: "rgba(241,240,255,0.55)",
    lineHeight: "1.7", marginBottom: "40px", fontWeight: "300",
  },
  ctaBtns: { display: "flex", gap: "14px", justifyContent: "center", flexWrap: "wrap" },

  // Footer
  footer: {
    borderTop: "1px solid rgba(124,58,237,0.15)",
    padding: "40px 24px",
  },
  footerInner: {
    maxWidth: "1200px", margin: "0 auto",
    display: "flex", flexDirection: "column",
    alignItems: "center", gap: "12px",
  },
  footerText: {
    fontSize: "13px", color: "rgba(241,240,255,0.4)",
  },
  footerCopy: {
    fontSize: "12px", color: "rgba(241,240,255,0.25)",
  },
};