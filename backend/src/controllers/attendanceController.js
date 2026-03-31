const Attendance = require('../models/Attendance');
const User = require('../models/User');

// @desc    Record attendance (QR Scan)
// @route   POST /api/attendance
// @access  Private (Admin)
exports.recordAttendance = async (req, res) => {
    try {
        const { hackathonId, userId } = req.body;

        const existing = await Attendance.findOne({ hackathonId, userId });
        if (existing) {
            return res.status(400).json({ success: false, message: 'Attendance already recorded' });
        }

        const attendance = await Attendance.create({
            hackathonId,
            userId,
            scannedBy: req.user._id,
            method: 'qr'
        });

        const user = await User.findById(userId).select('name email');

        if (req.io) {
            req.io.to(`hackathon_${hackathonId}`).emit('attendance:update', {
                userId,
                user: { name: user.name, email: user.email },
                checkedInAt: attendance.timestamp
            });
        }

        res.status(201).json({ success: true, attendance });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Get all attendance for a hackathon
// @route   GET /api/attendance/hackathon/:hackathonId
// @access  Private (Admin)
exports.getAttendanceByHackathon = async (req, res) => {
    try {
        const attendance = await Attendance.find({ hackathonId: req.params.hackathonId })
            .populate('userId', 'name email');
        res.status(200).json({ success: true, attendance });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Get student attendance
// @route   GET /api/attendance/student/:userId
// @access  Private
exports.getStudentAttendance = async (req, res) => {
    try {
        const attendance = await Attendance.find({ userId: req.params.userId })
            .populate('hackathonId', 'name');
        res.status(200).json({ success: true, attendance });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Export attendance as CSV
// @route   GET /api/attendance/export/:hackathonId
// @access  Private (Admin)
exports.exportAttendanceCSV = async (req, res) => {
    res.status(501).json({ message: 'Export not implemented in stub' });
};

// @desc    Manually mark present
// @route   PUT /api/attendance/:id/mark-present
// @access  Private (Admin)
exports.markPresent = async (req, res) => {
    res.status(501).json({ message: 'Mark present not implemented in stub' });
};
