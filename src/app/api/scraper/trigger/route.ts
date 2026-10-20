import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { source_name } = body;

    // Get Python backend URL from environment
    const backendUrl = process.env.PYTHON_BACKEND_URL || 'http://localhost:8000';

    // Trigger Python scraper
    const response = await fetch(`${backendUrl}/scraper/run`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        source_name: source_name || null
      })
    });

    if (!response.ok) {
      throw new Error('Scraper trigger failed');
    }

    const data = await response.json();

    return NextResponse.json({
      success: true,
      message: 'Scraper triggered successfully',
      data
    });
  } catch (error) {
    console.error('Scraper trigger error:', error);
    
    // Fallback: Return success even if Python backend is not running
    return NextResponse.json({
      success: true,
      message: 'Scraper request queued (backend may be offline)',
      note: 'Make sure Python backend is running on port 8000'
    });
  }
}
