"""Main scraper entry point"""
import asyncio
import sys
from core.database import Database
from core.scraper import GenericScraper
from ai.classifier import AIProcessor
from parsers.pdf_parser import PDFParser
from alerts.alert_manager import AlertManager
import os
from datetime import datetime

async def scrape_source(source: dict, db: Database, ai: AIProcessor, pdf_parser: PDFParser, alert_manager: AlertManager):
    """Scrape a single source"""
    async with GenericScraper(source, db) as scraper:
        result = await scraper.run()
        
        # If new notices were found, send alerts
        if result.get("success") and result.get("new", 0) > 0:
            # Get the newly created notices
            # (In production, track which notices were just created)
            # For now, we'll skip auto-alerts to avoid spam during testing
            pass
        
        return result

async def scrape_all_sources():
    """Scrape all active sources"""
    print("=" * 60)
    print("🚀 InfoMe Scraper Starting")
    print(f"⏰ {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print("=" * 60)
    
    # Initialize
    db = Database()
    ai = AIProcessor(use_gemini=False)  # Set to True to use Gemini
    pdf_parser = PDFParser()
    alert_manager = AlertManager(db)
    
    # Get active sources
    sources = db.get_active_sources()
    print(f"\n📋 Found {len(sources)} active sources to scrape\n")
    
    if not sources:
        print("⚠️  No active sources found. Add sources to the database first.")
        return
    
    # Scrape each source
    results = []
    for source in sources:
        result = await scrape_source(source, db, ai, pdf_parser, alert_manager)
        results.append(result)
        await asyncio.sleep(2)  # Be nice to servers
    
    # Send deadline reminders
    await alert_manager.send_deadline_reminders()
    
    # Summary
    print("\n" + "=" * 60)
    print("📊 SCRAPING SUMMARY")
    print("=" * 60)
    
    total_found = sum(r.get("found", 0) for r in results if r.get("success"))
    total_new = sum(r.get("new", 0) for r in results if r.get("success"))
    successful = sum(1 for r in results if r.get("success"))
    failed = len(results) - successful
    
    print(f"✅ Successful: {successful}/{len(results)}")
    print(f"❌ Failed: {failed}/{len(results)}")
    print(f"📄 Total notices found: {total_found}")
    print(f"🆕 New notices: {total_new}")
    print("=" * 60)

async def test_single_source(source_name: str):
    """Test scraping a single source by name"""
    db = Database()
    ai = AIProcessor(use_gemini=False)
    pdf_parser = PDFParser()
    alert_manager = AlertManager(db)
    
    # Find source
    sources = db.get_active_sources()
    source = next((s for s in sources if source_name.lower() in s["name"].lower()), None)
    
    if not source:
        print(f"❌ Source '{source_name}' not found")
        print(f"Available sources: {', '.join(s['name'] for s in sources)}")
        return
    
    print(f"🧪 Testing scraper for: {source['name']}")
    result = await scrape_source(source, db, ai, pdf_parser, alert_manager)
    print(f"\n✅ Test complete: {result}")

def main():
    """Main entry point"""
    if len(sys.argv) > 1:
        # Test mode: scrape specific source
        source_name = " ".join(sys.argv[1:])
        asyncio.run(test_single_source(source_name))
    else:
        # Normal mode: scrape all sources
        asyncio.run(scrape_all_sources())

if __name__ == "__main__":
    main()
