import { useState, useEffect } from "react";
import { invoke } from "@tauri-apps/api/core";
import { listen } from "@tauri-apps/api/event";
import "./App.css";

// Components
import Sidebar from "./components/Sidebar";
import MainContent from "./components/MainContent";
import SettingsModal from "./components/SettingsModal";

function App() {
  // State
  const [activeTab, setActiveTab] = useState("notes");
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  
  // Logic State (from original App)
  const [apiKey, setApiKey] = useState("");
  const [provider, setProvider] = useState("groq");
  const [model, setModel] = useState("whisper-large-v3");
  const [status, setStatus] = useState<"idle" | "recording" | "processing">("idle");
  const [transcriptionLog, setTranscriptionLog] = useState<string[]>([]);
  const [settingsLoaded, setSettingsLoaded] = useState(false);
  // Store full log here, maybe persist later

  // Load settings from backend on startup
  useEffect(() => {
    const load = async () => {
      try {
        const settings = await invoke<{ apiKey: string; provider: string; model: string }>("load_settings");
        console.log("Loaded settings:", settings);
        setApiKey(settings.apiKey || "");
        setProvider(settings.provider || "groq");
        setModel(settings.model || "whisper-large-v3");
        setSettingsLoaded(true);
      } catch (err) {
        console.error("Failed to load settings:", err);
        setSettingsLoaded(true); // Still mark as loaded to allow saving
      }
    };
    load();
  }, []);

  // Save settings to backend whenever they change (only after initial load)
  useEffect(() => {
    if (!settingsLoaded) return; // Don't save until settings are loaded
    
    const save = async () => {
      try {
        await invoke("save_settings", { 
          settings: { apiKey, provider, model } 
        });
      } catch (err) {
        console.error("Failed to save settings:", err);
      }
    };
    save();
  }, [apiKey, provider, model, settingsLoaded]);

  // Listen for global hotkey events from backend
  useEffect(() => {
    const unlistenStarted = listen("recording-started", () => {
      setStatus("recording");
    });

    const unlistenComplete = listen("transcription-complete", (event) => {
      console.log("Transcription Event Received:", event);
      setStatus("idle");
      // Add to log
      setTranscriptionLog(prev => [event.payload as string, ...prev]);
    });

    const unlistenError = listen("transcription-error", (event) => {
      console.error("Transcription Error Event:", event);
      setStatus("idle");
      setTranscriptionLog(prev => [`Error: ${event.payload}`, ...prev]);
    });

    return () => {
      unlistenStarted.then(f => f());
      unlistenComplete.then(f => f());
      unlistenError.then(f => f());
    };
  }, []);

  async function toggleRecording() {
    if (status === "idle") {
      try {
        await invoke("start_recording");
        setStatus("recording");
      } catch (error) {
        console.error(error);
      }
    } else if (status === "recording") {
      try {
        setStatus("processing");
        const text = await invoke("stop_and_transcribe");
        setTranscriptionLog(prev => [text as string, ...prev]);
        setStatus("idle");
      } catch (error) {
        console.error(error);
        setStatus("idle");
      }
    }
  }

  return (
    <div style={{ display: 'flex', width: '100%', height: '100%' }}>
      <div data-tauri-drag-region className="titlebar"></div>
      
      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        onOpenSettings={() => setIsSettingsOpen(true)}
      />
      
      <MainContent 
        activeTab={activeTab} 
        isRecording={status === "recording"}
        onToggleRecording={toggleRecording}
        transcriptionLog={transcriptionLog}
      />

      <SettingsModal 
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        provider={provider}
        setProvider={setProvider}
        apiKey={apiKey}
        setApiKey={setApiKey}
        model={model}
        setModel={setModel}
      />
    </div>
  );
}

export default App;
