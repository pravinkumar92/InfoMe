"""Central alert management system"""
import asyncio
import os
from typing import Dict, List
from datetime import datetime, timedelta
from alerts.telegram_bot import TelegramBot
from alerts.email_sender import EmailSender
from alerts.whatsapp_sender import WhatsAppSender
from core.database import Database
from dotenv import load_dotenv

load_dotenv()

class AlertManager:
    def __init__(self, db: Database):
        self.db = db
        self.telegram = TelegramBot()
        self.email = EmailSender()
        self.whatsapp = WhatsAppSender()
        # Get default chat ID from environment for demo
        self.default_chat_id = os.getenv("TELEGRAM_CHAT_ID")
    
    async def send_notice_alerts(self, notice: Dict):
        """Send alerts for a new notice to all relevant users"""
        print(f"  📤 Sending alerts for: {notice['title'][:50]}...")
        
        # Get WhatsApp number from environment
        whatsapp_to = os.getenv("TWILIO_WHATSAPP_TO")
        
        # Send to Telegram
        if self.default_chat_id:
            try:
                success = await self.telegram.send_notice_alert(self.default_chat_id, notice)
                if success:
                    print(f"  ✅ Telegram alert sent to Chat ID: {self.default_chat_id}")
                else:
                    print(f"  ❌ Failed to send Telegram alert")
            except Exception as e:
                print(f"  ❌ Telegram alert error: {str(e)}")
        else:
            print(f"  ⚠️  No TELEGRAM_CHAT_ID configured in .env")
        
        # Send to WhatsApp
        if whatsapp_to:
            try:
                success = await self.whatsapp.send_notice_alert(whatsapp_to, notice)
                if success:
                    print(f"  ✅ WhatsApp alert sent to: {whatsapp_to}")
                else:
                    print(f"  ❌ Failed to send WhatsApp alert")
            except Exception as e:
                print(f"  ❌ WhatsApp alert error: {str(e)}")
        else:
            print(f"  ⚠️  No TWILIO_WHATSAPP_TO configured in .env")
        
        # Get users who should be notified (for production)
        users = self.db.get_users_for_notice(notice)
        
        if not users:
            return
        
        print(f"  📤 Sending alerts to {len(users)} registered users...")
        
        # Send alerts concurrently
        tasks = []
        for user in users:
            channels = user.get('notification_channels', [])
            
            for channel in channels:
                task = self._send_alert(user['user_id'], notice, channel)
                tasks.append(task)
        
        if tasks:
            # Execute all alerts
            results = await asyncio.gather(*tasks, return_exceptions=True)
            
            # Count successes
            success_count = sum(1 for r in results if r is True)
            print(f"  ✅ Sent {success_count}/{len(tasks)} alerts successfully")
    
    async def _send_alert(self, user_id: str, notice: Dict, channel: str) -> bool:
        """Send a single alert"""
        # Create notification record
        self.db.create_notification(
            user_id=user_id,
            notice_id=notice['id'],
            channel=channel,
            status='pending'
        )
        
        # Get user contact info (you'll need to add this to user_preferences table)
        # For now, using placeholder
        
        try:
            success = False
            
            if channel == 'telegram':
                # Get user's telegram chat_id from database
                # telegram_chat_id = self.db.get_user_telegram_id(user_id)
                # success = await self.telegram.send_notice_alert(telegram_chat_id, notice)
                pass  # Implement when you have telegram_chat_id in database
            
            elif channel == 'email':
                # Get user's email from auth.users
                # email = self.db.get_user_email(user_id)
                # success = await self.email.send_notice_alert(email, notice)
                pass  # Implement when you have email lookup
            
            elif channel == 'whatsapp':
                # Get user's phone from profiles
                # phone = self.db.get_user_phone(user_id)
                # success = await self.whatsapp.send_notice_alert(phone, notice)
                pass  # Implement when you have phone lookup
            
            elif channel == 'push':
                # Implement push notifications (Firebase, OneSignal, etc.)
                pass
            
            # Update notification status
            # self.db.update_notification_status(notification_id, 'sent' if success else 'failed')
            
            return success
        
        except Exception as e:
            print(f"  ❌ Alert failed ({channel}): {str(e)}")
            return False
    
    async def send_deadline_reminders(self):
        """Send reminders for upcoming deadlines"""
        print("\n⏰ Checking for deadline reminders...")
        
        # Get deadlines in next 7 days that haven't been reminded
        deadlines = self.db.client.table("deadlines").select(
            "*, notices(*)"
        ).gte(
            "deadline", datetime.now().isoformat()
        ).lte(
            "deadline", (datetime.now() + timedelta(days=7)).isoformat()
        ).eq(
            "reminder_sent", False
        ).execute()
        
        if not deadlines.data:
            print("  ✅ No reminders to send")
            return
        
        print(f"  📋 Found {len(deadlines.data)} deadlines to remind")
        
        for deadline in deadlines.data:
            notice = deadline['notices']
            deadline_date = datetime.fromisoformat(deadline['deadline'].replace('Z', '+00:00'))
            days_left = (deadline_date - datetime.now()).days
            
            # Send reminders at: 7d, 3d, 1d, 6h, 1h before
            if days_left in [7, 3, 1] or days_left == 0:
                await self._send_deadline_reminder(notice, days_left)
                
                # Mark as reminded
                self.db.client.table("deadlines").update({
                    "reminder_sent": True
                }).eq("id", deadline['id']).execute()
    
    async def _send_deadline_reminder(self, notice: Dict, days_left: int):
        """Send deadline reminder to all users"""
        users = self.db.get_users_for_notice(notice)
        
        tasks = []
        for user in users:
            channels = user.get('notification_channels', [])
            
            for channel in channels:
                if channel == 'telegram':
                    # task = self.telegram.send_deadline_reminder(chat_id, notice, days_left)
                    pass
                elif channel == 'email':
                    # task = self.email.send_deadline_reminder(email, notice, days_left)
                    pass
                elif channel == 'whatsapp':
                    # task = self.whatsapp.send_deadline_reminder(phone, notice, days_left)
                    pass
        
        if tasks:
            await asyncio.gather(*tasks, return_exceptions=True)
    
    async def send_daily_digest(self):
        """Send daily digest of new notices"""
        print("\n📬 Sending daily digests...")
        
        # Get notices from last 24 hours
        yesterday = (datetime.now() - timedelta(days=1)).isoformat()
        
        notices = self.db.client.table("notices").select("*").gte(
            "created_at", yesterday
        ).execute()
        
        if not notices.data:
            print("  ✅ No new notices for digest")
            return
        
        print(f"  📋 {len(notices.data)} notices in digest")
        
        # Get all users who want email digests
        # (Add a 'digest_frequency' field to user_preferences: 'daily', 'weekly', 'none')
        users = self.db.client.table("user_preferences").select(
            "user_id"
        ).contains(
            "notification_channels", ["email"]
        ).execute()
        
        tasks = []
        for user in users.data:
            # Get user email
            # email = self.db.get_user_email(user['user_id'])
            # task = self.email.send_digest(email, notices.data)
            # tasks.append(task)
            pass
        
        if tasks:
            results = await asyncio.gather(*tasks, return_exceptions=True)
            success_count = sum(1 for r in results if r is True)
            print(f"  ✅ Sent {success_count}/{len(tasks)} digests")


