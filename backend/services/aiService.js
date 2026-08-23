import axios from "axios";
import { SUBJECTS, SUBJECT_CURRICULUM, DIAGNOSTIC_TOPIC_ALIASES, getSubjectsForUser } from "../lib/subjectRules.js";
import { questionLevelInstruction, isUG } from "../lib/diagnosticRules.js";

const GROQ_URL = "https://api.groq.com/openai/v1/chat/completions";

/**
 * Low-level call to Groq's OpenAI-compatible chat completions endpoint.
 * Groq serves open-weight reasoning models such as OpenAI GPT-OSS 120B.
 */
async function callGroq(systemPrompt, userPrompt, { temperature = 0.5 } = {}) {
  if (!process.env.GROQ_API_KEY) {
    throw new Error(
      "GROQ_API_KEY is not set. Create a free key at https://console.groq.com/keys and add it to backend/.env"
    );
  }

  const model = process.env.GROQ_MODEL || "openai/gpt-oss-120b";

  try {
    const response = await axios.post(
      GROQ_URL,
      {
        model,
        temperature,
        response_format: { type: "json_object" },
        messages: [
          {
            role: "system",
            content: systemPrompt,
          },
          {
            role: "user",
            content: userPrompt,
          },
        ],
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
          "Content-Type": "application/json",
        },
        timeout: 30000,
      }
    );

    const raw = response.data.choices?.[0]?.message?.content || "{}";

    return safeParseJSON(raw);
  } catch (error) {
    console.error("========== GROQ API ERROR ==========");
    console.error("URL:", GROQ_URL);
    console.error("Model:", model);
    console.error("Status:", error.response?.status);
    console.error("Response:", error.response?.data);
    console.error("Message:", error.message);
    console.error("====================================");

    throw new Error(
      `Groq API error ${error.response?.status || "unknown"}: ${
        error.response?.data
          ? JSON.stringify(error.response.data)
          : error.message
      }`
    );
  }
}

/**
 * Safely parses JSON returned by the model.
 */
function safeParseJSON(raw) {
  const text = String(raw || "").trim();
  try {
    return JSON.parse(text);
  } catch {}

  const cleaned = text.replace(/```json|```/gi, "").trim();
  try {
    return JSON.parse(cleaned);
  } catch {}

  // Some multimodal models occasionally add one sentence before/after the JSON.
  const first = cleaned.indexOf("{");
  const last = cleaned.lastIndexOf("}");
  if (first >= 0 && last > first) {
    try {
      return JSON.parse(cleaned.slice(first, last + 1));
    } catch {}
  }

  throw new Error("AI returned malformed JSON: " + text.slice(0, 300));
}

/**
 * Generates a 3-tier diagnostic assessment (easy/medium/hard)
 * for a subject + class.
 *
 * The last 2 hard questions are deliberately above grade level
 * to test whether the student's understanding exceeds their class.
 */
export async function generateOnboardingAssessmentQuestions({ studentClass, branch = "" }) {
  const system = `You are an expert academic diagnostic designer. Create ONE overall baseline assessment for a new Trailhead student. Respond ONLY with JSON, no markdown. Every question must be genuinely about its declared subject. Do not mix subjects inside a question. The assessment must be academically meaningful, not a trivial school-level recall test. For senior school (Classes 11-12) and every UG level, Mathematics and Physics hard questions must be genuinely difficult; include 1-2 EXTREME/competitive questions in those subjects.`;
  const onboardingSubjects = getSubjectsForUser(studentClass, branch);
  const subjectRules = onboardingSubjects.map((subject) => `${subject}: ${JSON.stringify(SUBJECT_CURRICULUM[subject] || [])}`).join("\n");
  const branchRule = isUG(studentClass) ? `The student selected UG branch: "${branch}". The branch subject MUST be "${onboardingSubjects[4]}". Include exactly 10 questions from that branch subject and do NOT include Computer Science unless the selected branch itself is Computer Science. The branch subject must be a genuine technical/engineering subject, not a generic label.` : "No UG branch applies.";
  const levelRule = questionLevelInstruction(studentClass);
  const user = `Create a 25-question overall diagnostic for a new student in "${studentClass}".

${levelRule}
${branchRule}

SUBJECT COVERAGE: use exactly these six subjects: ${onboardingSubjects.join(", ")}. For UG, use exactly 3 Mathematics + 3 Physics + 3 Chemistry + 3 Biology + 3 English + 10 ${onboardingSubjects[4]} questions. For non-UG, use exactly 4 Mathematics + 4 Physics + 4 Chemistry + 4 Biology + 4 Computer Science + 5 English questions.

DIFFICULTY COVERAGE: exactly 8 easy, 8 medium and 9 hard questions across the complete 25-question set. Easy should still require understanding, medium should test the next academic level, and hard should include a few genuinely extreme/competitive items.

MATH COVERAGE REQUIREMENT: if Mathematics is included, prioritize broad coverage and include Integrals, Statistics and Probability where possible. For UG students, mathematics should also sample calculus/algebra/linear-algebra style reasoning rather than Class 10 arithmetic.

SUBJECT BREADTH: sample different fields within Physics, Chemistry, Biology, the selected branch subject and English rather than repeating one chapter.

ALLOWED CURRICULUM TOPICS for school-level grounding (you may use a more advanced topic label when needed for the student's selected level):
${subjectRules}

Each question MUST have this exact shape:
{
  "subject": "one of the six subjects above",
  "question": "string",
  "topic": "specific topic name",
  "difficulty": "easy|medium|hard",
  "options": ["four complete answer texts, NOT A/B/C/D labels"],
  "correctAnswer": "must exactly match one complete option text",
  "challenge": "standard|extreme"
}

IMPORTANT: Never output options like ["A", "B", "C", "D"]. The four options must contain actual answer choices. Never write a question whose correct answer is obvious from option formatting.
Return exactly: {"questions":[ ... 25 question objects ... ]}`;
  const result = await callGroq(system, user, { temperature: 0.55 });
  return { questions: Array.isArray(result?.questions) ? result.questions : [] };
}

