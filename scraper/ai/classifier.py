"""AI-powered notice classification and processing"""
import openai
from typing import Dict, Optional, List
import dateparser
import re
from datetime import datetime
import os
from dotenv import load_dotenv

load_dotenv()
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

# Try to import google.generativeai - may fail due to gRPC DLL issues
try:
    import google.generativeai as genai
    GENAI_AVAILABLE = True
except ImportError as e:
    print(f"⚠️  WARNING: google.generativeai not available: {e}")
    GENAI_AVAILABLE = False
    genai = None

class AIProcessor:
    def __init__(self, use_gemini: bool = False):
        self.use_gemini = use_gemini
        
        if use_gemini and GEMINI_API_KEY and GENAI_AVAILABLE:
            genai.configure(api_key=GEMINI_API_KEY)
            # Using Gemini 2.5 Flash - Fast, free, and large context window (1M tokens)
            self.model = genai.GenerativeModel('gemini-2.5-flash')
        elif use_gemini and not GENAI_AVAILABLE:
            print("⚠️  Gemini requested but google.generativeai not available, falling back to OpenAI")
            if OPENAI_API_KEY:
                openai.api_key = OPENAI_API_KEY
                self.use_gemini = False
            else:
                raise ValueError("No AI API key configured and Gemini not available")
        elif OPENAI_API_KEY:
            openai.api_key = OPENAI_API_KEY
            self.use_gemini = False
        else:
            raise ValueError("No AI API key configured")
    
    def process_notice(self, title: str, description: str = "", pdf_text: str = "") -> Dict:
        """
        Process a notice with AI:
        - Classify category
        - Extract deadline
        - Generate summary
        - Determine urgency
        """
        full_text = f"{title}\n\n{description}\n\n{pdf_text}"[:4000]  # Limit text
        
        return {
            "category": self.classify_category(title, description),
            "summary": self.generate_summary(full_text),
            "deadline": self.extract_deadline(full_text),
            "urgency": self.determine_urgency(full_text),
        }
    
    def classify_category(self, title: str, description: str = "") -> str:
        """Classify notice into category"""
        text = f"{title} {description}".lower()
        
        # Rule-based classification (fast)
        if any(word in text for word in ['scholarship', 'fellowship', 'stipend']):
            return "Scholarships"
        elif any(word in text for word in ['job', 'recruitment', 'vacancy', 'hiring', 'employment']):
            return "Jobs"
        elif any(word in text for word in ['exam', 'test', 'admit card', 'hall ticket']):
            return "Exams"
        elif any(word in text for word in ['result', 'score', 'marks']):
            return "Results"
        elif any(word in text for word in ['admission', 'enrollment', 'registration']):
            return "Admissions"
        elif any(word in text for word in ['tender', 'bid', 'quotation', 'contract']):
            return "Tenders"
        elif any(word in text for word in ['alert', 'warning', 'emergency', 'flood', 'disaster', 'cyclone']):
            return "Civic Alerts"
        else:
            return "General"
    
    def generate_summary(self, text: str) -> str:
        """Generate AI summary of notice"""
        if len(text) < 100:
            return text
        
        try:
            if self.use_gemini:
                return self._generate_summary_gemini(text)
            else:
                return self._generate_summary_openai(text)
        except Exception as e:
            print(f"  ⚠️ AI summary failed: {str(e)}")
            # Fallback: first 200 chars
            return text[:200] + "..."
    
    def _generate_summary_openai(self, text: str) -> str:
        """Generate summary using OpenAI"""
        response = openai.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=[
                {"role": "system", "content": "You are a helpful assistant that summarizes Indian government and university notices in 2-3 short sentences. Be concise and highlight key information like deadlines, amounts, and eligibility."},
                {"role": "user", "content": f"Summarize this notice:\n\n{text}"}
            ],
            max_tokens=150,
            temperature=0.3
        )
        return response.choices[0].message.content.strip()
    
    def _generate_summary_gemini(self, text: str) -> str:
        """Generate summary using Gemini"""
        if not GENAI_AVAILABLE or not self.use_gemini:
            # Fallback to simple truncation
            return text[:200] + "..."
        
        prompt = f"Summarize this Indian government/university notice in 2-3 short sentences. Be concise and highlight key information:\n\n{text}"
        response = self.model.generate_content(prompt)
        return response.text.strip()
    
    def extract_deadline(self, text: str) -> Optional[str]:
        """Extract deadline date from text"""
        # Common deadline patterns
        patterns = [
            r'last date[:\s]+(\d{1,2}[/-]\d{1,2}[/-]\d{2,4})',
            r'deadline[:\s]+(\d{1,2}[/-]\d{1,2}[/-]\d{2,4})',
            r'before[:\s]+(\d{1,2}[/-]\d{1,2}[/-]\d{2,4})',
            r'by[:\s]+(\d{1,2}[/-]\d{1,2}[/-]\d{2,4})',
            r'(\d{1,2}[/-]\d{1,2}[/-]\d{2,4})',
        ]
        
        text_lower = text.lower()
        
        for pattern in patterns:
            matches = re.findall(pattern, text_lower, re.IGNORECASE)
            if matches:
                # Try to parse the date
                for match in matches:
                    parsed = dateparser.parse(match, settings={'PREFER_DATES_FROM': 'future'})
                    if parsed and parsed > datetime.now():
                        return parsed.isoformat()
        
        # Try dateparser on full text (slower but more accurate)
        try:
            # Look for date-like phrases
            date_phrases = re.findall(r'(?:last date|deadline|before|by)[:\s]+([^\n.]+)', text_lower, re.IGNORECASE)
            for phrase in date_phrases[:3]:  # Check first 3 matches
                parsed = dateparser.parse(phrase, settings={'PREFER_DATES_FROM': 'future'})
                if parsed and parsed > datetime.now():
                    return parsed.isoformat()
        except:
            pass
        
        return None
    
    def determine_urgency(self, text: str) -> str:
        """Determine urgency level"""
        text_lower = text.lower()
        
        # Critical keywords
        if any(word in text_lower for word in ['urgent', 'emergency', 'immediate', 'critical', 'alert', 'warning']):
            return "critical"
        
        # Check deadline proximity
        deadline = self.extract_deadline(text)
        if deadline:
            try:
                deadline_date = datetime.fromisoformat(deadline.replace('Z', '+00:00'))
                days_left = (deadline_date - datetime.now()).days
                
                if days_left <= 3:
                    return "critical"
                elif days_left <= 7:
                    return "high"
                elif days_left <= 14:
                    return "medium"
            except:
                pass
        
        # High priority keywords
        if any(word in text_lower for word in ['important', 'last date', 'deadline', 'final']):
            return "high"
        
        return "medium"
    
    def translate_to_english(self, text: str) -> str:
        """Translate Hindi/regional text to English"""
        try:
            from langdetect import detect
            
            lang = detect(text)
            if lang == 'en':
                return text
            
            # Use AI for translation
            if self.use_gemini and GENAI_AVAILABLE:
                prompt = f"Translate this to English:\n\n{text}"
                response = self.model.generate_content(prompt)
                return response.text.strip()
            elif OPENAI_API_KEY:
                response = openai.chat.completions.create(
                    model="gpt-3.5-turbo",
                    messages=[
                        {"role": "system", "content": "Translate the following text to English."},
                        {"role": "user", "content": text}
                    ],
                    max_tokens=500
                )
                return response.choices[0].message.content.strip()
            else:
                return text
        except:
            return text
