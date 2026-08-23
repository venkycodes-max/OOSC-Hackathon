import "dotenv/config";
import { connectDB } from "../config/db.js";
import Roadmap from "../models/Roadmap.js";

try {
  await connectDB();

  // Older versions used a unique user-only index. Remove it so one student can
  // have one roadmap per subject.
  try {
    await Roadmap.collection.dropIndex("user_1");
    console.log("Dropped legacy Roadmap user_1 index.");
  } catch (error) {
    if (!String(error.message).includes("index not found")) console.log("Legacy index note:", error.message);
  }

  // Preserve an existing roadmap as the Mathematics roadmap when it predates
  // subject-aware roadmaps. New subjects are generated on demand after their
  // first assessment/quiz.
  const legacy = await Roadmap.updateMany(
    { $or: [{ subject: { $exists: false } }, { subject: null }, { subject: "" }] },
    { $set: { subject: "Mathematics" } }
  );
  console.log(`Assigned ${legacy.modifiedCount} legacy roadmap(s) to Mathematics.`);

  await Roadmap.collection.createIndex({ user: 1, subject: 1 }, { unique: true });
  console.log("Created user + subject roadmap index.");
  process.exit(0);
} catch (error) {
  console.error("Roadmap migration failed:", error);
  process.exit(1);
}
