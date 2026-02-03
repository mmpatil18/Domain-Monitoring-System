import whois
import socket
import logging
from config import Config

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class DomainChecker:
    def __init__(self):
        self.extensions = Config.DOMAIN_EXTENSIONS
    
    def generate_domain_variations(self, keyword):
        """Generate domain name variations from keyword"""
        # Clean keyword
        clean_keyword = keyword.lower().strip().replace(' ', '')
        
        domains = []
        for ext in self.extensions:
            domains.append(f"{clean_keyword}{ext}")
        
        return domains
    
    def is_domain_available(self, domain):
        """
        Check if a domain is available
        Returns: True if available, False if taken, None if check failed
        """
        try:
            # Method 1: Try DNS lookup first (faster)
            try:
                socket.gethostbyname(domain)
                # If we get here, domain resolves (likely taken)
                return False
            except socket.gaierror:
                # Domain doesn't resolve, might be available
                pass
            
            # Method 2: Try WHOIS lookup
            try:
                w = whois.whois(domain)
                # If whois returns data, domain is likely registered
                if w.domain_name:
                    return False
                return True
            except Exception as whois_error:
                # WHOIS lookup failed, assume available
                logger.warning(f"WHOIS check failed for {domain}: {whois_error}")
                return True
                
        except Exception as e:
            logger.error(f"Error checking domain {domain}: {e}")
            return None
    
    def check_keyword_domains(self, keyword):
        """
        Check all domain variations for a keyword
        Returns: list of tuples (domain, is_available)
        """
        domains = self.generate_domain_variations(keyword)
        results = []
        
        for domain in domains:
            logger.info(f"Checking domain: {domain}")
            available = self.is_domain_available(domain)
            
            # Only add to results if check was successful
            if available is not None:
                results.append((domain, available))
                if available:
                    logger.info(f"✓ Domain available: {domain}")
                else:
                    logger.info(f"✗ Domain taken: {domain}")
        
        return results
