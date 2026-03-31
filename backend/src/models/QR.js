const mongoose = require("mongoose");

const qrSchema = mongoose.Schema(
  {
    hackathonId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Hackathon",
      required: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    token: { type: String, required: true, unique: true },
    type: { type: String, enum: ["entry", "food"], required: true },
    expiresAt: { type: Date, required: true },
    imageUrl: { type: String },
    used: { type: Boolean, default: false },
    usedAt: { type: Date },
    mealType: { type: String, enum: ["breakfast", "lunch", "dinner"] },
  },
  {
    timestamps: true,
  },
);

qrSchema.index({ hackathonId: 1, userId: 1, type: 1, mealType: 1, used: 1 });

module.exports = mongoose.model("QR", qrSchema);
