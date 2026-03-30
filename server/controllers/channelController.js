import Channel from '../models/Channel.js';
import Workspace from '../models/Workspace.js';

// Helper: assert caller is a member of the workspace
const assertMember = async (workspaceId, userId) => {
    const workspace = await Workspace.findById(workspaceId);
    if (!workspace) {
        const err = new Error('Workspace not found');
        err.statusCode = 404;
        throw err;
    }
    if (!workspace.isMember(userId)) {
        const err = new Error('Access denied — you are not a member of this workspace');
        err.statusCode = 403;
        throw err;
    }
    return workspace;
};

// @desc    Create a channel inside a workspace
// @route   POST /api/channels
// @access  Private + Member
const createChannel = async (req, res) => {
    const { workspaceId, name } = req.body;

    if (!workspaceId || !name) {
        res.status(400);
        throw new Error('workspaceId and channel name are required');
    }

    const workspace = await assertMember(workspaceId, req.user._id);

    // Normalize name
    const normalizedName = name.trim().toLowerCase().replace(/\s+/g, '-');

    try {
        const channel = await Channel.create({
            name: normalizedName,
            workspace: workspace._id,
            createdBy: req.user._id,
        });

        res.status(201).json(channel);
    } catch (err) {
        if (err.code === 11000) {
            res.status(409);
            throw new Error(`Channel "#${normalizedName}" already exists in this workspace`);
        }
        throw err;
    }
};

// @desc    Get all channels for a workspace
// @route   GET /api/channels/:workspaceId
// @access  Private + Member
const getChannels = async (req, res) => {
    const { workspaceId } = req.params;

    await assertMember(workspaceId, req.user._id);

    const channels = await Channel.find({ workspace: workspaceId }).sort({
        createdAt: 1,
    });

    res.status(200).json(channels);
};

export { createChannel, getChannels };
