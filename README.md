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

## 🚀 Getting Started

### Prerequisites

To run or build this app, you need:

1.  **Rust**: [Install Rust](https://www.rust-lang.org/tools/install) (`curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh`)
2.  **Node.js**: [Install Node.js](https://nodejs.org/) (Use LTS version).
3.  **Xcode Command Line Tools** (for macOS build):
    ```bash
    xcode-select --install
    ```

### Installation

1.  Clone the repository:
    ```bash
    git clone https://github.com/yourusername/whisper-flow-clone.git
    cd whisper-flow-clone
    ```

2.  Install frontend dependencies:
    ```bash
    npm install
    ```

3.  Run in Development Mode:
    ```bash
    npm run tauri dev
    ```
    This will compile the Rust backend and open the floating window.

## 🛠 Usage

1.  **Permissions**: On first run, macOS will prompt for **Microphone** access. 
    *   *Important*: For the app to type text for you, you must manually grant **Accessibility** permissions in `System Settings > Privacy & Security > Accessibility` to your Terminal (if running dev) or the App (if built).
2.  **Configuration**:
    *   Select your provider (e.g., **Groq** for speed).
    *   Enter your API Key (starting with `gsk_...` for Groq).
    *   The settings are auto-saved.
3.  **Dictation**:
    *   Click into any text field (e.g., a new Note).
    *   Press **Option + Space**.
    *   Speak your thought.
    *   Press **Option + Space** again.
    *   Watch the text appear magically!

## 📦 Building for Release

To create a shareable macOS application (`.dmg` or `.app`):

```bash
npm run tauri build
```

The output will be located in:
`src-tauri/target/release/bundle/dmg/`

You can share this `.dmg` file with friends or coworkers. They can drag it to their Applications folder to install.

### Publishing (Distribution)

Since this is a GUI application (not a library), you typically **do not** publish it to `crates.io`. instead:

1.  **GitHub Releases**: Create a Release on GitHub and upload the `.dmg` file.
2.  **Brew Tap**: You can create a Homebrew formula so users can install it via `brew install`.

## 🧪 Testing

To ensure code quality:

*   **Rust Logic**:
    ```bash
    cd src-tauri
    cargo test
    ```
*   **Compilation Check**:
    ```bash
    cargo check
    ```
*   **Linting**:
    ```bash
    npm run lint
    ```

## 📝 Configuration Details

The application stores settings locally.
- **Config persistence**: Managed via Tauri state.
- **Audio Format**: records 16-bit PCM WAV (compatible with OpenAI/Groq Whisper APIs).

## License

This project is licensed under the MIT License - feel free to use, modify, and distribute properly.
