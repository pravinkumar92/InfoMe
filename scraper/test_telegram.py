"""Quick test for Telegram bot"""
import asyncio
import aiohttp
import os
from dotenv import load_dotenv

load_dotenv()

TELEGRAM_BOT_TOKEN = os.getenv("TELEGRAM_BOT_TOKEN")
TELEGRAM_CHAT_ID = os.getenv("TELEGRAM_CHAT_ID")

async def test_telegram():
    """Test Telegram connection"""
    print("🔍 Testing Telegram Bot Configuration\n")
    print(f"Bot Token: {TELEGRAM_BOT_TOKEN[:20]}...")
    print(f"Chat ID: {TELEGRAM_CHAT_ID}\n")
    
    # Test 1: Get bot info
    print("1️⃣ Testing bot token...")
    url = f"https://api.telegram.org/bot{TELEGRAM_BOT_TOKEN}/getMe"
    
    try:
        async with aiohttp.ClientSession() as session:
            async with session.get(url) as response:
                if response.status == 200:
                    data = await response.json()
                    bot_info = data['result']
                    print(f"   ✅ Bot is valid!")
                    print(f"   Bot Name: {bot_info['first_name']}")
                    print(f"   Username: @{bot_info['username']}")
                    print(f"   Bot ID: {bot_info['id']}\n")
                else:
                    error = await response.text()
                    print(f"   ❌ Invalid bot token: {error}\n")
                    return
    except Exception as e:
        print(f"   ❌ Error: {e}\n")
        return
    
    # Test 2: Send test message
    print("2️⃣ Testing message sending...")
    send_url = f"https://api.telegram.org/bot{TELEGRAM_BOT_TOKEN}/sendMessage"
    
    payload = {
        "chat_id": TELEGRAM_CHAT_ID,
        "text": "✅ <b>InfoMe Test Message</b>\n\nYour Telegram bot is configured correctly!",
        "parse_mode": "HTML"
    }
    
    try:
        async with aiohttp.ClientSession() as session:
            async with session.post(send_url, json=payload) as response:
                if response.status == 200:
                    print(f"   ✅ Message sent successfully!")
                    print(f"   Check your Telegram app for the test message.\n")
                    
                    data = await response.json()
                    print(f"   Message ID: {data['result']['message_id']}")
                    print(f"   Chat: {data['result']['chat']['first_name']}")
                else:
                    error_data = await response.json()
                    print(f"   ❌ Failed to send message")
                    print(f"   Error: {error_data.get('description', 'Unknown error')}\n")
                    
                    if 'chat not found' in error_data.get('description', '').lower():
                        print("   💡 Solution:")
                        print(f"      1. Open Telegram")
                        print(f"      2. Search for @{bot_info['username']}")
                        print(f"      3. Click 'START' or send /start")
                        print(f"      4. Run this test again\n")
    except Exception as e:
        print(f"   ❌ Error: {e}\n")

if __name__ == "__main__":
    asyncio.run(test_telegram())
