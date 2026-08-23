import mongoose from "mongoose";

const progressSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, unique: true },
    topicsMastered: [String],
    topicsWeak: [String],
    overallScoreHistory: [
      {
        date: { type: Date, default: Date.now },
        score: Number,
        context: String,
      },
    ],
    weeklyQuizzesTaken: { type: Number, default: 0 },
    lastActiveAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export default mongoose.model("Progress", progressSchema);
