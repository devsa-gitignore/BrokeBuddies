const mongoose = require("mongoose");
const Submission = require("../models/Submission");
const Team = require("../models/Team");
const Hackathon = require("../models/Hackathon");

/**
 * Submission Controller
 * Handles Round 1 and Final submissions (PPT, GitHub, Demo links).
 */

// @desc    Submit Round 1 Submission (PPT link)
// @route   POST /api/hackathons/:id/submissions/round1
// @access  Private (Student)
exports.submitRound1 = async (req, res) => {
    try {
        const hackathonId = req.params.id;
        const { teamId, pptUrl } = req.body;

        const hackathon = await Hackathon.findById(hackathonId);
        if (!hackathon)
            return res.status(404).json({ message: "Hackathon not found" });
        if (hackathon.round1Locked) {
            return res
                .status(400)
                .json({ message: "Submissions for Round 1 are locked" });
        }

        const team = await Team.findById(teamId);
        if (!team) return res.status(404).json({ message: "Team not found" });
        if (!team.members.map((m) => m.toString()).includes(req.user.id)) {
            return res.status(403).json({ message: "Only team members can submit" });
        }

        let submission = await Submission.findOne({
            team: teamId,
            hackathon: hackathonId,
            round: "round1",
        });

        if (submission) {
            submission.pptUrl = pptUrl;
            submission.submittedAt = Date.now();
            await submission.save();
        } else {
            submission = await Submission.create({
                team: teamId,
                hackathon: hackathonId,
                round: "round1",
                pptUrl,
            });
        }

        res.status(200).json(submission);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Submit Final Round (PPT + GitHub + Demo)
// @route   POST /api/hackathons/:hackathonId/submissions/final
// @access  Private (Student Team Leader)
exports.submitFinalRound = async (req, res) => {
    try {
        const { teamId, pptUrl, githubLink, demoLink } = req.body;
        const hackathonId = req.params.hackathonId || req.params.id;

        if (!mongoose.Types.ObjectId.isValid(teamId)) {
            return res
                .status(400)
                .json({ success: false, message: "Invalid Team ID format" });
        }
        if (!mongoose.Types.ObjectId.isValid(hackathonId)) {
            return res
                .status(400)
                .json({ success: false, message: "Invalid Hackathon ID format" });
        }

        // Verify team existence and authorization
        const team = await Team.findById(teamId);
        if (!team)
            return res
                .status(404)
                .json({ success: false, message: "Team not found" });

        if (!team.members.map((m) => m.toString()).includes(req.user.id)) {
            return res
                .status(403)
                .json({ success: false, message: "Only team members can submit" });
        }

        if (team.hackathon.toString() !== hackathonId) {
            return res.status(400).json({
                success: false,
                message: "Team does not belong to this hackathon",
            });
        }

        // Check for existing submissions and locks
        let submission = await Submission.findOne({
            team: teamId,
            hackathon: hackathonId,
            round: "final",
        });

        if (submission && submission.isLocked) {
            return res.status(403).json({
                success: false,
                message: "Submissions are locked for the final round",
            });
        }

        if (submission) {
            // Update existing submission
            submission.pptUrl = pptUrl || submission.pptUrl;
            submission.githubLink = githubLink || submission.githubLink;
            submission.demoLink = demoLink || submission.demoLink;
            submission.submittedAt = Date.now();
            await submission.save();
        } else {
            // Create new submission
            submission = await Submission.create({
                team: teamId,
                hackathon: hackathonId,
                round: "final",
                pptUrl,
                githubLink,
                demoLink,
            });
        }

        res
            .status(200)
            .json({ success: true, message: "Final submission saved", submission });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Get submission by team and round
// @route   GET /api/hackathons/:id/submissions/round1/:teamId
// @access  Private
exports.getSubmissionByTeam = async (req, res) => {
    try {
        const submission = await Submission.findOne({
            team: req.params.teamId,
            hackathon: req.params.id,
            round: "round1",
        });
        if (!submission)
            return res.status(404).json({ message: "Submission not found" });
        res.json(submission);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get Final Submission for a team
// @route   GET /api/hackathons/:hackathonId/submissions/final/:teamId
// @access  Private
exports.getFinalSubmission = async (req, res) => {
    try {
        const { hackathonId, teamId } = req.params;

        if (
            !mongoose.Types.ObjectId.isValid(teamId) ||
            !mongoose.Types.ObjectId.isValid(hackathonId)
        ) {
            return res
                .status(400)
                .json({ success: false, message: "Invalid ID format" });
        }

        const submission = await Submission.findOne({
            team: teamId,
            hackathon: hackathonId,
            round: "final",
        });

        if (!submission) {
            return res.status(404).json({
                success: false,
                message: "No final submission found for this team",
            });
        }

        res.status(200).json({ success: true, submission });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Get all Round 1 submissions for a hackathon
// @route   GET /api/hackathons/:id/submissions/round1
// @access  Private (Admin/Judge)
exports.getRound1SubmissionsByHackathon = async (req, res) => {
    try {
        const submissions = await Submission.find({
            hackathon: req.params.id,
            round: "round1",
        })
            .populate("team", "name status members problemStatement")
            .sort({ submittedAt: -1 });

        res.status(200).json({ success: true, count: submissions.length, submissions });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Get all Final submissions for a hackathon
// @route   GET /api/hackathons/:hackathonId/submissions/final
// @access  Private (Admin/Judge)
exports.getFinalSubmissionsByHackathon = async (req, res) => {
    try {
        const { hackathonId } = req.params;
        const submissions = await Submission.find({
            hackathon: hackathonId,
            round: "final",
        })
            .populate("team", "name status members")
            .sort({ submittedAt: -1 });

        res.status(200).json({ success: true, count: submissions.length, submissions });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Update a submission
// @route   PUT /api/submissions/:id
// @access  Private (Student)
exports.updateSubmission = async (req, res) => {
    try {
        const submission = await Submission.findById(req.params.id);
        if (!submission)
            return res.status(404).json({ message: "Submission not found" });

        const hackathon = await Hackathon.findById(submission.hackathon);
        if (submission.round === "round1" && hackathon.round1Locked) {
            return res
                .status(400)
                .json({ message: "Submissions for Round 1 are locked" });
        }
        if (submission.round === "final" && submission.isLocked) {
            return res
                .status(400)
                .json({ message: "Submissions for Final Round are locked" });
        }

        const team = await Team.findById(submission.team);
        if (!team.members.map((m) => m.toString()).includes(req.user.id)) {
            return res
                .status(403)
                .json({ message: "Only team members can update submission" });
        }

        Object.assign(submission, req.body);
        submission.submittedAt = Date.now();
        await submission.save();
        res.json(submission);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Lock Round 1 submissions for a hackathon
// @route   POST /api/hackathons/:id/lock/round1
// @access  Private (Admin)
exports.lockRound1 = async (req, res) => {
    try {
        const hackathon = await Hackathon.findByIdAndUpdate(
            req.params.id,
            { round1Locked: true },
            { new: true },
        );
        if (!hackathon)
            return res.status(404).json({ message: "Hackathon not found" });
        res.json({ message: "Round 1 locked successfully", hackathon });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Lock Final Submissions
// @route   POST /api/hackathons/:hackathonId/lock/final
// @access  Private (Admin)
exports.lockFinalSubmissions = async (req, res) => {
    try {
        const { hackathonId } = req.params;

        const result = await Submission.updateMany(
            { hackathon: hackathonId, round: "final" },
            { $set: { isLocked: true } },
        );

        res.status(200).json({
            success: true,
            message: "Final submissions locked",
            updatedCount: result.modifiedCount,
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Legacy stubs and alignment with skeleton
exports.submitFinal = exports.submitFinalRound;
exports.submitRound1_legacy = exports.submitRound1;
exports.getSubmission = async (req, res) => {
    res.status(501).json({ message: "Generic getSubmission not implemented" });
};
exports.getSubmissionsByRound = async (req, res) => {
    res.status(501).json({ message: "getSubmissionsByRound not implemented" });
};
exports.lockSubmission = exports.lockFinalSubmissions;
exports.cancelSubmission = async (req, res) => {
    res.status(501).json({ message: "cancelSubmission not implemented" });
};
