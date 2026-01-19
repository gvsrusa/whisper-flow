
import { AlignLeft, MessageSquare, Wand2 } from 'lucide-react';

const Style = () => {
    return (
        <div style={{ padding: '40px', maxWidth: '800px', margin: '0 auto' }}>
             <h1 style={{ fontSize: '1.8rem', fontWeight: 700, marginBottom: '10px' }}>Writing Style</h1>
             <p style={{ color: 'var(--text-secondary)', marginBottom: '40px' }}>Customize how Verba formats your transcriptions.</p>

             <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <StyleOption 
                    icon={AlignLeft}
                    title="Paragraph Handling"
                    description="Auto-detect frequent line breaks vs long paragraphs."
                    value="Auto"
                />
                 <StyleOption 
                    icon={MessageSquare}
                    title="Filler Words"
                    description="Remove 'um', 'uh', 'like' from the final text."
                    value="Remove"
                />
                 <StyleOption 
                    icon={Wand2}
                    title="Punctuation"
                    description="Automatically add commas, periods, and capitalization."
                    value="Enhanced"
                />
             </div>
        </div>
    );
};

const StyleOption = ({ icon: Icon, title, description, value }: any) => (
    <div style={{ 
        backgroundColor: 'var(--bg-secondary)', 
        padding: '20px', 
        borderRadius: '12px',
        display: 'flex', 
        alignItems: 'center',
        justifyContent: 'space-between',
        boxShadow: '0 2px 5px rgba(0,0,0,0.03)'
    }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
            <div style={{ padding: '10px', backgroundColor: '#f0f0f2', borderRadius: '8px' }}>
                <Icon size={20} />
            </div>
            <div>
                <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '2px' }}>{title}</h3>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{description}</p>
            </div>
        </div>
        <div style={{ 
            backgroundColor: '#e8e8ea', 
            padding: '6px 12px', 
            borderRadius: '6px', 
            fontSize: '0.9rem', 
            fontWeight: 600 
        }}>
            {value}
        </div>
    </div>
);

export default Style;
