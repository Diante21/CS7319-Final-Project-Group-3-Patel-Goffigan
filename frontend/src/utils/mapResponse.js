export function mapResponse(backendResult) {
  const { overallScore, grade, keywords, feedback } = backendResult

  // present/missing keywords from technical analysis
  const present = keywords?.technical?.found ?? []
  const missing = keywords?.technical?.missing ?? []

  // matchScore as percentage of keyword list matched
  const total = (keywords?.technical?.found?.length ?? 0) + (keywords?.technical?.missing?.length ?? 0)
  const matchScore = total > 0
    ? Math.round((keywords.technical.found.length / total) * 100)
    : 0

  // map feedback arrays to { category, text } shape FeedbackList expects
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
