const FoodLog = require('../models/FoodLog');
const Attendance = require('../models/Attendance');
const User = require('../models/User');
const Team = require('../models/Team');
const mongoose = require('mongoose');

// @desc    Record a meal claim (QR scan at food counter)
// @route   POST /api/food/claim
// @access  Private (Admin / Scanner)
exports.claimMeal = async (req, res) => {
  try {
    const { userId, hackathonId, mealType } = req.body;

    if (!userId || !hackathonId || !mealType) {
      return res.status(400).json({ success: false, message: 'userId, hackathonId, and mealType are required' });
    }

    if (!['breakfast', 'lunch', 'dinner'].includes(mealType)) {
      return res.status(400).json({ success: false, message: 'Invalid meal type' });
    }

    // Check if already claimed
    const existing = await FoodLog.findOne({ user: userId, hackathon: hackathonId, mealType });
    if (existing) {
      return res.status(400).json({ success: false, message: `${mealType} already claimed` });
    }

    const foodLog = await FoodLog.create({
      user: userId,
      hackathon: hackathonId,
      mealType,
      scannedBy: req.user.id,
    });

    res.status(201).json({ success: true, message: `${mealType} claimed successfully`, foodLog });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get food analytics for a hackathon
// @route   GET /api/hackathons/:hackathonId/food/analytics
// @access  Private (Admin)
exports.getFoodAnalytics = async (req, res) => {
  try {
    const { hackathonId } = req.params;

    // Meal counts by type
    const mealAnalytics = await FoodLog.aggregate([
      { $match: { hackathon: new mongoose.Types.ObjectId(hackathonId) } },
      { $group: { _id: '$mealType', count: { $sum: 1 } } },
    ]);

    const formattedMeals = { breakfast: 0, lunch: 0, dinner: 0 };
    mealAnalytics.forEach((item) => {
      if (formattedMeals[item._id] !== undefined) {
        formattedMeals[item._id] = item.count;
      }
    });

    // Get total attendees for remaining calculation
    const totalAttendees = await Attendance.countDocuments({ hackathonId });

    // Food preference breakdown from users in teams for this hackathon
    const teams = await Team.find({ hackathon: hackathonId }).select('members').lean();
    const memberIds = new Set();
    teams.forEach((team) => {
      (team.members || []).forEach((m) => memberIds.add(m.toString()));
    });

    const preferenceBreakdown = { veg: 0, 'non-veg': 0, jain: 0, vegan: 0 };

    if (memberIds.size > 0) {
      const prefAgg = await User.aggregate([
        { $match: { _id: { $in: Array.from(memberIds).map((id) => new mongoose.Types.ObjectId(id)) } } },
        { $group: { _id: '$foodPreference', count: { $sum: 1 } } },
      ]);

      prefAgg.forEach((item) => {
        const key = item._id || 'veg';
        if (preferenceBreakdown[key] !== undefined) {
          preferenceBreakdown[key] = item.count;
        }
      });
    }

    res.status(200).json({
      success: true,
      analytics: formattedMeals,
      totalAttendees,
      remaining: {
        breakfast: Math.max(0, totalAttendees - formattedMeals.breakfast),
        lunch: Math.max(0, totalAttendees - formattedMeals.lunch),
        dinner: Math.max(0, totalAttendees - formattedMeals.dinner),
      },
      preferenceBreakdown,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to fetch food analytics',
    });
  }
};

// @desc    Get remaining meal counts (estimated vs actual)
// @route   GET /api/food/remaining/:hackathonId
// @access  Private (Admin)
exports.getRemainingMeals = async (req, res) => {
  try {
    const { hackathonId } = req.params;

    const totalAttendees = await Attendance.countDocuments({ hackathonId });

    const claimed = await FoodLog.aggregate([
      { $match: { hackathon: new mongoose.Types.ObjectId(hackathonId) } },
      { $group: { _id: '$mealType', count: { $sum: 1 } } },
    ]);

    const result = { breakfast: totalAttendees, lunch: totalAttendees, dinner: totalAttendees };
    claimed.forEach((item) => {
      if (result[item._id] !== undefined) {
        result[item._id] = Math.max(0, totalAttendees - item.count);
      }
    });

    res.status(200).json({ success: true, remaining: result, totalAttendees });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get food logs for a specific student
// @route   GET /api/food/student/:userId
// @access  Private
exports.getStudentFoodLogs = async (req, res) => {
  try {
    const { userId } = req.params;
    const { hackathonId } = req.query;

    const query = { user: userId };
    if (hackathonId) query.hackathon = hackathonId;

    const foodLogs = await FoodLog.find(query)
      .populate('hackathon', 'name')
      .sort({ claimedAt: -1 });

    res.status(200).json({ success: true, foodLogs });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
