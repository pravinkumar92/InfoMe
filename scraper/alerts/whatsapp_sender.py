"""WhatsApp alerts using Twilio"""
import aiohttp
from typing import Dict
import base64
import os
from dotenv import load_dotenv

load_dotenv()
TWILIO_ACCOUNT_SID = os.getenv("TWILIO_ACCOUNT_SID")
TWILIO_AUTH_TOKEN = os.getenv("TWILIO_AUTH_TOKEN")
TWILIO_WHATSAPP_FROM = os.getenv("TWILIO_WHATSAPP_FROM")

class WhatsAppSender:
    def __init__(self):
        self.account_sid = TWILIO_ACCOUNT_SID
        self.auth_token = TWILIO_AUTH_TOKEN
        self.from_number = TWILIO_WHATSAPP_FROM
        self.base_url = f"https://api.twilio.com/2010-04-01/Accounts/{self.account_sid}/Messages.json"
    
    async def send_message(self, to: str, body: str) -> bool:
        """Send a WhatsApp message"""
        # Ensure 'to' has whatsapp: prefix
        if not to.startswith('whatsapp:'):
            to = f"whatsapp:{to}"
        
        # Basic auth
        auth = base64.b64encode(f"{self.account_sid}:{self.auth_token}".encode()).decode()
        
        headers = {
            "Authorization": f"Basic {auth}",
            "Content-Type": "application/x-www-form-urlencoded"
        }
        
        data = {
            "From": self.from_number,
            "To": to,
            "Body": body
        }
        
        try:
            async with aiohttp.ClientSession() as session:
                async with session.post(self.base_url, data=data, headers=headers) as response:
                    if response.status in [200, 201]:
                        return True
                    else:
                        error = await response.text()
                        print(f"WhatsApp error: {error}")
                        return False
        except Exception as e:
            print(f"Failed to send WhatsApp message: {str(e)}")
            return False
    
    async def send_notice_alert(self, to: str, notice: Dict) -> bool:
        """Send a formatted notice alert"""
        urgency_emoji = {
            "critical": "🔴",
            "high": "🟡",
            "medium": "🔵",
            "low": "🟢"
        }
        
        emoji = urgency_emoji.get(notice.get("urgency", "medium"), "🔵")
        
        message = f"""
{emoji} *{notice['title']}*

📂 Category: {notice.get('category', 'General')}
🏢 Department: {notice.get('department', 'N/A')}
"""
        
        if notice.get('summary'):
            message += f"\n📝 {notice['summary']}\n"
        
        if notice.get('last_date'):
            message += f"\n⏰ Deadline: {notice['last_date']}"
        
        if notice.get('amount'):
            message += f"\n💰 Amount: {notice['amount']}"
        
        if notice.get('external_url'):
            message += f"\n\n🔗 View: {notice['external_url']}"
        
        message += "\n\n📱 InfoMe"
        
        return await self.send_message(to, message.strip())
    
    async def send_deadline_reminder(
        self,
        to: str,
        notice: Dict,
        days_left: int
    ) -> bool:
        """Send a deadline reminder"""
        urgency = "🚨" if days_left <= 1 else "⏰"
        
        message = f"""
{urgency} *Deadline Reminder*

{notice['title']}

⏰ *{days_left} day{'s' if days_left != 1 else ''} left!*

Don't miss this opportunity!
"""
        
        if notice.get('external_url'):
            message += f"\n🔗 Apply: {notice['external_url']}"
        
        return await self.send_message(to, message.strip())


# Note: Twilio WhatsApp requires:
# 1. Approved WhatsApp Business Account
# 2. Pre-approved message templates
# 3. Users must opt-in by messaging your number first
#
# For testing, use Twilio Sandbox:
# https://www.twilio.com/docs/whatsapp/sandbox
