import { useState, useEffect } from "react";
import {
  Sidebar, PageShell, PageHeader,
  Card, PrimaryBtn, ErrorBanner, Spinner, T,
} from "../components/Shared";
import API from "../config";

const STEPS = ["Domain & Subfield", "Skill & Goals", "Constraints", "Review"];

const GOAL_EXAMPLES = {
  technology: {
    web_development:   "I want to build full-stack web apps and land a junior developer job in 6 months.",
    mobile_development:"I want to build and publish my first Android app within 3 months.",
    data_science:      "I want to learn Python and data analysis to get a data analyst job in 6 months.",
    machine_learning:  "I want to understand ML algorithms and build a portfolio project to transition into AI roles.",
    cybersecurity:     "I want to earn a CompTIA Security+ certification and start a career in cybersecurity.",
    cloud_computing:   "I want to get AWS certified and move into a cloud engineer role within a year.",
    devops:            "I want to learn CI/CD pipelines and containerisation to become a DevOps engineer.",
    ui_ux_design:      "I want to build a design portfolio and get my first freelance UX project.",
    blockchain:        "I want to understand smart contracts and build a simple DApp as a portfolio piece.",
    embedded_systems:  "I want to program microcontrollers and build IoT projects for my engineering career.",
  },
  engineering: {
    software_engineering:   "I want to strengthen my software architecture skills and prepare for senior engineer interviews.",
    electrical_engineering: "I want to design and simulate basic circuits and prepare for a graduate engineering role.",
    mechanical_engineering: "I want to learn CAD modelling and use it in a manufacturing internship.",
    civil_engineering:      "I want to understand structural analysis to excel in my civil engineering studies.",
    chemical_engineering:   "I want to learn process simulation tools used in the petrochemical industry.",
    biomedical_engineering: "I want to understand medical device design principles for a research assistantship.",
    systems_engineering:    "I want to apply systems thinking to manage complex engineering projects.",
  },
  science: {
    biology:               "I want to understand molecular biology deeply enough to pursue a research internship.",
    chemistry:             "I want to strengthen my organic chemistry knowledge for my pharmacy programme.",
    physics:               "I want to build intuition for classical mechanics and electromagnetism for my degree.",
    environmental_science: "I want to understand climate systems and environmental policy for a sustainability career.",
    neuroscience:          "I want to learn the fundamentals of brain function to prepare for a neuroscience MSc.",
    biotechnology:         "I want to understand CRISPR and gene editing techniques for a biotech research role.",
    astronomy:             "I want to learn astrophysics fundamentals and use telescope data for my research project.",
  },
  mathematics: {
    statistics:            "I want to master hypothesis testing and regression to become a data analyst.",
    data_analytics:        "I want to learn Excel, SQL, and Tableau to land a business analyst role in 4 months.",
    applied_mathematics:   "I want to strengthen my mathematical modelling skills for engineering applications.",
    financial_mathematics: "I want to understand quantitative finance and prepare for a fintech graduate programme.",
    operations_research:   "I want to learn optimisation techniques to apply in supply chain management.",
    cryptography:          "I want to understand encryption algorithms and use them in secure software development.",
  },
};

