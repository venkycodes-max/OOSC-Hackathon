import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true },
    studentClass: { type: String, required: true },
    branch: { type: String, default: "", trim: true },
    aim: {
      type: String,
      enum: ["entrance-exam", "btech-placements", "school-college-studies", "general-improvement", null],
      default: null,
    },
    aimDetail: { type: String, default: "" },
    onboardingStage: {
      type: String,
      enum: ["welcome", "assessment", "aim-selection", "roadmap-ready", "complete"],
      default: "welcome",
    },
  },
  { timestamps: true }
);

export default mongoose.model("User", userSchema);
