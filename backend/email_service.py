import resend
import os
from typing import Dict, Any

# Configure Resend
resend.api_key = os.getenv('EMAIL_PROVIDER_API_KEY')

class EmailService:
    @staticmethod
    def send_approval_notification(user_email: str, user_name: str) -> Dict[str, Any]:
        """Send approval email to user"""
        try:
            r = resend.Emails.send({
                "from": os.getenv('FROM_EMAIL', 'melaninbankteam@gmail.com'),
                "to": user_email,
                "subject": "Welcome to Content Strategy Planner! Account Approved",
                "html": f"""
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <h2 style="color: #472816;">Welcome to Content Strategy Planner!</h2>
                    <p>Hi {user_name},</p>
                    <p>Great news! Your account has been approved and you now have full access to Content Strategy Planner.</p>
                    <p>You can now:</p>
                    <ul>
                        <li>Plan and schedule your Instagram content</li>
                        <li>Create content calendars</li>
                        <li>Brainstorm content ideas</li>
                        <li>Track your analytics and growth</li>
                    </ul>
                    <a href="{os.getenv('APP_BASE_URL')}" style="background-color: #472816; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block; margin: 20px 0;">
                        Start Planning Content
                    </a>
                    <p>Happy content creating!</p>
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
            r = resend.Emails.send({
                "from": os.getenv('FROM_EMAIL', 'melaninbankteam@gmail.com'),
                "to": user_email,
                "subject": "Content Strategy Planner - Application Update",
                "html": f"""
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <h2 style="color: #472816;">Content Strategy Planner Application</h2>
                    <p>Hi {user_name},</p>
                    <p>Thank you for your interest in Content Strategy Planner.</p>
                    <p>Unfortunately, we're unable to approve your application at this time. This could be due to capacity limitations or other factors.</p>
                    <p>If you believe this is an error or would like to reapply in the future, please contact our support team.</p>
                    <p>Best regards,<br>The Content Strategy Planner Team</p>
                </div>
                """
            })
            return {"success": True, "id": r}
        except Exception as e:
            return {"success": False, "error": str(e)}
    
    @staticmethod
    def send_pending_approval_notification(user_email: str, user_name: str) -> Dict[str, Any]:
        """Send pending approval email to user"""
        try:
            r = resend.Emails.send({
                "from": os.getenv('FROM_EMAIL', 'melaninbankteam@gmail.com'),
                "to": user_email,
                "subject": "Content Strategy Planner - Account Pending Approval",
                "html": f"""
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <h2 style="color: #472816;">Thank you for joining Content Strategy Planner!</h2>
                    <p>Hi {user_name},</p>
                    <p>Your account has been created successfully and is currently pending approval from our team.</p>
                    <p>We'll review your application and notify you once your account has been approved. This typically takes 1-2 business days.</p>
                    <p>Once approved, you'll have access to:</p>
                    <ul>
                        <li>Advanced content planning tools</li>
                        <li>Instagram preview and scheduling</li>
                        <li>Content brainstorming features</li>
                        <li>Analytics tracking</li>
                    </ul>
                    <p>Thank you for your patience!</p>
                    <p>Best regards,<br>The Content Strategy Planner Team</p>
                </div>
                """
            })
            return {"success": True, "id": r}
        except Exception as e:
            return {"success": False, "error": str(e)}