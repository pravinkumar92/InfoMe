# Supabase Setup Guide

## Prerequisites
- Supabase account (https://supabase.com)
- Supabase CLI installed: `npm install -g supabase`

## Setup Steps

### 1. Initialize Supabase (if not already done)
```bash
supabase init
```

### 2. Link to your Supabase project
```bash
supabase link --project-ref YOUR_PROJECT_REF
```

### 3. Run migrations
```bash
supabase db push
```

Or manually run the SQL files in order:
1. `001_initial_schema.sql` - Creates all tables and indexes
2. `002_rls_policies.sql` - Sets up Row Level Security policies
3. `seed.sql` - Inserts sample data

### 4. Manual Setup (Alternative)

If you prefer to run migrations manually:

1. Go to your Supabase Dashboard: https://app.supabase.com
2. Navigate to SQL Editor
3. Copy and paste each migration file in order
4. Execute them one by one

### 5. Verify Setup

Run this query in SQL Editor to verify:
```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public';
```

You should see:
- profiles
- user_preferences
- sources
- notices
- deadlines
- user_saved_notices
- user_followed_sources
- notifications
- scraper_logs
- analytics

### 6. Enable Realtime (Optional)

For real-time updates on notices:
1. Go to Database → Replication
2. Enable replication for `notices` and `notifications` tables

## Environment Variables

Make sure your `.env.local` has:
```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
```

## Testing

After setup, test the connection:
```bash
npm run dev
```

Navigate to `/dashboard` and you should see sample notices.

## Troubleshooting

### RLS Policies blocking access?
- Make sure you're authenticated
- Check policies in Dashboard → Authentication → Policies

### Migrations failing?
- Ensure UUID extension is enabled
- Check for syntax errors in SQL files
- Run migrations one at a time

### No data showing?
- Run `seed.sql` to insert sample data
- Check RLS policies are correct
- Verify your auth token is valid
