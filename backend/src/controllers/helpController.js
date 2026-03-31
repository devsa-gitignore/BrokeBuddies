const HelpRequest = require('../models/HelpRequest');
const Team = require('../models/Team');

// @desc    Request help (from student)
// @route   POST /api/hackathons/:hackathonId/help
// @access  Private (Student)
exports.requestHelp = async (req, res) => {
    try {
        const { subject, description, location } = req.body;
        const hackathonId = req.params.hackathonId;

        // Find user's team for this hackathon
        const team = await Team.findOne({
            hackathon: hackathonId,
            members: req.user.id
        });

        const helpRequest = await HelpRequest.create({
            hackathon: hackathonId,
            user: req.user.id,
            team: team ? team._id : null,
            subject,
            description,
            location
        });

        // Emit real-time alert to admin dashboard
        if (req.io) {
            req.io.to(`hackathon_${hackathonId}`).emit('help:new-request', {
                requestId: helpRequest._id,
                userId: req.user.id,
                teamId: team ? team._id : null,
                teamName: team ? team.name : 'No team',
                subject,
                location,
                requestedAt: helpRequest.createdAt
            });
        }

        res.status(201).json(helpRequest);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get all help requests for a hackathon
// @route   GET /api/hackathons/:hackathonId/help
// @access  Private (Mentor/Admin)
exports.getHelpRequests = async (req, res) => {
    try {
        const requests = await HelpRequest.find({ hackathon: req.params.hackathonId })
            .populate('user', 'name email')
            .populate('team', 'name')
            .sort({ createdAt: -1 });
        res.json(requests);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Mark help request as resolved
// @route   PUT /api/help/:requestId/resolve
// @access  Private (Mentor/Admin)
exports.resolveHelpRequest = async (req, res) => {
    try {
        const helpRequest = await HelpRequest.findByIdAndUpdate(
            req.params.requestId,
            {
                status: 'resolved',
                resolvedBy: req.user.id
            },
            { new: true }
        );

        if (!helpRequest) return res.status(404).json({ message: 'Request not found' });
        res.json(helpRequest);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
