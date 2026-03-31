const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    phoneNumber: { type: String, unique: true, sparse: true }, // sparse allows multiple null values
    password: { type: String, required: true },
    role: { type: String, enum: ['student', 'admin', 'judge', 'mentor', 'scanner'], default: 'student' },
    isVerified: { type: Boolean, default: false },
    verificationStatus: {
      type: String,
      enum: ["unverified", "pending", "approved", "rejected"],
      default: "unverified",
    },
    hackScore: { type: Number, default: 0 },
    registrationDetails: {
      collegeIdUrl: String,
      aadharUrl: String,
      selfieUrl: String,
    },
    foodPreference: {
      type: String,
      enum: ['veg', 'non-veg', 'jain', 'vegan'],
    },
    authorizationCertificateUrl: { type: String }, // Admin registration authorization
    hackathonRoles: [
      {
        hackathonId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Hackathon",
          required: true,
        },
        role: {
          type: String,
          enum: ["scanner", "judge", "mentor"],
          required: true,
        },
        permissions: [
          {
            type: String,
            enum: ["entry-scan", "food-scan", "face-verify"],
          },
        ],
      },
    ],
    otp: { type: String },
    otpExpires: { type: Date },
    refreshToken: { type: String },
  },
  {
    timestamps: true,
  },
);

// Hash password before saving
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    return next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Compare password
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model("User", userSchema);
