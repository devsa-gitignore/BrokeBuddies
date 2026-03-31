const mongoose = require('mongoose');

const problemSchema = mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String, required: true },
    hackathon: { type: mongoose.Schema.Types.ObjectId, ref: 'Hackathon', required: true },
    category: { type: String },
    domain: { type: String, required: true },
    difficulty: { type: String, enum: ['easy', 'medium', 'hard'] }
}, {
    timestamps: true
});

module.exports = mongoose.model('Problem', problemSchema);
