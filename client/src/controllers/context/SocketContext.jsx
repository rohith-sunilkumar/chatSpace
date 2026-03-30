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
            const socketInstance = io(
                import.meta.env.VITE_API_URL || 'https://chatspace-0rrm.onrender.com',
                {
                    withCredentials: true,
                }
            );

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
