import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useAuth } from '../../controllers/context/AuthContext';
import { useSocket } from '../../controllers/context/SocketContext';
import { useWorkspace } from '../../controllers/context/WorkspaceContext';

const EMOJIS = ['👍', '❤️', '😂', '🎉', '🚀'];

const ChatArea = () => {
    const { user } = useAuth();
    const { socket } = useSocket();
    const { activeChannel, activeDMUser } = useWorkspace();

    const isDM = !!activeDMUser;
    const headerTitle = isDM ? activeDMUser.name : activeChannel?.name;
    const headerPrefix = isDM ? '@' : '#';
    const apiEndpoint = isDM ? `/api/messages/dm/${activeDMUser?._id}` : `/api/messages/${activeChannel?._id}`;

    const [messages, setMessages] = useState([]);
    const [content, setContent] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const [typingUsers, setTypingUsers] = useState(new Set());

    // Edit state
    const [editingMsgId, setEditingMsgId] = useState(null);
    const [editContent, setEditContent] = useState('');
    // Reaction picker state
    const [reactingMsgId, setReactingMsgId] = useState(null);

    const messagesEndRef = useRef(null);
    const chatMessagesRef = useRef(null);
    const typingTimeoutRef = useRef(null);
    const [isAtBottom, setIsAtBottom] = useState(true);

    const checkScroll = () => {
        if (!chatMessagesRef.current) return;
        const { scrollTop, scrollHeight, clientHeight } = chatMessagesRef.current;
        setIsAtBottom(scrollHeight - scrollTop - clientHeight < 100);
    };

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        if (isAtBottom) scrollToBottom();
    }, [messages, isAtBottom]);

    // 1. Fetch historical messages
    useEffect(() => {
        if (!activeChannel && !activeDMUser) return;

        const fetchMessages = async () => {
            try {
                const { data } = await axios.get(apiEndpoint);
                setMessages(data);
                setIsAtBottom(true);
                setTimeout(scrollToBottom, 100);
            } catch (err) {
                console.error('Failed to load messages', err);
            }
        };

        fetchMessages();
        setEditingMsgId(null);
        setReactingMsgId(null);
    }, [activeChannel, activeDMUser, apiEndpoint]);

    // 2. Setup socket listeners
    useEffect(() => {
        if (!socket || (!activeChannel && !activeDMUser)) return;

        if (isDM) {
            socket.emit('join_dm', { userId1: user._id, userId2: activeDMUser._id });
        } else {
            socket.emit('join_channel', activeChannel._id);
        }

        const handleReceiveMessage = (newMessage) => {
            setMessages((prev) => {
                if (prev.some((m) => m._id === newMessage._id)) return prev;
                return [...prev, newMessage];
            });
        };

        const handleUpdateMessage = (updatedMessage) => {
            setMessages((prev) =>
                prev.map((msg) => (msg._id === updatedMessage._id ? updatedMessage : msg))
            );
        };

        const handleDeleteMessage = (messageId) => {
            setMessages((prev) => prev.filter((msg) => msg._id !== messageId));
        };

        const handleReaction = ({ messageId, reactions }) => {
            setMessages((prev) =>
                prev.map((msg) => (msg._id === messageId ? { ...msg, reactions } : msg))
            );
        };

        const handleTyping = (data) => {
            setTypingUsers((prev) => {
                const next = new Set(prev);
                if (data.isTyping) next.add(data.userName);
                else next.delete(data.userName);
                return next;
            });
        };

        const receiveEvent = isDM ? 'receive_dm' : 'receive_message';
        const typingEvent = isDM ? 'typing_dm' : 'typing';

        socket.on(receiveEvent, handleReceiveMessage);
        socket.on('message_updated', handleUpdateMessage);
        socket.on('message_deleted', handleDeleteMessage);
        socket.on('message_reaction', handleReaction);
        socket.on(typingEvent, handleTyping);

        return () => {
            socket.off(receiveEvent, handleReceiveMessage);
            socket.off('message_updated', handleUpdateMessage);
            socket.off('message_deleted', handleDeleteMessage);
            socket.off('message_reaction', handleReaction);
            socket.off(typingEvent, handleTyping);
            setTypingUsers(new Set());
        };
    }, [socket, activeChannel, activeDMUser, isDM, user._id]);

    // 3. Handlers
    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!content.trim()) return;

        if (socket) {
            const typingEvent = isDM ? 'typing_dm' : 'typing';
            const payload = isDM
                ? { senderId: user._id, receiverId: activeDMUser._id, userName: user.name, isTyping: false }
                : { channelId: activeChannel._id, userName: user.name, isTyping: false };
            socket.emit(typingEvent, payload);
        }

        clearTimeout(typingTimeoutRef.current);
        setIsTyping(false);

        try {
            const endpoint = isDM ? '/api/messages/dm' : '/api/messages';
            const payload = isDM
                ? { content: content.trim(), receiverId: activeDMUser._id }
                : { content: content.trim(), channelId: activeChannel._id };

            await axios.post(endpoint, payload);
            setContent('');
        } catch (err) {
            console.error('Failed to send message', err);
        }
    };

    const handleEditSubmit = async (messageId) => {
        if (!editContent.trim()) return;
        try {
            const { data } = await axios.put(`/api/messages/${messageId}`, { content: editContent.trim() });
            setMessages((prev) => prev.map((msg) => (msg._id === data._id ? data : msg)));
            setEditingMsgId(null);
        } catch (err) {
            console.error('Failed to edit', err);
        }
    };

    const handleDeleteClick = async (messageId) => {
        if (!window.confirm('Are you sure you want to delete this message?')) return;
        try {
            await axios.delete(`/api/messages/${messageId}`);
            setMessages((prev) => prev.filter((msg) => msg._id !== messageId));
        } catch (err) {
            console.error('Failed to delete', err);
        }
    };

    const handleReactToggle = async (messageId, emoji) => {
        try {
            const { data } = await axios.post(`/api/messages/${messageId}/react`, { emoji });
            setMessages((prev) => prev.map((msg) => (msg._id === data._id ? data : msg)));
            setReactingMsgId(null);
        } catch (err) {
            console.error('Failed to react', err);
        }
    };

    const handleInputChange = (e) => {
        setContent(e.target.value);
        if (!socket || (!activeChannel && !activeDMUser)) return;

        const typingEvent = isDM ? 'typing_dm' : 'typing';
        const typePayloadTrue = isDM
            ? { senderId: user._id, receiverId: activeDMUser._id, userName: user.name, isTyping: true }
            : { channelId: activeChannel._id, userName: user.name, isTyping: true };

        const typePayloadFalse = isDM
            ? { senderId: user._id, receiverId: activeDMUser._id, userName: user.name, isTyping: false }
            : { channelId: activeChannel._id, userName: user.name, isTyping: false };

        if (!isTyping) {
            setIsTyping(true);
            socket.emit(typingEvent, typePayloadTrue);
        }

        clearTimeout(typingTimeoutRef.current);
        typingTimeoutRef.current = setTimeout(() => {
            setIsTyping(false);
            socket.emit(typingEvent, typePayloadFalse);
        }, 2000);
    };

    const typingText = () => {
        const list = Array.from(typingUsers);
        if (list.length === 0) return null;
        if (list.length === 1) return `${list[0]} is typing...`;
        if (list.length === 2) return `${list[0]} and ${list[1]} are typing...`;
        return 'Several people are typing...';
    };

    return (
        <div className="flex-1 flex flex-col h-full bg-surface min-w-0">
            <div className="px-4 md:px-6 py-4 border-b border-white/5 flex items-center justify-between shrink-0">
                <h2 className="text-[1rem] md:text-[1.1rem] font-bold flex items-center gap-1 truncate">
                    <span className="text-muted">{headerPrefix}</span> {headerTitle}
                </h2>
            </div>

            <div className="flex-1 px-4 md:px-6 py-4 overflow-y-auto flex flex-col gap-4" ref={chatMessagesRef} onScroll={checkScroll}>
                {messages.length === 0 ? (
                    <div className="flex-1 flex flex-col items-center justify-center text-center text-secondary p-4">
                        <div className="text-3xl md:text-4xl mb-3">💬</div>
                        <h3 className="text-lg md:text-xl font-bold text-primary mb-1 line-clamp-1">
                            {isDM ? `Chat with ${headerTitle}` : `Welcome to #${headerTitle}!`}
                        </h3>
                        {isDM ? <p className="text-sm">This is the start of your direct messages.</p> : <p className="text-sm">This is the start of the channel.</p>}
                    </div>
                ) : (
                    messages.map((msg, i) => {
                        const isConsecutive =
                            i > 0 &&
                            messages[i - 1].senderId?._id === msg.senderId?._id &&
                            new Date(msg.createdAt) - new Date(messages[i - 1].createdAt) < 300000;
                        const isOwner = msg.senderId?._id === user._id;

                        // Check if current user reacted to an emoji
                        const hasReacted = (usersArray) => usersArray.some((id) => id === user._id);

                        return (
                            <div key={msg._id} className={`relative group flex gap-2 md:gap-3 ${isConsecutive ? 'mt-[-0.5rem]' : ''}`}>
                                {!isConsecutive && (
                                    <div className="w-8 h-8 md:w-10 md:h-10 rounded-lg md:rounded-xl bg-gradient-to-r from-purple-500 to-cyan-500 text-white flex items-center justify-center font-bold text-sm md:text-lg shadow-md shrink-0">
                                        {msg.senderId?.name?.charAt(0).toUpperCase()}
                                    </div>
                                )}
                                {isConsecutive && <div className="w-8 h-8 md:w-10 md:h-10 shrink-0 opacity-0" />}

                                <div className="flex-1 min-w-0">
                                    {!isConsecutive && (
                                        <div className="flex items-baseline gap-2 mb-0.5 md:mb-1">
                                            <span className="font-bold text-[0.85rem] md:text-[0.95rem] text-primary truncate max-w-[120px] md:max-w-none">{msg.senderId?.name}</span>
                                            <span className="text-[0.65rem] md:text-[0.7rem] text-muted whitespace-nowrap">
                                                {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </span>
                                        </div>
                                    )}

                                    {/* Edit Mode vs Normal View */}
                                    {editingMsgId === msg._id ? (
                                        <div className="flex flex-col sm:flex-row gap-2 mt-1">
                                            <input
                                                type="text"
                                                value={editContent}
                                                onChange={(e) => setEditContent(e.target.value)}
                                                onKeyDown={(e) => {
                                                    if (e.key === 'Enter') handleEditSubmit(msg._id);
                                                    if (e.key === 'Escape') setEditingMsgId(null);
                                                }}
                                                autoFocus
                                                className="flex-1 bg-elevated border border-white/10 rounded-lg py-1.5 px-3 text-primary outline-none focus:border-purple focus:ring-1 focus:ring-purple text-sm"
                                            />
                                            <div className="flex gap-2">
                                                <button className="flex-1 sm:flex-none bg-purple text-white px-3 py-1.5 rounded-lg text-xs font-medium hover:brightness-110 cursor-pointer" onClick={() => handleEditSubmit(msg._id)}>Save</button>
                                                <button className="flex-1 sm:flex-none bg-transparent border border-white/10 text-secondary px-3 py-1.5 rounded-lg text-xs font-medium hover:text-primary cursor-pointer transition-colors" onClick={() => setEditingMsgId(null)}>Cancel</button>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="text-[0.9rem] md:text-[0.95rem] text-primary/90 leading-relaxed whitespace-pre-wrap break-words">
                                            {msg.content}
                                            {msg.isEdited && <span className="text-[0.65rem] md:text-[0.7rem] text-muted ml-2 italic">(edited)</span>}
                                        </div>
                                    )}

                                    {/* Reactions List display */}
                                    {msg.reactions && msg.reactions.length > 0 && (
                                        <div className="flex flex-wrap gap-1 mt-1.5">
                                            {msg.reactions.map((r) => (
                                                <div
                                                    key={r.emoji}
                                                    className={`border rounded-full px-2 py-0.5 text-[0.7rem] flex items-center gap-1 cursor-pointer select-none transition-all ${hasReacted(r.users)
                                                        ? 'bg-purple-light/15 border-purple-light/30 text-purple-light hover:bg-purple-light/25'
                                                        : 'bg-white/5 border-white/10 text-secondary hover:bg-white/10 hover:border-white/20 hover:text-primary'
                                                        }`}
                                                    onClick={() => handleReactToggle(msg._id, r.emoji)}
                                                >
                                                    {r.emoji} <span className="font-semibold text-[0.65rem]">{r.users.length}</span>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                {/* Hover Actions Menu */}
                                <div className="absolute right-0 md:right-4 -top-8 bg-card border border-white/5 rounded-lg p-1 hidden group-hover:flex gap-0.5 md:gap-1 shadow-lg items-center z-10 transition-all">
                                    {reactingMsgId === msg._id ? (
                                        <div className="flex gap-0.5 md:gap-1 p-0.5">
                                            {EMOJIS.map(emoji => (
                                                <button key={emoji} className="bg-transparent border-none text-[0.9rem] md:text-[1rem] cursor-pointer p-0.5 hover:scale-125 transition-transform" onClick={() => handleReactToggle(msg._id, emoji)}>
                                                    {emoji}
                                                </button>
                                            ))}
                                        </div>
                                    ) : (
                                        <button className="bg-transparent border-none text-[0.8rem] md:text-[0.85rem] text-secondary hover:text-primary transition-colors cursor-pointer p-1 rounded hover:bg-white/5" title="React" onClick={() => setReactingMsgId(msg._id)}>😊</button>
                                    )}

                                    {isOwner && (
                                        <>
                                            <button
                                                className="bg-transparent border-none text-[0.8rem] md:text-[0.85rem] text-secondary hover:text-primary transition-colors cursor-pointer p-1 rounded hover:bg-white/5"
                                                title="Edit"
                                                onClick={() => {
                                                    setEditingMsgId(msg._id);
                                                    setEditContent(msg.content);
                                                }}
                                            >
                                                ✎
                                            </button>
                                            <button
                                                className="bg-transparent border-none text-[0.8rem] md:text-[0.85rem] text-secondary hover:text-red transition-colors cursor-pointer p-1 rounded hover:bg-white/5"
                                                title="Delete"
                                                onClick={() => handleDeleteClick(msg._id)}
                                            >
                                                ✕
                                            </button>
                                        </>
                                    )}
                                </div>
                            </div>
                        );
                    })
                )}
                <div ref={messagesEndRef} />
            </div>

            <div className="px-4 md:px-6 py-1 text-[0.75rem] text-muted italic h-[24px] flex items-center overflow-hidden">
                <span className="truncate">{typingText()}</span>
            </div>

            <div className="p-4 md:p-6 pt-0 shrink-0">
                <form onSubmit={handleSendMessage} className="flex items-end gap-2 md:gap-3 bg-elevated border border-white/10 rounded-xl md:rounded-[14px] p-1.5 md:p-2 focus-within:border-purple focus-within:ring-1 focus-within:ring-purple transition-all shadow-inner">
                    <input
                        type="text"
                        placeholder={`Message ${headerPrefix}${headerTitle}`}
                        value={content}
                        onChange={handleInputChange}
                        className="flex-1 bg-transparent border-none text-primary px-2 md:px-3 py-1.5 md:py-2 outline-none placeholder:text-muted resize-none text-[0.9rem] md:text-[0.95rem]"
                        autoFocus
                    />
                    <button type="submit" className="w-[34px] h-[34px] md:w-[38px] md:h-[38px] shrink-0 rounded-lg border-none bg-purple text-white flex items-center justify-center cursor-pointer transition-all hover:brightness-110 disabled:bg-white/5 disabled:text-muted disabled:cursor-not-allowed m-0.5" disabled={!content.trim()}>
                        ➤
                    </button>
                </form>
            </div>
        </div>
    );
};

export default ChatArea;
