import mongoose from 'mongoose';

const channelSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, 'Channel name is required'],
            trim: true,
            lowercase: true,
            match: [/^[a-z0-9\-_]+$/, 'Channel name can only contain letters, numbers, hyphens, and underscores'],
        },
        workspace: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Workspace',
            required: true,
        },
        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
    },
    { timestamps: true }
);

// A channel name must be unique within a workspace
channelSchema.index({ workspace: 1, name: 1 }, { unique: true });

const Channel = mongoose.model('Channel', channelSchema);
export default Channel;
