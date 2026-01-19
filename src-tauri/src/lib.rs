mod api_client;
mod audio;

use api_client::transcribe_openai_compatible;
use audio::AudioRecorder;
use std::fs;
use std::path::PathBuf;
use std::sync::Mutex;
use tauri::{AppHandle, Emitter, Manager, State};

/// Get the path to the settings file in the user's config directory
fn get_settings_path() -> PathBuf {
    let config_dir = dirs::config_dir()
        .unwrap_or_else(|| std::env::temp_dir())
        .join("whisper-flow");

    // Create directory if it doesn't exist
    let _ = fs::create_dir_all(&config_dir);

    config_dir.join("settings.json")
}

/// Get default hotkey modifiers based on platform
fn get_default_hotkey_modifiers() -> Vec<String> {
    #[cfg(target_os = "macos")]
    {
        vec!["alt".to_string()]
    }
    #[cfg(not(target_os = "macos"))]
    {
        vec!["ctrl".to_string(), "shift".to_string()]
    }
}

/// Load settings from disk
fn load_settings_from_disk() -> AppSettings {
    let path = get_settings_path();

    if path.exists() {
        match fs::read_to_string(&path) {
            Ok(content) => match serde_json::from_str(&content) {
                Ok(settings) => {
                    println!("Settings loaded from {:?}", path);
                    return settings;
                }
                Err(e) => eprintln!("Failed to parse settings: {}", e),
            },
            Err(e) => eprintln!("Failed to read settings file: {}", e),
        }
    }

    // Return default settings if file doesn't exist or can't be parsed
    AppSettings {
        api_key: "".into(),
        provider: "groq".into(),
        model: "whisper-large-v3".into(),
        hotkey_modifiers: get_default_hotkey_modifiers(),
        hotkey_key: "Space".into(),
    }
}

/// Save settings to disk
fn save_settings_to_disk(settings: &AppSettings) -> Result<(), String> {
    let path = get_settings_path();

    let content = serde_json::to_string_pretty(settings)
        .map_err(|e| format!("Failed to serialize settings: {}", e))?;

    fs::write(&path, content).map_err(|e| format!("Failed to write settings file: {}", e))?;

    println!("Settings saved to {:?}", path);
    Ok(())
}

use enigo::{Enigo, Keyboard, Settings};
use global_hotkey::{
    hotkey::{Code, HotKey, Modifiers},
    GlobalHotKeyEvent, GlobalHotKeyManager, HotKeyState,
};

#[derive(Clone, serde::Serialize, serde::Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct AppSettings {
    pub api_key: String,
    pub provider: String,
    pub model: String,
    #[serde(default = "get_default_hotkey_modifiers")]
    pub hotkey_modifiers: Vec<String>,
    #[serde(default = "default_hotkey_key")]
    pub hotkey_key: String,
}

fn default_hotkey_key() -> String {
    "Space".to_string()
}

/// Parse modifier strings to Modifiers bitflags
fn parse_modifiers(modifiers: &[String]) -> Modifiers {
    let mut mods = Modifiers::empty();
    for m in modifiers {
        match m.to_lowercase().as_str() {
            "alt" | "opt" | "option" => mods |= Modifiers::ALT,
            "ctrl" | "control" => mods |= Modifiers::CONTROL,
            "shift" => mods |= Modifiers::SHIFT,
            "meta" | "cmd" | "command" | "super" => mods |= Modifiers::META,
            _ => {}
        }
    }
    mods
}

