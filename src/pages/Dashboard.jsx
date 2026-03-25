import { useState, useEffect } from "react";
import {
  Sidebar, PageShell, PageHeader,
  Card, PrimaryBtn, ProgressBar,
  EmptyState, Spinner, T,
} from "../components/shared";
import API from "../config";

export default function Dashboard({ user, token, onNavigate, onLogout }) {
  const [pathways, setPathways]       = useState([]);
  const [allProgress, setAllProgress] = useState([]);
  const [loading, setLoading]         = useState(true);

  const auth = { Authorization: `Bearer ${token}` };

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const [pwRes, prRes] = await Promise.all([
          fetch(`${API}/pathway`, { headers: auth }),
          fetch(`${API}/progress`, { headers: auth }),
        ]);
        if (pwRes.ok) setPathways(await pwRes.json());
        if (prRes.ok) {
          const pd = await prRes.json();
          setAllProgress(pd.summary || []);
        }
      } catch {
        // silently fail — user may have no data yet
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  // ── Aggregate stats ────────────────────────────────────────────
  const totalModulesDone = allProgress.reduce(
    (acc, p) => acc + (p.completedModules || 0), 0
  );
  const totalBadges = allProgress.reduce(
    (acc, p) => acc + (p.badgesEarned || 0), 0
  );
  const avgCompletion =
    allProgress.length > 0
      ? Math.round(
          allProgress.reduce((acc, p) => acc + p.completionRate, 0) /
            allProgress.length
        )
      : 0;

  return (
    <div style={layout.page}>
      <Sidebar
        user={user}
        active="dashboard"
        onNavigate={onNavigate}
        onLogout={onLogout}
      />

      <PageShell>
        <PageHeader
          title={`Welcome back, ${user?.name?.split(" ")[0]} 👋`}
          subtitle="Here's where your learning stands today."
        />

        {/* ── Stats row ── */}
        <div style={layout.statsRow}>
          <StatCard icon="📚" label="Pathways"        value={pathways.length}      accent={T.purple500} />
          <StatCard icon="✅" label="Modules Done"    value={totalModulesDone}     accent={T.purple600} />
          <StatCard icon="🏅" label="Badges Earned"  value={totalBadges}          accent={T.purple700} />
          <StatCard icon="📈" label="Avg Completion" value={`${avgCompletion}%`}  accent={T.purple500} />
        </div>

        {/* ── Quick actions ── */}
        <div style={layout.actionsRow}>
          <ActionCard
            icon="✎"
            title="Take Assessment"
            body="Answer a few questions and let AI build your personalised learning pathway."
            btnLabel="Start Assessment"
            onClick={() => onNavigate("assessment")}
          />
          <ActionCard
            icon="◈"
            title="My Pathways"
            body="View your AI-generated learning pathways and track your progress."
            btnLabel="View Pathways"
            onClick={() => onNavigate("pathways")}
          />
          <ActionCard
            icon="◎"
            title="My Profile"
            body="Update your learning preferences and review your progress summary."
            btnLabel="View Profile"
            onClick={() => onNavigate("profile")}
          />
        </div>

        {/* ── Recent pathways ── */}
        <div style={{ marginTop: "32px" }}>
          <PageHeader
            title="Recent Pathways"
            subtitle=""
            action={
              pathways.length > 0 && (
                <PrimaryBtn onClick={() => onNavigate("pathways")}>
                  View All
                </PrimaryBtn>
              )
            }
          />

          {loading ? (
            <Spinner />
          ) : pathways.length === 0 ? (
            <EmptyState
              icon="🗺️"
              title="No pathways yet"
              body="Complete an assessment to generate your first personalised STEAM learning pathway."
              action={
                <PrimaryBtn onClick={() => onNavigate("assessment")}>
                  Start Assessment
                </PrimaryBtn>
              }
            />
          ) : (
            <div style={layout.pathwayGrid}>
              {pathways.slice(0, 3).map((p) => {
                const prog = allProgress.find(
                  (pr) => pr.pathwayId?.toString() === p._id?.toString()
                );
                const pct = prog?.completionRate ?? 0;
                const done = prog?.completedModules ?? 0;
                const total = p.modules?.length ?? 0;

                return (
                  <div
                    key={p._id}
                    style={layout.pathwayCard}
                    onClick={() => onNavigate("pathways")}
                  >
                    <div style={layout.pathwayDomain}>
                      {p.assessment?.domain ?? "STEAM"}
                      {p.assessment?.subfield
                        ? " · " +
                          p.assessment.subfield
                            .split("_")
                            .map(
                              (w) => w.charAt(0).toUpperCase() + w.slice(1)
                            )
                            .join(" ")
                        : ""}
                    </div>
                    <h3 style={layout.pathwayTitle}>{p.title}</h3>
                    <p style={layout.pathwaySummary}>{p.summary}</p>
                    <div style={layout.pathwayMeta}>
                      <span style={layout.chip}>{total} modules</span>
                      <span
                        style={{
                          ...layout.chip,
                          backgroundColor:
                            p.status === "completed"
                              ? T.green100
                              : T.purple100,
                          color:
                            p.status === "completed"
                              ? T.green500
                              : T.purple500,
                        }}
                      >
                        {p.status}
                      </span>
                    </div>
                    <ProgressBar pct={pct} showLabel={false} />
                    <p style={layout.progressNote}>
                      {done}/{total} modules · {pct}% complete
                    </p>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </PageShell>
    </div>
  );
}

// ── Sub-components ───────────────────────────────────────────────
function StatCard({ icon, label, value, accent }) {
  return (
    <Card style={{ borderTop: `3px solid ${accent}`, flex: 1 }}>
      <div style={{ fontSize: "22px", marginBottom: "10px" }}>{icon}</div>
      <div style={{ fontSize: "26px", fontWeight: "700", color: accent, marginBottom: "4px" }}>
        {value}
      </div>
      <div style={{ fontSize: "12px", color: T.gray500, fontWeight: "500" }}>
        {label}
      </div>
    </Card>
  );
}

function ActionCard({ icon, title, body, btnLabel, onClick }) {
  return (
    <Card style={{ flex: 1, display: "flex", flexDirection: "column", gap: "10px" }}>
      <div style={{ fontSize: "22px" }}>{icon}</div>
      <div style={{ fontSize: "15px", fontWeight: "700", color: T.purple900 }}>
        {title}
      </div>
      <div style={{ fontSize: "13px", color: T.gray500, lineHeight: "1.5", flex: 1 }}>
        {body}
      </div>
      <PrimaryBtn onClick={onClick} style={{ width: "100%", marginTop: "4px" }}>
        {btnLabel}
      </PrimaryBtn>
    </Card>
  );
}

// ── Styles ───────────────────────────────────────────────────────
const layout = {
  page: {
    display: "flex",
    fontFamily: T.font,
    minHeight: "100vh",
    backgroundColor: T.purple50,
  },
  statsRow: {
    display: "flex",
    gap: "16px",
    marginBottom: "24px",
    flexWrap: "wrap",
  },
  actionsRow: {
    display: "flex",
    gap: "16px",
    marginBottom: "8px",
    flexWrap: "wrap",
  },
  pathwayGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
    gap: "16px",
  },
  pathwayCard: {
    backgroundColor: T.white,
    border: T.cardBorder,
    borderRadius: T.radius,
    padding: "20px",
    cursor: "pointer",
    boxShadow: T.cardShadow,
  },
  pathwayDomain: {
    fontSize: "11px",
    fontWeight: "700",
    color: T.purple500,
    textTransform: "uppercase",
    letterSpacing: "0.5px",
    marginBottom: "8px",
  },
  pathwayTitle: {
    fontSize: "15px",
    fontWeight: "700",
    color: T.purple900,
    margin: "0 0 6px 0",
  },
  pathwaySummary: {
    fontSize: "13px",
    color: T.gray500,
    lineHeight: "1.5",
    margin: "0 0 12px 0",
  },
  pathwayMeta: {
    display: "flex",
    gap: "8px",
    marginBottom: "10px",
  },
  chip: {
    backgroundColor: T.purple100,
    color: T.purple600,
    borderRadius: "999px",
    padding: "3px 10px",
    fontSize: "12px",
    fontWeight: "600",
  },
  progressNote: {
    fontSize: "11px",
    color: T.gray500,
    marginTop: "4px",
  },
};