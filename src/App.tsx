import { useState, useEffect } from "react";
import { invoke } from "@tauri-apps/api/core";
import { listen } from "@tauri-apps/api/event";
import "./App.css";

function App() {
  const [apiKey, setApiKey] = useState("");
  const [provider, setProvider] = useState("groq");
  const [model, setModel] = useState("whisper-large-v3");
  const [status, setStatus] = useState<"idle" | "recording" | "processing">("idle");
  const [log, setLog] = useState("");

  // Save settings to backend whenever they change
  useEffect(() => {
    // Debounce or just save on change
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
  }, [apiKey, provider, model]);

  // Listen for global hotkey events from backend
  useEffect(() => {
    const unlistenStarted = listen("recording-started", () => {
      setStatus("recording");
      setLog("Recording started via Hotkey...");
    });

    const unlistenComplete = listen("transcription-complete", (event) => {
      setStatus("idle");
      setLog(`Transcribed: ${event.payload}`);
    });

    const unlistenError = listen("transcription-error", (event) => {
      setStatus("idle");
      setLog(`Error: ${event.payload}`);
    });

    return () => {
      unlistenStarted.then(f => f());
      unlistenComplete.then(f => f());
      unlistenError.then(f => f());
    };
  }, []);

  const handleProviderChange = (newProvider: string) => {
    setProvider(newProvider);
    if (newProvider === "groq") setModel("whisper-large-v3");
    else if (newProvider === "grok") setModel("grok-beta"); 
    else if (newProvider === "openrouter") setModel("openai/whisper-large-v3");
    else if (newProvider === "gemini") setModel("google/gemini-flash-1.5");
  };

  async function toggleRecording() {
    if (status === "idle") {
      try {
        setLog("Starting recording...");
        await invoke("start_recording");
        // Status update handled by event listener or manually here
        setStatus("recording");
      } catch (error) {
        console.error(error);
        setLog(`Error: ${error}`);
      }
    } else if (status === "recording") {
      try {
        setLog("Stopping & Transcribing...");
        setStatus("processing");
        // We now call stop_and_transcribe without args, as it uses stored settings
        const text = await invoke("stop_and_transcribe");
        setLog(`Transcribed: ${text}`);
        setStatus("idle");
      } catch (error) {
        console.error(error);
        setLog(`Error: ${error}`);
        setStatus("idle");
      }
    }
  }

  return (
    <>
      <div data-tauri-drag-region className="titlebar"></div>
      <div className="container">
        <h1>Wispr Flow Clone</h1>
      
      <div className="settings-panel">
        <label>
          Provider
          <select value={provider} onChange={(e) => handleProviderChange(e.target.value)}>
            <option value="groq">Groq (Fastest)</option>
            <option value="openrouter">OpenRouter</option>
            <option value="grok">Grok (xAI)</option>
            <option value="gemini">Gemini (via OpenRouter)</option>
          </select>
        </label>

        <label>
          API Key
          <input 
            type="password" 
            placeholder="sk-..." 
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
          />
        </label>

        <label>
          Model ID
          <input 
            type="text" 
            placeholder="e.g. google/gemini-pro-1.5" 
            value={model}
            onChange={(e) => setModel(e.target.value)}
          />
        </label>
      </div>

      <div className="control-panel">
        <button 
          className={`record-btn ${status}`}
          onClick={toggleRecording}
          disabled={status === "processing"}
        >
          {status === "idle" ? "Start Recording" : status === "recording" ? "Stop" : "Processing..."}
        </button>
      </div>

      <div className="log-output">
        <p>{log}</p>
        <p style={{ marginTop: '10px', fontSize: '0.7em', color: '#666' }}>
          Global Hotkey: <b>Option + Space</b> (Alt + Space)
        </p>
      </div>
      </div>
    </>
  );
}

export default App;