export async function generateAssessmentQuestions({
  subject,
  studentClass,
  branch = "",
}) {
  const system = `You are an expert curriculum designer creating diagnostic assessments grounded in
open, standard school/college curricula (e.g. NCERT-equivalent syllabi for school grades,
standard first-principles topics for college subjects). You must respond ONLY with a JSON object,
no prose, no markdown fences.`;

  const baseTopics = SUBJECT_CURRICULUM[subject] || [];
  const advancedTopics = isUG(studentClass) ? Object.values(DIAGNOSTIC_TOPIC_ALIASES[subject] || {}) : [];
  const curriculumTopics = [...new Set([...baseTopics, ...advancedTopics])];
  const levelRule = questionLevelInstruction(studentClass);
  const user = `Create a diagnostic assessment for a student in "${studentClass}" for the subject "${subject}".

LEVEL REQUIREMENT: ${levelRule}
UG BRANCH (if applicable): ${branch || "not applicable"}.

ABSOLUTE SUBJECT RULE: every question must be about ${subject}. Never use content from Biology, Physics, Chemistry, Mathematics, Computer Science or English unless that content is genuinely part of the selected subject.

ALLOWED CURRICULUM TOPICS (use one of these exact topic names for every question):
${JSON.stringify(curriculumTopics)}

Produce exactly:
- "easy": 4 questions that are accessible but not trivial at the selected level
- "medium": 4 questions around one academic level above the selected level
- "hard": 4 questions above the selected level, with the last 2 deliberately challenging/extreme

For Mathematics and Physics in Classes 11-12 or UG, the hard tier must be advanced and may include EXTREME/competitive questions.

Each question object must have this exact shape:
{
  "question": "string",
  "topic": "one exact item from the allowed curriculum topics",
  "subject": "${subject}",
  "options": ["four complete answer texts; never use A/B/C/D as the option values"],
  "correctAnswer": "must exactly match one complete option text",
  "challenge": "standard|extreme"
}

Cover a reasonable spread of the allowed topics rather than repeating one topic.
Never return option values that are only "A", "B", "C", or "D". The frontend adds the A/B/C/D labels itself; the model must return the actual answer text.

Respond ONLY with JSON in this exact shape:
{
  "easy": [ ... 4 question objects ... ],
  "medium": [ ... 4 question objects ... ],
  "hard": [ ... 4 question objects ... ]
}`;

  const result = await callGroq(system, user, {
    temperature: 0.6,
  });

  // Tag each question with its difficulty so downstream code doesn't need to guess
  for (const level of ["easy", "medium", "hard"]) {
    if (Array.isArray(result[level])) {
      result[level] = result[level].map((q) => ({
        ...q,
        difficulty: level,
      }));
    } else {
      result[level] = [];
    }
  }

  return result;
}

/**
 * Given graded questions (isCorrect already computed in code),
 * asks the AI to synthesize weak/strong topics and a short
 * human-readable summary of the gap.
 *
 * The score itself is computed deterministically in the route,
 * not by the AI.
 */
