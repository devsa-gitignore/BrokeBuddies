const User = require('../models/User');

// @desc    Get current user profile
// @route   GET /api/users/me
// @access  Private
exports.getMe = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password');
        if (user) {
            res.json(user);
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update current user profile
// @route   PUT /api/users/me
// @access  Private
exports.updateMe = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);

        if (user) {
            user.name = req.body.name || user.name;
            user.email = req.body.email || user.email;

            if (req.body.phoneNumber && req.body.phoneNumber !== user.phoneNumber) {
                const phoneExists = await User.findOne({ phoneNumber: req.body.phoneNumber });
                if (phoneExists) {
                    return res.status(400).json({ message: 'Phone number already in use' });
                }
                user.phoneNumber = req.body.phoneNumber;
            }

            if (req.body.registrationDetails) {
                user.registrationDetails = {
                    ...user.registrationDetails,
                    ...req.body.registrationDetails
                };
            }

            const updatedUser = await user.save();
            res.json({
                _id: updatedUser._id,
                name: updatedUser.name,
                email: updatedUser.email,
                role: updatedUser.role,
                isVerified: updatedUser.isVerified,
                registrationDetails: updatedUser.registrationDetails,
                phoneNumber: updatedUser.phoneNumber
            });
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update password
// @route   PUT /api/users/me/password
// @access  Private
exports.updatePassword = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);

        if (user && (await user.matchPassword(req.body.currentPassword))) {
            user.password = req.body.newPassword;
            await user.save();
            res.json({ message: 'Password updated successfully' });
        } else {
            res.status(401).json({ message: 'Invalid current password' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get user by ID
// @route   GET /api/users/:userId
// @access  Private
exports.getUserById = async (req, res) => {
    try {
        const user = await User.findById(req.params.userId).select('-password');
        if (user) {
            res.json(user);
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
