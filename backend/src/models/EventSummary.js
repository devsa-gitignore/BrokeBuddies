const mongoose = require('mongoose');

const eventSummarySchema = mongoose.Schema({
    hackathon: { type: mongoose.Schema.Types.ObjectId, ref: 'Hackathon', required: true },
    totalRegistrations: { type: Number, default: 0 },
    totalTeams: { type: Number, default: 0 },
    round1Submissions: { type: Number, default: 0 },
    shortlistedTeams: { type: Number, default: 0 },
    finalSubmissions: { type: Number, default: 0 },
    totalAttendees: { type: Number, default: 0 },
    mealsServed: {
        breakfast: { type: Number, default: 0 },
        lunch: { type: Number, default: 0 },
        dinner: { type: Number, default: 0 }
    },
    winners: [{
        position: { type: Number },
        team: { type: mongoose.Schema.Types.ObjectId, ref: 'Team' }
    }],
    generatedAt: { type: Date, default: Date.now }
}, {
    timestamps: true
});

module.exports = mongoose.model('EventSummary', eventSummarySchema);
