# Verba - AI Dictation Assistant

A high-performance, system-wide AI dictation app for macOS.
Built with **Rust (Tauri)** and **React**, Verba lets you dictate text into *any* application using a global hotkey.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Platform](https://img.shields.io/badge/platform-macOS-lightgrey.svg)

## ✨ Features

- **Global Hotkey**: Press **Option + Space** anywhere to start/stop recording
- **Multi-Provider Support**: Use **Groq** (ultra-fast), **OpenRouter**, or **Grok (xAI)**
- **Instant Typing**: Transcribed text is typed directly into your active window
- **Persistent Settings**: Your API keys are stored locally and persist across restarts
- **Privacy Focused**: Audio is processed via your chosen provider; keys never leave your machine

---

## 📥 Quick Start (Download)

1. Download the latest `Verba_x.x.x_macos.zip` from the [Releases Page](https://github.com/gvsrusa/whisper-flow/releases)
2. Extract the zip file
3. **Right-click `install.command`** → **Open** → Click **Open** when prompted
4. Grant **Accessibility** and **Microphone** permissions when prompted
5. Configure your API key in Settings → Providers
6. (Optional) Move **Verba.app** to your Applications folder

### ⚠️ If You See "Verba is damaged and can't be opened"

If the install script doesn't work, open **Terminal** and run:

```bash
xattr -cr ~/Downloads/Verba_0.2.0_macos
```

Then run `install.command` or open `Verba.app` directly.

> **Why this happens**: macOS blocks unsigned apps from the internet. The `xattr -cr` command removes this restriction.

---

## � Getting API Keys

Verba supports multiple AI providers for speech-to-text. Choose one and follow the setup guide below.

### Groq (Recommended - Fast & Free Tier)

Groq offers **ultra-fast** Whisper transcription with a generous free tier.

1. Go to [console.groq.com](https://console.groq.com) and create an account
2. Verify your email and log in
3. Navigate to **API Keys** in the left sidebar
4. Click **Create API Key**
5. Name your key (e.g., "Verba") and click **Submit**
6. **Copy the key immediately** — it won't be shown again!

Your key will look like: `gsk_xxxxxxxxxxxxxxxxxxxxxx`

**Model to use**: `whisper-large-v3`

---

### OpenRouter (Access 300+ Models)

OpenRouter provides access to multiple AI providers with a single API key.

1. Go to [openrouter.ai](https://openrouter.ai) and sign up
2. Navigate to **Keys** in the dashboard
3. Click **Create Key**
4. Name your key and optionally set a credit limit
5. **Copy the key immediately** — store it securely!

Your key will look like: `sk-or-xxxxxxxxxxxxxxxxxxxxxx`

**Model to use**: `openai/whisper-large-v3`

---

### Grok / xAI

xAI's Grok API provides advanced transcription capabilities.

1. Ensure you have an **X Premium** subscription
2. Go to [console.x.ai](https://console.x.ai)
3. Sign in with your X account
4. Navigate to **API Keys** or **Settings**
5. Click **Create API Key**
6. Configure permissions and click **Generate**
7. **Copy the key immediately** — it's shown only once!

Your key will look like: `xai-xxxxxxxxxxxxxxxxxxxxxx`

**Model to use**: `grok-2-vision` (or latest available)

---

## 🛠 Configuration

### First-Time Setup

1. **Launch Verba**
2. Click the **Settings** (gear icon) in the sidebar
3. Go to **Providers** tab
4. Select your provider (e.g., **Groq**)
5. Paste your API key
6. Close settings — your key is saved automatically!

### Granting Permissions

Verba needs two permissions to work:

#### Microphone Permission
- macOS will prompt you on first recording
- Grant access to allow audio capture

#### Accessibility Permission (Required for typing)

1. When the Accessibility dialog appears, click **"Open System Settings"**
2. Go to **Privacy & Security → Accessibility**
3. Find **Verba** in the list and **toggle it ON**
4. You may need to click the 🔒 lock icon first
5. **Restart Verba** for changes to take effect

> ⚠️ **After rebuilding**: If you rebuild the app, you may need to remove the old entry and re-add the new one in Accessibility settings.

---

## 🎤 How to Dictate

1. Click into any text input (Notes, VS Code, Slack, browser, etc.)
2. Press **Option + Space** to start recording
3. Speak clearly
4. Press **Option + Space** again to stop
5. Wait 1-2 seconds for transcription
6. Text appears in your active input!

---

## 🚀 Development Guide

### Prerequisites

- **Node.js** v18+: `node -v`
- **Rust** (latest stable): `rustc --version`
  - Install: `curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh`
- **Xcode Command Line Tools**: `xcode-select --install`

### Installation

```bash
git clone https://github.com/gvsrusa/whisper-flow.git
cd whisper-flow
npm install
```

### Running Locally

```bash
npm run tauri dev
```

### Building for Production

```bash
npm run tauri build
```

Output: `src-tauri/target/release/bundle/macos/Verba.app`

---

## ❓ Troubleshooting

**Q: Nothing happens when I press Option + Space**
A: Another app (Raycast, Spotlight) may be using this shortcut. Check for conflicts.

**Q: Recording works but no text appears**
A: Ensure Verba has **Accessibility** permission in System Settings.

**Q: "API Key not set" error**
A: Open Settings → Providers and paste your API key.

**Q: Audio not recording**
A: Grant **Microphone** permission in System Settings → Privacy & Security → Microphone.

**Q: App keeps asking for Accessibility permission after rebuild**
A: Remove the old entry in System Settings → Accessibility, then add the new app.

---

## 📁 Data Storage

Your settings (including API keys) are stored locally at:
```
~/Library/Application Support/whisper-flow/settings.json
```

---

## License

This project is licensed under the MIT License.
