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

            // Register Global Hotkey
            // macOS: Option+Space (Alt+Space)
            // Windows/Linux: Ctrl+Shift+Space (Alt+Space conflicts with window menu)
            let manager = GlobalHotKeyManager::new().unwrap();

            #[cfg(target_os = "macos")]
            let hotkey = HotKey::new(Some(Modifiers::ALT), Code::Space);

            #[cfg(not(target_os = "macos"))]
            let hotkey = HotKey::new(Some(Modifiers::CONTROL | Modifiers::SHIFT), Code::Space);

            if let Err(e) = manager.register(hotkey) {
                eprintln!("Failed to register hotkey: {:?}", e);
            } else {
                #[cfg(target_os = "macos")]
                println!("Global Hotkey (Option+Space) registered successfully!");
                #[cfg(not(target_os = "macos"))]
                println!("Global Hotkey (Ctrl+Shift+Space) registered successfully!");
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
