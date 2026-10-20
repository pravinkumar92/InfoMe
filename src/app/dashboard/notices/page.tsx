"use client";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Search, Filter, Eye, Download, Bookmark, Share2, Clock, ExternalLink } from "lucide-react";
import { formatRelativeTime, getDaysUntil, truncate } from "@/lib/utils";
import { toast } from "sonner";
import { getNotices, searchNotices, saveNotice, unsaveNotice, isNoticeSaved } from "@/lib/api";
import { getCurrentUser } from "@/lib/auth";
import Link from "next/link";

const categories = ["All", "Scholarships", "Jobs", "Exams", "Results", "Tenders", "Admissions", "Civic Alerts", "General"];
const urgencyColors: Record<string, { bg: string; color: string; border: string }> = {
  critical: { bg: "rgba(220,38,38,0.1)", color: "#fca5a5", border: "rgba(220,38,38,0.3)" },
  high: { bg: "rgba(245,158,11,0.1)", color: "#fcd34d", border: "rgba(245,158,11,0.3)" },
  medium: { bg: "rgba(99,102,241,0.1)", color: "#a5b4fc", border: "rgba(99,102,241,0.3)" },
  low: { bg: "rgba(16,185,129,0.1)", color: "#6ee7b7", border: "rgba(16,185,129,0.3)" },
};

