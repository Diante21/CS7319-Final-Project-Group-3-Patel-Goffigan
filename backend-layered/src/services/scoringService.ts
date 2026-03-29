import { SectionScore, KeywordAnalysis, AnalysisResult } from '../models/types';

// ── Keyword lists ─────────────────────────────────────────────────────────────

const TECHNICAL_KEYWORDS: string[] = [
  'JavaScript', 'TypeScript', 'Python', 'Java', 'React', 'Node.js', 'SQL',
  'AWS', 'Docker', 'Git', 'REST API', 'GraphQL', 'MongoDB', 'PostgreSQL',
  'Kubernetes', 'CI/CD', 'Agile', 'Machine Learning', 'HTML', 'CSS', 'Vue',
  'Angular', 'Linux', 'Azure', 'GCP', 'Microservices', 'Redux', 'Express',
  'Django', 'Spring',
];

const SOFT_SKILL_KEYWORDS: string[] = [
  'leadership', 'communication', 'collaboration', 'problem-solving', 'teamwork',
  'analytical', 'innovative', 'adaptable', 'detail-oriented', 'self-motivated',
  'creative', 'strategic', 'organized', 'mentoring', 'cross-functional',
];

const ACTION_VERBS: string[] = [
  'developed', 'implemented', 'designed', 'built', 'created', 'managed', 'led',
  'optimized', 'improved', 'increased', 'reduced', 'architected', 'deployed',
  'automated', 'collaborated', 'delivered', 'launched', 'spearheaded',
  'streamlined', 'coordinated',
];

// ── Helpers ───────────────────────────────────────────────────────────────────

function matchKeywords(text: string, keywords: string[]): KeywordAnalysis {
  const lower = text.toLowerCase();
  const wordCount = text.split(/\s+/).filter(Boolean).length;

  const found: string[] = [];
  const missing: string[] = [];

  for (const kw of keywords) {
    if (lower.includes(kw.toLowerCase())) {
      found.push(kw);
    } else {
      missing.push(kw);
    }
  }

  const density = wordCount > 0 ? (found.length / wordCount) * 100 : 0;
  return { found, missing, density: parseFloat(density.toFixed(2)) };
}

function detectSections(text: string): SectionScore[] {
  const lower = text.toLowerCase();

  const hasContact =
    /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/.test(text) ||
    /(\+?\d[\d\s\-().]{7,}\d)/.test(text) ||
    lower.includes('linkedin');

  const hasContactSection = hasContact;
  const hasSummary = /summary|objective|profile|about/.test(lower);
  const hasExperience = /experience|work history|employment/.test(lower);
  const hasEducation =
    /education|degree|university|college|bachelor|master|phd/.test(lower);
  const hasSkills = /skills|technologies|competencies|proficiencies/.test(lower);
  const hasProjects = /projects|portfolio/.test(lower);
  const hasCertifications =
    /certification|certificate|certified|license/.test(lower);

  const sections: SectionScore[] = [
    {
      name: 'Contact Information',
      score: hasContactSection ? 4 : 0,
      maxScore: 4,
      feedback: hasContactSection
        ? ['Contact information is present.']
        : ['Add contact information (email, phone, or LinkedIn).'],
    },
    {
      name: 'Summary / Objective',
      score: hasSummary ? 4 : 0,
      maxScore: 4,
      feedback: hasSummary
        ? ['Professional summary or objective found.']
        : ['Add a professional summary or objective statement.'],
    },
    {
      name: 'Experience',
      score: hasExperience ? 8 : 0,
      maxScore: 8,
      feedback: hasExperience
        ? ['Work experience section detected.']
        : ['Add a work experience section.'],
    },
    {
      name: 'Education',
      score: hasEducation ? 6 : 0,
      maxScore: 6,
      feedback: hasEducation
        ? ['Education section detected.']
        : ['Add an education section with your degree(s).'],
    },
    {
      name: 'Skills',
      score: hasSkills ? 6 : 0,
      maxScore: 6,
      feedback: hasSkills
        ? ['Skills section detected.']
        : ['Add a dedicated skills section.'],
    },
    {
      name: 'Projects',
      score: hasProjects ? 0 : 0,
      maxScore: 0,
      feedback: hasProjects
        ? ['Projects / portfolio section found.']
        : ['Consider adding a projects or portfolio section.'],
    },
    {
      name: 'Certifications',
      score: hasCertifications ? 0 : 0,
      maxScore: 0,
      feedback: hasCertifications
        ? ['Certifications section found.']
        : ['Consider listing relevant certifications.'],
    },
  ];

  return sections;
}

