import Roadmap from "../models/Roadmap.js";
import Assessment from "../models/Assessment.js";
import { generateRoadmap } from "./aiService.js";
import {
  SUBJECT_CURRICULUM,
  isValidSubject,
  canonicalTopicForSubject,
} from "../lib/subjectRules.js";

const AIM_LABELS = {
  "entrance-exam": "Preparing for an entrance exam",
  "btech-placements": "Preparing for B.Tech placements",
  "school-college-studies": "General school/college studies",
  "general-improvement": "General academic improvement",
};

function buildSearchUrl(provider, query) {
  const q = encodeURIComponent(query || "");
  switch ((provider || "").toLowerCase()) {
    case "khan academy": return `https://www.khanacademy.org/search?page_search_query=${q}`;
    case "ncert": return `https://ncert.nic.in/textbook.php?search=${q}`;
    case "mit opencourseware":
    case "mit ocw": return `https://ocw.mit.edu/search/?q=${q}`;
    case "freecodecamp": return `https://www.freecodecamp.org/news/search/?query=${q}`;
    case "geeksforgeeks": return `https://www.geeksforgeeks.org/?s=${q}`;
    case "coursera": return `https://www.coursera.org/search?query=${q}`;
    case "youtube": return `https://www.youtube.com/results?search_query=${q}`;
    default: return `https://www.google.com/search?q=${q}`;
  }
}

const FALLBACK_RESOURCES = [
  { provider: "NCERT", title: "Concept guide", querySuffix: "concept explanation" },
  { provider: "Khan Academy", title: "Visual explanation", querySuffix: "concept explained" },
  { provider: "GeeksforGeeks", title: "Practice and examples", querySuffix: "practice questions examples" },
  { provider: "Coursera", title: "Further learning", querySuffix: "beginner course" },
];

function academicLevelLabel(studentClass) {
  return String(studentClass || "").trim();
}

function resourcesFor(subject, topic, resources = [], studentClass = "") {
  const result = [];
  for (const resource of Array.isArray(resources) ? resources : []) {
    if (result.length >= 4) break;
    const title = resource.title || "Topic resource";
    const provider = resource.provider || "NCERT";
    const searchQuery = resource.searchQuery || resource.title || `${subject} ${topic}`;
    result.push({ title, provider, searchUrl: resource.searchUrl || buildSearchUrl(provider, searchQuery) });
  }
  for (const fallback of FALLBACK_RESOURCES) {
    if (result.length >= 4) break;
    result.push({
      title: fallback.title,
      provider: fallback.provider,
      searchUrl: buildSearchUrl(
        fallback.provider,
        `${subject} ${topic} ${academicLevelLabel(studentClass)} ${fallback.querySuffix}`.replace(/\s+/g, " ").trim()
      ),
    });
  }
  return result.slice(0, 4);
}

function normalize(value) {
  return String(value || "").toLowerCase().replace(/[^a-z0-9]+/g, " ").replace(/\s+/g, " ").trim();
}

function topicMatches(a, b) {
  const x = normalize(a);
  const y = normalize(b);
  return x === y || x.includes(y) || y.includes(x);
}

/**
 * Aggregate ALL assessments for the selected subject. We intentionally do not
 * use the global Progress topics here: doing so is what previously allowed a
 * Biology topic such as "Leaf Anatomy" to leak into a Mathematics trail.
 */
