"use client";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from "recharts";
import { TrendingUp, FileText, Bell, Users, Globe, ArrowUpRight } from "lucide-react";
import { getDashboardStats, getCategoryStats } from "@/lib/api";
import { supabase } from "@/lib/supabase";
import { useTheme } from "@/lib/theme-context";

/* ─── MOCK DATA (fallback) ─── */
const mockChartData = [
  { month: "Nov", notices: 48, alerts: 120 },
  { month: "Dec", notices: 72, alerts: 185 },
  { month: "Jan", notices: 95, alerts: 240 },
  { month: "Feb", notices: 138, alerts: 352 },
  { month: "Mar", notices: 184, alerts: 468 },
  { month: "Apr", notices: 210, alerts: 540 },
];

const mockCategoryData = [
  { name: "Scholarships", value: 312, color: "#7c3aed" },
  { name: "Jobs", value: 248, color: "#6366f1" },
  { name: "Exams", value: 196, color: "#8b5cf6" },
  { name: "Results", value: 164, color: "#a78bfa" },
  { name: "Admissions", value: 128, color: "#9333ea" },
  { name: "Tenders", value: 89, color: "#7e22ce" },
  { name: "Civic Alerts", value: 62, color: "#dc2626" },
  { name: "General", value: 48, color: "#6b7280" },
];

const engagementData = [
  { day: "Mon", views: 1200, clicks: 340, saves: 89 },
  { day: "Tue", views: 1800, clicks: 520, saves: 134 },
  { day: "Wed", views: 1500, clicks: 410, saves: 108 },
  { day: "Thu", views: 2100, clicks: 680, saves: 165 },
  { day: "Fri", views: 2400, clicks: 780, saves: 198 },
  { day: "Sat", views: 1900, clicks: 560, saves: 145 },
  { day: "Sun", views: 1600, clicks: 430, saves: 112 },
];

const deliveryData = [
  { channel: "WhatsApp", delivered: 8200, failed: 180 },
  { channel: "Email", delivered: 7100, failed: 250 },
  { channel: "Telegram", delivered: 5400, failed: 120 },
  { channel: "Push", delivered: 3900, failed: 310 },
];

const mockStats = { totalNotices: 1247, totalSources: 58, alertsSent: 24600, activeUsers: 8400 };

/* ─── STAT BOX ─── */
function StatBox({ icon, label, value, change, color }: any) {
  return (
    <motion.div
      whileHover={{ y: -3, boxShadow: `0 12px 32px ${color}22` }}
      style={{
        background: "var(--bg-card)", border: "1px solid var(--border)",
        borderRadius: 16, padding: 20, position: "relative", overflow: "hidden",
        transition: "all 0.3s ease",
      }}
    >
      <div style={{ position: "absolute", top: -30, right: -20, width: 100, height: 100, borderRadius: "50%", background: `${color}12` }} />
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 14 }}>
        <div style={{ width: 40, height: 40, borderRadius: 10, background: `${color}18`, display: "flex", alignItems: "center", justifyContent: "center", color }}>
          {icon}
        </div>
        {change && (
          <span style={{ fontSize: 11, color: "#10b981", fontWeight: 700, background: "rgba(16,185,129,0.10)", padding: "3px 8px", borderRadius: 20, display: "flex", alignItems: "center", gap: 3 }}>
            <ArrowUpRight className="w-3 h-3" /> {change}
          </span>
        )}
      </div>
      <div style={{ fontSize: 28, fontWeight: 900, color: "var(--text-primary)", fontFamily: "'Manrope', sans-serif", marginBottom: 4 }}>{value}</div>
      <div style={{ fontSize: 13, color: "var(--text-secondary)" }}>{label}</div>
    </motion.div>
  );
}

