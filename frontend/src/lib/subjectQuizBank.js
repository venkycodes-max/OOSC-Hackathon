// Safety-net quizzes used only when the backend returns a quiz for the wrong subject.
// This prevents a Biology question from ever being shown inside a Mathematics quiz.
export const SUBJECT_QUIZ_BANK = {
  Mathematics: [
    { question: "If the roots of x² - 5x + 6 = 0 are α and β, what is α + β?", topic: "Quadratic Equations", difficulty: "easy", options: ["5", "6", "-5", "-6"], correctAnswer: "5" },
    { question: "The HCF of 36 and 48 is:", topic: "Real Numbers", difficulty: "easy", options: ["6", "8", "12", "18"], correctAnswer: "12" },
    { question: "The distance between (0, 0) and (3, 4) is:", topic: "Coordinate Geometry", difficulty: "easy", options: ["3", "4", "5", "7"], correctAnswer: "5" },
    { question: "If tan θ = 1 and θ is acute, θ equals:", topic: "Trigonometry", difficulty: "easy", options: ["30°", "45°", "60°", "90°"], correctAnswer: "45°" },
    { question: "The probability of getting a head when a fair coin is tossed once is:", topic: "Probability", difficulty: "easy", options: ["0", "1/4", "1/2", "1"], correctAnswer: "1/2" },
    { question: "The 10th term of the AP 3, 7, 11, ... is:", topic: "Arithmetic Progressions", difficulty: "medium", options: ["35", "39", "43", "47"], correctAnswer: "39" },
  ],
  Physics: [
    { question: "The SI unit of electric current is:", topic: "Electricity", difficulty: "easy", options: ["Volt", "Ampere", "Ohm", "Watt"], correctAnswer: "Ampere" },
    { question: "Which lens is used to correct myopia?", topic: "Light", difficulty: "easy", options: ["Convex lens", "Concave lens", "Cylindrical lens", "Plane glass"], correctAnswer: "Concave lens" },
    { question: "The resistance of a conductor is measured in:", topic: "Electricity", difficulty: "easy", options: ["Ohm", "Joule", "Coulomb", "Tesla"], correctAnswer: "Ohm" },
    { question: "The image formed by a plane mirror is:", topic: "Light", difficulty: "easy", options: ["Real and inverted", "Virtual and erect", "Real and erect", "Virtual and inverted"], correctAnswer: "Virtual and erect" },
    { question: "The commercial unit of electrical energy is:", topic: "Electricity", difficulty: "easy", options: ["Watt", "Volt", "Kilowatt-hour", "Ampere"], correctAnswer: "Kilowatt-hour" },
    { question: "A device that converts electrical energy into mechanical energy is:", topic: "Magnetic Effects", difficulty: "medium", options: ["Generator", "Motor", "Transformer", "Cell"], correctAnswer: "Motor" },
  ],
  Chemistry: [
    { question: "A solution with pH 2 is:", topic: "Acids, Bases and Salts", difficulty: "easy", options: ["Strongly acidic", "Weakly acidic", "Neutral", "Basic"], correctAnswer: "Strongly acidic" },
    { question: "The functional group -COOH is called:", topic: "Carbon Compounds", difficulty: "easy", options: ["Alcohol", "Aldehyde", "Carboxylic acid", "Ketone"], correctAnswer: "Carboxylic acid" },
    { question: "Which gas is evolved when an acid reacts with a metal carbonate?", topic: "Chemical Reactions", difficulty: "easy", options: ["Oxygen", "Hydrogen", "Carbon dioxide", "Nitrogen"], correctAnswer: "Carbon dioxide" },
    { question: "The process of coating iron with zinc is called:", topic: "Metals and Non-metals", difficulty: "easy", options: ["Alloying", "Galvanisation", "Roasting", "Calcination"], correctAnswer: "Galvanisation" },
    { question: "Ethanol belongs to which class of compounds?", topic: "Carbon Compounds", difficulty: "easy", options: ["Alcohols", "Alkenes", "Carboxylic acids", "Esters"], correctAnswer: "Alcohols" },
    { question: "Which of the following is a strong base?", topic: "Acids, Bases and Salts", difficulty: "medium", options: ["NaOH", "CH3COOH", "H2CO3", "H2O"], correctAnswer: "NaOH" },
  ],
  Biology: [
    { question: "The basic structural and functional unit of the nervous system is:", topic: "Control and Coordination", difficulty: "easy", options: ["Neuron", "Nephron", "Alveolus", "Villus"], correctAnswer: "Neuron" },
    { question: "Photosynthesis mainly occurs in which organelle?", topic: "Life Processes", difficulty: "easy", options: ["Nucleus", "Chloroplast", "Mitochondrion", "Ribosome"], correctAnswer: "Chloroplast" },
    { question: "Which blood vessel carries oxygenated blood from the lungs to the heart?", topic: "Life Processes", difficulty: "easy", options: ["Pulmonary artery", "Pulmonary vein", "Aorta", "Vena cava"], correctAnswer: "Pulmonary vein" },
    { question: "The hereditary material in most organisms is:", topic: "Heredity", difficulty: "easy", options: ["Protein", "DNA", "Lipid", "Starch"], correctAnswer: "DNA" },
    { question: "Which part of a flower receives pollen grains?", topic: "How Do Organisms Reproduce?", difficulty: "easy", options: ["Anther", "Filament", "Stigma", "Ovary"], correctAnswer: "Stigma" },
    { question: "The ozone layer protects Earth mainly from:", topic: "Our Environment", difficulty: "medium", options: ["Infrared rays", "Ultraviolet rays", "Radio waves", "Sound waves"], correctAnswer: "Ultraviolet rays" },
  ],
  "Computer Science": [
    { question: "Which data structure follows FIFO order?", topic: "Data Structures", difficulty: "easy", options: ["Stack", "Queue", "Tree", "Graph"], correctAnswer: "Queue" },
    { question: "Which symbol starts a single-line comment in Python?", topic: "Python Basics", difficulty: "easy", options: ["//", "#", "--", "/*"], correctAnswer: "#" },
    { question: "Which SQL command is used to retrieve data?", topic: "SQL", difficulty: "easy", options: ["GET", "SELECT", "FETCHROW", "READ"], correctAnswer: "SELECT" },
    { question: "A primary key in a relational table must be:", topic: "Databases", difficulty: "easy", options: ["Duplicated", "Nullable", "Unique", "Text only"], correctAnswer: "Unique" },
    { question: "Which of these is a Boolean value in Python?", topic: "Python Basics", difficulty: "easy", options: ["maybe", "True", "truth", "yes"], correctAnswer: "True" },
    { question: "Which protocol is commonly used to load web pages?", topic: "Networks", difficulty: "medium", options: ["HTTP", "FTP", "SMTP", "SSH"], correctAnswer: "HTTP" },
  ],
  English: [
    { question: "Choose the correct passive form: 'The teacher praised the student.'", topic: "Grammar", difficulty: "easy", options: ["The student was praised by the teacher.", "The student praised the teacher.", "The teacher was praised by the student.", "The student is praising the teacher."], correctAnswer: "The student was praised by the teacher." },
    { question: "Which word is an adjective in 'She wore a beautiful dress'?", topic: "Parts of Speech", difficulty: "easy", options: ["She", "wore", "beautiful", "dress"], correctAnswer: "beautiful" },
    { question: "Choose the synonym of 'rapid'.", topic: "Vocabulary", difficulty: "easy", options: ["Slow", "Quick", "Weak", "Late"], correctAnswer: "Quick" },
    { question: "Which figure of speech compares two things using 'like' or 'as'?", topic: "Literary Devices", difficulty: "easy", options: ["Metaphor", "Simile", "Irony", "Personification"], correctAnswer: "Simile" },
    { question: "Choose the correct reported speech: He said, 'I am tired.'", topic: "Grammar", difficulty: "medium", options: ["He said that he was tired.", "He says he is tired.", "He said that I am tired.", "He told that he is tired."], correctAnswer: "He said that he was tired." },
    { question: "The central message of a story is its:", topic: "Reading Comprehension", difficulty: "easy", options: ["Setting", "Theme", "Character", "Dialogue"], correctAnswer: "Theme" },
  ],
};

export function getSubjectQuiz(subject, count = 5) {
  const bank = SUBJECT_QUIZ_BANK[subject] || [];
  return [...bank].sort(() => Math.random() - 0.5).slice(0, Math.min(count, bank.length));
}
