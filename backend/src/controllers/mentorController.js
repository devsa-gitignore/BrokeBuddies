/**
 * Mentor Controller
 * CRUD for mentors and assignment to teams.
 */

const Mentor = require('../models/Mentor');
const Hackathon = require('../models/Hackathon');
const Team = require('../models/Team');

// @desc    Add a new mentor
// @route   POST /api/mentors
// @access  Private (Admin)
exports.addMentor = async (req, res) => {
    try {
        const { name, domain, linkedinUrl, profilePhotoUrl, capacity, hackathonId } = req.body;

        if (!name || !domain || !hackathonId) {
            return res.status(400).json({ message: 'name, domain, and hackathonId are required' });
        }

        const hackathon = await Hackathon.findById(hackathonId);
        if (!hackathon) {
            return res.status(404).json({ message: 'Hackathon not found' });
        }

        const mentor = await Mentor.create({
            name,
            domain,
            linkedinUrl,
            profilePhotoUrl,
            capacity: capacity || 5,
            hackathon: hackathonId,
        });

        // Also add mentor to hackathon's mentors array
        hackathon.mentors.push(mentor._id);
        await hackathon.save();

        res.status(201).json({ success: true, message: 'Mentor created', mentor });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get all mentors for a hackathon
// @route   GET /api/mentors/hackathon/:hackathonId
// @access  Private
exports.getMentorsByHackathon = async (req, res) => {
    try {
        const mentors = await Mentor.find({ hackathon: req.params.hackathonId })
            .populate('assignedTeams', 'name')
            .sort({ domain: 1, name: 1 });

        res.json({ success: true, mentors });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get mentor by ID
// @route   GET /api/mentors/:id
// @access  Private
exports.getMentorById = async (req, res) => {
    try {
        const mentor = await Mentor.findById(req.params.id)
            .populate('assignedTeams', 'name members')
            .populate('hackathon', 'name');

        if (!mentor) return res.status(404).json({ message: 'Mentor not found' });
        res.json({ success: true, mentor });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update a mentor
// @route   PUT /api/mentors/:id
// @access  Private (Admin)
exports.updateMentor = async (req, res) => {
    try {
        const { name, domain, linkedinUrl, profilePhotoUrl, capacity } = req.body;

        const mentor = await Mentor.findById(req.params.id);
        if (!mentor) return res.status(404).json({ message: 'Mentor not found' });

        if (name !== undefined) mentor.name = name;
        if (domain !== undefined) mentor.domain = domain;
        if (linkedinUrl !== undefined) mentor.linkedinUrl = linkedinUrl;
        if (profilePhotoUrl !== undefined) mentor.profilePhotoUrl = profilePhotoUrl;
        if (capacity !== undefined) mentor.capacity = capacity;

        await mentor.save();
        res.json({ success: true, message: 'Mentor updated', mentor });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Delete a mentor
// @route   DELETE /api/mentors/:id
// @access  Private (Admin)
exports.deleteMentor = async (req, res) => {
    try {
        const mentor = await Mentor.findById(req.params.id);
        if (!mentor) return res.status(404).json({ message: 'Mentor not found' });

        // Remove from hackathon's mentors array
        await Hackathon.findByIdAndUpdate(mentor.hackathon, {
            $pull: { mentors: mentor._id },
        });

        // Unlink from any teams that had this mentor
        await Team.updateMany(
            { mentor: mentor._id },
            { $unset: { mentor: 1, selectedDomain: 1 } }
        );

        await mentor.deleteOne();
        res.json({ success: true, message: 'Mentor deleted' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Select a mentor (student selects after shortlisting) — domain-based FCFS
// @route   POST /api/mentors/:id/select
// @access  Private (Student, shortlisted)
exports.selectMentor = async (req, res) => {
    try {
        const { teamId } = req.body;

        const team = await Team.findById(teamId);
        if (!team) return res.status(404).json({ success: false, message: 'Team not found' });

        if (team.leader.toString() !== req.user.id) {
            return res.status(403).json({ success: false, message: 'Only team leader can select a mentor' });
        }

        if (team.status !== 'shortlisted') {
            return res.status(403).json({ success: false, message: 'Only shortlisted teams can select a mentor' });
        }

        if (team.mentor) {
            return res.status(400).json({ success: false, message: 'A mentor has already been allocated to this team' });
        }

        const mentor = await Mentor.findById(req.params.id);
        if (!mentor) return res.status(404).json({ success: false, message: 'Mentor not found' });

        // Check capacity
        if (mentor.assignedTeams.length >= mentor.capacity) {
            return res.status(400).json({ success: false, message: 'This mentor has reached maximum capacity' });
        }

        // Allocate
        team.mentor = mentor._id;
        team.selectedDomain = mentor.domain;
        await team.save();

        mentor.assignedTeams.push(team._id);
        await mentor.save();

        res.json({ success: true, message: `Mentor ${mentor.name} allocated successfully`, team });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
