const mongoose = require('mongoose');

const broadcastSchema = mongoose.Schema({
    hackathon: { type: mongoose.Schema.Types.ObjectId, ref: 'Hackathon', required: true },
    message: { type: String, required: true },
    sentBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    sentAt: { type: Date, default: Date.now }
}, {
    timestamps: true
});

module.exports = mongoose.model('Broadcast', broadcastSchema);
