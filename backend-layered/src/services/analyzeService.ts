import { v4 as uuidv4 } from 'uuid';
import { ResumeInput, AnalysisResult } from '../models/types';
import { scoreResume } from './scoringService';
import { generateFeedback } from './feedbackService';
import { saveResult } from '../dataAccess/resultsRepository';

export function analyzeResume(input: ResumeInput): AnalysisResult {
  const scored = scoreResume(input.text);

  // Replace the placeholder feedback with real feedback
  const feedback = generateFeedback(
    scored.sections,
    scored.keywords,
    scored.overallScore,
  );

  const result: AnalysisResult = {
    ...scored,
    id: uuidv4(),
    timestamp: new Date().toISOString(),
    ...(input.filename ? { filename: input.filename } : {}),
    feedback,
  };

  saveResult(result);
  return result;
}
