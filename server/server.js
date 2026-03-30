import 'dotenv/config';
import 'express-async-errors';

import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import http from 'http';
import { Server } from 'socket.io';

import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/userRoutes.js';
import workspaceRoutes from './routes/workspaceRoutes.js';
import channelRoutes from './routes/channelRoutes.js';
import messageRoutes from './routes/messageRoutes.js';
import { errorMiddleware } from './middleware/errorMiddleware.js';

const app = express();
const httpServer = http.createServer(app);

// ── CORS ──────────────────────────────────────────────────────────────────────
app.use(
    cors({
        origin: process.env.FRONTEND_URL || 'http://localhost:5173',
        credentials: true,
    })
);

// ── Socket.IO ──────────────────────────────────────────────────────────────────
const io = new Server(httpServer, {
    cors: {
        origin: process.env.FRONTEND_URL || 'http://localhost:5173',
        credentials: true,
    },
});

// Export io so controllers can use it if needed in the future
export { io };

io.on('connection', (socket) => {
    console.log(`🔌 User connected: ${socket.id}`);

    socket.on('join_channel', (channelId) => {
        socket.join(channelId);
        console.log(`👤 User ${socket.id} joined channel ${channelId}`);
    });

    socket.on('send_message', (data) => {
        // Broadcast to everyone in channel including the sender
        // Ensures the UI can lazily map the response across active clients safely
        io.to(data.channelId).emit('receive_message', data.message);
    });

    socket.on('typing', (data) => {
        // Broadcast typing indicator to everyone EXCEPT the sender
        socket.to(data.channelId).emit('typing', data);
    });

    // ── Direct Messaging ──
    socket.on('join_dm', (data) => {
        const roomId = [data.userId1, data.userId2].sort().join('_');
        socket.join(roomId);
        console.log(`👤 User ${socket.id} joined DM room ${roomId}`);
    });

    socket.on('send_dm', (data) => {
        const roomId = [data.senderId, data.receiverId].sort().join('_');
        io.to(roomId).emit('receive_dm', data.message);
    });

    socket.on('typing_dm', (data) => {
        const roomId = [data.senderId, data.receiverId].sort().join('_');
        socket.to(roomId).emit('typing_dm', data);
    });

    socket.on('disconnect', () => {
        console.log(`🔌 User disconnected: ${socket.id}`);
    });
});

// ── Body Parsing ───────────────────────────────────────────────────────────────
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// ── Routes ─────────────────────────────────────────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);
app.use('/api/users', userRoutes); // Alias for collection array semantics
app.use('/api/workspaces', workspaceRoutes);
app.use('/api/channels', channelRoutes);
app.use('/api/messages', messageRoutes);

// ── Health Check ───────────────────────────────────────────────────────────────
app.get('/api/health', (req, res) => {
    res.status(200).json({ status: 'OK', message: 'Server is running' });
});

// ── 404 Handler ────────────────────────────────────────────────────────────────
app.use((req, res) => {
    res.status(404).json({ message: `Route ${req.originalUrl} not found` });
});

// ── Global Error Handler ───────────────────────────────────────────────────────
app.use(errorMiddleware);

// ── Connect to MongoDB & Start Server ─────────────────────────────────────────
const PORT = process.env.PORT || 5000;

mongoose
    .connect(process.env.MONGO_URI)
    .then(() => {
        console.log('✅  MongoDB connected');
        httpServer.listen(PORT, () => {
            console.log(`🚀  Server running on http://localhost:${PORT}`);
        });
    })
    .catch((err) => {
        console.error('❌  MongoDB connection error:', err.message);
        process.exit(1);
    });
