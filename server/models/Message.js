import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema(
    {
        senderId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        content: {
            type: String,
            required: true,
        },
        channelId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Channel',
        },
        receiverId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
        },
        isEdited: {
            type: Boolean,
            default: false,
        },
        reactions: [
            {
                emoji: String,
                users: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
            },
        ],
    },
    { timestamps: true }
);

const Message = mongoose.model('Message', messageSchema);
export default Message;
