#!/bin/bash
set -e

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${GREEN}🚀 Starting Verba Installer...${NC}"

# 1. Fetch latest release tag from GitHub API
echo "🔍 Finding latest version..."
LATEST_TAG=$(curl -s https://api.github.com/repos/gvsrusa/verba/releases/latest | grep '"tag_name":' | sed -E 's/.*"([^"]+)".*/\1/')

if [ -z "$LATEST_TAG" ]; then
    echo -e "${RED}❌ Failed to find latest release. Please check your internet connection.${NC}"
    exit 1
fi

# Strip 'v' prefix if present (v0.2.0 -> 0.2.0)
VERSION=${LATEST_TAG#v}

echo -e "📦 Installing Version: ${GREEN}$VERSION${NC}"

# 2. Construct download URL (adjust naming convention as needed)
# Assumes filename format: Verba_0.2.0_macos.zip
DOWNLOAD_URL="https://github.com/gvsrusa/verba/releases/download/$LATEST_TAG/Verba_${VERSION}_macos.zip"

TEMP_DIR=$(mktemp -d)
ZIP_FILE="$TEMP_DIR/verba.zip"

# 3. Download
echo "⬇️  Downloading Verba..."
curl -L --fail -o "$ZIP_FILE" "$DOWNLOAD_URL"

if [ ! -f "$ZIP_FILE" ]; then
    echo -e "${RED}❌ Download failed.${NC}"
    exit 1
fi

# 4. Determine Install Directory
INSTALL_DIR="/Applications"
if [ ! -w "$INSTALL_DIR" ]; then
    echo "⚠️  /Applications is not writable. Installing to ~/Applications..."
    INSTALL_DIR="$HOME/Applications"
    mkdir -p "$INSTALL_DIR"
fi

echo "📂 Installing to $INSTALL_DIR..."

# Remove existing app if present
if [ -d "$INSTALL_DIR/Verba.app" ]; then
    rm -rf "$INSTALL_DIR/Verba.app"
fi

unzip -q -o "$ZIP_FILE" -d "$INSTALL_DIR"

# 5. Remove quarantine (Critical step)
echo "🔓 Removing security restrictions..."
xattr -cr "$INSTALL_DIR/Verba.app"

# 6. Cleanup
rm -rf "$TEMP_DIR"

echo -e "${GREEN}✅ Installation Successful!${NC}"
echo "🎉 Launching Verba..."

open "$INSTALL_DIR/Verba.app"
