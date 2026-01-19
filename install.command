#!/bin/bash

# Verba Install Script
# This script removes the macOS quarantine attribute and launches the app

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
APP_PATH="$SCRIPT_DIR/Verba.app"

echo "🚀 Installing Verba..."

if [ ! -d "$APP_PATH" ]; then
    echo "❌ Error: Verba.app not found in the same folder as this script."
    echo "   Make sure install.command and Verba.app are in the same folder."
    exit 1
fi

# Remove quarantine attribute
echo "🔓 Removing macOS quarantine attribute..."
xattr -cr "$APP_PATH"

echo "✅ Done! Launching Verba..."
open "$APP_PATH"

echo ""
echo "💡 Tip: You can now move Verba.app to your Applications folder."
echo "   The quarantine has been removed, so it will open normally."