function scoreContentQuality(text: string): { score: number; details: string[] } {
  let score = 0;
  const details: string[] = [];

  // Length check
  const wordCount = text.split(/\s+/).filter(Boolean).length;
  if (wordCount >= 200) {
    score += 5;
    details.push(`Good length: ${wordCount} words.`);
  } else if (wordCount >= 100) {
    score += 3;
    details.push(`Moderate length: ${wordCount} words. Aim for 200+ words.`);
  } else {
    details.push(`Resume is too short (${wordCount} words). Aim for at least 200 words.`);
  }

  // Quantified achievements
  const quantMatches = text.match(
    /\d+%|\$\d+|\d+\+|\d+ (users|clients|team|projects|years)/gi,
  );
  const quantCount = quantMatches ? quantMatches.length : 0;
  const quantScore = Math.min(8, quantCount * 2);
  score += quantScore;
  if (quantCount > 0) {
    details.push(`Found ${quantCount} quantified achievement(s).`);
  } else {
    details.push('No quantified achievements found. Add metrics (e.g., "increased revenue by 20%").');
  }

  // No personal pronouns
  const pronounRegex = /\b(I|me|my)\b/g;
  const pronounMatches = text.match(pronounRegex);
  if (!pronounMatches || pronounMatches.length === 0) {
    score += 4;
    details.push('No personal pronouns detected — good for ATS.');
  } else {
    details.push(`Remove personal pronouns (I, me, my) found ${pronounMatches.length} time(s).`);
  }

  // Has email
  if (/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/.test(text)) {
    score += 3;
    details.push('Email address present.');
  } else {
    details.push('No email address detected.');
  }

  // Has phone
  if (/(\+?\d[\d\s\-().]{7,}\d)/.test(text)) {
    score += 2;
    details.push('Phone number present.');
  } else {
    details.push('No phone number detected.');
  }

  return { score, details };
}

function getGrade(score: number): string {
  if (score >= 90) return 'A+';
  if (score >= 80) return 'A';
  if (score >= 70) return 'B';
  if (score >= 60) return 'C';
  if (score >= 50) return 'D';
  return 'F';
}

// ── Main export ───────────────────────────────────────────────────────────────

export function scoreResume(
  text: string,
): Omit<AnalysisResult, 'id' | 'timestamp' | 'filename'> {
  // Section scoring (28 pts max from graded sections)
  const sections = detectSections(text);
  const sectionScore = sections.reduce((sum, s) => sum + s.score, 0);

  // Keyword analysis
  const technical = matchKeywords(text, TECHNICAL_KEYWORDS);
  const softSkills = matchKeywords(text, SOFT_SKILL_KEYWORDS);
  const actionVerbs = matchKeywords(text, ACTION_VERBS);

  // Keyword scores
  const techScore = Math.min(25, technical.found.length * 2.5);
  const softScore = Math.min(10, softSkills.found.length * 1.5);
  const verbScore = Math.min(15, actionVerbs.found.length * 1.5);

  // Content quality (22 pts max)
  const { score: contentScore } = scoreContentQuality(text);

  const overallScore = Math.round(
    Math.min(100, sectionScore + techScore + softScore + verbScore + contentScore),
  );

  return {
    overallScore,
    grade: getGrade(overallScore),
    sections,
    keywords: {
      technical,
      softSkills,
      actionVerbs,
    },
    feedback: { critical: [], improvements: [], strengths: [] }, // filled by feedbackService
    rawTextLength: text.length,
  };
}
