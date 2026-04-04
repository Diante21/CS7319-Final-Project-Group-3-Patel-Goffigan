import { SectionScore, KeywordAnalysis } from '../models/types';

interface FeedbackResult {
  critical: string[];
  improvements: string[];
  strengths: string[];
}

export function generateFeedback(
  sections: SectionScore[],
  keywords: {
    technical: KeywordAnalysis;
    softSkills: KeywordAnalysis;
    actionVerbs: KeywordAnalysis;
  },
  contentScore: number,
): FeedbackResult {
  const critical: string[] = [];
  const improvements: string[] = [];
  const strengths: string[] = [];

  // ── Critical issues ─────────────────────────────────────────────────────────

  const sectionMap: Record<string, SectionScore> = {};
  for (const s of sections) {
    sectionMap[s.name] = s;
  }

  if ((sectionMap['Experience']?.score ?? 0) === 0) {
    critical.push('Missing work experience section — this is essential for most roles.');
  }
  if ((sectionMap['Education']?.score ?? 0) === 0) {
    critical.push('Missing education section — include your degree(s) and institution(s).');
  }
  if ((sectionMap['Skills']?.score ?? 0) === 0) {
    critical.push('Missing skills section — list your technical and relevant skills.');
  }
  if (keywords.technical.found.length < 3) {
    critical.push(
      `Very few technical keywords detected (${keywords.technical.found.length}). Include relevant technologies for the role.`,
    );
  }
  if (keywords.actionVerbs.found.length < 3) {
    critical.push(
      `Too few action verbs (${keywords.actionVerbs.found.length}). Start bullet points with strong action verbs like "developed", "led", or "optimized".`,
    );
  }

  // ── Improvements ────────────────────────────────────────────────────────────

  if (
    keywords.technical.found.length >= 3 &&
    keywords.technical.found.length < 8
  ) {
    improvements.push(
      `Expand technical keywords: currently ${keywords.technical.found.length} found. Aim for 8+ relevant technologies.`,
    );
  }
  if (keywords.softSkills.found.length < 3) {
    improvements.push(
      'Include soft-skill keywords (e.g., leadership, collaboration, analytical) to strengthen your profile.',
    );
  }
  if (keywords.actionVerbs.found.length >= 3 && keywords.actionVerbs.found.length < 7) {
    improvements.push(
      `Use more action verbs: ${keywords.actionVerbs.found.length} found. Aim for 7+ to demonstrate impact.`,
    );
  }
  if ((sectionMap['Contact Information']?.score ?? 0) === 0) {
    improvements.push('Add your contact details (email, phone, LinkedIn).');
  }
  if ((sectionMap['Summary / Objective']?.score ?? 0) === 0) {
    improvements.push('Add a brief professional summary (3–5 sentences) at the top of your resume.');
  }
  if (contentScore < 10) {
    improvements.push(
      'Improve content quality: add quantified achievements (e.g., "reduced costs by 15%") and ensure your resume is at least 200 words.',
    );
  }

  // ── Strengths ────────────────────────────────────────────────────────────────

  if (keywords.technical.found.length >= 8) {
    strengths.push(
      `Strong technical keyword coverage: ${keywords.technical.found.length} technologies listed (${keywords.technical.found.slice(0, 5).join(', ')}${keywords.technical.found.length > 5 ? ', …' : ''}).`,
    );
  }
  if (keywords.actionVerbs.found.length >= 7) {
    strengths.push(
      `Excellent use of action verbs (${keywords.actionVerbs.found.length} found) — communicates impact effectively.`,
    );
  }
  if ((sectionMap['Experience']?.score ?? 0) > 0) {
    strengths.push('Work experience section is present.');
  }
  if ((sectionMap['Education']?.score ?? 0) > 0) {
    strengths.push('Education section is present.');
  }
  if ((sectionMap['Contact Information']?.score ?? 0) > 0) {
    strengths.push('Contact information is included.');
  }
  if (keywords.softSkills.found.length >= 3) {
    strengths.push(
      `Good soft-skill coverage: ${keywords.softSkills.found.length} traits identified.`,
    );
  }

  return { critical, improvements, strengths };
}
