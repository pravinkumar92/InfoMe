"""Google Gemini AI analyzer for notice extraction"""
import json
import re
from typing import Dict, Optional, List
from datetime import datetime
import os
import requests
from dotenv import load_dotenv

load_dotenv()
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

# Use REST API instead of gRPC to avoid DLL issues
USE_REST_API = True

# Try to import google.generativeai - may fail due to gRPC DLL issues
if not USE_REST_API:
    try:
        import google.generativeai as genai
        GENAI_AVAILABLE = True
    except ImportError as e:
        print(f"⚠️  WARNING: google.generativeai not available: {e}")
        GENAI_AVAILABLE = False
        genai = None
else:
    GENAI_AVAILABLE = True
    genai = None

class GeminiAnalyzer:
    def __init__(self):
        if not GEMINI_API_KEY:
            raise ValueError("GEMINI_API_KEY not found in environment")
        
        self.api_key = GEMINI_API_KEY
        
        if USE_REST_API:
            # Using REST API endpoint with Gemini 2.5 Flash (latest stable model)
            self.model_name = "gemini-2.5-flash"
            self.api_url = f"https://generativelanguage.googleapis.com/v1beta/models/{self.model_name}:generateContent"
        else:
            if not GENAI_AVAILABLE:
                raise ImportError("google.generativeai is not available (gRPC DLL blocked)")
            genai.configure(api_key=GEMINI_API_KEY)
            # Using Gemini 2.5 Flash - Fast, free, and large context window (1M tokens)
            self.model = genai.GenerativeModel('gemini-2.5-flash')
    
    def analyze_notice(self, text: str) -> Dict:
        """Analyze notice text and extract structured information"""
        
        prompt = f"""
You are an AI assistant that extracts structured information from government and educational notices.

Analyze the following notice text and extract information in STRICT JSON format.

Notice Text:
{text}

Extract the following information:

1. **title**: The main title or heading of the notice (string)
2. **summary**: A concise 3-4 line summary of the notice (string)
3. **category**: Classify into one of these categories ONLY: "Scholarships", "Jobs", "Exams", "Results", "Tenders", "Admissions", "Civic Alerts", "General" (string)
4. **issuer**: The organization or department issuing the notice (string)
5. **urgency**: Classify as "low", "medium", "high", or "critical" based on deadlines and importance (string)
6. **important_dates**: Extract ALL dates mentioned with their context (array of objects)
   - Each date object should have:
     - "date": in YYYY-MM-DD format
     - "label": what the date is for (e.g., "Application Deadline", "Exam Date", "Result Date")
     - "type": "deadline", "exam", "result", "event", or "other"
7. **deadline_date**: The most important deadline date in YYYY-MM-DD format (string or null)
8. **amount**: Any monetary amount mentioned (e.g., scholarship amount, salary, fee) (string or null)
9. **eligibility**: Brief eligibility criteria if mentioned (string or null)
10. **key_instructions**: List of 3-5 most important instructions or requirements (array of strings)
11. **contact_info**: Contact details if mentioned (email, phone, website) (object or null)

Return ONLY valid JSON. Do not include any markdown formatting or code blocks.

Example output format:
{{
  "title": "AKTU B.Tech Semester Exam 2026",
  "summary": "Dr. A.P.J. Abdul Kalam Technical University announces the even semester examination schedule for B.Tech students. Exams will commence from April 20, 2026. Students must download admit cards from the official portal.",
  "category": "Exams",
  "issuer": "AKTU Lucknow",
  "urgency": "high",
  "important_dates": [
    {{"date": "2026-04-15", "label": "Admit Card Release", "type": "other"}},
    {{"date": "2026-04-20", "label": "Exam Start Date", "type": "exam"}},
    {{"date": "2026-05-10", "label": "Exam End Date", "type": "exam"}}
  ],
  "deadline_date": "2026-04-15",
  "amount": null,
  "eligibility": "All B.Tech students enrolled in even semester",
  "key_instructions": [
    "Download admit card from official website",
    "Carry valid ID proof to exam center",
    "Report 30 minutes before exam time"
  ],
  "contact_info": {{
    "website": "https://aktu.ac.in",
    "email": "exams@aktu.ac.in"
  }}
}}

Now analyze the notice and return ONLY the JSON output:
"""
        
        try:
            if USE_REST_API:
                # Use REST API
                payload = {
                    "contents": [{
                        "parts": [{"text": prompt}]
                    }]
                }
                
                response = requests.post(
                    self.api_url,
                    params={"key": self.api_key},
                    json=payload,
                    headers={"Content-Type": "application/json"},
                    timeout=30
                )
                response.raise_for_status()
                
                result_data = response.json()
                result_text = result_data["candidates"][0]["content"]["parts"][0]["text"].strip()
            else:
                # Use SDK
                response = self.model.generate_content(prompt)
                result_text = response.text.strip()
            
            # Remove markdown code blocks if present
            result_text = re.sub(r'^```json\s*', '', result_text)
            result_text = re.sub(r'^```\s*', '', result_text)
            result_text = re.sub(r'\s*```$', '', result_text)
            result_text = result_text.strip()
            
            # Parse JSON
            parsed_data = json.loads(result_text)
            
            # Validate and clean data
            cleaned_data = self._validate_and_clean(parsed_data)
            
            return {
                "success": True,
                "data": cleaned_data
            }
        
        except json.JSONDecodeError as e:
            print(f"JSON parsing error: {e}")
            print(f"Raw response: {result_text}")
            
            # Fallback: try to extract basic info
            return {
                "success": False,
                "error": "Failed to parse AI response",
                "data": self._fallback_extraction(text)
            }
        
        except Exception as e:
            print(f"Gemini API error: {e}")
            return {
                "success": False,
                "error": str(e),
                "data": self._fallback_extraction(text)
            }
    
    def _validate_and_clean(self, data: Dict) -> Dict:
        """Validate and clean extracted data"""
        
        # Ensure required fields
        cleaned = {
            "title": data.get("title", "Untitled Notice"),
            "summary": data.get("summary", ""),
            "category": self._validate_category(data.get("category", "General")),
            "issuer": data.get("issuer", "Unknown"),
            "urgency": self._validate_urgency(data.get("urgency", "medium")),
            "important_dates": data.get("important_dates", []),
            "deadline_date": data.get("deadline_date"),
            "amount": data.get("amount"),
            "eligibility": data.get("eligibility"),
            "key_instructions": data.get("key_instructions", []),
            "contact_info": data.get("contact_info")
        }
        
        # Validate dates
        cleaned["important_dates"] = self._validate_dates(cleaned["important_dates"])
        cleaned["deadline_date"] = self._validate_single_date(cleaned["deadline_date"])
        
        return cleaned
    
    def _validate_category(self, category: str) -> str:
        """Validate category against allowed values"""
        valid_categories = [
            "Scholarships", "Jobs", "Exams", "Results", 
            "Tenders", "Admissions", "Civic Alerts", "General"
        ]
        
        if category in valid_categories:
            return category
        
        # Try to match case-insensitively
        for valid in valid_categories:
            if category.lower() == valid.lower():
                return valid
        
        return "General"
    
    def _validate_urgency(self, urgency: str) -> str:
        """Validate urgency level"""
        valid_urgency = ["low", "medium", "high", "critical"]
        
        if urgency.lower() in valid_urgency:
            return urgency.lower()
        
        return "medium"
    
    def _validate_dates(self, dates: List[Dict]) -> List[Dict]:
        """Validate date format"""
        validated = []
        
        for date_obj in dates:
            if isinstance(date_obj, dict) and "date" in date_obj:
                if self._is_valid_date(date_obj["date"]):
                    validated.append(date_obj)
        
        return validated
    
    def _validate_single_date(self, date_str: Optional[str]) -> Optional[str]:
        """Validate single date string"""
        if not date_str:
            return None
        
        if self._is_valid_date(date_str):
            return date_str
        
        return None
    
    def _is_valid_date(self, date_str: str) -> bool:
        """Check if date string is valid YYYY-MM-DD format"""
        try:
            datetime.strptime(date_str, "%Y-%m-%d")
            return True
        except:
            return False
    
    def _fallback_extraction(self, text: str) -> Dict:
        """Fallback extraction when AI fails"""
        
        # Extract title (first line or first 100 chars)
        lines = text.strip().split('\n')
        title = lines[0][:100] if lines else "Untitled Notice"
        
        # Create basic summary
        summary = ' '.join(text.split()[:50]) + "..."
        
        return {
            "title": title,
            "summary": summary,
            "category": "General",
            "issuer": "Unknown",
            "urgency": "medium",
            "important_dates": [],
            "deadline_date": None,
            "amount": None,
            "eligibility": None,
            "key_instructions": [],
            "contact_info": None
        }


# Test function
async def test_gemini():
    """Test Gemini analyzer"""
    
    test_text = """
    AKTU B.Tech Even Semester Examination 2026
    
    Dr. A.P.J. Abdul Kalam Technical University, Lucknow announces the examination schedule
    for B.Tech Even Semester 2025-26.
    
    Important Dates:
    - Admit Card Release: 15th April 2026
    - Examination Start: 20th April 2026
    - Examination End: 10th May 2026
    - Result Declaration: 30th May 2026
    
    Instructions:
    1. Download admit card from official website
    2. Carry valid ID proof
    3. Report 30 minutes before exam
    
    Contact: exams@aktu.ac.in
    Website: https://aktu.ac.in
    """
    
    analyzer = GeminiAnalyzer()
    result = analyzer.analyze_notice(test_text)
    
    print("Analysis Result:")
    print(json.dumps(result, indent=2))

if __name__ == "__main__":
    import asyncio
    asyncio.run(test_gemini())
