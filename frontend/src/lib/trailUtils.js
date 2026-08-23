const SUBJECT_CURRICULUM = {
  Mathematics: ["Real Numbers", "Polynomials", "Pair of Linear Equations", "Quadratic Equations", "Arithmetic Progressions", "Triangles", "Coordinate Geometry", "Introduction to Trigonometry", "Applications of Trigonometry", "Circles", "Areas Related to Circles", "Surface Areas and Volumes", "Statistics", "Probability"],
  Physics: ["Light: Reflection and Refraction", "Human Eye and Colourful World", "Electricity", "Magnetic Effects of Electric Current", "Sources of Energy", "Motion", "Force and Laws of Motion", "Gravitation", "Work and Energy", "Sound"],
  Chemistry: ["Chemical Reactions and Equations", "Acids, Bases and Salts", "Metals and Non-metals", "Carbon and Its Compounds", "Periodic Classification of Elements", "Chemical Bonding", "Oxidation and Reduction", "Chemical Equations"],
  Biology: ["Life Processes", "Control and Coordination", "How Do Organisms Reproduce?", "Heredity and Evolution", "Our Environment", "Natural Resources", "Nutrition", "Respiration", "Transportation", "Excretion"],
  "Computer Science": ["Python Basics", "Variables and Data Types", "Conditionals and Loops", "Functions", "Data Structures", "SQL", "Databases", "Computer Networks", "HTTP and Web Basics", "Algorithms", "Cyber Safety"],
  English: ["Reading Comprehension", "Parts of Speech", "Tenses", "Modals", "Subject-Verb Agreement", "Reported Speech", "Active and Passive Voice", "Vocabulary", "Literary Devices", "Poetry", "Prose", "Writing Skills", "Grammar"],
  "Mechanical Engineering": ["Engineering Mechanics", "Engineering Mathematics", "Thermodynamics", "Fluid Mechanics", "Strength of Materials", "Manufacturing Processes", "Machine Design", "Heat Transfer", "Materials Science", "Mechanical Measurements", "Dynamics of Machines", "Industrial Engineering"],
  "Electrical Engineering": ["Circuit Analysis", "Engineering Mathematics", "Electrical Machines", "Power Systems", "Signals and Systems", "Control Systems", "Power Electronics", "Electrical Measurements", "Electromagnetic Fields", "Digital Electronics", "Microprocessors", "Renewable Energy Systems"],
  "Electronics & Communication Engineering": ["Circuit Theory", "Engineering Mathematics", "Electronic Devices", "Analog Electronics", "Digital Electronics", "Signals and Systems", "Communication Systems", "Microprocessors and Microcontrollers", "Electromagnetic Theory", "Control Systems", "VLSI Fundamentals", "Embedded Systems"],
};

const normalizeTopic = (value) => String(value || "").toLowerCase().replace(/[^a-z0-9]+/g, " ").replace(/\s+/g, " ").trim();

const FALLBACK_RESOURCE_TYPES = [
  {
    provider: "Concept guide",
    title: "Step-by-step concept guide",
    buildUrl: ({ subject, topic }) => `https://www.google.com/search?q=${encodeURIComponent(`site:ncert.nic.in ${subject} ${topic} textbook`)}`,
  },
  {
    provider: "Video",
    title: "Visual explanation",
    buildUrl: ({ subject, topic }) => `https://www.youtube.com/results?search_query=${encodeURIComponent(`${subject} ${topic} explained`)}`,
  },
  {
    provider: "Practice",
    title: "Topic practice questions",
    buildUrl: ({ subject, topic }) => `https://www.google.com/search?q=${encodeURIComponent(`${subject} ${topic} practice questions`)}`,
  },
  {
    provider: "Revision",
    title: "Quick revision notes",
    buildUrl: ({ subject, topic }) => `https://www.google.com/search?q=${encodeURIComponent(`${subject} ${topic} revision notes`)}`,
  },
];

export function slugToSubject(slug, subjects = []) {
  return subjects.find((s) => s.toLowerCase().replace(/\s+/g, "-") === slug) ||
    slug.split("-").map((x) => x.charAt(0).toUpperCase() + x.slice(1)).join(" ");
}

export function normalizeMilestones(milestones = [], subject = "") {
  const allowed = new Set((SUBJECT_CURRICULUM[subject] || []).map(normalizeTopic));
  return milestones
    .filter((milestone) => allowed.has(normalizeTopic(milestone.topic)))
    .map((milestone, index) => {
    const topic = milestone.topic || milestone.title || `Phase ${index + 1}`;
    const existing = Array.isArray(milestone.resources) ? milestone.resources : [];
    const resources = existing.map((resource, resourceIndex) => ({
      ...resource,
      provider: resource.provider || "Trailhead",
      title: resource.title || `Resource ${resourceIndex + 1}`,
      searchUrl: resource.searchUrl || resource.url || `https://www.google.com/search?q=${encodeURIComponent(`${subject} ${topic}`)}`,
    }));

    FALLBACK_RESOURCE_TYPES.forEach((resource) => {
      if (resources.length >= 4) return;
      resources.push({
        provider: resource.provider,
        title: resource.title,
        searchUrl: resource.buildUrl({ subject, topic }),
        generated: true,
      });
    });

    return { ...milestone, resources: resources.slice(0, 4) };
  });
}
