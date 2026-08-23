import express from "express";
import axios from "axios";
import { requireAuth } from "../middleware/auth.js";
import User from "../models/User.js";

const router = express.Router();

const LANGUAGES = {
  python: { id: 71, label: "Python" },
  cpp: { id: 54, label: "C++" },
  java: { id: 62, label: "Java" },
};

const MAX_CODE_LENGTH = 20000;
const RUNNER_URL = String(process.env.CODE_RUNNER_URL || "https://ce.judge0.com").replace(/\/$/, "");

function canUseCodeEditor(user) {
  const studentClass = String(user?.studentClass || "").trim();
  if (/^Class\s+(8|9|10|11|12)$/i.test(studentClass)) return true;
  return /^UG\s+Year\s+[1-4]$/i.test(studentClass) && String(user?.branch || "").trim().toLowerCase() === "computer science";
}

router.post("/run", requireAuth, async (req, res) => {
  try {
    const user = await User.findById(req.userId).select("studentClass branch");
    if (!user) return res.status(404).json({ error: "User not found." });
    if (!canUseCodeEditor(user)) return res.status(403).json({ error: "Code Editor is not available for this account." });

    const language = String(req.body?.language || "").trim().toLowerCase();
    const code = String(req.body?.code || "");
    const languageInfo = LANGUAGES[language];

    if (!languageInfo) return res.status(400).json({ error: "Only Python, C++ and Java can be run through the backend." });
    if (!code.trim()) return res.status(400).json({ error: "Write some code before running it." });
    if (code.length > MAX_CODE_LENGTH) return res.status(400).json({ error: `Code is too long. Keep it under ${MAX_CODE_LENGTH} characters.` });

    const response = await axios.post(
      `${RUNNER_URL}/submissions?base64_encoded=false&wait=true`,
      {
        language_id: languageInfo.id,
        source_code: code,
        stdin: "",
        cpu_time_limit: 3,
        wall_time_limit: 5,
        memory_limit: 128000,
        max_processes_and_or_threads: 20,
      },
      {
        timeout: 12000,
        headers: { "Content-Type": "application/json" },
      },
    );

    const data = response.data || {};
    const output = [data.stdout, data.stderr, data.compile_output, data.message]
      .filter(value => value !== null && value !== undefined && String(value).length > 0)
      .join("\n")
      .trim();

    return res.json({
      output: output || "Program finished with no output.",
      status: data.status?.description || "Finished",
    });
  } catch (error) {
    const status = error.response?.status;
    const runnerMessage = error.response?.data?.message;
    console.error("Code runner error:", status || error.code || error.message, runnerMessage || "");

    if (status === 401 || status === 403) {
      return res.status(502).json({ error: "The code runner rejected the request. Please try again later." });
    }
    if (status === 429) {
      return res.status(503).json({ error: "The code runner is busy right now. Please try again in a moment." });
    }
    if (error.code === "ECONNABORTED" || error.code === "ETIMEDOUT") {
      return res.status(504).json({ error: "The code runner took too long to respond. Please try again." });
    }
    return res.status(502).json({ error: "The code runner is temporarily unavailable." });
  }
});

export default router;
