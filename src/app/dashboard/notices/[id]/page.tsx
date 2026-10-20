"use client";
import { use } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import {
  ArrowLeft, Calendar, Eye, Building2, Bookmark,
  Share2, Download, ExternalLink, Clock, AlertTriangle,
  CheckCircle, Bell, FileText
} from "lucide-react";
import { mockNotices } from "@/lib/mock-data";
import { formatDate, formatRelativeTime, getDaysUntil } from "@/lib/utils";
import { toast } from "sonner";
import { useState } from "react";

const urgencyConfig: Record<string, { label: string; color: string; bg: string; border: string; glow: string }> = {
  critical: { label: "🔴 Critical", color: "#fca5a5", bg: "rgba(220,38,38,0.1)", border: "rgba(220,38,38,0.35)", glow: "rgba(220,38,38,0.2)" },
  high: { label: "🟡 High", color: "#fcd34d", bg: "rgba(245,158,11,0.1)", border: "rgba(245,158,11,0.3)", glow: "rgba(245,158,11,0.15)" },
  medium: { label: "🔵 Medium", color: "#a5b4fc", bg: "rgba(99,102,241,0.1)", border: "rgba(99,102,241,0.3)", glow: "rgba(99,102,241,0.1)" },
  low: { label: "🟢 Low", color: "#6ee7b7", bg: "rgba(16,185,129,0.1)", border: "rgba(16,185,129,0.3)", glow: "rgba(16,185,129,0.1)" },
};

