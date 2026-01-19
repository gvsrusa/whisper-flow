$ErrorActionPreference = "Stop"

Write-Host "🚀 Starting Verba Installer..." -ForegroundColor Green

# 1. Fetch latest release tag
Write-Host "🔍 Finding latest version..."
try {
    $latestRelease = Invoke-RestMethod -Uri "https://api.github.com/repos/gvsrusa/verba/releases/latest"
    $tagName = $latestRelease.tag_name
} catch {
    Write-Host "❌ Failed to find latest release. Please check your internet connection." -ForegroundColor Red
    exit 1
}

if ([string]::IsNullOrWhiteSpace($tagName)) {
    Write-Host "❌ Could not retrieve tag name." -ForegroundColor Red
    exit 1
}

# Remove 'v' prefix for filename construction if needed (e.g. v0.2.0 -> 0.2.0)
$version = $tagName -replace "^v", ""

Write-Host "📦 Installing Version: $version" -ForegroundColor Green

# 2. Construct URL
# Filename format expected: Verba_0.2.0_x64-setup.exe
$downloadUrl = "https://github.com/gvsrusa/verba/releases/download/$tagName/Verba_${version}_x64-setup.exe"

$tempDir = [System.IO.Path]::GetTempPath()
$installerPath = Join-Path $tempDir "VerbaSetup.exe"

# 3. Download
Write-Host "⬇️  Downloading Verba..."
try {
    Invoke-WebRequest -Uri $downloadUrl -OutFile $installerPath
} catch {
    Write-Host "❌ Download failed." -ForegroundColor Red
    Write-Host "URL attempted: $downloadUrl"
    exit 1
}

# 4. Run Installer
Write-Host "🎉 Launching Installer..."
Start-Process -FilePath $installerPath -Wait

# Cleanup? Windows installers usually handle themselves, but we can remove the downloaded exe if we want.
# Keeping it simple for now.

Write-Host "✅ Installer finished." -ForegroundColor Green
