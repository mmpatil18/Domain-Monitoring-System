# Manual Backend Restart - Fix 404 Error

The API endpoints exist in the code, but the Python backend isn't loading them.

## Solution: Manually restart Python backend

### Option 1: Test API endpoint directly

**Open a new terminal** and test:

```powershell
# Test if endpoint works
curl http://127.0.0.1:5000/api/settings/minimize_on_close
```

**Expected**: Should return JSON with `{"success":true,"key":"minimize_on_close","value":null}`

**If you get 404**: Backend needs restart

---

### Option 2: Force restart everything

1. **Stop current npm run dev** (Ctrl+C)

2. **Kill all Python processes**:
   ```powershell
   Get-Process python -ErrorAction SilentlyContinue | Stop-Process -Force
   ```

3. **Wait 2 seconds**

4. **Start fresh**:
   ```powershell
   npm run dev
   ```

5. **Wait for "Dashboard: http://localhost:5000" message**

6. **Test the endpoint**:
   ```powershell
   curl http://127.0.0.1:5000/api/settings/test
   ```

---

### Option 3: Run backend manually (debug mode)

**Terminal 1 - Start backend**:
```powershell
cd d:\dms1\backend
python api.py
```

**Terminal 2 - In separate terminal, start Electron**:
```powershell
cd d:\dms1
npm start
```

This way you can see Python output directly.

---

### Option 4: Check if venv is activated

The backend might be running from wrong Python. Check:

```powershell
cd d:\dms1
.\venv\Scripts\python.exe backend\api.py
```

If you see the API starting, that's the correct Python. Use this to verify the endpoints are loaded.

---

## Quick Test Script

Save this as `test_api.ps1`:

```powershell
# Test API endpoints
Write-Host "Testing API endpoints..." -ForegroundColor Yellow

Start-Sleep -Seconds 2

$response = Invoke-WebRequest -Uri "http://127.0.0.1:5000/api/settings/minimize_on_close" -ErrorAction SilentlyContinue

if ($response.StatusCode -eq 200) {
    Write-Host "✓ API endpoint working!" -ForegroundColor Green
    Write-Host $response.Content
} else {
    Write-Host "✗ API endpoint not found (404)" -ForegroundColor Red
    Write-Host "Backend needs restart"
}
```

Run:
```powershell
.\test_api.ps1
```

---

**Try Option 2 (force restart) first!**
