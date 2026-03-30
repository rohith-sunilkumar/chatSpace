import mongoose from 'mongoose';
import crypto from 'crypto';

const workspaceSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, 'Workspace name is required'],
            trim: true,
        },
        owner: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        members: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'User',
            },
        ],
        inviteCode: {
            type: String,
            unique: true,
        },
    },
    { timestamps: true }
);

// Auto-generate unique 8-char invite code before save
workspaceSchema.pre('save', function (next) {
    if (!this.inviteCode) {
        this.inviteCode = crypto.randomBytes(4).toString('hex').toUpperCase();
    }
    next();
});

// Helper: check if a userId is a member
workspaceSchema.methods.isMember = function (userId) {
    return this.members.some((m) => m.toString() === userId.toString());
};

const Workspace = mongoose.model('Workspace', workspaceSchema);
export default Workspace;
