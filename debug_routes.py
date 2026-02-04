import sys
sys.path.insert(0, 'backend')

from api import app

print("All registered routes:")
print("=" * 60)
for rule in app.url_map.iter_rules():
    print(f"{rule.rule:<40} {', '.join(rule.methods)}")
print("=" * 60)

# Test specifically
print("\nSettings routes:")
for rule in app.url_map.iter_rules():
    if 'settings' in rule.rule:
        print(f"  {rule.rule} -> {rule.endpoint}")
