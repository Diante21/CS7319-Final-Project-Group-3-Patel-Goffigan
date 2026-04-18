export function mapResponse(backendResult) {
  const { overallScore, grade, keywords, feedback } = backendResult

  const present = keywords?.technical?.found ?? []
  const missing = keywords?.technical?.missing ?? []

  const total = (keywords?.technical?.found?.length ?? 0) + (keywords?.technical?.missing?.length ?? 0)
  const matchScore = total > 0
    ? Math.round((keywords.technical.found.length / total) * 100)
    : 0

  const suggestions = [
    ...(feedback?.critical ?? []).map((text) => ({ category: 'Keywords', text })),
    ...(feedback?.improvements ?? []).map((text) => ({ category: 'Impact', text })),
    ...(feedback?.strengths ?? []).map((text) => ({ category: 'Formatting', text })),
  ]

  return {
    score: overallScore,
    grade,
    present,
    missing,
    matchScore,
    suggestions,
  }
}

function getGrade(score) {
  if (score >= 90) return 'A+'
  if (score >= 80) return 'A'
  if (score >= 70) return 'B'
  if (score >= 60) return 'C'
  if (score >= 50) return 'D'
  return 'F'
}

export function mapSpringResponse(raw) {
  const score = raw?.score ?? 0

  const present = raw?.foundKeywords
    ? raw.foundKeywords.split(',').map((k) => k.trim()).filter(Boolean)
    : []

  const missing = raw?.missingKeywords
    ? raw.missingKeywords.split(',').map((k) => k.trim()).filter(Boolean)
    : []

  const total = present.length + missing.length
  const matchScore = total > 0 ? Math.round((present.length / total) * 100) : 0

  const suggestions = raw?.feedback
    ? raw.feedback
        .split('|')
        .map((point) => point.trim())
        .filter(Boolean)
        .map((text) => ({ category: 'Impact', text }))
    : []

  // Extract real filter timings from backend
  const filterTimings = raw?.filterTimings ?? null

  return {
    score,
    grade: getGrade(score),
    present,
    missing,
    matchScore,
    suggestions,
    filterTimings,
  }
}
