import { useEffect, useState } from 'react';
import { useWorkspace } from '../../controllers/context/WorkspaceContext';
import { useAuth } from '../../controllers/context/AuthContext';
import WorkspaceModal from './WorkspaceModal';
import CreateChannelModal from './CreateChannelModal';

const Sidebar = ({ isOpen, onClose }) => {
    const { user, logout } = useAuth();
    const {
        workspaces,
        activeWorkspace,
        channels,
        activeChannel,
        users,
        activeDMUser,
        fetchWorkspaces,
        fetchChannels,
        fetchUsers,
        selectWorkspace,
        selectChannel,
        selectDMUser,
    } = useWorkspace();

    const [showWsModal, setShowWsModal] = useState(false);
    const [showChModal, setShowChModal] = useState(false);

    // Load workspaces on mount
    useEffect(() => {
        fetchWorkspaces();
        fetchUsers();
    }, []); // eslint-disable-line

    // Load channels whenever active workspace changes
    useEffect(() => {
        if (activeWorkspace?._id) {
            fetchChannels(activeWorkspace._id);
        }
    }, [activeWorkspace?._id]); // eslint-disable-line

    const handleSelectWorkspace = (ws) => {
        selectWorkspace(ws);
        if (window.innerWidth < 768) onClose();
    };

    const handleSelectChannel = (ch) => {
        selectChannel(ch);
        if (window.innerWidth < 768) onClose();
    };

    const handleSelectDMUser = (u) => {
        selectDMUser(u);
        if (window.innerWidth < 768) onClose();
    };

    return (
        <>
            <aside className={`
                fixed md:relative inset-y-0 left-0 w-[300px] md:w-[320px] 
                bg-base border-r border-white/5 flex h-full z-40 
                transition-transform duration-300 ease-in-out shrink-0 overflow-hidden
                ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
            `}>
                {/* ── Workspace Rail (left column) ── */}
                <div className="w-[68px] bg-[#050508] border-r border-white/5 flex flex-col items-center py-4 justify-between shrink-0 h-full">
                    <div className="flex flex-col gap-3 w-full items-center">
                        {workspaces.map((ws) => (
                            <button
                                key={ws._id}
                                className={`w-[42px] h-[42px] rounded-2xl flex items-center justify-center text-[1.1rem] font-bold cursor-pointer transition-all outline-none focus-visible:ring-2 focus-visible:ring-purple ${activeWorkspace?._id === ws._id
                                    ? 'bg-purple text-white shadow-[0_0_15px_rgba(139,92,246,0.5)] !rounded-xl'
                                    : 'bg-white/5 text-secondary hover:rounded-xl hover:bg-white/10 hover:text-primary'
                                    }`}
                                onClick={() => handleSelectWorkspace(ws)}
                                title={ws.name}
                            >
                                {ws.name.charAt(0).toUpperCase()}
                            </button>
                        ))}
                        <button
                            className="ws-add w-[42px] h-[42px] rounded-2xl border-2 border-dashed border-white/10 text-white/40 hover:border-white/20 hover:text-white/80 bg-transparent text-[1.3rem] font-medium flex items-center justify-center cursor-pointer transition-all hover:rounded-xl outline-none focus-visible:ring-2 focus-visible:ring-purple"
                            onClick={() => setShowWsModal(true)}
                            title="Add workspace"
                        >
                            +
                        </button>
                    </div>

                    <div className="flex flex-col gap-3 w-full items-center">
                        <button
                            className="w-[42px] h-[42px] rounded-[50%] bg-gradient-to-r from-purple-500 to-cyan-500 text-white flex items-center justify-center font-bold shadow-md text-sm cursor-pointer outline-none hover:ring-2 hover:ring-purple hover:ring-offset-2 hover:ring-offset-[#050508] transition-all"
                            title={`Logged in as ${user?.name}`}
                            onClick={logout}
                        >
                            {user?.name?.charAt(0).toUpperCase()}
                        </button>
                    </div>
                </div>

                {/* ── Channel Panel (right column) ── */}
                <div className="flex-1 bg-card/50 flex flex-col min-h-0">
                    {activeWorkspace ? (
                        <>
                            <div className="h-16 border-b border-white/5 flex items-center justify-between px-3 md:px-4 sticky top-0 bg-card/80 backdrop-blur z-10 shadow-sm gap-2">
                                <span className="font-bold text-[0.95rem] md:text-[1.05rem] truncate text-primary">{activeWorkspace.name}</span>
                                <div className="text-[0.65rem] md:text-[0.7rem] bg-cyan/10 text-cyan border border-cyan/20 px-1.5 md:px-2 py-1 rounded-md flex items-center gap-1 cursor-default shrink-0 min-w-0" title="Invite code">
                                    <span className="opacity-70">🔗</span> <code className="font-mono font-bold tracking-tight">{activeWorkspace.inviteCode}</code>
                                </div>
                            </div>

                            <div className="px-4 mt-6 mb-2 text-[0.7rem] uppercase tracking-widest font-bold text-secondary">Channels</div>
                            <ul className="flex-1 overflow-y-auto px-2 pb-4 flex flex-col gap-0.5">
                                {channels.map((ch) => (
                                    <li key={ch._id}>
                                        <button
                                            className={`w-full text-left px-3 py-1.5 rounded-lg text-[0.95rem] font-medium transition-all cursor-pointer flex items-center border ${activeChannel?._id === ch._id
                                                ? 'bg-white/5 text-primary border-white/10 shadow-sm'
                                                : 'text-secondary border-transparent hover:bg-white/5 hover:text-primary'
                                                }`}
                                            onClick={() => handleSelectChannel(ch)}
                                        >
                                            <span className="text-muted mr-1.5 font-normal">#</span> {ch.name}
                                        </button>
                                    </li>
                                ))}
                                {channels.length === 0 && (
                                    <li className="px-4 py-2 text-sm text-muted italic">No channels yet</li>
                                )}
                            </ul>

                            <button
                                className="mx-4 mb-4 mt-auto py-2 bg-white/5 hover:bg-white/10 border border-dashed border-white/10 rounded-lg text-sm text-secondary hover:text-primary transition-all cursor-pointer shrink-0"
                                onClick={() => setShowChModal(true)}
                            >
                                + Add Channel
                            </button>

                            <div className="px-4 mt-2 mb-2 text-[0.7rem] uppercase tracking-widest font-bold text-secondary shrink-0">Direct Messages</div>
                            <ul className="flex-1 overflow-y-auto px-2 pb-4 flex flex-col gap-0.5">
                                {users.map((u) => (
                                    <li key={u._id}>
                                        <button
                                            className={`w-full text-left px-3 py-1.5 rounded-lg text-[0.95rem] font-medium transition-all cursor-pointer flex items-center border ${activeDMUser?._id === u._id
                                                ? 'bg-white/5 text-primary border-white/10 shadow-sm'
                                                : 'text-secondary border-transparent hover:bg-white/5 hover:text-primary'
                                                }`}
                                            onClick={() => handleSelectDMUser(u)}
                                        >
                                            <span className="w-5 h-5 rounded-md bg-gradient-to-r from-purple-500 to-cyan-500 text-white flex items-center justify-center text-[0.6rem] font-bold mr-2">{u.name.charAt(0).toUpperCase()}</span>
                                            <span className="truncate">{u.name}</span>
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        </>
                    ) : (
                        <div className="flex-1 flex flex-col items-center justify-center p-6 text-center text-muted text-sm gap-4">
                            <p>No workspace selected</p>
                            <button
                                className="inline-flex items-center justify-center gap-2 font-semibold transition-all rounded-lg px-4 py-2 text-sm bg-gradient-to-r from-purple-500 to-cyan-500 border-none shadow-[0_4px_15px_rgba(139,92,246,0.25)] hover:brightness-110 hover:-translate-y-0.5 mt-2 text-white cursor-pointer"
                                onClick={() => setShowWsModal(true)}
                            >
                                Create or Join
                            </button>
                        </div>
                    )}
                </div>
            </aside>

            {showWsModal && <WorkspaceModal onClose={() => setShowWsModal(false)} />}
            {showChModal && activeWorkspace && (
                <CreateChannelModal onClose={() => setShowChModal(false)} />
            )}
        </>
    );
};

export default Sidebar;
