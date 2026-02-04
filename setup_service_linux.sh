#!/bin/bash

# setup_service_linux.sh
# Setup Domain Monitor as a systemd service (Linux)

echo "============================================================"
echo "Setting up Domain Monitor as Linux Service (Systemd)"
echo "============================================================"
echo

# Check if running as root
if [ "$EUID" -ne 0 ]; then 
  echo "Please run as root (use sudo)"
  exit 1
fi

# Get current directory and username
# Assuming script is run from project root
PROJECT_DIR=$(pwd)
USERNAME=$(logname 2>/dev/null || echo $SUDO_USER)

if [ -z "$USERNAME" ]; then
    echo "Could not detect username. Please run with sudo from your user account."
    exit 1
fi

echo "[1/3] Configuration"
echo "Project Directory: $PROJECT_DIR"
echo "User: $USERNAME"

# Python path
if [ -d "venv" ]; then
    PYTHON_EXEC="$PROJECT_DIR/venv/bin/python"
else
    PYTHON_EXEC=$(which python3)
fi
echo "Python Executable: $PYTHON_EXEC"

# Create logs directory
mkdir -p logs
chown $USERNAME:$USERNAME logs

SERVICE_FILE="/etc/systemd/system/domain-monitor.service"

echo
echo "[2/3] Creating Service File at $SERVICE_FILE..."

cat > $SERVICE_FILE <<EOF
[Unit]
Description=Domain Monitor Backend Service
After=network.target

[Service]
Type=simple
User=$USERNAME
WorkingDirectory=$PROJECT_DIR
ExecStart=$PYTHON_EXEC $PROJECT_DIR/backend/monitor_service.py
Restart=always
RestartSec=10
StandardOutput=append:$PROJECT_DIR/logs/monitor_output.log
StandardError=append:$PROJECT_DIR/logs/monitor_error.log
Environment="PYTHONUNBUFFERED=1"

[Install]
WantedBy=multi-user.target
EOF

echo "Service file created."

echo
echo "[3/3] Enabling and Starting Service..."

systemctl daemon-reload
systemctl enable domain-monitor
systemctl start domain-monitor
systemctl status domain-monitor --no-pager

echo
echo "============================================================"
echo "Domain Monitor service installed and started!"
echo "============================================================"
echo
echo "Management Commands:"
echo "- Status:  sudo systemctl status domain-monitor"
echo "- Stop:    sudo systemctl stop domain-monitor"
echo "- Start:   sudo systemctl start domain-monitor"
echo "- Restart: sudo systemctl restart domain-monitor"
echo "- Logs:    tail -f logs/monitor_output.log"
echo
