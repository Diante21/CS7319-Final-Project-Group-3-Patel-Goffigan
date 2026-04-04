export default function KeywordTags({ present = [], missing = [] }) {
  return (
    <div className="keyword-section">
      <div>
        <div className="keyword-group__label">
          <span style={{ color: 'var(--color-success)' }}>✓</span>
          Present ({present.length})
        </div>
        <div className="keyword-tags" role="list" aria-label="Present keywords">
          {present.map((kw) => (
            <span key={kw} className="keyword-tag keyword-tag--present" role="listitem">{kw}</span>
          ))}
        </div>
      </div>
      <div>
        <div className="keyword-group__label">
          <span style={{ color: 'var(--color-error)' }}>✗</span>
          Missing ({missing.length})
        </div>
        <div className="keyword-tags" role="list" aria-label="Missing keywords">
          {missing.map((kw) => (
            <span key={kw} className="keyword-tag keyword-tag--missing" role="listitem">{kw}</span>
          ))}
        </div>
      </div>
    </div>
  )
}
