import mongoose from "mongoose";

const doubtSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    subject: { type: String, required: true },
    studentClass: { type: String, required: true },
    question: { type: String, default: "" },
    attachmentName: { type: String, default: "" },
    attachmentType: { type: String, default: "" },
    answer: { type: String, default: "" },
    steps: [String],
    misconception: { type: String, default: "" },
    practiceQuestion: { type: String, default: "" },
    hint: { type: String, default: "" },
    topic: { type: String, default: "" },
  },
  { timestamps: true }
);

export default mongoose.model("Doubt", doubtSchema);
