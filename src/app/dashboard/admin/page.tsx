"use client";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Shield, Globe, FileText, Users, Activity, Plus, Trash2,
  RefreshCw, CheckCircle, XCircle, Eye, Settings, AlertTriangle,
  ToggleLeft, ToggleRight, Search, Edit
} from "lucide-react";
import { formatRelativeTime, truncate } from "@/lib/utils";
import { toast } from "sonner";
import { getSources, getNotices, getScraperLogs, getDashboardStats } from "@/lib/api";
import { supabase } from "@/lib/supabase";
import type { Source, Notice, ScraperLog } from "@/lib/supabase";

type AdminTab = "overview" | "sources" | "notices" | "users" | "logs";

function StatCard({ label, value, icon, color, sub }: any) {
  return (
    <div style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: 16, padding: 20 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <div style={{ fontSize: 26, fontWeight: 800, color: "#ffffff", fontFamily: "'Outfit',sans-serif" }}>{value}</div>
          <div style={{ fontSize: 13, color: "#c4c4d4", marginTop: 4 }}>{label}</div>
          {sub && <div style={{ fontSize: 12, color, marginTop: 4 }}>{sub}</div>}
        </div>
        <div style={{ width: 40, height: 40, borderRadius: 10, background: `${color}18`, display: "flex", alignItems: "center", justifyContent: "center", color }}>{icon}</div>
      </div>
    </div>
  );
}

