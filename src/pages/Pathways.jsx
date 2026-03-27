import { useState, useEffect } from "react";
import {
  Sidebar, PageShell, PageHeader,
  Card, PrimaryBtn, ProgressBar,
  EmptyState, Spinner, ErrorBanner, T,
} from "../components/Shared";
import NotificationBell from "../components/NotificationBell";
import API from "../config";

export default function Pathways({ user, token, onNavigate, onLogout, initialState }) {
  const [pathways,         setPathways]         = useState([]);
  const [loading,          setLoading]          = useState(true);
  const [generating,       setGenerating]       = useState(false);
  const [regenerating,     setRegenerating]     = useState(false);
  const [genError,         setGenError]         = useState("");
  const [activePathway,    setActivePathway]    = useState(null);
  const [progress,         setProgress]         = useState(null);
  const [completingModule, setCompletingModule] = useState(null);
  const [view,             setView]             = useState("list");
  const [analytics,        setAnalytics]        = useState(null);
  const [analyticsOpen,    setAnalyticsOpen]    = useState(false);
  const [exportingPDF,     setExportingPDF]     = useState(false);
  const [search,           setSearch]           = useState("");
  const [filterStatus,     setFilterStatus]     = useState("all");
  const [filterDomain,     setFilterDomain]     = useState("all");

  const auth = { Authorization: `Bearer ${token}` };

  useEffect(() => {
    fetchPathways();
    if (initialState?.generateFrom) generatePathway(initialState.generateFrom);
  }, []);

  const fetchPathways = async () => {
    setLoading(true);
    try {
      const res  = await fetch(`${API}/pathway`, { headers: auth });
      const data = await res.json();
      if (res.ok) setPathways(data);
    } finally { setLoading(false); }
  };

  const generatePathway = async (assessmentId) => {
    setGenerating(true); setGenError("");
    try {
      const res  = await fetch(`${API}/pathway/generate/${assessmentId}`, { method: "POST", headers: auth });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Generation failed.");
      await fetchPathways();
    } catch (err) { setGenError(err.message); }
    finally { setGenerating(false); }
  };

  const handleRegenerate = async () => {
    if (!window.confirm("Generate a new pathway from the same assessment? The current one will be archived.")) return;
    setRegenerating(true); setGenError("");
    try {
      const res  = await fetch(`${API}/pathway/${activePathway._id}/regenerate`, { method: "POST", headers: auth });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Regeneration failed.");
      await fetchPathways();
      openPathway(data.pathway);
    } catch (err) { setGenError(err.message); }
    finally { setRegenerating(false); }
  };

  const openPathway = async (pathway) => {
    setActivePathway(pathway); setView("detail");
    setAnalytics(null); setAnalyticsOpen(false);
    try {
      const res  = await fetch(`${API}/progress/${pathway._id}`, { headers: auth });
      const data = await res.json();
      setProgress(res.ok ? data : null);
    } catch { setProgress(null); }
  };

  const loadAnalytics = async () => {
    if (analytics) { setAnalyticsOpen(!analyticsOpen); return; }
    try {
      const res  = await fetch(`${API}/pathway/${activePathway._id}/feedback-analytics`, { headers: auth });
      const data = await res.json();
      if (res.ok) { setAnalytics(data); setAnalyticsOpen(true); }
    } catch { /* silently fail */ }
  };

  const markComplete = async (pathwayId, moduleId, feedback = {}) => {
    setCompletingModule(moduleId);
    try {
      const res  = await fetch(`${API}/progress/complete/${pathwayId}/${moduleId}`, {
        method: "POST",
        headers: { ...auth, "Content-Type": "application/json" },
        body: JSON.stringify({ feedback }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setProgress(data.progress);
      const pRes = await fetch(`${API}/pathway/${pathwayId}`, { headers: auth });
      if (pRes.ok) setActivePathway(await pRes.json());
      fetchPathways();
      if (data.newBadges?.length > 0) alert(`🏅 Badge unlocked: ${data.newBadges.map((b) => b.title).join(", ")}`);
    } catch (err) { alert(err.message); }
    finally { setCompletingModule(null); }
  };

  const exportPDF = () => {
    if (!activePathway) return;
    setExportingPDF(true);
    const moduleHTML = (activePathway.modules || []).map((mod, i) => `
      <div style="margin-bottom:24px;padding:16px;border:1px solid #e5e7eb;border-radius:8px;page-break-inside:avoid">
        <h3 style="color:#1e1b4b;margin:0 0 4px 0;font-size:14px">${i + 1}. ${mod.title}</h3>
        <p style="margin:0 0 8px 0;font-size:12px;color:#6b7280">${mod.difficulty} · ${mod.estimatedHours}h estimated</p>
        <p style="margin:0 0 8px 0;font-size:13px;color:#374151;line-height:1.6">${mod.description}</p>
        ${mod.reason ? `<p style="font-size:12px;color:#7c3aed;background:#f5f3ff;padding:8px;border-radius:6px;margin:0 0 10px 0"><strong>Why:</strong> ${mod.reason}</p>` : ""}
        ${(mod.resources || []).map(r => `
          <div style="margin-bottom:5px;padding:7px 10px;background:#f9fafb;border-radius:5px;font-size:11px">
            <strong>${r.title}</strong> — ${r.source} · ${r.format} · ${r.isFree ? "Free" : "Paid"}<br>
            <span style="color:#6b7280">${r.url}</span>
          </div>`).join("")}
      </div>`).join("");

    const html = `<!DOCTYPE html><html><head><meta charset="utf-8"/><title>${activePathway.title}</title>
      <style>body{font-family:Arial,sans-serif;max-width:780px;margin:0 auto;padding:28px;color:#1e1b4b}
      h1{font-size:20px}h2{font-size:15px;color:#4338ca;border-bottom:2px solid #ede9fe;padding-bottom:6px;margin:24px 0 14px}
      @media print{body{padding:12px}}</style></head><body>
      <div style="background:#ede9fe;padding:18px 22px;border-radius:8px;margin-bottom:20px">
        <div style="font-size:10px;font-weight:700;color:#7c3aed;text-transform:uppercase;letter-spacing:0.5px;margin-bottom:4px">
          Pathways — AI-Assisted STEAM Learning</div>
        <h1 style="margin:0 0 4px">${activePathway.title}</h1>
        <p style="margin:0;font-size:12px;color:#374151">${activePathway.summary || ""}</p></div>
      ${activePathway.aiExplanation ? `<div style="background:#faf5ff;border:1px solid #e9d5ff;border-radius:7px;padding:14px 18px;margin-bottom:18px">
        <div style="font-size:10px;font-weight:700;color:#7c3aed;text-transform:uppercase;margin-bottom:5px">Why This Pathway</div>
        <p style="font-size:12px;color:#374151;margin:0;line-height:1.6">${activePathway.aiExplanation}</p></div>` : ""}
      <h2>Learning Modules (${(activePathway.modules || []).length} total)</h2>
      ${moduleHTML}
      <div style="margin-top:24px;padding-top:12px;border-top:1px solid #e5e7eb;font-size:10px;color:#9ca3af;text-align:center">
        Generated by Pathways · ${new Date().toLocaleDateString()}</div>
      </body></html>`;

    const win = window.open("", "_blank");
    win.document.write(html);
    win.document.close();
    win.focus();
    setTimeout(() => { win.print(); setExportingPDF(false); }, 500);
  };

  const isCompleted = (moduleId) =>
    progress?.completedModules?.some(
      (cm) => cm.moduleId === moduleId || cm.moduleId?._id === moduleId
    ) || false;

  const domains = [...new Set(pathways.map((p) => p.assessment?.domain).filter(Boolean))];
  const filteredPathways = pathways.filter((p) => {
    const q = search.toLowerCase();
    const matchSearch = !search || p.title?.toLowerCase().includes(q) || p.summary?.toLowerCase().includes(q);
    const matchStatus = filterStatus === "all" || p.status === filterStatus;
    const matchDomain = filterDomain === "all" || p.assessment?.domain === filterDomain;
    return matchSearch && matchStatus && matchDomain;
  });

  // ── LIST VIEW ──────────────────────────────────────────────────
  if (view === "list") {
    return (
      <div style={layout.page}>
        <Sidebar user={user} active="pathways" onNavigate={onNavigate} onLogout={onLogout} />
        <PageShell>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:"24px" }}>
            <div>
              <h1 style={{ fontSize:"24px", fontWeight:"700", color:T.purple900, margin:"0 0 4px 0" }}>My Pathways</h1>
              <p style={{ fontSize:"14px", color:T.gray500, margin:0 }}>Your AI-generated learning journeys.</p>
            </div>
            <div style={{ display:"flex", alignItems:"center", gap:"12px" }}>
              <NotificationBell token={token} />
              <PrimaryBtn onClick={() => onNavigate("assessment")}>+ New Assessment</PrimaryBtn>
            </div>
          </div>

          {genError && <ErrorBanner message={genError} />}

          {generating && (
            <Card style={{ marginBottom:"20px", display:"flex", alignItems:"center", gap:"14px" }}>
              <div style={s.genSpinner} />
              <div>
                <div style={{ fontWeight:"600", color:T.purple900, fontSize:"14px" }}>Generating your pathway with AI…</div>
                <div style={{ fontSize:"12px", color:T.gray500, marginTop:"3px" }}>This usually takes 10–20 seconds.</div>
              </div>
            </Card>
          )}

          {pathways.length > 0 && (
            <div style={s.filterBar}>
              <input style={s.searchInput} placeholder="Search pathways…" value={search} onChange={(e) => setSearch(e.target.value)} />
              <select style={s.filterSelect} value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
                <option value="all">All Statuses</option>
                <option value="active">Active</option>
                <option value="completed">Completed</option>
                <option value="archived">Archived</option>
              </select>
              {domains.length > 1 && (
                <select style={s.filterSelect} value={filterDomain} onChange={(e) => setFilterDomain(e.target.value)}>
                  <option value="all">All Domains</option>
                  {domains.map((d) => <option key={d} value={d}>{d.charAt(0).toUpperCase()+d.slice(1)}</option>)}
                </select>
              )}
              {(search || filterStatus !== "all" || filterDomain !== "all") && (
                <button style={s.clearBtn} onClick={() => { setSearch(""); setFilterStatus("all"); setFilterDomain("all"); }}>Clear</button>
              )}
            </div>
          )}

          {loading ? <Spinner /> : pathways.length === 0 ? (
            <EmptyState icon="🗺️" title="No pathways yet"
              body="Complete an assessment to generate your personalised learning pathway."
              action={<PrimaryBtn onClick={() => onNavigate("assessment")}>Start Assessment</PrimaryBtn>} />
          ) : filteredPathways.length === 0 ? (
            <EmptyState icon="🔍" title="No results" body="Try adjusting your search or filters." />
          ) : (
            <div style={s.grid}>
              {filteredPathways.map((p) => <PathwayCard key={p._id} pathway={p} onClick={() => openPathway(p)} />)}
            </div>
          )}
        </PageShell>
      </div>
    );
  }

  // ── DETAIL VIEW ────────────────────────────────────────────────
  const completionRate = progress?.completionRate ?? 0;
  const completedCount = progress?.completedModules?.length ?? 0;
  const totalModules   = activePathway?.modules?.length ?? 0;

  return (
    <div style={layout.page}>
      <Sidebar user={user} active="pathways" onNavigate={onNavigate} onLogout={onLogout} />
      <PageShell>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:"4px" }}>
          <button style={s.backBtn} onClick={() => { setView("list"); setActivePathway(null); setProgress(null); }}>← Back</button>
          <NotificationBell token={token} />
        </div>

        <PageHeader title={activePathway?.title} subtitle={activePathway?.summary} />
        {genError && <ErrorBanner message={genError} />}

        <div style={s.actionRow}>
          <button style={s.outlineBtn} onClick={exportPDF} disabled={exportingPDF}>{exportingPDF ? "Preparing…" : "⬇ Export PDF"}</button>
          <button style={s.outlineBtn} onClick={handleRegenerate} disabled={regenerating}>{regenerating ? "Regenerating…" : "↺ Regenerate"}</button>
          <button style={s.outlineBtn} onClick={loadAnalytics}>📊 {analyticsOpen ? "Hide" : "View"} Analytics</button>
        </div>

        {analyticsOpen && analytics && (
          <Card style={{ marginBottom:"20px", backgroundColor:T.purple50 }}>
            <div style={{ fontSize:"15px", fontWeight:"700", color:T.purple900, marginBottom:"14px" }}>Feedback Analytics</div>
            {!analytics.analytics?.length ? (
              <p style={{ fontSize:"13px", color:T.gray500 }}>No feedback yet. Complete modules and submit feedback to see analytics.</p>
            ) : analytics.analytics.map((a, i) => (
              <div key={i} style={{ paddingBottom:"12px", marginBottom:"12px", borderBottom:`1px solid ${T.purple100}` }}>
                <div style={{ fontSize:"13px", fontWeight:"600", color:T.purple900, marginBottom:"8px" }}>{a.moduleTitle}</div>
                <div style={{ display:"flex", flexWrap:"wrap", gap:"6px" }}>
                  {[["Too Easy",a.difficulty.too_easy,T.green500],["Just Right",a.difficulty.just_right,T.purple500],
                    ["Too Hard",a.difficulty.too_hard,T.red500]].filter(([,c])=>c>0).map(([l,c,col]) => (
                    <span key={l} style={{ backgroundColor:col+"15", color:col, borderRadius:"999px", padding:"3px 10px", fontSize:"11px", fontWeight:"600" }}>
                      {c} {l}</span>))}
                  <span style={{ color:T.purple200 }}>|</span>
                  {[["Very Relevant",a.relevance.very_relevant,T.green500],
                    ["Somewhat",a.relevance.somewhat_relevant,T.amber500],
                    ["Not Relevant",a.relevance.not_relevant,T.red500]].filter(([,c])=>c>0).map(([l,c,col]) => (
                    <span key={l} style={{ backgroundColor:col+"15", color:col, borderRadius:"999px", padding:"3px 10px", fontSize:"11px", fontWeight:"600" }}>
                      {c} {l}</span>))}
                </div>
                {a.comments?.length > 0 && a.comments.map((c,j) => (
                  <div key={j} style={{ fontSize:"12px", color:T.gray500, fontStyle:"italic", marginTop:"6px" }}>"{c}"</div>))}
              </div>))}
          </Card>
        )}

        <Card style={{ marginBottom:"20px" }}>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:"12px" }}>
            <div>
              <div style={{ fontSize:"14px", fontWeight:"600", color:T.purple900, marginBottom:"2px" }}>Overall Progress</div>
              <div style={{ fontSize:"12px", color:T.gray500 }}>{completedCount} of {totalModules} modules completed</div>
            </div>
            <div style={{ fontSize:"22px", fontWeight:"700", color:T.purple500 }}>{completionRate}%</div>
          </div>
          <ProgressBar pct={completionRate} showLabel={false} />
          {progress?.earnedBadges?.length > 0 && (
            <div style={{ display:"flex", flexWrap:"wrap", gap:"8px", marginTop:"14px" }}>
              {progress.earnedBadges.map((b,i) => (
                <div key={i} style={{ backgroundColor:T.purple100, color:T.purple600, borderRadius:"999px", padding:"4px 12px", fontSize:"12px", fontWeight:"600" }}>
                  🏅 {b.title}</div>))}
            </div>
          )}
        </Card>

        {activePathway?.aiExplanation && (
          <Card style={{ marginBottom:"20px", backgroundColor:T.purple50 }}>
            <div style={{ fontSize:"11px", fontWeight:"700", color:T.purple500, textTransform:"uppercase", letterSpacing:"0.5px", marginBottom:"8px" }}>
              ✨ Why this pathway was built for you</div>
            <p style={{ fontSize:"14px", color:T.gray700, lineHeight:"1.65", margin:0 }}>{activePathway.aiExplanation}</p>
          </Card>
        )}

        <div style={{ fontSize:"16px", fontWeight:"700", color:T.purple900, margin:"0 0 14px 0" }}>Learning Modules</div>
        <div style={{ display:"flex", flexDirection:"column", gap:"10px" }}>
          {activePathway?.modules?.map((mod, idx) => (
            <ModuleCard key={mod._id} module={mod} index={idx+1}
              completed={isCompleted(mod._id)}
              completing={completingModule === mod._id}
              onComplete={(feedback) => markComplete(activePathway._id, mod._id, feedback)} />
          ))}
        </div>
      </PageShell>
    </div>
  );
}

