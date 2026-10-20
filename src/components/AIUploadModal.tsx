"use client";
import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Upload, FileText, Image, File, CheckCircle, AlertCircle, Sparkles, Calendar, Tag, Building2, AlertTriangle } from "lucide-react";
import { toast } from "sonner";

interface AIUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type ProcessingStage = "idle" | "uploading" | "extracting" | "analyzing" | "saving" | "complete" | "error";

export default function AIUploadModal({ isOpen, onClose }: AIUploadModalProps) {
  const [stage, setStage] = useState<ProcessingStage>("idle");
  const [progress, setProgress] = useState(0);
  const [file, setFile] = useState<File | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [extractedData, setExtractedData] = useState<any>(null);
  const [analysisData, setAnalysisData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  }, []);

  const handleFileSelect = (selectedFile: File) => {
    // Validate file type
    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'text/plain'];
    if (!allowedTypes.includes(selectedFile.type)) {
      toast.error("Invalid file type. Only PDF, JPG, PNG, and TXT files are allowed.");
      return;
    }

    // Validate file size (50MB)
    if (selectedFile.size > 50 * 1024 * 1024) {
      toast.error("File size exceeds 50MB limit");
      return;
    }

    setFile(selectedFile);
    setError(null);
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileSelect(e.target.files[0]);
    }
  };

  const processFile = async () => {
    if (!file) return;

    try {
      // Stage 1: Uploading
      setStage("uploading");
      setProgress(10);

      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/notices/upload-file', {
        method: 'POST',
        body: formData
      });

      setProgress(30);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Upload failed');
      }

      const data = await response.json();
      
      // Stage 2: Extracting
      setStage("extracting");
      setProgress(50);
      
      if (data.extraction) {
        setExtractedData(data.extraction);
      }

      await new Promise(resolve => setTimeout(resolve, 500));

      // Stage 3: Analyzing
      setStage("analyzing");
      setProgress(70);

      if (data.analysis) {
        setAnalysisData(data.analysis);
      }

      await new Promise(resolve => setTimeout(resolve, 500));

      // Stage 4: Saving
      setStage("saving");
      setProgress(90);

      await new Promise(resolve => setTimeout(resolve, 500));

      // Stage 5: Complete
      setStage("complete");
      setProgress(100);

      toast.success("Notice processed successfully! 🎉");

    } catch (err: any) {
      setStage("error");
      
      // Check if it's a Tesseract error
      if (err.message && err.message.includes('tesseract')) {
        setError("Tesseract OCR is not installed. Please install it to process scanned PDFs and images.");
        toast.error("OCR Engine Missing", {
          description: "Install Tesseract OCR to process scanned documents. See TESSERACT_INSTALLATION.md for instructions.",
          duration: 8000,
        });
      } else if (err.error === 'OCR Engine Not Installed') {
        setError(err.message || "Tesseract OCR is required for this file type.");
        toast.error("OCR Engine Not Installed", {
          description: err.workaround || "You can still upload text-based PDFs without Tesseract.",
          duration: 8000,
        });
      } else {
        setError(err.message || "Processing failed");
        toast.error(err.message || "Failed to process file");
      }
    }
  };

  const reset = () => {
    setStage("idle");
    setProgress(0);
    setFile(null);
    setExtractedData(null);
    setAnalysisData(null);
    setError(null);
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const getFileIcon = (type: string) => {
    if (type.includes('pdf')) return <FileText className="w-6 h-6" />;
    if (type.includes('image')) return <Image className="w-6 h-6" />;
    return <File className="w-6 h-6" />;
  };

  const getStageInfo = () => {
    switch (stage) {
      case "uploading":
        return { label: "Uploading", color: "#6366f1", icon: Upload };
      case "extracting":
        return { label: "Extracting Text", color: "#8b5cf6", icon: FileText };
      case "analyzing":
        return { label: "AI Analysis", color: "#a855f7", icon: Sparkles };
      case "saving":
        return { label: "Saving to Database", color: "#10b981", icon: CheckCircle };
      case "complete":
        return { label: "Complete", color: "#10b981", icon: CheckCircle };
      case "error":
        return { label: "Error", color: "#ef4444", icon: AlertCircle };
      default:
        return { label: "Ready", color: "#6366f1", icon: Upload };
    }
  };

  const stageInfo = getStageInfo();

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            style={{
              position: "fixed",
              inset: 0,
              background: "rgba(0,0,0,0.8)",
              backdropFilter: "blur(8px)",
              zIndex: 9998,
              top: 0,
              left: 0,
              right: 0,
              bottom: 0
            }}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            onClick={(e) => e.stopPropagation()}
            style={{
              position: "fixed",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              width: "90%",
              maxWidth: 900,
              maxHeight: "90vh",
              overflowY: "auto",
              background: "#0f0f1a",
              border: "1px solid rgba(212,165,116,0.3)",
              borderRadius: 24,
              padding: 0,
              zIndex: 9999,
              boxShadow: "0 25px 50px -12px rgba(0,0,0,0.5)",
              margin: 0
            }}
          >
            {/* Header */}
            <div style={{ padding: "24px 32px", borderBottom: "1px solid rgba(255,255,255,0.1)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                <div style={{ width: 48, height: 48, borderRadius: 12, background: "linear-gradient(135deg,#d4a574,#c9985f)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Sparkles className="w-6 h-6" style={{ color: "#000" }} />
                </div>
                <div>
                  <h2 style={{ fontSize: 22, fontWeight: 800, color: "#f1f0ff", fontFamily: "'Outfit',sans-serif", marginBottom: 4 }}>AI-Powered Notice Upload</h2>
                  <p style={{ fontSize: 13, color: "#9d9db5" }}>Upload and automatically analyze notices with AI</p>
                </div>
              </div>
              <button onClick={handleClose} style={{ padding: 10, borderRadius: 10, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)", cursor: "pointer", color: "#9d9db5" }}>
                <X className="w-5 h-5" />
              </button>
            </div>

            <div style={{ padding: 32, minHeight: 400 }}>
              {/* Upload Area */}
              {stage === "idle" && !file && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={handleDrop}
                  style={{
                    border: `2px dashed ${dragActive ? "#7c3aed" : "rgba(255,255,255,0.2)"}`,
                    borderRadius: 16,
                    padding: 60,
                    textAlign: "center",
                    background: dragActive ? "rgba(124,58,237,0.05)" : "rgba(255,255,255,0.02)",
                    transition: "all 0.3s",
                    cursor: "pointer"
                  }}
                  onClick={() => document.getElementById('file-input')?.click()}
                >
                  <motion.div
                    animate={{ y: dragActive ? -10 : 0 }}
                    style={{ display: "inline-flex", width: 80, height: 80, borderRadius: 20, background: "linear-gradient(135deg,rgba(124,58,237,0.2),rgba(99,102,241,0.2))", alignItems: "center", justifyContent: "center", marginBottom: 20 }}
                  >
                    <Upload className="w-10 h-10" style={{ color: "#a78bfa" }} />
                  </motion.div>
                  <h3 style={{ fontSize: 20, fontWeight: 700, color: "#f1f0ff", marginBottom: 8 }}>Drop your notice here</h3>
                  <p style={{ fontSize: 14, color: "#9d9db5", marginBottom: 20 }}>or click to browse files</p>
                  <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
                    <span style={{ fontSize: 12, padding: "6px 12px", borderRadius: 20, background: "rgba(124,58,237,0.15)", color: "#a78bfa", border: "1px solid rgba(124,58,237,0.3)" }}>PDF</span>
                    <span style={{ fontSize: 12, padding: "6px 12px", borderRadius: 20, background: "rgba(124,58,237,0.15)", color: "#a78bfa", border: "1px solid rgba(124,58,237,0.3)" }}>JPG/PNG</span>
                    <span style={{ fontSize: 12, padding: "6px 12px", borderRadius: 20, background: "rgba(124,58,237,0.15)", color: "#a78bfa", border: "1px solid rgba(124,58,237,0.3)" }}>TXT</span>
                  </div>
                  <p style={{ fontSize: 11, color: "#5c5c7a", marginTop: 16 }}>Maximum file size: 50MB</p>
                  <input
                    id="file-input"
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png,.txt"
                    onChange={handleFileInput}
                    style={{ display: "none" }}
                  />
                </motion.div>
              )}

              {/* File Selected */}
              {file && stage === "idle" && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                  <div style={{ padding: 20, borderRadius: 16, background: "rgba(124,58,237,0.08)", border: "1px solid rgba(124,58,237,0.2)", marginBottom: 24 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                      <div style={{ width: 48, height: 48, borderRadius: 12, background: "rgba(124,58,237,0.2)", display: "flex", alignItems: "center", justifyContent: "center", color: "#a78bfa" }}>
                        {getFileIcon(file.type)}
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 15, fontWeight: 600, color: "#f1f0ff", marginBottom: 4 }}>{file.name}</div>
                        <div style={{ fontSize: 13, color: "#9d9db5" }}>{(file.size / 1024 / 1024).toFixed(2)} MB</div>
                      </div>
                      <button onClick={() => setFile(null)} style={{ padding: 8, borderRadius: 8, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)", cursor: "pointer", color: "#9d9db5" }}>
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  <button
                    onClick={processFile}
                    className="btn-glow"
                    style={{ width: "100%", padding: 16, borderRadius: 12, border: "none", color: "white", fontSize: 15, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 10 }}
                  >
                    <Sparkles className="w-5 h-5" />
                    Process with AI
                  </button>
                </motion.div>
              )}

              {/* Processing */}
              {stage !== "idle" && stage !== "complete" && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                  <div style={{ textAlign: "center", marginBottom: 32 }}>
                    <motion.div
                      animate={{ rotate: stage === "analyzing" ? 360 : 0 }}
                      transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                      style={{ display: "inline-flex", width: 80, height: 80, borderRadius: 20, background: `linear-gradient(135deg,${stageInfo.color}33,${stageInfo.color}22)`, alignItems: "center", justifyContent: "center", marginBottom: 20 }}
                    >
                      <stageInfo.icon className="w-10 h-10" style={{ color: stageInfo.color }} />
                    </motion.div>
                    <h3 style={{ fontSize: 20, fontWeight: 700, color: "#f1f0ff", marginBottom: 8 }}>{stageInfo.label}</h3>
                    <p style={{ fontSize: 14, color: "#9d9db5" }}>Please wait while we process your notice...</p>
                  </div>

                  {/* Progress Bar */}
                  <div style={{ marginBottom: 32 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                      <span style={{ fontSize: 13, color: "#9d9db5" }}>{stageInfo.label}</span>
                      <span style={{ fontSize: 13, fontWeight: 600, color: stageInfo.color }}>{progress}%</span>
                    </div>
                    <div style={{ height: 8, background: "rgba(255,255,255,0.05)", borderRadius: 99, overflow: "hidden" }}>
                      <motion.div
                        initial={{ width: "0%" }}
                        animate={{ width: `${progress}%` }}
                        transition={{ duration: 0.5 }}
                        style={{ height: "100%", background: `linear-gradient(90deg, ${stageInfo.color}, ${stageInfo.color}dd)`, borderRadius: 99 }}
                      />
                    </div>
                  </div>

                  {/* Stage Indicators */}
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12 }}>
                    {["uploading", "extracting", "analyzing", "saving"].map((s, i) => {
                      const isActive = stage === s;
                      const isDone = ["uploading", "extracting", "analyzing", "saving"].indexOf(stage) > i;
                      return (
                        <div key={s} style={{ padding: 12, borderRadius: 12, background: isActive ? "rgba(124,58,237,0.15)" : isDone ? "rgba(16,185,129,0.1)" : "rgba(255,255,255,0.02)", border: `1px solid ${isActive ? "rgba(124,58,237,0.3)" : isDone ? "rgba(16,185,129,0.2)" : "rgba(255,255,255,0.05)"}`, textAlign: "center" }}>
                          <div style={{ fontSize: 11, fontWeight: 600, color: isActive ? "#a78bfa" : isDone ? "#10b981" : "#5c5c7a", textTransform: "capitalize" }}>{s}</div>
                        </div>
                      );
                    })}
                  </div>
                </motion.div>
              )}

              {/* Results */}
              {stage === "complete" && analysisData && (
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                  <div style={{ textAlign: "center", marginBottom: 32 }}>
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", duration: 0.6 }}
                      style={{ display: "inline-flex", width: 80, height: 80, borderRadius: 20, background: "linear-gradient(135deg,rgba(16,185,129,0.2),rgba(16,185,129,0.1))", alignItems: "center", justifyContent: "center", marginBottom: 20 }}
                    >
                      <CheckCircle className="w-10 h-10" style={{ color: "#10b981" }} />
                    </motion.div>
                    <h3 style={{ fontSize: 22, fontWeight: 800, color: "#f1f0ff", marginBottom: 8 }}>Analysis Complete!</h3>
                    <p style={{ fontSize: 14, color: "#9d9db5" }}>AI has extracted structured information from your notice</p>
                  </div>

                  {/* Extracted Data */}
                  <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                    {/* Title */}
                    <div style={{ padding: 20, borderRadius: 16, background: "rgba(124,58,237,0.08)", border: "1px solid rgba(124,58,237,0.2)" }}>
                      <div style={{ fontSize: 12, color: "#9d9db5", marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.5px" }}>Title</div>
                      <div style={{ fontSize: 18, fontWeight: 700, color: "#f1f0ff" }}>{analysisData.title}</div>
                    </div>

                    {/* Summary */}
                    <div style={{ padding: 20, borderRadius: 16, background: "rgba(99,102,241,0.08)", border: "1px solid rgba(99,102,241,0.2)" }}>
                      <div style={{ fontSize: 12, color: "#9d9db5", marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.5px" }}>AI Summary</div>
                      <div style={{ fontSize: 14, color: "#d1d5db", lineHeight: 1.6 }}>{analysisData.summary}</div>
                    </div>

                    {/* Meta Info */}
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 16 }}>
                      <div style={{ padding: 16, borderRadius: 12, background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                          <Tag className="w-4 h-4" style={{ color: "#a78bfa" }} />
                          <span style={{ fontSize: 11, color: "#9d9db5", textTransform: "uppercase" }}>Category</span>
                        </div>
                        <div style={{ fontSize: 15, fontWeight: 600, color: "#f1f0ff" }}>{analysisData.category}</div>
                      </div>

                      <div style={{ padding: 16, borderRadius: 12, background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                          <Building2 className="w-4 h-4" style={{ color: "#a78bfa" }} />
                          <span style={{ fontSize: 11, color: "#9d9db5", textTransform: "uppercase" }}>Issuer</span>
                        </div>
                        <div style={{ fontSize: 15, fontWeight: 600, color: "#f1f0ff" }}>{analysisData.issuer}</div>
                      </div>

                      <div style={{ padding: 16, borderRadius: 12, background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                          <AlertTriangle className="w-4 h-4" style={{ color: analysisData.urgency === "critical" ? "#ef4444" : analysisData.urgency === "high" ? "#f59e0b" : "#6366f1" }} />
                          <span style={{ fontSize: 11, color: "#9d9db5", textTransform: "uppercase" }}>Urgency</span>
                        </div>
                        <div style={{ fontSize: 15, fontWeight: 600, color: "#f1f0ff", textTransform: "capitalize" }}>{analysisData.urgency}</div>
                      </div>
                    </div>

                    {/* Important Dates */}
                    {analysisData.important_dates && analysisData.important_dates.length > 0 && (
                      <div style={{ padding: 20, borderRadius: 16, background: "rgba(16,185,129,0.08)", border: "1px solid rgba(16,185,129,0.2)" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
                          <Calendar className="w-5 h-5" style={{ color: "#10b981" }} />
                          <span style={{ fontSize: 13, fontWeight: 600, color: "#f1f0ff", textTransform: "uppercase", letterSpacing: "0.5px" }}>Important Dates</span>
                        </div>
                        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                          {analysisData.important_dates.map((dateObj: any, idx: number) => (
                            <div key={idx} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: 12, borderRadius: 10, background: "rgba(255,255,255,0.03)" }}>
                              <span style={{ fontSize: 13, color: "#d1d5db" }}>{dateObj.label}</span>
                              <span style={{ fontSize: 14, fontWeight: 600, color: "#10b981" }}>{new Date(dateObj.date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Actions */}
                    <div style={{ display: "flex", gap: 12, marginTop: 16 }}>
                      <button
                        onClick={handleClose}
                        className="btn-glow"
                        style={{ flex: 1, padding: 14, borderRadius: 12, border: "none", color: "white", fontSize: 14, fontWeight: 600, cursor: "pointer" }}
                      >
                        Done
                      </button>
                      <button
                        onClick={reset}
                        style={{ flex: 1, padding: 14, borderRadius: 12, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)", color: "#9d9db5", fontSize: 14, fontWeight: 600, cursor: "pointer" }}
                      >
                        Upload Another
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Error State */}
              {stage === "error" && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ textAlign: "center" }}>
                  <div style={{ display: "inline-flex", width: 80, height: 80, borderRadius: 20, background: "rgba(239,68,68,0.1)", alignItems: "center", justifyContent: "center", marginBottom: 20 }}>
                    <AlertCircle className="w-10 h-10" style={{ color: "#ef4444" }} />
                  </div>
                  <h3 style={{ fontSize: 20, fontWeight: 700, color: "#f1f0ff", marginBottom: 8 }}>Processing Failed</h3>
                  <p style={{ fontSize: 14, color: "#9d9db5", marginBottom: 24 }}>{error}</p>
                  <button
                    onClick={reset}
                    className="btn-glow"
                    style={{ padding: 14, paddingLeft: 32, paddingRight: 32, borderRadius: 12, border: "none", color: "white", fontSize: 14, fontWeight: 600, cursor: "pointer" }}
                  >
                    Try Again
                  </button>
                </motion.div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
