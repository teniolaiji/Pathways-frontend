// ─── Theme tokens ───────────────────────────────────────────────
// Single source of truth for all colours, radii, and shadows.
// Import this into every page so the UI stays consistent.

export const T = {
  // Brand purples
  purple900: "#1e1b4b",
  purple800: "#312e81",
  purple700: "#4338ca",
  purple600: "#5b21b6",
  purple500: "#7c3aed",
  purple400: "#a78bfa",
  purple200: "#c4b5fd",
  purple100: "#ede9fe",
  purple50:  "#f5f3ff",

  // Neutrals
  gray900: "#111827",
  gray700: "#374151",
  gray500: "#6b7280",
  gray300: "#d1d5db",
  gray200: "#e5e7eb",
  gray100: "#f3f4f6",
  gray50:  "#f9fafb",
  white:   "#ffffff",

  // Status
  green500: "#059669",
  green100: "#d1fae5",
  red500:   "#dc2626",
  red100:   "#fef2f2",
  amber500: "#d97706",
  amber100: "#fef3c7",

  // Typography
  font: "'Segoe UI', system-ui, sans-serif",

  // Surfaces
  cardShadow: "0 2px 16px rgba(109,40,217,0.09)",
  cardBorder: "1px solid #ede9fe",
  radius:     "12px",
  radiusSm:   "8px",
};

// ─── Shared sidebar ─────────────────────────────────────────────
export function Sidebar({ user, active, onNavigate, onLogout }) {
  const items = [
    { key: "dashboard", icon: "⊞", label: "Dashboard" },
    { key: "assessment", icon: "✎", label: "Assessment" },
    { key: "pathways",   icon: "◈", label: "My Pathways" },
    { key: "profile",    icon: "◎", label: "Profile"    },
  ];

  return (
    <aside style={sb.sidebar}>
      {/* Brand */}
      <div style={sb.brand}>
        <div style={sb.logoMark}>P</div>
        <span style={sb.brandName}>Pathways</span>
      </div>

      {/* Nav */}
      <nav style={sb.nav}>
        {items.map((item) => (
          <div
            key={item.key}
            style={{
              ...sb.navItem,
              ...(active === item.key ? sb.navItemActive : {}),
            }}
            onClick={() => onNavigate(item.key)}
          >
            <span style={sb.navIcon}>{item.icon}</span>
            {item.label}
          </div>
        ))}
      </nav>

      {/* User footer */}
      <div style={sb.footer}>
        <div style={sb.userRow}>
          <div style={sb.avatar}>
            {user?.name?.charAt(0).toUpperCase()}
          </div>
          <div style={sb.userInfo}>
            <div style={sb.userName}>{user?.name}</div>
            <div style={sb.userEmail}>{user?.email}</div>
          </div>
        </div>
        <button style={sb.logoutBtn} onClick={onLogout}>
          Sign out
        </button>
      </div>
    </aside>
  );
}

// ─── Page shell ─────────────────────────────────────────────────
export function PageShell({ children }) {
  return <main style={shell.main}>{children}</main>;
}

export function PageHeader({ title, subtitle, action }) {
  return (
    <div style={shell.header}>
      <div>
        <h1 style={shell.title}>{title}</h1>
        {subtitle && <p style={shell.subtitle}>{subtitle}</p>}
      </div>
      {action && <div>{action}</div>}
    </div>
  );
}

// ─── Cards ───────────────────────────────────────────────────────
export function Card({ children, style }) {
  return (
    <div style={{ ...card.base, ...style }}>
      {children}
    </div>
  );
}

// ─── Buttons ─────────────────────────────────────────────────────
export function PrimaryBtn({ children, onClick, disabled, style }) {
  return (
    <button
      style={{ ...btn.primary, opacity: disabled ? 0.65 : 1, ...style }}
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </button>
  );
}

export function GhostBtn({ children, onClick, style }) {
  return (
    <button style={{ ...btn.ghost, ...style }} onClick={onClick}>
      {children}
    </button>
  );
}

// ─── Banners ─────────────────────────────────────────────────────
export function ErrorBanner({ message }) {
  if (!message) return null;
  return <div style={banner.error}>{message}</div>;
}

export function SuccessBanner({ message }) {
  if (!message) return null;
  return <div style={banner.success}>{message}</div>;
}

// ─── Badge pill ──────────────────────────────────────────────────
export function BadgePill({ label }) {
  return <span style={misc.badge}>{label}</span>;
}

// ─── Progress bar ────────────────────────────────────────────────
export function ProgressBar({ pct, showLabel = true }) {
  return (
    <div>
      <div style={misc.track}>
        <div style={{ ...misc.fill, width: `${pct}%` }} />
      </div>
      {showLabel && (
        <p style={misc.pctLabel}>{pct}% complete</p>
      )}
    </div>
  );
}

// ─── Spinner ─────────────────────────────────────────────────────
export function Spinner() {
  return (
    <div style={misc.spinnerWrap}>
      <div style={misc.spinner} />
    </div>
  );
}

// ─── Empty state ─────────────────────────────────────────────────
export function EmptyState({ icon, title, body, action }) {
  return (
    <div style={misc.emptyState}>
      <div style={misc.emptyIcon}>{icon}</div>
      <p style={misc.emptyTitle}>{title}</p>
      {body && <p style={misc.emptyBody}>{body}</p>}
      {action && <div style={{ marginTop: "20px" }}>{action}</div>}
    </div>
  );
}

