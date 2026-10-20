"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Upload, FileText, AlertCircle } from "lucide-react";
import { toast } from "sonner";

interface UploadNoticeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const categories = ["Scholarships", "Jobs", "Exams", "Results", "Tenders", "Admissions", "Civic Alerts", "General"];
const urgencyLevels = ["low", "medium", "high", "critical"];

export default function UploadNoticeModal({ isOpen, onClose }: UploadNoticeModalProps) {
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    title: "",
    description: "",
    category: "General",
    department: "",
    urgency: "medium",
    last_date: "",
    amount: "",
    external_url: "",
    pdf_url: ""
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!form.title || !form.category) {
      toast.error("Title and category are required");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/notices/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Upload failed');
      }

      toast.success("Notice uploaded successfully! 🎉");
      
      // Reset form
      setForm({
        title: "",
        description: "",
        category: "General",
        department: "",
        urgency: "medium",
        last_date: "",
        amount: "",
        external_url: "",
        pdf_url: ""
      });
      
      onClose();
    } catch (error: any) {
      toast.error(error.message || "Failed to upload notice");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            style={{
              position: "fixed",
              inset: 0,
              background: "rgba(0,0,0,0.7)",
              backdropFilter: "blur(4px)",
              zIndex: 50
            }}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            style={{
              position: "fixed",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              width: "90%",
              maxWidth: 600,
              maxHeight: "90vh",
              overflowY: "auto",
              background: "var(--bg-card)",
              border: "1px solid var(--border)",
              borderRadius: 20,
              padding: 32,
              zIndex: 51
            }}
          >
            {/* Header */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div style={{ width: 40, height: 40, borderRadius: 10, background: "linear-gradient(135deg,#7c3aed,#6d28d9)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <FileText className="w-5 h-5" style={{ color: "white" }} />
                </div>
                <div>
                  <h2 style={{ fontSize: 20, fontWeight: 800, color: "#f1f0ff", fontFamily: "'Outfit',sans-serif" }}>Upload Notice</h2>
                  <p style={{ fontSize: 13, color: "#5c5c7a" }}>Add a new notice manually</p>
                </div>
              </div>
              <button onClick={onClose} style={{ padding: 8, borderRadius: 8, background: "rgba(255,255,255,0.04)", border: "1px solid var(--border)", cursor: "pointer", color: "#9d9db5" }}>
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div>
                <label style={{ fontSize: 13, color: "#9d9db5", marginBottom: 6, display: "block" }}>Title *</label>
                <input
                  type="text"
                  value={form.title}
                  onChange={e => setForm({ ...form, title: e.target.value })}
                  placeholder="e.g., AKTU B.Tech Exam Schedule 2026"
                  className="input-dark"
                  required
                />
              </div>

              <div>
                <label style={{ fontSize: 13, color: "#9d9db5", marginBottom: 6, display: "block" }}>Description</label>
                <textarea
                  value={form.description}
                  onChange={e => setForm({ ...form, description: e.target.value })}
                  placeholder="Detailed description of the notice..."
                  className="input-dark"
                  rows={4}
                  style={{ resize: "vertical" }}
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div>
                  <label style={{ fontSize: 13, color: "#9d9db5", marginBottom: 6, display: "block" }}>Category *</label>
                  <select
                    value={form.category}
                    onChange={e => setForm({ ...form, category: e.target.value })}
                    className="input-dark"
                    required
                  >
                    {categories.map(c => <option key={c} value={c} style={{ background: "#12121e" }}>{c}</option>)}
                  </select>
                </div>

                <div>
                  <label style={{ fontSize: 13, color: "#9d9db5", marginBottom: 6, display: "block" }}>Urgency</label>
                  <select
                    value={form.urgency}
                    onChange={e => setForm({ ...form, urgency: e.target.value })}
                    className="input-dark"
                  >
                    {urgencyLevels.map(u => <option key={u} value={u} style={{ background: "#12121e", textTransform: "capitalize" }}>{u}</option>)}
                  </select>
                </div>
              </div>

              <div>
                <label style={{ fontSize: 13, color: "#9d9db5", marginBottom: 6, display: "block" }}>Department/Organization</label>
                <input
                  type="text"
                  value={form.department}
                  onChange={e => setForm({ ...form, department: e.target.value })}
                  placeholder="e.g., AKTU Lucknow, Ministry of Education"
                  className="input-dark"
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div>
                  <label style={{ fontSize: 13, color: "#9d9db5", marginBottom: 6, display: "block" }}>Last Date</label>
                  <input
                    type="date"
                    value={form.last_date}
                    onChange={e => setForm({ ...form, last_date: e.target.value })}
                    className="input-dark"
                  />
                </div>

                <div>
                  <label style={{ fontSize: 13, color: "#9d9db5", marginBottom: 6, display: "block" }}>Amount (if applicable)</label>
                  <input
                    type="text"
                    value={form.amount}
                    onChange={e => setForm({ ...form, amount: e.target.value })}
                    placeholder="e.g., ₹36,000/year"
                    className="input-dark"
                  />
                </div>
              </div>

              <div>
                <label style={{ fontSize: 13, color: "#9d9db5", marginBottom: 6, display: "block" }}>External URL</label>
                <input
                  type="url"
                  value={form.external_url}
                  onChange={e => setForm({ ...form, external_url: e.target.value })}
                  placeholder="https://example.com/notice"
                  className="input-dark"
                />
              </div>

              <div>
                <label style={{ fontSize: 13, color: "#9d9db5", marginBottom: 6, display: "block" }}>PDF URL (optional)</label>
                <input
                  type="url"
                  value={form.pdf_url}
                  onChange={e => setForm({ ...form, pdf_url: e.target.value })}
                  placeholder="https://example.com/notice.pdf"
                  className="input-dark"
                />
              </div>

              <div style={{ padding: 12, borderRadius: 10, background: "rgba(99,102,241,0.08)", border: "1px solid rgba(99,102,241,0.2)", display: "flex", gap: 10 }}>
                <AlertCircle className="w-4 h-4" style={{ color: "#a5b4fc", flexShrink: 0, marginTop: 2 }} />
                <p style={{ fontSize: 12, color: "#9d9db5", lineHeight: 1.5 }}>
                  This notice will be visible to all users and alerts will be sent based on their preferences.
                </p>
              </div>

              <div style={{ display: "flex", gap: 12, marginTop: 8 }}>
                <button
                  type="button"
                  onClick={onClose}
                  style={{ flex: 1, padding: 12, borderRadius: 10, background: "rgba(255,255,255,0.04)", border: "1px solid var(--border)", color: "#9d9db5", fontSize: 14, fontWeight: 600, cursor: "pointer" }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="btn-glow"
                  style={{ flex: 1, padding: 12, borderRadius: 10, border: "none", color: "white", fontSize: 14, fontWeight: 600, cursor: loading ? "not-allowed" : "pointer", opacity: loading ? 0.7 : 1 }}
                >
                  {loading ? "Uploading..." : "Upload Notice"}
                </button>
              </div>
            </form>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