function PathwayCard({ pathway, onClick }) {
  const total = pathway.modules?.length ?? 0;
  const done  = pathway.modules?.filter((m) => m.isCompleted).length ?? 0;
  const pct   = total > 0 ? Math.round((done/total)*100) : 0;
  const statusColors = { active:T.purple500, completed:T.green500, archived:T.gray500 };
  return (
    <div style={s.pathwayCard} onClick={onClick}>
      <div style={s.pathwayDomain}>
        {pathway.assessment?.domain ?? "STEAM"}
        {pathway.assessment?.subfield ? " · "+pathway.assessment.subfield.split("_").map(w=>w.charAt(0).toUpperCase()+w.slice(1)).join(" ") : ""}
      </div>
      <h3 style={s.pathwayTitle}>{pathway.title}</h3>
      <p style={s.pathwaySummary}>{pathway.summary}</p>
      <div style={{ display:"flex", gap:"8px", marginBottom:"12px" }}>
        <span style={s.chip}>{total} modules</span>
        <span style={{ ...s.chip, backgroundColor:(statusColors[pathway.status]||T.gray500)+"20", color:statusColors[pathway.status]||T.gray500 }}>
          {pathway.status}</span>
      </div>
      <ProgressBar pct={pct} showLabel={false} />
      <p style={{ fontSize:"11px", color:T.gray500, marginTop:"4px" }}>{done}/{total} · {pct}% complete</p>
    </div>
  );
}

