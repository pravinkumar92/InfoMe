import { supabase, type Notice, type Source, type UserPreferences, type Notification, type ScraperLog } from "./supabase"

// ============ NOTICES ============
export async function getNotices(filters?: {
  category?: string
  urgency?: string
  limit?: number
  offset?: number
}) {
  let query = supabase
    .from("notices")
    .select("*, sources(*)")
    .order("created_at", { ascending: false })

  if (filters?.category) {
    query = query.eq("category", filters.category)
  }

  if (filters?.urgency) {
    query = query.eq("urgency", filters.urgency)
  }

  if (filters?.limit) {
    query = query.limit(filters.limit)
  }

  if (filters?.offset) {
    query = query.range(filters.offset, filters.offset + (filters.limit || 10) - 1)
  }

  const { data, error } = await query

  if (error) throw error
  return data
}

export async function getNoticeById(id: string) {
  const { data, error } = await supabase
    .from("notices")
    .select("*, sources(*), deadlines(*)")
    .eq("id", id)
    .single()

  if (error) throw error

  // Increment view count
  await supabase
    .from("notices")
    .update({ views: (data.views || 0) + 1 })
    .eq("id", id)

  return data
}

export async function searchNotices(query: string) {
  const { data, error } = await supabase
    .from("notices")
    .select("*, sources(*)")
    .or(`title.ilike.%${query}%,description.ilike.%${query}%,summary.ilike.%${query}%`)
    .order("created_at", { ascending: false })
    .limit(20)

  if (error) throw error
  return data
}

// ============ SOURCES ============
export async function getSources() {
  const { data, error } = await supabase
    .from("sources")
    .select("*")
    .eq("is_active", true)
    .order("notice_count", { ascending: false })

  if (error) throw error
  return data
}

export async function getSourceById(id: string) {
  const { data, error } = await supabase
    .from("sources")
    .select("*")
    .eq("id", id)
    .single()

  if (error) throw error
  return data
}

// ============ USER PREFERENCES ============
export async function getUserPreferences(userId: string) {
  const { data, error } = await supabase
    .from("user_preferences")
    .select("*")
    .eq("user_id", userId)
    .single()

  if (error && error.code !== "PGRST116") throw error // PGRST116 = no rows
  return data
}

export async function upsertUserPreferences(userId: string, preferences: Partial<UserPreferences>) {
  const { data, error } = await supabase
    .from("user_preferences")
    .upsert({
      user_id: userId,
      ...preferences,
    })
    .select()
    .single()

  if (error) throw error
  return data
}

export async function completeOnboarding(
  userId: string,
  preferences: {
    college?: string
    state?: string
    district?: string
    city?: string
    interests: string[]
    notification_channels: string[]
  }
) {
  return upsertUserPreferences(userId, {
    ...preferences,
    onboarding_complete: true,
  })
}

// ============ SAVED NOTICES ============
export async function getSavedNotices(userId: string) {
  const { data, error } = await supabase
    .from("user_saved_notices")
    .select("*, notices(*, sources(*))")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })

  if (error) throw error
  return data
}

export async function saveNotice(userId: string, noticeId: string) {
  const { data, error } = await supabase
    .from("user_saved_notices")
    .insert({
      user_id: userId,
      notice_id: noticeId,
    })
    .select()
    .single()

  if (error) throw error
  return data
}

export async function unsaveNotice(userId: string, noticeId: string) {
  const { error } = await supabase
    .from("user_saved_notices")
    .delete()
    .eq("user_id", userId)
    .eq("notice_id", noticeId)

  if (error) throw error
}

export async function isNoticeSaved(userId: string, noticeId: string) {
  const { data, error } = await supabase
    .from("user_saved_notices")
    .select("id")
    .eq("user_id", userId)
    .eq("notice_id", noticeId)
    .single()

  if (error && error.code !== "PGRST116") throw error
  return !!data
}

// ============ FOLLOWED SOURCES ============
export async function getFollowedSources(userId: string) {
  const { data, error } = await supabase
    .from("user_followed_sources")
    .select("*, sources(*)")
    .eq("user_id", userId)

  if (error) throw error
  return data
}

export async function followSource(userId: string, sourceId: string) {
  const { data, error } = await supabase
    .from("user_followed_sources")
    .insert({
      user_id: userId,
      source_id: sourceId,
    })
    .select()
    .single()

  if (error) throw error
  return data
}

export async function unfollowSource(userId: string, sourceId: string) {
  const { error } = await supabase
    .from("user_followed_sources")
    .delete()
    .eq("user_id", userId)
    .eq("source_id", sourceId)

  if (error) throw error
}

// ============ DEADLINES ============
export async function getUpcomingDeadlines(limit = 10) {
  const { data, error } = await supabase
    .from("deadlines")
    .select("*, notices(*, sources(*))")
    .gte("deadline", new Date().toISOString())
    .order("deadline", { ascending: true })
    .limit(limit)

  if (error) throw error
  return data
}

// ============ NOTIFICATIONS ============
export async function getUserNotifications(userId: string, limit = 20) {
  const { data, error } = await supabase
    .from("notifications")
    .select("*, notices(*, sources(*))")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(limit)

  if (error) throw error
  return data
}

// ============ ANALYTICS ============
export async function trackEvent(
  eventType: string,
  metadata?: any,
  userId?: string,
  noticeId?: string
) {
  const { error } = await supabase
    .from("analytics")
    .insert({
      event_type: eventType,
      user_id: userId,
      notice_id: noticeId,
      metadata: metadata || {},
    })

  if (error) console.error("Analytics tracking error:", error)
}

// ============ SCRAPER LOGS ============
export async function getScraperLogs(limit = 50) {
  const { data, error } = await supabase
    .from("scraper_logs")
    .select("*, sources(*)")
    .order("created_at", { ascending: false })
    .limit(limit)

  if (error) throw error
  return data
}

// ============ STATS ============
export async function getDashboardStats() {
  const [noticesCount, sourcesCount, alertsCount] = await Promise.all([
    supabase.from("notices").select("id", { count: "exact", head: true }),
    supabase.from("sources").select("id", { count: "exact", head: true }).eq("is_active", true),
    supabase.from("notifications").select("id", { count: "exact", head: true }).eq("status", "sent"),
  ])

  return {
    totalNotices: noticesCount.count || 0,
    totalSources: sourcesCount.count || 0,
    alertsSent: alertsCount.count || 0,
  }
}

export async function getCategoryStats() {
  const { data, error } = await supabase
    .from("notices")
    .select("category")

  if (error) throw error

  const stats: Record<string, number> = {}
  data.forEach((notice) => {
    stats[notice.category] = (stats[notice.category] || 0) + 1
  })

  return Object.entries(stats).map(([name, value]) => ({ name, value }))
}
