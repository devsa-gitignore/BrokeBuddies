const mongoose = require('mongoose');

const certificateSchema = mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    hackathon: { type: mongoose.Schema.Types.ObjectId, ref: 'Hackathon', required: true },
    type: { type: String, enum: ['participation', 'winner', 'runner_up', 'second_runner_up'], default: 'participation' },
    certificateUrl: { type: String },
    qrVerificationCode: { type: String },
    generatedAt: { type: Date, default: Date.now }
}, {
    timestamps: true
});

module.exports = mongoose.model('Certificate', certificateSchema);