function ModuleCard({ module, index, completed, completing, onComplete }) {
  const [open,     setOpen]     = useState(false);
  const [showFb,   setShowFb]   = useState(false);
  const [feedback, setFeedback] = useState({ difficulty:"", relevance:"", comment:"" });
  const diffColor = { beginner:T.green500, intermediate:T.amber500, advanced:T.red500 };

  return (
    <div style={{ ...s.moduleCard, borderLeft:`4px solid ${completed ? T.green500 : T.purple500}` }}>
      <div style={s.moduleHeader} onClick={() => setOpen(!open)}>
        <div style={{ display:"flex", alignItems:"flex-start", gap:"12px" }}>
          <div style={{ ...s.moduleNum, backgroundColor: completed ? T.green500 : T.purple500 }}>
            {completed ? "✓" : index}</div>
          <div>
            <div style={{ fontSize:"14px", fontWeight:"600", color:T.purple900, marginBottom:"3px" }}>{module.title}</div>
            <div style={{ fontSize:"12px", color:T.gray500 }}>
              <span style={{ color:diffColor[module.difficulty]??T.gray500, fontWeight:600 }}>{module.difficulty}</span>
              {" · "}{module.estimatedHours}h{" · "}
              <span style={{ color:T.purple500 }}>{module.domain?.split("_").map(w=>w.charAt(0).toUpperCase()+w.slice(1)).join(" ")}</span>
            </div>
          </div>
        </div>
        <span style={{ fontSize:"10px", color:T.gray500 }}>{open ? "▲" : "▼"}</span>
      </div>
      {open && (
        <div style={{ padding:"0 18px 18px 56px" }}>
          <p style={{ fontSize:"13px", color:T.gray700, lineHeight:"1.6", marginBottom:"12px" }}>{module.description}</p>
          {module.reason && (
            <div style={{ backgroundColor:T.purple50, border:T.cardBorder, borderRadius:T.radiusSm, padding:"10px 14px", fontSize:"13px", color:T.gray700, marginBottom:"14px" }}>
              <strong style={{ color:T.purple600 }}>Why this module: </strong>{module.reason}</div>
          )}
          {module.resources?.length > 0 && (
            <div style={{ marginBottom:"16px" }}>
              <div style={{ fontSize:"11px", fontWeight:"700", color:T.gray700, textTransform:"uppercase", letterSpacing:"0.5px", marginBottom:"8px" }}>Resources</div>
              {module.resources.map((r,i) => (
                <a key={i} href={r.url} target="_blank" rel="noopener noreferrer"
                  style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"10px 14px",
                    backgroundColor:T.gray50, border:`1px solid ${T.gray200}`, borderRadius:T.radiusSm,
                    marginBottom:"6px", textDecoration:"none", color:"inherit" }}>
                  <div>
                    <div style={{ fontSize:"13px", fontWeight:"600", color:T.purple900, marginBottom:"2px" }}>{r.title}</div>
                    <div style={{ fontSize:"11px", color:T.gray500 }}>
                      {r.source} · {r.format} ·{" "}
                      <span style={{ color:r.isFree?T.green500:T.amber500, fontWeight:600 }}>{r.isFree?"Free":"Paid"}</span>
                      {r.isValidated===false && <span style={{ color:T.red500, marginLeft:"8px" }}>⚠ Unverified</span>}
                    </div>
                  </div>
                  <span style={{ color:T.purple500, fontSize:"14px", fontWeight:"700" }}>↗</span>
                </a>))}
            </div>
          )}
          {!completed && (
            !showFb ? (
              <button style={s.completeBtn} onClick={() => setShowFb(true)}>✓ Mark as Complete</button>
            ) : (
              <div style={{ backgroundColor:T.purple50, border:T.cardBorder, borderRadius:T.radiusSm, padding:"14px 16px" }}>
                <div style={{ fontSize:"13px", fontWeight:"600", color:T.purple900, marginBottom:"10px" }}>Optional feedback:</div>
                {[
                  ["Difficulty", "difficulty", ["too_easy:Too Easy","just_right:Just Right","too_hard:Too Hard"]],
                  ["Relevance",  "relevance",  ["not_relevant:Not Relevant","somewhat_relevant:Somewhat Relevant","very_relevant:Very Relevant"]],
                ].map(([label, field, options]) => (
                  <div key={field} style={{ display:"flex", alignItems:"center", gap:"10px", marginBottom:"8px" }}>
                    <label style={{ fontSize:"12px", fontWeight:"600", color:T.gray700, width:"70px", flexShrink:0 }}>{label}</label>
                    <select style={{ flex:1, padding:"7px 10px", borderRadius:T.radiusSm, border:`1.5px solid ${T.gray200}`, fontSize:"13px", fontFamily:T.font, cursor:"pointer", outline:"none" }}
                      value={feedback[field]} onChange={(e) => setFeedback({...feedback,[field]:e.target.value})}>
                      <option value="">Select…</option>
                      {options.map(o => { const [v,l]=o.split(":"); return <option key={v} value={v}>{l}</option>; })}
                    </select>
                  </div>
                ))}
                <div style={{ display:"flex", alignItems:"center", gap:"10px", marginBottom:"10px" }}>
                  <label style={{ fontSize:"12px", fontWeight:"600", color:T.gray700, width:"70px", flexShrink:0 }}>Comment</label>
                  <input style={{ flex:1, padding:"7px 10px", borderRadius:T.radiusSm, border:`1.5px solid ${T.gray200}`, fontSize:"13px", fontFamily:T.font, outline:"none" }}
                    placeholder="Optional…" value={feedback.comment} onChange={(e) => setFeedback({...feedback,comment:e.target.value})} />
                </div>
                <div style={{ display:"flex", gap:"8px" }}>
                  <button style={{ ...s.completeBtn, opacity:completing?0.7:1 }} onClick={() => onComplete(feedback)} disabled={completing}>
                    {completing ? "Saving…" : "✓ Confirm"}</button>
                  <button style={{ padding:"9px 16px", background:"none", border:`1px solid ${T.gray200}`, color:T.gray500, borderRadius:T.radiusSm, fontSize:"13px", cursor:"pointer", fontFamily:T.font }}
                    onClick={() => { setShowFb(false); onComplete({}); }}>Skip</button>
                </div>
              </div>
            )
          )}
          {completed && (
            <div style={{ display:"inline-block", backgroundColor:T.green100, color:T.green500, borderRadius:"999px", padding:"5px 14px", fontSize:"12px", fontWeight:"700" }}>
              ✓ Completed</div>
          )}
        </div>
      )}
    </div>
  );
}

