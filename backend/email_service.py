import resend
import os
from typing import Dict, Any
from dotenv import load_dotenv
from pathlib import Path

# Load environment variables
ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# Configure Resend
resend.api_key = os.getenv('EMAIL_PROVIDER_API_KEY')

class EmailService:
    @staticmethod
    def send_pending_approval_notification(user_email: str, user_name: str) -> Dict[str, Any]:
        """Send pending approval email to user"""
        try:
            first_name = user_name.split()[0] if user_name else "there"
            
            r = resend.Emails.send({
                "from": os.getenv('FROM_EMAIL', 'melaninbankteam@gmail.com'),
                "to": [user_email],  # Must be a list
                "subject": "Thanks for signing up — your account is pending approval",
                "html": f"""
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                    <p>Hi {first_name},</p>
                    <p>Thanks for joining Content Strategy Planner 🎉. Your account is pending approval. You'll be notified when approved.</p>
                    <p>Best regards,<br>The Content Strategy Planner Team</p>
                </div>
                """
            })
            return {"success": True, "id": r}
        except Exception as e:
            return {"success": False, "error": str(e)}
    
    @staticmethod
    def send_approval_notification(user_email: str, user_name: str) -> Dict[str, Any]:
        """Send approval email to user"""
        try:
            first_name = user_name.split()[0] if user_name else "there"
            r = resend.Emails.send({
                "from": os.getenv('FROM_EMAIL', 'melaninbankteam@gmail.com'),
                "to": [user_email],  # Must be a list
                "subject": "You're in! Welcome to Content Strategy Planner 🚀",
                "html": f"""
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                    <p>Hi {first_name},</p>
                    <p>Your account has been approved! Log in 👉 <a href="https://contentstrategyplanner.emergent.host/login" style="color: #472816; text-decoration: none;">https://contentstrategyplanner.emergent.host/login</a> and start planning your content.</p>
                    <p>Best regards,<br>The Content Strategy Planner Team</p>
                </div>
                """
            })
            return {"success": True, "id": r}
        except Exception as e:
            return {"success": False, "error": str(e)}
    
    @staticmethod
    def send_denial_notification(user_email: str, user_name: str) -> Dict[str, Any]:
        """Send denial email to user"""
        try:
            first_name = user_name.split()[0] if user_name else "there"
            r = resend.Emails.send({
                "from": os.getenv('FROM_EMAIL', 'melaninbankteam@gmail.com'),
                "to": [user_email],  # Must be a list
                "subject": "Action needed — complete your Melanin Bank membership to access Content Strategy Planner",
                "html": f"""
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                    <p>Hi {first_name},</p>
                    <p>Access is reserved for members of the Melanin Bank Community.</p>
                    <p>Sign up at <a href="https://themelaninbank.com" style="color: #472816; text-decoration: none;">https://themelaninbank.com</a></p>
                    <p>If you're already a member, confirm you used the same email here.</p>
                    <p>If still stuck, email us at <a href="mailto:themelaninbankteam@gmail.com" style="color: #472816;">themelaninbankteam@gmail.com</a></p>
                    <p>Once confirmed, we'll approve your account.</p>
                    <p>Best regards,<br>The Content Strategy Planner Team</p>
                </div>
                """
            })
            return {"success": True, "id": r}
        except Exception as e:
            return {"success": False, "error": str(e)}