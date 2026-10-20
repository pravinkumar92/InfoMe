"use client";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import {
  FileText, Bell, Calendar, Bookmark, TrendingUp,
  Users, Globe, Zap, AlertTriangle, Clock, ChevronRight,
  Eye, Upload, Sparkles, CheckCircle, BarChart2, ArrowUpRight, Activity
} from "lucide-react";
import { formatRelativeTime, getDaysUntil, truncate } from "@/lib/utils";
import { getNotices, getDashboardStats, getUpcomingDeadlines, getSources } from "@/lib/api";
import { useTheme } from "@/lib/theme-context";
import { toast } from "sonner";
import AIUploadModal from "@/components/AIUploadModal";

const urgencyColors: Record<string, string> = {
  critical: "#dc2626", high: "#f59e0b", medium: "#6366f1", low: "#10b981",
};
const urgencyLabels: Record<string, string> = {
  critical: "🔴 Critical", high: "🟡 High", medium: "🔵 Medium", low: "🟢 Low",
};

/* ─── STAT CARD ─── */
function StatCard({ icon, label, value, sub, color, trend }: any) {
  return (
    <motion.div
      whileHover={{ y: -4, boxShadow: `0 12px 40px ${color}22` }}
      style={{
        background: "var(--bg-card)", border: "1px solid var(--border)",
        borderRadius: 20, padding: 22, position: "relative", overflow: "hidden",
        transition: "all 0.3s ease",
      }}
    >
      {/* Glow accent */}
      <div style={{
        position: "absolute", top: -40, right: -30, width: 120, height: 120,
        borderRadius: "50%", background: `${color}14`,
      }} />
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 14 }}>
        <div style={{
          width: 44, height: 44, borderRadius: 12,
          background: `${color}18`, display: "flex", alignItems: "center",
          justifyContent: "center", color,
        }}>
          {icon}
        </div>
        {trend && (
          <div style={{
            display: "flex", alignItems: "center", gap: 4,
            fontSize: 11, color: "#10b981", fontWeight: 700,
            background: "rgba(16,185,129,0.10)", padding: "3px 8px", borderRadius: 20,
          }}>
            <ArrowUpRight className="w-3 h-3" /> {trend}
          </div>
        )}
      </div>
      <div style={{ fontSize: 28, fontWeight: 900, color: "var(--text-primary)", fontFamily: "'Manrope', sans-serif", marginBottom: 4 }}>{value}</div>
      <div style={{ fontSize: 13, color: "var(--text-secondary)" }}>{label}</div>
      {sub && <div style={{ fontSize: 11, color, marginTop: 6, fontWeight: 600 }}>{sub}</div>}
    </motion.div>
  );
}

/* ─── NOTICE CARD ─── */
function NoticeCard({ notice }: { notice: any }) {
  const daysLeft = notice.last_date ? getDaysUntil(notice.last_date) : null;
  const urgencyColor = urgencyColors[notice.urgency] || "#6366f1";
  return (
    <Link href={`/dashboard/notices/${notice.id}`} style={{ textDecoration: "none" }}>
      <motion.div
        whileHover={{ y: -3, boxShadow: "0 12px 40px rgba(0,0,0,0.2), 0 0 24px var(--accent-glow)" }}
        style={{
          background: "var(--bg-card)", border: "1px solid var(--border)",
          borderRadius: 16, padding: 18, cursor: "pointer",
          borderLeft: `3px solid ${urgencyColor}`,
          transition: "all 0.25s ease",
        }}
      >
        <div style={{ display: "flex", alignItems: "flex-start", gap: 12, marginBottom: 10 }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8, flexWrap: "wrap" }}>
              <span style={{
                fontSize: 11, fontWeight: 700, padding: "2px 9px", borderRadius: 20,
                background: "rgba(124,58,237,0.12)", color: "var(--accent-light)",
                border: "1px solid rgba(124,58,237,0.25)",
              }}>{notice.category}</span>
              <span className={`badge-${notice.urgency}`} style={{
                fontSize: 11, fontWeight: 700, padding: "2px 9px", borderRadius: 20,
              }}>{urgencyLabels[notice.urgency]}</span>
              {notice.urgency === "critical" && (
                <span className="pulse-critical" style={{ width: 7, height: 7, borderRadius: "50%", background: "#dc2626", display: "inline-block" }} />
              )}
            </div>
            <h3 style={{ fontSize: 14, fontWeight: 700, color: "var(--text-primary)", lineHeight: 1.45, marginBottom: 4 }}>
              {truncate(notice.title, 80)}
            </h3>
            <div style={{ fontSize: 11, color: "var(--text-muted)" }}>
              {notice.department} · {formatRelativeTime(notice.created_at)}
            </div>
          </div>
        </div>
        {notice.summary && (
          <p style={{ fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.6, marginBottom: 12 }}>
            {truncate(notice.summary, 120)}
          </p>
        )}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            {daysLeft !== null && (
              <span style={{ fontSize: 12, color: daysLeft <= 7 ? "#ef4444" : daysLeft <= 14 ? "#f59e0b" : "#10b981", fontWeight: 700, display: "flex", alignItems: "center", gap: 4 }}>
                <Clock className="w-3 h-3" />
                {daysLeft > 0 ? `${daysLeft}d left` : "Expired"}
              </span>
            )}
            {notice.amount && <span style={{ fontSize: 12, color: "#fbbf24", fontWeight: 700 }}>💰 {notice.amount}</span>}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 11, color: "var(--text-muted)" }}>
            <Eye className="w-3 h-3" /> {notice.views?.toLocaleString()}
          </div>
        </div>
      </motion.div>
    </Link>
  );
}

