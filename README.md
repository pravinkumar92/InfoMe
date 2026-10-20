# 🔔 InfoMe - AI-Powered Notice Management System

An intelligent platform for tracking Indian government notices, scholarships, exams, and job opportunities with real-time alerts on Telegram and WhatsApp.

## ✨ Features

- 📅 **Interactive Calendar** - Track deadlines with color-coded priorities
- 🤖 **AI Assistant** - Gemini-powered chat for guidance on notices and applications
- 🌐 **Multilingual Support** - English, Hindi, Urdu, Bengali with AI translation
- 📱 **Dual Platform Alerts** - Telegram + WhatsApp notifications
- 🔍 **Smart Search** - AI-powered notice categorization and search
- 📄 **PDF Processing** - OCR and AI analysis of uploaded documents
- 🌐 **Live Scraping** - Automated notice collection from government websites
- 📊 **Analytics Dashboard** - Track trends and important deadlines

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and npm
- Python 3.9+
- Tesseract OCR
- Supabase account
- Telegram Bot Token
- Twilio Account (for WhatsApp)
- Google Gemini API Key

### Installation

1. **Clone and Install Dependencies**
```bash
# Install frontend dependencies
npm install

# Install backend dependencies
cd scraper
pip install -r requirements.txt
```

2. **Configure Environment Variables**

Create `.env.local` in root:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_key
```

Create `scraper/.env`:
```env
# Supabase
SUPABASE_URL=your_supabase_url
SUPABASE_KEY=your_service_role_key

# AI
GEMINI_API_KEY=your_gemini_api_key

# Telegram
TELEGRAM_BOT_TOKEN=your_bot_token
TELEGRAM_CHAT_ID=your_chat_id

# Twilio WhatsApp
TWILIO_ACCOUNT_SID=your_account_sid
TWILIO_AUTH_TOKEN=your_auth_token
TWILIO_WHATSAPP_FROM=whatsapp:+14155238886
TWILIO_WHATSAPP_TO=whatsapp:+your_number
```

3. **Setup Database**
```bash
# Run migrations in Supabase SQL Editor
# Execute files in supabase/migrations/ in order
```

4. **Start Services**
```bash
# Terminal 1: Start backend
cd scraper
python api_server.py

# Terminal 2: Start frontend
npm run dev
```

5. **Access Application**
- Frontend: http://localhost:3000
- Backend API: http://localhost:8000

## 📱 WhatsApp Setup

1. Go to Twilio Console: https://console.twilio.com/us1/develop/sms/try-it-out/whatsapp-learn
2. Find your sandbox join code
3. Send `join <code>` to +1 (415) 523-8886 from your WhatsApp
4. Test: `python scraper/test_whatsapp.py`

## 🎯 Usage

### Upload PDF Notice
1. Go to `/dashboard/admin`
2. Upload PDF file
3. AI extracts information automatically
4. Alerts sent to Telegram + WhatsApp

### Use AI Assistant
1. Go to `/dashboard/ai`
2. Ask questions about notices, scholarships, exams
3. Get instant AI-powered responses

### View Calendar
1. Go to `/dashboard/calendar`
2. See all deadlines color-coded by priority
3. Click events for details

### Switch Language
1. Click globe icon in header
2. Select language (EN/HI/UR/BN)
3. Content translates automatically

## 🏗️ Project Structure

```
├── src/
│   ├── app/
│   │   ├── dashboard/          # Dashboard pages
│   │   │   ├── calendar/       # Interactive calendar
│   │   │   ├── ai/             # AI chat assistant
│   │   │   ├── notices/        # Notice management
│   │   │   └── ...
│   │   └── api/                # API routes
│   ├── components/             # React components
│   └── lib/                    # Utilities
├── scraper/
│   ├── ai/                     # AI services
│   │   ├── gemini_analyzer.py # Notice analysis
│   │   ├── translator.py      # Multilingual translation
│   │   └── chat_assistant.py  # AI chat
│   ├── alerts/                 # Alert services
│   │   ├── telegram_bot.py    # Telegram integration
│   │   └── whatsapp_sender.py # WhatsApp integration
│   ├── core/                   # Core functionality
│   ├── parsers/                # PDF/file processing
│   └── api_server.py           # FastAPI backend
├── supabase/
│   └── migrations/             # Database schemas
└── public/                     # Static assets
```

## 🔧 Configuration

### Telegram Bot Setup
1. Create bot with @BotFather
2. Get bot token
3. Get your chat ID from @userinfobot
4. Add to `scraper/.env`

### Gemini API
1. Get API key from Google AI Studio
2. Add to `scraper/.env`

### Tesseract OCR
- Windows: Download from https://github.com/UB-Mannheim/tesseract/wiki
- Add to PATH

## 📚 API Endpoints

### Calendar
- `GET /calendar/events` - Get calendar events
- `POST /calendar/events` - Create event
- `PUT /calendar/events/{id}` - Update event
- `DELETE /calendar/events/{id}` - Delete event

### AI
- `POST /ai/chat` - Chat with AI assistant
- `POST /translate/text` - Translate text
- `POST /translate/notice` - Translate notice

### Alerts
- `POST /alerts/deadline-reminder` - Send reminder (Telegram + WhatsApp)

### Notices
- `POST /notices/process-file` - Process uploaded PDF
- `GET /notices/recent` - Get recent notices

## 🧪 Testing

```bash
# Test Telegram
python scraper/test_telegram.py

# Test WhatsApp
python scraper/test_whatsapp.py

# Test AI Translation
python scraper/ai/translator.py
```

## 🎨 Tech Stack

**Frontend:**
- Next.js 14
- React 18
- TypeScript
- Tailwind CSS
- Framer Motion

**Backend:**
- Python 3.9+
- FastAPI
- Google Gemini AI
- Tesseract OCR

**Database:**
- Supabase (PostgreSQL)

**Integrations:**
- Telegram Bot API
- Twilio WhatsApp API
- Google Gemini API

## 📝 License

MIT License - feel free to use for your projects!

## 🤝 Contributing

Contributions welcome! Please open an issue or submit a pull request.

## 📧 Support

For issues or questions, please open a GitHub issue.

---

Built with ❤️ for students and job seekers across India
