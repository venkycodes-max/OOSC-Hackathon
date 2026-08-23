import mongoose from "mongoose";

const milestoneSchema = new mongoose.Schema(
  {
    title: String,
    topic: String,
    description: String,
    status: { type: String, enum: ["upcoming", "in-progress", "mastered"], default: "upcoming" },
    order: Number,
    resources: [
      {
        title: String,
        provider: String,
        searchUrl: String,
      },
    ],
  },
  { _id: true }
);

const roadmapSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    subject: { type: String, required: true },
    aim: String,
    aimDetail: String,
    overview: String,
    milestones: [milestoneSchema],
    generatedAt: { type: Date, default: Date.now },
    latestAssessmentAt: { type: Date, default: null },
  },
  { timestamps: true }
);

// One adaptive roadmap per user per subject.
roadmapSchema.index({ user: 1, subject: 1 }, { unique: true });

export default mongoose.model("Roadmap", roadmapSchema);
