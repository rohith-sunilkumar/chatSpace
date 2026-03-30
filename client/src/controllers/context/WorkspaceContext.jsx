import { createContext, useContext, useState, useCallback } from 'react';
import axios from 'axios';

const WorkspaceContext = createContext(null);

export const WorkspaceProvider = ({ children }) => {
    const [workspaces, setWorkspaces] = useState([]);
    const [activeWorkspace, setActiveWorkspace] = useState(null);
    const [channels, setChannels] = useState([]);
    const [activeChannel, setActiveChannel] = useState(null);
    const [users, setUsers] = useState([]);
    const [activeDMUser, setActiveDMUser] = useState(null);

    const fetchWorkspaces = useCallback(async () => {
        const { data } = await axios.get('/api/workspaces');
        setWorkspaces(data);

        if (activeWorkspace && !data.find(w => w._id === activeWorkspace._id)) {
            // Case 1: The current activeWorkspace is no longer in our fetched array
            setActiveWorkspace(null);
            setActiveChannel(null);
            setActiveDMUser(null);
            setChannels([]);
        } else if (data.length > 0 && !activeWorkspace) {
            // Case 2: We have workspaces but none active
            setActiveWorkspace(data[0]);
        }

        return data;
    }, [activeWorkspace]);

    const fetchUsers = useCallback(async () => {
        try {
            const { data } = await axios.get('/api/users');
            setUsers(data);
            return data;
        } catch (error) {
            console.error('Failed to fetch users', error);
        }
    }, []);

    const createWorkspace = async (name) => {
        const { data } = await axios.post('/api/workspaces', { name });
        setWorkspaces((prev) => [data, ...prev]);
        setActiveWorkspace(data);
        return data;
    };

    const joinWorkspace = async (inviteCode) => {
        const { data } = await axios.post('/api/workspaces/join', { inviteCode });
        // Avoid duplicates
        setWorkspaces((prev) => {
            const exists = prev.find((w) => w._id === data._id);
            return exists ? prev : [data, ...prev];
        });
        setActiveWorkspace(data);
        return data;
    };

    const selectWorkspace = (ws) => {
        setActiveWorkspace(ws);
        setActiveChannel(null);
        setActiveDMUser(null);
        setChannels([]);
    };

    const selectChannel = (ch) => {
        setActiveChannel(ch);
        setActiveDMUser(null);
    };

    const selectDMUser = (user) => {
        setActiveDMUser(user);
        setActiveChannel(null);
    };

    const fetchChannels = useCallback(async (workspaceId) => {
        const { data } = await axios.get(`/api/channels/${workspaceId}`);
        setChannels(data);
        if (data.length > 0) setActiveChannel(data[0]);
        return data;
    }, []);

    const createChannel = async (workspaceId, name) => {
        const { data } = await axios.post('/api/channels', { workspaceId, name });
        setChannels((prev) => [...prev, data]);
        setActiveChannel(data);
        return data;
    };

    return (
        <WorkspaceContext.Provider
            value={{
                workspaces,
                activeWorkspace,
                channels,
                activeChannel,
                users,
                activeDMUser,
                fetchWorkspaces,
                fetchUsers,
                createWorkspace,
                joinWorkspace,
                selectWorkspace,
                selectChannel,
                selectDMUser,
                fetchChannels,
                createChannel,
                setActiveChannel,
            }}
        >
            {children}
        </WorkspaceContext.Provider>
    );
};

export const useWorkspace = () => {
    const ctx = useContext(WorkspaceContext);
    if (!ctx) throw new Error('useWorkspace must be used inside <WorkspaceProvider>');
    return ctx;
};

export default WorkspaceContext;
