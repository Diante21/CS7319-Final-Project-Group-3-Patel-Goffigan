import { PIPELINE_EVENTS } from './constants.jsx'

const MOCK_RESULT = {
  present: ['React', 'JavaScript', 'Node.js', 'Git', 'REST APIs', 'TypeScript', 'CSS', 'HTML', 'Agile', 'Jest'],
  missing: ['Docker', 'Kubernetes', 'CI/CD', 'AWS', 'GraphQL', 'PostgreSQL'],
  matchScore: 62,
  score: 78,
  grade: 'Good',
  suggestions: [
    { category: 'Impact', text: "Quantify achievements — replace 'improved performance' with 'reduced load time by 40%'" },
    { category: 'Keywords', text: 'Add cloud platform experience (AWS, GCP, or Azure) — present in 84% of job postings' },
    { category: 'Formatting', text: "Use consistent date formatting — mix of 'Jan 2023' and '2023-01' detected" },
    { category: 'Impact', text: 'Lead with strongest projects — open-source contribution should appear before coursework' },
    { category: 'Keywords', text: 'Include containerization tools (Docker, Kubernetes) — found in 71% of senior roles' },
  ],
}

/**
 * Simulates the Pipe & Filter SSE timeline.
 * @param {(event: object) => void} onEvent
 * @param {boolean} successAck - flip to false to test SavedBadge revert path
 * @returns {() => void} cleanup function
 */
export function runMockPipeline(onEvent, successAck = true) {
  const now = Date.now()
  const timers = []

  const fire = (delay, payload) => {
    timers.push(setTimeout(() => onEvent(payload), delay))
  }

  fire(200,  { type: PIPELINE_EVENTS.INTAKE,    durationMs: 185,  completedAt: now + 200 })
  fire(600,  { type: PIPELINE_EVENTS.KEYWORD,   durationMs: 390,  completedAt: now + 600,
    data: { present: MOCK_RESULT.present, missing: MOCK_RESULT.missing, matchScore: MOCK_RESULT.matchScore } })
  fire(900,  { type: PIPELINE_EVENTS.SCORING,   durationMs: 295,  completedAt: now + 900,
    data: { score: MOCK_RESULT.score, grade: MOCK_RESULT.grade } })
  fire(1200, { type: PIPELINE_EVENTS.FEEDBACK,  durationMs: 285,  completedAt: now + 1200,
    data: { suggestions: MOCK_RESULT.suggestions } })
  fire(1500, { type: PIPELINE_EVENTS.PERSIST,   durationMs: 275,  completedAt: now + 1500 })
  // persist_ack: flip successAck to false to test silent-revert path in SavedBadge
  fire(1800, { type: PIPELINE_EVENTS.PERSIST_ACK, success: successAck, durationMs: 290, completedAt: now + 1800 })

  return () => timers.forEach(clearTimeout)
}

/**
 * Simulates the monolithic mode — one atomic response after a single delay.
 * @param {(result: object) => void} onComplete
 * @returns {() => void} cleanup function
 */
export function runMockMonolith(onComplete) {
  const now = Date.now()
  const timer = setTimeout(() => {
    onComplete({ ...MOCK_RESULT, completedAt: now + 1800, durationMs: 1800 })
  }, 1800)
  return () => clearTimeout(timer)
}
