// Maps a student's saved onboarding stage to the route they should land on,
// so logging back in resumes exactly where they left off.
export function stageToRoute(stage) {
  switch (stage) {
    case "welcome":
      return "/welcome";
    case "assessment":
      return "/assessment";
    case "aim-selection":
      return "/aim";
    case "roadmap-ready":
    case "complete":
      return "/dashboard";
    default:
      return "/welcome";
  }
}

export const AIM_OPTIONS = [
  {
    value: "entrance-exam",
    label: "Entrance Exam",
    description: "JEE, NEET, SAT, or another competitive entrance exam",
  },
  {
    value: "btech-placements",
    label: "B.Tech Placements",
    description: "Campus placements, coding interviews, core branch roles",
  },
  {
    value: "school-college-studies",
    label: "School / College Studies",
    description: "Staying strong across your regular curriculum",
  },
  {
    value: "general-improvement",
    label: "General Improvement",
    description: "No specific exam — just want to get stronger overall",
  },
];

export const CORE_SUBJECTS = ["Mathematics", "Physics", "Chemistry", "Biology", "Computer Science", "English"];
export const BRANCH_SUBJECTS = ["Computer Science", "Mechanical Engineering", "Electrical Engineering", "Electronics & Communication Engineering"];
export const SUBJECTS = CORE_SUBJECTS;

export function getSubjectsForUser(user) {
  const isUG = /^UG\s+Year\s+[1-4]$/i.test(String(user?.studentClass || "").trim());
  const branch = isUG && BRANCH_SUBJECTS.includes(user?.branch) ? user.branch : "Computer Science";
  if (isUG) return ["Mathematics", "Physics", branch, "English"];
  return ["Mathematics", "Physics", "Chemistry", "Biology", branch, "English"];
}
