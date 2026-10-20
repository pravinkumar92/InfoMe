# 🚀 Quick Start Guide

## 1. Install Dependencies (2 minutes)

```bash
# Frontend
npm install

# Backend
cd scraper
pip install -r requirements.txt
```

## 2. Configure Environment (3 minutes)

**Create `scraper/.env`:**
```env
SUPABASE_URL=your_url
SUPABASE_KEY=your_key
GEMINI_API_KEY=your_gemini_key
TELEGRAM_BOT_TOKEN=your_bot_token
TELEGRAM_CHAT_ID=your_chat_id
TWILIO_ACCOUNT_SID=your_twilio_sid
TWILIO_AUTH_TOKEN=your_twilio_token
TWILIO_WHATSAPP_FROM=whatsapp:+14155238886
TWILIO_WHATSAPP_TO=whatsapp:+your_number
```

## 3. Setup WhatsApp (1 minute)

1. Go to: https://console.twilio.com/us1/develop/sms/try-it-out/whatsapp-learn
2. Send `join <code>` to +1 (415) 523-8886 from your WhatsApp

## 4. Start Services (1 minute)

```bash
# Terminal 1: Backend
cd scraper
python api_server.py

# Terminal 2: Frontend
npm run dev
```

## 5. Test Everything (2 minutes)

```bash
# Test Telegram
python scraper/test_telegram.py

# Test WhatsApp
python scraper/test_whatsapp.py
```

## 6. Access Application

- Frontend: http://localhost:3000
- Backend: http://localhost:8000
- Calendar: http://localhost:3000/dashboard/calendar
- AI Chat: http://localhost:3000/dashboard/ai

## ✅ You're Ready!

Upload a PDF at `/dashboard/admin` and get alerts on both Telegram and WhatsApp!
