import express from "express";
import multer from "multer";
import { requireAuth } from "../middleware/auth.js";
import User from "../models/User.js";
import Doubt from "../models/Doubt.js";
import { solveDoubt } from "../services/aiService.js";
import { getSubjectsForUser } from "../lib/subjectRules.js";

const router = express.Router();



const MIME_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "application/pdf",
  "text/plain",
]);

const EXTENSIONS = new Set([".jpg", ".jpeg", ".png", ".webp", ".gif", ".pdf", ".txt"]);

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const name = String(file.originalname || "").toLowerCase();
    const extension = name.includes(".") ? name.slice(name.lastIndexOf(".")) : "";
    if (!MIME_TYPES.has(file.mimetype) && !EXTENSIONS.has(extension)) {
      return cb(new Error("Unsupported file type. Use JPG, PNG, WEBP, GIF, PDF or TXT."));
    }
    cb(null, true);
  },
});

async function extractPdfText(buffer) {
  const module = await import("pdf-parse");
  const parser = module.default || module;
  const parsed = await parser(buffer);
  return String(parsed?.text || "").slice(0, 40000);
}

router.post("/solve", requireAuth, upload.single("file"), async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ error: "User not found." });

    const subject = String(req.body.subject || "").trim();
    const allowedSubjects = new Set(getSubjectsForUser(user));
    const question = String(req.body.question || req.body.text || "").trim();

    if (!allowedSubjects.has(subject)) return res.status(400).json({ error: "Please select a valid subject." });
    if (!question && !req.file) return res.status(400).json({ error: "Add a question or upload an image/PDF first." });

    let attachmentText = "";
    let imageDataUrl = null;

    if (req.file) {
      const isImage = req.file.mimetype.startsWith("image/") || /\.(jpg|jpeg|png|webp|gif)$/i.test(req.file.originalname || "");
      const isPdf = req.file.mimetype === "application/pdf" || /\.pdf$/i.test(req.file.originalname || "");
      const isText = req.file.mimetype === "text/plain" || /\.txt$/i.test(req.file.originalname || "");

      if (isImage) {
        const mime = MIME_TYPES.has(req.file.mimetype) && req.file.mimetype.startsWith("image/")
          ? req.file.mimetype
          : "image/jpeg";
        imageDataUrl = `data:${mime};base64,${req.file.buffer.toString("base64")}`;
      } else if (isPdf) {
        try {
          attachmentText = await extractPdfText(req.file.buffer);
        } catch (pdfError) {
          console.error("PDF extraction error:", pdfError);
          return res.status(422).json({ error: "I couldn't read this PDF. Please upload a text-based PDF or a clear image of the question." });
        }
        if (!attachmentText.trim()) {
          return res.status(422).json({ error: "This PDF appears to be scanned/image-only. Please upload the question as an image instead." });
        }
      } else if (isText) {
        attachmentText = req.file.buffer.toString("utf8").slice(0, 40000);
      }
    }

    const result = await solveDoubt({
      subject,
      studentClass: user.studentClass,
      question,
      attachmentText,
      imageDataUrl,
    });

    if (!result?.answer) {
      return res.status(502).json({ error: "The AI returned an empty answer. Please try the question again." });
    }

    const doubt = await Doubt.create({
      user: user._id,
      subject,
      studentClass: user.studentClass,
      question,
      attachmentName: req.file?.originalname || "",
      attachmentType: req.file?.mimetype || "",
      answer: result.answer || "",
      steps: Array.isArray(result.steps) ? result.steps : [],
      misconception: result.misconception || "",
      practiceQuestion: result.practiceQuestion || "",
      hint: result.hint || "",
      topic: result.topic || "",
    });

    res.json({
      doubtId: doubt._id,
      subject,
      answer: doubt.answer,
      steps: doubt.steps,
      misconception: doubt.misconception,
      practiceQuestion: doubt.practiceQuestion,
      hint: doubt.hint,
      topic: doubt.topic,
    });
  } catch (err) {
    console.error("Doubt Solver error:", err);
    const message = String(err?.message || "");
    const status = err?.code === "LIMIT_FILE_SIZE" ? 413 : 502;

    let error = "Could not solve this doubt right now.";
    if (status === 413) error = "File is too large. Please keep uploads under 10 MB.";
    else if (message.includes("GROQ_API_KEY")) error = "Doubt Solver is not configured: add GROQ_API_KEY to the backend .env file.";
    else if (message.includes("Vision AI error")) error = "The image could not be read by the vision model. Check GROQ_VISION_MODEL or try a clearer JPG/PNG.";
    else if (message.includes("Groq API error")) error = "The AI service rejected the request. Check the GROQ model/API key in the backend .env file.";

    res.status(status).json({ error });
  }
});

router.get("/history", requireAuth, async (req, res) => {
  const history = await Doubt.find({ user: req.userId })
    .sort({ createdAt: -1 })
    .limit(20)
    .select("subject question answer topic createdAt attachmentName");
  res.json({ history });
});

export default router;
