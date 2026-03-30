import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import axios from 'axios';

// Helper to get cookie by name
const getCookie = (name) => {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
    return null;
};

// Helper to set cookie
const setCookie = (name, value, days) => {
    let expires = "";
    if (days) {
        const date = new Date();
        date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
        expires = "; expires=" + date.toUTCString();
    }
    document.cookie = name + "=" + (value || "") + expires + "; path=/; SameSite=Strict";
};

// Helper to delete cookie
const deleteCookie = (name) => {
    document.cookie = name + '=; Max-Age=-99999999; path=/; SameSite=Strict';
};

axios.defaults.withCredentials = true;

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(() => getCookie('token'));
    const [loading, setLoading] = useState(true);

    // Set axios default auth header whenever token changes
    useEffect(() => {
        if (token) {
            axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
            setCookie('token', token, 7);
        } else {
            delete axios.defaults.headers.common['Authorization'];
            deleteCookie('token');
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
