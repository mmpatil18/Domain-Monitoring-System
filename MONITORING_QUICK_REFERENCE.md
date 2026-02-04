# 📋 Monitoring Quick Reference

Quick answers to common monitoring questions.

---

## ❓ How does 24/7 monitoring work?

**Answer**: The monitoring service **automatically starts** when you launch the application and runs **continuously in the background**.

**What it does:**
1. Scans all your keywords at regular intervals (default: 30 minutes)
2. Checks domain availability using WHOIS/DNS queries
3. Stores results in local SQLite database
4. Sends email alerts when new domains become available
5. Runs even when you close the window (stays in system tray)

---

## 👀 How do users know it's running?

### System Tray Icon
- **Location**: Bottom-right corner of Windows taskbar
- **Look for**: Domain Monitor icon
- **Hover**: Tooltip shows "Domain Monitor"
- **Right-click**: Menu with options

### In the Application
- **Scan History Tab**: Shows all recent scans with timestamps
- **Dashboard**: Shows "Last Scan: X minutes ago"
- **Domains Tab**: Shows when domains were last checked

### Verification Steps
1. Open application
2. Go to "Scan History" tab
3. See recent scans listed
4. If scans appear every 30 minutes → It's working! ✅

---

## ⏰ Current Scan Interval

**Default**: **30 minutes** (1800 seconds)

**NOT 6 hours** - that was an error in some documentation.

---

## 🔧 How to Change Scan Frequency

### Method 1: Quick Edit

1. **Close** Domain Monitor
2. **Press** Windows+R
3. **Type**: `%APPDATA%\domain-monitor`
4. **Open** `.env` file in Notepad
5. **Find**: `MONITOR_INTERVAL=1800`
6. **Change** to desired interval (see table below)
7. **Save** and **restart** application

### Method 2: PowerShell

```powershell
# Change to 15 minutes
$envPath = "$env:APPDATA\domain-monitor\.env"
(Get-Content $envPath) -replace 'MONITOR_INTERVAL=.*', 'MONITOR_INTERVAL=900' | Set-Content $envPath
```

---

## 📊 Common Intervals

| Frequency | Seconds | Code |
|-----------|---------|------|
| **15 minutes** | 900 | `MONITOR_INTERVAL=900` |
| **30 minutes** ⭐ | 1800 | `MONITOR_INTERVAL=1800` (default) |
| **1 hour** | 3600 | `MONITOR_INTERVAL=3600` |
| **2 hours** | 7200 | `MONITOR_INTERVAL=7200` |
| **6 hours** | 21600 | `MONITOR_INTERVAL=21600` |
| **12 hours** | 43200 | `MONITOR_INTERVAL=43200` |
| **24 hours** | 86400 | `MONITOR_INTERVAL=86400` |

---

## ⚠️ Which Interval Should You Choose?

### For Your Project (Developer)

Edit `d:\dms1\.env`:

```powershell
# Quick change to 15 minutes
(Get-Content d:\dms1\.env) -replace 'MONITOR_INTERVAL=.*', 'MONITOR_INTERVAL=900' | Set-Content d:\dms1\.env
```

### Recommendations

| Use Case | Recommendation |
|----------|---------------|
| **High-priority domains** | 15-30 minutes |
| **General monitoring** | 30 minutes - 1 hour ⭐ |
| **Low-priority** | 2-6 hours |
| **Occasional check** | 12-24 hours |

**Shorter = Faster detection, but more resource usage**

**Longer = Less resource usage, but slower detection**

---

## 🎮 System Tray Menu

Right-click tray icon:

```
Show Domain Monitor    ← Open main window
Open in Browser        ← Open in browser
─────────────────────
Restart Monitoring     ← Force restart service
─────────────────────
Quit                   ← Stop app completely
```

**Use "Restart Monitoring" if:**
- You changed `.env` settings
- Monitoring seems stuck
- Want to trigger immediate scan

---

## 🔍 Troubleshooting

### Monitoring not working?

**Check 1**: Look at Scan History
```
Open app → Scan History tab → See recent scans?
```

**Check 2**: Verify service is running
```
Right-click tray icon → "Restart Monitoring"
```

**Check 3**: Check logs
```
Windows+R → %APPDATA%\domain-monitor\logs
```

### Changed interval but not working?

**Solution**: Must restart application!
```
Right-click tray → Quit → Relaunch app
```

---

## 📁 File Locations

### Configuration File
```
%APPDATA%\domain-monitor\.env
```

###  Database
```
%APPDATA%\domain-monitor\data\domains.db
```

### Logs
```
%APPDATA%\domain-monitor\logs\
```

---

## 🎯 Quick Commands

### View current interval
```powershell
findstr MONITOR_INTERVAL %APPDATA%\domain-monitor\.env
```

### Change to 15 minutes
```powershell
cd %APPDATA%\domain-monitor
notepad .env
# Change MONITOR_INTERVAL=1800 to MONITOR_INTERVAL=900
```

### Restart application
```
Right-click system tray → Quit → Relaunch from Start Menu
```

---

## 📖 Full Documentation

For complete details, see: **[MONITORING_GUIDE.md](MONITORING_GUIDE.md)**

---

**Need help?** Check the full monitoring guide or open an issue!
