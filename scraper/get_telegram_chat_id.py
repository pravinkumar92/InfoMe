"""Helper script to get your Telegram Chat ID"""
import asyncio
import aiohttp
import os
from dotenv import load_dotenv

load_dotenv()
TELEGRAM_BOT_TOKEN = os.getenv("TELEGRAM_BOT_TOKEN")

async def get_updates():
    """Get recent updates from Telegram bot"""
    url = f"https://api.telegram.org/bot{TELEGRAM_BOT_TOKEN}/getUpdates"
    
    try:
        async with aiohttp.ClientSession() as session:
            async with session.get(url) as response:
                if response.status == 200:
                    data = await response.json()
                    
                    if not data.get('result'):
                        print("❌ No messages found!")
                        print("\nTo get your Chat ID:")
                        print("1. Open Telegram")
                        print("2. Search for your bot (use the bot token to find it)")
                        print("3. Send /start to the bot")
                        print("4. Run this script again")
                        return
                    
                    print("✅ Found messages!\n")
                    print("Your Chat IDs:")
                    print("-" * 50)
                    
                    seen_chats = set()
                    for update in data['result']:
                        if 'message' in update:
                            chat = update['message']['chat']
                            chat_id = chat['id']
                            
                            if chat_id not in seen_chats:
                                seen_chats.add(chat_id)
                                
                                chat_type = chat.get('type', 'unknown')
                                first_name = chat.get('first_name', '')
                                last_name = chat.get('last_name', '')
                                username = chat.get('username', '')
                                
                                print(f"\nChat ID: {chat_id}")
                                print(f"Type: {chat_type}")
                                if first_name or last_name:
                                    print(f"Name: {first_name} {last_name}".strip())
                                if username:
                                    print(f"Username: @{username}")
                    
                    print("\n" + "-" * 50)
                    print("\n📝 Copy one of the Chat IDs above and update your scraper/.env file:")
                    print(f"   TELEGRAM_CHAT_ID=<your_chat_id>")
                    
                else:
                    error = await response.text()
                    print(f"❌ Error: {error}")
                    
    except Exception as e:
        print(f"❌ Failed: {str(e)}")

if __name__ == "__main__":
    if not TELEGRAM_BOT_TOKEN or TELEGRAM_BOT_TOKEN == "your_telegram_bot_token":
        print("❌ Please set TELEGRAM_BOT_TOKEN in scraper/.env first!")
        print("\nTo create a bot:")
        print("1. Open Telegram and search for @BotFather")
        print("2. Send /newbot and follow instructions")
        print("3. Copy the bot token")
        print("4. Add it to scraper/.env as TELEGRAM_BOT_TOKEN")
    else:
        print("🔍 Fetching your Telegram Chat ID...\n")
        asyncio.run(get_updates())
