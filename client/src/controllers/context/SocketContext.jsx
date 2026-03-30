import { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';

const SocketContext = createContext(null);

export const SocketProvider = ({ children }) => {
    const { user } = useAuth();
    const [socket, setSocket] = useState(null);

    useEffect(() => {
        // Only connect if user is authenticated
        if (user) {
            const apiUrl = import.meta.env.VITE_API_URL ||
                (window.location.hostname === 'localhost' ? 'http://localhost:5000' : 'https://chatspace-0rrm.onrender.com');

            const socketInstance = io(apiUrl, {
                withCredentials: true,
                transports: ['websocket', 'polling'], // Ensure fallback for better reliability
            });

            setSocket(socketInstance);

            return () => {
                socketInstance.disconnect();
            };
        } else if (socket) {
            socket.disconnect();
            setSocket(null);
        }
    }, [user]); // Re-run when user changes

    return (
        <SocketContext.Provider value={{ socket }}>
            {children}
        </SocketContext.Provider>
    );
};

export const useSocket = () => {
    const ctx = useContext(SocketContext);
    if (ctx === undefined) {
        throw new Error('useSocket must be used within a SocketProvider');
    }
    return ctx;
};

export default SocketContext;