/// Parse key string to Code enum
fn parse_key_code(key: &str) -> Option<Code> {
    match key.to_lowercase().as_str() {
        "space" => Some(Code::Space),
        "a" => Some(Code::KeyA),
        "b" => Some(Code::KeyB),
        "c" => Some(Code::KeyC),
        "d" => Some(Code::KeyD),
        "e" => Some(Code::KeyE),
        "f" => Some(Code::KeyF),
        "g" => Some(Code::KeyG),
        "h" => Some(Code::KeyH),
        "i" => Some(Code::KeyI),
        "j" => Some(Code::KeyJ),
        "k" => Some(Code::KeyK),
        "l" => Some(Code::KeyL),
        "m" => Some(Code::KeyM),
        "n" => Some(Code::KeyN),
        "o" => Some(Code::KeyO),
        "p" => Some(Code::KeyP),
        "q" => Some(Code::KeyQ),
        "r" => Some(Code::KeyR),
        "s" => Some(Code::KeyS),
        "t" => Some(Code::KeyT),
        "u" => Some(Code::KeyU),
        "v" => Some(Code::KeyV),
        "w" => Some(Code::KeyW),
        "x" => Some(Code::KeyX),
        "y" => Some(Code::KeyY),
        "z" => Some(Code::KeyZ),
        "1" => Some(Code::Digit1),
        "2" => Some(Code::Digit2),
        "3" => Some(Code::Digit3),
        "4" => Some(Code::Digit4),
        "5" => Some(Code::Digit5),
        "6" => Some(Code::Digit6),
        "7" => Some(Code::Digit7),
        "8" => Some(Code::Digit8),
        "9" => Some(Code::Digit9),
        "0" => Some(Code::Digit0),
        "f1" => Some(Code::F1),
        "f2" => Some(Code::F2),
        "f3" => Some(Code::F3),
        "f4" => Some(Code::F4),
        "f5" => Some(Code::F5),
        "f6" => Some(Code::F6),
        "f7" => Some(Code::F7),
        "f8" => Some(Code::F8),
        "f9" => Some(Code::F9),
        "f10" => Some(Code::F10),
        "f11" => Some(Code::F11),
        "f12" => Some(Code::F12),
        _ => None,
    }
}

/// Build a HotKey from settings
fn build_hotkey_from_settings(settings: &AppSettings) -> Option<HotKey> {
    let modifiers = parse_modifiers(&settings.hotkey_modifiers);
    let code = parse_key_code(&settings.hotkey_key)?;

    if modifiers.is_empty() {
        Some(HotKey::new(None, code))
    } else {
        Some(HotKey::new(Some(modifiers), code))
    }
}

pub struct AppState {
    recorder: Mutex<AudioRecorder>,
    settings: Mutex<AppSettings>,
    is_recording: Mutex<bool>,
}

#[tauri::command]
fn save_settings(state: State<AppState>, settings: AppSettings) -> Result<(), String> {
    // Save to memory
    let mut s = state
        .settings
        .lock()
        .map_err(|_| "Failed to lock settings")?;
    *s = settings.clone();

    // Persist to disk
    save_settings_to_disk(&settings)?;

    Ok(())
}

#[tauri::command]
fn load_settings(state: State<AppState>) -> Result<AppSettings, String> {
    let s = state
        .settings
        .lock()
        .map_err(|_| "Failed to lock settings")?;
    Ok(s.clone())
}

#[tauri::command]
fn start_recording(state: State<AppState>) -> Result<String, String> {
    let mut recorder = state.recorder.lock().map_err(|_| "Failed to lock state")?;
    let mut is_rec = state
        .is_recording
        .lock()
        .map_err(|_| "Failed to lock state")?;

    // Check if already recording to prevent double assignments
    if *is_rec {
        return Ok("Already recording".to_string());
    }

    let path = std::env::temp_dir().join("whisper_flow_recording.wav");
    if let Err(e) = recorder.start(path.clone()) {
        eprintln!("Failed to start recording: {}", e);
        // Try to log to a file for debugging
        let log_path = std::env::temp_dir().join("whisper_debug.log");
        let _ = std::fs::write(&log_path, format!("Start Error: {}", e));
        return Err(e.to_string());
    }
    *is_rec = true;

    println!("Recording started...");
    Ok("Recording started".to_string())
}

