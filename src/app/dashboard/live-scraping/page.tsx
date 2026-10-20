"use client";
import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Globe, Play, Pause, Activity, CheckCircle, Clock, AlertCircle,
  FileText, Zap, TrendingUp, Bell, Download, Loader2, Eye, Database
} from "lucide-react";
import { useTheme } from "@/lib/theme-context";

interface ScraperStatus {
  website: string;
  status: "running" | "idle" | "error";
  lastChecked: Date | null;
  noticesFound: number;
  nextCheck: number;
}

interface LogEntry {
  id: string;
  timestamp: string;
  message: string;
  type: "info" | "success" | "warning" | "error";
}

interface ProcessStep {
  name: string;
  status: "completed" | "in-progress" | "pending";
}

interface NewNotice {
  id: string;
  title: string;
  summary: string;
  category: string;
  deadline: string;
  isNew: boolean;
}

export default function LiveScrapingPage() {
  const { isDark } = useTheme();
  const [demoMode, setDemoMode] = useState(false);
  const [isScraperRunning, setIsScraperRunning] = useState(false);
  const [customUrl, setCustomUrl] = useState("");
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [scraperStatus, setScraperStatus] = useState<ScraperStatus>({
    website: "aktu.ac.in",
    status: "idle",
    lastChecked: null,
    noticesFound: 0,
    nextCheck: 30
  });
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [processSteps, setProcessSteps] = useState<ProcessStep[]>([
    { name: "Connecting to Website", status: "pending" },
    { name: "Fetching Data", status: "pending" },
    { name: "Checking Notices", status: "pending" },
    { name: "Downloading Files", status: "pending" },
    { name: "AI Processing", status: "pending" },
    { name: "Saving to Database", status: "pending" }
  ]);
  const [newNotices, setNewNotices] = useState<NewNotice[]>([]);
  const [analytics, setAnalytics] = useState({
    totalWebsites: 8,
    totalNotices: 1247,
    todayNotices: 23,
    totalAlerts: 456
  });
  const [showNoticeAlert, setShowNoticeAlert] = useState(false);
  const [latestNotice, setLatestNotice] = useState<NewNotice | null>(null);
  
  const logsEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let isMounted = true;
    
    const fetchLiveLogs = async () => {
      if (!isMounted) return;
      
      try {
        const response = await fetch("/api/scraper/status");
        if (response.ok && isMounted) {
          const data = await response.json();
          if (data.logs && data.logs.length > 0) {
            const formattedLogs = data.logs.map((log: any) => ({
              id: `${log.timestamp}-${Math.random()}`,
              timestamp: new Date(log.timestamp).toLocaleTimeString(),
              message: log.message,
              type: log.type
            }));
            setLogs(formattedLogs);
          }
          if (data.status) {
            setScraperStatus(prev => ({
              ...prev,
              status: data.status
            }));
          }
        }
      } catch (error) {
        console.error("Error fetching live logs:", error);
      }
    };

    fetchLiveLogs();
    const interval = setInterval(fetchLiveLogs, 5000);
    
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  const addLog = (message: string, type: LogEntry["type"] = "info") => {
    const now = new Date();
    const timestamp = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;
    const newLog: LogEntry = {
      id: `${Date.now()}-${Math.random()}`,
      timestamp,
      message,
      type
    };
    setLogs(prev => [...prev, newLog].slice(-50));
  };

  const updateProcessStep = (index: number, status: ProcessStep["status"]) => {
    setProcessSteps(prev => prev.map((step, i) => 
      i === index ? { ...step, status } : step
    ));
  };

  const runScraper = async (targetUrl?: string) => {
    if (isScraperRunning) return;
    
    const urlToScrape = targetUrl || scraperStatus.website;
    
    setIsScraperRunning(true);
    setScraperStatus(prev => ({ ...prev, status: "running", website: urlToScrape }));
    addLog(`🚀 Starting scraper for ${urlToScrape}...`, "info");

    try {
      updateProcessStep(0, "in-progress");
      addLog(`🌐 Connecting to ${urlToScrape}...`, "info");
      
      const response = await fetch("/api/scraper/scrape-url", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: urlToScrape })
      });

      if (!response.ok) {
        throw new Error("Scraping failed");
      }

      updateProcessStep(0, "completed");
      addLog("✓ Website loaded successfully", "success");

      updateProcessStep(1, "in-progress");
      addLog("📡 Fetching data...", "info");
      await new Promise(resolve => setTimeout(resolve, 1000));
      updateProcessStep(1, "completed");
      addLog("✓ Data fetched", "success");

      updateProcessStep(2, "in-progress");
      addLog("🔍 Scanning for notices...", "info");
      
      const data = await response.json();
      
      updateProcessStep(2, "completed");
      addLog(`✓ Found ${data.noticesFound || 0} notices`, "success");

      if (data.notices && data.notices.length > 0) {
        updateProcessStep(3, "in-progress");
        addLog("📥 Processing content...", "info");
        await new Promise(resolve => setTimeout(resolve, 1000));
        updateProcessStep(3, "completed");
        addLog("✓ Content processed", "success");

        updateProcessStep(4, "in-progress");
        addLog("🤖 AI analyzing content...", "info");
        await new Promise(resolve => setTimeout(resolve, 1500));
        updateProcessStep(4, "completed");
        addLog("✓ AI analysis complete", "success");

        updateProcessStep(5, "in-progress");
        addLog("💾 Saving to database...", "info");
        await new Promise(resolve => setTimeout(resolve, 1000));
        updateProcessStep(5, "completed");
        addLog("✓ Data saved successfully", "success");

        const newNoticesList = data.notices.map((notice: any, index: number) => ({
          id: `notice-${Date.now()}-${index}`,
          title: notice.title || "New Notice Detected",
          summary: notice.summary || notice.description || "Notice details extracted from website",
          category: notice.category || "General",
          deadline: notice.deadline || "TBD",
          isNew: true
        }));

        setNewNotices(prev => [...newNoticesList, ...prev]);
        if (newNoticesList.length > 0) {
          setLatestNotice(newNoticesList[0]);
          setShowNoticeAlert(true);
          setTimeout(() => setShowNoticeAlert(false), 5000);
        }

        setAnalytics(prev => ({
          ...prev,
          totalNotices: prev.totalNotices + data.noticesFound,
          todayNotices: prev.todayNotices + data.noticesFound,
          totalAlerts: prev.totalAlerts + data.noticesFound
        }));

        setScraperStatus(prev => ({
          ...prev,
          noticesFound: prev.noticesFound + data.noticesFound
        }));
      } else {
        addLog("ℹ️ No new notices found", "info");
      }

      addLog("✅ Scraping completed!", "success");

    } catch (error) {
      console.error("Scraping error:", error);
      addLog(`❌ Error: ${error instanceof Error ? error.message : "Scraping failed"}`, "error");
      setScraperStatus(prev => ({ ...prev, status: "error" }));
    } finally {
      setScraperStatus(prev => ({
        ...prev,
        status: "idle",
        lastChecked: new Date(),
        nextCheck: 30
      }));

      setProcessSteps(prev => prev.map(step => ({ ...step, status: "pending" })));
      setIsScraperRunning(false);
    }
  };

  useEffect(() => {
    if (demoMode) {
      const interval = setInterval(() => {
        if (!isScraperRunning) {
          runScraper();
        }
      }, 35000);
      return () => clearInterval(interval);
    }
  }, [demoMode, isScraperRunning]);

  useEffect(() => {
    const interval = setInterval(() => {
      if (scraperStatus.status === "idle" && scraperStatus.nextCheck > 0) {
        setScraperStatus(prev => ({
          ...prev,
          nextCheck: Math.max(0, prev.nextCheck - 1)
        }));
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [scraperStatus]);

  useEffect(() => {
    logsEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [logs]);

  const textPrimary = "var(--text-primary)";
  const textSecondary = "var(--text-secondary)";
  const textMuted = "var(--text-muted)";
  const border = "var(--border)";
  const cardBg = "var(--bg-card)";

  return (
    <div style={{ minHeight: "100vh" }}>
      <div style={{ marginBottom: 24, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 16 }}>
        <div>
          <h1 style={{ fontSize: 28, fontWeight: 800, color: textPrimary, margin: 0, fontFamily: "'Manrope', sans-serif" }}>
            🌐 Live Website Monitoring
          </h1>
          <p style={{ fontSize: 14, color: textMuted, margin: "4px 0 0 0" }}>
            Real-time scraping activity and notice detection
          </p>
        </div>
        
        <div style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setDemoMode(!demoMode)}
            style={{
              padding: "10px 20px",
              borderRadius: 10,
              background: demoMode ? "linear-gradient(135deg, #10b981, #059669)" : cardBg,
              border: `1px solid ${demoMode ? "#10b981" : border}`,
              color: demoMode ? "white" : textSecondary,
              fontSize: 13,
              fontWeight: 600,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: 8
            }}
          >
            <Activity className="w-4 h-4" />
            Demo Mode: {demoMode ? "ON" : "OFF"}
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setShowUrlInput(!showUrlInput)}
            style={{
              padding: "10px 20px",
              borderRadius: 10,
              background: cardBg,
              border: `1px solid ${border}`,
              color: textSecondary,
              fontSize: 13,
              fontWeight: 600,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: 8
            }}
          >
            <Globe className="w-4 h-4" />
            Custom URL
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => runScraper()}
            disabled={isScraperRunning}
            style={{
              padding: "12px 24px",
              borderRadius: 12,
              background: isScraperRunning 
                ? "linear-gradient(135deg, #6b7280, #4b5563)"
                : "linear-gradient(135deg, #3b82f6, #2563eb)",
              border: "none",
              color: "white",
              fontSize: 14,
              fontWeight: 700,
              cursor: isScraperRunning ? "not-allowed" : "pointer",
              display: "flex",
              alignItems: "center",
              gap: 8,
              boxShadow: isScraperRunning ? "none" : "0 4px 16px rgba(59,130,246,0.4)"
            }}
          >
            {isScraperRunning ? (
              <><Loader2 className="w-5 h-5 animate-spin" /> Running...</>
            ) : (
              <><Play className="w-5 h-5" /> Run Scraper Now</>
            )}
          </motion.button>
        </div>
      </div>

      <AnimatePresence>
        {showUrlInput && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            style={{
              marginBottom: 24,
              background: cardBg,
              border: `1px solid ${border}`,
              borderRadius: 16,
              padding: 20,
              overflow: "hidden"
            }}
          >
            <h3 style={{ fontSize: 14, fontWeight: 700, color: textPrimary, margin: "0 0 12px 0" }}>
              Enter Website URL to Scrape
            </h3>
            <div style={{ display: "flex", gap: 12 }}>
              <input
                type="text"
                value={customUrl}
                onChange={(e) => setCustomUrl(e.target.value)}
                placeholder="https://example.com/notices"
                style={{
                  flex: 1,
                  padding: "10px 16px",
                  borderRadius: 10,
                  background: isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.03)",
                  border: `1px solid ${border}`,
                  color: textPrimary,
                  fontSize: 14,
                  outline: "none"
                }}
                onKeyPress={(e) => {
                  if (e.key === "Enter" && customUrl.trim()) {
                    runScraper(customUrl);
                    setShowUrlInput(false);
                  }
                }}
              />
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  if (customUrl.trim()) {
                    runScraper(customUrl);
                    setShowUrlInput(false);
                  }
                }}
                disabled={!customUrl.trim() || isScraperRunning}
                style={{
                  padding: "10px 20px",
                  borderRadius: 10,
                  background: customUrl.trim() && !isScraperRunning
                    ? "linear-gradient(135deg, #8b5cf6, #7c3aed)"
                    : "#6b7280",
                  border: "none",
                  color: "white",
                  fontSize: 14,
                  fontWeight: 600,
                  cursor: customUrl.trim() && !isScraperRunning ? "pointer" : "not-allowed",
                  display: "flex",
                  alignItems: "center",
                  gap: 8
                }}
              >
                <Zap className="w-4 h-4" />
                Scrape
              </motion.button>
            </div>
            <p style={{ fontSize: 12, color: textMuted, margin: "8px 0 0 0" }}>
              Enter any government website URL to scrape notices in real-time
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 16, marginBottom: 24 }}>
        {[
          { label: "Websites Monitored", value: analytics.totalWebsites, icon: Globe, color: "#3b82f6" },
          { label: "Total Notices", value: analytics.totalNotices, icon: FileText, color: "#8b5cf6" },
          { label: "Today's New Notices", value: analytics.todayNotices, icon: Zap, color: "#10b981" },
          { label: "Total Alerts Sent", value: analytics.totalAlerts, icon: Bell, color: "#f59e0b" }
        ].map((stat, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            style={{
              background: cardBg,
              border: `1px solid ${border}`,
              borderRadius: 16,
              padding: 20,
              position: "relative",
              overflow: "hidden"
            }}
          >
            <div style={{ position: "absolute", top: -10, right: -10, opacity: 0.1 }}>
              <stat.icon style={{ width: 80, height: 80, color: stat.color }} />
            </div>
            <div style={{ position: "relative", zIndex: 1 }}>
              <p style={{ fontSize: 12, color: textMuted, margin: 0, textTransform: "uppercase", letterSpacing: 1 }}>
                {stat.label}
              </p>
              <motion.p
                key={stat.value}
                initial={{ scale: 1.2, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                style={{ fontSize: 32, fontWeight: 800, color: stat.color, margin: "8px 0 0 0" }}
              >
                {stat.value}
              </motion.p>
            </div>
          </motion.div>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24, marginBottom: 24 }}>
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          style={{
            background: cardBg,
            border: `1px solid ${border}`,
            borderRadius: 16,
            padding: 24,
            position: "relative",
            overflow: "hidden"
          }}
        >
          <h3 style={{ fontSize: 16, fontWeight: 700, color: textPrimary, margin: "0 0 20px 0", display: "flex", alignItems: "center", gap: 8 }}>
            <Globe className="w-5 h-5" style={{ color: "#3b82f6" }} />
            Scraper Status
          </h3>

          <div style={{ marginBottom: 16 }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
              <span style={{ fontSize: 13, color: textSecondary }}>Website:</span>
              <span style={{ fontSize: 13, fontWeight: 600, color: textPrimary }}>{scraperStatus.website}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
              <span style={{ fontSize: 13, color: textSecondary }}>Status:</span>
              <span style={{
                fontSize: 13,
                fontWeight: 600,
                color: scraperStatus.status === "running" ? "#10b981" : scraperStatus.status === "error" ? "#ef4444" : "#6b7280",
                display: "flex",
                alignItems: "center",
                gap: 6
              }}>
                <motion.span
                  animate={scraperStatus.status === "running" ? { scale: [1, 1.2, 1] } : {}}
                  transition={{ repeat: Infinity, duration: 1.5 }}
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: "50%",
                    background: scraperStatus.status === "running" ? "#10b981" : scraperStatus.status === "error" ? "#ef4444" : "#6b7280"
                  }}
                />
                {scraperStatus.status.charAt(0).toUpperCase() + scraperStatus.status.slice(1)}
              </span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
              <span style={{ fontSize: 13, color: textSecondary }}>Last Checked:</span>
              <span style={{ fontSize: 13, fontWeight: 600, color: textPrimary }}>
                {scraperStatus.lastChecked 
                  ? `${Math.floor((Date.now() - scraperStatus.lastChecked.getTime()) / 1000)}s ago`
                  : "Never"}
              </span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
              <span style={{ fontSize: 13, color: textSecondary }}>Notices Found:</span>
              <span style={{ fontSize: 13, fontWeight: 600, color: "#10b981" }}>{scraperStatus.noticesFound}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ fontSize: 13, color: textSecondary }}>Next Check:</span>
              <span style={{ fontSize: 13, fontWeight: 600, color: textPrimary }}>{scraperStatus.nextCheck}s</span>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          style={{
            background: cardBg,
            border: `1px solid ${border}`,
            borderRadius: 16,
            padding: 24
          }}
        >
          <h3 style={{ fontSize: 16, fontWeight: 700, color: textPrimary, margin: "0 0 20px 0", display: "flex", alignItems: "center", gap: 8 }}>
            <Activity className="w-5 h-5" style={{ color: "#8b5cf6" }} />
            Processing Steps
          </h3>

          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {processSteps.map((step, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 12 }}>
                {step.status === "completed" ? (
                  <CheckCircle className="w-5 h-5" style={{ color: "#10b981", flexShrink: 0 }} />
                ) : step.status === "in-progress" ? (
                  <Loader2 className="w-5 h-5 animate-spin" style={{ color: "#3b82f6", flexShrink: 0 }} />
                ) : (
                  <div style={{ width: 20, height: 20, borderRadius: "50%", border: `2px solid ${border}`, flexShrink: 0 }} />
                )}
                <span style={{
                  fontSize: 13,
                  color: step.status === "pending" ? textMuted : textPrimary,
                  fontWeight: step.status === "in-progress" ? 600 : 400
                }}>
                  {step.name}
                </span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          style={{
            background: isDark ? "#0a0a0f" : "#1a1a1f",
            border: `1px solid ${isDark ? "#1f1f2e" : "#2a2a3e"}`,
            borderRadius: 16,
            padding: 24,
            height: 500,
            display: "flex",
            flexDirection: "column"
          }}
        >
          <h3 style={{ fontSize: 16, fontWeight: 700, color: "#10b981", margin: "0 0 16px 0", display: "flex", alignItems: "center", gap: 8 }}>
            <Database className="w-5 h-5" />
            Live Scraping Logs
          </h3>

          <div style={{
            flex: 1,
            overflowY: "auto",
            fontFamily: "'Courier New', monospace",
            fontSize: 12,
            lineHeight: 1.6,
            color: "#10b981"
          }}>
            {logs.length === 0 ? (
              <div style={{ color: "#6b7280", textAlign: "center", marginTop: 40 }}>
                No logs yet. Click "Run Scraper Now" to start.
              </div>
            ) : (
              logs.map((log) => (
                <motion.div
                  key={log.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  style={{
                    marginBottom: 4,
                    color: log.type === "error" ? "#ef4444" : log.type === "warning" ? "#f59e0b" : log.type === "success" ? "#10b981" : "#6ee7b7"
                  }}
                >
                  [{log.timestamp}] {log.message}
                </motion.div>
              ))
            )}
            <div ref={logsEndRef} />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          style={{
            background: cardBg,
            border: `1px solid ${border}`,
            borderRadius: 16,
            padding: 24,
            height: 500,
            display: "flex",
            flexDirection: "column"
          }}
        >
          <h3 style={{ fontSize: 16, fontWeight: 700, color: textPrimary, margin: "0 0 16px 0", display: "flex", alignItems: "center", gap: 8 }}>
            <FileText className="w-5 h-5" style={{ color: "#3b82f6" }} />
            New Notices Detected
          </h3>

          <div style={{ flex: 1, overflowY: "auto" }}>
            {newNotices.length === 0 ? (
              <div style={{ color: textMuted, textAlign: "center", marginTop: 40 }}>
                No new notices yet. Run the scraper to detect notices.
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {newNotices.map((notice) => (
                  <motion.div
                    key={notice.id}
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    style={{
                      background: isDark ? "rgba(59,130,246,0.05)" : "rgba(59,130,246,0.03)",
                      border: `1px solid ${notice.isNew ? "#3b82f6" : border}`,
                      borderRadius: 12,
                      padding: 16,
                      position: "relative"
                    }}
                  >
                    {notice.isNew && (
                      <motion.span
                        animate={{ scale: [1, 1.1, 1] }}
                        transition={{ repeat: Infinity, duration: 2 }}
                        style={{
                          position: "absolute",
                          top: 12,
                          right: 12,
                          background: "#3b82f6",
                          color: "white",
                          fontSize: 10,
                          fontWeight: 700,
                          padding: "2px 8px",
                          borderRadius: 6,
                          textTransform: "uppercase"
                        }}
                      >
                        NEW
                      </motion.span>
                    )}
                    <h4 style={{ fontSize: 14, fontWeight: 600, color: textPrimary, margin: "0 0 8px 0", paddingRight: 50 }}>
                      {notice.title}
                    </h4>
                    <p style={{ fontSize: 12, color: textSecondary, margin: "0 0 8px 0", lineHeight: 1.5 }}>
                      {notice.summary}
                    </p>
                    <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                      <span style={{
                        fontSize: 11,
                        background: isDark ? "rgba(139,92,246,0.15)" : "rgba(139,92,246,0.1)",
                        color: "#8b5cf6",
                        padding: "2px 8px",
                        borderRadius: 6,
                        fontWeight: 600
                      }}>
                        {notice.category}
                      </span>
                      <span style={{
                        fontSize: 11,
                        background: isDark ? "rgba(239,68,68,0.15)" : "rgba(239,68,68,0.1)",
                        color: "#ef4444",
                        padding: "2px 8px",
                        borderRadius: 6,
                        fontWeight: 600
                      }}>
                        📅 {notice.deadline}
                      </span>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </motion.div>
      </div>

      <AnimatePresence>
        {showNoticeAlert && latestNotice && (
          <motion.div
            initial={{ opacity: 0, x: 300 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 300 }}
            style={{
              position: "fixed",
              top: 100,
              right: 24,
              width: 360,
              background: cardBg,
              border: `2px solid #3b82f6`,
              borderRadius: 16,
              padding: 20,
              boxShadow: "0 20px 60px rgba(59,130,246,0.3)",
              zIndex: 1000
            }}
          >
            <div style={{ display: "flex", alignItems: "start", gap: 12 }}>
              <div style={{
                width: 40,
                height: 40,
                borderRadius: 10,
                background: "linear-gradient(135deg, #3b82f6, #2563eb)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0
              }}>
                <Bell className="w-5 h-5" style={{ color: "white" }} />
              </div>
              <div style={{ flex: 1 }}>
                <h4 style={{ fontSize: 14, fontWeight: 700, color: textPrimary, margin: "0 0 4px 0" }}>
                  🚨 New Notice Detected
                </h4>
                <p style={{ fontSize: 13, color: textSecondary, margin: "0 0 8px 0" }}>
                  {latestNotice.title}
                </p>
                <p style={{ fontSize: 12, color: textMuted, margin: 0 }}>
                  Deadline: {latestNotice.deadline}
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {isScraperRunning && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          style={{
            position: "fixed",
            bottom: 24,
            right: 24,
            background: "linear-gradient(135deg, #ef4444, #dc2626)",
            color: "white",
            padding: "12px 20px",
            borderRadius: 12,
            display: "flex",
            alignItems: "center",
            gap: 8,
            boxShadow: "0 8px 32px rgba(239,68,68,0.4)",
            zIndex: 999,
            fontWeight: 700,
            fontSize: 13
          }}
        >
          <motion.div
            animate={{ scale: [1, 1.3, 1] }}
            transition={{ repeat: Infinity, duration: 1.5 }}
            style={{
              width: 8,
              height: 8,
              borderRadius: "50%",
              background: "white"
            }}
          />
          SCRAPING LIVE
        </motion.div>
      )}

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .animate-spin {
          animation: spin 1s linear infinite;
        }
        @media (max-width: 1024px) {
          div[style*="gridTemplateColumns: 1fr 1fr"] {
            grid-template-columns: 1fr !important;
          }
        }
      `}} />
    </div>
  );
}
