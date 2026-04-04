import EventBus, { EVENTS } from '../events/EventBus';
import { AnalyzedPayload, ScoredPayload, ErrorPayload } from '../models/types';

// ── Helpers ───────────────────────────────────────────────────────────────────

function computeContentScore(text: string): number {
  let score = 0;

  const wordCount = text.split(/\s+/).filter(Boolean).length;
  if (wordCount >= 200) {
    score += 5;
  } else if (wordCount >= 100) {
    score += 3;
  }

  const quantMatches = text.match(
    /\d+%|\$\d+|\d+\+|\d+ (users|clients|team|projects|years)/gi,
  );
  const quantCount = quantMatches ? quantMatches.length : 0;
  score += Math.min(8, quantCount * 2);

  const pronounMatches = text.match(/\b(I|me|my)\b/g);
  if (!pronounMatches || pronounMatches.length === 0) {
    score += 4;
  }

  if (/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/.test(text)) {
    score += 3;
  }

  if (/(\+?\d[\d\s\-().]{7,}\d)/.test(text)) {
    score += 2;
  }

  return score;
}

function getGrade(score: number): string {
  if (score >= 90) return 'A+';
  if (score >= 80) return 'A';
  if (score >= 70) return 'B';
  if (score >= 60) return 'C';
  if (score >= 50) return 'D';
  return 'F';
}

// ── Extended payload (internal) ───────────────────────────────────────────────
// analyzeHandler enriches the payload with the original text so scoreHandler
// can compute content-quality metrics without shared mutable state.

interface AnalyzedPayloadInternal extends AnalyzedPayload {
  _text: string;
  filename?: string;
}

// ── Handler registration ──────────────────────────────────────────────────────

export function registerScoreHandler(): void {
  EventBus.on(EVENTS.RESUME_ANALYZED, (payload: AnalyzedPayloadInternal) => {
    try {
      const { correlationId, sections, keywords, rawTextLength, filename } = payload;
      const text = payload._text ?? '';

      const sectionScore = sections.reduce((sum, s) => sum + s.score, 0);
      const techScore = Math.min(25, keywords.technical.found.length * 2.5);
      const softScore = Math.min(10, keywords.softSkills.found.length * 1.5);
      const verbScore = Math.min(15, keywords.actionVerbs.found.length * 1.5);
      const contentScore = computeContentScore(text);

      const overallScore = Math.round(
        Math.min(100, sectionScore + techScore + softScore + verbScore + contentScore),
      );

      const scored: ScoredPayload & { _text?: string; filename?: string } = {
        correlationId,
        overallScore,
        grade: getGrade(overallScore),
        sections,
        keywords,
        rawTextLength,
        _text: text,
        ...(filename ? { filename } : {}),
      };

      EventBus.emit(EVENTS.RESUME_SCORED, scored);
    } catch (err) {
      const errPayload: ErrorPayload = {
        correlationId: payload.correlationId,
        message: err instanceof Error ? err.message : 'Score error',
      };
      EventBus.emit(EVENTS.RESUME_ERROR, errPayload);
      EventBus.emit(`${EVENTS.RESUME_ERROR}:${payload.correlationId}`, errPayload);
    }
  });
}


