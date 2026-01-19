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

# 2. Detect Architecture
ARCH=$(uname -m)
if [ "$ARCH" == "arm64" ]; then
    FILE_ARCH="aarch64"
else
    FILE_ARCH="x64"
fi

echo -e "📦 Installing Version: ${GREEN}$VERSION${NC} for ${GREEN}$FILE_ARCH${NC}"

# 3. Construct download URL
# Expecting: Verba_0.2.2_aarch64.dmg or Verba_0.2.2_x64.dmg
DOWNLOAD_URL="https://github.com/gvsrusa/verba/releases/download/$LATEST_TAG/Verba_${VERSION}_${FILE_ARCH}.dmg"

TEMP_DIR=$(mktemp -d)
DMG_FILE="$TEMP_DIR/verba.dmg"

# 4. Download
echo "⬇️  Downloading Verba..."
curl -L --fail -o "$DMG_FILE" "$DOWNLOAD_URL"

if [ ! -f "$DMG_FILE" ]; then
    echo -e "${RED}❌ Download failed.${NC}"
    echo "URL: $DOWNLOAD_URL"
    exit 1
fi

# 5. Determine Install Directory
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

# 6. Mount DMG and Install
echo "💿 Mounting DMG..."
# Attach and get mount point
MOUNT_POINT=$(hdiutil attach -nobrowse "$DMG_FILE" | grep "/Volumes" | awk '{print $NF}')

if [ -z "$MOUNT_POINT" ]; then
    echo -e "${RED}❌ Failed to mount DMG.${NC}"
    exit 1
fi

echo "📋 Copying Verba.app..."
cp -R "$MOUNT_POINT/Verba.app" "$INSTALL_DIR/"

echo "⏏️  Unmounting..."
hdiutil detach "$MOUNT_POINT" -quiet

# 7. Remove quarantine (Critical step)
echo "🔓 Removing security restrictions..."
xattr -cr "$INSTALL_DIR/Verba.app"

# 8. Cleanup
rm -rf "$TEMP_DIR"

echo -e "${GREEN}✅ Installation Successful!${NC}"
echo "🎉 Launching Verba..."

open "$INSTALL_DIR/Verba.app"