# Standalone functions for testing
async def test_telegram_alert():
    """Test Telegram alert"""
    bot = TelegramBot()
    
    test_notice = {
        "title": "AKTU B.Tech Exam Schedule 2026",
        "category": "Exams",
        "department": "AKTU Lucknow",
        "summary": "Even semester exams starting April 20. Download admit cards now.",
        "urgency": "high",
        "last_date": "2026-04-20",
        "external_url": "https://aktu.ac.in"
    }
    
    # Replace with your chat_id (get it from @userinfobot on Telegram)
    chat_id = "YOUR_CHAT_ID"
    
    success = await bot.send_notice_alert(chat_id, test_notice)
    print(f"Telegram test: {'✅ Success' if success else '❌ Failed'}")

async def test_email_alert():
    """Test email alert"""
    sender = EmailSender()
    
    test_notice = {
        "title": "PM Scholarship Scheme 2026",
        "category": "Scholarships",
        "department": "Ministry of Home Affairs",
        "summary": "₹36,000/year for boys, ₹30,000/year for girls. Apply before April 30.",
        "urgency": "high",
        "last_date": "2026-04-30",
        "amount": "₹36,000/year",
        "external_url": "https://scholarships.gov.in"
    }
    
    # Replace with your email
    to_email = "your@email.com"
    
    success = await sender.send_notice_alert(to_email, test_notice)
    print(f"Email test: {'✅ Success' if success else '❌ Failed'}")

if __name__ == "__main__":
    # Test alerts
    print("Testing alert system...\n")
    
    # asyncio.run(test_telegram_alert())
    # asyncio.run(test_email_alert())
    
    print("\nUncomment the test functions and add your credentials to test")
