import { useState, useEffect } from "react";
import {
  Sidebar, PageShell, PageHeader,
  Card, PrimaryBtn, ErrorBanner, Spinner, T,
} from "../components/shared";

import API from "../config";

const STEPS = ["Domain & Subfield", "Skill & Goals", "Constraints", "Review"];

export default function Assessment({ user, token, onNavigate, onLogout }) {
  const [step, setStep] = useState(0);
  const [subfields, setSubfields] = useState({});
  const [loadingSubfields, setLoadingSubfields] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(null); // holds { assessmentId } on success

  const [form, setForm] = useState({
    domain: "",
    subfield: "",
    skillLevel: "",
    goals: "",
    timeAvailability: "2_to_5hrs",
    internetAccess: "moderate",
    learningPace: "moderate",
    preferredLanguage: "English",
  });

  const authHeader = { Authorization: `Bearer ${token}` };

  // Load domain → subfield map from the backend
  useEffect(() => {
    fetch(`${API}/assessment/subfields`)
      .then((r) => r.json())
      .then((data) => setSubfields(data))
      .catch(() => setError("Could not load domain options. Is the server running?"))
      .finally(() => setLoadingSubfields(false));
  }, []);

  const set = (field, value) => {
    setForm((prev) => {
      const updated = { ...prev, [field]: value };
      // Reset subfield when domain changes
      if (field === "domain") updated.subfield = "";
      return updated;
    });
  };

  const canProceed = () => {
    if (step === 0) return form.domain && form.subfield;
    if (step === 1) return form.skillLevel && form.goals.trim().length > 10;
    if (step === 2) return true;
    return true;
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    setError("");
    try {
      const res = await fetch(`${API}/assessment`, {
        method: "POST",
        headers: { ...authHeader, "Content-Type": "application/json" },
        body: JSON.stringify({
          skillLevel: form.skillLevel,
          domain: form.domain,
          subfield: form.subfield,
          goals: form.goals,
          constraints: {
            timeAvailability: form.timeAvailability,
            internetAccess: form.internetAccess,
            learningPace: form.learningPace,
            preferredLanguage: form.preferredLanguage,
          },
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Submission failed.");
      setDone({ assessmentId: data.assessmentId });
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  // ── Success screen ───────────────────────────────────────────
  if (done) {
    return (
      <div style={layout.page}>
        <Sidebar user={user} active="assessment" onNavigate={onNavigate} onLogout={onLogout} />
        <PageShell>
          <div style={layout.centred}>
            <Card style={{ maxWidth: "480px", textAlign: "center", padding: "48px 40px" }}>
              <div style={s.successIcon}>✓</div>
              <h2 style={s.successTitle}>Assessment submitted!</h2>
              <p style={s.successBody}>
                Your profile has been saved. Now generate your personalised
                AI learning pathway.
              </p>
              <div style={{ display: "flex", gap: "12px", justifyContent: "center", marginTop: "28px" }}>
                <PrimaryBtn onClick={() => onNavigate("pathways", { generateFrom: done.assessmentId })}>
                  Generate My Pathway →
                </PrimaryBtn>
                <button style={s.ghostBtn} onClick={() => onNavigate("dashboard")}>
                  Go to Dashboard
                </button>
              </div>
            </Card>
          </div>
        </PageShell>
      </div>
    );
  }

  return (
    <div style={layout.page}>
      <Sidebar user={user} active="assessment" onNavigate={onNavigate} onLogout={onLogout} />
      <PageShell>
        <PageHeader
          title="Learning Assessment"
          subtitle="Tell us about yourself so we can build a pathway just for you."
        />

        {/* Step indicators */}
        <div style={s.stepper}>
          {STEPS.map((label, i) => (
            <div key={i} style={s.stepWrap}>
              <div
                style={{
                  ...s.stepDot,
                  backgroundColor: i <= step ? T.purple500 : T.purple100,
                  color: i <= step ? T.white : T.purple400,
                }}
              >
                {i < step ? "✓" : i + 1}
              </div>
              <span
                style={{
                  ...s.stepLabel,
                  color: i === step ? T.purple900 : T.gray500,
                  fontWeight: i === step ? "600" : "400",
                }}
              >
                {label}
              </span>
              {i < STEPS.length - 1 && <div style={s.stepLine} />}
            </div>
          ))}
        </div>

        <Card style={{ maxWidth: "580px" }}>
          <ErrorBanner message={error} />

          {loadingSubfields ? (
            <Spinner />
          ) : (
            <>
              {/* ── STEP 0: Domain & Subfield ── */}
              {step === 0 && (
                <div style={s.stepContent}>
                  <h3 style={s.stepTitle}>What do you want to learn?</h3>
                  <p style={s.stepSub}>Choose your STEAM domain, then pick a specific field.</p>

                  <div style={s.field}>
                    <label style={s.label}>Domain</label>
                    <div style={s.optionGrid}>
                      {Object.keys(subfields).map((domain) => (
                        <div
                          key={domain}
                          style={{
                            ...s.optionChip,
                            ...(form.domain === domain ? s.optionChipActive : {}),
                          }}
                          onClick={() => set("domain", domain)}
                        >
                          {domainIcon[domain]} {capitalize(domain)}
                        </div>
                      ))}
                    </div>
                  </div>

                  {form.domain && (
                    <div style={s.field}>
                      <label style={s.label}>
                        Specific field within {capitalize(form.domain)}
                      </label>
                      <div style={s.subfieldGrid}>
                        {subfields[form.domain]?.map((sf) => (
                          <div
                            key={sf}
                            style={{
                              ...s.subfieldChip,
                              ...(form.subfield === sf ? s.subfieldChipActive : {}),
                            }}
                            onClick={() => set("subfield", sf)}
                          >
                            {formatSubfield(sf)}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* ── STEP 1: Skill & Goals ── */}
              {step === 1 && (
                <div style={s.stepContent}>
                  <h3 style={s.stepTitle}>Your current level & goals</h3>
                  <p style={s.stepSub}>This helps us calibrate the depth of your pathway.</p>

                  <div style={s.field}>
                    <label style={s.label}>Current skill level in {formatSubfield(form.subfield)}</label>
                    <div style={s.optionGrid}>
                      {["beginner", "intermediate", "advanced"].map((level) => (
                        <div
                          key={level}
                          style={{
                            ...s.optionChip,
                            ...(form.skillLevel === level ? s.optionChipActive : {}),
                          }}
                          onClick={() => set("skillLevel", level)}
                        >
                          {skillIcon[level]} {capitalize(level)}
                        </div>
                      ))}
                    </div>
                  </div>

                  <div style={s.field}>
                    <label style={s.label}>What do you want to achieve?</label>
                    <textarea
                      style={s.textarea}
                      rows={4}
                      placeholder={`e.g. "I want to build data dashboards and get a job as a data analyst within 6 months"`}
                      value={form.goals}
                      onChange={(e) => set("goals", e.target.value)}
                    />
                    <span style={s.hint}>Be specific — the AI uses this to personalise your pathway.</span>
                  </div>
                </div>
              )}

              {/* ── STEP 2: Constraints ── */}
              {step === 2 && (
                <div style={s.stepContent}>
                  <h3 style={s.stepTitle}>Your learning context</h3>
                  <p style={s.stepSub}>
                    We use this to recommend resources that fit your real-world situation.
                  </p>

                  <SelectField
                    label="Time available per week"
                    value={form.timeAvailability}
                    onChange={(v) => set("timeAvailability", v)}
                    options={[
                      { value: "less_than_2hrs", label: "Less than 2 hours" },
                      { value: "2_to_5hrs",      label: "2 to 5 hours" },
                      { value: "more_than_5hrs", label: "More than 5 hours" },
                    ]}
                  />

                  <SelectField
                    label="Internet access quality"
                    value={form.internetAccess}
                    onChange={(v) => set("internetAccess", v)}
                    options={[
                      { value: "low",      label: "Low — limited or expensive data" },
                      { value: "moderate", label: "Moderate — reliable most of the time" },
                      { value: "high",     label: "High — fast and always available" },
                    ]}
                  />

                  <SelectField
                    label="Learning pace"
                    value={form.learningPace}
                    onChange={(v) => set("learningPace", v)}
                    options={[
                      { value: "slow",     label: "Slow — I like to take my time" },
                      { value: "moderate", label: "Moderate — steady progress" },
                      { value: "fast",     label: "Fast — I want to move quickly" },
                    ]}
                  />

                  <div style={s.field}>
                    <label style={s.label}>Preferred language</label>
                    <input
                      style={s.input}
                      type="text"
                      value={form.preferredLanguage}
                      onChange={(e) => set("preferredLanguage", e.target.value)}
                      placeholder="e.g. English, French, Swahili"
                    />
                  </div>
                </div>
              )}

              {/* ── STEP 3: Review ── */}
              {step === 3 && (
                <div style={s.stepContent}>
                  <h3 style={s.stepTitle}>Review your assessment</h3>
                  <p style={s.stepSub}>Check everything looks right before we generate your pathway.</p>

                  <div style={s.reviewGrid}>
                    <ReviewRow label="Domain"        value={capitalize(form.domain)} />
                    <ReviewRow label="Subfield"      value={formatSubfield(form.subfield)} />
                    <ReviewRow label="Skill Level"   value={capitalize(form.skillLevel)} />
                    <ReviewRow label="Time/week"     value={formatConstraint("timeAvailability", form.timeAvailability)} />
                    <ReviewRow label="Internet"      value={capitalize(form.internetAccess)} />
                    <ReviewRow label="Pace"          value={capitalize(form.learningPace)} />
                    <ReviewRow label="Language"      value={form.preferredLanguage} />
                  </div>

                  <div style={s.goalsBox}>
                    <div style={s.goalsLabel}>Your goals</div>
                    <p style={s.goalsText}>{form.goals}</p>
                  </div>
                </div>
              )}

              {/* ── Navigation buttons ── */}
              <div style={s.navRow}>
                {step > 0 && (
                  <button style={s.backBtn} onClick={() => setStep((p) => p - 1)}>
                    ← Back
                  </button>
                )}
                <div style={{ flex: 1 }} />
                {step < STEPS.length - 1 ? (
                  <PrimaryBtn
                    onClick={() => setStep((p) => p + 1)}
                    disabled={!canProceed()}
                  >
                    Continue →
                  </PrimaryBtn>
                ) : (
                  <PrimaryBtn
                    onClick={handleSubmit}
                    disabled={submitting}
                  >
                    {submitting ? "Submitting…" : "Submit Assessment"}
                  </PrimaryBtn>
                )}
              </div>
            </>
          )}
        </Card>
      </PageShell>
    </div>
  );
}

// ── Helper sub-components ────────────────────────────────────────
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
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
    </div>
  );
}

function ReviewRow({ label, value }) {
  return (
    <div style={s.reviewRow}>
      <span style={s.reviewLabel}>{label}</span>
      <span style={s.reviewValue}>{value}</span>
    </div>
  );
}

// ── Helpers ──────────────────────────────────────────────────────
const capitalize = (str) => str ? str.charAt(0).toUpperCase() + str.slice(1) : "";
const formatSubfield = (sf) =>
  sf ? sf.split("_").map(capitalize).join(" ") : "";
const formatConstraint = (key, val) => {
  const map = {
    less_than_2hrs: "< 2 hours",
    "2_to_5hrs": "2–5 hours",
    more_than_5hrs: "5+ hours",
  };
  return map[val] || val;
};

const domainIcon = {
  technology: "💻",
  engineering: "⚙️",
  science: "🔬",
  mathematics: "📐",
};
const skillIcon = {
  beginner: "🌱",
  intermediate: "📈",
  advanced: "🚀",
};

// ── Styles ───────────────────────────────────────────────────────
const layout = {
  page: {
    display: "flex",
    fontFamily: T.font,
    minHeight: "100vh",
    backgroundColor: T.purple50,
  },
  centred: {
    display: "flex",
    justifyContent: "center",
    paddingTop: "60px",
  },
};

const s = {
  stepper: {
    display: "flex",
    alignItems: "center",
    marginBottom: "28px",
    gap: "0",
  },
  stepWrap: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
  },
  stepDot: {
    width: "28px",
    height: "28px",
    borderRadius: "50%",
    fontSize: "12px",
    fontWeight: "700",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  stepLabel: {
    fontSize: "13px",
    whiteSpace: "nowrap",
  },
  stepLine: {
    width: "32px",
    height: "2px",
    backgroundColor: T.purple200,
    marginInline: "8px",
  },
  stepContent: {
    marginBottom: "28px",
  },
  stepTitle: {
    fontSize: "17px",
    fontWeight: "700",
    color: T.purple900,
    margin: "0 0 4px 0",
  },
  stepSub: {
    fontSize: "13px",
    color: T.gray500,
    margin: "0 0 24px 0",
  },
  field: {
    marginBottom: "20px",
  },
  label: {
    display: "block",
    fontSize: "13px",
    fontWeight: "600",
    color: T.gray700,
    marginBottom: "8px",
  },
  optionGrid: {
    display: "flex",
    flexWrap: "wrap",
    gap: "8px",
  },
  optionChip: {
    padding: "9px 16px",
    borderRadius: T.radiusSm,
    border: `1.5px solid ${T.gray200}`,
    fontSize: "13px",
    fontWeight: "500",
    color: T.gray700,
    cursor: "pointer",
    backgroundColor: T.white,
    display: "flex",
    alignItems: "center",
    gap: "6px",
  },
  optionChipActive: {
    border: `1.5px solid ${T.purple500}`,
    backgroundColor: T.purple100,
    color: T.purple700,
    fontWeight: "600",
  },
  subfieldGrid: {
    display: "flex",
    flexWrap: "wrap",
    gap: "7px",
  },
  subfieldChip: {
    padding: "7px 14px",
    borderRadius: "999px",
    border: `1.5px solid ${T.gray200}`,
    fontSize: "12px",
    fontWeight: "500",
    color: T.gray700,
    cursor: "pointer",
    backgroundColor: T.white,
  },
  subfieldChipActive: {
    border: `1.5px solid ${T.purple500}`,
    backgroundColor: T.purple500,
    color: T.white,
    fontWeight: "600",
  },
  textarea: {
    width: "100%",
    padding: "10px 14px",
    borderRadius: T.radiusSm,
    border: `1.5px solid ${T.gray200}`,
    fontSize: "14px",
    color: T.purple900,
    resize: "vertical",
    fontFamily: T.font,
    outline: "none",
    boxSizing: "border-box",
    backgroundColor: T.gray50,
    lineHeight: "1.6",
  },
  input: {
    width: "100%",
    padding: "10px 14px",
    borderRadius: T.radiusSm,
    border: `1.5px solid ${T.gray200}`,
    fontSize: "14px",
    color: T.purple900,
    outline: "none",
    boxSizing: "border-box",
    backgroundColor: T.gray50,
    fontFamily: T.font,
  },
  select: {
    width: "100%",
    padding: "10px 14px",
    borderRadius: T.radiusSm,
    border: `1.5px solid ${T.gray200}`,
    fontSize: "14px",
    color: T.purple900,
    outline: "none",
    backgroundColor: T.gray50,
    fontFamily: T.font,
    cursor: "pointer",
  },
  hint: {
    fontSize: "12px",
    color: T.gray500,
    marginTop: "4px",
    display: "block",
  },
  navRow: {
    display: "flex",
    alignItems: "center",
    paddingTop: "16px",
    borderTop: `1px solid ${T.purple100}`,
    marginTop: "8px",
  },
  backBtn: {
    background: "none",
    border: "none",
    color: T.purple500,
    fontSize: "14px",
    fontWeight: "600",
    cursor: "pointer",
    fontFamily: T.font,
    padding: "4px 0",
  },
  reviewGrid: {
    border: T.cardBorder,
    borderRadius: T.radiusSm,
    overflow: "hidden",
    marginBottom: "16px",
  },
  reviewRow: {
    display: "flex",
    justifyContent: "space-between",
    padding: "11px 16px",
    borderBottom: `1px solid ${T.purple100}`,
    fontSize: "14px",
  },
  reviewLabel: {
    color: T.gray500,
    fontWeight: "500",
  },
  reviewValue: {
    color: T.purple900,
    fontWeight: "600",
  },
  goalsBox: {
    backgroundColor: T.purple50,
    border: T.cardBorder,
    borderRadius: T.radiusSm,
    padding: "14px 16px",
  },
  goalsLabel: {
    fontSize: "11px",
    fontWeight: "700",
    color: T.purple500,
    textTransform: "uppercase",
    letterSpacing: "0.5px",
    marginBottom: "6px",
  },
  goalsText: {
    fontSize: "14px",
    color: T.gray700,
    lineHeight: "1.6",
    margin: 0,
  },
  successIcon: {
    width: "56px",
    height: "56px",
    borderRadius: "50%",
    backgroundColor: T.purple100,
    color: T.purple500,
    fontSize: "24px",
    fontWeight: "700",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    margin: "0 auto 20px",
  },
  successTitle: {
    fontSize: "22px",
    fontWeight: "700",
    color: T.purple900,
    margin: "0 0 8px 0",
  },
  successBody: {
    fontSize: "14px",
    color: T.gray500,
    lineHeight: "1.6",
    margin: 0,
  },
  ghostBtn: {
    padding: "10px 22px",
    background: "none",
    border: `1.5px solid ${T.purple500}`,
    color: T.purple500,
    borderRadius: T.radiusSm,
    fontSize: "14px",
    fontWeight: "600",
    cursor: "pointer",
    fontFamily: T.font,
  },
};