# InfoMe Scraper Engine

Python-based web scraper for automatically collecting notices from government portals, universities, and civic bodies.

## Features

- ✅ Async scraping with aiohttp
- ✅ PDF text extraction (PyMuPDF)
- ✅ OCR for scanned PDFs (Tesseract)
- ✅ AI classification (OpenAI/Gemini)
- ✅ Deadline extraction
- ✅ AI summarization
- ✅ Duplicate detection (hash-based)
- ✅ Automated scheduling
- ✅ Supabase integration

## Setup

### 1. Install Python Dependencies

```bash
cd scraper
pip install -r requirements.txt
```

### 2. Install Tesseract OCR (for scanned PDFs)

**Windows:**
- Download from: https://github.com/UB-Mannheim/tesseract/wiki
- Install to `C:\Program Files\Tesseract-OCR`
- Add to PATH

**Mac:**
```bash
brew install tesseract
```

**Linux:**
```bash
sudo apt-get install tesseract-ocr
```

### 3. Install Playwright (for JS-rendered pages)

```bash
playwright install
```

### 4. Configure Environment

Copy `.env.example` to `.env` and fill in:

```bash
cp .env.example .env
```

Required variables:
```
SUPABASE_URL=your_supabase_url
SUPABASE_KEY=your_supabase_service_role_key  # NOT anon key!
OPENAI_API_KEY=your_openai_key  # OR
GEMINI_API_KEY=your_gemini_key
```

## Usage

### Run Once (Manual)

Scrape all active sources:
```bash
python main.py
```

Test a specific source:
```bash
python main.py "AKTU"
python main.py "National Scholarship"
```

### Run Continuously (Scheduled)

Start the scheduler (runs every 30 minutes by default):
```bash
python scheduler/scheduler.py
```

Configure interval in `.env`:
```
SCRAPER_INTERVAL_MINUTES=30
```

## Architecture

```
scraper/
├── core/
│   ├── config.py          # Configuration management
│   ├── database.py        # Supabase operations
│   └── scraper.py         # Base scraper class
├── parsers/
│   └── pdf_parser.py      # PDF text extraction + OCR
├── ai/
│   └── classifier.py      # AI classification, summarization
├── scheduler/
│   └── scheduler.py       # Automated scheduling
├── workers/
│   └── (custom scrapers)  # Source-specific scrapers
└── main.py                # Entry point
```

## How It Works

### 1. Scraping Flow

```
1. Get active sources from database
2. For each source:
   a. Fetch HTML
   b. Parse with BeautifulSoup
   c. Extract notice links
   d. Download PDFs (if any)
   e. Extract text (with OCR fallback)
   f. Process with AI
   g. Save to database
3. Log results
```

### 2. AI Processing

For each notice:
- **Classify** into category (Scholarships, Jobs, Exams, etc.)
- **Extract** deadline dates
- **Generate** 2-3 sentence summary
- **Determine** urgency (critical/high/medium/low)

### 3. Duplicate Detection

Uses SHA-256 hash of `title + description` to prevent duplicates.

## Creating Custom Scrapers

For complex sources, create a custom scraper:

```python
# scraper/workers/aktu_scraper.py
from core.scraper import BaseScraper

class AKTUScraper(BaseScraper):
    async def scrape(self):
        url = self.source["url"]
        html = await self.fetch_html(url)
        soup = self.parse_html(html)
        
        notices = []
        
        # Custom parsing logic
        for item in soup.select('.notice-item'):
            title = item.select_one('.title').text
            link = item.select_one('a')['href']
            
            notices.append({
                "title": title,
                "external_url": link,
                "category": "Exams",
                "urgency": "high"
            })
        
        return notices
```

Register in `main.py`:
```python
from workers.aktu_scraper import AKTUScraper

# In scrape_source():
if source["name"] == "AKTU Lucknow":
    scraper = AKTUScraper(source, db)
else:
    scraper = GenericScraper(source, db)
```

## Database Operations

The scraper uses these database functions:

```python
from core.database import Database

db = Database()

# Get sources
sources = db.get_active_sources()

# Create notice
notice = db.create_notice({
    "title": "AKTU Exam Schedule 2026",
    "description": "...",
    "category": "Exams",
    "source_id": "...",
    "urgency": "high"
})

# Log scraper run
db.log_scraper_run(
    source_id="...",
    status="success",
    notices_found=10,
    notices_new=3
)
```

## Monitoring

### View Logs

Check `scraper_logs` table in Supabase:
```sql
SELECT * FROM scraper_logs ORDER BY created_at DESC LIMIT 20;
```

### Check Last Run

```sql
SELECT name, last_checked, notice_count 
FROM sources 
WHERE is_active = true;
```

## Deployment

### Option 1: Railway

1. Create `railway.json`:
```json
{
  "build": {
    "builder": "NIXPACKS"
  },
  "deploy": {
    "startCommand": "python scheduler/scheduler.py"
  }
}
```

2. Deploy:
```bash
railway up
```

### Option 2: Docker

```dockerfile
FROM python:3.11-slim

WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt

# Install Tesseract
RUN apt-get update && apt-get install -y tesseract-ocr

COPY . .

CMD ["python", "scheduler/scheduler.py"]
```

Build and run:
```bash
docker build -t infome-scraper .
docker run -d --env-file .env infome-scraper
```

### Option 3: Cron Job (Linux)

```bash
# Edit crontab
crontab -e

# Add line (runs every 30 minutes)
*/30 * * * * cd /path/to/scraper && python main.py >> /var/log/infome-scraper.log 2>&1
```

## Troubleshooting

### "No module named 'core'"
```bash
# Run from scraper directory
cd scraper
python main.py
```

### "Tesseract not found"
- Install Tesseract OCR
- Set path in `parsers/pdf_parser.py`:
```python
pytesseract.pytesseract.tesseract_cmd = r'C:\Program Files\Tesseract-OCR\tesseract.exe'
```

### "OpenAI API error"
- Check API key in `.env`
- Verify you have credits
- Try Gemini instead: `AIProcessor(use_gemini=True)`

### "Supabase connection failed"
- Use SERVICE_ROLE key, not anon key
- Check URL is correct
- Verify network access

## Performance Tips

1. **Limit concurrent scrapers**:
```python
# In main.py
semaphore = asyncio.Semaphore(5)  # Max 5 concurrent
```

2. **Cache results**:
```python
# Skip recently checked sources
if source["last_checked"] > (now - timedelta(hours=1)):
    continue
```

3. **Batch database operations**:
```python
# Insert multiple notices at once
db.client.table("notices").insert(notices).execute()
```

## Next Steps

- [ ] Add more source-specific scrapers
- [ ] Implement retry logic for failed scrapes
- [ ] Add webhook notifications
- [ ] Create admin dashboard for monitoring
- [ ] Add rate limiting per source
- [ ] Implement proxy rotation

## Support

For issues or questions, check:
- Scraper logs in database
- Console output
- Supabase logs
