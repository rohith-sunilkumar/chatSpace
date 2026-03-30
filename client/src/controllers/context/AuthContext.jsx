import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import axios from 'axios';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(() => localStorage.getItem('token'));
    const [loading, setLoading] = useState(true);

    // Set axios default auth header whenever token changes
    useEffect(() => {
        if (token) {
            axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
            localStorage.setItem('token', token);
        } else {
            delete axios.defaults.headers.common['Authorization'];
            localStorage.removeItem('token');
        }
    }, [token]);

    // On mount, validate existing token and fetch user
    const loadUser = useCallback(async () => {
        if (!token) {
            setLoading(false);
            return;
        }
        try {
            const { data } = await axios.get('/api/user/me');
            setUser(data);
        } catch {
            // Token invalid / expired — clear everything
            setToken(null);
            setUser(null);
        } finally {
            setLoading(false);
        }
    }, [token]);

    useEffect(() => {
        loadUser();
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    const register = async ({ name, email, password }) => {
        const { data } = await axios.post('/api/auth/register', { name, email, password });
        setToken(data.token);
        setUser({ _id: data._id, name: data.name, email: data.email });
        return data;
    };

    const login = async ({ email, password }) => {
        const { data } = await axios.post('/api/auth/login', { email, password });
        setToken(data.token);
        setUser({ _id: data._id, name: data.name, email: data.email });
        return data;
    };

    const logout = () => {
        setToken(null);
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, token, loading, register, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) throw new Error('useAuth must be used inside <AuthProvider>');
    return context;
};

export default AuthContext;
