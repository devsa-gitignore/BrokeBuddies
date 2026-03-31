const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');
const {
    addMentor,
    getMentorsByHackathon,
    getMentorById,
    updateMentor,
    deleteMentor,
    selectMentor
} = require('../controllers/mentorController');

router.post('/', protect, authorize('admin'), addMentor);
router.get('/hackathon/:hackathonId', protect, getMentorsByHackathon);
router.get('/:id', protect, getMentorById);
router.put('/:id', protect, authorize('admin'), updateMentor);
router.delete('/:id', protect, authorize('admin'), deleteMentor);
router.post('/:id/select', protect, selectMentor);

module.exports = router;
