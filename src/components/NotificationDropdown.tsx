"use client";
import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bell, X, Check, AlertCircle, Calendar, FileText, Zap } from "lucide-react";
import { useTheme } from "@/lib/theme-context";

interface Notification {
  id: string;
  title: string;
  message: string;
  type: "deadline" | "new_notice" | "alert" | "system";
  timestamp: Date;
  read: boolean;
  link?: string;
}

export default function NotificationDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { isDark } = useTheme();
  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const response = await fetch("/api/notifications");
        if (response.ok) {
          const data = await response.json();
          const formattedNotifications = data.notifications.map((n: any) => ({
            ...n,
            timestamp: new Date(n.timestamp)
          }));
          setNotifications(formattedNotifications);
          setUnreadCount(formattedNotifications.filter((n: Notification) => !n.read).length);
        } else {
          // Use mock data as fallback
          useMockData();
        }
      } catch (error) {
        console.error("Error fetching notifications:", error);
        // Use mock data as fallback
        useMockData();
      }
    };

    const useMockData = () => {
      const mockNotifications: Notification[] = [
        {
          id: "1",
          title: "Urgent Deadline Tomorrow",
          message: "UPSC Civil Services Exam registration closes tomorrow at 11:59 PM",
          type: "deadline",
          timestamp: new Date(Date.now() - 1000 * 60 * 30), // 30 mins ago
          read: false,
          link: "/dashboard/deadlines"
        },
        {
          id: "2",
          title: "New Scholarship Notice",
          message: "National Merit Scholarship 2024 applications now open",
          type: "new_notice",
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
          read: false,
          link: "/dashboard/notices"
        },
        {
          id: "3",
          title: "Alert Triggered",
          message: "Your saved search 'Engineering Jobs' has 3 new matches",
          type: "alert",
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 5), // 5 hours ago
          read: true,
          link: "/dashboard/alerts"
        },
        {
          id: "4",
          title: "System Update",
          message: "AI analysis engine upgraded to Gemini 2.5 Flash",
          type: "system",
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 day ago
          read: true,
          link: "/dashboard/settings"
        }
      ];
      setNotifications(mockNotifications);
      setUnreadCount(mockNotifications.filter(n => !n.read).length);
    };

    fetchNotifications();
    
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [isOpen]);

  const markAsRead = async (id: string) => {
    setNotifications(prev =>
      prev.map(n => n.id === id ? { ...n, read: true } : n)
    );
    setUnreadCount(prev => Math.max(0, prev - 1));
    
    try {
      await fetch("/api/notifications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "mark_read", notificationId: id })
      });
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

  const markAllAsRead = async () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    setUnreadCount(0);
    
    try {
      await fetch("/api/notifications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "mark_all_read" })
      });
    } catch (error) {
      console.error("Error marking all notifications as read:", error);
    }
  };

  const clearNotification = async (id: string) => {
    const notification = notifications.find(n => n.id === id);
    setNotifications(prev => prev.filter(n => n.id !== id));
    if (notification && !notification.read) {
      setUnreadCount(prev => Math.max(0, prev - 1));
    }
    
    try {
      await fetch("/api/notifications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "delete", notificationId: id })
      });
    } catch (error) {
      console.error("Error deleting notification:", error);
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case "deadline": return <Calendar className="w-4 h-4" />;
      case "new_notice": return <FileText className="w-4 h-4" />;
      case "alert": return <AlertCircle className="w-4 h-4" />;
      case "system": return <Zap className="w-4 h-4" />;
      default: return <Bell className="w-4 h-4" />;
    }
  };

  const getIconColor = (type: string) => {
    switch (type) {
      case "deadline": return "#ef4444";
      case "new_notice": return "#3b82f6";
      case "alert": return "#f59e0b";
      case "system": return "#8b5cf6";
      default: return "#6b7280";
    }
  };

  const formatTimestamp = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return "Just now";
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return date.toLocaleDateString();
  };

  const textPrimary = "var(--text-primary)";
  const textSecondary = "var(--text-secondary)";
  const textMuted = "var(--text-muted)";
  const border = "var(--border)";
  const cardBg = "var(--bg-card)";

  return (
    <div ref={dropdownRef} style={{ position: "relative" }}>
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        style={{
          width: 38,
          height: 38,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: cardBg,
          border: `1px solid ${border}`,
          borderRadius: "50%",
          cursor: "pointer",
          color: textSecondary,
          transition: "all 0.2s ease",
          position: "relative",
        }}
      >
        <Bell className="w-4 h-4" />
        {unreadCount > 0 && (
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            style={{
              position: "absolute",
              top: 6,
              right: 6,
              width: 8,
              height: 8,
              background: "#dc2626",
              borderRadius: "50%",
              border: "2px solid var(--bg-primary)",
            }}
          />
        )}
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            style={{
              position: "absolute",
              top: "calc(100% + 12px)",
              right: 0,
              width: 380,
              maxHeight: 520,
              background: cardBg,
              border: `1px solid ${border}`,
              borderRadius: 16,
              boxShadow: isDark
                ? "0 20px 60px rgba(0,0,0,0.5)"
                : "0 20px 60px rgba(79,70,229,0.15)",
              overflow: "hidden",
              zIndex: 1000,
            }}
          >
            <div
              style={{
                padding: "16px 20px",
                borderBottom: `1px solid ${border}`,
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <div>
                <h3
                  style={{
                    fontSize: 16,
                    fontWeight: 700,
                    color: textPrimary,
                    margin: 0,
                    fontFamily: "'Manrope', sans-serif",
                  }}
                >
                  Notifications
                </h3>
                {unreadCount > 0 && (
                  <p
                    style={{
                      fontSize: 12,
                      color: textMuted,
                      margin: "2px 0 0 0",
                    }}
                  >
                    {unreadCount} unread
                  </p>
                )}
              </div>
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  style={{
                    background: "none",
                    border: "none",
                    color: "#8b5cf6",
                    fontSize: 12,
                    fontWeight: 600,
                    cursor: "pointer",
                    padding: "4px 8px",
                    borderRadius: 6,
                    transition: "all 0.2s",
                  }}
                  onMouseEnter={(e) => {
                    (e.target as HTMLElement).style.background = isDark
                      ? "rgba(139,92,246,0.1)"
                      : "rgba(139,92,246,0.08)";
                  }}
                  onMouseLeave={(e) => {
                    (e.target as HTMLElement).style.background = "none";
                  }}
                >
                  Mark all read
                </button>
              )}
            </div>

            <div
              style={{
                maxHeight: 420,
                overflowY: "auto",
              }}
            >
              {notifications.length === 0 ? (
                <div
                  style={{
                    padding: "40px 20px",
                    textAlign: "center",
                    color: textMuted,
                  }}
                >
                  <Bell
                    className="w-12 h-12"
                    style={{ margin: "0 auto 12px", opacity: 0.3 }}
                  />
                  <p style={{ fontSize: 14, margin: 0 }}>No notifications</p>
                </div>
              ) : (
                notifications.map((notification) => (
                  <motion.div
                    key={notification.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    style={{
                      padding: "14px 20px",
                      borderBottom: `1px solid ${border}`,
                      cursor: "pointer",
                      transition: "all 0.2s",
                      background: notification.read
                        ? "transparent"
                        : isDark
                        ? "rgba(139,92,246,0.05)"
                        : "rgba(139,92,246,0.03)",
                      position: "relative",
                    }}
                    onMouseEnter={(e) => {
                      (e.currentTarget as HTMLElement).style.background = isDark
                        ? "rgba(139,92,246,0.08)"
                        : "rgba(139,92,246,0.05)";
                    }}
                    onMouseLeave={(e) => {
                      (e.currentTarget as HTMLElement).style.background =
                        notification.read
                          ? "transparent"
                          : isDark
                          ? "rgba(139,92,246,0.05)"
                          : "rgba(139,92,246,0.03)";
                    }}
                    onClick={() => {
                      if (!notification.read) markAsRead(notification.id);
                      if (notification.link) window.location.href = notification.link;
                    }}
                  >
                    <div style={{ display: "flex", gap: 12, alignItems: "start" }}>
                      <div
                        style={{
                          width: 36,
                          height: 36,
                          borderRadius: 10,
                          background: isDark
                            ? "rgba(255,255,255,0.05)"
                            : "rgba(0,0,0,0.03)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          color: getIconColor(notification.type),
                          flexShrink: 0,
                        }}
                      >
                        {getIcon(notification.type)}
                      </div>

                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div
                          style={{
                            display: "flex",
                            alignItems: "start",
                            justifyContent: "space-between",
                            gap: 8,
                            marginBottom: 4,
                          }}
                        >
                          <h4
                            style={{
                              fontSize: 13,
                              fontWeight: 600,
                              color: textPrimary,
                              margin: 0,
                              lineHeight: 1.3,
                            }}
                          >
                            {notification.title}
                          </h4>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              clearNotification(notification.id);
                            }}
                            style={{
                              background: "none",
                              border: "none",
                              color: textMuted,
                              cursor: "pointer",
                              padding: 2,
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              borderRadius: 4,
                              transition: "all 0.2s",
                            }}
                            onMouseEnter={(e) => {
                              (e.target as HTMLElement).style.color = textPrimary;
                              (e.target as HTMLElement).style.background = isDark
                                ? "rgba(255,255,255,0.1)"
                                : "rgba(0,0,0,0.05)";
                            }}
                            onMouseLeave={(e) => {
                              (e.target as HTMLElement).style.color = textMuted;
                              (e.target as HTMLElement).style.background = "none";
                            }}
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                        <p
                          style={{
                            fontSize: 12,
                            color: textSecondary,
                            margin: "0 0 6px 0",
                            lineHeight: 1.4,
                          }}
                        >
                          {notification.message}
                        </p>
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                          }}
                        >
                          <span
                            style={{
                              fontSize: 11,
                              color: textMuted,
                            }}
                          >
                            {formatTimestamp(notification.timestamp)}
                          </span>
                          {!notification.read && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                markAsRead(notification.id);
                              }}
                              style={{
                                background: "none",
                                border: "none",
                                color: "#8b5cf6",
                                fontSize: 11,
                                fontWeight: 600,
                                cursor: "pointer",
                                padding: "2px 6px",
                                borderRadius: 4,
                                display: "flex",
                                alignItems: "center",
                                gap: 4,
                                transition: "all 0.2s",
                              }}
                              onMouseEnter={(e) => {
                                (e.target as HTMLElement).style.background = isDark
                                  ? "rgba(139,92,246,0.15)"
                                  : "rgba(139,92,246,0.1)";
                              }}
                              onMouseLeave={(e) => {
                                (e.target as HTMLElement).style.background = "none";
                              }}
                            >
                              <Check className="w-3 h-3" /> Mark read
                            </button>
                          )}
                        </div>
                      </div>
                    </div>

                    {!notification.read && (
                      <div
                        style={{
                          position: "absolute",
                          left: 8,
                          top: "50%",
                          transform: "translateY(-50%)",
                          width: 4,
                          height: 4,
                          borderRadius: "50%",
                          background: "#8b5cf6",
                        }}
                      />
                    )}
                  </motion.div>
                ))
              )}
            </div>

            {notifications.length > 0 && (
              <div
                style={{
                  padding: "12px 20px",
                  borderTop: `1px solid ${border}`,
                  textAlign: "center",
                }}
              >
                <a
                  href="/dashboard/alerts"
                  style={{
                    fontSize: 13,
                    fontWeight: 600,
                    color: "#8b5cf6",
                    textDecoration: "none",
                    display: "inline-block",
                    padding: "4px 12px",
                    borderRadius: 6,
                    transition: "all 0.2s",
                  }}
                  onMouseEnter={(e) => {
                    (e.target as HTMLElement).style.background = isDark
                      ? "rgba(139,92,246,0.1)"
                      : "rgba(139,92,246,0.08)";
                  }}
                  onMouseLeave={(e) => {
                    (e.target as HTMLElement).style.background = "none";
                  }}
                >
                  View all alerts
                </a>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