// ─── Styles ──────────────────────────────────────────────────────
const sb = {
  sidebar: {
    width: "228px",
    minHeight: "100vh",
    backgroundColor: T.purple900,
    display: "flex",
    flexDirection: "column",
    padding: "24px 14px",
    position: "sticky",
    top: 0,
    flexShrink: 0,
  },
  brand: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    marginBottom: "36px",
    paddingLeft: "8px",
  },
  logoMark: {
    width: "32px",
    height: "32px",
    borderRadius: "8px",
    backgroundColor: T.purple500,
    color: T.white,
    fontWeight: "700",
    fontSize: "16px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  brandName: {
    fontSize: "18px",
    fontWeight: "700",
    color: "#e9d5ff",
    letterSpacing: "-0.2px",
  },
  nav: {
    display: "flex",
    flexDirection: "column",
    gap: "2px",
    flex: 1,
  },
  navItem: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    padding: "10px 12px",
    borderRadius: T.radiusSm,
    color: T.purple200,
    fontSize: "14px",
    fontWeight: "500",
    cursor: "pointer",
    transition: "background 0.15s",
  },
  navItemActive: {
    backgroundColor: T.purple800,
    color: "#e9d5ff",
    fontWeight: "600",
  },
  navIcon: {
    fontSize: "15px",
    width: "18px",
    textAlign: "center",
  },
  footer: {
    marginTop: "auto",
    borderTop: `1px solid ${T.purple800}`,
    paddingTop: "16px",
    display: "flex",
    flexDirection: "column",
    gap: "10px",
  },
  userRow: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
  },
  avatar: {
    width: "34px",
    height: "34px",
    borderRadius: "50%",
    backgroundColor: T.purple500,
    color: T.white,
    fontWeight: "700",
    fontSize: "14px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  userInfo: { overflow: "hidden" },
  userName: {
    fontSize: "13px",
    fontWeight: "600",
    color: "#e9d5ff",
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
  },
  userEmail: {
    fontSize: "11px",
    color: T.purple400,
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
  },
  logoutBtn: {
    background: "transparent",
    border: `1px solid ${T.purple800}`,
    color: T.purple200,
    borderRadius: "6px",
    padding: "7px",
    fontSize: "12px",
    cursor: "pointer",
    width: "100%",
    fontFamily: T.font,
  },
};

const shell = {
  main: {
    flex: 1,
    padding: "40px 48px",
    overflowY: "auto",
    fontFamily: T.font,
    backgroundColor: T.purple50,
    minHeight: "100vh",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: "32px",
  },
  title: {
    fontSize: "24px",
    fontWeight: "700",
    color: T.purple900,
    margin: "0 0 5px 0",
  },
  subtitle: {
    fontSize: "14px",
    color: T.gray500,
    margin: 0,
  },
};

const card = {
  base: {
    backgroundColor: T.white,
    border: T.cardBorder,
    borderRadius: T.radius,
    padding: "20px 24px",
    boxShadow: T.cardShadow,
  },
};

const btn = {
  primary: {
    padding: "10px 22px",
    backgroundColor: T.purple500,
    color: T.white,
    border: "none",
    borderRadius: T.radiusSm,
    fontSize: "14px",
    fontWeight: "600",
    cursor: "pointer",
    fontFamily: T.font,
  },
  ghost: {
    background: "none",
    border: `1.5px solid ${T.purple500}`,
    color: T.purple500,
    borderRadius: T.radiusSm,
    padding: "9px 20px",
    fontSize: "14px",
    fontWeight: "600",
    cursor: "pointer",
    fontFamily: T.font,
  },
};

const banner = {
  error: {
    backgroundColor: T.red100,
    border: `1px solid #fecaca`,
    color: T.red500,
    borderRadius: T.radiusSm,
    padding: "10px 14px",
    fontSize: "13px",
    marginBottom: "16px",
  },
  success: {
    backgroundColor: T.green100,
    border: `1px solid #6ee7b7`,
    color: T.green500,
    borderRadius: T.radiusSm,
    padding: "10px 14px",
    fontSize: "13px",
    marginBottom: "16px",
  },
};

const misc = {
  badge: {
    display: "inline-block",
    backgroundColor: T.purple100,
    color: T.purple600,
    borderRadius: "999px",
    padding: "4px 12px",
    fontSize: "12px",
    fontWeight: "600",
  },
  track: {
    height: "8px",
    backgroundColor: T.purple100,
    borderRadius: "999px",
    overflow: "hidden",
  },
  fill: {
    height: "100%",
    backgroundColor: T.purple500,
    borderRadius: "999px",
    transition: "width 0.4s ease",
  },
  pctLabel: {
    fontSize: "12px",
    color: T.gray500,
    marginTop: "5px",
  },
  spinnerWrap: {
    display: "flex",
    justifyContent: "center",
    padding: "60px 0",
  },
  spinner: {
    width: "32px",
    height: "32px",
    border: `3px solid ${T.purple100}`,
    borderTop: `3px solid ${T.purple500}`,
    borderRadius: "50%",
    animation: "spin 0.75s linear infinite",
  },
  emptyState: {
    textAlign: "center",
    padding: "64px 24px",
    backgroundColor: T.white,
    border: T.cardBorder,
    borderRadius: T.radius,
  },
  emptyIcon: {
    fontSize: "38px",
    marginBottom: "14px",
  },
  emptyTitle: {
    fontSize: "16px",
    fontWeight: "700",
    color: T.purple900,
    margin: "0 0 6px 0",
  },
  emptyBody: {
    fontSize: "14px",
    color: T.gray500,
    margin: 0,
    maxWidth: "340px",
    marginInline: "auto",
    lineHeight: "1.6",
  },
};