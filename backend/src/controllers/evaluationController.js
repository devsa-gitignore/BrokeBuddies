const Evaluation = require("../models/Evaluation");
const Team = require("../models/Team");
const Hackathon = require("../models/Hackathon");

// @desc    Set evaluation matrix for a round
// @route   POST /api/hackathons/:hackathonId/evaluation-matrix/round1
// @access  Private (Admin)
exports.setEvaluationMatrix = async (req, res) => {
  try {
    const { criteria } = req.body;
    const hackathon = await Hackathon.findById(req.params.id);
    if (!hackathon)
      return res.status(404).json({ message: "Hackathon not found" });

    hackathon.evaluationMatrix.round1 = criteria;
    await hackathon.save();

    res.json({
      message: "Evaluation matrix updated",
      matrix: hackathon.evaluationMatrix.round1,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get evaluation matrix for a round
// @route   GET /api/hackathons/:hackathonId/evaluation-matrix/round1
// @access  Private
exports.getEvaluationMatrix = async (req, res) => {
  try {
    const hackathon = await Hackathon.findById(req.params.id);
    if (!hackathon)
      return res.status(404).json({ message: "Hackathon not found" });
    res.json(hackathon.evaluationMatrix.round1);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Set final evaluation matrix
// @route   POST /api/hackathons/:hackathonId/evaluation-matrix/final
// @access  Private (Admin)
exports.setEvaluationMatrixFinal = async (req, res) => {
  try {
    const { criteria } = req.body;
    const hackathon = await Hackathon.findById(req.params.hackathonId);
    if (!hackathon)
      return res.status(404).json({ message: "Hackathon not found" });

    hackathon.evaluationMatrix.final = criteria;
    await hackathon.save();

    res.json({
      message: "Final evaluation matrix updated",
      matrix: hackathon.evaluationMatrix.final,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get final evaluation matrix
// @route   GET /api/hackathons/:hackathonId/evaluation-matrix/final
// @access  Private
exports.getEvaluationMatrixFinal = async (req, res) => {
  try {
    const hackathon = await Hackathon.findById(req.params.hackathonId);
    if (!hackathon)
      return res.status(404).json({ message: "Hackathon not found" });
    res.json(hackathon.evaluationMatrix.final);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Submit evaluation for a team in Round 1
// @route   POST /api/evaluations/round1/:teamId
// @access  Private (Judge/Admin)
exports.submitEvaluationRound1 = async (req, res) => {
  try {
    const { criteria, remarks } = req.body;
    const teamId = req.params.teamId;

    const team = await Team.findById(teamId);
    if (!team) return res.status(404).json({ message: "Team not found" });

    const totalScore = criteria.reduce((sum, item) => sum + item.score, 0);

    console.log(
      `Creating evaluation for team ${teamId}, hackathon ${team.hackathon}, round round1`,
    );
    const evaluation = await Evaluation.create({
      team: teamId,
      hackathon: team.hackathon,
      round: "round1",
      evaluator: req.user.id,
      criteria,
      totalScore,
      remarks,
    });
    console.log(`Evaluation created: ${evaluation._id}`);

    // Emit real-time update
    if (req.io) {
      req.io.to(`hackathon_${team.hackathon}`).emit("leaderboard:live-update", {
        round: "round1",
        teamId: team._id,
      });
    }

    res.status(201).json(evaluation);
  } catch (error) {
    console.error("Error creating evaluation:", error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update evaluation for a team in Round 1
// @route   PUT /api/evaluations/round1/:teamId
// @access  Private (Judge/Admin)
exports.updateEvaluationRound1 = async (req, res) => {
  try {
    const { criteria, remarks } = req.body;
    const team = await Team.findById(req.params.teamId);
    if (!team) return res.status(404).json({ message: "Team not found" });

    const totalScore = criteria.reduce((sum, item) => sum + item.score, 0);

    console.log(
      `Updating/Upserting evaluation for team ${req.params.teamId}, hackathon ${team.hackathon}, round round1`,
    );
    const evaluation = await Evaluation.findOneAndUpdate(
      { team: req.params.teamId, round: "round1" },
      {
        criteria,
        totalScore,
        remarks,
        evaluator: req.user.id,
        hackathon: team.hackathon, // Ensure hackathon ID is saved for leaderboard filtering
      },
      { new: true, upsert: true, setDefaultsOnInsert: true },
    );
    console.log(`Evaluation updated: ${evaluation._id}`);

    // Emit real-time update
    if (req.io) {
      req.io.to(`hackathon_${team.hackathon}`).emit("leaderboard:live-update", {
        round: "round1",
        teamId: team._id,
      });
    }

    res.json(evaluation);
  } catch (error) {
    console.error("Error updating evaluation:", error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Submit/Update final evaluation
// @route   POST /api/evaluations/final/:teamId
// @access  Private (Judge/Admin)
exports.submitEvaluationFinal = async (req, res) => {
  try {
    const { criteria, remarks } = req.body;
    const teamId = req.params.teamId;

    const team = await Team.findById(teamId);
    if (!team) return res.status(404).json({ message: "Team not found" });

    const totalScore = criteria.reduce((sum, item) => sum + item.score, 0);

    const evaluation = await Evaluation.findOneAndUpdate(
      { team: teamId, round: "final" },
      {
        team: teamId,
        hackathon: team.hackathon,
        round: "final",
        evaluator: req.user.id,
        criteria,
        totalScore,
        remarks,
      },
      { new: true, upsert: true, setDefaultsOnInsert: true },
    );

    // Emit real-time update
    if (req.io) {
      req.io.to(`hackathon_${team.hackathon}`).emit("leaderboard:live-update", {
        round: "final",
        teamId: team._id,
      });
    }

    res.status(200).json(evaluation);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get final evaluation for a team
// @route   GET /api/evaluations/final/:teamId
// @access  Private
exports.getEvaluationFinal = async (req, res) => {
  try {
    const evaluation = await Evaluation.findOne({
      team: req.params.teamId,
      round: "final",
    }).populate("evaluator", "name");

    if (!evaluation)
      return res.status(404).json({ message: "No final evaluation found" });
    res.json(evaluation);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get Round 1 leaderboard
// @route   GET /api/hackathons/:id/leaderboard/round1
// @access  Private
exports.getLeaderboardRound1 = async (req, res) => {
  try {
    const hackathonId = req.params.id;
    const mongoose = require("mongoose");

    if (!mongoose.Types.ObjectId.isValid(hackathonId)) {
      return res.status(400).json({ message: "Invalid Hackathon ID" });
    }

    // Check publication status — students can only see after admin publishes
    const hackathon = await Hackathon.findById(hackathonId).select('round1Published');
    if (!hackathon) return res.status(404).json({ message: "Hackathon not found" });

    const isAdmin = req.user && (req.user.role === 'admin' || req.user.role === 'judge');
    if (!hackathon.round1Published && !isAdmin) {
      return res.status(403).json({ message: "Round 1 scores have not been published yet" });
    }

    const evaluations = await Evaluation.find({
      hackathon: new mongoose.Types.ObjectId(hackathonId),
      round: "round1",
    })
      .populate("team", "name status members")
      .sort({ totalScore: -1 });

    res.json(evaluations);
  } catch (error) {
    console.error("Leaderboard Error:", error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get Final leaderboard
// @route   GET /api/hackathons/:hackathonId/leaderboard/final
// @access  Private
exports.getLeaderboardFinal = async (req, res) => {
  try {
    const { hackathonId } = req.params;
    const mongoose = require("mongoose");

    if (!mongoose.Types.ObjectId.isValid(hackathonId)) {
      return res.status(400).json({ message: "Invalid Hackathon ID" });
    }

    // Check publication status
    const hackathon = await Hackathon.findById(hackathonId).select('finalPublished');
    if (!hackathon) return res.status(404).json({ message: "Hackathon not found" });

    const isAdmin = req.user && (req.user.role === 'admin' || req.user.role === 'judge');
    if (!hackathon.finalPublished && !isAdmin) {
      return res.status(403).json({ message: "Final scores have not been published yet" });
    }

    const evaluations = await Evaluation.find({
      hackathon: new mongoose.Types.ObjectId(hackathonId),
      round: "final",
    })
      .populate("team", "name status members problemStatement")
      .sort({ totalScore: -1 });

    res.json(evaluations);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Shortlist a team for the next round
// @route   POST /api/hackathons/:id/shortlist/:teamId
// @access  Private (Admin)
exports.shortlistTeam = async (req, res) => {
  try {
    const team = await Team.findByIdAndUpdate(
      req.params.teamId,
      { status: "shortlisted" },
      { new: true },
    ).populate('members', 'name phoneNumber email');
    if (!team) return res.status(404).json({ message: "Team not found" });

    // Send SMS notification to shortlisted team members
    try {
      const { sendBulkSMS } = require('../services/smsService');
      const phoneNumbers = team.members
        .filter((m) => m.phoneNumber)
        .map((m) => m.phoneNumber);

      if (phoneNumbers.length > 0) {
        await sendBulkSMS(
          phoneNumbers,
          `Congratulations! Your team "${team.name}" has been shortlisted. You now have access to Mentor Selection and your Entry QR will be unlocked.`
        );
      }
    } catch (smsError) {
      console.error('SMS notification failed for shortlist:', smsError.message);
      // Don't fail the request if SMS fails
    }

    // Emit real-time update
    if (req.io) {
      req.io.to(`hackathon_${team.hackathon}`).emit('shortlist:update', {
        teamId: team._id,
        status: 'shortlisted',
        updatedAt: new Date().toISOString()
      });
    }

    res.json({ message: "Team shortlisted", team });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get shortlisted teams
// @route   GET /api/hackathons/:id/shortlist
// @access  Private
exports.getShortlistedTeams = async (req, res) => {
  try {
    const teams = await Team.find({
      hackathon: req.params.id,
      status: "shortlisted",
    }).populate("members", "name email");
    res.json(teams);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    AI-powered PPT evaluation using Gemini
// @route   POST /api/hackathons/:hackathonId/ai/ppt-evaluation/:teamId
// @access  Private (Admin/Judge)
exports.aiPptEvaluation = async (req, res) => {
  try {
    const { hackathonId, teamId } = req.params;
    const { pptText, slides } = req.body;

    console.log(
      `[AI-EVAL-CTRL] Received evaluation request for team ${teamId} in hackathon ${hackathonId}`,
    );

    // Validate team exists
    const team = await Team.findById(teamId);
    if (!team) {
      return res
        .status(404)
        .json({ success: false, message: "Team not found" });
    }

    if (team.hackathon.toString() !== hackathonId) {
      return res.status(400).json({
        success: false,
        message: "Team does not belong to this hackathon",
      });
    }

    // Accept PPT text either as a single string or slide-by-slide array
    const inputText = slides || pptText;

    if (
      !inputText ||
      (Array.isArray(inputText) && inputText.length === 0) ||
      (typeof inputText === "string" && inputText.trim().length === 0)
    ) {
      return res.status(400).json({
        success: false,
        message:
          'PPT text content is required. Send either "pptText" (string) or "slides" (array of slide texts).',
      });
    }

    console.log(
      `[AI-EVAL-CTRL] PPT text type: ${Array.isArray(inputText) ? "slides array" : "string"}`,
    );
    console.log(`[AI-EVAL-CTRL] Calling Gemini AI service...`);

    const { evaluatePPT } = require("../services/aiEvaluationService");
    const evaluation = await evaluatePPT(inputText);

    console.log(`[AI-EVAL-CTRL] ✅ AI evaluation complete for team ${teamId}`);

    res.status(200).json({
      success: true,
      teamId,
      hackathonId,
      evaluation,
    });
  } catch (error) {
    console.error(`[AI-EVAL-CTRL] ❌ Error:`, error.message);
    res.status(500).json({
      success: false,
      message: error.message || "AI PPT Evaluation failed",
    });
  }
};

// @desc    AI PPT evaluation via file upload (PPTX/PDF)
// @route   POST /api/hackathons/:hackathonId/ai/ppt-evaluation-upload/:teamId
// @access  Private (Admin/Judge)
exports.aiPptEvaluationUpload = async (req, res) => {
  try {
    const { hackathonId, teamId } = req.params;

    console.log(
      `[AI-EVAL-UPLOAD] File upload evaluation for team ${teamId} in hackathon ${hackathonId}`,
    );

    // Validate team
    const team = await Team.findById(teamId);
    if (!team) {
      return res
        .status(404)
        .json({ success: false, message: "Team not found" });
    }
    if (team.hackathon.toString() !== hackathonId) {
      return res.status(400).json({
        success: false,
        message: "Team does not belong to this hackathon",
      });
    }

    // Check file was uploaded
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No file uploaded. Please upload a .pptx or .pdf file.",
      });
    }

    console.log(
      `[AI-EVAL-UPLOAD] File: ${req.file.originalname} (${(req.file.size / 1024).toFixed(1)} KB)`,
    );

    // Extract text from file
    const { extractTextFromFile } = require("../services/pptExtractorService");
    const extractedText = await extractTextFromFile(
      req.file.buffer,
      req.file.originalname,
    );

    console.log(
      `[AI-EVAL-UPLOAD] Extracted ${extractedText.length} characters, sending to AI...`,
    );

    // Run AI evaluation
    const { evaluatePPT } = require("../services/aiEvaluationService");
    const evaluation = await evaluatePPT(extractedText);

    console.log(
      `[AI-EVAL-UPLOAD] ✅ AI evaluation complete for team ${teamId}`,
    );

    res.status(200).json({
      success: true,
      teamId,
      hackathonId,
      fileName: req.file.originalname,
      extractedTextLength: extractedText.length,
      evaluation,
    });
  } catch (error) {
    console.error(`[AI-EVAL-UPLOAD] ❌ Error:`, error.message);
    res.status(500).json({
      success: false,
      message: error.message || "AI PPT Evaluation failed",
    });
  }
};

// @desc    Publish Round 1 scores (make visible to students)
// @route   POST /api/hackathons/:id/publish/round1
// @access  Private (Admin)
exports.publishRound1 = async (req, res) => {
  try {
    const hackathon = await Hackathon.findByIdAndUpdate(
      req.params.id,
      { round1Published: true },
      { new: true },
    );
    if (!hackathon) return res.status(404).json({ message: "Hackathon not found" });

    // Emit real-time so students see instantly
    if (req.io) {
      req.io.to(`hackathon_${hackathon._id}`).emit('leaderboard:live-update', {
        round: 'round1',
        published: true,
      });
    }

    res.json({ success: true, message: "Round 1 scores published", round1Published: true });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Unpublish Round 1 scores
// @route   POST /api/hackathons/:id/unpublish/round1
// @access  Private (Admin)
exports.unpublishRound1 = async (req, res) => {
  try {
    const hackathon = await Hackathon.findByIdAndUpdate(
      req.params.id,
      { round1Published: false },
      { new: true },
    );
    if (!hackathon) return res.status(404).json({ message: "Hackathon not found" });
    res.json({ success: true, message: "Round 1 scores unpublished" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Publish Final scores
// @route   POST /api/hackathons/:id/publish/final
// @access  Private (Admin)
exports.publishFinal = async (req, res) => {
  try {
    const hackathon = await Hackathon.findByIdAndUpdate(
      req.params.id,
      { finalPublished: true },
      { new: true },
    );
    if (!hackathon) return res.status(404).json({ message: "Hackathon not found" });

    // Update hackScores for the global leaderboard
    try {
      const User = require('../models/User');
      const evaluations = await Evaluation.find({
        hackathon: hackathon._id,
        round: 'final',
      }).populate('team', 'members');

      const totalTeams = evaluations.length;
      for (let i = 0; i < evaluations.length; i++) {
        const evaluation = evaluations[i];
        const rank = i + 1; // sorted desc already
        // Weighted score: base participation + performance bonus
        const participationPoints = 10;
        const positionBonus = Math.max(0, Math.round(((totalTeams - rank + 1) / totalTeams) * 50));
        const scoreBonus = Math.round(evaluation.totalScore / 10);
        const hackScoreIncrease = participationPoints + positionBonus + scoreBonus;

        if (evaluation.team && evaluation.team.members) {
          await User.updateMany(
            { _id: { $in: evaluation.team.members } },
            { $inc: { hackScore: hackScoreIncrease } }
          );
        }
      }
    } catch (hackScoreError) {
      console.error('HackScore update failed:', hackScoreError.message);
    }

    // Emit real-time
    if (req.io) {
      req.io.to(`hackathon_${hackathon._id}`).emit('leaderboard:live-update', {
        round: 'final',
        published: true,
      });
    }

    res.json({ success: true, message: "Final scores published and hackScores updated", finalPublished: true });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Unpublish Final scores
// @route   POST /api/hackathons/:id/unpublish/final
// @access  Private (Admin)
exports.unpublishFinal = async (req, res) => {
  try {
    const hackathon = await Hackathon.findByIdAndUpdate(
      req.params.id,
      { finalPublished: false },
      { new: true },
    );
    if (!hackathon) return res.status(404).json({ message: "Hackathon not found" });
    res.json({ success: true, message: "Final scores unpublished" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
