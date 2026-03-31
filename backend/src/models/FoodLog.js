const mongoose = require("mongoose");

const foodLogSchema = mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    hackathon: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Hackathon",
      required: true,
    },
    mealType: {
      type: String,
      enum: ["breakfast", "lunch", "dinner"],
      required: true,
    },
    claimedAt: { type: Date, default: Date.now },
    qr: { type: mongoose.Schema.Types.ObjectId, ref: "QR" },
    scannedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  {
    timestamps: true,
  },
);

foodLogSchema.index({ hackathon: 1, user: 1, mealType: 1 }, { unique: true });

module.exports = mongoose.model("FoodLog", foodLogSchema);
