import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import ChatArea from '../components/ChatArea';
import { useAuth } from '../../controllers/context/AuthContext';
import { useWorkspace } from '../../controllers/context/WorkspaceContext';

const WorkspacePage = () => {
    const { logout } = useAuth();
    const navigate = useNavigate();
    const { activeWorkspace, activeChannel, activeDMUser } = useWorkspace();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <div className="h-screen flex overflow-hidden bg-base text-primary">
            <Sidebar />

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
