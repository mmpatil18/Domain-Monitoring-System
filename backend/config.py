import sys
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Get project root directory (parent of backend folder)
PROJECT_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

class Config:
    # Determine paths based on environment
    if getattr(sys, 'frozen', False):
        # Running in a bundle
        APPLICATION_PATH = os.path.dirname(sys.executable)
        # Store data in user home directory to avoid permission issues in Program Files
        DATA_DIR = os.path.join(os.path.expanduser('~'), '.domain-monitor')
    else:
        # Running in dev mode
        APPLICATION_PATH = os.path.dirname(os.path.abspath(__file__))
        DATA_DIR = os.path.join(PROJECT_ROOT, 'data')

    # Ensure data directory exists
    if not os.path.exists(DATA_DIR):
        os.makedirs(DATA_DIR, exist_ok=True)

    # Application Settings
    API_PORT = int(os.getenv('API_PORT', 5000))
    MONITOR_INTERVAL = int(os.getenv('MONITOR_INTERVAL', 3600))  # seconds
    DATABASE_PATH = os.getenv('DATABASE_PATH', os.path.join(DATA_DIR, 'domains.db'))
    
    # Domain Extensions to Check
    DOMAIN_EXTENSIONS = [
        '.com', '.net', '.org', '.io', '.co', 
        '.ai', '.app', '.dev', '.store', '.biz', 
        '.info', '.me', '.tech', '.xyz', '.online',
        '.in'
    ]
    
    @staticmethod
    def get_email_config():
        """Get email configuration from DB or env"""
        # Avoid circular import
        from database import Database
        try:
            db = Database()
            return {
                'smtp_server': db.get_setting('smtp_server') or os.getenv('SMTP_SERVER', 'smtp.gmail.com'),
                'smtp_port': int(db.get_setting('smtp_port') or os.getenv('SMTP_PORT', 587)),
                'smtp_username': db.get_setting('smtp_username') or os.getenv('SMTP_USERNAME', ''),
                'smtp_password': db.get_setting('smtp_password') or os.getenv('SMTP_PASSWORD', ''),
                'smtp_from': db.get_setting('smtp_from') or os.getenv('SMTP_FROM', ''),
                'smtp_to': db.get_setting('smtp_to') or os.getenv('SMTP_TO', '')
            }
        except Exception:
            # Fallback if DB not ready
            return {
                'smtp_server': os.getenv('SMTP_SERVER', 'smtp.gmail.com'),
                'smtp_port': int(os.getenv('SMTP_PORT', 587)),
                'smtp_username': os.getenv('SMTP_USERNAME', ''),
                'smtp_password': os.getenv('SMTP_PASSWORD', ''),
                'smtp_from': os.getenv('SMTP_FROM', ''),
                'smtp_to': os.getenv('SMTP_TO', '')
            }

    @staticmethod
    def is_email_configured():
        """Check if email is properly configured"""
        config = Config.get_email_config()
        # Strict check: Must have username, password, TO address, AND server
        # Also ensure they are not just whitespace
        has_server = bool(config['smtp_server'] and str(config['smtp_server']).strip())
        has_user = bool(config['smtp_username'] and str(config['smtp_username']).strip())
        has_pass = bool(config['smtp_password'] and str(config['smtp_password']).strip())
        has_to = bool(config['smtp_to'] and str(config['smtp_to']).strip())
        
        return has_server and has_user and has_pass and has_to
