// Deterministic fallback for the NEW-ACCOUNT overall diagnostic.
// The AI normally generates the questions; this bank guarantees the contract
// when the AI is unavailable or returns invalid content.
import { ONBOARDING_QUESTION_COUNT, getOnboardingSubjectCounts, isUG } from "./diagnosticRules.js";

const q = (subject, topic, difficulty, question, options, correctAnswer, challenge = "standard") => ({
  subject, topic, difficulty, question, options, correctAnswer,
  ...(challenge === "extreme" ? { challenge } : {}),
});

// Non-UG baseline: 4 Math, 4 Physics, 4 Chemistry, 4 Biology, 4 CS, 5 English.
// Math/Physics deliberately use a stronger hard tier for Classes 11-12; the
// normal school-level questions remain useful for lower classes when used as a
// deterministic fallback.
const SCHOOL_BANK = [
  // Mathematics — 4
  q("Mathematics", "Quadratic Equations", "medium", "If x² - 7x + 10 = 0, which value is the larger root?", ["2", "5", "7", "10"], "5"),
  q("Mathematics", "Statistics", "hard", "For data with mean 20 and variance 16, every observation is increased by 3. What is the new variance?", ["13", "16", "19", "25"], "16", "extreme"),
  q("Mathematics", "Probability", "hard", "Two fair dice are rolled. What is the probability that their sum is a prime number?", ["1/3", "5/12", "1/2", "7/18"], "5/12", "extreme"),
  q("Mathematics", "Applications of Trigonometry", "hard", "If tan θ = 3/4 for an acute angle θ, what is sin θ?", ["3/5", "4/5", "3/4", "4/3"], "3/5", "extreme"),

  // Physics — 4
  q("Physics", "Motion", "medium", "A particle starts from rest with constant acceleration 4 m/s². How far does it travel in 3 s?", ["6 m", "12 m", "18 m", "36 m"], "18 m"),
  q("Physics", "Electricity", "hard", "Two resistors 6 Ω and 3 Ω are connected in parallel to a 12 V source. What is the total current?", ["2 A", "4 A", "6 A", "8 A"], "6 A", "extreme"),
  q("Physics", "Work and Energy", "hard", "A 2 kg body moving at 10 m/s climbs without energy loss. What maximum vertical height can it reach? Take g = 10 m/s².", ["2.5 m", "5 m", "10 m", "20 m"], "5 m", "extreme"),
  q("Physics", "Magnetic Effects of Electric Current", "hard", "A charged particle enters a uniform magnetic field perpendicular to it. Which quantity remains constant during the circular motion?", ["Velocity vector", "Speed", "Direction of velocity", "Position vector"], "Speed", "extreme"),

  // Chemistry — 4
  q("Chemistry", "Chemical Reactions and Equations", "easy", "Which type of reaction forms a single product from two or more reactants?", ["Combination", "Decomposition", "Displacement", "Double displacement"], "Combination"),
  q("Chemistry", "Acids, Bases and Salts", "easy", "A solution with pH 3 is how many times more acidic than a solution with pH 5?", ["2", "10", "100", "1000"], "100"),
  q("Chemistry", "Chemical Bonding", "medium", "Which bond results primarily from transfer of electrons between a metal and a non-metal?", ["Ionic", "Metallic", "Hydrogen", "Coordinate"], "Ionic"),
  q("Chemistry", "Oxidation and Reduction", "easy", "In a redox reaction, the species that loses electrons acts as the:", ["Oxidising agent", "Reducing agent", "Catalyst", "Solvent"], "Reducing agent"),

  // Biology — 4
  q("Biology", "Life Processes", "easy", "What is the main site of gas exchange in human lungs?", ["Bronchi", "Alveoli", "Trachea", "Diaphragm"], "Alveoli"),
  q("Biology", "Heredity and Evolution", "easy", "In a Tt × Tt cross, what fraction of offspring is expected to be tt?", ["0%", "25%", "50%", "75%"], "25%"),
  q("Biology", "Control and Coordination", "medium", "Which part of a neuron receives signals from other neurons?", ["Axon", "Dendrite", "Myelin sheath", "Synaptic cleft"], "Dendrite"),
  q("Biology", "Our Environment", "hard", "If producers in an ecosystem store 10,000 units of energy, approximately how much reaches primary consumers under the ten-percent law?", ["100 units", "1,000 units", "5,000 units", "9,000 units"], "1,000 units"),

  // Computer Science — 4
  q("Computer Science", "SQL", "easy", "Which SQL clause filters rows before grouping?", ["WHERE", "HAVING", "ORDER BY", "GROUP BY"], "WHERE"),
  q("Computer Science", "Algorithms", "medium", "Binary search on a sorted array has which worst-case time complexity?", ["O(1)", "O(log n)", "O(n)", "O(n²)"], "O(log n)"),
  q("Computer Science", "Data Structures", "medium", "Which data structure is most directly associated with breadth-first search?", ["Stack", "Queue", "Heap", "Hash table"], "Queue"),
  q("Computer Science", "Databases", "hard", "A database index is primarily used to:", ["Speed up data retrieval", "Encrypt every row", "Replace all primary keys", "Remove duplicate tables"], "Speed up data retrieval"),

  // English — 5
  q("English", "Reading Comprehension", "easy", "An inference from a passage is best described as:", ["A conclusion supported by clues", "A copied sentence", "A heading", "A punctuation mark"], "A conclusion supported by clues"),
  q("English", "Vocabulary", "easy", "Which word is closest in meaning to 'meticulous'?", ["Careless", "Thorough", "Hasty", "Uncertain"], "Thorough"),
  q("English", "Reported Speech", "medium", "Choose the correct reported form: She said, 'I have finished my work.'", ["She said that she had finished her work.", "She said that I have finished my work.", "She says that she had finished her work.", "She told that she has finished her work."], "She said that she had finished her work."),
  q("English", "Writing Skills", "medium", "Which sentence is the clearest formal revision of 'Due to the fact that it was raining, the match was cancelled'?", ["Because it was raining, the match was cancelled.", "The match, due to the fact of rain, was cancelled.", "Rain being a fact, cancellation occurred.", "It was due to rain that the match did cancellation."], "Because it was raining, the match was cancelled."),
  q("English", "Literary Devices", "hard", "'The wind whispered through the trees' primarily uses which literary device?", ["Personification", "Hyperbole", "Oxymoron", "Allusion"], "Personification"),
];

