import React from 'react';
import { Mic, Search, Layout, RefreshCw } from 'lucide-react';
import Home from './Home';
import Dictionary from './Dictionary';
import Snippets from './Snippets';
import Style from './Style';

interface MainContentProps {
  activeTab: string;
  isRecording: boolean;
  onToggleRecording: () => void;
  transcriptionLog: string[];
}

const MainContent: React.FC<MainContentProps> = ({ activeTab, isRecording, onToggleRecording, transcriptionLog }) => {


  if (activeTab === 'home') return <Home />;
  if (activeTab === 'dictionary') return <Dictionary />;
  if (activeTab === 'snippets') return <Snippets />;
  if (activeTab === 'style') return <Style />;
  
  // Default to Notes view (activeTab === 'notes')
  return (
    <div style={{ flex: 1, padding: '40px', display: 'flex', flexDirection: 'column', height: '100vh', overflowY: 'auto' }}>
      
      {/* Hero Input Section */}
      <div style={{ 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center', 
        justifyContent: 'center',
        marginTop: '60px',
        marginBottom: '60px'
      }}>
         <h2 style={{ marginBottom: '24px', fontWeight: 600 }}>For quick thoughts you want to come back to</h2>
         
         <div 
           style={{
             width: '100%',
             maxWidth: '600px',
             backgroundColor: 'var(--bg-secondary)',
             borderRadius: '20px',
             padding: '20px',
             boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
             display: 'flex',
             alignItems: 'center',
             justifyContent: 'space-between',
             cursor: 'pointer',
             border: isRecording ? '2px solid #ff4444' : '1px solid transparent',
             transition: 'border 0.2s'
           }}
           onClick={onToggleRecording}
         >
            <span style={{ color: '#aaa', fontSize: '1.1rem' }}>
              {isRecording ? "Listening..." : "Take a quick note with your voice"}
            </span>
            <div style={{
                backgroundColor: isRecording ? '#ff4444' : '#1a1a1c',
                borderRadius: '50%',
                width: '40px',
                height: '40px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white'
            }}>
                <Mic size={20} />
            </div>
         </div>
      </div>

      {/* Recents Section */}
      <div style={{ maxWidth: '800px', margin: '0 auto', width: '100%' }}>
        <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center', 
            marginBottom: '20px',
            borderBottom: '1px solid var(--border-color)',
            paddingBottom: '10px'
        }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', letterSpacing: '1px' }}>RECENTS</span>
            <div style={{ display: 'flex', gap: '15px', color: 'var(--text-secondary)' }}>
                <Search size={18} style={{cursor: 'pointer'}} />
                <Layout size={18} style={{cursor: 'pointer'}} />
                <RefreshCw size={18} style={{cursor: 'pointer'}} />
            </div>
        </div>

        {transcriptionLog.length === 0 ? (
            <div style={{ color: 'var(--text-secondary)', marginTop: '20px' }}>No notes found</div>
        ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                {transcriptionLog.map((note, index) => (
                    <div key={index} style={{
                        padding: '15px',
                        backgroundColor: 'var(--bg-secondary)',
                        borderRadius: '12px',
                        boxShadow: '0 2px 5px rgba(0,0,0,0.03)'
                    }}>
                        {note}
                    </div>
                ))}
            </div>
        )}
      </div>
    </div>
  );
};

export default MainContent;
