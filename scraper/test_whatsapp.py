"""Test WhatsApp alert functionality"""
import asyncio
import os
from alerts.whatsapp_sender import WhatsAppSender
from dotenv import load_dotenv

load_dotenv()

async def test_whatsapp():
    """Test sending a WhatsApp alert"""
    
    whatsapp = WhatsAppSender()
    whatsapp_to = os.getenv("TWILIO_WHATSAPP_TO")
    
    if not whatsapp_to:
        print("❌ TWILIO_WHATSAPP_TO not set in .env file")
        return
    
    print("📱 Testing WhatsApp Alert...\n")
    print(f"Sending to: {whatsapp_to}\n")
    
    test_notice = {
        "title": "🎓 UPSC Civil Services Exam 2026",
        "category": "Exams",
        "department": "UPSC",
        "summary": "Union Public Service Commission announces Civil Services Examination 2026. Online applications open from April 1st.",
        "urgency": "high",
        "last_date": "2026-04-30",
        "external_url": "https://upsc.gov.in"
    }
    
    success = await whatsapp.send_notice_alert(whatsapp_to, test_notice)
    
    if success:
        print("✅ WhatsApp alert sent successfully!")
        print("📱 Check your WhatsApp for the message.")
    else:
        print("❌ Failed to send WhatsApp alert")
        print("\n⚠️  Make sure you:")
        print("   1. Joined Twilio WhatsApp Sandbox")
        print("   2. Sent 'join <code>' to your Twilio number")
        print("   3. Verified your credentials in .env")

if __name__ == "__main__":
    asyncio.run(test_whatsapp())