#[tauri::command]
fn stop_and_transcribe(state: State<AppState>) -> Result<String, String> {
    // 1. Stop Recording
    {
        let mut recorder = state.recorder.lock().map_err(|_| "Failed to lock state")?;
        let mut is_rec = state
            .is_recording
            .lock()
            .map_err(|_| "Failed to lock state")?;

        if !*is_rec {
            // If not recording, do nothing
            return Ok("Not recording".to_string());
        }

        recorder.stop().map_err(|e| e.to_string())?;
        *is_rec = false;
    } // unlock recorder

    println!("Recording stopped.");

    // 2. Read Settings
    let settings = {
        let s = state
            .settings
            .lock()
            .map_err(|_| "Failed to lock settings")?;
        s.clone()
    };

    if settings.api_key.is_empty() {
        return Err("API Key not set. Please configure in the app.".to_string());
    }

    let path = std::env::temp_dir().join("whisper_flow_recording.wav");
    if !path.exists() {
        return Err("Recording file not found".to_string());
    }

    // Determine Base URL
    let base_url = match settings.provider.to_lowercase().as_str() {
        "grok" => "https://api.x.ai/v1",
        "groq" => "https://api.groq.com/openai/v1",
        "gemini" => "https://openrouter.ai/api/v1",
        "openrouter" => "https://openrouter.ai/api/v1",
        _ => "https://openrouter.ai/api/v1",
    };

    println!(
        "Transcribing with {} model {}...",
        settings.provider, settings.model
    );
    let text = transcribe_openai_compatible(&path, &settings.api_key, &settings.model, base_url)?;
    println!("Transcription: {}", text);

    // 3. Type Logic
    match Enigo::new(&Settings::default()) {
        Ok(mut enigo) => {
            let _ = enigo.text(&text);
        }
        Err(e) => {
            eprintln!("Failed to initialize Enigo (Keyboard): {:?}", e);
        }
    }

    Ok(text)
}

// Helper to toggle recording from Hotkey thread
fn toggle_recording_fn(app: &AppHandle) {
    let state = app.state::<AppState>();
    // Check if recording without holding the lock for long
    let is_recording = {
        let guard = state.is_recording.lock().unwrap();
        *guard
    };

    if is_recording {
        println!("Hotkey: Stopping...");
        let app_clone = app.clone();
        // Run in thread to allow UI updates
        std::thread::spawn(move || {
            let state = app_clone.state::<AppState>();
            match stop_and_transcribe(state.clone()) {
                Ok(text) => {
                    let _ = app_clone.emit("transcription-complete", text);
                }
                Err(e) => {
                    let _ = app_clone.emit("transcription-error", e);
                }
            }
        });
    } else {
        println!("Hotkey: Starting...");
        let _ = start_recording(state.clone());
        let _ = app.emit("recording-started", ());
    }
}

pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .manage(AppState {
            recorder: Mutex::new(AudioRecorder::new()),
            settings: Mutex::new(load_settings_from_disk()),
            is_recording: Mutex::new(false),
        })
        .setup(|app| {
            // Trigger Microphone Permission on Startup

            // Register Global Hotkey from settings
            let settings = load_settings_from_disk();
            let manager = GlobalHotKeyManager::new().unwrap();

            let hotkey = match build_hotkey_from_settings(&settings) {
                Some(hk) => hk,
                None => {
                    // Fallback to default if settings are invalid
                    #[cfg(target_os = "macos")]
                    {
                        HotKey::new(Some(Modifiers::ALT), Code::Space)
                    }
                    #[cfg(not(target_os = "macos"))]
                    {
                        HotKey::new(Some(Modifiers::CONTROL | Modifiers::SHIFT), Code::Space)
                    }
                }
            };

            if let Err(e) = manager.register(hotkey) {
                eprintln!("Failed to register hotkey: {:?}", e);
            } else {
                println!(
                    "Global Hotkey ({} + {}) registered successfully!",
                    settings.hotkey_modifiers.join("+"),
                    settings.hotkey_key
                );
            }

            // IMPORTANT: Manage the manager to keep it alive.
            // If dropped, hotkeys are unregistered.
            app.manage(manager);

            let app_handle = app.handle().clone();
            std::thread::spawn(move || {
                println!("Hotkey Listener Thread Started...");
                loop {
                    if let Ok(event) = GlobalHotKeyEvent::receiver().try_recv() {
                        if event.state == HotKeyState::Released {
                            println!("Hotkey keyup detected!");
                            toggle_recording_fn(&app_handle);
                        }
                    }
                    std::thread::sleep(std::time::Duration::from_millis(50));
                }
            });
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            start_recording,
            stop_and_transcribe,
            save_settings,
            load_settings
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
