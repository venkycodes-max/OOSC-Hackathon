export const SUBJECTS = [
  "Mathematics",
  "Physics",
  "Chemistry",
  "Biology",
  "Computer Science",
  "English",
];

export const SUBJECT_CURRICULUM = {
  Mathematics: [
    "Real Numbers", "Polynomials", "Pair of Linear Equations", "Quadratic Equations", "Arithmetic Progressions",
    "Triangles", "Coordinate Geometry", "Introduction to Trigonometry", "Applications of Trigonometry",
    "Circles", "Areas Related to Circles", "Surface Areas and Volumes", "Statistics", "Probability",
  ],
  Physics: [
    "Light: Reflection and Refraction", "Human Eye and Colourful World", "Electricity", "Magnetic Effects of Electric Current",
    "Sources of Energy", "Motion", "Force and Laws of Motion", "Gravitation", "Work and Energy", "Sound",
  ],
  Chemistry: [
    "Chemical Reactions and Equations", "Acids, Bases and Salts", "Metals and Non-metals", "Carbon and Its Compounds",
    "Periodic Classification of Elements", "Chemical Bonding", "Oxidation and Reduction", "Chemical Equations",
  ],
  Biology: [
    "Life Processes", "Control and Coordination", "How Do Organisms Reproduce?", "Heredity and Evolution",
    "Our Environment", "Natural Resources", "Nutrition", "Respiration", "Transportation", "Excretion",
  ],
  "Computer Science": [
    "Python Basics", "Variables and Data Types", "Conditionals and Loops", "Functions", "Data Structures",
    "SQL", "Databases", "Computer Networks", "HTTP and Web Basics", "Algorithms", "Cyber Safety",
  ],
  English: [
    "Reading Comprehension", "Parts of Speech", "Tenses", "Modals", "Subject-Verb Agreement", "Reported Speech",
    "Active and Passive Voice", "Vocabulary", "Literary Devices", "Poetry", "Prose", "Writing Skills", "Grammar",
  ],
};

// UG branch-specific subjects. For UG users the branch replaces Computer Science
// in the six-subject experience unless the selected branch itself is Computer Science.
SUBJECT_CURRICULUM["Mechanical Engineering"] = [
  "Engineering Mechanics", "Engineering Mathematics", "Thermodynamics", "Fluid Mechanics",
  "Strength of Materials", "Manufacturing Processes", "Machine Design", "Heat Transfer",
  "Materials Science", "Mechanical Measurements", "Dynamics of Machines", "Industrial Engineering",
];
SUBJECT_CURRICULUM["Electrical Engineering"] = [
  "Circuit Analysis", "Engineering Mathematics", "Electrical Machines", "Power Systems",
  "Signals and Systems", "Control Systems", "Power Electronics", "Electrical Measurements",
  "Electromagnetic Fields", "Digital Electronics", "Microprocessors", "Renewable Energy Systems",
];
SUBJECT_CURRICULUM["Electronics & Communication Engineering"] = [
  "Circuit Theory", "Engineering Mathematics", "Electronic Devices", "Analog Electronics",
  "Digital Electronics", "Signals and Systems", "Communication Systems", "Microprocessors and Microcontrollers",
  "Electromagnetic Theory", "Control Systems", "VLSI Fundamentals", "Embedded Systems",
];

export const BRANCH_SUBJECTS = [
  "Computer Science",
  "Mechanical Engineering",
  "Electrical Engineering",
  "Electronics & Communication Engineering",
];

export const ALL_SUBJECTS = [...new Set([...SUBJECTS, ...BRANCH_SUBJECTS])];

export function getSubjectsForUser(userOrClass = "", branch = "") {
  const studentClass = typeof userOrClass === "object" ? userOrClass?.studentClass || "" : userOrClass;
  const selectedBranch = typeof userOrClass === "object" ? userOrClass?.branch || "" : branch;
  const isUGUser = /^UG\s+Year\s+[1-4]$/i.test(String(studentClass).trim());
  const branchSubject = isUGUser && BRANCH_SUBJECTS.includes(selectedBranch) ? selectedBranch : "Computer Science";
  if (isUGUser) return ["Mathematics", "Physics", branchSubject, "English"];
  return ["Mathematics", "Physics", "Chemistry", "Biology", branchSubject, "English"];
}

