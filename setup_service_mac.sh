#!/bin/bash

# setup_service_mac.sh
# Setup Domain Monitor as a LaunchAgent (macOS)

echo "============================================================"
echo "Setting up Domain Monitor as macOS Service (LaunchAgent)"
echo "============================================================"
echo

# Get current directory
PROJECT_DIR=$(pwd)
USERNAME=$(whoami)

echo "[1/3] Configuration"
echo "Project Directory: $PROJECT_DIR"
echo "User: $USERNAME"

# Python path
if [ -d "venv" ]; then
    PYTHON_EXEC="$PROJECT_DIR/venv/bin/python"
    # Ensure venv python handles path correctly or use absolute path
else
    PYTHON_EXEC=$(which python3)
fi
echo "Python Executable: $PYTHON_EXEC"

# Create logs directory
mkdir -p logs

PLIST_NAME="com.$USERNAME.domainmonitor"
PLIST_FILE="$HOME/Library/LaunchAgents/$PLIST_NAME.plist"

echo
echo "[2/3] Creating LaunchAgent Plist at $PLIST_FILE..."

cat > $PLIST_FILE <<EOF
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>Label</key>
    <string>$PLIST_NAME</string>
    <key>ProgramArguments</key>
    <array>
        <string>$PYTHON_EXEC</string>
        <string>$PROJECT_DIR/backend/monitor_service.py</string>
    </array>
    <key>WorkingDirectory</key>
    <string>$PROJECT_DIR</string>
    <key>StandardOutPath</key>
    <string>$PROJECT_DIR/logs/monitor_output.log</string>
    <key>StandardErrorPath</key>
    <string>$PROJECT_DIR/logs/monitor_error.log</string>
    <key>RunAtLoad</key>
    <true/>
    <key>KeepAlive</key>
    <true/>
</dict>
</plist>
EOF

echo "Plist file created."

echo
echo "[3/3] Loading Service..."

# Unload if already loaded (ignore error)
launchctl unload $PLIST_FILE 2>/dev/null

# Load service
launchctl load $PLIST_FILE

echo
echo "============================================================"
echo "Domain Monitor service installed and started!"
echo "============================================================"
echo
echo "Management Commands:"
echo "- Status:  launchctl list | grep domainmonitor"
echo "- Stop:    launchctl unload $PLIST_FILE"
echo "- Start:   launchctl load $PLIST_FILE"
echo "- Logs:    tail -f logs/monitor_output.log"
echo
