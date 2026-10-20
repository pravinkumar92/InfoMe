"use client";
import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { Search, Filter, X, Clock, Eye, Download, Bookmark, Share2 } from "lucide-react";
import { mockNotices, mockSources } from "@/lib/mock-data";
import { formatRelativeTime, getDaysUntil, truncate } from "@/lib/utils";
import { toast } from "sonner";

const categories = ["All", "Scholarships", "Jobs", "Exams", "Results", "Tenders", "Admissions", "Civic Alerts"];
const urgencies = ["All", "critical", "high", "medium", "low"];

export default function SearchPage() {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All");
  const [urgency, setUrgency] = useState("All");
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [savedIds, setSavedIds] = useState<string[]>([]);

  const results = useMemo(() => {
    return mockNotices.filter(n => {
      const q = query.toLowerCase();
      const matchQ = !q || n.title.toLowerCase().includes(q) || (n.description || "").toLowerCase().includes(q) || n.category.toLowerCase().includes(q) || (n.summary || "").toLowerCase().includes(q);
      const matchCat = category === "All" || n.category === category;
      const matchUrg = urgency === "All" || n.urgency === urgency;
      return matchQ && matchCat && matchUrg;
    });
  }, [query, category, urgency]);

  const toggleSave = (id: string) => {
    setSavedIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
    toast.success(savedIds.includes(id) ? "Removed from saved" : "Notice saved!");
  };

  const urgencyBg: Record<string, string> = { critical: "rgba(220,38,38,0.1)", high: "rgba(245,158,11,0.1)", medium: "rgba(99,102,241,0.1)", low: "rgba(16,185,129,0.1)" };
  const urgencyColor: Record<string, string> = { critical: "#fca5a5", high: "#fcd34d", medium: "#a5b4fc", low: "#6ee7b7" };

  return (
    <div style={{ maxWidth: 900, margin: "0 auto" }}>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 24, fontWeight: 800, color: "#f1f0ff", fontFamily: "'Outfit',sans-serif", marginBottom: 4 }}>Smart Search</h1>
        <p style={{ fontSize: 13, color: "#5c5c7a" }}>Search across all notices, PDFs, and sources</p>
      </div>

      {/* Search bar */}
      <div style={{ position: "relative", marginBottom: 16 }}>
        <Search className="w-5 h-5" style={{ position: "absolute", left: 16, top: "50%", transform: "translateY(-50%)", color: "#5c5c7a" }} />
        <input id="search-input" type="text" value={query} onChange={e => setQuery(e.target.value)} placeholder='Search notices, scholarships, jobs... (e.g. "AKTU exam", "PM scholarship")'
          className="input-dark" style={{ paddingLeft: 48, paddingRight: 100, height: 52, fontSize: 15, borderRadius: 14 }} />
        <div style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", display: "flex", alignItems: "center", gap: 8 }}>
          {query && <button onClick={() => setQuery("")} style={{ background: "none", border: "none", cursor: "pointer", color: "#5c5c7a" }}><X className="w-4 h-4" /></button>}
          <button onClick={() => setFiltersOpen(!filtersOpen)} style={{ display: "flex", alignItems: "center", gap: 6, padding: "6px 12px", borderRadius: 8, background: filtersOpen ? "rgba(124,58,237,0.2)" : "rgba(255,255,255,0.05)", border: `1px solid ${filtersOpen ? "#7c3aed" : "var(--border)"}`, color: filtersOpen ? "#a78bfa" : "#9d9db5", fontSize: 13, cursor: "pointer" }}>
            <Filter className="w-3.5 h-3.5" /> Filters
          </button>
        </div>
      </div>

      {/* Filters */}
      {filtersOpen && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
          style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: 14, padding: 20, marginBottom: 20 }}>
          <div style={{ display: "flex", gap: 24, flexWrap: "wrap" }}>
            <div>
              <label style={{ fontSize: 12, color: "#9d9db5", marginBottom: 8, display: "block" }}>Category</label>
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                {categories.map(c => (
                  <button key={c} id={`cat-${c}`} onClick={() => setCategory(c)}
                    style={{ padding: "5px 12px", borderRadius: 20, fontSize: 12, cursor: "pointer", background: category === c ? "rgba(124,58,237,0.2)" : "transparent", border: `1px solid ${category === c ? "#7c3aed" : "var(--border)"}`, color: category === c ? "#a78bfa" : "#9d9db5" }}>
                    {c}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label style={{ fontSize: 12, color: "#9d9db5", marginBottom: 8, display: "block" }}>Urgency</label>
              <div style={{ display: "flex", gap: 6 }}>
                {urgencies.map(u => (
                  <button key={u} id={`urg-${u}`} onClick={() => setUrgency(u)}
                    style={{ padding: "5px 12px", borderRadius: 20, fontSize: 12, cursor: "pointer", background: urgency === u ? "rgba(124,58,237,0.2)" : "transparent", border: `1px solid ${urgency === u ? "#7c3aed" : "var(--border)"}`, color: urgency === u ? "#a78bfa" : "#9d9db5", textTransform: "capitalize" }}>
                    {u}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Results count */}
      <div style={{ fontSize: 13, color: "#5c5c7a", marginBottom: 16 }}>
        {query ? `Found ${results.length} results for "${query}"` : `Showing all ${results.length} notices`}
      </div>

      {/* Results */}
      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        {results.length === 0 ? (
          <div style={{ textAlign: "center", padding: "60px 0", color: "#5c5c7a" }}>
            <Search className="w-10 h-10" style={{ margin: "0 auto 12px", opacity: 0.4 }} />
            <p style={{ fontSize: 15, fontWeight: 500 }}>No notices found</p>
            <p style={{ fontSize: 13, marginTop: 4 }}>Try different keywords or clear filters</p>
          </div>
        ) : results.map((n, i) => {
          const daysLeft = n.last_date ? getDaysUntil(n.last_date) : null;
          return (
            <motion.div key={n.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
              style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: 14, padding: 20, transition: "all 0.2s" }}>
              <div style={{ display: "flex", gap: 16, alignItems: "flex-start" }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8, flexWrap: "wrap" }}>
                    <span style={{ fontSize: 11, fontWeight: 600, padding: "3px 9px", borderRadius: 20, background: "rgba(124,58,237,0.12)", color: "#a78bfa", border: "1px solid rgba(124,58,237,0.2)" }}>{n.category}</span>
                    <span style={{ fontSize: 11, fontWeight: 600, padding: "3px 9px", borderRadius: 20, background: urgencyBg[n.urgency], color: urgencyColor[n.urgency], border: `1px solid ${urgencyColor[n.urgency]}40`, textTransform: "capitalize" }}>{n.urgency}</span>
                    {n.amount && <span style={{ fontSize: 11, color: "#fbbf24", fontWeight: 600 }}>💰 {n.amount}</span>}
                  </div>
                  <h3 style={{ fontSize: 15, fontWeight: 700, color: "#f1f0ff", marginBottom: 6, lineHeight: 1.4 }}>{n.title}</h3>
                  <p style={{ fontSize: 13, color: "#9d9db5", lineHeight: 1.6, marginBottom: 10 }}>{n.summary || truncate(n.description || "", 200)}</p>
                  <div style={{ display: "flex", alignItems: "center", gap: 16, fontSize: 12, color: "#5c5c7a" }}>
                    <span>{n.department}</span>
                    <span>{formatRelativeTime(n.created_at)}</span>
                    {daysLeft !== null && (
                      <span style={{ color: daysLeft <= 7 ? "#ef4444" : daysLeft <= 14 ? "#f59e0b" : "#10b981", fontWeight: 600 }}>
                        <Clock className="w-3 h-3" style={{ display: "inline", marginRight: 2 }} />
                        {daysLeft > 0 ? `${daysLeft}d left` : "Expired"}
                      </span>
                    )}
                    <span><Eye className="w-3 h-3" style={{ display: "inline", marginRight: 2 }} />{n.views.toLocaleString()}</span>
                  </div>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 8, flexShrink: 0 }}>
                  <button onClick={() => toggleSave(n.id)} style={{ padding: "8px", borderRadius: 8, background: savedIds.includes(n.id) ? "rgba(124,58,237,0.15)" : "rgba(255,255,255,0.04)", border: `1px solid ${savedIds.includes(n.id) ? "#7c3aed" : "var(--border)"}`, cursor: "pointer", color: savedIds.includes(n.id) ? "#a78bfa" : "#9d9db5" }}>
                    <Bookmark className="w-4 h-4" style={{ fill: savedIds.includes(n.id) ? "currentColor" : "none" }} />
                  </button>
                  <button onClick={() => toast.success("Link copied!")} style={{ padding: "8px", borderRadius: 8, background: "rgba(255,255,255,0.04)", border: "1px solid var(--border)", cursor: "pointer", color: "#9d9db5" }}>
                    <Share2 className="w-4 h-4" />
                  </button>
                  {n.pdf_url && (
                    <button onClick={() => toast.success("Downloading PDF...")} style={{ padding: "8px", borderRadius: 8, background: "rgba(255,255,255,0.04)", border: "1px solid var(--border)", cursor: "pointer", color: "#9d9db5" }}>
                      <Download className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
