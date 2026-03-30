import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../controllers/context/AuthContext';

const Login = () => {
    const navigate = useNavigate();
    const { login } = useAuth();

    const [form, setForm] = useState({ email: '', password: '' });
    const [errors, setErrors] = useState({});
    const [serverError, setServerError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));
        if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }));
    };

    const validate = () => {
        const newErrors = {};
        if (!form.email.trim()) {
            newErrors.email = 'Email is required';
        } else if (!/^\S+@\S+\.\S+$/.test(form.email)) {
            newErrors.email = 'Enter a valid email address';
        }
        if (!form.password) {
            newErrors.password = 'Password is required';
        }
        return newErrors;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setServerError('');
        const validationErrors = validate();
        if (Object.keys(validationErrors).length > 0) {
            setErrors(validationErrors);
            return;
        }
        try {
            setLoading(true);
            await login({ email: form.email, password: form.password });
            navigate('/dashboard');
        } catch (err) {
            setServerError(err.response?.data?.message || 'Login failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-[calc(100vh-64px)] flex items-center justify-center p-8">
            <div className="w-full max-w-[440px] bg-gradient-card border border-white/10 rounded-[24px] p-10 shadow-2xl shadow-purple-900/20 animate-fade-up">
                <div className="text-center mb-8">
                    <div className="text-[2.5rem] mb-3">🔐</div>
                    <h1 className="text-[1.75rem] font-extrabold tracking-tight text-black">Welcome Back</h1>
                    <p className="text-black  text-secondary mt-1 text-[0.95rem]">Sign in to your account</p>
                </div>

                {serverError && (
                    <div className="p-3 rounded-md text-[0.875rem] flex items-center gap-2 mb-2 bg-red-DEFAULT/10 border border-red-DEFAULT/30 text-red-300">
                        <span>⚠️</span> {serverError}
                    </div>
                )}

                <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
                    <div className="flex flex-col gap-1.5">
                        <label htmlFor="email" className="text-[0.85rem] font-medium text-secondary tracking-wide">Email Address</label>
                        <input
                            id="email"
                            type="email"
                            name="email"
                            placeholder="you@example.com"
                            value={form.email}
                            onChange={handleChange}
                            autoComplete="email"
                            className={`bg-base border ${errors.email ? 'border-red-DEFAULT focus:ring-red-DEFAULT/20' : 'border-white/10 focus:border-purple-DEFAULT focus:ring-purple-DEFAULT/25'} rounded-lg py-[0.7rem] px-[0.9rem] text-primary outline-none transition-all placeholder:text-muted focus:ring-[3px]`}
                        />
                        {errors.email && <span className="text-[0.78rem] text-red-DEFAULT flex items-center gap-1">{errors.email}</span>}
                    </div>

                    <div className="flex flex-col gap-1.5">
                        <label htmlFor="password" className="text-[0.85rem] font-medium text-secondary tracking-wide">Password</label>
                        <input
                            id="password"
                            type="password"
                            name="password"
                            placeholder="Enter your password"
                            value={form.password}
                            onChange={handleChange}
                            autoComplete="current-password"
                            className={`bg-base border ${errors.password ? 'border-red-DEFAULT focus:ring-red-DEFAULT/20' : 'border-white/10 focus:border-purple-DEFAULT focus:ring-purple-DEFAULT/25'} rounded-lg py-[0.7rem] px-[0.9rem] text-primary outline-none transition-all placeholder:text-muted focus:ring-[3px]`}
                        />
                        {errors.password && <span className="text-[0.78rem] text-red-DEFAULT flex items-center gap-1">{errors.password}</span>}
                    </div>

                    <button type="submit" disabled={loading} className="w-full inline-flex items-center justify-center gap-[0.4rem] font-semibold py-[0.8rem] px-[1.5rem] mt-2 text-[1rem] rounded-xl border-none bg-gradient-to-r from-purple-500 to-cyan-500 text-white shadow-[0_4px_15px_rgba(139,92,246,0.35)] hover:brightness-[1.15] hover:shadow-[0_6px_20px_rgba(139,92,246,0.5)] hover:-translate-y-[1px] transition-all disabled:opacity-60 disabled:cursor-not-allowed">
                        {loading ? (
                            <span className="inline-block w-[18px] h-[18px] border-[2.5px] border-white/30 border-t-white rounded-full animate-spin" />
                        ) : 'Sign In'}
                    </button>
                </form>

                <p className="text-center mt-6 text-[0.9rem] text-secondary">
                    Don't have an account?{' '}
                    <Link to="/register" className="text-purple-light font-semibold hover:text-[#c4b5fd] hover:underline transition-colors">
                        Sign up
                    </Link>
                </p>
            </div>
        </div>
    );
};

export default Login;
