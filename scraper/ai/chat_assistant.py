"""AI Chat Assistant using Google Gemini"""
import requests
import os
from typing import List, Dict, Optional
from dotenv import load_dotenv

load_dotenv()
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

class ChatAssistant:
    def __init__(self):
        if not GEMINI_API_KEY:
            raise ValueError("GEMINI_API_KEY not found in environment")
        
        self.api_key = GEMINI_API_KEY
        self.model_name = "gemini-2.5-flash"
        self.api_url = f"https://generativelanguage.googleapis.com/v1beta/models/{self.model_name}:generateContent"
        self.system_context = "You are InfoMe AI Assistant. Help with Indian government notices, scholarships, exams, and jobs."
    
    def chat(self, message: str, conversation_history: Optional[List[Dict]] = None) -> str:
        conversation_text = ""
        if conversation_history:
            for msg in conversation_history[-5:]:
                role = "User" if msg['role'] == 'user' else "Assistant"
                conversation_text += f"{role}: {msg['content']}\n"
        
        prompt = f"{self.system_context}\n\n{conversation_text}\nUser: {message}\nAssistant:"
        
        try:
            payload = {"contents": [{"parts": [{"text": prompt}]}]}
            response = requests.post(self.api_url, params={"key": self.api_key}, json=payload, headers={"Content-Type": "application/json"}, timeout=30)
            response.raise_for_status()
            result_data = response.json()
            return result_data["candidates"][0]["content"]["parts"][0]["text"].strip()
        except Exception as e:
            print(f"Chat error: {e}")
            return "I apologize, but I'm having trouble responding right now. Please try again."
