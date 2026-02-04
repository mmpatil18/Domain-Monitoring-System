import sqlite3
import os
import logging
from datetime import datetime
from config import Config

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class Database:
    def __init__(self):
        # Ensure data directory exists
        db_dir = os.path.dirname(Config.DATABASE_PATH)
        if db_dir and not os.path.exists(db_dir):
            os.makedirs(db_dir)
        
        self.db_path = Config.DATABASE_PATH
        self.init_database()
    
    def get_connection(self):
        """Get database connection"""
        conn = sqlite3.connect(self.db_path)
        conn.row_factory = sqlite3.Row
        return conn
    
    def init_database(self):
        """Initialize database tables"""
        conn = self.get_connection()
        cursor = conn.cursor()
        
        # Keywords table
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS keywords (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                keyword TEXT UNIQUE NOT NULL,
                added_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                active INTEGER DEFAULT 1
            )
        ''')
        
        # Domains table
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS domains (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                keyword_id INTEGER,
                domain TEXT UNIQUE NOT NULL,
                available INTEGER DEFAULT 0,
                checked_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                notified INTEGER DEFAULT 0,
                FOREIGN KEY (keyword_id) REFERENCES keywords(id)
            )
        ''')
        
        # Scan history table
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS scan_history (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                scan_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                keywords_scanned INTEGER DEFAULT 0,
                domains_found INTEGER DEFAULT 0,
                status TEXT
            )
        ''')
        
        # Settings table
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS settings (
                key TEXT PRIMARY KEY,
                value TEXT
            )
        ''')
        
        conn.commit()
        conn.close()
    
    def add_keyword(self, keyword):
        """Add a keyword to monitor"""
        conn = self.get_connection()
        cursor = conn.cursor()
        try:
            cursor.execute('INSERT INTO keywords (keyword) VALUES (?)', (keyword.lower().strip(),))
            conn.commit()
            keyword_id = cursor.lastrowid
            conn.close()
            return keyword_id
        except sqlite3.IntegrityError:
            # Keyword already exists
            cursor.execute('SELECT id FROM keywords WHERE keyword = ?', (keyword.lower().strip(),))
            result = cursor.fetchone()
            conn.close()
            return result[0] if result else None
    
    def add_keywords_bulk(self, keywords):
        """Add multiple keywords at once"""
        added = 0
        for keyword in keywords:
            if self.add_keyword(keyword):
                added += 1
        return added
    
    def get_all_keywords(self):
        """Get all active keywords"""
        conn = self.get_connection()
        cursor = conn.cursor()
        cursor.execute('SELECT * FROM keywords WHERE active = 1')
        keywords = cursor.fetchall()
        conn.close()
        return keywords
    
    def add_domain(self, keyword_id, domain, available):
        """
        Add or update a discovered domain.
        Returns status code:
        0: No change / irrelevant change
        1: New available domain
        2: Regained availability (Taken -> Available)
        3: Lost availability (Available -> Taken)
        """
        conn = self.get_connection()
        cursor = conn.cursor()
        
        status_code = 0
        
        try:
            # Check if domain exists first
            cursor.execute('SELECT id, available, notified FROM domains WHERE domain = ?', (domain,))
            existing = cursor.fetchone()
            
            if existing:
                domain_id = existing['id']
                was_available = existing['available']
                was_notified = existing['notified']
                
                # Logic for status changes
                if available == 1 and was_available == 0:
                    # REGAINED: Taken -> Available
                    # We MUST reset notified to 0 so the user gets an alert
                    cursor.execute('''
                        UPDATE domains 
                        SET available = 1, checked_date = ?, notified = 0 
                        WHERE id = ?
                    ''', (datetime.now(), domain_id))
                    status_code = 2 # Regained
                    
                elif available == 0 and was_available == 1:
                    # LOST: Available -> Taken
                    cursor.execute('''
                        UPDATE domains 
                        SET available = 0, checked_date = ? 
                        WHERE id = ?
                    ''', (datetime.now(), domain_id))
                    status_code = 3 # Lost
                    
                else:
                    # No significant status change (e.g. Taken->Taken or Available->Available)
                    # Just update checked_date
                    cursor.execute('''
                        UPDATE domains SET checked_date = ? WHERE id = ?
                    ''', (datetime.now(), domain_id))
                    status_code = 0
                    
            else:
                # NEW Domain
                cursor.execute('''
                    INSERT INTO domains (keyword_id, domain, available, checked_date, notified)
                    VALUES (?, ?, ?, ?, 0)
                ''', (keyword_id, domain, available, datetime.now()))
                
                if available:
                    status_code = 1 # New Available
                else:
                    status_code = 0 # New Taken (not interesting usually)
            
            conn.commit()
            conn.close()
            return status_code
            
        except sqlite3.Error as e:
            # Fallback for safety
            logger.error(f"Database error in add_domain: {e}")
            if conn:
                conn.close()
            return 0
    
    def get_available_domains(self, limit=100):
        """Get available domains"""
        conn = self.get_connection()
        cursor = conn.cursor()
        cursor.execute('''
            SELECT d.*, k.keyword 
            FROM domains d
            JOIN keywords k ON d.keyword_id = k.id
            WHERE d.available = 1
            ORDER BY d.checked_date DESC
            LIMIT ?
        ''', (limit,))
        domains = cursor.fetchall()
        conn.close()
        return domains
    
    def get_all_domains(self, limit=10000):
        """Get all domains (both available and taken)"""
        conn = self.get_connection()
        cursor = conn.cursor()
        cursor.execute('''
            SELECT d.*, k.keyword 
            FROM domains d
            JOIN keywords k ON d.keyword_id = k.id
            ORDER BY k.keyword, d.domain
            LIMIT ?
        ''', (limit,))
        domains = cursor.fetchall()
        conn.close()
        return domains
    
    def get_unnotified_domains(self):
        """Get available domains that haven't been notified yet"""
        conn = self.get_connection()
        cursor = conn.cursor()
        cursor.execute('''
            SELECT d.*, k.keyword 
            FROM domains d
            JOIN keywords k ON d.keyword_id = k.id
            WHERE d.available = 1 AND d.notified = 0
        ''')
        domains = cursor.fetchall()
        conn.close()
        return domains
    
    def mark_domains_notified(self, domain_ids):
        """Mark domains as notified"""
        conn = self.get_connection()
        cursor = conn.cursor()
        placeholders = ','.join('?' * len(domain_ids))
        cursor.execute(f'UPDATE domains SET notified = 1 WHERE id IN ({placeholders})', domain_ids)
        conn.commit()
        conn.close()
    
    def add_scan_record(self, keywords_count, domains_found, status):
        """Add a scan history record"""
        conn = self.get_connection()
        cursor = conn.cursor()
        cursor.execute('''
            INSERT INTO scan_history (keywords_scanned, domains_found, status)
            VALUES (?, ?, ?)
        ''', (keywords_count, domains_found, status))
        conn.commit()
        conn.close()

    def clear_all_data(self):
        """Clear all keywords and domains"""
        conn = self.get_connection()
        cursor = conn.cursor()
        
        # Disable foreign keys temporarily to avoid constraint issues if needed
        # But here we probably want to just delete everything
        cursor.execute('DELETE FROM domains')
        cursor.execute('DELETE FROM keywords')
        cursor.execute('DELETE FROM scan_history')
        
        # Reset auto-increment counters (optional but good for 'clean' state)
        cursor.execute('DELETE FROM sqlite_sequence WHERE name="domains"')
        cursor.execute('DELETE FROM sqlite_sequence WHERE name="keywords"')
        cursor.execute('DELETE FROM sqlite_sequence WHERE name="scan_history"')
        
        conn.commit()
        conn.close()
        return True

    def get_setting(self, key, default=None):
        """Get a setting value"""
        conn = self.get_connection()
        cursor = conn.cursor()
        cursor.execute('SELECT value FROM settings WHERE key = ?', (key,))
        result = cursor.fetchone()
        conn.close()
        return result['value'] if result else default

    def save_setting(self, key, value):
        """Save a setting value"""
        conn = self.get_connection()
        cursor = conn.cursor()
        cursor.execute('''
            INSERT OR REPLACE INTO settings (key, value)
            VALUES (?, ?)
        ''', (key, str(value)))
        conn.commit()
        conn.close()
