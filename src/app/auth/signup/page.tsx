"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Bell, Mail, Lock, User, Phone, Eye, EyeOff, Globe, ArrowLeft, Sparkles, Sun, Moon } from "lucide-react";
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

function InputField({
  id, label, type, value, onChange, placeholder, icon, required, rightEl
}: {
  id: string; label: string; type: string; value: string;
  onChange: (v: string) => void; placeholder: string;
  icon: React.ReactNode; required?: boolean; rightEl?: React.ReactNode;
}) {
  return (
    <div>
      <label htmlFor={id} style={{ fontSize: 13, fontWeight: 600, color: "var(--text-secondary)", marginBottom: 6, display: "block" }}>
        {label} {required && <span style={{ color: "var(--accent-light)" }}>*</span>}
      </label>
      <div style={{ position: "relative" }}>
        <div style={{ position: "absolute", left: 13, top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)", pointerEvents: "none" }}>
          {icon}
        </div>
        <input
          id={id}
          type={type}
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder={placeholder}
          className="input-styled"
          style={{
            paddingLeft: 42,
            paddingRight: rightEl ? 44 : 14,
            height: 46, borderRadius: 12,
            fontSize: 14,
          }}
        />
        {rightEl && (
          <div style={{ position: "absolute", right: 0, top: 0, height: "100%", display: "flex", alignItems: "center", paddingRight: 12 }}>
            {rightEl}
          </div>
        )}
      </div>
    </div>
  );
}

export default function SignupPage() {
  const router = useRouter();
  const { isDark } = useTheme();
  const [form, setForm] = useState({ name: "", email: "", phone: "", password: "" });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.password) { toast.error("Please fill all required fields"); return; }
    if (form.password.length < 6) { toast.error("Password must be at least 6 characters"); return; }
    setLoading(true);
    try {
      const { signUp } = await import("@/lib/auth");
      await signUp(form.email, form.password, form.name);
      if (form.phone) {
        const { supabase } = await import("@/lib/supabase");
        const { data: { user } } = await supabase.auth.getUser();
        if (user) await supabase.from("profiles").update({ phone: form.phone }).eq("id", user.id);
      }
      toast.success("Account created! Let's personalize your experience.");
      router.push("/onboarding");
    } catch (error: any) {
      toast.error(error.message || "Signup failed. Please try again.");
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

      {/* Glow orbs */}
      <div className="glow-orb" style={{ top: "-15%", left: "-10%", width: 500, height: 500, background: isDark ? "rgba(124,58,237,0.10)" : "rgba(79,70,229,0.07)" }} />
      <div className="glow-orb" style={{ bottom: "-10%", right: "-10%", width: 400, height: 400, background: isDark ? "rgba(99,102,241,0.08)" : "rgba(99,102,241,0.05)" }} />

      {/* Grid pattern */}
      <div className="hero-grid" style={{ position: "fixed", inset: 0, pointerEvents: "none", opacity: 0.5 }} />

      <div style={{ display: "flex", width: "100%", maxWidth: 900, gap: 48, alignItems: "center", position: "relative", zIndex: 1 }}>

        {/* Left — Branding Panel */}
        <motion.div
          initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6 }}
          style={{ flex: 1, display: "none" }}
          className="auth-left-panel"
        >
          <Link href="/" style={{ display: "inline-flex", alignItems: "center", gap: 10, textDecoration: "none", marginBottom: 48 }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: "linear-gradient(135deg,#7c3aed,#6d28d9)", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 0 16px rgba(124,58,237,0.4)" }}>
              <Bell className="w-4 h-4" style={{ color: "white" }} />
            </div>
            <span style={{ fontSize: 20, fontWeight: 800, color: "var(--text-primary)", fontFamily: "'Manrope', sans-serif" }}>
              InfoMe
            </span>
          </Link>
          <h2 style={{ fontSize: 36, fontWeight: 900, color: "var(--text-primary)", fontFamily: "'Manrope', sans-serif", marginBottom: 16, lineHeight: 1.2 }}>
            Never miss an <span style={{ background: "linear-gradient(135deg,#a78bfa,#7c3aed)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>important notice</span> again
          </h2>
          <p style={{ color: "var(--text-secondary)", lineHeight: 1.7, marginBottom: 36, fontSize: 15 }}>
            Join 8,400+ students, job seekers, and citizens who get instant AI-powered government alerts customized for them.
          </p>
          {[
            { icon: "🎓", text: "Scholarship & exam alerts" },
            { icon: "💼", text: "Job & vacancy notifications" },
            { icon: "🚨", text: "Civic & emergency alerts" },
            { icon: "🤖", text: "AI-summarized in 2 lines" },
          ].map((f, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12, padding: "10px 14px", borderRadius: 10, background: "var(--bg-card)", border: "1px solid var(--border)" }}>
              <span style={{ fontSize: 18 }}>{f.icon}</span>
              <span style={{ fontSize: 14, color: "var(--text-secondary)", fontWeight: 500 }}>{f.text}</span>
            </div>
          ))}
        </motion.div>

        {/* Right — Form Card */}
        <motion.div
          initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
          style={{
            flex: 1, maxWidth: 460, width: "100%",
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
              <div style={{ fontSize: 22, fontWeight: 800, color: "var(--text-primary)", fontFamily: "'Manrope', sans-serif" }}>Create Account</div>
              <div style={{ fontSize: 13, color: "var(--text-muted)" }}>Join InfoMe for free</div>
            </div>
          </div>

          {/* Benefits pill */}
          <div style={{
            display: "flex", alignItems: "center", gap: 8, padding: "8px 14px",
            borderRadius: 10, background: isDark ? "rgba(124,58,237,0.08)" : "rgba(79,70,229,0.06)",
            border: `1px solid ${isDark ? "rgba(124,58,237,0.20)" : "rgba(79,70,229,0.15)"}`,
            marginBottom: 24,
          }}>
            <Sparkles className="w-4 h-4" style={{ color: accentColor, flexShrink: 0 }} />
            <span style={{ fontSize: 12, color: accentColor, fontWeight: 600 }}>Free forever · No credit card · Setup in 2 minutes</span>
          </div>

          <form onSubmit={handleSignup} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <InputField
              id="name" label="Full Name" type="text" value={form.name}
              onChange={v => setForm({ ...form, name: v })}
              placeholder="Ramesh Kumar" icon={<User className="w-4 h-4" />} required
            />
            <InputField
              id="signup-email" label="Email Address" type="email" value={form.email}
              onChange={v => setForm({ ...form, email: v })}
              placeholder="you@example.com" icon={<Mail className="w-4 h-4" />} required
            />
            <InputField
              id="phone" label="Phone (optional)" type="tel" value={form.phone}
              onChange={v => setForm({ ...form, phone: v })}
              placeholder="+91 98765 43210" icon={<Phone className="w-4 h-4" />}
            />
            <InputField
              id="signup-password" label="Password" type={showPass ? "text" : "password"}
              value={form.password} onChange={v => setForm({ ...form, password: v })}
              placeholder="Min 6 characters" icon={<Lock className="w-4 h-4" />} required
              rightEl={
                <button type="button" onClick={() => setShowPass(!showPass)}
                  style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)", display: "flex", alignItems: "center" }}>
                  {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              }
            />

            <p style={{ fontSize: 12, color: "var(--text-muted)", lineHeight: 1.6 }}>
              By creating an account you agree to our{" "}
              <Link href="#" style={{ color: accentColor, textDecoration: "none", fontWeight: 600 }}>Terms</Link> and{" "}
              <Link href="#" style={{ color: accentColor, textDecoration: "none", fontWeight: 600 }}>Privacy Policy</Link>.
            </p>

            <motion.button
              id="signup-btn"
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
              }}
            >
              {loading ? (
                <span style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
                  <svg className="animate-spin" width="16" height="16" viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="12" r="10" stroke="white" strokeWidth="3" strokeDasharray="40" strokeDashoffset="10" />
                  </svg>
                  Creating Account...
                </span>
              ) : "Create Free Account →"}
            </motion.button>
          </form>

          {/* Divider */}
          <div style={{ display: "flex", alignItems: "center", gap: 12, margin: "20px 0" }}>
            <div style={{ flex: 1, height: 1, background: "var(--border)" }} />
            <span style={{ fontSize: 12, color: "var(--text-muted)" }}>or continue with</span>
            <div style={{ flex: 1, height: 1, background: "var(--border)" }} />
          </div>

          <motion.button
            whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
            onClick={() => toast.success("Google signup coming soon!")}
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
            Sign up with Google
          </motion.button>

          <p style={{ textAlign: "center", marginTop: 22, fontSize: 13, color: "var(--text-muted)" }}>
            Already have an account?{" "}
            <Link href="/auth/login" style={{ color: accentColor, fontWeight: 700, textDecoration: "none" }}>Sign In</Link>
          </p>
        </motion.div>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        @media (min-width: 768px) {
          .auth-left-panel { display: block !important; }
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .animate-spin { animation: spin 1s linear infinite; }
      `}} />
    </div>
  );
}
