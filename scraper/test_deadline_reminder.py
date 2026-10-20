"""Test deadline reminder functionality"""
import asyncio
from alerts.telegram_bot import TelegramBot
import os
from dotenv import load_dotenv

load_dotenv()

async def test_deadline_reminder():
    """Test sending a deadline reminder"""
    bot = TelegramBot()
    chat_id = os.getenv("TELEGRAM_CHAT_ID")
    
    print("📤 Sending test deadline reminder...\n")
    
    test_notice = {
        "title": "AKTU B.Tech Exam Registration",
        "external_url": "https://aktu.ac.in"
    }
    
    days_left = 3
    
    success = await bot.send_deadline_reminder(chat_id, test_notice, days_left)
    
    if success:
        print("✅ Deadline reminder sent successfully!")
        print("Check your Telegram for the reminder message.")
    else:
        print("❌ Failed to send deadline reminder")

if __name__ == "__main__":
    asyncio.run(test_deadline_reminder())
