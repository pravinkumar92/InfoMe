from fastapi import FastAPI, HTTPException, BackgroundTasks, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, List
import asyncio
import uvicorn
from datetime import datetime
import io

from core.database import Database
from core.scraper import GenericScraper
from ai.classifier import AIProcessor
from ai.gemini_analyzer import GeminiAnalyzer
from parsers.pdf_parser import PDFParser
from parsers.file_processor import FileProcessor
from alerts.alert_manager import AlertManager

app = FastAPI(title="InfoMe Scraper API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:3001"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

db = Database()
ai = AIProcessor(use_gemini=False)
gemini_analyzer = GeminiAnalyzer()
pdf_parser = PDFParser()
file_processor = FileProcessor()
alert_manager = AlertManager(db)

scraper_logs: List[dict] = []
scraper_running = False
class ScraperRunRequest(BaseModel):
    source_name: Optional[str] = None

class NoticeUploadRequest(BaseModel):
    title: str
    description: Optional[str] = None
    category: str
    department: Optional[str] = None
    urgency: str = "medium"
    last_date: Optional[str] = None
    amount: Optional[str] = None
    external_url: Optional[str] = None
    pdf_url: Optional[str] = None
    source_id: Optional[str] = None

class TelegramAlertRequest(BaseModel):
    chat_id: str
    notice_id: str

@app.get("/")
async def root():
    return {
        "service": "InfoMe Scraper API",
        "version": "1.0.0",
        "status": "running"
    }

@app.get("/health")
async def health_check():
    return {"status": "healthy", "timestamp": datetime.now().isoformat()}

@app.post("/scraper/scrape-custom-url")
async def scrape_custom_url(request: dict):
    global scraper_running, scraper_logs
    try:
        url = request.get("url")
        if not url:
            raise HTTPException(status_code=400, detail="URL is required")
        
        scraper_running = True
        scraper_logs.append({
            "timestamp": datetime.now().isoformat(),
            "message": f"🌐 Starting scrape for: {url}",
            "type": "info"
        })
        
        import requests
        from bs4 import BeautifulSoup
        
        scraper_logs.append({
            "timestamp": datetime.now().isoformat(),
            "message": f"📡 Fetching content from {url}...",
            "type": "info"
        })
        
        headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
        }
        response = requests.get(url, headers=headers, timeout=30)
        response.raise_for_status()
        
        scraper_logs.append({
            "timestamp": datetime.now().isoformat(),
            "message": "✓ Content fetched successfully",
            "type": "success"
        })
        
        soup = BeautifulSoup(response.content, 'html.parser')
        
        scraper_logs.append({
            "timestamp": datetime.now().isoformat(),
            "message": "🔍 Parsing HTML content...",
            "type": "info"
        })
        
        notices = []
        base_url = '/'.join(url.split('/')[:3])
        
        # Method 1: Check for tables (common in government websites)
        tables = soup.find_all('table')
        for table in tables:
            rows = table.find_all('tr')
            for row in rows:
                cells = row.find_all(['td', 'th'])
                if len(cells) >= 2:
                    # Extract text from cells
                    row_text = ' '.join([cell.get_text(strip=True) for cell in cells])
                    
                    # Look for links in the row
                    links = row.find_all('a', href=True)
                    for link in links:
                        link_text = link.get_text(strip=True)
                        href = link.get('href')
                        
                        # Skip empty or very short links
                        if len(link_text) < 10:
                            continue
                        
                        # Build full URL
                        if href.startswith('http'):
                            full_url = href
                        elif href.startswith('/'):
                            full_url = base_url + href
                        else:
                            full_url = base_url + '/' + href
                        
                        # Extract date if present in row
                        date_text = ""
                        for cell in cells:
                            cell_text = cell.get_text(strip=True)
                            if any(month in cell_text.lower() for month in ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec']) or \
                               any(char.isdigit() for char in cell_text) and len(cell_text) < 20:
                                date_text = cell_text
                                break
                        
                        notice_data = {
                            "title": link_text[:200],
                            "description": row_text[:500],
                            "summary": link_text[:300],
                            "external_url": full_url,
                            "category": "Circular" if 'circular' in url.lower() else "Notice",
                            "department": url.split('/')[2] if '/' in url else "Unknown",
                            "urgency": "medium",
                            "last_date": date_text if date_text else None,
                            "views": 0
                        }
                        
                        try:
                            created_notice = db.create_notice(notice_data)
                            if created_notice:
                                notices.append(created_notice)
                                scraper_logs.append({
                                    "timestamp": datetime.now().isoformat(),
                                    "message": f"✓ Saved: {link_text[:60]}...",
                                    "type": "success"
                                })
                        except Exception as e:
                            scraper_logs.append({
                                "timestamp": datetime.now().isoformat(),
                                "message": f"⚠ Skipped: {str(e)[:50]}",
                                "type": "warning"
                            })
        
        # Method 2: Check for regular links with keywords (fallback)
        if len(notices) == 0:
            scraper_logs.append({
                "timestamp": datetime.now().isoformat(),
                "message": "🔍 No table data found, scanning all links...",
                "type": "info"
            })
            
            for link in soup.find_all('a', href=True):
                text = link.get_text(strip=True)
                href = link.get('href')
                
                # Skip short or empty links
                if len(text) < 15:
                    continue
                
                # Check for notice-related keywords
                if any(keyword in text.lower() for keyword in [
                    'notice', 'notification', 'admission', 'exam', 'result', 
                    'scholarship', 'recruitment', 'tender', 'circular', 'announcement',
                    'registration', 'application', 'form', 'download', 'pdf'
                ]):
                    # Build full URL
                    if href.startswith('http'):
                        full_url = href
                    elif href.startswith('/'):
                        full_url = base_url + href
                    else:
                        full_url = base_url + '/' + href
                    
                    notice_data = {
                        "title": text[:200],
                        "description": text[:500],
                        "summary": text[:300],
                        "external_url": full_url,
                        "category": "General",
                        "department": url.split('/')[2] if '/' in url else "Unknown",
                        "urgency": "medium",
                        "views": 0
                    }
                    
                    try:
                        created_notice = db.create_notice(notice_data)
                        if created_notice:
                            notices.append(created_notice)
                            scraper_logs.append({
                                "timestamp": datetime.now().isoformat(),
                                "message": f"✓ Saved: {text[:60]}...",
                                "type": "success"
                            })
                    except Exception as e:
                        scraper_logs.append({
                            "timestamp": datetime.now().isoformat(),
                            "message": f"⚠ Skipped: {str(e)[:50]}",
                            "type": "warning"
                        })
        
        scraper_logs.append({
            "timestamp": datetime.now().isoformat(),
            "message": f"✅ Scraping completed! Found {len(notices)} notices",
            "type": "success"
        })
        
        scraper_running = False
        
        return {
            "success": True,
            "url": url,
            "noticesFound": len(notices),
            "notices": notices[:10],
            "message": f"Successfully scraped {len(notices)} notices"
        }
        
    except requests.exceptions.RequestException as e:
        scraper_logs.append({
            "timestamp": datetime.now().isoformat(),
            "message": f"❌ Network error: {str(e)}",
            "type": "error"
        })
        scraper_running = False
        raise HTTPException(status_code=500, detail=f"Failed to fetch URL: {str(e)}")
    except Exception as e:
        scraper_logs.append({
            "timestamp": datetime.now().isoformat(),
            "message": f"❌ Error: {str(e)}",
            "type": "error"
        })
        scraper_running = False
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/scraper/run")
async def run_scraper(request: ScraperRunRequest, background_tasks: BackgroundTasks):
    try:
        background_tasks.add_task(scrape_sources, request.source_name)
        return {
            "success": True,
            "message": f"Scraper started for {request.source_name or 'all sources'}",
            "timestamp": datetime.now().isoformat()
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/scraper/status")
async def scraper_status():
    try:
        logs = db.client.table("scraper_logs").select("*").order(
            "created_at", desc=True
        ).limit(10).execute()
        
        recent_notices = db.client.table("notices").select("*").order(
            "created_at", desc=True
        ).limit(5).execute()
        
        return {
            "success": True,
            "status": "running" if scraper_running else "idle",
            "recent_runs": logs.data,
            "recent_notices": recent_notices.data,
            "logs": scraper_logs[-50:] if scraper_logs else []
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/scraper/live-logs")
async def get_live_logs():
    return {
        "success": True,
        "logs": scraper_logs[-50:] if scraper_logs else [],
        "is_running": scraper_running
    }

@app.get("/sources")
async def get_sources():
    try:
        sources = db.get_active_sources()
        return {
            "success": True,
            "count": len(sources),
            "sources": sources
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/notices/process-file")
async def process_uploaded_file(
    file: UploadFile = File(...),
    file_url: Optional[str] = Form(None),
    background_tasks: BackgroundTasks = None
):
    try:
        file_bytes = await file.read()
        
        print(f"📄 Processing file: {file.filename}")
        extraction_result = file_processor.process_file(
            file_bytes,
            file.filename,
            file.content_type
        )
        
        if not extraction_result["success"]:
            raise HTTPException(
                status_code=400,
                detail=extraction_result.get("error", "Text extraction failed")
            )
        
        extracted_text = extraction_result["text"]
        file_hash = extraction_result["file_hash"]
        print(f"✅ Extracted {extraction_result['word_count']} words")
        
        if db.notice_exists(file_hash):
            return {
                "success": False,
                "error": "duplicate",
                "message": "This notice already exists in the system",
                "extraction": extraction_result
            }
        
        print("🤖 Analyzing with Gemini AI...")
        analysis_result = gemini_analyzer.analyze_notice(extracted_text)
        
        if not analysis_result["success"]:
            return {
                "success": True,
                "extraction": extraction_result,
                "analysis": None,
                "ai_error": analysis_result.get("error"),
                "message": "Text extracted but AI analysis failed"
            }
        
        analyzed_data = analysis_result["data"]
        print(f"✅ AI Analysis complete: {analyzed_data['title'][:50]}...")
        
        notice_data = {
            "title": analyzed_data["title"],
            "description": extracted_text[:1000],
            "summary": analyzed_data["summary"],
            "category": analyzed_data["category"],
            "department": analyzed_data["issuer"],
            "urgency": analyzed_data["urgency"],
            "last_date": analyzed_data["deadline_date"],
            "amount": analyzed_data["amount"],
            "external_url": file_url,
            "pdf_url": file_url if file.content_type == "application/pdf" else None,
            "hash": file_hash,
            "views": 0,
            "metadata": {
                "eligibility": analyzed_data.get("eligibility"),
                "key_instructions": analyzed_data.get("key_instructions", []),
                "contact_info": analyzed_data.get("contact_info"),
                "important_dates": analyzed_data.get("important_dates", []),
                "extracted_from_file": True,
                "original_filename": file.filename
            }
        }
        
        notice = db.create_notice(notice_data)
        
        if not notice:
            raise HTTPException(
                status_code=500,
                detail="Failed to create notice in database"
            )
        
        print(f"✅ Notice created: {notice['id']}")
        
        for date_obj in analyzed_data.get("important_dates", []):
            if date_obj.get("type") == "deadline" or date_obj.get("date") == analyzed_data["deadline_date"]:
                db.create_deadline(
                    notice['id'],
                    date_obj["date"],
                    urgency_score=90 if analyzed_data["urgency"] == "critical" else 70
                )
        
        if background_tasks:
            background_tasks.add_task(alert_manager.send_notice_alerts, notice)
        
        db.track_event(
            event_type="notice_uploaded",
            notice_id=notice['id'],
            metadata={
                "filename": file.filename,
                "file_type": file.content_type,
                "word_count": extraction_result['word_count'],
                "category": analyzed_data["category"],
                "urgency": analyzed_data["urgency"],
                "has_deadline": analyzed_data["deadline_date"] is not None
            }
        )
        
        print(f"✅ Activity logged for notice: {notice['id']}")
        
        return {
            "success": True,
            "notice": notice,
            "extraction": extraction_result,
            "analysis": analyzed_data,
            "message": "Notice processed and created successfully"
        }
    
    except HTTPException:
        raise
    except Exception as e:
        print(f"❌ Processing error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/notices/upload")
async def upload_notice(request: NoticeUploadRequest, background_tasks: BackgroundTasks):
    try:
        notice_data = {
            "title": request.title,
            "description": request.description,
            "category": request.category,
            "department": request.department,
            "urgency": request.urgency,
            "last_date": request.last_date,
            "amount": request.amount,
            "external_url": request.external_url,
            "pdf_url": request.pdf_url,
            "source_id": request.source_id,
            "views": 0
        }
        
        notice = db.create_notice(notice_data)
        
        if not notice:
            raise HTTPException(status_code=400, detail="Notice already exists or creation failed")
        
        if request.last_date:
            db.create_deadline(notice['id'], request.last_date)
        
        background_tasks.add_task(alert_manager.send_notice_alerts, notice)
        
        return {
            "success": True,
            "message": "Notice uploaded successfully",
            "notice": notice
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/alerts/recent")
async def get_recent_alerts():
    try:
        recent_notices = db.client.table("notices").select(
            "*"
        ).order("created_at", desc=True).limit(10).execute()
        
        notifications = []
        for notice in recent_notices.data:
            notification_type = "new_notice"
            if notice.get("urgency") == "critical":
                notification_type = "deadline"
            elif notice.get("category") in ["Alert", "Civic Alert"]:
                notification_type = "alert"
            
            notifications.append({
                "id": notice["id"],
                "title": notice["title"],
                "message": notice.get("summary", notice.get("description", ""))[:150],
                "type": notification_type,
                "timestamp": notice["created_at"],
                "read": False,
                "link": f"/dashboard/notices/{notice['id']}"
            })
        
        return {
            "success": True,
            "notifications": notifications
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/alerts/{notification_id}/read")
async def mark_notification_read(notification_id: str):
    try:
        return {
            "success": True,
            "message": "Notification marked as read"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/alerts/mark-all-read")
async def mark_all_notifications_read():
    try:
        return {
            "success": True,
            "message": "All notifications marked as read"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.delete("/alerts/{notification_id}")
async def delete_notification(notification_id: str):
    try:
        return {
            "success": True,
            "message": "Notification deleted"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/alerts/telegram/send")
async def send_telegram_alert(request: TelegramAlertRequest):
    try:
        notice = db.get_notice_by_id(request.notice_id)
        if not notice:
            raise HTTPException(status_code=404, detail="Notice not found")
        
        success = await alert_manager.telegram.send_notice_alert(request.chat_id, notice)
        
        if not success:
            raise HTTPException(status_code=500, detail="Failed to send Telegram alert")
        
        return {
            "success": True,
            "message": "Telegram alert sent successfully"
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/alerts/test")
async def test_alerts():
    try:
        test_notice = {
            "id": "test-123",
            "title": "Test Notice - InfoMe",
            "category": "General",
            "department": "System Test",
            "summary": "This is a test alert from InfoMe API",
            "urgency": "medium",
            "external_url": "https://example.com"
        }
        
        return {
            "success": True,
            "message": "Test alert functionality ready"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/alerts/test-telegram")
async def test_telegram_alert(
    chat_id: str = Form(...),
    title: str = Form(...),
    category: str = Form("General"),
    department: str = Form("N/A"),
    summary: str = Form(""),
    urgency: str = Form("medium"),
    last_date: Optional[str] = Form(None),
    amount: Optional[str] = Form(None)
):
    """Test Telegram alert - for demo purposes"""
    try:
        from alerts.telegram_bot import TelegramBot
        
        bot = TelegramBot()
        
        notice = {
            "title": title,
            "category": category,
            "department": department,
            "summary": summary,
            "urgency": urgency,
            "last_date": last_date,
            "amount": amount,
            "external_url": "http://localhost:3000/dashboard"
        }
        
        success = await bot.send_notice_alert(chat_id, notice)
        
        if success:
            return {
                "success": True,
                "message": "Telegram alert sent successfully!",
                "chat_id": chat_id,
                "notice": notice
            }
        else:
            raise HTTPException(status_code=500, detail="Failed to send alert")
            
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/alerts/deadline-reminder")
async def test_deadline_reminder(
    chat_id: str = Form(...),
    title: str = Form(...),
    days_left: int = Form(...),
    external_url: Optional[str] = Form(None)
):
    """Send deadline reminder to both Telegram and WhatsApp"""
    try:
        from alerts.telegram_bot import TelegramBot
        from alerts.whatsapp_sender import WhatsAppSender
        import os
        
        telegram_bot = TelegramBot()
        whatsapp = WhatsAppSender()
        
        notice = {
            "title": title,
            "external_url": external_url or "http://localhost:3000/dashboard"
        }
        
        results = {
            "telegram": False,
            "whatsapp": False
        }
        
        # Send to Telegram
        telegram_success = await telegram_bot.send_deadline_reminder(chat_id, notice, days_left)
        results["telegram"] = telegram_success
        
        # Send to WhatsApp
        whatsapp_to = os.getenv("TWILIO_WHATSAPP_TO")
        if whatsapp_to:
            whatsapp_success = await whatsapp.send_deadline_reminder(whatsapp_to, notice, days_left)
            results["whatsapp"] = whatsapp_success
        
        if results["telegram"] or results["whatsapp"]:
            return {
                "success": True,
                "message": "Deadline reminder sent!",
                "results": results,
                "days_left": days_left
            }
        else:
            return {
                "success": False,
                "message": "Failed to send reminders. Please check your configuration.",
                "results": results
            }
            
    except Exception as e:
        return {
            "success": False,
            "message": "Error sending reminder",
            "error": str(e)
        }

# ============ WEBHOOK ENDPOINTS ============

@app.post("/webhook/telegram")
async def telegram_webhook(update: dict):
    """Handle Telegram webhook updates"""
    try:
        # Handle incoming Telegram messages
        if "message" in update:
            message = update["message"]
            chat_id = str(message["chat"]["id"])
            text = message.get("text", "")
            
            if text == "/start":
                await alert_manager.telegram.send_message(
                    chat_id,
                    "Welcome to InfoMe! 🎉\n\nYou'll receive important notices here.\n\nSend /help for commands."
                )
            elif text == "/help":
                await alert_manager.telegram.send_message(
                    chat_id,
                    "InfoMe Commands:\n\n"
                    "/start - Start receiving alerts\n"
                    "/help - Show this help\n"
                    "/status - Check your subscription\n\n"
                    f"Your Chat ID: {chat_id}"
                )
            elif text == "/status":
                await alert_manager.telegram.send_message(
                    chat_id,
                    f"✅ You're subscribed to InfoMe!\n\n"
                    f"Chat ID: {chat_id}\n"
                    f"Status: Active"
                )
        
        return {"ok": True}
    except Exception as e:
        print(f"Webhook error: {str(e)}")
        return {"ok": False, "error": str(e)}

# ============ BACKGROUND TASKS ============

async def scrape_sources(source_name: Optional[str] = None):
    global scraper_running, scraper_logs
    try:
        scraper_running = True
        scraper_logs.append({
            "timestamp": datetime.now().isoformat(),
            "message": f"🚀 Starting scraper for: {source_name or 'all sources'}",
            "type": "info"
        })
        print(f"\n🚀 Starting scraper for: {source_name or 'all sources'}")
        
        sources = db.get_active_sources()
        
        if source_name:
            sources = [s for s in sources if source_name.lower() in s['name'].lower()]
        
        for source in sources:
            try:
                scraper_logs.append({
                    "timestamp": datetime.now().isoformat(),
                    "message": f"🌐 Connecting to {source['name']}...",
                    "type": "info"
                })
                
                async with GenericScraper(source, db) as scraper:
                    result = await scraper.run()
                    
                    if result.get("success") and result.get("new", 0) > 0:
                        scraper_logs.append({
                            "timestamp": datetime.now().isoformat(),
                            "message": f"✓ Found {result['new']} new notices from {source['name']}",
                            "type": "success"
                        })
                        print(f"  📤 Sending alerts for {result['new']} new notices...")
                
                await asyncio.sleep(2)
            except Exception as e:
                scraper_logs.append({
                    "timestamp": datetime.now().isoformat(),
                    "message": f"❌ Error scraping {source['name']}: {str(e)}",
                    "type": "error"
                })
                print(f"  ❌ Error scraping {source['name']}: {str(e)}")
        
        scraper_logs.append({
            "timestamp": datetime.now().isoformat(),
            "message": "✅ Scraping completed",
            "type": "success"
        })
        print("✅ Scraping completed")
        scraper_running = False
    except Exception as e:
        scraper_logs.append({
            "timestamp": datetime.now().isoformat(),
            "message": f"❌ Scraper error: {str(e)}",
            "type": "error"
        })
        print(f"❌ Scraper error: {str(e)}")
        scraper_running = False

@app.on_event("startup")
async def startup_event():
    print("\n" + "="*60)
    print("🚀 InfoMe Scraper API Starting")
    print("="*60)
    print(f"📡 Server: http://localhost:8000")
    print(f"📚 Docs: http://localhost:8000/docs")
    print(f"🔧 Health: http://localhost:8000/health")
    print("="*60 + "\n")

if __name__ == "__main__":
    uvicorn.run(
        "api_server:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info"
    )


# ============================================
# CALENDAR ENDPOINTS
# ============================================

class CalendarEventRequest(BaseModel):
    title: str
    description: Optional[str] = None
    deadline_date: str
    priority: str = "medium"
    notice_id: Optional[str] = None
    source: str = "manual"

@app.get("/calendar/events")
async def get_calendar_events(
    start_date: Optional[str] = None,
    end_date: Optional[str] = None,
    user_id: Optional[str] = None
):
    """Get calendar events for a date range"""
    try:
        query = db.client.table("calendar_events").select("*, notices(*)")
        
        if user_id:
            query = query.eq("user_id", user_id)
        
        if start_date:
            query = query.gte("deadline_date", start_date)
        
        if end_date:
            query = query.lte("deadline_date", end_date)
        
        result = query.order("deadline_date").execute()
        
        return {
            "success": True,
            "events": result.data,
            "count": len(result.data)
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/calendar/events")
async def create_calendar_event(event: CalendarEventRequest):
    """Create a new calendar event"""
    try:
        event_data = {
            "title": event.title,
            "description": event.description,
            "deadline_date": event.deadline_date,
            "priority": event.priority,
            "source": event.source,
            "notice_id": event.notice_id
        }
        
        result = db.client.table("calendar_events").insert(event_data).execute()
        
        return {
            "success": True,
            "event": result.data[0] if result.data else None
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.put("/calendar/events/{event_id}")
async def update_calendar_event(event_id: str, event: CalendarEventRequest):
    """Update a calendar event"""
    try:
        event_data = {
            "title": event.title,
            "description": event.description,
            "deadline_date": event.deadline_date,
            "priority": event.priority
        }
        
        result = db.client.table("calendar_events").update(event_data).eq("id", event_id).execute()
        
        return {
            "success": True,
            "event": result.data[0] if result.data else None
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.delete("/calendar/events/{event_id}")
async def delete_calendar_event(event_id: str):
    """Delete a calendar event"""
    try:
        db.client.table("calendar_events").delete().eq("id", event_id).execute()
        
        return {
            "success": True,
            "message": "Event deleted successfully"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/calendar/today")
async def get_today_deadlines(user_id: Optional[str] = None):
    """Get today's deadlines"""
    try:
        today = datetime.now().date().isoformat()
        
        query = db.client.table("calendar_events").select("*, notices(*)").gte(
            "deadline_date", today
        ).lte(
            "deadline_date", f"{today}T23:59:59"
        )
        
        if user_id:
            query = query.eq("user_id", user_id)
        
        result = query.order("deadline_date").execute()
        
        return {
            "success": True,
            "events": result.data,
            "count": len(result.data)
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# ============================================
# TRANSLATION ENDPOINTS
# ============================================

class TranslationRequest(BaseModel):
    text: str
    target_language: str
    source_language: str = "en"

class NoticeTranslationRequest(BaseModel):
    notice_id: str
    target_language: str

@app.post("/translate/text")
async def translate_text(request: TranslationRequest):
    """Translate text to target language"""
    try:
        from ai.translator import AITranslator
        
        translator = AITranslator()
        translated = translator.translate_text(
            request.text,
            request.target_language,
            request.source_language
        )
        
        return {
            "success": True,
            "original": request.text,
            "translated": translated,
            "target_language": request.target_language
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/translate/notice")
async def translate_notice(request: NoticeTranslationRequest):
    """Translate a notice to target language"""
    try:
        from ai.translator import AITranslator
        
        # Get notice from database
        notice_result = db.client.table("notices").select("*").eq("id", request.notice_id).execute()
        
        if not notice_result.data:
            raise HTTPException(status_code=404, detail="Notice not found")
        
        notice = notice_result.data[0]
        
        # Check if translation already exists
        existing = db.client.table("translations").select("*").eq(
            "notice_id", request.notice_id
        ).eq(
            "language", request.target_language
        ).execute()
        
        if existing.data:
            return {
                "success": True,
                "translation": existing.data[0],
                "cached": True
            }
        
        # Translate notice
        translator = AITranslator()
        translated_notice = translator.translate_notice(notice, request.target_language)
        
        # Store translation
        translation_data = {
            "notice_id": request.notice_id,
            "language": request.target_language,
            "title": translated_notice.get('title'),
            "summary": translated_notice.get('summary'),
            "description": translated_notice.get('description')
        }
        
        result = db.client.table("translations").insert(translation_data).execute()
        
        return {
            "success": True,
            "translation": result.data[0] if result.data else translated_notice,
            "cached": False
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/translate/notice/{notice_id}/{language}")
async def get_notice_translation(notice_id: str, language: str):
    """Get cached translation for a notice"""
    try:
        result = db.client.table("translations").select("*").eq(
            "notice_id", notice_id
        ).eq(
            "language", language
        ).execute()
        
        if result.data:
            return {
                "success": True,
                "translation": result.data[0]
            }
        else:
            return {
                "success": False,
                "message": "Translation not found"
            }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# ============================================
# USER PREFERENCES ENDPOINTS
# ============================================

class UserPreferencesRequest(BaseModel):
    user_id: str
    preferred_language: str = "en"
    timezone: str = "Asia/Kolkata"
    notification_language: str = "en"

@app.get("/preferences/{user_id}")
async def get_user_preferences(user_id: str):
    """Get user preferences"""
    try:
        result = db.client.table("user_preferences").select("*").eq("user_id", user_id).execute()
        
        if result.data:
            return {
                "success": True,
                "preferences": result.data[0]
            }
        else:
            # Return default preferences
            return {
                "success": True,
                "preferences": {
                    "user_id": user_id,
                    "preferred_language": "en",
                    "timezone": "Asia/Kolkata",
                    "notification_language": "en"
                }
            }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/preferences")
async def save_user_preferences(prefs: UserPreferencesRequest):
    """Save or update user preferences"""
    try:
        # Check if preferences exist
        existing = db.client.table("user_preferences").select("*").eq("user_id", prefs.user_id).execute()
        
        prefs_data = {
            "user_id": prefs.user_id,
            "preferred_language": prefs.preferred_language,
            "timezone": prefs.timezone,
            "notification_language": prefs.notification_language
        }
        
        if existing.data:
            # Update
            result = db.client.table("user_preferences").update(prefs_data).eq("user_id", prefs.user_id).execute()
        else:
            # Insert
            result = db.client.table("user_preferences").insert(prefs_data).execute()
        
        return {
            "success": True,
            "preferences": result.data[0] if result.data else prefs_data
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ============================================
# AI ASSISTANT ENDPOINTS
# ============================================

class ChatRequest(BaseModel):
    message: str
    conversation_history: Optional[List[dict]] = []

@app.post("/ai/chat")
async def ai_chat(request: ChatRequest):
    """AI Assistant chat endpoint using Google Gemini"""
    try:
        from ai.chat_assistant import ChatAssistant
        
        assistant = ChatAssistant()
        response_text = assistant.chat(request.message, request.conversation_history)
        
        return {
            "success": True,
            "response": response_text
        }
    except Exception as e:
        print(f"AI Chat error: {e}")
        return {
            "success": False,
            "error": str(e),
            "response": "I apologize, but I'm having trouble responding right now. Please try again."
        }