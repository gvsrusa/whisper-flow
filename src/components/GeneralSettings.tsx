import React, { useState, useEffect } from 'react';
import { invoke } from '@tauri-apps/api/core';
import SettingsRow from './SettingsRow';

interface ChangeButtonProps {
  onClick: () => void;
}

const ChangeButton: React.FC<ChangeButtonProps> = ({ onClick }) => (
  <button
    onClick={onClick}
    style={{
      padding: '8px 24px',
      borderRadius: '8px',
      border: 'none',
      backgroundColor: '#f0f0f2',
      cursor: 'pointer',
      fontSize: '0.9rem',
      fontWeight: 500,
      color: '#1a1a1c',
      transition: 'background-color 0.2s'
    }}
    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#e5e5e7'}
    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#f0f0f2'}
  >
    Change
  </button>
);

interface Settings {
  apiKey: string;
  provider: string;
  model: string;
  hotkeyModifiers: string[];
  hotkeyKey: string;
}

const GeneralSettings: React.FC = () => {
  const [shortcut, setShortcut] = useState('Loading...');
  const [hotkeyModifiers, setHotkeyModifiers] = useState<string[]>([]);
  const [hotkeyKey, setHotkeyKey] = useState('');
  const [isRecordingShortcut, setIsRecordingShortcut] = useState(false);
  const [restartRequired, setRestartRequired] = useState(false);

  const [microphone, setMicrophone] = useState('Built-in mic (recommended)');
  const [isSelectingMic, setIsSelectingMic] = useState(false);

  const [language, setLanguage] = useState('Auto-detect (99 languages)');
  const [isSelectingLanguage, setIsSelectingLanguage] = useState(false);

  // Mock data
  const microphones = ['Built-in mic (recommended)', 'AirPods Pro', 'External USB Microphone'];
  const languages = ['Auto-detect (99 languages)', 'English (US)', 'English (UK)', 'Spanish', 'French', 'German', 'Chinese', 'Japanese'];

  // Load current hotkey settings on mount
  useEffect(() => {
    const loadSettings = async () => {
      try {
        const settings = await invoke<Settings>('load_settings');
        setHotkeyModifiers(settings.hotkeyModifiers || []);
        setHotkeyKey(settings.hotkeyKey || 'Space');
        
        // Format for display
        const displayMods = settings.hotkeyModifiers.map(m => {
          if (m === 'alt') return 'Option';
          if (m === 'ctrl') return 'Ctrl';
          if (m === 'shift') return 'Shift';
          if (m === 'meta') return 'Cmd';
          return m;
        });
        setShortcut([...displayMods, settings.hotkeyKey].join(' + '));
      } catch (err) {
        console.error('Failed to load settings:', err);
        setShortcut('Option + Space');
      }
    };
    loadSettings();
  }, []);

  // Handle Shortcut Recording
  const handleShortcutClick = () => {
    setIsRecordingShortcut(true);
  };

  const handleShortcutKeyDown = async (e: React.KeyboardEvent) => {
    if (isRecordingShortcut) {
      e.preventDefault();
      
      // Capture modifiers
      const modifiers: string[] = [];
      if (e.metaKey) modifiers.push('meta');
      if (e.ctrlKey) modifiers.push('ctrl');
      if (e.altKey) modifiers.push('alt');
      if (e.shiftKey) modifiers.push('shift');
      
      // Capture key (excluding modifier keys themselves)
      let key = '';
      if (!['Meta', 'Control', 'Alt', 'Shift'].includes(e.key)) {
        key = e.key.length === 1 ? e.key.toUpperCase() : e.key;
        // Convert common key names
        if (key === ' ') key = 'Space';
      }
      
      // Only save if we have at least one modifier and a key
      if (modifiers.length > 0 && key) {
        setHotkeyModifiers(modifiers);
        setHotkeyKey(key);
        
        // Format for display
        const displayMods = modifiers.map(m => {
          if (m === 'alt') return 'Option';
          if (m === 'ctrl') return 'Ctrl';
          if (m === 'shift') return 'Shift';
          if (m === 'meta') return 'Cmd';
          return m;
        });
        setShortcut([...displayMods, key].join(' + '));
        setIsRecordingShortcut(false);
        
        // Save to backend
        try {
          const currentSettings = await invoke<Settings>('load_settings');
          await invoke('save_settings', {
            settings: {
              ...currentSettings,
              hotkeyModifiers: modifiers,
              hotkeyKey: key
            }
          });
          setRestartRequired(true);
        } catch (err) {
          console.error('Failed to save hotkey settings:', err);
        }
      }
    }
  };

  return (
    <div style={{ padding: '30px 0' }}>
      <h2 style={{ 
        fontSize: '1.5rem', 
        fontWeight: 600, 
        margin: '0 20px 20px 20px',
        color: '#1a1a1c'
      }}>
        General
      </h2>

      <SettingsRow
        title="Keyboard shortcuts"
        subtitle={
          isRecordingShortcut ? (
            <input 
              autoFocus
              value="Press keys..."
              readOnly
              onKeyDown={handleShortcutKeyDown}
              onBlur={() => setIsRecordingShortcut(false)}
              style={{
                border: '1px solid #007aff',
                borderRadius: '4px',
                padding: '2px 8px',
                outline: 'none',
                color: '#007aff',
                fontSize: '0.85rem'
              }}
            />
          ) : (
            <span>
              {shortcut}
              {restartRequired && (
                <span style={{ color: '#ff9500', fontSize: '0.75rem', marginLeft: '8px' }}>
                  (Restart app to apply)
                </span>
              )}
            </span>
          )
        }
        learnMoreLink="#"
        action={
          <ChangeButton onClick={handleShortcutClick} />
        }
      />

      <SettingsRow
        title="Microphone"
        subtitle={
          isSelectingMic ? (
            <select
              autoFocus
              value={microphone}
              onChange={(e) => {
                setMicrophone(e.target.value);
                setIsSelectingMic(false);
              }}
              onBlur={() => setIsSelectingMic(false)}
              style={{
                fontSize: '0.85rem',
                padding: '2px 4px',
                borderRadius: '4px',
                borderColor: '#ccc'
              }}
            >
              {microphones.map(mic => (
                <option key={mic} value={mic}>{mic}</option>
              ))}
            </select>
          ) : microphone
        }
        action={<ChangeButton onClick={() => setIsSelectingMic(true)} />}
      />

      <SettingsRow
        title="Languages"
        subtitle={
          isSelectingLanguage ? (
            <select
              autoFocus
              value={language}
              onChange={(e) => {
                setLanguage(e.target.value);
                setIsSelectingLanguage(false);
              }}
              onBlur={() => setIsSelectingLanguage(false)}
              style={{
                fontSize: '0.85rem',
                padding: '2px 4px',
                borderRadius: '4px',
                borderColor: '#ccc',
                maxWidth: '200px'
              }}
            >
              {languages.map(lang => (
                <option key={lang} value={lang}>{lang}</option>
              ))}
            </select>
          ) : language
        }
        action={<ChangeButton onClick={() => setIsSelectingLanguage(true)} />}
      />
    </div>
  );
};

export default GeneralSettings;
