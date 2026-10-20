import { NextResponse } from "next/server";

export async function GET() {
  try {
    const response = await fetch("http://localhost:8000/scraper/status", {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });

    if (!response.ok) {
      return NextResponse.json({
        success: false,
        status: "idle",
        logs: [],
        recentNotices: []
      });
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error fetching scraper status:", error);
    return NextResponse.json({
      success: false,
      status: "idle",
      logs: [],
      recentNotices: []
    });
  }
}
