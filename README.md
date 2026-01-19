# Wispr Flow Clone (Open Source)

A high-performance, system-wide AI dictation agent for macOS. 
Built with **Rust (Tauri)** and **React**, this app mimics the functionality of Wispr Flow, allowing you to dictate text into *any* application using global hotkeys.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Platform](https://img.shields.io/badge/platform-macOS-lightgrey.svg)

## ✨ Features

*   **Global Hotkey**: Press **Option + Space** (Alt+Space) anywhere to start/stop recording.
*   **Floating Widget**: Transparent, always-on-top, draggable UI that stays out of your way.
*   **Multi-Provider Support**: Use **Groq** (ultra-fast), **OpenRouter**, **Grok (xAI)**, or **Gemini**.
*   **Instant Typing**: The app simulates keyboard input to type the transcribed text directly into your active window (VS Code, Notes, Slack, etc.).
*   **Privacy Focused**: Your API keys are stored locally. Audio is processed via your chosen provider.

## 📥 Downloads

**Already just want to use the app?**
Go to the [Releases Page](https://github.com/yourusername/whisper-flow-clone/releases) to download the latest `.dmg` installer for macOS.

1.  Download the `.dmg` file.
2.  Open it and drag "Wispr Flow Clone" to your **Applications** folder.
3.  Open the app.

> **Note**: Since this app is not signed by Apple, you might need to Right-Click > Open and confirm you want to run it.

## 🚀 Development Guide

If you want to run the code locally or contribute, follow these steps.

### 1. Prerequisites

Ensure you have the following installed:

*   **Node.js** (v18+ recommended):
    ```bash
    node -v
    ```
*   **Rust** (Latest stable):
    ```bash
    rustc --version
    ```
    *If missing*: `curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh`
*   **Xcode Command Line Tools**:
    ```bash
    xcode-select --install
    ```

### 2. Installation

1.  Clone the repository:
    ```bash
    git clone https://github.com/yourusername/whisper-flow-clone.git
    cd whisper-flow-clone
    ```

2.  Install frontend dependencies:
    ```bash
    npm install
    ```

### 3. Running Locally

Start the development server with hot-reload:

```bash
npm run tauri dev
```

This command will:
1.  Start the Vite frontend server.
2.  Compile the Rust backend.
3.  Launch the application window.

## 🛠 Usage & Configuration

### Granting Permissions (Critical)
For the app to type text into other windows, it needs **Accessibility Permissions**.

1.  **Run the app**.
2.  Go to **System Settings > Privacy & Security > Accessibility**.
3.  Find your Terminal (if running via `npm run tauri dev`) or "Wispr Flow Clone" (if installed).
4.  **Enable the toggle**.
5.  *Restart the app if necessary*.

### Setting Up AI Providers
1.  Click the **Settings** (gear icon) in the app.
2.  Go to **Providers**.
3.  Select your preferred provider (e.g., **Groq**).
4.  Paste your API Key (e.g., `gsk_...`).
5.  Close settings.

### Dictating
1.  Click into any text input (e.g., Spotlight, Notes, Browser).
2.  Press **Option + Space**.
3.  Speak clearly.
4.  Press **Option + Space** again to stop.
5.  Wait for the text to appear.

## 📦 Building for Production

To create a `.dmg` installer yourself:

```bash
npm run tauri build
```

The output file will be in: `src-tauri/target/release/bundle/dmg/`

## ❓ Troubleshooting

**Q: The app records but doesn't type anything.**
A: Check **System Settings > Privacy & Security > Accessibility**. Ensure the app (or Terminal) has permission to control your computer.

**Q: "Option + Space" isn't working.**
A: Another app (like Raycast or Spotlight) might be using this shortcut. You can check the logs in the terminal for "Global Hotkey registered" messages.

**Q: Audio isn't recording.**
A: Ensure you granted **Microphone** permission when prompted. Check System Settings > Privacy & Security > Microphone.

## License

This project is licensed under the MIT License.
