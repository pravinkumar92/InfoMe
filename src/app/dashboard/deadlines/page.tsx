"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import { Calendar, Clock, AlertTriangle, CheckCircle, Bell } from "lucide-react";
import { mockDeadlines, mockNotices } from "@/lib/mock-data";
import { getDaysUntil, formatDate, truncate } from "@/lib/utils";
import { toast } from "sonner";

const allDeadlines = mockNotices.filter(n => n.last_date).map(n => ({
  ...n,
  daysLeft: getDaysUntil(n.last_date!),
}));

export default function DeadlinesPage() {
  const [tab, setTab] = useState<"upcoming" | "today" | "missed">("upcoming");
  const [reminded, setReminded] = useState<string[]>([]);
  const [sending, setSending] = useState<string | null>(null);

  const upcoming = allDeadlines.filter(d => d.daysLeft > 0).sort((a, b) => a.daysLeft - b.daysLeft);
  const today = allDeadlines.filter(d => d.daysLeft === 0);
  const missed = allDeadlines.filter(d => d.daysLeft < 0);

  const toggleReminder = async (id: string, notice: any) => {
    if (reminded.includes(id)) {
      setReminded(prev => prev.filter(x => x !== id));
      toast.success("Reminder removed");
      return;
    }

    setSending(id);
    try {
      // Send Telegram reminder
      const response = await fetch('http://localhost:8000/alerts/deadline-reminder', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          chat_id: '6871599477', // Your configured Chat ID
          title: notice.title,
          days_left: notice.daysLeft.toString(),
          external_url: notice.external_url || 'http://localhost:3000/dashboard/deadlines'
        })
      });

      if (response.ok) {
        setReminded(prev => [...prev, id]);
        toast.success("⏰ Reminders sent to Telegram & WhatsApp!");
      } else {
        throw new Error('Failed to send reminder');
      }
    } catch (error) {
      console.error('Reminder error:', error);
      toast.error("Failed to send reminder. Make sure backend is running.");
    } finally {
      setSending(null);
    }
  };

  const tabs = [
    { id: "upcoming", label: "Upcoming", count: upcoming.length, color: "#a78bfa" },
    { id: "today", label: "Today", count: today.length, color: "#f59e0b" },
    { id: "missed", label: "Missed", count: missed.length, color: "#ef4444" },
  ];

  const list = tab === "upcoming" ? upcoming : tab === "today" ? today : missed;

  return (
    <div style={{ maxWidth: 800, margin: "0 auto" }}>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 24, fontWeight: 800, color: "#f1f0ff", fontFamily: "'Outfit',sans-serif", marginBottom: 4 }}>Deadline Center</h1>
        <p style={{ fontSize: 13, color: "#5c5c7a" }}>Track and manage all your important deadlines in one place</p>
      </div>

      {/* Summary cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 14, marginBottom: 28 }}>
        {[
          { label: "Upcoming", value: upcoming.length, color: "#7c3aed", icon: <Clock className="w-5 h-5" />, bg: "rgba(124,58,237,0.1)" },
          { label: "Today", value: today.length, color: "#f59e0b", icon: <Calendar className="w-5 h-5" />, bg: "rgba(245,158,11,0.1)" },
          { label: "Missed", value: missed.length, color: "#ef4444", icon: <AlertTriangle className="w-5 h-5" />, bg: "rgba(239,68,68,0.1)" },
        ].map((c, i) => (
          <div key={i} style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: 14, padding: 18, display: "flex", alignItems: "center", gap: 14 }}>
            <div style={{ width: 44, height: 44, borderRadius: 12, background: c.bg, display: "flex", alignItems: "center", justifyContent: "center", color: c.color, flexShrink: 0 }}>{c.icon}</div>
            <div>
              <div style={{ fontSize: 26, fontWeight: 800, color: c.color, fontFamily: "'Outfit',sans-serif" }}>{c.value}</div>
              <div style={{ fontSize: 13, color: "#9d9db5" }}>{c.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", gap: 0, borderBottom: "1px solid var(--border)", marginBottom: 24 }}>
        {tabs.map(t => (
          <button key={t.id} id={`deadline-tab-${t.id}`} onClick={() => setTab(t.id as any)}
            style={{ padding: "10px 20px", background: "none", border: "none", cursor: "pointer", fontSize: 14, fontWeight: 600, color: tab === t.id ? t.color : "#5c5c7a", borderBottom: tab === t.id ? `2px solid ${t.color}` : "2px solid transparent", marginBottom: -1, display: "flex", alignItems: "center", gap: 8 }}>
            {t.label}
            <span style={{ fontSize: 11, background: tab === t.id ? `${t.color}20` : "rgba(255,255,255,0.05)", color: tab === t.id ? t.color : "#5c5c7a", padding: "2px 7px", borderRadius: 10 }}>{t.count}</span>
          </button>
        ))}
      </div>

      {/* Deadline list */}
      {list.length === 0 ? (
        <div style={{ textAlign: "center", padding: "60px 0", color: "#5c5c7a" }}>
          <CheckCircle className="w-10 h-10" style={{ margin: "0 auto 12px", opacity: 0.4 }} />
          <p style={{ fontSize: 15 }}>No {tab} deadlines — you're all caught up!</p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {list.map((n, i) => {
            const dl = n.daysLeft;
            const color = dl < 0 ? "#ef4444" : dl === 0 ? "#f59e0b" : dl <= 7 ? "#f59e0b" : dl <= 14 ? "#fbbf24" : "#10b981";
            const borderColor = dl < 0 ? "#ef444450" : dl <= 7 ? "#f59e0b50" : "#10b98150";
            return (
              <motion.div key={n.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}
                style={{ background: "var(--bg-card)", border: `1px solid var(--border)`, borderLeft: `3px solid ${color}`, borderRadius: 12, padding: 18 }}>
                <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16 }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                      <span style={{ fontSize: 11, padding: "3px 8px", borderRadius: 20, background: "rgba(124,58,237,0.1)", color: "#a78bfa", border: "1px solid rgba(124,58,237,0.2)" }}>{n.category}</span>
                      {n.amount && <span style={{ fontSize: 11, color: "#fbbf24", fontWeight: 600 }}>💰 {n.amount}</span>}
                    </div>
                    <h3 style={{ fontSize: 14, fontWeight: 700, color: "#f1f0ff", marginBottom: 4 }}>{n.title}</h3>
                    <div style={{ fontSize: 12, color: "#5c5c7a", marginBottom: 8 }}>{n.department}</div>
                    <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                      <span style={{ fontSize: 13, fontWeight: 700, color }}>
                        {dl < 0 ? `Expired ${Math.abs(dl)} days ago` : dl === 0 ? "📅 Due Today!" : `⏱ ${dl} days remaining`}
                      </span>
                      <span style={{ fontSize: 12, color: "#5c5c7a" }}>Last date: {formatDate(n.last_date!)}</span>
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
                    {n.pdf_url && (
                      <a href={n.pdf_url} style={{ padding: "7px 14px", borderRadius: 8, background: "rgba(124,58,237,0.1)", border: "1px solid rgba(124,58,237,0.2)", color: "#a78bfa", fontSize: 13, fontWeight: 600, textDecoration: "none" }}>
                        Apply
                      </a>
                    )}
                    <button id={`remind-${n.id}`} onClick={() => toggleReminder(n.id, n)}
                      disabled={sending === n.id}
                      style={{ 
                        padding: "7px 14px", 
                        borderRadius: 8, 
                        background: reminded.includes(n.id) ? "rgba(245,158,11,0.12)" : "rgba(255,255,255,0.04)", 
                        border: `1px solid ${reminded.includes(n.id) ? "rgba(245,158,11,0.4)" : "var(--border)"}`, 
                        color: reminded.includes(n.id) ? "#fbbf24" : "#9d9db5", 
                        fontSize: 13, 
                        fontWeight: 600, 
                        cursor: sending === n.id ? "wait" : "pointer", 
                        display: "flex", 
                        alignItems: "center", 
                        gap: 5,
                        opacity: sending === n.id ? 0.6 : 1,
                      }}>
                      <Bell className="w-3.5 h-3.5" /> 
                      {sending === n.id ? "Sending..." : reminded.includes(n.id) ? "Reminded" : "Remind"}
                    </button>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
