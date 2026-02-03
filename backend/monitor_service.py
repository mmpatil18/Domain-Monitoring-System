import time
import logging
import sys
import os
from datetime import datetime

# Add backend to path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from config import Config
from database import Database
from domain_checker import DomainChecker
from email_notifier import EmailNotifier

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

class MonitorService:
    def __init__(self):
        self.db = Database()
        self.checker = DomainChecker()
        self.notifier = EmailNotifier()
        self.interval = Config.MONITOR_INTERVAL
        logger.info(f"Monitor Service initialized. Check interval: {self.interval} seconds")
    
    def run_scan(self):
        """Run a single scan of all keywords"""
        logger.info("=" * 60)
        logger.info("Starting domain scan...")
        
        # Get all active keywords
        keywords = self.db.get_all_keywords()
        
        if not keywords:
            logger.info("No keywords to monitor. Waiting for keywords...")
            self.db.add_scan_record(0, 0, "No keywords")
            return
        
        logger.info(f"Scanning {len(keywords)} keyword(s)")
        total_domains_found = 0
        
        # Check each keyword
        for keyword_row in keywords:
            keyword_id = keyword_row['id']
            keyword = keyword_row['keyword']
            
            logger.info(f"\nChecking keyword: '{keyword}'")
            
            # Get domain variations and check availability
            results = self.checker.check_keyword_domains(keyword)
            
            # Store results in database
            for domain, available in results:
                self.db.add_domain(keyword_id, domain, 1 if available else 0)
                if available:
                    total_domains_found += 1
        
        logger.info(f"\nScan complete. Found {total_domains_found} available domain(s)")
        
        # Send email notifications for new domains
        self.send_notifications()
        
        # Record scan in history
        self.db.add_scan_record(len(keywords), total_domains_found, "Success")
        logger.info("=" * 60)
    
    def send_notifications(self):
        """Send email notifications for unnotified domains"""
        unnotified = self.db.get_unnotified_domains()
        
        if not unnotified:
            logger.info("No new domains to notify about.")
            return
        
        logger.info(f"Preparing to notify about {len(unnotified)} domain(s)")
        
        # Convert to list of dicts for email
        domains_to_notify = []
        domain_ids = []
        
        for domain_row in unnotified:
            domains_to_notify.append({
                'domain': domain_row['domain'],
                'keyword': domain_row['keyword']
            })
            domain_ids.append(domain_row['id'])
        
        # Send notification
        if self.notifier.send_domain_alert(domains_to_notify):
            # Mark as notified
            self.db.mark_domains_notified(domain_ids)
            logger.info("Domains marked as notified")
    
    def run_continuous(self):
        """Run the monitor service continuously"""
        logger.info("Domain Monitor Service Started")
        logger.info(f"Monitoring interval: {self.interval} seconds ({self.interval // 60} minutes)")
        logger.info("Press Ctrl+C to stop\n")
        
        try:
            while True:
                self.run_scan()
                
                logger.info(f"\nNext scan in {self.interval} seconds...")
                logger.info(f"Waiting until {datetime.fromtimestamp(time.time() + self.interval).strftime('%Y-%m-%d %H:%M:%S')}\n")
                
                time.sleep(self.interval)
                
        except KeyboardInterrupt:
            logger.info("\n\nMonitor Service stopped by user")
        except Exception as e:
            logger.error(f"Monitor Service error: {e}", exc_info=True)

if __name__ == '__main__':
    service = MonitorService()
    service.run_continuous()
