import { NextResponse } from "next/server";

export async function GET() {
  try {
    // Fetch recent alerts from backend
    const response = await fetch("http://localhost:8000/alerts/recent", {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });

    if (!response.ok) {
      throw new Error("Failed to fetch notifications");
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error fetching notifications:", error);
    // Return mock data as fallback
    return NextResponse.json({
      notifications: [
        {
          id: "1",
          title: "Urgent Deadline Tomorrow",
          message: "UPSC Civil Services Exam registration closes tomorrow at 11:59 PM",
          type: "deadline",
          timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
          read: false,
          link: "/dashboard/deadlines"
        },
        {
          id: "2",
          title: "New Scholarship Notice",
          message: "National Merit Scholarship 2024 applications now open",
          type: "new_notice",
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
          read: false,
          link: "/dashboard/notices"
        }
      ]
    });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { action, notificationId } = body;

    if (action === "mark_read") {
      // Mark notification as read in backend
      const response = await fetch(`http://localhost:8000/alerts/${notificationId}/read`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });

      if (!response.ok) {
        throw new Error("Failed to mark notification as read");
      }

      return NextResponse.json({ success: true });
    }

    if (action === "mark_all_read") {
      // Mark all notifications as read
      const response = await fetch("http://localhost:8000/alerts/mark-all-read", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });

      if (!response.ok) {
        throw new Error("Failed to mark all notifications as read");
      }

      return NextResponse.json({ success: true });
    }

    if (action === "delete") {
      // Delete notification
      const response = await fetch(`http://localhost:8000/alerts/${notificationId}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
      });

      if (!response.ok) {
        throw new Error("Failed to delete notification");
      }

      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error) {
    console.error("Error processing notification action:", error);
    return NextResponse.json(
      { error: "Failed to process notification action" },
      { status: 500 }
    );
  }
}
