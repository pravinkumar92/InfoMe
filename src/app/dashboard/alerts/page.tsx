"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import { Bell, Filter, CheckCheck, Zap, Clock, Mail, MessageCircle } from "lucide-react";
import Image from "next/image";
import { mockAlerts, mockNotices } from "@/lib/mock-data";
import { formatRelativeTime, truncate } from "@/lib/utils";
import { toast } from "sonner";

// Augment alerts with notice data
const allAlerts = [
  ...mockAlerts,
  { id: "a5", notice_id: "5", channel: "Email", status: "sent", created_at: "2026-03-25T09:50:00Z", notice: mockNotices[4] },
  { id: "a6", notice_id: "6", channel: "Push", status: "sent", created_at: "2026-03-29T11:05:00Z", notice: mockNotices[5] },
  { id: "a7", notice_id: "8", channel: "Telegram", status: "pending", created_at: "2026-03-27T14:05:00Z", notice: mockNotices[7] },
];

// Icon component for each channel
const ChannelIcon = ({ channel, size = 24 }: { channel: string; size?: number }) => {
  // Try to use PNG images first, fallback to SVG/Lucide icons
  const [useImage, setUseImage] = useState(true);
  const [imageError, setImageError] = useState(false);

  const iconMap: Record<string, any> = {
    WhatsApp: <MessageCircle className="w-full h-full" style={{ color: "#25D366" }} />,
    Email: <Mail className="w-full h-full" style={{ color: "#6366f1" }} />,
    Telegram: (
      <svg viewBox="0 0 24 24" fill="currentColor" style={{ color: "#0088cc" }}>
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69a.2.2 0 00-.05-.18c-.06-.05-.14-.03-.21-.02-.09.02-1.49.95-4.22 2.79-.4.27-.76.41-1.08.4-.36-.01-1.04-.2-1.55-.37-.63-.2-1.12-.31-1.08-.66.02-.18.27-.36.74-.55 2.92-1.27 4.86-2.11 5.83-2.51 2.78-1.16 3.35-1.36 3.73-1.36.08 0 .27.02.39.12.1.08.13.19.14.27-.01.06.01.24 0 .38z"/>
      </svg>
    ),
    Push: <Bell className="w-full h-full" style={{ color: "#f59e0b" }} />,
    SMS: <MessageCircle className="w-full h-full" style={{ color: "#8b5cf6" }} />,
  };

  // Add cache busting timestamp
  const imagePath = `/icons/${channel.toLowerCase()}.png?v=${Date.now()}`;

  return (
    <div style={{ width: size, height: size, display: "flex", alignItems: "center", justifyContent: "center" }}>
      {useImage && !imageError ? (
        <Image
          src={imagePath}
          alt={channel}
          width={size}
          height={size}
          onError={() => {
            setImageError(true);
            setUseImage(false);
          }}
          unoptimized
          style={{ width: size, height: size, objectFit: "contain" }}
        />
      ) : (
        iconMap[channel] || <Bell className="w-full h-full" style={{ color: "#a78bfa" }} />
      )}
    </div>
  );
};

const channelColor: Record<string, string> = { WhatsApp: "#25D366", Email: "#6366f1", Telegram: "#0088cc", Push: "#f59e0b", SMS: "#8b5cf6" };

