"use client";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Plus, Bell, X, Clock, MapPin, AlertCircle } from "lucide-react";
import { toast } from "sonner";

interface CalendarEvent {
  id: string;
  title: string;
  description?: string;
  deadline_date: string;
  priority: "low" | "medium" | "high" | "critical";
  source: string;
  notice_id?: string;
  notices?: any;
}

const priorityColors = {
  low: { bg: "rgba(34, 197, 94, 0.1)", border: "#22c55e", text: "#22c55e" },
  medium: { bg: "rgba(59, 130, 246, 0.1)", border: "#3b82f6", text: "#3b82f6" },
  high: { bg: "rgba(245, 158, 11, 0.1)", border: "#f59e0b", text: "#f59e0b" },
  critical: { bg: "rgba(239, 68, 68, 0.1)", border: "#ef4444", text: "#ef4444" }
};

export default function CalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [view, setView] = useState<"month" | "week" | "day">("month");
  const [loading, setLoading] = useState(true);
  
  // Add Event Form State
  const [newEvent, setNewEvent] = useState({
    title: "",
    description: "",
    deadline_date: "",
    priority: "medium" as "low" | "medium" | "high" | "critical"
  });

  useEffect(() => {
    fetchEvents();
  }, [currentDate]);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).toISOString();
      const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).toISOString();
      
      const response = await fetch(`http://localhost:8000/calendar/events?start_date=${startOfMonth}&end_date=${endOfMonth}`);
      const data = await response.json();
      
      if (data.success) {
        setEvents(data.events || []);
      }
    } catch (error) {
      console.error("Failed to fetch events:", error);
    } finally {
      setLoading(false);
    }
  };

  const getDaysInMonth = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];
    
    // Previous month days
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    
    // Current month days
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(new Date(year, month, i));
    }
    
    return days;
  };

  const getEventsForDate = (date: Date | null) => {
    if (!date) return [];
    const dateStr = date.toISOString().split('T')[0];
    return events.filter(event => event.deadline_date.startsWith(dateStr));
  };

  const previousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));
  };

  const isToday = (date: Date | null) => {
    if (!date) return false;
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };
  
  const handleAddEvent = async () => {
    if (!newEvent.title || !newEvent.deadline_date) {
      toast.error("Please fill in title and deadline");
      return;
    }
    
    try {
      const response = await fetch("http://localhost:8000/calendar/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...newEvent,
          source: "manual"
        })
      });
      
      const data = await response.json();
      
      if (data.success) {
        toast.success("Event added successfully!");
        setShowAddModal(false);
        setNewEvent({ title: "", description: "", deadline_date: "", priority: "medium" });
        fetchEvents();
      } else {
        toast.error("Failed to add event");
      }
    } catch (error) {
      console.error("Error adding event:", error);
      toast.error("Failed to add event");
    }
  };

  const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  return (
    <div style={{ maxWidth: 1400, margin: "0 auto", padding: "0 20px" }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 32 }}>
        <div>
          <h1 style={{ fontSize: 28, fontWeight: 800, color: "#f1f0ff", fontFamily: "'Outfit',sans-serif", marginBottom: 6 }}>
            📅 Interactive Calendar
          </h1>
          <p style={{ fontSize: 14, color: "#5c5c7a" }}>Track all your deadlines and important dates</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            padding: "12px 24px",
            borderRadius: 12,
            background: "linear-gradient(135deg, #d4a574 0%, #c89960 100%)",
            border: "none",
            color: "#1a1a2e",
            fontSize: 14,
            fontWeight: 700,
            cursor: "pointer",
            boxShadow: "0 4px 20px rgba(212, 165, 116, 0.3)"
          }}
        >
          <Plus className="w-4 h-4" /> Add Event
        </button>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 380px", gap: 24 }}>
        {/* Calendar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          style={{
            background: "var(--bg-card)",
            border: "1px solid var(--border)",
            borderRadius: 20,
            padding: 24,
            backdropFilter: "blur(20px)"
          }}
        >
          {/* Calendar Header */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
            <h2 style={{ fontSize: 22, fontWeight: 700, color: "#f1f0ff" }}>
              {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
            </h2>
            <div style={{ display: "flex", gap: 8 }}>
              <button
                onClick={previousMonth}
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 10,
                  background: "rgba(255,255,255,0.05)",
                  border: "1px solid var(--border)",
                  color: "#9d9db5",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center"
                }}
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                onClick={nextMonth}
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 10,
                  background: "rgba(255,255,255,0.05)",
                  border: "1px solid var(--border)",
                  color: "#9d9db5",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center"
                }}
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Day Names */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 8, marginBottom: 8 }}>
            {dayNames.map(day => (
              <div key={day} style={{ textAlign: "center", fontSize: 12, fontWeight: 600, color: "#5c5c7a", padding: "8px 0" }}>
                {day}
              </div>
            ))}
          </div>

          {/* Calendar Grid */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 8 }}>
            {getDaysInMonth().map((date, index) => {
              const dayEvents = getEventsForDate(date);
              const isSelected = selectedDate && date && selectedDate.toDateString() === date.toDateString();
              
              return (
                <motion.div
                  key={index}
                  whileHover={date ? { scale: 1.05 } : {}}
                  onClick={() => date && setSelectedDate(date)}
                  style={{
                    minHeight: 100,
                    padding: 8,
                    borderRadius: 12,
                    background: date ? (isToday(date) ? "rgba(212, 165, 116, 0.1)" : isSelected ? "rgba(124, 58, 237, 0.1)" : "rgba(255,255,255,0.02)") : "transparent",
                    border: date ? (isToday(date) ? "2px solid #d4a574" : isSelected ? "2px solid #7c3aed" : "1px solid rgba(255,255,255,0.05)") : "none",
                    cursor: date ? "pointer" : "default",
                    position: "relative",
                    transition: "all 0.2s"
                  }}
                >
                  {date && (
                    <>
                      <div style={{ fontSize: 14, fontWeight: 600, color: isToday(date) ? "#d4a574" : "#f1f0ff", marginBottom: 4 }}>
                        {date.getDate()}
                      </div>
                      <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                        {dayEvents.slice(0, 2).map(event => (
                          <div
                            key={event.id}
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedEvent(event);
                            }}
                            style={{
                              fontSize: 10,
                              padding: "3px 6px",
                              borderRadius: 4,
                              background: priorityColors[event.priority].bg,
                              border: `1px solid ${priorityColors[event.priority].border}`,
                              color: priorityColors[event.priority].text,
                              whiteSpace: "nowrap",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              cursor: "pointer"
                            }}
                          >
                            {event.title}
                          </div>
                        ))}
                        {dayEvents.length > 2 && (
                          <div style={{ fontSize: 9, color: "#5c5c7a", textAlign: "center" }}>
                            +{dayEvents.length - 2} more
                          </div>
                        )}
                      </div>
                    </>
                  )}
                </motion.div>
              );
            })}
          </div>
        </motion.div>

        {/* Sidebar */}
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          {/* Today's Deadlines */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            style={{
              background: "var(--bg-card)",
              border: "1px solid var(--border)",
              borderRadius: 16,
              padding: 20,
              backdropFilter: "blur(20px)"
            }}
          >
            <h3 style={{ fontSize: 16, fontWeight: 700, color: "#f1f0ff", marginBottom: 16, display: "flex", alignItems: "center", gap: 8 }}>
              <Clock className="w-4 h-4" style={{ color: "#d4a574" }} />
              Today's Deadlines
            </h3>
            {getEventsForDate(new Date()).length === 0 ? (
              <p style={{ fontSize: 13, color: "#5c5c7a", textAlign: "center", padding: "20px 0" }}>
                No deadlines today 🎉
              </p>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {getEventsForDate(new Date()).map(event => (
                  <div
                    key={event.id}
                    onClick={() => setSelectedEvent(event)}
                    style={{
                      padding: 12,
                      borderRadius: 10,
                      background: priorityColors[event.priority].bg,
                      border: `1px solid ${priorityColors[event.priority].border}`,
                      cursor: "pointer"
                    }}
                  >
                    <div style={{ fontSize: 13, fontWeight: 600, color: "#f1f0ff", marginBottom: 4 }}>
                      {event.title}
                    </div>
                    <div style={{ fontSize: 11, color: "#5c5c7a" }}>
                      {event.source}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </motion.div>

          {/* Upcoming Events */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            style={{
              background: "var(--bg-card)",
              border: "1px solid var(--border)",
              borderRadius: 16,
              padding: 20,
              backdropFilter: "blur(20px)",
              maxHeight: 400,
              overflowY: "auto"
            }}
          >
            <h3 style={{ fontSize: 16, fontWeight: 700, color: "#f1f0ff", marginBottom: 16, display: "flex", alignItems: "center", gap: 8 }}>
              <Bell className="w-4 h-4" style={{ color: "#d4a574" }} />
              Upcoming Events
            </h3>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {events.slice(0, 10).map(event => (
                <div
                  key={event.id}
                  onClick={() => setSelectedEvent(event)}
                  style={{
                    padding: 12,
                    borderRadius: 10,
                    background: "rgba(255,255,255,0.02)",
                    border: "1px solid var(--border)",
                    cursor: "pointer",
                    transition: "all 0.2s"
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = "rgba(255,255,255,0.05)";
                    e.currentTarget.style.borderColor = priorityColors[event.priority].border;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = "rgba(255,255,255,0.02)";
                    e.currentTarget.style.borderColor = "var(--border)";
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
                    <div
                      style={{
                        width: 8,
                        height: 8,
                        borderRadius: "50%",
                        background: priorityColors[event.priority].border
                      }}
                    />
                    <div style={{ fontSize: 13, fontWeight: 600, color: "#f1f0ff", flex: 1 }}>
                      {event.title}
                    </div>
                  </div>
                  <div style={{ fontSize: 11, color: "#5c5c7a", marginLeft: 14 }}>
                    {new Date(event.deadline_date).toLocaleDateString()}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>

      {/* Event Detail Modal */}
      <AnimatePresence>
        {selectedEvent && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedEvent(null)}
            style={{
              position: "fixed",
              inset: 0,
              background: "rgba(0,0,0,0.7)",
              backdropFilter: "blur(8px)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 1000,
              padding: 20
            }}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              style={{
                background: "var(--bg-card)",
                border: "1px solid var(--border)",
                borderRadius: 20,
                padding: 32,
                maxWidth: 500,
                width: "100%",
                backdropFilter: "blur(20px)"
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 11, fontWeight: 600, color: priorityColors[selectedEvent.priority].text, marginBottom: 8, textTransform: "uppercase" }}>
                    {selectedEvent.priority} Priority
                  </div>
                  <h2 style={{ fontSize: 22, fontWeight: 700, color: "#f1f0ff", marginBottom: 8 }}>
                    {selectedEvent.title}
                  </h2>
                  <div style={{ fontSize: 13, color: "#5c5c7a" }}>
                    {new Date(selectedEvent.deadline_date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                  </div>
                </div>
                <button
                  onClick={() => setSelectedEvent(null)}
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: 8,
                    background: "rgba(255,255,255,0.05)",
                    border: "1px solid var(--border)",
                    color: "#9d9db5",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center"
                  }}
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {selectedEvent.description && (
                <div style={{ marginBottom: 20, padding: 16, borderRadius: 12, background: "rgba(255,255,255,0.02)", border: "1px solid var(--border)" }}>
                  <p style={{ fontSize: 14, color: "#9d9db5", lineHeight: 1.6 }}>
                    {selectedEvent.description}
                  </p>
                </div>
              )}

              <div style={{ display: "flex", gap: 12, marginBottom: 20 }}>
                <div style={{ flex: 1, padding: 12, borderRadius: 10, background: "rgba(255,255,255,0.02)", border: "1px solid var(--border)" }}>
                  <div style={{ fontSize: 11, color: "#5c5c7a", marginBottom: 4 }}>Source</div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: "#f1f0ff", textTransform: "capitalize" }}>
                    {selectedEvent.source}
                  </div>
                </div>
                <div style={{ flex: 1, padding: 12, borderRadius: 10, background: "rgba(255,255,255,0.02)", border: "1px solid var(--border)" }}>
                  <div style={{ fontSize: 11, color: "#5c5c7a", marginBottom: 4 }}>Days Left</div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: "#f1f0ff" }}>
                    {Math.ceil((new Date(selectedEvent.deadline_date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))} days
                  </div>
                </div>
              </div>

              <div style={{ display: "flex", gap: 12 }}>
                <button
                  onClick={() => {
                    toast.success("Reminder set!");
                    setSelectedEvent(null);
                  }}
                  style={{
                    flex: 1,
                    padding: "12px 20px",
                    borderRadius: 10,
                    background: "rgba(212, 165, 116, 0.1)",
                    border: "1px solid rgba(212, 165, 116, 0.3)",
                    color: "#d4a574",
                    fontSize: 14,
                    fontWeight: 600,
                    cursor: "pointer"
                  }}
                >
                  <Bell className="w-4 h-4" style={{ display: "inline", marginRight: 6 }} />
                  Set Reminder
                </button>
                {selectedEvent.notice_id && (
                  <button
                    onClick={() => {
                      window.location.href = `/dashboard/notices/${selectedEvent.notice_id}`;
                    }}
                    style={{
                      flex: 1,
                      padding: "12px 20px",
                      borderRadius: 10,
                      background: "linear-gradient(135deg, #d4a574 0%, #c89960 100%)",
                      border: "none",
                      color: "#1a1a2e",
                      fontSize: 14,
                      fontWeight: 600,
                      cursor: "pointer"
                    }}
                  >
                    View Notice
                  </button>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Add Event Modal */}
      <AnimatePresence>
        {showAddModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowAddModal(false)}
            style={{
              position: "fixed",
              inset: 0,
              background: "rgba(0,0,0,0.7)",
              backdropFilter: "blur(8px)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 1000,
              padding: 20
            }}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              style={{
                background: "var(--bg-card)",
                border: "1px solid var(--border)",
                borderRadius: 20,
                padding: 32,
                maxWidth: 500,
                width: "100%",
                backdropFilter: "blur(20px)"
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
                <h2 style={{ fontSize: 22, fontWeight: 700, color: "#f1f0ff" }}>Add New Event</h2>
                <button
                  onClick={() => setShowAddModal(false)}
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: 8,
                    background: "rgba(255,255,255,0.05)",
                    border: "1px solid var(--border)",
                    color: "#9d9db5",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center"
                  }}
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                <div>
                  <label style={{ fontSize: 13, color: "#9d9db5", marginBottom: 8, display: "block" }}>Title *</label>
                  <input
                    type="text"
                    value={newEvent.title}
                    onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                    placeholder="Event title"
                    style={{
                      width: "100%",
                      padding: "12px 16px",
                      borderRadius: 10,
                      background: "rgba(255,255,255,0.03)",
                      border: "1px solid var(--border)",
                      color: "#f1f0ff",
                      fontSize: 14,
                      outline: "none"
                    }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: 13, color: "#9d9db5", marginBottom: 8, display: "block" }}>Description</label>
                  <textarea
                    value={newEvent.description}
                    onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
                    placeholder="Event description"
                    rows={3}
                    style={{
                      width: "100%",
                      padding: "12px 16px",
                      borderRadius: 10,
                      background: "rgba(255,255,255,0.03)",
                      border: "1px solid var(--border)",
                      color: "#f1f0ff",
                      fontSize: 14,
                      outline: "none",
                      resize: "vertical"
                    }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: 13, color: "#9d9db5", marginBottom: 8, display: "block" }}>Deadline Date *</label>
                  <input
                    type="datetime-local"
                    value={newEvent.deadline_date}
                    onChange={(e) => setNewEvent({ ...newEvent, deadline_date: e.target.value })}
                    style={{
                      width: "100%",
                      padding: "12px 16px",
                      borderRadius: 10,
                      background: "rgba(255,255,255,0.03)",
                      border: "1px solid var(--border)",
                      color: "#f1f0ff",
                      fontSize: 14,
                      outline: "none"
                    }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: 13, color: "#9d9db5", marginBottom: 8, display: "block" }}>Priority</label>
                  <select
                    value={newEvent.priority}
                    onChange={(e) => setNewEvent({ ...newEvent, priority: e.target.value as any })}
                    style={{
                      width: "100%",
                      padding: "12px 16px",
                      borderRadius: 10,
                      background: "rgba(255,255,255,0.03)",
                      border: "1px solid var(--border)",
                      color: "#f1f0ff",
                      fontSize: 14,
                      outline: "none",
                      cursor: "pointer"
                    }}
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="critical">Critical</option>
                  </select>
                </div>

                <div style={{ display: "flex", gap: 12, marginTop: 8 }}>
                  <button
                    onClick={() => setShowAddModal(false)}
                    style={{
                      flex: 1,
                      padding: "12px 20px",
                      borderRadius: 10,
                      background: "rgba(255,255,255,0.05)",
                      border: "1px solid var(--border)",
                      color: "#9d9db5",
                      fontSize: 14,
                      fontWeight: 600,
                      cursor: "pointer"
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleAddEvent}
                    style={{
                      flex: 1,
                      padding: "12px 20px",
                      borderRadius: 10,
                      background: "linear-gradient(135deg, #d4a574 0%, #c89960 100%)",
                      border: "none",
                      color: "#1a1a2e",
                      fontSize: 14,
                      fontWeight: 600,
                      cursor: "pointer"
                    }}
                  >
                    Add Event
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
