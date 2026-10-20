"""Automated scraper scheduler"""
from apscheduler.schedulers.asyncio import AsyncIOScheduler
from apscheduler.triggers.interval import IntervalTrigger
from apscheduler.triggers.cron import CronTrigger
import asyncio
import sys
import os
from dotenv import load_dotenv

# Add parent directory to path
sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

load_dotenv()
SCRAPER_INTERVAL_MINUTES = int(os.getenv("SCRAPER_INTERVAL_MINUTES", "30"))

from main import scrape_all_sources

class ScraperScheduler:
    def __init__(self):
        self.scheduler = AsyncIOScheduler()
    
    def start(self):
        """Start the scheduler"""
        print("🕐 Starting InfoMe Scheduler")
        print(f"⏱️  Scraping interval: {SCRAPER_INTERVAL_MINUTES} minutes")
        
        # Schedule scraping job
        self.scheduler.add_job(
            scrape_all_sources,
            trigger=IntervalTrigger(minutes=SCRAPER_INTERVAL_MINUTES),
            id='scrape_all',
            name='Scrape all sources',
            replace_existing=True
        )
        
        # Optional: Schedule specific times for important sources
        # Example: Run AKTU scraper every day at 9 AM
        # self.scheduler.add_job(
        #     scrape_aktu,
        #     trigger=CronTrigger(hour=9, minute=0),
        #     id='scrape_aktu_daily',
        #     name='Daily AKTU scrape'
        # )
        
        self.scheduler.start()
        print("✅ Scheduler started successfully")
        print("Press Ctrl+C to stop\n")
        
        # Run immediately on start
        asyncio.create_task(scrape_all_sources())
        
        # Keep running
        try:
            asyncio.get_event_loop().run_forever()
        except (KeyboardInterrupt, SystemExit):
            print("\n🛑 Stopping scheduler...")
            self.scheduler.shutdown()
            print("✅ Scheduler stopped")

if __name__ == "__main__":
    scheduler = ScraperScheduler()
    scheduler.start()
