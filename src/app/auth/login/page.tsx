"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Bell, Mail, Lock, Eye, EyeOff, ArrowLeft, Sun, Moon, Zap } from "lucide-react";
import { toast } from "sonner";
import { useTheme } from "@/lib/theme-context";

function ThemeToggle() {
  const { theme, toggleTheme, isDark } = useTheme();
  return (
    <motion.button
      onClick={toggleTheme}
      whileHover={{ scale: 1.08 }}
      whileTap={{ scale: 0.92 }}
      title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
      style={{
        position: "fixed", top: 20, right: 20, zIndex: 100,
        width: 42, height: 42, borderRadius: "50%",
        display: "flex", alignItems: "center", justifyContent: "center",
        background: "var(--bg-card)", border: "1px solid var(--border)",
        cursor: "pointer", transition: "all 0.3s ease",
        boxShadow: "0 4px 16px rgba(0,0,0,0.2)",
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
            ? <Sun className="w-4 h-4" style={{ color: "#fbbf24" }} />
            : <Moon className="w-4 h-4" style={{ color: "#7c3aed" }} />}
        </motion.div>
      </AnimatePresence>
    </motion.button>
  );
}

const liveAlerts = [
  { icon: "🎓", text: "AKTU Result Published", time: "1m ago" },
  { icon: "💼", text: "UPPSC Vacancy: 5000 Posts", time: "8m ago" },
  { icon: "🏆", text: "PM Scholarship Open", time: "32m ago" },
];

export default function LoginPage() {
  const router = useRouter();
  const { isDark } = useTheme();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) { toast.error("Please fill in all fields"); return; }
    setLoading(true);
    try {
      const { signIn } = await import("@/lib/auth");
      await signIn(email, password);
      toast.success("Welcome back to InfoMe! 👋");
      router.push("/dashboard");
    } catch (error: any) {
      toast.error(error.message || "Login failed. Please check your credentials.");
    } finally {
      setLoading(false);
    }
  };

  const accentColor = isDark ? "#a78bfa" : "#4f46e5";

  return (
    <div style={{
      minHeight: "100vh",
      background: "var(--bg-primary)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: 24,
      position: "relative",
      overflow: "hidden",
      transition: "background 0.35s ease",
    }}>
      <ThemeToggle />

      {/* Background */}
      <div className="hero-grid" style={{ position: "fixed", inset: 0, pointerEvents: "none", opacity: 0.4 }} />
      <div className="glow-orb" style={{ top: "-20%", right: "-10%", width: 600, height: 600, background: isDark ? "rgba(124,58,237,0.09)" : "rgba(79,70,229,0.06)" }} />
      <div className="glow-orb" style={{ bottom: "-15%", left: "-10%", width: 500, height: 500, background: isDark ? "rgba(99,102,241,0.07)" : "rgba(99,102,241,0.04)" }} />

      <div style={{ display: "flex", width: "100%", maxWidth: 900, gap: 48, alignItems: "center", position: "relative", zIndex: 1 }}>

        {/* Left panel — Live Alerts Preview */}
        <motion.div
          initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6 }}
          className="auth-left-panel"
          style={{ flex: 1, display: "none" }}
        >
          <Link href="/" style={{ display: "inline-flex", alignItems: "center", gap: 10, textDecoration: "none", marginBottom: 48 }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: "linear-gradient(135deg,#7c3aed,#6d28d9)", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 0 16px rgba(124,58,237,0.4)" }}>
              <Bell className="w-4 h-4" style={{ color: "white" }} />
            </div>
            <span style={{ fontSize: 20, fontWeight: 800, color: "var(--text-primary)", fontFamily: "'Manrope', sans-serif" }}>
              InfoMe
            </span>
          </Link>

          <h2 style={{ fontSize: 34, fontWeight: 900, color: "var(--text-primary)", fontFamily: "'Manrope', sans-serif", marginBottom: 16, lineHeight: 1.2 }}>
            Your AI-powered <span style={{ background: "linear-gradient(135deg,#a78bfa,#7c3aed)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>notice radar</span> awaits
          </h2>
          <p style={{ color: "var(--text-secondary)", lineHeight: 1.7, fontSize: 15, marginBottom: 32 }}>
            While you were away, our AI never stopped monitoring. Here's what's live right now:
          </p>

          {/* Live alerts preview */}
          <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 28 }}>
            {liveAlerts.map((a, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.15 + 0.3 }}
                style={{
                  display: "flex", alignItems: "center", gap: 12,
                  padding: "12px 16px", borderRadius: 14,
                  background: "var(--bg-card)", border: "1px solid var(--border)",
                }}
              >
                <span style={{ fontSize: 20 }}>{a.icon}</span>
                <span style={{ flex: 1, fontSize: 14, fontWeight: 500, color: "var(--text-primary)" }}>{a.text}</span>
                <span style={{ fontSize: 11, color: "var(--text-muted)" }}>{a.time}</span>
              </motion.div>
            ))}
          </div>

          {/* Stats row */}
          <div style={{ display: "flex", gap: 16 }}>
            {[{ v: "1,247", l: "Notices Today" }, { v: "99.2%", l: "Accuracy" }, { v: "8,400+", l: "Users" }].map((s, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 + 0.6 }}
                style={{ flex: 1, textAlign: "center", padding: "12px 8px", borderRadius: 12, background: "var(--bg-card)", border: "1px solid var(--border)" }}
              >
                <div style={{ fontSize: 20, fontWeight: 900, color: "var(--text-primary)", fontFamily: "'Manrope', sans-serif" }}>{s.v}</div>
                <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 2 }}>{s.l}</div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Right — Login Card */}
        <motion.div
          initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
          style={{
            flex: 1, maxWidth: 440, width: "100%",
            background: "var(--bg-card)",
            backdropFilter: "blur(20px)",
            border: "1px solid var(--border)",
            borderRadius: 24, padding: 36,
            boxShadow: isDark ? "0 24px 80px rgba(0,0,0,0.4)" : "0 24px 80px rgba(79,70,229,0.10)",
          }}
        >
          <Link href="/" style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 13, color: "var(--text-muted)", textDecoration: "none", marginBottom: 24, fontWeight: 500 }}>
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Home
          </Link>

          {/* Header */}
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 28 }}>
            <div style={{ width: 44, height: 44, borderRadius: 12, background: "linear-gradient(135deg,#7c3aed,#6d28d9)", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 0 20px rgba(124,58,237,0.4)" }}>
              <Bell className="w-5 h-5" style={{ color: "white" }} />
            </div>
            <div>
              <div style={{ fontSize: 22, fontWeight: 800, color: "var(--text-primary)", fontFamily: "'Manrope', sans-serif" }}>Welcome Back</div>
              <div style={{ fontSize: 13, color: "var(--text-muted)" }}>Sign in to your dashboard</div>
            </div>
          </div>

          {/* AI active hint */}
          <div style={{
            display: "flex", alignItems: "center", gap: 8, padding: "8px 14px",
            borderRadius: 10, background: "rgba(16,185,129,0.08)", border: "1px solid rgba(16,185,129,0.20)",
            marginBottom: 24,
          }}>
            <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#10b981", boxShadow: "0 0 6px #10b981" }} />
            <Zap className="w-3.5 h-3.5" style={{ color: "#10b981" }} />
            <span style={{ fontSize: 12, color: "#10b981", fontWeight: 600 }}>AI system active · 8 new notices since last login</span>
          </div>

          <form onSubmit={handleLogin} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {/* Email */}
            <div>
              <label htmlFor="email" style={{ fontSize: 13, fontWeight: 600, color: "var(--text-secondary)", marginBottom: 6, display: "block" }}>
                Email Address
              </label>
              <div style={{ position: "relative" }}>
                <Mail className="w-4 h-4" style={{ position: "absolute", left: 13, top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)", pointerEvents: "none" }} />
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="input-styled"
                  style={{ paddingLeft: 42, height: 46, borderRadius: 12, fontSize: 14 }}
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                <label htmlFor="password" style={{ fontSize: 13, fontWeight: 600, color: "var(--text-secondary)" }}>Password</label>
                <Link href="#" style={{ fontSize: 12, color: accentColor, textDecoration: "none", fontWeight: 600 }}>Forgot password?</Link>
              </div>
              <div style={{ position: "relative" }}>
                <Lock className="w-4 h-4" style={{ position: "absolute", left: 13, top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)", pointerEvents: "none" }} />
                <input
                  id="password"
                  type={showPass ? "text" : "password"}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="input-styled"
                  style={{ paddingLeft: 42, paddingRight: 44, height: 46, borderRadius: 12, fontSize: 14 }}
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  style={{ position: "absolute", right: 13, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)" }}
                >
                  {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <motion.button
              id="login-btn"
              type="submit"
              disabled={loading}
              whileHover={!loading ? { scale: 1.02, boxShadow: "0 0 32px rgba(124,58,237,0.6)" } : {}}
              whileTap={!loading ? { scale: 0.98 } : {}}
              style={{
                padding: "13px",
                borderRadius: 12,
                border: "none",
                background: loading ? "rgba(124,58,237,0.5)" : "linear-gradient(135deg, #7c3aed, #6366f1)",
                color: "white",
                fontSize: 15,
                fontWeight: 700,
                cursor: loading ? "not-allowed" : "pointer",
                fontFamily: "'Manrope', sans-serif",
                boxShadow: "0 4px 20px rgba(124,58,237,0.35)",
                transition: "all 0.3s ease",
                marginTop: 4,
              }}
            >
              {loading ? (
                <span style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
                  <svg className="animate-spin" width="16" height="16" viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="12" r="10" stroke="white" strokeWidth="3" strokeDasharray="40" strokeDashoffset="10" />
                  </svg>
                  Signing in...
                </span>
              ) : "Sign In →"}
            </motion.button>
          </form>

          {/* Divider */}
          <div style={{ display: "flex", alignItems: "center", gap: 12, margin: "22px 0" }}>
            <div style={{ flex: 1, height: 1, background: "var(--border)" }} />
            <span style={{ fontSize: 12, color: "var(--text-muted)" }}>or continue with</span>
            <div style={{ flex: 1, height: 1, background: "var(--border)" }} />
          </div>

          <motion.button
            whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
            onClick={() => toast.success("Google login coming soon!")}
            style={{
              width: "100%", padding: "12px", borderRadius: 12,
              background: "var(--bg-card-hover)", border: "1px solid var(--border)",
              color: "var(--text-primary)", fontSize: 14, fontWeight: 600,
              cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
              transition: "all 0.2s ease",
            }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
            Continue with Google
          </motion.button>

          <p style={{ textAlign: "center", marginTop: 22, fontSize: 13, color: "var(--text-muted)" }}>
            Don't have an account?{" "}
            <Link href="/auth/signup" style={{ color: accentColor, fontWeight: 700, textDecoration: "none" }}>Sign Up Free</Link>
          </p>
        </motion.div>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        @media (min-width: 768px) { .auth-left-panel { display: block !important; } }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        .animate-spin { animation: spin 1s linear infinite; }
      `}} />
    </div>
  );
}
