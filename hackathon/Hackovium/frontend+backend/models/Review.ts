import mongoose from 'mongoose';

const ReviewSchema = new mongoose.Schema({
  repoUrl: {
    type: String,
    required: true,
  },
  rating: {
    type: Number,
    required: true,
  },
  chatLogs: {
    type: [mongoose.Schema.Types.Mixed],
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.models.Review || mongoose.model('Review', ReviewSchema);
