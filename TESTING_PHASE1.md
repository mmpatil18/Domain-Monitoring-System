# 🔧 IPv6 Fix Applied

## What Just Happened

You tested the dialog and it **worked correctly!** 

### What You Did:
1. Closed the window → Dialog appeared ✅
2. Clicked **"Quit Completely"** → App quit ✅

This is the expected behavior! The console log confirms it:
```
Quitting app...
```

### What the Error Means

The `ECONNREFUSED ::1:5000` error happens because:
- Node.js tried to connect to `localhost`
- On Windows, `localhost` sometimes resolves to `::1` (IPv6)
- But Flask is only listening on `127.0.0.1` (IPv4)
- Connection fails

**This is now fixed** - Changed `localhost` to `127.0.0.1` in the code.

---

## ✅ Test Plan: Minimize to Tray

Try again, but this time choose **"Minimize to Tray"**:

### Steps:

1. **Start app**:
   ```powershell
   npm run dev
   ```

2. **Wait** 2-3 seconds for app to fully load

3. **Close window** (click X button)

4. **Dialog appears** - You'll see:
   - Title: "Keep Domain Monitor Running?"
   - Button 1: **"Minimize to Tray"** ← Click this one!
   - Button 2: "Quit Completely"
   - Checkbox: "Remember my choice"

5. **Click "Minimize to Tray"**

6. **Expected Results**:
   - Console: `"Minimizing to tray..."`
   - Window disappears
   - **Tray icon appears** in system tray (bottom-right of taskbar)
   - App still running

7. **Find the tray icon**:
   - Look in bottom-right corner of Windows taskbar
   - Near clock and Wi-Fi icon
   - Should see "Domain Monitor" icon

8. **Restore window**:
   - Double-click the tray icon
   - OR right-click → "Show Domain Monitor"

9. **Test Pause/Resume**:
   - Right-click tray icon
   - Click "⏸ Pause Monitoring"
   - Menu text changes to "▶ Resume Monitoring"
   - Click "Resume Monitoring"
   - Menu changes back to "Pause"

---

## 🎯 What to Look For

### Console Messages (Good):

```
Minimizing to tray...
Preference saved: minimize
System tray created
```

### Console Messages (Also OK):

```
Error getting preference: ... (can ignore, will be saved next time)
Minimizing to tray...
Could not save preference: ... (non-fatal)
System tray created
```

### Tray Icon Location:

![Tray Icon Location](C:/Users/91934/.gemini/antigravity/brain/32673551-d4c0-4513-8f1c-b26ed4b8b5f8/uploaded_media_1770134747999.png)

Look in the system tray area circled in red (your screenshot shows where to look).

---

## 🐛 If Tray Icon Still Doesn't Appear

### Check 1: Icon file exists

```powershell
Test-Path d:\dms1\resources\icon.ico
```

Should return `True`.

### Check 2: Console for tray error

Look for:
```
Tray icon not found: ...
```

### Check 3: Hidden tray icons

Click the `^` arrow in system tray to show hidden icons.

---

## 📊 Different Dialog Choices

| Your Choice | What Happens | Checkbox |
|-------------|--------------|----------|
| **Minimize to Tray** | Window hides, tray icon appears, monitoring continues | If checked: Always minimizes |
| **Quit Completely** | App closes, tray disappears, monitoring stops | If checked: Always quits |

---

## 🔄 To Reset and Test Again

```powershell
# Stop app (Ctrl+C)

# Delete preference to test fresh
Remove-Item -Force $env:APPDATA\domain-monitor\domains.db

# Restart
npm run dev
```

---

**Try clicking "Minimize to Tray" this time!** The IPv6 error should be gone now. 🎯
