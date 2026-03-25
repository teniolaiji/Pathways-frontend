import { useState, useEffect } from "react";
import {
  Sidebar,
  PageShell,
  PageHeader,
  Card,
  PrimaryBtn,
  ErrorBanner,
  SuccessBanner,
  Spinner,
  T,
} from "../components/Shared";

import API from "../config";

export default function Profile({ user, token, onNavigate, onLogout }) {
  const [profile, setProfile] = useState(null);
  const [allProgress, setAllProgress] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [editForm, setEditForm] = useState({
    preferredLanguage: "",
    timeAvailability: "",
    internetAccess: "",
    learningPace: "",
  });

  const auth = { Authorization: `Bearer ${token}` };

  useEffect(() => {
    Promise.all([
      fetch(`${API}/profile`, { headers: auth }).then((r) => r.json()),
      fetch(`${API}/progress`, { headers: auth }).then((r) => r.json()),
    ])
      .then(([profileData, progressData]) => {
        if (profileData && !profileData.message) {
          setProfile(profileData);
          setEditForm({
            preferredLanguage: profileData.preferredLanguage || "English",
            timeAvailability: profileData.timeAvailability || "2_to_5hrs",
            internetAccess: profileData.internetAccess || "moderate",
            learningPace: profileData.learningPace || "moderate",
          });
        }
        if (progressData?.summary) setAllProgress(progressData.summary);
      })
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    setSaving(true);
    setError("");
    setSuccess("");
    try {
      const res = await fetch(`${API}/profile`, {
        method: "PUT",
        headers: { ...auth, "Content-Type": "application/json" },
        body: JSON.stringify(editForm),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Update failed.");
      setProfile(data.profile);
      setSuccess("Profile updated successfully.");
      setEditing(false);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  // Aggregate stats across all pathways
  const totalBadges = allProgress.reduce(
    (acc, p) => acc + (p.badgesEarned || 0),
    0,
  );
  const totalModulesCompleted = allProgress.reduce(
    (acc, p) => acc + (p.completedModules || 0),
    0,
  );
  const avgCompletion =
    allProgress.length > 0
      ? Math.round(
          allProgress.reduce((acc, p) => acc + p.completionRate, 0) /
            allProgress.length,
        )
      : 0;

  return (
    <div style={layout.page}>
      <Sidebar
        user={user}
        active="profile"
        onNavigate={onNavigate}
        onLogout={onLogout}
      />
      <PageShell>
        <PageHeader
          title="My Profile"
          subtitle="Your learning preferences and progress summary."
        />

        {loading ? (
          <Spinner />
        ) : (
          <div style={layout.grid}>
            {/* Left column */}
            <div style={layout.left}>
              {/* Identity card */}
              <Card
                style={{
                  marginBottom: "16px",
                  textAlign: "center",
                  padding: "32px 24px",
                }}
              >
                <div style={s.bigAvatar}>
                  {user?.name?.charAt(0).toUpperCase()}
                </div>
                <div style={s.profileName}>{user?.name}</div>
                <div style={s.profileEmail}>{user?.email}</div>
                {profile?.skillLevel && (
                  <div style={s.skillBadge}>
                    {skillIcon[profile.skillLevel]}{" "}
                    {capitalize(profile.skillLevel)}
                  </div>
                )}
              </Card>

              {/* Stats card */}
              <Card>
                <div style={s.statsTitle}>Learning Stats</div>
                <div style={s.statsGrid}>
                  <StatItem value={allProgress.length} label="Pathways" />
                  <StatItem
                    value={totalModulesCompleted}
                    label="Modules Done"
                  />
                  <StatItem value={totalBadges} label="Badges" />
                  <StatItem
                    value={`${avgCompletion}%`}
                    label="Avg Completion"
                  />
                </div>
              </Card>
            </div>

            {/* Right column */}
            <div style={layout.right}>
              {/* Learning preferences */}
              <Card style={{ marginBottom: "16px" }}>
                <div style={s.cardHeaderRow}>
                  <div style={s.cardTitle}>Learning Preferences</div>
                  {!editing ? (
                    <button style={s.editBtn} onClick={() => setEditing(true)}>
                      Edit
                    </button>
                  ) : (
                    <div style={{ display: "flex", gap: "8px" }}>
                      <button
                        style={s.cancelBtn}
                        onClick={() => setEditing(false)}
                      >
                        Cancel
                      </button>
                      <PrimaryBtn onClick={handleSave} disabled={saving}>
                        {saving ? "Saving…" : "Save"}
                      </PrimaryBtn>
                    </div>
                  )}
                </div>

                <ErrorBanner message={error} />
                <SuccessBanner message={success} />

                {!editing ? (
                  <div style={s.prefGrid}>
                    <PrefRow
                      label="Domains"
                      value={
                        profile?.steamDomains?.map(capitalize).join(", ") || "—"
                      }
                    />
                    <PrefRow
                      label="Skill Level"
                      value={capitalize(profile?.skillLevel) || "—"}
                    />
                    <PrefRow
                      label="Time / week"
                      value={formatTime(profile?.timeAvailability)}
                    />
                    <PrefRow
                      label="Internet"
                      value={capitalize(profile?.internetAccess) || "—"}
                    />
                    <PrefRow
                      label="Pace"
                      value={capitalize(profile?.learningPace) || "—"}
                    />
                    <PrefRow
                      label="Language"
                      value={profile?.preferredLanguage || "—"}
                    />
                  </div>
                ) : (
                  <div>
                    <SelectField
                      label="Time available per week"
                      value={editForm.timeAvailability}
                      onChange={(v) =>
                        setEditForm({ ...editForm, timeAvailability: v })
                      }
                      options={[
                        { value: "less_than_2hrs", label: "Less than 2 hours" },
                        { value: "2_to_5hrs", label: "2 to 5 hours" },
                        { value: "more_than_5hrs", label: "5+ hours" },
                      ]}
                    />
                    <SelectField
                      label="Internet access"
                      value={editForm.internetAccess}
                      onChange={(v) =>
                        setEditForm({ ...editForm, internetAccess: v })
                      }
                      options={[
                        { value: "low", label: "Low" },
                        { value: "moderate", label: "Moderate" },
                        { value: "high", label: "High" },
                      ]}
                    />
                    <SelectField
                      label="Learning pace"
                      value={editForm.learningPace}
                      onChange={(v) =>
                        setEditForm({ ...editForm, learningPace: v })
                      }
                      options={[
                        { value: "slow", label: "Slow" },
                        { value: "moderate", label: "Moderate" },
                        { value: "fast", label: "Fast" },
                      ]}
                    />
                    <div style={s.field}>
                      <label style={s.label}>Preferred Language</label>
                      <input
                        style={s.input}
                        value={editForm.preferredLanguage}
                        onChange={(e) =>
                          setEditForm({
                            ...editForm,
                            preferredLanguage: e.target.value,
                          })
                        }
                      />
                    </div>
                  </div>
                )}
              </Card>

              {/* Goals */}
              {profile?.goals?.length > 0 && (
                <Card style={{ marginBottom: "16px" }}>
                  <div style={s.cardTitle}>Learning Goals</div>
                  <ul style={s.goalsList}>
                    {profile.goals.map((g, i) => (
                      <li key={i} style={s.goalItem}>
                        <span style={s.goalDot} /> {g}
                      </li>
                    ))}
                  </ul>
                </Card>
              )}

              {/* Progress across pathways */}
              {allProgress.length > 0 && (
                <Card>
                  <div style={s.cardTitle}>Pathway Progress</div>
                  {allProgress.map((p, i) => (
                    <div key={i} style={s.progressRow}>
                      <div style={s.progressLabel}>
                        {p.pathwayTitle || "Untitled Pathway"}
                      </div>
                      <div style={s.progressMeta}>
                        {p.completedModules}/{p.totalModules} modules
                      </div>
                      <div style={s.track}>
                        <div
                          style={{ ...s.fill, width: `${p.completionRate}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </Card>
              )}
            </div>
          </div>
        )}
      </PageShell>
    </div>
  );
}

// ── Sub-components ───────────────────────────────────────────────
function StatItem({ value, label }) {
  return (
    <div style={s.statItem}>
      <div style={s.statValue}>{value}</div>
      <div style={s.statLabel}>{label}</div>
    </div>
  );
}

function PrefRow({ label, value }) {
  return (
    <div style={s.prefRow}>
      <span style={s.prefLabel}>{label}</span>
      <span style={s.prefValue}>{value}</span>
    </div>
  );
}

function SelectField({ label, value, onChange, options }) {
  return (
    <div style={s.field}>
      <label style={s.label}>{label}</label>
      <select
        style={s.select}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </div>
  );
}

// ── Helpers ──────────────────────────────────────────────────────
const capitalize = (str) =>
  str ? str.charAt(0).toUpperCase() + str.slice(1) : "";
const formatTime = (val) =>
  ({
    less_than_2hrs: "< 2 hours/week",
    "2_to_5hrs": "2–5 hours/week",
    more_than_5hrs: "5+ hours/week",
  })[val] ??
  val ??
  "—";

const skillIcon = { beginner: "🌱", intermediate: "📈", advanced: "🚀" };

// ── Styles ───────────────────────────────────────────────────────
const layout = {
  page: {
    display: "flex",
    fontFamily: T.font,
    minHeight: "100vh",
    backgroundColor: T.purple50,
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "220px 1fr",
    gap: "20px",
    alignItems: "start",
  },
  left: {},
  right: {},
};

const s = {
  bigAvatar: {
    width: "64px",
    height: "64px",
    borderRadius: "50%",
    backgroundColor: T.purple500,
    color: T.white,
    fontWeight: "700",
    fontSize: "26px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    margin: "0 auto 14px",
  },
  profileName: {
    fontSize: "18px",
    fontWeight: "700",
    color: T.purple900,
    marginBottom: "4px",
  },
  profileEmail: {
    fontSize: "13px",
    color: T.gray500,
    marginBottom: "12px",
  },
  skillBadge: {
    display: "inline-block",
    backgroundColor: T.purple100,
    color: T.purple600,
    borderRadius: "999px",
    padding: "5px 14px",
    fontSize: "12px",
    fontWeight: "600",
  },
  statsTitle: {
    fontSize: "13px",
    fontWeight: "700",
    color: T.gray700,
    marginBottom: "16px",
    textTransform: "uppercase",
    letterSpacing: "0.4px",
  },
  statsGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "12px",
  },
  statItem: {
    backgroundColor: T.purple50,
    borderRadius: T.radiusSm,
    padding: "12px",
    textAlign: "center",
  },
  statValue: {
    fontSize: "22px",
    fontWeight: "700",
    color: T.purple500,
    marginBottom: "3px",
  },
  statLabel: {
    fontSize: "11px",
    color: T.gray500,
    fontWeight: "500",
  },
  cardHeaderRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "16px",
  },
  cardTitle: {
    fontSize: "15px",
    fontWeight: "700",
    color: T.purple900,
    marginBottom: "14px",
  },
  editBtn: {
    background: "none",
    border: `1.5px solid ${T.purple500}`,
    color: T.purple500,
    borderRadius: T.radiusSm,
    padding: "5px 14px",
    fontSize: "13px",
    fontWeight: "600",
    cursor: "pointer",
    fontFamily: T.font,
  },
  cancelBtn: {
    background: "none",
    border: `1.5px solid ${T.gray300}`,
    color: T.gray500,
    borderRadius: T.radiusSm,
    padding: "5px 14px",
    fontSize: "13px",
    fontWeight: "600",
    cursor: "pointer",
    fontFamily: T.font,
  },
  prefGrid: {
    border: T.cardBorder,
    borderRadius: T.radiusSm,
    overflow: "hidden",
  },
  prefRow: {
    display: "flex",
    justifyContent: "space-between",
    padding: "10px 14px",
    borderBottom: `1px solid ${T.purple100}`,
    fontSize: "13px",
  },
  prefLabel: { color: T.gray500 },
  prefValue: { fontWeight: "600", color: T.purple900 },
  field: { marginBottom: "14px" },
  label: {
    display: "block",
    fontSize: "12px",
    fontWeight: "600",
    color: T.gray700,
    marginBottom: "6px",
  },
  input: {
    width: "100%",
    padding: "9px 12px",
    borderRadius: T.radiusSm,
    border: `1.5px solid ${T.gray200}`,
    fontSize: "13px",
    color: T.purple900,
    outline: "none",
    boxSizing: "border-box",
    fontFamily: T.font,
    backgroundColor: T.gray50,
  },
  select: {
    width: "100%",
    padding: "9px 12px",
    borderRadius: T.radiusSm,
    border: `1.5px solid ${T.gray200}`,
    fontSize: "13px",
    color: T.purple900,
    outline: "none",
    backgroundColor: T.gray50,
    fontFamily: T.font,
    cursor: "pointer",
  },
  goalsList: { listStyle: "none", padding: 0, margin: 0 },
  goalItem: {
    display: "flex",
    alignItems: "flex-start",
    gap: "10px",
    fontSize: "13px",
    color: T.gray700,
    lineHeight: "1.5",
    marginBottom: "8px",
  },
  goalDot: {
    display: "inline-block",
    width: "7px",
    height: "7px",
    borderRadius: "50%",
    backgroundColor: T.purple500,
    marginTop: "5px",
    flexShrink: 0,
  },
  progressRow: { marginBottom: "16px" },
  progressLabel: {
    fontSize: "13px",
    fontWeight: "600",
    color: T.purple900,
    marginBottom: "2px",
  },
  progressMeta: {
    fontSize: "11px",
    color: T.gray500,
    marginBottom: "6px",
  },
  track: {
    height: "7px",
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
};
