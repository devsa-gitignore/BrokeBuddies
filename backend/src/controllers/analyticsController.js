const mongoose = require('mongoose');
const Hackathon = require('../models/Hackathon');
const Team = require('../models/Team');
const User = require('../models/User');
const Attendance = require('../models/Attendance');
const FoodLog = require('../models/FoodLog');
const Evaluation = require('../models/Evaluation');
const Submission = require('../models/Submission');
const Certificate = require('../models/Certificate');
const HelpRequest = require('../models/HelpRequest');

/**
 * Helper: validate hackathonId and return early if invalid.
 */
const validateId = (id, res) => {
    if (!mongoose.Types.ObjectId.isValid(id)) {
        res.status(400).json({ success: false, message: 'Invalid Hackathon ID' });
        return false;
    }
    return true;
};

// @desc    Full analytics overview
// @route   GET /api/hackathons/:hackathonId/admin/analytics/overview
// @access  Private (Admin)
exports.getOverview = async (req, res) => {
    try {
        const { hackathonId } = req.params;
        if (!validateId(hackathonId, res)) return;

        const hid = new mongoose.Types.ObjectId(hackathonId);

        const [
            hackathon,
            totalTeams,
            shortlistedTeams,
            totalAttendees,
            round1Submissions,
            finalSubmissions,
            evaluatedRound1,
            evaluatedFinal,
            certificatesIssued,
            openHelpRequests
        ] = await Promise.all([
            Hackathon.findById(hid).select('name hostedBy status dates round1Locked'),
            Team.countDocuments({ hackathon: hid }),
            Team.countDocuments({ hackathon: hid, status: 'shortlisted' }),
            Attendance.countDocuments({ hackathonId: hid }),
            Submission.countDocuments({ hackathon: hid, round: 'round1' }),
            Submission.countDocuments({ hackathon: hid, round: 'final' }),
            Evaluation.countDocuments({ hackathon: hid, round: 'round1' }),
            Evaluation.countDocuments({ hackathon: hid, round: 'final' }),
            Certificate.countDocuments({ hackathon: hid }),
            HelpRequest.countDocuments({ hackathon: hid, status: 'open' })
        ]);

        if (!hackathon) return res.status(404).json({ success: false, message: 'Hackathon not found' });

        res.json({
            success: true,
            hackathon: {
                name: hackathon.name,
                hostedBy: hackathon.hostedBy,
                status: hackathon.status,
                round1Locked: hackathon.round1Locked,
                dates: hackathon.dates
            },
            teams: {
                total: totalTeams,
                shortlisted: shortlistedTeams,
                inRegistration: totalTeams - shortlistedTeams
            },
            attendance: {
                checkedIn: totalAttendees
            },
            submissions: {
                round1: round1Submissions,
                final: finalSubmissions
            },
            evaluations: {
                round1Evaluated: evaluatedRound1,
                finalEvaluated: evaluatedFinal,
                pendingRound1: round1Submissions - evaluatedRound1,
                pendingFinal: finalSubmissions - evaluatedFinal
            },
            certificates: {
                issued: certificatesIssued
            },
            helpRequests: {
                open: openHelpRequests
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Registration analytics (teams, members, team sizes)
// @route   GET /api/hackathons/:hackathonId/admin/analytics/registrations
// @access  Private (Admin)
exports.getRegistrationAnalytics = async (req, res) => {
    try {
        const { hackathonId } = req.params;
        if (!validateId(hackathonId, res)) return;

        const hid = new mongoose.Types.ObjectId(hackathonId);

        const teams = await Team.find({ hackathon: hid })
            .populate('members', 'name email')
            .populate('leader', 'name email')
            .populate('problemStatement', 'title')
            .select('name status members leader problemStatement createdAt');

        const totalTeams = teams.length;
        const totalParticipants = teams.reduce((sum, t) => sum + t.members.length, 0);

        // Team size distribution
        const sizeDist = teams.reduce((acc, t) => {
            const size = t.members.length;
            acc[size] = (acc[size] || 0) + 1;
            return acc;
        }, {});

        // Status breakdown
        const statusBreakdown = teams.reduce((acc, t) => {
            acc[t.status] = (acc[t.status] || 0) + 1;
            return acc;
        }, {});

        // Problem statement selection rate
        const teamsWithProblem = teams.filter(t => t.problemStatement).length;

        // Registration over time (by day)
        const byDay = teams.reduce((acc, t) => {
            const day = t.createdAt.toISOString().split('T')[0];
            acc[day] = (acc[day] || 0) + 1;
            return acc;
        }, {});

        res.json({
            success: true,
            summary: {
                totalTeams,
                totalParticipants,
                avgTeamSize: totalTeams > 0 ? (totalParticipants / totalTeams).toFixed(2) : 0,
                teamsWithProblemSelected: teamsWithProblem,
                teamsWithoutProblem: totalTeams - teamsWithProblem
            },
            statusBreakdown,
            teamSizeDistribution: sizeDist,
            registrationsByDay: byDay,
            teams
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Attendance analytics
// @route   GET /api/hackathons/:hackathonId/admin/analytics/attendance
// @access  Private (Admin)
exports.getAttendanceAnalytics = async (req, res) => {
    try {
        const { hackathonId } = req.params;
        if (!validateId(hackathonId, res)) return;

        const hid = new mongoose.Types.ObjectId(hackathonId);

        const [totalTeams, totalParticipants, attended, notAttended] = await Promise.all([
            Team.countDocuments({ hackathon: hid }),
            Team.find({ hackathon: hid }).distinct('members'),
            Attendance.find({ hackathonId: hid }).populate('userId', 'name email'),
            // We calculate not-attended after
            Promise.resolve(null)
        ]);

        const totalRegistered = totalParticipants.length;
        const checkedIn = attended.length;
        const absentCount = totalRegistered - checkedIn;

        // Check-in over time
        const byHour = attended.reduce((acc, a) => {
            // Group by hour
            const hour = new Date(a.timestamp).toISOString().substring(0, 13) + ':00';
            acc[hour] = (acc[hour] || 0) + 1;
            return acc;
        }, {});

        res.json({
            success: true,
            summary: {
                totalRegistered,
                checkedIn,
                absent: absentCount,
                attendanceRate: totalRegistered > 0 ? ((checkedIn / totalRegistered) * 100).toFixed(1) + '%' : '0%'
            },
            checkInsByHour: byHour,
            attendees: attended.map(a => ({
                user: a.userId,
                checkedInAt: a.timestamp
            }))
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Food distribution analytics
// @route   GET /api/hackathons/:hackathonId/admin/analytics/food
// @access  Private (Admin)
exports.getFoodAnalytics = async (req, res) => {
    try {
        const { hackathonId } = req.params;
        if (!validateId(hackathonId, res)) return;

        const hid = new mongoose.Types.ObjectId(hackathonId);

        const logs = await FoodLog.find({ hackathon: hid });

        // Breakdown by meal type
        const byMeal = logs.reduce((acc, log) => {
            acc[log.mealType] = (acc[log.mealType] || 0) + 1;
            return acc;
        }, { breakfast: 0, lunch: 0, dinner: 0 });

        // Total unique users who claimed any meal
        const uniqueUsers = new Set(logs.map(l => l.user.toString())).size;

        // Claim rate per meal over time (by hour buckets)
        const claimsByHour = logs.reduce((acc, log) => {
            const hour = new Date(log.claimedAt).toISOString().substring(0, 13) + ':00';
            acc[hour] = (acc[hour] || 0) + 1;
            return acc;
        }, {});

        const totalAttendees = await Attendance.countDocuments({ hackathonId: hid });

        res.json({
            success: true,
            summary: {
                totalClaims: logs.length,
                uniqueClaimants: uniqueUsers,
                totalAttendees
            },
            byMealType: byMeal,
            claimRates: {
                breakfast: totalAttendees > 0 ? ((byMeal.breakfast / totalAttendees) * 100).toFixed(1) + '%' : '0%',
                lunch: totalAttendees > 0 ? ((byMeal.lunch / totalAttendees) * 100).toFixed(1) + '%' : '0%',
                dinner: totalAttendees > 0 ? ((byMeal.dinner / totalAttendees) * 100).toFixed(1) + '%' : '0%'
            },
            claimsByHour
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Evaluation analytics (scores, coverage, top teams)
// @route   GET /api/hackathons/:hackathonId/admin/analytics/evaluations
// @access  Private (Admin)
exports.getEvaluationAnalytics = async (req, res) => {
    try {
        const { hackathonId } = req.params;
        if (!validateId(hackathonId, res)) return;

        const hid = new mongoose.Types.ObjectId(hackathonId);

        const [
            round1Submissions,
            finalSubmissions,
            round1Evaluations,
            finalEvaluations,
            shortlistedTeams
        ] = await Promise.all([
            Submission.countDocuments({ hackathon: hid, round: 'round1' }),
            Submission.countDocuments({ hackathon: hid, round: 'final' }),
            Evaluation.find({ hackathon: hid, round: 'round1' })
                .populate('team', 'name status')
                .sort({ totalScore: -1 }),
            Evaluation.find({ hackathon: hid, round: 'final' })
                .populate('team', 'name status')
                .sort({ totalScore: -1 }),
            Team.countDocuments({ hackathon: hid, status: 'shortlisted' })
        ]);

        // Score stats
        const scoreStats = (evaluations) => {
            if (!evaluations.length) return { avg: 0, min: 0, max: 0 };
            const scores = evaluations.map(e => e.totalScore);
            return {
                avg: (scores.reduce((a, b) => a + b, 0) / scores.length).toFixed(2),
                min: Math.min(...scores),
                max: Math.max(...scores)
            };
        };

        res.json({
            success: true,
            round1: {
                totalSubmissions: round1Submissions,
                evaluated: round1Evaluations.length,
                pending: round1Submissions - round1Evaluations.length,
                coverageRate: round1Submissions > 0 ? ((round1Evaluations.length / round1Submissions) * 100).toFixed(1) + '%' : '0%',
                scoreStats: scoreStats(round1Evaluations),
                shortlisted: shortlistedTeams,
                leaderboard: round1Evaluations.slice(0, 10).map((e, i) => ({
                    rank: i + 1,
                    team: e.team?.name,
                    score: e.totalScore
                }))
            },
            final: {
                totalSubmissions: finalSubmissions,
                evaluated: finalEvaluations.length,
                pending: finalSubmissions - finalEvaluations.length,
                coverageRate: finalSubmissions > 0 ? ((finalEvaluations.length / finalSubmissions) * 100).toFixed(1) + '%' : '0%',
                scoreStats: scoreStats(finalEvaluations),
                leaderboard: finalEvaluations.slice(0, 10).map((e, i) => ({
                    rank: i + 1,
                    team: e.team?.name,
                    score: e.totalScore
                }))
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
