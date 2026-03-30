import User from '../models/User.js';

// @desc    Get logged in user's profile
// @route   GET /api/user/me
// @access  Private
const getMe = async (req, res) => {
    const { _id, name, email, createdAt } = req.user;
    res.status(200).json({ _id, name, email, createdAt });
};

// @desc    Get all users (for DMs)
// @route   GET /api/users
// @access  Private
const getUsers = async (req, res) => {
    const users = await User.find({ _id: { $ne: req.user._id } }).select('-password');
    res.status(200).json(users);
};

export { getMe, getUsers };
