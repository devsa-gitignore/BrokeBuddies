const mongoose = require('mongoose');

const evaluationSchema = mongoose.Schema({
    team: { type: mongoose.Schema.Types.ObjectId, ref: 'Team', required: true },
    hackathon: { type: mongoose.Schema.Types.ObjectId, ref: 'Hackathon', required: true },
    round: { type: String, enum: ['round1', 'final'], required: true },
    evaluator: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    criteria: [{
        name: { type: String },
        maxScore: { type: Number },
        score: { type: Number }
    }],
    totalScore: { type: Number, default: 0 },
    remarks: { type: String }
}, {
    timestamps: true
});

module.exports = mongoose.model('Evaluation', evaluationSchema);
