import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../controllers/context/AuthContext';

const Dashboard = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <div className="min-h-[calc(100vh-64px)] p-6 md:p-10 flex justify-center items-start">
            <div className="w-full max-w-2xl flex flex-col gap-8 animate-fade-up mt-10">

                {/* Welcome Banner */}
                <div className="bg-gradient-card rounded-[24px] p-8 md:p-12 border border-white/10 flex flex-col items-center gap-6 shadow-xl shadow-purple-900/10 text-center">
                    <div className="w-24 h-24 rounded-full bg-gradient-to-r from-purple-500 to-cyan-500 flex items-center justify-center text-4xl font-bold text-white shadow-[0_4px_15px_rgba(139,92,246,0.5)] shrink-0">
                        {user?.name?.charAt(0).toUpperCase()}
                    </div>
                    <div>
                        <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-primary mb-2">Welcome, {user?.name?.split(' ')[0]}!</h1>
                        <p className="text-secondary text-lg">{user?.email}</p>
                    </div>
                </div>

                {/* Actions */}
                <div className="flex flex-col gap-4">
                    <button onClick={() => navigate('/workspace')} className="w-full inline-flex items-center justify-center gap-[0.5rem] font-bold py-4 px-6 text-[1.1rem] rounded-2xl border-none bg-gradient-to-r from-purple-500 to-cyan-500 text-white shadow-[0_4px_15px_rgba(139,92,246,0.35)] hover:brightness-[1.15] hover:shadow-[0_6px_20px_rgba(139,92,246,0.5)] hover:-translate-y-[2px] transition-all cursor-pointer">
                        Launch ChatSpace
                    </button>
                    <button onClick={handleLogout} className="w-full inline-flex items-center justify-center gap-[0.5rem] font-semibold py-4 px-6 text-[1.1rem] rounded-2xl border border-red-500/30 text-red-400 hover:bg-red-500/10 hover:-translate-y-[1px] transition-all cursor-pointer">
                        Sign Out
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
