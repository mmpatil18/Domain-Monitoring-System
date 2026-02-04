# TEMPORARY FIX - Dialog Without API

The endpoint works in test mode but not in the running server. This might be a Flask reloading/caching issue.

## Quick Workaround: Make Dialog Work Without API

While we debug the Flask issue, let's make the dialog functional by storing preferences locally in Electron.

### Changes Needed:

1. Remove API calls from `getUserPreference()` and `saveUserPreference()`
2. Store preference in a local JSON file
3. Dialog works immediately
4. Later we can add API sync back

### Implementation:

Would you like me to:
1. **Option A**: Implement local file storage (works immediately, no API needed)
2. **Option B**: Continue debugging Flask (might take longer)
3. **Option C**: Restart Python with explicit no-cache flags

Which would you prefer?

## What We Know:

✅ Dialog appears correctly
✅ Endpoint code exists in api.py  
✅ Endpoint works with Flask test client (Status 200)
✅ Routes are registered in Flask
❌ Running Flask server returns 404 for the endpoint
❌ This happens even when starting Python manually

## Most Likely Cause:

Flask's debug mode auto-reloader might be serving cached bytecode or there's a routing precedence issue where `/api/settings` (POST) is intercepting requests to `/api/settings/<key>` (GET).

## Quick Test:

Try accessing directly in browser while app is running:
```
http://127.0.0.1:5000/api/settings/test
```

You should get JSON back, but if you get 404, it confirms the server routing issue.