export default function NoticesPage() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [notices, setNotices] = useState<any[]>([]);
  const [savedIds, setSavedIds] = useState<string[]>([]);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    loadNotices();
    loadUser();
  }, [category]);

  async function loadUser() {
    try {
      const user = await getCurrentUser();
      setUserId(user?.id || null);
    } catch (error) {
      console.error("Failed to load user:", error);
    }
  }

  async function loadNotices() {
    setLoading(true);
    try {
      const filters: any = { limit: 50 };
      if (category !== "All") {
        filters.category = category;
      }
      
      const data = await getNotices(filters);
      setNotices(data || []);
    } catch (error) {
      console.error("Failed to load notices:", error);
      toast.error("Failed to load notices");
    } finally {
      setLoading(false);
    }
  }

  async function handleSearch() {
    if (!search.trim()) {
      loadNotices();
      return;
    }

    setLoading(true);
    try {
      const data = await searchNotices(search);
      setNotices(data || []);
    } catch (error) {
      console.error("Search failed:", error);
      toast.error("Search failed");
    } finally {
      setLoading(false);
    }
  }

  async function toggleSave(noticeId: string, e: React.MouseEvent) {
    e.stopPropagation();
    
    if (!userId) {
      toast.error("Please log in to save notices");
      return;
    }

    try {
      if (savedIds.includes(noticeId)) {
        await unsaveNotice(userId, noticeId);
        setSavedIds(prev => prev.filter(id => id !== noticeId));
        toast.success("Removed from saved");
      } else {
        await saveNotice(userId, noticeId);
        setSavedIds(prev => [...prev, noticeId]);
        toast.success("Saved!");
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to save");
    }
  }

  const filtered = notices.filter(n => {
    const q = search.toLowerCase();
    return !q || n.title.toLowerCase().includes(q) || n.department?.toLowerCase().includes(q) || n.category.toLowerCase().includes(q);
  });

  if (loading) {
    return (
      <div style={{ maxWidth: 960, margin: "0 auto", padding: "40px 0", textAlign: "center" }}>
        <div style={{ fontSize: 16, color: "#9d9db5" }}>Loading notices...</div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 960, margin: "0 auto" }}>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 24, fontWeight: 800, color: "#f1f0ff", fontFamily: "'Outfit',sans-serif", marginBottom: 4 }}>All Notices</h1>
        <p style={{ fontSize: 13, color: "#5c5c7a" }}>{filtered.length} notices available</p>
      </div>

      {/* Search + Filters */}
      <div style={{ display: "flex", gap: 12, marginBottom: 20, flexWrap: "wrap" }}>
        <div style={{ position: "relative", flex: 1, minWidth: 250 }}>
          <Search className="w-4 h-4" style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "#5c5c7a" }} />
          <input id="notices-search" type="text" value={search} onChange={e => setSearch(e.target.value)}
            onKeyDown={e => e.key === "Enter" && handleSearch()}
            placeholder="Search notices..." className="input-dark" style={{ paddingLeft: 38, height: 42 }} />
        </div>
        <button onClick={handleSearch} className="btn-glow" style={{ height: 42, padding: "0 20px", borderRadius: 8, border: "none", color: "white", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
          Search
        </button>
        <select id="notices-category" value={category} onChange={e => setCategory(e.target.value)} className="input-dark" style={{ width: "auto", height: 42, paddingRight: 32, minWidth: 160 }}>
          {categories.map(c => <option key={c} value={c} style={{ background: "#12121e" }}>{c}</option>)}
        </select>
      </div>

      {/* Category pills */}
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 20 }}>
        {categories.map(c => (
          <button key={c} id={`notices-cat-${c}`} onClick={() => setCategory(c)}
            style={{ padding: "5px 14px", borderRadius: 20, fontSize: 12, fontWeight: 500, cursor: "pointer", background: category === c ? "rgba(124,58,237,0.2)" : "transparent", border: `1px solid ${category === c ? "#7c3aed" : "var(--border)"}`, color: category === c ? "#a78bfa" : "#9d9db5" }}>
            {c}
          </button>
        ))}
      </div>

      {/* Notice list */}
      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        {filtered.length > 0 ? (
          filtered.map((n, i) => {
            const uc = urgencyColors[n.urgency];
            const daysLeft = n.last_date ? getDaysUntil(n.last_date) : null;
            const isExpanded = expandedId === n.id;

            return (
              <motion.div key={n.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
                onClick={() => setExpandedId(isExpanded ? null : n.id)}
                style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: 16, padding: 20, cursor: "pointer", transition: "all 0.25s", borderLeft: n.urgency === "critical" ? "3px solid #dc2626" : "1px solid var(--border)" }}>

                {/* Header row */}
                <div style={{ display: "flex", alignItems: "flex-start", gap: 14 }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8, flexWrap: "wrap" }}>
                      <span style={{ fontSize: 11, fontWeight: 600, padding: "3px 9px", borderRadius: 20, background: "rgba(124,58,237,0.12)", color: "#a78bfa", border: "1px solid rgba(124,58,237,0.2)" }}>{n.category}</span>
                      <span style={{ fontSize: 11, fontWeight: 600, padding: "3px 9px", borderRadius: 20, background: uc.bg, color: uc.color, border: `1px solid ${uc.border}`, textTransform: "capitalize" }}>
                        {n.urgency === "critical" ? "🔴" : n.urgency === "high" ? "🟡" : n.urgency === "medium" ? "🔵" : "🟢"} {n.urgency}
                      </span>
                      {n.amount && <span style={{ fontSize: 11, color: "#fbbf24", fontWeight: 600 }}>💰 {n.amount}</span>}
                    </div>
                    <h3 style={{ fontSize: 15, fontWeight: 700, color: "#f1f0ff", lineHeight: 1.4, marginBottom: 6 }}>{n.title}</h3>
                    <div style={{ display: "flex", gap: 14, fontSize: 12, color: "#5c5c7a", flexWrap: "wrap" }}>
                      <span>🏛️ {n.department}</span>
                      <span>🕐 {formatRelativeTime(n.created_at)}</span>
                      <span><Eye className="w-3 h-3" style={{ display: "inline", marginRight: 2 }} />{n.views.toLocaleString()}</span>
                      {daysLeft !== null && (
                        <span style={{ color: daysLeft <= 7 ? "#ef4444" : daysLeft <= 14 ? "#f59e0b" : "#10b981", fontWeight: 600 }}>
                          <Clock className="w-3 h-3" style={{ display: "inline", marginRight: 2 }} />
                          {daysLeft > 0 ? `${daysLeft}d left` : "Expired"}
                        </span>
                      )}
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: 8, flexShrink: 0 }} onClick={e => e.stopPropagation()}>
                    <button onClick={(e) => toggleSave(n.id, e)} style={{ padding: "7px", borderRadius: 8, background: savedIds.includes(n.id) ? "rgba(124,58,237,0.15)" : "rgba(255,255,255,0.04)", border: `1px solid ${savedIds.includes(n.id) ? "#7c3aed" : "var(--border)"}`, cursor: "pointer", color: savedIds.includes(n.id) ? "#a78bfa" : "#9d9db5" }}>
                      <Bookmark className="w-4 h-4" style={{ fill: savedIds.includes(n.id) ? "currentColor" : "none" }} />
                    </button>
                    <button onClick={() => { navigator.clipboard.writeText(window.location.origin + `/dashboard/notices/${n.id}`); toast.success("Link copied!"); }} style={{ padding: "7px", borderRadius: 8, background: "rgba(255,255,255,0.04)", border: "1px solid var(--border)", cursor: "pointer", color: "#9d9db5" }}>
                      <Share2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Summary always visible */}
                {n.summary && (
                  <p style={{ fontSize: 13, color: "#9d9db5", lineHeight: 1.6, marginTop: 10, padding: "10px 12px", background: "rgba(255,255,255,0.02)", borderRadius: 8, borderLeft: "2px solid rgba(124,58,237,0.4)" }}>
                    <span style={{ color: "#7c3aed", fontWeight: 600 }}>AI Summary:</span> {n.summary}
                  </p>
                )}

                {/* Expanded details */}
                {isExpanded && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} style={{ marginTop: 14 }}>
                    {n.description && <p style={{ fontSize: 14, color: "#9d9db5", lineHeight: 1.7, marginBottom: 14 }}>{n.description}</p>}
                    <div style={{ display: "flex", gap: 10 }}>
                      {n.external_url && (
                        <a href={n.external_url} target="_blank" rel="noopener noreferrer" style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 16px", borderRadius: 8, background: "linear-gradient(135deg,#7c3aed,#6d28d9)", color: "white", fontSize: 13, fontWeight: 700, textDecoration: "none" }}>
                          View Full Notice <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      )}
                      {n.pdf_url && (
                        <a href={n.pdf_url} target="_blank" rel="noopener noreferrer" style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 16px", borderRadius: 8, background: "rgba(255,255,255,0.04)", border: "1px solid var(--border)", color: "#9d9db5", fontSize: 13, textDecoration: "none" }}>
                          <Download className="w-3.5 h-3.5" /> Download PDF
                        </a>
                      )}
                    </div>
                  </motion.div>
                )}
              </motion.div>
            );
          })
        ) : (
          <div style={{ padding: 60, textAlign: "center", color: "#5c5c7a" }}>
            No notices found. Try a different search or category.
          </div>
        )}
      </div>
    </div>
  );
}
