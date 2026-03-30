import { useState } from 'react';
import { useWorkspace } from '../../controllers/context/WorkspaceContext';

const WorkspaceModal = ({ onClose }) => {
    const { createWorkspace, joinWorkspace } = useWorkspace();
    const [tab, setTab] = useState('create'); // 'create' | 'join'
    const [name, setName] = useState('');
    const [inviteCode, setInviteCode] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleCreate = async (e) => {
        e.preventDefault();
        if (!name.trim()) return setError('Workspace name is required');
        try {
            setLoading(true);
            setError('');
            await createWorkspace(name.trim());
            onClose();
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to create workspace');
        } finally {
            setLoading(false);
        }
    };

    const handleJoin = async (e) => {
        e.preventDefault();
        if (!inviteCode.trim()) return setError('Invite code is required');
        try {
            setLoading(true);
            setError('');
            await joinWorkspace(inviteCode.trim());
            onClose();
        } catch (err) {
            setError(err.response?.data?.message || 'Invalid invite code');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-base/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-up" onClick={onClose}>
            <div className="bg-surface border border-white/5 shadow-2xl shadow-purple-900/10 rounded-2xl w-full max-w-md overflow-hidden relative" onClick={(e) => e.stopPropagation()}>
                <div className="flex items-center justify-between p-5 border-b border-white/5 bg-card/40">
                    <h2 className="text-xl font-extrabold bg-gradient-to-r from-purple-500 to-cyan-500 bg-clip-text text-transparent">{tab === 'create' ? '✨ New Workspace' : '🔗 Join Workspace'}</h2>
                    <button className="text-secondary hover:text-primary transition-colors cursor-pointer outline-none bg-transparent border-none text-xl p-1 leading-none rounded-md hover:bg-white/5" onClick={onClose}>✕</button>
                </div>

                <div className="flex border-b border-white/5 bg-elevated/30">
                    <button
                        className={`flex-1 py-3 text-sm font-semibold transition-all cursor-pointer border-none bg-transparent ${tab === 'create' ? 'text-primary shadow-[inset_0_-2px_0_var(--color-purple)] bg-white/5' : 'text-secondary hover:text-primary hover:bg-white/5'}`}
                        onClick={() => { setTab('create'); setError(''); }}
                    >
                        Create
                    </button>
                    <button
                        className={`flex-1 py-3 text-sm font-semibold transition-all cursor-pointer border-none bg-transparent ${tab === 'join' ? 'text-primary shadow-[inset_0_-2px_0_var(--color-cyan)] bg-white/5' : 'text-secondary hover:text-primary hover:bg-white/5'}`}
                        onClick={() => { setTab('join'); setError(''); }}
                    >
                        Join
                    </button>
                </div>

                {error && <div className="p-3 mx-5 mt-5 mb-0 rounded-md text-[0.875rem] flex items-center gap-2 bg-red-DEFAULT/10 border border-red-DEFAULT/30 text-red-300"><span>⚠️</span> {error}</div>}

                {tab === 'create' ? (
                    <form onSubmit={handleCreate} className="p-5 flex flex-col gap-4">
                        <div className="flex flex-col gap-1.5">
                            <label htmlFor="ws-name" className="text-[0.85rem] font-medium text-secondary tracking-wide">Workspace Name</label>
                            <input
                                id="ws-name"
                                type="text"
                                placeholder="e.g. My Team"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                autoFocus
                                className="bg-base border border-white/10 rounded-lg py-[0.7rem] px-[0.9rem] text-primary outline-none transition-all placeholder:text-muted focus:border-purple-DEFAULT focus:ring-[3px] focus:ring-purple-DEFAULT/25"
                            />
                        </div>
                        <button type="submit" disabled={loading} className="w-full inline-flex items-center justify-center gap-[0.4rem] font-semibold py-[0.8rem] px-[1.5rem] mt-2 text-[1rem] rounded-xl border-none bg-gradient-to-r from-purple-500 to-cyan-500 text-white shadow-[0_4px_15px_rgba(139,92,246,0.35)] hover:brightness-[1.15] hover:-translate-y-[1px] transition-all disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer">
                            {loading ? <span className="inline-block w-[18px] h-[18px] border-[2.5px] border-white/30 border-t-white rounded-full animate-spin" /> : 'Create Workspace'}
                        </button>
                    </form>
                ) : (
                    <form onSubmit={handleJoin} className="p-5 flex flex-col gap-4">
                        <div className="flex flex-col gap-1.5">
                            <label htmlFor="invite-code" className="text-[0.85rem] font-medium text-secondary tracking-wide">Invite Code</label>
                            <input
                                id="invite-code"
                                type="text"
                                placeholder="e.g. A1B2C3D4"
                                value={inviteCode}
                                onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
                                maxLength={8}
                                autoFocus
                                className="bg-base border border-white/10 rounded-lg py-[0.7rem] px-[0.9rem] text-primary outline-none transition-all placeholder:text-muted focus:border-cyan focus:ring-[3px] focus:ring-cyan/25 uppercase font-mono tracking-widest"
                            />
                        </div>
                        <button type="submit" disabled={loading} className="w-full inline-flex items-center justify-center gap-[0.4rem] font-semibold py-[0.8rem] px-[1.5rem] mt-2 text-[1rem] rounded-xl border-none bg-gradient-to-r from-purple-500 to-cyan-500 text-white shadow-[0_4px_15px_rgba(139,92,246,0.35)] hover:brightness-[1.15] hover:-translate-y-[1px] transition-all disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer">
                            {loading ? <span className="inline-block w-[18px] h-[18px] border-[2.5px] border-white/30 border-t-white rounded-full animate-spin" /> : 'Join Workspace'}
                        </button>
                    </form>
                )}
            </div>
        </div>
    );
};

export default WorkspaceModal;
