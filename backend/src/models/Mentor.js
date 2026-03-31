const mongoose = require('mongoose');

const mentorSchema = mongoose.Schema({
    name: { type: String, required: true },
    linkedinUrl: { type: String },
    profilePhotoUrl: { type: String },
    domain: { type: String, required: true },
    capacity: { type: Number, default: 5 }, // Max teams a mentor can handle
    hackathon: { type: mongoose.Schema.Types.ObjectId, ref: 'Hackathon' },
    assignedTeams: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Team' }]
}, {
    timestamps: true
});

module.exports = mongoose.model('Mentor', mentorSchema);
