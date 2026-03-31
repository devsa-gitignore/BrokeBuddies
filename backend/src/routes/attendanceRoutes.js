const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');
const {
    recordAttendance,
    getAttendanceByHackathon,
    getStudentAttendance,
    exportAttendanceCSV,
    markPresent
} = require('../controllers/attendanceController');

router.post('/', protect, authorize('admin'), recordAttendance);
router.get('/hackathon/:hackathonId', protect, authorize('admin'), getAttendanceByHackathon);
router.get('/student/:userId', protect, getStudentAttendance);
router.get('/export/:hackathonId', protect, authorize('admin'), exportAttendanceCSV);
router.put('/:id/mark-present', protect, authorize('admin'), markPresent);

module.exports = router;
