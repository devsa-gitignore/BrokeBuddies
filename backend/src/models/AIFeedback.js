const mongoose = require('mongoose');

const aiFeedbackSchema = mongoose.Schema({
    team: { type: mongoose.Schema.Types.ObjectId, ref: 'Team', required: true },
    hackathon: { type: mongoose.Schema.Types.ObjectId, ref: 'Hackathon', required: true },
    submission: { type: mongoose.Schema.Types.ObjectId, ref: 'Submission', required: true },
    round: { type: String, enum: ['round1', 'final'], default: 'round1' },

    summary: { type: String },
    strengths: [{ type: String }],
    weaknesses: [{ type: String }],
    slideLevelFeedback: [{
        slideNumber: { type: Number },
        issues: [{ type: String }],
        suggestions: [{ type: String }]
    }],
    criterionImprovement: {
        Content: { type: String },
        Design: { type: String },
        Innovation: { type: String },
        Feasibility: { type: String }
    },
    finalAdvice: { type: String },

    generatedAt: { type: Date, default: Date.now }
}, {
    timestamps: true
});

module.exports = mongoose.model('AIFeedback', aiFeedbackSchema);
