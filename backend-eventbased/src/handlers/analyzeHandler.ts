import EventBus, { EVENTS } from '../events/EventBus';
import {
  ParsedPayload,
  AnalyzedPayload,
  ErrorPayload,
  SectionScore,
  KeywordAnalysis,
} from '../models/types';

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

  const hasSummary = /summary|objective|profile|about/.test(lower);
  const hasExperience = /experience|work history|employment/.test(lower);
  const hasEducation =
    /education|degree|university|college|bachelor|master|phd/.test(lower);
  const hasSkills = /skills|technologies|competencies|proficiencies/.test(lower);
  const hasProjects = /projects|portfolio/.test(lower);
  const hasCertifications =
    /certification|certificate|certified|license/.test(lower);

  return [
    {
      name: 'Contact Information',
      score: hasContact ? 4 : 0,
      maxScore: 4,
      feedback: hasContact
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
      score: 0,
      maxScore: 0,
      feedback: hasProjects
        ? ['Projects / portfolio section found.']
        : ['Consider adding a projects or portfolio section.'],
    },
    {
      name: 'Certifications',
      score: 0,
      maxScore: 0,
      feedback: hasCertifications
        ? ['Certifications section found.']
        : ['Consider listing relevant certifications.'],
    },
  ];
}

// ── Handler registration ──────────────────────────────────────────────────────

export function registerAnalyzeHandler(): void {
  EventBus.on(EVENTS.RESUME_PARSED, (payload: ParsedPayload) => {
    try {
      const { correlationId, text, filename } = payload;

      const sections = detectSections(text);
      const technical = matchKeywords(text, TECHNICAL_KEYWORDS);
      const softSkills = matchKeywords(text, SOFT_SKILL_KEYWORDS);
      const actionVerbs = matchKeywords(text, ACTION_VERBS);

      // _text is an internal field passed through the event chain so that
      // scoreHandler can compute content-quality metrics without shared state.
      const analyzed = {
        correlationId,
        sections,
        keywords: { technical, softSkills, actionVerbs },
        rawTextLength: text.length,
        _text: text,
        ...(filename ? { filename } : {}),
      } as AnalyzedPayload & { _text: string; filename?: string };

      EventBus.emit(EVENTS.RESUME_ANALYZED, analyzed);
    } catch (err) {
      const errPayload: ErrorPayload = {
        correlationId: payload.correlationId,
        message: err instanceof Error ? err.message : 'Analyze error',
      };
      EventBus.emit(EVENTS.RESUME_ERROR, errPayload);
      EventBus.emit(`${EVENTS.RESUME_ERROR}:${payload.correlationId}`, errPayload);
    }
  });
}