// Alternate wording commonly produced by an AI model. These are mapped to the
// canonical curriculum above so a valid question is never rejected merely
// because the model used a slightly different textbook heading.
export const SUBJECT_TOPIC_ALIASES = {
  Mathematics: [
    "real numbers", "number systems", "polynomials", "linear equations", "pair of linear equations", "quadratic equations",
    "arithmetic progressions", "triangles", "coordinate geometry", "trigonometry", "introduction to trigonometry",
    "applications of trigonometry", "circles", "areas related to circles", "surface areas", "surface areas and volumes",
    "volumes", "statistics", "probability", "algebra",
  ],
  Physics: [
    "light", "reflection", "refraction", "light reflection and refraction", "human eye", "human eye and colourful world",
    "electricity", "magnetic effects", "magnetic effects of electric current", "magnetism", "sources of energy", "motion",
    "force", "force and laws of motion", "laws of motion", "gravitation", "work", "work and energy", "energy", "sound",
    "current", "resistance", "power",
  ],
  Chemistry: [
    "chemical reactions", "chemical reactions and equations", "chemical equations", "equations", "acids", "bases", "salts",
    "acids bases and salts", "metals", "non metals", "metals and non metals", "carbon compounds", "carbon and its compounds",
    "periodic classification", "periodic classification of elements", "periodic table", "chemical bonding", "oxidation", "reduction",
    "oxidation and reduction", "ph",
  ],
  Biology: [
    "life processes", "control and coordination", "reproduction", "how do organisms reproduce", "heredity", "evolution",
    "heredity and evolution", "our environment", "natural resources", "nutrition", "respiration", "transportation", "transport",
    "excretion", "nervous system", "hormones", "reproductive system", "ecosystem", "food chain", "photosynthesis",
  ],
  "Computer Science": [
    "python", "python basics", "variables and data types", "conditionals and loops", "programming", "functions", "algorithms",
    "data structures", "stack", "queue", "sql", "database", "databases", "computer networks", "networks", "http", "http and web basics",
    "cyber safety", "boolean", "logic",
  ],
  English: [
    "reading comprehension", "comprehension", "parts of speech", "grammar", "tenses", "modals", "subject verb agreement",
    "reported speech", "active voice", "passive voice", "active and passive voice", "voice", "vocabulary", "synonyms", "antonyms",
    "literary devices", "simile", "metaphor", "poetry", "prose", "writing", "writing skills", "letter", "article", "story", "theme",
  ],
};

SUBJECT_TOPIC_ALIASES["Mechanical Engineering"] = [
  "engineering mechanics", "engineering mathematics", "thermodynamics", "fluid mechanics", "strength of materials",
  "manufacturing processes", "machine design", "heat transfer", "materials science", "mechanical measurements",
  "dynamics of machines", "industrial engineering", "statics", "dynamics", "mechanics", "manufacturing",
];
SUBJECT_TOPIC_ALIASES["Electrical Engineering"] = [
  "circuit analysis", "engineering mathematics", "electrical machines", "power systems", "signals and systems",
  "control systems", "power electronics", "electrical measurements", "electromagnetic fields", "digital electronics",
  "microprocessors", "renewable energy systems", "circuits", "electromagnetics",
];
SUBJECT_TOPIC_ALIASES["Electronics & Communication Engineering"] = [
  "circuit theory", "engineering mathematics", "electronic devices", "analog electronics", "digital electronics",
  "signals and systems", "communication systems", "microprocessors and microcontrollers", "electromagnetic theory",
  "control systems", "vlsi fundamentals", "embedded systems", "electronics", "communications",
];

