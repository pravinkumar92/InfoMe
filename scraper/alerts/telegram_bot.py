"""Telegram bot for sending alerts"""
import aiohttp
from typing import Dict, Optional
import os
from dotenv import load_dotenv

load_dotenv()
TELEGRAM_BOT_TOKEN = os.getenv("TELEGRAM_BOT_TOKEN")

class TelegramBot:
    def __init__(self):
        self.token = TELEGRAM_BOT_TOKEN
        self.base_url = f"https://api.telegram.org/bot{self.token}"
    
    async def send_message(
        self,
        chat_id: str,
        text: str,
        parse_mode: str = "HTML",
        disable_web_page_preview: bool = False
    ) -> bool:
        """Send a message to a Telegram chat"""
        # Validate chat_id
        if not chat_id or chat_id == "your_chat_id":
            print("⚠️  Invalid or placeholder TELEGRAM_CHAT_ID. Please configure a valid chat ID.")
            return False
        
        url = f"{self.base_url}/sendMessage"
        
        payload = {
            "chat_id": chat_id,
            "text": text,
            "parse_mode": parse_mode,
            "disable_web_page_preview": disable_web_page_preview
        }
        
        try:
            async with aiohttp.ClientSession() as session:
                async with session.post(url, json=payload) as response:
                    if response.status == 200:
                        return True
                    else:
                        error_data = await response.json() if response.content_type == 'application/json' else {}
                        
                        # Provide helpful error messages
                        if error_data.get('error_code') == 400 and 'chat not found' in error_data.get('description', ''):
                            # Get bot username for better error message
                            bot_username = await self._get_bot_username()
                            print(f"❌ Telegram Error: Chat not found. Please:")
                            print(f"   1. Open Telegram and search for: @{bot_username}")
                            print(f"   2. Send /start to the bot")
                            print(f"   3. Get your chat ID from @userinfobot")
                            print(f"   4. Update TELEGRAM_CHAT_ID in scraper/.env")
                        else:
                            error = await response.text()
                            print(f"Telegram error: {error}")
                        return False
        except Exception as e:
            print(f"Failed to send Telegram message: {str(e)}")
            return False
    
    async def _get_bot_username(self) -> str:
        """Get bot username for error messages"""
        try:
            url = f"{self.base_url}/getMe"
            async with aiohttp.ClientSession() as session:
                async with session.get(url) as response:
                    if response.status == 200:
                        data = await response.json()
                        return data['result'].get('username', 'your_bot')
        except:
            pass
        return "your_bot"
    
    async def send_notice_alert(self, chat_id: str, notice: Dict) -> bool:
        """Send a formatted notice alert"""
        # Format message
        urgency_emoji = {
            "critical": "🔴",
            "high": "🟡",
            "medium": "🔵",
            "low": "🟢"
        }
        
        emoji = urgency_emoji.get(notice.get("urgency", "medium"), "🔵")
        
        message = f"""
{emoji} <b>{notice['title']}</b>

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
            message += f"\n\n🔗 <a href='{notice['external_url']}'>View Full Notice</a>"
        
        message += f"\n\n📱 InfoMe"
        
        return await self.send_message(chat_id, message.strip())
    
    async def send_deadline_reminder(
        self,
        chat_id: str,
        notice: Dict,
        days_left: int
    ) -> bool:
        """Send a deadline reminder"""
        urgency = "🚨" if days_left <= 1 else "⏰"
        
        message = f"""
{urgency} <b>Deadline Reminder</b>

{notice['title']}

⏰ <b>{days_left} day{'s' if days_left != 1 else ''} left!</b>

Don't miss this opportunity!
"""
        
        if notice.get('external_url'):
            message += f"\n🔗 <a href='{notice['external_url']}'>Apply Now</a>"
        
        return await self.send_message(chat_id, message.strip())


# Webhook setup for receiving messages (optional)
class TelegramWebhook:
    """Handle incoming Telegram messages"""
    
    def __init__(self):
        self.bot = TelegramBot()
    
    async def set_webhook(self, webhook_url: str) -> bool:
        """Set webhook URL"""
        url = f"{self.bot.base_url}/setWebhook"
        payload = {"url": webhook_url}
        
        try:
            async with aiohttp.ClientSession() as session:
                async with session.post(url, json=payload) as response:
                    return response.status == 200
        except:
            return False
    
    async def handle_update(self, update: Dict):
        """Handle incoming update"""
        if "message" in update:
            message = update["message"]
            chat_id = message["chat"]["id"]
            text = message.get("text", "")
            
            # Handle commands
            if text == "/start":
                await self.bot.send_message(
                    chat_id,
                    "Welcome to InfoMe! 🎉\n\nYou'll receive important notices and alerts here."
                )
            elif text == "/help":
                await self.bot.send_message(
                    chat_id,
                    "InfoMe Bot Commands:\n\n"
                    "/start - Start receiving alerts\n"
                    "/help - Show this help message\n"
                    "/stop - Stop receiving alerts"
                )
