const Broadcast = require('../models/Broadcast');
const Hackathon = require('../models/Hackathon');
const User = require('../models/User');
const Team = require('../models/Team');
const { sendBulkSMS } = require('../services/smsService');

// @desc    Send a broadcast message to all participants
// @route   POST /api/hackathons/:hackathonId/broadcast
// @access  Private (Admin)
exports.sendBroadcast = async (req, res) => {
    try {
        const mongoose = require('mongoose');
        const { message, sendSMS } = req.body;
        const hackathonId = req.params.hackathonId;

        console.log(`Broadcast initiated for hackathon: ${hackathonId}`);

        if (!mongoose.Types.ObjectId.isValid(hackathonId)) {
            return res.status(400).json({ message: 'Invalid Hackathon ID' });
        }

        const hackathon = await Hackathon.findById(hackathonId);
        if (!hackathon) return res.status(404).json({ message: 'Hackathon not found' });

        const broadcast = await Broadcast.create({
            hackathon: hackathonId,
            message,
            sentBy: req.user.id
        });

        if (sendSMS) {
            console.log('Searching for participants to send SMS...');

            // 1. Get all teams for this hackathon
            const teams = await Team.find({ hackathon: new mongoose.Types.ObjectId(hackathonId) }).populate('members', 'phoneNumber role');

            // 2. Collect unique phone numbers from team members
            const participantNumbers = new Set();
            teams.forEach(team => {
                team.members.forEach(member => {
                    if (member.phoneNumber) {
                        participantNumbers.add(member.phoneNumber);
                    }
                });
            });

            // 3. (Optional) Add judges/mentors assigned to this hackathon
            const staff = await User.find({
                'hackathonRoles.hackathonId': hackathonId
            }).select('phoneNumber');

            staff.forEach(s => {
                if (s.phoneNumber) participantNumbers.add(s.phoneNumber);
            });

            const phoneNumbers = Array.from(participantNumbers);
            console.log(`Found ${phoneNumbers.length} unique phone numbers for broadcast:`, phoneNumbers);

            if (phoneNumbers.length > 0) {
                const result = await sendBulkSMS(phoneNumbers, message);
                console.log(`Bulk SMS result: Success: ${result.sent}, Failed: ${result.failed}`);
            } else {
                console.log('No phone numbers found for this hackathon.');
            }
        }

        // Emit real-time broadcast to all participants in the hackathon room
        if (req.io) {
            req.io.to(`hackathon_${hackathonId}`).emit('broadcast:receive', {
                message: broadcast.message,
                sentBy: req.user.id,
                sentAt: broadcast.createdAt
            });
        }

        res.status(201).json(broadcast);
    } catch (error) {
        console.error('Broadcast Error:', error);
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get broadcast history for a hackathon
// @route   GET /api/hackathons/:hackathonId/broadcast/history
// @access  Private
exports.getBroadcastHistory = async (req, res) => {
    try {
        const broadcasts = await Broadcast.find({ hackathon: req.params.hackathonId })
            .populate('sentBy', 'name')
            .sort({ createdAt: -1 });
        res.json(broadcasts);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get broadcasts for current user
// @route   GET /api/broadcast/my
// @access  Private
exports.getMyBroadcasts = async (req, res) => {
    try {
        // Find hackathons where the user is involved
        // This is a simplified version
        const broadcasts = await Broadcast.find()
            .populate('sentBy', 'name')
            .sort({ createdAt: -1 })
            .limit(10);
        res.json(broadcasts);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
