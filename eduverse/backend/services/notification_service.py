import logging
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from datetime import datetime
from core.config import SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASSWORD, ADMIN_EMAIL

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("NotificationService")

def send_email(to_email: str, subject: str, html_body: str):
    """
    Sends a real email using SMTP.
    """
    if not all([SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASSWORD]):
        logger.warning("SMTP credentials not fully configured. Email not sent.")
        return False

    try:
        msg = MIMEMultipart()
        msg['From'] = SMTP_USER
        msg['To'] = to_email
        msg['Subject'] = subject

        msg.attach(MIMEText(html_body, 'html'))

        with smtplib.SMTP(SMTP_HOST, SMTP_PORT) as server:
            server.starttls()
            server.login(SMTP_USER, SMTP_PASSWORD)
            server.send_message(msg)
        
        logger.info(f"Email successfully sent to {to_email}")
        return True
    except Exception as e:
        logger.error(f"Failed to send email to {to_email}: {str(e)}")
        return False

def send_notification(email: str, subject: str, body: str, backup_email: str = None):
    """
    Sends a notification to the user's primary and backup email.
    """
    html_body = f"""
    <div style="font-family: sans-serif; padding: 20px; color: #333;">
        <h2 style="color: #4F46E5;">EduVerse Notification</h2>
        <p>{body}</p>
        <hr style="border: 0; border-top: 1px solid #eee;" />
        <p style="font-size: 0.8em; color: #999;">This is an automated message from EduVerse.</p>
    </div>
    """
    
    success = send_email(email, subject, html_body)
    
    if backup_email:
        send_email(backup_email, subject, html_body)
    
    return success

def send_welcome_notification(email: str, backup_email: str = None):
    subject = "Welcome to EduVerse!"
    body = "Your account has been successfully created. Meet your AI mentor and start your personalized learning journey today!"
    return send_notification(email, subject, body, backup_email)

def send_login_alert(user_email: str, ip_address: str):
    """
    Sends an alert to the admin when a user logs in.
    """
    if not ADMIN_EMAIL:
        logger.warning("ADMIN_EMAIL not configured. Login alert not sent.")
        return False

    subject = f"Security Alert: Login Detected - {user_email}"
    timestamp = datetime.utcnow().strftime("%Y-%m-%d %H:%M:%S UTC")
    
    html_body = f"""
    <div style="font-family: sans-serif; padding: 20px; color: #333; border: 1px solid #eee; border-radius: 8px;">
        <h2 style="color: #EF4444;">Login Alert</h2>
        <p>A user has successfully logged into EduVerse.</p>
        <table style="width: 100%; border-collapse: collapse; margin-top: 15px;">
            <tr>
                <td style="padding: 8px; font-weight: bold; border-bottom: 1px solid #f0f0f0;">User Email:</td>
                <td style="padding: 8px; border-bottom: 1px solid #f0f0f0;">{user_email}</td>
            </tr>
            <tr>
                <td style="padding: 8px; font-weight: bold; border-bottom: 1px solid #f0f0f0;">Timestamp:</td>
                <td style="padding: 8px; border-bottom: 1px solid #f0f0f0;">{timestamp}</td>
            </tr>
            <tr>
                <td style="padding: 8px; font-weight: bold; border-bottom: 1px solid #f0f0f0;">IP Address:</td>
                <td style="padding: 8px; border-bottom: 1px solid #f0f0f0;">{ip_address}</td>
            </tr>
        </table>
        <p style="margin-top: 20px; font-size: 0.9em;">If this wasn't expected, please investigate.</p>
    </div>
    """
    
    return send_email(ADMIN_EMAIL, subject, html_body)
