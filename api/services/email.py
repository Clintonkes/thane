"""
Email Service for Thanesgaylerental
Handles sending order-related emails to customers.

Supports multiple email backends:
- Console (development logging)
- SMTP (production)
- SendGrid API (optional)

Configure via environment variables:
- EMAIL_BACKEND: "console" (default), "smtp", "sendgrid", "resend"
- SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASSWORD (for SMTP)
- SENDGRID_API_KEY (for SendGrid)
- RESEND_API_KEY (for Resend)
- FROM_EMAIL: Default sender email address
- FROM_NAME: Default sender name
"""

import os
import logging
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from typing import Optional, Dict, Any
from datetime import datetime
from pathlib import Path

# Load environment variables
try:
    from dotenv import load_dotenv
    # Find .env in project root
    env_path = Path(__file__).parent.parent.parent / ".env"
    load_dotenv(env_path)
except ImportError:
    pass

logger = logging.getLogger(__name__)


class EmailService:
    """Email service for sending order notifications"""
    
    def __init__(self):
        # Helper to get env var and strip quotes/comments
        def get_clean_env(key, default=""):
            val = os.getenv(key, default)
            if not val:
                return default
            # Strip inline comments (everything after #)
            val = val.split('#')[0].strip()
            # Strip quotes
            return val.replace('"', '').replace("'", "").strip()

        self.backend = get_clean_env("EMAIL_BACKEND", "console").lower()
        self.from_email = get_clean_env("FROM_EMAIL", "orders@thanesgaylerental.com")
        self.from_name = get_clean_env("FROM_NAME", "Thanesgaylerental Properties LLC")
        
        # Log which backend is active on initialization
        logger.info(f"EmailService initialized with backend: {self.backend}")
        logger.info(f"EmailService sender configured as: {self.from_name} <{self.from_email}>")
        
    def _send_via_smtp(self, to_email: str, subject: str, html_content: str) -> bool:
        """Send email via SMTP"""
        try:
            smtp_host = os.getenv("SMTP_HOST")
            smtp_port = int(os.getenv("SMTP_PORT", "587"))
            smtp_user = os.getenv("SMTP_USER")
            smtp_password = os.getenv("SMTP_PASSWORD")
            
            if not all([smtp_host, smtp_user, smtp_password]):
                logger.warning("SMTP not configured, falling back to console")
                return self._send_via_console(to_email, subject, html_content)
            
            msg = MIMEMultipart('alternative')
            msg['From'] = f"{self.from_name} <{self.from_email}>"
            msg['To'] = to_email
            msg['Subject'] = subject
            msg['Date'] = datetime.utcnow().strftime('%a, %d %b %Y %H:%M:%S +0000')
            
            html_part = MIMEText(html_content, 'html')
            msg.attach(html_part)
            
            with smtplib.SMTP(smtp_host, smtp_port) as server:
                server.starttls()
                server.login(smtp_user, smtp_password)
                server.send_message(msg)
            
            logger.info(f"Email sent successfully to {to_email}")
            return True
            
        except Exception as e:
            logger.error(f"Failed to send email via SMTP: {e}")
            return False
    
    def _send_via_console(self, to_email: str, subject: str, html_content: str) -> bool:
        """Log email to console (development)"""
        logger.info("=" * 60)
        logger.info(f"📧 EMAIL - Would be sent to: {to_email}")
        logger.info(f"📝 Subject: {subject}")
        logger.info(f"📄 Content preview: {html_content[:200]}...")
        logger.info("=" * 60)
        return True
    
    def _send_via_sendgrid(self, to_email: str, subject: str, html_content: str) -> bool:
        """Send email via SendGrid API"""
        try:
            import requests
            
            api_key = os.getenv("SENDGRID_API_KEY")
            if not api_key:
                logger.warning("SendGrid API key not configured, falling back to console")
                return self._send_via_console(to_email, subject, html_content)
            
            url = "https://api.sendgrid.com/v3/mail/send"
            headers = {
                "Authorization": f"Bearer {api_key}",
                "Content-Type": "application/json"
            }
            data = {
                "personalizations": [{
                    "to": [{"email": to_email}]
                }],
                "from": {"email": self.from_email, "name": self.from_name},
                "subject": subject,
                "content": [{
                    "type": "text/html",
                    "value": html_content
                }]
            }
            
            response = requests.post(url, headers=headers, json=data, timeout=10)
            
            if response.status_code in [200, 202, 201]:
                logger.info(f"Email sent via SendGrid to {to_email}")
                return True
            else:
                logger.error(f"SendGrid error: {response.status_code} - {response.text}")
                return False
                
        except ImportError:
            logger.warning("requests library not available, falling back to console")
            return self._send_via_console(to_email, subject, html_content)
        except Exception as e:
            logger.error(f"Failed to send via SendGrid: {e}")
            return False
    
    def _send_via_resend(self, to_email: str, subject: str, html_content: str) -> bool:
        """Send email via Resend API"""
        try:
            import requests
            
            raw_key = os.getenv("RESEND_API_KEY")
            if not raw_key:
                logger.warning("Resend API key not configured, falling back to console")
                return self._send_via_console(to_email, subject, html_content)
            
            # Strip quotes/whitespace/comments
            api_key = raw_key.split('#')[0].strip().replace('"', '').replace("'", "").strip()
            
            url = "https://api.resend.com/emails"
            headers = {
                "Authorization": f"Bearer {api_key}",
                "Content-Type": "application/json"
            }
            data = {
                "from": f"{self.from_name} <{self.from_email}>",
                "to": [to_email],
                "subject": subject,
                "html": html_content
            }
            
            response = requests.post(url, headers=headers, json=data, timeout=10)
            
            if response.status_code in [200, 201, 202, 204]:
                logger.info(f"Email sent via Resend to {to_email}")
                return True
            else:
                logger.error(f"Resend error: {response.status_code} - {response.text}")
                return False
                
        except ImportError:
            logger.warning("requests library not available, falling back to console")
            return self._send_via_console(to_email, subject, html_content)
        except Exception as e:
            logger.error(f"Failed to send via Resend: {e}")
            return False
    
    def send_email(self, to_email: str, subject: str, html_content: str) -> bool:
        """Send email using configured backend"""
        if self.backend == "smtp":
            return self._send_via_smtp(to_email, subject, html_content)
        elif self.backend == "sendgrid":
            return self._send_via_sendgrid(to_email, subject, html_content)
        elif self.backend == "resend":
            return self._send_via_resend(to_email, subject, html_content)
        else:
            return self._send_via_console(to_email, subject, html_content)
    
    def send_order_confirmation(self, order_data: Dict[str, Any]) -> bool:
        """Send order confirmation email to customer"""
        order = order_data
        
        subject = f"Order Confirmation - #{order.get('order_number', 'N/A')}"
        
        # Format preferred date
        preferred_date = order.get('preferred_date')
        if isinstance(preferred_date, str):
            try:
                dt = datetime.fromisoformat(preferred_date.replace('Z', '+00:00'))
                preferred_date = dt.strftime('%B %d, %Y at %I:%M %p')
            except:
                pass
        
        html_content = f"""
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Order Confirmation</title>
        </head>
        <body style="font-family: 'Inter', 'Segoe UI', Arial, sans-serif; line-height: 1.6; color: #1e293b; max-width: 600px; margin: 0 auto; padding: 0; background-color: #f8fafc;">
            <div style="background: linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%); padding: 40px 20px; text-align: center;">
                <h1 style="color: #ffffff; margin: 0; font-size: 32px; font-weight: 800; letter-spacing: -0.025em;">Order Confirmed!</h1>
                <p style="color: #bfdbfe; margin: 12px 0 0 0; font-size: 18px; font-weight: 500;">Thank you for choosing Thanesgaylerental Properties LLC</p>
            </div>
            
            <div style="padding: 30px; background-color: #ffffff; border-radius: 0 0 16px 16px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
                <div style="background: #eff6ff; padding: 24px; border-radius: 12px; margin-bottom: 32px; border: 1px solid #dbeafe; text-align: center;">
                    <h2 style="margin: 0 0 8px 0; color: #1e3a8a; font-size: 14px; text-transform: uppercase; letter-spacing: 0.1em; font-weight: 700;">Order Number</h2>
                    <p style="margin: 0; font-size: 36px; font-weight: 800; color: #f97316; letter-spacing: 1px;">{order.get('order_number', 'N/A')}</p>
                    <p style="margin: 12px 0 0 0; color: #64748b; font-size: 14px;">Save this for tracking your shipment</p>
                </div>
                
                <h3 style="color: #0f172a; border-bottom: 2px solid #f1f5f9; padding-bottom: 12px; margin-bottom: 24px; font-size: 20px; font-weight: 700;">Shipment Details</h3>
                
                <table style="width: 100%; border-collapse: collapse; margin-bottom: 32px;">
                    <tr>
                        <td style="padding: 12px 0; border-bottom: 1px solid #f1f5f9; color: #64748b; font-weight: 600; width: 40%;">Customer</td>
                        <td style="padding: 12px 0; border-bottom: 1px solid #f1f5f9; color: #0f172a; font-weight: 500;">{order.get('customer_name', 'N/A')}</td>
                    </tr>
                    <tr>
                        <td style="padding: 12px 0; border-bottom: 1px solid #f1f5f9; color: #64748b; font-weight: 600;">Pickup</td>
                        <td style="padding: 12px 0; border-bottom: 1px solid #f1f5f9; color: #0f172a; font-weight: 500;">{order.get('pickup_location', 'N/A')}</td>
                    </tr>
                    <tr>
                        <td style="padding: 12px 0; border-bottom: 1px solid #f1f5f9; color: #64748b; font-weight: 600;">Delivery</td>
                        <td style="padding: 12px 0; border-bottom: 1px solid #f1f5f9; color: #0f172a; font-weight: 500;">{order.get('delivery_location', 'N/A')}</td>
                    </tr>
                    <tr>
                        <td style="padding: 12px 0; border-bottom: 1px solid #f1f5f9; color: #64748b; font-weight: 600;">Goods Type</td>
                        <td style="padding: 12px 0; border-bottom: 1px solid #f1f5f9; color: #0f172a;">{order.get('goods_type', 'N/A')}</td>
                    </tr>
                    <tr>
                        <td style="padding: 12px 0; border-bottom: 1px solid #f1f5f9; color: #64748b; font-weight: 600;">Preferred Date</td>
                        <td style="padding: 12px 0; border-bottom: 1px solid #f1f5f9; color: #0f172a;">{preferred_date or 'Not specified'}</td>
                    </tr>
                </table>
                
                <div style="background: #fff7ed; padding: 20px; border-radius: 12px; border-left: 4px solid #f97316; margin-bottom: 32px;">
                    <p style="margin: 0; color: #9a3412; font-weight: 700; font-size: 16px;">Status: Pending Processing</p>
                    <p style="margin: 8px 0 0 0; color: #c2410c; font-size: 14px; line-height: 1.5;">Our team has received your order and will begin processing it shortly. You will receive further updates as the shipment progresses.</p>
                </div>
                
                <div style="text-align: center;">
                    <a href="#" style="display: inline-block; background-color: #1e3a8a; color: #ffffff; padding: 14px 28px; border-radius: 8px; text-decoration: none; font-weight: 700; transition: background-color 0.2s;">Track My Order</a>
                </div>
                
                <div style="text-align: center; margin-top: 48px; padding-top: 24px; border-top: 1px solid #f1f5f9;">
                    <p style="color: #94a3b8; font-size: 13px; margin: 0; line-height: 1.6;">
                        <strong>Thanesgaylerental Properties LLC</strong><br>
                        Professional Trucking & Logistics Services<br>
                        © 2026 All rights reserved.
                    </p>
                </div>
            </div>
        </body>
        </html>
        """
        
        return self.send_email(order.get('email', ''), subject, html_content)
    
    def send_order_completion(self, order_data: Dict[str, Any]) -> bool:
        """Send order completion notification email to customer"""
        order = order_data
        
        subject = f"Order Completed - #{order.get('order_number', 'N/A')}"
        
        # Format dates
        created_at = order.get('created_at')
        if isinstance(created_at, str):
            try:
                dt = datetime.fromisoformat(created_at.replace('Z', '+00:00'))
                created_at = dt.strftime('%B %d, %Y at %I:%M %p')
            except:
                pass
        
        updated_at = order.get('updated_at')
        if isinstance(updated_at, str):
            try:
                dt = datetime.fromisoformat(updated_at.replace('Z', '+00:00'))
                updated_at = dt.strftime('%B %d, %Y at %I:%M %p')
            except:
                pass
        
        html_content = f"""
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Order Completed</title>
        </head>
        <body style="font-family: 'Inter', 'Segoe UI', Arial, sans-serif; line-height: 1.6; color: #1e293b; max-width: 600px; margin: 0 auto; padding: 0; background-color: #f8fafc;">
            <div style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 40px 20px; text-align: center;">
                <h1 style="color: #ffffff; margin: 0; font-size: 32px; font-weight: 800; letter-spacing: -0.025em;">🎉 Order Completed!</h1>
                <p style="color: #d1fae5; margin: 12px 0 0 0; font-size: 18px; font-weight: 500;">Your shipment has been delivered successfully</p>
            </div>
            
            <div style="padding: 30px; background-color: #ffffff; border-radius: 0 0 16px 16px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
                <div style="background: #ecfdf5; padding: 24px; border-radius: 12px; margin-bottom: 32px; border: 1px solid #d1fae5; text-align: center;">
                    <h2 style="margin: 0 0 8px 0; color: #065f46; font-size: 14px; text-transform: uppercase; letter-spacing: 0.1em; font-weight: 700;">Order Number</h2>
                    <p style="margin: 0; font-size: 36px; font-weight: 800; color: #1e3a8a; letter-spacing: 1px;">{order.get('order_number', 'N/A')}</p>
                </div>
                
                <h3 style="color: #0f172a; border-bottom: 2px solid #f1f5f9; padding-bottom: 12px; margin-bottom: 24px; font-size: 20px; font-weight: 700;">Shipment Summary</h3>
                
                <table style="width: 100%; border-collapse: collapse; margin-bottom: 32px;">
                    <tr>
                        <td style="padding: 12px 0; border-bottom: 1px solid #f1f5f9; color: #64748b; font-weight: 600; width: 40%;">Customer</td>
                        <td style="padding: 12px 0; border-bottom: 1px solid #f1f5f9; color: #0f172a; font-weight: 500;">{order.get('customer_name', 'N/A')}</td>
                    </tr>
                    <tr>
                        <td style="padding: 12px 0; border-bottom: 1px solid #f1f5f9; color: #64748b; font-weight: 600;">Pickup</td>
                        <td style="padding: 12px 0; border-bottom: 1px solid #f1f5f9; color: #0f172a; font-weight: 500;">{order.get('pickup_location', 'N/A')}</td>
                    </tr>
                    <tr>
                        <td style="padding: 12px 0; border-bottom: 1px solid #f1f5f9; color: #64748b; font-weight: 600;">Delivery</td>
                        <td style="padding: 12px 0; border-bottom: 1px solid #f1f5f9; color: #0f172a; font-weight: 500;">{order.get('delivery_location', 'N/A')}</td>
                    </tr>
                    <tr>
                        <td style="padding: 12px 0; border-bottom: 1px solid #f1f5f9; color: #64748b; font-weight: 600;">Completed Date</td>
                        <td style="padding: 12px 0; border-bottom: 1px solid #f1f5f9; color: #059669; font-weight: 700;">{updated_at or 'N/A'}</td>
                    </tr>
                </table>
                
                <div style="background: #f0fdf4; padding: 20px; border-radius: 12px; border-left: 4px solid #10b981; margin-bottom: 32px;">
                    <p style="margin: 0; color: #166534; font-weight: 700; font-size: 16px;">✓ Status: Successfully Delivered</p>
                    <p style="margin: 8px 0 0 0; color: #15803d; font-size: 14px; line-height: 1.5;">Your shipment has been successfully delivered. We appreciate your business and hope to serve you again soon!</p>
                </div>
                
                <p style="color: #64748b; font-size: 14px; text-align: center; margin-bottom: 32px;">
                    We would love to hear your feedback on our service.
                </p>
                
                <div style="text-align: center; margin-top: 48px; padding-top: 24px; border-top: 1px solid #f1f5f9;">
                    <p style="color: #94a3b8; font-size: 13px; margin: 0; line-height: 1.6;">
                        <strong>Thanesgaylerental Properties LLC</strong><br>
                        Professional Trucking & Logistics Services<br>
                        © 2026 All rights reserved.
                    </p>
                </div>
            </div>
        </body>
        </html>
        """
        
        return self.send_email(order.get('email', ''), subject, html_content)


# Singleton instance
email_service = EmailService()