// UG common-subject baseline: 3 questions per common subject. Mathematics and
// Physics contain no trivial recall; their hard items are explicitly extreme.
const UG_CORE_BANK = [
  q("Mathematics", "Integrals", "medium", "Evaluate ∫₀¹ x² dx.", ["1/6", "1/3", "1/2", "1"], "1/3"),
  q("Mathematics", "Statistics", "hard", "For independent observations with variance σ², the variance of the sample mean of n observations is:", ["σ²n", "σ²/n", "σ/n", "n/σ²"], "σ²/n", "extreme"),
  q("Mathematics", "Probability", "hard", "A fair random variable X takes values 1, 2, 3 with probabilities 1/6, 1/3, 1/2. What is E[X]?", ["13/6", "7/3", "5/2", "8/3"], "7/3", "extreme"),

  q("Physics", "Motion", "medium", "For a particle in simple harmonic motion, the magnitude of acceleration is proportional to:", ["Displacement", "Velocity", "Time only", "Inverse of displacement"], "Displacement"),
  q("Physics", "Electricity", "hard", "A capacitor C is charged to voltage V. Its stored electrostatic energy is:", ["CV", "CV²", "½CV²", "2CV²"], "½CV²", "extreme"),
  q("Physics", "Magnetic Effects of Electric Current", "hard", "A charged particle enters a uniform magnetic field perpendicular to it. If its speed doubles, its circular orbit radius becomes:", ["Half", "Unchanged", "Double", "Four times"], "Double", "extreme"),

  q("English", "Reading Comprehension", "easy", "An author's unstated assumption is best described as:", ["A premise the argument relies on", "A spelling error", "A direct quotation", "A section heading"], "A premise the argument relies on"),
  q("English", "Writing Skills", "easy", "Which sentence is most appropriate for a formal academic report?", ["The results indicate a significant increase in accuracy.", "The results are super cool and way better.", "The results kinda show a big jump.", "The results, you know, got bigger."], "The results indicate a significant increase in accuracy."),
  q("English", "Literary Devices", "medium", "Which rhetorical device deliberately places contrasting ideas in parallel structure?", ["Antithesis", "Onomatopoeia", "Alliteration", "Euphemism"], "Antithesis"),
];

