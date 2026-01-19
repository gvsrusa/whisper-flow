import { useState } from 'react';
import { Plus, Search, Trash2 } from 'lucide-react';

const Dictionary: React.FC = () => {
    const [words] = useState([
        { id: 1, original: "Wispr", replacement: "Wispr" },
        { id: 2, original: "Gvsrusa", replacement: "GVS Rusa" }, // Custom example
    ]);

    return (
        <div style={{ padding: '40px', maxWidth: '800px', margin: '0 auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
                <div>
                     <h1 style={{ fontSize: '1.8rem', fontWeight: 700, marginBottom: '5px' }}>Dictionary</h1>
                     <p style={{ color: 'var(--text-secondary)' }}>Teach Verba how to spell specific words.</p>
                </div>
                <button style={{ 
                    backgroundColor: '#1a1a1c', 
                    color: 'white', 
                    padding: '10px 20px', 
                    borderRadius: '10px',
                    fontWeight: 600,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                }}>
                    <Plus size={18} /> Add Word
                </button>
            </div>

            <div style={{ position: 'relative', marginBottom: '30px' }}>
                <Search size={18} style={{ position: 'absolute', left: '15px', top: '50%', transform: 'translateY(-50%)', color: '#888' }} />
                <input 
                    type="text" 
                    placeholder="Search dictionary..." 
                    style={{ paddingLeft: '45px' }}
                />
            </div>

            <div style={{ backgroundColor: 'var(--bg-secondary)', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 2px 5px rgba(0,0,0,0.03)' }}>
                {words.map((word, idx) => (
                    <div key={word.id} style={{ 
                        padding: '15px 20px', 
                        borderBottom: idx === words.length - 1 ? 'none' : '1px solid var(--border-color)',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                    }}>
                        <div>
                            <span style={{ fontWeight: 600 }}>{word.original}</span>
                            <span style={{ margin: '0 10px', color: '#ccc' }}>→</span>
                            <span style={{ color: 'var(--text-secondary)' }}>{word.replacement}</span>
                        </div>
                        <button style={{ color: '#ff4444', padding: '5px', opacity: 0.6 }}>
                            <Trash2 size={16} />
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Dictionary;