async function subjectSnapshot(userId, subject) {
  const assessments = await Assessment.find({ user: userId, subject })
    .sort({ createdAt: -1 })
    .limit(200)
    .lean();

  const curriculum = SUBJECT_CURRICULUM[subject] || [];
  const stats = new Map(curriculum.map((topic) => [topic, { correct: 0, total: 0, latestAt: null }]));

  for (const assessment of assessments) {
    for (const question of assessment.questions || []) {
      const canonical = canonicalTopicForSubject(question.topic, subject);
      if (!canonical || !stats.has(canonical)) continue;
      const item = stats.get(canonical);
      item.total += 1;
      if (question.isCorrect) item.correct += 1;
      if (!item.latestAt || new Date(assessment.createdAt) > new Date(item.latestAt)) item.latestAt = assessment.createdAt;
    }
  }

  // For older records that do not contain question-level results, use the saved
  // weak/strong topic labels only after canonicalising them.
  for (const assessment of assessments) {
    for (const raw of [...(assessment.weakTopics || []), ...(assessment.strongTopics || [])]) {
      const canonical = canonicalTopicForSubject(raw, subject);
      if (!canonical || !stats.has(canonical)) continue;
      const item = stats.get(canonical);
      if (item.total === 0) {
        item.total = 1;
        item.correct = (assessment.strongTopics || []).some((t) => canonicalTopicForSubject(t, subject) === canonical) ? 1 : 0;
      }
    }
  }

  const weakTopics = [...stats.entries()]
    .filter(([, s]) => s.total > 0 && s.correct / s.total < 0.6)
    .sort((a, b) => (a[1].correct / a[1].total) - (b[1].correct / b[1].total))
    .map(([topic]) => topic);

  const strongTopics = [...stats.entries()]
    .filter(([, s]) => s.total > 0 && s.correct / s.total >= 0.8)
    .sort((a, b) => (b[1].correct / b[1].total) - (a[1].correct / a[1].total))
    .map(([topic]) => topic);

  const attemptedTopics = new Set([...stats.entries()].filter(([, s]) => s.total > 0).map(([topic]) => topic));
  const latest = assessments[0] || null;

  return {
    assessments,
    latestAssessment: latest,
    weakTopics,
    strongTopics,
    attemptedTopics,
    stats,
  };
}

function createMilestones(subject, aiRoadmap, snapshot, studentClass = "") {
  const curriculum = SUBJECT_CURRICULUM[subject] || [];
  const aiMilestones = Array.isArray(aiRoadmap?.milestones) ? aiRoadmap.milestones : [];
  const byTopic = new Map();

  for (const milestone of aiMilestones) {
    const rawTopic = milestone.topic || milestone.title;
    const canonical = canonicalTopicForSubject(rawTopic, subject);
    if (!canonical || byTopic.has(canonical)) continue;
    byTopic.set(canonical, milestone);
  }

  const weakSet = new Set(snapshot.weakTopics);
  const strongSet = new Set(snapshot.strongTopics);
  const attemptedSet = snapshot.attemptedTopics;

  // Always include every curriculum topic. The roadmap is the entire portion,
  // not just a list of topics the student happened to answer in a quiz.
  for (const topic of curriculum) {
    if (!byTopic.has(topic)) {
      byTopic.set(topic, {
        title: topic,
        topic,
        description: `Build a solid ${subject} foundation in ${topic}, then check your understanding with practice.`,
        resources: [],
      });
    }
  }

  const priority = (topic) => {
    if (weakSet.has(topic)) return 0;          // immediate focus
    if (!attemptedSet.has(topic)) return 1;    // next uncovered portion
    if (strongSet.has(topic)) return 3;        // reinforce later
    return 2;                                  // partially understood
  };

  const entries = [...byTopic.entries()].sort(([a], [b]) => {
    const p = priority(a) - priority(b);
    if (p !== 0) return p;
    const sa = snapshot.stats.get(a) || { correct: 0, total: 0 };
    const sb = snapshot.stats.get(b) || { correct: 0, total: 0 };
    const aa = sa.total ? sa.correct / sa.total : -1;
    const ab = sb.total ? sb.correct / sb.total : -1;
    return aa - ab;
  });

  return entries.map(([topic], index) => {
    const status = weakSet.has(topic)
      ? "in-progress"
      : strongSet.has(topic)
        ? "mastered"
        : "upcoming";

    // The selected subject is the source of truth. Never let an AI-generated
    // title, description, topic label, or resource set from another subject
    // leak into this roadmap. The canonical curriculum topic is used as the
    // title and the deterministic description/resources are subject-bound.
    return {
      title: topic,
      topic,
      description: `Master ${topic} in ${subject}, then reinforce it with targeted practice and revision.`,
      status,
      order: index,
      resources: resourcesFor(subject, topic, [], studentClass),
    };
  });
}