const BRANCH_BANKS = {
  "Computer Science": [
    q("Computer Science", "Algorithms", "medium", "Which data structure is most directly associated with breadth-first search?", ["Stack", "Queue", "Heap", "Hash table"], "Queue"),
    q("Computer Science", "SQL", "easy", "Which SQL clause filters groups after aggregation?", ["WHERE", "HAVING", "ORDER BY", "FROM"], "HAVING"),
    q("Computer Science", "Databases", "easy", "A candidate key is a:", ["Minimal attribute set that uniquely identifies a row", "Foreign key copied from another table", "Non-unique descriptive column", "Database backup"], "Minimal attribute set that uniquely identifies a row"),
    q("Computer Science", "Data Structures", "medium", "What is the average-case lookup complexity of a well-designed hash table?", ["O(1)", "O(log n)", "O(n)", "O(n log n)"], "O(1)"),
    q("Computer Science", "Algorithms", "medium", "Which sorting algorithm has worst-case O(n log n) time and can be implemented in-place with careful partitioning?", ["Quick sort", "Bubble sort", "Insertion sort", "Selection sort"], "Quick sort"),
    q("Computer Science", "Computer Networks", "medium", "Which protocol provides reliable, ordered byte-stream delivery between hosts?", ["UDP", "IP", "TCP", "ARP"], "TCP"),
    q("Computer Science", "Algorithms", "hard", "A directed acyclic graph can be topologically sorted because:", ["It contains no directed cycle", "Every vertex has degree two", "It is necessarily connected", "Every edge is bidirectional"], "It contains no directed cycle"),
    q("Computer Science", "Databases", "hard", "Third normal form removes which kind of dependency among non-key attributes?", ["Transitive dependency", "Functional dependency", "Candidate-key dependency", "Referential integrity"], "Transitive dependency"),
    q("Computer Science", "HTTP and Web Basics", "hard", "Which HTTP status code most directly indicates that a request was understood but authorization is insufficient?", ["401", "403", "404", "500"], "403"),
    q("Computer Science", "Algorithms", "hard", "For an adjacency-list representation of a graph with V vertices and E edges, BFS runs in:", ["O(V + E)", "O(VE)", "O(V²E)", "O(E²)"], "O(V + E)"),
    q("Computer Science", "Programming", "easy", "Which Python data type stores an ordered, changeable collection of items?", ["List", "Tuple", "Set", "String"], "List"),
    q("Computer Science", "Operating Systems", "easy", "Which component of an operating system manages processes and allocates CPU time?", ["Scheduler", "Compiler", "Web browser", "Text editor"], "Scheduler"),
    q("Computer Science", "Computer Networks", "easy", "Which device forwards packets between different networks?", ["Router", "Keyboard", "Monitor", "Printer"], "Router"),
    q("Computer Science", "Databases", "easy", "Which SQL command adds a new row to a table?", ["INSERT", "UPDATE", "SELECT", "ALTER"], "INSERT"),
    q("Computer Science", "Algorithms", "medium", "If a balanced binary search tree contains n nodes, search typically takes:", ["O(1)", "O(log n)", "O(n)", "O(n²)"], "O(log n)"),
    q("Computer Science", "Operating Systems", "hard", "A process waiting indefinitely for a resource held by another process is a classic symptom of:", ["Deadlock", "Compilation", "Caching", "Paging"], "Deadlock"),
  ],
  "Mechanical Engineering": [
    q("Mechanical Engineering", "Engineering Mechanics", "easy", "For a body in static equilibrium, the resultant force must be:", ["Zero", "Maximum", "Equal to mass", "Equal to velocity"], "Zero"),
    q("Mechanical Engineering", "Engineering Mathematics", "medium", "The derivative of x² with respect to x is:", ["x", "2x", "x²", "2"], "2x"),
    q("Mechanical Engineering", "Materials Science", "easy", "The property describing resistance to permanent deformation under load is:", ["Yield strength", "Density", "Thermal conductivity", "Specific heat"], "Yield strength"),
    q("Mechanical Engineering", "Thermodynamics", "medium", "For an ideal gas undergoing reversible isothermal expansion, the change in internal energy is:", ["Positive", "Negative", "Zero", "Equal to work input"], "Zero"),
    q("Mechanical Engineering", "Fluid Mechanics", "medium", "For incompressible steady flow, the continuity equation expresses conservation of:", ["Mass", "Temperature", "Viscosity", "Entropy"], "Mass"),
    q("Mechanical Engineering", "Strength of Materials", "medium", "For a uniform circular shaft in torsion, shear stress is greatest at the:", ["Center", "Outer surface", "Mid-radius only", "Neutral axis"], "Outer surface"),
    q("Mechanical Engineering", "Thermodynamics", "hard", "For an ideal gas, the ratio Cp/Cv is greater than one because:", ["Cp includes work associated with expansion at constant pressure", "Cv is always zero", "Cp is independent of temperature", "Cv measures entropy directly"], "Cp includes work associated with expansion at constant pressure"),
    q("Mechanical Engineering", "Fluid Mechanics", "hard", "For inviscid incompressible flow along a streamline, increasing velocity generally causes static pressure to:", ["Increase", "Decrease", "Remain identical in all cases", "Become zero"], "Decrease"),
    q("Mechanical Engineering", "Heat Transfer", "hard", "In one-dimensional steady conduction through a plane wall with constant k and no heat generation, the temperature profile is:", ["Linear", "Parabolic", "Exponential", "Sinusoidal"], "Linear"),
    q("Mechanical Engineering", "Dynamics of Machines", "hard", "For a simple harmonic oscillator, the natural frequency increases when the stiffness is:", ["Increased", "Decreased", "Set to zero", "Made independent of mass"], "Increased"),
    q("Mechanical Engineering", "Manufacturing Processes", "easy", "Which process is commonly used to remove material using a rotating multi-point cutting tool?", ["Milling", "Casting", "Forging", "Welding"], "Milling"),
    q("Mechanical Engineering", "Materials Science", "easy", "Which material property measures resistance to scratching or indentation?", ["Hardness", "Ductility", "Density", "Conductivity"], "Hardness"),
    q("Mechanical Engineering", "Thermodynamics", "easy", "The SI unit of pressure is:", ["Pascal", "Joule", "Watt", "Newton"], "Pascal"),
    q("Mechanical Engineering", "Fluid Mechanics", "easy", "For an incompressible fluid, increasing the pipe area in steady flow generally causes velocity to:", ["Decrease", "Increase", "Become infinite", "Remain unrelated to area"], "Decrease"),
    q("Mechanical Engineering", "Heat Transfer", "medium", "For a plane wall with constant thermal conductivity and no heat generation, steady one-dimensional heat flux is proportional to:", ["The temperature gradient", "The square of temperature", "Pressure only", "Wall mass"], "The temperature gradient"),
    q("Mechanical Engineering", "Strength of Materials", "hard", "For a slender column under axial compression, increasing its unsupported length generally makes the critical buckling load:", ["Decrease", "Increase", "Unchanged", "Equal to yield strength"], "Decrease"),
  ],
  "Electrical Engineering": [
    q("Electrical Engineering", "Circuit Analysis", "easy", "In a purely resistive DC circuit, voltage and current obey:", ["V = IR", "V = I/R", "V = R/I", "V = I + R"], "V = IR"),
    q("Electrical Engineering", "Engineering Mathematics", "medium", "The derivative of sin x is:", ["cos x", "-cos x", "sin x", "-sin x"], "cos x"),
    q("Electrical Engineering", "Electrical Measurements", "easy", "An ideal voltmeter is connected:", ["In parallel", "In series", "Only across ground", "Only across a capacitor"], "In parallel"),
    q("Electrical Engineering", "Circuit Analysis", "medium", "In a series RLC circuit at resonance, the impedance is ideally:", ["Minimum", "Maximum", "Infinite", "Purely capacitive"], "Minimum"),
    q("Electrical Engineering", "Signals and Systems", "medium", "A stable continuous-time LTI system has an absolutely integrable impulse response. This condition ensures:", ["BIBO stability", "Zero bandwidth", "Infinite gain", "Non-causality"], "BIBO stability"),
    q("Electrical Engineering", "Electrical Machines", "medium", "A transformer operates on the principle of:", ["Mutual induction", "Electrolysis", "Photoelectric emission", "Thermal expansion"], "Mutual induction"),
    q("Electrical Engineering", "Power Systems", "hard", "For a balanced three-phase system, instantaneous total power is:", ["Constant", "Always zero", "Purely sinusoidal at line frequency", "Dependent only on frequency"], "Constant"),
    q("Electrical Engineering", "Control Systems", "hard", "A pole in the right half of the s-plane indicates a continuous-time linear system is:", ["Unstable", "Always critically damped", "Always minimum phase", "Guaranteed to have zero steady-state error"], "Unstable"),
    q("Electrical Engineering", "Electromagnetic Fields", "hard", "Gauss's law for electricity relates electric flux through a closed surface to:", ["Enclosed charge", "Current density only", "Magnetic flux", "Resistance"], "Enclosed charge"),
    q("Electrical Engineering", "Power Electronics", "hard", "An ideal buck converter primarily produces an output voltage that is:", ["Lower than the input", "Higher than the input", "Always equal to input", "Always negative"], "Lower than the input"),
    q("Electrical Engineering", "Circuit Analysis", "easy", "The SI unit of electrical resistance is:", ["Ohm", "Volt", "Ampere", "Farad"], "Ohm"),
    q("Electrical Engineering", "Digital Electronics", "easy", "A basic AND gate outputs 1 when:", ["All inputs are 1", "Any input is 1", "All inputs are 0", "Inputs are different"], "All inputs are 1"),
    q("Electrical Engineering", "Electrical Machines", "easy", "A transformer normally changes AC voltage by electromagnetic:", ["Induction", "Electrolysis", "Friction", "Photoemission"], "Induction"),
    q("Electrical Engineering", "Power Systems", "easy", "The main purpose of a circuit breaker is to:", ["Interrupt fault current", "Increase voltage", "Store charge", "Generate power"], "Interrupt fault current"),
    q("Electrical Engineering", "Signals and Systems", "medium", "For a sinusoidal steady-state circuit, impedance is commonly represented using:", ["Complex numbers", "Only positive integers", "Boolean values", "ASCII codes"], "Complex numbers"),
    q("Electrical Engineering", "Control Systems", "hard", "For a continuous-time closed-loop system, a pole in the right half of the s-plane generally indicates:", ["Instability", "Guaranteed stability", "Zero bandwidth", "Perfect tracking"], "Instability"),
  ],
  "Electronics & Communication Engineering": [
    q("Electronics & Communication Engineering", "Circuit Theory", "easy", "Kirchhoff's current law follows conservation of:", ["Charge", "Energy only", "Momentum", "Mass only"], "Charge"),
    q("Electronics & Communication Engineering", "Engineering Mathematics", "medium", "The derivative of eˣ is:", ["eˣ", "xeˣ", "1/eˣ", "ln x"], "eˣ"),
    q("Electronics & Communication Engineering", "Electronic Devices", "easy", "In the active region of a BJT amplifier, the base-emitter junction is:", ["Forward biased", "Reverse biased", "Open circuit", "Always unbiased"], "Forward biased"),
    q("Electronics & Communication Engineering", "Analog Electronics", "medium", "An ideal operational amplifier has approximately:", ["Infinite open-loop gain", "Zero input impedance", "Infinite output impedance", "Zero bandwidth"], "Infinite open-loop gain"),
    q("Electronics & Communication Engineering", "Digital Electronics", "medium", "A flip-flop is primarily used to store:", ["One bit of state", "One byte only", "An analog waveform", "A carrier signal"], "One bit of state"),
    q("Electronics & Communication Engineering", "Signals and Systems", "medium", "The Nyquist rate for a band-limited signal with highest frequency B is:", ["B", "2B", "B/2", "4B"], "2B"),
    q("Electronics & Communication Engineering", "Communication Systems", "hard", "In amplitude modulation, the modulation index mainly determines the:", ["Relative amplitude of the sidebands", "Carrier frequency alone", "Propagation speed", "Sampling interval"], "Relative amplitude of the sidebands"),
    q("Electronics & Communication Engineering", "Signals and Systems", "hard", "Sampling a signal below the Nyquist rate can produce:", ["Aliasing", "Quantization noise only", "Zero bandwidth", "Perfect reconstruction"], "Aliasing"),
    q("Electronics & Communication Engineering", "Electromagnetic Theory", "hard", "For a plane electromagnetic wave in free space, electric and magnetic fields are:", ["Mutually perpendicular and perpendicular to propagation", "Parallel to each other", "Both parallel to propagation", "Always zero"], "Mutually perpendicular and perpendicular to propagation"),
    q("Electronics & Communication Engineering", "VLSI Fundamentals", "hard", "Reducing CMOS dynamic power at a fixed activity factor is most directly achieved by reducing:", ["Capacitance, voltage, or switching frequency", "Only transistor count", "Only threshold voltage", "Only package size"], "Capacitance, voltage, or switching frequency"),
    q("Electronics & Communication Engineering", "Digital Electronics", "easy", "Which logic gate gives the complement of its input?", ["NOT", "AND", "OR", "XOR"], "NOT"),
    q("Electronics & Communication Engineering", "Electronic Devices", "easy", "A diode ideally conducts current mainly when it is:", ["Forward biased", "Reverse biased", "Unbiased only", "Disconnected"], "Forward biased"),
    q("Electronics & Communication Engineering", "Communication Systems", "easy", "Which quantity is measured in hertz?", ["Frequency", "Voltage", "Power", "Resistance"], "Frequency"),
    q("Electronics & Communication Engineering", "Microprocessors and Microcontrollers", "easy", "A microcontroller typically combines a processor with memory and:", ["Peripherals", "Only a transformer", "Only an antenna", "Only a battery"], "Peripherals"),
    q("Electronics & Communication Engineering", "Signals and Systems", "medium", "Sampling a band-limited signal at exactly twice its highest frequency is the theoretical:", ["Nyquist rate", "Carrier rate", "Bit error rate", "Modulation index"], "Nyquist rate"),
    q("Electronics & Communication Engineering", "VLSI Fundamentals", "hard", "Reducing supply voltage in CMOS logic most directly reduces dynamic power approximately in proportion to:", ["The square of voltage", "Voltage itself only", "The cube of voltage", "The inverse of voltage"], "The square of voltage"),
  ],
};

