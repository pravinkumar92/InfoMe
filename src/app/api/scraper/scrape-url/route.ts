import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { url } = body;

    if (!url) {
      return NextResponse.json(
        { error: "URL is required" },
        { status: 400 }
      );
    }

    const response = await fetch("http://localhost:8000/scraper/scrape-custom-url", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url })
    });

    if (!response.ok) {
      throw new Error("Backend scraping failed");
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error scraping URL:", error);
    return NextResponse.json(
      { 
        error: "Scraping failed",
        noticesFound: 0,
        notices: []
      },
      { status: 500 }
    );
  }
}
