const Hackathon = require('../models/Hackathon');
const Team = require('../models/Team');
const Submission = require('../models/Submission');
const Evaluation = require('../models/Evaluation');
const AIFeedback = require('../models/AIFeedback');
const aiService = require('../services/aiService');
const axios = require('axios');

const normalizeTeamData = (hackathon, team, evaluation) => {
    const criteria = (hackathon.evaluationMatrix?.round1 || []).map((c) => ({
        name: c?.name || 'Criterion',
        maxScore: Number(c?.maxScore || 10),
    }));
    const fallbackScores = criteria.map((c) => ({ name: c.name, score: 0 }));
    const scores = evaluation?.criteria?.length ? evaluation.criteria : fallbackScores;
    const totalScore = evaluation?.totalScore ?? 0;

    return {
        teamName: team.name,
        scores,
        totalScore,
        cutoffScore: hackathon.evaluationMatrix?.cutoffScore || 25,
        criteria
    };
};

const buildFeedbackPayload = (feedbackData) => ({
    summary: feedbackData.summary || feedbackData.final_summary || '',
    strengths: feedbackData.strengths || [],
    weaknesses: feedbackData.weaknesses || [],
    slideLevelFeedback: (feedbackData.slide_level_feedback || []).map((f) => ({
        slideNumber: Number(f.slide_number || f.slideNumber || 0),
        issues: f.issues || [],
        suggestions: f.suggestions || []
    })),
    criterionImprovement: feedbackData.criterion_improvement || {
        Content: feedbackData?.scores?.Content?.justification || '',
        Design: feedbackData?.scores?.Design?.justification || '',
        Innovation: feedbackData?.scores?.Innovation?.justification || '',
        Feasibility: feedbackData?.scores?.Feasibility?.justification || ''
    },
    finalAdvice: feedbackData.final_advice || feedbackData.recommendation || ''
});

const generateFeedbackForTeam = async ({ team, hackathonId, hackathon }) => {
    const submission = await Submission.findOne({ team: team._id, round: 'round1' });
    if (!submission || !submission.pptUrl) {
        throw new Error('No PPT submission found');
    }

    const evaluation = await Evaluation.findOne({ team: team._id, round: 'round1' });
    const teamData = normalizeTeamData(hackathon, team, evaluation);

    let feedbackData;
    try {
        feedbackData = await aiService.generatePPTReview(submission.pptUrl, teamData);
    } catch (geminiError) {
        const { extractTextFromFile } = require('../services/pptExtractorService');
        const { evaluatePPT } = require('../services/aiEvaluationService');

        const response = await axios.get(submission.pptUrl, { responseType: 'arraybuffer' });
        const fileBuffer = Buffer.from(response.data);
        const fileName = submission.pptUrl.split('/').pop()?.split('?')[0] || 'submission.pptx';
        const extractedText = await extractTextFromFile(fileBuffer, fileName);
        feedbackData = await evaluatePPT(extractedText);
    }

    const payload = buildFeedbackPayload(feedbackData);
    const feedback = await AIFeedback.findOneAndUpdate(
        { team: team._id, hackathon: hackathonId, round: 'round1' },
        {
            team: team._id,
            hackathon: hackathonId,
            submission: submission._id,
            round: 'round1',
            ...payload,
            generatedAt: new Date(),
        },
        { upsert: true, new: true }
    );

    return { feedback, usedFallbackScores: !evaluation };
};

/**
 * AI Feedback Controller
 */

// @desc    Generate AI Feedback for all teams in a hackathon (Round 1)
// @route   POST /api/ai/hackathons/:hackathonId/round1/generate-feedback
// @access  Private (Admin)
exports.generateBulkFeedbackRound1 = async (req, res) => {
    try {
        const { hackathonId } = req.params;
        const hackathon = await Hackathon.findById(hackathonId);
        if (!hackathon) return res.status(404).json({ success: false, message: 'Hackathon not found' });

        // Get all teams in this hackathon
        const teams = await Team.find({ hackathon: hackathonId });
        if (teams.length === 0) return res.status(404).json({ success: false, message: 'No teams found' });

        const results = {
            total: teams.length,
            generated: 0,
            failed: 0,
            alreadyExists: 0,
            details: []
        };

        for (const team of teams) {
            try {
                // 1. Check if feedback already exists
                const existingFeedback = await AIFeedback.findOne({ team: team._id, round: 'round1' });
                if (existingFeedback) {
                    results.alreadyExists++;
                    continue;
                }

                const { usedFallbackScores } = await generateFeedbackForTeam({ team, hackathonId, hackathon });
                results.generated++;
                if (usedFallbackScores) {
                    results.details.push({
                        team: team.name,
                        note: 'Feedback generated without manual round1 evaluation (fallback scores used)',
                    });
                }

            } catch (err) {
                console.error(`AI Feedback failed for team ${team.name}:`, err.message);
                results.failed++;
                results.details.push({ team: team.name, error: err.message });
            }
        }

        res.status(200).json({
            success: true,
            message: `AI feedback generation complete. Generated: ${results.generated}, Already exist: ${results.alreadyExists}, Failed: ${results.failed}`,
            results
        });

    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Generate AI feedback for a specific team in round1
// @route   POST /api/ai/teams/:teamId/feedback/round1/generate
// @access  Private (Admin)
exports.generateTeamFeedbackRound1 = async (req, res) => {
    try {
        const { teamId } = req.params;
        const team = await Team.findById(teamId);
        if (!team) {
            return res.status(404).json({ success: false, message: 'Team not found' });
        }

        const hackathon = await Hackathon.findById(team.hackathon);
        if (!hackathon) {
            return res.status(404).json({ success: false, message: 'Hackathon not found' });
        }

        const { feedback, usedFallbackScores } = await generateFeedbackForTeam({
            team,
            hackathonId: String(team.hackathon),
            hackathon,
        });

        res.status(200).json({
            success: true,
            message: usedFallbackScores
                ? 'AI feedback generated (fallback scores used)'
                : 'AI feedback generated',
            feedback,
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Get AI feedback for a team
// @route   GET /api/ai/teams/:teamId/feedback/:round
// @access  Private
exports.getTeamFeedback = async (req, res) => {
    try {
        const { teamId, round } = req.params;
        const feedback = await AIFeedback.findOne({ team: teamId, round })
            .populate('team', 'name')
            .populate('hackathon', 'name');

        if (!feedback) {
            return res.status(404).json({ success: false, message: 'AI feedback not found for this team/round' });
        }

        res.status(200).json({ success: true, feedback });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
