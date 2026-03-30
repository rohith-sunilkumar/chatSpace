import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../controllers/context/AuthContext';

const Navbar = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <nav className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-base/80 backdrop-blur-md sticky top-0 z-50">
            <Link to="/" className="flex items-center gap-2 text-xl font-bold hover:opacity-80 transition-opacity">
                <span className="text-primary tracking-tight">ChatSpace</span>
            </Link>

            <div className="flex items-center gap-4">
                {user ? (
                    <>
                        <span className="text-sm text-secondary bg-elevated px-3 py-1.5 rounded-full flex items-center gap-2 border border-white/5">
                            👤 <strong className="text-primary font-medium">{user.name}</strong>
                        </span>
                        <button onClick={handleLogout} className="inline-flex items-center justify-center gap-2 font-semibold transition-all rounded-lg text-sm px-4 py-2 border border-white/10 text-primary hover:bg-white/5 cursor-pointer">
                            Logout
                        </button>
                    </>
                ) : (
                    <>
                        <Link to="/login" className="inline-flex items-center justify-center gap-2 font-semibold transition-all rounded-lg text-sm px-4 py-2 text-secondary hover:text-black hover:bg-white/5">
                            Login
                        </Link>
                        <Link to="/register" className="inline-flex items-center justify-center gap-2 font-semibold transition-all rounded-lg text-sm px-4 py-2 bg-gradient-hero text-black border-none shadow-[0_4px_15px_rgba(139,92,246,0.25)] hover:brightness-110 hover:-translate-y-0.5">
                            Sign up
                        </Link>
                    </>
                )}
            </div>
        </nav>
    );
};

export default Navbar;
