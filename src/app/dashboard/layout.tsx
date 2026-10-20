"use client";
import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Bell, LayoutDashboard, Search, FileText, Calendar,
  BellRing, Bookmark, Bot, Settings, LogOut,
  Menu, X, Shield, TrendingUp, Sun, Moon, Plus, Zap
} from "lucide-react";
import { useTheme } from "@/lib/theme-context";
import NotificationDropdown from "@/components/NotificationDropdown";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import TranslatedText from "@/components/TranslatedText";

const navItems = [
  { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
  { href: "/dashboard/live-scraping", label: "Live Scraping", icon: Zap, badge: "LIVE" },
  { href: "/dashboard/calendar", label: "Calendar", icon: Calendar },
  { href: "/dashboard/search", label: "Smart Search", icon: Search },
  { href: "/dashboard/notices", label: "Notices", icon: FileText },
  { href: "/dashboard/deadlines", label: "Deadlines", icon: Calendar },
  { href: "/dashboard/alerts", label: "Alerts", icon: BellRing, badge: 3 },
  { href: "/dashboard/saved", label: "Saved", icon: Bookmark },
  { href: "/dashboard/ai", label: "AI Assistant", icon: Bot },
  { href: "/dashboard/analytics", label: "Analytics", icon: TrendingUp },
  { href: "/dashboard/admin", label: "Admin Panel", icon: Shield },
  { href: "/dashboard/settings", label: "Settings", icon: Settings },
];

function ThemeToggle() {
  const { theme, toggleTheme, isDark } = useTheme();
  return (
    <motion.button
      onClick={toggleTheme}
      whileHover={{ scale: 1.08 }}
      whileTap={{ scale: 0.92 }}
      title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
      style={{
        width: 38, height: 38, borderRadius: "50%",
        display: "flex", alignItems: "center", justifyContent: "center",
        background: "var(--bg-card)", border: "1px solid var(--border)",
        color: "var(--text-secondary)", cursor: "pointer",
        transition: "all 0.3s ease",
      }}
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={theme}
          initial={{ rotate: -90, opacity: 0, scale: 0.5 }}
          animate={{ rotate: 0, opacity: 1, scale: 1 }}
          exit={{ rotate: 90, opacity: 0, scale: 0.5 }}
          transition={{ duration: 0.22 }}
        >
          {isDark
            ? <Sun className="w-4 h-4" style={{ color: "#d4a574" }} />
            : <Moon className="w-4 h-4" style={{ color: "#c9985f" }} />}
        </motion.div>
      </AnimatePresence>
    </motion.button>
  );
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const { isDark } = useTheme();

  const sidebarBg = isDark
    ? "linear-gradient(180deg, #0d0d1e 0%, #0f0f22 100%)"
    : "linear-gradient(180deg, #f0f0ff 0%, #ece8ff 100%)";

  const activeColor = isDark ? "#d4a574" : "#c9985f";
  const activeBg    = isDark ? "rgba(212,165,116,0.18)" : "rgba(201,152,95,0.12)";
  const hoverBg     = isDark ? "rgba(212,165,116,0.08)" : "rgba(201,152,95,0.06)";
  const textPrimary = "var(--text-primary)";
  const textSecondary = "var(--text-secondary)";
  const textMuted = "var(--text-muted)";
  const border = "var(--border)";
  const navBg = isDark ? "rgba(10,10,18,0.92)" : "rgba(255,255,255,0.85)";

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "var(--bg-primary)", transition: "background 0.35s ease" }}>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setMobileOpen(false)}
            style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.65)", zIndex: 49, backdropFilter: "blur(2px)" }}
          />
        )}
      </AnimatePresence>

      <aside
        className={`sidebar ${mobileOpen ? "open" : ""}`}
        style={{
          width: 260, display: "flex", flexDirection: "column",
          background: sidebarBg,
          boxShadow: isDark ? "4px 0 24px rgba(0,0,0,0.3)" : "4px 0 24px rgba(79,70,229,0.06)",
          transition: "all 0.35s ease",
        }}
      >
        <div style={{ padding: "22px 20px 16px", borderBottom: `1px solid ${border}` }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <Link href="/" style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none" }}>
              <div style={{
                width: 36, height: 36, borderRadius: 10,
                background: "linear-gradient(135deg,#d4a574,#c9985f)",
                display: "flex", alignItems: "center", justifyContent: "center",
                boxShadow: "0 0 16px rgba(212,165,116,0.45)",
              }}>
                <Bell className="w-4 h-4" style={{ color: "#000" }} />
              </div>
              <div>
                <div style={{ fontSize: 17, fontWeight: 800, color: textPrimary, fontFamily: "'Manrope', sans-serif", lineHeight: 1 }}>
                  InfoMe
                </div>
                <div style={{ fontSize: 9, fontWeight: 700, color: textMuted, textTransform: "uppercase", letterSpacing: 2, marginTop: 2 }}>AI Intelligence</div>
              </div>
            </Link>
            <button onClick={() => setMobileOpen(false)}
              style={{ background: "none", border: "none", cursor: "pointer", color: textMuted, display: "none" }}
              className="mobile-close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Live System Badge */}
          <div style={{
            display: "flex", alignItems: "center", gap: 6, marginTop: 14,
            padding: "5px 10px", borderRadius: 8,
            background: "rgba(16,185,129,0.10)", border: "1px solid rgba(16,185,129,0.25)",
            width: "fit-content",
          }}>
            <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#10b981", boxShadow: "0 0 6px #10b981" }} />
            <span style={{ fontSize: 10, color: "#10b981", fontWeight: 700, letterSpacing: 1 }}>SYSTEM ONLINE</span>
          </div>
        </div>

        <div style={{ padding: "12px 14px 4px" }}>
          <button style={{
            width: "100%", display: "flex", alignItems: "center", gap: 8, justifyContent: "center",
            padding: "10px", borderRadius: 12,
            background: "linear-gradient(135deg, #d4a574, #c9985f)",
            color: "#000", fontFamily: "'Manrope', sans-serif",
            fontWeight: 700, fontSize: 13, border: "none", cursor: "pointer",
            boxShadow: "0 4px 16px rgba(212,165,116,0.35)",
            transition: "all 0.3s ease",
          }}>
            <Plus className="w-4 h-4" /> New Notice
          </button>
        </div>

        <nav style={{ padding: "8px 0", flex: 1, overflowY: "auto" }}>
          {navItems.map(item => {
            const Icon = item.icon;
            const active = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                style={{
                  display: "flex", alignItems: "center", gap: 12,
                  padding: "10px 14px", borderRadius: 12, margin: "2px 10px",
                  cursor: "pointer", transition: "all 0.2s ease",
                  color: active ? activeColor : textSecondary,
                  textDecoration: "none", fontSize: 13.5, fontWeight: active ? 700 : 500,
                  background: active ? activeBg : "transparent",
                  borderLeft: active ? `2px solid ${activeColor}` : "2px solid transparent",
                }}
                onMouseEnter={e => { if (!active) { (e.currentTarget as HTMLElement).style.background = hoverBg; (e.currentTarget as HTMLElement).style.color = textPrimary; } }}
                onMouseLeave={e => { if (!active) { (e.currentTarget as HTMLElement).style.background = "transparent"; (e.currentTarget as HTMLElement).style.color = textSecondary; } }}
              >
                <Icon className="w-4 h-4" style={{ flexShrink: 0, color: active ? activeColor : "inherit" }} />
                <span style={{ flex: 1 }}><TranslatedText text={item.label} /></span>
                {item.badge && (
                  <span style={{
                    background: item.badge === "LIVE" ? "#10b981" : "#dc2626",
                    color: "white",
                    fontSize: 10, fontWeight: 700,
                    padding: "1px 6px", borderRadius: 10,
                    minWidth: 18, textAlign: "center",
                  }}>{item.badge}</span>
                )}
              </Link>
            );
          })}
        </nav>

        <div style={{ padding: "12px 14px 16px", borderTop: `1px solid ${border}` }}>
          <div style={{
            display: "flex", alignItems: "center", gap: 10,
            padding: "10px 12px", borderRadius: 12,
            background: isDark ? "rgba(212,165,116,0.05)" : "rgba(201,152,95,0.06)",
            border: `1px solid ${border}`,
          }}>
            <div style={{
              width: 34, height: 34, borderRadius: "50%",
              background: "linear-gradient(135deg,#d4a574,#c9985f)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 13, fontWeight: 700, color: "#000", flexShrink: 0,
            }}>RK</div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: textPrimary, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>Ramesh Kumar</div>
              <div style={{ fontSize: 11, color: textMuted }}>Lucknow, UP</div>
            </div>
            <Link href="/" title="Sign Out" style={{ color: textMuted, display: "flex", alignItems: "center" }}>
              <LogOut className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </aside>

      <div id="main-content" style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>
        <header style={{
          position: "sticky", top: 0, zIndex: 40,
          height: 64, background: navBg,
          backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)",
          borderBottom: `1px solid ${border}`,
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "0 28px", gap: 16,
          transition: "all 0.35s ease",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, flex: 1 }}>
            <button onClick={() => setMobileOpen(true)} id="mobile-menu-btn"
              style={{ display: "none", background: "none", border: "none", cursor: "pointer", color: textSecondary, marginRight: 4 }}
            >
              <Menu className="w-5 h-5" />
            </button>
            <div style={{ position: "relative", maxWidth: 380, width: "100%" }}>
              <Search className="w-4 h-4" style={{
                position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)",
                color: textMuted, pointerEvents: "none",
              }} />
              <input
                className="input-styled"
                placeholder="Search notices, analytics..."
                style={{ paddingLeft: 38, paddingRight: 14, height: 38, borderRadius: 10 }}
              />
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <LanguageSwitcher />
            <ThemeToggle />
            <NotificationDropdown />

            <div style={{ width: 1, height: 28, background: border }} />
            <div style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer" }}>
              <div style={{ textAlign: "right" }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: textPrimary, lineHeight: 1 }}>Ramesh Kumar</div>
                <div style={{ fontSize: 10, color: textMuted, textTransform: "uppercase", letterSpacing: 0.5, marginTop: 2 }}>Admin Access</div>
              </div>
              <div style={{
                width: 36, height: 36, borderRadius: 10,
                background: "linear-gradient(135deg,#d4a574,#c9985f)",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 12, fontWeight: 700, color: "#000",
                boxShadow: "0 0 12px rgba(212,165,116,0.3)",
              }}>RK</div>
            </div>
          </div>
        </header>

        <main style={{ flex: 1, overflowY: "auto", background: "var(--bg-primary)" }}>
          <div style={{ maxWidth: "1400px", margin: "0 auto", padding: "32px 24px" }}>
            {children}
          </div>
        </main>
      </div>

      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        style={{
          position: "fixed", bottom: 28, right: 28, zIndex: 60,
          width: 58, height: 58, borderRadius: "50%",
          background: "linear-gradient(135deg,#d4a574,#c9985f)",
          color: "#000", border: "none", cursor: "pointer",
          display: "flex", alignItems: "center", justifyContent: "center",
          boxShadow: "0 8px 32px rgba(212,165,116,0.50)",
        }}
        title="New Notice"
      >
        <Plus className="w-6 h-6" />
      </motion.button>

      <style dangerouslySetInnerHTML={{ __html: `
        @media (max-width: 1024px) {
          aside { position: fixed; left: 0; top: 0; bottom: 0; z-index: 50; transform: translateX(-100%); transition: transform 0.3s; }
          aside.open { transform: translateX(0); width: 260px !important; }
          #main-content { margin-left: 0 !important; }
          .mobile-close { display: block !important; }
          #mobile-menu-btn { display: flex !important; }
        }
        @media (min-width: 1025px) {
          aside { position: fixed; left: 0; top: 0; bottom: 0; z-index: 40; }
          #main-content { margin-left: 260px; }
        }
      `}} />
    </div>
  );
}
