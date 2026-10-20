"""AI-powered translation service using Gemini"""
import requests
import json
import os
from typing import Dict, Optional
from dotenv import load_dotenv

load_dotenv()
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

class AITranslator:
    def __init__(self):
        if not GEMINI_API_KEY:
            raise ValueError("GEMINI_API_KEY not found in environment")
        
        self.api_key = GEMINI_API_KEY
        self.model_name = "gemini-2.5-flash"
        self.api_url = f"https://generativelanguage.googleapis.com/v1beta/models/{self.model_name}:generateContent"
        
        self.language_names = {
            'en': 'English',
            'hi': 'Hindi',
            'ur': 'Urdu',
            'bn': 'Bengali'
        }
    
    def translate_text(self, text: str, target_language: str, source_language: str = 'en') -> Optional[str]:
        """Translate text to target language"""
        
        if target_language == source_language:
            return text
        
        target_lang_name = self.language_names.get(target_language, target_language)
        
        prompt = f"""Translate the following text to {target_lang_name}.
Maintain the original meaning, tone, and formatting.
Only return the translated text, nothing else.

Text to translate:
{text}

Translated text:"""
        
        try:
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
            translated_text = result_data["candidates"][0]["content"]["parts"][0]["text"].strip()
            
            return translated_text
        
        except Exception as e:
            print(f"Translation error: {e}")
            return None
    
    def translate_notice(self, notice: Dict, target_language: str) -> Dict:
        """Translate all fields of a notice"""
        
        if target_language == 'en':
            return notice
        
        translated = notice.copy()
        
        # Translate title
        if notice.get('title'):
            translated['title'] = self.translate_text(notice['title'], target_language) or notice['title']
        
        # Translate summary
        if notice.get('summary'):
            translated['summary'] = self.translate_text(notice['summary'], target_language) or notice['summary']
        
        # Translate description
        if notice.get('description'):
            translated['description'] = self.translate_text(notice['description'], target_language) or notice['description']
        
        # Translate category (keep English as fallback)
        if notice.get('category'):
            translated['category_translated'] = self.translate_text(notice['category'], target_language) or notice['category']
        
        return translated
    
    def translate_batch(self, texts: list, target_language: str) -> list:
        """Translate multiple texts at once"""
        
        if target_language == 'en':
            return texts
        
        target_lang_name = self.language_names.get(target_language, target_language)
        
        # Combine texts with markers
        combined_text = "\n---SEPARATOR---\n".join(texts)
        
        prompt = f"""Translate the following texts to {target_lang_name}.
Each text is separated by ---SEPARATOR---
Maintain the original meaning and formatting.
Return the translations in the same order, separated by ---SEPARATOR---

Texts to translate:
{combined_text}

Translated texts:"""
        
        try:
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
            translated_combined = result_data["candidates"][0]["content"]["parts"][0]["text"].strip()
            
            # Split back into individual translations
            translated_texts = translated_combined.split("---SEPARATOR---")
            translated_texts = [t.strip() for t in translated_texts]
            
            # Ensure we have the same number of translations
            if len(translated_texts) == len(texts):
                return translated_texts
            else:
                # Fallback to original if split didn't work
                return texts
        
        except Exception as e:
            print(f"Batch translation error: {e}")
            return texts


# Test function
if __name__ == "__main__":
    translator = AITranslator()
    
    test_text = "AKTU B.Tech Semester Exam 2026. Apply before April 20, 2026."
    
    print("Original (English):", test_text)
    print("\nHindi:", translator.translate_text(test_text, 'hi'))
    print("\nUrdu:", translator.translate_text(test_text, 'ur'))
    print("\nBengali:", translator.translate_text(test_text, 'bn'))