export default function AdminPage() {
  const [tab, setTab] = useState<AdminTab>("overview");
  const [sources, setSources] = useState<Source[]>([]);
  const [notices, setNotices] = useState<any[]>([]);
  const [logs, setLogs] = useState<ScraperLog[]>([]);
  const [stats, setStats] = useState({ totalNotices: 0, totalSources: 0, alertsSent: 0 });
  const [loading, setLoading] = useState(true);
  const [showAddSource, setShowAddSource] = useState(false);
  const [newSource, setNewSource] = useState({ name: "", type: "government", url: "", category: "" });
  const [userSearch, setUserSearch] = useState("");

  useEffect(() => {
    loadData();
  }, [tab]);

  async function loadData() {
    setLoading(true);
    try {
      if (tab === "overview" || tab === "sources") {
        const [sourcesData, statsData] = await Promise.all([
          getSources(),
          getDashboardStats()
        ]);
        setSources(sourcesData || []);
        setStats(statsData);
      }
      
      if (tab === "notices") {
        const noticesData = await getNotices({ limit: 50 });
        setNotices(noticesData || []);
      }
      
      if (tab === "logs") {
        const logsData = await getScraperLogs(50);
        setLogs(logsData || []);
      }
    } catch (error) {
      console.error("Failed to load admin data:", error);
      toast.error("Failed to load data");
    } finally {
      setLoading(false);
    }
  }

  async function toggleSource(id: string) {
    const source = sources.find(s => s.id === id);
    if (!source) return;

    try {
      const { error } = await supabase
        .from("sources")
        .update({ is_active: !source.is_active })
        .eq("id", id);

      if (error) throw error;

      setSources(prev => prev.map(s => s.id === id ? { ...s, is_active: !s.is_active } : s));
      toast.success("Source status updated");
    } catch (error: any) {
      toast.error(error.message || "Failed to update source");
    }
  }

  async function addSource() {
    if (!newSource.name || !newSource.url) {
      toast.error("Fill all required fields");
      return;
    }

    try {
      const { data, error } = await supabase
        .from("sources")
        .insert({
          name: newSource.name,
          type: newSource.type,
          url: newSource.url,
          category: newSource.category || null,
          is_active: true,
          notice_count: 0
        })
        .select()
        .single();

      if (error) throw error;

      setSources(prev => [...prev, data]);
      setNewSource({ name: "", type: "government", url: "", category: "" });
      setShowAddSource(false);
      toast.success("Source added successfully!");
    } catch (error: any) {
      toast.error(error.message || "Failed to add source");
    }
  }

  async function deleteNotice(id: string) {
    if (!confirm("Are you sure you want to delete this notice?")) return;

    try {
      const { error } = await supabase
        .from("notices")
        .delete()
        .eq("id", id);

      if (error) throw error;

      setNotices(prev => prev.filter(n => n.id !== id));
      toast.success("Notice deleted");
    } catch (error: any) {
      toast.error(error.message || "Failed to delete notice");
    }
  }

  const tabs: { id: AdminTab; label: string; icon: React.ReactNode }[] = [
    { id: "overview", label: "Overview", icon: <Activity className="w-4 h-4" /> },
    { id: "sources", label: "Sources", icon: <Globe className="w-4 h-4" /> },
    { id: "notices", label: "Notices", icon: <FileText className="w-4 h-4" /> },
    { id: "logs", label: "Logs", icon: <Settings className="w-4 h-4" /> },
  ];

  const logColors: Record<string, string> = {
    success: "#10b981", failed: "#ef4444", partial: "#f59e0b",
  };
  const logBg: Record<string, string> = {
    success: "rgba(16,185,129,0.08)", failed: "rgba(239,68,68,0.08)", partial: "rgba(245,158,11,0.08)",
  };

  if (loading && tab !== "overview") {
    return (
      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "40px 0", textAlign: "center" }}>
        <div style={{ fontSize: 16, color: "#c4c4d4" }}>Loading...</div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 1100, margin: "0 auto" }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 28 }}>
        <div style={{ width: 44, height: 44, borderRadius: 12, background: "linear-gradient(135deg,#7c3aed,#6d28d9)", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <Shield className="w-5 h-5" style={{ color: "white" }} />
        </div>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 800, color: "#ffffff", fontFamily: "'Outfit',sans-serif" }}>Admin Panel</h1>
          <p style={{ fontSize: 13, color: "#a0a0b8" }}>Manage sources, notices, and system settings</p>
        </div>
        <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 6, padding: "6px 14px", borderRadius: 8, background: "rgba(124,58,237,0.1)", border: "1px solid rgba(124,58,237,0.25)" }}>
          <div style={{ width: 7, height: 7, borderRadius: "50%", background: "#10b981", boxShadow: "0 0 6px #10b981" }} />
          <span style={{ fontSize: 12, color: "#10b981", fontWeight: 600 }}>System Online</span>
        </div>
      </div>

      {/* Tab bar */}
      <div style={{ display: "flex", gap: 0, borderBottom: "1px solid var(--border)", marginBottom: 28 }}>
        {tabs.map(t => (
          <button key={t.id} id={`admin-tab-${t.id}`} onClick={() => setTab(t.id)}
            style={{ padding: "10px 18px", background: "none", border: "none", cursor: "pointer", fontSize: 14, fontWeight: 600, color: tab === t.id ? "#a78bfa" : "#5c5c7a", borderBottom: tab === t.id ? "2px solid #7c3aed" : "2px solid transparent", marginBottom: -1, display: "flex", alignItems: "center", gap: 6 }}>
            {t.icon}{t.label}
          </button>
        ))}
      </div>

      {/* OVERVIEW */}
      {tab === "overview" && (
        <div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px,1fr))", gap: 16, marginBottom: 28 }}>
            <StatCard label="Total Sources" value={stats.totalSources} icon={<Globe className="w-5 h-5" />} color="#7c3aed" sub={`${sources.filter(s => s.is_active).length} active`} />
            <StatCard label="Total Notices" value={stats.totalNotices.toLocaleString()} icon={<FileText className="w-5 h-5" />} color="#6366f1" />
            <StatCard label="Alerts Sent" value={stats.alertsSent.toLocaleString()} icon={<Activity className="w-5 h-5" />} color="#a78bfa" sub="All channels" />
          </div>

          {/* Quick actions */}
          <div style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: 16, padding: 20 }}>
            <h3 style={{ fontSize: 15, fontWeight: 700, color: "#ffffff", marginBottom: 14 }}>⚡ Quick Actions</h3>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px,1fr))", gap: 12 }}>
              <button onClick={() => setTab("sources")} style={{ padding: "12px 16px", borderRadius: 10, background: "rgba(124,58,237,0.1)", border: "1px solid rgba(124,58,237,0.3)", color: "#a78bfa", fontSize: 13, fontWeight: 600, cursor: "pointer", textAlign: "left" }}>
                <Globe className="w-4 h-4" style={{ marginBottom: 6 }} />
                <div>Manage Sources</div>
                <div style={{ fontSize: 11, color: "#9090a8", marginTop: 2 }}>{sources.length} configured</div>
              </button>
              <button onClick={() => setTab("notices")} style={{ padding: "12px 16px", borderRadius: 10, background: "rgba(99,102,241,0.1)", border: "1px solid rgba(99,102,241,0.3)", color: "#818cf8", fontSize: 13, fontWeight: 600, cursor: "pointer", textAlign: "left" }}>
                <FileText className="w-4 h-4" style={{ marginBottom: 6 }} />
                <div>View Notices</div>
                <div style={{ fontSize: 11, color: "#9090a8", marginTop: 2 }}>{stats.totalNotices} total</div>
              </button>
              <button onClick={() => setTab("logs")} style={{ padding: "12px 16px", borderRadius: 10, background: "rgba(139,92,246,0.1)", border: "1px solid rgba(139,92,246,0.3)", color: "#a78bfa", fontSize: 13, fontWeight: 600, cursor: "pointer", textAlign: "left" }}>
                <Settings className="w-4 h-4" style={{ marginBottom: 6 }} />
                <div>View Logs</div>
                <div style={{ fontSize: 11, color: "#9090a8", marginTop: 2 }}>System activity</div>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SOURCES */}
      {tab === "sources" && (
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
            <div style={{ fontSize: 14, color: "#c4c4d4" }}>{sources.length} sources configured · {sources.filter(s => s.is_active).length} active</div>
            <button id="add-source-btn" onClick={() => setShowAddSource(!showAddSource)} className="btn-glow"
              style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 16px", borderRadius: 8, border: "none", color: "white", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
              <Plus className="w-4 h-4" /> Add Source
            </button>
          </div>

          {showAddSource && (
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
              style={{ background: "var(--bg-card)", border: "1px solid rgba(124,58,237,0.3)", borderRadius: 14, padding: 20, marginBottom: 20 }}>
              <h3 style={{ fontSize: 15, fontWeight: 700, color: "#ffffff", marginBottom: 16 }}>Add New Source</h3>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 12 }}>
                <input id="new-source-name" value={newSource.name} onChange={e => setNewSource({ ...newSource, name: e.target.value })} placeholder="Source Name *" className="input-dark" />
                <select value={newSource.type} onChange={e => setNewSource({ ...newSource, type: e.target.value })} className="input-dark">
                  <option value="government" style={{ background: "#12121e" }}>Government</option>
                  <option value="university" style={{ background: "#12121e" }}>University</option>
                  <option value="civic" style={{ background: "#12121e" }}>Civic</option>
                  <option value="news" style={{ background: "#12121e" }}>News</option>
                </select>
              </div>
              <input id="new-source-url" value={newSource.url} onChange={e => setNewSource({ ...newSource, url: e.target.value })} placeholder="https://example.com *" className="input-dark" style={{ marginBottom: 12 }} />
              <input id="new-source-category" value={newSource.category} onChange={e => setNewSource({ ...newSource, category: e.target.value })} placeholder="Category (optional)" className="input-dark" style={{ marginBottom: 14 }} />
              <div style={{ display: "flex", gap: 10 }}>
                <button id="save-source-btn" onClick={addSource} className="btn-glow" style={{ padding: "8px 20px", borderRadius: 8, border: "none", color: "white", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>Save</button>
                <button onClick={() => setShowAddSource(false)} style={{ padding: "8px 16px", borderRadius: 8, background: "rgba(255,255,255,0.04)", border: "1px solid var(--border)", color: "#9d9db5", fontSize: 13, cursor: "pointer" }}>Cancel</button>
              </div>
            </motion.div>
          )}

          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {sources.map((s, i) => (
              <motion.div key={s.id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
                style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: 12, padding: 16, display: "flex", alignItems: "center", gap: 14 }}>
                <span style={{ fontSize: 22, flexShrink: 0 }}>{s.logo || "🌐"}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 14, fontWeight: 700, color: "#ffffff" }}>{s.name}</div>
                  <div style={{ fontSize: 12, color: "#a0a0b8" }}>{s.type} · {s.notice_count} notices · {truncate(s.url, 50)}</div>
                </div>
                <span style={{ fontSize: 11, padding: "3px 9px", borderRadius: 20, background: s.is_active ? "rgba(16,185,129,0.1)" : "rgba(239,68,68,0.1)", color: s.is_active ? "#6ee7b7" : "#fca5a5", border: `1px solid ${s.is_active ? "rgba(16,185,129,0.3)" : "rgba(239,68,68,0.3)"}` }}>
                  {s.is_active ? "Active" : "Inactive"}
                </span>
                <button id={`toggle-source-${s.id}`} onClick={() => toggleSource(s.id)} style={{ background: "none", border: "none", cursor: "pointer", color: s.is_active ? "#10b981" : "#5c5c7a" }}>
                  {s.is_active ? <ToggleRight className="w-6 h-6" /> : <ToggleLeft className="w-6 h-6" />}
                </button>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* NOTICES */}
      {tab === "notices" && (
        <div>
          <div style={{ fontSize: 14, color: "#c4c4d4", marginBottom: 16 }}>{notices.length} notices loaded</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {notices.map((n, i) => (
              <motion.div key={n.id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
                style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: 12, padding: 16, display: "flex", alignItems: "center", gap: 14 }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", gap: 8, marginBottom: 4 }}>
                    <span style={{ fontSize: 11, padding: "2px 8px", borderRadius: 20, background: "rgba(124,58,237,0.1)", color: "#a78bfa" }}>{n.category}</span>
                    <span style={{ fontSize: 11, padding: "2px 8px", borderRadius: 20, background: n.urgency === "critical" ? "rgba(220,38,38,0.1)" : "rgba(245,158,11,0.1)", color: n.urgency === "critical" ? "#fca5a5" : "#fcd34d", textTransform: "capitalize" }}>{n.urgency}</span>
                  </div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: "#ffffff" }}>{truncate(n.title, 70)}</div>
                  <div style={{ fontSize: 11, color: "#a0a0b8" }}>{n.department} · {formatRelativeTime(n.created_at)} · {n.views.toLocaleString()} views</div>
                </div>
                <div style={{ display: "flex", gap: 8 }}>
                  <button onClick={() => window.open(`/dashboard/notices/${n.id}`, '_blank')} style={{ padding: "6px 12px", borderRadius: 8, background: "rgba(255,255,255,0.04)", border: "1px solid var(--border)", color: "#9d9db5", fontSize: 12, cursor: "pointer", display: "flex", alignItems: "center", gap: 4 }}>
                    <Eye className="w-3.5 h-3.5" /> View
                  </button>
                  <button onClick={() => deleteNotice(n.id)} style={{ padding: "6px 10px", borderRadius: 8, background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)", color: "#fca5a5", cursor: "pointer" }}>
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* LOGS */}
      {tab === "logs" && (
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <div style={{ fontSize: 14, color: "#c4c4d4" }}>Scraper execution logs · {logs.length} entries</div>
            <button onClick={loadData} style={{ display: "flex", alignItems: "center", gap: 6, padding: "7px 14px", borderRadius: 8, background: "rgba(255,255,255,0.04)", border: "1px solid var(--border)", color: "#9d9db5", fontSize: 13, cursor: "pointer" }}>
              <RefreshCw className="w-3.5 h-3.5" /> Refresh
            </button>
          </div>
          <div style={{ background: "#0a0a12", border: "1px solid var(--border)", borderRadius: 14, padding: 16, fontFamily: "monospace", fontSize: 13 }}>
            {logs.map(log => (
              <div key={log.id} style={{ display: "flex", gap: 12, padding: "8px 0", borderBottom: "1px solid rgba(255,255,255,0.03)" }}>
                <span style={{ color: "#a0a0b8", flexShrink: 0, fontSize: 11 }}>{formatRelativeTime(log.created_at)}</span>
                <span style={{ color: logColors[log.status] || "#6366f1", flexShrink: 0 }}>
                  {log.status === "success" ? "✓" : log.status === "failed" ? "✗" : "⚠"}
                </span>
                <span style={{ color: "#d0d0e0", flex: 1 }}>{log.message}</span>
                <span style={{ color: "#a0a0b8", fontSize: 11 }}>
                  {log.notices_new}/{log.notices_found} new
                </span>
              </div>
            ))}
            {logs.length === 0 && (
              <div style={{ textAlign: "center", padding: 20, color: "#a0a0b8" }}>No logs yet. Run the scraper to see activity.</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
