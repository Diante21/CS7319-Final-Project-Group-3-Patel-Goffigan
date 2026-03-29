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