export default function AlertsPage() {
  const [tab, setTab] = useState<"all" | "saved" | "following">("all");
  const [filterUrgent, setFilterUrgent] = useState(false);
  const [readIds, setReadIds] = useState<string[]>([]);

  const markRead = (id: string) => {
    setReadIds(prev => [...prev, id]);
    toast.success("Marked as read");
  };

  const markAllRead = () => {
    setReadIds(allAlerts.map(a => a.id));
    toast.success("All alerts marked as read");
  };

  const filtered = allAlerts.filter(a => {
    if (filterUrgent) return a.notice.urgency === "critical" || a.notice.urgency === "high";
    return true;
  });

  return (
    <div style={{ maxWidth: 800, margin: "0 auto" }} suppressHydrationWarning>
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 28 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 800, color: "#f1f0ff", fontFamily: "'Outfit',sans-serif", marginBottom: 4 }}>Alerts</h1>
          <p style={{ fontSize: 13, color: "#5c5c7a" }}>All your notifications and alert history</p>
        </div>
        <button 
          onClick={markAllRead} 
          suppressHydrationWarning
          style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 16px", borderRadius: 8, background: "rgba(212,165,116,0.1)", border: "1px solid rgba(212,165,116,0.25)", color: "#d4a574", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
          <CheckCheck className="w-4 h-4" /> Mark all read
        </button>
      </div>

      {/* Summary */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: 12, marginBottom: 24 }}>
        {Object.keys(channelColor).map((ch) => {
          const count = allAlerts.filter(a => a.channel === ch).length;
          return (
            <div key={ch} style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: 12, padding: "14px", textAlign: "center" }}>
              <div style={{ display: "flex", justifyContent: "center", marginBottom: 8 }}>
                <ChannelIcon channel={ch} size={28} />
              </div>
              <div style={{ fontSize: 20, fontWeight: 700, color: channelColor[ch] || "#a78bfa" }}>{count}</div>
              <div style={{ fontSize: 11, color: "#5c5c7a" }}>{ch}</div>
            </div>
          );
        })}
      </div>

      {/* Tabs + filters */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: "1px solid var(--border)", marginBottom: 20 }}>
        <div style={{ display: "flex", gap: 0 }}>
          {(["all", "saved", "following"] as const).map(t => (
            <button 
              key={t} 
              id={`alert-tab-${t}`} 
              onClick={() => setTab(t)}
              suppressHydrationWarning
              style={{ padding: "10px 18px", background: "none", border: "none", cursor: "pointer", fontSize: 14, fontWeight: 600, color: tab === t ? "#d4a574" : "#5c5c7a", borderBottom: tab === t ? "2px solid #d4a574" : "2px solid transparent", marginBottom: -1, textTransform: "capitalize" }}>
              {t}
            </button>
          ))}
        </div>
        <button 
          onClick={() => setFilterUrgent(!filterUrgent)} 
          id="filter-urgent-btn"
          suppressHydrationWarning
          style={{ display: "flex", alignItems: "center", gap: 6, padding: "6px 14px", borderRadius: 8, background: filterUrgent ? "rgba(239,68,68,0.1)" : "transparent", border: `1px solid ${filterUrgent ? "rgba(239,68,68,0.4)" : "var(--border)"}`, color: filterUrgent ? "#fca5a5" : "#9d9db5", fontSize: 13, cursor: "pointer" }}>
          <Zap className="w-3.5 h-3.5" /> Urgent Only
        </button>
      </div>

      {/* Alert list */}
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {filtered.length === 0 ? (
          <div style={{ textAlign: "center", padding: "60px 0", color: "#5c5c7a" }}>
            <Bell className="w-10 h-10" style={{ margin: "0 auto 12px", opacity: 0.4 }} />
            <p>No alerts to show</p>
          </div>
        ) : filtered.map((a, i) => {
          const isRead = readIds.includes(a.id);
          const urgColor = a.notice.urgency === "critical" ? "#dc2626" : a.notice.urgency === "high" ? "#f59e0b" : "#6366f1";
          return (
            <motion.div key={a.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
              style={{ background: isRead ? "rgba(255,255,255,0.01)" : "var(--bg-card)", border: isRead ? "1px solid rgba(255,255,255,0.05)" : "1px solid var(--border)", borderRadius: 12, padding: 16, opacity: isRead ? 0.6 : 1, transition: "all 0.3s" }}>
              <div style={{ display: "flex", alignItems: "flex-start", gap: 14 }}>
                {/* Channel icon */}
                <div style={{ width: 40, height: 40, borderRadius: 10, background: `${channelColor[a.channel] || "#7c3aed"}15`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <ChannelIcon channel={a.channel} size={22} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                    <span style={{ fontSize: 11, fontWeight: 600, color: channelColor[a.channel] || "#a78bfa" }}>via {a.channel}</span>
                    <span style={{ fontSize: 11, padding: "2px 8px", borderRadius: 20, background: `${urgColor}15`, color: urgColor, border: `1px solid ${urgColor}35`, textTransform: "capitalize" }}>{a.notice.urgency}</span>
                    {a.status === "pending" && <span style={{ fontSize: 11, color: "#f59e0b" }}>● Pending</span>}
                    {!isRead && <span style={{ width: 7, height: 7, borderRadius: "50%", background: "#7c3aed", display: "inline-block" }} />}
                  </div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: "#f1f0ff", marginBottom: 4 }}>{truncate(a.notice.title, 70)}</div>
                  <div style={{ fontSize: 12, color: "#5c5c7a", display: "flex", gap: 12 }}>
                    <span>{a.notice.category}</span>
                    <span><Clock className="w-3 h-3" style={{ display: "inline", marginRight: 2 }} />{formatRelativeTime(a.created_at)}</span>
                  </div>
                </div>
                {!isRead && (
                  <button 
                    id={`mark-read-${a.id}`} 
                    onClick={() => markRead(a.id)}
                    suppressHydrationWarning
                    style={{ padding: "6px 12px", borderRadius: 8, background: "rgba(212,165,116,0.08)", border: "1px solid rgba(212,165,116,0.2)", color: "#d4a574", fontSize: 12, cursor: "pointer", whiteSpace: "nowrap" }}>
                    Mark read
                  </button>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
