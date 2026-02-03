#!/bin/bash
# ============================================
# Domain Monitor - Build Script (Linux/macOS)
# ============================================

set -e  # Exit on error

echo ""
echo "========================================"
echo "  Building Domain Monitor"
echo "========================================"
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "[ERROR] Node.js is not installed!"
    echo "Please install Node.js from https://nodejs.org/"
    exit 1
fi

echo "[1/5] Installing Node.js dependencies..."
npm install

echo ""
echo "[2/5] Installing Python build dependencies..."
if [ -d "venv" ]; then
    source venv/bin/activate
fi

pip3 install pyinstaller || echo "[WARNING] Failed to install PyInstaller, will use fallback method"

echo ""
echo "[3/5] Bundling Python backend..."
npm run bundle-python

echo ""
echo "[4/5] Building Electron application..."
echo "Choose build target:"
echo "  1. Current platform only (fastest)"
echo "  2. All platforms (Windows, macOS, Linux)"
echo ""
read -p "Enter choice (1 or 2): " choice

case "$choice" in
    1)
        if [[ "$OSTYPE" == "darwin"* ]]; then
            echo "Building for macOS..."
            npm run build:mac
        elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
            echo "Building for Linux..."
            npm run build:linux
        else
            echo "Building for current platform..."
            npm run build
        fi
        ;;
    2)
        echo "Building for all platforms..."
        npm run build:all
        ;;
    *)
        echo "Building for current platform (default)..."
        npm run build
        ;;
esac

echo ""
echo "[5/5] Build complete!"
echo ""
echo "========================================"
echo "  Build Summary"
echo "========================================"
echo "Output directory: dist-electron/"
echo ""
ls -lh dist-electron/
echo ""
echo "========================================"
echo "Build completed successfully! 🎉"
echo "========================================"
echo ""