export default function Assessment({ user, token, onNavigate, onLogout }) {
  const [step,            setStep]            = useState(0);
  const [subfields,       setSubfields]       = useState({});
  const [loadingSubfields,setLoadingSubfields] = useState(true);
  const [submitting,      setSubmitting]      = useState(false);
  const [error,           setError]           = useState("");
  const [done,            setDone]            = useState(null);

  const [form, setForm] = useState({
    domain: "", subfield: "", skillLevel: "",
    goals: "", timeAvailability: "2_to_5hrs",
    internetAccess: "moderate", learningPace: "moderate",
    preferredLanguage: "English",
  });

  const auth = { Authorization: `Bearer ${token}` };

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
      if (field === "domain") updated.subfield = "";
      return updated;
    });
  };

  const canProceed = () => {
    if (step === 0) return form.domain && form.subfield;
    if (step === 1) return form.skillLevel && form.goals.trim().length > 10;
    return true;
  };

  const handleSubmit = async () => {
    setSubmitting(true); setError("");
    try {
      const res = await fetch(`${API}/assessment`, {
        method: "POST",
        headers: { ...auth, "Content-Type": "application/json" },
        body: JSON.stringify({
          skillLevel: form.skillLevel,
          domain:     form.domain,
          subfield:   form.subfield,
          goals:      form.goals,
          constraints: {
            timeAvailability:  form.timeAvailability,
            internetAccess:    form.internetAccess,
            learningPace:      form.learningPace,
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

  const goalPlaceholder = form.domain && form.subfield && GOAL_EXAMPLES[form.domain]?.[form.subfield]
    ? GOAL_EXAMPLES[form.domain][form.subfield]
    : `e.g. "I want to build skills in ${formatSubfield(form.subfield || "this field")} and land a job in 6 months."`;

  // ── Success screen ───────────────────────────────────────────
  if (done) {
    return (
      <div style={layout.page}>
        <Sidebar user={user} active="assessment" onNavigate={onNavigate} onLogout={onLogout} />
        <PageShell>
          <div style={layout.centred}>
            <Card style={{ maxWidth:"480px", textAlign:"center", padding:"48px 40px" }}>
              <div style={s.successIcon}>✓</div>
              <h2 style={{ fontSize:"22px", fontWeight:"700", color:T.purple900, margin:"0 0 8px 0" }}>Assessment submitted!</h2>
              <p style={{ fontSize:"14px", color:T.gray500, lineHeight:"1.6", margin:0 }}>
                Your profile has been saved. Now generate your personalised AI learning pathway.
              </p>
              <div style={{ display:"flex", gap:"12px", justifyContent:"center", marginTop:"28px" }}>
                <PrimaryBtn onClick={() => onNavigate("pathways", { generateFrom: done.assessmentId })}>
                  Generate My Pathway →
                </PrimaryBtn>
                <button style={s.ghostBtn} onClick={() => onNavigate("dashboard")}>Dashboard</button>
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
              <div style={{ ...s.stepDot, backgroundColor: i<=step ? T.purple500 : T.purple100, color: i<=step ? T.white : T.purple400 }}>
                {i < step ? "✓" : i+1}
              </div>
              <span style={{ ...s.stepLabel, color: i===step ? T.purple900 : T.gray500, fontWeight: i===step ? "600" : "400" }}>
                {label}
              </span>
              {i < STEPS.length - 1 && <div style={s.stepLine} />}
            </div>
          ))}
        </div>

        <Card style={{ maxWidth:"600px" }}>
          <ErrorBanner message={error} />

          {loadingSubfields ? <Spinner /> : (
            <>
              {/* STEP 0 — Domain & Subfield */}
              {step === 0 && (
                <div style={s.stepContent}>
                  <h3 style={s.stepTitle}>What do you want to learn?</h3>
                  <p style={s.stepSub}>Choose your STEAM domain, then pick a specific field.</p>

                  <div style={s.field}>
                    <label style={s.label}>Domain</label>
                    <div style={s.optionGrid}>
                      {Object.keys(subfields).map((domain) => (
                        <div key={domain}
                          style={{ ...s.optionChip, ...(form.domain===domain ? s.optionChipActive : {}) }}
                          onClick={() => set("domain", domain)}>
                          {domainIcon[domain]} {capitalize(domain)}
                        </div>
                      ))}
                    </div>
                  </div>

                  {form.domain && (
                    <div style={s.field}>
                      <label style={s.label}>Specific field within {capitalize(form.domain)}</label>
                      <div style={s.subfieldGrid}>
                        {subfields[form.domain]?.map((sf) => (
                          <div key={sf}
                            style={{ ...s.subfieldChip, ...(form.subfield===sf ? s.subfieldChipActive : {}) }}
                            onClick={() => set("subfield", sf)}>
                            {formatSubfield(sf)}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* STEP 1 — Skill & Goals */}
              {step === 1 && (
                <div style={s.stepContent}>
                  <h3 style={s.stepTitle}>Your level and goals</h3>
                  <p style={s.stepSub}>This helps us calibrate the depth of your pathway.</p>

                  <div style={s.field}>
                    <label style={s.label}>Current skill level in {formatSubfield(form.subfield)}</label>
                    <div style={s.optionGrid}>
                      {["beginner","intermediate","advanced"].map((level) => (
                        <div key={level}
                          style={{ ...s.optionChip, ...(form.skillLevel===level ? s.optionChipActive : {}) }}
                          onClick={() => set("skillLevel", level)}>
                          {skillIcon[level]} {capitalize(level)}
                        </div>
                      ))}
                    </div>
                  </div>

                  <div style={s.field}>
                    <label style={s.label}>What do you want to achieve?</label>
                    <textarea
                      style={s.textarea} rows={4}
                      placeholder={goalPlaceholder}
                      value={form.goals}
                      onChange={(e) => set("goals", e.target.value)}
                    />
                    <span style={{ fontSize:"12px", color:T.gray500, marginTop:"4px", display:"block" }}>
                      Be specific — the AI uses this to personalise your pathway.
                    </span>
                    {/* Example prompt */}
                    {form.domain && form.subfield && GOAL_EXAMPLES[form.domain]?.[form.subfield] && !form.goals && (
                      <div style={s.exampleBox}>
                        <span style={{ color:T.purple600, fontWeight:"600", fontSize:"11px" }}>EXAMPLE: </span>
                        <span style={{ fontSize:"12px", color:T.gray500 }}>
                          {GOAL_EXAMPLES[form.domain][form.subfield]}
                        </span>
                        <button
                          style={s.useExampleBtn}
                          onClick={() => set("goals", GOAL_EXAMPLES[form.domain][form.subfield])}
                        >
                          Use this example
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* STEP 2 — Constraints */}
              {step === 2 && (
                <div style={s.stepContent}>
                  <h3 style={s.stepTitle}>Your learning context</h3>
                  <p style={s.stepSub}>We use this to recommend resources that fit your real situation.</p>

                  {[
                    { label: "Time available per week", field: "timeAvailability",
                      options: [["less_than_2hrs","Less than 2 hours"],["2_to_5hrs","2 to 5 hours"],["more_than_5hrs","More than 5 hours"]] },
                    { label: "Internet access quality", field: "internetAccess",
                      options: [["low","Low — limited or expensive data"],["moderate","Moderate — reliable most of the time"],["high","High — fast and always available"]] },
                    { label: "Learning pace", field: "learningPace",
                      options: [["slow","Slow — I like to take my time"],["moderate","Moderate — steady progress"],["fast","Fast — I want to move quickly"]] },
                  ].map(({ label, field, options }) => (
                    <div key={field} style={s.field}>
                      <label style={s.label}>{label}</label>
                      <select style={s.select} value={form[field]} onChange={(e) => set(field, e.target.value)}>
                        {options.map(([v,l]) => <option key={v} value={v}>{l}</option>)}
                      </select>
                    </div>
                  ))}

                  <div style={s.field}>
                    <label style={s.label}>Preferred language</label>
                    <input style={s.input} type="text" value={form.preferredLanguage}
                      onChange={(e) => set("preferredLanguage", e.target.value)}
                      placeholder="e.g. English, French, Swahili" />
                  </div>
                </div>
              )}

              {/* STEP 3 — Review */}
              {step === 3 && (
                <div style={s.stepContent}>
                  <h3 style={s.stepTitle}>Review your assessment</h3>
                  <p style={s.stepSub}>Check everything looks right before generating your pathway.</p>

                  <div style={{ border:T.cardBorder, borderRadius:T.radiusSm, overflow:"hidden", marginBottom:"16px" }}>
                    {[
                      ["Domain",      capitalize(form.domain)],
                      ["Subfield",    formatSubfield(form.subfield)],
                      ["Skill Level", capitalize(form.skillLevel)],
                      ["Time/week",   formatTime(form.timeAvailability)],
                      ["Internet",    capitalize(form.internetAccess)],
                      ["Pace",        capitalize(form.learningPace)],
                      ["Language",    form.preferredLanguage],
                    ].map(([label, value]) => (
                      <div key={label} style={{ display:"flex", justifyContent:"space-between", padding:"10px 14px", borderBottom:`1px solid ${T.purple100}`, fontSize:"13px" }}>
                        <span style={{ color:T.gray500 }}>{label}</span>
                        <span style={{ fontWeight:"600", color:T.purple900 }}>{value}</span>
                      </div>
                    ))}
                  </div>

                  <div style={{ backgroundColor:T.purple50, border:T.cardBorder, borderRadius:T.radiusSm, padding:"14px 16px" }}>
                    <div style={{ fontSize:"11px", fontWeight:"700", color:T.purple500, textTransform:"uppercase", letterSpacing:"0.5px", marginBottom:"6px" }}>Your Goals</div>
                    <p style={{ fontSize:"14px", color:T.gray700, lineHeight:"1.6", margin:0 }}>{form.goals}</p>
                  </div>
                </div>
              )}

              {/* Navigation */}
              <div style={s.navRow}>
                {step > 0 && (
                  <button style={s.backBtn} onClick={() => setStep((p) => p-1)}>← Back</button>
                )}
                <div style={{ flex:1 }} />
                {step < STEPS.length - 1 ? (
                  <PrimaryBtn onClick={() => setStep((p) => p+1)} disabled={!canProceed()}>
                    Continue →
                  </PrimaryBtn>
                ) : (
                  <PrimaryBtn onClick={handleSubmit} disabled={submitting}>
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

const capitalize    = (s) => s ? s.charAt(0).toUpperCase()+s.slice(1) : "";
const formatSubfield = (sf) => sf ? sf.split("_").map(capitalize).join(" ") : "";
const formatTime    = (v) => ({ less_than_2hrs:"< 2 hours/week","2_to_5hrs":"2–5 hours/week", more_than_5hrs:"5+ hours/week" }[v] ?? v ?? "—");
const domainIcon    = { technology:"💻", engineering:"⚙️", science:"🔬", mathematics:"📐" };
const skillIcon     = { beginner:"🌱", intermediate:"📈", advanced:"🚀" };

const layout = {
  page:    { display:"flex", fontFamily:T.font, minHeight:"100vh", backgroundColor:T.purple50 },
  centred: { display:"flex", justifyContent:"center", paddingTop:"60px" },
};

const s = {
  stepper:  { display:"flex", alignItems:"center", marginBottom:"28px" },
  stepWrap: { display:"flex", alignItems:"center", gap:"8px" },
  stepDot:  { width:"28px", height:"28px", borderRadius:"50%", fontSize:"12px", fontWeight:"700", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 },
  stepLabel:{ fontSize:"13px", whiteSpace:"nowrap" },
  stepLine: { width:"32px", height:"2px", backgroundColor:T.purple200, marginInline:"8px" },
  stepContent:{ marginBottom:"28px" },
  stepTitle:{ fontSize:"17px", fontWeight:"700", color:T.purple900, margin:"0 0 4px 0" },
  stepSub:  { fontSize:"13px", color:T.gray500, margin:"0 0 24px 0" },
  field:    { marginBottom:"20px" },
  label:    { display:"block", fontSize:"13px", fontWeight:"600", color:T.gray700, marginBottom:"8px" },
  optionGrid:{ display:"flex", flexWrap:"wrap", gap:"8px" },
  optionChip:{ padding:"9px 16px", borderRadius:T.radiusSm, border:`1.5px solid ${T.gray200}`, fontSize:"13px", fontWeight:"500", color:T.gray700, cursor:"pointer", backgroundColor:T.white, display:"flex", alignItems:"center", gap:"6px" },
  optionChipActive:{ border:`1.5px solid ${T.purple500}`, backgroundColor:T.purple100, color:T.purple700, fontWeight:"600" },
  subfieldGrid:{ display:"flex", flexWrap:"wrap", gap:"7px" },
  subfieldChip:{ padding:"7px 14px", borderRadius:"999px", border:`1.5px solid ${T.gray200}`, fontSize:"12px", fontWeight:"500", color:T.gray700, cursor:"pointer", backgroundColor:T.white },
  subfieldChipActive:{ border:`1.5px solid ${T.purple500}`, backgroundColor:T.purple500, color:T.white, fontWeight:"600" },
  textarea: { width:"100%", padding:"10px 14px", borderRadius:T.radiusSm, border:`1.5px solid ${T.gray200}`, fontSize:"14px", color:T.purple900, resize:"vertical", fontFamily:T.font, outline:"none", boxSizing:"border-box", backgroundColor:T.gray50, lineHeight:"1.6" },
  input:    { width:"100%", padding:"10px 14px", borderRadius:T.radiusSm, border:`1.5px solid ${T.gray200}`, fontSize:"14px", color:T.purple900, outline:"none", boxSizing:"border-box", backgroundColor:T.gray50, fontFamily:T.font },
  select:   { width:"100%", padding:"10px 14px", borderRadius:T.radiusSm, border:`1.5px solid ${T.gray200}`, fontSize:"14px", color:T.purple900, outline:"none", backgroundColor:T.gray50, fontFamily:T.font, cursor:"pointer" },
  navRow:   { display:"flex", alignItems:"center", paddingTop:"16px", borderTop:`1px solid ${T.purple100}`, marginTop:"8px" },
  backBtn:  { background:"none", border:"none", color:T.purple500, fontSize:"14px", fontWeight:"600", cursor:"pointer", fontFamily:T.font, padding:"4px 0" },
  successIcon:{ width:"56px", height:"56px", borderRadius:"50%", backgroundColor:T.purple100, color:T.purple500, fontSize:"24px", fontWeight:"700", display:"flex", alignItems:"center", justifyContent:"center", margin:"0 auto 20px" },
  ghostBtn: { padding:"10px 22px", background:"none", border:`1.5px solid ${T.purple500}`, color:T.purple500, borderRadius:T.radiusSm, fontSize:"14px", fontWeight:"600", cursor:"pointer", fontFamily:T.font },
  exampleBox:{ marginTop:"10px", backgroundColor:T.purple50, border:T.cardBorder, borderRadius:T.radiusSm, padding:"10px 14px" },
  useExampleBtn:{ display:"block", marginTop:"8px", background:"none", border:"none", color:T.purple500, fontSize:"12px", fontWeight:"600", cursor:"pointer", fontFamily:T.font, padding:0 },
};