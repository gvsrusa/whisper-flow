import { Plus, Scissors } from 'lucide-react';

const Snippets = () => {
    return (
        <div style={{ padding: '40px', maxWidth: '800px', margin: '0 auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
                <div>
                     <h1 style={{ fontSize: '1.8rem', fontWeight: 700, marginBottom: '5px' }}>Snippets</h1>
                     <p style={{ color: 'var(--text-secondary)' }}>Replace short keywords with longer text.</p>
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
                    <Plus size={18} /> New Snippet
                </button>
            </div>

            <div style={{ 
                textAlign: 'center', 
                padding: '60px 20px', 
                backgroundColor: 'var(--bg-secondary)', 
                borderRadius: '16px',
                border: '1px dashed #ccc',
                color: 'var(--text-secondary)'
            }}>
                <div style={{ 
                    width: '60px', 
                    height: '60px', 
                    backgroundColor: '#e8e8ea', 
                    borderRadius: '50%', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    margin: '0 auto 20px auto'
                }}>
                    <Scissors size={24} color="#666" />
                </div>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '8px', color: 'var(--text-primary)' }}>No snippets yet</h3>
                <p style={{ maxWidth: '400px', margin: '0 auto' }}>
                    Create a snippet to automatically expand text. For example, type ";email" to expand to your full email address.
                </p>
            </div>
        </div>
    );
};

export default Snippets;
