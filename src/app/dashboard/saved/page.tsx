"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import { Bookmark, Globe, Trash2, ExternalLink, Bell } from "lucide-react";
import { mockNotices, mockSources } from "@/lib/mock-data";
import { formatDate, truncate, getDaysUntil } from "@/lib/utils";
import { toast } from "sonner";

export default function SavedPage() {
  const [tab, setTab] = useState<"saved" | "following">("saved");
  const [savedIds, setSavedIds] = useState<string[]>(["1", "2", "6"]);
  const [followedIds, setFollowedIds] = useState<string[]>(["s1", "s2", "s3"]);

  const savedNotices = mockNotices.filter(n => savedIds.includes(n.id));
  const followedSources = mockSources.filter(s => followedIds.includes(s.id));

  const removeSaved = (id: string) => {
    setSavedIds(prev => prev.filter(x => x !== id));
    toast.success("Removed from saved");
  };
  const unfollow = (id: string) => {
    setFollowedIds(prev => prev.filter(x => x !== id));
    toast.success("Unfollowed source");
  };
  const followSource = (id: string) => {
    if (!followedIds.includes(id)) {
      setFollowedIds(prev => [...prev, id]);
      toast.success("Now following source!");
    }
  };

  return (
    <div style={{ maxWidth: 900, margin: "0 auto" }}>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 24, fontWeight: 800, color: "#f1f0ff", fontFamily: "'Outfit',sans-serif", marginBottom: 4 }}>Saved & Following</h1>
        <p style={{ fontSize: 13, color: "#5c5c7a" }}>Manage your saved notices and followed sources</p>
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", gap: 0, borderBottom: "1px solid var(--border)", marginBottom: 24 }}>
        {([{ id: "saved", label: "Saved Notices", count: savedNotices.length },
           { id: "following", label: "Following Sources", count: followedSources.length }] as const).map(t => (
          <button key={t.id} id={`saved-tab-${t.id}`} onClick={() => setTab(t.id)}
            style={{ padding: "10px 20px", background: "none", border: "none", cursor: "pointer", fontSize: 14, fontWeight: 600, color: tab === t.id ? "#a78bfa" : "#5c5c7a", borderBottom: tab === t.id ? "2px solid #7c3aed" : "2px solid transparent", marginBottom: -1, display: "flex", gap: 8, alignItems: "center" }}>
            {t.label}
            <span style={{ fontSize: 11, background: tab === t.id ? "rgba(124,58,237,0.15)" : "rgba(255,255,255,0.05)", color: tab === t.id ? "#a78bfa" : "#5c5c7a", padding: "2px 7px", borderRadius: 10 }}>{t.count}</span>
          </button>
        ))}
      </div>

      {/* Saved Notices */}
      {tab === "saved" && (
        <div>
          {savedNotices.length === 0 ? (
            <div style={{ textAlign: "center", padding: "60px 0", color: "#5c5c7a" }}>
              <Bookmark className="w-10 h-10" style={{ margin: "0 auto 12px", opacity: 0.4 }} />
              <p style={{ fontSize: 15 }}>No saved notices yet</p>
              <p style={{ fontSize: 13, marginTop: 4 }}>Browse notices and save them for later</p>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {savedNotices.map((n, i) => {
                const daysLeft = n.last_date ? getDaysUntil(n.last_date) : null;
                return (
                  <motion.div key={n.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                    style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: 14, padding: 18 }}>
                    <div style={{ display: "flex", alignItems: "flex-start", gap: 14 }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                          <span style={{ fontSize: 11, padding: "3px 8px", borderRadius: 20, background: "rgba(124,58,237,0.1)", color: "#a78bfa", border: "1px solid rgba(124,58,237,0.2)" }}>{n.category}</span>
                          {n.amount && <span style={{ fontSize: 11, color: "#fbbf24" }}>💰 {n.amount}</span>}
                        </div>
                        <h3 style={{ fontSize: 15, fontWeight: 700, color: "#f1f0ff", marginBottom: 4 }}>{n.title}</h3>
                        <p style={{ fontSize: 13, color: "#9d9db5", marginBottom: 8 }}>{truncate(n.summary || n.description || "", 120)}</p>
                        <div style={{ display: "flex", gap: 14, fontSize: 12, color: "#5c5c7a" }}>
                          <span>{n.department}</span>
                          {daysLeft !== null && (
                            <span style={{ color: daysLeft <= 7 ? "#ef4444" : daysLeft <= 14 ? "#f59e0b" : "#10b981", fontWeight: 600 }}>
                              {daysLeft > 0 ? `${daysLeft}d left` : "Expired"} (Last date: {formatDate(n.last_date!)})
                            </span>
                          )}
                        </div>
                      </div>
                      <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
                        {n.pdf_url && (
                          <a href={n.pdf_url} style={{ padding: "7px 14px", borderRadius: 8, background: "rgba(124,58,237,0.1)", border: "1px solid rgba(124,58,237,0.2)", color: "#a78bfa", fontSize: 13, fontWeight: 600, textDecoration: "none", display: "flex", alignItems: "center", gap: 5 }}>
                            <ExternalLink className="w-3.5 h-3.5" /> Open
                          </a>
                        )}
                        <button id={`remove-saved-${n.id}`} onClick={() => removeSaved(n.id)}
                          style={{ padding: "7px 10px", borderRadius: 8, background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)", color: "#fca5a5", cursor: "pointer" }}>
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Following Sources */}
      {tab === "following" && (
        <div>
          <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 32 }}>
            <h2 style={{ fontSize: 16, fontWeight: 700, color: "#f1f0ff", marginBottom: 4 }}>Currently Following</h2>
            {followedSources.length === 0 ? (
              <div style={{ textAlign: "center", padding: "40px 0", color: "#5c5c7a" }}>
                <Globe className="w-10 h-10" style={{ margin: "0 auto 12px", opacity: 0.4 }} />
                <p>Not following any sources yet</p>
              </div>
            ) : followedSources.map((s, i) => (
              <motion.div key={s.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
                style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: 12, padding: 16, display: "flex", alignItems: "center", gap: 14 }}>
                <div style={{ width: 44, height: 44, borderRadius: 10, background: "rgba(124,58,237,0.1)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, flexShrink: 0 }}>{s.logo}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 14, fontWeight: 700, color: "#f1f0ff", marginBottom: 2 }}>{s.name}</div>
                  <div style={{ fontSize: 12, color: "#5c5c7a" }}>{s.type} · {s.notice_count} notices tracked</div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 4, padding: "5px 10px", borderRadius: 6, background: "rgba(16,185,129,0.08)", border: "1px solid rgba(16,185,129,0.2)" }}>
                    <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#10b981" }} />
                    <span style={{ fontSize: 11, color: "#10b981" }}>Following</span>
                  </div>
                  <button id={`unfollow-${s.id}`} onClick={() => unfollow(s.id)}
                    style={{ padding: "5px 12px", borderRadius: 8, background: "rgba(239,68,68,0.06)", border: "1px solid rgba(239,68,68,0.2)", color: "#fca5a5", fontSize: 12, cursor: "pointer" }}>
                    Unfollow
                  </button>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Suggested sources */}
          <div>
            <h2 style={{ fontSize: 16, fontWeight: 700, color: "#f1f0ff", marginBottom: 12 }}>Suggested Sources</h2>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px,1fr))", gap: 12 }}>
              {mockSources.filter(s => !followedIds.includes(s.id)).map((s, i) => (
                <motion.div key={s.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.04 }}
                  style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: 12, padding: 16, display: "flex", alignItems: "center", gap: 12 }}>
                  <span style={{ fontSize: 22 }}>{s.logo}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: "#f1f0ff" }}>{s.name}</div>
                    <div style={{ fontSize: 11, color: "#5c5c7a" }}>{s.type}</div>
                  </div>
                  <button id={`follow-${s.id}`} onClick={() => followSource(s.id)}
                    style={{ padding: "5px 12px", borderRadius: 8, background: "rgba(124,58,237,0.1)", border: "1px solid rgba(124,58,237,0.25)", color: "#a78bfa", fontSize: 12, fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", gap: 4 }}>
                    <Bell className="w-3 h-3" /> Follow
                  </button>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
