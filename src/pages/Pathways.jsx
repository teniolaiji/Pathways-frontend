import { useState, useEffect } from "react";
import {
  Sidebar,
  PageShell,
  PageHeader,
  Card,
  PrimaryBtn,
  ProgressBar,
  EmptyState,
  Spinner,
  ErrorBanner,
  T,
} from "../components/Shared";

import API from "../config";

export default function Pathways({
  user,
  token,
  onNavigate,
  onLogout,
  initialState,
}) {
  const [pathways, setPathways] = useState([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [genError, setGenError] = useState("");
  const [activePathway, setActivePathway] = useState(null);
  const [progress, setProgress] = useState(null);
  const [completingModule, setCompletingModule] = useState(null);
  const [view, setView] = useState("list"); // "list" | "detail"

  const auth = { Authorization: `Bearer ${token}` };

  useEffect(() => {
    fetchPathways();
    // If we arrived here right after an assessment, auto-generate
    if (initialState?.generateFrom) {
      generatePathway(initialState.generateFrom);
    }
  }, []);

  const fetchPathways = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API}/pathway`, { headers: auth });
      const data = await res.json();
      if (res.ok) setPathways(data);
    } finally {
      setLoading(false);
    }
  };

  const generatePathway = async (assessmentId) => {
    setGenerating(true);
    setGenError("");
    try {
      const res = await fetch(`${API}/pathway/generate/${assessmentId}`, {
        method: "POST",
        headers: auth,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Generation failed.");
      await fetchPathways();
    } catch (err) {
      setGenError(err.message);
    } finally {
      setGenerating(false);
    }
  };

  const openPathway = async (pathway) => {
    setActivePathway(pathway);
    setView("detail");
    try {
      const res = await fetch(`${API}/progress/${pathway._id}`, {
        headers: auth,
      });
      const data = await res.json();
      setProgress(res.ok ? data : null);
    } catch {
      setProgress(null);
    }
  };

  const markComplete = async (pathwayId, moduleId) => {
    setCompletingModule(moduleId);
    try {
      const res = await fetch(
        `${API}/progress/complete/${pathwayId}/${moduleId}`,
        {
          method: "POST",
          headers: { ...auth, "Content-Type": "application/json" },
          body: JSON.stringify({}),
        },
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      setProgress(data.progress);

      // Refresh pathway so module shows as complete
      const pRes = await fetch(`${API}/pathway/${pathwayId}`, {
        headers: auth,
      });
      if (pRes.ok) setActivePathway(await pRes.json());
      fetchPathways();

      if (data.newBadges?.length > 0) {
        alert(
          `🏅 Badge unlocked: ${data.newBadges.map((b) => b.title).join(", ")}`,
        );
      }
    } catch (err) {
      alert(err.message);
    } finally {
      setCompletingModule(null);
    }
  };

  const isCompleted = (moduleId) =>
    progress?.completedModules?.some(
      (cm) => cm.moduleId === moduleId || cm.moduleId?._id === moduleId,
    ) || false;

  // ── LIST VIEW ──────────────────────────────────────────────────
  if (view === "list") {
    return (
      <div style={layout.page}>
        <Sidebar
          user={user}
          active="pathways"
          onNavigate={onNavigate}
          onLogout={onLogout}
        />
        <PageShell>
          <PageHeader
            title="My Pathways"
            subtitle="Your personalised AI-generated learning journeys."
            action={
              <PrimaryBtn onClick={() => onNavigate("assessment")}>
                + New Assessment
              </PrimaryBtn>
            }
          />

          {genError && <ErrorBanner message={genError} />}

          {generating && (
            <Card
              style={{
                marginBottom: "20px",
                display: "flex",
                alignItems: "center",
                gap: "14px",
              }}
            >
              <div style={s.genSpinner} />
              <div>
                <div
                  style={{
                    fontWeight: "600",
                    color: T.purple900,
                    fontSize: "14px",
                  }}
                >
                  Generating your pathway with Gemini AI…
                </div>
                <div
                  style={{
                    fontSize: "12px",
                    color: T.gray500,
                    marginTop: "3px",
                  }}
                >
                  This usually takes 10–20 seconds. Please wait.
                </div>
              </div>
            </Card>
          )}

          {loading ? (
            <Spinner />
          ) : pathways.length === 0 ? (
            <EmptyState
              icon="🗺️"
              title="No pathways yet"
              body="Complete an assessment and we'll use Gemini AI to build a personalised learning pathway for you."
              action={
                <PrimaryBtn onClick={() => onNavigate("assessment")}>
                  Start Assessment
                </PrimaryBtn>
              }
            />
          ) : (
            <div style={s.grid}>
              {pathways.map((p) => (
                <PathwayCard
                  key={p._id}
                  pathway={p}
                  onClick={() => openPathway(p)}
                />
              ))}
            </div>
          )}
        </PageShell>
      </div>
    );
  }

  // ── DETAIL VIEW ────────────────────────────────────────────────
  const completionRate = progress?.completionRate ?? 0;
  const completedCount = progress?.completedModules?.length ?? 0;
  const totalModules = activePathway?.modules?.length ?? 0;

  return (
    <div style={layout.page}>
      <Sidebar
        user={user}
        active="pathways"
        onNavigate={onNavigate}
        onLogout={onLogout}
      />
      <PageShell>
        {/* Back */}
        <button
          style={s.backBtn}
          onClick={() => {
            setView("list");
            setActivePathway(null);
            setProgress(null);
          }}
        >
          ← Back to Pathways
        </button>

        <PageHeader
          title={activePathway?.title}
          subtitle={activePathway?.summary}
        />

        {/* Progress card */}
        <Card style={{ marginBottom: "20px" }}>
          <div style={s.progressHeader}>
            <div>
              <div style={s.progressTitle}>Overall Progress</div>
              <div style={s.progressSub}>
                {completedCount} of {totalModules} modules completed
              </div>
            </div>
            <div style={s.progressPct}>{completionRate}%</div>
          </div>
          <ProgressBar pct={completionRate} showLabel={false} />

          {progress?.earnedBadges?.length > 0 && (
            <div style={s.badgeRow}>
              {progress.earnedBadges.map((b, i) => (
                <div key={i} style={s.badgePill} title={b.description}>
                  🏅 {b.title}
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* AI reasoning */}
        {activePathway?.aiExplanation && (
          <Card style={{ marginBottom: "24px", backgroundColor: T.purple50 }}>
            <div style={s.aiLabel}>✨ Why this pathway was built for you</div>
            <p style={s.aiText}>{activePathway.aiExplanation}</p>
          </Card>
        )}

        {/* Modules */}
        <h2 style={s.sectionTitle}>Learning Modules</h2>
        <div style={s.moduleList}>
          {activePathway?.modules?.map((mod, idx) => (
            <ModuleCard
              key={mod._id}
              module={mod}
              index={idx + 1}
              completed={isCompleted(mod._id)}
              completing={completingModule === mod._id}
              onComplete={() => markComplete(activePathway._id, mod._id)}
            />
          ))}
        </div>
      </PageShell>
    </div>
  );
}

// ── Pathway card (list view) ─────────────────────────────────────
function PathwayCard({ pathway, onClick }) {
  const total = pathway.modules?.length ?? 0;
  const done = pathway.modules?.filter((m) => m.isCompleted).length ?? 0;
  const pct = total > 0 ? Math.round((done / total) * 100) : 0;

  return (
    <div style={s.pathwayCard} onClick={onClick}>
      <div style={s.pathwayDomain}>
        {pathway.assessment?.domain ?? "STEAM"} ·{" "}
        {pathway.assessment?.subfield
          ? pathway.assessment.subfield
              .split("_")
              .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
              .join(" ")
          : ""}
      </div>
      <h3 style={s.pathwayTitle}>{pathway.title}</h3>
      <p style={s.pathwaySummary}>{pathway.summary}</p>
      <div style={s.pathwayMeta}>
        <span style={s.metaChip}>{total} modules</span>
        <span
          style={{
            ...s.metaChip,
            backgroundColor: statusColor(pathway.status) + "20",
            color: statusColor(pathway.status),
          }}
        >
          {pathway.status}
        </span>
      </div>
      <ProgressBar pct={pct} />
    </div>
  );
}

// ── Module accordion card ────────────────────────────────────────
function ModuleCard({ module, index, completed, completing, onComplete }) {
  const [open, setOpen] = useState(false);

  const diffColor = {
    beginner: T.green500,
    intermediate: T.amber500,
    advanced: T.red500,
  };

  return (
    <div
      style={{
        ...s.moduleCard,
        borderLeft: `4px solid ${completed ? T.green500 : T.purple500}`,
      }}
    >
      <div style={s.moduleHeader} onClick={() => setOpen(!open)}>
        <div style={s.moduleLeft}>
          <div
            style={{
              ...s.moduleNum,
              backgroundColor: completed ? T.green500 : T.purple500,
            }}
          >
            {completed ? "✓" : index}
          </div>
          <div>
            <div style={s.moduleTitle}>{module.title}</div>
            <div style={s.moduleMeta}>
              <span
                style={{
                  color: diffColor[module.difficulty] ?? T.gray500,
                  fontWeight: 600,
                }}
              >
                {module.difficulty}
              </span>
              {" · "}
              {module.estimatedHours}h{" · "}
              <span style={{ color: T.purple500 }}>
                {module.domain
                  ?.split("_")
                  .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
                  .join(" ")}
              </span>
            </div>
          </div>
        </div>
        <span style={s.chevron}>{open ? "▲" : "▼"}</span>
      </div>

      {open && (
        <div style={s.moduleBody}>
          <p style={s.moduleDesc}>{module.description}</p>

          {module.reason && (
            <div style={s.reasonBox}>
              <strong style={{ color: T.purple600 }}>Why this module: </strong>
              {module.reason}
            </div>
          )}

          {module.resources?.length > 0 && (
            <div style={s.resourcesSection}>
              <div style={s.resourcesTitle}>Resources</div>
              {module.resources.map((r, i) => (
                <a
                  key={i}
                  href={r.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={s.resource}
                >
                  <div>
                    <div style={s.resourceName}>{r.title}</div>
                    <div style={s.resourceMeta}>
                      {r.source} · {r.format} ·{" "}
                      <span
                        style={{
                          color: r.isFree ? T.green500 : T.amber500,
                          fontWeight: 600,
                        }}
                      >
                        {r.isFree ? "Free" : "Paid"}
                      </span>
                      {r.isValidated === false && (
                        <span style={{ color: T.red500, marginLeft: "8px" }}>
                          ⚠ Flagged
                        </span>
                      )}
                    </div>
                  </div>
                  <span style={s.resourceArrow}>↗</span>
                </a>
              ))}
            </div>
          )}

          {!completed ? (
            <button
              style={{ ...s.completeBtn, opacity: completing ? 0.7 : 1 }}
              onClick={onComplete}
              disabled={completing}
            >
              {completing ? "Saving…" : "✓ Mark as Complete"}
            </button>
          ) : (
            <div style={s.completedTag}>✓ Module Completed</div>
          )}
        </div>
      )}
    </div>
  );
}

// ── Helpers ──────────────────────────────────────────────────────
const statusColor = (s) =>
  ({ active: T.purple500, completed: T.green500, archived: T.gray500 })[s] ??
  T.gray500;

// ── Layout ───────────────────────────────────────────────────────
const layout = {
  page: {
    display: "flex",
    fontFamily: T.font,
    minHeight: "100vh",
    backgroundColor: T.purple50,
  },
};

const s = {
  backBtn: {
    background: "none",
    border: "none",
    color: T.purple500,
    fontWeight: "600",
    fontSize: "13px",
    cursor: "pointer",
    padding: "0 0 16px 0",
    display: "block",
    fontFamily: T.font,
  },
  genSpinner: {
    width: "28px",
    height: "28px",
    border: `3px solid ${T.purple100}`,
    borderTop: `3px solid ${T.purple500}`,
    borderRadius: "50%",
    flexShrink: 0,
    animation: "spin 0.75s linear infinite",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
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
    margin: "0 0 14px 0",
  },
  pathwayMeta: {
    display: "flex",
    gap: "8px",
    marginBottom: "12px",
  },
  metaChip: {
    backgroundColor: T.purple100,
    color: T.purple600,
    borderRadius: "999px",
    padding: "3px 10px",
    fontSize: "12px",
    fontWeight: "600",
  },
  progressHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: "12px",
  },
  progressTitle: {
    fontSize: "14px",
    fontWeight: "600",
    color: T.purple900,
    marginBottom: "2px",
  },
  progressSub: { fontSize: "12px", color: T.gray500 },
  progressPct: {
    fontSize: "22px",
    fontWeight: "700",
    color: T.purple500,
  },
  badgeRow: {
    display: "flex",
    flexWrap: "wrap",
    gap: "8px",
    marginTop: "14px",
  },
  badgePill: {
    backgroundColor: T.purple100,
    color: T.purple600,
    borderRadius: "999px",
    padding: "4px 12px",
    fontSize: "12px",
    fontWeight: "600",
  },
  aiLabel: {
    fontSize: "11px",
    fontWeight: "700",
    color: T.purple500,
    textTransform: "uppercase",
    letterSpacing: "0.5px",
    marginBottom: "8px",
  },
  aiText: {
    fontSize: "14px",
    color: T.gray700,
    lineHeight: "1.65",
    margin: 0,
  },
  sectionTitle: {
    fontSize: "16px",
    fontWeight: "700",
    color: T.purple900,
    margin: "0 0 14px 0",
  },
  moduleList: { display: "flex", flexDirection: "column", gap: "10px" },
  moduleCard: {
    backgroundColor: T.white,
    border: T.cardBorder,
    borderRadius: T.radiusSm,
    overflow: "hidden",
    boxShadow: T.cardShadow,
  },
  moduleHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "14px 18px",
    cursor: "pointer",
  },
  moduleLeft: {
    display: "flex",
    alignItems: "flex-start",
    gap: "12px",
  },
  moduleNum: {
    width: "26px",
    height: "26px",
    borderRadius: "50%",
    color: T.white,
    fontWeight: "700",
    fontSize: "12px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
    marginTop: "1px",
  },
  moduleTitle: {
    fontSize: "14px",
    fontWeight: "600",
    color: T.purple900,
    marginBottom: "3px",
  },
  moduleMeta: { fontSize: "12px", color: T.gray500 },
  chevron: { fontSize: "10px", color: T.gray500 },
  moduleBody: { padding: "0 18px 18px 56px" },
  moduleDesc: {
    fontSize: "13px",
    color: T.gray700,
    lineHeight: "1.6",
    marginBottom: "12px",
  },
  reasonBox: {
    backgroundColor: T.purple50,
    border: T.cardBorder,
    borderRadius: T.radiusSm,
    padding: "10px 14px",
    fontSize: "13px",
    color: T.gray700,
    lineHeight: "1.5",
    marginBottom: "14px",
  },
  resourcesSection: { marginBottom: "16px" },
  resourcesTitle: {
    fontSize: "11px",
    fontWeight: "700",
    color: T.gray700,
    textTransform: "uppercase",
    letterSpacing: "0.5px",
    marginBottom: "8px",
  },
  resource: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "10px 14px",
    backgroundColor: T.gray50,
    border: `1px solid ${T.gray200}`,
    borderRadius: T.radiusSm,
    marginBottom: "6px",
    textDecoration: "none",
    color: "inherit",
  },
  resourceName: {
    fontSize: "13px",
    fontWeight: "600",
    color: T.purple900,
    marginBottom: "2px",
  },
  resourceMeta: { fontSize: "11px", color: T.gray500 },
  resourceArrow: { color: T.purple500, fontSize: "14px", fontWeight: "700" },
  completeBtn: {
    padding: "9px 20px",
    backgroundColor: T.purple500,
    color: T.white,
    border: "none",
    borderRadius: T.radiusSm,
    fontSize: "13px",
    fontWeight: "600",
    cursor: "pointer",
    fontFamily: T.font,
  },
  completedTag: {
    display: "inline-block",
    backgroundColor: T.green100,
    color: T.green500,
    borderRadius: "999px",
    padding: "5px 14px",
    fontSize: "12px",
    fontWeight: "700",
  },
};
