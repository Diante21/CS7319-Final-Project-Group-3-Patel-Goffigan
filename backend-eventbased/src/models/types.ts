export interface ResumeInput {
  text: string;
  filename?: string;
}

export interface KeywordAnalysis {
  found: string[];
  missing: string[];
  density: number;
}

export interface SectionScore {
  name: string;
  score: number;
  maxScore: number;
  feedback: string[];
}

export interface AnalysisResult {
  id: string;
  timestamp: string;
  filename?: string;
  overallScore: number;
  grade: string;
  sections: SectionScore[];
  keywords: {
    technical: KeywordAnalysis;
    softSkills: KeywordAnalysis;
    actionVerbs: KeywordAnalysis;
  };
  feedback: {
    critical: string[];
    improvements: string[];
    strengths: string[];
  };
  rawTextLength: number;
}

// ── Event payload types ───────────────────────────────────────────────────────

export interface SubmittedPayload {
  correlationId: string;
  input: ResumeInput;
}

export interface ParsedPayload {
  correlationId: string;
  text: string;
  filename?: string;
}

export interface AnalyzedPayload {
  correlationId: string;
  sections: SectionScore[];
  keywords: AnalysisResult['keywords'];
  rawTextLength: number;
}

export interface ScoredPayload {
  correlationId: string;
  overallScore: number;
  grade: string;
  sections: SectionScore[];
  keywords: AnalysisResult['keywords'];
  rawTextLength: number;
}

export interface FeedbackPayload {
  correlationId: string;
  result: Omit<AnalysisResult, 'id' | 'timestamp' | 'filename'> & { filename?: string };
}

export interface StoredPayload {
  correlationId: string;
  result: AnalysisResult;
}

export interface ErrorPayload {
  correlationId: string;
  message: string;
}
