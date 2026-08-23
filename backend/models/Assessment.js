import mongoose from "mongoose";

const questionResultSchema = new mongoose.Schema(
  {
    question: String,
    topic: String,
    difficulty: { type: String, enum: ["easy", "medium", "hard"] },
    challenge: { type: String, enum: ["standard", "extreme"], default: "standard" },
    options: [String],
    correctAnswer: String,
    studentAnswer: String,
    isCorrect: Boolean,
  },
  { _id: false }
);

const assessmentSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    subject: { type: String, required: true },
    studentClass: { type: String, required: true },
    questions: [questionResultSchema],
    score: { type: Number, default: 0 },
    totalQuestions: { type: Number, default: 0 },
    weakTopics: [String],
    strongTopics: [String],
    summary: { type: String, default: "" },
    type: { type: String, enum: ["initial", "weekly"], default: "initial" },
    weekNumber: { type: Number, default: null },
  },
  { timestamps: true }
);

assessmentSchema.index({ user: 1, createdAt: -1 });
assessmentSchema.index({ user: 1, subject: 1, createdAt: -1 });
assessmentSchema.index({ user: 1, type: 1, createdAt: -1 });

export default mongoose.model("Assessment", assessmentSchema);
