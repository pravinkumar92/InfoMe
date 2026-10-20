"use client";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Globe, Check } from "lucide-react";

const languages = [
  { code: "en", name: "English", flag: "🇬🇧" },
  { code: "hi", name: "हिंदी", flag: "🇮🇳" },
  { code: "ur", name: "اردو", flag: "🇵🇰" },
  { code: "bn", name: "বাংলা", flag: "🇧🇩" }
];

export default function LanguageSwitcher() {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState("en");
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    // Load saved language from localStorage
    const saved = localStorage.getItem("preferred_language");
    if (saved) {
      setSelectedLanguage(saved);
    }
  }, []);

  const handleLanguageChange = async (langCode: string) => {
    if (langCode === selectedLanguage) {
      setIsOpen(false);
      return;
    }

    setIsAnimating(true);
    
    // Save to localStorage
    localStorage.setItem("preferred_language", langCode);
    
    // Save to backend user preferences if user is logged in
    try {
      const userId = localStorage.getItem("user_id");
      if (userId) {
        await fetch('http://localhost:8000/preferences', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            user_id: userId,
            preferred_language: langCode,
            notification_language: langCode
          })
        });
      }
    } catch (error) {
      console.error("Failed to save language preference:", error);
    }

    // Animate language change
    setTimeout(() => {
      setSelectedLanguage(langCode);
      setIsAnimating(false);
      setIsOpen(false);
      
      // Trigger page refresh or re-translation
      window.dispatchEvent(new CustomEvent('languageChanged', { detail: { language: langCode } }));
      
      // Show success message
      const langName = languages.find(l => l.code === langCode)?.name || langCode;
      // You can add a toast notification here if you have a toast library
      console.log(`Language changed to ${langName}`);
    }, 300);
  };

  const currentLang = languages.find(l => l.code === selectedLanguage) || languages[0];

  return (
    <div style={{ position: "relative" }}>
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          padding: "8px 16px",
          borderRadius: 12,
          background: "rgba(255,255,255,0.05)",
          border: "1px solid var(--border)",
          color: "#f1f0ff",
          fontSize: 14,
          fontWeight: 600,
          cursor: "pointer",
          transition: "all 0.2s"
        }}
      >
        <Globe className="w-4 h-4" style={{ color: "#d4a574" }} />
        <span style={{ fontSize: 18 }}>{currentLang.flag}</span>
        <span>{currentLang.name}</span>
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              style={{
                position: "fixed",
                inset: 0,
                zIndex: 999
              }}
            />

            {/* Dropdown */}
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              style={{
                position: "absolute",
                top: "calc(100% + 8px)",
                right: 0,
                minWidth: 200,
                background: "var(--bg-card)",
                border: "1px solid var(--border)",
                borderRadius: 12,
                padding: 8,
                backdropFilter: "blur(20px)",
                boxShadow: "0 8px 32px rgba(0,0,0,0.4)",
                zIndex: 1000
              }}
            >
              {languages.map((lang, index) => (
                <motion.button
                  key={lang.code}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  onClick={() => handleLanguageChange(lang.code)}
                  style={{
                    width: "100%",
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                    padding: "10px 12px",
                    borderRadius: 8,
                    background: selectedLanguage === lang.code ? "rgba(212, 165, 116, 0.1)" : "transparent",
                    border: "none",
                    color: selectedLanguage === lang.code ? "#d4a574" : "#f1f0ff",
                    fontSize: 14,
                    fontWeight: 600,
                    cursor: "pointer",
                    transition: "all 0.2s",
                    textAlign: "left"
                  }}
                  onMouseEnter={(e) => {
                    if (selectedLanguage !== lang.code) {
                      e.currentTarget.style.background = "rgba(255,255,255,0.05)";
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (selectedLanguage !== lang.code) {
                      e.currentTarget.style.background = "transparent";
                    }
                  }}
                >
                  <span style={{ fontSize: 20 }}>{lang.flag}</span>
                  <span style={{ flex: 1 }}>{lang.name}</span>
                  {selectedLanguage === lang.code && (
                    <Check className="w-4 h-4" style={{ color: "#d4a574" }} />
                  )}
                </motion.button>
              ))}
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Language Change Animation Overlay */}
      <AnimatePresence>
        {isAnimating && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: "fixed",
              inset: 0,
              background: "rgba(0,0,0,0.5)",
              backdropFilter: "blur(4px)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 9999
            }}
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              style={{
                background: "var(--bg-card)",
                border: "1px solid var(--border)",
                borderRadius: 20,
                padding: 32,
                textAlign: "center"
              }}
            >
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                style={{ fontSize: 48, marginBottom: 16 }}
              >
                🌐
              </motion.div>
              <div style={{ fontSize: 16, fontWeight: 600, color: "#f1f0ff" }}>
                Switching language...
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