function assertBankContract(bank, counts) {
  if (bank.length !== ONBOARDING_QUESTION_COUNT) throw new Error(`Onboarding fallback has ${bank.length} questions; expected ${ONBOARDING_QUESTION_COUNT}.`);
  const subjectCounts = {};
  const difficultyCounts = { easy: 0, medium: 0, hard: 0 };
  for (const item of bank) {
    subjectCounts[item.subject] = (subjectCounts[item.subject] || 0) + 1;
    difficultyCounts[item.difficulty] += 1;
  }
  for (const [subject, required] of Object.entries(counts)) {
    if ((subjectCounts[subject] || 0) !== required) throw new Error(`Fallback distribution mismatch for ${subject}: ${subjectCounts[subject] || 0}/${required}.`);
  }
  if (difficultyCounts.easy !== 8 || difficultyCounts.medium !== 8 || difficultyCounts.hard !== 9) {
    throw new Error(`Fallback difficulty distribution mismatch: ${JSON.stringify(difficultyCounts)}.`);
  }
}

export function getOnboardingDiagnostic({ studentClass = "", branch = "" } = {}) {
  if (!isUG(studentClass)) {
    const counts = getOnboardingSubjectCounts(branch, studentClass);
    assertBankContract(SCHOOL_BANK, counts);
    return SCHOOL_BANK.map((question) => ({ ...question, branch }));
  }

  const branchSubject = branch || "Computer Science";
  const branchQuestions = BRANCH_BANKS[branchSubject] || BRANCH_BANKS["Computer Science"];
  const bank = [...UG_CORE_BANK, ...branchQuestions];
  const counts = getOnboardingSubjectCounts(branchSubject, studentClass);
  assertBankContract(bank, counts);
  return bank.map((question) => ({ ...question, branch }));
}
