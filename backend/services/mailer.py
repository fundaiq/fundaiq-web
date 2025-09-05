import os
import smtplib
from email.message import EmailMessage
from core.config import settings
from urllib.parse import urlencode


def send_email(to_email: str, subject: str, text_body: str, html_body: str = None):
    """Generic email sending function"""
    
    # Get SMTP settings from config or environment
    smtp_host = settings.SMTP_HOST or os.getenv("SMTP_HOST")
    smtp_port = settings.SMTP_PORT or int(os.getenv("SMTP_PORT", "587"))
    smtp_user = settings.SMTP_USER or os.getenv("SMTP_USER")
    smtp_pass = settings.SMTP_PASS or os.getenv("SMTP_PASS")
    from_email = settings.FROM_EMAIL or os.getenv("FROM_EMAIL", smtp_user)
    
    if not smtp_host or not smtp_user or not smtp_pass:
        print(f"Warning: SMTP not configured properly. Would send email to {to_email}")
        print(f"Subject: {subject}")
        print(f"Body: {text_body}")
        return
    
    try:
        msg = EmailMessage()
        msg["Subject"] = subject
        msg["From"] = from_email
        msg["To"] = to_email
        
        # Set plain text content
        msg.set_content(text_body)
        
        # Add HTML version if provided
        if html_body:
            msg.add_alternative(html_body, subtype="html")
        
        with smtplib.SMTP(smtp_host, smtp_port) as server:
            server.starttls()
            if smtp_user and smtp_pass:
                server.login(smtp_user, smtp_pass)
            server.send_message(msg)
            
        print(f"Email sent successfully to {to_email}")
        
    except Exception as e:
        print(f"Failed to send email to {to_email}: {e}")
        raise e


def build_verification_url(token: str) -> str:
    backend = settings.BACKEND_BASE_URL.rstrip("/")
    frontend = settings.FRONTEND_BASE_URL.rstrip("/")
    # land directly on /report (or '/')
    final = f"{frontend}/report"
    params = urlencode({"token": token, "redirect": final})
    return f"{backend}/api/auth/verify-email?{params}"


def send_verification_email(to_email: str, verify_link: str):
    """Send email verification link to user"""
    
    subject = "Verify your FundaIQ account"
    
    # Plain text version
    text_body = f"""
Welcome to FundaIQ!

Please verify your email address by clicking the link below:
{verify_link}

If you didn't create an account, please ignore this email.

Best regards,
The FundaIQ Team
    """.strip()
    
    # HTML version
    html_body = f"""
        <html>
            <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
                <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
                    <div style="text-align: center; margin-bottom: 30px;">
                        <h1 style="color: #2563eb;">Welcome to FundaIQ!</h1>
                    </div>
                    
                    <div style="background-color: #f8fafc; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
                        <p style="margin: 0 0 15px 0;">Thank you for creating your FundaIQ account!</p>
                        <p style="margin: 0 0 15px 0;">To get started, please verify your email address by clicking the button below:</p>
                        
                        <div style="text-align: center; margin: 25px 0;">
                            <a href="{verify_link}" 
                               style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: bold;">
                                Verify Email Address
                            </a>
                        </div>
                        
                        <p style="margin: 15px 0 0 0; font-size: 14px; color: #666;">
                            Or copy and paste this link into your browser:<br>
                            <a href="{verify_link}" style="color: #2563eb; word-break: break-all;">{verify_link}</a>
                        </p>
                    </div>
                    
                    <div style="font-size: 14px; color: #666; border-top: 1px solid #e2e8f0; padding-top: 20px;">
                        <p>If you didn't create a FundaIQ account, please ignore this email.</p>
                        <p style="margin: 0;">Best regards,<br>The FundaIQ Team</p>
                    </div>
                </div>
            </body>
        </html>
    """

    send_email(to_email, subject, text_body, html_body)


def build_password_reset_url(token: str) -> str:
    backend = (getattr(settings, "BACKEND_BASE_URL", "http://localhost:8000")).rstrip("/")
    frontend = (getattr(settings, "FRONTEND_BASE_URL", "http://localhost:3000")).rstrip("/")
    params = urlencode({"token": token, "redirect": f"{frontend}/reset-password"})
    return f"{backend}/api/auth/reset-password/start?{params}"


def send_password_reset_email(to_email: str, link: str):
    """Send password reset email to user"""
    subject = "Reset your password"
    text_body = f"We received a request to reset your password.\n\nClick the link to continue:\n{link}\n\nIf you didn't request this, ignore this email."
    html_body = f"""
        <html>
            <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
                <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
                    <h2 style="color: #2563eb;">Reset Your Password</h2>
                    <p>We received a request to reset your password.</p>
                    <div style="text-align: center; margin: 25px 0;">
                        <a href="{link}" 
                           style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: bold;">
                            Reset Password
                        </a>
                    </div>
                    <p style="font-size: 14px; color: #666;">
                        Or copy and paste this link into your browser:<br>
                        <a href="{link}" style="color: #2563eb; word-break: break-all;">{link}</a>
                    </p>
                    <p style="font-size: 14px; color: #666; margin-top: 20px;">
                        If you didn't request this password reset, you can safely ignore this email.
                    </p>
                </div>
            </body>
        </html>
    """
    
    send_email(to_email, subject, text_body, html_body)