function deterministicRoadmap(subject, snapshot, studentClass = "") {
  const milestones = createMilestones(subject, { milestones: [] }, snapshot, studentClass);
  const focus = snapshot.weakTopics[0];
  const overview = focus
    ? `Your ${subject} route now covers the full curriculum. ${focus} has moved forward because your assessment results show it needs more practice. Topics you have mastered are kept later for reinforcement.`
    : snapshot.latestAssessment
      ? `Your ${subject} route covers the full curriculum. Topics you have already demonstrated are marked as mastered, while untouched areas remain ahead so the entire portion is covered.`
      : `Take the ${subject} assessment to build your personalized learning route.`;
  return { overview, milestones, generatedAt: new Date(), fallback: true };
}

export async function getSubjectRoadmapSnapshot(userId, subject) {
  return subjectSnapshot(userId, subject);
}

/**
 * Stored roadmaps from older versions of Trailhead may contain milestones
 * generated before subject isolation was enforced. Treat such a roadmap as
 * invalid and rebuild it instead of ever displaying another subject's trail.
 */
export function roadmapBelongsToSubject(roadmap, subject) {
  if (!roadmap || roadmap.subject !== subject) return false;
  const curriculum = SUBJECT_CURRICULUM[subject] || [];
  const milestones = Array.isArray(roadmap.milestones) ? roadmap.milestones : [];
  if (milestones.length !== curriculum.length) return false;

  const topics = milestones.map((milestone) => canonicalTopicForSubject(milestone.topic, subject));
  if (topics.some((topic) => !topic)) return false;
  if (new Set(topics).size !== curriculum.length) return false;
  if (!curriculum.every((topic) => topics.includes(topic))) return false;

  // Every phase must have the promised minimum resources.
  if (milestones.some((milestone) => !Array.isArray(milestone.resources) || milestone.resources.length < 4)) return false;
  return true;
}

/**
 * Create or refresh the subject roadmap after every completed assessment.
 * AI can improve wording/resources, but the canonical curriculum, ordering,
 * status and persistence are deterministic so the trail always updates.
 */
export async function ensureSubjectRoadmap(user, subject, { useAI = true } = {}) {
  if (!user || !subject || !SUBJECT_CURRICULUM[subject]) throw new Error("Invalid roadmap subject.");
  const snapshot = await subjectSnapshot(user._id, subject);
  if (!snapshot.latestAssessment) return null;

  let generated = null;
  if (useAI) {
    try {
      generated = await generateRoadmap({
        studentClass: user.studentClass,
        subject,
        weakTopics: snapshot.weakTopics,
        strongTopics: snapshot.strongTopics,
        aim: AIM_LABELS[user.aim] || "General academic improvement",
        aimDetail: user.aimDetail || "",
        curriculumTopics: SUBJECT_CURRICULUM[subject] || [],
      });
    } catch (error) {
      console.error(`Roadmap AI generation failed for ${subject}; using deterministic roadmap:`, error.message);
    }
  }

  const deterministic = deterministicRoadmap(subject, snapshot, user.studentClass);
  const milestones = createMilestones(subject, generated || deterministic, snapshot, user.studentClass);
  const latestAt = snapshot.latestAssessment.createdAt;

  const roadmap = await Roadmap.findOneAndUpdate(
    { user: user._id, subject },
    {
      user: user._id,
      subject,
      aim: AIM_LABELS[user.aim] || "General academic improvement",
      aimDetail: user.aimDetail || "",
      overview: deterministic.overview,
      milestones,
      generatedAt: new Date(),
      latestAssessmentAt: latestAt,
    },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );

  return roadmap;
}