/* ─── BAR CHART (mini) ─── */
function MiniBarChart({ data = [40, 65, 50, 80, 60, 90, 75] }: { data?: number[] }) {
  const max = Math.max(...data);
  return (
    <div style={{ display: "flex", alignItems: "flex-end", gap: 5, height: 64 }}>
      {data.map((v, i) => (
        <motion.div
          key={i}
          initial={{ height: 0 }} animate={{ height: `${(v / max) * 100}%` }}
          transition={{ delay: i * 0.07, duration: 0.5 }}
          whileHover={{ background: "var(--accent)" }}
          style={{
            flex: 1, borderRadius: "4px 4px 0 0",
            background: i === data.length - 2
              ? "linear-gradient(180deg, #7c3aed, #6366f1)"
              : "var(--bg-card-hover)",
            cursor: "pointer", transition: "background 0.2s ease",
            border: "1px solid var(--border)",
          }}
        />
      ))}
    </div>
  );
}

/* ─── AI PROCESSING CARD ─── */
function AIProcessingCard({ isDark }: { isDark: boolean }) {
  const [progress, setProgress] = useState({ text: 74, entities: 48 });
  useEffect(() => {
    const t = setInterval(() => {
      setProgress(p => ({
        text: Math.min(100, p.text + Math.random() * 2),
        entities: Math.min(100, p.entities + Math.random() * 3),
      }));
    }, 800);
    return () => clearInterval(t);
  }, []);

  return (
    <div style={{
      background: "linear-gradient(135deg, #1e0a3c 0%, #0f0f2d 100%)",
      borderRadius: 20, padding: 24, position: "relative", overflow: "hidden",
      boxShadow: "0 8px 32px rgba(124,58,237,0.25)",
    }}>
      {/* Bg glow */}
      <div style={{ position: "absolute", right: 0, bottom: 0, opacity: 0.07 }}>
        <Sparkles style={{ width: 140, height: 140, color: "#a78bfa" }} />
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16, position: "relative", zIndex: 1 }}>
        <Sparkles className="w-4 h-4" style={{ color: "#a78bfa" }} />
        <span style={{ fontSize: 10, fontWeight: 800, textTransform: "uppercase", letterSpacing: 2, color: "#c4b5fd" }}>AI Intelligence Engine</span>
      </div>
      <h4 style={{ fontSize: 15, fontWeight: 700, color: "white", marginBottom: 20, lineHeight: 1.4, position: "relative", zIndex: 1, fontFamily: "'Manrope', sans-serif" }}>
        Analyzing "Legal Notice #402" for compliance risks...
      </h4>

      <div style={{ display: "flex", flexDirection: "column", gap: 12, position: "relative", zIndex: 1 }}>
        {[
          { label: "TEXT SCAN", value: Math.round(progress.text) },
          { label: "ENTITIES", value: Math.round(progress.entities) },
        ].map((item) => (
          <div key={item.label}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
              <span style={{ fontSize: 10, fontWeight: 800, color: "#a78bfa", letterSpacing: 1 }}>{item.label}</span>
              <span style={{ fontSize: 10, fontWeight: 800, color: "white" }}>{item.value}%</span>
            </div>
            <div style={{ height: 5, background: "rgba(255,255,255,0.1)", borderRadius: 99, overflow: "hidden" }}>
              <motion.div
                animate={{ width: `${item.value}%` }}
                transition={{ duration: 0.5 }}
                style={{ height: "100%", background: "linear-gradient(90deg, #a78bfa, #7c3aed)", borderRadius: 99 }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─── UPLOAD CARD ─── */
function UploadCard() {
  const [hovered, setHovered] = useState(false);
  const [showModal, setShowModal] = useState(false);
  
  return (
    <>
      <motion.div
        onClick={() => setShowModal(true)}
        onHoverStart={() => setHovered(true)}
        onHoverEnd={() => setHovered(false)}
        style={{
          background: "var(--bg-card)", border: `2px dashed ${hovered ? "var(--accent)" : "var(--border)"}`,
          borderRadius: 20, padding: 28,
          display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
          textAlign: "center", cursor: "pointer", transition: "all 0.3s ease",
          minHeight: 220,
          boxShadow: hovered ? "0 0 32px var(--accent-glow)" : "none",
        }}
      >
        <motion.div
          animate={{ y: hovered ? -8 : 0 }}
          style={{
            width: 64, height: 64, borderRadius: 18,
            background: hovered ? "linear-gradient(135deg,#7c3aed,#6366f1)" : "var(--bg-card-hover)",
            display: "flex", alignItems: "center", justifyContent: "center",
            marginBottom: 16, transition: "all 0.3s ease",
            boxShadow: hovered ? "0 8px 24px rgba(124,58,237,0.40)" : "none",
          }}
        >
          <Upload className="w-7 h-7" style={{ color: hovered ? "white" : "var(--accent-light)" }} />
        </motion.div>
        <h3 style={{ fontSize: 16, fontWeight: 700, color: "var(--text-primary)", marginBottom: 6, fontFamily: "'Manrope', sans-serif" }}>
          AI-Powered Upload
        </h3>
        <p style={{ fontSize: 13, color: "var(--text-secondary)", maxWidth: 220, lineHeight: 1.5, marginBottom: 16 }}>
          Drop PDF, images, or text for instant AI analysis
        </p>

        {/* Upload progress bar */}
        <div style={{ width: "100%", maxWidth: 260, background: "var(--bg-card-hover)", borderRadius: 12, padding: 12, border: "1px solid var(--border)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
            <span style={{ fontSize: 10, fontWeight: 700, color: "var(--text-muted)" }}>Ready for upload</span>
            <span style={{ fontSize: 10, fontWeight: 700, color: "var(--accent-light)" }}>✨ AI</span>
          </div>
          <div style={{ height: 4, background: "var(--border)", borderRadius: 99, overflow: "hidden" }}>
            <motion.div
              initial={{ width: "0%" }} animate={{ width: "0%" }}
              style={{ height: "100%", background: "linear-gradient(90deg, #7c3aed, #6366f1)", borderRadius: 99 }}
            />
          </div>
        </div>
      </motion.div>
      
      <AIUploadModal isOpen={showModal} onClose={() => setShowModal(false)} />
    </>
  );
}

/* ─── DEADLINE TIMELINE ─── */
const timelineItems = [
  { date: "OCT 12", label: "Past Event", sub: "", active: false, past: true },
  { date: "TODAY", label: "Tax Compliance", sub: "4 notices pending", active: true, past: false },
  { date: "OCT 28", label: "Audit Filing", sub: "", active: false, past: false },
  { date: "NOV 04", label: "Lease Renewal", sub: "", active: false, past: false },
];

/* ─── MOCK RECENT NOTICES ─── */
const mockNotices = [
  {
    id: "1", category: "Tax", urgency: "critical", title: "Tax Audit Requirement 2024",
    summary: "Urgent submission of financial statements for the previous fiscal quarter required by end of week.",
    department: "Income Tax Dept", created_at: new Date(Date.now() - 3600000).toISOString(),
    last_date: new Date(Date.now() + 2 * 86400000).toISOString(), views: 1240, amount: null,
  },
  {
    id: "2", category: "Legal", urgency: "medium", title: "Privacy Policy Amendment",
    summary: "Updated terms regarding data processing in the EU region. AI analysis suggests 3 key changes.",
    department: "Legal Dept", created_at: new Date(Date.now() - 7200000).toISOString(),
    last_date: new Date(Date.now() + 12 * 86400000).toISOString(), views: 842, amount: null,
  },
  {
    id: "3", category: "Business", urgency: "low", title: "Office Lease Renewal",
    summary: "Standard renewal notice for Headquarters Block C. No significant price change detected.",
    department: "Admin Dept", created_at: new Date(Date.now() - 86400000).toISOString(),
    last_date: new Date(Date.now() + 45 * 86400000).toISOString(), views: 320, amount: null,
  },
];

/* ─── MAIN DASHBOARD ─── */
export default function DashboardHome() {
  const { isDark } = useTheme();
  const [notices, setNotices] = useState<any[]>([]);
  const [stats, setStats] = useState({ totalNotices: 0, totalSources: 0, alertsSent: 0 });
  const [deadlines, setDeadlines] = useState<any[]>([]);
  const [sources, setSources] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState("All");

  useEffect(() => {
    async function loadData() {
      try {
        const [noticesData, statsData, deadlinesData, sourcesData] = await Promise.all([
          getNotices({ limit: 5 }),
          getDashboardStats(),
          getUpcomingDeadlines(4),
          getSources(),
        ]);
        setNotices(noticesData?.length ? noticesData : mockNotices);
        setStats(statsData);
        setDeadlines(deadlinesData || []);
        setSources((sourcesData || []).slice(0, 5));
      } catch {
        setNotices(mockNotices);
        setStats({ totalNotices: 1247, totalSources: 58, alertsSent: 24600 });
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const urgentNotices = notices.filter(n => n.urgency === "critical" || n.urgency === "high");
  const textPrimary = "var(--text-primary)";
  const textSecondary = "var(--text-secondary)";
  const textMuted = "var(--text-muted)";
  const border = "var(--border)";
  const bgCard = "var(--bg-card)";
  const accentColor = isDark ? "#a78bfa" : "#4338ca";

  if (loading) {
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 12, padding: "20px 0" }}>
        <div className="shimmer" style={{ height: 80, borderRadius: 16 }} />
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }}>
          {[1, 2, 3].map(i => <div key={i} className="shimmer" style={{ height: 120, borderRadius: 16 }} />)}
        </div>
        <div className="shimmer" style={{ height: 320, borderRadius: 20 }} />
      </div>
    );
  }

  return (
    <div>

      {/* ─── HEADER ─── */}
      <motion.div
        initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }}
        style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginBottom: 24, flexWrap: "wrap", gap: 16 }}
      >
        <div>
          <h1 style={{ fontSize: 30, fontWeight: 900, color: textPrimary, fontFamily: "'Manrope', sans-serif", marginBottom: 4 }}>
            Intelligence Dashboard
          </h1>
          <p style={{ fontSize: 14, color: textSecondary }}>
            Tracking notices for <span style={{ color: accentColor, fontWeight: 600 }}>Uttar Pradesh</span> · Last updated 2 minutes ago
          </p>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{
            display: "flex", alignItems: "center", gap: 8,
            padding: "8px 14px", borderRadius: 12,
            background: bgCard, border: `1px solid ${border}`,
          }}>
            <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#10b981", boxShadow: "0 0 8px #10b981" }} />
            <span style={{ fontSize: 11, fontWeight: 800, color: "#10b981", textTransform: "uppercase", letterSpacing: 1 }}>System Online</span>
          </div>
          
          <Link href="/dashboard/live-scraping">
            <motion.button
              whileHover={{ scale: 1.05, boxShadow: "0 8px 32px rgba(16,185,129,0.4)" }}
              whileTap={{ scale: 0.95 }}
              style={{
                padding: "10px 20px",
                borderRadius: 12,
                background: "linear-gradient(135deg, #10b981, #059669)",
                border: "none",
                color: "white",
                fontSize: 13,
                fontWeight: 700,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: 8,
                boxShadow: "0 4px 16px rgba(16,185,129,0.3)"
              }}
            >
              <Activity className="w-4 h-4" />
              Live Scraping
              <motion.span
                animate={{ scale: [1, 1.3, 1] }}
                transition={{ repeat: Infinity, duration: 1.5 }}
                style={{
                  width: 6,
                  height: 6,
                  borderRadius: "50%",
                  background: "white"
                }}
              />
            </motion.button>
          </Link>
        </div>
      </motion.div>

      {/* ─── CRITICAL ALERT BANNER ─── */}
      {urgentNotices.filter(n => n.urgency === "critical").length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
          style={{
            background: "rgba(220,38,38,0.08)", border: "1px solid rgba(220,38,38,0.30)",
            borderRadius: 14, padding: "14px 18px", marginBottom: 24,
            display: "flex", alignItems: "center", gap: 12,
          }}
        >
          <AlertTriangle className="w-5 h-5" style={{ color: "#ef4444", flexShrink: 0 }} />
          <span style={{ fontSize: 14, fontWeight: 700, color: "#fca5a5", flex: 1 }}>
            🚨 Critical Alert: {urgentNotices.filter(n => n.urgency === "critical")[0].title}
          </span>
          <Link href="/dashboard/notices" style={{ fontSize: 13, color: "#ef4444", textDecoration: "none", fontWeight: 700 }}>
            View →
          </Link>
        </motion.div>
      )}

      {/* ─── STATS ROW ─── */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 20, marginBottom: 32 }}>
        <StatCard icon={<FileText className="w-5 h-5" />} label="Total Notices" value={stats.totalNotices.toLocaleString() || "1,247"} color="#7c3aed" trend="+12%" />
        <StatCard icon={<Bell className="w-5 h-5" />} label="Alerts Sent" value={stats.alertsSent.toLocaleString() || "24,600"} sub="Across all channels" color="#6366f1" trend="+8%" />
        <StatCard icon={<Globe className="w-5 h-5" />} label="Sources Tracked" value={stats.totalSources || "58"} sub="Verified sources" color="#a78bfa" />
        <StatCard icon={<Activity className="w-5 h-5" />} label="AI Accuracy" value="99.2%" sub="Last 30 days" color="#10b981" trend="+0.3%" />
      </div>

      {/* ─── CATEGORY STATS ─── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
        style={{ marginBottom: 32 }}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
          <h3 style={{ fontSize: 17, fontWeight: 700, color: textPrimary, fontFamily: "'Manrope', sans-serif" }}>Latest Notices</h3>
          <Link href="/dashboard/notices" style={{
            display: "flex", alignItems: "center", gap: 4,
            fontSize: 13, color: accentColor, textDecoration: "none", fontWeight: 600,
          }}>
            View All <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: 16 }}>
          {[
            { icon: "🎓", label: "Scholarships", value: "312", color: "#f59e0b" },
            { icon: "💼", label: "Jobs", value: "285", color: "#8b5cf6" },
            { icon: "📄", label: "Exams", value: "198", color: "#6366f1" },
            { icon: "🎯", label: "Results", value: "167", color: "#ec4899" },
            { icon: "🎓", label: "Admissions", value: "142", color: "#14b8a6" },
            { icon: "🚨", label: "Civic Alerts", value: "54", color: "#ef4444" },
          ].map((cat, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 + i * 0.05 }}
              whileHover={{ y: -4, boxShadow: `0 8px 24px ${cat.color}20` }}
              style={{
                background: bgCard,
                border: `1px solid ${border}`,
                borderRadius: 16,
                padding: "18px 16px",
                textAlign: "center",
                cursor: "pointer",
                transition: "all 0.3s ease",
                position: "relative",
                overflow: "hidden",
              }}
            >
              <div style={{
                position: "absolute",
                top: -20,
                right: -20,
                width: 80,
                height: 80,
                borderRadius: "50%",
                background: `${cat.color}10`,
              }} />
              <div style={{ fontSize: 32, marginBottom: 8, position: "relative", zIndex: 1 }}>{cat.icon}</div>
              <div style={{ fontSize: 24, fontWeight: 900, color: textPrimary, marginBottom: 4, fontFamily: "'Manrope', sans-serif", position: "relative", zIndex: 1 }}>
                {cat.value}
              </div>
              <div style={{ fontSize: 12, color: textSecondary, fontWeight: 600, position: "relative", zIndex: 1 }}>{cat.label}</div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* ─── TOP BENTO ROW: Upload + AI Engine ─── */}
      <div className="dashboard-upload-row" style={{ display: "grid", gridTemplateColumns: "1fr", gap: 24, marginBottom: 32 }}>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <UploadCard />
        </motion.div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 20 }}>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
            <AIProcessingCard isDark={isDark} />
          </motion.div>
          {/* Efficiency Chart */}
          <motion.div
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
            style={{ background: bgCard, border: `1px solid ${border}`, borderRadius: 20, padding: 20 }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
              <div>
                <div style={{ fontSize: 14, fontWeight: 700, color: textPrimary, fontFamily: "'Manrope', sans-serif" }}>System Efficiency</div>
                <div style={{ fontSize: 11, color: textMuted }}>Last 24 hours</div>
              </div>
              <TrendingUp className="w-4 h-4" style={{ color: accentColor }} />
            </div>
            <MiniBarChart data={[40, 55, 48, 72, 60, 88, 75]} />
          </motion.div>
        </div>
      </div>

      {/* ─── UPCOMING DEADLINES ─── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}
        style={{ background: bgCard, border: `1px solid ${border}`, borderRadius: 20, padding: 24, marginBottom: 32 }}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
          <h3 style={{ fontSize: 16, fontWeight: 700, color: textPrimary, display: "flex", alignItems: "center", gap: 8, fontFamily: "'Manrope', sans-serif" }}>
            <Calendar className="w-5 h-5" style={{ color: accentColor }} /> Upcoming Deadlines
          </h3>
          <Link href="/dashboard/deadlines" style={{
            display: "flex", alignItems: "center", gap: 4,
            fontSize: 13, color: accentColor, textDecoration: "none", fontWeight: 600,
          }}>
            View all <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Deadlines Grid */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 16 }}>
          {deadlines.length > 0 ? deadlines.map((d, index) => {
            const dl = getDaysUntil(d.deadline);
            const isUrgent = dl <= 7;
            const isWarning = dl > 7 && dl <= 14;
            const urgencyColor = isUrgent ? "#ef4444" : isWarning ? "#f59e0b" : "#10b981";
            
            return (
              <motion.div
                key={d.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                whileHover={{ y: -4, boxShadow: `0 8px 24px ${urgencyColor}20` }}
                style={{
                  background: "var(--bg-card-hover)",
                  border: `1px solid ${isUrgent ? "rgba(239,68,68,0.3)" : isWarning ? "rgba(245,158,11,0.3)" : border}`,
                  borderRadius: 14,
                  padding: "16px 18px",
                  borderLeft: `4px solid ${urgencyColor}`,
                  cursor: "pointer",
                  transition: "all 0.3s ease",
                }}
              >
                <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 10 }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <h4 style={{
                      fontSize: 14,
                      fontWeight: 700,
                      color: textPrimary,
                      marginBottom: 6,
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}>
                      {d.notices?.title || "Notice"}
                    </h4>
                    <div style={{ fontSize: 11, color: textMuted, marginBottom: 8 }}>
                      {d.notices?.department || "Department"}
                    </div>
                  </div>
                  {isUrgent && (
                    <div className="pulse-critical" style={{
                      width: 8,
                      height: 8,
                      borderRadius: "50%",
                      background: urgencyColor,
                      flexShrink: 0,
                      marginLeft: 8,
                    }} />
                  )}
                </div>
                
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <div style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                    fontSize: 13,
                    fontWeight: 700,
                    color: urgencyColor,
                  }}>
                    <Clock className="w-4 h-4" />
                    {dl > 0 ? `${dl} day${dl !== 1 ? 's' : ''} left` : "Expired"}
                  </div>
                  <div style={{
                    fontSize: 10,
                    fontWeight: 700,
                    padding: "4px 10px",
                    borderRadius: 20,
                    background: `${urgencyColor}15`,
                    color: urgencyColor,
                    textTransform: "uppercase",
                    letterSpacing: 0.5,
                  }}>
                    {isUrgent ? "Urgent" : isWarning ? "Soon" : "Upcoming"}
                  </div>
                </div>
              </motion.div>
            );
          }) : (
            // Mock data if no deadlines from database
            [
              { id: 1, title: "AKTU B.Tech Exam Schedule 2026 – Even Semester", department: "AKTU Lucknow", days: 2, color: "#ef4444", urgent: true },
              { id: 2, title: "Tax Audit Submission Deadline", department: "Income Tax Department", days: 5, color: "#ef4444", urgent: true },
              { id: 3, title: "Audit Filing Requirement", department: "Finance Ministry", days: 10, color: "#f59e0b", urgent: false },
              { id: 4, title: "Office Lease Renewal Notice", department: "Admin Department", days: 45, color: "#10b981", urgent: false },
            ].map((d, index) => (
              <motion.div
                key={d.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                whileHover={{ y: -4, boxShadow: `0 8px 24px ${d.color}20` }}
                style={{
                  background: "var(--bg-card-hover)",
                  border: `1px solid ${d.urgent ? "rgba(239,68,68,0.3)" : d.days <= 14 ? "rgba(245,158,11,0.3)" : border}`,
                  borderRadius: 14,
                  padding: "16px 18px",
                  borderLeft: `4px solid ${d.color}`,
                  cursor: "pointer",
                  transition: "all 0.3s ease",
                }}
              >
                <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 10 }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <h4 style={{
                      fontSize: 14,
                      fontWeight: 700,
                      color: textPrimary,
                      marginBottom: 6,
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      display: "-webkit-box",
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: "vertical",
                    }}>
                      {d.title}
                    </h4>
                    <div style={{ fontSize: 11, color: textMuted, marginBottom: 8 }}>
                      {d.department}
                    </div>
                  </div>
                  {d.urgent && (
                    <div className="pulse-critical" style={{
                      width: 8,
                      height: 8,
                      borderRadius: "50%",
                      background: d.color,
                      flexShrink: 0,
                      marginLeft: 8,
                    }} />
                  )}
                </div>
                
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <div style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                    fontSize: 13,
                    fontWeight: 700,
                    color: d.color,
                  }}>
                    <Clock className="w-4 h-4" />
                    {d.days} day{d.days !== 1 ? 's' : ''} left
                  </div>
                  <div style={{
                    fontSize: 10,
                    fontWeight: 700,
                    padding: "4px 10px",
                    borderRadius: 20,
                    background: `${d.color}15`,
                    color: d.color,
                    textTransform: "uppercase",
                    letterSpacing: 0.5,
                  }}>
                    {d.urgent ? "Urgent" : d.days <= 14 ? "Soon" : "Upcoming"}
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </div>
      </motion.div>

      {/* ─── RECENT NOTICES GRID ─── */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
          <h3 style={{ fontSize: 17, fontWeight: 700, color: textPrimary, fontFamily: "'Manrope', sans-serif" }}>Recent Notices</h3>
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            {["All", "Urgent", "Drafts"].map(f => (
              <button
                key={f}
                onClick={() => setActiveFilter(f)}
                style={{
                  padding: "5px 14px", borderRadius: 20, fontSize: 12, fontWeight: 700, cursor: "pointer",
                  background: activeFilter === f ? "rgba(124,58,237,0.15)" : bgCard,
                  color: activeFilter === f ? accentColor : textMuted,
                  border: `1px solid ${activeFilter === f ? accentColor + "50" : border}`,
                  transition: "all 0.2s ease",
                }}
              >{f}</button>
            ))}
            <Link href="/dashboard/notices" style={{
              display: "flex", alignItems: "center", gap: 4,
              fontSize: 13, color: accentColor, textDecoration: "none", fontWeight: 600,
            }}>
              View All <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* 2-column grid for notices + right panel */}
        <div className="dashboard-notices-grid" style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: 24 }}>
          {/* Notices - Left Column */}
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {notices.map(n => <NoticeCard key={n.id} notice={n} />)}
          </div>

          {/* Right Panel - Sidebar */}
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            {/* Upcoming Deadlines */}
            <div style={{ background: bgCard, border: `1px solid ${border}`, borderRadius: 16, padding: 18 }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
                <h4 style={{ fontSize: 14, fontWeight: 700, color: textPrimary, display: "flex", alignItems: "center", gap: 6, fontFamily: "'Manrope', sans-serif" }}>
                  <Calendar className="w-4 h-4" style={{ color: accentColor }} /> Upcoming Deadlines
                </h4>
                <Link href="/dashboard/deadlines" style={{ fontSize: 11, color: accentColor, textDecoration: "none", fontWeight: 600 }}>View all</Link>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {deadlines.length > 0 ? deadlines.map(d => {
                  const dl = getDaysUntil(d.deadline);
                  return (
                    <div key={d.id} className={dl <= 7 ? "deadline-urgent" : dl <= 14 ? "deadline-warn" : "deadline-ok"}
                      style={{ padding: "10px 12px 10px 14px", borderRadius: 8, background: "rgba(255,255,255,0.02)" }}>
                      <div style={{ fontSize: 13, fontWeight: 600, color: textPrimary, marginBottom: 2 }}>{truncate(d.notices?.title || "Notice", 40)}</div>
                      <div style={{ fontSize: 11, color: dl <= 7 ? "#ef4444" : dl <= 14 ? "#f59e0b" : "#10b981", fontWeight: 700 }}>
                        {dl > 0 ? `${dl} days left` : "Expired"}
                      </div>
                    </div>
                  );
                }) : (
                  [{ title: "Tax Audit Submission", days: 2, color: "#ef4444" },
                   { title: "Audit Filing Deadline", days: 10, color: "#f59e0b" },
                   { title: "Lease Renewal", days: 45, color: "#10b981" }].map((d, i) => (
                    <div key={i} className={d.days <= 7 ? "deadline-urgent" : d.days <= 14 ? "deadline-warn" : "deadline-ok"}
                      style={{ padding: "10px 12px 10px 14px", borderRadius: 8, background: isDark ? "rgba(255,255,255,0.02)" : "rgba(0,0,0,0.02)" }}>
                      <div style={{ fontSize: 13, fontWeight: 600, color: textPrimary, marginBottom: 2 }}>{d.title}</div>
                      <div style={{ fontSize: 11, color: d.color, fontWeight: 700 }}>{d.days} days left</div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Recent Alerts */}
            <div style={{ background: bgCard, border: `1px solid ${border}`, borderRadius: 16, padding: 18 }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
                <h4 style={{ fontSize: 14, fontWeight: 700, color: textPrimary, display: "flex", alignItems: "center", gap: 6, fontFamily: "'Manrope', sans-serif" }}>
                  <Zap className="w-4 h-4" style={{ color: accentColor }} /> Recent Alerts
                </h4>
                <Link href="/dashboard/alerts" style={{ fontSize: 11, color: accentColor, textDecoration: "none", fontWeight: 600 }}>View all</Link>
              </div>
              {[
                { icon: "🎓", text: "AKTU Exam Schedule", time: "2m ago", color: "#f59e0b" },
                { icon: "💼", text: "UPPSC Vacancy Open", time: "15m ago", color: "#a78bfa" },
                { icon: "🏆", text: "PM Scholarship Live", time: "1h ago", color: "#10b981" },
              ].map((a, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 0", borderBottom: i < 2 ? `1px solid ${border}` : "none" }}>
                  <span style={{ fontSize: 18 }}>{a.icon}</span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 12, fontWeight: 600, color: textPrimary, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{a.text}</div>
                  </div>
                  <span style={{ fontSize: 10, color: textMuted, whiteSpace: "nowrap" }}>{a.time}</span>
                </div>
              ))}
            </div>

            {/* Top Sources */}
            {sources.length > 0 && (
              <div style={{ background: bgCard, border: `1px solid ${border}`, borderRadius: 16, padding: 18 }}>
                <h4 style={{ fontSize: 14, fontWeight: 700, color: textPrimary, marginBottom: 14, display: "flex", alignItems: "center", gap: 6, fontFamily: "'Manrope', sans-serif" }}>
                  <Globe className="w-4 h-4" style={{ color: accentColor }} /> Top Sources
                </h4>
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {sources.map(s => (
                    <div key={s.id} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <span style={{ fontSize: 18, flexShrink: 0 }}>{s.logo || "🌐"}</span>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 13, fontWeight: 500, color: textPrimary, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{s.name}</div>
                        <div style={{ fontSize: 11, color: textMuted }}>{s.type}</div>
                      </div>
                      <span style={{ fontSize: 12, color: accentColor, fontWeight: 700 }}>{s.notice_count}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </motion.div>

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes pulse-dot {
          0%, 100% { box-shadow: 0 0 0 0 rgba(124,58,237,0.5); }
          50% { box-shadow: 0 0 0 8px rgba(124,58,237,0); }
        }
        
        @media (max-width: 1024px) {
          .dashboard-notices-grid {
            grid-template-columns: 1fr !important;
          }
          .dashboard-upload-row {
            grid-template-columns: 1fr !important;
          }
        }
      `}} />
    </div>
  );
}
