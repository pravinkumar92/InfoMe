"use client";
import { useState, useEffect, useRef, Suspense } from "react";
import { motion, AnimatePresence, useScroll, useTransform } from "framer-motion";
import Link from "next/link";
import { Canvas, useFrame } from "@react-three/fiber";
import { Sphere, MeshDistortMaterial, Float, Stars, Torus, Box } from "@react-three/drei";
import * as THREE from "three";
import {
  Bell, Search, Shield, Zap, Globe, BookOpen, Award,
  ChevronRight, CheckCircle, Star, ArrowRight,
  BellRing, FileText, Calendar, Users, TrendingUp, Sparkles,
  Sun, Moon, Menu, X, Play
} from "lucide-react";
import { useTheme } from "@/lib/theme-context";

/* ─── 3D SCENE COMPONENTS ─── */

// Animated Clock Component
function AnimatedClock() {
  const clockRef = useRef<THREE.Group>(null);
  const hourHandRef = useRef<THREE.Mesh>(null);
  const minuteHandRef = useRef<THREE.Mesh>(null);
  const secondHandRef = useRef<THREE.Mesh>(null);
  
  useFrame((state) => {
    if (!clockRef.current) return;
    
    // Rotate the entire clock slowly
    clockRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.3) * 0.2;
    clockRef.current.rotation.x = Math.cos(state.clock.elapsedTime * 0.2) * 0.1;
    
    // Animate clock hands
    if (secondHandRef.current) {
      secondHandRef.current.rotation.z = -state.clock.elapsedTime * 2; // Fast rotation
    }
    if (minuteHandRef.current) {
      minuteHandRef.current.rotation.z = -state.clock.elapsedTime * 0.1; // Medium rotation
    }
    if (hourHandRef.current) {
      hourHandRef.current.rotation.z = -state.clock.elapsedTime * 0.01; // Slow rotation
    }
  });
  
  return (
    <group ref={clockRef} position={[0, 0, 0]}>
      {/* Clock Face */}
      <mesh>
        <cylinderGeometry args={[2, 2, 0.2, 64]} />
        <meshStandardMaterial
          color="#d4a574"
          metalness={0.8}
          roughness={0.2}
          emissive="#d4a574"
          emissiveIntensity={0.3}
        />
      </mesh>
      
      {/* Clock Border */}
      <mesh>
        <torusGeometry args={[2, 0.1, 16, 64]} />
        <meshStandardMaterial
          color="#c9985f"
          metalness={0.9}
          roughness={0.1}
          emissive="#c9985f"
          emissiveIntensity={0.5}
        />
      </mesh>
      
      {/* Hour Markers */}
      {[...Array(12)].map((_, i) => {
        const angle = (i * Math.PI) / 6;
        const x = Math.sin(angle) * 1.6;
        const y = Math.cos(angle) * 1.6;
        return (
          <mesh key={i} position={[x, y, 0.15]}>
            <boxGeometry args={[0.1, 0.3, 0.1]} />
            <meshStandardMaterial
              color="#1a1a1a"
              metalness={0.5}
              roughness={0.5}
            />
          </mesh>
        );
      })}
      
      {/* Hour Hand */}
      <mesh ref={hourHandRef} position={[0, 0.4, 0.2]}>
        <boxGeometry args={[0.15, 0.8, 0.1]} />
        <meshStandardMaterial
          color="#1a1a1a"
          metalness={0.7}
          roughness={0.3}
        />
      </mesh>
      
      {/* Minute Hand */}
      <mesh ref={minuteHandRef} position={[0, 0.6, 0.25]}>
        <boxGeometry args={[0.1, 1.2, 0.1]} />
        <meshStandardMaterial
          color="#2a2a2a"
          metalness={0.7}
          roughness={0.3}
        />
      </mesh>
      
      {/* Second Hand */}
      <mesh ref={secondHandRef} position={[0, 0.7, 0.3]}>
        <boxGeometry args={[0.05, 1.4, 0.05]} />
        <meshStandardMaterial
          color="#ef4444"
          metalness={0.9}
          roughness={0.1}
          emissive="#ef4444"
          emissiveIntensity={0.5}
        />
      </mesh>
      
      {/* Center Pin */}
      <mesh position={[0, 0, 0.35]}>
        <sphereGeometry args={[0.15, 32, 32]} />
        <meshStandardMaterial
          color="#1a1a1a"
          metalness={0.9}
          roughness={0.1}
        />
      </mesh>
    </group>
  );
}

