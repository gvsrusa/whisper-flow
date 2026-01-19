import React from 'react';
import { Home, Book, Scissors, Type, FileText, Settings, HelpCircle } from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onOpenSettings: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab, onOpenSettings }) => {
  const navItems = [
    { id: 'home', icon: Home, label: 'Home' },
    { id: 'dictionary', icon: Book, label: 'Dictionary' },
    { id: 'snippets', icon: Scissors, label: 'Snippets' },
    { id: 'style', icon: Type, label: 'Style' },
    { id: 'notes', icon: FileText, label: 'Notes' },
  ];

  // Common style for all sidebar buttons to ensure consistency
  const buttonStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    width: '100%',
    padding: '10px 15px',
    marginBottom: '4px',
    borderRadius: '8px',
    transition: 'background-color 0.2s',
    textAlign: 'left',
    fontSize: '0.9rem', // Explicit font size for all
    border: 'none',
    background: 'none',
    cursor: 'pointer',
    fontFamily: 'inherit',
    color: 'var(--text-primary)',
    fontWeight: 500
  };

  const activeStyle: React.CSSProperties = {
    ...buttonStyle,
    backgroundColor: '#e8e8ea',
    fontWeight: 600
  };

  return (
    <div style={{
      width: '240px',
      height: '100vh',
      backgroundColor: 'var(--bg-primary)',
      padding: '20px 10px',
      display: 'flex',
      flexDirection: 'column',
      borderRight: '1px solid transparent',
      paddingTop: '40px' // Add space for drag region
    }}>
      {/* Logo Area */}
      <div style={{ padding: '0 15px 30px 15px', display: 'flex', alignItems: 'center', gap: '8px' }}>
        <div style={{ fontWeight: 'bold', fontSize: '1.2rem', display: 'flex', alignItems: 'center', gap: '5px' }}>
          Verba
          <span style={{ 
            fontSize: '0.7rem', 
            border: '1px solid #ccc', 
            borderRadius: '4px', 
            padding: '2px 6px',
            marginLeft: '8px',
            color: 'var(--text-secondary)'
          }}>Beta</span>
        </div>
      </div>

      {/* Main Navigation */}
      <nav style={{ flex: 1 }}>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              style={isActive ? activeStyle : buttonStyle}
            >
              <Icon size={18} style={{ marginRight: '12px', opacity: isActive ? 1 : 0.7 }} />
              {item.label}
            </button>
          );
        })}
      </nav>

      {/* Bottom Actions */}
      <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '10px' }}>
         {/* Pro and Referral sections removed as requested */}
         <button style={buttonStyle} onClick={onOpenSettings}>
            <Settings size={18} style={{ marginRight: '12px', opacity: 0.7 }}/> 
            Settings
         </button>
         <button style={buttonStyle}>
            <HelpCircle size={18} style={{ marginRight: '12px', opacity: 0.7 }}/> 
            Help
         </button>
      </div>
    </div>
  );
};

export default Sidebar;
