"""Base scraper class"""
import aiohttp
import asyncio
from bs4 import BeautifulSoup
from typing import List, Dict, Optional
from datetime import datetime
import time
from .config import USER_AGENT
from .database import Database

class BaseScraper:
    def __init__(self, source: Dict, db: Database):
        self.source = source
        self.db = db
        self.session: Optional[aiohttp.ClientSession] = None
        self.headers = {
            "User-Agent": USER_AGENT,
            "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
            "Accept-Language": "en-US,en;q=0.5",
            "Accept-Encoding": "gzip, deflate",
            "Connection": "keep-alive",
        }
    
    async def __aenter__(self):
        self.session = aiohttp.ClientSession(headers=self.headers)
        return self
    
    async def __aexit__(self, exc_type, exc_val, exc_tb):
        if self.session:
            await self.session.close()
    
    async def fetch_html(self, url: str, timeout: int = 30) -> Optional[str]:
        """Fetch HTML content from URL"""
        try:
            async with self.session.get(url, timeout=timeout) as response:
                if response.status == 200:
                    return await response.text()
                else:
                    print(f"Failed to fetch {url}: Status {response.status}")
                    return None
        except Exception as e:
            print(f"Error fetching {url}: {str(e)}")
            return None
    
    async def fetch_pdf(self, url: str, save_path: str) -> bool:
        """Download PDF file"""
        try:
            async with self.session.get(url) as response:
                if response.status == 200:
                    with open(save_path, 'wb') as f:
                        f.write(await response.read())
                    return True
                return False
        except Exception as e:
            print(f"Error downloading PDF {url}: {str(e)}")
            return False
    
    def parse_html(self, html: str) -> BeautifulSoup:
        """Parse HTML with BeautifulSoup"""
        return BeautifulSoup(html, 'lxml')
    
    async def scrape(self) -> List[Dict]:
        """
        Main scrape method - override in subclasses
        Returns list of notice dictionaries
        """
        raise NotImplementedError("Subclasses must implement scrape()")
    
    async def run(self) -> Dict:
        """Execute the scraper and log results"""
        start_time = time.time()
        source_id = self.source["id"]
        source_name = self.source["name"]
        
        print(f"\n🔍 Starting scraper for: {source_name}")
        
        try:
            # Run the scraper
            notices = await self.scrape()
            
            # Save notices to database
            new_count = 0
            for notice_data in notices:
                # Add source_id
                notice_data["source_id"] = source_id
                
                # Create notice
                created = self.db.create_notice(notice_data)
                if created:
                    new_count += 1
                    print(f"  ✅ New notice: {notice_data['title'][:60]}...")
            
            # Update source
            self.db.update_source_last_checked(source_id)
            if new_count > 0:
                self.db.increment_source_notice_count(source_id, new_count)
            
            # Log success
            duration_ms = int((time.time() - start_time) * 1000)
            self.db.log_scraper_run(
                source_id=source_id,
                status="success",
                message=f"Found {len(notices)} notices, {new_count} new",
                notices_found=len(notices),
                notices_new=new_count,
                duration_ms=duration_ms
            )
            
            print(f"✅ Completed {source_name}: {new_count}/{len(notices)} new notices in {duration_ms}ms")
            
            return {
                "success": True,
                "source": source_name,
                "found": len(notices),
                "new": new_count,
                "duration_ms": duration_ms
            }
            
        except Exception as e:
            # Log failure
            duration_ms = int((time.time() - start_time) * 1000)
            error_msg = str(e)
            
            self.db.log_scraper_run(
                source_id=source_id,
                status="failed",
                message=f"Scraper failed: {error_msg}",
                duration_ms=duration_ms,
                error_details={"error": error_msg}
            )
            
            print(f"❌ Failed {source_name}: {error_msg}")
            
            return {
                "success": False,
                "source": source_name,
                "error": error_msg,
                "duration_ms": duration_ms
            }


class GenericScraper(BaseScraper):
    """Generic scraper for simple HTML pages"""
    
    async def scrape(self) -> List[Dict]:
        """
        Generic scraping logic
        Override selectors in source metadata
        """
        url = self.source["url"]
        html = await self.fetch_html(url)
        
        if not html:
            return []
        
        soup = self.parse_html(html)
        notices = []
        
        # Example: Find all links with "notice" or "notification" in text
        links = soup.find_all('a', href=True)
        
        for link in links:
            text = link.get_text(strip=True)
            href = link['href']
            
            # Filter for notice-like content
            if any(keyword in text.lower() for keyword in ['notice', 'notification', 'circular', 'announcement', 'tender', 'scholarship', 'exam', 'result']):
                # Make absolute URL
                if not href.startswith('http'):
                    from urllib.parse import urljoin
                    href = urljoin(url, href)
                
                notices.append({
                    "title": text,
                    "description": None,
                    "summary": None,
                    "category": self._guess_category(text),
                    "department": self.source["name"],
                    "urgency": "medium",
                    "external_url": href,
                    "pdf_url": href if href.endswith('.pdf') else None
                })
        
        return notices[:20]  # Limit to 20 per run
    
    @staticmethod
    def _guess_category(text: str) -> str:
        """Guess category from text"""
        text_lower = text.lower()
        
        if any(word in text_lower for word in ['scholarship', 'fellowship']):
            return "Scholarships"
        elif any(word in text_lower for word in ['job', 'recruitment', 'vacancy', 'hiring']):
            return "Jobs"
        elif any(word in text_lower for word in ['exam', 'test', 'admit card']):
            return "Exams"
        elif any(word in text_lower for word in ['result', 'score']):
            return "Results"
        elif any(word in text_lower for word in ['admission', 'enrollment']):
            return "Admissions"
        elif any(word in text_lower for word in ['tender', 'bid', 'contract']):
            return "Tenders"
        elif any(word in text_lower for word in ['alert', 'warning', 'emergency', 'flood', 'disaster']):
            return "Civic Alerts"
        else:
            return "General"
