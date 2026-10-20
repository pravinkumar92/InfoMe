"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { Bell, CheckCircle, ChevronRight, ChevronLeft, MapPin, GraduationCap, Heart, Megaphone, BellRing } from "lucide-react";
import { toast } from "sonner";
import { interests, notificationChannels, states } from "@/lib/mock-data";

const TOTAL_STEPS = 5;

const steps = [
  { label: "College", icon: "🎓" },
  { label: "Location", icon: "📍" },
  { label: "Interests", icon: "💡" },
  { label: "Sources", icon: "🌐" },
  { label: "Alerts", icon: "🔔" },
];

const sourceTypes = [
  { id: "gov", label: "Government Portals", icon: "🏛️", desc: "UPSC, SSC, NIC, state portals" },
  { id: "uni", label: "Universities", icon: "🎓", desc: "AKTU, BU, IITK, DU etc." },
  { id: "civic", label: "Local Authorities", icon: "🏙️", desc: "Municipal, district, police" },
  { id: "news", label: "News Channels", icon: "📰", desc: "Amar Ujala, Dainik Jagran, etc." },
];

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [data, setData] = useState({
    college: "",
    state: "Uttar Pradesh",
    district: "",
    city: "",
    interests: [] as string[],
    sources: [] as string[],
    channels: [] as string[],
  });

  const toggle = (key: "interests" | "sources" | "channels", val: string) => {
    setData(d => ({
      ...d,
      [key]: d[key].includes(val) ? d[key].filter(x => x !== val) : [...d[key], val],
    }));
  };

  const handleFinish = async () => {
    try {
      const { getCurrentUser } = await import("@/lib/auth");
      const { completeOnboarding } = await import("@/lib/api");
      
      const user = await getCurrentUser();
      if (!user) {
        // Demo mode - save to localStorage and continue
        localStorage.setItem("demo_preferences", JSON.stringify(data));
        toast.success("🎉 Your personalized dashboard is ready! (Demo Mode)");
        router.push("/dashboard");
        return;
      }

      await completeOnboarding(user.id, {
        college: data.college,
        state: data.state,
        district: data.district,
        city: data.city,
        interests: data.interests,
        notification_channels: data.channels,
      });

      toast.success("🎉 Your personalized dashboard is ready!");
      router.push("/dashboard");
    } catch (error: any) {
      console.error("Onboarding error:", error);
      // Fallback to demo mode on error
      localStorage.setItem("demo_preferences", JSON.stringify(data));
      toast.success("🎉 Your personalized dashboard is ready! (Demo Mode)");
      router.push("/dashboard");
    }
  };

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg-primary)", display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
      <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "radial-gradient(ellipse at 20% 20%, rgba(124,58,237,0.07) 0%, transparent 60%)", pointerEvents: "none" }} />

      <div style={{ width: "100%", maxWidth: 560 }}>
        {/* Logo */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, justifyContent: "center", marginBottom: 32 }}>
          <div style={{ width: 36, height: 36, borderRadius: 10, background: "linear-gradient(135deg,#7c3aed,#6d28d9)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Bell className="w-5 h-5" style={{ color: "white" }} />
          </div>
          <span style={{ fontSize: 20, fontWeight: 800, color: "#f1f0ff", fontFamily: "'Outfit',sans-serif" }}>InfoMe</span>
        </div>

        {/* Progress Steps */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 0, marginBottom: 32 }}>
          {steps.map((s, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center" }}>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
                <div className={i < step ? "step-done" : i === step ? "step-active" : "step-pending"} style={{ width: 32, height: 32, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 600 }}>
                  {i < step ? <CheckCircle className="w-4 h-4" /> : i + 1}
                </div>
                <span style={{ fontSize: 10, color: i === step ? "#a78bfa" : "#5c5c7a", whiteSpace: "nowrap" }}>{s.label}</span>
              </div>
              {i < steps.length - 1 && <div style={{ width: 40, height: 1, background: i < step ? "#7c3aed" : "var(--border)", margin: "0 4px", marginBottom: 18 }} />}
            </div>
          ))}
        </div>

        {/* Card */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} key={step}
          style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: 20, padding: 36 }}>

          <AnimatePresence mode="wait">
            {/* Step 0: College */}
            {step === 0 && (
              <motion.div key="s0" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
                  <GraduationCap className="w-5 h-5" style={{ color: "#a78bfa" }} />
                  <h2 style={{ fontSize: 20, fontWeight: 800, color: "#f1f0ff", fontFamily: "'Outfit',sans-serif" }}>Your College / University</h2>
                </div>
                <p style={{ color: "#5c5c7a", fontSize: 13, marginBottom: 24 }}>We'll prioritize notices from your institution.</p>
                <input id="college-input" type="text" value={data.college} onChange={e => setData({ ...data, college: e.target.value })} placeholder="e.g. AKTU Lucknow, BHU, IITK..." className="input-dark" />
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 16 }}>
                  {["AKTU Lucknow", "BHU Varanasi", "IIT Kanpur", "BU Jhansi", "CSJMU Kanpur"].map(c => (
                    <button key={c} onClick={() => setData({ ...data, college: c })}
                      style={{ padding: "6px 14px", borderRadius: 20, fontSize: 13, cursor: "pointer", background: data.college === c ? "rgba(124,58,237,0.2)" : "rgba(255,255,255,0.04)", border: `1px solid ${data.college === c ? "#7c3aed" : "var(--border)"}`, color: data.college === c ? "#a78bfa" : "#9d9db5" }}>
                      {c}
                    </button>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Step 1: Location */}
            {step === 1 && (
              <motion.div key="s1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
                  <MapPin className="w-5 h-5" style={{ color: "#a78bfa" }} />
                  <h2 style={{ fontSize: 20, fontWeight: 800, color: "#f1f0ff", fontFamily: "'Outfit',sans-serif" }}>Your Location</h2>
                </div>
                <p style={{ color: "#5c5c7a", fontSize: 13, marginBottom: 24 }}>Get hyper-local alerts for your state, district, and city.</p>
                <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                  <div>
                    <label style={{ fontSize: 13, color: "#9d9db5", marginBottom: 6, display: "block" }}>State</label>
                    <select id="state-select" value={data.state} onChange={e => setData({ ...data, state: e.target.value })} className="input-dark" style={{ appearance: "none", cursor: "pointer" }}>
                      {states.map(s => <option key={s} value={s} style={{ background: "#12121e" }}>{s}</option>)}
                    </select>
                  </div>
                  <div>
                    <label style={{ fontSize: 13, color: "#9d9db5", marginBottom: 6, display: "block" }}>District</label>
                    <input id="district-input" type="text" value={data.district} onChange={e => setData({ ...data, district: e.target.value })} placeholder="e.g. Lucknow, Agra, Kanpur..." className="input-dark" />
                  </div>
                  <div>
                    <label style={{ fontSize: 13, color: "#9d9db5", marginBottom: 6, display: "block" }}>City (optional)</label>
                    <input id="city-input" type="text" value={data.city} onChange={e => setData({ ...data, city: e.target.value })} placeholder="e.g. Lucknow City..." className="input-dark" />
                  </div>
                </div>
              </motion.div>
            )}

            {/* Step 2: Interests */}
            {step === 2 && (
              <motion.div key="s2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
                  <Heart className="w-5 h-5" style={{ color: "#a78bfa" }} />
                  <h2 style={{ fontSize: 20, fontWeight: 800, color: "#f1f0ff", fontFamily: "'Outfit',sans-serif" }}>Choose Your Interests</h2>
                </div>
                <p style={{ color: "#5c5c7a", fontSize: 13, marginBottom: 24 }}>Select all categories you want alerts for.</p>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                  {interests.map(int => {
                    const sel = data.interests.includes(int.id);
                    return (
                      <button key={int.id} id={`interest-${int.id}`} onClick={() => toggle("interests", int.id)}
                        style={{ padding: "14px 16px", borderRadius: 12, cursor: "pointer", background: sel ? "rgba(124,58,237,0.15)" : "rgba(255,255,255,0.03)", border: `1px solid ${sel ? "#7c3aed" : "var(--border)"}`, display: "flex", alignItems: "center", gap: 10, transition: "all 0.2s" }}>
                        <span style={{ fontSize: 20 }}>{int.icon}</span>
                        <span style={{ fontSize: 14, fontWeight: 500, color: sel ? "#a78bfa" : "#9d9db5" }}>{int.label}</span>
                        {sel && <CheckCircle className="w-4 h-4" style={{ color: "#7c3aed", marginLeft: "auto" }} />}
                      </button>
                    );
                  })}
                </div>
              </motion.div>
            )}

            {/* Step 3: Sources */}
            {step === 3 && (
              <motion.div key="s3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
                  <Megaphone className="w-5 h-5" style={{ color: "#a78bfa" }} />
                  <h2 style={{ fontSize: 20, fontWeight: 800, color: "#f1f0ff", fontFamily: "'Outfit',sans-serif" }}>Choose Sources</h2>
                </div>
                <p style={{ color: "#5c5c7a", fontSize: 13, marginBottom: 24 }}>Pick the type of sources to track.</p>
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {sourceTypes.map(s => {
                    const sel = data.sources.includes(s.id);
                    return (
                      <button key={s.id} id={`source-${s.id}`} onClick={() => toggle("sources", s.id)}
                        style={{ padding: "16px", borderRadius: 12, cursor: "pointer", background: sel ? "rgba(124,58,237,0.12)" : "rgba(255,255,255,0.03)", border: `1px solid ${sel ? "#7c3aed" : "var(--border)"}`, display: "flex", alignItems: "center", gap: 14, textAlign: "left", transition: "all 0.2s" }}>
                        <span style={{ fontSize: 24 }}>{s.icon}</span>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: 14, fontWeight: 600, color: sel ? "#a78bfa" : "#f1f0ff", marginBottom: 2 }}>{s.label}</div>
                          <div style={{ fontSize: 12, color: "#5c5c7a" }}>{s.desc}</div>
                        </div>
                        <div style={{ width: 20, height: 20, borderRadius: 5, border: `2px solid ${sel ? "#7c3aed" : "#5c5c7a"}`, background: sel ? "#7c3aed" : "transparent", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                          {sel && <CheckCircle className="w-3 h-3" style={{ color: "white" }} />}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </motion.div>
            )}

            {/* Step 4: Notification Channels */}
            {step === 4 && (
              <motion.div key="s4" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
                  <BellRing className="w-5 h-5" style={{ color: "#a78bfa" }} />
                  <h2 style={{ fontSize: 20, fontWeight: 800, color: "#f1f0ff", fontFamily: "'Outfit',sans-serif" }}>Notification Channels</h2>
                </div>
                <p style={{ color: "#5c5c7a", fontSize: 13, marginBottom: 24 }}>How should we alert you? Pick all that apply.</p>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                  {notificationChannels.map(ch => {
                    const sel = data.channels.includes(ch.id);
                    return (
                      <button key={ch.id} id={`channel-${ch.id}`} onClick={() => toggle("channels", ch.id)}
                        style={{ padding: "18px 14px", borderRadius: 14, cursor: "pointer", background: sel ? "rgba(124,58,237,0.12)" : "rgba(255,255,255,0.03)", border: `1px solid ${sel ? "#7c3aed" : "var(--border)"}`, display: "flex", flexDirection: "column", alignItems: "center", gap: 8, transition: "all 0.2s" }}>
                        <span style={{ fontSize: 28 }}>{ch.icon}</span>
                        <span style={{ fontSize: 13, fontWeight: 600, color: sel ? "#a78bfa" : "#9d9db5" }}>{ch.label}</span>
                        {sel && <CheckCircle className="w-4 h-4" style={{ color: "#10b981" }} />}
                      </button>
                    );
                  })}
                </div>
                <div style={{ marginTop: 20, padding: 16, borderRadius: 12, background: "rgba(124,58,237,0.08)", border: "1px solid rgba(124,58,237,0.2)" }}>
                  <p style={{ fontSize: 13, color: "#9d9db5" }}>🚀 You're all set! Click <strong style={{ color: "#a78bfa" }}>Generate Dashboard</strong> to start receiving personalized alerts.</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Navigation */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 32 }}>
            <button onClick={() => step > 0 ? setStep(s => s - 1) : router.push("/")}
              style={{ display: "flex", alignItems: "center", gap: 6, padding: "10px 20px", borderRadius: 10, background: "rgba(255,255,255,0.04)", border: "1px solid var(--border)", color: "#9d9db5", fontSize: 14, fontWeight: 500, cursor: "pointer" }}>
              <ChevronLeft className="w-4 h-4" /> {step === 0 ? "Back" : "Previous"}
            </button>

            {step < TOTAL_STEPS - 1 ? (
              <button id="next-step-btn" onClick={() => setStep(s => s + 1)} className="btn-glow"
                style={{ display: "flex", alignItems: "center", gap: 6, padding: "10px 24px", borderRadius: 10, border: "none", color: "white", fontSize: 14, fontWeight: 600, cursor: "pointer" }}>
                Next <ChevronRight className="w-4 h-4" />
              </button>
            ) : (
              <button id="generate-dashboard-btn" onClick={handleFinish} className="btn-glow"
                style={{ display: "flex", alignItems: "center", gap: 6, padding: "10px 24px", borderRadius: 10, border: "none", color: "white", fontSize: 14, fontWeight: 600, cursor: "pointer" }}>
                Generate Dashboard 🚀
              </button>
            )}
          </div>
        </motion.div>

        <p style={{ textAlign: "center", marginTop: 16, fontSize: 12, color: "#5c5c7a" }}>
          Step {step + 1} of {TOTAL_STEPS} · You can change these settings anytime
        </p>
      </div>
    </div>
  );
}
