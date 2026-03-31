const mongoose = require('mongoose');

const submissionSchema = mongoose.Schema({
    team: { type: mongoose.Schema.Types.ObjectId, ref: 'Team', required: true },
    hackathon: { type: mongoose.Schema.Types.ObjectId, ref: 'Hackathon', required: true },
    round: { type: String, enum: ['round1', 'final'], required: true },
    pptUrl: { type: String },
    githubLink: { type: String },
    demoLink: { type: String },
    submittedAt: { type: Date, default: Date.now },
    isLocked: { type: Boolean, default: false },
    plagiarismReport: {
        isPlagiarized: { type: Boolean, default: false },
        score: { type: Number, default: 0 }, // 0-100 probability
        reason: { type: String },
        details: { type: Object },
        checkedAt: { type: Date }
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Submission', submissionSchema);
