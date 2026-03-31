const mongoose = require('mongoose');

const sponsorSchema = mongoose.Schema({
    name: { type: String, required: true },
    logoUrl: { type: String },
    websiteUrl: { type: String },
    tier: { type: String, enum: ['title', 'gold', 'silver', 'bronze', 'partner'] },
    hackathon: { type: mongoose.Schema.Types.ObjectId, ref: 'Hackathon', required: true }
}, {
    timestamps: true
});

module.exports = mongoose.model('Sponsor', sponsorSchema);
