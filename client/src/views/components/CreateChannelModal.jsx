import { useState } from 'react';
import { useWorkspace } from '../../controllers/context/WorkspaceContext';

const CreateChannelModal = ({ onClose }) => {
    const { activeWorkspace, createChannel } = useWorkspace();
    const [name, setName] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!name.trim()) return setError('Channel name is required');
        if (!/^[a-zA-Z0-9\-_ ]+$/.test(name)) {
            return setError('Only letters, numbers, hyphens, and underscores allowed');
        }
        try {
            setLoading(true);
            setError('');
            await createChannel(activeWorkspace._id, name.trim());
            onClose();
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to create channel');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-base/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-up" onClick={onClose}>
            <div className="bg-surface border border-white/5 shadow-2xl shadow-purple-900/10 rounded-2xl w-full max-w-md overflow-hidden relative" onClick={(e) => e.stopPropagation()}>
                <div className="flex items-center justify-between p-5 border-b border-white/5 bg-card/40">
                    <h2 className="text-xl font-extrabold text-primary"># New Channel</h2>
                    <button className="text-secondary hover:text-primary transition-colors cursor-pointer outline-none bg-transparent border-none text-xl p-1 leading-none rounded-md hover:bg-white/5" onClick={onClose}>✕</button>
                </div>

                {error && <div className="p-3 mx-5 mt-5 mb-0 rounded-md text-[0.875rem] flex items-center gap-2 bg-red-DEFAULT/10 border border-red-DEFAULT/30 text-red-300"><span>⚠️</span> {error}</div>}

                <form onSubmit={handleSubmit} className="p-5 flex flex-col gap-4">
                    <div className="flex flex-col gap-1.5">
                        <label htmlFor="ch-name" className="text-[0.85rem] font-medium text-secondary tracking-wide">Channel Name</label>
                        <input
                            id="ch-name"
                            type="text"
                            placeholder="e.g. announcements"
                            value={name}
                            onChange={(e) => setName(e.target.value.toLowerCase())}
                            autoFocus
                            className="bg-base border border-white/10 rounded-lg py-[0.7rem] px-[0.9rem] text-primary outline-none transition-all placeholder:text-muted focus:border-purple-DEFAULT focus:ring-[3px] focus:ring-purple-DEFAULT/25 font-mono"
                        />
                        <span className="text-xs text-secondary mt-1 block">Lowercase, no spaces (saved as #{name.replace(/\s+/g, '-') || 'channel-name'})</span>
                    </div>
                    <button type="submit" disabled={loading} className="w-full inline-flex items-center justify-center gap-[0.4rem] font-semibold py-[0.8rem] px-[1.5rem] mt-2 text-[1rem] rounded-xl border-none bg-gradient-to-r from-purple-500 to-cyan-500 text-white shadow-[0_4px_15px_rgba(139,92,246,0.35)] hover:brightness-[1.15] hover:-translate-y-[1px] transition-all disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer">
                        {loading ? <span className="inline-block w-[18px] h-[18px] border-[2.5px] border-white/30 border-t-white rounded-full animate-spin" /> : 'Create Channel'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default CreateChannelModal;
