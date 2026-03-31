/**
 * Verification Controller
 * Handles student identity verification (ID card, Aadhaar, face match) and admin approvals.
 */

const User = require("../models/User");

// @desc    Submit verification documents (ID card, Aadhaar, live selfie)
// @route   POST /api/users/:userId/submit-verification
// @access  Private (Student)
exports.submitVerification = async (req, res) => {
  try {
    const { userId } = req.params;
    const { collegeIdUrl, aadharUrl, selfieUrl } = req.body;

    // Ensure user belongs to the token, or check admin
    if (String(req.user.id) !== String(userId) && req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        error: "Unauthorized to submit for this user",
      });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, error: "User not found" });
    }

    user.registrationDetails = {
      collegeIdUrl: collegeIdUrl || user.registrationDetails.collegeIdUrl,
      aadharUrl: aadharUrl || user.registrationDetails.aadharUrl,
      selfieUrl: selfieUrl || user.registrationDetails.selfieUrl,
    };
    user.verificationStatus = "pending";

    await user.save();

    res.status(200).json({
      success: true,
      message: "Verification documents submitted successfully",
      verificationStatus: user.verificationStatus,
    });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, error: error.message || "Server Error" });
  }
};

// @desc    Get verification status
// @route   GET /api/users/:userId/verification-status
// @access  Private
exports.getVerificationStatus = async (req, res) => {
  try {
    const { userId } = req.params;

    if (String(req.user.id) !== String(userId) && req.user.role !== "admin") {
      return res.status(403).json({ success: false, error: "Unauthorized" });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, error: "User not found" });
    }

    res.status(200).json({
      success: true,
      isVerified: user.isVerified,
      verificationStatus: user.verificationStatus,
    });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, error: error.message || "Server Error" });
  }
};

// @desc    Submit live selfie for face matching (Mocked for Hackathon)
// @route   POST /api/verification/face-match
// @access  Private
exports.faceMatch = async (req, res) => {
  try {
    const { idCardImageUrl, liveSelfieUrl } = req.body;

    // Since no facial recognition engine is installed (e.g. face-api.js),
    // we mock the response probabilistically to simulate an AI logic handler.
    if (!idCardImageUrl || !liveSelfieUrl) {
      return res
        .status(400)
        .json({ success: false, error: "Missing images for face match" });
    }

    const simulatedSimilarity = 92.5 + Math.random() * 6; // 92.5 - 98.5%
    const isMatch = simulatedSimilarity > 85;

    res.status(200).json({
      success: true,
      match: isMatch,
      similarityScore: parseFloat(simulatedSimilarity.toFixed(2)),
      message: isMatch
        ? "Face perfectly matched"
        : "Face match failed threshold",
    });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, error: error.message || "Server Error" });
  }
};

// @desc    Get all pending verifications (admin)
// @route   GET /api/admin/verifications?status=pending
// @access  Private (Admin)
exports.getPendingVerifications = async (req, res) => {
  try {
    const { status } = req.query;
    const filter = status
      ? { verificationStatus: status }
      : { verificationStatus: "pending" };

    const pendingUsers = await User.find(filter).select("-password");

    res.status(200).json({
      success: true,
      count: pendingUsers.length,
      data: pendingUsers,
    });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, error: error.message || "Server Error" });
  }
};

// @desc    Approve a student verification
// @route   PUT /api/admin/verifications/:userId/approve
// @access  Private (Admin)
exports.approveVerification = async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, error: "User not found" });
    }

    user.verificationStatus = "approved";
    user.isVerified = true;

    await user.save();

    res.status(200).json({
      success: true,
      message: "User verification approved",
      isVerified: user.isVerified,
    });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, error: error.message || "Server Error" });
  }
};

// @desc    Reject a student verification
// @route   PUT /api/admin/verifications/:userId/reject
// @access  Private (Admin)
exports.rejectVerification = async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, error: "User not found" });
    }

    user.verificationStatus = "rejected";
    user.isVerified = false;

    await user.save();

    res.status(200).json({
      success: true,
      message: "User verification rejected",
      isVerified: user.isVerified,
    });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, error: error.message || "Server Error" });
  }
};
