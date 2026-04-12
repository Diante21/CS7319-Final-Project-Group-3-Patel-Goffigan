/**
 * Pipe Data Contracts
 * -------------------
 * These are the formal interfaces passed between filters in the pipeline.
 * Swapping a filter only requires that its input/output types remain the same.
 * These definitions also power the interactive tooltips on the Architecture Explainer page.
 */

/**
 * @typedef {Object} RawResume
 * @property {string} text        - Extracted plain text (from file upload or textarea)
 * @property {string} targetRole  - Selected from the role dropdown
 */

/**
 * @typedef {Object} KeywordResult
 * @property {string[]} present    - Keywords found in the resume
 * @property {string[]} missing    - Keywords missing for the target role
 * @property {number}  matchScore  - 0–100 keyword match percentage
 */

/**
 * @typedef {Object} ScoredResume
 * @property {string[]} present
 * @property {string[]} missing
 * @property {number}   matchScore
 * @property {number}   score       - Overall 0–100 score
 * @property {string}   grade       - 'Excellent' | 'Good' | 'Fair' | 'Needs Work'
 */

/**
 * @typedef {Object} Suggestion
 * @property {'Formatting'|'Impact'|'Keywords'} category
 * @property {string} text
 */

/**
 * @typedef {Object} FeedbackResult
 * @property {string[]}    present
 * @property {string[]}    missing
 * @property {number}      matchScore
 * @property {number}      score
 * @property {string}      grade
 * @property {Suggestion[]} suggestions
 */

// Pipe contract strings shown in the Architecture Explainer interactive arrows
export const PIPE_CONTRACTS = {
  'intake→keyword': `interface RawResume {
  text: string        // extracted plain text
  targetRole: string  // job role selection
}`,
  'keyword→scoring': `interface KeywordResult {
  present: string[]   // matched keywords
  missing: string[]   // missing keywords
  matchScore: number  // 0–100 keyword match
}`,
  'scoring→feedback': `interface ScoredResume extends KeywordResult {
  score: number       // overall 0–100 score
  grade: 'Excellent' | 'Good' | 'Fair' | 'Needs Work'
}`,
  'feedback→persist': `interface FeedbackResult extends ScoredResume {
  suggestions: {
    category: 'Formatting' | 'Impact' | 'Keywords'
    text: string
  }[]
}`,
}
