"""
Email Service for Thanesgaylerental
Handles sending order-related emails to customers.

Supports multiple email backends:
- Console (development logging)
- SMTP (production)
- SendGrid API (optional)

Configure via environment variables:
- EMAIL_BACKEND: "console" (default), "smtp", "sendgrid"
- SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASSWORD (for SMTP)
- SENDGRID_API_KEY (for SendGrid)
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

logger = logging.getLogger(__name__)


class EmailService:
    """Email service for sending order notifications"""
    
    def __init__(self):
        self.backend = os.getenv("EMAIL_BACKEND", "console")
        self.from_email = os.getenv("FROM_EMAIL", "orders@thanesgaylerental.com")
        self.from_name = os.getenv("FROM_NAME", "Thanesgaylerental")
        
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
    
    def send_email(self, to_email: str, subject: str, html_content: str) -> bool:
        """Send email using configured backend"""
        if self.backend == "smtp":
            return self._send_via_smtp(to_email, subject, html_content)
        elif self.backend == "sendgrid":
            return self._send_via_sendgrid(to_email, subject, html_content)
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
        <body style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background: linear-gradient(135deg, #1e3a5f 0%, #2d5a87 100%); padding: 30px; border-radius: 12px 12px 0 0; text-align: center;">
                <h1 style="color: white; margin: 0; font-size: 28px;">Order Confirmed! ✓</h1>
                <p style="color: #cce4ff; margin: 10px 0 0 0; font-size: 16px;">Thank you for choosing Thanesgaylerental</p>
            </div>
            
            <div style="background: #f8f9fa; padding: 30px; border-radius: 0 0 12px 12px; border: 1px solid #e9ecef; border-top: none;">
                <div style="background: white; padding: 20px; border-radius: 8px; margin-bottom: 20px; border-left: 4px solid #28a745;">
                    <h2 style="margin: 0 0 10px 0; color: #28a745; font-size: 20px;">Order Number</h2>
                    <p style="margin: 0; font-size: 32px; font-weight: bold; color: #1e3a5f; letter-spacing: 2px;">{order.get('order_number', 'N/A')}</p>
                    <p style="margin: 10px 0 0 0; color: #6c757d; font-size: 14px;">Please save this number for tracking your order</p>
                </div>
                
                <h3 style="color: #1e3a5f; border-bottom: 2px solid #e9ecef; padding-bottom: 10px; margin-bottom: 20px;">Order Details</h3>
                
                <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
                    <tr>
                        <td style="padding: 12px 0; border-bottom: 1px solid #e9ecef; color: #6c757d; font-weight: 600; width: 40%;">Customer Name</td>
                        <td style="padding: 12px 0; border-bottom: 1px solid #e9ecef; color: #333; font-weight: 500;">{order.get('customer_name', 'N/A')}</td>
                    </tr>
                    <tr>
                        <td style="padding: 12px 0; border-bottom: 1px solid #e9ecef; color: #6c757d; font-weight: 600;">Email</td>
                        <td style="padding: 12px 0; border-bottom: 1px solid #e9ecef; color: #333;">{order.get('email', 'N/A')}</td>
                    </tr>
                    <tr>
                        <td style="padding: 12px 0; border-bottom: 1px solid #e9ecef; color: #6c757d; font-weight: 600;">Phone</td>
                        <td style="padding: 12px 0; border-bottom: 1px solid #e9ecef; color: #333;">{order.get('phone', 'N/A')}</td>
                    </tr>
                    <tr>
                        <td style="padding: 12px 0; border-bottom: 1px solid #e9ecef; color: #6c757d; font-weight: 600;">Pickup Location</td>
                        <td style="padding: 12px 0; border-bottom: 1px solid #e9ecef; color: #333; font-weight: 500;">{order.get('pickup_location', 'N/A')}</td>
                    </tr>
                    <tr>
                        <td style="padding: 12px 0; border-bottom: 1px solid #e9ecef; color: #6c757d; font-weight: 600;">Delivery Location</td>
                        <td style="padding: 12px 0; border-bottom: 1px solid #e9ecef; color: #333; font-weight: 500;">{order.get('delivery_location', 'N/A')}</td>
                    </tr>
                    <tr>
                        <td style="padding: 12px 0; border-bottom: 1px solid #e9ecef; color: #6c757d; font-weight: 600;">Goods Type</td>
                        <td style="padding: 12px 0; border-bottom: 1px solid #e9ecef; color: #333;">{order.get('goods_type', 'N/A')}</td>
                    </tr>
                    <tr>
                        <td style="padding: 12px 0; border-bottom: 1px solid #e9ecef; color: #6c757d; font-weight: 600;">Cargo Weight</td>
                        <td style="padding: 12px 0; border-bottom: 1px solid #e9ecef; color: #333;">{order.get('cargo_weight', 'Not specified')}</td>
                    </tr>
                    <tr>
                        <td style="padding: 12px 0; border-bottom: 1px solid #e9ecef; color: #6c757d; font-weight: 600;">Preferred Date</td>
                        <td style="padding: 12px 0; border-bottom: 1px solid #e9ecef; color: #333;">{preferred_date or 'Not specified'}</td>
                    </tr>
                </table>
                
                <div style="background: #fff3cd; padding: 15px; border-radius: 8px; border-left: 4px solid #ffc107; margin-bottom: 20px;">
                    <strong style="color: #856404;">📋 Status: Pending</strong>
                    <p style="margin: 5px 0 0 0; color: #856404; font-size: 14px;">Your order is currently pending and will be processed shortly.</p>
                </div>
                
                <p style="color: #6c757d; font-size: 14px; text-align: center; margin-top: 30px;">
                    You can track your order status using your order number at any time on our website.
                </p>
                
                <div style="text-align: center; margin-top: 25px; padding-top: 20px; border-top: 1px solid #e9ecef;">
                    <p style="color: #6c757d; font-size: 12px; margin: 0;">
                        © 2024 Thanesgaylerental. All rights reserved.<br>
                        Professional Trucking & Logistics Services
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
        <body style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background: linear-gradient(135deg, #28a745 0%, #20c997 100%); padding: 30px; border-radius: 12px 12px 0 0; text-align: center;">
                <h1 style="color: white; margin: 0; font-size: 28px;">🎉 Order Completed!</h1>
                <p style="color: #d4edda; margin: 10px 0 0 0; font-size: 16px;">Your shipment has been delivered successfully</p>
            </div>
            
            <div style="background: #f8f9fa; padding: 30px; border-radius: 0 0 12px 12px; border: 1px solid #e9ecef; border-top: none;">
                <div style="background: white; padding: 20px; border-radius: 8px; margin-bottom: 20px; border-left: 4px solid #28a745;">
                    <h2 style="margin: 0 0 10px 0; color: #28a745; font-size: 20px;">Order Number</h2>
                    <p style="margin: 0; font-size: 32px; font-weight: bold; color: #1e3a5f; letter-spacing: 2px;">{order.get('order_number', 'N/A')}</p>
                </div>
                
                <h3 style="color: #1e3a5f; border-bottom: 2px solid #e9ecef; padding-bottom: 10px; margin-bottom: 20px;">Shipment Summary</h3>
                
                <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
                    <tr>
                        <td style="padding: 12px 0; border-bottom: 1px solid #e9ecef; color: #6c757d; font-weight: 600; width: 40%;">Customer Name</td>
                        <td style="padding: 12px 0; border-bottom: 1px solid #e9ecef; color: #333; font-weight: 500;">{order.get('customer_name', 'N/A')}</td>
                    </tr>
                    <tr>
                        <td style="padding: 12px 0; border-bottom: 1px solid #e9ecef; color: #6c757d; font-weight: 600;">Email</td>
                        <td style="padding: 12px 0; border-bottom: 1px solid #e9ecef; color: #333;">{order.get('email', 'N/A')}</td>
                    </tr>
                    <tr>
                        <td style="padding: 12px 0; border-bottom: 1px solid #e9ecef; color: #6c757d; font-weight: 600;">Pickup Location</td>
                        <td style="padding: 12px 0; border-bottom: 1px solid #e9ecef; color: #333; font-weight: 500;">{order.get('pickup_location', 'N/A')}</td>
                    </tr>
                    <tr>
                        <td style="padding: 12px 0; border-bottom: 1px solid #e9ecef; color: #6c757d; font-weight: 600;">Delivery Location</td>
                        <td style="padding: 12px 0; border-bottom: 1px solid #e9ecef; color: #333; font-weight: 500;">{order.get('delivery_location', 'N/A')}</td>
                    </tr>
                    <tr>
                        <td style="padding: 12px 0; border-bottom: 1px solid #e9ecef; color: #6c757d; font-weight: 600;">Goods Type</td>
                        <td style="padding: 12px 0; border-bottom: 1px solid #e9ecef; color: #333;">{order.get('goods_type', 'N/A')}</td>
                    </tr>
                    <tr>
                        <td style="padding: 12px 0; border-bottom: 1px solid #e9ecef; color: #6c757d; font-weight: 600;">Order Date</td>
                        <td style="padding: 12px 0; border-bottom: 1px solid #e9ecef; color: #333;">{created_at or 'N/A'}</td>
                    </tr>
                    <tr>
                        <td style="padding: 12px 0; border-bottom: 1px solid #e9ecef; color: #6c757d; font-weight: 600;">Completed Date</td>
                        <td style="padding: 12px 0; border-bottom: 1px solid #e9ecef; color: #28a745; font-weight: 600;">{updated_at or 'N/A'}</td>
                    </tr>
                </table>
                
                <div style="background: #d4edda; padding: 15px; border-radius: 8px; border-left: 4px solid #28a745; margin-bottom: 20px;">
                    <strong style="color: #155724;">✓ Status: Completed</strong>
                    <p style="margin: 5px 0 0 0; color: #155724; font-size: 14px;">Your order has been successfully completed. Thank you for choosing Thanesgaylerental!</p>
                </div>
                
                <p style="color: #6c757d; font-size: 14px; text-align: center; margin-top: 30px;">
                    Thank you for trusting us with your shipment. We hope to serve you again soon!
                </p>
                
                <div style="text-align: center; margin-top: 25px; padding-top: 20px; border-top: 1px solid #e9ecef;">
                    <p style="color: #6c757d; font-size: 12px; margin: 0;">
                        © 2024 Thanesgaylerental. All rights reserved.<br>
                        Professional Trucking & Logistics Services
                    </p>
                </div>
            </div>
        </body>
        </html>
        """
        
        return self.send_email(order.get('email', ''), subject, html_content)


# Singleton instance
email_service = EmailService()