const User = require('../models/User');

// @desc    Get Global leaderboard across all hackathons
// @route   GET /api/leaderboard/global
// @access  Public
exports.getGlobalLeaderboard = async (req, res) => {
    try {
        const leaderboard = await User.find({ role: 'student' })
            .select('name hackScore role registrationDetails.selfieUrl')
            .sort({ hackScore: -1 })
            .limit(50); // Get top 50

        res.json(leaderboard);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get a student's rank and score globally
// @route   GET /api/leaderboard/global/:userId
// @access  Private
exports.getGlobalUserRanking = async (req, res) => {
    try {
        const user = await User.findById(req.params.userId);
        if (!user) return res.status(404).json({ message: 'User not found' });

        // Calculate rank: count users with hackScore higher than this user
        const rank = await User.countDocuments({
            role: 'student',
            hackScore: { $gt: user.hackScore }
        }) + 1;

        res.json({
            userId: user._id,
            name: user.name,
            hackScore: user.hackScore,
            rank: rank
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get Round 1 leaderboard for a hackathon
// @route   GET /api/leaderboard/round1/:hackathonId
// @access  Private
exports.getRound1Leaderboard = async (req, res) => {
    // This is handled by evaluationController.getLeaderboardRound1 usually
    // But we can keep it here as a placeholder or redirect
    res.status(501).json({ message: 'Use /api/hackathons/:id/leaderboard/round1 instead' });
};

// @desc    Get Final leaderboard for a hackathon
// @route   GET /api/leaderboard/final/:hackathonId
// @access  Private
exports.getFinalLeaderboard = async (req, res) => {
    res.status(501).json({ message: 'Not implemented' });
};