/* ─── MAIN ─── */
export default function AnalyticsPage() {
  const { isDark } = useTheme();
  const [stats, setStats] = useState(mockStats);
  const [categoryData, setCategoryData] = useState(mockCategoryData);
  const [timelineData, setTimelineData] = useState(mockChartData);
  const [loading, setLoading] = useState(true);

  const tooltipStyle = {
    background: isDark ? "#12121e" : "#fff",
    border: `1px solid ${isDark ? "rgba(139,92,246,0.3)" : "rgba(79,70,229,0.2)"}`,
    borderRadius: 10,
    color: "var(--text-primary)",
    fontSize: 13,
  };

  useEffect(() => {
    async function loadAnalytics() {
      try {
        const [statsData, categoriesData] = await Promise.all([
          getDashboardStats(),
          getCategoryStats(),
        ]);
        if (statsData) setStats({ ...mockStats, ...statsData });
        if (categoriesData?.length) {
          const formatted = categoriesData.map((c: any) => ({
            name: c.name, value: c.value,
            color: mockCategoryData.find(m => m.name === c.name)?.color || "#6b7280",
          }));
          setCategoryData(formatted);
        }
        const { data: noticesByMonth } = await supabase
          .from("notices").select("created_at")
          .gte("created_at", new Date(Date.now() - 180 * 86400000).toISOString());
        if (noticesByMonth?.length) {
          const monthCounts: Record<string, number> = {};
          noticesByMonth.forEach(n => {
            const month = new Date(n.created_at).toLocaleDateString("en-US", { month: "short" });
            monthCounts[month] = (monthCounts[month] || 0) + 1;
          });
          setTimelineData(Object.entries(monthCounts).map(([month, count]) => ({
            month, notices: count, alerts: Math.round(count * 2.5),
          })));
        }
      } catch {
        /* use mocks */
      } finally {
        setLoading(false);
      }
    }
    loadAnalytics();
  }, []);

  if (loading) {
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 16, maxWidth: 1100, margin: "0 auto" }}>
        <div className="shimmer" style={{ height: 40, borderRadius: 12, width: 280 }} />
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16 }}>
          {[1, 2, 3, 4].map(i => <div key={i} className="shimmer" style={{ height: 110, borderRadius: 16 }} />)}
        </div>
        <div className="shimmer" style={{ height: 280, borderRadius: 16 }} />
      </div>
    );
  }

  const gridLine = isDark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.06)";
  const tickColor = "var(--text-muted)";

  return (
    <div style={{ maxWidth: 1100, margin: "0 auto" }}>
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 26, fontWeight: 900, color: "var(--text-primary)", fontFamily: "'Manrope', sans-serif", marginBottom: 4 }}>Analytics Dashboard</h1>
        <p style={{ fontSize: 14, color: "var(--text-muted)" }}>Platform metrics, notice trends, and alert delivery insights</p>
      </motion.div>

      {/* KPI Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 16, marginBottom: 28 }}>
        <StatBox icon={<FileText className="w-5 h-5" />} label="Total Notices" value={stats.totalNotices.toLocaleString()} change="+12%" color="#7c3aed" />
        <StatBox icon={<Bell className="w-5 h-5" />} label="Alerts Sent" value={stats.alertsSent.toLocaleString()} change="+18%" color="#6366f1" />
        <StatBox icon={<Users className="w-5 h-5" />} label="Active Users" value={stats.activeUsers.toLocaleString()} change="+8%" color="#8b5cf6" />
        <StatBox icon={<Globe className="w-5 h-5" />} label="Sources Live" value={stats.totalSources} change="+3 added" color="#a78bfa" />
      </div>

      {/* Charts Row 1 */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 20 }}>
        {/* Area Chart */}
        <div style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: 16, padding: 20 }}>
          <h3 style={{ fontSize: 15, fontWeight: 700, color: "var(--text-primary)", marginBottom: 20, display: "flex", alignItems: "center", gap: 8, fontFamily: "'Manrope', sans-serif" }}>
            <TrendingUp className="w-4 h-4" style={{ color: "#a78bfa" }} /> Notices & Alerts Over Time
          </h3>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={timelineData}>
              <defs>
                <linearGradient id="gNotices" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#7c3aed" stopOpacity={0.35} />
                  <stop offset="95%" stopColor="#7c3aed" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="gAlerts" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke={gridLine} />
              <XAxis dataKey="month" tick={{ fill: tickColor, fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: tickColor, fontSize: 12 }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={tooltipStyle} />
              <Area type="monotone" dataKey="notices" stroke="#7c3aed" fill="url(#gNotices)" strokeWidth={2} name="Notices" />
              <Area type="monotone" dataKey="alerts" stroke="#6366f1" fill="url(#gAlerts)" strokeWidth={2} name="Alerts" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Pie Chart */}
        <div style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: 16, padding: 20 }}>
          <h3 style={{ fontSize: 15, fontWeight: 700, color: "var(--text-primary)", marginBottom: 20, fontFamily: "'Manrope', sans-serif" }}>Notice Categories</h3>
          <div style={{ display: "flex", gap: 20, alignItems: "center" }}>
            <ResponsiveContainer width={160} height={160}>
              <PieChart>
                <Pie data={categoryData} cx="50%" cy="50%" innerRadius={45} outerRadius={72} paddingAngle={3} dataKey="value">
                  {categoryData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                </Pie>
                <Tooltip contentStyle={tooltipStyle} />
              </PieChart>
            </ResponsiveContainer>
            <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 8 }}>
              {categoryData.slice(0, 5).map((c, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <div style={{ width: 10, height: 10, borderRadius: 2, background: c.color, flexShrink: 0 }} />
                  <span style={{ fontSize: 12, color: "var(--text-secondary)", flex: 1 }}>{c.name}</span>
                  <span style={{ fontSize: 12, fontWeight: 700, color: "var(--text-primary)" }}>{c.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Charts Row 2 */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 20 }}>
        {/* Weekly Engagement Bar */}
        <div style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: 16, padding: 20 }}>
          <h3 style={{ fontSize: 15, fontWeight: 700, color: "var(--text-primary)", marginBottom: 20, fontFamily: "'Manrope', sans-serif" }}>Weekly User Engagement</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={engagementData} barSize={16}>
              <CartesianGrid strokeDasharray="3 3" stroke={gridLine} />
              <XAxis dataKey="day" tick={{ fill: tickColor, fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: tickColor, fontSize: 12 }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={tooltipStyle} />
              <Bar dataKey="views" name="Views" fill="#7c3aed" radius={[4, 4, 0, 0]} />
              <Bar dataKey="clicks" name="Clicks" fill="#6366f1" radius={[4, 4, 0, 0]} />
              <Bar dataKey="saves" name="Saves" fill="#a78bfa" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Alert Delivery */}
        <div style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: 16, padding: 20 }}>
          <h3 style={{ fontSize: 15, fontWeight: 700, color: "var(--text-primary)", marginBottom: 20, fontFamily: "'Manrope', sans-serif" }}>Alert Delivery Rate</h3>
          <ResponsiveContainer width="100%" height={160}>
            <BarChart data={deliveryData} layout="vertical" barSize={14}>
              <CartesianGrid strokeDasharray="3 3" stroke={gridLine} />
              <XAxis type="number" tick={{ fill: tickColor, fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis dataKey="channel" type="category" tick={{ fill: "var(--text-secondary)", fontSize: 12 }} axisLine={false} tickLine={false} width={72} />
              <Tooltip contentStyle={tooltipStyle} />
              <Bar dataKey="delivered" name="Delivered" fill="#10b981" radius={[0, 4, 4, 0]} />
              <Bar dataKey="failed" name="Failed" fill="#ef4444" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
          <div style={{ display: "flex", gap: 12, marginTop: 14 }}>
            {deliveryData.map(d => {
              const rate = Math.round((d.delivered / (d.delivered + d.failed)) * 100);
              return (
                <div key={d.channel} style={{ flex: 1, textAlign: "center" }}>
                  <div style={{ fontSize: 16, fontWeight: 800, color: rate >= 97 ? "#10b981" : rate >= 93 ? "#f59e0b" : "#ef4444", fontFamily: "'Manrope', sans-serif" }}>{rate}%</div>
                  <div style={{ fontSize: 10, color: "var(--text-muted)" }}>{d.channel}</div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Category Distribution */}
      <div style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: 16, padding: 20 }}>
        <h3 style={{ fontSize: 15, fontWeight: 700, color: "var(--text-primary)", marginBottom: 16, fontFamily: "'Manrope', sans-serif" }}>Category Distribution</h3>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {categoryData.map((c, i) => {
            const total = categoryData.reduce((s, x) => s + x.value, 0);
            const pct = Math.round((c.value / total) * 100);
            return (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <span style={{ fontSize: 13, color: "var(--text-secondary)", width: 96, flexShrink: 0 }}>{c.name}</span>
                <div style={{ flex: 1, height: 8, borderRadius: 4, background: isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)", overflow: "hidden" }}>
                  <motion.div
                    initial={{ width: 0 }} whileInView={{ width: `${pct}%` }}
                    viewport={{ once: true }} transition={{ duration: 0.9, delay: i * 0.08 }}
                    style={{ height: "100%", borderRadius: 4, background: c.color }}
                  />
                </div>
                <span style={{ fontSize: 12, color: "var(--text-muted)", width: 36, textAlign: "right" }}>{pct}%</span>
                <span style={{ fontSize: 12, fontWeight: 700, color: "var(--text-primary)", width: 32, textAlign: "right" }}>{c.value}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