export default function NoticeDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const notice = mockNotices.find(n => n.id === id);
  const [saved, setSaved] = useState(false);
  const [reminded, setReminded] = useState(false);

  if (!notice) {
    return (
      <div style={{ maxWidth: 800, margin: "0 auto", textAlign: "center", padding: "80px 0" }}>
        <FileText className="w-16 h-16" style={{ color: "#5c5c7a", margin: "0 auto 20px", opacity: 0.4 }} />
        <h1 style={{ fontSize: 24, fontWeight: 700, color: "#f1f0ff", marginBottom: 8 }}>Notice Not Found</h1>
        <p style={{ color: "#5c5c7a", marginBottom: 24 }}>The notice you're looking for doesn't exist or has been removed.</p>
        <Link href="/dashboard/notices" style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "10px 20px", borderRadius: 10, background: "linear-gradient(135deg,#7c3aed,#6d28d9)", color: "white", fontWeight: 600, textDecoration: "none", fontSize: 14 }}>
          <ArrowLeft className="w-4 h-4" /> Back to Notices
        </Link>
      </div>
    );
  }

  const uc = urgencyConfig[notice.urgency];
  const daysLeft = notice.last_date ? getDaysUntil(notice.last_date) : null;
  const related = mockNotices.filter(n => n.id !== notice.id && (n.category === notice.category || n.source_id === notice.source_id)).slice(0, 3);

  return (
    <div style={{ maxWidth: 860, margin: "0 auto" }}>
      {/* Back */}
      <Link href="/dashboard/notices" style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 13, color: "#5c5c7a", textDecoration: "none", marginBottom: 24 }}>
        <ArrowLeft className="w-4 h-4" /> Back to Notices
      </Link>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 300px", gap: 24, alignItems: "start" }}>
        {/* Main */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
          {/* Header Card */}
          <div style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: 20, padding: 28, marginBottom: 20, position: "relative", overflow: "hidden" }}>
            {/* Glow */}
            {notice.urgency === "critical" && (
              <div style={{ position: "absolute", top: -40, right: -40, width: 200, height: 200, borderRadius: "50%", background: "radial-gradient(circle, rgba(220,38,38,0.12) 0%, transparent 70%)", pointerEvents: "none" }} />
            )}

            {/* Tags */}
            <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", marginBottom: 16 }}>
              <span style={{ fontSize: 12, fontWeight: 600, padding: "4px 12px", borderRadius: 20, background: "rgba(124,58,237,0.12)", color: "#a78bfa", border: "1px solid rgba(124,58,237,0.25)" }}>
                {notice.category}
              </span>
              <span style={{ fontSize: 12, fontWeight: 600, padding: "4px 12px", borderRadius: 20, background: uc.bg, color: uc.color, border: `1px solid ${uc.border}` }}>
                {uc.label}
              </span>
              {notice.amount && (
                <span style={{ fontSize: 12, fontWeight: 600, color: "#fbbf24", background: "rgba(251,191,36,0.1)", border: "1px solid rgba(251,191,36,0.25)", padding: "4px 12px", borderRadius: 20 }}>
                  💰 {notice.amount}
                </span>
              )}
            </div>

            <h1 style={{ fontSize: 22, fontWeight: 800, color: "#f1f0ff", lineHeight: 1.4, fontFamily: "'Outfit',sans-serif", marginBottom: 14 }}>
              {notice.title}
            </h1>

            {/* Meta */}
            <div style={{ display: "flex", flexWrap: "wrap", gap: 16, fontSize: 13, color: "#5c5c7a" }}>
              <span style={{ display: "flex", alignItems: "center", gap: 5 }}>
                <Building2 className="w-3.5 h-3.5" /> {notice.department}
              </span>
              <span style={{ display: "flex", alignItems: "center", gap: 5 }}>
                <Clock className="w-3.5 h-3.5" /> {formatRelativeTime(notice.created_at)}
              </span>
              <span style={{ display: "flex", alignItems: "center", gap: 5 }}>
                <Eye className="w-3.5 h-3.5" /> {notice.views.toLocaleString()} views
              </span>
              {notice.last_date && (
                <span style={{ display: "flex", alignItems: "center", gap: 5 }}>
                  <Calendar className="w-3.5 h-3.5" /> Last Date: {formatDate(notice.last_date)}
                </span>
              )}
            </div>
          </div>

          {/* AI Summary */}
          {notice.summary && (
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
              style={{ background: "rgba(124,58,237,0.06)", border: "1px solid rgba(124,58,237,0.2)", borderRadius: 14, padding: 20, marginBottom: 20 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
                <div style={{ width: 28, height: 28, borderRadius: 8, background: "linear-gradient(135deg,#7c3aed,#6d28d9)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <span style={{ fontSize: 14 }}>✨</span>
                </div>
                <span style={{ fontSize: 13, fontWeight: 700, color: "#a78bfa" }}>AI-Generated Summary</span>
              </div>
              <p style={{ fontSize: 14, color: "#e2d9ff", lineHeight: 1.7 }}>{notice.summary}</p>
            </motion.div>
          )}

          {/* Full Description */}
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
            style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: 16, padding: 24, marginBottom: 20 }}>
            <h2 style={{ fontSize: 16, fontWeight: 700, color: "#f1f0ff", marginBottom: 14 }}>Full Notice Details</h2>
            <p style={{ fontSize: 14, color: "#9d9db5", lineHeight: 1.8 }}>{notice.description}</p>

            {/* CTA Buttons */}
            <div style={{ display: "flex", gap: 12, marginTop: 24, flexWrap: "wrap" }}>
              <a href="#" style={{ display: "inline-flex", alignItems: "center", gap: 7, padding: "11px 22px", borderRadius: 10, background: "linear-gradient(135deg,#7c3aed,#6d28d9)", color: "white", fontWeight: 700, fontSize: 14, textDecoration: "none", boxShadow: "0 0 20px rgba(124,58,237,0.4)" }}>
                Apply Now <ExternalLink className="w-4 h-4" />
              </a>
              {notice.pdf_url && (
                <button onClick={() => toast.success("Downloading PDF...")} style={{ display: "inline-flex", alignItems: "center", gap: 7, padding: "11px 20px", borderRadius: 10, background: "rgba(255,255,255,0.05)", border: "1px solid var(--border)", color: "#9d9db5", fontWeight: 600, fontSize: 14, cursor: "pointer" }}>
                  <Download className="w-4 h-4" /> Download PDF
                </button>
              )}
            </div>
          </motion.div>

          {/* Related Notices */}
          {related.length > 0 && (
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
              <h2 style={{ fontSize: 15, fontWeight: 700, color: "#f1f0ff", marginBottom: 14 }}>Related Notices</h2>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {related.map(n => (
                  <Link key={n.id} href={`/dashboard/notices/${n.id}`}
                    style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: 12, padding: "14px 16px", textDecoration: "none", display: "block", transition: "all 0.2s" }}>
                    <div style={{ fontSize: 11, color: "#a78bfa", marginBottom: 4 }}>{n.category}</div>
                    <div style={{ fontSize: 14, fontWeight: 600, color: "#f1f0ff", lineHeight: 1.4 }}>{n.title}</div>
                    <div style={{ fontSize: 12, color: "#5c5c7a", marginTop: 4 }}>{n.department} · {formatRelativeTime(n.created_at)}</div>
                  </Link>
                ))}
              </div>
            </motion.div>
          )}
        </motion.div>

        {/* Sidebar */}
        <motion.div initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }}
          style={{ display: "flex", flexDirection: "column", gap: 16 }}>

          {/* Deadline Widget */}
          {daysLeft !== null && (
            <div style={{
              background: daysLeft <= 7 ? "rgba(239,68,68,0.08)" : daysLeft <= 14 ? "rgba(245,158,11,0.08)" : "rgba(16,185,129,0.08)",
              border: `1px solid ${daysLeft <= 7 ? "rgba(239,68,68,0.3)" : daysLeft <= 14 ? "rgba(245,158,11,0.3)" : "rgba(16,185,129,0.3)"}`,
              borderRadius: 16, padding: 20
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
                {daysLeft <= 7 ? <AlertTriangle className="w-4 h-4" style={{ color: "#ef4444" }} /> : <Calendar className="w-4 h-4" style={{ color: "#a78bfa" }} />}
                <span style={{ fontSize: 13, fontWeight: 700, color: "#f1f0ff" }}>Deadline</span>
              </div>
              <div style={{ fontSize: 26, fontWeight: 800, fontFamily: "'Outfit',sans-serif", color: daysLeft <= 7 ? "#ef4444" : daysLeft <= 14 ? "#f59e0b" : "#10b981", marginBottom: 4 }}>
                {daysLeft > 0 ? `${daysLeft} days` : daysLeft === 0 ? "Today!" : "Expired"}
              </div>
              <div style={{ fontSize: 12, color: "#9d9db5" }}>Last Date: {formatDate(notice.last_date!)}</div>
              <button id={`notice-remind-${id}`} onClick={() => { setReminded(!reminded); toast.success(reminded ? "Reminder removed" : "⏰ Reminder set for 1 day before deadline!"); }}
                style={{ width: "100%", marginTop: 14, padding: "9px", borderRadius: 9, background: reminded ? "rgba(124,58,237,0.2)" : "rgba(255,255,255,0.05)", border: `1px solid ${reminded ? "#7c3aed" : "var(--border)"}`, color: reminded ? "#a78bfa" : "#9d9db5", fontWeight: 600, fontSize: 13, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
                <Bell className="w-3.5 h-3.5" /> {reminded ? "Reminder Set ✓" : "Set Reminder"}
              </button>
            </div>
          )}

          {/* Actions */}
          <div style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: 16, padding: 20 }}>
            <h3 style={{ fontSize: 13, fontWeight: 700, color: "#9d9db5", marginBottom: 14, textTransform: "uppercase", letterSpacing: "0.05em" }}>Actions</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <button id={`notice-save-${id}`} onClick={() => { setSaved(!saved); toast.success(saved ? "Removed from saved" : "Notice saved!"); }}
                style={{ display: "flex", alignItems: "center", gap: 9, padding: "10px 14px", borderRadius: 9, background: saved ? "rgba(124,58,237,0.12)" : "rgba(255,255,255,0.03)", border: `1px solid ${saved ? "rgba(124,58,237,0.35)" : "var(--border)"}`, color: saved ? "#a78bfa" : "#9d9db5", fontWeight: 600, fontSize: 13, cursor: "pointer", width: "100%", textAlign: "left" }}>
                <Bookmark className="w-4 h-4" style={{ fill: saved ? "currentColor" : "none" }} />
                {saved ? "Saved to Library" : "Save Notice"}
              </button>
              <button onClick={() => { navigator.clipboard?.writeText(window.location.href).catch(() => {}); toast.success("Link copied!"); }}
                style={{ display: "flex", alignItems: "center", gap: 9, padding: "10px 14px", borderRadius: 9, background: "rgba(255,255,255,0.03)", border: "1px solid var(--border)", color: "#9d9db5", fontWeight: 600, fontSize: 13, cursor: "pointer", width: "100%", textAlign: "left" }}>
                <Share2 className="w-4 h-4" /> Share Notice
              </button>
            </div>
          </div>

          {/* Source Info */}
          <div style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: 16, padding: 20 }}>
            <h3 style={{ fontSize: 13, fontWeight: 700, color: "#9d9db5", marginBottom: 14, textTransform: "uppercase", letterSpacing: "0.05em" }}>Source</h3>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{ width: 40, height: 40, borderRadius: 10, background: "rgba(124,58,237,0.1)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20 }}>🏛️</div>
              <div>
                <div style={{ fontSize: 14, fontWeight: 600, color: "#f1f0ff" }}>{notice.department}</div>
                <div style={{ display: "flex", alignItems: "center", gap: 4, marginTop: 3 }}>
                  <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#10b981" }} />
                  <span style={{ fontSize: 11, color: "#10b981" }}>Verified Source</span>
                </div>
              </div>
            </div>
          </div>

          {/* Safety Badge */}
          <div style={{ background: "rgba(16,185,129,0.06)", border: "1px solid rgba(16,185,129,0.2)", borderRadius: 14, padding: 16 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <CheckCircle className="w-4 h-4" style={{ color: "#10b981", flexShrink: 0 }} />
              <div>
                <div style={{ fontSize: 13, fontWeight: 600, color: "#6ee7b7" }}>Verified Notice</div>
                <div style={{ fontSize: 11, color: "#5c5c7a", marginTop: 2 }}>Sourced directly from official government/university portals.</div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