function normalize(value) {
  return String(value || "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function isValidSubject(subject) {
  return SUBJECTS.includes(subject) || BRANCH_SUBJECTS.includes(subject);
}

function phraseMatches(a, b) {
  const x = normalize(a);
  const y = normalize(b);
  if (!x || !y) return false;
  return x === y || x.includes(y) || y.includes(x);
}

const BRANCH_CANONICAL = {
  "Mechanical Engineering": {
    "engineering mechanics": "Engineering Mechanics", "engineering mathematics": "Engineering Mathematics", "thermodynamics": "Thermodynamics",
    "fluid mechanics": "Fluid Mechanics", "strength of materials": "Strength of Materials", "manufacturing processes": "Manufacturing Processes",
    "machine design": "Machine Design", "heat transfer": "Heat Transfer", "materials science": "Materials Science",
    "mechanical measurements": "Mechanical Measurements", "dynamics of machines": "Dynamics of Machines", "industrial engineering": "Industrial Engineering",
    "statics": "Engineering Mechanics", "dynamics": "Dynamics of Machines", "mechanics": "Engineering Mechanics", "manufacturing": "Manufacturing Processes",
  },
  "Electrical Engineering": {
    "circuit analysis": "Circuit Analysis", "engineering mathematics": "Engineering Mathematics", "electrical machines": "Electrical Machines", "power systems": "Power Systems",
    "signals and systems": "Signals and Systems", "control systems": "Control Systems", "power electronics": "Power Electronics", "electrical measurements": "Electrical Measurements",
    "electromagnetic fields": "Electromagnetic Fields", "digital electronics": "Digital Electronics", "microprocessors": "Microprocessors", "renewable energy systems": "Renewable Energy Systems",
    "circuits": "Circuit Analysis", "electromagnetics": "Electromagnetic Fields",
  },
  "Electronics & Communication Engineering": {
    "circuit theory": "Circuit Theory", "engineering mathematics": "Engineering Mathematics", "electronic devices": "Electronic Devices", "analog electronics": "Analog Electronics",
    "digital electronics": "Digital Electronics", "signals and systems": "Signals and Systems", "communication systems": "Communication Systems", "microprocessors and microcontrollers": "Microprocessors and Microcontrollers",
    "electromagnetic theory": "Electromagnetic Theory", "control systems": "Control Systems", "vlsi fundamentals": "VLSI Fundamentals", "embedded systems": "Embedded Systems",
    "electronics": "Electronic Devices", "communications": "Communication Systems",
  },
};

export function canonicalTopicForSubject(topic, subject) {
  if (!isValidSubject(subject) || !topic) return null;
  const curriculum = SUBJECT_CURRICULUM[subject] || [];
  const normalizedTopic = normalize(topic);

  // Prefer exact canonical headings first.
  const exact = curriculum.find((item) => normalize(item) === normalizedTopic);
  if (exact) return exact;

  if (BRANCH_CANONICAL[subject]?.[normalizedTopic]) return BRANCH_CANONICAL[subject][normalizedTopic];

  // Then accept aliases and map them to the correct canonical heading.
  const mappings = {
    Mathematics: {
      "real numbers": "Real Numbers", "number systems": "Real Numbers", "polynomials": "Polynomials",
      "linear equations": "Pair of Linear Equations", "pair of linear equations": "Pair of Linear Equations",
      "quadratic equations": "Quadratic Equations", "arithmetic progressions": "Arithmetic Progressions", "triangles": "Triangles",
      "coordinate geometry": "Coordinate Geometry", "trigonometry": "Introduction to Trigonometry", "introduction to trigonometry": "Introduction to Trigonometry",
      "applications of trigonometry": "Applications of Trigonometry", "circles": "Circles", "areas related to circles": "Areas Related to Circles",
      "surface areas": "Surface Areas and Volumes", "surface areas and volumes": "Surface Areas and Volumes", "volumes": "Surface Areas and Volumes",
      "statistics": "Statistics", "probability": "Probability", "algebra": "Polynomials",
    },
    Physics: {
      "light": "Light: Reflection and Refraction", "reflection": "Light: Reflection and Refraction", "refraction": "Light: Reflection and Refraction",
      "light reflection and refraction": "Light: Reflection and Refraction", "human eye": "Human Eye and Colourful World", "human eye and colourful world": "Human Eye and Colourful World",
      "electricity": "Electricity", "magnetic effects": "Magnetic Effects of Electric Current", "magnetic effects of electric current": "Magnetic Effects of Electric Current",
      "magnetism": "Magnetic Effects of Electric Current", "sources of energy": "Sources of Energy", "motion": "Motion", "force": "Force and Laws of Motion",
      "force and laws of motion": "Force and Laws of Motion", "laws of motion": "Force and Laws of Motion", "gravitation": "Gravitation",
      "work": "Work and Energy", "work and energy": "Work and Energy", "energy": "Work and Energy", "sound": "Sound", "current": "Electricity", "resistance": "Electricity", "power": "Electricity",
    },
    Chemistry: {
      "chemical reactions": "Chemical Reactions and Equations", "chemical reactions and equations": "Chemical Reactions and Equations", "chemical equations": "Chemical Equations", "equations": "Chemical Equations",
      "acids": "Acids, Bases and Salts", "bases": "Acids, Bases and Salts", "salts": "Acids, Bases and Salts", "acids bases and salts": "Acids, Bases and Salts",
      "metals": "Metals and Non-metals", "non metals": "Metals and Non-metals", "metals and non metals": "Metals and Non-metals",
      "carbon compounds": "Carbon and Its Compounds", "carbon and its compounds": "Carbon and Its Compounds", "periodic classification": "Periodic Classification of Elements",
      "periodic classification of elements": "Periodic Classification of Elements", "periodic table": "Periodic Classification of Elements", "chemical bonding": "Chemical Bonding",
      "oxidation": "Oxidation and Reduction", "reduction": "Oxidation and Reduction", "oxidation and reduction": "Oxidation and Reduction", "ph": "Acids, Bases and Salts",
    },
    Biology: {
      "life processes": "Life Processes", "control and coordination": "Control and Coordination", "reproduction": "How Do Organisms Reproduce?", "how do organisms reproduce": "How Do Organisms Reproduce?",
      "heredity": "Heredity and Evolution", "evolution": "Heredity and Evolution", "heredity and evolution": "Heredity and Evolution", "our environment": "Our Environment",
      "natural resources": "Natural Resources", "nutrition": "Nutrition", "respiration": "Respiration", "transportation": "Transportation", "transport": "Transportation", "excretion": "Excretion",
      "nervous system": "Control and Coordination", "hormones": "Control and Coordination", "reproductive system": "How Do Organisms Reproduce?", "ecosystem": "Our Environment", "food chain": "Our Environment", "photosynthesis": "Life Processes",
    },
    "Computer Science": {
      "python": "Python Basics", "python basics": "Python Basics", "variables and data types": "Variables and Data Types", "conditionals and loops": "Conditionals and Loops",
      "programming": "Functions", "functions": "Functions", "algorithms": "Algorithms", "data structures": "Data Structures", "stack": "Data Structures", "queue": "Data Structures",
      "sql": "SQL", "database": "Databases", "databases": "Databases", "computer networks": "Computer Networks", "networks": "Computer Networks", "http": "HTTP and Web Basics", "http and web basics": "HTTP and Web Basics",
      "cyber safety": "Cyber Safety", "boolean": "Conditionals and Loops", "logic": "Conditionals and Loops",
    },
    English: {
      "reading comprehension": "Reading Comprehension", "comprehension": "Reading Comprehension", "parts of speech": "Parts of Speech", "grammar": "Grammar", "tenses": "Tenses", "modals": "Modals",
      "subject verb agreement": "Subject-Verb Agreement", "reported speech": "Reported Speech", "active voice": "Active and Passive Voice", "passive voice": "Active and Passive Voice", "active and passive voice": "Active and Passive Voice", "voice": "Active and Passive Voice",
      "vocabulary": "Vocabulary", "synonyms": "Vocabulary", "antonyms": "Vocabulary", "literary devices": "Literary Devices", "simile": "Literary Devices", "metaphor": "Literary Devices",
      "poetry": "Poetry", "prose": "Prose", "writing": "Writing Skills", "writing skills": "Writing Skills", "letter": "Writing Skills", "article": "Writing Skills", "story": "Prose", "theme": "Reading Comprehension",
    },
  };

  const aliases = SUBJECT_TOPIC_ALIASES[subject] || [];
  for (const alias of aliases) {
    if (!phraseMatches(normalizedTopic, alias)) continue;
    const canonical = mappings[subject]?.[normalize(alias)];
    if (canonical) return canonical;
  }

  // Last-resort matching against canonical headings, but only if the overlap is
  // substantial enough to avoid cross-subject false positives.
  const canonicalMatch = curriculum.find((item) => phraseMatches(normalizedTopic, item));
  if (canonicalMatch) return canonicalMatch;

  // Advanced diagnostic topics are accepted for higher-education assessments
  // without changing the base school curriculum used by ordinary trails.
  const advancedMap = DIAGNOSTIC_TOPIC_ALIASES[subject] || {};
  const advanced = Object.entries(advancedMap).find(([alias]) => normalize(alias) === normalizedTopic);
  return advanced ? advanced[1] : null;
}


export const DIAGNOSTIC_TOPIC_ALIASES = {
  Mathematics: {
    "integrals": "Integrals", "differential calculus": "Differential Calculus", "limits": "Limits",
    "statistics": "Statistics", "probability": "Probability", "linear algebra": "Linear Algebra",
    "complex numbers": "Complex Numbers", "matrices": "Matrices", "vectors": "Vectors",
    "differential equations": "Differential Equations",
  },
  Physics: {
    "classical mechanics": "Classical Mechanics", "electromagnetism": "Electromagnetism",
    "waves": "Waves and Oscillations", "thermodynamics": "Thermodynamics", "quantum physics": "Quantum Physics",
    "optics": "Optics", "modern physics": "Modern Physics",
  },
  Chemistry: {
    "thermodynamics": "Chemical Thermodynamics", "equilibrium": "Chemical Equilibrium", "kinetics": "Chemical Kinetics",
    "organic chemistry": "Organic Chemistry", "inorganic chemistry": "Inorganic Chemistry", "electrochemistry": "Electrochemistry",
    "molecular structure": "Molecular Structure",
  },
  Biology: {
    "cell biology": "Cell Biology", "genetics": "Genetics", "molecular biology": "Molecular Biology",
    "physiology": "Physiology", "ecology": "Ecology", "evolution": "Evolutionary Biology",
  },
  "Computer Science": {
    "object oriented programming": "Object-Oriented Programming", "operating systems": "Operating Systems",
    "computer architecture": "Computer Architecture", "data structures": "Data Structures", "algorithms": "Algorithms",
    "machine learning": "Machine Learning", "software engineering": "Software Engineering", "cybersecurity": "Cybersecurity",
  },
  English: {
    "advanced grammar": "Advanced Grammar", "academic writing": "Academic Writing", "critical reading": "Critical Reading",
    "rhetoric": "Rhetoric", "literary analysis": "Literary Analysis", "argumentation": "Argumentation",
  },
};

export function canonicalDiagnosticTopicForSubject(topic, subject) {
  const base = canonicalTopicForSubject(topic, subject);
  if (base) return base;
  const map = DIAGNOSTIC_TOPIC_ALIASES[subject] || {};
  const normalizedTopic = normalize(topic);
  const exact = Object.entries(map).find(([alias]) => normalize(alias) === normalizedTopic);
  return exact ? exact[1] : null;
}

export function topicBelongsToSubject(topic, subject) {
  return Boolean(canonicalTopicForSubject(topic, subject));
}

export function questionBelongsToSubject(question, subject) {
  if (!question || !isValidSubject(subject)) return false;
  const declared = question.subject || question.subjectName || question.metadata?.subject;
  if (declared && normalize(declared) !== normalize(subject)) return false;
  const canonicalTopic = canonicalTopicForSubject(question.topic, subject);
  if (!canonicalTopic) return false;
  const options = Array.isArray(question.options) ? question.options : [];
  if (!question.question || options.length !== 4 || !question.correctAnswer) return false;
  // Never accept placeholder-only options such as A/B/C/D. The quiz UI must
  // receive the actual answer text, not just the option labels.
  if (options.every((option) => /^[A-D](?:[.)])?$/i.test(String(option).trim()))) return false;
  if (!options.includes(question.correctAnswer)) return false;
  return true;
}

