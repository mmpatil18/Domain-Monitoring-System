import sys
import os
import logging
import sqlite3

# Add backend to path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', 'backend'))

from database import Database

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("TestLogic")

def test_alert_logic():
    print("="*60)
    print("TESTING STATUS CHANGE LOGIC")
    print("="*60)
    
    db = Database()
    
    # 1. Setup Test Keyword
    keyword = "test_logic_keyword"
    keyword_id = db.add_keyword(keyword)
    print(f"Added keyword '{keyword}' with ID: {keyword_id}")
    
    domain_name = "test_status_change.com"
    
    # Clean up previous test data
    conn = db.get_connection()
    cursor = conn.cursor()
    cursor.execute("DELETE FROM domains WHERE domain = ?", (domain_name,))
    conn.commit()
    conn.close()
    
    # 2. Test NEW AVAILABLE
    print("\n--- Test 1: New Available ---")
    code = db.add_domain(keyword_id, domain_name, available=1)
    print(f"Result Code: {code} (Expected: 1)")
    if code == 1:
        print("✅ PASS: Correctly identified as New Available")
    else:
        print("❌ FAIL: Wrong code")

    # 3. Test NO CHANGE (Available -> Available)
    print("\n--- Test 2: No Change (Stay Available) ---")
    code = db.add_domain(keyword_id, domain_name, available=1)
    print(f"Result Code: {code} (Expected: 0)")
    if code == 0:
        print("✅ PASS: Correctly identified as No Change")
    else:
        print("❌ FAIL: Wrong code")

    # 4. Test LOST (Available -> Taken)
    print("\n--- Test 3: Lost (Become Taken) ---")
    code = db.add_domain(keyword_id, domain_name, available=0)
    print(f"Result Code: {code} (Expected: 3)")
    if code == 3:
        print("✅ PASS: Correctly identified as LOST")
    else:
        print(f"❌ FAIL: Returned {code}")
        
    # 5. Test NO CHANGE (Taken -> Taken)
    print("\n--- Test 4: No Change (Stay Taken) ---")
    code = db.add_domain(keyword_id, domain_name, available=0)
    print(f"Result Code: {code} (Expected: 0)")
    if code == 0:
        print("✅ PASS: Correctly identified as No Change")
    else:
        print("❌ FAIL: Wrong code")

    # 6. Test REGAINED (Taken -> Available)
    print("\n--- Test 5: Regained (Become Available) ---")
    code = db.add_domain(keyword_id, domain_name, available=1)
    print(f"Result Code: {code} (Expected: 2)")
    
    # Verify notified flag is reset
    conn = db.get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT notified FROM domains WHERE domain = ?", (domain_name,))
    notified = cursor.fetchone()['notified']
    conn.close()
    
    if code == 2 and notified == 0:
        print("✅ PASS: Correctly identified as REGAINED and reset notified=0")
    else:
        print(f"❌ FAIL: Code={code}, Notified={notified}")

    print("\n" + "="*60)
    print("TEST COMPLETE")

if __name__ == "__main__":
    test_alert_logic()
