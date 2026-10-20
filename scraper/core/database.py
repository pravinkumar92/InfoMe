"""Database operations using Supabase"""
from supabase import create_client, Client
from typing import Dict, List, Optional, Any
import hashlib
from datetime import datetime
import os
from dotenv import load_dotenv

load_dotenv()
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")

class Database:
    def __init__(self):
        self.client: Client = create_client(SUPABASE_URL, SUPABASE_KEY)
    
    # ============ SOURCES ============
    def get_active_sources(self) -> List[Dict]:
        """Get all active sources to scrape"""
        response = self.client.table("sources").select("*").eq("is_active", True).execute()
        return response.data
    
    def update_source_last_checked(self, source_id: str):
        """Update last_checked timestamp for a source"""
        self.client.table("sources").update({
            "last_checked": datetime.utcnow().isoformat()
        }).eq("id", source_id).execute()
    
    def increment_source_notice_count(self, source_id: str, count: int = 1):
        """Increment notice count for a source"""
        # Get current count
        response = self.client.table("sources").select("notice_count").eq("id", source_id).single().execute()
        current_count = response.data.get("notice_count", 0)
        
        # Update
        self.client.table("sources").update({
            "notice_count": current_count + count
        }).eq("id", source_id).execute()
    
    # ============ NOTICES ============
    def notice_exists(self, hash_value: str) -> bool:
        """Check if notice already exists by hash"""
        response = self.client.table("notices").select("id").eq("hash", hash_value).execute()
        return len(response.data) > 0
    
    def create_notice(self, notice_data: Dict) -> Optional[Dict]:
        """Create a new notice"""
        # Generate hash if not provided
        if "hash" not in notice_data:
            notice_data["hash"] = self._generate_hash(notice_data["title"], notice_data.get("description", ""))
        
        # Check if exists
        if self.notice_exists(notice_data["hash"]):
            print(f"Notice already exists: {notice_data['title']}")
            return None
        
        response = self.client.table("notices").insert(notice_data).execute()
        return response.data[0] if response.data else None
    
    def get_notice_by_id(self, notice_id: str) -> Optional[Dict]:
        """Get notice by ID"""
        response = self.client.table("notices").select("*").eq("id", notice_id).single().execute()
        return response.data
    
    # ============ DEADLINES ============
    def create_deadline(self, notice_id: str, deadline: str, urgency_score: int = 50):
        """Create a deadline for a notice"""
        self.client.table("deadlines").insert({
            "notice_id": notice_id,
            "deadline": deadline,
            "urgency_score": urgency_score
        }).execute()
    
    # ============ SCRAPER LOGS ============
    def log_scraper_run(
        self,
        source_id: str,
        status: str,
        message: str,
        notices_found: int = 0,
        notices_new: int = 0,
        duration_ms: Optional[int] = None,
        error_details: Optional[Dict] = None
    ):
        """Log a scraper execution"""
        self.client.table("scraper_logs").insert({
            "source_id": source_id,
            "status": status,
            "message": message,
            "notices_found": notices_found,
            "notices_new": notices_new,
            "duration_ms": duration_ms,
            "error_details": error_details
        }).execute()
    
    # ============ NOTIFICATIONS ============
    def create_notification(
        self,
        user_id: str,
        notice_id: str,
        channel: str,
        status: str = "pending",
        metadata: Optional[Dict] = None
    ):
        """Create a notification record"""
        self.client.table("notifications").insert({
            "user_id": user_id,
            "notice_id": notice_id,
            "channel": channel,
            "status": status,
            "metadata": metadata or {}
        }).execute()
    
    def update_notification_status(
        self,
        notification_id: str,
        status: str,
        error_message: Optional[str] = None
    ):
        """Update notification status"""
        update_data = {
            "status": status,
            "sent_at": datetime.utcnow().isoformat() if status == "sent" else None
        }
        if error_message:
            update_data["error_message"] = error_message
        
        self.client.table("notifications").update(update_data).eq("id", notification_id).execute()
    
    def get_users_for_notice(self, notice: Dict) -> List[Dict]:
        """Get users who should be notified about this notice"""
        # Get users with matching interests and location
        category = notice.get("category", "").lower()
        
        # Simple query - get all users with onboarding complete
        # In production, filter by interests, location, etc.
        response = self.client.table("user_preferences").select(
            "user_id, notification_channels"
        ).eq("onboarding_complete", True).execute()
        
        return response.data
    
    # ============ ANALYTICS ============
    def track_event(
        self,
        event_type: str,
        user_id: Optional[str] = None,
        notice_id: Optional[str] = None,
        metadata: Optional[Dict] = None
    ):
        """Track an analytics event"""
        self.client.table("analytics").insert({
            "event_type": event_type,
            "user_id": user_id,
            "notice_id": notice_id,
            "metadata": metadata or {}
        }).execute()
    
    # ============ HELPERS ============
    @staticmethod
    def _generate_hash(title: str, description: str) -> str:
        """Generate a hash for duplicate detection"""
        content = f"{title}{description}".lower().strip()
        return hashlib.sha256(content.encode()).hexdigest()[:32]
