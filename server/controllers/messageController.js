import Message from '../models/Message.js';
import Channel from '../models/Channel.js';
import Workspace from '../models/Workspace.js';
import { io } from '../server.js';

// Helper: verify user is in workspace
const isWorkspaceMember = async (workspaceId, userId) => {
    const ws = await Workspace.findById(workspaceId);
    if (!ws) return false;
    return ws.members.some((m) => m.toString() === userId.toString());
};

// @desc    Send a new message
// @route   POST /api/messages
// @access  Private
const sendMessage = async (req, res) => {
    const { content, channelId, receiverId } = req.body;

    if (!content) {
        return res.status(400).json({ message: 'Message content is required' });
    }

    // If sending to a channel, verify workspace membership
    if (channelId) {
        const channel = await Channel.findById(channelId);
        if (!channel) return res.status(404).json({ message: 'Channel not found' });

        if (!(await isWorkspaceMember(channel.workspace, req.user._id))) {
            return res.status(403).json({ message: 'Not a member of this workspace' });
        }
    }

    // Create message
    const msg = await Message.create({
        senderId: req.user._id,
        content,
        channelId,
        receiverId,
    });

    const populated = await msg.populate('senderId', 'name email');
    res.status(201).json(populated);
};

// @desc    Get channel messages
// @route   GET /api/messages/:channelId
// @access  Private
const getChannelMessages = async (req, res) => {
    const { channelId } = req.params;

    const channel = await Channel.findById(channelId);
    if (!channel) return res.status(404).json({ message: 'Channel not found' });

    if (!(await isWorkspaceMember(channel.workspace, req.user._id))) {
        return res.status(403).json({ message: 'Not a member of this workspace' });
    }

    const messages = await Message.find({ channelId })
        .populate('senderId', 'name email')
        .sort({ createdAt: 1 }); // Oldest first for chat history

    res.status(200).json(messages);
};

// @desc    Update a message
// @route   PUT /api/messages/:id
// @access  Private
const updateMessage = async (req, res) => {
    const { content } = req.body;
    const message = await Message.findById(req.params.id);

    if (!message) return res.status(404).json({ message: 'Message not found' });
    if (message.senderId.toString() !== req.user._id.toString()) {
        return res.status(403).json({ message: 'Not authorized to edit this message' });
    }

    message.content = content;
    message.isEdited = true;
    await message.save();
    await message.populate('senderId', 'name email');

    if (message.channelId) {
        io.to(message.channelId.toString()).emit('message_updated', message);
    }

    res.status(200).json(message);
};

// @desc    Delete a message
// @route   DELETE /api/messages/:id
// @access  Private
const deleteMessage = async (req, res) => {
    const message = await Message.findById(req.params.id);

    if (!message) return res.status(404).json({ message: 'Message not found' });
    if (message.senderId.toString() !== req.user._id.toString()) {
        return res.status(403).json({ message: 'Not authorized to delete this message' });
    }

    const channelId = message.channelId;
    await message.deleteOne();

    if (channelId) {
        io.to(channelId.toString()).emit('message_deleted', req.params.id);
    }

    res.status(200).json({ message: 'Message removed' });
};

// @desc    Toggle a reaction on a message
// @route   POST /api/messages/:id/react
// @access  Private
const toggleReaction = async (req, res) => {
    const { emoji } = req.body;
    if (!emoji) return res.status(400).json({ message: 'Emoji is required' });

    const message = await Message.findById(req.params.id);
    if (!message) return res.status(404).json({ message: 'Message not found' });

    const userId = req.user._id;

    // Find if emoji reaction group exists
    const reactionIndex = message.reactions.findIndex((r) => r.emoji === emoji);

    if (reactionIndex > -1) {
        // Emoji exists, see if user has already reacted
        const userIndex = message.reactions[reactionIndex].users.findIndex(
            (u) => u.toString() === userId.toString()
        );

        if (userIndex > -1) {
            // User already reacted -> Removing reaction
            message.reactions[reactionIndex].users.splice(userIndex, 1);
            // Remove emoji group if empty
            if (message.reactions[reactionIndex].users.length === 0) {
                message.reactions.splice(reactionIndex, 1);
            }
        } else {
            // Add user to reaction group
            message.reactions[reactionIndex].users.push(userId);
        }
    } else {
        // Emoji group does not exist -> Create and push user
        message.reactions.push({ emoji, users: [userId] });
    }

    await message.save();

    // We populate senderId so the frontend has full message context if it replaces the whole message
    // but typically reactions only need the reaction array to update. 
    // We'll return the populated message just in case.
    await message.populate('senderId', 'name email');

    if (message.channelId) {
        io.to(message.channelId.toString()).emit('message_reaction', {
            messageId: message._id,
            reactions: message.reactions,
        });
    }

    res.status(200).json(message);
};

// @desc    Get DM messages
// @route   GET /api/messages/dm/:userId
// @access  Private
const getDMMessages = async (req, res) => {
    const { userId } = req.params;
    const currentUserId = req.user._id;

    const messages = await Message.find({
        $or: [
            { senderId: currentUserId, receiverId: userId },
            { senderId: userId, receiverId: currentUserId },
        ],
    })
        .populate('senderId', 'name email')
        .sort({ createdAt: 1 });

    res.status(200).json(messages);
};

// @desc    Send a DM
// @route   POST /api/messages/dm
// @access  Private
const sendDM = async (req, res) => {
    const { receiverId, content } = req.body;

    if (!content) {
        return res.status(400).json({ message: 'Message content is required' });
    }
    if (!receiverId) {
        return res.status(400).json({ message: 'Receiver ID is required' });
    }

    const msg = await Message.create({
        senderId: req.user._id,
        content,
        receiverId,
    });

    const populated = await msg.populate('senderId', 'name email');
    res.status(201).json(populated);
};

export { sendMessage, getChannelMessages, updateMessage, deleteMessage, toggleReaction, getDMMessages, sendDM };
