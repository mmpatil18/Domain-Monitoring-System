# Tray Icon Troubleshooting

The app shows:
✅ Tray created successfully
✅ Window hides successfully  
✅ Tray exists = true

But then the app closes with **no quit events** firing. This is unusual.

## Possible Causes

### 1. Tray Icon is Hidden in Windows Overflow

**Check this first!**

The tray icon might exist but be hidden in the overflow area.

**How to check:**
1. Look at bottom-right of taskbar
2. Click the **up arrow (^)** near the system tray
3. This shows hidden tray icons
4. Look for "Domain Monitor" icon

![Where to find hidden icons](C:/Users/91934/.gemini/antigravity/brain/32673551-d4c0-4513-8f1c-b26ed4b8b5f8/uploaded_media_1770134747999.png)

### 2. Process Dying Without Quit Events

The fact that NO quit events fire is very suspicious:
- No `before-quit`
- No `will-quit`  
- No `window-all-closed`
- No `quit`

This suggests the Node.js process itself is dying, not Electron quitting gracefully.

**Possible reasons:**
- Exception/crash
- Python subprocess killing parent
- Windows killing the process
- Port conflict causing crash

### 3. Terminal Closing

Are you running in a terminal that closes automatically?

---

## Tests to Try

### Test 1: Check for Hidden Tray Icon

```powershell
npm run dev
# Close window
# Click ^ arrow in system tray
# Look for "Domain Monitor"
```

If you see it there → **App is working!** Just hidden.

### Test 2: Keep Terminal Open

Make sure your PowerShell terminal stays open after the app seems to close.

Look for:
- Python still running?
- Any error messages?

Check processes:
```powershell
Get-Process | Where-Object {$_.ProcessName -like "*electron*" -or $_.ProcessName -like "*python*"}
```

If you see processes → **App is still running!**

### Test 3: Run Electron Directly

```powershell
.\node_modules\.bin\electron . --dev
```

This runs Electron directly - might show different error output.

### Test 4: Check Event Viewer

Windows Event Viewer might show crash logs:
1. Press `Win + R`
2. Type `eventvwr.msc`
3. Look in "Windows Logs" → "Application"
4. Filter for errors around the time you closed the app

---

## Quick Fix: Force Tray to Show

Let's make the tray icon ALWAYS visible by setting its visibility:

Would you like me to add code to force the tray icon to be visible?

---

## What to Send Me

Please check and send:

1. **After closing window, do you see:**
   - Electron process still running? (check Task Manager)
   - Python processes still running?
   - Tray icon in overflow area (click ^ arrow)?

2. **Console output:** Any errors after "Tray still exists: true"?

3. **Task Manager:** Screenshot of processes after "closing"