export async function analyzeAssessmentGaps({
  subject,
  studentClass,
  gradedQuestions,
}) {
  const system = `You are a diagnostic tutor. You must respond ONLY with a JSON object, no prose.`;

  const compact = gradedQuestions.map((q) => ({
    topic: q.topic,
    difficulty: q.difficulty,
    isCorrect: q.isCorrect,
  }));

  const user = `A student in "${studentClass}" took a diagnostic assessment in "${subject}".
Here are the per-question results (topic, difficulty, whether correct):
${JSON.stringify(compact)}

Analyze this and respond ONLY with JSON in this exact shape:
{
  "weakTopics": ["topic names the student struggled with, ordered worst first"],
  "strongTopics": ["topic names the student handled well, including any above-grade successes"],
  "summary": "2-3 sentence plain-language summary of where the student stands, written to the student directly ('you')"
}`;

  return callGroq(system, user, {
    temperature: 0.4,
  });
}

/**
 * Generates a personalized roadmap given the student's weak/strong topics
 * and their stated aim.
 */
export async function generateRoadmap({
  studentClass,
  subject,
  weakTopics,
  strongTopics,
  aim,
  aimDetail,
  curriculumTopics = [],
}) {
  const system = `You are an experienced academic mentor building a personalized study roadmap.
You must respond ONLY with a JSON object, no prose. Never invent a specific deep URL — only
reference these real platforms by name: Khan Academy, NCERT, MIT OpenCourseWare, freeCodeCamp,
GeeksforGeeks, Coursera. For each resource, provide a short search query string instead of a URL.`;

  const user = `Build a study roadmap for a student in "${studentClass}" studying "${subject}".
Weak topics (need focus): ${JSON.stringify(weakTopics)}
Strong topics (already solid): ${JSON.stringify(strongTopics)}
Student's stated aim: "${aim}" ${
    aimDetail ? `(specifically: ${aimDetail})` : ""
  }

Cover the ENTIRE supplied curriculum. Design 8-12 sequential milestones so the roadmap spans
all major curriculum areas, while moving weak topics earlier and mastered topics into lighter
reinforcement phases. Do not omit a curriculum area merely because the student is already strong.
Each milestone MUST include at least 4 useful resources from the allowed providers.
Prioritize closing weak topics first, then build toward the student's aim (e.g. if aim is an entrance
exam, weight toward exam-relevant depth; if aim is placements, weight toward applied/practical mastery;
if general studies, weight toward solid grade-level command of the syllabus).

Complete curriculum to cover:
${JSON.stringify(curriculumTopics)}

Respond ONLY with JSON in this exact shape:
{
  "overview": "3-4 sentence roadmap overview written directly to the student",
  "milestones": [
    {
      "title": "short milestone title",
      "topic": "topic name",
      "description": "1-2 sentences on what to do and why it matters for their aim",
      "resources": [
        {
          "title": "resource title",
          "provider": "Khan Academy | NCERT | MIT OpenCourseWare | freeCodeCamp | GeeksforGeeks | Coursera",
          "searchQuery": "search terms to find it on that platform"
        },
        { "title": "resource title", "provider": "allowed provider", "searchQuery": "topic search" },
        { "title": "resource title", "provider": "allowed provider", "searchQuery": "topic practice search" },
        { "title": "resource title", "provider": "allowed provider", "searchQuery": "topic revision search" }
      ]
    }
  ]
}`;

  return callGroq(system, user, {
    temperature: 0.6,
  });
}

/**
 * Generates a shorter weekly quiz that targets the student's
 * current weak topics.
 */
export async function generateWeeklyQuiz({
  subject,
  studentClass,
  weakTopics,
  allowedTopics = [],
}) {
  const system = `You are a strict subject-specific tutor creating a weekly check-in quiz.
Respond ONLY with a JSON object and never include prose outside the JSON.
Every question MUST belong to the selected subject. Never borrow a topic, fact,
example, terminology or question from another subject.
The topic field MUST be one of the allowed curriculum topics supplied by the user.`;

  const user = `Create exactly 6 questions for a student in "${studentClass}" for the subject "${subject}".

ALLOWED CURRICULUM TOPICS FOR THIS QUIZ:
${JSON.stringify(allowedTopics)}

Current weak topics for THIS SUBJECT only:
${JSON.stringify(weakTopics)}

Mix easy, medium and hard questions. Prefer weak topics, but cover multiple allowed topics.
If there are no subject-specific weak topics, use the allowed curriculum topics.

For every question set subject to exactly "${subject}" and topic to one exact item from the allowed topic list.
Do not use a topic from any other subject.

Respond ONLY with JSON in this exact shape:
{
  "subject": "${subject}",
  "questions": [
    {
      "subject": "${subject}",
      "question": "string",
      "topic": "one exact allowed topic",
      "difficulty": "easy | medium | hard",
      "options": ["four complete answer texts; never use A/B/C/D as the option values"],
      "correctAnswer": "must exactly match one complete option text"
    }
  ]
}`;

  return callGroq(system, user, {
    temperature: 0.35,
  });
}

