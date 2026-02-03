import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from datetime import datetime
import logging
from config import Config

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class EmailNotifier:
    def __init__(self):
        # We fetch config on demand now
        pass
    
    def send_domain_alert(self, domains):
        """
        Send email alert for newly discovered domains
        domains: list of domain dictionaries with 'domain' and 'keyword' keys
        """
        if not Config.is_email_configured():
            logger.warning("Email not configured. Skipping notification.")
            return False
        
        config = Config.get_email_config()
        
        if not domains:
            logger.info("No domains to notify about.")
            return True
        
        try:
            # Create message
            msg = MIMEMultipart('alternative')
            msg['Subject'] = f'🔔 Domain Alert: {len(domains)} New Domain(s) Found'
            msg['From'] = config['smtp_from']
            msg['To'] = config['smtp_to']
            
            # Create HTML content
            html_content = self._create_html_email(domains)
            
            # Create plain text version
            text_content = self._create_text_email(domains)
            
            # Attach both versions
            part1 = MIMEText(text_content, 'plain')
            part2 = MIMEText(html_content, 'html')
            msg.attach(part1)
            msg.attach(part2)
            
            # Send email
            with smtplib.SMTP(config['smtp_server'], config['smtp_port']) as server:
                server.starttls()
                server.login(config['smtp_username'], config['smtp_password'])
                server.send_message(msg)
            
            logger.info(f"Email notification sent for {len(domains)} domain(s)")
            return True
            
        except Exception as e:
            logger.error(f"Failed to send email notification: {e}")
            return False
    
    def _create_html_email(self, domains):
        """Create HTML email content"""
        html = f"""
        <html>
        <head>
            <style>
                body {{ font-family: Arial, sans-serif; line-height: 1.6; color: #333; }}
                .header {{ background-color: #4CAF50; color: white; padding: 20px; text-align: center; }}
                .content {{ padding: 20px; }}
                .domain-card {{ 
                    background-color: #f9f9f9; 
                    border-left: 4px solid #4CAF50; 
                    padding: 15px; 
                    margin: 10px 0;
                    border-radius: 4px;
                }}
                .domain-name {{ font-size: 18px; font-weight: bold; color: #2196F3; }}
                .keyword {{ color: #666; font-style: italic; }}
                .footer {{ padding: 20px; text-align: center; color: #666; font-size: 12px; }}
            </style>
        </head>
        <body>
            <div class="header">
                <h1>🎯 Domain Monitor Alert</h1>
                <p>New available domains detected!</p>
            </div>
            <div class="content">
                <p>The following <strong>{len(domains)}</strong> domain(s) are now available:</p>
        """
        
        for domain in domains:
            html += f"""
                <div class="domain-card">
                    <div class="domain-name">{domain['domain']}</div>
                    <div class="keyword">Based on keyword: {domain['keyword']}</div>
                </div>
            """
        
        html += f"""
            </div>
            <div class="footer">
                <p>Domain Monitor System - {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}</p>
                <p>Check your dashboard for more details</p>
            </div>
        </body>
        </html>
        """
        return html
    
    def _create_text_email(self, domains):
        """Create plain text email content"""
        text = f"Domain Monitor Alert\n"
        text += f"=" * 50 + "\n\n"
        text += f"New available domains detected: {len(domains)}\n\n"
        
        for i, domain in enumerate(domains, 1):
            text += f"{i}. {domain['domain']}\n"
            text += f"   Keyword: {domain['keyword']}\n\n"
        
        text += f"\n{datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n"
        text += "Domain Monitor System\n"
        
        return text
