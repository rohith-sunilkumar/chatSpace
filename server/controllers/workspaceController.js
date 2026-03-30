import Workspace from '../models/Workspace.js';
import Channel from '../models/Channel.js';

// @desc    Create a new workspace
// @route   POST /api/workspaces
// @access  Private
const createWorkspace = async (req, res) => {
    const { name } = req.body;

    if (!name || !name.trim()) {
        res.status(400);
        throw new Error('Workspace name is required');
    }

    const workspace = await Workspace.create({
        name: name.trim(),
        owner: req.user._id,
        members: [req.user._id], // creator is auto-added
    });

    // Create a default "general" channel
    await Channel.create({
        name: 'general',
        workspace: workspace._id,
        createdBy: req.user._id,
    });

    const populated = await Workspace.findById(workspace._id).populate(
        'members',
        'name email'
    );

    res.status(201).json(populated);
};

// @desc    Get all workspaces the logged-in user belongs to
// @route   GET /api/workspaces
// @access  Private
const getMyWorkspaces = async (req, res) => {
    const workspaces = await Workspace.find({ members: req.user._id })
        .populate('owner', 'name email')
        .sort({ createdAt: -1 });

    res.status(200).json(workspaces);
};

// @desc    Join a workspace via invite code
// @route   POST /api/workspaces/join
// @access  Private
const joinWorkspace = async (req, res) => {
    const { inviteCode } = req.body;

    if (!inviteCode) {
        res.status(400);
        throw new Error('Invite code is required');
    }

    const workspace = await Workspace.findOne({
        inviteCode: inviteCode.trim().toUpperCase(),
    });

    if (!workspace) {
        res.status(404);
        throw new Error('Invalid invite code — workspace not found');
    }

    if (workspace.isMember(req.user._id)) {
        return res.status(200).json({ message: 'Already a member', workspace });
    }

    workspace.members.push(req.user._id);
    await workspace.save();

    const populated = await Workspace.findById(workspace._id).populate(
        'members',
        'name email'
    );

    res.status(200).json(populated);
};

export { createWorkspace, getMyWorkspaces, joinWorkspace };