export function normalizeQuestionForSubject(question, subject) {
  if (!questionBelongsToSubject(question, subject)) return null;

  const difficultyMap = {
    easy: "easy",
    medium: "medium",
    hard: "hard",
  };
  const rawDifficulty = normalize(question.difficulty);
  const difficulty = difficultyMap[rawDifficulty] || "easy";

  const options = Array.isArray(question.options)
    ? question.options.map((option) => String(option ?? "").trim())
    : [];
  const correctAnswer = String(question.correctAnswer ?? "").trim();
  const studentAnswer = question.studentAnswer == null ? "" : String(question.studentAnswer).trim();

  return {
    ...question,
    subject,
    topic: canonicalTopicForSubject(question.topic, subject),
    difficulty,
    options,
    correctAnswer,
    studentAnswer,
  };
}

export function validateQuiz(questions, subject, expectedCount = 6) {
  if (!Array.isArray(questions) || questions.length !== expectedCount) return false;
  return questions.every((question) => questionBelongsToSubject(question, subject));
}


export function validateOnboardingDiagnostic(questions, expectedCount = 25, subjects = SUBJECTS, requiredCounts = {}, studentClass = "") {
  if (!Array.isArray(questions) || questions.length !== expectedCount) return false;
  const subjectCounts = Object.fromEntries(subjects.map((subject) => [subject, 0]));
  const difficultyCounts = { easy: 0, medium: 0, hard: 0 };

  for (const question of questions) {
    const subject = subjects.find((item) => normalize(item) === normalize(question?.subject));
    if (!subject) return false;
    if (!canonicalDiagnosticTopicForSubject(question.topic, subject)) return false;
    const options = Array.isArray(question.options) ? question.options : [];
    if (!question.question || options.length !== 4 || !question.correctAnswer || !options.includes(question.correctAnswer)) return false;
    if (options.every((option) => /^[A-D](?:[.)])?$/i.test(String(option).trim()))) return false;
    const difficulty = normalize(question.difficulty);
    if (!Object.prototype.hasOwnProperty.call(difficultyCounts, difficulty)) return false;
    subjectCounts[subject] += 1;
    difficultyCounts[difficulty] += 1;
  }

  const requiredOk = Object.entries(subjectCounts).every(([subject, count]) => count >= (requiredCounts[subject] || 0))
    && Object.keys(requiredCounts).every((subject) => Object.prototype.hasOwnProperty.call(subjectCounts, subject) && subjectCounts[subject] >= requiredCounts[subject]);
  if (!requiredOk) return false;
  if (difficultyCounts.easy !== 8 || difficultyCounts.medium !== 8 || difficultyCounts.hard !== 9) return false;

  // For senior school and every UG level, Mathematics and Physics must be
  // genuinely challenging rather than routine textbook recall. Require at
  // least two hard questions and one explicitly extreme question in each.
  const seniorOrUG = isSeniorOrUG(studentClass);
  if (seniorOrUG) {
    for (const subject of ["Mathematics", "Physics"]) {
      const hardQuestions = questions.filter((q) => normalize(q.subject) === normalize(subject) && normalize(q.difficulty) === "hard");
      if (hardQuestions.length < 2) return false;
      if (!hardQuestions.some((q) => normalize(q.challenge) === "extreme")) return false;
    }
  }

  return true;
}

function isSeniorOrUG(studentClass = "") {
  return isUGClass(studentClass) || /^Class\s+(11|12)$/i.test(String(studentClass).trim());
}

function isUGClass(studentClass = "") {
  return /^UG\s+Year\s+[1-4]$/i.test(String(studentClass).trim());
}
