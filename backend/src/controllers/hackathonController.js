const Hackathon = require("../models/Hackathon");
const Problem = require("../models/Problem");
const Sponsor = require("../models/Sponsor");
const User = require("../models/User");
const Mentor = require("../models/Mentor");
const { uploadFile } = require("../config/cloud");

// @desc    Create a new hackathon
// @route   POST /api/hackathons
// @access  Private (Admin)
exports.createHackathon = async (req, res) => {
  try {
    const committeeUser = await User.findById(req.user.id).select("name");
    if (!committeeUser) {
      return res.status(404).json({ message: "Committee user not found" });
    }

    const normalizedRules = Array.isArray(req.body?.rules)
      ? req.body.rules.filter(Boolean).map(String).join("\n")
      : (req.body?.rules || "");

    const hackathon = await Hackathon.create({
      ...req.body,
      rules: normalizedRules,
      hostedBy: committeeUser.name,
      createdBy: req.user.id,
    });
    res.status(201).json(hackathon);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all hackathons (with filters: active, upcoming, past)
// @route   GET /api/hackathons
// @access  Public
exports.getAllHackathons = async (req, res) => {
  try {
    const { status } = req.query;
    const query = status ? { status } : {};
    const hackathons = await Hackathon.find(query).sort({ createdAt: -1 });
    res.json(hackathons);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get a single hackathon by ID
// @route   GET /api/hackathons/:id
// @access  Public
exports.getHackathonById = async (req, res) => {
  try {
    const hackathon = await Hackathon.findById(req.params.id)
      .populate("problems")
      .populate("sponsors");

    if (!hackathon) {
      return res.status(404).json({ message: "Hackathon not found" });
    }
    res.json(hackathon);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update a hackathon
// @route   PUT /api/hackathons/:id
// @access  Private (Admin)
exports.updateHackathon = async (req, res) => {
  try {
    const normalizedBody = {
      ...req.body,
      ...(req.body?.rules !== undefined
        ? {
            rules: Array.isArray(req.body.rules)
              ? req.body.rules.filter(Boolean).map(String).join("\n")
              : String(req.body.rules || ""),
          }
        : {}),
    };

    const hackathon = await Hackathon.findByIdAndUpdate(
      req.params.id,
      normalizedBody,
      { new: true, runValidators: true },
    );

    if (!hackathon) {
      return res.status(404).json({ message: "Hackathon not found" });
    }
    res.json(hackathon);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete a hackathon
// @route   DELETE /api/hackathons/:id
// @access  Private (Admin)
exports.deleteHackathon = async (req, res) => {
  try {
    const hackathon = await Hackathon.findById(req.params.id);

    if (!hackathon) {
      return res.status(404).json({ message: "Hackathon not found" });
    }

    await hackathon.deleteOne();
    res.json({ message: "Hackathon removed" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Register a team for a hackathon
// @route   POST /api/hackathons/:id/register
// @access  Private (Student)
exports.registerForHackathon = async (req, res) => {
  try {
    const hackathonId = req.params.id;
    const userId = req.user.id;

    const hackathon = await Hackathon.findById(hackathonId);
    if (!hackathon) return res.status(404).json({ success: false, message: 'Hackathon not found' });

    // 1. Check if registration is open
    if (!hackathon.isRegistrationOpen) {
      return res.status(403).json({ success: false, message: 'Registrations are currently locked' });
    }

    // 2. Check deadline
    if (hackathon.dates && hackathon.dates.registrationDeadline && new Date() > new Date(hackathon.dates.registrationDeadline)) {
      return res.status(403).json({ success: false, message: 'Registration deadline has passed' });
    }

    // 3. Find the team the user belongs to for this hackathon
    const Team = require('../models/Team');
    const team = await Team.findOne({
      hackathon: hackathonId,
      members: userId
    });

    if (!team) {
      return res.status(400).json({
        success: false,
        message: 'You must create or join a team before you can register for the hackathon.'
      });
    }

    // 4. Update team status to 'registered' (it might be 'pending' if we change the flow later)
    // For now, it's already 'registered' by default, but we can add a flag or just confirm it.
    if (team.status === 'registered') {
      return res.status(200).json({ success: true, message: 'Team is already registered', team });
    }

    team.status = 'registered';
    await team.save();

    res.status(200).json({ success: true, message: 'Team successfully registered for hackathon', team });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Add sponsors to a hackathon
// @route   POST /api/hackathons/:id/sponsors
// @access  Private (Admin)
exports.addSponsor = async (req, res) => {
  // TODO: implement sponsor logic
  res.status(200).json({ message: "Sponsor logic pending" });
};

// @desc    Assign scanner to a hackathon
// @route   POST /api/hackathons/:hackathonId/scanners
// @access  Private (Admin)
exports.assignScanner = async (req, res) => {
  try {
    const { userId, permissions } = req.body;
    const { hackathonId } = req.params;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, error: "User not found" });
    }

    const existingRole = user.hackathonRoles.find(
      (role) =>
        role.hackathonId.toString() === hackathonId && role.role === "scanner",
    );

    if (existingRole) {
      return res.status(400).json({
        success: false,
        error: "User is already a scanner for this hackathon",
      });
    }

    user.hackathonRoles.push({
      hackathonId,
      role: "scanner",
      permissions,
    });

    await user.save();

    res.status(200).json({
      success: true,
      message: "Scanner assigned successfully",
    });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, error: error.message || "Server Error" });
  }
};

// @desc    Add a judge to the hackathon
// @route   POST /api/hackathons/:id/judges
// @access  Private (Admin)
exports.addJudge = async (req, res) => {
  try {
    const { userId } = req.body;
    const hackathon = await Hackathon.findById(req.params.id);
    if (!hackathon)
      return res.status(404).json({ message: "Hackathon not found" });

    if (!hackathon.judges.includes(userId)) {
      hackathon.judges.push(userId);
      await hackathon.save();

      // Update user role
      await User.findByIdAndUpdate(userId, { role: "judge" });
    }

    res
      .status(200)
      .json({ message: "Judge added successfully", judges: hackathon.judges });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Add a mentor to the hackathon
// @route   POST /api/hackathons/:id/mentors
// @access  Private (Admin)
exports.addMentor = async (req, res) => {
  try {
    const { name, linkedinUrl, profilePhotoUrl, domain, capacity } = req.body;
    const hackathon = await Hackathon.findById(req.params.id);
    if (!hackathon)
      return res.status(404).json({ message: "Hackathon not found" });

    if (!domain) {
      return res.status(400).json({ message: "Mentor domain/tech-stack expertise is required" });
    }

    // Create the mentor in the dedicated Mentor collection
    const newMentor = await Mentor.create({
      name,
      linkedinUrl,
      profilePhotoUrl,
      domain,
      capacity: capacity || 5,
      hackathon: hackathon._id,
    });

    hackathon.mentors.push(newMentor._id);
    await hackathon.save();

    res.status(201).json({
      message: "Mentor created and assigned successfully",
      mentor: newMentor,
      mentors: hackathon.mentors,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all mentors for a hackathon
// @route   GET /api/hackathons/:id/mentors
// @access  Private (Admin / Student)
exports.getHackathonMentors = async (req, res) => {
  try {
    const hackathon = await Hackathon.findById(req.params.id).populate(
      "mentors",
      "name linkedinUrl profilePhotoUrl _id",
    );

    if (!hackathon)
      return res.status(404).json({ message: "Hackathon not found" });

    res.status(200).json({ success: true, mentors: hackathon.mentors });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all roles for a hackathon
// @route   GET /api/hackathons/:id/roles
// @access  Private
exports.getHackathonRoles = async (req, res) => {
  try {
    const hackathon = await Hackathon.findById(req.params.id)
      .populate("judges", "name email role")
      .populate("mentors", "name linkedinUrl profilePhotoUrl _id");

    if (!hackathon)
      return res.status(404).json({ message: "Hackathon not found" });

    res.json({
      judges: hackathon.judges,
      mentors: hackathon.mentors,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Remove a role (judge/mentor) from a hackathon
// @route   DELETE /api/hackathons/:id/roles/:userId
// @access  Private (Admin)
exports.removeHackathonRole = async (req, res) => {
  try {
    const { userId } = req.params;
    const hackathon = await Hackathon.findById(req.params.id);
    if (!hackathon)
      return res.status(404).json({ message: "Hackathon not found" });

    hackathon.judges = hackathon.judges.filter(
      (id) => id.toString() !== userId,
    );
    hackathon.mentors = hackathon.mentors.filter(
      (id) => id.toString() !== userId,
    );

    await hackathon.save();

    // Reset user role to student (optional - depending on requirements)
    // await User.findByIdAndUpdate(userId, { role: 'student' });

    res.json({ message: "Role removed successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Lock registration for a hackathon
// @route   POST /api/hackathons/:hackathonId/lock/registration
// @access  Private (Admin)
exports.lockRegistration = async (req, res) => {
  try {
    const hackathon = await Hackathon.findById(req.params.hackathonId);
    if (!hackathon) {
      return res
        .status(404)
        .json({ success: false, message: "Hackathon not found" });
    }

    if (hackathon.isRegistrationOpen === false) {
      return res
        .status(200)
        .json({
          success: true,
          message: "Hackathon registrations are already locked",
        });
    }

    hackathon.isRegistrationOpen = false;
    await hackathon.save();

    res.status(200).json({
      success: true,
      message: "Hackathon registrations locked successfully",
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Unlock registration for a hackathon
// @route   POST /api/hackathons/:hackathonId/unlock/registration
// @access  Private (Admin)
exports.unlockRegistration = async (req, res) => {
  try {
    const hackathon = await Hackathon.findById(req.params.hackathonId);
    if (!hackathon) {
      return res
        .status(404)
        .json({ success: false, message: "Hackathon not found" });
    }

    hackathon.isRegistrationOpen = true;
    await hackathon.save();

    res.status(200).json({
      success: true,
      message: "Hackathon registrations unlocked successfully",
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Cancel registration for a hackathon
// @route   POST /api/hackathons/:hackathonId/registration/cancel
// @access  Private (Student)
exports.cancelRegistration = async (req, res) => {
  try {
    const { hackathonId } = req.params;
    const userId = req.user.id;

    // We assume the Team represents a registration for this hackathon
    // Find the team where this user is the leader, OR just the team where the user is a member
    // To be safe, let's find the team in this hackathon that the user belongs to
    const Team = require("../models/Team");
    const Submission = require("../models/Submission");

    const team = await Team.findOne({
      hackathon: hackathonId,
      members: userId,
    });

    if (!team) {
      return res
        .status(404)
        .json({ success: false, message: "Registration not found" });
    }

    // Check if any submission is already locked (e.g. final submissions locked by admin)
    const lockedSubmissionsCount = await Submission.countDocuments({
      team: team._id,
      hackathon: hackathonId,
      isLocked: true,
    });

    if (lockedSubmissionsCount > 0) {
      return res
        .status(403)
        .json({
          success: false,
          message:
            "Cannot cancel registration. Submissions have already been locked by the administration.",
        });
    }

    // Only allow cancellation if user is the team leader (or if the user is the only one)
    if (team.leader.toString() !== userId && team.members.length > 1) {
      // If they are just a member, only they leave the team
      team.members = team.members.filter((m) => m.toString() !== userId);
      await team.save();
      return res.status(200).json({
        success: true,
        message: "Successfully left the team and cancelled registration",
      });
    } else {
      // User is the leader or sole member, destroy the entire team and their submissions
      await Submission.deleteMany({ team: team._id, hackathon: hackathonId });
      await team.deleteOne();
      return res.status(200).json({
        success: true,
        message: "Registration cancelled and team deleted successfully",
      });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Upload hackathon brochure
// @route   POST /api/hackathons/:id/brochure
// @access  Private (Admin)
exports.uploadBrochure = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: "No PDF file uploaded" });
    }

    const hackathon = await Hackathon.findById(req.params.id);
    if (!hackathon) {
      return res.status(404).json({ success: false, message: "Hackathon not found" });
    }

    const { buffer, originalname } = req.file;
    const result = await uploadFile(buffer, originalname, `hackathon_${hackathon._id}/brochure`);

    hackathon.brochureUrl = result.secure_url;
    await hackathon.save();

    res.status(200).json({
      success: true,
      message: "Brochure uploaded successfully",
      brochureUrl: hackathon.brochureUrl,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
