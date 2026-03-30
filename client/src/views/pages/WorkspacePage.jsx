import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import ChatArea from '../components/ChatArea';
import { useAuth } from '../../controllers/context/AuthContext';
import { useWorkspace } from '../../controllers/context/WorkspaceContext';

const WorkspacePage = () => {
    const { logout } = useAuth();
    const navigate = useNavigate();
    const { activeWorkspace, activeChannel, activeDMUser } = useWorkspace();
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

    return (
        <div className="h-screen flex flex-col md:flex-row overflow-hidden bg-base text-primary">
            {/* Mobile Header */}
            <div className="md:hidden flex items-center justify-between px-4 py-3 bg-[#050508] border-b border-white/5 shrink-0 z-20">
                <button
                    onClick={toggleSidebar}
                    className="p-2 text-secondary hover:text-white transition-colors"
                >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={isSidebarOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} />
                    </svg>
                </button>
                <h1 className="font-bold text-lg tracking-tight bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">
                    {activeWorkspace?.name || 'ChatSpace'}
                </h1>
                <div className="w-10"></div> {/* Spacer for symmetry */}
            </div>

            <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

            {/* Mobile Backdrop */}
            {isSidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/60 backdrop-blur-sm z-30 md:hidden animate-fade-in"
                    onClick={() => setIsSidebarOpen(false)}
                />
            )}

            <main className="flex-1 flex flex-col bg-surface relative min-w-0">
                {activeChannel || activeDMUser ? (
                    <ChatArea />
                ) : activeWorkspace ? (
                    <div className="flex flex-col items-center justify-center flex-1 text-center p-8 animate-fade-up">
                        <div className="w-32 h-32 rounded-full border border-white/5 bg-gradient-card shadow-2xl flex items-center justify-center text-5xl font-extrabold text-white mb-6 uppercase">
                            {activeWorkspace.name.charAt(0).toUpperCase()}
                        </div>
                        <h2 className="text-3xl font-bold bg-gradient-to-r from-purple-500 to-cyan-500 bg-clip-text text-transparent">{activeWorkspace.name}</h2>
                        <p className="text-secondary mt-2">Select a channel from the sidebar to get started.</p>
                        <div className="mt-6 bg-elevated border border-white/5 px-6 py-4 rounded-xl flex flex-col gap-2 items-center">
                            <span className="text-sm font-semibold text-secondary uppercase tracking-widest">Share this invite code to add members:</span>
                            <code className="bg-black/30 text-cyan px-4 py-2 rounded-lg font-mono text-xl font-bold tracking-[0.2em] shadow-inner">{activeWorkspace.inviteCode}</code>
                        </div>
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center flex-1 text-center p-8 animate-fade-up">
                        <h2 className="text-3xl font-bold text-primary mb-2 tracking-tight">Welcome to ChatSpace</h2>
                        <p className="text-secondary mb-8">Create or join a workspace to get started.</p>
                        <button
                            className="inline-flex items-center justify-center gap-2 font-semibold transition-all rounded-lg text-sm px-6 py-3 bg-gradient-to-r from-purple-500 to-cyan-500 text-white border-none shadow-[0_4px_15px_rgba(139,92,246,0.25)] hover:brightness-110 hover:-translate-y-0.5 cursor-pointer"
                            onClick={(e) => {
                                // Fire click on the + ws-add button in sidebar
                                document.querySelector('.ws-add')?.click();
                            }}
                        >
                            + Create Workspace
                        </button>
                    </div>
                )}
            </main>
        </div>
    );
};

export default WorkspacePage;
