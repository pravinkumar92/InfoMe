-- Enable Row Level Security on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE sources ENABLE ROW LEVEL SECURITY;
ALTER TABLE notices ENABLE ROW LEVEL SECURITY;
ALTER TABLE deadlines ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_saved_notices ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_followed_sources ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE scraper_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- User preferences policies
CREATE POLICY "Users can view own preferences"
  ON user_preferences FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own preferences"
  ON user_preferences FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own preferences"
  ON user_preferences FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Sources policies (public read, admin write)
CREATE POLICY "Anyone can view active sources"
  ON sources FOR SELECT
  USING (is_active = TRUE);

-- Notices policies (public read)
CREATE POLICY "Anyone can view notices"
  ON notices FOR SELECT
  USING (TRUE);

-- Deadlines policies (public read)
CREATE POLICY "Anyone can view deadlines"
  ON deadlines FOR SELECT
  USING (TRUE);

-- User saved notices policies
CREATE POLICY "Users can view own saved notices"
  ON user_saved_notices FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own saved notices"
  ON user_saved_notices FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own saved notices"
  ON user_saved_notices FOR DELETE
  USING (auth.uid() = user_id);

-- User followed sources policies
CREATE POLICY "Users can view own followed sources"
  ON user_followed_sources FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own followed sources"
  ON user_followed_sources FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own followed sources"
  ON user_followed_sources FOR DELETE
  USING (auth.uid() = user_id);

-- Notifications policies
CREATE POLICY "Users can view own notifications"
  ON notifications FOR SELECT
  USING (auth.uid() = user_id);

-- Scraper logs policies (public read for transparency)
CREATE POLICY "Anyone can view scraper logs"
  ON scraper_logs FOR SELECT
  USING (TRUE);

-- Analytics policies (users can view own analytics)
CREATE POLICY "Users can view own analytics"
  ON analytics FOR SELECT
  USING (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Anyone can insert analytics"
  ON analytics FOR INSERT
  WITH CHECK (TRUE);