function Scene3D({ isDark }: { isDark: boolean }) {
  return (
    <>
      <ambientLight intensity={0.8} />
      <pointLight position={[10, 10, 10]} intensity={2.5} color={isDark ? "#d4a574" : "#3b82f6"} />
      <pointLight position={[-10, -5, -10]} intensity={1.5} color={isDark ? "#c9985f" : "#2563eb"} />
      <pointLight position={[5, 5, 5]} intensity={1.2} color={isDark ? "#e0b886" : "#60a5fa"} />
      <pointLight position={[0, 0, 5]} intensity={2.0} color={isDark ? "#d4a574" : "#3b82f6"} />

      <Stars radius={80} depth={50} count={isDark ? 1500 : 800} factor={4} saturation={0.5} fade speed={1} />

      <Float speed={1.5} rotationIntensity={0.3} floatIntensity={0.5}>
        <AnimatedClock />
      </Float>
    </>
  );
}

/* ─── DATA ─── */
const floatingNotices = [
  { icon: "🎓", text: "AKTU Exam Schedule Released", time: "2m ago", type: "Exam" },
  { icon: "💼", text: "UPPSC 5000 Vacancies Open", time: "15m ago", type: "Job" },
  { icon: "🏆", text: "PM Scholarship Applications Live", time: "1h ago", type: "Scholarship" },
  { icon: "🚨", text: "Flood Alert – Eastern UP", time: "3m ago", type: "Alert" },
];

const features = [
  { icon: <Zap className="w-6 h-6" />, title: "Real-Time Alerts", desc: "Get notified the moment a notice is published. Never miss a deadline again.", color: "#f59e0b", bg: "rgba(245,158,11,0.12)" },
  { icon: <Sparkles className="w-6 h-6" />, title: "AI Summarization", desc: "Complex government notices summarized in 2 lines by GPT-4. Easy to understand.", color: "#a78bfa", bg: "rgba(167,139,250,0.12)" },
  { icon: <Globe className="w-6 h-6" />, title: "50+ Sources", desc: "Tracks government portals, universities, civic bodies, and news sources automatically.", color: "#38bdf8", bg: "rgba(56,189,248,0.12)" },
  { icon: <Bell className="w-6 h-6" />, title: "Multi-Channel", desc: "WhatsApp, Telegram, Email, Push – get alerts on every device you own.", color: "#10b981", bg: "rgba(16,185,129,0.12)" },
  { icon: <Search className="w-6 h-6" />, title: "Smart Search", desc: "Search inside PDFs, filter by category, state, date and source in seconds.", color: "#f472b6", bg: "rgba(244,114,182,0.12)" },
  { icon: <Shield className="w-6 h-6" />, title: "Verified Sources", desc: "All sources are government-verified. No fake news. No spam. Zero noise.", color: "#10b981", bg: "rgba(16,185,129,0.12)" },
];

const stats = [
  { label: "Notices Tracked", value: "1,247+", icon: <FileText className="w-5 h-5" /> },
  { label: "Active Users", value: "8,400+", icon: <Users className="w-5 h-5" /> },
  { label: "Alerts Sent", value: "24,600+", icon: <BellRing className="w-5 h-5" /> },
  { label: "Sources Monitored", value: "58+", icon: <Globe className="w-5 h-5" /> },
];

const testimonials = [
  { name: "Priya Sharma", role: "B.Tech Student, AKTU", text: "I got the scholarship alert 2 hours before the deadline. Saved my ₹36,000 scholarship!", avatar: "PS", stars: 5 },
  { name: "Rajesh Kumar", role: "Job Aspirant, Lucknow", text: "UPPSC vacancy came directly to my WhatsApp. Applied instantly. InfoMe is a life saver!", avatar: "RK", stars: 5 },
  { name: "Anita Verma", role: "PG Student, BU Jhansi", text: "Result dekha bina kuch nahi hota tha. Ab notification aata hai turant. Bahut helpful!", avatar: "AV", stars: 5 },
];

const categories = [
  { label: "Scholarships", icon: "🏆", color: "#7c3aed" },
  { label: "Jobs & Vacancies", icon: "💼", color: "#6366f1" },
  { label: "Exam Schedules", icon: "📝", color: "#8b5cf6" },
  { label: "Results", icon: "🎯", color: "#9333ea" },
  { label: "Admissions", icon: "🎓", color: "#7e22ce" },
  { label: "Tenders", icon: "📋", color: "#6d28d9" },
  { label: "Civic Alerts", icon: "🚨", color: "#dc2626" },
  { label: "Admit Cards", icon: "🪪", color: "#4f46e5" },
];

