"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import {
  User, Bell, Shield, Globe, Palette, Phone, Mail,
  Save, CheckCircle, Eye, EyeOff, Smartphone
} from "lucide-react";
import { toast } from "sonner";
import { notificationChannels, states } from "@/lib/mock-data";

type SettingsTab = "profile" | "notifications" | "privacy" | "appearance";

export default function SettingsPage() {
  const [tab, setTab] = useState<SettingsTab>("profile");
  const [profile, setProfile] = useState({ name: "Ramesh Kumar", email: "ramesh@example.com", phone: "+91 98765 43210", state: "Uttar Pradesh", district: "Lucknow", college: "AKTU Lucknow" });
  const [notifications, setNotifications] = useState({ whatsapp: true, telegram: false, email: true, push: true, digest: true, deadlineAlert: true, urgentOnly: false });
  const [privacy, setPrivacy] = useState({ profileVisible: false, dataSharing: false });
  const [theme, setTheme] = useState("dark");
  const [saving, setSaving] = useState(false);

  const save = async () => {
    setSaving(true);
    await new Promise(r => setTimeout(r, 800));
    setSaving(false);
    toast.success("Settings saved successfully!");
  };

  const Toggle = ({ value, onChange, id }: { value: boolean; onChange: (v: boolean) => void; id: string }) => (
    <button id={id} onClick={() => onChange(!value)}
      style={{ width: 44, height: 24, borderRadius: 12, background: value ? "#d4a574" : "rgba(255,255,255,0.08)", border: `1px solid ${value ? "#d4a574" : "var(--border)"}`, cursor: "pointer", position: "relative", transition: "all 0.2s", flexShrink: 0 }}>
      <div style={{ width: 18, height: 18, borderRadius: "50%", background: "white", position: "absolute", top: 2, left: value ? 22 : 2, transition: "left 0.2s", boxShadow: "0 1px 4px rgba(0,0,0,0.4)" }} />
    </button>
  );

  const tabs = [
    { id: "profile" as const, label: "Profile", icon: <User className="w-4 h-4" /> },
    { id: "notifications" as const, label: "Notifications", icon: <Bell className="w-4 h-4" /> },
    { id: "privacy" as const, label: "Privacy", icon: <Shield className="w-4 h-4" /> },
    { id: "appearance" as const, label: "Appearance", icon: <Palette className="w-4 h-4" /> },
  ];

  return (
    <div style={{ maxWidth: 760, margin: "0 auto" }}>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 24, fontWeight: 800, color: "#f1f0ff", fontFamily: "'Outfit',sans-serif", marginBottom: 4 }}>Settings</h1>
        <p style={{ fontSize: 13, color: "#5c5c7a" }}>Manage your account, notifications and preferences</p>
      </div>

      {/* Tab bar */}
      <div style={{ display: "flex", gap: 0, borderBottom: "1px solid var(--border)", marginBottom: 32 }}>
        {tabs.map(t => (
          <button key={t.id} id={`settings-tab-${t.id}`} onClick={() => setTab(t.id)}
            style={{ padding: "10px 20px", background: "none", border: "none", cursor: "pointer", fontSize: 14, fontWeight: 600, color: tab === t.id ? "#d4a574" : "#5c5c7a", borderBottom: tab === t.id ? "2px solid #d4a574" : "2px solid transparent", marginBottom: -1, display: "flex", alignItems: "center", gap: 6 }}>
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      {/* PROFILE */}
      {tab === "profile" && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          {/* Avatar */}
          <div style={{ display: "flex", alignItems: "center", gap: 20, marginBottom: 32, padding: 24, background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: 16 }}>
            <div style={{ width: 72, height: 72, borderRadius: "50%", background: "linear-gradient(135deg,#d4a574,#c9985f)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24, fontWeight: 700, color: "#000" }}>
              RK
            </div>
            <div>
              <div style={{ fontSize: 18, fontWeight: 700, color: "#f1f0ff", marginBottom: 4 }}>{profile.name}</div>
              <div style={{ fontSize: 13, color: "#9d9db5" }}>{profile.email}</div>
              <button onClick={() => toast.success("Photo upload coming soon!")} style={{ marginTop: 10, padding: "6px 14px", borderRadius: 8, background: "rgba(212,165,116,0.1)", border: "1px solid rgba(212,165,116,0.25)", color: "#d4a574", fontSize: 12, cursor: "pointer" }}>
                Change Photo
              </button>
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 16, background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: 16, padding: 24 }}>
            <h2 style={{ fontSize: 15, fontWeight: 700, color: "#f1f0ff", marginBottom: 4 }}>Personal Information</h2>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
              <div>
                <label style={{ fontSize: 13, color: "#9d9db5", marginBottom: 6, display: "block" }}>Full Name</label>
                <div style={{ position: "relative" }}>
                  <User className="w-4 h-4" style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "#5c5c7a" }} />
                  <input id="profile-name" type="text" value={profile.name} onChange={e => setProfile({ ...profile, name: e.target.value })} className="input-dark" style={{ paddingLeft: 36 }} />
                </div>
              </div>
              <div>
                <label style={{ fontSize: 13, color: "#9d9db5", marginBottom: 6, display: "block" }}>Email</label>
                <div style={{ position: "relative" }}>
                  <Mail className="w-4 h-4" style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "#5c5c7a" }} />
                  <input id="profile-email" type="email" value={profile.email} onChange={e => setProfile({ ...profile, email: e.target.value })} className="input-dark" style={{ paddingLeft: 36 }} />
                </div>
              </div>
              <div>
                <label style={{ fontSize: 13, color: "#9d9db5", marginBottom: 6, display: "block" }}>Phone</label>
                <div style={{ position: "relative" }}>
                  <Phone className="w-4 h-4" style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "#5c5c7a" }} />
                  <input id="profile-phone" type="tel" value={profile.phone} onChange={e => setProfile({ ...profile, phone: e.target.value })} className="input-dark" style={{ paddingLeft: 36 }} />
                </div>
              </div>
              <div>
                <label style={{ fontSize: 13, color: "#9d9db5", marginBottom: 6, display: "block" }}>State</label>
                <select id="profile-state" value={profile.state} onChange={e => setProfile({ ...profile, state: e.target.value })} className="input-dark">
                  {states.map(s => <option key={s} style={{ background: "#12121e" }}>{s}</option>)}
                </select>
              </div>
              <div>
                <label style={{ fontSize: 13, color: "#9d9db5", marginBottom: 6, display: "block" }}>District</label>
                <input id="profile-district" type="text" value={profile.district} onChange={e => setProfile({ ...profile, district: e.target.value })} className="input-dark" />
              </div>
              <div>
                <label style={{ fontSize: 13, color: "#9d9db5", marginBottom: 6, display: "block" }}>College / University</label>
                <input id="profile-college" type="text" value={profile.college} onChange={e => setProfile({ ...profile, college: e.target.value })} className="input-dark" />
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* NOTIFICATIONS */}
      {tab === "notifications" && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: 16, padding: 24 }}>
            <h2 style={{ fontSize: 15, fontWeight: 700, color: "#f1f0ff", marginBottom: 20 }}>Notification Channels</h2>
            {notificationChannels.map(ch => (
              <div key={ch.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 0", borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <span style={{ fontSize: 22 }}>{ch.icon}</span>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 600, color: "#f1f0ff" }}>{ch.label}</div>
                    <div style={{ fontSize: 12, color: "#5c5c7a" }}>Receive alerts via {ch.label}</div>
                  </div>
                </div>
                <Toggle id={`toggle-${ch.id}`} value={notifications[ch.id as keyof typeof notifications] as boolean} onChange={(v) => setNotifications({ ...notifications, [ch.id]: v })} />
              </div>
            ))}
          </div>

          <div style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: 16, padding: 24 }}>
            <h2 style={{ fontSize: 15, fontWeight: 700, color: "#f1f0ff", marginBottom: 20 }}>Alert Preferences</h2>
            {[
              { key: "digest", label: "Daily Digest", desc: "Get a summary of all notices every morning at 8 AM" },
              { key: "deadlineAlert", label: "Deadline Reminders", desc: "Get reminders 7 days and 1 day before deadlines" },
              { key: "urgentOnly", label: "Urgent Alerts Only", desc: "Only notify for high or critical urgency notices" },
            ].map(item => (
              <div key={item.key} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 0", borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: "#f1f0ff" }}>{item.label}</div>
                  <div style={{ fontSize: 12, color: "#5c5c7a" }}>{item.desc}</div>
                </div>
                <Toggle id={`toggle-${item.key}`} value={notifications[item.key as keyof typeof notifications] as boolean} onChange={(v) => setNotifications({ ...notifications, [item.key]: v })} />
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* PRIVACY */}
      {tab === "privacy" && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <div style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: 16, padding: 24, marginBottom: 16 }}>
            <h2 style={{ fontSize: 15, fontWeight: 700, color: "#f1f0ff", marginBottom: 20 }}>Privacy Settings</h2>
            {[
              { key: "profileVisible", label: "Public Profile", desc: "Allow others to see your saved notices activity" },
              { key: "dataSharing", label: "Analytics Data Sharing", desc: "Help improve InfoMe by sharing anonymized usage data" },
            ].map(item => (
              <div key={item.key} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 0", borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: "#f1f0ff" }}>{item.label}</div>
                  <div style={{ fontSize: 12, color: "#5c5c7a" }}>{item.desc}</div>
                </div>
                <Toggle id={`privacy-${item.key}`} value={privacy[item.key as keyof typeof privacy]} onChange={(v) => setPrivacy({ ...privacy, [item.key]: v })} />
              </div>
            ))}
          </div>
          <div style={{ background: "rgba(239,68,68,0.06)", border: "1px solid rgba(239,68,68,0.2)", borderRadius: 16, padding: 24 }}>
            <h2 style={{ fontSize: 15, fontWeight: 700, color: "#fca5a5", marginBottom: 8 }}>Danger Zone</h2>
            <p style={{ fontSize: 13, color: "#9d9db5", marginBottom: 16 }}>These actions are irreversible. Please be careful.</p>
            <div style={{ display: "flex", gap: 12 }}>
              <button onClick={() => toast.error("Account deletion requires email confirmation")} style={{ padding: "8px 16px", borderRadius: 8, background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.3)", color: "#fca5a5", fontSize: 13, cursor: "pointer" }}>
                Delete Account
              </button>
              <button onClick={() => toast.success("Your data has been exported")} style={{ padding: "8px 16px", borderRadius: 8, background: "rgba(255,255,255,0.04)", border: "1px solid var(--border)", color: "#9d9db5", fontSize: 13, cursor: "pointer" }}>
                Export My Data
              </button>
            </div>
          </div>
        </motion.div>
      )}

      {/* APPEARANCE */}
      {tab === "appearance" && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <div style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: 16, padding: 24 }}>
            <h2 style={{ fontSize: 15, fontWeight: 700, color: "#f1f0ff", marginBottom: 20 }}>Theme</h2>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12 }}>
              {[
                { id: "dark", label: "Dark Mode", desc: "Current default", bg: "#0a0a12" },
                { id: "light", label: "Light Mode", desc: "Coming soon", bg: "#f8f9fa" },
                { id: "amoled", label: "AMOLED Dark", desc: "True black", bg: "#000000" },
              ].map(t => (
                <button key={t.id} id={`theme-${t.id}`} onClick={() => { setTheme(t.id); toast.success(`${t.label} selected`); }}
                  style={{ padding: 16, borderRadius: 12, border: `2px solid ${theme === t.id ? "#d4a574" : "var(--border)"}`, background: theme === t.id ? "rgba(212,165,116,0.08)" : "rgba(255,255,255,0.02)", cursor: "pointer", textAlign: "center" }}>
                  <div style={{ width: 48, height: 32, borderRadius: 6, background: t.bg, border: "1px solid rgba(255,255,255,0.1)", margin: "0 auto 10px" }} />
                  <div style={{ fontSize: 13, fontWeight: 600, color: theme === t.id ? "#d4a574" : "#f1f0ff" }}>{t.label}</div>
                  <div style={{ fontSize: 11, color: "#5c5c7a" }}>{t.desc}</div>
                  {theme === t.id && <CheckCircle className="w-4 h-4" style={{ color: "#d4a574", margin: "8px auto 0" }} />}
                </button>
              ))}
            </div>

            <div style={{ marginTop: 24, padding: "16px", borderRadius: 12, background: "rgba(124,58,237,0.06)", border: "1px solid rgba(124,58,237,0.15)" }}>
              <div style={{ fontSize: 14, fontWeight: 600, color: "#f1f0ff", marginBottom: 4 }}>Accent Color</div>
              <div style={{ display: "flex", gap: 10, marginTop: 8 }}>
                {["#7c3aed", "#6366f1", "#3b82f6", "#10b981", "#f59e0b", "#ef4444"].map(c => (
                  <div key={c} onClick={() => toast.success("Accent color updated!")} style={{ width: 28, height: 28, borderRadius: "50%", background: c, cursor: "pointer", border: c === "#7c3aed" ? "2px solid white" : "2px solid transparent" }} />
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Save button */}
      <div style={{ marginTop: 28, display: "flex", justifyContent: "flex-end" }}>
        <button id="save-settings-btn" onClick={save} disabled={saving} className="btn-glow"
          style={{ display: "flex", alignItems: "center", gap: 8, padding: "11px 28px", borderRadius: 10, border: "none", color: "white", fontSize: 14, fontWeight: 700, cursor: saving ? "not-allowed" : "pointer", opacity: saving ? 0.7 : 1 }}>
          {saving ? <><RefreshCw className="w-4 h-4 animate-spin" /> Saving...</> : <><Save className="w-4 h-4" /> Save Changes</>}
        </button>
      </div>
    </div>
  );
}

function RefreshCw({ className, style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <svg className={className} style={style} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" /><path d="M21 3v5h-5" /><path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" /><path d="M8 16H3v5" />
    </svg>
  );
}
