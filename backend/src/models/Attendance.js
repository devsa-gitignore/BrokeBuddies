const mongoose = require("mongoose");

const attendanceSchema = mongoose.Schema(
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
    scannedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    method: { type: String, enum: ["qr"], required: true, default: "qr" },
    timestamp: { type: Date, default: Date.now },
  },
  {
    timestamps: true,
  },
);

attendanceSchema.index({ hackathonId: 1, userId: 1 }, { unique: true });

module.exports = mongoose.model("Attendance", attendanceSchema);
