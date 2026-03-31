const mongoose = require("mongoose");

const hackathonSchema = mongoose.Schema(
  {
    name: { type: String, required: true },
    hostedBy: { type: String, required: true },
    description: { type: String },
    rules: { type: String },
    dates: {
      registrationDeadline: { type: Date },
      round1Deadline: { type: Date },
      finalRoundDate: { type: Date },
      startDate: { type: Date },
      endDate: { type: Date },
    },
    mealWindows: {
      breakfast: {
        start: { type: String, default: "06:00" },
        end: { type: String, default: "10:30" },
      },
      lunch: {
        start: { type: String, default: "12:00" },
        end: { type: String, default: "15:00" },
      },
      dinner: {
        start: { type: String, default: "18:00" },
        end: { type: String, default: "22:30" },
      },
    },
    mealSessions: {
      breakfast: {
        isActive: { type: Boolean, default: false },
        startsAt: { type: Date, default: null },
        endsAt: { type: Date, default: null },
      },
      lunch: {
        isActive: { type: Boolean, default: false },
        startsAt: { type: Date, default: null },
        endsAt: { type: Date, default: null },
      },
      dinner: {
        isActive: { type: Boolean, default: false },
        startsAt: { type: Date, default: null },
        endsAt: { type: Date, default: null },
      },
    },
    status: {
      type: String,
      enum: ["upcoming", "open", "ongoing", "closed"],
      default: "upcoming",
    },
    isRegistrationOpen: { type: Boolean, default: true },
    problems: [{ type: mongoose.Schema.Types.ObjectId, ref: "Problem" }],
    sponsors: [{ type: mongoose.Schema.Types.ObjectId, ref: "Sponsor" }],
    judges: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    mentors: [{ type: mongoose.Schema.Types.ObjectId, ref: "Mentor" }],
    domains: [String], // Available domains for mentoring
    evaluationMatrix: {
      round1: [
        {
          name: { type: String },
          maxScore: { type: Number },
        },
      ],
      final: [
        {
          name: { type: String },
          maxScore: { type: Number },
        },
      ],
      cutoffScore: { type: Number, default: 0 },
    },
    round1Locked: { type: Boolean, default: false },
    brochureUrl: { type: String },
    bannerImage: { type: String },
    posterUrl: { type: String },
    round1Published: { type: Boolean, default: false },
    finalPublished: { type: Boolean, default: false },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  {
    timestamps: true,
  },
);

module.exports = mongoose.model("Hackathon", hackathonSchema);