const layout = { page: { display:"flex", fontFamily:T.font, minHeight:"100vh", backgroundColor:T.purple50 } };
const s = {
  backBtn:      { background:"none", border:"none", color:T.purple500, fontWeight:"600", fontSize:"13px", cursor:"pointer", padding:"0 0 16px 0", display:"block", fontFamily:T.font },
  genSpinner:   { width:"28px", height:"28px", border:`3px solid ${T.purple100}`, borderTop:`3px solid ${T.purple500}`, borderRadius:"50%", flexShrink:0, animation:"spin 0.75s linear infinite" },
  filterBar:    { display:"flex", gap:"10px", marginBottom:"20px", flexWrap:"wrap", alignItems:"center" },
  searchInput:  { padding:"9px 14px", borderRadius:T.radiusSm, border:`1.5px solid ${T.gray200}`, fontSize:"13px", fontFamily:T.font, outline:"none", backgroundColor:T.white, width:"200px" },
  filterSelect: { padding:"9px 12px", borderRadius:T.radiusSm, border:`1.5px solid ${T.gray200}`, fontSize:"13px", fontFamily:T.font, cursor:"pointer", backgroundColor:T.white, outline:"none", color:T.gray700 },
  clearBtn:     { background:"none", border:"none", color:T.purple500, fontSize:"12px", fontWeight:"600", cursor:"pointer", fontFamily:T.font },
  actionRow:    { display:"flex", gap:"10px", marginBottom:"20px", flexWrap:"wrap" },
  outlineBtn:   { padding:"8px 16px", background:"none", border:`1.5px solid ${T.purple200}`, color:T.purple600, borderRadius:T.radiusSm, fontSize:"13px", fontWeight:"600", cursor:"pointer", fontFamily:T.font },
  grid:         { display:"grid", gridTemplateColumns:"repeat(auto-fill, minmax(300px, 1fr))", gap:"16px" },
  pathwayCard:  { backgroundColor:T.white, border:T.cardBorder, borderRadius:T.radius, padding:"20px", cursor:"pointer", boxShadow:T.cardShadow },
  pathwayDomain:{ fontSize:"11px", fontWeight:"700", color:T.purple500, textTransform:"uppercase", letterSpacing:"0.5px", marginBottom:"8px" },
  pathwayTitle: { fontSize:"15px", fontWeight:"700", color:T.purple900, margin:"0 0 6px 0" },
  pathwaySummary:{ fontSize:"13px", color:T.gray500, lineHeight:"1.5", margin:"0 0 14px 0" },
  chip:         { backgroundColor:T.purple100, color:T.purple600, borderRadius:"999px", padding:"3px 10px", fontSize:"12px", fontWeight:"600" },
  moduleCard:   { backgroundColor:T.white, border:T.cardBorder, borderRadius:T.radiusSm, overflow:"hidden", boxShadow:T.cardShadow },
  moduleHeader: { display:"flex", justifyContent:"space-between", alignItems:"center", padding:"14px 18px", cursor:"pointer" },
  moduleNum:    { width:"26px", height:"26px", borderRadius:"50%", color:T.white, fontWeight:"700", fontSize:"12px", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0, marginTop:"1px" },
  completeBtn:  { padding:"9px 20px", backgroundColor:T.purple500, color:T.white, border:"none", borderRadius:T.radiusSm, fontSize:"13px", fontWeight:"600", cursor:"pointer", fontFamily:T.font },
};