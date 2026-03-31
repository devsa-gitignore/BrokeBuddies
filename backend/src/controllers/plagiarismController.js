const Submission = require('../models/Submission');
const Hackathon = require('../models/Hackathon');
const githubService = require('../services/githubService');

/**
 * Plagiarism Controller
 */

// @desc    Run plagiarism check for all final submissions in a hackathon
// @route   POST /api/plagiarism/hackathons/:hackathonId/run
// @access  Private (Admin)
exports.runBulkPlagiarismCheck = async (req, res) => {
    try {
        const { hackathonId } = req.params;
        const hackathon = await Hackathon.findById(hackathonId);
        if (!hackathon) return res.status(404).json({ success: false, message: 'Hackathon not found' });

        // Get all final submissions
        const submissions = await Submission.find({ hackathon: hackathonId, round: 'final' }).populate('team', 'name');
        if (submissions.length === 0) return res.status(404).json({ success: false, message: 'No final submissions found to check' });

        const results = {
            total: submissions.length,
            checked: 0,
            flagged: 0,
            errors: 0
        };

        const repoMap = new Map(); // For duplicate detection

        for (const sub of submissions) {
            try {
                if (!sub.githubLink) {
                    results.checked++;
                    continue;
                }

                // 1. Duplicate detection (multiple teams submitting same repo)
                const normalizedLink = sub.githubLink.replace(/\.git$/, '').toLowerCase();
                if (repoMap.has(normalizedLink)) {
                    const otherTeam = repoMap.get(normalizedLink);
                    sub.plagiarismReport = {
                        isPlagiarized: true,
                        score: 100,
                        reason: `Duplicate repository! Already submitted by Team: ${otherTeam}`,
                        checkedAt: new Date()
                    };
                    await sub.save();
                    results.flagged++;
                    results.checked++;
                    continue;
                }
                repoMap.set(normalizedLink, sub.team.name);

                // 2. GitHub API Analysis
                const analysis = await githubService.analyzeRepo(sub.githubLink, hackathon.dates.startDate || hackathon.createdAt);

                sub.plagiarismReport = {
                    ...analysis,
                    checkedAt: new Date()
                };

                await sub.save();

                if (analysis.isPlagiarized) results.flagged++;
                results.checked++;

            } catch (err) {
                console.error(`Plagiarism check failed for team ${sub.team?.name}:`, err.message);
                results.errors++;
            }
        }

        res.status(200).json({
            success: true,
            message: 'Bulk plagiarism check complete',
            results
        });

    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Get plagiarism report for a hackathon
// @route   GET /api/plagiarism/hackathons/:hackathonId/report
// @access  Private (Admin)
exports.getPlagiarismReport = async (req, res) => {
    try {
        const { hackathonId } = req.params;
        const flaggedSubmissions = await Submission.find({
            hackathon: hackathonId,
            'plagiarismReport.isPlagiarized': true
        })
            .populate('team', 'name')
            .select('team githubLink plagiarismReport');

        res.status(200).json({
            success: true,
            count: flaggedSubmissions.length,
            flagged: flaggedSubmissions
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
