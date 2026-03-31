const Team = require("../models/Team");
const Hackathon = require("../models/Hackathon");
const User = require("../models/User");
const Invitation = require("../models/Invitation");
const Mentor = require("../models/Mentor");
const emailService = require("../services/emailService");
const crypto = require("crypto");
const { emitToHackathon } = require("../sockets/socketManager");

const generateTeamCode = () => {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
};

const generateUniqueTeamCode = async () => {
  let teamCode;
  let isUnique = false;

  while (!isUnique) {
    teamCode = generateTeamCode();
    const existingCode = await Team.findOne({ teamCode });
    if (!existingCode) isUnique = true;
  }

  return teamCode;
};

// @desc    Create a new team for a hackathon
// @route   POST /api/hackathons/:hackathonId/teams
// @access  Private (Student)
exports.createTeam = async (req, res) => {
  try {
    const { name, foodPreference } = req.body;
    const hackathonId = req.params.id; // From hackathonRoutes :id

    const hackathon = await Hackathon.findById(hackathonId);
    if (!hackathon) {
      return res
        .status(404)
        .json({ success: false, message: "Hackathon not found" });
    }
    if (!hackathon.isRegistrationOpen) {
      return res.status(403).json({
        success: false,
        message: "Registration is currently closed for this hackathon",
      });
    }

    if (
      hackathon.dates &&
      hackathon.dates.registrationDeadline &&
      new Date() > new Date(hackathon.dates.registrationDeadline)
    ) {
      return res.status(403).json({
        success: false,
        message: "Registration deadline has passed for this hackathon",
      });
    }

    // Check if user is already in a team for this hackathon
    const existingTeam = await Team.findOne({
      hackathon: hackathonId,
      members: req.user.id,
    });

    if (existingTeam) {
      return res
        .status(400)
        .json({ message: "You are already in a team for this hackathon" });
    }

    const teamCode = await generateUniqueTeamCode();

    const team = await Team.create({
      name,
      hackathon: hackathonId,
      leader: req.user.id,
      members: [req.user.id],
      teamCode,
      foodPreference,
    });

    res.status(201).json(team);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get teams for the logged-in student in a hackathon
// @route   GET /api/hackathons/:id/teams/my
// @access  Private (Student)
exports.getMyTeams = async (req, res) => {
  try {
    const teams = await Team.find({
      hackathon: req.params.id,
      members: req.user.id,
    })
      .populate("members", "name email")
      .populate("problemStatement");

    // Backfill old records that were created before teamCode existed.
    for (const team of teams) {
      if (!team.teamCode) {
        team.teamCode = await generateUniqueTeamCode();
        await team.save();
      }
    }

    res.json(teams);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get team details
// @route   GET /api/hackathons/:id/teams/:teamId
// @access  Private
exports.getTeamById = async (req, res) => {
  try {
    const team = await Team.findById(req.params.teamId)
      .populate("members", "name email hackScore")
      .populate("problemStatement")
      .populate("hackathon", "name status");

    if (!team) {
      return res.status(404).json({ message: "Team not found" });
    }
    res.json(team);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Invite a member to a team (Sends Email)
// @route   POST /api/teams/:id/invite
// @access  Private (Team Leader)
exports.inviteMember = async (req, res) => {
  try {
    const { email } = req.body;
    const team = await Team.findById(req.params.id).populate(
      "hackathon",
      "name",
    );

    if (!team) return res.status(404).json({ message: "Team not found" });
    if (team.leader.toString() !== req.user.id) {
      return res
        .status(403)
        .json({ message: "Only the team leader can invite members" });
    }

    const hackathon = await Hackathon.findById(team.hackathon);
    if (
      hackathon.dates &&
      hackathon.dates.registrationDeadline &&
      new Date() > new Date(hackathon.dates.registrationDeadline)
    ) {
      return res.status(403).json({
        success: false,
        message:
          "Registration deadline has passed for this hackathon. You can no longer invite members.",
      });
    }

    const userToInvite = await User.findOne({ email });
    if (!userToInvite)
      return res
        .status(404)
        .json({ message: "User not found with this email" });

    // 1. Check if already in team
    if (team.members.includes(userToInvite._id)) {
      return res
        .status(400)
        .json({ message: "User is already a member of this team" });
    }

    // 2. Check if user is in another team for the same hackathon
    const inAnotherTeam = await Team.findOne({
      hackathon: team.hackathon,
      members: userToInvite._id,
    });

    if (inAnotherTeam) {
      return res.status(400).json({
        message: "User is already in another team for this hackathon",
      });
    }

    // 3. Check for existing pending invitation
    const existingInvite = await Invitation.findOne({
      team: team._id,
      invitee: userToInvite._id,
      status: "pending",
    });

    if (existingInvite) {
      return res
        .status(400)
        .json({ message: "An invitation is already pending for this user" });
    }

    // 4. Create Invitation
    const token = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 2 * 24 * 60 * 60 * 1000); // 48 hours

    await Invitation.create({
      team: team._id,
      hackathon: team.hackathon._id,
      inviter: req.user.id,
      invitee: userToInvite._id,
      token,
      expiresAt,
    });

    // 5. Send Email
    const frontendUrl =
      process.env.FRONTEND_URL ||
      "https://whateveridk-loc-8-w2-wis5.vercel.app";
    const acceptUrl = `${frontendUrl}/accept-invitation?token=${token}`;

    await emailService.sendInvitationEmail(
      userToInvite.email,
      team.name,
      req.user.name,
      acceptUrl,
      team.teamCode,
    );

    res.json({ success: true, message: `Invitation email sent to ${email}` });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Accept a team invitation
// @route   POST /api/teams/invitations/accept
// @access  Private
exports.acceptInvitation = async (req, res) => {
  try {
    const { token } = req.body;
    const invitation = await Invitation.findOne({ token, status: "pending" });

    if (!invitation) {
      return res
        .status(404)
        .json({ success: false, message: "Invalid or expired invitation" });
    }

    if (invitation.expiresAt < new Date()) {
      invitation.status = "expired";
      await invitation.save();
      return res
        .status(400)
        .json({ success: false, message: "Invitation has expired" });
    }

    // Verify user is the one invited
    if (invitation.invitee.toString() !== req.user.id) {
      return res
        .status(403)
        .json({
          success: false,
          message: "You are not authorized to accept this invitation",
        });
    }

    const team = await Team.findById(invitation.team);
    if (!team)
      return res.status(404).json({ message: "Team no longer exists" });

    const hackathon = await Hackathon.findById(team.hackathon);
    if (!hackathon.isRegistrationOpen) {
      return res.status(403).json({
        success: false,
        message: "Registration is currently closed for this hackathon",
      });
    }

    if (
      hackathon.dates &&
      hackathon.dates.registrationDeadline &&
      new Date() > new Date(hackathon.dates.registrationDeadline)
    ) {
      return res.status(403).json({
        success: false,
        message:
          "Registration deadline has passed for this hackathon. You can no longer join this team.",
      });
    }

    // Double check user didn't join another team in the meantime
    const inAnotherTeam = await Team.findOne({
      hackathon: invitation.hackathon,
      members: req.user.id,
    });

    if (inAnotherTeam) {
      invitation.status = "rejected";
      await invitation.save();
      return res
        .status(400)
        .json({
          message:
            "You are already a member of another team for this hackathon",
        });
    }

    // Add to team
    team.members.push(req.user.id);
    await team.save();

    // Update invitation
    invitation.status = "accepted";
    await invitation.save();

    // Emit real-time update
    const inviteeUser = await User.findById(req.user.id).select("name");
    emitToHackathon(req.io, team.hackathon, "team:member-joined", {
      teamId: team._id,
      userId: req.user.id,
      userName: inviteeUser?.name || "Unknown",
    });

    res.json({
      success: true,
      message: "Successfully joined team",
      teamId: team._id,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get pending invitations for the logged-in user
// @route   GET /api/teams/invitations/pending
// @access  Private
exports.getPendingInvitations = async (req, res) => {
  try {
    const invitations = await Invitation.find({
      invitee: req.user.id,
      status: "pending",
      expiresAt: { $gt: new Date() },
    })
      .populate("team", "name")
      .populate("inviter", "name");

    res.json(invitations);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Join a team via Team Code
// @route   POST /api/teams/join-by-code
// @access  Private
exports.joinTeamByCode = async (req, res) => {
  try {
    const { teamCode } = req.body;
    if (!teamCode)
      return res.status(400).json({ message: "Team code is required" });

    const team = await Team.findOne({ teamCode: teamCode.toUpperCase() });
    if (!team) return res.status(404).json({ message: "Invalid team code" });

    const hackathon = await Hackathon.findById(team.hackathon);
    if (!hackathon.isRegistrationOpen) {
      return res.status(403).json({
        success: false,
        message: "Registration is currently closed for this hackathon",
      });
    }

    if (
      hackathon.dates &&
      hackathon.dates.registrationDeadline &&
      new Date() > new Date(hackathon.dates.registrationDeadline)
    ) {
      return res.status(403).json({
        success: false,
        message: "Registration deadline has passed for this hackathon",
      });
    }

    // Check if user is already in a team for this hackathon
    const inAnotherTeam = await Team.findOne({
      hackathon: team.hackathon,
      members: req.user.id,
    });

    if (inAnotherTeam) {
      if (inAnotherTeam._id.toString() === team._id.toString()) {
        return res
          .status(400)
          .json({ message: "You are already a member of this team" });
      }
      return res
        .status(400)
        .json({
          message: "You are already in another team for this hackathon",
        });
    }

    // Add to team
    team.members.push(req.user.id);
    await team.save();

    // Mark any pending invitation for this user/team as accepted
    await Invitation.findOneAndUpdate(
      { team: team._id, invitee: req.user.id, status: "pending" },
      { status: "accepted" },
    );

    // Emit real-time update
    const joiner = await User.findById(req.user.id).select("name");
    emitToHackathon(req.io, team.hackathon, "team:member-joined", {
      teamId: team._id,
      userId: req.user.id,
      userName: joiner?.name || "Unknown",
    });

    res.json({ success: true, message: "Joined team successfully", team });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Join a team (simplified for now, usually requires an invite code or approval)
// @route   POST /api/teams/:teamId/join
// @access  Private
exports.joinTeam = async (req, res) => {
  try {
    const team = await Team.findById(req.params.id);
    if (!team) return res.status(404).json({ message: "Team not found" });

    const hackathon = await Hackathon.findById(team.hackathon);
    if (!hackathon.isRegistrationOpen) {
      return res.status(403).json({
        success: false,
        message: "Registration is currently closed for this hackathon",
      });
    }

    if (
      hackathon.dates &&
      hackathon.dates.registrationDeadline &&
      new Date() > new Date(hackathon.dates.registrationDeadline)
    ) {
      return res.status(403).json({
        success: false,
        message: "Registration deadline has passed for this hackathon",
      });
    }

    // Check if user is already in a team for this hackathon
    const inAnotherTeam = await Team.findOne({
      hackathon: team.hackathon,
      members: req.user.id,
    });

    if (inAnotherTeam) {
      return res
        .status(400)
        .json({ message: "You are already in a team for this hackathon" });
    }

    team.members.push(req.user.id);
    await team.save();

    // Emit real-time update
    const joinedUser = await User.findById(req.user.id).select("name");
    emitToHackathon(req.io, team.hackathon, "team:member-joined", {
      teamId: team._id,
      userId: req.user.id,
      userName: joinedUser?.name || "Unknown",
    });

    res.json({ message: "Joined team successfully", team });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Remove a member from a team
// @route   DELETE /api/teams/:teamId/members/:userId
// @access  Private (Team Leader)
exports.removeMember = async (req, res) => {
  try {
    const team = await Team.findById(req.params.id);
    if (!team) return res.status(404).json({ message: "Team not found" });

    if (team.leader.toString() !== req.user.id) {
      return res
        .status(403)
        .json({ message: "Only the team leader can remove members" });
    }

    if (req.params.userId === team.leader.toString()) {
      return res.status(400).json({ message: "Cannot remove the team leader" });
    }

    team.members = team.members.filter(
      (id) => id.toString() !== req.params.userId,
    );
    await team.save();

    res.json({ message: "Member removed successfully", team });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all teams for a specific hackathon
// @route   GET /api/hackathons/:id/teams
// @access  Private
exports.getHackathonTeams = async (req, res) => {
  try {
    const mongoose = require("mongoose");
    const hackathonId = req.params.id;

    console.log(
      `--- DEBUG: Fetching teams for hackathon ID: ${hackathonId} ---`,
    );

    if (!mongoose.Types.ObjectId.isValid(hackathonId)) {
      console.log("--- DEBUG: Invalid Hackathon ID format ---");
      return res.status(400).json({ message: "Invalid Hackathon ID" });
    }

    const rawCount = await Team.countDocuments({
      hackathon: new mongoose.Types.ObjectId(hackathonId),
    });
    console.log(
      `--- DEBUG: Found ${rawCount} raw teams for this hackathon ---`,
    );

    const globalCount = await Team.countDocuments();
    console.log(`--- DEBUG: Total teams in database: ${globalCount} ---`);

    const teams = await Team.find({
      hackathon: new mongoose.Types.ObjectId(hackathonId),
    })
      .populate("members", "name email phoneNumber")
      .populate("leader", "name email phoneNumber")
      .populate("problemStatement");

    console.log(`--- DEBUG: Found ${teams.length} teams after population ---`);
    res.json(teams);
  } catch (error) {
    console.error("--- DEBUG: Error fetching hackathon teams:", error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Select a problem statement for a team
// @route   POST /api/teams/:teamId/select-problem
// @access  Private (Team Leader)
exports.selectProblem = async (req, res) => {
  try {
    const { problemId } = req.body;
    const team = await Team.findById(req.params.id);

    if (!team) return res.status(404).json({ message: "Team not found" });
    if (team.leader.toString() !== req.user.id) {
      return res
        .status(403)
        .json({ message: "Only the team leader can select problem" });
    }

    team.problemStatement = problemId;
    await team.save();

    res.json({ message: "Problem statement selected", team });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Select a mentor domain for the team (Domain-based FCFS)
// @route   POST /api/teams/:id/select-mentor
// @access  Private (Team Leader)
exports.selectMentor = async (req, res) => {
  try {
    const { domain } = req.body;
    const team = await Team.findById(req.params.id);

    if (!team)
      return res
        .status(404)
        .json({ success: false, message: "Team not found" });

    if (team.leader.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: "Only the team leader can select mentor domain",
      });
    }

    if (team.status !== "shortlisted") {
      return res.status(403).json({
        success: false,
        message: "Only shortlisted teams can select a mentor domain",
      });
    }

    if (team.mentor) {
      return res.status(400).json({
        success: false,
        message: "A mentor has already been allocated to this team",
      });
    }

    const mentor = await Mentor.findOne({
      hackathon: team.hackathon,
      domain: domain,
      $expr: { $lt: [{ $size: "$assignedTeams" }, "$capacity"] },
    }).sort({ createdAt: 1 }); // FCFS on mentor creation? Actually FCFS for teams is handled by the order of requests.

    if (!mentor) {
      return res.status(404).json({
        success: false,
        message:
          "No mentors available in this domain currently. Please try another domain.",
      });
    }

    // Allocate mentor
    team.mentor = mentor._id;
    team.selectedDomain = domain;
    await team.save();

    // Update mentor's assigned teams
    mentor.assignedTeams.push(team._id);
    await mentor.save();

    res.json({
      success: true,
      message: `Mentor from ${domain} domain allocated successfully`,
      team,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get available domains for a hackathon
// @route   GET /api/hackathons/:id/domains
// @access  Private
exports.getAvailableDomains = async (req, res) => {
  try {
    const hackathon = await Hackathon.findById(req.params.id);
    if (!hackathon)
      return res.status(404).json({ message: "Hackathon not found" });

    // Get unique domains from mentors in this hackathon
    const domains = await Mentor.find({ hackathon: req.params.id }).distinct(
      "domain",
    );

    // Check availability for each domain
    const domainStatus = await Promise.all(
      domains.map(async (domain) => {
        const mentors = await Mentor.find({ hackathon: req.params.id, domain });
        const totalCapacity = mentors.reduce((acc, m) => acc + m.capacity, 0);
        const totalAssigned = mentors.reduce(
          (acc, m) => acc + m.assignedTeams.length,
          0,
        );

        return {
          domain,
          available: totalAssigned < totalCapacity,
          remainingCapacity: totalCapacity - totalAssigned,
        };
      }),
    );

    res.json({ success: true, domains: domainStatus });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get the chosen mentor for the team
// @route   GET /api/teams/:id/mentor
// @access  Private
exports.getTeamMentor = async (req, res) => {
  try {
    const team = await Team.findById(req.params.id).populate(
      "mentor",
      "name linkedinUrl profilePhotoUrl _id",
    );

    if (!team)
      return res
        .status(404)
        .json({ success: false, message: "Team not found" });

    if (!team.mentor) {
      return res.status(200).json({
        success: true,
        message: "No mentor selected yet",
        mentor: null,
      });
    }

    res.json({ success: true, mentor: team.mentor });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
