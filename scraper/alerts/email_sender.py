"""Email alerts using Resend"""
import aiohttp
from typing import Dict, List, Optional
import os
from dotenv import load_dotenv

load_dotenv()
RESEND_API_KEY = os.getenv("RESEND_API_KEY")

class EmailSender:
    def __init__(self):
        self.api_key = RESEND_API_KEY
        self.base_url = "https://api.resend.com"
        self.from_email = "InfoMe <alerts@infome.com>"  # Configure your domain
    
    async def send_email(
        self,
        to: str,
        subject: str,
        html: str,
        text: Optional[str] = None
    ) -> bool:
        """Send an email"""
        url = f"{self.base_url}/emails"
        
        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json"
        }
        
        payload = {
            "from": self.from_email,
            "to": [to],
            "subject": subject,
            "html": html
        }
        
        if text:
            payload["text"] = text
        
        try:
            async with aiohttp.ClientSession() as session:
                async with session.post(url, json=payload, headers=headers) as response:
                    if response.status in [200, 201]:
                        return True
                    else:
                        error = await response.text()
                        print(f"Email error: {error}")
                        return False
        except Exception as e:
            print(f"Failed to send email: {str(e)}")
            return False
    
    async def send_notice_alert(self, to: str, notice: Dict) -> bool:
        """Send a formatted notice alert email"""
        subject = f"🔔 New Notice: {notice['title']}"
        
        # HTML email template
        html = f"""
<!DOCTYPE html>
<html>
<head>
    <style>
        body {{ font-family: Arial, sans-serif; line-height: 1.6; color: #333; }}
        .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
        .header {{ background: linear-gradient(135deg, #7c3aed, #6d28d9); color: white; padding: 20px; border-radius: 10px 10px 0 0; }}
        .content {{ background: #f9fafb; padding: 20px; border-radius: 0 0 10px 10px; }}
        .notice-title {{ font-size: 20px; font-weight: bold; margin-bottom: 15px; color: #1f2937; }}
        .badge {{ display: inline-block; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: 600; margin-right: 8px; }}
        .badge-critical {{ background: #fee2e2; color: #dc2626; }}
        .badge-high {{ background: #fef3c7; color: #f59e0b; }}
        .badge-medium {{ background: #dbeafe; color: #2563eb; }}
        .badge-low {{ background: #d1fae5; color: #059669; }}
        .info-row {{ margin: 10px 0; }}
        .info-label {{ font-weight: 600; color: #6b7280; }}
        .summary {{ background: white; padding: 15px; border-left: 4px solid #7c3aed; margin: 15px 0; }}
        .button {{ display: inline-block; background: #7c3aed; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; margin-top: 15px; }}
        .footer {{ text-align: center; margin-top: 20px; color: #6b7280; font-size: 12px; }}
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1 style="margin: 0;">🔔 InfoMe</h1>
            <p style="margin: 5px 0 0 0;">New Notice Alert</p>
        </div>
        <div class="content">
            <div class="notice-title">{notice['title']}</div>
            
            <div>
                <span class="badge badge-{notice.get('urgency', 'medium')}">{notice.get('urgency', 'medium').upper()}</span>
                <span class="badge" style="background: #e0e7ff; color: #4f46e5;">{notice.get('category', 'General')}</span>
            </div>
            
            <div class="info-row">
                <span class="info-label">🏢 Department:</span> {notice.get('department', 'N/A')}
            </div>
"""
        
        if notice.get('last_date'):
            html += f"""
            <div class="info-row">
                <span class="info-label">⏰ Deadline:</span> <strong>{notice['last_date']}</strong>
            </div>
"""
        
        if notice.get('amount'):
            html += f"""
            <div class="info-row">
                <span class="info-label">💰 Amount:</span> <strong>{notice['amount']}</strong>
            </div>
"""
        
        if notice.get('summary'):
            html += f"""
            <div class="summary">
                <strong>📝 Summary:</strong><br>
                {notice['summary']}
            </div>
"""
        
        if notice.get('external_url'):
            html += f"""
            <a href="{notice['external_url']}" class="button">View Full Notice →</a>
"""
        
        html += """
            <div class="footer">
                <p>You're receiving this because you subscribed to InfoMe.</p>
                <p><a href="#">Unsubscribe</a> | <a href="#">Manage Preferences</a></p>
            </div>
        </div>
    </div>
</body>
</html>
"""
        
        # Plain text fallback
        text = f"""
{notice['title']}

Category: {notice.get('category', 'General')}
Department: {notice.get('department', 'N/A')}
"""
        
        if notice.get('summary'):
            text += f"\nSummary: {notice['summary']}\n"
        
        if notice.get('last_date'):
            text += f"\nDeadline: {notice['last_date']}"
        
        if notice.get('external_url'):
            text += f"\n\nView: {notice['external_url']}"
        
        text += "\n\n-- InfoMe"
        
        return await self.send_email(to, subject, html, text)
    
    async def send_deadline_reminder(
        self,
        to: str,
        notice: Dict,
        days_left: int
    ) -> bool:
        """Send a deadline reminder email"""
        subject = f"⏰ Reminder: {days_left} day{'s' if days_left != 1 else ''} left - {notice['title']}"
        
        html = f"""
<!DOCTYPE html>
<html>
<head>
    <style>
        body {{ font-family: Arial, sans-serif; line-height: 1.6; color: #333; }}
        .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
        .urgent {{ background: #fee2e2; border-left: 4px solid #dc2626; padding: 20px; border-radius: 8px; }}
        .days-left {{ font-size: 32px; font-weight: bold; color: #dc2626; margin: 10px 0; }}
        .button {{ display: inline-block; background: #dc2626; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; margin-top: 15px; }}
    </style>
</head>
<body>
    <div class="container">
        <div class="urgent">
            <h2 style="margin-top: 0;">⏰ Deadline Reminder</h2>
            <p><strong>{notice['title']}</strong></p>
            <div class="days-left">{days_left} day{'s' if days_left != 1 else ''} left!</div>
            <p>Don't miss this opportunity. Apply before the deadline.</p>
            <a href="{notice.get('external_url', '#')}" class="button">Apply Now →</a>
        </div>
    </div>
</body>
</html>
"""
        
        return await self.send_email(to, subject, html)
    
    async def send_digest(self, to: str, notices: List[Dict]) -> bool:
        """Send a daily/weekly digest of notices"""
        subject = f"📬 Your InfoMe Digest - {len(notices)} New Notices"
        
        html = f"""
<!DOCTYPE html>
<html>
<head>
    <style>
        body {{ font-family: Arial, sans-serif; line-height: 1.6; color: #333; }}
        .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
        .header {{ background: linear-gradient(135deg, #7c3aed, #6d28d9); color: white; padding: 20px; border-radius: 10px; text-align: center; }}
        .notice-item {{ background: #f9fafb; padding: 15px; margin: 10px 0; border-radius: 8px; border-left: 4px solid #7c3aed; }}
        .notice-title {{ font-weight: bold; color: #1f2937; margin-bottom: 5px; }}
        .notice-meta {{ font-size: 13px; color: #6b7280; }}
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1 style="margin: 0;">📬 Your Notice Digest</h1>
            <p style="margin: 5px 0 0 0;">{len(notices)} new notices this week</p>
        </div>
        <div style="margin-top: 20px;">
"""
        
        for notice in notices[:10]:  # Limit to 10
            html += f"""
            <div class="notice-item">
                <div class="notice-title">{notice['title']}</div>
                <div class="notice-meta">
                    {notice.get('category', 'General')} • {notice.get('department', 'N/A')}
                </div>
            </div>
"""
        
        html += """
        </div>
        <div style="text-align: center; margin-top: 20px;">
            <a href="https://infome.com/dashboard" style="display: inline-block; background: #7c3aed; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px;">View All Notices →</a>
        </div>
    </div>
</body>
</html>
"""
        
        return await self.send_email(to, subject, html)
