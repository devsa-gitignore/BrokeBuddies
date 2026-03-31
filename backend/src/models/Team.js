const mongoose = require("mongoose");

const teamSchema = mongoose.Schema(
  {
    name: { type: String, required: true },
    hackathon: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Hackathon",
      required: true,
    },
    leader: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    members: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    problemStatement: { type: mongoose.Schema.Types.ObjectId, ref: "Problem" },
    mentor: { type: mongoose.Schema.Types.ObjectId, ref: "Mentor" },
    status: {
      type: String,
      enum: ["pending", "registered", "shortlisted", "finalist", "winner"],
      default: "pending",
    },
    teamCode: {
      type: String,
      unique: true,
      required: true
    },
    selectedDomain: { type: String },
    foodPreference: {
      type: String,
      enum: ['veg', 'non-veg', 'jain'],
    },
  },
  {
    timestamps: true,
  },
);

module.exports = mongoose.model("Team", teamSchema);
