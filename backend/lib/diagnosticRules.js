export const ONBOARDING_QUESTION_COUNT = 25;
export const ONBOARDING_DIFFICULTY_COUNTS = { easy: 8, medium: 8, hard: 9 };

// New-account diagnostic distribution.
// UG users get sixteen questions from their selected branch and three each
// from Mathematics, Physics, and English. Biology and Chemistry are not separate
// UG subjects; their old diagnostic slots are redirected into branch questions.
export const ONBOARDING_SUBJECT_COUNTS = {
  Mathematics: 3,
  Physics: 3,
  "Computer Science": 16,
  English: 3,
};

export const UG_BRANCHES = [
  "Computer Science",
  "Mechanical Engineering",
  "Electrical Engineering",
  "Electronics & Communication Engineering",
];

export function isUG(studentClass = "") {
  return /^UG\s+Year\s+[1-4]$/i.test(String(studentClass).trim());
}

export function getOnboardingSubjectCounts(branch = "", studentClass = "") {
  if (isUG(studentClass)) {
    const branchSubject = UG_BRANCHES.includes(branch) ? branch : "Computer Science";
    return {
      Mathematics: 3,
      Physics: 3,
      [branchSubject]: 16,
      English: 3,
    };
  }

  // Five subjects receive four questions and English receives five. This is
  // the closest balanced 25-question split across six subjects.
  return {
    Mathematics: 4,
    Physics: 4,
    Chemistry: 4,
    Biology: 4,
    "Computer Science": 4,
    English: 5,
  };
}

export function questionLevelInstruction(studentClass) {
  if (isUG(studentClass)) {
    const year = Number(String(studentClass).match(/(\d+)/)?.[1] || 1);
    const target = Math.min(year + 1, 4);
    return `The student is in UG Year ${year}. Assess around UG Year ${target} / early advanced-undergraduate level. Easy is still conceptually meaningful, medium should be at least one academic step above the selected year, and hard must be above the selected year. For Mathematics and Physics, hard questions should be genuinely difficult and 1-2 hard questions should be EXTREME/competitive level. Do not use Class 10/12-style arithmetic or recall for UG Mathematics or Physics.`;
  }

  const match = String(studentClass).match(/Class\s+(\d+)/i);
  if (match) {
    const grade = Number(match[1]);
    const target = Math.min(12, grade + 1);
    const seniorRule = grade >= 11
      ? `For Mathematics and Physics, keep the hard tier genuinely hard and include 1-2 EXTREME/competitive questions. Do not fill the test with routine textbook calculations.`
      : `Keep the overall difficulty appropriate to the student's stage while ensuring the hard tier is meaningfully challenging.`;
    return `The student selected Class ${grade}. Assess around Class ${target}. Easy may be current-class accessible, medium should be around one level above, and hard should stretch beyond that level. ${seniorRule}`;
  }

  return `Use the selected level as the baseline, deliberately test one academic level above it, and include a few genuinely challenging questions.`;
}