/* ─── THEME TOGGLE BUTTON ─── */
function ThemeToggle() {
  const { theme, toggleTheme, isDark } = useTheme();
  return (
    <motion.button
      onClick={toggleTheme}
      whileHover={{ scale: 1.08 }}
      whileTap={{ scale: 0.92 }}
      style={{
        width: 44, height: 44, borderRadius: "50%",
        display: "flex", alignItems: "center", justifyContent: "center",
        background: "var(--bg-card)", border: "1px solid var(--border)",
        color: "var(--text-primary)", cursor: "pointer",
        transition: "all 0.3s ease",
      }}
      aria-label="Toggle theme"
      title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={theme}
          initial={{ rotate: -90, opacity: 0, scale: 0.5 }}
          animate={{ rotate: 0, opacity: 1, scale: 1 }}
          exit={{ rotate: 90, opacity: 0, scale: 0.5 }}
          transition={{ duration: 0.25 }}
        >
          {isDark ? <Sun className="w-5 h-5" style={{ color: "#d4a574" }} /> : <Moon className="w-5 h-5" style={{ color: "#c9985f" }} />}
        </motion.div>
      </AnimatePresence>
    </motion.button>
  );
}

/* ─── MAIN PAGE ─── */
export default function LandingPage() {
  const [noticeIdx, setNoticeIdx] = useState(0);
  const { isDark } = useTheme();

  useEffect(() => {
    const t = setInterval(() => setNoticeIdx(i => (i + 1) % floatingNotices.length), 3000);
    return () => clearInterval(t);
  }, []);

  const accentColor = isDark ? "#d4a574" : "#3b82f6";
  const textPrimary = isDark ? "#ffffff" : "#0f172a";
  const textSecondary = isDark ? "#d4d4d4" : "#475569";
  const textMuted = isDark ? "#737373" : "#94a3b8";
  const bgCard = "var(--bg-card)";
  const border = "var(--border)";
  const borderHover = "var(--border-hover)";
  const navBg = "var(--nav-bg)";
  const bgPrimary = "var(--bg-primary)";
  
  // Hero section always has black overlay, so text should always be light
  const heroTextPrimary = "#ffffff";
  const heroTextSecondary = "#e5e5e5";
  const heroTextMuted = "#a3a3a3";

  return (
    <div style={{ background: bgPrimary, minHeight: "100vh", fontFamily: "'Inter', sans-serif" }}>

      {/* ─── NAVBAR ─── */}
      <nav style={{
        position: "sticky", top: 0, zIndex: 50,
        background: navBg,
        backdropFilter: "blur(20px)",
        borderBottom: `1px solid ${border}`,
        transition: "all 0.35s ease",
      }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 24px", height: 64, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <Link href="/" style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none" }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: "linear-gradient(135deg,#d4a574,#c9985f)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Bell className="w-5 h-5" style={{ color: "#000" }} />
            </div>
            <span style={{ fontSize: 20, fontWeight: 800, color: textPrimary, fontFamily: "'Manrope', sans-serif" }}>
              InfoMe
            </span>
          </Link>

          {/* Nav Links */}
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            {["Features", "Workflow", "Stats", "Pricing"].map((item) => (
              <a key={item} href={`#${item.toLowerCase()}`} style={{
                padding: "6px 14px", borderRadius: 8, color: textSecondary,
                fontSize: 14, fontWeight: 500, textDecoration: "none",
                transition: "all 0.2s ease",
                fontFamily: "'Manrope', sans-serif",
              }}
                onMouseEnter={e => { (e.target as HTMLElement).style.color = textPrimary; (e.target as HTMLElement).style.background = isDark ? "rgba(212,165,116,0.10)" : "rgba(201,152,95,0.08)"; }}
                onMouseLeave={e => { (e.target as HTMLElement).style.color = textSecondary; (e.target as HTMLElement).style.background = "transparent"; }}
              >
                {item}
              </a>
            ))}
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <ThemeToggle />
            <Link href="/auth/login" style={{
              padding: "8px 18px", borderRadius: 8, color: textSecondary,
              fontSize: 14, fontWeight: 500, textDecoration: "none",
              border: `1px solid ${border}`, transition: "all 0.2s ease",
            }}>Login</Link>
            <Link href="/auth/signup" className="btn-glow-indigo" style={{
              padding: "8px 20px", borderRadius: 10,
              fontSize: 14, fontWeight: 700, textDecoration: "none",
            }}>Get Started Free</Link>
          </div>
        </div>
      </nav>

      {/* ─── HERO ─── */}
      <section className="hero-grid" style={{
        position: "relative", minHeight: "100vh",
        display: "flex", alignItems: "center",
        overflow: "hidden",
        backgroundImage: "url('/capitol-building.jpg')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        backgroundAttachment: "fixed",
      }}>
        {/* Overlay for better text readability - black for all themes */}
        <div style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: "linear-gradient(135deg, rgba(0,0,0,0.88) 0%, rgba(0,0,0,0.85) 50%, rgba(0,0,0,0.90) 100%)",
          zIndex: 0,
        }} />
        {/* Glow orbs */}
        <div className="glow-orb" style={{ top: "10%", left: "5%", width: 500, height: 500, background: isDark ? "rgba(212,165,116,0.08)" : "rgba(212,165,116,0.06)" }} />
        <div className="glow-orb" style={{ top: "30%", right: "5%", width: 400, height: 400, background: isDark ? "rgba(212,165,116,0.06)" : "rgba(212,165,116,0.04)" }} />
        <div className="glow-orb" style={{ bottom: "5%", left: "30%", width: 350, height: 350, background: isDark ? "rgba(212,165,116,0.05)" : "rgba(212,165,116,0.03)" }} />

        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "80px 24px 60px", width: "100%", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 64, alignItems: "center", position: "relative", zIndex: 1 }}>

          {/* Left – Copy */}
          <div>
            <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
              <div style={{
                display: "inline-flex", alignItems: "center", gap: 8,
                padding: "6px 16px", borderRadius: 20,
                background: isDark ? "rgba(212,165,116,0.12)" : "rgba(201,152,95,0.08)",
                border: `1px solid ${isDark ? "rgba(212,165,116,0.30)" : "rgba(201,152,95,0.20)"}`,
                marginBottom: 24, fontSize: 13, color: accentColor,
                fontFamily: "'Manrope', sans-serif", fontWeight: 600,
              }}>
                <Sparkles className="w-3.5 h-3.5" />
                <span>AI-Powered Alert System for India</span>
              </div>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.1 }}
              style={{ fontSize: "clamp(36px,5vw,64px)", fontWeight: 900, lineHeight: 1.1, marginBottom: 24, fontFamily: "'Manrope', sans-serif" }}
            >
              <span style={{ color: heroTextPrimary }}>Never Miss a </span>
              <span style={{ 
                backgroundImage: isDark 
                  ? "linear-gradient(135deg,#e0b886,#d4a574)" 
                  : "linear-gradient(135deg,#60a5fa,#3b82f6)", 
                WebkitBackgroundClip: "text", 
                WebkitTextFillColor: "transparent", 
                backgroundClip: "text" 
              }}>Government Notice</span>
              <br />
              <span style={{ color: heroTextPrimary }}>or </span>
              <span style={{ 
                backgroundImage: isDark 
                  ? "linear-gradient(135deg,#e0b886,#d4a574)" 
                  : "linear-gradient(135deg,#60a5fa,#3b82f6)", 
                WebkitBackgroundClip: "text", 
                WebkitTextFillColor: "transparent", 
                backgroundClip: "text" 
              }}>University Alert</span>
              <span style={{ color: heroTextPrimary }}> Again</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}
              style={{ fontSize: 18, color: heroTextSecondary, maxWidth: 520, marginBottom: 40, lineHeight: 1.75 }}
            >
              InfoMe tracks 50+ government portals, universities and civic bodies. Get instant AI-summarized alerts on WhatsApp, Telegram, Email and Push.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
              style={{ display: "flex", gap: 14, flexWrap: "wrap", marginBottom: 40 }}
            >
              <Link href="/onboarding" className="btn-glow" style={{
                display: "inline-flex", alignItems: "center", gap: 8,
                padding: "14px 28px", borderRadius: 12,
                fontSize: 16, fontWeight: 700, textDecoration: "none",
                fontFamily: "'Manrope', sans-serif",
              }}>
                Start for Free <ArrowRight className="w-4 h-4" />
              </Link>
              <Link href="/dashboard" style={{
                display: "inline-flex", alignItems: "center", gap: 8,
                padding: "14px 28px", borderRadius: 12,
                background: bgCard,
                border: `1px solid ${border}`,
                color: textPrimary, fontSize: 16, fontWeight: 600, textDecoration: "none",
                transition: "all 0.3s ease",
              }}>
                <Play className="w-4 h-4" style={{ color: accentColor }} />
                View Demo
              </Link>
            </motion.div>

            {/* Live Notice Ticker */}
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }}
              style={{
                display: "inline-flex", alignItems: "center", gap: 12,
                padding: "10px 18px", borderRadius: 12,
                background: "rgba(26, 26, 26, 0.85)", border: "1px solid rgba(212, 165, 116, 0.25)",
                maxWidth: 400,
              }}
            >
              <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#10b981", boxShadow: "0 0 8px #10b981", flexShrink: 0 }} />
              <AnimatePresence mode="wait">
                <motion.div
                  key={noticeIdx}
                  initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.3 }}
                  style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13 }}
                >
                  <span>{floatingNotices[noticeIdx].icon}</span>
                  <span style={{ color: heroTextSecondary }}>{floatingNotices[noticeIdx].text}</span>
                  <span style={{ color: heroTextMuted, marginLeft: "auto", whiteSpace: "nowrap" }}>{floatingNotices[noticeIdx].time}</span>
                </motion.div>
              </AnimatePresence>
            </motion.div>
          </div>

          {/* Right – 3D Canvas */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.8, delay: 0.2 }}
            style={{ height: 520, position: "relative" }}
          >
            <Canvas camera={{ position: [0, 0, 6], fov: 50 }} gl={{ antialias: true, alpha: true }}>
              <Suspense fallback={null}>
                <Scene3D isDark={isDark} />
              </Suspense>
            </Canvas>

            {/* Floating UI Cards over canvas */}
            <motion.div
              className="glass-card float-anim"
              style={{
                position: "absolute", top: "12%", left: "-8%",
                padding: "12px 16px", borderRadius: 14,
                display: "flex", alignItems: "center", gap: 10,
                minWidth: 200, zIndex: 10,
                background: "rgba(26, 26, 26, 0.85)",
                border: "1px solid rgba(212, 165, 116, 0.25)",
              }}
              initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 1 }}
            >
              <div style={{ width: 32, height: 32, borderRadius: 8, background: "rgba(16,185,129,0.2)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <CheckCircle className="w-4 h-4" style={{ color: "#10b981" }} />
              </div>
              <div>
                <div style={{ fontSize: 10, fontWeight: 700, color: heroTextMuted, textTransform: "uppercase", letterSpacing: 1 }}>Tender Deadline</div>
                <div style={{ fontSize: 13, fontWeight: 700, color: heroTextPrimary }}>Oct 24, 2025</div>
              </div>
            </motion.div>

            <motion.div
              className="glass-card float-anim-delayed"
              style={{
                position: "absolute", bottom: "18%", right: "-6%",
                padding: "12px 16px", borderRadius: 14,
                display: "flex", alignItems: "center", gap: 10,
                minWidth: 190, zIndex: 10,
                background: "rgba(26, 26, 26, 0.85)",
                border: "1px solid rgba(212, 165, 116, 0.25)",
              }}
              initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 1.2 }}
            >
              <div style={{ width: 32, height: 32, borderRadius: 8, background: "rgba(212,165,116,0.2)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Sparkles className="w-4 h-4" style={{ color: "#d4a574" }} />
              </div>
              <div>
                <div style={{ fontSize: 10, fontWeight: 700, color: heroTextMuted, textTransform: "uppercase", letterSpacing: 1 }}>AI Extracted</div>
                <div style={{ fontSize: 13, fontWeight: 700, color: heroTextPrimary }}>3 Key Dates Found</div>
              </div>
            </motion.div>

            <motion.div
              className="glass-card float-anim-slow"
              style={{
                position: "absolute", top: "48%", right: "2%",
                padding: "10px 14px", borderRadius: 12,
                display: "flex", alignItems: "center", gap: 8, zIndex: 10,
                background: "rgba(26, 26, 26, 0.85)",
                border: "1px solid rgba(212, 165, 116, 0.25)",
              }}
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.4 }}
            >
              <Bell className="w-4 h-4" style={{ color: "#d4a574" }} />
              <span style={{ fontSize: 12, fontWeight: 700, color: heroTextPrimary }}>🚨 Critical Alert</span>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ─── STATS ─── */}
      <section id="stats" style={{ maxWidth: 1200, margin: "0 auto", padding: "80px 24px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 20 }}>
          {stats.map((s, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }} transition={{ delay: i * 0.1 }}
              whileHover={{ y: -4, boxShadow: "0 12px 40px var(--accent-glow)" }}
              style={{
                background: bgCard, border: `1px solid ${border}`,
                borderRadius: 16, padding: 28, textAlign: "center",
                transition: "all 0.3s ease",
              }}
            >
              <div style={{ display: "flex", justifyContent: "center", marginBottom: 12, color: accentColor }}>{s.icon}</div>
              <div style={{ fontSize: 36, fontWeight: 800, color: textPrimary, fontFamily: "'Manrope', sans-serif", marginBottom: 4 }}>{s.value}</div>
              <div style={{ fontSize: 13, color: textSecondary }}>{s.label}</div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ─── FEATURES ─── */}
      <section id="features" style={{ background: isDark ? "rgba(15,15,28,0.8)" : "rgba(240,240,255,0.5)", padding: "80px 0" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 24px" }}>
          <div style={{ textAlign: "center", marginBottom: 56 }}>
            <motion.h2
              initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
              style={{ fontSize: 40, fontWeight: 800, color: textPrimary, fontFamily: "'Manrope', sans-serif", marginBottom: 12 }}
            >
              Intelligence in Every <span style={{ backgroundImage: "linear-gradient(135deg,#e0b886,#d4a574)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>Pixel</span>
            </motion.h2>
            <p style={{ color: textSecondary, fontSize: 16 }}>Built specifically for Indian students, job seekers, and citizens.</p>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 24 }}>
            {features.map((f, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                whileHover={{ y: -6, boxShadow: `0 16px 48px ${f.bg}` }}
                style={{
                  background: bgCard, border: `1px solid ${border}`,
                  borderRadius: 20, padding: 28, cursor: "pointer",
                  transition: "all 0.35s ease",
                }}
                onHoverStart={() => {}}
              >
                <div style={{
                  width: 52, height: 52, borderRadius: 14,
                  background: f.bg, display: "flex", alignItems: "center",
                  justifyContent: "center", marginBottom: 18, color: f.color,
                }}>
                  {f.icon}
                </div>
                <h3 style={{ fontSize: 17, fontWeight: 700, color: textPrimary, marginBottom: 10, fontFamily: "'Manrope', sans-serif" }}>{f.title}</h3>
                <p style={{ fontSize: 14, color: textSecondary, lineHeight: 1.65 }}>{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── WORKFLOW ─── */}
      <section id="workflow" style={{ maxWidth: 1200, margin: "0 auto", padding: "80px 24px" }}>
        <div style={{ textAlign: "center", marginBottom: 56 }}>
          <motion.h2
            initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            style={{ fontSize: 38, fontWeight: 800, color: textPrimary, fontFamily: "'Manrope', sans-serif", marginBottom: 12 }}
          >
            The Intelligent Pipeline
          </motion.h2>
          <p style={{ color: textSecondary, fontSize: 16 }}>Three steps from raw document to peace of mind.</p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 32, position: "relative" }}>
          {/* Connector line */}
          <div style={{
            position: "absolute", top: "30%", left: "16.5%", right: "16.5%", height: 2,
            background: `linear-gradient(90deg, transparent, ${accentColor}60, transparent)`,
            zIndex: 0,
          }} />

          {[
            { step: "01", icon: <FileText className="w-7 h-7" />, title: "Upload PDF", desc: "Drop any official document or notice directly into our secure cloud vault." },
            { step: "02", icon: <Sparkles className="w-7 h-7" />, title: "AI Processing", desc: "Our LLMs extract key entities, dates, and intent with 99% accuracy.", active: true },
            { step: "03", icon: <Bell className="w-7 h-7" />, title: "Alert Sent", desc: "Receive personalized summaries via your preferred communication channel." },
          ].map((w, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }} transition={{ delay: i * 0.15 }}
              style={{ display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", position: "relative", zIndex: 1 }}
            >
              <motion.div
                whileHover={{ scale: 1.1 }}
                style={{
                  width: 80, height: 80, borderRadius: "50%",
                  background: w.active ? "linear-gradient(135deg,#d4a574,#c9985f)" : bgCard,
                  border: `2px solid ${w.active ? "transparent" : border}`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  marginBottom: 20, color: w.active ? "#000" : accentColor,
                  boxShadow: w.active ? "0 0 40px rgba(212,165,116,0.4)" : "none",
                }}
              >
                {w.icon}
              </motion.div>
              <div style={{ fontSize: 11, fontWeight: 700, color: textMuted, letterSpacing: 2, textTransform: "uppercase", marginBottom: 6 }}>Step {w.step}</div>
              <h4 style={{ fontSize: 18, fontWeight: 700, color: textPrimary, marginBottom: 8, fontFamily: "'Manrope', sans-serif" }}>{w.title}</h4>
              <p style={{ fontSize: 14, color: textSecondary, lineHeight: 1.65, maxWidth: 260 }}>{w.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ─── IMPACT STATS ─── */}
      <section style={{
        background: isDark 
          ? "linear-gradient(135deg, #1a1410 0%, #0f0f0d 50%, #1a1410 100%)"
          : "linear-gradient(135deg, #e0f2fe 0%, #dbeafe 50%, #e0f2fe 100%)",
        padding: "80px 0", position: "relative", overflow: "hidden",
      }}>
        <div className="glow-orb" style={{ top: "-30%", left: "20%", width: 500, height: 500, background: isDark ? "rgba(212,165,116,0.10)" : "rgba(59,130,246,0.08)" }} />
        <div className="glow-orb" style={{ bottom: "-20%", right: "10%", width: 400, height: 400, background: isDark ? "rgba(212,165,116,0.08)" : "rgba(37,99,235,0.06)" }} />

        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 24px", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 40, position: "relative", zIndex: 1 }}>
          {[
            { value: "4.8M+", label: "Notices Processed" },
            { value: "99.2%", label: "Detection Accuracy" },
            { value: "250k+", label: "Deadlines Detected" },
            { value: "12,000", label: "Global Enterprises" },
          ].map((s, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }} transition={{ delay: i * 0.1 }}
              style={{ textAlign: "center" }}
            >
              <div style={{ fontSize: 52, fontWeight: 900, color: textPrimary, fontFamily: "'Manrope', sans-serif", marginBottom: 8 }}>{s.value}</div>
              <div style={{ fontSize: 12, color: accentColor, fontWeight: 700, letterSpacing: 3, textTransform: "uppercase" }}>{s.label}</div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ─── CATEGORIES ─── */}
      <section style={{ maxWidth: 1200, margin: "0 auto", padding: "80px 24px" }}>
        <div style={{ textAlign: "center", marginBottom: 40 }}>
          <h2 style={{ fontSize: 34, fontWeight: 800, color: textPrimary, fontFamily: "'Manrope', sans-serif", marginBottom: 8 }}>Track Every Category</h2>
          <p style={{ color: textSecondary }}>From scholarships to flood alerts — get it all in one place.</p>
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 12, justifyContent: "center" }}>
          {categories.map((c, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0.9 }} whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }} transition={{ delay: i * 0.05 }}
              whileHover={{ scale: 1.08, y: -3 }}
              style={{
                display: "flex", alignItems: "center", gap: 8,
                padding: "10px 20px", borderRadius: 24,
                background: `${c.color}18`,
                border: `1px solid ${c.color}40`,
                fontSize: 14, fontWeight: 500,
                color: textPrimary,
                cursor: "pointer", transition: "all 0.3s ease",
              }}
            >
              <span>{c.icon}</span> {c.label}
            </motion.div>
          ))}
        </div>
      </section>

      {/* ─── TESTIMONIALS ─── */}
      <section style={{ background: isDark ? "rgba(15,15,28,0.8)" : "rgba(240,240,255,0.5)", padding: "80px 0" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 24px" }}>
          <div style={{ textAlign: "center", marginBottom: 48 }}>
            <h2 style={{ fontSize: 34, fontWeight: 800, color: textPrimary, fontFamily: "'Manrope', sans-serif" }}>Loved Across India 🇮🇳</h2>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 24 }}>
            {testimonials.map((t, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }} transition={{ delay: i * 0.15 }}
                whileHover={{ y: -6, boxShadow: "0 16px 48px var(--accent-glow)" }}
                style={{
                  background: bgCard, border: `1px solid ${border}`,
                  borderRadius: 20, padding: 28, transition: "all 0.3s ease",
                }}
              >
                <div style={{ display: "flex", gap: 4, marginBottom: 14 }}>
                  {[...Array(t.stars)].map((_, j) => <Star key={j} className="w-4 h-4" style={{ color: "#fbbf24", fill: "#fbbf24" }} />)}
                </div>
                <p style={{ fontSize: 14, color: textSecondary, lineHeight: 1.7, marginBottom: 20 }}>"{t.text}"</p>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <div style={{
                    width: 40, height: 40, borderRadius: "50%",
                    background: "linear-gradient(135deg,#7c3aed,#6d28d9)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 13, fontWeight: 700, color: "white",
                  }}>{t.avatar}</div>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 600, color: textPrimary }}>{t.name}</div>
                    <div style={{ fontSize: 12, color: textMuted }}>{t.role}</div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── CTA ─── */}
      <section style={{ maxWidth: 1200, margin: "0 auto", padding: "80px 24px 100px" }}>
        <motion.div
          initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          style={{
            background: isDark 
              ? "linear-gradient(135deg, rgba(212,165,116,0.15), rgba(201,152,95,0.10))"
              : "linear-gradient(135deg, rgba(59,130,246,0.15), rgba(37,99,235,0.10))",
            border: isDark 
              ? "1px solid rgba(212,165,116,0.30)"
              : "1px solid rgba(59,130,246,0.30)",
            borderRadius: 28, padding: "64px 48px", textAlign: "center",
            position: "relative", overflow: "hidden",
          }}
        >
          <div className="glow-orb" style={{ top: -80, right: -80, width: 250, height: 250, background: isDark ? "rgba(212,165,116,0.20)" : "rgba(59,130,246,0.20)" }} />
          <Bell className="w-12 h-12" style={{ color: accentColor, margin: "0 auto 20px" }} />
          <h2 style={{ fontSize: 40, fontWeight: 900, color: textPrimary, marginBottom: 12, fontFamily: "'Manrope', sans-serif", position: "relative", zIndex: 1 }}>
            Start Getting Alerts Today
          </h2>
          <p style={{ color: textSecondary, marginBottom: 36, fontSize: 16, position: "relative", zIndex: 1 }}>
            Free forever. No credit card needed. Setup takes 2 minutes.
          </p>
          <div style={{ display: "flex", gap: 14, justifyContent: "center", flexWrap: "wrap", position: "relative", zIndex: 1 }}>
            <Link href="/onboarding" className="btn-glow" style={{
              display: "inline-flex", alignItems: "center", gap: 8,
              padding: "15px 36px", borderRadius: 12,
              fontSize: 16, fontWeight: 700, textDecoration: "none",
              fontFamily: "'Manrope', sans-serif",
            }}>
              Create Free Account <ChevronRight className="w-5 h-5" />
            </Link>
            <Link href="/auth/login" style={{
              display: "inline-flex", alignItems: "center", gap: 8,
              padding: "15px 36px", borderRadius: 12,
              background: bgCard, border: `1px solid ${border}`,
              color: textPrimary, fontSize: 16, fontWeight: 600,
              textDecoration: "none", transition: "all 0.3s ease",
              fontFamily: "'Manrope', sans-serif",
            }}>
              Sign In
            </Link>
          </div>
        </motion.div>
      </section>

      {/* ─── FOOTER ─── */}
      <footer style={{
        borderTop: `1px solid ${border}`,
        padding: "40px 24px", background: isDark ? "#0a0a12" : "#f0f0ff",
        transition: "all 0.35s ease",
      }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 20 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 32, height: 32, borderRadius: 8, background: "linear-gradient(135deg,#7c3aed,#6d28d9)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Bell className="w-4 h-4" style={{ color: "white" }} />
            </div>
            <div>
              <div style={{ fontSize: 16, fontWeight: 800, color: textPrimary, fontFamily: "'Manrope', sans-serif" }}>InfoMe</div>
              <div style={{ fontSize: 11, color: textMuted }}>© 2026 · Made in India 🇮🇳 · Powered by AI</div>
            </div>
          </div>
          <div style={{ display: "flex", gap: 24, flexWrap: "wrap" }}>
            {["Privacy Policy", "Terms of Service", "API Docs", "Contact"].map(link => (
              <a key={link} href="#" style={{ fontSize: 13, color: textMuted, textDecoration: "none", transition: "color 0.2s", fontFamily: "'Inter', sans-serif" }}
                onMouseEnter={e => (e.target as HTMLElement).style.color = accentColor}
                onMouseLeave={e => (e.target as HTMLElement).style.color = textMuted}
              >{link}</a>
            ))}
          </div>
        </div>
      </footer>
    </div>
  );
}
