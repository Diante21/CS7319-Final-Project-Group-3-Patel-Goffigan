// Pipeline SSE event names — single source of truth.
// Both usePipeline.jsx and mockPipeline.jsx import from here.
// Renaming an event = one file change.
export const PIPELINE_EVENTS = {
  INTAKE:      'intake_complete',
  KEYWORD:     'keyword_filter_complete',
  SCORING:     'scoring_filter_complete',
  FEEDBACK:    'feedback_filter_complete',
  PERSIST:     'persist_complete',
  PERSIST_ACK: 'persist_ack',
}

export const PIPELINE_STAGES = ['intake', 'keyword', 'scoring', 'feedback', 'persist']

export const STAGE_LABELS = {
  intake:   'Intake',
  keyword:  'Keyword Filter',
  scoring:  'Scoring Filter',
  feedback: 'Feedback Filter',
  persist:  'Persistence',
}

export const TARGET_ROLES = [
  'Software Engineering',
  'Data Science',
  'Product Management',
  'Marketing',
  'Finance',
  'UX Design',
  'DevOps / Platform',
]

export const PERSIST_STATUS = {
  IDLE:      'idle',
  PENDING:   'pending',
  CONFIRMED: 'confirmed',
  FAILED:    'failed',
}

export const GRADES = {
  EXCELLENT:  'Excellent',
  GOOD:       'Good',
  FAIR:       'Fair',
  NEEDS_WORK: 'Needs Work',
}

// Dev flags — flip SIMULATE_PERSIST_FAILURE to true to test SavedBadge silent revert path
export const MOCK_CONFIG = {
  SIMULATE_PERSIST_FAILURE: false,
}
