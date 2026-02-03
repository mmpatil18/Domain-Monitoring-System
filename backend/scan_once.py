"""
Quick script to run a single domain scan immediately
"""
import sys
import os

# Add backend to path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from monitor_service import MonitorService

if __name__ == '__main__':
    print("=" * 60)
    print("Running immediate domain scan...")
    print("=" * 60)
    
    service = MonitorService()
    service.run_scan()
    
    print("\n" + "=" * 60)
    print("Scan complete! Check the results in your dashboard.")
    print("=" * 60)
