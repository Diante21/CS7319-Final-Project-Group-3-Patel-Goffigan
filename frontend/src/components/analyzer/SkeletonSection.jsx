export default function SkeletonSection({ type = 'lines' }) {
  if (type === 'ring') {
    return (
      <div className="score-section">
        <div className="skeleton skeleton-ring" aria-hidden="true" />
        <div className="skeleton-section" style={{ flex: 1 }}>
          <div className="skeleton skeleton-line skeleton-line--med" />
          <div className="skeleton skeleton-line skeleton-line--short" />
        </div>
      </div>
    )
  }

  if (type === 'tags') {
    return (
      <div className="skeleton-section">
        <div className="skeleton skeleton-line skeleton-line--short" style={{ width: 80 }} />
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {[72, 56, 88, 64, 80, 56].map((w, i) => (
            <div key={i} className="skeleton skeleton-tag" style={{ width: w }} aria-hidden="true" />
          ))}
        </div>
        <div className="skeleton skeleton-line skeleton-line--short" style={{ width: 80, marginTop: 4 }} />
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {[64, 88, 72].map((w, i) => (
            <div key={i} className="skeleton skeleton-tag" style={{ width: w }} aria-hidden="true" />
          ))}
        </div>
      </div>
    )
  }

  // default: lines (for feedback)
  return (
    <div className="skeleton-section" aria-hidden="true">
      {[1, 2, 3].map((i) => (
        <div key={i} className="skeleton skeleton-card" />
      ))}
    </div>
  )
}
