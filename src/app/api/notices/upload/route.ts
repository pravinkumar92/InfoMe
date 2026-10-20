import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      title,
      description,
      category,
      department,
      urgency,
      last_date,
      amount,
      external_url,
      pdf_url,
      source_id,
      user_id
    } = body;

    // Validate required fields
    if (!title || !category) {
      return NextResponse.json(
        { error: 'Title and category are required' },
        { status: 400 }
      );
    }

    // Create notice
    const { data: notice, error } = await supabase
      .from('notices')
      .insert({
        title,
        description,
        category,
        department,
        urgency: urgency || 'medium',
        last_date,
        amount,
        external_url,
        pdf_url,
        source_id,
        views: 0,
        created_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating notice:', error);
      return NextResponse.json(
        { error: 'Failed to create notice' },
        { status: 500 }
      );
    }

    // Create deadline if last_date provided
    if (last_date && notice) {
      await supabase.from('deadlines').insert({
        notice_id: notice.id,
        deadline: last_date,
        urgency_score: urgency === 'critical' ? 90 : urgency === 'high' ? 70 : 50,
        reminder_sent: false
      });
    }

    // Track analytics
    if (user_id) {
      await supabase.from('analytics').insert({
        event_type: 'notice_uploaded',
        user_id,
        notice_id: notice.id,
        metadata: { category, urgency }
      });
    }

    return NextResponse.json({
      success: true,
      notice
    });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
