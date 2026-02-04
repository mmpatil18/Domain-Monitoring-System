import sys
sys.path.insert(0, 'backend')

from api import app, db

# Test the function directly
print("Testing get_user_setting function directly:")
print("=" * 60)

with app.app_context():
    result = db.get_setting('minimize_on_close')
    print(f"Database get_setting result: {result}")
    print(f"Type: {type(result)}")
    
print("\n" + "=" * 60)
print("Testing Flask route:")

# Create a test client
client = app.test_client()

# Test the endpoint
response = client.get('/api/settings/minimize_on_close')
print(f"Status Code: {response.status_code}")
print(f"Response: {response.get_data(as_text=True)}")
