"use client";
import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Bot, User, Sparkles, Loader2, Trash2, Download } from "lucide-react";
import { toast } from "sonner";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

export default function AIAssistantPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "assistant",
      content: "Hello! I'm your InfoMe AI Assistant powered by Google Gemini. I can help you with:\n\n• Understanding notices and deadlines\n• Translating content\n• Answering questions about scholarships, exams, and jobs\n• Providing guidance on application processes\n\nHow can I assist you today?",
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input.trim(),
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const response = await fetch("http://localhost:8000/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: userMessage.content,
          conversation_history: messages.slice(-5).map(m => ({
            role: m.role,
            content: m.content
          }))
        })
      });

      const data = await response.json();

      if (data.success) {
        const assistantMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content: data.response,
          timestamp: new Date()
        };
        setMessages(prev => [...prev, assistantMessage]);
      } else {
        throw new Error(data.error || "Failed to get response");
      }
    } catch (error) {
      console.error("AI Error:", error);
      toast.error("Failed to get AI response. Please try again.");
      
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: "I apologize, but I'm having trouble connecting right now. Please make sure the backend server is running and try again.",
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
      inputRef.current?.focus();
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const clearChat = () => {
    setMessages([
      {
        id: "welcome",
        role: "assistant",
        content: "Chat cleared! How can I help you?",
        timestamp: new Date()
      }
    ]);
    toast.success("Chat cleared");
  };

  const exportChat = () => {
    const chatText = messages.map(m => 
      `[${m.timestamp.toLocaleTimeString()}] ${m.role === "user" ? "You" : "AI"}: ${m.content}`
    ).join("\n\n");
    
    const blob = new Blob([chatText], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `infome-ai-chat-${Date.now()}.txt`;
    a.click();
    toast.success("Chat exported!");
  };

  return (
    <div style={{ maxWidth: 1200, margin: "0 auto", height: "calc(100vh - 160px)", display: "flex", flexDirection: "column" }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 28, fontWeight: 800, color: "#f1f0ff", fontFamily: "'Outfit',sans-serif", marginBottom: 6, display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{
              width: 48,
              height: 48,
              borderRadius: 12,
              background: "linear-gradient(135deg, #d4a574 0%, #c89960 100%)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 4px 20px rgba(212, 165, 116, 0.3)"
            }}>
              <Sparkles className="w-6 h-6" style={{ color: "#1a1a2e" }} />
            </div>
            AI Assistant
          </h1>
          <p style={{ fontSize: 14, color: "#5c5c7a", marginLeft: 60 }}>Powered by Google Gemini 2.5 Flash</p>
        </div>
        <div style={{ display: "flex", gap: 12 }}>
          <button
            onClick={exportChat}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              padding: "10px 20px",
              borderRadius: 10,
              background: "rgba(255,255,255,0.05)",
              border: "1px solid var(--border)",
              color: "#9d9db5",
              fontSize: 14,
              fontWeight: 600,
              cursor: "pointer"
            }}
          >
            <Download className="w-4 h-4" /> Export
          </button>
          <button
            onClick={clearChat}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              padding: "10px 20px",
              borderRadius: 10,
              background: "rgba(239, 68, 68, 0.1)",
              border: "1px solid rgba(239, 68, 68, 0.3)",
              color: "#ef4444",
              fontSize: 14,
              fontWeight: 600,
              cursor: "pointer"
            }}
          >
            <Trash2 className="w-4 h-4" /> Clear
          </button>
        </div>
      </div>

      {/* Chat Container */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        style={{
          flex: 1,
          background: "var(--bg-card)",
          border: "1px solid var(--border)",
          borderRadius: 20,
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
          backdropFilter: "blur(20px)"
        }}
      >
        {/* Messages */}
        <div style={{ flex: 1, overflowY: "auto", padding: 24, display: "flex", flexDirection: "column", gap: 20 }}>
          <AnimatePresence>
            {messages.map((message, index) => (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                style={{
                  display: "flex",
                  gap: 12,
                  alignItems: "flex-start",
                  flexDirection: message.role === "user" ? "row-reverse" : "row"
                }}
              >
                {/* Avatar */}
                <div
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: 12,
                    background: message.role === "user" 
                      ? "linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%)"
                      : "linear-gradient(135deg, #d4a574 0%, #c89960 100%)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                    boxShadow: message.role === "user"
                      ? "0 4px 16px rgba(124, 58, 237, 0.3)"
                      : "0 4px 16px rgba(212, 165, 116, 0.3)"
                  }}
                >
                  {message.role === "user" ? (
                    <User className="w-5 h-5" style={{ color: "#fff" }} />
                  ) : (
                    <Bot className="w-5 h-5" style={{ color: "#1a1a2e" }} />
                  )}
                </div>

                {/* Message Content */}
                <div
                  style={{
                    maxWidth: "70%",
                    padding: 16,
                    borderRadius: 16,
                    background: message.role === "user"
                      ? "rgba(124, 58, 237, 0.1)"
                      : "rgba(255,255,255,0.03)",
                    border: message.role === "user"
                      ? "1px solid rgba(124, 58, 237, 0.3)"
                      : "1px solid var(--border)"
                  }}
                >
                  <div style={{ fontSize: 14, color: "#f1f0ff", lineHeight: 1.6, whiteSpace: "pre-wrap" }}>
                    {message.content}
                  </div>
                  <div style={{ fontSize: 11, color: "#5c5c7a", marginTop: 8 }}>
                    {message.timestamp.toLocaleTimeString()}
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {/* Loading Indicator */}
          {isLoading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              style={{ display: "flex", gap: 12, alignItems: "flex-start" }}
            >
              <div
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 12,
                  background: "linear-gradient(135deg, #d4a574 0%, #c89960 100%)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0
                }}
              >
                <Bot className="w-5 h-5" style={{ color: "#1a1a2e" }} />
              </div>
              <div
                style={{
                  padding: 16,
                  borderRadius: 16,
                  background: "rgba(255,255,255,0.03)",
                  border: "1px solid var(--border)",
                  display: "flex",
                  gap: 6
                }}
              >
                <motion.div
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 0.6, repeat: Infinity, delay: 0 }}
                  style={{ width: 8, height: 8, borderRadius: "50%", background: "#d4a574" }}
                />
                <motion.div
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 0.6, repeat: Infinity, delay: 0.2 }}
                  style={{ width: 8, height: 8, borderRadius: "50%", background: "#d4a574" }}
                />
                <motion.div
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 0.6, repeat: Infinity, delay: 0.4 }}
                  style={{ width: 8, height: 8, borderRadius: "50%", background: "#d4a574" }}
                />
              </div>
            </motion.div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div style={{ padding: 20, borderTop: "1px solid var(--border)" }}>
          <div style={{ display: "flex", gap: 12, alignItems: "flex-end" }}>
            <input
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask me anything about notices, scholarships, exams..."
              disabled={isLoading}
              style={{
                flex: 1,
                padding: "14px 18px",
                borderRadius: 12,
                background: "rgba(255,255,255,0.03)",
                border: "1px solid var(--border)",
                color: "#f1f0ff",
                fontSize: 14,
                outline: "none",
                transition: "all 0.2s"
              }}
              onFocus={(e) => {
                e.target.style.borderColor = "#d4a574";
                e.target.style.background = "rgba(255,255,255,0.05)";
              }}
              onBlur={(e) => {
                e.target.style.borderColor = "var(--border)";
                e.target.style.background = "rgba(255,255,255,0.03)";
              }}
            />
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleSend}
              disabled={!input.trim() || isLoading}
              style={{
                padding: "14px 24px",
                borderRadius: 12,
                background: input.trim() && !isLoading
                  ? "linear-gradient(135deg, #d4a574 0%, #c89960 100%)"
                  : "rgba(255,255,255,0.05)",
                border: "none",
                color: input.trim() && !isLoading ? "#1a1a2e" : "#5c5c7a",
                fontSize: 14,
                fontWeight: 700,
                cursor: input.trim() && !isLoading ? "pointer" : "not-allowed",
                display: "flex",
                alignItems: "center",
                gap: 8,
                boxShadow: input.trim() && !isLoading ? "0 4px 20px rgba(212, 165, 116, 0.3)" : "none"
              }}
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Thinking...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  Send
                </>
              )}
            </motion.button>
          </div>
          <div style={{ fontSize: 11, color: "#5c5c7a", marginTop: 12, textAlign: "center" }}>
            AI can make mistakes. Verify important information.
          </div>
        </div>
      </motion.div>
    </div>
  );
}
