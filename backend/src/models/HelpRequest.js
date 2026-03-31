const mongoose = require('mongoose');

const helpRequestSchema = mongoose.Schema({
    hackathon: { type: mongoose.Schema.Types.ObjectId, ref: 'Hackathon', required: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    team: { type: mongoose.Schema.Types.ObjectId, ref: 'Team' },
    subject: { type: String, required: true },
    description: { type: String, required: true },
    status: { type: String, enum: ['open', 'in-progress', 'resolved'], default: 'open' },
    location: { type: String }, // Table number or lab name
    resolvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    createdAt: { type: Date, default: Date.now }
}, {
    timestamps: true
});

module.exports = mongoose.model('HelpRequest', helpRequestSchema);