/**
 * Given updated progress after a weekly quiz, decides which roadmap
 * milestones should flip status and returns a short progress note.
 */
export async function updateProgressNarrative({
  studentClass,
  subject,
  weakTopics,
  strongTopics,
  recentScore,
}) {
  const system = `You are an encouraging but honest academic mentor. Respond ONLY with a JSON object, no prose.`;

  const user = `Student in "${studentClass}", subject "${subject}", just scored ${recentScore}% on a weekly check-in.
Current weak topics: ${JSON.stringify(weakTopics)}
Current strong topics: ${JSON.stringify(strongTopics)}

Respond ONLY with JSON in this exact shape:
{
  "note": "2-3 sentence direct, honest, encouraging note to the student about this week's progress"
}`;

  return callGroq(system, user, {
    temperature: 0.5,
  });
}

/**
 * Solves a student's doubt from text and/or extracted attachment content.
 * The answer is intentionally structured so the frontend can render a teaching
 * response rather than a raw chatbot completion.
 */
export async function solveDoubt({ subject, studentClass, question, attachmentText = "", imageDataUrl = null }) {
  const system = `You are Trailhead's expert tutor. You teach, you do not merely give answers.
Respond ONLY with a JSON object. Keep explanations appropriate for the student's class.
Stay strictly within the selected subject. If the question is ambiguous, state the ambiguity and make
one reasonable assumption. Never silently switch to another subject.
Return exactly these fields: answer, steps, misconception, practiceQuestion, topic, hint.`;

  let visualText = "";
  if (imageDataUrl) {
    visualText = await extractImageQuestion(imageDataUrl, subject, studentClass, question);
  }

  const userText = `Student class: "${studentClass}"
Selected subject: "${subject}"
Student question:
${question || "(No typed question; infer the doubt from the attachment.)"}

Attachment text extracted from a PDF/TXT (may be empty):
${attachmentText || "(none)"}

Text/transcription extracted from the uploaded image by the vision model (may be empty):
${visualText || "(none)"}

Use the typed question first when present, then use the attachment content as supporting context.
If an image contains a mathematical expression, code, diagram, table, or multiple-choice question,
use the extracted visual content carefully and explain the reasoning.

Return JSON in exactly this shape:
{
  "answer": "clear direct answer in plain text",
  "steps": ["step 1", "step 2", "step 3"],
  "misconception": "the likely misconception, or empty string",
  "practiceQuestion": "one similar question for the student to try",
  "topic": "the most relevant short topic name",
  "hint": "a short hint for the practice question"
}`;

  return callGroq(system, userText, { temperature: 0.25 });
}

async function extractImageQuestion(imageDataUrl, subject, studentClass, typedQuestion = "") {
  if (!process.env.GROQ_API_KEY) throw new Error("GROQ_API_KEY is not set.");

  const configuredModel = process.env.GROQ_VISION_MODEL || "qwen/qwen3.6-27b";
  const models = [configuredModel, "meta-llama/llama-4-scout-17b-16e-instruct"]
    .filter((model, index, list) => model && list.indexOf(model) === index);
  let lastError = null;

  for (const model of models) {
    try {
      const response = await axios.post(
        GROQ_URL,
        {
          model,
          temperature: 0.1,
          max_completion_tokens: 4096,
          messages: [
            {
              role: "system",
              content: `You are Trailhead's image-reading assistant. Extract the educational question/content from the image accurately.
The selected subject is "${subject}" and the student's class is "${studentClass}".
Do not solve the problem. Do not change the subject. Preserve equations, code, answer choices, labels, and important diagram/table details.
Return plain text only.`,
            },
            {
              role: "user",
              content: [
                {
                  type: "text",
                  text: typedQuestion
                    ? `The student also typed this context: ${typedQuestion}\n\nTranscribe and describe only the relevant problem shown in the image.`
                    : "Transcribe the question/problem shown in this image and include all relevant visible details.",
                },
                { type: "image_url", image_url: { url: imageDataUrl } },
              ],
            },
          ],
        },
        {
          headers: {
            Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
            "Content-Type": "application/json",
          },
          timeout: 60000,
        }
      );

      const raw = response.data.choices?.[0]?.message?.content || "";
      if (!raw.trim()) throw new Error("Vision model returned no readable content.");
      return raw.trim();
    } catch (error) {
      lastError = error;
      console.error("Groq vision extraction failed", {
        model,
        status: error.response?.status,
        response: error.response?.data,
        message: error.message,
      });
    }
  }

  throw new Error(
    `Vision AI error ${lastError?.response?.status || "unknown"}: ${
      lastError?.response?.data ? JSON.stringify(lastError.response.data) : lastError?.message || "request failed"
    }`
  );
}
