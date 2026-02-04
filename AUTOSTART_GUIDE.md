# Running Domain Monitor 24/7

You can run the backend monitoring service continuously in the background on any operating system. This ensures domains are checked even when the application window is closed.

---

## 🖥️ Windows

### Method 1: Windows Service (RECOMMENDED)
**Best for**: True server-like operation, runs when logged out, auto-restarts.

1.  **Download NSSM** (Non-Sucking Service Manager):
    *   Download from https://nssm.cc/download
    *   Extract `nssm.exe` to this project folder.
2.  **Run Installer**:
    ```powershell
    # Run as Administrator
    .\install_as_service.bat
    ```

### Method 2: Startup Folder (EASY)
**Best for**: Simple desktop use, runs when you log in.

```powershell
.\setup_autostart.bat
```

---

## 🐧 Linux

**Systemd Service** (Standard for most distros like Ubuntu, Debian, CentOS)

1.  **Make script executable**:
    ```bash
    chmod +x setup_service_linux.sh
    ```
2.  **Run Installer**:
    ```bash
    sudo ./setup_service_linux.sh
    ```

**Management**:
```bash
sudo systemctl status domain-monitor
sudo systemctl stop domain-monitor
sudo systemctl restart domain-monitor
```

---

## 🍎 macOS

**LaunchAgent** (Standard macOS background service)

1.  **Make script executable**:
    ```bash
    chmod +x setup_service_mac.sh
    ```
2.  **Run Installer**:
    ```bash
    ./setup_service_mac.sh
    ```

**Management**:
```bash
# Unload (Stop)
launchctl unload ~/Library/LaunchAgents/com.YOURUSERNAME.domainmonitor.plist

# Load (Start)
launchctl load ~/Library/LaunchAgents/com.YOURUSERNAME.domainmonitor.plist
```

---

## 📝 Logging

Logs are stored in the `logs/` directory in your project folder.

- `monitor_output.log`: Standard output info
- `monitor_error.log`: Error messages

View logs in real-time:
*   **Windows**: `Get-Content logs\monitor_output.log -Wait`
*   **Linux/Mac**: `tail -f logs/monitor_output.log`
