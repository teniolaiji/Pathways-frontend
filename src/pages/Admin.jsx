import { useState, useEffect } from "react";
import {
  PageShell, PageHeader, Card,
  ErrorBanner, SuccessBanner, Spinner, T,
} from "../components/Shared";
import API from "../config";

export default function Admin({ user, token, onNavigate, onLogout }) {
  const [tab, setTab]           = useState("stats");
  const [stats, setStats]       = useState(null);
  const [users, setUsers]       = useState([]);
  const [flagged, setFlagged]   = useState([]);
  const [pathways, setPathways] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [search, setSearch]     = useState("");
  const [error, setError]       = useState("");
  const [success, setSuccess]   = useState("");

  const auth = {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };

  useEffect(() => { loadTab(tab); }, [tab]);

  const loadTab = async (t) => {
    setLoading(true);
    setError("");
    setSuccess("");
    try {
      const endpoints = {
        stats:    `${API}/admin/stats`,
        users:    `${API}/admin/users`,
        flagged:  `${API}/admin/flagged-resources`,
        pathways: `${API}/admin/pathways`,
      };
      const res  = await fetch(endpoints[t], { headers: auth });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      if (t === "stats")    setStats(data);
      if (t === "users")    setUsers(data.users);
      if (t === "flagged")  setFlagged(data.flaggedResources);
      if (t === "pathways") setPathways(data.pathways);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const apiCall = async (url, method, onSuccess, refreshTab) => {
    try {
      const res  = await fetch(url, { method, headers: auth });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setSuccess(onSuccess);
      loadTab(refreshTab);
    } catch (err) { setError(err.message); }
  };

  const filteredUsers = users.filter(
    (u) =>
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={layout.page}>
      {/* Sidebar */}
      <aside style={layout.sidebar}>
        <div style={layout.brand}>
          <div style={layout.logoMark}>P</div>
          <span style={layout.brandName}>Pathways</span>
        </div>
        <nav style={layout.nav}>
          {[
            { key: "dashboard", icon: "⊞", label: "Dashboard"   },
            { key: "assessment",icon: "✎", label: "Assessment"  },
            { key: "pathways",  icon: "◈", label: "My Pathways" },
            { key: "profile",   icon: "◎", label: "Profile"     },
            { key: "admin",     icon: "⚙", label: "Admin Panel" },
          ].map((item) => (
            <div
              key={item.key}
              style={{ ...layout.navItem, ...(item.key === "admin" ? layout.navActive : {}) }}
              onClick={() => item.key !== "admin" && onNavigate(item.key)}
            >
              <span>{item.icon}</span> {item.label}
            </div>
          ))}
        </nav>
        <div style={layout.footer}>
          <div style={layout.userRow}>
            <div style={layout.avatar}>{user?.name?.charAt(0).toUpperCase()}</div>
            <div>
              <div style={layout.userName}>{user?.name}</div>
              <div style={layout.userRole}>Admin</div>
            </div>
          </div>
          <button style={layout.logoutBtn} onClick={onLogout}>Sign out</button>
        </div>
      </aside>

      <PageShell>
        <PageHeader
          title="Admin Panel"
          subtitle="Manage users, pathways, and flagged resources."
        />

        {/* Tabs */}
        <div style={s.tabs}>
          {[
            { key: "stats",    label: "📊 Overview"  },
            { key: "users",    label: "👥 Users"     },
            { key: "pathways", label: "◈ Pathways"   },
            { key: "flagged",  label: "⚑ Flagged"    },
          ].map((t) => (
            <div
              key={t.key}
              style={{ ...s.tab, ...(tab === t.key ? s.tabActive : {}) }}
              onClick={() => setTab(t.key)}
            >
              {t.label}
            </div>
          ))}
        </div>

        <ErrorBanner message={error} />
        <SuccessBanner message={success} />

        {loading ? <Spinner /> : (
          <>
            {/* STATS */}
            {tab === "stats" && stats && (
              <div>
                <div style={s.statsGrid}>
                  <StatBox label="Total Users"        value={stats.users.total}           color={T.purple500} />
                  <StatBox label="Learners"           value={stats.users.learners}        color={T.purple600} />
                  <StatBox label="Admins"             value={stats.users.admins}          color={T.purple700} />
                  <StatBox label="Total Pathways"     value={stats.pathways.total}        color={T.purple500} />
                  <StatBox label="Active"             value={stats.pathways.active}       color={T.green500}  />
                  <StatBox label="Completed"          value={stats.pathways.completed}    color={T.green500}  />
                  <StatBox label="Assessments"        value={stats.assessments.total}     color={T.purple500} />
                  <StatBox label="Flagged Resources"  value={stats.flaggedResources}
                    color={stats.flaggedResources > 0 ? T.red500 : T.green500}
                  />
                </div>

                {stats.recentUsers?.length > 0 && (
                  <Card style={{ marginTop: "24px" }}>
                    <div style={s.cardTitle}>Recent Registrations</div>
                    <DataTable
                      headers={["Name", "Email", "Role", "Joined"]}
                      rows={stats.recentUsers.map((u) => [
                        u.name,
                        u.email,
                        <RoleBadge role={u.role} />,
                        new Date(u.createdAt).toLocaleDateString(),
                      ])}
                    />
                  </Card>
                )}
              </div>
            )}

            {/* USERS */}
            {tab === "users" && (
              <div>
                <input
                  style={s.searchInput}
                  placeholder="Search by name or email…"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
                <Card>
                  <DataTable
                    headers={["Name", "Email", "Role", "Pathways", "Joined", "Actions"]}
                    rows={filteredUsers.map((u) => [
                      u.name,
                      u.email,
                      <RoleBadge role={u.role} />,
                      u.pathwayCount,
                      new Date(u.createdAt).toLocaleDateString(),
                      <div style={s.actionBtns}>
                        {u.role === "learner" ? (
                          <button style={s.promoteBtn}
                            onClick={() => { if (window.confirm(`Promote ${u.name} to admin?`)) apiCall(`${API}/admin/users/${u._id}/promote`, "PUT", `${u.name} promoted to admin.`, "users"); }}>
                            Promote
                          </button>
                        ) : u._id !== user?.id && (
                          <button style={s.demoteBtn}
                            onClick={() => { if (window.confirm(`Demote ${u.name} to learner?`)) apiCall(`${API}/admin/users/${u._id}/demote`, "PUT", `${u.name} demoted.`, "users"); }}>
                            Demote
                          </button>
                        )}
                        {u._id !== user?.id && (
                          <button style={s.deleteBtn}
                            onClick={() => { if (window.confirm(`Delete ${u.name} and ALL their data? Cannot be undone.`)) apiCall(`${API}/admin/users/${u._id}`, "DELETE", `${u.name} deleted.`, "users"); }}>
                            Delete
                          </button>
                        )}
                      </div>,
                    ])}
                    emptyMessage="No users found."
                  />
                </Card>
              </div>
            )}

            {/* PATHWAYS */}
            {tab === "pathways" && (
              <Card>
                <DataTable
                  headers={["Title", "User", "Domain", "Status", "Created", "Actions"]}
                  rows={pathways.map((p) => [
                    <span style={{ fontSize: "13px", fontWeight: "600", color: T.purple900 }}>
                      {p.title?.substring(0, 45)}{p.title?.length > 45 ? "…" : ""}
                    </span>,
                    p.user?.name ?? "—",
                    p.assessment?.domain
                      ? p.assessment.domain.charAt(0).toUpperCase() + p.assessment.domain.slice(1)
                      : "—",
                    <RoleBadge role={p.status} />,
                    new Date(p.createdAt).toLocaleDateString(),
                    <button style={s.deleteBtn}
                      onClick={() => { if (window.confirm(`Delete "${p.title}"?`)) apiCall(`${API}/admin/pathways/${p._id}`, "DELETE", "Pathway deleted.", "pathways"); }}>
                      Delete
                    </button>,
                  ])}
                  emptyMessage="No pathways found."
                />
              </Card>
            )}

            {/* FLAGGED RESOURCES */}
            {tab === "flagged" && (
              flagged.length === 0 ? (
                <Card>
                  <p style={{ textAlign: "center", color: T.green500, padding: "32px", fontWeight: "600" }}>
                    ✓ No flagged resources — everything looks clean!
                  </p>
                </Card>
              ) : (
                <div style={s.flaggedList}>
                  {flagged.map((r, i) => (
                    <Card key={i} style={{ marginBottom: "12px" }}>
                      <div style={s.flaggedHeader}>
                        <div>
                          <div style={s.flaggedTitle}>{r.resourceTitle}</div>
                          <div style={s.flaggedMeta}>
                            {r.pathwayTitle} → {r.moduleTitle}
                          </div>
                          <a href={r.resourceUrl} target="_blank" rel="noopener noreferrer"
                            style={{ fontSize: "12px", color: T.purple500 }}>
                            {r.resourceUrl}
                          </a>
                        </div>
                        <div style={s.flaggedRight}>
                          <span style={{
                            ...s.flagCount,
                            backgroundColor: r.flagCount >= 3 ? T.red100 : "#fef3c7",
                            color: r.flagCount >= 3 ? T.red500 : T.amber500,
                          }}>
                            ⚑ {r.flagCount} flag{r.flagCount !== 1 ? "s" : ""}
                          </span>
                          <div style={s.actionBtns}>
                            <button style={s.promoteBtn}
                              onClick={() => apiCall(
                                `${API}/admin/resources/${r.pathwayId}/${r.moduleId}/${r.resourceId}/restore`,
                                "PUT", `Restored: ${r.resourceTitle}`, "flagged"
                              )}>
                              Restore
                            </button>
                            <button style={s.deleteBtn}
                              onClick={() => { if (window.confirm(`Remove "${r.resourceTitle}"?`)) apiCall(
                                `${API}/admin/resources/${r.pathwayId}/${r.moduleId}/${r.resourceId}`,
                                "DELETE", `Removed: ${r.resourceTitle}`, "flagged"
                              );}}>
                              Remove
                            </button>
                          </div>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              )
            )}
          </>
        )}
      </PageShell>
    </div>
  );
}

// ── Sub-components ───────────────────────────────────────────────
function StatBox({ label, value, color }) {
  return (
    <Card style={{ textAlign: "center", borderTop: `3px solid ${color}` }}>
      <div style={{ fontSize: "28px", fontWeight: "700", color, marginBottom: "4px" }}>{value}</div>
      <div style={{ fontSize: "12px", color: T.gray500, fontWeight: "500" }}>{label}</div>
    </Card>
  );
}

function RoleBadge({ role }) {
  const colors = {
    admin:     { bg: T.purple100, color: T.purple600 },
    learner:   { bg: T.gray100,   color: T.gray700   },
    active:    { bg: T.purple100, color: T.purple500  },
    completed: { bg: "#dcfce7",   color: T.green500   },
    archived:  { bg: T.gray100,   color: T.gray500    },
  };
  const c = colors[role] || colors.learner;
  return (
    <span style={{
      backgroundColor: c.bg, color: c.color,
      borderRadius: "999px", padding: "3px 10px",
      fontSize: "11px", fontWeight: "600",
    }}>
      {role}
    </span>
  );
}

function DataTable({ headers, rows, emptyMessage }) {
  if (rows.length === 0) {
    return <p style={{ textAlign: "center", color: T.gray500, padding: "24px" }}>{emptyMessage}</p>;
  }
  return (
    <div style={{ overflowX: "auto" }}>
      <table style={s.table}>
        <thead>
          <tr>{headers.map((h) => <th key={h} style={s.th}>{h}</th>)}</tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i}>
              {row.map((cell, j) => <td key={j} style={s.td}>{cell}</td>)}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ── Styles ───────────────────────────────────────────────────────
const layout = {
  page: { display: "flex", fontFamily: T.font, minHeight: "100vh", backgroundColor: T.purple50 },
  sidebar: {
    width: "228px", minHeight: "100vh", backgroundColor: T.purple900,
    display: "flex", flexDirection: "column", padding: "24px 14px",
    position: "sticky", top: 0, flexShrink: 0,
  },
  brand: { display: "flex", alignItems: "center", gap: "10px", marginBottom: "36px", paddingLeft: "8px" },
  logoMark: {
    width: "32px", height: "32px", borderRadius: "8px", backgroundColor: T.purple500,
    color: T.white, fontWeight: "700", fontSize: "16px",
    display: "flex", alignItems: "center", justifyContent: "center",
  },
  brandName: { fontSize: "18px", fontWeight: "700", color: "#e9d5ff" },
  nav: { display: "flex", flexDirection: "column", gap: "2px", flex: 1 },
  navItem: {
    display: "flex", alignItems: "center", gap: "10px", padding: "10px 12px",
    borderRadius: T.radiusSm, color: T.purple200, fontSize: "14px",
    fontWeight: "500", cursor: "pointer",
  },
  navActive: { backgroundColor: T.purple800, color: "#e9d5ff", fontWeight: "600" },
  footer: { marginTop: "auto", borderTop: `1px solid ${T.purple800}`, paddingTop: "16px", display: "flex", flexDirection: "column", gap: "10px" },
  userRow: { display: "flex", alignItems: "center", gap: "10px" },
  avatar: {
    width: "34px", height: "34px", borderRadius: "50%", backgroundColor: T.purple500,
    color: T.white, fontWeight: "700", fontSize: "14px",
    display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
  },
  userName: { fontSize: "13px", fontWeight: "600", color: "#e9d5ff" },
  userRole: { fontSize: "11px", color: T.purple400 },
  logoutBtn: {
    background: "transparent", border: `1px solid ${T.purple800}`, color: T.purple200,
    borderRadius: "6px", padding: "7px", fontSize: "12px", cursor: "pointer", width: "100%",
    fontFamily: T.font,
  },
};

const s = {
  tabs: { display: "flex", gap: "4px", marginBottom: "24px", flexWrap: "wrap" },
  tab: {
    padding: "8px 18px", borderRadius: T.radiusSm, fontSize: "13px", fontWeight: "500",
    color: T.gray500, cursor: "pointer", backgroundColor: T.white, border: T.cardBorder,
  },
  tabActive: { backgroundColor: T.purple500, color: T.white, border: `1px solid ${T.purple500}` },
  statsGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))", gap: "14px" },
  cardTitle: { fontSize: "15px", fontWeight: "700", color: T.purple900, marginBottom: "14px" },
  searchInput: {
    width: "100%", maxWidth: "360px", padding: "10px 14px", borderRadius: T.radiusSm,
    border: `1.5px solid ${T.gray200}`, fontSize: "14px", marginBottom: "16px",
    fontFamily: T.font, outline: "none", boxSizing: "border-box",
  },
  table: { width: "100%", borderCollapse: "collapse", fontSize: "13px" },
  th: {
    textAlign: "left", padding: "10px 12px", borderBottom: `2px solid ${T.purple100}`,
    fontSize: "11px", fontWeight: "700", color: T.gray500,
    textTransform: "uppercase", letterSpacing: "0.4px", whiteSpace: "nowrap",
  },
  td: { padding: "10px 12px", borderBottom: `1px solid ${T.gray100}`, color: T.gray700, verticalAlign: "middle" },
  actionBtns: { display: "flex", gap: "6px", flexWrap: "wrap" },
  promoteBtn: {
    padding: "4px 10px", backgroundColor: T.purple100, color: T.purple600,
    border: "none", borderRadius: "6px", fontSize: "12px", fontWeight: "600",
    cursor: "pointer", fontFamily: T.font,
  },
  demoteBtn: {
    padding: "4px 10px", backgroundColor: "#fef3c7", color: T.amber500,
    border: "none", borderRadius: "6px", fontSize: "12px", fontWeight: "600",
    cursor: "pointer", fontFamily: T.font,
  },
  deleteBtn: {
    padding: "4px 10px", backgroundColor: "#fef2f2", color: T.red500,
    border: "none", borderRadius: "6px", fontSize: "12px", fontWeight: "600",
    cursor: "pointer", fontFamily: T.font,
  },
  flaggedList: {},
  flaggedHeader: { display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "16px" },
  flaggedTitle: { fontSize: "14px", fontWeight: "600", color: T.purple900, marginBottom: "3px" },
  flaggedMeta: { fontSize: "12px", color: T.gray500, marginBottom: "4px" },
  flaggedRight: { display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "8px", flexShrink: 0 },
  flagCount: { borderRadius: "999px", padding: "4px 12px", fontSize: "12px", fontWeight: "700" },
};